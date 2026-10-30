import React, { useState } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink, 
  Eye, 
  Bell, 
  Sliders, 
  Zap, 
  Package, 
  ShoppingCart, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  Clock, 
  Users,
  Globe
} from 'lucide-react';
import officialBayyaaImage from '../assets/images/regenerated_image_1792996566255.jpg';
import { FloatingAnimatedLogosBackground } from './FloatingAnimatedLogosBackground';
import { motion } from 'framer-motion';

interface LoginRadarAndBayyaaGuideSectionProps {
  onStartDemo?: () => void;
  onSignUpMerchant?: () => void;
  onShowToast?: (message: string) => void;
}

export const LoginRadarAndBayyaaGuideSection: React.FC<LoginRadarAndBayyaaGuideSectionProps> = ({
  onStartDemo,
  onSignUpMerchant,
  onShowToast
}) => {
  const [simulatedAction, setSimulatedAction] = useState<string | null>(null);

  const handleSimulateSyncInventory = () => {
    setSimulatedAction('inventory');
    if (onShowToast) {
      onShowToast('📦 تم بنجاح سحب وتحديث منتجات المخزون للمنصات المشتركة لمتجر التاجر وتحديث العدادات فوراً!');
    }
    setTimeout(() => setSimulatedAction(null), 2500);
  };

  const handleSimulateSyncOrders = () => {
    setSimulatedAction('orders');
    if (onShowToast) {
      onShowToast('🛒 تم بنجاح سحب الطلبات الحالية وتوليد بوالص الشحن التلقائية لمتجر التاجر!');
    }
    setTimeout(() => setSimulatedAction(null), 2500);
  };

  const handleSimulateMersadAlert = () => {
    setSimulatedAction('alert');
    if (onShowToast) {
      onShowToast('⚡ مرصاد الذكي: تم رصد فرصة تسعير تنافسية وسلة متروكة لمنتج مكتبي وتم اقتراح الإجراء الفوري!');
    }
    setTimeout(() => setSimulatedAction(null), 2500);
  };

  return (
    <div className="w-full mb-8 space-y-6" dir="rtl">
      
      {/* 1. Strategic Header Banner for Marketing Managers */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-white"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500 text-white shadow-md flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>دليل مديري التسويق وإدارة المتاجر المتعددة</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                رادار التاجر الذكي (RADAR EGYPT) 🇪🇬
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Alexandria'] leading-snug">
              كيف يوفر رادار التاجر 80% من وقت وجهد مديري المتاجر والمسوقين؟
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              إذا كنت تدير مجموعة من المتاجر أو تعمل كمدير تسويق لوكالة تجارية، فلست بحاجة لفتح 7 لوحات تحكم مختلفة يومياً. يجمع لك رادار التاجر جميع حسابات التجار في واجهة مركزية واحدة تدير المخزون، تقتنص الـ Buy Box، وتنبهك بالسلال المتروكة فوراً.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-auto">
            {onStartDemo && (
              <button
                type="button"
                onClick={onStartDemo}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 border-2 border-white"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>دخول تجريبي فوري للرادار ⚡</span>
              </button>
            )}

            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-[11px] text-indigo-300 font-bold">
              ✓ إدارة مركزية لجميع منصات التجارة
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Floating Animated Logos Background (خلفية متحركة باللوجوهات الرسمية كعناصر بصرية وليست أزراراً) */}
      <FloatingAnimatedLogosBackground isFixedFullscreen={false} />

      {/* 3. Side-by-Side: Standalone Bayyaa Promotional Ad AND Mersad Radar Philosophy */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        
        {/* ================================================================ */}
        {/* CARD 1: بطاقة وإعلان منصة بياع الخارجية المنفصلة (Bayyaa Ad Card)   */}
        {/* ملاحظة: منصة بياع هي شريك تجاري تسويقي خارجي مستقل وليست محركاً برمجياً للربط */}
        {/* ================================================================ */}
        <div className="bg-[#0F2A4A] border-3 border-[#FF6B00] rounded-3xl p-6 sm:p-7 shadow-[0_12px_45px_rgba(15,42,74,0.65)] relative overflow-hidden flex flex-col justify-between space-y-5 text-right ring-4 ring-[#FF6B00]/25">
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#FF6B00]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            {/* Header: Official Logo + Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#FF6B00] p-1.5 shadow-2xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-white ring-2 ring-[#FF6B00]/30 hover:scale-105 transition-all">
                  <img
                    src={officialBayyaaImage}
                    alt="إعلان منصة بياع التجاري الرسمي"
                    className="w-full h-full object-contain select-none"
                    loading="eager"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00] text-white font-black text-xs tracking-wider uppercase border border-white/30 shadow-xs">
                      إعلان تجاري خارجي (Bayyaa Ad)
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-600/30">
                      شريك تسوق مستقل
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Alexandria']">
                    منصة بياع (BAYYAA)
                  </h3>
                  <div className="text-xs text-amber-200 font-bold tracking-wider font-mono">
                    EXTERNAL MARKETPLACE PARTNER
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              <strong>تنويه تسويقي:</strong> منصة بياع هي سوق إلكتروني تجاري خارجي مستقل لعرض وبيع منتجات التجار للمستهلكين مباشرة، وليست محركاً برمجياً لربط المنصات. تتيح لك بياع توسيع مبيعاتك عبر الإنترنت بكل سهولة.
            </p>

            {/* Bayyaa Key Advantages Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-100">
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">عمولة تنافسية وسحب سريع للأرباح</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">عرض وتوسيع منتجاتك للملايين</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">دعم الشحن السريع لباب العميل</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">حملات تسويقية وترويجية كبرى</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
            <span className="text-xs text-amber-200 font-bold">
              انضم لسوق بياع التجاري الآن
            </span>
            <button
              type="button"
              onClick={() => {
                if (onSignUpMerchant) onSignUpMerchant();
                if (onShowToast) onShowToast('🛒 انضم إلى منصة بياع وأدرج منتجاتك في السوق التجاري!');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-black text-xs shadow-lg shadow-[#FF6B00]/40 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-white"
            >
              <span>انضم الآن إلى منصة بياع 🛍️</span>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CARD 2: فلسفة رادار ومرصاد الذكي (راقب، ينبه، يفتر، يقترح)         */}
        {/* ================================================================ */}
        <div className="bg-slate-950/95 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-5 text-right">
          <div className="space-y-4">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs border border-indigo-500/40">
                    محرك رادار ومرصاد (MERSAD)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-600/30">
                    أتمتة المبيعات والأسعار
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Alexandria']">
                  كيف يعمل رادار التاجر الذكي؟
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              يحول النظام الأحداث المعقدة وحركات المنافسين إلى فرص ربح واضحة ومباشرة عبر 4 مراحل حتمية:
            </p>

            {/* 4 Steps Visual Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Step 1: يراقب */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1 hover:border-sky-500/50 transition">
                <div className="flex items-center gap-2 text-sky-400 font-black text-xs">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-xs font-mono">1</div>
                  <Eye className="w-3.5 h-3.5" />
                  <span>يراقب (Monitor)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  مراقبة أسعار المنافسين، السلال المتروكة، ومستويات المخزون على مدار الساعة دون توقف.
                </p>
              </div>

              {/* Step 2: ينبه */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1 hover:border-amber-500/50 transition">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs font-mono">2</div>
                  <Bell className="w-3.5 h-3.5" />
                  <span>ينبه (Alert)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  إرسال إشعارات فورية مجمعة عبر الواتساب والمتصفح عند وجود فرصة بيع أو خطر فقد الـ Buy Box.
                </p>
              </div>

              {/* Step 3: يفلتر */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1 hover:border-indigo-500/50 transition">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-xs">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-mono">3</div>
                  <Sliders className="w-3.5 h-3.5" />
                  <span>يفلتر (Filter & Rule)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  استبعاد الإشعارات الزائفة وتطبيق قواعد الهامش الأدنى (Floor Price) لحماية أرباح التاجر.
                </p>
              </div>

              {/* Step 4: يقترح / ينفذ */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1 hover:border-emerald-500/50 transition">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs font-mono">4</div>
                  <Zap className="w-3.5 h-3.5" />
                  <span>يقترح / ينفذ (Execute)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  اقتراح تعديل السعر أو رسائل استرجاع السلة المتروكة مع خيار التنفيذ التلقائي الفوري.
                </p>
              </div>

            </div>
          </div>

          {/* Real Interactive Action Buttons Showcase */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>أزرار التفاعل الفعلي لسحب المخزون والطلبات:</span>
              <span className="text-[10px] text-amber-300">جرب النقر التجريبي ⚡</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSimulateSyncInventory}
                className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm border ${
                  simulatedAction === 'inventory'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-sky-300 border-slate-700 hover:border-sky-500/50'
                }`}
                title="سحب منتجات المخزون للمنصات المشتركة"
              >
                <Package className="w-3.5 h-3.5" />
                <span>[ 📦 سحب منتجات المخزون ]</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateSyncOrders}
                className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm border ${
                  simulatedAction === 'orders'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700 hover:border-amber-500/50'
                }`}
                title="سحب الطلبات الحالية وبوالص الشحن"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>[ 🛒 سحب الطلبات الحالية ]</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateMersadAlert}
                className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm border ${
                  simulatedAction === 'alert'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-slate-700 hover:border-indigo-500/50'
                }`}
                title="اختبار تنبيه فرصة مرصاد الذكي"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>[ ⚡ تجربة تنبيه مرصاد ]</span>
              </button>
            </div>
          </div>
        </div>

      </motion.div>

    </div>
  );
};
