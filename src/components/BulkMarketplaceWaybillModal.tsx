import React, { useState, useMemo } from 'react';
import {
  X,
  Truck,
  Package,
  Printer,
  CheckCircle2,
  Calendar,
  Sparkles,
  Barcode,
  ShoppingBag,
  ExternalLink,
  Copy,
  Layers,
  Building2,
  Store,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConnectedMerchantPlatform, ProductData, CustomerOrder, OrderItem, EgyptianGovernorate, PaymentMethod } from '../types';
import { EGYPTIAN_COURIERS } from '../data/orderSchedulingData';
import { VERIFIED_AMAZON_EG_PRODUCTS } from '../services/livePlatformProductSync';
import { saveAllOrders, loadAllOrders, getPlatformDisplayName } from '../utils/merchantOrdersManager';

interface BulkMarketplaceWaybillModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketplacePlatforms: ConnectedMerchantPlatform[];
  allProducts?: ProductData[];
  currency?: string;
  onShowToast?: (msg: string) => void;
  onNavigateToScheduling?: () => void;
}

const PRESET_GOVERNORATES: EgyptianGovernorate[] = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'الغربية',
  'أسيوط'
];

const PRESET_CUSTOMERS = [
  { name: 'م. حسام الدين عبد الرحمن', phone: '01091234567', gov: 'القاهرة' as EgyptianGovernorate, address: 'التجمع الخامس، شارع التسعين الشمالي' },
  { name: 'د. سارة محمود خليل', phone: '01128765432', gov: 'الإسكندرية' as EgyptianGovernorate, address: 'طريق الكورنيش، لوران، برج الفيروز' },
  { name: 'أ. طارق عبد الرازق إبراهيم', phone: '01239876543', gov: 'الجيزة' as EgyptianGovernorate, address: 'الشيخ زايد، الحي الثامن، كمبوند الياسمين' },
  { name: 'أ. ياسمين مصطفى نور', phone: '01554321987', gov: 'الدقهلية' as EgyptianGovernorate, address: 'مدينة المنصورة، المشاية السفلية' },
  { name: 'م. رامي فهمي الدسوقي', phone: '01016549870', gov: 'أسيوط' as EgyptianGovernorate, address: 'شارع الجمهورية، أمام مجمع المحاكم' },
  { name: 'أ. مريم عصام البدري', phone: '01145678901', gov: 'القاهرة' as EgyptianGovernorate, address: 'مدينة نصر، شارع عباس العقاد' },
  { name: 'م. وليد عبد العظيم', phone: '01223456789', gov: 'الجيزة' as EgyptianGovernorate, address: 'مدينة 6 أكتوبر، الحي المتميز' }
];

export const BulkMarketplaceWaybillModal: React.FC<BulkMarketplaceWaybillModalProps> = ({
  isOpen,
  onClose,
  marketplacePlatforms,
  allProducts = [],
  currency = 'EGP',
  onShowToast,
  onNavigateToScheduling
}) => {
  // Step: 'configure' | 'success'
  const [step, setStep] = useState<'configure' | 'success'>('configure');

  // Selected marketplace platforms (defaults to all platforms in marketplace category)
  const [selectedPlatformCodes, setSelectedPlatformCodes] = useState<string[]>(() =>
    marketplacePlatforms.map(p => p.code)
  );

  // Configuration options
  const [ordersPerPlatform, setOrdersPerPlatform] = useState<number>(1);
  const [selectedCourierId, setSelectedCourierId] = useState<string>('auto');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [scheduledDispatchDate, setScheduledDispatchDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [copiedWaybillId, setCopiedWaybillId] = useState<string | null>(null);

  // Resulting generated orders
  const [generatedOrders, setGeneratedOrders] = useState<CustomerOrder[]>([]);

  // Reset or initialize when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep('configure');
      if (selectedPlatformCodes.length === 0 && marketplacePlatforms.length > 0) {
        setSelectedPlatformCodes(marketplacePlatforms.map(p => p.code));
      }
    }
  }, [isOpen, marketplacePlatforms]);

  if (!isOpen) return null;

  // Toggle single platform
  const handleTogglePlatform = (code: string) => {
    setSelectedPlatformCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedPlatformCodes.length === marketplacePlatforms.length) {
      setSelectedPlatformCodes([]);
    } else {
      setSelectedPlatformCodes(marketplacePlatforms.map(p => p.code));
    }
  };

  // Bulk waybill generation execution
  const handleGenerateBulkWaybills = () => {
    if (selectedPlatformCodes.length === 0) {
      if (onShowToast) onShowToast('يرجى تحديد منصة واحدة على الأقل من منصات الماركت بليس!');
      return;
    }

    const productsPool = allProducts.length > 0 ? allProducts : VERIFIED_AMAZON_EG_PRODUCTS;

    const newOrdersList: CustomerOrder[] = [];
    let orderIndex = 0;

    selectedPlatformCodes.forEach(platformCode => {
      const platObj = marketplacePlatforms.find(p => p.code === platformCode);
      const platName = platObj ? platObj.name.split('(')[0].trim() : getPlatformDisplayName(platformCode);

      for (let i = 0; i < ordersPerPlatform; i++) {
        const customer = PRESET_CUSTOMERS[(orderIndex + i) % PRESET_CUSTOMERS.length];
        const courier = selectedCourierId === 'auto'
          ? (platformCode === 'noon_eg'
              ? EGYPTIAN_COURIERS.find(c => c.id === 'noon_express_ship') || EGYPTIAN_COURIERS[0]
              : platformCode === 'amazon_eg'
                ? EGYPTIAN_COURIERS.find(c => c.id === 'bosta_eg') || EGYPTIAN_COURIERS[0]
                : EGYPTIAN_COURIERS[(orderIndex + i) % EGYPTIAN_COURIERS.length])
          : (EGYPTIAN_COURIERS.find(c => c.id === selectedCourierId) || EGYPTIAN_COURIERS[0]);

        const prod = productsPool[(orderIndex + i) % productsPool.length];
        const itemPrice = prod.suggestedRetailPrice || prod.currentLowestPrice || 2500;
        const trackingPrefix = courier.trackingPrefix.replace(/[^A-Za-z0-9]/g, '').slice(0, 4) || 'BST';
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        const waybillNumber = `WB-${trackingPrefix}-${randomDigits}`;
        const barcode = `622145${Math.floor(1000000 + Math.random() * 9000000)}`;

        const orderItem: OrderItem = {
          id: `item-bulk-${Date.now()}-${orderIndex}-${i}`,
          productId: prod.id,
          productTitle: prod.title,
          productImage: prod.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          sku: prod.sku || `SKU-${platformCode.toUpperCase().slice(0, 3)}-${randomDigits.toString().slice(0, 3)}`,
          unitPrice: itemPrice,
          quantity: 1,
          totalPrice: itemPrice,
          itemStatus: 'waybill_generated',
          waybillNumber,
          courierId: courier.id,
          courierName: courier.name,
          weightKg: 2.5,
          shippingFeeEGP: courier.baseDeliveryFeeEGP,
          warehouseLocation: 'مخزن القاهرة الرئيسي - رف M-01',
          barcode,
          generatedAt: new Date().toLocaleDateString('ar-EG'),
          dispatchScheduledTime: 'صباحاً (10:00 ص - 01:00 م)',
          notes: `بوليصة شحن مجمعة - منصة ${platName}`
        };

        const totalShipping = courier.baseDeliveryFeeEGP;
        const grandTotal = paymentMethod === 'cod' ? itemPrice + totalShipping : totalShipping;

        const order: CustomerOrder = {
          id: `ord-bulk-${platformCode}-${Date.now()}-${orderIndex}-${i}`,
          orderNumber: `ORD-${platformCode.toUpperCase().slice(0, 3)}-${randomDigits}`,
          customerName: customer.name,
          customerPhone: customer.phone,
          governorate: customer.gov,
          fullAddress: customer.address,
          platformSource: (['amazon_eg', 'noon_eg', 'jumia_eg', 'kenzz_eg', 'homzmart_eg'].includes(platformCode) ? platformCode : 'amazon_eg') as any,
          platformSourceName: platName,
          createdAt: 'اليوم (توليد مجمع من شريط الماركت بليس)',
          scheduledDispatchDate,
          items: [orderItem],
          subtotalEGP: itemPrice,
          totalShippingFeeEGP: totalShipping,
          discountEGP: 0,
          grandTotalEGP: grandTotal,
          paymentMethod,
          isPaid: paymentMethod !== 'cod',
          orderStatus: 'scheduled',
          notes: `تم إنشاء البوليصة وتأكيد الشحن آلياً لمنصة ${platName}`
        };

        newOrdersList.push(order);
        orderIndex++;
      }
    });

    // Save to persistent storage and trigger event
    const existing = loadAllOrders();
    const merged = [...newOrdersList, ...existing];
    saveAllOrders(merged);

    setGeneratedOrders(newOrdersList);
    setStep('success');

    // Trigger celebration & Toast
    confetti({ particleCount: 65, spread: 80, origin: { y: 0.3 } });
    if (onShowToast) {
      onShowToast(`تم بنجاح توليد ${newOrdersList.length} بوليصة شحن لمنصات الماركت بليس المحددة! 🚀📦`);
    }
  };

  const handleCopyWaybill = (wb: string) => {
    navigator.clipboard.writeText(wb);
    setCopiedWaybillId(wb);
    setTimeout(() => setCopiedWaybillId(null), 2000);
    if (onShowToast) onShowToast(`تم نسخ رقم البوليصة ${wb} 📋`);
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-['Alexandria']">
                  توليد بوالص شحن مجمعة لمنصات الماركت بليس
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Bulk Waybill Generator ⚡
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                إنشاء بوالص شحن رسمية فورية ومستقلة لجميع المنصات المحددة مع أكواد التتبع والباركود
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {step === 'configure' ? (
            <>
              {/* Marketplace Platforms Selection Card */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-200">
                      حدد منصات الماركت بليس المراد توليد البوالص لها:
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono">
                      {selectedPlatformCodes.length} / {marketplacePlatforms.length} محددة
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                  >
                    {selectedPlatformCodes.length === marketplacePlatforms.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {marketplacePlatforms.map(plat => {
                    const isChecked = selectedPlatformCodes.includes(plat.code);
                    const cleanName = plat.name.split('(')[0].trim();
                    return (
                      <label
                        key={plat.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 ring-1 ring-emerald-500/30'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePlatform(plat.code)}
                            className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                          />
                          <div className="truncate">
                            <span className="text-xs font-bold block truncate text-slate-200">{cleanName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {plat.code} {plat.isConnected ? '• متصل 🟢' : '• جاهز'}
                            </span>
                          </div>
                        </div>
                        {plat.isConnected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="قناة متصلة" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Waybill & Delivery Configuration Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Orders Per Platform */}
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-400" />
                    <span>عدد البوالص / الطلبات لكل منصة:</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setOrdersPerPlatform(num)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          ordersPerPlatform === num
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {num} {num === 1 ? 'بوليصة' : 'بوالص'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    الإجمالي المستهدف: <strong className="text-sky-300 font-bold">{selectedPlatformCodes.length * ordersPerPlatform}</strong> بوليصة شحن
                  </p>
                </div>

                {/* Courier Selection */}
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>شركة الشحن المعتمدة:</span>
                  </label>
                  <select
                    value={selectedCourierId}
                    onChange={e => setSelectedCourierId(e.target.value)}
                    className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 px-2.5 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="auto">⚡ تعيين تلقائي ذكي حسب كل منصة (بوسطة / نون / أرامكس)</option>
                    {EGYPTIAN_COURIERS.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.averageDeliveryDays})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    توليد أكواد التتبع الرسمية المتوافقة مع ماسحات الباركود للشركات
                  </p>
                </div>

                {/* Dispatch Date */}
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>تاريخ الشحن والتسليم المجدول:</span>
                  </label>
                  <input
                    type="date"
                    value={scheduledDispatchDate}
                    onChange={e => setScheduledDispatchDate(e.target.value)}
                    className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 px-2.5 focus:border-sky-500 outline-none cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    توقيت الاستلام من المستودع: 10:00 ص - 01:00 م
                  </p>
                </div>

                {/* Payment Method */}
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>طريقة التحصيل والدفع:</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 px-2.5 focus:border-sky-500 outline-none cursor-pointer"
                  >
                    <option value="cod">الدفع عند الاستلام (COD) - شامل رسوم التحصيل</option>
                    <option value="instapay">مدفوع مسبقاً عبر إنستاباي (InstaPay)</option>
                    <option value="credit_card">مدفوع إلكترونياً بالبطاقة البنكية</option>
                  </select>
                  <p className="text-[11px] text-slate-400">
                    يتم إدراج إيصال ورسوم التحصيل داخل كل بوليصة
                  </p>
                </div>
              </div>

              {/* Informative Summary Banner */}
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    سيتم توليد <strong>{selectedPlatformCodes.length * ordersPerPlatform} بوليصة شحن رسمية</strong> وحفظها فورياً في تبويب جدولة الطلبات وتحديث التزامن السحابي.
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Success & Preview Mode */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      تم توليد {generatedOrders.length} بوليصة شحن مجمعة بنجاح! 🎉
                    </h4>
                    <p className="text-xs text-emerald-300 mt-0.5">
                      تم حفظ كافة البوالص وربطها بشركات الشحن وأكواد التتبع والباركود
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrintAll}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-300" />
                  <span>طباعة البوالص</span>
                </button>
              </div>

              {/* Generated Waybill Cards */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pe-1">
                {generatedOrders.map(order => {
                  const item = order.items[0];
                  const isCopied = copiedWaybillId === item?.waybillNumber;
                  return (
                    <div
                      key={order.id}
                      className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item?.productImage}
                          alt={item?.productTitle}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-slate-100 truncate max-w-[280px]">
                              {item?.productTitle}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              {order.platformSourceName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap font-mono">
                            <span>العميل: <strong className="text-slate-300 font-sans">{order.customerName}</strong> ({order.governorate})</span>
                            <span>•</span>
                            <span>الناقل: <strong className="text-slate-300 font-sans">{item?.courierName}</strong></span>
                            <span>•</span>
                            <span>المبلغ: <strong className="text-emerald-400 font-sans">{order.grandTotalEGP} {currency}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <div className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-[11px] flex items-center gap-1.5 text-sky-300">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item?.waybillNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => item && handleCopyWaybill(item.waybillNumber)}
                          className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="نسخ رقم البوليصة"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3 sticky bottom-0">
          {step === 'configure' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                id="btn-confirm-bulk-waybill-generation"
                type="button"
                onClick={handleGenerateBulkWaybills}
                disabled={selectedPlatformCodes.length === 0}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
              >
                <Truck className="w-4 h-4" />
                <span>
                  توليد {selectedPlatformCodes.length * ordersPerPlatform} بوليصة شحن للمنصات فورياً 🚀
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>توليد دفعة إضافية</span>
              </button>

              <div className="flex items-center gap-2">
                {onNavigateToScheduling && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToScheduling();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>عرض في تبويب جدولة الطلبات</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  تم والانتهاء ✓
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
