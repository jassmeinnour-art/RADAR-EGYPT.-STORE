import React, { useState } from 'react';
import { 
  TrendingDown, 
  Truck, 
  Layers, 
  Sparkles, 
  Smartphone, 
  Menu, 
  X, 
  Building2, 
  Package, 
  Calculator, 
  Archive, 
  FileSpreadsheet, 
  BarChart3,
  Bell,
  Camera,
  Heart,
  Calendar,
  ShieldCheck,
  Key,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface MobileBottomDockProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAndroidModal: () => void;
  onOpenScanner?: () => void;
  unresolvedErrorsCount?: number;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  activeTab,
  setActiveTab,
  onOpenAndroidModal,
  onOpenScanner,
  unresolvedErrorsCount = 0,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainButtons = [
    {
      id: 'radar',
      label: 'الرادار',
      icon: TrendingDown,
      badge: null,
    },
    {
      id: 'order_scheduling',
      label: 'البوالص',
      icon: Truck,
      badge: null,
    },
    {
      id: 'remote_merchants',
      label: 'التجار 👥',
      icon: Building2,
      isSpecial: true,
      badge: 'Hub',
      onClick: () => {
        setActiveTab('remote_merchants');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'credentials',
      label: 'المنصات',
      icon: Layers,
      badge: null,
    },
    {
      id: 'more',
      label: 'المزيد',
      icon: Menu,
      badge: unresolvedErrorsCount > 0 ? '!' : null,
      onClick: () => setIsMoreMenuOpen(!isMoreMenuOpen),
    }
  ];

  const moreMenuItems = [
    { id: 'supplier_offers', label: 'عروض الموردين (جملة يومية)', icon: Building2 },
    { id: 'direct_competitors', label: 'المنافسون المباشرون (Buy Box)', icon: TrendingDown },
    { id: 'smart_market_analytics', label: 'تحليلات السوق الذكية (30 يوم)', icon: BarChart3 },
    { id: 'order_fulfillment', label: 'تتبع أوامر الشحن (Fulfillment)', icon: Truck },
    { id: 'inventory', label: 'تتبع المخزون والكميات', icon: Package },
    { id: 'wholesale', label: 'أسواق ومراكز خامات مصر', icon: Building2 },
    { id: 'sales_dashboard', label: 'لوحة أداء المبيعات', icon: BarChart3 },
    { id: 'platform_commissions', label: 'حاسبة عمولات المنصات', icon: Calculator },
    { id: 'seasonal_forecast', label: 'توقع الطلب والذروة', icon: Calendar },
    { id: 'pricing_guardrails', label: 'حدود حماية التسعير', icon: ShieldCheck },
    { id: 'image_studio', label: 'استوديو تصوير المنتجات', icon: Camera },
    { id: 'price_alerts', label: 'تنبيهات هبوط الأسعار', icon: Bell },
    { id: 'wishlist', label: 'قائمة أمنيات التاجر', icon: Heart },
    { id: 'archived_products', label: 'أرشيف المنتجات', icon: Archive },
    { id: 'user_logs', label: 'سجل نشاط الحساب', icon: FileText },
    ...(unresolvedErrorsCount > 0 ? [
      { id: 'admin_error_logs', label: `سجل أعطال API (${unresolvedErrorsCount})`, icon: ShieldAlert, isAlert: true }
    ] : [])
  ];

  return (
    <>
      {/* Expanded "More" Drawer for Mobile */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm sm:hidden flex flex-col justify-end animate-fadeIn"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 pb-24 shadow-2xl max-h-[75vh] overflow-y-auto space-y-3"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-white font-['Alexandria']">
                جميع أقسام وأدوات رادار التاجر 🧭
              </span>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {moreMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-3 rounded-2xl text-right flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer border ${
                      isActive 
                        ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300' 
                        : (item as any).isAlert
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Action Button: Multi-Merchant Agency Hub */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setActiveTab('remote_merchants');
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-[#08090D] text-xs font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Building2 className="w-4 h-4" />
                <span>لوحة المسوق وإدارة التجار المتعددين 👑</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Bottom Dock on Mobile */}
      <nav 
        id="mobile-native-bottom-dock" 
        aria-label="شريط التنقل السريع للهاتف والأندرويد"
        className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl pb-[env(safe-area-inset-bottom,8px)]"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1.5 max-w-md mx-auto">
          {mainButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeTab === btn.id;

            if (btn.isSpecial) {
              return (
                <button
                  key={btn.id}
                  type="button"
                  id="btn-mobile-bottom-dock-android"
                  onClick={btn.onClick}
                  className="flex flex-col items-center justify-center h-full relative cursor-pointer active:scale-90 transition-transform group"
                  title="تطبيق أندرويد و Google Play"
                  aria-label="تطبيق أندرويد و Google Play"
                >
                  <div className="relative -mt-4 w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/70 border-2 border-slate-900 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 mt-1">
                    {btn.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  if (btn.onClick) {
                    btn.onClick();
                  } else {
                    setActiveTab(btn.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`flex flex-col items-center justify-center h-full relative cursor-pointer active:scale-95 transition-all ${
                  isActive 
                    ? 'text-emerald-400 font-black' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={btn.label}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-500/20' : 'bg-transparent'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">
                  {btn.label}
                </span>

                {btn.badge && (
                  <span className="absolute top-1 right-3 text-[9px] px-1 rounded-full bg-rose-500 text-white font-bold">
                    {btn.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
