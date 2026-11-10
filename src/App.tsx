import React, { useState, useEffect, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  Palette,
  Menu,
  Scissors,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { useSubscription } from './hooks/useSubscription';
import { supabase } from './lib/supabase';
import { useVisualCustomizer } from './context/VisualCustomizerContext';

export const OWNER_EMAIL = 'jassmeinnour@gmail.com';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { DailyTaskListSidebar } from './components/DailyTaskListSidebar';
import { AllMerchantsDirectoryDrawer } from './components/AllMerchantsDirectoryDrawer';
import { ToolbarTooltip } from './components/ToolbarTooltip';
import { AppSidebar } from './components/AppSidebar';
import { OfflineNoticeBanner } from './components/OfflineNoticeBanner';
import { CloudSyncStatusWidget } from './components/CloudSyncStatusWidget';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { FloatingHotkeyButton } from './components/FloatingHotkeyButton';
import { FloatingVisualCustomizerButton } from './components/FloatingVisualCustomizerButton';
import { StatsMonitor } from './components/StatsMonitor';
import { LoginPage } from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { BayyaaLogo } from './components/BayyaaLogo';
import { BayyaaBannerNew } from './components/BayyaaBannerNew';
import { VisualCustomizerModal } from './components/VisualCustomizerModal';
import { MobilePWAInstallPrompt } from './components/MobilePWAInstallPrompt';
import { PlatformInstallMatrixModal } from './components/PlatformInstallMatrixModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useAppUpdate } from './hooks/useAppUpdate';
import { CURRENT_APP_VERSION, APP_VERSION_STORAGE_KEY } from './pwaRegister';
import headerBrandLogo from './assets/images/regenerated_image_1793023955535.png';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TabSkeletonLoader } from './components/TabSkeletonLoader';
import { AIStudioSkeletonLoader } from './components/AIStudioSkeletonLoader';


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
      console.warn('[SafeLazy] Dynamic module import failed, retrying once in background...', error);
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const module = await factory();
        return { default: extractComponent(module) };
      } catch (retryError) {
        console.warn('[SafeLazy] Dynamic module import failed after retry, using resilient fallback component:', retryError);
        return {
          default: () => (
            <div className="p-6 text-center text-slate-300 font-bold bg-slate-900/40 rounded-2xl border border-slate-800 m-4 flex flex-col items-center justify-center gap-2" dir="rtl">
              <span className="text-xs">جاري تجهيز بيانات هذا القسم في الخلفية تلقائياً...</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs rounded-xl font-bold cursor-pointer transition"
              >
                تحديث العرض
              </button>
            </div>
          )
        };
      }
    }
  });
}

// Lazy load feature components
const OnboardingTour = safeLazy(() => import('./components/OnboardingTour'));
const PaymentModal = safeLazy(() => import('./components/PaymentModal'));
const SubscriptionPlansModal = safeLazy(() => import('./components/SubscriptionPlansModal'));
const OwnerDashboard = safeLazy(() => import('./components/OwnerDashboard'));
const HelpPage = safeLazy(() => import('./components/HelpPage'));
const ShippingOrdersTable = safeLazy(() => import('./components/ShippingOrdersTable'));
const ProfitCalculator = safeLazy(() => import('./components/ProfitCalculator'));
const ShippingManagementDashboard = safeLazy(() => import('./components/ShippingManagementDashboard'));
const PlatformsGuideManager = safeLazy(() => import('./components/PlatformsGuideManager'));
const AutoPricingEngine = safeLazy(() => import('./components/AutoPricingEngine'));
const PriceComparisonEngine = safeLazy(() => import('./components/PriceComparisonEngine'));
const RealTimePriceComparisonCenter = safeLazy(() => import('./components/RealTimePriceComparisonCenter'));
const TraderStoreSyncManager = safeLazy(() => import('./components/TraderStoreSyncManager'));
const WatchlistNotificationModal = safeLazy(() => import('./components/WatchlistNotificationModal'));
import { getStoredWatchlist } from './services/watchlistNotificationService';

const AIProductStudio = safeLazy(() => import('./components/AIProductStudio'));
const AIModule = safeLazy(() => import('./components/AIMultiDesign'));
const MerchantCatalogManager = safeLazy(() => import('./components/MerchantCatalogManager'));
const CompetitorRadar = safeLazy(() => import('./components/CompetitorRadar'));
const WatchlistManager = safeLazy(() => import('./components/WatchlistManager'));
const MarketTrendsRadar = safeLazy(() => import('./components/MarketTrendsRadar'));
const PeriodicPerformanceReports = safeLazy(() => import('./components/PeriodicPerformanceReports'));
const AmazonMultiItemWaybillCropperModal = safeLazy(() => import('./components/AmazonMultiItemWaybillCropperModal'));
const BulkMarketplaceWaybillModal = safeLazy(() => import('./components/BulkMarketplaceWaybillModal'));
const TraderProfilePage = safeLazy(() => import('./components/TraderProfilePage'));
const MultiMerchantTradersPage = safeLazy(() => import('./components/MultiMerchantTradersPage'));
const TradersPage = safeLazy(() => import('./components/TradersPage'));
const ProductsPage = safeLazy(() => import('./components/ProductsPage'));
const TraderDetailPage = safeLazy(() => import('./components/TraderDetailPage'));
const InventoryPage = safeLazy(() => import('./components/InventoryPage'));
const WaybillSplitterPage = safeLazy(() => import('./components/WaybillSplitterPage'));
const AnalyticsPage = safeLazy(() => import('./components/AnalyticsPage'));
import { NotificationsDropdown } from './components/NotificationsDropdown';

export type WorkspaceTab = 
  | 'traders'
  | 'products'
  | 'inventory'
  | 'merchants' 
  | 'radar' 
  | 'watchlist'
  | 'ai_studio' 
  | 'shipping' 
  | 'trending' 
  | 'reports' 
  | 'auto_pricing' 
  | 'price_comparison' 
  | 'platforms_guide' 
  | 'traders_sync'
  | 'split_invoices'
  | 'help'
  | 'analytics';

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
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/traders' || path.startsWith('/traders/')) return 'traders';
      if (path === '/products') return 'products';
      if (path === '/inventory') return 'inventory';
      if (path === '/invoices/split' || path === '/invoices') return 'split_invoices';
      if (path === '/help') return 'help';
      if (path === '/analytics') return 'analytics';
      if (path === '/competitors') return 'radar';
      if (path === '/connections') return 'platforms_guide';
      if (path === '/gmail-sync') return 'traders_sync';
      if (path === '/reports') return 'reports';
    }
    return 'products';
  });

  const [urlSplitInvoiceId, setUrlSplitInvoiceId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('invoice_id') || undefined;
    }
    return undefined;
  });

  const [urlSplitTraderId, setUrlSplitTraderId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('trader_id') || undefined;
    }
    return undefined;
  });

  const [selectedTraderProfileId, setSelectedTraderProfileId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/traders/') && path !== '/traders/new' && path !== '/traders') {
        return path.replace('/traders/', '');
      }
    }
    return null;
  });

  // Mobile Swipe Gestures Configuration between Main Tabs (Traders -> Products -> Inventory -> Reports)
  const PRIMARY_SWIPE_TABS: { tab: WorkspaceTab; name: string; icon: string; url: string }[] = [
    { tab: 'traders', name: 'دليل التجار', icon: '📚', url: '/traders' },
    { tab: 'products', name: 'إدارة المنتجات', icon: '📦', url: '/products' },
    { tab: 'inventory', name: 'إدارة المخزون', icon: '📊', url: '/inventory' },
    { tab: 'reports', name: 'التقارير الموحدة', icon: '📈', url: '/' }
  ];

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const lastSwipeTimeRef = React.useRef<number>(0);
  const SWIPE_DEBOUNCE_MS = 350;

  const changeTabWithTransition = (targetTab: WorkspaceTab, targetUrl?: string) => {
    const currentTabNormalized = (activeWorkspaceTab === 'merchants' ? 'products' : activeWorkspaceTab) as WorkspaceTab;
    const targetTabNormalized = (targetTab === 'merchants' ? 'products' : targetTab) as WorkspaceTab;

    const currentIndex = PRIMARY_SWIPE_TABS.findIndex(t => t.tab === currentTabNormalized);
    const targetIndex = PRIMARY_SWIPE_TABS.findIndex(t => t.tab === targetTabNormalized);

    if (currentIndex !== -1 && targetIndex !== -1 && currentIndex !== targetIndex) {
      setSwipeDirection(targetIndex > currentIndex ? 'left' : 'right');
    } else {
      setSwipeDirection(null);
    }

    setActiveWorkspaceTab(targetTab);
    setSelectedTraderProfileId(null);
    setShowOwnerDashboard(false);

    if (typeof window !== 'undefined' && targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null || e.changedTouches.length === 0) {
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = endX - touchStartX;
    const deltaY = endY - touchStartY;

    setTouchStartX(null);
    setTouchStartY(null);

    // Debounce check: Prevent rapid overlapping swipes within 350ms
    const now = Date.now();
    if (now - lastSwipeTimeRef.current < SWIPE_DEBOUNCE_MS) {
      return;
    }

    // Require horizontal move > 60px and vertical move < 70px to prevent interrupting vertical scrolling
    if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 70) {
      const currentTabNormalized = (activeWorkspaceTab === 'merchants' ? 'products' : activeWorkspaceTab) as WorkspaceTab;
      const currentIndex = PRIMARY_SWIPE_TABS.findIndex(t => t.tab === currentTabNormalized);

      if (currentIndex !== -1) {
        if (deltaX < 0) {
          // Swiped Left (Finger dragged right to left -> Next Tab)
          if (currentIndex < PRIMARY_SWIPE_TABS.length - 1) {
            lastSwipeTimeRef.current = now;
            const nextTabObj = PRIMARY_SWIPE_TABS[currentIndex + 1];
            changeTabWithTransition(nextTabObj.tab, nextTabObj.url);
            showToast(`👈 سحب سريع: ${nextTabObj.name} ${nextTabObj.icon}`);
          }
        } else if (deltaX > 0) {
          // Swiped Right (Finger dragged left to right -> Previous Tab)
          if (currentIndex > 0) {
            lastSwipeTimeRef.current = now;
            const prevTabObj = PRIMARY_SWIPE_TABS[currentIndex - 1];
            changeTabWithTransition(prevTabObj.tab, prevTabObj.url);
            showToast(`👉 سحب سريع: ${prevTabObj.name} ${prevTabObj.icon}`);
          }
        }
      }
    }
  };

  useEffect(() => {
    const handleOpenProfile = (e: any) => {
      const id = e.detail?.traderId || 'merchant-mahmeud-said';
      setSelectedTraderProfileId(id);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/traders/${id}`);
      }
    };

    const handleOpenSplit = (e: any) => {
      const invId = e.detail?.invoiceId;
      const trdId = e.detail?.traderId;
      if (invId) setUrlSplitInvoiceId(invId);
      if (trdId) setUrlSplitTraderId(trdId);
      setSelectedTraderProfileId(null);
      setActiveWorkspaceTab('split_invoices');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.pathname = '/invoices/split';
        if (invId) url.searchParams.set('invoice_id', invId);
        if (trdId) url.searchParams.set('trader_id', trdId);
        window.history.pushState({}, '', url.toString());
      }
    };

    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        setUrlSplitInvoiceId(params.get('invoice_id') || undefined);
        setUrlSplitTraderId(params.get('trader_id') || undefined);

        if (path === '/traders') {
          setActiveWorkspaceTab('traders');
          setSelectedTraderProfileId(null);
        } else if (path === '/products') {
          setActiveWorkspaceTab('products');
          setSelectedTraderProfileId(null);
        } else if (path === '/inventory') {
          setActiveWorkspaceTab('inventory');
          setSelectedTraderProfileId(null);
        } else if (path === '/invoices/split' || path === '/invoices') {
          setActiveWorkspaceTab('split_invoices');
          setSelectedTraderProfileId(null);
        } else if (path === '/reports') {
          setActiveWorkspaceTab('reports');
          setSelectedTraderProfileId(null);
        } else if (path === '/competitors') {
          setActiveWorkspaceTab('radar');
          setSelectedTraderProfileId(null);
        } else if (path === '/connections') {
          setActiveWorkspaceTab('platforms_guide');
          setSelectedTraderProfileId(null);
        } else if (path === '/gmail-sync') {
          setActiveWorkspaceTab('traders_sync');
          setSelectedTraderProfileId(null);
        } else if (path === '/help') {
          setActiveWorkspaceTab('help');
          setSelectedTraderProfileId(null);
        } else if (path === '/analytics') {
          setActiveWorkspaceTab('analytics');
          setSelectedTraderProfileId(null);
        } else if (path.startsWith('/traders/') && path !== '/traders/new') {
          setSelectedTraderProfileId(path.replace('/traders/', ''));
        } else {
          setSelectedTraderProfileId(null);
        }
      }
    };

    window.addEventListener('open_trader_profile', handleOpenProfile);
    window.addEventListener('open_split_invoices', handleOpenSplit);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('open_trader_profile', handleOpenProfile);
      window.removeEventListener('open_split_invoices', handleOpenSplit);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);


  const [showOwnerDashboard, setShowOwnerDashboard] = useState<boolean>(false);
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    } catch (e) {
      console.warn('Failed to persist sidebar collapse state:', e);
    }
  }, [isSidebarCollapsed]);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isAllMerchantsHubOpen, setIsAllMerchantsHubOpen] = useState<boolean>(false);
  const [merchantsHubInitialTab, setMerchantsHubInitialTab] = useState<'directory' | 'manual_form' | 'trending'>('directory');
  const [isWaybillCropperOpen, setIsWaybillCropperOpen] = useState<boolean>(false);
  const [isBulkWaybillModalOpen, setIsBulkWaybillModalOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isHotkeysModalOpen, setIsHotkeysModalOpen] = useState<boolean>(false);
  const [isWatchlistNotifModalOpen, setIsWatchlistNotifModalOpen] = useState<boolean>(false);
  const [watchlistCount, setWatchlistCount] = useState<number>(() => {
    try {
      return getStoredWatchlist().length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleWatchlistChange = () => {
      try {
        setWatchlistCount(getStoredWatchlist().length);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('merchant_watchlist_updated', handleWatchlistChange);
    window.addEventListener('merchant_watchlist_price_changed', handleWatchlistChange);
    window.addEventListener('storage', handleWatchlistChange);
    return () => {
      window.removeEventListener('merchant_watchlist_updated', handleWatchlistChange);
      window.removeEventListener('merchant_watchlist_price_changed', handleWatchlistChange);
      window.removeEventListener('storage', handleWatchlistChange);
    };
  }, []);

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

  // PWA & Installation Hook (Strictly suppresses install prompts when running in standalone mode)
  const { isInstallable, isInstalled, install: triggerPWAInstall } = usePWAInstall();
  const { hasUpdate, applyUpdate, isUpdating, serverVersion } = useAppUpdate(showToast);
  const [showInstallBar, setShowInstallBar] = useState<boolean>(false);

  useEffect(() => {
    if (isInstalled) {
      setShowInstallBar(false);
      return;
    }
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setShowInstallBar(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleInstallPwa = async () => {
    if (isInstallable) {
      try {
        const success = await triggerPWAInstall();
        if (success) {
          showToast('تم تثبيت تطبيق رادار التاجر الذكي بنجاح! 🎉');
          return;
        }
      } catch (err) {
        console.warn('[App] Install error:', err);
      }
    }
    window.dispatchEvent(new CustomEvent('open-pwa-install-modal', { detail: { category: 'windows' } }));
  };

  const handleForceRefreshAndClearCache = async () => {
    try {
      showToast('جاري تحديث واجهات وأكواد التطبيق في الخلفية مع الاحتفاظ الكامل ببيانات التجار ومتاجرك المسجلة ✓');
      // 1. مسح ذاكرة التخزين المؤقتة للملفات الثابتة فقط (CSS / JS / Images cache)
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      // 2. تحديث Service Worker لجلب أحدث البناءات البرمجية دون مسح البيانات
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await registration.update().catch(() => {});
        }
      }
      // 3. تحديث رقم الإصدار المعتمد في الذاكرة لمنع ظهور إشعارات تحديث متكررة
      try {
        localStorage.setItem(APP_VERSION_STORAGE_KEY, CURRENT_APP_VERSION);
      } catch {
        // safe fallback
      }
      // تنويه هام: يُمنع منعاً باتاً استدعاء localStorage.clear() أو مسح IndexedDB الخاصة بالتجار
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      window.location.reload();
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
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          setIsHotkeysModalOpen((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
        setIsHotkeysModalOpen(false);
        setIsSidebarOpen(false);
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
          onLoginSuccess={async () => {
            const stored = localStorage.getItem('radar_user');
            if (stored) setLocalUser(JSON.parse(stored));
            // Trigger push notification permission request
            import('./services/fcmNotificationService').then(({ requestPushNotificationPermission }) => {
              requestPushNotificationPermission().then(res => {
                if (res.success) {
                  showToast('تم تفعيل تنبيهات المتصفح بنجاح! 🔔');
                }
              });
            });
          }}
          onBackToLanding={() => setShowLandingPage(true)}
        />
      </Suspense>
    );
  }

  const isHomePage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');

  return (
    <div dir="rtl" className="w-full overflow-x-hidden min-h-screen bg-slate-950 text-slate-100 font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-slate-950 pb-20 relative">
      
      {/* Offline Status & IndexedDB Cache Banner */}
      <OfflineNoticeBanner onShowToast={showToast} />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[9999] bg-slate-900 border-2 border-amber-500 text-amber-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* PWA Installation Bar - STRICTLY hidden when already installed in standalone mode */}
      {showInstallBar && !isInstalled && (
        <div className="bg-slate-900 border-b border-amber-600/30 px-3 sm:px-4 py-2 sticky top-0 z-50 backdrop-blur-md w-full max-w-full overflow-x-hidden">
          <div className="w-full max-w-full px-2 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-300 font-bold font-mono text-[10px] sm:text-xs">PWA</span>
              <span className="text-slate-300 font-medium text-[11px] sm:text-xs">رادار التاجر متاح للتثبيت كبرنامج مكتبي وتطبيق أندرويد متكامل:</span>
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
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-b border-amber-600/20 px-4 py-2">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-amber-200 font-bold">
              ⏱️ مهلة التجربة والاشتراك (فترة السماح 3 أيام):
            </span>
            <span className="text-slate-300">
              الدفع الفوري متاح عبر محفظة فودافون كاش الرسمية: <strong className="text-amber-300 font-mono text-sm underline">01097751352</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition text-xs shadow-md"
            >
              دفع الاشتراك (فودافون كاش)
            </button>
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-600/30 font-bold rounded-lg transition text-xs"
            >
              عرض باقات الاشتراك
            </button>
          </div>
        </div>
      </div>

      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-xl sticky top-0 z-40 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Right Side (RTL): ☰ Toggle Button + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setIsSidebarOpen(prev => !prev);
                } else {
                  setIsSidebarCollapsed(prev => !prev);
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition shrink-0 cursor-pointer flex items-center justify-center shadow-md active:scale-95"
              title="طي/توسيع القائمة الجانبية ☰"
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>

            <div 
              onClick={() => {
                setActiveWorkspaceTab('traders');
                setShowOwnerDashboard(false);
                if (typeof window !== 'undefined') window.history.pushState({}, '', '/traders');
              }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition shrink-0"
              title="رادار التاجر الذكي - منصة بياع"
            >
              <div 
                style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', background: 'transparent' }}
                className="rounded-xl p-0.5 shadow-md flex items-center justify-center overflow-hidden border border-amber-500/40 shrink-0"
              >
                <img 
                  src={headerBrandLogo} 
                  alt="رادار التاجر - بياع" 
                  style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px', objectFit: 'contain', background: 'transparent' }}
                  className="brand-logo-img rounded-lg"
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
                  <span className="text-sm sm:text-base font-black text-white font-['Alexandria']">رادار التاجر</span>
                  <span className="text-[9px] font-black bg-amber-700 text-white px-1.5 py-0.2 rounded-md">بياع EG</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-amber-300 font-mono font-bold">RADAR EGYPT v54</span>
              </div>
            </div>

            {/* Super Admin Quick Badge */}
            {isOwner && (
              <button
                onClick={() => setShowOwnerDashboard((prev) => !prev)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-md shrink-0 ${
                  showOwnerDashboard 
                    ? 'bg-amber-600 text-white border-amber-500' 
                    : 'bg-amber-600/10 text-amber-300 border-amber-600/30 hover:bg-amber-600/20'
                }`}
                title="لوحة تحكم المالكة العليا (Super Admin) - اختصار: O"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Super Admin</span>
              </button>
            )}
          </div>

          {/* Left Side (RTL): Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* PWA Install Button */}
            {!isInstalled && (
              <button
                type="button"
                onClick={handleInstallPwa}
                className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="تثبيت التطبيق على الجهاز (PWA)"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">تثبيت التطبيق 📱</span>
              </button>
            )}

            {/* Smart System Notifications */}
            <NotificationsDropdown
              onNavigateToSplit={(invId) => {
                setActiveWorkspaceTab('split_invoices');
                setSelectedTraderProfileId(null);
                if (invId) setUrlSplitInvoiceId(invId);
                if (typeof window !== 'undefined') {
                  const url = invId ? `/invoices/split?invoice_id=${invId}` : '/invoices/split';
                  window.history.pushState({}, '', url);
                }
              }}
              onNavigateToTrader={(trdId) => {
                setSelectedTraderProfileId(trdId);
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', `/traders/${trdId}`);
                }
              }}
              onShowToast={showToast}
            />

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                isFocusMode ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isFocusMode ? 'إلغاء وضع التركيز' : 'تفعيل وضع التركيز'}
            >
              {isFocusMode ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
            </button>

            <ThemeToggle variant="pill" />
            <LanguageToggle />
            <CloudSyncStatusWidget onShowToast={showToast} />

            {/* Smart Update Button */}
            {hasUpdate && (
              <button
                type="button"
                id="btn-header-smart-update"
                onClick={applyUpdate}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer whitespace-nowrap animate-pulse"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'جاري التحديث...' : `تحديث متوفر (v${serverVersion}) ⚡`}</span>
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area with Swipe Gestures */}
      <main 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-6 touch-pan-y lg:pr-[280px] flex-1"
        style={{ minWidth: 0 }}
      >
        {/* Mobile Swipe Gesture Helper Banner */}
        <div className="flex sm:hidden items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-2xl px-3 py-2 text-[11px] text-amber-300 font-bold mb-4 shadow-md backdrop-blur-md">
          <span className="flex items-center gap-1">
            <span className="text-xs">👈</span>
            <span>سحب يميناً ويساراً للتنقل السريع بين التبويبات</span>
            <span className="text-xs">👉</span>
          </span>
          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/40 text-white font-mono shrink-0">
            Swipe Gestures 📱
          </span>
        </div>

        <AnimatePresence custom={swipeDirection} mode="wait">
          <motion.div
            key={selectedTraderProfileId ? `trader-${selectedTraderProfileId}` : (showOwnerDashboard ? 'owner-dashboard' : activeWorkspaceTab)}
            variants={{
              hidden: { 
                opacity: 0, 
                x: swipeDirection === 'left' ? 80 : swipeDirection === 'right' ? -80 : 0,
                y: swipeDirection ? 0 : 12,
                scale: swipeDirection ? 0.98 : 1
              },
              visible: { 
                opacity: 1, 
                x: 0, 
                y: 0, 
                scale: 1 
              },
              exit: { 
                opacity: 0, 
                x: swipeDirection === 'left' ? -80 : swipeDirection === 'right' ? 80 : 0,
                y: swipeDirection ? 0 : -12,
                scale: swipeDirection ? 0.98 : 1
              }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
          >
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
                
                <Suspense fallback={<TabSkeletonLoader title="جاري تحميل لوحة التحكم العليا..." />}>
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

                {/* Render Home Overview Banner & KPI Cards ONLY on home route */}
                {(!selectedTraderProfileId && isHomePage) && (
                  <>
                    {/* Prominent Clickable Sponsored Bayyaa Ad Banner */}
                    {!isFocusMode && (
                      <BayyaaBannerNew onShowToast={showToast} />
                    )}

                    {/* Top KPI Overview Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div 
                        className="rounded-2xl p-4 shadow-lg backdrop-blur-md border"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-text)' }}
                      >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                          <span className="text-xs font-bold font-['Cairo']">المنتجات النشطة</span>
                          <Package className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-black text-white font-mono">148</div>
                        <span className="text-[10px] text-emerald-400 font-bold font-['Cairo']">محدثة في الكتالوج</span>
                      </div>

                      <div 
                        className="rounded-2xl p-4 shadow-lg backdrop-blur-md border"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-text)' }}
                      >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                          <span className="text-xs font-bold font-['Cairo']">المنافسون المراقبون</span>
                          <Users className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="text-2xl font-black text-white font-mono">24</div>
                        <span className="text-[10px] text-sky-400 font-bold font-['Cairo']">متاجر بالسوق المصري</span>
                      </div>

                      <div 
                        className="rounded-2xl p-4 shadow-lg backdrop-blur-md border"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-text)' }}
                      >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                          <span className="text-xs font-bold font-['Cairo']">حالة التزامن الأخيرة</span>
                          <Activity className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-black text-emerald-400 font-mono">مستقر</div>
                        <span className="text-[10px] text-slate-400 font-bold font-['Cairo']">مزامنة سحابية نشطة</span>
                      </div>

                      <div 
                        className="rounded-2xl p-4 shadow-lg backdrop-blur-md border"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-text)' }}
                      >
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

                    {/* Live Sync Monitor */}
                    <StatsMonitor />
                  </>
                )}

                {/* 4. Active Tab Content Workspace */}
                <Suspense fallback={<TabSkeletonLoader />}>
                  {selectedTraderProfileId ? (
                    <TraderDetailPage
                      traderId={selectedTraderProfileId}
                      onBack={() => {
                        setSelectedTraderProfileId(null);
                        setActiveWorkspaceTab('traders');
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', '/traders');
                        }
                      }}
                      onShowToast={showToast}
                    />
                  ) : activeWorkspaceTab === 'traders' ? (
                    <TradersPage 
                      onShowToast={showToast} 
                      onSelectTrader={(trdId) => {
                        setSelectedTraderProfileId(trdId);
                      }}
                    />
                  ) : activeWorkspaceTab === 'products' || activeWorkspaceTab === 'merchants' ? (
                    <ProductsPage onShowToast={showToast} />
                  ) : activeWorkspaceTab === 'inventory' ? (
                    <InventoryPage onShowToast={showToast} />
                  ) : activeWorkspaceTab === 'split_invoices' ? (
                    <WaybillSplitterPage
                      initialInvoiceId={urlSplitInvoiceId}
                      initialTraderId={urlSplitTraderId}
                      onBack={() => {
                        setActiveWorkspaceTab('traders');
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', '/traders');
                        }
                      }}
                      onShowToast={showToast}
                    />
                  ) : null}

                  {activeWorkspaceTab === 'radar' && (
                    <CompetitorRadar />
                  )}

                  {activeWorkspaceTab === 'watchlist' && (
                    <WatchlistManager 
                      currency="ج.م"
                      onShowToast={showToast}
                      onSelectProduct={() => setActiveWorkspaceTab('radar')}
                    />
                  )}

                  {activeWorkspaceTab === 'ai_studio' && (
                    <div className="space-y-6">
                      <AIProductStudio onShowToast={showToast} />
                      <Suspense fallback={<AIStudioSkeletonLoader type="processing_image" message="جاري تحميل أداة التخصيص والذكاء الاصطناعي..." />}>
                        <AIModule onShowToast={showToast} />
                      </Suspense>
                    </div>
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
                    <ErrorBoundary 
                      sectionName="periodic-reports"
                      fallback={
                        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                          <h3 className="text-lg font-black text-white">⚠️ حدث خطأ في تحميل التقارير</h3>
                          <p className="text-slate-400 text-sm">نعتذر، واجه النظام مشكلة أثناء معالجة بيانات التقارير. حاول تحديث الصفحة.</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
                          >
                            إعادة تحميل الصفحة 🔄
                          </button>
                        </div>
                      }
                    >
                      <PeriodicPerformanceReports 
                        allProducts={[]} 
                        watchlist={[]} 
                        onShowToast={showToast}
                      />
                    </ErrorBoundary>
                  )}

                  {activeWorkspaceTab === 'auto_pricing' && (
                    <AutoPricingEngine 
                      currency="ج.م"
                      onNavigateToCatalog={() => setActiveWorkspaceTab('merchants')}
                      onNavigateToRadar={() => setActiveWorkspaceTab('radar')}
                    />
                  )}

                  {activeWorkspaceTab === 'price_comparison' && (
                    <RealTimePriceComparisonCenter 
                      currency="ج.م" 
                      onShowToast={showToast} 
                      onSelectActiveTrader={() => setActiveWorkspaceTab('radar')} 
                    />
                  )}

                  {activeWorkspaceTab === 'platforms_guide' && (
                    <PlatformsGuideManager />
                  )}

                  {activeWorkspaceTab === 'traders_sync' && (
                    <TraderStoreSyncManager currency="ج.م" onShowToast={showToast} />
                  )}

                  {activeWorkspaceTab === 'help' && (
                    <HelpPage 
                      onNavigateToPlatformsGuide={() => setActiveWorkspaceTab('platforms_guide')}
                      onStartTour={() => setShowOnboarding(true)}
                      onOpenHotkeysModal={() => setIsHotkeysModalOpen(true)}
                    />
                  )}

                  {activeWorkspaceTab === 'analytics' && (
                    <AnalyticsPage />
                  )}
                </Suspense>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Daily Tasks Sidebar */}
      {!isFocusMode && <DailyTaskListSidebar />}

      {/* Overlays & Modals */}
      <AllMerchantsDirectoryDrawer 
        isOpen={isAllMerchantsHubOpen} 
        onClose={() => setIsAllMerchantsHubOpen(false)} 
        initialTab={merchantsHubInitialTab}
        onShowToast={showToast}
        onSelectMerchant={(id) => showToast(`تم اختيار المتجر (${id}) للتحكم والمتابعة الفورية ⚡`)}
        onOpenWaybillModal={(merchant) => setIsWaybillCropperOpen(true)}
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

      {/* Watchlist & Price Alerts Web Notifications Center Modal */}
      {isWatchlistNotifModalOpen && (
        <Suspense fallback={null}>
          <WatchlistNotificationModal
            isOpen={isWatchlistNotifModalOpen}
            onClose={() => setIsWatchlistNotifModalOpen(false)}
            onNavigateToRadar={(prodId) => {
              setActiveWorkspaceTab('radar');
            }}
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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">رادار التاجر الذكي في مصر (RADAR EGYPT)</span>
            <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono">v54 Production</span>
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

      {/* Mobile Floating PWA Installation Prompt & Bottom Dock - Strictly hidden when already installed in standalone mode */}
      {!isInstalled && <MobilePWAInstallPrompt onShowToast={showToast} />}

      {/* Multi-Platform PWA Installation & Certificate Modal - Strictly hidden when already installed */}
      {!isInstalled && <PlatformInstallMatrixModal onShowToast={showToast} />}

      {/* Collapsible Navigation Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        activeTab={activeWorkspaceTab}
        onSelectTab={(tab) => {
          setActiveWorkspaceTab(tab);
          setShowOwnerDashboard(false);
          setIsSidebarOpen(false);
        }}
        onOpenAllMerchantsHub={() => setIsAllMerchantsHubOpen(true)}
        onOpenOwnerDashboard={() => setShowOwnerDashboard(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onForceRefresh={hasUpdate ? applyUpdate : undefined}
        isOwner={isOwner}
        trialDaysRemaining={subscriptionState.trialRemainingTime?.days ?? 3}
      />

      {/* Floating Hotkeys and Visual Customizer Buttons */}
      {!isFocusMode && (
        <>
          <FloatingHotkeyButton onClick={() => setIsHotkeysModalOpen(true)} />
          <FloatingVisualCustomizerButton />
        </>
      )}

      <KeyboardShortcutsModal
        isOpen={isHotkeysModalOpen}
        onClose={() => setIsHotkeysModalOpen(false)}
        isOwner={isOwner}
      />
    </div>
  );
}

