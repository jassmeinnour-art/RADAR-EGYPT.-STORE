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
import LandingPage from './components/LandingPage';
import { LoginPage } from './components/LoginPage';

// Lazy loaded components
const DashboardHome = lazy(() => import('./components/DashboardHome'));
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
  | 'home' | 'traders' | 'products' | 'inventory' | 'merchants' | 'radar' | 'watchlist' | 'ai_studio' 
  | 'shipping' | 'trending' | 'reports' | 'auto_pricing' | 'price_comparison' | 'platforms_guide' 
  | 'traders_sync' | 'split_invoices' | 'help' | 'analytics' | 'layout_settings';

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
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
  
  const { user, profile, isLoading, isOwner } = useAuth();
  const subscriptionState = useSubscription(profile);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/traders') setActiveWorkspaceTab('traders');
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

  const renderActiveTab = () => {
    if (showOwnerDashboard && isOwner) return <OwnerDashboard />;

    switch (activeWorkspaceTab) {
      case 'home':
        return <DashboardHome />;
      case 'traders':
        return <TradersPage onShowToast={showToast} />;
      case 'products':
      case 'merchants':
        return <ProductsPage onShowToast={showToast} />;
      case 'inventory':
        return <InventoryPage onShowToast={showToast} />;
      case 'shipping':
        return <ShippingManagementDashboard onShowToast={showToast} />;
      case 'split_invoices':
        return <WaybillSplitterPage onShowToast={showToast} />;
      case 'reports':
      case 'trending':
        return <PerformanceDashboard onShowToast={showToast} />;
      case 'radar':
        return <PriceComparisonEngine onShowToast={showToast} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'platforms_guide':
        return <PlatformsOnboardingGuide />;
      case 'traders_sync':
        return <TraderStoreSyncManager onShowToast={showToast} />;
      case 'layout_settings':
        return <LayoutSettingsPage />;
      case 'help':
        return (
          <HelpPage 
            onNavigateToPlatformsGuide={() => {
              setActiveWorkspaceTab('platforms_guide');
              if (typeof window !== 'undefined') window.history.pushState({}, '', '/connections');
            }}
          />
        );
      default:
        return <DashboardHome />;
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
              <Suspense fallback={<TabSkeletonLoader />}>
                {renderActiveTab()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <VisualCustomizerModal />
      <DownloadFAB />
    </div>
  );
}
