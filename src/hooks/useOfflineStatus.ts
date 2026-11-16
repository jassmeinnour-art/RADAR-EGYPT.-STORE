import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getAllRecordsFromDB, STORES } from '../utils/offlineIndexedDB';
import { getLastSyncSuccess, recordSyncSuccess, SYNC_SUCCESS_EVENT } from '../utils/syncSuccessTracker';
import {
  getOfflineActionQueue,
  getLocallySavedProducts,
  syncPendingOfflineActions,
  isBackgroundSyncApiSupported,
  OFFLINE_SYNC_TAG,
  RADAR_OFFLINE_QUEUE_UPDATED_EVENT,
  RADAR_OFFLINE_PRODUCTS_SYNCED_EVENT,
  OfflineQueuedAction,
  QueueSyncSummary,
} from '../utils/offlineActionQueue';
import {
  registerBackgroundSyncSafely,
  isSyncTagRegistered,
  SyncRegistrationResult,
} from '../utils/backgroundSyncManager';

export type BackgroundSyncStatus = 'registered' | 'unsupported' | 'pending' | 'idle';
export type OfflineSyncState = 'idle' | 'queued' | 'syncing' | 'synced' | 'error';

export interface OfflineStatus {
  isOffline: boolean;
  isOnline: boolean;
  cachedTasksCount: number;
  cachedMerchantsCount: number;
  cachedProductsCount: number;
  pendingActionsCount: number;
  failedActionsCount: number;
  pendingActions: OfflineQueuedAction[];
  isBackgroundSyncSupported: boolean;
  isServiceWorkerReady: boolean;
  backgroundSyncStatus: BackgroundSyncStatus;
  syncState: OfflineSyncState;
  lastSyncError: string | null;
  isSyncingQueue: boolean;
  lastSyncedQueueCount: number;
  lastSyncedAt: string | null;
  checkConnection: () => Promise<boolean>;
  syncNow: () => Promise<QueueSyncSummary>;
  enableBackgroundSync: () => Promise<SyncRegistrationResult>;
  refreshOfflineData: () => Promise<void>;
}

export function useOfflineStatus(): OfflineStatus {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return !navigator.onLine;
    }
    return false;
  });

  const [cachedTasksCount, setCachedTasksCount] = useState<number>(0);
  const [cachedMerchantsCount, setCachedMerchantsCount] = useState<number>(0);
  const [cachedProductsCount, setCachedProductsCount] = useState<number>(0);
  const [pendingActions, setPendingActions] = useState<OfflineQueuedAction[]>([]);
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);
  const [lastSyncedQueueCount, setLastSyncedQueueCount] = useState<number>(0);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller);
  });

  const isBgSyncSupported = isBackgroundSyncApiSupported();
  const [backgroundSyncStatus, setBackgroundSyncStatus] = useState<BackgroundSyncStatus>(() =>
    isBgSyncSupported ? 'idle' : 'unsupported'
  );

  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    try {
      const rec = getLastSyncSuccess();
      if (rec?.formattedDateTime) return rec.formattedDateTime;
      return localStorage.getItem('radar_last_offline_sync_time');
    } catch {
      return null;
    }
  });

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshOfflineData = useCallback(async () => {
    try {
      const [cachedTasks, cachedMerchants, queue, savedProducts] = await Promise.all([
        getAllRecordsFromDB(STORES.TASKS),
        getAllRecordsFromDB(STORES.MERCHANTS),
        getOfflineActionQueue(),
        getLocallySavedProducts(),
      ]);

      if (!isMountedRef.current) return;

      setCachedTasksCount(cachedTasks.length);
      setCachedMerchantsCount(cachedMerchants.length);
      setPendingActions(queue);
      setCachedProductsCount(savedProducts.length);

      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (isMountedRef.current) {
            setIsServiceWorkerReady(Boolean(reg || navigator.serviceWorker.controller));
          }
        } catch {
          // ignore
        }
      }

      if (isBackgroundSyncApiSupported()) {
        const alreadyRegistered = await isSyncTagRegistered(OFFLINE_SYNC_TAG);
        if (!isMountedRef.current) return;
        if (alreadyRegistered) {
          setBackgroundSyncStatus('registered');
        } else if (queue.length > 0) {
          setBackgroundSyncStatus('pending');
        }
      } else {
        setBackgroundSyncStatus('unsupported');
      }
    } catch (err) {
      console.warn('[useOfflineStatus] Error reading offline store counts:', err);
    }
  }, []);

  const syncNow = useCallback(async (): Promise<QueueSyncSummary> => {
    setIsSyncingQueue(true);
    try {
      const result = await syncPendingOfflineActions();
      if (isMountedRef.current) {
        if (result.synced > 0) {
          setLastSyncedQueueCount(result.synced);
          const latest = getLastSyncSuccess();
          if (latest?.formattedDateTime) {
            setLastSyncedAt(latest.formattedDateTime);
          }
        }
        await refreshOfflineData();
      }
      return result;
    } finally {
      if (isMountedRef.current) {
        setIsSyncingQueue(false);
      }
    }
  }, [refreshOfflineData]);

  const enableBackgroundSync = useCallback(async (): Promise<SyncRegistrationResult> => {
    const res = await registerBackgroundSyncSafely(OFFLINE_SYNC_TAG, () =>
      syncNow().then(() => undefined)
    );
    if (isMountedRef.current) {
      if (res.supported && res.registered) {
        setBackgroundSyncStatus('registered');
      } else if (!res.supported) {
        setBackgroundSyncStatus('unsupported');
      }
    }
    return res;
  }, [syncNow]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const onlineState = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (onlineState && typeof window !== 'undefined') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('/manifest.json', { method: 'HEAD', signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (res.ok) {
          if (isMountedRef.current) setIsOffline(false);
          const queue = await getOfflineActionQueue();
          if (queue.length > 0) {
            await syncNow();
          } else {
            await refreshOfflineData();
          }
          return true;
        }
      } catch {
        // If fetch fails, we are likely offline or blocked
      }
    }

    if (isMountedRef.current) setIsOffline(!onlineState);
    await refreshOfflineData();
    return onlineState;
  }, [refreshOfflineData, syncNow]);

  useEffect(() => {
    const init = async () => {
      await refreshOfflineData();
      const queue = await getOfflineActionQueue();
      const isOnlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (isOnlineNow && queue.length > 0) {
        await syncNow();
      } else if ((!isOnlineNow || queue.length > 0) && isBackgroundSyncApiSupported()) {
        await enableBackgroundSync();
      }
    };
    void init();

    const handleSyncSuccess = (event?: any) => {
      if (event?.detail?.formattedDateTime) {
        setLastSyncedAt(event.detail.formattedDateTime);
      } else {
        const latest = getLastSyncSuccess();
        if (latest?.formattedDateTime) {
          setLastSyncedAt(latest.formattedDateTime);
        }
      }
      void refreshOfflineData();
    };

    const handleOnline = () => {
      setIsOffline(false);
      try {
        const record = recordSyncSuccess('network_online');
        setLastSyncedAt(record.formattedDateTime);
      } catch {
        // ignore
      }
      void syncNow();
    };

    const handleOffline = () => {
      setIsOffline(true);
      void refreshOfflineData();
      if (isBackgroundSyncApiSupported()) {
        void enableBackgroundSync();
      }
    };

    const handleQueueUpdated = () => {
      void refreshOfflineData();
    };

    const handleProductsSynced = (event: any) => {
      const syncedCount = Number(event?.detail?.synced || 0);
      if (syncedCount > 0) {
        setLastSyncedQueueCount(syncedCount);
      }
      void refreshOfflineData();
    };

    const handleRetriggerAutoSync = () => {
      void syncNow();
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const msgType = event.data?.type;
      if (msgType === 'ONLINE_STATUS_CHANGE') {
        if (event.data.isOnline) {
          setIsOffline(false);
          try {
            const record = recordSyncSuccess('sw_network_online');
            setLastSyncedAt(record.formattedDateTime);
          } catch {
            // ignore
          }
          window.dispatchEvent(new CustomEvent('retrigger_auto_sync', { detail: event.data }));
          void syncNow();
        } else {
          setIsOffline(true);
          void refreshOfflineData();
        }
      } else if (msgType === 'BACKGROUND_SYNC_STARTED' || msgType === 'DATABASE_SYNC_STARTED') {
        setIsSyncingQueue(true);
      } else if (msgType === 'BACKGROUND_SYNC_TRIGGERED') {
        setIsOffline(false);
        void syncNow();
      } else if (msgType === 'BACKGROUND_SYNC_COMPLETED' || msgType === 'DATABASE_SYNC_SUCCESS') {
        setIsSyncingQueue(false);
        const synced = Number(event.data?.synced || 0);
        if (synced > 0) {
          setLastSyncedQueueCount(synced);
        }
        void refreshOfflineData();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(SYNC_SUCCESS_EVENT as any, handleSyncSuccess);
    window.addEventListener('SyncSuccess' as any, handleSyncSuccess);
    window.addEventListener(RADAR_OFFLINE_QUEUE_UPDATED_EVENT as any, handleQueueUpdated);
    window.addEventListener(RADAR_OFFLINE_PRODUCTS_SYNCED_EVENT as any, handleProductsSynced);
    window.addEventListener('retrigger_auto_sync', handleRetriggerAutoSync);
    window.addEventListener('storage', handleSyncSuccess);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    const interval = setInterval(() => {
      void checkConnection();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(SYNC_SUCCESS_EVENT as any, handleSyncSuccess);
      window.removeEventListener('SyncSuccess' as any, handleSyncSuccess);
      window.removeEventListener(RADAR_OFFLINE_QUEUE_UPDATED_EVENT as any, handleQueueUpdated);
      window.removeEventListener(RADAR_OFFLINE_PRODUCTS_SYNCED_EVENT as any, handleProductsSynced);
      window.removeEventListener('retrigger_auto_sync', handleRetriggerAutoSync);
      window.removeEventListener('storage', handleSyncSuccess);
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      clearInterval(interval);
    };
  }, [checkConnection, enableBackgroundSync, refreshOfflineData, syncNow]);

  const failedActions = useMemo(
    () => pendingActions.filter((a) => a.status === 'failed'),
    [pendingActions]
  );

  const syncState: OfflineSyncState = useMemo(() => {
    if (isSyncingQueue) return 'syncing';
    if (failedActions.length > 0) return 'error';
    if (pendingActions.length > 0) return 'queued';
    if (lastSyncedQueueCount > 0) return 'synced';
    return 'idle';
  }, [failedActions.length, isSyncingQueue, lastSyncedQueueCount, pendingActions.length]);

  const lastSyncError = failedActions[0]?.errorMessage || null;

  return {
    isOffline,
    isOnline: !isOffline,
    cachedTasksCount,
    cachedMerchantsCount,
    cachedProductsCount,
    pendingActionsCount: pendingActions.length,
    failedActionsCount: failedActions.length,
    pendingActions,
    isBackgroundSyncSupported: isBgSyncSupported,
    isServiceWorkerReady,
    backgroundSyncStatus,
    syncState,
    lastSyncError,
    isSyncingQueue,
    lastSyncedQueueCount,
    lastSyncedAt,
    checkConnection,
    syncNow,
    enableBackgroundSync,
    refreshOfflineData,
  };
}
