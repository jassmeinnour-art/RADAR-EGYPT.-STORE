import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  Trash2,
  ExternalLink,
  Scissors,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { multiTenantDb, AppNotification } from '../lib/supabase';

interface NotificationsDropdownProps {
  onNavigateToSplit?: (invoiceId?: string) => void;
  onNavigateToTrader?: (traderId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  onNavigateToSplit,
  onNavigateToTrader,
  onShowToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const list = await multiTenantDb.getNotifications();
      // If empty on first load, seed with standard smart alerts
      if (list.length === 0) {
        const seeded: AppNotification[] = [
          {
            id: 'notif-seed-1',
            type: 'out_of_stock',
            message: 'منتج (كابل شحن سريع Type-C مجدول 1.8م) نفذ مخزونه في متجر أمازون مصر لتاجر محمود سعيد',
            severity: 'high',
            is_read: false,
            created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          },
          {
            id: 'notif-seed-2',
            type: 'new_invoice',
            message: 'وصلت فاتورة جديدة #INV-AMZ-2026-9041 من Amazon لتاجر محمود سعيد (5 منتجات)',
            severity: 'normal',
            is_read: false,
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          },
          {
            id: 'notif-seed-3',
            type: 'low_stock',
            message: 'تنبيه الكرون: مخزون (شاحن Anker 65W GaN) منخفض جداً (متبقي 2 قطع فقط في نون)',
            severity: 'high',
            is_read: true,
            created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString()
          }
        ];
        localStorage.setItem('radar_notifications', JSON.stringify(seeded));
        setNotifications(seeded);
      } else {
        setNotifications(list);
      }
    } catch (err) {
      console.warn('Error loading notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('radar_notifications_updated', handleUpdate);
    return () => window.removeEventListener('radar_notifications_updated', handleUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.is_read) {
        await multiTenantDb.markNotificationRead(n.id);
      }
    }
    await loadNotifications();
    if (onShowToast) onShowToast('✓ تم تمييز كافة التنبيهات كمقروءة');
  };

  const handleClearAll = async () => {
    await multiTenantDb.clearAllNotifications();
    setNotifications([]);
    if (onShowToast) onShowToast('🗑️ تم مسح قائمة التنبيهات');
  };

  return (
    <div className="relative font-['Cairo']" ref={dropdownRef} dir="rtl">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
        title="التنبيهات الذكية (المخزون والفواتير)"
      >
        <Bell className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">التنبيهات 🔔</span>
        {unreadCount > 0 && (
          <span className="min-w-[18px] h-4 px-1 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl p-4 z-50 text-right space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">التنبيهات الذكية</h4>
                <p className="text-[10px] text-slate-400">تحديثات الكرون التلقائي والمخزون والفواتير</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-sky-400 hover:underline font-bold"
                >
                  قراءة الكل
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                  title="مسح الكل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto" />
                <p>لا توجد تنبيهات جديدة حالياً</p>
                <p className="text-[10px] text-slate-600">سيتم إشعارك فور وصول فواتير أو نفاذ مخزون منتجاتك</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isOutOfStock = notif.type === 'out_of_stock';
                const isNewInvoice = notif.type === 'new_invoice';

                return (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      !notif.is_read
                        ? 'bg-slate-950 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isOutOfStock 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : isNewInvoice 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {isOutOfStock ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : isNewInvoice ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-slate-200 leading-snug">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {isNewInvoice && onNavigateToSplit && (
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                onNavigateToSplit();
                              }}
                              className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold transition flex items-center gap-1 text-[10px]"
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
      )}
    </div>
  );
};
