import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  auth,
  db,
  usersCollection,
  handleFirestoreError,
  OperationType,
  isFirestoreQuotaExhausted,
} from '../db';

export type PreferredAlertChannelMode = 'both' | 'whatsapp_only' | 'browser_only' | 'muted';

export interface AccountNotificationChannelPrefs {
  whatsappEnabled: boolean;
  browserNotificationsEnabled: boolean;
  whatsappPhone: string;
  channelMode: PreferredAlertChannelMode;
  hasPromptedBrowserPermission: boolean;
  updatedAt: string;
}

export const ACCOUNT_NOTIFICATION_CHANNELS_KEY = 'merchant_radar_account_notif_channels_v1';
export const ACCOUNT_NOTIFICATION_CHANNELS_EVENT = 'account_notification_channels_updated';
const WATCHLIST_PREFS_KEY = 'merchant_radar_watchlist_notif_prefs_v1';
const WHATSAPP_CONFIG_KEY = 'merchant_radar_whatsapp_service_config_v2';

function computeChannelMode(whatsappEnabled: boolean, browserEnabled: boolean): PreferredAlertChannelMode {
  if (whatsappEnabled && browserEnabled) return 'both';
  if (whatsappEnabled && !browserEnabled) return 'whatsapp_only';
  if (!whatsappEnabled && browserEnabled) return 'browser_only';
  return 'muted';
}

function readLocalWhatsAppPhone(): string {
  try {
    const raw = localStorage.getItem(WHATSAPP_CONFIG_KEY);
    if (!raw) return '201012345678';
    const parsed = JSON.parse(raw);
    const activeRecipient = Array.isArray(parsed?.recipients)
      ? parsed.recipients.find((r: any) => r?.phone)
      : null;
    return activeRecipient?.phone || '201012345678';
  } catch {
    return '201012345678';
  }
}

export function getAccountNotificationChannelPrefs(): AccountNotificationChannelPrefs {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {
      whatsappEnabled: true,
      browserNotificationsEnabled: true,
      whatsappPhone: '201012345678',
      channelMode: 'both',
      hasPromptedBrowserPermission: false,
      updatedAt: new Date().toISOString(),
    };
  }

  let saved: Partial<AccountNotificationChannelPrefs> | null = null;
  try {
    const raw = localStorage.getItem(ACCOUNT_NOTIFICATION_CHANNELS_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch {
    saved = null;
  }

  let watchlistBrowserEnabled = true;
  try {
    const wlRaw = localStorage.getItem(WATCHLIST_PREFS_KEY);
    if (wlRaw) {
      const parsedWl = JSON.parse(wlRaw);
      if (typeof parsedWl?.webNotificationsEnabled === 'boolean') {
        watchlistBrowserEnabled = parsedWl.webNotificationsEnabled;
      }
    }
  } catch {}

  let waConfigEnabled = true;
  try {
    const waRaw = localStorage.getItem(WHATSAPP_CONFIG_KEY);
    if (waRaw) {
      const parsedWa = JSON.parse(waRaw);
      if (typeof parsedWa?.isEnabled === 'boolean') {
        waConfigEnabled = parsedWa.isEnabled;
      }
    }
  } catch {}

  const whatsappEnabled =
    typeof saved?.whatsappEnabled === 'boolean' ? saved.whatsappEnabled : waConfigEnabled;
  const browserNotificationsEnabled =
    typeof saved?.browserNotificationsEnabled === 'boolean'
      ? saved.browserNotificationsEnabled
      : watchlistBrowserEnabled;

  return {
    whatsappEnabled,
    browserNotificationsEnabled,
    whatsappPhone: saved?.whatsappPhone ?? readLocalWhatsAppPhone(),
    channelMode: computeChannelMode(whatsappEnabled, browserNotificationsEnabled),
    hasPromptedBrowserPermission: Boolean(saved?.hasPromptedBrowserPermission),
    updatedAt: saved?.updatedAt || new Date().toISOString(),
  };
}

export function saveAccountNotificationChannelPrefs(
  updates: Partial<AccountNotificationChannelPrefs>
): AccountNotificationChannelPrefs {
  const current = getAccountNotificationChannelPrefs();

  let whatsappEnabled =
    updates.whatsappEnabled !== undefined ? updates.whatsappEnabled : current.whatsappEnabled;
  let browserNotificationsEnabled =
    updates.browserNotificationsEnabled !== undefined
      ? updates.browserNotificationsEnabled
      : current.browserNotificationsEnabled;

  if (
    updates.channelMode !== undefined &&
    updates.whatsappEnabled === undefined &&
    updates.browserNotificationsEnabled === undefined
  ) {
    if (updates.channelMode === 'both') {
      whatsappEnabled = true;
      browserNotificationsEnabled = true;
    } else if (updates.channelMode === 'whatsapp_only') {
      whatsappEnabled = true;
      browserNotificationsEnabled = false;
    } else if (updates.channelMode === 'browser_only') {
      whatsappEnabled = false;
      browserNotificationsEnabled = true;
    } else {
      whatsappEnabled = false;
      browserNotificationsEnabled = false;
    }
  }

  const next: AccountNotificationChannelPrefs = {
    whatsappEnabled,
    browserNotificationsEnabled,
    whatsappPhone:
      updates.whatsappPhone !== undefined ? updates.whatsappPhone : current.whatsappPhone,
    channelMode: computeChannelMode(whatsappEnabled, browserNotificationsEnabled),
    hasPromptedBrowserPermission:
      updates.hasPromptedBrowserPermission !== undefined
        ? updates.hasPromptedBrowserPermission
        : current.hasPromptedBrowserPermission,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(ACCOUNT_NOTIFICATION_CHANNELS_KEY, JSON.stringify(next));

      // Keep Watchlist Web Notification preferences synced
      const wlRaw = localStorage.getItem(WATCHLIST_PREFS_KEY);
      const wlPrefs = wlRaw ? JSON.parse(wlRaw) : {};
      localStorage.setItem(
        WATCHLIST_PREFS_KEY,
        JSON.stringify({
          ...wlPrefs,
          webNotificationsEnabled: next.browserNotificationsEnabled,
        })
      );

      // Keep WhatsApp service config synced
      const waRaw = localStorage.getItem(WHATSAPP_CONFIG_KEY);
      const waConfig = waRaw ? JSON.parse(waRaw) : { provider: 'wa_link', recipients: [] };
      const cleanedPhone = next.whatsappPhone.replace(/[^0-9]/g, '');
      const normalizedPhone =
        cleanedPhone.startsWith('01') && cleanedPhone.length === 11
          ? `20${cleanedPhone.substring(1)}`
          : cleanedPhone;

      const recipients = Array.isArray(waConfig.recipients) ? [...waConfig.recipients] : [];
      if (normalizedPhone) {
        if (recipients.length > 0) {
          recipients[0] = { ...recipients[0], phone: normalizedPhone, isActive: next.whatsappEnabled };
        } else {
          recipients.push({
            id: `rec-primary-${Date.now()}`,
            label: 'رقم الحساب الرئيسي',
            phone: normalizedPhone,
            isActive: next.whatsappEnabled,
            role: 'admin',
            createdAt: new Date().toISOString().substring(0, 10),
          });
        }
      }

      localStorage.setItem(
        WHATSAPP_CONFIG_KEY,
        JSON.stringify({
          ...waConfig,
          isEnabled: next.whatsappEnabled,
          recipients,
        })
      );

      window.dispatchEvent(new CustomEvent(ACCOUNT_NOTIFICATION_CHANNELS_EVENT, { detail: next }));
    } catch (err) {
      console.warn('Error saving account notification channel prefs:', err);
    }
  }

  return next;
}

export async function syncAccountNotificationChannelsToFirestore(
  prefs: AccountNotificationChannelPrefs
): Promise<boolean> {
  const uid = auth?.currentUser?.uid;
  if (!uid || !db || !usersCollection || isFirestoreQuotaExhausted()) {
    return false;
  }

  const userPath = `users/${uid}`;
  try {
    await updateDoc(doc(usersCollection, uid), {
      pushNotificationsEnabled: prefs.browserNotificationsEnabled,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, userPath);
  }

  const waPath = `users/${uid}/whatsapp_settings/config`;
  try {
    await setDoc(
      doc(db, 'users', uid, 'whatsapp_settings', 'config'),
      {
        userId: uid,
        phoneNumber: prefs.whatsappPhone || '',
        isEnabled: prefs.whatsappEnabled,
        notifyOnPriceChange: prefs.whatsappEnabled,
        notifyOnInventoryLow: prefs.whatsappEnabled,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, waPath);
  }

  return true;
}

export async function loadAccountNotificationChannelsFromFirestore(): Promise<AccountNotificationChannelPrefs> {
  const localPrefs = getAccountNotificationChannelPrefs();
  const uid = auth?.currentUser?.uid;
  if (!uid || !db || !usersCollection || isFirestoreQuotaExhausted()) {
    return localPrefs;
  }

  let nextBrowser = localPrefs.browserNotificationsEnabled;
  let nextWhatsApp = localPrefs.whatsappEnabled;
  let nextPhone = localPrefs.whatsappPhone;

  try {
    const userSnap = await getDoc(doc(usersCollection, uid));
    if (userSnap.exists()) {
      const data = userSnap.data() as { pushNotificationsEnabled?: boolean };
      if (typeof data.pushNotificationsEnabled === 'boolean') {
        nextBrowser = data.pushNotificationsEnabled;
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }

  try {
    const waSnap = await getDoc(doc(db, 'users', uid, 'whatsapp_settings', 'config'));
    if (waSnap.exists()) {
      const waData = waSnap.data() as { isEnabled?: boolean; phoneNumber?: string };
      if (typeof waData.isEnabled === 'boolean') {
        nextWhatsApp = waData.isEnabled;
      }
      if (typeof waData.phoneNumber === 'string' && waData.phoneNumber.trim()) {
        nextPhone = waData.phoneNumber.trim();
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}/whatsapp_settings/config`);
  }

  return saveAccountNotificationChannelPrefs({
    whatsappEnabled: nextWhatsApp,
    browserNotificationsEnabled: nextBrowser,
    whatsappPhone: nextPhone,
  });
}

/**
 * Requests browser Notification API permission automatically when alerts are enabled for the first time.
 */
export async function requestBrowserPermissionOnFirstAlertActivation(options?: {
  forceIfDefault?: boolean;
}): Promise<{
  prompted: boolean;
  granted: boolean;
  permission: NotificationPermission | 'unsupported';
  error?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      prompted: false,
      granted: false,
      permission: 'unsupported',
      error: 'المتصفح الحالي لا يدعم واجهة إشعارات المتصفح (Notification API).',
    };
  }

  const currentPrefs = getAccountNotificationChannelPrefs();
  const currentPermission = Notification.permission;

  if (currentPermission === 'granted') {
    if (!currentPrefs.hasPromptedBrowserPermission) {
      saveAccountNotificationChannelPrefs({ hasPromptedBrowserPermission: true });
    }
    return {
      prompted: false,
      granted: true,
      permission: 'granted',
    };
  }

  if (currentPermission === 'denied') {
    if (!currentPrefs.hasPromptedBrowserPermission) {
      saveAccountNotificationChannelPrefs({
        hasPromptedBrowserPermission: true,
        browserNotificationsEnabled: false,
      });
    }
    return {
      prompted: false,
      granted: false,
      permission: 'denied',
      error: 'تم حظر إشعارات المتصفح سابقاً. يرجى السماح بها من إعدادات المتصفح.',
    };
  }

  // Notification.permission === 'default'
  if (currentPrefs.hasPromptedBrowserPermission && !options?.forceIfDefault) {
    return {
      prompted: false,
      granted: false,
      permission: 'default',
    };
  }

  // Mark prompted before awaiting so rapid clicks do not double-trigger
  saveAccountNotificationChannelPrefs({ hasPromptedBrowserPermission: true });

  try {
    let permission: NotificationPermission;
    if (typeof Notification.requestPermission === 'function') {
      permission = await new Promise<NotificationPermission>((resolve) => {
        const maybePromise = Notification.requestPermission((cbPerm) => resolve(cbPerm));
        if (maybePromise && typeof (maybePromise as Promise<NotificationPermission>).then === 'function') {
          (maybePromise as Promise<NotificationPermission>)
            .then(resolve)
            .catch(() => resolve(Notification.permission || 'denied'));
        }
      });
    } else {
      permission = 'denied';
    }

    const granted = permission === 'granted';
    const shouldKeepBrowserEnabled =
      currentPrefs.channelMode === 'whatsapp_only' && !options?.forceIfDefault
        ? false
        : granted;

    const updated = saveAccountNotificationChannelPrefs({
      hasPromptedBrowserPermission: true,
      browserNotificationsEnabled: shouldKeepBrowserEnabled,
    });

    try {
      await syncAccountNotificationChannelsToFirestore(updated);
    } catch {
      // Non-blocking when offline or Supabase-only session
    }

    return {
      prompted: true,
      granted,
      permission,
      error: granted
        ? undefined
        : permission === 'denied'
        ? 'تم رفض إذن إشعارات المتصفح. يمكنك تفعيله لاحقاً من إعدادات المتصفح أو إعدادات الحساب.'
        : 'لم يتم منح إذن إشعارات المتصفح.',
    };
  } catch (err: any) {
    return {
      prompted: true,
      granted: false,
      permission: Notification.permission || 'default',
      error: err?.message || 'تعذر طلب إذن إشعارات المتصفح.',
    };
  }
}
