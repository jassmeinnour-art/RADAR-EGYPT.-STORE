/**
 * Utility to track, persist, and broadcast the exact Date & Time of the last successful
 * server data synchronization (SyncSuccess) across the entire application.
 */

export const SYNC_SUCCESS_STORAGE_KEY = 'merchant_radar_last_sync_success_v1';
export const SYNC_SUCCESS_EVENT = 'merchant_radar_sync_success';

export interface SyncSuccessRecord {
  timestamp: string; // ISO 8601 string
  formattedDateTime: string; // Arabic localized date + time
  source?: string;
  itemsCount?: number;
}

/**
 * Formats a Date object into Arabic date and time (e.g., "28/10/2026 - 12:05:30 م")
 */
export function formatSyncDateTime(date: Date = new Date()): string {
  try {
    const datePart = date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timePart = date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return `${datePart} ${timePart}`;
  } catch {
    const d = date.toISOString().slice(0, 10);
    const t = date.toTimeString().slice(0, 8);
    return `${d} ${t}`;
  }
}

/**
 * Retrieves the last successful sync record from localStorage
 */
export function getLastSyncSuccess(): SyncSuccessRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SYNC_SUCCESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.formattedDateTime) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Records a new successful server sync, persists to localStorage, and broadcasts
 * the SyncSuccess event to all components listening in real-time.
 */
export function recordSyncSuccess(source: string = 'server', itemsCount?: number): SyncSuccessRecord {
  const now = new Date();
  const record: SyncSuccessRecord = {
    timestamp: now.toISOString(),
    formattedDateTime: formatSyncDateTime(now),
    source,
    itemsCount,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYNC_SUCCESS_STORAGE_KEY, JSON.stringify(record));
      localStorage.setItem('radar_last_offline_sync_time', record.formattedDateTime);
    } catch (err) {
      console.warn('[SyncSuccess] Error writing to localStorage:', err);
    }

    try {
      // Dispatch both specific and general custom events
      window.dispatchEvent(new CustomEvent(SYNC_SUCCESS_EVENT, { detail: record }));
      window.dispatchEvent(new CustomEvent('SyncSuccess', { detail: record }));
    } catch {
      // ignore
    }
  }

  return record;
}
