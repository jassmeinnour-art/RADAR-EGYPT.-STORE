import React from 'react';
import {
  X,
  Printer,
  FileDown,
  Building2,
  Calendar,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Tag,
  ShieldCheck,
  Store,
  Sparkles,
  Info
} from 'lucide-react';
import { ProductData } from '../types';

interface ExecutivePdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData;
  currency?: string;
  winningPrice?: number;
  selectedDiscount?: number;
  aiBrief?: any;
  onSuccessToast?: (msg: string) => void;
}

export const ExecutivePdfReportModal: React.FC<ExecutivePdfReportModalProps> = ({
  isOpen,
  onClose,
  product,
  currency = 'EGP',
  winningPrice,
  selectedDiscount = 5,
  aiBrief,
  onSuccessToast
}) => {
  if (!isOpen) return null;

  const effectiveSellingPrice = winningPrice || product.suggestedRetailPrice || product.currentLowestPrice;
  const wholesaleCost = product.estimatedWholesaleCost || Math.round(product.currentLowestPrice * 0.75);
  const netProfit = effectiveSellingPrice - wholesaleCost;
  const marginPct = effectiveSellingPrice > 0 ? Math.round((netProfit / effectiveSellingPrice) * 100) : 0;
  const markupPct = wholesaleCost > 0 ? Math.round((netProfit / wholesaleCost) * 100) : 0;

  const reportRef = `REP-EGY-${product.id.slice(-4)}-${new Date().getFullYear()}`;
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    onSuccessToast?.('جاري فتح نافذة الطباعة والحفظ بتنسيق PDF...');
    window.print();
  };

  const primaryWholesaleHub = product.wholesaleLocations?.[0]?.marketName || 'شارع عبد العزيز - القاهرة';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn font-['Alexandria',sans-serif]">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Action Bar (hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
              PDF
            </span>
            <div>
              <h3 className="text-sm font-black">معاينة التقرير التنفيذي المعتمد (A4 Official Document)</h3>
              <p className="text-[11px] text-slate-400">جاهز للطباعة المباشرة أو الحفظ بصيغة PDF الرسمية</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-rose-900/20 transition-all cursor-pointer"
              title="طباعة أو حفظ التقرير كملف PDF"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF 🖨️</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="إغلاق المعاينة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 bg-white" id="printable-executive-report">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-5 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-indigo-700 text-white flex items-center justify-center text-sm font-black shadow-xs">
                  ⚡
                </span>
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    رادار التاجر الذكي - جمهورية مصر العربية
                  </h1>
                  <p className="text-xs text-slate-500 font-bold">
                    منظومة استخبارات الأسعار وهوامش الربح وتحليل المنافسين بالسوق المصري
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 min-w-[200px]">
              <div className="flex justify-between gap-4 text-slate-500">
                <span>رقم الوثيقة:</span>
                <span className="font-mono font-black text-slate-900">{reportRef}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-500">
                <span>تاريخ الاعتماد:</span>
                <span className="font-bold text-slate-800">{currentDate}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-500">
                <span>التوقيت:</span>
                <span className="font-bold text-slate-800">{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Product Profile Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl bg-white p-2 border border-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl shrink-0">
                📦
              </div>
            )}

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black">
                  {product.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[10px] font-bold">
                  العلامة: {product.brand}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  كود SKU: {product.sku || `SKU-${product.id}`}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {product.title}
              </h2>

              <p className="text-xs text-slate-600 line-clamp-2">
                {product.description || 'صنف قياسي مراقب ضمن محفظة المنتجات النشطة بالمتجر.'}
              </p>
            </div>
          </div>

          {/* Core Financial & Pricing Matrix */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📊</span>
              <span>المصفوفة المالية والتسعير المعتمد (Pricing & Profitability)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-right">
                <span className="text-[10px] text-sky-800 font-bold block mb-1">تكلفة الشراء (جملة)</span>
                <span className="text-lg font-black text-sky-950 font-mono">
                  {wholesaleCost.toLocaleString()} <span className="text-xs font-sans">{currency}</span>
                </span>
                <span className="text-[10px] text-sky-700 block mt-1">
                  المصدر: {primaryWholesaleHub}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-right">
                <span className="text-[10px] text-emerald-800 font-bold block mb-1">سعر البيع الرابح المعتمد</span>
                <span className="text-lg font-black text-emerald-950 font-mono">
                  {effectiveSellingPrice.toLocaleString()} <span className="text-xs font-sans">{currency}</span>
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  خصم الصدارة: {selectedDiscount}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-right">
                <span className="text-[10px] text-indigo-800 font-bold block mb-1">صافي هامش الربح المقدر</span>
                <span className="text-lg font-black text-indigo-950 font-mono">
                  +{netProfit.toLocaleString()} <span className="text-xs font-sans">{currency}</span>
                </span>
                <span className="text-[10px] text-indigo-700 block mt-1">
                  نسبة الهامش: <strong>{marginPct}%</strong> (عائد {markupPct}%)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-right">
                <span className="text-[10px] text-slate-600 font-bold block mb-1">أقل سعر للمنافسين بالسوق</span>
                <span className="text-lg font-black text-slate-800 font-mono">
                  {product.currentLowestPrice.toLocaleString()} <span className="text-xs font-sans">{currency}</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                  {effectiveSellingPrice <= product.currentLowestPrice ? 'متصدر بأفضل سعر 🏆' : 'مطلوب مراجعة السعر ⚠️'}
                </span>
              </div>
            </div>
          </div>

          {/* Competitor Offers Breakdown Table */}
          {product.merchantOffers && product.merchantOffers.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>🏬</span>
                <span>رصد عروض المنصات والمتاجر المنافسة بالسوق</span>
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] font-black">
                    <tr>
                      <th className="p-2.5">المتجر / المنصة</th>
                      <th className="p-2.5">السعر المعروض</th>
                      <th className="p-2.5">حالة التوفر</th>
                      <th className="p-2.5">مدة الشحن</th>
                      <th className="p-2.5">الفارق عن سعرنا</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.merchantOffers.map((offer, idx) => {
                      const diff = offer.price - effectiveSellingPrice;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-900">
                            {offer.merchantName} ({offer.platform})
                          </td>
                          <td className="p-2.5 font-mono font-black text-slate-900">
                            {offer.price.toLocaleString()} {currency}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {offer.inStock ? 'متوفر بالمخزون' : 'نفد المخزون'}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {offer.shippingTime || '1-3 أيام'}
                          </td>
                          <td className="p-2.5 font-bold">
                            {diff > 0 ? (
                              <span className="text-emerald-700 font-mono">سعرنا أرخص بـ {diff.toLocaleString()} {currency} 🏆</span>
                            ) : diff < 0 ? (
                              <span className="text-rose-700 font-mono">المنافس أرخص بـ {Math.abs(diff).toLocaleString()} {currency} ⚠️</span>
                            ) : (
                              <span className="text-slate-600 font-mono">مطابق لسعرنا تماماً</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Executive Assessment & AI Recommendations */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>التوصية الإدارية والتحليل المعتمد {aiBrief ? '(مدعوم بـ Google Gemini 3.8 Flash)' : ''}:</span>
              </div>
              {aiBrief?.exportReadinessScore && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  جاهزية التصدير: {aiBrief.exportReadinessScore}%
                </span>
              )}
            </div>

            {aiBrief?.executiveSummary ? (
              <p className="text-xs text-indigo-950 leading-relaxed whitespace-pre-line bg-white/70 p-3 rounded-xl border border-indigo-100">
                {aiBrief.executiveSummary}
              </p>
            ) : (
              <p className="text-xs text-indigo-900 leading-relaxed">
                السعر المعتمد البالغ <strong>{effectiveSellingPrice.toLocaleString()} {currency}</strong> يحقق ميزة تنافسية لاقتناص صندوق الشراء (Buy Box) مع الحفاظ على هامش ربح آمن قدره <strong>{marginPct}%</strong> فوق تكلفة الجملة. يُوصى بالاعتماد واستمرار متابعة أي تخفيضات مفاجئة من منصات أمازون ونون.
              </p>
            )}

            {aiBrief?.strategicRecommendations && aiBrief.strategicRecommendations.length > 0 && (
              <div className="pt-2 border-t border-indigo-200/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-indigo-900">
                {aiBrief.strategicRecommendations.slice(0, 4).map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">✔</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signature & Seal Footer */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-4">
              <span className="text-slate-500 font-bold block">إعداد مسؤول التسعير:</span>
              <div className="h-10 border-b border-dashed border-slate-400 mx-auto w-32 flex items-end justify-center pb-1 text-slate-700 font-serif italic">
                رادار التاجر الذكي
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-slate-500 font-bold block">اعتماد الإدارة العامة:</span>
              <div className="h-10 border-b border-dashed border-slate-400 mx-auto w-32 flex items-end justify-center pb-1 text-emerald-800 font-black">
                معتمد للتطبيق ✔
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center space-y-1">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-700 border-dashed flex items-center justify-center text-indigo-700 font-black text-[9px] text-center p-1 leading-tight transform -rotate-12">
                ختم الاعتماد<br />رادار مصر<br />{new Date().getFullYear()}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">DOC REF: {reportRef}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
