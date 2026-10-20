import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  limit 
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
  FIVE_MINUTES_MS,
  isFirestoreQuotaError,
  isFirestoreQuotaExhausted,
  markFirestoreQuotaExhausted,
  isFirestoreCacheFresh,
  markFirestoreCacheFetched,
  registerFirestoreListener,
} from '../db';
import { ProductData, WatchlistItem, PriceAlert, ProductInventoryRecord, ConnectedMerchantPlatform, RemoteMerchantClient } from '../types';
import { triggerGlobalAsyncStart, triggerGlobalAsyncEnd } from '../context/AsyncOperationsContext';
import { encryptLwaRefreshToken, decryptLwaRefreshToken, isEncryptedLwaToken } from '../utils/lwaTokenCrypto';

const LOCAL_CACHE_PREFIX = 'merchant_radar_fs_data_';
const MERCHANT_STORES_LOCAL_KEY = 'merchant_radar_merchant_stores_fs_cache_v1';

function readLocalCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`${LOCAL_CACHE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export interface SavedStudioDesign {
  id: string;
  userId: string;
  productId?: string;
  title: string;
  aspectRatio?: string;
  backgroundTheme?: string;
  imageData: string; // Base64 or URL
  createdAt?: any;
}

// 1. Sync Watchlist
export async function saveWatchlistToCloud(userId: string, items: WatchlistItem[]): Promise<void> {
  const path = `users/${userId}/watchlist`;
  writeLocalCache(`watchlist_${userId}`, items);
  if (isFirestoreQuotaExhausted()) return;

  const opId = triggerGlobalAsyncStart('database', 'حفظ قائمة المراقبة في Firestore', `مزامنة ${items.length} منتجات مراقبة`);
  try {
    for (const item of items) {
      const docId = item.productId;
      const docRef = doc(db, path, docId);
      await setDoc(docRef, {
        id: docId,
        userId: userId,
        productId: item.productId,
        productTitle: item.product?.title || item.productId,
        targetPrice: item.targetAlertPrice || item.product?.suggestedRetailPrice || 0,
        currentPrice: item.lastCheckedPrice || item.product?.currentLowestPrice || 0,
        competitor: item.lastPriceChangeSource || 'سوق محلي',
        priceTrend: item.priceTrend || 'stable',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
    }
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ قائمة المراقبة بالسحابة', 'database');
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ قائمة المراقبة محلياً', 'database');
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToWatchlist(userId: string, onUpdate: (items: WatchlistItem[]) => void) {
  const cacheKey = `watchlist_${userId}`;
  const cached = readLocalCache<WatchlistItem[]>(cacheKey, []);
  if (cached.length > 0) {
    onUpdate(cached);
  }

  if (isFirestoreQuotaExhausted() || isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS)) {
    return () => {};
  }

  const path = `users/${userId}/watchlist`;
  try {
    let unsub: (() => void) | null = null;
    unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        markFirestoreCacheFetched(cacheKey);
        const items: WatchlistItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            productId: data.productId || docSnap.id,
            product: {
              id: data.productId || docSnap.id,
              title: data.productTitle || 'منتج مراقب',
              suggestedRetailPrice: data.targetPrice || 0,
              currentLowestPrice: data.currentPrice || 0,
            } as any,
            addedAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            lastCheckedPrice: data.currentPrice || 0,
            priceTrend: data.priceTrend || 'stable',
            priceChangePercent: 0,
            competitorStockStatus: 'normal',
            targetAlertPrice: data.targetPrice || 0,
            autoTrack: true,
          });
        });
        if (items.length > 0) {
          writeLocalCache(cacheKey, items);
          onUpdate(items);
        }
        if (unsub) {
          try {
            unsub();
          } catch {
            // ignore
          }
        }
      },
      (error) => {
        if (isFirestoreQuotaError(error)) {
          markFirestoreQuotaExhausted(error);
        }
        if (unsub) {
          try {
            unsub();
          } catch {
            // ignore
          }
        }
      }
    );
    return registerFirestoreListener(unsub);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// 2. Sync Price Alerts
export async function savePriceAlertsToCloud(userId: string, alerts: PriceAlert[]): Promise<void> {
  const path = `users/${userId}/alerts`;
  writeLocalCache(`alerts_${userId}`, alerts);
  if (isFirestoreQuotaExhausted()) return;

  const opId = triggerGlobalAsyncStart('database', 'حفظ تنبيهات الأسعار في Firestore', `مزامنة ${alerts.length} تنبيهات`);
  try {
    for (const alert of alerts) {
      const docRef = doc(db, path, alert.id);
      await setDoc(docRef, {
        id: alert.id,
        userId: userId,
        productId: alert.productId,
        productTitle: alert.productTitle || 'منتج',
        triggerCondition: alert.triggerCondition || 'drop_below',
        targetPrice: alert.targetPrice || 0,
        channel: alert.channel || 'whatsapp',
        isActive: alert.isActive !== false,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
    }
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ تنبيهات الأسعار بالسحابة', 'database');
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ تنبيهات الأسعار محلياً', 'database');
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Sync Inventory Records
export async function saveInventoryToCloud(userId: string, inventory: ProductInventoryRecord[]): Promise<void> {
  const path = `users/${userId}/inventory`;
  writeLocalCache(`inventory_${userId}`, inventory);
  if (isFirestoreQuotaExhausted()) return;

  const opId = triggerGlobalAsyncStart('database', 'مزامنة المخزون مع السحابة (Firestore)', `تحديث بيانات ${inventory.length} صنف`);
  try {
    for (const item of inventory) {
      const docId = item.productId;
      const docRef = doc(db, path, docId);
      await setDoc(docRef, {
        id: docId,
        userId: userId,
        productId: item.productId,
        sku: item.sku || 'SKU-EG',
        currentStock: item.currentStock || 0,
        minReorderLevel: item.minReorderLevel || 0,
        maxStockLevel: item.maxStockLevel || 0,
        costPerUnitEGP: item.costPerUnitEGP || 0,
        totalInventoryValuationEGP: item.totalInventoryValuationEGP || 0,
        warehouseLocation: item.warehouseLocation || 'مستودع القاهرة',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
    }
    triggerGlobalAsyncEnd(opId, true, 'تم تحديث المخزون بالسحابة', 'database');
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم تحديث المخزون محلياً', 'database');
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchInventoryFromCloud(userId: string): Promise<Partial<ProductInventoryRecord>[]> {
  const cacheKey = `inventory_${userId}`;
  const cached = readLocalCache<Partial<ProductInventoryRecord>[]>(cacheKey, []);
  if (isFirestoreQuotaExhausted() || (cached.length > 0 && isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS))) {
    return cached;
  }

  const path = `users/${userId}/inventory`;
  const opId = triggerGlobalAsyncStart('database', 'استرجاع المخزون من السحابة (Firestore)', 'جاري جلب أحدث بيانات المستودعات');
  try {
    const snap = await getDocs(collection(db, path));
    const items: Partial<ProductInventoryRecord>[] = [];
    snap.forEach((docSnap) => {
      items.push(docSnap.data() as Partial<ProductInventoryRecord>);
    });
    markFirestoreCacheFetched(cacheKey);
    writeLocalCache(cacheKey, items);
    triggerGlobalAsyncEnd(opId, true, `تم استرجاع ${items.length} صنف من السحابة`, 'database');
    return items;
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم استرجاع المخزون من الذاكرة المحلية', 'database');
    handleFirestoreError(error, OperationType.GET, path);
    return cached;
  }
}

// 4. Save and Retrieve Studio Designs (Images Created & Edited)
export async function saveStudioDesignToCloud(
  userId: string, 
  design: Omit<SavedStudioDesign, 'userId' | 'createdAt'>
): Promise<void> {
  const cacheKey = `studio_designs_${userId}`;
  const existing = readLocalCache<SavedStudioDesign[]>(cacheKey, []);
  const newDesign: SavedStudioDesign = { ...design, userId, createdAt: new Date().toISOString() };
  writeLocalCache(cacheKey, [newDesign, ...existing.filter(d => d.id !== design.id)].slice(0, 20));

  if (isFirestoreQuotaExhausted()) return;

  const path = `users/${userId}/studio_designs`;
  const opId = triggerGlobalAsyncStart('database', 'حفظ تصميم الاستوديو في السحابة', design.title || 'تصميم جديد');
  try {
    const docRef = doc(db, path, design.id);
    await setDoc(docRef, {
      ...design,
      userId,
      createdAt: serverTimestamp(),
    });
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ صورة المنتج بالسحابة', 'database');
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ التصميم محلياً', 'database');
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchStudioDesignsFromCloud(userId: string): Promise<SavedStudioDesign[]> {
  const cacheKey = `studio_designs_${userId}`;
  const cached = readLocalCache<SavedStudioDesign[]>(cacheKey, []);
  if (isFirestoreQuotaExhausted() || (cached.length > 0 && isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS))) {
    return cached;
  }

  const path = `users/${userId}/studio_designs`;
  const opId = triggerGlobalAsyncStart('database', 'تحميل تصميمات الاستوديو من السحابة', 'جاري جلب الصور المحفوظة');
  try {
    const snap = await getDocs(query(collection(db, path), limit(20)));
    const designs: SavedStudioDesign[] = [];
    snap.forEach((docSnap) => {
      designs.push(docSnap.data() as SavedStudioDesign);
    });
    markFirestoreCacheFetched(cacheKey);
    writeLocalCache(cacheKey, designs);
    triggerGlobalAsyncEnd(opId, true, `تم تحميل ${designs.length} تصميم من السحابة`, 'database');
    return designs;
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم تحميل التصميمات المحفوظة محلياً', 'database');
    handleFirestoreError(error, OperationType.GET, path);
    return cached;
  }
}

export async function deleteStudioDesignFromCloud(userId: string, designId: string): Promise<void> {
  const cacheKey = `studio_designs_${userId}`;
  const existing = readLocalCache<SavedStudioDesign[]>(cacheKey, []);
  writeLocalCache(cacheKey, existing.filter(d => d.id !== designId));

  if (isFirestoreQuotaExhausted()) return;

  const path = `users/${userId}/studio_designs`;
  const opId = triggerGlobalAsyncStart('database', 'حذف تصميم من السحابة (Firestore)', designId);
  try {
    await deleteDoc(doc(db, path, designId));
    triggerGlobalAsyncEnd(opId, true, 'تم حذف التصميم من السحابة', 'database');
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم حذف التصميم محلياً', 'database');
    handleFirestoreError(error, OperationType.DELETE, `${path}/${designId}`);
  }
}

// 5. Sync Merchant Platforms and Gmail-linked accounts
export async function savePlatformsToCloud(
  userId: string,
  platforms: ConnectedMerchantPlatform[],
  linkedGmail?: string
): Promise<void> {
  const cacheKey = `platforms_${userId}`;
  writeLocalCache(cacheKey, platforms);
  if (isFirestoreQuotaExhausted()) return;

  const path = `users/${userId}/platforms`;
  const opId = triggerGlobalAsyncStart('database', 'حفظ منصات التاجر وربط Gmail في السحابة', `مزامنة ${platforms.length} منصة`);
  try {
    for (const plat of platforms) {
      const docRef = doc(db, path, plat.id);
      await setDoc(docRef, {
        id: plat.id,
        name: plat.name,
        code: plat.code,
        category: plat.category || 'marketplace',
        sellerName: plat.sellerName || '',
        sellerId: plat.sellerId || '',
        merchantEmail: plat.merchantEmail || linkedGmail || '',
        sellerPortalUrl: plat.sellerPortalUrl || '',
        isGmailLinked: plat.isGmailLinked ?? false,
        linkedGmail: plat.linkedGmail || linkedGmail || '',
        isConnected: plat.isConnected ?? true,
        autoSyncPrice: plat.autoSyncPrice ?? true,
        status: plat.status || 'active',
        commissionFeePercent: plat.commissionFeePercent || 0,
        lastSyncedAt: plat.lastSyncedAt || 'الآن',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ ربط المنصات السحابي بنجاح', 'database');
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ المنصات محلياً', 'database');
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchPlatformsFromCloud(userId: string): Promise<Partial<ConnectedMerchantPlatform>[]> {
  const cacheKey = `platforms_${userId}`;
  const cached = readLocalCache<Partial<ConnectedMerchantPlatform>[]>(cacheKey, []);
  if (isFirestoreQuotaExhausted() || (cached.length > 0 && isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS))) {
    return cached;
  }

  const path = `users/${userId}/platforms`;
  const opId = triggerGlobalAsyncStart('database', 'استرجاع المنصات المرتبطة بالسحابة', 'جاري جلب حسابات المنصات المرتبطة');
  try {
    const snap = await getDocs(collection(db, path));
    const list: Partial<ConnectedMerchantPlatform>[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Partial<ConnectedMerchantPlatform>);
    });
    markFirestoreCacheFetched(cacheKey);
    writeLocalCache(cacheKey, list);
    triggerGlobalAsyncEnd(opId, true, `تم استرجاع ${list.length} منصات مرتبطة`, 'database');
    return list;
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم استرجاع المنصات من الذاكرة المحلية', 'database');
    handleFirestoreError(error, OperationType.GET, path);
    return cached;
  }
}

// 6. Sync Live Merchant Products
export async function saveLiveProductsToCloud(userId: string, products: ProductData[]): Promise<void> {
  const cacheKey = `products_${userId}`;
  writeLocalCache(cacheKey, products);
  if (isFirestoreQuotaExhausted()) return;

  const path = `users/${userId}/products`;
  const opId = triggerGlobalAsyncStart('database', 'مزامنة منتجات المتجر الحقيقية في Firestore', `حفظ ${products.length} منتجات فعلية`);
  try {
    for (const p of products) {
      const docRef = doc(db, path, p.id);
      await setDoc(docRef, {
        id: p.id,
        userId,
        title: p.title || 'منتج',
        brand: p.brand || '',
        category: p.category || '',
        suggestedRetailPrice: p.suggestedRetailPrice || 0,
        estimatedWholesaleCost: p.estimatedWholesaleCost || 0,
        currentLowestPrice: p.currentLowestPrice || 0,
        imageUrl: p.imageUrl || '',
        sku: p.sku || '',
        currency: p.currency || 'EGP',
        merchantOffers: p.merchantOffers || [],
        quickHighlights: p.quickHighlights || [],
        specs: p.specs || [],
        seoListing: p.seoListing || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ المنتجات الفعلية بالسحابة', 'database');
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ المنتجات محلياً', 'database');
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchLiveProductsFromCloud(userId: string): Promise<ProductData[]> {
  const cacheKey = `products_${userId}`;
  const cached = readLocalCache<ProductData[]>(cacheKey, []);
  if (isFirestoreQuotaExhausted() || (cached.length > 0 && isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS))) {
    return cached;
  }

  const path = `users/${userId}/products`;
  const opId = triggerGlobalAsyncStart('database', 'استرجاع المنتجات من السحابة (Firestore)', 'جاري جلب قائمة المنتجات الفعلية');
  try {
    const snap = await getDocs(collection(db, path));
    const items: ProductData[] = [];
    snap.forEach((docSnap) => {
      items.push(docSnap.data() as ProductData);
    });
    markFirestoreCacheFetched(cacheKey);
    writeLocalCache(cacheKey, items);
    triggerGlobalAsyncEnd(opId, true, `تم استرجاع ${items.length} منتجات من السحابة`, 'database');
    return items;
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم استرجاع المنتجات من الذاكرة المحلية', 'database');
    handleFirestoreError(error, OperationType.GET, path);
    return cached;
  }
}

// 7. Multi-Tenant Merchant Store Credentials in Cloud Firestore (/merchant_stores/{merchantId})
export interface FirestoreMerchantStoreRecord {
  id: string;
  storeName: string;
  contactPerson?: string;
  primaryEmail?: string;
  phone?: string;
  city?: string;
  platformsSubscribed?: string[];
  amazonRefreshToken?: string;
  amazonRefreshTokenEncrypted?: boolean;
  amazonTokenStatus?: 'valid' | 'expired' | 'missing';
  amazonSellerId?: string;
  amazonRegion?: string;
  amazonMarketplaceId?: string;
  noonAuthKey?: string;
  noonAppId?: string;
  bostaApiKey?: string;
  dataMode?: 'live' | 'demo';
  isConfigured?: boolean;
  updatedAt?: string;
}

function getLocalCachedMerchantStoresMap(): Record<string, FirestoreMerchantStoreRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MERCHANT_STORES_LOCAL_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function saveLocalCachedMerchantStoresMap(map: Record<string, FirestoreMerchantStoreRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MERCHANT_STORES_LOCAL_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Saves or updates a specific merchant store's record in LocalStorage cache and Firestore (with Quota protection).
 * Always encrypts `amazonRefreshToken` at rest (`ENC_LWA_V1:...`) per Amazon SP-API security guidelines.
 */
export async function saveMerchantStoreCredentialsToFirestore(
  merchant: RemoteMerchantClient
): Promise<boolean> {
  if (!merchant || !merchant.id) return false;
  const creds = merchant.apiCredentials;
  const amazonPlat = merchant.platformCredentials?.['amazon_eg'];
  const rawRefreshToken = (
    creds?.amazonRefreshToken ||
    amazonPlat?.mwsAuthToken ||
    ''
  ).trim();
  const encryptedRefreshToken = rawRefreshToken ? encryptLwaRefreshToken(rawRefreshToken) : '';
  const effectiveSellerId = (
    creds?.amazonSellerId ||
    amazonPlat?.sellerId ||
    ''
  ).trim();

  const payload: FirestoreMerchantStoreRecord = {
    id: merchant.id,
    storeName: (merchant.storeName || 'متجر التاجر').slice(0, 200),
    contactPerson: (merchant.contactPerson || '').slice(0, 150),
    primaryEmail: (merchant.primaryEmail || '').slice(0, 150),
    phone: (merchant.phone || '').slice(0, 60),
    city: (merchant.city || '').slice(0, 100),
    platformsSubscribed: Array.isArray(merchant.platformsSubscribed) ? merchant.platformsSubscribed.slice(0, 15) : ['amazon_eg', 'noon_eg'],
    amazonRefreshToken: encryptedRefreshToken.slice(0, 2000),
    amazonRefreshTokenEncrypted: Boolean(encryptedRefreshToken),
    amazonTokenStatus: encryptedRefreshToken ? 'valid' : 'missing',
    amazonSellerId: effectiveSellerId.slice(0, 128),
    amazonRegion: (creds?.amazonRegion || 'eu-west-1').slice(0, 50),
    amazonMarketplaceId: (creds?.amazonMarketplaceId || 'ARBP9OOSHTCHU').slice(0, 50),
    noonAuthKey: (creds?.noonAuthKey || '').slice(0, 1000),
    noonAppId: (creds?.noonAppId || '').slice(0, 200),
    bostaApiKey: (creds?.bostaApiKey || '').slice(0, 500),
    dataMode: merchant.dataMode || creds?.dataMode || 'live',
    isConfigured: Boolean(encryptedRefreshToken),
    updatedAt: new Date().toISOString()
  };

  // 1. Update LocalStorage cache immediately
  const currentMap = getLocalCachedMerchantStoresMap();
  currentMap[merchant.id] = payload;
  saveLocalCachedMerchantStoresMap(currentMap);
  markFirestoreCacheFetched(`merchant_store_${merchant.id}`);

  if (isFirestoreQuotaExhausted()) {
    return true;
  }

  try {
    await setDoc(doc(db, 'merchant_stores', merchant.id), payload, { merge: true });
    return true;
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      markFirestoreQuotaExhausted(error);
    }
    return true;
  }
}

/**
 * Dynamically fetches the active store's credentials with 5-minute LocalStorage caching and Quota fallback.
 */
export async function fetchMerchantStoreCredentialsFromFirestore(
  merchantId: string
): Promise<FirestoreMerchantStoreRecord | null> {
  if (!merchantId) return null;
  const cacheKey = `merchant_store_${merchantId}`;
  const cachedMap = getLocalCachedMerchantStoresMap();
  const cachedRecord = cachedMap[merchantId] || null;

  // Serve from 5-minute cache or if Firestore quota is exhausted
  if (isFirestoreQuotaExhausted() || (cachedRecord && isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS))) {
    return cachedRecord;
  }

  try {
    const snap = await getDoc(doc(db, 'merchant_stores', merchantId));
    markFirestoreCacheFetched(cacheKey);
    if (snap.exists()) {
      const record = snap.data() as FirestoreMerchantStoreRecord;
      cachedMap[merchantId] = record;
      saveLocalCachedMerchantStoresMap(cachedMap);
      return record;
    }
    return cachedRecord;
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      markFirestoreQuotaExhausted(error);
    }
    return cachedRecord;
  }
}

/**
 * Fetches all registered merchant store records from Firestore with 5-minute caching and automatic LocalStorage fallback.
 */
export async function fetchAllMerchantStoresFromFirestore(): Promise<FirestoreMerchantStoreRecord[]> {
  const cacheKey = 'merchant_stores_all';
  const cachedMap = getLocalCachedMerchantStoresMap();
  const cachedList = Object.values(cachedMap);

  if (isFirestoreQuotaExhausted() || (cachedList.length > 0 && isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS))) {
    return cachedList;
  }

  try {
    const snap = await getDocs(collection(db, 'merchant_stores'));
    markFirestoreCacheFetched(cacheKey);
    const records: FirestoreMerchantStoreRecord[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreMerchantStoreRecord;
      records.push(data);
      if (data && data.id) {
        cachedMap[data.id] = data;
      }
    });
    saveLocalCachedMerchantStoresMap(cachedMap);
    return records.length > 0 ? records : cachedList;
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      markFirestoreQuotaExhausted(error);
    }
    return cachedList;
  }
}

// 8. Market Share & Competitor Analysis in Cloud Firestore (/analytics/market_share_{category}_{timeframe})
export async function saveMarketShareToFirestore(record: import('../types').MarketShareRecord): Promise<void> {
  const docId = `market_share_${record.category || 'all'}_${record.timeframe || '14days'}`;
  const cacheKey = `market_share_${docId}`;
  writeLocalCache(cacheKey, record);

  if (isFirestoreQuotaExhausted()) return;

  const path = `analytics/${docId}`;
  const opId = triggerGlobalAsyncStart('database', 'مزامنة بيانات حصة السوق في Firestore', `تحليل ${record.merchantStoreName}`);
  try {
    await setDoc(doc(db, 'analytics', docId), {
      id: docId,
      eventType: 'market_share_comparison',
      productId: 'all',
      metadata: {
        category: record.category,
        timeframe: record.timeframe,
        merchantStoreName: record.merchantStoreName,
        merchantSharePercent: record.merchantSharePercent,
        competitorsSharePercent: record.competitorsSharePercent,
        totalMarketVolumeEGP: record.totalMarketVolumeEGP,
        totalMarketUnits: record.totalMarketUnits,
        breakdown: record.breakdown,
        historicalTrend: record.historicalTrend,
        syncedAt: record.syncedAt,
        dataSource: 'firestore_live'
      },
      timestamp: serverTimestamp()
    }, { merge: true });
    markFirestoreCacheFetched(cacheKey);
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ تقرير حصة السوق بالسحابة', 'database');
  } catch (error) {
    triggerGlobalAsyncEnd(opId, true, 'تم حفظ تقرير حصة السوق محلياً', 'database');
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchMarketShareFromFirestore(
  category: string = 'all', 
  timeframe: string = '14days'
): Promise<import('../types').MarketShareRecord | null> {
  const docId = `market_share_${category}_${timeframe}`;
  const cacheKey = `market_share_${docId}`;
  const cached = readLocalCache<import('../types').MarketShareRecord | null>(cacheKey, null);

  if (isFirestoreQuotaExhausted() || (cached && isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS))) {
    return cached;
  }

  const path = `analytics/${docId}`;
  try {
    const docSnap = await getDoc(doc(db, 'analytics', docId));
    markFirestoreCacheFetched(cacheKey);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const meta = data?.metadata;
      if (meta && Array.isArray(meta.breakdown)) {
        const record: import('../types').MarketShareRecord = {
          id: docId,
          category: meta.category || category,
          timeframe: meta.timeframe || timeframe,
          merchantStoreName: meta.merchantStoreName || 'متجرك المعتمد',
          merchantSharePercent: meta.merchantSharePercent || 0,
          competitorsSharePercent: meta.competitorsSharePercent || 0,
          totalMarketVolumeEGP: meta.totalMarketVolumeEGP || 0,
          totalMarketUnits: meta.totalMarketUnits || 0,
          breakdown: meta.breakdown,
          historicalTrend: meta.historicalTrend || [],
          syncedAt: meta.syncedAt || new Date().toISOString(),
          dataSource: 'firestore_live'
        };
        writeLocalCache(cacheKey, record);
        return record;
      }
    }
    return cached;
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      markFirestoreQuotaExhausted(error);
    }
    handleFirestoreError(error, OperationType.GET, path);
    return cached;
  }
}



