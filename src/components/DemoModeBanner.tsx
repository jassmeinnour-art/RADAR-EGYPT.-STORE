import React, { useState } from 'react';
import { 
  Key, 
  Settings, 
  Sparkles, 
  ExternalLink, 
  Printer, 
  FileSpreadsheet, 
  Info, 
  X, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { exportFallbackCatalogCsv, exportFallbackManifestCsv } from '../data/fallbackDemoData';
import { BayyaaLogo } from './BayyaaLogo';

interface DemoModeBannerProps {
  isDemoMode: boolean;
  onOpenSettings: () => void;
  onOpenApiGuide?: () => void;
  onOpenShippingManifest?: () => void;
  onShowToast?: (msg: string) => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  isDemoMode,
  onOpenSettings,
  onOpenApiGuide,
  onOpenShippingManifest,
  onShowToast
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isDemoMode || isDismissed) {
    if (isDemoMode && isDismissed) {
      // Minimized pill button so the merchant can reopen anytime
      return (
        <div className="w-full flex justify-end px-3 sm:px-6 lg:px-8 pt-2">
          <button
            type="button"
            onClick={() => setIsDismissed(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 hover:bg-amber-400 text-[#000000] border-2 border-[#000000] rounded-lg text-xs font-black shadow-xs transition-all cursor-pointer"
            title="إظهار شريط وضع البيانات الافتراضية"
          >
            <Key className="w-3.5 h-3.5 text-[#000000]" />
            <span>وضع التجربة (Demo Mode)</span>
          </button>
        </div>
      );
    }
    return null;
  }

  const handleExportCatalog = () => {
    exportFallbackCatalogCsv();
    if (onShowToast) {
      onShowToast('تم تصدير كتالوج المنتجات وهوامش الأرباح بصيغة CSV بنجاح 📊');
    }
  };

  const handleExportManifest = () => {
    exportFallbackManifestCsv();
    if (onShowToast) {
      onShowToast('تم تصدير كشف بوالص الشحن المعتمدة بصيغة CSV بنجاح 🚚');
    }
  };

  return (
    <aside 
      id="top-demo-mode-notification-banner"
      aria-label="إشعار وضع البيانات الافتراضية"
      className="w-full bg-[#FFFBEB] border-b-3 border-[#000000] text-[#000000] px-3 sm:px-6 py-2.5 transition-all shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-right">
        
        {/* Left Side (RTL Right side): Notice Message */}
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B00] p-0.5 flex items-center justify-center shrink-0 border border-[#000000] mt-0.5 sm:mt-0 shadow-2xs overflow-hidden">
            <BayyaaLogo variant="icon" className="w-full h-full" imgClassName="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#000000] text-amber-300">
                وضع تجريبي نشط
              </span>
              <p className="text-xs sm:text-sm font-black text-[#000000]">
                وضع البيانات الافتراضية (Demo Mode) - يمكنك ربط توكين التاجر في أي وقت
              </p>
            </div>
            <p className="text-[11px] text-slate-800 font-bold mt-0.5 leading-snug">
              يعمل النظام حالياً بكتالوج محاكي للسوق المصري مع هوامش أرباح وبوالص شحن حقيقية جاهزة للطباعة والتصدير.
            </p>
          </div>
        </div>

        {/* Right Side (RTL Left side): Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          
          {/* Quick link button to Settings (Prompt Requirement 2) */}
          <button
            type="button"
            id="btn-demo-banner-open-settings"
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#000000] border-2 border-[#000000] font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-[3px_3px_0px_#000000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="الانتقال إلى إعدادات ربط توكين التاجر"
          >
            <Settings className="w-3.5 h-3.5 text-[#000000]" />
            <span>ربط توكين التاجر (Settings) ⚙️</span>
          </button>

          {/* Quick link to Grid API Guide */}
          {onOpenApiGuide && (
            <button
              type="button"
              id="btn-demo-banner-open-api-guide"
              onClick={onOpenApiGuide}
              className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-200 text-[#000000] border-2 border-[#000000] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="عرض دليل استخراج مفاتيح API للمنصات"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden lg:inline">دليل مفاتيح API</span>
            </button>
          )}

          {/* Quick button to open Shipping Manifest Preview */}
          {onOpenShippingManifest && (
            <button
              type="button"
              id="btn-demo-banner-open-manifest"
              onClick={onOpenShippingManifest}
              className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-200 text-[#000000] border-2 border-[#000000] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="عرض وطباعة كشف بوالص الشحن الفعلية"
            >
              <Printer className="w-3.5 h-3.5 text-[#000000]" />
              <span>كشف بوالص الشحن</span>
            </button>
          )}

          {/* Export Catalog CSV */}
          <button
            type="button"
            onClick={handleExportCatalog}
            className="p-1.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-200 text-[#000000] border-2 border-[#000000] font-bold text-xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="تصدير كتالوج المنتجات وهوامش الأرباح CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="w-7 h-7 rounded-lg text-slate-700 hover:text-black hover:bg-amber-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إخفاء مؤقت"
            title="تصغير الشريط"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </aside>
  );
};
