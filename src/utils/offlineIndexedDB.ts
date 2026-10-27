/**
 * Radar Egypt - Native IndexedDB Offline Storage Utility
 * Manages local persistent caching for tasks, merchants, catalog, shipping orders, and competitor radar snapshots
 * when the user is disconnected or working in offline mode.
 */

const DB_NAME = 'RADAR_EGYPT_OFFLINE_DB';
const DB_VERSION = 1;

export const STORES = {
  TASKS: 'tasks',
  MERCHANTS: 'merchants',
  CATALOG: 'catalog',
  ORDERS: 'orders',
  RADAR_CACHE: 'radar_cache',
  APP_STATE: 'app_state'
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

interface DBRecord<T = any> {
  id: string;
  value: T;
  updatedAt: string;
}

/**
 * Initializes and upgrades IndexedDB schema safely with feature detection
 */
export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('[IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Saves a single record to IndexedDB
 */
export async function saveRecordToDB<T>(storeName: StoreName, id: string, value: T): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const record: DBRecord<T> = {
        id,
        value,
        updatedAt: new Date().toISOString()
      };

      const request = store.put(record);

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.warn(`[IndexedDB] Failed to save record ${id} to ${storeName}:`, request.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] saveRecordToDB error:', err);
    return false;
  }
}

/**
 * Retrieves a single record from IndexedDB
 */
export async function getRecordFromDB<T>(storeName: StoreName, id: string): Promise<T | null> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const record = request.result as DBRecord<T> | undefined;
        resolve(record ? record.value : null);
      };

      request.onerror = () => {
        console.warn(`[IndexedDB] Failed to get record ${id} from ${storeName}:`, request.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] getRecordFromDB error:', err);
    return null;
  }
}

/**
 * Saves an array of records to an IndexedDB object store
 */
export async function saveAllRecordsToDB<T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach((item) => {
        const record: DBRecord<T> = {
          id: item.id,
          value: item,
          updatedAt: new Date().toISOString()
        };
        store.put(record);
      });

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => {
        console.warn(`[IndexedDB] Failed to bulk save to ${storeName}:`, transaction.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] saveAllRecordsToDB error:', err);
    return false;
  }
}

/**
 * Retrieves all items from an IndexedDB object store
 */
export async function getAllRecordsFromDB<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = (request.result || []) as DBRecord<T>[];
        resolve(records.map((r) => r.value));
      };

      request.onerror = () => {
        console.warn(`[IndexedDB] Failed to get all from ${storeName}:`, request.error);
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] getAllRecordsFromDB error:', err);
    return [];
  }
}

/**
 * Deletes a single record from IndexedDB
 */
export async function deleteRecordFromDB(storeName: StoreName, id: string): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('[IndexedDB] deleteRecordFromDB error:', err);
    return false;
  }
}
