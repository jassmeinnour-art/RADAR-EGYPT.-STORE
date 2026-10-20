import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calculator, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  Package, 
  Truck, 
  Sparkles, 
  HelpCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  SlidersHorizontal,
  RefreshCw,
  Building2,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  ExternalLink,
  X,
  Store,
  Check
} from 'lucide-react';
import { ProductData } from '../types';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface ProfitMarginCalculatorProps {
  product: ProductData;
  currency: string;
  winningPrice: number;
  selectedDiscount: number;
  onApplyCustomPrice?: (price: number) => void;
  onShowToast?: (msg: string) => void;
}

export const ProfitMarginCalculator: React.FC<ProfitMarginCalculatorProps> = ({
  product,
  currency,
  winningPrice,
  selectedDiscount,
  onApplyCustomPrice,
  onShowToast,
}) => {
  // Base Inputs State
  const [wholesaleCost, setWholesaleCost] = useState<number>(product?.estimatedWholesaleCost || 2000);
  const [selectedPlatform, setSelectedPlatform] = useState<'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'direct_store' | 'custom'>('amazon_eg');
  const [customCommissionPercent, setCustomCommissionPercent] = useState<number>(12);
  const [shippingFee, setShippingFee] = useState<number>(35);
  const [packagingFee, setPackagingFee] = useState<number>(15);
  const [returnRiskBufferPercent, setReturnRiskBufferPercent] = useState<number>(3); // 3% buffer for return costs
  const [customSellingPrice, setCustomSellingPrice] = useState<number>(winningPrice);
  const [selectedScenario, setSelectedScenario] = useState<'winning' | 'match_lowest' | 'average' | 'custom'>('winning');
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'periodic_reports'>('calculator');
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Synchronize wholesale cost if product changes
  useEffect(() => {
    if (product?.estimatedWholesaleCost) {
      setWholesaleCost(product.estimatedWholesaleCost);
    }
  }, [product?.id, product?.estimatedWholesaleCost]);

  // Platform Preset Profiles
  const platformPresets = {
    amazon_eg: {
      name: 'أمازون مصر (FBA / Easy Ship)',
      commissionPercent: 12.0,
      shippingFee: 35,
      packagingFee: 15,
      badge: 'عمولة 12% + شحن 35 ج.م',
      icon: '📦',
      color: 'border-sky-500 bg-sky-50/50 text-sky-900',
    },
    noon_eg: {
      name: 'نون مصر (FBN Express)',
      commissionPercent: 13.5,
      shippingFee: 40,
      packagingFee: 15,
      badge: 'عمولة 13.5% + شحن 40 ج.م',
      icon: '🟡',
      color: 'border-sky-500 bg-sky-50/50 text-sky-900',
    },
    jumia_eg: {
      name: 'جوميا مصر (Jumia Express)',
      commissionPercent: 10.0,
      shippingFee: 30,
      packagingFee: 10,
      badge: 'عمولة 10% + شحن 30 ج.م',
      icon: '⭐',
      color: 'border-orange-500 bg-orange-50/50 text-orange-900',
    },
    direct_store: {
      name: 'متجر خاص / سوشيال ميديا (سلة - شوبيفاي)',
      commissionPercent: 3.0, // payment gateway fee
      shippingFee: 55, // 3rd party courier
      packagingFee: 20,
      badge: 'بوابة دفع 3% + بوليصة 55 ج.م',
      icon: '🛍️',
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
    custom: {
      name: 'تخصيص يدوي حر',
      commissionPercent: customCommissionPercent,
      shippingFee: shippingFee,
      packagingFee: packagingFee,
      badge: 'رسوم مخصصة',
      icon: '⚙️',
      color: 'border-indigo-500 bg-indigo-50/50 text-indigo-900',
    }
  };

  // Change Platform Presets
  const handleSelectPlatform = (key: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'direct_store' | 'custom') => {
    setSelectedPlatform(key);
    if (key !== 'custom') {
      setCustomCommissionPercent(platformPresets[key].commissionPercent);
      setShippingFee(platformPresets[key].shippingFee);
      setPackagingFee(platformPresets[key].packagingFee);
    }
  };

  // Effective commission
  const effectiveCommissionPercent = selectedPlatform === 'custom' 
    ? customCommissionPercent 
    : platformPresets[selectedPlatform].commissionPercent;

  // Pricing Scenarios
  const lowestMarketPrice = product?.currentLowestPrice || 2500;
  const averageMarketPrice = product?.averagePrice || 2750;
  const highestMarketPrice = product?.highestPrice || 3200;

  // Active selling price based on chosen scenario
  const effectiveSellingPrice = useMemo(() => {
    switch (selectedScenario) {
      case 'winning':
        return winningPrice;
      case 'match_lowest':
        return lowestMarketPrice;
      case 'average':
        return averageMarketPrice;
      case 'custom':
        return customSellingPrice > 0 ? customSellingPrice : winningPrice;
      default:
        return winningPrice;
    }
  }, [selectedScenario, winningPrice, lowestMarketPrice, averageMarketPrice, customSellingPrice]);

  // Calculations
  const calculations = useMemo(() => {
    const sellingPrice = effectiveSellingPrice;
    const commissionAmount = Math.round((sellingPrice * effectiveCommissionPercent) / 100);
    const returnRiskAmount = Math.round((sellingPrice * returnRiskBufferPercent) / 100);
    const totalPlatformOperationalFees = commissionAmount + shippingFee + packagingFee + returnRiskAmount;
    
    const totalCostPerUnit = wholesaleCost + totalPlatformOperationalFees;
    const netProfit = sellingPrice - totalCostPerUnit;
    const netProfitMarginPercent = sellingPrice > 0 ? Math.round((netProfit / sellingPrice) * 1000) / 10 : 0;
    const returnOnInvestmentROI = wholesaleCost > 0 ? Math.round((netProfit / wholesaleCost) * 1000) / 10 : 0;

    // Break-even Selling Price (السعر الذي عنده صافي الربح = 0)
    const variablePercentDecimal = (effectiveCommissionPercent + returnRiskBufferPercent) / 100;
    const fixedCosts = wholesaleCost + shippingFee + packagingFee;
    const breakEvenPrice = variablePercentDecimal < 1 
      ? Math.ceil(fixedCosts / (1 - variablePercentDecimal)) 
      : fixedCosts;

    // Volume Projected Profits
    const profit10Units = netProfit * 10;
    const profit50Units = netProfit * 50;
    const profit100Units = netProfit * 100;

    return {
      sellingPrice,
      commissionAmount,
      returnRiskAmount,
      totalPlatformOperationalFees,
      totalCostPerUnit,
      netProfit,
      netProfitMarginPercent,
      returnOnInvestmentROI,
      breakEvenPrice,
      profit10Units,
      profit50Units,
      profit100Units,
    };
  }, [effectiveSellingPrice, wholesaleCost, effectiveCommissionPercent, shippingFee, packagingFee, returnRiskBufferPercent]);

  // Periodic Historical & Forecast Performance Data (Weekly / Monthly / Quarterly)
  const periodicReportData = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const reportRefCode = `REP-${product.id.toUpperCase()}-${Date.now().toString().slice(-4)}`;

    if (reportPeriod === 'weekly') {
      return {
        title: 'تقرير الأداء الربحي الأسبوعي',
        subtitle: 'تحليل الأداء لآخر 4 أسابيع مع توقعات الأسبوع القادم',
        periodLabel: 'أسبوعي (Weekly Performance Brief)',
        reportRefCode,
        generatedDate: todayStr,
        expectedUnitsSold: 38,
        expectedGrossRevenue: calculations.sellingPrice * 38,
        expectedNetProfit: calculations.netProfit * 38,
        timeline: [
          { period: 'الأسبوع 1', avgPrice: lowestMarketPrice + 120, merchantPrice: calculations.sellingPrice, unitsSold: 28, netProfit: calculations.netProfit * 28, winRate: '75%' },
          { period: 'الأسبوع 2', avgPrice: lowestMarketPrice + 80, merchantPrice: calculations.sellingPrice, unitsSold: 32, netProfit: calculations.netProfit * 32, winRate: '82%' },
          { period: 'الأسبوع 3', avgPrice: lowestMarketPrice + 40, merchantPrice: calculations.sellingPrice, unitsSold: 36, netProfit: calculations.netProfit * 36, winRate: '88%' },
          { period: 'الأسبوع الحالي', avgPrice: lowestMarketPrice, merchantPrice: calculations.sellingPrice, unitsSold: 42, netProfit: calculations.netProfit * 42, winRate: '92%' },
        ],
        healthScore: calculations.netProfitMarginPercent >= 20 ? 'ممتاز 🟢' : calculations.netProfitMarginPercent >= 10 ? 'جيد 🟡' : 'حرج 🔴',
        keyTakeaway: `بسعر بيع ${calculations.sellingPrice.toLocaleString()} ${currency} وهامش ربح ${calculations.netProfitMarginPercent}%، التوقع الأسبوعي هو تحقيق صافي ربح قدره ${(calculations.netProfit * 38).toLocaleString()} ${currency} عند بيع 38 قطعة.`
      };
    } else if (reportPeriod === 'monthly') {
      return {
        title: 'تقرير الأداء الربحي الشهري',
        subtitle: 'تحليل شهري للمبيعات وتدفقات الأرباح الصافية',
        periodLabel: 'شهري (Monthly Financial Analysis)',
        reportRefCode,
        generatedDate: todayStr,
        expectedUnitsSold: 160,
        expectedGrossRevenue: calculations.sellingPrice * 160,
        expectedNetProfit: calculations.netProfit * 160,
        timeline: [
          { period: 'مايو 2026', avgPrice: lowestMarketPrice + 150, merchantPrice: calculations.sellingPrice, unitsSold: 120, netProfit: calculations.netProfit * 120, winRate: '78%' },
          { period: 'يونيو 2026', avgPrice: lowestMarketPrice + 90, merchantPrice: calculations.sellingPrice, unitsSold: 145, netProfit: calculations.netProfit * 145, winRate: '84%' },
          { period: 'يوليو 2026', avgPrice: lowestMarketPrice + 30, merchantPrice: calculations.sellingPrice, unitsSold: 155, netProfit: calculations.netProfit * 155, winRate: '89%' },
          { period: 'أغسطس 2026 (توقع)', avgPrice: lowestMarketPrice, merchantPrice: calculations.sellingPrice, unitsSold: 175, netProfit: calculations.netProfit * 175, winRate: '94%' },
        ],
        healthScore: calculations.netProfitMarginPercent >= 20 ? 'ممتاز 🟢' : 'مقبول 🟡',
        keyTakeaway: `التوقع الشهري الإجمالي لمنتج (${product.brand} ${product.model}): تحقيق مبيعات بـ ${(calculations.sellingPrice * 160).toLocaleString()} ${currency} وأرباح صافية ${(calculations.netProfit * 160).toLocaleString()} ${currency}.`
      };
    } else {
      return {
        title: 'تقرير الأداء الربحي الربع سنوي (Q3 2026)',
        subtitle: 'توقعات الربع السنوي ومعدل دوران المخزون ورأس المال',
        periodLabel: 'ربع سنوي (Quarterly Capital Growth)',
        reportRefCode,
        generatedDate: todayStr,
        expectedUnitsSold: 520,
        expectedGrossRevenue: calculations.sellingPrice * 520,
        expectedNetProfit: calculations.netProfit * 520,
        timeline: [
          { period: 'الربع الأول Q1', avgPrice: lowestMarketPrice + 200, merchantPrice: calculations.sellingPrice, unitsSold: 380, netProfit: calculations.netProfit * 380, winRate: '72%' },
          { period: 'الربع الثاني Q2', avgPrice: lowestMarketPrice + 100, merchantPrice: calculations.sellingPrice, unitsSold: 460, netProfit: calculations.netProfit * 460, winRate: '83%' },
          { period: 'الربع الثالث Q3 (جاري)', avgPrice: lowestMarketPrice, merchantPrice: calculations.sellingPrice, unitsSold: 540, netProfit: calculations.netProfit * 540, winRate: '91%' },
        ],
        healthScore: 'عالي الاستقرار 📈',
        keyTakeaway: `العائد التراكمي المتوقع على رأس المال (ROI) لهذا المنتج خلال الربع السنوي يتجاوز ${calculations.returnOnInvestmentROI * 3}% مع سرعة دوران ممتازة.`
      };
    }
  }, [reportPeriod, calculations, lowestMarketPrice, product, currency]);

  // Quick reset wholesale price
  const handleResetWholesale = () => {
    setWholesaleCost(product.estimatedWholesaleCost);
    if (onShowToast) onShowToast('تمت استعادة سعر الجملة المقدر بنجاح');
  };

  // Direct PDF Export / Print Handler
  const handleExportPDF = () => {
    if (onShowToast) onShowToast('جاري فتح نافذة تصدير التقرير وحفظه كـ PDF...');
    window.print();
  };

  // Copy Executive Report Summary to Clipboard for Team Sharing
  const handleCopyTeamSummary = () => {
    const summaryText = `📊 تقرير الأداء الربحي والمنافسين الرسمي
المنتج: ${product.brand} - ${product.model}
الفترة: ${periodicReportData.title} (${periodicReportData.generatedDate})
المرجع: ${periodicReportData.reportRefCode}
----------------------------------------
💰 سعر البيع المعتمد: ${calculations.sellingPrice.toLocaleString()} ${currency}
📦 تكلفة الشراء من الجملة: ${wholesaleCost.toLocaleString()} ${currency}
🏷️ عمولة المنصة (${effectiveCommissionPercent}%): ${calculations.commissionAmount.toLocaleString()} ${currency}
🚚 رسوم الشحن والتغليف: ${shippingFee + packagingFee} ${currency}
----------------------------------------
✨ صافي الربح للقطعة: +${calculations.netProfit.toLocaleString()} ${currency} (هامش ${calculations.netProfitMarginPercent}%)
📈 العائد على رأس المال (ROI): ${calculations.returnOnInvestmentROI}%
🛡️ نقطة التعادل الأدنى: ${calculations.breakEvenPrice.toLocaleString()} ${currency}
🎯 التوقع الدوري (${periodicReportData.expectedUnitsSold} قطعة): إجمالي ربح +${periodicReportData.expectedNetProfit.toLocaleString()} ${currency}
----------------------------------------
💡 التوصية الاستراتيجية: ${periodicReportData.keyTakeaway}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    if (onShowToast) onShowToast('تم نسخ ملخص التقرير المالي لمشاركته مع فريق العمل 📋');
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`*تقرير الأداء المالي والمنافسين (${product.brand} ${product.model})* 📊\n\n• سعر البيع: ${calculations.sellingPrice.toLocaleString()} ${currency}\n• صافي ربح القطعة: +${calculations.netProfit.toLocaleString()} ${currency} (${calculations.netProfitMarginPercent}%)\n• الأرباح المتوقعة: +${periodicReportData.expectedNetProfit.toLocaleString()} ${currency}\n• نقطة التعادل: ${calculations.breakEvenPrice.toLocaleString()} ${currency}\n\n_صادر رسمياً عبر نظام رادار التسعير الذكي_`);
    safeOpenUrl(`https://wa.me/?text=${text}`);
  };

  return (
    <div className="bg-white border-2 border-indigo-200/90 rounded-3xl p-5 sm:p-7 shadow-md space-y-6 relative overflow-hidden" id="profit-margin-calculator-section">
      
      {/* Top Header & Accordion Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-black flex items-center gap-1 shadow-xs">
              <Calculator className="w-3.5 h-3.5" />
              <span>آلة حاسبة لهامش الربح والرسوم التشغيلية</span>
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              محاكاة أسواق أمازون ونون مصر
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
            حاسبة صافي الأرباح، نقطة التعادل، والرسوم التشغيلية لكل سيناريو تسعير
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl">
            أدخل تكلفة شراء الجملة والرسوم التشغيلية لمنصتك (أمازون / نون / جوميا) لحساب صافي الربح الفعلي، هامش الربح %، وتوليد تقارير الأداء الدورية وتصديرها كـ PDF رسمي.
          </p>
        </div>

        {/* Sub Navigation: Calculator vs Periodic Reports */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('calculator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'calculator'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>الحاسبة والسيناريوهات</span>
            </button>
            <button
              onClick={() => setActiveSubTab('periodic_reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'periodic_reports'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>تقارير الأداء الدورية 📊</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title={isExpanded ? 'طي الحاسبة' : 'توسيع الحاسبة'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* TAB 1: CALCULATOR & SCENARIOS */}
          {activeSubTab === 'calculator' && (
            <div className="space-y-6">
              
              {/* Inputs Grid: 1. Wholesale Cost, 2. Platform Profile, 3. Operational Fees */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* 1. Wholesale Purchase Cost (سعر شراء الجملة) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>1. تكلفة الشراء من الجملة</span>
                    </label>
                    <button
                      onClick={handleResetWholesale}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      استعادة المقدر ({product.estimatedWholesaleCost} {currency})
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={wholesaleCost}
                      onChange={(e) => setWholesaleCost(Math.max(0, Number(e.target.value)))}
                      className="w-full h-11 pr-4 pl-14 rounded-xl bg-white border border-slate-300 text-sm font-black text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-mono transition-all"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {currency}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    السعر النقدي الفعلي للقطعة من شارع عبد العزيز، العتبة، أو مول البستان.
                  </p>
                </div>

                {/* 2. Platform Profile Selection (منصة البيع والعمولة) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-600" />
                      <span>2. منصة البيع وعمولتها</span>
                    </label>
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                      {effectiveCommissionPercent}% عمولة
                    </span>
                  </div>

                  <select
                    value={selectedPlatform}
                    onChange={(e) => handleSelectPlatform(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer transition-all"
                  >
                    <option value="amazon_eg">📦 أمازون مصر FBA (عمولة 12% + شحن 35 ج.م)</option>
                    <option value="noon_eg">🟡 نون مصر FBN (عمولة 13.5% + شحن 40 ج.م)</option>
                    <option value="jumia_eg">⭐ جوميا مصر Express (عمولة 10% + شحن 30 ج.م)</option>
                    <option value="direct_store">🛍️ متجر خاص / شوبيفاي (بوابة 3% + شحن 55 ج.م)</option>
                    <option value="custom">⚙️ تخصيص يدوي للرسوم</option>
                  </select>

                  {selectedPlatform === 'custom' && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-600 font-bold shrink-0">نسبة العمولة:</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          step={0.5}
                          value={customCommissionPercent}
                          onChange={(e) => setCustomCommissionPercent(Number(e.target.value))}
                          className="w-full h-8 px-2 pr-7 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 font-mono"
                        />
                        <Percent className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 leading-snug">
                    خصم العمولة يتم احتسابه كنسبة مئوية من سعر البيع النهائي للزبون.
                  </p>
                </div>

                {/* 3. Operational, Shipping & Packaging Fees */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>3. مصاريف الشحن والتغليف</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                      إجمالي: {shippingFee + packagingFee} {currency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-1">الشحن والمعالجة:</span>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={shippingFee}
                          onChange={(e) => {
                            setSelectedPlatform('custom');
                            setShippingFee(Math.max(0, Number(e.target.value)));
                          }}
                          className="w-full h-8 px-2 pr-3 pl-8 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 font-mono"
                        />
                        <span className="text-[9px] absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 font-sans">ج.م</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-1">الكرتون والتغليف:</span>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={packagingFee}
                          onChange={(e) => {
                            setSelectedPlatform('custom');
                            setPackagingFee(Math.max(0, Number(e.target.value)));
                          }}
                          className="w-full h-8 px-2 pr-3 pl-8 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 font-mono"
                        />
                        <span className="text-[9px] absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 font-sans">ج.م</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] text-slate-500">
                    <span>مخصص مرتجعات (3%):</span>
                    <strong className="font-mono text-slate-700">{calculations.returnRiskAmount} {currency}</strong>
                  </div>
                </div>

              </div>

              {/* Pricing Scenarios Selector: 4 Comparative Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    <span>اختر سيناريو التسعير للمقارنة الفورية:</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    السعر المختار حالياً: <strong className="text-indigo-600 font-mono">{calculations.sellingPrice.toLocaleString()} {currency}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Scenario 1: Proposed Winning Price (Undercut) */}
                  <div
                    onClick={() => setSelectedScenario('winning')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative space-y-2 ${
                      selectedScenario === 'winning'
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                        الرابح (Buy Box) ⭐
                      </span>
                      {selectedScenario === 'winning' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">سعر البيع المقترح:</div>
                      <div className="text-xl font-black text-emerald-700 font-mono">
                        {winningPrice.toLocaleString()} <span className="text-xs font-bold">{currency}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 pt-1 border-t border-emerald-100 flex items-center justify-between">
                      <span>صافي الربح:</span>
                      <strong className="text-emerald-800 font-mono">
                        +{((winningPrice - wholesaleCost - Math.round((winningPrice * effectiveCommissionPercent) / 100) - shippingFee - packagingFee - Math.round((winningPrice * returnRiskBufferPercent) / 100))).toLocaleString()} {currency}
                      </strong>
                    </div>
                  </div>

                  {/* Scenario 2: Match Lowest Competitor Price */}
                  <div
                    onClick={() => setSelectedScenario('match_lowest')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative space-y-2 ${
                      selectedScenario === 'match_lowest'
                        ? 'bg-sky-50/80 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-black">
                        مطابقة أقل منافس
                      </span>
                      {selectedScenario === 'match_lowest' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">سعر السوق الأرخص:</div>
                      <div className="text-xl font-black text-sky-800 font-mono">
                        {lowestMarketPrice.toLocaleString()} <span className="text-xs font-bold">{currency}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 pt-1 border-t border-sky-100 flex items-center justify-between">
                      <span>صافي الربح:</span>
                      <strong className="text-sky-900 font-mono">
                        +{((lowestMarketPrice - wholesaleCost - Math.round((lowestMarketPrice * effectiveCommissionPercent) / 100) - shippingFee - packagingFee - Math.round((lowestMarketPrice * returnRiskBufferPercent) / 100))).toLocaleString()} {currency}
                      </strong>
                    </div>
                  </div>

                  {/* Scenario 3: Market Average Price */}
                  <div
                    onClick={() => setSelectedScenario('average')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative space-y-2 ${
                      selectedScenario === 'average'
                        ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-black">
                        متوسط السوق العام
                      </span>
                      {selectedScenario === 'average' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">متوسط المنصات:</div>
                      <div className="text-xl font-black text-blue-800 font-mono">
                        {averageMarketPrice.toLocaleString()} <span className="text-xs font-bold">{currency}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 pt-1 border-t border-blue-100 flex items-center justify-between">
                      <span>صافي الربح:</span>
                      <strong className="text-blue-900 font-mono">
                        +{((averageMarketPrice - wholesaleCost - Math.round((averageMarketPrice * effectiveCommissionPercent) / 100) - shippingFee - packagingFee - Math.round((averageMarketPrice * returnRiskBufferPercent) / 100))).toLocaleString()} {currency}
                      </strong>
                    </div>
                  </div>

                  {/* Scenario 4: Custom Price Input */}
                  <div
                    onClick={() => setSelectedScenario('custom')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative space-y-2 ${
                      selectedScenario === 'custom'
                        ? 'bg-purple-50/80 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-black">
                        تسعير مخصص يدوي
                      </span>
                      {selectedScenario === 'custom' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold">أدخل سعرك المخصص:</div>
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          step={10}
                          value={customSellingPrice}
                          onChange={(e) => {
                            setSelectedScenario('custom');
                            setCustomSellingPrice(Number(e.target.value));
                          }}
                          className="w-full h-8 px-2 pr-2 pl-8 rounded-lg bg-white border border-purple-300 text-xs font-black text-purple-950 font-mono"
                        />
                        <span className="text-[9px] absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-sans">ج.م</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 pt-1 border-t border-purple-100 flex items-center justify-between">
                      <span>صافي الربح:</span>
                      <strong className="text-purple-900 font-mono">
                        +{((customSellingPrice - wholesaleCost - Math.round((customSellingPrice * effectiveCommissionPercent) / 100) - shippingFee - packagingFee - Math.round((customSellingPrice * returnRiskBufferPercent) / 100))).toLocaleString()} {currency}
                      </strong>
                    </div>
                  </div>

                </div>
              </div>

              {/* Master Output Banner: Net Profit Breakdown & KPIs */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-500/30 space-y-5">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      النتائج الحسابية النهائية للسيناريو المختار
                    </span>
                    <h4 className="text-lg font-black text-white font-['Alexandria']">
                      سعر بيع: {calculations.sellingPrice.toLocaleString()} {currency} ({platformPresets[selectedPlatform].name})
                    </h4>
                  </div>

                  {/* Apply Custom Price to Main Listing */}
                  {onApplyCustomPrice && (
                    <button
                      onClick={() => onApplyCustomPrice(calculations.sellingPrice)}
                      className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد هذا السعر في الرادار ({calculations.sellingPrice.toLocaleString()} {currency})</span>
                    </button>
                  )}
                </div>

                {/* 4 Core KPI Blocks */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* KPI 1: Net Profit in EGP */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
                    <span className="text-[11px] text-slate-300 font-bold block">صافي الربح الفعلي للقطعة</span>
                    <div className={`text-2xl sm:text-3xl font-black font-mono ${calculations.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {calculations.netProfit >= 0 ? `+${calculations.netProfit.toLocaleString()}` : calculations.netProfit.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{currency} صافي بعد خصم كل الرسوم</span>
                  </div>

                  {/* KPI 2: Net Profit Margin % */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
                    <span className="text-[11px] text-slate-300 font-bold block">هامش الربح الصافي</span>
                    <div className={`text-2xl sm:text-3xl font-black font-mono ${calculations.netProfitMarginPercent >= 15 ? 'text-emerald-400' : calculations.netProfitMarginPercent >= 5 ? 'text-sky-300' : 'text-rose-400'}`}>
                      {calculations.netProfitMarginPercent}%
                    </div>
                    <span className="text-[10px] text-slate-400 block">من إجمالي سعر البيع</span>
                  </div>

                  {/* KPI 3: Return on Investment (ROI %) */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
                    <span className="text-[11px] text-slate-300 font-bold block">العائد على رأس المال (ROI)</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-300">
                      {calculations.returnOnInvestmentROI}%
                    </div>
                    <span className="text-[10px] text-slate-400 block">نسبة الربح لتكلفة الشراء</span>
                  </div>

                  {/* KPI 4: Break-even Price (نقطة التعادل) */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
                    <span className="text-[11px] text-slate-300 font-bold block">نقطة التعادل (Break-Even)</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-sky-300">
                      {calculations.breakEvenPrice.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{currency} (أدنى سعر لتفادي الخسارة)</span>
                  </div>

                </div>

                {/* Financial Breakdown Table (Cost Waterfall) */}
                <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-300 pb-2 border-b border-white/10 flex items-center justify-between">
                    <span>تفصيل خصم التكاليف من سعر البيع ({calculations.sellingPrice.toLocaleString()} {currency}):</span>
                    <span>النسبة من السعر</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>تكلفة شراء الجملة من المورد:</span>
                    </span>
                    <span className="font-mono text-white font-bold">{wholesaleCost.toLocaleString()} {currency} ({Math.round((wholesaleCost / (calculations.sellingPrice || 1)) * 100)}%)</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>عمولة المنصة ({effectiveCommissionPercent}%):</span>
                    </span>
                    <span className="font-mono text-white font-bold">{calculations.commissionAmount.toLocaleString()} {currency} ({effectiveCommissionPercent}%)</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>رسوم الشحن والتوصيل الداخلي:</span>
                    </span>
                    <span className="font-mono text-white font-bold">{shippingFee.toLocaleString()} {currency}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>تجهيز، كرتون، ومخصص مرتجعات:</span>
                    </span>
                    <span className="font-mono text-white font-bold">{(packagingFee + calculations.returnRiskAmount).toLocaleString()} {currency}</span>
                  </div>

                  <div className="flex items-center justify-between text-emerald-400 font-bold pt-2 border-t border-white/10 text-sm">
                    <span>= صافي الربح المتبقي في جيب التاجر:</span>
                    <span className="font-mono text-base font-black">+{calculations.netProfit.toLocaleString()} {currency} ({calculations.netProfitMarginPercent}%)</span>
                  </div>
                </div>

                {/* Projected Volume Tier Profit Earnings */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-300 block mb-2">توقعات إجمالي الأرباح عند زيادة حجم المبيعات:</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400">بيع 10 قطع</div>
                      <div className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">
                        +{calculations.profit10Units.toLocaleString()} {currency}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400">بيع 50 قطعة</div>
                      <div className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">
                        +{calculations.profit50Units.toLocaleString()} {currency}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400">بيع 100 قطعة</div>
                      <div className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">
                        +{calculations.profit100Units.toLocaleString()} {currency}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PERIODIC PERFORMANCE REPORTS (تقارير الأداء الدورية) */}
          {activeSubTab === 'periodic_reports' && (
            <div className="space-y-6" id="periodic-performance-report-view">
              
              {/* Controls for Periodic Reports (Weekly / Monthly / Quarterly) + PDF Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono">
                      {periodicReportData.reportRefCode}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                      {periodicReportData.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    {periodicReportData.subtitle} • تاريخ التوليد: {periodicReportData.generatedDate}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Period Switcher */}
                  <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs font-bold shadow-xs">
                    <button
                      onClick={() => setReportPeriod('weekly')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        reportPeriod === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      أسبوعي 📅
                    </button>
                    <button
                      onClick={() => setReportPeriod('monthly')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        reportPeriod === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      شهري 🗓️
                    </button>
                    <button
                      onClick={() => setReportPeriod('quarterly')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        reportPeriod === 'quarterly' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ربع سنوي 📈
                    </button>
                  </div>

                  {/* Primary PDF Export Button */}
                  <button
                    onClick={() => setShowPdfModal(true)}
                    id="export-pdf-report-btn"
                    className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    title="تصدير التقرير كـ PDF رسمي ومشاركته مع فريق العمل"
                  >
                    <FileText className="w-4 h-4" />
                    <span>تصدير التقرير كـ PDF 📑</span>
                  </button>

                  {/* Quick Print Button */}
                  <button
                    onClick={handleExportPDF}
                    className="h-9 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="طباعة التقرير الفوري"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">طباعة فورية</span>
                  </button>
                </div>
              </div>

              {/* Periodic Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <div className="text-[11px] font-bold text-indigo-900">المبيعات المتوقعة للفترة</div>
                  <div className="text-xl sm:text-2xl font-black text-indigo-950 font-mono">
                    {periodicReportData.expectedGrossRevenue.toLocaleString()} {currency}
                  </div>
                  <div className="text-[10px] text-indigo-700">تقدير {periodicReportData.expectedUnitsSold} قطعة مباعة</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div className="text-[11px] font-bold text-emerald-900">صافي الأرباح المتوقعة</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
                    +{periodicReportData.expectedNetProfit.toLocaleString()} {currency}
                  </div>
                  <div className="text-[10px] text-emerald-700">هامش ربح صافي {calculations.netProfitMarginPercent}%</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                  <div className="text-[11px] font-bold text-purple-900">مؤشر استقرار السعر والربحية</div>
                  <div className="text-xl sm:text-2xl font-black text-purple-950 font-['Alexandria']">
                    {periodicReportData.healthScore}
                  </div>
                  <div className="text-[10px] text-purple-700">معدل الفوز بصندوق الشراء 88%+</div>
                </div>
              </div>

              {/* Historical & Forecast Trend Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    جدول التتبع الدوري لحركة الأسعار والأرباح
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {product.brand} {product.model}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-150">
                        <th className="p-3 font-bold">الفترة الزمنية</th>
                        <th className="p-3 font-bold">متوسط سعر السوق</th>
                        <th className="p-3 font-bold">سعر بيع التاجر</th>
                        <th className="p-3 font-bold">الكمية المباعة</th>
                        <th className="p-3 font-bold">صافي الأرباح المحققة</th>
                        <th className="p-3 font-bold">الاستحواذ (Buy Box)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {periodicReportData.timeline.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{row.period}</td>
                          <td className="p-3 font-mono text-slate-600">{row.avgPrice.toLocaleString()} {currency}</td>
                          <td className="p-3 font-mono font-bold text-indigo-700">{row.merchantPrice.toLocaleString()} {currency}</td>
                          <td className="p-3 font-mono">{row.unitsSold} قطعة</td>
                          <td className="p-3 font-mono font-black text-emerald-700">+{row.netProfit.toLocaleString()} {currency}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {row.winRate} 🟢
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Strategic Takeaway */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <span className="text-xs font-black text-indigo-950 font-['Alexandria'] block">
                    خلاصة تقرير الأداء والتوصية الاستراتيجية:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {periodicReportData.keyTakeaway}
                  </p>
                </div>
                
                <button
                  onClick={handleCopyTeamSummary}
                  className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>{copiedSummary ? 'تم النسخ!' : 'نسخ للفريق'}</span>
                </button>
              </div>

            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL PDF EXPORT & TEAM SHARING MODAL (معاينة وتحميل ملف الـ PDF الرسمي) */}
      {/* ========================================================================= */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
            
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black font-['Alexandria']">
                    معاينة وثيقة الـ PDF الرسمية ومشاركتها
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    تقرير الأداء الدوري، تسعير المنافسين، وهوامش الربح المعتمدة لفريق العمل
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPdfModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Toolbar with Direct Actions */}
            <div className="p-3 sm:px-6 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                <span>مرجع الوثيقة:</span>
                <span className="font-mono px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800">
                  {periodicReportData.reportRefCode}
                </span>
                <span className="text-slate-400">•</span>
                <span>{periodicReportData.generatedDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTeamSummary}
                  className="h-8 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'تم النسخ!' : 'نسخ النص'}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>مشاركة واتساب</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل / حفظ كـ PDF 🖨️</span>
                </button>
              </div>
            </div>

            {/* Document Body (Printable A4 Preview) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white font-sans text-slate-900" id="official-pdf-document-content">
              
              {/* Document Header with Corporate Style */}
              <div className="border-b-2 border-indigo-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wider font-['Alexandria']">
                      منصة رادار المنافسين والتسعير الذكي • مصر
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-['Alexandria']">
                    وثيقة تقرير الأداء المالي واستراتيجية التسعير
                  </h1>
                  <p className="text-xs text-slate-500">
                    مستند رسمي معتمد لإدارة المبيعات والتسعير • {periodicReportData.periodLabel}
                  </p>
                </div>

                <div className="text-right sm:text-left text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-bold">الرقم المرجعي: <strong className="font-mono text-slate-900">{periodicReportData.reportRefCode}</strong></div>
                  <div className="text-slate-500 font-bold">تاريخ الإصدار: <strong className="text-slate-900">{periodicReportData.generatedDate}</strong></div>
                  <div className="text-slate-500 font-bold">موجه إلى: <strong className="text-indigo-900">إدارة التجارة والمبيعات</strong></div>
                </div>
              </div>

              {/* Product Info Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={product?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                  alt={product?.title || 'المنتج'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain bg-white p-2 border border-slate-200 shrink-0"
                />
                <div className="space-y-1 flex-1 text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[10px] font-black">
                      {product?.brand || 'عام'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {product?.category || 'عام'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    {product?.title || 'تقرير المنتج المالي'}
                  </h3>
                  <div className="text-xs text-slate-600 font-mono">
                    الموديل: {product?.model || 'النموذج القياسي'} • منصة التنفيذ: {platformPresets[selectedPlatform].name}
                  </div>
                </div>

                <div className="text-center bg-emerald-50 border border-emerald-200 p-3 rounded-xl shrink-0 min-w-[140px]">
                  <span className="text-[10px] font-bold text-emerald-800 block">سعر البيع المعتمد</span>
                  <div className="text-xl font-black text-emerald-900 font-mono">
                    {calculations.sellingPrice.toLocaleString()} {currency}
                  </div>
                  <span className="text-[10px] text-emerald-700 block font-bold">
                    صافي ربح: +{calculations.netProfit.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              {/* Financial Executive Metrics Grid */}
              <div>
                <h4 className="text-xs font-black text-slate-900 font-['Alexandria'] mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>المؤشرات المالية الرئيسية (Key Financial Indicators):</span>
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">تكلفة شراء الجملة</span>
                    <div className="text-lg font-black text-slate-900 font-mono">{wholesaleCost.toLocaleString()} {currency}</div>
                    <span className="text-[9px] text-slate-400">سعر المورد الصافي</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">إجمالي الرسوم والعمولة</span>
                    <div className="text-lg font-black text-sky-900 font-mono">{calculations.totalPlatformOperationalFees.toLocaleString()} {currency}</div>
                    <span className="text-[9px] text-sky-700">عمولة + شحن + تغليف</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-bold block">هامش الربح الصافي %</span>
                    <div className="text-lg font-black text-emerald-900 font-mono">{calculations.netProfitMarginPercent}%</div>
                    <span className="text-[9px] text-emerald-700">ROI: {calculations.returnOnInvestmentROI}%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] text-indigo-800 font-bold block">أدنى نقطة تعادل</span>
                    <div className="text-lg font-black text-indigo-900 font-mono">{calculations.breakEvenPrice.toLocaleString()} {currency}</div>
                    <span className="text-[9px] text-indigo-700">لتجنب أي خسارة</span>
                  </div>
                </div>
              </div>

              {/* Competitor Benchmarking Overview */}
              <div>
                <h4 className="text-xs font-black text-slate-900 font-['Alexandria'] mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                  <span>مقارنة وضع السوق وأسعار المتاجر المنافسة:</span>
                </h4>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-slate-500 font-bold block text-[10px]">أقل سعر منافس حالياً:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{lowestMarketPrice.toLocaleString()} {currency}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-slate-500 font-bold block text-[10px]">متوسط أسعار السوق:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{averageMarketPrice.toLocaleString()} {currency}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-slate-500 font-bold block text-[10px]">أعلى سعر مسجل:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{highestMarketPrice.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>

              {/* Periodic Timeline Table */}
              <div>
                <h4 className="text-xs font-black text-slate-900 font-['Alexandria'] mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>جدول الأداء الدوري والتوقعات ({periodicReportData.title}):</span>
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2.5">الفترة الزمنية</th>
                        <th className="p-2.5">سعر التاجر</th>
                        <th className="p-2.5">الكمية المقدرة</th>
                        <th className="p-2.5">إجمالي المبيعات</th>
                        <th className="p-2.5">صافي الأرباح</th>
                        <th className="p-2.5">الاستحواذ (Buy Box)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {periodicReportData.timeline.map((item, idx) => (
                        <tr key={idx} className={idx === periodicReportData.timeline.length - 1 ? 'bg-indigo-50/50 font-bold' : ''}>
                          <td className="p-2.5 font-bold">{item.period}</td>
                          <td className="p-2.5 font-mono">{item.merchantPrice.toLocaleString()} {currency}</td>
                          <td className="p-2.5 font-mono">{item.unitsSold} قطعة</td>
                          <td className="p-2.5 font-mono">{(item.merchantPrice * item.unitsSold).toLocaleString()} {currency}</td>
                          <td className="p-2.5 font-mono font-black text-emerald-800">+{item.netProfit.toLocaleString()} {currency}</td>
                          <td className="p-2.5 text-emerald-700 font-bold">{item.winRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategic Advice Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-black text-slate-900 font-['Alexandria'] block">
                  التوجيه الاستراتيجي المعتمد لفريق العمل:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {periodicReportData.keyTakeaway} يوصى بتثبيت هذا السعر على منصة {platformPresets[selectedPlatform].name} لضمان سرعة دوران المخزون والحفاظ على هامش ربح لا يقل عن {calculations.netProfitMarginPercent}%.
                </p>
              </div>

              {/* Official Seal & Signature Section */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span>تم التوليد والاعتماد عبر نظام الذكاء الاصطناعي للتسعير</span>
                  <div className="font-mono text-[10px] text-slate-400">Timestamp: {new Date().toISOString()}</div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800 font-['Alexandria']">اعتماد إدارة التسعير</div>
                  <div className="text-[10px] text-emerald-700 font-bold">✓ معتمد رسمياً للتطبيق</div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                يمكن حفظ التقرير كـ PDF مباشرة من خيارات الطباعة (Print to PDF).
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إغلاق المعاينة
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>تصدير وطباعة PDF الآن</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

