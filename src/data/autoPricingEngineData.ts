import {
  AutoPricingRule,
  AutoPricingProductItem,
  AutoPricingExecutionLog,
  RuleEvaluationResult
} from '../types/autoPricing';

export type { RuleEvaluationResult };

export const AUTO_PRICING_RULES_STORAGE_KEY = 'merchant_radar_auto_pricing_rules_v1';
export const AUTO_PRICING_PRODUCTS_STORAGE_KEY = 'merchant_radar_auto_pricing_products_v1';
export const AUTO_PRICING_LOGS_STORAGE_KEY = 'merchant_radar_auto_pricing_logs_v1';
export const AUTO_PRICING_MASTER_ACTIVE_KEY = 'merchant_radar_auto_pricing_master_active_v1';

export const INITIAL_AUTO_PRICING_PRODUCTS: AutoPricingProductItem[] = [];
export const DEFAULT_AUTO_PRICING_RULES: AutoPricingRule[] = [];

export function loadAutoPricingRules(): AutoPricingRule[] {
  try {
    const raw = localStorage.getItem(AUTO_PRICING_RULES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_AUTO_PRICING_RULES;
  } catch {
    return DEFAULT_AUTO_PRICING_RULES;
  }
}

export function saveAutoPricingRules(rules: AutoPricingRule[]): void {
  localStorage.setItem(AUTO_PRICING_RULES_STORAGE_KEY, JSON.stringify(rules));
}

export function loadAutoPricingProducts(): AutoPricingProductItem[] {
  try {
    const raw = localStorage.getItem(AUTO_PRICING_PRODUCTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_AUTO_PRICING_PRODUCTS;
  } catch {
    return INITIAL_AUTO_PRICING_PRODUCTS;
  }
}

export function saveAutoPricingProducts(products: AutoPricingProductItem[]): void {
  localStorage.setItem(AUTO_PRICING_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

export function loadAutoPricingLogs(): AutoPricingExecutionLog[] {
  try {
    const raw = localStorage.getItem(AUTO_PRICING_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAutoPricingLogs(logs: AutoPricingExecutionLog[]): void {
  localStorage.setItem(AUTO_PRICING_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 500)));
}

export function getAutoPricingMasterActive(): boolean {
  return localStorage.getItem(AUTO_PRICING_MASTER_ACTIVE_KEY) === 'true';
}

export function setAutoPricingMasterActive(active: boolean): void {
  localStorage.setItem(AUTO_PRICING_MASTER_ACTIVE_KEY, active ? 'true' : 'false');
}

export function evaluateAutoPricingRule(product: AutoPricingProductItem, rule: AutoPricingRule): RuleEvaluationResult {
  // Production Blank Slate - No logic yet, just return untriggered
  return {
    isTriggered: false,
    finalPrice: product.currentPrice,
    priceDelta: 0,
    triggerReasonAr: 'بانتظار البيانات الحقيقية',
    actionTakenAr: 'لا يوجد إجراء',
    floorPrice: product.costPrice,
    ceilingPrice: product.costPrice * 2,
    netProfitEGP: 0,
    netMarginPercent: 0,
    guardrailStatus: 'optimal',
    guardrailStatusLabelAr: 'مستقر'
  };
}
