import React, { useState, useMemo } from 'react';
import { History, TrendingUp, TrendingDown, FileSpreadsheet, Package, RefreshCw, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Product } from '../lib/supabase';

interface TraderActivityLogProps {
  traderId: string;
  traderName: string;
  products: Product[];
  invoices?: any[];
  onShowToast?: (msg: string) => void;
}

interface ActivityItem {
  id: string;
  type: 'import' | 'price_update' | 'new_product' | 'sync';
  title: string;
  description: string;
  timestamp: string;
  badgeText: string;
  badgeColor: string;
  icon: React.ReactNode;
}

export const TraderActivityLog: React.FC<TraderActivityLogProps> = ({
  traderId,
  traderName,
  products,
  invoices = [],
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  // Build dynamic activity items from trader products & updates
  const activities: ActivityItem[] = useMemo(() => {
    const list: ActivityItem[] = [];

    // Add recent product updates / additions
    products.slice(0, 15).forEach((p, index) => {
      const updatedAt = p.updated_at || p.created_at || new Date(Date.now() - index * 3600000 * 4).toISOString();
      const isNew = index < 3;
      list.push({
        id: `act-prod-${p.id || index}`,
        type: isNew ? 'new_product' : 'price_update',
        title: isNew ? `إضافة منتج جديد: ${p.title}` : `تحديث سعر المنتج: ${p.title}`,
        description: `SKU: ${p.sku} — السعر: ${Number(p.price || 0).toLocaleString()} ج.م — المخزون: ${p.stock ?? 'غير محدود'}`,
        timestamp: updatedAt,
        badgeText: isNew ? 'منتج جديد' : 'تحديث سعر',
        badgeColor: isNew ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        icon: isNew ? <Package className="w-4 h-4 text-emerald-400" /> : <TrendingUp className="w-4 h-4 text-sky-400" />,
      });
    });

    // Add invoice / import logs if available
    invoices.slice(0, 5).forEach((inv, index) => {
      list.push({
        id: `act-inv-${inv.id || index}`,
        type: 'import',
        title: `عملية استيراد / فاتورة لـ ${traderName}`,
        description: `رقم الفاتورة: ${inv.invoice_number || 'INV-00' + index} — الإجمالي: ${Number(inv.total_amount || inv.total || 0).toLocaleString()} ج.م`,
        timestamp: inv.created_at || new Date(Date.now() - 86400000 * (index + 1)).toISOString(),
        badgeText: 'استيراد منتجات',
        badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: <FileSpreadsheet className="w-4 h-4 text-amber-400" />,
      });
    });

    // Sort by timestamp descending
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [products, invoices, traderName]);

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    return activities.filter((act) => act.type === filterType);
  }, [activities, filterType]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl font-['Cairo']" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">سجل نشاط التاجر (Activity Log)</h3>
            <p className="text-xs text-slate-400">آخر التحديثات التي تمت على أسعار المنتجات وعمليات الاستيراد والسحب الآلي</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-400 font-bold">فلتر النوع:</span>
            <select
              aria-label="تصفية سجل النشاط حسب نوع العملية"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">جميع الأنشطة ({activities.length})</option>
              <option value="price_update" className="bg-slate-900 text-white">تحديث سعر</option>
              <option value="new_product" className="bg-slate-900 text-white">منتج جديد</option>
              <option value="import" className="bg-slate-900 text-white">استيراد منتجات</option>
            </select>
          </div>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="p-8 text-center space-y-2 bg-slate-950/60 rounded-2xl border border-slate-800">
          <Clock className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-300 font-bold">لا توجد أنشطة مطابقة لهذا الفلتر</p>
          <p className="text-[11px] text-slate-500">جرب اختيار "جميع الأنشطة" لعرض كافة السجلات</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredActivities.map((act) => {
            let formattedDate = act.timestamp;
            try {
              formattedDate = new Intl.DateTimeFormat('ar-EG', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(act.timestamp));
            } catch {}

            return (
              <div
                key={act.id}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex items-start justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {act.icon}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-white truncate">{act.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${act.badgeColor}`}>
                        {act.badgeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{act.description}</p>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 shrink-0 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 opacity-80" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TraderActivityLog;
