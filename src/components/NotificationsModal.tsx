import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  Trash2,
  Scissors,
  X,
  Clock,
} from 'lucide-react';
import { multiTenantDb, AppNotification } from '../lib/supabase';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSplit?: (invoiceId?: string) => void;
  onShowToast?: (msg: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSplit,
  onShowToast,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = async () => {
    try {
      const list = await multiTenantDb.getNotifications();
      setNotifications(list || []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('radar_notifications_updated', handleUpdate);
    return () => window.removeEventListener('radar_notifications_updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.is_read) {
        await multiTenantDb.markNotificationRead(n.id);
      }
    }
    await loadNotifications();
    window.dispatchEvent(new CustomEvent('radar_notifications_updated'));
    onShowToast?.('تم تمييز كافة التنبيهات كمقروءة');
  };

  const handleClearAll = async () => {
    await multiTenantDb.clearAllNotifications();
    setNotifications([]);
    window.dispatchEvent(new CustomEvent('radar_notifications_updated'));
    onShowToast?.('تم مسح قائمة التنبيهات');
  };

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-['Cairo']"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-5 text-right space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">التنبيهات الذكية</h3>
              <p className="text-[11px] text-slate-400">تنبيهات الأسعار والمخزون والفواتير</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-sky-400 hover:underline font-bold cursor-pointer"
              >
                قراءة الكل
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="مسح الكل"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto" />
              <p className="font-bold text-slate-300">لا توجد تنبيهات جديدة حالياً</p>
              <p className="text-[11px] text-slate-500">
                سيتم إشعارك فور تغير أسعار المنافسين أو نفاذ المخزون
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isOutOfStock = notif.type === 'out_of_stock';
              const isNewInvoice = notif.type === 'new_invoice';
              const isPriceAlert = notif.type === 'price_alert';

              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl border transition-colors ${
                    !notif.is_read
                      ? isPriceAlert
                        ? 'bg-indigo-950/60 border-indigo-400/50'
                        : 'bg-slate-950 border-amber-500/40'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isOutOfStock
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                          : isNewInvoice
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : isPriceAlert
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}
                    >
                      {isOutOfStock ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isNewInvoice ? (
                        <FileText className="w-4 h-4" />
                      ) : isPriceAlert ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-slate-100 leading-snug">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.created_at).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {isNewInvoice && onNavigateToSplit && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigateToSplit();
                            }}
                            className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                          >
                            <Scissors className="w-3 h-3" />
                            <span>تقسيم الفاتورة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
