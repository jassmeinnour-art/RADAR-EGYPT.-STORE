import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Printer,
  Scissors,
  FileText,
  Package,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  Truck,
  Building2,
  Calendar,
  Share2,
  Download,
  Copy,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Split,
  Eye,
  Sliders
} from 'lucide-react';
import { CustomerOrder, OrderItem, RemoteMerchantClient, ProductData } from '../types';
import { EGYPTIAN_COURIERS } from '../data/orderSchedulingData';
import { splitMultiItemOrder } from '../utils/merchantOrdersManager';

interface AmazonMultiItemWaybillCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  allProducts?: ProductData[];
  activeMerchant?: RemoteMerchantClient;
  onShowToast?: (msg: string) => void;
  onOrderUpdated?: () => void;
}

export const AmazonMultiItemWaybillCropperModal: React.FC<AmazonMultiItemWaybillCropperModalProps> = ({
  isOpen,
  onClose,
  orders,
  allProducts = [],
  activeMerchant,
  onShowToast,
  onOrderUpdated,
}) => {
  // Paper Format: 'thermal_4x6' (100x150 mm) | 'a4_manifest' (Standard A4)
  const [paperFormat, setPaperFormat] = useState<'thermal_4x6' | 'a4_manifest'>('thermal_4x6');

  // Zoom / Scale factor for thermal printer margin calibration (90% to 110%)
  const [zoomScale, setZoomScale] = useState<number>(100);

  // High contrast mode for thermal printer head sharpness
  const [highContrastMode, setHighContrastMode] = useState<boolean>(true);

  // Find multi-item orders first or fallback to any order
  const multiItemOrders = useMemo(() => {
    return orders.filter(o => o.items && o.items.length > 1);
  }, [orders]);

  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    if (multiItemOrders.length > 0) return multiItemOrders[0].id;
    if (orders.length > 0) return orders[0].id;
    return 'custom-demo-multi-item';
  });

  // Active Order
  const activeOrder = useMemo<CustomerOrder>(() => {
    const found = orders.find(o => o.id === selectedOrderId);
    if (found) return found;

    // High quality multi-item fallback demo order
    const courier = EGYPTIAN_COURIERS[0];
    const demoItems: OrderItem[] = [
      {
        id: 'item-amz-01',
        productId: 'B09FURNCHR1',
        productTitle: 'كرسي مكتب طبي هيدروليك مريح داعم للفقرات القطنية مع مسند رأس - شبك أسود',
        productImage: 'https://images.unsplash.com/photo-1580481077195-c3a821a506cb?w=600',
        sku: 'FUR-CHR-ERG-BLK-EG',
        unitPrice: 3450,
        quantity: 2,
        totalPrice: 6900,
        itemStatus: 'waybill_generated',
        waybillNumber: 'WB-AMZ-884920-1',
        courierId: courier.id,
        courierName: 'أمازون إيزي شيب (Amazon Easy Ship EG)',
        weightKg: 8.5,
        shippingFeeEGP: 45,
        warehouseLocation: 'المخزن الرئيسي - رف F-1',
        barcode: '6221158849201',
        generatedAt: 'اليوم',
        notes: 'طرد رئيسي 1/2'
      },
      {
        id: 'item-amz-02',
        productId: 'B09FURNTBL2',
        productTitle: 'طاولة قهوة مودرن خشب زان روماني طبيعي مقاس 100×60 سم - بني جوزي',
        productImage: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600',
        sku: 'FUR-TBL-COF-ZAN-EG',
        unitPrice: 2850,
        quantity: 1,
        totalPrice: 2850,
        itemStatus: 'waybill_generated',
        waybillNumber: 'WB-AMZ-884920-2',
        courierId: courier.id,
        courierName: 'أمازون إيزي شيب (Amazon Easy Ship EG)',
        weightKg: 14.0,
        shippingFeeEGP: 45,
        warehouseLocation: 'المخزن الرئيسي - رف F-4',
        barcode: '6221158849202',
        generatedAt: 'اليوم',
        notes: 'طرد مكمل 2/2'
      }
    ];

    return {
      id: 'custom-demo-multi-item',
      orderNumber: '408-7294012-9941203',
      customerName: 'م. حسام الدين عبد الرحمن',
      customerPhone: '01091234567',
      governorate: 'القاهرة',
      fullAddress: 'التجمع الخامس، شارع التسعين الشمالي، مجمع الأعمال، عمارة 14B الدور الثالث',
      platformSource: 'amazon_eg',
      platformSourceName: 'أمازون مصر (Amazon Egypt Easy Ship)',
      createdAt: new Date().toLocaleDateString('ar-EG'),
      scheduledDispatchDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      items: demoItems,
      subtotalEGP: 9750,
      totalShippingFeeEGP: 45,
      discountEGP: 0,
      grandTotalEGP: 9795,
      paymentMethod: 'cod',
      isPaid: false,
      orderStatus: 'scheduled',
      merchantId: activeMerchant?.id || 'merchant-step-queen',
      merchantName: activeMerchant?.storeName || 'Step QUeen'
    };
  }, [orders, selectedOrderId, activeMerchant]);

  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Split multi-item order into separate waybills
  const handleSplitCurrentOrder = () => {
    if (activeOrder.id === 'custom-demo-multi-item') {
      onShowToast?.('هذا طلب معاينة تجريبي، يرجى اختيار طلب مسجل لفصله ✂️');
      return;
    }
    const res = splitMultiItemOrder(activeOrder.id);
    if (res.success) {
      onShowToast?.(res.message);
      onOrderUpdated?.();
      onClose();
    } else {
      onShowToast?.(res.message);
    }
  };

  // Dedicated Print Function with exact CSS Media Rules using hidden iframe (safe for iframe environments)
  const handlePrintWaybill = () => {
    const printArea = printableRef.current;
    if (!printArea) return;

    const isThermal = paperFormat === 'thermal_4x6';

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>بوليصة شحن أمازون متعددة الأصناف - ${activeOrder.orderNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Alexandria:wght@400;700;900&display=swap');
            
            @page {
              size: ${isThermal ? '100mm 150mm' : 'A4 portrait'};
              margin: ${isThermal ? '0mm' : '8mm'};
            }

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #000;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              padding: ${isThermal ? '3mm' : '0'};
            }

            .sheet-container {
              width: ${isThermal ? '94mm' : '100%'};
              margin: 0 auto;
              transform: scale(${zoomScale / 100});
              transform-origin: top center;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #000;
              padding: 4px 6px;
              text-align: right;
            }

            .barcode-text {
              font-family: 'Courier New', monospace;
              letter-spacing: 3px;
              font-weight: 900;
            }
          </style>
        </head>
        <body>
          <div class="sheet-container">
            ${printArea.innerHTML}
          </div>
        </body>
      </html>
    `;

    try {
      let printFrame = document.getElementById('amazon-waybill-print-frame') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'amazon-waybill-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.top = '-9999px';
        printFrame.style.left = '-9999px';
        printFrame.style.width = '0px';
        printFrame.style.height = '0px';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();

        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        }, 300);
      } else {
        window.print();
      }
      onShowToast?.(`جاري إرسال البوليصة للطابعة (${isThermal ? 'حراري 4×6' : 'ورق A4'})... 🖨️✨`);
    } catch {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative my-6 text-slate-100 space-y-4">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Scissors className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                  وحدة قص ومعالجة بوالص أمازون متعددة المنتجات
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                  Amazon Multi-Item 📦 x{activeOrder.items.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                قص ومعالجة قياسات البوليصة تلقائياً للطباعة الحرارية (Thermal 4x6) أو A4 دون إخفاء أي منتج.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer self-end sm:self-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
          {/* Order Selection Dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-slate-400 shrink-0 font-bold">الطلب المحدد:</span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-sky-500"
            >
              {multiItemOrders.length > 0 && (
                <optgroup label="الطلبات متعددة المنتجات (Multi-Product Orders)">
                  {multiItemOrders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      #{ord.orderNumber} — {ord.customerName} ({ord.items.length} أصناف 📦)
                    </option>
                  ))}
                </optgroup>
              )}
              {orders.length > 0 && (
                <optgroup label="كافة الطلبات المسجلة">
                  {orders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      #{ord.orderNumber} — {ord.customerName} ({ord.items.length} صنف)
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="custom-demo-multi-item">
                معاينة طلب أمازون متعدد الأصناف (طاولة + كراسي مكتب 📦x2)
              </option>
            </select>
          </div>

          {/* Paper Size Format Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setPaperFormat('thermal_4x6')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                paperFormat === 'thermal_4x6'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طابعة حرارية (Thermal 4x6 - 100×150mm)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaperFormat('a4_manifest')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                paperFormat === 'a4_manifest'
                  ? 'bg-indigo-600 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ورق A4 قياسي + مانيفيست</span>
            </button>
          </div>

          {/* Calibration & Scale Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-slate-400 font-bold">المعايرة:</span>
              <button
                type="button"
                onClick={() => setZoomScale(prev => Math.max(85, prev - 5))}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="تصغير الهوامش"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-sky-400 px-1">{zoomScale}%</span>
              <button
                type="button"
                onClick={() => setZoomScale(prev => Math.min(115, prev + 5))}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="تكبير الهوامش"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setHighContrastMode(!highContrastMode)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition ${
                highContrastMode
                  ? 'bg-slate-800 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="وضوح الباركود والخطوط الحرارية بدون تشويش"
            >
              تباين حاد (Thermal Contrast)
            </button>
          </div>
        </div>

        {/* Live Cropper Preview Sheet Viewport */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-[500px] overflow-y-auto flex items-center justify-center">
          <div
            ref={printableRef}
            style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: 'top center' }}
            className={`bg-white text-slate-900 rounded-lg p-5 border-2 border-slate-900 shadow-2xl transition-transform ${
              paperFormat === 'thermal_4x6'
                ? 'w-[380px] min-h-[570px] space-y-3'
                : 'w-[680px] min-h-[920px] space-y-5'
            }`}
          >
            {/* Top Amazon Easy Ship Header */}
            <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between">
              <div>
                <div className="text-lg font-black font-['Alexandria'] tracking-tight flex items-center gap-1.5">
                  <span className="text-sky-600 font-mono text-xl">a</span>
                  <span>amazon.eg Easy Ship</span>
                </div>
                <div className="text-[10px] font-bold text-slate-600">
                  بوليصة شحن وتوصيل طلبات معتمدة • السوق المصري
                </div>
              </div>

              <div className="text-left font-mono text-[10px] space-y-0.5">
                <div className="font-bold text-slate-900">MFN / Easy Ship</div>
                <div className="text-slate-500">تاريخ: {activeOrder.scheduledDispatchDate}</div>
              </div>
            </div>

            {/* High Density Barcode Box */}
            <div className="bg-slate-50 p-2.5 rounded-lg border-2 border-slate-900 text-center space-y-1">
              <div className="text-2xl font-mono tracking-widest font-black leading-none">
                |||||| | |||| ||||| || |||||| | ||||| |||||
              </div>
              <div className="font-mono text-xs font-black tracking-wider text-slate-900">
                {activeOrder.orderNumber}
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                رقم البوليصة المجمعة: WB-AMZ-MULTI-{activeOrder.orderNumber.replace(/[^0-9]/g, '').slice(-6)}
              </div>
            </div>

            {/* Consignee & Sender Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] border border-slate-800 rounded-lg p-2.5">
              <div className="space-y-0.5 pr-1 border-l border-slate-300">
                <span className="text-[9px] font-bold text-slate-500 block uppercase">الراسل (Merchant Sender):</span>
                <strong className="block text-slate-950">{activeOrder.merchantName || 'Step QUeen'}</strong>
                <div className="text-slate-600 text-[10px]">القاهرة - مبنى التجارة الإلكترونية</div>
                <div className="text-slate-700 font-mono text-[10px]">هاتف: 01000000000</div>
              </div>

              <div className="space-y-0.5 pl-1">
                <span className="text-[9px] font-bold text-slate-500 block uppercase">المستلم (Consignee):</span>
                <strong className="block text-slate-950">{activeOrder.customerName}</strong>
                <div className="text-red-700 font-bold font-['Alexandria'] text-[10px]">
                  محافظة {activeOrder.governorate}
                </div>
                <div className="text-slate-700 text-[10px] line-clamp-2 leading-tight">
                  {activeOrder.fullAddress}
                </div>
                <div className="text-slate-900 font-mono font-bold text-[10px]">
                  هاتف: {activeOrder.customerPhone}
                </div>
              </div>
            </div>

            {/* GUARANTEED MULTI-ITEM TABLE - Never cuts off or hides any product detail */}
            <div className="border-2 border-slate-900 rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-white px-2 py-1 text-[10px] font-black flex items-center justify-between">
                <span>أصناف الطلب المتعددة ({activeOrder.items.length} أصناف مغلفة):</span>
                <span className="text-sky-300 font-mono font-bold">Multi-Product Package</span>
              </div>

              <div className="divide-y divide-slate-300 bg-white">
                {activeOrder.items.map((item, idx) => (
                  <div key={item.id} className="p-2 space-y-1 text-[10px]">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="font-black text-slate-900 leading-tight">
                        <span className="inline-block bg-slate-900 text-white rounded px-1 text-[9px] ml-1">
                          #{idx + 1}
                        </span>
                        <span>{item.productTitle}</span>
                      </div>
                      <span className="font-mono font-black text-slate-900 text-[11px] shrink-0 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300">
                        {item.quantity}× قطعة
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono pt-0.5">
                      <span>SKU: <strong>{item.sku}</strong></span>
                      <span>ASIN: <strong>{item.productId}</strong></span>
                      <span>الوزن: <strong>{item.weightKg || 8.5} كجم</strong></span>
                      <span>السعر: <strong>{item.totalPrice.toLocaleString('ar-EG')} ج.م</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Collection Box (COD vs Pre-Paid) */}
            <div className="p-2.5 rounded-lg bg-sky-50 border-2 border-sky-600 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-sky-900 font-bold block">
                  المبلغ المطلوب تحصيله نقداً (Cash on Delivery):
                </span>
                <div className="text-xl font-black text-slate-950 font-mono">
                  {activeOrder.isPaid ? '0.00 ج.م (خالص الدفع مسبقاً)' : `${activeOrder.grandTotalEGP.toLocaleString('ar-EG')} ج.م`}
                </div>
              </div>

              <div className="text-left font-mono text-[10px] text-sky-950">
                <div className="font-bold">{activeOrder.isPaid ? '✓ PRE-PAID' : 'COD (تحصيل نقدي)'}</div>
                <div>الشحن: {activeOrder.totalShippingFeeEGP} ج.م</div>
              </div>
            </div>

            {/* A4 Additional Manifest Section when A4 is selected */}
            {paperFormat === 'a4_manifest' && (
              <div className="pt-4 border-t-2 border-dashed border-slate-400 space-y-3">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>إيصال استلام مندوب أسطول الشحن (Courier Handover Slip)</span>
                  <span className="font-mono text-slate-500">نسخة التاجر والمخزن</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] border border-slate-300 p-2.5 rounded">
                  <div>
                    <span className="text-slate-500 block">اسم المندوب:</span>
                    <span className="font-bold">....................................</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">شركة الشحن:</span>
                    <span className="font-bold">{activeOrder.items[0]?.courierName || 'أمازون إيزي شيب'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">توقيع وختم الاستلام:</span>
                    <span className="font-bold">....................................</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {activeOrder.items.length > 1 && (
              <button
                type="button"
                onClick={handleSplitCurrentOrder}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/40 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                title="فصل الأصناف المتعددة إلى بوالص شحن فردية مستقلة"
              >
                <Split className="w-3.5 h-3.5 text-indigo-400" />
                <span>فصل إلى بوالص فردية (Split Items) ✂️</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handlePrintWaybill}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs font-['Alexandria'] rounded-xl shadow-lg shadow-sky-500/30 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>طباعة البوليصة الحرارية الآن ({paperFormat === 'thermal_4x6' ? 'Thermal 4×6' : 'A4'}) 🖨️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
