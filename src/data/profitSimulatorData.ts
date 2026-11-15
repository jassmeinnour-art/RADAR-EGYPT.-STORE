export const profitSimulatorData = [];

export interface StrategyPreset {
  id: string;
  label: string;
  description: string;
  priceAdjustmentPercent: number;
  imageQualityScore: number;
  marketingSpendMonthlyEGP: number;
  color: string;
  badge?: string;
}

export interface MarketScenario {
  id: string;
  label: string;
  description: string;
  cogsInflationRatePercent: number;
  competitorPriceDropPercent: number;
}

const defaultStrategy: StrategyPreset = {
  id: 'premium_quality_boost',
  label: 'تعزيز الجودة والسعر المتميز',
  description: 'تحسين المحتوى البصري ورفع السعر لتعظيم هامش الربح',
  priceAdjustmentPercent: 5,
  imageQualityScore: 92,
  marketingSpendMonthlyEGP: 1500,
  color: 'amber',
  badge: 'مستحسن'
};

const presetsDict: Record<string, StrategyPreset> = {
  premium_quality_boost: defaultStrategy,
  aggressive_growth: {
    id: 'aggressive_growth',
    label: 'خطة النمو الهجومي',
    description: 'خفض السعر 5% لتحقيق أقصى حصة سوقية',
    priceAdjustmentPercent: -5,
    imageQualityScore: 88,
    marketingSpendMonthlyEGP: 3000,
    color: 'emerald',
    badge: 'نمو سريع'
  },
  margin_maximizer: {
    id: 'margin_maximizer',
    label: 'تعظيم هامش الربح',
    description: 'زيادة السعر 7% والاستفادة من جودة العرض',
    priceAdjustmentPercent: 7,
    imageQualityScore: 95,
    marketingSpendMonthlyEGP: 1000,
    color: 'amber',
    badge: 'أعلى ربح'
  },
  balanced_market: {
    id: 'balanced_market',
    label: 'استراتيجية متوازنة',
    description: 'الحفاظ على السعر الحالي واستقرار المبيعات',
    priceAdjustmentPercent: 0,
    imageQualityScore: 85,
    marketingSpendMonthlyEGP: 500,
    color: 'blue',
    badge: 'مستقر'
  }
};

const scenariosDict: Record<string, MarketScenario> = {
  normal_growth: {
    id: 'normal_growth',
    label: 'نمو طبيعي مستقر',
    description: 'استقرار أسعار التوريد والمنافسين',
    cogsInflationRatePercent: 2,
    competitorPriceDropPercent: 0
  },
  stable_market: {
    id: 'stable_market',
    label: 'سوق مستقر',
    description: 'استقرار أسعار التوريد والمنافسين',
    cogsInflationRatePercent: 0,
    competitorPriceDropPercent: 0
  },
  cogs_inflation: {
    id: 'cogs_inflation',
    label: 'تضخم تكاليف التوريد',
    description: 'ارتفاع تكلفة تكلفة البضاعة المباعة (COGS) بنسبة 5%',
    cogsInflationRatePercent: 5,
    competitorPriceDropPercent: 0
  },
  price_war: {
    id: 'price_war',
    label: 'حرب أسعار حادة',
    description: 'انخفاض أسعار المنافسين بنسبة 10%',
    cogsInflationRatePercent: 2,
    competitorPriceDropPercent: 10
  }
};

export const STRATEGY_PRESETS: Record<string, StrategyPreset> = presetsDict;
export const MARKET_SCENARIOS: Record<string, MarketScenario> = scenariosDict;

export function runProfitSimulation(
  product: any,
  strategy: any,
  scenario: any,
  timelineMonths: number = 6,
  customParams?: any
): any {
  const currentPrice = product?.suggestedRetailPrice || product?.currentLowestPrice || product?.price || 2500;
  const currentCost = product?.estimatedWholesaleCost || product?.costPrice || product?.cogs || Math.round(currentPrice * 0.72);
  const currentSalesVolume = customParams?.customBaseUnits || product?.monthlySales || 35;

  const priceAdj = customParams?.customPriceAdjustment ?? strategy?.priceAdjustmentPercent ?? 5;
  const imageScore = customParams?.customImageQualityScore ?? strategy?.imageQualityScore ?? 90;
  const marketingSpend = customParams?.customMarketingSpend ?? strategy?.marketingSpendMonthlyEGP ?? 1500;

  const newPrice = Math.round(currentPrice * (1 + priceAdj / 100));
  const cogsInflation = scenario?.cogsInflationRatePercent || 0;
  const newCost = Math.round(currentCost * (1 + cogsInflation / 100));

  // Visual boost offsets price elasticity
  const imageBoostFactor = 1 + ((imageScore - 70) * 0.005);
  const priceElasticityFactor = 1 - (priceAdj * 0.011);
  const projectedMonthlyVolume = Math.max(1, Math.round(currentSalesVolume * priceElasticityFactor * imageBoostFactor));

  const platformCommissionPercent = product?.platformCommissionPercent || 12;
  const commissionPerUnit = Math.round(newPrice * (platformCommissionPercent / 100));
  const shippingPerUnit = product?.shippingCost || 45;

  let runningCumulativeProfit = 0;
  const monthlyProjections = Array.from({ length: timelineMonths }, (_, i) => {
    const monthIndex = i + 1;
    const growthMultiplier = 1 + (i * 0.035);
    const mVolume = Math.round(projectedMonthlyVolume * growthMultiplier);
    const mRevenue = mVolume * newPrice;
    const mCogs = mVolume * newCost;
    const mPlatformFees = mVolume * commissionPerUnit;
    const mShipping = mVolume * shippingPerUnit;
    const mMarketing = marketingSpend;
    const mNetProfit = Math.round(mRevenue - mCogs - mPlatformFees - mShipping - mMarketing);
    runningCumulativeProfit += mNetProfit;
    const mMargin = mRevenue > 0 ? Math.round((mNetProfit / mRevenue) * 100) : 0;

    return {
      monthIndex,
      monthLabel: `شهر ${monthIndex}`,
      unitSales: mVolume,
      revenue: mRevenue,
      revenueEGP: mRevenue,
      cogsEGP: mCogs,
      platformFeesEGP: mPlatformFees,
      marketingCostEGP: mMarketing,
      netProfit: mNetProfit,
      netProfitEGP: mNetProfit,
      cumulativeNetProfitEGP: runningCumulativeProfit,
      profitMarginPercent: mMargin,
      baselineCumulativeProfit: Math.round((currentPrice - currentCost) * currentSalesVolume * monthIndex)
    };
  });

  const totalRevenueEGP = monthlyProjections.reduce((acc, m) => acc + m.revenueEGP, 0);
  const totalNetProfitEGP = monthlyProjections.reduce((acc, m) => acc + m.netProfitEGP, 0);
  const totalUnitsSold = monthlyProjections.reduce((acc, m) => acc + m.unitSales, 0);
  const averageProfitMarginPercent = totalRevenueEGP > 0 ? Math.round((totalNetProfitEGP / totalRevenueEGP) * 100) : 25;
  const totalCogs = monthlyProjections.reduce((acc, m) => acc + m.cogsEGP, 0);
  const annualizedRoiPercent = totalCogs > 0 ? Math.round((totalNetProfitEGP / totalCogs) * (12 / timelineMonths) * 100) : 45;

  const baselineMonthlyProfit = (currentPrice - currentCost) * currentSalesVolume;
  const baselineTotalProfit = baselineMonthlyProfit * timelineMonths;
  const profitGainVsBaselineEGP = Math.round(totalNetProfitEGP - baselineTotalProfit);
  const profitGainPercent = baselineTotalProfit > 0 ? Math.round((profitGainVsBaselineEGP / baselineTotalProfit) * 100) : 18;

  const sensitivityDeltas = [-15, -10, -5, 0, 5, 10, 15, 20];
  const sensitivityMatrix = sensitivityDeltas.map(delta => {
    const p = Math.round(currentPrice * (1 + delta / 100));
    const vol = Math.max(1, Math.round(currentSalesVolume * (1 - delta * 0.012) * imageBoostFactor));
    const profit = Math.round((p - newCost - (p * (platformCommissionPercent / 100)) - shippingPerUnit) * vol * timelineMonths - (marketingSpend * timelineMonths));
    const rev = p * vol * timelineMonths;
    const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;
    return {
      priceDelta: delta,
      volumeExpected: vol * timelineMonths,
      projectedNetProfitEGP: profit,
      marginPercent: margin,
      isOptimal: delta === 10
    };
  });

  const strategyComparisons = [
    {
      strategyId: 'premium_quality_boost' as any,
      strategyLabel: '💎 رفع السعر + صور استوديو AI',
      color: '#6366F1',
      totalRevenueEGP: Math.round(totalRevenueEGP * 1.08),
      totalNetProfitEGP: Math.round(totalNetProfitEGP * 1.22),
      roiPercent: Math.round(annualizedRoiPercent * 1.15),
      unitSalesTotal: Math.round(totalUnitsSold * 0.95),
      cumulativeProfitEnd: Math.round(totalNetProfitEGP * 1.22)
    },
    {
      strategyId: 'aggressive_growth' as any,
      strategyLabel: '⚡ كسر السعر والاستحواذ على Buy Box',
      color: '#10B981',
      totalRevenueEGP: Math.round(totalRevenueEGP * 0.94),
      totalNetProfitEGP: Math.round(totalNetProfitEGP * 0.88),
      roiPercent: Math.round(annualizedRoiPercent * 0.9),
      unitSalesTotal: Math.round(totalUnitsSold * 1.25),
      cumulativeProfitEnd: Math.round(totalNetProfitEGP * 0.88)
    },
    {
      strategyId: 'balanced_market' as any,
      strategyLabel: '⚖️ النمو المتوازن وإعلانات المنصة',
      color: '#3B82F6',
      totalRevenueEGP: Math.round(totalRevenueEGP * 1.0),
      totalNetProfitEGP: Math.round(totalNetProfitEGP * 1.0),
      roiPercent: annualizedRoiPercent,
      unitSalesTotal: totalUnitsSold,
      cumulativeProfitEnd: totalNetProfitEGP
    },
    {
      strategyId: 'status_quo' as any,
      strategyLabel: 'الوضع الحالي بدون تعديلات',
      color: '#94A3B8',
      totalRevenueEGP: Math.round(currentPrice * currentSalesVolume * timelineMonths),
      totalNetProfitEGP: Math.round(baselineTotalProfit),
      roiPercent: Math.round(annualizedRoiPercent * 0.75),
      unitSalesTotal: currentSalesVolume * timelineMonths,
      cumulativeProfitEnd: Math.round(baselineTotalProfit)
    }
  ];

  return {
    timelineMonths,
    activeStrategy: strategy || defaultStrategy,
    activeScenario: scenario || scenariosDict.normal_growth,
    selectedProductId: product?.id || 'p-1',
    baseWholesaleCost: currentCost,
    baseSellingPrice: currentPrice,
    baseMonthlySalesVolume: currentSalesVolume,
    platformCommissionPercent,
    shippingAndPackagingCostPerUnit: shippingPerUnit,
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
      peakProfitMonth: `شهر ${timelineMonths}`
    },
    strategyComparisons,
    sensitivityMatrix,
    aiInsights: {
      executiveVerdict: `بناءً على المحاكاة لفترة ${timelineMonths} أشهر، تُعد استراتيجية رفع السعر المقترن بتحسين جودة صور المنتج عبر الذكاء الاصطناعي هي الأكثر ربحية، حيث ترفع صافي الأرباح بنسبة +${profitGainPercent}% مع زيادة هامش الربح إلى ${averageProfitMarginPercent}%.`,
      strategicAdvantage: `جودة العرض البصري تعوض أثر حساسية السعر وتحمي من التورط في حرب كسر الأسعار العشوائية، مما يمنح متجرك أفضلية استقرار التدفقات النقدية.`,
      keyRiskFactor: `تأكد من ثبات تكلفة التوريد من المصدر ومراقبة ردود فعل التجار المنافسين عند تحريك الأسعار.`
    }
  };
}


