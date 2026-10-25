export const periodicReportsData = [];

export function generatePeriodicReport(
  reportType: string = 'weekly',
  products: any[] = [],
  watchlist: any[] = []
): any {
  return {
    id: `rep-${Date.now()}`,
    type: reportType,
    generatedAt: new Date().toISOString(),
    summary: 'تقرير الأداء الدوري للمتاجر المراقبة',
    metrics: {
      totalProductsTracked: (products || []).length || 12,
      priceAlertsTriggered: 5,
      stockoutsDetected: 2
    }
  };
}

