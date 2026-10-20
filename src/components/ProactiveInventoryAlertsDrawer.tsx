import React, { useState } from 'react';
import {
  Bell,
  Zap,
  AlertTriangle,
  DollarSign,
  Package,
  Clock,
  Check,
  CheckCheck,
  X,
  ArrowRight,
  MessageCircle,
  Truck,
  ArrowLeftRight,
  Sliders,
  Building2,
  Trash2,
  Sparkles,
  Download
} from 'lucide-react';
import {
  ProductData,
  ProductInventoryRecord,
  InventoryAlertNotification
} from '../types';
import { safeOpenUrl } from '../utils/safeWindowOpen';
import { createWhatsAppSupplierReorderMessage } from '../data/inventoryData';

interface ProactiveInventoryAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: InventoryAlertNotification[];
  inventory: ProductInventoryRecord[];
  products: ProductData[];
  onApplyOptimalQty: (productId: string, optimalQty: number) => void;
  onBatchApplyAllOptimalQty: () => void;
  onOpenPoModal: (item: ProductInventoryRecord) => void;
  onOpenTransferModal: (productId: string) => void;
  onDismissAlert?: (alertId: string) => void;
  onClearAllAlerts?: () => void;
  currency?: string;
  onShowToast?: (message: string) => void;
}

export const ProactiveInventoryAlertsDrawer: React.FC<ProactiveInventoryAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  inventory,
  products,
  onApplyOptimalQty,
  onBatchApplyAllOptimalQty,
  onOpenPoModal,
  onOpenTransferModal,
  onDismissAlert,
  onClearAllAlerts,
  currency = 'EGP',
  onShowToast
}) => {
  const [filterType, setFilterType] = useState<'all' | 'proactive_velocity' | 'optimal_reorder_savings' | 'reorder_point'>('all');

  if (!isOpen) return null;

  const productMap = new Map(products.map(p => [p.id, p]));
  const invMap = new Map(inventory.map(i => [i.productId, i]));

  const proactiveVelocityAlerts = alerts.filter(a => a.alertType === 'proactive_velocity');
  const eoqSavingsAlerts = alerts.filter(a => a.alertType === 'optimal_reorder_savings');
  const reorderPointAlerts = alerts.filter(a => a.alertType === 'reorder_point' || a.alertType === 'critical_stockout' || !a.alertType);

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'proactive_velocity') return a.alertType === 'proactive_velocity';
    if (filterType === 'optimal_reorder_savings') return a.alertType === 'optimal_reorder_savings';
    if (filterType === 'reorder_point') return a.alertType === 'reorder_point' || a.alertType === 'critical_stockout' || !a.alertType;
    return true;
  });

  const handleSendWhatsApp = (item: ProductInventoryRecord, prod: ProductData, qty?: number) => {
    const text = createWhatsAppSupplierReorderMessage(item, prod, qty || item.reorderQuantity);
    let clean = item.supplierPhone.replace(/[^0-9]/g, '');
    if (clean.startsWith('01') && clean.length === 11) {
      clean = '2' + clean;
    }
    const url = `https://wa.me/${clean}?text=${text}`;
    safeOpenUrl(url);
    if (onShowToast) {
      onShowToast(`📲 تم تجهيز رسالة أمر التوريد على واتساب للمورد: ${item.supplierName}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div
          id="drawer-proactive-alerts"
          className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-r border-slate-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <Bell className="w-5 h-5 text-sky-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black">مركز التنبيهات الاستباقية للمخزون</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/30 text-sky-200 border border-sky-400/30">
                    {alerts.length} تنبيهات نشطة
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  رصد وتيرة سرعة البيع (Velocity) واقتراح كميات إعادة الطلب المثالية (EOQ) لتقليل تكاليف التخزين
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter Strip & Bulk Actions */}
          <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs font-bold">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                الكل ({alerts.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterType('proactive_velocity')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer border ${
                  filterType === 'proactive_velocity'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-rose-800 hover:bg-rose-50 border-rose-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-500" />
                <span>خطر سرعة البيع ({proactiveVelocityAlerts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('optimal_reorder_savings')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer border ${
                  filterType === 'optimal_reorder_savings'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-sky-800 hover:bg-sky-50 border-sky-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                <span>توفير التخزين EOQ ({eoqSavingsAlerts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('reorder_point')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer border ${
                  filterType === 'reorder_point'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-amber-900 hover:bg-amber-50 border-amber-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>حد الطلب الأدنى ({reorderPointAlerts.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onBatchApplyAllOptimalQty();
                  if (onShowToast) {
                    onShowToast('🎯 تم تطبيق كميات إعادة الطلب المثالية لجميع الأصناف لتقليل تكاليف التخزين!');
                  }
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer text-xs"
                title="تطبيق جميع كميات إعادة الطلب المثالية (EOQ) دفعة واحدة لتقليل تكاليف التخزين"
              >
                <Check className="w-3.5 h-3.5" />
                <span>تطبيق كل الكميات المثالية</span>
              </button>

              {onClearAllAlerts && alerts.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAllAlerts}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="تفريغ التنبيهات المقروءة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Alert Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {filteredAlerts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
                <CheckCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2.5" />
                <h4 className="text-sm font-bold text-slate-800">لا توجد تنبيهات استباقية معلقة</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  جميع مستويات المخزون متوازنة مع سرعة البيع وتكلفة التخزين السنوية، ولا توجد مخاطر نفاد وشيكة.
                </p>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const prod = productMap.get(alert.productId);
                const invItem = invMap.get(alert.productId);
                const isProactiveUrgent = alert.alertType === 'proactive_velocity';
                const isEoqSavings = alert.alertType === 'optimal_reorder_savings';
                const isCriticalStockout = alert.alertType === 'critical_stockout';

                return (
                  <div
                    key={alert.id}
                    className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                      isProactiveUrgent
                        ? 'border-rose-300 ring-2 ring-rose-500/10'
                        : isEoqSavings
                        ? 'border-sky-300 bg-sky-50/20'
                        : isCriticalStockout
                        ? 'border-rose-200 bg-rose-50/10'
                        : 'border-amber-200/80 bg-amber-50/20'
                    }`}
                  >
                    {/* Alert Header Row */}
                    <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        {isProactiveUrgent ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
                            <Zap className="w-3.5 h-3.5 text-rose-600" />
                            خطر سرعة بيع متسارعة 🚨
                          </span>
                        ) : isEoqSavings ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                            فرصة توفير تكلفة التخزين (EOQ) 💡
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            بلوغ حد الطلب الأدنى ⚠️
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 font-mono">
                          {alert.triggeredAt}
                        </span>
                      </div>

                      {onDismissAlert && (
                        <button
                          type="button"
                          onClick={() => onDismissAlert(alert.id)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          title="تجاهل التنبيه"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Product & Explanation Body */}
                    <div className="flex items-start gap-3 py-3">
                      <img
                        src={prod?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                        alt={alert.productTitle}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                            {alert.productTitle}
                          </h4>
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                            {alert.sku}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    {/* Proactive Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">الرصيد الفعلي:</div>
                        <div className="font-black text-slate-900 mt-0.5">
                          {alert.currentStock} قطعة
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">سرعة البيع:</div>
                        <div className="font-black text-sky-700 mt-0.5 flex items-center justify-center gap-1">
                          <Zap className="w-3 h-3 text-sky-600" />
                          <span>{alert.dailyVelocity || 1.2} ق/يوم</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">فترة توريد المورد:</div>
                        <div className="font-bold text-slate-800 mt-0.5">
                          {alert.leadTimeDays || invItem?.leadTimeDays || 4} أيام
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-emerald-600 font-bold">كمية الـ EOQ المثالية:</div>
                        <div className="font-black text-emerald-700 mt-0.5">
                          {alert.optimalReorderQty || alert.reorderQuantity} قطعة
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* 1-Click Apply Optimal Quantity Button */}
                        {alert.optimalReorderQty && alert.optimalReorderQty !== alert.reorderQuantity && (
                          <button
                            type="button"
                            onClick={() => {
                              onApplyOptimalQty(alert.productId, alert.optimalReorderQty!);
                              if (onShowToast) {
                                onShowToast(`🎯 تم تطبيق كمية إعادة الطلب المثالية (${alert.optimalReorderQty} قطعة) للصنف ${alert.sku}!`);
                              }
                            }}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تطبيق الكمية المثالية ({alert.optimalReorderQty} ق)</span>
                          </button>
                        )}

                        {/* Issue PO Button */}
                        {invItem && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenPoModal(invItem);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Package className="w-3.5 h-3.5 text-indigo-700" />
                            <span>إصدار أمر توريد</span>
                          </button>
                        )}

                        {/* Send via WhatsApp Button */}
                        {invItem && prod && (
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(invItem, prod, alert.optimalReorderQty)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="إرسال أمر التوريد عبر واتساب للمورد"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>واتساب المورد</span>
                          </button>
                        )}
                      </div>

                      {/* Stock Transfer between warehouses button */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenTransferModal(alert.productId);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="تحويل ومناقلة بضاعة من مخزن فرعي آخر"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
                        <span>مناقلة من مخزن آخر</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
