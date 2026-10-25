export const remoteMerchantsData = [];
export const SAMPLE_REMOTE_MERCHANTS: any[] = [];

export function generateWeeklyReportForMerchant(merchant: any, timeframe?: any): any {
  return {
    merchantId: merchant?.id || 'm-1',
    merchantName: merchant?.name || 'متجر جديد',
    startDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    totalSales: merchant?.monthlySales || 0,
    totalOrders: merchant?.ordersCount || 0,
    topProducts: [],
    alertsSummary: { priceDrops: 0, stockouts: 0 }
  };
}

export function createEmptyMerchantWeeklyReport(): any {
  return generateWeeklyReportForMerchant(null);
}

