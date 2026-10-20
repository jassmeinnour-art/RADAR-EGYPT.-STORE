import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Printer, 
  Calendar, 
  CalendarPlus,
  MapPin, 
  Phone, 
  CreditCard, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Search, 
  Plus, 
  FileText, 
  Barcode, 
  ExternalLink, 
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Download,
  Share2,
  Sparkles,
  Scissors,
  AlertTriangle,
  X,
  Key,
  Store,
  Scan
} from 'lucide-react';
import { CustomerOrder, OrderItem, EgyptianGovernorate, ProductData, RemoteMerchantClient } from '../types';
import { INITIAL_CUSTOMER_ORDERS, EGYPTIAN_COURIERS } from '../data/orderSchedulingData';
import { VERIFIED_AMAZON_EG_PRODUCTS } from '../services/livePlatformProductSync';
import { WaybillCalendarExportModal } from './WaybillCalendarExportModal';
import { BulkWaybillCalendarModal } from './BulkWaybillCalendarModal';
import { AmazonMultiItemWaybillCropperModal } from './AmazonMultiItemWaybillCropperModal';
import { WaybillOcrUploadModal } from './WaybillOcrUploadModal';
import { 
  generateWaybillGoogleCalendarUrl,
  downloadWaybillIcsFile,
  downloadOrderIcsFile 
} from '../utils/googleCalendarExport';
import { safeOpenUrl } from '../utils/safeWindowOpen';
import { 
  splitMultiItemOrder, 
  splitAllMultiItemOrders, 
  loadAllOrders, 
  pullLiveOrdersFromPlatforms, 
  checkAmazonSpApiStatus 
} from '../utils/merchantOrdersManager';
import { getActiveManagedMerchantId, loadAllRegisteredMerchants } from '../utils/platformLaunchHelper';

interface OrderSchedulingWaybillsProps {
  allProducts?: ProductData[];
  onShowToast?: (msg: string) => void;
  activeMerchantId?: string;
  remoteMerchants?: RemoteMerchantClient[];
  onOpenManageApisModal?: (merchantId?: string) => void;
}

const STORAGE_KEY = 'merchant_scheduled_orders_v1';

export const OrderSchedulingWaybills: React.FC<OrderSchedulingWaybillsProps> = ({
  allProducts = [],
  onShowToast,
  activeMerchantId,
  remoteMerchants = [],
  onOpenManageApisModal
}) => {
  const activeProductCatalog = allProducts.length > 0 ? allProducts : VERIFIED_AMAZON_EG_PRODUCTS;

  const [orders, setOrders] = useState<CustomerOrder[]>(() => loadAllOrders());
  const [spApiStatus, setSpApiStatus] = useState<{
    configured: boolean;
    tokenExpired?: boolean;
    requiresReauth?: boolean;
    lwaExchanged?: boolean;
    expiresIn?: number;
    encryptedStorage?: boolean;
    message: string;
    dataMode?: string;
    merchantName?: string;
  } | null>(null);
  const [isPullingOrders, setIsPullingOrders] = useState(false);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [lwaExpiredAlert, setLwaExpiredAlert] = useState<string | null>(null);
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState<string>('all');
  const [isWaybillOcrOpen, setIsWaybillOcrOpen] = useState<boolean>(false);

  // Resolve current active merchant
  const effectiveMerchantId = activeMerchantId || getActiveManagedMerchantId();
  const merchantsList = remoteMerchants && remoteMerchants.length > 0 ? remoteMerchants : loadAllRegisteredMerchants();
  const currentMerchant = merchantsList.find(m => m.id === effectiveMerchantId) || merchantsList[0];

  // Check Amazon SP-API status on mount and when merchant changes
  useEffect(() => {
    let isMounted = true;
    setLwaExpiredAlert(null);
    checkAmazonSpApiStatus(currentMerchant).then(st => {
      if (isMounted) {
        setSpApiStatus(st);
        if (st.tokenExpired || st.requiresReauth) {
          setLwaExpiredAlert(st.message);
        }
      }
    });
    return () => { isMounted = false; };
  }, [currentMerchant?.id, currentMerchant?.dataMode, currentMerchant?.apiCredentials?.isConfigured, currentMerchant?.apiCredentials?.amazonRefreshToken]);

  // Listen for runtime LWA Token Expiration events without halting the application
  useEffect(() => {
    const handleLwaExpired = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail?.merchantId || detail.merchantId === currentMerchant?.id) {
        setLwaExpiredAlert(
          detail?.message ||
          `انتهت صلاحية رمز الـ Refresh Token للمتجر "${currentMerchant?.storeName || ''}" — يرجى إعادة إدخال مفتاح الـ Refresh Token الخاص بمتجرك لتجديد الاتصال بـ Login with Amazon.`
        );
      }
    };
    window.addEventListener('merchant_radar_lwa_token_expired', handleLwaExpired);
    return () => window.removeEventListener('merchant_radar_lwa_token_expired', handleLwaExpired);
  }, [currentMerchant?.id, currentMerchant?.storeName]);

  // Pull orders dynamically from Amazon SP-API for active merchant
  const handlePullAmazonOrders = async () => {
    setIsPullingOrders(true);
    setSyncErrorMessage(null);
    try {
      const newOrders = await pullLiveOrdersFromPlatforms(currentMerchant);
      const updatedAll = loadAllOrders();
      setOrders(updatedAll);
      setSearchQuery('');
      setStatusFilter('all');
      setSelectedGovernorate('all');
      if (selectedMerchantFilter !== 'all' && currentMerchant?.id && selectedMerchantFilter !== currentMerchant.id) {
        setSelectedMerchantFilter(currentMerchant.id);
      }
      if (newOrders.length > 0) {
        if (onShowToast) {
          onShowToast(`✅ تم سحب ${newOrders.length} طلبات حقيقية (${newOrders.map(o => o.orderNumber).join('، ')}) للتاجر "${currentMerchant?.storeName || 'المحدد'}" عبر Amazon SP-API! 📦`);
        }
      } else {
        if (onShowToast) {
          onShowToast(`ℹ️ تم الاتصال بسيلر سنترال للتاجر "${currentMerchant?.storeName || 'المحدد'}": لا توجد طلبات جديدة حالياً.`);
        }
      }
    } catch (e: any) {
      const msg = e?.message || `يرجى ضبط مفاتيح Amazon SP-API للتاجر "${currentMerchant?.storeName}" في إعدادات المنصات أو Vercel`;
      setSyncErrorMessage(msg);
      if (onShowToast) onShowToast(`⚠️ ${msg}`);
    } finally {
      setIsPullingOrders(false);
      checkAmazonSpApiStatus(currentMerchant).then(st => setSpApiStatus(st));
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // safe fallback
    }
  }, [orders]);

  // Synchronize orders if updated externally
  useEffect(() => {
    const handleSync = () => {
      const all = loadAllOrders();
      setOrders(all);
    };
    window.addEventListener('merchant_orders_updated', handleSync);
    return () => window.removeEventListener('merchant_orders_updated', handleSync);
  }, []);

  // Split specific multi-item order into independent single-item orders
  const handleSplitOrder = (orderId: string) => {
    const res = splitMultiItemOrder(orderId);
    if (res.success) {
      setOrders(loadAllOrders());
      if (onShowToast) onShowToast(res.message);
    } else {
      if (onShowToast) onShowToast(res.message);
    }
  };

  // Split all multi-item orders in bulk
  const handleSplitAllOrders = () => {
    const res = splitAllMultiItemOrders();
    setOrders(loadAllOrders());
    if (onShowToast) onShowToast(`تم بنجاح فصل ${res.splitCount} طلبات متعددة إلى ${res.newOrdersCount} بوالص وطلبات شحن مستقلة تماماً! ✂️`);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  
  // State for Waybill Modal Preview
  const [activeWaybillItem, setActiveWaybillItem] = useState<{
    order: CustomerOrder;
    item: OrderItem;
  } | null>(null);

  // State for Google Calendar Export Modals
  const [calendarModalTarget, setCalendarModalTarget] = useState<{
    order: CustomerOrder;
    item?: OrderItem;
  } | null>(null);
  const [isBulkCalendarOpen, setIsBulkCalendarOpen] = useState(false);
  const [isAmazonCropperOpen, setIsAmazonCropperOpen] = useState(false);

  // State for New Order creation modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newGovernorate, setNewGovernorate] = useState<EgyptianGovernorate>('القاهرة');
  const [newAddress, setNewAddress] = useState('');
  const [newPlatform, setNewPlatform] = useState<CustomerOrder['platformSource']>('amazon_eg');
  const [newCourierId, setNewCourierId] = useState<string>(EGYPTIAN_COURIERS[0].id);
  const [newDispatchDate, setNewDispatchDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [newDispatchTimeWindow, setNewDispatchTimeWindow] = useState<string>('صباحاً (10:00 ص - 01:00 م)');
  const [newSelectedProducts, setNewSelectedProducts] = useState<string[]>(() => {
    if (activeProductCatalog.length >= 2) return [activeProductCatalog[0].id, activeProductCatalog[1].id];
    if (activeProductCatalog.length === 1) return [activeProductCatalog[0].id];
    return [];
  });

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (selectedMerchantFilter !== 'all') {
      if (order.merchantId && order.merchantId !== selectedMerchantFilter) return false;
    }

    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.merchantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.items.some(item => item.waybillNumber.toLowerCase().includes(searchQuery.toLowerCase()) || item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && order.orderStatus !== statusFilter) return false;
    if (selectedGovernorate !== 'all' && order.governorate !== selectedGovernorate) return false;
    return true;
  });

  // Print trigger for active waybill
  const handlePrintCurrentWaybill = () => {
    if (onShowToast) onShowToast(`جاري إرسال البوليصة ${activeWaybillItem?.item.waybillNumber} إلى الطابعة...`);
    window.print();
  };

  // Generate new order with distinct waybills per item
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone || !newAddress) {
      if (onShowToast) onShowToast('برجاء استكمال جميع بيانات العميل والعنوان');
      return;
    }

    const orderNum = `ORD-EG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const courier = EGYPTIAN_COURIERS.find(c => c.id === newCourierId) || EGYPTIAN_COURIERS[0];
    let subtotal = 0;

    const generatedItems: OrderItem[] = newSelectedProducts.map((prodId, idx) => {
      const prod = activeProductCatalog.find(p => p.id === prodId) || activeProductCatalog[0];
      const itemPrice = prod ? (prod.suggestedRetailPrice || prod.currentLowestPrice) : 2500;
      subtotal += itemPrice;
      const uniqueWbNumber = `WB-${courier.id.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const barcodeDigits = `622145${Math.floor(1000000 + Math.random() * 9000000)}`;

      return {
        id: `item-${Date.now()}-${idx}`,
        productId: prod ? prod.id : `prod-${idx + 1}`,
        productTitle: prod ? prod.title : 'قطعة أثاث ومفروشات معتمدة',
        productImage: prod ? prod.imageUrl : 'https://images.unsplash.com/photo-1580481077195-c3a821a506cb?w=800',
        sku: prod?.sku || `SKU-EG-${idx + 101}`,
        unitPrice: itemPrice,
        quantity: 1,
        totalPrice: itemPrice,
        itemStatus: 'waybill_generated',
        waybillNumber: uniqueWbNumber,
        courierId: courier.id,
        courierName: courier.name,
        weightKg: 0.75,
        shippingFeeEGP: courier.baseDeliveryFeeEGP || 45,
        warehouseLocation: `مخزن القاهرة الرئيسي - رف M-0${idx + 1}`,
        barcode: barcodeDigits,
        generatedAt: 'اليوم (الآن)',
        dispatchScheduledTime: newDispatchTimeWindow,
        notes: `بوليصة شحن مستقلة للمنتج ${idx + 1} (${courier.name})`
      };
    });

    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: newCustomerName,
      customerPhone: newCustomerPhone,
      governorate: newGovernorate,
      fullAddress: newAddress,
      platformSource: newPlatform,
      platformSourceName: newPlatform === 'amazon_eg' ? 'أمازون مصر' : newPlatform === 'noon_eg' ? 'نون مصر' : newPlatform === 'kenzz_eg' ? 'منصة كنز' : newPlatform === 'homzmart_eg' ? 'هومزمارت' : 'تيك توك شوب',
      createdAt: 'اليوم',
      scheduledDispatchDate: newDispatchDate,
      items: generatedItems,
      subtotalEGP: subtotal,
      totalShippingFeeEGP: generatedItems.length * (courier.baseDeliveryFeeEGP || 45),
      discountEGP: 50,
      grandTotalEGP: subtotal + (generatedItems.length * (courier.baseDeliveryFeeEGP || 45)) - 50,
      paymentMethod: 'cod',
      isPaid: false,
      orderStatus: 'scheduled',
      notes: 'طلب مجدول متعدد المنتجات مع بوالص منفصلة لكل صنف',
      merchantName: 'متجر الأثاث والتجهيزات'
    };

    setOrders([newOrder, ...orders]);
    setIsCreateModalOpen(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewAddress('');
    if (onShowToast) onShowToast(`تمت إضافة الطلب ${orderNum} وتوليد ${generatedItems.length} بوالص شحن مختلفة بنجاح!`);
  };

  return (
    <div className="space-y-6" id="order-scheduling-waybills-container">
      {/* SP-API & LWA Token Expiration Internal Alert Banner (Non-halting Fallback) */}
      {((spApiStatus && !spApiStatus.configured) || syncErrorMessage || lwaExpiredAlert) && (
        <div id="amazon-sp-api-warning-banner-waybills" className="p-4 sm:p-5 rounded-2xl bg-sky-950/90 border-2 border-sky-500/80 text-sky-200 shadow-2xl flex flex-col sm:flex-row items-start gap-3.5 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 text-sky-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1 text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-sky-300 font-['Alexandria']">
                {lwaExpiredAlert
                  ? `⚠️ تنبيه انتهاء صلاحية رمز الربط (LWA Refresh Token Expired) — المتجر "${currentMerchant?.storeName || 'الحالي'}"`
                  : currentMerchant?.storeName 
                  ? `يرجى ضبط مفتاح Refresh Token المشفر للتاجر "${currentMerchant.storeName}"`
                  : 'يرجى ضبط مفتاح Amazon SP-API Refresh Token'}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                النظام يعمل دون توقف (Graceful Fallback Active) 🛡️
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lwaExpiredAlert || (
                <>
                  فشل تجديد رمز الدخول التلقائي عبر خادم <code className="font-mono text-sky-300">https://api.amazon.com/auth/o2/token</code> (<code className="font-mono text-sky-300">grant_type: refresh_token</code>). يرجى إعادة إدخال مفتاح الـ <strong>Refresh Token</strong> الخاص بمتجرك ليتم حفظه بشكل مشفر واستئناف التحديث الفوري دون إيقاف النظام:
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-sky-500/30 text-sky-300 font-bold">LWA Endpoint: api.amazon.com/auth/o2/token</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-sky-500/30 text-sky-300 font-bold">grant_type: refresh_token</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300 font-bold">Encrypted Storage: ENC_LWA_V1 🔐</span>
            </div>
            {syncErrorMessage && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2">
                <span>⚠️ {syncErrorMessage}</span>
              </div>
            )}
            {onOpenManageApisModal && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenManageApisModal(currentMerchant?.id)}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>إعادة إدخال مفتاح Refresh Token للمتجر الآن 🔑</span>
                </button>
                {lwaExpiredAlert && (
                  <button
                    type="button"
                    onClick={() => setLwaExpiredAlert(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    إخفاء التنبيه مؤقتاً
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Merchant Context & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sky-300 font-bold">
            <Store className="w-4 h-4" />
            <span>التاجر النشط:</span>
          </div>
          <span className="font-black text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
            🏬 {currentMerchant?.storeName || 'Step QUeen'}
          </span>
          {currentMerchant?.apiCredentials?.amazonSellerId && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Seller ID: {currentMerchant.apiCredentials.amazonSellerId}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            currentMerchant?.dataMode === 'demo'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              : currentMerchant?.apiCredentials?.amazonRefreshToken
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
          }`}>
            {currentMerchant?.dataMode === 'demo'
              ? '🧪 وضع المعاينة التجريبية (Demo)'
              : currentMerchant?.apiCredentials?.amazonRefreshToken
                ? '🟢 Token متجر مستقل (Firestore SP-API)'
                : '🔄 خيار احتياطي افتراضي (DEFAULT_REFRESH_TOKEN)'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenManageApisModal && (
            <button
              type="button"
              onClick={() => onOpenManageApisModal(currentMerchant?.id)}
              className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl border border-indigo-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="إدارة مفاتيح ربط المنصات لهذا التاجر (Amazon SP-API / Noon API)"
            >
              <Key className="w-3.5 h-3.5 text-sky-300" />
              <span>إدارة مفاتيح الربط (APIs) 🔑</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">عرض طلبات:</span>
            <select
              value={selectedMerchantFilter}
              onChange={(e) => setSelectedMerchantFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">كل التجار ({orders.length})</option>
              {merchantsList.map(m => (
                <option key={m.id} value={m.id}>
                  🏬 {m.storeName} ({orders.filter(o => o.merchantId === m.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
              نظام جدولة الطلبات المتعددة وبوالص الشحن المنفصلة
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Alexandria'] text-white">
              إدارة الطلبات متعددة الأصناف وطباعة البوالص وتصدير المواعيد
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              جدولة مواعيد تسليم الطلبات وبوالص الشحن المستقلة لكل صنف، مع <strong>إمكانية تصدير التواريخ والمواعيد إلى تقويم جوجل (Google Calendar)</strong> عبر روابط مباشرة لتذكير ومتابعة مندوبي الشحن والعملاء.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Pull Amazon SP-API Orders Button */}
            <button
              id="btn-pull-amazon-orders-waybills"
              type="button"
              onClick={handlePullAmazonOrders}
              disabled={isPullingOrders}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer select-none font-['Alexandria'] disabled:opacity-50"
              title="سحب طلبات الأثاث الحقيقية مباشرة من Amazon SP-API"
            >
              <Truck className={`w-4 h-4 ${isPullingOrders ? 'animate-bounce' : ''}`} />
              <span>{isPullingOrders ? 'جاري السحب...' : 'سحب طلبات أمازون سيلر (SP-API) 📦'}</span>
            </button>

            {/* Split all multi-item orders button */}
            {orders.some(o => o.items && o.items.length > 1) && (
              <button
                id="btn-split-all-multi-orders"
                type="button"
                onClick={handleSplitAllOrders}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer select-none font-['Alexandria']"
                title="فصل كافة الطلبات التي تحتوي على أكثر من منتج إلى بوالص وطلبات شحن مستقلة برقم تتبع خاص لكل صنف"
              >
                <Scissors className="w-4 h-4 text-slate-950" />
                <span>فصل الطلبات المتعددة إلى بوالص مستقلة ({orders.filter(o => o.items && o.items.length > 1).length}) ✂️</span>
              </button>
            )}

            {/* Amazon Multi-Item Waybill Cropper Button */}
            <button
              id="btn-open-amazon-waybill-cropper"
              type="button"
              onClick={() => setIsAmazonCropperOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 via-sky-600 to-orange-600 hover:from-sky-400 hover:to-orange-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-sky-950/40 border border-sky-300/60 flex items-center gap-2 cursor-pointer select-none font-['Alexandria']"
              title="قص ومعالجة بوالص شحن أمازون متعددة المنتجات (Thermal 4x6 / A4) دون إخفاء أي منتج"
            >
              <Scissors className="w-4 h-4 text-slate-950" />
              <span>قص بوالص أمازون متعددة الأصناف (Thermal 4x6 / A4) ✂️</span>
            </button>

            {/* OCR Waybill Import Scanner Button */}
            <button
              id="btn-open-waybill-ocr-scanner"
              type="button"
              onClick={() => setIsWaybillOcrOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer select-none"
              title="استيراد ومسح بوالص الشحن PDF أو صور بالـ OCR الذكي لاستخراج رقم الطلب وشركة الشحن"
            >
              <Scan className="w-4 h-4 text-white" />
              <span>مسح واستيراد بوالص بالـ OCR 📄</span>
            </button>

            {/* Google Calendar Bulk Schedule Export Button */}
            <button
              id="btn-open-bulk-calendar"
              type="button"
              onClick={() => setIsBulkCalendarOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer select-none font-['Alexandria']"
              title="عرض جدول مواعيد شحن البوالص وتصديرها لتقويم جوجل (Google Calendar)"
            >
              <CalendarPlus className="w-4 h-4 text-blue-100" />
              <span>مواعيد الشحن بـ Google Calendar 📅</span>
            </button>

            <button
              id="btn-create-scheduled-order"
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إنشاء طلب مجدول جديد وتوليد البوالص
            </button>
          </div>
        </div>

        {/* Courier Fast Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-800/50">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي الطلبات النشطة</span>
            <div className="text-xl font-bold text-white font-mono">{orders.length} طلبات</div>
            <span className="text-[10px] text-indigo-300">مجدولة للشحن</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي البوالص المنفصلة</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {orders.reduce((acc, o) => acc + (o.items?.length || 0), 0)} بوليصة
            </div>
            <span className="text-[10px] text-emerald-300">كل صنف برقم تتبع مستقل</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">شركات الشحن المعتمدة</span>
            <div className="text-xl font-bold text-sky-300 font-mono">5 شركات</div>
            <span className="text-[10px] text-slate-300">بوسطة، أرامكس، نون، البريد، أوتو</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي قيمة التحصيل (COD)</span>
            <div className="text-xl font-bold text-indigo-300 font-mono">
              {orders.reduce((acc, o) => acc + o.grandTotalEGP, 0).toLocaleString('ar-EG')} ج.م
            </div>
            <span className="text-[10px] text-indigo-200">مستحقات نقدية ورقمية</span>
          </div>
        </div>
      </div>

      {/* SP-API Notice / Warning Banner */}
      {((spApiStatus && !spApiStatus.configured) || syncErrorMessage) && (
        <div id="amazon-sp-api-waybills-warning-banner" className="p-4 sm:p-5 rounded-2xl bg-sky-950/80 border-2 border-sky-500/80 text-sky-200 shadow-2xl flex flex-col sm:flex-row items-start gap-3.5 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 text-sky-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1 text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-sky-300 font-['Alexandria']">
                {currentMerchant?.storeName 
                  ? `يرجى ضبط مفاتيح Amazon SP-API للتاجر "${currentMerchant.storeName}"`
                  : 'يرجى ضبط مفاتيح ربط Amazon SP-API'}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                نظام متعدد التجار Multi-Tenant 🏬
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              لسحب واستيراد طلبات الأثاث الحقيقية لهذا التاجر مباشرة من Amazon Selling Partner API (SP-API)، يرجى إدخال مفاتيح الربط الخاصة به:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-sky-500/30 text-sky-300 font-bold">LWA Client ID</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-sky-500/30 text-sky-300 font-bold">Client Secret</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-sky-500/30 text-sky-300 font-bold">Refresh Token</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-sky-500/30 text-sky-300 font-bold">Region: "eu-west-1"</span>
            </div>
            {syncErrorMessage && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2">
                <span>⚠️ {syncErrorMessage}</span>
              </div>
            )}
            {onOpenManageApisModal && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenManageApisModal(currentMerchant?.id)}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>ضبط مفاتيح الربط للتاجر الآن (Manage Merchant APIs) 🔑</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث برقم الطلب، رقم البوليصة، اسم العميل، أو المحافظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusFilter === 'scheduled' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مجدولة للشحن
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusFilter === 'processing' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              قيد التجهيز
            </button>
          </div>

          <select
            value={selectedGovernorate}
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">كل المحافظات</option>
            <option value="القاهرة">القاهرة</option>
            <option value="الجيزة">الجيزة</option>
            <option value="الإسكندرية">الإسكندرية</option>
            <option value="الدقهلية">الدقهلية (المنصورة)</option>
          </select>
        </div>
      </div>

      {/* Orders List with Individual Product Waybills */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {orders.length === 0 
                ? 'لا توجد طلبات جديدة حالياً'
                : 'لا توجد طلبات مطابقة لبحثك'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {orders.length === 0
                ? 'تم إيقاف الطلبات الوهمية نهائياً. يتم جلب الطلبات الفعلية المباشرة من Amazon SP-API أو Noon API فور توفرها، أو يمكنك إنشاء طلب شحن وتوليد البوالص يدوياً.'
                : 'جرب تغيير كلمات البحث أو إعادة تعيين الفلاتر'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handlePullAmazonOrders}
                disabled={isPullingOrders}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Truck className="w-4 h-4" />
                <span>سحب طلبات أمازون سيلر (Amazon SP-API)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء طلب شحن جديد وإصدار البوالص</span>
              </button>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Order Top Bar Header */}
              <div className="bg-slate-50/80 p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-800 font-mono font-bold text-xs">
                    {order.orderNumber}
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    منصة: {order.platformSourceName}
                  </span>
                  {order.merchantName && (
                    <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                      <Store className="w-3 h-3 text-indigo-600" />
                      <span>متجر: {order.merchantName}</span>
                    </span>
                  )}
                  {order.isDemo && (
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-300">
                      🧪 معاينة تجريبية Sandbox
                    </span>
                  )}
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    تاريخ الإنشاء: {order.createdAt}
                  </span>
                  <span className="text-xs text-indigo-700 font-semibold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    موعد التسليم المجدول: {order.scheduledDispatchDate}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Add to Calendar (.ics) for Entire Order */}
                  <button
                    type="button"
                    onClick={() => {
                      downloadOrderIcsFile(order);
                      if (onShowToast) {
                        onShowToast(`تم تنزيل ملف التقويم (.ics) لكافة شحنات الطلب ${order.orderNumber} 📅`);
                      }
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs select-none"
                    title="تنزيل ملف .ics لكافة شحنات هذا الطلب وإضافته للتقويم"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Add to Calendar (.ics)</span>
                  </button>

                  {/* Google Calendar Link for Entire Order */}
                  <button
                    type="button"
                    onClick={() => setCalendarModalTarget({ order })}
                    className="text-xs px-3 py-1.5 rounded-xl font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs select-none"
                    title="تصدير موعد تسليم هذا الطلب بالكامل لتقويم جوجل"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>تقويم جوجل 📅</span>
                  </button>

                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {order.orderStatus === 'scheduled' ? '📅 مجدول للتسليم' : '⚡ قيد التجهيز بالمستودع'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200">
                    إجمالي الطلب: <strong className="font-mono text-indigo-700">{order.grandTotalEGP.toLocaleString('ar-EG')} ج.م</strong>
                  </span>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/30 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block">بيانات العميل:</span>
                  <div className="font-bold text-slate-900">{order.customerName}</div>
                  <div className="text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {order.customerPhone}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block">عنوان التوصيل (المحافظة):</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {order.governorate}
                  </div>
                  <div className="text-slate-600 line-clamp-2">{order.fullAddress}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block">طريقة الدفع وملاحظات الشحن:</span>
                  <div className="font-bold text-slate-800">
                    {order.paymentMethod === 'cod' ? '💵 دفع عند الاستلام (COD)' : order.paymentMethod === 'instapay' ? '⚡ مدفوع إنستاباي' : order.paymentMethod === 'vodafone_cash' ? '📱 مدفوع فودافون كاش' : '💳 تقسيط فاليو (ValU)'}
                  </div>
                  <div className="text-slate-500 text-[11px] line-clamp-1">{order.notes || 'لا توجد ملاحظات'}</div>
                </div>
              </div>

              {/* If Order has multiple items, offer prominent Split Order button */}
              {order.items && order.items.length > 1 && (
                <div className="mx-4 sm:mx-5 mt-4 p-3.5 bg-gradient-to-r from-sky-50 to-orange-50 border border-sky-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-sky-100 text-sky-800 font-bold text-xs flex items-center gap-1 shrink-0">
                      <Scissors className="w-3.5 h-3.5 text-sky-700" />
                      شحنة مجمعة ({order.items.length} منتجات)
                    </span>
                    <span className="text-xs text-sky-950 font-medium">
                      هذا الطلب يحتوي على أصناف متعددة. يمكنك فصله ومعالجة كل منتج كطلب شحن مستقل برقم تتبع وبوليصة خاصة به.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAmazonCropperOpen(true)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-sky-300 font-bold text-xs rounded-xl border border-sky-400/50 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                      title="قص ومعالجة قياسات هذه البوليصة للطباعة الحرارية 4×6 أو ورق A4 دون قص الأصناف"
                    >
                      <Scissors className="w-3.5 h-3.5 text-sky-400" />
                      <span>قص وتجهيز البوليصة (Thermal 4x6 / A4) ✂️</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSplitOrder(order.id)}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                      title="فصل هذا الطلب إلى طلبات منفصلة برقم بوليصة مستقل لكل منتج"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>فصل الطلب إلى {order.items.length} بوالص ✂️</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Individual Products Breakdown & Separate Waybill Controls */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    أصناف الطلب ({order.items?.length || 0} منتجات) - بوليصة شحن مستقلة لكل صنف:
                  </h4>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    يمكن طباعة كل بوليصة على حدى للفرز أو الشحن المنفصل
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {order.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                        />
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                صنف #{idx + 1}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-black bg-indigo-50 text-indigo-800 border border-indigo-200">
                                ASIN: {item.asin || item.productId || item.sku}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              {item.unitPrice.toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                            {item.productTitle}
                          </h5>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono">SKU: <strong>{item.sku}</strong></span>
                            <span>•</span>
                            <span>الكمية: <strong>{item.quantity}</strong></span>
                            <span>•</span>
                            <span>الوزن: <strong>{item.weightKg} كجم</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Distinct Waybill Number & Courier Bar */}
                      <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70 p-2.5 rounded-xl">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-[11px] text-slate-500">رقم البوليصة المستقلة:</span>
                          </div>
                          <div className="font-mono font-black text-xs text-indigo-900 tracking-wider">
                            {item.waybillNumber}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            شركة الشحن: {item.courierName}
                          </span>
                        </div>

                        {/* Action Buttons: Add to Calendar (.ics Download) + Google Calendar Modal + Print Waybill */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            id={`btn-add-to-calendar-${item.waybillNumber}`}
                            type="button"
                            onClick={() => {
                              downloadWaybillIcsFile(order, item);
                              if (onShowToast) {
                                onShowToast(`تم تنزيل ملف التقويم (.ics) لشحنة ${item.waybillNumber} بنجاح! 📅`);
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs select-none"
                            title="تنزيل ملف .ics يحتوي على بيانات وتوقيت هذه الشحنة لإضافتها للتقويم"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-white" />
                            <span>Add to Calendar</span>
                          </button>

                          <button
                            id={`btn-calendar-waybill-${item.waybillNumber}`}
                            type="button"
                            onClick={() => setCalendarModalTarget({ order, item })}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs select-none active:scale-95"
                            title="خيارات إضافية لتصدير الموعد لتقويم جوجل أو مشاركته عبر واتساب"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                            <span>تقويم جوجل</span>
                          </button>

                          <button
                            id={`btn-print-waybill-${item.waybillNumber}`}
                            onClick={() => setActiveWaybillItem({ order, item })}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30 border border-emerald-500/50 active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>معاينة وطباعة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Waybill Print Modal (معاينة وطباعة بوليصة الشحن الرسمية للمنتج الفردي) */}
      {activeWaybillItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setActiveWaybillItem(null)}
              className="absolute top-5 left-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Waybill Printable Document Sheet */}
            <div className="space-y-6" id="printable-waybill-sheet">
              {/* Header: Courier Logo & Barcode */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <div className="text-xl font-black font-['Alexandria'] text-slate-900 flex items-center gap-2">
                    <span>{activeWaybillItem.item.courierName}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    بوليصة شحن وتوصيل سريعة موثقة • السوق المصري
                  </span>
                </div>

                <div className="text-left">
                  <div className="text-[10px] text-slate-400">تاريخ الإصدار والطباعة</div>
                  <div className="text-xs font-bold font-mono text-slate-800">2026-08-26</div>
                </div>
              </div>

              {/* Barcode Visual Display */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                <div className="text-3xl font-mono tracking-widest font-black text-slate-900">
                  ||||| | |||| ||||| || |||||| | |||||
                </div>
                <div className="font-mono text-sm font-bold text-indigo-700 tracking-wider">
                  {activeWaybillItem.item.waybillNumber}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  الباركود: {activeWaybillItem.item.barcode} • كود الطلب الأصلي: {activeWaybillItem.order.orderNumber}
                </div>
              </div>

              {/* Sender & Receiver 2-Column Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-2xl p-4">
                {/* Sender */}
                <div className="space-y-1 pr-2 border-l border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">الراسل (Merchant Sender):</span>
                  <div className="font-bold text-slate-900">{activeWaybillItem.order.merchantName || 'تكنو إيجيبت للتجارة'}</div>
                  <div className="text-slate-600">القاهرة - مبنى التجارة الإلكترونية</div>
                  <div className="text-slate-600 font-mono">هاتف: 01000000000</div>
                </div>

                {/* Receiver */}
                <div className="space-y-1 pl-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">المستلم (Consignee):</span>
                  <div className="font-bold text-slate-900">{activeWaybillItem.order.customerName}</div>
                  <div className="text-slate-700 font-semibold text-rose-700 font-['Alexandria']">
                    محافظة {activeWaybillItem.order.governorate}
                  </div>
                  <div className="text-slate-600 line-clamp-2">{activeWaybillItem.order.fullAddress}</div>
                  <div className="text-slate-900 font-mono font-bold">هاتف: {activeWaybillItem.order.customerPhone}</div>
                </div>
              </div>

              {/* Item Details Box */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800">بيانات الصنف المغلف داخل هذا الطرد:</span>
                  <span className="font-mono font-bold text-indigo-700">SKU: {activeWaybillItem.item.sku}</span>
                </div>

                <div className="text-xs font-bold text-slate-900">
                  {activeWaybillItem.item.productTitle}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600">
                  <div>الكمية: <strong className="text-slate-900">{activeWaybillItem.item.quantity} قطعة</strong></div>
                  <div>الوزن: <strong className="text-slate-900">{activeWaybillItem.item.weightKg} كجم</strong></div>
                  <div>موقع الرف: <strong className="text-slate-900">{activeWaybillItem.item.warehouseLocation}</strong></div>
                </div>
              </div>

              {/* Financial Collection (COD / Paid) */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-indigo-600 block">المبلغ المطلوب تحصيله للقطعة (COD):</span>
                  <div className="text-2xl font-black text-indigo-950 font-mono">
                    {activeWaybillItem.order.isPaid ? '0 (مدفوع مسبقاً)' : `${activeWaybillItem.item.totalPrice.toLocaleString('ar-EG')} ج.م`}
                  </div>
                </div>
                <div className="text-left text-xs text-indigo-800">
                  <span className="font-bold">حالة الدفع: </span>
                  <span>{activeWaybillItem.order.isPaid ? '✓ خالص الدفع' : 'تحصيل نقدي عند الاستلام'}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeWaybillItem) {
                      downloadWaybillIcsFile(activeWaybillItem.order, activeWaybillItem.item);
                      if (onShowToast) {
                        onShowToast(`تم تنزيل ملف التقويم (.ics) لشحنة ${activeWaybillItem.item.waybillNumber} بنجاح! 📅`);
                      }
                    }
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 select-none active:scale-95"
                  title="Add to Calendar - تنزيل ملف .ics ببيانات وتوقيت هذه الشحنة"
                >
                  <CalendarPlus className="w-4 h-4 text-white" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeWaybillItem) {
                      setCalendarModalTarget(activeWaybillItem);
                    }
                  }}
                  className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs select-none active:scale-95"
                  title="خيارات إضافية لتصدير موعد شحن هذه البوليصة إلى تقويم جوجل أو مشاركتها عبر واتساب"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>خيارات تقويم جوجل</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveWaybillItem(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={handlePrintCurrentWaybill}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 border border-emerald-500/50 active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  طباعة البوليصة الآن (Print Waybill)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Scheduled Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 font-['Alexandria'] mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              إنشاء طلب مجدول جديد وتوليد البوالص
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم العميل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: م. طارق الصاوي"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم الهاتف:</label>
                  <input
                    type="text"
                    required
                    placeholder="01012345678"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المحافظة:</label>
                  <select
                    value={newGovernorate}
                    onChange={(e) => setNewGovernorate(e.target.value as EgyptianGovernorate)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="الدقهلية">الدقهلية (المنصورة)</option>
                    <option value="الشرقية">الشرقية (الزقازيق)</option>
                    <option value="الغربية">الغربية (طنطا)</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="سوهاج">سوهاج</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">العنوان بالتفصيل:</label>
                <input
                  type="text"
                  required
                  placeholder="الشارع، رقم العمارة، الدور، الشقة"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">منصة المصدر:</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    <option value="amazon_eg">أمازون مصر (Amazon Egypt)</option>
                    <option value="noon_eg">نون مصر (Noon Partner)</option>
                    <option value="kenzz_eg">منصة كنز مصر (Kenzz Deals)</option>
                    <option value="homzmart_eg">هومزمارت مصر (Homzmart)</option>
                    <option value="tiktok_shop">تيك توك شوب والمبيعات المباشرة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">شركة الشحن المعتمدة:</label>
                  <select
                    value={newCourierId}
                    onChange={(e) => setNewCourierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    {EGYPTIAN_COURIERS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.baseDeliveryFeeEGP} ج.م)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scheduled Date and Time Window for Calendar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div className="space-y-1">
                  <label className="font-bold text-indigo-950 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    تاريخ التسليم المجدول:
                  </label>
                  <input
                    type="date"
                    required
                    value={newDispatchDate}
                    onChange={(e) => setNewDispatchDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-sans text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-indigo-950 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    نافذة وقت التسليم / استلام المندوب:
                  </label>
                  <select
                    value={newDispatchTimeWindow}
                    onChange={(e) => setNewDispatchTimeWindow(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-['Alexandria'] text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="صباحاً (10:00 ص - 01:00 م)">صباحاً (10:00 ص - 01:00 م)</option>
                    <option value="ظهراً (01:00 م - 04:00 م)">ظهراً (01:00 م - 04:00 م)</option>
                    <option value="مساءً (04:00 م - 07:00 م)">مساءً (04:00 م - 07:00 م)</option>
                    <option value="طوال اليوم (09:00 ص - 06:00 م)">طوال اليوم (09:00 ص - 06:00 م)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">
                  الأصناف المتعددة المطلوب تضمينها وتوليد بوليصة لكل منها:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {activeProductCatalog.map((prod) => (
                    <label key={prod.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSelectedProducts.includes(prod.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewSelectedProducts([...newSelectedProducts, prod.id]);
                          } else {
                            setNewSelectedProducts(newSelectedProducts.filter(id => id !== prod.id));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-slate-800 line-clamp-1">{prod.title}</span>
                      <span className="text-slate-400 font-mono mr-auto">{prod.currentLowestPrice} ج.م</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  تأكيد وحفظ الطلب وتوليد البوالص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waybill Google Calendar Export Modal */}
      {calendarModalTarget && (
        <WaybillCalendarExportModal
          isOpen={!!calendarModalTarget}
          onClose={() => setCalendarModalTarget(null)}
          order={calendarModalTarget.order}
          item={calendarModalTarget.item}
          onShowToast={onShowToast}
        />
      )}

      {/* Bulk Waybills Google Calendar Modal */}
      <BulkWaybillCalendarModal
        isOpen={isBulkCalendarOpen}
        onClose={() => setIsBulkCalendarOpen(false)}
        orders={orders}
        onShowToast={onShowToast}
      />

      {/* Amazon Multi-Item Waybill Cropper Modal */}
      <AmazonMultiItemWaybillCropperModal
        isOpen={isAmazonCropperOpen}
        onClose={() => setIsAmazonCropperOpen(false)}
        orders={orders}
        allProducts={activeProductCatalog}
        activeMerchant={currentMerchant}
        onShowToast={onShowToast}
        onOrderUpdated={() => setOrders(loadAllOrders())}
      />

      {/* Waybill OCR Upload & Scan Modal */}
      <WaybillOcrUploadModal
        isOpen={isWaybillOcrOpen}
        onClose={() => setIsWaybillOcrOpen(false)}
        orders={orders}
        onWaybillExtracted={(updatedOrder, waybillNumber, courierName) => {
          const updatedOrders = orders.map(o => {
            if (o.id === updatedOrder.id) {
              return {
                ...o,
                items: o.items.map(it => ({ ...it, waybillNumber, courierName }))
              };
            }
            return o;
          });
          setOrders(updatedOrders);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
          } catch (e) {}
        }}
        onShowToast={onShowToast || (() => {})}
      />
    </div>
  );
};
