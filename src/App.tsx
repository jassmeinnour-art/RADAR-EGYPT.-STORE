import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { OfflineNoticeBanner } from './components/OfflineNoticeBanner';
import { TabSkeletonLoader } from './components/TabSkeletonLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import { EmergencyLoginButton, EmergencyErrorBanner } from './components/EmergencyLoginButton';
import { PullToRefresh, RADAR_PULL_TO_REFRESH_EVENT } from './components/PullToRefresh';
import { TabTransitionContainer } from './components/TabTransitionContainer';
import { dataCache } from './utils/dataCache';
import { navigate } from './utils/navigation';

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

// Primary workspace shell components (loaded lazily so /login TTI stays minimal,
// and preloaded proactively only when authenticated first screen is rendered)
const AppSidebar = lazyWithPreload(() =>
  import('./components/AppSidebar').then((m) => ({ default: m.AppSidebar }))
);
const Header = lazyWithPreload(() =>
  import('./components/Header').then((m) => ({ default: m.Header }))
);
const NotFoundPage = lazyWithPreload(() => import('./components/NotFoundPage'));

// Lazy loaded non-critical overlays (deferred until browser idle)
const VisualCustomizerModal = lazyWithPreload(() =>
  import('./components/VisualCustomizerModal').then((m) => ({ default: m.VisualCustomizerModal }))
);
const DownloadFAB = lazyWithPreload(() => import('./components/DownloadFAB'));
const PWAInstallPrompt = lazyWithPreload(() => import('./components/PWAInstallPrompt'));
const RouteDebugger = lazyWithPreload(() =>
  import('./components/RouteDebugger').then((m) => ({ default: m.RouteDebugger }))
);

// Lazy loaded workspace tabs (only the active first-screen tab is preloaded proactively)
const DashboardHome = lazyWithPreload(() => import('./components/DashboardHome'));
const DashboardOverviewPage = lazyWithPreload(() => import('./components/DashboardOverviewPage'));
const TradersPage = lazyWithPreload(() => import('./components/TradersPage'));
const ProductsPage = lazyWithPreload(() => import('./components/ProductsPage'));
const InventoryPage = lazyWithPreload(() => import('./components/InventoryPage'));
const ShippingManagementDashboard = lazyWithPreload(() => import('./components/ShippingManagementDashboard'));
const WaybillSplitterPage = lazyWithPreload(() => import('./components/WaybillSplitterPage'));
const PerformanceDashboard = lazyWithPreload(() => import('./components/PerformanceDashboard'));
const PriceComparisonEngine = lazyWithPreload(() => import('./components/PriceComparisonEngine'));
const AnalyticsPage = lazyWithPreload(() => import('./components/AnalyticsPage'));
const PlatformsOnboardingGuide = lazyWithPreload(() => import('./components/PlatformsOnboardingGuide'));
const TraderStoreSyncManager = lazyWithPreload(() => import('./components/TraderStoreSyncManager'));
const LayoutSettingsPage = lazyWithPreload(() => import('./components/LayoutSettingsPage'));
const HelpPage = lazyWithPreload(() => import('./components/HelpPage'));
const OwnerDashboard = lazyWithPreload(() => import('./components/OwnerDashboard'));

export const OWNER_EMAIL = 'jassmeinnour@gmail.com';

export type WorkspaceTab = 
  | 'home' | 'dashboard' | 'traders' | 'products' | 'inventory' | 'merchants' | 'radar' | 'watchlist' | 'ai_studio' 
  | 'shipping' | 'trending' | 'reports' | 'auto_pricing' | 'price_comparison' | 'platforms_guide' 
  | 'traders_sync' | 'split_invoices' | 'help' | 'analytics' | 'layout_settings' | 'not_found';

function resolvePathToTab(rawPath: string): WorkspaceTab {
  const normalized = (rawPath || '/').replace(/\/+$/, '') || '/';
  if (normalized === '/' || normalized === '/index.html' || normalized === '/login') return 'home';
  if (normalized === '/dashboard') return 'dashboard';
  if (normalized === '/traders' || normalized.startsWith('/traders/')) return 'traders';
  if (normalized === '/products') return 'products';
  if (normalized === '/inventory') return 'inventory';
  if (normalized === '/invoices') return 'shipping';
  if (normalized === '/invoices/split') return 'split_invoices';
  if (normalized === '/reports') return 'reports';
  if (normalized === '/trending') return 'trending';
  if (normalized === '/competitors') return 'radar';
  if (normalized === '/auto-pricing') return 'auto_pricing';
  if (normalized === '/price-comparison') return 'price_comparison';
  if (normalized === '/watchlist') return 'watchlist';
  if (normalized === '/analytics') return 'analytics';
  if (normalized === '/connections') return 'platforms_guide';
  if (normalized === '/gmail-sync') return 'traders_sync';
  if (normalized === '/settings/layout') return 'layout_settings';
  if (normalized === '/help') return 'help';
  return 'not_found';
}

const TAB_PRELOADERS: Partial<Record<WorkspaceTab, () => Promise<unknown>>> = {
  home: DashboardHome.preload,
  dashboard: DashboardOverviewPage.preload,
  traders: TradersPage.preload,
  products: ProductsPage.preload,
  merchants: ProductsPage.preload,
  inventory: InventoryPage.preload,
  shipping: ShippingManagementDashboard.preload,
  split_invoices: WaybillSplitterPage.preload,
  reports: PerformanceDashboard.preload,
  trending: PerformanceDashboard.preload,
  radar: PriceComparisonEngine.preload,
  auto_pricing: PriceComparisonEngine.preload,
  price_comparison: PriceComparisonEngine.preload,
  analytics: AnalyticsPage.preload,
  platforms_guide: PlatformsOnboardingGuide.preload,
  traders_sync: TraderStoreSyncManager.preload,
  layout_settings: LayoutSettingsPage.preload,
  help: HelpPage.preload,
  not_found: NotFoundPage.preload,
};

function preloadFirstScreenComponents(tab: WorkspaceTab): void {
  // Preload ONLY the chrome and the single active route visible on first paint
  Header.preload();
  AppSidebar.preload();
  TAB_PRELOADERS[tab]?.();
}

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
  
  const { user, isOwner, authInitError } = useAuth();

  const handlePrefetchTab = useCallback((tab: WorkspaceTab) => {
    TAB_PRELOADERS[tab]?.();
  }, []);

  const handlePullToRefresh = useCallback(async () => {
    dataCache.invalidate();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(RADAR_PULL_TO_REFRESH_EVENT, {
          detail: { tab: activeWorkspaceTab, timestamp: Date.now() },
        })
      );
    }
    await new Promise((resolve) => window.setTimeout(resolve, 350));
  }, [activeWorkspaceTab]);

  useEffect(() => {
    if (!user || !isOwner) {
      setShowOwnerDashboard(false);
    }
  }, [user, isOwner]);

  // Proactive preload strictly for the visible first-screen components when authenticated
  useEffect(() => {
    if (!user) return;
    preloadFirstScreenComponents(activeWorkspaceTab);
  }, [user, activeWorkspaceTab]);

  // Defer secondary floating overlays until the main thread is idle after first screen TTI
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

  const showToast = (msg: string) => {
    if (msg) console.log(msg);
  };

  if (!user || authInitError) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState({}, '', '/login');
    }
    return (
      <LoginPage 
        onLoginSuccess={() => {
          preloadFirstScreenComponents('home');
          setActiveWorkspaceTab('home');
          if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
        }} 
      />
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
      shipping: <ShippingManagementDashboard onShowToast={showToast} />,
      split_invoices: <WaybillSplitterPage onShowToast={showToast} />,
      reports: <PerformanceDashboard onShowToast={showToast} />,
      trending: <PerformanceDashboard onShowToast={showToast} />,
      radar: <PriceComparisonEngine onShowToast={showToast} />,
      auto_pricing: <PriceComparisonEngine onShowToast={showToast} />,
      price_comparison: <PriceComparisonEngine onShowToast={showToast} />,
      analytics: <AnalyticsPage />,
      platforms_guide: <PlatformsOnboardingGuide />,
      traders_sync: <TraderStoreSyncManager onShowToast={showToast} />,
      layout_settings: <LayoutSettingsPage />,
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
      localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
    }
  };

  return (
    <div dir="rtl" className="w-full min-h-screen bg-slate-950 text-slate-100 pb-20 relative font-['Cairo']">
      <OfflineNoticeBanner onShowToast={showToast} />
      
      <Suspense fallback={null}>
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => {
            const next = !isSidebarCollapsed;
            setIsSidebarCollapsed(next);
            localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
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
                shipping: '/invoices',
                split_invoices: '/invoices/split',
                reports: '/reports',
                radar: '/competitors',
                analytics: '/analytics',
                platforms_guide: '/connections',
                traders_sync: '/gmail-sync',
                layout_settings: '/settings/layout',
                help: '/help'
              };
              if (pathMap[tab]) {
                window.history.pushState({}, '', pathMap[tab]);
              }
            }
          }}
          onPrefetchTab={handlePrefetchTab}
          onOpenAllMerchantsHub={() => {}}
          onOpenOwnerDashboard={() => {
            if (isOwner) {
              OwnerDashboard.preload();
              setShowOwnerDashboard(true);
            }
          }}
          onOpenSubscriptionModal={() => {}}
          onOpenOnboarding={() => {}}
          isOwner={isOwner}
        />
      </Suspense>

      <div 
        className="transition-[padding] duration-200"
        style={{
          paddingRight: isSidebarOpen ? '0' : (isSidebarCollapsed ? 'var(--sidebar-collapsed-width, 70px)' : 'var(--sidebar-width, 280px)')
        }}
      >
        <Suspense fallback={<div className="h-16 bg-slate-950 border-b border-slate-800/60" />}>
          <Header 
            onShowToast={showToast}
            activeTab={activeWorkspaceTab}
            setActiveTab={(tab: string) => setActiveWorkspaceTab(tab as WorkspaceTab)}
            onToggleSidebar={handleToggleSidebar}
            onOpenScanner={() => {}}
            onOpenPublishModal={() => {}}
            connectedPlatforms={[]}
            productCount={0}
            onNavigateToSplit={() => setActiveWorkspaceTab('split_invoices')}
            onNavigateToTrader={(id) => { 
              setActiveWorkspaceTab('traders');
              if (typeof window !== 'undefined') window.history.pushState({}, '', `/traders/${id}`);
            }}
          />
        </Suspense>
        
        <PullToRefresh onRefresh={handlePullToRefresh}>
          <main className="w-full p-4 md:p-6 lg:p-8">
            {hasLazyLoadError && (
              <div className="mb-4">
                <EmergencyErrorBanner message="لا توجد بيانات — تعذر تحميل الصفحة المطلوبة." />
              </div>
            )}
            <TabTransitionContainer tabKey={showOwnerDashboard ? 'owner' : activeWorkspaceTab}>
              <ErrorBoundary 
                sectionName={`tab-${activeWorkspaceTab}`} 
                fallback={
                  <div className="space-y-4">
                    <EmergencyErrorBanner message="تعذر عرض هذه الصفحة مؤقتاً." />
                    <div className="flex justify-center">
                      <EmergencyLoginButton />
                    </div>
                  </div>
                }
              >
                <Suspense fallback={<TabSkeletonLoader />}>
                  {renderActiveTab()}
                </Suspense>
              </ErrorBoundary>
            </TabTransitionContainer>
          </main>
        </PullToRefresh>
      </div>

      {mountDeferredOverlays && (
        <Suspense fallback={null}>
          <VisualCustomizerModal />
          <PWAInstallPrompt onShowToast={showToast} />
          <DownloadFAB />
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
                  shipping: '/invoices',
                  split_invoices: '/invoices/split',
                  reports: '/reports',
                  radar: '/competitors',
                  analytics: '/analytics',
                  platforms_guide: '/connections',
                  traders_sync: '/gmail-sync',
                  layout_settings: '/settings/layout',
                  help: '/help'
                };
                if (pathMap[tab]) {
                  window.history.pushState({}, '', pathMap[tab]);
                }
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
