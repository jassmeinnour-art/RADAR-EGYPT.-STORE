export const salesDashboardData = {};

export interface SalesPricingCorrelationInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'surge' | 'neutral';
  title?: string;
  headline?: string;
  description: string;
  impactScore?: number;
  impactMetric?: string;
  recommendedPriceEGP?: number;
  productTitle?: string;
}

export function generateSalesDashboardData(products: any[], watchlistOrTimeframe?: any, timeframeOrCategory?: any) {
  const timeframe = typeof watchlistOrTimeframe === 'string' ? watchlistOrTimeframe : (typeof timeframeOrCategory === 'string' ? timeframeOrCategory : '30days');
  const weeklyTrends = [
    { dayOfWeek: 'الأحد', dateLabel: '20 أكتوبر', sales: 12000, orders: 45 },
    { dayOfWeek: 'الإثنين', dateLabel: '21 أكتوبر', sales: 15000, orders: 52 },
    { dayOfWeek: 'الثلاثاء', dateLabel: '22 أكتوبر', sales: 18000, orders: 60 },
    { dayOfWeek: 'الأربعاء', dateLabel: '23 أكتوبر', sales: 14000, orders: 48 },
    { dayOfWeek: 'الخميس', dateLabel: '24 أكتوبر', sales: 22000, orders: 75 },
    { dayOfWeek: 'الجمعة', dateLabel: '25 أكتوبر', sales: 28000, orders: 90 },
    { dayOfWeek: 'السبت', dateLabel: '26 أكتوبر', sales: 26000, orders: 83 }
  ];

  const summary = {
    timeframe: timeframe || '30days',
    totalUnitsSold: 453,
    totalRevenueEGP: 135000,
    totalNetProfitEGP: 40500,
    overallMarginPercent: 30,
    buyBoxDominancePercent: 82,
    avgPriceAdvantageEGP: 15,
    salesGrowthRatePercent: 12.5,
    topPerformingProduct: 'منتج ممتاز',
    topOpportunityProduct: 'فرصة واعدة',
    dailyAggregatedData: []
  };

  return {
    summary,
    productPerformances: [],
    weeklyTrends,
    totalRevenue: 135000,
    totalOrders: 453,
    avgOrderValue: 298.0
  };
}

export function generateSalesPricingInsights(products: any[]): SalesPricingCorrelationInsight[] {
  return [
    {
      id: 'insight-1',
      type: 'surge',
      headline: 'ارتفاع حاد في طلبات أجهزة الشحن والمحول الذكي',
      description: 'انخفاض سعر الشاحن السريع 5% لدى المنافسين أدى لزيادة حجم الطلب بـ 28%',
      impactMetric: '+28% مبيعات',
      recommendedPriceEGP: 350,
      productTitle: 'شاحن أنكر السريع 65 واط'
    },
    {
      id: 'insight-2',
      type: 'opportunity',
      headline: 'فرصة زيادة الهامش في فئة أغطية الهواتف',
      description: 'شغور مخزون المنافس الرئيسي يتيح إمكانية رفع السعر بـ 10% دون التأثير على الطلب',
      impactMetric: '+10% أرباح',
      recommendedPriceEGP: 180,
      productTitle: 'جراب حماية متين آيفون 15'
    }
  ];
}

export function generateMarketShareComparison(
  products: any[] = [],
  merchantStoreName: string = 'متجرك الرقمي',
  filterCategory: string = 'all',
  timeframe: string = '30d'
): any {
  return {
    id: `ms-${Date.now()}`,
    merchantStoreName,
    timeframe,
    category: filterCategory,
    merchantSharePercent: 38,
    topCompetitorSharePercent: 26,
    marketRankPosition: 1,
    totalTrackedCompetitors: 4,
    lastCalculatedAt: new Date().toISOString(),
    competitors: [
      { id: 'c1', name: merchantStoreName, sharePercent: 38, isCurrentMerchant: true },
      { id: 'c2', name: 'متجر أمازون الرئيسي', sharePercent: 26, isCurrentMerchant: false },
      { id: 'c3', name: 'نون مصر', sharePercent: 20, isCurrentMerchant: false },
      { id: 'c4', name: 'جوميا مصر', sharePercent: 16, isCurrentMerchant: false }
    ]
  };
}


