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

export function useAppUpdate(onShowToast?: (msg: string) => void): AppUpdateState {
  // Ensure stored version is initialized on first visit and checked first to prevent repeated popups
  const [hasUpdate, setHasUpdate] = useState<boolean>(() => {
    try {
      const installedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);
      if (!installedVersion) {
        localStorage.setItem(APP_VERSION_STORAGE_KEY, CURRENT_APP_VERSION);
        return false;
      }
      if (installedVersion === CURRENT_APP_VERSION) {
        return false;
      }
      return true;
    } catch {
      return isPWAUpdateAvailable();
    }
  });

  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(() => {
    try {
      const installedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);
      if (!installedVersion || installedVersion === CURRENT_APP_VERSION) {
        return false;
      }
      const dismissed = sessionStorage.getItem(DISMISSED_SESSION_KEY) === 'true';
      return !dismissed;
    } catch {
      return false;
    }
  });

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSource, setUpdateSource] = useState<'service_worker' | 'server_build' | 'manual' | null>(
    isPWAUpdateAvailable() ? 'service_worker' : null
  );
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

  // Check server version & stored localStorage version first (with graceful static fallback if /api/app-version returns 404)
  const checkServerVersion = useCallback(async (isManual = false): Promise<boolean> => {
    try {
      // 1. Check stored version in localStorage first
      let installedVersion = CURRENT_APP_VERSION;
      try {
        const stored = localStorage.getItem(APP_VERSION_STORAGE_KEY);
        if (!stored) {
          localStorage.setItem(APP_VERSION_STORAGE_KEY, CURRENT_APP_VERSION);
          installedVersion = CURRENT_APP_VERSION;
        } else {
          installedVersion = stored;
        }
      } catch {
        // ignore storage errors
      }

      let data: any = null;

      // 2. Try dynamic backend endpoint unless previously confirmed unavailable (404) in static hosting
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

      // 3. Fallback directly to local CURRENT_APP_VERSION if API endpoint is unavailable (avoids network / fetch errors on static hosts)
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

        // Prevent repeated popups: if the user's installed version in localStorage already matches the latest version, do not show update popup
        if (installedVersion === remoteVersion && installedVersion === CURRENT_APP_VERSION) {
          setHasUpdate(false);
          setShowUpdateModal(false);
          return false;
        }

        // Only trigger update notification if version differs from installed version
        if (remoteVersion !== installedVersion || CURRENT_APP_VERSION !== installedVersion) {
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
            onShowToast?.('تم اكتشاف إصدار أحدث للمنصة! 🚀');
          }
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [onShowToast]);

  // Comprehensive check for updates (Checks stored version first + Service Worker + Server Endpoint)
  const checkForUpdates = useCallback(async (isManual = false): Promise<boolean> => {
    setIsChecking(true);
    let found = false;

    const installedVersion = (() => {
      try {
        return localStorage.getItem(APP_VERSION_STORAGE_KEY) || CURRENT_APP_VERSION;
      } catch {
        return CURRENT_APP_VERSION;
      }
    })();

    // 1. Check Service Worker registration update (only if not in iframe and version not already dismissed/installed)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.self === window.top) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          if (registration.waiting && installedVersion !== CURRENT_APP_VERSION) {
            setHasUpdate(true);
            setShowUpdateModal(true);
            setUpdateSource('service_worker');
            setIsBannerDismissed(false);
            found = true;
          }
        }
      } catch {
        // Safe silent fallback in restricted environments
      }
    }

    // 2. Check Server Version endpoint
    const serverHasUpdate = await checkServerVersion(isManual);
    found = found || serverHasUpdate;

    setIsChecking(false);

    if (isManual && !found) {
      onShowToast?.('أنت تستخدم بالفعل أحدث إصدار من رادار التاجر الذكي ✓');
    }

    return found;
  }, [checkServerVersion, onShowToast]);

  // One-Click Clean Update Handler (إصلاح دالة التحديث وتفريغ الكاش بضغطة واحدة)
  const applyUpdate = useCallback(async () => {
    setIsUpdating(true);
    onShowToast?.('جاري تفريغ الذاكرة المؤقتة (Cache) وتحميل التحديث الجديد... ⚡');

    try {
      // 1. مسح كافة ملفات الكاش المخزنة في المتصفح
      if (typeof window !== 'undefined' && 'caches' in window) {
        await caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
      }

      // 2. إزالة وإلغاء تسجيل أي Service Worker قديم
      clearPWAUpdateState();
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(async (reg) => {
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            return reg.unregister();
          })
        );
      }

      // 3. تحديث رقم الإصدار المخزن في LocalStorage ليطابق رقم الإصدار الحالي للتطبيق
      const targetVersion = serverVersion || CURRENT_APP_VERSION;
      try {
        localStorage.setItem('app_installed_version', CURRENT_APP_VERSION);
        if (targetVersion) {
          localStorage.setItem('app_installed_version', targetVersion);
        }
        sessionStorage.removeItem(BOOT_TIME_STORAGE_KEY);
        sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true');
      } catch {
        // ignore storage errors
      }

      // 4. إغلاق النافذة وإخفاء التنبيه فوراً
      setShowUpdateModal(false);
      setHasUpdate(false);
      setIsBannerDismissed(true);

      // 5. إجبار المتصفح على إعادة التحميل النظيف
      window.location.reload();
    } catch (error) {
      console.error('Error while applying update:', error);
      try {
        localStorage.setItem('app_installed_version', CURRENT_APP_VERSION);
      } catch {
        // ignore
      }
      setShowUpdateModal(false);
      setHasUpdate(false);
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
