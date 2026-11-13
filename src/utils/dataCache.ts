/**
 * Centralized In-Memory + LocalStorage Persistent Cache
 * Delivers instant 0ms UI rendering from localStorage on page reopen,
 * followed by silent background revalidation (Stale-While-Revalidate).
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh window
const MAX_STALE_MS = 24 * 60 * 60 * 1000; // 24 hours max stale retention
const STORAGE_PREFIX = 'radar_cache_v1_';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  private readFromStorage<T>(key: string): CacheEntry<T> | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheEntry<T>;
      if (!parsed || typeof parsed.timestamp !== 'number') return null;
      this.cache.set(key, parsed);
      return parsed;
    } catch {
      return null;
    }
  }

  private writeToStorage<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const serialized = JSON.stringify(entry);
    try {
      localStorage.setItem(storageKey, serialized);
    } catch {
      // Evict oldest cache entries on quota exceeded and retry once
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.slice(0, Math.ceil(keysToRemove.length / 2)).forEach((k) => {
          localStorage.removeItem(k);
        });
        localStorage.setItem(storageKey, serialized);
      } catch {
        // Ignore if storage is completely unavailable
      }
    }
  }

  get<T>(key: string): T | null {
    let entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      entry = this.readFromStorage<T>(key) || undefined;
    }
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      return null;
    }
    return entry.data as T;
  }

  /**
   * Returns cached data even if older than 5 minutes (up to 24h)
   * so pages render immediately from cache while revalidating in background.
   */
  getStale<T>(key: string): { data: T; isFresh: boolean } | null {
    let entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      entry = this.readFromStorage<T>(key) || undefined;
    }
    if (!entry) return null;
    const age = Date.now() - entry.timestamp;
    if (age > MAX_STALE_MS) {
      this.cache.delete(key);
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      } catch {}
      return null;
    }
    return {
      data: entry.data as T,
      isFresh: age <= CACHE_TTL_MS,
    };
  }

  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    this.cache.set(key, entry);
    this.writeToStorage(key, entry);
  }

  invalidate(keyPrefix?: string): void {
    if (!keyPrefix) {
      this.cache.clear();
      if (typeof localStorage !== 'undefined') {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(STORAGE_PREFIX)) {
              keysToRemove.push(k);
            }
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch {}
      }
      return;
    }

    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const fullPrefix = `${STORAGE_PREFIX}${keyPrefix}`;
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(fullPrefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }
  }
}

export const dataCache = new DataCache();
