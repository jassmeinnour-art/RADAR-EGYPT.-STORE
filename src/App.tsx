import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { OfflineNoticeBanner } from './components/OfflineNoticeBanner';
import { TabSkeletonLoader } from './components/TabSkeletonLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import DashboardHome from './components/DashboardHome';
import { PullToRefresh, RADAR_PULL_TO_REFRESH_EVENT } from './components/PullToRefresh';
import { TabTransitionContainer } from './components/TabTransitionContainer';
import { dataCache } from './utils/dataCache';
import { navigate, resolvePathToTab, type WorkspaceTab } from './utils/navigation';
import { MaintenanceModeBanner } from './components/MaintenanceModeControl';
import { useMaintenanceMode, MAINTENANCE_MODE_BLOCK_MESSAGE } from './utils/maintenanceMode';
import { multiTenantDb, type Trader } from './lib/supabase';
import { DEFAULT_TRADER_ID } from './utils/sellerCentralExcelImporter';

export type { WorkspaceTab };

type PreloadableLazyComponent<T extends React.ComponentType<any>> =
  React.LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };

function lazyWithPreload<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>
): PreloadableLazyComponent<T> {
  let cachedPromise: Promise<{ default: T }> | null = null;
  const load = () => {
    if (!cachedPromise) {
      cachedPromise = importer();
    }
    return cachedPromise;
  };
  const Component = lazy(load) as PreloadableLazyComponent<T>;
  Component.preload = load;
  return Component;
}

const AppSidebar = lazyWithPreload(() =>
  import('./components/AppSidebar').then((m) => ({ default: m.AppSidebar }))
);
const Header = lazyWithPreload(() =>
  import('./components/Header').then((m) => ({ default: m.Header }))
);
const NotFoundPage = lazyWithPreload(() => import('./components/NotFoundPage'));

const RouteDebugger = lazyWithPreload(() =>
  import('./components/RouteDebugger').then((m) => ({ default: m.RouteDebugger }))
);
const ProductScanner = lazyWithPreload(() =>
  import('./components/ProductScanner').then((m) => ({ default: m.ProductScanner }))
);
const FetchProductsModal = lazyWithPreload(() =>
  import('./components/FetchProductsModal').then((m) => ({ default: m.FetchProductsModal }))
);
const NotificationsModal = lazyWithPreload(() =>
  import('./components/NotificationsModal').then((m) => ({ default: m.NotificationsModal }))
);

const DashboardOverviewPage = lazyWithPreload(() => import('./components/DashboardOverviewPage'));
const TradersPage = lazyWithPreload(() => import('./components/TradersPage'));
const ProductsPage = lazyWithPreload(() => import('./components/ProductsPage'));
const InventoryPage = lazyWithPreload(() => import('./components/InventoryPage'));
const ImportHistoryPage = lazyWithPreload(() => import('./components/ImportHistoryPage'));
const ShippingManagementDashboard = lazyWithPreload(() => import('./components/ShippingManagementDashboard'));
const WaybillSplitterPage = lazyWithPreload(() => import('./components/WaybillSplitterPage'));
const PerformanceDashboard = lazyWithPreload(() => import('./components/PerformanceDashboard'));
const PriceComparisonEngine = lazyWithPreload(() => import('./components/PriceComparisonEngine'));
const AnalyticsPage = lazyWithPreload(() => import('./components/AnalyticsPage'));
const PlatformsOnboardingGuide = lazyWithPreload(() => import('./components/PlatformsOnboardingGuide'));
const TraderStoreSyncManager = lazyWithPreload(() => import('./components/TraderStoreSyncManager'));
const LayoutSettingsPage = lazyWithPreload(() => import('./components/LayoutSettingsPage'));
const AccountSettingsPage = lazyWithPreload(() => import('./components/AccountSettingsPage'));
const HelpPage = lazyWithPreload(() => import('./components/HelpPage'));
const WatchlistManager = lazyWithPreload(() => import('./components/WatchlistManager'));
const ProductImageStudio = lazyWithPreload(() => import('./components/ProductImageStudio'));
const OwnerDashboard = lazyWithPreload(() => import('./components/OwnerDashboard'));

export const OWNER_EMAIL = 'jassmeinnour@gmail.com';

const TAB_PRELOADERS: Partial<Record<WorkspaceTab, () => Promise<unknown>>> = {
  dashboard: DashboardOverviewPage.preload,
  traders: TradersPage.preload,
  products: ProductsPage.preload,
  merchants: ProductsPage.preload,
  inventory: InventoryPage.preload,
  product_image_studio: ProductImageStudio.preload,
  import_history: ImportHistoryPage.preload,
  shipping: ShippingManagementDashboard.preload,
  split_invoices: WaybillSplitterPage.preload,
  reports: PerformanceDashboard.preload,
  trending: PerformanceDashboard.preload,
  radar: PriceComparisonEngine.preload,
  auto_pricing: PriceComparisonEngine.preload,
  price_comparison: PriceComparisonEngine.preload,
  watchlist: WatchlistManager.preload,
  analytics: AnalyticsPage.preload,
  platforms_guide: PlatformsOnboardingGuide.preload,
  traders_sync: TraderStoreSyncManager.preload,
  layout_settings: LayoutSettingsPage.preload,
  account_settings: AccountSettingsPage.preload,
  help: HelpPage.preload,
  not_found: NotFoundPage.preload,
};

function preloadFirstScreenComponents(tab: WorkspaceTab): void {
  Header.preload();
  AppSidebar.preload();
  TAB_PRELOADERS[tab]?.();
}

const DEFAULT_MODAL_TRADER: Trader = {
  id: DEFAULT_TRADER_ID,
  user_id: 'founder',
  seller_name: 'محمود سعيد',
  email: 'mahmeudsaid4@gmail.com',
  phone: '',
  platform: 'amazon',
  status: 'active',
  seller_id: DEFAULT_TRADER_ID,
};

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (typeof window !== 'undefined') {
      return resolvePathToTab(window.location.pathname);
    }
    return 'home';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
      } catch {
        return false;
      }
    }
    return false;
  });
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [hasLazyLoadError, setHasLazyLoadError] = useState<boolean>(false);
  const [failedTabName, setFailedTabName] = useState<string | undefined>(undefined);
  const [mountDeferredOverlays, setMountDeferredOverlays] = useState(false);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAmazonImportOpen, setIsAmazonImportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const { user, isOwner, authInitError, isPasswordRecovery } = useAuth();
  const { isMaintenanceMode } = useMaintenanceMode();

  const handlePrefetchTab = useCallback((tab: WorkspaceTab) => {
    TAB_PRELOADERS[tab]?.();
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    if (!msg) return;
    setToastMessage(msg);
  }, []);

  const handlePullToRefresh = useCallback(async () => {
    if (isMaintenanceMode) {
      showToast(`⚠️ ${MAINTENANCE_MODE_BLOCK_MESSAGE}`);
      return;
    }
    dataCache.invalidate();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(RADAR_PULL_TO_REFRESH_EVENT, {
          detail: { tab: activeWorkspaceTab, timestamp: Date.now() },
        })
      );
    }
    await new Promise((resolve) => window.setTimeout(resolve, 350));
  }, [activeWorkspaceTab, isMaintenanceMode, showToast]);

  useEffect(() => {
    if (!user || !isOwner) {
      setShowOwnerDashboard(false);
    }
  }, [user, isOwner]);

  useEffect(() => {
    if (!user) return;
    preloadFirstScreenComponents(activeWorkspaceTab);
  }, [user, activeWorkspaceTab]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const refreshUnread = async () => {
      try {
        const list = await multiTenantDb.getNotifications();
        if (active) {
          setUnreadNotificationsCount((list || []).filter((n) => !n.is_read).length);
        }
      } catch {
        // safe fallback
      }
    };
    refreshUnread();
    window.addEventListener('radar_notifications_updated', refreshUnread);
    return () => {
      active = false;
      window.removeEventListener('radar_notifications_updated', refreshUnread);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(() => setMountDeferredOverlays(true), { timeout: 1200 });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(() => setMountDeferredOverlays(true), 800);
    return () => window.clearTimeout(timeoutId);
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveWorkspaceTab(resolvePathToTab(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 5500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleWatchlistAlert = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.message) {
        showToast(detail.message);
      }
    };
    window.addEventListener('merchant_watchlist_price_changed', handleWatchlistAlert);
    return () => window.removeEventListener('merchant_watchlist_price_changed', handleWatchlistAlert);
  }, [showToast]);

  const isResetPath =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/reset-password' ||
      window.location.hash.includes('type=recovery') ||
      window.location.hash.includes('access_token=') ||
      window.location.search.includes('type=recovery'));

  if (!user || !isOwner || authInitError || isPasswordRecovery || isResetPath) {
    if (
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login' &&
      !isResetPath
    ) {
      window.history.replaceState({}, '', '/login');
    }
    return (
      <ErrorBoundary
        sectionName="login-page"
        sectionTitle="شاشة تسجيل دخول المؤسس"
        sectionDescription="تعذر عرض واجهة تسجيل الدخول بالكامل مؤقتاً. اضغط إعادة المحاولة للمتابعة."
      >
        <LoginPage
          onLoginSuccess={() => {
            preloadFirstScreenComponents('home');
            setActiveWorkspaceTab('home');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
          }}
        />
      </ErrorBoundary>
    );
  }

  const resolveTabComponent = (tab: WorkspaceTab): React.ReactNode => {
    if (showOwnerDashboard && isOwner) {
      if (OwnerDashboard) return <OwnerDashboard />;
      return <DashboardHome onShowToast={showToast} />;
    }

    const componentMap: Record<string, React.ReactNode> = {
      home: <DashboardHome onShowToast={showToast} />,
      dashboard: <DashboardOverviewPage onShowToast={showToast} />,
      traders: <TradersPage onShowToast={showToast} />,
      products: <ProductsPage onShowToast={showToast} />,
      merchants: <ProductsPage onShowToast={showToast} />,
      inventory: <InventoryPage onShowToast={showToast} />,
      product_image_studio: <ProductImageStudio onShowToast={showToast} />,
      import_history: <ImportHistoryPage onShowToast={showToast} />,
      shipping: <ShippingManagementDashboard onShowToast={showToast} />,
      split_invoices: <WaybillSplitterPage onShowToast={showToast} />,
      reports: <PerformanceDashboard onShowToast={showToast} />,
      trending: <PerformanceDashboard onShowToast={showToast} />,
      radar: <PriceComparisonEngine onShowToast={showToast} />,
      auto_pricing: <PriceComparisonEngine onShowToast={showToast} />,
      price_comparison: <PriceComparisonEngine onShowToast={showToast} />,
      watchlist: (
        <WatchlistManager
          onShowToast={showToast}
          onSelectProduct={() => {
            setActiveWorkspaceTab('radar');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/competitors');
          }}
        />
      ),
      analytics: <AnalyticsPage />,
      platforms_guide: <PlatformsOnboardingGuide />,
      traders_sync: <TraderStoreSyncManager onShowToast={showToast} />,
      layout_settings: <LayoutSettingsPage />,
      account_settings: <AccountSettingsPage onShowToast={showToast} />,
      help: (
        <HelpPage
          onNavigateToPlatformsGuide={() => {
            setActiveWorkspaceTab('platforms_guide');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/connections');
          }}
        />
      ),
      not_found: (
        <NotFoundPage
          onGoHome={() => {
            setHasLazyLoadError(false);
            setActiveWorkspaceTab('home');
            navigate('/');
          }}
        />
      ),
    };

    const resolvedComponent = componentMap[tab];

    if (!resolvedComponent) {
      return (
        <NotFoundPage
          onGoHome={() => {
            setHasLazyLoadError(false);
            setActiveWorkspaceTab('home');
            navigate('/');
          }}
        />
      );
    }

    return resolvedComponent;
  };

  const renderActiveTab = () => {
    try {
      return resolveTabComponent(activeWorkspaceTab);
    } catch (err) {
      setHasLazyLoadError(true);
      setFailedTabName(activeWorkspaceTab);
      console.error(`[renderActiveTab Exception] Failed to resolve component for tab "${activeWorkspaceTab}":`, err);
      return <DashboardHome onShowToast={showToast} />;
    }
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      const next = !isSidebarCollapsed;
      setIsSidebarCollapsed(next);
      try {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
      } catch {
        // safe fallback
      }
    }
  };

  return (
    <div dir="rtl" className="w-full min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] pb-12 relative font-['Cairo'] transition-colors duration-200">
      <OfflineNoticeBanner onShowToast={showToast} />

      <ErrorBoundary silent fallback={null} sectionName="sidebar">
        <Suspense fallback={null}>
          <AppSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => {
              const next = !isSidebarCollapsed;
              setIsSidebarCollapsed(next);
              try {
                localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
              } catch {
                // safe fallback
              }
            }}
            activeTab={activeWorkspaceTab}
            onSelectTab={(tab) => {
              setActiveWorkspaceTab(tab);
              setShowOwnerDashboard(false);
              setIsSidebarOpen(false);
              if (typeof window !== 'undefined') {
                const pathMap: Record<string, string> = {
                  home: '/',
                  dashboard: '/dashboard',
                  traders: '/traders',
                  products: '/products',
                  inventory: '/inventory',
                  product_image_studio: '/image-studio',
                  import_history: '/import-history',
                  shipping: '/invoices',
                  split_invoices: '/invoices/split',
                  reports: '/reports',
                  radar: '/competitors',
                  watchlist: '/watchlist',
                  analytics: '/analytics',
                  platforms_guide: '/connections',
                  traders_sync: '/gmail-sync',
                  layout_settings: '/settings/layout',
                  account_settings: '/settings',
                  help: '/help',
                };
                if (pathMap[tab]) {
                  window.history.pushState({}, '', pathMap[tab]);
                }
              }
            }}
            onPrefetchTab={handlePrefetchTab}
            onOpenOwnerDashboard={() => {
              if (isOwner) {
                OwnerDashboard.preload();
                setShowOwnerDashboard(true);
              }
            }}
            onOpenScanner={() => {
              ProductScanner.preload();
              setIsScannerOpen(true);
            }}
            onOpenAmazonImport={() => {
              FetchProductsModal.preload();
              setIsAmazonImportOpen(true);
            }}
            onOpenNotifications={() => {
              NotificationsModal.preload();
              setIsNotificationsOpen(true);
            }}
            unreadNotificationsCount={unreadNotificationsCount}
            onShowToast={showToast}
            isOwner={isOwner}
          />
        </Suspense>
      </ErrorBoundary>

      <div
        className={`transition-[padding] duration-200 ${
          isSidebarCollapsed ? 'lg:pr-[72px]' : 'lg:pr-[264px]'
        }`}
      >
        <ErrorBoundary silent fallback={<div className="h-12 bg-[var(--header-bg)] border-b border-[var(--header-border)]" />} sectionName="header">
          <Suspense fallback={<div className="h-12 bg-[var(--header-bg)] border-b border-[var(--header-border)]" />}>
            <Header
              onShowToast={showToast}
              activeTab={activeWorkspaceTab}
              setActiveTab={(tab: string) => setActiveWorkspaceTab(tab as WorkspaceTab)}
              onToggleSidebar={handleToggleSidebar}
            />
          </Suspense>
        </ErrorBoundary>

        <PullToRefresh onRefresh={handlePullToRefresh} disabled={isMaintenanceMode}>
          <main className="w-full p-4 md:p-6 lg:p-8">
            <ErrorBoundary silent fallback={null} sectionName="maintenance-banner">
              <MaintenanceModeBanner canManage={isOwner} onShowToast={showToast} />
            </ErrorBoundary>
            {activeWorkspaceTab === 'home' && !showOwnerDashboard ? (
              <DashboardHome onShowToast={showToast} />
            ) : (
              <TabTransitionContainer tabKey={showOwnerDashboard ? 'owner' : activeWorkspaceTab}>
                <ErrorBoundary
                  sectionName={`tab-${activeWorkspaceTab}`}
                  sectionTitle={
                    showOwnerDashboard
                      ? 'لوحة إدارة المؤسس الشاملة'
                      : (
                          {
                            home: 'الصفحة الرئيسية',
                            dashboard: 'لوحة التحكم والعمليات',
                            traders: 'إدارة التجار',
                            products: 'كتالوج المنتجات والأسعار',
                            merchants: 'كتالوج المنتجات والأسعار',
                            inventory: 'إدارة المخزون',
                            product_image_studio: 'استوديو صور المنتجات بالذكاء الاصطناعي',
                            import_history: 'سجل عمليات الاستيراد',
                            shipping: 'بوالص الشحن والفواتير',
                            split_invoices: 'تقسيم البوالص',
                            reports: 'التقارير والمؤشرات المالية',
                            trending: 'التقارير والمؤشرات المالية',
                            radar: 'رادار المنافسين ومقارنة الأسعار',
                            auto_pricing: 'محرك التسعير الآلي',
                            price_comparison: 'مقارنة الأسعار الذكية',
                            watchlist: 'قائمة المتابعة وتنبيهات الأسعار',
                            analytics: 'التحليلات السوقية الشاملة',
                            platforms_guide: 'دليل ربط المنصات',
                            traders_sync: 'مزامنة حسابات التجار',
                            layout_settings: 'تخصيص الواجهة والترتيب',
                            account_settings: 'إعدادات الحساب والتنبيهات',
                            help: 'مركز المساعدة والدعم الفني',
                          }[activeWorkspaceTab] || `صفحة ${activeWorkspaceTab}`
                        )
                  }
                  sectionDescription="تعذر تحميل محتوى هذه الصفحة بالكامل مؤقتاً. يمكنك إعادة المحاولة أو الانتقال لصفحة أخرى من القائمة الجانبية."
                >
                  <Suspense fallback={<TabSkeletonLoader />}>
                    {renderActiveTab()}
                  </Suspense>
                </ErrorBoundary>
              </TabTransitionContainer>
            )}
          </main>
        </PullToRefresh>
      </div>

      {isScannerOpen && (
        <Suspense fallback={null}>
          <ProductScanner
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            currency="EGP"
            onProductDetected={(product) => {
              showToast(`تم فحص المنتج: ${product.title}`);
              setIsScannerOpen(false);
              setActiveWorkspaceTab('radar');
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/competitors');
              }
            }}
          />
        </Suspense>
      )}

      {isAmazonImportOpen && (
        <Suspense fallback={null}>
          <FetchProductsModal
            isOpen={isAmazonImportOpen}
            onClose={() => setIsAmazonImportOpen(false)}
            trader={DEFAULT_MODAL_TRADER}
            onShowToast={showToast}
            onSyncCompleted={() => {
              dataCache.invalidate();
              setActiveWorkspaceTab('products');
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/products');
              }
            }}
          />
        </Suspense>
      )}

      {isNotificationsOpen && (
        <Suspense fallback={null}>
          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onShowToast={showToast}
            onNavigateToSplit={() => {
              setActiveWorkspaceTab('split_invoices');
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/invoices/split');
              }
            }}
          />
        </Suspense>
      )}

      {mountDeferredOverlays && (
        <ErrorBoundary silent fallback={null} sectionName="overlays">
          <Suspense fallback={null}>
            <RouteDebugger
              activeTab={activeWorkspaceTab}
              hasLazyLoadError={hasLazyLoadError}
              failedTabName={failedTabName}
              onNavigate={(tab) => {
                setHasLazyLoadError(false);
                setActiveWorkspaceTab(tab);
                setShowOwnerDashboard(false);
                if (typeof window !== 'undefined') {
                  const pathMap: Record<string, string> = {
                    home: '/',
                    dashboard: '/dashboard',
                    traders: '/traders',
                    products: '/products',
                    inventory: '/inventory',
                    product_image_studio: '/image-studio',
                    import_history: '/import-history',
                    shipping: '/invoices',
                    split_invoices: '/invoices/split',
                    reports: '/reports',
                    radar: '/competitors',
                    watchlist: '/watchlist',
                    analytics: '/analytics',
                    platforms_guide: '/connections',
                    traders_sync: '/gmail-sync',
                    layout_settings: '/settings/layout',
                    account_settings: '/settings',
                    help: '/help',
                  };
                  if (pathMap[tab]) {
                    window.history.pushState({}, '', pathMap[tab]);
                  }
                }
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-[200] max-w-md bg-slate-900 text-white border border-indigo-500/60 shadow-2xl rounded-2xl px-4 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3"
        >
          <span className="text-xs sm:text-sm font-bold leading-relaxed flex-1">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="إغلاق الإشعار"
            className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
