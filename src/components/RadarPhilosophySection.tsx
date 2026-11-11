import React from 'react';
import { 
  Zap, 
  Bell, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';

interface RadarPhilosophySectionProps {
  onOpenRadar?: () => void;
  onShowToast?: (message: string) => void;
}

export const RadarPhilosophySection: React.FC<RadarPhilosophySectionProps> = ({
  onOpenRadar,
  onShowToast
}) => {
  const handleSimulateMersadOpportunity = () => {
    if (onShowToast) {
      onShowToast('⚡ مرصاد الذكي: تم رصد فرصة جديدة! (منتج طاولة مكتب خشبية قارب على النفاد ومطلوب في سلة متروكة)');
    }
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
    <div className="w-full max-w-4xl mx-auto space-y-6 text-right" dir="rtl">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black bg-indigo-600 text-white px-3 py-1 rounded-full border border-indigo-400/40 shadow-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>محرك رصد الفرص (مرصاد)</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-700/40">
                  MERSAD ENGINE
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Alexandria']">
                كيف يعمل رادار التاجر الذكي؟
              </h3>
              <p className="text-slate-300 text-sm max-w-2xl">
                محرك رصد ذكي يحوّل أحداث متاجرك اليومية وسلوك المنافسين إلى فرص بيعية واضحة وأرباح عبر 4 مراحل حاسمة تعزز نمو أعمالك.
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black text-sm">
              استراتيجية النمو
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { num: '1', title: '👁️ يراقب', desc: 'مراقبة أحداث المتجر والسلال المتروكة وتغيرات المخزون وأسعار المنافسين لحظياً دون توقف.', color: 'sky' },
              { num: '2', title: '🔔 ينبه', desc: 'إرسال إشعارات وتنبيهات مجمعة في نافذة واضحة عند حدوث أي فرصة عاجلة تستحق الانتباه.', color: 'amber' },
              { num: '3', title: '🔍 يفلتر', desc: 'فحص ومطابقة القواعد الأربع وربط الحدث بالمنتج والعميل وتوضيح سبب الظهور بدقة تامة.', color: 'purple' },
              { num: '4', title: '⚡ ينفذ', desc: 'تقديم إجراء جاهز للتنفيذ فوراً (استرجاع سلة، تعديل أسعار) مع خيار الأتمتة الكاملة للعمليات.', color: 'emerald' },
            ].map((stage) => (
              <div key={stage.num} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-xl bg-${stage.color}-500/20 text-${stage.color}-400 flex items-center justify-center font-black text-sm shrink-0 border border-${stage.color}-500/30`}>
                    {stage.num}
                  </div>
                  <strong className="text-white font-black text-base">{stage.title}</strong>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pr-11">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800/80">
            {onOpenRadar && (
              <button
                onClick={onOpenRadar}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-xl hover:shadow-indigo-500/20 active:scale-95"
              >
                <Zap className="w-5 h-5 text-amber-300" />
                <span>فتح رادار الفرص الآن ⚡</span>
              </button>
            )}
            <button
              onClick={handleSimulateMersadOpportunity}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-indigo-500/40 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Bell className="w-5 h-5 text-sky-400" />
              <span>تجربة محاكاة (مرصاد) 🔔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
