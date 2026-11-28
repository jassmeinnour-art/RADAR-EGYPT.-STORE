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
  Zap,
  Package,
  Copy,
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
  DEFAULT_MARKETPLACE_ID,
  DIRECT_FETCH_BLOCKED_MESSAGE,
  FOUNDER_AMAZON_WARNING_TEXT,
  IMPORT_BUTTON_LABEL,
  NO_TRADER_SELECTED_ERROR,
  SellerCentralImportPreview,
  SellerCentralImportedRow,
  confirmSellerCentralImport,
  getAmazonSpApiSettings,
  getTraderAmazonConnection,
  invokeAmazonSpApiSyncEdgeFunction,
  isAmazonSpApiConfigured,
  previewSellerCentralFile,
  sanitizeProductPullError,
  buildMerchantAmazonAuthorizeUrl,
} from '../utils/sellerCentralExcelImporter';

interface FetchProductsModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
  onSyncCompleted?: (stats: {
    total: number;
    dbTotal?: number;
    dbPricedCount?: number;
    dbFirstSamplePrice?: number | null;
    new: number;
    updated: number;
    skipped?: number;
  }) => void;
  initialPreview?: SellerCentralImportPreview | null;
  autoStartSpApi?: boolean;
}

export const FetchProductsModal: React.FC<FetchProductsModalProps> = ({
  trader,
  isOpen,
  onClose,
  onShowToast,
  onSyncCompleted,
  initialPreview = null,
  autoStartSpApi = false,
}) => {
  const { isMaintenanceMode } = useMaintenanceMode();
  const [isFetching, setIsFetching] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);
  const [previewData, setPreviewData] = useState<SellerCentralImportPreview | null>(initialPreview);
  const [pulledProducts, setPulledProducts] = useState<SellerCentralImportedRow[]>([]);
  const [fetchStats, setFetchStats] = useState<{
    total: number;
    dbTotal?: number;
    dbPricedCount?: number;
    dbFirstSamplePrice?: number | null;
    new: number;
    updated: number;
    skipped?: number;
  } | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [postImportPriceWarning, setPostImportPriceWarning] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [competitorSyncStatus, setCompetitorSyncStatus] = useState<CompetitorSyncStatus | null>(null);
  const [lastImportErrors, setLastImportErrors] = useState<ImportRowErrorDetail[]>([]);
  const [lastImportFileName, setLastImportFileName] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoTriggeredKeyRef = useRef<string | null>(null);

  const rawTraderId = String(trader?.id || '').trim();
  const targetTraderId =
    rawTraderId && !['all', 'null', 'undefined'].includes(rawTraderId.toLowerCase())
      ? rawTraderId
      : '';
  const traderConn = getTraderAmazonConnection(trader);
  const spApiSettings = getAmazonSpApiSettings();
  const hasRefreshToken = Boolean(traderConn.refreshToken);
  const spApiReady = hasRefreshToken || isAmazonSpApiConfigured(undefined, trader);
  const resolvedSellerId =
    traderConn.sellerId || String(trader?.seller_id || targetTraderId || '').trim();
  const resolvedMarketplaceId = spApiSettings.marketplaceId || DEFAULT_MARKETPLACE_ID;

  useEffect(() => {
    setPreviewData(initialPreview || null);
    setPulledProducts([]);
    setFetchStats(null);
    setImportMessage(null);
    setPostImportPriceWarning(null);
    setFetchError(null);
    setCompetitorSyncStatus(null);
    setLastImportErrors([]);
    setLastImportFileName(undefined);
    if (!isOpen) {
      autoTriggeredKeyRef.current = null;
    }
  }, [trader, isOpen, initialPreview]);

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
    setPulledProducts([]);

    if (!spApiReady) {
      setFetchError(DIRECT_FETCH_BLOCKED_MESSAGE);
      onShowToast?.(DIRECT_FETCH_BLOCKED_MESSAGE);
      return;
    }

    setIsFetching(true);
    try {
      const outcome = await invokeAmazonSpApiSyncEdgeFunction(targetTraderId, trader);
      if (!outcome.success) {
        const cleanMsg = sanitizeProductPullError(outcome.message);
        setFetchError(cleanMsg);
        onShowToast?.(cleanMsg);
        return;
      }

      const liveRows = Array.isArray(outcome.products) ? outcome.products : [];
      setPulledProducts(liveRows);
      const firstPriced = liveRows.find((r) => Number(r.price) > 0);
      const pricedCount = liveRows.filter((r) => Number(r.price) > 0).length;

      const stats = {
        total: outcome.total ?? liveRows.length,
        dbTotal: outcome.total ?? liveRows.length,
        ...(liveRows.length > 0 ? { dbPricedCount: pricedCount } : {}),
        ...(firstPriced ? { dbFirstSamplePrice: firstPriced.price } : {}),
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

  useEffect(() => {
    const autoKey = `${targetTraderId}:${hasRefreshToken}`;
    if (
      isOpen &&
      autoStartSpApi &&
      hasRefreshToken &&
      !initialPreview &&
      autoTriggeredKeyRef.current !== autoKey
    ) {
      autoTriggeredKeyRef.current = autoKey;
      void handleStartFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoStartSpApi, hasRefreshToken, targetTraderId, initialPreview]);

  if (!isOpen) return null;

  const traderGmail = trader.gmail || trader.email || '';

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
    setPostImportPriceWarning(null);
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
      if (preview.priceWarning) {
        onShowToast?.(preview.priceWarning);
      }
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
    setPostImportPriceWarning(null);
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
        dbPricedCount: summary.dbPricedCount,
        dbFirstSamplePrice: summary.dbFirstSamplePrice,
        new: summary.newCount,
        updated: summary.updatedCount,
        skipped: summary.skippedCount,
      };
      setLastImportErrors(summary.rowErrors || previewData.rowErrors || []);
      setLastImportFileName(previewData.fileName);
      setCompetitorSyncStatus(summary.competitorSync || null);
      setFetchStats(stats);
      setImportMessage(summary.message);
      setPostImportPriceWarning(summary.priceWarning || previewData.priceWarning || null);
      setPreviewData(null);
      onSyncCompleted?.(stats);
      onShowToast?.(summary.priceWarning ? `${summary.message} — ⚠️ ${summary.priceWarning}` : summary.message);
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
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            {hasRefreshToken ? (
              <Zap className="w-5 h-5 text-amber-400" />
            ) : (
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            )}
            <span>
              {hasRefreshToken
                ? 'سحب المنتجات مباشرة من Amazon SP-API'
                : 'سحب المنتجات أو استيراد ملف أمازون (TXT / Excel / CSV)'}
            </span>
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
                {resolvedSellerId}
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

          {/* Live SP-API Pull Panel when Refresh Token exists */}
          {hasRefreshToken && (
            <div
              data-testid="sp-api-live-pull-panel"
              className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>سحب المنتجات الحقيقية من Amazon SP-API مباشرة</span>
                </h4>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">
                  Refresh Token: متوفر ✓
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-950/65 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 font-bold">Marketplace ID: </span>
                  <span className="font-mono text-sky-300 font-bold" dir="ltr">
                    {resolvedMarketplaceId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">نقطة السحب: </span>
                  <span className="font-mono text-emerald-300 font-bold" dir="ltr">
                    /listings/2021-08-01 + /catalog/2022-04-01
                  </span>
                </div>
              </div>

              <button
                type="button"
                data-testid="sp-api-pull-now-btn"
                onClick={handleStartFetch}
                disabled={isFetching || isMaintenanceMode}
                className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الاتصال بأمازون وسحب المنتجات الحقيقية...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>سحب المنتجات الحقيقية من أمازون الآن (SP-API)</span>
                  </>
                )}
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMPORT_EXTENSIONS}
            data-testid="modal-excel-file-input"
            onChange={handleFileSelected}
            className="hidden"
          />

          {/* File Import Section — ONLY shown when trader has NO Refresh Token (do NOT ask founder to import a file when Refresh Token is configured) */}
          {!hasRefreshToken && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3">
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-emerald-300 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>استيراد ملف منتجات أمازون (أو أضف Refresh Token للسحب المباشر)</span>
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
          )}

          {/* 5-Product Preview Before Confirming (file imports) */}
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

              {previewData.detectedHeaders && previewData.detectedHeaders.length > 0 && (
                <div
                  data-testid="detected-headers-banner"
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-300 font-mono leading-relaxed break-words"
                >
                  <span className="font-bold text-sky-300 font-['Cairo']">
                    تم قراءة {previewData.totalRead} منتج - الأعمدة الموجودة:{' '}
                  </span>
                  <span>{previewData.detectedHeaders.join(' - ')}</span>
                </div>
              )}

              {previewData.missingCatalogNotice && (
                <div
                  role="status"
                  data-testid="missing-catalog-columns-warning"
                  className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/45 text-sky-200 text-xs font-bold flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{previewData.missingCatalogNotice}</span>
                </div>
              )}

              {previewData.priceWarning && (
                <div
                  role="alert"
                  data-testid="missing-price-column-warning"
                  className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{previewData.priceWarning}</span>
                </div>
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
                    {previewData.previewRows.map((row, idx) => {
                      const hasNumericRowStock =
                        row.stock !== null &&
                        row.stock !== undefined &&
                        Number.isFinite(Number(row.stock));
                      const rowStatusLabel =
                        row.status === 'active'
                          ? 'نشط'
                          : row.status === 'inactive'
                          ? 'غير نشط'
                          : row.status || row.condition || 'نشط';
                      return (
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
                            {hasNumericRowStock ? row.stock : 'غير متوفر'}
                          </td>
                          <td className="p-2 text-center text-slate-300">
                            {rowStatusLabel}
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
                      );
                    })}
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
              data-testid="sp-api-error-alert"
              className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-xl flex items-start gap-2.5 text-rose-200"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-2 min-w-0 flex-1">
                <p className="font-black text-rose-300">استجابة خطأ من Amazon SP-API:</p>
                <span className="leading-relaxed font-bold break-words block">{fetchError}</span>

                {(fetchError.includes('invalid_grant') ||
                  fetchError.includes('refresh_token') ||
                  fetchError.includes('انتهت صلاحية')) && (
                  <div className="pt-2 border-t border-rose-500/30 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const sId = trader.seller_id || trader.id;
                        const url = buildMerchantAmazonAuthorizeUrl(sId, trader.seller_name);
                        try {
                          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                            navigator.clipboard.writeText(url);
                          }
                        } catch {}
                        onShowToast?.('📋 تم نسخ رابط تفويض التاجر (OAuth)');
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ رابط تفويض التاجر لتجديد الـ Token (OAuth)</span>
                    </button>
                  </div>
                )}
              </div>
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
                    `تم جلب ${fetchStats.total} منتج - جديد ${fetchStats.new} - محدّث ${fetchStats.updated} - متخطى ${fetchStats.skipped || 0}`}
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-mono">
                في قاعدة البيانات: {fetchStats.dbTotal ?? fetchStats.total} | جديد: {fetchStats.new} | محدّث: {fetchStats.updated} | متخطى: {fetchStats.skipped || 0}
              </p>

              {typeof fetchStats.dbFirstSamplePrice === 'number' && (
                <p data-testid="db-verified-price-summary" className="text-xs text-sky-300 font-bold">
                  السعر الحقيقي في قاعدة البيانات:{' '}
                  <span className="font-mono text-white">
                    {fetchStats.dbFirstSamplePrice.toLocaleString()} ج.م
                  </span>
                  {typeof fetchStats.dbPricedCount === 'number' && (
                    <>
                      {' '}
                      | منتجات مسعّرة: <span className="font-mono text-emerald-300">{fetchStats.dbPricedCount}</span> من{' '}
                      <span className="font-mono text-white">{fetchStats.dbTotal ?? fetchStats.total}</span>
                    </>
                  )}
                </p>
              )}

              {postImportPriceWarning && (
                <div
                  role="alert"
                  data-testid="post-import-price-warning"
                  className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{postImportPriceWarning}</span>
                </div>
              )}

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

          {/* Live SP-API Pulled Products Table (SKU, ASIN, Price, Stock) */}
          {pulledProducts.length > 0 && (
            <div
              data-testid="sp-api-pulled-products-table"
              className="p-4 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-emerald-300 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>المنتجات الحقيقية المسحوبة من أمازون ({pulledProducts.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/products?trader_id=${encodeURIComponent(targetTraderId)}`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-black cursor-pointer"
                >
                  فتح صفحة المنتجات
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-72 overflow-y-auto">
                <table className="w-full text-right text-[11px]">
                  <thead className="bg-slate-900 text-slate-300 font-black border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-2">المنتج</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">ASIN</th>
                      <th className="p-2 text-center">السعر</th>
                      <th className="p-2 text-center">المخزون</th>
                      <th className="p-2 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {pulledProducts.map((item, idx) => {
                      const hasNumericStock =
                        item.stock !== null &&
                        item.stock !== undefined &&
                        Number.isFinite(Number(item.stock));
                      return (
                        <tr key={`${item.sku}-${item.asin}-${idx}`} className="hover:bg-slate-900/50">
                          <td className="p-2 font-bold text-white max-w-[200px] truncate" title={item.title}>
                            {item.title}
                          </td>
                          <td className="p-2 font-mono text-amber-300" dir="ltr">
                            {item.sku}
                          </td>
                          <td className="p-2 font-mono text-sky-300" dir="ltr">
                            {item.asin || '—'}
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-white">
                            {Number(item.price || 0).toLocaleString()} ج.م
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-emerald-400">
                            {hasNumericStock ? item.stock : 'غير متوفر'}
                          </td>
                          <td className="p-2 text-center text-slate-300">
                            {item.status === 'active'
                              ? 'نشط'
                              : item.status === 'inactive'
                              ? 'غير نشط'
                              : item.status || 'نشط'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

          {/* Bottom SP-API Pull button when trader didn't have Refresh Token above, plus Settings link */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {!hasRefreshToken && (
              <button
                type="button"
                onClick={handleStartFetch}
                disabled={isFetching || isMaintenanceMode}
                className="w-full min-h-[42px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الاتصال بـ Amazon SP-API...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>سحب المنتجات</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/settings');
              }}
              className="w-full py-2 rounded-xl text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات مفاتيح SP-API العامة (Client ID / Secret / Application ID)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
