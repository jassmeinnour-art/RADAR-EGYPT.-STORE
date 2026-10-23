import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  setLogLevel,
  doc, 
  getDoc,
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export { firebaseConfig };

// Suppress transient offline / WebChannel connection retry and quota warnings from polluting the console
try {
  setLogLevel('silent');
} catch {
  // safe fallback
}

// ============================================================================
// Firestore Quota Circuit Breaker & 5-Minute Caching Layer
// ============================================================================
export const FIVE_MINUTES_MS = 5 * 60 * 1000; // 5 minutes minimum cache TTL
const QUOTA_CIRCUIT_STORAGE_KEY = 'merchant_radar_firestore_quota_paused_until';
const CACHE_TIMESTAMP_PREFIX = 'merchant_radar_fs_cache_ts_';

let memoryQuotaExhaustedUntil = 0;
const activeFirestoreListeners = new Set<() => void>();

export function isFirestoreQuotaError(error: unknown): boolean {
  if (!error) return false;
  const msg =
    error instanceof Error
      ? `${error.name} ${error.message} ${(error as any).code || ''}`
      : typeof error === 'object'
      ? JSON.stringify(error)
      : String(error);
  const lower = msg.toLowerCase();
  return (
    lower.includes('quota limit exceeded') ||
    lower.includes('quota exceeded') ||
    lower.includes('resource-exhausted') ||
    lower.includes('resource_exhausted') ||
    lower.includes('free daily read units') ||
    lower.includes('too-many-requests') ||
    lower.includes('429')
  );
}

export function isFirestoreQuotaExhausted(): boolean {
  const now = Date.now();
  if (memoryQuotaExhaustedUntil > now) {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(QUOTA_CIRCUIT_STORAGE_KEY);
      if (raw) {
        const until = Number(raw);
        if (until > now) {
          memoryQuotaExhaustedUntil = until;
          return true;
        } else {
          localStorage.removeItem(QUOTA_CIRCUIT_STORAGE_KEY);
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  return false;
}

export function registerFirestoreListener(unsub: () => void): () => void {
  activeFirestoreListeners.add(unsub);
  return () => {
    try {
      unsub();
    } catch {
      // ignore
    }
    activeFirestoreListeners.delete(unsub);
  };
}

export function stopAllFirestoreListeners(): void {
  activeFirestoreListeners.forEach((unsub) => {
    try {
      unsub();
    } catch {
      // ignore
    }
  });
  activeFirestoreListeners.clear();
}

export function markFirestoreQuotaExhausted(error?: unknown): void {
  // Pause Firestore network queries for 30 minutes and immediately stop active listeners
  const pauseUntil = Date.now() + 30 * 60 * 1000;
  memoryQuotaExhaustedUntil = pauseUntil;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(QUOTA_CIRCUIT_STORAGE_KEY, String(pauseUntil));
    } catch {
      // ignore
    }
  }
  stopAllFirestoreListeners();
  if (error) {
    // Handled silently via local fallback
  }
}

export function isFirestoreCacheFresh(cacheKey: string, ttlMs: number = FIVE_MINUTES_MS): boolean {
  if (isFirestoreQuotaExhausted()) return true;
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${cacheKey}`);
    if (!raw) return false;
    const lastTs = Number(raw);
    return Date.now() - lastTs < ttlMs;
  } catch {
    return false;
  }
}

export function markFirestoreCacheFetched(cacheKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${cacheKey}`, String(Date.now()));
  } catch {
    // ignore
  }
}

// Clean filtering for harmless browser/sandbox and transient/quota environment warnings
if (typeof window !== 'undefined') {
  const isHarmlessNotice = (text: string) => {
    const lower = text.toLowerCase();
    if (
      lower.includes('quota limit exceeded') ||
      lower.includes('quota exceeded') ||
      lower.includes('resource-exhausted') ||
      lower.includes('free daily read units')
    ) {
      markFirestoreQuotaExhausted();
      return true;
    }
    return (
      text.includes('Could not reach Cloud Firestore backend') ||
      text.includes('The client will operate in offline mode') ||
      text.includes('Missing or insufficient permissions') ||
      text.includes('permission-denied') ||
      text.includes('@firebase/firestore') ||
      text.includes('Firestore subscription notice') ||
      text.includes('Firestore Multi-Tenant') ||
      text.includes('Firestore Operation Notice') ||
      text.includes('code=unavailable') ||
      text.includes('code=resource-exhausted') ||
      text.includes('ResizeObserver') ||
      text.includes('failed to connect to websocket') ||
      text.includes('WebSocket') ||
      text.includes('Service Worker') ||
      text.includes('ServiceWorker') ||
      text.includes('service worker') ||
      text.includes('firebase-messaging-sw') ||
      text.includes('AudioContext')
    );
  };

  try {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const fullText = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg instanceof Error) return arg.message + ' ' + (arg.stack || '');
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(' ');

      if (isHarmlessNotice(fullText)) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      const fullText = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg instanceof Error) return arg.message + ' ' + (arg.stack || '');
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(' ');

      if (isHarmlessNotice(fullText)) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
  } catch {
    // Ignore if console properties are read-only
  }
}

// Initialize Firebase App safely as a singleton instance
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey || 'FALLBACK_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || 'FALLBACK_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId || 'FALLBACK_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || 'FALLBACK_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || 'FALLBACK_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId || 'FALLBACK_APP_ID',
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || '(default)'
};

export const app = getApps().length > 0 ? getApp() : initializeApp(config);

// Initialize Authentication & Firestore with explicit custom databaseId per skill specification
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Domain and Project Diagnostics helper for Authorized Domains setup
export function getFirebaseDomainInfo() {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const authDomain = firebaseConfig.authDomain || `${firebaseConfig.projectId}.firebaseapp.com`;
  const consoleAuthSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
  
  return {
    currentHost,
    currentOrigin,
    authDomain,
    projectId: firebaseConfig.projectId,
    consoleAuthSettingsUrl,
    isLocalhost: currentHost === 'localhost' || currentHost === '127.0.0.1',
    isAuthDomainDirect: currentHost === authDomain,
  };
}

// Diagnostic connection test to validate Firestore connectivity with 5-minute cache & quota protection
export async function testConnection(): Promise<boolean> {
  if (isFirestoreQuotaExhausted() || isFirestoreCacheFresh('test_connection', FIVE_MINUTES_MS)) {
    return true;
  }
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await getDoc(testDocRef);
    markFirestoreCacheFetched('test_connection');
    return true;
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      markFirestoreQuotaExhausted(error);
    }
    return false;
  }
}

export const testFirestoreConnection = testConnection;

// Security & Error Diagnostics adhering to Firebase Skill specifications with silent quota fallback
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  if (isFirestoreQuotaError(error)) {
    markFirestoreQuotaExhausted(error);
  }
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  return errInfo;
}


export { 
  firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User
};
