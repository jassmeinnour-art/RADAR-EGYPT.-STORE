import React, { useState, useMemo } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Package,
  Phone,
  Building2,
  Sliders,
  Code,
  Terminal,
  Globe,
  RefreshCw,
  Clock,
  Trash2,
  ExternalLink,
  ChevronLeft,
  Info,
  ShieldCheck,
  Zap,
  ArrowRight,
  Settings
} from 'lucide-react';
import {
  ProductData,
  ProductInventoryRecord,
  WhatsAppSupplierAutomationConfig,
  WhatsAppDispatchLog,
  ReorderPurchaseOrder
} from '../types';
import {
  DEFAULT_WHATSAPP_TEMPLATE,
  getStoredWhatsAppConfig,
  saveStoredWhatsAppConfig,
  getStoredWhatsAppLogs,
  saveStoredWhatsAppLogs,
  renderAutomatedWhatsAppMessage,
  getWhatsAppDeepLink,
  getStoredReorders,
  saveStoredReorders,
  saveStoredInventory,
  getStoredSuppliers
} from '../data/inventoryData';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface WhatsAppSupplierAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: ProductInventoryRecord[];
  products: ProductData[];
  onUpdateInventory: (updated: ProductInventoryRecord[]) => void;
  onShowToast?: (message: string) => void;
  preselectedProductId?: string;
  onOpenSupplierDirectory?: (productId?: string) => void;
}

export const WhatsAppSupplierAutomationModal: React.FC<WhatsAppSupplierAutomationModalProps> = ({
  isOpen,
  onClose,
  inventory,
  products,
  onUpdateInventory,
  onShowToast,
  preselectedProductId,
  onOpenSupplierDirectory
}) => {
  const suppliers = useMemo(() => getStoredSuppliers(), []);
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'template' | 'api' | 'logs'>('queue');

  // Config & Logs
  const [config, setConfig] = useState<WhatsAppSupplierAutomationConfig>(getStoredWhatsAppConfig);
  const [logs, setLogs] = useState<WhatsAppDispatchLog[]>(getStoredWhatsAppLogs);

  // Selected item for previewing & customization
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  // Filter items that are at or below reorder level (currentStock <= minReorderLevel)
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.minReorderLevel);
  }, [inventory]);

  // Chosen active item for detailed preview in template & API tabs
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedProductId || lowStockItems[0]?.productId || inventory[0]?.productId || ''
  );

  // Quantities for each item in the queue (allows customizing before sending)
  const [reorderQuantities, setReorderQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    inventory.forEach(inv => {
      init[inv.productId] = inv.reorderQuantity || 25;
    });
    return init;
  });

  // Supplier phones (allows quick editing)
  const [supplierPhones, setSupplierPhones] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    inventory.forEach(inv => {
      init[inv.productId] = inv.supplierPhone;
    });
    return init;
  });

  // Copy indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API test state
  const [apiTesting, setApiTesting] = useState<boolean>(false);
  const [apiTestResponse, setApiTestResponse] = useState<any | null>(null);

  if (!isOpen) return null;

  const currentRecord = inventory.find(i => i.productId === selectedItemId) || inventory[0];
  const currentProduct = currentRecord ? productMap.get(currentRecord.productId) : products[0];

  const currentQuantity = currentRecord ? (reorderQuantities[currentRecord.productId] || currentRecord.reorderQuantity || 25) : 25;
  const currentPhone = currentRecord ? (supplierPhones[currentRecord.productId] || currentRecord.supplierPhone) : '';

  // Generate preview message
  const previewMessage = currentRecord && currentProduct
    ? renderAutomatedWhatsAppMessage(
        { ...currentRecord, supplierPhone: currentPhone },
        currentProduct,
        currentQuantity,
        config.customMessageTemplate
      )
    : '';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (onShowToast) onShowToast('تم نسخ النص بنجاح إلى الحافظة 📋');
  };

  // Dispatch single item to supplier via WhatsApp
  const handleDispatchSingleWhatsApp = (item: ProductInventoryRecord) => {
    const prod = productMap.get(item.productId);
    if (!prod) return;

    const phone = supplierPhones[item.productId] || item.supplierPhone;
    const qty = reorderQuantities[item.productId] || item.reorderQuantity || 25;
    const totalCost = qty * item.costPerUnitEGP;

    const msg = renderAutomatedWhatsAppMessage(
      { ...item, supplierPhone: phone },
      prod,
      qty,
      config.customMessageTemplate
    );

    const deepLink = getWhatsAppDeepLink(phone, msg);

    // Record PO if enabled in config
    if (config.autoRecordPurchaseOrder) {
      const newPo: ReorderPurchaseOrder = {
        id: `po-wa-${Date.now()}-${item.productId.slice(0, 4)}`,
        productId: item.productId,
        productTitle: prod.title,
        sku: item.sku,
        quantity: qty,
        supplierName: item.supplierName,
        supplierPhone: phone,
        warehouseLocation: item.warehouseLocation,
        unitCostEGP: item.costPerUnitEGP,
        totalCostEGP: totalCost,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: new Date(Date.now() + item.leadTimeDays * 86400000).toISOString().split('T')[0],
        status: 'dispatched',
        notes: 'تم الإصدار والإرسال التلقائي عبر واتساب'
      };

      const existingPos = getStoredReorders();
      saveStoredReorders([newPo, ...existingPos]);

      // Update incoming stock
      const updatedInv = inventory.map(i => {
        if (i.productId === item.productId) {
          return {
            ...i,
            incomingStock: (i.incomingStock || 0) + qty
          };
        }
        return i;
      });
      onUpdateInventory(updatedInv);
      saveStoredInventory(updatedInv);
    }

    // Add to dispatch logs
    const newLog: WhatsAppDispatchLog = {
      id: `log-${Date.now()}-${item.productId.slice(0, 5)}`,
      productId: item.productId,
      productTitle: prod.title,
      sku: item.sku,
      supplierName: item.supplierName,
      supplierPhone: phone,
      quantityOrdered: qty,
      currentStock: item.currentStock,
      minReorderLevel: item.minReorderLevel,
      warehouseLocation: item.warehouseLocation,
      totalCostEGP: totalCost,
      dispatchedAt: new Date().toISOString(),
      messageText: msg,
      status: 'sent_direct'
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredWhatsAppLogs(updatedLogs);

    // Trigger open WhatsApp
    safeOpenUrl(deepLink);

    if (onShowToast) {
      onShowToast(`📲 تم فتح واتساب لإرسال أمر التوريد إلى المورد (${item.supplierName})`);
    }
  };

  // Test Server API Dispatch
  const handleTestApiDispatch = async () => {
    if (!currentRecord || !currentProduct) return;
    setApiTesting(true);
    setApiTestResponse(null);

    const qty = currentQuantity;
    const phone = currentPhone;

    try {
      const response = await fetch('/api/inventory/whatsapp/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentRecord.productId,
          productTitle: currentProduct.title,
          sku: currentRecord.sku,
          supplierName: currentRecord.supplierName,
          supplierPhone: phone,
          quantityOrdered: qty,
          currentStock: currentRecord.currentStock,
          minReorderLevel: currentRecord.minReorderLevel,
          warehouseLocation: currentRecord.warehouseLocation,
          totalCostEGP: qty * currentRecord.costPerUnitEGP,
          messageText: previewMessage,
          webhookUrl: config.webhookUrl
        })
      });

      const resData = await response.json();
      setApiTestResponse({
        statusCode: response.status,
        ok: response.ok,
        data: resData
      });

      // Reload local logs
      if (resData.data) {
        const updated = [resData.data, ...logs];
        setLogs(updated);
        saveStoredWhatsAppLogs(updated);
      }

      if (onShowToast) {
        onShowToast('⚡ تم اختبار واجهة الـ API بنجاح وقيد السجل البرمجي');
      }
    } catch (err: any) {
      setApiTestResponse({
        statusCode: 500,
        ok: false,
        error: err?.message || 'Failed to call /api/inventory/whatsapp/dispatch-alert'
      });
    } finally {
      setApiTesting(false);
    }
  };

  // Save Config
  const handleSaveConfig = () => {
    saveStoredWhatsAppConfig(config);
    if (onShowToast) {
      onShowToast('✅ تم حفظ إعدادات وقالب أتمتة رسائل واتساب بنجاح');
    }
  };

  // Reset Template to default
  const handleResetTemplate = () => {
    setConfig(prev => ({
      ...prev,
      customMessageTemplate: DEFAULT_WHATSAPP_TEMPLATE
    }));
    if (onShowToast) {
      onShowToast('تمت استعادة القالب الافتراضي المعتمد 🔄');
    }
  };

  // Insert Variable Token into Template
  const handleInsertToken = (token: string) => {
    setConfig(prev => ({
      ...prev,
      customMessageTemplate: prev.customMessageTemplate + ` ${token} `
    }));
  };

  // Clear logs
  const handleClearLogs = () => {
    setLogs([]);
    saveStoredWhatsAppLogs([]);
    if (onShowToast) onShowToast('تم مسح سجل الرسائل');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-fadeIn" id="whatsapp-automation-modal">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200/90 overflow-hidden animate-scaleUp">
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <MessageCircle className="w-6 h-6 fill-white/20 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">أتمتة إشعارات الموردين التلقائية عبر واتساب</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/20">
                  WhatsApp Reorder Bot
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                ربط مستويات المخزون المنخفضة وحدود الطلب برسائل فورية للموردين وتكامل برمجي مع الـ API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Header */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 pt-2 gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            id="tab-btn-queue"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>أصناف حد الطلب الجاهزة للإشعار</span>
            {lowStockItems.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-sky-500 text-white rounded-full">
                {lowStockItems.length}
              </span>
            )}
          </button>

          <button
            id="tab-btn-template"
            onClick={() => setActiveTab('template')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'template'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>تخصيص القالب والرسالة التلقائية</span>
          </button>

          <button
            id="tab-btn-api"
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'api'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>واجهة الـ API والـ Webhook</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded-md">
              REST
            </span>
          </button>

          <button
            id="tab-btn-logs"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>سجل الإرسال</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded-full">
              {logs.length}
            </span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: QUEUE OF LOW-STOCK ITEMS READY FOR DISPATCH */}
          {/* ========================================================= */}
          {activeTab === 'queue' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Summary Alert Banner */}
              <div className="bg-gradient-to-l from-sky-50 to-orange-50/70 rounded-2xl p-4 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-sky-950">
                      يوجد ({lowStockItems.length}) أصناف وصلت لحد الطلب الأدنى أو تحته
                    </h4>
                    <p className="text-xs text-sky-800">
                      يمكنك إرسال رسائل أوامر التوريد عبر واتساب مباشرة بضغطة زر واحدة لكل مورد، مع تحديث البضاعة الواردة آلياً.
                    </p>
                  </div>
                </div>

                {lowStockItems.length > 0 && (
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => {
                        // Sequential dispatch for all low stock items
                        lowStockItems.forEach((item, index) => {
                          setTimeout(() => {
                            handleDispatchSingleWhatsApp(item);
                          }, index * 900);
                        });
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال لجميع الموردين ({lowStockItems.length}) ⚡</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Items List */}
              {lowStockItems.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">لا توجد أصناف منخفضة حالياً!</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    جميع الأصناف في المستودعات بمستوى آمن وصحي. يمكنك اختيار أي صنف من القائمة أدناه لمعاينة أو اختبار رسالة التوريد البرمجية للمورد.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {lowStockItems.map(item => {
                    const prod = productMap.get(item.productId);
                    const qty = reorderQuantities[item.productId] || item.reorderQuantity || 25;
                    const phone = supplierPhones[item.productId] || item.supplierPhone;
                    const isCritical = item.currentStock <= 1;
                    const totalCost = qty * item.costPerUnitEGP;

                    return (
                      <div
                        key={item.productId}
                        className={`rounded-2xl p-4 border transition-all ${
                          isCritical
                            ? 'bg-rose-50/30 border-rose-200/90 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          {/* Item Basic Info */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-13 h-13 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod?.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-slate-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                  isCritical ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-800'
                                }`}>
                                  {isCritical ? '🚨 نفاد حرج (قطع معدودة)' : '⚠️ عند حد الطلب الأدنى'}
                                </span>
                                <span className="font-mono text-xs text-slate-500">{item.sku}</span>
                              </div>
                              <h4 className="text-sm font-black text-slate-900 truncate mt-0.5">
                                {prod?.title || item.sku}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                                <span>المخزون الحالي: <b className="text-slate-900">{item.currentStock}</b> قطعة</span>
                                <span>•</span>
                                <span>حد الطلب الأدنى: <b className="text-sky-700">{item.minReorderLevel}</b> قطعة</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-700">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                  {item.supplierName}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Editable Controls: Reorder Qty & Phone */}
                          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                            {/* Quantity Selector */}
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-bold text-slate-500">الكمية المطلوبة:</span>
                              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReorderQuantities(prev => ({
                                      ...prev,
                                      [item.productId]: Math.max(5, (prev[item.productId] || 25) - 5)
                                    }));
                                  }}
                                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={qty}
                                  onChange={e => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    setReorderQuantities(prev => ({ ...prev, [item.productId]: val }));
                                  }}
                                  className="w-14 text-center text-xs font-black bg-transparent border-0 focus:outline-hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReorderQuantities(prev => ({
                                      ...prev,
                                      [item.productId]: (prev[item.productId] || 25) + 5
                                    }));
                                  }}
                                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-500 text-center font-medium">
                                ({totalCost.toLocaleString()} ج.م)
                              </span>
                            </div>

                            {/* Supplier Phone & Delivery Rate Field */}
                            {(() => {
                              const suppProfile = suppliers.find(
                                s => s.name === item.supplierName || s.phone === phone
                              );
                              const deliveryRate = suppProfile?.averageDeliveryDays ?? suppProfile?.leadTimeDays ?? item.leadTimeDays ?? 2.0;

                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-bold text-slate-500">واتساب المورد:</span>
                                    <span
                                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-md border ${
                                        deliveryRate <= 1.5
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : deliveryRate <= 2.5
                                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                                          : 'bg-sky-50 text-sky-800 border-sky-200'
                                      }`}
                                      title="معدل التوريد: متوسط عدد الأيام التي يستغرقها المورد للتوصيل"
                                    >
                                      ⏱️ {deliveryRate} {deliveryRate <= 2 ? 'يوم' : 'أيام'} للتوصيل
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <input
                                      type="text"
                                      value={phone}
                                      onChange={e => {
                                        setSupplierPhones(prev => ({
                                          ...prev,
                                          [item.productId]: e.target.value
                                        }));
                                      }}
                                      className="w-28 text-xs font-mono font-bold text-slate-800 bg-transparent border-0 focus:outline-hidden text-left"
                                      dir="ltr"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500 truncate max-w-[100px]">
                                      {item.warehouseLocation.split('-')[0]}
                                    </span>
                                    {onOpenSupplierDirectory && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onClose();
                                          onOpenSupplierDirectory(item.productId);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                                        title="مقارنة واختيار مورد بديل أسرع بناءً على معدل التوريد"
                                      >
                                        بديل أسرع؟ ⚡
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Dispatch Button */}
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => handleDispatchSingleWhatsApp(item)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                                title="إرسال رسالة أمر توريد فوري عبر تطبيق واتساب"
                              >
                                <MessageCircle className="w-4 h-4 fill-emerald-100 text-white" />
                                <span>إرسال واتساب 📲</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedItemId(item.productId);
                                  setActiveTab('template');
                                }}
                                className="px-2 py-1 text-[11px] text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-colors text-center"
                              >
                                معاينة الرسالة 👁️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TEMPLATE CUSTOMIZATION & LIVE WHATSAPP BUBBLE */}
          {/* ========================================================= */}
          {activeTab === 'template' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Product selector for testing preview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">معاينة الرسالة لصنف محدد:</span>
                </div>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  {inventory.map(inv => {
                    const prod = productMap.get(inv.productId);
                    return (
                      <option key={inv.productId} value={inv.productId}>
                        {prod?.title?.slice(0, 45) || inv.sku} (مخزون: {inv.currentStock} / حد الطلب: {inv.minReorderLevel})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Template Editor Column */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-600" />
                      <span>صياغة قالب رسالة الواتساب التلقائية:</span>
                    </label>
                    <button
                      onClick={handleResetTemplate}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>استعادة القالب الافتراضي</span>
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={config.customMessageTemplate}
                    onChange={e => setConfig(prev => ({ ...prev, customMessageTemplate: e.target.value }))}
                    className="w-full text-xs font-mono p-3.5 bg-slate-900 text-emerald-300 rounded-2xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 leading-relaxed"
                    dir="rtl"
                  />

                  {/* Dynamic Variable Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600">انقر لإدراج متغير ديناميكي:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '{اسم_المورد}',
                        '{اسم_المنتج}',
                        '{الكود}',
                        '{المخزون_المتبقي}',
                        '{حد_الطلب}',
                        '{الكمية_المطلوبة}',
                        '{المستودع}',
                        '{سعر_الجملة}',
                        '{إجمالي_القيمة}',
                        '{تاريخ_الطلب}'
                      ].map(token => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => handleInsertToken(token)}
                          className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 font-mono text-[11px] rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          + {token}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Automation Flags */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-800 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoTriggerEnabled}
                        onChange={e => setConfig(prev => ({ ...prev, autoTriggerEnabled: e.target.checked }))}
                        className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>تفعيل التنبيه التلقائي للمورد عند وصول رصيد الصنف لحد الطلب الأدنى</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-800 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoRecordPurchaseOrder}
                        onChange={e => setConfig(prev => ({ ...prev, autoRecordPurchaseOrder: e.target.checked }))}
                        className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>قيد أمر توريد جديد (PO) في النظام وإضافته للبضاعة الواردة عند إرسال الواتساب</span>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ تعديلات القالب والإعدادات</span>
                  </button>
                </div>

                {/* WhatsApp Chat Bubble Preview Column */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>معاينة حية لشاشة واتساب (WhatsApp Bubble):</span>
                    </label>
                    <button
                      onClick={() => handleCopy(previewMessage, 'preview-msg')}
                      className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'preview-msg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'preview-msg' ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
                    </button>
                  </div>

                  {/* Simulated WhatsApp Window */}
                  <div className="bg-[#efeae2] rounded-2xl border border-slate-300 p-3 shadow-inner flex flex-col space-y-3 min-h-[380px]">
                    {/* Simulated WhatsApp Chat Top Bar */}
                    <div className="bg-[#075e54] text-white p-2.5 rounded-xl flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-300 text-emerald-950 font-bold flex items-center justify-center text-xs">
                          {currentRecord?.supplierName?.charAt(0) || 'م'}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold leading-tight truncate max-w-[150px]">
                            {currentRecord?.supplierName || 'مورد معتمد'}
                          </h5>
                          <span className="text-[10px] text-emerald-200 font-mono" dir="ltr">
                            {currentPhone}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-200">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Chat Bubble */}
                    <div className="flex justify-start">
                      <div className="bg-[#d9fdd3] text-slate-900 p-3 rounded-2xl rounded-tr-xs max-w-[95%] shadow-xs border border-emerald-200/60 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                        {previewMessage}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-800/80 font-mono">
                          <span>{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>✓✓</span>
                        </div>
                      </div>
                    </div>

                    {/* Action in preview */}
                    <div className="mt-auto pt-2">
                      <button
                        onClick={() => {
                          if (currentRecord) handleDispatchSingleWhatsApp(currentRecord);
                        }}
                        className="w-full py-2 bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white text-[#25d366]" />
                        <span>فتح وإرسال المحادثة الآن في واتساب 📲</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: DEVELOPER API & WEBHOOKS */}
          {/* ========================================================= */}
          {activeTab === 'api' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Endpoint Overview */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-md">
                      POST
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-emerald-400 font-bold">
                      /api/inventory/whatsapp/dispatch-alert
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">JSON Body</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  واجهة برمجية (REST API Endpoint) مخصصة لاستقبال أحداث انخفاض المخزون وإصدار رسائل واتساب تلقائية للموردين، وقيدها كأوامر توريد وإعادة توجيهها للـ Webhook الخارجي (Meta Cloud API / UltraMsg / Zapier).
                </p>

                {/* External Webhook Configuration */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>رابط الـ Webhook الخارجي (اختياري - للربط مع WhatsApp Cloud API / UltraMsg):</span>
                    <span className="text-[11px] text-slate-400">URL Endpoint</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="https://api.ultramsg.com/instance/messages/chat أو https://graph.facebook.com/v19.0/..."
                      value={config.webhookUrl || ''}
                      onChange={e => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-hidden"
                      dir="ltr"
                    />
                    <button
                      onClick={handleSaveConfig}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
                    >
                      حفظ الرابط
                    </button>
                  </div>
                </div>

                {/* Test API Dispatch Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleTestApiDispatch}
                    disabled={apiTesting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {apiTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    <span>إرسال طلب تجريبي برمجياً (Test API Ping)</span>
                  </button>
                  <span className="text-xs text-slate-400">
                    سيقوم بإرسال بيانات الصنف المحدد: ({currentProduct?.title?.slice(0, 30)}...)
                  </span>
                </div>

                {/* Live API Response Display */}
                {apiTestResponse && (
                  <div className="space-y-2 pt-2 border-t border-slate-800 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>استجابة السيرفر البرمجية (Server Response):</span>
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        Status: {apiTestResponse.statusCode}
                      </span>
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-52 border border-slate-800" dir="ltr">
                      {JSON.stringify(apiTestResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* cURL Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-600" />
                    <span>كود الاستدعاء عبر cURL (لأجهزة الباركود والأنظمة الخارجية):</span>
                  </h5>
                  <button
                    onClick={() => {
                      const curlCode = `curl -X POST "https://your-domain.com/api/inventory/whatsapp/dispatch-alert" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productId": "${currentRecord?.productId || 'p-01'}",
    "productTitle": "${currentProduct?.title || 'صنف تجريبي'}",
    "sku": "${currentRecord?.sku || 'SKU-001'}",
    "supplierName": "${currentRecord?.supplierName || 'شركة النور'}",
    "supplierPhone": "${currentPhone}",
    "quantityOrdered": ${currentQuantity},
    "currentStock": ${currentRecord?.currentStock || 3},
    "minReorderLevel": ${currentRecord?.minReorderLevel || 10},
    "warehouseLocation": "${currentRecord?.warehouseLocation || 'مستودع العتبة'}",
    "totalCostEGP": ${(currentRecord?.costPerUnitEGP || 1000) * currentQuantity},
    "messageText": "أمر توريد عاجل عبر واتساب"
  }'`;
                      handleCopy(curlCode, 'curl-code');
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'curl-code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'curl-code' ? 'تم النسخ!' : 'نسخ كود cURL'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800" dir="ltr">
{`curl -X POST "/api/inventory/whatsapp/dispatch-alert" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productId": "${currentRecord?.productId || 'p-01'}",
    "productTitle": "${currentProduct?.title?.slice(0, 35) || 'منتج'}",
    "sku": "${currentRecord?.sku || 'SKU-001'}",
    "supplierName": "${currentRecord?.supplierName || 'المورد'}",
    "supplierPhone": "${currentPhone}",
    "quantityOrdered": ${currentQuantity},
    "currentStock": ${currentRecord?.currentStock || 0},
    "minReorderLevel": ${currentRecord?.minReorderLevel || 10}
  }'`}
                </pre>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: DISPATCH HISTORY & LOGS */}
          {/* ========================================================= */}
          {activeTab === 'logs' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-800">
                    سجل أوامر التوريد ورسائل واتساب المرسلة ({logs.length})
                  </h4>
                </div>

                {logs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح السجل</span>
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">لا توجد رسائل مسجلة بعد. عند إرسال أي أمر توريد سيتم توثيقه هنا تلقائياً.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logs.map(log => (
                    <div
                      key={log.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                            {log.status === 'webhook_delivered' ? '⚡ Webhook تم التسليم' : '📲 WhatsApp مباشر'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{log.productTitle}</span>
                          <span className="font-mono text-xs text-slate-500">({log.sku})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                          {new Date(log.dispatchedAt).toLocaleString('ar-EG')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <span>المورد: <b className="text-slate-800">{log.supplierName}</b> ({log.supplierPhone})</span>
                          <span>•</span>
                          <span>الكمية: <b className="text-emerald-700">{log.quantityOrdered}</b> قطعة</span>
                          <span>•</span>
                          <span>المستودع: <b>{log.warehouseLocation}</b></span>
                        </div>

                        <button
                          onClick={() => handleCopy(log.messageText, log.id)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === log.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === log.id ? 'تم النسخ!' : 'نسخ نص الرسالة'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام أتمتة الواتساب متوافق مع سوق التجارة والمستودعات في مصر (EGP)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
