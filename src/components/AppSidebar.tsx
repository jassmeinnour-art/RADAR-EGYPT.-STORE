import React, { useState } from 'react';
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
  Package
} from 'lucide-react';
import { WorkspaceTab } from '../App';
import { useVisualCustomizer } from '../context/VisualCustomizerContext';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    dashboard: true,
    merchants: true,
    logistics: true,
    ai_help: true,
    settings: true
  });

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleItemClick = (action: () => void) => {
    action();
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Distinct section color accents and styling as requested
  const categories: NavCategory[] = [
    {
      id: 'merchants',
      title: '🛒 منظومة التجار والمنتجات',
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
          },
          badge: 'Unified Directory 🏢'
        },
        {
          id: 'merchants_tab',
          label: 'إدارة المنتجات 📦',
          icon: <Package className="w-4 h-4 text-sky-300" />,
          isActive: activeTab === 'products' || activeTab === 'merchants',
          action: () => {
            onSelectTab('products');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/products');
          }
        },
        {
          id: 'reports_tab',
          label: 'التقارير المالية والتريندات 📊',
          icon: <TrendingUp className="w-4 h-4 text-emerald-300" />,
          isActive: activeTab === 'reports' || activeTab === 'trending',
          action: () => onSelectTab('reports')
        }
      ]
    },
    {
      id: 'logistics',
      title: '📦 المخزون والعمليات',
      icon: <Truck className="w-5 h-5 text-purple-300" />,
      headerBg: 'bg-gradient-to-r from-purple-950 via-slate-900 to-pink-950',
      borderColor: 'border-purple-500/40',
      items: [
        {
          id: 'inventory_tab',
          label: 'إدارة وتزامن المخزون 📊',
          icon: <Layers className="w-4 h-4 text-emerald-300" />,
          isActive: activeTab === 'inventory',
          action: () => {
            onSelectTab('inventory');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/inventory');
          }
        },
        {
          id: 'shipping_tab',
          label: 'الفواتير وبوالص الشحن 🧾',
          icon: <Truck className="w-4 h-4 text-purple-200" />,
          isActive: activeTab === 'shipping',
          action: () => onSelectTab('shipping')
        },
        {
          id: 'split_invoices_tab',
          label: 'مقسم البوالص الذكي ✂️',
          icon: <Scissors className="w-4 h-4 text-amber-300" />,
          isActive: activeTab === 'split_invoices',
          action: () => onSelectTab('split_invoices')
        },
        {
          id: 'radar_tab',
          label: 'أسعار المنافسين والرادار 💰',
          icon: <Compass className="w-4 h-4 text-teal-300" />,
          isActive: activeTab === 'radar',
          action: () => onSelectTab('radar')
        }
      ]
    },
    {
      id: 'ai_help',
      title: '🤖 الذكاء الاصطناعي والدعم الفني',
      icon: <Sparkles className="w-5 h-5 text-sky-300" />,
      headerBg: 'bg-gradient-to-r from-sky-950 via-slate-900 to-blue-950',
      borderColor: 'border-sky-500/40',
      items: [
        {
          id: 'ai_studio',
          label: 'أستوديو الذكاء الاصطناعي',
          icon: <Sparkles className="w-4 h-4 text-cyan-300" />,
          isActive: activeTab === 'ai_studio',
          action: () => onSelectTab('ai_studio')
        },
        {
          id: 'help_tab',
          label: 'الدعم والمساعدة',
          icon: <HelpCircle className="w-4 h-4 text-sky-200" />,
          isActive: activeTab === 'help',
          action: () => onSelectTab('help')
        },
        {
          id: 'onboarding_sim',
          label: 'محاكاة وإرشادات التطبيق',
          icon: <BookOpen className="w-4 h-4 text-blue-200" />,
          action: () => onOpenOnboarding()
        }
      ]
    },
    {
      id: 'settings',
      title: '⚙️ الإعدادات والاشتراكات والمالك',
      icon: <Settings className="w-5 h-5 text-slate-300" />,
      headerBg: 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900',
      borderColor: 'border-slate-700/60',
      items: [
        ...(isOwner
          ? [
              {
                id: 'super_admin',
                label: 'لوحة Super Admin المالك',
                icon: <Crown className="w-4 h-4 text-amber-300" />,
                badge: 'مالك 👑',
                action: () => onOpenOwnerDashboard()
              }
            ]
          : []),
        {
          id: 'subscription_settings',
          label: 'إعدادات الحساب ومدة التجربة',
          icon: <Shield className="w-4 h-4 text-emerald-300" />,
          badge: `${trialDaysRemaining} أيام متبقية`,
          action: () => onOpenSubscriptionModal()
        }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed top-0 bottom-0 right-0 z-50 w-80 max-w-[85vw] bg-slate-950 text-white shadow-2xl flex flex-col border-l border-slate-800 transition-transform duration-300 ease-in-out"
        dir="rtl"
      >
        {/* Sidebar Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg font-black text-lg">
              🎯
            </div>
            <div>
              <h2 className="font-black text-base text-white tracking-wide">رادار التاجر في مصر</h2>
              <p className="text-[11px] text-slate-300 font-bold">RADAR EGYPT v54 Pro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>



        {/* Scrollable Navigation Categories with distinct section coloring */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
          {categories.map((category) => {
            const isCategoryOpen = openCategories[category.id] ?? true;

            return (
              <div
                key={category.id}
                className={`rounded-2xl border ${category.borderColor} overflow-hidden shadow-md`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full px-3.5 py-3 ${category.headerBg} text-white font-black text-xs sm:text-sm flex items-center justify-between border-b ${category.borderColor} transition-colors cursor-pointer text-right`}
                >
                  <span className="flex items-center gap-2.5 text-white font-black">
                    {category.icon}
                    <span>{category.title}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-white transition-transform duration-200 ${
                      isCategoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Category Items List */}
                {isCategoryOpen && (
                  <div className="p-1.5 space-y-1 bg-slate-900/90">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.action)}
                        className={`w-full text-right px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                          item.isActive
                            ? 'bg-emerald-700 text-white font-black shadow-lg border border-emerald-500/50'
                            : 'text-white hover:bg-slate-800/90'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="shrink-0">{item.icon}</span>
                          <span className="truncate text-white font-black">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`shrink-0 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              item.isActive
                                ? 'bg-white text-emerald-950'
                                : 'bg-slate-950 text-white border border-slate-700'
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

          {/* Relocated Buttons to Sidebar Section */}
          {settings.buttonsList.some(b => b.visible && b.location === 'sidebar') && (
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-3 space-y-2 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-amber-500/20 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>أزرار منقولة للوحة الجانبية:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({settings.buttonsList.filter(b => b.visible && b.location === 'sidebar').length})
                </span>
              </div>
              <div className="space-y-1.5">
                {settings.buttonsList
                  .filter(b => b.visible && b.location === 'sidebar')
                  .sort((a, b) => a.order - b.order)
                  .map(btn => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => {
                        if (btn.id === 'btn_filter_panel' || btn.id === 'btn_select_merchant') {
                          handleItemClick(() => onSelectTab('merchants'));
                        } else if (btn.id.startsWith('btn_kpi_')) {
                          handleItemClick(() => onSelectTab('merchants'));
                        } else {
                          handleItemClick(() => onSelectTab('merchants'));
                        }
                      }}
                      style={{
                        backgroundColor: btn.customColor || 'rgba(30, 41, 59, 0.9)',
                        color: btn.customTextColor || '#ffffff',
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-slate-700 hover:border-amber-500/50 text-xs font-bold transition flex items-center justify-between shadow-xs cursor-pointer text-right"
                    >
                      <span>{btn.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 text-amber-300 font-mono">#{btn.order}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Customizer Launcher Button in Sidebar */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleItemClick(toggleCustomizer)}
              className="w-full py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>🎨 تخصيص المظهر وتنسيق الأزرار</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-white shrink-0 space-y-2">
          <div className="flex items-center justify-between text-white font-bold">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>مدة التجربة المجانية:</span>
            </span>
            <span className="text-white font-black bg-emerald-950 border border-emerald-700 px-2.5 py-0.5 rounded-md font-mono">
              {trialDaysRemaining} أيام متبقية 🎁
            </span>
          </div>

          <button
            onClick={() => handleItemClick(onOpenSubscriptionModal)}
            className="w-full mt-1 py-2.5 px-3 bg-indigo-700 hover:bg-indigo-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 border border-indigo-500/40 shadow-md cursor-pointer transition"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>ترقية باقة التاجر والاستمرار 🚀</span>
          </button>

          {onForceRefresh && (
            <button
              onClick={() => handleItemClick(onForceRefresh)}
              className="w-full py-2 px-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-500/50 shadow-md cursor-pointer transition"
            >
              <RefreshCw className="w-4 h-4 text-white animate-spin-slow" />
              <span>تحديث التطبيق والمزايا 🔄</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
