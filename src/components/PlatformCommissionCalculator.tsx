import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Percent,
  DollarSign,
  TrendingUp,
  Package,
  ShieldCheck,
  Building2,
  Sparkles,
  Download,
  CheckCircle2,
  Sliders,
  ArrowUpRight,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  Info,
  Award,
  ArrowRightLeft,
  ExternalLink,
  Store
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import confetti from 'canvas-confetti';
import {
  ProductData,
  PlatformKey,
  CategoryCommissionRule,
  PlatformFeeCalculationResult,
  MultiPlatformCommissionSummary
} from '../types';
import { VERIFIED_AMAZON_EG_PRODUCTS } from '../services/livePlatformProductSync';
import {
  PLATFORMS_METADATA,
  CATEGORY_COMMISSION_RULES,
  detectCategoryKeyFromProduct,
  calculateMultiPlatformComparison
} from '../data/platformCommissionsData';

interface PlatformCommissionCalculatorProps {
  allProducts?: ProductData[];
  currentProduct?: ProductData;
  currency?: string;
  onApplyPriceToProduct?: (productId: string, newPrice: number) => void;
  onNavigateToGuardrails?: () => void;
  onNavigateToSimulator?: () => void;
  onShowToast?: (message: string) => void;
}

export const PlatformCommissionCalculator: React.FC<PlatformCommissionCalculatorProps> = ({
  allProducts = [],
  currentProduct,
  currency = 'EGP',
  onApplyPriceToProduct,
  onNavigateToGuardrails,
  onNavigateToSimulator,
  onShowToast
}) => {
  // Selected Product State
  const [selectedProductId, setSelectedProductId] = useState<string>(currentProduct?.id || allProducts[0]?.id || '');

  const activeProduct = useMemo(() => {
    return allProducts.find(p => p.id === selectedProductId) || allProducts[0] || currentProduct || null;
  }, [allProducts, selectedProductId, currentProduct]);

  // Selected Category (auto-detected by default)
  const initialCategoryKey = useMemo(() => {
    return detectCategoryKeyFromProduct(activeProduct);
  }, [activeProduct]);

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(initialCategoryKey);

  // Synchronize category when product changes
  React.useEffect(() => {
    setSelectedCategoryKey(detectCategoryKeyFromProduct(activeProduct));
    setSellingPriceInput(activeProduct?.suggestedRetailPrice || activeProduct?.currentLowestPrice || 2499);
    setWholesaleCostInput(activeProduct?.estimatedWholesaleCost || Math.round((activeProduct?.suggestedRetailPrice || activeProduct?.currentLowestPrice || 2499) * 0.75));
  }, [activeProduct]);

  // Pricing inputs
  const [sellingPriceInput, setSellingPriceInput] = useState<number>(
    activeProduct?.suggestedRetailPrice || activeProduct?.currentLowestPrice || 2499
  );
  const [wholesaleCostInput, setWholesaleCostInput] = useState<number>(
    activeProduct?.estimatedWholesaleCost || Math.round((activeProduct?.suggestedRetailPrice || 2499) * 0.75)
  );
  const [salesVolumeSimulationUnits, setSalesVolumeSimulationUnits] = useState<number>(100);
  const [customsDutyPercent, setCustomsDutyPercent] = useState<number>(0);
  const [electronicGatewayPercent, setElectronicGatewayPercent] = useState<number>(2.5);
  const [selectedEgyptCarrierId, setSelectedEgyptCarrierId] = useState<string>('bosta_eg');

  const EGYPT_CARRIERS = [
    { id: 'bosta_eg', name: 'بوسطة (Bosta Egypt)', feeEGP: 65, codPercent: 1.0 },
    { id: 'aramex_eg', name: 'أرامكس مصر (Aramex)', feeEGP: 75, codPercent: 1.2 },
    { id: 'mnthalan_eg', name: 'إم إن تي حالا (MNT-Halan)', feeEGP: 55, codPercent: 0.8 },
    { id: 'jtexpress_eg', name: 'جيه آند تي إكسبريس (J&T Express)', feeEGP: 60, codPercent: 1.0 },
  ];
  const selectedCarrier = EGYPT_CARRIERS.find(c => c.id === selectedEgyptCarrierId) || EGYPT_CARRIERS[0];
  const customsAmountEGP = Math.round((wholesaleCostInput * customsDutyPercent) / 100);
  const gatewayAmountEGP = Math.round((sellingPriceInput * electronicGatewayPercent) / 100);
  const vat14AmountEGP = Math.round(sellingPriceInput * 0.14);
  const directStoreNetProfitAfterShippingEGP = Math.round(
    sellingPriceInput - wholesaleCostInput - customsAmountEGP - gatewayAmountEGP - selectedCarrier.feeEGP - (sellingPriceInput * selectedCarrier.codPercent / 100)
  );

  // Custom fee overrides state (if merchant has special negotiated rates)
  const [showAdvancedOverrides, setShowAdvancedOverrides] = useState<boolean>(false);
  const [customOverrides, setCustomOverrides] = useState<Partial<Record<PlatformKey, {
    customReferralPercent?: number;
    customFulfillmentEGP?: number;
    customFixedFeeEGP?: number;
    customPaymentProcessingPercent?: number;
  }>>>({});

  // Active Category Rule
  const activeCategoryRule = useMemo(() => {
    return CATEGORY_COMMISSION_RULES.find(c => c.categoryKey === selectedCategoryKey) || CATEGORY_COMMISSION_RULES[0];
  }, [selectedCategoryKey]);

  // Calculate dynamic multi-platform comparison
  const calculationSummary: MultiPlatformCommissionSummary = useMemo(() => {
    return calculateMultiPlatformComparison(
      activeProduct,
      sellingPriceInput,
      wholesaleCostInput,
      selectedCategoryKey,
      customOverrides
    );
  }, [activeProduct, sellingPriceInput, wholesaleCostInput, selectedCategoryKey, customOverrides]);

  // Reset custom overrides to official platform defaults
  const handleResetOverrides = () => {
    setCustomOverrides({});
    if (onShowToast) {
      onShowToast('تمت استعادة نسب العمولات والرسوم الرسمية المعتمدة لجميع المنصات');
    }
  };

  // Update a single custom override field
  const handleUpdateOverride = (platformKey: PlatformKey, field: string, value: number) => {
    setCustomOverrides(prev => ({
      ...prev,
      [platformKey]: {
        ...prev[platformKey],
        [field]: value
      }
    }));
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'المنصة',
      'فئة المنتج',
      'سعر البيع (ج.م)',
      'سعر التكلفة (ج.م)',
      'نسبة عمولة البيع (%)',
      'قيمة عمولة البيع (ج.م)',
      'رسوم الإغلاق الثابتة (ج.م)',
      'رسوم الشحن والتخزين (ج.م)',
      'رسوم بوابة الدفع (ج.م)',
      'ضريبة القيمة المضافة 14% على الرسوم (ج.م)',
      'إجمالي خصومات المنصة (ج.م)',
      'صافي المحول للتاجر (ج.م)',
      'صافي الربح الفعلي (ج.م)',
      'هامش صافي الربح (%)',
      'العائد على الاستثمار ROI (%)',
      'سعر نقطة التعادل الأدنى (ج.م)'
    ];

    const rows = calculationSummary.platformResults.map(r => [
      `"${r.platformNameAr}"`,
      `"${calculationSummary.categoryNameAr}"`,
      r.sellingPriceEGP,
      r.wholesaleCostEGP,
      `${r.referralFeePercent}%`,
      r.referralFeeAmountEGP,
      r.fixedClosingFeeEGP,
      r.fulfillmentFeeEGP,
      r.paymentGatewayAmountEGP,
      r.vatOnFeesEGP,
      r.totalPlatformDeductionsEGP,
      r.netPayoutToMerchantEGP,
      r.netProfitEGP,
      `${r.profitMarginPercent}%`,
      `${r.roiPercent}%`,
      r.breakEvenSellingPriceEGP
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `platform-commissions-${activeProduct.id || 'product'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('تم تصدير كشف حساب العمولات وصافي الأرباح لجميع المنصات بصيغة CSV بنجاح');
    }
  };

  // Apply winning price to product
  const handleApplyWinningPrice = (price: number, platformName: string) => {
    if (onApplyPriceToProduct) {
      onApplyPriceToProduct(activeProduct.id, price);
    }
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    if (onShowToast) {
      onShowToast(`تم تطبيق السعر الأمثل (${price.toLocaleString()} ${currency}) المحسوب لمنصة ${platformName} على المنتج بنجاح!`);
    }
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    return calculationSummary.platformResults.map(r => ({
      name: r.platformName.replace(' Egypt', ''),
      nameAr: r.platformNameAr.split(' (')[0],
      netProfit: r.netProfitEGP,
      platformFees: r.totalPlatformDeductionsEGP,
      wholesaleCost: r.wholesaleCostEGP,
      marginPercent: r.profitMarginPercent,
      isWinner: r.isMostProfitable
    }));
  }, [calculationSummary]);

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs backdrop-blur-md min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <span className="font-bold text-slate-200">{data.nameAr}</span>
            {data.isWinner && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-400 text-slate-950">
                🏆 الأعلى ربحية
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>صافي الربح الفعلي:</span>
              <span>{data.netProfit.toLocaleString()} {currency} ({data.marginPercent}%)</span>
            </div>
            <div className="flex items-center justify-between text-rose-400">
              <span>إجمالي خصومات المنصة + VAT:</span>
              <span>{data.platformFees.toLocaleString()} {currency}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>سعر التكلفة بالجملة:</span>
              <span>{data.wholesaleCost.toLocaleString()} {currency}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12" id="platform-commission-calculator-container">
      {/* Top Header & Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/60 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                حاسبة العمولات المتطابقة مع السوق المصري 2026
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                أمازون • نون • جوميا • كنز • هومزمارت
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              حاسبة عمولات المنصات وصافي الربح التنافسي
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              تحديث آلي لنسب العمولات الرسمية، رسوم الإغلاق، تكلفة الشحن اللوجستي (FBA / FBN / Jumia Express / أسطول هومزمارت)، وضريبة القيمة المضافة 14% لحساب صافي الربح الحقيقي ونقطة التعادل بدقة فورية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              id="btn-export-commission-csv"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              تصدير كشف العمولات CSV
            </button>

            {onNavigateToGuardrails && (
              <button
                id="btn-nav-guardrails-from-calculator"
                onClick={onNavigateToGuardrails}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                حدود حماية التسعير
              </button>
            )}
          </div>
        </div>

        {/* Product & Category Selector Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Select Product */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-indigo-600" />
              اختر المنتج من المتجر:
            </label>
            <select
              id="select-calculator-product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {allProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title.substring(0, 45)}... ({p.suggestedRetailPrice || p.currentLowestPrice} {currency})
                </option>
              ))}
            </select>
          </div>

          {/* Select Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              فئة المنتج (تحدد جدول العمولات آلياً):
            </label>
            <select
              id="select-calculator-category"
              value={selectedCategoryKey}
              onChange={(e) => setSelectedCategoryKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              {CATEGORY_COMMISSION_RULES.map(c => (
                <option key={c.categoryKey} value={c.categoryKey}>
                  {c.categoryNameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Egyptian VAT Badge & Reset */}
          <div className="flex items-center justify-between bg-sky-50/60 p-3 rounded-xl border border-sky-200/80">
            <div>
              <span className="text-[11px] font-bold text-sky-900 block">ضريبة القيمة المضافة (VAT):</span>
              <span className="text-xs font-black text-sky-800">14% مفروضة على عمولات وخدمات المنصات</span>
            </div>
            <button
              onClick={handleResetOverrides}
              className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 underline"
              title="إعادة ضبط العمولات للقيم الرسمية الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              استعادة الافتراضي
            </button>
          </div>
        </div>

        {/* Live Interactive Pricing Controls */}
        <div className="mt-4 bg-slate-50/80 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Selling Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              سعر البيع المقترح للمستهلك:
            </label>
            <div className="relative">
              <input
                id="input-calc-selling-price"
                type="number"
                min="1"
                step="10"
                value={sellingPriceInput}
                onChange={(e) => setSellingPriceInput(Math.max(1, Number(e.target.value)))}
                className="w-full pl-12 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {currency}
              </span>
            </div>
          </div>

          {/* Wholesale Cost */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              سعر التكلفة بالجملة (من المورد / المستورد):
            </label>
            <div className="relative">
              <input
                id="input-calc-wholesale-cost"
                type="number"
                min="1"
                step="10"
                value={wholesaleCostInput}
                onChange={(e) => setWholesaleCostInput(Math.max(1, Number(e.target.value)))}
                className="w-full pl-12 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {currency}
              </span>
            </div>
          </div>

          {/* Volume Simulator Multiplier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              محاكاة كمية المبيعات التراكمية:
            </label>
            <div className="flex items-center gap-1.5">
              {[10, 50, 100, 500].map(vol => (
                <button
                  key={vol}
                  onClick={() => setSalesVolumeSimulationUnits(vol)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-colors ${
                    salesVolumeSimulationUnits === vol
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {vol} ق
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Egyptian Ecommerce Localization Bar: VAT 14%, Customs, Payment Gateway & Local Shipping (Bosta, Aramex, MNT-Halan, J&T Express) */}
        <div className="mt-4 p-4 rounded-2xl bg-[#08090D] border border-sky-500/35 text-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-500 text-[#08090D] text-[11px] font-black">
                🇪🇬 التخصيص المصري (EGP)
              </span>
              <span className="text-xs font-black text-sky-300 font-['Alexandria']">
                حاسبة ضريبة القيمة المضافة (14% VAT) والجمارك والبوابات وشركات الشحن المحلية
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">
              صافي الربح بعد شحن ({selectedCarrier.name}): {directStoreNetProfitAfterShippingEGP.toLocaleString()} ج.م
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Local Shipping Carrier */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-sky-300 mb-1">
                شركة الشحن الداخلي في مصر:
              </label>
              <select
                value={selectedEgyptCarrierId}
                onChange={(e) => setSelectedEgyptCarrierId(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-950 border border-sky-500/30 text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                {EGYPT_CARRIERS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ({c.feeEGP} ج.م + {c.codPercent}% COD)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Customs Duty % */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-sky-300 mb-1">
                الرسوم الجمركية والاستيراد (%):
              </label>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={customsDutyPercent}
                  onChange={(e) => setCustomsDutyPercent(Math.max(0, Number(e.target.value)))}
                  className="w-20 h-8 px-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs"
                />
                <span className="text-[11px] text-slate-300 font-mono">
                  = {customsAmountEGP.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* 3. Payment Gateway % */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-sky-300 mb-1">
                رسوم البوابات الإلكترونية (Paymob/Fawry):
              </label>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.1"
                  value={electronicGatewayPercent}
                  onChange={(e) => setElectronicGatewayPercent(Math.max(0, Number(e.target.value)))}
                  className="w-20 h-8 px-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs"
                />
                <span className="text-[11px] text-slate-300 font-mono">
                  = {gatewayAmountEGP.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* 4. VAT 14% Summary */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-sky-300">ضريبة القيمة المضافة المصرية (VAT 14%):</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-black text-white font-mono">{vat14AmountEGP.toLocaleString()} ج.م</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">معتمدة 14%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Profitable Platform Winner Announcement Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-emerald-700/60 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl flex-shrink-0">
              {calculationSummary.mostProfitablePlatform.logoEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-slate-950" />
                  المنصة الأعلى صافي ربح لهذا المنتج
                </span>
                <span className="text-xs text-emerald-300 font-bold">
                  فارق ربح يصل إلى +{calculationSummary.profitSpreadEGP.toLocaleString()} {currency}/قطعة مقارنة بأعلى منصة عمولة
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {calculationSummary.mostProfitablePlatform.platformNameAr} تحقق صافي ربح {calculationSummary.mostProfitablePlatform.netProfitEGP.toLocaleString()} {currency} (هامش {calculationSummary.mostProfitablePlatform.profitMarginPercent}%)
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                إجمالي خصومات المنصة شاملة عمولة البيع ({calculationSummary.mostProfitablePlatform.referralFeePercent}%) ومصاريف الشحن وبوابة الدفع وضريبة الـ 14% تبلغ فقط <strong>{calculationSummary.mostProfitablePlatform.totalPlatformDeductionsEGP.toLocaleString()} {currency}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
            <button
              id="btn-apply-most-profitable-price"
              onClick={() => handleApplyWinningPrice(sellingPriceInput, calculationSummary.mostProfitablePlatform.platformNameAr)}
              className="w-full md:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              تطبيق السعر المربح للمنتج فوراً
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side 5 Platform Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {calculationSummary.platformResults.map(res => {
          const isWinner = res.isMostProfitable;
          const meta = PLATFORMS_METADATA[res.platformId];
          const isPositiveProfit = res.netProfitEGP > 0;

          return (
            <div
              key={res.platformId}
              id={`card-platform-commission-${res.platformId}`}
              className={`rounded-2xl p-4.5 border flex flex-col justify-between transition-all relative ${
                isWinner
                  ? 'bg-gradient-to-b from-emerald-50/90 to-white border-emerald-300 shadow-md ring-2 ring-emerald-500/40'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {isWinner && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  الأعلى ربحية #1
                </div>
              )}

              {/* Platform Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{res.logoEmoji}</span>
                    <div>
                      <h3 className="font-black text-xs text-slate-900 leading-tight">
                        {res.platformNameAr.split(' (')[0]}
                      </h3>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {meta.defaultFulfillmentType.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{res.profitabilityRank}
                  </span>
                </div>

                {/* Net Profit Highlight */}
                <div className={`p-3 rounded-xl border mt-3 mb-3 ${
                  isPositiveProfit
                    ? (isWinner ? 'bg-emerald-100/80 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-900')
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <span className="text-[10px] font-bold block text-slate-500">صافي الربح للقطعة:</span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-lg font-black tracking-tight">
                      {res.netProfitEGP.toLocaleString()} <span className="text-[11px] font-normal">{currency}</span>
                    </span>
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                      isPositiveProfit ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {res.profitMarginPercent}%
                    </span>
                  </div>
                </div>

                {/* Fee Breakdown List */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">عمولة البيع ({res.referralFeePercent}%):</span>
                    <span className="font-bold text-slate-800">{res.referralFeeAmountEGP} {currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">رسوم الإغلاق:</span>
                    <span className="font-bold text-slate-800">{res.fixedClosingFeeEGP} {currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">الشحن والتجهيز:</span>
                    <span className="font-bold text-slate-800">{res.fulfillmentFeeEGP} {currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">بوابة الدفع ({res.paymentGatewayPercent}%):</span>
                    <span className="font-bold text-slate-800">{res.paymentGatewayAmountEGP} {currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sky-700 font-semibold bg-sky-50/70 px-1.5 py-0.5 rounded-md">
                    <span>ضريبة VAT (14%):</span>
                    <span>+{res.vatOnFeesEGP} {currency}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/80 pt-1.5 font-bold text-slate-900">
                    <span>إجمالي الخصومات:</span>
                    <span className="text-rose-600">-{res.totalPlatformDeductionsEGP} {currency}</span>
                  </div>
                </div>

                {/* Break-even & Volume Profit */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">سعر نقطة التعادل:</span>
                    <strong className="text-slate-800">{res.breakEvenSellingPriceEGP} {currency}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ربح {salesVolumeSimulationUnits} قطعة:</span>
                    <strong className={`font-black ${isWinner ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {(res.netProfitEGP * salesVolumeSimulationUnits).toLocaleString()} {currency}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  id={`btn-apply-price-${res.platformId}`}
                  onClick={() => handleApplyWinningPrice(sellingPriceInput, res.platformNameAr)}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isWinner
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  اعتماد التسعير لـ {res.platformName.split(' ')[0]}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Bar Chart: Platform Cost vs Fees vs Net Profit */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              مقارنة هيكل التكاليف وصافي الأرباح بين المنصات (بالجنيه المصري):
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              توضيح حصة كل منصة من الرسوم والعمولات وضريبة الـ VAT مقابل صافي ربح التاجر
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            سعر البيع: <strong className="text-slate-900">{sellingPriceInput.toLocaleString()} {currency}</strong>
          </span>
        </div>

        {/* Recharts Container */}
        <div className="h-[320px] w-full min-w-0 pt-4" dir="ltr">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={50}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="nameAr" 
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 'bold' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value) => {
                  if (value === 'netProfit') return <span className="text-xs font-bold text-emerald-700">صافي الربح الفعلي للتاجر</span>;
                  if (value === 'platformFees') return <span className="text-xs font-bold text-rose-600">خصومات المنصة (عمولة + شحن + VAT)</span>;
                  if (value === 'wholesaleCost') return <span className="text-xs font-bold text-slate-500">تكلفة البضاعة بالجملة</span>;
                  return value;
                }} 
              />
              <Bar dataKey="wholesaleCost" name="wholesaleCost" stackId="a" fill="#cbd5e1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="platformFees" name="platformFees" stackId="a" fill="#f87171" radius={[0, 0, 0, 0]} />
              <Bar dataKey="netProfit" name="netProfit" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Commission & Fee Negotiated Overrides Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowAdvancedOverrides(!showAdvancedOverrides)}
          className="w-full p-5 flex items-center justify-between text-right hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                تخصيص نسب العمولات ورسوم الشحن التفاوضية (Custom Negotiated Tiers)
              </h3>
              <p className="text-xs text-slate-500">
                إذا كان لديك تخفيض خاص من أمازون، نون، جوميا، كنز، أو هومزمارت للبائعين المميزين
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-600 font-bold">
              {showAdvancedOverrides ? 'إخفاء الإعدادات المتقدمة' : 'عرض وتعديل النسب'}
            </span>
            {showAdvancedOverrides ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        {showAdvancedOverrides && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {calculationSummary.platformResults.map(p => {
                const override = customOverrides[p.platformId] || {};
                const baseRule = activeCategoryRule.rates[p.platformId];

                return (
                  <div key={p.platformId} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-900">{p.platformName.split(' ')[0]}</span>
                      <span className="text-base">{p.logoEmoji}</span>
                    </div>

                    {/* Referral % Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        عمولة البيع (%):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={override.customReferralPercent !== undefined ? override.customReferralPercent : baseRule.referralPercent}
                        onChange={(e) => handleUpdateOverride(p.platformId, 'customReferralPercent', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      />
                    </div>

                    {/* Fulfillment Fee Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        الشحن اللوجستي (ج.م):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={override.customFulfillmentEGP !== undefined ? override.customFulfillmentEGP : baseRule.fulfillmentEstimatedEGP}
                        onChange={(e) => handleUpdateOverride(p.platformId, 'customFulfillmentEGP', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      />
                    </div>

                    {/* Fixed Fee Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        رسوم الإغلاق (ج.م):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={override.customFixedFeeEGP !== undefined ? override.customFixedFeeEGP : baseRule.fixedClosingFeeEGP}
                        onChange={(e) => handleUpdateOverride(p.platformId, 'customFixedFeeEGP', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Official Guidelines & Tips for Egyptian Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <Store className="w-4 h-4 text-sky-600" />
            أمازون مصر (FBA) ونون (FBN)
          </div>
          <p className="text-slate-600 leading-relaxed">
            الاستفادة من مستودعات التخزين والشحن الآلي تمنحك شارة Prime و Express التي تضاعف مبيعاتك بنسبة +250% رغم رسوم التجهيز.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <Percent className="w-4 h-4 text-emerald-600" />
            منصة كنز (Kenzz Egypt)
          </div>
          <p className="text-slate-600 leading-relaxed">
            تتميز كنز بأقل نسبة عمولة بيع في مصر (4.5% - 9%)، مما يجعلها مثالية لتعظيم هامش الربح لمنتجات الإكسسوارات والموبايل.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <Building2 className="w-4 h-4 text-indigo-600" />
            هومزمارت (Homzmart)
          </div>
          <p className="text-slate-600 leading-relaxed">
            المنصة المتخصصة للأجهزة المنزلية والأثاث والمطبخ، وتوفر أسطول شحن مجهز للأحجام الكبيرة (Bulky Deliveries) مع استهداف دقيق لجمهور تجديد المنازل.
          </p>
        </div>
      </div>
    </div>
  );
};
