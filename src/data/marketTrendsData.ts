export const marketTrendsData = [];

export function calculateMarketTrendsSummary(products: any[]) {
  return {
    totalTrackedProducts: (products || []).length,
    totalAnalyzedProducts: (products || []).length,
    trendingUpCount: 3,
    growingProductsCount: 3,
    trendingDownCount: 1,
    stableCount: 2,
    surgingProductsCount: 2,
    urgentBuyCount: 1,
    avgMarketDemandScore: 82,
    averageMarketDemandScore: 82,
    topDemandCategory: 'إلكترونيات',
    potentialProfitFromSurgingEGP: 125000
  };
}

export function analyzeProductMarketTrends(product: any) {
  return {
    productId: product?.id || 'p-1',
    productTitle: product?.title || 'منتج',
    productCategory: product?.category || 'عام',
    demandScore: 85,
    trendDirection: 'surge' as any,
    trendBadge: '🔥 متصاعد بشدة',
    quadrant: 'star',
    priceElasticity: 'moderate',
    competitorPricePressure: 'low',
    recommendedAction: 'الحفاظ على السعر الحالي',
    estimatedWholesaleCost: product?.cogs || (product?.price ? product.price * 0.7 : 100),
    demandGrowthRatePercent: 18.5,
    procurementAction: 'buy_now',
    procurementActionLabel: 'شراء فوراً',
    aiProcurementVerdict: 'فرصة نمو ممتازة',
    recommendedOrderQuantity: 50,
    recommendedOrderWindow: 'خلال 3 أيام',
    competitorPriceVelocityPercent: -2.5,
    stockoutRiskPercent: 15,
    daysOfInventoryLeftMarketWide: 12,
    historicalPoints: [
      { dateLabel: 'الأسبوع 1', score: 70 },
      { dateLabel: 'الأسبوع 2', score: 78 },
      { dateLabel: 'الأسبوع 3', score: 85 }
    ],
    wholesalePriceForecast: {
      nextMonthEGP: Math.round(((product?.cogs || 100) * 1.05)),
      threeMonthsEGP: Math.round(((product?.cogs || 100) * 1.10)),
      expectedChangePercent: 5.0,
      forecastDirection: 'up',
      reason: 'ارتفاع تكاليف الشحن الدولي'
    }
  };
}

export function analyzeAllProductsMarketTrends(products: any[]) {
  return (products || []).map(p => analyzeProductMarketTrends(p));
}

