import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  isFirestoreQuotaExhausted,
  OperationType,
} from '../db';
import { isDemoOrOrphanProduct, supabase } from '../lib/supabase';
import { logUserActivity } from '../services/userLogsService';
import { dataCache } from './dataCache';
import { isMaintenanceModeActive, MAINTENANCE_MODE_BLOCK_MESSAGE } from './maintenanceMode';

export type ImportSourceType = 'txt' | 'csv' | 'tsv' | 'xlsx' | 'xls' | 'sp_api';
export type ImportHistoryStatus = 'completed' | 'rolled_back';

export interface ImportUpdatedSnapshot {
  id: string;
  sku: string;
  title: string;
  previousPrice: number;
  previousStock: number;
  previousUpdatedAt?: string;
}

export interface ImportHistoryItemDetail {
  sku: string;
  title: string;
  asin: string;
  price: number;
  stock: number;
  previousPrice?: number;
  previousStock?: number;
  action: 'inserted' | 'updated';
  product_url?: string;
  condition?: string;
  image_url?: string;
}

export interface ImportErrorBreakdown {
  missingSku: number;
  blankOrInvalidRows: number;
  orphanOrBlocked: number;
  dbWriteErrors?: number;
}

export type ImportErrorCategory =
  | 'missing_sku'
  | 'blank_or_invalid'
  | 'orphan_or_blocked'
  | 'db_write_error'
  | 'other';

export interface ImportRowErrorDetail {
  rowNumber: number;
  sku?: string;
  title?: string;
  asin?: string;
  price?: number | string;
  stock?: number | string;
  errorCategory?: ImportErrorCategory;
  reason: string;
}

export interface ImportErrorLogExportRow extends ImportRowErrorDetail {
  fileName?: string;
  recordedAt?: string;
  importId?: string;
  traderName?: string;
}

export interface ImportSuccessRatioMetrics {
  totalAttempted: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  failureRate: number;
  breakdown: {
    missingSku: number;
    blankOrInvalidRows: number;
    orphanOrBlocked: number;
    dbWriteErrors: number;
    unclassified: number;
  };
}

export interface ImportHistoryEntry {
  id: string;
  fileName: string;
  fileType: ImportSourceType;
  fileSizeBytes?: number;
  traderId: string;
  traderName?: string;
  platform: string;
  createdAt: string;
  totalRead: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount?: number;
  errorBreakdown?: ImportErrorBreakdown;
  rowErrors?: ImportRowErrorDetail[];
  summaryMessage: string;
  status: ImportHistoryStatus;
  insertedProductIds: string[];
  updatedSnapshots: ImportUpdatedSnapshot[];
  itemsPreview: ImportHistoryItemDetail[];
  rolledBackAt?: string;
  rollbackResultMessage?: string;
  userEmail?: string;
}

export interface RollbackImportResult {
  success: boolean;
  message: string;
  deletedCount: number;
  restoredCount: number;
  entry?: ImportHistoryEntry;
}

export const IMPORT_HISTORY_STORAGE_KEY = 'radar_import_history_v1';
export const RADAR_IMPORT_HISTORY_UPDATED_EVENT = 'radar_import_history_updated';

const MAX_HISTORY_ENTRIES = 40;
const MAX_ITEMS_PREVIEW = 200;

export function detectImportSourceType(fileName?: string): ImportSourceType {
  const clean = String(fileName || '').trim().toLowerCase();
  if (!clean || clean.includes('sp-api') || clean.includes('sp_api')) {
    return 'sp_api';
  }
  if (clean.endsWith('.txt')) return 'txt';
  if (clean.endsWith('.tsv')) return 'tsv';
  if (clean.endsWith('.csv')) return 'csv';
  if (clean.endsWith('.xls')) return 'xls';
  if (clean.endsWith('.xlsx')) return 'xlsx';
  return 'txt';
}

export function formatImportFileTypeLabel(fileType: ImportSourceType): string {
  switch (fileType) {
    case 'txt':
      return 'TXT (Tab)';
    case 'tsv':
      return 'TSV';
    case 'csv':
      return 'CSV';
    case 'xlsx':
      return 'Excel (.xlsx)';
    case 'xls':
      return 'Excel (.xls)';
    case 'sp_api':
      return 'SP-API Sync';
    default:
      return String(fileType).toUpperCase();
  }
}

export function formatFileSizeLabel(bytes?: number): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) {
    return '—';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function generateImportHistoryId(): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
  return `imp-${uuid}`;
}

function dispatchImportHistoryUpdated(detail?: any): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(RADAR_IMPORT_HISTORY_UPDATED_EVENT, { detail }));
  }
}

export function getImportHistoryEntries(traderId?: string): ImportHistoryEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(IMPORT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed.filter(
      (item): item is ImportHistoryEntry =>
        Boolean(item && typeof item === 'object' && typeof item.id === 'string')
    );
    const sorted = [...normalized].sort(
      (a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || '')
    );
    if (traderId && traderId !== 'all') {
      return sorted.filter((entry) => entry.traderId === traderId);
    }
    return sorted;
  } catch {
    return [];
  }
}

export function saveImportHistoryEntries(entries: ImportHistoryEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  const trimmed = entries.slice(0, MAX_HISTORY_ENTRIES).map((entry) => ({
    ...entry,
    itemsPreview: Array.isArray(entry.itemsPreview)
      ? entry.itemsPreview.slice(0, MAX_ITEMS_PREVIEW)
      : [],
  }));

  try {
    localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // QuotaExceeded fallback: strip itemsPreview on older entries and cap to 15 entries
    try {
      const compact = trimmed.slice(0, 15).map((entry, idx) => ({
        ...entry,
        itemsPreview: idx === 0 ? entry.itemsPreview.slice(0, 50) : [],
      }));
      localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // Ignore storage failure
    }
  }
}

export interface RecordImportHistoryInput {
  fileName: string;
  fileType?: ImportSourceType;
  fileSizeBytes?: number;
  traderId: string;
  traderName?: string;
  platform: string;
  totalRead: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount?: number;
  errorBreakdown?: ImportErrorBreakdown;
  rowErrors?: ImportRowErrorDetail[];
  summaryMessage: string;
  insertedProductIds: string[];
  updatedSnapshots: ImportUpdatedSnapshot[];
  itemsPreview: ImportHistoryItemDetail[];
  createdAt?: string;
}

export function computeImportSuccessRatio(
  entries: ImportHistoryEntry[]
): ImportSuccessRatioMetrics {
  let successCount = 0;
  let failedCount = 0;
  let missingSku = 0;
  let blankOrInvalidRows = 0;
  let orphanOrBlocked = 0;
  let dbWriteErrors = 0;
  let unclassified = 0;

  entries.forEach((entry) => {
    const ok = Math.max(0, Number(entry.totalRead) || 0);
    const fail = Math.max(
      0,
      typeof entry.failedCount === 'number'
        ? entry.failedCount
        : Number(entry.skippedCount) || 0
    );
    successCount += ok;
    failedCount += fail;

    if (entry.errorBreakdown) {
      const mSku = Math.max(0, Number(entry.errorBreakdown.missingSku) || 0);
      const blank = Math.max(0, Number(entry.errorBreakdown.blankOrInvalidRows) || 0);
      const orphan = Math.max(0, Number(entry.errorBreakdown.orphanOrBlocked) || 0);
      const dbErr = Math.max(0, Number(entry.errorBreakdown.dbWriteErrors) || 0);
      missingSku += mSku;
      blankOrInvalidRows += blank;
      orphanOrBlocked += orphan;
      dbWriteErrors += dbErr;
      const categorized = mSku + blank + orphan + dbErr;
      if (fail > categorized) {
        unclassified += fail - categorized;
      }
    } else if (fail > 0) {
      unclassified += fail;
    }
  });

  const totalAttempted = successCount + failedCount;
  const successRate =
    totalAttempted > 0 ? Math.round((successCount / totalAttempted) * 1000) / 10 : 0;
  const failureRate =
    totalAttempted > 0 ? Math.round((100 - successRate) * 10) / 10 : 0;

  return {
    totalAttempted,
    successCount,
    failedCount,
    successRate,
    failureRate,
    breakdown: {
      missingSku,
      blankOrInvalidRows,
      orphanOrBlocked,
      dbWriteErrors,
      unclassified,
    },
  };
}

export function recordImportHistoryEntry(input: RecordImportHistoryInput): ImportHistoryEntry {
  const nowIso = input.createdAt || new Date().toISOString();
  const currentUid = auth?.currentUser?.uid;
  const currentEmail = auth?.currentUser?.email || 'jassmeinnour@gmail.com';
  const entryId = generateImportHistoryId();
  const resolvedFailedCount =
    typeof input.failedCount === 'number' ? input.failedCount : input.skippedCount;

  const entry: ImportHistoryEntry = {
    id: entryId,
    fileName: input.fileName || 'amazon-import.txt',
    fileType: input.fileType || detectImportSourceType(input.fileName),
    ...(typeof input.fileSizeBytes === 'number' ? { fileSizeBytes: input.fileSizeBytes } : {}),
    traderId: input.traderId,
    ...(input.traderName ? { traderName: input.traderName } : {}),
    platform: input.platform || 'amazon',
    createdAt: nowIso,
    totalRead: input.totalRead,
    newCount: input.newCount,
    updatedCount: input.updatedCount,
    skippedCount: input.skippedCount,
    failedCount: resolvedFailedCount,
    ...(input.errorBreakdown ? { errorBreakdown: input.errorBreakdown } : {}),
    ...(input.rowErrors && input.rowErrors.length > 0
      ? { rowErrors: input.rowErrors.slice(0, 300) }
      : {}),
    summaryMessage: input.summaryMessage,
    status: 'completed',
    insertedProductIds: [...input.insertedProductIds],
    updatedSnapshots: [...input.updatedSnapshots],
    itemsPreview: input.itemsPreview.slice(0, MAX_ITEMS_PREVIEW),
    userEmail: currentEmail,
  };

  const existing = getImportHistoryEntries();
  const nextList = [entry, ...existing.filter((item) => item.id !== entry.id)].slice(
    0,
    MAX_HISTORY_ENTRIES
  );
  saveImportHistoryEntries(nextList);
  dispatchImportHistoryUpdated(entry);

  // Non-blocking audit trail in user logs & Firestore (when Firebase Auth is active)
  try {
    void logUserActivity({
      actionType: 'csv_import',
      actionTitle: `استيراد ملف منتجات: ${entry.fileName}`,
      details: entry.summaryMessage,
      platform: entry.platform,
      status: 'success',
      metadata: {
        importHistoryEntry: {
          ...entry,
          // Keep Firestore audit doc comfortably within 1MB document limit
          itemsPreview: entry.itemsPreview.slice(0, 60),
          updatedSnapshots: entry.updatedSnapshots.slice(0, 120),
          insertedProductIds: entry.insertedProductIds.slice(0, 200),
          ...(entry.rowErrors ? { rowErrors: entry.rowErrors.slice(0, 100) } : {}),
        },
      },
    });
  } catch {
    // Non-blocking audit logging
  }

  if (currentUid && db && !isFirestoreQuotaExhausted()) {
    const logPath = `users/${currentUid}/activity_logs`;
    void setDoc(doc(db, logPath, entryId), {
      id: entryId,
      userId: currentUid,
      userEmail: currentEmail,
      userName: auth?.currentUser?.displayName || 'مؤسس النظام',
      actionType: 'csv_import',
      actionTitle: `استيراد ملف منتجات: ${entry.fileName}`,
      details: entry.summaryMessage,
      platform: entry.platform,
      status: 'success',
      createdAt: nowIso,
      firestoreCreatedAt: serverTimestamp(),
      metadata: {
        importHistoryEntry: {
          ...entry,
          itemsPreview: entry.itemsPreview.slice(0, 60),
          updatedSnapshots: entry.updatedSnapshots.slice(0, 120),
          insertedProductIds: entry.insertedProductIds.slice(0, 200),
          ...(entry.rowErrors ? { rowErrors: entry.rowErrors.slice(0, 100) } : {}),
        },
      },
    }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `${logPath}/${entryId}`);
    });
  }

  return entry;
}

/**
 * Hydrates import history from authenticated user's Firestore `activity_logs` if local cache is empty.
 */
export async function syncImportHistoryFromFirestoreIfEmpty(): Promise<ImportHistoryEntry[]> {
  const local = getImportHistoryEntries();
  if (local.length > 0) return local;

  const uid = auth?.currentUser?.uid;
  if (!uid || !db || isFirestoreQuotaExhausted()) {
    return local;
  }

  const logPath = `users/${uid}/activity_logs`;
  try {
    const q = query(collection(db, logPath), orderBy('createdAt', 'desc'), limit(40));
    const snap = await getDocs(q);
    const hydrated: ImportHistoryEntry[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const metaEntry = data?.metadata?.importHistoryEntry;
      if (metaEntry && typeof metaEntry === 'object' && typeof metaEntry.id === 'string') {
        hydrated.push(metaEntry as ImportHistoryEntry);
      }
    });

    if (hydrated.length > 0) {
      saveImportHistoryEntries(hydrated);
      dispatchImportHistoryUpdated();
    }
    return hydrated;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, logPath);
    return local;
  }
}

function purgeRolledBackProductsFromLocalStorage(
  traderId: string,
  deletedIds: string[],
  restoredSnapshots: ImportUpdatedSnapshot[],
  nowIso: string
): void {
  if (typeof localStorage === 'undefined') return;
  const storageKey = `radar_multi_tenant_products_${traderId}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const deletedSet = new Set(deletedIds);
    const restoreMap = new Map(restoredSnapshots.map((s) => [s.id, s]));

    const next = parsed
      .filter((p: any) => !deletedSet.has(String(p?.id || '')))
      .map((p: any) => {
        const snap = restoreMap.get(String(p?.id || ''));
        if (!snap) return p;
        return {
          ...p,
          price: snap.previousPrice,
          stock: snap.previousStock,
          updated_at: snap.previousUpdatedAt || nowIso,
        };
      })
      .filter((p: any) => !isDemoOrOrphanProduct(p));

    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

/**
 * Rolls back an import operation:
 * 1. Deletes newly inserted product IDs from `products` table (chunked in 50s).
 * 2. Restores previous `price`, `stock`, and `updated_at` on updated products (batched in 15s).
 * 3. Marks the history entry as `rolled_back` to prevent duplicate rollback.
 */
export async function rollbackImportOperation(importId: string): Promise<RollbackImportResult> {
  if (isMaintenanceModeActive()) {
    return {
      success: false,
      message: MAINTENANCE_MODE_BLOCK_MESSAGE,
      deletedCount: 0,
      restoredCount: 0,
    };
  }

  const entries = getImportHistoryEntries();
  const target = entries.find((e) => e.id === importId);
  if (!target) {
    return {
      success: false,
      message: 'لم يتم العثور على عملية الاستيراد المطلوبة في السجل',
      deletedCount: 0,
      restoredCount: 0,
    };
  }

  if (target.status === 'rolled_back') {
    return {
      success: false,
      message: 'تم التراجع عن هذه العملية مسبقاً ولا يمكن تكرار التراجع',
      deletedCount: 0,
      restoredCount: 0,
      entry: target,
    };
  }

  const nowIso = new Date().toISOString();
  let deletedCount = 0;
  let restoredCount = 0;

  // 1. Delete newly inserted products in chunks of 50
  const insertedIds = Array.isArray(target.insertedProductIds) ? target.insertedProductIds : [];
  const DELETE_CHUNK_SIZE = 50;
  for (let i = 0; i < insertedIds.length; i += DELETE_CHUNK_SIZE) {
    const chunk = insertedIds.slice(i, i + DELETE_CHUNK_SIZE);
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', chunk)
      .eq('trader_id', target.traderId);

    if (error) {
      throw new Error(error.message || 'تعذر حذف المنتجات الجديدة أثناء التراجع عن الاستيراد');
    }
    deletedCount += chunk.length;
  }

  // 2. Restore previous price and stock for updated products in batches of 15
  const snapshots = Array.isArray(target.updatedSnapshots) ? target.updatedSnapshots : [];
  const RESTORE_BATCH_SIZE = 15;
  for (let i = 0; i < snapshots.length; i += RESTORE_BATCH_SIZE) {
    const batch = snapshots.slice(i, i + RESTORE_BATCH_SIZE);
    await Promise.all(
      batch.map(async (snap) => {
        const { error } = await supabase
          .from('products')
          .update({
            price: snap.previousPrice,
            stock: snap.previousStock,
            updated_at: snap.previousUpdatedAt || nowIso,
          })
          .eq('id', snap.id);

        if (error) {
          throw new Error(error.message || `تعذر استعادة السعر والمخزون للمنتج ${snap.sku}`);
        }
        restoredCount += 1;
      })
    );
  }

  purgeRolledBackProductsFromLocalStorage(target.traderId, insertedIds, snapshots, nowIso);

  const rollbackResultMessage = `تم التراجع عن استيراد "${target.fileName}" — تم حذف ${deletedCount} منتج جديد واستعادة ${restoredCount} منتج محدّث`;

  const updatedEntry: ImportHistoryEntry = {
    ...target,
    status: 'rolled_back',
    rolledBackAt: nowIso,
    rollbackResultMessage,
  };

  const nextEntries = entries.map((item) => (item.id === target.id ? updatedEntry : item));
  saveImportHistoryEntries(nextEntries);

  dataCache.invalidate('products_');
  dataCache.invalidate('traders');

  dispatchImportHistoryUpdated(updatedEntry);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('multi_tenant_products_updated', {
        detail: { traderId: target.traderId, rollbackImportId: target.id },
      })
    );
  }

  try {
    void logUserActivity({
      actionType: 'delete',
      actionTitle: `التراجع عن استيراد: ${target.fileName}`,
      details: rollbackResultMessage,
      platform: target.platform,
      status: 'warning',
      metadata: {
        rollbackOfImportId: target.id,
        deletedCount,
        restoredCount,
      },
    });
  } catch {
    // Non-blocking audit logging
  }

  const uid = auth?.currentUser?.uid;
  if (uid && db && !isFirestoreQuotaExhausted()) {
    const logPath = `users/${uid}/activity_logs`;
    void setDoc(doc(db, logPath, target.id), {
      id: target.id,
      userId: uid,
      userEmail: auth?.currentUser?.email || target.userEmail || 'jassmeinnour@gmail.com',
      actionType: 'csv_import',
      actionTitle: `تم التراجع عن استيراد: ${target.fileName}`,
      details: rollbackResultMessage,
      platform: target.platform,
      status: 'warning',
      createdAt: target.createdAt,
      firestoreCreatedAt: serverTimestamp(),
      metadata: {
        importHistoryEntry: {
          ...updatedEntry,
          itemsPreview: updatedEntry.itemsPreview.slice(0, 60),
          updatedSnapshots: updatedEntry.updatedSnapshots.slice(0, 120),
          insertedProductIds: updatedEntry.insertedProductIds.slice(0, 200),
        },
      },
    }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `${logPath}/${target.id}`);
    });
  }

  return {
    success: true,
    message: rollbackResultMessage,
    deletedCount,
    restoredCount,
    entry: updatedEntry,
  };
}

function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  const safeFormula = /^[=+\-@]/.test(str) ? `'${str}` : str;
  if (/[",\r\n]/.test(safeFormula)) {
    return `"${safeFormula.replace(/"/g, '""')}"`;
  }
  return safeFormula;
}

/**
 * Builds a UTF-8 BOM CSV containing Amazon Seller Central retry-compatible product columns
 * (`seller-sku`, `item-name`, `asin`, `price`, `quantity`) plus error audit columns
 * so the user can fix failed rows in Excel and re-upload directly.
 */
export function buildImportErrorsCsv(rows: ImportErrorLogExportRow[]): string {
  const headers = [
    'seller-sku',
    'item-name',
    'asin',
    'price',
    'quantity',
    'error-reason',
    'row-number',
    'source-file',
    'recorded-at',
  ];

  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(
      [
        escapeCsvCell(row.sku || ''),
        escapeCsvCell(row.title || ''),
        escapeCsvCell(row.asin || ''),
        escapeCsvCell(row.price ?? ''),
        escapeCsvCell(row.stock ?? ''),
        escapeCsvCell(row.reason || ''),
        escapeCsvCell(row.rowNumber ?? ''),
        escapeCsvCell(row.fileName || ''),
        escapeCsvCell(row.recordedAt || ''),
      ].join(',')
    );
  });

  return `\uFEFF${lines.join('\r\n')}`;
}

export function downloadImportErrorsCsv(
  rows: ImportErrorLogExportRow[],
  sourceFileName?: string
): { fileName: string; count: number; csvContent: string } {
  const csvContent = buildImportErrorsCsv(rows);
  const dateTag = new Date().toISOString().slice(0, 10);
  const safeBase = sourceFileName
    ? sourceFileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]+/g, '-')
    : 'all';
  const fileName = `import-errors-retry-${safeBase}-${dateTag}.csv`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { fileName, count: rows.length, csvContent };
}

