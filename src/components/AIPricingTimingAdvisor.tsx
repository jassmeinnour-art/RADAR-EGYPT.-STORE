import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Zap,
  ShieldAlert,
  Percent,
  RefreshCw,
  X,
  Store,
  ChevronDown,
  BarChart3,
  Flame,
  Info
} from 'lucide-react';
import { ProductData, AIPricingTimingPrediction } from '../types';
import { HistoricalPriceDataPoint } from './CompetitorPriceHistoryChart';

interface AIPricingTimingAdvisorProps {
  product: ProductData;
  currency?: string;
  historyPoints?: HistoricalPriceDataPoint[];
  winningPrice?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onApplyPrice?: (newPrice: number, strategyNote?: string) => void;
  onShowToast?: (msg: string) => void;
  isEmbedded?: boolean;
}

export const AIPricingTimingAdvisor: React.FC<AIPricingTimingAdvisorProps> = ({
  product,
  currency = 'EGP',
  historyPoints = [],
  winningPrice,
  isOpen = false,
  onClose,
  onApplyPrice,
  onShowToast,
  isEmbedded = false
}) => {
  const [prediction, setPrediction] = useState<AIPricingTimingPrediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'supply_demand' | 'schedule' | 'comparison'>('summary');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Loading step animation
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    'تحليل سجل تقلبات أسعار المنافسين على أمازون ونون وجوميا...',
    'التنبؤ بتغيرات العرض والطلب ومواعيد الرواتب وعطلات التسوق...',
    'رصد احتمالات نفاد مخزون المنافسين وضغط التوريد...',
    'صياغة التوقيت الذهبي لتعديل السعر لتعظيم هوامش الربح...'
  ];

  const fetchTimingAdvice = async () => {
    setIsLoading(true);
    setError(null);
    setIsScheduled(false);
    setIsApplied(false);

    try {
      const response = await fetch('/api/ai-pricing-timing-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            ...product,
            priceHistory: product.priceHistory || []
          },
          currency,
          historyPoints: historyPoints.slice(-12)
        })
      });

      const data = await response.json();
      if (data && data.success) {
        setPrediction(data);
      } else {
        throw new Error(data.error || 'فشل في استلام تحليل الذكاء الاصطناعي');
      }
    } catch (err: any) {
      console.error('Error fetching AI timing advisor:', err);
      setError(err?.message || 'تعذر الاتصال بخدمة الذكاء الاصطناعي، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch on first open if not yet fetched
  useEffect(() => {
    if ((isOpen || isEmbedded) && !prediction && !isLoading && !error) {
      fetchTimingAdvice();
    }
  }, [isOpen, isEmbedded, product.id]);

  const handleApplyNow = (price: number) => {
    if (onApplyPrice) {
      const note = prediction?.timingStrategyLabel || 'تطبيق السعر الموصى به بالتوقيت الأمثل';
      onApplyPrice(price, note);
      setIsApplied(true);
      if (onShowToast) {
        onShowToast(`تم تطبيق السعر الموصى به: ${price.toLocaleString()} ${currency} بنجاح! 🎯`);
      }
    }
  };

  const handleScheduleAlert = () => {
    setIsScheduled(true);
    if (onShowToast) {
      onShowToast(
        `تمت جدولة تذكير آلي لتعديل السعر في: ${prediction?.optimalTimingWindow || 'الموعد المحدد'} ⏰`
      );
    }
  };

  const content = (
    <div className="space-y-5 text-right font-['Alexandria']" dir="rtl">
      {/* Header bar if embedded */}
      {isEmbedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-slate-900">
                  مستشار التوقيت الأمثل للتسعير بالذكاء الاصطناعي
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Dynamic Timing 🔮
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تحليل متقدم لسجل الأسعار التاريخي والتنبؤ بتموجات العرض والطلب لاقتناص اللحظة الأعلى ربحية
              </p>
            </div>
          </div>

          <button
            onClick={fetchTimingAdvice}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث التحليل</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/30 rounded-3xl border border-indigo-100">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center animate-ping absolute inset-0" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg relative z-10">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-md">
            <h5 className="text-base font-black text-slate-800">
              جاري تشغيل محرك الذكاء الاصطناعي للتنبؤ السلوكي...
            </h5>
            <p className="text-xs text-indigo-700 font-semibold transition-all duration-300 min-h-[36px]">
              {loadingMessages[loadingStep]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${((loadingStep + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold text-sm">حدث خطأ أثناء إجراء التحليل الذكي</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
          <button
            onClick={fetchTimingAdvice}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer shadow-xs"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Result Display */}
      {prediction && !isLoading && (
        <div className="space-y-4">
          {/* Hero Optimal Timing Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border border-indigo-900/60 shadow-xl">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>التوقيت الذهبي الموصى به للتعديل</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    دقة التنبؤ {prediction.confidenceScore}% ✨
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">
                  تم التحليل: {new Date(prediction.analyzedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Main timing window & strategy headline */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 font-['Alexandria'] flex items-center gap-2 flex-wrap">
                    <span>{prediction.optimalTimingWindow}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <span className="p-1 rounded-md bg-indigo-500/30 text-indigo-200">
                      <Zap className="w-4 h-4" />
                    </span>
                    <span>الاستراتيجية: {prediction.timingStrategyLabel}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {prediction.strategicReasoning}
                  </p>
                </div>

                {/* Price summary card on the side */}
                <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5 text-right">
                  <div className="text-[11px] text-slate-300 font-medium">السعر المستهدف المقترح</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-emerald-300">
                      {prediction.recommendedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-300 font-bold">{currency}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
                    <div>
                      <span className="text-slate-400 block text-[10px]">هامش الربح المتوقع</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {prediction.expectedMarginPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">فارق الهامش</span>
                      <span className="font-bold text-indigo-300 font-mono">
                        {prediction.marginDifferencePercent >= 0 ? `+${prediction.marginDifferencePercent}%` : `${prediction.marginDifferencePercent}%`}
                      </span>
                    </div>
                  </div>

                  {/* Action button inside hero */}
                  <div className="pt-2 flex flex-col gap-1.5">
                    <button
                      onClick={() => handleApplyNow(prediction.recommendedPrice)}
                      disabled={isApplied}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                        isApplied
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white active:scale-98'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isApplied ? 'تم اعتماد السعر بنجاح ✓' : 'تطبيق السعر المقترح الآن'}</span>
                    </button>

                    <button
                      onClick={handleScheduleAlert}
                      disabled={isScheduled}
                      className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        isScheduled
                          ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                          : 'bg-white/5 hover:bg-white/10 border-white/20 text-slate-200'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{isScheduled ? 'تمت الجدولة بنجاح ✓' : 'جدولة تذكير آلي بالموعد'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'summary'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نظرة عامة واستنتاج السجل 📊
            </button>
            <button
              onClick={() => setActiveTab('supply_demand')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'supply_demand'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تحليل العرض والطلب المتوقع 📈
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'comparison'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مقارنة التعديل الفوري vs التوقيت الأمثل ⚖️
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'schedule'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الخريطة الزمنية للتحركات القادمة 🗺️
            </button>
          </div>

          {/* Tab 1: Summary & Key Finding */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Finding from price history */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>الاستنتاج الرئيسي من سجل الأسعار التاريخي</span>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  {prediction.priceHistoryKeyFinding}
                </p>
                <div className="pt-2 text-[11px] text-slate-500 border-t border-indigo-100/60 flex items-center justify-between">
                  <span>أقل سعر منافس حالي: <strong className="font-mono text-slate-800">{prediction.lowestCompetitorPrice.toLocaleString()} {currency}</strong></span>
                  <span>تكلفة الجملة: <strong className="font-mono text-slate-800">{prediction.wholesaleCost.toLocaleString()} {currency}</strong></span>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>تقييم المخاطر وحروب الأسعار (Price War Prevention)</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {prediction.riskAssessment}
                </p>
                <div className="pt-2 text-[11px] text-amber-700 border-t border-amber-200/60 flex items-center gap-1 font-semibold">
                  <Info className="w-3.5 h-3.5" />
                  <span>تأجيل التعديل يحميك من استجابة برامج التسعير الآلية (Repricers) للمنافسين.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Supply and Demand Dynamics */}
          {activeTab === 'supply_demand' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Demand Side Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900">ديناميكية الطلب المتوقعة (Demand)</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    {prediction.supplyDemandAnalysis.demandTrendLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {prediction.supplyDemandAnalysis.demandExplanation}
                </p>

                {prediction.supplyDemandAnalysis.keyDrivers && prediction.supplyDemandAnalysis.keyDrivers.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block">العوامل المحركة للطلب بالسوق المصري:</span>
                    <ul className="space-y-1">
                      {prediction.supplyDemandAnalysis.keyDrivers.map((driver, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Supply Side Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-sky-50 text-sky-600">
                      <Store className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900">حالة المعروض ومخزون المنافسين (Supply)</span>
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                    {prediction.supplyDemandAnalysis.supplyTrendLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {prediction.supplyDemandAnalysis.supplyExplanation}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
                  <span className="font-medium">نافذة ذروة التسوّق الأسبوعية:</span>
                  <span className="font-bold text-indigo-700 font-mono">
                    {prediction.supplyDemandAnalysis.peakShoppingWindow}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Comparison (Immediate vs Optimal) */}
          {activeTab === 'comparison' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>مقارنة الأثر المالي: التعديل الفوري بدون دراسة العرض/الطلب مقابل التوقيت الأمثل</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Immediate reaction */}
                <div className="p-4 rounded-2xl bg-white border border-rose-200/90 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800">التعديل الفوري المباشر (خاطئ) ❌</span>
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                      حرق للهامش
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    {prediction.comparison?.immediateAction.price.toLocaleString() || (prediction.lowestCompetitorPrice - 20).toLocaleString()} <span className="text-xs text-slate-500 font-normal">{currency}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    هامش الربح: <strong className="text-rose-700 font-mono">{prediction.comparison?.immediateAction.marginPercent || 18}%</strong>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {prediction.comparison?.immediateAction.outcomeDescription || 'تخفيض السعر في منتصف الأسبوع يؤدي لكسر الأسعار دون وجود طلب كافٍ.'}
                  </p>
                </div>

                {/* Optimal timing */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-300 shadow-2xs space-y-2.5 relative">
                  <div className="absolute top-2 left-2 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    المسار الذكي الموصى به ⭐
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">التعديل في التوقيت الأمثل (صائب) ✓</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-950 font-mono">
                    {prediction.recommendedPrice.toLocaleString()} <span className="text-xs text-emerald-700 font-normal">{currency}</span>
                  </div>
                  <div className="text-xs text-emerald-800">
                    هامش الربح: <strong className="text-emerald-700 font-mono">{prediction.expectedMarginPercent}%</strong>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {prediction.comparison?.optimalAction.outcomeDescription || 'اقتناص تدفق الزوار في ذروة عطلة نهاية الأسبوع مع حماية هامش الربح.'}
                  </p>
                  {prediction.comparison?.optimalAction.profitAdvantageEGP && (
                    <div className="p-2 rounded-xl bg-white/80 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
                      <span>وفر إضافي بالربح الصافي للقطعة:</span>
                      <span className="font-mono text-sm text-emerald-700">+{prediction.comparison.optimalAction.profitAdvantageEGP.toLocaleString()} {currency}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Phased Action Schedule */}
          {activeTab === 'schedule' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>الخريطة الزمنية للتحركات والمراحل القادمة (Action Timeline)</span>
              </div>

              <div className="space-y-3 pt-1">
                {(prediction.upcomingActionSchedule || [
                  {
                    phase: 'المرحلة 1: الآن (فترة الركود النسبية)',
                    timing: 'فوري',
                    suggestedPrice: prediction.currentPrice,
                    action: 'تثبيت السعر الحالي ومراقبة حركة مخزون نون وأمازون',
                    demandLevel: 'متوسط'
                  },
                  {
                    phase: 'المرحلة 2: النافذة الذهبية (التوقيت الأمثل)',
                    timing: prediction.optimalTimingWindow,
                    suggestedPrice: prediction.recommendedPrice,
                    action: 'تطبيق السعر التنافسي للاستحواذ الكامل على الـ Buy Box في ذروة الزيارات',
                    demandLevel: 'ذروة قصوى 🚀'
                  },
                  {
                    phase: 'المرحلة 3: التعافي والربحية (بعد انحسار العروض)',
                    timing: 'الأحد صباحاً',
                    suggestedPrice: Math.round(prediction.recommendedPrice * 1.04),
                    action: 'إعادة رفع السعر تدريجياً لتعظيم هامش الربح بعد انتهاء عروض المنافسين',
                    demandLevel: 'طبيعي'
                  }
                ]).map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      idx === 1
                        ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <h6 className="text-xs font-bold text-slate-900">{step.phase}</h6>
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                          {step.timing}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mr-7">{step.action}</p>
                    </div>

                    <div className="flex items-center gap-3 mr-7 sm:mr-0 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">السعر المقترح</span>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {step.suggestedPrice.toLocaleString()} {currency}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                        الطلب: {step.demandLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // If in modal mode:
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 my-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 font-['Alexandria']">
                  مستشار التوقيت الأمثل للتسعير بالذكاء الاصطناعي 🔮⚡
                </h3>
                <p className="text-xs text-slate-500">
                  منتج: {product.title} (كود: {product.sku || product.id})
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {content}
        </div>
      </div>
    );
  }

  // Otherwise return embedded view
  return (
    <div className="rounded-3xl bg-white border border-indigo-100 p-5 sm:p-6 shadow-xs space-y-4">
      {content}
    </div>
  );
};
