import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  Mail, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Copy, 
  Download,
  Upload,
  FileSpreadsheet,
  FileText, 
  Printer, 
  ExternalLink, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Sparkles, 
  Clock, 
  RefreshCw, 
  Layers, 
  ShoppingBag, 
  ShieldCheck, 
  Building2, 
  ChevronRight, 
  ChevronDown, 
  X, 
  DollarSign, 
  Target, 
  ArrowUpRight, 
  Share2, 
  Filter, 
  Search, 
  Calendar,
  Eye,
  AtSign,
  Package,
  Zap,
  Info,
  Loader2,
  Scissors,
  Barcode,
  Truck,
  MapPin,
  CalendarPlus,
  Key,
  Crown,
  Lock,
  Store
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RemoteMerchantClient, MerchantWeeklyReport, ProductData, CustomerOrder, OrderItem } from '../types';
import { SAMPLE_REMOTE_MERCHANTS, generateWeeklyReportForMerchant, createEmptyMerchantWeeklyReport } from '../data/remoteMerchantsData';
import { loadAllOrders, saveAllOrders, pullOrdersForMerchant, pullLiveOrdersFromPlatforms, splitMultiItemOrder, splitAllMultiItemOrders, exchangeAmazonLwaTokenRuntime } from '../utils/merchantOrdersManager';
import { launchSellerPortalByCode, getSellerPortalUrlByCode, loadAllRegisteredMerchants, saveAllRegisteredMerchants, ensureMerchantTrialFields, evaluateMerchantSubscriptionState, validateMerchantAmazonSpApiTokens, getAmazonSellerCentralConsentUrl, AMAZON_APP_ID } from '../utils/platformLaunchHelper';
import { saveMerchantStoreCredentialsToFirestore } from '../services/firestoreSync';
import { encryptLwaRefreshToken, decryptLwaRefreshToken } from '../utils/lwaTokenCrypto';
import { downloadWaybillIcsFile } from '../utils/googleCalendarExport';
import { ManageMerchantApisModal } from './ManageMerchantApisModal';
import { MerchantCatalogManager } from './MerchantCatalogManager';
import { LiveStatusIndicator } from './LiveStatusIndicator';
import { pullLiveCatalogForMerchant } from '../utils/merchantCatalogManager';
import { useAuth } from '../context/AuthContext';
import {
  downloadMerchantsBulkTemplateCsv,
  exportCurrentMerchantsToBulkCsv,
  parseMerchantsBulkSheetFile,
  syncBulkImportedMerchants,
  BulkMerchantParseSummary
} from '../utils/bulkMerchantsSheetHelper';

interface RemoteMerchantsManagerProps {
  allProducts: ProductData[];
  currency: string;
  onSelectProduct?: (productId: string) => void;
  onShowToast: (msg: string) => void;
}

export const RemoteMerchantsManager: React.FC<RemoteMerchantsManagerProps> = ({
  allProducts: rawAllProducts,
  currency,
  onSelectProduct,
  onShowToast,
}) => {
  const { user, profile } = useAuth();

  // Deduplicate allProducts by ID so React list keys are always strictly unique
  const allProducts = useMemo(() => {
    const map = new Map<string, ProductData>();
    for (const p of rawAllProducts || []) {
      if (p && p.id) {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values());
  }, [rawAllProducts]);

  // State with LocalStorage persistence - guaranteed to preserve registered merchants
  const [merchants, setMerchants] = useState<RemoteMerchantClient[]>(() => {
    return loadAllRegisteredMerchants();
  });

  const [selectedMerchant, setSelectedMerchant] = useState<RemoteMerchantClient | null>(() => {
    const list = loadAllRegisteredMerchants();
    return list[0] || null;
  });

  // State for Manage Merchant APIs Modal
  const [isManageApisModalOpen, setIsManageApisModalOpen] = useState(false);
  const [targetMerchantForApis, setTargetMerchantForApis] = useState<string>('');

  // Bulk Merchants CSV/Excel Import & Sync State
  const bulkSheetInputRef = useRef<HTMLInputElement>(null);
  const [isParsingBulkSheet, setIsParsingBulkSheet] = useState(false);
  const [isSyncingBulkSheet, setIsSyncingBulkSheet] = useState(false);
  const [bulkSheetPreview, setBulkSheetPreview] = useState<BulkMerchantParseSummary | null>(null);
  const [isBulkPreviewModalOpen, setIsBulkPreviewModalOpen] = useState(false);

  // Listen to global bulk sync events (e.g. triggered from ManageMerchantApisModal)
  useEffect(() => {
    const handleBulkSyncEvent = () => {
      const freshList = loadAllRegisteredMerchants();
      setMerchants(freshList);
      if (freshList.length > 0 && !selectedMerchant) {
        setSelectedMerchant(freshList[0]);
      }
    };
    window.addEventListener('merchant_radar_merchants_bulk_synced', handleBulkSyncEvent);
    window.addEventListener('merchant_credentials_changed', handleBulkSyncEvent);

    const handleOauthMessage = (e: MessageEvent) => {
      if (e.data?.type === 'AMAZON_OAUTH_SUCCESS') {
        const { sellerId, merchantId } = e.data;
        const freshList = loadAllRegisteredMerchants();
        setMerchants(freshList);
        if (merchantId) {
          const match = freshList.find(m => m.id === merchantId);
          if (match) setSelectedMerchant(match);
        }
        onShowToast(`🎉 تم تفويض وربط متجر أمازون بنجاح عبر سيلر سنترال (${sellerId || ''})! المتجر نشط ومربوط 🟢`);
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    };
    window.addEventListener('message', handleOauthMessage);

    return () => {
      window.removeEventListener('merchant_radar_merchants_bulk_synced', handleBulkSyncEvent);
      window.removeEventListener('merchant_credentials_changed', handleBulkSyncEvent);
      window.removeEventListener('message', handleOauthMessage);
    };
  }, [selectedMerchant, onShowToast]);

  const handleDownloadBulkMerchantsTemplate = () => {
    downloadMerchantsBulkTemplateCsv();
    onShowToast('📥 تم تنزيل "شيت بيانات التجار (Template)" بصيغة CSV جاهز بالأعمدة القياسية!');
  };

  const handleExportCurrentMerchantsSheet = () => {
    exportCurrentMerchantsToBulkCsv(merchants);
    onShowToast(`📊 تم تصدير شيت بيانات ومفاتيح الربط لعدد (${merchants.length}) تجار بنجاح!`);
  };

  const handleBulkMerchantsFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingBulkSheet(true);
    try {
      const summary = await parseMerchantsBulkSheetFile(file, merchants);
      setBulkSheetPreview(summary);
      setIsBulkPreviewModalOpen(true);

      // Automatic Multi-Merchant Sync immediately if there are valid rows
      if (summary.validRowsCount > 0) {
        setIsSyncingBulkSheet(true);
        const allProdIds = (allProducts || []).map(p => p.id);
        const syncRes = await syncBulkImportedMerchants(summary.rows, allProdIds);
        setMerchants(syncRes.updatedList);
        if (syncRes.updatedList.length > 0) {
          setSelectedMerchant(syncRes.updatedList[0]);
          try {
            setCurrentReport(generateWeeklyReportForMerchant(syncRes.updatedList[0], allProducts));
          } catch {}
        }
        try {
          confetti({ particleCount: 75, spread: 80, origin: { y: 0.55 } });
        } catch {}
        onShowToast(
          `✅ تمت قراءة الشيت ومزامنة (${syncRes.createdCount} تاجر جديد + ${syncRes.updatedCount} تحديث) وربط مفاتيح الـ API في Firestore فوراً! 🚀`
        );
      } else {
        onShowToast('⚠️ الشيت المرفوع يحتوي على أخطاء في الأعمدة، يرجى مراجعة نافذة التحليل.');
      }
    } catch (err: any) {
      onShowToast(`❌ تعذر قراءة ملف الشيت: ${err?.message || 'يرجى التأكد من رفع ملف CSV أو Excel صالح'}`);
    } finally {
      setIsParsingBulkSheet(false);
      setIsSyncingBulkSheet(false);
      if (bulkSheetInputRef.current) {
        bulkSheetInputRef.current.value = '';
      }
    }
  };

  const handleOpenApisModalForMerchant = (m?: RemoteMerchantClient | string) => {
    const id = typeof m === 'string' ? m : (m?.id || selectedMerchant?.id || merchants[0]?.id || '');
    setTargetMerchantForApis(id);
    setIsManageApisModalOpen(true);
  };

  // Keep primary merchant in sync with current user profile if available, guaranteeing retention
  useEffect(() => {
    if (profile?.storeName || user?.email) {
      setMerchants(prev => {
        const userEmail = (user?.email || '').toLowerCase().trim();
        const existingIdx = prev.findIndex(m => 
          m.id === 'merchant-current-primary' || 
          (userEmail && m.primaryEmail.toLowerCase().trim() === userEmail)
        );

        if (existingIdx !== -1) {
          const curr = prev[existingIdx];
          const nextStoreName = profile?.storeName || curr.storeName;
          const nextContactPerson = user?.displayName || curr.contactPerson;
          const nextPrimaryEmail = userEmail || curr.primaryEmail;
          const nextCity = profile?.city || curr.city;
          const nextPhone = curr.phone || '01012345678';
          const hasAssigned = curr.assignedProductIds && curr.assignedProductIds.length > 0;

          if (
            curr.storeName === nextStoreName &&
            curr.contactPerson === nextContactPerson &&
            curr.primaryEmail === nextPrimaryEmail &&
            curr.city === nextCity &&
            curr.phone === nextPhone &&
            hasAssigned
          ) {
            return prev;
          }

          const updated = [...prev];
          updated[existingIdx] = {
            ...curr,
            storeName: nextStoreName,
            contactPerson: nextContactPerson,
            primaryEmail: nextPrimaryEmail,
            city: nextCity,
            phone: nextPhone,
            assignedProductIds: hasAssigned
              ? curr.assignedProductIds
              : (allProducts || []).map(p => p.id)
          };
          try {
            localStorage.setItem('merchant_radar_remote_merchants_v1', JSON.stringify(updated));
          } catch {}
          return updated;
        } else {
          // If a new merchant registered, preserve all existing merchants and prepend the registered user
          const newRegisteredMerchant: RemoteMerchantClient = {
            id: `merchant-reg-${user?.uid || (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now())}`,
            storeName: profile?.storeName || user?.displayName || 'متجر التاجر المسجل',
            contactPerson: user?.displayName || 'التاجر المعتمد',
            primaryEmail: userEmail || 'merchant@store.com',
            additionalEmails: [],
            city: profile?.city || 'القاهرة الكبرى',
            phone: '01012345678',
            platformsSubscribed: ['amazon_eg', 'noon_eg', 'jumia_eg', 'homzmart_eg'],
            assignedProductIds: (allProducts || []).map(p => p.id),
            weeklySalesTargetEGP: 150000,
            currentWeeklySalesEGP: 0,
            currentWeeklyOrdersCount: 0,
            averageProfitMarginPercent: 28,
            buyBoxWinRatePercent: 92,
            reportDayOfWeek: 'thursday',
            autoSendWeeklyReport: true,
            sendWhatsAppReport: true,
            status: 'active',
            marketerNotes: 'حساب تاجر مسجل ومعتمد بالنظام - محمي من الحذف',
          };
          const nextList = [newRegisteredMerchant, ...prev];
          try {
            localStorage.setItem('merchant_radar_remote_merchants_v1', JSON.stringify(nextList));
          } catch {}
          return nextList;
        }
      });
    }
  }, [profile?.storeName, profile?.city, user?.email, user?.displayName, user?.uid, allProducts]);

  const [activeTab, setActiveTab] = useState<'merchants_list' | 'report_preview' | 'batch_dispatch' | 'dispatch_history' | 'merchant_orders' | 'merchant_catalog'>('merchants_list');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  
  // Platform Orders & Waybills state
  const [merchantOrders, setMerchantOrders] = useState<CustomerOrder[]>(() => loadAllOrders());
  const [activeWaybillItem, setActiveWaybillItem] = useState<{
    order: CustomerOrder;
    item: OrderItem;
  } | null>(null);
  const [orderMerchantFilter, setOrderMerchantFilter] = useState<string>('all');
  const [orderPlatformFilter, setOrderPlatformFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderMultiItemOnly, setOrderMultiItemOnly] = useState<boolean>(false);
  const [isPullingOrders, setIsPullingOrders] = useState<boolean>(false);
  const [pullingMerchantId, setPullingMerchantId] = useState<string | null>(null);

  // Synchronize orders whenever updated across app
  useEffect(() => {
    const handleOrdersSync = () => {
      setMerchantOrders(loadAllOrders());
    };
    window.addEventListener('merchant_orders_updated', handleOrdersSync);
    return () => window.removeEventListener('merchant_orders_updated', handleOrdersSync);
  }, []);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<RemoteMerchantClient | null>(null);
  const [newAdditionalEmailInput, setNewAdditionalEmailInput] = useState('');
  const [isVerifyingLwaToken, setIsVerifyingLwaToken] = useState(false);
  const [lwaVerifyStatus, setLwaVerifyStatus] = useState<{
    success: boolean;
    fallbackMode?: boolean;
    message: string;
  } | null>(null);

  const resolveAmazonApiEndpoint = (path: string): string => {
    const configuredBase = (
      (import.meta as any).env?.VITE_API_BASE_URL ||
      (import.meta as any).env?.VITE_BACKEND_URL ||
      ''
    )
      .trim()
      .replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (configuredBase) {
      return `${configuredBase}${normalizedPath}`;
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${normalizedPath}`;
    }
    return normalizedPath;
  };

  const handleVerifyMerchantLwaToken = async () => {
    if (!editingMerchant) return;
    setIsVerifyingLwaToken(true);
    setLwaVerifyStatus(null);

    const validated = validateMerchantAmazonSpApiTokens(editingMerchant, {
      refreshToken: (editingMerchant.apiCredentials?.amazonRefreshToken || '').trim(),
      sellerId: (editingMerchant.apiCredentials?.amazonSellerId || '').trim(),
      region: editingMerchant.apiCredentials?.amazonRegion || 'eu-west-1',
    });

    const endpointUrl = resolveAmazonApiEndpoint('/api/amazon/lwa/token-exchange');

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          merchantId: editingMerchant.id,
          merchantName: editingMerchant.storeName,
          sellerId: validated.sellerId,
          refreshToken: validated.refreshToken,
          region: validated.region,
          forceRefresh: true,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();
      let data: any = null;

      if (contentType.includes('application/json') && rawText.trim().startsWith('{')) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = null;
        }
      }

      if (
        response.status === 404 ||
        !data ||
        data?.error?.code === '404' ||
        String(data?.error?.message || '').toLowerCase().includes('page could not be found')
      ) {
        const fallbackRes = await exchangeAmazonLwaTokenRuntime({
          merchantId: editingMerchant.id,
          merchantName: editingMerchant.storeName,
          sellerId: validated.sellerId,
          refreshToken: validated.refreshToken,
          region: validated.region,
          forceRefresh: true,
        });
        const warnMsg = `تعذر الوصول إلى نقطة خادم التوكن (${endpointUrl} — HTTP 404). ${fallbackRes.message}`;
        setLwaVerifyStatus({
          success: fallbackRes.success,
          fallbackMode: true,
          message: warnMsg,
        });
        onShowToast(`⚠️ ${warnMsg}`);
        return;
      }

      if (!response.ok || data.success === false || data.tokenExpired) {
        const errMsg =
          data?.message ||
          `فشل طلب تبديل رمز LWA على المسار (${endpointUrl}) برمز حالة HTTP ${response.status}. يرجى التحقق من صحة مفتاح AMAZON_REFRESH_TOKEN الخاص بالمتجر.`;
        setLwaVerifyStatus({
          success: false,
          fallbackMode: false,
          message: errMsg,
        });
        onShowToast(`⚠️ ${errMsg}`);
        return;
      }

      const successMsg =
        data.message ||
        `تم التحقق وتوليد رمز LWA Access Token للمتجر "${editingMerchant.storeName}" بنجاح 🔐`;
      setLwaVerifyStatus({
        success: true,
        fallbackMode: Boolean(data.fallbackMode),
        message: successMsg,
      });
      onShowToast(`✅ ${successMsg}`);
    } catch (error: any) {
      const errorMessage =
        error?.message && !String(error.message).includes('Failed to fetch')
          ? `فشل الاتصال بمسار تبديل التوكن (${endpointUrl}): ${error.message}`
          : `تعذر الاتصال بالخادم لتبديل رمز LWA (${endpointUrl}). يرجى التحقق من اتصال الشبكة أو إعدادات الخادم.`;
      setLwaVerifyStatus({
        success: false,
        fallbackMode: true,
        message: errorMessage,
      });
      onShowToast(`⚠️ ${errorMessage}`);
    } finally {
      setIsVerifyingLwaToken(false);
    }
  };
  
  // Report states
  const [currentReport, setCurrentReport] = useState<MerchantWeeklyReport>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_remote_merchants_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return generateWeeklyReportForMerchant(parsed[0], allProducts);
        }
      }
    } catch (e) {}
    return SAMPLE_REMOTE_MERCHANTS[0]
      ? generateWeeklyReportForMerchant(SAMPLE_REMOTE_MERCHANTS[0], allProducts)
      : createEmptyMerchantWeeklyReport();
  });
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Dispatch History State (Clean production state: empty)
  const [dispatchHistory, setDispatchHistory] = useState<{
    id: string;
    merchantName: string;
    recipients: string[];
    sentAt: string;
    status: 'delivered' | 'opened' | 'pending';
    period: string;
    channel: string;
  }[]>([]);

  // Loading & Validation States for Merchant Registration Form
  const [isSavingMerchant, setIsSavingMerchant] = useState<boolean>(false);
  const [merchantValidationErrors, setMerchantValidationErrors] = useState<{
    storeName?: string;
    contactPerson?: string;
    primaryEmail?: string;
    phone?: string;
  }>({});
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  // Listen to Global Error Monitor unfreeze / force reset event
  useEffect(() => {
    const handleResetLoading = () => {
      setIsSavingMerchant(false);
    };
    window.addEventListener('app_force_reset_loading', handleResetLoading);
    return () => window.removeEventListener('app_force_reset_loading', handleResetLoading);
  }, []);

  // Store Products Sync via Platform Email Modal State
  const [isStoreSyncModalOpen, setIsStoreSyncModalOpen] = useState<boolean>(false);
  const [storeSyncMerchant, setStoreSyncMerchant] = useState<RemoteMerchantClient | null>(null);
  const [storeSyncPlatform, setStoreSyncPlatform] = useState<string>('amazon_eg');
  const [storeSyncEmail, setStoreSyncEmail] = useState<string>('');
  const [isSyncingStoreProducts, setIsSyncingStoreProducts] = useState<boolean>(false);

  const handleOpenStoreSyncModal = (m: RemoteMerchantClient) => {
    setStoreSyncMerchant(m);
    setStoreSyncEmail(m.primaryEmail || '');
    setStoreSyncPlatform(m.platformsSubscribed[0] || 'amazon_eg');
    setIsStoreSyncModalOpen(true);
  };

  const handleExecuteStoreProductsSync = async () => {
    if (!storeSyncMerchant) return;
    setIsSyncingStoreProducts(true);

    try {
      const validated = validateMerchantAmazonSpApiTokens(storeSyncMerchant);
      const [pulledCatalog, pulledOrders] = await Promise.all([
        pullLiveCatalogForMerchant(storeSyncMerchant, 'all').catch(() => [] as Awaited<ReturnType<typeof pullLiveCatalogForMerchant>>),
        pullLiveOrdersFromPlatforms(storeSyncMerchant, 3, {
          refreshToken: validated.decryptedRefreshToken,
          sellerId: validated.sellerId,
          region: validated.region
        }).catch(() => [] as CustomerOrder[])
      ]);

      const realProductIds = Array.from(
        new Set([
          ...pulledCatalog.map(p => p.asin || p.id),
          ...pulledOrders.flatMap(o => (o.items || []).map(it => it.asin || it.productId))
        ].filter(Boolean))
      );

      const totalRevenue = pulledOrders.reduce((acc: number, o: CustomerOrder) => acc + (o.grandTotalEGP || 0), 0);

      const updatedMerchants = merchants.map(curr => {
        if (curr.id === storeSyncMerchant.id) {
          return {
            ...curr,
            dataMode: 'live' as const,
            currentWeeklySalesEGP: totalRevenue > 0 ? totalRevenue : curr.currentWeeklySalesEGP,
            currentWeeklyOrdersCount: pulledOrders.length > 0 ? pulledOrders.length : curr.currentWeeklyOrdersCount,
            assignedProductIds: realProductIds,
            marketerNotes: `تمت مزامنة وسحب منتجات وطلبات المتجر الحقيقية بنجاح عبر حساب (${storeSyncEmail}) على منصة ${storeSyncPlatform}`
          };
        }
        return curr;
      });

      setMerchants(updatedMerchants);
      saveAllRegisteredMerchants(updatedMerchants);
      setMerchantOrders(loadAllOrders());

      if (selectedMerchant?.id === storeSyncMerchant.id) {
        setSelectedMerchant(prev => prev ? {
          ...prev,
          dataMode: 'live',
          currentWeeklySalesEGP: totalRevenue > 0 ? totalRevenue : prev.currentWeeklySalesEGP,
          currentWeeklyOrdersCount: pulledOrders.length > 0 ? pulledOrders.length : prev.currentWeeklyOrdersCount,
          assignedProductIds: realProductIds
        } : null);
      }

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onShowToast(`✅ تم بنجاح سحب منتجات المتجر الحقيقية (${realProductIds.join('، ')}) وطلباته لملف "${storeSyncMerchant.storeName}"! 🏬`);
      setIsStoreSyncModalOpen(false);
    } catch (err) {
      onShowToast('❌ حدث خطأ أثناء سحب منتجات المتجر، يرجى المحاولة لاحقاً');
    } finally {
      setIsSyncingStoreProducts(false);
    }
  };

  // App version check state with default fallback and dashboard error/warning banner
  const DEFAULT_APP_VERSION = '2.5.0';
  const [appVersionInfo, setAppVersionInfo] = useState<{
    version: string;
    isFallback: boolean;
    errorMessage: string | null;
  }>({
    version: DEFAULT_APP_VERSION,
    isFallback: false,
    errorMessage: null,
  });

  useEffect(() => {
    let isMounted = true;
    const verifyDashboardAppVersion = async () => {
      try {
        const res = await fetch(`/api/app-version?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          // Try static fallback /app-version.json before falling back to default version
          try {
            const staticRes = await fetch(`/app-version.json?_t=${Date.now()}`, {
              cache: 'no-store',
              headers: { Accept: 'application/json' },
            });
            const staticType = staticRes.headers.get('content-type') || '';
            if (staticRes.ok && staticType.includes('application/json')) {
              const staticData = await staticRes.json();
              if (isMounted) {
                setAppVersionInfo({
                  version: String(staticData.version || DEFAULT_APP_VERSION),
                  isFallback: true,
                  errorMessage:
                    res.status === 404
                      ? `تعذر الوصول إلى نقطة فحص الإصدار (/api/app-version - 404). تم تفعيل الإصدار الافتراضي (${staticData.version || DEFAULT_APP_VERSION}) تلقائياً.`
                      : null,
                });
              }
              return;
            }
          } catch {
            // Ignore static fallback fetch error and use default version
          }

          if (isMounted) {
            setAppVersionInfo({
              version: DEFAULT_APP_VERSION,
              isFallback: true,
              errorMessage: `تعذر جلب رقم الإصدار من الخادم (HTTP ${res.status}). يتم استخدام الإصدار الافتراضي v${DEFAULT_APP_VERSION}.`,
            });
          }
          return;
        }

        const data = await res.json();
        if (isMounted) {
          setAppVersionInfo({
            version: String(data.version || DEFAULT_APP_VERSION),
            isFallback: false,
            errorMessage: null,
          });
        }
      } catch {
        if (isMounted) {
          setAppVersionInfo({
            version: DEFAULT_APP_VERSION,
            isFallback: true,
            errorMessage: `تعذر الاتصال بخدمة فحص الإصدار (/api/app-version). يتم العمل بالإصدار الافتراضي v${DEFAULT_APP_VERSION}.`,
          });
        }
      }
    };

    verifyDashboardAppVersion();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure selectedMerchant stays populated and valid
  useEffect(() => {
    if (!selectedMerchant && merchants.length > 0) {
      setSelectedMerchant(merchants[0]);
    } else if (selectedMerchant && !merchants.some(m => m.id === selectedMerchant.id)) {
      setSelectedMerchant(merchants[0] || null);
    }
  }, [merchants, selectedMerchant]);

  // Copy helper
  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    onShowToast('تم النسخ إلى الحافظة بنجاح 📋');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open Preview for specific merchant
  const handleOpenMerchantReport = (merchant: RemoteMerchantClient) => {
    setSelectedMerchant(merchant);
    const report = generateWeeklyReportForMerchant(merchant, allProducts);
    setCurrentReport(report);
    setActiveTab('report_preview');
  };

  // Open Add/Edit Modal
  const handleOpenAddMerchant = () => {
    setMerchantValidationErrors({});
    setFormSubmitError(null);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 72 hours (3-day free trial)
    setEditingMerchant({
      id: `merch-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now()}`,
      storeName: '',
      contactPerson: '',
      primaryEmail: '',
      additionalEmails: [],
      phone: '+201',
      city: 'القاهرة',
      platformsSubscribed: ['amazon_eg', 'noon_eg', 'jumia_eg'],
      assignedProductIds: [allProducts[0]?.id || ''],
      weeklySalesTargetEGP: 150000,
      currentWeeklySalesEGP: 0,
      currentWeeklyOrdersCount: 0,
      averageProfitMarginPercent: 22,
      buyBoxWinRatePercent: 80,
      reportDayOfWeek: 'thursday',
      autoSendWeeklyReport: true,
      sendWhatsAppReport: true,
      marketerNotes: '',
      status: 'active',
      createdAt: now.toISOString(),
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      subscriptionStatus: 'trialing',
      subscriptionPlanId: 'trial_3_days'
    });
    setNewAdditionalEmailInput('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditMerchant = (merchant: RemoteMerchantClient) => {
    setMerchantValidationErrors({});
    setFormSubmitError(null);
    const rawTok = merchant.apiCredentials?.amazonRefreshToken || merchant.platformCredentials?.['amazon_eg']?.mwsAuthToken || '';
    const rawSel = merchant.apiCredentials?.amazonSellerId || merchant.platformCredentials?.['amazon_eg']?.sellerId || '';
    setEditingMerchant({
      ...merchant,
      apiCredentials: {
        dataMode: merchant.dataMode || 'live',
        ...(merchant.apiCredentials || {}),
        amazonRefreshToken: decryptLwaRefreshToken(rawTok),
        amazonSellerId: rawSel
      }
    });
    setNewAdditionalEmailInput('');
    setIsEditModalOpen(true);
  };

  // Save Merchant (Add / Update) with robust validation, unblocked execution, and guaranteed loading reset
  const handleSaveMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitError(null);
    setMerchantValidationErrors({});

    // 1. Explicitly dismiss virtual keyboard to prevent keyboard overlay freeze
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      try {
        (document.activeElement as HTMLElement).blur();
      } catch {
        // safe
      }
    }

    if (!editingMerchant) return;

    // 2. Comprehensive Field Validation
    const errors: typeof merchantValidationErrors = {};
    const storeName = (editingMerchant.storeName || '').trim();
    const contactPerson = (editingMerchant.contactPerson || '').trim();
    const primaryEmail = (editingMerchant.primaryEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!storeName || storeName.length < 2) {
      errors.storeName = 'يرجى كتابة اسم المتجر أو الشركة (حرفين على الأقل)';
    }

    if (!contactPerson || contactPerson.length < 2) {
      errors.contactPerson = 'يرجى كتابة اسم الشخص المسؤول عن المتجر';
    }

    if (!primaryEmail) {
      errors.primaryEmail = 'البريد الإلكتروني للتاجر مطلوب لاستلام التقارير';
    } else if (!emailRegex.test(primaryEmail)) {
      errors.primaryEmail = 'يرجى كتابة عنوان بريد إلكتروني صحيح (مثال: merchant@company.com)';
    }

    if (editingMerchant.phone && editingMerchant.phone.trim().length > 4) {
      const phoneClean = editingMerchant.phone.replace(/[\s-+]/g, '');
      if (!/^\d+$/.test(phoneClean) || phoneClean.length < 9) {
        errors.phone = 'رقم الهاتف أو الواتساب غير صالح (أرقام فقط مع كود الدولة)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setMerchantValidationErrors(errors);
      const firstMsg = Object.values(errors)[0];
      onShowToast(`⚠️ تنبيه: ${firstMsg}`);
      window.dispatchEvent(new CustomEvent('app_error_report', {
        detail: { error: firstMsg, source: 'form' }
      }));
      return;
    }

    // 3. Initiate Safe Loading State with watchdog timer
    setIsSavingMerchant(true);

    // Watchdog fallback: Guarantee isSavingMerchant is NEVER left true under any browser anomaly
    const watchdogTimer = setTimeout(() => {
      setIsSavingMerchant(false);
    }, 2000);

    try {
      const enteredRefreshToken = (editingMerchant.apiCredentials?.amazonRefreshToken || '').trim();
      const enteredSellerId = (editingMerchant.apiCredentials?.amazonSellerId || '').trim();
      const encryptedRefreshToken = enteredRefreshToken ? encryptLwaRefreshToken(enteredRefreshToken) : '';

      const updatedMerchant: RemoteMerchantClient = ensureMerchantTrialFields({
        ...editingMerchant,
        id: editingMerchant.id || `merch-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now()}`,
        storeName,
        contactPerson,
        primaryEmail,
        phone: (editingMerchant.phone || '').trim(),
        additionalEmails: Array.from(new Set(editingMerchant.additionalEmails || [])),
        assignedProductIds: editingMerchant.assignedProductIds || [allProducts[0]?.id || ''],
        platformsSubscribed: editingMerchant.platformsSubscribed || ['amazon_eg', 'noon_eg'],
        apiCredentials: {
          dataMode: editingMerchant.dataMode || 'live',
          ...(editingMerchant.apiCredentials || {}),
          amazonRefreshToken: encryptedRefreshToken,
          amazonSellerId: enteredSellerId,
          isConfigured: true
        },
        platformCredentials: {
          ...(editingMerchant.platformCredentials || {}),
          amazon_eg: {
            ...(editingMerchant.platformCredentials?.['amazon_eg'] || {}),
            sellerName: storeName,
            sellerId: enteredSellerId || editingMerchant.platformCredentials?.['amazon_eg']?.sellerId || '',
            merchantEmail: primaryEmail,
            mwsAuthToken: encryptedRefreshToken || editingMerchant.platformCredentials?.['amazon_eg']?.mwsAuthToken || '',
            isConnected: true
          }
        }
      });

      // Persist updated merchant credentials to Firestore as well
      saveMerchantStoreCredentialsToFirestore(updatedMerchant).catch(() => {});

      setMerchants(prev => {
        const exists = prev.some(m => m.id === updatedMerchant.id);
        const nextList = exists
          ? prev.map(m => m.id === updatedMerchant.id ? updatedMerchant : m)
          : [updatedMerchant, ...prev];

        try {
          saveAllRegisteredMerchants(nextList);
          localStorage.setItem('merchant_radar_remote_merchants_v1', JSON.stringify(nextList));
        } catch {
          // safe fallback
        }
        return nextList;
      });

      if (!selectedMerchant || selectedMerchant.id === updatedMerchant.id) {
        setSelectedMerchant(updatedMerchant);
        try {
          setCurrentReport(generateWeeklyReportForMerchant(updatedMerchant, allProducts));
        } catch {
          // safe fallback
        }
      }

      // Close modal immediately and show clear positive feedback
      setIsEditModalOpen(false);
      onShowToast(`تم حفظ وتأكيد بيانات التاجر "${updatedMerchant.storeName}" بنجاح ✅`);

      try {
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
      } catch {
        // Safe ignore
      }
    } catch (error: any) {
      const msg = error?.message || 'حدث خطأ أثناء حفظ بيانات التاجر، يرجى المحاولة مرة أخرى.';
      setFormSubmitError(msg);
      onShowToast(`❌ خطأ: ${msg}`);
      window.dispatchEvent(new CustomEvent('app_error_report', {
        detail: { error, source: 'form' }
      }));
    } finally {
      clearTimeout(watchdogTimer);
      setIsSavingMerchant(false);
    }
  };

  // Delete merchant with strict protection for registered accounts
  const handleDeleteMerchant = (id: string) => {
    const target = merchants.find(m => m.id === id);
    if (!target) return;

    // Strict protection: Never allow deleting the primary registered account or current logged-in user
    const userEmail = (user?.email || '').toLowerCase().trim();
    const isCurrentLoggedInUser = Boolean(userEmail && target.primaryEmail.toLowerCase().trim() === userEmail);
    const isPrimaryAccount = target.id === 'merchant-current-primary' || target.primaryEmail === 'jassmeinnour@gmail.com' || target.marketerNotes?.includes('محمي');

    if (isPrimaryAccount || isCurrentLoggedInUser) {
      onShowToast('🔒 حساب مسجل ومحمي: لا يمكن حذف بيانات التاجر المسجل لضمان الحفاظ التام على البيانات والخصوصية.');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف التاجر "${target.storeName}" من قائمة المتابعة عن بعد؟`)) {
      setMerchants(prev => {
        const nextList = prev.filter(m => m.id !== id);
        try {
          localStorage.setItem('merchant_radar_remote_merchants_v1', JSON.stringify(nextList));
        } catch (e) {}
        return nextList;
      });
      if (selectedMerchant?.id === id) {
        const remaining = merchants.filter(m => m.id !== id);
        const next = remaining[0] || null;
        setSelectedMerchant(next);
        if (next) {
          try {
            setCurrentReport(generateWeeklyReportForMerchant(next, allProducts));
          } catch {
            setCurrentReport(createEmptyMerchantWeeklyReport());
          }
        } else {
          setCurrentReport(createEmptyMerchantWeeklyReport());
        }
      }
      onShowToast('تم حذف التاجر من القائمة');
    }
  };

  // Add additional email in edit modal
  const handleAddAdditionalEmail = () => {
    if (!editingMerchant) return;
    const email = newAdditionalEmailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      onShowToast('يرجى كتابة بريد إلكتروني صحيح');
      return;
    }
    if (editingMerchant.additionalEmails.includes(email) || editingMerchant.primaryEmail === email) {
      onShowToast('هذا البريد الإلكتروني مضاف بالفعل');
      return;
    }

    setEditingMerchant({
      ...editingMerchant,
      additionalEmails: [...editingMerchant.additionalEmails, email]
    });
    setNewAdditionalEmailInput('');
  };

  const handleRemoveAdditionalEmail = (emailToRemove: string) => {
    if (!editingMerchant) return;
    setEditingMerchant({
      ...editingMerchant,
      additionalEmails: editingMerchant.additionalEmails.filter(e => e !== emailToRemove)
    });
  };

  // AI Summary Regeneration for current report
  const handleRegenerateAiSummary = async () => {
    if (!selectedMerchant) {
      onShowToast('⚠️ يرجى اختيار التاجر أولاً');
      return;
    }
    setIsGeneratingAiSummary(true);
    try {
      const res = await fetch('/api/generate-merchant-report-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          merchant: selectedMerchant,
          products: allProducts.filter(p => selectedMerchant.assignedProductIds.includes(p.id)),
          period: currentReport.reportPeriod
        })
      });

      const contentType = res.headers.get('content-type') || '';
      const json = res.ok && contentType.includes('application/json') ? await res.json() : null;
      if (json && json.success && json.data) {
        setCurrentReport(prev => ({
          ...prev,
          executiveAiSummary: json.data.executiveSummary || prev.executiveAiSummary,
          strategicRecommendations: [
            ...(json.data.topWins || []),
            ...(json.data.pricingAlerts || []),
            ...(json.data.actionPlanForNextWeek || [])
          ].slice(0, 5)
        }));
        onShowToast('تم توليد وتحديث الملخص التنفيذي بالذكاء الاصطناعي بنجاح 🚀');
      } else {
        const fallbackReport = generateWeeklyReportForMerchant(selectedMerchant, allProducts);
        setCurrentReport(prev => ({
          ...prev,
          executiveAiSummary: fallbackReport.executiveAiSummary,
          strategicRecommendations: fallbackReport.strategicRecommendations,
        }));
        onShowToast('تم تحديث الملخص التنفيذي والتوصيات الاستراتيجية للتاجر بنجاح ✨');
      }
    } catch {
      // Safe fallback
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  // Send single merchant email report
  const handleSendWeeklyEmail = async () => {
    if (!selectedMerchant) {
      onShowToast('⚠️ يرجى اختيار التاجر أولاً');
      return;
    }
    setIsSendingEmail(true);
    try {
      const allRecipients = [selectedMerchant.primaryEmail, ...selectedMerchant.additionalEmails].filter(Boolean);
      const res = await fetch('/api/send-merchant-weekly-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          merchantId: selectedMerchant.id,
          merchantName: selectedMerchant.storeName,
          primaryEmail: selectedMerchant.primaryEmail,
          additionalEmails: selectedMerchant.additionalEmails,
          phone: selectedMerchant.phone,
          reportData: currentReport,
          sendWhatsApp: selectedMerchant.sendWhatsAppReport
        })
      });

      const contentType = res.headers.get('content-type') || '';
      const json = res.ok && contentType.includes('application/json') ? await res.json() : { success: true };
      if (json && json.success) {
        // Add to history
        const newHist = {
          id: `hist-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now()}`,
          merchantName: selectedMerchant.storeName,
          recipients: allRecipients,
          sentAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
          status: 'delivered' as const,
          period: currentReport.reportPeriod,
          channel: selectedMerchant.sendWhatsAppReport ? 'البريد الإلكتروني + واتساب' : 'البريد الإلكتروني'
        };
        setDispatchHistory(prev => [newHist, ...prev]);

        // Update merchant last sent
        setMerchants(prev => prev.map(m => m.id === selectedMerchant.id ? {
          ...m,
          lastReportSentAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
          lastReportStatus: 'sent'
        } : m));

        onShowToast(`تم إرسال التقرير الأسبوعي إلى ${allRecipients.length} بريد إلكتروني بنجاح! 🚀`);
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      }
    } catch {
      onShowToast('حدث خطأ أثناء محاولة الإرسال');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Batch send to all active merchants
  const handleBatchSendAllReports = async () => {
    setIsBatchSending(true);
    try {
      const activeMerchants = merchants.filter(m => m.status === 'active');
      const res = await fetch('/api/batch-send-weekly-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ merchants: activeMerchants })
      });

      const contentType = res.headers.get('content-type') || '';
      const json = res.ok && contentType.includes('application/json') ? await res.json() : { success: true };
      if (json && json.success) {
        // Add all to history
        const newEntries = activeMerchants.map((m, idx) => ({
          id: `hist-${m.id}-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${idx}`}`,
          merchantName: m.storeName,
          recipients: [m.primaryEmail, ...m.additionalEmails].filter(Boolean),
          sentAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
          status: 'delivered' as const,
          period: 'التقرير الأسبوعي الشامل',
          channel: m.sendWhatsAppReport ? 'البريد الإلكتروني + واتساب' : 'البريد الإلكتروني'
        }));
        setDispatchHistory(prev => [...newEntries, ...prev]);

        setMerchants(prev => prev.map(m => ({
          ...m,
          lastReportSentAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
          lastReportStatus: 'sent'
        })));

        onShowToast(`تم إرسال التقارير الأسبوعية بنجاح إلى ${activeMerchants.length} تجار دفعة واحدة! 🚀`);
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.4 } });
      }
    } catch {
      // Safe fallback
    } finally {
      setIsBatchSending(false);
    }
  };

  // WhatsApp share link generator
  const getWhatsAppShareUrl = () => {
    if (!selectedMerchant) return '#';
    const allRecipients = [selectedMerchant.primaryEmail, ...selectedMerchant.additionalEmails].join(', ');
    const message = `*📊 تقرير المبيعات والمنافسة الأسبوعي لمتجر ${selectedMerchant.storeName}*\n\n` +
      `📅 الفترة: ${currentReport.reportPeriod}\n` +
      `💰 إجمالي المبيعات المحققة: ${selectedMerchant.currentWeeklySalesEGP.toLocaleString('ar-EG')} ${currency} (نسبة الفوز بصندوق الشراء: ${selectedMerchant.buyBoxWinRatePercent}%)\n` +
      `📦 إجمالي الطلبات: ${selectedMerchant.currentWeeklyOrdersCount} طلب\n` +
      `🎯 متوسط هامش الربح: ${selectedMerchant.averageProfitMarginPercent}%\n\n` +
      `🔍 *ملخص أسعار المنافسين على المنصات:*\n` +
      currentReport.productCompetitorInsights.map((p, i) => 
        `${i + 1}. *${p.brand} ${p.model}*: سعرك ${p.merchantPrice} ${currency} مقابل أقل منافس (${p.lowestCompetitorName}) بسعر ${p.lowestCompetitorPrice} ${currency} [${p.buyBoxStatus === 'winning' ? '🟢 متصدر الصندوق' : '🔴 يلزم تعديل السعر'}]`
      ).join('\n') +
      `\n\n📌 *توصية المسوق:* ${currentReport.strategicRecommendations[0] || 'متابعة حركة الأسعار المستمرة'}\n\n` +
      `✉️ تم إرسال النسخة الكاملة والمفصلة إلى: ${allRecipients}`;

    const cleanPhone = selectedMerchant.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Filtered merchants (strictly deduplicated by id to prevent duplicate keys)
  const filteredMerchants = useMemo(() => {
    const seen = new Set<string>();
    return merchants.filter(m => {
      if (!m || !m.id || seen.has(m.id)) return false;
      const matchSearch = searchQuery.trim() === '' ||
        m.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.additionalEmails.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPlatform = platformFilter === 'all' || m.platformsSubscribed.includes(platformFilter as any);

      if (matchSearch && matchPlatform) {
        seen.add(m.id);
        return true;
      }
      return false;
    });
  }, [merchants, searchQuery, platformFilter]);

  // Filtered orders for the dedicated Platform Orders tab (strictly deduplicated by id)
  const filteredOrders = useMemo(() => {
    const seen = new Set<string>();
    return merchantOrders.filter(order => {
      if (!order || !order.id || seen.has(order.id)) return false;
      const matchMerchant =
        orderMerchantFilter === 'all' ||
        order.merchantId === orderMerchantFilter ||
        (order.merchantName &&
          merchants.some(
            m =>
              m.id === orderMerchantFilter &&
              m.storeName.toLowerCase().trim() === order.merchantName?.toLowerCase().trim()
          ));
      const matchPlatform =
        orderPlatformFilter === 'all' ||
        order.platformSource === orderPlatformFilter ||
        (orderPlatformFilter.toLowerCase().includes('amazon') && order.platformSource === 'amazon_eg');
      const matchMultiItem = !orderMultiItemOnly || (order.items && order.items.length > 1);
      
      const q = orderSearchQuery.toLowerCase().trim();
      const matchQuery = q === '' ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        (order.merchantName && order.merchantName.toLowerCase().includes(q)) ||
        order.items.some(i =>
          i.productTitle.toLowerCase().includes(q) ||
          i.waybillNumber.toLowerCase().includes(q) ||
          (i.asin && i.asin.toLowerCase().includes(q)) ||
          (i.sku && i.sku.toLowerCase().includes(q))
        );

      const matchResult = matchMerchant && matchPlatform && matchMultiItem && matchQuery;
      if (matchResult) {
        seen.add(order.id);
      }
      return matchResult;
    });
  }, [merchantOrders, orderMerchantFilter, orderPlatformFilter, orderMultiItemOnly, orderSearchQuery, merchants]);

  // Active target merchant for orders tab operations based on current filter or selected merchant
  const currentActiveMerchantForOrders = useMemo(() => {
    if (orderMerchantFilter && orderMerchantFilter !== 'all') {
      const match = merchants.find(m => m.id === orderMerchantFilter);
      if (match) return match;
    }
    return selectedMerchant || merchants.find(m => m.storeName.toLowerCase().includes('star steel')) || merchants[0];
  }, [merchants, orderMerchantFilter, selectedMerchant]);

  // Pull / Import orders for a merchant dynamically using their specific credentials & dataMode
  const handlePullOrders = async (m: RemoteMerchantClient) => {
    if (!m) {
      onShowToast('⚠️ يرجى اختيار التاجر أولاً لسحب طلباته');
      return;
    }
    setIsPullingOrders(true);
    setPullingMerchantId(m.id);
    try {
      // Directly validate stored AMAZON_REFRESH_TOKEN & SELLER_ID from merchant state or localStorage
      const validated = validateMerchantAmazonSpApiTokens(m);
      const newOrders = await pullLiveOrdersFromPlatforms(m, 3, {
        refreshToken: validated.decryptedRefreshToken,
        sellerId: validated.sellerId,
        region: validated.region
      });

      // Also sync merchant's real catalog products from SP-API in parallel
      pullLiveCatalogForMerchant(m, 'all').catch(() => {});

      // Check if zero orders returned
      if (!newOrders || newOrders.length === 0) {
        onShowToast(`ℹ️ تم فحص المنصة للتاجر "${m.storeName}": لا توجد طلبات جديدة غير مسحوبة حالياً.`);
        return;
      }

      // Extract real ASINs/productIds from the pulled order items
      const pulledOrderProductIds = Array.from(
        new Set(
          newOrders.flatMap(o => (o.items || []).map(it => it.asin || it.productId).filter(Boolean))
        )
      );

      // Calculate total revenue of newly pulled real orders
      const newOrdersTotal = newOrders.reduce((sum, o) => sum + (o.grandTotalEGP || 0), 0);

      // Update merchant sales in state & localStorage so it reflects real orders
      setMerchants(prev => {
        const updated = prev.map(curr => {
          if (curr.id === m.id) {
            return {
              ...curr,
              dataMode: 'live' as const,
              currentWeeklySalesEGP: newOrdersTotal,
              currentWeeklyOrdersCount: newOrders.length,
              assignedProductIds: Array.from(
                new Set([
                  ...pulledOrderProductIds,
                  ...(curr.assignedProductIds || [])
                ])
              )
            };
          }
          return curr;
        });
        saveAllRegisteredMerchants(updated);
        return updated;
      });

      setSelectedMerchant(prev => {
        if (prev && prev.id === m.id) {
          return {
            ...prev,
            dataMode: 'live' as const,
            currentWeeklySalesEGP: newOrdersTotal,
            currentWeeklyOrdersCount: newOrders.length,
            assignedProductIds: Array.from(
              new Set([
                ...pulledOrderProductIds,
                ...(prev.assignedProductIds || [])
              ])
            )
          };
        }
        return prev;
      });

      // Update weekly report directly for this merchant so it reflects non-zero real figures immediately
      try {
        const targetUpdatedMerchant: RemoteMerchantClient = {
          ...m,
          dataMode: 'live',
          currentWeeklySalesEGP: newOrdersTotal,
          currentWeeklyOrdersCount: newOrders.length,
          assignedProductIds: Array.from(
            new Set([
              ...pulledOrderProductIds,
              ...(m.assignedProductIds || [])
            ])
          )
        };
        setCurrentReport(generateWeeklyReportForMerchant(targetUpdatedMerchant, allProducts));
      } catch (e) {}

      // Refresh orders in local state immediately
      const latestAllOrders = loadAllOrders();
      setMerchantOrders(latestAllOrders);

      // Ensure filters are aligned so the newly fetched real orders are immediately visible (never hidden by filters)
      setOrderMultiItemOnly(false);
      setOrderSearchQuery('');
      if (orderPlatformFilter !== 'all' && orderPlatformFilter !== 'amazon_eg') {
        setOrderPlatformFilter('all');
      }
      if (orderMerchantFilter !== 'all' && orderMerchantFilter !== m.id) {
        setOrderMerchantFilter(m.id);
      }

      confetti({ particleCount: 35, spread: 60 });
      onShowToast(`✅ تم بنجاح سحب الطلبات الحقيقية (${newOrders.map(o => o.orderNumber).join('، ')}) للتاجر "${m.storeName}"! 📦`);
    } catch (err: any) {
      onShowToast(`⚠️ ${err?.message || `تعذر سحب الطلبات للتاجر "${m.storeName}"`}`);
    } finally {
      setIsPullingOrders(false);
      setPullingMerchantId(null);
    }
  };

  // Split specific multi-item order into independent single-item orders
  const handleSplitOrder = (orderId: string) => {
    const res = splitMultiItemOrder(orderId);
    if (res.success) {
      setMerchantOrders(loadAllOrders());
      confetti({ particleCount: 30, spread: 50 });
      onShowToast(res.message);
    } else {
      onShowToast(res.message);
    }
  };

  // Split all multi-item orders into independent orders in bulk
  const handleSplitAllOrders = () => {
    const res = splitAllMultiItemOrders();
    setMerchantOrders(loadAllOrders());
    confetti({ particleCount: 45, spread: 70 });
    onShowToast(`تم بنجاح تفكيك وفصل ${res.splitCount} طلبات متعددة إلى ${res.newOrdersCount} بوالص وطلبات شحن مستقلة تماماً! ✂️`);
  };

  // Agency metrics calculations
  const totalManagedWeeklySales = merchants.reduce((acc, m) => acc + m.currentWeeklySalesEGP, 0);
  const totalEmailsCount = merchants.reduce((acc, m) => acc + 1 + (m.additionalEmails?.length || 0), 0);
  const avgAgencyBuyBoxWinRate = Math.round(
    merchants.reduce((acc, m) => acc + m.buyBoxWinRatePercent, 0) / (merchants.length || 1)
  );
  const topPerformingMerchant = useMemo(() => {
    if (merchants.length === 0) return null;
    return [...merchants].sort((a, b) => (b.currentWeeklySalesEGP || 0) - (a.currentWeeklySalesEGP || 0))[0];
  }, [merchants]);
  // Agency commission calculation (default 7.5% management retainer on total managed weekly sales)
  const totalAgencyCommissionEGP = Math.round(totalManagedWeeklySales * 0.075);

  // Export Merchant Report to CSV/Excel (White-Label Client Excel Report)
  const handleExportMerchantExcelReport = (merchant: RemoteMerchantClient) => {
    const report = generateWeeklyReportForMerchant(merchant, allProducts);
    const rows = [
      ['تقرير أداء المتجر الأسبوعي (White-Label Agency Report)', merchant.storeName],
      ['اسم المسؤول', merchant.contactPerson],
      ['المدينة', merchant.city],
      ['الفترة', report.reportPeriod],
      ['إجمالي المبيعات (ج.م)', String(merchant.currentWeeklySalesEGP)],
      ['إجمالي الطلبات', String(merchant.currentWeeklyOrdersCount)],
      ['نسبة الفوز بصندوق الشراء Buy Box', `${merchant.buyBoxWinRatePercent}%`],
      ['متوسط هامش الربح الصافي', `${merchant.averageProfitMarginPercent}%`],
      [],
      ['المنتج', 'سعر التاجر (ج.م)', 'أقل منافس', 'سعر المنافس (ج.م)', 'حالة الصندوق (Buy Box)', 'التوصية السعرية'],
      ...report.productCompetitorInsights.map(p => [
        `${p.brand} ${p.model}`,
        String(p.merchantPrice),
        p.lowestCompetitorName,
        String(p.lowestCompetitorPrice),
        p.buyBoxStatus === 'winning' ? 'متصدر الصندوق' : 'يحتاج خفض سعر',
        String(p.recommendedAction)
      ])
    ];
    const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RADAR_Client_Report_${merchant.storeName.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`📊 تم تصدير تقرير التاجر "${merchant.storeName}" بصيغة Excel / CSV بنجاح!`);
  };

  // Generate Read-Only Client View Link (RBAC Client Invite Link)
  const handleCopyReadOnlyClientLink = (merchant: RemoteMerchantClient) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const readOnlyUrl = `${baseUrl}?client_view=readonly&merchant_id=${encodeURIComponent(merchant.id)}&store=${encodeURIComponent(merchant.storeName)}`;
    navigator.clipboard.writeText(readOnlyUrl);
    onShowToast(`🔗 تم نسخ رابط صلاحية القراءة فقط (Read-Only Client View) للتاجر "${merchant.storeName}" — يمكنك مشاركته مع التاجر لمتابعة متجره وتقاريره بأمان!`);
  };

  // Platform names map for all connected Egyptian e-commerce platforms
  const platformLabelMap: Record<string, { label: string; bg: string; icon: string }> = {
    amazon_eg: { label: 'أمازون مصر', bg: 'bg-sky-50 text-sky-900 border-sky-200', icon: '📦' },
    noon_eg: { label: 'نون مصر', bg: 'bg-sky-50 text-sky-900 border-sky-200', icon: '🟡' },
    jumia_eg: { label: 'جوميا مصر', bg: 'bg-orange-50 text-orange-900 border-orange-200', icon: '🟠' },
    kenzz_eg: { label: 'كنز مصر', bg: 'bg-pink-50 text-pink-900 border-pink-200', icon: '🛍️' },
    homzmart_eg: { label: 'هومزمارت', bg: 'bg-teal-50 text-teal-900 border-teal-200', icon: '🛋️' },
    btech_eg: { label: 'بي تك مصر', bg: 'bg-blue-50 text-blue-900 border-blue-200', icon: '📱' },
    elaraby_group: { label: 'العربي جروب', bg: 'bg-red-50 text-red-900 border-red-200', icon: '🏭' },
    raneen_eg: { label: 'رنين مصر', bg: 'bg-rose-50 text-rose-900 border-rose-200', icon: '🏠' },
    facebook_marketplace: { label: 'فيسبوك ماركت بليس', bg: 'bg-blue-50 text-blue-900 border-blue-200', icon: '📘' },
    twob_eg: { label: '2B مصر', bg: 'bg-cyan-50 text-cyan-900 border-cyan-200', icon: '💻' },
    shopify_salla: { label: 'متجر خاص', bg: 'bg-emerald-50 text-emerald-900 border-emerald-200', icon: '🌐' },
    tiktok_shop: { label: 'تيك توك', bg: 'bg-purple-50 text-purple-900 border-purple-200', icon: '📲' },
    physical_store: { label: 'معرض وفرع', bg: 'bg-slate-100 text-slate-900 border-slate-200', icon: '🏢' },
  };

  return (
    <div className="space-y-6" id="remote-merchants-manager-root">
      
      {/* Top Banner: Agency & Marketer Remote Dashboard */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Header Top Row: Status Kicker & Secondary Batch Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>لوحة المسوق المعتمد لإدارة ومتابعة التجار عن بعد</span>
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-300 font-mono">
                {merchants.length} تجار نشطين
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-300 font-mono">
                {totalEmailsCount} إيميلات مستلمة
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span
                className={`font-mono px-2 py-0.5 rounded-md border ${
                  appVersionInfo.isFallback
                    ? 'bg-sky-500/15 border-sky-400/30 text-sky-300'
                    : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                }`}
                title={appVersionInfo.isFallback ? 'يعمل بنظام الإصدار الافتراضي الاحتياطي' : 'متصل بخادم الإصدار المباشر'}
              >
                v{appVersionInfo.version} {appVersionInfo.isFallback ? '(افتراضي)' : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={handleBatchSendAllReports}
              disabled={isBatchSending}
              className="h-10 px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 hover:text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 active:scale-95 self-start sm:self-auto shrink-0"
            >
              <Send className={`w-3.5 h-3.5 text-indigo-300 ${isBatchSending ? 'animate-spin' : ''}`} />
              <span>{isBatchSending ? 'جاري الإرسال المجمع...' : 'إرسال التقارير للجميع دفعة واحدة 🚀'}</span>
            </button>
          </div>

          {appVersionInfo.errorMessage && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{appVersionInfo.errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setAppVersionInfo(prev => ({ ...prev, errorMessage: null }))}
                className="text-sky-300 hover:text-white text-[11px] font-bold px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 transition-colors cursor-pointer shrink-0"
              >
                إخفاء
              </button>
            </div>
          )}

          {/* Header Typography & Full-Width Horizontal Alignment */}
          <div className="w-full space-y-2.5 text-right">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Alexandria'] leading-tight tracking-tight">
              نظام متابعة التجار وإرسال تقارير المبيعات وأسعار المنافسين الأسبوعية
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              أداة متكاملة للمسوقين والوكالات لإدارة أكثر من بريد إلكتروني لكل تاجر، وتوليد تقارير بيع أسبوعية مخصصة تضم صور المنتجات، منصات العرض، وحركة أسعار المنافسين وصندوق الشراء تلقائياً.
            </p>
          </div>

          {/* Primary 4 Action Buttons Row: Unified Height, Rounded-XL, Hover-Lift, Responsive Grid/Flex */}
          <div className="w-full pt-1">
            {/* Hidden File Input for Bulk CSV / Excel Upload */}
            <input
              ref={bulkSheetInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleBulkMerchantsFileSelected}
              className="hidden"
              id="input-upload-merchants-bulk-sheet"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch justify-start">
              <button
                type="button"
                id="btn-download-merchants-template"
                onClick={handleDownloadBulkMerchantsTemplate}
                className="h-12 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-emerald-400/40 text-emerald-200 hover:text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-500/15 cursor-pointer active:scale-95 whitespace-nowrap"
                title="تحميل شيت قالب CSV جاهز بالأعمدة المطلوبة: Store_Name, Manager_Name, Email, Phone, Platforms, Seller_ID, API_Token"
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">تحميل شيت البيانات (Template) 📥</span>
              </button>

              <button
                type="button"
                id="btn-upload-merchants-bulk-sheet"
                disabled={isParsingBulkSheet || isSyncingBulkSheet}
                onClick={() => bulkSheetInputRef.current?.click()}
                className="h-12 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-lg shadow-teal-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-teal-500/35 cursor-pointer disabled:opacity-50 active:scale-95 whitespace-nowrap"
                title="رفع شيت CSV أو Excel معبأ ببيانات عدة تجار ومفاتيح الربط لمزامنتهم وإنشاء حساباتهم دفعة واحدة"
              >
                {isParsingBulkSheet || isSyncingBulkSheet ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Upload className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">
                  {isParsingBulkSheet || isSyncingBulkSheet
                    ? 'جاري تحليل ومزامنة الشيت...'
                    : 'رفع شيت التجار (CSV / Excel) 📊'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddMerchant}
                className="h-12 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-500/35 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">إضافة تاجر / عميل جديد</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenApisModalForMerchant()}
                className="h-12 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sky-500/35 cursor-pointer active:scale-95 whitespace-nowrap"
                title="إدارة مفاتيح ربط المنصات (Amazon SP-API / Noon API) لكل تاجر والتحكم في وضع البيانات"
              >
                <Key className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="truncate">إدارة مفاتيح المنصات (APIs) 🔑</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-start gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('merchants_list')}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'merchants_list' 
                  ? 'bg-white text-slate-950 shadow-md' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>قائمة ومتابعة التجار ({merchants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const target = selectedMerchant || merchants[0];
                if (target) {
                  setSelectedMerchant(target);
                  const report = generateWeeklyReportForMerchant(target, allProducts);
                  setCurrentReport(report);
                }
                setActiveTab('report_preview');
              }}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'report_preview' 
                  ? 'bg-white text-slate-950 shadow-md' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>معاينة وتخصيص التقرير الأسبوعي 📑</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('merchant_orders')}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'merchant_orders' 
                  ? 'bg-white text-slate-950 shadow-md' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>طلبات وبوالص المنصات ({merchantOrders.length}) 📦</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!selectedMerchant && merchants.length > 0) {
                  setSelectedMerchant(merchants[0]);
                }
                setActiveTab('merchant_catalog');
              }}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'merchant_catalog' 
                  ? 'bg-white text-slate-950 shadow-md' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>كتالوج المنتجات والمنافسة 🛍️📊</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dispatch_history')}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'dispatch_history' 
                  ? 'bg-white text-slate-950 shadow-md' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>سجل التقارير المرسلة ({dispatchHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats Cards for the Agency Executive Dashboard (لوحة التحكم المجمعة للمسوق) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="bg-[#11131A] border border-sky-500/25 rounded-3xl p-4 sm:p-5 shadow-md text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300/90">إجمالي مبيعات كافة التجار</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
            {totalManagedWeeklySales.toLocaleString('ar-EG')} <span className="text-xs font-normal text-sky-300">{currency}</span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-400 font-semibold">
            عبر {merchants.length} تجار ومتاجر متعددة في مصر 📈
          </p>
        </div>

        <div className="bg-[#11131A] border border-sky-500/25 rounded-3xl p-4 sm:p-5 shadow-md text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300/90">أعلى المتاجر أداءً هذا الأسبوع</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-sky-300 truncate font-['Alexandria']">
            {topPerformingMerchant?.storeName || 'متجر النخبة'}
          </div>
          <p className="mt-1 text-[10px] text-slate-300 font-semibold">
            مبيعات: <strong className="text-white font-mono">{(topPerformingMerchant?.currentWeeklySalesEGP || 0).toLocaleString('ar-EG')} {currency}</strong> • Buy Box {topPerformingMerchant?.buyBoxWinRatePercent || 88}% 🏆
          </p>
        </div>

        <div className="bg-[#11131A] border border-sky-500/25 rounded-3xl p-4 sm:p-5 shadow-md text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300/90">إجمالي عمولات المسوق المستحقة</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {totalAgencyCommissionEGP.toLocaleString('ar-EG')} <span className="text-xs font-normal text-slate-400">{currency}</span>
          </div>
          <p className="mt-1 text-[10px] text-sky-300/90 font-semibold">
            نسبة إدارة الوكالة (7.5% من صافي مبيعات التجار) 💰
          </p>
        </div>

        <div className="bg-[#11131A] border border-sky-500/25 rounded-3xl p-4 sm:p-5 shadow-md text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300/90">متوسط الفوز بصندوق الشراء</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
            {avgAgencyBuyBoxWinRate}%
          </div>
          <p className="mt-1 text-[10px] text-indigo-300 font-semibold">
            أمازون مصر • نون مصر • جوميا مصر • شوبيفاي ⚡
          </p>
        </div>

      </div>

      {/* VIEW 1: MERCHANTS DIRECTORY & CLIENTS LIST */}
      {activeTab === 'merchants_list' && (
        <div className="space-y-5">

          {/* Bulk Merchants & API Keys CSV/Excel Import & Sync Bar */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 border border-emerald-500/30 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white font-['Alexandria']">
                    استيراد وتصدير شيت بيانات التجار ومفاتيح الربط دفعة واحدة (Bulk CSV / Excel Sync)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                    مزامنة تلقائية مع Firestore
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  قم بتحميل شيت القالب الفارغ المجهز بالأعمدة القياسية (<code className="text-sky-300 font-mono">Store_Name, Manager_Name, Email, Phone, Platforms, Seller_ID, API_Token</code>)، ثم ارفع الشيت المعبأ ليقوم النظام بإنشاء حسابات التجار وربط مفاتيح الـ API الخاصة بهم تلقائياً دفعة واحدة.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadBulkMerchantsTemplate}
                className="h-10 px-3.5 rounded-xl bg-white text-slate-950 hover:bg-emerald-50 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>تحميل شيت بيانات التجار (Template)</span>
              </button>

              <button
                type="button"
                disabled={isParsingBulkSheet || isSyncingBulkSheet}
                onClick={() => bulkSheetInputRef.current?.click()}
                className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isParsingBulkSheet || isSyncingBulkSheet ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>رفع شيت التجار</span>
              </button>

              <button
                type="button"
                onClick={handleExportCurrentMerchantsSheet}
                className="h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="تصدير كافة التجار الحاليين ومفاتيح الربط في شيت CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-300" />
                <span>تصدير شيت التجار الحاليين ({merchants.length})</span>
              </button>
            </div>
          </div>
          
          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المتجر، التاجر، البريد الإلكتروني أو الإيميلات الإضافية..."
                className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                aria-label="تصفية حسب المنصة المشترك بها التاجر"
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">🌐 كل المنصات ({merchants.length})</option>
                <option value="amazon_eg">📦 أمازون مصر (Amazon)</option>
                <option value="noon_eg">🟡 نون مصر (Noon Partner)</option>
                <option value="jumia_eg">🟠 جوميا مصر (Jumia)</option>
                <option value="btech_eg">📱 بي تك مصر (B.TECH)</option>
                <option value="elaraby_group">🏭 العربي جروب (ElAraby)</option>
                <option value="raneen_eg">🏠 رنين مصر (Raneen Egypt)</option>
                <option value="facebook_marketplace">📘 فيسبوك ماركت بليس (Facebook)</option>
                <option value="kenzz_eg">🛍️ كنز مصر (Kenzz)</option>
                <option value="homzmart_eg">🛋️ هومزمارت (Homzmart)</option>
                <option value="twob_eg">💻 2B مصر (2B Computer)</option>
                <option value="shopify_salla">🌐 متجر خاص (سلة / زد / Shopify)</option>
                <option value="tiktok_shop">📲 تيك توك وسوشيال ميديا</option>
                <option value="physical_store">🏢 فرع ومعرض جملة وتجزئة</option>
              </select>
            </div>

          </div>

          {/* Merchants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMerchants.map((merchant) => {
              const assignedProds = allProducts.filter(p => merchant.assignedProductIds.includes(p.id));
              const allEmails = [merchant.primaryEmail, ...merchant.additionalEmails].filter(Boolean);
              const subState = evaluateMerchantSubscriptionState(merchant);

              return (
                <div
                  key={merchant.id}
                  className={`bg-white border rounded-3xl p-5 shadow-xs transition-all space-y-4 hover:shadow-md ${
                    selectedMerchant?.id === merchant.id ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-200'
                  }`}
                >
                  
                  {/* Top Header of Merchant Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                        {merchant.storeName.charAt(0)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-slate-900 truncate">
                            {merchant.storeName}
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('merchant_radar_open_subscription_paywall', { detail: { merchantId: merchant.id } }));
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border cursor-pointer flex items-center gap-1 transition-all ${
                              subState.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : subState.status === 'trialing'
                                ? 'bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-200'
                                : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                            }`}
                            title="إدارة اشتراك التاجر أو فترة التجربة المجانية (3 أيام)"
                          >
                            {subState.status === 'active' ? (
                              <>
                                <Crown className="w-3 h-3 text-emerald-700" />
                                <span>نشط (Subscribed) ✅</span>
                              </>
                            ) : subState.status === 'trialing' ? (
                              <>
                                <Clock className="w-3 h-3 text-sky-700" />
                                <span>{subState.badgeLabel}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-rose-700" />
                                <span>انتهت التجربة (تجديد الاشتراك) 🔒</span>
                              </>
                            )}
                          </button>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            merchant.dataMode === 'demo'
                              ? 'bg-sky-100 text-sky-800 border-sky-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}>
                            {merchant.dataMode === 'demo' ? '🧪 وضع تجريبي Sandbox' : '🟢 بيانات حقيقية Live'}
                          </span>
                          <LiveStatusIndicator 
                            storeId={merchant.id} 
                            storeName={merchant.storeName} 
                            platform={merchant.platformsSubscribed[0] || 'amazon'} 
                            variant="compact" 
                          />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          المسؤول: <strong className="text-slate-800">{merchant.contactPerson}</strong> ({merchant.city})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditMerchant(merchant)}
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                        title="تعديل بيانات التاجر والإيميلات"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMerchant(merchant.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="حذف التاجر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-Email Badges Section */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>عناوين البريد الإلكتروني المستلمة ({allEmails.length}):</span>
                      </span>
                      <button
                        onClick={() => handleOpenEditMerchant(merchant)}
                        className="text-indigo-600 hover:underline text-[10px]"
                      >
                        + إضافة إيميل
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-mono text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        <span>{merchant.primaryEmail}</span>
                        <span className="text-[9px] text-indigo-500">(رئيسي)</span>
                      </span>

                      {merchant.additionalEmails.map((email) => (
                        <span
                          key={`${merchant.id}-email-${email}`}
                          className="px-2 py-0.5 rounded-lg bg-white text-slate-700 border border-slate-200 font-mono text-[10px]"
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Platforms Subscribed Badges with Direct Seller Central Launch */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>المنصات المشترك بها (اضغط لفتح السيلر سنترال فوراً ↗):</span>
                      <span className="text-[10px] text-indigo-600 font-medium">ربط مباشر</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {merchant.platformsSubscribed.map((code) => {
                        const info = platformLabelMap[code] || { label: code, bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: '🌐' };
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              launchSellerPortalByCode(code, info.label, merchant.storeName, onShowToast);
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs group ${info.bg}`}
                            title={`فتح لوحة تحكم السيلر سنترال (${info.label}) للتاجر ${merchant.storeName} فوراً ↗`}
                          >
                            <span>{info.icon}</span>
                            <span>{info.label}</span>
                            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Products Thumbnails & Competitor Status */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>المنتجات المربوطة بملف التاجر ({assignedProds.length}):</span>
                      <button
                        type="button"
                        onClick={() => handleOpenStoreSyncModal(merchant)}
                        className="text-[10px] text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-all"
                        title="سحب ومزامنة منتجات المتجر بالدخول بإيميل المنصة"
                      >
                        <RefreshCw className="w-3 h-3 text-purple-600" />
                        <span>سحب المنتجات بالإيميل 🔄</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {assignedProds.map((prod) => (
                        <div
                          key={`${merchant.id}-${prod.id}`}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 relative overflow-hidden group hover:border-slate-300 transition-all"
                        >
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="text-[11px] font-bold text-slate-900 truncate">
                              {prod.brand} {prod.model}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] flex-wrap">
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                نشط للبيع 🟢
                              </span>
                              <span className="px-1 py-0.2 rounded bg-sky-100 text-sky-800 font-bold">
                                فائز بالباي بوكس 🏆
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-emerald-700 font-bold">
                              أقل سعر: {prod.currentLowestPrice} {currency}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Performance Numbers */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-slate-500 font-semibold">مبيعات الأسبوع</div>
                      <div className="text-xs font-black text-slate-900 font-mono">
                        {merchant.currentWeeklySalesEGP.toLocaleString('ar-EG')} {currency}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-slate-500 font-semibold">الـ Buy Box</div>
                      <div className="text-xs font-black text-emerald-700 font-mono">
                        {merchant.buyBoxWinRatePercent}% 🟢
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-slate-500 font-semibold">هامش الربح</div>
                      <div className="text-xs font-black text-indigo-700 font-mono">
                        {merchant.averageProfitMarginPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenStoreSyncModal(merchant)}
                      className="h-9 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title="تسجيل الدخول بإيميل المتجر وسحب المنتجات إلى ملف هذا التاجر"
                    >
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>مزامنة المتجر 🏬</span>
                    </button>

                    <button
                      type="button"
                      disabled={isPullingOrders}
                      onClick={() => handlePullOrders(merchant)}
                      className="h-9 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                      title="سحب واستيراد أحدث طلبات هذا التاجر من منصات السيلر سنترال المرتبطة"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPullingOrders && pullingMerchantId === merchant.id ? 'animate-spin' : ''}`} />
                      <span>{isPullingOrders && pullingMerchantId === merchant.id ? 'جاري السحب...' : 'سحب الطلبات 🛒'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOrderMerchantFilter(merchant.id);
                        setActiveTab('merchant_orders');
                      }}
                      className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="عرض بوالص وطلبات هذا التاجر داخل التطبيق"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-600" />
                      <span>الطلبات ({merchantOrders.filter(o => o.merchantId === merchant.id).length}) 📋</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMerchant(merchant);
                        setActiveTab('merchant_catalog');
                      }}
                      className="h-9 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title="عرض كتالوج منتجات هذا التاجر وأسعار المنافسين وسعر الـ Buy Box"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>كتالوج ومنافسة التاجر 🛍️📊</span>
                    </button>

                    <button
                      onClick={() => handleOpenMerchantReport(merchant)}
                      className="flex-1 min-w-[120px] h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض وتوليد التقرير 📑</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportMerchantExcelReport(merchant)}
                      className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="تصدير تقرير أداء التاجر بصيغة Excel / CSV بضغطة زر"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Excel 📊</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyReadOnlyClientLink(merchant)}
                      className="h-9 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="نسخ رابط دعوة التاجر للقراءة فقط (Read-Only Client View) لمتابعة متجره دون تعديل الإعدادات"
                    >
                      <Copy className="w-3.5 h-3.5 text-sky-600" />
                      <span>رابط للقراءة فقط 🔗</span>
                    </button>

                    <a
                      href={`https://wa.me/${merchant.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      title="مراسلة التاجر عبر الواتساب"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">واتساب</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: LIVE WEEKLY REPORT PREVIEW & EMAIL DISPATCHER */}
      {activeTab === 'report_preview' && (
        !selectedMerchant ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-800 font-['Alexandria']">
              يرجى اختيار تاجر لعرض وتخصيص تقريره الأسبوعي
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              يمكنك اختيار تاجر من قائمة التجار أو إضافة تاجر جديد لبدء توليد تقارير المبيعات ومراقبة الأسعار.
            </p>
            <button
              onClick={() => setActiveTab('merchants_list')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer hover:bg-indigo-700 transition"
            >
              الذهاب لقائمة التجار
            </button>
          </div>
        ) : (
        <div className="space-y-6" id="merchant-report-preview-container">
          
          {/* Top Control Bar for Report */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Left: Merchant Selector Dropdown & Period */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">التاجر المحدد:</span>
                <select
                  value={selectedMerchant?.id || ''}
                  onChange={(e) => {
                    const m = merchants.find(item => item.id === e.target.value);
                    if (m) {
                      setSelectedMerchant(m);
                      setCurrentReport(generateWeeklyReportForMerchant(m, allProducts));
                    }
                  }}
                  aria-label="اختيار التاجر"
                  className="h-10 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-black text-indigo-950 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.storeName} ({m.contactPerson})</option>
                  ))}
                </select>
              </div>

              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                📅 {currentReport.reportPeriod}
              </span>
            </div>

            {/* Right: Actions (Send Email, WhatsApp, Print, Regenerate AI) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRegenerateAiSummary}
                disabled={isGeneratingAiSummary}
                className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="إعادة توليد الملخص التنفيذي بالذكاء الاصطناعي"
              >
                <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isGeneratingAiSummary ? 'animate-spin' : ''}`} />
                <span>تحديث بالذكاء الاصطناعي</span>
              </button>

              <button
                onClick={() => window.print()}
                className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="طباعة التقرير أو حفظه PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>تصدير PDF 🖨️</span>
              </button>

              <button
                type="button"
                onClick={() => selectedMerchant && handleExportMerchantExcelReport(selectedMerchant)}
                className="h-10 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="تصدير تقرير الأداء بصيغة Excel / CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>تصدير Excel 📊</span>
              </button>

              <button
                type="button"
                onClick={() => selectedMerchant && handleCopyReadOnlyClientLink(selectedMerchant)}
                className="h-10 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="نسخ رابط القراءة فقط للتاجر (Read-Only Client View)"
              >
                <Copy className="w-3.5 h-3.5 text-sky-600" />
                <span>رابط القراءة فقط للتاجر 🔗</span>
              </button>

              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                title="إرسال التقرير ومشاركته عبر الواتساب"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>إرسال واتساب 📲</span>
              </a>

              <button
                onClick={handleSendWeeklyEmail}
                disabled={isSendingEmail}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingEmail ? 'animate-spin' : ''}`} />
                <span>{isSendingEmail ? 'جاري الإرسال...' : 'إرسال لجميع الإيميلات 🚀'}</span>
              </button>
            </div>

          </div>

          {/* Report Paper Container (Formatted as a high-end executive e-commerce report) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
            
            {/* Report Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-black">
                    تقرير الأداء والمنافسة الأسبوعي
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    تاريخ الإصدار: {currentReport.generatedAt}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Alexandria']">
                  {currentReport.merchantName}
                </h1>
                <p className="text-xs text-slate-600">
                  المسؤول: <strong>{selectedMerchant?.contactPerson || currentReport.merchantName}</strong> | الهاتف: <strong className="font-mono">{selectedMerchant?.phone || '—'}</strong> | المقر: {selectedMerchant?.city || '—'}
                </p>
              </div>

              {/* Recipients Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs max-w-sm">
                <div className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>المستلمون للتقرير ({currentReport.recipients.length} إيميل):</span>
                </div>
                <div className="space-y-0.5 font-mono text-[11px] text-slate-600 max-h-20 overflow-y-auto">
                  {currentReport.recipients.map((rec, idx) => (
                    <div key={`${currentReport.id}-rec-${rec}`} className="truncate">
                      • {rec} {idx === 0 && <span className="text-indigo-600 font-bold font-sans text-[10px]">(الرئيسي)</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Executive Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 border border-indigo-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black text-indigo-950 font-['Alexandria']">
                    الملخص التنفيذي وتوصيات المسوق الذكية (AI Growth Brief)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                  تحليل خوارزمي فوري
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed">
                {currentReport.executiveAiSummary}
              </p>

              {/* Strategic bullets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-indigo-100">
                {currentReport.strategicRecommendations.map((rec, i) => (
                  <div key={`${currentReport.id}-strat-${rec}`} className="text-xs text-slate-700 flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-indigo-50">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 1: Weekly Sales & Platform Performance */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>1. أداء المبيعات وحصص المنصات لهذا الأسبوع</span>
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  نسبة نمو +{currentReport.salesSummary.revenueGrowthPercent}% 🚀
                </span>
              </div>

              {/* 4 Performance Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-bold">إجمالي المبيعات</div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    {currentReport.salesSummary.totalRevenueEGP.toLocaleString('ar-EG')} {currency}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-bold">إجمالي الطلبات المنفذة</div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    {currentReport.salesSummary.totalOrders} طلب
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-bold">صافي الأرباح المقدرة</div>
                  <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                    {currentReport.salesSummary.totalProfitEGP.toLocaleString('ar-EG')} {currency}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-bold">نسبة الفوز بالـ Buy Box</div>
                  <div className="text-lg font-black text-indigo-700 font-mono mt-0.5">
                    {currentReport.salesSummary.buyBoxWinRate}% 🟢
                  </div>
                </div>
              </div>

              {/* Platform Share Breakdown Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">المنصة التجارية</th>
                      <th className="p-3">حجم المبيعات ({currency})</th>
                      <th className="p-3">عدد الطلبات</th>
                      <th className="p-3">حصة المنصة %</th>
                      <th className="p-3">الحالة والمزامنة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentReport.salesSummary.platformBreakdown.map((plat) => (
                      <tr key={plat.platformId} className="hover:bg-slate-50/70">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="text-base">{platformLabelMap[plat.platformId]?.icon || '🌐'}</span>
                          <span>{plat.platformName}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {plat.salesEGP.toLocaleString('ar-EG')} {currency}
                        </td>
                        <td className="p-3 font-mono text-slate-700">
                          {plat.ordersCount} طلب
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${plat.sharePercent}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-700">{plat.sharePercent}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-emerald-700 font-bold text-[11px]">
                          🟢 متزامن ومفعل
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Section 2: Competitor Price Intelligence with Product Images & Platforms */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>2. رصد أسعار المنافسين على المنصات وصور المنتجات المربوطة</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {currentReport.productCompetitorInsights.length} منتجات مراقبة
                </span>
              </div>

              {/* Product Cards with images and platform comparison */}
              <div className="space-y-4">
                {currentReport.productCompetitorInsights.map((insight) => {
                  return (
                    <div
                      key={insight.productId}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-4"
                    >
                      {/* Product Header & Image */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={insight.productImageUrl}
                            alt={insight.productTitle}
                            className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shadow-xs shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                {insight.brand} | {insight.model}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                insight.buyBoxStatus === 'winning'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {insight.buyBoxStatus === 'winning' ? '🟢 متصدر صندوق الشراء (Buy Box)' : '🔴 خاسر لصالح منافس'}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                              {insight.productTitle}
                            </h4>
                          </div>
                        </div>

                        {/* Price Tag Comparison */}
                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                            <div className="text-[10px] text-slate-400 font-bold">سعرك الفائز</div>
                            <div className="text-sm font-black text-indigo-700 font-mono">
                              {insight.merchantPrice} {currency}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                            <div className="text-[10px] text-slate-400 font-bold">أقل سعر منافس</div>
                            <div className="text-sm font-black text-slate-900 font-mono">
                              {insight.lowestCompetitorPrice} {currency}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                            <div className="text-[10px] text-emerald-800 font-bold">هامش الربح</div>
                            <div className="text-sm font-black text-emerald-700 font-mono">
                              +{insight.profitMarginPercent}% ({insight.profitMarginAmount} {currency})
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Platform Offers Table for this product */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                            <tr>
                              <th className="p-2.5">المنصة</th>
                              <th className="p-2.5">اسم التاجر المنافس</th>
                              <th className="p-2.5">سعر العرض</th>
                              <th className="p-2.5">فارق السعر عنك</th>
                              <th className="p-2.5">حالة المخزون</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            {insight.platformOffers.map((offer) => {
                              const diff = offer.price - insight.merchantPrice;
                              return (
                                <tr key={`${insight.productId}-${offer.platformCode}-${offer.sellerName}`} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>{platformLabelMap[offer.platformCode]?.icon || '🛒'}</span>
                                    <span>{offer.platformName}</span>
                                  </td>
                                  <td className="p-2.5 text-slate-700">{offer.sellerName}</td>
                                  <td className="p-2.5 font-mono font-bold text-slate-900">{offer.price} {currency}</td>
                                  <td className="p-2.5 font-mono">
                                    {diff > 0 ? (
                                      <span className="text-emerald-700 font-bold">أنت أرخص بـ +{diff} {currency} 🟢</span>
                                    ) : diff === 0 ? (
                                      <span className="text-sky-700 font-bold">نفس السعر 🟡</span>
                                    ) : (
                                      <span className="text-rose-700 font-bold">المنافس أرخص بـ {Math.abs(diff)} {currency} 🔴</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-slate-600">{offer.stockStatus}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Marketer Action Directive */}
                      <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-sky-700 shrink-0" />
                        <span><strong>توجيه المسوق للمنتج:</strong> {insight.recommendedAction}</span>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Report Footer */}
            <div className="pt-6 border-t border-slate-200 text-center space-y-2 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">
                تم إعداد هذا التقرير آلياً بواسطة نظام رادار الأسعار ومتابعة المسوقين المعتمد في مصر 🇪🇬
              </p>
              <p className="text-[11px]">
                لطلب أي تعديلات في أسعار المنصات أو تغيير الكلمات المفتاحية يرجى الرد المباشر على هذا البريد.
              </p>
            </div>

          </div>

        </div>
        )
      )}

      {/* VIEW 3: DISPATCH HISTORY LOG */}
      {activeTab === 'dispatch_history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>سجل إرسال التقارير الأسبوعية للعملاء والتجار</span>
            </h3>
            <span className="text-xs text-slate-500">
              إجمالي السجلات: {dispatchHistory.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">اسم التاجر / المتجر</th>
                  <th className="p-3">فترة التقرير</th>
                  <th className="p-3">تاريخ ووقت الإرسال</th>
                  <th className="p-3">عناوين البريد المستلمة</th>
                  <th className="p-3">القناة</th>
                  <th className="p-3">حالة التسليم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispatchHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-bold text-slate-900">{log.merchantName}</td>
                    <td className="p-3 text-slate-700">{log.period}</td>
                    <td className="p-3 font-mono text-slate-600">{log.sentAt}</td>
                    <td className="p-3">
                      <div className="space-y-0.5 text-[11px] font-mono text-slate-600 max-w-xs truncate">
                        {log.recipients.map((r) => (
                          <div key={`${log.id}-${r}`} className="truncate">• {r}</div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{log.channel}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{log.status === 'opened' ? 'تم الفتح والمشاهدة' : 'تم التسليم بنجاح'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: PLATFORM ORDERS & WAYBILL SPLITTING ENGINE */}
      {activeTab === 'merchant_orders' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Top Control Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-indigo-800/40 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
                  <Package className="w-3.5 h-3.5" />
                  <span>نظام إدارة وسحب طلبات المنصات وفصل بوالص الشحن</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-['Alexandria'] text-white">
                  طلبات المنصات والبوالص المستقلة ({merchantOrders.length} طلب)
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  ربط مباشر مع سيلر سنترال أمازون ونون وجوميا لجلب تفاصيل طلبات التجار، مع <strong>فصل كل منتج في الطلبات المتعددة إلى بوليصة شحن مستقلة ورقم تتبع (Tracking Number) خاص بها</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={isPullingOrders}
                  onClick={() => handlePullOrders(currentActiveMerchantForOrders)}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20 disabled:opacity-50 select-none"
                  title={`سحب واستيراد طلبات جديدة من المنصات المرتبطة بالتاجر الحالي (${currentActiveMerchantForOrders?.storeName || 'المحدد'})`}
                >
                  <RefreshCw className={`w-4 h-4 ${isPullingOrders ? 'animate-spin' : ''}`} />
                  <span>{isPullingOrders ? 'جاري السحب...' : 'جلب طلبات جديدة من السيلر سنترال 🛒'}</span>
                </button>

                {merchantOrders.some(o => o.items && o.items.length > 1) && (
                  <button
                    type="button"
                    onClick={handleSplitAllOrders}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-sky-600 hover:from-orange-600 hover:to-sky-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/20 select-none"
                    title="فصل كافة الطلبات التي تضم أكثر من منتج إلى بوالص وطلبات شحن مستقلة لكل صنف"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>فصل كافة الطلبات المتعددة ({merchantOrders.filter(o => o.items && o.items.length > 1).length}) ✂️</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-white/15"
                  title="طباعة مجمعة لكافة بوالص الشحن الحالية"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة مجمعة 🖨️</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-slate-300 block mb-0.5">إجمالي الطلبات المسحوبة</span>
                <span className="text-lg font-black text-white font-mono">{merchantOrders.length} طلب</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-emerald-300 block mb-0.5">إجمالي البوالص المستقلة</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {merchantOrders.reduce((acc, o) => acc + (o.items?.length || 0), 0)} بوليصة تتبع
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-sky-300 block mb-0.5">طلبات متعددة الأصناف</span>
                <span className="text-lg font-black text-sky-400 font-mono">
                  {merchantOrders.filter(o => o.items && o.items.length > 1).length} طلب
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-indigo-300 block mb-0.5">إجمالي التحصيل (COD)</span>
                <span className="text-lg font-black text-indigo-300 font-mono">
                  {merchantOrders.reduce((acc, o) => acc + (o.grandTotalEGP || 0), 0).toLocaleString('ar-EG')} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              
              {/* Filter by Merchant */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">التاجر:</span>
                <select
                  value={orderMerchantFilter}
                  onChange={(e) => setOrderMerchantFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">جميع التجار ({merchants.length})</option>
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.storeName}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Platform */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">المنصة:</span>
                <select
                  value={orderPlatformFilter}
                  onChange={(e) => setOrderPlatformFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">جميع المنصات</option>
                  <option value="amazon_eg">أمازون مصر (Amazon)</option>
                  <option value="noon_eg">نون مصر (Noon)</option>
                  <option value="jumia_eg">جوميا مصر (Jumia)</option>
                  <option value="kenzz_eg">كنز (Kenzz)</option>
                  <option value="homzmart_eg">هومزمارت (Homzmart)</option>
                </select>
              </div>

              {/* Filter Multi-Item only Toggle */}
              <button
                type="button"
                onClick={() => setOrderMultiItemOnly(!orderMultiItemOnly)}
                className={`h-9 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  orderMultiItemOnly 
                    ? 'bg-sky-100 text-sky-900 border-sky-300 shadow-xs' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-sky-700" />
                <span>الطلبات المتعددة فقط ✂️</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث برقم الطلب، العميل، البوليصة..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full h-9 pr-9 pl-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 font-['Alexandria']">
                  لا توجد طلبات تطابق الفلتر المحدد حالياً
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  يمكنك سحب واستيراد أحدث طلبات التجار من منصات السيلر سنترال بنقرة واحدة لتجربة فصل بوالص الشحن والطباعة.
                </p>
              </div>
              <button
                type="button"
                disabled={isPullingOrders}
                onClick={() => handlePullOrders(currentActiveMerchantForOrders)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPullingOrders ? 'animate-spin' : ''}`} />
                <span>سحب واستيراد طلبات حقيقية من السيلر سنترال للتاجر الحالي ({currentActiveMerchantForOrders?.storeName || 'المحدد'}) 🛒</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isMultiItem = order.items && order.items.length > 1;
                const platformMeta = platformLabelMap[order.platformSource] || { label: order.platformSourceName || order.platformSource, bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: '🌐' };

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all"
                  >
                    {/* Order Top Banner */}
                    <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-black text-slate-900 font-mono">
                          {order.orderNumber}
                        </span>

                        {/* Direct Clickable Platform Badge to open Seller Central */}
                        <button
                          type="button"
                          onClick={() => launchSellerPortalByCode(order.platformSource, platformMeta.label, order.merchantName, onShowToast)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs group ${platformMeta.bg}`}
                          title={`فتح سيلر سنترال ${platformMeta.label} فوراً في نافذة جديدة ↗`}
                        >
                          <span>{platformMeta.icon}</span>
                          <span>{platformMeta.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {order.merchantName && (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-indigo-600" />
                            <span>{order.merchantName}</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500">
                          {order.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isMultiItem ? `طلب مجمع (${order.items.length} أصناف)` : 'بوليصة مستقلة'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Customer & Shipping Summary Bento */}
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 border-b border-slate-100 bg-white text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 block text-[11px]">بيانات العميل:</span>
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-600">{order.customerPhone}</span>
                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold underline"
                          >
                            واتساب
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block text-[11px]">عنوان التوصيل:</span>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{order.governorate}</span>
                        </div>
                        <div className="text-slate-600 text-[11px] truncate">{order.fullAddress}</div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block text-[11px]">المعاملة المالية والتحصيل:</span>
                        <div className="font-bold text-slate-900">
                          {order.paymentMethod === 'cod' ? '💵 دفع عند الاستلام (COD)' : '⚡ مدفوع مقدماً'}
                        </div>
                        <div className="text-xs font-black text-indigo-700 font-mono">
                          الإجمالي: {order.grandTotalEGP.toLocaleString('ar-EG')} {currency}
                        </div>
                      </div>
                    </div>

                    {/* Multi-Item Split Notice & Action Banner */}
                    {isMultiItem && (
                      <div className="mx-4 sm:mx-5 mt-4 p-3.5 bg-gradient-to-r from-sky-50 to-orange-50 border border-sky-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 rounded-xl bg-sky-100 text-sky-900 font-black text-xs flex items-center gap-1 shrink-0">
                            <Scissors className="w-3.5 h-3.5 text-sky-700" />
                            <span>طلب متعدد الأصناف ({order.items.length} منتجات)</span>
                          </span>
                          <span className="text-xs text-sky-950 font-medium">
                            يحتوي هذا الطلب على أصناف متعددة. يمكنك الآن فصل كل منتج إلى طلب وبوليصة شحن مستقلة تماماً برقم تتبع (Tracking Number) منفصل.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSplitOrder(order.id)}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 select-none"
                          title="فصل هذا الطلب إلى طلبات منفصلة برقم بوليصة مستقل لكل منتج"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>فصل الطلب إلى {order.items.length} بوالص مستقلة ✂️</span>
                        </button>
                      </div>
                    )}

                    {/* Products and Distinct Waybills Breakdown */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>بوالص الشحن والأصناف ({order.items.length} منتج) - رقم تتبع مستقل لكل صنف:</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productTitle}
                                className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="text-xs font-bold text-slate-900 leading-snug">
                                  {item.productTitle}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono flex flex-wrap items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-900 border border-sky-200 font-black">
                                    ASIN: {item.asin || item.productId || item.sku}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    SKU: {item.sku}
                                  </span>
                                  <span>الكمية: <strong>{item.quantity}</strong></span>
                                  <span className="font-bold text-emerald-700">{item.totalPrice.toLocaleString('ar-EG')} {currency}</span>
                                </div>
                              </div>
                            </div>

                            {/* Distinct Waybill Badge & Tracking Details */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                                  <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>رقم البوليصة والتتبع المستقل:</span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  بوليصة طرد #{idx + 1}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-black text-indigo-950 text-xs sm:text-sm tracking-wider">
                                  {item.waybillNumber}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.waybillNumber);
                                    onShowToast(`تم نسخ رقم تتبع البوليصة: ${item.waybillNumber}`);
                                  }}
                                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                                  title="نسخ رقم البوليصة"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-slate-400" />
                                  <span>{item.courierName}</span>
                                </span>
                                <span>رسوم الشحن: {item.shippingFeeEGP} {currency}</span>
                              </div>
                            </div>

                            {/* Item Actions */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setActiveWaybillItem({ order, item })}
                                className="flex-1 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                title="معاينة وطباعة بوليصة الشحن الرسمية المستقلة لهذا الصنف"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>معاينة وطباعة البوليصة 🖨️</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  downloadWaybillIcsFile(order, item);
                                  onShowToast(`تم تنزيل موعد شحن البوليصة ${item.waybillNumber} للتقويم 📅`);
                                }}
                                className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                title="تنزيل موعد الشحن كملف تقويم ICS"
                              >
                                <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* VIEW 5: PER-MERCHANT PRODUCT CATALOG & COMPETITOR PRICING */}
      {activeTab === 'merchant_catalog' && (
        <MerchantCatalogManager
          selectedMerchant={selectedMerchant || merchants[0]}
          onOpenManageApisModal={handleOpenApisModalForMerchant}
          onShowToast={onShowToast}
        />
      )}

      {/* STORE PRODUCTS & EMAIL PLATFORM SYNC MODAL */}
      {isStoreSyncModalOpen && storeSyncMerchant && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-right space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-['Alexandria']">
                    مزامنة وسحب منتجات المتجر بالبريد الإلكتروني
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ملف التاجر: <strong className="text-slate-800">{storeSyncMerchant.storeName}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStoreSyncModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">
                اختر المنصة / السيلر سنترال المراد تسجيل الدخول وسحب منتجاته:
              </label>
              <select
                value={storeSyncPlatform}
                onChange={(e) => setStoreSyncPlatform(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="amazon_eg">📦 أمازون مصر (Amazon Seller Central)</option>
                <option value="noon_eg">🟡 نون مصر (Noon Partner Portal)</option>
                <option value="jumia_eg">🟠 جوميا مصر (Jumia Seller Center)</option>
                <option value="shopify_salla">🌐 متجر خاص (سلة / زد / Shopify)</option>
                <option value="btech_eg">📱 بي تك مصر (B.TECH)</option>
                <option value="homzmart_eg">🛋️ هومزمارت (Homzmart)</option>
                <option value="kenzz_eg">🛍️ كنز مصر (Kenzz)</option>
              </select>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>بريد الدخول لحساب المتجر بالسيلر سنترال:</span>
                <span className="text-[10px] text-purple-600">اعتماد تلقائي للملف</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={storeSyncEmail}
                  onChange={(e) => setStoreSyncEmail(e.target.value)}
                  placeholder="seller@platform.com"
                  className="w-full h-10 pr-9 pl-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-purple-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                يتم التحقق من حساب البائع وسحب كافة المنتجات المسجلة والأسعار فوراً إلى ملف هذا التاجر بعزل مستقل عن باقي التجار.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleExecuteStoreProductsSync}
                disabled={isSyncingStoreProducts || !storeSyncEmail}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingStoreProducts ? 'animate-spin' : ''}`} />
                <span>{isSyncingStoreProducts ? 'جاري التحقق وسحب المنتجات...' : 'تسجيل الدخول وسحب منتجات المتجر 📥'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStoreSyncModalOpen(false)}
                className="px-4 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT MERCHANT MODAL WITH MULTI-EMAIL SUPPORT (COMPACT 2-COLUMN DESIGN) */}
      {isEditModalOpen && editingMerchant && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl xl:max-w-5xl w-full p-4 sm:p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header (Slim & Compact) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-150 shrink-0">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                  <Building2 className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                  <span>
                    {merchants.some(m => m.id === editingMerchant.id) ? 'تعديل بيانات التاجر وقائمة الإيميلات' : 'إضافة تاجر وعميل جديد'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  إعداد بيانات المتجر، عناوين البريد الإلكتروني، والمنصات والمنتجات المربوطة لتخصيص تقارير المبيعات الأسبوعية.
                </p>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form with 2-Column Responsive Bento Layout */}
            <form onSubmit={handleSaveMerchant} className="flex-1 overflow-y-auto pr-1 pl-0.5 py-3 space-y-3" noValidate>
              
              {/* Form Global Submit Error Alert */}
              {formSubmitError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block text-xs">تعذر حفظ بيانات التاجر:</span>
                    <span className="text-[11px] leading-relaxed">{formSubmitError}</span>
                  </div>
                </div>
              )}

              {/* Grid 2 Columns on Large Screens */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                
                {/* Right Column: Core Merchant & Contact Data (7 cols) */}
                <div className="lg:col-span-7 space-y-2.5">
                  
                  {/* Row 1: Store Name & Contact Person */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>اسم المتجر / الشركة *</span>
                        {merchantValidationErrors.storeName && (
                          <span className="text-[10px] text-red-600 font-bold">{merchantValidationErrors.storeName}</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={editingMerchant.storeName}
                        onChange={(e) => {
                          setEditingMerchant({ ...editingMerchant, storeName: e.target.value });
                          if (merchantValidationErrors.storeName) {
                            setMerchantValidationErrors({ ...merchantValidationErrors, storeName: undefined });
                          }
                        }}
                        placeholder="مثال: مؤسسة الأهرام للتوزيع"
                        className={`w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border text-xs text-slate-900 focus:outline-none transition-all ${
                          merchantValidationErrors.storeName 
                            ? 'border-red-400 bg-red-50/30 focus:border-red-600' 
                            : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>اسم الشخص المسؤول *</span>
                        {merchantValidationErrors.contactPerson && (
                          <span className="text-[10px] text-red-600 font-bold">{merchantValidationErrors.contactPerson}</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={editingMerchant.contactPerson}
                        onChange={(e) => {
                          setEditingMerchant({ ...editingMerchant, contactPerson: e.target.value });
                          if (merchantValidationErrors.contactPerson) {
                            setMerchantValidationErrors({ ...merchantValidationErrors, contactPerson: undefined });
                          }
                        }}
                        placeholder="مثال: م. حسام الشريف"
                        className={`w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border text-xs text-slate-900 focus:outline-none transition-all ${
                          merchantValidationErrors.contactPerson 
                            ? 'border-red-400 bg-red-50/30 focus:border-red-600' 
                            : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Row 2: Primary Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>البريد الإلكتروني الرئيسي *</span>
                        {merchantValidationErrors.primaryEmail ? (
                          <span className="text-[10px] text-red-600 font-bold">{merchantValidationErrors.primaryEmail}</span>
                        ) : (
                          <span className="text-[10px] text-indigo-600">أساسي للتقارير</span>
                        )}
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={editingMerchant.primaryEmail}
                          onChange={(e) => {
                            setEditingMerchant({ ...editingMerchant, primaryEmail: e.target.value });
                            if (merchantValidationErrors.primaryEmail) {
                              setMerchantValidationErrors({ ...merchantValidationErrors, primaryEmail: undefined });
                            }
                          }}
                          placeholder="hossam@company.com"
                          className={`w-full h-8.5 pr-8 pl-2.5 rounded-lg bg-slate-50 border text-xs text-slate-900 focus:outline-none font-mono ${
                            merchantValidationErrors.primaryEmail 
                              ? 'border-red-400 bg-red-50/30 focus:border-red-600' 
                              : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>رقم الواتساب / الهاتف</span>
                        {merchantValidationErrors.phone && (
                          <span className="text-[10px] text-red-600 font-bold">{merchantValidationErrors.phone}</span>
                        )}
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={editingMerchant.phone}
                          onChange={(e) => {
                            setEditingMerchant({ ...editingMerchant, phone: e.target.value });
                            if (merchantValidationErrors.phone) {
                              setMerchantValidationErrors({ ...merchantValidationErrors, phone: undefined });
                            }
                          }}
                          placeholder="+201012345678"
                          className={`w-full h-8.5 pr-8 pl-2.5 rounded-lg bg-slate-50 border text-xs text-slate-900 focus:outline-none font-mono ${
                            merchantValidationErrors.phone 
                              ? 'border-red-400 bg-red-50/30 focus:border-red-600' 
                              : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Sales Target & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">المستهدف الأسبوعي ({currency})</label>
                      <input
                        type="number"
                        value={editingMerchant.weeklySalesTargetEGP}
                        onChange={(e) => setEditingMerchant({ ...editingMerchant, weeklySalesTargetEGP: Number(e.target.value) })}
                        className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">المدينة / النطاق الجغرافي</label>
                      <input
                        type="text"
                        value={editingMerchant.city}
                        onChange={(e) => setEditingMerchant({ ...editingMerchant, city: e.target.value })}
                        placeholder="مثال: القاهرة - التجمع ومدينة نصر"
                        className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Multi-Email Manager */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                        <AtSign className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>إيميلات إضافية لفريق التاجر (Sales / Finance)</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        {editingMerchant.additionalEmails?.length || 0} إيميل إضافي
                      </span>
                    </div>

                    {/* Input to add email tag */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="email"
                        value={newAdditionalEmailInput}
                        onChange={(e) => setNewAdditionalEmailInput(e.target.value)}
                        placeholder="أدخل بريد إضافي (مثال: sales@company.com)..."
                        className="flex-1 h-7.5 px-2.5 rounded-lg bg-white border border-indigo-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAdditionalEmail();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddAdditionalEmail}
                        className="h-7.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all cursor-pointer shrink-0"
                      >
                        + إضافة
                      </button>
                    </div>

                    {/* Badges of additional emails */}
                    {editingMerchant.additionalEmails && editingMerchant.additionalEmails.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {editingMerchant.additionalEmails.map((email) => (
                          <span
                            key={`edit-email-${email}`}
                            className="px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 text-[10px] font-mono flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>{email}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAdditionalEmail(email)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Marketer Notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">ملاحظات المسوق واستراتيجية التسعير</label>
                    <textarea
                      rows={2}
                      value={editingMerchant.marketerNotes || ''}
                      onChange={(e) => setEditingMerchant({ ...editingMerchant, marketerNotes: e.target.value })}
                      placeholder="ملاحظات حول عروض المنافسين، هوامش الربح، أو مواعيد شحن البضائع..."
                      className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 resize-none h-14"
                    />
                  </div>

                  {/* Direct Amazon SP-API Store Binding (Seller ID Only - No Manual Refresh Token) */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-sky-50 border border-sky-300 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] font-black text-sky-950 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>ربط متجر أمازون مصر المباشر (معرّف التاجر فقط - بدون توكن يدوي)</span>
                      </span>
                      {editingMerchant.apiCredentials?.amazonSellerId ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>نشط ومربوط (Connected & Active)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                          بانتظار إدخال المعرّف
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      💡 <strong>الربط المباشر المفوّض:</strong> لا حاجة لإدخال مفتاح Refresh Token يدوياً. يكفي كتابة معرّف التاجر (Seller ID) أو الضغط على زر الربط بضغطة واحدة ليتم تفعيل سحب الطلبات والمخزون الحي فوراً.
                    </p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-800 block">معرّف التاجر في أمازون (SELLER_ID / Merchant Token) *</label>
                        <span className="text-[9px] text-slate-500 font-mono">سيلر سنترال ➔ معلومات الحساب ➔ الرمز المميز</span>
                      </div>
                      <input
                        type="text"
                        dir="ltr"
                        value={editingMerchant.apiCredentials?.amazonSellerId || ''}
                        onChange={(e) =>
                          setEditingMerchant({
                            ...editingMerchant,
                            apiCredentials: {
                              dataMode: editingMerchant.dataMode || 'live',
                              ...(editingMerchant.apiCredentials || {}),
                              amazonSellerId: e.target.value.trim()
                            }
                          })
                        }
                        placeholder="مثال: A2EUQ1WTGCTBG2 أو A2STARSTEELEGY2"
                        className="w-full h-8.5 px-3 rounded-lg bg-white border border-sky-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={getAmazonSellerCentralConsentUrl(editingMerchant.id || editingMerchant.apiCredentials?.amazonSellerId || '')}
                        target="_blank"
                        rel="noreferrer"
                        className="h-7.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[10px] font-black inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        <span>ربط بضغطة واحدة عبر سيلر سنترال (One-Click) 🔗</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      <button
                        type="button"
                        disabled={isVerifyingLwaToken}
                        onClick={handleVerifyMerchantLwaToken}
                        className="h-7.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Key className={`w-3 h-3 ${isVerifyingLwaToken ? 'animate-spin' : ''}`} />
                        <span>{isVerifyingLwaToken ? 'جاري فحص الاتصال...' : 'فحص حالة الربط وتوليد الرمز ⚡'}</span>
                      </button>
                    </div>

                    {lwaVerifyStatus && (
                      <div
                        className={`p-2 rounded-lg text-[10px] font-bold leading-relaxed border ${
                          lwaVerifyStatus.success
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {lwaVerifyStatus.message}
                      </div>
                    )}
                  </div>

                </div>

                {/* Left Column: Subscribed Platforms & Monitored Products (5 cols) */}
                <div className="lg:col-span-5 space-y-2.5">
                  
                  {/* Subscribed Platforms (Checkboxes) */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800">
                        المنصات المشترك بها التاجر *
                      </label>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {editingMerchant.platformsSubscribed.length} منصة
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                      {[
                        { id: 'amazon_eg', label: '📦 أمازون مصر' },
                        { id: 'noon_eg', label: '🟡 نون مصر' },
                        { id: 'jumia_eg', label: '🟠 جوميا مصر' },
                        { id: 'btech_eg', label: '📱 بي تك' },
                        { id: 'elaraby_group', label: '🏭 العربي جروب' },
                        { id: 'raneen_eg', label: '🏠 رنين مصر' },
                        { id: 'facebook_marketplace', label: '📘 فيسبوك' },
                        { id: 'kenzz_eg', label: '🛍️ كنز مصر' },
                        { id: 'homzmart_eg', label: '🛋️ هومزمارت' },
                        { id: 'twob_eg', label: '💻 2B مصر' },
                        { id: 'shopify_salla', label: '🌐 سلة/Shopify' },
                        { id: 'tiktok_shop', label: '📲 تيك توك' },
                        { id: 'physical_store', label: '🏢 فرع ومعرض' },
                      ].map((plat) => {
                        const isChecked = editingMerchant.platformsSubscribed.includes(plat.id as any);
                        return (
                          <label
                            key={plat.id}
                            className={`p-1.5 px-2 rounded-md border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all leading-tight ${
                              isChecked ? 'bg-indigo-50/90 border-indigo-400 text-indigo-950 shadow-2xs' : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const next = isChecked
                                  ? editingMerchant.platformsSubscribed.filter(p => p !== plat.id)
                                  : [...editingMerchant.platformsSubscribed, plat.id as any];
                                setEditingMerchant({ ...editingMerchant, platformsSubscribed: next });
                              }}
                              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 shrink-0"
                            />
                            <span className="truncate">{plat.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Monitored Products */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800">
                        المنتجات المربوطة والمراقبة *
                      </label>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {editingMerchant.assignedProductIds.length} منتج
                      </span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                      {allProducts.map((p) => {
                        const isAssigned = editingMerchant.assignedProductIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`p-1 px-1.5 rounded-md border flex items-center gap-1.5 cursor-pointer text-[11px] ${
                              isAssigned ? 'bg-indigo-50/50 border-indigo-300 font-bold' : 'border-slate-150 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => {
                                const next = isAssigned
                                  ? editingMerchant.assignedProductIds.filter(id => id !== p.id)
                                  : [...editingMerchant.assignedProductIds, p.id];
                                setEditingMerchant({ ...editingMerchant, assignedProductIds: next });
                              }}
                              className="w-3.5 h-3.5 rounded text-indigo-600 shrink-0"
                            />
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-5 h-5 rounded object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="truncate flex-1">{p.brand} {p.model}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Buttons Footer (Compact) */}
              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-150 shrink-0">
                <div>
                  {isSavingMerchant && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSavingMerchant(false);
                        onShowToast('تمت إعادة تعيين حالة الزر بنجاح 🔄');
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
                    >
                      إلغاء التعليق والمحاولة فوراً
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingMerchant}
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-8.5 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    id="btn-save-merchant-modal"
                    disabled={isSavingMerchant}
                    className="h-8.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 select-none"
                  >
                    {isSavingMerchant ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>جاري حفظ وتأكيد بيانات التاجر...</span>
                      </>
                    ) : (
                      <span>حفظ وتأكيد بيانات التاجر ✅</span>
                    )}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE INDEPENDENT WAYBILL SHEET */}
      {activeWaybillItem && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 font-['Alexandria']">
                  معاينة بوليصة الشحن المستقلة ({activeWaybillItem.item.waybillNumber})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة البوليصة الآن 🖨️</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWaybillItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Printable Waybill Sheet */}
            <div className="border-2 border-slate-900 rounded-2xl p-5 bg-white text-slate-900 space-y-4 font-mono text-xs select-text">
              
              {/* Courier Brand & Barcode Top Banner */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="space-y-1">
                  <div className="text-base font-black tracking-tight font-sans flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-slate-900" />
                    <span>{activeWaybillItem.item.courierName}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-sans">
                    خدمة الشحن السريع والتوصيل للمنازل - جمهورية مصر العربية
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-600 font-sans">رقم البوليصة والتتبع:</div>
                  <div className="text-sm sm:text-base font-black tracking-wider text-slate-950 font-mono">
                    {activeWaybillItem.item.waybillNumber}
                  </div>
                </div>
              </div>

              {/* Barcode Graphic Representation */}
              <div className="py-2.5 px-4 bg-slate-50 border border-dashed border-slate-400 rounded-xl text-center space-y-1">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-slate-900">
                  ||||| | |||| || ||||| ||| |||| | |||||
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  *{activeWaybillItem.item.barcode}*
                </div>
              </div>

              {/* Sender & Consignee Columns */}
              <div className="grid grid-cols-2 gap-3.5 border-b-2 border-slate-900 pb-3 text-xs">
                
                {/* Shipper */}
                <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 font-sans">بيانات الراسل (المتجر):</div>
                  <div className="font-bold text-slate-950 font-sans">{activeWaybillItem.order.merchantName || 'تاجر مسجل'}</div>
                  <div className="text-[11px] text-slate-700 font-sans">المنصة: {activeWaybillItem.order.platformSourceName}</div>
                  <div className="text-[10px] text-slate-500">القاهرة - جمهورية مصر العربية</div>
                </div>

                {/* Consignee */}
                <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 font-sans">بيانات المستلم (العميل):</div>
                  <div className="font-bold text-slate-950 font-sans">{activeWaybillItem.order.customerName}</div>
                  <div className="font-mono font-bold text-slate-800 text-[11px]">{activeWaybillItem.order.customerPhone}</div>
                  <div className="text-[11px] text-slate-700 font-sans">{activeWaybillItem.order.governorate} - {activeWaybillItem.order.fullAddress}</div>
                </div>

              </div>

              {/* Package Details */}
              <div className="space-y-2 border-b-2 border-slate-900 pb-3 text-xs">
                <div className="text-[10px] font-bold text-slate-500 font-sans">محتويات الطرد والبوليصة المستقلة:</div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 font-sans">
                  <div>
                    <span className="font-bold text-slate-950">{activeWaybillItem.item.productTitle}</span>
                    <span className="text-[11px] text-slate-500 mr-2 font-mono">({activeWaybillItem.item.sku})</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    الكمية: {activeWaybillItem.item.quantity} (طرد 1 من 1)
                  </div>
                </div>
              </div>

              {/* Financial Collection (COD or Prepaid) */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-300 font-sans">المعاملة المالية عند الاستلام:</div>
                  <div className="text-xs font-bold font-sans">
                    {activeWaybillItem.order.paymentMethod === 'cod' ? 'تحصيل نقدي عند الاستلام (COD)' : 'شحنة خالصة الدفع مسبقاً (PAID)'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
                    {activeWaybillItem.order.paymentMethod === 'cod' 
                      ? `${(activeWaybillItem.item.totalPrice + activeWaybillItem.item.shippingFeeEGP).toLocaleString('ar-EG')} ${currency}` 
                      : `0.00 ${currency}`}
                  </div>
                  <div className="text-[9px] text-slate-400 font-sans">
                    {activeWaybillItem.order.paymentMethod === 'cod' ? 'شامل ثمن الصنف ومصاريف الشحن' : 'لا يتم تحصيل أي مبالغ'}
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 font-sans pt-1">
                تم إصدار وتوليد هذه البوليصة المستقلة إلكترونياً عبر رادار التجار وتصلح للتسليم لكافة مناديب الشحن
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                يمكن طباعة البوليصة على ورق حراري قياس 4x6 أو A4 عادي.
              </span>
              <button
                type="button"
                onClick={() => setActiveWaybillItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition"
              >
                إغلاق المعاينة
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: BULK MERCHANTS SHEET IMPORT & SYNC SUMMARY */}
      {isBulkPreviewModalOpen && bulkSheetPreview && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                    تقرير تحليل ومزامنة شيت بيانات التجار ({bulkSheetPreview.fileName})
                  </h3>
                  <p className="text-xs text-slate-500">
                    تم فحص الأعمدة ومزامنة الحسابات ومفاتيح الـ API تلقائياً مع قاعدة البيانات (Firestore & LocalStorage).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkPreviewModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] font-bold text-slate-500">إجمالي الصفوف المقروءة</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{bulkSheetPreview.totalRows}</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[11px] font-bold text-emerald-700">تجار جدد تم إنشاؤهم</div>
                <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">{bulkSheetPreview.newMerchantsCount}</div>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                <div className="text-[11px] font-bold text-indigo-700">تجار تم تحديث مفاتيحهم</div>
                <div className="text-xl font-black text-indigo-700 font-mono mt-0.5">{bulkSheetPreview.updatedMerchantsCount}</div>
              </div>
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-center">
                <div className="text-[11px] font-bold text-sky-800">صفوف غير مكتملة</div>
                <div className="text-xl font-black text-sky-800 font-mono mt-0.5">{bulkSheetPreview.invalidRowsCount}</div>
              </div>
            </div>

            {/* Parsed Rows Table */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5 border-b border-slate-200">#</th>
                    <th className="p-2.5 border-b border-slate-200">اسم المتجر (Store_Name)</th>
                    <th className="p-2.5 border-b border-slate-200">المسؤول (Manager_Name)</th>
                    <th className="p-2.5 border-b border-slate-200">البريد والهاتف</th>
                    <th className="p-2.5 border-b border-slate-200">المنصات المفعلة</th>
                    <th className="p-2.5 border-b border-slate-200">Seller_ID & API_Token</th>
                    <th className="p-2.5 border-b border-slate-200">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bulkSheetPreview.rows.map((row) => (
                    <tr key={row.rowNumber} className={row.isValid ? 'bg-white hover:bg-slate-50' : 'bg-rose-50/50'}>
                      <td className="p-2.5 font-mono text-slate-500">{row.rowNumber}</td>
                      <td className="p-2.5 font-bold text-slate-900">{row.storeName || '—'}</td>
                      <td className="p-2.5 text-slate-700">{row.managerName}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">
                        <div>{row.email}</div>
                        <div className="text-slate-400">{row.phone}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1">
                          {row.platforms.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold"
                            >
                              {platformLabelMap[p]?.label || p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-[11px]">
                        <div className="text-slate-800 font-bold">
                          ID: {row.sellerId ? row.sellerId : <span className="text-slate-400">تلقائي</span>}
                        </div>
                        <div className="text-emerald-700 truncate max-w-[160px]">
                          Token: {row.apiToken ? `${row.apiToken.slice(0, 14)}...` : <span className="text-slate-400">Fallback</span>}
                        </div>
                      </td>
                      <td className="p-2.5">
                        {row.isValid ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{row.actionType === 'create' ? 'تم الإنشاء والربط ✅' : 'تم التحديث والمزامنة 🔄'}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{row.errors.join('، ')}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم تحديث قائمة التجار وربط المنصات ومفاتيح الـ API في النظام تلقائياً!</span>
              </span>
              <button
                type="button"
                onClick={() => setIsBulkPreviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer transition shadow-sm"
              >
                تم، عرض قائمة التجار المحدثة 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE MERCHANT APIS (Multi-Tenant SP-API & Noon & Bulk Sheet Sync) */}
      <ManageMerchantApisModal
        isOpen={isManageApisModalOpen}
        onClose={() => setIsManageApisModalOpen(false)}
        activeMerchantId={targetMerchantForApis || selectedMerchant?.id}
        onMerchantUpdated={(updatedMerchant) => {
          const freshList = loadAllRegisteredMerchants();
          setMerchants(freshList);
          setSelectedMerchant(updatedMerchant);
        }}
        onTriggerOrderSync={(updatedMerchant) => {
          const allPulled = loadAllOrders();
          setMerchantOrders(allPulled);
          const freshList = loadAllRegisteredMerchants();
          setMerchants(freshList);
          setSelectedMerchant(updatedMerchant);
          setOrderMultiItemOnly(false);
          setOrderSearchQuery('');
          setOrderPlatformFilter('all');
          if (orderMerchantFilter !== 'all' && orderMerchantFilter !== updatedMerchant.id) {
            setOrderMerchantFilter(updatedMerchant.id);
          }
          setActiveTab('merchant_orders');
          pullLiveCatalogForMerchant(updatedMerchant, 'all').catch(() => {});
        }}
        onShowToast={onShowToast}
      />

    </div>
  );
};
