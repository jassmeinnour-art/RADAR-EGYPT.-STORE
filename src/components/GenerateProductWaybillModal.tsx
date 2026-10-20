import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Package,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  QrCode,
  MapPin,
  Phone,
  User,
  CreditCard,
  Calendar,
  Sparkles,
  Share2,
  Download,
  Copy,
  ExternalLink,
  Layers,
  ShieldCheck,
  Building2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ProductData, ProductInventoryRecord, EgyptianGovernorate, PaymentMethod, CustomerOrder, OrderItem } from '../types';
import { EGYPTIAN_COURIERS } from '../data/orderSchedulingData';
import { loadAllOrders, saveAllOrders } from '../utils/merchantOrdersManager';

interface GenerateProductWaybillModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
  inventoryRecord?: ProductInventoryRecord;
  currency?: string;
  onWaybillGenerated?: (newOrder: CustomerOrder, waybillItem: OrderItem, updatedStock?: number) => void;
  onUpdateInventoryStock?: (productId: string, deductedQty: number) => void;
  onShowToast?: (msg: string) => void;
  onNavigateToFulfillment?: () => void;
}

const EGYPTIAN_GOVERNORATES: EgyptianGovernorate[] = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'البحيرة',
  'الغربية',
  'المنوفية',
  'أسيوط',
  'سوهاج',
  'بني سويف',
  'الفيوم',
  'المنيا',
  'قنا',
  'أسوان',
  'بورسعيد',
  'السويس',
  'الإسماعيلية',
  'دمياط',
  'كفر الشيخ',
  'البحر الأحمر',
  'مطروح'
];

const PRESET_CUSTOMERS = [
  {
    name: 'م. حسام الدين عبد الرحمن',
    phone: '01091234567',
    gov: 'القاهرة' as EgyptianGovernorate,
    address: 'شارع التسعين الشمالي، التجمع الخامس، مبنى 14B، الدور 3'
  },
  {
    name: 'د. سارة محمود خليل',
    phone: '01128765432',
    gov: 'الإسكندرية' as EgyptianGovernorate,
    address: 'طريق الكورنيش، لوران، بجوار فندق بلازا، عمارة الفيروز'
  },
  {
    name: 'أ. طارق عبد الرازق إبراهيم',
    phone: '01239876543',
    gov: 'الجيزة' as EgyptianGovernorate,
    address: 'الشيخ زايد، الحي الثامن، كمبوند الياسمين، فيلا 22'
  },
  {
    name: 'أ. ياسمين مصطفى نور',
    phone: '01554321987',
    gov: 'الدقهلية' as EgyptianGovernorate,
    address: 'مدينة المنصورة، شارع المشاية السفلية، برج النيل، شقة 10'
  },
  {
    name: 'م. رامي فهمي الدسوقي',
    phone: '01016549870',
    gov: 'أسيوط' as EgyptianGovernorate,
    address: 'شارع الجمهورية، أمام مجمع المحاكم، عمارة الأطباء'
  }
];

export const GenerateProductWaybillModal: React.FC<GenerateProductWaybillModalProps> = ({
  isOpen,
  onClose,
  product,
  inventoryRecord,
  currency = 'EGP',
  onWaybillGenerated,
  onUpdateInventoryStock,
  onShowToast,
  onNavigateToFulfillment
}) => {
  // Step: 'form' | 'success_preview'
  const [step, setStep] = useState<'form' | 'success_preview'>('form');

  // Customer Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [governorate, setGovernorate] = useState<EgyptianGovernorate>('القاهرة');
  const [fullAddress, setFullAddress] = useState('');

  // Shipping Form
  const [selectedCourierId, setSelectedCourierId] = useState('bosta');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPaid, setIsPaid] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [codAmount, setCodAmount] = useState(0);
  const [scheduledDispatchDate, setScheduledDispatchDate] = useState('');
  const [weightKg, setWeightKg] = useState(1.5);
  const [deductStockAuto, setDeductStockAuto] = useState(true);
  const [merchantNotes, setMerchantNotes] = useState('');

  // Resulting Order & Waybill
  const [createdOrder, setCreatedOrder] = useState<CustomerOrder | null>(null);
  const [createdWaybillItem, setCreatedWaybillItem] = useState<OrderItem | null>(null);

  // Selected courier details
  const selectedCourier = EGYPTIAN_COURIERS.find(c => c.id === selectedCourierId) || EGYPTIAN_COURIERS[0];

  // Initialize or reset when product changes
  useEffect(() => {
    if (product) {
      setStep('form');
      const targetPrice = product.suggestedRetailPrice || product.currentLowestPrice || 500;
      const baseFee = selectedCourier?.baseDeliveryFeeEGP || 45;
      setCodAmount(targetPrice * quantity + baseFee);
      setWeightKg(1.5);

      // Default dispatch date: Tomorrow in YYYY-MM-DD
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDispatchDate(tomorrow.toISOString().split('T')[0]);

      // Preload first demo customer if empty
      if (!customerName) {
        applyPresetCustomer(PRESET_CUSTOMERS[0]);
      }
    }
  }, [product, isOpen]);

  // Recalculate COD when quantity or payment method changes
  useEffect(() => {
    if (product) {
      const price = product.suggestedRetailPrice || product.currentLowestPrice || 500;
      const baseFee = selectedCourier?.baseDeliveryFeeEGP || 45;
      if (paymentMethod === 'cod') {
        setIsPaid(false);
        setCodAmount(price * quantity + baseFee);
      } else {
        setIsPaid(true);
        setCodAmount(0);
      }
    }
  }, [quantity, paymentMethod, selectedCourierId, product]);

  if (!isOpen || !product) return null;

  const currentStock = inventoryRecord?.currentStock ?? 15;
  const isStockLow = currentStock <= (inventoryRecord?.minReorderLevel ?? 5);
  const isStockOut = currentStock <= 0;

  const applyPresetCustomer = (preset: typeof PRESET_CUSTOMERS[0]) => {
    setCustomerName(preset.name);
    setCustomerPhone(preset.phone);
    setGovernorate(preset.gov);
    setFullAddress(preset.address);
  };

  const handleGenerateWaybill = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      if (onShowToast) onShowToast('يرجى إدخال اسم العميل');
      return;
    }
    if (!customerPhone.trim()) {
      if (onShowToast) onShowToast('يرجى إدخال رقم هاتف العميل');
      return;
    }
    if (!fullAddress.trim()) {
      if (onShowToast) onShowToast('يرجى إدخال العنوان التفصيلي للتوصيل');
      return;
    }

    // Generate unique codes
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const courierPrefix = selectedCourier.trackingPrefix || 'BST';
    const waybillNumber = `${courierPrefix}-EG-${randomDigits}`;
    const orderNumber = `ORD-EG-${new Date().getFullYear()}-${randomDigits}`;
    const barcode = `622${Date.now().toString().slice(-9)}`;
    const shippingFee = selectedCourier.baseDeliveryFeeEGP || 45;
    const unitPrice = product.suggestedRetailPrice || product.currentLowestPrice || 500;
    const totalPrice = unitPrice * quantity;

    // Create Order Item
    const newWaybillItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      productImage: product.imageUrl,
      sku: product.sku || `SKU-${product.id.slice(-6)}`,
      unitPrice,
      quantity,
      totalPrice,
      itemStatus: 'waybill_generated',
      waybillNumber,
      courierId: selectedCourier.id,
      courierName: selectedCourier.name,
      weightKg,
      shippingFeeEGP: shippingFee,
      warehouseLocation: inventoryRecord?.warehouseLocation || 'مخزن القاهرة الرئيسي - رف A4',
      barcode,
      generatedAt: new Date().toISOString(),
      dispatchScheduledTime: scheduledDispatchDate,
      notes: merchantNotes || undefined
    };

    // Create Customer Order
    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      governorate,
      fullAddress: fullAddress.trim(),
      platformSource: 'direct_whatsapp',
      platformSourceName: 'طلب رادار مباشر (Order Fulfillment)',
      createdAt: new Date().toISOString(),
      scheduledDispatchDate,
      items: [newWaybillItem],
      subtotalEGP: totalPrice,
      totalShippingFeeEGP: shippingFee,
      discountEGP: 0,
      grandTotalEGP: isPaid ? totalPrice + shippingFee : codAmount,
      paymentMethod,
      isPaid,
      orderStatus: 'scheduled',
      notes: merchantNotes || undefined,
      merchantId: 'merchant-main',
      merchantName: 'متجر التاجر المعتمد (رادار مصر)'
    };

    // 1. Save to local storage orders
    const existingOrders = loadAllOrders();
    const updatedOrders = [newOrder, ...existingOrders];
    saveAllOrders(updatedOrders);

    // 2. Deduct stock if enabled
    if (deductStockAuto && onUpdateInventoryStock) {
      onUpdateInventoryStock(product.id, quantity);
    }

    // 3. Dispatch global sync event
    try {
      window.dispatchEvent(new CustomEvent('merchant_orders_updated'));
    } catch {
      // ignore
    }

    setCreatedOrder(newOrder);
    setCreatedWaybillItem(newWaybillItem);
    setStep('success_preview');

    if (onWaybillGenerated) {
      onWaybillGenerated(newOrder, newWaybillItem, currentStock - (deductStockAuto ? quantity : 0));
    }

    if (onShowToast) {
      onShowToast(`🚚 تم إصدار بوليصة الشحن (${waybillNumber}) بنجاح وحجز كمية المخزون!`);
    }
  };

  const handlePrintThermal = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white font-['Alexandria']">
                  {step === 'form' ? 'توليد بوليصة شحن وجدولة التوصيل' : 'تم إصدار بوليصة الشحن بنجاح 🎉'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ربط المخزون بالبوليصة 📦
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 'form'
                  ? 'ربط مباشر بين المخزون الحالي وبوليصة شركة الشحن المختارة'
                  : `رقم البوليصة: ${createdWaybillItem?.waybillNumber} • شركة ${createdWaybillItem?.courierName}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {step === 'form' ? (
            <form onSubmit={handleGenerateWaybill} className="space-y-5">
              {/* Product & Stock Connectivity Ribbon */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1 font-['Alexandria']">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="font-mono bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {product.sku || 'SKU-EG'}
                      </span>
                      <span>سعر البيع: <strong className="text-emerald-400 font-mono">{(product.suggestedRetailPrice || product.currentLowestPrice).toLocaleString()} {currency}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Stock Live Badge */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-right sm:text-left">
                    <div className="text-[10px] text-slate-400">حالة الرصيد بالمخزن</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg border ${
                        isStockOut
                          ? 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                          : isStockLow
                          ? 'bg-sky-950/80 text-sky-300 border-sky-600/50'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                      }`}>
                        {currentStock} قطعة متوفرة
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Auto-fill Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>تعبئة سريعة لبيانات عميل مصري (Presets):</span>
                  </span>
                  <span className="text-[11px] text-slate-400">وفر الوقت للتجربة السريعة</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_CUSTOMERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPresetCustomer(preset)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer active:scale-95"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{preset.gov} - {preset.name.split(' ')[1] || preset.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Shipping Info */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>بيانات المستلم وعنوان الشحن</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      اسم العميل المستلم <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: م. أحمد حسام الشناوي"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      رقم الهاتف (واتساب) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="01012345678"
                        dir="ltr"
                        className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none font-mono text-left"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      المحافظة <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value as EgyptianGovernorate)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none font-bold"
                    >
                      {EGYPTIAN_GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>محافظة {gov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      كمية الطرد (عدد القطع) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={Math.max(currentStock, 100)}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none font-bold font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      العنوان التفصيلي وملاحظات التوصيل <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="اسم الشارع، رقم المبنى، الدور، الشقة، علامة مميزة..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Courier Company Selector */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>شركة الشحن والتوصيل (Courier)</span>
                  </h5>
                  <span className="text-[11px] text-slate-400 font-mono">
                    تكلفة الشحن: <strong className="text-white font-bold">{selectedCourier.baseDeliveryFeeEGP} ج.م</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {EGYPTIAN_COURIERS.map(c => {
                    const isChosen = c.id === selectedCourierId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCourierId(c.id)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          isChosen
                            ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-lg mb-1">{c.logo}</div>
                        <div className="text-xs font-bold text-white truncate font-['Alexandria']">{c.name.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.averageDeliveryDays}</div>
                        <div className="text-[10px] font-black text-emerald-400 font-mono mt-1">{c.baseDeliveryFeeEGP} ج.م</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Schedule Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    طريقة الدفع
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none font-bold"
                  >
                    <option value="cod">الدفع عند الاستلام (COD)</option>
                    <option value="instapay">إنستاباي (InstaPay)</option>
                    <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                    <option value="credit_card">بطاقة بنكية / فيزا</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    مبلغ التحصيل المطلوب (ج.م)
                  </label>
                  <input
                    type="number"
                    value={codAmount}
                    onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                    disabled={paymentMethod !== 'cod'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none font-mono font-bold disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    تاريخ الجدولة واستلام الشحنة
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDispatchDate}
                    onChange={(e) => setScheduledDispatchDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none font-mono text-center font-bold"
                  />
                </div>
              </div>

              {/* Automatic Stock Deduction Checkbox */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductStockAuto}
                    onChange={(e) => setDeductStockAuto(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-900"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-200 block">
                      خصم الكمية ({quantity} قطعة) فورياً من رصيد المخزون وحجزها لهذا الطرد
                    </span>
                    <span className="text-[11px] text-slate-400">
                      يضمن عدم تكرار بيع نفس القطعة على منصات أخرى وتحديث سجلات المخزن
                    </span>
                  </div>
                </label>
                <span className="text-xs font-mono font-black text-emerald-400 hidden sm:inline">
                  متبقي متوقع: {Math.max(0, currentStock - (deductStockAuto ? quantity : 0))} ق
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/60 border border-emerald-400/40 cursor-pointer active:scale-95 transition-all"
                >
                  <Truck className="w-4 h-4" />
                  <span>إصدار بوليصة الشحن وحجز المخزون 🚚</span>
                </button>
              </div>
            </form>
          ) : (
            /* Success & Printable Waybill Preview */
            <div className="space-y-5">
              {/* Waybill Slip Preview Box */}
              <div className="p-6 rounded-3xl bg-white text-slate-900 shadow-2xl border-2 border-slate-300 space-y-4 font-['Cairo']">
                {/* Slip Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedCourier.logo}</span>
                    <div>
                      <h4 className="text-base font-black font-['Alexandria'] text-slate-900 leading-tight">
                        {selectedCourier.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Official Waybill & Delivery Manifest • السوق المصري
                      </span>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="text-[10px] text-slate-400">تاريخ الإصدار</div>
                    <div className="text-xs font-black text-slate-800">
                      {new Date().toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>

                {/* Barcode Graphic Banner */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <div className="text-3xl font-mono tracking-widest font-black text-slate-900 select-all">
                    ||||| | |||| ||||| || |||||| | |||||
                  </div>
                  <div className="font-mono text-sm font-black text-indigo-700 tracking-wider">
                    {createdWaybillItem?.waybillNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    الباركود التجاري: {createdWaybillItem?.barcode} • رقم أمر الشحن: {createdOrder?.orderNumber}
                  </div>
                </div>

                {/* Sender & Receiver 2-Column Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50">
                  <div className="space-y-1 pr-2 border-l border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">الراسل (Shipper):</span>
                    <div className="font-bold text-slate-900">{createdOrder?.merchantName}</div>
                    <div className="text-slate-600 text-[11px]">{createdWaybillItem?.warehouseLocation}</div>
                    <div className="text-slate-600 font-mono text-[11px]">مخازن رادار التاجر الذكية</div>
                  </div>

                  <div className="space-y-1 pl-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">المستلم (Consignee):</span>
                    <div className="font-bold text-slate-900">{createdOrder?.customerName}</div>
                    <div className="text-emerald-700 font-black font-['Alexandria']">
                      محافظة {createdOrder?.governorate}
                    </div>
                    <div className="text-slate-700 line-clamp-2 text-[11px]">{createdOrder?.fullAddress}</div>
                    <div className="text-slate-900 font-mono font-bold text-[11px]">هاتف: {createdOrder?.customerPhone}</div>
                  </div>
                </div>

                {/* Packaged Product Item Details */}
                <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-[11px]">
                    <span className="font-bold text-slate-800">الصنف المغلف:</span>
                    <span className="font-mono font-bold text-indigo-700">SKU: {createdWaybillItem?.sku}</span>
                  </div>
                  <div className="font-bold text-slate-900 pt-1 line-clamp-1">
                    {createdWaybillItem?.productTitle}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <span>الكمية: <strong className="text-slate-900">{createdWaybillItem?.quantity} قطعة</strong></span>
                    <span>الوزن التقديري: <strong className="text-slate-900 font-mono">{createdWaybillItem?.weightKg} كجم</strong></span>
                    <span>تاريخ التوصيل المجدول: <strong className="text-slate-900 font-mono">{createdOrder?.scheduledDispatchDate}</strong></span>
                  </div>
                </div>

                {/* Total Cash Collection / COD Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      المبلغ المطلوب تحصيله (COD):
                    </span>
                    <span className="text-xs text-emerald-700">
                      {createdOrder?.isPaid ? 'مدفوع إلكترونياً بالكامل (مسبق الدفع)' : 'تحصيل نقدي عند التسليم بالجنيه المصري'}
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono text-emerald-900">
                    {createdOrder?.grandTotalEGP.toLocaleString()} {currency}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintThermal}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة بوليصة حرارية 🖨️</span>
                  </button>

                  <a
                    href={`https://wa.me/2${createdOrder?.customerPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                      `مرحباً ${createdOrder?.customerName}، تم تجهيز طلبك (${createdWaybillItem?.productTitle}) وإصدار بوليصة الشحن برقم تتبع: ${createdWaybillItem?.waybillNumber} مع شركة ${selectedCourier.name}. سيتم التوصيل بتاريخ ${createdOrder?.scheduledDispatchDate}. شكراً لتعاملك معنا!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>إرسال التتبع للعميل عبر واتساب 📲</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateToFulfillment && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToFulfillment();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/40 transition cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>فتح جدول أوامر الشحن والمتابعة</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
