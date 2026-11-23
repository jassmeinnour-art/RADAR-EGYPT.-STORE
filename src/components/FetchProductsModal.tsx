import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RefreshCw,
  Mail,
  Store,
  Key,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  ExternalLink,
  History,
} from 'lucide-react';
import { Trader } from '../lib/supabase';
import { ImportRowErrorDetail } from '../utils/importHistoryService';
import { ImportErrorLog } from './ImportErrorLog';
import { useMaintenanceMode, MAINTENANCE_MODE_BLOCK_MESSAGE } from '../utils/maintenanceMode';
import { navigate } from '../utils/navigation';
import {
  ACCEPTED_IMPORT_EXTENSIONS,
  AMAZON_TXT_GUIDE_TEXT,
  CompetitorSyncStatus,
  DIRECT_FETCH_BLOCKED_MESSAGE,
  FOUNDER_AMAZON_WARNING_TEXT,
  IMPORT_BUTTON_LABEL,
  NO_TRADER_SELECTED_ERROR,
  SellerCentralImportPreview,
  confirmSellerCentralImport,
  invokeAmazonSpApiSyncEdgeFunction,
  isAmazonSpApiConfigured,
  previewSellerCentralFile,
  sanitizeProductPullError,
} from '../utils/sellerCentralExcelImporter';

interface FetchProductsModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
  onSyncCompleted?: (stats: {
    total: number;
    dbTotal?: number;
    new: number;
    updated: number;
    skipped?: number;
  }) => void;
  initialPreview?: SellerCentralImportPreview | null;
}

export const FetchProductsModal: React.FC<FetchProductsModalProps> = ({
  trader,
  isOpen,
  onClose,
  onShowToast,
  onSyncCompleted,
  initialPreview = null,
}) => {
  const { isMaintenanceMode } = useMaintenanceMode();
  const [isFetching, setIsFetching] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);
  const [previewData, setPreviewData] = useState<SellerCentralImportPreview | null>(initialPreview);
  const [fetchStats, setFetchStats] = useState<{
    total: number;
    dbTotal?: number;
    new: number;
    updated: number;
    skipped?: number;
  } | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [competitorSyncStatus, setCompetitorSyncStatus] = useState<CompetitorSyncStatus | null>(null);
  const [lastImportErrors, setLastImportErrors] = useState<ImportRowErrorDetail[]>([]);
  const [lastImportFileName, setLastImportFileName] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewData(initialPreview || null);
    setFetchStats(null);
    setImportMessage(null);
    setFetchError(null);
    setCompetitorSyncStatus(null);
    setLastImportErrors([]);
    setLastImportFileName(undefined);
  }, [trader, isOpen, initialPreview]);

  if (!isOpen) return null;

  const traderGmail = trader.gmail || trader.email || '';
  const rawTraderId = String(trader?.id || '').trim();
  const targetTraderId =
    rawTraderId && !['all', 'null', 'undefined'].includes(rawTraderId.toLowerCase())
      ? rawTraderId
      : '';
  const spApiReady = isAmazonSpApiConfigured();

  const handleStartFetch = async () => {
    if (isMaintenanceMode) {
      setFetchError(MAINTENANCE_MODE_BLOCK_MESSAGE);
      onShowToast?.(MAINTENANCE_MODE_BLOCK_MESSAGE);
      return;
    }

    if (!targetTraderId) {
      setFetchError(NO_TRADER_SELECTED_ERROR);
      onShowToast?.(NO_TRADER_SELECTED_ERROR);
      return;
    }

    setFetchError(null);
    setFetchStats(null);
    setImportMessage(null);

    // Block all direct browser fetching of destination_url / store_url / sellercentral.amazon.eg
    if (!spApiReady) {
      setFetchError(DIRECT_FETCH_BLOCKED_MESSAGE);
      onShowToast?.(DIRECT_FETCH_BLOCKED_MESSAGE);
      return;
    }

    setIsFetching(true);
    try {
      const outcome = await invokeAmazonSpApiSyncEdgeFunction(targetTraderId);
      if (!outcome.success) {
        const cleanMsg = sanitizeProductPullError(outcome.message);
        setFetchError(cleanMsg);
        onShowToast?.(cleanMsg);
        return;
      }

      const stats = {
        total: outcome.total || 0,
        new: outcome.newCount || 0,
        updated: outcome.updatedCount || 0,
        skipped: 0,
      };
      setFetchStats(stats);
      setImportMessage(outcome.message);
      onSyncCompleted?.(stats);
      onShowToast?.(outcome.message);
    } catch (err) {
      const cleanMsg = sanitizeProductPullError(err);
      setFetchError(cleanMsg);
      onShowToast?.(cleanMsg);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isMaintenanceMode) {
      setFetchError(MAINTENANCE_MODE_BLOCK_MESSAGE);
      onShowToast?.(MAINTENANCE_MODE_BLOCK_MESSAGE);
      return;
    }

    if (!targetTraderId) {
      setFetchError(NO_TRADER_SELECTED_ERROR);
      onShowToast?.(NO_TRADER_SELECTED_ERROR);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsParsingFile(true);
    setFetchError(null);
    setFetchStats(null);
    setImportMessage(null);
    setPreviewData(null);

    try {
      const preview = await previewSellerCentralFile(
        file,
        targetTraderId,
        trader.platform || 'amazon'
      );
      setPreviewData({
        ...preview,
        traderName: trader.seller_name || preview.traderName,
      });
    } catch (err) {
      const cleanMsg = sanitizeProductPullError(err);
      setFetchError(cleanMsg);
      onShowToast?.(cleanMsg);
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;
    if (isMaintenanceMode) {
      setFetchError(MAINTENANCE_MODE_BLOCK_MESSAGE);
      onShowToast?.(MAINTENANCE_MODE_BLOCK_MESSAGE);
      return;
    }

    const effectiveTraderId = targetTraderId || previewData.traderId;
    if (!effectiveTraderId) {
      setFetchError(NO_TRADER_SELECTED_ERROR);
      onShowToast?.(NO_TRADER_SELECTED_ERROR);
      return;
    }

    setIsConfirmingImport(true);
    setFetchError(null);
    setCompetitorSyncStatus(null);
    try {
      const summary = await confirmSellerCentralImport({
        ...previewData,
        traderId: effectiveTraderId,
        traderName: previewData.traderName || trader.seller_name,
      });
      const stats = {
        total: summary.verifiedDbCount ?? summary.total,
        dbTotal: summary.verifiedDbCount,
        new: summary.newCount,
        updated: summary.updatedCount,
        skipped: summary.skippedCount,
      };
      setLastImportErrors(summary.rowErrors || previewData.rowErrors || []);
      setLastImportFileName(previewData.fileName);
      setCompetitorSyncStatus(summary.competitorSync || null);
      setFetchStats(stats);
      setImportMessage(summary.message);
      setPreviewData(null);
      onSyncCompleted?.(stats);
      onShowToast?.(summary.message);
    } catch (err) {
      const cleanMsg = sanitizeProductPullError(err);
      setFetchStats(null);
      setImportMessage(null);
      setFetchError(cleanMsg);
      onShowToast?.(cleanMsg);
    } finally {
      setIsConfirmingImport(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-['Cairo']"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>استيراد ملف منتجات أمازون (TXT / Excel / CSV)</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-slate-300 text-xs">
          {/* Trader Info Summary (Display Only — No Amazon Login/Password) */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-slate-400">التاجر:</span>
              <span className="font-black text-white truncate">{trader.seller_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-400">Seller ID:</span>
              <span className="font-mono font-bold text-amber-300" dir="ltr">
                {trader.seller_id || targetTraderId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-bold text-slate-400">البريد (للعرض):</span>
              <span className="font-mono text-slate-200 truncate" dir="ltr">
                {traderGmail || 'غير محدد'}
              </span>
            </div>
          </div>

          {/* Primary Action: Amazon TXT (All Listings Report) / Excel / CSV Import */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3">
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-emerald-300 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>الطريقة الأساسية الموصى بها: تقرير All Listings Report من أمازون</span>
              </h4>
              <p className="text-xs text-emerald-100 font-bold bg-slate-950/60 border border-emerald-500/30 rounded-xl p-2.5 leading-relaxed">
                {AMAZON_TXT_GUIDE_TEXT}
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                يدعم ملفات <span className="font-mono font-bold text-white">.txt</span> (Tab-separated UTF-16 / UTF-8)، و{' '}
                <span className="font-mono font-bold text-white">.tsv</span>، و{' '}
                <span className="font-mono font-bold text-white">.csv</span>، و{' '}
                <span className="font-mono font-bold text-white">.xlsx</span> للتاجر{' '}
                <span className="font-mono text-amber-300" dir="ltr">
                  {targetTraderId}
                </span>
                .
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMPORT_EXTENSIONS}
              data-testid="modal-excel-file-input"
              onChange={handleFileSelected}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsingFile || isConfirmingImport || isMaintenanceMode}
              className="w-full min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isParsingFile ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري قراءة الملف وتجهيز المعاينة...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{IMPORT_BUTTON_LABEL}</span>
                </>
              )}
            </button>
          </div>

          {/* 5-Product Preview Before Confirming */}
          {previewData && (
            <div
              data-testid="import-preview-panel"
              className="p-4 bg-slate-950 border border-sky-500/40 rounded-2xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-black text-sky-300">
                  معاينة أول 5 منتجات قبل التأكيد ({previewData.fileName})
                </h4>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-200 border border-sky-500/30">
                  {previewData.summaryMessage}
                </span>
              </div>

              {(previewData.linePreviewMessage || previewData.rows[0]?.sku) && (
                <p
                  data-testid="import-line-preview-banner"
                  className="text-xs font-bold text-emerald-300 bg-emerald-950/35 border border-emerald-500/30 rounded-xl px-3 py-2"
                >
                  {previewData.linePreviewMessage ||
                    `تم قراءة ${previewData.totalRead} منتج - مثال: أول منتج: [${previewData.rows[0]?.sku || '—'}] - [${previewData.rows[0]?.title || '—'}] - [${previewData.rows[0]?.price ?? 0} ج.م]`}
                </p>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-[11px]">
                  <thead className="bg-slate-900 text-slate-300 font-black border-b border-slate-800">
                    <tr>
                      <th className="p-2">المنتج</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">ASIN</th>
                      <th className="p-2 text-center">السعر</th>
                      <th className="p-2 text-center">المخزون</th>
                      <th className="p-2 text-center">الحالة</th>
                      <th className="p-2 text-center">الرابط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {previewData.previewRows.map((row, idx) => (
                      <tr key={`${row.sku}-${idx}`} className="hover:bg-slate-900/50">
                        <td className="p-2 font-bold text-white max-w-[180px] truncate" title={row.title}>
                          {row.title}
                        </td>
                        <td className="p-2 font-mono text-amber-300" dir="ltr">
                          {row.sku}
                        </td>
                        <td className="p-2 font-mono text-sky-300" dir="ltr">
                          {row.asin || '—'}
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-white">
                          {row.price.toLocaleString()} ج.م
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-emerald-400">
                          {row.stock}
                        </td>
                        <td className="p-2 text-center text-slate-300">
                          {row.condition || '—'}
                        </td>
                        <td className="p-2 text-center">
                          {row.product_url ? (
                            <a
                              href={row.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sky-400 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(previewData.rowErrors?.length || previewData.skippedCount > 0) && (
                <ImportErrorLog
                  errors={previewData.rowErrors || []}
                  fileName={previewData.fileName}
                  skippedFallbackCount={previewData.skippedCount}
                  title="سجل أخطاء الملف (منتجات لن تُستورد)"
                  subtitle="يمكنك تصدير الصفوف المتعثرة بصيغة CSV لإصلاحها وإعادة المحاولة"
                  compact
                  hideWhenEmpty
                  onShowToast={onShowToast}
                />
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  disabled={isConfirmingImport}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isConfirmingImport}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isConfirmingImport ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ المنتجات وتحليل أسعار المنافسين...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأكيد الاستيراد ({previewData.totalRead})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {isMaintenanceMode && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl flex items-start gap-2 text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-bold">{MAINTENANCE_MODE_BLOCK_MESSAGE}</span>
            </div>
          )}

          {fetchError && (
            <div
              role="alert"
              className="p-3.5 bg-amber-950/60 border border-amber-500/50 rounded-xl flex items-start gap-2.5 text-amber-200"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-bold">{fetchError}</span>
            </div>
          )}

          {fetchStats && (
            <div
              role="status"
              className="p-4 bg-emerald-900/25 border border-emerald-500/40 rounded-2xl text-center space-y-2"
            >
              <div className="flex items-center justify-center gap-1.5 text-sm font-black text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {importMessage ||
                    `تم قراءة ${fetchStats.total} منتج من الملف - جديد ${fetchStats.new} - محدّث ${fetchStats.updated} - متخطى ${fetchStats.skipped || 0}`}
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-mono">
                في قاعدة البيانات: {fetchStats.dbTotal ?? fetchStats.total} | جديد: {fetchStats.new} | محدّث: {fetchStats.updated} | متخطى: {fetchStats.skipped || 0}
              </p>

              {competitorSyncStatus && (
                <div
                  data-testid="competitor-sync-status"
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-wrap items-center justify-center gap-2 ${
                    competitorSyncStatus.spApiConfigured
                      ? 'bg-sky-950/50 border-sky-500/35 text-sky-200'
                      : 'bg-amber-950/40 border-amber-500/35 text-amber-200'
                  }`}
                >
                  <span>{competitorSyncStatus.message}</span>
                  {!competitorSyncStatus.spApiConfigured && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/settings');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer"
                    >
                      ربط SP-API
                    </button>
                  )}
                </div>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/import-history');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-xs cursor-pointer transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>عرض في سجل عمليات الاستيراد</span>
                </button>
              </div>
            </div>
          )}

          {fetchStats && (lastImportErrors.length > 0 || (fetchStats.skipped || 0) > 0) && (
            <ImportErrorLog
              errors={lastImportErrors}
              fileName={lastImportFileName}
              skippedFallbackCount={fetchStats.skipped || 0}
              title="المنتجات التي تعذر استيرادها"
              subtitle="صدّر هذه الصفوف إلى ملف CSV لتصحيح البيانات الناقصة وإعادة رفعها"
              compact
              hideWhenEmpty
              onShowToast={onShowToast}
            />
          )}

          {/* Security Warning against Linked Accounts */}
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-rose-300">{FOUNDER_AMAZON_WARNING_TEXT}</p>
              <p className="text-[11px] text-rose-100/80 leading-relaxed">
                التاجر يدخل بنفسه على حسابه ويوافق على رادار عبر SP-API OAuth، والمؤسس يستلم Refresh Token فقط.
              </p>
            </div>
          </div>

          {/* Secondary Action: Pull via SP-API Edge Function (or clear block notice if not configured) */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleStartFetch}
              disabled={isFetching || isMaintenanceMode}
              className="w-full min-h-[42px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isFetching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الاتصال عبر Supabase Edge Function...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>سحب المنتجات</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/settings');
              }}
              className="w-full py-2 rounded-xl text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات ربط SP-API عبر Supabase Edge Function</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
