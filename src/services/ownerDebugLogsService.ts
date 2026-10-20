import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
  FIVE_MINUTES_MS,
  isFirestoreQuotaError,
  isFirestoreQuotaExhausted,
  markFirestoreQuotaExhausted,
  isFirestoreCacheFresh,
  markFirestoreCacheFetched,
  registerFirestoreListener,
} from '../lib/firebase';

export const OWNER_EMAIL = 'jassmeinnour@gmail.com';
export const OWNER_DEBUG_LOGS_COLLECTION = 'owner_debug_logs';
const STORAGE_KEY_OWNER_DEBUG_LOGS = 'merchant_radar_owner_debug_logs_v1';

export type OwnerDebugLogType =
  | 'console_error'
  | 'console_warn'
  | 'api_failure'
  | 'runtime_exception'
  | 'unhandled_rejection'
  | 'state_snapshot'
  | 'manual_diagnostic';

export type OwnerDebugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface OwnerDebugLogEntry {
  id: string;
  ownerEmail: string;
  ownerUid?: string;
  logType: OwnerDebugLogType;
  severity: OwnerDebugSeverity;
  message: string;
  stackOrDetails?: string;
  affectedComponent?: string;
  activeTab?: string;
  appStateSnapshot?: string;
  userAgent?: string;
  url?: string;
  createdAt: string;
}

export interface RecordOwnerDebugLogInput {
  logType: OwnerDebugLogType;
  severity?: OwnerDebugSeverity;
  message: string;
  stackOrDetails?: string;
  affectedComponent?: string;
  activeTab?: string;
  appStateSnapshot?: string;
  ownerEmail?: string;
  ownerUid?: string;
}

export interface AppRuntimeDiagnosticsContext {
  activeTab: string;
  activeTabLabel?: string;
  currentProductTitle?: string;
  currentProductId?: string;
  activeMerchantId?: string;
  activeMerchantName?: string;
  connectedPlatformsCount?: number;
  totalPlatformsCount?: number;
  errorPlatformsCount?: number;
  unresolvedApiErrorsCount?: number;
  isDbConnected?: boolean;
  userEmail?: string;
  userUid?: string;
}

// Keep current app runtime context updated for automatic captures
let currentRuntimeContext: AppRuntimeDiagnosticsContext = {
  activeTab: 'radar',
};

export function updateOwnerDiagnosticsRuntimeContext(ctx: Partial<AppRuntimeDiagnosticsContext>): void {
  currentRuntimeContext = {
    ...currentRuntimeContext,
    ...ctx,
  };
}

export function getOwnerDiagnosticsRuntimeContext(): AppRuntimeDiagnosticsContext {
  return currentRuntimeContext;
}

// Map active tab to affected component file path in codebase for AI Studio prompt
export const TAB_TO_COMPONENT_FILE_MAP: Record<string, string> = {
  radar: 'src/App.tsx & src/components/CompetitorRadar.tsx',
  order_fulfillment: 'src/components/OrderFulfillmentTracker.tsx',
  admin_error_logs: 'src/components/AdminApiErrorDashboard.tsx & src/services/apiErrorLoggingService.ts',
  user_logs: 'src/components/UserLogsManager.tsx & src/services/userLogsService.ts',
  remote_merchants: 'src/components/RemoteMerchantsManager.tsx',
  sales_dashboard: 'src/components/SalesDashboard.tsx',
  archived_products: 'src/components/ArchivedProductsVault.tsx',
  platform_commissions: 'src/components/PlatformCommissionCalculator.tsx',
  seasonal_forecast: 'src/components/SeasonalDemandForecast.tsx',
  market_trends: 'src/components/MarketTrendsRadar.tsx',
  order_scheduling: 'src/components/OrderSchedulingWaybills.tsx',
  pricing_guardrails: 'src/components/PricingGuardrailsManager.tsx',
  marketer_hub: 'src/components/MarketerRbacAndAuditHub.tsx',
  profit_simulator: 'src/components/ProfitProjectionSimulator.tsx',
  periodic_reports: 'src/components/PeriodicPerformanceReports.tsx',
  bulk_repricing: 'src/components/BulkPriceUpdateManager.tsx',
  watchlist: 'src/components/WatchlistManager.tsx',
  wishlist: 'src/components/WishlistManager.tsx & src/services/wishlistService.ts',
  seo_keywords: 'src/components/SeoKeywordIntelligence.tsx',
  seo_listing: 'src/components/PlatformListingGenerator.tsx',
  image_studio: 'src/components/MerchantImageStudio.tsx',
  inventory: 'src/components/InventoryTracker.tsx',
  suppliers_hub: 'src/components/FurnitureSuppliersHub.tsx',
  wholesale: 'src/components/EgyptWholesaleLocations.tsx',
  price_alerts: 'src/components/PriceAlertManager.tsx',
  platforms_guide: 'src/components/PlatformsOnboardingGuide.tsx',
};

export function inferAffectedComponentFromStackOrTab(stack?: string, activeTab?: string): string {
  if (stack) {
    if (stack.includes('/api/app-version') || stack.includes('app-version.json')) {
      return 'src/hooks/useAppUpdate.ts';
    }
    if (stack.includes('/api/amazon/lwa/token-exchange') || stack.includes('/api/amazon/sp-api/')) {
      return 'src/utils/merchantOrdersManager.ts';
    }
    if (stack.includes('/api/merchant/catalog')) {
      return 'src/utils/merchantCatalogManager.ts';
    }
    const fileMatch = stack.match(/src\/[a-zA-Z0-9_/.-]+\.(tsx|ts)/);
    if (fileMatch && fileMatch[0]) {
      return fileMatch[0];
    }
  }
  const tab = activeTab || currentRuntimeContext.activeTab || 'radar';
  return TAB_TO_COMPONENT_FILE_MAP[tab] || `src/App.tsx (Tab: ${tab})`;
}

let debugLogSequenceCounter = 0;

/**
 * Generates a collision-proof unique ID for every debug/activity log entry,
 * using `crypto.randomUUID()` (with a fallback to `Date.now() + Math.random()`)
 * to guarantee uniqueness even when multiple logs are emitted within the same millisecond.
 */
export function generateUniqueOwnerDebugLogId(prefix = 'odbg'): string {
  debugLogSequenceCounter = (debugLogSequenceCounter + 1) % 1000000;
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now() + Math.random()}-${Math.random().toString(36).substring(2, 10)}`;
  return prefix ? `${prefix}_${uuid}_${debugLogSequenceCounter}` : uuid;
}

/**
 * Ensures a list of OwnerDebugLogEntry items has strictly unique, non-empty IDs
 * to prevent React duplicate key warnings when rendering DebugLog lists.
 */
export function ensureUniqueOwnerDebugLogList(
  rawList: OwnerDebugLogEntry[]
): OwnerDebugLogEntry[] {
  const seenIds = new Set<string>();
  const deduplicated: OwnerDebugLogEntry[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (!item || isObsoleteResolvedDebugLog(item)) continue;

    let candidateId = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : '';
    if (!candidateId || seenIds.has(candidateId)) {
      candidateId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now() + Math.random()}`;
    }
    seenIds.add(candidateId);
    deduplicated.push(candidateId === item.id ? item : { ...item, id: candidateId });
  }

  return deduplicated;
}

export function isObsoleteResolvedDebugLog(entry: Partial<OwnerDebugLogEntry> | null | undefined): boolean {
  if (!entry) return true;
  const msg = String(entry.message || '');
  const details = String(entry.stackOrDetails || '');
  return (
    msg.includes('Maximum update depth exceeded') ||
    details.includes('Maximum update depth exceeded') ||
    msg.includes('Encountered two children with the same key') ||
    details.includes('Encountered two children with the same key') ||
    msg.includes('Duplicate Keys') ||
    details.includes('Duplicate Keys') ||
    msg.includes('same key') ||
    details.includes('same key') ||
    msg.includes('Cannot set property fetch of #<Window>') ||
    details.includes('Cannot set property fetch of #<Window>') ||
    msg.includes('/api/app-version') ||
    details.includes('/api/app-version') ||
    msg.includes('app-version.json') ||
    details.includes('app-version.json') ||
    msg.includes('/api/amazon/lwa/token-exchange') ||
    details.includes('/api/amazon/lwa/token-exchange') ||
    (msg.includes('HTTP 404') && (msg.includes('/api/amazon/sp-api/') || msg.includes('/api/merchant/catalog'))) ||
    msg.includes('ServiceWorker script evaluation failed') ||
    details.includes('firebase-messaging-sw.js')
  );
}

export function loadLocalOwnerDebugLogs(): OwnerDebugLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OWNER_DEBUG_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = ensureUniqueOwnerDebugLogList(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_OWNER_DEBUG_LOGS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveLocalOwnerDebugLogs(logs: OwnerDebugLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    const uniqueLogs = ensureUniqueOwnerDebugLogList(logs).slice(0, 120);
    localStorage.setItem(STORAGE_KEY_OWNER_DEBUG_LOGS, JSON.stringify(uniqueLogs));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Checks whether the currently active user/session belongs to the App Owner (jassmeinnour@gmail.com)
 */
export function isCurrentSessionOwner(explicitEmail?: string | null): boolean {
  const emailToCheck = (
    explicitEmail ||
    currentRuntimeContext.userEmail ||
    auth.currentUser?.email ||
    ''
  )
    .trim()
    .toLowerCase();
  return emailToCheck === OWNER_EMAIL;
}

/**
 * Saves a debug log entry to local cache and to the Firestore `owner_debug_logs` collection
 */
export async function recordOwnerDebugLog(
  input: RecordOwnerDebugLogInput
): Promise<OwnerDebugLogEntry | null> {
  if (isObsoleteResolvedDebugLog(input)) {
    return null;
  }
  const now = new Date().toISOString();
  const safeId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `odbg_${crypto.randomUUID()}`
      : generateUniqueOwnerDebugLogId('odbg');

  const effectiveEmail = (
    input.ownerEmail ||
    currentRuntimeContext.userEmail ||
    auth.currentUser?.email ||
    OWNER_EMAIL
  )
    .trim()
    .toLowerCase();

  const activeTab = (input.activeTab || currentRuntimeContext.activeTab || 'radar').slice(0, 100);
  const affectedComponent = (
    input.affectedComponent ||
    inferAffectedComponentFromStackOrTab(input.stackOrDetails, activeTab)
  ).slice(0, 300);

  let stateSnapStr = input.appStateSnapshot;
  if (!stateSnapStr) {
    try {
      stateSnapStr = JSON.stringify(
        {
          ...currentRuntimeContext,
          viewport:
            typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
          online: typeof navigator !== 'undefined' ? navigator.onLine : true,
          capturedAt: now,
        },
        null,
        2
      );
    } catch {
      stateSnapStr = '{}';
    }
  }

  const entry: OwnerDebugLogEntry = {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : safeId,
    ownerEmail: OWNER_EMAIL,
    ownerUid: (input.ownerUid || currentRuntimeContext.userUid || auth.currentUser?.uid || 'owner_session').slice(
      0,
      128
    ),
    logType: input.logType,
    severity: input.severity || (input.logType === 'console_warn' ? 'medium' : 'high'),
    message: (input.message || 'Unspecified diagnostic event').slice(0, 3900),
    stackOrDetails: input.stackOrDetails ? input.stackOrDetails.slice(0, 9500) : undefined,
    affectedComponent,
    activeTab,
    appStateSnapshot: stateSnapStr ? stateSnapStr.slice(0, 9500) : undefined,
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 480) : 'Browser Client',
    url: typeof window !== 'undefined' ? window.location.href.slice(0, 950) : '',
    createdAt: now,
  };

  // 1. Update local cache immediately
  const existing = loadLocalOwnerDebugLogs();
  const updated = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, 120);
  saveLocalOwnerDebugLogs(updated);

  // Notify UI listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('owner_debug_log_recorded', {
        detail: entry,
      })
    );
  }

  // 2. Persist to Firestore `owner_debug_logs` collection if owner is active and quota is not exhausted
  if (effectiveEmail === OWNER_EMAIL && !isFirestoreQuotaExhausted()) {
    const path = `${OWNER_DEBUG_LOGS_COLLECTION}/${entry.id}`;
    try {
      const docRef = doc(db, OWNER_DEBUG_LOGS_COLLECTION, entry.id);
      const firestorePayload: Record<string, any> = {
        id: entry.id,
        ownerEmail: OWNER_EMAIL,
        ownerUid: entry.ownerUid || 'owner_session',
        logType: entry.logType,
        severity: entry.severity,
        message: entry.message,
        affectedComponent: entry.affectedComponent || 'src/App.tsx',
        activeTab: entry.activeTab || 'radar',
        userAgent: entry.userAgent || 'Browser',
        url: entry.url || '',
        createdAt: entry.createdAt,
      };
      if (entry.stackOrDetails) {
        firestorePayload.stackOrDetails = entry.stackOrDetails;
      }
      if (entry.appStateSnapshot) {
        firestorePayload.appStateSnapshot = entry.appStateSnapshot;
      }

      await setDoc(docRef, firestorePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  return entry;
}

/**
 * Subscription to `owner_debug_logs` with 5-minute cache and silent quota fallback
 */
export function subscribeToOwnerDebugLogs(
  onUpdate: (logs: OwnerDebugLogEntry[]) => void
): () => void {
  const initialLocal = loadLocalOwnerDebugLogs();
  onUpdate(initialLocal);

  const handleLocalEvent = () => {
    onUpdate(loadLocalOwnerDebugLogs());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('owner_debug_log_recorded', handleLocalEvent);
  }

  const cacheKey = 'owner_debug_logs_collection';
  if (isFirestoreQuotaExhausted() || isFirestoreCacheFresh(cacheKey, FIVE_MINUTES_MS)) {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('owner_debug_log_recorded', handleLocalEvent);
      }
    };
  }

  try {
    const q = query(
      collection(db, OWNER_DEBUG_LOGS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(60)
    );

    let unsubscribeSnapshot: (() => void) | null = null;
    unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        markFirestoreCacheFetched(cacheKey);
        const cloudLogs: OwnerDebugLogEntry[] = [];
        snapshot.forEach((docSnap) => {
          const rawData = docSnap.data() as OwnerDebugLogEntry;
          const docId = (rawData && rawData.id) || docSnap.id || generateUniqueOwnerDebugLogId('odbg_cloud');
          const data: OwnerDebugLogEntry = { ...rawData, id: docId };
          if (data && data.id) {
            if (isObsoleteResolvedDebugLog(data)) {
              // Automatically purge stale historical logs from Firestore
              deleteDoc(doc(db, OWNER_DEBUG_LOGS_COLLECTION, docSnap.id)).catch(() => {});
            } else {
              cloudLogs.push(data);
            }
          }
        });

        const localLogs = loadLocalOwnerDebugLogs();
        const mergedMap = new Map<string, OwnerDebugLogEntry>();

        cloudLogs.forEach((item) => mergedMap.set(item.id, item));
        localLogs.forEach((item) => {
          if (!mergedMap.has(item.id)) {
            mergedMap.set(item.id, item);
          }
        });

        const merged = ensureUniqueOwnerDebugLogList(
          Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        ).slice(0, 120);

        saveLocalOwnerDebugLogs(merged);
        onUpdate(merged);

        // Detach after hydration to rely on 5-minute cache
        if (unsubscribeSnapshot) {
          try {
            unsubscribeSnapshot();
          } catch {
            // ignore
          }
        }
      },
      (error) => {
        if (isFirestoreQuotaError(error)) {
          markFirestoreQuotaExhausted(error);
        }
        if (unsubscribeSnapshot) {
          try {
            unsubscribeSnapshot();
          } catch {
            // ignore
          }
        }
        onUpdate(loadLocalOwnerDebugLogs());
      }
    );

    const registeredUnsub = registerFirestoreListener(unsubscribeSnapshot);

    return () => {
      registeredUnsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('owner_debug_log_recorded', handleLocalEvent);
      }
    };
  } catch {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('owner_debug_log_recorded', handleLocalEvent);
      }
    };
  }
}

/**
 * Deletes a single debug log from Firestore `owner_debug_logs` and local cache
 */
export async function deleteOwnerDebugLog(logId: string): Promise<boolean> {
  const current = loadLocalOwnerDebugLogs().filter((l) => l.id !== logId);
  saveLocalOwnerDebugLogs(current);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('owner_debug_log_recorded'));
  }

  try {
    const docRef = doc(db, OWNER_DEBUG_LOGS_COLLECTION, logId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, `${OWNER_DEBUG_LOGS_COLLECTION}/${logId}`);
    } catch {
      // handled
    }
    return false;
  }
}

/**
 * Clears all owner debug logs from local cache and Firestore
 */
export async function clearAllOwnerDebugLogs(logsToDelete: OwnerDebugLogEntry[]): Promise<void> {
  saveLocalOwnerDebugLogs([]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('owner_debug_log_recorded'));
  }

  for (const item of logsToDelete.slice(0, 30)) {
    try {
      await deleteDoc(doc(db, OWNER_DEBUG_LOGS_COLLECTION, item.id));
    } catch {
      // continue
    }
  }
}

// Singleton guard so global interceptors are installed only once
let interceptorsInstalled = false;
let isInternalLogging = false;

/**
 * Safe Custom API Client wrapper around native browser fetch.
 * Avoids mutating window.fetch (which is read-only in some sandboxed environments)
 * while still recording API failures for the Owner Diagnostics dashboard.
 */
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const startMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const urlStr =
    typeof input === 'string'
      ? input
      : input instanceof URL
      ? input.toString()
      : input?.url || '';
  const method = init?.method || 'GET';

  try {
    const response = await fetch(input, init);
    if (
      !response.ok &&
      isCurrentSessionOwner() &&
      !urlStr.includes('firestore.googleapis.com') &&
      !urlStr.includes('/api/app-version') &&
      !urlStr.includes('app-version.json')
    ) {
      const elapsed = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startMs);
      let bodyPreview = '';
      try {
        const cloned = response.clone();
        bodyPreview = (await cloned.text()).slice(0, 1500);
      } catch {
        bodyPreview = '';
      }

      recordOwnerDebugLog({
        logType: 'api_failure',
        severity: response.status >= 500 ? 'critical' : 'high',
        message: `HTTP ${response.status} (${response.statusText || 'Failed'}) on ${method} ${urlStr}`,
        stackOrDetails: JSON.stringify(
          {
            endpoint: urlStr,
            method,
            status: response.status,
            statusText: response.statusText,
            durationMs: elapsed,
            responsePreview: bodyPreview,
          },
          null,
          2
        ),
      }).catch(() => {});
    }
    return response;
  } catch (fetchErr: any) {
    if (isCurrentSessionOwner() && !urlStr.includes('firestore.googleapis.com')) {
      const elapsed = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startMs);
      recordOwnerDebugLog({
        logType: 'api_failure',
        severity: 'critical',
        message: `Network / Fetch Failure on ${method} ${urlStr}: ${fetchErr?.message || String(fetchErr)}`,
        stackOrDetails: JSON.stringify(
          {
            endpoint: urlStr,
            method,
            durationMs: elapsed,
            error: fetchErr?.message || String(fetchErr),
            stack: fetchErr?.stack,
          },
          null,
          2
        ),
      }).catch(() => {});
    }
    throw fetchErr;
  }
}

/**
 * Installs automatic browser diagnostics interceptors for Console Errors,
 * Platform API Sync Events, Unhandled Promise Rejections, and Runtime Errors.
 * Note: Does NOT mutate window.fetch to prevent TypeError in strict environments.
 */
export function installOwnerDiagnosticsInterceptors(): void {
  try {
    if (typeof window === 'undefined' || interceptorsInstalled) return;
    interceptorsInstalled = true;

    const isIgnoredNoise = (msg: string): boolean => {
      const lower = msg.toLowerCase();
      return (
        msg.includes('Encountered two children with the same key') ||
        msg.includes('ResizeObserver') ||
        msg.includes('Could not reach Cloud Firestore backend') ||
        msg.includes('The client will operate in offline mode') ||
        lower.includes('quota limit exceeded') ||
        lower.includes('quota exceeded') ||
        lower.includes('resource-exhausted') ||
        lower.includes('free daily read units') ||
        msg.includes('@firebase/firestore') ||
        msg.includes('failed to connect to websocket') ||
        msg.includes('WebSocket') ||
        msg.includes('AudioContext') ||
        msg.includes('Cannot set property fetch of #<Window>') ||
        msg.includes('/api/app-version') ||
        msg.includes('ServiceWorker') ||
        msg.includes('serviceWorker') ||
        msg.includes('firebase-messaging-sw') ||
        msg.includes('owner_debug_logs')
      );
    };

    // 1. Intercept console.error safely with flood protection
    try {
      const prevConsoleError = console.error;
      let lastErrorMsg = '';
      let lastErrorTime = 0;

      console.error = (...args: any[]) => {
        prevConsoleError.apply(console, args);
        if (isInternalLogging || !isCurrentSessionOwner()) return;

        try {
          isInternalLogging = true;
          const text = args
            .map((a) => {
              if (typeof a === 'string') return a;
              if (a instanceof Error) return `${a.name}: ${a.message}`;
              try {
                return JSON.stringify(a);
              } catch {
                return String(a);
              }
            })
            .join(' ');

          if (!text || isIgnoredNoise(text) || text.includes('Maximum update depth exceeded')) return;

          const nowMs = Date.now();
          if (text === lastErrorMsg && nowMs - lastErrorTime < 2500) {
            return;
          }
          lastErrorMsg = text;
          lastErrorTime = nowMs;

          const firstErr = args.find((a) => a instanceof Error) as Error | undefined;
          const stack = firstErr?.stack || new Error().stack || '';

          recordOwnerDebugLog({
            logType: 'console_error',
            severity: 'high',
            message: text.slice(0, 2000),
            stackOrDetails: stack,
          }).catch(() => {});
        } finally {
          isInternalLogging = false;
        }
      };
    } catch {
      // Ignore if console.error is read-only
    }

    // 2. Listen to platform API sync error events from apiErrorLoggingService
    try {
      window.addEventListener('merchant_api_sync_error_recorded', (ev: any) => {
        if (!isCurrentSessionOwner()) return;
        const item = ev?.detail;
        if (!item) return;

        recordOwnerDebugLog({
          logType: 'api_failure',
          severity: item.severity === 'critical' ? 'critical' : 'high',
          message: `[${item.platformName || item.platform}] ${item.errorCode}: ${item.errorMessage}`,
          stackOrDetails: item.errorDetails || `Endpoint: ${item.endpoint}`,
          affectedComponent: 'src/services/apiErrorLoggingService.ts',
        }).catch(() => {});
      });
    } catch {
      // Ignore event listener attachment errors
    }

    // 3. Intercept window.fetch safely using Object.defineProperty(window, 'fetch', { value: ..., writable: true })
    // wrapped inside a dedicated try-catch to ensure OwnerAiStudioDebuggerWidget never crashes if fetch is inaccessible
    try {
      let rawFetch: typeof window.fetch | null = null;
      try {
        rawFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;
      } catch {
        rawFetch = null;
      }

      if (rawFetch) {
        const originalFetch = rawFetch;
        const wrappedFetch: typeof window.fetch = async (
          input: RequestInfo | URL,
          init?: RequestInit
        ): Promise<Response> => {
          const startMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
          const urlStr =
            typeof input === 'string'
              ? input
              : input instanceof URL
              ? input.toString()
              : input?.url || '';
          const method = init?.method || 'GET';

          const isIgnoredEndpoint =
            !urlStr ||
            urlStr.includes('firestore.googleapis.com') ||
            urlStr.includes('identitytoolkit.googleapis.com') ||
            urlStr.includes('securetoken.googleapis.com') ||
            urlStr.includes('/api/app-version') ||
            urlStr.includes('app-version.json') ||
            urlStr.includes('owner_debug_logs');

          const isHandledStaticFallbackEndpoint =
            urlStr.includes('/api/amazon/lwa/token-exchange') ||
            urlStr.includes('/api/amazon/sp-api/') ||
            urlStr.includes('/api/merchant/catalog');

          try {
            const response = await originalFetch(input, init);
            if (
              !response.ok &&
              !(response.status === 404 && isHandledStaticFallbackEndpoint) &&
              isCurrentSessionOwner() &&
              !isIgnoredEndpoint &&
              !isInternalLogging
            ) {
              const elapsed = Math.round(
                (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startMs
              );
              try {
                const cloned = response.clone();
                cloned
                  .text()
                  .then((text) => {
                    recordOwnerDebugLog({
                      logType: 'api_failure',
                      severity: response.status >= 500 ? 'critical' : 'high',
                      message: `HTTP ${response.status} (${response.statusText || 'Failed'}) on ${method} ${urlStr}`,
                      stackOrDetails: JSON.stringify(
                        {
                          endpoint: urlStr,
                          method,
                          status: response.status,
                          statusText: response.statusText,
                          durationMs: elapsed,
                          responsePreview: text.slice(0, 1500),
                        },
                        null,
                        2
                      ),
                    }).catch(() => {});
                  })
                  .catch(() => {});
              } catch {
                // Ignore response clone errors
              }
            }
            return response;
          } catch (fetchErr: any) {
            if (isCurrentSessionOwner() && !isIgnoredEndpoint && !isInternalLogging) {
              const elapsed = Math.round(
                (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startMs
              );
              recordOwnerDebugLog({
                logType: 'api_failure',
                severity: 'critical',
                message: `Network / Fetch Failure on ${method} ${urlStr}: ${
                  fetchErr?.message || String(fetchErr)
                }`,
                stackOrDetails: JSON.stringify(
                  {
                    endpoint: urlStr,
                    method,
                    durationMs: elapsed,
                    error: fetchErr?.message || String(fetchErr),
                    stack: fetchErr?.stack,
                  },
                  null,
                  2
                ),
              }).catch(() => {});
            }
            throw fetchErr;
          }
        };

        // First ensure window.fetch is writable using Object.defineProperty(window, 'fetch', { value: originalFetch, writable: true })
        Object.defineProperty(window, 'fetch', {
          value: originalFetch,
          writable: true,
          configurable: true,
        });

        // Then define the wrapped interceptor via Object.defineProperty
        Object.defineProperty(window, 'fetch', {
          value: wrappedFetch,
          writable: true,
          configurable: true,
        });
      }
    } catch {
      // Safely ignore if the iframe environment strictly locks or blocks access to window.fetch
    }

    // 4. Listen to runtime window errors & unhandled rejections
    try {
      window.addEventListener('error', (event: ErrorEvent) => {
        if (!isCurrentSessionOwner()) return;
        const msg = String(event.error?.message || event.message || '');
        if (!msg || isIgnoredNoise(msg)) return;

        recordOwnerDebugLog({
          logType: 'runtime_exception',
          severity: 'critical',
          message: msg,
          stackOrDetails:
            event.error?.stack ||
            `File: ${event.filename || 'unknown'}:${event.lineno || 0}:${event.colno || 0}`,
        }).catch(() => {});
      });

      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        if (!isCurrentSessionOwner()) return;
        const reason = event.reason;
        const msg = String(reason?.message || reason || '');
        if (!msg || isIgnoredNoise(msg)) return;

        recordOwnerDebugLog({
          logType: 'unhandled_rejection',
          severity: 'high',
          message: `Unhandled Promise Rejection: ${msg}`,
          stackOrDetails: reason?.stack || String(reason),
        }).catch(() => {});
      });
    } catch {
      // Ignore error listener attachment issues
    }
  } catch {
    // Top-level safety catch: ensure installOwnerDiagnosticsInterceptors never throws or crashes the app
  }
}

/**
 * Generates a ready-to-copy Markdown diagnostic report tailored for Google AI Studio
 */
export function generateAiStudioDebugPrompt(params: {
  logs: OwnerDebugLogEntry[];
  apiErrorsCount: number;
  selectedLog?: OwnerDebugLogEntry | null;
  customOwnerNote?: string;
}): string {
  const ctx = getOwnerDiagnosticsRuntimeContext();
  const nowReadable = new Date().toLocaleString('ar-EG');

  // Exclude recursive state_snapshot reports from the automatic errors section unless explicitly selected
  const actionableErrorLogs = params.logs.filter(
    (l) =>
      l.logType !== 'state_snapshot' &&
      !(l.stackOrDetails && l.stackOrDetails.includes('# 🛠️ تقرير تشخيص فوري لـ Google AI Studio'))
  );

  const recentLogs = params.selectedLog
    ? [params.selectedLog]
    : actionableErrorLogs.length > 0
    ? actionableErrorLogs.slice(0, 6)
    : params.logs
        .filter((l) => !(l.stackOrDetails && l.stackOrDetails.includes('# 🛠️ تقرير تشخيص فوري')))
        .slice(0, 3);

  const primaryComponent =
    params.selectedLog?.affectedComponent ||
    inferAffectedComponentFromStackOrTab(undefined, ctx.activeTab);

  const logsFormatted =
    recentLogs.length > 0
      ? recentLogs
          .map(
            (l, idx) =>
              `### [${idx + 1}] ${l.logType.toUpperCase()} (${l.severity.toUpperCase()}) - ${new Date(
                l.createdAt
              ).toLocaleTimeString('ar-EG')}
- **الرسالة (Message):** \`${l.message}\`
- **المكون / الملف المتأثر (Affected Code):** \`${l.affectedComponent || primaryComponent}\`
- **الشاشة النشطة (Active Tab):** \`${l.activeTab || ctx.activeTab}\`
${
  l.stackOrDetails
    ? `- **التفاصيل التقنية / Stack Trace:**\n\`\`\`json\n${l.stackOrDetails.slice(0, 1200)}\n\`\`\``
    : ''
}`
          )
          .join('\n\n')
      : `- لا توجد أخطاء حرجة مسجلة حالياً في الـ Console أو استجابات API فاشلة (0 Console Errors, 0 API Failures — النظام في حالة استقرار كامل).`;

  return `# 🛠️ تقرير تشخيص فوري لـ Google AI Studio — رادار التاجر الذكي مصر (Merchant Radar Egypt)

يرجى فحص وتحليل تقرير التشخيص التالي الملتقط تلقائياً من حساب مالكة التطبيق (\`${OWNER_EMAIL}\`) وتوليد الحل البرمجي المباشر في الكود:

${params.customOwnerNote ? `## 📝 ملاحظة وطلب مالكة التطبيق:\n> ${params.customOwnerNote}\n` : ''}
## 1. الكود والملفات المتأثرة (Affected Code & ComponentContext)
- **الملف / المكون المتأثر الرئيسي:** \`${primaryComponent}\`
- **التبويب النشط حالياً (Active Tab):** \`${ctx.activeTab}\` (${ctx.activeTabLabel || 'لوحة الرادار'})
- **المنتج النشط حالياً:** \`${ctx.currentProductTitle || 'غير محدد'}\` (ID: \`${ctx.currentProductId || 'N/A'}\`)
- **المتجر النشط (Active Merchant):** \`${ctx.activeMerchantName || 'المتجر الرئيسي'}\` (\`${ctx.activeMerchantId || 'default'}\`)

## 2. أحدث الأخطاء الملتقطة والاستجابات الفاشلة (Captured Console & API Errors)
${logsFormatted}

## 3. حالة التطبيق اللحظية (Current Application State Dump)
\`\`\`json
${JSON.stringify(
  {
    timestamp: nowReadable,
    ownerEmail: OWNER_EMAIL,
    activeTab: ctx.activeTab,
    firebaseFirestoreConnected: ctx.isDbConnected,
    connectedPlatforms: `${ctx.connectedPlatformsCount ?? 0}/${ctx.totalPlatformsCount ?? 0}`,
    platformsWithSyncErrors: ctx.errorPlatformsCount ?? 0,
    unresolvedApiSyncErrors: params.apiErrorsCount,
    totalOwnerDebugLogsInFirestore: params.logs.length,
    url: typeof window !== 'undefined' ? window.location.href : '',
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  },
  null,
  2
)}
\`\`\`

## 4. المطلوب من Google AI Studio:
1. تحليل السبب الجذري (Root Cause) للخطأ أو الاستجابة الفاشلة الموضحة أعلاه في \`${primaryComponent}\`.
2. تطبيق التعديل البرمجي اللازم مباشرة مع الحفاظ على استقرار باقي المكونات وقواعد \`firestore.rules\`.`;
}
