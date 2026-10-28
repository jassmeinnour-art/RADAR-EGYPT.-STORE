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
  Bell
} from 'lucide-react';
import { WorkspaceTab } from '../App';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenAllMerchantsHub: () => void;
  onOpenOwnerDashboard: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenOnboarding: () => void;
  isOwner: boolean;
  trialDaysRemaining?: number;
}

interface NavCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
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
  isOwner,
  trialDaysRemaining = 3
}) => {
  // Track open state for collapsible categories (all open by default)
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
    // On small screens, close the sidebar when an item is selected
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const categories: NavCategory[] = [
    {
      id: 'dashboard',
      title: '📊 لوحة التحكم والمؤشرات',
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
      items: [
        {
          id: 'merchants_tab',
          label: 'لوحة التاجر والكتالوج',
          icon: <Store className="w-4 h-4 text-emerald-400" />,
          isActive: activeTab === 'merchants',
          action: () => onSelectTab('merchants')
        },
        {
          id: 'radar_tab',
          label: 'رادار الباي بوكس والأقسام',
          icon: <Compass className="w-4 h-4 text-cyan-400" />,
          isActive: activeTab === 'radar',
          action: () => onSelectTab('radar')
        },
        {
          id: 'watchlist_tab',
          label: 'قائمة المتابعة وتنبيهات الأسعار',
          icon: <Bell className="w-4 h-4 text-amber-400" />,
          isActive: activeTab === 'watchlist',
          action: () => onSelectTab('watchlist'),
          badge: 'Web Notif 🔔'
        },
        {
          id: 'reports_tab',
          label: 'التقارير المالية والتريندات',
          icon: <TrendingUp className="w-4 h-4 text-emerald-300" />,
          isActive: activeTab === 'reports' || activeTab === 'trending',
          action: () => onSelectTab('reports')
        }
      ]
    },
    {
      id: 'merchants',
      title: '🛒 إدارة المتاجر والمنتجات',
      icon: <Building2 className="w-5 h-5 text-blue-400" />,
      items: [
        {
          id: 'merchants_hub',
          label: 'شريط الأزرار الشامل وإضافة تاجر جديد',
          icon: <Users className="w-4 h-4 text-blue-300" />,
          badge: 'جديد ⚡',
          action: () => onOpenAllMerchantsHub()
        },
        {
          id: 'auto_pricing',
          label: 'محرك التسعير الآلي',
          icon: <Zap className="w-4 h-4 text-indigo-400" />,
          isActive: activeTab === 'auto_pricing',
          action: () => onSelectTab('auto_pricing')
        },
        {
          id: 'platforms_guide',
          label: 'ربط المنصات و Live API',
          icon: <Globe className="w-4 h-4 text-teal-400" />,
          isActive: activeTab === 'platforms_guide',
          action: () => onSelectTab('platforms_guide')
        }
      ]
    },
    {
      id: 'logistics',
      title: '📦 العمليات واللوجستيات',
      icon: <Truck className="w-5 h-5 text-purple-400" />,
      items: [
        {
          id: 'shipping_tab',
          label: 'بوالص الشحن وفصل الطلبات',
          icon: <Truck className="w-4 h-4 text-purple-300" />,
          isActive: activeTab === 'shipping',
          action: () => onSelectTab('shipping')
        },
        {
          id: 'price_comparison',
          label: 'فحص أسعار المنافسين',
          icon: <FileSpreadsheet className="w-4 h-4 text-pink-400" />,
          isActive: activeTab === 'price_comparison',
          action: () => onSelectTab('price_comparison')
        },
        {
          id: 'gap_csv',
          label: 'مقارنة الفجوات CSV وتصدير البيانات',
          icon: <Layers className="w-4 h-4 text-sky-400" />,
          isActive: false,
          action: () => onSelectTab('price_comparison')
        }
      ]
    },
    {
      id: 'ai_help',
      title: '🤖 الذكاء الاصطناعي والدعم',
      icon: <Sparkles className="w-5 h-5 text-amber-300" />,
      items: [
        {
          id: 'ai_studio',
          label: 'أستوديو الذكاء الاصطناعي',
          icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
          isActive: activeTab === 'ai_studio',
          action: () => onSelectTab('ai_studio')
        },
        {
          id: 'help_tab',
          label: 'الدعم والمساعدة',
          icon: <HelpCircle className="w-4 h-4 text-sky-300" />,
          isActive: activeTab === 'help',
          action: () => onSelectTab('help')
        },
        {
          id: 'onboarding_sim',
          label: 'محاكاة وإرشادات التطبيق',
          icon: <BookOpen className="w-4 h-4 text-emerald-300" />,
          action: () => onOpenOnboarding()
        }
      ]
    },
    {
      id: 'settings',
      title: '⚙️ الإعدادات والاشتراكات',
      icon: <Settings className="w-5 h-5 text-slate-300" />,
      items: [
        ...(isOwner
          ? [
              {
                id: 'super_admin',
                label: 'لوحة Super Admin المالك',
                icon: <Crown className="w-4 h-4 text-emerald-400" />,
                badge: 'مالك 👑',
                action: () => onOpenOwnerDashboard()
              }
            ]
          : []),
        {
          id: 'subscription_settings',
          label: 'إعدادات الحساب ومدة التجربة',
          icon: <Shield className="w-4 h-4 text-emerald-400" />,
          badge: `${trialDaysRemaining} أيام متبقية`,
          action: () => onOpenSubscriptionModal()
        }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-80 max-w-[85vw] bg-slate-900 text-white shadow-2xl flex flex-col border-l border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir="rtl"
      >
        {/* Sidebar Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 font-bold text-lg">
              🎯
            </div>
            <div>
              <h2 className="font-bold text-lg text-white tracking-wide">رادار التاجر</h2>
              <p className="text-xs text-slate-400">RADAR EGYPT v2.5</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Banner */}
        <div className="p-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/40 shrink-0">
          <button
            onClick={() => handleItemClick(onOpenAllMerchantsHub)}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md hover:shadow-emerald-600/30 transition-all flex items-center justify-between group text-sm"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white" />
              إدارة بيانات التجار وإضافة تاجر ➕
            </span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Scrollable Navigation Categories */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {categories.map((category) => {
            const isCategoryOpen = openCategories[category.id] ?? true;

            return (
              <div
                key={category.id}
                className="bg-slate-950/40 rounded-xl border border-slate-800/80 overflow-hidden shadow-sm"
              >
                {/* Category Accordion Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-3 py-2.5 bg-slate-900/90 hover:bg-slate-800/90 text-white font-bold text-sm flex items-center justify-between border-b border-slate-800/60 transition-colors text-right"
                >
                  <span className="flex items-center gap-2 text-slate-100 font-semibold">
                    {category.icon}
                    {category.title}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isCategoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Category Items List */}
                {isCategoryOpen && (
                  <div className="p-1.5 space-y-1">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.action)}
                        className={`w-full text-right px-3 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-between ${
                          item.isActive
                            ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40'
                            : 'text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="shrink-0">{item.icon}</span>
                          <span className="truncate text-white font-semibold">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              item.isActive
                                ? 'bg-white text-emerald-900'
                                : 'bg-slate-800 text-emerald-300 border border-emerald-500/30'
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
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              النسخة التجريبية:
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
              {trialDaysRemaining} أيام مجانية 🎁
            </span>
          </div>

          <button
            onClick={() => handleItemClick(onOpenSubscriptionModal)}
            className="w-full mt-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Crown className="w-3.5 h-3.5 text-emerald-400" />
            ترقية باقة التاجر الآن
          </button>
        </div>
      </aside>
    </>
  );
};
