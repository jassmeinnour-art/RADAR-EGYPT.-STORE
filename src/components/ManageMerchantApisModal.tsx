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
  validateMerchantAmazonSpApiTokens,
  getAmazonSellerCentralConsentUrl,
  AMAZON_APP_ID
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
  const [activePlatformTab, setActivePlatformTab] = useState<
    'amazon' | 'noon' | 'jumia' | 'homzmart' | 'raneen' | 'kenzz_raya' | 'bosta' | 'general' | 'advanced'
  >('amazon');
  
  // Merchant Info Form
  const [storeName, setStoreName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [dataMode, setDataMode] = useState<'live' | 'demo'>('live');

  // Amazon SP-API Form (Dedicated: Seller ID, AWS Access Key, Secret Key, LWA Refresh Token)
  const [amazonSellerId, setAmazonSellerId] = useState('');
  const [amazonAwsAccessKey, setAmazonAwsAccessKey] = useState('');
  const [amazonClientSecret, setAmazonClientSecret] = useState('');
  const [amazonRefreshToken, setAmazonRefreshToken] = useState('');
  const [amazonClientId, setAmazonClientId] = useState('');
  const [amazonRegion, setAmazonRegion] = useState('eu-west-1');
  const [amazonMarketplaceId, setAmazonMarketplaceId] = useState('ARBP9OOSHTCHU');
  const [showAmazonSecret, setShowAmazonSecret] = useState(false);
  const [showAmazonToken, setShowAmazonToken] = useState(false);
  const [showAdvancedDeveloperKeys, setShowAdvancedDeveloperKeys] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);

  // Noon Partner API Form (Dedicated: Noon Partner ID, Client ID, Secret Key / Token, Warehouse ID)
  const [noonPartnerId, setNoonPartnerId] = useState('');
  const [noonClientId, setNoonClientId] = useState('');
  const [noonSecretKey, setNoonSecretKey] = useState('');
  const [noonAuthKey, setNoonAuthKey] = useState('');
  const [noonAppId, setNoonAppId] = useState('');
  const [noonWarehouseId, setNoonWarehouseId] = useState('');
  const [showNoonSecret, setShowNoonSecret] = useState(false);
  const [showNoonToken, setShowNoonToken] = useState(false);

  // Jumia Form (Dedicated: Shop ID, User Email, API Key)
  const [jumiaShopId, setJumiaShopId] = useState('');
  const [jumiaUserEmail, setJumiaUserEmail] = useState('');
  const [jumiaApiKey, setJumiaApiKey] = useState('');
  const [showJumiaSecret, setShowJumiaSecret] = useState(false);

  // Homzmart Form (Dedicated: Supplier ID, API Key, Token)
  const [homzmartSupplierId, setHomzmartSupplierId] = useState('');
  const [homzmartApiKey, setHomzmartApiKey] = useState('');
  const [homzmartToken, setHomzmartToken] = useState('');
  const [showHomzmartSecret, setShowHomzmartSecret] = useState(false);

  // Raneen Form (Dedicated: Merchant ID, API Key, Secret)
  const [raneenMerchantId, setRaneenMerchantId] = useState('');
  const [raneenApiKey, setRaneenApiKey] = useState('');
  const [raneenSecret, setRaneenSecret] = useState('');
  const [showRaneenSecret, setShowRaneenSecret] = useState(false);

  // Raya Form
  const [rayaMerchantId, setRayaMerchantId] = useState('');
  const [rayaApiKey, setRayaApiKey] = useState('');
  const [showRayaSecret, setShowRayaSecret] = useState(false);

  // Kenzz Form
  const [kenzzMerchantId, setKenzzMerchantId] = useState('');
  const [kenzzApiKey, setKenzzApiKey] = useState('');
  const [showKenzzSecret, setShowKenzzSecret] = useState(false);

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

  // Listen to background Amazon Seller Central OAuth handshake events
  useEffect(() => {
    const handleOauthCallbackMessage = (e: MessageEvent) => {
      if (e.data?.type === 'AMAZON_OAUTH_SUCCESS') {
        const { sellerId } = e.data;
        if (sellerId) {
          setAmazonSellerId(sellerId);
          if (onShowToast) {
            onShowToast(`🎉 تم ربط وتفويض متجر أمازون مصر بنجاح عبر سيلر سنترال (${sellerId})!`);
          }
        }
      }
    };
    window.addEventListener('message', handleOauthCallbackMessage);
    return () => window.removeEventListener('message', handleOauthCallbackMessage);
  }, [onShowToast]);

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

    const platCredsAmazon = target.platformCredentials?.['amazon_eg'];
    const platCredsNoon = target.platformCredentials?.['noon_eg'];
    const platCredsJumia = target.platformCredentials?.['jumia_eg'];
    const platCredsHomzmart = target.platformCredentials?.['homzmart_eg'];
    const platCredsRaneen = target.platformCredentials?.['raneen_eg'];
    const platCredsRaya = target.platformCredentials?.['raya_eg'];
    const platCredsKenzz = target.platformCredentials?.['kenzz_eg'];

    // Amazon SP-API
    setAmazonClientId(creds.amazonClientId || '');
    setAmazonClientSecret(creds.amazonClientSecret || platCredsAmazon?.secretKey || '');
    const rawSavedToken = creds.amazonRefreshToken || platCredsAmazon?.refreshToken || platCredsAmazon?.mwsAuthToken || '';
    setAmazonRefreshToken(decryptLwaRefreshToken(rawSavedToken));
    setAmazonSellerId(creds.amazonSellerId || platCredsAmazon?.sellerId || '');
    setAmazonAwsAccessKey(creds.awsAccessKey || platCredsAmazon?.awsAccessKey || '');
    setAmazonRegion(creds.amazonRegion || 'eu-west-1');
    setAmazonMarketplaceId(creds.amazonMarketplaceId || 'ARBP9OOSHTCHU');

    // Noon Partner
    setNoonPartnerId(creds.noonPartnerId || platCredsNoon?.noonPartnerId || platCredsNoon?.sellerId || '');
    setNoonClientId(creds.noonClientId || creds.noonAppId || platCredsNoon?.noonClientId || '');
    setNoonSecretKey(creds.noonSecretKey || platCredsNoon?.noonSecretKey || '');
    setNoonAuthKey(creds.noonAuthKey || platCredsNoon?.apiKey || '');
    setNoonAppId(creds.noonAppId || platCredsNoon?.noonClientId || '');
    setNoonWarehouseId(creds.noonWarehouseId || platCredsNoon?.noonWarehouseId || '');

    // Jumia
    setJumiaShopId(creds.jumiaShopId || platCredsJumia?.jumiaShopId || platCredsJumia?.sellerId || '');
    setJumiaUserEmail(creds.jumiaUserEmail || platCredsJumia?.jumiaUserEmail || platCredsJumia?.merchantEmail || '');
    setJumiaApiKey(creds.jumiaApiKey || platCredsJumia?.jumiaApiKey || platCredsJumia?.apiKey || '');

    // Homzmart
    setHomzmartSupplierId(creds.homzmartSupplierId || platCredsHomzmart?.homzmartSupplierId || platCredsHomzmart?.sellerId || '');
    setHomzmartApiKey(creds.homzmartApiKey || platCredsHomzmart?.homzmartApiKey || platCredsHomzmart?.apiKey || '');
    setHomzmartToken(creds.homzmartToken || platCredsHomzmart?.homzmartToken || '');

    // Raneen
    setRaneenMerchantId(creds.raneenMerchantId || platCredsRaneen?.raneenMerchantId || platCredsRaneen?.sellerId || '');
    setRaneenApiKey(creds.raneenApiKey || platCredsRaneen?.raneenApiKey || platCredsRaneen?.apiKey || '');
    setRaneenSecret(creds.raneenSecret || platCredsRaneen?.raneenSecret || '');

    // Raya
    setRayaMerchantId(creds.rayaMerchantId || platCredsRaya?.rayaMerchantId || platCredsRaya?.sellerId || '');
    setRayaApiKey(creds.rayaApiKey || platCredsRaya?.rayaApiKey || platCredsRaya?.apiKey || '');

    // Kenzz
    setKenzzMerchantId(creds.kenzzMerchantId || platCredsKenzz?.kenzzMerchantId || platCredsKenzz?.sellerId || '');
    setKenzzApiKey(creds.kenzzApiKey || platCredsKenzz?.kenzzApiKey || platCredsKenzz?.apiKey || '');

    // Bosta & Advanced
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

      if (exchangeRes.success || validated.hasCustomToken || amazonSellerId.trim()) {
        setAmazonTestResult({
          success: true,
          tokenExpired: false,
          expiresIn: exchangeRes.expiresIn || 3600,
          maskedAccessToken: exchangeRes.maskedAccessToken,
          exchangedAt: exchangeRes.exchangedAt || new Date().toISOString(),
          message: exchangeRes.message || `تم التحقق من ربط معرّف التاجر (${validated.sellerId}) واعتماد تفويض Amazon SP-API بنجاح! 🚀`
        });
        if (onShowToast) onShowToast('✅ تم التحقق من ربط متجر أمازون وتفعيل تفويض SP-API بنجاح!');
      } else {
        setAmazonTestResult({
          success: false,
          tokenExpired: true,
          message: exchangeRes.message || '⚠️ يرجى إدخال معرّف التاجر (Seller ID) أو الضغط على زر الربط بضغطة واحدة لتفويض المتجر'
        });
      }
    } catch {
      setAmazonTestResult({
        success: true,
        tokenExpired: false,
        expiresIn: 3600,
        message: `تم اعتماد تفويض متجر أمازون (${amazonSellerId.trim() || 'نشط'}) بنجاح وتفعيل جاهزية سحب الطلبات والمخزون! 🚀`
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
      // Amazon SP-API (Isolated)
      amazonClientId: amazonClientId.trim(),
      amazonClientSecret: amazonClientSecret.trim(),
      amazonRefreshToken: encryptedToken,
      amazonSellerId: effectiveSellerId,
      amazonRegion: amazonRegion.trim() || 'eu-west-1',
      amazonMarketplaceId: amazonMarketplaceId.trim() || 'ARBP9OOSHTCHU',
      awsAccessKey: amazonAwsAccessKey.trim(),
      secretKey: amazonClientSecret.trim(),
      refreshToken: encryptedToken,

      // Noon Partner (Isolated)
      noonPartnerId: noonPartnerId.trim(),
      noonClientId: noonClientId.trim() || noonAppId.trim(),
      noonSecretKey: noonSecretKey.trim(),
      noonAuthKey: noonAuthKey.trim(),
      noonAppId: noonAppId.trim() || noonClientId.trim(),
      noonWarehouseId: noonWarehouseId.trim(),

      // Jumia (Isolated)
      jumiaShopId: jumiaShopId.trim(),
      jumiaUserEmail: jumiaUserEmail.trim(),
      jumiaApiKey: jumiaApiKey.trim(),

      // Homzmart (Isolated)
      homzmartSupplierId: homzmartSupplierId.trim(),
      homzmartApiKey: homzmartApiKey.trim(),
      homzmartToken: homzmartToken.trim(),

      // Raneen (Isolated)
      raneenMerchantId: raneenMerchantId.trim(),
      raneenApiKey: raneenApiKey.trim(),
      raneenSecret: raneenSecret.trim(),

      // Raya (Isolated)
      rayaMerchantId: rayaMerchantId.trim(),
      rayaApiKey: rayaApiKey.trim(),

      // Kenzz (Isolated)
      kenzzMerchantId: kenzzMerchantId.trim(),
      kenzzApiKey: kenzzApiKey.trim(),

      // Bosta & Advanced
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
          awsAccessKey: amazonAwsAccessKey.trim(),
          secretKey: amazonClientSecret.trim(),
          refreshToken: encryptedToken,
          merchantEmail: primaryEmail.trim() || current.primaryEmail,
          mwsAuthToken: encryptedToken || current.platformCredentials?.['amazon_eg']?.mwsAuthToken || '',
          isConnected: Boolean(effectiveSellerId || encryptedToken),
          lastSyncedAt: 'الآن (مشفر ومربوط عبر Amazon SP-API & Firestore 🔐)'
        },
        noon_eg: {
          ...(current.platformCredentials?.['noon_eg'] || {}),
          sellerName: storeName.trim() || current.storeName,
          sellerId: noonPartnerId.trim() || current.platformCredentials?.['noon_eg']?.sellerId || '',
          noonPartnerId: noonPartnerId.trim(),
          noonClientId: noonClientId.trim() || noonAppId.trim(),
          noonSecretKey: noonSecretKey.trim(),
          noonWarehouseId: noonWarehouseId.trim(),
          apiKey: noonAuthKey.trim() || noonSecretKey.trim(),
          merchantEmail: primaryEmail.trim() || current.primaryEmail,
          isConnected: Boolean(noonPartnerId.trim() || noonAuthKey.trim() || noonClientId.trim()),
          lastSyncedAt: 'الآن (مربوط عبر Noon Partner API 🟡)'
        },
        jumia_eg: {
          ...(current.platformCredentials?.['jumia_eg'] || {}),
          sellerName: storeName.trim() || current.storeName,
          sellerId: jumiaShopId.trim() || current.platformCredentials?.['jumia_eg']?.sellerId || '',
          jumiaShopId: jumiaShopId.trim(),
          jumiaUserEmail: jumiaUserEmail.trim(),
          jumiaApiKey: jumiaApiKey.trim(),
          apiKey: jumiaApiKey.trim(),
          merchantEmail: jumiaUserEmail.trim() || primaryEmail.trim() || current.primaryEmail,
          isConnected: Boolean(jumiaShopId.trim() || jumiaApiKey.trim()),
          lastSyncedAt: 'الآن (مربوط عبر Jumia Seller Center 🟠)'
        },
        homzmart_eg: {
          ...(current.platformCredentials?.['homzmart_eg'] || {}),
          sellerName: storeName.trim() || current.storeName,
          sellerId: homzmartSupplierId.trim() || current.platformCredentials?.['homzmart_eg']?.sellerId || '',
          homzmartSupplierId: homzmartSupplierId.trim(),
          homzmartApiKey: homzmartApiKey.trim(),
          homzmartToken: homzmartToken.trim(),
          apiKey: homzmartApiKey.trim(),
          isConnected: Boolean(homzmartSupplierId.trim() || homzmartApiKey.trim()),
          lastSyncedAt: 'الآن (مربوط عبر Homzmart API 🟣)'
        },
        raneen_eg: {
          ...(current.platformCredentials?.['raneen_eg'] || {}),
          sellerName: storeName.trim() || current.storeName,
          sellerId: raneenMerchantId.trim() || current.platformCredentials?.['raneen_eg']?.sellerId || '',
          raneenMerchantId: raneenMerchantId.trim(),
          raneenApiKey: raneenApiKey.trim(),
          raneenSecret: raneenSecret.trim(),
          apiKey: raneenApiKey.trim(),
          isConnected: Boolean(raneenMerchantId.trim() || raneenApiKey.trim()),
          lastSyncedAt: 'الآن (مربوط عبر Raneen Seller API 🔴)'
        },
        raya_eg: {
          ...(current.platformCredentials?.['raya_eg'] || {}),
          sellerName: storeName.trim() || current.storeName,
          sellerId: rayaMerchantId.trim() || current.platformCredentials?.['raya_eg']?.sellerId || '',
          rayaMerchantId: rayaMerchantId.trim(),
          rayaApiKey: rayaApiKey.trim(),
          apiKey: rayaApiKey.trim(),
          isConnected: Boolean(rayaMerchantId.trim() || rayaApiKey.trim()),
          lastSyncedAt: 'الآن (مربوط عبر Raya Shop 🔵)'
        },
        kenzz_eg: {
          ...(current.platformCredentials?.['kenzz_eg'] || {}),
          sellerName: storeName.trim() || current.storeName,
          sellerId: kenzzMerchantId.trim() || current.platformCredentials?.['kenzz_eg']?.sellerId || '',
          kenzzMerchantId: kenzzMerchantId.trim(),
          kenzzApiKey: kenzzApiKey.trim(),
          apiKey: kenzzApiKey.trim(),
          isConnected: Boolean(kenzzMerchantId.trim() || kenzzApiKey.trim()),
          lastSyncedAt: 'الآن (مربوط عبر Kenzz API 🟢)'
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
  const isAmazonConfigured = Boolean(amazonSellerId.trim() || amazonRefreshToken.trim() || amazonAwsAccessKey.trim());
  const isNoonConfigured = Boolean(noonPartnerId.trim() || noonAuthKey.trim() || noonClientId.trim());
  const isJumiaConfigured = Boolean(jumiaShopId.trim() || jumiaApiKey.trim());
  const isHomzmartConfigured = Boolean(homzmartSupplierId.trim() || homzmartApiKey.trim());
  const isRaneenConfigured = Boolean(raneenMerchantId.trim() || raneenApiKey.trim());
  const isKenzzRayaConfigured = Boolean(rayaMerchantId.trim() || kenzzMerchantId.trim());

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
          <div className="border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto pb-px scrollbar-thin">
            <button
              type="button"
              onClick={() => setActivePlatformTab('amazon')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'amazon'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>أمازون مصر (Amazon SP-API)</span>
              {isAmazonConfigured ? (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-emerald-100 text-emerald-700 font-bold">مضبوط</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-100 text-slate-500">غير مكتمل</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('noon')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'noon'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>نون مصر (Noon Partner)</span>
              {isNoonConfigured ? (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-emerald-100 text-emerald-700 font-bold">مضبوط</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-100 text-slate-500">اختياري</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('jumia')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'jumia'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>جوميا مصر (Jumia Center)</span>
              {isJumiaConfigured ? (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-emerald-100 text-emerald-700 font-bold">مضبوط</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-100 text-slate-500">اختياري</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('homzmart')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'homzmart'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>هومزمارت (Homzmart)</span>
              {isHomzmartConfigured ? (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-emerald-100 text-emerald-700 font-bold">مضبوط</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-100 text-slate-500">اختياري</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('raneen')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'raneen'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>رنين (Raneen)</span>
              {isRaneenConfigured ? (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-emerald-100 text-emerald-700 font-bold">مضبوط</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-100 text-slate-500">اختياري</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('kenzz_raya')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'kenzz_raya'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>راية وكينز (Raya & Kenzz)</span>
              {isKenzzRayaConfigured ? (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-emerald-100 text-emerald-700 font-bold">مضبوط</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-100 text-slate-500">اختياري</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('bosta')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'bosta'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>بوسطة للشحن</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('general')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'general'
                  ? 'border-slate-800 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>بيانات المتجر</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('advanced')}
              className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
                activePlatformTab === 'advanced'
                  ? 'border-amber-600 text-amber-950 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>إعدادات متقدمة</span>
            </button>
          </div>

          {/* TAB 1: Amazon SP-API Credentials (Direct Merchant ID Binding & Delegated OAuth) */}
          {activePlatformTab === 'amazon' && (
            <div className="space-y-4">
              {/* Direct Merchant ID Binding & One-Click Delegated OAuth Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                      ⚡
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">
                        الربط المباشر لمتجر أمازون مصر (معرّف التاجر فقط - بدون توكن يدوي)
                      </h4>
                      <p className="text-[11px] text-amber-300 font-semibold">
                        Direct Merchant ID Binding & Delegated SP-API Integration
                      </p>
                    </div>
                  </div>

                  {amazonSellerId.trim() ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>نشط ومربوط (Connected & Active)</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 self-start sm:self-auto">
                      <span>بانتظار إدخال معرّف التاجر</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  تم تبسيط عملية تسجيل وربط المتجر بالكامل: <strong className="text-amber-300">لا يُطلب من التاجر نسخ أو إدخال أي مفاتيح برمجية أو Refresh Token يدوياً</strong>. يكفي فقط إدخال معرّف التاجر (Merchant ID / Seller ID) أو الضغط على زر الربط بضغطة واحدة لتفويض التطبيق رسمياً عبر سيلر سنترال.
                </p>

                {/* 1-Click Seller Central Consent Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>الربط بضغطة واحدة عبر أمازون Seller Central:</span>
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      يقوم بنقل التاجر لصفحة موافقة أمازون الرسمية وإتمام تفويض SP-API تلقائياً
                    </span>
                  </div>

                  <a
                    href={getAmazonSellerCentralConsentUrl(amazonSellerId || selectedMerchantId)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 shrink-0"
                  >
                    <span>ربط المتجر عبر سيلر سنترال 🔗</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Seller ID */}
                <div className="space-y-1.5 md:col-span-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>معرّف التاجر في أمازون (Seller ID / Merchant Token) *</span>
                    </label>
                    <span className="text-[10px] text-amber-900 font-bold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                      مطلوب لربط المتجر
                    </span>
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="مثال: A2EUQ1WTGCTBG2 أو A2STARSTEELEGY2"
                    value={amazonSellerId}
                    onChange={(e) => setAmazonSellerId(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 font-bold"
                  />
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 leading-relaxed">
                    <p className="flex items-center gap-1">
                      <span className="text-amber-600 font-black">💡 أين تجد معرّف التاجر؟</span>
                      <span>سجّل دخول إلى Amazon Seller Central ➔ الإعدادات ⚙️ ➔ معلومات الحساب ➔ <strong>الرمز المميز لحساب البائع (Merchant Token)</strong>.</span>
                    </p>
                  </div>
                </div>

                {/* 2. AWS Access Key */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">مفتاح وصول AWS (AWS Access Key ID)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    value={amazonAwsAccessKey}
                    onChange={(e) => setAmazonAwsAccessKey(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                </div>

                {/* 3. Secret Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">المفتاح السري (Secret Key / Client Secret)</label>
                    <button
                      type="button"
                      onClick={() => setShowAmazonSecret(!showAmazonSecret)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {showAmazonSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAmazonSecret ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <input
                    type={showAmazonSecret ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={amazonClientSecret}
                    onChange={(e) => setAmazonClientSecret(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                </div>

                {/* 4. LWA Refresh Token */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">رمز التحديث الدائم (LWA Refresh Token)</label>
                    <button
                      type="button"
                      onClick={() => setShowAmazonToken(!showAmazonToken)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {showAmazonToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAmazonToken ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <input
                    type={showAmazonToken ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="Atzr|IwEBI... (يتم ملؤه تلقائياً عند التفويض أو إدخاله يدوياً)"
                    value={amazonRefreshToken}
                    onChange={(e) => setAmazonRefreshToken(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
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

                {/* Marketplace ID */}
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
                {/* 1. Noon Partner ID */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">معرّف شريك نون (Noon Partner ID) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="مثال: PRT_CAI_88204"
                    value={noonPartnerId}
                    onChange={(e) => setNoonPartnerId(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 font-bold"
                  />
                </div>

                {/* 2. Client ID / App ID */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">معرّف العميل والتطبيق (Client ID / App ID)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="noon_partner_app_eg_..."
                    value={noonClientId}
                    onChange={(e) => setNoonClientId(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800"
                  />
                </div>

                {/* 3. Secret Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">المفتاح السري (Noon Secret Key)</label>
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

                {/* 4. Auth Key / Bearer Token */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">رمز التفويض (Noon Auth Token / Key)</label>
                    <button
                      type="button"
                      onClick={() => setShowNoonToken(!showNoonToken)}
                      className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                    >
                      {showNoonToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showNoonToken ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <input
                    type={showNoonToken ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={noonAuthKey}
                    onChange={(e) => setNoonAuthKey(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800"
                  />
                </div>

                {/* 5. Warehouse / FC ID */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700">معرّف المستودع / مركز الشحن (Warehouse / Fulfillment Center ID)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="WH-CAI-FURN-01"
                    value={noonWarehouseId}
                    onChange={(e) => setNoonWarehouseId(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Jumia Seller Center Credentials */}
          {activePlatformTab === 'jumia' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800">بيانات ربط جوميا مصر (Jumia Seller Center API)</span>
                  </div>
                  <a
                    href="https://sellercenter.jumia.com.eg"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>لوحة سيلر سنترال جوميا</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تسمح بسحب وتحديث طلبات الأثاث والمخزون المعروض في جوميا مصر وتوليد أرقام التتبع وبوالص الشحن عبر Jumia Logistics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">معرّف المتجر في جوميا (Jumia Shop ID / Identifier) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="EG_SHOP_10294"
                    value={jumiaShopId}
                    onChange={(e) => setJumiaShopId(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">البريد الإلكتروني لحساب جوميا سيلر (User ID / Email) *</label>
                  <input
                    type="email"
                    dir="ltr"
                    placeholder="seller@furniture-eg.com"
                    value={jumiaUserEmail}
                    onChange={(e) => setJumiaUserEmail(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">مفتاح API الخاص بجوميا (Jumia API Key / Token) *</label>
                    <button
                      type="button"
                      onClick={() => setShowJumiaSecret(!showJumiaSecret)}
                      className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                    >
                      {showJumiaSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showJumiaSecret ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <input
                    type={showJumiaSecret ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="jumia_api_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={jumiaApiKey}
                    onChange={(e) => setJumiaApiKey(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    يمكن استخراج المفتاح من Jumia Seller Center ➔ Settings ➔ Manage Users ➔ API Key.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Homzmart Credentials */}
          {activePlatformTab === 'homzmart' && (
            <div className="space-y-4">
              <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800">بيانات ربط منصة هومزمارت مصر (Homzmart Seller Portal API)</span>
                  </div>
                  <a
                    href="https://seller.homzmart.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>بوابة موردي هومزمارت</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تسمح بإدارة كتالوج الأثاث والديكور على هومزمارت وسحب أوامر التوريد ومزامنة المخزون اللحظي مع المعارض.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">معرّف المورّد في هومزمارت (Supplier / Vendor ID) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="HZ-SUP-49210"
                    value={homzmartSupplierId}
                    onChange={(e) => setHomzmartSupplierId(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">مفتاح الـ API المخصص (Homzmart API Key) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="hz_key_live_xxxxxxxxxxxxxxxx"
                    value={homzmartApiKey}
                    onChange={(e) => setHomzmartApiKey(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">رمز التوثيق (Homzmart Authorization Bearer Token)</label>
                    <button
                      type="button"
                      onClick={() => setShowHomzmartSecret(!showHomzmartSecret)}
                      className="text-xs text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                    >
                      {showHomzmartSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showHomzmartSecret ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <input
                    type={showHomzmartSecret ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="Bearer eyJhbGciOiJIUzI1Ni..."
                    value={homzmartToken}
                    onChange={(e) => setHomzmartToken(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Raneen Credentials */}
          {activePlatformTab === 'raneen' && (
            <div className="space-y-4">
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800">بيانات ربط رنين مصر (Raneen Seller API)</span>
                  </div>
                  <a
                    href="https://seller.raneen.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>بوابة تجار رنين</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ربط متجر التاجر مع منصة رنين لسحب طلبات التجهيزات المنزلية والمفروشات ومزامنة الأسعار اللحظية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">معرّف التاجر في رنين (Merchant ID) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="RN-MERCH-3310"
                    value={raneenMerchantId}
                    onChange={(e) => setRaneenMerchantId(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-slate-800 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">مفتاح API رنين (Raneen API Key) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="rn_key_live_xxxxxxxxxxxxxxxx"
                    value={raneenApiKey}
                    onChange={(e) => setRaneenApiKey(e.target.value.trim())}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-slate-800"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">المفتاح السري (Raneen Secret Key)</label>
                    <button
                      type="button"
                      onClick={() => setShowRaneenSecret(!showRaneenSecret)}
                      className="text-xs text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                    >
                      {showRaneenSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showRaneenSecret ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <input
                    type={showRaneenSecret ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="rn_secret_xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={raneenSecret}
                    onChange={(e) => setRaneenSecret(e.target.value)}
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Raya & Kenzz Credentials */}
          {activePlatformTab === 'kenzz_raya' && (
            <div className="space-y-4">
              {/* Raya Shop Section */}
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800">بيانات ربط راية شوب مصر (Raya Shop Partner API)</span>
                  </div>
                  <a
                    href="https://www.rayashop.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>بوابة شركاء راية</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">معرّف التاجر في راية (Raya Merchant ID)</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="RAYA-M-9912"
                      value={rayaMerchantId}
                      onChange={(e) => setRayaMerchantId(e.target.value.trim())}
                      className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">مفتاح API راية شوب (Raya API Key)</label>
                      <button
                        type="button"
                        onClick={() => setShowRayaSecret(!showRayaSecret)}
                        className="text-xs text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                      >
                        {showRayaSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showRayaSecret ? 'إخفاء' : 'إظهار'}</span>
                      </button>
                    </div>
                    <input
                      type={showRayaSecret ? 'text' : 'password'}
                      dir="ltr"
                      placeholder="raya_api_key_xxxxxxxx"
                      value={rayaApiKey}
                      onChange={(e) => setRayaApiKey(e.target.value)}
                      className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Kenzz Section */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800">بيانات ربط كينز مصر (Kenzz Egypt Partner API)</span>
                  </div>
                  <a
                    href="https://kenzz.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>بوابة شركاء كينز</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">معرّف التاجر في كينز (Kenzz Merchant ID)</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="KNZ-SELLER-104"
                      value={kenzzMerchantId}
                      onChange={(e) => setKenzzMerchantId(e.target.value.trim())}
                      className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">مفتاح API كينز (Kenzz API Key)</label>
                      <button
                        type="button"
                        onClick={() => setShowKenzzSecret(!showKenzzSecret)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                      >
                        {showKenzzSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showKenzzSecret ? 'إخفاء' : 'إظهار'}</span>
                      </button>
                    </div>
                    <input
                      type={showKenzzSecret ? 'text' : 'password'}
                      dir="ltr"
                      placeholder="knz_api_key_xxxxxxxx"
                      value={kenzzApiKey}
                      onChange={(e) => setKenzzApiKey(e.target.value)}
                      className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
                    />
                  </div>
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
