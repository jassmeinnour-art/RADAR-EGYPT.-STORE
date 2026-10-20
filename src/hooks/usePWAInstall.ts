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

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceBrowserInfo>(detectDeviceInfo());
  const [isInIframe, setIsInIframe] = useState(false);
  const [isMobilePromptDismissed, setIsMobilePromptDismissed] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already running installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

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

    // Sync with global prompt
    if (globalDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const listener = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      if (!prompt && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true)) {
        setIsInstalled(true);
      }
    };

    promptListeners.add(listener);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(globalDeferredPrompt);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      promptListeners.delete(listener);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const install = async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const openInNewWindow = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
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

  return {
    isInstallable: Boolean(deferredPrompt || globalDeferredPrompt),
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
    dismissMobilePrompt,
    resetMobilePrompt,
  };
}
