import { ProductData, MerchantOffer, ConnectedMerchantPlatform, PlatformCompetitorRecord } from '../types';
import { parseCSVToMatrix } from './csvProductManager';

/**
 * Checks whether a product or title belongs to the Furniture & Bedding / Home Decor category
 */
export function isFurnitureOrBedding(productOrTitle: ProductData | string | undefined): boolean {
  if (!productOrTitle) return false;
  const text = typeof productOrTitle === 'string' 
    ? productOrTitle 
    : `${productOrTitle.title || ''} ${productOrTitle.category || ''} ${(productOrTitle.tags || []).join(' ')} ${productOrTitle.description || ''}`;
  
  const lower = text.toLowerCase();
  const furnitureKeywords = [
    'أثاث', 'اثاث', 'furniture', 'موبيلي', 'خشب', 'زان', 'كرسي', 'كراسي', 'chair',
    'طاولة', 'طاوله', 'ترابيزة', 'ترابيزه', 'table', 'desk', 'مكتب', 'مكاتب',
    'كنبة', 'كنبه', 'كنب', 'sofa', 'انتريه', 'أنتريه', 'ركنة', 'ركنه', 'صالون',
    'دولاب', 'خزانة', 'wardrobe', 'closet', 'دريسنج', 'كومود', 'جزامة', 'جزامه',
    'تسريحة', 'تسريحه', 'بوفيه', 'سرير', 'اسرة', 'bed', 'مرتبة', 'مرتبه', 'مراتب',
    'mattress', 'مفروشات', 'ديكور', 'decor', 'بوف', 'شيزلونج', 'مخدة', 'لحاف',
    'مكتبة', 'ارفف', 'أرفف', 'bookshelf'
  ];
  return furnitureKeywords.some(kw => lower.includes(kw));
}

/**
 * Detects whether a string refers to audio, headphones, or irrelevant non-furniture electronics
 */
export function isAudioOrIrrelevantElectronic(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const irrelevantKeywords = [
    'سماعة', 'سماعه', 'سماعات', 'headphone', 'earphone', 'airpods', 'earbuds',
    'ساوندكور', 'soundcore', 'anker q30', 'q30', 'life q30', 'a3028',
    'ميكروفون', 'كيسة', 'لابتوب', 'موبايل', 'شاحن', 'باور بانك', 'powerbank'
  ];
  return irrelevantKeywords.some(kw => lower.includes(kw));
}

export interface ParsedCompetitorRow {
  rowNumber: number;
  competitorName: string;
  productTitleOrSku: string;
  matchedProductId?: string;
  matchedProductTitle?: string;
  price: number;
  originalPrice?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryCost: string;
  fulfillmentType: 'fba_noon_express' | 'merchant_fulfillment' | 'pickup' | 'fba';
  url: string;
  warranty: string;
  isValid: boolean;
  errors: string[];
}

export interface CompetitorCSVParseResult {
  totalRows: number;
  validRows: ParsedCompetitorRow[];
  invalidRows: ParsedCompetitorRow[];
  headers: string[];
  platformName: string;
  platformCode: string;
}

/**
 * Normalizes CSV headers for competitor list import
 */
function normalizeCompetitorHeaderKey(header: string): string {
  const clean = header.toLowerCase().replace(/[*_#\-()]/g, '').trim();
  if (clean.includes('منافس') || clean.includes('تاجر') || clean.includes('متجر') || clean.includes('competitor') || clean.includes('merchant') || clean.includes('seller')) {
    return 'competitorName';
  }
  if (clean.includes('منتج') || clean.includes('صنف') || clean.includes('sku') || clean.includes('product') || clean.includes('title') || clean.includes('كود')) {
    return 'productTitleOrSku';
  }
  if (clean.includes('قبل الخصم') || clean.includes('original') || clean.includes('oldprice') || clean.includes('السعر القديم')) {
    return 'originalPrice';
  }
  if (clean.includes('سعر') || clean.includes('price') || clean.includes('قيمة')) {
    return 'price';
  }
  if (clean.includes('مخزون') || clean.includes('توفر') || clean.includes('حالة') || clean.includes('stock')) {
    return 'stockStatus';
  }
  if (clean.includes('تقييم') || clean.includes('نجم') || clean.includes('rating') || clean.includes('rate')) {
    return 'rating';
  }
  if (clean.includes('مراجعات') || clean.includes('تقييمات') || clean.includes('عدد') || clean.includes('reviews') || clean.includes('count')) {
    return 'reviewCount';
  }
  if (clean.includes('مدة') || clean.includes('توصيل') || clean.includes('شحن') || clean.includes('delivery') || clean.includes('shipping')) {
    return 'deliveryTime';
  }
  if (clean.includes('تكلفة الشحن') || clean.includes('مصاريف') || clean.includes('shippingcost') || clean.includes('deliverycost')) {
    return 'deliveryCost';
  }
  if (clean.includes('نوع الشحن') || clean.includes('fba') || clean.includes('fulfillment') || clean.includes('إكسبريس')) {
    return 'fulfillmentType';
  }
  if (clean.includes('رابط') || clean.includes('لينك') || clean.includes('url') || clean.includes('link')) {
    return 'url';
  }
  if (clean.includes('ضمان') || clean.includes('warranty')) {
    return 'warranty';
  }
  return clean;
}

/**
 * Parses CSV text representing a competitor list for a specific sales channel
 */
export function parseCompetitorsCSV(
  csvText: string,
  platform: ConnectedMerchantPlatform,
  availableProducts: ProductData[]
): CompetitorCSVParseResult {
  const matrix = parseCSVToMatrix(csvText);
  if (matrix.length === 0) {
    return {
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      headers: [],
      platformName: platform.name,
      platformCode: platform.code
    };
  }

  const rawHeaders = matrix[0];
  const normalizedHeaders = rawHeaders.map(h => normalizeCompetitorHeaderKey(h));
  const dataRows = matrix.slice(1);

  const validRows: ParsedCompetitorRow[] = [];
  const invalidRows: ParsedCompetitorRow[] = [];

  dataRows.forEach((row, rowIndex) => {
    // Skip completely empty rows
    if (row.every(cell => !cell || !cell.trim())) {
      return;
    }

    const rowNumber = rowIndex + 2;
    const rowObj: Record<string, string> = {};
    const errors: string[] = [];

    rawHeaders.forEach((_, colIdx) => {
      const normKey = normalizedHeaders[colIdx] || `col_${colIdx}`;
      rowObj[normKey] = row[colIdx] || '';
    });

    const competitorName = rowObj['competitorName']?.trim() || '';
    const productTitleOrSku = rowObj['productTitleOrSku']?.trim() || '';
    
    // Price parsing
    const rawPrice = rowObj['price']?.replace(/[^\d.]/g, '');
    const price = parseFloat(rawPrice || '0');

    // Original price parsing
    const rawOrigPrice = rowObj['originalPrice']?.replace(/[^\d.]/g, '');
    const originalPrice = rawOrigPrice ? parseFloat(rawOrigPrice) : (price > 0 ? Math.round(price * 1.12) : undefined);

    // Stock Status
    const rawStock = (rowObj['stockStatus'] || '').toLowerCase();
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (rawStock.includes('غير') || rawStock.includes('نفد') || rawStock.includes('out')) {
      stockStatus = 'out_of_stock';
    } else if (rawStock.includes('قليل') || rawStock.includes('محدود') || rawStock.includes('low')) {
      stockStatus = 'low_stock';
    }

    // Rating
    const rawRating = parseFloat(rowObj['rating']?.replace(/[^\d.]/g, '') || '4.6');
    const rating = isNaN(rawRating) ? 4.5 : Math.min(5, Math.max(1, rawRating));

    // Reviews count
    const rawReviews = parseInt(rowObj['reviewCount']?.replace(/[^\d]/g, '') || '120', 10);
    const reviewCount = isNaN(rawReviews) ? 85 : Math.max(0, rawReviews);

    // Shipping & Delivery
    const deliveryTime = rowObj['deliveryTime']?.trim() || (platform.code.includes('amazon') ? 'توصيل غداً (برايم)' : platform.code.includes('noon') ? 'نون إكسبريس (خلال 24 ساعة)' : 'خلال 24-48 ساعة');
    const deliveryCost = rowObj['deliveryCost']?.trim() || (price > 500 ? 'شحن مجاني' : '25 ج.م');

    // Fulfillment Type
    const rawFulfill = (rowObj['fulfillmentType'] || '').toLowerCase();
    let fulfillmentType: 'fba_noon_express' | 'merchant_fulfillment' | 'pickup' | 'fba' = 'merchant_fulfillment';
    if (rawFulfill.includes('fba') || rawFulfill.includes('أمازون')) {
      fulfillmentType = 'fba';
    } else if (rawFulfill.includes('express') || rawFulfill.includes('إكسبريس') || rawFulfill.includes('noon')) {
      fulfillmentType = 'fba_noon_express';
    } else if (rawFulfill.includes('استلام') || rawFulfill.includes('pickup')) {
      fulfillmentType = 'pickup';
    }

    // URL & Warranty
    const url = rowObj['url']?.trim() || platform.merchantStoreUrl || 'https://www.google.com';
    const warranty = rowObj['warranty']?.trim() || 'ضمان محلي معتمد لمدة عام';

    // Validation checks
    if (!competitorName || competitorName.length < 2) {
      errors.push('اسم المتجر / المنافس مطلوب ولا يقل عن حرفين');
    }

    if (isNaN(price) || price <= 0) {
      errors.push('سعر المنافس يجب أن يكون رقماً صحيحاً وموجباً');
    }

    // Strict Category Discipline: Purge any audio/headphone dummy entries
    if (isAudioOrIrrelevantElectronic(productTitleOrSku) || isAudioOrIrrelevantElectronic(competitorName)) {
      errors.push(`تم استبعاد هذا السجل تلقائياً: تم رصد منتج إلكترونيات/سماعات ("${productTitleOrSku}") غير متطابق مع قطاع الأثاث والمفروشات الخاص بمتجرك.`);
    }

    // Attempt strict match against available furniture products in catalog
    let matchedProd: ProductData | undefined;
    if (productTitleOrSku && !isAudioOrIrrelevantElectronic(productTitleOrSku)) {
      const cleanSearch = productTitleOrSku.toLowerCase().trim();

      // 1. Strict ASIN exact match
      matchedProd = availableProducts.find(p => {
        const pAsin = p.id.toLowerCase();
        const specAsin = p.specs?.flatMap(s => s.items).find(i => i.label.toLowerCase().includes('asin'))?.value.toLowerCase();
        return pAsin === cleanSearch || specAsin === cleanSearch;
      });

      // 2. Strict SKU / Barcode exact match
      if (!matchedProd) {
        matchedProd = availableProducts.find(p => 
          (p.sku && p.sku.toLowerCase() === cleanSearch) ||
          (p.barcode && p.barcode.toLowerCase() === cleanSearch)
        );
      }

      // 3. Strict Furniture Title & Model Semantic Match
      if (!matchedProd) {
        matchedProd = availableProducts.find(p => {
          const pTitle = p.title.toLowerCase();
          if (pTitle === cleanSearch) return true;
          
          // Require shared furniture context if doing substring matching
          const furnitureStems = [
            'كرسي', 'طاولة', 'ترابيزة', 'كنبة', 'سرير', 'دولاب', 'مرتبة', 'مكتب',
            'انتريه', 'ركنة', 'بوفيه', 'جزامة', 'تسريحة', 'رف', 'مكتبة', 'كومود',
            'chair', 'table', 'desk', 'bed', 'sofa', 'mattress'
          ];
          const hasFurnitureStem = furnitureStems.some(s => pTitle.includes(s) && cleanSearch.includes(s));
          if (hasFurnitureStem) {
            return pTitle.includes(cleanSearch) || cleanSearch.includes(pTitle) ||
              (p.model && cleanSearch.includes(p.model.toLowerCase()));
          }
          return false;
        });
      }
    }

    // Strict validation: NEVER fallback to a random product if the furniture item is not genuinely matched
    if (!matchedProd) {
      if (!errors.some(e => e.includes('استبعاد هذا السجل'))) {
        errors.push(`لم يتم العثور على منتج أثاث مطابق في متجرك لـ ("${productTitleOrSku || 'غير محدد'}"). يجب إدخال كود ASIN أو اسم قطعة الأثاث بدقة.`);
      }
    }

    const rowResult: ParsedCompetitorRow = {
      rowNumber,
      competitorName,
      productTitleOrSku: productTitleOrSku || (matchedProd ? matchedProd.title : 'غير مطابق'),
      matchedProductId: matchedProd?.id,
      matchedProductTitle: matchedProd?.title,
      price,
      originalPrice,
      stockStatus,
      rating,
      reviewCount,
      deliveryTime,
      deliveryCost,
      fulfillmentType,
      url,
      warranty,
      isValid: errors.length === 0,
      errors
    };

    if (rowResult.isValid) {
      validRows.push(rowResult);
    } else {
      invalidRows.push(rowResult);
    }
  });

  return {
    totalRows: dataRows.length,
    validRows,
    invalidRows,
    headers: rawHeaders,
    platformName: platform.name,
    platformCode: platform.code
  };
}

/**
 * Merges imported competitor records into the product catalog and recalculates radar metrics.
 */
export function mergeCompetitorsIntoProducts(
  importedRows: ParsedCompetitorRow[],
  platform: ConnectedMerchantPlatform,
  allProducts: ProductData[],
  activeProduct: ProductData,
  mode: 'merge' | 'replace' = 'merge'
): {
  updatedProducts: ProductData[];
  updatedActiveProduct: ProductData;
  newCompetitorsRecords: PlatformCompetitorRecord[];
  mergedCount: number;
} {
  const platformCleanName = platform.name.split('(')[0].trim();
  const timestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

  const newRecords: PlatformCompetitorRecord[] = [];

  // Group imported competitors strictly by their valid matched product ID
  const groupedByProductId = new Map<string, ParsedCompetitorRow[]>();

  importedRows.forEach((row, idx) => {
    // Only accept rows that have a verified matchedProductId
    if (!row.matchedProductId) return;
    const targetId = row.matchedProductId;
    
    if (!groupedByProductId.has(targetId)) {
      groupedByProductId.set(targetId, []);
    }
    groupedByProductId.get(targetId)!.push(row);

    newRecords.push({
      id: `comp-rec-${platform.code}-${Date.now()}-${idx}`,
      competitorName: row.competitorName,
      productTitleOrSku: row.productTitleOrSku,
      matchedProductId: targetId,
      price: row.price,
      originalPrice: row.originalPrice,
      stockStatus: row.stockStatus,
      rating: row.rating,
      reviewCount: row.reviewCount,
      deliveryTime: row.deliveryTime,
      deliveryCost: row.deliveryCost,
      fulfillmentType: row.fulfillmentType,
      url: row.url,
      warranty: row.warranty,
      importedAt: `${dateStr} ${timestamp}`,
      platformCode: platform.code,
      platformName: platformCleanName
    });
  });

  // Now update each product
  const updatedProducts = allProducts.map(product => {
    // Purge any legacy dummy offers (e.g. headphone offers or irrelevant tech dummy items on furniture)
    let existingOffers = (product.merchantOffers || []).filter(o => {
      const lowerName = (o.merchantName || '').toLowerCase();
      const lowerWarranty = (o.warranty || '').toLowerCase();
      return !lowerName.includes('سماع') && !lowerName.includes('أنكر') && 
             !lowerName.includes('headphone') && !lowerWarranty.includes('soundcore') &&
             !lowerName.includes('q30');
    });

    const channelMatches = groupedByProductId.get(product.id);
    if (!channelMatches || channelMatches.length === 0) {
      return {
        ...product,
        merchantOffers: existingOffers
      };
    }

    // If replace mode, remove existing offers from THIS platform code
    if (mode === 'replace') {
      existingOffers = existingOffers.filter(o => o.platform !== (platform.code as any));
    }

    // Convert parsed rows into MerchantOffer objects
    const newOffers: MerchantOffer[] = channelMatches.map((row, idx) => ({
      id: `offer-${platform.code}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      merchantName: row.competitorName,
      merchantLogo: platform.code.includes('amazon') ? '🛒' : platform.code.includes('noon') ? '🟡' : platform.code.includes('homzmart') ? '🛋️' : platform.code.includes('jumia') ? '⭐' : '🏪',
      storeType: 'online',
      platform: (platform.code as any) || 'other',
      platformName: platformCleanName,
      price: row.price,
      originalPrice: row.originalPrice || Math.round(row.price * 1.1),
      currency: product.currency || 'EGP',
      rating: row.rating,
      reviewCount: row.reviewCount,
      deliveryTime: row.deliveryTime,
      deliveryCost: row.deliveryCost,
      isVerified: true,
      stockStatus: row.stockStatus,
      url: row.url,
      warranty: row.warranty,
      fulfillmentType: row.fulfillmentType,
      inStock: row.stockStatus !== 'out_of_stock'
    }));

    const combinedOffers = [...existingOffers, ...newOffers];

    // Recalculate price radar statistics
    const prices = combinedOffers.map(o => o.price).filter(p => p > 0);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : product.currentLowestPrice;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : product.highestPrice;
    const averagePrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : product.averagePrice;

    // Mark the lowest offer with isBestDeal
    const finalOffers = combinedOffers.map(offer => ({
      ...offer,
      isBestDeal: offer.price === lowestPrice
    }));

    // Append to price history
    const updatedHistory = [
      ...(product.priceHistory || []),
      {
        date: 'اليوم (تحديث استيراد المنافسين)',
        price: lowestPrice,
        merchant: `${platformCleanName} - ${channelMatches[0]?.competitorName || 'استيراد CSV'}`
      }
    ];

    return {
      ...product,
      merchantOffers: finalOffers,
      currentLowestPrice: lowestPrice,
      highestPrice: highestPrice,
      averagePrice: averagePrice,
      priceHistory: updatedHistory
    };
  });

  // Find updated active product
  const updatedActiveProduct = updatedProducts.find(p => p.id === activeProduct.id) || updatedProducts[0] || activeProduct;

  return {
    updatedProducts,
    updatedActiveProduct,
    newCompetitorsRecords: newRecords,
    mergedCount: importedRows.length
  };
}

/**
 * Generates sample CSV template content for a specific platform tailored strictly for Furniture & Bedding
 */
export function generateCompetitorCSVTemplate(
  platformName: string,
  platformCode: string,
  sampleProduct?: ProductData
): string {
  // Use merchant product if available; otherwise use standard Egyptian furniture product (Never headphones!)
  const prodTitle = sampleProduct?.title 
    ? `"${sampleProduct.title.replace(/"/g, '""')}"` 
    : '"طاولة قهوة مودرن خشب زان روماني طبيعي مع رف تخزين سفلي 100×60 سم"';
  const prodSku = sampleProduct?.sku || (sampleProduct?.id?.startsWith('B0') ? sampleProduct.id : 'FUR-TBL-ZAN-EG');
  const basePrice = sampleProduct?.currentLowestPrice || 2850;

  let comp1 = 'معارض قباني للأثاث (Qabbani Furniture)';
  let comp2 = 'هب فيرنتشر للديكور (Hub Furniture)';
  let comp3 = 'إن آند أوت للأثاث العصري (In & Out)';

  if (platformCode.includes('amazon')) {
    comp1 = 'أمازون هوم مصر (Amazon Home EG)';
    comp2 = 'هب فيرنتشر ستور (Hub Furniture)';
    comp3 = 'مودرن هوم إيجيبت للأثاث';
  } else if (platformCode.includes('noon')) {
    comp1 = 'نون إكسبريس - قسم الأثاث (Noon Home)';
    comp2 = 'معارض تاكي وهوم ديكور مصر';
    comp3 = 'الصفوة للموبيليا والأثاث العصري';
  } else if (platformCode.includes('homzmart')) {
    comp1 = 'هومزمارت دايركت (Homzmart Official)';
    comp2 = 'معارض قباني للأثاث المنزلي';
    comp3 = 'آرت هوم للأثاث والمفروشات';
  } else if (platformCode.includes('jumia')) {
    comp1 = 'جوميا هوم أند ليفينج (Jumia Home)';
    comp2 = 'البيت الحديث للأثاث المكتبي والمنزلي';
    comp3 = 'كايرو وود للتجهيزات الخشبية';
  }

  const header = 'اسم المتجر أو المنافس,اسم المنتج أو SKU أو ASIN,سعر المنافس,السعر قبل الخصم,حالة التوفر,التقييم,عدد المراجعات,مدة التوصيل,تكلفة الشحن,نوع الشحن,رابط المتجر,الضمان';
  
  const row1 = `"${comp1}",${prodTitle},${basePrice},${Math.round(basePrice * 1.15)},"متوفر",4.8,320,"توصيل خلال 2-3 أيام مع التركيب","شحن مجاني","fba_noon_express","https://${platformCode}.example.com/sp/furniture-1","ضمان المصنع 3 سنوات ضد عيوب الصناعة"`;
  const row2 = `"${comp2}",${prodTitle},${Math.round(basePrice * 1.05)},${Math.round(basePrice * 1.18)},"متوفر",4.6,185,"شحن ونقل مجهز 48 ساعة","50 ج.م","merchant_fulfillment","https://${platformCode}.example.com/sp/furniture-2","ضمان معتمد عامين مع الصيانة"`;
  const row3 = `"${comp3}",${prodTitle},${Math.round(basePrice * 0.97)},${Math.round(basePrice * 1.10)},"مخزون قليل",4.4,95,"خلال 4-5 أيام عمل","75 ج.م","merchant_fulfillment","https://${platformCode}.example.com/sp/furniture-3","ضمان محلي عام كامل"`;

  return `\uFEFF${header}\n${row1}\n${row2}\n${row3}\n`;
}

/**
 * Triggers download of the competitor CSV template
 */
export function downloadCompetitorCSVTemplate(
  platformName: string,
  platformCode: string,
  sampleProduct?: ProductData
): void {
  const content = generateCompetitorCSVTemplate(platformName, platformCode, sampleProduct);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = platformName.split('(')[0].trim().replace(/\s+/g, '_');
  link.href = url;
  link.setAttribute('download', `قالب_استيراد_منافسين_الأثاث_${safeName}_${platformCode}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Returns mock sample competitor CSV text for Egyptian market platforms
 */
export function getSampleEgyptianCompetitorsCSV(
  platformName: string,
  platformCode: string,
  sampleProduct?: ProductData
): string {
  return generateCompetitorCSVTemplate(platformName, platformCode, sampleProduct);
}
