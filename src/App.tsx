import React, { useState, Suspense, lazy, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AppSidebar } from './components/AppSidebar';
import { Header } from './components/Header';
import { OfflineNoticeBanner } from './components/OfflineNoticeBanner';
import { TabSkeletonLoader } from './components/TabSkeletonLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import NotFoundPage from './components/NotFoundPage';
import { EmergencyLoginButton, EmergencyErrorBanner } from './components/EmergencyLoginButton';
import { navigate } from './utils/navigation';

// Lazy loaded workspace pages & non-critical overlays
const VisualCustomizerModal = lazy(() => import('./components/VisualCustomizerModal').then((m) => ({ default: m.VisualCustomizerModal })));
const DownloadFAB = lazy(() => import('./components/DownloadFAB'));
const RouteDebugger = lazy(() => import('./components/RouteDebugger').then((m) => ({ default: m.RouteDebugger })));

const DashboardHome = lazy(() => import('./components/DashboardHome'));
const DashboardOverviewPage = lazy(() => import('./components/DashboardOverviewPage'));
const TradersPage = lazy(() => import('./components/TradersPage'));
const ProductsPage = lazy(() => import('./components/ProductsPage'));
const InventoryPage = lazy(() => import('./components/InventoryPage'));
const ShippingManagementDashboard = lazy(() => import('./components/ShippingManagementDashboard'));
const WaybillSplitterPage = lazy(() => import('./components/WaybillSplitterPage'));
const PerformanceDashboard = lazy(() => import('./components/PerformanceDashboard'));
const PriceComparisonEngine = lazy(() => import('./components/PriceComparisonEngine'));
const AnalyticsPage = lazy(() => import('./components/AnalyticsPage'));
const PlatformsOnboardingGuide = lazy(() => import('./components/PlatformsOnboardingGuide'));
const TraderStoreSyncManager = lazy(() => import('./components/TraderStoreSyncManager'));
const LayoutSettingsPage = lazy(() => import('./components/LayoutSettingsPage'));
const HelpPage = lazy(() => import('./components/HelpPage'));
const OwnerDashboard = lazy(() => import('./components/OwnerDashboard'));

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
  
  const { user, isOwner, signOut } = useAuth();

  useEffect(() => {
    if (!user || !isOwner) {
      setShowOwnerDashboard(false);
    }
  }, [user, isOwner]);

  useEffect(() => {
    if (!user) return;
    const id = window.setTimeout(() => setMountDeferredOverlays(true), 400);
    return () => clearTimeout(id);
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

  if (!user) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState({}, '', '/login');
    }
    return (
      <LoginPage 
        onLoginSuccess={() => {
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
        onOpenAllMerchantsHub={() => {}}
        onOpenOwnerDashboard={() => {
          if (isOwner) setShowOwnerDashboard(true);
        }}
        onOpenSubscriptionModal={() => {}}
        onOpenOnboarding={() => {}}
        isOwner={isOwner}
      />

      <div 
        className="transition-[padding] duration-200"
        style={{
          paddingRight: isSidebarOpen ? '0' : (isSidebarCollapsed ? 'var(--sidebar-collapsed-width, 70px)' : 'var(--sidebar-width, 280px)')
        }}
      >
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
        
        <main className="w-full p-4 md:p-6 lg:p-8">
          {hasLazyLoadError && (
            <div className="mb-4">
              <EmergencyErrorBanner message="لا توجد بيانات — تعذر تحميل الصفحة المطلوبة." />
            </div>
          )}
          <div key={showOwnerDashboard ? 'owner' : activeWorkspaceTab}>
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
          </div>
        </main>
      </div>

      {mountDeferredOverlays && (
        <Suspense fallback={null}>
          <VisualCustomizerModal />
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
