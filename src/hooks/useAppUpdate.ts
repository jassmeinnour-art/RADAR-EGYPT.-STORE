import { useState, useEffect, useCallback, useRef } from 'react';
import {
  onPWAUpdateAvailable,
  isPWAUpdateAvailable,
  clearPWAUpdateState,
  CURRENT_APP_VERSION,
  APP_VERSION_STORAGE_KEY,
} from '../pwaRegister';

export { CURRENT_APP_VERSION, APP_VERSION_STORAGE_KEY };

export interface AppUpdateState {
  hasUpdate: boolean;
  setHasUpdate: (val: boolean) => void;
  showUpdateModal: boolean;
  setShowUpdateModal: (val: boolean) => void;
  isChecking: boolean;
  isUpdating: boolean;
  updateSource: 'service_worker' | 'server_build' | 'manual' | null;
  currentVersion: string;
  serverVersion: string | null;
  lastChecked: Date | null;
  isBannerDismissed: boolean;
  dismissBanner: () => void;
  reopenBanner: () => void;
  checkForUpdates: (isManual?: boolean) => Promise<boolean>;
  applyUpdate: () => Promise<void>;
}

const BOOT_TIME_STORAGE_KEY = 'merchant_radar_server_boot_time';
const DISMISSED_SESSION_KEY = 'merchant_radar_update_banner_dismissed';

/**
 * Checks if the remote version string is strictly newer than the current version string.
 * Example: '2.8.1' > '2.8.0' -> true, '2.8.0' > '2.8.0' -> false, '2.5.0' > '2.8.0' -> false.
 */
export function isNewerVersion(remote: string | null | undefined, current: string): boolean {
  if (!remote || !current) return false;
  const cleanRemote = remote.trim().replace(/^v/i, '');
  const cleanCurrent = current.trim().replace(/^v/i, '');
  if (cleanRemote === cleanCurrent) return false;

  const parseParts = (v: string) => v.split('.').map((n) => parseInt(n, 10) || 0);
  const r = parseParts(cleanRemote);
  const c = parseParts(cleanCurrent);

  for (let i = 0; i < Math.max(r.length, c.length); i++) {
    const rVal = r[i] ?? 0;
    const cVal = c[i] ?? 0;
    if (rVal > cVal) return true;
    if (rVal < cVal) return false;
  }
  return false;
}

export function useAppUpdate(onShowToast?: (msg: string) => void): AppUpdateState {
  // Synchronize current version to localStorage immediately on bundle load
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APP_VERSION_STORAGE_KEY, CURRENT_APP_VERSION);
    } catch {
      // safe fallback
    }
  }

  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSource, setUpdateSource] = useState<'service_worker' | 'server_build' | 'manual' | null>(null);
  const [serverVersion, setServerVersion] = useState<string | null>(CURRENT_APP_VERSION);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISSED_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const initialBootTimeRef = useRef<number | null>(null);
  const apiEndpointUnavailableRef = useRef<boolean>(false);

  // Check server version & stored version
  const checkServerVersion = useCallback(async (isManual = false): Promise<boolean> => {
    try {
      let data: any = null;

      // 1. Try dynamic backend endpoint
      if (!apiEndpointUnavailableRef.current) {
        try {
          const response = await fetch(`/api/app-version?_t=${Date.now()}`, {
            headers: {
              Accept: 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
            },
          });

          const contentType = response.headers.get('content-type') || '';
          if (response.status === 404 || !contentType.includes('application/json')) {
            apiEndpointUnavailableRef.current = true;
          } else if (response.ok) {
            data = await response.json();
          }
        } catch {
          apiEndpointUnavailableRef.current = true;
        }
      }

      // 2. Fallback to static app-version.json if dynamic endpoint is 404
      if (!data) {
        try {
          const staticRes = await fetch(`/app-version.json?_t=${Date.now()}`);
          if (staticRes.ok) {
            data = await staticRes.json();
          }
        } catch {
          // safe fallback
        }
      }

      // 3. Fallback to local CURRENT_APP_VERSION
      if (!data) {
        data = {
          success: true,
          version: CURRENT_APP_VERSION,
          source: 'local_constant_fallback',
        };
      }

      setLastChecked(new Date());

      if (data && data.success) {
        const remoteVersion = data.version || CURRENT_APP_VERSION;
        setServerVersion(remoteVersion);

        // Keep bootTime synced in sessionStorage
        if (data.bootTime) {
          initialBootTimeRef.current = data.bootTime;
          try {
            sessionStorage.setItem(BOOT_TIME_STORAGE_KEY, String(data.bootTime));
          } catch {
            // ignore
          }
        }

        // Only trigger update notification if the server version is strictly NEWER than CURRENT_APP_VERSION
        const isNewer = isNewerVersion(remoteVersion, CURRENT_APP_VERSION);

        if (isNewer) {
          setHasUpdate(true);
          setShowUpdateModal(true);
          setUpdateSource('server_build');
          setIsBannerDismissed(false);
          try {
            sessionStorage.removeItem(DISMISSED_SESSION_KEY);
          } catch {
            // ignore
          }
          if (isManual) {
            onShowToast?.(`تم اكتشاف تحديث برمجي جديد للمنصة (v${remoteVersion})! 🚀`);
          }
          return true;
        } else {
          // Same version or older: no update needed
          setHasUpdate(false);
          setShowUpdateModal(false);
          return false;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [onShowToast]);

  // Comprehensive check for updates
  const checkForUpdates = useCallback(async (isManual = false): Promise<boolean> => {
    setIsChecking(true);
    let found = false;

    // 1. Check Service Worker registration update
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.self === window.top) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update().catch(() => {});
          if (registration.waiting) {
            setHasUpdate(true);
            setShowUpdateModal(true);
            setUpdateSource('service_worker');
            setIsBannerDismissed(false);
            found = true;
          }
        }
      } catch {
        // Safe silent fallback
      }
    }

    // 2. Check Server Version endpoint
    const serverHasUpdate = await checkServerVersion(isManual);
    found = found || serverHasUpdate;

    setIsChecking(false);

    if (isManual && !found) {
      onShowToast?.(`أنت تستخدم بالفعل أحدث إصدار من رادار التاجر الذكي (v${CURRENT_APP_VERSION}) ✓`);
    }

    return found;
  }, [checkServerVersion, onShowToast]);

  // One-Click Clean Update Handler: Only purges CSS/JS Cache, NEVER touches merchant data or localStorage
  const applyUpdate = useCallback(async () => {
    setIsUpdating(true);
    onShowToast?.('جاري تطبيق التحديث وتحديث أكواد الواجهة مع الحفاظ التام على بيانات متاجرك... ⚡');

    try {
      // 1. إرسال أمر SKIP_WAITING للـ Service Worker لجلب الكود الجديد فوراً
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.update().catch(() => {});
        }
      }

      // 2. مسح ملفات الكاش الثابتة فقط (CSS/JS) لضمان تحميل الواجهات الجديدة
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // 3. تحديث رقم الإصدار المعتمد في LocalStorage (دون المساس ببيانات التجار أو المتاجر)
      const targetVersion = serverVersion && isNewerVersion(serverVersion, CURRENT_APP_VERSION)
        ? serverVersion
        : CURRENT_APP_VERSION;

      try {
        localStorage.setItem(APP_VERSION_STORAGE_KEY, targetVersion);
        sessionStorage.removeItem(BOOT_TIME_STORAGE_KEY);
        sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true');
      } catch (e) {
        console.warn('Storage update failed:', e);
      }

      // 4. إغلاق نوافذ التحديث فوراً
      setShowUpdateModal(false);
      setHasUpdate(false);
      setIsBannerDismissed(true);

      // 5. إعادة تحميل الواجهة لتطبيق الكود الجديد
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (error) {
      console.warn('Error during applying update:', error);
      window.location.reload();
    }
  }, [onShowToast, serverVersion]);

  // Dismiss update banner/modal
  const dismissBanner = useCallback(() => {
    setShowUpdateModal(false);
    setIsBannerDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const reopenBanner = useCallback(() => {
    setShowUpdateModal(true);
    setIsBannerDismissed(false);
    try {
      sessionStorage.removeItem(DISMISSED_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Listen for PWA service worker update event & window custom events
  useEffect(() => {
    const cleanup = onPWAUpdateAvailable(() => {
      try {
        const installedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);
        if (installedVersion === CURRENT_APP_VERSION) {
          return;
        }
      } catch {
        // ignore
      }
      setHasUpdate(true);
      setShowUpdateModal(true);
      setUpdateSource('service_worker');
      setIsBannerDismissed(false);
    });

    const handleCustomUpdateEvent = (e: any) => {
      try {
        const installedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);
        if (installedVersion === CURRENT_APP_VERSION && !e.detail?.force) {
          return;
        }
      } catch {
        // ignore
      }
      setHasUpdate(true);
      setShowUpdateModal(true);
      setUpdateSource(e.detail?.source || 'service_worker');
      setIsBannerDismissed(false);
    };

    window.addEventListener('app_update_available', handleCustomUpdateEvent);

    // Initial check on mount
    checkServerVersion(false);

    // Check on window focus and visibilitychange
    const handleFocus = () => {
      checkServerVersion(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkServerVersion(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check every 60 seconds
    const intervalId = setInterval(() => {
      checkServerVersion(false);
    }, 60000);

    return () => {
      cleanup();
      window.removeEventListener('app_update_available', handleCustomUpdateEvent);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [checkServerVersion]);

  return {
    hasUpdate,
    setHasUpdate,
    showUpdateModal,
    setShowUpdateModal,
    isChecking,
    isUpdating,
    updateSource,
    currentVersion: CURRENT_APP_VERSION,
    serverVersion,
    lastChecked,
    isBannerDismissed,
    dismissBanner,
    reopenBanner,
    checkForUpdates,
    applyUpdate,
  };
}
