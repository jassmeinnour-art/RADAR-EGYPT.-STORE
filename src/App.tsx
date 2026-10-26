import React, { useState, useEffect, Suspense } from 'react';
import { 
  Zap, 
  Sparkles, 
  Mail, 
  Key, 
  Globe, 
  Users, 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  ShieldCheck, 
  Package, 
  Bell, 
  TrendingUp, 
  ShoppingBag, 
  Building2, 
  Search, 
  Filter, 
  ChevronDown, 
  Truck, 
  Camera, 
  FileText,
  ArrowRight,
  Shield,
  HelpCircle,
  BookOpen,
  Crown,
  Clock,
  Activity,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  X,
  Maximize2,
  Minimize2,
  Store,
  Layers,
  BarChart3,
  DollarSign,
  Printer,
  Compass,
  Palette
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { useSubscription } from './hooks/useSubscription';
import { useVisualCustomizer } from './context/VisualCustomizerContext';

export const OWNER_EMAIL = 'jassmeinnour@gmail.com';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { DailyTaskListSidebar } from './components/DailyTaskListSidebar';
import { AllMerchantsDirectoryDrawer } from './components/AllMerchantsDirectoryDrawer';
import { StatsMonitor } from './components/StatsMonitor';
import { LoginPage } from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { BayyaaLogo } from './components/BayyaaLogo';
import { VisualCustomizerModal } from './components/VisualCustomizerModal';
import headerBrandLogo from './assets/images/regenerated_image_1793023955535.png';

function extractComponent(module: any): React.ComponentType<any> {
  if (!module) return (() => null) as any;
  if (typeof module === 'function') return module;
  if (module.default) {
    if (typeof module.default === 'function') return module.default;
    return extractComponent(module.default);
  }
  const keys = Object.keys(module);
  for (const k of keys) {
    if (typeof module[k] === 'function') return module[k];
  }
  return module;
}

function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<any>
) {
  return React.lazy(async () => {
    try {
      const module = await factory();
      return { default: extractComponent(module) };
    } catch (error) {
      console.warn('Dynamic module import failed, retrying once...', error);
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const module = await factory();
        return { default: extractComponent(module) };
      } catch (retryError) {
        console.error('Dynamic module import failed after retry:', retryError);
        throw retryError;
      }
    }
  });
}

// Lazy load feature components
const OnboardingTour = safeLazy(() => import('./components/OnboardingTour').then(m => ({ default: m.OnboardingTour })));
const PaymentModal = safeLazy(() => import('./components/PaymentModal'));
const SubscriptionPlansModal = safeLazy(() => import('./components/SubscriptionPlansModal').then(m => ({ default: m.SubscriptionPlansModal })));
const OwnerDashboard = safeLazy(() => import('./components/OwnerDashboard'));
const HelpPage = safeLazy(() => import('./components/HelpPage'));
const ShippingOrdersTable = safeLazy(() => import('./components/ShippingOrdersTable'));
const ProfitCalculator = safeLazy(() => import('./components/ProfitCalculator'));
const ShippingManagementDashboard = safeLazy(() => import('./components/ShippingManagementDashboard'));
const PlatformsGuideManager = safeLazy(() => import('./components/PlatformsGuideManager'));
const AutoPricingEngine = safeLazy(() => import('./components/AutoPricingEngine'));
const PriceComparisonEngine = safeLazy(() => import('./components/PriceComparisonEngine').then(m => ({ default: m.PriceComparisonEngine })));
const AIProductStudio = safeLazy(() => import('./components/AIProductStudio').then(m => ({ default: m.AIProductStudio })));
const MerchantCatalogManager = safeLazy(() => import('./components/MerchantCatalogManager').then(m => ({ default: m.MerchantCatalogManager })));
const CompetitorRadar = safeLazy(() => import('./components/CompetitorRadar').then(m => ({ default: m.CompetitorRadar })));
const MarketTrendsRadar = safeLazy(() => import('./components/MarketTrendsRadar').then(m => ({ default: m.MarketTrendsRadar })));
const PeriodicPerformanceReports = safeLazy(() => import('./components/PeriodicPerformanceReports').then(m => ({ default: m.PeriodicPerformanceReports })));
const AmazonMultiItemWaybillCropperModal = safeLazy(() => import('./components/AmazonMultiItemWaybillCropperModal').then(m => ({ default: m.AmazonMultiItemWaybillCropperModal })));
const BulkMarketplaceWaybillModal = safeLazy(() => import('./components/BulkMarketplaceWaybillModal').then(m => ({ default: m.BulkMarketplaceWaybillModal })));

export type WorkspaceTab = 
  | 'merchants' 
  | 'radar' 
  | 'ai_studio' 
  | 'shipping' 
  | 'trending' 
  | 'reports' 
  | 'auto_pricing' 
  | 'price_comparison' 
  | 'platforms_guide' 
  | 'help';

export default function App() {
  const { toggleColorMode } = useTheme();
  const { toggleCustomizer } = useVisualCustomizer();
  const { user, profile, isOwner: authIsOwner, signOut, isLoading: authLoading } = useAuth();
  
  // Local auth fallback for stored sessions
  const [localUser, setLocalUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('radar_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const currentUser = user || localUser;
  const isAuthenticated = !!currentUser;
  
  // Super Admin validation for jassmeinnour@gmail.com
  const isOwner = 
    authIsOwner || 
    currentUser?.email === OWNER_EMAIL || 
    currentUser?.email === 'jassmeinnour@gmail.com' ||
    currentUser?.role === 'super_admin' || 
    currentUser?.systemRole === 'SYSTEM_ADMIN_MARKETER';

  // Navigation and view states
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>('merchants');
  const [showOwnerDashboard, setShowOwnerDashboard] = useState<boolean>(false);
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isAllMerchantsHubOpen, setIsAllMerchantsHubOpen] = useState<boolean>(false);
  const [isWaybillCropperOpen, setIsWaybillCropperOpen] = useState<boolean>(false);
  const [isBulkWaybillModalOpen, setIsBulkWaybillModalOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Subscription & 3-day Grace Period Hook
  const subscriptionState = useSubscription(profile);

  // PWA & Installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBar, setShowInstallBar] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const timer = setTimeout(() => {
      setShowInstallBar(true);
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallPwa = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      showToast('يمكنك تثبيت التطبيق من إعدادات المتصفح (مشاركة -> إضافة للشاشة الرئيسية).');
    }
  };

  const downloadCertificate = () => {
    const certContent = '-----BEGIN CERTIFICATE-----\nMIIDATCCAemgAwIBAgIU...\n-----END CERTIFICATE-----';
    const blob = new Blob([certContent], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'radar_cert.crt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadApk = () => {
    window.location.href = '/radar-al-tajer-signed.apk';
  };

  // Keyboard Shortcuts (Hotkeys)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === '1') {
        e.preventDefault();
        setActiveWorkspaceTab('merchants');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '2') {
        e.preventDefault();
        setActiveWorkspaceTab('radar');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '3') {
        e.preventDefault();
        setActiveWorkspaceTab('ai_studio');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '4') {
        e.preventDefault();
        setActiveWorkspaceTab('shipping');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '5') {
        e.preventDefault();
        setActiveWorkspaceTab('trending');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '6') {
        e.preventDefault();
        setActiveWorkspaceTab('reports');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '7') {
        e.preventDefault();
        setActiveWorkspaceTab('auto_pricing');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '8') {
        e.preventDefault();
        setActiveWorkspaceTab('platforms_guide');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '9') {
        e.preventDefault();
        setActiveWorkspaceTab('help');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleColorMode();
      } else if (!isCtrlOrCmd && e.key.toLowerCase() === 'o' && isOwner) {
        setShowOwnerDashboard((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, isOwner, toggleColorMode]);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('radar_user');
      localStorage.removeItem('radar_auth_token');
      setLocalUser(null);
      await signOut();
    } catch {
      // safe
    }
  };

  // If loading auth state
  if (authLoading && !localUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-['Cairo',sans-serif]">
        جاري تحميل التطبيق...
      </div>
    );
  }

  // If not authenticated, render LoginPage with optional LandingPage toggle
  if (!isAuthenticated) {
    if (showLandingPage) {
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-['Cairo',sans-serif]">جاري تحميل التطبيق...</div>}>
          <LandingPage onLoginClick={() => setShowLandingPage(false)} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-['Cairo',sans-serif]">جاري تحميل التطبيق...</div>}>
        <LoginPage 
          onLoginSuccess={() => {
            const stored = localStorage.getItem('radar_user');
            if (stored) setLocalUser(JSON.parse(stored));
          }}
          onBackToLanding={() => setShowLandingPage(true)}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-slate-950 pb-20" dir="rtl">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[9999] bg-slate-900 border-2 border-amber-500 text-amber-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* PWA Installation Bar */}
      {showInstallBar && (
        <div className="bg-slate-900 border-b border-amber-500/20 px-4 py-2 sticky top-0 z-50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black font-mono">PWA</span>
              <span className="text-slate-300 font-medium">رادار التاجر متاح للتثبيت كبرنامج مكتبي وتطبيق أندرويد متكامل:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={handleInstallPwa} 
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-bold transition flex items-center gap-1.5"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>تثبيت الويندوز (Windows)</span>
              </button>
              <button 
                onClick={downloadApk} 
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold transition flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>تحميل أندرويد (APK)</span>
              </button>
              <button 
                onClick={downloadCertificate} 
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>شهادة الاعتماد</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Day Grace Period / Subscription Alert Bar */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-b border-amber-500/30 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-amber-200 font-bold">
              ⏱️ مهلة التجربة والاشتراك (فترة السماح 3 أيام):
            </span>
            <span className="text-slate-300">
              الدفع الفوري متاح عبر محفظة فودافون كاش الرسمية: <strong className="text-amber-400 font-mono text-sm underline">01097751352</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg transition text-xs shadow-md"
            >
              دفع الاشتراك (فودافون كاش)
            </button>
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold rounded-lg transition text-xs"
            >
              عرض باقات الاشتراك
            </button>
          </div>
        </div>
      </div>

      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Logo & Bayyaa Hub */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => { setActiveWorkspaceTab('merchants'); setShowOwnerDashboard(false); }}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition"
              title="رادار التاجر الذكي - منصة بياع"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-amber-600 p-0.5 shadow-lg flex items-center justify-center overflow-hidden border border-white/20">
                <img 
                  src={headerBrandLogo} 
                  alt="رادار التاجر - بياع" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = '/bayyaa-logo.jpg';
                    } else {
                      target.src = '/pwa-192x192.png';
                    }
                  }}
                />
              </div>
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-white font-['Alexandria']">رادار التاجر</span>
                  <span className="text-[9px] font-black bg-[#FF6B00] text-white px-1.5 py-0.2 rounded-md">بياع EG</span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono font-bold">RADAR EGYPT v54</span>
              </div>
            </div>

            {/* Super Admin Quick Badge for jassmeinnour@gmail.com */}
            {isOwner && (
              <button
                onClick={() => setShowOwnerDashboard((prev) => !prev)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1.5 border shadow-md ${
                  showOwnerDashboard 
                    ? 'bg-amber-500 text-slate-950 border-amber-400' 
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title="لوحة تحكم المالكة العليا (Super Admin) - اختصار: O"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Super Admin</span>
              </button>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAllMerchantsHubOpen(true)}
              className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="دليل كافة التجار والمتاجر في السوق المصري"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>دليل التجار</span>
            </button>

            {/* Visual Style Control Panel Launch Button */}
            <button
              type="button"
              id="btn-header-visual-customizer-app"
              onClick={toggleCustomizer}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 via-[#FF6B00]/25 to-amber-500/20 hover:from-amber-500/35 hover:to-[#FF6B00]/40 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
              title="لوحة التحكم السريعة في التنسيق والأبعاد وهوامش الأزرار والبطاقات"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>🎨 تنسيق الأزرار والواجهة</span>
            </button>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-1.5 rounded-xl border text-xs font-bold transition ${
                isFocusMode ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isFocusMode ? 'إلغاء وضع التركيز' : 'تفعيل وضع التركيز'}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <ThemeToggle variant="pill" />
            <LanguageToggle />

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-500/30 rounded-xl text-xs font-bold transition"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/60 overflow-x-auto py-2">
          <div className="flex items-center gap-1.5 min-w-max">
            
            <button
              onClick={() => { setActiveWorkspaceTab('merchants'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'merchants' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="إدارة المتاجر والمنصات وسحب المخزون (Ctrl+1)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>لوحة التاجر والكتالوج</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('radar'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'radar' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="رادار الباي بوكس والأسعار المباشرة (Ctrl+2)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>رادار الباي بوكس والأسعار</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('ai_studio'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'ai_studio' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="استوديو الذكاء الاصطناعي لتصميم العناوين والصور (Ctrl+3)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>أستوديو الذكاء الاصطناعي</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('shipping'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'shipping' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="بوالص الشحن وفصل الطلبات المتعددة (Ctrl+4)"
            >
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>بوالص الشحن وفصل الطلبات</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('trending'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'trending' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="ترشيحات المنتجات التريند وحساب هامش الربح بالجنيه (Ctrl+5)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>التريند وحساب الأرباح</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('reports'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'reports' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="التقارير المالية الأسبوعية والشهرية والسنوية (Ctrl+6)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>التقارير المالية</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('auto_pricing'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'auto_pricing' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="محرك التسعير الآلي المشروط (Ctrl+7)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>محرك التسعير الآلي</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('price_comparison'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'price_comparison' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="مقارنة الفجوات السعرية عبر ملفات CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
              <span>مقارنة الفجوات (CSV)</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('platforms_guide'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'platforms_guide' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="دليل ربط المنصات ومفاتيح API (Ctrl+8)"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>ربط المنصات و API</span>
            </button>

            <button
              onClick={() => { setActiveWorkspaceTab('help'); setShowOwnerDashboard(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeWorkspaceTab === 'help' && !showOwnerDashboard
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="دليل الاستخدام والدعم الفني (Ctrl+9)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الدعم والمساعدة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className={`mx-auto px-4 py-6 ${isFocusMode ? 'max-w-full' : 'max-w-7xl'}`}>
        
        {/* Render Super Admin Dashboard if active */}
        {showOwnerDashboard && isOwner ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between bg-slate-900/90 border-2 border-amber-500/50 p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-black text-white font-['Cairo']">
                    لوحة تحكم المالكة العليا (Super Admin) - {OWNER_EMAIL}
                  </h3>
                  <p className="text-xs text-amber-300/80 font-['Cairo']">
                    متابعة كافة المتاجر المشتركة، إحصائيات تحميلات تطبيق جوجل بلاي، الإيرادات وتفعيل باقات التجار.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOwnerDashboard(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
              >
                العودة للوحة التاجر
              </button>
            </div>
            
            <Suspense fallback={<div className="p-8 text-center text-amber-400">جاري تحميل لوحة التحكم العليا...</div>}>
              <OwnerDashboard />
            </Suspense>
          </div>
        ) : (
          <div className="space-y-6">

            {/* 1. Super Admin Welcome Banner for Owner */}
            {isOwner && !isFocusMode && (
              <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white font-['Cairo']">
                      مرحباً مالكة التطبيق (Super Admin) | جاسمين نور
                    </h4>
                    <p className="text-xs text-amber-200/80 font-['Cairo']">
                      حسابك يتمتع بصلاحيات كاملة وغير محدودة لإدارة كافة المتاجر والإيرادات وتتبع تنزيلات جوجل بلاي.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOwnerDashboard(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shrink-0"
                >
                  فتح لوحة تحكم Super Admin 👑
                </button>
              </div>
            )}

            {/* 2. Top KPI Overview Cards Grid (Verified by KPIDashboard tests) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold font-['Cairo']">المنتجات النشطة</span>
                  <Package className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">148</div>
                <span className="text-[10px] text-emerald-400 font-bold font-['Cairo']">محدثة في الكتالوج</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold font-['Cairo']">المنافسون المراقبون</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">24</div>
                <span className="text-[10px] text-sky-400 font-bold font-['Cairo']">متاجر بالسوق المصري</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold font-['Cairo']">حالة التزامن الأخيرة</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">مستقر</div>
                <span className="text-[10px] text-slate-400 font-bold font-['Cairo']">مزامنة سحابية نشطة</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold font-['Cairo']">مهلة التجربة/الاشتراك</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {subscriptionState.trialRemainingTime?.days > 0 ? `${subscriptionState.trialRemainingTime.days} أيام` : '3 أيام'}
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="text-[10px] text-amber-300 hover:text-white underline font-bold font-['Cairo'] mt-0.5 block"
                >
                  فترة السماح (تجديد فودافون كاش)
                </button>
              </div>
            </div>

            {/* 3. Live Sync Monitor with Pulse Animation */}
            <StatsMonitor />

            {/* 4. Active Tab Content Workspace */}
            <Suspense fallback={<div className="p-12 text-center text-amber-400 font-bold">جاري تحميل الوحدة المحددة...</div>}>
              {activeWorkspaceTab === 'merchants' && (
                <MerchantCatalogManager />
              )}

              {activeWorkspaceTab === 'radar' && (
                <CompetitorRadar />
              )}

              {activeWorkspaceTab === 'ai_studio' && (
                <AIProductStudio onShowToast={showToast} />
              )}

              {activeWorkspaceTab === 'shipping' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <h3 className="text-base font-black text-white font-['Cairo']">
                        أداة فصل وطباعة بوالص الشحن (Waybills Cropper)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        فصل فوري للبوالص متعددة المنتجات من أمازون، نون وجوميا وتجهيزها للطباعة الحرارية 4×6.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsWaybillCropperOpen(true)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <Printer className="w-4 h-4" />
                        <span>أداة قص البوالص الفردية</span>
                      </button>
                      <button
                        onClick={() => setIsBulkWaybillModalOpen(true)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-sky-500/30 transition flex items-center gap-1.5"
                      >
                        <Layers className="w-4 h-4" />
                        <span>الطباعة المجمعة للبوالص</span>
                      </button>
                    </div>
                  </div>
                  <ShippingManagementDashboard />
                </div>
              )}

              {activeWorkspaceTab === 'trending' && (
                <div className="space-y-6">
                  <MarketTrendsRadar />
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-base font-black text-white font-['Cairo'] mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <span>حاسبة هامش الربح والعمولات بالجنيه المصري (EGP)</span>
                    </h3>
                    <ProfitCalculator />
                  </div>
                </div>
              )}

              {activeWorkspaceTab === 'reports' && (
                <PeriodicPerformanceReports />
              )}

              {activeWorkspaceTab === 'auto_pricing' && (
                <AutoPricingEngine 
                  currency="ج.م"
                  onNavigateToCatalog={() => setActiveWorkspaceTab('merchants')}
                  onNavigateToRadar={() => setActiveWorkspaceTab('radar')}
                />
              )}

              {activeWorkspaceTab === 'price_comparison' && (
                <PriceComparisonEngine currency="ج.م" />
              )}

              {activeWorkspaceTab === 'platforms_guide' && (
                <PlatformsGuideManager />
              )}

              {activeWorkspaceTab === 'help' && (
                <HelpPage 
                  onNavigateToPlatformsGuide={() => setActiveWorkspaceTab('platforms_guide')}
                  onStartTour={() => setShowOnboarding(true)}
                />
              )}
            </Suspense>
          </div>
        )}
      </main>

      {/* Floating Daily Tasks Sidebar */}
      {!isFocusMode && <DailyTaskListSidebar />}

      {/* Overlays & Modals */}
      <AllMerchantsDirectoryDrawer 
        isOpen={isAllMerchantsHubOpen} 
        onClose={() => setIsAllMerchantsHubOpen(false)} 
        onShowToast={showToast} 
      />

      {isPaymentModalOpen && (
        <Suspense fallback={null}>
          <PaymentModal onClose={() => setIsPaymentModalOpen(false)} />
        </Suspense>
      )}

      {isSubscriptionModalOpen && (
        <Suspense fallback={null}>
          <SubscriptionPlansModal 
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            subscriptionState={subscriptionState}
            userProfile={profile}
            onShowToast={showToast}
          />
        </Suspense>
      )}

      {isWaybillCropperOpen && (
        <Suspense fallback={null}>
          <AmazonMultiItemWaybillCropperModal 
            isOpen={isWaybillCropperOpen}
            onClose={() => setIsWaybillCropperOpen(false)}
            onShowToast={showToast}
          />
        </Suspense>
      )}

      {isBulkWaybillModalOpen && (
        <Suspense fallback={null}>
          <BulkMarketplaceWaybillModal 
            isOpen={isBulkWaybillModalOpen}
            onClose={() => setIsBulkWaybillModalOpen(false)}
            onShowToast={showToast}
          />
        </Suspense>
      )}

      {showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingTour onComplete={() => setShowOnboarding(false)} />
        </Suspense>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 py-6 text-center text-xs text-slate-400 font-['Cairo']">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">رادار التاجر الذكي في مصر (RADAR EGYPT)</span>
            <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono">v54 Production</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>فودافون كاش: 01097751352</span>
            <span>•</span>
            <span>المالكة: jassmeinnour@gmail.com</span>
            <span>•</span>
            <span>منصة بياع الرسمية (Bayyaa)</span>
          </div>
        </div>
      </footer>
      {/* Visual Customizer Modal */}
      <VisualCustomizerModal />
    </div>
  );
}
