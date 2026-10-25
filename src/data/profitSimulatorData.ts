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
  const currentPrice = product?.price || 100;
  const currentCost = product?.costPrice || product?.cogs || currentPrice * 0.7;
  const currentSalesVolume = customParams?.customBaseUnits || product?.monthlySales || 35;

  const priceAdj = customParams?.customPriceAdjustment ?? strategy?.priceAdjustmentPercent ?? 0;
  const newPrice = Math.round(currentPrice * (1 + priceAdj / 100));

  const cogsInflation = scenario?.cogsInflationRatePercent || 0;
  const newCost = Math.round(currentCost * (1 + cogsInflation / 100));

  const volumeChangeRatio = 1 - (priceAdj * 0.012);
  const projectedVolume = Math.max(1, Math.round(currentSalesVolume * volumeChangeRatio));

  const currentRevenue = currentPrice * currentSalesVolume;
  const currentProfit = (currentPrice - currentCost) * currentSalesVolume;

  const projectedRevenue = newPrice * projectedVolume;
  const projectedProfit = (newPrice - newCost) * projectedVolume;

  const monthlyProjections = Array.from({ length: timelineMonths }, (_, i) => ({
    monthLabel: `شهر ${i + 1}`,
    revenue: Math.round(projectedRevenue * (1 + i * 0.02)),
    netProfit: Math.round(projectedProfit * (1 + i * 0.02)),
    baselineProfit: Math.round(currentProfit)
  }));

  return {
    selectedProductId: product?.id || 'p-1',
    productTitle: product?.title || 'منتج',
    currentPrice,
    newPrice,
    currentCost,
    newCost,
    currentSalesVolume,
    projectedVolume,
    currentRevenue,
    projectedRevenue,
    currentProfit,
    projectedProfit,
    profitDeltaPercent: currentProfit > 0 ? ((projectedProfit - currentProfit) / currentProfit) * 100 : 0,
    timelineMonths,
    activeStrategy: strategy || defaultStrategy,
    activeScenario: scenario || scenariosDict.normal_growth,
    monthlyProjections,
    cumulativeRevenue: monthlyProjections.reduce((a, c) => a + c.revenue, 0),
    cumulativeNetProfit: monthlyProjections.reduce((a, c) => a + c.netProfit, 0),
    roiPercent: currentCost > 0 ? (projectedProfit / (currentCost * projectedVolume)) * 100 : 0
  };
}

