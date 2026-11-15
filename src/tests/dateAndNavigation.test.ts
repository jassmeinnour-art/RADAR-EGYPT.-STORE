import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  safeFormatDate,
  safeFormatDateTime,
  safeParseTimestamp,
  getDaysSinceDate,
  safePercent,
  formatPercentString,
} from '../utils/dateAndMathUtils';
import {
  resolvePathToTab,
  resolveTabToPath,
  navigate,
  TAB_TO_PATH_MAP,
  type WorkspaceTab,
} from '../utils/navigation';

describe('Date Utility Functions (dateAndMathUtils)', () => {
  describe('safeParseTimestamp', () => {
    it('parses valid ISO strings, timestamps, and Date objects accurately', () => {
      const iso = '2026-05-15T10:30:00.000Z';
      const ts = Date.parse(iso);
      expect(safeParseTimestamp(iso)).toBe(ts);
      expect(safeParseTimestamp(ts)).toBe(ts);
      expect(safeParseTimestamp(new Date(ts))).toBe(ts);
    });

    it('returns null for null, undefined, empty strings, or invalid date inputs', () => {
      expect(safeParseTimestamp(null)).toBeNull();
      expect(safeParseTimestamp(undefined)).toBeNull();
      expect(safeParseTimestamp('')).toBeNull();
      expect(safeParseTimestamp('not-a-valid-date')).toBeNull();
      expect(safeParseTimestamp(NaN)).toBeNull();
    });
  });

  describe('safeFormatDate & safeFormatDateTime', () => {
    it('formats valid dates without returning "Invalid Date"', () => {
      const formattedAr = safeFormatDate('2026-03-20T12:00:00Z', 'ar-EG');
      const formattedEn = safeFormatDate('2026-03-20T12:00:00Z', 'en-US');

      expect(formattedAr).toBeTruthy();
      expect(formattedAr).not.toContain('Invalid Date');
      expect(formattedEn).toContain('2026');
      expect(formattedEn).not.toContain('Invalid Date');
    });

    it('falls back gracefully to current valid date when given invalid or empty inputs', () => {
      const fallbackNull = safeFormatDate(null, 'en-US');
      const fallbackInvalid = safeFormatDate('invalid-date-xyz', 'en-US');
      const currentYear = String(new Date().getFullYear());

      expect(fallbackNull).toContain(currentYear);
      expect(fallbackNull).not.toContain('Invalid Date');
      expect(fallbackInvalid).toContain(currentYear);
      expect(fallbackInvalid).not.toContain('Invalid Date');
    });

    it('formats date and time safely via safeFormatDateTime', () => {
      const result = safeFormatDateTime('2026-06-10T14:45:00Z', 'en-US');
      expect(result).toContain('2026');
      expect(result).not.toContain('Invalid Date');

      const invalidFallback = safeFormatDateTime('bad-date', 'en-US');
      expect(invalidFallback).not.toContain('Invalid Date');
    });
  });

  describe('getDaysSinceDate', () => {
    it('computes whole days elapsed relative to referenceDate', () => {
      const ref = new Date('2026-06-30T00:00:00Z');
      expect(getDaysSinceDate('2026-06-25T00:00:00Z', ref)).toBe(5);
      expect(getDaysSinceDate('2026-06-30T00:00:00Z', ref)).toBe(0);
    });

    it('never returns negative days for future dates or invalid dates', () => {
      const ref = new Date('2026-06-01T00:00:00Z');
      expect(getDaysSinceDate('2026-06-15T00:00:00Z', ref)).toBe(0);
      expect(getDaysSinceDate('invalid-date', ref)).toBe(0);
      expect(getDaysSinceDate(null, ref)).toBe(0);
    });
  });

  describe('safePercent & formatPercentString', () => {
    it('calculates percentages and avoids NaN or Infinity', () => {
      expect(safePercent(25, 100)).toBe(25);
      expect(safePercent(1, 3, 2)).toBe(33.33);
      expect(safePercent(10, 0)).toBe(0);
      expect(safePercent(NaN, 50)).toBe(0);
      expect(formatPercentString(3, 4)).toBe('75%');
      expect(formatPercentString(10, 0)).toBe('0%');
    });
  });
});

describe('Path Resolvers & Navigation Utilities (navigation.ts)', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  describe('resolvePathToTab', () => {
    it('resolves root, index.html, and /login to home tab', () => {
      expect(resolvePathToTab('/')).toBe('home');
      expect(resolvePathToTab('')).toBe('home');
      expect(resolvePathToTab('/index.html')).toBe('home');
      expect(resolvePathToTab('/login')).toBe('home');
    });

    it('resolves all core workspace routes accurately', () => {
      expect(resolvePathToTab('/dashboard')).toBe('dashboard');
      expect(resolvePathToTab('/traders')).toBe('traders');
      expect(resolvePathToTab('/traders/trader-99')).toBe('traders');
      expect(resolvePathToTab('/products')).toBe('products');
      expect(resolvePathToTab('/inventory')).toBe('inventory');
      expect(resolvePathToTab('/invoices')).toBe('shipping');
      expect(resolvePathToTab('/invoices/split')).toBe('split_invoices');
      expect(resolvePathToTab('/reports')).toBe('reports');
      expect(resolvePathToTab('/trending')).toBe('trending');
      expect(resolvePathToTab('/competitors')).toBe('radar');
      expect(resolvePathToTab('/auto-pricing')).toBe('auto_pricing');
      expect(resolvePathToTab('/price-comparison')).toBe('price_comparison');
      expect(resolvePathToTab('/watchlist')).toBe('watchlist');
      expect(resolvePathToTab('/analytics')).toBe('analytics');
      expect(resolvePathToTab('/connections')).toBe('platforms_guide');
      expect(resolvePathToTab('/gmail-sync')).toBe('traders_sync');
      expect(resolvePathToTab('/settings/layout')).toBe('layout_settings');
      expect(resolvePathToTab('/help')).toBe('help');
    });

    it('handles trailing slashes, query parameters, and hash fragments cleanly', () => {
      expect(resolvePathToTab('/products/')).toBe('products');
      expect(resolvePathToTab('/products?trader=abc&platform=amazon')).toBe('products');
      expect(resolvePathToTab('/competitors#top')).toBe('radar');
      expect(resolvePathToTab('/traders/t-123/')).toBe('traders');
    });

    it('returns not_found for unknown paths', () => {
      expect(resolvePathToTab('/non-existent-route')).toBe('not_found');
      expect(resolvePathToTab('/admin/secret')).toBe('not_found');
    });
  });

  describe('resolveTabToPath & bidirectional consistency', () => {
    it('maps tabs back to canonical URLs', () => {
      expect(resolveTabToPath('home')).toBe('/');
      expect(resolveTabToPath('products')).toBe('/products');
      expect(resolveTabToPath('shipping')).toBe('/invoices');
      expect(resolveTabToPath('split_invoices')).toBe('/invoices/split');
      expect(resolveTabToPath('radar')).toBe('/competitors');
    });

    it('maintains round-trip resolution for primary mapped tabs', () => {
      const entries = Object.entries(TAB_TO_PATH_MAP) as Array<[WorkspaceTab, string]>;
      for (const [tab, path] of entries) {
        if (tab === 'merchants') continue; // alias for /products
        expect(resolvePathToTab(path)).toBe(tab);
      }
    });
  });

  describe('navigate', () => {
    it('updates window.location and dispatches a popstate event', () => {
      const popHandler = vi.fn();
      window.addEventListener('popstate', popHandler);

      navigate('/products?trader=t-1');

      expect(window.location.pathname).toBe('/products');
      expect(window.location.search).toBe('?trader=t-1');
      expect(popHandler).toHaveBeenCalledTimes(1);

      window.removeEventListener('popstate', popHandler);
    });
  });
});
