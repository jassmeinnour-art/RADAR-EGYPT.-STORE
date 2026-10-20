export type SupportedCurrencyCode = 'EGP' | 'USD' | 'SAR' | 'AED' | 'EUR' | 'GBP';

export interface CurrencyInfo {
  code: SupportedCurrencyCode;
  nameAr: string;
  symbol: string;
  rateToEGP: number; // 1 unit of currency = X EGP
  isCustom?: boolean;
}

export const DEFAULT_CURRENCIES: Record<SupportedCurrencyCode, CurrencyInfo> = {
  EGP: { code: 'EGP', nameAr: 'جنيه مصري', symbol: 'ج.م', rateToEGP: 1.0 },
  USD: { code: 'USD', nameAr: 'دولار أمريكي', symbol: '$', rateToEGP: 48.5 },
  SAR: { code: 'SAR', nameAr: 'ريال سعودي', symbol: 'ر.س', rateToEGP: 12.9 },
  AED: { code: 'AED', nameAr: 'درهم إماراتي', symbol: 'د.إ', rateToEGP: 13.2 },
  EUR: { code: 'EUR', nameAr: 'يورو', symbol: '€', rateToEGP: 52.0 },
  GBP: { code: 'GBP', nameAr: 'جنيه إسترليني', symbol: '£', rateToEGP: 61.5 },
};

const STORAGE_KEY = 'merchant_radar_custom_exchange_rates_v1';
const ACTIVE_CURRENCY_KEY = 'merchant_radar_active_currency_v1';

export function getStoredExchangeRates(): Record<SupportedCurrencyCode, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        EGP: parsed.EGP ?? 1.0,
        USD: parsed.USD ?? 48.5,
        SAR: parsed.SAR ?? 12.9,
        AED: parsed.AED ?? 13.2,
        EUR: parsed.EUR ?? 52.0,
        GBP: parsed.GBP ?? 61.5,
      };
    }
  } catch (e) {
    console.error('Error loading custom exchange rates', e);
  }
  return {
    EGP: 1.0,
    USD: 48.5,
    SAR: 12.9,
    AED: 13.2,
    EUR: 52.0,
    GBP: 61.5,
  };
}

export function saveCustomExchangeRates(rates: Record<SupportedCurrencyCode, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
  } catch (e) {
    console.error('Error saving exchange rates', e);
  }
}

export function getActiveDisplayCurrency(): SupportedCurrencyCode {
  try {
    const curr = localStorage.getItem(ACTIVE_CURRENCY_KEY) as SupportedCurrencyCode;
    if (curr && DEFAULT_CURRENCIES[curr]) {
      return curr;
    }
  } catch (e) {
    console.error('Error loading active currency', e);
  }
  return 'EGP';
}

export function setActiveDisplayCurrency(code: SupportedCurrencyCode): void {
  try {
    localStorage.setItem(ACTIVE_CURRENCY_KEY, code);
  } catch (e) {
    console.error('Error saving active currency', e);
  }
}

/**
 * Convert an amount from EGP to target currency, or between any currencies
 */
export function convertCurrency(amountInEGP: number, targetCurrency: SupportedCurrencyCode): number {
  const rates = getStoredExchangeRates();
  const rate = rates[targetCurrency] || 1.0;
  if (rate <= 0) return amountInEGP;
  return Number((amountInEGP / rate).toFixed(2));
}

/**
 * Convert an amount from source currency to EGP
 */
export function convertToEGP(amount: number, sourceCurrency: SupportedCurrencyCode): number {
  const rates = getStoredExchangeRates();
  const rate = rates[sourceCurrency] || 1.0;
  return Number((amount * rate).toFixed(2));
}

/**
 * Format currency amount with symbol
 */
export function formatCurrencyAmount(amount: number, currencyCode: SupportedCurrencyCode = 'EGP'): string {
  const currencyInfo = DEFAULT_CURRENCIES[currencyCode] || DEFAULT_CURRENCIES['EGP'];
  const converted = currencyCode === 'EGP' ? amount : convertCurrency(amount, currencyCode);
  return `${converted.toLocaleString()} ${currencyInfo.symbol}`;
}
