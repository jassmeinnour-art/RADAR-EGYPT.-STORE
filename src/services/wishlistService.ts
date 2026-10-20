import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  db,
  auth,
  FIVE_MINUTES_MS,
  isFirestoreQuotaError,
  isFirestoreQuotaExhausted,
  markFirestoreQuotaExhausted,
  isFirestoreCacheFresh,
  markFirestoreCacheFetched,
  registerFirestoreListener,
} from '../db';
import { WishlistItem, WishlistFolder } from '../types';
import { logUserActivity } from './userLogsService';

const LOCAL_STORAGE_KEY = 'merchant_radar_wishlist_items_v1';
const FOLDERS_STORAGE_KEY = 'merchant_radar_wishlist_folders_v1';

export const DEFAULT_WISHLIST_FOLDERS: WishlistFolder[] = [
  { id: 'all', name: 'جميع الأمنيات', icon: 'Sparkles', itemCount: 0 },
  { id: 'electronics', name: 'إلكترونيات وهواتف', icon: 'Smartphone', itemCount: 0 },
  { id: 'appliances', name: 'أجهزة منزلية', icon: 'Zap', itemCount: 0 },
  { id: 'furniture', name: 'أثاث وخامات دمياط', icon: 'Home', itemCount: 0 },
  { id: 'flash_deals', name: 'صفقات الجمعة البيضاء', icon: 'Flame', itemCount: 0 },
];

// Clean production state: No mock or fake wishlist items
export const INITIAL_SEED_WISHLIST: WishlistItem[] = [];

export function getLocalCachedWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read wishlist from localStorage:', err);
  }
  return INITIAL_SEED_WISHLIST;
}

export function saveLocalCachedWishlist(items: WishlistItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save wishlist to localStorage:', err);
  }
}

export function getLocalWishlistFolders(): WishlistFolder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read wishlist folders:', err);
  }
  return DEFAULT_WISHLIST_FOLDERS;
}

export function saveLocalWishlistFolders(folders: WishlistFolder[]): void {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch (err) {
    console.warn('Failed to save wishlist folders:', err);
  }
}

/**
 * Add a new product to the merchant's wishlist.
 */
export async function addToWishlist(
  userId: string,
  itemInput: Omit<WishlistItem, 'id' | 'addedAt'>
): Promise<WishlistItem> {
  const currentUid = userId || auth.currentUser?.uid || 'guest-merchant';
  const id = `wish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const addedAt = new Date().toISOString();

  const isTargetPriceReached = (itemInput.currentPrice || 0) <= (itemInput.targetPrice || 0);

  const newItem: WishlistItem = {
    ...itemInput,
    id,
    userId: currentUid,
    isTargetPriceReached,
    addedAt,
    updatedAt: addedAt,
  };

  const existing = getLocalCachedWishlist();
  const updated = [newItem, ...existing.filter(i => i.id !== newItem.id)];
  saveLocalCachedWishlist(updated);

  // Log user activity
  logUserActivity({
    actionType: 'wishlist_add',
    actionTitle: 'إضافة منتج لقائمة الأمنيات',
    details: `تمت إضافة "${newItem.productTitle}" بسعر مستهدف ${newItem.targetPrice.toLocaleString()} ج.م إلى مجلد (${newItem.folder})`,
    platform: newItem.targetPlatforms?.[0] || 'radar',
    status: 'success',
    metadata: { productId: newItem.productId, targetPrice: newItem.targetPrice },
    userId: currentUid,
  }).catch(() => {});

  // Save to Firestore if authenticated and quota is not exhausted
  if (auth.currentUser && auth.currentUser.uid === currentUid && !isFirestoreQuotaExhausted()) {
    const path = `users/${currentUid}/wishlists`;
    try {
      const docRef = doc(db, path, id);
      await setDoc(docRef, {
        ...newItem,
        firestoreCreatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isFirestoreQuotaError(err)) {
        markFirestoreQuotaExhausted(err);
      }
    }
  }

  // Dispatch event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('merchant_wishlist_updated', { detail: updated }));
  }

  return newItem;
}

/**
 * Remove an item from the merchant's wishlist.
 */
export async function removeFromWishlist(userId: string, itemId: string): Promise<void> {
  const currentUid = userId || auth.currentUser?.uid || 'guest-merchant';
  const existing = getLocalCachedWishlist();
  const removedItem = existing.find(i => i.id === itemId);
  const updated = existing.filter(i => i.id !== itemId);
  saveLocalCachedWishlist(updated);

  if (removedItem) {
    logUserActivity({
      actionType: 'wishlist_remove',
      actionTitle: 'حذف منتج من قائمة الأمنيات',
      details: `تم حذف "${removedItem.productTitle}" من قائمة الأمنيات`,
      status: 'info',
      userId: currentUid,
    }).catch(() => {});
  }

  // Remove from Firestore
  if (auth.currentUser && auth.currentUser.uid === currentUid && !isFirestoreQuotaExhausted()) {
    const path = `users/${currentUid}/wishlists/${itemId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (err) {
      if (isFirestoreQuotaError(err)) {
        markFirestoreQuotaExhausted(err);
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('merchant_wishlist_updated', { detail: updated }));
  }
}

/**
 * Update an existing wishlist item (e.g. target price, notes, priority).
 */
export async function updateWishlistItem(
  userId: string,
  itemId: string,
  updates: Partial<WishlistItem>
): Promise<void> {
  const currentUid = userId || auth.currentUser?.uid || 'guest-merchant';
  const existing = getLocalCachedWishlist();
  const updated = existing.map(item => {
    if (item.id === itemId) {
      const merged = { ...item, ...updates, updatedAt: new Date().toISOString() };
      if (merged.currentPrice !== undefined && merged.targetPrice !== undefined) {
        merged.isTargetPriceReached = merged.currentPrice <= merged.targetPrice;
      }
      return merged;
    }
    return item;
  });

  saveLocalCachedWishlist(updated);

  logUserActivity({
    actionType: 'wishlist_update',
    actionTitle: 'تعديل بيانات صنف بالأمنيات',
    details: `تم تحديث السعر المستهدف أو ملاحظات الصنف رقم ${itemId}`,
    status: 'info',
    userId: currentUid,
  }).catch(() => {});

  if (auth.currentUser && auth.currentUser.uid === currentUid && !isFirestoreQuotaExhausted()) {
    const path = `users/${currentUid}/wishlists/${itemId}`;
    try {
      await setDoc(doc(db, path), updates, { merge: true });
    } catch (err) {
      if (isFirestoreQuotaError(err)) {
        markFirestoreQuotaExhausted(err);
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('merchant_wishlist_updated', { detail: updated }));
  }
}

/**
 * Subscription to wishlist items with 5-minute cache and silent quota fallback.
 */
export function subscribeToWishlist(
  userId: string | null | undefined,
  callback: (items: WishlistItem[]) => void
): () => void {
  callback(getLocalCachedWishlist());

  const handleLocal = () => {
    callback(getLocalCachedWishlist());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('merchant_wishlist_updated', handleLocal);
  }

  const cacheKey = `wishlist_items_${userId || 'guest'}`;
  if (
    !userId ||
    !auth.currentUser ||
    isFirestoreQuotaExhausted() ||
    isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS)
  ) {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('merchant_wishlist_updated', handleLocal);
      }
    };
  }

  const path = `users/${userId}/wishlists`;
  try {
    let unsub: (() => void) | null = null;
    unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        markFirestoreCacheFetched(cacheKey);
        if (!snapshot.empty) {
          const list: WishlistItem[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as WishlistItem);
          });
          saveLocalCachedWishlist(list);
          callback(list);
        } else {
          callback(getLocalCachedWishlist());
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
        callback(getLocalCachedWishlist());
      }
    );
    const registeredUnsub = registerFirestoreListener(unsub);
    return () => {
      registeredUnsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('merchant_wishlist_updated', handleLocal);
      }
    };
  } catch (err) {
    if (isFirestoreQuotaError(err)) {
      markFirestoreQuotaExhausted(err);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('merchant_wishlist_updated', handleLocal);
      }
    };
  }
}

/**
 * Share wishlist via WhatsApp with formatted text and prices.
 */
export function shareWishlistWhatsApp(items: WishlistItem[], customPhone?: string): void {
  const phone = customPhone ? customPhone.replace(/[^0-9]/g, '') : '';
  const lines = [
    '✨ *قائمة أمنيات وصفقات التاجر — رادار السوق المصري* ✨',
    `📅 التاريخ: ${new Date().toLocaleDateString('ar-EG')}`,
    '----------------------------------------',
    ...items.map((item, idx) => {
      const statusIcon = item.isTargetPriceReached ? '🎯 [تم الوصول للسعر]' : '⏳ [في انتظار الهبوط]';
      return `${idx + 1}. *${item.productTitle}*\n   • السعر الحالي: ${item.currentPrice.toLocaleString()} ج.م\n   • السعر المستهدف: ${item.targetPrice.toLocaleString()} ج.م\n   • الأولوية: ${item.priority === 'high' ? 'عالية 🔥' : item.priority === 'medium' ? 'متوسطة' : 'عادية'}\n   • الحالة: ${statusIcon}`;
    }),
    '----------------------------------------',
    'تم التوليد تلقائياً عبر منصة Merchant Radar Egypt 🇪🇬'
  ];

  const text = encodeURIComponent(lines.join('\n\n'));
  const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Export wishlist to formatted CSV.
 */
export function exportWishlistToCSV(items: WishlistItem[]): void {
  const BOM = '\uFEFF';
  const headers = [
    'كود المنتج',
    'اسم المنتج',
    'العلامة التجارية',
    'التصنيف والمجلد',
    'السعر الحالي (ج.م)',
    'السعر المستهدف (ج.م)',
    'فرق السعر (ج.م)',
    'الأولوية',
    'تحقق الهدف',
    'المنافس الأرخص',
    'المنصات المستهدفة',
    'ملاحظات التاجر',
    'تاريخ الإضافة'
  ];

  const rows = items.map(item => [
    `"${item.productId || item.id}"`,
    `"${item.productTitle.replace(/"/g, '""')}"`,
    `"${(item.brand || '').replace(/"/g, '""')}"`,
    `"${(item.category || item.folder || '').replace(/"/g, '""')}"`,
    item.currentPrice,
    item.targetPrice,
    (item.currentPrice - item.targetPrice),
    `"${item.priority === 'high' ? 'قصوى' : item.priority === 'medium' ? 'متوسطة' : 'عادية'}"`,
    `"${item.isTargetPriceReached ? 'نعم 🎯' : 'لا ⏳'}"`,
    `"${(item.competitorSource || '').replace(/"/g, '""')}"`,
    `"${(item.targetPlatforms || []).join('، ')}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`,
    `"${new Date(item.addedAt).toLocaleDateString('ar-EG')}"`
  ]);

  const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `قائمة_أمنيات_التاجر_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
