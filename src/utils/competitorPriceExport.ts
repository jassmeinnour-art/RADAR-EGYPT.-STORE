import * as XLSX from 'xlsx';
import { recordExportTimestamp } from './csvProductManager';
import { MerchantCatalogProduct } from '../types';

export interface CompetitorExportRow {
  sku: string;
  asin?: string;
  title: string;
  brand: string;
  category: string;
  platform: string;
  merchantPrice: number;
  costPrice?: number;
  lowestCompetitorName: string;
  lowestCompetitorPrice: number;
  buyBoxPrice?: number;
  priceGap: number;
  priceGapPercent: number;
  isBuyBoxWinner: string;
  pricingStatus: string;
  stockStatus: string;
  lastUpdated: string;
}

export interface DirectOfferExportRow {
  productTitle: string;
  skuBarcode?: string;
  category?: string;
  merchantPrice: number;
  competitorName: string;
  competitorPlatform: string;
  competitorPrice: number;
  priceDifference: number;
  differenceType: string;
  isLowestInMarket: string;
  shippingDuration: string;
  sellerRating: string;
  stockAvailability: string;
  timestamp: string;
}

/**
 * Maps platform codes to Arabic names
 */
export function formatPlatformArabic(platform?: string): string {
  if (!platform) return 'غير محدد';
  switch (platform) {
    case 'amazon_eg':
    case 'amazon':
      return 'أمازون مصر (Amazon.eg)';
    case 'noon_eg':
    case 'noon':
      return 'نون مصر (Noon Egypt)';
    case 'jumia_eg':
    case 'jumia':
      return 'جوميا مصر (Jumia Egypt)';
    case 'direct_store':
      return 'متجر إلكتروني خاص';
    default:
      return platform;
  }
}

/**
 * Exports competitor price data from MerchantCatalogProduct list
 */
export function exportMerchantCatalogPricesToSpreadsheet(
  products: MerchantCatalogProduct[],
  format: 'xlsx' | 'csv' = 'xlsx',
  merchantName?: string
): { success: boolean; filename: string; rowCount: number } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const filename = `تقرير_اسعار_المنافسين_${merchantName ? merchantName.replace(/\s+/g, '_') + '_' : ''}${dateStr}`;

  // Build formatted Arabic rows
  const arabicRows = products.map((prod) => {
    const isWinner = prod.isBuyBoxWinner || prod.pricingStatus === 'winning_buybox';
    const gap = prod.merchantPrice - prod.lowestCompetitorPrice;
    const gapPercent = prod.lowestCompetitorPrice > 0
      ? Math.round(((prod.merchantPrice - prod.lowestCompetitorPrice) / prod.lowestCompetitorPrice) * 100)
      : 0;

    let statusAr = 'غير محدد';
    if (prod.pricingStatus === 'winning_buybox') statusAr = '🏆 فائز بالـ Buy Box';
    else if (prod.pricingStatus === 'competitive') statusAr = '🟢 سعر منافس';
    else if (prod.pricingStatus === 'higher_than_buybox') statusAr = '🔵 أعلى من الـ Buy Box';
    else if (prod.pricingStatus === 'needs_repricing') statusAr = '🔴 بحاجة لتعديل السعر';

    return {
      'كود المنتج (SKU)': prod.sku || '—',
      'معرف المنصة (ASIN)': prod.asin || '—',
      'اسم المنتج': prod.title,
      'العلامة التجارية': prod.brand || 'عام',
      'التصنيف': prod.category || 'عام',
      'منصة البيع': formatPlatformArabic(prod.platform),
      'سعر بيع المتجر (ج.م)': prod.merchantPrice,
      'تكلفة الجملة (ج.م)': prod.estimatedCostEGP ?? '—',
      'اسم أرخص منافس': prod.lowestCompetitorName || 'لا يوجد منافس مباشر',
      'سعر المنافس الحالي (ج.م)': prod.lowestCompetitorPrice,
      'سعر الـ Buy Box الحالي (ج.م)': prod.buyBoxPrice ?? prod.lowestCompetitorPrice,
      'فارق السعر عن المنافس (ج.م)': gap,
      'نسبة الفارق %': `${gapPercent > 0 ? '+' : ''}${gapPercent}%`,
      'حالة الـ Buy Box': isWinner ? 'نعم (فائز)' : 'لا (خاسر)',
      'حالة التسعير التنافسي': statusAr,
      'المخزون المتوفر': prod.stockQuantity ?? 'متوفر',
      'تاريخ ووقت الرصد': `${dateStr} ${timeStr}`,
    };
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(arabicRows);

  // Set column widths
  const cols = [
    { wch: 15 }, // SKU
    { wch: 15 }, // ASIN
    { wch: 35 }, // Title
    { wch: 15 }, // Brand
    { wch: 16 }, // Category
    { wch: 22 }, // Platform
    { wch: 18 }, // Merchant Price
    { wch: 18 }, // Cost
    { wch: 24 }, // Lowest Competitor
    { wch: 22 }, // Competitor Price
    { wch: 22 }, // BuyBox Price
    { wch: 22 }, // Gap EGP
    { wch: 15 }, // Gap %
    { wch: 16 }, // BuyBox Winner
    { wch: 22 }, // Status
    { wch: 15 }, // Stock
    { wch: 20 }, // Date
  ];
  ws['!cols'] = cols;

  XLSX.utils.book_append_sheet(wb, ws, 'أسعار المنافسين');

  // Trigger download via xlsx
  XLSX.writeFile(wb, `${filename}.${format}`, {
    bookType: format === 'xlsx' ? 'xlsx' : 'csv',
  });

  recordExportTimestamp();

  return { success: true, filename: `${filename}.${format}`, rowCount: arabicRows.length };
}

/**
 * Exports competitor price data from a single product's competitor offers list (used in CompetitorRadar)
 */
export function exportSingleProductCompetitorsToSpreadsheet(
  productTitle: string,
  merchantPrice: number,
  offers: any[],
  format: 'xlsx' | 'csv' = 'xlsx',
  currency: string = 'ج.م'
): { success: boolean; filename: string; rowCount: number } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const sanitizedTitle = productTitle.replace(/[/\\?%*:|"<>]/g, '').slice(0, 30).trim();
  const filename = `منافسو_${sanitizedTitle.replace(/\s+/g, '_')}_${dateStr}`;

  const lowestPrice = offers.length > 0 ? Math.min(...offers.map(o => o.price)) : merchantPrice;

  const arabicRows = offers.map((offer, index) => {
    const isLowest = offer.price === lowestPrice;
    const diffFromMerchant = offer.price - merchantPrice;
    const diffType = diffFromMerchant > 0 
      ? `المنافس أغلى بـ (+${diffFromMerchant.toLocaleString()} ${currency})`
      : diffFromMerchant < 0
      ? `المنافس أرخص بـ (${Math.abs(diffFromMerchant).toLocaleString()} ${currency})`
      : 'نفس السعر تماماً';

    return {
      'م': index + 1,
      'اسم المنتج': productTitle,
      'سعر بيع متجرك': `${merchantPrice.toLocaleString()} ${currency}`,
      'اسم المنافس / المتجر': offer.merchantName || 'منافس مجهول',
      'منصة البيع': offer.platformName || formatPlatformArabic(offer.platform),
      'سعر المنافس الحالي': `${offer.price.toLocaleString()} ${currency}`,
      'مقارنة بسعر متجرك': diffType,
      'الأرخص في السوق (Buy Box)': isLowest ? '⭐ نعم (الأرخص حالياً)' : 'لا',
      'مدة وتفاصيل الشحن': offer.deliveryTime || 'شحن قياسي',
      'تقييم البائع': offer.rating ? `⭐ ${offer.rating} (${offer.reviewCount || 0} تقييم)` : 'غير متوفر',
      'حالة توفر المخزون': offer.isInStock !== false ? 'متوفر بالمخزن' : 'غير متوفر / نافد',
      'تاريخ ووقت الفحص': `${dateStr} ${timeStr}`,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(arabicRows);

  ws['!cols'] = [
    { wch: 6 },  // #
    { wch: 35 }, // Product Title
    { wch: 18 }, // Merchant Price
    { wch: 25 }, // Competitor Name
    { wch: 20 }, // Platform
    { wch: 20 }, // Competitor Price
    { wch: 30 }, // Comparison
    { wch: 24 }, // Buy Box
    { wch: 22 }, // Shipping
    { wch: 20 }, // Rating
    { wch: 20 }, // Stock
    { wch: 20 }, // Date
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'قائمة أسعار المنافسين');

  XLSX.writeFile(wb, `${filename}.${format}`, {
    bookType: format === 'xlsx' ? 'xlsx' : 'csv',
  });

  recordExportTimestamp();

  return { success: true, filename: `${filename}.${format}`, rowCount: arabicRows.length };
}

/**
 * Exports products from ProfitCalculator table with pricing and competitor analysis
 */
export function exportProfitCalculatorProductsToSpreadsheet(
  products: any[],
  format: 'xlsx' | 'csv' = 'xlsx',
  currency: string = 'ج.م'
): { success: boolean; filename: string; rowCount: number } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const filename = `تقرير_بيانات_المنتجات_والاسعار_${dateStr}`;

  const arabicRows = products.map((item, idx) => {
    const comm = Math.round((item.sellingPrice * (item.commissionPercent || 0)) / 100);
    const deductions = comm + (item.shippingFee || 0) + (item.packagingFee || 0);
    const netProfit = item.sellingPrice - item.wholesaleCost - deductions;
    const marginPercent = item.sellingPrice > 0 ? Math.round((netProfit / item.sellingPrice) * 100) : 0;

    return {
      'م': idx + 1,
      'كود المنتج': item.id || `PRD-${idx + 1}`,
      'اسم المنتج': item.title,
      'الماركة': item.brand || 'عام',
      'التصنيف': item.category || 'عام',
      'منصة العرض': formatPlatformArabic(item.platform),
      'سعر البيع الحالي (ج.م)': item.sellingPrice,
      'تكلفة الشراء / الجملة (ج.م)': item.wholesaleCost,
      'نسبة عمولة المنصة %': `${item.commissionPercent}%`,
      'قيمة العمولة (ج.م)': comm,
      'رسوم الشحن والتغليف (ج.م)': (item.shippingFee || 0) + (item.packagingFee || 0),
      'صافي الربح التقديري (ج.م)': netProfit,
      'هامش الربح %': `${marginPercent}%`,
      'حالة الربحية': netProfit > 0 ? 'مربح ✅' : 'خاسر / حرج ⚠️',
      'تاريخ الاستخراج': `${dateStr} ${timeStr}`,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(arabicRows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'بيانات المنتجات والأسعار');

  XLSX.writeFile(wb, `${filename}.${format}`, {
    bookType: format === 'xlsx' ? 'xlsx' : 'csv',
  });

  recordExportTimestamp();

  return { success: true, filename: `${filename}.${format}`, rowCount: arabicRows.length };
}

/**
 * Exports AutoPricingExecutionLog array to Excel or CSV
 */
export function exportAutoPricingHistoryToSpreadsheet(
  logs: any[],
  format: 'xlsx' | 'csv' = 'xlsx'
): { success: boolean; filename: string; rowCount: number } {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `سجل_تاريخ_التسعير_الآلي_${dateStr}_${timeStr}`;

  const arabicRows = logs.map((log, idx) => ({
    '#': idx + 1,
    'تاريخ ووقت التنفيذ': log.timestamp,
    'رمز المنتج (SKU)': log.sku || 'N/A',
    'اسم المنتج': log.productTitle,
    'القاعدة المطبقة': log.ruleTitle,
    'الحدث المشغل (إذا حدث X)': log.triggerEventAr,
    'الإجراء المنفذ (قم بـ Y)': log.actionTakenAr,
    'السعر السابق (ج.م)': log.previousPrice,
    'السعر الجديد (ج.م)': log.newPrice,
    'فارق السعر (ج.م)': log.priceDifference,
    'سعر المنافس (ج.م)': log.competitorPrice,
    'اسم المنافس': log.competitorName,
    'منصة المنافس': log.competitorPlatform,
    'الحد الأدنى للسعر (Floor)': log.floorPrice,
    'الحد الأقصى (Ceiling)': log.ceilingPrice,
    'صافي الربح التقديري (ج.م)': log.estimatedNetProfit,
    'هامش الربح %': `${log.estimatedNetMarginPercent}%`,
    'حالة صمام الأمان': log.guardrailStatusLabelAr,
    'المنصات المتأثرة': Array.isArray(log.platformsAffected) ? log.platformsAffected.join(' | ') : log.platformsAffected,
    'نمط التنفيذ': log.executionMode === 'automated' ? 'تلقائي ذكي ⚡' : 'محاكاة يدوية 🧪'
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(arabicRows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 16 },
    { wch: 35 },
    { wch: 25 },
    { wch: 40 },
    { wch: 35 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 35 },
    { wch: 25 },
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'سجل التغيرات السعرية');

  XLSX.writeFile(wb, `${filename}.${format}`, {
    bookType: format === 'xlsx' ? 'xlsx' : 'csv',
  });

  recordExportTimestamp();

  return { success: true, filename: `${filename}.${format}`, rowCount: arabicRows.length };
}

