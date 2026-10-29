import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type MobileBrowserType = 'chrome' | 'safari' | 'samsung' | 'firefox' | 'edge' | 'inapp' | 'other';

export interface DeviceBrowserInfo {
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  browser: MobileBrowserType;
  browserName: string;
  isInAppBrowser: boolean;
}

// Module-level cache so beforeinstallprompt event is not missed by late-mounting components
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((listener) => listener(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((listener) => listener(null));
  });
}

function detectDeviceInfo(): DeviceBrowserInfo {
  if (typeof window === 'undefined' || !window.navigator) {
    return {
      isMobile: false,
      isTablet: false,
      isIOS: false,
      isAndroid: false,
      browser: 'other',
      browserName: 'المتصفح',
      isInAppBrowser: false,
    };
  }

  const ua = window.navigator.userAgent.toLowerCase();
  
  // iOS detection including iPadOS with desktop user-agent
  const isIOS = /iphone|ipad|ipod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(ua);
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  const isMobile = isIOS || isAndroid || isTablet || /mobi|mini|fennec|mobile/i.test(ua) || (window.innerWidth <= 768);

  // In-app browsers (Facebook, Instagram, WhatsApp, TikTok, etc.)
  const isInAppBrowser = /(fban|fbav|instagram|threads|line|micromessenger|snapchat|tiktok|musical_ly|twitter|whatsapp)/i.test(ua);

  let browser: MobileBrowserType = 'other';
  let browserName = 'متصفح الإنترنت';

  if (isInAppBrowser) {
    browser = 'inapp';
    browserName = 'متصفح التطبيقات المدمج (فيسبوك/إنستغرام)';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'samsung';
    browserName = 'متصفح سامسونج (Samsung Internet)';
  } else if (/edg|edgios|edga/i.test(ua)) {
    browser = 'edge';
    browserName = 'مايكروسوفت إيدج (Microsoft Edge)';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'firefox';
    browserName = 'فايرفوكس (Mozilla Firefox)';
  } else if (/crios|chrome/i.test(ua)) {
    browser = 'chrome';
    browserName = 'جوجل كروم (Google Chrome)';
  } else if (isIOS && /safari/i.test(ua)) {
    browser = 'safari';
    browserName = 'متصفح سفاري (Apple Safari)';
  }

  return {
    isMobile,
    isTablet,
    isIOS,
    isAndroid,
    browser,
    browserName,
    isInAppBrowser,
  };
}

/**
 * Intelligent detection of PWA standalone installed mode
 * Checks display-mode: standalone/fullscreen, navigator.standalone (iOS Safari),
 * android-app:// referrer, and persistent installed state.
 */
export function checkIsStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isStandaloneMedia = Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    const isFullscreenMedia = Boolean(window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches);
    const isMinimalUiMedia = Boolean(window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches);
    const isNavigatorStandalone = Boolean((window.navigator as unknown as { standalone?: boolean })?.standalone === true);
    const isAndroidReferrer = Boolean(typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://'));
    const isUrlSourcePwa = Boolean(window.location && (window.location.search.includes('source=pwa') || window.location.search.includes('mode=standalone')));
    const isStoredInstalled = Boolean(localStorage.getItem('pwa_is_installed_mode') === 'true');

    return (
      isStandaloneMedia ||
      isFullscreenMedia ||
      isMinimalUiMedia ||
      isNavigatorStandalone ||
      isAndroidReferrer ||
      isUrlSourcePwa ||
      isStoredInstalled
    );
  } catch {
    return false;
  }
}

export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandaloneMode());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return checkIsStandaloneMode() ? null : globalDeferredPrompt;
  });
  const [deviceInfo, setDeviceInfo] = useState<DeviceBrowserInfo>(detectDeviceInfo());
  const [isInIframe, setIsInIframe] = useState(false);
  const [isMobilePromptDismissed, setIsMobilePromptDismissed] = useState(false);

  useEffect(() => {
    // Re-verify standalone mode (already running installed as PWA on phone/desktop)
    const standaloneActive = checkIsStandaloneMode();
    if (standaloneActive) {
      setIsInstalled(true);
      try {
        localStorage.setItem('pwa_is_installed_mode', 'true');
      } catch {
        // safe fallback
      }
    } else {
      setIsInstalled(false);
    }

    // Media query listener for real-time display-mode transitions
    let mediaQuery: MediaQueryList | null = null;
    let handleMediaChange: ((e: MediaQueryListEvent) => void) | null = null;
    try {
      if (window.matchMedia) {
        mediaQuery = window.matchMedia('(display-mode: standalone)');
        handleMediaChange = (e: MediaQueryListEvent) => {
          if (e.matches) {
            setIsInstalled(true);
            try {
              localStorage.setItem('pwa_is_installed_mode', 'true');
            } catch {
              // ignore
            }
          }
        };
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleMediaChange);
        }
      }
    } catch {
      // safe fallback
    }

    // Re-detect device info with actual screen size
    const info = detectDeviceInfo();
    setDeviceInfo(info);

    // Detect if running inside an iframe (e.g. preview environment)
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    // Read dismissed status from session
    try {
      const dismissed = sessionStorage.getItem('merchant_pwa_mobile_dismissed') === 'true';
      setIsMobilePromptDismissed(dismissed);
    } catch {
      // ignore storage errors
    }

    // Sync with global prompt only if not installed
    if (!standaloneActive && globalDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const listener = (prompt: BeforeInstallPromptEvent | null) => {
      if (checkIsStandaloneMode()) {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return;
      }
      setDeferredPrompt(prompt);
      if (!prompt && checkIsStandaloneMode()) {
        setIsInstalled(true);
      }
    };

    promptListeners.add(listener);

    const handleBeforeInstallPrompt = (e: Event) => {
      if (checkIsStandaloneMode()) {
        return;
      }
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(globalDeferredPrompt);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      try {
        localStorage.setItem('pwa_is_installed_mode', 'true');
      } catch {
        // ignore
      }
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      promptListeners.delete(listener);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery && handleMediaChange && mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, [deferredPrompt]);

  const install = async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (!promptEvent) return false;
    try {
      if (typeof promptEvent.prompt === 'function') {
        await promptEvent.prompt();
      }
      if (promptEvent.userChoice) {
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.warn('[PWA] Prompt installation error:', err);
      return false;
    }
  };

  const openInNewWindow = () => {
    if (typeof window !== 'undefined') {
      try {
        const inIframe = window.self !== window.top;
        if (inIframe && window.location?.href) {
          window.open(window.location.href, '_blank', 'noopener,noreferrer');
        }
      } catch (err) {
        console.warn('[PWA] Could not open standalone window:', err);
      }
    }
  };

  const dismissMobilePrompt = () => {
    setIsMobilePromptDismissed(true);
    try {
      sessionStorage.setItem('merchant_pwa_mobile_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const resetMobilePrompt = () => {
    setIsMobilePromptDismissed(false);
    try {
      sessionStorage.removeItem('merchant_pwa_mobile_dismissed');
    } catch {
      // ignore
    }
  };

  const downloadApkDirectly = () => {
    if (typeof window !== 'undefined') {
      try {
        const a = document.createElement('a');
        a.href = '/radar-al-tajer-signed.apk';
        a.download = 'radar-al-tajer-signed.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.warn('[PWA] APK Download error:', err);
        window.location.href = '/radar-al-tajer-signed.apk';
      }
    }
  };

  return {
    isInstallable: isInstalled ? false : Boolean(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIOS: deviceInfo.isIOS,
    isAndroid: deviceInfo.isAndroid,
    isMobile: deviceInfo.isMobile,
    browser: deviceInfo.browser,
    browserName: deviceInfo.browserName,
    isInAppBrowser: deviceInfo.isInAppBrowser,
    isInIframe,
    isMobilePromptDismissed,
    deviceInfo,
    install,
    openInNewWindow,
    downloadApkDirectly,
    dismissMobilePrompt,
    resetMobilePrompt,
  };
}


