import { useState, useEffect, useCallback } from 'react';

export const MAINTENANCE_MODE_STORAGE_KEY = 'radar_maintenance_mode_v1';
export const MAINTENANCE_MODE_EVENT = 'radar_maintenance_mode_changed';

export const MAINTENANCE_MODE_BLOCK_MESSAGE =
  'وضع الصيانة مفعل حالياً — تم إيقاف عمليات سحب البيانات والتحديثات التلقائية مؤقتاً أثناء التعديلات على النظام.';

export interface MaintenanceModeState {
  enabled: boolean;
  reason: string;
  updatedAt: string;
}

const DEFAULT_STATE: MaintenanceModeState = {
  enabled: false,
  reason: 'إجراء تعديلات وتحديثات على بنية النظام',
  updatedAt: '',
};

export function getMaintenanceModeState(): MaintenanceModeState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_STATE;
  }
  try {
    const raw = window.localStorage.getItem(MAINTENANCE_MODE_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed?.enabled),
      reason: typeof parsed?.reason === 'string' && parsed.reason.trim()
        ? parsed.reason
        : DEFAULT_STATE.reason,
      updatedAt: typeof parsed?.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function isMaintenanceModeActive(): boolean {
  return getMaintenanceModeState().enabled;
}

export function setMaintenanceModeActive(
  enabled: boolean,
  reason?: string
): MaintenanceModeState {
  const prev = getMaintenanceModeState();
  const next: MaintenanceModeState = {
    enabled: Boolean(enabled),
    reason: typeof reason === 'string' && reason.trim() ? reason.trim() : prev.reason,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MAINTENANCE_MODE_STORAGE_KEY, JSON.stringify(next));
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent(MAINTENANCE_MODE_EVENT, { detail: next }));
    } catch {}
  }

  return next;
}

export function toggleMaintenanceMode(reason?: string): MaintenanceModeState {
  const current = getMaintenanceModeState();
  return setMaintenanceModeActive(!current.enabled, reason);
}

export function useMaintenanceMode() {
  const [state, setState] = useState<MaintenanceModeState>(() => getMaintenanceModeState());

  useEffect(() => {
    const syncState = () => {
      setState(getMaintenanceModeState());
    };

    const handleCustom = (e: Event) => {
      const detail = (e as CustomEvent<MaintenanceModeState>)?.detail;
      if (detail && typeof detail.enabled === 'boolean') {
        setState(detail);
      } else {
        syncState();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === MAINTENANCE_MODE_STORAGE_KEY || e.key === null) {
        syncState();
      }
    };

    window.addEventListener(MAINTENANCE_MODE_EVENT, handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(MAINTENANCE_MODE_EVENT, handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setEnabled = useCallback((enabled: boolean, reason?: string) => {
    const next = setMaintenanceModeActive(enabled, reason);
    setState(next);
    return next;
  }, []);

  const toggle = useCallback((reason?: string) => {
    const next = toggleMaintenanceMode(reason);
    setState(next);
    return next;
  }, []);

  return {
    isMaintenanceMode: state.enabled,
    maintenanceState: state,
    setMaintenanceMode: setEnabled,
    toggleMaintenanceMode: toggle,
  };
}
