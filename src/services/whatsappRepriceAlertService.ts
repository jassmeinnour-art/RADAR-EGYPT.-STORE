/**
 * WhatsApp Automated Alert & Auto-Repricing Service
 * خدمة التنبيهات التلقائية عبر واتساب والتعديل الفوري للأسعار (Auto-Repricing)
 */

import { ProductData, MerchantOffer, ProductPricingPlan } from '../types';
import { checkPriceFloorProximity } from '../data/pricingGuardrailsData';

export interface WhatsAppAlertConfig {
  merchantPhoneNumber: string; // e.g. "+201012345678" or "201012345678"
  isWhatsAppAlertsEnabled: boolean;
  autoRepriceOnAlert: boolean; // Auto-apply reprice without manual confirmation if true
  repriceStrategy: 'match_floor' | 'undercut_competitor_safe' | 'match_competitor_if_safe';
  undercutMarginEGP: number; // e.g. 5 EGP
  notifyOnCriticalBreachOnly: boolean; // Only alert if price breaches floor, or also on critical proximity
  autoOpenWhatsAppTab: boolean;
}

export interface WhatsAppRepriceAlertRecord {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  platformName: string;
  competitorName: string;
  oldCompetitorPrice: number;
  newCompetitorPrice: number;
  currentMerchantPrice: number;
  floorPrice: number;
  recommendedPrice: number;
  status: 'alerted' | 'repriced' | 'ignored';
  timestamp: string;
  whatsappSent: boolean;
  whatsappMessageText: string;
  currency: string;
  breachAmountEGP: number;
}

const STORAGE_KEY_CONFIG = 'merchant_radar_whatsapp_reprice_config_v1';
const STORAGE_KEY_LOGS = 'merchant_radar_whatsapp_reprice_logs_v1';

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppAlertConfig = {
  merchantPhoneNumber: '201012345678',
  isWhatsAppAlertsEnabled: true,
  autoRepriceOnAlert: false,
  repriceStrategy: 'undercut_competitor_safe',
  undercutMarginEGP: 5,
  notifyOnCriticalBreachOnly: false,
  autoOpenWhatsAppTab: false,
};

/**
 * Clean and format phone number for international WhatsApp URL
 */
export function formatWhatsAppPhoneNumber(phone: string): string {
  // Strip non-numeric characters except leading plus
  let cleaned = phone.replace(/[^0-9]/g, '');
  // If user entered 010... (Egyptian local), convert to 2010...
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '20' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Retrieve saved WhatsApp Alert configurations
 */
export function getWhatsAppAlertConfig(): WhatsAppAlertConfig {
  if (typeof window === 'undefined') return DEFAULT_WHATSAPP_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_WHATSAPP_CONFIG;
    return { ...DEFAULT_WHATSAPP_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WHATSAPP_CONFIG;
  }
}

/**
 * Save WhatsApp Alert configurations
 */
export function saveWhatsAppAlertConfig(config: WhatsAppAlertConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save WhatsApp alert config:', err);
  }
}

/**
 * Retrieve WhatsApp Reprice Alert Logs
 */
export function getWhatsAppRepriceAlertLogs(): WhatsAppRepriceAlertRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Append an alert record to history
 */
export function saveWhatsAppRepriceAlertLog(log: WhatsAppRepriceAlertRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getWhatsAppRepriceAlertLogs();
    const updated = [log, ...current.filter(item => item.id !== log.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save WhatsApp alert log:', err);
  }
}

/**
 * Calculate the safest auto-reprice target given a competitor price drop and merchant plan
 */
export function calculateSafeRepriceTarget(
  product: ProductData,
  competitorPrice: number,
  plan?: ProductPricingPlan | null,
  config: WhatsAppAlertConfig = getWhatsAppAlertConfig()
): {
  recommendedPrice: number;
  effectiveFloor: number;
  strategyLabel: string;
  isFloorProtected: boolean;
  profitMarginPercent: number;
} {
  const costPrice = plan ? Math.max(1, plan.costPrice) : Math.max(1, (product.estimatedWholesaleCost || product.suggestedRetailPrice * 0.65));
  const rawFloor = plan ? plan.globalMinPrice : costPrice + 20;
  const effectiveFloor = Math.max(costPrice + 15, rawFloor);

  let targetPrice = effectiveFloor;
  let strategyLabel = 'حماية صمام الأمان (الحد الأدنى المربح)';
  let isFloorProtected = true;

  if (config.repriceStrategy === 'match_floor') {
    targetPrice = effectiveFloor;
    strategyLabel = 'تثبيت عند الحد الأدنى لحماية الهامش الربحي';
  } else if (config.repriceStrategy === 'undercut_competitor_safe') {
    const undercutPrice = Math.round(competitorPrice - config.undercutMarginEGP);
    if (undercutPrice >= effectiveFloor) {
      targetPrice = undercutPrice;
      strategyLabel = `تخفيض (-${config.undercutMarginEGP} ج.م) عن المنافس لاقتناص الصندوق الذهبي (BuyBox)`;
      isFloorProtected = false;
    } else {
      targetPrice = effectiveFloor;
      strategyLabel = `المنافس كسر حد الأمان - تم التثبيت عند صمام الأمان (${effectiveFloor} ج.م) لتفادي الخسارة`;
      isFloorProtected = true;
    }
  } else if (config.repriceStrategy === 'match_competitor_if_safe') {
    if (competitorPrice >= effectiveFloor) {
      targetPrice = competitorPrice;
      strategyLabel = 'مطابقة سعر المنافس بأمان';
      isFloorProtected = false;
    } else {
      targetPrice = effectiveFloor;
      strategyLabel = `تثبيت عند حد الأمان (${effectiveFloor} ج.م) لأن سعر المنافس دون التكلفة`;
      isFloorProtected = true;
    }
  }

  const profitMarginPercent = targetPrice > 0 ? Math.round(((targetPrice - costPrice) / targetPrice) * 100) : 0;

  return {
    recommendedPrice: Math.round(targetPrice),
    effectiveFloor: Math.round(effectiveFloor),
    strategyLabel,
    isFloorProtected,
    profitMarginPercent,
  };
}

/**
 * Generate formatted WhatsApp message text
 */
export function generateWhatsAppPriceDropMessage(params: {
  product: ProductData;
  competitorOffer: MerchantOffer;
  recommendedPrice: number;
  effectiveFloor: number;
  breachAmount: number;
  currency?: string;
  appBaseUrl?: string;
}): string {
  const { product, competitorOffer, recommendedPrice, effectiveFloor, breachAmount, currency = 'ج.م' } = params;
  const baseUrl = params.appBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://merchant-radar.duckdns.org');
  const actionUrl = `${baseUrl}/?action=autoreprice&productId=${product.id}&newPrice=${recommendedPrice}`;

  const isBreached = breachAmount > 0;
  const statusHeadline = isBreached
    ? `🚨 *تنبيه كسر صمام الأمان (سعر المنافس دون الحد الأدنى)!* 🚨`
    : `⚠️ *تنبيه اقتراب حرج من الحد الأدنى للسعر!* ⚠️`;

  return [
    statusHeadline,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *المنتج:* ${product.title}`,
    `🏷️ *الكود (SKU):* ${product.sku || 'N/A'}`,
    `🏬 *المنصة:* ${competitorOffer.platformName || 'السوق المصري'}`,
    `👤 *المنافس:* ${competitorOffer.merchantName}`,
    `📉 *سعر المنافس:* ${competitorOffer.price.toLocaleString('ar-EG')} ${currency}`,
    `🛡️ *حد أمان متجرك (Floor):* ${effectiveFloor.toLocaleString('ar-EG')} ${currency}`,
    isBreached
      ? `💥 *مقدار كسر الحد الأدنى:* ${breachAmount.toLocaleString('ar-EG')} ${currency}`
      : `📊 *سعر متجرك الحالي:* ${product.suggestedRetailPrice.toLocaleString('ar-EG')} ${currency}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💡 *التوصية الذكية للتسعير (Auto-Reprice):*`,
    `السعر المقترح الآمن: *${recommendedPrice.toLocaleString('ar-EG')} ${currency}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⚡ *لتطبيق التعديل التلقائي بنقرة واحدة:*`,
    `${actionUrl}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `رادار التاجر الذكي - درعك لحماية الأرباح وتصدر المبيعات 🇪🇬`
  ].join('\n');
}

/**
 * Trigger WhatsApp opening via wa.me / api.whatsapp.com
 */
export function openWhatsAppChat(phoneNumber: string, messageText: string): void {
  const formattedPhone = formatWhatsAppPhoneNumber(phoneNumber);
  const encodedText = encodeURIComponent(messageText);
  const whatsappUrl = formattedPhone
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Evaluates whether a competitor price change triggers a WhatsApp alert and auto-repricing
 */
export function evaluateCompetitorPriceDropAndAlert(params: {
  product: ProductData;
  competitorOffer: MerchantOffer;
  pricingPlan?: ProductPricingPlan | null;
  platformCode?: string;
  config?: WhatsAppAlertConfig;
  onExecuteAutoReprice?: (productId: string, newPrice: number, competitorName: string, reason: string) => void;
}): {
  shouldAlert: boolean;
  alertRecord?: WhatsAppRepriceAlertRecord;
  repriceTarget: ReturnType<typeof calculateSafeRepriceTarget>;
} {
  const config = params.config || getWhatsAppAlertConfig();
  const { product, competitorOffer, pricingPlan, platformCode } = params;

  const proxEval = checkPriceFloorProximity(
    competitorOffer.price,
    pricingPlan,
    platformCode || competitorOffer.platformName
  );

  const isBreached = proxEval.isBreached;
  const isApproaching = proxEval.isApproachingFloor;
  const shouldAlert = config.isWhatsAppAlertsEnabled && (config.notifyOnCriticalBreachOnly ? isBreached : (isBreached || isApproaching));

  const repriceTarget = calculateSafeRepriceTarget(product, competitorOffer.price, pricingPlan, config);
  const breachAmount = isBreached ? Math.max(0, repriceTarget.effectiveFloor - competitorOffer.price) : 0;

  let alertRecord: WhatsAppRepriceAlertRecord | undefined;

  if (shouldAlert) {
    const messageText = generateWhatsAppPriceDropMessage({
      product,
      competitorOffer,
      recommendedPrice: repriceTarget.recommendedPrice,
      effectiveFloor: repriceTarget.effectiveFloor,
      breachAmount,
    });

    alertRecord = {
      id: `wa-alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      productTitle: product.title,
      sku: product.sku || '',
      platformName: competitorOffer.platformName,
      competitorName: competitorOffer.merchantName,
      oldCompetitorPrice: product.currentLowestPrice || competitorOffer.price,
      newCompetitorPrice: competitorOffer.price,
      currentMerchantPrice: product.suggestedRetailPrice,
      floorPrice: repriceTarget.effectiveFloor,
      recommendedPrice: repriceTarget.recommendedPrice,
      status: config.autoRepriceOnAlert ? 'repriced' : 'alerted',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      whatsappSent: false,
      whatsappMessageText: messageText,
      currency: 'ج.م',
      breachAmountEGP: breachAmount,
    };

    saveWhatsAppRepriceAlertLog(alertRecord);

    // If continuous auto-reprice is enabled, automatically apply the safe reprice
    if (config.autoRepriceOnAlert && params.onExecuteAutoReprice) {
      params.onExecuteAutoReprice(
        product.id,
        repriceTarget.recommendedPrice,
        competitorOffer.merchantName,
        `تعديل تلقائي فوري (Auto-Repricing) إثر انخفاض سعر المنافس: ${repriceTarget.strategyLabel}`
      );
    }

    // Auto-open WhatsApp if configured
    if (config.autoOpenWhatsAppTab && config.merchantPhoneNumber) {
      openWhatsAppChat(config.merchantPhoneNumber, messageText);
      alertRecord.whatsappSent = true;
      saveWhatsAppRepriceAlertLog(alertRecord);
    }
  }

  return {
    shouldAlert,
    alertRecord,
    repriceTarget,
  };
}
