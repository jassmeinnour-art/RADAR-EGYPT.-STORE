import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Store,
  ChevronDown,
  ChevronLeft,
  X,
  Users,
  Building2,
  Zap,
  Globe,
  Truck,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  HelpCircle,
  BookOpen,
  Crown,
  Shield,
  Layers,
  Settings,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  Bell,
  RefreshCw,
  ArrowUpDown,
  Palette,
  Scissors,
  Package,
  Menu,
  Mail,
  Link2
} from 'lucide-react';
import { WorkspaceTab } from '../App';
import { useVisualCustomizer } from '../context/VisualCustomizerContext';

interface AppSidebarProps {
  isOpen: boolean; // For mobile drawer toggle
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenAllMerchantsHub: () => void;
  onOpenOwnerDashboard: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenOnboarding: () => void;
  onForceRefresh?: () => void;
  isOwner: boolean;
  trialDaysRemaining?: number;
}

interface NavCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  headerBg: string;
  borderColor: string;
  items: {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    isActive?: boolean;
    badge?: string;
  }[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  onOpenAllMerchantsHub,
  onOpenOwnerDashboard,
  onOpenSubscriptionModal,
  onOpenOnboarding,
  onForceRefresh,
  isOwner,
  trialDaysRemaining = 3
}) => {
  const { settings, toggleCustomizer } = useVisualCustomizer();

  // Fallback internal collapse state
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
      } catch (e) {
        console.warn('Failed to persist sidebar collapse state:', e);
      }
    }
  };

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    merchants: true,
    sales: true,
    competition: true,
    connections: true,
    settings: true,
    help: true
  });

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleItemClick = (action: () => void) => {
    action();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  // 6 Specified Categories
  const categories: NavCategory[] = [
    {
      id: 'home',
      title: '🏠 الرئيسية',
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      headerBg: 'bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950',
      borderColor: 'border-sky-500/40',
      items: [
        {
          id: 'home_tab',
          label: 'لوحة التحكم الرئيسية 🏠',
          icon: <Zap className="w-4 h-4 text-sky-400" />,
          isActive: activeTab === 'home',
          action: () => {
            onSelectTab('home');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
          }
        }
      ]
    },
    {
      id: 'merchants',
      title: '📦 التجار والمنتجات',
      icon: <Building2 className="w-5 h-5 text-amber-300" />,
      headerBg: 'bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950',
      borderColor: 'border-amber-500/40',
      items: [
        {
          id: 'traders_multi',
          label: 'دليل التجار الموحد 📚',
          icon: <Users className="w-4 h-4 text-amber-300" />,
          isActive: activeTab === 'traders',
          action: () => {
            onSelectTab('traders');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/traders');
          }
        },
        {
          id: 'merchants_tab',
          label: 'المنتجات 🛍️',
          icon: <Package className="w-4 h-4 text-sky-300" />,
          isActive: activeTab === 'products' || activeTab === 'merchants',
          action: () => {
            onSelectTab('products');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/products');
          }
        },
        {
          id: 'inventory_tab',
          label: 'المخزون 📦',
          icon: <Layers className="w-4 h-4 text-emerald-300" />,
          isActive: activeTab === 'inventory',
          action: () => {
            onSelectTab('inventory');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/inventory');
          }
        }
      ]
    },
    {
      id: 'sales',
      title: '💰 المبيعات والفواتير',
      icon: <Truck className="w-5 h-5 text-purple-300" />,
      headerBg: 'bg-gradient-to-r from-purple-950 via-slate-900 to-pink-950',
      borderColor: 'border-purple-500/40',
      items: [
        {
          id: 'shipping_tab',
          label: 'الفواتير 🧾',
          icon: <Truck className="w-4 h-4 text-purple-200" />,
          isActive: activeTab === 'shipping',
          action: () => {
            onSelectTab('shipping');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/invoices');
          }
        },
        {
          id: 'split_invoices_tab',
          label: 'مقسم البوالص ✂️',
          icon: <Scissors className="w-4 h-4 text-amber-300" />,
          isActive: activeTab === 'split_invoices',
          action: () => {
            onSelectTab('split_invoices');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/invoices/split');
          }
        },
        {
          id: 'reports_tab',
          label: 'التقارير 📊',
          icon: <BarChart3 className="w-4 h-4 text-emerald-300" />,
          isActive: activeTab === 'reports' || activeTab === 'trending',
          action: () => {
            onSelectTab('reports');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/reports');
          }
        }
      ]
    },
    {
      id: 'competition',
      title: '🔍 المنافسة والأسعار',
      icon: <Compass className="w-5 h-5 text-teal-300" />,
      headerBg: 'bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950',
      borderColor: 'border-teal-500/40',
      items: [
        {
          id: 'radar_tab',
          label: 'أسعار المنافسين 🏷️',
          icon: <Compass className="w-4 h-4 text-teal-300" />,
          isActive: activeTab === 'radar',
          action: () => {
            onSelectTab('radar');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/competitors');
          }
        },
        {
          id: 'analytics_tab',
          label: 'تحليل الأسعار 📈',
          icon: <BarChart3 className="w-4 h-4 text-teal-300" />,
          isActive: activeTab === 'analytics',
          action: () => {
            onSelectTab('analytics');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/analytics');
          }
        }
      ]
    },
    {
      id: 'connections',
      title: '🔗 الربط والمزامنة',
      icon: <Globe className="w-5 h-5 text-sky-300" />,
      headerBg: 'bg-gradient-to-r from-sky-950 via-slate-900 to-blue-950',
      borderColor: 'border-sky-500/40',
      items: [
        {
          id: 'platforms_guide_tab',
          label: 'ربط المنصات 🔗',
          icon: <Link2 className="w-4 h-4 text-sky-300" />,
          isActive: activeTab === 'platforms_guide',
          action: () => {
            onSelectTab('platforms_guide');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/connections');
          }
        },
        {
          id: 'gmail_sync_tab',
          label: 'سحب من الجيميل 📧',
          icon: <Mail className="w-4 h-4 text-amber-300" />,
          isActive: activeTab === 'traders_sync',
          action: () => {
            onSelectTab('traders_sync');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/gmail-sync');
          }
        }
      ]
    },
    {
      id: 'settings',
      title: '⚙️ الإعدادات',
      icon: <Settings className="w-5 h-5 text-slate-300" />,
      headerBg: 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900',
      borderColor: 'border-slate-700/60',
      items: [
        ...(isOwner
          ? [
              {
                id: 'super_admin',
                label: 'لوحة Super Admin 👑',
                icon: <Crown className="w-4 h-4 text-amber-300" />,
                badge: 'مالك',
                action: () => onOpenOwnerDashboard()
              }
            ]
          : []),
        {
          id: 'settings_tab',
          label: 'الإعدادات ⚙️',
          icon: <Settings className="w-4 h-4 text-slate-300" />,
          action: () => {
            onSelectTab('help');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/settings');
          }
        },
        {
          id: 'layout_settings_tab',
          label: 'التحكم في الشكل والتنسيق 🎨',
          icon: <Palette className="w-4 h-4 text-amber-400" />,
          isActive: activeTab === 'layout_settings',
          action: () => {
            onSelectTab('layout_settings');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/settings/layout');
          }
        },
        {
          id: 'customizer_action',
          label: 'تخصيص المظهر (سريع) ⚡',
          icon: <Sparkles className="w-4 h-4 text-pink-400" />,
          action: () => toggleCustomizer()
        }
      ]
    },
    {
      id: 'help',
      title: '🆘 المساعدة',
      icon: <HelpCircle className="w-5 h-5 text-blue-300" />,
      headerBg: 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950',
      borderColor: 'border-blue-500/40',
      items: [
        {
          id: 'help_page_tab',
          label: 'دليل الاستخدام 📖',
          icon: <BookOpen className="w-4 h-4 text-blue-300" />,
          isActive: activeTab === 'help',
          action: () => {
            onSelectTab('help');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/help');
          }
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[110] lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Persistent Desktop Sidebar & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-[120] bg-slate-950 text-white shadow-2xl flex flex-col border-l border-slate-800 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        style={{ 
          position: 'fixed',
          top: 0,
          height: '100vh',
          paddingTop: 0,
          zIndex: 120,
          width: isCollapsed ? 'var(--sidebar-collapsed-width, 70px)' : 'var(--sidebar-width, 280px)', 
          minWidth: isCollapsed ? 'var(--sidebar-collapsed-width, 70px)' : 'var(--sidebar-width, 280px)', 
          maxWidth: isCollapsed ? 'var(--sidebar-collapsed-width, 70px)' : 'var(--sidebar-width, 280px)' 
        }}
        dir="rtl"
      >
        {/* Sidebar Header */}
        <div 
          className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0" 
          style={{ width: '100%', overflow: 'hidden' }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div 
              style={{ width: 'var(--sidebar-logo-size, 36px)', height: 'var(--sidebar-logo-size, 36px)', minWidth: 'var(--sidebar-logo-size, 36px)', minHeight: 'var(--sidebar-logo-size, 36px)', maxWidth: 'var(--sidebar-logo-size, 36px)', maxHeight: 'var(--sidebar-logo-size, 36px)' }} 
              className="relative shrink-0 flex-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden"
            >
              <img
                src="/pwa-512x512.png"
                alt="RADAR"
                style={{ width: 'var(--sidebar-logo-size, 36px)', height: 'var(--sidebar-logo-size, 36px)', minWidth: 'var(--sidebar-logo-size, 36px)', minHeight: 'var(--sidebar-logo-size, 36px)', maxWidth: 'var(--sidebar-logo-size, 36px)', maxHeight: 'var(--sidebar-logo-size, 36px)', objectFit: 'contain' }}
                className="sidebar-logo shrink-0 rounded-xl"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fb = target.nextElementSibling as HTMLElement;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div 
                style={{ width: 'var(--sidebar-logo-size, 36px)', height: 'var(--sidebar-logo-size, 36px)', display: 'none' }} 
                className="rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-lg shrink-0"
              >
                <span style={{ fontSize: '20px', lineHeight: 1 }}>🎯</span>
              </div>
            </div>
            {!isCollapsed && (
              <div className="truncate min-w-0">
                <h2 style={{ fontSize: '18px', fontWeight: 900 }} className="text-white tracking-wide truncate">RADAR</h2>
                <p className="text-[10px] text-amber-300 font-bold truncate">RADAR EGYPT v54</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Collapse / Expand Toggle Button for Desktop */}
            <button
              onClick={handleToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              <Menu className="w-5 h-5 shrink-0" style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Close Button for Mobile Drawer */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="إغلاق القائمة"
            >
              <X className="w-5 h-5 shrink-0" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Categories */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2.5 w-full" style={{ width: '100%', overflowY: 'auto' }}>
          {categories.map((category) => {
            const isCategoryOpen = openCategories[category.id] ?? true;

            return (
              <div
                key={category.id}
                className={`rounded-xl border ${category.borderColor} overflow-hidden shadow-md max-w-[280px]`}
                style={{ maxWidth: '100%' }}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full px-2.5 py-2 ${category.headerBg} text-white font-black text-xs flex items-center justify-between border-b ${category.borderColor} transition-colors cursor-pointer text-right`}
                  title={isCollapsed ? category.title : undefined}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{category.icon}</span>
                    {!isCollapsed && <span className="truncate">{category.title}</span>}
                  </span>
                  {!isCollapsed && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white transition-transform duration-200 shrink-0 ${
                        isCategoryOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Category Items List */}
                {(isCategoryOpen || isCollapsed) && (
                  <div className="p-1 space-y-0.5 bg-slate-900/90">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.action)}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full text-right px-2.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
                          item.isActive
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`shrink-0 ${item.isActive ? 'text-slate-950' : 'text-amber-300'}`}>{item.icon}</span>
                          {!isCollapsed && <span className="truncate font-black">{item.label}</span>}
                        </div>
                        {!isCollapsed && item.badge && (
                          <span
                            className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                              item.isActive
                                ? 'bg-slate-950 text-amber-400'
                                : 'bg-slate-950 text-slate-300 border border-slate-700'
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
        </div>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div 
            className="p-2.5 bg-slate-950 border-t border-slate-800 text-xs text-white shrink-0 space-y-1 max-w-[280px]" 
            style={{ maxWidth: '280px', width: '100%' }}
          >
            <div className="flex items-center justify-between text-white font-bold">
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
    </>
  );
};
