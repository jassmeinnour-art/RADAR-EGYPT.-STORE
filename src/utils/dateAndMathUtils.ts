/**
 * Safe date and math utilities for RADAR EGYPT
 * Prevents 'Invalid Date', 'NaN%', and '%NaN' errors.
 */

export function safeFormatDate(
  dateInput: string | number | Date | null | undefined,
  locale: string = 'ar-EG',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) {
    return new Date().toLocaleDateString(locale, options || { year: 'numeric', month: 'short', day: 'numeric' });
  }
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return new Date().toLocaleDateString(locale, options || { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString(locale, options || { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return new Date().toLocaleDateString(locale, options || { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

export function safePercent(numerator: number, denominator: number, decimals: number = 0): number {
  if (
    typeof numerator !== 'number' ||
    typeof denominator !== 'number' ||
    isNaN(numerator) ||
    isNaN(denominator) ||
    denominator === 0
  ) {
    return 0;
  }
  const result = (numerator / denominator) * 100;
  if (isNaN(result) || !isFinite(result)) return 0;
  return Number(result.toFixed(decimals));
}

export function formatPercentString(numerator: number, denominator: number, decimals: number = 0): string {
  const pct = safePercent(numerator, denominator, decimals);
  return `${pct}%`;
}

export function safeParseTimestamp(
  dateInput: string | number | Date | null | undefined
): number | null {
  if (dateInput === null || dateInput === undefined || dateInput === '') return null;
  const d = new Date(dateInput);
  const time = d.getTime();
  return isNaN(time) ? null : time;
}

export function safeFormatDateTime(
  dateInput: string | number | Date | null | undefined,
  locale: string = 'ar-EG'
): string {
  const ts = safeParseTimestamp(dateInput);
  const target = ts !== null ? new Date(ts) : new Date();
  try {
    return target.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return target.toISOString();
  }
}

export function getDaysSinceDate(
  dateInput: string | number | Date | null | undefined,
  referenceDate: Date = new Date()
): number {
  const ts = safeParseTimestamp(dateInput);
  if (ts === null) return 0;
  const diffMs = Math.max(0, referenceDate.getTime() - ts);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
