import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  History,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, Trader } from '../lib/supabase';
import { useMaintenanceMode, MAINTENANCE_MODE_BLOCK_MESSAGE } from '../utils/maintenanceMode';
import { navigate } from '../utils/navigation';
import {
  computeImportSuccessRatio,
  formatFileSizeLabel,
  formatImportFileTypeLabel,
  getImportHistoryEntries,
  ImportHistoryEntry,
  RADAR_IMPORT_HISTORY_UPDATED_EVENT,
  rollbackImportOperation,
  syncImportHistoryFromFirestoreIfEmpty,
} from '../utils/importHistoryService';

interface ImportHistoryPageProps {
  onShowToast?: (message: string) => void;
}

type StatusFilter = 'all' | 'completed' | 'rolled_back';

function formatArabicDateTime(iso?: string): string {
  if (!iso) return '—';
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return '—';
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(parsed));
  } catch {
    return iso;
  }
}

export const ImportHistoryPage: React.FC<ImportHistoryPageProps> = ({ onShowToast }) => {
  const { user, profile } = useAuth();
  const { isMaintenanceMode } = useMaintenanceMode();
  const userEmail = (user?.email || profile?.email || '').trim().toLowerCase();

  const [entries, setEntries] = useState<ImportHistoryEntry[]>(() => getImportHistoryEntries());
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTraderFilter, setSelectedTraderFilter] = useState<string>('all');

  const [selectedEntry, setSelectedEntry] = useState<ImportHistoryEntry | null>(null);
  const [detailSearch, setDetailSearch] = useState<string>('');
  const [confirmRollbackEntry, setConfirmRollbackEntry] = useState<ImportHistoryEntry | null>(null);
  const [isRollingBackId, setIsRollingBackId] = useState<string | null>(null);

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reloadHistory = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const localEntries = getImportHistoryEntries();
      setEntries(localEntries);
      if (localEntries.length === 0) {
        const synced = await syncImportHistoryFromFirestoreIfEmpty();
        setEntries(synced);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    reloadHistory();

    const handleUpdated = () => {
      const latest = getImportHistoryEntries();
      setEntries(latest);
      setSelectedEntry((prev) => (prev ? latest.find((e) => e.id === prev.id) || prev : null));
    };

    window.addEventListener(RADAR_IMPORT_HISTORY_UPDATED_EVENT, handleUpdated);
    return () => {
      window.removeEventListener(RADAR_IMPORT_HISTORY_UPDATED_EVENT, handleUpdated);
    };
  }, [reloadHistory]);

  useEffect(() => {
    if (!userEmail) return;
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('traders')
          .select('id, seller_name, seller_id, platform')
          .order('created_at', { ascending: false });
        if (active && Array.isArray(data)) {
          setTraders(data as Trader[]);
        }
      } catch {
        // Non-blocking trader name lookup
      }
    })();
    return () => {
      active = false;
    };
  }, [userEmail]);

  useEffect(() => {
    if (!selectedEntry && !confirmRollbackEntry) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmRollbackEntry && !isRollingBackId) {
          setConfirmRollbackEntry(null);
        } else if (selectedEntry) {
          setSelectedEntry(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedEntry, confirmRollbackEntry, isRollingBackId]);

  const traderNameById = useMemo(() => {
    const map = new Map<string, string>();
    traders.forEach((t) => {
      if (t.id && t.seller_name) {
        map.set(t.id, t.seller_name);
      }
      if (t.seller_id && t.seller_name) {
        map.set(t.seller_id, t.seller_name);
      }
    });
    return map;
  }, [traders]);

  const availableTraderFilters = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((entry) => {
      const label =
        entry.traderName || traderNameById.get(entry.traderId) || entry.traderId;
      map.set(entry.traderId, label);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [entries, traderNameById]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      if (selectedTraderFilter !== 'all' && entry.traderId !== selectedTraderFilter) return false;
      if (!q) return true;

      const traderLabel = (
        entry.traderName ||
        traderNameById.get(entry.traderId) ||
        entry.traderId
      ).toLowerCase();

      const matchesMeta =
        entry.fileName.toLowerCase().includes(q) ||
        entry.traderId.toLowerCase().includes(q) ||
        traderLabel.includes(q) ||
        entry.platform.toLowerCase().includes(q) ||
        entry.summaryMessage.toLowerCase().includes(q);

      if (matchesMeta) return true;

      return entry.itemsPreview.some(
        (item) =>
          item.sku.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          (item.asin && item.asin.toLowerCase().includes(q))
      );
    });
  }, [entries, searchQuery, statusFilter, selectedTraderFilter, traderNameById]);

  const summaryStats = useMemo(() => {
    const totalOperations = entries.length;
    const activeOperations = entries.filter((e) => e.status === 'completed').length;
    const rolledBackOperations = entries.filter((e) => e.status === 'rolled_back').length;
    const totalNewAdded = entries
      .filter((e) => e.status === 'completed')
      .reduce((acc, e) => acc + (e.newCount || 0), 0);
    return {
      totalOperations,
      activeOperations,
      rolledBackOperations,
      totalNewAdded,
    };
  }, [entries]);

  const ratioMetrics = useMemo(() => {
    const scope = filteredEntries.length > 0 || searchQuery || statusFilter !== 'all' || selectedTraderFilter !== 'all'
      ? filteredEntries
      : entries;
    return computeImportSuccessRatio(scope);
  }, [entries, filteredEntries, searchQuery, statusFilter, selectedTraderFilter]);

  const chartOperations = useMemo(() => {
    return filteredEntries.slice(0, 6).map((entry) => {
      const ok = Math.max(0, Number(entry.totalRead) || 0);
      const fail = Math.max(
        0,
        typeof entry.failedCount === 'number'
          ? entry.failedCount
          : Number(entry.skippedCount) || 0
      );
      const total = ok + fail;
      const okPct = total > 0 ? Math.round((ok / total) * 1000) / 10 : 0;
      const failPct = total > 0 ? Math.round((100 - okPct) * 10) / 10 : 0;
      return {
        entry,
        ok,
        fail,
        total,
        okPct,
        failPct,
      };
    });
  }, [filteredEntries]);

  const filteredDetailItems = useMemo(() => {
    if (!selectedEntry) return [];
    const q = detailSearch.trim().toLowerCase();
    if (!q) return selectedEntry.itemsPreview;
    return selectedEntry.itemsPreview.filter(
      (item) =>
        item.sku.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.asin && item.asin.toLowerCase().includes(q))
    );
  }, [selectedEntry, detailSearch]);

  const handleConfirmRollback = async () => {
    if (!confirmRollbackEntry) return;
    if (isMaintenanceMode) {
      setActionError(MAINTENANCE_MODE_BLOCK_MESSAGE);
      onShowToast?.(MAINTENANCE_MODE_BLOCK_MESSAGE);
      setConfirmRollbackEntry(null);
      return;
    }

    setIsRollingBackId(confirmRollbackEntry.id);
    setActionError(null);
    setActionFeedback(null);

    try {
      const result = await rollbackImportOperation(confirmRollbackEntry.id);
      if (!result.success) {
        setActionError(result.message);
        onShowToast?.(result.message);
        return;
      }

      const latest = getImportHistoryEntries();
      setEntries(latest);
      if (result.entry && selectedEntry?.id === result.entry.id) {
        setSelectedEntry(result.entry);
      }
      setActionFeedback(result.message);
      onShowToast?.(result.message);
      setConfirmRollbackEntry(null);
    } catch (err: any) {
      const msg = err?.message || 'حدث خطأ أثناء التراجع عن عملية الاستيراد';
      setActionError(msg);
      onShowToast?.(msg);
    } finally {
      setIsRollingBackId(null);
    }
  };

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/80 p-5 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-white truncate">
              سجل عمليات الاستيراد
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              مراجعة تفاصيل ملفات أمازون المرفوعة مسبقاً وإمكانية التراجع عن أي عملية تمت بالخطأ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={reloadHistory}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث السجل</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>استيراد ملف منتجات</span>
          </button>
        </div>
      </div>

      {/* 4-Column Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-slate-400">إجمالي العمليات المسجلة</div>
          <div className="text-2xl font-black text-white mt-1 tabular-nums">
            {summaryStats.totalOperations}
          </div>
        </div>

        <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-emerald-400">عمليات نشطة (قابلة للتراجع)</div>
          <div className="text-2xl font-black text-emerald-300 mt-1 tabular-nums">
            {summaryStats.activeOperations}
          </div>
        </div>

        <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-sky-400">منتجات مضافة نشطة</div>
          <div className="text-2xl font-black text-sky-300 mt-1 tabular-nums">
            {summaryStats.totalNewAdded}
          </div>
        </div>

        <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-amber-400">عمليات تم التراجع عنها</div>
          <div className="text-2xl font-black text-amber-300 mt-1 tabular-nums">
            {summaryStats.rolledBackOperations}
          </div>
        </div>
      </div>

      {/* Visual Representation: Imported Successfully vs Failed Due to Data Errors */}
      {entries.length > 0 && (
        <section
          aria-label="نسبة المنتجات المستوردة بنجاح مقابل الفشل بسبب أخطاء البيانات"
          data-testid="import-success-ratio-chart"
          className="bg-slate-900/75 border border-slate-800 rounded-2xl p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-sm sm:text-base font-black text-white">
                  نسبة المنتجات المستوردة بنجاح مقابل أخطاء البيانات
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                  تحليل جودة البيانات عبر {filteredEntries.length} عملية استيراد ({ratioMetrics.totalAttempted} صف إجمالاً)
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-300 tabular-nums whitespace-nowrap">
              نجاح{' '}
              <span className="text-emerald-400 font-black">{ratioMetrics.successRate}%</span>
              <span className="mx-1.5 text-slate-600" aria-hidden="true">·</span>
              أخطاء بيانات{' '}
              <span className="text-rose-400 font-black">{ratioMetrics.failureRate}%</span>
            </div>
          </div>

          {(() => {
            const radius = 56;
            const circumference = 2 * Math.PI * radius;
            const successArc =
              ratioMetrics.totalAttempted > 0
                ? (ratioMetrics.successCount / ratioMetrics.totalAttempted) * circumference
                : 0;
            const failureArc =
              ratioMetrics.totalAttempted > 0
                ? Math.max(0, circumference - successArc)
                : 0;

            const errorReasonParts: string[] = [];
            if (ratioMetrics.breakdown.missingSku > 0) {
              errorReasonParts.push(`نقص SKU: ${ratioMetrics.breakdown.missingSku}`);
            }
            if (ratioMetrics.breakdown.blankOrInvalidRows > 0) {
              errorReasonParts.push(`صفوف فارغة أو تالفة: ${ratioMetrics.breakdown.blankOrInvalidRows}`);
            }
            if (ratioMetrics.breakdown.orphanOrBlocked > 0) {
              errorReasonParts.push(`بيانات غير صالحة: ${ratioMetrics.breakdown.orphanOrBlocked}`);
            }
            if (ratioMetrics.breakdown.dbWriteErrors > 0) {
              errorReasonParts.push(`أخطاء حفظ: ${ratioMetrics.breakdown.dbWriteErrors}`);
            }
            if (ratioMetrics.breakdown.unclassified > 0) {
              errorReasonParts.push(`أخطاء بيانات أخرى: ${ratioMetrics.breakdown.unclassified}`);
            }

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
                {/* Donut Chart + Structured Legend */}
                <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 140 140"
                      className="w-full h-full -rotate-90"
                      role="img"
                      aria-label={`مخطط نسبة النجاح: ${ratioMetrics.successRate}% مستورد بنجاح و${ratioMetrics.failureRate}% أخطاء بيانات`}
                    >
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="16"
                      />
                      {ratioMetrics.failedCount > 0 && (
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="16"
                          strokeDasharray={`${failureArc} ${circumference}`}
                          strokeDashoffset={-successArc}
                          strokeLinecap="butt"
                        />
                      )}
                      {ratioMetrics.successCount > 0 && (
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="16"
                          strokeDasharray={`${successArc} ${circumference}`}
                          strokeDashoffset={0}
                          strokeLinecap="butt"
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span
                        data-testid="import-success-rate-value"
                        className="text-xl font-black text-white tabular-nums"
                      >
                        {ratioMetrics.successRate}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">نسبة النجاح</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full divide-y divide-slate-800/70 text-xs">
                    <div className="pb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="font-bold text-slate-200 truncate">
                          منتجات مستوردة بنجاح
                        </span>
                      </div>
                      <div className="text-left font-mono tabular-nums whitespace-nowrap">
                        <span className="font-black text-emerald-400">
                          {ratioMetrics.successCount}
                        </span>
                        <span className="text-slate-400 mr-1.5">
                          ({ratioMetrics.successRate}%)
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-sm bg-rose-500 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="font-bold text-slate-200 truncate">
                            فشلت بسبب أخطاء البيانات
                          </span>
                        </div>
                        <div className="text-left font-mono tabular-nums whitespace-nowrap">
                          <span className="font-black text-rose-400">
                            {ratioMetrics.failedCount}
                          </span>
                          <span className="text-slate-400 mr-1.5">
                            ({ratioMetrics.failureRate}%)
                          </span>
                        </div>
                      </div>
                      {errorReasonParts.length > 0 && (
                        <p className="text-[11px] text-slate-400 leading-relaxed tabular-nums">
                          {errorReasonParts.join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Per-Operation Horizontal Comparison Bars */}
                <div className="lg:col-span-7 lg:border-r lg:border-slate-800/80 lg:pr-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-200">
                      مقارنة النجاح والأخطاء حسب أحدث الملفات
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      أحدث {chartOperations.length} عمليات
                    </span>
                  </div>

                  {chartOperations.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4">
                      لا توجد عمليات مطابقة لعرض التوزيع البياني.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {chartOperations.map(({ entry, ok, fail, okPct, failPct }) => (
                        <button
                          key={`chart-bar-${entry.id}`}
                          type="button"
                          onClick={() => {
                            setDetailSearch('');
                            setSelectedEntry(entry);
                          }}
                          className="w-full text-right group cursor-pointer block"
                        >
                          <div className="flex items-center justify-between gap-3 text-[11px] mb-1">
                            <span className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate max-w-[55%]">
                              {entry.fileName}
                            </span>
                            <span className="font-mono text-slate-300 tabular-nums whitespace-nowrap">
                              <span className="text-emerald-400 font-bold">{ok} ناجح</span>
                              {' / '}
                              <span className={fail > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                                {fail} خطأ
                              </span>
                              <span className="text-slate-500 mr-1.5">({okPct}%)</span>
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800/80">
                            {okPct > 0 && (
                              <div
                                className="h-full bg-emerald-500 transition-opacity group-hover:opacity-90"
                                style={{ width: `${okPct}%` }}
                              />
                            )}
                            {failPct > 0 && (
                              <div
                                className="h-full bg-rose-500 transition-opacity group-hover:opacity-90"
                                style={{ width: `${failPct}%` }}
                              />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Feedback / Error Banners */}
      {isMaintenanceMode && (
        <div
          role="alert"
          className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-2xl flex items-center gap-2.5 text-rose-200 text-xs font-bold"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{MAINTENANCE_MODE_BLOCK_MESSAGE}</span>
        </div>
      )}

      {actionFeedback && (
        <div
          role="status"
          className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-emerald-200 text-xs font-bold"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            aria-label="إغلاق الرسالة"
            className="text-emerald-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-2xl flex items-center justify-between gap-3 text-rose-200 text-xs font-bold"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="إغلاق التنبيه"
            className="text-rose-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الملف أو SKU أو معرّف التاجر..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            {(
              [
                { id: 'all', label: 'الكل' },
                { id: 'completed', label: 'مكتمل' },
                { id: 'rolled_back', label: 'تم التراجع عنه' },
              ] as Array<{ id: StatusFilter; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {availableTraderFilters.length > 1 && (
            <select
              aria-label="تصفية حسب التاجر"
              value={selectedTraderFilter}
              onChange={(e) => setSelectedTraderFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="all">جميع التجار</option>
              {availableTraderFilters.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Operations List / Empty State */}
      {entries.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <History className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-base font-black text-white">لا توجد عمليات استيراد مسجلة بعد</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              عند رفع أي ملف TXT أو Excel أو CSV من تقرير أمازون، سيتم تسجيل تفاصيل الملف والمنتجات هنا لتتمكن من مراجعتها أو التراجع عنها في أي وقت.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap cursor-pointer transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>الانتقال لصفحة المنتجات للاستيراد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm font-bold text-slate-300">
            لا توجد عمليات استيراد مطابقة لمعايير البحث الحالية
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setSelectedTraderFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/75 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 px-4 font-black">الملف المرفوع</th>
                  <th className="py-3.5 px-4 font-black">التاجر</th>
                  <th className="py-3.5 px-4 font-black">تاريخ العملية</th>
                  <th className="py-3.5 px-4 font-black">النتائج</th>
                  <th className="py-3.5 px-4 font-black">الحالة</th>
                  <th className="py-3.5 px-4 font-black text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredEntries.map((entry) => {
                  const isRolledBack = entry.status === 'rolled_back';
                  const traderDisplay =
                    entry.traderName || traderNameById.get(entry.traderId) || entry.traderId;
                  const metaLine = [
                    formatImportFileTypeLabel(entry.fileType),
                    formatFileSizeLabel(entry.fileSizeBytes),
                    entry.platform.toUpperCase(),
                  ]
                    .filter((v) => v && v !== '—')
                    .join(' · ');

                  return (
                    <tr
                      key={entry.id}
                      data-testid={`import-history-row-${entry.id}`}
                      className="hover:bg-slate-800/35 transition-colors"
                    >
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-black text-white truncate max-w-[240px]" title={entry.fileName}>
                          {entry.fileName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                          {metaLine}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-bold text-slate-200">{traderDisplay}</div>
                        <div className="text-[11px] font-mono text-amber-300/90 mt-0.5" dir="ltr">
                          {entry.traderId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle text-slate-300 tabular-nums whitespace-nowrap">
                        <div>{formatArabicDateTime(entry.createdAt)}</div>
                        {isRolledBack && entry.rolledBackAt && (
                          <div className="text-[10px] text-amber-400 mt-0.5">
                            تراجع: {formatArabicDateTime(entry.rolledBackAt)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-middle tabular-nums whitespace-nowrap">
                        <div className="font-bold text-slate-100">
                          {entry.totalRead} منتج مقروء
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          جديد <span className="text-emerald-400 font-bold">{entry.newCount}</span>
                          {' · '}
                          محدّث <span className="text-sky-400 font-bold">{entry.updatedCount}</span>
                          {' · '}
                          متخطى <span className="text-slate-300 font-bold">{entry.skippedCount}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        {isRolledBack ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 font-black">
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>تم التراجع عنه</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-black">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>مكتمل</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailSearch('');
                              setSelectedEntry(entry);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                            <span>عرض التفاصيل</span>
                          </button>

                          <button
                            type="button"
                            disabled={isRolledBack || isMaintenanceMode || isRollingBackId === entry.id}
                            onClick={() => setConfirmRollbackEntry(entry)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                              isRolledBack
                                ? 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed'
                                : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 cursor-pointer disabled:opacity-50'
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isRolledBack ? 'تم التراجع' : 'التراجع عن الاستيراد'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* File Details Modal */}
      {selectedEntry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`تفاصيل عملية الاستيراد ${selectedEntry.fileName}`}
          className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 truncate">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="truncate">{selectedEntry.fileName}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 tabular-nums">
                  {formatImportFileTypeLabel(selectedEntry.fileType)} ·{' '}
                  {formatFileSizeLabel(selectedEntry.fileSizeBytes)} · التاجر:{' '}
                  {selectedEntry.traderName ||
                    traderNameById.get(selectedEntry.traderId) ||
                    selectedEntry.traderId}{' '}
                  · {formatArabicDateTime(selectedEntry.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                aria-label="إغلاق التفاصيل"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs tabular-nums">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px]">مقروء من الملف</div>
                <div className="text-base font-black text-white mt-0.5">
                  {selectedEntry.totalRead}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-emerald-400 text-[11px]">منتجات جديدة</div>
                <div className="text-base font-black text-emerald-300 mt-0.5">
                  {selectedEntry.newCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-sky-400 text-[11px]">منتجات محدّثة</div>
                <div className="text-base font-black text-sky-300 mt-0.5">
                  {selectedEntry.updatedCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-rose-400 text-[11px]">صفوف متخطاة (أخطاء بيانات)</div>
                <div className="text-base font-black text-rose-300 mt-0.5">
                  {selectedEntry.failedCount ?? selectedEntry.skippedCount}
                </div>
              </div>
            </div>

            {(() => {
              const fileOk = Math.max(0, Number(selectedEntry.totalRead) || 0);
              const fileFail = Math.max(
                0,
                typeof selectedEntry.failedCount === 'number'
                  ? selectedEntry.failedCount
                  : Number(selectedEntry.skippedCount) || 0
              );
              const fileTotal = fileOk + fileFail;
              if (fileTotal <= 0) return null;
              const fileOkPct = Math.round((fileOk / fileTotal) * 1000) / 10;
              const fileFailPct = Math.round((100 - fileOkPct) * 10) / 10;
              const bd = selectedEntry.errorBreakdown;
              const reasonNotes: string[] = [];
              if (bd?.missingSku) reasonNotes.push(`نقص SKU: ${bd.missingSku}`);
              if (bd?.blankOrInvalidRows) reasonNotes.push(`صفوف فارغة/تالفة: ${bd.blankOrInvalidRows}`);
              if (bd?.orphanOrBlocked) reasonNotes.push(`بيانات غير صالحة: ${bd.orphanOrBlocked}`);

              return (
                <div className="space-y-1.5 text-[11px] tabular-nums">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>
                      نسبة نجاح الاستيراد:{' '}
                      <strong className="text-emerald-400">{fileOkPct}%</strong> ({fileOk} منتج)
                    </span>
                    <span>
                      أخطاء البيانات:{' '}
                      <strong className={fileFail > 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {fileFailPct}%
                      </strong>{' '}
                      ({fileFail} صف)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                    {fileOkPct > 0 && (
                      <div className="h-full bg-emerald-500" style={{ width: `${fileOkPct}%` }} />
                    )}
                    {fileFailPct > 0 && (
                      <div className="h-full bg-rose-500" style={{ width: `${fileFailPct}%` }} />
                    )}
                  </div>
                  {reasonNotes.length > 0 && (
                    <p className="text-slate-400">
                      أسباب الفشل: {reasonNotes.join(' · ')}
                    </p>
                  )}
                  {Array.isArray(selectedEntry.rowErrors) && selectedEntry.rowErrors.length > 0 && (
                    <div className="text-rose-300/90 pt-0.5">
                      أمثلة الصفوف المرفوضة:{' '}
                      {selectedEntry.rowErrors
                        .slice(0, 3)
                        .map((re) => `صف ${re.rowNumber} (${re.reason})`)
                        .join(' · ')}
                    </div>
                  )}
                </div>
              );
            })()}

            {selectedEntry.status === 'rolled_back' && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {selectedEntry.rollbackResultMessage ||
                    `تم التراجع عن هذه العملية بتاريخ ${formatArabicDateTime(
                      selectedEntry.rolledBackAt
                    )}`}
                </span>
              </div>
            )}

            {/* Modal Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={detailSearch}
                onChange={(e) => setDetailSearch(e.target.value)}
                placeholder="تصفية المنتجات داخل هذا الملف بالاسم أو SKU أو ASIN..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
              />
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-auto rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5 font-black">المنتج</th>
                    <th className="p-2.5 font-black">SKU</th>
                    <th className="p-2.5 font-black">ASIN</th>
                    <th className="p-2.5 font-black">الإجراء</th>
                    <th className="p-2.5 font-black">السعر</th>
                    <th className="p-2.5 font-black">المخزون</th>
                    <th className="p-2.5 font-black text-center">الرابط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDetailItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500">
                        لا توجد أصناف مطابقة داخل سجل المعاينة
                      </td>
                    </tr>
                  ) : (
                    filteredDetailItems.map((item, idx) => (
                      <tr key={`${item.sku}-${idx}`} className="hover:bg-slate-800/35">
                        <td className="p-2.5 font-bold text-white max-w-[200px] truncate" title={item.title}>
                          {item.title}
                        </td>
                        <td className="p-2.5 font-mono text-amber-300 whitespace-nowrap" dir="ltr">
                          {item.sku}
                        </td>
                        <td className="p-2.5 font-mono text-sky-300 whitespace-nowrap" dir="ltr">
                          {item.asin || '—'}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          {item.action === 'inserted' ? (
                            <span className="text-emerald-400 font-bold">جديد</span>
                          ) : (
                            <span className="text-sky-400 font-bold">محدّث</span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono whitespace-nowrap tabular-nums">
                          {item.action === 'updated' && item.previousPrice !== undefined ? (
                            <span className="text-slate-200">
                              <span className="text-slate-500 line-through ml-1.5">
                                {item.previousPrice.toLocaleString()}
                              </span>
                              <span className="text-white font-bold">
                                {item.price.toLocaleString()} ج.م
                              </span>
                            </span>
                          ) : (
                            <span className="text-white font-bold">
                              {item.price.toLocaleString()} ج.م
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono whitespace-nowrap tabular-nums">
                          {item.action === 'updated' && item.previousStock !== undefined ? (
                            <span>
                              <span className="text-slate-500 line-through ml-1.5">
                                {item.previousStock}
                              </span>
                              <span className="text-emerald-400 font-bold">{item.stock}</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold">{item.stock}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {item.product_url ? (
                            <a
                              href={item.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center text-sky-400 hover:text-sky-300"
                              aria-label={`فتح رابط ${item.sku}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedEntry.totalRead > selectedEntry.itemsPreview.length && (
              <p className="text-[11px] text-slate-400">
                يتم عرض أول {selectedEntry.itemsPreview.length} صنف للمعاينة، بينما يحتفظ السجل بكامل معرفات التراجع لجميع المنتجات ({selectedEntry.totalRead} منتج).
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              {selectedEntry.status !== 'rolled_back' ? (
                <button
                  type="button"
                  disabled={isMaintenanceMode}
                  onClick={() => setConfirmRollbackEntry(selectedEntry)}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 font-black text-xs flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>التراجع عن هذه العملية</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-amber-400">
                  تم التراجع عن هذه العملية بالفعل
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs whitespace-nowrap cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {confirmRollbackEntry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد التراجع عن عملية الاستيراد"
          className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">
                  تأكيد التراجع عن الاستيراد
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  هل أنت متأكد من التراجع عن استيراد الملف{' '}
                  <strong className="text-amber-300">{confirmRollbackEntry.fileName}</strong>؟
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300 tabular-nums">
              <p>
                • سيتم حذف{' '}
                <strong className="text-rose-300">
                  {confirmRollbackEntry.insertedProductIds.length}
                </strong>{' '}
                منتج جديد تمت إضافته خلال هذه العملية.
              </p>
              <p>
                • سيتم استعادة السعر والمخزون السابق لـ{' '}
                <strong className="text-sky-300">
                  {confirmRollbackEntry.updatedSnapshots.length}
                </strong>{' '}
                منتج محدّث.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={Boolean(isRollingBackId)}
                onClick={() => setConfirmRollbackEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={Boolean(isRollingBackId)}
                onClick={handleConfirmRollback}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRollingBackId === confirmRollbackEntry.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التراجع...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>تأكيد التراجع</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportHistoryPage;
