import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { app, auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface AlertChannelPreferences {
  competitorPriceChange: { appPush: boolean; whatsapp: boolean };
  buyBoxLostOrWon: { appPush: boolean; whatsapp: boolean };
  priceFloorGuardrail: { appPush: boolean; whatsapp: boolean };
  inventoryReorder: { appPush: boolean; whatsapp: boolean };
  platformSyncError: { appPush: boolean; whatsapp: boolean };
  dailyWeeklySummary: { appPush: boolean; whatsapp: boolean };
}

export interface FcmPushSettings {
  isPushEnabled: boolean;
  notifyOnCompetitorPriceChange: boolean;
  notifyOnPlatformSyncError: boolean;
  notifyOnInventoryReorder: boolean;
  notifySoundEnabled: boolean;
  autoRepriceAlerts: boolean;
  whatsappPhoneNumber?: string;
  whatsappAlertsEnabled?: boolean;
  channelPreferences?: AlertChannelPreferences;
}

export interface PushNotificationRecord {
  id: string;
  title: string;
  body: string;
  type: 'competitor_price' | 'sync_error' | 'inventory_reorder' | 'test_alert';
  timestamp: string;
  platform?: string;
  data?: Record<string, any>;
}

const STORAGE_KEY_SETTINGS = 'merchant_radar_fcm_settings_v1';
const STORAGE_KEY_TOKEN = 'merchant_radar_fcm_token_v1';
const STORAGE_KEY_HISTORY = 'merchant_radar_push_history_v1';

export const DEFAULT_ALERT_CHANNEL_PREFERENCES: AlertChannelPreferences = {
  competitorPriceChange: { appPush: true, whatsapp: true },
  buyBoxLostOrWon: { appPush: true, whatsapp: true },
  priceFloorGuardrail: { appPush: true, whatsapp: true },
  inventoryReorder: { appPush: true, whatsapp: true },
  platformSyncError: { appPush: true, whatsapp: false },
  dailyWeeklySummary: { appPush: false, whatsapp: true },
};

export const DEFAULT_FCM_SETTINGS: FcmPushSettings = {
  isPushEnabled: true,
  notifyOnCompetitorPriceChange: true,
  notifyOnPlatformSyncError: true,
  notifyOnInventoryReorder: true,
  notifySoundEnabled: true,
  autoRepriceAlerts: true,
  whatsappPhoneNumber: '+201012345678',
  whatsappAlertsEnabled: true,
  channelPreferences: DEFAULT_ALERT_CHANNEL_PREFERENCES,
};

let messagingInstance: Messaging | null = null;
let isMessagingSupportedCache: boolean | null = null;

/**
 * Checks if Firebase Cloud Messaging & Browser Notifications are supported in the current environment
 */
export async function isPushNotificationSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return false;
  }
  // Skip background service worker initialization inside sandboxed preview iframes
  try {
    if (window.self !== window.top) {
      return false;
    }
  } catch {
    return false;
  }
  if (isMessagingSupportedCache !== null) {
    return isMessagingSupportedCache;
  }
  try {
    const supported = await isSupported();
    isMessagingSupportedCache = supported;
    return supported;
  } catch {
    isMessagingSupportedCache = false;
    return false;
  }
}

/**
 * Get current browser notification permission status
 */
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Load push notification preferences from localStorage
 */
export function getPushSettings(): FcmPushSettings {
  if (typeof window === 'undefined') return DEFAULT_FCM_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_FCM_SETTINGS;
    return { ...DEFAULT_FCM_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FCM_SETTINGS;
  }
}

/**
 * Save push notification preferences
 */
export function savePushSettings(settings: Partial<FcmPushSettings>): FcmPushSettings {
  const current = getPushSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

/**
 * Get cached FCM device token
 */
export function getStoredFcmToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

/**
 * Save FCM device token locally and to Firestore user profile if logged in
 */
export async function saveFcmToken(token: string): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  }
  try {
    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(
        userRef,
        {
          fcmToken: token,
          pushNotificationsEnabled: true,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Could not sync FCM token to Firestore:', err);
  }
}

/**
 * Initialize FCM Messaging instance and register Service Worker
 */
export async function initFcmMessaging(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;

  const supported = await isPushNotificationSupported();
  if (!supported) return null;

  try {
    messagingInstance = getMessaging(app);

    // Register service worker if not already registered and not inside an iframe
    if ('serviceWorker' in navigator && window.self === window.top) {
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
      } catch {
        // Handled silently in preview environments
      }
    }

    // Set up foreground message handler
    onMessage(messagingInstance, (payload) => {
      console.log('[FCM] Foreground push message received:', payload);
      const title = payload.notification?.title || payload.data?.title || 'رادار التاجر الذكي ⚡';
      const body = payload.notification?.body || payload.data?.body || 'تنبيه جديد';
      const type = (payload.data?.type as any) || 'general_alert';

      const record: PushNotificationRecord = {
        id: `push_${Date.now()}`,
        title,
        body,
        type,
        timestamp: new Date().toISOString(),
        platform: payload.data?.platform,
        data: payload.data
      };

      recordPushNotification(record);

      // Show native browser notification if in background or tab unfocused
      if (document.hidden && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/icon.svg',
            dir: 'rtl'
          });
        } catch {
          // ignore
        }
      }

      // Dispatch local event for UI components to listen to
      window.dispatchEvent(
        new CustomEvent('merchant-radar-push-received', { detail: record })
      );
    });

    return messagingInstance;
  } catch (err) {
    console.error('Error initializing FCM messaging:', err);
    return null;
  }
}

/**
 * Request Push Notification Permission & Generate FCM Registration Token
 */
export async function requestPushNotificationPermission(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
  permission: NotificationPermission | 'unsupported';
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, error: 'المتصفح لا يدعم إشعارات الويب المباشرة.', permission: 'unsupported' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { 
        success: false, 
        error: permission === 'denied' 
          ? 'تم رفض إذن الإشعارات من إعدادات المتصفح. يرجى السماح بالإشعارات من قفل شريط العنوان.' 
          : 'لم يتم منح إذن الإشعارات بعد.',
        permission 
      };
    }

    // Register FCM Service Worker safely
    let swReg: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator && window.self === window.top) {
      try {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        await navigator.serviceWorker.ready;
      } catch {
        // Fallback to browser notification without service worker
      }
    }

    const messaging = await initFcmMessaging();
    let token = getStoredFcmToken();

    if (messaging && swReg) {
      try {
        // Attempt to fetch FCM registration token
        const fetchedToken = await getToken(messaging, {
          serviceWorkerRegistration: swReg
        });
        if (fetchedToken) {
          token = fetchedToken;
          await saveFcmToken(token);
        }
      } catch {
        if (!token) {
          token = `fcm_device_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          await saveFcmToken(token);
        }
      }
    } else if (!token) {
      token = `fcm_device_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      await saveFcmToken(token);
    }

    savePushSettings({ isPushEnabled: true });

    return {
      success: true,
      token: token || undefined,
      permission: 'granted'
    };
  } catch (err: any) {
    console.error('Failed to request push notification permission:', err);
    return {
      success: false,
      error: err?.message || 'حدث خطأ أثناء تفعيل تنبيهات المتصفح.',
      permission: getBrowserNotificationPermission()
    };
  }
}

/**
 * Display a push notification either via active Service Worker (works in background)
 * or via Notification constructor
 */
export async function showPushNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    type?: PushNotificationRecord['type'];
    platform?: string;
    data?: Record<string, any>;
    url?: string;
  }
): Promise<boolean> {
  const settings = getPushSettings();
  if (!settings.isPushEnabled) return false;
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return false;

  const record: PushNotificationRecord = {
    id: `push_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    body: options.body,
    type: options.type || 'test_alert',
    timestamp: new Date().toISOString(),
    platform: options.platform,
    data: options.data
  };

  recordPushNotification(record);

  // Dispatch custom event for in-app UI updates
  window.dispatchEvent(
    new CustomEvent('merchant-radar-push-received', { detail: record })
  );

  const notifOptions: NotificationOptions = {
    body: options.body,
    icon: options.icon || '/pwa-192x192.png',
    badge: options.badge || '/icon.svg',
    dir: 'rtl',
    lang: 'ar',
    tag: `radar-${options.type || 'alert'}-${Date.now()}`,
    data: {
      url: options.url || '/',
      ...options.data
    }
  };

  // Try Service Worker registration first for background persistence
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notifOptions);
        return true;
      }
    }
  } catch (swError) {
    console.warn('Service worker showNotification fallback to window.Notification:', swError);
  }

  // Fallback to window Notification constructor
  try {
    new Notification(title, notifOptions);
    return true;
  } catch (e) {
    console.error('Could not display browser notification:', e);
    return false;
  }
}

/**
 * Trigger immediate push notification when a Competitor Price Changes
 */
export async function sendCompetitorPriceAlertNotification(input: {
  productTitle: string;
  competitorName: string;
  oldPrice: number;
  newPrice: number;
  platformName: string;
  currency?: string;
  productId?: string;
}): Promise<boolean> {
  const settings = getPushSettings();
  if (!settings.isPushEnabled || !settings.notifyOnCompetitorPriceChange) return false;

  const currency = input.currency || 'ج.م';
  const diff = input.oldPrice - input.newPrice;
  const isDrop = diff > 0;
  const percent = input.oldPrice > 0 ? Math.round((Math.abs(diff) / input.oldPrice) * 100) : 0;

  const title = isDrop
    ? `📉 هبوط سعر منافس: ${input.competitorName}`
    : `📈 ارتفاع سعر منافس: ${input.competitorName}`;

  const body = isDrop
    ? `قام ${input.competitorName} على ${input.platformName} بخفض سعر "${input.productTitle}" من ${input.oldPrice} إلى ${input.newPrice} ${currency} (-${percent}%). راجع استراتيجية التسعير فوراً!`
    : `تم رصد زيادة في سعر "${input.productTitle}" على ${input.platformName} إلى ${input.newPrice} ${currency}. فرصة لرفع هامش الربح!`;

  return showPushNotification(title, {
    body,
    type: 'competitor_price',
    platform: input.platformName,
    url: '#radar',
    data: {
      productId: input.productId,
      oldPrice: input.oldPrice,
      newPrice: input.newPrice,
      competitor: input.competitorName
    }
  });
}

/**
 * Trigger immediate push notification when an API Sync Failure occurs
 */
export async function sendSyncErrorAlertNotification(input: {
  platformName: string;
  errorCode: string;
  errorMessage: string;
  severity?: 'critical' | 'high' | 'medium';
}): Promise<boolean> {
  const settings = getPushSettings();
  if (!settings.isPushEnabled || !settings.notifyOnPlatformSyncError) return false;

  const isCritical = input.severity === 'critical';
  const title = isCritical
    ? `🚨 انقطاع خطير في مزامنة API: ${input.platformName}`
    : `⚠️ تعثر اتصال ومزامنة: ${input.platformName}`;

  const body = `رمز الخطأ [${input.errorCode}]: ${input.errorMessage}. انقر لإعادة ربط الحساب وتجديد التوكنز في لوحة المدير.`;

  return showPushNotification(title, {
    body,
    type: 'sync_error',
    platform: input.platformName,
    url: '#admin_error_logs',
    data: {
      errorCode: input.errorCode,
      severity: input.severity || 'high',
      platform: input.platformName
    }
  });
}

/**
 * Trigger simulated test push notification for testing browser capabilities
 */
export async function sendTestPushNotification(type: 'competitor_price' | 'sync_error' | 'inventory_reorder'): Promise<boolean> {
  if (type === 'competitor_price') {
    return sendCompetitorPriceAlertNotification({
      productTitle: 'صالون لويس مذهب دمياطي فاخر',
      competitorName: 'مفروشات القصر الملكي',
      oldPrice: 32500,
      newPrice: 28900,
      platformName: 'أمازون مصر (Amazon Egypt)',
      currency: 'ج.م'
    });
  } else if (type === 'sync_error') {
    return sendSyncErrorAlertNotification({
      platformName: 'نون مصر (Noon Partner API)',
      errorCode: 'HTTP_401_TOKEN_EXPIRED',
      errorMessage: 'انتهت صلاحية مفتاح الربط وتوكن الاعتماد لمتجر نون، مطلوب إعادة المصادقة',
      severity: 'critical'
    });
  } else {
    return showPushNotification('📦 تنبيه ذكي: انخفاض مخزون منتج رئيسي', {
      body: 'تبقى 3 قطع فقط من "غرفة نوم ماستر مودرن". وصل المخزون لنقطة إعادة الطلب العاجلة.',
      type: 'inventory_reorder',
      url: '#inventory'
    });
  }
}

/**
 * Push Notification History Management
 */
export function getPushNotificationHistory(): PushNotificationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordPushNotification(record: PushNotificationRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getPushNotificationHistory();
    const updated = [record, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearPushNotificationHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_HISTORY);
}
