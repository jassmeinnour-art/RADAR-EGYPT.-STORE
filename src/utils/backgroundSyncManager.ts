/**
 * Background Sync & Fallback Utility Manager
 * Provides feature-detected, safe Background Sync (SyncManager) and Periodic Sync registration.
 * Ensures 100% compatibility and zero console errors on unsupported browsers like iOS Safari & Firefox.
 */

export interface SyncRegistrationResult {
  supported: boolean;
  registered: boolean;
  method: 'background-sync' | 'foreground-fallback' | 'online-listener';
  error?: string;
}

// Global fallback registry for offline actions queued when SyncManager is unavailable
const pendingFallbackQueue: Array<{ tag: string; action: () => Promise<void> | void }> = [];
let onlineListenerAttached = false;

function ensureOnlineListener() {
  if (onlineListenerAttached || typeof window === 'undefined') return;
  onlineListenerAttached = true;

  window.addEventListener('online', async () => {
    console.log('[BackgroundSyncManager] Connection restored. Processing queued fallback actions...');
    const queueToProcess = [...pendingFallbackQueue];
    pendingFallbackQueue.length = 0; // Clear queue

    for (const item of queueToProcess) {
      try {
        await item.action();
        console.log(`[BackgroundSyncManager] Fallback action for tag "${item.tag}" executed successfully.`);
      } catch (err) {
        console.warn(`[BackgroundSyncManager] Fallback action for tag "${item.tag}" failed:`, err);
      }
    }
  });
}

/**
 * Checks if SyncManager is natively supported by the browser & service worker
 */
export function isSyncManagerSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'SyncManager' in window &&
    'serviceWorker' in navigator &&
    Boolean(navigator.serviceWorker.controller)
  );
}

/**
 * Checks if Periodic Background Sync is supported
 */
export function isPeriodicSyncSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'periodicSync' in ServiceWorkerRegistration.prototype
  );
}

/**
 * Safely registers a Background Sync event with feature detection and Safari/Firefox fallback.
 *
 * @param tag The tag for the sync event (e.g., 'sync-messages', 'sync-data', 'radar-price-sync')
 * @param fallbackFn The fallback function to run if SyncManager is not supported or registration fails
 */
export async function registerBackgroundSyncSafely(
  tag: string,
  fallbackFn?: () => Promise<void> | void
): Promise<SyncRegistrationResult> {
  ensureOnlineListener();

  // 1. Feature Detection Check
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Double check sync object exists on registration
      if (registration && 'sync' in registration && typeof (registration as any).sync.register === 'function') {
        await (registration as any).sync.register(tag);
        console.log(`[BackgroundSyncManager] Background sync registered successfully for tag: "${tag}"`);
        return {
          supported: true,
          registered: true,
          method: 'background-sync'
        };
      }
    } catch (err) {
      console.warn(`[BackgroundSyncManager] SyncManager registration failed for tag "${tag}", switching to fallback:`, err);
    }
  }

  // 2. Safe Fallback for Unsupported Browsers (iOS Safari / Firefox / Desktop Safari)
  if (fallbackFn) {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (isOnline) {
      try {
        await fallbackFn();
        return {
          supported: false,
          registered: true,
          method: 'foreground-fallback'
        };
      } catch (err) {
        return {
          supported: false,
          registered: false,
          method: 'foreground-fallback',
          error: String(err)
        };
      }
    } else {
      // Offline on Safari/Firefox: Queue fallback to execute when online event fires
      pendingFallbackQueue.push({ tag, action: fallbackFn });
      return {
        supported: false,
        registered: true,
        method: 'online-listener'
      };
    }
  }

  return {
    supported: false,
    registered: false,
    method: 'foreground-fallback'
  };
}

/**
 * Safely queries if a sync tag is already registered on the active ServiceWorker
 */
export async function isSyncTagRegistered(tag: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('SyncManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration && 'sync' in registration && typeof (registration as any).sync.getTags === 'function') {
      const tags: string[] = await (registration as any).sync.getTags();
      return Array.isArray(tags) && tags.includes(tag);
    }
  } catch (err) {
    console.warn('[BackgroundSyncManager] Could not retrieve sync tags:', err);
  }

  return false;
}

/**
 * Safely registers Periodic Background Sync with permission checks & Safari/Firefox fallback
 */
export async function registerPeriodicSyncSafely(
  tag: string,
  minIntervalMs: number = 24 * 60 * 60 * 1000,
  fallbackFn?: () => Promise<void> | void
): Promise<SyncRegistrationResult> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

        // Query the user for permission.
        let periodicSyncPermission = { state: 'granted' };
        if ('permissions' in navigator && typeof navigator.permissions.query === 'function') {
          try {
            periodicSyncPermission = await navigator.permissions.query({
              name: 'periodic-background-sync' as any,
            });
          } catch {
            // Permission query name unsupported in some browsers
          }
        }

        // Check if permission was properly granted.
        if (periodicSyncPermission.state == 'granted') {

          // Register a new periodic sync.
          await (registration as any).periodicSync.register(tag, {
            // Set the sync to happen no more than once a day.
            minInterval: minIntervalMs
          });
          console.log(`[BackgroundSyncManager] Periodic background sync registered for tag "${tag}"`);
          return {
            supported: true,
            registered: true,
            method: 'background-sync'
          };
        }
    } catch (err) {
      console.warn(`[BackgroundSyncManager] Periodic sync registration failed for tag "${tag}":`, err);
    }
  }

  // Foreground fallback for Periodic Sync
  if (fallbackFn && typeof window !== 'undefined') {
    if (navigator.onLine) {
      try {
        await fallbackFn();
      } catch {
        // ignore
      }
    }
  }

  return {
    supported: false,
    registered: false,
    method: 'foreground-fallback'
  };
}

/**
 * Helper to safely sync messages later across all devices
 */
export async function syncMessagesLater(fallbackFn?: () => Promise<void> | void): Promise<SyncRegistrationResult> {
  return registerBackgroundSyncSafely('sync-messages', fallbackFn);
}

/**
 * Helper to safely sync merchant data later across all devices
 */
export async function syncMerchantDataLater(fallbackFn?: () => Promise<void> | void): Promise<SyncRegistrationResult> {
  return registerBackgroundSyncSafely('sync-merchant-data', fallbackFn);
}

/**
 * Helper to safely sync radar price data later across all devices
 */
export async function syncRadarPriceLater(fallbackFn?: () => Promise<void> | void): Promise<SyncRegistrationResult> {
  return registerBackgroundSyncSafely('radar-price-sync', fallbackFn);
}

/**
 * Helper to safely sync general data later across all devices
 */
export async function syncDataLater(fallbackFn?: () => Promise<void> | void): Promise<SyncRegistrationResult> {
  return registerBackgroundSyncSafely('sync-data', fallbackFn);
}
