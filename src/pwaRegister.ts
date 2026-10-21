type UpdateCallback = () => void;
const updateCallbacks = new Set<UpdateCallback>();
let globalUpdateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
let isUpdatePending = false;

export const CURRENT_APP_VERSION = '2.7.0';
export const APP_VERSION_STORAGE_KEY = 'app_installed_version';

export function onPWAUpdateAvailable(cb: UpdateCallback): () => void {
  updateCallbacks.add(cb);
  if (isUpdatePending) {
    try {
      cb();
    } catch {
      // ignore
    }
  }
  return () => {
    updateCallbacks.delete(cb);
  };
}

export function isPWAUpdateAvailable(): boolean {
  try {
    const installedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);
    if (installedVersion === CURRENT_APP_VERSION) {
      return false;
    }
  } catch {
    // ignore storage access issues
  }
  return isUpdatePending;
}

export function clearPWAUpdateState(): void {
  isUpdatePending = false;
}

export async function triggerPWARefresh(): Promise<void> {
  isUpdatePending = false;
  if (globalUpdateSW) {
    await globalUpdateSW(false);
  }
}

export function setupPWA(onNeedRefresh?: () => void) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const isIframe = window.self !== window.top;
    const isDev = window.location.hostname.includes('run.app') || window.location.hostname === 'localhost' || window.location.port !== '';
    if (isIframe || isDev) {
      return () => Promise.resolve();
    }

    try {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js', { scope: '/' })
          .then((registration) => {
            globalUpdateSW = async (reloadPage?: boolean) => {
              await registration.update();
              if (reloadPage) {
                window.location.reload();
              }
            };

            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Check stored version first to prevent repeated popup loop if already on CURRENT_APP_VERSION
                  try {
                    const installedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);
                    if (installedVersion === CURRENT_APP_VERSION) {
                      return;
                    }
                  } catch {
                    // ignore
                  }
                  isUpdatePending = true;
                  onNeedRefresh?.();
                  updateCallbacks.forEach((cb) => {
                    try {
                      cb();
                    } catch {
                      // safe fallback
                    }
                  });
                  window.dispatchEvent(new CustomEvent('app_update_available', { detail: { source: 'service_worker' } }));
                }
              });
            });
          })
          .catch(() => {
            // Handled silently in preview/sandbox environments
          });
      });

      return (reloadPage?: boolean) => {
        if (globalUpdateSW) return globalUpdateSW(reloadPage);
        return Promise.resolve();
      };
    } catch {
      return () => Promise.resolve();
    }
  }
  return () => Promise.resolve();
}

