import { ProductData, WatchlistItem } from '../types';

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
}

const STORAGE_KEY_WATCHLIST = 'merchant_radar_watchlist_v1';
const STORAGE_KEY_LOGS = 'merchant_radar_watchlist_price_alerts_v1';
const STORAGE_KEY_PREFS = 'merchant_radar_watchlist_notif_prefs_v1';

export const DEFAULT_WATCHLIST_PREFS: WatchlistNotificationPreferences = {
  webNotificationsEnabled: true,
  soundAlertsEnabled: true,
  notifyOnPriceDropOnly: false,
  minPriceDropPercentage: 1, // Minimum 1% price change to trigger notification
};

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
  if (!prefs.webNotificationsEnabled) {
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
      },
    })
  );

  // Trigger Native Web Notification API
  const dispatched = await sendNativeWebNotification({
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
  });

  return dispatched;
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
