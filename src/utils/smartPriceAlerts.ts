export const PRICE_HISTORY_MAP_KEY = 'radar_product_price_history_v1';
export const PRICE_ALERT_SETTINGS_KEY = 'radar_price_alert_settings_v1';
export const SMART_PRICE_ALERTS_KEY = 'radar_smart_price_alerts_v1';
export const SMART_PRICE_ALERTS_UPDATED_EVENT = 'radar_smart_price_alerts_updated';

export interface PriceAlertSettings {
  changePercentThreshold: number; // default 10%
  minPriceLimit: number; // 0 = disabled, > 0 alerts when current price < minPriceLimit
  enabled: boolean;
}

export interface ProductPriceHistoryRecord {
  key: string;
  traderId: string;
  productId: string;
  sku: string;
  title: string;
  platform: string;
  lastPrice: number;
  minHistoricalPrice: number;
  maxHistoricalPrice: number;
  updatedAt: string;
  history: Array<{ price: number; recordedAt: string }>;
}

export type PriceAlertTriggerReason =
  | 'percent_drop'
  | 'percent_surge'
  | 'below_threshold'
  | 'below_and_percent';

export interface SmartPriceAlert {
  id: string;
  traderId: string;
  traderName?: string;
  productId: string;
  productTitle: string;
  sku: string;
  platform: string;
  historicalPrice: number;
  currentPrice: number;
  changePercent: number;
  absChangePercent: number;
  triggerReason: PriceAlertTriggerReason;
  thresholdLimit?: number;
  severity: 'critical' | 'warning' | 'info';
  isRead: boolean;
  detectedAt: string;
}

export const DEFAULT_PRICE_ALERT_SETTINGS: PriceAlertSettings = {
  changePercentThreshold: 10,
  minPriceLimit: 0,
  enabled: true,
};

function hasStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

export function getPriceAlertSettings(): PriceAlertSettings {
  if (!hasStorage()) return { ...DEFAULT_PRICE_ALERT_SETTINGS };
  try {
    const raw = localStorage.getItem(PRICE_ALERT_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_PRICE_ALERT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      changePercentThreshold:
        typeof parsed?.changePercentThreshold === 'number' && parsed.changePercentThreshold > 0
          ? parsed.changePercentThreshold
          : 10,
      minPriceLimit:
        typeof parsed?.minPriceLimit === 'number' && parsed.minPriceLimit >= 0
          ? parsed.minPriceLimit
          : 0,
      enabled: parsed?.enabled !== false,
    };
  } catch {
    return { ...DEFAULT_PRICE_ALERT_SETTINGS };
  }
}

export function savePriceAlertSettings(next: Partial<PriceAlertSettings>): PriceAlertSettings {
  const merged: PriceAlertSettings = {
    ...getPriceAlertSettings(),
    ...next,
  };
  if (hasStorage()) {
    try {
      localStorage.setItem(PRICE_ALERT_SETTINGS_KEY, JSON.stringify(merged));
    } catch {}
  }
  dispatchPriceAlertsUpdated();
  return merged;
}

export function getProductPriceHistoryMap(): Record<string, ProductPriceHistoryRecord> {
  if (!hasStorage()) return {};
  try {
    const raw = localStorage.getItem(PRICE_HISTORY_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getSmartPriceAlerts(): SmartPriceAlert[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(SMART_PRICE_ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSmartPriceAlerts(alerts: SmartPriceAlert[]): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(SMART_PRICE_ALERTS_KEY, JSON.stringify(alerts.slice(0, 150)));
  } catch {}
}

function dispatchPriceAlertsUpdated(): void {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(SMART_PRICE_ALERTS_UPDATED_EVENT));
    } catch {}
  }
}

export function markSmartPriceAlertRead(alertId: string): SmartPriceAlert[] {
  const next = getSmartPriceAlerts().map((a) =>
    a.id === alertId ? { ...a, isRead: true } : a
  );
  saveSmartPriceAlerts(next);
  dispatchPriceAlertsUpdated();
  return next;
}

export function markAllSmartPriceAlertsRead(): SmartPriceAlert[] {
  const next = getSmartPriceAlerts().map((a) => ({ ...a, isRead: true }));
  saveSmartPriceAlerts(next);
  dispatchPriceAlertsUpdated();
  return next;
}

export function dismissSmartPriceAlert(alertId: string): SmartPriceAlert[] {
  const next = getSmartPriceAlerts().filter((a) => a.id !== alertId);
  saveSmartPriceAlerts(next);
  dispatchPriceAlertsUpdated();
  return next;
}

export function buildProductHistoryKey(traderId: string, sku?: string, id?: string): string {
  const code = String(sku || id || '').trim().toUpperCase();
  return `${String(traderId || 'unknown').trim()}::${code}`;
}

export interface PullPriceComparableProduct {
  id?: string;
  trader_id?: string;
  title?: string;
  sku?: string;
  price?: number | string;
  previous_price?: number | string;
  old_price?: number | string;
  original_price?: number | string;
  historical_price?: number | string;
  min_price?: number | string;
  threshold_price?: number | string;
  platform?: string;
}

function toValidPositiveNumber(val: unknown): number {
  const n = typeof val === 'number' ? val : parseFloat(String(val ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Compares pulled products against recorded historical prices & configured limits.
 * Triggers an alert if:
 * 1) currentPrice drops below a configured threshold (global minPriceLimit or product min_price/threshold_price), OR
 * 2) currentPrice changes by >= changePercentThreshold (default 10%) relative to historicalPrice.
 */
export function evaluatePulledProductsForPriceAlerts(
  traderId: string,
  products: PullPriceComparableProduct[],
  options?: {
    traderName?: string;
    settingsOverride?: Partial<PriceAlertSettings>;
    recordHistory?: boolean;
  }
): SmartPriceAlert[] {
  if (!traderId || !Array.isArray(products) || products.length === 0) return [];

  const settings: PriceAlertSettings = {
    ...getPriceAlertSettings(),
    ...(options?.settingsOverride || {}),
  };
  if (!settings.enabled) return [];

  const historyMap = getProductPriceHistoryMap();
  const existingAlerts = getSmartPriceAlerts();
  const newlyDetected: SmartPriceAlert[] = [];
  const nowIso = new Date().toISOString();
  const shouldRecord = options?.recordHistory !== false;

  for (const prod of products) {
    const currentPrice = toValidPositiveNumber(prod.price);
    if (currentPrice <= 0) continue;

    const sku = String(prod.sku || prod.id || '').trim() || 'NO-SKU';
    const productId = String(prod.id || sku);
    const title = String(prod.title || 'منتج مسحوب').trim();
    const platform = String(prod.platform || 'amazon').trim();
    const histKey = buildProductHistoryKey(traderId, sku, productId);
    const existingHist = historyMap[histKey];

    const explicitHistorical =
      toValidPositiveNumber(prod.historical_price) ||
      toValidPositiveNumber(prod.previous_price) ||
      toValidPositiveNumber(prod.old_price) ||
      toValidPositiveNumber(prod.original_price);

    const historicalPrice = existingHist?.lastPrice || explicitHistorical || 0;

    const productMinLimit =
      toValidPositiveNumber(prod.threshold_price) || toValidPositiveNumber(prod.min_price);
    const activeThreshold = productMinLimit > 0 ? productMinLimit : settings.minPriceLimit;

    const isBelowThreshold = activeThreshold > 0 && currentPrice < activeThreshold;

    let changePercent = 0;
    let absChangePercent = 0;
    let isPercentTriggered = false;

    if (historicalPrice > 0 && currentPrice !== historicalPrice) {
      changePercent = Number((((currentPrice - historicalPrice) / historicalPrice) * 100).toFixed(1));
      absChangePercent = Math.abs(changePercent);
      isPercentTriggered = absChangePercent >= settings.changePercentThreshold;
    }

    if (isBelowThreshold || isPercentTriggered) {
      const isDrop = changePercent < 0;
      let triggerReason: PriceAlertTriggerReason = 'percent_drop';
      if (isBelowThreshold && isPercentTriggered) {
        triggerReason = 'below_and_percent';
      } else if (isBelowThreshold) {
        triggerReason = 'below_threshold';
      } else if (!isDrop) {
        triggerReason = 'percent_surge';
      }

      const severity: SmartPriceAlert['severity'] =
        isBelowThreshold || (isDrop && absChangePercent >= 15)
          ? 'critical'
          : isDrop || absChangePercent >= settings.changePercentThreshold
          ? 'warning'
          : 'info';

      const alreadyLoggedSameSnapshot = existingAlerts.some(
        (a) =>
          a.traderId === traderId &&
          a.sku.toUpperCase() === sku.toUpperCase() &&
          a.currentPrice === currentPrice &&
          a.historicalPrice === (historicalPrice || currentPrice) &&
          a.triggerReason === triggerReason
      );

      if (!alreadyLoggedSameSnapshot) {
        const alert: SmartPriceAlert = {
          id: `pa-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
          traderId,
          traderName: options?.traderName,
          productId,
          productTitle: title,
          sku,
          platform,
          historicalPrice: historicalPrice || currentPrice,
          currentPrice,
          changePercent,
          absChangePercent,
          triggerReason,
          thresholdLimit: isBelowThreshold ? activeThreshold : undefined,
          severity,
          isRead: false,
          detectedAt: nowIso,
        };
        newlyDetected.push(alert);
      }
    }

    if (shouldRecord) {
      const priorPoints = existingHist?.history ? [...existingHist.history] : [];
      if (!existingHist && explicitHistorical > 0 && explicitHistorical !== currentPrice) {
        priorPoints.push({ price: explicitHistorical, recordedAt: nowIso });
      }
      if (!existingHist || existingHist.lastPrice !== currentPrice) {
        priorPoints.push({ price: currentPrice, recordedAt: nowIso });
      }
      const trimmedPoints = priorPoints.slice(-30);
      const pricesList = trimmedPoints.map((p) => p.price);

      historyMap[histKey] = {
        key: histKey,
        traderId,
        productId,
        sku,
        title,
        platform,
        lastPrice: currentPrice,
        minHistoricalPrice:
          pricesList.length > 0 ? Math.min(...pricesList) : currentPrice,
        maxHistoricalPrice:
          pricesList.length > 0 ? Math.max(...pricesList) : currentPrice,
        updatedAt: nowIso,
        history: trimmedPoints,
      };
    }
  }

  if (shouldRecord && hasStorage()) {
    try {
      localStorage.setItem(PRICE_HISTORY_MAP_KEY, JSON.stringify(historyMap));
    } catch {}
  }

  if (newlyDetected.length > 0) {
    saveSmartPriceAlerts([...newlyDetected, ...existingAlerts]);
    dispatchPriceAlertsUpdated();
  }

  return newlyDetected;
}

/**
 * Scans all cached products across traders in localStorage against historical prices & active settings.
 */
export function scanCachedProductsForPriceAlerts(
  settingsOverride?: Partial<PriceAlertSettings>
): SmartPriceAlert[] {
  if (!hasStorage()) return [];
  const allDetected: SmartPriceAlert[] = [];

  try {
    const traderNameMap = new Map<string, string>();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('radar_multi_tenant_traders_')) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach((t: any) => {
              if (t?.id && t?.seller_name) traderNameMap.set(t.id, t.seller_name);
            });
          }
        }
      }
    }

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('radar_multi_tenant_products_')) {
        const traderId = k.replace('radar_multi_tenant_products_', '');
        const raw = localStorage.getItem(k);
        if (raw) {
          const prods = JSON.parse(raw);
          if (Array.isArray(prods) && prods.length > 0) {
            const detected = evaluatePulledProductsForPriceAlerts(traderId, prods, {
              traderName: traderNameMap.get(traderId),
              settingsOverride,
              recordHistory: true,
            });
            allDetected.push(...detected);
          }
        }
      }
    }
  } catch {}

  return allDetected;
}
