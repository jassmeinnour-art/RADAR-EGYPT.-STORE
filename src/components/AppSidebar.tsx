import React, { useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  X,
  Users,
  Zap,
  Globe,
  Truck,
  FileSpreadsheet,
  Crown,
  Layers,
  Settings,
  Compass,
  Bell,
  Scissors,
  Package,
  Menu,
  Mail,
  Link2,
  Bookmark,
  History,
  Camera,
  Moon,
  Sun,
  Smartphone,
  Download,
  ExternalLink,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkspaceTab } from '../App';
import { FounderModeWrapper } from './FounderModeWrapper';
import { useTheme } from '../context/ThemeContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenOwnerDashboard: () => void;
  onOpenScanner?: () => void;
  onOpenAmazonImport?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onShowToast?: (message: string) => void;
  onPrefetchTab?: (tab: WorkspaceTab) => void;
  isOwner: boolean;
  trialDaysRemaining?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  preloadTab?: WorkspaceTab;
  action: () => void;
  isActive?: boolean;
  badge?: string;
}

interface NavCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  onOpenOwnerDashboard,
  onOpenScanner,
  onOpenAmazonImport,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onShowToast,
  onPrefetchTab,
  isOwner,
  trialDaysRemaining = 3,
}) => {
  const { resolvedColorMode, toggleColorMode } = useTheme();
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    install,
    openInNewWindow,
    downloadApkDirectly,
  } = usePWAInstall();

  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      const next = !internalCollapsed;
      setInternalCollapsed(next);
      try {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
      } catch {
        // safe fallback
      }
    }
  };

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    home: true,
    inventory: true,
    sales: true,
    competition: true,
    connections: true,
    settings: true,
    app: true,
  });

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleItemClick = (action: () => void) => {
    action();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleInstallAppClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        } catch {
          // safe fallback
        }
        onShowToast?.('تم تثبيت تطبيق RADAR على جهازك بنجاح.');
        return;
      }
    }
    setShowInstallGuideModal(true);
  };

  const categories: NavCategory[] = [
    {
      id: 'home',
      title: 'الرئيسية',
      icon: <Zap className="w-4 h-4 text-sky-400" />,
      items: [
        {
          id: 'home_tab',
          label: 'لوحة التحكم الرئيسية',
          icon: <Zap className="w-4 h-4 text-sky-400" />,
          preloadTab: 'home',
          isActive: activeTab === 'home',
          action: () => {
            onSelectTab('home');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
          },
        },
      ],
    },
    {
      id: 'inventory',
      title: 'المخزون',
      icon: <Package className="w-4 h-4 text-amber-300" />,
      items: [
        {
          id: 'products_tab',
          label: 'عرض المنتجات',
          icon: <Package className="w-4 h-4 text-sky-300" />,
          preloadTab: 'products',
          isActive: activeTab === 'products' || activeTab === 'merchants',
          action: () => {
            onSelectTab('products');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/products');
          },
        },
        {
          id: 'scan_product_action',
          label: 'مسح منتج جديد',
          icon: <Camera className="w-4 h-4 text-emerald-300" />,
          action: () => {
            onOpenScanner?.();
          },
        },
        {
          id: 'traders_tab',
          label: 'إدارة التجار',
          icon: <Users className="w-4 h-4 text-amber-300" />,
          preloadTab: 'traders',
          isActive: activeTab === 'traders',
          action: () => {
            onSelectTab('traders');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/traders');
          },
        },
        {
          id: 'inventory_tab',
          label: 'إدارة المخزون',
          icon: <Layers className="w-4 h-4 text-emerald-300" />,
          preloadTab: 'inventory',
          isActive: activeTab === 'inventory',
          action: () => {
            onSelectTab('inventory');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/inventory');
          },
        },
        {
          id: 'import_history_tab',
          label: 'سجل عمليات الاستيراد',
          icon: <History className="w-4 h-4 text-amber-300" />,
          preloadTab: 'import_history',
          isActive: activeTab === 'import_history',
          action: () => {
            onSelectTab('import_history');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/import-history');
          },
        },
      ],
    },
    {
      id: 'sales',
      title: 'المبيعات',
      icon: <Truck className="w-4 h-4 text-purple-300" />,
      items: [
        {
          id: 'shipping_tab',
          label: 'الفواتير',
          icon: <Truck className="w-4 h-4 text-purple-300" />,
          preloadTab: 'shipping',
          isActive: activeTab === 'shipping',
          action: () => {
            onSelectTab('shipping');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/invoices');
          },
        },
        {
          id: 'split_invoices_tab',
          label: 'مقسم البوالص',
          icon: <Scissors className="w-4 h-4 text-amber-300" />,
          preloadTab: 'split_invoices',
          isActive: activeTab === 'split_invoices',
          action: () => {
            onSelectTab('split_invoices');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/invoices/split');
          },
        },
        {
          id: 'reports_tab',
          label: 'التقارير',
          icon: <BarChart3 className="w-4 h-4 text-emerald-300" />,
          preloadTab: 'reports',
          isActive: activeTab === 'reports' || activeTab === 'trending',
          action: () => {
            onSelectTab('reports');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/reports');
          },
        },
      ],
    },
    {
      id: 'competition',
      title: 'المنافسة',
      icon: <Compass className="w-4 h-4 text-teal-300" />,
      items: [
        {
          id: 'radar_tab',
          label: 'أسعار المنافسين',
          icon: <Compass className="w-4 h-4 text-teal-300" />,
          preloadTab: 'radar',
          isActive: activeTab === 'radar',
          action: () => {
            onSelectTab('radar');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/competitors');
          },
        },
        {
          id: 'analytics_tab',
          label: 'تحليل الأسعار',
          icon: <BarChart3 className="w-4 h-4 text-teal-300" />,
          preloadTab: 'analytics',
          isActive: activeTab === 'analytics',
          action: () => {
            onSelectTab('analytics');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/analytics');
          },
        },
        {
          id: 'watchlist_tab',
          label: 'قائمة المتابعة',
          icon: <Bookmark className="w-4 h-4 text-sky-300" />,
          preloadTab: 'watchlist',
          isActive: activeTab === 'watchlist',
          action: () => {
            onSelectTab('watchlist');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/watchlist');
          },
        },
      ],
    },
    {
      id: 'connections',
      title: 'الربط',
      icon: <Globe className="w-4 h-4 text-sky-300" />,
      items: [
        {
          id: 'platforms_guide_tab',
          label: 'ربط المنصات',
          icon: <Link2 className="w-4 h-4 text-sky-300" />,
          preloadTab: 'platforms_guide',
          isActive: activeTab === 'platforms_guide',
          action: () => {
            onSelectTab('platforms_guide');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/connections');
          },
        },
        {
          id: 'amazon_txt_import_action',
          label: 'استورد ملف أمازون (TXT)',
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-300" />,
          action: () => {
            onOpenAmazonImport?.();
          },
        },
        {
          id: 'gmail_sync_tab',
          label: 'سحب من الجيميل',
          icon: <Mail className="w-4 h-4 text-amber-300" />,
          preloadTab: 'traders_sync',
          isActive: activeTab === 'traders_sync',
          action: () => {
            onSelectTab('traders_sync');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/gmail-sync');
          },
        },
      ],
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      icon: <Settings className="w-4 h-4 text-slate-300" />,
      items: [
        {
          id: 'settings_tab',
          label: 'إعدادات الحساب',
          icon: <Settings className="w-4 h-4 text-sky-300" />,
          preloadTab: 'account_settings',
          isActive: activeTab === 'account_settings',
          action: () => {
            onSelectTab('account_settings');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/settings');
          },
        },
        ...(isOwner
          ? [
              {
                id: 'super_admin',
                label: 'لوحة Super Admin',
                icon: <Crown className="w-4 h-4 text-amber-300" />,
                badge: 'مالك',
                action: () => onOpenOwnerDashboard(),
              },
            ]
          : []),
        {
          id: 'sidebar_theme_mode',
          label: resolvedColorMode === 'dark' ? 'الوضع النهاري' : 'وضع ليلي',
          icon:
            resolvedColorMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-300" />
            ),
          action: () => {
            toggleColorMode();
            onShowToast?.(
              resolvedColorMode === 'dark'
                ? 'تم التبديل إلى الوضع النهاري'
                : 'تم التبديل إلى الوضع الليلي'
            );
          },
        },
        {
          id: 'sidebar_notifications',
          label: 'التنبيهات',
          icon: <Bell className="w-4 h-4 text-amber-300" />,
          badge: unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : undefined,
          action: () => {
            onOpenNotifications?.();
          },
        },
      ],
    },
    ...(!isInstalled
      ? [
          {
            id: 'app',
            title: 'التطبيق',
            icon: <Smartphone className="w-4 h-4 text-indigo-300" />,
            items: [
              {
                id: 'sidebar_install_app',
                label: 'تثبيت التطبيق',
                icon: <Smartphone className="w-4 h-4 text-indigo-300" />,
                action: handleInstallAppClick,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[110] lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <FounderModeWrapper elementId="app_sidebar" position="bottom-left">
        <aside
          data-testid="app-sidebar"
          className={`fixed top-0 bottom-0 right-0 z-[120] bg-slate-950 text-white shadow-2xl flex flex-col border-l border-slate-800 transition-all duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'w-[72px]' : 'w-[264px]'}`}
          dir="rtl"
        >
          {/* Sidebar Header */}
          <div className="h-12 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                <img
                  src="/pwa-512x512.png"
                  alt="RADAR"
                  className="w-full h-full object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="truncate min-w-0">
                  <h2 className="text-sm font-black text-white tracking-wide truncate" dir="ltr">
                    RADAR
                  </h2>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
              >
                <Menu className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="إغلاق القائمة"
              >
                <X className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Scrollable Navigation Categories */}
          <nav
            aria-label="القائمة الجانبية الرئيسية"
            className="flex-1 overflow-y-auto p-2 space-y-2 w-full"
          >
            {categories.map((category) => {
              const isCategoryOpen = openCategories[category.id] ?? true;

              return (
                <div
                  key={category.id}
                  className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-2.5 py-2 bg-slate-900 text-white font-black text-xs flex items-center justify-between border-b border-slate-800 transition-colors cursor-pointer text-right hover:bg-slate-800/80"
                    title={isCollapsed ? category.title : undefined}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0">{category.icon}</span>
                      {!isCollapsed && <span className="truncate">{category.title}</span>}
                    </span>
                    {!isCollapsed && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isCategoryOpen ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {(isCategoryOpen || isCollapsed) && (
                    <div className="p-1 space-y-0.5">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleItemClick(item.action)}
                          onMouseEnter={() => {
                            if (item.preloadTab) onPrefetchTab?.(item.preloadTab);
                          }}
                          onTouchStart={() => {
                            if (item.preloadTab) onPrefetchTab?.(item.preloadTab);
                          }}
                          onFocus={() => {
                            if (item.preloadTab) onPrefetchTab?.(item.preloadTab);
                          }}
                          title={isCollapsed ? item.label : undefined}
                          className={`w-full min-h-[38px] text-right px-2.5 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap ${
                            item.isActive
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className={`shrink-0 ${
                                item.isActive ? 'text-slate-950' : 'text-amber-300'
                              }`}
                            >
                              {item.icon}
                            </span>
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </span>
                          {!isCollapsed && item.badge && (
                            <span
                              className={`shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                item.isActive
                                  ? 'bg-slate-950 text-amber-400'
                                  : 'bg-slate-950 text-amber-300 border border-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          {!isCollapsed && (
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-xs text-white shrink-0">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>التجربة المجانية:</span>
                </span>
                <span className="text-white font-black bg-emerald-950 border border-emerald-700 px-2 py-0.5 rounded text-[10px] font-mono">
                  {trialDaysRemaining} أيام
                </span>
              </div>
            </div>
          )}
        </aside>
      </FounderModeWrapper>

      {/* Clean PWA Install Instructions Modal (only triggered from Sidebar "تثبيت التطبيق") */}
      {showInstallGuideModal && (
        <div
          className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 text-right"
          onClick={() => setShowInstallGuideModal(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">تثبيت تطبيق RADAR</h3>
                  <p className="text-[11px] text-slate-400">
                    ثبّت التطبيق للعمل بشكل مستقل وسريع على جهازك
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallGuideModal(false)}
                aria-label="إغلاق"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              {isIOS ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-bold">1. اضغط على أيقونة المشاركة (Share) أسفل متصفح Safari.</p>
                  <p className="font-bold">2. اختر &quot;إضافة إلى الصفحة الرئيسية&quot; (Add to Home Screen).</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-bold">1. افتح قائمة المتصفح (⋮) في Chrome أو Edge.</p>
                  <p className="font-bold">2. اختر &quot;تثبيت التطبيق&quot; (Install App) أو اضغط أيقونة التثبيت بشريط العنوان.</p>
                </div>
              )}

              {isAndroid && (
                <button
                  type="button"
                  onClick={() => {
                    downloadApkDirectly();
                    setShowInstallGuideModal(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل نسخة الأندرويد (APK)</span>
                </button>
              )}

              {isInIframe && (
                <button
                  type="button"
                  onClick={openInNewWindow}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح في نافذة مستقلة لتفعيل التثبيت الفوري</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowInstallGuideModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
