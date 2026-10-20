import {
  ProductPricingPlan,
  ProductData,
  SmartDynamicPriceEvaluation,
  SmartDynamicPricingEventLog,
  GuardrailEnforcementStatus,
  SmartDynamicPricingRuleType,
} from '../types';

export const PRICING_PLANS_STORAGE_KEY = 'merchant_radar_pricing_plans_v2';
export const DYNAMIC_PRICING_LOGS_STORAGE_KEY = 'merchant_radar_smart_dynamic_pricing_logs_v1';

export const INITIAL_PRICING_PLANS: Record<string, ProductPricingPlan> = {
  'B09FURNCHR1': {
    productId: 'B09FURNCHR1',
    productTitle: 'كرسي مكتب طبي هيدروليك مريح داعم للفقرات القطنية مع مسند رأس - شبك أسود',
    costPrice: 2650, // سعر الجملة من سوق المناصرة والتجهيزات المكتبية
    globalMinPrice: 2950, // الحد الأدنى المطلق (Floor Price) لضمان هامش ربح آمن
    globalMaxPrice: 4200, // الحد الأقصى المطلق (Ceiling Price) وقت شح المعروض
    suggestedOptimalPrice: 3450,
    autoRepriceWithinBounds: true,
    repriceRuleType: 'undercut_lowest_competitor',
    undercutMode: 'fixed_egp',
    undercutValue: 25,
    targetNetMarginPercent: 14,
    autoRaiseOnStockoutOrSurge: true,
    lastModifiedAt: '2026-08-25 15:00',
    modifiedBy: 'المسوق المسؤول عن بعد (Marketer Manager)',
    platformGuardrails: [
      {
        platformId: 'amazon-eg',
        platformName: 'أمازون مصر (Amazon Egypt)',
        platformCode: 'amazon_eg',
        minAllowedPrice: 3100,
        maxAllowedPrice: 4200,
        actualSellingPrice: 3450,
        platformCommissionPercent: 10,
        platformFixedFeeEGP: 35,
        netProfitEGP: 420,
        netMarginPercent: 12.2,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'noon-eg',
        platformName: 'نون مصر (Noon Egypt)',
        platformCode: 'noon_eg',
        minAllowedPrice: 3200,
        maxAllowedPrice: 4300,
        actualSellingPrice: 3690,
        platformCommissionPercent: 12,
        platformFixedFeeEGP: 30,
        netProfitEGP: 567,
        netMarginPercent: 15.4,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'homzmart-eg',
        platformName: 'هومزمارت مصر (Homzmart)',
        platformCode: 'homzmart_eg',
        minAllowedPrice: 3150,
        maxAllowedPrice: 4200,
        actualSellingPrice: 3580,
        platformCommissionPercent: 14,
        platformFixedFeeEGP: 40,
        netProfitEGP: 388,
        netMarginPercent: 10.8,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'jumia-eg',
        platformName: 'جوميا مصر (Jumia Egypt)',
        platformCode: 'jumia_eg',
        minAllowedPrice: 3250,
        maxAllowedPrice: 4100,
        actualSellingPrice: 3650,
        platformCommissionPercent: 8,
        platformFixedFeeEGP: 25,
        netProfitEGP: 683,
        netMarginPercent: 18.7,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      }
    ]
  },
  'B09FURNTBL2': {
    productId: 'B09FURNTBL2',
    productTitle: 'طاولة قهوة مودرن خشب زان روماني طبيعي مع رف تخزين سفلي مقاس 100×60 سم - بني جوزي',
    costPrice: 2150,
    globalMinPrice: 2450,
    globalMaxPrice: 3500,
    suggestedOptimalPrice: 2850,
    autoRepriceWithinBounds: true,
    repriceRuleType: 'undercut_lowest_competitor',
    undercutMode: 'fixed_egp',
    undercutValue: 20,
    targetNetMarginPercent: 14,
    autoRaiseOnStockoutOrSurge: true,
    lastModifiedAt: '2026-08-25 15:00',
    modifiedBy: 'المسوق المسؤول عن بعد (Marketer Manager)',
    platformGuardrails: [
      {
        platformId: 'amazon-eg',
        platformName: 'أمازون مصر (Amazon Egypt)',
        platformCode: 'amazon_eg',
        minAllowedPrice: 2550,
        maxAllowedPrice: 3500,
        actualSellingPrice: 2850,
        platformCommissionPercent: 10,
        platformFixedFeeEGP: 35,
        netProfitEGP: 380,
        netMarginPercent: 13.3,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'homzmart-eg',
        platformName: 'هومزمارت مصر (Homzmart)',
        platformCode: 'homzmart_eg',
        minAllowedPrice: 2600,
        maxAllowedPrice: 3500,
        actualSellingPrice: 2950,
        platformCommissionPercent: 12,
        platformFixedFeeEGP: 30,
        netProfitEGP: 416,
        netMarginPercent: 14.1,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      }
    ]
  },
  'B09FURNDSK3': {
    productId: 'B09FURNDSK3',
    productTitle: 'مكتب عمل ودراسة خشب زان طبيعي مودرن مع وحدات تخزين وأدراج هيدروليك مقاس 140×70 سم',
    costPrice: 3600, // سعر الجملة الرسمي الصافي
    globalMinPrice: 4100, // الحد الأدنى
    globalMaxPrice: 5500, // الحد الأقصى
    suggestedOptimalPrice: 4650,
    autoRepriceWithinBounds: true,
    repriceRuleType: 'undercut_lowest_competitor',
    undercutMode: 'fixed_egp',
    undercutValue: 30,
    targetNetMarginPercent: 15,
    autoRaiseOnStockoutOrSurge: true,
    lastModifiedAt: '2026-08-25 15:30',
    modifiedBy: 'المسوق المسؤول عن بعد (Marketer Manager)',
    platformGuardrails: [
      {
        platformId: 'amazon-eg',
        platformName: 'أمازون مصر (Amazon Egypt)',
        platformCode: 'amazon_eg',
        minAllowedPrice: 4200,
        maxAllowedPrice: 5500,
        actualSellingPrice: 4650,
        platformCommissionPercent: 9.0,
        platformFixedFeeEGP: 40,
        netProfitEGP: 591,
        netMarginPercent: 12.7,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'noon-eg',
        platformName: 'نون مصر (Noon Egypt)',
        platformCode: 'noon_eg',
        minAllowedPrice: 4300,
        maxAllowedPrice: 5500,
        actualSellingPrice: 4799,
        platformCommissionPercent: 8.5,
        platformFixedFeeEGP: 35,
        netProfitEGP: 756,
        netMarginPercent: 15.7,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'homzmart-eg',
        platformName: 'هومزمارت مصر (Homzmart)',
        platformCode: 'homzmart_eg',
        minAllowedPrice: 4250,
        maxAllowedPrice: 5500,
        actualSellingPrice: 4750,
        platformCommissionPercent: 10.0,
        platformFixedFeeEGP: 35,
        netProfitEGP: 640,
        netMarginPercent: 13.5,
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      }
    ]
  }
};

/**
 * Load all stored pricing plans from localStorage merged with INITIAL_PRICING_PLANS
 */
export function loadStoredPricingPlans(): Record<string, ProductPricingPlan> {
  if (typeof window === 'undefined') return { ...INITIAL_PRICING_PLANS };
  try {
    const raw = localStorage.getItem(PRICING_PLANS_STORAGE_KEY);
    if (!raw) return { ...INITIAL_PRICING_PLANS };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PRICING_PLANS,
      ...(parsed || {}),
    };
  } catch {
    return { ...INITIAL_PRICING_PLANS };
  }
}

/**
 * Save a single product pricing plan and broadcast update event
 */
export function saveStoredPricingPlan(plan: ProductPricingPlan): Record<string, ProductPricingPlan> {
  const all = loadStoredPricingPlans();
  const updated = {
    ...all,
    [plan.productId]: plan,
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PRICING_PLANS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('merchant_pricing_guardrails_updated', { detail: { productId: plan.productId, plan } }));
    } catch {
      // ignore storage errors
    }
  }
  return updated;
}

/**
 * Save multiple pricing plans at once
 */
export function saveAllStoredPricingPlans(plans: Record<string, ProductPricingPlan>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRICING_PLANS_STORAGE_KEY, JSON.stringify(plans));
    window.dispatchEvent(new CustomEvent('merchant_pricing_guardrails_updated', { detail: { plans } }));
  } catch {
    // ignore
  }
}

/**
 * Generate or retrieve dynamic pricing plan for any product
 */
export function getOrCreatePricingPlan(product?: ProductData | null): ProductPricingPlan {
  if (!product || !product.id) {
    return {
      productId: 'prod-placeholder',
      productTitle: 'منتج غير محدد',
      costPrice: 2000,
      globalMinPrice: 2200,
      globalMaxPrice: 3200,
      suggestedOptimalPrice: 2500,
      autoRepriceWithinBounds: true,
      repriceRuleType: 'undercut_lowest_competitor',
      undercutMode: 'fixed_egp',
      undercutValue: 25,
      targetNetMarginPercent: 14,
      autoRaiseOnStockoutOrSurge: true,
      lastModifiedAt: 'اليوم',
      modifiedBy: 'المسوق المسؤول',
      platformGuardrails: []
    };
  }

  const storedPlans = loadStoredPricingPlans();
  if (storedPlans[product.id]) {
    const existing = storedPlans[product.id];
    return {
      ...existing,
      undercutMode: existing.undercutMode || 'fixed_egp',
      undercutValue: existing.undercutValue ?? 25,
      targetNetMarginPercent: existing.targetNetMarginPercent ?? 14,
      autoRaiseOnStockoutOrSurge: existing.autoRaiseOnStockoutOrSurge ?? true,
    };
  }

  const cost = product.estimatedWholesaleCost || Math.round((product.currentLowestPrice || 2500) * 0.78);
  const minPrice = Math.round(cost * 1.12); // Minimum 12% gross markup to cover fees + floor profit
  const maxPrice = Math.round(cost * 1.55); // Ceiling 55% markup
  const sellingPrice = product.suggestedRetailPrice || product.currentLowestPrice || Math.round(cost * 1.24);

  return {
    productId: product.id,
    productTitle: product.title,
    costPrice: cost,
    globalMinPrice: minPrice,
    globalMaxPrice: maxPrice,
    suggestedOptimalPrice: sellingPrice,
    autoRepriceWithinBounds: true,
    repriceRuleType: 'undercut_lowest_competitor',
    undercutMode: 'fixed_egp',
    undercutValue: 25,
    targetNetMarginPercent: 14,
    autoRaiseOnStockoutOrSurge: true,
    lastModifiedAt: 'اليوم',
    modifiedBy: 'محرك التسعير الديناميكي الذكي',
    platformGuardrails: [
      {
        platformId: 'amazon-eg',
        platformName: 'أمازون مصر (Amazon Egypt)',
        platformCode: 'amazon_eg',
        minAllowedPrice: minPrice,
        maxAllowedPrice: maxPrice,
        actualSellingPrice: sellingPrice,
        platformCommissionPercent: 8,
        platformFixedFeeEGP: 25,
        netProfitEGP: Math.round(sellingPrice * 0.92 - 25 - cost),
        netMarginPercent: Math.round(((sellingPrice * 0.92 - 25 - cost) / sellingPrice) * 100),
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'noon-eg',
        platformName: 'نون مصر (Noon Egypt)',
        platformCode: 'noon_eg',
        minAllowedPrice: minPrice,
        maxAllowedPrice: maxPrice,
        actualSellingPrice: Math.round(sellingPrice * 1.02),
        platformCommissionPercent: 7,
        platformFixedFeeEGP: 20,
        netProfitEGP: Math.round(sellingPrice * 1.02 * 0.93 - 20 - cost),
        netMarginPercent: Math.round(((sellingPrice * 1.02 * 0.93 - 20 - cost) / (sellingPrice * 1.02)) * 100),
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'kenzz-eg',
        platformName: 'منصة كنز (Kenzz Egypt)',
        platformCode: 'kenzz_eg',
        minAllowedPrice: Math.round(cost * 1.09),
        maxAllowedPrice: Math.round(maxPrice * 0.95),
        actualSellingPrice: Math.round(sellingPrice * 0.98),
        platformCommissionPercent: 6,
        platformFixedFeeEGP: 15,
        netProfitEGP: Math.round(sellingPrice * 0.98 * 0.94 - 15 - cost),
        netMarginPercent: Math.round(((sellingPrice * 0.98 * 0.94 - 15 - cost) / (sellingPrice * 0.98)) * 100),
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      },
      {
        platformId: 'homzmart-eg',
        platformName: 'هومزمارت مصر (Homzmart)',
        platformCode: 'homzmart_eg',
        minAllowedPrice: Math.round(cost * 1.14),
        maxAllowedPrice: maxPrice,
        actualSellingPrice: Math.round(sellingPrice * 1.04),
        platformCommissionPercent: 9,
        platformFixedFeeEGP: 30,
        netProfitEGP: Math.round(sellingPrice * 1.04 * 0.91 - 30 - cost),
        netMarginPercent: Math.round(((sellingPrice * 1.04 * 0.91 - 30 - cost) / (sellingPrice * 1.04)) * 100),
        isFloorPriceLocked: true,
        lastGuardrailStatus: 'optimal_within_bounds'
      }
    ]
  };
}

/**
 * Helper to get Arabic label for SmartDynamicPricingRuleType
 */
export function getDynamicPricingRuleLabel(
  ruleType: SmartDynamicPricingRuleType,
  undercutMode?: 'fixed_egp' | 'percentage',
  undercutValue?: number,
  targetMargin?: number
): string {
  switch (ruleType) {
    case 'undercut_lowest_competitor':
      if (undercutMode === 'percentage') {
        return `أقل من أرخص منافس بنسبة ${undercutValue ?? 2}% (اقتناص Buy Box)`;
      }
      return `أقل من أرخص منافس بـ ${undercutValue ?? 25} ج.م (اقتناص Buy Box)`;
    case 'match_lowest_competitor':
      return 'مطابقة سعر أرخص منافس تماماً مع حماية الحد الأدنى';
    case 'target_margin_percentage':
      return `تأمين هامش ربح صافي مستهدف (${targetMargin ?? 15}%) بعد العمولات`;
    case 'match_market_median':
      return 'موازنة السعر مع متوسط أسعار المنافسين بالسوق';
    default:
      return 'تسعير ديناميكي محمي بحدود الربح';
  }
}

/**
 * Interface representing the result of evaluating how close a price is to the minimum floor guardrail
 */
export interface FloorProximityEvaluation {
  isApproachingFloor: boolean;     // True if within proximity buffer (e.g. <= 8% or <= 150 EGP above floor)
  isBreached: boolean;             // True if strictly below the minimum allowed floor price
  isSafe: boolean;                 // True if comfortably above the floor
  currentPrice: number;            // Evaluated price
  effectiveFloorPrice: number;     // Floor threshold price for the product/platform
  costPrice: number;               // Wholesale cost
  distanceToFloorEGP: number;      // currentPrice - effectiveFloorPrice
  proximityPercent: number;        // Margin above floor: ((currentPrice - floor) / floor) * 100
  bufferThresholdPercent: number;  // Proximity buffer (default 8%)
  statusHeadlineAr: string;        // Headline message in Arabic
  statusExplanationAr: string;     // Detailed explanation in Arabic
  urgencyLevel: 'safe' | 'warning' | 'danger';
  platformName: string;
  isFloorLocked: boolean;
}

/**
 * Checks if a given price approaches or breaches the minimum protection guardrail (Floor Price)
 */
export function checkPriceFloorProximity(
  price: number,
  plan?: ProductPricingPlan | null,
  platformCode?: string,
  bufferThresholdPercent: number = 8
): FloorProximityEvaluation {
  if (!plan) {
    return {
      isApproachingFloor: false,
      isBreached: false,
      isSafe: true,
      currentPrice: price,
      effectiveFloorPrice: 0,
      costPrice: 0,
      distanceToFloorEGP: 0,
      proximityPercent: 100,
      bufferThresholdPercent,
      statusHeadlineAr: 'صمام الأمان غير مهيأ',
      statusExplanationAr: '',
      urgencyLevel: 'safe',
      platformName: 'الكل',
      isFloorLocked: false,
    };
  }

  const targetGuardrail = platformCode && platformCode !== 'all'
    ? plan.platformGuardrails.find(g => g.platformCode === platformCode)
    : null;

  const rawFloor = targetGuardrail ? targetGuardrail.minAllowedPrice : plan.globalMinPrice;
  const cost = Math.max(1, plan.costPrice);
  // Guarantee floor price is strictly never below wholesale cost + 15 EGP
  const effectiveFloorPrice = Math.max(cost + 15, rawFloor);
  const isFloorLocked = targetGuardrail ? targetGuardrail.isFloorPriceLocked : true;
  const platformName = targetGuardrail?.platformName || 'جميع المنصات';

  const distanceToFloorEGP = Math.round(price - effectiveFloorPrice);
  const proximityPercent = effectiveFloorPrice > 0
    ? Math.round(((price - effectiveFloorPrice) / effectiveFloorPrice) * 1000) / 10
    : 100;

  const isBreached = distanceToFloorEGP < 0;
  // Trigger warning if breached OR if distance is within 150 EGP or margin <= bufferThresholdPercent (8%)
  const isApproachingFloor = isBreached || (distanceToFloorEGP <= 150 || proximityPercent <= bufferThresholdPercent);
  const isSafe = !isApproachingFloor && !isBreached;

  let urgencyLevel: 'safe' | 'warning' | 'danger' = 'safe';
  let statusHeadlineAr = 'السعر ضمن النطاق الآمن المربح 🛡️';
  let statusExplanationAr = `السعر الحالي (${price.toLocaleString('ar-EG')} ج.م) يبتعد بهامش أمان مريح (+${distanceToFloorEGP.toLocaleString('ar-EG')} ج.م / +${proximityPercent}%) أعلى من الحد الأدنى للحماية (${effectiveFloorPrice.toLocaleString('ar-EG')} ج.م).`;

  if (isBreached) {
    urgencyLevel = 'danger';
    statusHeadlineAr = '🚨 خطر كسر صمام الأمان: السعر دون الحد الأدنى للحماية!';
    statusExplanationAr = `السعر المقترح (${price.toLocaleString('ar-EG')} ج.م) يكسر الحد الأدنى للحماية (${effectiveFloorPrice.toLocaleString('ar-EG')} ج.م) بمقدار ${Math.abs(distanceToFloorEGP).toLocaleString('ar-EG')} ج.م! تطبيق هذا السعر يتسبب في خسارة مباشرة أو تآكل الربح. تم تفعيل تنبيه صمام الأمان لمنع البيع غير الآمن.`;
  } else if (isApproachingFloor) {
    urgencyLevel = 'warning';
    statusHeadlineAr = '⚠️ تنبيه صمام الأمان: اقتراب حرج من الحد الأدنى للحماية';
    statusExplanationAr = `السعر المقترح (${price.toLocaleString('ar-EG')} ج.م) يقترب بشكل حرج من الحد الأدنى للحماية (${effectiveFloorPrice.toLocaleString('ar-EG')} ج.م) بفارق ${distanceToFloorEGP.toLocaleString('ar-EG')} ج.م فقط (${proximityPercent}%)! يُوصى بتفعيل قفل الحماية أو رفع السعر لتفادي كسر هامش الربح.`;
  }

  return {
    isApproachingFloor,
    isBreached,
    isSafe,
    currentPrice: price,
    effectiveFloorPrice,
    costPrice: cost,
    distanceToFloorEGP,
    proximityPercent,
    bufferThresholdPercent,
    statusHeadlineAr,
    statusExplanationAr,
    urgencyLevel,
    platformName,
    isFloorLocked,
  };
}

/**
 * Core Smart Dynamic Pricing Evaluator:
 * Evaluates the optimal product price when a competitor price changes, strictly enforcing Pricing Guardrails (Floor & Ceiling).
 */
export function evaluateSmartDynamicPrice(
  product: ProductData,
  plan: ProductPricingPlan,
  overrideCompetitorPrice?: number,
  overrideCompetitorName?: string,
  overrideCompetitorPlatform?: string,
  allCompetitorsOutOfStock: boolean = false
): SmartDynamicPriceEvaluation {
  const offers = product.merchantOffers || [];
  const inStockOffers = offers.filter((o) => o.stockStatus !== 'out_of_stock' && o.inStock !== false);
  const lowestOffer =
    inStockOffers.length > 0
      ? inStockOffers.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), inStockOffers[0])
      : offers[0];

  const competitorLowestPrice =
    overrideCompetitorPrice !== undefined
      ? overrideCompetitorPrice
      : lowestOffer?.price || product.currentLowestPrice || plan.suggestedOptimalPrice;

  const competitorMerchantName =
    overrideCompetitorName || lowestOffer?.merchantName || 'أرخص منافس بالسوق المصري';
  const competitorPlatformName =
    overrideCompetitorPlatform || lowestOffer?.platformName || 'أمازون / نون مصر';

  const primaryGuardrail = plan.platformGuardrails[0];
  const commPercent = primaryGuardrail?.platformCommissionPercent ?? 9;
  const fixedFee = primaryGuardrail?.platformFixedFeeEGP ?? 30;
  const costPrice = plan.costPrice || product.estimatedWholesaleCost || Math.round(competitorLowestPrice * 0.78);

  // Effective Floor & Ceiling from Guardrails
  const platformMin = primaryGuardrail?.minAllowedPrice || plan.globalMinPrice;
  const platformMax = primaryGuardrail?.maxAllowedPrice || plan.globalMaxPrice;
  const isFloorLocked = primaryGuardrail ? primaryGuardrail.isFloorPriceLocked : true;

  const effectiveFloorPrice = Math.max(plan.globalMinPrice, platformMin);
  const effectiveCeilingPrice = Math.max(effectiveFloorPrice + 50, Math.min(plan.globalMaxPrice, platformMax));

  const previousSellingPrice =
    primaryGuardrail?.actualSellingPrice ||
    product.suggestedRetailPrice ||
    plan.suggestedOptimalPrice ||
    competitorLowestPrice;

  // Step 1: Calculate Raw Target Price according to selected Dynamic Pricing Strategy
  let rawCalculatedPrice = competitorLowestPrice;
  const undercutMode = plan.undercutMode || 'fixed_egp';
  const undercutVal = plan.undercutValue ?? 25;
  const targetMarginPct = plan.targetNetMarginPercent ?? 14;

  if (allCompetitorsOutOfStock && plan.autoRaiseOnStockoutOrSurge !== false) {
    // When competitors are out of stock, surge to Ceiling price to maximize profit
    rawCalculatedPrice = effectiveCeilingPrice;
  } else {
    switch (plan.repriceRuleType) {
      case 'undercut_lowest_competitor': {
        if (undercutMode === 'percentage') {
          rawCalculatedPrice = Math.round(competitorLowestPrice * (1 - undercutVal / 100));
        } else {
          rawCalculatedPrice = Math.round(competitorLowestPrice - undercutVal);
        }
        break;
      }
      case 'match_lowest_competitor': {
        rawCalculatedPrice = Math.round(competitorLowestPrice);
        break;
      }
      case 'target_margin_percentage': {
        // netProfit = price * (1 - comm/100) - fixedFee - cost = price * (targetMargin/100)
        // price * (1 - comm/100 - targetMargin/100) = cost + fixedFee
        const denominator = Math.max(0.15, 1 - commPercent / 100 - targetMarginPct / 100);
        const marginTargetPrice = Math.round((costPrice + fixedFee) / denominator);
        // If competitor is higher than our target margin price, we can price slightly below competitor to capture extra margin!
        const undercutComp = Math.round(competitorLowestPrice - (undercutMode === 'fixed_egp' ? undercutVal : competitorLowestPrice * (undercutVal / 100)));
        rawCalculatedPrice = Math.max(marginTargetPrice, undercutComp);
        break;
      }
      case 'match_market_median': {
        const avgPrice =
          offers.length > 0
            ? Math.round(offers.reduce((acc, o) => acc + o.price, 0) / offers.length)
            : Math.round((competitorLowestPrice + effectiveCeilingPrice) / 2);
        rawCalculatedPrice = avgPrice;
        break;
      }
      default:
        rawCalculatedPrice = Math.round(competitorLowestPrice - 25);
    }
  }

  // Step 2: Apply Pricing Guardrails (Floor & Ceiling Protection)
  let finalApprovedPrice = rawCalculatedPrice;
  let guardrailStatus: GuardrailEnforcementStatus = 'optimal_within_bounds';
  let statusHeadlineAr = 'ضمن النطاق الآمن — تفوق سعري واقتناص الـ Buy Box';
  let statusExplanationAr = `تم ضبط السعر تلقائياً عند ${rawCalculatedPrice.toLocaleString('ar-EG')} ج.م للتفوق على (${competitorMerchantName}) مع الحفاظ الكامل على قواعد حماية الأرباح.`;

  if (!plan.autoRepriceWithinBounds) {
    finalApprovedPrice = previousSellingPrice;
    guardrailStatus = 'manual_hold';
    statusHeadlineAr = 'التسعير التلقائي متوقف مؤقتاً (وضع التحكم اليدوي)';
    statusExplanationAr = `السعر المقترح ديناميكياً هو ${Math.max(effectiveFloorPrice, Math.min(effectiveCeilingPrice, rawCalculatedPrice)).toLocaleString('ar-EG')} ج.م، فعّل مفتاح التسعير التلقائي لتطبيقه فور تغير أسعار المنافسين.`;
  } else if (rawCalculatedPrice < effectiveFloorPrice && isFloorLocked) {
    finalApprovedPrice = effectiveFloorPrice;
    guardrailStatus = 'floor_protected';
    statusHeadlineAr = 'تدخل صمام الأمان (Floor Guardrail) — منع البيع بخسارة';
    statusExplanationAr = `انخفض سعر المنافس (${competitorMerchantName}) إلى ${competitorLowestPrice.toLocaleString('ar-EG')} ج.م، مما كان سيخفض السعر إلى ${rawCalculatedPrice.toLocaleString('ar-EG')} ج.م. تدخل قفل الحد الأدنى وثبّت سعرك عند ${effectiveFloorPrice.toLocaleString('ar-EG')} ج.م لحماية هامش ربحك.`;
  } else if (rawCalculatedPrice >= effectiveCeilingPrice) {
    finalApprovedPrice = effectiveCeilingPrice;
    guardrailStatus = 'ceiling_capped';
    statusHeadlineAr = 'تثبيت عند السقف الأعلى (Ceiling Cap) — تعظيم هامش الربح';
    statusExplanationAr = allCompetitorsOutOfStock
      ? `نظراً لنفاد مخزون المنافسين، تم رفع السعر تلقائياً إلى السقف الأعلى المعتمد (${effectiveCeilingPrice.toLocaleString('ar-EG')} ج.م) لتعظيم العائد.`
      : `ارتفعت أسعار المنافسين فوق سقف خطتك، وتم تثبيت السعر عند الحد الأقصى (${effectiveCeilingPrice.toLocaleString('ar-EG')} ج.م) لضمان جاذبية العرض وأعلى ربحية.`;
  }

  const estimatedCommissionEGP = Math.round(finalApprovedPrice * (commPercent / 100));
  const netProfitEGP = Math.round(finalApprovedPrice - estimatedCommissionEGP - fixedFee - costPrice);
  const netMarginPercent =
    finalApprovedPrice > 0 ? Math.round((netProfitEGP / finalApprovedPrice) * 1000) / 10 : 0;

  // Buy Box Win Probability calculation
  let buyBoxProbabilityPercent = 88;
  if (allCompetitorsOutOfStock) {
    buyBoxProbabilityPercent = 99;
  } else if (finalApprovedPrice < competitorLowestPrice) {
    buyBoxProbabilityPercent = 96;
  } else if (finalApprovedPrice === competitorLowestPrice) {
    buyBoxProbabilityPercent = 84;
  } else {
    const gapPct = ((finalApprovedPrice - competitorLowestPrice) / Math.max(1, competitorLowestPrice)) * 100;
    buyBoxProbabilityPercent = Math.max(35, Math.round(78 - gapPct * 4));
  }

  return {
    productId: product.id,
    productTitle: product.title,
    competitorLowestPrice,
    competitorMerchantName,
    competitorPlatformName,
    previousSellingPrice,
    rawCalculatedPrice,
    finalApprovedPrice,
    effectiveFloorPrice,
    effectiveCeilingPrice,
    costPrice,
    estimatedCommissionEGP,
    estimatedFixedFeeEGP: fixedFee,
    netProfitEGP,
    netMarginPercent,
    guardrailStatus,
    statusHeadlineAr,
    statusExplanationAr,
    priceDeltaFromPrevious: finalApprovedPrice - previousSellingPrice,
    priceDeltaFromCompetitor: finalApprovedPrice - competitorLowestPrice,
    buyBoxProbabilityPercent,
  };
}

/**
 * Apply Smart Dynamic Price evaluation across all platform guardrails in a ProductPricingPlan
 */
export function applySmartDynamicPricingToPlan(
  plan: ProductPricingPlan,
  evaluation: SmartDynamicPriceEvaluation,
  actorLabel: string = 'محرك التسعير الديناميكي الذكي ⚡'
): ProductPricingPlan {
  const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const updatedGuardrails = plan.platformGuardrails.map((g, idx) => {
    // Platform-specific slight offset or exact base price while strictly respecting each platform's own Floor & Ceiling
    const platformOffsetFactor =
      idx === 0
        ? 1
        : g.platformCode === 'noon_eg'
        ? 1.01
        : g.platformCode === 'kenzz_eg'
        ? 0.99
        : g.platformCode === 'homzmart_eg'
        ? 1.02
        : 1;

    const candidatePrice = Math.round(evaluation.rawCalculatedPrice * platformOffsetFactor);
    const platFloor = g.isFloorPriceLocked ? Math.max(plan.globalMinPrice, g.minAllowedPrice) : g.minAllowedPrice;
    const platCeiling = Math.max(platFloor + 50, Math.min(plan.globalMaxPrice, g.maxAllowedPrice));

    let platFinalPrice = candidatePrice;
    let platStatus: GuardrailEnforcementStatus = 'optimal_within_bounds';

    if (candidatePrice < platFloor && g.isFloorPriceLocked) {
      platFinalPrice = platFloor;
      platStatus = 'floor_protected';
    } else if (candidatePrice >= platCeiling) {
      platFinalPrice = platCeiling;
      platStatus = 'ceiling_capped';
    }

    const commAmount = platFinalPrice * (g.platformCommissionPercent / 100);
    const netProfit = Math.round(platFinalPrice - commAmount - g.platformFixedFeeEGP - plan.costPrice);
    const netMargin = platFinalPrice > 0 ? Math.round((netProfit / platFinalPrice) * 1000) / 10 : 0;

    return {
      ...g,
      actualSellingPrice: platFinalPrice,
      netProfitEGP: netProfit,
      netMarginPercent: netMargin,
      lastAutoAdjustedAt: `الآن (${nowStr})`,
      lastGuardrailStatus: platStatus,
    };
  });

  const updatedPlan: ProductPricingPlan = {
    ...plan,
    suggestedOptimalPrice: evaluation.finalApprovedPrice,
    platformGuardrails: updatedGuardrails,
    lastModifiedAt: `الآن (${nowStr})`,
    modifiedBy: actorLabel,
  };

  saveStoredPricingPlan(updatedPlan);
  return updatedPlan;
}

/**
 * Load Smart Dynamic Pricing Event Logs from localStorage
 */
export function loadSmartDynamicPricingLogs(): SmartDynamicPricingEventLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DYNAMIC_PRICING_LOGS_STORAGE_KEY);
    if (!raw) return getInitialSampleDynamicLogs();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getInitialSampleDynamicLogs();
  } catch {
    return getInitialSampleDynamicLogs();
  }
}

/**
 * Record a new Smart Dynamic Pricing Event Log and notify subscribers
 */
export function recordSmartDynamicPricingLog(entry: SmartDynamicPricingEventLog): SmartDynamicPricingEventLog[] {
  const existing = loadSmartDynamicPricingLogs();
  const updated = [entry, ...existing].slice(0, 60);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DYNAMIC_PRICING_LOGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('merchant_smart_dynamic_pricing_log_added', { detail: entry }));
    } catch {
      // ignore
    }
  }
  return updated;
}

function getInitialSampleDynamicLogs(): SmartDynamicPricingEventLog[] {
  return [
    {
      id: 'sdp-log-init-1',
      timestamp: 'منذ دقيقتين',
      productId: 'B09FURNCHR1',
      productTitle: 'كرسي مكتب طبي هيدروليك مريح داعم للفقرات القطنية مع مسند رأس - شبك أسود',
      triggerReasonAr: 'هبوط سعر المنافس على أمازون مصر بمقدار 75 ج.م',
      competitorName: 'مؤسسة النور للأثاث المكتبي',
      competitorPlatform: 'أمازون مصر (Amazon Egypt)',
      previousCompetitorPrice: 3550,
      newCompetitorPrice: 3475,
      previousMerchantPrice: 3525,
      rawTargetPrice: 3450,
      newMerchantPrice: 3450,
      floorPriceGuardrail: 3100,
      ceilingPriceGuardrail: 4200,
      netProfitEGP: 420,
      netMarginPercent: 12.2,
      guardrailStatus: 'optimal_within_bounds',
      ruleAppliedLabel: 'أقل من أرخص منافس بـ 25 ج.م (اقتناص Buy Box)',
      platformsUpdatedCount: 4,
    },
    {
      id: 'sdp-log-init-2',
      timestamp: 'منذ 14 دقيقة',
      productId: 'B09FURNTBL2',
      productTitle: 'طاولة قهوة مودرن خشب زان روماني طبيعي مع رف تخزين سفلي مقاس 100×60 سم - بني جوزي',
      triggerReasonAr: 'حرب أسعار حادة من منافس غير رسمي (كسر الحد الأدنى)',
      competitorName: 'معرض الهدى للأثاث المودرن',
      competitorPlatform: 'نون مصر (Noon Egypt)',
      previousCompetitorPrice: 2890,
      newCompetitorPrice: 2390,
      previousMerchantPrice: 2850,
      rawTargetPrice: 2370,
      newMerchantPrice: 2550,
      floorPriceGuardrail: 2550,
      ceilingPriceGuardrail: 3500,
      netProfitEGP: 110,
      netMarginPercent: 4.3,
      guardrailStatus: 'floor_protected',
      ruleAppliedLabel: 'تدخل قفل الحد الأدنى (Floor Lock) لمنع الخسارة',
      platformsUpdatedCount: 2,
    },
  ];
}

