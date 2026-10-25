import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu,
  X,
  PlusCircle,
  BarChart2,
  Tag,
  Zap,
  Camera, 
  Store, 
  TrendingDown, 
  TrendingUp,
  Send, 
  Layers, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Building2, 
  Image as ImageIcon, 
  Bookmark, 
  FileText, 
  Bell, 
  Smartphone, 
  Hash, 
  Users, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  BarChart3,
  Truck,
  ShieldCheck,
  Compass,
  Key,
  LineChart,
  Calendar,
  Calculator,
  Archive,
  AlertTriangle,
  Clock,
  Package,
  UserCheck,
  LogOut,
  LogIn,
  Cloud,
  Database,
  Settings,
  Palette,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Volume2,
  VolumeX,
  Rocket,
  ShieldAlert,
  Factory,
  Heart,
  Globe,
  Flame,
  Crown,
  Sun,
  Moon,
  Monitor,
  Presentation,
  Lock,
  Eye,
  Laptop
} from 'lucide-react';
import { ConnectedMerchantPlatform } from '../types';
import { isExportOverdue24h, getHoursSinceLastExport } from '../utils/csvProductManager';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAsyncOperations } from '../context/AsyncOperationsContext';
import { useAudioNotifications } from '../context/AudioNotificationContext';
import { LiveUpdateNotification } from './LiveUpdateNotification';
import { LiveStatusIndicator } from './LiveStatusIndicator';
import { AppUpdateState } from '../hooks/useAppUpdate';
import { subscribeToApiSyncErrors, loadLocalCachedErrors } from '../services/apiErrorLoggingService';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { RadarBrandLogo } from './RadarBrandLogo';
import { BayyaaLogo } from './BayyaaLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenScanner: () => void;
  onOpenPublishModal: () => void;
  onOpenExportModal?: () => void;
  onOpenAiExcelModal?: () => void;
  onOpenBestSellersModal?: () => void;
  onOpenInvestorDeck?: () => void;
  onShowToast?: (message: string) => void;
  connectedPlatforms: ConnectedMerchantPlatform[];
  productCount: number;
  watchlistCount?: number;
  activeAlertsCount?: number;
  remoteMerchantsCount?: number;
  archivedCount?: number;
  reorderAlertsCount?: number;
  updateState?: AppUpdateState;
  onOpenSmartGmailModal?: () => void;
  language?: 'ar' | 'en';
  onToggleLanguage?: () => void;
  onOpenPushNotificationModal?: () => void;
  onOpenAndroidModal?: () => void;
  onOpenInstallModal?: () => void;
  onOpenWindowsInstallModal?: () => void;
  onOpenMobileInstallModal?: () => void;
  onOpenManageApisModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  subscriptionBadgeLabel?: string;
  trialCountdownText?: string;
  isPaywallLocked?: boolean;
  onOpenWeeklySundaySchedulerModal?: () => void;
  activeMerchantId?: string;
  remoteMerchantsList?: Array<{
    id: string;
    storeName: string;
    contactPerson?: string;
    city?: string;
    platformsSubscribed?: string[];
  }>;
  onSwitchActiveMerchant?: (merchantId: string) => void;
  onOpenAllMerchantsHub?: () => void;
  isReadOnlyClientView?: boolean;
  onExitReadOnlyClientView?: () => void;
  onPullOrders?: () => void;
}

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isActive?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
  id?: string;
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  badge,
  isActive = false,
  isLocked = false,
  onClick,
  id
}) => (
  <button
    type="button"
    id={id}
    aria-pressed={isActive && !isLocked}
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-right ${
      isLocked
        ? 'bg-slate-900/50 hover:bg-slate-800/80 text-slate-400 border border-sky-500/20 opacity-75'
        : isActive
        ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-slate-950 font-black shadow-md shadow-sky-500/20 border border-sky-300'
        : 'text-slate-200 hover:bg-slate-800 hover:text-sky-300 border border-transparent hover:border-slate-700/80'
    }`}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <span className={`shrink-0 ${isActive && !isLocked ? 'text-slate-950' : 'text-sky-400'}`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
    {isLocked ? (
      <span className="text-[11px] text-sky-400 shrink-0">🔒</span>
    ) : badge ? (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
          isActive
            ? 'bg-slate-950/20 text-slate-950 font-black'
            : 'bg-slate-800/90 text-slate-400 border border-slate-700/70'
        }`}
      >
        {badge}
      </span>
    ) : null}
  </button>
);

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  onOpenPublishModal,
  onOpenExportModal,
  onOpenAiExcelModal,
  onOpenBestSellersModal,
  onOpenInvestorDeck,
  onShowToast,
  connectedPlatforms,
  productCount,
  watchlistCount = 2,
  activeAlertsCount = 3,
  remoteMerchantsCount = 4,
  archivedCount = 0,
  reorderAlertsCount = 0,
  updateState,
  onOpenSmartGmailModal,
  language = 'ar',
  onToggleLanguage,
  onOpenPushNotificationModal,
  onOpenAndroidModal,
  onOpenInstallModal,
  onOpenWindowsInstallModal,
  onOpenMobileInstallModal,
  onOpenManageApisModal,
  onOpenSubscriptionModal,
  subscriptionBadgeLabel,
  trialCountdownText,
  isPaywallLocked = false,
  onOpenWeeklySundaySchedulerModal,
  activeMerchantId,
  remoteMerchantsList = [],
  onSwitchActiveMerchant,
  onOpenAllMerchantsHub,
  isReadOnlyClientView = false,
  onExitReadOnlyClientView,
  onPullOrders,
}) => {
  const { isPlatformSyncing, isCsvExporting, isDatabaseBusy } = useAsyncOperations();
  const { settings: audioSettings, setActiveGlobalSettingsTab } = useAudioNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isExportOverdue, setIsExportOverdue] = useState<boolean>(false);
  const [hoursSinceExport, setHoursSinceExport] = useState<number | null>(null);
  const [showExportTooltip, setShowExportTooltip] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [editStoreName, setEditStoreName] = useState<string>('');
  const [editCity, setEditCity] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [unresolvedApiErrorsCount, setUnresolvedApiErrorsCount] = useState<number>(() => {
    return loadLocalCachedErrors().filter(e => e.status === 'unresolved').length;
  });

  useEffect(() => {
    const unsub = subscribeToApiSyncErrors((errs) => {
      const unres = errs.filter(e => e.status === 'unresolved').length;
      setUnresolvedApiErrorsCount(unres);
    });
    return () => unsub();
  }, []);

  const { 
    user, 
    profile, 
    sessionData,
    isLoading: isAuthLoading, 
    isDbConnected, 
    isOwner,
    signInWithGoogle, 
    signInAsGuest,
    signInAsOwner,
    signInDemoMerchant,
    signOut, 
    updateStoreProfile, 
    loginError, 
    clearLoginError 
  } = useAuth();

  const { 
    currentTheme, 
    allThemes, 
    setPrimaryTheme, 
    setIsThemeModalOpen,
    colorMode,
    resolvedColorMode,
    systemColorScheme,
    setColorMode,
    toggleColorMode,
    cycleColorMode
  } = useTheme();

  useEffect(() => {
    if (profile) {
      setEditStoreName(profile.storeName || 'متجر التاجر المصري');
      setEditCity(profile.city || 'القاهرة');
    }
  }, [profile]);

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await updateStoreProfile({
        storeName: editStoreName.trim(),
        city: editCity.trim(),
      });
      setIsEditProfileModalOpen(false);
    } catch {
      // safe fallback
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    const checkExport = () => {
      setIsExportOverdue(isExportOverdue24h());
      setHoursSinceExport(getHoursSinceLastExport());
    };

    checkExport();

    const handleExportCompleted = () => {
      checkExport();
    };

    window.addEventListener('merchant_export_completed', handleExportCompleted);
    return () => {
      window.removeEventListener('merchant_export_completed', handleExportCompleted);
    };
  }, []);

  const activePlatformsCount = connectedPlatforms.filter(p => p.isConnected).length;

  const [selectedNavCategory, setSelectedNavCategory] = useState<'all' | 'pricing' | 'stock' | 'ai' | 'reports'>('all');
  const navTabsContainerRef = useRef<HTMLDivElement>(null);

  const scrollNavTabs = (direction: 'left' | 'right') => {
    if (navTabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      navTabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const navCategories = [
    { id: 'all' as const, label: 'جميع الشاشات (28)' },
    { id: 'pricing' as const, label: '⚡ التسعير والرادار (8)' },
    { id: 'stock' as const, label: '📦 المخزون والتوريد (7)' },
    { id: 'ai' as const, label: '🎯 الذكاء والمتابعة (7)' },
    { id: 'reports' as const, label: '📊 التقارير والإدارة (6)' },
  ];

  const navItems = useMemo(() => [
    { id: 'radar', label: 'رادار المنافسين والتسعير', icon: TrendingDown, badge: 'مباشر ⚡', category: 'pricing' },
    { id: 'loyalty_rewards', label: 'مقارنة الأسعار ومكافآت الولاء', icon: Crown, badge: 'كاميرا وولاء 🎁', category: 'pricing' },
    { id: 'direct_competitors', label: 'المنافسون المباشرون', icon: Users, badge: 'مقارنة Buy Box 🏆', category: 'pricing' },
    { id: 'smart_market_analytics', label: 'تحليلات السوق الذكية', icon: LineChart, badge: 'اتجاهات 30 يوم 📊', category: 'pricing' },
    { id: 'supplier_offers', label: 'عروض الموردين', icon: Flame, badge: 'جملة يومية وخصومات 👑', category: 'stock' },
    { 
      id: 'order_fulfillment', 
      label: 'جدولة وتتبع أوامر الشحن (Fulfillment)', 
      icon: Truck, 
      badge: 'ربط البوالص والمخزون 📦🚚', 
      category: 'stock' 
    },
    { 
      id: 'admin_error_logs', 
      label: 'لوحة المدير وسجل أخطاء API', 
      icon: ShieldAlert, 
      badge: unresolvedApiErrorsCount > 0 ? `${unresolvedApiErrorsCount} عطل نشط 🚨` : 'سجل الأعطال 🚨', 
      category: 'reports' 
    },
    { 
      id: 'user_logs', 
      label: 'سجل نشاط وحركات المستخدمين', 
      icon: FileText, 
      badge: 'سجل النشاط 📜', 
      category: 'reports' 
    },
    { id: 'remote_merchants', label: 'متابعة التجار وتقاريرهم', icon: Users, badge: `${remoteMerchantsCount} تجار وإيميلات 👥`, category: 'pricing' },
    { id: 'sales_dashboard', label: 'لوحة أداء المبيعات والتسعير', icon: LineChart, badge: 'تحليلات بيعية 📈', category: 'pricing' },
    { id: 'archived_products', label: 'أرشيف المنتجات غير النشطة', icon: Archive, badge: `${archivedCount} مؤرشف 🗄️`, category: 'stock' },
    { id: 'platform_commissions', label: 'حاسبة عمولات المنصات', icon: Calculator, badge: 'أمازون ونون وكنز 🧮', category: 'pricing' },
    { id: 'seasonal_forecast', label: 'توقع الطلب الموسمي والذروة', icon: Calendar, badge: 'تنبؤ بالمخزون 📦⚡', category: 'stock' },
    { id: 'market_trends', label: 'رادار اتجاهات السوق والطلب', icon: Compass, badge: 'رائج بمصر 📈', category: 'ai' },
    { id: 'order_scheduling', label: 'جدولة الطلبات وبوالص الشحن', icon: Truck, badge: 'بوالص منفصلة 🚚', category: 'stock' },
    { id: 'pricing_guardrails', label: 'حدود حماية التسعير والمنصات', icon: ShieldCheck, badge: 'أمان الأرباح 🛡️', category: 'pricing' },
    { id: 'marketer_hub', label: 'صلاحيات المسوق والرقابة', icon: Key, badge: 'تحكم وصلاحيات 👑', category: 'reports' },
    { id: 'profit_simulator', label: 'محاكي الربح المستقبلي', icon: TrendingUp, badge: 'نمذجة تنبؤية 💎', category: 'pricing' },
    { id: 'periodic_reports', label: 'تقارير الأداء والرسوم البيانية', icon: BarChart3, badge: 'مخططات دورية 📊', category: 'reports' },
    { id: 'bulk_repricing', label: 'التحديث الجماعي للأسعار وCSV', icon: SlidersHorizontal, badge: 'استراتيجيات CSV 🚀', category: 'pricing' },
    { id: 'watchlist', label: 'قائمة المتابعة والرصد', icon: Bookmark, badge: `${watchlistCount} محفوظ`, category: 'ai' },
    { id: 'wishlist', label: 'قائمة أمنيات التاجر والصفقات', icon: Heart, badge: 'أمنيات 🎯', category: 'ai' },
    { id: 'seo_keywords', label: 'توليد الكلمات وقوة المنافسة', icon: Hash, badge: 'جديد AI 🚀', category: 'ai' },
    { id: 'seo_listing', label: 'نصوص السيو الجاهزة', icon: Layers, badge: 'SEO 📑', category: 'ai' },
    { id: 'image_studio', label: 'استوديو تصوير وزوايا المنتج', icon: ImageIcon, badge: 'كاميرا وزوايا 📸', category: 'ai' },
    { 
      id: 'inventory', 
      label: 'تتبع مستويات المخزون ونقاط الطلب', 
      icon: Package, 
      badge: reorderAlertsCount > 0 ? `${reorderAlertsCount} بحاجة لتوريد ⚠️` : 'مخزون ذكي 📦',
      category: 'stock'
    },
    { 
      id: 'suppliers_hub', 
      label: 'دليل وشبكة موردي ومصانع الأثاث', 
      icon: Factory, 
      badge: 'دمياط ومصر 🏭', 
      category: 'stock' 
    },
    { id: 'wholesale', label: 'أسواق ومراكز خامات الأثاث', icon: Building2, badge: 'دمياط ومراكز مصر', category: 'stock' },
    { id: 'price_alerts', label: 'تنبيهات هبوط الأسعار', icon: Bell, badge: 'واتساب 📲', category: 'ai' },
    { id: 'platforms_guide', label: 'دليل المنصات والاشتراك والأوراق', icon: FileText, badge: 'شروط وأوراق 📑', category: 'reports' },
  ], [archivedCount, remoteMerchantsCount, watchlistCount, reorderAlertsCount, unresolvedApiErrorsCount]);

  const displayedNavItems = useMemo(() => {
    if (selectedNavCategory === 'all') return navItems;
    return navItems.filter(item => item.category === selectedNavCategory);
  }, [selectedNavCategory, navItems]);

  const LOCKED_NAV_TABS = useMemo(
    () =>
      new Set([
        'radar',
        'direct_competitors',
        'smart_market_analytics',
        'bulk_repricing',
        'seo_keywords',
        'seo_listing',
        'image_studio',
        'profit_simulator',
        'market_trends',
      ]),
    []
  );

  return (
    <header className="sticky top-0 z-40 bg-[#F8FAFC] border-b-2 border-[#000000] shadow-sm text-[#000000]">
      {/* Top Merchant Intelligence Bar */}
      <div className="bg-[#F8FAFC] text-[#000000] text-xs py-1.5 px-4 sm:px-8 border-b-2 border-[#000000]">
        <div className="w-full px-4 md:px-8 max-w-none flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-[#000000] text-sm">
              RADAR · منظومة التسعير الذكي وإدارة المتاجر المصرية (EGP · VAT 14%)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            {isReadOnlyClientView && (
              <div className="flex items-center gap-2 bg-sky-500/20 border border-sky-400/50 text-sky-200 px-2.5 py-0.5 rounded-md font-bold">
                <Eye className="w-3.5 h-3.5 text-sky-300" />
                <span>وضع معاينة العميل (للقراءة فقط - Read-Only)</span>
                {onExitReadOnlyClientView && (
                  <button
                    type="button"
                    onClick={onExitReadOnlyClientView}
                    className="underline text-white hover:text-sky-300 mr-1 cursor-pointer"
                  >
                    إنهاء المعاينة
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold font-mono tabular-nums">{activePlatformsCount}/{connectedPlatforms.length}</span>
              <span>منصات متصلة بالتاجر</span>
              <LiveStatusIndicator variant="compact" showLatency={true} />
            </div>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <div className="hidden sm:flex items-center gap-1.5">
              {isPlatformSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  <span className="text-sky-300 font-bold">جاري مزامنة قنوات البيع...</span>
                </>
              ) : isDatabaseBusy ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                  <span className="text-sky-200 font-bold">جاري حفظ وتحديث السحابة...</span>
                </>
              ) : isCsvExporting ? (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-300 animate-bounce" />
                  <span className="text-sky-300 font-bold">جاري معالجة وتصدير CSV...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-slate-300">مزامنة المخزون والأسعار مفعلة</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Client & Multi-Store Agency Workspace Switcher Bar */}
      {remoteMerchantsList.length > 0 && onSwitchActiveMerchant && (
        <div
          id="agency-client-workspace-switcher-bar"
          className="bg-slate-950/95 border-b border-sky-500/20 px-4 sm:px-8 py-2 text-xs"
        >
          <div className="w-full px-4 md:px-8 max-w-none flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 overflow-x-auto scroller-sm py-0.5">
              <span className="text-[11px] font-black text-sky-400 flex items-center gap-1.5 shrink-0">
                <Store className="w-3.5 h-3.5 text-sky-400" />
                <span>التبديل السريع بين التجار (Agency Workspaces):</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {remoteMerchantsList.map((merch) => {
                  const isCurrent = merch.id === activeMerchantId;
                  const storeCount = merch.platformsSubscribed?.length || 3;
                  return (
                    <button
                      key={merch.id}
                      type="button"
                      id={`btn-workspace-switch-${merch.id}`}
                      aria-pressed={isCurrent}
                      onClick={() => onSwitchActiveMerchant(merch.id)}
                      className={`h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                        isCurrent
                          ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-[#08090D] border-sky-300 font-black shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-200 border-slate-800'
                      }`}
                      title={`التبديل إلى مساحة عمل ${merch.storeName} (${storeCount} متاجر مرتبطة)`}
                    >
                      <span>{merch.storeName}</span>
                      <LiveStatusIndicator storeId={merch.id} storeName={merch.storeName} variant="compact" showLatency={false} />
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                          isCurrent ? 'bg-[#08090D]/20 text-[#08090D] font-black' : 'bg-slate-800 text-sky-300/90'
                        }`}
                      >
                        {storeCount} متاجر
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenWeeklySundaySchedulerModal && (
                <button
                  type="button"
                  id="btn-header-weekly-sunday-scheduler"
                  onClick={onOpenWeeklySundaySchedulerModal}
                  className="h-7 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/35 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  title="جدولة إرسال تقارير الأداء الأسبوعية (PDF) عبر البريد الإلكتروني كل يوم أحد"
                >
                  <Calendar className="w-3 h-3 text-sky-400" />
                  <span>جدولة تقرير الأحد (PDF)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('remote_merchants');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-7 px-2.5 rounded-md bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              >
                <Users className="w-3 h-3 text-sky-400" />
                <span>لوحة المسوق الشاملة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. الشريط العلوي (الواجهة الرئيسية المخصصة للعمليات اليومية فقط) */}
      <div className="w-full px-4 md:px-8 max-w-none py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* زر فتح القائمة الجانبية + شعار وعنوان رادار التاجر الذكي */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-open-main-sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="h-10 px-3.5 bg-[#F8FAFC] text-[#000000] rounded-xl flex items-center justify-center gap-2 transition border-2 border-[#000000] cursor-pointer active:scale-95 shrink-0"
              title="فتح قائمة الأدوات وجميع الأقسام والشاشات"
            >
              <Menu className="w-4 h-4 text-[#000000] shrink-0" />
              <span className="text-xs sm:text-sm font-bold hidden md:inline">جميع الأقسام والشاشات</span>
            </button>

            {/* Main Radar Brand Identity */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => setActiveTab('radar')}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-[#000000]">
                    رادار التاجر الذكي
                  </h1>
                  <span className="text-[10px] font-extrabold bg-[#000000] text-amber-300 border border-[#000000] px-2 py-0.5 rounded-md hidden lg:inline-block font-mono" dir="ltr">
                    RADAR EG
                  </span>
                </div>
                <p className="text-[11px] text-[#000000] font-semibold hidden sm:block">
                  Amazon.eg · Noon · Jumia — منصة تتبع الأسعار والعمليات اليومية
                </p>
              </div>
            </div>

            {/* Standalone Official Bayyaa Marketplace Header Graphic */}
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-[#0F2A4A] border-2 border-[#FF6B00] shadow-md shadow-[#0F2A4A]/20 cursor-pointer hover:scale-105 transition-all"
              onClick={() => setActiveTab('products')}
              title="الانتقال إلى متجر ومنصة بياع (Bayyaa Marketplace)"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FF6B00] p-0.5 flex items-center justify-center shrink-0 overflow-hidden border border-white">
                <BayyaaLogo variant="icon" className="w-full h-full" imgClassName="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-white font-['Alexandria']">
                    منصة بياع
                  </span>
                  <span className="text-[8px] font-black bg-[#FF6B00] text-white px-1 py-0.2 rounded">
                    رسمي
                  </span>
                </div>
                <span className="text-[9px] text-amber-400 font-extrabold tracking-wider uppercase font-mono">
                  Bayyaa
                </span>
              </div>
            </div>
          </div>

          {/* الأزرار الرئيسية الفعالة في الواجهة بتناسق ومحاذاة موحدة */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* أزرار تثبيت التطبيق دائمي الظهور ولا يختفيان أبداً لكافة المنصات والأجهزة */}
            <div id="btn-header-install-app" className="flex items-center gap-1.5 shrink-0">
              {/* 1. زر تثبيت الهواتف الذكية (Mobile) */}
              <button
                type="button"
                id="btn-header-install-mobile"
                onClick={() => {
                  if (onOpenMobileInstallModal) {
                    onOpenMobileInstallModal();
                  } else if (onOpenInstallModal) {
                    onOpenInstallModal();
                  } else {
                    window.dispatchEvent(new CustomEvent('open-pwa-install-modal', { detail: { category: 'mobile', subTab: 'android' } }));
                  }
                }}
                className="h-10 px-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold rounded-xl text-xs sm:text-sm transition shadow-sm cursor-pointer active:scale-95 shrink-0 border border-emerald-400/30 select-none whitespace-nowrap"
                title="تثبيت الهواتف الذكية (Android · iPhone/iOS) مع شهادة الاعتماد الرقمية الموثقة"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
                </span>
                <Smartphone className="w-4 h-4 shrink-0 text-white" />
                <span className="whitespace-nowrap">تثبيت الهواتف الذكية (Mobile) 📱</span>
              </button>

              {/* 2. زر تثبيت الويندوز (Windows Desktop) */}
              <button
                type="button"
                id="btn-header-install-windows"
                onClick={() => {
                  if (onOpenWindowsInstallModal) {
                    onOpenWindowsInstallModal();
                  } else if (onOpenInstallModal) {
                    onOpenInstallModal();
                  } else {
                    window.dispatchEvent(new CustomEvent('open-pwa-install-modal', { detail: { category: 'windows' } }));
                  }
                }}
                className="h-10 px-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold rounded-xl text-xs sm:text-sm transition shadow-sm cursor-pointer active:scale-95 shrink-0 border border-sky-400/30 select-none whitespace-nowrap"
                title="تثبيت الويندوز (Windows Desktop 10/11) كبرنامج مستقل مع شهادة الاعتماد"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-300" />
                </span>
                <Laptop className="w-4 h-4 shrink-0 text-white" />
                <span className="whitespace-nowrap">تثبيت الويندوز (Windows) 💻</span>
              </button>

              {/* زر دليل ملفات جميع التجار (All Merchants Hub) */}
              <button
                type="button"
                id="btn-header-all-merchants-hub"
                onClick={() => {
                  if (onOpenAllMerchantsHub) {
                    onOpenAllMerchantsHub();
                  } else {
                    window.dispatchEvent(new CustomEvent('open-all-merchants-hub'));
                  }
                }}
                className="h-10 px-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold rounded-xl text-xs sm:text-sm transition shadow-sm cursor-pointer active:scale-95 shrink-0 border border-indigo-400/30 select-none whitespace-nowrap"
                title="دليل ملفات جميع التجار - عرض وقائمة جميع التجار والمنصات المرتبطة ومعرفاتهم وتصدير التقارير"
              >
                <Users className="w-4 h-4 shrink-0 text-white" />
                <span className="whitespace-nowrap">دليل ملفات جميع التجار 👥</span>
              </button>
            </div>
            {/* زر منتجات التريند والأعلى مبيعات (الصين 👈 مصر) */}
            {onOpenBestSellersModal && (
              <button
                type="button"
                id="btn-header-trending-chinese-imports"
                onClick={onOpenBestSellersModal}
                className="h-10 px-3.5 flex items-center justify-center gap-2 bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] font-bold rounded-xl text-xs sm:text-sm transition shadow-xs cursor-pointer active:scale-95 group hover:bg-amber-50 shrink-0"
                title="منتجات التريند والأعلى مبيعات (الصين 👈 مصر) - تصفح كتالوج السلع الأكثر طلباً وربحية بالأسواق المصرية"
              >
                <Flame className="w-4 h-4 shrink-0 text-[#000000] fill-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold whitespace-nowrap">منتجات التريند (الصين 👈 مصر)</span>
                <span className="hidden xl:inline text-[10px] bg-[#000000] text-white px-2 py-0.5 rounded-md font-mono">
                  Top Trending
                </span>
              </button>
            )}

            {/* زر مسح منتج جديد */}
            <button
              type="button"
              id="btn-header-toolbar-scan-product"
              onClick={onOpenScanner}
              className="h-10 px-3.5 flex items-center justify-center gap-2 bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] font-bold rounded-xl text-xs sm:text-sm transition shadow-xs cursor-pointer active:scale-95"
              title="مسح باركود منتج جديد بالكاميرا أو إدخاله يدوياً"
            >
              <PlusCircle className="w-4 h-4 shrink-0 text-[#000000]" />
              <span>مسح منتج جديد</span>
            </button>

            {/* زر سحب الطلبات */}
            <button
              type="button"
              id="btn-header-pull-orders"
              onClick={() => {
                if (isPaywallLocked && onOpenSubscriptionModal) {
                  onOpenSubscriptionModal();
                  return;
                }
                if (onPullOrders) {
                  onPullOrders();
                } else {
                  setActiveTab('remote_merchants');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="h-10 px-3.5 flex items-center justify-center gap-2 bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] font-bold rounded-xl text-xs sm:text-sm transition shadow-xs cursor-pointer active:scale-95"
              title="سحب ومزامنة الطلبات الحية للمتجر النشط"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 text-[#000000] ${isPlatformSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">سحب الطلبات</span>
            </button>

            {/* Global Search Bar (Request 3: Instant filtering) */}
            <div className="relative h-10 min-w-[200px] lg:min-w-[300px] hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث سريع في المنتجات (الاسم أو الكود)..."
                onChange={(e) => {
                  window.dispatchEvent(new CustomEvent('merchant_global_search', { detail: { query: e.target.value } }));
                }}
                className="w-full h-full pr-9 pl-4 rounded-xl bg-[#F8FAFC] border-2 border-[#000000] text-xs font-bold text-[#000000] placeholder:text-slate-500 focus:outline-none focus:bg-white transition-all shadow-xs"
              />
            </div>

            {/* Quick Dark/Light Mode Toggle Button */}
            <button
              type="button"
              id="btn-header-toggle-dark-mode"
              onClick={() => {
                toggleColorMode();
                if (onShowToast) {
                  onShowToast(resolvedColorMode === 'dark' ? '☀️ تم التبديل إلى الوضع النهاري (Light Mode)' : '🌙 تم التبديل إلى الوضع الليلي لراحة العين (Dark Mode)');
                }
              }}
              className="h-10 px-3 flex items-center justify-center gap-1.5 bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] font-bold rounded-xl text-xs sm:text-sm transition shadow-xs cursor-pointer active:scale-95 shrink-0"
              title={resolvedColorMode === 'dark' ? "التبديل للوضع النهاري (Light Mode)" : "التبديل للوضع الليلي لراحة العين (Dark Mode)"}
            >
              {resolvedColorMode === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden md:inline text-xs font-bold">وضع نهاري ☀️</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="hidden md:inline text-xs font-bold">وضع ليلي 🌙</span>
                </>
              )}
            </button>

            {/* Cloud Database & Authentication Widget */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  id="btn-header-user-profile"
                  className="h-10 px-3 rounded-xl bg-[#F8FAFC] border-2 border-[#000000] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  title="إعدادات الحساب التجاري وقاعدة البيانات السحابية"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full border border-sky-400/50 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-black">
                      {profile?.displayName ? profile.displayName.charAt(0) : 'ت'}
                    </div>
                  )}
                  <div className="text-right hidden xl:block">
                    <div className="text-[11px] font-black text-slate-100 leading-tight truncate max-w-[90px]">
                      {profile?.displayName || 'التاجر'}
                    </div>
                    <div className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>متصل</span>
                    </div>
                  </div>
                </button>

                {/* User Profile & Store Settings Dropdown */}
                {showUserMenu && (
                  <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-fadeIn text-right">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full border border-slate-300 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-base font-bold">
                          {profile?.displayName ? profile.displayName.charAt(0) : 'ت'}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="text-xs font-black text-slate-900 truncate">{profile?.displayName || user.displayName}</div>
                        <div className="text-[10px] text-slate-500 truncate" dir="ltr">{profile?.email || user.email}</div>
                        <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                          {profile?.storeName || 'متجر التاجر المصري'} • {profile?.city || 'القاهرة'}
                        </div>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px]">
                        <span className="font-bold flex items-center gap-1">
                          <Database className="w-3.5 h-3.5 text-emerald-600" />
                          قاعدة بيانات Firestore
                        </span>
                        <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px]">
                          متصل ومحمي 🔒
                        </span>
                      </div>

                      {/* Active Session Linked Data */}
                      {sessionData && (
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="font-medium">رقم الجلسة:</span>
                            <span className="font-bold text-indigo-700">#{sessionData.sessionCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[10px]">
                            <span>آخر تسجيل دخول:</span>
                            <span className="font-semibold">{sessionData.lastLoginAt}</span>
                          </div>
                        </div>
                      )}

                      {/* Smart Gmail Auto-Link & Direct Launchpad */}
                      {onOpenSmartGmailModal && (
                        <button
                          type="button"
                          id="btn-usermenu-smart-gmail"
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenSmartGmailModal();
                          }}
                          className="w-full text-right px-2.5 py-2 rounded-xl bg-linear-to-r from-indigo-50/70 to-sky-50/70 hover:from-indigo-100/70 hover:to-sky-100/70 text-indigo-950 flex items-center justify-between cursor-pointer font-bold text-xs border border-indigo-100"
                        >
                          <span className="flex items-center gap-2">
                            <Rocket className="w-3.5 h-3.5 text-indigo-600" />
                            <span>ربط المنصات بـ Gmail ومراكز البائعين</span>
                          </span>
                          <span className="text-[10px] text-white font-bold bg-indigo-600 px-1.5 py-0.5 rounded-full shadow-2xs">
                            ⚡ Direct
                          </span>
                        </button>
                      )}

                      {/* Subscription Plans & Trial Status Menu Item */}
                      {onOpenSubscriptionModal && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenSubscriptionModal();
                          }}
                          id="btn-usermenu-subscription-plans"
                          className="w-full text-right px-2.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-200 flex items-center justify-between cursor-pointer font-bold text-xs"
                        >
                          <span className="flex items-center gap-2">
                            <Crown className="w-3.5 h-3.5 text-sky-600" />
                            <span>باقات الاشتراك والتجربة (3 أيام)</span>
                          </span>
                          <span className="text-[10px] text-sky-900 font-black bg-sky-200/80 px-1.5 py-0.5 rounded">
                            {subscriptionBadgeLabel || '3 أيام مجاناً'}
                          </span>
                        </button>
                      )}

                      {/* Manage Merchant APIs Button */}
                      {onOpenManageApisModal && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenManageApisModal();
                          }}
                          id="btn-usermenu-manage-merchant-apis"
                          className="w-full text-right px-2.5 py-2 rounded-xl hover:bg-indigo-50 text-indigo-900 flex items-center justify-between cursor-pointer font-bold text-xs"
                        >
                          <span className="flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-indigo-600" />
                            <span>إدارة مفاتيح ربط التجار (APIs)</span>
                          </span>
                          <span className="text-[10px] text-sky-800 font-bold bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300">
                            متعدد التجار 🏬
                          </span>
                        </button>
                      )}

                      {/* Custom Audio Notifications Settings Button */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveGlobalSettingsTab('audio');
                          setIsThemeModalOpen(true);
                        }}
                        id="btn-usermenu-audio-settings"
                        className="w-full text-right px-2.5 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer font-bold text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>إشعارات الصوت (أسعار ومنافسين)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          {audioSettings.isMasterEnabled ? (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              مفعل 🔊
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal bg-slate-100 px-1.5 py-0.5 rounded">
                              مكتوم 🔇
                            </span>
                          )}
                        </span>
                      </button>

                      {/* Primary Color Customizer Button */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveGlobalSettingsTab('theme');
                          setIsThemeModalOpen(true);
                        }}
                        id="btn-usermenu-theme-settings"
                        className="w-full text-right px-2.5 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer font-bold text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <Palette className="w-3.5 h-3.5 text-slate-500" />
                          <span>ألوان لوحة التحكم (Primary Colors)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: currentTheme.primaryHex }}
                          />
                          <span className="text-[10px] text-slate-400 font-normal">{currentTheme.name}</span>
                        </span>
                      </button>

                      {/* Quick Wishlist & User Logs links in user dropdown */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('wishlist');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full text-right px-2.5 py-2 rounded-xl hover:bg-rose-50/80 text-rose-800 flex items-center justify-between cursor-pointer font-bold text-xs transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
                          <span>قائمة أمنياتي والصفقات</span>
                        </span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full">
                          أمنيات 🎯
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('user_logs');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full text-right px-2.5 py-2 rounded-xl hover:bg-indigo-50/80 text-indigo-900 flex items-center justify-between cursor-pointer font-bold text-xs transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>سجل حركات وعمليات الحساب</span>
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                          Audit 📜
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsEditProfileModalOpen(true);
                        }}
                        className="w-full text-right px-2.5 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer font-bold"
                      >
                        <span className="flex items-center gap-2">
                          <Settings className="w-3.5 h-3.5 text-slate-500" />
                          إعدادات المتجر والموقع
                        </span>
                        <span className="text-[10px] text-slate-400">تعديل</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      {isOwner ? (
                        <button
                          type="button"
                          id="btn-usermenu-switch-to-merchant"
                          onClick={async () => {
                            setShowUserMenu(false);
                            await signInDemoMerchant();
                            onShowToast?.('تم التبديل لمنظور تاجر عادي (تم إخفاء زر مناقشة Google AI Studio من الـ DOM) 👤');
                          }}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="معاينة المنظومة كتاجر عادي للتحقق من اختفاء زر الأونر تماماً من شجرة الـ DOM"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-600" />
                          <span>معاينة منظور تاجر آخر (إخفاء زر الأونر)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          id="btn-usermenu-switch-to-owner"
                          onClick={async () => {
                            setShowUserMenu(false);
                            await signInAsOwner();
                            onShowToast?.('تم الدخول بحساب مالكة التطبيق (jassmeinnour@gmail.com) وتفعيل زر مناقشة Google AI Studio 🛠️👑');
                          }}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="تفعيل جلسة مالكة التطبيق (jassmeinnour@gmail.com)"
                        >
                          <Crown className="w-3.5 h-3.5 text-sky-600" />
                          <span>تفعيل حساب المالكة (jassmeinnour@gmail.com) 🛠️</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => signInWithGoogle()}
                  disabled={isAuthLoading}
                  id="btn-header-google-login"
                  className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold font-['Alexandria'] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-60 select-none shrink-0"
                  title="تسجيل الدخول وربط قاعدة البيانات السحابية لحفظ بيانات المتجر والتسعير"
                >
                  <Cloud className="w-4 h-4 text-blue-100 shrink-0" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                  <span className="sm:hidden">دخول</span>
                </button>

                <button
                  onClick={() => signInAsGuest()}
                  disabled={isAuthLoading}
                  id="btn-header-guest-login"
                  className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-['Alexandria'] flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-60 select-none shrink-0 border border-slate-200"
                  title="دخول سريع كتاجر ضيف بدون حساب Google لتجربة المنظومة"
                >
                  <span>ضيف</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* 2. الشريط الجانبي (Sidebar) - لتنسيق باقي الأزرار والشاشات ومنع الزحمة في الشريط العلوي */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          />
        )}

        <aside
          id="main-navigation-sidebar"
          className={`sidebar-drawer ${
            isSidebarOpen ? 'open translate-x-0' : 'closed translate-x-full'
          } fixed top-0 right-0 h-screen w-80 bg-slate-900 border-l border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl`}
        >
          {/* رأس القائمة الجانبية */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-400" />
              <span>قائمة الأدوات والشاشات</span>
            </h2>
            <button
              type="button"
              id="btn-close-main-sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-100 rounded-md transition cursor-pointer"
              title="إغلاق القائمة الجانبية"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* محتوى الأزرار المجمعة في مجموعات منظمة */}
          <div className="p-4 overflow-y-auto flex-1 space-y-6">
            {/* قسم الذكاء والتسعير */}
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block mb-2">
                الذكاء والتسعير
              </span>
              <div className="space-y-1">
                <SidebarButton
                  id="sidebar-btn-install-mobile"
                  icon={<Smartphone className="w-4 h-4 text-emerald-400" />}
                  label="تثبيت الهواتف الذكية (Mobile)"
                  badge="Android · iOS 📱"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (onOpenMobileInstallModal) {
                      onOpenMobileInstallModal();
                    } else if (onOpenInstallModal) {
                      onOpenInstallModal();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-pwa-install-modal', { detail: { category: 'mobile', subTab: 'android' } }));
                    }
                  }}
                />
                <SidebarButton
                  id="sidebar-btn-install-windows"
                  icon={<Laptop className="w-4 h-4 text-sky-400" />}
                  label="تثبيت الويندوز (Windows Desktop)"
                  badge="Win 10/11 💻"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (onOpenWindowsInstallModal) {
                      onOpenWindowsInstallModal();
                    } else if (onOpenInstallModal) {
                      onOpenInstallModal();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-pwa-install-modal', { detail: { category: 'windows' } }));
                    }
                  }}
                />
                <SidebarButton
                  id="sidebar-btn-smart-analytics"
                  icon={<BarChart2 className="w-4 h-4" />}
                  label="تحليلات السوق الذكية"
                  badge="30 يوم 📊"
                  isActive={activeTab === 'smart_market_analytics'}
                  isLocked={isPaywallLocked}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (isPaywallLocked && onOpenSubscriptionModal) {
                      onOpenSubscriptionModal();
                      return;
                    }
                    setActiveTab('smart_market_analytics');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
                <SidebarButton
                  id="sidebar-btn-competitor-radar"
                  icon={<Tag className="w-4 h-4" />}
                  label="مقارنة الأسعار ورادار المنافسين"
                  badge="مباشر ⚡"
                  isActive={activeTab === 'radar'}
                  isLocked={isPaywallLocked}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (isPaywallLocked && onOpenSubscriptionModal) {
                      onOpenSubscriptionModal();
                      return;
                    }
                    setActiveTab('radar');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
                <SidebarButton
                  id="sidebar-btn-publish-platforms"
                  icon={<Send className="w-4 h-4" />}
                  label="إرسال وتحديث الأسعار للمنصات"
                  isLocked={isPaywallLocked}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (isPaywallLocked && onOpenSubscriptionModal) {
                      onOpenSubscriptionModal();
                      return;
                    }
                    onOpenPublishModal();
                  }}
                />
                {onOpenBestSellersModal && (
                  <SidebarButton
                    id="sidebar-btn-bestsellers"
                    icon={<Flame className="w-4 h-4 text-amber-400 fill-amber-400" />}
                    label="منتجات التريند والأعلى مبيعات (الصين 👈 مصر)"
                    badge="Top Trending 🔥"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onOpenBestSellersModal();
                    }}
                  />
                )}
              </div>
            </div>

            {/* قسم التقارير والشيتات */}
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block mb-2">
                التقارير والشيتات
              </span>
              <div className="space-y-1">
                <SidebarButton
                  id="sidebar-btn-export-csv"
                  icon={<FileSpreadsheet className="w-4 h-4" />}
                  label="رفع وتصدير شيت إكسيل (CSV)"
                  badge={isExportOverdue ? 'تذكير 24h' : 'CSV / Excel'}
                  isLocked={isPaywallLocked}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (isPaywallLocked && onOpenSubscriptionModal) {
                      onOpenSubscriptionModal();
                      return;
                    }
                    if (onOpenExportModal) {
                      onOpenExportModal();
                    }
                  }}
                />
                {onOpenAiExcelModal && (
                  <SidebarButton
                    id="sidebar-btn-ai-excel"
                    icon={<Sparkles className="w-4 h-4" />}
                    label="رفع وإثراء شيت إكسيل بالذكاء (AI)"
                    isLocked={isPaywallLocked}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (isPaywallLocked && onOpenSubscriptionModal) {
                        onOpenSubscriptionModal();
                        return;
                      }
                      onOpenAiExcelModal();
                    }}
                  />
                )}
                <SidebarButton
                  id="sidebar-btn-weekly-reports"
                  icon={<BarChart2 className="w-4 h-4" />}
                  label="متابعة التقارير الأسبوعية والتجار"
                  badge={`${remoteMerchantsCount} تجار`}
                  isActive={activeTab === 'remote_merchants'}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setActiveTab('remote_merchants');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
                {onOpenInvestorDeck && (
                  <SidebarButton
                    id="sidebar-btn-investor-deck"
                    icon={<Presentation className="w-4 h-4" />}
                    label="عرض المستثمرين (Pitch Deck)"
                    isLocked={isPaywallLocked}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (isPaywallLocked && onOpenSubscriptionModal) {
                        onOpenSubscriptionModal();
                        return;
                      }
                      onOpenInvestorDeck();
                    }}
                  />
                )}
              </div>
            </div>

            {/* قسم الإعدادات والربط */}
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block mb-2">
                الإعدادات
              </span>
              <div className="space-y-1">
                <SidebarButton
                  id="sidebar-btn-manage-apis"
                  icon={<Key className="w-4 h-4" />}
                  label="إدارة المفاتيح وربط APIS"
                  badge="SP-API 🔐"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (onOpenManageApisModal) {
                      onOpenManageApisModal();
                    }
                  }}
                />
                <SidebarButton
                  id="sidebar-btn-account-subscriptions"
                  icon={<Settings className="w-4 h-4" />}
                  label="إعدادات الحساب والباقات"
                  badge={subscriptionBadgeLabel || 'الباقات 👑'}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (onOpenSubscriptionModal) {
                      onOpenSubscriptionModal();
                    }
                  }}
                />
                <SidebarButton
                  id="sidebar-btn-audio-theme-settings"
                  icon={<Palette className="w-4 h-4" />}
                  label="إعدادات المظهر والتنبيهات الصوتية"
                  badge={resolvedColorMode === 'light' ? 'نهاري ☀️' : 'ليلي 🌙'}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setActiveGlobalSettingsTab('audio');
                    setIsThemeModalOpen(true);
                  }}
                />
                {onOpenPushNotificationModal && (
                  <SidebarButton
                    id="sidebar-btn-push-notifications"
                    icon={<Bell className="w-4 h-4" />}
                    label="تنبيهات المتصفح الفورية (FCM)"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onOpenPushNotificationModal();
                    }}
                  />
                )}
                {onToggleLanguage && (
                  <SidebarButton
                    id="sidebar-btn-toggle-language"
                    icon={<Globe className="w-4 h-4" />}
                    label={language === 'en' ? 'تغيير اللغة إلى العربية 🇪🇬' : 'Switch to English 🌐'}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onToggleLanguage();
                    }}
                  />
                )}
              </div>
            </div>

            {/* جميع شاشات وأقسام المنظومة (28 شاشة) مصنفة بوضوح داخل الشريط الجانبي */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-400 tracking-wider">
                  جميع شاشات وأقسام المنظومة ({navItems.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {productCount} منتج مسجل
                </span>
              </div>

              {/* فلاتر سريعة لأقسام الشاشات داخل القائمة الجانبية */}
              <div className="flex flex-wrap gap-1">
                {navCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedNavCategory(cat.id)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                      selectedNavCategory === cat.id
                        ? 'bg-sky-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                {displayedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isTabLocked = isPaywallLocked && LOCKED_NAV_TABS.has(item.id);
                  return (
                    <SidebarButton
                      key={item.id}
                      id={`btn-nav-tab-${item.id}`}
                      icon={<Icon className="w-4 h-4" />}
                      label={item.label}
                      badge={item.badge}
                      isActive={activeTab === item.id}
                      isLocked={isTabLocked}
                      onClick={() => {
                        setIsSidebarOpen(false);
                        if (isTabLocked && onOpenSubscriptionModal) {
                          onOpenSubscriptionModal();
                          return;
                        }
                        setActiveTab(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Login Error Notification Banner */}
        {loginError && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
            <button
              onClick={clearLoginError}
              className="text-rose-600 hover:text-rose-900 font-bold px-2 py-0.5 text-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Edit Store Profile Modal */}
        {isEditProfileModalOpen && (
          <ProfileSettingsModal 
            isOpen={isEditProfileModalOpen}
            onClose={() => setIsEditProfileModalOpen(false)}
            onShowToast={onShowToast}
          />
        )}

      </div>
    </header>
  );
};
