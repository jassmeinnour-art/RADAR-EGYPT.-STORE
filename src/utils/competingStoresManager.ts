import { Product, Trader } from '../lib/supabase';
import { saveCompetitorPricesLocally } from './sellerCentralExcelImporter';

export const RADAR_COMPETING_STORES_UPDATED_EVENT = 'radar_competing_stores_updated';
const STORAGE_PREFIX = 'radar_competing_stores_';
const LAST_DAILY_CHECK_KEY = 'radar_competing_stores_last_daily_check_v1';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface HarvestedStoreProduct {
  id: string;
  asin: string;
  title: string;
  price: number;
  imageUrl?: string;
  sellerId: string;
  productUrl?: string;
  matchType: 'exact_asin' | 'potential_title' | 'none';
  similarityPercent: number;
  matchedProductId?: string;
  matchedProductTitle?: string;
  matchedProductAsin?: string;
  matchedTraderPrice?: number;
  confirmed: boolean;
  rejected?: boolean;
}

export interface CompetingStoreItem {
  id: string;
  traderId: string;
  merchantSellerId: string;
  storeName: string;
  storeUrl: string;
  storeSellerId?: string;
  harvestedCount: number;
  matchedCount: number;
  avgPriceDiffAmount: number;
  avgPriceDiffPercent: number;
  pricePosition: 'cheaper' | 'expensive' | 'equal' | 'none';
  lastHarvestedAt: string;
  lastError?: string | null;
  products: HarvestedStoreProduct[];
}

export interface CheaperCompetitorAlert {
  id: string;
  traderId: string;
  traderName: string;
  storeId: string;
  storeName: string;
  storeUrl: string;
  competitorSellerId: string;
  productTitle: string;
  asin: string;
  competitorPrice: number;
  traderPrice: number;
  diffAmount: number;
  message: string;
}

export interface TraderCompetingStoresSummary {
  storesCount: number;
  totalHarvested: number;
  totalMatched: number;
  avgPriceDiffAmount: number;
  avgPriceDiffPercent: number;
  pricePosition: 'cheaper' | 'expensive' | 'equal' | 'none';
  cheaperAlertsCount: number;
  pendingConfirmationsCount: number;
}

function normalizeText(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getBigrams(str: string): Set<string> {
  const clean = str.replace(/\s+/g, '');
  const bigrams = new Set<string>();
  for (let i = 0; i < clean.length - 1; i++) {
    bigrams.add(clean.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Computes combined Arabic/English token overlap + character bigram Dice similarity (0..100).
 * Threshold >= 70% qualifies as "منافس محتمل".
 */
export function calculateTitleSimilarityPercent(titleA: string, titleB: string): number {
  const a = normalizeText(titleA);
  const b = normalizeText(titleB);
  if (!a || !b) return 0;
  if (a === b) return 100;

  const wordsA = new Set(a.split(' ').filter((w) => w.length > 1));
  const wordsB = new Set(b.split(' ').filter((w) => w.length > 1));

  let wordIntersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) wordIntersection++;
  });
  const wordUnion = new Set([...wordsA, ...wordsB]).size;
  const jaccardWords = wordUnion > 0 ? wordIntersection / wordUnion : 0;

  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);
  let bigramIntersection = 0;
  bigramsA.forEach((bg) => {
    if (bigramsB.has(bg)) bigramIntersection++;
  });
  const diceBigrams =
    bigramsA.size + bigramsB.size > 0
      ? (2 * bigramIntersection) / (bigramsA.size + bigramsB.size)
      : 0;

  // Weighted score leaning slightly toward shared meaningful words while preserving subword matches
  const combined = Math.max(jaccardWords, diceBigrams * 0.55 + jaccardWords * 0.45);
  return Math.min(100, Math.round(combined * 100));
}

export function resolveTraderMerchantSellerId(trader?: Partial<Trader> | null): string {
  if (!trader) return '';
  return String(
    trader.seller_id ||
      trader.seller_ids?.[trader.platform || 'amazon'] ||
      trader.id ||
      ''
  )
    .trim()
    .toUpperCase();
}

export function getTraderCompetingStores(traderId: string): CompetingStoreItem[] {
  if (typeof localStorage === 'undefined' || !traderId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${traderId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTraderCompetingStores(
  traderId: string,
  stores: CompetingStoreItem[]
): void {
  if (typeof localStorage === 'undefined' || !traderId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${traderId}`, JSON.stringify(stores));
    syncConfirmedStorePricesToCompetitorCache(stores);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(RADAR_COMPETING_STORES_UPDATED_EVENT, { detail: { traderId } })
      );
    }
  } catch {
    // non-fatal storage error
  }
}

function syncConfirmedStorePricesToCompetitorCache(stores: CompetingStoreItem[]): void {
  const bestByProduct = new Map<
    string,
    {
      product_id: string;
      asin: string;
      competitor_price: number;
      buy_box_price: number;
      competitors_count: number;
      competitor_seller_id: string;
      competitor_name: string;
      competitor_url: string;
      owner_seller_id: string;
      updated_at: string;
    }
  >();

  for (const store of stores) {
    const ownerSellerId = String(store.merchantSellerId || '').trim().toUpperCase();
    for (const prod of store.products || []) {
      if (prod.rejected || !prod.confirmed || !prod.matchedProductId) continue;
      const sellerId = String(prod.sellerId || store.storeSellerId || '').trim().toUpperCase();
      if (ownerSellerId && sellerId && sellerId === ownerSellerId) continue;
      if (!(prod.price > 0)) continue;

      const key = prod.matchedProductId;
      const existing = bestByProduct.get(key);
      if (!existing || prod.price < existing.competitor_price) {
        bestByProduct.set(key, {
          product_id: prod.matchedProductId,
          asin: (prod.matchedProductAsin || prod.asin || '').trim().toUpperCase(),
          competitor_price: prod.price,
          buy_box_price: prod.price,
          competitors_count: (existing?.competitors_count || 0) + 1,
          competitor_seller_id: sellerId,
          competitor_name: store.storeName,
          competitor_url: prod.productUrl || store.storeUrl,
          owner_seller_id: ownerSellerId,
          updated_at: store.lastHarvestedAt || new Date().toISOString(),
        });
      } else if (existing) {
        existing.competitors_count += 1;
      }
    }
  }

  const records = Array.from(bestByProduct.values());
  if (records.length > 0) {
    saveCompetitorPricesLocally(records);
  }
}

export function recalculateStoreStats(
  store: CompetingStoreItem
): CompetingStoreItem {
  const activeProducts = (store.products || []).filter((p) => !p.rejected);
  const matchedProducts = activeProducts.filter(
    (p) =>
      p.matchType === 'exact_asin' ||
      (p.matchType === 'potential_title' && !p.rejected)
  );

  // Average price diff uses matched products with valid trader price & competitor price
  // diff = competitorPrice - traderPrice (negative => competitor is cheaper!)
  const pricedComparisons = matchedProducts.filter(
    (p) =>
      Number(p.price) > 0 &&
      Number(p.matchedTraderPrice) > 0 &&
      (p.matchType === 'exact_asin' || p.confirmed)
  );

  let avgPriceDiffAmount = 0;
  let avgPriceDiffPercent = 0;
  let pricePosition: 'cheaper' | 'expensive' | 'equal' | 'none' = 'none';

  if (pricedComparisons.length > 0) {
    const diffs = pricedComparisons.map(
      (p) => Number(p.price) - Number(p.matchedTraderPrice)
    );
    const pcts = pricedComparisons.map(
      (p) =>
        ((Number(p.price) - Number(p.matchedTraderPrice)) /
          Number(p.matchedTraderPrice)) *
        100
    );
    avgPriceDiffAmount = Math.round(
      diffs.reduce((sum, v) => sum + v, 0) / pricedComparisons.length
    );
    avgPriceDiffPercent = Number(
      (pcts.reduce((sum, v) => sum + v, 0) / pricedComparisons.length).toFixed(1)
    );
    if (avgPriceDiffAmount < -1) pricePosition = 'cheaper';
    else if (avgPriceDiffAmount > 1) pricePosition = 'expensive';
    else pricePosition = 'equal';
  }

  return {
    ...store,
    harvestedCount: activeProducts.length,
    matchedCount: matchedProducts.length,
    avgPriceDiffAmount,
    avgPriceDiffPercent,
    pricePosition,
  };
}

export function matchHarvestedProductsToTraderCatalog(
  rawHarvested: Array<{
    asin?: string;
    title?: string;
    price?: number;
    imageUrl?: string;
    sellerId?: string;
    productUrl?: string;
  }>,
  traderProducts: Product[],
  merchantSellerId: string,
  previousProducts: HarvestedStoreProduct[] = []
): HarvestedStoreProduct[] {
  const cleanMerchantId = String(merchantSellerId || '').trim().toUpperCase();

  // Preserve previous confirm/reject decisions by ASIN or title
  const prevMap = new Map<string, HarvestedStoreProduct>();
  for (const prev of previousProducts) {
    const k = (prev.asin || prev.title).trim().toUpperCase();
    if (k) prevMap.set(k, prev);
  }

  const byAsin = new Map<string, Product>();
  for (const tp of traderProducts) {
    const asinKey = String(tp.asin || '').trim().toUpperCase();
    if (asinKey) byAsin.set(asinKey, tp);
  }

  const results: HarvestedStoreProduct[] = [];
  for (let i = 0; i < rawHarvested.length; i++) {
    const item = rawHarvested[i];
    const itemSellerId = String(item.sellerId || '').trim().toUpperCase();
    // Strict self-merchant exclusion
    if (cleanMerchantId && itemSellerId && itemSellerId === cleanMerchantId) {
      continue;
    }

    const price = Number(item.price || 0);
    const title = String(item.title || '').trim();
    const asin = String(item.asin || '').trim().toUpperCase();
    if (!title || !(price > 0)) continue;

    let matchType: HarvestedStoreProduct['matchType'] = 'none';
    let similarityPercent = 0;
    let matchedProduct: Product | undefined;

    if (asin && byAsin.has(asin)) {
      matchedProduct = byAsin.get(asin);
      matchType = 'exact_asin';
      similarityPercent = 100;
    } else {
      let bestScore = 0;
      let bestProd: Product | undefined;
      for (const tp of traderProducts) {
        const score = calculateTitleSimilarityPercent(title, tp.title || '');
        if (score >= 70 && score > bestScore) {
          bestScore = score;
          bestProd = tp;
        }
      }
      if (bestProd && bestScore >= 70) {
        matchedProduct = bestProd;
        matchType = 'potential_title';
        similarityPercent = bestScore;
      }
    }

    const prevKey = (asin || title).trim().toUpperCase();
    const prevRecord = prevMap.get(prevKey);

    const confirmed =
      matchType === 'exact_asin'
        ? true
        : prevRecord?.confirmed === true
        ? true
        : false;
    const rejected = prevRecord?.rejected === true ? true : false;

    results.push({
      id: `hsp-${asin || i}-${Date.now()}`,
      asin,
      title,
      price,
      imageUrl: item.imageUrl || undefined,
      sellerId: itemSellerId,
      productUrl: item.productUrl || undefined,
      matchType,
      similarityPercent,
      matchedProductId: matchedProduct?.id,
      matchedProductTitle: matchedProduct?.title,
      matchedProductAsin: matchedProduct?.asin || matchedProduct?.sku,
      matchedTraderPrice: matchedProduct ? Number(matchedProduct.price || 0) : undefined,
      confirmed,
      rejected,
    });
  }

  return results;
}

export async function harvestSingleCompetingStore(params: {
  trader: Trader;
  storeUrl: string;
  storeName?: string;
  traderProducts: Product[];
  existingStoreId?: string;
  previousProducts?: HarvestedStoreProduct[];
}): Promise<CompetingStoreItem> {
  const merchantSellerId = resolveTraderMerchantSellerId(params.trader);
  const cleanUrl = params.storeUrl.trim();

  const res = await fetch('/api/ai/harvest-store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeUrl: cleanUrl,
      merchantSellerId,
      traderId: params.trader.id,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(
      data?.error || 'تعذر حصد المتجر المنافس — تأكد من صحة الرابط وأنه يحتوي على أسعار حقيقية.'
    );
  }

  const rawList = Array.isArray(data.harvestedProducts) ? data.harvestedProducts : [];
  const matchedProducts = matchHarvestedProductsToTraderCatalog(
    rawList,
    params.traderProducts,
    merchantSellerId,
    params.previousProducts
  );

  const storeItem: CompetingStoreItem = {
    id: params.existingStoreId || `cstore-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    traderId: params.trader.id,
    merchantSellerId,
    storeName:
      params.storeName?.trim() ||
      data.storeName ||
      (data.storeSellerId ? `متجر (${data.storeSellerId})` : 'متجر منافس'),
    storeUrl: cleanUrl,
    storeSellerId: data.storeSellerId || '',
    harvestedCount: matchedProducts.length,
    matchedCount: 0,
    avgPriceDiffAmount: 0,
    avgPriceDiffPercent: 0,
    pricePosition: 'none',
    lastHarvestedAt: new Date().toISOString(),
    lastError: null,
    products: matchedProducts,
  };

  return recalculateStoreStats(storeItem);
}

export function getCheaperAlertsForStores(
  stores: CompetingStoreItem[],
  traderName: string
): CheaperCompetitorAlert[] {
  const alerts: CheaperCompetitorAlert[] = [];

  for (const store of stores) {
    const ownerId = String(store.merchantSellerId || '').trim().toUpperCase();
    for (const prod of store.products || []) {
      if (prod.rejected || !prod.confirmed) continue;
      const sellerId = String(prod.sellerId || store.storeSellerId || '').trim().toUpperCase();
      if (ownerId && sellerId && sellerId === ownerId) continue;

      const compPrice = Number(prod.price || 0);
      const traderPrice = Number(prod.matchedTraderPrice || 0);
      if (compPrice > 0 && traderPrice > 0 && compPrice < traderPrice) {
        const productName = prod.matchedProductTitle || prod.title;
        alerts.push({
          id: `alert-${store.id}-${prod.id}`,
          traderId: store.traderId,
          traderName,
          storeId: store.id,
          storeName: store.storeName,
          storeUrl: prod.productUrl || store.storeUrl,
          competitorSellerId: sellerId,
          productTitle: productName,
          asin: prod.matchedProductAsin || prod.asin,
          competitorPrice: compPrice,
          traderPrice,
          diffAmount: Math.round((traderPrice - compPrice) * 100) / 100,
          message: `منافس أرخص منك في ${productName} - سعره ${compPrice.toLocaleString()} ج.م - سعرك ${traderPrice.toLocaleString()} ج.م`,
        });
      }
    }
  }

  return alerts;
}

export function getAllCheaperCompetitorAlerts(traders: Trader[]): CheaperCompetitorAlert[] {
  const allAlerts: CheaperCompetitorAlert[] = [];
  for (const trader of traders) {
    const stores = getTraderCompetingStores(trader.id);
    allAlerts.push(...getCheaperAlertsForStores(stores, trader.seller_name));
  }
  return allAlerts.sort((a, b) => b.diffAmount - a.diffAmount);
}

export function getTraderCompetingStoresSummary(
  trader: Trader
): TraderCompetingStoresSummary {
  const stores = getTraderCompetingStores(trader.id);
  if (stores.length === 0) {
    return {
      storesCount: 0,
      totalHarvested: 0,
      totalMatched: 0,
      avgPriceDiffAmount: 0,
      avgPriceDiffPercent: 0,
      pricePosition: 'none',
      cheaperAlertsCount: 0,
      pendingConfirmationsCount: 0,
    };
  }

  const totalHarvested = stores.reduce((sum, s) => sum + (s.harvestedCount || 0), 0);
  const totalMatched = stores.reduce((sum, s) => sum + (s.matchedCount || 0), 0);
  const pricedStores = stores.filter((s) => s.pricePosition !== 'none');
  const avgPriceDiffAmount =
    pricedStores.length > 0
      ? Math.round(
          pricedStores.reduce((sum, s) => sum + s.avgPriceDiffAmount, 0) / pricedStores.length
        )
      : 0;
  const avgPriceDiffPercent =
    pricedStores.length > 0
      ? Number(
          (
            pricedStores.reduce((sum, s) => sum + s.avgPriceDiffPercent, 0) /
            pricedStores.length
          ).toFixed(1)
        )
      : 0;

  let pricePosition: 'cheaper' | 'expensive' | 'equal' | 'none' = 'none';
  if (pricedStores.length > 0) {
    if (avgPriceDiffAmount < -1) pricePosition = 'cheaper';
    else if (avgPriceDiffAmount > 1) pricePosition = 'expensive';
    else pricePosition = 'equal';
  }

  const cheaperAlertsCount = getCheaperAlertsForStores(stores, trader.seller_name).length;
  const pendingConfirmationsCount = stores.reduce(
    (sum, s) =>
      sum +
      (s.products || []).filter(
        (p) => p.matchType === 'potential_title' && !p.confirmed && !p.rejected
      ).length,
    0
  );

  return {
    storesCount: stores.length,
    totalHarvested,
    totalMatched,
    avgPriceDiffAmount,
    avgPriceDiffPercent,
    pricePosition,
    cheaperAlertsCount,
    pendingConfirmationsCount,
  };
}

export async function checkAllCompetingStoresDaily(
  traders: Trader[],
  productsByTraderId: Map<string, Product[]>,
  force = false
): Promise<{
  checkedStoresCount: number;
  alerts: CheaperCompetitorAlert[];
  lastCheckedAt: string;
}> {
  const nowMs = Date.now();
  let lastGlobalCheckMs = 0;
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(LAST_DAILY_CHECK_KEY);
    if (raw) {
      const parsed = Date.parse(raw);
      if (Number.isFinite(parsed)) lastGlobalCheckMs = parsed;
    }
  }

  const dueForCheck = force || nowMs - lastGlobalCheckMs >= TWENTY_FOUR_HOURS_MS;
  let checkedStoresCount = 0;

  if (dueForCheck) {
    for (const trader of traders) {
      const existingStores = getTraderCompetingStores(trader.id);
      if (existingStores.length === 0) continue;

      const traderCatalog = productsByTraderId.get(trader.id) || [];
      const updatedStores: CompetingStoreItem[] = [];

      for (const store of existingStores) {
        const lastHarvestMs = store.lastHarvestedAt ? Date.parse(store.lastHarvestedAt) : 0;
        const storeOverdue =
          force || !Number.isFinite(lastHarvestMs) || nowMs - lastHarvestMs >= TWENTY_FOUR_HOURS_MS;

        if (!storeOverdue) {
          updatedStores.push(store);
          continue;
        }

        try {
          const refreshed = await harvestSingleCompetingStore({
            trader,
            storeUrl: store.storeUrl,
            storeName: store.storeName,
            traderProducts: traderCatalog,
            existingStoreId: store.id,
            previousProducts: store.products,
          });
          updatedStores.push(refreshed);
          checkedStoresCount++;
        } catch (err: any) {
          updatedStores.push({
            ...store,
            lastError: err?.message || 'تعذر التحديث التلقائي اليومي لهذا الرابط',
          });
        }
      }

      saveTraderCompetingStores(trader.id, updatedStores);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LAST_DAILY_CHECK_KEY, new Date(nowMs).toISOString());
    }
  }

  return {
    checkedStoresCount,
    alerts: getAllCheaperCompetitorAlerts(traders),
    lastCheckedAt: new Date(nowMs).toISOString(),
  };
}
