import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import {
  X,
  Plus,
  Clock,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  Store,
  Tag,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Zap,
  BarChart2,
  ListOrdered
} from 'lucide-react';
import { ProductData, PricePoint } from '../types';

interface ProductPriceHistoryLoggerModalProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
  onUpdateProduct?: (updatedProduct: ProductData) => void;
  onShowToast?: (msg: string) => void;
}

export interface LoggedPriceChangeRecord {
  id: string;
  date: string;
  timestamp: number;
  price: number;
  previousPrice?: number;
  changeAmount?: number;
  changePercent?: number;
  merchant: string;
  reason?: string;
  notes?: string;
}

export const ProductPriceHistoryLoggerModal: React.FC<ProductPriceHistoryLoggerModalProps> = ({
  product,
  isOpen,
  onClose,
  currency = 'EGP',
  onUpdateProduct,
  onShowToast
}) => {
  if (!isOpen || !product) return null;

  // Local state for active view tab (chart vs log table vs add entry)
  const [activeTab, setActiveTab] = useState<'chart' | 'log_table' | 'add_log'>('chart');

  // Time range filter
  const [timeFilter, setTimeFilter] = useState<'14d' | '30d' | '60d' | 'all'>('30d');

  // New price log entry form
  const [newPrice, setNewPrice] = useState<number>(() => product.currentLowestPrice || 1000);
  const [newMerchant, setNewMerchant] = useState<string>('أمازون مصر');
  const [newDate, setNewDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newReason, setNewReason] = useState<string>('تخفيض تنافسي للـ Buy Box');
  const [newNotes, setNewNotes] = useState<string>('');
  const [applyAsCurrentPrice, setApplyAsCurrentPrice] = useState<boolean>(true);

  // Local log records derived from product.priceHistory or initialized
  const [loggedRecords, setLoggedRecords] = useState<LoggedPriceChangeRecord[]>(() => {
    const raw = product.priceHistory || [];
    if (raw.length === 0) {
      // Build realistic default history
      const now = new Date();
      const basePrice = product.currentLowestPrice || 3500;
      return [
        {
          id: 'rec-1',
          date: new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0],
          timestamp: now.getTime() - 30 * 86400000,
          price: Math.round(basePrice * 1.08),
          previousPrice: Math.round(basePrice * 1.10),
          changeAmount: -Math.round(basePrice * 0.02),
          changePercent: -1.8,
          merchant: 'أمازون مصر',
          reason: 'تحديث الأسعار الدورية',
          notes: 'استقرار سعر الشحن'
        },
        {
          id: 'rec-2',
          date: new Date(now.getTime() - 15 * 86400000).toISOString().split('T')[0],
          timestamp: now.getTime() - 15 * 86400000,
          price: Math.round(basePrice * 1.04),
          previousPrice: Math.round(basePrice * 1.08),
          changeAmount: -Math.round(basePrice * 0.04),
          changePercent: -3.7,
          merchant: 'نون مصر',
          reason: 'عروض منتصف الشهر',
          notes: 'خصم مباشر مع كود خصم'
        },
        {
          id: 'rec-3',
          date: new Date(now.getTime() - 3 * 86400000).toISOString().split('T')[0],
          timestamp: now.getTime() - 3 * 86400000,
          price: basePrice,
          previousPrice: Math.round(basePrice * 1.04),
          changeAmount: -Math.round(basePrice * 0.04),
          changePercent: -3.8,
          merchant: 'أمازون مصر',
          reason: 'تخفيض آلي للرادار',
          notes: 'تعديل السعر للفوز بالـ Buy Box'
        }
      ];
    }

    return raw.map((item, idx) => {
      const prev = idx > 0 ? raw[idx - 1].price : item.price;
      const diff = item.price - prev;
      const pct = prev > 0 ? Math.round((diff / prev) * 1000) / 10 : 0;
      return {
        id: `rec-${idx}-${Date.now()}`,
        date: item.date || new Date().toISOString().split('T')[0],
        timestamp: new Date(item.date || Date.now()).getTime(),
        price: item.price,
        previousPrice: prev,
        changeAmount: diff,
        changePercent: pct,
        merchant: item.merchant || 'أمازون مصر',
        reason: (item as any).reason || 'رصد آلي',
        notes: (item as any).notes || ''
      };
    });
  });

  // Filtered log records
  const filteredRecords = useMemo(() => {
    let sorted = [...loggedRecords].sort((a, b) => b.timestamp - a.timestamp);
    if (timeFilter === 'all') return sorted;
    const days = timeFilter === '14d' ? 14 : timeFilter === '30d' ? 30 : 60;
    const cutoff = Date.now() - days * 86400000;
    return sorted.filter(r => r.timestamp >= cutoff);
  }, [loggedRecords, timeFilter]);

  // Recharts timeline series data
  const chartTimelineData = useMemo(() => {
    let sorted = [...loggedRecords].sort((a, b) => a.timestamp - b.timestamp);
    return sorted.map(r => ({
      dateLabel: new Date(r.timestamp).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
      date: r.date,
      price: r.price,
      merchant: r.merchant,
      reason: r.reason,
      changePercent: r.changePercent
    }));
  }, [loggedRecords]);

  // Key pricing statistics
  const stats = useMemo(() => {
    if (loggedRecords.length === 0) {
      return {
        lowest: product.currentLowestPrice || 0,
        highest: product.highestPrice || 0,
        avg: product.averagePrice || 0,
        totalLogs: 0,
        lastChangePct: 0
      };
    }
    const prices = loggedRecords.map(r => r.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const avgP = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const lastRec = loggedRecords[loggedRecords.length - 1];

    return {
      lowest: minP,
      highest: maxP,
      avg: avgP,
      totalLogs: loggedRecords.length,
      lastChangePct: lastRec?.changePercent || 0
    };
  }, [loggedRecords, product]);

  // Handle submit new price log
  const handleAddPriceLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice || newPrice <= 0) {
      if (onShowToast) onShowToast('يرجى إدخال سعر صحيح أكبر من الصفر');
      return;
    }

    const prevP = product.currentLowestPrice || newPrice;
    const diff = newPrice - prevP;
    const pct = prevP > 0 ? Math.round((diff / prevP) * 1000) / 10 : 0;
    const logTimestamp = new Date(newDate).getTime() || Date.now();

    const newRecord: LoggedPriceChangeRecord = {
      id: `rec-${Date.now()}`,
      date: newDate,
      timestamp: logTimestamp,
      price: Number(newPrice),
      previousPrice: prevP,
      changeAmount: diff,
      changePercent: pct,
      merchant: newMerchant,
      reason: newReason,
      notes: newNotes
    };

    const updatedRecords = [newRecord, ...loggedRecords];
    setLoggedRecords(updatedRecords);

    // Update parent product state
    const newPriceHistoryPoints: PricePoint[] = updatedRecords.map(r => ({
      date: r.date,
      price: r.price,
      merchant: r.merchant,
      reason: r.reason
    }));

    const updatedProduct: ProductData = {
      ...product,
      currentLowestPrice: applyAsCurrentPrice ? Number(newPrice) : product.currentLowestPrice,
      priceHistory: newPriceHistoryPoints
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }

    if (onShowToast) {
      onShowToast(`تم تسجيل تغير السعر بنجاح: ${Number(newPrice).toLocaleString()} ${currency} (${newMerchant}) 📈`);
    }

    setActiveTab('chart');
  };

  // Export logs to CSV
  const handleExportLogsCSV = () => {
    try {
      const headers = ['التاريخ', 'المنصة/المتجر', 'السعر الجديد (EGP)', 'السعر السابق (EGP)', 'مقدار التغير', 'نسبة التغير (%)', 'سبب التغير', 'ملاحظات'];
      const rows = filteredRecords.map(r => [
        r.date,
        `"${r.merchant}"`,
        r.price,
        r.previousPrice || '',
        r.changeAmount || 0,
        `${r.changePercent || 0}%`,
        `"${r.reason || ''}"`,
        `"${r.notes || ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `price-change-history-${product.sku || product.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) onShowToast('تم تصدير سجل تغيرات الأسعار إلى CSV بنجاح 📊');
    } catch {
      if (onShowToast) onShowToast('حدث خطأ أثناء تصدير السجل');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 text-right font-['Alexandria'] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full">
                  محرك رادار الأسعار (Radar Price Logger)
                </span>
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku || product.id}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                سجل وتتبع تغيرات أسعار: {product.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">أدنى سعر مسجل</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.lowest.toLocaleString()} <span className="text-xs font-normal">{currency}</span>
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">أعلى سعر مسجل</span>
            <span className="text-base font-black text-sky-600 dark:text-sky-400 font-mono">
              {stats.highest.toLocaleString()} <span className="text-xs font-normal">{currency}</span>
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">إجمالي السجلات</span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {stats.totalLogs} <span className="text-xs font-normal">عملية رصد</span>
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">تكلفة الجملة المقدرة</span>
            <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono">
              {(product.estimatedWholesaleCost || 0).toLocaleString()} <span className="text-xs font-normal">{currency}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>الرسم البياني 📈</span>
            </button>

            <button
              onClick={() => setActiveTab('log_table')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'log_table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>جدول السجل التفصيلي 📋</span>
            </button>

            <button
              onClick={() => setActiveTab('add_log')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'add_log'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل تغيير سعر جديد ✍️</span>
            </button>
          </div>

          <button
            onClick={handleExportLogsCSV}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>تصدير CSV</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: RECHARTS LINE CHART */}
          {activeTab === 'chart' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>مسار تغيرات سعر المنتج عبر الزمن (Trend Line)</span>
                </h4>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 ml-1">الفترة:</span>
                  {(['14d', '30d', '60d', 'all'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        timeFilter === f
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {f === '14d' ? '14 يوم' : f === '30d' ? '30 يوم' : f === '60d' ? '60 يوم' : 'الكل'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recharts Area */}
              <div className="h-72 sm:h-80 w-full min-w-0 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700" dir="ltr">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                  <LineChart data={chartTimelineData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      tickFormatter={(v) => `${Number(v).toLocaleString()}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0]?.payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-right text-xs font-['Alexandria']" dir="rtl">
                              <div className="font-bold text-indigo-300 border-b border-slate-800 pb-1 mb-1.5">{label} - {dataPoint?.merchant}</div>
                              <div className="font-mono font-bold text-emerald-400 text-sm">
                                {dataPoint?.price?.toLocaleString()} {currency}
                              </div>
                              {dataPoint?.reason && (
                                <div className="text-[10px] text-slate-300 mt-1">السبب: {dataPoint.reason}</div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      formatter={(val) => val === 'price' ? 'سعر البيع المرصود' : val}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                      name="price"
                    />

                    {product.estimatedWholesaleCost && (
                      <ReferenceLine
                        y={product.estimatedWholesaleCost}
                        stroke="#10B981"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        label={{
                          value: `سعر الجملة (${product.estimatedWholesaleCost.toLocaleString()} ${currency})`,
                          fill: '#059669',
                          fontSize: 10,
                          position: 'insideBottomRight'
                        }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED LOG TABLE */}
          {activeTab === 'log_table' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  جدول العمليات الكامل لتغيرات الأسعار ({filteredRecords.length} سجل)
                </h4>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">المنصة/المتجر</th>
                      <th className="p-3">السعر الجديد</th>
                      <th className="p-3">السعر السابق</th>
                      <th className="p-3">التغير</th>
                      <th className="p-3">السبب / الملاحظة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRecords.map((r) => {
                      const isDrop = (r.changeAmount || 0) < 0;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{r.date}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{r.merchant}</span>
                          </td>
                          <td className="p-3 font-mono font-black text-slate-900 dark:text-white">
                            {r.price.toLocaleString()} {currency}
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {r.previousPrice ? `${r.previousPrice.toLocaleString()} ${currency}` : '-'}
                          </td>
                          <td className="p-3 font-mono font-bold">
                            {isDrop ? (
                              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800">
                                <ArrowDownRight className="w-3 h-3" />
                                {r.changeAmount?.toLocaleString()} ({r.changePercent}%)
                              </span>
                            ) : (r.changeAmount || 0) > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-200/60 dark:border-rose-800">
                                <ArrowUpRight className="w-3 h-3" />
                                +{r.changeAmount?.toLocaleString()} (+{r.changePercent}%)
                              </span>
                            ) : (
                              <span className="text-slate-400">بدون تغير</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            <span className="font-semibold block">{r.reason}</span>
                            {r.notes && <span className="text-[10px] text-slate-400 block">{r.notes}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW PRICE LOG FORM */}
          {activeTab === 'add_log' && (
            <form onSubmit={handleAddPriceLog} className="space-y-4 max-w-xl mx-auto bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">تسجيل تغيير سعر جديد للمنتج</h4>
                <p className="text-xs text-slate-500">سجل التغير اللحظي لتحديث مؤشرات الأداء والرسم البياني في الرادار</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">السعر الجديد ({currency}) *</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المنصة / البائع *</label>
                  <select
                    value={newMerchant}
                    onChange={(e) => setNewMerchant(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="أمازون مصر">أمازون مصر (Amazon Egypt)</option>
                    <option value="نون مصر">نون مصر (Noon Egypt)</option>
                    <option value="جوميا مصر">جوميا مصر (Jumia)</option>
                    <option value="بي تك">بي تك (B.TECH)</option>
                    <option value="متجرك الرئيسي">متجرك الرئيسي (الموقع الخاص)</option>
                    <option value="مورد جملة">مورد جملة / عبد العزيز</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الرصد *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سبب التغير / الفئة</label>
                  <select
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="تخفيض تنافسي للـ Buy Box">تخفيض تنافسي للـ Buy Box</option>
                    <option value="فلاش سيل وموسم عروض">فلاش سيل وموسم عروض</option>
                    <option value="تغير سعر التكلفة من المورد">تغير سعر التكلفة من المورد</option>
                    <option value="تعديل يدوياً من التاجر">تعديل يدوياً من التاجر</option>
                    <option value="استجابة لتغير سعر المنافس">استجابة لتغير سعر المنافس</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="مثال: خصم إضافي مع كوبون البنك الأهلي"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900">
                <input
                  type="checkbox"
                  id="applyAsCurrent"
                  checked={applyAsCurrentPrice}
                  onChange={(e) => setApplyAsCurrentPrice(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="applyAsCurrent" className="text-xs font-bold text-indigo-900 dark:text-indigo-200 cursor-pointer">
                  اعتماد {newPrice ? newPrice.toLocaleString() : 0} {currency} كسعر المنتج الحالي في الرادار فوراً
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ التغير وتحديث المحرك ✓</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
