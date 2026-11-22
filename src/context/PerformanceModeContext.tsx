import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const PERFORMANCE_MODE_STORAGE_KEY = 'radar_performance_mode';
export const PERFORMANCE_MODE_CHANGED_EVENT = 'radar_performance_mode_changed';

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

export function detectSlowNetworkHint(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
  };
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return false;
  if (conn.saveData === true) return true;
  const eff = String(conn.effectiveType || '').toLowerCase();
  return eff === 'slow-2g' || eff === '2g';
}

export function readInitialPerformanceMode(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(PERFORMANCE_MODE_STORAGE_KEY);
      if (saved === 'true') return true;
      if (saved === 'false') return false;
    } catch {
      // safe fallback when storage is unavailable
    }
  }
  return detectSlowNetworkHint();
}

export function syncPerformanceModeDom(enabled: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('performance-mode', enabled);
  root.setAttribute('data-performance-mode', enabled ? 'true' : 'false');
}

export function persistPerformanceMode(enabled: boolean): void {
  syncPerformanceModeDom(enabled);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, String(enabled));
    } catch {
      // ignore storage quota / private mode errors
    }
    window.dispatchEvent(
      new CustomEvent(PERFORMANCE_MODE_CHANGED_EVENT, {
        detail: { enabled },
      })
    );
  }
}

export interface PerformanceModeContextValue {
  isPerformanceMode: boolean;
  isSlowNetworkDetected: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  togglePerformanceMode: () => boolean;
}

const PerformanceModeContext = createContext<PerformanceModeContextValue | null>(null);

export const PerformanceModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isPerformanceMode, setIsPerformanceModeState] = useState<boolean>(() =>
    readInitialPerformanceMode()
  );
  const [isSlowNetworkDetected, setIsSlowNetworkDetected] = useState<boolean>(() =>
    detectSlowNetworkHint()
  );

  useEffect(() => {
    syncPerformanceModeDom(isPerformanceMode);
  }, [isPerformanceMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<{ enabled?: boolean }>;
      if (typeof custom.detail?.enabled === 'boolean') {
        setIsPerformanceModeState(custom.detail.enabled);
      } else {
        setIsPerformanceModeState(readInitialPerformanceMode());
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PERFORMANCE_MODE_STORAGE_KEY) {
        setIsPerformanceModeState(readInitialPerformanceMode());
      }
    };
    window.addEventListener(PERFORMANCE_MODE_CHANGED_EVENT, handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(PERFORMANCE_MODE_CHANGED_EVENT, handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & {
      connection?: NetworkInformationLike & {
        addEventListener?: (type: string, cb: () => void) => void;
        removeEventListener?: (type: string, cb: () => void) => void;
      };
    };
    const conn = nav.connection;
    if (!conn?.addEventListener) return;
    const onConnChange = () => {
      setIsSlowNetworkDetected(detectSlowNetworkHint());
    };
    conn.addEventListener('change', onConnChange);
    return () => conn.removeEventListener?.('change', onConnChange);
  }, []);

  const setPerformanceMode = useCallback((enabled: boolean) => {
    setIsPerformanceModeState(enabled);
    persistPerformanceMode(enabled);
  }, []);

  const togglePerformanceMode = useCallback(() => {
    const next = !isPerformanceMode;
    setIsPerformanceModeState(next);
    persistPerformanceMode(next);
    return next;
  }, [isPerformanceMode]);

  const value = useMemo<PerformanceModeContextValue>(
    () => ({
      isPerformanceMode,
      isSlowNetworkDetected,
      setPerformanceMode,
      togglePerformanceMode,
    }),
    [isPerformanceMode, isSlowNetworkDetected, setPerformanceMode, togglePerformanceMode]
  );

  return (
    <PerformanceModeContext.Provider value={value}>
      {children}
    </PerformanceModeContext.Provider>
  );
};

export function usePerformanceMode(): PerformanceModeContextValue {
  const ctx = useContext(PerformanceModeContext);
  const [standaloneEnabled, setStandaloneEnabled] = useState<boolean>(() =>
    readInitialPerformanceMode()
  );

  useEffect(() => {
    if (ctx) return;
    syncPerformanceModeDom(standaloneEnabled);
    if (typeof window === 'undefined') return;
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<{ enabled?: boolean }>;
      if (typeof custom.detail?.enabled === 'boolean') {
        setStandaloneEnabled(custom.detail.enabled);
      } else {
        setStandaloneEnabled(readInitialPerformanceMode());
      }
    };
    window.addEventListener(PERFORMANCE_MODE_CHANGED_EVENT, handleSync);
    return () => {
      window.removeEventListener(PERFORMANCE_MODE_CHANGED_EVENT, handleSync);
    };
  }, [ctx, standaloneEnabled]);

  const setStandalone = useCallback((enabled: boolean) => {
    setStandaloneEnabled(enabled);
    persistPerformanceMode(enabled);
  }, []);

  const toggleStandalone = useCallback(() => {
    const next = !standaloneEnabled;
    setStandaloneEnabled(next);
    persistPerformanceMode(next);
    return next;
  }, [standaloneEnabled]);

  if (ctx) {
    return ctx;
  }

  return {
    isPerformanceMode: standaloneEnabled,
    isSlowNetworkDetected: detectSlowNetworkHint(),
    setPerformanceMode: setStandalone,
    togglePerformanceMode: toggleStandalone,
  };
}
