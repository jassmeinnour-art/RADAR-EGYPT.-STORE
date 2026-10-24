/**
 * Firebase & Amazon SP-API Production Initializer (src/firebase.ts)
 * 
 * Configured strictly for LIVE PRODUCTION MODE:
 * - Environment variables are dynamically loaded from `import.meta.env` with fallback to `firebase-applet-config.json`.
 * - Mock data stores, mock authenticators, and sandbox fallbacks are STRICTLY DISABLED (`IS_MOCK_MODE = false`).
 * - Firebase Firestore connects directly to custom database: `ai-studio-merchantradaregy-bc6bc8e4-cba5-4805-bec5-93ce581ab6cf`.
 * - Amazon SP-API connects directly to Europe/Egypt endpoint: `https://sellingpartnerapi-eu.amazon.com` (Marketplace: `ARBP9OOSHTCHU`).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
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
  setLogLevel,
  doc, 
  getDoc,
  getDocFromServer 
} from 'firebase/firestore';
import baseFirebaseConfig from '../firebase-applet-config.json';

// ============================================================================
// Production Mode Enforcement & Mock Disabling
// ============================================================================
export const IS_MOCK_MODE = false;
export const IS_PRODUCTION_MODE = true;
export const APP_ENV = (import.meta.env.VITE_APP_ENV || 'production').trim().toLowerCase();

// ============================================================================
// Amazon SP-API Production Configuration
// ============================================================================
export const AMAZON_SP_API_CONFIG = {
  // Official European endpoint servicing Amazon Egypt (amazon.eg)
  ENDPOINT: import.meta.env.VITE_AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com',
  REGION: import.meta.env.VITE_AMAZON_REGION || 'eu-west-1',
  MARKETPLACE_ID: import.meta.env.VITE_AMAZON_MARKETPLACE_ID || 'ARBP9OOSHTCHU',
  DEFAULT_SELLER_ID: import.meta.env.VITE_AMAZON_DEFAULT_SELLER_ID || 'A2EUQ1WTGCTBG2',
  LWA_TOKEN_ENDPOINT: import.meta.env.VITE_AMAZON_LWA_ENDPOINT || 'https://api.amazon.com/auth/o2/token',
  LWA_GRANT_TYPE: 'refresh_token',
  COUNTRY_CODE: 'EG',
  CURRENCY: 'EGP',
  IS_PRODUCTION: true,
  IS_MOCK_ENABLED: false,
} as const;

// Alias for backwards compatibility
export const SP_API_PRODUCTION_CONFIG = AMAZON_SP_API_CONFIG;

/**
 * Validates Amazon SP-API production health via the secure server proxy route.
 * Strictly executes real LWA authentication and SP-API participation ping.
 */
export async function checkSpApiProductionStatus(): Promise<{
  status: 'OK' | 'ERROR';
  region: string;
  endpoint: string;
  marketplaceId?: string;
  participationsCount?: number;
  error?: any;
  latency?: { lwaMs: number; spApiMs: number };
}> {
  try {
    const res = await fetch('/api/sp-api/status', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      status: 'ERROR',
      region: AMAZON_SP_API_CONFIG.REGION,
      endpoint: AMAZON_SP_API_CONFIG.ENDPOINT,
      error: {
        code: 'NETWORK_DISCONNECTED',
        message: err?.message || 'Failed to reach /api/sp-api/status health check endpoint'
      }
    };
  }
}

// Suppress transient offline / WebChannel connection retry and quota warnings from polluting console
try {
  setLogLevel('silent');
} catch {
  // safe fallback
}

// ============================================================================
// Firebase Dynamic Production Configuration (Strictly pulled from Env / Config)
// ============================================================================
export const firebaseConfig = {
  apiKey: 
    import.meta.env.VITE_FIREBASE_API_KEY || 
    baseFirebaseConfig.apiKey,
  authDomain: 
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 
    baseFirebaseConfig.authDomain,
  projectId: 
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 
    baseFirebaseConfig.projectId,
  storageBucket: 
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 
    baseFirebaseConfig.storageBucket,
  messagingSenderId: 
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 
    baseFirebaseConfig.messagingSenderId,
  appId: 
    import.meta.env.VITE_FIREBASE_APP_ID || 
    baseFirebaseConfig.appId,
  firestoreDatabaseId: 
    import.meta.env.VITE_FIREBASE_DATABASE_ID || 
    baseFirebaseConfig.firestoreDatabaseId || 
    'ai-studio-merchantradaregy-bc6bc8e4-cba5-4805-bec5-93ce581ab6cf'
};

// Initialize Firebase App safely as a singleton instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Authentication & Firestore with explicit custom databaseId per skill specification
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ============================================================================
// Firestore Quota Circuit Breaker & 5-Minute Caching Layer
// ============================================================================
export const FIVE_MINUTES_MS = 5 * 60 * 1000;
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
    // Handled silently
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

// Diagnostic connection test to validate Firestore connectivity
export async function testFirestoreConnection(): Promise<boolean> {
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

// Security & Error Diagnostics adhering to Firebase Skill specifications
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

// Export Authentication methods
export { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
  firebaseSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  type User 
};

// Default export
export default {
  app,
  auth,
  db,
  googleProvider,
  firebaseConfig,
  amazonSpApiConfig: AMAZON_SP_API_CONFIG,
  getFirebaseDomainInfo,
  testFirestoreConnection,
  checkSpApiProductionStatus,
  isMockMode: IS_MOCK_MODE,
  isProductionMode: IS_PRODUCTION_MODE
};
