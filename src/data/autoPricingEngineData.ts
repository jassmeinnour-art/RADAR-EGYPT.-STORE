import {
  AutoPricingRule,
  AutoPricingProductItem,
  AutoPricingExecutionLog,
  AutoPricingGuardrailStatus,
} from '../types/autoPricing';

export const AUTO_PRICING_RULES_STORAGE_KEY = 'merchant_radar_auto_pricing_rules_v1';
export const AUTO_PRICING_PRODUCTS_STORAGE_KEY = 'merchant_radar_auto_pricing_products_v1';
export const AUTO_PRICING_LOGS_STORAGE_KEY = 'merchant_radar_auto_pricing_logs_v1';
export const AUTO_PRICING_MASTER_ACTIVE_KEY = 'merchant_radar_auto_pricing_master_active_v1';

// القواعد الافتراضية الذكية المعدة مسبقاً
export const DEFAULT_AUTO_PRICING_RULES: AutoPricingRule[] = [
  {
    id: 'rule-buybox-sniper',
    title: 'صائد الـ Buy Box السريع (-5 ج.م)',
    description: 'إذا باع المنافس بسعر أقل مني، قم بتخفيض سعري بمقدار 5 جنيهات تحت أرخص سعر له للفوز بالطلب فوراً مع حماية الحد الأدنى.',
    conditionType: 'competitor_undercuts',
    conditionPlatformFilter: 'all',
    actionType: 'undercut_fixed',
    actionValue: 5,
    guardrails: {
      minFloorPriceEGP: 2200,
      maxCeilingPriceEGP: 4500,
      minNetMarginPercent: 10,
      maxDailyPriceChanges: 8,
      protectLowStock: true,
      targetPlatforms: ['all']
    },
    isActive: true,
    priority: 1,
    isPreset: true,
    icon: 'Zap',
    createdAt: '2026-08-20 09:00',
    updatedAt: '2026-08-25 14:30'
  },
  {
    id: 'rule-stockout-maximizer',
    title: 'اقتناص نفاد مخزون المنافس (+45 ج.م)',
    description: 'إذا نفد مخزون المنافس الرئيسي، قم برفع سعري بمقدار 45 ج.م للاستفادة من قلة المعروض في السوق وتعظيم هامش الربح الصافي.',
    conditionType: 'competitor_out_of_stock',
    conditionPlatformFilter: 'all',
    actionType: 'raise_fixed',
    actionValue: 45,
    guardrails: {
      minFloorPriceEGP: 2000,
      maxCeilingPriceEGP: 5000,
      minNetMarginPercent: 15,
      maxDailyPriceChanges: 4,
      protectLowStock: false,
      targetPlatforms: ['all']
    },
    isActive: true,
    priority: 2,
    isPreset: true,
    icon: 'TrendingUp',
    createdAt: '2026-08-21 11:15',
    updatedAt: '2026-08-25 10:00'
  },
  {
    id: 'rule-safe-matcher',
    title: 'صمام مطابقة السعر الآمنة (Margin > 12%)',
    description: 'إذا انخفض سعر المنافس، طابق سعره تماماً بشرط ألا يقل هامش الربح الصافي للتاجر عن 12%.',
    conditionType: 'competitor_drops',
    conditionPlatformFilter: 'all',
    actionType: 'match_competitor',
    actionValue: 0,
    guardrails: {
      minFloorPriceEGP: 1800,
      maxCeilingPriceEGP: 4200,
      minNetMarginPercent: 12,
      maxDailyPriceChanges: 6,
      protectLowStock: true,
      targetPlatforms: ['all']
    },
    isActive: true,
    priority: 3,
    isPreset: true,
    icon: 'ShieldCheck',
    createdAt: '2026-08-22 13:40',
    updatedAt: '2026-08-25 16:00'
  },
  {
    id: 'rule-dynamic-percent-undercut',
    title: 'التخفيض النسبي الديناميكي (-2%)',
    description: 'إذا انخفض سعر المنافس أو أصبح أرخص، خفض سعري بنسبة 2% تحته لكسب صدارة نتائج البحث وجذب الزبائن.',
    conditionType: 'competitor_drops',
    conditionPlatformFilter: 'all',
    actionType: 'undercut_percent',
    actionValue: 2,
    guardrails: {
      minFloorPriceEGP: 2500,
      maxCeilingPriceEGP: 4800,
      minNetMarginPercent: 11,
      maxDailyPriceChanges: 6,
      protectLowStock: true,
      targetPlatforms: ['amazon_eg', 'noon_eg']
    },
    isActive: false,
    priority: 4,
    isPreset: true,
    icon: 'Percent',
    createdAt: '2026-08-23 08:30',
    updatedAt: '2026-08-24 19:10'
  },
  {
    id: 'rule-target-margin-defender',
    title: 'حامي الهامش الصافي الثابت (15%)',
    description: 'إذا تحركت أسعار السوق، اضبط سعري تلقائياً ليحقق دائماً هامش ربح صافي لا يقل عن 15% بعد احتساب عمولات المنصات والشحن.',
    conditionType: 'lowest_competitor_increases',
    conditionPlatformFilter: 'all',
    actionType: 'target_margin',
    actionValue: 15,
    guardrails: {
      minFloorPriceEGP: 2100,
      maxCeilingPriceEGP: 4600,
      minNetMarginPercent: 15,
      maxDailyPriceChanges: 5,
      protectLowStock: false,
      targetPlatforms: ['all']
    },
    isActive: true,
    priority: 5,
    isPreset: true,
    icon: 'SlidersHorizontal',
    createdAt: '2026-08-24 15:20',
    updatedAt: '2026-08-25 11:00'
  }
];

// قائمة المنتجات المؤهلة لتطبيق القواعد
export const INITIAL_AUTO_PRICING_PRODUCTS: AutoPricingProductItem[] = [
  {
    productId: 'PRD-AUTO-001',
    title: 'كرسي مكتب طبي هيدروليك مريح داعم للفقرات مع مسند رأس - شبك أسود',
    category: 'أثاث وتجهيزات مكتبية',
    sku: 'FURN-CHR-001',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=500&auto=format&fit=crop&q=80',
    costPrice: 2650,
    currentPrice: 3450,
    lowestCompetitorPrice: 3420,
    lowestCompetitorName: 'الفراعنة للتوريدات (نون مصر)',
    lowestCompetitorPlatform: 'noon_eg',
    competitorInStock: true,
    assignedRuleId: 'rule-buybox-sniper',
    autoPricingEnabled: true,
    customFloorPrice: 2950,
    customCeilingPrice: 4200,
    lastRepricedAt: '2026-10-23 10:15',
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 2
  },
  {
    productId: 'PRD-AUTO-002',
    title: 'سماعة أنكر ساوند كور لايف كيو 30 اللاسلكية بنظام إلغاء الضوضاء النشط',
    category: 'إلكترونيات وصوتيات',
    sku: 'ANK-Q30-BLK',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    costPrice: 2200,
    currentPrice: 2890,
    lowestCompetitorPrice: 2880,
    lowestCompetitorName: 'بي تك مصر (B.TECH Store)',
    lowestCompetitorPlatform: 'btech_eg',
    competitorInStock: true,
    assignedRuleId: 'rule-buybox-sniper',
    autoPricingEnabled: true,
    customFloorPrice: 2450,
    customCeilingPrice: 3600,
    lastRepricedAt: '2026-10-23 09:40',
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 1
  },
  {
    productId: 'PRD-AUTO-003',
    title: 'مكتب عمل ومذاكرة هيدروليك معدني مقاوم للخدش 120×60 سم - ستيل أسود مطفي',
    category: 'أثاث وتجهيزات مكتبية',
    sku: 'DSK-HYD-120',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80',
    costPrice: 1450,
    currentPrice: 2650,
    lowestCompetitorPrice: 2790,
    lowestCompetitorName: 'متجر النصر للأثاث (أمازون مصر)',
    lowestCompetitorPlatform: 'amazon_eg',
    competitorInStock: false, // نفد المخزون! فرصة لرفع السعر
    assignedRuleId: 'rule-stockout-maximizer',
    autoPricingEnabled: true,
    customFloorPrice: 1850,
    customCeilingPrice: 3300,
    lastRepricedAt: '2026-10-23 08:20',
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 1
  },
  {
    productId: 'PRD-AUTO-004',
    title: 'طاولة قهوة مودرن خشب زان روماني طبيعي مع رف تخزين سفلي 100×60 سم',
    category: 'أثاث منزلي وديكور',
    sku: 'FURN-TBL-002',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&auto=format&fit=crop&q=80',
    costPrice: 2150,
    currentPrice: 2850,
    lowestCompetitorPrice: 2899,
    lowestCompetitorName: 'هومزمارت مصر (Homzmart Direct)',
    lowestCompetitorPlatform: 'homzmart_eg',
    competitorInStock: true,
    assignedRuleId: 'rule-safe-matcher',
    autoPricingEnabled: true,
    customFloorPrice: 2450,
    customCeilingPrice: 3500,
    lastRepricedAt: '2026-10-22 17:05',
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 0
  },
  {
    productId: 'PRD-AUTO-005',
    title: 'قلاية هوائية فيليبس بدون زيت سعة 4.1 لتر رقمية تقنية الهواء السريع',
    category: 'أجهزة منزلية ومطبخ',
    sku: 'PHL-AIR-41L',
    imageUrl: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500&auto=format&fit=crop&q=80',
    costPrice: 3800,
    currentPrice: 4690,
    lowestCompetitorPrice: 4499,
    lowestCompetitorName: 'العربي جروب (ElAraby Mall)',
    lowestCompetitorPlatform: 'elaraby_group',
    competitorInStock: true,
    assignedRuleId: 'rule-buybox-sniper',
    autoPricingEnabled: false, // متوقف مؤقتاً بواسطة التاجر
    customFloorPrice: 4200,
    customCeilingPrice: 5500,
    lastRepricedAt: '2026-10-21 14:10',
    lastRepriceStatus: 'pending',
    todayRepriceCount: 0
  },
  {
    productId: 'PRD-AUTO-006',
    title: 'مكواة بخار عمودية تيفال إنستانت كومباكت 1800 واط مع حامل ملابس مدمج',
    category: 'أجهزة منزلية ومطبخ',
    sku: 'TEF-STM-180',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80',
    costPrice: 1950,
    currentPrice: 2550,
    lowestCompetitorPrice: 2520,
    lowestCompetitorName: 'رنين مصر (Raneen EG)',
    lowestCompetitorPlatform: 'raneen_eg',
    competitorInStock: true,
    assignedRuleId: 'rule-target-margin-defender',
    autoPricingEnabled: true,
    customFloorPrice: 2250,
    customCeilingPrice: 3200,
    lastRepricedAt: '2026-10-23 11:00',
    lastRepriceStatus: 'optimal',
    todayRepriceCount: 1
  }
];

// سجل تاريخ التغيرات السعرية المنفذة
export const INITIAL_EXECUTION_HISTORY_LOGS: AutoPricingExecutionLog[] = [
  {
    id: 'log-exec-001',
    timestamp: '2026-10-23 11:00:24',
    productId: 'PRD-AUTO-001',
    productTitle: 'كرسي مكتب طبي هيدروليك مريح داعم للفقرات القطنية - شبك أسود',
    sku: 'FURN-CHR-001',
    ruleId: 'rule-buybox-sniper',
    ruleTitle: 'صائد الـ Buy Box السريع (-5 ج.م)',
    triggerEventAr: 'انخفاض سعر المنافس (الفراعنة للتوريدات - نون) من 3,490 إلى 3,420 ج.م',
    actionTakenAr: 'تخفيض السعر بمقدار 5 ج.م تحت أرخص منافس (سعر جديد: 3,415 ج.م)',
    previousPrice: 3450,
    newPrice: 3415,
    priceDifference: -35,
    competitorPrice: 3420,
    competitorName: 'الفراعنة للتوريدات',
    competitorPlatform: 'نون مصر (Noon Egypt)',
    floorPrice: 2950,
    ceilingPrice: 4200,
    estimatedNetProfit: 418,
    estimatedNetMarginPercent: 12.2,
    guardrailStatus: 'safe',
    guardrailStatusLabelAr: '✅ تنفيذ آمن (أعلى من الحد الأدنى بـ 465 ج.م)',
    platformsAffected: ['نون مصر', 'أمازون مصر', 'جوميا'],
    executionMode: 'automated'
  },
  {
    id: 'log-exec-002',
    timestamp: '2026-10-23 09:40:12',
    productId: 'PRD-AUTO-002',
    productTitle: 'سماعة أنكر ساوند كور لايف كيو 30 اللاسلكية بنظام العزل',
    sku: 'ANK-Q30-BLK',
    ruleId: 'rule-buybox-sniper',
    ruleTitle: 'صائد الـ Buy Box السريع (-5 ج.م)',
    triggerEventAr: 'انخفاض سعر متجر B.TECH من 2,950 إلى 2,880 ج.م',
    actionTakenAr: 'تخفيض السعر بمقدار 5 ج.م ليصبح 2,875 ج.م لاستعادة صندوق الشراء',
    previousPrice: 2890,
    newPrice: 2875,
    priceDifference: -15,
    competitorPrice: 2880,
    competitorName: 'بي تك مصر (B.TECH)',
    competitorPlatform: 'B.TECH Egypt',
    floorPrice: 2450,
    ceilingPrice: 3600,
    estimatedNetProfit: 365,
    estimatedNetMarginPercent: 12.7,
    guardrailStatus: 'safe',
    guardrailStatusLabelAr: '✅ تنفيذ آمن ضمن نطاق الربحية المستهدف',
    platformsAffected: ['أمازون مصر', 'نون مصر'],
    executionMode: 'automated'
  },
  {
    id: 'log-exec-003',
    timestamp: '2026-10-23 08:20:45',
    productId: 'PRD-AUTO-003',
    productTitle: 'مكتب عمل ومذاكرة هيدروليك معدني 120×60 سم - أسود مطفي',
    sku: 'DSK-HYD-120',
    ruleId: 'rule-stockout-maximizer',
    ruleTitle: 'اقتناص نفاد مخزون المنافس (+45 ج.م)',
    triggerEventAr: 'نفاد مخزون المنافس الرئيسي (متجر النصر للأثاث - أمازون مصر)',
    actionTakenAr: 'رفع السعر بمقدار 45 ج.م من 2,650 إلى 2,695 ج.م لتعظيم الربحية',
    previousPrice: 2650,
    newPrice: 2695,
    priceDifference: +45,
    competitorPrice: 2790,
    competitorName: 'متجر النصر للأثاث',
    competitorPlatform: 'أمازون مصر (Amazon Egypt)',
    floorPrice: 1850,
    ceilingPrice: 3300,
    estimatedNetProfit: 955,
    estimatedNetMarginPercent: 35.4,
    guardrailStatus: 'safe',
    guardrailStatusLabelAr: '🚀 رفع استراتيجي ناجح مع خلو المنافسة',
    platformsAffected: ['أمازون مصر', 'نون مصر', 'هومزمارت'],
    executionMode: 'automated'
  },
  {
    id: 'log-exec-004',
    timestamp: '2026-10-22 17:15:30',
    productId: 'PRD-AUTO-006',
    productTitle: 'مكواة بخار عمودية تيفال إنستانت كومباكت 1800 واط',
    sku: 'TEF-STM-180',
    ruleId: 'rule-target-margin-defender',
    ruleTitle: 'حامي الهامش الصافي الثابت (15%)',
    triggerEventAr: 'ارتفاع سعر أرخص منافس (رنين) من 2,480 إلى 2,520 ج.م',
    actionTakenAr: 'تعديل السعر إلى 2,550 ج.م لتثبيت هامش ربح صافي 15.2%',
    previousPrice: 2490,
    newPrice: 2550,
    priceDifference: +60,
    competitorPrice: 2520,
    competitorName: 'رنين مصر',
    competitorPlatform: 'رنين (Raneen EG)',
    floorPrice: 2250,
    ceilingPrice: 3200,
    estimatedNetProfit: 388,
    estimatedNetMarginPercent: 15.2,
    guardrailStatus: 'safe',
    guardrailStatusLabelAr: '✅ مواكبة ارتفاع السوق وتثبيت الهامش المستهدف',
    platformsAffected: ['جوميا مصر', 'نون مصر'],
    executionMode: 'automated'
  },
  {
    id: 'log-exec-005',
    timestamp: '2026-10-22 14:02:10',
    productId: 'PRD-AUTO-004',
    productTitle: 'طاولة قهوة مودرن خشب زان روماني طبيعي 100×60 سم',
    sku: 'FURN-TBL-002',
    ruleId: 'rule-safe-matcher',
    ruleTitle: 'صمام مطابقة السعر الآمنة (Margin > 12%)',
    triggerEventAr: 'انخفاض سعر منافس (هومزمارت) إلى 2,400 ج.م (تحت حد الأمان للتاجر)',
    actionTakenAr: 'تم تفعيل صمام الأمان وتثبيت السعر عند الحد الأدنى (Floor: 2,450 ج.م) ومنع الخسارة',
    previousPrice: 2850,
    newPrice: 2450,
    priceDifference: -400,
    competitorPrice: 2400,
    competitorName: 'هومزمارت مصر (Homzmart)',
    competitorPlatform: 'هومزمارت (Homzmart)',
    floorPrice: 2450,
    ceilingPrice: 3500,
    estimatedNetProfit: 150,
    estimatedNetMarginPercent: 6.1,
    guardrailStatus: 'floor_enforced',
    guardrailStatusLabelAr: '🛡️ صمام الأمان: تم التثبيت عند الحد الأدنى الصارم ومنع البيع بخسارة',
    platformsAffected: ['هومزمارت مصر'],
    executionMode: 'automated'
  }
];

// دالات التحميل والحفظ من التخزين المحلي
export function loadAutoPricingRules(): AutoPricingRule[] {
  try {
    const raw = localStorage.getItem(AUTO_PRICING_RULES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not parse auto pricing rules from localStorage:', e);
  }
  return DEFAULT_AUTO_PRICING_RULES;
}

export function saveAutoPricingRules(rules: AutoPricingRule[]): void {
  try {
    localStorage.setItem(AUTO_PRICING_RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Error saving auto pricing rules:', e);
  }
}

export function loadAutoPricingProducts(): AutoPricingProductItem[] {
  try {
    const raw = localStorage.getItem(AUTO_PRICING_PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not parse auto pricing products from localStorage:', e);
  }
  return INITIAL_AUTO_PRICING_PRODUCTS;
}

export function saveAutoPricingProducts(products: AutoPricingProductItem[]): void {
  try {
    localStorage.setItem(AUTO_PRICING_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving auto pricing products:', e);
  }
}

export function loadAutoPricingLogs(): AutoPricingExecutionLog[] {
  try {
    const raw = localStorage.getItem(AUTO_PRICING_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not parse auto pricing logs from localStorage:', e);
  }
  return INITIAL_EXECUTION_HISTORY_LOGS;
}

export function saveAutoPricingLogs(logs: AutoPricingExecutionLog[]): void {
  try {
    localStorage.setItem(AUTO_PRICING_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Error saving auto pricing logs:', e);
  }
}

export function getAutoPricingMasterActive(): boolean {
  try {
    const val = localStorage.getItem(AUTO_PRICING_MASTER_ACTIVE_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setAutoPricingMasterActive(active: boolean): void {
  try {
    localStorage.setItem(AUTO_PRICING_MASTER_ACTIVE_KEY, String(active));
  } catch (e) {
    console.error('Error saving master auto pricing active state:', e);
  }
}

// محرك تقييم القواعد ("إذا حدث X قم بـ Y")
export interface RuleEvaluationResult {
  isTriggered: boolean;
  triggerReasonAr: string;
  actionTakenAr: string;
  proposedPrice: number;
  finalPrice: number;
  priceDelta: number;
  floorPrice: number;
  ceilingPrice: number;
  guardrailStatus: AutoPricingGuardrailStatus;
  guardrailStatusLabelAr: string;
  netProfitEGP: number;
  netMarginPercent: number;
}

export function evaluateAutoPricingRule(
  product: AutoPricingProductItem,
  rule: AutoPricingRule
): RuleEvaluationResult {
  const currentPrice = product.currentPrice;
  const competitorPrice = product.lowestCompetitorPrice;
  const costPrice = product.costPrice;
  const floorPrice = product.customFloorPrice ?? rule.guardrails.minFloorPriceEGP ?? Math.round(costPrice * 1.1);
  const ceilingPrice = product.customCeilingPrice ?? rule.guardrails.maxCeilingPriceEGP ?? Math.round(costPrice * 1.8);
  const minMarginPercent = rule.guardrails.minNetMarginPercent ?? 10;

  let isTriggered = false;
  let triggerReasonAr = '';
  let actionTakenAr = '';
  let rawProposedPrice = currentPrice;

  // فحص الشرط "إذا حدث X"
  switch (rule.conditionType) {
    case 'competitor_undercuts':
      if (competitorPrice < currentPrice) {
        isTriggered = true;
        triggerReasonAr = `المنافس (${product.lowestCompetitorName}) يبيع بسعر (${competitorPrice.toLocaleString()} ج.م) أقل من سعرك الحالي (${currentPrice.toLocaleString()} ج.م)`;
      }
      break;

    case 'competitor_drops':
      if (competitorPrice < currentPrice) {
        isTriggered = true;
        triggerReasonAr = `انخفاض سعر السوق لدى (${product.lowestCompetitorName}) إلى (${competitorPrice.toLocaleString()} ج.م)`;
      }
      break;

    case 'competitor_out_of_stock':
      if (!product.competitorInStock) {
        isTriggered = true;
        triggerReasonAr = `نفاد مخزون المنافس الرئيسي (${product.lowestCompetitorName})؛ فرصة ذهبية لاقتناص هوامش ربح أعلى`;
      }
      break;

    case 'lowest_competitor_increases':
      if (competitorPrice > currentPrice) {
        isTriggered = true;
        triggerReasonAr = `ارتفاع سعر أرخص منافس في السوق إلى (${competitorPrice.toLocaleString()} ج.م) أعلى من سعرك الحالي`;
      }
      break;

    case 'price_gap_greater_than':
      const gap = Math.abs(currentPrice - competitorPrice);
      const threshold = rule.conditionValue || 20;
      if (gap >= threshold) {
        isTriggered = true;
        triggerReasonAr = `فارق السعر بينك وبين المنافس (${gap.toLocaleString()} ج.م) تجاوز الحد المحدد (${threshold} ج.م)`;
      }
      break;

    case 'margin_exceeds_target':
      const currentEstMargin = ((currentPrice - costPrice) / currentPrice) * 100;
      const targetThreshold = rule.conditionValue || 25;
      if (currentEstMargin > targetThreshold) {
        isTriggered = true;
        triggerReasonAr = `هامش الربح الحالي (${currentEstMargin.toFixed(1)}%) يتجاوز الهدف المحدد (${targetThreshold}%)، مما يتيح مرونة للتخفيض الترويجي`;
      }
      break;

    default:
      if (competitorPrice < currentPrice) {
        isTriggered = true;
        triggerReasonAr = `تغير في حركة أسعار المنافسين على المنتج`;
      }
  }

  if (!isTriggered) {
    return {
      isTriggered: false,
      triggerReasonAr: 'الشرط لم يتحقق؛ السعر الحالي متوافق مع معايير المنافسة.',
      actionTakenAr: 'لا يوجد تعديل مطلوب',
      proposedPrice: currentPrice,
      finalPrice: currentPrice,
      priceDelta: 0,
      floorPrice,
      ceilingPrice,
      guardrailStatus: 'safe',
      guardrailStatusLabelAr: '✅ السعر الحالي مستقر وآمن',
      netProfitEGP: Math.round(currentPrice * 0.85 - costPrice),
      netMarginPercent: Number((((currentPrice * 0.85 - costPrice) / currentPrice) * 100).toFixed(1))
    };
  }

  // حساب الإجراء "قم بـ Y"
  switch (rule.actionType) {
    case 'undercut_fixed':
      rawProposedPrice = Math.round(competitorPrice - rule.actionValue);
      actionTakenAr = `تخفيض السعر بمقدار ${rule.actionValue} ج.م تحت سعر المنافس (${competitorPrice.toLocaleString()} ج.م)`;
      break;

    case 'undercut_percent':
      rawProposedPrice = Math.round(competitorPrice * (1 - (rule.actionValue / 100)));
      actionTakenAr = `تخفيض السعر بنسبة ${rule.actionValue}% تحت سعر المنافس`;
      break;

    case 'match_competitor':
      rawProposedPrice = competitorPrice;
      actionTakenAr = `مطابقة سعر أرخص منافس تماماً (${competitorPrice.toLocaleString()} ج.م)`;
      break;

    case 'raise_fixed':
      rawProposedPrice = Math.round(currentPrice + rule.actionValue);
      actionTakenAr = `رفع السعر بمقدار ${rule.actionValue} ج.م لمواكبة قلة المعروض`;
      break;

    case 'raise_percent':
      rawProposedPrice = Math.round(currentPrice * (1 + (rule.actionValue / 100)));
      actionTakenAr = `زيادة السعر بنسبة ${rule.actionValue}%`;
      break;

    case 'raise_to_ceiling':
      rawProposedPrice = ceilingPrice;
      actionTakenAr = `رفع السعر إلى الحد الأقصى المسموح (${ceilingPrice.toLocaleString()} ج.م)`;
      break;

    case 'target_margin':
      // السعر المطلوب لتحقيق الهامش الصافي المطلوب بافتراض عمولة 12% للمنصة
      const targetMarginRatio = (rule.actionValue || 15) / 100;
      rawProposedPrice = Math.round(costPrice / (1 - 0.12 - targetMarginRatio));
      actionTakenAr = `ضبط السعر لاستهداف هامش ربح صافي ${rule.actionValue}%`;
      break;

    default:
      rawProposedPrice = Math.round(competitorPrice - 5);
      actionTakenAr = `تخفيض السعر بمقدار 5 جنيهات للمنافسة على الـ Buy Box`;
  }

  // تطبيق صمامات الأمان (Guardrails)
  let finalPrice = rawProposedPrice;
  let guardrailStatus: AutoPricingGuardrailStatus = 'safe';
  let guardrailStatusLabelAr = '✅ قرار آمن ومطابق لصمامات الأمان';

  if (finalPrice < floorPrice) {
    finalPrice = floorPrice;
    guardrailStatus = 'floor_enforced';
    guardrailStatusLabelAr = `🛡️ صمام الأمان: تم التثبيت عند الحد الأدنى (${floorPrice.toLocaleString()} ج.م) لمنع البيع بهامش خاسر`;
  } else if (finalPrice > ceilingPrice) {
    finalPrice = ceilingPrice;
    guardrailStatus = 'ceiling_enforced';
    guardrailStatusLabelAr = `⚖️ تم تقييد السعر بالحد الأقصى المسموح (${ceilingPrice.toLocaleString()} ج.م) للحفاظ على التنافسية`;
  }

  // تقدير صافي الربح والنسبة بهامش تقريبي
  // افتراض عمولة منصة وشحن متوسط 13%
  const estPlatformFees = finalPrice * 0.13;
  const netProfitEGP = Math.round(finalPrice - costPrice - estPlatformFees);
  const netMarginPercent = Number(((netProfitEGP / finalPrice) * 100).toFixed(1));

  if (netMarginPercent < minMarginPercent && guardrailStatus === 'safe') {
    guardrailStatus = 'margin_protected';
    guardrailStatusLabelAr = `⚠️ تنبيه هامش: الهامش الصافي (${netMarginPercent}%) أقل من الهدف (${minMarginPercent}%) ولكن أعلى من التكلفة`;
  }

  return {
    isTriggered: true,
    triggerReasonAr,
    actionTakenAr,
    proposedPrice: rawProposedPrice,
    finalPrice,
    priceDelta: finalPrice - currentPrice,
    floorPrice,
    ceilingPrice,
    guardrailStatus,
    guardrailStatusLabelAr,
    netProfitEGP,
    netMarginPercent
  };
}
