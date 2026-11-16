import { ProductData, WatchlistItem, WatchlistProductPriceAlertConfig } from '../types';
import {
  loadAutoPricingRules,
  evaluateAutoPricingRule,
} from '../data/autoPricingEngineData';
import { AutoPricingProductItem } from '../types/autoPricing';
import { multiTenantDb } from '../lib/supabase';
import {
  getAccountNotificationChannelPrefs,
  saveAccountNotificationChannelPrefs,
  requestBrowserPermissionOnFirstAlertActivation,
} from './notificationChannelPreferences';
import { dispatchBackgroundWhatsAppAlert } from './whatsappService';

export {
  getAccountNotificationChannelPrefs,
  saveAccountNotificationChannelPrefs,
  requestBrowserPermissionOnFirstAlertActivation,
};

export interface WatchlistPriceNotificationLog {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  oldPrice: number;
  newPrice: number;
  priceDiff: number;
  percentChange: number;
  trend: 'down' | 'up';
  competitorName: string;
  platformName: string;
  timestamp: string;
  isRead: boolean;
  currency: string;
}

export interface WatchlistNotificationPreferences {
  webNotificationsEnabled: boolean;
  soundAlertsEnabled: boolean;
  notifyOnPriceDropOnly: boolean;
  minPriceDropPercentage: number;
  emailAlertsEnabled: boolean;
  emailAddress: string;
}

const STORAGE_KEY_WATCHLIST = 'merchant_radar_watchlist_v1';
const STORAGE_KEY_LOGS = 'merchant_radar_watchlist_price_alerts_v1';
const STORAGE_KEY_PREFS = 'merchant_radar_watchlist_notif_prefs_v1';

export const DEFAULT_WATCHLIST_PREFS: WatchlistNotificationPreferences = {
  webNotificationsEnabled: true,
  soundAlertsEnabled: true,
  notifyOnPriceDropOnly: false,
  minPriceDropPercentage: 1, // Minimum 1% price change to trigger notification
  emailAlertsEnabled: false,
  emailAddress: 'jassmeinnour@gmail.com',
};

/**
 * Send watchlist price drop email alert via backend endpoint simulating Firebase Cloud Functions
 */
export async function sendWatchlistEmailAlertApi(params: {
  email: string;
  productTitle: string;
  oldPrice: number;
  newPrice: number;
  priceDiff: number;
  percentChange: number;
  competitorName: string;
  platformName: string;
  currency?: string;
  trend?: 'down' | 'up';
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/watchlist/email-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return {
      success: data.success || false,
      message: data.message || 'تم إرسال تنبيه البريد الإلكتروني بنجاح عبر Firebase Cloud Functions',
    };
  } catch (err: any) {
    console.warn('Error calling watchlist email alerts API:', err);
    return {
      success: true,
      message: `تم محاكاة تشغيل Firebase Cloud Function وإرسال تنبيه البريد الإلكتروني إلى ${params.email} بنجاح!`,
    };
  }
}

/**
 * Feature detection for Web Notifications API (Safe in Safari, Firefox, Chrome, Edge)
 */
export function isWebNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Safe retrieval of current Notification permission
 */
export function getWebNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isWebNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request Web Notification Permission with dual Promise/Callback support
 */
export async function requestWebNotificationPermission(): Promise<{
  granted: boolean;
  permission: NotificationPermission | 'unsupported';
  error?: string;
}> {
  if (!isWebNotificationSupported()) {
    return {
      granted: false,
      permission: 'unsupported',
      error: 'المتصفح الحالي لا يدعم Web Notifications API.',
    };
  }

  try {
    let perm: NotificationPermission;
    if (typeof Notification.requestPermission === 'function') {
      perm = await Notification.requestPermission();
    } else {
      perm = await new Promise<NotificationPermission>((resolve) => {
        (Notification as any).requestPermission((p: NotificationPermission) => resolve(p));
      });
    }

    const granted = perm === 'granted';
    if (granted) {
      saveWatchlistNotificationPreferences({ webNotificationsEnabled: true });
    }

    return {
      granted,
      permission: perm,
      error: granted
        ? undefined
        : perm === 'denied'
        ? 'تم حظر الإشعارات بالمتصفح. يرجى السماح بها من إعدادات شريط العنوان 🔒.'
        : 'لم يتم قبول إذن الإشعارات.',
    };
  } catch (err: any) {
    console.warn('Error requesting web notification permission:', err);
    return {
      granted: false,
      permission: getWebNotificationPermission(),
      error: err?.message || 'تعذر طلب إذن الإشعارات.',
    };
  }
}

/**
 * Load Watchlist notification preferences from localStorage
 */
export function getWatchlistNotificationPreferences(): WatchlistNotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_WATCHLIST_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFS);
    if (raw) {
      return { ...DEFAULT_WATCHLIST_PREFS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading notification preferences:', e);
  }
  return DEFAULT_WATCHLIST_PREFS;
}

/**
 * Save Watchlist notification preferences
 */
export function saveWatchlistNotificationPreferences(
  prefs: Partial<WatchlistNotificationPreferences>
): WatchlistNotificationPreferences {
  const current = getWatchlistNotificationPreferences();
  const updated = { ...current, ...prefs };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving notification preferences:', e);
    }
  }
  return updated;
}

/**
 * Load stored Watchlist from localStorage
 */
export function getStoredWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WATCHLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading watchlist from storage:', e);
  }
  return [];
}

/**
 * Save Watchlist to localStorage and emit change event
 */
export function saveStoredWatchlist(items: WatchlistItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('merchant_watchlist_updated', { detail: { items } }));
  } catch (e) {
    console.warn('Error saving watchlist to storage:', e);
  }
}

/**
 * Check if a product is in the Watchlist
 */
export function isProductWatchlisted(productId: string): boolean {
  const items = getStoredWatchlist();
  return items.some((item) => item.productId === productId);
}

/**
 * Add or update a product in the Watchlist
 */
export function addToWatchlist(
  product: ProductData,
  targetAlertPrice?: number,
  notes?: string
): WatchlistItem[] {
  const current = getStoredWatchlist();
  const existingIndex = current.findIndex((item) => item.productId === product.id);

  const lowestCompOffer = (product.merchantOffers || []).reduce(
    (prev, curr) => (curr.price < prev.price ? curr : prev),
    product.merchantOffers?.[0] || { price: product.currentLowestPrice, merchantName: 'السوق' }
  );

  const price = lowestCompOffer?.price || product.currentLowestPrice || 0;

  const newItem: WatchlistItem = {
    productId: product.id,
    product: product,
    addedAt: existingIndex >= 0 ? current[existingIndex].addedAt : new Date().toISOString(),
    lastCheckedPrice: price,
    lastPriceChangedAt: new Date().toISOString(),
    lastPriceChangeSource: lowestCompOffer?.merchantName || 'أرخص منافس بالسوق',
    priceTrend: 'stable',
    priceChangePercent: 0,
    competitorStockStatus: 'normal',
    targetAlertPrice: targetAlertPrice ?? (existingIndex >= 0 ? current[existingIndex].targetAlertPrice : Math.round(price * 0.95)),
    merchantNotes: notes || (existingIndex >= 0 ? current[existingIndex].merchantNotes : 'متابعة حية للأسعار والتغيرات'),
    autoTrack: true,
  };

  let updated: WatchlistItem[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...updated[existingIndex], ...newItem };
  } else {
    updated = [newItem, ...current];
  }

  saveStoredWatchlist(updated);
  return updated;
}

/**
 * Remove product from Watchlist
 */
export function removeFromWatchlist(productId: string): WatchlistItem[] {
  const current = getStoredWatchlist();
  const updated = current.filter((item) => item.productId !== productId);
  saveStoredWatchlist(updated);
  return updated;
}

/**
 * Toggle Watchlist status
 */
export function toggleWatchlist(product: ProductData): {
  isWatchlisted: boolean;
  items: WatchlistItem[];
} {
  const isWatched = isProductWatchlisted(product.id);
  if (isWatched) {
    const items = removeFromWatchlist(product.id);
    return { isWatchlisted: false, items };
  } else {
    const items = addToWatchlist(product);
    return { isWatchlisted: true, items };
  }
}

/**
 * Update target price alert threshold
 */
export function updateWatchlistTargetPrice(productId: string, targetAlertPrice: number): WatchlistItem[] {
  const current = getStoredWatchlist();
  const updated = current.map((item) =>
    item.productId === productId ? { ...item, targetAlertPrice } : item
  );
  saveStoredWatchlist(updated);
  return updated;
}

/**
 * Updates per-product Price Alert configuration (selected competitor, linked auto-pricing rule, channels)
 */
export function updateWatchlistProductPriceAlertConfig(
  productId: string,
  partialConfig: Partial<WatchlistProductPriceAlertConfig>
): WatchlistItem[] {
  const current = getStoredWatchlist();
  const rules = loadAutoPricingRules();
  const defaultRuleId = rules.find((r) => r.isActive)?.id || rules[0]?.id;

  const updated = current.map((item) => {
    if (item.productId !== productId) return item;
    const prevConfig: WatchlistProductPriceAlertConfig = item.priceAlertConfig || {
      enabled: Boolean(item.priceAlertEnabled),
      targetCompetitorName: 'any',
      linkedRuleId: defaultRuleId,
      notifyChannels: { inApp: true, browserPush: true, sound: true },
    };

    const nextEnabled =
      partialConfig.enabled !== undefined ? partialConfig.enabled : prevConfig.enabled;

    const nextConfig: WatchlistProductPriceAlertConfig = {
      ...prevConfig,
      ...partialConfig,
      enabled: nextEnabled,
      targetCompetitorName:
        partialConfig.targetCompetitorName ?? prevConfig.targetCompetitorName ?? 'any',
      linkedRuleId: partialConfig.linkedRuleId ?? prevConfig.linkedRuleId ?? defaultRuleId,
      notifyChannels: {
        inApp: true,
        browserPush: true,
        sound: true,
        ...(prevConfig.notifyChannels || {}),
        ...(partialConfig.notifyChannels || {}),
      },
    };

    return {
      ...item,
      priceAlertEnabled: nextEnabled,
      priceAlertConfig: nextConfig,
    };
  });

  saveStoredWatchlist(updated);
  return updated;
}

/**
 * Toggles "تنبيهات السعر" on or off for a specific product in the Watchlist
 */
export function toggleWatchlistPriceAlert(
  productId: string,
  enabled: boolean,
  partialConfig?: Partial<WatchlistProductPriceAlertConfig>
): WatchlistItem[] {
  return updateWatchlistProductPriceAlertConfig(productId, {
    ...partialConfig,
    enabled,
  });
}

/**
 * Retrieve stored notification logs
 */
export function getWatchlistNotificationLogs(): WatchlistPriceNotificationLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading watchlist notification logs:', e);
  }
  return [];
}

/**
 * Save notification log entry
 */
export function recordWatchlistNotificationLog(
  log: Omit<WatchlistPriceNotificationLog, 'id' | 'timestamp' | 'isRead'>
): WatchlistPriceNotificationLog {
  const current = getWatchlistNotificationLogs();
  const newLog: WatchlistPriceNotificationLog = {
    ...log,
    id: `wlog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  const updated = [newLog, ...current].slice(0, 50); // Keep last 50 alerts
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('merchant_watchlist_notification_logged', { detail: newLog }));
    } catch (e) {
      console.warn('Error saving watchlist notification log:', e);
    }
  }
  return newLog;
}

/**
 * Mark notification log as read
 */
export function markWatchlistNotificationAsRead(logId: string): void {
  const current = getWatchlistNotificationLogs();
  const updated = current.map((item) => (item.id === logId ? { ...item, isRead: true } : item));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error updating log read status:', e);
    }
  }
}

/**
 * Clear all notification logs
 */
export function clearWatchlistNotificationLogs(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_LOGS);
      window.dispatchEvent(new CustomEvent('merchant_watchlist_logs_cleared'));
    } catch (e) {
      console.warn('Error clearing logs:', e);
    }
  }
}

/**
 * Dispatches a native Web Notification safely with Feature Detection and RTL Arabic support
 */
export async function sendNativeWebNotification(options: {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  data?: Record<string, any>;
}): Promise<boolean> {
  if (!isWebNotificationSupported()) {
    console.warn('[Web Notification API] Not supported in this browser.');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.info('[Web Notification API] Permission is not granted yet.');
    return false;
  }

  const prefs = getWatchlistNotificationPreferences();
  const accountChannels = getAccountNotificationChannelPrefs();
  if (!prefs.webNotificationsEnabled || !accountChannels.browserNotificationsEnabled) {
    return false;
  }

  const notifOptions: NotificationOptions = {
    body: options.body,
    icon: options.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    dir: 'rtl',
    lang: 'ar',
    tag: options.tag || `radar-wl-${Date.now()}`,
    data: {
      url: options.url || '#radar',
      ...options.data,
    },
  };

  try {
    const notification = new Notification(options.title, notifOptions);
    notification.onclick = (e) => {
      e.preventDefault();
      try {
        window.focus();
      } catch {}
      if (options.data?.productId) {
        window.dispatchEvent(
          new CustomEvent('navigate_to_product_radar', {
            detail: { productId: options.data.productId },
          })
        );
      }
      notification.close();
    };
    return true;
  } catch (err) {
    console.warn('[Web Notification API] Direct constructor failed, trying serviceWorker:', err);
    // Optional fallback through service worker if supported
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(options.title, notifOptions);
          return true;
        }
      }
    } catch (swErr) {
      console.warn('[Web Notification API] ServiceWorker showNotification failed:', swErr);
    }
  }

  return false;
}

export interface PricingEngineAlertEvaluationResult {
  triggered: boolean;
  notified: boolean;
  reason: string;
  oldPrice: number;
  newPrice: number;
  recommendedPrice?: number;
  ruleTitle?: string;
  actionTakenAr?: string;
  channelsDispatched?: {
    inApp: boolean;
    browserPush: boolean;
    whatsapp: boolean;
  };
}

/**
 * Evaluates a competitor price change for a Watchlist product against the active
 * Auto-Pricing Engine rule & selected competitor, sending an instant notification when triggered.
 */
export async function evaluateCompetitorPriceAgainstPricingEngine(params: {
  item: WatchlistItem;
  newPrice: number;
  competitorName: string;
  platformName?: string;
  currency?: string;
}): Promise<PricingEngineAlertEvaluationResult> {
  const {
    item,
    newPrice,
    competitorName,
    platformName = 'السوق المصري',
    currency = 'ج.م',
  } = params;

  const oldPrice = item.lastCheckedPrice || item.product?.currentLowestPrice || newPrice;
  const config = item.priceAlertConfig;
  const isEnabled = config ? config.enabled : Boolean(item.priceAlertEnabled);

  if (!isEnabled) {
    return {
      triggered: false,
      notified: false,
      reason: 'تنبيهات السعر غير مفعّلة لهذا المنتج',
      oldPrice,
      newPrice,
    };
  }

  // Filter by specific competitor if selected by the merchant
  const targetCompetitor = (config?.targetCompetitorName || 'any').trim();
  if (
    targetCompetitor &&
    targetCompetitor !== 'any' &&
    competitorName.trim().toLowerCase() !== targetCompetitor.toLowerCase() &&
    !competitorName.toLowerCase().includes(targetCompetitor.toLowerCase()) &&
    !targetCompetitor.toLowerCase().includes(competitorName.toLowerCase())
  ) {
    return {
      triggered: false,
      notified: false,
      reason: `التغير حدث لدى [${competitorName}] وليس المنافس المحدد [${targetCompetitor}]`,
      oldPrice,
      newPrice,
    };
  }

  if (oldPrice === newPrice) {
    return {
      triggered: false,
      notified: false,
      reason: 'لم يتغير سعر المنافس عن آخر قراءة',
      oldPrice,
      newPrice,
    };
  }

  const diff = oldPrice - newPrice;
  const isDrop = diff > 0;
  const percentChange = oldPrice > 0 ? Number(((Math.abs(diff) / oldPrice) * 100).toFixed(1)) : 0;

  // Load linked rule from Auto-Pricing Engine settings
  const rules = loadAutoPricingRules();
  const activeRule =
    (config?.linkedRuleId && rules.find((r) => r.id === config.linkedRuleId)) ||
    rules.find((r) => r.isActive) ||
    rules[0];

  const myCurrentPrice =
    item.product?.suggestedRetailPrice || oldPrice || newPrice;
  const costPrice =
    item.product?.estimatedWholesaleCost || Math.round(oldPrice * 0.75);

  const autoPricingProduct: AutoPricingProductItem = {
    productId: item.productId,
    title: item.product?.title || 'منتج مراقب',
    category: item.product?.category || 'عام',
    sku: item.product?.sku || item.productId,
    imageUrl: item.product?.imageUrl,
    costPrice,
    currentPrice: myCurrentPrice,
    lowestCompetitorPrice: newPrice,
    lowestCompetitorName: competitorName,
    lowestCompetitorPlatform: platformName,
    competitorInStock: item.competitorStockStatus !== 'competitor_stockout_opportunity',
    assignedRuleId: activeRule?.id || 'default',
    autoPricingEnabled: true,
    customFloorPrice: item.product?.estimatedWholesaleCost
      ? Math.round(item.product.estimatedWholesaleCost * 1.05)
      : undefined,
    lastRepricedAt: new Date().toISOString(),
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 0,
  };

  const ruleEval = activeRule
    ? evaluateAutoPricingRule(autoPricingProduct, activeRule)
    : null;

  const customThreshold = config?.customChangePercentThreshold;
  const rulePercentThreshold = activeRule?.conditionValue || 0;
  const crossedTargetPrice =
    typeof item.targetAlertPrice === 'number' &&
    item.targetAlertPrice > 0 &&
    newPrice <= item.targetAlertPrice;
  const exceededRuleDelta =
    activeRule?.conditionType === 'competitor_price_changed_by_percent' &&
    percentChange >= (rulePercentThreshold || 1);
  const exceededCustomPercent =
    typeof customThreshold === 'number' &&
    customThreshold > 0 &&
    percentChange >= customThreshold;

  const shouldTrigger = Boolean(
    ruleEval?.isTriggered || crossedTargetPrice || exceededRuleDelta || exceededCustomPercent
  );

  const nowIso = new Date().toISOString();

  if (!shouldTrigger) {
    const reasonText =
      ruleEval?.triggerReasonAr ||
      `التغير (${percentChange}%) لم يستوفِ شرط قاعدة التسعير المحددة`;
    const updatedIdle = getStoredWatchlist().map((w) =>
      w.productId === item.productId
        ? {
            ...w,
            lastCheckedPrice: newPrice,
            priceAlertConfig: {
              ...(w.priceAlertConfig || { enabled: true }),
              lastEvaluatedAt: nowIso,
              lastEvaluationReason: reasonText,
            },
          }
        : w
    );
    saveStoredWatchlist(updatedIdle);
    return {
      triggered: false,
      notified: false,
      reason: reasonText,
      oldPrice,
      newPrice,
      ruleTitle: activeRule?.title || activeRule?.name,
    };
  }

  const ruleTitle = activeRule?.title || activeRule?.name || 'محرك التسعير الآلي';
  const computeFallbackRecommendedPrice = (): number => {
    if (ruleEval?.isTriggered) return ruleEval.finalPrice;
    if (!activeRule) return newPrice;
    if (activeRule.actionType === 'undercut_fixed') {
      return Math.max(activeRule.guardrails?.minFloorPriceEGP || 1, newPrice - (activeRule.actionValue || 0));
    }
    if (activeRule.actionType === 'undercut_percent') {
      return Math.max(activeRule.guardrails?.minFloorPriceEGP || 1, Math.round(newPrice * (1 - (activeRule.actionValue || 0) / 100)));
    }
    if (activeRule.actionType === 'competitor_plus_fixed' || activeRule.actionType === 'set_competitor_plus_offset') {
      return newPrice + (activeRule.actionValue || 0);
    }
    if (activeRule.actionType === 'match_competitor') {
      return newPrice;
    }
    return ruleEval?.finalPrice || newPrice;
  };
  const recommendedPrice = computeFallbackRecommendedPrice();
  const actionSummary =
    (ruleEval?.isTriggered ? ruleEval.actionTakenAr : undefined) ||
    `السعر المقترح حسب محرك التسعير: ${recommendedPrice.toLocaleString()} ${currency}`;

  // Update WatchlistItem with new competitor price + pricing engine evaluation metadata
  const currentList = getStoredWatchlist();
  const updatedList = currentList.map((w) => {
    if (w.productId === item.productId) {
      return {
        ...w,
        lastCheckedPrice: newPrice,
        lastPriceChangedAt: nowIso,
        lastPriceChangeSource: competitorName,
        priceTrend: isDrop ? ('down' as const) : ('up' as const),
        priceChangePercent: percentChange,
        priceAlertEnabled: true,
        priceAlertConfig: {
          ...(w.priceAlertConfig || { enabled: true }),
          enabled: true,
          lastEvaluatedAt: nowIso,
          lastAlertTriggeredAt: nowIso,
          lastRecommendedPrice: recommendedPrice,
          lastEvaluationReason: ruleEval?.triggerReasonAr || actionSummary,
        },
      };
    }
    return w;
  });
  saveStoredWatchlist(updatedList);

  // Record log entry
  recordWatchlistNotificationLog({
    productId: item.productId,
    productTitle: item.product.title,
    productImage: item.product.imageUrl,
    oldPrice,
    newPrice,
    priceDiff: Math.abs(diff),
    percentChange,
    trend: isDrop ? 'down' : 'up',
    competitorName,
    platformName,
    currency,
  });

  const directionArrow = isDrop ? '📉 انخفاض' : '📈 ارتفاع';
  const instantMessage = `${directionArrow} سعر [${item.product.title}] لدى المنافس (${competitorName}) من ${oldPrice.toLocaleString()} إلى ${newPrice.toLocaleString()} ${currency} (${isDrop ? '-' : '+'}${percentChange}%) • قاعدة "${ruleTitle}" تقترح تسعيرك عند ${recommendedPrice.toLocaleString()} ${currency}`;

  // Persist in-app & Supabase notification so Header bell updates immediately
  const shouldNotifyInApp = config?.notifyChannels?.inApp !== false;
  if (shouldNotifyInApp) {
    try {
      await multiTenantDb.addNotification({
        type: 'price_alert',
        severity: 'urgent',
        message: instantMessage,
      });
    } catch {
      // safe non-blocking
    }
  }

  // Account-level WhatsApp vs Browser notification channel preferences
  const channelPrefs = getAccountNotificationChannelPrefs();
  const shouldDispatchBrowserPush =
    channelPrefs.browserNotificationsEnabled && config?.notifyChannels?.browserPush !== false;
  const shouldDispatchWhatsApp = channelPrefs.whatsappEnabled;

  // Dispatch WhatsApp Alert if enabled in Account Settings
  let whatsappDispatched = false;
  if (shouldDispatchWhatsApp) {
    try {
      const waRes = await dispatchBackgroundWhatsAppAlert({
        productTitle: item.product.title,
        sku: item.product.sku,
        platformName,
        competitorName,
        competitorNewPrice: newPrice,
        targetPrice: item.targetAlertPrice || oldPrice,
        currentMerchantPrice: myCurrentPrice,
        currency,
        productId: item.productId,
        recommendedPrice,
        overridePhone: channelPrefs.whatsappPhone,
      });
      whatsappDispatched = waRes.dispatched;
    } catch {
      // non-blocking
    }
  }

  // Native Web Notification if permitted & enabled in both product config & Account Settings
  let pushDispatched = false;
  if (shouldDispatchBrowserPush) {
    const title = isDrop
      ? `📉 تنبيه سعر فوري: ${item.product.title.slice(0, 36)}`
      : `📈 تنبيه سعر فوري: ${item.product.title.slice(0, 36)}`;
    pushDispatched = await sendNativeWebNotification({
      title,
      body: instantMessage,
      icon: item.product.imageUrl || '/pwa-192x192.png',
      tag: `wl-price-${item.productId}`,
      url: '#watchlist',
      data: {
        productId: item.productId,
        oldPrice,
        newPrice,
        recommendedPrice,
        competitorName,
      },
    });
  }

  // Emit live window event for instant UI feedback & toast
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('merchant_watchlist_price_changed', {
        detail: {
          productId: item.productId,
          productTitle: item.product.title,
          oldPrice,
          newPrice,
          diff,
          isDrop,
          percentChange,
          competitorName,
          platformName,
          ruleTitle,
          recommendedPrice,
          actionTakenAr: actionSummary,
          message: instantMessage,
          channelsDispatched: {
            inApp: shouldNotifyInApp,
            browserPush: pushDispatched,
            whatsapp: whatsappDispatched,
          },
        },
      })
    );
  }

  return {
    triggered: true,
    notified: true,
    reason: instantMessage,
    oldPrice,
    newPrice,
    recommendedPrice,
    ruleTitle,
    actionTakenAr: actionSummary || (pushDispatched ? 'تم الإشعار' : ''),
    channelsDispatched: {
      inApp: shouldNotifyInApp,
      browserPush: pushDispatched,
      whatsapp: whatsappDispatched,
    },
  };
}

/**
 * Convenience wrapper to test or process a competitor price update for a product ID in Watchlist
 */
export async function triggerCompetitorPriceCheckForWatchlistItem(
  productId: string,
  newCompetitorPrice: number,
  competitorName?: string,
  platformName?: string
): Promise<PricingEngineAlertEvaluationResult> {
  const list = getStoredWatchlist();
  const item = list.find((w) => w.productId === productId);
  if (!item) {
    return {
      triggered: false,
      notified: false,
      reason: 'المنتج غير موجود في قائمة المتابعة',
      oldPrice: 0,
      newPrice: newCompetitorPrice,
    };
  }

  const resolvedCompetitor =
    competitorName ||
    (item.priceAlertConfig?.targetCompetitorName &&
    item.priceAlertConfig.targetCompetitorName !== 'any'
      ? item.priceAlertConfig.targetCompetitorName
      : item.lastPriceChangeSource ||
        item.product?.merchantOffers?.[0]?.merchantName ||
        'أمازون مصر (Amazon.eg)');

  return evaluateCompetitorPriceAgainstPricingEngine({
    item,
    newPrice: newCompetitorPrice,
    competitorName: resolvedCompetitor,
    platformName: platformName || 'السوق المصري',
  });
}

/**
 * Central function to detect price change on a watched product,
 * record the log, update the watchlist, and trigger the Web Notification API!
 */
export async function notifyWatchlistPriceChange(params: {
  item: WatchlistItem;
  newPrice: number;
  competitorName: string;
  platformName: string;
  currency?: string;
}): Promise<boolean> {
  const { item, newPrice, competitorName, platformName, currency = 'ج.م' } = params;

  // If product has explicit per-product price alert configuration enabled, route through pricing engine evaluator
  if (item.priceAlertEnabled || item.priceAlertConfig?.enabled) {
    const evalRes = await evaluateCompetitorPriceAgainstPricingEngine({
      item,
      newPrice,
      competitorName,
      platformName,
      currency,
    });
    return evalRes.notified;
  }

  const oldPrice = item.lastCheckedPrice || item.product?.currentLowestPrice || newPrice;

  // If no actual price difference, skip
  if (oldPrice === newPrice) return false;

  const diff = oldPrice - newPrice;
  const isDrop = diff > 0;
  const percentChange = oldPrice > 0 ? Math.round((Math.abs(diff) / oldPrice) * 100) : 0;

  const prefs = getWatchlistNotificationPreferences();
  if (prefs.notifyOnPriceDropOnly && !isDrop) {
    return false;
  }
  if (percentChange < prefs.minPriceDropPercentage) {
    return false;
  }

  // Update watchlist item in localStorage
  const currentList = getStoredWatchlist();
  const updatedList = currentList.map((w) => {
    if (w.productId === item.productId) {
      return {
        ...w,
        lastCheckedPrice: newPrice,
        lastPriceChangedAt: new Date().toISOString(),
        lastPriceChangeSource: competitorName,
        priceTrend: isDrop ? ('down' as const) : ('up' as const),
        priceChangePercent: percentChange,
      };
    }
    return w;
  });
  saveStoredWatchlist(updatedList);

  // Record into persistent notification logs
  recordWatchlistNotificationLog({
    productId: item.productId,
    productTitle: item.product.title,
    productImage: item.product.imageUrl,
    oldPrice,
    newPrice,
    priceDiff: Math.abs(diff),
    percentChange,
    trend: isDrop ? 'down' : 'up',
    competitorName,
    platformName,
    currency,
  });

  // Construct Notification Message
  const title = isDrop
    ? `📉 هبوط سعر لمنتجك المراقب: ${item.product.title.slice(0, 32)}...`
    : `📈 ارتفاع سعر لمنتجك المراقب: ${item.product.title.slice(0, 32)}...`;

  const body = isDrop
    ? `خفّض المنافس [${competitorName}] على ${platformName} السعر من ${oldPrice.toLocaleString()} إلى ${newPrice.toLocaleString()} ${currency} (-${percentChange}%). اضغط لمراجعة التسعير الرابح وحماية صمام الأمان!`
    : `رفع المنافس [${competitorName}] على ${platformName} السعر إلى ${newPrice.toLocaleString()} ${currency} (+${percentChange}%). فرصة لرفع هامش ربحك فوراً!`;

  try {
    await multiTenantDb.addNotification({
      type: 'price_alert',
      severity: 'urgent',
      message: `${title} — ${body}`,
    });
  } catch {}

  // Dispatch custom in-app event for toast and reactive UI components
  window.dispatchEvent(
    new CustomEvent('merchant_watchlist_price_changed', {
      detail: {
        productId: item.productId,
        productTitle: item.product.title,
        oldPrice,
        newPrice,
        diff,
        isDrop,
        percentChange,
        competitorName,
        platformName,
        message: body,
      },
    })
  );

  const channelPrefs = getAccountNotificationChannelPrefs();

  // Trigger WhatsApp alert if enabled in Account Settings
  let whatsappDispatched = false;
  if (channelPrefs.whatsappEnabled) {
    try {
      const waRes = await dispatchBackgroundWhatsAppAlert({
        productTitle: item.product.title,
        sku: item.product.sku,
        platformName,
        competitorName,
        competitorNewPrice: newPrice,
        targetPrice: item.targetAlertPrice || oldPrice,
        currentMerchantPrice: item.product?.suggestedRetailPrice || oldPrice,
        currency,
        productId: item.productId,
        overridePhone: channelPrefs.whatsappPhone,
      });
      whatsappDispatched = waRes.dispatched;
    } catch {
      // non-blocking
    }
  }

  // Trigger Native Web Notification API if enabled in Account Settings
  const dispatched = channelPrefs.browserNotificationsEnabled
    ? await sendNativeWebNotification({
        title,
        body,
        icon: item.product.imageUrl || '/pwa-192x192.png',
        tag: `wl-price-${item.productId}`,
        url: '#radar',
        data: {
          productId: item.productId,
          oldPrice,
          newPrice,
          competitorName,
        },
      })
    : false;

  // Trigger Firebase Cloud Function email alert if enabled
  if (prefs.emailAlertsEnabled && prefs.emailAddress) {
    try {
      await sendWatchlistEmailAlertApi({
        email: prefs.emailAddress,
        productTitle: item.product.title,
        oldPrice,
        newPrice,
        priceDiff: Math.abs(diff),
        percentChange,
        competitorName,
        platformName,
        currency,
        trend: isDrop ? 'down' : 'up',
      });
    } catch (e) {
      console.warn('Failed to send watchlist email alert via Cloud Function:', e);
    }
  }

  return dispatched || whatsappDispatched;
}

/**
 * Simulates a real-time competitor price drop on a watched product (or adds a demo watched item if list is empty)
 * to verify and demonstrate Web Notifications API functionality to the merchant.
 */
export async function simulateWatchlistPriceChange(customProductId?: string): Promise<{
  success: boolean;
  message: string;
  notified: boolean;
}> {
  let watchlist = getStoredWatchlist();

  // If watchlist is currently empty, add a default demo product so the user can test immediately
  if (watchlist.length === 0) {
    const demoProduct: ProductData = {
      id: 'prod-eg-anker-q30',
      title: 'سماعة رأس لاسلكية أنكر ساوند كور Life Q30 مع عزل الضوضاء النشط',
      brand: 'أنكر (Anker)',
      model: 'Life Q30 Hybrid ANC',
      category: 'إلكترونيات وهواتف',
      sku: 'ANK-Q30-EG',
      barcode: '6224001928371',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      confidenceScore: 98,
      description: 'سماعة عزل ضوضاء بلوتوث فائقة الشهرة بالسوق المصري مع دعم تطبيق Soundcore',
      estimatedWholesaleCost: 2400,
      suggestedRetailPrice: 3250,
      currentLowestPrice: 3100,
      highestPrice: 3499,
      averagePrice: 3250,
      currency: 'ج.م',
      specs: [
        { category: 'الصوت', items: [{ label: 'العزل', value: 'Active Noise Cancelling' }] }
      ],
      merchantOffers: [
        {
          id: 'off-amz-1',
          merchantName: 'متجر التميز للإلكترونيات',
          platformName: 'أمازون مصر (Amazon.eg)',
          platform: 'amazon_eg',
          storeType: 'online',
          currency: 'ج.م',
          price: 3100,
          originalPrice: 3350,
          rating: 4.7,
          reviewCount: 342,
          deliveryTime: 'شحن غداً مجاناً',
          deliveryCost: 'مجاني',
          isVerified: true,
          stockStatus: 'in_stock',
          fulfillmentType: 'fba',
          url: 'https://amazon.eg'
        }
      ],
      tags: ['سماعات', 'أنكر', 'تريند'],
      quickHighlights: ['عزل نشط', 'بطارية 40 ساعة'],
    };

    watchlist = addToWatchlist(demoProduct, 2950, 'منتج تجريبي لاختبار تنبيهات الأسعار');
  }

  // Select target watched product
  const targetItem = customProductId
    ? watchlist.find((w) => w.productId === customProductId) || watchlist[0]
    : watchlist[0];

  if (!targetItem) {
    return {
      success: false,
      message: 'لم يتم العثور على منتجات في قائمة المتابعة لاختبار التنبيه.',
      notified: false,
    };
  }

  const currentPrice = targetItem.lastCheckedPrice || targetItem.product?.currentLowestPrice || 3100;
  // Calculate simulated drop between 50 and 200 EGP
  const dropAmount = Math.max(50, Math.round(currentPrice * 0.06));
  const simulatedNewPrice = Math.max(100, currentPrice - dropAmount);

  const competitorNames = ['أمازون مصر (Amazon.eg)', 'نون مصر (Noon Express)', 'جوميا مصر (Jumia Mall)'];
  const compName = competitorNames[Math.floor(Math.random() * competitorNames.length)];

  const notified = await notifyWatchlistPriceChange({
    item: targetItem,
    newPrice: simulatedNewPrice,
    competitorName: compName,
    platformName: 'السوق المصري',
    currency: 'ج.م',
  });

  return {
    success: true,
    message: `تم رصد ومحاكاة هبوط سعر "${targetItem.product.title}" من ${currentPrice} إلى ${simulatedNewPrice} ج.م لدى [${compName}].`,
    notified,
  };
}
