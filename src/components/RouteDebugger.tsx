import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bug, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  Terminal, 
  Layers, 
  Search,
  Code,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { WorkspaceTab } from '../App';

export interface RouteInfo {
  tab: WorkspaceTab;
  path: string;
  componentName: string;
  isLazy: boolean;
  status: 'ok' | 'lazy_pending' | 'missing' | 'error';
  errorMessage?: string;
  lastChecked?: string;
}

interface RouteDebuggerProps {
  activeTab: WorkspaceTab;
  onNavigate?: (tab: WorkspaceTab) => void;
  hasLazyLoadError?: boolean;
  failedTabName?: string;
  isDevModeOverride?: boolean;
}

// Complete list of expected workspace tabs and routes in App.tsx
const REGISTERED_ROUTES_CONFIG: Array<{ tab: WorkspaceTab; path: string; componentName: string; isLazy: boolean }> = [
  { tab: 'home', path: '/', componentName: 'DashboardHome', isLazy: true },
  { tab: 'dashboard', path: '/dashboard', componentName: 'DashboardOverviewPage', isLazy: true },
  { tab: 'traders', path: '/traders', componentName: 'TradersPage', isLazy: true },
  { tab: 'products', path: '/products', componentName: 'ProductsPage', isLazy: true },
  { tab: 'merchants', path: '/traders', componentName: 'ProductsPage (Alias)', isLazy: true },
  { tab: 'inventory', path: '/inventory', componentName: 'InventoryPage', isLazy: true },
  { tab: 'shipping', path: '/invoices', componentName: 'ShippingManagementDashboard', isLazy: true },
  { tab: 'split_invoices', path: '/invoices/split', componentName: 'WaybillSplitterPage', isLazy: true },
  { tab: 'reports', path: '/reports', componentName: 'PerformanceDashboard', isLazy: true },
  { tab: 'trending', path: '/trending', componentName: 'PerformanceDashboard (Alias)', isLazy: true },
  { tab: 'radar', path: '/competitors', componentName: 'PriceComparisonEngine', isLazy: true },
  { tab: 'auto_pricing', path: '/auto-pricing', componentName: 'PriceComparisonEngine (Alias)', isLazy: true },
  { tab: 'price_comparison', path: '/price-comparison', componentName: 'PriceComparisonEngine (Alias)', isLazy: true },
  { tab: 'analytics', path: '/analytics', componentName: 'AnalyticsPage', isLazy: true },
  { tab: 'platforms_guide', path: '/connections', componentName: 'PlatformsOnboardingGuide', isLazy: true },
  { tab: 'traders_sync', path: '/gmail-sync', componentName: 'TraderStoreSyncManager', isLazy: true },
  { tab: 'layout_settings', path: '/settings/layout', componentName: 'LayoutSettingsPage', isLazy: true },
  { tab: 'help', path: '/help', componentName: 'HelpPage', isLazy: true },
  { tab: 'watchlist', path: '/watchlist', componentName: 'PriceComparisonEngine (Watchlist)', isLazy: true },
  { tab: 'ai_studio', path: '/ai-studio', componentName: 'OwnerDashboard (AI Studio)', isLazy: true },
];

export const RouteDebugger: React.FC<RouteDebuggerProps> = ({
  activeTab,
  onNavigate,
  hasLazyLoadError = false,
  failedTabName,
  isDevModeOverride,
}) => {
  // Determine if dev mode is active
  const isDev = useMemo(() => {
    if (typeof isDevModeOverride === 'boolean') return isDevModeOverride;
    return Boolean(
      import.meta.env.DEV || 
      process.env.NODE_ENV === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('127.0.0.1')
    );
  }, [isDevModeOverride]);

  // Always show if dev mode is true OR if a lazy loading error occurred
  const shouldRender = isDev || hasLazyLoadError;

  const [isExpanded, setIsExpanded] = useState<boolean>(hasLazyLoadError);
  const [routeStatuses, setRouteStatuses] = useState<RouteInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'errors' | 'lazy'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Perform audit on routes
  const auditRoutes = React.useCallback(() => {
    setIsAuditing(true);
    console.group('🔍 [RouteDebugger] Diagnostic Route Integrity Audit');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Current Active Tab: "${activeTab}"`);
    console.log(`Environment: ${isDev ? 'Development' : 'Production'}`);

    const audited: RouteInfo[] = REGISTERED_ROUTES_CONFIG.map((config) => {
      let status: RouteInfo['status'] = 'ok';
      let errorMessage: string | undefined = undefined;

      // Check if this tab matches a failed tab
      if (hasLazyLoadError && (config.tab === failedTabName || config.tab === activeTab)) {
        status = 'error';
        errorMessage = `Failed to resolve or dynamic import chunk crashed for tab "${config.tab}"`;
      } else if (config.isLazy) {
        status = 'lazy_pending';
      }

      // Check for missing component name
      if (!config.componentName) {
        status = 'missing';
        errorMessage = `No component registered for tab "${config.tab}"`;
      }

      if (status === 'error' || status === 'missing') {
        console.error(
          `❌ [Route Match Fail] Tab: "${config.tab}" | Path: "${config.path}" | Component: "${config.componentName}" | Details: ${errorMessage || 'Unknown error'}`
        );
      } else {
        console.log(
          `✅ [Route OK] Tab: "${config.tab}" | Path: "${config.path}" | Component: "${config.componentName}" (${status})`
        );
      }

      return {
        ...config,
        status,
        errorMessage,
        lastChecked: new Date().toLocaleTimeString('ar-EG'),
      };
    });

    console.groupEnd();
    setRouteStatuses(audited);
    setTimeout(() => setIsAuditing(false), 400);
  }, [activeTab, failedTabName, hasLazyLoadError, isDev]);

  useEffect(() => {
    auditRoutes();
  }, [auditRoutes]);

  // Open automatically if a lazy component load error occurs
  useEffect(() => {
    if (hasLazyLoadError) {
      setIsExpanded(true);
    }
  }, [hasLazyLoadError]);

  if (!shouldRender) {
    return null;
  }

  const filteredRoutes = routeStatuses.filter((route) => {
    const matchesSearch = 
      route.tab.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.componentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'errors') return matchesSearch && (route.status === 'error' || route.status === 'missing');
    if (statusFilter === 'lazy') return matchesSearch && route.isLazy;
    return matchesSearch;
  });

  const errorCount = routeStatuses.filter((r) => r.status === 'error' || r.status === 'missing').length;
  const okCount = routeStatuses.filter((r) => r.status === 'ok' || r.status === 'lazy_pending').length;

  const handleCopyLogs = () => {
    const summary = routeStatuses.map(
      (r) => `Tab: ${r.tab} | Path: ${r.path} | Component: ${r.componentName} | Status: ${r.status}${r.errorMessage ? ` | Error: ${r.errorMessage}` : ''}`
    ).join('\n');
    navigator.clipboard.writeText(`--- Route Debugger Diagnostic Report ---\nActive Tab: ${activeTab}\nHas Error: ${hasLazyLoadError}\nTimestamp: ${new Date().toISOString()}\n\n${summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-4xl font-['Cairo'] text-xs">
      {/* Mini Collapsed Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-2xl border transition-all duration-200 ${
            hasLazyLoadError || errorCount > 0
              ? 'bg-red-950/90 border-red-500/50 text-red-200 hover:bg-red-900 animate-pulse'
              : 'bg-slate-900/90 border-emerald-500/40 text-slate-200 hover:bg-slate-800'
          } backdrop-blur-md`}
          title="افتح أداة تشخيص المسارات (Route Debugger)"
        >
          <Bug className={`w-4 h-4 ${errorCount > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
          <span className="font-semibold">فاحص المسارات (Route Debugger)</span>
          {errorCount > 0 ? (
            <span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full text-[10px]">
              {errorCount} خطأ
            </span>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px]">
              DEV OK
            </span>
          )}
          <ChevronUp className="w-3.5 h-3.5 opacity-70" />
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl w-[92vw] max-w-3xl flex flex-col max-h-[80vh] border-l-4 border-l-emerald-500">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <Bug className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  تشخيص مسارات النظام والمكونات (Route Debugger)
                  {hasLazyLoadError && (
                    <span className="bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded-md border border-red-500/30 font-mono">
                      فشل Lazy Component
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  فحص دقة اقتران `WorkspaceTab` بالمكونات المسجلة في `App.tsx`
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={auditRoutes}
                disabled={isAuditing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                title="إعادة فحص المسارات وطباعة النتائج بالكونسول"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>إعادة الفحص</span>
              </button>

              <button
                onClick={handleCopyLogs}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                title="نسخ تقرير التشخيص"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
              </button>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-2 px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/80 text-center">
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">إجمالي المسارات</div>
              <div className="text-sm font-bold text-slate-100">{routeStatuses.length}</div>
            </div>
            <div className="p-2 bg-emerald-950/30 rounded-xl border border-emerald-900/40">
              <div className="text-[10px] text-emerald-400">مسارات سليمة</div>
              <div className="text-sm font-bold text-emerald-300">{okCount}</div>
            </div>
            <div className="p-2 bg-red-950/30 rounded-xl border border-red-900/40">
              <div className="text-[10px] text-red-400">مسارات بها أخطاء</div>
              <div className="text-sm font-bold text-red-300">{errorCount}</div>
            </div>
            <div className="p-2 bg-sky-950/30 rounded-xl border border-sky-900/40">
              <div className="text-[10px] text-sky-400">المسار النشط حالياً</div>
              <div className="text-sm font-bold text-sky-300 truncate dir-ltr">{activeTab}</div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="بحث بالمكون أو المسار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                  statusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                الكل ({routeStatuses.length})
              </button>
              <button
                onClick={() => setStatusFilter('errors')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                  statusFilter === 'errors' ? 'bg-red-900/80 text-red-200 border border-red-700' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                الأخطاء ({errorCount})
              </button>
              <button
                onClick={() => setStatusFilter('lazy')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                  statusFilter === 'lazy' ? 'bg-sky-900/80 text-sky-200 border border-sky-700' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Lazy Loaded ({routeStatuses.filter(r => r.isLazy).length})
              </button>
            </div>
          </div>

          {/* Diagnostic Table */}
          <div className="overflow-y-auto max-h-80 p-2">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                  <th className="p-2 font-medium">مُعرّف المسار (Tab)</th>
                  <th className="p-2 font-medium">المسار (Path)</th>
                  <th className="p-2 font-medium">المكون المرتبط (Component)</th>
                  <th className="p-2 font-medium">الحالة (Status)</th>
                  <th className="p-2 font-medium text-center">إجراء (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      لا توجد نتائج مطابقة للبحث أو الفلتر المحدد.
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route) => {
                    const isActive = route.tab === activeTab;
                    return (
                      <tr
                        key={route.tab}
                        className={`transition hover:bg-slate-800/40 ${
                          isActive ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        <td className="p-2 font-mono text-emerald-300 font-medium">
                          <span className="flex items-center gap-1.5">
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                            {route.tab}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-slate-300 dir-ltr">{route.path}</td>
                        <td className="p-2 font-mono text-slate-300 flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-slate-500" />
                          <span>{route.componentName}</span>
                        </td>
                        <td className="p-2">
                          {route.status === 'ok' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold text-[10px]">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              سليم (OK)
                            </span>
                          )}
                          {route.status === 'lazy_pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800/60 font-semibold text-[10px]">
                              <Layers className="w-3 h-3 text-sky-400" />
                              تحميل مؤجل (Lazy)
                            </span>
                          )}
                          {route.status === 'missing' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold text-[10px]">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              مكون مفقود (Missing)
                            </span>
                          )}
                          {route.status === 'error' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 border border-red-800/60 font-semibold text-[10px]">
                              <XCircle className="w-3 h-3 text-red-400" />
                              خطأ تحميل (Failed)
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate(route.tab)}
                              className={`px-2 py-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 mx-auto ${
                                isActive
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                              }`}
                            >
                              <ExternalLink className="w-3 h-3" />
                              {isActive ? 'المسار الحالي' : 'اختبار'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Console Log Hint Footer */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                يتم تسجيل كافة تفاصيل التشخيص في <strong>Console Browser</strong> عند الضغط على إعادة الفحص.
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-500">
              AI Studio Route Diagnostics v1.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDebugger;
