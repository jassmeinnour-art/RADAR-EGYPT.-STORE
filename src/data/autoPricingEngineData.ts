import {
  AutoPricingRule,
  AutoPricingProductItem,
  AutoPricingExecutionLog,
  RuleEvaluationResult,
  AutoPricingGuardrailStatus
} from '../types/autoPricing';

export type { RuleEvaluationResult };

export const AUTO_PRICING_RULES_STORAGE_KEY = 'merchant_radar_auto_pricing_rules_v1';
export const AUTO_PRICING_PRODUCTS_STORAGE_KEY = 'merchant_radar_auto_pricing_products_v1';
export const AUTO_PRICING_LOGS_STORAGE_KEY = 'merchant_radar_auto_pricing_logs_v1';
export const AUTO_PRICING_MASTER_ACTIVE_KEY = 'merchant_radar_auto_pricing_master_active_v1';

export const DEFAULT_AUTO_PRICING_RULES: AutoPricingRule[] = [
  {
    id: 'rule-competitor-percent-change-plus-offset',
    title: 'تعديل ديناميكي: تغير سعر المنافس بنسبة 5% ➔ (سعر المنافس + 10 ج.م)',
    description: 'إذا تغير سعر المنافس بنسبة 5% أو أكثر، اضبط سعري إلى (سعر المنافس + 10 ج.م) فوراً مع إرسال إشعار تنبيه فوري 🔔',
    conditionType: 'competitor_price_changed_by_percent',
    conditionValue: 5,
    conditionPlatformFilter: 'all',
    actionType: 'competitor_plus_fixed',
    actionValue: 10,
    actionOffsetType: 'fixed_egp',
    instantNotification: true,
    guardrails: {
      minFloorPriceEGP: 150,
      maxCeilingPriceEGP: 5000,
      minNetMarginPercent: 12,
      maxDailyPriceChanges: 10,
      targetPlatforms: ['all']
    },
    isActive: true,
    priority: 1,
    isPreset: true,
    icon: 'Zap',
    createdAt: new Date().toISOString().substring(0, 10),
    updatedAt: new Date().toISOString().substring(0, 10)
  },
  {
    id: 'rule-buybox-undercut',
    title: 'استعادة الـ Buy Box: تخفيض 5 ج.م تحت أرخص منافس',
    description: 'إذا قام منافس ببيع نفس المنتج بسعر أقل مني، يخفض المحرك سعري بـ 5 ج.م تحت المنافس مع التزام بالحد الأدنى',
    conditionType: 'competitor_undercuts',
    conditionValue: 0,
    conditionPlatformFilter: 'all',
    actionType: 'undercut_fixed',
    actionValue: 5,
    instantNotification: true,
    guardrails: {
      minFloorPriceEGP: 120,
      maxCeilingPriceEGP: 4000,
      minNetMarginPercent: 10,
      maxDailyPriceChanges: 8,
      targetPlatforms: ['all']
    },
    isActive: true,
    priority: 2,
    isPreset: true,
    icon: 'TrendingDown',
    createdAt: new Date().toISOString().substring(0, 10),
    updatedAt: new Date().toISOString().substring(0, 10)
  },
  {
    id: 'rule-match-price-competitor-drop',
    title: 'مطابقة سعر المنافس تماماً (Price Matching)',
    description: 'عند انخفاض سعر السوق، يتم مطابقة سعر أرخص منافس لحماية حصتك السوقية مع تفعيل التنبيه الفوري',
    conditionType: 'competitor_drops',
    conditionValue: 0,
    conditionPlatformFilter: 'all',
    actionType: 'match_competitor',
    actionValue: 0,
    instantNotification: true,
    guardrails: {
      minFloorPriceEGP: 100,
      maxCeilingPriceEGP: 3500,
      minNetMarginPercent: 8,
      maxDailyPriceChanges: 6,
      targetPlatforms: ['all']
    },
    isActive: true,
    priority: 3,
    isPreset: true,
    icon: 'ShieldCheck',
    createdAt: new Date().toISOString().substring(0, 10),
    updatedAt: new Date().toISOString().substring(0, 10)
  }
];

export const INITIAL_AUTO_PRICING_PRODUCTS: AutoPricingProductItem[] = [
  {
    productId: 'prod-001',
    title: 'سماعات بلوتوث اللاسلكية بياع برومكس - أسود',
    category: 'إلكترونيات',
    sku: 'EAR-PRO-01',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    costPrice: 320,
    currentPrice: 550,
    lowestCompetitorPrice: 500,
    lowestCompetitorName: 'متجر نون إيجيبت (Noon)',
    lowestCompetitorPlatform: 'noon_eg',
    competitorInStock: true,
    assignedRuleId: 'rule-competitor-percent-change-plus-offset',
    autoPricingEnabled: true,
    customFloorPrice: 400,
    customCeilingPrice: 900,
    lastRepricedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 1
  },
  {
    productId: 'prod-002',
    title: 'شاحن سريع 65 واط تايب سي متعدد المنافذ',
    category: 'إكسسوارات',
    sku: 'CHG-65W-BLK',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&auto=format&fit=crop&q=80',
    costPrice: 180,
    currentPrice: 380,
    lowestCompetitorPrice: 340,
    lowestCompetitorName: 'سوق أمازون مصر (Amazon)',
    lowestCompetitorPlatform: 'amazon_eg',
    competitorInStock: true,
    assignedRuleId: 'rule-competitor-percent-change-plus-offset',
    autoPricingEnabled: true,
    customFloorPrice: 240,
    customCeilingPrice: 600,
    lastRepricedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 2
  },
  {
    productId: 'prod-003',
    title: 'ساعة ذكية مقاومة للماء مع تتبع اللياقة',
    category: 'ساعات وإلكترونيات',
    sku: 'SWT-FIT-PRO',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
    costPrice: 550,
    currentPrice: 990,
    lowestCompetitorPrice: 920,
    lowestCompetitorName: 'جوميا مصر (Jumia)',
    lowestCompetitorPlatform: 'jumia_eg',
    competitorInStock: true,
    assignedRuleId: 'rule-buybox-undercut',
    autoPricingEnabled: true,
    customFloorPrice: 700,
    customCeilingPrice: 1500,
    lastRepricedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 0
  },
  {
    productId: 'prod-004',
    title: 'حقيبة ظهر مقاومة للماء مع منفذ شحن USB',
    category: 'حقائب وموضة',
    sku: 'BAG-USB-NVY',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&auto=format&fit=crop&q=80',
    costPrice: 220,
    currentPrice: 450,
    lowestCompetitorPrice: 410,
    lowestCompetitorName: 'متجر نون إيجيبت (Noon)',
    lowestCompetitorPlatform: 'noon_eg',
    competitorInStock: true,
    assignedRuleId: 'rule-competitor-percent-change-plus-offset',
    autoPricingEnabled: true,
    customFloorPrice: 300,
    customCeilingPrice: 800,
    lastRepricedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 1
  }
];

export function loadAutoPricingRules(): AutoPricingRule[] {
  try {
    const raw = localStorage.getItem(AUTO_PRICING_RULES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return DEFAULT_AUTO_PRICING_RULES;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return INITIAL_AUTO_PRICING_PRODUCTS;
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
  const val = localStorage.getItem(AUTO_PRICING_MASTER_ACTIVE_KEY);
  if (val === null) return true; // Default enabled
  return val === 'true';
}

export function setAutoPricingMasterActive(active: boolean): void {
  localStorage.setItem(AUTO_PRICING_MASTER_ACTIVE_KEY, active ? 'true' : 'false');
}

export function evaluateAutoPricingRule(product: AutoPricingProductItem, rule: AutoPricingRule): RuleEvaluationResult {
  const compPrice = product.lowestCompetitorPrice;
  const currPrice = product.currentPrice;
  const costPrice = product.costPrice;

  // 1. Evaluate Condition (إذا حدث X)
  let isTriggered = false;
  let triggerReasonAr = '';
  let percentChangeCalculated = 0;

  switch (rule.conditionType) {
    case 'competitor_price_changed_by_percent': {
      const threshold = rule.conditionValue || 5; // Default X = 5%
      if (currPrice > 0 && compPrice > 0) {
        percentChangeCalculated = Math.abs((compPrice - currPrice) / currPrice) * 100;
        if (percentChangeCalculated >= threshold) {
          isTriggered = true;
          triggerReasonAr = `تغير سعر المنافس (${product.lowestCompetitorName}) بنسبة ${percentChangeCalculated.toFixed(1)}% (تجاوز حد الـ ${threshold}%)`;
        } else {
          triggerReasonAr = `تغير سعر المنافس (${percentChangeCalculated.toFixed(1)}%) لم يتجاوز نسبة الشرط المطلوب (${threshold}%)`;
        }
      } else {
        triggerReasonAr = 'بيانات أسعار المنافس غير مكتملة';
      }
      break;
    }

    case 'competitor_undercuts': {
      if (compPrice < currPrice) {
        isTriggered = true;
        triggerReasonAr = `المنافس (${product.lowestCompetitorName}) يبيع بسعر أقل منك (${compPrice.toLocaleString()} ج.م vs ${currPrice.toLocaleString()} ج.م)`;
      } else {
        triggerReasonAr = 'سعرك حالياً مساوي أو أفضل من المنافس';
      }
      break;
    }

    case 'competitor_drops': {
      if (compPrice < currPrice) {
        isTriggered = true;
        triggerReasonAr = `انخفض سعر أرخص منافس إلى ${compPrice.toLocaleString()} ج.م`;
      } else {
        triggerReasonAr = 'لم يتراجع سعر المنافس عن سعرك الحالي';
      }
      break;
    }

    case 'competitor_out_of_stock': {
      if (!product.competitorInStock) {
        isTriggered = true;
        triggerReasonAr = `نفاد مخزون المنافس الرئيسي (${product.lowestCompetitorName})`;
      } else {
        triggerReasonAr = 'المنافس متوفر لديه مخزون';
      }
      break;
    }

    case 'lowest_competitor_increases': {
      if (compPrice > currPrice) {
        isTriggered = true;
        triggerReasonAr = `ارتفع سعر المنافس إلى ${compPrice.toLocaleString()} ج.م`;
      } else {
        triggerReasonAr = 'لم يرتفع سعر المنافس';
      }
      break;
    }

    case 'price_gap_greater_than': {
      const gapThreshold = rule.conditionValue || 20;
      const actualGap = Math.abs(currPrice - compPrice);
      if (actualGap >= gapThreshold) {
        isTriggered = true;
        triggerReasonAr = `فارق السعر مع المنافس (${actualGap.toLocaleString()} ج.م) يتجاوز الحد الأدنى (${gapThreshold.toLocaleString()} ج.م)`;
      } else {
        triggerReasonAr = `فارق السعر (${actualGap.toLocaleString()} ج.م) أقل من الحد المطلوب (${gapThreshold.toLocaleString()} ج.م)`;
      }
      break;
    }

    case 'margin_exceeds_target': {
      const targetMargin = rule.conditionValue || 20;
      const currentNetProfit = currPrice - costPrice - (currPrice * 0.10);
      const currentMargin = (currentNetProfit / currPrice) * 100;
      if (currentMargin >= targetMargin) {
        isTriggered = true;
        triggerReasonAr = `هامش الربح الحالي (${currentMargin.toFixed(1)}%) أعلى من النسبة المستهدفة (${targetMargin}%)`;
      } else {
        triggerReasonAr = `هامش الربح الحالي (${currentMargin.toFixed(1)}%) أقل من المستهدف (${targetMargin}%)`;
      }
      break;
    }

    default: {
      isTriggered = compPrice < currPrice;
      triggerReasonAr = isTriggered ? 'رصد تغير في سوق المنافسين' : 'السعر الحالي يتطابق مع شروط الاستقرار';
      break;
    }
  }

  if (!isTriggered) {
    return {
      ruleId: rule.id,
      ruleTitle: rule.title,
      isTriggered: false,
      recommendedPrice: currPrice,
      finalPrice: currPrice,
      previousPrice: currPrice,
      priceDelta: 0,
      triggerReasonAr,
      actionTakenAr: 'لا يتطلب أي تعديل حالياً',
      floorPrice: product.customFloorPrice || rule.guardrails.minFloorPriceEGP || Math.round(costPrice * 1.15),
      ceilingPrice: product.customCeilingPrice || rule.guardrails.maxCeilingPriceEGP || Math.round(costPrice * 2.5),
      netProfitEGP: Math.round(currPrice - costPrice - (currPrice * 0.10)),
      netMarginPercent: Math.round(((currPrice - costPrice - (currPrice * 0.10)) / currPrice) * 100),
      guardrailStatus: 'safe',
      guardrailStatusLabelAr: 'مستقر وآمن'
    };
  }

  // 2. Calculate Action Target Price (قم بـ Y)
  let rawRecommendedPrice = currPrice;
  let actionTakenAr = '';

  switch (rule.actionType) {
    case 'competitor_plus_fixed':
    case 'set_competitor_plus_offset': {
      const offset = rule.actionValue;
      if (rule.actionOffsetType === 'percent') {
        rawRecommendedPrice = compPrice * (1 + offset / 100);
        actionTakenAr = `تعديل السعر إلى سعر المنافس + ${offset}% ➔ (${Math.round(rawRecommendedPrice).toLocaleString()} ج.م)`;
      } else {
        rawRecommendedPrice = compPrice + offset;
        actionTakenAr = `تعديل السعر إلى سعر المنافس + ${offset.toLocaleString()} ج.م ➔ (${Math.round(rawRecommendedPrice).toLocaleString()} ج.م)`;
      }
      break;
    }

    case 'competitor_plus_percent': {
      const offsetPercent = rule.actionValue;
      rawRecommendedPrice = compPrice * (1 + offsetPercent / 100);
      actionTakenAr = `تعديل السعر إلى سعر المنافس + ${offsetPercent}% ➔ (${Math.round(rawRecommendedPrice).toLocaleString()} ج.م)`;
      break;
    }

    case 'undercut_fixed': {
      const discount = rule.actionValue;
      rawRecommendedPrice = compPrice - discount;
      actionTakenAr = `تخفيض بمقدار ${discount.toLocaleString()} ج.م تحت سعر المنافس (${compPrice.toLocaleString()} ج.م)`;
      break;
    }

    case 'undercut_percent': {
      const discountPct = rule.actionValue;
      rawRecommendedPrice = compPrice * (1 - discountPct / 100);
      actionTakenAr = `تخفيض بنسبة ${discountPct}% تحت سعر المنافس (${compPrice.toLocaleString()} ج.م)`;
      break;
    }

    case 'match_competitor': {
      rawRecommendedPrice = compPrice;
      actionTakenAr = `مطابقة سعر المنافس تماماً عند ${compPrice.toLocaleString()} ج.م`;
      break;
    }

    case 'raise_fixed': {
      rawRecommendedPrice = currPrice + rule.actionValue;
      actionTakenAr = `رفع السعر بـ ${rule.actionValue.toLocaleString()} ج.م فوق السعر الحالي`;
      break;
    }

    case 'raise_percent': {
      rawRecommendedPrice = currPrice * (1 + rule.actionValue / 100);
      actionTakenAr = `رفع السعر بنسبة ${rule.actionValue}% فوق السعر الحالي`;
      break;
    }

    case 'raise_to_ceiling': {
      const ceiling = product.customCeilingPrice || rule.guardrails.maxCeilingPriceEGP || Math.round(costPrice * 2.5);
      rawRecommendedPrice = ceiling;
      actionTakenAr = `رفع السعر إلى السقف الأقصى المسموح (${ceiling.toLocaleString()} ج.م)`;
      break;
    }

    case 'target_margin': {
      const marginPct = rule.actionValue / 100;
      // Net Profit = Price - Cost - (Price * 0.10) => Margin = (Price * 0.90 - Cost) / Price => Price = Cost / (0.90 - Margin)
      const denominator = Math.max(0.1, 0.90 - marginPct);
      rawRecommendedPrice = costPrice / denominator;
      actionTakenAr = `ضبط السعر لتحقيق هامش صافي ${rule.actionValue}% ➔ (${Math.round(rawRecommendedPrice).toLocaleString()} ج.م)`;
      break;
    }

    default: {
      rawRecommendedPrice = compPrice + 10;
      actionTakenAr = `تعديل تلقائي لسعر المنافس + 10 ج.م`;
      break;
    }
  }

  // 3. Apply Safety Guardrails (Floor Price, Ceiling Price, Min Net Margin)
  const floorPrice = product.customFloorPrice || rule.guardrails.minFloorPriceEGP || Math.round(costPrice * 1.15);
  const ceilingPrice = product.customCeilingPrice || rule.guardrails.maxCeilingPriceEGP || Math.round(costPrice * 2.5);

  let finalPrice = Math.round(rawRecommendedPrice);
  let guardrailStatus: AutoPricingGuardrailStatus = 'safe';
  let guardrailStatusLabelAr = 'تطابق مع شروط الأمان والهامش الربحي';

  if (finalPrice < floorPrice) {
    finalPrice = floorPrice;
    guardrailStatus = 'floor_enforced';
    guardrailStatusLabelAr = `تم إيقاف التخفيض عند الحد الأدنى (Floor: ${floorPrice.toLocaleString()} ج.م) لحماية القاع`;
  } else if (finalPrice > ceilingPrice) {
    finalPrice = ceilingPrice;
    guardrailStatus = 'ceiling_enforced';
    guardrailStatusLabelAr = `تم حصر السعر عند السقف الأقصى (Ceiling: ${ceilingPrice.toLocaleString()} ج.م)`;
  }

  // Estimate net profit after Amazon/Noon commission (~10%)
  const estimatedNetProfit = Math.round(finalPrice - costPrice - (finalPrice * 0.10));
  const estimatedNetMarginPercent = Math.round((estimatedNetProfit / finalPrice) * 100);

  const priceDelta = finalPrice - currPrice;

  return {
    ruleId: rule.id,
    ruleTitle: rule.title,
    isTriggered: true,
    recommendedPrice: Math.round(rawRecommendedPrice),
    finalPrice,
    previousPrice: currPrice,
    priceDelta,
    triggerReasonAr,
    actionTakenAr,
    floorPrice,
    ceilingPrice,
    netProfitEGP: estimatedNetProfit,
    netMarginPercent: estimatedNetMarginPercent,
    guardrailStatus,
    guardrailStatusLabelAr
  };
}
