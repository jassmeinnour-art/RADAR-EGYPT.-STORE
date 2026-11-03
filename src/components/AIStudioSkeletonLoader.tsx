import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, Search, Cpu, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface AIStudioSkeletonLoaderProps {
  type?: 'processing_image' | 'analyzing_product';
  imagePreview?: string | null;
  message?: string;
}

const ANALYSIS_STEPS = [
  'مسح ملامح الصورة وعزل حواف المنتج بدقة...',
  'التعرف على فئة المنتج والمواصفات الفنية...',
  'مطابقة المنتج مع قواعد بيانات أسواق مصر (Amazon, Noon, Jumia)...',
  'توليد الكلمات المفتاحية وأوصاف السيو (SEO) الذكية...',
  'حساب السعر التنافسي الموصى به واقتراح هامش الربح...'
];

export const AIStudioSkeletonLoader: React.FC<AIStudioSkeletonLoaderProps> = ({
  type = 'analyzing_product',
  imagePreview,
  message
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  if (type === 'processing_image') {
    return (
      <div 
        className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-4"
        dir="rtl"
      >
        {/* Glowing Radar Pulse in Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-amber-500/5 animate-pulse pointer-events-none" />

        {/* Shimmering Scanline */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scanline" />

        <div className="relative">
          {imagePreview ? (
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-900">
              <img src={imagePreview} alt="Processing" className="w-full h-full object-contain opacity-50 blur-[1px]" />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center animate-pulse">
              <Wand2 className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>
          )}
          <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-md">
            <Cpu className="w-4 h-4 animate-spin" />
          </span>
        </div>

        <div className="space-y-1.5 z-10 max-w-sm">
          <h4 className="text-sm font-black text-white flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{message || 'جاري معالجة الصورة بالذكاء الاصطناعي...'}</span>
          </h4>
          <p className="text-xs text-amber-300/80 font-medium">
            تطبيق خوارزميات الاستوديو الذكي، عزل الشوائب، وتوحيد الإضاءة
          </p>
        </div>

        {/* Animated Skeleton Bars */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full w-2/3 animate-pulse" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
            <span>دقة المعالجة: فائقة HD</span>
            <span className="text-amber-400">جاري الحفظ...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 bg-slate-900/90 border border-amber-500/30 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden" 
      dir="rtl"
    >
      {/* Background Animated Gradient */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>جاري التحليل الذكي للكتالوج والأسعار</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                AI Pipeline
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              يتم استخراج كامل المواصفات وربطها برادار الأسعار المصري مباشرة
            </p>
          </div>
        </div>

        {/* Live Step Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300">
          <Search className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{ANALYSIS_STEPS[currentStepIndex]}</span>
        </div>
      </div>

      {/* Skeleton Content Grid: Shows Layout Preview While AI Works */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Image Box Skeleton */}
        <div className="md:col-span-4 space-y-3">
          <div className="relative aspect-square rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group shadow-xl">
            {imagePreview ? (
              <img src={imagePreview} alt="Product" className="w-full h-full object-contain opacity-60" />
            ) : (
              <ImageIcon className="w-12 h-12 text-slate-700 animate-pulse" />
            )}
            
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer" />

            <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span>جاري ضبط أبعاد المنصات 1:1</span>
            </div>
          </div>

          <div className="h-3 bg-slate-800 rounded-full w-3/4 mx-auto animate-pulse" />
        </div>

        {/* Right: Metadata Form Skeletons */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Skeleton Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-3 bg-slate-800 rounded-md w-1/3 animate-pulse" />
              <div className="h-10 bg-slate-950 border border-slate-800 rounded-xl animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/60 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-800 rounded-md w-1/3 animate-pulse" />
              <div className="h-10 bg-slate-950 border border-slate-800 rounded-xl animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/60 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* 4 KPI Metric Skeletons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="h-2.5 bg-slate-800 rounded-md w-2/3 animate-pulse" />
                <div className="h-6 bg-slate-800/80 rounded-md w-1/2 animate-pulse" />
                <div className="h-2 bg-slate-800/50 rounded-md w-3/4 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/40 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>

          {/* Skeleton Bullets / Description Lines */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-amber-500/30 animate-pulse" />
              <div className="h-3 bg-slate-800 rounded w-1/4 animate-pulse" />
            </div>
            <div className="h-3 bg-slate-800 rounded-full w-full animate-pulse" />
            <div className="h-3 bg-slate-800 rounded-full w-5/6 animate-pulse" />
            <div className="h-3 bg-slate-800 rounded-full w-4/6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Progress Steps Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>مرحلة {currentStepIndex + 1} من {ANALYSIS_STEPS.length} مكتملة</span>
        </div>
        <span className="font-mono text-amber-400 font-bold">
          {Math.round(((currentStepIndex + 1) / ANALYSIS_STEPS.length) * 100)}%
        </span>
      </div>

      {/* Keyframe Styling */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scanline {
          animation: scanline 2.5s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 1.8s infinite;
        }
      `}</style>
    </div>
  );
};
