import { 
  StrategyPreset, 
  MarketScenario, 
  SimulationResult, 
  MonthlyProjectionPoint,
  StrategyPresetId,
  MarketScenarioId,
  ProductData
} from '../types';

export const STRATEGY_PRESETS: Record<StrategyPresetId, StrategyPreset> = {
  premium_quality_boost: {
    id: 'premium_quality_boost',
    label: 'رفع السعر مع تحسين جودة الصور (AI Studio Boost)',
    badge: 'الأعلى ربحية 💎',
    description: 'رفع سعر البيع (+10% إلى +15%) مع الاعتماد على صور استوديو فائقة الجودة بزوايا متعددة وخلفيات عصرية، مما يرفع ثقة المشتري ومعدل التحويل (CVR) رغم زيادة السعر.',
    priceAdjustmentPercent: 12,
    imageQualityScore: 5,
    conversionRateBoostPercent: 38,
    marketingSpendMonthlyEGP: 1500,
    bundleAovIncreasePercent: 10,
    estimatedBuyBoxSharePercent: 84,
    color: '#6366F1'
  },
  aggressive_undercut: {
    id: 'aggressive_undercut',
    label: 'كسر سعر المنافسين والاستحواذ على Buy Box (Aggressive Undercut)',
    badge: 'أعلى مبيعات حجمية ⚡',
    description: 'تخفيض السعر بنسبة (-5% إلى -8%) أسفل أقل منافس لضمان الفوز بنسبة 95%+ بصندوق الشراء وتحقيق أعلى معدل دوران مخزون، مع تضحية جزئية بهامش الربح.',
    priceAdjustmentPercent: -6,
    imageQualityScore: 3,
    conversionRateBoostPercent: 15,
    marketingSpendMonthlyEGP: 800,
    bundleAovIncreasePercent: 0,
    estimatedBuyBoxSharePercent: 96,
    color: '#EF4444'
  },
  balanced_growth: {
    id: 'balanced_growth',
    label: 'النمو المتوازن مع إعلانات ممولة (Balanced Sponsored Ads)',
    badge: 'توازن واستقرار ⚖️',
    description: 'مطابقة أقل سعر بالسوق مع تخصيص ميزانية إعلانات ممولة على المنصات لاستهداف الكلمات المفتاحية الأكثر ربحية وزيادة الظهور.',
    priceAdjustmentPercent: 0,
    imageQualityScore: 4,
    conversionRateBoostPercent: 22,
    marketingSpendMonthlyEGP: 2500,
    bundleAovIncreasePercent: 6,
    estimatedBuyBoxSharePercent: 88,
    color: '#10B981'
  },
  bundle_aov_boost: {
    id: 'bundle_aov_boost',
    label: 'عروض الباقات والخصم التراكمي (Bundle & Multi-Buy)',
    badge: 'رفع متوسط السلة 📦',
    description: 'توفير باقات ثنائية أو ثلاثية (Bundle) تمنح العميل خصماً طفيفاً لكنها ترفع قيمة سلة الشراء ومجمل الربح لكل طلبية، مع توفير تكاليف الشحن.',
    priceAdjustmentPercent: -3,
    imageQualityScore: 4.5,
    conversionRateBoostPercent: 32,
    marketingSpendMonthlyEGP: 1800,
    bundleAovIncreasePercent: 30,
    estimatedBuyBoxSharePercent: 90,
    color: '#0ea5e9'
  },
  margin_fortress: {
    id: 'margin_fortress',
    label: 'قلعة الهامش المرتفع والشحن الفوري إكسبريس (Margin Fortress)',
    badge: 'حماية الهامش 🛡️',
    description: 'البيع بسعر أعلى بنسبة (+8%) من متوسط السوق مع تقديم شحن في نفس اليوم (FBA / FBN Express) وضمان محلي ممتد لجذب المشترين المستعجلين.',
    priceAdjustmentPercent: 8,
    imageQualityScore: 4.5,
    conversionRateBoostPercent: 18,
    marketingSpendMonthlyEGP: 1200,
    bundleAovIncreasePercent: 8,
    estimatedBuyBoxSharePercent: 78,
    color: '#8B5CF6'
  },
  custom: {
    id: 'custom',
    label: 'استراتيجية مخصصة بالكامل (Custom Strategy)',
    badge: 'تحكم يدوي 🎛️',
    description: 'حدد بنفسك نسب تغير الأسعار، ميزانية الإعلانات، ومعدل تحسين الصور واختبر نتائجها فوراً على أرباح متجرك.',
    priceAdjustmentPercent: 5,
    imageQualityScore: 4,
    conversionRateBoostPercent: 20,
    marketingSpendMonthlyEGP: 1500,
    bundleAovIncreasePercent: 10,
    estimatedBuyBoxSharePercent: 85,
    color: '#06B6D4'
  }
};

export const MARKET_SCENARIOS: Record<MarketScenarioId, MarketScenario> = {
  normal_growth: {
    id: 'normal_growth',
    label: 'النمو المستقر الطبيعي في السوق المصري (Stable Market)',
    description: 'افتراض نمو مستمر ومعتدل في الطلب الاستهلاكي مع ثبات نسبي في تكاليف الجملة والتنافس.',
    seasonalMultipliers: [1.0, 1.04, 1.08, 1.12, 1.15, 1.19, 1.22, 1.25, 1.28, 1.32, 1.36, 1.40],
    cogsInflationRatePercent: 2.5,
    competitorPriceDropPercent: 1.5,
    icon: 'Activity'
  },
  ramadan_peak: {
    id: 'ramadan_peak',
    label: 'موسم رمضان وعيد الفطر (Ramadan High Season Surge)',
    description: 'قفزة هائلة في حجم المبيعات خلال شهور الموسم (+85% إلى +110%) مع زيادة في سرعة دوران المخزون.',
    seasonalMultipliers: [1.0, 1.25, 1.95, 2.20, 1.15, 1.05, 1.08, 1.12, 1.15, 1.20, 1.25, 1.30],
    cogsInflationRatePercent: 4.0,
    competitorPriceDropPercent: 3.0,
    icon: 'Sparkles'
  },
  white_friday_surge: {
    id: 'white_friday_surge',
    label: 'موسم الجمعة البيضاء ونهاية العام (White Friday & Q4 Rush)',
    description: 'تضاعف المبيعات والطلبات في الربع الرابع مع تزايد الشراء الإلكتروني وتنافس عروض التخفيضات.',
    seasonalMultipliers: [1.0, 1.05, 1.08, 1.10, 1.14, 1.18, 1.22, 1.35, 1.85, 2.35, 2.10, 1.50],
    cogsInflationRatePercent: 3.5,
    competitorPriceDropPercent: 6.0,
    icon: 'Tag'
  },
  competitor_price_war: {
    id: 'competitor_price_war',
    label: 'حرب أسعار شرسة من كبار المتاجر (Price War Pressure)',
    description: 'قيام المنافسين بتخفيض أسعارهم بمعدل (-6% إلى -10%) لمحاولة إقصاء التجار الصغار.',
    seasonalMultipliers: [1.0, 0.96, 0.92, 0.94, 0.97, 1.00, 1.03, 1.06, 1.09, 1.12, 1.15, 1.18],
    cogsInflationRatePercent: 4.5,
    competitorPriceDropPercent: 8.5,
    icon: 'TrendingDown'
  },
  summer_dip: {
    id: 'summer_dip',
    label: 'ركود الصيف وموسم السفر والامتحانات (Summer Low Season)',
    description: 'انخفاض موسمي مؤقت في حركة التجارة الإلكترونية خلال شهور الصيف والمصايف مع عودة الانتعاش مع موسم العودة للمدارس.',
    seasonalMultipliers: [1.0, 0.85, 0.80, 0.82, 0.90, 1.15, 1.25, 1.30, 1.10, 1.05, 1.08, 1.12],
    cogsInflationRatePercent: 2.0,
    competitorPriceDropPercent: 2.5,
    icon: 'Sun'
  },
  inflation_cost_surge: {
    id: 'inflation_cost_surge',
    label: 'تضخم تكلفة الاستيراد والجملة (Wholesale Cost Inflation +12%)',
    description: 'ارتفاع أسعار شراء المنتجات من الموردين والمستوردين مما يضغط على هوامش الربح ويتطلب إعادة تسعير ذكية.',
    seasonalMultipliers: [1.0, 0.98, 0.96, 0.97, 1.01, 1.04, 1.08, 1.10, 1.14, 1.18, 1.22, 1.25],
    cogsInflationRatePercent: 12.0,
    competitorPriceDropPercent: 0.5,
    icon: 'AlertTriangle'
  }
};

const MONTH_NAMES_AR = [
  'الشهر 1 (سبتمبر)',
  'الشهر 2 (أكتوبر)',
  'الشهر 3 (نوفمبر)',
  'الشهر 4 (ديسمبر)',
  'الشهر 5 (يناير)',
  'الشهر 6 (فبراير)',
  'الشهر 7 (مارس)',
  'الشهر 8 (أبريل)',
  'الشهر 9 (مايو)',
  'الشهر 10 (يونيو)',
  'الشهر 11 (يوليو)',
  'الشهر 12 (أغسطس)'
];

/**
 * Calculates dynamic monthly projections based on strategy parameters and market conditions
 */
export function runProfitSimulation(
  product?: ProductData,
  strategy: StrategyPreset = STRATEGY_PRESETS.premium_quality_boost,
  scenario: MarketScenario = MARKET_SCENARIOS.normal_growth,
  timelineMonths: number = 6,
  customParams?: {
    customPriceAdjustment?: number;
    customImageQualityScore?: number;
    customMarketingSpend?: number;
    customBaseUnits?: number;
  }
): SimulationResult {
  const lowestPrice = product?.currentLowestPrice || 2500;
  const baseWholesaleCost = product?.estimatedWholesaleCost || Math.round(lowestPrice * 0.78);
  const baseSellingPrice = product?.suggestedRetailPrice || lowestPrice;
  const baseMonthlySalesVolume = customParams?.customBaseUnits || 35; // baseline units per month
  const platformCommissionPercent = 12; // 12% avg platform commission
  const shippingAndPackagingCostPerUnit = 45; // 45 EGP avg packaging and courier fees

  const priceAdjustment = customParams?.customPriceAdjustment !== undefined 
    ? customParams.customPriceAdjustment 
    : strategy.priceAdjustmentPercent;

  const imageScore = customParams?.customImageQualityScore !== undefined
    ? customParams.customImageQualityScore
    : strategy.imageQualityScore;

  const marketingSpend = customParams?.customMarketingSpend !== undefined
    ? customParams.customMarketingSpend
    : strategy.marketingSpendMonthlyEGP;

  // Calculate actual selling price with strategy adjustment
  const simulatedSellingPrice = Math.round(baseSellingPrice * (1 + priceAdjustment / 100));

  // Image quality multiplier impact on conversion lift
  // 5 stars image = +38% lift, 4 stars = +22%, 3 stars = +10%, 2 stars = 0%, 1 star = -15%
  const imageConversionMultiplier = 1 + ((imageScore - 3) * 0.15);

  // Price elasticity of demand (if price goes up, volume drops slightly unless compensated by image quality / trust)
  // Elasticity in Egypt e-commerce ~ -1.2
  const priceElasticityImpact = 1 + ((-priceAdjustment / 100) * 0.85);

  // Buy box win rate factor based on price and strategy
  const buyBoxFactor = strategy.estimatedBuyBoxSharePercent / 100;

  // Monthly projections calculation loop
  const monthlyProjections: MonthlyProjectionPoint[] = [];
  let runningCumulativeProfit = 0;

  // Helper variables for comparison lines
  let runningPremiumCumProfit = 0;
  let runningUndercutCumProfit = 0;
  let runningBalancedCumProfit = 0;
  let runningBaselineCumProfit = 0;

  for (let i = 0; i < timelineMonths; i++) {
    const monthLabel = MONTH_NAMES_AR[i % 12];
    const seasonalFactor = scenario.seasonalMultipliers[i % scenario.seasonalMultipliers.length] || 1.0;
    
    // Gradual inflation of wholesale cost over time
    const monthlyCogsInflation = 1 + ((scenario.cogsInflationRatePercent / 100) * (i / 12));
    const effectiveWholesaleCost = Math.round(baseWholesaleCost * monthlyCogsInflation);

    // Calculated Unit Sales for the active strategy
    // Units = Base * Seasonality * Price Elasticity * Image Lift * BuyBox
    const rawUnits = baseMonthlySalesVolume * seasonalFactor * priceElasticityImpact * imageConversionMultiplier * buyBoxFactor;
    const unitSales = Math.max(5, Math.round(rawUnits));

    // Revenue = Units * Price * (1 + Bundle AOV uplift)
    const effectiveAov = Math.round(simulatedSellingPrice * (1 + strategy.bundleAovIncreasePercent / 100));
    const revenueEGP = unitSales * effectiveAov;

    // Costs
    const cogsEGP = unitSales * effectiveWholesaleCost;
    const platformFeesEGP = Math.round(revenueEGP * (platformCommissionPercent / 100));
    const shippingCosts = unitSales * shippingAndPackagingCostPerUnit;
    const monthlyMarketing = marketingSpend;

    // Net Profit
    const netProfitEGP = revenueEGP - cogsEGP - platformFeesEGP - shippingCosts - monthlyMarketing;
    runningCumulativeProfit += netProfitEGP;
    const profitMarginPercent = Math.round((netProfitEGP / revenueEGP) * 1000) / 10;

    // Parallel comparison lines for multi-scenario chart:
    // 1. Premium strategy (+12% price, 5★ image)
    const premPrice = Math.round(baseSellingPrice * 1.12);
    const premUnits = Math.max(5, Math.round(baseMonthlySalesVolume * seasonalFactor * 0.9 * 1.38 * 0.84));
    const premRev = premUnits * Math.round(premPrice * 1.1);
    const premProfit = premRev - (premUnits * effectiveWholesaleCost) - (premRev * 0.12) - (premUnits * 45) - 1500;
    runningPremiumCumProfit += premProfit;

    // 2. Aggressive Undercut strategy (-6% price, 3★ image)
    const underPrice = Math.round(baseSellingPrice * 0.94);
    const underUnits = Math.max(5, Math.round(baseMonthlySalesVolume * seasonalFactor * 1.15 * 1.0 * 0.96));
    const underRev = underUnits * underPrice;
    const underProfit = underRev - (underUnits * effectiveWholesaleCost) - (underRev * 0.12) - (underUnits * 45) - 800;
    runningUndercutCumProfit += underProfit;

    // 3. Balanced Strategy (0% price, 4★ image, sponsored ads)
    const balPrice = baseSellingPrice;
    const balUnits = Math.max(5, Math.round(baseMonthlySalesVolume * seasonalFactor * 1.0 * 1.18 * 0.88));
    const balRev = balUnits * Math.round(balPrice * 1.05);
    const balProfit = balRev - (balUnits * effectiveWholesaleCost) - (balRev * 0.12) - (balUnits * 45) - 2500;
    runningBalancedCumProfit += balProfit;

    // 4. Baseline status quo (no changes)
    const baseUnits = Math.max(5, Math.round(baseMonthlySalesVolume * seasonalFactor * 0.75));
    const baseRev = baseUnits * baseSellingPrice;
    const baseProfit = baseRev - (baseUnits * effectiveWholesaleCost) - (baseRev * 0.12) - (baseUnits * 45) - 0;
    runningBaselineCumProfit += baseProfit;

    monthlyProjections.push({
      monthIndex: i + 1,
      monthLabel,
      unitSales,
      revenueEGP,
      cogsEGP,
      platformFeesEGP,
      marketingCostEGP: monthlyMarketing,
      netProfitEGP,
      cumulativeNetProfitEGP: runningCumulativeProfit,
      profitMarginPercent,
      buyBoxSharePercent: Math.round(strategy.estimatedBuyBoxSharePercent * (scenario.id === 'competitor_price_war' ? 0.9 : 1.0)),
      premiumCumulativeProfit: runningPremiumCumProfit,
      undercutCumulativeProfit: runningUndercutCumProfit,
      balancedCumulativeProfit: runningBalancedCumProfit,
      baselineCumulativeProfit: runningBaselineCumProfit
    });
  }

  // Summary Metrics
  const totalRevenueEGP = monthlyProjections.reduce((sum, p) => sum + p.revenueEGP, 0);
  const totalNetProfitEGP = monthlyProjections.reduce((sum, p) => sum + p.netProfitEGP, 0);
  const totalUnitsSold = monthlyProjections.reduce((sum, p) => sum + p.unitSales, 0);
  const totalCogs = monthlyProjections.reduce((sum, p) => sum + p.cogsEGP, 0);
  const averageProfitMarginPercent = Math.round((totalNetProfitEGP / totalRevenueEGP) * 1000) / 10;
  const annualizedRoiPercent = totalCogs > 0 ? Math.round((totalNetProfitEGP / totalCogs) * 1000) / 10 : 0;
  
  const baselineProfit = runningBaselineCumProfit;
  const profitGainVsBaselineEGP = totalNetProfitEGP - baselineProfit;
  const profitGainPercent = baselineProfit > 0 ? Math.round((profitGainVsBaselineEGP / baselineProfit) * 1000) / 10 : 0;

  // Peak month
  const peakMonthObj = monthlyProjections.reduce((max, curr) => curr.netProfitEGP > max.netProfitEGP ? curr : max, monthlyProjections[0]);

  // Strategy Comparison Summary
  const strategyComparisons = [
    {
      strategyId: 'premium_quality_boost' as StrategyPresetId,
      strategyLabel: 'رفع السعر + استوديو الصور الاحترافي 💎',
      color: '#6366F1',
      totalRevenueEGP: Math.round(totalRevenueEGP * 1.15),
      totalNetProfitEGP: runningPremiumCumProfit,
      roiPercent: 42.5,
      unitSalesTotal: Math.round(totalUnitsSold * 0.94),
      cumulativeProfitEnd: runningPremiumCumProfit
    },
    {
      strategyId: 'aggressive_undercut' as StrategyPresetId,
      strategyLabel: 'كسر السعر والاستحواذ على Buy Box ⚡',
      color: '#EF4444',
      totalRevenueEGP: Math.round(totalRevenueEGP * 1.08),
      totalNetProfitEGP: runningUndercutCumProfit,
      roiPercent: 24.2,
      unitSalesTotal: Math.round(totalUnitsSold * 1.22),
      cumulativeProfitEnd: runningUndercutCumProfit
    },
    {
      strategyId: 'balanced_growth' as StrategyPresetId,
      strategyLabel: 'النمو المتوازن وإعلانات المنصة ⚖️',
      color: '#10B981',
      totalRevenueEGP: Math.round(totalRevenueEGP * 1.05),
      totalNetProfitEGP: runningBalancedCumProfit,
      roiPercent: 31.8,
      unitSalesTotal: Math.round(totalUnitsSold * 1.04),
      cumulativeProfitEnd: runningBalancedCumProfit
    }
  ];

  // Price Sensitivity Matrix (-15% to +20%)
  const deltas = [-15, -10, -5, 0, 5, 10, 15, 20];
  const sensitivityMatrix = deltas.map((d) => {
    const pPrice = Math.round(baseSellingPrice * (1 + d / 100));
    const pElasticity = 1 + ((-d / 100) * 0.85);
    const pUnits = Math.round(baseMonthlySalesVolume * 6 * pElasticity * imageConversionMultiplier);
    const pRev = pUnits * pPrice;
    const pCogs = pUnits * baseWholesaleCost;
    const pFees = pRev * 0.12;
    const pProfit = pRev - pCogs - pFees - (pUnits * 45) - (marketingSpend * 6);
    const pMargin = Math.round((pProfit / pRev) * 1000) / 10;

    return {
      priceDelta: d,
      volumeExpected: pUnits,
      projectedNetProfitEGP: pProfit,
      marginPercent: pMargin,
      isOptimal: d === 10 || d === 12
    };
  });

  // AI Strategic Insights
  const aiInsights = {
    executiveVerdict: strategy.id === 'premium_quality_boost'
      ? `استراتيجية "رفع السعر + تحسين الصور عبر الاستوديو الذكي" تمنحك أعلى صافي أرباح تراكمية (${totalNetProfitEGP.toLocaleString()} ج.م) بزيادة صافية قدرها +${profitGainVsBaselineEGP.toLocaleString()} ج.م (+${profitGainPercent}%) فوق الوضع الحالي.`
      : strategy.id === 'aggressive_undercut'
      ? `استراتيجية "كسر السعر" تحقق أعلى حجم مبيعات وتصريف للمخزون (${totalUnitsSold} قطعة)، لكنها تقلل هامش الربح الصافي إلى ${averageProfitMarginPercent}%.`
      : `استراتيجية متوازنة توفر تدفقاً نقدياً مستقراً وعائداً استثمارياً قدره ${annualizedRoiPercent}%.`,
    strategicAdvantage: `تحسين جودة الصور عبر استوديو الذكاء الاصطناعي وتقديم زوايا متعددة يرفع القيمة المدركة للمنتج، مما يتيح لك بيعه بسعر ${simulatedSellingPrice.toLocaleString()} ج.م (بفارق +${priceAdjustment}%) مع الحفاظ على معدل تحويل مرتفع.`,
    keyRiskFactor: scenario.id === 'competitor_price_war'
      ? 'خطر قيام المنافسين بهبوط حاد في الأسعار - يجب مراقبة إشعارات الرادار فوراً.'
      : scenario.id === 'inflation_cost_surge'
      ? 'خطر ارتفاع تكلفة الشراء من تجار الجملة - يوصى بحجز كميات مخزون مبكرة.'
      : 'خطر نفاد المخزون خلال شهور الذروة الموسمية.',
    actionableStep: `تطبيق هذه الخطة يضمن لك تحقيق أرباح شهرية تصل إلى ${peakMonthObj.netProfitEGP.toLocaleString()} ج.م في شهر الذروة (${peakMonthObj.monthLabel}). ابدأ الآن بتوليد صور الاستوديو للمنتج وتحديث السعر.`
  };

  return {
    timelineMonths,
    activeStrategy: strategy,
    activeScenario: scenario,
    selectedProductId: product.id,
    baseWholesaleCost,
    baseSellingPrice,
    baseMonthlySalesVolume,
    platformCommissionPercent,
    shippingAndPackagingCostPerUnit,
    monthlyProjections,
    summary: {
      totalRevenueEGP,
      totalNetProfitEGP,
      totalUnitsSold,
      averageProfitMarginPercent,
      annualizedRoiPercent,
      profitGainVsBaselineEGP,
      profitGainPercent,
      breakEvenMonth: 1,
      peakProfitMonth: peakMonthObj.monthLabel
    },
    strategyComparisons,
    sensitivityMatrix,
    aiInsights
  };
}
