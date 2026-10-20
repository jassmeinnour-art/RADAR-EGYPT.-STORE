import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  DollarSign,
  Percent,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Tag,
  ArrowLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Info,
  Layers,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductSalesPerformance } from '../types';

export type UnifiedRepriceStrategy =
  | 'fixed_margin_egp'       // Cost + Fixed EGP
  | 'fixed_margin_percent'   // Cost + Margin %
  | 'discount_percent'       // Current Price - Discount %
  | 'markup_percent'         // Current Price + Markup %
  | 'undercut_competitor'    // Lowest Competitor - Value (EGP or %)
  | 'match_competitor'       // Match Lowest Competitor
  | 'fixed_price';           // Specific Fixed Price

export type RoundingMode = 'none' | 'charm_9' | 'round_5' | 'round_10';

interface UnifiedBulkRepriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: ProductSalesPerformance[];
  currency?: string;
  onConfirmApply: (updates: { productId: string; newPrice: number; oldPrice: number; strategyName: string }[]) => void;
  onShowToast?: (message: string) => void;
}

export const UnifiedBulkRepriceModal: React.FC<UnifiedBulkRepriceModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  currency = 'EGP',
  onConfirmApply,
  onShowToast
}) => {
  // Strategy state
  const [strategy, setStrategy] = useState<UnifiedRepriceStrategy>('discount_percent');
  
  // Strategy numeric inputs
  const [marginEgpValue, setMarginEgpValue] = useState<number>(50);
  const [marginPercentValue, setMarginPercentValue] = useState<number>(20);
  const [discountPercentValue, setDiscountPercentValue] = useState<number>(5);
  const [markupPercentValue, setMarkupPercentValue] = useState<number>(5);
  const [undercutValue, setUndercutValue] = useState<number>(2);
  const [undercutType, setUndercutType] = useState<'egp' | 'percent'>('percent');
  const [fixedPriceValue, setFixedPriceValue] = useState<number>(299);

  // Guardrails and rounding
  const [protectWholesaleCost, setProtectWholesaleCost] = useState<boolean>(true);
  const [minSafetyMarginPercent, setMinSafetyMarginPercent] = useState<number>(5); // at least cost + 5%
  const [roundingMode, setRoundingMode] = useState<RoundingMode>('charm_9');

  // Individual manual overrides (productId -> customPrice)
  const [manualPriceOverrides, setManualPriceOverrides] = useState<Record<string, number>>({});
  
  // List of excluded product IDs within this modal session
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);

  // Filter active products in modal
  const activeModalProducts = useMemo(() => {
    return selectedProducts.filter(p => !excludedProductIds.includes(p.productId));
  }, [selectedProducts, excludedProductIds]);

  // Rounding helper
  const applyRounding = (rawPrice: number, mode: RoundingMode): number => {
    const val = Math.round(rawPrice);
    if (val <= 10) return Math.max(1, val);

    switch (mode) {
      case 'charm_9': {
        // e.g. 284 -> 289, 290 -> 289, 305 -> 299 or ending with 9
        const lastDigit = val % 10;
        if (lastDigit === 9) return val;
        if (lastDigit < 9) {
          const base = Math.floor(val / 10) * 10;
          return base + 9;
        }
        return val;
      }
      case 'round_5': {
        return Math.round(val / 5) * 5;
      }
      case 'round_10': {
        return Math.round(val / 10) * 10;
      }
      case 'none':
      default:
        return val;
    }
  };

  // Strategy descriptive name
  const getStrategyName = (): string => {
    switch (strategy) {
      case 'fixed_margin_egp':
        return `هامش ربح ثابت (+${marginEgpValue} ${currency} فوق التكلفة)`;
      case 'fixed_margin_percent':
        return `هامش ربح مئوي (+${marginPercentValue}% فوق التكلفة)`;
      case 'discount_percent':
        return `خصم مئوي (-${discountPercentValue}% على السعر الحالي)`;
      case 'markup_percent':
        return `زيادة مئوية (+${markupPercentValue}% على السعر الحالي)`;
      case 'undercut_competitor':
        return `اقتناص الـ Buy Box (${undercutType === 'percent' ? `-${undercutValue}%` : `-${undercutValue} ${currency}`} تحت أرخص منافس)`;
      case 'match_competitor':
        return 'مطابقة أرخص سعر منافس بالسوق';
      case 'fixed_price':
        return `سعر موحد ثابت (${fixedPriceValue} ${currency})`;
      default:
        return 'تسعير موحد مخصص';
    }
  };

  // Calculate new price for a given product based on strategy and options
  const calculateProductPrice = (prod: ProductSalesPerformance): {
    calculatedPrice: number;
    finalPrice: number;
    isOverridden: boolean;
    isCostCapped: boolean;
    profitMarginPercent: number;
    isWinningBuyBox: boolean;
    priceDiffFromCurrent: number;
  } => {
    let raw = prod.currentPrice;

    switch (strategy) {
      case 'fixed_margin_egp': {
        raw = prod.costPrice + Number(marginEgpValue || 0);
        break;
      }
      case 'fixed_margin_percent': {
        const factor = 1 + (Number(marginPercentValue || 0) / 100);
        raw = prod.costPrice * factor;
        break;
      }
      case 'discount_percent': {
        const factor = 1 - (Number(discountPercentValue || 0) / 100);
        raw = prod.currentPrice * factor;
        break;
      }
      case 'markup_percent': {
        const factor = 1 + (Number(markupPercentValue || 0) / 100);
        raw = prod.currentPrice * factor;
        break;
      }
      case 'undercut_competitor': {
        const compPrice = prod.lowestCompetitorPrice || prod.currentPrice;
        if (undercutType === 'percent') {
          raw = compPrice * (1 - (Number(undercutValue || 0) / 100));
        } else {
          raw = compPrice - Number(undercutValue || 0);
        }
        break;
      }
      case 'match_competitor': {
        raw = prod.lowestCompetitorPrice || prod.currentPrice;
        break;
      }
      case 'fixed_price': {
        raw = Number(fixedPriceValue || 1);
        break;
      }
    }

    // Apply rounding
    let rounded = applyRounding(raw, roundingMode);

    // Apply Cost Protection Guardrail
    let isCostCapped = false;
    if (protectWholesaleCost && prod.costPrice > 0) {
      const minSafePrice = Math.round(prod.costPrice * (1 + (minSafetyMarginPercent / 100)));
      if (rounded < minSafePrice) {
        rounded = minSafePrice;
        isCostCapped = true;
      }
    }

    // Check manual override
    const isOverridden = manualPriceOverrides[prod.productId] !== undefined;
    const finalPrice = isOverridden ? manualPriceOverrides[prod.productId] : Math.max(1, rounded);

    // Margin calculations
    const profitMarginPercent = prod.costPrice > 0 
      ? Math.round(((finalPrice - prod.costPrice) / finalPrice) * 100)
      : 0;

    const isWinningBuyBox = finalPrice <= prod.lowestCompetitorPrice;
    const priceDiffFromCurrent = finalPrice - prod.currentPrice;

    return {
      calculatedPrice: rounded,
      finalPrice,
      isOverridden,
      isCostCapped,
      profitMarginPercent,
      isWinningBuyBox,
      priceDiffFromCurrent
    };
  };

  // Preview data computed for all active products
  const previewItems = useMemo(() => {
    return activeModalProducts.map(prod => {
      const calc = calculateProductPrice(prod);
      return {
        product: prod,
        ...calc
      };
    });
  }, [
    activeModalProducts, 
    strategy, 
    marginEgpValue, 
    marginPercentValue, 
    discountPercentValue, 
    markupPercentValue, 
    undercutValue, 
    undercutType, 
    fixedPriceValue, 
    protectWholesaleCost, 
    minSafetyMarginPercent, 
    roundingMode, 
    manualPriceOverrides
  ]);

  // Summary Metrics of the batch update
  const summaryMetrics = useMemo(() => {
    if (previewItems.length === 0) {
      return {
        count: 0,
        currentAvgPrice: 0,
        newAvgPrice: 0,
        avgPriceChangePercent: 0,
        buyBoxWonBefore: 0,
        buyBoxWonAfter: 0,
        avgProfitMargin: 0
      };
    }

    const count = previewItems.length;
    const currentSum = previewItems.reduce((acc, item) => acc + item.product.currentPrice, 0);
    const newSum = previewItems.reduce((acc, item) => acc + item.finalPrice, 0);
    const buyBoxWonBefore = previewItems.filter(item => item.product.buyBoxStatus === 'won').length;
    const buyBoxWonAfter = previewItems.filter(item => item.isWinningBuyBox).length;
    const avgProfitMargin = Math.round(previewItems.reduce((acc, item) => acc + item.profitMarginPercent, 0) / count);

    const currentAvgPrice = Math.round(currentSum / count);
    const newAvgPrice = Math.round(newSum / count);
    const avgPriceChangePercent = currentAvgPrice > 0 
      ? Math.round(((newAvgPrice - currentAvgPrice) / currentAvgPrice) * 100)
      : 0;

    return {
      count,
      currentAvgPrice,
      newAvgPrice,
      avgPriceChangePercent,
      buyBoxWonBefore,
      buyBoxWonAfter,
      avgProfitMargin
    };
  }, [previewItems]);

  // Handle individual override change
  const handlePriceOverrideChange = (productId: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setManualPriceOverrides(prev => ({
        ...prev,
        [productId]: num
      }));
    } else if (val === '') {
      setManualPriceOverrides(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Reset all manual overrides
  const handleResetOverrides = () => {
    setManualPriceOverrides({});
    if (onShowToast) onShowToast('تمت استعادة الأسعار المحسوبة تلقائياً.');
  };

  // Exclude single product
  const handleExcludeProduct = (productId: string) => {
    setExcludedProductIds(prev => [...prev, productId]);
  };

  // Handle Submit Bulk Repricing
  const handleConfirmSubmit = () => {
    if (previewItems.length === 0) {
      if (onShowToast) onShowToast('يرجى تحديد منتج واحد على الأقل للتسعير.');
      return;
    }

    const updates = previewItems.map(item => ({
      productId: item.product.productId,
      newPrice: item.finalPrice,
      oldPrice: item.product.currentPrice,
      strategyName: getStrategyName()
    }));

    onConfirmApply(updates);

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (onShowToast) {
      onShowToast(`تم تطبيق التسعير الموحد بنجاح على ${updates.length} منتج! ⚡ (${getStrategyName()})`);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  تطبيق تسعير موحد جماعي على المنتجات
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500 text-white shadow-xs">
                  {previewItems.length} منتجات محددة
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تحديد استراتيجية سعرية موحدة مع حماية هامش الربح ومعاينة التأثير قبل الاعتماد الفوري.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

          {/* SECTION 1: Unified Strategy Selector */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>1. اختر استراتيجية التسعير الموحد:</span>
              </h4>
              <span className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg font-bold border border-indigo-100">
                {getStrategyName()}
              </span>
            </div>

            {/* Strategy Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* 1. Fixed Margin EGP */}
              <button
                type="button"
                onClick={() => setStrategy('fixed_margin_egp')}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  strategy === 'fixed_margin_egp'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                      هامش ربح ثابت فوق التكلفة
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      +{marginEgpValue} {currency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    السعر الجديد = سعر التكلفة بالجملة + مبلغ هامش ربح محدد.
                  </p>
                </div>
                {strategy === 'fixed_margin_egp' && (
                  <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-slate-700 font-bold">المبلغ:</span>
                    <input
                      type="number"
                      min="1"
                      value={marginEgpValue}
                      onChange={(e) => setMarginEgpValue(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-24 px-2.5 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-500">{currency}</span>
                  </div>
                )}
              </button>

              {/* 2. Fixed Margin Percent */}
              <button
                type="button"
                onClick={() => setStrategy('fixed_margin_percent')}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  strategy === 'fixed_margin_percent'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      هامش ربح مئوي فوق التكلفة
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      +{marginPercentValue}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    السعر الجديد = سعر التكلفة + نسبة مئوية محددة من التكلفة.
                  </p>
                </div>
                {strategy === 'fixed_margin_percent' && (
                  <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-slate-700 font-bold">النسبة:</span>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={marginPercentValue}
                      onChange={(e) => setMarginPercentValue(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-20 px-2.5 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-500">%</span>
                    <div className="flex gap-1 mr-auto">
                      {[15, 20, 30].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setMarginPercentValue(pct)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-100 text-[10px] font-bold text-slate-700 rounded cursor-pointer"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </button>

              {/* 3. Discount Percent */}
              <button
                type="button"
                onClick={() => setStrategy('discount_percent')}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  strategy === 'discount_percent'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                      خصم نسبة مئوية على السعر الحالي
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      -{discountPercentValue}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    تخفيض السعر الحالي بنسبة مئوية لتنشيط المبيعات وسرعة التدوير.
                  </p>
                </div>
                {strategy === 'discount_percent' && (
                  <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-slate-700 font-bold">نسبة الخصم:</span>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercentValue}
                      onChange={(e) => setDiscountPercentValue(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-20 px-2.5 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-500">%</span>
                    <div className="flex gap-1 mr-auto">
                      {[5, 10, 15].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountPercentValue(pct)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-100 text-[10px] font-bold text-slate-700 rounded cursor-pointer"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </button>

              {/* 4. Markup Percent */}
              <button
                type="button"
                onClick={() => setStrategy('markup_percent')}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  strategy === 'markup_percent'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      زيادة نسبة مئوية على السعر الحالي
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +{markupPercentValue}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    رفع السعر الحالي بنسبة موحدة لمواكبة التضخم أو زيادة هوامش الأرباح.
                  </p>
                </div>
                {strategy === 'markup_percent' && (
                  <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-slate-700 font-bold">نسبة الزيادة:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={markupPercentValue}
                      onChange={(e) => setMarkupPercentValue(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-20 px-2.5 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-500">%</span>
                    <div className="flex gap-1 mr-auto">
                      {[3, 5, 10].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setMarkupPercentValue(pct)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-100 text-[10px] font-bold text-slate-700 rounded cursor-pointer"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </button>

              {/* 5. Undercut Lowest Competitor */}
              <button
                type="button"
                onClick={() => setStrategy('undercut_competitor')}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  strategy === 'undercut_competitor'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                      اقتناص الـ Buy Box تحت المنافس
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                      -{undercutValue} {undercutType === 'percent' ? '%' : currency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    التسعير أسفل أرخص منافس بالسوق بفارق طفيف لضمان الصدارة.
                  </p>
                </div>
                {strategy === 'undercut_competitor' && (
                  <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-slate-700 font-bold">الفارق:</span>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={undercutValue}
                      onChange={(e) => setUndercutValue(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-20 px-2.5 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={undercutType}
                      onChange={(e) => setUndercutType(e.target.value as 'egp' | 'percent')}
                      className="px-2 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-indigo-900 focus:outline-none"
                    >
                      <option value="percent">% نسبة مئوية</option>
                      <option value="egp">{currency} مبلغ ثابت</option>
                    </select>
                  </div>
                )}
              </button>

              {/* 6. Match Lowest Competitor & Fixed Price */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStrategy('match_competitor')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    strategy === 'match_competitor'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="font-black text-xs text-slate-900 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-indigo-600" />
                    مطابقة المنافس
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    مساواة سعر أرخص منافس تماماً
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStrategy('fixed_price')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    strategy === 'fixed_price'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="font-black text-xs text-slate-900 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    سعر موحد ثابت
                  </span>
                  {strategy === 'fixed_price' ? (
                    <div className="mt-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="number"
                        min="1"
                        value={fixedPriceValue}
                        onChange={(e) => setFixedPriceValue(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-0.5 bg-white border border-indigo-300 rounded text-xs font-bold text-indigo-900"
                        placeholder="السعر..."
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 mt-1">
                      تعيين نفس السعر للكل
                    </span>
                  )}
                </button>
              </div>

            </div>

            {/* SECTION 2: Guardrails & Psychological Pricing Options */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Cost Protection Guardrail */}
              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="chk-protect-wholesale-cost"
                  checked={protectWholesaleCost}
                  onChange={(e) => setProtectWholesaleCost(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <div className="text-xs">
                  <label htmlFor="chk-protect-wholesale-cost" className="font-bold text-slate-900 cursor-pointer flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    تفعيل صمام الأمان (حماية سعر التكلفة بالجملة)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    منع بيع أي منتج بأقل من التكلفة + حد أمان أدنى 
                    <span className="font-bold text-indigo-700 mx-1">({minSafetyMarginPercent}%)</span>.
                  </p>
                </div>
              </div>

              {/* Psychological Rounding Rule */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    تقريب الأسعار التسويقي:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    طريقة تهيئة نهايات الأسعار
                  </span>
                </div>
                <select
                  value={roundingMode}
                  onChange={(e) => setRoundingMode(e.target.value as RoundingMode)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="charm_9">نهاية تسويقية (9 مثل 299)</option>
                  <option value="round_5">أقرب 5 مضاعفات (295, 300)</option>
                  <option value="round_10">أقرب 10 (290, 300)</option>
                  <option value="none">بدون تقريب تسويقي</option>
                </select>
              </div>

            </div>

          </div>

          {/* SECTION 3: Live Batch Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium block">متوسط السعر قبل vs بعد:</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-sm line-through text-slate-400 font-mono">
                  {summaryMetrics.currentAvgPrice.toLocaleString()}
                </span>
                <span className="text-base font-black text-indigo-900 font-mono">
                  {summaryMetrics.newAvgPrice.toLocaleString()} {currency}
                </span>
              </div>
              <span className={`text-[10px] font-bold mt-0.5 inline-block ${
                summaryMetrics.avgPriceChangePercent <= 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {summaryMetrics.avgPriceChangePercent >= 0 ? '+' : ''}{summaryMetrics.avgPriceChangePercent}% متوسط التغير
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium block">صدارة الـ Buy Box:</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-sm text-slate-400 font-bold">
                  {summaryMetrics.buyBoxWonBefore} منتج
                </span>
                <ArrowLeft className="w-3 h-3 text-slate-400" />
                <span className="text-base font-black text-emerald-600">
                  {summaryMetrics.buyBoxWonAfter} منتج 🏆
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                {summaryMetrics.buyBoxWonAfter >= summaryMetrics.buyBoxWonBefore ? 'زيادة فرصة الفوز بالصدارة' : 'تراجع محتمل'}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium block">متوسط هامش الربح:</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-black text-slate-900 font-mono">
                  %{summaryMetrics.avgProfitMargin}
                </span>
                <span className="text-xs text-slate-500">صافي بعد التكلفة</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                فوق سعر التكلفة بالجملة
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-medium block">التعديلات اليدوية:</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-slate-700">
                  {Object.keys(manualPriceOverrides).length} استثناء مخصص
                </span>
                {Object.keys(manualPriceOverrides).length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetOverrides}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                  >
                    إلغاء المخصص
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                يمكنك تخصيص أي منتج بالجدول
              </span>
            </div>

          </div>

          {/* SECTION 4: Live Interactive Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <span>معاينة الأسعار قبل التطبيق ({previewItems.length} منتج):</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                * يمكنك كتابة سعر مخصص يدوياً في خانة السعر الجديد لأي منتج محدد.
              </span>
            </div>

            <div className="overflow-x-auto max-h-72 custom-scrollbar">
              <table className="w-full min-w-[760px] text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200 sticky top-0 bg-slate-100 z-10">
                    <th className="py-2.5 px-3">المنتج والتصنيف</th>
                    <th className="py-2.5 px-2 text-center">التكلفة</th>
                    <th className="py-2.5 px-2 text-center">السعر الحالي</th>
                    <th className="py-2.5 px-2 text-center">أرخص منافس</th>
                    <th className="py-2.5 px-3 text-center min-w-[140px]">السعر الجديد المقترح</th>
                    <th className="py-2.5 px-2 text-center">الفارق</th>
                    <th className="py-2.5 px-2 text-center">هامش الربح</th>
                    <th className="py-2.5 px-2 text-center">الـ Buy Box</th>
                    <th className="py-2.5 px-2 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewItems.map((item) => {
                    const prod = item.product;
                    return (
                      <tr key={prod.productId} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Product Title */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={prod.productImage}
                              alt={prod.productTitle}
                              className="w-9 h-9 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate max-w-[180px] sm:max-w-[220px]" title={prod.productTitle}>
                                <bdi>{prod.productTitle}</bdi>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                <bdi>{prod.sku} • {prod.productBrand}</bdi>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cost Price */}
                        <td className="py-2 px-2 text-center font-mono text-slate-600">
                          <bdi>{prod.costPrice.toLocaleString()} {currency}</bdi>
                        </td>

                        {/* Current Price */}
                        <td className="py-2 px-2 text-center font-mono text-slate-500">
                          <bdi>{prod.currentPrice.toLocaleString()} {currency}</bdi>
                        </td>

                        {/* Lowest Competitor */}
                        <td className="py-2 px-2 text-center font-mono text-sky-700 font-bold">
                          <bdi>{prod.lowestCompetitorPrice.toLocaleString()} {currency}</bdi>
                        </td>

                        {/* Editable New Price */}
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={item.finalPrice}
                              onChange={(e) => handlePriceOverrideChange(prod.productId, e.target.value)}
                              className={`w-24 px-2 py-1 text-center font-black rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                item.isOverridden
                                  ? 'bg-sky-50 border-sky-400 text-sky-900'
                                  : 'bg-indigo-50/50 border-indigo-200 text-indigo-900'
                              }`}
                            />
                            <span className="text-[10px] text-slate-400">{currency}</span>
                          </div>
                          {item.isCostCapped && (
                            <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                              🛡️ تم تعديله لحماية التكلفة
                            </span>
                          )}
                          {item.isOverridden && (
                            <span className="text-[9px] text-sky-700 font-bold block mt-0.5">
                              ✏️ استثناء مخصص يدوي
                            </span>
                          )}
                        </td>

                        {/* Price Diff */}
                        <td className="py-2 px-2 text-center">
                          <span className={`font-bold font-mono text-xs ${
                            item.priceDiffFromCurrent <= 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            <bdi>{item.priceDiffFromCurrent >= 0 ? '+' : ''}{item.priceDiffFromCurrent.toLocaleString()}</bdi>
                          </span>
                        </td>

                        {/* Profit Margin */}
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.profitMarginPercent >= 20
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.profitMarginPercent >= 10
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {item.profitMarginPercent}%
                          </span>
                        </td>

                        {/* Buy Box Won Status */}
                        <td className="py-2 px-2 text-center">
                          {item.isWinningBuyBox ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              فائز
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              خاسر
                            </span>
                          )}
                        </td>

                        {/* Actions (Exclude from batch) */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleExcludeProduct(prod.productId)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="استبعاد هذا المنتج من التحديث الجماعي"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              سيتم تحديث سجل أسعار كافة المنتجات المحددة وتحديث حالة التنافس فوراً.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              id="btn-confirm-apply-unified-bulk-pricing"
              onClick={handleConfirmSubmit}
              disabled={previewItems.length === 0}
              className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-sky-300" />
              <span>تأكيد وتطبيق التسعير الموحد على ({previewItems.length}) منتج 🚀</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
