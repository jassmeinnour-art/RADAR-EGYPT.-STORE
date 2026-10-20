import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingDown,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  Sliders,
  X,
  Scale,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  ProductData,
  ProductInventoryRecord,
  VelocityAnalysisResult
} from '../types';
import { calculateSalesVelocityAndEOQ } from '../utils/inventoryVelocityHelper';

interface OptimalReorderAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductData[];
  inventory: ProductInventoryRecord[];
  onApplyOptimalReorderQty: (productId: string, optimalQty: number) => void;
  onBatchApplyAllOptimalQty: () => void;
  currency?: string;
  onShowToast?: (message: string) => void;
}

export const OptimalReorderAdvisorModal: React.FC<OptimalReorderAdvisorModalProps> = ({
  isOpen,
  onClose,
  products,
  inventory,
  onApplyOptimalReorderQty,
  onBatchApplyAllOptimalQty,
  currency = 'EGP',
  onShowToast
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'high_savings' | 'proactive_urgent'>('all');

  if (!isOpen) return null;

  const productMap = new Map(products.map(p => [p.id, p]));

  // Calculate velocity and EOQ analysis for each inventory item
  const analyzedItems = inventory.map(item => {
    const prod = productMap.get(item.productId);
    const analysis = calculateSalesVelocityAndEOQ(item, prod);
    return {
      item,
      product: prod,
      analysis
    };
  });

  // Total holding cost savings across all items
  const totalPotentialSavings = analyzedItems.reduce(
    (sum, a) => sum + a.analysis.holdingCostSavingsAnnualEGP,
    0
  );

  const urgentCount = analyzedItems.filter(a => a.analysis.isProactiveUrgent).length;
  const highSavingsCount = analyzedItems.filter(a => a.analysis.holdingCostSavingsAnnualEGP > 500).length;

  const filteredItems = analyzedItems.filter(a => {
    if (filterMode === 'proactive_urgent') return a.analysis.isProactiveUrgent;
    if (filterMode === 'high_savings') return a.analysis.holdingCostSavingsAnnualEGP > 500;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div
        id="modal-optimal-reorder-advisor"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <Zap className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">محلل سرعة البيع وكمية إعادة الطلب المثالية (Optimal Reorder & EOQ)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/30 text-sky-200 border border-sky-400/40">
                  ذكاء اقتصادي استباقي 💡
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تحليل معدل التصريف اليومي، تقليل تكاليف التخزين، وحساب الحجم الاقتصادي الأمثل للدفعة (EOQ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="p-5 bg-gradient-to-b from-sky-50/70 to-white border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-sky-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              إجمالي وفر تكاليف التخزين المتوقع
            </span>
            <div className="text-xl font-black text-emerald-600">
              {totalPotentialSavings.toLocaleString()} <span className="text-xs font-bold text-slate-500">{currency} / سنة</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              بتطبيق كميات الطلب الاقتصادية المثالية
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-sky-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              أصناف مهددة بالنفاد قبل التوريد
            </span>
            <div className="text-xl font-black text-rose-600">
              {urgentCount} <span className="text-xs font-bold text-slate-500">أصناف حرجة</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              مدة التغطية المتبقية أقل من مهلة شحن المورد!
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-sky-200/80 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              إجراء جماعي سريع
            </span>
            <button
              id="btn-apply-all-optimal-eoq"
              type="button"
              onClick={() => {
                onBatchApplyAllOptimalQty();
                if (onShowToast) {
                  onShowToast(`⚡ تم بنجاح تطبيق كميات إعادة الطلب المثالية (EOQ) على جميع أصناف المخزون (${inventory.length} صنف) لتحقيق وفورات تخزين سنوية بقيمة ${totalPotentialSavings.toLocaleString()} ${currency}.`);
                }
              }}
              className="w-full py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>تطبيق الكميات المثالية للكل دفعة واحدة</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              كل الأصناف ({analyzedItems.length})
            </button>
            <button
              onClick={() => setFilterMode('proactive_urgent')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                filterMode === 'proactive_urgent'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>مهددة بالنفاد قبل التوريد ({urgentCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('high_savings')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                filterMode === 'high_savings'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>أعلى وفورات تخزين (&gt; 500 ج.م) ({highSavingsCount})</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            معادلة EOQ تحسب التوازن الدقيق بين مصاريف الشحن وتكاليف إشغال مساحة المخزن
          </span>
        </div>

        {/* Products Table */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filteredItems.map(({ item, product, analysis }) => {
            const isApplied = item.reorderQuantity === analysis.optimalReorderQty;

            return (
              <div
                key={item.productId}
                className={`p-4 rounded-2xl border transition-all ${
                  analysis.isProactiveUrgent
                    ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400/30'
                    : analysis.holdingCostSavingsAnnualEGP > 500
                    ? 'bg-emerald-50/40 border-emerald-300/80'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  {/* Product Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={product?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                      alt={product?.title || item.sku}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs line-clamp-1">
                        {product?.title || item.sku}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                        <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-700">
                          {item.sku}
                        </span>
                        <span>الرصيد الحالي: <strong>{item.currentStock} ق</strong></span>
                        <span>•</span>
                        <span>مهلة التوريد: <strong>{item.leadTimeDays} أيام</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Velocity Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center p-2 rounded-xl bg-white border border-slate-200 min-w-[110px]">
                      <span className="text-[10px] text-slate-500 font-bold block">معدل سرعة البيع (Velocity)</span>
                      <span className="text-xs font-black text-slate-900">
                        {analysis.dailyVelocity} ق/يوم
                      </span>
                      <span className="text-[9px] block text-sky-700 font-semibold">
                        (~{analysis.monthlyVelocity} شهرياً)
                      </span>
                    </div>

                    {/* Stockout Timeline */}
                    <div className="text-center p-2 rounded-xl bg-white border border-slate-200 min-w-[110px]">
                      <span className="text-[10px] text-slate-500 font-bold block">مدة التغطية المتبقية</span>
                      <span className={`text-xs font-black ${
                        analysis.isProactiveUrgent ? 'text-rose-600 animate-pulse' : 'text-slate-800'
                      }`}>
                        {analysis.daysUntilStockout} يوم
                      </span>
                      <span className="text-[9px] block text-slate-500">
                        النفاد التقديري: {analysis.stockoutRiskDate}
                      </span>
                    </div>

                    {/* Comparison Box */}
                    <div className="text-center p-2 rounded-xl bg-sky-50 border border-sky-200 min-w-[130px]">
                      <span className="text-[10px] text-sky-800 font-bold block">كمية الطلب المثالية (EOQ)</span>
                      <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-sm font-black text-sky-900">
                          {analysis.optimalReorderQty} ق
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          ({item.reorderQuantity} ق)
                        </span>
                      </div>
                      {analysis.holdingCostSavingsAnnualEGP > 0 ? (
                        <span className="text-[9px] text-emerald-700 font-bold block">
                          وفر ~{analysis.holdingCostSavingsAnnualEGP.toLocaleString()} {currency}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 block">كمية متوازنة ✓</span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      disabled={isApplied}
                      onClick={() => {
                        onApplyOptimalReorderQty(item.productId, analysis.optimalReorderQty);
                        if (onShowToast) {
                          onShowToast(`✅ تم تحديث كمية إعادة الطلب للمنتج إلى (${analysis.optimalReorderQty} قطعة) لتقليل تكاليف التخزين.`);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        isApplied
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 opacity-80 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تم تطبيق المثالي</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>تطبيق المثالي ⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Recommendation Footer Note */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{analysis.reorderRecommendation}</span>
                  </span>
                  <span className="text-slate-400 text-[10px] hidden md:inline">
                    دورة التوريد المثالية: كل {analysis.cycleDaysOptimal} يوماً
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-600">
            وفر سنوي إجمالي محتمل: <strong className="text-emerald-700 font-bold">{totalPotentialSavings.toLocaleString()} {currency}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
