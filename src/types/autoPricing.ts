export type AutoPricingTriggerCondition = 
  | 'competitor_drops'          // انخفاض سعر أي منافس
  | 'competitor_undercuts'      // منافس يبيع بسعر أقل مني (خسارة الـ Buy Box)
  | 'competitor_out_of_stock'   // نفاد مخزون المنافس الرئيسي
  | 'lowest_competitor_increases' // ارتفاع سعر أرخص منافس
  | 'price_gap_greater_than'   // فارق السعر أكبر من قيمة محددة
  | 'margin_exceeds_target'    // هامش الربح أعلى من المستهدف
  | 'competitor_price_changed_by_percent'; // إذا تغير سعر المنافس بنسبة X%

export type AutoPricingActionType =
  | 'undercut_fixed'           // تخفيض السعر بمبلغ محدد تحت المنافس (مثلاً: -5 ج.م)
  | 'undercut_percent'         // تخفيض السعر بنسبة مئوية تحت المنافس (مثلاً: -2%)
  | 'match_competitor'         // مطابقة سعر المنافس تماماً
  | 'competitor_plus_fixed'    // سعر المنافس + Y مبلغ ثابت (ج.م)
  | 'competitor_plus_percent'  // سعر المنافس + Y نسبة مئوية (%)
  | 'set_competitor_plus_offset' // تعديل لسعر المنافس + قيمة محددة Y
  | 'raise_fixed'              // رفع السعر بمبلغ محدد
  | 'raise_percent'            // رفع السعر بنسبة مئوية
  | 'raise_to_ceiling'         // رفع السعر إلى السقف الأقصى المسموح
  | 'target_margin';           // ضبط السعر لتحقيق هامش ربح صافي محدد %

export interface AutoPricingGuardrails {
  minFloorPriceEGP: number;        // الحد الأدنى المطلق للسعر
  maxCeilingPriceEGP: number;      // الحد الأقصى المطلق للسعر
  minNetMarginPercent: number;     // الحد الأدنى لهامش الربح الصافي %
  maxDailyPriceChanges: number;    // أقصى عدد مرات تعديل في اليوم
  protectLowStock?: boolean;       // منع التخفيض في حالة المخزون المنخفض
  targetPlatforms: ('amazon_eg' | 'noon_eg' | 'jumia_eg' | 'all')[];
}

export interface AutoPricingRule {
  id: string;
  title: string;
  description: string;
  conditionType: AutoPricingTriggerCondition;
  conditionValue?: number;         // القيمة المحددة للشرط X (مثلاً تغير 5% أو فارق 20 ج.م)
  conditionPlatformFilter: 'all' | 'amazon_eg' | 'noon_eg' | 'jumia_eg';
  actionType: AutoPricingActionType;
  actionValue: number;             // قيمة الإجراء Y (مثلاً 10 جنيهات أوفست فوق المنافس، أو 5 جنيهات تخفيض)
  actionOffsetType?: 'fixed_egp' | 'percent'; // نوع قيمة الإجراء (مبلغ ثابت ج.م أو نسبة مئوية %)
  instantNotification?: boolean;   // إرسال إشعار فوري عند تنفيذ هذه القاعدة
  guardrails: AutoPricingGuardrails;
  isActive: boolean;
  priority: number;
  appliedProductsCount?: number;
  isPreset?: boolean;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoPricingProductItem {
  productId: string;
  title: string;
  category: string;
  sku: string;
  imageUrl: string;
  costPrice: number;
  currentPrice: number;
  lowestCompetitorPrice: number;
  lowestCompetitorName: string;
  lowestCompetitorPlatform: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | string;
  competitorInStock: boolean;
  assignedRuleId: string | null;   // null = لا توجد قاعدة أو استخدام الافتراضية
  autoPricingEnabled: boolean;
  customFloorPrice?: number;
  customCeilingPrice?: number;
  lastRepricedAt?: string;
  lastRepriceStatus?: 'optimal' | 'floor_hit' | 'ceiling_hit' | 'pending';
  todayRepriceCount: number;
}

export type AutoPricingGuardrailStatus = 
  | 'safe' 
  | 'floor_enforced' 
  | 'ceiling_enforced' 
  | 'margin_protected' 
  | 'prevented';

export interface AutoPricingExecutionLog {
  id: string;
  timestamp: string;
  productId: string;
  productTitle: string;
  sku: string;
  ruleId: string;
  ruleTitle: string;
  triggerEventAr: string;          // نص وصف الشرط (إذا حدث X)
  actionTakenAr: string;           // نص وصف الإجراء (قم بـ Y)
  previousPrice: number;
  newPrice: number;
  priceDifference: number;         // newPrice - previousPrice
  competitorPrice: number;
  competitorName: string;
  competitorPlatform: string;
  floorPrice: number;
  ceilingPrice: number;
  estimatedNetProfit: number;
  estimatedNetMarginPercent: number;
  guardrailStatus: AutoPricingGuardrailStatus;
  guardrailStatusLabelAr?: string;
  platformsAffected: string[];
  executionMode: 'automated' | 'manual_simulation' | 'one_click_apply';
}

export interface RuleEvaluationResult {
  ruleId?: string;
  ruleTitle?: string;
  recommendedPrice?: number;
  finalPrice?: number;
  newPrice?: number;
  previousPrice?: number;
  priceDelta: number;
  appliedGuardrail?: AutoPricingGuardrailStatus;
  statusLabelAr?: string;
  reason?: string;
  isTriggered: boolean;
  triggerReasonAr?: string;
  actionTakenAr?: string;
  floorPrice?: number;
  ceilingPrice?: number;
  netProfitEGP?: number;
  netMarginPercent?: number;
  guardrailStatus?: string;
  guardrailStatusLabelAr?: string;
}


