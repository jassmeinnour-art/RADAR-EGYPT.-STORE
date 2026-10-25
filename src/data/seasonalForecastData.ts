export const seasonalForecastData = [];

export interface EgyptianPeakSeason {
  id: string;
  name: string;
  shortName: string;
  historicalDemandMultiplier: number;
  demandMultiplier: number;
  urgencyLevel: 'urgent' | 'upcoming';
  daysUntilPeak: number;
  dateRangeLabel: string;
  recommendedLeadTimeDays: number;
  discountDepthAverage: number;
}

export const EGYPTIAN_PEAK_SEASONS: EgyptianPeakSeason[] = [
  {
    id: 'ramadan_eid',
    name: 'موسم رمضان وعيد الفطر 🌙',
    shortName: 'رمضان والعيد',
    historicalDemandMultiplier: 2.5,
    demandMultiplier: 2.5,
    urgencyLevel: 'urgent',
    daysUntilPeak: 14,
    dateRangeLabel: 'مارس - أبريل 2026',
    recommendedLeadTimeDays: 20,
    discountDepthAverage: 15
  },
  {
    id: 'white_friday',
    name: 'تخفيضات الجمعة البيضاء 🛍️',
    shortName: 'الجمعة البيضاء',
    historicalDemandMultiplier: 3.2,
    demandMultiplier: 3.2,
    urgencyLevel: 'upcoming',
    daysUntilPeak: 45,
    dateRangeLabel: 'نوفمبر 2026',
    recommendedLeadTimeDays: 30,
    discountDepthAverage: 25
  },
  {
    id: 'back_to_school',
    name: 'موسم العودة للمدارس 📚',
    shortName: 'العودة للمدارس',
    historicalDemandMultiplier: 1.8,
    demandMultiplier: 1.8,
    urgencyLevel: 'upcoming',
    daysUntilPeak: 60,
    dateRangeLabel: 'سبتمبر 2026',
    recommendedLeadTimeDays: 15,
    discountDepthAverage: 10
  }
];

export function calculateProductSeasonalDemandForecast(product: any, eventId?: string): any {
  const ev = EGYPTIAN_PEAK_SEASONS.find(e => e.id === eventId) || EGYPTIAN_PEAK_SEASONS[0];
  const currentStockUnits = product?.stock ?? 25;
  const dailySalesVelocity = Math.max(1, Math.round((product?.monthlySales || 30) / 30));
  const historicalMultiplier = ev.historicalDemandMultiplier || 2.5;
  const projectedPeakDailyVelocity = Math.round(dailySalesVelocity * historicalMultiplier);
  const expectedTotalPeakDemandUnits = projectedPeakDailyVelocity * 30;
  const daysOfInventoryAtCurrentRate = Math.round(currentStockUnits / dailySalesVelocity);
  const daysOfInventoryAtPeakRate = Math.round(currentStockUnits / projectedPeakDailyVelocity);

  const stockoutAlertSeverity = daysOfInventoryAtPeakRate <= 7 ? 'critical' : daysOfInventoryAtPeakRate <= 15 ? 'high_risk' : 'safe';
  const daysUntilStockout = daysOfInventoryAtPeakRate;
  const recommendedReorderUnits = Math.max(0, expectedTotalPeakDemandUnits - currentStockUnits);
  const wholesaleUnitCostEGP = product?.cogs || product?.price * 0.7 || 100;
  const totalReorderInvestmentEGP = recommendedReorderUnits * wholesaleUnitCostEGP;
  const projectedPeakRevenueEGP = expectedTotalPeakDemandUnits * (product?.price || 150);
  const projectedPeakNetProfitEGP = projectedPeakRevenueEGP - (expectedTotalPeakDemandUnits * wholesaleUnitCostEGP);
  const estimatedLostRevenueIfStockoutEGP = Math.max(0, expectedTotalPeakDemandUnits - currentStockUnits) * (product?.price || 150);

  const now = new Date();
  const stockoutDate = new Date(now.getTime() + daysUntilStockout * 86400000);
  const deadlineDate = new Date(now.getTime() + Math.max(1, daysUntilStockout - (ev.recommendedLeadTimeDays || 10)) * 86400000);

  return {
    productId: product?.id || 'p-1',
    productTitle: product?.title || 'منتج',
    productImage: product?.imageUrl || product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150',
    sku: product?.sku || product?.id || 'SKU-001',
    category: product?.category || 'عام',
    currentStockUnits,
    dailySalesVelocity,
    peakEventId: ev.id,
    peakEventName: ev.name,
    historicalMultiplier,
    projectedPeakDailyVelocity,
    expectedTotalPeakDemandUnits,
    daysOfInventoryAtCurrentRate,
    daysOfInventoryAtPeakRate,
    expectedStockoutDate: stockoutDate.toISOString().split('T')[0],
    stockoutAlertSeverity,
    daysUntilStockout,
    recommendedReorderUnits,
    safetyBufferPercent: 20,
    wholesaleUnitCostEGP,
    totalReorderInvestmentEGP,
    projectedPeakRevenueEGP,
    projectedPeakNetProfitEGP,
    estimatedLostRevenueIfStockoutEGP,
    reorderDeadlineDate: deadlineDate.toISOString().split('T')[0],
    supplierLeadTimeDays: ev.recommendedLeadTimeDays || 10,
    preferredWholesaleMarket: 'سوق العبور / عبد العزيز - القاهرة',
    actionPlanSummary: `إيقاف استنزاف المخزون وطلب ${recommendedReorderUnits} قطعة قبل ${deadlineDate.toISOString().split('T')[0]}`,
    forecastDailyTimeline: []
  };
}

export function generateAllSeasonalForecasts(
  products: any[] = [],
  eventId?: string,
  safetyBufferPercent: number = 20,
  supplierLeadTimeDays: number = 14
) {
  const ev = EGYPTIAN_PEAK_SEASONS.find(e => e.id === eventId) || EGYPTIAN_PEAK_SEASONS[0];
  const list = (products || []).map(p => calculateProductSeasonalDemandForecast(p, ev.id));

  const totalRecommendedInvestment = list.reduce((acc, curr) => acc + (curr.totalReorderInvestmentEGP || 0), 0);
  const totalProjectedPeakRevenue = list.reduce((acc, curr) => acc + (curr.projectedPeakRevenueEGP || 0), 0);
  const totalAtRiskRevenue = list.reduce((acc, curr) => acc + (curr.estimatedLostRevenueIfStockoutEGP || 0), 0);
  const criticalCount = list.filter(item => item.stockoutAlertSeverity === 'critical').length;
  const highRiskCount = list.filter(item => item.stockoutAlertSeverity === 'high_risk').length;

  return {
    event: ev,
    forecasts: list,
    totalRecommendedInvestment,
    totalProjectedPeakRevenue,
    totalAtRiskRevenue,
    criticalCount,
    highRiskCount
  };
}


