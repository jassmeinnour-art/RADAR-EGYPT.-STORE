import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  AlertTriangle,
  Clock,
  Box,
  Truck,
  Sparkles,
  Send,
  RefreshCw,
  Zap,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  Store,
  Layers
} from 'lucide-react';
import { MerchantCatalogProduct } from '../types';
import {
  StockoutPrediction,
  calculateProductStockoutMetrics,
  fetchAIStockoutForecast
} from '../services/inventoryForecastService';

interface StockForecastModalProps {
  product: MerchantCatalogProduct;
  isOpen: boolean;
  onClose: () => void;
  onOpenWhatsAppSupplier?: (product: MerchantCatalogProduct, qty: number) => void;
}

export const StockForecastModal: React.FC<StockForecastModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenWhatsAppSupplier
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [forecast, setForecast] = useState<StockoutPrediction | null>(null);
  const [customVelocity, setCustomVelocity] = useState<number | ''>('');
  const [customLeadTime, setCustomLeadTime] = useState<number>(5);

  useEffect(() => {
    if (isOpen && product) {
      // Calculate immediate local prediction first
      const initial = calculateProductStockoutMetrics(product);
      setForecast(initial);
      setCustomVelocity(initial.dailySalesVelocity);

      // Fetch enhanced Gemini AI forecast asynchronously
      setLoadingAi(true);
      fetchAIStockoutForecast(product)
        .then((aiData) => {
          setForecast(aiData);
        })
        .finally(() => {
          setLoadingAi(false);
        });
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleRecalculate = () => {
    const vel = typeof customVelocity === 'number' && customVelocity > 0 ? customVelocity : undefined;
    setLoadingAi(true);
    fetchAIStockoutForecast(product, vel, customLeadTime)
      .then((res) => {
        setForecast(res);
      })
      .finally(() => {
        setLoadingAi(false);
      });
  };

  const risk = forecast?.riskBadge || {
    label: 'جاري التحليل...',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    icon: '⏳'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn dir-rtl">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">التنبؤ بنفاد المخزون وإعادة الطلب بالذكاء الاصطناعي</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI Stockout Radar
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">تحليل سرعة المبيعات، أيام التغطية، وتوصيات التوريد في مصر</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* PRODUCT CARD MINI HERO */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  SKU: {product.sku}
                </span>
                <span className="text-xs font-bold text-slate-500">{product.brand}</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm truncate mt-0.5" title={product.title}>
                {product.title}
              </h4>
              <div className="text-xs text-slate-500 font-bold mt-0.5 flex items-center gap-3">
                <span>المخزون الحالي: <span className="font-black text-slate-900">{product.stockQuantity ?? 0} قطعة</span></span>
                <span>•</span>
                <span>السعر: <span className="font-black text-emerald-700">{product.merchantPrice} ج.م</span></span>
              </div>
            </div>
          </div>

          {/* RISK STATUS BADGE & MAIN METRIC TILES */}
          <div className={`p-4 rounded-2xl border ${risk.bg} ${risk.border} flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{risk.icon}</span>
              <div>
                <span className="text-xs font-black text-slate-600 block">تقييم المخاطر الحالي</span>
                <span className={`text-base font-black ${risk.text}`}>{risk.label}</span>
              </div>
            </div>

            {forecast && (
              <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-black/5 text-center shrink-0">
                <span className="text-[10px] font-bold text-slate-500 block">تاريخ النفاد المتوقع</span>
                <span className="text-sm font-black text-slate-900">{forecast.estimatedStockoutDate}</span>
              </div>
            )}
          </div>

          {/* METRIC GRID */}
          {forecast && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">سرعة البيع اليومية</span>
                <span className="text-base font-black text-slate-900">{forecast.dailySalesVelocity}</span>
                <span className="text-[10px] text-slate-400 block">قطعة / يوم</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">أيام التغطية المتبقية</span>
                <span className="text-base font-black text-indigo-700">{forecast.daysToStockout}</span>
                <span className="text-[10px] text-slate-400 block">أيام</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">نقطة إعادة الطلب (ROP)</span>
                <span className="text-base font-black text-amber-700">{forecast.reorderPointUnits}</span>
                <span className="text-[10px] text-slate-400 block">قطعة بالمخزن</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">كمية التوريد الموصى بها</span>
                <span className="text-base font-black text-emerald-700">{forecast.recommendedReorderQty}</span>
                <span className="text-[10px] text-slate-400 block">قطعة (تغطية 30 يوماً)</span>
              </div>
            </div>
          )}

          {/* AI ADVISOR REPORT PANEL */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white space-y-3 relative overflow-hidden shadow-lg border border-indigo-700/50">
            <div className="flex items-center justify-between border-b border-indigo-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h5 className="font-extrabold text-sm text-amber-300">مستشار التوريد ومخزون أمازون ونون بالذكاء الاصطناعي</h5>
              </div>
              <span className="text-[10px] font-mono text-indigo-300">Gemini 3.8 Flash</span>
            </div>

            {loadingAi ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-indigo-200">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs font-bold">جاري تحليل سرعة المبيعات ومواعيد الشحن بمستودعات مصر...</span>
              </div>
            ) : (
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                {forecast?.aiAdvisorSummary}
              </p>
            )}

            {/* EGYPT FULFILLMENT TIME ESTIMATES */}
            {forecast?.egyptFulfillmentInsights && (
              <div className="mt-3 pt-3 border-t border-indigo-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/40">
                  <span className="font-bold text-amber-300 block mb-0.5">📦 مستودعات FBA أمازون مصر</span>
                  <span className="text-slate-300">{forecast.egyptFulfillmentInsights.fbaLeadTime}</span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/40">
                  <span className="font-bold text-amber-300 block mb-0.5">🟡 مستودعات FBN نون إكسبرس</span>
                  <span className="text-slate-300">{forecast.egyptFulfillmentInsights.fbnLeadTime}</span>
                </div>
              </div>
            )}
          </div>

          {/* SIMULATION & CUSTOM VELOCITY ADJUSTMENT */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>محاكاة وتعديل الفروض الحسابية</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  معدل البيع اليومي المفترض (قطع/يوم)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={customVelocity}
                  onChange={(e) => setCustomVelocity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="مثال: 2.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  مدة التوريد والشحن المتوقعة (أيام)
                </label>
                <select
                  value={customLeadTime}
                  onChange={(e) => setCustomLeadTime(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value={3}>3 أيام (توريد كاش فوري من القاهرة)</option>
                  <option value={5}>5 أيام (توريد قياسي FBA/FBN)</option>
                  <option value={10}>10 أيام (استيراد أو توريد من المحافظات)</option>
                  <option value={15}>15 يوماً (شحن دولي)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRecalculate}
              disabled={loadingAi}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>إعادة حساب التنبؤ بنفاد المخزون</span>
            </button>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
          >
            إغلاق
          </button>

          {onOpenWhatsAppSupplier && (
            <button
              onClick={() => {
                onClose();
                onOpenWhatsAppSupplier(product, forecast?.recommendedReorderQty || 25);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
            >
              <Send className="w-4 h-4" />
              <span>إرسال أمر توريد للمورد عبر الواتساب ({forecast?.recommendedReorderQty || 25} قطعة)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
