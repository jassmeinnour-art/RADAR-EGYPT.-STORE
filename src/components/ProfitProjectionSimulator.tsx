import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  Layers,
  Award,
  Calendar,
  SlidersHorizontal,
  RefreshCw,
  Share2,
  Copy,
  Download,
  FileText,
  Check,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  ShoppingCart,
  Image as ImageIcon,
  Camera,
  Target,
  BarChart3,
  PieChart as PieIcon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  Store,
  Tag,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import confetti from 'canvas-confetti';
import { 
  ProductData, 
  StrategyPresetId, 
  MarketScenarioId,
  SimulationResult,
  StrategyPreset,
  MarketScenario
} from '../types';
import { 
  STRATEGY_PRESETS, 
  MARKET_SCENARIOS, 
  runProfitSimulation 
} from '../data/profitSimulatorData';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface ProfitProjectionSimulatorProps {
  products: ProductData[];
  currentProduct: ProductData;
  currency?: string;
  onApplySimulatedPrice?: (productId: string, newPrice: number) => void;
  onOpenImageStudio?: (product: ProductData) => void;
  onSelectProductForRadar?: (productId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const ProfitProjectionSimulator: React.FC<ProfitProjectionSimulatorProps> = ({
  products,
  currentProduct,
  currency = 'EGP',
  onApplySimulatedPrice,
  onOpenImageStudio,
  onSelectProductForRadar,
  onShowToast
}) => {
  // Selected Product State
  const [selectedProductId, setSelectedProductId] = useState<string>(currentProduct?.id || products[0]?.id || 'p1');
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || currentProduct || products[0];
  }, [products, selectedProductId, currentProduct]);

  // Strategy & Scenario States
  const [selectedStrategyId, setSelectedStrategyId] = useState<StrategyPresetId>('premium_quality_boost');
  const [selectedScenarioId, setSelectedScenarioId] = useState<MarketScenarioId>('normal_growth');
  const [timelineMonths, setTimelineMonths] = useState<number>(6);

  // Custom Interactive Parameter Sliders
  const [priceAdjustmentPercent, setPriceAdjustmentPercent] = useState<number>(
    STRATEGY_PRESETS.premium_quality_boost.priceAdjustmentPercent
  );
  const [imageQualityScore, setImageQualityScore] = useState<number>(
    STRATEGY_PRESETS.premium_quality_boost.imageQualityScore
  );
  const [marketingSpendMonthly, setMarketingSpendMonthly] = useState<number>(
    STRATEGY_PRESETS.premium_quality_boost.marketingSpendMonthlyEGP
  );
  const [baseMonthlyUnits, setBaseMonthlyUnits] = useState<number>(35);

  // Chart View Tab
  const [activeChartView, setActiveChartView] = useState<'monthly_revenue_profit' | 'cumulative_comparison' | 'price_sensitivity'>('monthly_revenue_profit');

  // Copied & Modal states
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isParamSlidersExpanded, setIsParamSlidersExpanded] = useState<boolean>(true);

  // Re-run simulation dynamically
  const simulation: SimulationResult = useMemo(() => {
    const strategy = STRATEGY_PRESETS[selectedStrategyId];
    const scenario = MARKET_SCENARIOS[selectedScenarioId];

    return runProfitSimulation(
      activeProduct,
      strategy,
      scenario,
      timelineMonths,
      {
        customPriceAdjustment: priceAdjustmentPercent,
        customImageQualityScore: imageQualityScore,
        customMarketingSpend: marketingSpendMonthly,
        customBaseUnits: baseMonthlyUnits
      }
    );
  }, [
    activeProduct,
    selectedStrategyId,
    selectedScenarioId,
    timelineMonths,
    priceAdjustmentPercent,
    imageQualityScore,
    marketingSpendMonthly,
    baseMonthlyUnits
  ]);

  // Handle Strategy Preset Selection
  const handleSelectStrategy = (stratId: StrategyPresetId) => {
    setSelectedStrategyId(stratId);
    const preset = STRATEGY_PRESETS[stratId];
    setPriceAdjustmentPercent(preset.priceAdjustmentPercent);
    setImageQualityScore(preset.imageQualityScore);
    setMarketingSpendMonthly(preset.marketingSpendMonthlyEGP);

    if (onShowToast) {
      onShowToast(`تم تطبيق استراتيجية: ${preset.label} 🚀`);
    }
  };

  // Handle Scenario Selection
  const handleSelectScenario = (scenId: MarketScenarioId) => {
    setSelectedScenarioId(scenId);
    const scenario = MARKET_SCENARIOS[scenId];
    if (onShowToast) {
      onShowToast(`تم ضبط ظروف السوق على: ${scenario.label} 📈`);
    }
  };

  // Calculated target selling price
  const basePrice = activeProduct?.suggestedRetailPrice || activeProduct?.currentLowestPrice || 2500;
  const targetSimulatedPrice = Math.round(
    basePrice * (1 + priceAdjustmentPercent / 100)
  );

  // Apply simulated price to store
  const handleApplyPriceToStore = () => {
    if (onApplySimulatedPrice && activeProduct?.id) {
      onApplySimulatedPrice(activeProduct.id, targetSimulatedPrice);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (onShowToast) {
        onShowToast(`تم اعتماد السعر المستقبلي (${targetSimulatedPrice.toLocaleString()} ${currency}) بنجاح للمنتج ✅`);
      }
    }
  };

  // Copy Executive Simulation Summary
  const handleCopySummary = () => {
    const title = activeProduct?.title || 'المنتج المختار';
    const summaryText = `📈 نتائج محاكي الربح المستقبلي للمنتج: ${title}
--------------------------------------------------
🎯 الاستراتيجية: ${STRATEGY_PRESETS[selectedStrategyId].label}
📊 ظروف السوق: ${MARKET_SCENARIOS[selectedScenarioId].label}
⏳ الفترة التنبؤية: ${timelineMonths} أشهر

💰 إجمالي الإيرادات المتوقعة: ${simulation.summary.totalRevenueEGP.toLocaleString()} ${currency}
🛡️ صافي الأرباح المتوقعة: ${simulation.summary.totalNetProfitEGP.toLocaleString()} ${currency} (هامش ${simulation.summary.averageProfitMarginPercent}%)
📈 الزيادة عن الوضع الحالي: +${simulation.summary.profitGainVsBaselineEGP.toLocaleString()} ${currency} (+${simulation.summary.profitGainPercent}%)
📦 إجمالي المبيعات المقدرة: ${simulation.summary.totalUnitsSold} قطعة
🚀 العائد على رأس المال (ROI): ${simulation.summary.annualizedRoiPercent}%

💡 التوصية التنفيذية:
${simulation.aiInsights.executiveVerdict}

منظومة رادار التاجر الذكي مصر 🇪🇬`;

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    if (onShowToast) onShowToast('تم نسخ ملخص المحاكاة التنبؤية لمشاركته 📋');
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const title = activeProduct?.title || 'المنتج';
    const text = encodeURIComponent(`*نتائج محاكي الربح المستقبلي* 📊\nالمنتج: *${title}*\nالاستراتيجية: *${STRATEGY_PRESETS[selectedStrategyId].label}*\n\n• إجمالي المبيعات المتوقعة (${timelineMonths} أشهر): *${simulation.summary.totalRevenueEGP.toLocaleString()} ${currency}*\n• صافي الأرباح المتوقعة: *${simulation.summary.totalNetProfitEGP.toLocaleString()} ${currency}* (+${simulation.summary.profitGainPercent}% زيادة)\n• هامش الربح الصافي: *${simulation.summary.averageProfitMarginPercent}%*\n• السعر المقترح للبيع: *${targetSimulatedPrice.toLocaleString()} ${currency}*\n\n_تم النمذجة والتحليل عبر رادار التاجر الذكي_ 🚀`);
    safeOpenUrl(`https://wa.me/?text=${text}`);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Month', 'Unit_Sales', 'Revenue_EGP', 'COGS_EGP', 'Platform_Fees_EGP', 'Marketing_Spend_EGP', 'Net_Profit_EGP', 'Cumulative_Profit_EGP', 'Profit_Margin_Percent'];
    const rows = simulation.monthlyProjections.map(m => [
      `"${m.monthLabel}"`,
      m.unitSales,
      m.revenueEGP,
      m.cogsEGP,
      m.platformFeesEGP,
      m.marketingCostEGP,
      m.netProfitEGP,
      m.cumulativeNetProfitEGP,
      m.profitMarginPercent
    ]);

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const prodId = activeProduct?.id || 'product';
    link.setAttribute('download', `profit_projection_simulator_${prodId}_${timelineMonths}m.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast('تم تنزيل بيانات المحاكاة بصيغة CSV 📥');
  };

  return (
    <div className="space-y-6" id="profit-projection-simulator-container">
      
      {/* ========================================================================= */}
      {/* 1. TOP HERO HEADER & PRODUCT SELECTOR */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-200 text-xs font-black border border-indigo-400/40 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span>محاكي الربح المستقبلي والنمذجة التنبؤية للأسعار</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>خوارزمية مرونة الطلب وتأثير صور الاستوديو الذكي</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-['Alexandria'] leading-snug">
              محاكي أرباح التاجر التنبؤي (Profit Projection Simulator)
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              اختبر تأثير استراتيجيات التسعير المتطورة (مثل: <strong>رفع السعر مع تحسين جودة الصور عبر الاستوديو</strong> أو <strong>كسر سعر المنافسين</strong>) ورؤية أثرها المالي المباشر على الأرباح والتدفقات النقدية المستقبلية.
            </p>
          </div>

          {/* Product Switcher Dropdown */}
          <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700/80 shrink-0 space-y-1.5 min-w-[280px]">
            <label className="text-[11px] font-bold text-slate-400 block flex items-center justify-between">
              <span>اختر المنتج للمحاكاة:</span>
              <span className="text-indigo-400">{products.length} منتجات متاحة</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              id="simulator-product-select"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {products.map((p) => {
                const pTitle = p.title || 'منتج';
                return (
                  <option key={p.id} value={p.id}>
                    {pTitle.length > 35 ? pTitle.substring(0, 35) + '...' : pTitle} ({p.suggestedRetailPrice || p.currentLowestPrice || 2500} {currency})
                  </option>
                );
              })}
            </select>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>سعر الجملة: <strong className="text-slate-200">{activeProduct?.estimatedWholesaleCost || Math.round((activeProduct?.currentLowestPrice || 2500) * 0.78)} {currency}</strong></span>
              <span>السعر الحالي: <strong className="text-indigo-300">{activeProduct?.suggestedRetailPrice || activeProduct?.currentLowestPrice || 2500} {currency}</strong></span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KPI PROJECTED RESULTS BAR */}
        {/* ========================================================================= */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
          
          {/* Card 1: Projected Net Profit */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/70 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">صافي الأرباح المتوقعة ({timelineMonths} أشهر)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-1">
              {simulation.summary.totalNetProfitEGP.toLocaleString()} <span className="text-xs text-slate-300 font-normal">{currency}</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{simulation.summary.profitGainVsBaselineEGP.toLocaleString()} {currency} (+{simulation.summary.profitGainPercent}%)</span>
            </div>
          </div>

          {/* Card 2: Projected Revenue (GMV) */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/70 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">إجمالي المبيعات المقدرة (GMV)</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {simulation.summary.totalRevenueEGP.toLocaleString()} <span className="text-xs text-slate-300 font-normal">{currency}</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] font-bold text-slate-300">
              <span>هامش ربح صافي: <strong className="text-teal-300">{simulation.summary.averageProfitMarginPercent}%</strong></span>
            </div>
          </div>

          {/* Card 3: Projected Volume & Target Price */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/70 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">القطع المقدر بيعها</span>
              <ShoppingCart className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {simulation.summary.totalUnitsSold} <span className="text-xs text-slate-400 font-normal">قطعة</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] font-bold text-indigo-300">
              <span>السعر المطبق: {targetSimulatedPrice.toLocaleString()} {currency}</span>
            </div>
          </div>

          {/* Card 4: Annualized ROI % */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/70 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">العائد على رأس المال (ROI)</span>
              <Award className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-300 font-mono mt-1">
              {simulation.summary.annualizedRoiPercent}%
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] font-bold text-sky-200">
              <span>شهر الذروة: {simulation.summary.peakProfitMonth}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STRATEGY PRESETS & MARKET SCENARIOS SELECTOR TABS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Box 1: Strategy Presets */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>1. استراتيجية التسعير والتسويق المقترحة</span>
              </h3>
              <p className="text-xs text-slate-500">
                حدد النهج التكتيكي لاختبار سلوك المشترين والربحية
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {STRATEGY_PRESETS[selectedStrategyId].badge}
            </span>
          </div>

          {/* Strategy Presets Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.values(STRATEGY_PRESETS).map((strat) => (
              <button
                key={strat.id}
                onClick={() => handleSelectStrategy(strat.id)}
                id={`strategy-preset-${strat.id}`}
                className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedStrategyId === strat.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-slate-900">{strat.label}</span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: strat.color }} 
                  />
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {strat.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-bold pt-1 border-t border-slate-100/80">
                  <span className={strat.priceAdjustmentPercent >= 0 ? 'text-indigo-700' : 'text-red-600'}>
                    سعر: {strat.priceAdjustmentPercent > 0 ? `+${strat.priceAdjustmentPercent}%` : `${strat.priceAdjustmentPercent}%`}
                  </span>
                  <span className="text-sky-600">
                    جودة الصور: {strat.imageQualityScore}★
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Box 2: Market Scenario Presets & Timeline */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>2. توقعات حركة وتغيرات السوق المصري</span>
                </h3>
                <p className="text-xs text-slate-500">
                  اختبر مرونة أرباحك في المواسم والتقلبات الاقتصادية
                </p>
              </div>

              {/* Timeline duration toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setTimelineMonths(6)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timelineMonths === 6 ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  6 أشهر
                </button>
                <button
                  onClick={() => setTimelineMonths(12)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timelineMonths === 12 ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  12 شهراً
                </button>
              </div>
            </div>

            {/* Scenario Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(MARKET_SCENARIOS).map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen.id)}
                  id={`scenario-preset-${scen.id}`}
                  className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    selectedScenarioId === scen.id
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{scen.label}</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {scen.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100/80">
                    <span>تضخم الجملة: +{scen.cogsInflationRatePercent}%</span>
                    <span>ضغط المنافسين: -{scen.competitorPriceDropPercent}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>يتم احتساب تأثير تحسين الصور عبر استوديو AI لرفع معدل الشراء بنسبة تصل إلى +38%</span>
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC INTERACTIVE PARAMETER SLIDERS (تحكم دقيق ومخصص) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div 
          onClick={() => setIsParamSlidersExpanded(!isParamSlidersExpanded)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Alexandria']">
                لوحة الضبط التفاعلي المباشر (Interactive Simulator Controls)
              </h3>
              <p className="text-xs text-slate-500">
                حرك أشرطة التمرير لتغيير السعر، جودة الصور، والميزانية الإعلانية ورؤية النتيجة فوراً
              </p>
            </div>
          </div>

          <button className="text-slate-400 hover:text-slate-600 p-1">
            {isParamSlidersExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isParamSlidersExpanded && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Slider 1: Price Adjustment % */}
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">تعديل سعر البيع (%):</span>
                <span className={`font-mono font-black text-sm ${priceAdjustmentPercent >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                  {priceAdjustmentPercent > 0 ? `+${priceAdjustmentPercent}%` : `${priceAdjustmentPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                step="1"
                value={priceAdjustmentPercent}
                onChange={(e) => setPriceAdjustmentPercent(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>-20% (كسر حاد)</span>
                <span className="font-bold text-slate-700">{targetSimulatedPrice.toLocaleString()} {currency}</span>
                <span>+30% (فاخر)</span>
              </div>
            </div>

            {/* Slider 2: AI Studio Image Quality Score (1 to 5) */}
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">جودة الصور واستوديو AI:</span>
                <span className="font-mono font-black text-sm text-sky-600 flex items-center gap-1">
                  <span>{imageQualityScore}★</span>
                  <span className="text-[10px] text-emerald-600">(+{(imageQualityScore - 2) * 12}% تحويل)</span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={imageQualityScore}
                onChange={(e) => setImageQualityScore(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>1★ (صورة باهتة)</span>
                <span>3★ (عادية)</span>
                <span>5★ (استوديو AI متعدد الزوايا)</span>
              </div>
            </div>

            {/* Slider 3: Monthly Marketing / Sponsored Ads Budget */}
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">ميزانية الإعلانات الممولة:</span>
                <span className="font-mono font-black text-sm text-emerald-700">
                  {marketingSpendMonthly.toLocaleString()} {currency}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="250"
                value={marketingSpendMonthly}
                onChange={(e) => setMarketingSpendMonthly(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>0 ج.م</span>
                <span>5,000 ج.م</span>
                <span>10,000 ج.م</span>
              </div>
            </div>

            {/* Slider 4: Base Monthly Sales Volume (Units) */}
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">معدل البيع الشهري الحالي:</span>
                <span className="font-mono font-black text-sm text-blue-700">
                  {baseMonthlyUnits} قطعة/شهر
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={baseMonthlyUnits}
                onChange={(e) => setBaseMonthlyUnits(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>10 قطع</span>
                <span>100 قطعة</span>
                <span>250 قطعة</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. PREDICTIVE RECHARTS GRAPHICAL CHARTS SECTION */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* Chart View Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>الرسوم البيانية التنبؤية للأرباح والمبيعات ({timelineMonths} أشهر)</span>
            </h3>
            <p className="text-xs text-slate-500">
              محاكاة حركة التدفقات النقدية ومقارنة السيناريوهات التكتيكية بدقة
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartView('monthly_revenue_profit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartView === 'monthly_revenue_profit' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الإيراد وصافي الربح الشهري 📊
            </button>
            <button
              onClick={() => setActiveChartView('cumulative_comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartView === 'cumulative_comparison' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مقارنة الاستراتيجيات التراكمية 📈
            </button>
            <button
              onClick={() => setActiveChartView('price_sensitivity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartView === 'price_sensitivity' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مصفوفة حساسية السعر 🎯
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CHART 1: Monthly Projected Revenue & Net Profit Area Chart */}
        {/* ======================================================== */}
        {activeChartView === 'monthly_revenue_profit' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>مسار المبيعات التنبؤية (GMV)، تكاليف البضاعة، وصافي الربح الشهري</span>
              <span className="font-bold text-emerald-600">هامش الربح الصافي المتوسط: {simulation.summary.averageProfitMarginPercent}%</span>
            </div>

            <div className="h-80 w-full min-w-0" dir="ltr">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={50}>
                <AreaChart data={simulation.monthlyProjections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.85}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number | string | Array<number | string> | undefined, name: string | number | undefined) => [
                      `${Number(value || 0).toLocaleString()} ${currency}`, 
                      name === 'revenueEGP' ? 'إجمالي الإيرادات' : name === 'netProfitEGP' ? 'صافي الربح' : name === 'cogsEGP' ? 'تكلفة البضاعة' : name
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Legend 
                    formatter={(val) => val === 'revenueEGP' ? 'إجمالي المبيعات (GMV)' : val === 'netProfitEGP' ? 'صافي الأرباح المحققة' : val === 'cogsEGP' ? 'تكلفة الجملة' : val}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Area type="monotone" dataKey="revenueEGP" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="revenueEGP" />
                  <Area type="monotone" dataKey="netProfitEGP" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="netProfitEGP" />
                  <Line type="monotone" dataKey="cogsEGP" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" name="cogsEGP" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CHART 2: Cumulative Net Profit Comparison Multi-Line Chart */}
        {/* ======================================================== */}
        {activeChartView === 'cumulative_comparison' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>مقارنة الأرباح الصافية التراكمية عبر أشهر المحاكاة بين مختلف الاستراتيجيات</span>
              <span className="font-bold text-indigo-600">استراتيجية الصور الفاخرة تحقق أعلى عائد تراكمي 💎</span>
            </div>

            <div className="h-80 w-full min-w-0" dir="ltr">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={50}>
                <LineChart data={simulation.monthlyProjections} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number | string | Array<number | string> | undefined, name: string | number | undefined) => [
                      `${Number(value || 0).toLocaleString()} ${currency}`, 
                      name === 'premiumCumulativeProfit' ? 'رفع السعر + صور AI' : name === 'undercutCumulativeProfit' ? 'كسر السعر' : name === 'balancedCumulativeProfit' ? 'نمو متوازن' : 'الوضع الحالي'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Legend 
                    formatter={(val) => 
                      val === 'premiumCumulativeProfit' ? '💎 رفع السعر + صور استوديو AI' :
                      val === 'undercutCumulativeProfit' ? '⚡ كسر السعر والاستحواذ على Buy Box' :
                      val === 'balancedCumulativeProfit' ? '⚖️ النمو المتوازن وإعلانات المنصة' :
                      'الوضع الحالي (Status Quo)'
                    }
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Line type="monotone" dataKey="premiumCumulativeProfit" stroke="#6366F1" strokeWidth={3.5} dot={{ r: 4, fill: '#6366F1' }} name="premiumCumulativeProfit" />
                  <Line type="monotone" dataKey="balancedCumulativeProfit" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} name="balancedCumulativeProfit" />
                  <Line type="monotone" dataKey="undercutCumulativeProfit" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: '#EF4444' }} name="undercutCumulativeProfit" />
                  <Line type="monotone" dataKey="baselineCumulativeProfit" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" name="baselineCumulativeProfit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CHART 3: Sensitivity Matrix Bar Chart (Finding the Sweet Spot) */}
        {/* ======================================================== */}
        {activeChartView === 'price_sensitivity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>مصفوفة حساسية تغير السعر (-15% إلى +20%) وتأثيرها على مجمل الأرباح الصافية</span>
              <span className="font-bold text-sky-600">نقطة التسعير الذهبية تقع بين (+10% و +12%) مع تحسين الصور</span>
            </div>

            <div className="h-80 w-full min-w-0" dir="ltr">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={50}>
                <BarChart data={simulation.sensitivityMatrix} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="priceDelta" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    stroke="#cbd5e1" 
                    tickFormatter={(v) => v > 0 ? `+${v}%` : `${v}%`}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number | string | Array<number | string> | undefined) => [
                      `${Number(value || 0).toLocaleString()} ${currency}`, 
                      'صافي الربح المتوقع'
                    ]}
                    labelFormatter={(label) => `نسبة تعديل السعر: ${Number(label) > 0 ? `+${label}%` : `${label}%`}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Bar 
                    dataKey="projectedNetProfitEGP" 
                    fill="#6366F1" 
                    radius={[8, 8, 0, 0]} 
                    name="صافي الربح المتوقع"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. AI STRATEGIC EXECUTIVE ANALYSIS & ACTIONABLE TOOLS */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Sparkles className="w-4 h-4 text-sky-300" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                التحليل الاستراتيجي التنفيذي والخطوات الفورية (AI Executive Playbook)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              توصيات خوارزمية تسعير السوق المصري لتعظيم هوامش الأرباح وتجنب حرب الأسعار
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="h-9 px-3 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'تم النسخ' : 'نسخ الخلاصة'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة واتساب 📲</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>

        {/* AI Analysis Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Executive Verdict */}
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-2">
            <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>الخلاصة التنفيذية للأرباح:</span>
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {simulation.aiInsights.executiveVerdict}
            </p>
          </div>

          {/* Card 2: Strategic Advantage */}
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-2">
            <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>الميزة التنافسية المحققة:</span>
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {simulation.aiInsights.strategicAdvantage}
            </p>
          </div>

          {/* Card 3: Risk Factor & Mitigation */}
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-2">
            <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-sky-600" />
              <span>إدارة المخاطر والتنبيهات:</span>
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {simulation.aiInsights.keyRiskFactor}
            </p>
          </div>

        </div>

        {/* Direct Action Launch Bar */}
        <div className="p-4 bg-white rounded-2xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <Target className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                جاهز لتنفيذ هذه الاستراتيجية على أرض الواقع؟
              </h4>
              <p className="text-[11px] text-slate-500">
                السعر المقترح: <strong>{targetSimulatedPrice.toLocaleString()} {currency}</strong> | زيادة متوقعة: <strong>+{simulation.summary.profitGainVsBaselineEGP.toLocaleString()} {currency}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenImageStudio && (
              <button
                onClick={() => onOpenImageStudio(activeProduct)}
                className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-purple-200" />
                <span>توليد صور استوديو AI لهذا المنتج 📸</span>
              </button>
            )}

            <button
              onClick={handleApplyPriceToStore}
              id="apply-simulated-price-btn"
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>اعتماد السعر ({targetSimulatedPrice.toLocaleString()} {currency}) فوراً ⚡</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. MONTHLY PROJECTION BREAKDOWN DATA TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>جدول البيانات المالية والتدفقات النقدية الشهرية المفصلة</span>
            </h3>
            <p className="text-xs text-slate-500">
              تفصيل الإيرادات والمصاريف وصافي الأرباح التراكمية شهراً بشهر
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500">
            العملة المعتمدة: {currency}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black">
                <th className="py-3 px-3.5 rounded-r-xl">الشهر</th>
                <th className="py-3 px-3.5">القطع المباعة</th>
                <th className="py-3 px-3.5">الإيرادات (GMV)</th>
                <th className="py-3 px-3.5">تكلفة الجملة</th>
                <th className="py-3 px-3.5">عمولات المنصة والشحن</th>
                <th className="py-3 px-3.5">التسويق الممكّن</th>
                <th className="py-3 px-3.5">صافي الربح الشهري</th>
                <th className="py-3 px-3.5">الربح التراكمي</th>
                <th className="py-3 px-3.5 rounded-l-xl">هامش الربح %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {simulation.monthlyProjections.map((m) => (
                <tr key={m.monthIndex} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-black text-slate-900">{m.monthLabel}</td>
                  <td className="py-3 px-3.5 font-mono">{m.unitSales} قطعة</td>
                  <td className="py-3 px-3.5 font-mono font-bold">{m.revenueEGP.toLocaleString()} {currency}</td>
                  <td className="py-3 px-3.5 font-mono text-slate-500">-{m.cogsEGP.toLocaleString()} {currency}</td>
                  <td className="py-3 px-3.5 font-mono text-red-600">-{m.platformFeesEGP.toLocaleString()} {currency}</td>
                  <td className="py-3 px-3.5 font-mono text-slate-600">-{m.marketingCostEGP.toLocaleString()} {currency}</td>
                  <td className="py-3 px-3.5 font-mono font-black text-emerald-700">+{m.netProfitEGP.toLocaleString()} {currency}</td>
                  <td className="py-3 px-3.5 font-mono font-bold text-indigo-700">+{m.cumulativeNetProfitEGP.toLocaleString()} {currency}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold font-mono">
                      {m.profitMarginPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
