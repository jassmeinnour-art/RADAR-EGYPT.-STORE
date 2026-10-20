import { RemoteMerchantClient, MerchantWeeklyReport, ProductData } from '../types';
import { generateRealMerchantWeeklyReport } from '../utils/competitorMatchingEngine';

// Clean production state: No mock remote merchants
export const SAMPLE_REMOTE_MERCHANTS: RemoteMerchantClient[] = [];

// Helper to generate an empty/blank report
export function createEmptyMerchantWeeklyReport(merchantId: string = 'empty', merchantName: string = 'غير محدد'): MerchantWeeklyReport {
  return {
    id: `rep-${merchantId}-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now()}`,
    merchantId,
    merchantName,
    reportPeriod: 'التقرير الأسبوعي الشامل',
    generatedAt: new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' }),
    recipients: [],
    executiveAiSummary: 'لا توجد بيانات مبيعات مسجلة لهذا التاجر حتى الآن. سيتم توليد التحليلات والتوصيات تلقائياً فور بدء المبيعات وتحديث الأسعار ومزامنة المنتجات الحقيقية.',
    salesSummary: {
      totalRevenueEGP: 0,
      revenueGrowthPercent: 0,
      totalOrders: 0,
      ordersGrowthPercent: 0,
      totalProfitEGP: 0,
      avgProfitMargin: 0,
      buyBoxWinRate: 0,
      platformBreakdown: []
    },
    productCompetitorInsights: [],
    strategicRecommendations: [
      'قم بربط المنصات الإلكترونية وإجراء المزامنة الحية لمنتجات المتجر لبدء توليد التقارير الأسبوعية الفعلية.',
      'سيتم رصد حركة أسعار المنافسين الحقيقيين على أمازون مصر والمنصات الأخرى فور تفعيل المزامنة.'
    ]
  };
}

// Helper to generate a live, authentic weekly report for a specific merchant based exclusively on real products
export function generateWeeklyReportForMerchant(
  merchant: RemoteMerchantClient | null | undefined,
  allProducts: ProductData[]
): MerchantWeeklyReport {
  if (!merchant) {
    return createEmptyMerchantWeeklyReport();
  }
  return generateRealMerchantWeeklyReport(merchant, allProducts);
}

