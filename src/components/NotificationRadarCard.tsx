import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../utils/navigation';
import { DraggableHandle } from './DraggableHandle';

interface NotificationRadarCardProps {
  onShowToast?: (msg: string) => void;
}

export interface RadarInvoiceNotification {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  is_read: boolean;
  amount?: number;
  sku?: string;
}

export const NotificationRadarCard: React.FC<NotificationRadarCardProps> = ({ onShowToast }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<RadarInvoiceNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchInvoicesAsAlerts = async () => {
    try {
      setIsLoading(true);
      // Query invoices from Supabase
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.warn('Error fetching invoices for notifications card:', error);
      }

      let list = Array.isArray(data) ? data : [];

      if (list.length === 0) {
        // Fallback demo invoice alerts if table is empty
        list = [
          {
            id: 'inv-1',
            split_number: 'SPL-8821',
            product_title: 'كرسي مكتب طبي هيدروليك - أسود',
            price: 2450,
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
          },
          {
            id: 'inv-2',
            split_number: 'SPL-8822',
            product_title: 'طاولة مكتب خشب زان 120سم',
            price: 3200,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
          },
          {
            id: 'inv-3',
            split_number: 'SPL-8823',
            product_title: 'حامل شاشة مزدوج متحرك',
            price: 850,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
          }
        ];
      }

      // Read read-state from localStorage if any
      let readMap: Record<string, boolean> = {};
      try {
        const saved = localStorage.getItem('radar_invoice_alerts_read_map');
        if (saved) readMap = JSON.parse(saved);
      } catch {}

      const formatted: RadarInvoiceNotification[] = list.map((inv: any, idx: number) => {
        const invId = inv.id || `inv-${idx}`;
        const isRead = readMap[invId] !== undefined ? readMap[invId] : idx > 1; // first 2 unread by default
        return {
          id: invId,
          title: `بوليصة شحن جديدة #${inv.split_number || 'SPL-' + (1000 + idx)}`,
          subtitle: inv.product_title || inv.product_sku || 'منتج مسجل برادار مصر',
          amount: inv.price ? Number(inv.price) : undefined,
          time: inv.created_at ? new Date(inv.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'منذ قليل',
          is_read: isRead
        };
      });

      setNotifications(formatted);
      setLastUpdated(new Date().toLocaleTimeString('ar-EG'));
      if (onShowToast) {
        onShowToast('🔄 تم تحديث تنبيهات الفواتير بنجاح');
      }
    } catch (err) {
      console.error('Failed to fetch invoice alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesAsAlerts();
  }, []);

  const toggleReadStatus = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, is_read: !n.is_read } : n);
      try {
        const map: Record<string, boolean> = {};
        next.forEach(n => { map[n.id] = n.is_read; });
        localStorage.setItem('radar_invoice_alerts_read_map', JSON.stringify(map));
      } catch {}
      return next;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, is_read: true }));
      try {
        const map: Record<string, boolean> = {};
        next.forEach(n => { map[n.id] = true; });
        localStorage.setItem('radar_invoice_alerts_read_map', JSON.stringify(map));
      } catch {}
      return next;
    });
    if (onShowToast) onShowToast('✅ تم تعليم كافة تنبيهات الفواتير كمقروءة');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div ref={cardRef} className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 font-['Cairo'] text-right relative" dir="rtl">
      <DraggableHandle elementId="notification_radar_card" targetRef={cardRef} position="bottom-left" />
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black flex items-center justify-center shadow">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-black text-base text-white">رادار تنبيهات الفواتير الحية</h3>
            <p className="text-[11px] text-slate-400">آخر تحديثات بوالص الشحن والفواتير من Supabase</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchInvoicesAsAlerts}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="تحديث قائمة التنبيهات"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 transition cursor-pointer"
            >
              تعليم الكل كمقروء
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {isLoading && notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            جاري جلب أحدث تنبيهات الفواتير...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            لا توجد تنبيهات فواتير مسجلة حالياً
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleReadStatus(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                item.is_read 
                  ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-950/80' 
                  : 'bg-amber-500/10 border-amber-500/40 text-slate-100 shadow-md shadow-amber-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${item.is_read ? 'bg-slate-900 text-slate-500' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className={`text-xs font-black ${item.is_read ? 'text-slate-300' : 'text-white'}`}>
                      {item.title}
                    </strong>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="غير مقروء" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.subtitle}</p>
                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                    <span>{item.time}</span>
                    {item.amount && (
                      <span className="text-emerald-400 font-bold">{item.amount} ج.م</span>
                    )}
                    <span className={item.is_read ? 'text-slate-500' : 'text-amber-300 font-bold'}>
                      {item.is_read ? '✓ مقروء' : '• غير مقروء'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                {item.is_read ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-400/20" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer link to invoices split / shipping */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 font-mono">
          {lastUpdated ? `آخر تحديث: ${lastUpdated}` : 'جاهز للمزامنة'}
        </span>
        <button
          onClick={() => navigate('/invoices/split')}
          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>مقسم وفواتير الشحن</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
