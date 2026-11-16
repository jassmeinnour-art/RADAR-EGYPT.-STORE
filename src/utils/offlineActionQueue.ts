import { supabase, Product, getSupabaseSyncConfig } from '../lib/supabase';
import { dataCache } from './dataCache';
import {
  STORES,
  getAllRecordsFromDB,
  getRecordFromDB,
  saveAllRecordsToDB,
  saveRecordToDB,
} from './offlineIndexedDB';
import {
  registerBackgroundSyncSafely,
  SyncRegistrationResult,
} from './backgroundSyncManager';
import { recordSyncSuccess } from './syncSuccessTracker';

export const OFFLINE_ACTION_QUEUE_STORAGE_KEY = 'radar_offline_action_queue_v1';
export const OFFLINE_PRODUCTS_CACHE_STORAGE_KEY = 'radar_cached_products_v1';
export const OFFLINE_QUEUE_DB_RECORD_ID = 'offline_pending_actions_v1';
export const OFFLINE_PRODUCTS_DB_RECORD_ID = 'offline_cached_products_snapshot_v1';
export const SW_SYNC_CONFIG_DB_RECORD_ID = 'sw_sync_config_v1';
export const OFFLINE_SYNC_TAG = 'sync-offline-actions';

export const RADAR_OFFLINE_QUEUE_UPDATED_EVENT = 'radar_offline_queue_updated';
export const RADAR_OFFLINE_PRODUCTS_SYNCED_EVENT = 'radar_offline_products_synced';

export type OfflineActionType = 'add_product' | 'update_product' | 'custom';

export interface OfflineActionPayload {
  title: string;
  sku: string;
  price: number;
  stock: number;
  platform: string;
  trader_id: string;
  created_at?: string;
  id?: string;
  image?: string;
  [key: string]: any;
}

export interface OfflineQueuedAction {
  id: string;
  type: OfflineActionType;
  label: string;
  payload: OfflineActionPayload;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  errorMessage?: string;
}

export interface LocallySavedProduct extends Product {
  isPendingSync?: boolean;
  offlineActionId?: string;
  cachedAt?: string;
}

export interface QueueSyncSummary {
  synced: number;
  failed: number;
  remaining: number;
  timestamp: string;
}

function readQueueFromLocalStorage(): OfflineQueuedAction[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_ACTION_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueueToLocalStorage(queue: OfflineQueuedAction[]): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(OFFLINE_ACTION_QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[OfflineActionQueue] Failed writing queue to localStorage:', err);
  }
}

function emitQueueUpdated(queue: OfflineQueuedAction[]): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(RADAR_OFFLINE_QUEUE_UPDATED_EVENT, {
      detail: { count: queue.length, actions: queue },
    })
  );
}

/**
 * Checks whether the browser supports native Service Worker + Background Sync API (SyncManager)
 */
export function isBackgroundSyncApiSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'SyncManager' in window
  );
}

/**
 * Loads all pending offline actions from IndexedDB and localStorage safely
 */
export async function getOfflineActionQueue(): Promise<OfflineQueuedAction[]> {
  const localItems = readQueueFromLocalStorage();
  try {
    const dbItems = await getRecordFromDB<OfflineQueuedAction[]>(
      STORES.APP_STATE,
      OFFLINE_QUEUE_DB_RECORD_ID
    );
    if (Array.isArray(dbItems) && dbItems.length > 0) {
      // Merge unique items by id, preferring the newer/IndexedDB list + any unsaved localStorage items
      const map = new Map<string, OfflineQueuedAction>();
      localItems.forEach((item) => map.set(item.id, item));
      dbItems.forEach((item) => map.set(item.id, item));
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch {
    // Fallback cleanly to localStorage
  }
  return localItems;
}

async function persistOfflineQueue(queue: OfflineQueuedAction[]): Promise<void> {
  writeQueueToLocalStorage(queue);
  await saveRecordToDB(STORES.APP_STATE, OFFLINE_QUEUE_DB_RECORD_ID, queue);
  emitQueueUpdated(queue);
}

export async function saveSyncConfigForServiceWorker(): Promise<void> {
  try {
    if (typeof getSupabaseSyncConfig !== 'function') return;
    const cfg = getSupabaseSyncConfig();
    if (cfg?.url && cfg?.anonKey) {
      await saveRecordToDB(STORES.APP_STATE, SW_SYNC_CONFIG_DB_RECORD_ID, cfg);
    }
  } catch {
    // non-blocking
  }
}

/**
 * Queues an offline user action (e.g., adding a product) in IndexedDB + localStorage
 * and registers a Background Sync event when supported.
 */
export async function queueOfflineAction(params: {
  type: OfflineActionType;
  label: string;
  payload: OfflineActionPayload;
}): Promise<{
  action: OfflineQueuedAction;
  syncRegistration: SyncRegistrationResult;
}> {
  const current = await getOfflineActionQueue();
  const newAction: OfflineQueuedAction = {
    id: `offline_act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: params.type,
    label: params.label,
    payload: {
      ...params.payload,
      created_at: params.payload.created_at || new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };

  const nextQueue = [newAction, ...current];
  await persistOfflineQueue(nextQueue);
  await saveSyncConfigForServiceWorker();

  if (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    navigator.serviceWorker.controller
  ) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'QUEUE_OFFLINE_ACTION',
        tag: OFFLINE_SYNC_TAG,
        action: newAction,
      });
    } catch {
      // safe
    }
  }

  const syncRegistration = await registerBackgroundSyncSafely(OFFLINE_SYNC_TAG, () =>
    syncPendingOfflineActions().then(() => undefined)
  );

  return { action: newAction, syncRegistration };
}

/**
 * Removes a single queued offline action by id
 */
export async function removeOfflineQueuedAction(actionId: string): Promise<OfflineQueuedAction[]> {
  const current = await getOfflineActionQueue();
  const next = current.filter((item) => item.id !== actionId);
  await persistOfflineQueue(next);
  return next;
}

/**
 * Persists a local product snapshot to IndexedDB + localStorage for instant offline viewing
 */
export async function cacheProductsLocally(products: Product[]): Promise<void> {
  if (!Array.isArray(products)) return;
  const normalized = products.filter((p) => p && (p.id || p.sku));

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      // Merge with previously cached products so partial pages accumulate safely (capped at 200 items)
      const existingRaw = localStorage.getItem(OFFLINE_PRODUCTS_CACHE_STORAGE_KEY);
      const existing: LocallySavedProduct[] = existingRaw ? JSON.parse(existingRaw) : [];
      const mergedMap = new Map<string, LocallySavedProduct>();
      if (Array.isArray(existing)) {
        existing.forEach((p) => {
          const key = p.id || `${p.sku}_${p.trader_id || ''}`;
          if (key) mergedMap.set(key, p);
        });
      }
      const nowIso = new Date().toISOString();
      normalized.forEach((p) => {
        const key = p.id || `${p.sku}_${p.trader_id || ''}`;
        if (key) {
          mergedMap.set(key, {
            ...p,
            cachedAt: nowIso,
            isPendingSync: false,
          });
        }
      });
      const finalSnapshot = Array.from(mergedMap.values()).slice(0, 200);
      localStorage.setItem(OFFLINE_PRODUCTS_CACHE_STORAGE_KEY, JSON.stringify(finalSnapshot));
    } catch (err) {
      console.warn('[OfflineActionQueue] Failed saving product snapshot to localStorage:', err);
    }
  }

  try {
    const dbReady = normalized.map((p, idx) => ({
      ...p,
      id: p.id || `local_${p.sku}_${idx}`,
    }));
    await saveRecordToDB(STORES.APP_STATE, OFFLINE_PRODUCTS_DB_RECORD_ID, dbReady);
    if (dbReady.length > 0) {
      await saveAllRecordsToDB(STORES.CATALOG, dbReady);
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Returns all locally saved products (combining IndexedDB, localStorage snapshots,
 * and offline-queued pending products).
 */
export async function getLocallySavedProducts(): Promise<LocallySavedProduct[]> {
  const map = new Map<string, LocallySavedProduct>();

  // 1. Read pending offline-added products first (highest priority badge)
  const queue = await getOfflineActionQueue();
  queue.forEach((act) => {
    if (act.type === 'add_product' && act.payload) {
      const p = act.payload;
      const pendingId = p.id || act.id;
      map.set(`pending_${act.id}`, {
        id: pendingId,
        trader_id: String(p.trader_id || 'offline'),
        title: String(p.title || act.label || 'منتج محفوظ محلياً'),
        sku: String(p.sku || 'OFFLINE-SKU'),
        price: Number(p.price || 0),
        stock: Number(p.stock || 0),
        platform: String(p.platform || 'amazon'),
        image: p.image,
        created_at: p.created_at || act.createdAt,
        isPendingSync: true,
        offlineActionId: act.id,
        cachedAt: act.createdAt,
      });
    }
  });

  // 2. Read localStorage snapshot
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(OFFLINE_PRODUCTS_CACHE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any, idx: number) => {
            if (item && (item.title || item.sku)) {
              const key = item.id || `ls_${item.sku || idx}`;
              if (!map.has(key)) {
                map.set(key, {
                  ...item,
                  id: item.id || key,
                  isPendingSync: false,
                });
              }
            }
          });
        }
      }
    } catch {
      // safe
    }
  }

  // 3. Read IndexedDB snapshot & catalog records
  try {
    const dbSnapshot = await getRecordFromDB<LocallySavedProduct[]>(
      STORES.APP_STATE,
      OFFLINE_PRODUCTS_DB_RECORD_ID
    );
    if (Array.isArray(dbSnapshot)) {
      dbSnapshot.forEach((item, idx) => {
        if (item && (item.title || item.sku)) {
          const key = item.id || `idb_snap_${item.sku || idx}`;
          if (!map.has(key)) {
            map.set(key, { ...item, id: item.id || key, isPendingSync: false });
          }
        }
      });
    }

    const dbCatalog = await getAllRecordsFromDB<any>(STORES.CATALOG);
    dbCatalog.forEach((entry, idx) => {
      if (Array.isArray(entry)) {
        entry.forEach((sub, subIdx) => {
          if (sub && (sub.title || sub.sku)) {
            const key = sub.id || `idb_arr_${idx}_${subIdx}`;
            if (!map.has(key)) {
              map.set(key, {
                id: key,
                trader_id: String(sub.trader_id || sub.merchantId || 'cached'),
                title: String(sub.title || sub.name || 'منتج محفوظ'),
                sku: String(sub.sku || sub.asin || key),
                price: Number(sub.price ?? sub.merchantPrice ?? 0),
                stock: Number(sub.stock ?? 0),
                platform: String(sub.platform || 'amazon'),
                image: sub.image,
                created_at: sub.created_at,
                isPendingSync: false,
              });
            }
          }
        });
      } else if (entry && (entry.title || entry.sku || entry.name)) {
        const key = entry.id || `idb_${entry.sku || idx}`;
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            trader_id: String(entry.trader_id || entry.merchantId || 'cached'),
            title: String(entry.title || entry.name || 'منتج محفوظ'),
            sku: String(entry.sku || entry.asin || key),
            price: Number(entry.price ?? entry.merchantPrice ?? 0),
            stock: Number(entry.stock ?? 0),
            platform: String(entry.platform || 'amazon'),
            image: entry.image,
            created_at: entry.created_at,
            isPendingSync: false,
          });
        }
      }
    });
  } catch {
    // safe fallback
  }

  return Array.from(map.values());
}

let activeSyncPromise: Promise<QueueSyncSummary> | null = null;

/**
 * Synchronizes all pending offline actions sequentially with Supabase when connection returns.
 * Uses an in-flight promise lock so concurrent triggers never duplicate Supabase inserts.
 */
export async function syncPendingOfflineActions(): Promise<QueueSyncSummary> {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async (): Promise<QueueSyncSummary> => {
    const queue = await getOfflineActionQueue();
    if (queue.length === 0) {
      return {
        synced: 0,
        failed: 0,
        remaining: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const isNavigatorOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isNavigatorOnline) {
      return {
        synced: 0,
        failed: 0,
        remaining: queue.length,
        timestamp: new Date().toISOString(),
      };
    }

    let synced = 0;
    let failed = 0;
    const remaining: OfflineQueuedAction[] = [];

    // Sync oldest actions first so chronological order is preserved
    const chronological = [...queue].reverse();

    for (const action of chronological) {
      try {
        if (action.type === 'add_product') {
          const { id: _localId, isPendingSync: _flag, ...insertPayload } = action.payload;
          const { error } = await supabase.from('products').insert([insertPayload]);
          if (error) throw error;
          synced += 1;
        } else {
          // Dispatch generic custom action event for extensible handlers
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('radar_execute_offline_custom_action', { detail: action })
            );
          }
          synced += 1;
        }
      } catch (err: any) {
        failed += 1;
        remaining.unshift({
          ...action,
          status: 'failed',
          retryCount: (action.retryCount || 0) + 1,
          errorMessage: err?.message || 'فشل المزامنة مع الخادم',
        });
      }
    }

    await persistOfflineQueue(remaining);

    if (synced > 0) {
      dataCache.invalidate('products_');
      try {
        recordSyncSuccess('offline_queue_sync');
      } catch {
        // safe
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(RADAR_OFFLINE_PRODUCTS_SYNCED_EVENT, {
            detail: { synced, failed, remaining: remaining.length },
          })
        );
      }
    }

    return {
      synced,
      failed,
      remaining: remaining.length,
      timestamp: new Date().toISOString(),
    };
  })().finally(() => {
    activeSyncPromise = null;
  });

  return activeSyncPromise;
}
