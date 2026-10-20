import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  X, 
  Calculator, 
  Percent, 
  Truck, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Coins, 
  RefreshCw,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import { ProductData } from '../types';

interface FxImportCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct?: ProductData;
  onApplyCostToProduct?: (newWholesaleCost: number) => void;
  currency?: string;
  onShowToast?: (msg: string) => void;
}

export const FxImportCalculatorModal: React.FC<FxImportCalculatorModalProps> = ({
  isOpen,
  onClose,
  currentProduct,
  onApplyCostToProduct,
  currency = 'EGP',
  onShowToast
}) => {
  // Currencies: USD, CNY, EUR, EGP
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'CNY' | 'EUR' | 'EGP'>('USD');
  
  // Default exchange rates to EGP
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 48.50,
    CNY: 6.75,
    EUR: 52.80,
    EGP: 1.00
  });

  // Inputs
  const [unitCostForeign, setUnitCostForeign] = useState<number>(() => {
    if (currentProduct?.estimatedWholesaleCost) {
      return Math.round(currentProduct.estimatedWholesaleCost / 48.5);
    }
    return 35;
  });

  const [shippingPerUnitEgp, setShippingPerUnitEgp] = useState<number>(65); // Freight
  const [customsPercent, setCustomsPercent] = useState<number>(10); // 10% duty
  const [vatPercent, setVatPercent] = useState<number>(14); // 14% Egyptian VAT
  const [localHandlingEgp, setLocalHandlingEgp] = useState<number>(25); // Local warehousing & box
  const [desiredProfitMargin, setDesiredProfitMargin] = useState<number>(25); // 25% net profit margin
  const [platformCommissionPercent, setPlatformCommissionPercent] = useState<number>(14); // 14% marketplace fee

  // Active exchange rate
  const activeRate = exchangeRates[selectedCurrency] || 1;

  // Calculations
  const calculations = useMemo(() => {
    // 1. Purchase cost in EGP
    const purchaseCostEgp = Math.round(unitCostForeign * activeRate);
    
    // 2. Customs Duty in EGP (calculated on purchase cost)
    const customsEgp = Math.round(purchaseCostEgp * (customsPercent / 100));

    // 3. Egyptian VAT 14% (calculated on purchase cost + customs)
    const vatBase = purchaseCostEgp + customsEgp;
    const vatEgp = Math.round(vatBase * (vatPercent / 100));

    // 4. Total Landed Cost per unit (تكلفة الوصول للمستودع)
    const totalLandedCostEgp = purchaseCostEgp + shippingPerUnitEgp + customsEgp + vatEgp + localHandlingEgp;

    // 5. Recommended Retail Selling Price to achieve desired profit after marketplace commission
    // Formula: (LandedCost * (1 + DesiredProfit%)) / (1 - PlatformCommission%)
    const targetProfitAmount = Math.round(totalLandedCostEgp * (desiredProfitMargin / 100));
    const priceBeforeCommission = totalLandedCostEgp + targetProfitAmount;
    const commissionFactor = 1 - (platformCommissionPercent / 100);
    const recommendedSellingPrice = commissionFactor > 0 ? Math.round(priceBeforeCommission / commissionFactor) : priceBeforeCommission;
    const estimatedPlatformFee = Math.round(recommendedSellingPrice * (platformCommissionPercent / 100));
    const netProfitEgp = recommendedSellingPrice - totalLandedCostEgp - estimatedPlatformFee;

    // Percentages of total cost
    const purchaseShare = Math.round((purchaseCostEgp / totalLandedCostEgp) * 100) || 0;
    const shippingShare = Math.round((shippingPerUnitEgp / totalLandedCostEgp) * 100) || 0;
    const customsShare = Math.round((customsEgp / totalLandedCostEgp) * 100) || 0;
    const vatShare = Math.round((vatEgp / totalLandedCostEgp) * 100) || 0;
    const localShare = Math.round((localHandlingEgp / totalLandedCostEgp) * 100) || 0;

    return {
      purchaseCostEgp,
      customsEgp,
      vatEgp,
      totalLandedCostEgp,
      recommendedSellingPrice,
      estimatedPlatformFee,
      netProfitEgp,
      purchaseShare,
      shippingShare,
      customsShare,
      vatShare,
      localShare
    };
  }, [
    unitCostForeign,
    activeRate,
    shippingPerUnitEgp,
    customsPercent,
    vatPercent,
    localHandlingEgp,
    desiredProfitMargin,
    platformCommissionPercent
  ]);

  // Apply to current product
  const handleApplyCost = () => {
    if (onApplyCostToProduct) {
      onApplyCostToProduct(calculations.totalLandedCostEgp);
      if (onShowToast) {
        onShowToast(`تم تحديث تكلفة الجملة للمنتج إلى ${calculations.totalLandedCostEgp.toLocaleString()} ${currency} بناءً على حسابات الاستيراد ⚡`);
      }
      onClose();
    }
  };

  // Export cost sheet CSV
  const handleExportCsv = () => {
    const rows = [
      ['بند التكلفة', 'القيمة'],
      ['العملة الأصلية', selectedCurrency],
      ['سعر الشراء بالعملة الأجنبية', unitCostForeign.toString()],
      ['سعر الصرف المعتمد (ج.م)', activeRate.toString()],
      ['قيمة الشراء بالجنيه المصري', `${calculations.purchaseCostEgp} EGP`],
      ['تكلفة الشحن الدولي للقطعة', `${shippingPerUnitEgp} EGP`],
      [`الجمارك والتخليص (${customsPercent}%)`, `${calculations.customsEgp} EGP`],
      [`ضريبة القيمة المضافة (${vatPercent}%)`, `${calculations.vatEgp} EGP`],
      ['مصاريف التجهيز والمناولة المحلية', `${localHandlingEgp} EGP`],
      ['إجمالي تكلفة الوصول للمخزن (Landed Cost)', `${calculations.totalLandedCostEgp} EGP`],
      [`سعر البيع المقترح بهامش ربح (${desiredProfitMargin}%)`, `${calculations.recommendedSellingPrice} EGP`],
      [`عمولة المنصة المقدرة (${platformCommissionPercent}%)`, `${calculations.estimatedPlatformFee} EGP`],
      ['صافي الربح المتوقع للقطعة', `${calculations.netProfitEgp} EGP`],
      ['تاريخ الحساب', new Date().toLocaleDateString('ar-EG')]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `landed_cost_study_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('تم تصدير دراسة تكلفة الاستيراد إلى ملف CSV بنجاح 📊');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn font-['Cairo'] text-right">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                  حاسبة تكاليف الاستيراد وسعر الصرف (Landed Cost)
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  مصر 🇪🇬
                </span>
              </div>
              <p className="text-xs text-slate-400">
                احتساب تكلفة وصول السلعة للمخزن بعد الشحن الدولي والجمارك والضريبة وتحديد السعر الرابح
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Active Product Banner (if available) */}
          {currentProduct && (
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img 
                  src={currentProduct.imageUrl} 
                  alt={currentProduct.title} 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-slate-400 text-[11px]">المنتج المحدد في الرادار:</span>
                  <p className="font-bold text-white truncate">{currentProduct.title}</p>
                </div>
              </div>
              <div className="text-left shrink-0">
                <span className="text-slate-400 text-[11px] block">تكلفة الجملة الحالية:</span>
                <span className="font-bold text-sky-400">{currentProduct.estimatedWholesaleCost.toLocaleString()} {currency}</span>
              </div>
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Purchase Currency & Rate */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-indigo-400" />
                  <span>عملة وسعر الشراء من المورد</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                  {(['USD', 'CNY', 'EUR', 'EGP'] as const).map(curr => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setSelectedCurrency(curr)}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedCurrency === curr
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">سعر القطعة ({selectedCurrency})</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitCostForeign}
                    onChange={e => setUnitCostForeign(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">سعر الصرف (ج.م)</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.05"
                    value={activeRate}
                    disabled={selectedCurrency === 'EGP'}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 1;
                      setExchangeRates(prev => ({ ...prev, [selectedCurrency]: val }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>معادل الشراء بالجنيه المصري:</span>
                <span className="font-bold text-white text-xs">{calculations.purchaseCostEgp.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Freight & Customs Inputs */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>الشحن الدولي والجمارك والضريبة</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">شحن دولي للقطعة (ج.م)</span>
                  <input
                    type="number"
                    min="0"
                    value={shippingPerUnitEgp}
                    onChange={e => setShippingPerUnitEgp(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">نسبة الجمارك %</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customsPercent}
                    onChange={e => setCustomsPercent(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">ضريبة القيمة المضافة %</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vatPercent}
                    onChange={e => setVatPercent(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">مناولة وتغليف محلي (ج.م)</span>
                  <input
                    type="number"
                    min="0"
                    value={localHandlingEgp}
                    onChange={e => setLocalHandlingEgp(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Margin Targets */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>أهداف الربح وعمولات المنصات المقدرة</span>
              </label>
              <span className="text-[11px] text-slate-400">
                هامش ربح صافي: <strong className="text-emerald-400">{desiredProfitMargin}%</strong> • عمولة المنصة: <strong className="text-indigo-400">{platformCommissionPercent}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">هامش الربح الصافي المرغوب فيه %</span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={desiredProfitMargin}
                  onChange={e => setDesiredProfitMargin(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">عمولة المنصة المقدرة % (أمازون / نون / جوميا)</span>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={platformCommissionPercent}
                  onChange={e => setPlatformCommissionPercent(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Result Cards Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Landed Cost */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-right">
              <span className="text-[11px] text-indigo-300 font-bold block">إجمالي تكلفة الواصل (Landed Cost)</span>
              <p className="text-2xl font-black text-white mt-1 font-['Alexandria']">
                {calculations.totalLandedCostEgp.toLocaleString()} <span className="text-sm font-normal text-indigo-300">ج.م</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                شراء + شحن + جمارك + ضريبة + مناولة
              </p>
            </div>

            {/* Recommended Selling Price */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-right">
              <span className="text-[11px] text-emerald-300 font-bold block">سعر البيع المقترح للمنصات</span>
              <p className="text-2xl font-black text-emerald-300 mt-1 font-['Alexandria']">
                {calculations.recommendedSellingPrice.toLocaleString()} <span className="text-sm font-normal text-emerald-400">ج.م</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                يشمل تغطية عمولة المنصة وهامش الربح
              </p>
            </div>

            {/* Net Profit per Unit */}
            <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-right">
              <span className="text-[11px] text-sky-300 font-bold block">صافي الربح المتوقع للقطعة</span>
              <p className="text-2xl font-black text-sky-300 mt-1 font-['Alexandria']">
                +{calculations.netProfitEgp.toLocaleString()} <span className="text-sm font-normal text-sky-400">ج.م</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                بعد سداد كافة المصاريف وعمولة المنصة
              </p>
            </div>
          </div>

          {/* Breakdown Progress Bar */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-right">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>توزيع بنود التكلفة الإجمالية للسلعة</span>
              <span className="text-slate-400 text-[11px]">100% من سعر المخزن</span>
            </div>
            
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${calculations.purchaseShare}%` }} className="bg-indigo-500 h-full" title={`الشراء: ${calculations.purchaseShare}%`} />
              <div style={{ width: `${calculations.shippingShare}%` }} className="bg-blue-500 h-full" title={`الشحن: ${calculations.shippingShare}%`} />
              <div style={{ width: `${calculations.customsShare}%` }} className="bg-purple-500 h-full" title={`الجمارك: ${calculations.customsShare}%`} />
              <div style={{ width: `${calculations.vatShare}%` }} className="bg-sky-500 h-full" title={`الضريبة: ${calculations.vatShare}%`} />
              <div style={{ width: `${calculations.localShare}%` }} className="bg-emerald-500 h-full" title={`المناولة: ${calculations.localShare}%`} />
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>الشراء ({calculations.purchaseShare}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>الشحن ({calculations.shippingShare}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>الجمارك ({calculations.customsShare}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>ضريبة 14% ({calculations.vatShare}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>مناولة ({calculations.localShare}%)</span>
              </span>
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير دراسة التكلفة (CSV)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>

            {currentProduct && onApplyCostToProduct && (
              <button
                type="button"
                onClick={handleApplyCost}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all active:scale-95"
              >
                <PackageCheck className="w-4 h-4" />
                <span>تطبيق التكلفة على المنتج في الرادار ({calculations.totalLandedCostEgp.toLocaleString()} ج.م)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
