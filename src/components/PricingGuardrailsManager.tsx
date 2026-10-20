import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Percent, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  Layers, 
  Zap, 
  Building2,
  HelpCircle,
  SlidersHorizontal,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { ProductData, ProductPricingPlan, PlatformPriceGuardrail } from '../types';
import {
  getOrCreatePricingPlan,
  loadStoredPricingPlans,
  saveStoredPricingPlan,
  checkPriceFloorProximity,
  FloorProximityEvaluation
} from '../data/pricingGuardrailsData';
import { AUTHENTIC_AMAZON_EG_ASIN_SPECS_ARRAY } from '../services/livePlatformProductSync';
import { SmartDynamicPricingPanel } from './SmartDynamicPricingPanel';

interface PricingGuardrailsManagerProps {
  products: ProductData[];
  selectedProduct: ProductData | null;
  currency?: string;
  onSelectProduct: (product: ProductData) => void;
  onAutoAdjustProductPrice?: (
    productId: string,
    newMerchantPrice: number,
    updatedCompetitorPrice?: number,
    competitorName?: string,
    reasonLabel?: string
  ) => void;
  onBulkAutoAdjustAllProducts?: (
    adjustments: { productId: string; newPrice: number; guardrailStatus: string }[]
  ) => void;
  onShowToast?: (msg: string) => void;
  onNavigateToSimulator?: (product: ProductData) => void;
  hideDynamicPricingPanel?: boolean;
}

export const PricingGuardrailsManager: React.FC<PricingGuardrailsManagerProps> = ({
  products,
  selectedProduct: rawSelectedProduct,
  currency = 'ج.م',
  onSelectProduct,
  onAutoAdjustProductPrice,
  onBulkAutoAdjustAllProducts,
  onShowToast,
  onNavigateToSimulator,
  hideDynamicPricingPanel = false
}) => {
  const [pricingPlans, setPricingPlans] = useState<Record<string, ProductPricingPlan>>(() => loadStoredPricingPlans());

  useEffect(() => {
    const handleSync = () => {
      setPricingPlans(loadStoredPricingPlans());
    };
    window.addEventListener('merchant_pricing_guardrails_updated', handleSync);
    return () => window.removeEventListener('merchant_pricing_guardrails_updated', handleSync);
  }, []);

  const selectedProduct =
    rawSelectedProduct ||
    (products && products.length > 0 ? products[0] : AUTHENTIC_AMAZON_EG_ASIN_SPECS_ARRAY[0]);
  
  // Current active plan
  const currentPlan = pricingPlans[selectedProduct.id] || getOrCreatePricingPlan(selectedProduct);

  const handleUpdateGuardrail = (
    platformCode: string, 
    field: keyof PlatformPriceGuardrail, 
    value: any
  ) => {
    const updatedGuardrails = currentPlan.platformGuardrails.map(g => {
      if (g.platformCode === platformCode) {
        const updated = { ...g, [field]: value };
        
        // Recalculate net profit & margin when prices or commission changes
        if (field === 'actualSellingPrice' || field === 'platformCommissionPercent' || field === 'platformFixedFeeEGP') {
          const sellPrice = field === 'actualSellingPrice' ? Number(value) : updated.actualSellingPrice;
          const commPercent = field === 'platformCommissionPercent' ? Number(value) : updated.platformCommissionPercent;
          const fixedFee = field === 'platformFixedFeeEGP' ? Number(value) : updated.platformFixedFeeEGP;
          
          const commissionAmount = sellPrice * (commPercent / 100);
          const netProfit = Math.round(sellPrice - commissionAmount - fixedFee - currentPlan.costPrice);
          const netMargin = sellPrice > 0 ? Math.round((netProfit / sellPrice) * 100) : 0;
          
          updated.netProfitEGP = netProfit;
          updated.netMarginPercent = netMargin;
        }
        return updated;
      }
      return g;
    });

    const updatedPlan: ProductPricingPlan = {
      ...currentPlan,
      platformGuardrails: updatedGuardrails,
      lastModifiedAt: 'الآن (معدل)',
      modifiedBy: 'المسوق المسؤول عن بعد'
    };

    const nextAll = saveStoredPricingPlan(updatedPlan);
    setPricingPlans(nextAll);
  };

  const handleToggleFloorLock = (platformCode: string) => {
    const target = currentPlan.platformGuardrails.find(g => g.platformCode === platformCode);
    if (!target) return;
    handleUpdateGuardrail(platformCode, 'isFloorPriceLocked', !target.isFloorPriceLocked);
    if (onShowToast) {
      onShowToast(
        !target.isFloorPriceLocked 
          ? `تم تفعيل قفل الحد الأدنى لمنصة ${target.platformName} لحماية رأس المال` 
          : `تم فتح قفل الحد الأدنى لمنصة ${target.platformName}`
      );
    }
  };

  const handleSavePlan = () => {
    saveStoredPricingPlan(currentPlan);
    if (onShowToast) {
      onShowToast(`تم حفظ واعتماد خطة التسعير الديناميكي وحدود الحماية للمنتج (${selectedProduct.title}) بنجاح!`);
    }
  };

  // Handler to update global min price via visual slider
  const handleUpdateGlobalMinPrice = (newMin: number) => {
    const safeMin = Math.max(1, newMin);
    const updatedPlan: ProductPricingPlan = {
      ...currentPlan,
      globalMinPrice: safeMin,
      suggestedOptimalPrice: Math.max(currentPlan.suggestedOptimalPrice, safeMin),
      globalMaxPrice: Math.max(currentPlan.globalMaxPrice, safeMin + 10),
      lastModifiedAt: 'الآن (تعديل السلايدر)',
    };
    const nextAll = saveStoredPricingPlan(updatedPlan);
    setPricingPlans(nextAll);
  };

  // Handler to update global max price via visual slider
  const handleUpdateGlobalMaxPrice = (newMax: number) => {
    const safeMax = Math.max(currentPlan.globalMinPrice + 10, newMax);
    const updatedPlan: ProductPricingPlan = {
      ...currentPlan,
      globalMaxPrice: safeMax,
      suggestedOptimalPrice: Math.min(currentPlan.suggestedOptimalPrice, safeMax),
      lastModifiedAt: 'الآن (تعديل السلايدر)',
    };
    const nextAll = saveStoredPricingPlan(updatedPlan);
    setPricingPlans(nextAll);
  };

  // Handler to update suggested optimal price via visual slider
  const handleUpdateSuggestedOptimalPrice = (newOptimal: number) => {
    const bounded = Math.max(currentPlan.globalMinPrice, Math.min(currentPlan.globalMaxPrice, newOptimal));
    const updatedPlan: ProductPricingPlan = {
      ...currentPlan,
      suggestedOptimalPrice: bounded,
      lastModifiedAt: 'الآن (تعديل السلايدر)',
    };
    const nextAll = saveStoredPricingPlan(updatedPlan);
    setPricingPlans(nextAll);
  };

  // Apply quick profit margin preset
  const handleApplyMarginPreset = (targetMarginPercent: number) => {
    const costPriceVal = Math.max(1, currentPlan.costPrice);
    const factor = 1 - (targetMarginPercent / 100);
    const targetPrice = factor > 0 ? Math.round(costPriceVal / factor) : Math.round(costPriceVal * (1 + targetMarginPercent / 100));
    const newMin = Math.round(costPriceVal * 1.1);
    const newMax = Math.round(targetPrice * 1.35);

    const updatedPlan: ProductPricingPlan = {
      ...currentPlan,
      globalMinPrice: newMin,
      suggestedOptimalPrice: targetPrice,
      globalMaxPrice: newMax,
      lastModifiedAt: 'الآن (تطبيق قالب جاهز)',
    };
    const nextAll = saveStoredPricingPlan(updatedPlan);
    setPricingPlans(nextAll);
    if (onShowToast) {
      onShowToast(`تم تطبيق قالب هامش ربح (${targetMarginPercent}%) على المنتج بنجاح! 🚀`);
    }
  };

  // Sync global limits to all individual platforms
  const handleSyncLimitsToAllPlatforms = () => {
    const updatedGuardrails = currentPlan.platformGuardrails.map(g => {
      const commPercent = g.platformCommissionPercent || 10;
      const fixedFee = g.platformFixedFeeEGP || 5;
      const sellPrice = currentPlan.suggestedOptimalPrice;
      const commissionAmount = sellPrice * (commPercent / 100);
      const netProfit = Math.round(sellPrice - commissionAmount - fixedFee - currentPlan.costPrice);
      const netMargin = sellPrice > 0 ? Math.round((netProfit / sellPrice) * 100) : 0;

      return {
        ...g,
        minAllowedPrice: currentPlan.globalMinPrice,
        maxAllowedPrice: currentPlan.globalMaxPrice,
        actualSellingPrice: sellPrice,
        netProfitEGP: netProfit,
        netMarginPercent: netMargin,
      };
    });

    const updatedPlan: ProductPricingPlan = {
      ...currentPlan,
      platformGuardrails: updatedGuardrails,
      lastModifiedAt: 'الآن (مزامنة جماعية للمنصات)',
    };
    const nextAll = saveStoredPricingPlan(updatedPlan);
    setPricingPlans(nextAll);
    if (onShowToast) {
      onShowToast('تمت مزامنة الحدود وهوامش الربح مع كافة المنصات (أمازون، نون، جوميا، كنز، هومزمارت، تيك توك) بنجاح! ⚡');
    }
  };

  // Profit Margins live calculations for Visual Sliders
  const cost = Math.max(1, currentPlan.costPrice);
  const floorProfitEGP = Math.round(currentPlan.globalMinPrice - cost);
  const floorMarginPercent = currentPlan.globalMinPrice > 0 ? Math.round((floorProfitEGP / currentPlan.globalMinPrice) * 100) : 0;

  const optimalProfitEGP = Math.round(currentPlan.suggestedOptimalPrice - cost);
  const optimalMarginPercent = currentPlan.suggestedOptimalPrice > 0 ? Math.round((optimalProfitEGP / currentPlan.suggestedOptimalPrice) * 100) : 0;

  const ceilingProfitEGP = Math.round(currentPlan.globalMaxPrice - cost);
  const ceilingMarginPercent = currentPlan.globalMaxPrice > 0 ? Math.round((ceilingProfitEGP / currentPlan.globalMaxPrice) * 100) : 0;

  return (
    <div className="space-y-6" id="pricing-guardrails-manager-container">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              صمام أمان التسعير (Floor & Ceiling Price Guardrails)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Alexandria'] text-white">
              إدارة الحد الأدنى والأقصى وخطط التسعير الفعلية
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              تحديد الحد الأدنى الحرج (Floor Price) لمنع الخسارة تحت أي ظرف، والحد الأقصى (Ceiling Price) لاقتناص هوامش الأرباح العالية في أوقات ذروة الطلب عبر <strong>أمازون، نون، جوميا، كنز، هومزمارت، وتيك توك</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToSimulator && (
              <button
                id="btn-guardrails-to-simulator"
                onClick={() => onNavigateToSimulator(selectedProduct)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                محاكاة تأثير الخطة على الأرباح
              </button>
            )}
            <button
              id="btn-save-pricing-plan"
              onClick={handleSavePlan}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              حفظ واعتماد خطة التسعير
            </button>
          </div>
        </div>

        {/* Global Cost and Bounds Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-800/50">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">تكلفة الجملة الفعلية (Cost)</span>
            <div className="text-xl font-bold text-white font-mono">{currentPlan.costPrice.toLocaleString('ar-EG')} ج.م</div>
            <span className="text-[10px] text-slate-400">سعر التوريد من شارع عبد العزيز</span>
          </div>

          <div className="bg-rose-950/40 rounded-xl p-3 border border-rose-800/40">
            <span className="text-[11px] text-rose-300 block mb-1">الحد الأدنى المطلق (Global Floor)</span>
            <div className="text-xl font-bold text-rose-300 font-mono">{currentPlan.globalMinPrice.toLocaleString('ar-EG')} ج.م</div>
            <span className="text-[10px] text-rose-300">ممنوع البيع بأقل منه نهائياً</span>
          </div>

          <div className="bg-indigo-950/40 rounded-xl p-3 border border-indigo-800/40">
            <span className="text-[11px] text-indigo-300 block mb-1">الحد الأقصى (Global Ceiling)</span>
            <div className="text-xl font-bold text-indigo-200 font-mono">{currentPlan.globalMaxPrice.toLocaleString('ar-EG')} ج.م</div>
            <span className="text-[10px] text-indigo-300">سقف السعر في مواسم الشح</span>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-800/40">
            <span className="text-[11px] text-emerald-300 block mb-1">السعر التنافسي الموصى به</span>
            <div className="text-xl font-bold text-emerald-300 font-mono">{currentPlan.suggestedOptimalPrice.toLocaleString('ar-EG')} ج.م</div>
            <span className="text-[10px] text-emerald-300">للفوز بالـ Buy Box</span>
          </div>
        </div>
      </div>

      {/* Product Switcher Ribbon */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-600" />
          اختر المنتج لتعديل خطة تسعيره:
        </span>
        <div className="flex items-center gap-2">
          {products.map((prod) => (
            <button
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                prod.id === selectedProduct.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {prod.title.split(' ')[0]} {prod.title.split(' ')[1]} {prod.title.split(' ')[2]}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Smart Dynamic Pricing Engine */}
      {!hideDynamicPricingPanel && (
        <SmartDynamicPricingPanel
          product={selectedProduct}
          allProducts={products}
          currency={currency}
          onAutoAdjustProductPrice={(productId, newMerchantPrice, updatedCompetitorPrice, competitorName, reasonLabel) => {
            setPricingPlans(loadStoredPricingPlans());
            if (onAutoAdjustProductPrice) {
              onAutoAdjustProductPrice(productId, newMerchantPrice, updatedCompetitorPrice, competitorName, reasonLabel);
            }
          }}
          onBulkAutoAdjustAllProducts={(adjustments) => {
            setPricingPlans(loadStoredPricingPlans());
            if (onBulkAutoAdjustAllProducts) {
              onBulkAutoAdjustAllProducts(adjustments);
            }
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* Visual Slider: Interactive Min/Max Price Limits & Live Profit Margins */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200/80 shadow-md space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                  متحكم الحدود السعرية المرئي وهوامش الربح الفورية
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  تحديث حي وتفاعلي ⚡
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                حرّك المؤشرات لضبط الحد الأدنى (Floor) والأقصى (Ceiling) وسعر البيع لمشاهدة التأثير الفوري المباشر على الأرباح وهوامش الربح
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-sync-slider-to-platforms"
              onClick={handleSyncLimitsToAllPlatforms}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="تطبيق الحدود السعرية ونسب الأرباح على كافة المنصات بنقرة واحدة"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>مزامنة الحدود مع كافة المنصات ⚡</span>
            </button>
          </div>
        </div>

        {/* Live Projected Profit Margins Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Floor / Min Margin */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-rose-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                هامش الحد الأدنى (صمام الأمان)
              </span>
              <span className="text-[10px] bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                Floor Margin
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-rose-900">
                  {currentPlan.globalMinPrice.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-rose-700 font-bold mr-1">{currency}</span>
              </div>
              <div className="text-left">
                <span className="text-lg font-black font-mono text-rose-700">
                  {floorMarginPercent > 0 ? `+${floorMarginPercent}%` : `${floorMarginPercent}%`}
                </span>
                <span className="text-[10px] text-rose-600 block">
                  صافي {floorProfitEGP > 0 ? `+${floorProfitEGP}` : floorProfitEGP} {currency}
                </span>
              </div>
            </div>
            <div className="w-full bg-rose-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, floorMarginPercent))}%` }}
              />
            </div>
          </div>

          {/* Card 2: Current Suggested Selling Price Margin */}
          <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                هامش سعر البيع التنافسي (BuyBox)
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                Target Margin
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-emerald-900">
                  {currentPlan.suggestedOptimalPrice.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-emerald-700 font-bold mr-1">{currency}</span>
              </div>
              <div className="text-left">
                <span className="text-lg font-black font-mono text-emerald-700">
                  {optimalMarginPercent > 0 ? `+${optimalMarginPercent}%` : `${optimalMarginPercent}%`}
                </span>
                <span className="text-[10px] text-emerald-600 block font-bold">
                  صافي +{optimalProfitEGP.toLocaleString('ar-EG')} {currency}
                </span>
              </div>
            </div>
            <div className="w-full bg-emerald-200/70 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, optimalMarginPercent))}%` }}
              />
            </div>
          </div>

          {/* Card 3: Ceiling / Max Margin */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-indigo-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                هامش سقف السعر (الحد الأقصى)
              </span>
              <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-full font-bold">
                Ceiling Margin
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-indigo-900">
                  {currentPlan.globalMaxPrice.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-indigo-700 font-bold mr-1">{currency}</span>
              </div>
              <div className="text-left">
                <span className="text-lg font-black font-mono text-indigo-700">
                  {ceilingMarginPercent > 0 ? `+${ceilingMarginPercent}%` : `${ceilingMarginPercent}%`}
                </span>
                <span className="text-[10px] text-indigo-600 block">
                  صافي +{ceilingProfitEGP.toLocaleString('ar-EG')} {currency}
                </span>
              </div>
            </div>
            <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, ceilingMarginPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* The 3 Synchronized Visual Range Sliders */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-6">
          
          {/* Slider 1: Min Allowed / Floor Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <label htmlFor="slider-min-price" className="text-xs font-black text-slate-800">
                  الحد الأدنى للسعر (Floor Price):
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  (تكلفة الجملة: {cost.toLocaleString('ar-EG')} {currency})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-lg border border-rose-200">
                  {currentPlan.globalMinPrice.toLocaleString('ar-EG')} {currency}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  (هامش {floorMarginPercent}%)
                </span>
              </div>
            </div>

            <input
              id="slider-min-price"
              type="range"
              min={Math.max(1, Math.round(cost * 0.8))}
              max={Math.max(cost + 50, currentPlan.globalMaxPrice - 10)}
              step={10}
              value={currentPlan.globalMinPrice}
              onChange={(e) => handleUpdateGlobalMinPrice(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>أدنى قيمة ({Math.round(cost * 0.8)} {currency})</span>
              <span className="text-rose-600 font-bold">صمام أمان لمنع البيع بخسارة</span>
              <span>السقف ({currentPlan.globalMaxPrice - 10} {currency})</span>
            </div>
          </div>

          {/* Slider 2: Target Selling Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <label htmlFor="slider-target-price" className="text-xs font-black text-slate-800">
                  سعر البيع التنافسي المعتمد (Target Price):
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full font-bold">
                  BuyBox Winner
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                  {currentPlan.suggestedOptimalPrice.toLocaleString('ar-EG')} {currency}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  (صافي +{optimalProfitEGP.toLocaleString('ar-EG')} {currency} / {optimalMarginPercent}%)
                </span>
              </div>
            </div>

            <input
              id="slider-target-price"
              type="range"
              min={currentPlan.globalMinPrice}
              max={currentPlan.globalMaxPrice}
              step={10}
              value={currentPlan.suggestedOptimalPrice}
              onChange={(e) => handleUpdateSuggestedOptimalPrice(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>الحد الأدنى ({currentPlan.globalMinPrice} {currency})</span>
              <span className="text-emerald-700 font-bold">السعر الفعلي المطبق بالمتجر</span>
              <span>الحد الأقصى ({currentPlan.globalMaxPrice} {currency})</span>
            </div>
          </div>

          {/* Slider 3: Max Allowed / Ceiling Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                <label htmlFor="slider-max-price" className="text-xs font-black text-slate-800">
                  الحد الأقصى للسعر (Ceiling Price):
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  (سقف الأسعار في فترات الشح)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {currentPlan.globalMaxPrice.toLocaleString('ar-EG')} {currency}
                </span>
                <span className="text-xs font-bold text-indigo-700">
                  (هامش {ceilingMarginPercent}%)
                </span>
              </div>
            </div>

            <input
              id="slider-max-price"
              type="range"
              min={currentPlan.globalMinPrice + 10}
              max={Math.max(currentPlan.globalMaxPrice * 1.5, Math.round(cost * 3))}
              step={10}
              value={currentPlan.globalMaxPrice}
              onChange={(e) => handleUpdateGlobalMaxPrice(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>الحد الأدنى +10 ({currentPlan.globalMinPrice + 10} {currency})</span>
              <span className="text-indigo-600 font-bold">سقف الحماية لمنع المبالغة غير التنافسية</span>
              <span>الحد الأقصى المتاح ({Math.max(currentPlan.globalMaxPrice * 1.5, Math.round(cost * 3))} {currency})</span>
            </div>
          </div>

        </div>

        {/* Quick Margin Presets Toolbar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">قوالب هوامش الأرباح الجاهزة (1-Click Presets):</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleApplyMarginPreset(15)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition cursor-pointer"
            >
              🛡️ دفاعي (15%)
            </button>
            <button
              type="button"
              onClick={() => handleApplyMarginPreset(25)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300 transition cursor-pointer"
            >
              ⚖️ متوازن (25%)
            </button>
            <button
              type="button"
              onClick={() => handleApplyMarginPreset(40)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-black border border-indigo-300 transition cursor-pointer"
            >
              🚀 نمو مرتفع (40%)
            </button>
            <button
              type="button"
              onClick={() => handleApplyMarginPreset(60)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-black border border-purple-300 transition cursor-pointer"
            >
              💎 مواسم الذروة (60%)
            </button>
          </div>
        </div>

      </div>

      {/* Platforms Guardrails Grid Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 font-['Alexandria']">
              جدول الحدود السعرية الفعلية لكل منصة (أمازون، نون، جوميا، كنز، هومزمارت، تيك توك)
            </h3>
            <p className="text-xs text-slate-500">
              قم بتعديل السعر الفعلي، والحد الأدنى والأقصى، مع متابعة هامش الربح وصافي المكسب بعد خصم عمولات كل منصة
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span>آخر تعديل: <strong className="text-slate-800">{currentPlan.lastModifiedAt}</strong></span>
            <span>•</span>
            <span>بواسطة: <strong className="text-indigo-700">{currentPlan.modifiedBy}</strong></span>
          </div>
        </div>

        {/* Global Proximity Alert Banner across Platforms */}
        {(() => {
          const proximities = currentPlan.platformGuardrails.map(g => ({
            guardrail: g,
            eval: checkPriceFloorProximity(g.actualSellingPrice, currentPlan, g.platformCode)
          }));
          const anyBreached = proximities.some(p => p.eval.isBreached);
          const anyApproaching = proximities.some(p => p.eval.isApproachingFloor && !p.eval.isBreached);

          if (!anyBreached && !anyApproaching) return null;

          return (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 flex-wrap ${
              anyBreached 
                ? 'bg-rose-50 border-rose-300 text-rose-900' 
                : 'bg-sky-50 border-sky-300 text-sky-900'
            }`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 shrink-0 ${anyBreached ? 'text-rose-600 animate-bounce' : 'text-sky-600'}`} />
                <div>
                  <h4 className="font-bold text-xs font-['Alexandria']">
                    {anyBreached 
                      ? '🚨 تنبيه صمام الأمان: توجد منصات بسعر دون الحد الأدنى للحماية!' 
                      : '⚠️ تنبيه صمام الأمان: اقتراب السعر من الحد الأدنى للحماية في بعض المنصات!'}
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {anyBreached 
                      ? 'تم رصد أسعار بيع تكسر الحد الأدنى للحماية وتسبب خسارة مالية. اضغط زر القفل الفوري لتثبيت الأسعار بالحد الآمن.'
                      : 'يقترب سعر البيع من الحد الأدنى الحرج (أقل من 8% أو 150 ج.م فوق الحد الأدنى). تم تفعيل التحذير الاستباقي.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const safeCost = Math.max(1, currentPlan.costPrice);
                  const updated = currentPlan.platformGuardrails.map(g => ({
                    ...g,
                    isFloorPriceLocked: true,
                    actualSellingPrice: Math.max(g.actualSellingPrice, g.minAllowedPrice, safeCost + 15)
                  }));
                  const updatedPlan = { ...currentPlan, platformGuardrails: updated, lastModifiedAt: 'الآن (قفل جماعي)' };
                  saveStoredPricingPlan(updatedPlan);
                  setPricingPlans(loadStoredPricingPlans());
                  if (onShowToast) onShowToast('🛡️ تم قفل صمامات الأمان وتثبيت أسعار جميع المنصات عند الحدود الآمنة بنجاح!');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                🔒 قفل جميع الحدود وتثبيت السعر الآمن
              </button>
            </div>
          );
        })()}

        {/* Guardrails Cards per Platform */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPlan.platformGuardrails.map((guardrail) => {
            const prox = checkPriceFloorProximity(guardrail.actualSellingPrice, currentPlan, guardrail.platformCode);
            const isDangerouslyLow = prox.isBreached;
            const isApproaching = prox.isApproachingFloor && !prox.isBreached;
            const isProfitable = guardrail.netProfitEGP > 0;

            return (
              <div
                key={guardrail.platformCode}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isDangerouslyLow
                    ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400'
                    : isApproaching
                    ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-400'
                    : 'bg-slate-50/40 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Platform Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {guardrail.platformCode === 'amazon_eg' ? '📦' :
                       guardrail.platformCode === 'noon_eg' ? '🟡' :
                       guardrail.platformCode === 'jumia_eg' ? '⭐' :
                       guardrail.platformCode === 'kenzz_eg' ? '💎' :
                       guardrail.platformCode === 'homzmart_eg' ? '🛋️' : '🎵'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-['Alexandria']">
                        {guardrail.platformName}
                      </h4>
                      {isDangerouslyLow && (
                        <span className="text-[10px] font-bold text-rose-700 block">🚨 كسر الحد الأدنى!</span>
                      )}
                      {isApproaching && (
                        <span className="text-[10px] font-bold text-sky-700 block">⚠️ اقتراب من الحد (+{prox.distanceToFloorEGP} ج.م)</span>
                      )}
                    </div>
                  </div>

                  {/* Floor Lock Button */}
                  <button
                    onClick={() => handleToggleFloorLock(guardrail.platformCode)}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      guardrail.isFloorPriceLocked
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                    title={guardrail.isFloorPriceLocked ? 'الحد الأدنى مقفول ومحمي' : 'انقر لقفل الحد الأدنى'}
                  >
                    {guardrail.isFloorPriceLocked ? <Lock className="w-3.5 h-3.5 text-emerald-700" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="text-[10px]">{guardrail.isFloorPriceLocked ? 'مقفول' : 'مفتوح'}</span>
                  </button>
                </div>

                {/* Price Controls Input Fields */}
                <div className="space-y-3 text-xs">
                  {/* Actual Selling Price */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      السعر الفعلي المعتمد للبيع (ج.م):
                    </label>
                    <input
                      type="number"
                      value={guardrail.actualSellingPrice}
                      onChange={(e) => handleUpdateGuardrail(guardrail.platformCode, 'actualSellingPrice', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Min and Max Guardrails Dual Input */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-rose-700 block mb-1">
                        الحد الأدنى (Floor):
                      </label>
                      <input
                        type="number"
                        value={guardrail.minAllowedPrice}
                        onChange={(e) => handleUpdateGuardrail(guardrail.platformCode, 'minAllowedPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-rose-200 bg-white text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-indigo-700 block mb-1">
                        الحد الأقصى (Ceiling):
                      </label>
                      <input
                        type="number"
                        value={guardrail.maxAllowedPrice}
                        onChange={(e) => handleUpdateGuardrail(guardrail.platformCode, 'maxAllowedPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-indigo-200 bg-white text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Platform Commission info */}
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>عمولة المنصة: <strong>{guardrail.platformCommissionPercent}%</strong></span>
                    <span>رسوم ثابتة: <strong>{guardrail.platformFixedFeeEGP} ج.م</strong></span>
                  </div>
                </div>

                {/* Net Profit & Margin Card Badge */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isProfitable ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div>
                    <span className="text-[10px] block opacity-80">صافي الربح التقديري:</span>
                    <span className="text-sm font-black font-mono">
                      {guardrail.netProfitEGP > 0 ? '+' : ''}{guardrail.netProfitEGP.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] block opacity-80">هامش الربح الصافي:</span>
                    <span className="text-sm font-black font-mono">
                      {guardrail.netMarginPercent}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
