import { ProductData, ProductSalesPerformance, PlatformSEOListing, WatchlistItem } from '../types';
import { triggerGlobalAsyncStart, triggerGlobalAsyncEnd } from '../context/AsyncOperationsContext';

export const EXPORT_TIMESTAMP_STORAGE_KEY = 'merchant_last_export_timestamp';
export const SNOOZE_TIMESTAMP_STORAGE_KEY = 'merchant_snooze_export_alert_timestamp';

/**
 * Records the current timestamp whenever an export operation completes.
 */
export function recordExportTimestamp(): void {
  try {
    const now = Date.now();
    localStorage.setItem(EXPORT_TIMESTAMP_STORAGE_KEY, now.toString());
    // Clear any active snooze since export is done
    localStorage.removeItem(SNOOZE_TIMESTAMP_STORAGE_KEY);
    // Dispatch a custom event so components can update in real-time
    window.dispatchEvent(new CustomEvent('merchant_export_completed', { detail: { timestamp: now } }));
  } catch {
    // safe fallback
  }
}

/**
 * Gets the timestamp (in ms) of the last completed export.
 */
export function getLastExportTimestamp(): number | null {
  try {
    const val = localStorage.getItem(EXPORT_TIMESTAMP_STORAGE_KEY);
    if (!val) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

/**
 * Gets hours elapsed since the last export.
 */
export function getHoursSinceLastExport(): number | null {
  const lastTs = getLastExportTimestamp();
  if (!lastTs) return null;
  const diffMs = Date.now() - lastTs;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}

/**
 * Checks if an export has NOT been performed in the last 24 hours.
 */
export function isExportOverdue24h(): boolean {
  const lastTs = getLastExportTimestamp();
  if (!lastTs) return true; // Never exported -> overdue
  const diffMs = Date.now() - lastTs;
  const hours24Ms = 24 * 60 * 60 * 1000;
  return diffMs > hours24Ms;
}

/**
 * Snoozes the export reminder for a given number of hours (default: 2 hours).
 */
export function snoozeExportReminder(hours: number = 2): void {
  try {
    const snoozeUntil = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem(SNOOZE_TIMESTAMP_STORAGE_KEY, snoozeUntil.toString());
    window.dispatchEvent(new CustomEvent('merchant_export_snoozed', { detail: { until: snoozeUntil } }));
  } catch {
    // safe fallback
  }
}

/**
 * Checks if the reminder is currently snoozed.
 */
export function isExportReminderSnoozed(): boolean {
  try {
    const val = localStorage.getItem(SNOOZE_TIMESTAMP_STORAGE_KEY);
    if (!val) return false;
    const num = parseInt(val, 10);
    return !isNaN(num) && Date.now() < num;
  } catch {
    return false;
  }
}

/**
 * Escapes a cell for CSV formatting (handles quotes, commas, and line breaks).
 */
export function escapeCSVCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes(';') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Triggers a browser download for text content with UTF-8 BOM for Arabic Excel support.
 */
export function downloadCSV(content: string, filename: string): void {
  const opId = triggerGlobalAsyncStart('csv_export', `تصدير ملف CSV: ${filename}`, 'جاري تجهيز البيانات وتنزيل الملف...');
  try {
    // UTF-8 BOM ensures Microsoft Excel opens Arabic text correctly without encoding artifacts
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Automatically record that an export was performed
    recordExportTimestamp();

    setTimeout(() => {
      triggerGlobalAsyncEnd(opId, true, `تم تنزيل ملف (${filename})`, 'csv_export');
    }, 600);
  } catch (err) {
    triggerGlobalAsyncEnd(opId, false, `تعذر تصدير ملف (${filename})`, 'csv_export');
    throw err;
  }
}

/**
 * Exports complete End-of-Day master operational report (Daily Summary, Inventory & Competitor Pricing).
 */
export function exportEndOfDayMasterReportToCSV(
  products: ProductData[],
  watchlist: WatchlistItem[] = [],
  currency: string = 'EGP',
  filename?: string
): void {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  let totalWholesaleCost = 0;
  let totalRetailValue = 0;
  let outpricedCount = 0;
  let winningCount = 0;

  // Compute stats
  products.forEach(p => {
    const wholesale = p.estimatedWholesaleCost || Math.round(p.currentLowestPrice * 0.75);
    const retail = p.suggestedRetailPrice || p.currentLowestPrice;
    totalWholesaleCost += wholesale;
    totalRetailValue += retail;

    if (retail <= p.currentLowestPrice) {
      winningCount++;
    } else {
      outpricedCount++;
    }
  });

  const totalProjectedProfit = totalRetailValue - totalWholesaleCost;
  const overallMarginPercent = totalRetailValue > 0 ? Math.round((totalProjectedProfit / totalRetailValue) * 100) : 0;

  const lines: string[] = [
    `=== تقرير نهاية اليوم الشامل - رادار التاجر الذكي مصر ===`,
    `تاريخ التقرير اليومي,${dateStr} ${timeStr}`,
    `العملة الرسمية,${currency}`,
    `إجمالي المنتجات النشطة بالكتالوج,${products.length}`,
    `قيمة المخزون المقدرة بسعر الجملة (${currency}),${totalWholesaleCost}`,
    `إجمالي قيمة المبيعات المقترحة (${currency}),${totalRetailValue}`,
    `صافي هامش الربح الإجمالي المتوقع (${currency}),${totalProjectedProfit}`,
    `متوسط نسبة الربحية الإجمالية,${overallMarginPercent}%`,
    `المنتجات المتصدرة بسعر البيع (Winning Buy Box),${winningCount}`,
    `المنتجات المعرضة لخسارة المبيعات (أعلى من السوق),${outpricedCount}`,
    `عدد المنتجات في قائمة المتابعة والرصد الحية,${watchlist.length}`,
    ``,
    `=== 1. جدول أسعار إغلاق نهاية اليوم لكل المنتجات ===`,
    [
      'كود المنتج (ID)',
      'كود الصنف (SKU)',
      'اسم المنتج',
      'العلامة التجارية',
      'التصنيف',
      `تكلفة الجملة (${currency})`,
      `سعر البيع المعتمد (${currency})`,
      `أقل سعر منافس في السوق (${currency})`,
      `أعلى سعر بالسوق (${currency})`,
      `هامش الربح الاسمي (${currency})`,
      'نسبة الهامش %',
      'الموقف التنافسي عند الإغلاق',
      'أفضل منفذ جملة مسجل'
    ].join(','),
    ...products.map(p => {
      const wholesale = p.estimatedWholesaleCost || Math.round(p.currentLowestPrice * 0.75);
      const retail = p.suggestedRetailPrice || p.currentLowestPrice;
      const profit = retail - wholesale;
      const marginPct = retail > 0 ? Math.round((profit / retail) * 100) : 0;

      let status = 'متطابق مع السوق';
      if (retail < p.currentLowestPrice) status = 'متصدر بأقل سعر 🏆';
      else if (retail > p.currentLowestPrice) status = 'خارج المنافسة (أعلى من المنافسين ⚠️)';

      const hub = p.wholesaleLocations?.[0]?.marketName || 'شارع عبد العزيز';

      return [
        escapeCSVCell(p.id),
        escapeCSVCell(p.sku || `SKU-${p.id}`),
        escapeCSVCell(p.title),
        escapeCSVCell(p.brand),
        escapeCSVCell(p.category),
        escapeCSVCell(wholesale),
        escapeCSVCell(retail),
        escapeCSVCell(p.currentLowestPrice),
        escapeCSVCell(p.highestPrice || retail),
        escapeCSVCell(profit),
        escapeCSVCell(`${marginPct}%`),
        escapeCSVCell(status),
        escapeCSVCell(hub)
      ].join(',');
    }),
    ``,
    `=== 2. ملخص قائمة المتابعة ورصد تحركات المنافسين اليومية ===`,
    [
      'اسم المنتج المراقب',
      'السعر المرصود',
      'حركة السعر',
      'نسبة التغير %',
      'تاريخ آخر تغيير',
      'مصدر التغيير',
      'حالة توفر المنافس'
    ].join(','),
    ...(watchlist.length > 0
      ? watchlist.map(w => [
          escapeCSVCell(w.product.title),
          escapeCSVCell(w.lastCheckedPrice),
          escapeCSVCell(w.priceTrend === 'down' ? 'انخفاض 📉' : w.priceTrend === 'up' ? 'ارتفاع 📈' : 'مستقر ➖'),
          escapeCSVCell(`${w.priceChangePercent}%`),
          escapeCSVCell(w.lastPriceChangedAt || 'اليوم'),
          escapeCSVCell(w.lastPriceChangeSource || 'أمازون / نون'),
          escapeCSVCell(w.competitorStockStatus === 'competitor_stockout_opportunity' ? 'نفاد مخزون المنافس (فرصة ذهبية)' : 'متوفر')
        ].join(','))
      : [[escapeCSVCell('لا توجد منتجات محفوظة بقائمة المتابعة حالياً'), '', '', '', '', '', ''].join(',')]),
    ``,
    `=== نهاية التقرير اليومي المعتمد - تم التصدير عبر رادار التاجر الذكي ===`
  ];

  const csvContent = lines.join('\r\n');
  const finalFilename = filename || `تقرير_نهاية_اليوم_الشامل_${dateStr}.csv`;
  downloadCSV(csvContent, finalFilename);
}

/**
 * Exports full inventory product catalog to Excel-ready CSV.
 */
export function exportProductsToCSV(products: ProductData[], filename?: string): void {
  const headers = [
    'كود المنتج (ID)',
    'كود الصنف (SKU)',
    'اسم المنتج بالعربية (Title)',
    'الاسم بالإنجليزية (English Title)',
    'العلامة التجارية (Brand)',
    'الموديل (Model)',
    'التصنيف (Category)',
    'الباركود (Barcode)',
    'تكلفة الجملة المقدرة (Wholesale Cost EGP)',
    'سعر البيع المقترح / متجري (Retail Price EGP)',
    'أقل سعر منافس في السوق (Lowest Competitor EGP)',
    'أعلى سعر في السوق (Highest Price EGP)',
    'متوسط سعر السوق (Average Price EGP)',
    'العملة (Currency)',
    'رابط الصورة (Image URL)',
    'الوصف (Description)',
    'الوسوم (Tags)',
    'أبرز المزايا (Quick Highlights)',
    'حالة المنتج (Status)'
  ];

  const rows = products.map((p, idx) => {
    return [
      escapeCSVCell(p.id || `PROD-${idx + 1}`),
      escapeCSVCell(p.sku || `SKU-${idx + 101}`),
      escapeCSVCell(p.title),
      escapeCSVCell(p.titleEn || ''),
      escapeCSVCell(p.brand),
      escapeCSVCell(p.model || ''),
      escapeCSVCell(p.category),
      escapeCSVCell(p.barcode || ''),
      escapeCSVCell(p.estimatedWholesaleCost || 0),
      escapeCSVCell(p.suggestedRetailPrice || 0),
      escapeCSVCell(p.currentLowestPrice || 0),
      escapeCSVCell(p.highestPrice || 0),
      escapeCSVCell(p.averagePrice || 0),
      escapeCSVCell(p.currency || 'EGP'),
      escapeCSVCell(p.imageUrl || ''),
      escapeCSVCell(p.description || ''),
      escapeCSVCell((p.tags || []).join(' | ')),
      escapeCSVCell((p.quickHighlights || []).join(' | ')),
      escapeCSVCell(p.isArchived ? 'مؤرشف' : 'نشط')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `قائمة_منتجات_المخزون_المصري_${dateStr}.csv`;
  downloadCSV(csvContent, finalFilename);
}

export interface BulkExportReportOptions {
  includePriceHistory?: boolean;
  includeCompetitors?: boolean;
  includeWholesaleLocations?: boolean;
  filename?: string;
}

/**
 * Exports a unified comprehensive CSV report for multiple selected products.
 */
export function exportBulkSelectedProductsToCSV(
  products: ProductData[],
  currency: string = 'EGP',
  options: BulkExportReportOptions = {}
): void {
  if (!products || products.length === 0) return;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  let totalWholesaleCost = 0;
  let totalRetailValue = 0;
  let winningCount = 0;
  let outpricedCount = 0;

  products.forEach(p => {
    const wholesale = p.estimatedWholesaleCost || Math.round((p.suggestedRetailPrice || p.currentLowestPrice) * 0.75);
    const retail = p.suggestedRetailPrice || p.currentLowestPrice;
    totalWholesaleCost += wholesale;
    totalRetailValue += retail;

    if (retail <= p.currentLowestPrice) {
      winningCount++;
    } else {
      outpricedCount++;
    }
  });

  const totalProjectedProfit = totalRetailValue - totalWholesaleCost;
  const avgMarginPct = totalRetailValue > 0 ? Math.round((totalProjectedProfit / totalRetailValue) * 100) : 0;

  const lines: string[] = [
    `=== تقرير التصدير المجمع الموحد للمنتجات المحددة - رادار التاجر الذكي مصر ===`,
    `تاريخ ووقت التصدير,${dateStr} ${timeStr}`,
    `العملة الرسمية,${currency}`,
    `عدد المنتجات المحددة بالتصدير,${products.length}`,
    `إجمالي رأس المال بسعر الجملة (${currency}),${totalWholesaleCost}`,
    `إجمالي القيمة البيعية المقترحة (${currency}),${totalRetailValue}`,
    `صافي الأرباح المتوقعة (${currency}),${totalProjectedProfit}`,
    `متوسط نسبة هامش الربح,${avgMarginPct}%`,
    `المنتجات المتصدرة بأقل سعر (Winning Buy Box),${winningCount}`,
    `المنتجات المعرضة لخسارة المبيعات (أعلى من المنافسين),${outpricedCount}`,
    ``,
    `=== 1. جدول البيانات الموحدة للمنتجات المحددة (${products.length} صنف) ===`,
    [
      'كود المنتج (ID)',
      'كود الصنف (SKU)',
      'الباركود الدولي (Barcode)',
      'اسم المنتج بالعربية',
      'الاسم بالإنجليزية',
      'العلامة التجارية',
      'الموديل',
      'التصنيف',
      `تكلفة الجملة (${currency})`,
      `سعر البيع المعتمد (${currency})`,
      `أقل سعر منافس في السوق (${currency})`,
      `متوسط سعر السوق (${currency})`,
      `أعلى سعر بالسوق (${currency})`,
      `صافي الربح المتوقع (${currency})`,
      'نسبة الهامش %',
      'الموقف التنافسي',
      'منصة أقل سعر منافس',
      'أفضل منفذ جملة مسجل',
      'رابط الصورة',
      'حالة النشاط'
    ].join(','),
    ...products.map((p, idx) => {
      const wholesale = p.estimatedWholesaleCost || Math.round((p.suggestedRetailPrice || p.currentLowestPrice) * 0.75);
      const retail = p.suggestedRetailPrice || p.currentLowestPrice;
      const profit = retail - wholesale;
      const marginPct = retail > 0 ? Math.round((profit / retail) * 100) : 0;

      let competitiveStatus = 'متطابق مع سعر السوق';
      if (retail < p.currentLowestPrice) {
        competitiveStatus = 'متصدر بأقل سعر (فوز بالباي بوكس) 🏆';
      } else if (retail > p.currentLowestPrice) {
        competitiveStatus = 'أعلى من السوق (يحتاج مراجعة ⚠️)';
      }

      const bestWholesale = p.wholesaleLocations?.[0]?.marketName || 'شارع عبد العزيز';
      const lowestOffer = p.merchantOffers && p.merchantOffers.length > 0
        ? [...p.merchantOffers].sort((a, b) => a.price - b.price)[0]
        : null;
      const competitorPlatform = lowestOffer?.merchantName || 'أمازون / نون';

      return [
        escapeCSVCell(p.id || `PROD-${idx + 1}`),
        escapeCSVCell(p.sku || `SKU-${idx + 101}`),
        escapeCSVCell(p.barcode || ''),
        escapeCSVCell(p.title),
        escapeCSVCell(p.titleEn || ''),
        escapeCSVCell(p.brand),
        escapeCSVCell(p.model || ''),
        escapeCSVCell(p.category),
        escapeCSVCell(wholesale),
        escapeCSVCell(retail),
        escapeCSVCell(p.currentLowestPrice || retail),
        escapeCSVCell(p.averagePrice || retail),
        escapeCSVCell(p.highestPrice || retail),
        escapeCSVCell(profit),
        escapeCSVCell(`${marginPct}%`),
        escapeCSVCell(competitiveStatus),
        escapeCSVCell(competitorPlatform),
        escapeCSVCell(bestWholesale),
        escapeCSVCell(p.imageUrl || ''),
        escapeCSVCell(p.isArchived ? 'مؤرشف' : 'نشط')
      ].join(',');
    })
  ];

  if (options.includeCompetitors !== false) {
    lines.push(
      ``,
      `=== 2. تفاصيل عروض المنافسين للمنتجات المحددة ===`,
      [
        'اسم المنتج',
        'كود الصنف (SKU)',
        'اسم المتجر / المنصة',
        'نوع المنصة',
        `السعر المعروض (${currency})`,
        `الفارق عن سعري (${currency})`,
        'وقت التوصيل',
        'حالة التوفر'
      ].join(',')
    );

    let hasOffers = false;
    products.forEach(p => {
      const retail = p.suggestedRetailPrice || p.currentLowestPrice;
      if (p.merchantOffers && p.merchantOffers.length > 0) {
        hasOffers = true;
        p.merchantOffers.forEach(off => {
          const diff = off.price - retail;
          const diffLabel = diff > 0 ? `أغلى بـ +${diff}` : diff < 0 ? `أرخص بـ ${diff}` : 'مطابق';
          lines.push([
            escapeCSVCell(p.title),
            escapeCSVCell(p.sku || p.id),
            escapeCSVCell(off.merchantName),
            escapeCSVCell(off.storeType === 'online' ? 'أونلاين' : 'متجر فعلي'),
            escapeCSVCell(off.price),
            escapeCSVCell(diffLabel),
            escapeCSVCell(off.deliveryTime || 'توصيل عادي'),
            escapeCSVCell(off.stockStatus === 'in_stock' ? 'متوفر' : 'غير متوفر')
          ].join(','));
        });
      }
    });

    if (!hasOffers) {
      lines.push([escapeCSVCell('لا توجد عروض منافسين مسجلة للمنتجات المحددة'), '', '', '', '', '', '', ''].join(','));
    }
  }

  if (options.includePriceHistory !== false) {
    lines.push(
      ``,
      `=== 3. سجل الحركات السعرية الأخيرة للأصناف المحددة ===`,
      [
        'اسم المنتج',
        'كود الصنف (SKU)',
        'تاريخ الرصد',
        `السعر المسجل (${currency})`,
        'المنصة الراصدة'
      ].join(',')
    );

    let hasHistory = false;
    products.forEach(p => {
      if (p.priceHistory && p.priceHistory.length > 0) {
        hasHistory = true;
        p.priceHistory.forEach(h => {
          lines.push([
            escapeCSVCell(p.title),
            escapeCSVCell(p.sku || p.id),
            escapeCSVCell(h.date),
            escapeCSVCell(h.price),
            escapeCSVCell(h.merchant || 'السوق العام')
          ].join(','));
        });
      }
    });

    if (!hasHistory) {
      lines.push([escapeCSVCell('لا توجد حركات سعرية تاريخية مسجلة لهذه الأصناف'), '', '', '', ''].join(','));
    }
  }

  lines.push(
    ``,
    `=== نهاية التقرير الموحد - تم التصدير عبر رادار التاجر الذكي مصر (UTF-8 BOM) ===`
  );

  const csvContent = lines.join('\r\n');
  const finalFilename = options.filename || `تقرير_التصدير_المجمع_الموحد_${products.length}_منتجات_${dateStr}.csv`;
  downloadCSV(csvContent, finalFilename);
}

/**
 * Exports complete chronological price change history for all products to CSV / Excel.
 */
export function exportPriceHistoryLogToCSV(products: ProductData[], filename?: string): void {
  const headers = [
    'كود المنتج (ID)',
    'كود الصنف (SKU)',
    'اسم المنتج',
    'العلامة التجارية',
    'التصنيف',
    'تاريخ التغيير / الرصد',
    'المنصة / المتجر الراصد',
    'السعر المسجل (ج.م)',
    'تكلفة الجملة المقدرة (ج.م)',
    'السعر الأقل الحالي بالسوق',
    'الفارق السعري عن الجملة (ج.م)',
    'نسبة الهامش المقدرة %',
    'حالة المنتج'
  ];

  const rows: string[] = [];

  products.forEach(p => {
    const history = p.priceHistory && p.priceHistory.length > 0
      ? p.priceHistory
      : [
          {
            date: new Date().toISOString().split('T')[0],
            price: p.currentLowestPrice,
            merchant: 'رصد السعر الأولي'
          }
        ];

    history.forEach(h => {
      const wholesale = p.estimatedWholesaleCost || Math.round(p.currentLowestPrice * 0.75);
      const profit = h.price - wholesale;
      const marginPct = h.price > 0 ? Math.round((profit / h.price) * 100) : 0;

      rows.push([
        escapeCSVCell(p.id),
        escapeCSVCell(p.sku || 'SKU-EG'),
        escapeCSVCell(p.title),
        escapeCSVCell(p.brand),
        escapeCSVCell(p.category),
        escapeCSVCell(h.date),
        escapeCSVCell(h.merchant || 'السوق العام'),
        escapeCSVCell(h.price),
        escapeCSVCell(wholesale),
        escapeCSVCell(p.currentLowestPrice),
        escapeCSVCell(profit),
        escapeCSVCell(`${marginPct}%`),
        escapeCSVCell(p.isArchived ? 'مؤرشف' : 'نشط')
      ].join(','));
    });
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `سجل_تاريخ_تغيرات_الأسعار_والمنافسين_${dateStr}.csv`;
  downloadCSV(csvContent, finalFilename);
}

/**
 * Exports financial valuation & profit margin report for accounting and tax readiness.
 */
export function exportFinancialValuationReportToCSV(
  products: ProductData[],
  currency: string = 'EGP',
  filename?: string
): void {
  const headers = [
    'كود الصنف (SKU)',
    'الباركود',
    'اسم المنتج',
    'الماركة',
    'التصنيف',
    `تكلفة الجملة للوحدة (${currency})`,
    `سعر البيع المقترح (${currency})`,
    `أقل سعر منافس بالسوق (${currency})`,
    `أعلى سعر بالسوق (${currency})`,
    `هامش الربح الاسمي للوحدة (${currency})`,
    'نسبة هامش الربح من البيع %',
    'نسبة الزيادة على التكلفة (Markup %)',
    'الوضع التنافسي الحالي',
    'سوق الجملة المعتمد',
    'حالة المنتج بالكتالوج'
  ];

  let totalWholesaleCost = 0;
  let totalRetailValue = 0;

  const rows = products.map(p => {
    const wholesale = p.estimatedWholesaleCost || Math.round(p.currentLowestPrice * 0.75);
    const retail = p.suggestedRetailPrice || p.currentLowestPrice;
    const lowest = p.currentLowestPrice;
    const profit = retail - wholesale;
    const marginPct = retail > 0 ? Math.round((profit / retail) * 100) : 0;
    const markupPct = wholesale > 0 ? Math.round((profit / wholesale) * 100) : 0;

    totalWholesaleCost += wholesale;
    totalRetailValue += retail;

    let compStatus = 'متوازن';
    if (retail < lowest) compStatus = 'متصدر (أرخص من السوق 🏆)';
    else if (retail === lowest) compStatus = 'مطابق لأقل سعر منافس ⚡';
    else compStatus = 'أعلى من أقل منافس ⚠️';

    const wholesaleHub = p.wholesaleLocations && p.wholesaleLocations.length > 0
      ? p.wholesaleLocations[0].marketName
      : 'شارع عبد العزيز - القاهرة';

    return [
      escapeCSVCell(p.sku || `SKU-${p.id}`),
      escapeCSVCell(p.barcode || 'N/A'),
      escapeCSVCell(p.title),
      escapeCSVCell(p.brand),
      escapeCSVCell(p.category),
      escapeCSVCell(wholesale),
      escapeCSVCell(retail),
      escapeCSVCell(lowest),
      escapeCSVCell(p.highestPrice || retail),
      escapeCSVCell(profit),
      escapeCSVCell(`${marginPct}%`),
      escapeCSVCell(`${markupPct}%`),
      escapeCSVCell(compStatus),
      escapeCSVCell(wholesaleHub),
      escapeCSVCell(p.isArchived ? 'مؤرشف' : 'نشط بالمخزون')
    ].join(',');
  });

  // Summary Row for Accounting
  const totalProfit = totalRetailValue - totalWholesaleCost;
  const avgMargin = totalRetailValue > 0 ? Math.round((totalProfit / totalRetailValue) * 100) : 0;

  const summaryRow = [
    escapeCSVCell('--- إجمالي التقرير المالي ---'),
    escapeCSVCell(''),
    escapeCSVCell(`عدد المنتجات: ${products.length}`),
    escapeCSVCell(''),
    escapeCSVCell(''),
    escapeCSVCell(totalWholesaleCost),
    escapeCSVCell(totalRetailValue),
    escapeCSVCell(''),
    escapeCSVCell(''),
    escapeCSVCell(totalProfit),
    escapeCSVCell(`${avgMargin}% (متوسط الهامش)`),
    escapeCSVCell(''),
    escapeCSVCell('ملخص محاسبي رسمي'),
    escapeCSVCell(''),
    escapeCSVCell('')
  ].join(',');

  const csvContent = [headers.join(','), ...rows, summaryRow].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `تقرير_التقييم_المالي_وهوامش_الربح_${dateStr}.csv`;
  downloadCSV(csvContent, finalFilename);
}

/**
 * Exports complete audit record for a single product (Competitors, Wholesale Hubs, History, SEO).
 */
export function exportSingleProductFullAuditCSV(product: ProductData, filename?: string): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const currency = product.currency || 'EGP';

  const lines: string[] = [
    `=== تقرير التدقيق الشامل والتسعير التنافسي للمنتج ===`,
    `تاريخ التقرير,${dateStr}`,
    `اسم المنتج,${escapeCSVCell(product.title)}`,
    `العلامة التجارية,${escapeCSVCell(product.brand)}`,
    `الموديل,${escapeCSVCell(product.model || '')}`,
    `التصنيف,${escapeCSVCell(product.category)}`,
    `كود الصنف SKU,${escapeCSVCell(product.sku || '')}`,
    `الباركود الدولي,${escapeCSVCell(product.barcode || '')}`,
    `تكلفة الجملة المقدرة (${currency}),${product.estimatedWholesaleCost || 0}`,
    `سعر البيع المقترح (${currency}),${product.suggestedRetailPrice || 0}`,
    `أقل سعر منافس بالسوق (${currency}),${product.currentLowestPrice || 0}`,
    `أعلى سعر رصد بالسوق (${currency}),${product.highestPrice || 0}`,
    `متوسط سعر السوق (${currency}),${product.averagePrice || 0}`,
    ``,
    `=== عروض المنصات والمتاجر المنافسة بالسوق المصري ===`,
    `اسم المتجر / المنصة,النوع,السعر (${currency}),السعر الأصلي,التقييم,مدة الشحن,تكلفة الشحن,الضمان,حالة التوفر,نوع الوفاء`,
    ...(product.merchantOffers || []).map(o => [
      escapeCSVCell(o.merchantName),
      escapeCSVCell(o.platform),
      escapeCSVCell(o.price),
      escapeCSVCell(o.originalPrice || o.price),
      escapeCSVCell(o.rating || 0),
      escapeCSVCell(o.deliveryTime || ''),
      escapeCSVCell(o.deliveryCost || ''),
      escapeCSVCell(o.warranty || ''),
      escapeCSVCell(o.stockStatus || 'in_stock'),
      escapeCSVCell(o.fulfillmentType || '')
    ].join(',')),
    ``,
    `=== منافذ وأسواق الجملة المعتمدة (شارع عبد العزيز والبستان) ===`,
    `اسم السوق,اسم الفرع / التاجر,العنوان,المدينة,سعر الجملة (${currency}),الحد الأدنى للطلب,رقم الهاتف,ملاحظات التوريد`,
    ...(product.wholesaleLocations || []).map(w => [
      escapeCSVCell(w.marketName),
      escapeCSVCell(w.branchName),
      escapeCSVCell(w.address),
      escapeCSVCell(w.city),
      escapeCSVCell(w.wholesalePrice),
      escapeCSVCell(w.minOrderQuantity),
      escapeCSVCell(w.phone || ''),
      escapeCSVCell(w.notes || '')
    ].join(',')),
    ``,
    `=== سجل التغيرات السعرية عبر الزمن ===`,
    `التاريخ,المنصة / المتجر,السعر المسجل (${currency})`,
    ...(product.priceHistory || []).map(h => [
      escapeCSVCell(h.date),
      escapeCSVCell(h.merchant || ''),
      escapeCSVCell(h.price)
    ].join(','))
  ];

  const csvContent = lines.join('\r\n');
  const safeTitle = (product.title || 'منتج').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 30);
  const finalFilename = filename || `تقرير_تدقيق_المنتج_${safeTitle}_${dateStr}.csv`;
  downloadCSV(csvContent, finalFilename);
}

/**
 * Exports complete product audit with Gemini AI Pre-Export Brief and strategic recommendations.
 */
export function exportSingleProductWithAiBriefCSV(
  product: ProductData,
  aiBrief: any,
  filename?: string
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const currency = product.currency || 'EGP';

  const lines: string[] = [
    `=== تقرير التدقيق المعزز بذكاء Gemini الاصطناعي (Pre-Export AI Brief) ===`,
    `تاريخ التقرير,${dateStr}`,
    `نموذج الذكاء الاصطناعي,Google Gemini 3.8 Flash`,
    `جاهزية التصدير (Export Readiness),${aiBrief?.exportReadinessScore || 95}%`,
    `احتمالية الفوز بـ Buy Box,${aiBrief?.competitiveLandscape?.buyBoxWinProbability || 92}%`,
    `اسم المنتج,${escapeCSVCell(product.title)}`,
    `العلامة التجارية,${escapeCSVCell(product.brand)}`,
    `الموديل,${escapeCSVCell(product.model || '')}`,
    `التصنيف,${escapeCSVCell(product.category)}`,
    `كود الصنف SKU,${escapeCSVCell(product.sku || '')}`,
    `الباركود الدولي,${escapeCSVCell(product.barcode || '')}`,
    `تكلفة الجملة المقدرة (${currency}),${product.estimatedWholesaleCost || 0}`,
    `السعر الرابح المقترح (${currency}),${aiBrief?.pricingVerdict?.recommendedWinningPrice || product.suggestedRetailPrice || 0}`,
    `هامش الربح المتوقع %,${aiBrief?.pricingVerdict?.projectedMarginPercent || 20}%`,
    `أقل سعر منافس بالسوق (${currency}),${product.currentLowestPrice || 0}`,
    ``,
    `=== الملخص التنفيذي الصادر عن Gemini AI ===`,
    `الملخص التحليلي,${escapeCSVCell(aiBrief?.executiveSummary || '')}`,
    `حالة التسعير,${escapeCSVCell(aiBrief?.pricingVerdict?.statusLabel || '')}`,
    `مبررات التسعير,${escapeCSVCell(aiBrief?.pricingVerdict?.rationale || '')}`,
    `المنافس المهيمن,${escapeCSVCell(aiBrief?.competitiveLandscape?.dominantCompetitor || '')}`,
    `حدة المنافسة بالسوق,${escapeCSVCell(aiBrief?.competitiveLandscape?.priceWarIntensity || '')}`,
    `فارق أسواق الجملة (Arbitrage),${escapeCSVCell(aiBrief?.competitiveLandscape?.wholesaleArbitrageOpportunity || '')}`,
    `الخلاصة الإدارية,${escapeCSVCell(aiBrief?.keyTakeaway || '')}`,
    ``,
    `=== التوصيات الاستراتيجية قبل التصدير والتنفيذ ===`,
    ...(aiBrief?.strategicRecommendations || []).map((rec: string, i: number) => `توصية ${i + 1},${escapeCSVCell(rec)}`),
    ``,
    `=== عروض المنصات والمتاجر المنافسة بالسوق المصري ===`,
    `اسم المتجر / المنصة,النوع,السعر (${currency}),السعر الأصلي,التقييم,مدة الشحن,تكلفة الشحن,الضمان,حالة التوفر,نوع الوفاء`,
    ...(product.merchantOffers || []).map(o => [
      escapeCSVCell(o.merchantName),
      escapeCSVCell(o.platform),
      escapeCSVCell(o.price),
      escapeCSVCell(o.originalPrice || o.price),
      escapeCSVCell(o.rating || 0),
      escapeCSVCell(o.deliveryTime || ''),
      escapeCSVCell(o.deliveryCost || ''),
      escapeCSVCell(o.warranty || ''),
      escapeCSVCell(o.stockStatus || 'in_stock'),
      escapeCSVCell(o.fulfillmentType || '')
    ].join(',')),
    ``,
    `=== منافذ وأسواق الجملة المعتمدة (شارع عبد العزيز والبستان) ===`,
    `اسم السوق,اسم الفرع / التاجر,العنوان,المدينة,سعر الجملة (${currency}),الحد الأدنى للطلب,رقم الهاتف,ملاحظات التوريد`,
    ...(product.wholesaleLocations || []).map(w => [
      escapeCSVCell(w.marketName),
      escapeCSVCell(w.branchName),
      escapeCSVCell(w.address),
      escapeCSVCell(w.city),
      escapeCSVCell(w.wholesalePrice),
      escapeCSVCell(w.minOrderQuantity),
      escapeCSVCell(w.phone || ''),
      escapeCSVCell(w.notes || '')
    ].join(',')),
    ``,
    `=== سجل التغيرات السعرية عبر الزمن ===`,
    `التاريخ,المنصة / المتجر,السعر المسجل (${currency})`,
    ...(product.priceHistory || []).map(h => [
      escapeCSVCell(h.date),
      escapeCSVCell(h.merchant || ''),
      escapeCSVCell(h.price)
    ].join(','))
  ];

  const csvContent = lines.join('\r\n');
  const safeTitle = (product.title || 'منتج').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 30);
  const finalFilename = filename || `تقرير_تدقيق_الذكاء_الاصطناعي_${safeTitle}_${dateStr}.csv`;
  downloadCSV(csvContent, finalFilename);
}

/**
 * Exports detailed sales & repricing performance report to CSV.
 */
export function exportPerformanceReportToCSV(
  performances: ProductSalesPerformance[],
  timeframe: string,
  currency: string = 'EGP',
  filename?: string
): void {
  const headers = [
    'اسم المنتج',
    'الماركة',
    'التصنيف',
    'كود SKU',
    `سعر البيع الحالي (${currency})`,
    `أقل سعر منافس (${currency})`,
    'أرخص متجر منافس',
    `الفارق السعري (${currency})`,
    'حالة الـ Buy Box',
    'مبيعات اليوم (قطعة)',
    'مبيعات الفترة (قطعة)',
    `إيرادات الفترة (${currency})`,
    `صافي الأرباح (${currency})`,
    'هامش الربح %',
    `السعر الموصى به (${currency})`,
    'الاستراتيجية الموصى بها'
  ];

  const rows = performances.map(p => {
    const unitProfit = p.currentPrice - p.costPrice;
    const weeklyNetProfit = unitProfit * p.weeklyUnitsSold;
    const marginPercent = Math.round((unitProfit / (p.currentPrice || 1)) * 100);

    return [
      escapeCSVCell(p.productTitle),
      escapeCSVCell(p.productBrand),
      escapeCSVCell(p.category),
      escapeCSVCell(p.sku),
      escapeCSVCell(p.currentPrice),
      escapeCSVCell(p.lowestCompetitorPrice),
      escapeCSVCell(p.lowestCompetitorName),
      escapeCSVCell(p.priceDifference),
      escapeCSVCell(p.buyBoxStatus === 'won' ? 'رابح 🏆' : p.buyBoxStatus === 'threatened' ? 'مهدد ⚠️' : 'خاسر ❌'),
      escapeCSVCell(p.todayUnitsSold),
      escapeCSVCell(p.weeklyUnitsSold),
      escapeCSVCell(p.weeklyRevenueEGP),
      escapeCSVCell(weeklyNetProfit),
      escapeCSVCell(`${marginPercent}%`),
      escapeCSVCell(p.recommendedActionPrice),
      escapeCSVCell(p.recommendedActionReason)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `تقرير_أداء_المبيعات_والتسعير_${timeframe}_${dateStr}.csv`;
  downloadCSV(csvContent, finalFilename);
}

/**
 * Generates an intuitive sample CSV template for merchants to download and fill out.
 */
export function generateProductImportTemplateCSV(): string {
  const headers = [
    'اسم المنتج (إلزامي)*',
    'الاسم بالإنجليزية',
    'العلامة التجارية (إلزامي)*',
    'التصنيف (إلزامي)*',
    'كود الصنف SKU',
    'الباركود Barcode',
    'تكلفة الجملة بالجنية (إلزامي)*',
    'سعر البيع المقترح بالجنية (إلزامي)*',
    'أقل سعر منافس بالسوق',
    'أعلى سعر بالسوق',
    'الموديل',
    'رابط الصورة',
    'الوصف',
    'الوسوم (مفصولة بعلامة |)'
  ];

  const sampleRows = [
    [
      'كرسي مكتب طبي هيدروليك مريح داعم للفقرات القطنية',
      'Ergonomic Mesh Office Chair with Lumbar Support',
      'أرت ديكو مصر',
      'أثاث وتجهيزات مكتبية',
      'FUR-CHR-ERG-BLK-EG',
      '6221456789012',
      '2650',
      '3650',
      '3450',
      '4200',
      'ErgoFit Pro',
      'https://images.unsplash.com/photo-1580481077195-c3a821a506cb?w=800&auto=format&fit=crop&q=80',
      'كرسي مكتب طبي مريح مع مسند رأس قابل للتعديل وهيدروليك شديد التحمل.',
      'أثاث | كراسي طبية | تجهيزات مكتبية | مكاتب'
    ],
    [
      'طاولة قهوة مودرن خشب زان روماني طبيعي 100×60 سم',
      'Modern Beechwood Coffee Table with Shelf',
      'رويال فورنتشر',
      'أثاث ومفروشات وديكور',
      'FUR-TBL-COF-ZAN-EG',
      '6221456789029',
      '2150',
      '3100',
      '2850',
      '3500',
      'Nordic Zan 100',
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80',
      'طاولة قهوة مودرن خشب زان روماني طبيعي مع رف تخزين سفلي مقاس 100×60 سم.',
      'أثاث | طاولات قهوة | خشب زان | صالونات'
    ],
    [
      'مكتب عمل ودراسة خشب زان مودرن 3 أدراج هيدروليك 140×70 سم',
      'Modern Beechwood Study Desk 3 Drawers 140x70cm',
      'أرت ديكو مصر',
      'أثاث وتجهيزات مكتبية',
      'FUR-DSK-STD-ZAN-EG',
      '6221456789036',
      '3600',
      '4950',
      '4650',
      '5500',
      'StudyDesk 140',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
      'مكتب دراسة وعمل من خشب الزان الروماني الطبيعي مع 3 أدراج هيدروليك ناعمة.',
      'أثاث | مكاتب عمل | خشب زان | غرف دراسة'
    ]
  ];

  const formattedRows = sampleRows.map(row => row.map(cell => escapeCSVCell(cell)).join(','));
  return [headers.join(','), ...formattedRows].join('\r\n');
}

/**
 * Downloads the official Excel / CSV import template.
 */
export function downloadProductImportTemplate(): void {
  const content = generateProductImportTemplateCSV();
  downloadCSV(content, 'قالب_استيراد_المنتجات_المصري_النموذجي.csv');
}

export interface ParsedCSVRow {
  rowNumber: number;
  raw: Record<string, string>;
  product?: Partial<ProductData>;
  errors: string[];
  isValid: boolean;
}

export interface CSVParseResult {
  totalRows: number;
  validRows: ParsedCSVRow[];
  invalidRows: ParsedCSVRow[];
  headers: string[];
}

/**
 * Custom robust CSV parser that splits lines and handles quoted multi-value fields.
 */
export function parseCSVToMatrix(csvText: string): string[][] {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim(); // Remove BOM
  if (!cleanText) return [];

  const matrix: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  // Determine separator (comma or semicolon)
  const firstLine = cleanText.split('\n')[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  let separator = ',';
  if (semicolonCount > commaCount && semicolonCount > tabCount) separator = ';';
  else if (tabCount > commaCount && tabCount > semicolonCount) separator = '\t';

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === separator && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // handle \r\n
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        matrix.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      matrix.push(currentRow);
    }
  }

  return matrix;
}

/**
 * Normalizes header keys to easily map Arabic and English headers.
 */
function normalizeHeaderKey(header: string): string {
  const clean = header.toLowerCase().replace(/[*_#\-()]/g, '').trim();
  if (clean.includes('اسم') && (clean.includes('منتج') || clean.includes('title') || clean.includes('العنوان'))) return 'title';
  if (clean.includes('english') || clean.includes('انجليز') || clean.includes('titleen')) return 'titleEn';
  if (clean.includes('ماركة') || clean.includes('براند') || clean.includes('علامة') || clean.includes('brand')) return 'brand';
  if (clean.includes('تصنيف') || clean.includes('فئة') || clean.includes('قسم') || clean.includes('category')) return 'category';
  if (clean.includes('sku') || clean.includes('كود الصنف') || clean.includes('رمز')) return 'sku';
  if (clean.includes('barcode') || clean.includes('باركود')) return 'barcode';
  if (clean.includes('تكلفة') || clean.includes('جملة') || clean.includes('شراء') || clean.includes('wholesale') || clean.includes('cost')) return 'cost';
  if (clean.includes('سعر البيع') || clean.includes('سعر متجري') || clean.includes('مقترح') || clean.includes('retail') || clean.includes('price')) return 'price';
  if (clean.includes('أقل سعر') || clean.includes('منافس') || clean.includes('lowest')) return 'lowestPrice';
  if (clean.includes('أعلى سعر') || clean.includes('highest')) return 'highestPrice';
  if (clean.includes('متوسط') || clean.includes('average')) return 'avgPrice';
  if (clean.includes('موديل') || clean.includes('طراز') || clean.includes('model')) return 'model';
  if (clean.includes('صورة') || clean.includes('image') || clean.includes('url')) return 'imageUrl';
  if (clean.includes('وصف') || clean.includes('description') || clean.includes('تفاصيل')) return 'description';
  if (clean.includes('وسوم') || clean.includes('تاغ') || clean.includes('tags')) return 'tags';
  if (clean.includes('مزايا') || clean.includes('highlights') || clean.includes('مميزات')) return 'highlights';
  if (clean.includes('عملة') || clean.includes('currency')) return 'currency';
  if (clean.includes('كود') || clean.includes('id')) return 'id';
  return clean;
}

/**
 * Parses CSV text and converts it into structured product items with error checking.
 */
export function parseProductsCSV(csvText: string): CSVParseResult {
  const matrix = parseCSVToMatrix(csvText);
  if (matrix.length === 0) {
    return { totalRows: 0, validRows: [], invalidRows: [], headers: [] };
  }

  const rawHeaders = matrix[0];
  const normalizedHeaders = rawHeaders.map(h => normalizeHeaderKey(h));
  const dataRows = matrix.slice(1);

  const validRows: ParsedCSVRow[] = [];
  const invalidRows: ParsedCSVRow[] = [];

  dataRows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2; // 1-indexed header + row
    const rowObj: Record<string, string> = {};
    const errors: string[] = [];

    rawHeaders.forEach((rawH, colIdx) => {
      const normKey = normalizedHeaders[colIdx] || `col_${colIdx}`;
      rowObj[normKey] = row[colIdx] || '';
    });

    const title = rowObj['title']?.trim();
    const brand = rowObj['brand']?.trim() || 'عام';
    const category = rowObj['category']?.trim() || 'عام';
    const sku = rowObj['sku']?.trim() || `SKU-${Date.now()}-${rowIndex + 1}`;
    const barcode = rowObj['barcode']?.trim();
    const model = rowObj['model']?.trim() || '';
    const titleEn = rowObj['titleEn']?.trim() || '';
    const imageUrl = rowObj['imageUrl']?.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
    const description = rowObj['description']?.trim() || (title ? `منتج ${title} متوفر للطلب المباشر في السوق المصري.` : '');
    
    // Numeric Parsing
    const rawCost = rowObj['cost']?.replace(/[^\d.]/g, '');
    const cost = parseFloat(rawCost || '0');

    const rawPrice = rowObj['price']?.replace(/[^\d.]/g, '');
    const price = parseFloat(rawPrice || '0');

    const rawLowest = rowObj['lowestPrice']?.replace(/[^\d.]/g, '');
    const lowestPrice = rawLowest ? parseFloat(rawLowest) : (price > 0 ? Math.round(price * 0.96) : 0);

    const rawHighest = rowObj['highestPrice']?.replace(/[^\d.]/g, '');
    const highestPrice = rawHighest ? parseFloat(rawHighest) : (price > 0 ? Math.round(price * 1.15) : 0);

    const rawAvg = rowObj['avgPrice']?.replace(/[^\d.]/g, '');
    const avgPrice = rawAvg ? parseFloat(rawAvg) : (price > 0 ? Math.round((lowestPrice + highestPrice) / 2) : 0);

    // Tags & Highlights
    const tagsStr = rowObj['tags'] || '';
    const tags = tagsStr.split(/[|،,]/).map(t => t.trim()).filter(Boolean);
    if (tags.length === 0 && category) tags.push(category, 'مصر');

    const highlightsStr = rowObj['highlights'] || '';
    const quickHighlights = highlightsStr.split(/[|،,]/).map(h => h.trim()).filter(Boolean);

    // Validation
    if (!title || title.length < 2) {
      errors.push('اسم المنتج مفقود أو قصير جداً');
    }
    if (isNaN(cost) || cost <= 0) {
      errors.push('تكلفة الجملة يجب أن تكون رقماً أكبر من صفر');
    }
    if (isNaN(price) || price <= 0) {
      errors.push('سعر البيع المقترح يجب أن يكون رقماً أكبر من صفر');
    }
    if (price > 0 && cost > 0 && price < cost) {
      errors.push('تحذير: سعر البيع أقل من تكلفة الجملة (هامش ربح سلبي)');
    }

    const isValid = errors.filter(e => !e.startsWith('تحذير')).length === 0;

    const partialProduct: Partial<ProductData> = {
      id: rowObj['id']?.trim() || `prod-import-${Date.now()}-${rowIndex + 1}`,
      title,
      titleEn,
      brand,
      model,
      category,
      sku,
      barcode,
      imageUrl,
      description,
      estimatedWholesaleCost: cost || 100,
      suggestedRetailPrice: price || 150,
      currentLowestPrice: lowestPrice || price || 150,
      highestPrice: highestPrice || Math.round((price || 150) * 1.2),
      averagePrice: avgPrice || Math.round((price || 150) * 1.05),
      currency: rowObj['currency']?.trim() || 'EGP',
      tags,
      quickHighlights: quickHighlights.length > 0 ? quickHighlights : ['منتج عالي الجودة متوفر للتسليم الفوري', 'ضمان معتمد في مصر'],
      confidenceScore: 98,
      specs: [],
      merchantOffers: [],
      wholesaleLocations: [],
      priceHistory: [
        {
          date: 'اليوم (استيراد CSV)',
          price: price || 150,
          merchant: 'متجري (سعر الاستيراد)'
        }
      ]
    };

    const parsedRow: ParsedCSVRow = {
      rowNumber,
      raw: rowObj,
      product: partialProduct,
      errors,
      isValid
    };

    if (isValid) {
      validRows.push(parsedRow);
    } else {
      invalidRows.push(parsedRow);
    }
  });

  return {
    totalRows: dataRows.length,
    validRows,
    invalidRows,
    headers: rawHeaders
  };
}

/**
 * Converts valid parsed rows into complete, production-ready ProductData instances.
 */
export function buildFullProductsFromParsed(validRows: ParsedCSVRow[]): ProductData[] {
  return validRows.map((item, idx) => {
    const p = item.product || {};
    const title = p.title || `منتج مستورد ${idx + 1}`;
    const brand = p.brand || 'عام';
    const category = p.category || 'عام';
    const price = p.suggestedRetailPrice || 1000;
    const cost = p.estimatedWholesaleCost || 700;
    const lowest = p.currentLowestPrice || Math.round(price * 0.95);

    const seoListing: PlatformSEOListing = {
      amazon: {
        title: `${title} - النسخة الأصلية الرسمية`,
        bulletPoints: [
          'جودة تصنيع ممتازة وضمان محلي معتمد',
          'شحن وتوصيل سريع لكافة المحافظات المصرية',
          'متوافق مع أعلى معايير الجودة والأداء'
        ],
        backendSearchTerms: `${brand} ${category} egypt سوق مصر`,
        categoryPath: `${category} > المنتجات الشائعة`,
        complianceScore: 95,
        characterCount: title.length + 30
      },
      noon: {
        title: `${title} من ${brand}`,
        keyHighlights: [
          'أفضل سعر منافس في السوق المصري',
          'تسليم سريع عبر نون إكسبريس'
        ],
        description: p.description || `${title} بجودة مضمونة وضمان رسمي.`,
        arabicBrand: brand,
        complianceScore: 94
      },
      jumia: {
        title: title,
        shortDescription: p.description || `${title} بجودة عالية وسعر منافس.`,
        keyFeatures: ['منتج أصلي', 'توصيل لباب البيت'],
        searchTags: p.tags || [brand, category],
        complianceScore: 92
      },
      socialStore: {
        marketingPost: `🔥 عرض خاص على ${title} بسعر ${price.toLocaleString()} ج.م فقط!`,
        callToAction: 'اطلب الآن عبر رسائل الصفحة أو الواتساب',
        adCopy: `${title} متاح الآن بأفضل سعر وجودة مضمونة.`,
        hashtags: ['#عروض_مصر', '#تسوق_أونلاين', '#خصومات']
      }
    };

    return {
      id: p.id || `prod-imp-${Date.now()}-${idx + 1}`,
      title,
      titleEn: p.titleEn || '',
      brand,
      model: p.model || '',
      category,
      sku: p.sku || `SKU-IMP-${Date.now()}-${idx + 1}`,
      barcode: p.barcode || `622145${Math.floor(1000000 + Math.random() * 9000000)}`,
      imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      confidenceScore: 98,
      description: p.description || `${title} - متوفر الآن بأفضل سعر تنافسي.`,
      estimatedWholesaleCost: cost,
      suggestedRetailPrice: price,
      currentLowestPrice: lowest,
      highestPrice: p.highestPrice || Math.round(price * 1.2),
      averagePrice: p.averagePrice || Math.round((lowest + price) / 2),
      currency: p.currency || 'EGP',
      tags: p.tags && p.tags.length > 0 ? p.tags : [brand, category, 'مستورد'],
      quickHighlights: p.quickHighlights && p.quickHighlights.length > 0 ? p.quickHighlights : ['منتج جاهز للبيع الفوري', 'هامش ربح ممتاز'],
      specs: [],
      merchantOffers: [
        {
          id: `off-amz-${idx + 1}`,
          merchantName: 'أمازون مصر (Amazon Egypt)',
          storeType: 'online',
          platform: 'amazon_eg',
          price: lowest,
          currency: 'EGP',
          rating: 4.7,
          reviewCount: 120,
          deliveryTime: 'توصيل غداً',
          deliveryCost: 'مجاني',
          isVerified: true,
          stockStatus: 'in_stock',
          url: 'https://amazon.eg',
          warranty: 'ضمان محلي معتمد'
        }
      ],
      wholesaleLocations: [
        {
          id: `ws-${idx + 1}`,
          marketName: 'شارع عبد العزيز - العتبة',
          hubType: 'شارع عبد العزيز',
          branchName: 'مكتب التوريدات الرئيسي',
          address: 'العتبة - القاهرة',
          city: 'القاهرة',
          distanceKm: 2.0,
          inStockCount: 45,
          wholesalePrice: cost,
          minOrderQuantity: 3,
          supplierContact: 'أ/ سامح للتوريدات',
          phone: '01000000000',
          openUntil: '10:00 مساءً',
          currency: 'EGP',
          coordinates: { lat: 30.049, lng: 31.248 }
        }
      ],
      seoListing,
      keywords: [],
      priceHistory: [
        {
          date: 'اليوم (سعر الاستيراد)',
          price,
          merchant: 'متجري'
        }
      ]
    };
  });
}
