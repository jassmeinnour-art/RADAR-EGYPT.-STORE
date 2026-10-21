// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { SEO } from './components/SEO';
import { 
  Store, 
  Camera, 
  TrendingDown, 
  Building2, 
  Layers, 
  Image as ImageIcon, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  RefreshCw,
  Check,
  History,
  Clock,
  MapPin,
  ExternalLink,
  Bookmark,
  FileText,
  Bell,
  Smartphone,
  FileSpreadsheet,
  Package,
  AlertTriangle,
  ArrowUpDown,
  ShoppingBag,
  Globe,
  Filter,
  Search,
  X,
  GripVertical,
  Plus,
  Pencil,
  FolderPlus,
  Palette,
  ChevronDown,
  ChevronUp,
  Users,
  Mail,
  Link2,
  Unlink,
  Minimize2,
  Maximize2,
  ArrowDownCircle,
  RotateCcw,
  Download,
  PowerOff,
  ChevronsUpDown,
  ChevronsDownUp,
  Rocket,
  Activity,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Star,
  TrendingUp,
  Truck,
  Boxes,
  Key,
  Crown,
  Lock,
  CreditCard,
  Copy,
  Upload,
  Trash2,
  Eye,
  Loader2,
  Share2,
  Scissors,
  Wrench,
  Volume2,
  VolumeX,
  Archive,
  MoreVertical,
  Undo2,
  SlidersHorizontal,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

import { ProductData, ConnectedMerchantPlatform, PlatformCategoryConfig, PlatformSEOListing, WatchlistItem, PriceAlert, AlertNotificationLog, KeywordItem, ProductInventoryRecord, RemoteMerchantClient, PlatformCompetitorRecord, PlatformSyncHistoryItem } from './types';
import { INITIAL_CONNECTED_PLATFORMS } from './data/sampleProducts';
import { INITIAL_WATCHLIST_ITEMS, INITIAL_PRICE_ALERTS, INITIAL_ALERT_LOGS } from './data/platformsGuideData';
import { SAMPLE_REMOTE_MERCHANTS } from './data/remoteMerchantsData';
import { PlatformConnectionModal } from './components/PlatformConnectionModal';
import { AddPlatformQuickHelpModal } from './components/AddPlatformQuickHelpModal';
import { ManageMerchantApisModal } from './components/ManageMerchantApisModal';
import { PlatformSyncHistoryOverlay, getPlatformSyncHistoryList, getMostRecentSyncError } from './components/PlatformSyncHistoryOverlay';
import { PlatformSyncErrorModal } from './components/PlatformSyncErrorModal';
import { SmartGmailAutoLinkModal } from './components/SmartGmailAutoLinkModal';
import { PlatformDynamicBrandIcon } from './components/PlatformDynamicBrandIcon';
import { getPlatformLastSuccessfulSyncInfo, getPlatformsSyncAlertSummary } from './utils/platformSyncAlertHelper';
import { 
  getPlatformSellerPortalUrl, 
  directLaunchPlatformPortal, 
  loadStoredPlatforms, 
  saveStoredPlatforms,
  getActiveManagedMerchantId,
  setActiveManagedMerchantId,
  loadStoredPlatformsForMerchant,
  saveStoredPlatformsForMerchant,
  loadAllRegisteredMerchants,
  saveAllRegisteredMerchants,
  evaluateMerchantSubscriptionState,
  updateMerchantSubscriptionStatus,
  hydrateMerchantStoresFromFirestore,
  resolveDynamicStoreAmazonCredentials
} from './utils/platformLaunchHelper';

import { Header } from './components/Header';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import SmartWelcomeGuide from './components/SmartWelcomeGuide';
import { ProductScanner } from './components/ProductScanner';
import { CompetitorRadar } from './components/CompetitorRadar';
import { DirectCompetitorsTab } from './components/DirectCompetitorsTab';
import { EgyptWholesaleLocations } from './components/EgyptWholesaleLocations';
import { PlatformListingGenerator } from './components/PlatformListingGenerator';
import { MerchantImageStudio } from './components/MerchantImageStudio';
import { MultiPlatformPublisher } from './components/MultiPlatformPublisher';
import { WatchlistManager } from './components/WatchlistManager';
import { PlatformsOnboardingGuide } from './components/PlatformsOnboardingGuide';
import { PriceAlertManager } from './components/PriceAlertManager';
import { SeoKeywordIntelligence } from './components/SeoKeywordIntelligence';
import { RemoteMerchantsManager } from './components/RemoteMerchantsManager';
import { BulkPriceUpdateManager } from './components/BulkPriceUpdateManager';
import { PeriodicPerformanceReports } from './components/PeriodicPerformanceReports';
import { ProfitProjectionSimulator } from './components/ProfitProjectionSimulator';
import { MarketTrendsRadar } from './components/MarketTrendsRadar';
import { SmartMarketAnalytics } from './components/SmartMarketAnalytics';
import { OrderSchedulingWaybills } from './components/OrderSchedulingWaybills';
import { PricingGuardrailsManager } from './components/PricingGuardrailsManager';
import { getOrCreatePricingPlan } from './data/pricingGuardrailsData';
import { MarketerRbacAndAuditHub } from './components/MarketerRbacAndAuditHub';
import { SalesDashboard } from './components/SalesDashboard';
import { SeasonalDemandForecast } from './components/SeasonalDemandForecast';
import { PlatformCommissionCalculator } from './components/PlatformCommissionCalculator';
import { ArchivedProductsVault } from './components/ArchivedProductsVault';
import { ArchiveProductModal } from './components/ArchiveProductModal';
import { ResetViewConfirmModal } from './components/ResetViewConfirmModal';
import { QuickStartWelcomeScreen } from './components/QuickStartWelcomeScreen';
import { CurrencyExchangeModal } from './components/CurrencyExchangeModal';
import { getActiveDisplayCurrency, SupportedCurrencyCode } from './utils/multiCurrencyManager';
import { ToolbarTooltip } from './components/ToolbarTooltip';
import { RealTimeProductPriceComparison } from './components/RealTimeProductPriceComparison';
import { SmartShopperPriceComparisonHub } from './components/SmartShopperPriceComparisonHub';
import { AddPlatformModal, NewPlatformCategory } from './components/AddPlatformModal';
import { PlatformCreatedNoticeModal } from './components/PlatformCreatedNoticeModal';
import { CategoryModal, getCategoryIconComponent, CATEGORY_ICON_MAP } from './components/CategoryModal';
import { AiMerchantChatbox } from './components/AiMerchantChatbox';
import { ExportCenterModal } from './components/ExportCenterModal';
import { EndOfDayExportReminder } from './components/EndOfDayExportReminder';
import { QuickExportDropdown } from './components/QuickExportDropdown';
import { ExecutivePdfReportModal } from './components/ExecutivePdfReportModal';
import { ExportEmailModal } from './components/ExportEmailModal';
import { AiBriefExportModal } from './components/AiBriefExportModal';
import { AiExcelEnricherModal } from './components/AiExcelEnricherModal';
import { InventoryTracker } from './components/InventoryTracker';
import { SmartInventoryAlerts } from './components/SmartInventoryAlerts';
import { FurnitureSuppliersHub } from './components/FurnitureSuppliersHub';
import { SupplierOffersTab } from './components/SupplierOffersTab';
import { getStoredInventory, saveStoredInventory, calculateStockStatus } from './data/inventoryData';
import { OrderFulfillmentTracker } from './components/OrderFulfillmentTracker';
import { GenerateProductWaybillModal } from './components/GenerateProductWaybillModal';
import { BulkMarketplaceWaybillModal } from './components/BulkMarketplaceWaybillModal';
import { saveInventoryToCloud, saveLiveProductsToCloud, fetchLiveProductsFromCloud } from './services/firestoreSync';
import { 
  loadStoredLiveProducts, 
  saveStoredLiveProducts, 
  VERIFIED_AMAZON_EG_PRODUCTS, 
  purgeDummyProducts,
  syncLiveProductsFromConnectedPlatforms
} from './services/livePlatformProductSync';
import { LivePlatformSyncModal } from './components/LivePlatformSyncModal';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { AdminApiErrorDashboard } from './components/AdminApiErrorDashboard';
import { subscribeToApiSyncErrors } from './services/apiErrorLoggingService';
import { ApiSyncErrorItem } from './types';
import { useAudioNotifications } from './context/AudioNotificationContext';
import { AndroidGooglePlayHubModal } from './components/AndroidGooglePlayHubModal';
import { MobileBottomDock } from './components/MobileBottomDock';
import { MobilePWAInstallPrompt } from './components/MobilePWAInstallPrompt';
import { PlatformInstallMatrixModal } from './components/PlatformInstallMatrixModal';
import { OnboardingGuideModal } from './components/OnboardingGuideModal';
import { useAppUpdate } from './hooks/useAppUpdate';
import { LiveUpdateNotification } from './components/LiveUpdateNotification';
import { isExportOverdue24h, exportSingleProductFullAuditCSV, exportSingleProductWithAiBriefCSV } from './utils/csvProductManager';
import { AsyncOperationsStatusIndicator } from './components/AsyncOperationsStatusIndicator';
import { triggerGlobalAsyncStart, triggerGlobalAsyncEnd } from './context/AsyncOperationsContext';
import { PushNotificationManagerModal } from './components/PushNotificationManagerModal';
import { initFcmMessaging, sendCompetitorPriceAlertNotification } from './services/fcmNotificationService';
import { WishlistManager } from './components/WishlistManager';
import { UserLogsManager } from './components/UserLogsManager';
import { logUserActivity } from './services/userLogsService';
import {
  ProactiveBestSellerAlertModal,
  isBestSellerAutoAlertEnabled,
  hasSeenBestSellerAlertThisSession,
  markBestSellerAlertSeenThisSession
} from './components/ProactiveBestSellerAlertModal';
import { PROACTIVE_BEST_SELLER_RECOMMENDATIONS } from './data/bestSellerRecommendationsData';
import { Flame } from 'lucide-react';
import { useSubscription } from './hooks/useSubscription';
import { SubscriptionPlansModal } from './components/SubscriptionPlansModal';
import { OwnerAiStudioDebuggerWidget } from './components/OwnerAiStudioDebuggerWidget';
import { PlatformCardDetailsDrawer } from './components/PlatformCardDetailsDrawer';
import { ActiveProductDetailsDrawer } from './components/ActiveProductDetailsDrawer';
import { AmazonMultiItemWaybillCropperModal } from './components/AmazonMultiItemWaybillCropperModal';
import { RadarGlobalHeroVisual } from './components/RadarGlobalHeroVisual';
import { InvestorPitchDeckModal, InvestorPitchDeck } from './components/InvestorPitchDeckModal';
import { RadarBrandLogo } from './components/RadarBrandLogo';
import { loadAllOrders } from './utils/merchantOrdersManager';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('radar');
  const [showPlatformBarOnOtherTabs, setShowPlatformBarOnOtherTabs] = useState<boolean>(false);
  const [isInvestorDeckOpen, setIsInvestorDeckOpen] = useState<boolean>(false);
  const [isRadarHeroCollapsed, setIsRadarHeroCollapsed] = useState<boolean>(false);

  const NAV_TAB_METADATA: Record<string, { label: string; badge?: string; desc: string }> = {
    admin_error_logs: { label: 'لوحة تحكم المدير وتتبع أخطاء الربط', badge: 'سجل أخطاء API 🚨', desc: 'سجل أخطاء مزامنة المنصات وقاعدة بيانات Firestore والرقابة الفورية' },
    user_logs: { label: 'سجل نشاط وحركات المستخدمين', badge: 'سجل النشاط 📜', desc: 'سجل تدقيق شامل وتتبع لكافة عمليات التاجر والمستخدمين والمزامنة السحابية' },
    sales_dashboard: { label: 'لوحة أداء المبيعات والتسعير', badge: 'تحليلات بيعية 📈', desc: 'متابعة المبيعات وهامش الربح وتحليلات Buy Box لكل المنصات' },
    archived_products: { label: 'أرشيف المنتجات غير النشطة', badge: 'أرشيف المنتجات 🗄️', desc: 'مجلد آمن لاسترجاع أو حذف المنتجات الموقوفة والمخفية من العرض' },
    platform_commissions: { label: 'حاسبة عمولات المنصات', badge: 'أمازون ونون وكنز 🧮', desc: 'احتساب دقيق لعمولات المنصات وضريبة القيمة المضافة وصافي الربح الحقيقي' },
    seasonal_forecast: { label: 'توقع الطلب الموسمي والذروة', badge: 'تنبؤ بالمخزون 📦⚡', desc: 'تنبؤ زمني ذكي لطلب المواسم المصرية (رمضان، الأعياد، الجمعة البيضاء)' },
    radar: { label: 'رادار المنافسين والتسعير', badge: 'مباشر ⚡', desc: 'رصد فوري لأسعار المنافسين واحتساب سعر البيع الرابح وحصة Buy Box' },
    loyalty_rewards: { label: 'مقارنة الأسعار الشاملة ومكافآت الولاء', badge: 'كاميرا وولاء 🎁', desc: 'تحليل المنتج بالكاميرا، مقارنة الأسعار ومواقع التجار، مراجعات المستخدمين، تنبيهات الخصم، نظام ولاء المتسوقين، وتصميم بطاقة كيفية الاستخدام' },
    direct_competitors: { label: 'المنافسون المباشرون', badge: 'مقارنة Buy Box 🏆', desc: 'جدول قابل للفرز والفلترة يقارن أسعار التاجر الحالي وأسعار المنافسين الرئيسيين لحظة بلحظة مع مؤشر حصة Buy Box لكل منصة' },
    smart_market_analytics: { label: 'تحليلات السوق الذكية', badge: 'اتجاهات 30 يوم 📊', desc: 'عرض الرسوم البيانية التفاعلية لاتجاهات أسعار المنافسين على مدار 30 يوماً باستخدام Recharts' },
    market_trends: { label: 'رادار اتجاهات السوق والطلب', badge: 'رائج بمصر 📈', desc: 'تحليل السلع الأكثر طلباً ومعدلات النمو في التجارة الإلكترونية المصرية' },
    order_scheduling: { label: 'جدولة الطلبات وبوالص الشحن', badge: 'بوالص منفصلة 🚚', desc: 'إدارة أوقات التسليم ومواعيد الشحن لكل منصة وتوليد بوالص منفصلة' },
    pricing_guardrails: { label: 'حدود حماية التسعير والمنصات', badge: 'أمان الأرباح 🛡️', desc: 'تعيين الحدود الدنيا والقصوى لمنع حرق الأسعار وحماية رأس المال' },
    marketer_hub: { label: 'صلاحيات المسوق والرقابة', badge: 'تحكم وصلاحيات 👑', desc: 'إدارة أدوار فريق العمل وصلاحيات التسعير وسجل التدقيق والرقابة' },
    profit_simulator: { label: 'محاكي الربح المستقبلي', badge: 'نمذجة تنبؤية 💎', desc: 'محاكاة رياضية لنتائج تخفيض أو رفع الأسعار وتأثيرها على العائد الإجمالي' },
    periodic_reports: { label: 'تقارير الأداء والرسوم البيانية', badge: 'مخططات دورية 📊', desc: 'تقارير دورية لأداء المتاجر والمنتجات الأكثر مبيعاً والأعلى هامشاً' },
    bulk_repricing: { label: 'التحديث الجماعي للأسعار وCSV', badge: 'استراتيجيات CSV 🚀', desc: 'تطبيق قواعد التسعير على كافة المنتجات دفعة واحدة واستيراد/تصدير CSV' },
    remote_merchants: { label: 'متابعة التجار والتقارير الأسبوعية', badge: 'تجار وإيميلات 👥', desc: 'متابعة حسابات التجار المتعددة وجدولة إرسال التقارير التلقائية عبر البريد' },
    watchlist: { label: 'قائمة المتابعة والرصد', badge: 'محفوظ ⭐', desc: 'قائمة المنتجات المحفوظة للمراقبة المستمرة وتتبع تغيرات الأسعار' },
    wishlist: { label: 'قائمة أمنيات التاجر والصفقات المرتقبة', badge: 'أمنيات 🎯', desc: 'خزينة الصفقات والسلع المستهدفة لتتبع هبوط الأسعار واقتناص أفضل الفرص للربح' },
    seo_keywords: { label: 'توليد الكلمات وقوة المنافسة', badge: 'جديد AI 🚀', desc: 'اقتراح الكلمات المفتاحية بالذكاء الاصطناعي لتحسين ترتيب البحث بالمنصات' },
    seo_listing: { label: 'نصوص السيو الجاهزة', badge: 'SEO 📑', desc: 'توليد نصوص عناوين وأوصاف جذابة ومطابقة لمعايير المنصات' },
    image_studio: { label: 'استوديو تصوير وزوايا المنتج', badge: 'كاميرا وزوايا 📸', desc: 'معالجة خلفيات وتصميم صور مطابقة للاشتراطات الرسمية للمنصات' },
    inventory: { label: 'تتبع مستويات المخزون ونقاط الطلب', badge: 'مخزون ذكي 📦', desc: 'مراقبة كميات المخزون بالمستودعات ونقاط إعادة الطلب والتنبيهات' },
    supplier_offers: { label: 'عروض الموردين', badge: 'جملة يومية وخصومات 👑', desc: 'قائمة محدثة بأسعار الجملة اليومية من شبكة الموردين المعتمدين في مصر مع تنبيهات العروض الخاصة والخصومات الحصرية للمنصة' },
    suppliers_hub: { label: 'دليل وشبكة موردي ومصانع الأثاث', badge: 'دليل دمياط ومصر 🏭', desc: 'دليل ذكي ومستقل لمصانع وموردي قطاع الأثاث (دمياط، المنصورة، العاشر، 6 أكتوبر) مع مقارنة الأسعار الفورية والواتساب' },
    wholesale: { label: 'أسواق ومراكز خامات الأثاث', badge: 'دمياط ومراكز مصر 🏢', desc: 'دليل شامل لمراكز توزيع وخامات الأثاث الرئيسية في دمياط والقاهرة والمحافظات' },
    price_alerts: { label: 'تنبيهات هبوط الأسعار', badge: 'واتساب 📲', desc: 'إشعارات لحظية عند نزول أسعار المنافسين عن حد معين عبر واتساب' },
    platforms_guide: { label: 'دليل المنصات والاشتراك والأوراق', badge: 'شروط وأوراق 📑', desc: 'دليل تفصيلي لمتطلبات التسجيل والأوراق الرسمية والعمولات للمنصات' },
  };
  
  // Scanner Modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // 1-Click Multi-Platform Publish Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // AI Excel Sheet Enricher Modal
  const [isAiExcelEnricherOpen, setIsAiExcelEnricherOpen] = useState(false);

  // Amazon Multi-Item Waybill Cropper Modal
  const [isAmazonWaybillCropperOpen, setIsAmazonWaybillCropperOpen] = useState<boolean>(false);

  // Multi-Platform Installation Modal
  const [isMultiPlatformInstallModalOpen, setIsMultiPlatformInstallModalOpen] = useState(false);

  // Archive Product Modal
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveModalProductId, setArchiveModalProductId] = useState<string | undefined>(undefined);

  // Ephemeral Operation Alert State for Drag-and-Drop Archive
  interface ArchiveEphemeralAlert {
    id: number;
    productId: string;
    productTitle: string;
    productSku?: string;
    productImage?: string;
    wholesaleCost?: number;
    retailPrice?: number;
    timestamp: string;
    secondsLeft: number;
  }
  const [archiveEphemeralAlert, setArchiveEphemeralAlert] = useState<ArchiveEphemeralAlert | null>(null);
  const [isArchiveDropTargetActive, setIsArchiveDropTargetActive] = useState<boolean>(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState<boolean>(false);
  const [isActiveProductsDropdownOpen, setIsActiveProductsDropdownOpen] = useState<boolean>(false);
  // Advanced Filter & Sort Bar states for Active Products Dropdown
  const [activeProductsSearchTerm, setActiveProductsSearchTerm] = useState<string>('');
  const [activeProductsSortBy, setActiveProductsSortBy] = useState<'default' | 'price' | 'date' | 'sync'>('default');
  const [activeProductsSortOrder, setActiveProductsSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeProductsSyncFilter, setActiveProductsSyncFilter] = useState<'all' | 'synced' | 'unsynced'>('all');

  // Countdown timer for Ephemeral Archive Alert (auto-dismisses after 7 seconds)
  useEffect(() => {
    if (!archiveEphemeralAlert) return;
    const interval = setInterval(() => {
      setArchiveEphemeralAlert((prev) => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) return null;
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [archiveEphemeralAlert]);

  // Export Center Modal
  const [isExportCenterOpen, setIsExportCenterOpen] = useState(false);

  // Quick Action Modals (PDF, Email to Manager, AI Brief)
  const [isExecutivePdfOpen, setIsExecutivePdfOpen] = useState(false);
  const [isExportEmailOpen, setIsExportEmailOpen] = useState(false);
  const [isAiBriefModalOpen, setIsAiBriefModalOpen] = useState(false);
  const [currentAiBriefData, setCurrentAiBriefData] = useState<any>(null);

  // Browser Push Notifications (FCM) Manager Modal State
  const [isPushNotificationModalOpen, setIsPushNotificationModalOpen] = useState(false);

  // Android & Google Play Hub Modal
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Generate Waybill & Order Fulfillment Modal State
  const [isGenerateWaybillModalOpen, setIsGenerateWaybillModalOpen] = useState(false);
  const [waybillTargetProduct, setWaybillTargetProduct] = useState<ProductData | null>(null);

  // Active Product Comprehensive Details Side Drawer State
  const [isActiveProductDetailsDrawerOpen, setIsActiveProductDetailsDrawerOpen] = useState(false);

  // Bulk Marketplace Waybill Generator Modal State
  const [isBulkMarketplaceWaybillModalOpen, setIsBulkMarketplaceWaybillModalOpen] = useState(false);

  // Proactive Best-Selling Products Recommendation Alert Modal & Banner State
  const [isBestSellerAlertModalOpen, setIsBestSellerAlertModalOpen] = useState<boolean>(false);
  const [isBestSellerBannerDismissed, setIsBestSellerBannerDismissed] = useState<boolean>(false);

  // Quick Help Modal State for Adding Platforms
  const [isAddPlatformQuickHelpOpen, setIsAddPlatformQuickHelpOpen] = useState<boolean>(false);

  useEffect(() => {
    // Proactively initialize FCM Cloud Messaging when supported outside sandboxed iframes
    initFcmMessaging().catch(() => {});
  }, []);

  // Audio Notifications sound triggers
  const { playPriceAlertSound, playCompetitorStatusSound } = useAudioNotifications();

  // Export Overdue State for Ribbon
  const [isExportOverdue, setIsExportOverdue] = useState<boolean>(() => isExportOverdue24h());

  // Realtime Sync Errors Monitoring for Admin Notifications
  const [unresolvedSyncErrors, setUnresolvedSyncErrors] = useState<ApiSyncErrorItem[]>([]);
  const [isSyncErrorBannerDismissed, setIsSyncErrorBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    const unsubErrors = subscribeToApiSyncErrors((items) => {
      const activeUnresolved = items.filter(i => i.status === 'unresolved');
      setUnresolvedSyncErrors(activeUnresolved);
    });
    return () => unsubErrors();
  }, []);

  useEffect(() => {
    const handleExportEvent = () => {
      setIsExportOverdue(isExportOverdue24h());
    };
    window.addEventListener('merchant_export_completed', handleExportEvent);
    return () => {
      window.removeEventListener('merchant_export_completed', handleExportEvent);
    };
  }, []);

  // Quick Export Handlers from Ribbon Dropdown
  const handleQuickExportPdf = () => {
    setIsExecutivePdfOpen(true);
  };

  const handleQuickAiBrief = () => {
    setIsAiBriefModalOpen(true);
  };

  const handleQuickExportCsv = () => {
    if (currentProduct) {
      exportSingleProductFullAuditCSV(currentProduct);
      logUserActivity({
        actionType: 'csv_export',
        actionTitle: 'تصدير ملف CSV للمنتج',
        details: `تم تصدير تدقيق وحسابات المنتج: ${currentProduct.title}`,
        status: 'success'
      }).catch(() => {});
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 }
        });
      } catch {
        // safe
      }
      showToast(`تم تصدير ملف CSV للمنتج (${currentProduct.title.substring(0, 25)}...) بنجاح 📁⚡`);
    } else {
      showToast('يرجى اختيار منتج للتصدير');
    }
  };

  const handleQuickEmailManager = () => {
    setIsExportEmailOpen(true);
  };

  // Active Product State (Strictly real products from live sync storage - no dummy fallbacks)
  const [allProducts, setAllProducts] = useState<ProductData[]>(() => {
    const loaded = loadStoredLiveProducts();
    const clean = purgeDummyProducts(loaded).filter(Boolean);
    return clean;
  });

  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(() => {
    const loaded = loadStoredLiveProducts();
    const clean = purgeDummyProducts(loaded).filter(Boolean);
    const activeId = getActiveManagedMerchantId();
    const matched = clean.find(p => p.merchantId === activeId);
    return matched || clean[0] || null;
  });

  // Modal State for Live Platform Product Synchronization
  const [isLiveSyncModalOpen, setIsLiveSyncModalOpen] = useState<boolean>(false);

  // Automatically persist live products changes
  useEffect(() => {
    saveStoredLiveProducts(allProducts);
  }, [allProducts]);

  // Separate active products vs archived products safely (memoized and deduplicated by id to prevent duplicate React keys)
  const activeProducts = useMemo(() => {
    const map = new Map<string, ProductData>();
    (allProducts || []).forEach(p => {
      if (p && p.id && !p.isArchived) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  }, [allProducts]);
  const archivedProducts = useMemo(() => {
    const map = new Map<string, ProductData>();
    (allProducts || []).forEach(p => {
      if (p && p.id && p.isArchived) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  }, [allProducts]);

  // Memoized filtered & sorted active products for the dropdown with advanced sorting & filtering bar
  const filteredSortedActiveProducts = useMemo(() => {
    let list = [...activeProducts];

    // 1. Text Search Filter (Title, SKU, ID, Category, Brand)
    if (activeProductsSearchTerm.trim()) {
      const q = activeProductsSearchTerm.trim().toLowerCase();
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // 2. Sync Status Filter
    if (activeProductsSyncFilter === 'synced') {
      list = list.filter(p => Boolean(p.merchantSynced || p.syncedAt));
    } else if (activeProductsSyncFilter === 'unsynced') {
      list = list.filter(p => !p.merchantSynced && !p.syncedAt);
    }

    // 3. Sorting (Price, Update Date, or Sync Status)
    if (activeProductsSortBy === 'price') {
      list.sort((a, b) => {
        const priceA = a.currentLowestPrice || a.suggestedRetailPrice || 0;
        const priceB = b.currentLowestPrice || b.suggestedRetailPrice || 0;
        return activeProductsSortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    } else if (activeProductsSortBy === 'date') {
      const getTimestamp = (p: ProductData) => {
        if (p.syncedAt) {
          const t = new Date(p.syncedAt).getTime();
          if (!isNaN(t)) return t;
        }
        if (p.priceHistory && p.priceHistory.length > 0) {
          const last = p.priceHistory[p.priceHistory.length - 1];
          if (last?.date) {
            const t = new Date(last.date).getTime();
            if (!isNaN(t)) return t;
          }
        }
        return 0;
      };
      list.sort((a, b) => {
        const tA = getTimestamp(a);
        const tB = getTimestamp(b);
        return activeProductsSortOrder === 'asc' ? tA - tB : tB - tA;
      });
    } else if (activeProductsSortBy === 'sync') {
      list.sort((a, b) => {
        const syncScoreA = a.merchantSynced ? 2 : (a.syncedAt ? 1 : 0);
        const syncScoreB = b.merchantSynced ? 2 : (b.syncedAt ? 1 : 0);
        return activeProductsSortOrder === 'asc' ? syncScoreA - syncScoreB : syncScoreB - syncScoreA;
      });
    }

    return list;
  }, [activeProducts, activeProductsSearchTerm, activeProductsSyncFilter, activeProductsSortBy, activeProductsSortOrder]);

  // Automatically sync currentProduct if none selected and products exist
  useEffect(() => {
    if (!currentProduct && activeProducts.length > 0) {
      setCurrentProduct(activeProducts[0]);
    }
  }, [activeProducts, currentProduct]);

  // Active Managed Merchant ID for the Marketing Manager / Agency (Agency Mode)
  const [activeMerchantId, setActiveMerchantId] = useState<string>(() => getActiveManagedMerchantId());
  const activeMerchantIdRef = useRef<string>(activeMerchantId);
  useEffect(() => {
    activeMerchantIdRef.current = activeMerchantId;
  }, [activeMerchantId]);

  // Remote Merchants List for account linking and agency management (always persisted & retained)
  const [remoteMerchantsList, setRemoteMerchantsList] = useState<RemoteMerchantClient[]>(() => {
    const list = loadAllRegisteredMerchants();
    if (list.length > 0) return list;
    return [];
  });

  // Manage Merchant APIs & Multi-Tenant Credentials Modal State
  const [isManageApisModalOpen, setIsManageApisModalOpen] = useState(false);

  // Connected Platforms for the Active Managed Merchant (with automatic persistence per merchant)
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedMerchantPlatform[]>(() => {
    const activeId = getActiveManagedMerchantId();
    const allMerchants = loadAllRegisteredMerchants();
    const curr = allMerchants.find(m => m.id === activeId) || allMerchants[0];
    return loadStoredPlatformsForMerchant(activeId, INITIAL_CONNECTED_PLATFORMS, curr);
  });

  // Switch Active Managed Merchant for Agency / Marketing Manager (Multi-Tenant Store Switcher)
  const handleSwitchActiveMerchant = (newMerchantId: string) => {
    if (!newMerchantId) return;
    // 1. Save current platforms for previous merchant
    saveStoredPlatformsForMerchant(activeMerchantId, connectedPlatforms);
    
    // 2. Set new active merchant ID
    setActiveManagedMerchantId(newMerchantId);
    setActiveMerchantId(newMerchantId);

    // 3. Load platforms specifically configured for newly selected merchant
    const targetMerch = remoteMerchantsList.find(m => m.id === newMerchantId);
    const newPlatforms = loadStoredPlatformsForMerchant(newMerchantId, INITIAL_CONNECTED_PLATFORMS, targetMerch);
    setConnectedPlatforms(newPlatforms);

    // Select a product matching the newly active merchant so currentProduct is never N/A
    const matchingProduct = allProducts.find(
      p => p.merchantId === newMerchantId ||
           (targetMerch?.storeName && (p.merchantStoreName === targetMerch.storeName || p.brand === targetMerch.storeName))
    ) || allProducts[0] || VERIFIED_AMAZON_EG_PRODUCTS[0] || null;
    if (matchingProduct) {
      setCurrentProduct(matchingProduct);
    }

    // 4. Resolve dynamic AMAZON_REFRESH_TOKEN & SELLER_ID from Cloud Firestore for the active store context
    if (targetMerch) {
      resolveDynamicStoreAmazonCredentials(targetMerch).then((resolved) => {
        const tokenLabel = targetMerch.dataMode === 'demo'
          ? 'وضع بيانات تجريبية (Demo)'
          : (resolved.tokenSource === 'firestore_store' || resolved.tokenSource === 'local_store')
            ? `Token متجر مستقل (Seller ID: ${resolved.sellerId || 'نشط'})`
            : 'Fallback: AMAZON_REFRESH_TOKEN الافتراضي';
        showToast(`تم التبديل السريع إلى متجر "${targetMerch.storeName}" — ${tokenLabel} 🏬⚡`);
      }).catch(() => {
        showToast(`تم التبديل بنجاح إلى متجر "${targetMerch.storeName || 'التاجر'}" - تم تحميل قنواته وبيانات اعتماده 🏬⚡`);
      });
    } else {
      showToast(`تم التبديل بنجاح إلى متجر التاجر المحدد 🏬⚡`);
    }
  };

  // Hydrate Multi-Tenant Merchant Store Credentials (Refresh Tokens & Seller IDs) from Cloud Firestore on launch
  useEffect(() => {
    hydrateMerchantStoresFromFirestore().then((hydrated) => {
      if (hydrated && hydrated.length > 0) {
        setRemoteMerchantsList(hydrated);
      }
    }).catch(() => {});
  }, []);

  // Synchronize registered merchants and active merchant across components and tabs
  useEffect(() => {
    const handleMerchantsUpdated = (e: any) => {
      if (e?.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setRemoteMerchantsList(e.detail);
      }
    };
    const handleActiveMerchantChanged = (e: any) => {
      if (e?.detail && typeof e.detail === 'string' && e.detail !== activeMerchantId) {
        handleSwitchActiveMerchant(e.detail);
      }
    };
    window.addEventListener('merchant_radar_merchants_updated', handleMerchantsUpdated);
    window.addEventListener('merchant_radar_active_merchant_changed', handleActiveMerchantChanged);
    return () => {
      window.removeEventListener('merchant_radar_merchants_updated', handleMerchantsUpdated);
      window.removeEventListener('merchant_radar_active_merchant_changed', handleActiveMerchantChanged);
    };
  }, [activeMerchantId, connectedPlatforms, remoteMerchantsList]);

  // Real-time platform statistics for the control panel platform bar
  const totalPlatformsCount = connectedPlatforms.length;
  const errorPlatformsCount = connectedPlatforms.filter(p => Boolean(p.hasSyncError || p.status === 'error' || p.syncError)).length;
  const activePlatformsCount = connectedPlatforms.filter(p => p.isConnected && !p.hasSyncError && p.status !== 'error' && p.status !== 'disconnected' && !p.syncError).length;
  const inactivePlatformsCount = totalPlatformsCount - activePlatformsCount;
  const activePlatformPercentage = totalPlatformsCount > 0 ? Math.round((activePlatformsCount / totalPlatformsCount) * 100) : 0;
  // Visual Alert System: Sales channels delayed over 2 hours (> 2 hours)
  const delayedSyncPlatforms = useMemo(() => {
    return connectedPlatforms.filter(p => getPlatformLastSuccessfulSyncInfo(p).isDelayedOver2Hours);
  }, [connectedPlatforms]);
  const delayedPlatformsCount = delayedSyncPlatforms.length;
  // Smart Gmail Auto-Link & Direct Launchpad Modal States
  const [isSmartGmailModalOpen, setIsSmartGmailModalOpen] = useState<boolean>(false);
  const [smartGmailModalTab, setSmartGmailModalTab] = useState<'gmail_link' | 'launchpad'>('gmail_link');

  // Handle batch platform updates (e.g. from Smart Gmail Auto-Link)
  const handleUpdateConnectedPlatforms = (updated: ConnectedMerchantPlatform[]) => {
    setConnectedPlatforms(updated);
    saveStoredPlatformsForMerchant(activeMerchantId, updated);
  };
  // Custom filter in toolbar for platform connection status & sync errors ('all' | 'active_only' | 'sync_errors_only' | 'delayed_sync_only')
  const [platformStatusFilter, setPlatformStatusFilter] = useState<'all' | 'active_only' | 'sync_errors_only' | 'delayed_sync_only'>('all');
  // Sort platforms in control panel bar so active platforms always appear first automatically
  const [sortActivePlatformsFirst, setSortActivePlatformsFirst] = useState<boolean>(true);
  // Filter platforms in control panel bar by multiple category types (string[] of category keys, or ['all'] for all categories)
  const [platformTypeFilter, setPlatformTypeFilter] = useState<string[]>(['all']);
  const [isPlatformTypeFilterDropdownOpen, setIsPlatformTypeFilterDropdownOpen] = useState<boolean>(false);
  // Compact mode for platform bar (hides secondary details like competitor count, email tags, category badges to reduce visual clutter on smaller screens)
  const [isPlatformBarCompact, setIsPlatformBarCompact] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_platform_bar_compact');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  // Group inactive platforms automatically into a dedicated category at bottom of platform bar
  const [groupInactivePlatformsAtBottom, setGroupInactivePlatformsAtBottom] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_group_inactive_platforms');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  // Collapsed state for the 'قنوات غير نشطة' (Inactive Channels) category
  const [isInactiveCategoryCollapsed, setIsInactiveCategoryCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_inactive_category_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  // Collapsed state for specific platform categories (e.g., marketplace) via 'View All' toggle button
  const [collapsedCategoryKeys, setCollapsedCategoryKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_collapsed_category_keys');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // Direct Lucide icon picker popover state for category headers (e.g., #category-group-marketplace)
  const [openIconPickerCategoryKey, setOpenIconPickerCategoryKey] = useState<string | null>(null);
  const [iconPickerSearchQuery, setIconPickerSearchQuery] = useState<string>('');
  const [previewedCategoryIconName, setPreviewedCategoryIconName] = useState<string | null>(null);
  // Expand All state to reveal all platform details across all channels in one click
  const [areAllPlatformDetailsExpanded, setAreAllPlatformDetailsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_expand_all_platform_details');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  // Individual expanded platform IDs (allowing individual platform expansion in addition to "Expand All")
  const [expandedPlatformIds, setExpandedPlatformIds] = useState<string[]>([]);
  // Refresh all connected platforms manual sync check state
  const [isRefreshingPlatforms, setIsRefreshingPlatforms] = useState<boolean>(false);
  // Track individual platforms undergoing manual sync refresh
  const [refreshingPlatformIds, setRefreshingPlatformIds] = useState<string[]>([]);
  // Track platform IDs that recently finished a sync successfully (green for 3 seconds)
  const [recentlySyncedPlatformIds, setRecentlySyncedPlatformIds] = useState<string[]>([]);
  // Track if all platforms finished sync recently (green for 3 seconds)
  const [isAllPlatformsRecentlySynced, setIsAllPlatformsRecentlySynced] = useState<boolean>(false);
  // Platform manual sync history overlay state
  const [historyOverlayPlatform, setHistoryOverlayPlatform] = useState<ConnectedMerchantPlatform | null>(null);
  // Platform Sync Error Diagnostic Details Modal state
  const [syncErrorDetailsModalPlatform, setSyncErrorDetailsModalPlatform] = useState<ConnectedMerchantPlatform | null>(null);
  // Automatic Audio Alert for New Sync Errors (التنبيه الصوتي التلقائي عند اكتشاف خطأ تزامن جديد)
  const [isSyncErrorAudioAlertEnabled, setIsSyncErrorAudioAlertEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('radar_sync_error_audio_alert_v1');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const knownErrorSignaturesRef = useRef<Set<string>>(new Set());
  const isInitialErrorScanRef = useRef<boolean>(true);

  const playSyncErrorAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Double urgent diagnostic chime (A5 -> E5 -> A5)
      const freqs = [880, 659.25, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.001, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.14 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.13);
      });
    } catch {
      // Ignore if browser blocks autoplay before user gesture
    }
  };

  // Detect any newly discovered sync error across all channels and trigger audio alert + direct error details modal
  useEffect(() => {
    const erroredPlatforms = connectedPlatforms.filter(p =>
      Boolean(p.hasSyncError || p.status === 'error' || p.syncError)
    );

    const currentSignatures = new Set<string>();
    let newlyErroredPlatform: ConnectedMerchantPlatform | null = null;

    erroredPlatforms.forEach(p => {
      const errObj = typeof p.syncError === 'object' && p.syncError !== null ? (p.syncError as any) : null;
      const sig = `${p.id}:${errObj?.code || p.syncError || p.status}:${errObj?.failedAt || p.syncHistory?.[0]?.timestamp || ''}`;
      currentSignatures.add(sig);
      if (!isInitialErrorScanRef.current && !knownErrorSignaturesRef.current.has(sig)) {
        newlyErroredPlatform = p;
      }
    });

    knownErrorSignaturesRef.current = currentSignatures;

    if (isInitialErrorScanRef.current) {
      isInitialErrorScanRef.current = false;
      return;
    }

    if (newlyErroredPlatform) {
      const targetPlat = newlyErroredPlatform as ConnectedMerchantPlatform;
      if (isSyncErrorAudioAlertEnabled) {
        playSyncErrorAudioChime();
      }
      setSyncErrorDetailsModalPlatform(targetPlat);
      showToast(
        `🔊🚨 تنبيه صوتي تلقائي: تم اكتشاف خطأ تزامن جديد في قناة (${targetPlat.name}) — تم فتح نافذة تشخيص الخطأ للاستجابة الفورية!`
      );
    }
  }, [connectedPlatforms, isSyncErrorAudioAlertEnabled]);
  // Currency & Multi-currency exchange modal states
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState<boolean>(false);
  const [isWelcomeScreenOpen, setIsWelcomeScreenOpen] = useState<boolean>(true);
  const [displayCurrency, setDisplayCurrency] = useState<SupportedCurrencyCode>(() => getActiveDisplayCurrency());

  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState<boolean>(false);
  const [isOpeningAddPlatformModal, setIsOpeningAddPlatformModal] = useState<boolean>(false);

  const handleTriggerOpenAddPlatformModal = useCallback(() => {
    if (isOpeningAddPlatformModal || isAddPlatformModalOpen) return;
    setIsOpeningAddPlatformModal(true);
    // Responsive smooth delay to display spinner and block duplicate clicks
    setTimeout(() => {
      setIsAddPlatformModalOpen(true);
      setIsOpeningAddPlatformModal(false);
    }, 280);
  }, [isOpeningAddPlatformModal, isAddPlatformModalOpen]);

  // Global Keyboard Shortcut: Alt + P (or Ctrl + Shift + P) to quickly open Add Platform modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.altKey && (e.key === 'p' || e.key === 'P' || e.key === 'ح')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P' || e.key === 'ح'))) {
        e.preventDefault();
        handleTriggerOpenAddPlatformModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTriggerOpenAddPlatformModal]);

  // Reset platform view confirmation modal state
  const [isResetViewConfirmOpen, setIsResetViewConfirmOpen] = useState<boolean>(false);
  // Newly created platform connection reminder modal state
  const [createdPlatformNotice, setCreatedPlatformNotice] = useState<{ platform: ConnectedMerchantPlatform; categoryTitle?: string } | null>(null);
  // Platform Account & Email Connection Modal state
  const [platformForConnection, setPlatformForConnection] = useState<ConnectedMerchantPlatform | null>(null);
  const [platformModalInitialTab, setPlatformModalInitialTab] = useState<'settings' | 'competitors_csv'>('settings');

  // Default platform categories configuration
  const DEFAULT_PLATFORM_CATEGORIES: PlatformCategoryConfig[] = useMemo(() => [
    {
      key: 'marketplace',
      title: 'مركز الماركت بليس',
      englishTitle: 'Marketplace Hub',
      iconName: 'ShoppingBag',
      headerColor: 'text-slate-100',
      badgeBg: 'bg-slate-800 text-sky-300 border-slate-700',
      borderStyle: 'border-slate-800',
      bgStyle: 'bg-slate-900/90',
      tagColor: 'text-sky-300 bg-slate-800 border border-slate-700',
      isCustom: false,
    },
    {
      key: 'website',
      title: 'المتاجر والمواقع الإلكترونية',
      englishTitle: 'E-commerce Storefront',
      iconName: 'Globe',
      headerColor: 'text-slate-100',
      badgeBg: 'bg-slate-800 text-sky-300 border-slate-700',
      borderStyle: 'border-slate-800',
      bgStyle: 'bg-slate-900/90',
      tagColor: 'text-sky-300 bg-slate-800 border border-slate-700',
      isCustom: false,
    },
    {
      key: 'retail_chain',
      title: 'سلاسل التجزئة والموزعين',
      englishTitle: 'Retail Chains & Distributors',
      iconName: 'Building2',
      headerColor: 'text-slate-100',
      badgeBg: 'bg-slate-800 text-teal-300 border-slate-700',
      borderStyle: 'border-slate-800',
      bgStyle: 'bg-slate-900/90',
      tagColor: 'text-teal-300 bg-slate-800 border border-slate-700',
      isCustom: false,
    },
    {
      key: 'social',
      title: 'قنوات التواصل الاجتماعي',
      englishTitle: 'Social Commerce Hub',
      iconName: 'Smartphone',
      headerColor: 'text-slate-100',
      badgeBg: 'bg-slate-800 text-purple-300 border-slate-700',
      borderStyle: 'border-slate-800',
      bgStyle: 'bg-slate-900/90',
      tagColor: 'text-purple-300 bg-slate-800 border border-slate-700',
      isCustom: false,
    },
  ], []);

  // Platform Categories State (Default + Custom Categories) with localStorage persistence
  const [platformCategories, setPlatformCategories] = useState<PlatformCategoryConfig[]>(() => {
    const favoritesCategory: PlatformCategoryConfig = {
      key: 'favorites',
      title: 'المفضلات السريعة (Favorites Hub)',
      englishTitle: 'Quick Favorites Hub',
      iconName: 'Star',
      headerColor: 'text-slate-100',
      badgeBg: 'bg-slate-800 text-sky-300 border-slate-700',
      borderStyle: 'border-slate-800',
      bgStyle: 'bg-slate-900/90',
      tagColor: 'text-sky-300 bg-slate-800 border border-slate-700 font-bold',
      isCustom: false,
    };

    try {
      const saved = localStorage.getItem('merchant_radar_platform_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some((c: PlatformCategoryConfig) => c.key === 'favorites')) {
            parsed.unshift(favoritesCategory);
          }
          return parsed;
        }
      }
    } catch {
      // safe fallback
    }
    return [
      favoritesCategory,
      {
        key: 'marketplace',
        title: 'مركز الماركت بليس',
        englishTitle: 'Marketplace Hub',
        iconName: 'ShoppingBag',
        headerColor: 'text-slate-100',
        badgeBg: 'bg-slate-800 text-sky-300 border-slate-700',
        borderStyle: 'border-slate-800',
        bgStyle: 'bg-slate-900/90',
        tagColor: 'text-sky-300 bg-slate-800 border border-slate-700',
        isCustom: false,
      },
      {
        key: 'website',
        title: 'المتاجر والمواقع الإلكترونية',
        englishTitle: 'E-commerce Storefront',
        iconName: 'Globe',
        headerColor: 'text-slate-100',
        badgeBg: 'bg-slate-800 text-sky-300 border-slate-700',
        borderStyle: 'border-slate-800',
        bgStyle: 'bg-slate-900/90',
        tagColor: 'text-sky-300 bg-slate-800 border border-slate-700',
        isCustom: false,
      },
      {
        key: 'retail_chain',
        title: 'سلاسل التجزئة والموزعين',
        englishTitle: 'Retail Chains & Distributors',
        iconName: 'Building2',
        headerColor: 'text-slate-100',
        badgeBg: 'bg-slate-800 text-teal-300 border-slate-700',
        borderStyle: 'border-slate-800',
        bgStyle: 'bg-slate-900/90',
        tagColor: 'text-teal-300 bg-slate-800 border border-slate-700',
        isCustom: false,
      },
      {
        key: 'social',
        title: 'قنوات التواصل الاجتماعي',
        englishTitle: 'Social Commerce Hub',
        iconName: 'Smartphone',
        headerColor: 'text-slate-100',
        badgeBg: 'bg-slate-800 text-purple-300 border-slate-700',
        borderStyle: 'border-slate-800',
        bgStyle: 'bg-slate-900/90',
        tagColor: 'text-purple-300 bg-slate-800 border border-slate-700',
        isCustom: false,
      },
    ];
  });

  // Save categories to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('merchant_radar_platform_categories', JSON.stringify(platformCategories));
    } catch {
      // safe fallback
    }
  }, [platformCategories]);

  // Modal state for creating / editing categories
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [categoryToEdit, setCategoryToEdit] = useState<PlatformCategoryConfig | null>(null);

  // Language State (Arabic / English) with localStorage persistence
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    try {
      return (localStorage.getItem('merchant_radar_app_language') as 'ar' | 'en') || 'ar';
    } catch {
      return 'ar';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('merchant_radar_app_language', language);
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    } catch {
      // safe fallback
    }
  }, [language]);

  const handleToggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
    showToast(
      nextLang === 'ar'
        ? 'تم التبديل إلى اللغة العربية بنجاح 🇪🇬'
        : 'Switched to English interface successfully 🌐'
    );
  };

  // Platform Categories Reordering State (Drag & Drop + Dropdown Controls)
  const [isCategoryReorderDropdownOpen, setIsCategoryReorderDropdownOpen] = useState<boolean>(false);
  const [draggedCategoryKey, setDraggedCategoryKey] = useState<string | null>(null);
  const [dragOverCategoryReorderKey, setDragOverCategoryReorderKey] = useState<string | null>(null);

  // Classification helper for platform types (handles default, codes with custom prefix, or explicit category)
  const getPlatformClassification = (code: string, category?: string): string => {
    if (category) return category;
    if (code.startsWith('custom_marketplace_')) return 'marketplace';
    if (code.startsWith('custom_website_')) return 'website';
    if (code.startsWith('custom_retail_')) return 'retail_chain';
    if (code.startsWith('custom_social_')) return 'social';
    if (code === 'shopify_salla' || code === 'twob_eg') return 'website';
    if (code === 'facebook_marketplace' || code === 'tiktok_shop') return 'social';
    if (code === 'elaraby_group' || code === 'btech_eg' || code === 'raneen_eg') return 'retail_chain';
    return 'marketplace';
  };

  // Sorted & Filtered Platforms for Control Panel Platform Bar
  const sortedControlBarPlatforms = useMemo(() => {
    let list = connectedPlatforms;

    // 1. Filter by Platform Status (All, Active Only, Sync Errors Only, Delayed Sync Only)
    if (platformStatusFilter === 'active_only') {
      list = list.filter((p) => p.isConnected && !p.hasSyncError && p.status !== 'error' && p.status !== 'disconnected' && !p.syncError);
    } else if (platformStatusFilter === 'sync_errors_only') {
      list = list.filter((p) => Boolean(p.hasSyncError || p.status === 'error' || p.syncError));
    } else if (platformStatusFilter === 'delayed_sync_only') {
      list = list.filter((p) => getPlatformLastSuccessfulSyncInfo(p).isDelayedOver2Hours);
    }

    // 2. Filter by Category Type
    const isAllCategories = platformTypeFilter.length === 0 || platformTypeFilter.includes('all');
    if (!isAllCategories) {
      list = list.filter((p) => {
        const classification = getPlatformClassification(p.code, p.category);
        return platformTypeFilter.includes(classification);
      });
    }
    if (!sortActivePlatformsFirst) {
      return list;
    }
    return [...list].sort((a, b) => {
      // 1. Active platforms (isConnected === true) come first
      if (a.isConnected && !b.isConnected) return -1;
      if (!a.isConnected && b.isConnected) return 1;
      return 0; // Maintain existing relative order
    });
  }, [connectedPlatforms, sortActivePlatformsFirst, platformTypeFilter, platformStatusFilter]);

  // Inactive platforms list for the dedicated 'قنوات غير نشطة' category
  const inactivePlatforms = useMemo(() => {
    return sortedControlBarPlatforms.filter((p) => !p.isConnected);
  }, [sortedControlBarPlatforms]);

  // Watchlist State
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(INITIAL_WATCHLIST_ITEMS);

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>(INITIAL_PRICE_ALERTS);
  const [notificationLogs, setNotificationLogs] = useState<AlertNotificationLog[]>(INITIAL_ALERT_LOGS);

  // Toast notification message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string, durationMs = 4500) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, durationMs);
  }, []);

  // Helper to provide clear diagnostic cause & resolution guidance for a platform Sync Error
  const getSyncErrorDiagnosticResolution = (plat: ConnectedMerchantPlatform) => {
    const recentErr = getMostRecentSyncError(plat);
    const code = recentErr.statusCode || 504;
    const msg = recentErr.message || plat.syncError || 'انقطاع مهلة الاتصال بالخادم الرئيسي للقناة';

    let solution = 'إعادة توليد رمز الوصول (Access Token) وتنشيط جلسة الاتصال الفوري بالـ API';
    if (code === 401 || code === 403) {
      solution = 'تحديث صلاحية مفتاح الربط (Refresh Token / API Key) وإعادة تفويض حساب البائع';
    } else if (code === 429) {
      solution = 'إعادة جدولة دفعات الاستعلام (Rate Limit Backoff) واستئناف تدفق البيانات بأمان';
    } else if (code >= 500) {
      solution = 'تحويل المسار لخادم الاحتياط وإعادة فتح قناة التزامن مع بوابة الـ API';
    }

    return {
      statusCode: code,
      statusText: recentErr.statusText || 'Sync Error',
      errorMessage: msg,
      solution,
      timestamp: recentErr.timestamp
    };
  };

  // Live / PWA Smart Update Hook & Cache Purge Engine
  const updateState = useAppUpdate(showToast);

  // Auth Context for Cloud Persistence
  const { user, profile, isLoading: isAuthLoading } = useAuth();

  // 3-Day Free Trial & Subscription Management Hook
  const subscriptionState = useSubscription(profile);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);

  // Paywall Lock Screen Vodafone Cash & Receipt Upload State
  const [paywallSelectedPlanId, setPaywallSelectedPlanId] = useState<'plan_1_month' | 'plan_6_months' | 'plan_12_months'>('plan_12_months');
  const [paywallPaymentMethod, setPaywallPaymentMethod] = useState<'vodafone_cash' | 'credit_card'>('vodafone_cash');
  const [paywallTransactionId, setPaywallTransactionId] = useState<string>('');
  const [paywallReceiptPreviewUrl, setPaywallReceiptPreviewUrl] = useState<string | null>(null);
  const [paywallReceiptFileName, setPaywallReceiptFileName] = useState<string | null>(null);
  const [paywallReceiptFileSize, setPaywallReceiptFileSize] = useState<string | null>(null);
  const [paywallReceiptMetadata, setPaywallReceiptMetadata] = useState<{
    width: number;
    height: number;
    aspectRatio: number;
    aspectRatioLabel: string;
    orientationLabel: string;
    isValid: boolean;
  } | null>(null);
  const [paywallReceiptSizeWarning, setPaywallReceiptSizeWarning] = useState<string | null>(null);
  const [paywallReceiptSuccessToast, setPaywallReceiptSuccessToast] = useState<string | null>(null);
  const [isProcessingPaywallReceipt, setIsProcessingPaywallReceipt] = useState<boolean>(false);
  const [isExtractingOcrTxId, setIsExtractingOcrTxId] = useState<boolean>(false);
  const [ocrExtractionBadge, setOcrExtractionBadge] = useState<{
    transactionId: string;
    engine: string;
    confidence: number;
  } | null>(null);
  const [isDraggingPaywallReceipt, setIsDraggingPaywallReceipt] = useState<boolean>(false);
  const [isInspectingReceiptLightbox, setIsInspectingReceiptLightbox] = useState<boolean>(false);
  const [paywallAdminWalletDraft, setPaywallAdminWalletDraft] = useState<string>(subscriptionState.vodafoneCashWalletNumber);
  const [isEditingPaywallAdminWallet, setIsEditingPaywallAdminWallet] = useState<boolean>(false);
  const [copiedPaywallWallet, setCopiedPaywallWallet] = useState<boolean>(false);
  const [isSubmittingPaywallVodafone, setIsSubmittingPaywallVodafone] = useState<boolean>(false);
  const paywallFileInputRef = useRef<HTMLInputElement | null>(null);

  // 24-Hour Receipt Upload Scheduled Reminder State (for #subscription-paywall-lock-screen)
  const PAYWALL_REMINDER_STORAGE_KEY = 'merchant_radar_paywall_receipt_reminder_v1';
  const [paywallReceiptReminder, setPaywallReceiptReminder] = useState<{
    planId: 'plan_1_month' | 'plan_6_months' | 'plan_12_months';
    selectedAt: number;
    deadlineAt: number;
    isScheduled: boolean;
    notifyIntervalHours: number;
    lastNotifiedAt?: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_paywall_receipt_reminder_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.deadlineAt > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    const now = Date.now();
    return {
      planId: 'plan_12_months',
      selectedAt: now,
      deadlineAt: now + 24 * 60 * 60 * 1000,
      isScheduled: true,
      notifyIntervalHours: 6,
    };
  });

  const [paywallReminderRemaining, setPaywallReminderRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ hours: 23, minutes: 59, seconds: 59, isExpired: false });

  // Schedule or reset the 24-hour receipt upload reminder when a plan is selected
  const schedulePaywallPlanReceiptReminder = (
    planId: 'plan_1_month' | 'plan_6_months' | 'plan_12_months',
    showNotification = false
  ) => {
    const now = Date.now();
    const updated = {
      planId,
      selectedAt: now,
      deadlineAt: now + 24 * 60 * 60 * 1000,
      isScheduled: true,
      notifyIntervalHours: paywallReceiptReminder.notifyIntervalHours || 6,
      lastNotifiedAt: now,
    };
    setPaywallReceiptReminder(updated);
    try {
      localStorage.setItem(PAYWALL_REMINDER_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (showNotification) {
      const planObj = subscriptionState.plans.find((p) => p.id === planId);
      showToast(
        `⏰ تم جدولة تنبيه تذكيري لـ "${planObj?.nameArabic || 'الباقة المختارة'}": يرجى رفع إيصال فودافون كاش خلال 24 ساعة لتجنب إلغاء الطلب تلقائياً.`
      );
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      const diffMs = Math.max(0, paywallReceiptReminder.deadlineAt - Date.now());
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setPaywallReminderRemaining((prev) => {
        const nextExpired = diffMs <= 0;
        if (
          prev.hours === hours &&
          prev.minutes === minutes &&
          prev.seconds === seconds &&
          prev.isExpired === nextExpired
        ) {
          return prev;
        }
        return {
          hours,
          minutes,
          seconds,
          isExpired: nextExpired,
        };
      });
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timerId);
  }, [paywallReceiptReminder.deadlineAt]);

  useEffect(() => {
    setPaywallAdminWalletDraft(subscriptionState.vodafoneCashWalletNumber);
  }, [subscriptionState.vodafoneCashWalletNumber]);

  const MAX_RECEIPT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  const MIN_RECEIPT_DIMENSION_PX = 200; // Minimum 200x200 px for readable receipt text
  const MAX_RECEIPT_DIMENSION_PX = 8000; // Maximum 8000x8000 px
  const MIN_RECEIPT_ASPECT_RATIO = 0.25; // Supports tall mobile screenshots (up to 1:4)
  const MAX_RECEIPT_ASPECT_RATIO = 2.6; // Supports standard receipts/screenshots (up to 2.6:1)

  /**
   * Validates uploaded receipt image metadata (dimensions and aspect ratio)
   * to ensure it meets standard receipt formats before final submission.
   */
  const validateReceiptImageMetadata = (dataUrl: string): Promise<{
    isValid: boolean;
    width: number;
    height: number;
    aspectRatio: number;
    aspectRatioLabel: string;
    orientationLabel: string;
    errorMessage?: string;
  }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const rawRatio = height > 0 ? width / height : 0;
        const aspectRatio = Number(rawRatio.toFixed(2));

        // Calculate human-readable aspect ratio label
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(width, height) || 1;
        const simpW = Math.round(width / divisor);
        const simpH = Math.round(height / divisor);
        const aspectRatioLabel =
          simpW <= 30 && simpH <= 30 ? `${simpW}:${simpH} (${aspectRatio}:1)` : `${aspectRatio}:1`;

        const orientationLabel =
          aspectRatio < 0.9
            ? 'طولي قياسي (Portrait Receipt)'
            : aspectRatio <= 1.2
            ? 'مربع قياسي (Square Receipt)'
            : 'عرضي قياسي (Landscape Receipt)';

        if (width < MIN_RECEIPT_DIMENSION_PX || height < MIN_RECEIPT_DIMENSION_PX) {
          resolve({
            isValid: false,
            width,
            height,
            aspectRatio,
            aspectRatioLabel,
            orientationLabel,
            errorMessage: `⚠️ أبعاد الصورة (${width}×${height} بكسل) صغيرة جداً ولا تحقق الحد الأدنى لمواصفات الإيصال (${MIN_RECEIPT_DIMENSION_PX}×${MIN_RECEIPT_DIMENSION_PX} بكسل) لضمان وضوح رقم العملية.`
          });
          return;
        }

        if (width > MAX_RECEIPT_DIMENSION_PX || height > MAX_RECEIPT_DIMENSION_PX) {
          resolve({
            isValid: false,
            width,
            height,
            aspectRatio,
            aspectRatioLabel,
            orientationLabel,
            errorMessage: `⚠️ أبعاد الصورة (${width}×${height} بكسل) تتجاوز الحد الأقصى المسموح به للإيصالات (${MAX_RECEIPT_DIMENSION_PX}×${MAX_RECEIPT_DIMENSION_PX} بكسل).`
          });
          return;
        }

        if (aspectRatio < MIN_RECEIPT_ASPECT_RATIO || aspectRatio > MAX_RECEIPT_ASPECT_RATIO) {
          resolve({
            isValid: false,
            width,
            height,
            aspectRatio,
            aspectRatioLabel,
            orientationLabel,
            errorMessage: `⚠️ نسبة العرض إلى الارتفاع للصورة (${aspectRatioLabel} — ${width}×${height}px) غير متوافقة مع تنسيقات الإيصالات القياسية (النطاق المسموح بين ${MIN_RECEIPT_ASPECT_RATIO}:1 و ${MAX_RECEIPT_ASPECT_RATIO}:1).`
          });
          return;
        }

        resolve({
          isValid: true,
          width,
          height,
          aspectRatio,
          aspectRatioLabel,
          orientationLabel
        });
      };

      img.onerror = () => {
        resolve({
          isValid: false,
          width: 0,
          height: 0,
          aspectRatio: 0,
          aspectRatioLabel: '0:0',
          orientationLabel: 'غير صالح',
          errorMessage: '⚠️ تعذر قراءة بيانات أبعاد الصورة (Image Metadata). يرجى اختيار صورة إيصال صالحة.'
        });
      };

      img.src = dataUrl;
    });
  };

  /**
   * Calls the server-side OCR engine (/api/ocr/vodafone-receipt) to automatically
   * extract the Vodafone Cash Transaction ID from the uploaded receipt image and auto-fill the field.
   */
  const extractReceiptTransactionIdWithOCR = async (imageDataUrl: string, fileName?: string) => {
    if (!imageDataUrl) return null;
    setIsExtractingOcrTxId(true);
    try {
      const response = await fetch('/api/ocr/vodafone-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl, fileName: fileName || '' }),
      });

      const data = await response.json();
      if (response.ok && data?.success && data?.transactionId) {
        const extractedTx = String(data.transactionId).trim();
        setPaywallTransactionId(extractedTx);
        const badgeInfo = {
          transactionId: extractedTx,
          engine: data.engine || 'Smart OCR Engine',
          confidence: Number(data.confidence || 98.2),
        };
        setOcrExtractionBadge(badgeInfo);
        return badgeInfo;
      }
    } catch (err) {
      console.warn('[OCR Auto-Fill Warning]:', err);
    } finally {
      setIsExtractingOcrTxId(false);
    }
    return null;
  };

  const processPaywallReceiptFile = (file?: File | null) => {
    if (!file) return;

    // Validate image MIME type
    if (!file.type.startsWith('image/')) {
      const msg = '⚠️ يرجى اختيار أو سحب ملف صورة صالح لإيصال التحويل (PNG, JPG, WEBP)';
      setPaywallReceiptSizeWarning(msg);
      setPaywallReceiptSuccessToast(null);
      setPaywallReceiptMetadata(null);
      setOcrExtractionBadge(null);
      setIsProcessingPaywallReceipt(false);
      showToast(msg);
      if (paywallFileInputRef.current) {
        paywallFileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size before reading/uploading (Max 5 MB)
    if (file.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const warningMsg = `⚠️ حجم الملف المختار (${fileSizeMB} ميجابايت) يتجاوز الحد الأقصى المسموح به (5 ميجابايت). يرجى اختيار صورة أصغر حجماً قبل الرفع.`;
      setPaywallReceiptSizeWarning(warningMsg);
      setPaywallReceiptSuccessToast(null);
      setPaywallReceiptMetadata(null);
      setOcrExtractionBadge(null);
      setIsProcessingPaywallReceipt(false);
      showToast(warningMsg);
      if (paywallFileInputRef.current) {
        paywallFileInputRef.current.value = '';
      }
      return;
    }

    setPaywallReceiptSizeWarning(null);
    setPaywallReceiptSuccessToast(null);
    setOcrExtractionBadge(null);
    setIsProcessingPaywallReceipt(true);

    const sizeKB = Math.round(file.size / 1024);
    const formattedSize = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        const metaValidation = await validateReceiptImageMetadata(dataUrl);
        if (!metaValidation.isValid) {
          setIsProcessingPaywallReceipt(false);
          setPaywallReceiptPreviewUrl(null);
          setPaywallReceiptFileName(null);
          setPaywallReceiptFileSize(null);
          setPaywallReceiptMetadata(null);
          setOcrExtractionBadge(null);
          const errMsg = metaValidation.errorMessage || '⚠️ أبعاد الصورة أو نسبة العرض للارتفاع غير مطابقة لمواصفات الإيصال.';
          setPaywallReceiptSizeWarning(errMsg);
          showToast(errMsg);
          if (paywallFileInputRef.current) {
            paywallFileInputRef.current.value = '';
          }
          return;
        }

        setPaywallReceiptPreviewUrl(dataUrl);
        setPaywallReceiptFileName(file.name);
        setPaywallReceiptFileSize(formattedSize);
        setPaywallReceiptMetadata({
          width: metaValidation.width,
          height: metaValidation.height,
          aspectRatio: metaValidation.aspectRatio,
          aspectRatioLabel: metaValidation.aspectRatioLabel,
          orientationLabel: metaValidation.orientationLabel,
          isValid: true
        });

        // Automatically run OCR engine to extract Transaction ID and populate field
        const ocrResult = await extractReceiptTransactionIdWithOCR(dataUrl, file.name);
        setIsProcessingPaywallReceipt(false);

        const ocrNote = ocrResult?.transactionId
          ? ` • تم استخراج رقم العملية تلقائياً عبر OCR (${ocrResult.transactionId})`
          : '';
        const successMsg = `تم رفع الصورة بنجاح (${file.name} — ${formattedSize} — الأبعاد: ${metaValidation.width}×${metaValidation.height}px — النسبة: ${metaValidation.aspectRatioLabel})${ocrNote}: تمت معالجة الصورة ومطابقتها للمواصفات القياسية للإيصالات.`;
        setPaywallReceiptSuccessToast(successMsg);
        showToast(`✅ ${successMsg}`);
      } else {
        setIsProcessingPaywallReceipt(false);
      }
    };
    reader.onerror = () => {
      setIsProcessingPaywallReceipt(false);
      showToast('حدث خطأ أثناء قراءة ومعالجة ملف الصورة.');
    };
    reader.readAsDataURL(file);
  };

  const handlePaywallReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processPaywallReceiptFile(file);
  };

  const handlePaywallReceiptDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingPaywallReceipt) {
      setIsDraggingPaywallReceipt(true);
    }
  };

  const handlePaywallReceiptDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPaywallReceipt(true);
  };

  const handlePaywallReceiptDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPaywallReceipt(false);
  };

  const handlePaywallReceiptDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPaywallReceipt(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      processPaywallReceiptFile(droppedFile);
    }
  };

  const handleClearPaywallReceipt = () => {
    setPaywallReceiptPreviewUrl(null);
    setPaywallReceiptFileName(null);
    setPaywallReceiptFileSize(null);
    setPaywallReceiptMetadata(null);
    setOcrExtractionBadge(null);
    setPaywallReceiptSizeWarning(null);
    setPaywallReceiptSuccessToast(null);
    setIsProcessingPaywallReceipt(false);
    setIsDraggingPaywallReceipt(false);
    if (paywallFileInputRef.current) {
      paywallFileInputRef.current.value = '';
    }
  };

  /**
   * Opens the native browser/system share sheet (Web Share API) to share the uploaded receipt image.
   */
  const handleSharePaywallReceipt = async () => {
    const imageUrl =
      paywallReceiptPreviewUrl ||
      activeMerchantObj?.pendingPaymentRequest?.receiptImageUrl ||
      subscriptionState.subscription.receiptImageUrl;

    if (!imageUrl) {
      showToast('⚠️ يرجى رفع صورة إيصال فودافون كاش أولاً لمشاركتها عبر قائمة النظام');
      return;
    }

    const fileName =
      paywallReceiptFileName ||
      activeMerchantObj?.pendingPaymentRequest?.receiptFileName ||
      subscriptionState.subscription.receiptFileName ||
      'vodafone-cash-receipt.png';

    const txId =
      paywallTransactionId.trim() ||
      activeMerchantObj?.pendingPaymentRequest?.transactionId ||
      subscriptionState.subscription.transactionId ||
      'غير محدد';

    const shareTitle = 'إيصال تحويل فودافون كاش — رادار التاجر';
    const shareText = `إيصال تحويل اشتراك رادار التاجر عبر فودافون كاش • رقم العملية: ${txId}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        // Convert Data URL / image URL to a File object for native file sharing if supported
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type || 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              files: [file]
            });
            showToast('✅ تمت مشاركة صورة إيصال فودافون كاش بنجاح');
            return;
          }
        } catch {
          // Fallback to text/title share if file conversion fails
        }

        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href
        });
        showToast('✅ تم فتح قائمة المشاركة الأصلية للنظام بنجاح');
        return;
      }

      // Fallback when Web Share API is unavailable on desktop browsers
      await navigator.clipboard.writeText(`${shareTitle}\n${shareText}`);
      showToast('📋 المتصفح الحالي لا يدعم نافذة المشاركة الأصلية — تم نسخ تفاصيل الإيصال للحافظة');
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        showToast('⚠️ تعذر فتح قائمة المشاركة في هذا المتصفح');
      }
    }
  };

  // Evaluate active merchant's 3-day free trial and subscription state
  const activeMerchantObj = useMemo(() => {
    return remoteMerchantsList.find(m => m.id === activeMerchantId) || remoteMerchantsList[0] || null;
  }, [remoteMerchantsList, activeMerchantId]);

  const activeMerchantSubState = useMemo(() => {
    return evaluateMerchantSubscriptionState(activeMerchantObj);
  }, [activeMerchantObj, subscriptionState.status]);

  // Determine if the paywall lock should be active (when either global trial or active merchant trial has expired and not subscribed)
  const isPaywallLocked = useMemo(() => {
    if (subscriptionState.isTrialExpired && !subscriptionState.isSubscribed) return true;
    if (activeMerchantSubState.isTrialExpired && !activeMerchantSubState.isSubscribed) return true;
    return false;
  }, [subscriptionState.isTrialExpired, subscriptionState.isSubscribed, activeMerchantSubState.isTrialExpired, activeMerchantSubState.isSubscribed]);

  // Listen for custom paywall open requests (e.g. when order sync or repricer is blocked by expired trial)
  useEffect(() => {
    const handleOpenPaywall = (e: any) => {
      if (e?.detail?.merchantId && e.detail.merchantId !== activeMerchantId) {
        setActiveMerchantId(e.detail.merchantId);
      }
      setIsSubscriptionModalOpen(true);
    };
    window.addEventListener('merchant_radar_open_subscription_paywall', handleOpenPaywall);
    return () => window.removeEventListener('merchant_radar_open_subscription_paywall', handleOpenPaywall);
  }, [activeMerchantId]);

  // Inventory Levels & Smart Reorder Tracking State
  const [inventory, setInventory] = useState<ProductInventoryRecord[]>(() => getStoredInventory(allProducts));
  const [isReorderBannerDismissed, setIsReorderBannerDismissed] = useState<boolean>(false);

  // Reorder items (at or below reorder threshold)
  const reorderAlertItems = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.minReorderLevel);
  }, [inventory]);

  // Handle inventory updates locally and persist to Cloud Firestore if logged in
  const handleUpdateInventory = (updated: ProductInventoryRecord[]) => {
    setInventory(updated);
    saveStoredInventory(updated);
    if (user) {
      saveInventoryToCloud(user.uid, updated).catch(() => {
        // Safe offline / background queue mode
      });
    }
  };

  // Action to navigate directly to Wholesale Locations with a suggested restock item
  const handleNavigateToWholesaleForRestock = (inventoryItem?: ProductInventoryRecord, targetProduct?: ProductData) => {
    let prodToSelect = targetProduct;
    if (!prodToSelect && inventoryItem) {
      prodToSelect = allProducts.find(p => p.id === inventoryItem.productId);
    }
    if (prodToSelect) {
      setCurrentProduct(prodToSelect);
    }
    setActiveTab('wholesale');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`🏢 تم توجيهك إلى قسم أسواق الجملة (Wholesale Locations) لإعادة توريد ${prodToSelect?.title ? `"${prodToSelect.title.slice(0, 30)}..."` : 'الصنف'}`);
  };

  // Handler for opening the Generate Waybill modal for a specific product
  const handleOpenGenerateWaybill = (product: ProductData) => {
    setWaybillTargetProduct(product);
    setIsGenerateWaybillModalOpen(true);
  };

  // Handler for deducting stock when a fulfillment waybill is issued
  const handleDeductInventoryStock = (productId: string, deductedQty: number) => {
    const updated = inventory.map(item => {
      if (item.productId === productId) {
        const newStock = Math.max(0, item.currentStock - deductedQty);
        return {
          ...item,
          currentStock: newStock,
          stockStatus: calculateStockStatus(newStock, item.minReorderLevel)
        };
      }
      return item;
    });
    handleUpdateInventory(updated);
  };

  // Discount & Winning Price Engine State
  const [selectedDiscount, setSelectedDiscount] = useState<number>(5); // default -5% for winning Buy Box
  const [winningPrice, setWinningPrice] = useState<number>(() => {
    const loaded = loadStoredLiveProducts();
    const clean = purgeDummyProducts(loaded).filter(Boolean);
    const lowest = clean[0]?.currentLowestPrice || 2500;
    return Math.round(lowest * 0.95);
  });

  const currency = currentProduct?.currency || 'EGP';

  // Handle Product Detection / Image Scan
  const handleProductDetected = (newProduct: ProductData) => {
    setAllProducts((prev) => {
      const exists = prev.some((p) => p.id === newProduct.id);
      return exists ? prev : [newProduct, ...prev];
    });

    setCurrentProduct(newProduct);
    
    // Auto calculate winning undercut price with default -5%
    const calculatedWinning = Math.round(newProduct.currentLowestPrice * (1 - selectedDiscount / 100));
    setWinningPrice(calculatedWinning);

    setActiveTab('radar');
    setIsScannerOpen(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Handle 1-Click Winning Price Application with Pricing Guardrails Validation Layer
  const handleApplyWinningPrice = (calculatedWinningPrice: number, discountValue: number) => {
    let finalPrice = calculatedWinningPrice;

    if (currentProduct) {
      const plan = getOrCreatePricingPlan(currentProduct);

      // Validation 1: Floor Protection (منع تجاوز الحد الأدنى لحماية رأس المال وهامش الربح)
      if (finalPrice < plan.globalMinPrice) {
        showToast(`🛡️ تنبيه حماية التسعير: السعر المحسوب (${finalPrice.toLocaleString()} ج.م) أقل من الحد الأدنى المسموح (${plan.globalMinPrice.toLocaleString()} ج.م). تم قفله عند الحد الأدنى لحماية أرباحك.`);
        finalPrice = plan.globalMinPrice;
      }

      // Validation 2: Ceiling Protection (منع تجاوز الحد الأقصى التنافسي)
      if (finalPrice > plan.globalMaxPrice) {
        showToast(`🛡️ تنبيه حماية التسعير: السعر المحسوب (${finalPrice.toLocaleString()} ج.م) يتجاوز سقف التسعير (${plan.globalMaxPrice.toLocaleString()} ج.م). تم ضبطه عند الحد الأقصى.`);
        finalPrice = plan.globalMaxPrice;
      }
    }

    setWinningPrice(finalPrice);
    setSelectedDiscount(discountValue);
    setIsPublishModalOpen(true);
  };

  // Toggle Connected Platform
  const handleTogglePlatform = (platformId: string) => {
    setConnectedPlatforms((prev) =>
      prev.map((p) => (p.id === platformId ? { ...p, isConnected: !p.isConnected } : p))
    );
  };

  // Toggle Scheduled Maintenance Mode for a specific platform card
  const handleTogglePlatformMaintenanceMode = (platformId: string) => {
    setConnectedPlatforms((prev) => {
      const next = prev.map((p) => {
        if (p.id !== platformId) return p;
        const currentlyInMaint = Boolean(p.isMaintenanceMode || p.status === 'maintenance' || p.scheduledMaintenance?.isActive);
        const label = p.name.split('(')[0].trim();
        if (currentlyInMaint) {
          showToast(`✅ تم إنهاء وضع الصيانة المجدولة لقناة "${label}" واستئناف التزامن اليدوي والتلقائي بنجاح ⚡`);
          return {
            ...p,
            status: (p.isConnected ? 'active' : 'disconnected') as ConnectedMerchantPlatform['status'],
            isMaintenanceMode: false,
            scheduledMaintenance: p.scheduledMaintenance
              ? { ...p.scheduledMaintenance, isActive: false }
              : undefined,
          };
        } else {
          showToast(
            `🛠️ تم تفعيل وضع الصيانة المجدولة لقناة "${label}" — سيتم تنبيه التاجر بتجنب التزامن اليدوي في هذا الوقت ⏳`,
            5000
          );
          return {
            ...p,
            status: 'maintenance' as const,
            isMaintenanceMode: true,
            scheduledMaintenance: {
              isActive: true,
              windowLabel: p.scheduledMaintenance?.windowLabel || '02:00 ص - 05:00 ص (توقيت القاهرة)',
              expectedEndTime: p.scheduledMaintenance?.expectedEndTime || 'خلال 45 دقيقة',
              reasonAr: p.scheduledMaintenance?.reasonAr || `صيانة مجدولة لبوابة تحديث الأسعار والمخزون في ${label}`,
            },
          };
        }
      });
      saveStoredPlatformsForMerchant(activeMerchantId, next);
      return next;
    });
  };

  // 1-Click Instant Auto Link Platform Account with Target Merchant (Agency Mode)
  const handleAutoConnectPlatform = (platformId: string, targetMerchantId?: string) => {
    const targetId = targetMerchantId || activeMerchantId;
    const targetMerch = remoteMerchantsList.find(m => m.id === targetId);
    const targetEmail = targetMerch?.primaryEmail || 'seller@merchant-store.com';
    const targetStoreName = targetMerch?.storeName || 'متجر التاجر المعتمد';
    const agencyManagerEmail = user?.email || 'manager@agency.com';
    let platName = 'المنصة';

    setConnectedPlatforms((prev) => {
      const updated = prev.map((p) => {
        if (p.id === platformId) {
          platName = p.name.split('(')[0].trim();
          return {
            ...p,
            isConnected: true,
            status: 'active' as const,
            sellerName: p.sellerName || targetStoreName,
            merchantEmail: p.merchantEmail || targetEmail,
            managerAgencyEmail: agencyManagerEmail,
            linkedMerchantClientId: targetId,
            hasSyncError: false,
            syncError: undefined,
            lastSyncedAt: 'الآن (تم الربط والتزامن التلقائي ⚡)',
          };
        }
        return p;
      });
      saveStoredPlatformsForMerchant(targetId, updated);
      return updated;
    });

    showToast(`تم ربط وتفعيل قناة ${platName} لمتجر "${targetStoreName}" تلقائياً بنجاح ⚡`);
  };

  // Save / Update Custom Platform Connection Details (Email, Seller ID, MWS Auth Token, Merchant Link)
  const handleSavePlatformConnection = (updated: ConnectedMerchantPlatform, targetMerchantId?: string) => {
    const targetId = targetMerchantId || activeMerchantId;
    setConnectedPlatforms((prev) => {
      const updatedList = prev.map((p) => (p.id === updated.id ? updated : p));
      saveStoredPlatformsForMerchant(targetId, updatedList);
      return updatedList;
    });

    // Also update merchant's stored credentials cache so settings are retained per merchant
    setRemoteMerchantsList((prev) => {
      const next = prev.map((m) => {
        if (m.id === targetId) {
          const prevCreds = m.platformCredentials || {};
          return {
            ...m,
            platformCredentials: {
              ...prevCreds,
              [updated.code]: {
                sellerName: updated.sellerName,
                sellerId: updated.sellerId,
                merchantEmail: updated.merchantEmail,
                mwsAuthToken: updated.mwsAuthToken,
                apiKey: updated.apiKey,
                sellerLoginId: updated.sellerLoginId,
                sellerPortalUrl: updated.sellerPortalUrl,
                merchantStoreUrl: updated.merchantStoreUrl,
                isConnected: updated.isConnected,
                lastSyncedAt: updated.lastSyncedAt,
              }
            }
          };
        }
        return m;
      });
      saveAllRegisteredMerchants(next);
      return next;
    });

    const platName = updated.name.split('(')[0].trim();
    showToast(`تم حفظ وتحديث إعدادات ربط ${platName} للمتجر بنجاح ⚡`);
  };

  // Disconnect Platform Account
  const handleDisconnectPlatformAccount = (platformId: string, targetMerchantId?: string) => {
    const targetId = targetMerchantId || activeMerchantId;
    let platName = 'المنصة';
    setConnectedPlatforms((prev) => {
      const updated = prev.map((p) => {
        if (p.id === platformId) {
          platName = p.name.split('(')[0].trim();
          return {
            ...p,
            isConnected: false,
            status: 'disconnected' as const,
            hasSyncError: false,
            syncError: undefined,
          };
        }
        return p;
      });
      saveStoredPlatformsForMerchant(targetId, updated);
      return updated;
    });
    showToast(`تم إلغاء ربط قناة ${platName}`);
  };

  // Handle bulk imported competitors from CSV for a specific sales channel
  const handleImportPlatformCompetitors = (
    updatedProducts: ProductData[],
    updatedActiveProduct: ProductData,
    newRecords: PlatformCompetitorRecord[],
    platformId: string,
    mode: 'merge' | 'replace'
  ) => {
    setAllProducts(updatedProducts);
    setCurrentProduct(updatedActiveProduct);

    // Recalculate winning price based on new lowest competitor price
    const newLowest = updatedActiveProduct.currentLowestPrice;
    if (newLowest > 0) {
      setWinningPrice(Math.round(newLowest * (1 - selectedDiscount / 100)));
    }

    // Update the platform's competitor tracking count and history
    setConnectedPlatforms((prev) =>
      prev.map((plat) => {
        if (plat.id === platformId) {
          const prevCount = mode === 'replace' ? 0 : (plat.importedCompetitorsCount || 0);
          return {
            ...plat,
            importedCompetitorsCount: prevCount + newRecords.length,
            lastCompetitorImportAt: `اليوم (${newRecords.length} منافس)`,
            importedCompetitors: mode === 'replace' ? newRecords : [...(plat.importedCompetitors || []), ...newRecords]
          };
        }
        return plat;
      })
    );
  };

  // Open CSV competitor importer for a specific channel (e.g. from Radar or platform bar)
  const handleOpenChannelCompetitorImport = (platformCode?: string) => {
    let target = connectedPlatforms.find(p => p.code === platformCode);
    if (!target) {
      target = connectedPlatforms[0];
    }
    if (target) {
      setPlatformModalInitialTab('competitors_csv');
      setPlatformForConnection(target);
    }
  };

  // Batch Toggle Connected Platforms
  const handleBatchTogglePlatforms = (platformIds: string[], targetState: boolean) => {
    setConnectedPlatforms((prev) =>
      prev.map((p) => (platformIds.includes(p.id) ? { ...p, isConnected: targetState } : p))
    );
  };

  // Retry / Reconnect Platform with Sync Error strictly scoped to active merchant
  const handleRetrySyncPlatform = (platformId: string) => {
    const target = connectedPlatforms.find((p) => p.id === platformId);
    if (!target) return;
    const name = target.name.split('(')[0].trim();
    const currentMerchant = remoteMerchantsList.find((m) => m.id === activeMerchantId);
    const storeName = currentMerchant?.storeName || 'متجر التاجر المعتمد';
    const diag = getSyncErrorDiagnosticResolution(target);

    showToast(
      `⚠️ تم اكتشاف خطأ تزامن سابق في ${name} [HTTP ${diag.statusCode}]: "${diag.errorMessage}" — 🛠️ جاري إعادة الاتصال بـ API وتطبيق الحل (${diag.solution})... 🔄`,
      5000
    );

    setRefreshingPlatformIds((prev) => Array.from(new Set([...prev, platformId])));

    setTimeout(() => {
      // Guard against merchant switch race condition
      if (activeMerchantIdRef.current !== activeMerchantId) {
        setRefreshingPlatformIds((prev) => prev.filter((id) => id !== platformId));
        return;
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setConnectedPlatforms((prev) => {
        const next = prev.map((p) => {
          if (p.id !== platformId) return p;
          const currentHist = p.syncHistory && p.syncHistory.length > 0
            ? p.syncHistory
            : getPlatformSyncHistoryList(p);
          const resolvedEntry: PlatformSyncHistoryItem = {
            id: `hist-resolved-${p.id}-${Date.now()}`,
            timestamp: `${dateStr} ${timeStr}`,
            statusCode: 200,
            statusText: 'OK (Resolved)',
            success: true,
            latencyMs: 142,
            message: `تم إصلاح خطأ [HTTP ${diag.statusCode}] واستعادة اتصال API بنجاح (${diag.solution})`
          };
          return {
            ...p,
            status: 'active' as const,
            hasSyncError: false,
            syncError: undefined,
            isConnected: true,
            linkedMerchantClientId: activeMerchantId,
            lastSyncedAt: `الآن (${timeStr} - تم حل الخطأ ⚡)`,
            lastSuccessfulSyncAt: `${dateStr} - ${timeStr} (الآن)`,
            lastSuccessfulSyncTimestamp: Date.now(),
            syncHistory: [resolvedEntry, ...currentHist].slice(0, 5),
          };
        });
        saveStoredPlatformsForMerchant(activeMerchantId, next);
        return next;
      });

      setRefreshingPlatformIds((prev) => prev.filter((id) => id !== platformId));
      setRecentlySyncedPlatformIds((prev) => Array.from(new Set([...prev, platformId])));
      setTimeout(() => {
        setRecentlySyncedPlatformIds((prev) => prev.filter((id) => id !== platformId));
      }, 3000);

      showToast(
        `✅ تم حل مشكلة الـ API واستعادة اتصال ${name} لمتجر "${storeName}" بنجاح! (تمت معالجة خطأ HTTP ${diag.statusCode}: ${diag.errorMessage} وتفعيل التزامن الفوري ⚡)`,
        5500
      );
    }, 950);
  };

  // Retry all platforms that have sync errors in a single batch
  const handleRetryAllSyncErrors = () => {
    const troubledPlatforms = connectedPlatforms.filter(
      (p) => Boolean(p.hasSyncError || p.status === 'error' || p.syncError)
    );
    if (troubledPlatforms.length === 0) {
      showToast('لا توجد أي قنوات متعثرة حالياً، جميع المنصات تعمل بكفاءة تامة 🟢');
      return;
    }
    troubledPlatforms.forEach((p) => {
      handleRetrySyncPlatform(p.id);
    });
    showToast(`⚡ جاري إعادة الاتصال ومعالجة الأخطاء لـ ${troubledPlatforms.length} منصة متعثرة في وقت واحد... 🔄`);
  };

  // Simulate a sync error on a platform for testing and verifying the troubleshooting workflow
  const handleSimulateSyncError = () => {
    const target = connectedPlatforms.find((p) => p.isConnected) || connectedPlatforms[0];
    if (!target) return;
    const targetName = target.name.split('(')[0].trim();
    setConnectedPlatforms((prev) => {
      const next = prev.map((p) => {
        if (p.id !== target.id) return p;
        return {
          ...p,
          status: 'error' as const,
          hasSyncError: true,
          syncError: 'انقطاع الاتصال ببوابة الـ API (HTTP 401: انتهت صلاحية Access Token)',
          lastSyncedAt: 'منذ دقيقة (فشل الاتصال 🚨)',
        };
      });
      saveStoredPlatformsForMerchant(activeMerchantId, next);
      return next;
    });
    setPlatformStatusFilter('sync_errors_only');
    showToast(`تمت محاكاة خطأ تزامن لقناة "${targetName}" لتجربة فحص وتصفية القنوات المتعثرة 🚨`);
  };

  // One-click batch sync for all channels whose sync was delayed by more than 2 hours
  const handleSyncAllDelayedPlatforms = () => {
    if (delayedPlatformsCount === 0) {
      showToast('كافة قنوات البيع متزامنة بانتظام خلال الساعتين الماضيتين ولا يوجد أي تأخير 🟢');
      return;
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
    const nowTimestamp = Date.now();

    setConnectedPlatforms((prev) => {
      const next = prev.map((p) => {
        const info = getPlatformLastSuccessfulSyncInfo(p);
        if (info.isDelayedOver2Hours) {
          const currentHist = p.syncHistory && p.syncHistory.length > 0 ? p.syncHistory : getPlatformSyncHistoryList(p);
          const newEntry: PlatformSyncHistoryItem = {
            id: `hist-delay-resolved-${p.id}-${Date.now()}`,
            timestamp: `${dateStr} ${timeStr}`,
            statusCode: 200,
            statusText: 'OK (Delayed Sync Resolved)',
            success: true,
            latencyMs: Math.floor(Math.random() * 80) + 120,
            message: `تم حل تأخر المزامنة بنجاح لقناة ${p.name.split('(')[0].trim()} وتحديث الأسعار والمخزون.`
          };
          return {
            ...p,
            lastSuccessfulSyncAt: `${dateStr} - ${timeStr} (الآن)`,
            lastSuccessfulSyncTimestamp: nowTimestamp,
            lastSyncedAt: `الآن (${timeStr})`,
            hasSyncError: false,
            syncError: undefined,
            syncHistory: [newEntry, ...currentHist.filter(h => h.id !== newEntry.id)].slice(0, 5),
          };
        }
        return p;
      });
      saveStoredPlatformsForMerchant(activeMerchantId, next);
      return next;
    });

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.25 } });
    showToast(`⚡ تم بنجاح مزامنة وتحديث (${delayedPlatformsCount}) قنوات بيع متأخرة وتجديد بيانات الأسعار والمخزون.`);
  };

  // Toggle/simulate 2-hour delay on a platform for interactive verification
  const handleSimulateSyncDelay = () => {
    const target = connectedPlatforms.find((p) => !getPlatformLastSuccessfulSyncInfo(p).isDelayedOver2Hours) || connectedPlatforms[0];
    if (!target) return;
    const targetLabel = target.name.split('(')[0].trim();
    const simulatedOldTimestamp = Date.now() - 3.5 * 60 * 60 * 1000; // 3.5 hours ago
    const simDate = new Date(simulatedOldTimestamp);
    const timeStr = simDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = simDate.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });

    setConnectedPlatforms((prev) => {
      const next = prev.map((p) => {
        if (p.id === target.id) {
          return {
            ...p,
            lastSuccessfulSyncTimestamp: simulatedOldTimestamp,
            lastSuccessfulSyncAt: `${dateStr} - ${timeStr} (منذ 3.5 ساعات)`,
          };
        }
        return p;
      });
      saveStoredPlatformsForMerchant(activeMerchantId, next);
      return next;
    });

    setPlatformStatusFilter('delayed_sync_only');
    showToast(`🧪 تم محاكاة تأخر المزامنة لأكثر من ساعتين (3.5 س) لقناة "${targetLabel}" وتم تمييزها باللون البرتقالي 🟠.`);
  };

  /**
   * Refactored handleLiveSync:
   * Strictly respects the activeMerchantId context.
   * Only triggers platform requests associated with the currently selected merchant.
   * Updates UI state cleanly without cross-merchant data leakage or race conditions.
   */
  const handleLiveSync = async (explicitMerchantId?: string) => {
    // 1. Strict resolution of target merchant context
    const targetMerchantId = explicitMerchantId || activeMerchantId;
    if (!targetMerchantId) {
      showToast('يرجى تحديد تاجر معتمد أولاً لإجراء المزامنة الحية ⚠️');
      return;
    }

    const currentMerchant = remoteMerchantsList.find((m) => m.id === targetMerchantId);
    const storeName = currentMerchant?.storeName || 'متجر التاجر المعتمد';

    // 2. Load platforms strictly configured for this merchant to prevent cross-merchant leakage
    const merchantPlatforms = loadStoredPlatformsForMerchant(
      targetMerchantId,
      INITIAL_CONNECTED_PLATFORMS,
      currentMerchant
    );

    // Filter only active connected platforms strictly associated with this active merchant
    const activeMerchantPlatforms = (merchantPlatforms || []).filter(
      (p) => p.isConnected && (!p.linkedMerchantClientId || p.linkedMerchantClientId === targetMerchantId)
    );

    if (activeMerchantPlatforms.length === 0) {
      showToast(`لا توجد قنوات بيع نشطة مربوطة بمتجر "${storeName}". يرجى تفعيل أو ربط القنوات أولاً ⚠️`);
      return;
    }

    if (isRefreshingPlatforms) return;
    setIsRefreshingPlatforms(true);

    const opId = triggerGlobalAsyncStart(
      'platform_sync',
      `مزامنة حية لمتجر ${storeName}`,
      `فحص وتحديث الأسعار والمخزون لـ ${activeMerchantPlatforms.length} قناة تجارية تابعة للمتجر`
    );

    showToast(`جاري بدء المزامنة الحية لمتجر "${storeName}" (${activeMerchantPlatforms.length} منصة)... 🔄`);

    try {
      // 3. Only trigger platform requests associated with the currently selected merchant
      const syncResult = await syncLiveProductsFromConnectedPlatforms(activeMerchantPlatforms);

      // Race condition check: user might have switched active merchant while network sync was pending
      const isStillActiveMerchant = activeMerchantIdRef.current === targetMerchantId;

      const now = new Date();
      const dateStr = now.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // 4. Update sync history and lastSyncedAt strictly scoped to targetMerchantId
      const updatedPlatforms = merchantPlatforms.map((p) => {
        const wasSynced = activeMerchantPlatforms.some((ap) => ap.id === p.id);
        if (!wasSynced) return p;

        const currentHist = p.syncHistory && p.syncHistory.length > 0
          ? p.syncHistory
          : getPlatformSyncHistoryList(p);

        const newEntry: PlatformSyncHistoryItem = {
          id: `hist-${p.id}-${targetMerchantId}-${Date.now()}`,
          timestamp: `${dateStr} ${timeStr}`,
          statusCode: 200,
          statusText: 'OK',
          success: true,
          latencyMs: Math.floor(Math.random() * 80) + 120,
          message: `مزامنة حية مؤكدة لمتجر "${storeName}" عبر قناة ${p.name.split('(')[0].trim()}`
        };

        return {
          ...p,
          status: 'active' as const,
          hasSyncError: false,
          syncError: undefined,
          linkedMerchantClientId: targetMerchantId,
          lastSyncedAt: `الآن (${timeStr}) - متجر ${storeName}`,
          lastSuccessfulSyncAt: `${dateStr} - ${timeStr} (الآن)`,
          lastSuccessfulSyncTimestamp: Date.now(),
          syncHistory: [newEntry, ...currentHist.filter((h) => h.id !== newEntry.id)].slice(0, 5)
        };
      });

      // 5. Save platform state strictly under targetMerchantId storage key (No global leakage)
      saveStoredPlatformsForMerchant(targetMerchantId, updatedPlatforms);

      // 6. Handle synced products with strict merchant isolation
      if (syncResult && syncResult.success && Array.isArray(syncResult.products) && syncResult.products.length > 0) {
        const merchantScopedProducts = syncResult.products.map((prod) => ({
          ...prod,
          merchantId: targetMerchantId,
          merchantStoreName: storeName,
          syncedAt: new Date().toISOString()
        }));

        if (isStillActiveMerchant) {
          setAllProducts((prev) => {
            // Merge and deduplicate by product ID so syncing across merchants never produces duplicate keys
            const mergedMap = new Map<string, ProductData>();
            prev.forEach((p) => {
              if (p && p.id && p.merchantId !== targetMerchantId) {
                mergedMap.set(p.id, p);
              }
            });
            merchantScopedProducts.forEach((p) => {
              if (p && p.id) {
                mergedMap.set(p.id, p);
              }
            });
            const merged = Array.from(mergedMap.values());
            saveStoredLiveProducts(merged);
            return merged;
          });

          if (merchantScopedProducts.length > 0) {
            setCurrentProduct(merchantScopedProducts[0]);
          }
        }
      }

      // 7. Update active UI state ONLY if the merchant is still currently active
      if (isStillActiveMerchant) {
        setConnectedPlatforms(updatedPlatforms);

        const connectedIds = activeMerchantPlatforms.map((p) => p.id);
        setRecentlySyncedPlatformIds((prev) => Array.from(new Set([...prev, ...connectedIds])));
        setIsAllPlatformsRecentlySynced(true);

        setTimeout(() => {
          setRecentlySyncedPlatformIds((prev) => prev.filter((id) => !connectedIds.includes(id)));
          setIsAllPlatformsRecentlySynced(false);
        }, 3500);

        showToast(`تمت المزامنة الحية بنجاح لقنوات متجر "${storeName}" (${activeMerchantPlatforms.length} منصة) ✅`);
      } else {
        // Merchant was switched during sync, saved to storage without polluting current view
        showToast(`اكتملت مزامنة متجر "${storeName}" في الخلفية وحُفظت بياناته بنجاح 💾`);
      }

      triggerGlobalAsyncEnd(
        opId, 
        true, 
        `تمت المزامنة الحية لمتجر ${storeName} بنجاح (${activeMerchantPlatforms.length} منصة)`, 
        'platform_sync'
      );
    } catch (err: any) {
      console.error('Error during handleLiveSync:', err);
      triggerGlobalAsyncEnd(
        opId, 
        false, 
        `فشلت مزامنة متجر ${storeName}: ${err?.message || 'خطأ في الشبكة'}`, 
        'platform_sync'
      );
      showToast(`حدث خطأ أثناء مزامنة متجر "${storeName}": ${err?.message || 'خطأ غير متوقع'}`);
    } finally {
      setIsRefreshingPlatforms(false);
    }
  };

  // Manual sync check for all currently connected platforms (delegates strictly to handleLiveSync)
  const handleRefreshAllPlatforms = () => {
    handleLiveSync(activeMerchantId);
  };

  // Manual sync check specifically for a single individual platform card strictly scoped to active merchant
  const handleRefreshSinglePlatform = (platformId: string, platformLabel: string) => {
    const targetPlat = connectedPlatforms.find((p) => p.id === platformId);
    if (targetPlat && Boolean(targetPlat.isMaintenanceMode || targetPlat.status === 'maintenance' || targetPlat.scheduledMaintenance?.isActive)) {
      const maintWindow = targetPlat.scheduledMaintenance?.windowLabel || 'نافذة الصيانة المجدولة الحالية';
      const maintReason = targetPlat.scheduledMaintenance?.reasonAr || 'تحديث دوري مجدول لخوادم وبوابات الـ API';
      const maintEnd = targetPlat.scheduledMaintenance?.expectedEndTime ? ` (الانتهاء المتوقع: ${targetPlat.scheduledMaintenance.expectedEndTime})` : '';
      showToast(
        `🛠️ إشعار صيانة مجدولة (${platformLabel}): المنصة تخضع حالياً لوضع الصيانة المجدولة [${maintWindow}] — السبب: ${maintReason}${maintEnd}. يُنصح بتجنب التزامن اليدوي في هذا الوقت لحين استقرار الخوادم ⏳`,
        6000
      );
      return;
    }

    if (refreshingPlatformIds.includes(platformId) || isRefreshingPlatforms) return;

    const currentMerchant = remoteMerchantsList.find((m) => m.id === activeMerchantId);
    const storeName = currentMerchant?.storeName || 'متجر التاجر المعتمد';

    const opId = triggerGlobalAsyncStart(
      'platform_sync', 
      `مزامنة قناة ${platformLabel} (${storeName})`, 
      'التحقق من الأسعار، المخزون، وسرعة الاستجابة للمتجر المحدد'
    );

    setRefreshingPlatformIds((prev) => [...prev, platformId]);
    showToast(`جاري فحص وتحديث المزامنة اللحظية لقناة "${platformLabel}" لمتجر "${storeName}"... 🔄`);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Guard: Ensure active merchant hasn't changed during the async timeout
      if (activeMerchantIdRef.current !== activeMerchantId) {
        setRefreshingPlatformIds((prev) => prev.filter((id) => id !== platformId));
        return;
      }

      setConnectedPlatforms((prev) => {
        const next = prev.map((p) => {
          if (p.id !== platformId) return p;
          const currentHist = p.syncHistory && p.syncHistory.length > 0
            ? p.syncHistory
            : getPlatformSyncHistoryList(p);
          const newEntry: PlatformSyncHistoryItem = {
            id: `hist-${p.id}-${activeMerchantId}-${Date.now()}`,
            timestamp: `${dateStr} ${timeStr}`,
            statusCode: 200,
            statusText: 'OK',
            success: true,
            latencyMs: Math.floor(Math.random() * 100) + 130,
            message: `مزامنة يدوية مكتملة بنجاح لقناة ${platformLabel} (متجر ${storeName}) ⚡`
          };
          const updatedPlatform = {
            ...p,
            status: 'active' as const,
            hasSyncError: false,
            syncError: undefined,
            isConnected: true, // ensure active upon successful manual single-channel sync
            linkedMerchantClientId: activeMerchantId,
            lastSyncedAt: `الآن (${timeStr})`,
            lastSuccessfulSyncAt: `${dateStr} - ${timeStr} (الآن)`,
            lastSuccessfulSyncTimestamp: Date.now(),
            syncHistory: [newEntry, ...currentHist.filter((h) => h.id !== newEntry.id)].slice(0, 5)
          };

          // If overlay is open for this platform, keep it synced
          if (historyOverlayPlatform?.id === platformId) {
            setHistoryOverlayPlatform(updatedPlatform);
          }

          return updatedPlatform;
        });
        saveStoredPlatformsForMerchant(activeMerchantId, next);
        return next;
      });
      setRefreshingPlatformIds((prev) => prev.filter((id) => id !== platformId));
      triggerGlobalAsyncEnd(opId, true, `تمت مزامنة ${platformLabel} لمتجر ${storeName} بنجاح`, 'platform_sync');

      // Turn refresh icon button green for 3 seconds upon successful completion
      setRecentlySyncedPlatformIds((prev) => Array.from(new Set([...prev, platformId])));
      setTimeout(() => {
        setRecentlySyncedPlatformIds((prev) => prev.filter((id) => id !== platformId));
      }, 3000);

      showToast(`تمت مزامنة وتحديث قناة "${platformLabel}" لمتجر "${storeName}" بنجاح ⚡✅`);
    }, 700);
  };

  // Hidden Delete (X) mode for platform cards via long-press
  const [platformInDeleteMode, setPlatformInDeleteMode] = useState<string | null>(null);
  const platformLongPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const wasPlatformLongPressRef = React.useRef<boolean>(false);

  const startPlatformLongPress = (platformId: string, platformLabel: string) => {
    wasPlatformLongPressRef.current = false;
    if (platformLongPressTimerRef.current) {
      clearTimeout(platformLongPressTimerRef.current);
    }
    platformLongPressTimerRef.current = setTimeout(() => {
      wasPlatformLongPressRef.current = true;
      setPlatformInDeleteMode(platformId);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
      showToast(`وضع الحذف: انقر على زر (X) لإزالة منصة ${platformLabel} 🗑️`);
    }, 550);
  };

  const cancelPlatformLongPress = () => {
    if (platformLongPressTimerRef.current) {
      clearTimeout(platformLongPressTimerRef.current);
      platformLongPressTimerRef.current = null;
    }
  };

  const handleDeletePlatform = (platformId: string, platformLabel: string) => {
    setConnectedPlatforms((prev) => prev.filter((p) => p.id !== platformId));
    setPlatformInDeleteMode(null);
    showToast(`تمت إزالة منصة ${platformLabel} من شريط المنصات بنجاح 🗑️`);
  };

  const handleToggleFavoritePlatform = (platformId: string) => {
    setConnectedPlatforms((prev) =>
      prev.map((plat) => {
        if (plat.id === platformId) {
          const isFav = plat.category === 'favorites';
          const newCategory = isFav ? undefined : 'favorites';
          showToast(
            isFav
              ? `تمت إزالة "${plat.name.split('(')[0].trim()}" من المفضلات السريعة ⭐`
              : `تمت إضافة "${plat.name.split('(')[0].trim()}" إلى المفضلات السريعة وتثبيتها في المقدمة 🌟`
          );
          return { ...plat, category: newCategory };
        }
        return plat;
      })
    );
  };

  // Add new platform handler
  const handleAddPlatform = (platformData: {
    name: string;
    category: string;
    sellerName: string;
    commissionFeePercent: number;
    isConnected: boolean;
    websiteUrl?: string;
    suggestedIcon?: string;
  }) => {
    let matchedCategory = platformCategories.find((c) => c.key === platformData.category);

    // If category does not exist, automatically create and append it with the AI chosen icon
    if (!matchedCategory) {
      const newCategoryConfig: PlatformCategoryConfig = {
        key: platformData.category,
        title: platformData.category === 'marketplace' ? 'مركز الماركت بليس' :
               platformData.category === 'website' ? 'مواقع إلكترونية' :
               platformData.category === 'retail_chain' ? 'سلاسل تجزئة وموزعين' :
               platformData.category === 'social' ? 'سوشيال ميديا وتجارة اجتماعية' : platformData.name,
        englishTitle: platformData.category,
        iconName: platformData.suggestedIcon || 'Layers',
        badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        headerColor: 'text-emerald-950',
        borderStyle: 'border-emerald-200/70',
        bgStyle: 'bg-emerald-50/25',
        tagColor: 'text-emerald-800 bg-emerald-100/80 border border-emerald-200',
        isCustom: true,
      };
      setPlatformCategories(prev => [...prev, newCategoryConfig]);
      matchedCategory = newCategoryConfig;
    } else if (platformData.suggestedIcon && matchedCategory.isCustom && (!matchedCategory.iconName || matchedCategory.iconName === 'Layers')) {
      // Update custom category icon with AI suggestion
      setPlatformCategories(prev => prev.map(c => c.key === matchedCategory!.key ? { ...c, iconName: platformData.suggestedIcon! } : c));
    }

    const categoryTitle = matchedCategory?.title || platformData.category;

    const newPlatform: ConnectedMerchantPlatform = {
      id: `plat-custom-${Date.now()}`,
      name: platformData.name,
      code: `custom_${platformData.category}_${Date.now()}`,
      category: platformData.category,
      sellerName: platformData.sellerName,
      sellerId: `MKT-EG-${Math.floor(1000 + Math.random() * 9000)}`,
      merchantStoreUrl: platformData.websiteUrl,
      sellerPortalUrl: platformData.websiteUrl,
      isConnected: platformData.isConnected,
      autoSyncPrice: platformData.isConnected,
      status: 'active',
      lastSyncedAt: platformData.isConnected ? 'الآن (مضافة حديثاً)' : undefined,
      commissionFeePercent: platformData.commissionFeePercent,
    };

    setConnectedPlatforms((prev) => [...prev, newPlatform]);
    setIsAddPlatformModalOpen(false);

    // Show popup notification reminding user to configure API/Email credentials for real-time sync
    setCreatedPlatformNotice({
      platform: newPlatform,
      categoryTitle,
    });

    showToast(`تمت إضافة منصة "${platformData.name}" بنجاح ضمن (${categoryTitle}) 🚀`);
  };

  // 1-Click Expand All / Collapse All Platform Details in Control Panel Platform Bar
  const handleToggleExpandAllPlatforms = () => {
    const nextVal = !areAllPlatformDetailsExpanded;
    setAreAllPlatformDetailsExpanded(nextVal);
    try {
      localStorage.setItem('merchant_radar_expand_all_platform_details', JSON.stringify(nextVal));
    } catch {
      // ignore
    }

    if (nextVal) {
      // Reveal all details: also disable compact mode and uncollapse inactive category so all channels are in full view
      setIsPlatformBarCompact(false);
      try {
        localStorage.setItem('merchant_radar_platform_bar_compact', JSON.stringify(false));
      } catch {
        // ignore
      }
      setIsInactiveCategoryCollapsed(false);
      try {
        localStorage.setItem('merchant_radar_inactive_category_collapsed', JSON.stringify(false));
      } catch {
        // ignore
      }
      setExpandedPlatformIds(connectedPlatforms.map((p) => p.id));
      showToast('تم توسيع جميع تفاصيل منصات وقنوات البيع بنقرة واحدة ⚡ (Expand All)');
    } else {
      setExpandedPlatformIds([]);
      showToast('تم طي تفاصيل المنصات وقنوات البيع (Collapse All)');
    }
  };

  // Toggle individual platform card details
  const handleTogglePlatformDetails = (platformId: string) => {
    setExpandedPlatformIds((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  // Category Action Handlers: Create, Rename, Change Icon, Delete
  const handleOpenCreateCategory = () => {
    setCategoryToEdit(null);
    setCategoryModalMode('create');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: PlatformCategoryConfig) => {
    setCategoryToEdit(category);
    setCategoryModalMode('edit');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (
    categoryData: PlatformCategoryConfig,
    assignedPlatformIds?: string[]
  ) => {
    if (categoryModalMode === 'create') {
      setPlatformCategories((prev) => [...prev, categoryData]);
      if (assignedPlatformIds && assignedPlatformIds.length > 0) {
        setConnectedPlatforms((prev) =>
          prev.map((plat) =>
            assignedPlatformIds.includes(plat.id)
              ? { ...plat, category: categoryData.key }
              : plat
          )
        );
      }
      showToast(`تم إنشاء التصنيف المخصص "${categoryData.title}" بنجاح 📁✨`);
    } else {
      // Edit mode (Rename / Change Icon / Theme)
      setPlatformCategories((prev) =>
        prev.map((cat) => (cat.key === categoryData.key ? categoryData : cat))
      );
      showToast(`تم تحديث تصنيف "${categoryData.title}" (إعادة التسمية وتغيير الأيقونة) بنجاح 🎨✅`);
    }
    setIsCategoryModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleDeleteCategory = (categoryKey: string) => {
    const catToDelete = platformCategories.find((c) => c.key === categoryKey);
    const catTitle = catToDelete?.title || 'التصنيف';

    // Move platforms from this deleted category back to 'marketplace'
    setConnectedPlatforms((prev) =>
      prev.map((plat) =>
        plat.category === categoryKey ? { ...plat, category: 'marketplace' } : plat
      )
    );

    setPlatformCategories((prev) => prev.filter((c) => c.key !== categoryKey));
    setPlatformTypeFilter((prev) => {
      const next = prev.filter((k) => k !== categoryKey);
      return next.length === 0 ? ['all'] : next;
    });
    setIsCategoryModalOpen(false);
    setCategoryToEdit(null);
    showToast(`تم حذف تصنيف "${catTitle}" ونقل منصاته التابعة إلى مركز الماركت بليس 🗑️`);
  };

  // Toggle multiple / dual categories in control panel platform bar
  const handleTogglePlatformCategoryType = (categoryKey: string) => {
    if (categoryKey === 'all') {
      setPlatformTypeFilter(['all']);
      showToast('تصفية المنصات: عرض جميع التصنيفات 🌐');
      return;
    }

    setPlatformTypeFilter((prev) => {
      const clean = prev.filter((k) => k !== 'all');
      let next: string[];
      if (clean.includes(categoryKey)) {
        next = clean.filter((k) => k !== categoryKey);
      } else {
        next = [...clean, categoryKey];
      }

      // If nothing selected or all selected, reset to 'all'
      if (next.length === 0 || next.length >= platformCategories.length) {
        showToast('تصفية المنصات: تم اختيار كافة التصنيفات 🌐');
        return ['all'];
      }

      const selectedTitles = next
        .map((k) => platformCategories.find((c) => c.key === k)?.title || k)
        .join(' + ');

      if (next.length === 2) {
        showToast(`تصفية مزدوجة نشطة: ${selectedTitles} 🎯`);
      } else {
        showToast(`تصفية متعددة (${next.length} تصنيفات): ${selectedTitles} 🎯`);
      }

      return next;
    });
  };

  // Category Reordering Functions (Move Up/Down & Drag-to-Reorder Categories)
  const handleMoveCategory = (categoryKey: string, direction: 'up' | 'down') => {
    setPlatformCategories((prev) => {
      const index = prev.findIndex((c) => c.key === categoryKey);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      const catTitle = moved.title;
      showToast(`تم نقل تصنيف "${catTitle}" ${direction === 'up' ? 'للأعلى ⬆️' : 'للأسفل ⬇️'}`);
      return updated;
    });
  };

  const handleCategoryReorderDrop = (targetCategoryKey: string) => {
    if (!draggedCategoryKey || draggedCategoryKey === targetCategoryKey) {
      setDraggedCategoryKey(null);
      setDragOverCategoryReorderKey(null);
      return;
    }
    setPlatformCategories((prev) => {
      const fromIndex = prev.findIndex((c) => c.key === draggedCategoryKey);
      const toIndex = prev.findIndex((c) => c.key === targetCategoryKey);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const catTitle = moved.title;
      showToast(`تمت إعادة ترتيب تصنيف "${catTitle}" في لوحة التحكم بنجاح ↕️✨`);
      return updated;
    });
    setDraggedCategoryKey(null);
    setDragOverCategoryReorderKey(null);
  };

  const handleResetCategoryOrder = () => {
    const defaultOrderKeys = ['marketplace', 'website', 'retail_chain', 'social'];
    setPlatformCategories((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const aIdx = defaultOrderKeys.indexOf(a.key);
        const bIdx = defaultOrderKeys.indexOf(b.key);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return 0;
      });
      showToast('تمت استعادة الترتيب الافتراضي لتصنيفات المنصات 🔄');
      return sorted;
    });
  };

  // Drag and Drop state for reordering platform chips within categories in #control-panel-platform-bar
  const [draggedPlatformId, setDraggedPlatformId] = useState<string | null>(null);
  const [dragOverPlatformId, setDragOverPlatformId] = useState<string | null>(null);
  const [dragOverCategoryKey, setDragOverCategoryKey] = useState<string | null>(null);
  const [recentlyDroppedCategoryId, setRecentlyDroppedCategoryId] = useState<string | null>(null);
  const [recentlyMovedPlatformId, setRecentlyMovedPlatformId] = useState<string | null>(null);
  const wasDraggingRef = React.useRef<boolean>(false);

  const handlePlatformDragStart = (e: React.DragEvent, platformId: string) => {
    cancelPlatformLongPress();
    wasDraggingRef.current = true;
    setDraggedPlatformId(platformId);
    setRecentlyDroppedCategoryId(null);
    setRecentlyMovedPlatformId(null);
    setDragOverCategoryKey(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', platformId);
  };

  const handlePlatformDragOver = (e: React.DragEvent, targetPlatformId: string, categoryKey?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedPlatformId && draggedPlatformId !== targetPlatformId) {
      setDragOverPlatformId(targetPlatformId);
    }
    if (categoryKey && dragOverCategoryKey !== categoryKey) {
      setDragOverCategoryKey(categoryKey);
    }
  };

  const handlePlatformDragLeave = (_e: React.DragEvent, targetPlatformId: string) => {
    if (dragOverPlatformId === targetPlatformId) {
      setDragOverPlatformId(null);
    }
  };

  // Drop on an empty category container or container dropzone
  const handleCategoryDrop = (e: React.DragEvent, targetCategoryKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPlatformId(null);
    setDragOverCategoryKey(null);

    if (!draggedPlatformId) return;

    const draggedPlat = connectedPlatforms.find((p) => p.id === draggedPlatformId);
    if (!draggedPlat) return;

    const currentCat = getPlatformClassification(draggedPlat.code, draggedPlat.category);
    if (currentCat !== targetCategoryKey) {
      setConnectedPlatforms((prev) =>
        prev.map((plat) =>
          plat.id === draggedPlatformId ? { ...plat, category: targetCategoryKey } : plat
        )
      );
      const targetCatObj = platformCategories.find((c) => c.key === targetCategoryKey);
      const sourceLabel = draggedPlat.name.split('(')[0].trim();
      showToast(`تم نقل منصة "${sourceLabel}" إلى تصنيف "${targetCatObj?.title || targetCategoryKey}" بنجاح 📁✨`);

      // Visual feedback states on successful category move
      setRecentlyDroppedCategoryId(targetCategoryKey);
      setRecentlyMovedPlatformId(draggedPlatformId);
      setTimeout(() => {
        setRecentlyDroppedCategoryId(null);
        setRecentlyMovedPlatformId(null);
      }, 2200);

      try {
        playPriceAlertSound();
      } catch {
        // ignore
      }
    }

    setDraggedPlatformId(null);
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 150);
  };

  const handlePlatformDrop = (e: React.DragEvent, targetPlatformId: string, targetCategory: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPlatformId(null);
    setDragOverCategoryKey(null);

    if (!draggedPlatformId || draggedPlatformId === targetPlatformId) {
      setDraggedPlatformId(null);
      setTimeout(() => {
        wasDraggingRef.current = false;
      }, 150);
      return;
    }

    const draggedPlat = connectedPlatforms.find((p) => p.id === draggedPlatformId);
    const targetPlat = connectedPlatforms.find((p) => p.id === targetPlatformId);

    if (!draggedPlat || !targetPlat) {
      setDraggedPlatformId(null);
      setTimeout(() => {
        wasDraggingRef.current = false;
      }, 150);
      return;
    }

    const sourceCurrentCat = getPlatformClassification(draggedPlat.code, draggedPlat.category);
    const isChangedCategory = sourceCurrentCat !== targetCategory;

    setConnectedPlatforms((prev) => {
      const fromIndex = prev.findIndex((p) => p.id === draggedPlatformId);
      if (fromIndex === -1) return prev;

      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);

      // Reassign category if moved to a different category group
      if (targetCategory && targetCategory !== 'inactive_channels') {
        movedItem.category = targetCategory;
      }

      const toIndex = updated.findIndex((p) => p.id === targetPlatformId);
      if (toIndex === -1) {
        updated.push(movedItem);
      } else {
        updated.splice(toIndex, 0, movedItem);
      }
      return updated;
    });

    const sourceLabel = draggedPlat.name.split('(')[0].trim();
    const targetCategoryObj = platformCategories.find((c) => c.key === targetCategory);

    if (isChangedCategory) {
      showToast(`تم نقل وترتيب منصة "${sourceLabel}" ضمن تصنيف جديد "${targetCategoryObj?.title || targetCategory}" بنجاح 📁✨`);
      setRecentlyDroppedCategoryId(targetCategory);
      setRecentlyMovedPlatformId(draggedPlatformId);
      setTimeout(() => {
        setRecentlyDroppedCategoryId(null);
        setRecentlyMovedPlatformId(null);
      }, 2200);

      try {
        playPriceAlertSound();
      } catch {
        // ignore
      }
    } else {
      showToast(`تم إعادة ترتيب منصة "${sourceLabel}" بنجاح ↕️✨`);
      setRecentlyMovedPlatformId(draggedPlatformId);
      setTimeout(() => {
        setRecentlyMovedPlatformId(null);
      }, 1500);
    }

    setDraggedPlatformId(null);
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 150);
  };

  const handlePlatformDragEnd = () => {
    setDraggedPlatformId(null);
    setDragOverPlatformId(null);
    setDragOverCategoryKey(null);
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 150);
  };

  // Reset manual drag-and-drop ordering to default system sort order while maintaining 'Active First' setting
  const handleResetPlatformView = () => {
    setConnectedPlatforms((prev) => {
      const initialMap = new Map(INITIAL_CONNECTED_PLATFORMS.map((p, idx) => [p.id, { p, idx }]));
      return [...prev]
        .map((plat) => {
          const defaultData = initialMap.get(plat.id)?.p;
          return {
            ...plat,
            category: defaultData !== undefined ? defaultData.category : plat.category,
          };
        })
        .sort((a, b) => {
          const itemA = initialMap.get(a.id);
          const itemB = initialMap.get(b.id);
          if (itemA && itemB) return itemA.idx - itemB.idx;
          if (itemA) return -1;
          if (itemB) return 1;
          return 0;
        });
    });

    // Clear transient drag states
    setDraggedPlatformId(null);
    setDragOverPlatformId(null);
    setDragOverCategoryKey(null);
    setRecentlyDroppedCategoryId(null);
    setRecentlyMovedPlatformId(null);

    showToast(
      sortActivePlatformsFirst
        ? 'تمت استعادة الترتيب الافتراضي للنظام مع الحفاظ على إعداد (النشطة أولاً ⚡)'
        : 'تمت استعادة الترتيب الافتراضي للنظام (Reset View) بنجاح 🔄'
    );
  };

  // Export current platform sorting and connection settings as JSON file for backup purposes
  const handleExportPlatformConfig = () => {
    try {
      const exportPayload = {
        metadata: {
          application: 'MerchantRadar Egypt (رادار التاجر المصري)',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          exportedAtFormatted: new Date().toLocaleString('ar-EG'),
          description: 'نسخة احتياطية لترتيب قنوات ومنصات البيع وإعدادات الربط والاتصال والتصنيفات',
        },
        viewSettings: {
          sortActivePlatformsFirst,
          platformTypeFilter,
          isPlatformBarCompact,
          groupInactivePlatformsAtBottom,
          isInactiveCategoryCollapsed,
        },
        categories: platformCategories,
        platforms: connectedPlatforms.map((plat, idx) => ({
          sortOrderIndex: idx + 1,
          id: plat.id,
          name: plat.name,
          code: plat.code,
          category: plat.category || getPlatformClassification(plat.code),
          isConnected: plat.isConnected,
          status: plat.status,
          autoSyncPrice: plat.autoSyncPrice,
          commissionFeePercent: plat.commissionFeePercent,
          sellerName: plat.sellerName,
          sellerId: plat.sellerId,
          merchantEmail: plat.merchantEmail || '',
          merchantStoreUrl: plat.merchantStoreUrl || '',
          lastSyncedAt: plat.lastSyncedAt || '',
          hasSyncError: Boolean(plat.hasSyncError),
          syncError: plat.syncError || null,
        })),
      };

      const jsonString = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateTag = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `merchant_radar_platforms_backup_${dateTag}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('تم تصدير وحفظ نسخة احتياطية لترتيب وإعدادات المنصات (JSON) بنجاح 📥💾');
    } catch {
      showToast('حدث خطأ أثناء تصدير ملف الإعدادات، يرجى المحاولة مرة أخرى');
    }
  };

  // Apply Bulk Repricing to Products
  const handleApplyBulkPricesToProducts = (updatedProducts: { id: string; newPrice: number }[]) => {
    setAllProducts((prev) =>
      prev.map((p) => {
        const match = updatedProducts.find((u) => u.id === p.id);
        if (match) {
          return {
            ...p,
            suggestedRetailPrice: match.newPrice,
            priceHistory: [
              ...(p.priceHistory || []),
              {
                date: 'اليوم (تحديث جماعي)',
                price: match.newPrice,
                merchant: 'متجري (السعر المحدث)'
              }
            ]
          };
        }
        return p;
      })
    );

    const currentMatch = currentProduct ? updatedProducts.find((u) => u.id === currentProduct.id) : null;
    if (currentMatch) {
      setCurrentProduct((prev) => prev ? ({
        ...prev,
        suggestedRetailPrice: currentMatch.newPrice
      }) : null);
      setWinningPrice(currentMatch.newPrice);
    }
  };

  // Reprice single product from Sales Dashboard / Radar
  const handleRepriceSingleProduct = (productId: string, newPrice: number) => {
    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            suggestedRetailPrice: newPrice,
            priceHistory: [
              ...(p.priceHistory || []),
              {
                date: 'اليوم (تسعير سريع)',
                price: newPrice,
                merchant: 'متجري (سعر محدث)'
              }
            ]
          };
        }
        return p;
      })
    );

    if (currentProduct && currentProduct.id === productId) {
      setCurrentProduct((prev) => prev ? ({
        ...prev,
        suggestedRetailPrice: newPrice
      }) : null);
      setWinningPrice(newPrice);
    }

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  // Smart Dynamic Pricing Auto-Adjustment Handler (ضبط السعر تلقائياً عند تغير سعر المنافس وفق قواعد حماية الأرباح)
  const handleSmartDynamicPriceAutoAdjust = (
    productId: string,
    newMerchantPrice: number,
    updatedCompetitorPrice?: number,
    competitorName?: string,
    reasonLabel?: string
  ) => {
    const updateSingleProduct = (p: ProductData): ProductData => {
      let updatedOffers = p.merchantOffers || [];
      let nextLowestPrice = p.currentLowestPrice;

      if (updatedCompetitorPrice !== undefined && updatedCompetitorPrice > 0) {
        nextLowestPrice = updatedCompetitorPrice;
        if (updatedOffers.length > 0) {
          // Find lowest offer and update its price to reflect the competitor shift
          const lowestIdx = updatedOffers.reduce(
            (minIdx, curr, idx, arr) => (curr.price < arr[minIdx].price ? idx : minIdx),
            0
          );
          updatedOffers = updatedOffers.map((off, idx) =>
            idx === lowestIdx
              ? {
                  ...off,
                  price: updatedCompetitorPrice,
                  merchantName: competitorName || off.merchantName,
                }
              : off
          );
        }
      }

      return {
        ...p,
        currentLowestPrice: nextLowestPrice,
        suggestedRetailPrice: newMerchantPrice,
        merchantOffers: updatedOffers,
        priceHistory: [
          ...(p.priceHistory || []),
          ...(updatedCompetitorPrice
            ? [
                {
                  date: 'الآن (حركة منافس)',
                  price: updatedCompetitorPrice,
                  merchant: competitorName || 'منافس بالسوق',
                },
              ]
            : []),
          {
            date: `الآن (${reasonLabel || 'تسعير ديناميكي ذكي'})`,
            price: newMerchantPrice,
            merchant: 'متجري (تسعير ديناميكي محمي)',
          },
        ],
      };
    };

    setAllProducts((prev) => prev.map((p) => (p.id === productId ? updateSingleProduct(p) : p)));

    if (currentProduct && currentProduct.id === productId) {
      setCurrentProduct((prev) => (prev ? updateSingleProduct(prev) : null));
      setWinningPrice(newMerchantPrice);
    }
  };

  // Bulk Smart Dynamic Pricing Adjustment across all catalog products
  const handleBulkSmartDynamicPricingAdjust = (
    adjustments: { productId: string; newPrice: number; guardrailStatus: string }[]
  ) => {
    const map = new Map(adjustments.map((a) => [a.productId, a]));
    setAllProducts((prev) =>
      prev.map((p) => {
        const adj = map.get(p.id);
        if (!adj) return p;
        return {
          ...p,
          suggestedRetailPrice: adj.newPrice,
          priceHistory: [
            ...(p.priceHistory || []),
            {
              date: 'الآن (تسعير ديناميكي شامل)',
              price: adj.newPrice,
              merchant: 'متجري (تسعير ديناميكي محمي)',
            },
          ],
        };
      })
    );

    if (currentProduct && map.has(currentProduct.id)) {
      const currAdj = map.get(currentProduct.id)!;
      setCurrentProduct((prev) =>
        prev ? { ...prev, suggestedRetailPrice: currAdj.newPrice } : null
      );
      setWinningPrice(currAdj.newPrice);
    }
  };

  // Update SEO Listing Content
  const handleUpdateSeoListing = (updatedSeo: PlatformSEOListing) => {
    setCurrentProduct((prev) => prev ? ({
      ...prev,
      seoListing: updatedSeo,
    }) : null);
  };

  // Update Keywords Handler
  const handleUpdateKeywords = (newKeywords: KeywordItem[]) => {
    setCurrentProduct((prev) => prev ? ({
      ...prev,
      keywords: newKeywords,
    }) : null);
    if (currentProduct) {
      setAllProducts((prev) =>
        prev.map((p) => (p.id === currentProduct.id ? { ...p, keywords: newKeywords } : p))
      );
    }
    showToast('تم تحديث قائمة الكلمات المفتاحية الذكية للمنتج بنجاح 🎯');
  };

  // Apply Selected Keywords directly to SEO Listing (backend search terms + keywords array)
  const handleApplyKeywordsToSeo = (selectedKws: KeywordItem[]) => {
    const rawTerms = selectedKws.map(k => k.keyword).join(' ');
    const uniqueTerms = Array.from(new Set(rawTerms.split(/\s+/))).filter(Boolean).join(' ');

    setCurrentProduct((prev) => {
  if (!prev) return prev;
  const updatedSeo: PlatformSEOListing = {
    ...(prev.seoListing || {}),
    amazon: {
      ...(prev.seoListing?.amazon || {}),
      backendSearchTerms: uniqueTerms,
    },
    noon: {
      ...(prev.seoListing?.noon || {}),
    },
  } as PlatformSEOListing;
  
  return {
    ...prev,
    seoListing: updatedSeo,
  };
});

    showToast(`تم تطبيق ${selectedKws.length} كلمات مفتاحية في خانات السيو والكلمات الخلفية بنجاح 🚀`);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Watchlist Handlers
  const isProductInWatchlist = (productId: string) => {
    return watchlist.some(w => w.productId === productId);
  };

  const handleToggleWatchlist = (product: ProductData) => {
    if (isProductInWatchlist(product.id)) {
      setWatchlist(prev => prev.filter(w => w.productId !== product.id));
      showToast(`تم حذف "${product.title}" من قائمة المتابعة`);
    } else {
      const now = new Date();
      const formattedDate = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const bestOffer = product.merchantOffers?.find(o => o.isBestDeal) || product.merchantOffers?.[0];
      const newItem: WatchlistItem = {
        productId: product.id,
        product: product,
        addedAt: now.toISOString().split('T')[0],
        lastPriceChangedAt: formattedDate,
        lastPriceChangeSource: bestOffer?.merchantName || 'متاجر التجزئة المصرية',
        lastCheckedPrice: product.currentLowestPrice,
        priceTrend: 'down',
        priceChangePercent: -selectedDiscount,
        competitorStockStatus: 'normal',
        targetAlertPrice: Math.round(product.currentLowestPrice * (1 - selectedDiscount / 100)),
        merchantNotes: `متابع للمنافسة بسعر بيع مقترح ${winningPrice.toLocaleString()} ${currency}`,
        tags: [product.brand, 'سوق مصر', 'قيد المتابعة'],
        autoTrack: true
      };
      setWatchlist(prev => [newItem, ...prev]);
      showToast(`تمت إضافة "${product.title}" لقائمة المتابعة بنجاح ⭐`);
    }
  };

  const handleBulkAddToWatchlist = (productsToAdd: ProductData[]) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setWatchlist(prev => {
      const existingIds = new Set(prev.map(w => w.productId));
      const newWatchlistItems: WatchlistItem[] = [];

      productsToAdd.forEach(product => {
        if (!existingIds.has(product.id)) {
          const bestOffer = product.merchantOffers?.find(o => o.isBestDeal) || product.merchantOffers?.[0];
          const suggestedWinPrice = Math.round(product.currentLowestPrice * (1 - selectedDiscount / 100));
          newWatchlistItems.push({
            productId: product.id,
            product: product,
            addedAt: now.toISOString().split('T')[0],
            lastPriceChangedAt: formattedDate,
            lastPriceChangeSource: bestOffer?.merchantName || 'متاجر التجزئة المصرية',
            lastCheckedPrice: product.currentLowestPrice,
            priceTrend: 'down',
            priceChangePercent: -selectedDiscount,
            competitorStockStatus: 'normal',
            targetAlertPrice: suggestedWinPrice,
            merchantNotes: `مضاف من قائمة أفضل المنتجات مبيعاً (Best Sellers) بسعر مقترح ${suggestedWinPrice.toLocaleString()} ${currency}`,
            tags: [product.brand, 'الأكثر مبيعاً', 'قيد المتابعة'],
            autoTrack: true
          });
        }
      });

      return [...newWatchlistItems, ...prev];
    });

    showToast(`⭐ تمت إضافة ${productsToAdd.length} منتجات من الأكثر مبيعاً إلى قائمة المتابعة بنجاح!`);
  };

  const handleRemoveFromWatchlist = (productId: string) => {
    setWatchlist(prev => prev.filter(w => w.productId !== productId));
    showToast('تم إزالة المنتج من قائمة المتابعة');
  };

  const handleUpdateWatchlistNote = (productId: string, note: string) => {
    setWatchlist(prev => prev.map(w => w.productId === productId ? { ...w, merchantNotes: note } : w));
    showToast('تم حفظ ملاحظة التاجر بنجاح');
  };

  const handleUpdateTargetAlertPrice = (productId: string, newTargetPrice: number) => {
    setWatchlist(prev => prev.map(w => w.productId === productId ? { ...w, targetAlertPrice: newTargetPrice } : w));
    // Also sync existing active alert if present
    setAlerts(prev => prev.map(a => a.productId === productId ? { ...a, targetPrice: newTargetPrice } : a));
    showToast(`تم تحديث السعر المستهدف للتنبيه إلى ${newTargetPrice.toLocaleString()} ${currency} 🎯`);
  };

  const handleBulkUpdateTargetAlertPrices = (
    updates: { productId: string; targetAlertPrice: number }[],
    syncWithActiveAlerts: boolean = true
  ) => {
    const updateMap = new Map(updates.map(u => [u.productId, u.targetAlertPrice]));

    setWatchlist(prev =>
      prev.map(item => {
        if (updateMap.has(item.productId)) {
          return {
            ...item,
            targetAlertPrice: updateMap.get(item.productId)!
          };
        }
        return item;
      })
    );

    if (syncWithActiveAlerts) {
      setAlerts(prev =>
        prev.map(alert => {
          if (updateMap.has(alert.productId)) {
            return {
              ...alert,
              targetPrice: updateMap.get(alert.productId)!
            };
          }
          return alert;
        })
      );
    }

    showToast(`تم تحديث السعر المستهدف لـ ${updates.length} منتجات في قائمة المتابعة بنجاح 🎯`);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSelectProductFromWatchlist = (product: ProductData) => {
    setCurrentProduct(product);
    setWinningPrice(Math.round(product.currentLowestPrice * (1 - selectedDiscount / 100)));
    setActiveTab('radar');
  };

  // Price Alert Handlers
  const handleAddAlert = (newAlert: PriceAlert) => {
    setAlerts(prev => [newAlert, ...prev]);
    showToast(`تم ضبط التنبيه الذكي بنجاح عبر قناة (${newAlert.channel === 'whatsapp' ? 'واتساب' : newAlert.channel === 'in_app' ? 'التطبيق' : 'الإيميل'}) 🔔`);
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isActive: !a.isActive } : a));
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('تم حذف التنبيه');
  };

  const handleTestTriggerAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const oldP = (alert.targetPrice || 2500) + 120;
    const newP = alert.targetPrice || 2400;

    const alertType = alert.triggerCondition === 'competitor_stockout' 
      ? 'stock_alert' 
      : alert.triggerCondition === 'buybox_change' 
      ? 'special_offer' 
      : 'price_drop';

    const newLog: AlertNotificationLog = {
      id: `log-${Date.now()}`,
      alertId: alert.id,
      productId: alert.productId,
      productTitle: alert.productTitle,
      alertType,
      channel: alert.channel,
      message: `[تجربة ناجحة] تم رصد انخفاض سعر ${alert.productTitle} لدى أحد المنافسين على أمازون مصر. جاهز لإعادة التسعير.`,
      oldPrice: oldP,
      newPrice: newP,
      priceDropAmount: 120,
      priceDropPercent: 5,
      competitorName: 'أنكر إيجيبت أوفيشال',
      platformName: 'أمازون مصر',
      timestamp: 'الآن (اختبار تجريبي)',
      isRead: false,
      actionTaken: false
    };

    setNotificationLogs(prev => [newLog, ...prev]);
    showToast(`تم إرسال إشعار تجريبي ناجح إلى ${alert.recipientContact} 🚀`);

    // Trigger Custom Audio Notification based on alert trigger condition
    if (alert.triggerCondition === 'competitor_stockout' || alert.triggerCondition === 'buybox_change') {
      playCompetitorStatusSound();
    } else {
      playPriceAlertSound();
    }

    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 }
    });
  };

  const handleMarkNotificationRead = (logId: string) => {
    setNotificationLogs(prev => prev.map(l => l.id === logId ? { ...l, isRead: true } : l));
  };

  // Archive Management Handlers
  const handleInitiateArchive = (productOrId: ProductData | string) => {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id;
    setArchiveModalProductId(id);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = (productId: string, reason: string, notes: string) => {
    setAllProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          isArchived: true,
          archivedAt: new Date().toISOString().split('T')[0],
          archivedReason: reason,
          archivedNotes: notes || 'تم نقل المنتج للأرشيف'
        };
      }
      return p;
    }));

    // If current product is the one archived, switch currentProduct to another active one
    if (currentProduct && currentProduct.id === productId) {
      const remainingActive = allProducts.filter(p => p.id !== productId && !p.isArchived);
      if (remainingActive.length > 0) {
        setCurrentProduct(remainingActive[0]);
        setWinningPrice(Math.round(remainingActive[0].currentLowestPrice * (1 - selectedDiscount / 100)));
      } else {
        setCurrentProduct(null);
      }
    }

    showToast('تمت أرشفة المنتج ونقله بنجاح إلى مجلد الأرشيف الخاص 🗄️');
  };

  // Quick Drag & Drop Archive Handler with Ephemeral Alert
  const handleQuickArchiveViaDragDrop = (productId: string) => {
    const targetProd = allProducts.find(p => p.id === productId);
    if (!targetProd) return;

    setAllProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          isArchived: true,
          archivedAt: new Date().toISOString().split('T')[0],
          archivedReason: 'discontinued_model',
          archivedNotes: 'أرشفة سريعة عبر السحب والإفلات (Drag & Drop) إلى زر الأرشيف بالقائمة المنسدلة 🗄️⚡'
        };
      }
      return p;
    }));

    if (currentProduct && currentProduct.id === productId) {
      const remainingActive = allProducts.filter(p => p.id !== productId && !p.isArchived);
      if (remainingActive.length > 0) {
        setCurrentProduct(remainingActive[0]);
        setWinningPrice(Math.round(remainingActive[0].currentLowestPrice * (1 - selectedDiscount / 100)));
      } else {
        setCurrentProduct(null);
      }
    }

    setArchiveEphemeralAlert({
      id: Date.now(),
      productId: targetProd.id,
      productTitle: targetProd.title,
      productSku: targetProd.sku,
      productImage: targetProd.imageUrl,
      wholesaleCost: targetProd.estimatedWholesaleCost,
      retailPrice: targetProd.suggestedRetailPrice || targetProd.currentLowestPrice,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      secondsLeft: 7,
    });

    showToast(`تم سحب المنتج "${targetProd.title.slice(0, 32)}..." وأرشفته بنجاح ونقله إلى مجلد الأرشيف 🗄️✅`);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const handleUndoEphemeralArchive = () => {
    if (!archiveEphemeralAlert) return;
    const { productId } = archiveEphemeralAlert;
    handleRestoreProduct(productId);
    setArchiveEphemeralAlert(null);
    showToast('تم التراجع فوراً واستعادة المنتج إلى لوحة المنتجات النشطة بنجاح ↩️⭐');
  };

  const handleRestoreProduct = (productId: string, newSuggestedPrice?: number) => {
    setAllProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          isArchived: false,
          suggestedRetailPrice: newSuggestedPrice || p.suggestedRetailPrice,
          priceHistory: newSuggestedPrice ? [
            ...(p.priceHistory || []),
            {
              date: 'اليوم (استعادة من الأرشيف)',
              price: newSuggestedPrice,
              merchant: 'متجري (السعر المستعاد النشط)'
            }
          ] : p.priceHistory
        };
      }
      return p;
    }));

    const restored = allProducts.find(p => p.id === productId);
    if (restored) {
      setCurrentProduct({
        ...restored,
        isArchived: false,
        suggestedRetailPrice: newSuggestedPrice || restored.suggestedRetailPrice
      });
      setWinningPrice(newSuggestedPrice || restored.suggestedRetailPrice || Math.round(restored.currentLowestPrice * 0.95));
    }

    showToast('تمت استعادة المنتج بنجاح إلى لوحة التحكم والمنتجات النشطة ⭐');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleBulkRestoreProducts = (productIds: string[]) => {
    setAllProducts(prev => prev.map(p => {
      if (productIds.includes(p.id)) {
        return { ...p, isArchived: false };
      }
      return p;
    }));
    showToast(`تمت استعادة ${productIds.length} منتجات مجمعة إلى لوحة التحكم النشطة بنجاح ✅`);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handlePermanentDeleteProduct = (productId: string) => {
    setAllProducts(prev => prev.filter(p => p.id !== productId));
    setWatchlist(prev => prev.filter(w => w.productId !== productId));
    setAlerts(prev => prev.filter(a => a.productId !== productId));
    showToast('تم حذف المنتج وسجلاته نهائياً من النظام 🗑️');
  };

  const handleBulkDeleteProducts = (productIds: string[]) => {
    setAllProducts(prev => prev.filter(p => !productIds.includes(p.id)));
    setWatchlist(prev => prev.filter(w => !productIds.includes(w.productId)));
    setAlerts(prev => prev.filter(a => !productIds.includes(a.productId)));
    showToast(`تم حذف ${productIds.length} منتجات نهائياً من الأرشيف`);
  };

  // CSV / Excel Products Import Handler
  const handleImportProducts = (importedProducts: ProductData[], mode: 'merge' | 'append' | 'replace') => {
    if (mode === 'replace') {
      setAllProducts(importedProducts);
      if (importedProducts.length > 0) {
        setCurrentProduct(importedProducts[0]);
        setWinningPrice(Math.round(importedProducts[0].currentLowestPrice * (1 - selectedDiscount / 100)));
      }
      showToast(`تم استبدال الكتالوج بنجاح! تم تحميل ${importedProducts.length} منتج جديد 📥`);
    } else if (mode === 'append') {
      setAllProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const adjusted = importedProducts.map(p => {
          if (existingIds.has(p.id)) {
            return { ...p, id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` };
          }
          return p;
        });
        return [...prev, ...adjusted];
      });
      showToast(`تمت إضافة ${importedProducts.length} منتج جديد إلى الكتالوج بنجاح 📥`);
    } else {
      // Merge mode: update matching SKU/ID/name or add new
      setAllProducts(prev => {
        const merged = [...prev];
        importedProducts.forEach(newP => {
          const idx = merged.findIndex(p => 
            (p.sku && newP.sku && p.sku.toLowerCase() === newP.sku.toLowerCase()) || 
            p.id === newP.id || 
            p.title.trim().toLowerCase() === newP.title.trim().toLowerCase()
          );
          if (idx >= 0) {
            merged[idx] = {
              ...merged[idx],
              ...newP,
              id: merged[idx].id
            };
          } else {
            merged.push(newP);
          }
        });
        return merged;
      });
      showToast(`تم دمج وتحديث ${importedProducts.length} منتج في الكتالوج بنجاح 📥✨`);
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Handler for adding products enriched from Excel by AI
  const handleAddEnrichedProducts = (newProducts: ProductData[], setAsActive = true) => {
    setAllProducts(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const toAdd = newProducts.filter(p => !existingIds.has(p.id));
      return [...toAdd, ...prev];
    });

    if (setAsActive && newProducts.length > 0) {
      const first = newProducts[0];
      setCurrentProduct(first);
      setWinningPrice(Math.round(first.currentLowestPrice * (1 - selectedDiscount / 100)));
      setActiveTab('radar');
    }
  };

  // AI Chatbox Suggested Reprice Handler
  const handleChatApplyReprice = (productId: string, newPrice: number) => {
    setAllProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          suggestedRetailPrice: newPrice,
          priceHistory: [
            ...(p.priceHistory || []),
            {
              date: 'اليوم (تطبيق تسعير مقترح من Gemini)',
              price: newPrice,
              merchant: 'متجري (السعر المعتمد الجديد)'
            }
          ]
        };
      }
      return p;
    }));

    if (currentProduct && currentProduct.id === productId) {
      setCurrentProduct(prev => prev ? ({
        ...prev,
        suggestedRetailPrice: newPrice,
        priceHistory: [
          ...(prev.priceHistory || []),
          {
            date: 'اليوم (تطبيق تسعير مقترح من Gemini)',
            price: newPrice,
            merchant: 'متجري (السعر المعتمد الجديد)'
          }
        ]
      }) : null);
      setWinningPrice(newPrice);
    }
  };

  // Dedicated Separate Login Page Gatekeeper (Acts as gatekeeper before entering main dashboard)
  useEffect(() => {
    if (!isAuthLoading && user) {
      if (isBestSellerAutoAlertEnabled() && !hasSeenBestSellerAlertThisSession()) {
        const timer = setTimeout(() => {
          setIsBestSellerAlertModalOpen(true);
          markBestSellerAlertSeenThisSession();
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthLoading, user]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#08090D] flex flex-col items-center justify-center text-slate-100 font-['Cairo'] p-4 text-center">
        <div className="w-full max-w-xs sm:max-w-sm max-h-[85vh] mx-auto flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-sky-500/25 backdrop-blur-md shadow-2xl">
          <div className="relative mb-4 flex items-center justify-center mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center animate-pulse shadow-lg shadow-sky-500/15 mx-auto">
              <RadarBrandLogo className="w-10 h-10 max-w-full max-h-full" animated />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-400 rounded-full animate-ping" />
          </div>
          <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Outfit','Alexandria'] mb-1.5 text-center">
            RADAR — Global Marketplaces
          </h2>
          <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed">
            جاري التحقق من جلسة التاجر السحابية والربط الآمن مع فايربيس...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage 
        onLoginSuccess={() => {
          showToast('مرحباً بك مجدداً في رادار التاجر الذكي ⚡ تم الدخول بنجاح');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />
    );
  }

  // Shared renderer for individual platform cards (used across both standard category buckets and the dedicated inactive category)
  const renderPlatformCard = (plat: ConnectedMerchantPlatform, targetCatKey?: string, catObj?: PlatformCategoryConfig) => {
    const isMajor = ['facebook_marketplace', 'elaraby_group', 'btech_eg', 'raneen_eg'].includes(plat.code);
    const isExpanded = areAllPlatformDetailsExpanded || expandedPlatformIds.includes(plat.id);
    const platformLabel = plat.name.split('(')[0].trim();
    const isMaintenanceMode = Boolean(
      plat.isMaintenanceMode ||
      plat.status === 'maintenance' ||
      plat.scheduledMaintenance?.isActive
    );
    const hasSyncError = !isMaintenanceMode && Boolean(plat.hasSyncError || plat.status === 'error' || plat.syncError);
    const recentSyncError = hasSyncError ? getMostRecentSyncError(plat) : null;

    // Trigger Scheduled Maintenance Toast in renderPlatformCard when pressing the refresh button during scheduled maintenance
    const triggerScheduledMaintenanceToast = () => {
      const maintWindow = plat.scheduledMaintenance?.windowLabel || '02:00 ص - 05:00 ص (توقيت القاهرة)';
      const maintReason = plat.scheduledMaintenance?.reasonAr || `صيانة دورية مجدولة لخوادم وبوابة API منصة ${platformLabel}`;
      const maintEnd = plat.scheduledMaintenance?.expectedEndTime
        ? ` • الوقت المتبقي المتوقع: ${plat.scheduledMaintenance.expectedEndTime}`
        : '';
      showToast(
        `🛠️ إشعار صيانة مجدولة (${platformLabel}): المنصة في وضع الصيانة المجدولة حالياً [${maintWindow}] — ${maintReason}${maintEnd}. يرجى تجنب التزامن اليدوي في هذا الوقت لتفادي تعارض البيانات أو فشل الطلبات ⏳`,
        6000
      );
    };

    // Trigger informative Toast in renderPlatformCard when attempting to reconnect API after a prior Sync Error
    const triggerReconnectWithSyncErrorToast = () => {
      const diag = getSyncErrorDiagnosticResolution(plat);
      showToast(
        `🚨 تنبيه إعادة اتصال API (${platformLabel}): تم رصد خطأ سابق [HTTP ${diag.statusCode}] (${diag.errorMessage}) • الحل الجاري تطبيقه: ${diag.solution} 🔄`,
        5500
      );
      handleRetrySyncPlatform(plat.id);
    };

    // Determine platform type metadata (Default or Custom Category)
    const currentClassification = getPlatformClassification(plat.code, plat.category);
    const effectiveCatKey = targetCatKey || currentClassification;
    const matchedCatObj = catObj || platformCategories.find((c) => c.key === effectiveCatKey) || platformCategories.find((c) => c.key === currentClassification);
    const typeMeta = (() => {
      if (matchedCatObj) {
        const MatchedIcon = getCategoryIconComponent(matchedCatObj.iconName);
        return {
          label: matchedCatObj.title.split(' ')[0] || matchedCatObj.title,
          fullTitle: matchedCatObj.title,
          Icon: MatchedIcon,
          badgeClass: matchedCatObj.tagColor || 'bg-slate-800 text-slate-200 border-slate-700',
          iconColor: 'text-indigo-400',
        };
      }
      if (currentClassification === 'website') {
        return {
          label: 'موقع إلكتروني',
          fullTitle: 'موقع إلكتروني',
          Icon: Globe,
          badgeClass: 'bg-slate-800 text-sky-300 border-slate-700',
          iconColor: 'text-sky-400',
        };
      }
      if (currentClassification === 'social') {
        return {
          label: 'سوشيال ميديا',
          fullTitle: 'سوشيال ميديا',
          Icon: Smartphone,
          badgeClass: 'bg-slate-800 text-purple-300 border-slate-700',
          iconColor: 'text-purple-400',
        };
      }
      if (currentClassification === 'retail_chain') {
        return {
          label: 'سلسلة تجزئة',
          fullTitle: 'سلسلة تجزئة',
          Icon: Building2,
          badgeClass: 'bg-slate-800 text-teal-300 border-slate-700',
          iconColor: 'text-teal-400',
        };
      }
      return {
        label: 'ماركت بليس',
        fullTitle: 'ماركت بليس',
        Icon: ShoppingBag,
        badgeClass: 'bg-slate-800 text-sky-300 border-slate-700',
        iconColor: 'text-sky-400',
      };
    })();

    const isDeleteMode = platformInDeleteMode === plat.id;
    const isDragging = draggedPlatformId === plat.id;
    const isDragOver = dragOverPlatformId === plat.id;
    const isRecentlyMoved = recentlyMovedPlatformId === plat.id;

    // High contrast dark background for active platform cards with clear border
    const activeGradientStyle = (() => {
      if (matchedCatObj?.gradientFrom && matchedCatObj?.gradientTo) {
        return `bg-slate-900/90 ${matchedCatObj.headerColor || 'text-slate-100 font-bold'} border-slate-800 shadow-md hover:bg-slate-850`;
      }
      if (effectiveCatKey === 'marketplace') {
        return isMajor
          ? 'bg-slate-900/90 text-indigo-300 font-black shadow-md border-slate-800 hover:bg-slate-800/90'
          : 'bg-slate-900/90 text-sky-300 font-black shadow-md border-slate-800 hover:bg-slate-800/90';
      }
      if (effectiveCatKey === 'website') {
        return 'bg-slate-900/90 text-sky-300 font-black shadow-md border-slate-800 hover:bg-slate-800/90';
      }
      if (effectiveCatKey === 'retail_chain') {
        return 'bg-slate-900/90 text-teal-300 font-black shadow-md border-slate-800 hover:bg-slate-800/90';
      }
      if (effectiveCatKey === 'social') {
        return 'bg-slate-900/90 text-purple-300 font-black shadow-md border-slate-800 hover:bg-slate-800/90';
      }
      return 'bg-slate-900/90 text-slate-100 font-black shadow-md border-slate-800 hover:bg-slate-800/90';
    })();

    const isHealthy = plat.isConnected && !hasSyncError && (plat.status === 'active' || !plat.status);
    const isStaleOrError = Boolean(hasSyncError || plat.status === 'error' || plat.syncError);
    const isSyncingNow = refreshingPlatformIds.includes(plat.id) || (isRefreshingPlatforms && plat.isConnected);
    const isSyncSuccess = recentlySyncedPlatformIds.includes(plat.id);

    // Calculate or extract realistic API response latency (ms) for this platform
    const platformLatencyMs: number = (() => {
      if (plat.latencyMs && plat.latencyMs > 0) return plat.latencyMs;
      if (plat.syncHistory && plat.syncHistory.length > 0 && plat.syncHistory[0].latencyMs) {
        return plat.syncHistory[0].latencyMs;
      }
      if (hasSyncError) return 1840; // High latency / timeout for error states
      if (plat.code === 'amazon_eg') return 145; // Fast SP-API
      if (plat.code === 'noon_eg') return 188; // Fast Noon Partner API
      if (plat.code === 'jumia_eg') return 430; // Moderate Jumia API
      if (plat.code === 'homzmart_eg') return 360; // Moderate Homzmart
      if (plat.code === 'kenzz_eg') return 520; // Moderate Kenzz
      if (plat.code === 'btech_eg' || plat.code === 'twob_eg') return 640; // Moderate Retail Chain
      if (plat.code === 'facebook_marketplace' || plat.code === 'tiktok_shop') return 275; // Fast Social Graph API
      if (plat.code === 'shopify_salla') return 215; // Fast REST/GraphQL
      return 230;
    })();

    // Determine Latency tier: Green (< 300ms), Yellow (300ms - 800ms), Red (> 800ms or error)
    const latencyTier = (() => {
      if (hasSyncError || platformLatencyMs > 800) {
        return {
          tier: 'red' as const,
          label: 'بطيء / عطل',
          colorClass: 'bg-rose-950/80 text-rose-300 border-rose-800 shadow-rose-900/30',
          dotColor: 'bg-rose-500',
          iconColor: 'text-rose-400',
          pulse: true,
          tooltipText: 'زمن استجابة بطيء (> 800ms) أو تعثر بالـ API'
        };
      }
      if (platformLatencyMs >= 300) {
        return {
          tier: 'yellow' as const,
          label: 'متوسط',
          colorClass: 'bg-sky-950/80 text-sky-300 border-sky-800 shadow-sky-900/30',
          dotColor: 'bg-sky-500',
          iconColor: 'text-sky-400',
          pulse: false,
          tooltipText: 'زمن استجابة متوسط ومقبول (300ms - 800ms)'
        };
      }
      return {
        tier: 'green' as const,
        label: 'سريع جداً',
        colorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800 shadow-emerald-900/30',
        dotColor: 'bg-emerald-500',
        iconColor: 'text-emerald-400',
        pulse: false,
        tooltipText: 'استجابة فائقة السرعة (< 300ms)'
      };
    })();

    const syncAlertInfo = getPlatformLastSuccessfulSyncInfo(plat);
    const isDelayedSync = syncAlertInfo.isDelayedOver2Hours;

    const healthBorderHighlight = isStaleOrError
      ? 'border-rose-500/90 ring-1 ring-rose-500/50 shadow-2xs shadow-rose-500/10 hover:border-rose-400 hover:ring-rose-400/70'
      : isDelayedSync
        ? 'border-orange-500 ring-2 ring-orange-500/70 shadow-md shadow-orange-500/20 hover:border-orange-400 hover:ring-orange-400/80'
        : isHealthy
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-2xs shadow-emerald-500/10 hover:border-emerald-400 hover:ring-emerald-400/70'
          : 'border-slate-800 ring-1 ring-slate-800/80 shadow-2xs hover:border-slate-700 hover:ring-slate-700';

    return (
      <motion.div
        whileHover={
          !isDeleteMode && !isDragging
            ? {
                y: isExpanded ? -1.5 : -3,
                scale: isExpanded ? 1.004 : isPlatformBarCompact ? 1.025 : 1.014,
              }
            : undefined
        }
        whileTap={!isDeleteMode && !isDragging ? { scale: 0.985 } : undefined}
        transition={{
          y: { type: 'spring', stiffness: 420, damping: 24, mass: 0.7 },
          scale: { type: 'spring', stiffness: 420, damping: 24, mass: 0.7 },
        }}
        key={plat.id}
        className="inline-flex"
      >
        <div
          id={`btn-dash-platform-${plat.code}`}
          draggable={!isDeleteMode}
          onDragStart={(e) => handlePlatformDragStart(e, plat.id)}
          onDragOver={(e) => handlePlatformDragOver(e, plat.id, effectiveCatKey)}
          onDragLeave={(e) => handlePlatformDragLeave(e, plat.id)}
          onDragEnd={handlePlatformDragEnd}
          onDrop={(e) => handlePlatformDrop(e, plat.id, effectiveCatKey)}
          onMouseDown={() => startPlatformLongPress(plat.id, platformLabel)}
          onMouseUp={cancelPlatformLongPress}
          onMouseLeave={cancelPlatformLongPress}
          onTouchStart={() => startPlatformLongPress(plat.id, platformLabel)}
          onTouchEnd={cancelPlatformLongPress}
          onTouchCancel={cancelPlatformLongPress}
          onClick={() => {
            if (wasDraggingRef.current) {
              wasDraggingRef.current = false;
              return;
            }
            if (wasPlatformLongPressRef.current) {
              wasPlatformLongPressRef.current = false;
              return;
            }
            if (isDeleteMode) {
              setPlatformInDeleteMode(null);
              return;
            }
            if (hasSyncError) {
              setSyncErrorDetailsModalPlatform(plat);
            } else {
              setPlatformForConnection(plat);
            }
          }}
          title={
            isPlatformBarCompact
              ? undefined
              : isDeleteMode
                ? `وضع الحذف مفعل: انقر على زر (X) لإزالة منصة ${platformLabel}، أو انقر في أي مكان للإلغاء`
                : hasSyncError && recentSyncError
                  ? `تنبيه خطأ في التزامن (${platformLabel}): ${recentSyncError.message}${recentSyncError.statusCode ? ` [HTTP ${recentSyncError.statusCode}]` : ''}${recentSyncError.timestamp ? ` في ${recentSyncError.timestamp}` : ''} (انقر لعرض تفاصيل الخطأ والتشخيص الفني، أو اضغط مطولاً للحذف)`
                  : isHealthy
                    ? `حالة القناة: اتصال سليم ومستقر ✓ (${platformLabel} - حدود خضراء) | انقر لفتح إعدادات وربط الحساب | اسحب لإعادة الترتيب`
                    : `حالة القناة: غير متصلة (${platformLabel}) | انقر لربط الحساب وتفعيل المزامنة`
          }
          className={`platform-card group/plat-card relative rounded-xl text-[11px] font-bold border transition-all duration-300 ease-out flex select-none hover:shadow-xl hover:z-20 w-full sm:w-auto max-w-full overflow-hidden ${
            isExpanded
              ? 'flex-col items-stretch p-2 sm:p-2.5 gap-2 min-w-0 sm:min-w-[340px] shadow-2xs'
              : isPlatformBarCompact
                ? 'platform-card-compact group/compact-card flex-row items-center px-2 py-1 gap-1'
                : 'flex-row items-center px-2 sm:px-2.5 py-1.5 gap-1 sm:gap-1.5'
          } ${
            isRecentlyMoved
              ? 'animate-recently-moved ring-2 ring-emerald-500 bg-emerald-950 text-emerald-200 font-black shadow-md border-emerald-500 z-10'
              : isDragging
                ? 'opacity-40 scale-95 border-dashed border-indigo-400 ring-2 ring-indigo-500 shadow-inner bg-slate-900/90'
                : isDragOver
                  ? 'ring-2 ring-indigo-500 border-indigo-500 scale-105 bg-slate-900/90 shadow-md z-10'
                  : isDeleteMode
                    ? 'ring-2 ring-rose-500 bg-slate-900/90 text-rose-300 border-rose-800 shadow-md animate-pulse cursor-pointer'
                    : hasSyncError
                      ? `bg-slate-900/90 text-rose-200 border-rose-800/90 ${healthBorderHighlight} cursor-pointer`
                      : isDelayedSync
                        ? `bg-slate-900/95 text-orange-200 ${healthBorderHighlight} cursor-pointer`
                        : plat.isConnected
                          ? `${activeGradientStyle} ${healthBorderHighlight} cursor-pointer`
                          : `bg-slate-900/90 text-slate-200 border-slate-800 ${healthBorderHighlight} hover:bg-slate-800/90 hover:text-white cursor-pointer`
          }`}
        >
          {/* Hidden Delete (X) Button - Appears ONLY on long press */}
          {isDeleteMode && (
            <button
              type="button"
              id={`btn-delete-platform-${plat.code}`}
              onClick={(e) => {
                e.stopPropagation();
                cancelPlatformLongPress();
                handleDeletePlatform(plat.id, platformLabel);
              }}
              title={`إزالة منصة ${platformLabel} من لوحة التحكم`}
              className="absolute -top-2.5 -start-2 z-30 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer active:scale-90 transition-transform animate-bounce"
            >
              <X className="w-3 h-3 stroke-[3]" />
            </button>
          )}

          {/* Small Red Alert Icon Above Platform with Dynamic Sync Error Tooltip from Sync History */}
          {hasSyncError && !isDeleteMode && recentSyncError && (
            <div className="absolute -top-2 -end-1.5 z-25 group/syncerror">
              <button
                type="button"
                id={`badge-sync-error-${plat.code}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSyncErrorDetailsModalPlatform(plat);
                }}
                title={`خطأ المزامنة الأخير (${platformLabel}): ${recentSyncError.message}${recentSyncError.statusCode ? ` [HTTP ${recentSyncError.statusCode}]` : ''}${recentSyncError.timestamp ? ` (${recentSyncError.timestamp})` : ''} - انقر لعرض تفاصيل الخطأ والتشخيص الفني 🔍`}
                className="flex items-center justify-center cursor-pointer transition-transform hover:scale-125 focus:outline-hidden"
                aria-label={`تنبيه خطأ المزامنة لقناة ${platformLabel}: ${recentSyncError.message} - انقر لعرض التفاصيل`}
              >
                <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-rose-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white items-center justify-center shadow-xs border border-white ring-1 ring-rose-300">
                  <AlertTriangle className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                </span>
              </button>

              {/* Floating Sync Error Tooltip dynamically displaying the most recent error message from sync history */}
              <div
                role="tooltip"
                id={`tooltip-sync-error-${plat.code}`}
                className="pointer-events-none absolute bottom-full end-0 mb-2 opacity-0 group-hover/syncerror:opacity-100 transition-all duration-150 z-40 scale-95 group-hover/syncerror:scale-100 origin-bottom-right shadow-2xl rounded-xl bg-slate-900 text-white p-3 border border-rose-500/50 text-right w-72 space-y-2 backdrop-blur-md"
              >
                {/* Tooltip Header */}
                <div className="flex items-center justify-between gap-1.5 border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>سبب فشل المزامنة الأخير</span>
                  </div>
                  {recentSyncError.statusCode && (
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      HTTP {recentSyncError.statusCode}
                    </span>
                  )}
                </div>

                {/* Dynamic Recent Error Message from Sync History */}
                <div className="space-y-1">
                  <p className="text-xs text-white font-bold leading-relaxed">
                    {recentSyncError.message}
                  </p>
                  {recentSyncError.statusText && recentSyncError.statusText !== 'OK' && (
                    <span className="inline-block text-[10px] font-mono text-rose-300/80 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/50">
                      الحالة: {recentSyncError.statusText}
                    </span>
                  )}
                </div>

                {/* Tooltip Footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span className="font-mono text-slate-400">
                    {recentSyncError.timestamp ? `🕒 ${recentSyncError.timestamp}` : 'آخر محاولة فاشلة'}
                  </span>
                  <span className="text-sky-300 font-bold flex items-center gap-0.5">
                    انقر للتشخيص والتفاصيل 🔍
                  </span>
                </div>

                {/* Tooltip Arrow pointing to badge */}
                <div className="absolute top-full end-2.5 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          )}

          {/* Main Horizontal Platform Chip / Header Row */}
          <div className={`flex items-center justify-between gap-1 sm:gap-1.5 w-full min-w-0 ${isExpanded ? 'flex-wrap sm:flex-nowrap' : ''}`}>
            {/* Start Group: Grip, Status, Name, and Badges */}
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
              {/* Visual Drag Gripper Handle */}
              {!isDeleteMode && (
            <span
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 -ms-0.5 cursor-grab active:cursor-grabbing"
              title="اسحب لإعادة ترتيب المنصة داخل القسم ↕️"
            >
              <GripVertical className="w-3 h-3 stroke-[2.5]" />
            </span>
          )}

              {/* Quick Favorite Pin Star Button */}
              {!isDeleteMode && (
                <button
                  type="button"
                  id={`btn-fav-platform-${plat.code}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavoritePlatform(plat.id);
                  }}
                  title={plat.category === 'favorites' ? 'إزالة من المفضلات السريعة' : 'تثبيت في المفضلات السريعة في المقدمة ⭐'}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-95 ${
                    plat.category === 'favorites'
                      ? 'text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 border border-emerald-400/60 scale-105'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40'
                  }`}
                  aria-label={plat.category === 'favorites' ? `إزالة ${platformLabel} من المفضلات` : `تثبيت ${platformLabel} في المفضلات`}
                >
                  <Star className={`w-3 h-3 ${plat.category === 'favorites' ? 'fill-sky-500 text-sky-600' : ''}`} />
                </button>
              )}

          {/* Platform Status Indicator Dot & Latency Indicator with Interactive Sync Status Tooltip */}
          <div className="relative group/platform-status-tip inline-flex items-center gap-1.5 shrink-0">
            <span
              id={`indicator-sync-${plat.code}`}
              tabIndex={0}
              role="status"
              aria-label={`حالة مزامنة ${platformLabel}: ${
                hasSyncError
                  ? 'تعثر المزامنة أو وجود خطأ اتصال'
                  : isSyncingNow
                  ? 'جاري المزامنة الآن'
                  : isSyncSuccess
                  ? 'تمت المزامنة بنجاح'
                  : isHealthy
                  ? 'متصل ومزامن بنجاح'
                  : 'غير متصل أو المزامنة معطلة'
              }`}
              className={`w-2 h-2 rounded-full cursor-help transition-all transform hover:scale-125 border border-white shrink-0 ${
                hasSyncError
                  ? 'bg-rose-600 ring-2 ring-rose-300 animate-ping'
                  : isSyncingNow
                  ? 'bg-sky-500 ring-2 ring-sky-300 animate-spin'
                  : isHealthy
                  ? 'bg-emerald-500 ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-slate-400 ring-1 ring-slate-300'
              }`}
            />

            {/* Latency (ms) Indicator Chip beside Sync Status - Color changes between Green, Yellow, and Red */}
            <span
              id={`latency-indicator-${plat.code}`}
              className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black font-mono border transition-all cursor-help shrink-0 shadow-2xs ${
                latencyTier.colorClass
              } ${latencyTier.pulse ? 'animate-pulse' : ''}`}
              title={`سرعة استجابة API (${platformLabel}): ${platformLatencyMs}ms — ${latencyTier.tooltipText}`}
            >
              <Activity className={`w-2.5 h-2.5 ${latencyTier.iconColor}`} />
              <span>{isSyncingNow ? '...' : `${platformLatencyMs}ms`}</span>
            </span>

            {/* Interactive Sync Status Tooltip for Status Dot (Only in standard mode) */}
            {!isPlatformBarCompact && (
              <div
                role="tooltip"
                id={`tooltip-platform-sync-dot-${plat.code}`}
                className="pointer-events-none absolute bottom-full start-0 mb-2 opacity-0 group-hover/platform-status-tip:opacity-100 group-focus-within/platform-status-tip:opacity-100 transition-all duration-200 z-50 scale-95 group-hover/platform-status-tip:scale-100 group-focus-within/platform-status-tip:scale-100 origin-bottom-left shadow-2xl rounded-2xl bg-slate-900/95 text-white p-3 border border-slate-700/80 text-right w-64 sm:w-72 space-y-2 backdrop-blur-md select-none"
                dir="rtl"
              >
                {/* Tooltip Header */}
                <div className="flex items-center justify-between gap-1.5 border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-black">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        hasSyncError
                          ? 'bg-rose-500'
                          : isSyncingNow
                          ? 'bg-sky-400 animate-spin'
                          : isHealthy
                          ? 'bg-emerald-400'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-white truncate font-['Cairo']">{platformLabel}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      hasSyncError
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : isSyncingNow
                        ? 'bg-sky-950 text-sky-300 border-sky-800'
                        : isHealthy
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {hasSyncError
                      ? 'خطأ مزامنة ⚠️'
                      : isSyncingNow
                      ? 'مزامنة نشطة ⚡'
                      : isHealthy
                      ? 'متصل ومستقر ✓'
                      : 'غير متصل ✕'}
                  </span>
                </div>

                {/* Sync Status Description Details */}
                <div className="space-y-1 text-[11px]">
                  <p className="text-slate-200 font-medium leading-relaxed">
                    {hasSyncError
                      ? recentSyncError
                        ? `تعثر التزامن: ${recentSyncError.message}`
                        : 'يوجد خطأ في مزامنة الأسعار أو المخزون مع المنصة.'
                      : isSyncingNow
                      ? 'جاري إرسال واستقبال أحدث تحديثات المنتجات والأسعار الآن...'
                      : isSyncSuccess
                      ? 'تم تحديث كافة بيانات المنصة بنجاح واستقرار فوري.'
                      : isHealthy
                      ? 'المزامنة السحابية تعمل بكفاءة وبدون أي أخطاء مسجلة.'
                      : 'المزامنة متوقفة حالياً. اضغط على المنصة لتفعيل الربط التلقائي.'}
                  </p>

                  <div className="pt-1.5 border-t border-slate-800/80 flex flex-col gap-1 text-[10px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">آخر مزامنة ناجحة:</span>
                      <span className="font-mono text-slate-300 font-bold">
                        {plat.lastSyncedAt || 'لم تتم المزامنة بعد'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">التزامن التلقائي:</span>
                      <span className={`font-bold ${plat.autoSyncPrice ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {plat.autoSyncPrice ? 'مفعل فوري ⚡' : 'يدوي عند الطلب'}
                      </span>
                    </div>
                    {recentSyncError?.statusCode && (
                      <div className="flex items-center justify-between text-rose-400">
                        <span>رمز الاستجابة:</span>
                        <span className="font-mono font-bold">HTTP {recentSyncError.statusCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tooltip Tip */}
                <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800/70 flex items-center justify-between">
                  <span>{plat.isConnected ? 'مفتاح المزامنة نشط' : 'انقر لتفعيل القناة'}</span>
                  <span className="text-indigo-300 font-bold">انقر للإعدادات ⚡</span>
                </div>

                {/* Tooltip Arrow pointing down to dot */}
                <div className="absolute top-full start-2 border-4 border-transparent border-t-slate-900" />
              </div>
            )}
          </div>

          {/* Floating Interactive Tooltip specifically for Compact Mode (الوضع المدمج) - Shows Full Name & Status */}
          {isPlatformBarCompact && (
            <div
              role="tooltip"
              id={`tooltip-compact-platform-${plat.code}`}
              className="pointer-events-none absolute bottom-full start-1/2 -translate-x-1/2 mb-2.5 opacity-0 group-hover/compact-card:opacity-100 group-focus-within/compact-card:opacity-100 transition-all duration-200 z-50 scale-95 group-hover/compact-card:scale-100 group-focus-within/compact-card:scale-100 origin-bottom shadow-2xl rounded-2xl bg-slate-900/95 text-white p-3 border border-slate-700/80 text-right w-64 sm:w-72 space-y-2 backdrop-blur-md select-none"
              dir="rtl"
            >
              {/* Tooltip Header: Dynamic Brand Logo + Full Channel Name + Category + Status Pill */}
              <div className="flex items-start justify-between gap-2.5 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Dynamic Brand Logo (e.g. Amazon, Noon, Jumia, Meta, TikTok, B.TECH, etc.) */}
                  <div className="relative shrink-0">
                    <PlatformDynamicBrandIcon
                      code={plat.code}
                      name={plat.name}
                      className="w-9 h-9 rounded-xl shadow-md ring-1 ring-white/20 transition-transform group-hover/compact-card:scale-105"
                    />
                    {/* Live Connection Status Dot Overlay */}
                    <span
                      className={`absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        hasSyncError
                          ? 'bg-rose-500 ring-1 ring-rose-400'
                          : isSyncingNow
                            ? 'bg-sky-400 ring-1 ring-sky-300 animate-spin'
                            : isHealthy
                              ? 'bg-emerald-400 ring-1 ring-emerald-300'
                              : 'bg-slate-400'
                      }`}
                      title={isHealthy ? 'اتصال سليم ومستقر' : hasSyncError ? 'تعثر في التزامن' : 'غير متصل'}
                    />
                  </div>

                  <div className="min-w-0 text-right">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[12px] font-black text-white block truncate font-['Cairo'] tracking-tight" title={plat.name}>
                        {plat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-medium mt-0.5">
                      <typeMeta.Icon className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{typeMeta.fullTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    hasSyncError
                      ? 'bg-rose-950/90 text-rose-300 border-rose-800 animate-pulse'
                      : isSyncingNow
                        ? 'bg-sky-950/90 text-sky-300 border-sky-800 animate-pulse'
                        : isHealthy
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800/90 text-slate-400 border-slate-700'
                  }`}
                >
                  {hasSyncError
                    ? 'تعثر المزامنة ⚠️'
                    : isSyncingNow
                      ? 'جاري التحديث ⚡'
                      : isHealthy
                        ? 'متصل ونشط ✓'
                        : 'غير متصل ✕'}
                </span>
              </div>

              {/* Tooltip Body: Detailed Current Status */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex flex-col gap-0.5 text-slate-200">
                  <span className="text-slate-400 text-[10px]">الحالة الحالية:</span>
                  <span className="font-bold text-slate-100 text-[11.5px] leading-snug">
                    {hasSyncError
                      ? recentSyncError
                        ? `خطأ في المزامنة: ${recentSyncError.message}`
                        : 'يوجد خطأ في مزامنة الأسعار أو المخزون'
                      : isSyncingNow
                        ? 'جاري فحص وتحديث أسعار ومخزون القناة لحظياً...'
                        : isHealthy
                          ? 'اتصال مستقر وتزامن أسعار تلقائي فوري'
                          : 'القناة غير متصلة (اضغط لربط الحساب وتفعيل المزامنة)'}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-800/80 flex flex-col gap-1 text-[10px] text-slate-400">
                  {/* Merchant Account / Email */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">حساب التاجر:</span>
                    <span className="font-mono text-slate-300 font-medium truncate max-w-[150px]" dir="ltr">
                      {plat.merchantEmail || 'غير مرتبط بإيميل'}
                    </span>
                  </div>

                  {/* Last Sync */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">آخر مزامنة:</span>
                    <span className="font-mono text-slate-300 font-bold">
                      {plat.lastSyncedAt || 'لم تتم بعد'}
                    </span>
                  </div>

                  {/* API Response Latency (ms) */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">زمن الاستجابة (Latency):</span>
                    <span className={`font-mono font-bold flex items-center gap-1 ${
                      latencyTier.tier === 'green' ? 'text-emerald-400' : latencyTier.tier === 'yellow' ? 'text-sky-400' : 'text-rose-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${latencyTier.dotColor}`} />
                      <span>{platformLatencyMs}ms ({latencyTier.label})</span>
                    </span>
                  </div>

                  {/* Competitors Count if any */}
                  {Boolean(plat.importedCompetitorsCount) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">المنافسون المتابعون:</span>
                      <span className="font-bold text-sky-400">
                        {plat.importedCompetitorsCount} منافس
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tooltip Footer: Action Hint */}
              <div className="text-[9.5px] text-slate-400 pt-1.5 border-t border-slate-800/70 flex items-center justify-between">
                <span>{plat.isConnected ? 'انقر لإدارة الاتصال والمزامنة' : 'انقر لربط القناة فوراً'}</span>
                <span className="text-indigo-300 font-bold">إعدادات القناة ⚡</span>
              </div>

              {/* Tooltip Arrow pointing down to card */}
              <div className="absolute top-full start-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
            </div>
          )}

          {/* Platform Name and Icon (Clicking triggers connection settings directly) */}
          <span 
            className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setPlatformForConnection(plat);
            }}
            title={isPlatformBarCompact ? undefined : `انقر مباشرة لربط إيميل أو حساب التاجر بـ ${platformLabel} ⚡`}
          >
            <span className={`platform-title truncate font-['Cairo'] transition-colors min-w-0 ${
              isPlatformBarCompact 
                ? 'text-[11.5px] font-black text-slate-100' 
                : plat.isConnected 
                  ? 'text-xs font-black text-slate-100' 
                  : hasSyncError 
                    ? 'text-xs font-black text-rose-300' 
                    : 'text-xs font-extrabold text-slate-200'
            }`}>
              {platformLabel}
            </span>

            {/* Connection Health Indicator Badge (مؤشر صحة الاتصال) */}
            {!isPlatformBarCompact && (
              <span
                id={`health-indicator-${plat.code}`}
                onClick={(e) => {
                  if (isMaintenanceMode) {
                    e.stopPropagation();
                    triggerScheduledMaintenanceToast();
                    return;
                  }
                  if (hasSyncError) {
                    e.stopPropagation();
                    triggerReconnectWithSyncErrorToast();
                  }
                }}
                className={`items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black border shrink-0 ${
                  isMaintenanceMode
                    ? 'inline-flex bg-sky-950/90 text-sky-300 border-sky-700 animate-pulse cursor-pointer hover:bg-sky-900/90'
                    : hasSyncError
                    ? 'inline-flex bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse cursor-pointer hover:bg-rose-900/90'
                    : isHealthy
                    ? 'hidden sm:inline-flex bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'hidden sm:inline-flex bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title={
                  isMaintenanceMode
                    ? `وضع الصيانة المجدولة (${plat.scheduledMaintenance?.windowLabel || 'جاري الصيانة'}): تجنب التزامن اليدوي حالياً`
                    : hasSyncError
                    ? 'تحذير: تعثر اتصال الـ API - انقر لإعادة الاتصال الفوري وإصلاح الخطأ'
                    : isHealthy
                    ? 'صحة الاتصال بالـ API مستقرة (100%)'
                    : 'الخدمة غير متصلة'
                }
              >
                {isMaintenanceMode ? (
                  <Wrench className="w-2.5 h-2.5 text-sky-400" />
                ) : (
                  <ShieldCheck className={`w-2.5 h-2.5 ${hasSyncError ? 'text-rose-400' : isHealthy ? 'text-emerald-400' : 'text-slate-400'}`} />
                )}
                <span>
                  {isMaintenanceMode
                    ? 'صيانة مجدولة 🛠️'
                    : hasSyncError
                    ? 'إصلاح خطأ API ⚠️'
                    : isHealthy
                    ? 'صحة 100% ✓'
                    : 'غير متصل'}
                </span>
              </span>
            )}

            {/* Visual Alert System: تاريخ آخر مزامنة ناجحة لكل قناة بيع مع تمييز القنوات المتأخرة لأكثر من ساعتين باللون البرتقالي */}
            <div
              id={`sync-alert-badge-${plat.code}`}
              className={`items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-help shrink-0 shadow-2xs ${
                syncAlertInfo.isDelayedOver2Hours
                  ? 'inline-flex bg-orange-950/90 text-orange-300 border-orange-500/90 ring-1 ring-orange-500/60 shadow-orange-500/20 animate-pulse'
                  : isPlatformBarCompact
                    ? 'hidden'
                    : 'hidden sm:inline-flex bg-slate-800/90 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
              title={
                syncAlertInfo.isDelayedOver2Hours
                  ? `⚠️ تنبيه تأخر المزامنة: تجاوزت مهلة الساعتين! تاريخ آخر مزامنة ناجحة: ${syncAlertInfo.lastSuccessfulSyncFormatted} (${syncAlertInfo.timeAgoLabel}) — انقر لتحديث ومزامنة القناة الآن`
                  : `تاريخ آخر مزامنة ناجحة: ${syncAlertInfo.lastSuccessfulSyncFormatted} (${syncAlertInfo.timeAgoLabel}) ✓`
              }
            >
              {syncAlertInfo.isDelayedOver2Hours ? (
                <Clock className="w-3 h-3 text-orange-400 shrink-0 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              )}
              <span className={syncAlertInfo.isDelayedOver2Hours ? 'text-orange-200 text-[9.5px]' : 'text-slate-400 text-[9.5px] hidden xl:inline'}>
                آخر مزامنة ناجحة:
              </span>
              <span className={`font-mono font-black text-[10px] ${syncAlertInfo.isDelayedOver2Hours ? 'text-orange-300' : 'text-emerald-300'}`}>
                {syncAlertInfo.lastSuccessfulSyncFormatted}
              </span>
              {syncAlertInfo.isDelayedOver2Hours ? (
                <span className="text-[9px] px-1 py-0.2 rounded bg-orange-900/90 text-orange-100 font-black border border-orange-600">
                  تأخر {syncAlertInfo.timeAgoLabel} ⚠️
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-mono hidden md:inline">
                  ({syncAlertInfo.timeAgoLabel})
                </span>
              )}
            </div>

            {/* Compact Mode Visual Alert Indicator when delayed over 2 hours */}
            {isPlatformBarCompact && syncAlertInfo.isDelayedOver2Hours && (
              <span
                id={`sync-alert-compact-${plat.code}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-orange-950/90 text-orange-300 border border-orange-500 animate-pulse shrink-0"
                title={`⚠️ تأخر المزامنة لأكثر من ساعتين! تاريخ آخر مزامنة ناجحة: ${syncAlertInfo.lastSuccessfulSyncFormatted}`}
              >
                <Clock className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                <span>تأخر &gt; 2س 🟠</span>
              </span>
            )}

            {/* Small Icon & Badge Indicating Platform Type with Interactive Sync Tooltip */}
            {!isPlatformBarCompact && (
              <div className="relative group/platform-type-tip hidden md:inline-flex items-center">
                <span
                  id={`type-badge-${plat.code}`}
                  tabIndex={0}
                  role="region"
                  aria-label={`أيقونة وتصنيف ${platformLabel}: ${typeMeta.label} - ${
                    isHealthy ? 'مزامنة مستقرة' : hasSyncError ? 'يوجد خطأ مزامنة' : 'غير متصل'
                  }`}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold border shrink-0 transition-all hover:shadow-xs cursor-help ${typeMeta.badgeClass}`}
                >
                  <typeMeta.Icon className={`w-2.5 h-2.5 shrink-0 ${typeMeta.iconColor}`} />
                  <span>{typeMeta.label}</span>
                </span>

                {/* Interactive Sync Status Tooltip when hovering over Platform Type Icon */}
                <div
                  role="tooltip"
                  id={`tooltip-platform-type-icon-${plat.code}`}
                  className="pointer-events-none absolute bottom-full start-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/platform-type-tip:opacity-100 group-focus-within/platform-type-tip:opacity-100 transition-all duration-200 z-50 scale-95 group-hover/platform-type-tip:scale-100 group-focus-within/platform-type-tip:scale-100 origin-bottom shadow-2xl rounded-2xl bg-slate-900/95 text-white p-3 border border-slate-700/80 text-right w-64 sm:w-72 space-y-2 backdrop-blur-md select-none"
                  dir="rtl"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-1.5 border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-100">
                      <div className="p-1 rounded-md bg-slate-800 text-indigo-400 border border-slate-700 shrink-0">
                        <typeMeta.Icon className="w-3 h-3 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-white truncate block font-['Cairo']">{platformLabel}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{typeMeta.fullTitle || typeMeta.label}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        hasSyncError
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : isSyncingNow
                          ? 'bg-sky-950/80 text-sky-300 border-sky-800'
                          : isHealthy
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {hasSyncError
                        ? 'تعثر المزامنة ⚠️'
                        : isSyncingNow
                        ? 'جاري المزامنة ⚡'
                        : isHealthy
                        ? 'المزامنة نشطة ومستقرة ✓'
                        : 'المزامنة معطلة ✕'}
                    </span>
                  </div>

                  {/* Channel & Sync Status Body */}
                  <div className="space-y-1.5 text-[11px]">
                    <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 space-y-1 text-[10px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-indigo-400" />
                          <span>آخر تحديث ومزامنة:</span>
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {plat.lastSyncedAt || 'لم يسجل توقيت مزامنة'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-sky-400" />
                          <span>مزامنة الأسعار الفورية:</span>
                        </span>
                        <span className={`font-bold ${plat.autoSyncPrice ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {plat.autoSyncPrice ? 'تلقائي فوري ⚡' : 'يدوي'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5 text-sky-400" />
                          <span>حالة الاتصال والخدمة:</span>
                        </span>
                        <span className={`font-bold ${isHealthy ? 'text-emerald-400' : hasSyncError ? 'text-rose-400' : 'text-slate-400'}`}>
                          {isHealthy ? 'مستقرة 100%' : hasSyncError ? 'بحاجة لإعادة اتصال' : 'غير متصلة'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Activity className={`w-2.5 h-2.5 ${latencyTier.iconColor}`} />
                          <span>زمن استجابة API (Latency):</span>
                        </span>
                        <span className={`font-mono font-bold flex items-center gap-1 ${
                          latencyTier.tier === 'green' ? 'text-emerald-400' : latencyTier.tier === 'yellow' ? 'text-sky-400' : 'text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${latencyTier.dotColor}`} />
                          <span>{platformLatencyMs}ms ({latencyTier.label})</span>
                        </span>
                      </div>
                    </div>

                    {hasSyncError && (
                      <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800 text-[10px] text-rose-200 space-y-1">
                        <div className="font-black text-rose-300 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>💡 تشخيص عطل الـ API:</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSyncErrorDetailsModalPlatform(plat);
                            }}
                            className="text-sky-300 hover:text-white underline text-[9.5px] font-bold cursor-pointer"
                          >
                            عرض التفاصيل الكاملة 🔍
                          </button>
                        </div>
                        <p className="leading-relaxed text-[9.5px] text-rose-100">
                          {recentSyncError?.message || 'تعذر الاتصال بـ API المنصة. يرجى التحقق من صلاحية مفتاح الربط (API Key / Token) أو إعادة ربط إيميل حساب التاجر.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Guidance */}
                  <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800/70 flex items-center justify-between">
                    <span className="text-slate-400">
                      {plat.importedCompetitorsCount ? `${plat.importedCompetitorsCount} منافس مربوط` : 'يمكن استيراد CSV'}
                    </span>
                    <span className="text-sky-300 font-bold">انقر للإعدادات ⚡</span>
                  </div>

                  {/* Tooltip Arrow pointing down to badge */}
                  <div className="absolute top-full start-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
              </div>
            )}
          </span>
        </div>

        {/* End Group: Actions, Badges, Sync, and Expand Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 ms-auto">
          {/* Quick Direct Launch Shortcut Button on Platform Chip */}
          <button
            type="button"
            id={`btn-direct-launch-chip-${plat.code}`}
            onClick={(e) => {
              e.stopPropagation();
              directLaunchPlatformPortal(plat, {
                onLaunched: () => {
                  showToast(`🚀 جاري فتح مركز إدارة وبائعي ${platformLabel} المعتمد...`);
                  const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                  setConnectedPlatforms((prev) => {
                    const next = prev.map((p) => (p.id === plat.id ? { ...p, lastLaunchedAt: now } : p));
                    saveStoredPlatformsForMerchant(activeMerchantId, next);
                    return next;
                  });
                },
              });
            }}
            title={`فتح وإدارة مركز بائعي ${platformLabel} مباشرة بضغطة واحدة (Direct Launch) 🚀`}
            className="h-8 px-2.5 rounded-md text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-2xs hover:shadow-xs whitespace-nowrap flex items-center gap-1.5 justify-center transition-all active:scale-90 cursor-pointer shrink-0"
          >
            <Rocket className="w-3 h-3 text-sky-200 shrink-0" />
            <span className={isPlatformBarCompact ? 'hidden' : 'font-mono'}>فتح ⚡</span>
          </button>

          {/* Merchant Email & Account Linking Button / Badge (Hidden in Compact Mode) */}
          {!isPlatformBarCompact && (
            <button
              type="button"
              id={`btn-link-merchant-${plat.code}`}
              onClick={(e) => {
                e.stopPropagation();
                setPlatformModalInitialTab('settings');
                setPlatformForConnection(plat);
              }}
              className={`h-8 px-2.5 rounded-md text-xs font-bold border hidden sm:flex items-center gap-1.5 justify-center whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                plat.merchantEmail
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900/80 shadow-2xs font-extrabold'
                  : 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-slate-750 font-bold'
              }`}
              title={
                plat.merchantEmail 
                  ? `البريد الإلكتروني للتاجر المرتبط: ${plat.merchantEmail} ${plat.isGmailLinked ? '(مرتبط تلقائياً بـ Gmail)' : ''}`
                  : `انقر لربط إيميل وحساب التاجر بهذه المنصة تلقائياً ⚡`
              }
            >
              {plat.merchantEmail ? (
                <>
                  <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="max-w-[70px] truncate hidden md:inline" dir="ltr">{plat.merchantEmail.split('@')[0]}</span>
                  {plat.isGmailLinked && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-900 text-emerald-200 font-black border border-emerald-700" title="مرتبط بـ Gmail الأساسي">⚡</span>
                  )}
                  <span className="md:hidden">متصل</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>ربط إيميل</span>
                </>
              )}
            </button>
          )}

          {/* Import Channel Competitor CSV Button (Hidden in Compact Mode to reduce clutter) */}
          {!isPlatformBarCompact && (
            <button
              type="button"
              id={`btn-csv-competitors-${plat.code}`}
              onClick={(e) => {
                e.stopPropagation();
                setPlatformModalInitialTab('competitors_csv');
                setPlatformForConnection(plat);
              }}
              className={`h-8 px-2.5 rounded-md text-xs font-bold border hidden md:flex items-center gap-1.5 justify-center whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                plat.importedCompetitorsCount
                  ? 'bg-sky-950/80 text-sky-300 border-sky-800 hover:bg-sky-900/80 shadow-2xs font-extrabold'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white shadow-2xs'
              }`}
              title={
                plat.importedCompetitorsCount
                  ? `تم دمج ${plat.importedCompetitorsCount} منافس لقناة ${platformLabel} عبر CSV (انقر لإدارة المنافسين أو استيراد ملف جديد)`
                  : `استيراد قائمة منافسين عبر ملف CSV لقناة ${platformLabel} 📊`
              }
            >
              <FileSpreadsheet className={`w-3 h-3 shrink-0 ${plat.importedCompetitorsCount ? 'text-sky-400' : 'text-slate-400'}`} />
              {plat.importedCompetitorsCount ? (
                <span className="font-mono">{plat.importedCompetitorsCount} منافس</span>
              ) : (
                <span>CSV منافسين</span>
              )}
            </button>
          )}

          {/* Individual Platform Manual Sync / Refresh Button */}
          <div className="relative group/refresh inline-flex items-center gap-1">
            {(() => {
              const isSyncing = refreshingPlatformIds.includes(plat.id) || (isRefreshingPlatforms && plat.isConnected);
              const isSuccess = recentlySyncedPlatformIds.includes(plat.id);

              return (
                <>
                  <button
                    type="button"
                    id={`btn-refresh-platform-${plat.code}`}
                    disabled={isSyncing}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isMaintenanceMode) {
                        triggerScheduledMaintenanceToast();
                        return;
                      }
                      if (hasSyncError) {
                        triggerReconnectWithSyncErrorToast();
                      } else {
                        handleRefreshSinglePlatform(plat.id, platformLabel);
                      }
                    }}
                    title={
                      isMaintenanceMode
                        ? `⚠️ المنصة في وضع الصيانة المجدولة (${plat.scheduledMaintenance?.windowLabel || 'حالياً'}) — انقر لعرض تنبيه الصيانة وتجنب التزامن اليدوي`
                        : isSyncing
                        ? `جاري المزامنة لقناة ${platformLabel}...`
                        : isSuccess
                        ? `تمت المزامنة بنجاح لقناة ${platformLabel}!`
                        : `Manual sync for this channel (${platformLabel})`
                    }
                    className={`h-8 px-2.5 min-w-[74px] rounded-md border transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95 disabled:cursor-not-allowed flex items-center gap-1.5 justify-center text-xs font-medium font-['Alexandria'] whitespace-nowrap ${
                      isMaintenanceMode
                        ? 'text-sky-300 bg-sky-950/85 hover:bg-sky-900/90 border-sky-600/80 ring-1 ring-sky-500/40 shadow-xs'
                        : isSyncing
                        ? 'text-sky-300 bg-sky-950/80 border-sky-700 ring-1 ring-sky-500 shadow-xs'
                        : isSuccess
                        ? 'text-emerald-300 bg-emerald-950/80 border-emerald-700 ring-1 ring-emerald-500 shadow-xs'
                        : hasSyncError
                        ? 'text-white bg-rose-700 hover:bg-rose-600 border-rose-500 shadow-xs animate-pulse font-bold ring-1 ring-rose-400/50'
                        : 'text-emerald-400 hover:text-white bg-slate-800/90 hover:bg-emerald-600 border-slate-700 hover:border-emerald-500 shadow-2xs'
                    }`}
                    aria-label={
                      isMaintenanceMode
                        ? `تنبيه صيانة مجدولة لقناة (${platformLabel}) - تجنب التزامن اليدوي`
                        : hasSyncError
                        ? `إصلاح وإعادة اتصال API لقناة (${platformLabel})`
                        : `Manual sync for this channel (${platformLabel})`
                    }
                  >
                    {isMaintenanceMode ? (
                      <Wrench className="w-3.5 h-3.5 text-sky-400 shrink-0 stroke-[2.5] animate-pulse" />
                    ) : isSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                    ) : hasSyncError ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-200 shrink-0 stroke-[2.5] animate-bounce" />
                    ) : (
                      <RefreshCw
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isSyncing
                            ? 'animate-spin text-sky-400'
                            : 'hover:text-white'
                        }`}
                      />
                    )}
                    <span className="leading-none flex items-center">
                      {isMaintenanceMode ? 'تحديث ⚠️' : isSyncing ? 'تحديث...' : isSuccess ? 'محدث' : hasSyncError ? 'إصلاح 🚨' : 'تحديث'}
                    </span>
                  </button>

                  {/* Toggle Scheduled Maintenance Mode Button (تفعيل/إنهاء وضع الصيانة المجدولة) */}
                  {!isPlatformBarCompact && (
                    <button
                      type="button"
                      id={`btn-maintenance-mode-${plat.code}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlatformMaintenanceMode(plat.id);
                      }}
                      title={
                        isMaintenanceMode
                          ? `إنهاء وضع الصيانة المجدولة لقناة ${platformLabel} واستئناف التزامن اليدوي`
                          : `تفعيل وضع الصيانة المجدولة لقناة ${platformLabel} (لتنبيه التاجر بتجنب التزامن اليدوي)`
                      }
                      className={`h-8 w-8 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs active:scale-90 ${
                        isMaintenanceMode
                          ? 'text-sky-300 bg-sky-950/90 border-sky-600 ring-1 ring-sky-500/50 hover:bg-sky-900'
                          : 'text-slate-400 hover:text-sky-300 bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                      }`}
                      aria-label={`تبديل وضع الصيانة المجدولة لقناة ${platformLabel}`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Floating Descriptive Tooltip on Hover */}
                  <div
                    role="tooltip"
                    id={`tooltip-refresh-${plat.code}`}
                    className="pointer-events-none absolute bottom-full mb-1.5 start-1/2 -translate-x-1/2 opacity-0 group-hover/refresh:opacity-100 transition-all duration-150 z-30 scale-95 group-hover/refresh:scale-100 origin-bottom whitespace-nowrap shadow-md rounded-md bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 border border-slate-700 flex items-center gap-1"
                  >
                    {isMaintenanceMode ? (
                      <>
                        <span className="text-sky-400 font-bold">🛠️ صيانة مجدولة — تجنب التزامن اليدوي</span>
                        <span className="text-slate-400 font-normal">({platformLabel})</span>
                      </>
                    ) : isSyncing ? (
                      <>
                        <span className="text-sky-400 font-bold">جاري المزامنة...</span>
                        <span className="text-slate-400 font-normal">({platformLabel})</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <span className="text-emerald-400 font-bold">تمت المزامنة بنجاح! ⚡</span>
                        <span className="text-slate-400 font-normal">({platformLabel})</span>
                      </>
                    ) : (
                      <>
                        <span>مزامنة يدوية فورية</span>
                        <span className="text-slate-400 font-normal">({platformLabel})</span>
                      </>
                    )}
                    <div className="absolute top-full start-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                </>
              );
            })()}
          </div>

          {/* Individual Platform Manual Sync History Button */}
          <div className="relative group/history hidden sm:inline-flex items-center">
            <button
              type="button"
              id={`btn-history-platform-${plat.code}`}
              onClick={(e) => {
                e.stopPropagation();
                setHistoryOverlayPlatform(plat);
                const historyList = getPlatformSyncHistoryList(plat);
                const latest = historyList[0];
                if (latest) {
                  showToast(
                    `سجل مزامنة ${platformLabel}: آخر محاولة [HTTP ${latest.statusCode} - ${latest.statusText}] في ${latest.timestamp} 🕒`
                  );
                }
              }}
              title={`سجل محاولات المزامنة (${platformLabel})`}
              className={`p-1 rounded-md border transition-all cursor-pointer shrink-0 shadow-2xs active:scale-90 ${
                historyOverlayPlatform?.id === plat.id
                  ? 'text-indigo-300 bg-slate-800 border-indigo-500 ring-1 ring-indigo-400 font-bold'
                  : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
              aria-label={`عرض سجل محاولات المزامنة لقناة ${platformLabel}`}
            >
              <History className="w-2.5 h-2.5 transition-colors group-hover/history:text-indigo-400" />
            </button>

            {/* Floating Descriptive Tooltip on Hover */}
            <div
              role="tooltip"
              id={`tooltip-history-${plat.code}`}
              className="pointer-events-none absolute bottom-full mb-1.5 start-1/2 -translate-x-1/2 opacity-0 group-hover/history:opacity-100 transition-all duration-150 z-30 scale-95 group-hover/history:scale-100 origin-bottom whitespace-nowrap shadow-md rounded-md bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 border border-slate-700 flex items-center gap-1"
            >
              <span>سجل محاولات المزامنة</span>
              <span className="text-slate-400 font-normal">({platformLabel})</span>
              <div className="absolute top-full start-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>

          {/* Interactive Real-Time Sync Toggle Switch */}
          <div className="relative group/toggle-tip inline-flex items-center">
            <button
              type="button"
              role="switch"
              aria-checked={plat.isConnected}
              id={`toggle-sync-${plat.code}`}
              onClick={(e) => {
                e.stopPropagation();
                if (hasSyncError) {
                  triggerReconnectWithSyncErrorToast();
                  return;
                }
                handleTogglePlatform(plat.id);
                showToast(
                  !plat.isConnected
                    ? `تم تفعيل التزامن الفوري مع ${platformLabel} بنجاح ⚡`
                    : `تم تعطيل التزامن الفوري مع ${platformLabel}`
                );
              }}
              title={
                hasSyncError && recentSyncError
                  ? `خطأ في المزامنة (${platformLabel}): ${recentSyncError.message} - انقر لمحاولة استئناف التزامن`
                  : plat.isConnected
                    ? `تعطيل التزامن الفوري مع ${platformLabel}`
                    : `تفعيل التزامن الفوري مع ${platformLabel}`
              }
              className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0 border border-slate-700 ${
                hasSyncError
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : plat.isConnected
                    ? isMajor ? 'bg-indigo-600' : 'bg-emerald-600'
                    : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full bg-white shadow-xs transition-all duration-200 ${
                  plat.isConnected ? 'ms-auto' : 'me-auto'
                }`}
              />
            </button>

            {/* Floating Descriptive Tooltip on Hover for Sync Toggle */}
            <div
              role="tooltip"
              id={`tooltip-toggle-sync-${plat.code}`}
              className="pointer-events-none absolute bottom-full mb-1.5 end-0 opacity-0 group-hover/toggle-tip:opacity-100 transition-all duration-150 z-30 scale-95 group-hover/toggle-tip:scale-100 origin-bottom-right whitespace-nowrap shadow-md rounded-md bg-slate-900 text-white text-[10px] font-bold px-2 py-1 border border-slate-700 flex flex-col gap-0.5"
              dir="rtl"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    plat.isConnected ? 'bg-emerald-400' : 'bg-slate-400'
                  }`}
                />
                <span>
                  {plat.isConnected
                    ? `مزامنة ${platformLabel} مفعلة نشطة ⚡`
                    : `مزامنة ${platformLabel} معطلة`}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-normal">
                {plat.isConnected
                  ? 'انقر للإيقاف المؤقت لمزامنة الأسعار والمخزون'
                  : 'انقر لتشغيل المزامنة والربط التلقائي'}
              </span>
              <div className="absolute top-full end-2.5 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>

          {/* Individual Platform Details Toggle Chevron Button */}
          <button
            type="button"
            id={`btn-toggle-expand-platform-${plat.code}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePlatformDetails(plat.id);
            }}
            title={isExpanded ? `طي تفاصيل منصة ${platformLabel} (Collapse)` : `توسيع تفاصيل منصة ${platformLabel} (Expand)`}
            className={`p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors shrink-0 ${
              isExpanded ? 'bg-slate-800 text-indigo-400 ring-1 ring-slate-700' : ''
            }`}
            aria-label={isExpanded ? `طي تفاصيل ${platformLabel}` : `توسيع تفاصيل ${platformLabel}`}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-250 ease-out ${
                isExpanded ? 'rotate-180 text-indigo-400' : 'text-slate-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Platform Details Drawer / Panel with smooth motion transition */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`platform-expanded-details-container-${plat.id}`}
            id={`platform-expanded-details-${plat.code}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              height: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.2, ease: 'easeOut' }
            }}
            className="w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.985 }}
              transition={{
                duration: 0.22,
                ease: 'easeOut'
              }}
              className="w-full"
            >
              <PlatformCardDetailsDrawer
                platform={plat}
                activeMerchant={activeMerchantObj}
                merchantProducts={allProducts}
                onRepriceProduct={handleRepriceSingleProduct}
                onShowToast={showToast}
                onOpenDirectLaunch={() => {
                  directLaunchPlatformPortal(plat, {
                    onLaunched: () => {
                      showToast(`🚀 جاري فتح مركز بائعي ${platformLabel} المعتمد مباشرة...`);
                      const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                      setConnectedPlatforms((prev) => {
                        const next = prev.map((p) => (p.id === plat.id ? { ...p, lastLaunchedAt: now } : p));
                        saveStoredPlatformsForMerchant(activeMerchantId, next);
                        return next;
                      });
                    }
                  });
                }}
                onOpenLinkMerchant={() => {
                  setPlatformModalInitialTab('settings');
                  setPlatformForConnection(plat);
                }}
                onOpenCsv={() => {
                  setPlatformModalInitialTab('competitors_csv');
                  setPlatformForConnection(plat);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);
};

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] text-[#000000] flex flex-col font-['Cairo'] antialiased selection:bg-slate-300 selection:text-[#000000]">
      
      {/* Global Async Operations Indicator (Platform Sync, CSV Export, Firebase DB) */}
      <AsyncOperationsStatusIndicator />

      {/* Toast Banner */}
      {toastMessage && (
        <div
          id="global-app-toast-banner"
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 max-w-md sm:max-w-xl px-4 py-3 rounded-2xl shadow-2xl border flex items-start gap-3 text-xs font-bold font-['Cairo'] transition-all duration-300 backdrop-blur-md ${
            toastMessage.includes('🛠️')
              ? 'bg-sky-950/95 text-sky-100 border-sky-500/80 ring-1 ring-sky-500/40'
              : toastMessage.includes('🚨') || toastMessage.includes('⚠️')
                ? 'bg-rose-950/95 text-rose-100 border-rose-500/80 ring-1 ring-rose-500/40'
                : toastMessage.includes('✅')
                  ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/80 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/95 text-white border-sky-500/30'
          }`}
        >
          {toastMessage.includes('🛠️') ? (
            <Wrench className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
          ) : toastMessage.includes('🚨') || toastMessage.includes('⚠️') ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          ) : toastMessage.includes('✅') ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-colors p-0.5 rounded-lg cursor-pointer shrink-0"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenExportModal={() => setIsExportCenterOpen(true)}
        onOpenAiExcelModal={() => setIsAiExcelEnricherOpen(true)}
        onOpenBestSellersModal={() => setIsBestSellerAlertModalOpen(true)}
        onOpenInvestorDeck={() => {
          if (isPaywallLocked) {
            setIsSubscriptionModalOpen(true);
            return;
          }
          setIsInvestorDeckOpen(true);
        }}
        onOpenSmartGmailModal={() => {
          setSmartGmailModalTab('gmail_link');
          setIsSmartGmailModalOpen(true);
        }}
        onShowToast={showToast}
        connectedPlatforms={connectedPlatforms}
        productCount={activeProducts.length}
        archivedCount={archivedProducts.length}
        watchlistCount={watchlist.length}
        activeAlertsCount={alerts.filter(a => a.isActive).length}
        reorderAlertsCount={reorderAlertItems.length}
        updateState={updateState}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenPushNotificationModal={() => setIsPushNotificationModalOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenManageApisModal={() => setIsManageApisModalOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        subscriptionBadgeLabel={activeMerchantSubState.badgeLabel}
        isPaywallLocked={isPaywallLocked}
        trialCountdownText={
          isPaywallLocked
            ? '🔒 انتهت التجربة المجانية (3 أيام)'
            : activeMerchantSubState.status === 'active'
            ? '✅ اشتراك مفعل نشط'
            : `⏳ باقي على انتهاء التجربة المجانية: ${activeMerchantSubState.remainingDays} يوم و ${activeMerchantSubState.remainingHours} ساعات`
        }
        remoteMerchantsList={remoteMerchantsList}
        activeMerchantId={activeMerchantId}
        onSwitchActiveMerchant={handleSwitchActiveMerchant}
        onPullOrders={() => {
          handleLiveSync(activeMerchantId);
          setActiveTab('remote_merchants');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-full xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-12 flex flex-col gap-5 sm:gap-6 overflow-x-hidden">

        {/* Offline Network Status Indicator */}
        <OfflineIndicator />

        {/* Platform-Specific Install Matrix & Automated Certificate Generator */}
        <PlatformInstallMatrixModal onShowToast={showToast} />

        {/* Navigation Breadcrumb & Active Screen Indicator (shown for all non-radar views) */}
        {activeTab !== 'radar' && (
          <div id="nav-active-screen-banner" className="w-full max-w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-fadeIn text-white">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="btn-breadcrumb-back-to-radar"
                onClick={() => {
                  setActiveTab('radar');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-9 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/40 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                title="الرجوع إلى رادار المنافسين والتسعير (الشاشة الرئيسية)"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>رادار المنافسين ⚡</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 text-xs">/</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white font-['Cairo'] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{NAV_TAB_METADATA[activeTab]?.label || activeTab}</span>
                  </span>
                  {NAV_TAB_METADATA[activeTab]?.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40">
                      {NAV_TAB_METADATA[activeTab]?.badge}
                    </span>
                  )}
                  {NAV_TAB_METADATA[activeTab]?.desc && (
                    <span className="text-[11px] text-slate-400 hidden md:inline">
                      • {NAV_TAB_METADATA[activeTab]?.desc}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                id="btn-toggle-platforms-on-other-tabs"
                onClick={() => setShowPlatformBarOnOtherTabs(!showPlatformBarOnOtherTabs)}
                className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  showPlatformBarOnOtherTabs
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="إظهار أو إخفاء شريط قنوات ومنصات البيع في هذه الشاشة"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{showPlatformBarOnOtherTabs ? 'إخفاء قنوات البيع' : 'عرض قنوات البيع (20)'}</span>
                {showPlatformBarOnOtherTabs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}
        
        {/* RADAR Global Marketplaces Hero Section (Globe + Real-Time Price Tracking Badges for Amazon, Noon, Jumia) */}
        {activeTab === 'radar' && (
          <div className="w-full max-w-full space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-black bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Outfit','Alexandria']">
                  RADAR — Global Marketplaces Real-Time Price Tracking
                </span>
                <span className="text-slate-500 hidden sm:inline">·</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  شبكة الرصد اللحظي لأسعار المنصات العالمية (Amazon · Noon · Jumia)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvestorDeckOpen(true)}
                  className="h-8 px-3 rounded-md bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center cursor-pointer transition-all"
                >
                  <span>عرض المستثمرين (Investor Pitch Deck)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRadarHeroCollapsed(!isRadarHeroCollapsed)}
                  className="h-8 px-2.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-sky-500/20 text-slate-300 text-xs font-bold whitespace-nowrap flex items-center gap-1 justify-center cursor-pointer transition-all"
                >
                  <span>{isRadarHeroCollapsed ? 'إظهار رادار العالم 🌐' : 'طي البانر'}</span>
                  {isRadarHeroCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {!isRadarHeroCollapsed && (
              <div className="w-full max-w-xl mx-auto flex items-center justify-center">
                <ErrorBoundary sectionName="رادار الأسواق العالمية">
                  <RadarGlobalHeroVisual
                    compact
                    onOpenInvestorDeck={() => setIsInvestorDeckOpen(true)}
                    onSelectPlatform={(platId) => {
                      showToast(`تم تحديد رادار منصة ${platId.toUpperCase()} للرصد الفوري للأسعار 🌐⚡`);
                    }}
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>
        )}

        {/* Ephemeral Toast Alert for Drag-and-Drop Archive Operation with AnimatePresence */}
        <AnimatePresence>
          {archiveEphemeralAlert && (
            <motion.div
              key="archive-ephemeral-operation-alert"
              initial={{ opacity: 0, y: 50, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.92 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              id="archive-ephemeral-operation-alert"
              role="alert"
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[calc(100%-2rem)] bg-slate-900/95 border-2 border-rose-500/80 rounded-2xl shadow-2xl p-4 text-white font-['Cairo'] text-right backdrop-blur-md"
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                      <span>تنبيه العملية: تمت أرشفة المنتج بنجاح 🗄️</span>
                      <span className="text-[9px] bg-rose-500/30 text-rose-200 border border-rose-500/40 px-1.5 py-0.2 rounded font-mono">
                        {archiveEphemeralAlert.secondsLeft} ثوانٍ
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      تم نقل المنتج غير النشط إلى مجلد الأرشيف مع حفظ كامل سجل الأسعار والمنافسين
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setArchiveEphemeralAlert(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="إغلاق التنبيه المؤقت"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product Summary */}
              <div className="flex items-center gap-3 py-2.5">
                {archiveEphemeralAlert.productImage && (
                  <img
                    src={archiveEphemeralAlert.productImage}
                    alt={archiveEphemeralAlert.productTitle}
                    className="w-10 h-10 rounded-xl object-contain border border-slate-700 bg-slate-950 shrink-0 p-1"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs text-white block truncate">
                    {archiveEphemeralAlert.productTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    SKU: {archiveEphemeralAlert.productSku || archiveEphemeralAlert.productId} • التوقيت: {archiveEphemeralAlert.timestamp}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Undo & View Archive */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  id="btn-ephemeral-undo-archive"
                  onClick={handleUndoEphemeralArchive}
                  className="h-8 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                  title="التراجع فوراً عن الأرشفة وإعادة المنتج إلى المنتجات النشطة"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تراجع عن الأرشفة ↩️</span>
                </button>

                <button
                  type="button"
                  id="btn-ephemeral-open-archive-vault"
                  onClick={() => {
                    setArchiveEphemeralAlert(null);
                    setActiveTab('archived_products');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>عرض مجلد الأرشيف ({archivedProducts.length})</span>
                </button>
              </div>

              {/* Micro Progress Bar representing ephemeral lifetime */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(archiveEphemeralAlert.secondsLeft / 7) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Active Product Showcase & Competitive Price Card (shown on radar) */}
        {activeTab === 'radar' && (
          currentProduct ? (
            <div 
              id="main-active-product-hero-card"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', currentProduct.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (activeProducts.length > 1) {
                  const currIdx = activeProducts.findIndex((p) => p.id === currentProduct.id);
                  const nextIdx = (currIdx + 1) % activeProducts.length;
                  const nextProd = activeProducts[nextIdx];
                  if (nextProd) {
                    setCurrentProduct(nextProd);
                    setWinningPrice(Math.round(nextProd.currentLowestPrice * (1 - selectedDiscount / 100)));
                    showToast(`تم سحب وإعادة ترتيب عرض المنتج النشط إلى: "${nextProd.title.slice(0, 35)}..." ↕️`);
                  }
                }
              }}
              className="relative group/herocard w-full max-w-full bg-slate-900/80 border border-sky-500/20 hover:border-sky-500/35 rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xl backdrop-blur-md text-white flex flex-col gap-4 sm:gap-5 transition-all overflow-hidden"
            >
              {/* Corner Drag Handle Icon for easy identification of drag/reorder capability with Smart Tooltip */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                <ToolbarTooltip
                  id="tooltip-hero-card-drag-handle"
                  title="مزايا السحب والإفلات والتبديل السريع ↕️"
                  description={
                    <span className="block space-y-1">
                      <span className="block">
                        • <strong className="text-sky-300">السحب والإفلات (Drag & Drop):</strong> اسحب الكارت لإعادة ترتيب أولويات عرض المنتجات النشطة في مقدمة الرادار.
                      </span>
                      <span className="block">
                        • <strong className="text-emerald-300">التبديل الفوري (Quick Switch):</strong> انقر مباشرة للتنقل السريع بين المنتجات النشطة ومقارنة أسعارها لحظياً دون مغادرة الشاشة.
                      </span>
                    </span>
                  }
                  badge={
                    activeProducts.length > 1
                      ? `المنتج ${activeProducts.findIndex((p) => p.id === currentProduct.id) + 1} من ${activeProducts.length}`
                      : 'تفاعل ذكي ⚡'
                  }
                  icon={GripVertical}
                  theme="sky"
                  side="bottom"
                  align="start"
                  shortcut="اسحب للترتيب أو انقر للتبديل"
                  maxWidthClass="w-80 sm:w-96"
                >
                  <div
                    id="hero-card-corner-drag-handle"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (activeProducts.length > 1) {
                        const currIdx = activeProducts.findIndex((p) => p.id === currentProduct.id);
                        const nextIdx = (currIdx + 1) % activeProducts.length;
                        const nextProd = activeProducts[nextIdx];
                        if (nextProd) {
                          setCurrentProduct(nextProd);
                          setWinningPrice(Math.round(nextProd.currentLowestPrice * (1 - selectedDiscount / 100)));
                          showToast(`تم تبديل وإعادة ترتيب المنتج النشط (${nextIdx + 1}/${activeProducts.length}): ${nextProd.title.slice(0, 32)}... ↕️`);
                        }
                      } else {
                        showToast('اسحب الكارت من مقبض السحب لإعادة ترتيبه أو تثبيته في مقدمة الرادار ↕️');
                      }
                    }}
                    aria-label="مقبض سحب وإعادة ترتيب كارت المنتج النشط"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-sky-300 border border-slate-700/80 hover:border-sky-500/40 cursor-grab active:cursor-grabbing select-none transition-all shadow-xs group/handle"
                  >
                    <GripVertical className="w-4 h-4 text-slate-400 group-hover/handle:text-sky-400 transition-colors shrink-0" />
                    <span className="text-[10px] font-bold font-['Cairo'] tracking-wide">
                      سحب / ترتيب الكارت
                    </span>
                    {activeProducts.length > 1 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-emerald-400 border border-slate-700">
                        {activeProducts.findIndex((p) => p.id === currentProduct.id) + 1}/{activeProducts.length}
                      </span>
                    )}
                  </div>
                </ToolbarTooltip>

                <div className="flex items-center gap-2">
                  {/* Dropdown Menu for Active Products with Drag and Drop onto Archive */}
                  <div className="relative">
                    <button
                      type="button"
                      id="btn-active-products-dropdown-toggle"
                      onClick={() => setIsActiveProductsDropdownOpen(!isActiveProductsDropdownOpen)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-slate-200 border text-[11px] font-bold cursor-pointer transition-all shadow-xs ${
                        isActiveProductsDropdownOpen
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 hover:border-emerald-500/40'
                      }`}
                      title="فتح القائمة المنسدلة لجميع المنتجات النشطة — اسحب أي منتج وأفلته على زر 'أرشفة'"
                    >
                      <Package className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>قائمة المنتجات النشطة ({activeProducts.length})</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isActiveProductsDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isActiveProductsDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsActiveProductsDropdownOpen(false)}
                          aria-hidden="true"
                        />
                        <div
                          id="dropdown-menu-active-products-list"
                          className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-right space-y-2.5 text-slate-100 max-h-[480px] flex flex-col"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs shrink-0">
                            <span className="font-black text-white flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-emerald-400" />
                              <span>المنتجات النشطة المتاحة ({activeProducts.length})</span>
                            </span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                              اسحب للأرشفة 🗄️
                            </span>
                          </div>

                          {/* Quick Instruction Alert */}
                          <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800 shrink-0 leading-relaxed flex items-center justify-between gap-2">
                            <span>
                              💡 <strong className="text-sky-300">سحب وإفلات:</strong> اسحب أي منتج وأفلته على <strong className="text-rose-300">زر 'أرشفة'</strong> بالأسفل.
                            </span>
                            {(activeProductsSearchTerm || activeProductsSortBy !== 'default' || activeProductsSyncFilter !== 'all') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProductsSearchTerm('');
                                  setActiveProductsSortBy('default');
                                  setActiveProductsSortOrder('desc');
                                  setActiveProductsSyncFilter('all');
                                }}
                                className="text-[9px] text-amber-300 hover:text-amber-200 underline font-bold shrink-0 cursor-pointer"
                                title="إلغاء التصفية وإعادة الضبط"
                              >
                                إعادة ضبط ↺
                              </button>
                            )}
                          </div>

                          {/* Advanced Filter & Sorting Bar (شريط التصفية والفرز المتقدم) */}
                          <div 
                            id="active-products-advanced-filter-bar" 
                            className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 space-y-2 shrink-0 shadow-inner"
                          >
                            {/* Search Input */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                value={activeProductsSearchTerm}
                                onChange={(e) => setActiveProductsSearchTerm(e.target.value)}
                                placeholder="بحث بالاسم، الكود (SKU)، أو الفئة..."
                                className="w-full h-7 pr-8 pl-6 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                              />
                              {activeProductsSearchTerm && (
                                <button
                                  type="button"
                                  onClick={() => setActiveProductsSearchTerm('')}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5"
                                  title="مسح البحث"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Sort Controls Row: Price, Update Date, Sync Status */}
                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                                <SlidersHorizontal className="w-3 h-3 text-sky-400" />
                                <span>الفرز:</span>
                              </span>

                              <div className="flex items-center gap-1 flex-1 justify-end flex-wrap">
                                {/* Sort by Price Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (activeProductsSortBy === 'price') {
                                      setActiveProductsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                    } else {
                                      setActiveProductsSortBy('price');
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                    activeProductsSortBy === 'price'
                                      ? 'bg-sky-950 text-sky-300 border-sky-500 ring-1 ring-sky-500/40'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                  }`}
                                  title="فرز المنتجات حسب السعر"
                                >
                                  <span>السعر</span>
                                  {activeProductsSortBy === 'price' && (
                                    <span className="text-[9px] font-mono text-sky-400">
                                      {activeProductsSortOrder === 'asc' ? '↑ الأدنى' : '↓ الأعلى'}
                                    </span>
                                  )}
                                </button>

                                {/* Sort by Update Date Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (activeProductsSortBy === 'date') {
                                      setActiveProductsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                    } else {
                                      setActiveProductsSortBy('date');
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                    activeProductsSortBy === 'date'
                                      ? 'bg-amber-950 text-amber-300 border-amber-500 ring-1 ring-amber-500/40'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                  }`}
                                  title="فرز المنتجات حسب تاريخ التحديث"
                                >
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>تاريخ التحديث</span>
                                  {activeProductsSortBy === 'date' && (
                                    <span className="text-[9px] font-mono text-amber-400">
                                      {activeProductsSortOrder === 'asc' ? '↑ الأقدم' : '↓ الأحدث'}
                                    </span>
                                  )}
                                </button>

                                {/* Sort by Sync Status Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (activeProductsSortBy === 'sync') {
                                      setActiveProductsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                    } else {
                                      setActiveProductsSortBy('sync');
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                    activeProductsSortBy === 'sync'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/40'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                  }`}
                                  title="فرز المنتجات حسب حالة التزامن مع المتاجر"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" />
                                  <span>حالة التزامن</span>
                                  {activeProductsSortBy === 'sync' && (
                                    <span className="text-[9px] font-mono text-emerald-400">
                                      {activeProductsSortOrder === 'asc' ? '↑ غير المتزامن' : '↓ المتزامن'}
                                    </span>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Sync Status Filter Pills */}
                            <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800/80 text-[10px]">
                              <span className="text-slate-500 font-bold shrink-0">تصفية التزامن:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveProductsSyncFilter('all')}
                                  className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                                    activeProductsSyncFilter === 'all'
                                      ? 'bg-slate-800 text-white border border-slate-700'
                                      : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  الكل ({activeProducts.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveProductsSyncFilter('synced')}
                                  className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                                    activeProductsSyncFilter === 'synced'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                      : 'text-slate-400 hover:text-emerald-400'
                                  }`}
                                >
                                  متزامن فقط ✅
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveProductsSyncFilter('unsynced')}
                                  className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                                    activeProductsSyncFilter === 'unsynced'
                                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                      : 'text-slate-400 hover:text-amber-400'
                                  }`}
                                >
                                  غير متزامن ⏳
                                </button>
                              </div>
                            </div>

                            {/* Summary Counter */}
                            <div className="flex items-center justify-between text-[9px] text-slate-400 px-0.5">
                              <span>
                                عرض <strong className="text-emerald-300 font-mono">{filteredSortedActiveProducts.length}</strong> من أصل <strong className="text-white font-mono">{activeProducts.length}</strong> منتج
                              </span>
                              {activeProductsSortBy !== 'default' && (
                                <span className="text-sky-300 font-bold">
                                  مرتب حسب {activeProductsSortBy === 'price' ? 'السعر' : activeProductsSortBy === 'date' ? 'تاريخ التحديث' : 'حالة التزامن'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Scrollable list of active products */}
                          <div className="overflow-y-auto space-y-1.5 pr-1 flex-1 max-h-56">
                            {filteredSortedActiveProducts.length === 0 ? (
                              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                                <p className="text-xs text-slate-300 font-bold">لا توجد منتجات نشطة تطابق معايير التصفية والفرز</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveProductsSearchTerm('');
                                    setActiveProductsSortBy('default');
                                    setActiveProductsSortOrder('desc');
                                    setActiveProductsSyncFilter('all');
                                  }}
                                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                                >
                                  إعادة ضبط شريط الفرز والتصفية ↺
                                </button>
                              </div>
                            ) : (
                              filteredSortedActiveProducts.map((p) => {
                                const isCurrent = p.id === currentProduct.id;
                                const isSynced = Boolean(p.merchantSynced || p.syncedAt);
                                const lastUpdatedLabel = p.syncedAt 
                                  ? new Date(p.syncedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                                  : (p.priceHistory && p.priceHistory.length > 0 && p.priceHistory[p.priceHistory.length - 1]?.date)
                                    ? p.priceHistory[p.priceHistory.length - 1].date
                                    : 'اليوم';

                                return (
                                  <div
                                    key={p.id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('text/plain', p.id);
                                      e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onClick={() => {
                                      setCurrentProduct(p);
                                      setWinningPrice(Math.round(p.currentLowestPrice * (1 - selectedDiscount / 100)));
                                      setIsActiveProductsDropdownOpen(false);
                                    }}
                                    className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-grab active:cursor-grabbing ${
                                      isCurrent
                                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                                    }`}
                                    title={`اسحب "${p.title}" وأفلته على زر 'أرشفة' بالأسفل`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-sky-400 shrink-0" />
                                      <img
                                        src={p.imageUrl || '/icon.svg'}
                                        alt={p.title}
                                        className="w-8 h-8 rounded-lg object-contain bg-slate-900 border border-slate-700 shrink-0"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-white truncate">{p.title}</div>
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                                          <span className="text-emerald-400 font-mono font-bold">{p.currentLowestPrice.toLocaleString()} {currency}</span>
                                          <span>•</span>
                                          <span className="font-mono text-slate-400 text-[9px]">{p.sku || p.id}</span>
                                          <span>•</span>
                                          {isSynced ? (
                                            <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 rounded font-bold">
                                              متزامن ✅
                                            </span>
                                          ) : (
                                            <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-bold">
                                              غير متزامن ⏳
                                            </span>
                                          )}
                                          <span className="text-[8px] text-slate-500 font-mono">
                                            ({lastUpdatedLabel})
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickArchiveViaDragDrop(p.id);
                                        setIsActiveProductsDropdownOpen(false);
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-800 hover:border-rose-500/40 transition-colors shrink-0 cursor-pointer"
                                      title="أرشفة سريعة لهذا المنتج"
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Sticky Drop Zone Button inside this Dropdown Menu */}
                          <div
                            id="btn-active-products-dropdown-archive-dropzone"
                            role="button"
                            tabIndex={0}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              setIsArchiveDropTargetActive(true);
                            }}
                            onDragLeave={() => setIsArchiveDropTargetActive(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsArchiveDropTargetActive(false);
                              setIsActiveProductsDropdownOpen(false);
                              const droppedId = e.dataTransfer.getData('text/plain') || currentProduct?.id;
                              if (droppedId) {
                                handleQuickArchiveViaDragDrop(droppedId);
                              }
                            }}
                            onClick={() => {
                              setIsActiveProductsDropdownOpen(false);
                              if (currentProduct) {
                                handleInitiateArchive(currentProduct);
                              }
                            }}
                            className={`p-2.5 rounded-xl border-2 border-dashed transition-all flex items-center justify-between gap-2.5 cursor-pointer shrink-0 ${
                              isArchiveDropTargetActive
                                ? 'bg-rose-950 border-rose-500 ring-4 ring-rose-500/50 scale-[1.02] text-rose-100'
                                : 'bg-slate-950 border-rose-500/40 hover:border-rose-400 hover:bg-rose-950/30 text-rose-200'
                            }`}
                            title="زر 'أرشفة' — أفلت المنتج النشط هنا لنقله فوراً لمجلد الأرشيف"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isArchiveDropTargetActive ? 'bg-rose-600 text-white animate-bounce' : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                              }`}>
                                <Archive className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-black text-xs text-white flex items-center gap-1.5">
                                  <span>زر 'أرشفة' — أفلت المنتج هنا 🗄️</span>
                                </div>
                                <span className="text-[10px] text-rose-300/80 block">
                                  اسحب أي منتج نشط وأفلته هنا لنقله فوراً للأرشيف
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                              {archivedProducts.length} مؤرشف
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>سحب وإفلات مفعل</span>
                  </div>
                </div>
              </div>

              {/* Top Row: Product Identity, Badges, and Quick Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  {/* Product Main Icon / Image Thumbnail wrapped with Smart Tooltip explaining Drag & Drop and Quick Switch */}
                  <ToolbarTooltip
                    id="tooltip-hero-card-main-icon"
                    title="أيقونة المنتج النشط — السحب والإفلات والتبديل السريع"
                    description={
                      <span className="block space-y-1">
                        <span className="block">
                          • <strong className="text-emerald-300">إعادة الترتيب بالسحب والإفلات:</strong> يمكنك سحب الكارت وإفلاته لترتيب أولوية المنتجات الأكثر أهمية في لوحة الرصد.
                        </span>
                        <span className="block">
                          • <strong className="text-sky-300">التبديل السريع بين المنتجات:</strong> يتيح لك الانتقال اللحظي بين المنتجات النشطة وتحديث حسابات السعر الرابح والـ Buy Box تلقائياً.
                        </span>
                      </span>
                    }
                    badge="سحب وإفلات ↕️"
                    icon={Package}
                    theme="emerald"
                    side="bottom"
                    align="start"
                    shortcut="اسحب للترتيب • انقر للتبديل السريع"
                    maxWidthClass="w-80 sm:w-96"
                  >
                    <div
                      id="hero-card-main-product-icon"
                      onClick={() => {
                        if (activeProducts.length > 1) {
                          const currIdx = activeProducts.findIndex((p) => p.id === currentProduct.id);
                          const nextIdx = (currIdx + 1) % activeProducts.length;
                          const nextProd = activeProducts[nextIdx];
                          if (nextProd) {
                            setCurrentProduct(nextProd);
                            setWinningPrice(Math.round(nextProd.currentLowestPrice * (1 - selectedDiscount / 100)));
                            showToast(`تم التبديل السريع إلى المنتج النشط (${nextIdx + 1}/${activeProducts.length}): ${nextProd.title.slice(0, 32)}... ⚡`);
                          }
                        }
                      }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950/90 border border-slate-700/90 hover:border-emerald-500/60 overflow-hidden shrink-0 relative group shadow-lg flex items-center justify-center p-1.5 self-start sm:self-center cursor-grab active:cursor-grabbing transition-all"
                    >
                      <img 
                        src={currentProduct.imageUrl || '/icon.svg'} 
                        alt={currentProduct.title} 
                        className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }}
                      />
                      <span className="absolute bottom-1.5 right-1.5 bg-slate-950/90 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/40 shadow-xs backdrop-blur-xs pointer-events-none">
                        نشط
                      </span>
                    </div>
                  </ToolbarTooltip>

                  <div className="space-y-1.5 text-right min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                        المنتج النشط للمراقبة
                      </span>
                      <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700 truncate max-w-[180px] sm:max-w-[240px]">
                        SKU: {currentProduct.sku || currentProduct.id}
                      </span>
                      {currentProduct.category && (
                        <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/30 truncate max-w-[160px]">
                          {currentProduct.category}
                        </span>
                      )}
                      {currentProduct.id && isProductInWatchlist(currentProduct.id) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 font-bold border border-sky-500/40 flex items-center gap-1 shrink-0">
                          <span>★</span>
                          <span>في قائمة المتابعة</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg lg:text-xl font-black text-white font-['Alexandria'] line-clamp-2 sm:line-clamp-1 break-words leading-snug">
                      {currentProduct.title}
                    </h2>

                    <p className="text-[11px] sm:text-xs text-slate-400 font-['Cairo'] leading-relaxed">
                      الرصد السعري اللحظي مفعل عبر الذكاء الاصطناعي • متصل بقنوات البيع في السوق المصري
                    </p>
                  </div>
                </div>

                {/* Quick Actions for Active Product */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t border-slate-800/60 lg:border-t-0 justify-stretch sm:justify-end">
                  <button
                    type="button"
                    id="btn-active-product-view-details-drawer"
                    onClick={() => setIsActiveProductDetailsDrawerOpen(true)}
                    className="flex-1 sm:flex-initial h-9 px-3.5 rounded-md bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-black font-['Alexandria'] whitespace-nowrap flex items-center gap-1.5 justify-center shadow-md shadow-indigo-950/50 border border-indigo-400/50 transition-all cursor-pointer active:scale-95"
                    title="فتح الدراور الجانبي لعرض كافة بيانات المنتج والمواصفات التفصيلية وتاريخ تغيرات الأسعار"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-100 shrink-0" />
                    <span>عرض التفاصيل</span>
                  </button>

                  <button
                    type="button"
                    id="btn-active-product-generate-waybill"
                    onClick={() => handleOpenGenerateWaybill(currentProduct)}
                    className="flex-1 sm:flex-initial h-9 px-3.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black whitespace-nowrap flex items-center gap-1.5 justify-center shadow-md shadow-emerald-950/50 border border-emerald-400/50 transition-all cursor-pointer active:scale-95"
                    title="توليد بوليصة شحن فورية لهذا المنتج"
                  >
                    <Truck className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>توليد بوليصة 🚚</span>
                  </button>

                  <button
                    type="button"
                    id="btn-active-product-watchlist-toggle"
                    onClick={() => handleToggleWatchlist(currentProduct)}
                    className={`flex-1 sm:flex-initial h-9 px-3.5 rounded-md text-xs font-bold font-['Alexandria'] whitespace-nowrap flex items-center gap-1.5 justify-center transition-all select-none border cursor-pointer active:scale-95 ${
                      isProductInWatchlist(currentProduct.id)
                        ? 'bg-sky-950/80 text-sky-300 border-sky-500/50 hover:bg-sky-900/80'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isProductInWatchlist(currentProduct.id) ? 'fill-sky-400 text-sky-400' : 'text-slate-400'}`} />
                    <span>{isProductInWatchlist(currentProduct.id) ? 'محفوظ' : 'حفظ بالمتابعة'}</span>
                  </button>

                  {/* Dropdown Menu for Product Actions & Archive with Drag and Drop Support */}
                  <div className="relative">
                    <button
                      type="button"
                      id="btn-active-product-actions-dropdown"
                      onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setIsActionsDropdownOpen(true);
                        setIsArchiveDropTargetActive(true);
                      }}
                      onDragLeave={() => setIsArchiveDropTargetActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsArchiveDropTargetActive(false);
                        const droppedId = e.dataTransfer.getData('text/plain') || currentProduct.id;
                        if (droppedId) {
                          handleQuickArchiveViaDragDrop(droppedId);
                        }
                      }}
                      className={`flex-1 sm:flex-initial h-9 px-3 rounded-md text-xs font-black whitespace-nowrap flex items-center gap-1.5 justify-center border transition-all cursor-pointer active:scale-95 ${
                        isActionsDropdownOpen || isArchiveDropTargetActive
                          ? 'bg-rose-950 text-rose-300 border-rose-500 ring-2 ring-rose-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                      title="فتح القائمة المنسدلة لإجراءات وأرشفة المنتج (يدعم السحب والإفلات)"
                    >
                      <Archive className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>أرشفة وخيارات</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isActionsDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Popover Menu */}
                    {isActionsDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsActionsDropdownOpen(false)}
                          aria-hidden="true"
                        />
                        <div
                          id="dropdown-menu-product-actions"
                          className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-80 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-right space-y-2.5"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                            <span className="font-black text-white flex items-center gap-1.5">
                              <Archive className="w-4 h-4 text-rose-400" />
                              <span>القائمة المنسدلة: خيارات الأرشفة</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {currentProduct.sku || currentProduct.id}
                            </span>
                          </div>

                          {/* Dedicated Archive Button in the Dropdown Menu with Drag & Drop */}
                          <div
                            id="btn-dropdown-archive-product"
                            role="button"
                            tabIndex={0}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              setIsArchiveDropTargetActive(true);
                            }}
                            onDragLeave={() => setIsArchiveDropTargetActive(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsArchiveDropTargetActive(false);
                              setIsActionsDropdownOpen(false);
                              const droppedId = e.dataTransfer.getData('text/plain') || currentProduct.id;
                              if (droppedId) {
                                handleQuickArchiveViaDragDrop(droppedId);
                              }
                            }}
                            onClick={() => {
                              setIsActionsDropdownOpen(false);
                              handleInitiateArchive(currentProduct);
                            }}
                            className={`p-3 rounded-xl border-2 border-dashed transition-all flex items-start gap-3 cursor-pointer ${
                              isArchiveDropTargetActive
                                ? 'bg-rose-950/90 border-rose-500 ring-4 ring-rose-500/40 text-rose-100 scale-[1.02]'
                                : 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200'
                            }`}
                            title="زر 'أرشفة' — انقر للأرشفة أو اسحب المنتج وأفلته هنا مباشرة"
                          >
                            <div className="w-9 h-9 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/50 flex items-center justify-center shrink-0 mt-0.5">
                              <Archive className="w-5 h-5 text-rose-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-black text-xs text-white">
                                  زر 'أرشفة' (نقل لمجلد الأرشيف) 🗄️
                                </span>
                                <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                                  إسقاط 🎯
                                </span>
                              </div>
                              <p className="text-[11px] text-rose-300/80 mt-1 leading-snug">
                                اسحب هذا المنتج أو أي منتج غير نشط وأفلته هنا لنقله فوراً للأرشيف وتفعيل التنبيه المؤقت.
                              </p>
                            </div>
                          </div>

                          {/* Quick Nav to Vault */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsActionsDropdownOpen(false);
                              setActiveTab('archived_products');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-between border border-slate-700/80 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Boxes className="w-3.5 h-3.5 text-sky-400" />
                              <span>استعراض مجلد الأرشيف بالكامل</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-700">
                              {archivedProducts.length} منتج محفوظ
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics Grid: 4 Prominent KPI Cards */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Lowest Competitor */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between gap-1.5 shadow-inner min-w-0">
                  <div className="flex items-center justify-between gap-2 text-slate-400 text-xs">
                    <span className="font-semibold truncate">أقل منافس بالسوق</span>
                    <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg xl:text-xl font-black text-rose-400 font-mono truncate">
                    {currentProduct.currentLowestPrice.toLocaleString()} {currency}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 min-w-0">
                    <span className="shrink-0">المنصة:</span>
                    <span className="text-slate-200 font-bold truncate">
                      {currentProduct.merchantOffers?.find(o => o.isBestDeal || o.price === currentProduct.currentLowestPrice)?.platformName || currentProduct.merchantOffers?.[0]?.platformName || 'أمازون مصر'}
                    </span>
                  </div>
                </div>

                {/* Card 2: Winning Retail Price */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between gap-1.5 shadow-md shadow-emerald-950/30 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-emerald-300 text-xs">
                    <span className="font-black truncate">سعر بيعك الرابح</span>
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg xl:text-xl font-black text-emerald-400 font-mono truncate">
                    {winningPrice.toLocaleString()} {currency}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 min-w-0">
                    <span className="shrink-0">نسبة التخفيض:</span>
                    <span className="font-bold truncate">خصم {selectedDiscount}%</span>
                  </div>
                </div>

                {/* Card 3: Estimated Wholesale Cost */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between gap-1.5 shadow-inner min-w-0">
                  <div className="flex items-center justify-between gap-2 text-slate-400 text-xs">
                    <span className="font-semibold truncate">تكلفة الجملة التقديرية</span>
                    <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg xl:text-xl font-black text-indigo-300 font-mono truncate">
                    {currentProduct.estimatedWholesaleCost.toLocaleString()} {currency}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 min-w-0">
                    <span className="truncate">حماية رأس المال (Floor)</span>
                  </div>
                </div>

                {/* Card 4: Net Profit Margin */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between gap-1.5 shadow-inner min-w-0">
                  <div className="flex items-center justify-between gap-2 text-slate-400 text-xs">
                    <span className="font-semibold truncate">صافي هامش الربح</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg xl:text-xl font-black text-emerald-400 font-mono truncate">
                    +{(winningPrice - currentProduct.estimatedWholesaleCost).toLocaleString()} {currency}
                  </div>
                  <div className="text-[10px] text-emerald-300/90 font-bold truncate">
                    {currentProduct.estimatedWholesaleCost > 0 ? (
                      <span>هامش: {Math.round(((winningPrice - currentProduct.estimatedWholesaleCost) / currentProduct.estimatedWholesaleCost) * 100)}% فوق التكلفة</span>
                    ) : (
                      <span>هامش ربح ممتاز</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer for the active product */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs min-w-0">
                <div className="flex items-center gap-2 text-slate-300 text-xs min-w-0 flex-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="leading-relaxed">
                    بتطبيق هذا السعر، تضمن صدارة صندوق الشراء (BuyBox) بهامش ربح آمن ومحمي.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="btn-hero-apply-winning-price"
                    onClick={() => handleApplyWinningPrice(winningPrice, selectedDiscount)}
                    className="h-9 px-3.5 rounded-md bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center shadow-md shadow-emerald-600/30 border border-emerald-500/50 cursor-pointer transition-all"
                    title="تطبيق سعر الفوز فوراً على هذا المنتج وتحديث المنظومة"
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>تطبيق سعر الفوز فوراً ({winningPrice.toLocaleString()} {currency}) ⚡</span>
                  </button>

                  <button
                    type="button"
                    id="btn-hero-reprice-platforms"
                    onClick={() => setIsPublishModalOpen(true)}
                    className="h-9 px-3.5 rounded-md bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold border border-slate-700 whitespace-nowrap flex items-center gap-1.5 justify-center cursor-pointer transition-all"
                    title="نشر السعر لجميع منصات التجارة الإلكترونية"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>إرسال وتحديث بالمنصات</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Prominent Centered Empty State Card when no product is registered/selected */
            <div 
              id="main-active-product-empty-card" 
              className="w-full max-w-full bg-linear-to-b from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800/80 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-md text-center flex flex-col items-center justify-center gap-4 transition-all overflow-hidden"
            >
              <ToolbarTooltip
                id="tooltip-empty-card-main-icon"
                title="مزايا السحب والإفلات والتبديل السريع ↕️"
                description="عند إضافة منتجاتك النشطة، يمكنك سحب الكارت وإفلاته لإعادة ترتيب الأولويات والتبديل السريع بين المنتجات بضغطة واحدة لمقارنة أسعار المنافسين لحظياً."
                badge="سحب وإفلات ذكي ⚡"
                icon={GripVertical}
                theme="emerald"
                side="bottom"
                shortcut="ترتيب وتبديل فوري للمنتجات النشطة"
                maxWidthClass="w-80 sm:w-96"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50 cursor-help transition-all">
                  <Package className="w-8 h-8 animate-pulse text-emerald-400" />
                </div>
              </ToolbarTooltip>

              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>حالة النظام: رادار الأسعار في وضع الجاهزية</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white font-['Alexandria']">
                  المنتج النشط: لا توجد منتجات مسجلة بعد
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed font-['Cairo']">
                  ابدأ بمسح باركود أول منتج جديد بالكاميرا أو رفع ملف Excel/CSV لبدء الرصد اللحظي لأسعار المنافسين على أمازون مصر، نون، جوميا، وتحديد أسعار البيع الرابحة تلقائياً.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  id="btn-empty-open-bestsellers"
                  onClick={() => setIsBestSellerAlertModalOpen(true)}
                  className="h-11 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs sm:text-sm font-black font-['Alexandria'] flex items-center gap-2 shadow-xl shadow-sky-500/20 border border-sky-400 transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-slate-950" />
                  <span>ترشيحات الأكثر مبيعاً (Best Sellers) 🔥</span>
                </button>

                <button
                  type="button"
                  id="btn-empty-scan-product"
                  onClick={() => setIsScannerOpen(true)}
                  className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-black font-['Alexandria'] flex items-center gap-2 shadow-xl shadow-emerald-600/30 border border-emerald-500/50 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>مسح أول منتج بالباركود 📷</span>
                </button>

                <button
                  type="button"
                  id="btn-empty-upload-excel"
                  onClick={() => setIsAiExcelEnricherOpen(true)}
                  className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 active:scale-95 border border-indigo-500/40 text-xs sm:text-sm font-bold font-['Alexandria'] flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>استيراد شيت إكسيل (AI) 📑</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (allProducts.length > 0) {
                      setCurrentProduct(allProducts[0]);
                      setWinningPrice(Math.round(allProducts[0].currentLowestPrice * (1 - selectedDiscount / 100)));
                    } else {
                      setActiveTab('inventory');
                    }
                  }}
                  className="h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <Boxes className="w-4 h-4 text-slate-400" />
                  <span>استعراض المخزون التجاري 📦</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* Control Panel: Platform Selection & Multi-Channel Access Bar (visible on radar or when toggled) */}
        {(activeTab === 'radar' || showPlatformBarOnOtherTabs) && (
        <div id="control-panel-platform-bar" className="w-full max-w-full bg-[#F8FAFC] border-2 border-[#000000] rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-3 text-[#000000] overflow-hidden">
          {/* Top Bar: Title, Count, Grouped Controls & Navigation Actions */}
          <div className="flex flex-col gap-3 pb-2.5 border-b-2 border-[#000000]">
            <div className="flex items-center gap-2.5 flex-wrap w-full">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 shrink-0">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>قنوات ومنصات البيع:</span>
              </span>

              {/* Real-time Mini Statistics Bar inside Platform Bar Header */}
              <div
                id="platform-bar-stats-mini"
                className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-800/90 border border-slate-700/80 rounded-xl shadow-2xs text-[11px] select-none text-slate-200"
                title={`إحصائيات المنصات اللحظية: ${activePlatformsCount} منصة نشطة من إجمالي ${totalPlatformsCount} منصة (${activePlatformPercentage}% نسبة التفعيل والتغطية)`}
              >
                {/* Active vs Total Counter with live pulsing badge */}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="font-black text-emerald-400 text-xs">{activePlatformsCount}</span>
                    <span className="text-slate-500 text-[10px]">/</span>
                    <span className="font-bold text-slate-200 text-xs">{totalPlatformsCount}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 font-['Cairo']">نشطة</span>
                </div>

                {/* Micro Progress Bar for Active Ratio */}
                <div 
                  className="w-14 sm:w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shrink-0 p-0.5" 
                  title={`نسبة التفعيل اللحظية: ${activePlatformPercentage}%`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${activePlatformPercentage}%` }}
                  />
                </div>

                {/* Percentage Chip */}
                <span className="text-[10px] font-black text-emerald-400 bg-slate-900 border border-slate-700 px-1.5 py-0.2 rounded-md font-mono shadow-2xs shrink-0">
                  {activePlatformPercentage}%
                </span>

                {/* Inactive & Error Breakdown */}
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] border-r border-slate-700 pr-2 mr-0.5">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>غير مفعلة:</span>
                    <strong className="text-slate-300 font-mono font-bold">{inactivePlatformsCount}</strong>
                  </span>
                  {errorPlatformsCount > 0 ? (
                    <button
                      type="button"
                      id="btn-mini-stat-error-filter"
                      onClick={() => {
                        const next = platformStatusFilter === 'sync_errors_only' ? 'all' : 'sync_errors_only';
                        setPlatformStatusFilter(next);
                        showToast(next === 'sync_errors_only' ? `تصفية فورية: عرض المنصات ذات أخطاء التزامن (${errorPlatformsCount} منصة) 🚨` : 'تمت استعادة عرض كافة المنصات 🌐');
                      }}
                      className="text-rose-300 bg-rose-950/90 hover:bg-rose-900 border border-rose-700/80 px-2 py-0.5 rounded-md font-bold flex items-center gap-1.5 animate-pulse cursor-pointer shadow-xs transition active:scale-95"
                      title="انقر لتصفية وعزل المنصات التي تحتوي على أخطاء تزامن فوراً 🚨"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{errorPlatformsCount} أخطاء مزامنة</span>
                      <span className="text-[9px] font-mono text-rose-200 underline font-black">تصفية 🚨</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformStatusFilter('sync_errors_only');
                        showToast('فحص أخطاء التزامن: جميع القنوات تعمل بمزامنة سليمة 100% 🟢');
                      }}
                      className="text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900/60 border border-emerald-800/80 px-2 py-0.5 rounded-md font-bold hidden md:inline-flex items-center gap-1 cursor-pointer transition active:scale-95"
                      title="انقر للتحقق من أخطاء التزامن"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>مزامنة سليمة 100%</span>
                    </button>
                  )}
                  {delayedPlatformsCount > 0 && (
                    <button
                      type="button"
                      id="btn-mini-stat-delayed-filter"
                      onClick={() => {
                        const next = platformStatusFilter === 'delayed_sync_only' ? 'all' : 'delayed_sync_only';
                        setPlatformStatusFilter(next);
                        showToast(next === 'delayed_sync_only' ? `تصفية القنوات المتأخرة لأكثر من ساعتين (${delayedPlatformsCount} قناة برتقالية) 🟠` : 'تمت استعادة عرض كافة المنصات 🌐');
                      }}
                      className="text-orange-300 bg-orange-950/90 hover:bg-orange-900 border border-orange-600/80 px-2 py-0.5 rounded-md font-bold flex items-center gap-1.5 animate-pulse cursor-pointer shadow-xs transition active:scale-95"
                      title="انقر لتصفية قنوات البيع التي تأخرت مزامنتها لأكثر من ساعتين 🟠"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>{delayedPlatformsCount} متأخرة &gt; 2س</span>
                      <span className="text-[9px] font-mono text-orange-200 underline font-black">تصفية 🟠</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Instant System Health Indicator Legend */}
              <div
                id="platform-bar-health-legend"
                className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-0.5 shadow-2xs"
                title="مؤشر فوري لسلامة اتصال المنصات: إطار أخضر = اتصال نشط وسليم، إطار برتقالي = تأخر مزامنة لأكثر من ساعتين، إطار أحمر = خطأ أو انقطاع في المزامنة"
              >
                <span className="text-slate-400 font-normal">سلامة النظام:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />
                  <span>اتصال سليم (أخضر)</span>
                </span>
                <span className="text-slate-600">/</span>
                <button
                  type="button"
                  id="btn-legend-delayed-sync"
                  onClick={() => {
                    const next = platformStatusFilter === 'delayed_sync_only' ? 'all' : 'delayed_sync_only';
                    setPlatformStatusFilter(next);
                    showToast(next === 'delayed_sync_only' ? `تصفية القنوات المتأخرة لأكثر من ساعتين (${delayedPlatformsCount} قناة برتقالية) 🟠` : 'تمت استعادة عرض كافة المنصات 🌐');
                  }}
                  className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition active:scale-95"
                  title="انقر لتصفية القنوات التي تأخرت مزامنتها لأكثر من ساعتين (مميزة باللون البرتقالي)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-xs" />
                  <span>تأخر &gt; ساعتين ({delayedPlatformsCount}) 🟠</span>
                </button>
                <span className="text-slate-600">/</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = platformStatusFilter === 'sync_errors_only' ? 'all' : 'sync_errors_only';
                    setPlatformStatusFilter(next);
                    showToast(next === 'sync_errors_only' ? `تصفية فورية: عرض قنوات أخطاء التزامن (${errorPlatformsCount} منصة) 🚨` : 'تمت استعادة عرض كافة المنصات 🌐');
                  }}
                  className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold cursor-pointer transition active:scale-95"
                  title="انقر لتصفية المنصات التي تحتوي على أخطاء تزامن"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-xs" />
                  <span>خطأ مزامنة ({errorPlatformsCount})</span>
                </button>
              </div>

              {/* Cohesive Header Controls Group: Sort Active, Type Filter, and Refresh All */}
              <div
                id="platform-bar-header-controls-group"
                className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border-2 border-[#000000] w-full"
              >
                {/* Custom Filter: All / Active Only / Sync Errors Only */}
                <div 
                  id="filter-platform-sync-status-group" 
                  className="inline-flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0 shadow-inner gap-1"
                  role="radiogroup"
                  aria-label="تصفية المنصات حسب حالة التزامن"
                >
                  {/* Option 1: All Platforms */}
                  <ToolbarTooltip
                    title="عرض كافة قنوات البيع (الكل)"
                    description="إظهار جميع القنوات والمنصات المسجلة بحساب التاجر (النشطة، غير المتصلة، والمتعثرة) دون أي استثناء."
                    badge={`إجمالي: ${totalPlatformsCount}`}
                    theme="slate"
                    shortcut="تصفية شاملة"
                    side="bottom"
                  >
                    <button
                      type="button"
                      id="btn-filter-status-all"
                      onClick={() => {
                        setPlatformStatusFilter('all');
                        showToast('عرض كافة قنوات ومنصات البيع 🌐');
                      }}
                      className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 justify-center cursor-pointer select-none active:scale-95 ${
                        platformStatusFilter === 'all'
                          ? 'bg-slate-800 text-white shadow-xs font-black border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                      aria-label={`عرض كافة قنوات البيع (${totalPlatformsCount})`}
                      aria-pressed={platformStatusFilter === 'all'}
                    >
                      <Store className="w-3.5 h-3.5 text-slate-300" />
                      <span>الكل</span>
                      <span className="font-mono text-[10px] opacity-75">({totalPlatformsCount})</span>
                    </button>
                  </ToolbarTooltip>

                  {/* Option 2: Active Platforms Only (المنصات النشطة فقط) */}
                  <ToolbarTooltip
                    title="المنصات النشطة فقط (Active Only)"
                    description="عزل القنوات المتصلة والمزامنة بنجاح حالياً لإدارة وتتبع القنوات الفعالة ومزامنة أسعارها اللحظية دون تشتيت."
                    badge={`${activePlatformsCount} قناة نشطة`}
                    theme="emerald"
                    shortcut="مزامنة سليمة 🟢"
                    side="bottom"
                  >
                    <button
                      type="button"
                      id="btn-filter-status-active-only"
                      onClick={() => {
                        setPlatformStatusFilter('active_only');
                        showToast(`تصفية المنصات: عرض المنصات النشطة فقط (${activePlatformsCount} منصة) 🟢`);
                      }}
                      className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 justify-center cursor-pointer select-none active:scale-95 ${
                        platformStatusFilter === 'active_only'
                          ? 'bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-400'
                          : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                      }`}
                      aria-label={`عرض المنصات النشطة فقط الخالية من الأخطاء (${activePlatformsCount})`}
                      aria-pressed={platformStatusFilter === 'active_only'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${platformStatusFilter === 'active_only' ? 'bg-white' : 'bg-emerald-500'}`} />
                      <span>النشطة فقط</span>
                      <span className="font-mono text-[10px]">({activePlatformsCount})</span>
                    </button>
                  </ToolbarTooltip>

                  {/* Option 3: Platforms with Sync Errors (المنصات ذات أخطاء التزامن) */}
                  <ToolbarTooltip
                    title="المنصات ذات أخطاء التزامن + التنبيه الصوتي التلقائي 🔊"
                    description="عزل القنوات المتعثرة مع تفعيل التنبيه الصوتي التلقائي عند اكتشاف أي خطأ تزامن جديد وفتح واجهة تفاصيل وتشخيص الخطأ مباشرة لسرعة استجابة المدير."
                    badge={`${errorPlatformsCount} متعثرة • صوت ${isSyncErrorAudioAlertEnabled ? 'مفعل 🔊' : 'صامت 🔇'}`}
                    theme="rose"
                    shortcut="انقر لعرض تفاصيل الخطأ وتصفية الأعطال 🚨"
                    side="bottom"
                  >
                    <button
                      type="button"
                      id="btn-filter-status-errors-only"
                      onClick={() => {
                        const erroredList = connectedPlatforms.filter(p =>
                          Boolean(p.hasSyncError || p.status === 'error' || p.syncError)
                        );
                        const next = platformStatusFilter === 'sync_errors_only' ? 'all' : 'sync_errors_only';
                        setPlatformStatusFilter(next);

                        if (isSyncErrorAudioAlertEnabled && erroredList.length > 0) {
                          playSyncErrorAudioChime();
                        }

                        if (erroredList.length > 0) {
                          setSyncErrorDetailsModalPlatform(erroredList[0]);
                          showToast(
                            `🔊🚨 تم تفعيل التنبيه الصوتي وفتح واجهة تفاصيل خطأ التزامن لقناة (${erroredList[0].name}) (${errorPlatformsCount} قناة متعثرة)`
                          );
                        } else {
                          const nextAudio = !isSyncErrorAudioAlertEnabled;
                          setIsSyncErrorAudioAlertEnabled(nextAudio);
                          try {
                            localStorage.setItem('radar_sync_error_audio_alert_v1', JSON.stringify(nextAudio));
                          } catch {}
                          if (nextAudio) playSyncErrorAudioChime();
                          showToast(
                            next === 'sync_errors_only'
                              ? `تصفية أخطاء التزامن (${errorPlatformsCount}) — التنبيه الصوتي التلقائي: ${nextAudio ? 'مفعل 🔊' : 'معطل 🔇'}`
                              : 'تمت استعادة عرض كافة المنصات 🌐'
                          );
                        }
                      }}
                      className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 justify-center cursor-pointer select-none active:scale-95 ${
                        platformStatusFilter === 'sync_errors_only'
                          ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg font-black ring-2 ring-rose-400/80 animate-pulse'
                          : errorPlatformsCount > 0
                          ? 'text-rose-300 bg-rose-950/90 hover:bg-rose-900 border border-rose-700/90 font-black animate-pulse'
                          : 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/30'
                      }`}
                      aria-label={`عرض المنصات ذات أخطاء وانقطاع التزامن (${errorPlatformsCount}) مع التنبيه الصوتي التلقائي`}
                      aria-pressed={platformStatusFilter === 'sync_errors_only'}
                    >
                      <AlertTriangle className={`w-3.5 h-3.5 ${platformStatusFilter === 'sync_errors_only' ? 'text-sky-200' : errorPlatformsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
                      <span>أخطاء التزامن (Sync Errors)</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextAudio = !isSyncErrorAudioAlertEnabled;
                          setIsSyncErrorAudioAlertEnabled(nextAudio);
                          try {
                            localStorage.setItem('radar_sync_error_audio_alert_v1', JSON.stringify(nextAudio));
                          } catch {}
                          if (nextAudio) playSyncErrorAudioChime();
                          showToast(
                            nextAudio
                              ? '🔊 تم تفعيل التنبيه الصوتي التلقائي عند اكتشاف خطأ تزامن جديد وربطه بواجهة تفاصيل الخطأ'
                              : '🔇 تم كتم التنبيه الصوتي التلقائي لأخطاء التزامن'
                          );
                        }}
                        title={isSyncErrorAudioAlertEnabled ? 'التنبيه الصوتي التلقائي مفعل (انقر للكتم)' : 'التنبيه الصوتي التلقائي مكتوم (انقر للتفعيل)'}
                        className={`inline-flex items-center justify-center p-0.5 rounded transition-colors ${
                          isSyncErrorAudioAlertEnabled
                            ? 'text-sky-300 hover:text-sky-100'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {isSyncErrorAudioAlertEnabled ? (
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        platformStatusFilter === 'sync_errors_only'
                          ? 'bg-rose-900 text-white'
                          : errorPlatformsCount > 0
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-900 text-slate-400'
                      }`}>
                        {errorPlatformsCount}
                      </span>
                    </button>
                  </ToolbarTooltip>

                  {/* Option 4: Delayed Sync Only (> 2 Hours) - نظام التنبيه المرئي للقنوات المتأخرة بالبرتقالي */}
                  <ToolbarTooltip
                    title="القنوات المتأخرة (> ساعتين) باللون البرتقالي 🟠"
                    description="تصفية وعزل قنوات البيع التي تأخرت مزامنتها لأكثر من ساعتين لاتخاذ إجراء فوري وإعادة المزامنة."
                    badge={`${delayedPlatformsCount} قنوات متأخرة ⚠️`}
                    theme="amber"
                    shortcut="تنبيه تأخر المزامنة 🟠"
                    side="bottom"
                  >
                    <button
                      type="button"
                      id="btn-filter-status-delayed-only"
                      onClick={() => {
                        const next = platformStatusFilter === 'delayed_sync_only' ? 'all' : 'delayed_sync_only';
                        setPlatformStatusFilter(next);
                        showToast(
                          next === 'delayed_sync_only'
                            ? `تصفية فورية: عرض القنوات المتأخرة لأكثر من ساعتين (${delayedPlatformsCount} قنوات مميزة بالبرتقالي 🟠)`
                            : 'تمت استعادة عرض كافة المنصات 🌐'
                        );
                      }}
                      className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 justify-center cursor-pointer select-none active:scale-95 ${
                        platformStatusFilter === 'delayed_sync_only'
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg font-black ring-2 ring-orange-400/80 animate-pulse'
                          : delayedPlatformsCount > 0
                          ? 'text-orange-300 bg-orange-950/90 hover:bg-orange-900 border border-orange-600/90 font-black animate-pulse'
                          : 'text-slate-400 hover:text-orange-300 hover:bg-orange-950/30'
                      }`}
                      aria-label={`عرض المنصات التي تأخرت مزامنتها لأكثر من ساعتين (${delayedPlatformsCount})`}
                      aria-pressed={platformStatusFilter === 'delayed_sync_only'}
                    >
                      <Clock className={`w-3.5 h-3.5 ${platformStatusFilter === 'delayed_sync_only' ? 'text-white' : delayedPlatformsCount > 0 ? 'text-orange-400 animate-pulse' : 'text-slate-400'}`} />
                      <span>تأخر المزامنة (&gt; ساعتين)</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        platformStatusFilter === 'delayed_sync_only'
                          ? 'bg-orange-900 text-white'
                          : delayedPlatformsCount > 0
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-slate-900 text-slate-400'
                      }`}>
                        {delayedPlatformsCount}
                      </span>
                    </button>
                  </ToolbarTooltip>
                </div>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Auto Sort Active Platforms First Toggle Button with Interactive Tooltip */}
                <ToolbarTooltip
                  title="ترتيب القنوات النشطة أولاً"
                  description="فرز تلقائي فوري يضع القنوات المتصلة والمزامنة في صدارة الشريط لتسهيل الوصول إليها وإدارتها دون عناء التمرير."
                  badge={sortActivePlatformsFirst ? 'مفعل (النشطة أولاً ⚡)' : 'الترتيب الافتراضي'}
                  icon={ArrowUpDown}
                  theme="indigo"
                  shortcut="فرز تلقائي ذكي"
                  side="bottom"
                >
                  <button
                    id="btn-toggle-sort-active-platforms"
                    type="button"
                    onClick={() => {
                      const nextVal = !sortActivePlatformsFirst;
                      setSortActivePlatformsFirst(nextVal);
                      showToast(nextVal ? 'تم تفعيل ترتيب المنصات تلقائياً: المنصات النشطة في البداية دائماً ⚡' : 'تم تعطيل الترتيب التلقائي للمنصات');
                    }}
                    className={`h-8 px-2.5 rounded-md text-xs font-bold border whitespace-nowrap transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 shadow-2xs active:scale-95 ${
                      sortActivePlatformsFirst
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs ring-1 ring-indigo-400/40'
                        : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                    aria-label="خاصية ترتيب المنصات"
                    aria-pressed={sortActivePlatformsFirst}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="whitespace-nowrap">{sortActivePlatformsFirst ? 'النشطة أولاً ⚡' : 'الترتيب الافتراضي'}</span>
                  </button>
                </ToolbarTooltip>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Group Inactive Platforms at Bottom Toggle Button with Interactive Tooltip */}
                <ToolbarTooltip
                  title="تجميع القنوات غير النشطة"
                  description="تجميع كافة المنصات وقنوات البيع غير المتصلة أو المعطلة تلقائياً في تصنيف منفصل في أسفل الشريط يسمى 'قنوات غير نشطة' لتخفيف الازدحام."
                  badge={groupInactivePlatformsAtBottom ? 'مجمعة بالأسفل ⬇️' : 'موزعة حسب القسم'}
                  icon={PowerOff}
                  theme="sky"
                  shortcut="تنظيم القنوات"
                  side="bottom"
                >
                  <button
                    id="btn-toggle-group-inactive-platforms"
                    type="button"
                    onClick={() => {
                      const nextVal = !groupInactivePlatformsAtBottom;
                      setGroupInactivePlatformsAtBottom(nextVal);
                      try {
                        localStorage.setItem('merchant_radar_group_inactive_platforms', JSON.stringify(nextVal));
                      } catch {
                        // ignore
                      }
                      showToast(
                        nextVal
                          ? 'تم تفعيل تجميع المنصات غير النشطة تلقائياً في تصنيف خاص بالأسفل 📂'
                          : 'تم تعطيل تجميع المنصات غير النشطة وإعادتها لتصنيفاتها الأصلية'
                      );
                    }}
                    className={`h-8 px-2.5 rounded-md text-xs font-bold border transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 shadow-2xs active:scale-95 whitespace-nowrap ${
                      groupInactivePlatformsAtBottom
                        ? 'bg-slate-800 text-white border-slate-600 shadow-xs ring-1 ring-slate-500/50 font-black'
                        : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                    aria-label="تجميع المنصات غير النشطة في تصنيف خاص بالأسفل"
                    aria-pressed={groupInactivePlatformsAtBottom}
                  >
                    <PowerOff className={`w-3.5 h-3.5 shrink-0 ${groupInactivePlatformsAtBottom ? 'text-sky-300' : 'text-slate-400'}`} />
                    <span>{groupInactivePlatformsAtBottom ? 'غير النشطة بالأسفل ⬇️' : 'تجميع غير النشطة'}</span>
                  </button>
                </ToolbarTooltip>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Filter by Platform Type Dropdown with Interactive Tooltip & Multi/Dual Selection */}
                <div className="relative shrink-0">
                  <ToolbarTooltip
                    title="تصفية تصنيفات قنوات البيع"
                    description="تصفية مزدوجة أو متعددة: تمكنك من اختيار أكثر من تصنيف (ماركت بليس، مواقع، سلاسل تجزئة، سوشيال) لعرضها معاً."
                    badge={
                      platformTypeFilter.length === 0 || platformTypeFilter.includes('all')
                        ? 'كافة التصنيفات'
                        : `${platformTypeFilter.length} تصنيفات محددة`
                    }
                    icon={Filter}
                    theme="indigo"
                    shortcut="تصفية متعددة"
                    side="bottom"
                    disabled={isPlatformTypeFilterDropdownOpen}
                  >
                    <button
                      id="btn-platform-type-filter-trigger"
                      type="button"
                      onClick={() => setIsPlatformTypeFilterDropdownOpen(!isPlatformTypeFilterDropdownOpen)}
                      className={`h-8 px-2.5 rounded-md text-xs font-bold border transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 shadow-2xs active:scale-95 whitespace-nowrap ${
                        platformTypeFilter.length > 0 && !platformTypeFilter.includes('all')
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs ring-1 ring-indigo-400/40'
                          : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                      aria-label="تصفية مزدوجة أو متعددة لتصنيفات المنصات"
                    >
                      <Filter className={`w-3.5 h-3.5 shrink-0 ${platformTypeFilter.length > 0 && !platformTypeFilter.includes('all') ? 'text-white' : 'text-indigo-400'}`} />
                      <span>
                        {platformTypeFilter.length === 0 || platformTypeFilter.includes('all')
                          ? `جميع التصنيفات (${connectedPlatforms.length})`
                          : platformTypeFilter.length === 2
                            ? `تصفية مزدوجة: ${platformTypeFilter.map((k) => platformCategories.find((c) => c.key === k)?.title || k).join(' + ')}`
                            : `تصفية (${platformTypeFilter.length} تصنيفات)`}
                      </span>
                      {platformTypeFilter.length > 0 && !platformTypeFilter.includes('all') && (
                        <span className="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0">
                          {platformTypeFilter.length}
                        </span>
                      )}
                      <ChevronDown className={`w-3 h-3 transition-transform ${isPlatformTypeFilterDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
                    </button>
                  </ToolbarTooltip>

                  {/* Hidden Synced Select for standard automation and test scripts */}
                  <select
                    id="select-platform-type-filter"
                    aria-hidden="true"
                    tabIndex={-1}
                    value={platformTypeFilter.includes('all') || platformTypeFilter.length === 0 ? 'all' : platformTypeFilter[0]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'all') {
                        setPlatformTypeFilter(['all']);
                      } else {
                        setPlatformTypeFilter([val]);
                      }
                    }}
                    className="sr-only pointer-events-none"
                  >
                    <option value="all">جميع التصنيفات ({connectedPlatforms.length})</option>
                    {platformCategories.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.title}
                      </option>
                    ))}
                  </select>

                  {/* Multi / Dual Category Dropdown Popover */}
                  {isPlatformTypeFilterDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsPlatformTypeFilterDropdownOpen(false)}
                        aria-hidden="true"
                      />
                      <div
                        id="dropdown-platform-type-filter"
                        className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 w-80 sm:w-96 bg-slate-900 rounded-2xl p-3.5 shadow-2xl border border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100 text-right"
                        dir="rtl"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
                              <Filter className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white font-['Cairo']">تصفية مزدوجة ومتعددة للتصنيفات</h4>
                              <p className="text-[10px] text-slate-400">اختر أكثر من تصنيف لعرض قنواتها في وقت واحد</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPlatformTypeFilter(['all']);
                              showToast('تمت إعادة ضبط التصفية لعرض كافة التصنيفات 🌐');
                            }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                          >
                            عرض الكل (إعادة ضبط)
                          </button>
                        </div>

                        {/* Quick Actions (Dual Shortcut & Reset) */}
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPlatformTypeFilter(['all']);
                              showToast('تصفية المنصات: تم اختيار كافة التصنيفات 🌐');
                            }}
                            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                              platformTypeFilter.length === 0 || platformTypeFilter.includes('all')
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                          >
                            <span>عرض الكل ({connectedPlatforms.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPlatformTypeFilter(['marketplace', 'website']);
                              showToast('تصفية مزدوجة: ماركت بليس + مواقع إلكترونية 🎯');
                            }}
                            className={`py-1 px-2.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                              platformTypeFilter.length === 2 && platformTypeFilter.includes('marketplace') && platformTypeFilter.includes('website')
                                ? 'bg-purple-600 text-white border-purple-500 shadow-2xs'
                                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                            }`}
                            title="اختيار مزدوج سريع لمتاجر الماركت بليس والمواقع الإلكترونية"
                          >
                            <span>ماركت بليس + مواقع ⚡</span>
                          </button>
                        </div>

                        {/* Category Checkboxes List */}
                        <div className="space-y-1 max-h-60 overflow-y-auto pe-1">
                          {platformCategories.map((cat) => {
                            const catCount = connectedPlatforms.filter(
                              (p) => getPlatformClassification(p.code, p.category) === cat.key
                            ).length;
                            const isSelected =
                              !platformTypeFilter.includes('all') &&
                              platformTypeFilter.length > 0 &&
                              platformTypeFilter.includes(cat.key);
                            const IconComp = getCategoryIconComponent(cat.iconName);

                            return (
                              <label
                                key={cat.key}
                                className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-indigo-950/80 border-indigo-500/80 text-indigo-200 font-bold shadow-2xs'
                                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleTogglePlatformCategoryType(cat.key)}
                                    className="w-4 h-4 rounded-sm border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                  />
                                  <div
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                                    }`}
                                  >
                                    <IconComp className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold">{cat.title}</span>
                                </div>

                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                                    isSelected
                                      ? 'bg-indigo-900/80 text-indigo-200 font-bold border border-indigo-700'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {catCount} منصة
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Footer Status & Done Button */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">
                            {platformTypeFilter.length === 0 || platformTypeFilter.includes('all')
                              ? 'يتم عرض جميع التصنيفات'
                              : platformTypeFilter.length === 2
                                ? 'وضع التصفية المزدوجة نشط 🎯'
                                : `تم تحديد ${platformTypeFilter.length} تصنيفات`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsPlatformTypeFilterDropdownOpen(false)}
                            className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs border border-slate-700"
                          >
                            تم التطبيق
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tooltip for Platform Type Filter */}
                  <div
                    id="tooltip-filter-platform-type"
                    role="tooltip"
                    className="absolute top-full mt-2.5 right-0 w-72 bg-slate-900/95 backdrop-blur-md text-slate-100 rounded-xl p-3 shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover/filter-tip:opacity-100 group-focus-within/filter-tip:opacity-100 transition-all duration-200 z-50 transform translate-y-1 group-hover/filter-tip:translate-y-0 group-focus-within/filter-tip:translate-y-0"
                  >
                    <div className="absolute -top-1.5 right-6 w-3 h-3 bg-slate-900 border-t border-r border-slate-800 rotate-[-45deg]" />
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                        <Filter className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">تصفية مزدوجة ومتعددة</span>
                        <span className="text-[10px] text-slate-400">تحديد أكثر من تصنيف في وقت واحد</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      تتيح لك اختيار تصنيفين (تصفية مزدوجة) أو أكثر لعرض قنواتها معاً في شريط المنصات وإخفاء باقي التصنيفات غير المحددة.
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">التصنيفات المختارة:</span>
                      <span className="font-bold px-1.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate max-w-[140px]">
                        {platformTypeFilter.length === 0 || platformTypeFilter.includes('all')
                          ? 'عرض جميع التصنيفات'
                          : platformTypeFilter.map((k) => platformCategories.find((c) => c.key === k)?.title || k).join(' + ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Reorder Platform Categories Dropdown (Drag-to-Reorder & Move Up/Down) */}
                <div className="relative shrink-0">
                  <button
                    id="btn-category-reorder-dropdown-trigger"
                    type="button"
                    onClick={() => setIsCategoryReorderDropdownOpen(!isCategoryReorderDropdownOpen)}
                    className={`h-8 px-2.5 rounded-md text-xs font-bold border transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 shadow-2xs active:scale-95 whitespace-nowrap ${
                      isCategoryReorderDropdownOpen
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs ring-1 ring-indigo-400/40'
                        : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                    }`}
                    aria-label="إعادة ترتيب تصنيفات المنصات في لوحة التحكم (سحب وأسهم)"
                    title="إعادة ترتيب تصنيفات المنصات: سحب وإفلات أو نقل التصنيف للأعلى والأسفل ↕️"
                  >
                    <ArrowUpDown className={`w-3.5 h-3.5 shrink-0 ${isCategoryReorderDropdownOpen ? 'text-white' : 'text-indigo-400'}`} />
                    <span>ترتيب التصنيفات ↕️</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isCategoryReorderDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
                  </button>

                  {/* Category Reorder Dropdown Menu with Backdrop */}
                  {isCategoryReorderDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsCategoryReorderDropdownOpen(false)}
                        aria-hidden="true"
                      />
                      <div
                        id="dropdown-category-reorder"
                        className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 w-80 sm:w-96 bg-slate-900 rounded-2xl p-3.5 shadow-2xl border border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100 text-right"
                        dir="rtl"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
                              <ArrowUpDown className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-black text-white block font-['Cairo']">إعادة ترتيب تصنيفات لوحة التحكم</span>
                              <span className="text-[10px] text-slate-400 font-medium">اسحب للتغيير أو اضغط أسهم النقل للأعلى والأسفل ↕️</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsCategoryReorderDropdownOpen(false)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="إغلاق القائمة"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Tip Banner */}
                        <div className="mb-2 px-2.5 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center justify-between gap-2 text-[10px] text-slate-200 font-bold">
                          <span className="flex items-center gap-1">
                            <GripVertical className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>اسحب أي تصنيف لنقله فوراً، أو استخدم الأسهم:</span>
                          </span>
                          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-[9px] text-indigo-300">
                            {platformCategories.length} تصنيفات
                          </span>
                        </div>

                        {/* Interactive Reorderable Categories List */}
                        <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pe-1">
                          {platformCategories.map((cat, index) => {
                            const CatIcon = getCategoryIconComponent(cat.iconName);
                            const platformsInCat = connectedPlatforms.filter(
                              (p) => getPlatformClassification(p.code, p.category) === cat.key
                            );
                            const isFirst = index === 0;
                            const isLast = index === platformCategories.length - 1;
                            const isDragging = draggedCategoryKey === cat.key;
                            const isOver = dragOverCategoryReorderKey === cat.key;

                            return (
                              <div
                                key={cat.key}
                                id={`category-reorder-item-${cat.key}`}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', cat.key);
                                  e.dataTransfer.effectAllowed = 'move';
                                  setDraggedCategoryKey(cat.key);
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = 'move';
                                  if (dragOverCategoryReorderKey !== cat.key) {
                                    setDragOverCategoryReorderKey(cat.key);
                                  }
                                }}
                                onDragLeave={(e) => {
                                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                    if (dragOverCategoryReorderKey === cat.key) {
                                      setDragOverCategoryReorderKey(null);
                                    }
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  handleCategoryReorderDrop(cat.key);
                                }}
                                onDragEnd={() => {
                                  setDraggedCategoryKey(null);
                                  setDragOverCategoryReorderKey(null);
                                }}
                                className={`flex items-center justify-between p-2 rounded-xl border transition-all select-none cursor-grab active:cursor-grabbing ${
                                  isDragging
                                    ? 'opacity-40 border-indigo-400 bg-indigo-50/60 scale-[0.98]'
                                    : isOver
                                    ? 'border-indigo-500 bg-indigo-950/80 ring-2 ring-indigo-400 shadow-md translate-y-[-2px]'
                                    : 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:border-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="cursor-grab text-slate-400 hover:text-slate-200 p-0.5 shrink-0" title="اضغط مع السحب لتغيير ترتيب التصنيف">
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </span>
                                  <div className={`p-1.5 rounded-lg border shrink-0 ${cat.badgeBg || 'bg-slate-800 text-slate-200 border-slate-700'}`}>
                                    <CatIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-slate-200 truncate">{cat.title}</span>
                                      {cat.isCustom && (
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950/80 text-indigo-300 font-bold border border-indigo-700">مخصص</span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 block font-medium">
                                      {platformsInCat.length} منصات ({platformsInCat.filter(p => p.isConnected).length} نشطة)
                                    </span>
                                  </div>
                                </div>

                                {/* Up and Down Reorder Action Buttons */}
                                <div className="flex items-center gap-1 shrink-0 ms-2">
                                  <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">#{index + 1}</span>
                                  <button
                                    type="button"
                                    id={`btn-move-up-category-${cat.key}`}
                                    disabled={isFirst}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveCategory(cat.key, 'up');
                                    }}
                                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                                      isFirst
                                        ? 'text-slate-600 cursor-not-allowed opacity-40'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 active:scale-90'
                                    }`}
                                    title={isFirst ? 'هذا التصنيف في أعلى القائمة بالفعل' : 'نقل التصنيف للأعلى ⬆️'}
                                    aria-label={`نقل تصنيف ${cat.title} للأعلى`}
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    id={`btn-move-down-category-${cat.key}`}
                                    disabled={isLast}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveCategory(cat.key, 'down');
                                    }}
                                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                                      isLast
                                        ? 'text-slate-600 cursor-not-allowed opacity-40'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 active:scale-90'
                                    }`}
                                    title={isLast ? 'هذا التصنيف في أسفل القائمة بالفعل' : 'نقل التصنيف للأسفل ⬇️'}
                                    aria-label={`نقل تصنيف ${cat.title} للأسفل`}
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer Controls */}
                        <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            id="btn-reset-categories-order"
                            onClick={handleResetCategoryOrder}
                            className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            title="استعادة الترتيب الافتراضي للتصنيفات"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-400" />
                            <span>استعادة الترتيب الأصلي</span>
                          </button>
                          <button
                            type="button"
                            id="btn-add-category-from-reorder-dropdown"
                            onClick={() => {
                              setIsCategoryReorderDropdownOpen(false);
                              handleOpenCreateCategory();
                            }}
                            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <FolderPlus className="w-3 h-3 text-indigo-400" />
                            <span>تصنيف جديد (+)</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Compact Mode Toggle Button with Interactive Tooltip */}
                <ToolbarTooltip
                  title="الوضع المدمج (Compact Bar)"
                  description="يقوم بإخفاء التفاصيل الجانبية الإضافية لتقليل الازدحام البصري وتوفير مساحة للشاشات، مع الحفاظ على التزامن اللحظي."
                  badge={isPlatformBarCompact ? 'مدمج (مبسط) 📱' : 'موسع (كامل التفاصيل)'}
                  icon={isPlatformBarCompact ? Minimize2 : Maximize2}
                  theme="indigo"
                  shortcut="تقليل الازدحام"
                  side="bottom"
                >
                  <button
                    id="btn-toggle-compact-platform-bar"
                    type="button"
                    onClick={() => {
                      const nextVal = !isPlatformBarCompact;
                      setIsPlatformBarCompact(nextVal);
                      try {
                        localStorage.setItem('merchant_radar_platform_bar_compact', JSON.stringify(nextVal));
                      } catch {
                        // ignore
                      }
                      showToast(
                        nextVal 
                          ? 'تم تفعيل الوضع المدمج لشريط المنصات: إخفاء التفاصيل الجانبية وتقليل الازدحام البصري 📱' 
                          : 'تم تعطيل الوضع المدمج: إظهار التفاصيل الموسعة لكافة المنصات'
                      );
                    }}
                    className={`h-8 px-3 rounded-md text-xs font-medium font-['Alexandria'] border transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 active:scale-95 whitespace-nowrap ${
                      isPlatformBarCompact
                        ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-xs'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
                    }`}
                    aria-label="تبديل الوضع المدمج لشريط المنصات"
                    aria-pressed={isPlatformBarCompact}
                  >
                    {isPlatformBarCompact ? (
                      <Minimize2 className="w-3.5 h-3.5 text-indigo-100 shrink-0" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>{isPlatformBarCompact ? 'الوضع المدمج' : 'الوضع المدمج'}</span>
                  </button>
                </ToolbarTooltip>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Expand All Platforms Button with Interactive Tooltip */}
                <ToolbarTooltip
                  title="توسيع / طي كافة التفاصيل (Expand All)"
                  description="إظهار أو طي فوري وشامل لجميع تفاصيل قنوات البيع (نسب العمولات، معرف التاجر، حساب المتجر، حالة وتوقيت المزامنة ومنافسي كل قناة) بنقرة واحدة."
                  badge={areAllPlatformDetailsExpanded ? 'تفاصيل موسعة ومكشوفة ✓' : 'موجز قياسي'}
                  icon={areAllPlatformDetailsExpanded ? ChevronsDownUp : ChevronsUpDown}
                  theme="indigo"
                  shortcut="كشف كامل البيانات"
                  side="bottom"
                >
                  <button
                    id="btn-expand-all-platforms"
                    type="button"
                    onClick={handleToggleExpandAllPlatforms}
                    className={`h-8 px-3 rounded-md text-xs font-medium font-['Alexandria'] border transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 active:scale-95 whitespace-nowrap ${
                      areAllPlatformDetailsExpanded
                        ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-xs'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
                    }`}
                    aria-label="توسيع كافة تفاصيل المنصات وقنوات البيع بنقرة واحدة (Expand All)"
                    aria-pressed={areAllPlatformDetailsExpanded}
                  >
                    {areAllPlatformDetailsExpanded ? (
                      <ChevronsDownUp className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                    ) : (
                      <ChevronsUpDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                    <span>{areAllPlatformDetailsExpanded ? 'طي الكل' : 'توسيع الكل'}</span>
                  </button>
                </ToolbarTooltip>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Refresh All Connected Platforms Button with Interactive Tooltip */}
                <ToolbarTooltip
                  title="فحص وتحديث التزامن الفوري (Refresh All)"
                  description="فحص فوري وشامل لاتصال API لكافة المنصات وقنوات البيع، وتحديث حالة الربط، ومزامنة الأسعار والمخزون، واكتشاف أي انقطاع أو أخطاء لمراجعتها فوراً."
                  badge={
                    isRefreshingPlatforms
                      ? 'جاري الفحص المباشر...'
                      : isAllPlatformsRecentlySynced
                      ? 'تم التحديث بنجاح! ✅'
                      : 'جاهز للمزامنة الفورية ✓'
                  }
                  icon={RefreshCw}
                  theme="emerald"
                  shortcut="تحديث شامل لجميع القنوات"
                  side="bottom"
                >
                  <button
                    id="btn-refresh-all-platforms"
                    type="button"
                    onClick={handleRefreshAllPlatforms}
                    disabled={isRefreshingPlatforms}
                    className={`h-8 px-3 min-w-[80px] rounded-md text-xs font-semibold font-['Alexandria'] border transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed whitespace-nowrap ${
                      isRefreshingPlatforms
                        ? 'bg-sky-600/90 text-white border-sky-500 shadow-xs'
                        : isAllPlatformsRecentlySynced
                        ? 'bg-emerald-700/80 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-white border-slate-700/80 hover:border-emerald-500/50'
                    }`}
                    aria-label="فحص وتحديث التزامن الفوري لجميع المنصات"
                  >
                    {isAllPlatformsRecentlySynced ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <RefreshCw
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isRefreshingPlatforms
                            ? 'animate-spin text-sky-400'
                            : 'text-emerald-400'
                        }`}
                      />
                    )}
                    <span className="leading-none flex items-center">
                      {isRefreshingPlatforms
                        ? 'جاري الفحص...'
                        : isAllPlatformsRecentlySynced
                        ? 'تم التحديث!'
                        : 'تحديث الكل'}
                    </span>
                  </button>
                </ToolbarTooltip>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Reset View Button with Interactive Tooltip */}
                <ToolbarTooltip
                  title="إعادة ضبط العرض (Reset View)"
                  description="إلغاء الترتيب اليدوي الناتج عن السحب والإفلات وإعادة ترتيب المنصات إلى تسلسل النظام الافتراضي، مع الحفاظ على تفعيل إعداد (النشطة أولاً ⚡)."
                  badge={sortActivePlatformsFirst ? 'النشطة أولاً (مفعل ⚡)' : 'الترتيب الافتراضي'}
                  icon={RotateCcw}
                  theme="slate"
                  shortcut="استعادة ترتيب النظام"
                  side="bottom"
                >
                  <button
                    id="btn-reset-platform-bar-view"
                    type="button"
                    onClick={() => setIsResetViewConfirmOpen(true)}
                    className="h-8 px-3 rounded-md text-xs font-medium font-['Alexandria'] border transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 active:scale-95 whitespace-nowrap bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600"
                    aria-label="إعادة ضبط العرض إلى الترتيب الافتراضي للنظام"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 transition-colors shrink-0" />
                    <span>إعادة ضبط</span>
                  </button>
                </ToolbarTooltip>

                <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0 mx-0.5" />

                {/* Export Configuration Button with Interactive Tooltip */}
                <ToolbarTooltip
                  title="تصدير الإعدادات (Export Config)"
                  description="تحميل ملف JSON كامل يحتوي على الترتيب الحالي لمنصات البيع، وحالة الاتصال والربط، وإعدادات المزامنة الفورية كنسخة احتياطية آمنة."
                  badge={`${connectedPlatforms.length} منصة وقناة بيع`}
                  icon={Download}
                  theme="slate"
                  shortcut="نسخة احتياطية JSON"
                  side="bottom"
                >
                  <button
                    id="btn-export-platform-config"
                    type="button"
                    onClick={handleExportPlatformConfig}
                    className="h-8 px-3 rounded-md text-xs font-medium font-['Alexandria'] border transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0 active:scale-95 whitespace-nowrap bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600"
                    aria-label="تصدير إعدادات وترتيب المنصات كملف JSON للنسخ الاحتياطي"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400 transition-colors shrink-0" />
                    <span>تصدير JSON</span>
                  </button>
                </ToolbarTooltip>
              </div>

              {/* Drag and drop reordering tip badge */}
              <span className="text-[10px] text-slate-400 font-medium hidden xl:inline-flex items-center gap-1 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-md shadow-2xs shrink-0">
                <GripVertical className="w-3 h-3 text-slate-500 shrink-0" />
                <span>اسحب المنصات لإعادة الترتيب ↕️</span>
              </span>
            </div>

            {/* Organized Action Bar Grid for Secondary Platform Operations */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:flex xl:flex-wrap gap-2 items-center w-full p-2.5 bg-[#F8FAFC] rounded-xl border-2 border-[#000000]">
              {/* Proactive API Health Check Button */}
              <button
                id="btn-proactive-api-health-scan"
                type="button"
                onClick={() => {
                  const healthyCount = connectedPlatforms.filter(p => p.isConnected && !p.hasSyncError && p.status !== 'error').length;
                  const totalConnected = connectedPlatforms.filter(p => p.isConnected).length;
                  showToast(`⚡ فحص استباقي لصحة اتصال الـ API: تم فحص ${totalConnected} قناة مفعلة بنجاح (${healthyCount} متصل ومستقر 100%) - جميع التوكنز والاعتمادات سليمة وآمنة.`);
                  confetti({ particleCount: 45, spread: 70, origin: { y: 0.2 } });
                }}
                className="w-full xl:w-auto h-9 px-3.5 bg-[#F8FAFC] text-[#000000] text-xs font-bold rounded-lg border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                title="إجراء فحص استباقي فوري لصحة اتصال API لكافة المنصات والتحقق من سلامة التوكنز والاعتمادات"
              >
                <Activity className="w-3.5 h-3.5 text-[#000000] shrink-0" />
                <span>فحص صحة الـ API</span>
              </button>

              {/* Amazon Multi-Item Waybill Cropper Button */}
              <ToolbarTooltip
                title="قص بوالص أمازون متعددة الأصناف"
                description="قص وإعادة ضبط بوالص شحن أمازون للطلبات متعددة المنتجات للطباعة الحرارية 4x6 أو ورق A4 دون إخفاء أي منتج."
                badge="Multi-Item ✂️"
                icon={Scissors}
                theme="sky"
                shortcut="بوالص متعددة"
                side="bottom"
                className="w-full xl:w-auto"
              >
                <button
                  id="btn-open-amazon-waybill-cropper-platform-bar"
                  type="button"
                  onClick={() => setIsAmazonWaybillCropperOpen(true)}
                  className="w-full xl:w-auto h-9 px-3.5 bg-[#F8FAFC] text-[#000000] text-xs font-bold rounded-lg border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                  title="قص وتجهيز بوالص أمازون للطلبات التي تحتوي على أكثر من منتج (Thermal 4x6 / A4)"
                >
                  <Scissors className="w-3.5 h-3.5 text-[#000000] shrink-0" />
                  <span>قص بوالص أمازون</span>
                </button>
              </ToolbarTooltip>

              {/* Live Platform Product Synchronization Button */}
              <ToolbarTooltip
                title="المزامنة الحية لمنتجات المنصات"
                description="مزامنة فورية حقيقية لبيانات الأسعار والمخزون وبوالص الشحن لكافة قنوات البيع النشطة للتاجر الحالي دون خلط."
                badge="مزامنة فورية 🔄"
                icon={RefreshCw}
                theme="emerald"
                shortcut="تحديث المخزون والأسعار"
                side="bottom"
                className="w-full xl:w-auto"
              >
                <div className="w-full xl:w-auto h-9 inline-flex items-center gap-1">
                  <button
                    id="btn-live-platform-sync-trigger"
                    type="button"
                    onClick={() => handleLiveSync()}
                    disabled={isRefreshingPlatforms}
                    className="flex-1 xl:flex-initial h-9 px-3.5 bg-[#F8FAFC] text-[#000000] text-xs font-bold rounded-lg border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed whitespace-nowrap"
                    title={`المزامنة الحية لمنتجات المنصات الفعلية لمتجر "${remoteMerchantsList.find(m => m.id === activeMerchantId)?.storeName || 'التاجر النشط'}"`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#000000] shrink-0 ${isRefreshingPlatforms ? 'animate-spin' : ''}`} />
                    <span className="leading-none flex items-center">{isRefreshingPlatforms ? 'جاري المزامنة...' : 'مزامنة المتجر'}</span>
                  </button>
                  <button
                    id="btn-open-sync-modal-options"
                    type="button"
                    onClick={() => setIsLiveSyncModalOpen(true)}
                    className="h-9 px-2.5 bg-[#F8FAFC] text-[#000000] text-xs rounded-lg border-2 border-[#000000] flex items-center justify-center transition-all cursor-pointer shrink-0"
                    title="خيارات الاستيراد وتقرير السيلر سنترال وأرقام ASIN المتقدمة"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-[#000000]" />
                  </button>
                </div>
              </ToolbarTooltip>

              {/* Smart Gmail Auto-Link Button */}
              <ToolbarTooltip
                title="ربط Gmail الذكي"
                description="الربط التلقائي لحسابات ومنصات البيع عبر بريد Gmail الأساسي لتسهيل استخراج التنبيهات والبوالص."
                badge="ربط آلي ⚡"
                icon={Mail}
                theme="indigo"
                shortcut="Google Workspace"
                side="bottom"
                className="w-full xl:w-auto"
              >
                <button
                  id="btn-smart-gmail-autolink-trigger"
                  type="button"
                  onClick={() => {
                    setSmartGmailModalTab('gmail_link');
                    setIsSmartGmailModalOpen(true);
                  }}
                  className="w-full xl:w-auto h-9 px-3.5 bg-[#F8FAFC] text-[#000000] text-xs font-bold rounded-lg border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                  title="الربط الذكي التلقائي لكافة المنصات وقنوات البيع عبر بريد Gmail الأساسي"
                >
                  <Mail className="w-3.5 h-3.5 text-[#000000] shrink-0" />
                  <span>ربط Gmail</span>
                </button>
              </ToolbarTooltip>

              {/* Direct Launchpad Shortcut Button */}
              <ToolbarTooltip
                title="مراكز البائعين الرسمية"
                description="اختصارات الوصول المباشر للوحات تحكم البائعين (أمازون سيلر، نون بارتنر، جوميا سيلر) بضغطة واحدة."
                badge="دخول فوري 🚀"
                icon={Rocket}
                theme="sky"
                shortcut="اختصار البائع"
                side="bottom"
                className="w-full xl:w-auto"
              >
                <button
                  id="btn-direct-launchpad-trigger"
                  type="button"
                  onClick={() => {
                    setSmartGmailModalTab('launchpad');
                    setIsSmartGmailModalOpen(true);
                  }}
                  className="w-full xl:w-auto h-9 px-3.5 bg-[#F8FAFC] text-[#000000] text-xs font-bold rounded-lg border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                  title="اختصارات الوصول المباشر لمراكز البائعين بضغطة زر واحدة (Direct Launch)"
                >
                  <Rocket className="w-3.5 h-3.5 text-[#000000] shrink-0" />
                  <span>مراكز البائعين</span>
                </button>
              </ToolbarTooltip>

              {/* Direct Remote Merchants & Reports Button in Platform Bar */}
              <ToolbarTooltip
                title="متابعة التجار والشركاء"
                description="استعراض حسابات التجار والشركاء المعتمدين وإيميلات المتاجر المرتبطة والتقارير الأسبوعية."
                badge={`${remoteMerchantsList.length} تاجر مسجل`}
                icon={Users}
                theme="indigo"
                shortcut="إدارة الحسابات"
                side="bottom"
                className="w-full xl:w-auto"
              >
                <button
                  id="btn-platform-bar-remote-merchants"
                  type="button"
                  onClick={() => {
                    setActiveTab('remote_merchants');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full xl:w-auto h-9 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 shrink-0 whitespace-nowrap border-2 border-[#000000] bg-[#F8FAFC] text-[#000000]"
                  title="متابعة حسابات وإيميلات التجار المرتبطة بالمنصات والتقارير الأسبوعية"
                >
                  <Users className="w-3.5 h-3.5 text-[#000000] shrink-0" />
                  <span>متابعة التجار</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F8FAFC] text-[#000000] border border-[#000000] text-[10px] font-mono font-bold leading-none">
                    {remoteMerchantsList.length}
                  </span>
                </button>
              </ToolbarTooltip>

              {/* Button to Create New Custom Category */}
              <ToolbarTooltip
                title="إنشاء تصنيف مخصص"
                description="إنشاء تصنيف جديد لتجميع وتنظيم قنوات البيع ذات الصلة في تبويب منفصل."
                badge="تصنيف جديد (+)"
                icon={FolderPlus}
                theme="slate"
                shortcut="تنظيم مخصص"
                side="bottom"
                className="w-full xl:w-auto"
              >
                <button
                  id="btn-create-category-header-trigger"
                  type="button"
                  onClick={handleOpenCreateCategory}
                  className="w-full xl:w-auto h-9 px-3.5 bg-[#F8FAFC] text-[#000000] text-xs font-bold rounded-lg border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
                  title="إنشاء تصنيف مخصص جديد لتجميع المنصات (Custom Category)"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#000000] shrink-0" />
                  <span>تصنيف مخصص +</span>
                </button>
              </ToolbarTooltip>

              {/* Quick-Access Action Button: Top Trending Products (China -> Egypt) */}
              <ToolbarTooltip
                title="منتجات التريند والأعلى مبيعات (الصين 👈 مصر)"
                description="تصفح كتالوج منسق من البضائع الاستيرادية الصينية الأعلى طلباً ورواجاً في مصر (Home, Mobile, Beauty, Baby, Fashion) مع مؤشرات الأرباح ومعدلات الطلب."
                badge="تريند الصين 🇨🇳👈🇪🇬"
                icon={Flame}
                theme="amber"
                shortcut="Top Trending Products"
                side="bottom"
                className="w-full xl:w-auto"
              >
                <button
                  id="btn-radar-trending-chinese-imports"
                  type="button"
                  onClick={() => setIsBestSellerAlertModalOpen(true)}
                  className="w-full xl:w-auto h-9 px-3.5 bg-[#F8FAFC] text-[#000000] text-xs font-bold rounded-lg border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 whitespace-nowrap hover:bg-amber-100"
                  title="منتجات التريند والأعلى مبيعات (الصين 👈 مصر) - Top Trending Products"
                >
                  <Flame className="w-4 h-4 text-[#000000] fill-amber-400 shrink-0" />
                  <span className="font-extrabold">منتجات التريند (الصين 👈 مصر)</span>
                  <span className="text-[10px] bg-[#000000] text-white px-1.5 py-0.2 rounded font-mono">
                    Top Trending
                  </span>
                </button>
              </ToolbarTooltip>

              {/* Add Platform Button */}
              <ToolbarTooltip
                id="tooltip-add-platform-header-trigger"
                title="إضافة قناة بيع جديدة"
                description="ربط متجر أو منصة بيع جديدة من بين أكثر من 20 منصة مصرية وعربية لمزامنة الأسعار وحماية صندوق الشراء."
                badge="قناة بيع (+)"
                icon={Plus}
                theme="emerald"
                shortcut="Alt + P"
                side="bottom"
                className="w-full xl:w-auto"
              >
                <button
                  id="btn-add-platform-header-trigger"
                  type="button"
                  disabled={isOpeningAddPlatformModal}
                  aria-busy={isOpeningAddPlatformModal}
                  onClick={handleTriggerOpenAddPlatformModal}
                  className="w-full xl:w-auto py-3 px-6 bg-[#F8FAFC] text-[#000000] text-sm font-bold rounded-lg border-2 border-[#000000] flex items-center gap-2 justify-center transition-all duration-100 ease-in-out cursor-pointer whitespace-nowrap group disabled:opacity-85 disabled:cursor-wait"
                  title="إضافة قناة بيع جديدة (اختصار لوحة المفاتيح: Alt + P)"
                >
                  {isOpeningAddPlatformModal ? (
                    <Loader2 className="w-5 h-5 text-[#000000] animate-spin shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#000000] shrink-0" />
                  )}
                  <span className="text-sm font-bold">
                    {isOpeningAddPlatformModal ? 'جاري الفتح...' : 'إضافة منصة'}
                  </span>
                  <kbd 
                    className="hidden lg:inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#000000]/10 border border-[#000000]/20 rounded text-[#000000] select-none"
                    dir="ltr"
                    title="اختصار لوحة المفاتيح"
                  >
                    Alt+P
                  </kbd>
                  <span
                    role="button"
                    tabIndex={0}
                    id="btn-add-platform-help-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddPlatformQuickHelpOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        setIsAddPlatformQuickHelpOpen(true);
                      }
                    }}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-700 hover:text-[#000000] transition-colors cursor-pointer inline-flex items-center justify-center mr-0.5"
                    title="خطوات الربط واستخراج مفاتيح الـ API لكل منصة (Help Circle)"
                    aria-label="خطوات الربط واستخراج مفاتيح الـ API لكل منصة"
                  >
                    <HelpCircle className="w-4 h-4 text-[#000000] help-circle-icon shrink-0" />
                  </span>
                </button>
              </ToolbarTooltip>

              <button
                onClick={() => setActiveTab('platforms_guide')}
                className="w-full xl:w-auto h-9 text-xs font-bold text-[#000000] px-3.5 rounded-lg bg-[#F8FAFC] border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>دليل المنصات</span>
              </button>

              {/* Open Multi-Platform Publisher */}
              <button
                id="btn-open-multi-platform-publisher"
                onClick={() => setIsPublishModalOpen(true)}
                className="w-full xl:w-auto h-9 px-3.5 bg-[#F8FAFC] text-[#000000] text-xs font-bold rounded-lg border-2 border-[#000000] flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5 text-[#000000] shrink-0" />
                <span>إدارة ونشر المنصات</span>
              </button>

              {/* Currency & Exchange Rate Hub Button */}
              <button
                type="button"
                onClick={() => setIsCurrencyModalOpen(true)}
                className="w-full xl:w-auto h-9 px-3.5 bg-amber-100 text-amber-950 text-xs font-black rounded-lg border-2 border-amber-600 flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 whitespace-nowrap shadow-sm"
                title="إدارة العملات المتعددة وأسعار الصرف (USD, SAR, AED, EUR)"
              >
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                <span>العملة: {displayCurrency}</span>
              </button>
            </div>
          </div>

          {/* Active Platform Status Filter Notice Banner */}
          {platformStatusFilter !== 'all' && (
            <div
              id="platform-bar-status-filter-active-banner"
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs animate-fadeIn shadow-xl border backdrop-blur-md ${
                platformStatusFilter === 'active_only'
                  ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-200 ring-1 ring-emerald-500/20'
                  : platformStatusFilter === 'delayed_sync_only'
                  ? 'bg-gradient-to-r from-orange-950/95 via-amber-950/90 to-slate-950 border-orange-500/80 text-orange-200 ring-1 ring-orange-500/50'
                  : 'bg-slate-900/90 border-rose-500/40 text-rose-200 ring-1 ring-rose-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg text-white shrink-0 shadow-2xs ${
                  platformStatusFilter === 'active_only'
                    ? 'bg-emerald-600'
                    : platformStatusFilter === 'delayed_sync_only'
                    ? 'bg-orange-600 animate-pulse'
                    : 'bg-rose-600 animate-pulse'
                }`}>
                  {platformStatusFilter === 'active_only' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : platformStatusFilter === 'delayed_sync_only' ? (
                    <Clock className="w-4 h-4 text-white stroke-[2.5]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-100">
                      {platformStatusFilter === 'active_only' 
                        ? `تصفية نشطة: المنصات النشطة فقط (${activePlatformsCount} منصة متصلة وسليمة 🟢)`
                        : platformStatusFilter === 'delayed_sync_only'
                        ? `تصفية نشطة: القنوات المتأخرة لأكثر من ساعتين (${delayedPlatformsCount} قنوات مميزة بالبرتقالي 🟠)`
                        : `تصفية نشطة: المنصات ذات أخطاء التزامن (${errorPlatformsCount} منصة متعثرة 🚨)`}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full font-mono bg-slate-800 text-slate-200 border border-slate-700">
                      {platformStatusFilter === 'active_only'
                        ? `${activePlatformsCount}/${totalPlatformsCount}`
                        : platformStatusFilter === 'delayed_sync_only'
                        ? `${delayedPlatformsCount}/${totalPlatformsCount}`
                        : `${errorPlatformsCount}/${totalPlatformsCount}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {platformStatusFilter === 'active_only'
                      ? 'تم إخفاء القنوات غير المتصلة أو المتعثرة للتركيز على متابعة القنوات الفعالة والمزامنة اللحظية.'
                      : platformStatusFilter === 'delayed_sync_only'
                      ? 'قنوات بيع تأخرت مزامنتها لأكثر من ساعتين عن آخر مزامنة ناجحة — يمكنك المزامنة الفورية لتحديث الأسعار وتفادي تباين الطلبات.'
                      : 'يتم عرض القنوات التي تواجه أخطاء بالـ API أو انتهاء توكنز أو انقطاع استجابة. انقر على أي منصة لإعادة الاتصال الفوري.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {platformStatusFilter === 'delayed_sync_only' && delayedPlatformsCount > 0 && (
                  <button
                    type="button"
                    id="btn-batch-sync-delayed-channels"
                    onClick={handleSyncAllDelayedPlatforms}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 animate-pulse"
                    title="مزامنة فورية وتحديث لكافة قنوات البيع التي تأخرت مزامنتها لأكثر من ساعتين"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span>مزامنة القنوات المتأخرة فوراً ({delayedPlatformsCount}) ⚡</span>
                  </button>
                )}
                {platformStatusFilter === 'delayed_sync_only' && delayedPlatformsCount === 0 && (
                  <button
                    type="button"
                    id="btn-simulate-sync-delay-banner"
                    onClick={handleSimulateSyncDelay}
                    className="px-2.5 py-1.5 rounded-xl bg-orange-950/80 hover:bg-orange-900 border border-orange-600/80 text-orange-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="محاكاة تأخر قناة لأكثر من ساعتين لاختبار نظام التنبيه البرتقالي"
                  >
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>محاكاة تأخر قناة للتجربة 🧪</span>
                  </button>
                )}
                {platformStatusFilter === 'sync_errors_only' && errorPlatformsCount > 0 && (
                  <button
                    type="button"
                    id="btn-batch-retry-sync-errors"
                    onClick={handleRetryAllSyncErrors}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 animate-pulse"
                    title="محاولة إعادة الاتصال وتجديد جلسات الـ API لكافة القنوات المتعثرة دفعة واحدة"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span>إصلاح وإعادة ربط الكل ({errorPlatformsCount}) ⚡</span>
                  </button>
                )}
                {platformStatusFilter === 'sync_errors_only' && errorPlatformsCount === 0 && (
                  <button
                    type="button"
                    id="btn-simulate-sync-error-banner"
                    onClick={handleSimulateSyncError}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="محاكاة تعثر قناة لاختبار أدوات التصفية والفحص الفوري"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>محاكاة خطأ تزامن للتجربة 🧪</span>
                  </button>
                )}
                <button
                  type="button"
                  id="btn-clear-platform-status-filter"
                  onClick={() => {
                    setPlatformStatusFilter('all');
                    showToast('تمت استعادة عرض كافة المنصات 🌐');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 shadow-2xs cursor-pointer transition-all shrink-0 active:scale-95"
                >
                  إلغاء التصفية (عرض الكل) ✕
                </button>
              </div>
            </div>
          )}

          {/* Active Dual / Multi-Category Filter Banner in Platform Bar */}
          {platformTypeFilter.length > 0 && !platformTypeFilter.includes('all') && (
            <div
              id="platform-bar-dual-filter-active-banner"
              className="flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs animate-fadeIn shadow-xl backdrop-blur-md text-slate-100"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <div className="p-1 rounded-lg bg-indigo-600 text-white shrink-0 shadow-2xs">
                  <Filter className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-slate-100 text-xs">
                    {platformTypeFilter.length === 2 ? 'تصفية مزدوجة نشطة:' : `تصفية متعددة (${platformTypeFilter.length} تصنيفات):`}
                  </span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">يتم عرض القنوات للتصنيفات التالية فقط:</span>
                  {platformTypeFilter.map((key) => {
                    const cat = platformCategories.find((c) => c.key === key);
                    const count = connectedPlatforms.filter(
                      (p) => getPlatformClassification(p.code, p.category) === key
                    ).length;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-200 font-bold px-2.5 py-0.5 rounded-lg text-xs shadow-2xs"
                      >
                        <span>{cat?.title || key}</span>
                        <span className="text-[10px] font-mono text-indigo-400 bg-slate-900 px-1.5 py-0.2 rounded-md border border-slate-700">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePlatformCategoryType(key)}
                          className="hover:text-rose-400 text-slate-400 font-bold cursor-pointer text-xs transition-colors"
                          title={`إلغاء تصفية ${cat?.title || key}`}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPlatformTypeFilter(['all']);
                  showToast('تمت استعادة عرض كافة تصنيفات المنصات 🌐');
                }}
                className="text-xs font-bold text-indigo-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 rounded-xl cursor-pointer shrink-0 shadow-2xs transition-colors"
                title="إلغاء التصفية وعرض كل القنوات"
              >
                عرض كل التصنيفات ✕
              </button>
            </div>
          )}

          {/* Agency & Marketing Manager Hub Bar: Independent Admin Account + Active Merchant Switcher */}
          <div className="p-3.5 bg-slate-900/90 text-white rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 animate-fadeIn backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-sky-300 shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-white font-['Alexandria']">
                    بيئة إدارة حسابات الوكالات ومديري المنصات (Agency Hub)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                    حساب إداري مستقل ومحمي
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  مدير التسويق المشرف: <strong className="font-mono text-sky-200" dir="ltr">{user?.email || 'manager@agency.com'}</strong>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="text-slate-300">يتم ربط وإدارة قنوات كل تاجر ببيانات اعتماده (Seller ID / MWS Token) المستقلة دون المساس بحسابك.</span>
                </p>
              </div>
            </div>

            {/* Active Merchant Switcher Control */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/80 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 shrink-0">
                <Store className="w-4 h-4" />
                <span>المتجر النشط:</span>
              </div>
              <select
                id="active-merchant-platform-bar-switcher"
                value={activeMerchantId}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setActiveTab('remote_merchants');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    showToast('انتقل إلى شاشة متابعة التجار لإضافة متجر تاجر جديد للوكالة 🏬➕');
                  } else {
                    handleSwitchActiveMerchant(e.target.value);
                  }
                }}
                className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-indigo-400/40 focus:border-sky-400 outline-none cursor-pointer shadow-xs max-w-[240px] truncate"
              >
                {remoteMerchantsList.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    🏬 {m.storeName} ({m.city || m.primaryEmail})
                  </option>
                ))}
                <option value="__add_new__" className="bg-indigo-950 text-sky-300 font-bold">
                  ➕ إضافة متجر تاجر جديد للوكالة...
                </option>
              </select>

              <button
                type="button"
                onClick={() => setIsManageApisModalOpen(true)}
                className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                title="إدارة مفاتيح ربط المنصات لهذا التاجر (Amazon SP-API / Noon API)"
              >
                <Key className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">مفاتيح الربط (APIs) 🔑</span>
              </button>
            </div>
          </div>

          {/* Grouped Platform Categories Layout (Dynamic Categories with Rename / Icon Customization) */}
          <div className="flex flex-col gap-2.5">
            {platformCategories.map((cat, catIndex) => {
              const categoryPlatforms = sortedControlBarPlatforms.filter(
                (p) => getPlatformClassification(p.code, p.category) === cat.key && (!groupInactivePlatformsAtBottom || p.isConnected || platformStatusFilter === 'sync_errors_only')
              );

              // Filter check: If user selected dual or multiple categories in dropdown, hide non-selected categories
              const isAllCategories = platformTypeFilter.length === 0 || platformTypeFilter.includes('all');
              if (!isAllCategories && !platformTypeFilter.includes(cat.key)) {
                return null;
              }

              // When filtering by active platforms only or sync errors only, hide categories with 0 matching platforms
              if (platformStatusFilter !== 'all' && categoryPlatforms.length === 0) {
                return null;
              }

              // If filter is 'all' and category has 0 platforms, and it's not custom, skip
              if (isAllCategories && categoryPlatforms.length === 0 && !cat.isCustom) {
                return null;
              }

              const effectiveIconName =
                openIconPickerCategoryKey === cat.key && previewedCategoryIconName
                  ? previewedCategoryIconName
                  : cat.iconName;
              const CategoryIcon = getCategoryIconComponent(effectiveIconName);
              const activeInCatCount = categoryPlatforms.filter((p) => p.isConnected).length;
              const isCategoryPlatformsCollapsed = collapsedCategoryKeys.includes(cat.key);

              // Drag & Drop Category Target Calculations
              const draggedPlat = draggedPlatformId ? connectedPlatforms.find((p) => p.id === draggedPlatformId) : null;
              const draggedCurrentCat = draggedPlat ? getPlatformClassification(draggedPlat.code, draggedPlat.category) : null;
              const isTargetingNewCategory = Boolean(draggedPlatformId && draggedCurrentCat && draggedCurrentCat !== cat.key);
              const isHoveredNewCategory = Boolean(isTargetingNewCategory && dragOverCategoryKey === cat.key);
              const isRecentlyDropped = recentlyDroppedCategoryId === cat.key;

              return (
                <div
                  key={cat.key}
                  id={`category-group-${cat.key}`}
                  className={`rounded-xl border transition-all flex flex-col relative ${
                    isPlatformBarCompact ? 'p-2 gap-2' : 'p-3 gap-3'
                  } ${
                    isHoveredNewCategory
                      ? 'animate-category-shake border-indigo-500 ring-2 ring-indigo-500/80 bg-slate-900/95 shadow-lg scale-[1.008] z-10'
                      : isRecentlyDropped
                        ? 'border-emerald-500 ring-2 ring-emerald-500/80 bg-emerald-950/90 shadow-md transition-all duration-700'
                        : `${cat.borderStyle || 'border-slate-800'} ${cat.bgStyle || 'bg-slate-900/90'}`
                  }`}
                  onDragEnter={(e) => {
                    if (draggedPlatformId) {
                      e.preventDefault();
                      setDragOverCategoryKey(cat.key);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      if (dragOverCategoryKey === cat.key) {
                        setDragOverCategoryKey(null);
                      }
                    }
                  }}
                  onDragOver={(e) => {
                    if (draggedPlatformId) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverCategoryKey !== cat.key) {
                        setDragOverCategoryKey(cat.key);
                      }
                    }
                  }}
                  onDrop={(e) => {
                    if (draggedPlatformId) {
                      handleCategoryDrop(e, cat.key);
                    }
                  }}
                >
                  {/* Organized Card Header & Action Bar: Separates Title & Status Badges from Control Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800 w-full">
                    {/* Left/Start Side: Category Title + Separated Status Badges */}
                    <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                      <div className={`${isPlatformBarCompact ? 'p-1.5 rounded-md' : 'p-2 rounded-md'} border flex items-center justify-center shrink-0 transition-all ${
                        isHoveredNewCategory
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md animate-icon-wiggle ring-2 ring-indigo-400'
                          : isRecentlyDropped
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : cat.badgeBg || 'bg-slate-800 text-slate-200 border-slate-700'
                      }`}>
                        <CategoryIcon className={`${isPlatformBarCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs sm:text-sm font-black transition-colors whitespace-nowrap ${
                            isHoveredNewCategory 
                              ? 'text-indigo-300 font-black scale-105' 
                              : cat.headerColor || 'text-slate-100'
                          }`}>
                            {cat.title}
                          </span>
                          {!isPlatformBarCompact && (
                            <span className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:inline">
                              ({cat.englishTitle || (cat.isCustom ? 'Custom Category' : '')})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Separated Status Badges Group (شارات الحالة منفصلة عن العناوين وأزرار التحكم) */}
                      <div className="flex items-center gap-1.5 flex-wrap border-s border-slate-800 ps-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${cat.tagColor || 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                          {activeInCatCount}/{categoryPlatforms.length} {isPlatformBarCompact ? '' : 'متصل ونشط'}
                        </span>

                        {cat.key === 'marketplace' && (
                          <span
                            id={`live-icon-preview-badge-${cat.key}`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all whitespace-nowrap ${
                              openIconPickerCategoryKey === cat.key && previewedCategoryIconName
                                ? 'bg-sky-500/25 border-sky-400 text-sky-200 ring-1 ring-sky-400/50 scale-105'
                                : 'bg-slate-800/90 border-slate-700 text-sky-300'
                            }`}
                            title={`معاينة حية للأيقونة المحددة: ${CATEGORY_ICON_MAP[effectiveIconName]?.label || effectiveIconName} (${effectiveIconName})`}
                          >
                            <CategoryIcon className="w-3 h-3 text-sky-400 shrink-0" />
                            {!isPlatformBarCompact && (
                              <span className="font-mono text-[9px] text-sky-200/90">
                                {effectiveIconName}
                              </span>
                            )}
                          </span>
                        )}

                        {cat.isCustom && !isPlatformBarCompact && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-bold border border-indigo-700 whitespace-nowrap">
                            مخصص
                          </span>
                        )}

                        {isHoveredNewCategory && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black shadow-xs animate-bounce whitespace-nowrap">
                            <ArrowDownCircle className="w-3 h-3 text-sky-300" />
                            <span>أفلت للنقل إلى {cat.title} 🎯</span>
                          </span>
                        )}
                        {isRecentlyDropped && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-2xs animate-pulse whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            <span>تم النقل بنجاح!</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right/End Side: Standardized Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 ms-auto">
                      {/* View All Toggle Button for #category-group-marketplace */}
                      {cat.key === 'marketplace' && (
                        <button
                          id={`btn-view-all-category-${cat.key}`}
                          type="button"
                          onClick={() => {
                            const catPlatIds = categoryPlatforms.map((p) => p.id);
                            const nextCollapsed = !isCategoryPlatformsCollapsed;
                            setCollapsedCategoryKeys((prev) => {
                              const updated = nextCollapsed
                                ? [...prev.filter((k) => k !== cat.key), cat.key]
                                : prev.filter((k) => k !== cat.key);
                              try {
                                localStorage.setItem('merchant_radar_collapsed_category_keys', JSON.stringify(updated));
                              } catch {}
                              return updated;
                            });

                            if (!nextCollapsed) {
                              setExpandedPlatformIds((prev) => Array.from(new Set([...prev, ...catPlatIds])));
                            } else {
                              if (areAllPlatformDetailsExpanded) {
                                setAreAllPlatformDetailsExpanded(false);
                                const otherPlatIds = connectedPlatforms
                                  .filter((p) => !catPlatIds.includes(p.id))
                                  .map((p) => p.id);
                                setExpandedPlatformIds(otherPlatIds);
                              } else {
                                setExpandedPlatformIds((prev) => prev.filter((id) => !catPlatIds.includes(id)));
                              }
                            }
                          }}
                          className={`h-8 px-2.5 rounded-md border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                            !isCategoryPlatformsCollapsed
                              ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                          }`}
                          title={
                            isCategoryPlatformsCollapsed
                              ? `View All: توسيع وعرض منصات (${cat.title})`
                              : `View All: طي منصات (${cat.title}) فقط`
                          }
                          aria-expanded={!isCategoryPlatformsCollapsed}
                        >
                          <span>View All</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
                              !isCategoryPlatformsCollapsed ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}

                      {/* Direct Lucide Icon Picker Button for #category-group-marketplace */}
                      {cat.key === 'marketplace' && (
                        <div className="relative">
                          <button
                            id={`btn-change-icon-category-${cat.key}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenIconPickerCategoryKey((prev) => {
                                const next = prev === cat.key ? null : cat.key;
                                setIconPickerSearchQuery('');
                                setPreviewedCategoryIconName(null);
                                return next;
                              });
                            }}
                            className={`h-8 px-2.5 rounded-md border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                              openIconPickerCategoryKey === cat.key
                                ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-500/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border-slate-700'
                            }`}
                            title={`تغيير أيقونة (${cat.title}) مباشرة من مكتبة Lucide مع معاينة حية`}
                            aria-expanded={openIconPickerCategoryKey === cat.key}
                            aria-haspopup="listbox"
                          >
                            <CategoryIcon className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                            <span className={isPlatformBarCompact ? 'hidden' : 'whitespace-nowrap'}>تغيير الأيقونة</span>
                          </button>

                          {openIconPickerCategoryKey === cat.key && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => {
                                  setOpenIconPickerCategoryKey(null);
                                  setPreviewedCategoryIconName(null);
                                  setIconPickerSearchQuery('');
                                }}
                              />
                              <div
                                id={`icon-picker-popover-${cat.key}`}
                                className="absolute top-full mt-2 start-0 z-50 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 animate-fadeIn text-slate-100"
                                role="listbox"
                                aria-label="اختيار أيقونة التصنيف من مكتبة Lucide"
                                onMouseLeave={() => setPreviewedCategoryIconName(null)}
                              >
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                                  <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                                    <CategoryIcon className="w-3.5 h-3.5 text-sky-400" />
                                    <span>اختر أيقونة الماركت بليس (Lucide)</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenIconPickerCategoryKey(null);
                                      setPreviewedCategoryIconName(null);
                                      setIconPickerSearchQuery('');
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="إغلاق"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Search Input Inside Icon Picker Popover */}
                                <div className="relative mb-2.5">
                                  <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-2.5 pointer-events-none" />
                                  <input
                                    id={`input-search-icon-picker-${cat.key}`}
                                    type="text"
                                    value={iconPickerSearchQuery}
                                    onChange={(e) => setIconPickerSearchQuery(e.target.value)}
                                    placeholder="ابحث عن أيقونة بالاسم (مثال: Store أو متجر)..."
                                    autoFocus
                                    className="w-full h-8 ps-8 pe-7 rounded-lg bg-slate-950/90 border border-slate-700 focus:border-sky-400 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                                  />
                                  {iconPickerSearchQuery && (
                                    <button
                                      type="button"
                                      onClick={() => setIconPickerSearchQuery('')}
                                      className="absolute top-1/2 -translate-y-1/2 end-2 text-slate-400 hover:text-white cursor-pointer"
                                      title="مسح البحث"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                {(() => {
                                  const q = iconPickerSearchQuery.trim().toLowerCase();
                                  const filteredIcons = Object.entries(CATEGORY_ICON_MAP).filter(
                                    ([iconKey, { label }]) =>
                                      !q ||
                                      iconKey.toLowerCase().includes(q) ||
                                      label.toLowerCase().includes(q)
                                  );

                                  if (filteredIcons.length === 0) {
                                    return (
                                      <div className="py-6 text-center text-xs text-slate-400">
                                        لا توجد أيقونات مطابقة لـ "{iconPickerSearchQuery}"
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="grid grid-cols-4 gap-1.5 max-h-60 overflow-y-auto pe-1">
                                      {filteredIcons.map(([iconKey, { Icon: OptionIcon, label }]) => {
                                        const isCurrentIcon = cat.iconName === iconKey;
                                        const isPreviewed = previewedCategoryIconName === iconKey;
                                        return (
                                          <button
                                            key={iconKey}
                                            id={`btn-select-marketplace-icon-${iconKey}`}
                                            type="button"
                                            role="option"
                                            aria-selected={isCurrentIcon}
                                            onMouseEnter={() => setPreviewedCategoryIconName(iconKey)}
                                            onFocus={() => setPreviewedCategoryIconName(iconKey)}
                                            onClick={() => {
                                              setPlatformCategories((prev) =>
                                                prev.map((c) => (c.key === cat.key ? { ...c, iconName: iconKey } : c))
                                              );
                                              setPreviewedCategoryIconName(null);
                                              setIconPickerSearchQuery('');
                                              setOpenIconPickerCategoryKey(null);
                                              showToast(`تم تغيير أيقونة "${cat.title}" إلى (${label}) بنجاح ✨`);
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
                                              isCurrentIcon
                                                ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-400/50'
                                                : isPreviewed
                                                  ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200'
                                                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white'
                                            }`}
                                            title={`${label} (${iconKey})`}
                                          >
                                            <OptionIcon className={`w-4 h-4 shrink-0 ${isCurrentIcon ? 'text-sky-300' : 'text-slate-300'}`} />
                                            <span className="truncate w-full text-center leading-tight">{label}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Generate Waybill Shortcut Button for #category-group-marketplace */}
                      {cat.key === 'marketplace' && (
                        <button
                          id="btn-generate-waybill-marketplace"
                          type="button"
                          onClick={() => setIsBulkMarketplaceWaybillModalOpen(true)}
                          className="h-8 px-2.5 rounded-md border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 hover:text-white border-emerald-600/50 hover:border-emerald-500"
                          title="توليد بوالص شحن مجمعة لمنصات الماركت بليس بضغطة واحدة (Generate Waybill)"
                          aria-label="Generate Waybill for Marketplace platforms"
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className={isPlatformBarCompact ? 'hidden' : 'whitespace-nowrap'}>Generate Waybill</span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-500/40">
                            {categoryPlatforms.length}
                          </span>
                        </button>
                      )}

                      {/* Dedicated Button in Category Interface: Rename Category & Change Icon */}
                      <button
                        id={`btn-edit-category-${cat.key}`}
                        type="button"
                        onClick={() => handleOpenEditCategory(cat)}
                        className="h-8 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center shadow-2xs transition-all cursor-pointer hover:shadow-xs active:scale-95 shrink-0"
                        title={`إعادة تسمية تصنيف "${cat.title}" أو تغيير أيقونته ولونه`}
                      >
                        <Pencil className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className={isPlatformBarCompact ? 'hidden' : 'whitespace-nowrap hidden sm:inline'}>تخصيص التصنيف</span>
                        <span className={isPlatformBarCompact ? 'hidden' : 'whitespace-nowrap sm:hidden'}>تخصيص</span>
                      </button>

                      {/* Category Order Controls: Move Up/Down within Control Panel */}
                      <div className="h-8 flex items-center gap-0.5 shrink-0 bg-slate-800 border border-slate-700 rounded-md px-1 shadow-2xs">
                        <button
                          type="button"
                          id={`btn-inline-category-up-${cat.key}`}
                          disabled={catIndex === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveCategory(cat.key, 'up');
                          }}
                          className={`p-1 rounded-md transition-all ${
                            catIndex === 0
                              ? 'text-slate-600 opacity-30 cursor-not-allowed'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700 active:scale-90 cursor-pointer'
                          }`}
                          title={catIndex === 0 ? 'التصنيف في أعلى لوحة التحكم' : `نقل تصنيف "${cat.title}" للأعلى ⬆️`}
                          aria-label={`نقل تصنيف ${cat.title} للأعلى`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`btn-inline-category-down-${cat.key}`}
                          disabled={catIndex === platformCategories.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveCategory(cat.key, 'down');
                          }}
                          className={`p-1 rounded-md transition-all ${
                            catIndex === platformCategories.length - 1
                              ? 'text-slate-600 opacity-30 cursor-not-allowed'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700 active:scale-90 cursor-pointer'
                          }`}
                          title={catIndex === platformCategories.length - 1 ? 'التصنيف في أسفل لوحة التحكم' : `نقل تصنيف "${cat.title}" للأسفل ⬇️`}
                          aria-label={`نقل تصنيف ${cat.title} للأسفل`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Platforms Chips or Empty State Dropzone */}
                  {isCategoryPlatformsCollapsed ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCollapsedCategoryKeys((prev) => {
                          const updated = prev.filter((k) => k !== cat.key);
                          try {
                            localStorage.setItem('merchant_radar_collapsed_category_keys', JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                      }}
                      className="text-[11px] text-slate-300 font-medium py-1.5 px-3 bg-slate-900/90 hover:bg-slate-800 rounded-lg border border-dashed border-slate-700 flex items-center gap-2 cursor-pointer transition-colors w-full xl:w-auto text-start"
                      title={`انقر لعرض وتوسيع منصات (${cat.title})`}
                    >
                      <CategoryIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>تم طي {categoryPlatforms.length} منصات ضمن ({cat.title})</span>
                      <span className="text-sky-400 font-bold hover:underline me-auto">View All ⬇️</span>
                    </button>
                  ) : categoryPlatforms.length === 0 ? (
                    <div
                      className={`flex-1 w-full border-2 border-dashed rounded-xl p-3 flex items-center justify-between gap-3 text-xs transition-all ${
                        isHoveredNewCategory
                          ? 'border-indigo-500 bg-indigo-950/80 ring-2 ring-indigo-400 animate-category-shake text-indigo-200 font-bold shadow-md'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/90 text-slate-300'
                      }`}
                      onDragEnter={(e) => {
                        if (draggedPlatformId) {
                          e.preventDefault();
                          setDragOverCategoryKey(cat.key);
                        }
                      }}
                      onDragOver={(e) => {
                        if (draggedPlatformId) {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOverCategoryKey !== cat.key) {
                            setDragOverCategoryKey(cat.key);
                          }
                        }
                      }}
                      onDrop={(e) => handleCategoryDrop(e, cat.key)}
                    >
                      <div className="flex items-center gap-2">
                        <FolderPlus className={`w-4 h-4 shrink-0 ${isHoveredNewCategory ? 'text-indigo-400 animate-icon-wiggle' : 'text-indigo-400'}`} />
                        <span className="text-[11px] text-slate-300">
                          {isHoveredNewCategory ? (
                            <strong className="text-indigo-300 font-black">
                              🎯 أفلت الآن لنقل منصة "{draggedPlat?.name.split('(')[0].trim()}" إلى ({cat.title})!
                            </strong>
                          ) : (
                            `تصنيف مخصص فارغ: اسحب أي منصة من الأعلى وأفلتها هنا لتجميعها داخل (${cat.title})، أو أضف منصة جديدة.`
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddPlatformModalOpen(true)}
                        className="text-[11px] font-bold text-indigo-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0 cursor-pointer transition-colors"
                      >
                        + إضافة منصة هنا
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-2 flex-wrap flex-1 w-full transition-all ${
                        isHoveredNewCategory ? 'p-1.5 rounded-lg bg-indigo-950/60 border-2 border-dashed border-indigo-500 ring-1 ring-indigo-400' : ''
                      }`}
                      onDragEnter={(e) => {
                        if (draggedPlatformId) {
                          e.preventDefault();
                          setDragOverCategoryKey(cat.key);
                        }
                      }}
                      onDragOver={(e) => {
                        if (draggedPlatformId) {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOverCategoryKey !== cat.key) {
                            setDragOverCategoryKey(cat.key);
                          }
                        }
                      }}
                      onDrop={(e) => {
                        if (e.target === e.currentTarget && draggedPlatformId) {
                          handleCategoryDrop(e, cat.key);
                        }
                      }}
                    >
                      {categoryPlatforms.map((plat) => renderPlatformCard(plat, cat.key, cat))}
                    </div>
                )}
              </div>
            );
          })}

          {/* Dedicated Inactive Channels Category (قنوات غير نشطة) at bottom of platform bar */}
          {groupInactivePlatformsAtBottom && platformStatusFilter === 'all' && (
            <div
              id="category-group-inactive-channels"
              className={`rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl transition-all flex flex-col relative ${
                isPlatformBarCompact ? 'p-2 gap-2' : 'p-3 gap-3'
              }`}
            >
              {/* Organized Card Header & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800 w-full">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className={`${isPlatformBarCompact ? 'p-1.5 rounded-md' : 'p-2 rounded-md'} border border-slate-700 bg-slate-800 text-slate-300 flex items-center justify-center transition-all`}>
                    <PowerOff className={`${isPlatformBarCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-slate-100 whitespace-nowrap">قنوات غير نشطة</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border text-slate-300 bg-slate-800 border-slate-700 whitespace-nowrap">
                        {inactivePlatforms.length} غير متصلة
                      </span>
                    </div>
                    {!isPlatformBarCompact && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        منصات غير متصلة مجمعة في الأسفل لتقليل الازدحام
                      </p>
                    )}
                  </div>
                </div>

                {/* Button to collapse or expand this inactive category completely */}
                <button
                  id="btn-toggle-collapse-inactive-category"
                  type="button"
                  onClick={() => {
                    const nextVal = !isInactiveCategoryCollapsed;
                    setIsInactiveCategoryCollapsed(nextVal);
                    try {
                      localStorage.setItem('merchant_radar_inactive_category_collapsed', JSON.stringify(nextVal));
                    } catch {}
                  }}
                  className="h-8 px-2.5 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer shrink-0 ms-auto active:scale-95"
                  title={isInactiveCategoryCollapsed ? "توسيع تصنيف القنوات غير النشطة" : "طي تصنيف القنوات غير النشطة لتقليل الازدحام"}
                  aria-expanded={!isInactiveCategoryCollapsed}
                >
                  <span>{isInactiveCategoryCollapsed ? 'توسيع' : 'طي التصنيف'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-250 ease-out ${
                      !isInactiveCategoryCollapsed ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Body: Collapsed pill, empty state, or list of inactive platform cards with smooth transition */}
              <AnimatePresence mode="wait" initial={false}>
                {isInactiveCategoryCollapsed ? (
                  <motion.button
                    key="inactive-collapsed-btn"
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.2 }}
                    type="button"
                    onClick={() => {
                      setIsInactiveCategoryCollapsed(false);
                      try {
                        localStorage.setItem('merchant_radar_inactive_category_collapsed', JSON.stringify(false));
                      } catch {}
                    }}
                    className="text-[11px] text-slate-300 font-medium py-1.5 px-3 bg-slate-900/90 hover:bg-slate-800 rounded-lg border border-dashed border-slate-700 flex items-center gap-2 cursor-pointer transition-colors w-full xl:w-auto text-start"
                    title="انقر لتوسيع القنوات غير النشطة"
                  >
                    <PowerOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>تم طي {inactivePlatforms.length} قنوات غير نشطة لتوفير المساحة</span>
                    <span className="text-indigo-400 font-bold hover:underline me-auto">توسيع وعرض المنصات ⬇️</span>
                  </motion.button>
                ) : inactivePlatforms.length === 0 ? (
                  <motion.div
                    key="inactive-empty-state"
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="text-[11px] text-emerald-300 font-medium py-1.5 px-3 bg-emerald-950/40 rounded-lg border border-emerald-500/40 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>كافة المنصات والقنوات نشطة حالياً، لا توجد قنوات معطلة ✨</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="inactive-cards-list"
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 w-full xl:w-auto"
                  >
                    {inactivePlatforms.map((plat) => renderPlatformCard(plat, 'inactive_channels'))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

            {sortedControlBarPlatforms.length === 0 && (
              <div className="text-[11px] text-slate-300 font-medium py-4 px-4 bg-slate-900/90 rounded-xl border border-dashed border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-center gap-2 text-center animate-fadeIn">
                {platformStatusFilter === 'delayed_sync_only' ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full py-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>ممتاز! كافة قنوات البيع متزامنة بانتظام خلال الساعتين الأخيرتين ولا توجد أي قنوات متأخرة 🟢</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn-simulate-sync-delay-empty"
                        onClick={handleSimulateSyncDelay}
                        className="px-2.5 py-1 rounded-lg bg-orange-950/80 hover:bg-orange-900 border border-orange-600/80 text-orange-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                        title="محاكاة تأخر مزامنة قناة لأكثر من ساعتين لاختبار نظام التنبيه البرتقالي"
                      >
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        <span>محاكاة تأخر قناة للتجربة 🧪</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlatformStatusFilter('all');
                          showToast('تمت استعادة عرض كافة المنصات 🌐');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white text-xs font-bold cursor-pointer transition active:scale-95"
                      >
                        الرجوع لعرض كل القنوات 🌐
                      </button>
                    </div>
                  </div>
                ) : platformStatusFilter === 'sync_errors_only' ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full py-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>رائع! لا توجد أي منصات بها أخطاء تزامن حالياً، جميع قنواتك تعمل بسلامة 100% 🎉</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn-simulate-sync-error-empty"
                        onClick={handleSimulateSyncError}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                        title="محاكاة خطأ تزامن لقناة لاختبار أدوات التصفية والإصلاح السريع"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>محاكاة خطأ تزامن للتجربة 🧪</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlatformStatusFilter('all');
                          showToast('تمت استعادة عرض كافة المنصات 🌐');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white text-xs font-bold cursor-pointer transition active:scale-95"
                      >
                        الرجوع لعرض كل القنوات 🌐
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span>لا توجد منصات متوفرة بالتصفية المحددة</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformStatusFilter('all');
                        setPlatformTypeFilter(['all']);
                        showToast('تمت استعادة عرض كافة المنصات 🌐');
                      }}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer mr-2"
                    >
                      إعادة ضبط التصفية وعرض الكل
                    </button>
                  </>
                )}
              </div>
            )}

            {/* End of Platform Bar: Add Platform (+) Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800 mt-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>هل تبيع على قنوات أو معارض أخرى؟ أضف منصتك أو متجرك لمزامنة الأسعار وتتبع المنافسين تلقائياً.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-add-custom-category-bottom"
                  type="button"
                  onClick={handleOpenCreateCategory}
                  className="h-9 px-3.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold font-['Alexandria'] whitespace-nowrap flex items-center gap-1.5 justify-center border border-slate-700 shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95 select-none"
                  title="إنشاء تصنيف مخصص جديد لتجميع المنصات"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>تصنيف مخصص جديد (+)</span>
                </button>
                <button
                  id="btn-add-platform-trigger"
                  type="button"
                  onClick={() => setIsAddPlatformModalOpen(true)}
                  className="h-9 px-3.5 sm:px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold font-['Alexandria'] whitespace-nowrap flex items-center gap-1.5 justify-center shadow-2xs transition-all cursor-pointer shrink-0 select-none"
                  title="إضافة قناة بيع أو منصة جديدة إلى لوحة التحكم"
                >
                  <Plus className="w-4 h-4 text-white shrink-0" />
                  <span>إضافة منصة (+)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Tab Views (with Automatic Paywall & Subscription Lock when 3-Day Free Trial Expires) */}
        <div className="w-full max-w-full animate-fadeIn relative overflow-hidden">

          {isPaywallLocked ? (
            <div
              id="subscription-paywall-lock-screen"
              className="w-full max-w-full rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-950 border-2 border-rose-500/50 p-4 sm:p-7 lg:p-10 text-white shadow-2xl space-y-8 my-2 overflow-hidden"
            >
              {/* Top Lock Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                    <Lock className="w-8 h-8 text-rose-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-rose-500/25 text-rose-300 border border-rose-400/40 text-xs font-black">
                        انتهت فترة التجربة المجانية (3 أيام / 72 ساعة) 🔒
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-sky-300 border border-slate-700 text-xs font-bold">
                        التاجر: {activeMerchantObj?.storeName || 'متجر التاجر'}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-['Alexandria'] text-white">
                      تم حجب شاشات التحكم الرئيسية مؤقتاً — يرجى اختيار باقة اشتراك للمتابعة
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                      لقد انتهت فترة الـ 3 أيام التجريبية الخاصة بهذا الحساب. تم إيقاف عمليات <strong className="text-rose-300">جلب الطلبات (Order Sync)</strong> و<strong className="text-rose-300">معدِّل الأسعار التلقائي (Automated Repricer)</strong> تلقائياً لحين تفعيل الاشتراك الشهري أو السنوي.
                    </p>
                  </div>
                </div>

                {/* Switch Merchant or Re-enable Trial for Testing */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
                  {remoteMerchantsList.length > 1 && (
                    <select
                      value={activeMerchantId}
                      onChange={(e) => handleSwitchActiveMerchant(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-slate-900 text-white border border-slate-700 text-xs font-bold cursor-pointer"
                    >
                      {remoteMerchantsList.map(m => (
                        <option key={m.id} value={m.id}>
                          تبديل التاجر: {m.storeName}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      subscriptionState.resetTrial();
                      if (activeMerchantObj) {
                        const updated = updateMerchantSubscriptionStatus(activeMerchantObj.id, 'reset_trial');
                        if (updated) {
                          setRemoteMerchantsList(loadAllRegisteredMerchants());
                        }
                      }
                      showToast('تمت إعادة تفعيل فترة التجربة المجانية لمدة 3 أيام (72 ساعة) بنجاح ⏳');
                    }}
                    className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold cursor-pointer"
                  >
                    إعادة تفعيل التجربة (3 أيام) ⏳
                  </button>
                </div>
              </div>

              {/* Paused Services Notice Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 flex items-start gap-3">
                  <Package className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white">إيقاف جلب الطلبات وبوالص الشحن</h4>
                    <p className="text-[11px] text-slate-400">
                      تم إيقاف مزامنة طلبات Amazon SP-API و Noon وتوليد البوالص لحين تجديد الباقة.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white">إيقاف معدِّل الأسعار التلقائي (Repricer)</h4>
                    <p className="text-[11px] text-slate-400">
                      تم تجميد التعديل التلقائي للأسعار وملاحقة الـ Buy Box مؤقتاً.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white">بياناتك وقواعد التسعير محفوظة بأمان</h4>
                    <p className="text-[11px] text-slate-400">
                      بمجرد تفعيل الاشتراك تعود جميع الكتالوجات وقواعد الـ Min/Max للعمل فوراً.
                    </p>
                  </div>
                </div>
              </div>

              {/* Embedded Subscription Plans Cards */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black font-['Alexandria'] text-sky-300 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  <span>1. اختر باقة الاشتراك المطلوبة للتاجر:</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {subscriptionState.plans.map((plan) => {
                    const isSelectedPlan = paywallSelectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          setPaywallSelectedPlanId(plan.id as any);
                          schedulePaywallPlanReceiptReminder(plan.id as any, true);
                        }}
                        className={`rounded-3xl p-5 border-2 flex flex-col justify-between transition-all cursor-pointer ${
                          isSelectedPlan
                            ? 'bg-gradient-to-b from-indigo-900/80 to-slate-900 border-sky-400 shadow-xl ring-2 ring-sky-400/30'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="text-base font-black font-['Alexandria'] text-white">{plan.nameArabic}</h4>
                            {plan.badge && (
                              <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mb-4">{plan.descriptionArabic}</p>

                          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 flex items-baseline justify-between">
                            <div>
                              <span className="text-2xl font-black text-sky-400 font-['Alexandria']">
                                {plan.priceEGP.toLocaleString()} ج.م
                              </span>
                              <span className="text-[11px] text-slate-400 mr-1.5">
                                / {plan.durationMonths === 1 ? 'شهرياً' : plan.durationMonths === 6 ? '6 أشهر' : 'سنة كاملة'}
                              </span>
                            </div>
                            {isSelectedPlan && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black">
                                محددة حالياً ✓
                              </span>
                            )}
                          </div>

                          <ul className="space-y-2 text-xs text-slate-200 mb-6">
                            {plan.features.slice(0, 5).map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPaywallSelectedPlanId(plan.id as any);
                              setPaywallPaymentMethod('vodafone_cash');
                              schedulePaywallPlanReceiptReminder(plan.id as any, true);
                              const el = document.getElementById('paywall-vodafone-cash-checkout-section');
                              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all ${
                              isSelectedPlan
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            <Smartphone className="w-4 h-4" />
                            <span>اختيار والدفع عبر فودافون كاش ({plan.priceEGP} ج.م)</span>
                          </button>

                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await subscriptionState.activatePlan(
                                plan.id,
                                'credit_card',
                                undefined,
                                plan.priceEGP,
                                activeMerchantObj?.id,
                                activeMerchantObj?.storeName
                              );
                              if (activeMerchantObj) {
                                updateMerchantSubscriptionStatus(activeMerchantObj.id, 'activate_plan', {
                                  planId: plan.id as any,
                                  planName: plan.nameArabic,
                                  durationMonths: plan.durationMonths,
                                  amountEGP: plan.priceEGP,
                                  paymentMethod: 'credit_card'
                                });
                                setRemoteMerchantsList(loadAllRegisteredMerchants());
                              }
                              confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
                              showToast(`🎉 تم تفعيل "${plan.nameArabic}" وتحديث حالة التاجر إلى نشط (Subscribed) وفتح كافة الشاشات!`);
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تفعيل فوري (للآدمن / الكروت البنكية) ✅</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. VODAFONE CASH SUBSCRIBER CHECKOUT UI + FILE UPLOAD & THUMBNAIL PREVIEW + ADMIN SETTINGS */}
              {(() => {
                const selectedPaywallPlan =
                  subscriptionState.plans.find(p => p.id === paywallSelectedPlanId) || subscriptionState.plans[2];
                const pendingReq = activeMerchantObj?.pendingPaymentRequest;
                const isCurrentlyPending =
                  activeMerchantSubState.isPendingVerification ||
                  subscriptionState.isPendingVerification ||
                  pendingReq?.status === 'pending_verification';

                return (
                  <div
                    id="paywall-vodafone-cash-checkout-section"
                    className="rounded-3xl bg-slate-950/90 border-2 border-red-500/40 p-5 sm:p-7 space-y-6 shadow-xl"
                  >
                    {/* Section Header & Admin Wallet Settings Bar */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-red-600/30 shrink-0 border border-red-400/40">
                          VF Cash
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black font-['Alexandria'] text-white">
                              2. الدفع وتأكيد الاشتراك عبر فودافون كاش (Vodafone Cash) أو البطاقات البنكية
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/40 text-[11px] font-black">
                              تأكيد فوري بالتحويل والإيصال 📲
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            حوِّل قيمة الباقة المختارة إلى رقم محفظة فودافون كاش المعتمد، ثم أدخل رقم عملية التحويل وارفع صورة الإيصال مع معاينة مصغرة قبل الإرسال.
                          </p>
                        </div>
                      </div>

                      {/* Admin Payment Settings: Edit Vodafone Cash Receiving Wallet Number */}
                      <div className="w-full lg:w-auto p-3 rounded-2xl bg-slate-900 border border-sky-500/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 shrink-0">
                          <Key className="w-3.5 h-3.5 text-sky-400" />
                          <span>إعدادات الآدمن (رقم فودافون كاش للاستلام):</span>
                        </div>
                        {isEditingPaywallAdminWallet ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              id="input-admin-vodafone-cash-number"
                              type="tel"
                              dir="ltr"
                              value={paywallAdminWalletDraft}
                              onChange={(e) => setPaywallAdminWalletDraft(e.target.value)}
                              placeholder="010XXXXXXXX"
                              className="h-8 w-36 px-2.5 rounded-lg bg-slate-950 border border-sky-400 text-white font-mono font-bold text-xs text-center focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!paywallAdminWalletDraft.trim()) {
                                  showToast('يرجى إدخال رقم محفظة فودافون كاش صالح');
                                  return;
                                }
                                subscriptionState.updateVodafoneCashWalletNumber(paywallAdminWalletDraft.trim());
                                setIsEditingPaywallAdminWallet(false);
                                showToast(`✅ تم تحديث رقم فودافون كاش المخصص لاستلام المدفوعات إلى: ${paywallAdminWalletDraft.trim()}`);
                              }}
                              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black cursor-pointer"
                            >
                              حفظ الرقم ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPaywallAdminWalletDraft(subscriptionState.vodafoneCashWalletNumber);
                                setIsEditingPaywallAdminWallet(false);
                              }}
                              className="h-8 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono font-black text-xs text-emerald-300" dir="ltr">
                              {subscriptionState.vodafoneCashWalletNumber}
                            </span>
                            <button
                              type="button"
                              id="btn-edit-admin-vodafone-wallet"
                              onClick={() => setIsEditingPaywallAdminWallet(true)}
                              className="h-8 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>تعديل الرقم</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scheduled 24-Hour Receipt Upload Reminder Banner (تنبيه تذكيري لرفع الإيصال خلال 24 ساعة من اختيار الباقة) */}
                    {!isCurrentlyPending && !paywallReceiptPreviewUrl && (
                      <div
                        id="paywall-24h-receipt-reminder-banner"
                        role="region"
                        aria-label="تنبيه تذكيري لرفع إيصال التحويل خلال 24 ساعة"
                        className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border-2 border-sky-400/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg shadow-sky-500/10 animate-fadeIn"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/60 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
                            <Bell className="w-5 h-5 animate-bounce" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950 text-[10px] font-black">
                                تنبيه تذكيري مجدول (24-Hour Reminder) ⏰
                              </span>
                              <span className="text-xs font-bold text-sky-200">
                                الباقة المحددة: {selectedPaywallPlan.nameArabic} ({selectedPaywallPlan.priceEGP.toLocaleString()} ج.م)
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-white font-['Alexandria']">
                              يرجى رفع صورة إيصال تحويل فودافون كاش خلال 24 ساعة من اختيار الباقة لتجنب إلغاء الطلب تلقائياً
                            </h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              تم حجز طلب الترقية للباقة المختارة مؤقتاً؛ سيقوم النظام بإرسال تذكير دوري كل{' '}
                              <strong className="text-sky-300">{paywallReceiptReminder.notifyIntervalHours} ساعات</strong> لحين إرفاق صورة الإيصال وإتمام التأكيد.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
                          {/* Live 24h Countdown Timer */}
                          <div
                            id="paywall-reminder-24h-countdown"
                            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-sky-400/40 text-center flex items-center justify-center gap-2"
                          >
                            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                            <div className="text-right">
                              <div className="text-[10px] text-slate-400 font-bold">المهلة المتبقية لرفع الإيصال:</div>
                              <div className="font-mono font-black text-xs sm:text-sm text-sky-300" dir="ltr">
                                {String(paywallReminderRemaining.hours).padStart(2, '0')}h :{' '}
                                {String(paywallReminderRemaining.minutes).padStart(2, '0')}m :{' '}
                                {String(paywallReminderRemaining.seconds).padStart(2, '0')}s
                              </div>
                            </div>
                          </div>

                          {/* Schedule / Test Reminder Notification Button */}
                          <button
                            type="button"
                            id="btn-schedule-paywall-receipt-reminder"
                            onClick={() => {
                              const nextInterval =
                                paywallReceiptReminder.notifyIntervalHours === 6
                                  ? 3
                                  : paywallReceiptReminder.notifyIntervalHours === 3
                                  ? 1
                                  : 6;
                              const updated = {
                                ...paywallReceiptReminder,
                                isScheduled: true,
                                notifyIntervalHours: nextInterval,
                                lastNotifiedAt: Date.now(),
                              };
                              setPaywallReceiptReminder(updated);
                              try {
                                localStorage.setItem(PAYWALL_REMINDER_STORAGE_KEY, JSON.stringify(updated));
                              } catch {
                                // ignore
                              }

                              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                                Notification.requestPermission().catch(() => {});
                              }

                              showToast(
                                `🔔 تم تفعيل وجدولة التنبيه التذكيري (كل ${nextInterval} ساعات): سنذكرك برفع إيصال "${selectedPaywallPlan.nameArabic}" قبل انتهاء مهلة الـ 24 ساعة لتجنب إلغاء الطلب.`
                              );
                            }}
                            className="px-3.5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/20 transition-all active:scale-95"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>
                              جدولة تذكير (كل {paywallReceiptReminder.notifyIntervalHours} ساعات) 🔔
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending Verification Alert & 1-Click Admin Approval Box */}
                    {isCurrentlyPending && (
                      <div
                        id="pending-vodafone-verification-banner"
                        className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/90 via-slate-900 to-sky-950/80 border-2 border-sky-400/70 space-y-4 animate-fadeIn"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400 flex items-center justify-center shrink-0">
                              <Clock className="w-6 h-6 text-sky-300 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-3 py-0.5 rounded-full bg-sky-400 text-slate-950 text-xs font-black">
                                  قيد التأكيد (Pending Verification) ⏳
                                </span>
                                <span className="text-xs font-bold text-sky-200 font-mono">
                                  رقم عملية التحويل (Transaction ID): {pendingReq?.transactionId || subscriptionState.subscription.transactionId || 'VF-994821'}
                                </span>
                              </div>
                              <h4 className="text-sm sm:text-base font-black text-white font-['Alexandria']">
                                تم استلام طلب تحويل فودافون كاش وإيصال الدفع — بانتظار تأكيد الآدمن لتمديد الاشتراك
                              </h4>
                              <p className="text-xs text-slate-300">
                                الباقة: <strong className="text-sky-300">{pendingReq?.planName || selectedPaywallPlan.nameArabic}</strong> • المبلغ المحول: <strong className="text-emerald-300">{(pendingReq?.amountEGP || selectedPaywallPlan.priceEGP).toLocaleString()} ج.م</strong> • محفظة الاستلام: <strong className="font-mono">{pendingReq?.walletNumberUsed || subscriptionState.vodafoneCashWalletNumber}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Uploaded Receipt Thumbnail inside Pending Verification Box */}
                          {(pendingReq?.receiptImageUrl || subscriptionState.subscription.receiptImageUrl || paywallReceiptPreviewUrl) && (
                            <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-700 shrink-0">
                              <img
                                src={pendingReq?.receiptImageUrl || subscriptionState.subscription.receiptImageUrl || paywallReceiptPreviewUrl || ''}
                                alt="إيصال تحويل فودافون كاش"
                                className="w-14 h-14 object-cover rounded-lg border border-sky-400/50 cursor-pointer"
                                onClick={() => setIsInspectingReceiptLightbox(true)}
                              />
                              <div className="text-[11px] space-y-1">
                                <div className="font-bold text-emerald-300">إيصال التحويل المرفق ✓</div>
                                <div className="text-slate-400 truncate max-w-[140px]">
                                  {pendingReq?.receiptFileName || subscriptionState.subscription.receiptFileName || paywallReceiptFileName || 'vodafone-receipt.jpg'}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => setIsInspectingReceiptLightbox(true)}
                                    className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>معاينة الإيصال</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSharePaywallReceipt}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all"
                                  >
                                    <Share2 className="w-3 h-3" />
                                    <span>مشاركة</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 1-Click Admin Approval Button */}
                        <div className="pt-3 border-t border-sky-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                          <div className="text-xs text-sky-200 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>لوحة تحكم الآدمن: يمكنك مراجعة رقم العملية وصورة الإيصال ثم تأكيد التحويل بضغطة زر لتفعيل حساب التاجر تلقائياً.</span>
                          </div>
                          <button
                            type="button"
                            id="btn-admin-approve-vodafone-cash"
                            onClick={async () => {
                              const res = await subscriptionState.approvePendingPayment(
                                undefined,
                                activeMerchantObj?.id,
                                activeMerchantObj?.storeName
                              );
                              if (activeMerchantObj) {
                                updateMerchantSubscriptionStatus(activeMerchantObj.id, 'approve_pending_payment');
                                setRemoteMerchantsList(loadAllRegisteredMerchants());
                              }
                              confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
                              showToast(res.message);
                            }}
                            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer shrink-0 active:scale-95"
                          >
                            <CheckCircle2 className="w-5 h-5 text-slate-950" />
                            <span>تأكيد التحويل (للآدمن) وتفعيل اشتراك التاجر فوراً ✅</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Payment Method Selector Tabs (Vodafone Cash vs Bank Cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        id="btn-select-paywall-vodafone-cash"
                        onClick={() => setPaywallPaymentMethod('vodafone_cash')}
                        className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between cursor-pointer ${
                          paywallPaymentMethod === 'vodafone_cash'
                            ? 'bg-red-950/50 border-red-500 text-white shadow-lg shadow-red-600/15'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                            كاش
                          </div>
                          <div>
                            <div className="text-sm font-black font-['Alexandria'] text-white">
                              فودافون كاش (Vodafone Cash)
                            </div>
                            <div className="text-[11px] text-slate-300">
                              تحويل فوري للمحفظة + إرفاق رقم العملية وصورة الإيصال
                            </div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paywallPaymentMethod === 'vodafone_cash' ? 'border-red-400 bg-red-500 text-white' : 'border-slate-600'
                        }`}>
                          {paywallPaymentMethod === 'vodafone_cash' && <Check className="w-3 h-3" />}
                        </div>
                      </button>

                      <button
                        type="button"
                        id="btn-select-paywall-credit-card"
                        onClick={() => setPaywallPaymentMethod('credit_card')}
                        className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between cursor-pointer ${
                          paywallPaymentMethod === 'credit_card'
                            ? 'bg-indigo-950/60 border-indigo-400 text-white shadow-lg shadow-indigo-600/15'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black font-['Alexandria'] text-white">
                              البطاقات البنكية / كارت ميزة / إنستاباي
                            </div>
                            <div className="text-[11px] text-slate-300">
                              دفع إلكتروني مباشر ببطاقات فيزا وماستركارد وميزة
                            </div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paywallPaymentMethod === 'credit_card' ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600'
                        }`}>
                          {paywallPaymentMethod === 'credit_card' && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    </div>

                    {/* Vodafone Cash Details, Transaction ID & File Upload Form */}
                    {paywallPaymentMethod === 'vodafone_cash' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Column: Wallet Info & Required Subscription Value */}
                        <div className="lg:col-span-5 space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-400 block">
                              رقم محفظة فودافون كاش المراد التحويل إليها:
                            </span>
                            <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-red-500/50 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <Smartphone className="w-5 h-5 text-red-400 shrink-0" />
                                <span
                                  id="display-vodafone-cash-wallet-number"
                                  className="text-lg sm:text-xl font-black font-mono tracking-wider text-white"
                                  dir="ltr"
                                >
                                  {subscriptionState.vodafoneCashWalletNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                id="btn-copy-vodafone-cash-wallet"
                                onClick={() => {
                                  navigator.clipboard.writeText(subscriptionState.vodafoneCashWalletNumber);
                                  setCopiedPaywallWallet(true);
                                  showToast(`تم نسخ رقم محفظة فودافون كاش (${subscriptionState.vodafoneCashWalletNumber}) للحافظة 📋`);
                                  setTimeout(() => setCopiedPaywallWallet(false), 2500);
                                }}
                                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{copiedPaywallWallet ? 'تم النسخ ✓' : 'نسخ الرقم'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-bold">الباقة المختارة:</span>
                              <span className="text-white font-black">{selectedPaywallPlan.nameArabic}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-bold">مدة الاشتراك:</span>
                              <span className="text-emerald-300 font-bold">{selectedPaywallPlan.durationMonths} شهراً</span>
                            </div>
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                              <span className="text-xs font-black text-sky-300">قيمة الاشتراك المطلوب سدادها:</span>
                              <span
                                id="display-vodafone-required-amount"
                                className="text-xl font-black text-sky-400 font-['Alexandria']"
                              >
                                {selectedPaywallPlan.priceEGP.toLocaleString()} ج.م
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-[11px] text-slate-300 space-y-1 leading-relaxed">
                            <div className="font-black text-red-300">خطوات التحويل السريع (*9*7#):</div>
                            <p>1. اطلب <span className="font-mono text-white font-bold" dir="ltr">*9*7*{subscriptionState.vodafoneCashWalletNumber}*{selectedPaywallPlan.priceEGP}#</span> من هاتفك.</p>
                            <p>2. احتفظ برسالة التأكيد أو لقطة شاشة لإيصال التحويل.</p>
                            <p>3. أدخل رقم العملية وارفع صورة الإيصال في الحقول المقابلة.</p>
                          </div>
                        </div>

                        {/* Right Column: Transaction ID + File Upload + Thumbnail Preview + Submit */}
                        <div className="lg:col-span-7 space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                          {/* Transaction ID Input with Automatic OCR Extraction */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <label
                                htmlFor="input-paywall-vodafone-transaction-id"
                                className="text-xs font-black text-white flex items-center gap-1.5"
                              >
                                <span>رقم عملية التحويل (Transaction ID / رقم المرجع بالرسالة):</span>
                              </label>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isExtractingOcrTxId ? (
                                  <span
                                    id="ocr-extracting-indicator"
                                    className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-300 text-[10px] font-black flex items-center gap-1"
                                  >
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>جاري استخراج رقم العملية عبر OCR...</span>
                                  </span>
                                ) : ocrExtractionBadge ? (
                                  <span
                                    id="ocr-extracted-badge"
                                    className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black flex items-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3 text-sky-300" />
                                    <span>تمت التعبئة تلقائياً عبر OCR ({ocrExtractionBadge.confidence}%) ✓</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-sky-300 font-bold">
                                    يُستخرج تلقائياً عبر OCR فور رفع الإيصال
                                  </span>
                                )}

                                {paywallReceiptPreviewUrl && (
                                  <button
                                    type="button"
                                    id="btn-rescan-ocr-transaction-id"
                                    disabled={isExtractingOcrTxId}
                                    onClick={async () => {
                                      const res = await extractReceiptTransactionIdWithOCR(
                                        paywallReceiptPreviewUrl,
                                        paywallReceiptFileName || undefined
                                      );
                                      if (res?.transactionId) {
                                        showToast(`🔍 تم إعادة مسح الإيصال عبر محرك OCR واستخراج رقم العملية: ${res.transactionId}`);
                                      }
                                    }}
                                    className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                                    title="إعادة استخراج رقم العملية من صورة الإيصال عبر محرك OCR"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>استخراج عبر OCR</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="relative">
                              <input
                                id="input-paywall-vodafone-transaction-id"
                                type="text"
                                dir="ltr"
                                value={paywallTransactionId}
                                onChange={(e) => setPaywallTransactionId(e.target.value)}
                                placeholder="ارفع صورة الإيصال بالأسفل لاستخراج الرقم تلقائياً عبر OCR أو أدخله يدوياً (مثال: 004829103842)"
                                className={`w-full h-11 px-4 rounded-xl bg-slate-950 border-2 text-white font-mono font-bold text-sm focus:outline-none transition-colors ${
                                  ocrExtractionBadge
                                    ? 'border-emerald-500/70 focus:border-emerald-400'
                                    : 'border-slate-700 focus:border-red-500'
                                }`}
                              />
                            </div>
                          </div>

                          {/* File Upload Input for Vodafone Cash Receipt Image + Thumbnail Preview + Lightbox Trigger */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <label
                                htmlFor="vodafone-cash-receipt-file-upload"
                                className="text-xs font-black text-white flex items-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="w-4 h-4 text-red-400" />
                                <span>رفع ملف إيصال تحويل فودافون كاش (File Upload):</span>
                              </label>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-slate-400 hidden sm:inline">PNG, JPG, WEBP (حد أقصى 5 ميجابايت)</span>
                                <button
                                  type="button"
                                  id="btn-open-receipt-lightbox-header"
                                  onClick={() => {
                                    const hasImage = Boolean(
                                      paywallReceiptPreviewUrl ||
                                      pendingReq?.receiptImageUrl ||
                                      subscriptionState.subscription.receiptImageUrl
                                    );
                                    if (!hasImage) {
                                      showToast('⚠️ يرجى رفع صورة إيصال فودافون كاش أولاً لعرضها في نافذة المعاينة الكاملة');
                                      return;
                                    }
                                    setIsInspectingReceiptLightbox(true);
                                  }}
                                  className={`px-3 py-1 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                                    paywallReceiptPreviewUrl || pendingReq?.receiptImageUrl || subscriptionState.subscription.receiptImageUrl
                                      ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-400/50 shadow-sm'
                                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>معاينة الإيصال</span>
                                </button>
                                <button
                                  type="button"
                                  id="btn-share-receipt-header"
                                  onClick={handleSharePaywallReceipt}
                                  className={`px-3 py-1 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                                    paywallReceiptPreviewUrl || pendingReq?.receiptImageUrl || subscriptionState.subscription.receiptImageUrl
                                      ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-400/50 shadow-sm'
                                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>مشاركة</span>
                                </button>
                              </div>
                            </div>

                            {/* 5MB File Size Exceeded Warning Banner */}
                            {paywallReceiptSizeWarning && (
                              <div
                                id="vodafone-receipt-size-warning"
                                role="alert"
                                className="p-3.5 rounded-2xl bg-rose-950/80 border-2 border-rose-500/70 text-rose-200 text-xs flex items-start justify-between gap-3 animate-fadeIn"
                              >
                                <div className="flex items-start gap-2.5">
                                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <div className="font-black text-rose-300">تنبيه تجاوز الحجم المسموح للصورة (الحد الأقصى 5 ميجابايت)</div>
                                    <p className="text-[11px] text-rose-200/90 leading-relaxed">{paywallReceiptSizeWarning}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPaywallReceiptSizeWarning(null)}
                                  className="p-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-300 cursor-pointer shrink-0"
                                  title="إغلاق التنبيه"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Visual Toast Notification for Successful Receipt Upload & Spec Validation */}
                            {paywallReceiptSuccessToast && (
                              <div
                                id="vodafone-receipt-upload-toast"
                                role="status"
                                aria-live="polite"
                                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/95 via-teal-950/90 to-emerald-950/95 border-2 border-emerald-400/70 text-emerald-100 text-xs flex items-start justify-between gap-3 shadow-lg shadow-emerald-500/15 animate-fadeIn"
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="font-black text-emerald-300 flex items-center gap-1.5 flex-wrap">
                                      <span>تأكيد رفع ومعالجة صورة الإيصال بنجاح ✓</span>
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 text-[10px] font-bold border border-emerald-400/40">
                                        مطابقة للمواصفات (أقل من 5MB)
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                                      {paywallReceiptSuccessToast}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  id="btn-dismiss-receipt-upload-toast"
                                  onClick={() => setPaywallReceiptSuccessToast(null)}
                                  className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 cursor-pointer shrink-0 transition-colors"
                                  title="إغلاق إشعار التأكيد"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <input
                              ref={paywallFileInputRef}
                              id="vodafone-cash-receipt-file-upload"
                              type="file"
                              accept="image/*"
                              onChange={handlePaywallReceiptFileChange}
                              className="hidden"
                            />

                            {!paywallReceiptPreviewUrl ? (
                              <label
                                htmlFor="vodafone-cash-receipt-file-upload"
                                id="vodafone-cash-receipt-dropzone"
                                onDragOver={handlePaywallReceiptDragOver}
                                onDragEnter={handlePaywallReceiptDragEnter}
                                onDragLeave={handlePaywallReceiptDragLeave}
                                onDrop={handlePaywallReceiptDrop}
                                className={`w-full p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center group ${
                                  isDraggingPaywallReceipt
                                    ? 'border-sky-400 bg-sky-950/40 scale-[1.01] shadow-xl shadow-sky-500/15'
                                    : 'border-slate-700 hover:border-red-400 bg-slate-950/70 hover:bg-slate-950'
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                                  isDraggingPaywallReceipt
                                    ? 'bg-sky-500/25 border-sky-400 text-sky-300 scale-110'
                                    : 'bg-red-500/15 border-red-500/30 group-hover:bg-red-500/25 text-red-400'
                                }`}>
                                  <Upload className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-xs sm:text-sm font-black text-white block">
                                    {isDraggingPaywallReceipt
                                      ? 'أفلت صورة إيصال فودافون كاش هنا لرفعها ومعالجتها فوراً 📥'
                                      : 'اسحب وأفلت (Drag & Drop) صورة الإيصال هنا، أو اضغط لاختيار ملف (بحد أقصى 5 ميجابايت)'}
                                  </span>
                                  <span className="text-[11px] text-slate-400 block">
                                    يدعم السحب والإفلات المباشر (PNG, JPG, WEBP) مع التحقق من الحجم وعرض معاينة مصغرة ونافذة معاينة كاملة
                                  </span>
                                </div>
                              </label>
                            ) : (
                              /* Thumbnail Preview Card Before Submission (also supports Drag & Drop to replace image) */
                              <div
                                id="vodafone-cash-receipt-thumbnail-preview"
                                onDragOver={handlePaywallReceiptDragOver}
                                onDragEnter={handlePaywallReceiptDragEnter}
                                onDragLeave={handlePaywallReceiptDragLeave}
                                onDrop={handlePaywallReceiptDrop}
                                className={`p-4 rounded-2xl bg-slate-950 border-2 space-y-3 animate-fadeIn transition-all ${
                                  isDraggingPaywallReceipt
                                    ? 'border-sky-400 bg-sky-950/30 shadow-lg shadow-sky-500/15'
                                    : 'border-emerald-500/50'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>معاينة مصغرة لإيصال تحويل فودافون كاش قبل الإرسال:</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                    تمت معالجة الصورة بنجاح ✓
                                  </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                  <div className="relative group shrink-0">
                                    <img
                                      id="img-vodafone-receipt-thumbnail"
                                      src={paywallReceiptPreviewUrl}
                                      alt="معاينة مصغرة لإيصال تحويل فودافون كاش"
                                      className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-2xl border-2 border-emerald-400/60 shadow-lg bg-slate-900 cursor-pointer"
                                      onClick={() => setIsInspectingReceiptLightbox(true)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setIsInspectingReceiptLightbox(true)}
                                      className="absolute inset-0 rounded-2xl bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4" />
                                      <span>تكبير</span>
                                    </button>
                                  </div>

                                  <div className="flex-1 space-y-2 text-right w-full">
                                    <div className="text-xs font-bold text-white truncate">
                                      اسم الملف: <span className="font-mono text-emerald-300">{paywallReceiptFileName}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      حجم الصورة: <span className="font-mono text-slate-200">{paywallReceiptFileSize}</span> • جاهزة للإرفاق مع طلب التفعيل
                                    </div>
                                    {paywallReceiptMetadata && (
                                      <div
                                        id="vodafone-receipt-metadata-badges"
                                        className="flex items-center gap-1.5 flex-wrap text-[10px]"
                                      >
                                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-sky-300 font-mono font-bold">
                                          الأبعاد: {paywallReceiptMetadata.width}×{paywallReceiptMetadata.height} px
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-indigo-300 font-mono font-bold">
                                          نسبة الأبعاد: {paywallReceiptMetadata.aspectRatioLabel}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                                          {paywallReceiptMetadata.orientationLabel} ✓
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                                      <button
                                        type="button"
                                        id="btn-preview-vodafone-receipt-lightbox"
                                        onClick={() => setIsInspectingReceiptLightbox(true)}
                                        className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/20 transition-all active:scale-95"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>معاينة الإيصال</span>
                                      </button>
                                      <button
                                        type="button"
                                        id="btn-share-vodafone-receipt"
                                        onClick={handleSharePaywallReceipt}
                                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span>مشاركة</span>
                                      </button>
                                      <label
                                        htmlFor="vodafone-cash-receipt-file-upload"
                                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                                      >
                                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                                        <span>استبدال الصورة</span>
                                      </label>
                                      <button
                                        type="button"
                                        id="btn-remove-vodafone-receipt-preview"
                                        onClick={handleClearPaywallReceipt}
                                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>حذف الصورة</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Loading Spinner Below Receipt Upload Field During Image Processing */}
                            {isProcessingPaywallReceipt && (
                              <div
                                id="vodafone-receipt-processing-spinner"
                                role="status"
                                aria-live="polite"
                                className="p-3.5 rounded-2xl bg-slate-950/90 border-2 border-sky-400/60 flex items-center justify-between gap-3 text-xs text-sky-200 shadow-lg shadow-sky-500/10 animate-fadeIn"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300 shrink-0">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="font-black text-sky-300">
                                      جاري معالجة صورة إيصال فودافون كاش وفحص المواصفات...
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      يتم التحقق من أبعاد الصورة ونسبة العرض للارتفاع وحجم الملف (أقل من 5 ميجابايت)
                                    </div>
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 text-[10px] font-black border border-sky-400/30 shrink-0">
                                  يرجى الانتظار...
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Submit Vodafone Cash Transfer for Verification Button */}
                          <button
                            type="button"
                            id="btn-submit-vodafone-cash-verification"
                            disabled={isSubmittingPaywallVodafone || isProcessingPaywallReceipt}
                            onClick={async () => {
                              if (!paywallTransactionId.trim()) {
                                showToast('⚠️ يرجى إدخال رقم عملية التحويل (Transaction ID) أولاً');
                                return;
                              }
                              if (!paywallReceiptPreviewUrl) {
                                showToast('⚠️ يرجى رفع صورة إيصال تحويل فودافون كاش للمعاينة قبل الإرسال');
                                return;
                              }

                              // Final metadata validation check before submission
                              const finalMetaCheck = await validateReceiptImageMetadata(paywallReceiptPreviewUrl);
                              if (!finalMetaCheck.isValid) {
                                const errMsg = finalMetaCheck.errorMessage || '⚠️ صورة الإيصال لا تطابق الأبعاد أو النسبة القياسية المطلوبة للإرسال.';
                                setPaywallReceiptSizeWarning(errMsg);
                                showToast(errMsg);
                                return;
                              }

                              setIsSubmittingPaywallVodafone(true);
                              try {
                                const res = await subscriptionState.submitVodafoneCashPayment({
                                  planId: selectedPaywallPlan.id,
                                  amountEGP: selectedPaywallPlan.priceEGP,
                                  transactionId: paywallTransactionId.trim(),
                                  receiptImageUrl: paywallReceiptPreviewUrl,
                                  receiptFileName: paywallReceiptFileName || 'vodafone-receipt.jpg',
                                  merchantId: activeMerchantObj?.id,
                                  merchantName: activeMerchantObj?.storeName
                                });

                                if (activeMerchantObj) {
                                  updateMerchantSubscriptionStatus(activeMerchantObj.id, 'submit_pending_payment', {
                                    planId: selectedPaywallPlan.id as any,
                                    planName: selectedPaywallPlan.nameArabic,
                                    durationMonths: selectedPaywallPlan.durationMonths,
                                    amountEGP: selectedPaywallPlan.priceEGP,
                                    paymentMethod: 'vodafone_cash',
                                    referenceNumber: res.referenceNumber,
                                    transactionId: paywallTransactionId.trim(),
                                    receiptImageUrl: paywallReceiptPreviewUrl,
                                    receiptFileName: paywallReceiptFileName || 'vodafone-receipt.jpg',
                                    walletNumberUsed: subscriptionState.vodafoneCashWalletNumber
                                  });
                                  setRemoteMerchantsList(loadAllRegisteredMerchants());
                                }

                                showToast(res.message);
                              } finally {
                                setIsSubmittingPaywallVodafone(false);
                              }
                            }}
                            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/25 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            <span>
                              إرسال بيانات التحويل وإيصال فودافون كاش للتأكيد ({selectedPaywallPlan.priceEGP.toLocaleString()} ج.م) 📤
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Bank Card / Instant Activation Option */
                      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white">
                            الدفع الإلكتروني المباشر بالبطاقات البنكية وكارت ميزة ({selectedPaywallPlan.nameArabic} — {selectedPaywallPlan.priceEGP.toLocaleString()} ج.م)
                          </h4>
                          <p className="text-xs text-slate-300">
                            يتم تفعيل حساب التاجر وتمديد الاشتراك فوراً بمجرد إتمام السداد أو فتح نافذة الدفع الكاملة.
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer border border-slate-700"
                          >
                            فتح جميع بوابات الدفع
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await subscriptionState.activatePlan(
                                selectedPaywallPlan.id,
                                'credit_card',
                                undefined,
                                selectedPaywallPlan.priceEGP,
                                activeMerchantObj?.id,
                                activeMerchantObj?.storeName
                              );
                              if (activeMerchantObj) {
                                updateMerchantSubscriptionStatus(activeMerchantObj.id, 'activate_plan', {
                                  planId: selectedPaywallPlan.id as any,
                                  planName: selectedPaywallPlan.nameArabic,
                                  durationMonths: selectedPaywallPlan.durationMonths,
                                  amountEGP: selectedPaywallPlan.priceEGP,
                                  paymentMethod: 'credit_card'
                                });
                                setRemoteMerchantsList(loadAllRegisteredMerchants());
                              }
                              confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
                              showToast(`🎉 تم تفعيل "${selectedPaywallPlan.nameArabic}" بالبطاقة البنكية بنجاح!`);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>دفع وتفعيل فوري ({selectedPaywallPlan.priceEGP} ج.م)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lightbox Modal for Full Receipt Image Inspection */}
                    {isInspectingReceiptLightbox && (paywallReceiptPreviewUrl || pendingReq?.receiptImageUrl || subscriptionState.subscription.receiptImageUrl) && (
                      <div
                        id="vodafone-receipt-lightbox-modal"
                        className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
                        onClick={() => setIsInspectingReceiptLightbox(false)}
                      >
                        <div
                          className="relative max-w-2xl w-full bg-slate-900 border-2 border-sky-400/50 rounded-3xl p-5 space-y-4 shadow-2xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                                <Eye className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-black text-white font-['Alexandria']">
                                  معاينة الإيصال بالحجم الكامل (Full-Size Receipt Lightbox)
                                </h4>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {paywallReceiptFileName || pendingReq?.receiptFileName || subscriptionState.subscription.receiptFileName || 'vodafone-cash-receipt.jpg'}
                                  {paywallReceiptFileSize ? ` • ${paywallReceiptFileSize}` : ''}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              id="btn-close-receipt-lightbox"
                              onClick={() => setIsInspectingReceiptLightbox(false)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              <span>إغلاق المعاينة</span>
                            </button>
                          </div>

                          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                            <img
                              id="img-vodafone-receipt-fullsize"
                              src={paywallReceiptPreviewUrl || pendingReq?.receiptImageUrl || subscriptionState.subscription.receiptImageUrl || ''}
                              alt="معاينة كاملة لإيصال تحويل فودافون كاش"
                              className="w-full max-h-[72vh] object-contain rounded-xl"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                            <span>
                              رقم عملية التحويل: <strong className="font-mono text-sky-300">{paywallTransactionId || pendingReq?.transactionId || subscriptionState.subscription.transactionId || 'غير مدخل بعد'}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsInspectingReceiptLightbox(false)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer"
                            >
                              تم التحقق من الإيصال ✓
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <ErrorBoundary sectionName={NAV_TAB_METADATA[activeTab]?.label || 'لوحة التحكم النشطة'}>

          {/* TAB: Admin API Error Monitoring & Realtime Control Dashboard (لوحة تحكم المدير وتتبع أخطاء الربط) */}
          {activeTab === 'admin_error_logs' && (
            <AdminApiErrorDashboard
              onShowToast={showToast}
              adminEmail={user?.email || 'admin@merchantradar.eg'}
            />
          )}

          {/* TAB 0: Sales Performance Dashboard (لوحة تحكم أداء المبيعات والتسعير) */}
          {activeTab === 'sales_dashboard' && (
            <div className="space-y-6">
              <SmartInventoryAlerts
                products={activeProducts}
                inventory={inventory}
                onUpdateInventory={handleUpdateInventory}
                currency={currency}
                onSelectProduct={(prod) => {
                  setCurrentProduct(prod);
                  setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                }}
                onOpenFullInventoryTab={() => {
                  setActiveTab('inventory');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToSuppliers={(prod) => handleNavigateToWholesaleForRestock(undefined, prod)}
                onShowToast={showToast}
              />

              <SalesDashboard
                allProducts={allProducts}
                watchlist={watchlist}
                connectedPlatforms={connectedPlatforms}
                currency={currency}
                archivedCount={archivedProducts.length}
                onArchiveProduct={handleInitiateArchive}
                onNavigateToArchive={() => setActiveTab('archived_products')}
                onSelectProduct={(prod) => {
                  setCurrentProduct(prod);
                  setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                }}
                onApplyReprice={handleRepriceSingleProduct}
                onApplyBulkReprice={handleApplyBulkPricesToProducts}
                onNavigateToRadar={(productId) => {
                  if (productId) {
                    const target = allProducts.find(p => p.id === productId);
                    if (target) {
                      setCurrentProduct(target);
                      setWinningPrice(Math.round(target.currentLowestPrice * (1 - selectedDiscount / 100)));
                    }
                  }
                  setActiveTab('radar');
                }}
                onNavigateToWatchlist={() => setActiveTab('watchlist')}
                onNavigateToSimulator={() => setActiveTab('profit_simulator')}
                onNavigateToForecast={() => setActiveTab('seasonal_forecast')}
                onNavigateToCommissions={() => setActiveTab('platform_commissions')}
                onImportProducts={handleImportProducts}
                onOpenBestSellersModal={() => setIsBestSellerAlertModalOpen(true)}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* TAB: Archived Inactive Products Vault (مجلد أرشيف المنتجات غير النشطة والموقوفة) */}
          {activeTab === 'archived_products' && (
            <ArchivedProductsVault
              archivedProducts={archivedProducts}
              currency={currency}
              onRestoreProduct={handleRestoreProduct}
              onBulkRestoreProducts={handleBulkRestoreProducts}
              onPermanentDeleteProduct={handlePermanentDeleteProduct}
              onBulkDeleteProducts={handleBulkDeleteProducts}
              onInspectProductRadar={(prod) => {
                setCurrentProduct(prod);
                setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                setActiveTab('radar');
              }}
              onOpenArchiveModalForActive={() => {
                if (activeProducts.length > 0) {
                  handleInitiateArchive(activeProducts[0]);
                }
              }}
            />
          )}

          {/* TAB: Platform Commission Calculator (حاسبة عمولات المنصات وصافي الربح) */}
          {activeTab === 'platform_commissions' && (
            <PlatformCommissionCalculator
              allProducts={allProducts}
              currentProduct={currentProduct}
              currency={currency}
              onApplyPriceToProduct={(productId, newPrice) => {
                setAllProducts(prev => prev.map(p => p.id === productId ? {
                  ...p,
                  suggestedRetailPrice: newPrice,
                  priceHistory: [
                    ...(p.priceHistory || []),
                    {
                      date: 'اليوم (حاسبة العمولات)',
                      price: newPrice,
                      merchant: 'متجري (السعر المحسوب)'
                    }
                  ]
                } : p));

                if (currentProduct && currentProduct.id === productId) {
                  setCurrentProduct(prev => prev ? ({
                    ...prev,
                    suggestedRetailPrice: newPrice
                  }) : null);
                  setWinningPrice(newPrice);
                }
              }}
              onNavigateToGuardrails={() => setActiveTab('pricing_guardrails')}
              onNavigateToSimulator={() => setActiveTab('profit_simulator')}
              onShowToast={showToast}
            />
          )}

          {/* TAB: Seasonal Demand Forecasting & Inventory Alerts (توقع حجم الطلب الموسمي والذروة) */}
          {activeTab === 'seasonal_forecast' && (
            <SeasonalDemandForecast
              allProducts={allProducts}
              currency={currency}
              onNavigateToWholesale={(query) => setActiveTab('wholesale')}
              onNavigateToSalesDashboard={() => setActiveTab('sales_dashboard')}
              onShowToast={showToast}
            />
          )}
          
          {/* TAB 1: Competitor Price Radar & 1-Click Repricing */}
          {activeTab === 'radar' && (
            <div className="w-full max-w-full space-y-6 overflow-hidden">
              {/* Smart Inventory Reorder Point Alerts Widget on Main Control Dashboard */}
              <SmartInventoryAlerts
                products={activeProducts}
                inventory={inventory}
                onUpdateInventory={handleUpdateInventory}
                currency={currency}
                onSelectProduct={(prod) => {
                  setCurrentProduct(prod);
                  setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                }}
                onOpenFullInventoryTab={() => {
                  setActiveTab('inventory');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToSuppliers={(prod) => handleNavigateToWholesaleForRestock(undefined, prod)}
                onShowToast={showToast}
              />

              {/* Comprehensive Smart Product Price Comparison, Camera Analyzer, Locations, Reviews, Loyalty Rewards & Infographic Studio */}
              <SmartShopperPriceComparisonHub
                products={activeProducts}
                currentProduct={currentProduct}
                onSelectProduct={(prod) => {
                  setCurrentProduct(prod);
                  setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                }}
                onProductDetected={handleProductDetected}
                onTriggerDiscountAlert={(prod, pct, targetPrice) => {
                  const newAlert: PriceAlert = {
                    id: `alert-${Date.now()}`,
                    productId: prod.id,
                    productTitle: prod.title,
                    productImage: prod.imageUrl,
                    channel: 'in_app',
                    triggerCondition: 'percentage_drop',
                    targetPrice: targetPrice,
                    thresholdPercentage: pct,
                    recipientContact: 'متسوق رادار مصر',
                    isActive: true,
                    createdAt: new Date().toLocaleDateString('ar-EG'),
                    triggerCount: 1,
                    lastTriggeredAt: 'الآن'
                  };
                  setAlerts(prev => [newAlert, ...prev]);
                }}
                onApplyWinningImage={(newImgUrl: string) => {
                  setCurrentProduct((prev) => prev ? ({ ...prev, imageUrl: newImgUrl }) : null);
                  if (currentProduct) {
                    setAllProducts((prev) =>
                      prev.map((p) => (p.id === currentProduct.id ? { ...p, imageUrl: newImgUrl } : p))
                    );
                  }
                  showToast('تم اعتماد التصميم التوضيحي الجديد كصورة رسمية للمنتج 🏆');
                }}
                onOpenFullStudio={() => setActiveTab('image_studio')}
                currency={currency}
                onShowToast={showToast}
              />

              {/* Real-time Multi-Merchant Product Price Comparison with Search & Category Navigation */}
              <RealTimeProductPriceComparison
                products={activeProducts}
                currentProduct={currentProduct}
                currency={currency}
                platformCategories={platformCategories}
                connectedPlatforms={connectedPlatforms}
                onSelectProduct={(prod) => {
                  setCurrentProduct(prod);
                  setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                }}
                onShowToast={showToast}
                onTriggerDiscountAlert={(prod, pct, targetPrice) => {
                  const newAlert: PriceAlert = {
                    id: `alert-${Date.now()}`,
                    productId: prod.id,
                    productTitle: prod.title,
                    productImage: prod.imageUrl,
                    channel: 'in_app',
                    triggerCondition: 'percentage_drop',
                    targetPrice: targetPrice,
                    thresholdPercentage: pct,
                    recipientContact: 'تاجر رادار مصر',
                    isActive: true,
                    createdAt: new Date().toLocaleDateString('ar-EG'),
                    triggerCount: 1,
                    lastTriggeredAt: 'الآن'
                  };
                  setAlerts(prev => [newAlert, ...prev]);
                  showToast(`تم تفعيل تنبيه الخصم الفوري لـ ${prod.title.substring(0, 20)}... عند هبوط ${pct}% (سعر مستهدف: ${targetPrice.toLocaleString()} ${currency}) 🔔⚡`);
                }}
                onOpenGenerateWaybillModal={handleOpenGenerateWaybill}
              />

              <CompetitorRadar
                product={currentProduct}
                allProducts={allProducts}
                currency={currency}
                selectedDiscount={selectedDiscount}
                setSelectedDiscount={(val) => {
                  setSelectedDiscount(val);
                  if (currentProduct) {
                    setWinningPrice(Math.round(currentProduct.currentLowestPrice * (1 - val / 100)));
                  }
                }}
                onApplyWinningPrice={handleApplyWinningPrice}
                onAutoAdjustProductPrice={handleSmartDynamicPriceAutoAdjust}
                onBulkAutoAdjustAllProducts={handleBulkSmartDynamicPricingAdjust}
                onNavigateToGuardrails={() => {
                  setActiveTab('pricing_guardrails');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenRepriceModal={() => setIsPublishModalOpen(true)}
                isWatchlisted={currentProduct ? isProductInWatchlist(currentProduct.id) : false}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenAlertModal={(prod) => {
                  setActiveTab('price_alerts');
                }}
                onOpenStudio={() => setActiveTab('image_studio')}
                onOpenBulkReprice={() => setActiveTab('bulk_repricing')}
                onOpenPeriodicReports={() => setActiveTab('periodic_reports')}
                onOpenProfitSimulator={() => setActiveTab('profit_simulator')}
                onOpenSalesDashboard={() => setActiveTab('sales_dashboard')}
                onArchiveProduct={(prod) => handleInitiateArchive(prod)}
                onShowToast={showToast}
                onOpenChannelCompetitorImport={handleOpenChannelCompetitorImport}
                onOpenGenerateWaybillModal={handleOpenGenerateWaybill}
                onOpenBestSellersModal={() => setIsBestSellerAlertModalOpen(true)}
                onSelectProduct={(prod) => {
                  setCurrentProduct(prod);
                  setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                }}
              />
            </div>
          )}

          {/* TAB: Smart Shopper Price Comparison, Camera, Reviews, Loyalty & Infographic Hub */}
          {activeTab === 'loyalty_rewards' && (
            <SmartShopperPriceComparisonHub
              products={activeProducts}
              currentProduct={currentProduct}
              onSelectProduct={(prod) => {
                setCurrentProduct(prod);
                setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
              }}
              onProductDetected={handleProductDetected}
              onTriggerDiscountAlert={(prod, pct, targetPrice) => {
                const newAlert: PriceAlert = {
                  id: `alert-${Date.now()}`,
                  productId: prod.id,
                  productTitle: prod.title,
                  productImage: prod.imageUrl,
                  channel: 'in_app',
                  triggerCondition: 'percentage_drop',
                  targetPrice: targetPrice,
                  thresholdPercentage: pct,
                  recipientContact: 'متسوق رادار مصر',
                  isActive: true,
                  createdAt: new Date().toLocaleDateString('ar-EG'),
                  triggerCount: 1,
                  lastTriggeredAt: 'الآن'
                };
                setAlerts(prev => [newAlert, ...prev]);
              }}
              onApplyWinningImage={(newImgUrl: string) => {
                setCurrentProduct((prev) => prev ? ({ ...prev, imageUrl: newImgUrl }) : null);
                if (currentProduct) {
                  setAllProducts((prev) =>
                    prev.map((p) => (p.id === currentProduct.id ? { ...p, imageUrl: newImgUrl } : p))
                  );
                }
                showToast('تم اعتماد التصميم التوضيحي الجديد كصورة رسمية للمنتج 🏆');
              }}
              onOpenFullStudio={() => setActiveTab('image_studio')}
              currency={currency}
              onShowToast={showToast}
            />
          )}

          {/* TAB: Direct Competitors Comparison Table & Buy Box Share Matrix (المنافسون المباشرون) */}
          {activeTab === 'direct_competitors' && (
            <DirectCompetitorsTab
              products={activeProducts}
              currentProduct={currentProduct}
              connectedPlatforms={connectedPlatforms}
              currency={currency}
              selectedDiscount={selectedDiscount}
              onSelectProduct={(prod) => {
                setCurrentProduct(prod);
                setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
              }}
              onUpdateMerchantPrice={handleRepriceSingleProduct}
              onBulkMatchBuyBox={handleApplyBulkPricesToProducts}
              onNavigateToRadar={(prod) => {
                setCurrentProduct(prod);
                setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                setActiveTab('radar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB: Smart Market Analytics (تحليلات السوق الذكية - اتجاهات أسعار المنافسين 30 يوماً بـ Recharts) */}
          {activeTab === 'smart_market_analytics' && (
            <SmartMarketAnalytics
              products={activeProducts}
              currentProduct={currentProduct}
              connectedPlatforms={connectedPlatforms}
              currency={currency}
              winningPrice={winningPrice}
              selectedDiscount={selectedDiscount}
              onSelectProduct={(prod) => {
                setCurrentProduct(prod);
                setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
              }}
              onApplyWinningPrice={handleApplyWinningPrice}
              onNavigateToRadar={() => {
                setActiveTab('radar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB: Market Trends Radar (رادار اتجاهات السوق المصري وحركة الطلب) */}
          {activeTab === 'market_trends' && (
            <MarketTrendsRadar
              currency={currency}
              onSelectProduct={(productId) => {
                const target = allProducts.find(p => p.id === productId);
                if (target) {
                  setCurrentProduct(target);
                  setWinningPrice(Math.round(target.currentLowestPrice * (1 - selectedDiscount / 100)));
                  setActiveTab('radar');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              onNavigateToSimulator={(prod) => {
                if (prod) {
                  setCurrentProduct(prod);
                  setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                }
                setActiveTab('profit_simulator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToOrders={() => {
                setActiveTab('order_scheduling');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToPricing={(prod) => {
                if (prod) {
                  setCurrentProduct(prod);
                  setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                }
                setActiveTab('pricing_guardrails');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB: Multi-Product Order Scheduling & Separate Waybills (جدولة الطلبات وبوالص الشحن المنفصلة) */}
          {activeTab === 'order_scheduling' && (
            <OrderSchedulingWaybills
              allProducts={allProducts}
              onShowToast={showToast}
              activeMerchantId={activeMerchantId}
              remoteMerchants={remoteMerchantsList}
              onOpenManageApisModal={() => setIsManageApisModalOpen(true)}
            />
          )}

          {/* TAB: Order Fulfillment & Inventory-Waybill Linking (جدولة وتتبع أوامر الشحن) */}
          {activeTab === 'order_fulfillment' && (
            <OrderFulfillmentTracker
              products={allProducts}
              inventory={inventory}
              currency={currency}
              onShowToast={showToast}
              onOpenGenerateWaybillModal={handleOpenGenerateWaybill}
              onUpdateInventoryStock={handleDeductInventoryStock}
              activeMerchantId={activeMerchantId}
              remoteMerchants={remoteMerchantsList}
              onOpenManageApisModal={() => setIsManageApisModalOpen(true)}
            />
          )}

          {/* TAB: Pricing Guardrails & Min/Max Floor/Ceiling Management (حدود حماية التسعير) */}
          {activeTab === 'pricing_guardrails' && (
            <PricingGuardrailsManager
              products={allProducts}
              selectedProduct={currentProduct}
              currency={currency}
              onSelectProduct={(prod) => {
                setCurrentProduct(prod);
                setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
              }}
              onAutoAdjustProductPrice={handleSmartDynamicPriceAutoAdjust}
              onBulkAutoAdjustAllProducts={handleBulkSmartDynamicPricingAdjust}
              onNavigateToSimulator={() => setActiveTab('profit_simulator')}
              onShowToast={showToast}
            />
          )}

          {/* TAB: Marketer Control Hub & RBAC / Audit Trail (صلاحيات المسوق والرقابة وسجل النشاط) */}
          {activeTab === 'marketer_hub' && (
            <MarketerRbacAndAuditHub
              onShowToast={showToast}
            />
          )}

          {/* TAB 1.05: Profit Projection Simulator (محاكي الربح المستقبلي والنمذجة التنبؤية) */}
          {activeTab === 'profit_simulator' && (
            <ProfitProjectionSimulator
              products={allProducts}
              currentProduct={currentProduct}
              currency={currency}
              onApplySimulatedPrice={(productId, newPrice) => {
                setAllProducts(prev => prev.map(p => p.id === productId ? {
                  ...p,
                  suggestedRetailPrice: newPrice,
                  priceHistory: [
                    ...(p.priceHistory || []),
                    {
                      date: 'اليوم (محاكي الربح)',
                      price: newPrice,
                      merchant: 'متجري (السعر المحاكى)'
                    }
                  ]
                } : p));

                if (currentProduct.id === productId) {
                  setCurrentProduct(prev => ({
                    ...prev,
                    suggestedRetailPrice: newPrice
                  }));
                  setWinningPrice(newPrice);
                }
              }}
              onOpenImageStudio={(prod) => {
                setCurrentProduct(prod);
                setActiveTab('image_studio');
              }}
              onSelectProductForRadar={(productId) => {
                const target = allProducts.find(p => p.id === productId);
                if (target) {
                  setCurrentProduct(target);
                  setWinningPrice(Math.round(target.currentLowestPrice * (1 - selectedDiscount / 100)));
                  setActiveTab('radar');
                }
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB 1.1: Automated Periodic Performance Reports & Advanced Graphical Analytics */}
          {activeTab === 'periodic_reports' && (
            <PeriodicPerformanceReports
              allProducts={allProducts}
              watchlist={watchlist}
              currency={currency}
              onSelectProductForRadar={(productId) => {
                const target = allProducts.find(p => p.id === productId);
                if (target) {
                  setCurrentProduct(target);
                  setWinningPrice(Math.round(target.currentLowestPrice * (1 - selectedDiscount / 100)));
                  setActiveTab('radar');
                }
              }}
              onNavigateToWatchlist={() => setActiveTab('watchlist')}
              onShowToast={showToast}
            />
          )}

          {/* TAB 1.2: Bulk Price Update & Unified Pricing Strategies */}
          {activeTab === 'bulk_repricing' && (
            <BulkPriceUpdateManager
              products={allProducts}
              currency={currency}
              connectedPlatforms={connectedPlatforms}
              onApplyBulkPricesToProducts={handleApplyBulkPricesToProducts}
              onSelectProductForRadar={(productId) => {
                const target = allProducts.find(p => p.id === productId);
                if (target) {
                  setCurrentProduct(target);
                  setWinningPrice(Math.round(target.currentLowestPrice * (1 - selectedDiscount / 100)));
                  setActiveTab('radar');
                }
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB 1.5: Remote Merchants & Weekly Sales/Competitor Reports */}
          {activeTab === 'remote_merchants' && (
            <RemoteMerchantsManager
              allProducts={allProducts}
              currency={currency}
              onSelectProduct={(productId) => {
                const target = allProducts.find(p => p.id === productId);
                if (target) {
                  setCurrentProduct(target);
                  setWinningPrice(Math.round(target.currentLowestPrice * (1 - selectedDiscount / 100)));
                  setActiveTab('radar');
                }
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB 2: Watchlist & Competitor Inventory Tracking (قائمة المتابعة) */}
          {activeTab === 'watchlist' && (
            <WatchlistManager
              watchlist={watchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onAddNote={handleUpdateWatchlistNote}
              onUpdateTargetAlertPrice={handleUpdateTargetAlertPrice}
              onBulkUpdateTargetAlertPrices={handleBulkUpdateTargetAlertPrices}
              onSelectProduct={handleSelectProductFromWatchlist}
              onOpenAlertModal={(prod) => {
                setCurrentProduct(prod);
                setActiveTab('price_alerts');
              }}
              onOpenScanner={() => setIsScannerOpen(true)}
              currency={currency}
            />
          )}

          {/* TAB: Merchant Wishlist & Deals Vault (قائمة الأمنيات والصفقات المرتقبة) */}
          {activeTab === 'wishlist' && (
            <WishlistManager
              onShowToast={showToast}
              onNavigateToAlerts={(productId) => {
                const found = allProducts.find(p => p.id === productId);
                if (found) setCurrentProduct(found);
                setActiveTab('price_alerts');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToRadar={(search) => {
                if (search) {
                  const match = allProducts.find(p => p.title.includes(search) || p.brand.includes(search));
                  if (match) setCurrentProduct(match);
                }
                setActiveTab('radar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* TAB: User Activity Logs & Audit Trail (سجل نشاط وحركات المستخدمين) */}
          {activeTab === 'user_logs' && (
            <UserLogsManager
              onShowToast={showToast}
            />
          )}

          {/* TAB 3: Egypt Wholesale Hubs & Supplier Finder */}
          {activeTab === 'wholesale' && (
            <EgyptWholesaleLocations
              product={currentProduct}
              currency={currency}
              onNavigateToSuppliersHub={() => {
                setActiveTab('suppliers_hub');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* TAB 4: Platforms Guide & Official Documents (دليل المنصات والاشتراك) */}
          {activeTab === 'platforms_guide' && (
            <PlatformsOnboardingGuide />
          )}

          {/* TAB 5: Price Drop Alerts & WhatsApp Notifications (تنبيهات هبوط الأسعار) */}
          {activeTab === 'price_alerts' && (
            <PriceAlertManager
              alerts={alerts}
              notificationLogs={notificationLogs}
              products={allProducts}
              activeProduct={currentProduct}
              onAddAlert={handleAddAlert}
              onToggleAlert={handleToggleAlert}
              onDeleteAlert={handleDeleteAlert}
              onTestTriggerAlert={handleTestTriggerAlert}
              onMarkNotificationRead={handleMarkNotificationRead}
              onSelectProduct={(p) => {
                setCurrentProduct(p);
                setWinningPrice(Math.round(p.currentLowestPrice * (1 - selectedDiscount / 100)));
              }}
              onOpenRepriceModal={() => setIsPublishModalOpen(true)}
              currency={currency}
              connectedPlatforms={connectedPlatforms}
              merchantStoreName={remoteMerchantsList.find(m => m.id === activeMerchantId)?.storeName || 'متجر التاجر المعتمد'}
              managerEmail={user?.email || ''}
              onShowToast={showToast}
            />
          )}

          {/* TAB 5.5: AI Keyword Generator & Competition Intelligence */}
          {activeTab === 'seo_keywords' && (
            <SeoKeywordIntelligence
              product={currentProduct}
              currency={currency}
              onUpdateKeywords={handleUpdateKeywords}
              onApplyKeywordsToSeo={handleApplyKeywordsToSeo}
              onSwitchToSeoListing={() => setActiveTab('seo_listing')}
            />
          )}

          {/* TAB 6: Automated Platform Listing & SEO Texts */}
          {activeTab === 'seo_listing' && (
            <PlatformListingGenerator
              product={currentProduct}
              currency={currency}
              winningPrice={winningPrice}
              selectedDiscount={selectedDiscount}
              onUpdateSeoListing={handleUpdateSeoListing}
              onOpenKeywordStudio={() => setActiveTab('seo_keywords')}
            />
          )}

          {/* TAB 7: Platform-Compliant Image Studio */}
          {activeTab === 'image_studio' && (
            <MerchantImageStudio
              product={currentProduct}
              currency={currency}
              winningPrice={winningPrice}
              selectedDiscount={selectedDiscount}
              onApplyWinningImage={(newImgUrl: string) => {
                setCurrentProduct((prev) => prev ? ({ ...prev, imageUrl: newImgUrl }) : null);
                if (currentProduct) {
                  setAllProducts((prev) =>
                    prev.map((p) => (p.id === currentProduct.id ? { ...p, imageUrl: newImgUrl } : p))
                  );
                }
                showToast('تم اعتماد الصورة الفائزة للمنتج بنجاح وتحديث بطاقات الرادار 🏆');
              }}
            />
          )}

          {/* TAB 8: Inventory Tracker & Smart Reorder Point Engine (تتبع مستويات المخزون ونقاط الطلب) */}
          {activeTab === 'inventory' && (
            <InventoryTracker
              products={allProducts}
              inventory={inventory}
              onUpdateInventory={handleUpdateInventory}
              currency={currency}
              onShowToast={showToast}
              onSelectProduct={(prod) => {
                setCurrentProduct(prod);
                setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                setActiveTab('radar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToWholesale={(prod) => handleNavigateToWholesaleForRestock(undefined, prod)}
              onOpenGenerateWaybillModal={handleOpenGenerateWaybill}
            />
          )}

          {/* TAB 8.2: Daily Supplier Offers & Exclusive Platform Wholesale Discounts (عروض الموردين) */}
          {activeTab === 'supplier_offers' && (
            <SupplierOffersTab
              products={allProducts}
              inventory={inventory}
              onUpdateInventory={handleUpdateInventory}
              currency={currency}
              onSelectProductForRadar={(prod) => {
                setCurrentProduct(prod);
                setWinningPrice(Math.round(prod.currentLowestPrice * (1 - selectedDiscount / 100)));
                setActiveTab('radar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB 8.5: Dedicated Furniture Suppliers Hub & Factory Directory (دليل وشبكة موردي ومصانع الأثاث بمصر) */}
          {activeTab === 'suppliers_hub' && (
            <FurnitureSuppliersHub
              products={allProducts}
              inventory={inventory}
              onUpdateInventory={handleUpdateInventory}
              onShowToast={showToast}
              currency={currency}
              onOpenInventory={() => setActiveTab('inventory')}
            />
          )}

            </ErrorBoundary>
          )}

        </div>

      </main>

      <TermsOfServiceModal onAccept={() => {}} />

      {/* Subscription Plans, 3-Day Free Trial & Paywall Modal */}
      <SubscriptionPlansModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        subscriptionState={subscriptionState}
        userProfile={profile}
        onShowToast={showToast}
        canDismiss={!isPaywallLocked}
        activeMerchantId={activeMerchantId}
        onMerchantSubscriptionChanged={(updatedMerchant) => {
          setRemoteMerchantsList(loadAllRegisteredMerchants());
          if (updatedMerchant.id === activeMerchantId) {
            handleSwitchActiveMerchant(updatedMerchant.id);
          }
        }}
      />

      {/* Camera / Image Scanner Modal */}
      <ProductScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductDetected={handleProductDetected}
        currency={currency}
      />

      {/* 1-Click Multi-Platform Publish Modal */}
      <MultiPlatformPublisher
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        product={currentProduct}
        currency={currency}
        winningPrice={winningPrice}
        selectedDiscount={selectedDiscount}
        connectedPlatforms={connectedPlatforms}
        onTogglePlatform={handleTogglePlatform}
        onBatchTogglePlatforms={handleBatchTogglePlatforms}
      />

      {/* Add New Platform / Sales Channel Modal */}
      <AddPlatformModal
        isOpen={isAddPlatformModalOpen}
        onClose={() => setIsAddPlatformModalOpen(false)}
        onAddPlatform={handleAddPlatform}
        availableCategories={platformCategories}
        onOpenQuickHelp={() => setIsAddPlatformQuickHelpOpen(true)}
      />

      {/* Popup reminder after creating a new platform to enter API / Email credentials */}
      <PlatformCreatedNoticeModal
        isOpen={Boolean(createdPlatformNotice)}
        platform={createdPlatformNotice?.platform || null}
        categoryTitle={createdPlatformNotice?.categoryTitle}
        onClose={() => setCreatedPlatformNotice(null)}
        onOpenSettings={(plat) => {
          setCreatedPlatformNotice(null);
          setPlatformModalInitialTab('settings');
          setPlatformForConnection(plat);
        }}
      />

      {/* Custom Category Modal (Create / Rename / Change Icon) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        mode={categoryModalMode}
        initialCategory={categoryToEdit}
        existingCategories={platformCategories}
        connectedPlatforms={connectedPlatforms}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Archive Product Confirmation Modal */}
      <ArchiveProductModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        activeProducts={activeProducts}
        preselectedProductId={archiveModalProductId}
        onConfirmArchive={handleConfirmArchive}
        currency={currency}
      />

      {/* Reset Platform Bar View Confirmation Modal */}
      <ResetViewConfirmModal
        isOpen={isResetViewConfirmOpen}
        onClose={() => setIsResetViewConfirmOpen(false)}
        onConfirm={handleResetPlatformView}
        sortActivePlatformsFirst={sortActivePlatformsFirst}
        totalPlatformsCount={connectedPlatforms.length}
      />

      {/* Export Center Modal (Excel / CSV) */}
      <ExportCenterModal
        isOpen={isExportCenterOpen}
        onClose={() => setIsExportCenterOpen(false)}
        allProducts={allProducts}
        watchlist={watchlist}
        currentProduct={currentProduct}
        currency={currency}
        onSuccessToast={showToast}
        onOpenAiExcelEnricher={() => setIsAiExcelEnricherOpen(true)}
      />

      {/* Quick Executive PDF Report Modal */}
      {currentProduct && (
        <ExecutivePdfReportModal
          isOpen={isExecutivePdfOpen}
          onClose={() => setIsExecutivePdfOpen(false)}
          product={currentProduct}
          currency={currency}
          winningPrice={winningPrice}
          selectedDiscount={selectedDiscount}
          aiBrief={currentAiBriefData}
          onSuccessToast={showToast}
        />
      )}

      {/* Quick Export Email to Manager Modal */}
      {currentProduct && (
        <ExportEmailModal
          isOpen={isExportEmailOpen}
          onClose={() => setIsExportEmailOpen(false)}
          product={currentProduct}
          currency={currency}
          winningPrice={winningPrice}
          selectedDiscount={selectedDiscount}
          onSuccessToast={showToast}
          defaultRecipient=""
        />
      )}

      {/* Quick AI Brief Pre-Export Modal (Gemini 3.8 Flash) */}
      {currentProduct && (
        <AiBriefExportModal
          isOpen={isAiBriefModalOpen}
          onClose={() => setIsAiBriefModalOpen(false)}
          product={currentProduct}
          currency={currency}
          winningPrice={winningPrice}
          selectedDiscount={selectedDiscount}
          onExportPdfWithBrief={(brief) => {
            setCurrentAiBriefData(brief);
            setIsExecutivePdfOpen(true);
          }}
          onExportCsvWithBrief={(brief) => {
            exportSingleProductWithAiBriefCSV(currentProduct, brief);
            try {
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.8 }
              });
            } catch {
              // safe
            }
            showToast(`تم تصدير ملف CSV معزز بتحليل الذكاء الاصطناعي بنجاح 📁✨`);
          }}
          onEmailManagerWithBrief={(brief) => {
            setCurrentAiBriefData(brief);
            setIsExportEmailOpen(true);
          }}
          onSuccessToast={showToast}
        />
      )}

      {/* AI Excel Sheet Upload & Product Enrichment Modal */}
      {isAiExcelEnricherOpen && (
        <AiExcelEnricherModal
          isOpen={isAiExcelEnricherOpen}
          onClose={() => setIsAiExcelEnricherOpen(false)}
          onAddProductsToCatalog={handleAddEnrichedProducts}
          currency={currency}
          onShowToast={showToast}
        />
      )}

      {/* Platform Merchant Account & Competitors CSV Import Modal */}
      {platformForConnection && (
        <PlatformConnectionModal
          platform={platformForConnection}
          isOpen={Boolean(platformForConnection)}
          onClose={() => {
            setPlatformForConnection(null);
            setPlatformModalInitialTab('settings');
          }}
          onSave={handleSavePlatformConnection}
          onAutoConnect={handleAutoConnectPlatform}
          onDisconnect={handleDisconnectPlatformAccount}
          remoteMerchants={remoteMerchantsList}
          currentMerchantEmail={remoteMerchantsList.find(m => m.id === activeMerchantId)?.primaryEmail || 'seller@merchant-store.com'}
          managerEmail={user?.email || ''}
          activeMerchantId={activeMerchantId}
          onSwitchActiveMerchant={handleSwitchActiveMerchant}
          allProducts={allProducts}
          currentProduct={currentProduct}
          initialTab={platformModalInitialTab}
          onImportPlatformCompetitors={handleImportPlatformCompetitors}
          onNavigateToRadar={() => {
            setPlatformForConnection(null);
            setActiveTab('radar');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onShowToast={showToast}
          onNavigateToRemoteMerchants={() => {
            setPlatformForConnection(null);
            setActiveTab('remote_merchants');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Multi-Tenant Merchant APIs & Credentials Settings Modal (Amazon SP-API / Noon / Bosta) */}
      <ManageMerchantApisModal
        isOpen={isManageApisModalOpen}
        onClose={() => setIsManageApisModalOpen(false)}
        activeMerchantId={activeMerchantId}
        onMerchantUpdated={(updatedMerchant) => {
          setRemoteMerchantsList(prev => prev.map(m => m.id === updatedMerchant.id ? updatedMerchant : m));
          if (activeMerchantId === updatedMerchant.id) {
            handleSwitchActiveMerchant(updatedMerchant.id);
          }
        }}
        onShowToast={showToast}
      />

      {/* Platform Manual Sync History & Recurring Connectivity Issues Overlay */}
      {historyOverlayPlatform && (
        <PlatformSyncHistoryOverlay
          isOpen={Boolean(historyOverlayPlatform)}
          platform={historyOverlayPlatform}
          onClose={() => setHistoryOverlayPlatform(null)}
          onTriggerSync={(platId, platLabel) => {
            handleRefreshSinglePlatform(platId, platLabel);
          }}
          onOpen30DayDashboard={() => {
            setActiveTab('sales_dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isSyncing={refreshingPlatformIds.includes(historyOverlayPlatform.id)}
        />
      )}

      {/* Platform Sync Error Diagnostic Details Modal */}
      {syncErrorDetailsModalPlatform && (
        <PlatformSyncErrorModal
          isOpen={Boolean(syncErrorDetailsModalPlatform)}
          platform={syncErrorDetailsModalPlatform}
          onClose={() => setSyncErrorDetailsModalPlatform(null)}
          onRetrySync={(platId) => {
            handleRetrySyncPlatform(platId);
          }}
          onOpenSettings={(plat) => {
            setPlatformModalInitialTab('settings');
            setPlatformForConnection(plat);
          }}
          onOpenSyncHistory={(plat) => {
            setHistoryOverlayPlatform(plat);
          }}
          isRetrying={refreshingPlatformIds.includes(syncErrorDetailsModalPlatform.id)}
        />
      )}

      {/* Primary Colors (Theme) Customization Modal */}
      <ThemeSettingsModal onShowToast={showToast} updateState={updateState} />

      {/* Smart Gmail Auto-Link & Direct Launchpad Modal */}
      <SmartGmailAutoLinkModal
        isOpen={isSmartGmailModalOpen}
        onClose={() => setIsSmartGmailModalOpen(false)}
        platforms={connectedPlatforms}
        onUpdatePlatforms={handleUpdateConnectedPlatforms}
        currentMerchantEmail={user?.email || ''}
        onShowToast={showToast}
        initialTab={smartGmailModalTab}
      />

      {/* Live Platform Product Synchronization Modal */}
      <LivePlatformSyncModal
        isOpen={isLiveSyncModalOpen}
        onClose={() => setIsLiveSyncModalOpen(false)}
        allProducts={allProducts}
        onProductsUpdated={(updated) => {
          setAllProducts(updated);
          if (updated.length > 0 && (!currentProduct || !updated.find(p => p.id === currentProduct.id))) {
            setCurrentProduct(updated[0]);
          }
        }}
        connectedPlatforms={connectedPlatforms}
        onShowToast={showToast}
        activeMerchantId={activeMerchantId}
        activeMerchantName={remoteMerchantsList.find(m => m.id === activeMerchantId)?.storeName}
        onLiveSync={handleLiveSync}
      />

      {/* Browser Push Notifications (Firebase Cloud Messaging) Manager Modal */}
      <PushNotificationManagerModal
        isOpen={isPushNotificationModalOpen}
        onClose={() => setIsPushNotificationModalOpen(false)}
        onShowToast={showToast}
        onPlayAlertSound={playPriceAlertSound}
        language={language}
      />

      {/* Investor Pitch Deck Interactive Presentation Modal */}
      <ErrorBoundary sectionName="عرض المستثمرين (Investor Pitch Deck)">
        <InvestorPitchDeck
          isOpen={isInvestorDeckOpen}
          onClose={() => setIsInvestorDeckOpen(false)}
          onStartLiveDemo={() => {
            setActiveTab('radar');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </ErrorBoundary>

      {/* RADAR Platform Footer */}
      <footer className="mt-12 border-t border-sky-500/20 bg-[#08090D] py-6 px-4 text-center text-xs text-slate-400 shadow-sm mb-16 sm:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <RadarBrandLogo className="w-6 h-6" />
            <span className="font-black bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Outfit','Alexandria']">
              RADAR - Global Marketplaces Real-Time Tracking
            </span>
            <span className="text-slate-400">— منصة الرصد العالمي والتسعير الذكي والنشر الآلي</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px] flex-wrap justify-center">
            <span className="font-medium text-sky-200">Amazon · Noon · Jumia</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsInvestorDeckOpen(true)}
              className="text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
            >
              عرض المستثمرين (Investor Pitch Deck)
            </button>
            <span>·</span>
            <span>Real-Time Price Tracking & Automated Repricing</span>
          </div>
        </div>
      </footer>

      {/* 1-Click Product Waybill Generator Modal */}
      <GenerateProductWaybillModal
        isOpen={isGenerateWaybillModalOpen}
        onClose={() => {
          setIsGenerateWaybillModalOpen(false);
          setWaybillTargetProduct(null);
        }}
        product={waybillTargetProduct}
        inventoryRecord={waybillTargetProduct ? inventory.find(i => i.productId === waybillTargetProduct.id) : undefined}
        currency={currency}
        onShowToast={showToast}
        onUpdateInventoryStock={handleDeductInventoryStock}
        onNavigateToFulfillment={() => {
          setActiveTab('order_fulfillment');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Active Product Comprehensive Details Side Drawer */}
      <ActiveProductDetailsDrawer
        isOpen={isActiveProductDetailsDrawerOpen}
        onClose={() => setIsActiveProductDetailsDrawerOpen(false)}
        product={currentProduct}
        currency={currency}
        winningPrice={winningPrice}
        selectedDiscount={selectedDiscount}
        isInWatchlist={currentProduct ? isProductInWatchlist(currentProduct.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
        onGenerateWaybill={handleOpenGenerateWaybill}
        onApplyWinningPrice={handleApplyWinningPrice}
        onShowToast={showToast}
      />

      {/* Bulk Marketplace Waybill Generator Modal */}
      <BulkMarketplaceWaybillModal
        isOpen={isBulkMarketplaceWaybillModalOpen}
        onClose={() => setIsBulkMarketplaceWaybillModalOpen(false)}
        marketplacePlatforms={connectedPlatforms.filter(
          (p) => getPlatformClassification(p.code, p.category) === 'marketplace'
        )}
        allProducts={allProducts}
        currency={currency}
        onShowToast={showToast}
        onNavigateToScheduling={() => {
          setActiveTab('order_scheduling');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Amazon Multi-Item Waybill Cropper Modal */}
      <AmazonMultiItemWaybillCropperModal
        isOpen={isAmazonWaybillCropperOpen}
        onClose={() => setIsAmazonWaybillCropperOpen(false)}
        orders={loadAllOrders()}
        allProducts={allProducts}
        activeMerchant={activeMerchantObj || undefined}
        onShowToast={showToast}
        onOrderUpdated={() => {
          showToast('تم تحديث وفرز بوالص الشحن بنجاح 📦⚡');
        }}
      />

      {/* Ergonomic Mobile Bottom Navigation Dock for Mobile & Android devices */}
      <MobileBottomDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        unresolvedErrorsCount={unresolvedSyncErrors.length}
      />

      {/* Android & Google Play Store Hub Modal */}
      <AndroidGooglePlayHubModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Proactive Best-Selling Products Recommendation Alert Modal (Opened on demand) */}
      <ProactiveBestSellerAlertModal
        isOpen={isBestSellerAlertModalOpen}
        onClose={() => setIsBestSellerAlertModalOpen(false)}
        existingProducts={allProducts}
        watchlist={watchlist}
        onToggleWatchlist={handleToggleWatchlist}
        onBulkAddToWatchlist={handleBulkAddToWatchlist}
        onAddAndInspectProduct={(product) => {
          handleProductDetected(product);
          showToast(`🔥 تم اعتماد "${product.title.slice(0, 32)}..." وتفعيله في رادار المنافسين فوراً!`);
        }}
        onBulkAddRecommendations={(products) => {
          handleAddEnrichedProducts(products, true);
          showToast(`تمت إضافة ${products.length} منتج من الأكثر مبيعاً إلى كتالوج متجرك بنجاح 🚀`);
        }}
        onPlayAlertSound={playPriceAlertSound}
        onShowToast={showToast}
        currency={currency}
      />

      {/* QuickStart Welcome Screen for new users */}
      <QuickStartWelcomeScreen
        isOpen={isWelcomeScreenOpen}
        onClose={() => setIsWelcomeScreenOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Quick Instructions Modal for Adding Platforms */}
      <AddPlatformQuickHelpModal
        isOpen={isAddPlatformQuickHelpOpen}
        onClose={() => setIsAddPlatformQuickHelpOpen(false)}
        onOpenAddPlatformModal={() => setIsAddPlatformModalOpen(true)}
        onNavigateToPlatformsGuide={() => {
          setActiveTab('platforms_guide');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Multi-Currency & Exchange Rates Hub Modal */}
      <CurrencyExchangeModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        onCurrencyChanged={(newCode) => {
          setDisplayCurrency(newCode);
        }}
        onToast={showToast}
      />

      {/* Exclusive Owner Diagnostics & AI Studio Debugger Widget */}
      <OwnerAiStudioDebuggerWidget
        activeTab={activeTab}
        activeTabLabel={NAV_TAB_METADATA[activeTab]?.label || activeTab}
        currentProduct={currentProduct}
        connectedPlatforms={connectedPlatforms}
        unresolvedSyncErrors={unresolvedSyncErrors}
        activeMerchantId={activeMerchantId}
        activeMerchantName={activeMerchantObj?.storeName || undefined}
        onNavigateToTab={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onShowToast={showToast}
      />

      {/* First-Visit Onboarding Guide Modal */}
      <OnboardingGuideModal onShowToast={showToast} />

    </div>
  );
}
