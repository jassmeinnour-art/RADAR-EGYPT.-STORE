import { useState, useEffect, useCallback } from 'react';
import { getAllRecordsFromDB, STORES } from '../utils/offlineIndexedDB';
import { getLastSyncSuccess, recordSyncSuccess, SYNC_SUCCESS_EVENT } from '../utils/syncSuccessTracker';

export interface OfflineStatus {
  isOffline: boolean;
  isOnline: boolean;
  cachedTasksCount: number;
  cachedMerchantsCount: number;
  lastSyncedAt: string | null;
  checkConnection: () => Promise<boolean>;
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
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    try {
      const rec = getLastSyncSuccess();
      if (rec?.formattedDateTime) return rec.formattedDateTime;
      return localStorage.getItem('radar_last_offline_sync_time');
    } catch {
      return null;
    }
  });

  const refreshOfflineCounts = useCallback(async () => {
    try {
      const cachedTasks = await getAllRecordsFromDB(STORES.TASKS);
      setCachedTasksCount(cachedTasks.length);

      const cachedMerchants = await getAllRecordsFromDB(STORES.MERCHANTS);
      setCachedMerchantsCount(cachedMerchants.length);
    } catch (err) {
      console.warn('[useOfflineStatus] Error reading IndexedDB counts:', err);
    }
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const onlineState = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Quick ping fallback if onlineState says true
    if (onlineState && typeof window !== 'undefined') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('/manifest.json', { method: 'HEAD', signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (res.ok) {
          setIsOffline(false);
          refreshOfflineCounts();
          return true;
        }
      } catch {
        // If fetch fails, we are likely offline or blocked
      }
    }

    setIsOffline(!onlineState);
    refreshOfflineCounts();
    return onlineState;
  }, [refreshOfflineCounts]);

  useEffect(() => {
    refreshOfflineCounts();

    const handleSyncSuccess = (event?: any) => {
      if (event?.detail?.formattedDateTime) {
        setLastSyncedAt(event.detail.formattedDateTime);
      } else {
        const latest = getLastSyncSuccess();
        if (latest?.formattedDateTime) {
          setLastSyncedAt(latest.formattedDateTime);
        }
      }
      refreshOfflineCounts();
    };

    const handleOnline = () => {
      setIsOffline(false);
      try {
        const record = recordSyncSuccess('network_online');
        setLastSyncedAt(record.formattedDateTime);
      } catch {
        // ignore
      }
      refreshOfflineCounts();
    };

    const handleOffline = () => {
      setIsOffline(true);
      refreshOfflineCounts();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(SYNC_SUCCESS_EVENT as any, handleSyncSuccess);
    window.addEventListener('SyncSuccess' as any, handleSyncSuccess);
    window.addEventListener('storage', handleSyncSuccess);

    // Periodic check every 30s
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(SYNC_SUCCESS_EVENT as any, handleSyncSuccess);
      window.removeEventListener('SyncSuccess' as any, handleSyncSuccess);
      window.removeEventListener('storage', handleSyncSuccess);
      clearInterval(interval);
    };
  }, [checkConnection, refreshOfflineCounts]);

  return {
    isOffline,
    isOnline: !isOffline,
    cachedTasksCount,
    cachedMerchantsCount,
    lastSyncedAt,
    checkConnection
  };
}
