import { 
  collection, 
  CollectionReference, 
  DocumentData,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { 
  app, 
  db, 
  auth, 
  googleProvider,
  firebaseConfig,
  getFirebaseDomainInfo,
  testFirestoreConnection 
} from './lib/firebase';

export { app, db, auth, googleProvider, firebaseConfig, getFirebaseDomainInfo };

function safeCollection(name: string): CollectionReference<DocumentData> {
  try {
    if (!db) return null as unknown as CollectionReference<DocumentData>;
    return collection(db, name);
  } catch {
    return null as unknown as CollectionReference<DocumentData>;
  }
}

// Reusable collection references for primary collections
export const productsCollection = safeCollection('products');
export const usersCollection = safeCollection('users');
export const analyticsCollection = safeCollection('analytics');
export const ownerDebugLogsCollection = safeCollection('owner_debug_logs');

// Grouped collections map for convenient access
export const collections = {
  products: productsCollection,
  users: usersCollection,
  analytics: analyticsCollection,
  ownerDebugLogs: ownerDebugLogsCollection,
};

// Generic typed collection accessor
export function getCollection<T = DocumentData>(collectionName: string): CollectionReference<T> {
  return safeCollection(collectionName) as CollectionReference<T>;
}

// Connectivity test helper delegating to shared testFirestoreConnection
export async function testDbConnection(): Promise<boolean> {
  return testFirestoreConnection();
}

export { 
  handleFirestoreError, 
  OperationType, 
  type FirestoreErrorInfo,
  FIVE_MINUTES_MS,
  isFirestoreQuotaError,
  isFirestoreQuotaExhausted,
  markFirestoreQuotaExhausted,
  isFirestoreCacheFresh,
  markFirestoreCacheFetched,
  registerFirestoreListener,
  stopAllFirestoreListeners
} from './lib/firebase';

export default db;
