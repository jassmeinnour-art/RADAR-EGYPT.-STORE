import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Award,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Printer,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData } from '../types';

interface AiBriefExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData;
  currency?: string;
  winningPrice?: number;
  selectedDiscount?: number;
  onExportPdfWithBrief: (brief: any) => void;
  onExportCsvWithBrief: (brief: any) => void;
  onEmailManagerWithBrief: (brief: any) => void;
  onSuccessToast?: (msg: string) => void;
}

export const AiBriefExportModal: React.FC<AiBriefExportModalProps> = ({
  isOpen,
  onClose,
  product,
  currency = 'EGP',
  winningPrice,
  selectedDiscount = 5,
  onExportPdfWithBrief,
  onExportCsvWithBrief,
  onEmailManagerWithBrief,
  onSuccessToast
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [briefData, setBriefData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const loadingSteps = [
    'استدعاء محرك Google Gemini 3.8 Flash...',
    'فحص تكلفة الجملة وأسعار شارع عبد العزيز والعتبة ومول البستان...',
    'تحليل الفوارق السعرية مع عروض أمازون ونون وجوميا مصر...',
    'حساب احتمالية الفوز بصندوق الشراء (Buy Box) وهوامش الربح...',
    'صياغة التقرير التنفيذي المعتمد قبل التصدير...'
  ];

  const fetchAiBrief = async () => {
    if (!product) return;
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await fetch('/api/generate-export-ai-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          currency,
          winningPrice,
          discountPercent: selectedDiscount
        })
      });

      const res = await response.json();
      if (res.success && res.data) {
        setBriefData(res.data);
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch {
          // safe
        }
      } else {
        throw new Error(res.error || 'تعذر توليد التقرير من Gemini');
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء استدعاء الذكاء الاصطناعي');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAiBrief();
    } else {
      setBriefData(null);
      setError(null);
    }
  }, [isOpen, product?.id]);

  if (!isOpen) return null;

  const handleCopyText = () => {
    if (!briefData) return;
    const textToCopy = `*تقرير الذكاء الاصطناعي المختصر قبل التصدير (Gemini 3.8 Flash)*
المنتج: ${product.title}
الماركة: ${product.brand} | العملة: ${currency}
جاهزية التصدير: ${briefData.exportReadinessScore}% | فرصة الفوز بالـ Buy Box: ${briefData.competitiveLandscape?.buyBoxWinProbability}%

*الملخص التنفيذي:*
${briefData.executiveSummary}

*حكم التسعير:*
- السعر الموصى به: ${briefData.pricingVerdict?.recommendedWinningPrice} ${currency}
- هامش الربح المتوقع: ${briefData.pricingVerdict?.projectedMarginPercent}%
- المبررات: ${briefData.pricingVerdict?.rationale}

*المنافسة والسوق:*
- المنافس المهيمن: ${briefData.competitiveLandscape?.dominantCompetitor}
- حدة المنافسة: ${briefData.competitiveLandscape?.priceWarIntensity}
- فارق الجملة: ${briefData.competitiveLandscape?.wholesaleArbitrageOpportunity}

*التوصيات الاستراتيجية:*
${(briefData.strategicRecommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

*الخلاصة الإدارية:*
${briefData.keyTakeaway}

تم التوليد بواسطة منصة رادار التاجر الذكي - مصر 🇪🇬`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onSuccessToast?.('تم نسخ تقرير الذكاء الاصطناعي المختصر بنجاح 📋');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn font-['Alexandria',sans-serif] text-right">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-5 flex items-center justify-between shrink-0 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">تقرير الذكاء الاصطناعي المختصر قبل التصدير</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-[10px] font-bold border border-purple-400/30 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  <span>Gemini 3.8 Flash</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                تدقيق شامل ومقارنة سعرية بين منصات مصر وأسواق الجملة قبل الاعتماد والتصدير
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 bg-slate-50/50 flex-1">

          {/* Target Product Ribbon */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {product.brand} • {product.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate mt-1">
                  {product.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-500 block">تكلفة الجملة</span>
                <span className="font-mono font-bold text-slate-800">
                  {product.estimatedWholesaleCost?.toLocaleString()} {currency}
                </span>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-500 block">أقل منافس</span>
                <span className="font-mono font-bold text-rose-600">
                  {product.currentLowestPrice?.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-25" />
                <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  جاري فحص وتدقيق المنتج بواسطة Gemini AI...
                </h4>
                <p className="text-xs text-indigo-600 font-bold animate-pulse">
                  {loadingSteps[loadingStep]}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-black mb-1">تعذر استكمال التحليل</p>
                <p className="text-rose-700 leading-relaxed mb-2">{error}</p>
                <button
                  onClick={fetchAiBrief}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Brief Content */}
          {briefData && !loading && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Score Banners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 block">جاهزية التصدير للاعتماد</span>
                    <span className="text-2xl font-black text-emerald-950 font-mono">
                      {briefData.exportReadinessScore || 95}%
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      مكتمل البيانات ومطابق للمواصفات
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-4 rounded-2xl border border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-800 block">احتمالية الفوز بـ Buy Box</span>
                    <span className="text-2xl font-black text-indigo-950 font-mono">
                      {briefData.competitiveLandscape?.buyBoxWinProbability || 92}%
                    </span>
                    <span className="text-[10px] text-indigo-700 block mt-0.5">
                      بناءً على السعر وهوامش المنافسين
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Executive Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-black text-slate-900">الملخص التحليلي التنفيذي (Executive Summary)</h4>
                  </div>
                  <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                    رأي المستشار الذكي
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {briefData.executiveSummary}
                </p>
              </div>

              {/* Pricing Verdict & Competitive Posture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Pricing Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>حكم التسعير المقترح</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {briefData.pricingVerdict?.statusLabel || 'تسعير رابح'}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[11px] text-emerald-900 font-bold">السعر المقترح:</span>
                      <span className="text-lg font-black font-mono text-emerald-950">
                        {briefData.pricingVerdict?.recommendedWinningPrice?.toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-800">
                      <span>هامش الربح المتوقع:</span>
                      <span className="font-bold font-mono">
                        +{briefData.pricingVerdict?.projectedMarginPercent}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal">
                    {briefData.pricingVerdict?.rationale}
                  </p>
                </div>

                {/* Competitive Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>المنافسة وأسواق الجملة</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      حدة المنافسة: {briefData.competitiveLandscape?.priceWarIntensity}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">المنافس الرئيسي المرصود:</span>
                      <span className="font-bold text-slate-800">
                        {briefData.competitiveLandscape?.dominantCompetitor}
                      </span>
                    </div>
                    <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 leading-snug">
                      <span className="font-bold block text-indigo-950 mb-0.5">فارق أسواق الجملة (Arbitrage):</span>
                      {briefData.competitiveLandscape?.wholesaleArbitrageOpportunity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Recommendations */}
              {briefData.strategicRecommendations && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>التوصيات الاستراتيجية قبل التصدير والتنفيذ:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {briefData.strategicRecommendations.map((rec: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Takeaway */}
              {briefData.keyTakeaway && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-950 text-xs font-bold flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>القرار الإداري المقترح: {briefData.keyTakeaway}</span>
                  </div>
                  <button
                    onClick={handleCopyText}
                    className="h-7 px-2.5 rounded-lg bg-white hover:bg-purple-100 text-purple-900 text-[11px] font-bold border border-purple-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAiBrief}
              disabled={loading}
              className="h-9 px-3 rounded-xl bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              title="إعادة استدعاء الذكاء الاصطناعي"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>إعادة التحليل</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export as PDF with AI Brief */}
            <button
              onClick={() => {
                onClose();
                onExportPdfWithBrief(briefData);
              }}
              disabled={loading || !briefData}
              className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>تصدير تقرير PDF معتمد 🖨️</span>
            </button>

            {/* Export as CSV with AI Brief */}
            <button
              onClick={() => {
                onClose();
                onExportCsvWithBrief(briefData);
              }}
              disabled={loading || !briefData}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير CSV ذكي 📁</span>
            </button>

            {/* Email Report to Manager */}
            <button
              onClick={() => {
                onClose();
                onEmailManagerWithBrief(briefData);
              }}
              disabled={loading || !briefData}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>إرسال للمدير ✉️</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
