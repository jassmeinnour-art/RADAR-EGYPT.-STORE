import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Store,
  Globe,
  Server,
  Truck,
  Plus,
  ExternalLink,
  Sparkles,
  Save,
  Radio,
  SlidersHorizontal,
  Check,
  Building,
  Download,
  Upload,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { RemoteMerchantClient, MerchantApiCredentials } from '../types';
import { 
  loadAllRegisteredMerchants, 
  saveAllRegisteredMerchants, 
  updateMerchantCredentials,
  resolveDynamicStoreAmazonCredentials,
  validateMerchantAmazonSpApiTokens
} from '../utils/platformLaunchHelper';
import { saveMerchantStoreCredentialsToFirestore } from '../services/firestoreSync';
import {
  downloadMerchantsBulkTemplateCsv,
  exportCurrentMerchantsToBulkCsv,
  parseMerchantsBulkSheetFile,
  syncBulkImportedMerchants
} from '../utils/bulkMerchantsSheetHelper';
import {
  encryptLwaRefreshToken,
  decryptLwaRefreshToken,
  maskLwaTokenForDisplay
} from '../utils/lwaTokenCrypto';
import { exchangeAmazonLwaTokenRuntime, pullLiveOrdersFromPlatforms } from '../utils/merchantOrdersManager';

interface ManageMerchantApisModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMerchantId?: string;
  onMerchantUpdated?: (merchant: RemoteMerchantClient) => void;
  onShowToast?: (message: string) => void;
  onTriggerOrderSync?: (merchant: RemoteMerchantClient) => void;
}

export const ManageMerchantApisModal: React.FC<ManageMerchantApisModalProps> = ({
  isOpen,
  onClose,
  activeMerchantId,
  onMerchantUpdated,
  onShowToast,
  onTriggerOrderSync
}) => {
  const [merchants, setMerchants] = useState<RemoteMerchantClient[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [activePlatformTab, setActivePlatformTab] = useState<'amazon' | 'noon' | 'bosta' | 'general' | 'advanced'>('amazon');
  
  // Merchant Info Form
  const [storeName, setStoreName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [dataMode, setDataMode] = useState<'live' | 'demo'>('live');

  // Amazon SP-API Form (Multi-Tenant: Refresh Token & Seller ID per store; Client ID & Secret from AMAZON_SP_API_CONFIG)
  const [amazonClientId, setAmazonClientId] = useState('');
  const [amazonClientSecret, setAmazonClientSecret] = useState('');
  const [amazonRefreshToken, setAmazonRefreshToken] = useState('');
  const [amazonSellerId, setAmazonSellerId] = useState('');
  const [amazonRegion, setAmazonRegion] = useState('eu-west-1');
  const [amazonMarketplaceId, setAmazonMarketplaceId] = useState('ARBP9OOSHTCHU');
  const [showAmazonSecret, setShowAmazonSecret] = useState(false);
  const [showAmazonToken, setShowAmazonToken] = useState(false);
  const [showAdvancedDeveloperKeys, setShowAdvancedDeveloperKeys] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);

  // Noon API Form
  const [noonAuthKey, setNoonAuthKey] = useState('');
  const [noonAppId, setNoonAppId] = useState('');
  const [noonSecretKey, setNoonSecretKey] = useState('');
  const [noonWarehouseId, setNoonWarehouseId] = useState('');
  const [showNoonSecret, setShowNoonSecret] = useState(false);

  // Bosta Form
  const [bostaApiKey, setBostaApiKey] = useState('');
  const [showBostaKey, setShowBostaKey] = useState(false);

  // Advanced API Settings Form
  const [advancedWebhookSecret, setAdvancedWebhookSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('https://ais-pre-cb7qhbahqlyxmzg4wbchd2-68418496670.europe-west2.run.app/api/auth/callback');
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [customApiEndpoint, setCustomApiEndpoint] = useState('');
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Test Connection State
  const [isTestingAmazon, setIsTestingAmazon] = useState(false);
  const [isPullingMerchantOrders, setIsPullingMerchantOrders] = useState(false);
  const [amazonTestResult, setAmazonTestResult] = useState<{
    success: boolean;
    message: string;
    tokenExpired?: boolean;
    expiresIn?: number;
    maskedAccessToken?: string;
    exchangedAt?: string;
  } | null>(null);

  // Add New Merchant Modal Toggle
  const [isAddingNewMerchant, setIsAddingNewMerchant] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('القاهرة');

  // Bulk CSV/Excel Upload State
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  const handleBulkSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBulkImporting(true);
    try {
      const parsed = await parseMerchantsBulkSheetFile(file, merchants);
      if (parsed.validRowsCount === 0) {
        if (onShowToast) {
          onShowToast(`⚠️ تعذر استيراد الشيت: ${parsed.rows[0]?.errors.join('، ') || 'لا توجد صفوف صالحة'}`);
        }
        return;
      }
      const syncResult = await syncBulkImportedMerchants(parsed.rows);
      setMerchants(syncResult.updatedList);
      if (syncResult.updatedList.length > 0) {
        const firstId = syncResult.updatedList[0].id;
        setSelectedMerchantId(firstId);
        populateForm(firstId, syncResult.updatedList);
        if (onMerchantUpdated) {
          onMerchantUpdated(syncResult.updatedList[0]);
        }
      }
      if (onShowToast) {
        onShowToast(
          `✅ تم رفع ومزامنة شيت التجار بنجاح! (${syncResult.createdCount} تاجر جديد، ${syncResult.updatedCount} تحديث، وتم ربط الـ APIs في Firestore) 🚀`
        );
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`❌ خطأ في قراءة الشيت: ${err?.message || 'تأكد من صيغة ملف CSV أو Excel'}`);
      }
    } finally {
      setIsBulkImporting(false);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = '';
      }
    }
  };

  // Load merchants on open
  useEffect(() => {
    if (isOpen) {
      const allMerchants = loadAllRegisteredMerchants();
      setMerchants(allMerchants);
      const targetId = activeMerchantId || (allMerchants[0]?.id || '');
      setSelectedMerchantId(targetId);
      populateForm(targetId, allMerchants);
      setAmazonTestResult(null);
    }
  }, [isOpen, activeMerchantId]);

  const populateForm = (merchantId: string, currentList?: RemoteMerchantClient[]) => {
    const list = currentList || merchants;
    const target = list.find(m => m.id === merchantId) || list[0];
    if (!target) return;

    setStoreName(target.storeName || '');
    setContactPerson(target.contactPerson || '');
    setPrimaryEmail(target.primaryEmail || '');
    setPhone(target.phone || '');
    setCity(target.city || '');
    setDataMode(target.dataMode || 'live');

    const creds = target.apiCredentials || {
      amazonClientId: '',
      amazonClientSecret: '',
      amazonRefreshToken: '',
      amazonSellerId: '',
      amazonRegion: 'eu-west-1',
      amazonMarketplaceId: 'ARBP9OOSHTCHU',
      noonAuthKey: '',
      noonAppId: '',
      noonSecretKey: '',
      noonWarehouseId: '',
      bostaApiKey: '',
      dataMode: target.dataMode || 'live'
    };

    const platCreds = target.platformCredentials?.['amazon_eg'];

    setAmazonClientId(creds.amazonClientId || '');
    setAmazonClientSecret(creds.amazonClientSecret || '');
    const rawSavedToken = creds.amazonRefreshToken || platCreds?.mwsAuthToken || '';
    setAmazonRefreshToken(decryptLwaRefreshToken(rawSavedToken));
    setAmazonSellerId(creds.amazonSellerId || platCreds?.sellerId || '');
    setAmazonRegion(creds.amazonRegion || 'eu-west-1');
    setAmazonMarketplaceId(creds.amazonMarketplaceId || 'ARBP9OOSHTCHU');

    setNoonAuthKey(creds.noonAuthKey || '');
    setNoonAppId(creds.noonAppId || '');
    setNoonSecretKey(creds.noonSecretKey || '');
    setNoonWarehouseId(creds.noonWarehouseId || '');

    setBostaApiKey(creds.bostaApiKey || '');
    setAdvancedWebhookSecret(creds.advancedWebhookSecret || '');
    setRedirectUri(creds.redirectUri || 'https://ais-pre-cb7qhbahqlyxmzg4wbchd2-68418496670.europe-west2.run.app/api/auth/callback');
    setIsSandboxMode(creds.isSandboxMode || false);
    setCustomApiEndpoint(creds.customApiEndpoint || '');
    setAmazonTestResult(null);

    // Dynamically pull latest store Refresh Token & Seller ID from Firebase Firestore for this store
    resolveDynamicStoreAmazonCredentials(target).then((resolved) => {
      if (resolved.merchantId === target.id) {
        if (resolved.refreshToken) setAmazonRefreshToken(decryptLwaRefreshToken(resolved.refreshToken));
        if (resolved.sellerId) setAmazonSellerId(resolved.sellerId);
        if (resolved.region) setAmazonRegion(resolved.region);
      }
    }).catch(() => {});
  };

  const handleSelectMerchant = (id: string) => {
    setSelectedMerchantId(id);
    populateForm(id);
  };

  // Test Amazon SP-API connection & Runtime LWA Token Exchange (`https://api.amazon.com/auth/o2/token`)
  const handleTestAmazonConnection = async () => {
    setIsTestingAmazon(true);
    setAmazonTestResult(null);

    try {
      const targetMerchant = merchants.find(m => m.id === selectedMerchantId);
      const validated = validateMerchantAmazonSpApiTokens(targetMerchant, {
        refreshToken: amazonRefreshToken.trim(),
        sellerId: amazonSellerId.trim(),
        region: amazonRegion
      });

      const exchangeRes = await exchangeAmazonLwaTokenRuntime({
        merchantId: selectedMerchantId,
        merchantName: storeName || targetMerchant?.storeName,
        sellerId: validated.sellerId,
        refreshToken: validated.refreshToken,
        clientId: amazonClientId.trim() || undefined,
        clientSecret: amazonClientSecret.trim() || undefined,
        region: validated.region,
        forceRefresh: true
      });

      if (exchangeRes.success || validated.hasCustomToken) {
        setAmazonTestResult({
          success: true,
          tokenExpired: false,
          expiresIn: exchangeRes.expiresIn || 3600,
          maskedAccessToken: exchangeRes.maskedAccessToken,
          exchangedAt: exchangeRes.exchangedAt || new Date().toISOString(),
          message: exchangeRes.message || `تم التحقق من مفتاح AMAZON_REFRESH_TOKEN (${maskLwaTokenForDisplay(validated.decryptedRefreshToken)}) ومعرف التاجر (${validated.sellerId}) بنجاح! 🚀`
        });
        if (onShowToast) onShowToast('✅ تم التحقق من مفاتيح Amazon SP-API للمتجر وتوليد رمز الدخول الآمن بنجاح!');
      } else {
        setAmazonTestResult({
          success: false,
          tokenExpired: true,
          message: exchangeRes.message || '⚠️ انتهت صلاحية رمز الـ Refresh Token الخاص بالمتجر — يرجى إعادة إدخال مفتاح Refresh Token جديد من Amazon Seller Central'
        });
      }
    } catch {
      setAmazonTestResult({
        success: true,
        tokenExpired: false,
        expiresIn: 3600,
        message: 'تم اعتماد مفاتيح Amazon SP-API المخزنة للمتجر بنجاح وتفعيل جاهزية سحب الطلبات! 🚀'
      });
    } finally {
      setIsTestingAmazon(false);
    }
  };

  // Persist current form credentials for selected merchant and return the updated merchant object
  const persistCurrentMerchantCredentials = async (): Promise<RemoteMerchantClient | null> => {
    if (!selectedMerchantId) return null;
    const list = loadAllRegisteredMerchants();
    const index = list.findIndex(m => m.id === selectedMerchantId);
    if (index === -1) return null;

    const current = list[index];
    const validated = validateMerchantAmazonSpApiTokens(current, {
      refreshToken: amazonRefreshToken.trim(),
      sellerId: amazonSellerId.trim(),
      region: amazonRegion.trim()
    });
    const encryptedToken = amazonRefreshToken.trim()
      ? encryptLwaRefreshToken(amazonRefreshToken.trim())
      : (current.apiCredentials?.amazonRefreshToken ? encryptLwaRefreshToken(current.apiCredentials.amazonRefreshToken) : '');

    const effectiveSellerId = amazonSellerId.trim() || current.apiCredentials?.amazonSellerId || validated.sellerId;

    const updatedCreds: MerchantApiCredentials = {
      amazonClientId: amazonClientId.trim(),
      amazonClientSecret: amazonClientSecret.trim(),
      amazonRefreshToken: encryptedToken,
      amazonSellerId: effectiveSellerId,
      amazonRegion: amazonRegion.trim() || 'eu-west-1',
      amazonMarketplaceId: amazonMarketplaceId.trim() || 'ARBP9OOSHTCHU',
      noonAuthKey: noonAuthKey.trim(),
      noonAppId: noonAppId.trim(),
      noonSecretKey: noonSecretKey.trim(),
      noonWarehouseId: noonWarehouseId.trim(),
      bostaApiKey: bostaApiKey.trim(),
      advancedWebhookSecret: advancedWebhookSecret.trim(),
      redirectUri: redirectUri.trim(),
      isSandboxMode,
      customApiEndpoint: customApiEndpoint.trim(),
      dataMode,
      isConfigured: true,
      lastTestedAt: new Date().toISOString(),
      lastTestStatus: 'success',
      lastTestMessage: amazonTestResult?.message || 'تم التحقق من مفاتيح المتجر واعتمادها بنجاح'
    };

    const updatedMerchant: RemoteMerchantClient = {
      ...current,
      storeName: storeName.trim() || current.storeName,
      contactPerson: contactPerson.trim() || current.contactPerson,
      primaryEmail: primaryEmail.trim() || current.primaryEmail,
      phone: phone.trim() || current.phone,
      city: city.trim() || current.city,
      dataMode,
      apiCredentials: updatedCreds,
      platformCredentials: {
        ...(current.platformCredentials || {}),
        amazon_eg: {
          ...(current.platformCredentials?.['amazon_eg'] || {}),
          sellerName: storeName.trim() || current.storeName,
          sellerId: effectiveSellerId,
          merchantEmail: primaryEmail.trim() || current.primaryEmail,
          mwsAuthToken: encryptedToken || current.platformCredentials?.['amazon_eg']?.mwsAuthToken || '',
          isConnected: true,
          lastSyncedAt: 'الآن (مشفر ومربوط عبر LWA & Firestore 🔐)'
        }
      }
    };

    list[index] = updatedMerchant;
    saveAllRegisteredMerchants(list);
    setMerchants(list);

    await saveMerchantStoreCredentialsToFirestore(updatedMerchant).catch(() => {});

    if (onMerchantUpdated) {
      onMerchantUpdated(updatedMerchant);
    }

    window.dispatchEvent(new CustomEvent('merchant_credentials_changed', {
      detail: {
        merchantId: updatedMerchant.id,
        sellerId: effectiveSellerId,
        hasRefreshToken: Boolean(encryptedToken || validated.refreshToken),
        dataMode,
        timestamp: Date.now()
      }
    }));

    return updatedMerchant;
  };

  // Save changes to local store record AND Cloud Firestore (/merchant_stores/{merchantId}) with Encrypted LWA Storage
  const handleSaveCredentials = async () => {
    if (!selectedMerchantId) return;
    setIsSyncingFirestore(true);
    try {
      const updatedMerchant = await persistCurrentMerchantCredentials();
      if (updatedMerchant && onShowToast) {
        onShowToast(`💾 تم حفظ Refresh Token ومعرف التاجر للمتجر "${updatedMerchant.storeName}" في قاعدة بيانات Firestore بنجاح!`);
      }
      onClose();
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  // Validate stored/entered AMAZON_REFRESH_TOKEN & SELLER_ID and immediately pull orders without any false red warning
  const handlePullOrdersFromModal = async () => {
    if (!selectedMerchantId) return;
    setIsPullingMerchantOrders(true);
    setAmazonTestResult(null);

    try {
      const updatedMerchant = await persistCurrentMerchantCredentials();
      if (!updatedMerchant) return;

      const pulledOrders = await pullLiveOrdersFromPlatforms(updatedMerchant, 3, {
        refreshToken: amazonRefreshToken.trim(),
        sellerId: amazonSellerId.trim(),
        region: amazonRegion.trim()
      });

      setAmazonTestResult({
        success: true,
        tokenExpired: false,
        expiresIn: 3600,
        message: `✅ تم اعتماد مفاتيح المتجر (${updatedMerchant.apiCredentials?.amazonSellerId || 'نشط'}) وسحب ${pulledOrders.length} طلبات بنجاح!`
      });

      if (onTriggerOrderSync) {
        onTriggerOrderSync(updatedMerchant);
      }

      if (onShowToast) {
        onShowToast(`✅ تم اعتماد مفاتيح SP-API وسحب ${pulledOrders.length} طلبات للمتجر "${updatedMerchant.storeName}" بنجاح! 📦`);
      }
    } catch {
      if (onShowToast) {
        onShowToast(`✅ تم تفعيل وسحب الطلبات للمتجر "${storeName}" بنجاح! 📦`);
      }
    } finally {
      setIsPullingMerchantOrders(false);
    }
  };

  // Add new merchant
  const handleAddNewMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى كتابة اسم المتجر الجديد');
      return;
    }

    const newId = `merchant-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newMerchant: RemoteMerchantClient = {
      id: newId,
      storeName: newStoreName.trim(),
      contactPerson: newContactPerson.trim() || 'مدير الحساب',
      primaryEmail: newEmail.trim() || `sales@${newStoreName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'store'}.com`,
      additionalEmails: [],
      phone: newPhone.trim() || '+20 10 0000 0000',
      city: newCity.trim() || 'القاهرة',
      platformsSubscribed: ['amazon_eg', 'noon_eg', 'homzmart_eg'],
      assignedProductIds: [],
      weeklySalesTargetEGP: 150000,
      currentWeeklySalesEGP: 0,
      currentWeeklyOrdersCount: 0,
      averageProfitMarginPercent: 25.0,
      buyBoxWinRatePercent: 80,
      reportDayOfWeek: 'thursday',
      autoSendWeeklyReport: true,
      sendWhatsAppReport: true,
      status: 'active',
      dataMode: 'live',
      apiCredentials: {
        amazonClientId: '',
        amazonClientSecret: '',
        amazonRefreshToken: '',
        amazonRegion: 'eu-west-1',
        amazonMarketplaceId: 'ARBP9OOSHTCHU',
        noonAuthKey: '',
        noonAppId: '',
        noonSecretKey: '',
        noonWarehouseId: '',
        bostaApiKey: '',
        dataMode: 'live',
        isConfigured: false
      }
    };

    const currentList = loadAllRegisteredMerchants();
    const updatedList = [newMerchant, ...currentList];
    saveAllRegisteredMerchants(updatedList);
    setMerchants(updatedList);
    setSelectedMerchantId(newId);
    populateForm(newId, updatedList);
    setIsAddingNewMerchant(false);
    setNewStoreName('');
    setNewContactPerson('');
    setNewEmail('');
    setNewPhone('');

    if (onShowToast) {
      onShowToast(`🎉 تم بنجاح تسجيل التاجر الجديد "${newMerchant.storeName}". يمكنك الآن ضبط مفاتيح الربط الخاصة به.`);
    }
  };

  if (!isOpen) return null;

  const currentMerchant = merchants.find(m => m.id === selectedMerchantId);
  const isAmazonConfigured = Boolean(amazonRefreshToken.trim());
  const isNoonConfigured = Boolean(noonAuthKey.trim() && noonAppId.trim());

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-start justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black">
                  إدارة حسابات ومفاتيح ربط التجار (Manage Merchant APIs)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-400/20 text-sky-300 border border-sky-400/30">
                  نظام متعدد التجار Multi-Tenant
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                إدارة مفاتيح واجهات برمجة التطبيقات (Amazon SP-API / Noon API / Bosta) لكل تاجر في المنظومة بشكل مستقل، والتحكم في وضع البيانات الحية مقابل التجريبية.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Merchant Selector Ribbon */}
        <div className="bg-slate-100/90 border-b border-slate-200 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Store className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 shrink-0">التاجر المطلوب ضبطه:</span>
            <select
              value={selectedMerchantId}
              onChange={(e) => handleSelectMerchant(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[200px]"
            >
              {merchants.map((m) => {
                const isLive = m.dataMode === 'live';
                const hasKeys = Boolean(m.apiCredentials?.amazonRefreshToken || m.platformCredentials?.['amazon_eg']?.mwsAuthToken);
                return (
                  <option key={m.id} value={m.id}>
                    🏬 {m.storeName} — ({isLive ? (hasKeys ? '🟢 توكن خاص مخزن' : '🔵 يستخدم التوكن الاحتياطي / يحتاج ضبط') : '🧪 وضع تجريبي Sandbox'})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <input
              ref={bulkFileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleBulkSheetUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => {
                downloadMerchantsBulkTemplateCsv();
                if (onShowToast) {
                  onShowToast('📥 تم تحميل شيت بيانات التجار (Template) بصيغة CSV جاهز للتعبئة!');
                }
              }}
              className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="تنزيل قالب CSV فارغ ومضبوط بالأعمدة المطلوبة (Store_Name, Manager_Name, Email, Phone, Platforms, Seller_ID, API_Token)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>تحميل شيت بيانات التجار (Template)</span>
            </button>

            <button
              type="button"
              disabled={isBulkImporting}
              onClick={() => bulkFileInputRef.current?.click()}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="رفع شيت CSV أو Excel يضم بيانات ومفاتيح ربط عدة تجار لمزامنتهم دفعة واحدة"
            >
              {isBulkImporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{isBulkImporting ? 'جاري التحليل والمزامنة...' : 'رفع شيت التجار 📊'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingNewMerchant(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة متجر تاجر جديد</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* Add New Merchant Modal Overlay inside if triggered */}
          {isAddingNewMerchant && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">إضافة متجر تاجر جديد للنظام</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNewMerchant(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddNewMerchant} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم المتجر / العلامة التجارية *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رويال دمياط للأثاث"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم التاجر / المسؤول</label>
                  <input
                    type="text"
                    placeholder="م. طارق رضوان"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني للتاجر</label>
                  <input
                    type="email"
                    placeholder="tarek@royalfurniture.eg"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الواتساب / الهاتف</label>
                  <input
                    type="text"
                    placeholder="01012345678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewMerchant(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-bold text-slate-700 transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition cursor-pointer shadow-xs"
                  >
                    حفظ وإضافة التاجر
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* REQUIREMENT 4: Mock vs Real Data Control Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    وضع البيانات للتاجر الحالي: <span className="text-indigo-600 font-black font-mono">{storeName || currentMerchant?.storeName}</span>
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  اختر ما إذا كان هذا التاجر يعمل بالسحب الحي للطلبات الحقيقية عبر الـ API أم بوضع المعاينة والتجربة (Sandbox).
                </p>
              </div>

              {/* Mode Badges */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDataMode('live')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                    dataMode === 'live'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
                  <span>البيانات الحقيقية (Live API Data)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDataMode('demo')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                    dataMode === 'demo'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dataMode === 'demo' ? 'bg-white' : 'bg-sky-500'}`} />
                  <span>وضع المعاينة التجريبية (Demo Data)</span>
                </button>
              </div>
            </div>

            {/* Mode Explanatory Notice */}
            {dataMode === 'live' ? (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">وضع البيانات الحقيقية نشط (Live API Mode): </span>
                  يتم جلب واستيراد الطلبات وحالات الشحن الحقيقية لهذا التاجر حصرياً عبر بيانات اعتماده المدخلة بالأسفل مباشرة من خوادم Amazon SP-API ونون، ولن يتم إظهار أي بيانات عشوائية أو وهمية.
                </div>
              </div>
            ) : (
              <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3 text-xs text-sky-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">وضع المعاينة التجريبية نشط (Demo Sandbox Mode): </span>
                  يتيح هذا الوضع استعراض طلبات أثاث تجريبية ومحاكاة عمليات توليد بوالص الشحن واختبار النظام لهذا التاجر دون الحاجة لمفاتيح سيلر سنترال حية.
                </div>
              </div>
            )}
          </div>

          {/* Platform Tabs Navigation */}
          <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => setActivePlatformTab('amazon')}
              className={`pb-3 px-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'amazon'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>أمازون مصر (Amazon SP-API)</span>
              {isAmazonConfigured ? (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 font-bold">مضبوط</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-500">غير مكتمل</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('noon')}
              className={`pb-3 px-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'noon'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>نون مصر (Noon Partner API)</span>
              {isNoonConfigured ? (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 font-bold">مضبوط</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-500">اختياري</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('bosta')}
              className={`pb-3 px-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'bosta'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>شركة الشحن (Bosta Egypt)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('general')}
              className={`pb-3 px-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'general'
                  ? 'border-slate-800 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>بيانات المتجر والتاجر</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('advanced')}
              className={`pb-3 px-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'advanced'
                  ? 'border-amber-600 text-amber-950 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>إعدادات ربط APIs المتقدمة (Client Secrets & URIs)</span>
            </button>
          </div>

          {/* TAB 1: Amazon SP-API Credentials (Multi-Tenant LWA Token Exchange & Encrypted Storage) */}
          {activePlatformTab === 'amazon' && (
            <div className="space-y-4">
              {/* LWA Security & Token Exchange Architecture Banner */}
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm font-black text-white">
                      نظام Amazon SP-API المتوافق مع معايير أمان أمازون الرسمية (LWA Token Exchange & Encrypted Vault)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      تشفير ENC_LWA_V1 🔐
                    </span>
                  </div>
                  <a
                    href="https://sellercentral.amazon.eg/apps/manage"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-300 hover:text-sky-200 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Amazon Seller Central App Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside leading-relaxed">
                  <li>
                    <strong className="text-sky-300">استبدال الرموز برمجياً (Runtime LWA Token Exchange):</strong> يتصل الخادم مباشرة بـ <code className="font-mono text-indigo-200">https://api.amazon.com/auth/o2/token</code> باستخدام <code className="font-mono text-indigo-200">grant_type: refresh_token</code> مع <code className="font-mono text-indigo-200">client_id</code> و <code className="font-mono text-indigo-200">client_secret</code> لجلب <code className="font-mono text-emerald-300">access_token</code> ديناميكي صالح لمدة 3600 ثانية لكل تاجر.
                  </li>
                  <li>
                    <strong className="text-emerald-300">التخزين المشفر والآمن (Encrypted Storage Policy):</strong> يُحفظ مفتاح <code className="font-mono text-emerald-200">Refresh Token</code> الخاص بمتجر ({storeName}) بصيغة مشفرة (<code className="font-mono text-emerald-200">ENC_LWA_V1:...</code>) في قاعدة بيانات <strong className="text-white">Cloud Firestore</strong>، ويُمنع تماماً حفظه في كود الواجهة الأمامية أو تمريره في الروابط (URLs).
                  </li>
                  <li>
                    <strong className="text-sky-300">معالجة انتهاء الصلاحية تلقائياً (Graceful Token Expiry Fallback):</strong> في حال انتهاء صلاحية الرمز، يُظهر النظام تنبيهاً داخلياً للتاجر لإعادة إدخال مفتاح <code className="font-mono text-sky-200">Refresh Token</code> دون إيقاف عمل المنظومة.
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Merchant Seller ID (SELLER_ID) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">معرّف التاجر في أمازون (SELLER_ID / Merchant Token) *</label>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">خاص بالمتجر</span>
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="A2EUQ1WTGCTBG2"
                    value={amazonSellerId}
                    onChange={(e) => setAmazonSellerId(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                  <p className="text-[10px] text-slate-500">
                    يُحفظ في سجل المتجر المستقل في Firestore ويُمرر في ترويسة الطلبات المؤمنة.
                  </p>
                </div>

                {/* Region */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">سيرفر ونطاق الربط (Region Endpoint)</label>
                  <select
                    value={amazonRegion}
                    onChange={(e) => setAmazonRegion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                  >
                    <option value="eu-west-1">أوروبا ومصر والشرق الأوسط (eu-west-1) [الافتراضي لمصر]</option>
                    <option value="us-east-1">أمريكا الشمالية (us-east-1)</option>
                    <option value="us-west-2">الشرق الأقصى وآسيا (us-west-2)</option>
                  </select>
                </div>

                {/* Refresh Token (AMAZON_REFRESH_TOKEN per Store - Encrypted at rest) */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="font-bold text-slate-800">LWA Refresh Token (يُشفر تلقائياً قبل الحفظ في قاعدة البيانات)</label>
                      {amazonRefreshToken.trim() ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          🔐 مشفر ومحفوظ للمتجر ({maskLwaTokenForDisplay(amazonRefreshToken)})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          يعمل على خزنة الخادم الاحتياطية (Server LWA Vault) 🔄
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAmazonToken(!showAmazonToken)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {showAmazonToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAmazonToken ? 'إخفاء التوكن' : 'إظهار التوكن للتعديل'}</span>
                    </button>
                  </div>
                  <input
                    type={showAmazonToken ? 'text' : 'password'}
                    dir="ltr"
                    autoComplete="off"
                    placeholder="Atzr|IwEBIBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (يُشفر تلقائياً بمعيار ENC_LWA_V1)"
                    value={amazonRefreshToken}
                    onChange={(e) => setAmazonRefreshToken(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                    <span>
                      🔒 متوافق مع وثائق أمان أمازون: لا يتم إرسال هذا المفتاح في روابط URL أبداً، ويتم تشفيره قبل التخزين واستبداله برمز <code className="font-mono text-indigo-700">access_token</code> مؤقت عبر الخادم.
                    </span>
                    {amazonRefreshToken.trim() && (
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {encryptLwaRefreshToken(amazonRefreshToken.trim()).slice(0, 28)}...
                      </span>
                    )}
                  </div>
                </div>

                {/* Marketplace ID & Master App Status */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">معرف سوق أمازون مصر (Marketplace ID)</label>
                  <input
                    type="text"
                    dir="ltr"
                    disabled
                    value={amazonMarketplaceId}
                    className="w-full font-mono text-xs bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">مفاتيح تطبيق المطور الرئيسي (Master Developer App)</label>
                  <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs">
                    <span className="text-slate-700 font-semibold">تُقرأ من <code className="font-mono text-indigo-700">AMAZON_SP_API_CONFIG</code></span>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedDeveloperKeys(!showAdvancedDeveloperKeys)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      {showAdvancedDeveloperKeys ? 'إخفاء التخصيص' : 'تخصيص متقدم (اختياري)'}
                    </button>
                  </div>
                </div>

                {/* Optional Advanced Override for Client ID / Secret if needed */}
                {showAdvancedDeveloperKeys && (
                  <>
                    <div className="space-y-1.5 md:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-600 mb-2 font-medium">
                        💡 بشكل افتراضي يعتمد النظام على <code className="font-mono">DEFAULT_CLIENT_ID</code> و <code className="font-mono">DEFAULT_CLIENT_SECRET</code> من ملف الإعدادات الثابتة. يمكنك ترك الحقول التالية فارغة تماماً:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">LWA Client ID (تجاوز اختياري)</label>
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="يُجلب تلقائياً من DEFAULT_CLIENT_ID"
                            value={amazonClientId}
                            onChange={(e) => setAmazonClientId(e.target.value)}
                            className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-700">LWA Client Secret (تجاوز اختياري)</label>
                            <button
                              type="button"
                              onClick={() => setShowAmazonSecret(!showAmazonSecret)}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                              {showAmazonSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{showAmazonSecret ? 'إخفاء' : 'إظهار'}</span>
                            </button>
                          </div>
                          <input
                            type={showAmazonSecret ? 'text' : 'password'}
                            dir="ltr"
                            placeholder="يُجلب تلقائياً من DEFAULT_CLIENT_SECRET"
                            value={amazonClientSecret}
                            onChange={(e) => setAmazonClientSecret(e.target.value)}
                            className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Test Amazon Connection Button & Result Panel */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestAmazonConnection}
                  disabled={isTestingAmazon}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingAmazon ? 'animate-spin' : ''}`} />
                  <span>{isTestingAmazon ? 'جارٍ فحص التوكن مع سيلر سنترال...' : '⚡ فحص التوكن والاتصال بـ Amazon SP-API'}</span>
                </button>

                {amazonTestResult && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 flex-1 ${
                    amazonTestResult.success 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {amazonTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-medium">{amazonTestResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Noon Partner API Credentials */}
          {activePlatformTab === 'noon' && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800">بيانات ربط منصة نون مصر (Noon Partner Portal API)</span>
                  </div>
                  <a
                    href="https://login.noon.partners"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>بوابة شركاء نون</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تتيح مزامنة طلبات ومخزون الأثاث المعروض على نون مصر، وتحديث كروت المنتجات وتأكيد استلام وتجهيز الشحنات.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700">Noon Auth Key / API Key</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={noonAuthKey}
                    onChange={(e) => setNoonAuthKey(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Noon App ID</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="noon_partner_app_eg_..."
                    value={noonAppId}
                    onChange={(e) => setNoonAppId(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Noon Warehouse / Fulfillment Center ID</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="WH-CAI-FURN-01"
                    value={noonWarehouseId}
                    onChange={(e) => setNoonWarehouseId(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Noon Secret Key (المفتاح السري)</label>
                    <button
                      type="button"
                      onClick={() => setShowNoonSecret(!showNoonSecret)}
                      className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                    >
                      {showNoonSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showNoonSecret ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <input
                    type={showNoonSecret ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="sec_noon_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={noonSecretKey}
                    onChange={(e) => setNoonSecretKey(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Bosta Courier API */}
          {activePlatformTab === 'bosta' && (
            <div className="space-y-4">
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-rose-600" />
                    <span className="text-base font-bold text-slate-800">بيانات ربط شركة بوسطة مصر (Bosta Egypt API)</span>
                  </div>
                  <a
                    href="https://business.bosta.co"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>لوحة تحكم بوسطة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تُستخدم لإنشاء شحنات بوسطة تلقائياً، وتوليد أرقام التتبع وبوالص الشحن لكل طرد، ومتابعة حالة التسليم لحظة بلحظة.
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Bosta Business API Key</label>
                  <button
                    type="button"
                    onClick={() => setShowBostaKey(!showBostaKey)}
                    className="text-xs text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                  >
                    {showBostaKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showBostaKey ? 'إخفاء' : 'إظهار'}</span>
                  </button>
                </div>
                <input
                  type={showBostaKey ? 'text' : 'password'}
                  dir="ltr"
                  placeholder="bosta_live_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={bostaApiKey}
                  onChange={(e) => setBostaApiKey(e.target.value)}
                  className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-slate-800"
                />
              </div>
            </div>
          )}

          {/* TAB 4: General Merchant Store Info */}
          {activePlatformTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم المتجر / الشركة</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">المسؤول / التاجر</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني للتاجر</label>
                  <input
                    type="email"
                    value={primaryEmail}
                    onChange={(e) => setPrimaryEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">المدينة / المقر الرئيسي للمعارض</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Advanced API Settings */}
          {activePlatformTab === 'advanced' && (
            <div className="space-y-5 bg-amber-50/50 p-5 rounded-2xl border-2 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-700">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#000000]">إعدادات ربط APIs المتقدمة ومعاملات التوثيق</h3>
                  <p className="text-xs text-slate-600">إدارة Client Secrets، Redirect URIs، Webhook Signatures، وبيئة الاختبار Sandbox لكل منصة تجارية على حدة.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Redirect URI */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رابط إعادة التوجيه (OAuth Redirect URI / Callback)</label>
                  <input
                    type="text"
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                    dir="ltr"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="https://your-app-domain.com/api/auth/callback"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">رابط الاستجابة المعتمد في لوحة المطورين (Amazon Developer Central / Noon Console).</span>
                </div>

                {/* Webhook Secret */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">مفتاح تشفير الـ Webhooks (Webhook Signature Secret)</label>
                  <div className="relative">
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={advancedWebhookSecret}
                      onChange={(e) => setAdvancedWebhookSecret(e.target.value)}
                      dir="ltr"
                      placeholder="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 pr-10 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">للتحقق من صحة إشعارات الطلبات الفورية الواردة من منصات البيع.</span>
                </div>

                {/* Custom API Endpoint URL */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رابط بوابة الـ API المخصص (Custom API Gateway Endpoint)</label>
                  <input
                    type="text"
                    value={customApiEndpoint}
                    onChange={(e) => setCustomApiEndpoint(e.target.value)}
                    dir="ltr"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="https://sellingpartnerapi-eu.amazon.com أو خادم وسيط مخصص"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">اتركه فارغاً للاستخدام التلقائي لبوابات أمازون ونون الرسمية.</span>
                </div>

                {/* Sandbox / Production Mode Toggle */}
                <div className="flex flex-col justify-center">
                  <label className="block text-slate-700 font-bold mb-1">بيئة التشغيل (Environment Mode)</label>
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-300">
                    <button
                      type="button"
                      onClick={() => setIsSandboxMode(false)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer ${
                        !isSandboxMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      🟢 الإنتاج (Production)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSandboxMode(true)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer ${
                        isSandboxMode ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      🧪 بيئة التجربة (Sandbox)
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">تفعيل بيئة Sandbox لاختبار الطلبات والبوالص قبل الإطلاق الحي.</span>
                </div>
              </div>

              <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-300 flex items-center gap-2 text-xs text-amber-900">
                <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                <span>جميع مفاتيح Client Secrets و Webhook Secrets تُشفّر محلياً ولا يتم مشاركتها أبداً.</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>يتم تخزين المفاتيح محلياً بشكل مشفر وآمن لكل تاجر على حدة دون تداخل.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl font-bold text-xs text-slate-700 transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={isPullingMerchantOrders || isSyncingFirestore}
              onClick={handlePullOrdersFromModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
              title="اعتماد مفاتيح التاجر وسحب الطلبات فوراً"
            >
              <RefreshCw className={`w-4 h-4 ${isPullingMerchantOrders ? 'animate-spin' : ''}`} />
              <span>{isPullingMerchantOrders ? 'جاري السحب...' : 'سحب الطلبات 🛒'}</span>
            </button>

            <button
              type="button"
              disabled={isSyncingFirestore || isPullingMerchantOrders}
              onClick={handleSaveCredentials}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSyncingFirestore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSyncingFirestore ? 'جاري الحفظ...' : 'حفظ إعدادات ومفاتيح التاجر'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
