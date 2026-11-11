import React, { useState, Suspense, lazy, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useSubscription } from './hooks/useSubscription';
import { AppSidebar } from './components/AppSidebar';
import { Header } from './components/Header';
import { OfflineNoticeBanner } from './components/OfflineNoticeBanner';
import { TabSkeletonLoader } from './components/TabSkeletonLoader';
import { VisualCustomizerModal } from './components/VisualCustomizerModal';
import { DownloadFAB } from './components/DownloadFAB';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RouteDebugger } from './components/RouteDebugger';

// Lazy loaded components
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
  | 'traders_sync' | 'split_invoices' | 'help' | 'analytics' | 'layout_settings';

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/dashboard') return 'dashboard';
      if (path === '/traders') return 'traders';
      if (path === '/products') return 'products';
      if (path === '/inventory') return 'inventory';
      if (path === '/invoices') return 'shipping';
      if (path === '/invoices/split') return 'split_invoices';
      if (path === '/reports') return 'reports';
      if (path === '/competitors') return 'radar';
      if (path === '/analytics') return 'analytics';
      if (path === '/connections') return 'platforms_guide';
      if (path === '/gmail-sync') return 'traders_sync';
      if (path === '/settings/layout') return 'layout_settings';
      if (path === '/help') return 'help';
    }
    return 'home';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [hasLazyLoadError, setHasLazyLoadError] = useState<boolean>(false);
  const [failedTabName, setFailedTabName] = useState<string | undefined>(undefined);
  
  const { user, profile, isLoading, isOwner } = useAuth();
  const subscriptionState = useSubscription(profile);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') setActiveWorkspaceTab('dashboard');
      else if (path === '/traders') setActiveWorkspaceTab('traders');
      else if (path === '/products') setActiveWorkspaceTab('products');
      else if (path === '/inventory') setActiveWorkspaceTab('inventory');
      else if (path === '/invoices') setActiveWorkspaceTab('shipping');
      else if (path === '/invoices/split') setActiveWorkspaceTab('split_invoices');
      else if (path === '/reports') setActiveWorkspaceTab('reports');
      else if (path === '/competitors') setActiveWorkspaceTab('radar');
      else if (path === '/analytics') setActiveWorkspaceTab('analytics');
      else if (path === '/connections') setActiveWorkspaceTab('platforms_guide');
      else if (path === '/gmail-sync') setActiveWorkspaceTab('traders_sync');
      else if (path === '/settings/layout') setActiveWorkspaceTab('layout_settings');
      else if (path === '/help') setActiveWorkspaceTab('help');
      else if (path === '/') setActiveWorkspaceTab('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (msg: string) => {
    console.log(msg);
  };

  if (isLoading) {
    return <TabSkeletonLoader />;
  }

  if (!user) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState({}, '', '/login');
    }
    return (
      <LoginPage 
        onLoginSuccess={() => {
          setShowLogin(false);
          setActiveWorkspaceTab('home');
          if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
        }} 
      />
    );
  }

  /**
   * Guidance & verification function to validate that a component exists
   * for the active tab before rendering in renderActiveTab. If the component
   * is missing or fails to resolve, logs error details to the console and
   * safely directs the user to DashboardHome to prevent a blank screen.
   */
  const resolveTabComponent = (tab: WorkspaceTab): React.ReactNode => {
    if (showOwnerDashboard && isOwner) {
      if (OwnerDashboard) return <OwnerDashboard />;
      console.error('[Route Resolver Error] OwnerDashboard component is missing or failed to load. Redirecting to DashboardHome.');
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
    };

    const resolvedComponent = componentMap[tab];

    if (!resolvedComponent) {
      setHasLazyLoadError(true);
      setFailedTabName(tab);
      console.error(
        `[Route Resolver Error] Could not find or resolve component for activeWorkspaceTab: "${tab}". ` +
        `Redirecting user to DashboardHome to prevent a blank screen.`
      );
      // Automatically redirect active tab to home in background state to keep route synced
      setTimeout(() => {
        setActiveWorkspaceTab('home');
        if (typeof window !== 'undefined') window.history.replaceState({}, '', '/');
      }, 0);
      return <DashboardHome onShowToast={showToast} />;
    }

    return resolvedComponent;
  };

  const renderActiveTab = () => {
    try {
      console.debug(`[Lazy Map Diagnostic] Resolving component for active tab: "${activeWorkspaceTab}"`);
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
        onOpenOwnerDashboard={() => setShowOwnerDashboard(true)}
        onOpenSubscriptionModal={() => {}}
        onOpenOnboarding={() => {}}
        isOwner={isOwner}
      />

      <div 
        className="transition-all duration-300"
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
          <AnimatePresence mode="wait">
            <motion.div
              key={showOwnerDashboard ? 'owner' : activeWorkspaceTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ErrorBoundary 
                sectionName={`tab-${activeWorkspaceTab}`} 
                fallback={<DashboardHome onShowToast={showToast} />}
              >
                <Suspense fallback={<TabSkeletonLoader />}>
                  {renderActiveTab()}
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

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
    </div>
  );
}
