import React from 'react';
import { 
  ShoppingBag, 
  Zap, 
  ExternalLink, 
  Store, 
  Sparkles, 
  CheckCircle2, 
  Bell, 
  Sliders, 
  Eye, 
  TrendingUp, 
  Layers, 
  ShieldCheck,
  Building2,
  PackageCheck
} from 'lucide-react';
import headerBrandLogo from '../assets/images/regenerated_image_1793023955535.png';

interface BayyaaAndMersadOverviewSectionProps {
  onOpenMerchantsDirectory?: () => void;
  onOpenSubscription?: () => void;
  onOpenRadar?: () => void;
  onShowToast?: (message: string) => void;
  className?: string;
}

export const BayyaaAndMersadOverviewSection: React.FC<BayyaaAndMersadOverviewSectionProps> = ({
  onOpenMerchantsDirectory,
  onOpenSubscription,
  onOpenRadar,
  onShowToast,
  className = ''
}) => {
  const handleSimulateMersadOpportunity = () => {
    if (onShowToast) {
      onShowToast('⚡ مرصاد الذكي: تم رصد فرصة جديدة! (منتج طاولة مكتب خشبية قارب على النفاد ومطلوب في سلة متروكة)');
    }
    // Dispatch event to opportunity radar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('merchant_radar_new_opportunity', {
        detail: {
          title: 'تنبيه مخزون وشيك النفاد (مرصاد)',
          description: 'منتج عليه محاولات شراء مرتفعة وباقي قطعتان بالمخزن.',
          type: 'stock',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`} dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        
        {/* ============================================================== */}
        {/* بطاقة 1: منصة بياع الرسمية (BAYYAA EG)                         */}
        {/* ============================================================== */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-orange-950/40 to-slate-900 border-2 border-orange-500/40 p-5 sm:p-6 text-white shadow-xl flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            {/* Header: Logo, Badges, Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center shrink-0 border border-white/20 overflow-hidden">
                  <img
                    src={headerBrandLogo}
                    alt="منصة بياع - BAYYAA"
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = '/bayyaa-logo.jpg';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black bg-orange-600 text-white px-2.5 py-0.5 rounded-full border border-orange-400/40 shadow-xs">
                      إعلان تجاري خارجي (Bayyaa Ad)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-orange-300 bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-700/40">
                      BAYYAA EG
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Alexandria'] mt-1">
                    منصة بياع (BAYYAA)
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-black shrink-0 hidden sm:inline-block">
                شريك تسوق مستقل
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong>تنويه تسويقي:</strong> منصة بياع هي سوق إلكتروني تجاري خارجي مستقل لعرض وبيع منتجات التجار للمستهلكين مباشرة، وليست محركاً برمجياً لربط المنصات. تتيح لك بياع التوسع والبيع عبر الإنترنت بكل سهولة.
            </p>

            {/* Key Advantages Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-slate-100 font-bold">ربط وإدارة المتاجر المتعددة بضغطة زر</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-100 font-bold">سحب المخزون والطلبات الحالية لكل منصة</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-100 font-bold">تسعير تلقائي مشروط واقتناص الـ Buy Box</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-slate-100 font-bold">إصدار وفصل بوالص الشحن (بوسطة / أرامكس)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-800/80 relative z-10">
            {onOpenMerchantsDirectory && (
              <button
                type="button"
                onClick={onOpenMerchantsDirectory}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/20 active:scale-95 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>دليل التجار وإدارة المنصات 🏢</span>
              </button>
            )}

            {onOpenSubscription && (
              <button
                type="button"
                onClick={onOpenSubscription}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-orange-300 hover:text-white border border-orange-500/40 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                <span>الانضمام والاشتراك في بياع 🛍️</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* بطاقة 2: شرح رادار التاجر الذكي (فلسفة وأنظمة مرصاد)          */}
        {/* ============================================================== */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 p-5 sm:p-6 text-white shadow-xl flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            {/* Header: Title and Mersad Badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black bg-indigo-600 text-white px-2.5 py-0.5 rounded-full border border-indigo-400/40 shadow-xs flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>محرك رصد الفرص (مرصاد)</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-700/40">
                    MERSAD ENGINE
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Alexandria'] mt-1">
                  كيف يعمل رادار التاجر (مستوحى من مرصاد)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black shrink-0 hidden sm:inline-block">
                4 مراحل ذكية
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              محرك رصد ذكي يحوّل أحداث متاجرك اليومية وسلوك المنافسين إلى فرص بيعية واضحة وأرباح عبر 4 مراحل حاسمة:
            </p>

            {/* The 4 Stages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* مرحلة 1: يراقب */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-xs shrink-0">
                    1
                  </div>
                  <strong className="text-white font-black text-sm">👁️ يراقب</strong>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pr-8">
                  مراقبة أحداث المتجر والسلال المتروكة وتغيرات المخزون وأسعار المنافسين لحظياً دون توقف.
                </p>
              </div>

              {/* مرحلة 2: ينبه */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1 hover:border-amber-500/40 transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                    2
                  </div>
                  <strong className="text-white font-black text-sm">🔔 ينبه</strong>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pr-8">
                  إرسال إشعارات وتنبيهات مجمعة في نافذة واضحة عند حدوث أي فرصة عاجلة تستحق الانتباه.
                </p>
              </div>

              {/* مرحلة 3: يفتر */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1 hover:border-purple-500/40 transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xs shrink-0">
                    3
                  </div>
                  <strong className="text-white font-black text-sm">🔍 يفتر</strong>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pr-8">
                  فحص ومطابقة القواعد الأربع وربط الحدث بالمنتج والعميل وتوضيح سبب الظهور بدقة تامة.
                </p>
              </div>

              {/* مرحلة 4: يقترح / ينفذ */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1 hover:border-emerald-500/40 transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                    4
                  </div>
                  <strong className="text-white font-black text-sm">⚡ يقترح / ينفذ</strong>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pr-8">
                  تقديم إجراء جاهز للتنفيذ فوراً (استرجاع سلة، تعديل أسعار) مع خيار الأتمتة الكاملة.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-800/80 relative z-10">
            {onOpenRadar && (
              <button
                type="button"
                onClick={onOpenRadar}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>فتح رادار الباي بوكس والفرص ⚡</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSimulateMersadOpportunity}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-white border border-indigo-500/40 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              title="محاكاة فورية لإشعار فرصة جديدة عبر محرك مرصاد"
            >
              <Bell className="w-4 h-4 text-sky-400" />
              <span>تجربة رصد فرصة فورية (مرصاد) 🔔</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
