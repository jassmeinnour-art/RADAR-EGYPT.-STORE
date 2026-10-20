import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Truck, 
  Package, 
  CheckCircle2, 
  Barcode, 
  Layers, 
  MapPin, 
  Phone, 
  Calendar,
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { CustomerOrder, OrderItem } from '../types';
import { 
  FALLBACK_DEMO_ORDERS, 
  exportFallbackManifestCsv, 
  exportFallbackCatalogCsv 
} from '../data/fallbackDemoData';

interface ShippingManifestPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: CustomerOrder[];
  merchantStoreName?: string;
  onShowToast?: (msg: string) => void;
}

export const ShippingManifestPrintModal: React.FC<ShippingManifestPrintModalProps> = ({
  isOpen,
  onClose,
  orders = FALLBACK_DEMO_ORDERS,
  merchantStoreName = 'متجر التاجr المعتمد',
  onShowToast
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'a4_manifest' | 'thermal_4x6'>('a4_manifest');
  const [selectedCourierFilter, setSelectedCourierFilter] = useState<string>('all');
  const [copiedWaybill, setCopiedWaybill] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const effectiveOrders = orders && orders.length > 0 ? orders : FALLBACK_DEMO_ORDERS;

  // Flatten orders into waybill rows
  const allWaybills: {
    order: CustomerOrder;
    item: OrderItem;
  }[] = [];

  effectiveOrders.forEach(order => {
    order.items.forEach(item => {
      allWaybills.push({ order, item });
    });
  });

  const filteredWaybills = allWaybills.filter(({ item }) => {
    if (selectedCourierFilter === 'all') return true;
    return (item.courierId || '').toLowerCase().includes(selectedCourierFilter.toLowerCase()) ||
           (item.courierName || '').toLowerCase().includes(selectedCourierFilter.toLowerCase());
  });

  const totalCodAmount = filteredWaybills.reduce((acc, { order }) => {
    return acc + (order.isPaid ? 0 : order.grandTotalEGP);
  }, 0);

  const totalPrepaidOrders = filteredWaybills.filter(({ order }) => order.isPaid).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportFallbackManifestCsv(effectiveOrders);
    if (onShowToast) {
      onShowToast('تم تصدير كشف بوالص الشحن بصيغة CSV بنجاح 📄');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWaybill(id);
    setTimeout(() => setCopiedWaybill(null), 2000);
  };

  return (
    <div 
      id="shipping-manifest-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shipping-manifest-title"
    >
      <div 
        id="shipping-manifest-modal-card"
        className="w-full max-w-5xl bg-[#F8FAFC] border-3 border-[#000000] rounded-2xl shadow-2xl text-right animate-scaleUp flex flex-col max-h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-3 border-[#000000] bg-[#F8FAFC]">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#F8FAFC] border-2 border-[#000000] text-[#000000] flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-[#000000]" />
          </button>

          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#000000] text-amber-300">
                  بوالص فعلية للسوق المصري
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-400">
                  جاهزة للطباعة والتصدير
                </span>
                <h3 id="shipping-manifest-title" className="text-base sm:text-lg font-black text-[#000000]">
                  كشف تسليم الطرود وبوالص الشحن الرسمية
                </h3>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                مستندات تسليم معتمدة لمناديب شركات الشحن (بوسطة، مايلرز، أرامكس، جوميا) مع باركود وأرقام بوالص وقيم COD
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#000000] text-amber-400 flex items-center justify-center shrink-0 border-2 border-[#000000] shadow-xs">
              <Printer className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Controls Toolbar: Format Selector & Courier Filter */}
        <div className="px-5 py-3 border-b-2 border-[#000000] bg-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Format Selector */}
          <div className="inline-flex items-center bg-white border-2 border-[#000000] rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedFormat('a4_manifest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedFormat === 'a4_manifest'
                  ? 'bg-[#000000] text-white'
                  : 'text-[#000000] hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>كشف تسليم مجمع (A4 Manifest)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('thermal_4x6')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedFormat === 'thermal_4x6'
                  ? 'bg-[#000000] text-white'
                  : 'text-[#000000] hover:bg-slate-100'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>بوالص حرارية فردية (4x6 Thermal)</span>
            </button>
          </div>

          {/* Courier Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">شركة الشحن:</span>
            <select
              value={selectedCourierFilter}
              onChange={(e) => setSelectedCourierFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#F8FAFC] border-2 border-[#000000] rounded-lg text-xs font-bold text-[#000000] focus:outline-none cursor-pointer"
            >
              <option value="all">كافة الشركات ({allWaybills.length} طرد)</option>
              <option value="bosta">بوسطة (Bosta Express)</option>
              <option value="mylerz">مايلرز (Mylerz Express)</option>
              <option value="aramex">أرامكس مصر (Aramex EG)</option>
              <option value="jumia">جوميا إكسبريس (Jumia)</option>
            </select>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC]">
          
          {selectedFormat === 'a4_manifest' ? (
            /* ========================================================================= */
            /* A4 COURIER HANDOVER MANIFEST SHEET                                        */
            /* ========================================================================= */
            <div id="printable-a4-manifest-sheet" className="bg-white border-3 border-[#000000] rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
              
              {/* Manifest Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-[#000000] gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                    <h2 className="text-base sm:text-xl font-black text-[#000000]">
                      كشف تسليم الطرود اليومي (Daily Dispatch Manifest)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-700 font-bold">
                    الراسل: {merchantStoreName} · مركز التجهيز والتوزيع المعتمد بمصر
                  </p>
                </div>

                <div className="text-left sm:text-right bg-slate-100 p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800">
                  <div>كود الكشف: <span className="text-[#000000] font-black">MNF-2026-CAI-{Date.now().toString().slice(-4)}</span></div>
                  <div>التاريخ: {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border-2 border-[#000000] rounded-xl text-center">
                  <span className="text-[11px] font-bold text-slate-600 block">إجمالي الطرود</span>
                  <strong className="text-lg font-black text-[#000000]">{filteredWaybills.length} طرد</strong>
                </div>
                <div className="p-3 bg-amber-50 border-2 border-[#000000] rounded-xl text-center">
                  <span className="text-[11px] font-bold text-amber-900 block">إجمالي التحصيل (COD)</span>
                  <strong className="text-lg font-black text-amber-950 font-mono">{totalCodAmount.toLocaleString()} ج.م</strong>
                </div>
                <div className="p-3 bg-emerald-50 border-2 border-[#000000] rounded-xl text-center">
                  <span className="text-[11px] font-bold text-emerald-900 block">طرود مدفوعة مسبقاً</span>
                  <strong className="text-lg font-black text-emerald-950">{totalPrepaidOrders} طرد</strong>
                </div>
                <div className="p-3 bg-slate-50 border-2 border-[#000000] rounded-xl text-center">
                  <span className="text-[11px] font-bold text-slate-600 block">المحافظات المغطاة</span>
                  <strong className="text-lg font-black text-[#000000]">5 محافظات</strong>
                </div>
              </div>

              {/* Detailed Waybills Table */}
              <div className="overflow-x-auto border-2 border-[#000000] rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#000000] text-white text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">رقم البوليصة</th>
                      <th className="py-2.5 px-3">شركة الشحن</th>
                      <th className="py-2.5 px-3">اسم المستلم</th>
                      <th className="py-2.5 px-3">المحافظة والعنوان</th>
                      <th className="py-2.5 px-3">رقم الهاتف</th>
                      <th className="py-2.5 px-3">المنتج والكمية</th>
                      <th className="py-2.5 px-3">مبلغ التحصيل</th>
                      <th className="py-2.5 px-3">توقيع المستلم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 bg-white text-[11px]">
                    {filteredWaybills.map(({ order, item }, idx) => (
                      <tr key={`${order.id}-${item.id}`} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-[#000000]">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                            {item.waybillNumber}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{item.courierName.split('(')[0].trim()}</td>
                        <td className="py-2.5 px-3 font-black text-[#000000]">{order.customerName}</td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <strong className="text-[#000000]">{order.governorate}</strong>: {order.fullAddress.slice(0, 38)}...
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-800" dir="ltr">{order.customerPhone}</td>
                        <td className="py-2.5 px-3 text-slate-800">
                          <span className="font-bold">{item.productTitle.slice(0, 26)}...</span>
                          <span className="text-[10px] text-slate-500 mr-1">({item.quantity}×)</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black">
                          {order.isPaid ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                              مدفوع
                            </span>
                          ) : (
                            <span className="text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                              {order.grandTotalEGP.toLocaleString()} ج.م
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">________________</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Handover & Signatures Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-[#000000]">
                <div className="p-3 bg-slate-50 border-2 border-dashed border-[#000000] rounded-xl space-y-2">
                  <span className="text-xs font-black text-[#000000] block">
                    توقيع واعتماد مسؤول المستودع (Warehouse Dispatcher):
                  </span>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span>الاسم: م. حسام الدين الشريف</span>
                    <span>التوقيع: ____________________</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-2 border-dashed border-[#000000] rounded-xl space-y-2">
                  <span className="text-xs font-black text-[#000000] block">
                    توقيع واستلام مندوب شركة الشحن (Courier Agent Handover):
                  </span>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span>الاسم / رقم تحقيق الشخصية: _________________</span>
                    <span>التوقيع: ____________________</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* ========================================================================= */
            /* 4x6 THERMAL LABELS VIEW                                                   */
            /* ========================================================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredWaybills.map(({ order, item }) => (
                <div
                  key={`${order.id}-${item.id}`}
                  className="bg-white border-3 border-[#000000] rounded-2xl p-5 shadow-sm space-y-3.5 text-right font-sans"
                >
                  {/* Label Top: Carrier & Barcode */}
                  <div className="flex items-center justify-between border-b-2 border-[#000000] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#000000]" />
                      <span className="text-xs font-black text-[#000000]">
                        {item.courierName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#000000] text-amber-300">
                      STANDARD DELIVERY
                    </span>
                  </div>

                  {/* Big Thermal Barcode Area */}
                  <div className="p-3 bg-slate-50 border-2 border-[#000000] rounded-xl text-center space-y-1">
                    <div className="text-2xl sm:text-3xl font-mono tracking-widest font-black text-[#000000] select-none">
                      ||||| | |||| ||||| || |||||| | ||||| |||
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-sm font-black text-[#000000]">
                        {item.waybillNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.waybillNumber, item.id)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                        title="نسخ رقم البوليصة"
                      >
                        {copiedWaybill === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sender & Receiver Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-2 border-slate-200 p-3 rounded-xl bg-slate-50">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">الراسل (Shipper):</span>
                      <strong className="text-[#000000] block">{merchantStoreName}</strong>
                      <span className="text-[10px] text-slate-600 block">{item.warehouseLocation}</span>
                      <span className="text-[10px] font-mono text-slate-600 block">القاهرة - مصر</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">المستلم (Consignee):</span>
                      <strong className="text-[#000000] block">{order.customerName}</strong>
                      <span className="text-[11px] font-black text-indigo-900 block">{order.governorate}</span>
                      <span className="text-[10px] text-slate-700 block leading-tight">{order.fullAddress}</span>
                      <span className="text-[11px] font-mono font-bold text-[#000000] block mt-0.5" dir="ltr">
                        {order.customerPhone}
                      </span>
                    </div>
                  </div>

                  {/* Items Description & COD Box */}
                  <div className="flex items-stretch justify-between gap-3">
                    <div className="flex-1 p-2.5 bg-slate-100 rounded-xl border border-slate-300 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 block">محتويات الطرد:</span>
                      <strong className="text-[#000000] block">{item.productTitle}</strong>
                      <span className="text-[10px] text-slate-600 font-mono block">
                        الكمية: {item.quantity} · الوزن: {item.weightKg} كجم
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-xl border-2 flex flex-col justify-center text-center shrink-0 min-w-[120px] ${
                      order.isPaid
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                        : 'bg-amber-100 border-[#000000] text-amber-950'
                    }`}>
                      <span className="text-[10px] font-black block">
                        {order.isPaid ? 'التحصيل (COD)' : 'مطلوب تحصيل (COD)'}
                      </span>
                      <strong className="text-base font-black font-mono block">
                        {order.isPaid ? '0 ج.م' : `${order.grandTotalEGP} ج.م`}
                      </strong>
                      <span className="text-[9px] font-bold block">
                        {order.isPaid ? 'مدفوع إلكترونياً' : 'نقداً عند الاستلام'}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t-3 border-[#000000] bg-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              className="w-full sm:w-auto h-9 px-3.5 rounded-xl bg-white text-[#000000] border-2 border-[#000000] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors cursor-pointer active:scale-95"
              title="تصدير بيانات الكشف كملف Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>تصدير الكشف (CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                exportFallbackCatalogCsv();
                if (onShowToast) onShowToast('تم تصدير كتالوج المنتجات وهوامش الأرباح CSV بنجاح 📊');
              }}
              className="w-full sm:w-auto h-9 px-3.5 rounded-xl bg-white text-[#000000] border-2 border-[#000000] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors cursor-pointer active:scale-95"
              title="تصدير كتالوج المنتجات وهوامش الأرباح"
            >
              <Download className="w-3.5 h-3.5 text-indigo-700" />
              <span>تصدير الكتالوج والأسعار</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-xl bg-white text-[#000000] border-2 border-[#000000] font-bold text-xs hover:bg-slate-200 cursor-pointer transition-colors active:scale-95"
            >
              إغلاق
            </button>

            <button
              type="button"
              id="btn-print-shipping-manifest-modal"
              onClick={handlePrint}
              className="px-5 h-9 rounded-xl bg-[#000000] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة فورية / حفظ كـ PDF 🖨️</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
