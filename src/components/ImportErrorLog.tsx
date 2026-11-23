import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Search,
  X,
} from 'lucide-react';
import {
  downloadImportErrorsCsv,
  getImportHistoryEntries,
  ImportErrorCategory,
  ImportErrorLogExportRow,
  ImportHistoryEntry,
  ImportRowErrorDetail,
  RADAR_IMPORT_HISTORY_UPDATED_EVENT,
} from '../utils/importHistoryService';

export interface ImportErrorLogProps {
  errors?: ImportRowErrorDetail[];
  fileName?: string;
  entries?: ImportHistoryEntry[];
  skippedFallbackCount?: number;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  hideWhenEmpty?: boolean;
  onShowToast?: (message: string) => void;
  onSelectOperation?: (entry: ImportHistoryEntry) => void;
}

type CategoryFilter = 'all' | ImportErrorCategory;

function inferErrorCategory(err: ImportRowErrorDetail): ImportErrorCategory {
  if (err.errorCategory) return err.errorCategory;
  const reason = String(err.reason || '').toLowerCase();
  if (reason.includes('sku')) return 'missing_sku';
  if (reason.includes('فارغ') || reason.includes('تالف') || reason.includes('blank')) {
    return 'blank_or_invalid';
  }
  if (reason.includes('تجريبية') || reason.includes('غير صالحة') || reason.includes('orphan')) {
    return 'orphan_or_blocked';
  }
  if (reason.includes('حفظ') || reason.includes('قاعدة') || reason.includes('uuid') || reason.includes('db')) {
    return 'db_write_error';
  }
  return 'other';
}

function formatCategoryLabel(category: ImportErrorCategory): string {
  switch (category) {
    case 'missing_sku':
      return 'نقص SKU';
    case 'blank_or_invalid':
      return 'صف فارغ أو تالف';
    case 'orphan_or_blocked':
      return 'بيانات مرفوضة';
    case 'db_write_error':
      return 'خطأ حفظ';
    default:
      return 'خطأ بيانات';
  }
}

function formatArabicDateShort(iso?: string): string {
  if (!iso) return '—';
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return '—';
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(parsed));
  } catch {
    return iso;
  }
}

export const ImportErrorLog: React.FC<ImportErrorLogProps> = ({
  errors,
  fileName,
  entries: externalEntries,
  skippedFallbackCount = 0,
  title = 'سجل أخطاء الاستيراد',
  subtitle = 'مراجعة الصفوف التي فشل استيرادها وتصديرها بصيغة CSV لتعديلها وإعادة المحاولة',
  compact = false,
  hideWhenEmpty = false,
  onShowToast,
  onSelectOperation,
}) => {
  const [historyEntries, setHistoryEntries] = useState<ImportHistoryEntry[]>(() =>
    externalEntries ?? getImportHistoryEntries()
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [fileFilter, setFileFilter] = useState<string>('all');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (externalEntries) {
      setHistoryEntries(externalEntries);
      return;
    }
    if (errors !== undefined) return;

    const handleUpdated = () => {
      setHistoryEntries(getImportHistoryEntries());
    };
    window.addEventListener(RADAR_IMPORT_HISTORY_UPDATED_EVENT, handleUpdated);
    return () => {
      window.removeEventListener(RADAR_IMPORT_HISTORY_UPDATED_EVENT, handleUpdated);
    };
  }, [externalEntries, errors]);

  const entryById = useMemo(() => {
    const map = new Map<string, ImportHistoryEntry>();
    historyEntries.forEach((entry) => map.set(entry.id, entry));
    return map;
  }, [historyEntries]);

  const allErrorRows = useMemo<ImportErrorLogExportRow[]>(() => {
    if (errors !== undefined) {
      return errors.map((err) => ({
        ...err,
        errorCategory: inferErrorCategory(err),
        fileName: fileName || 'ملف الاستيراد',
      }));
    }

    const collected: ImportErrorLogExportRow[] = [];
    historyEntries.forEach((entry) => {
      if (Array.isArray(entry.rowErrors) && entry.rowErrors.length > 0) {
        entry.rowErrors.forEach((err) => {
          collected.push({
            ...err,
            errorCategory: inferErrorCategory(err),
            fileName: entry.fileName,
            recordedAt: entry.createdAt,
            importId: entry.id,
            traderName: entry.traderName,
          });
        });
      }
    });
    return collected;
  }, [errors, fileName, historyEntries]);

  const summaryCounts = useMemo(() => {
    const counts = {
      total: allErrorRows.length,
      missing_sku: 0,
      blank_or_invalid: 0,
      orphan_or_blocked: 0,
      db_write_error: 0,
      other: 0,
      filesCount: 0,
    };
    const fileSet = new Set<string>();
    allErrorRows.forEach((row) => {
      const cat = row.errorCategory || inferErrorCategory(row);
      counts[cat] = (counts[cat] || 0) + 1;
      if (row.fileName) fileSet.add(row.fileName);
    });
    counts.filesCount = fileSet.size;
    return counts;
  }, [allErrorRows]);

  const availableFiles = useMemo(() => {
    const set = new Set<string>();
    allErrorRows.forEach((row) => {
      if (row.fileName) set.add(row.fileName);
    });
    return Array.from(set);
  }, [allErrorRows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allErrorRows.filter((row) => {
      const cat = row.errorCategory || inferErrorCategory(row);
      if (categoryFilter !== 'all' && cat !== categoryFilter) return false;
      if (fileFilter !== 'all' && row.fileName !== fileFilter) return false;
      if (!q) return true;

      return (
        String(row.sku || '').toLowerCase().includes(q) ||
        String(row.title || '').toLowerCase().includes(q) ||
        String(row.asin || '').toLowerCase().includes(q) ||
        String(row.reason || '').toLowerCase().includes(q) ||
        String(row.fileName || '').toLowerCase().includes(q) ||
        String(row.rowNumber || '').includes(q)
      );
    });
  }, [allErrorRows, categoryFilter, fileFilter, searchQuery]);

  if (hideWhenEmpty && allErrorRows.length === 0 && skippedFallbackCount <= 0) {
    return null;
  }

  const handleExportCsv = () => {
    const targetRows = filteredRows.length > 0 ? filteredRows : allErrorRows;
    if (targetRows.length === 0) return;

    const targetSourceName =
      fileFilter !== 'all' ? fileFilter : fileName || (availableFiles.length === 1 ? availableFiles[0] : undefined);
    const { fileName: exportedFileName, count } = downloadImportErrorsCsv(
      targetRows,
      targetSourceName
    );
    const msg = `تم تصدير ${count} صف فاشل إلى ملف (${exportedFileName}) — عدّل القيم الناقصة ثم أعد رفع الملف`;
    setExportFeedback(msg);
    onShowToast?.(msg);
  };

  const showSourceFileColumn = errors === undefined || availableFiles.length > 1;

  return (
    <section
      aria-label={title}
      data-testid="import-error-log"
      dir="rtl"
      className={`bg-slate-900/80 border border-slate-800 rounded-2xl ${
        compact ? 'p-4 space-y-3' : 'p-5 sm:p-6 space-y-4'
      } font-['Cairo']`}
    >
      {/* Header Zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-black text-white`}>
              {title}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={allErrorRows.length === 0}
          data-testid="export-import-errors-csv-btn"
          className="px-4 py-2.5 min-h-[40px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>
            تصدير الأخطاء CSV لإعادة المحاولة ({filteredRows.length || allErrorRows.length})
          </span>
        </button>
      </div>

      {/* Empty State */}
      {allErrorRows.length === 0 ? (
        skippedFallbackCount > 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            تم تخطي <strong className="text-rose-400 font-mono tabular-nums">{skippedFallbackCount}</strong> صف خلال عملية الاستيراد لعدم استيفاء الحقول المطلوبة أو لوجود أسطر فارغة داخل الملف.
          </div>
        ) : (
          <div
            data-testid="import-error-log-empty"
            className="py-8 px-4 text-center space-y-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/40"
          >
            <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-black text-white">لا توجد أخطاء استيراد مسجلة</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              جميع الصفوف التي تم استيرادها عبر ملفات أمازون تمت معالجتها بنجاح دون أخطاء بيانات. في حال فشل أي منتجات مستقبلاً ستظهر هنا مع خيار تصديرها لإعادة المحاولة.
            </p>
          </div>
        )
      ) : (
        <>
          {/* Summary Strip (clean unboxed metadata with hairline separators) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 tabular-nums">
            <span>
              إجمالي الصفوف الفاشلة:{' '}
              <strong className="text-rose-400 font-mono">{summaryCounts.total}</strong>
            </span>
            {summaryCounts.filesCount > 0 && (
              <>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <span>
                  الملفات المتأثرة:{' '}
                  <strong className="text-white font-mono">{summaryCounts.filesCount}</strong>
                </span>
              </>
            )}
            {summaryCounts.missing_sku > 0 && (
              <>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <span>
                  نقص SKU:{' '}
                  <strong className="text-amber-300 font-mono">{summaryCounts.missing_sku}</strong>
                </span>
              </>
            )}
            {summaryCounts.blank_or_invalid > 0 && (
              <>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <span>
                  صفوف فارغة أو تالفة:{' '}
                  <strong className="text-slate-200 font-mono">{summaryCounts.blank_or_invalid}</strong>
                </span>
              </>
            )}
            {summaryCounts.orphan_or_blocked > 0 && (
              <>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <span>
                  بيانات مرفوضة:{' '}
                  <strong className="text-rose-300 font-mono">{summaryCounts.orphan_or_blocked}</strong>
                </span>
              </>
            )}
            {summaryCounts.db_write_error > 0 && (
              <>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <span>
                  أخطاء حفظ:{' '}
                  <strong className="text-rose-300 font-mono">{summaryCounts.db_write_error}</strong>
                </span>
              </>
            )}
          </div>

          {exportFeedback && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2 text-xs text-emerald-200 font-bold"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{exportFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setExportFeedback(null)}
                aria-label="إغلاق إشعار التصدير"
                className="text-emerald-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الصف أو SKU أو اسم المنتج أو السبب..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
                {(
                  [
                    { id: 'all', label: 'الكل', count: summaryCounts.total },
                    { id: 'missing_sku', label: 'نقص SKU', count: summaryCounts.missing_sku },
                    { id: 'blank_or_invalid', label: 'فارغة/تالفة', count: summaryCounts.blank_or_invalid },
                    { id: 'orphan_or_blocked', label: 'مرفوضة', count: summaryCounts.orphan_or_blocked },
                    { id: 'db_write_error', label: 'أخطاء حفظ', count: summaryCounts.db_write_error },
                  ] as Array<{ id: CategoryFilter; label: string; count: number }>
                )
                  .filter((tab) => tab.id === 'all' || tab.count > 0)
                  .map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCategoryFilter(tab.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        categoryFilter === tab.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
              </div>

              {availableFiles.length > 1 && (
                <select
                  aria-label="تصفية الأخطاء حسب الملف"
                  value={fileFilter}
                  onChange={(e) => setFileFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="all">جميع الملفات ({availableFiles.length})</option>
                  {availableFiles.map((fname) => (
                    <option key={fname} value={fname}>
                      {fname}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Errors Table */}
          <div className={`overflow-auto rounded-xl border border-slate-800 ${compact ? 'max-h-60' : 'max-h-[420px]'}`}>
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 font-black whitespace-nowrap">رقم الصف</th>
                  {showSourceFileColumn && (
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">الملف</th>
                  )}
                  <th className="py-2.5 px-3 font-black whitespace-nowrap">SKU</th>
                  <th className="py-2.5 px-3 font-black whitespace-nowrap">ASIN</th>
                  <th className="py-2.5 px-3 font-black whitespace-nowrap">اسم المنتج</th>
                  <th className="py-2.5 px-3 font-black whitespace-nowrap">السعر / الكمية</th>
                  <th className="py-2.5 px-3 font-black whitespace-nowrap">سبب الفشل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={showSourceFileColumn ? 7 : 6}
                      className="p-6 text-center text-slate-400"
                    >
                      لا توجد أخطاء مطابقة لمعايير التصفية الحالية
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => {
                    const cat = row.errorCategory || inferErrorCategory(row);
                    const relatedEntry = row.importId ? entryById.get(row.importId) : undefined;
                    return (
                      <tr
                        key={`${row.importId || 'curr'}-${row.rowNumber}-${idx}`}
                        data-testid={`import-error-row-${row.rowNumber}`}
                        className="hover:bg-slate-800/35 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-200 tabular-nums whitespace-nowrap">
                          #{row.rowNumber}
                        </td>
                        {showSourceFileColumn && (
                          <td className="py-2.5 px-3 max-w-[180px]">
                            {relatedEntry && onSelectOperation ? (
                              <button
                                type="button"
                                onClick={() => onSelectOperation(relatedEntry)}
                                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold truncate max-w-full cursor-pointer"
                                title={row.fileName}
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{row.fileName}</span>
                              </button>
                            ) : (
                              <div className="font-bold text-slate-200 truncate" title={row.fileName}>
                                {row.fileName || '—'}
                              </div>
                            )}
                            {row.recordedAt && (
                              <div className="text-[10px] text-slate-500 tabular-nums">
                                {formatArabicDateShort(row.recordedAt)}
                              </div>
                            )}
                          </td>
                        )}
                        <td className="py-2.5 px-3 font-mono text-amber-300 whitespace-nowrap" dir="ltr">
                          {row.sku || 'مفقود'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-sky-300 whitespace-nowrap" dir="ltr">
                          {row.asin || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white max-w-[200px] truncate" title={row.title}>
                          {row.title || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums whitespace-nowrap">
                          {row.price !== undefined && row.price !== '' ? `${row.price} ج.م` : '—'}
                          {' · '}
                          {row.stock !== undefined && row.stock !== '' ? `${row.stock} قطعة` : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-rose-300">{row.reason}</div>
                          <div className="text-[10px] text-slate-400">
                            {formatCategoryLabel(cat)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            الملف المصدّر يتضمن أعمدة <span className="font-mono text-slate-200">seller-sku</span> و{' '}
            <span className="font-mono text-slate-200">item-name</span> و{' '}
            <span className="font-mono text-slate-200">asin</span> و{' '}
            <span className="font-mono text-slate-200">price</span> و{' '}
            <span className="font-mono text-slate-200">quantity</span> مع عمود سبب الخطأ لتتمكن من تصحيح القيم وإعادة رفع الملف مباشرة.
          </p>
        </>
      )}
    </section>
  );
};

export default ImportErrorLog;
