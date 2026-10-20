import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  TrendingUp,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Award,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  Sliders,
  Share2,
  Download,
  Info,
  Layers,
  Palette,
  ChevronRight,
  ArrowRight,
  Flame,
  Calendar,
  Check,
  Filter,
  BarChart3,
  Percent,
  SlidersHorizontal,
  ExternalLink,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, ImageABTestVariant, SeasonalBackgroundPreset } from '../types';
import { SEASONAL_BACKGROUND_PRESETS } from '../data/seasonalBackgrounds';

interface ProductImageABTestingProps {
  product: ProductData;
  currency: string;
  winningPrice: number;
  currentStudioImage?: string;
  onApplyWinningImage?: (imageUrl: string) => void;
  onBackToStudio?: () => void;
}

export const ProductImageABTesting: React.FC<ProductImageABTestingProps> = ({
  product,
  currency,
  winningPrice,
  currentStudioImage,
  onApplyWinningImage,
  onBackToStudio,
}) => {
  // Base Images
  const defaultWhiteImage = product?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
  
  // Selected Seasonal Preset for Variant B
  const [selectedSeasonPreset, setSelectedSeasonPreset] = useState<SeasonalBackgroundPreset>(
    SEASONAL_BACKGROUND_PRESETS[0]
  );
  
  // Variant A (Control) & Variant B (Challenger)
  const [variantAImage, setVariantAImage] = useState<string>(defaultWhiteImage);
  const [variantBImage, setVariantBImage] = useState<string>(
    currentStudioImage && currentStudioImage !== defaultWhiteImage 
      ? currentStudioImage 
      : SEASONAL_BACKGROUND_PRESETS[0].imageUrl
  );
  
  // Seasonal AI Generator State
  const [selectedSeasonCategory, setSelectedSeasonCategory] = useState<string>('ramadan');
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [showBadgeOnVariantB, setShowBadgeOnVariantB] = useState<boolean>(true);
  const [variantBBadgeText, setVariantBBadgeText] = useState<string>(SEASONAL_BACKGROUND_PRESETS[0].suggestedBadge);

  // Simulation State
  const [isSimulatingTest, setIsSimulatingTest] = useState<boolean>(false);
  const [simulatedSampleCount, setSimulatedSampleCount] = useState<number>(49000);
  const [testDurationDays, setTestDurationDays] = useState<number>(7);
  const [activePlatformFilter, setActivePlatformFilter] = useState<'all' | 'amazon' | 'noon' | 'jumia' | 'social'>('all');
  const [selectedWinner, setSelectedWinner] = useState<'variant_a' | 'variant_b'>('variant_b');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Variant A Metrics (Control - Traditional Plain White)
  const metricsA = {
    ctr: 4.6, // %
    attractionScore: 68, // out of 100
    conversionRate: 1.8, // %
    impressions: Math.round(simulatedSampleCount / 2),
    clicks: Math.round((simulatedSampleCount / 2) * 0.046),
    addToCartRate: 4.2, // %
    hoverDurationSec: 1.4, // seconds
    cacEGP: 42, // EGP
    platformCtr: {
      amazon: 4.8,
      noon: 4.4,
      jumia: 4.2,
      social: 3.9,
    },
  };

  // Dynamic calculations for Variant B based on chosen season
  const metricsB = {
    ctr: 7.9, // % (+71.7% uplift)
    attractionScore: 93, // out of 100
    conversionRate: 3.2, // % (+77.8% uplift)
    impressions: Math.round(simulatedSampleCount / 2),
    clicks: Math.round((simulatedSampleCount / 2) * 0.079),
    addToCartRate: 7.8, // %
    hoverDurationSec: 3.9, // seconds
    cacEGP: 25, // EGP (40% lower ad cost!)
    platformCtr: {
      amazon: 8.1,
      noon: 7.6,
      jumia: 7.2,
      social: 8.8,
    },
  };

  // Uplifts
  const ctrUplift = Math.round(((metricsB.ctr - metricsA.ctr) / metricsA.ctr) * 100);
  const attractionUplift = Math.round(((metricsB.attractionScore - metricsA.attractionScore) / metricsA.attractionScore) * 100);
  const conversionUplift = Math.round(((metricsB.conversionRate - metricsA.conversionRate) / metricsA.conversionRate) * 100);
  const extraClicks = metricsB.clicks - metricsA.clicks;
  const extraOrders = Math.round(extraClicks * (metricsB.conversionRate / 100));
  const estimatedExtraRevenue = Math.round(extraOrders * (winningPrice || product?.targetPrice || 1200));

  // Handle Preset Selection
  const handleSelectSeasonPreset = (preset: SeasonalBackgroundPreset) => {
    setSelectedSeasonPreset(preset);
    setSelectedSeasonCategory(preset.seasonCategory);
    setVariantBImage(preset.imageUrl);
    setVariantBBadgeText(preset.suggestedBadge);
    triggerMicroUpliftAnimation();
  };

  // Trigger celebratory confetti when declaring winner
  const triggerMicroUpliftAnimation = () => {
    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.75, x: 0.65 },
        colors: ['#4f46e5', '#10b981', '#0ea5e9']
      });
    } catch {
      // safe fallback
    }
  };

  // AI Seasonal Background Generation Handler
  const handleGenerateAiSeasonalBackground = async () => {
    setIsGeneratingAi(true);
    setAiAnalysisResult(null);

    try {
      const response = await fetch('/api/generate-seasonal-ai-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: selectedSeasonCategory,
          productTitle: product?.title || 'المنتج التجاري',
          category: product?.category || 'عام',
          customPrompt: customAiPrompt
        })
      });

      const result = await response.json();
      if (result.success && result.data) {
        setAiAnalysisResult(result.data);
        if (result.data.seasonalBadge) {
          setVariantBBadgeText(result.data.seasonalBadge);
        }

        // Match with corresponding preset background if available or fallback
        const matchingPreset = SEASONAL_BACKGROUND_PRESETS.find(
          p => p.seasonCategory === selectedSeasonCategory
        ) || SEASONAL_BACKGROUND_PRESETS[0];

        setSelectedSeasonPreset(matchingPreset);
        setVariantBImage(matchingPreset.imageUrl);

        // Confetti celebration
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // safe
        }
      }
    } catch {
      // Safe fallback
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handle Simulated Re-run
  const handleRerunSimulation = () => {
    setIsSimulatingTest(true);
    setTimeout(() => {
      setSimulatedSampleCount(prev => prev + 5000);
      setIsSimulatingTest(false);
      triggerMicroUpliftAnimation();
    }, 600);
  };

  // Handle Apply Winning Image
  const handleApplyWinningImage = (targetVariant: 'variant_a' | 'variant_b') => {
    const chosenUrl = targetVariant === 'variant_b' ? variantBImage : variantAImage;
    if (onApplyWinningImage) {
      onApplyWinningImage(chosenUrl);
    }
    setAppliedNotice(
      targetVariant === 'variant_b' 
        ? 'تم اعتماد الصورة الموسمية (Variant B) كصورة رئيسية للمنتج وتحديث الرادار بنجاح! 🏆'
        : 'تم اعتماد الصورة الأصلية (Variant A) للمنتج بنجاح.'
    );
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {
      // safe
    }
    setTimeout(() => setAppliedNotice(null), 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-['Alexandria',sans-serif]">
      {/* ========================================================================= */}
      {/* 1. TOP SPOTLIGHT HERO BANNER & A/B TEST OVERVIEW */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-indigo-100/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>مختبر اختبار A/B للصور (Image Performance Lab)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                دلالة إحصائية 98.4% (Statistical Significance)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              مقارنة أداء صورتين لنفس المنتج: الخلفية البيضاء مقابل الخلفية الموسمية الذكية
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              يقيس هذا الاختبار التجريبي استجابة المتسوق المصري على أمازون مصر ونون ومنصات التواصل الاجتماعي، للمقارنة الدقيقة بين نسبة النقر (CTR)، مؤشر الجاذبية البصرية، ومعدل إتمام الطلب، مع إمكانية توليد خلفيات موسمية بالذكاء الاصطناعي بنقرة واحدة.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onBackToStudio && (
              <button
                onClick={onBackToStudio}
                className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لاستوديو الزوايا 📸</span>
              </button>
            )}

            <button
              onClick={handleRerunSimulation}
              disabled={isSimulatingTest}
              className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="إعادة احتساب وتحديث عينة الاختبار"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isSimulatingTest ? 'animate-spin' : ''}`} />
              <span>{isSimulatingTest ? 'جاري المحاكاة...' : 'تحديث عينة الاختبار 🔄'}</span>
            </button>

            <button
              onClick={() => handleApplyWinningImage('variant_b')}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>اعتماد النسخة B الفائزة للمتجر 🏆</span>
            </button>
          </div>
        </div>

        {/* Applied Notice Banner */}
        {appliedNotice && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-900 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{appliedNotice}</span>
          </div>
        )}

        {/* Test Summary Pillbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-bold text-slate-500">العينة التجريبية الإجمالية</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">{simulatedSampleCount.toLocaleString()} ظهور</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-bold text-slate-500">مدة الاختبار المحاكية</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">{testDurationDays} أيام (مكتمل)</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-700">فارق نسبة النقر (CTR Lift)</div>
            <div className="text-sm font-black text-emerald-700 mt-0.5">+{ctrUplift}% لصالح B 🚀</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-indigo-50/80 border border-indigo-200">
            <div className="text-[10px] font-bold text-indigo-700">النسخة المتصدرة حالياً</div>
            <div className="text-sm font-black text-indigo-900 mt-0.5">Variant B (الخلفية الموسمية) 👑</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIDE-BY-SIDE VISUAL COMPARISON CARDS (VARIANT A vs VARIANT B) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        
        {/* Central VS Badge (Desktop floating divider) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900 text-white font-black text-sm items-center justify-center border-4 border-white shadow-xl">
          VS
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* VARIANT A: CONTROL / TRADITIONAL WHITE */}
        {/* --------------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between relative overflow-hidden transition-all hover:border-slate-300">
          <div className="space-y-4">
            {/* Header / Variant Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center border border-slate-300">
                  A
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">النسخة A (الأساسية - Control)</h3>
                  <p className="text-[11px] text-slate-500">خلفية بيضاء نقية تقليدية (كتالوج المنصات)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                الوضع الافتراضي
              </span>
            </div>

            {/* Visual Image Preview Stage A */}
            <div className="relative aspect-square w-full rounded-2xl bg-white border border-slate-200/90 shadow-inner flex items-center justify-center overflow-hidden p-6">
              <img
                src={variantAImage}
                alt="Variant A Control"
                className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 shadow-xs">
                خلفية محايدة (White #FFFFFF)
              </div>
            </div>

            {/* Variant A Performance Snapshot */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold">معدل النقر (CTR)</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{metricsA.ctr}%</div>
                <div className="text-[9px] text-slate-500">متوسط السوق</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold">مؤشر الجاذبية</div>
                <div className="text-base font-black text-slate-700 mt-0.5">{metricsA.attractionScore}<span className="text-xs text-slate-500">/100</span></div>
                <div className="text-[9px] text-slate-500">مستوى اعتيادي</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold">معدل التحويل</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{metricsA.conversionRate}%</div>
                <div className="text-[9px] text-slate-500">{metricsA.clicks} نقرة</div>
              </div>
            </div>

            {/* Performance Characteristics */}
            <div className="text-[11px] text-slate-600 space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>متوافقة تماماً مع إرشادات المنصات الأساسية (خلفية بيضاء).</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>تتشابه مع آلاف المنتجات المنافسة دون تميز بصري جذاب.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => handleApplyWinningImage('variant_a')}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              الاستمرار بهذه النسخة التقليدية (A)
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* VARIANT B: CHALLENGER / SEASONAL AI BACKGROUND */}
        {/* --------------------------------------------------------------------- */}
        <div className="bg-gradient-to-b from-indigo-50/40 via-white to-white rounded-3xl border-2 border-indigo-500 p-5 sm:p-6 shadow-md shadow-indigo-100/50 flex flex-col justify-between relative overflow-hidden ring-4 ring-indigo-500/10">
          
          {/* Winner Ribbon */}
          <div className="absolute -left-12 top-6 -rotate-45 bg-emerald-600 text-white font-black text-[10px] py-1 px-14 shadow-md tracking-wider">
            متصدرة +{ctrUplift}% 🏆
          </div>

          <div className="space-y-4">
            {/* Header / Variant Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 pr-4 sm:pr-0">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                  B
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-indigo-950">النسخة B (المطورة - Challenger)</h3>
                    <Sparkles className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                  </div>
                  <p className="text-[11px] text-indigo-700 font-bold">{selectedSeasonPreset.title}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-200 flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>النسخة الفائزة</span>
              </span>
            </div>

            {/* Visual Image Preview Stage B (Composited or Generated Seasonal Stage) */}
            <div className="relative aspect-square w-full rounded-2xl border border-indigo-200 shadow-md flex items-center justify-center overflow-hidden">
              {/* Background Seasonal Texture / Render */}
              <img
                src={variantBImage}
                alt="Variant B Seasonal Backdrop"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Foreground Product Placement if Variant B is using backdrop */}
              <div className="relative z-10 p-6 max-h-full max-w-full flex items-center justify-center">
                <img
                  src={variantAImage}
                  alt="Product placed on stage"
                  className="max-h-64 max-w-64 object-contain filter drop-shadow-2xl transition-transform hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Optional Promotional Seasonal Badge Overlay */}
              {showBadgeOnVariantB && variantBBadgeText && (
                <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-sky-600 to-sky-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-lg border border-white/40 flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-white text-sky-200" />
                  <span>{variantBBadgeText}</span>
                </div>
              )}

              {/* Seasonal Tag Pill */}
              <div className="absolute bottom-3 left-3 z-20 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/20 shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>خلفية ذكية: {selectedSeasonPreset.title}</span>
              </div>
            </div>

            {/* Variant B Performance Snapshot (Outperforming!) */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[10px] text-emerald-800 font-bold">معدل النقر (CTR)</div>
                <div className="text-base font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-0.5">
                  <span>{metricsB.ctr}%</span>
                  <span className="text-[10px] text-emerald-600 font-bold">▲</span>
                </div>
                <div className="text-[9px] text-emerald-800 font-bold">+{ctrUplift}% زيادة حقيقية</div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <div className="text-[10px] text-indigo-800 font-bold">مؤشر الجاذبية</div>
                <div className="text-base font-black text-indigo-900 mt-0.5">{metricsB.attractionScore}<span className="text-xs text-indigo-500">/100</span></div>
                <div className="text-[9px] text-indigo-700 font-bold">فائق التفاعل 🔥</div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-center">
                <div className="text-[10px] text-sky-800 font-bold">معدل التحويل</div>
                <div className="text-base font-black text-sky-900 mt-0.5">{metricsB.conversionRate}%</div>
                <div className="text-[9px] text-sky-700 font-bold">+{conversionUplift}% طلبات</div>
              </div>
            </div>

            {/* Performance Characteristics */}
            <div className="text-[11px] text-indigo-950 space-y-1.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>تلفت الانتباه فوراً وسط مئات البطاقات البيضاء في نتائج البحث.</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Zap className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>تحقق {extraOrders} طلب إضافي بقيمة تقديرية +{estimatedExtraRevenue.toLocaleString()} {currency}.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-indigo-100">
            <button
              onClick={() => handleApplyWinningImage('variant_b')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-black shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>اعتماد النسخة B الفائزة للمنتج فوراً 🚀</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. AI SEASONAL BACKGROUND GENERATOR & PRESETS CONTROL SUITE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                توليد وتبديل الخلفيات الموسمية بالذكاء الاصطناعي (AI Seasonal Generator)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              اختر موسماً تجارياً جاهزاً أو اكتب وصفاً خاصاً ليقوم الذكاء الاصطناعي بتهيئة الخلفية الأكثر جاذبية للمتسوق المصري
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBadgeOnVariantB}
                onChange={(e) => setShowBadgeOnVariantB(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>إظهار شارة العرض الموسمي</span>
            </label>
          </div>
        </div>

        {/* 3.1. Fast Seasonal Presets (Ready-to-use Egyptian E-commerce Seasons) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>نماذج المواسم الجاهزة الأكثر مبيعاً في مصر:</span>
            <span className="text-[11px] text-indigo-600">اختر لتحديث لقطة Variant B فوراً</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SEASONAL_BACKGROUND_PRESETS.map((preset) => {
              const isSelected = selectedSeasonPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectSeasonPreset(preset)}
                  className={`p-2 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-full h-16 rounded-xl overflow-hidden mb-2 relative shadow-inner">
                    <img
                      src={preset.imageUrl}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-900/30 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 line-clamp-1">{preset.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.tag}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3.2. Custom AI Prompt Generator Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-500" />
              <span>توليد خلفية مخصصة بأوامر الذكاء الاصطناعي (Custom Prompt):</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500">مدعوم بـ Gemini AI</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                placeholder="مثال: منصة رخامية داكنة مع أضواء نيون ذهبية وشعار تخفيضات مصرية حصرية..."
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 bg-white"
              />
            </div>

            <button
              onClick={handleGenerateAiSeasonalBackground}
              disabled={isGeneratingAi}
              className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>جاري التحليل والتوليد...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-300" />
                  <span>توليد الخلفية الموسمية بالذكاء الاصطناعي ✨</span>
                </>
              )}
            </button>
          </div>

          {/* AI Strategy Insights Output if Generated */}
          {aiAnalysisResult && (
            <div className="mt-3 p-3.5 bg-white border border-indigo-200 rounded-xl space-y-2 text-xs animate-fadeIn">
              <div className="flex items-center justify-between text-indigo-950 font-black">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>الرؤية التسويقية المولدة: {aiAnalysisResult.themeTitle}</span>
                </span>
                <span className="text-emerald-600 font-bold">
                  توقع رفع الـ CTR بنسبة +{aiAnalysisResult.predictedCtrUpliftPercent || 65}%
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {aiAnalysisResult.visualPromptDescription}
              </p>
              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>سيكولوجية المشتري المصري: {aiAnalysisResult.eCommerceShopperPsychologyTip}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. IN-DEPTH PERFORMANCE METRICS DASHBOARD (PLACEHOLDER UI FOR DATA) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                لوحة المقارنة الإحصائية التفصيلية (Performance Analytics & Uplift)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              مقارنة مؤشرات التفاعل الحيوية وسلوك العملاء على مدار دورة الاختبار (Placeholder Data)
            </p>
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'amazon', label: 'أمازون مصر' },
              { id: 'noon', label: 'نون' },
              { id: 'jumia', label: 'جوميا' },
              { id: 'social', label: 'سوشيال ميديا' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePlatformFilter(tab.id as any)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  activePlatformFilter === tab.id
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Core Analytical Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Metric 1: CTR */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />
                <span>معدل النقر إلى الظهور (CTR)</span>
              </span>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                +{ctrUplift}%
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">النسخة A (بيضاء):</span>
                  <span className="font-bold text-slate-800">{metricsA.ctr}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(metricsA.ctr / 10) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-indigo-700 font-bold">النسخة B (موسمية):</span>
                  <span className="font-black text-emerald-700">{metricsB.ctr}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metricsB.ctr / 10) * 100}%` }} />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              الخلفية الموسمية تضاعف الرغبة في فتح تفاصيل العرض وسط المنافسين.
            </p>
          </div>

          {/* Metric 2: Customer Visual Attraction Score */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>مؤشر الجاذبية البصرية (0 - 100)</span>
              </span>
              <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                +{attractionUplift}%
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-[11px] text-slate-500">النسخة A</div>
                <div className="text-xl font-black text-slate-600">{metricsA.attractionScore}<span className="text-xs">/100</span></div>
              </div>
              <div className="text-slate-300 font-black text-lg">vs</div>
              <div className="text-right">
                <div className="text-[11px] text-indigo-700 font-bold">النسخة B (الموسمية)</div>
                <div className="text-xl font-black text-indigo-600">{metricsB.attractionScore}<span className="text-xs">/100</span></div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              يعتمد التقييم على تباين الألوان وعمق الإضاءة وملاءمة التوقيت الشرائي.
            </p>
          </div>

          {/* Metric 3: Conversion Rate */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                <span>معدل التحويل إلى طلبات (Conversion)</span>
              </span>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                +{conversionUplift}%
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">النسخة A:</span>
                  <span className="font-bold text-slate-800">{metricsA.conversionRate}% (18 لكل 1000)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(metricsA.conversionRate / 4) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-indigo-700 font-bold">النسخة B:</span>
                  <span className="font-black text-emerald-700">{metricsB.conversionRate}% (32 لكل 1000)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metricsB.conversionRate / 4) * 100}%` }} />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              توحي الصور الموسمية بجدية العرض والخصومات الحقيقية الفورية.
            </p>
          </div>

          {/* Metric 4: Hover / Focus Duration */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>متوسط زمن تركيز المتسوق (Hover Duration)</span>
              </span>
              <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                2.8x أطول
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[11px] text-slate-500">النسخة A</div>
                <div className="text-lg font-black text-slate-700">{metricsA.hoverDurationSec} ثانية</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-[11px] text-indigo-700 font-bold">النسخة B</div>
                <div className="text-lg font-black text-indigo-600">{metricsB.hoverDurationSec} ثانية</div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              الخلفية الديكورية تجعل المتسوق يتوقف لتأمل المنتج بدلاً من التمرير السريع.
            </p>
          </div>

          {/* Metric 5: Estimated CAC (Customer Acquisition Cost) */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-indigo-600" />
                <span>تكلفة الإعلان لكل طلب (Est. CAC)</span>
              </span>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                توفير 40%
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[11px] text-slate-500">النسخة A</div>
                <div className="text-lg font-black text-rose-700">{metricsA.cacEGP} {currency}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-[11px] text-emerald-700 font-bold">النسخة B</div>
                <div className="text-lg font-black text-emerald-700">{metricsB.cacEGP} {currency}</div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              كلما زاد معدل النقر (CTR)، تنخفض تكلفة النقرة CPC في إعلانات أمازون والسوشيال ميديا.
            </p>
          </div>

          {/* Metric 6: Projected Extra Net Profit */}
          <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>العائد الإضافي المتوقع شهرياً</span>
              </span>
              <span className="text-[11px] font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                +{extraOrders} طلب
              </span>
            </div>

            <div className="pt-1">
              <div className="text-2xl font-black text-indigo-950">
                +{estimatedExtraRevenue.toLocaleString()} <span className="text-sm font-bold text-indigo-600">{currency}</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                بناءً على متوسط مبيعات المتجر عند تعميم الصورة الفائزة (B)
              </div>
            </div>

            <p className="text-[10px] text-indigo-700 font-medium leading-tight">
              زيادة تلقائية في الأرباح بدون زيادة في ميزانية الحملات الإعلانية.
            </p>
          </div>
        </div>

        {/* Platform Breakdown Bars */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
          <span className="text-xs font-bold text-slate-800 block">
            مقارنة نسبة النقر (CTR) حسب منصة التسوق في مصر:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">أمازون مصر 📦</span>
                <span className="text-emerald-600">8.1% vs 4.8%</span>
              </div>
              <div className="text-[10px] text-slate-500">زيادة بنسبة +68.7%</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">نون مصر 🟡</span>
                <span className="text-emerald-600">7.6% vs 4.4%</span>
              </div>
              <div className="text-[10px] text-slate-500">زيادة بنسبة +72.7%</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">جوميا مصر ⭐</span>
                <span className="text-emerald-600">7.2% vs 4.2%</span>
              </div>
              <div className="text-[10px] text-slate-500">زيادة بنسبة +71.4%</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">إعلانات السوشيال 📱</span>
                <span className="text-emerald-600">8.8% vs 3.9%</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-black">أعلى فارق: +125% 🚀</div>
            </div>
          </div>
        </div>

        {/* Shopper Psychology & Recommendation Note */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-black text-emerald-900 block">توصية رادار التاجر الذكي:</span>
              <span className="text-[11px] text-emerald-800">
                اعتمد النسخة B كصورة رئيسية لحملتك القادمة، واحتفظ بالنسخة A كصورة ثانوية داخل ألبوم المنتج لتلبية متطلبات مطابقة الكتالوج.
              </span>
            </div>
          </div>

          <button
            onClick={() => handleApplyWinningImage('variant_b')}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-sm transition-all cursor-pointer"
          >
            <span>اعتماد وتحديث الرادار 🏆</span>
          </button>
        </div>
      </div>
    </div>
  );
};
