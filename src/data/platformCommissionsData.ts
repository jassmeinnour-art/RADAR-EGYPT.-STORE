import {
  PlatformKey,
  PlatformMetadata,
  CategoryCommissionRule,
  PlatformFeeCalculationResult,
  MultiPlatformCommissionSummary,
  ProductData
} from '../types';

export const PLATFORMS_METADATA: Record<PlatformKey, PlatformMetadata> = {
  amazon_eg: {
    id: 'amazon_eg',
    name: 'Amazon Egypt',
    nameAr: 'أمازون مصر (Amazon Egypt)',
    logoEmoji: '📦',
    colorTheme: 'from-sky-500 to-sky-600',
    badge: 'المرتبة #1 في الزيارات',
    defaultFulfillmentType: 'FBA (تخزين وشحن أمازون)',
    payoutSchedule: 'كل 14 يوماً (تحويل بنكي مباشر IBAN)',
    vatRatePercent: 14,
    officialCommissionUrl: 'https://sell.amazon.eg/pricing'
  },
  noon_eg: {
    id: 'noon_eg',
    name: 'Noon Egypt',
    nameAr: 'نون مصر (Noon Egypt)',
    logoEmoji: '🟡',
    colorTheme: 'from-sky-400 to-sky-500',
    badge: 'الأسرع نمواً في إلكترونيات مصر',
    defaultFulfillmentType: 'FBN (تخزين وشحن نون Express)',
    payoutSchedule: 'أسبوعياً / كل 7 أيام',
    vatRatePercent: 14,
    officialCommissionUrl: 'https://sell.noon.com/egypt-ar/fees'
  },
  jumia_eg: {
    id: 'jumia_eg',
    name: 'Jumia Egypt',
    nameAr: 'جوميا مصر (Jumia Egypt)',
    logoEmoji: '⭐',
    colorTheme: 'from-orange-500 to-orange-600',
    badge: 'أعلى انتشار في المحافظات',
    defaultFulfillmentType: 'Jumia Express / Dropship',
    payoutSchedule: 'كل أسبوعين (Jumia Pay)',
    vatRatePercent: 14,
    officialCommissionUrl: 'https://sellercenter.jumia.com.eg'
  },
  kenzz: {
    id: 'kenzz',
    name: 'Kenzz Egypt',
    nameAr: 'كنز (Kenzz Egypt)',
    logoEmoji: '💎',
    colorTheme: 'from-emerald-500 to-teal-600',
    badge: 'أقل عمولة ومنصة التجارة الاجتماعية',
    defaultFulfillmentType: 'Kenzz Hub & Delivery',
    payoutSchedule: 'خلال 48 ساعة من تسليم الطلب',
    vatRatePercent: 14,
    officialCommissionUrl: 'https://kenzz.com/merchant'
  },
  homzmart: {
    id: 'homzmart',
    name: 'Homzmart Egypt',
    nameAr: 'هومزمارت (Homzmart Egypt)',
    logoEmoji: '🛋️',
    colorTheme: 'from-blue-600 to-indigo-700',
    badge: 'المنصة المتخصصة للأثاث والمنزل والمطبخ',
    defaultFulfillmentType: 'Homzmart Heavy & Direct Fleet',
    payoutSchedule: 'كل 15 يوماً',
    vatRatePercent: 14,
    officialCommissionUrl: 'https://homzmart.com/ar/partners'
  }
};

// Comprehensive Category-based commission matrix in Egypt
export const CATEGORY_COMMISSION_RULES: CategoryCommissionRule[] = [
  {
    categoryKey: 'audio_headphones',
    categoryNameAr: 'صوتيات وسماعات (Audio & Headphones)',
    rates: {
      amazon_eg: {
        referralPercent: 10,
        fixedClosingFeeEGP: 6,
        fulfillmentEstimatedEGP: 26,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 10% للسماعات والـ Bluetooth مع FBA سريع'
      },
      noon_eg: {
        referralPercent: 11,
        fixedClosingFeeEGP: 7,
        fulfillmentEstimatedEGP: 25,
        paymentProcessingPercent: 2.2,
        notesAr: 'عمولة 11% مع رسوم مناولة FBN'
      },
      jumia_eg: {
        referralPercent: 12,
        fixedClosingFeeEGP: 5,
        fulfillmentEstimatedEGP: 28,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 12% للملحقات الصوتية'
      },
      kenzz: {
        referralPercent: 8,
        fixedClosingFeeEGP: 3,
        fulfillmentEstimatedEGP: 20,
        paymentProcessingPercent: 1.5,
        notesAr: 'عمولة مخفضة 8% للشراء المباشر'
      },
      homzmart: {
        referralPercent: 13,
        fixedClosingFeeEGP: 10,
        fulfillmentEstimatedEGP: 35,
        paymentProcessingPercent: 2.5,
        notesAr: 'قسم الأجهزة الإلكترونية والمنزل الذكي'
      }
    }
  },
  {
    categoryKey: 'smartphones_tablets',
    categoryNameAr: 'موبايل وهواتف ذكية وأجهزة لوحية',
    rates: {
      amazon_eg: {
        referralPercent: 5.5,
        fixedClosingFeeEGP: 10,
        fulfillmentEstimatedEGP: 32,
        paymentProcessingPercent: 1.8,
        notesAr: 'عمولة منخفضة 5.5% للموبايلات فوق 5000 ج.م'
      },
      noon_eg: {
        referralPercent: 6.0,
        fixedClosingFeeEGP: 12,
        fulfillmentEstimatedEGP: 30,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة تنافسية 6% للموبايلات الرسمية بضمان محلي'
      },
      jumia_eg: {
        referralPercent: 6.5,
        fixedClosingFeeEGP: 8,
        fulfillmentEstimatedEGP: 34,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 6.5% مع تأمين شحن إجباري'
      },
      kenzz: {
        referralPercent: 4.5,
        fixedClosingFeeEGP: 5,
        fulfillmentEstimatedEGP: 24,
        paymentProcessingPercent: 1.5,
        notesAr: 'أقل عمولة للموبايل في السوق المصري 4.5%'
      },
      homzmart: {
        referralPercent: 8.0,
        fixedClosingFeeEGP: 15,
        fulfillmentEstimatedEGP: 40,
        paymentProcessingPercent: 2.5,
        notesAr: 'قسم التكنولوجيا والأجهزة المتصلة'
      }
    }
  },
  {
    categoryKey: 'electronics_accessories',
    categoryNameAr: 'إلكترونيات وإكسسوارات وشواحن وساعات ذكية',
    rates: {
      amazon_eg: {
        referralPercent: 12,
        fixedClosingFeeEGP: 5,
        fulfillmentEstimatedEGP: 24,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 12% على الشواحن والباور بنك والكابلات'
      },
      noon_eg: {
        referralPercent: 13,
        fixedClosingFeeEGP: 6,
        fulfillmentEstimatedEGP: 22,
        paymentProcessingPercent: 2.2,
        notesAr: 'عمولة 13% مع إدراج في عروض Express اليومية'
      },
      jumia_eg: {
        referralPercent: 14,
        fixedClosingFeeEGP: 5,
        fulfillmentEstimatedEGP: 26,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 14% على الإكسسوارات'
      },
      kenzz: {
        referralPercent: 9,
        fixedClosingFeeEGP: 3,
        fulfillmentEstimatedEGP: 18,
        paymentProcessingPercent: 1.5,
        notesAr: 'عمولة 9% فقط على الإكسسوارات'
      },
      homzmart: {
        referralPercent: 14,
        fixedClosingFeeEGP: 10,
        fulfillmentEstimatedEGP: 30,
        paymentProcessingPercent: 2.5,
        notesAr: 'إكسسوارات منزلية وإلكترونية'
      }
    }
  },
  {
    categoryKey: 'home_appliances',
    categoryNameAr: 'أجهزة منزلية ومطبخ (قلايات، خلاطات، أفران)',
    rates: {
      amazon_eg: {
        referralPercent: 8.5,
        fixedClosingFeeEGP: 8,
        fulfillmentEstimatedEGP: 42,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 8.5% مع شحن سريع للأجهزة المتوسطة'
      },
      noon_eg: {
        referralPercent: 9.0,
        fixedClosingFeeEGP: 10,
        fulfillmentEstimatedEGP: 40,
        paymentProcessingPercent: 2.2,
        notesAr: 'عمولة 9% مع عروض نون للمنزل والمطبخ'
      },
      jumia_eg: {
        referralPercent: 10.0,
        fixedClosingFeeEGP: 7,
        fulfillmentEstimatedEGP: 45,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 10% مع خدمة جوميا إكسبريس'
      },
      kenzz: {
        referralPercent: 7.0,
        fixedClosingFeeEGP: 4,
        fulfillmentEstimatedEGP: 32,
        paymentProcessingPercent: 1.5,
        notesAr: 'عمولة 7% فقط للأجهزة المنزلية'
      },
      homzmart: {
        referralPercent: 8.0,
        fixedClosingFeeEGP: 8,
        fulfillmentEstimatedEGP: 38,
        paymentProcessingPercent: 2.2,
        notesAr: 'المنصة الرائدة للأجهزة المنزلية والمطبخ بتركيز تسويقي فائق'
      }
    }
  },
  {
    categoryKey: 'furniture_decor',
    categoryNameAr: 'أثاث وديكور ومستلزمات منزلية كبرى (Furniture & Decor)',
    rates: {
      amazon_eg: {
        referralPercent: 13.0,
        fixedClosingFeeEGP: 12,
        fulfillmentEstimatedEGP: 65,
        paymentProcessingPercent: 2.2,
        notesAr: 'رسوم شحن إضافية للمنتجات الحجمية (Heavy/Bulky)'
      },
      noon_eg: {
        referralPercent: 14.0,
        fixedClosingFeeEGP: 15,
        fulfillmentEstimatedEGP: 70,
        paymentProcessingPercent: 2.2,
        notesAr: 'عمولة 14% على المفروشات والديكور'
      },
      jumia_eg: {
        referralPercent: 15.0,
        fixedClosingFeeEGP: 10,
        fulfillmentEstimatedEGP: 75,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 15% للأثاث المنزلي'
      },
      kenzz: {
        referralPercent: 9.5,
        fixedClosingFeeEGP: 6,
        fulfillmentEstimatedEGP: 45,
        paymentProcessingPercent: 1.5,
        notesAr: 'عمولة 9.5% لمنتجات الديكور المنزلي'
      },
      homzmart: {
        referralPercent: 12.0,
        fixedClosingFeeEGP: 10,
        fulfillmentEstimatedEGP: 50,
        paymentProcessingPercent: 2.0,
        notesAr: 'أفضل منصة متخصصة للأثاث مع أسطول شحن للأحجام الكبيرة'
      }
    }
  },
  {
    categoryKey: 'fashion_apparel',
    categoryNameAr: 'أزياء وملابس وأحذية وحقائب (Fashion)',
    rates: {
      amazon_eg: {
        referralPercent: 15.0,
        fixedClosingFeeEGP: 5,
        fulfillmentEstimatedEGP: 25,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 15% مع دعم سياسة الإرجاع المجاني'
      },
      noon_eg: {
        referralPercent: 16.0,
        fixedClosingFeeEGP: 6,
        fulfillmentEstimatedEGP: 24,
        paymentProcessingPercent: 2.2,
        notesAr: 'عمولة 16% على الملابس مع كود خصم ترويجي'
      },
      jumia_eg: {
        referralPercent: 17.0,
        fixedClosingFeeEGP: 5,
        fulfillmentEstimatedEGP: 26,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 17% لقطاع الموضة والأزياء'
      },
      kenzz: {
        referralPercent: 10.0,
        fixedClosingFeeEGP: 3,
        fulfillmentEstimatedEGP: 18,
        paymentProcessingPercent: 1.5,
        notesAr: 'عمولة ممتازة 10% للتجارة الاجتماعية والملابس'
      },
      homzmart: {
        referralPercent: 15.0,
        fixedClosingFeeEGP: 8,
        fulfillmentEstimatedEGP: 28,
        paymentProcessingPercent: 2.5,
        notesAr: 'المفروشات المنزلية والمنسوجات'
      }
    }
  },
  {
    categoryKey: 'beauty_personal_care',
    categoryNameAr: 'عناية وتجميل وعطور وصحة شخصية',
    rates: {
      amazon_eg: {
        referralPercent: 11.0,
        fixedClosingFeeEGP: 5,
        fulfillmentEstimatedEGP: 22,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 11% للعطور ومستحضرات العناية'
      },
      noon_eg: {
        referralPercent: 12.0,
        fixedClosingFeeEGP: 6,
        fulfillmentEstimatedEGP: 20,
        paymentProcessingPercent: 2.2,
        notesAr: 'عمولة 12% على منتجات Beauty'
      },
      jumia_eg: {
        referralPercent: 13.5,
        fixedClosingFeeEGP: 4,
        fulfillmentEstimatedEGP: 22,
        paymentProcessingPercent: 2.0,
        notesAr: 'عمولة 13.5% لمستحضرات التجميل'
      },
      kenzz: {
        referralPercent: 8.5,
        fixedClosingFeeEGP: 3,
        fulfillmentEstimatedEGP: 16,
        paymentProcessingPercent: 1.5,
        notesAr: 'عمولة 8.5% لمنتجات العناية بالبشرة'
      },
      homzmart: {
        referralPercent: 13.0,
        fixedClosingFeeEGP: 8,
        fulfillmentEstimatedEGP: 26,
        paymentProcessingPercent: 2.5,
        notesAr: 'منتجات العناية المنزلية والشخصية'
      }
    }
  }
];

// Helper to auto-detect matching category from product
export function detectCategoryKeyFromProduct(product?: ProductData | null): string {
  if (!product) return 'audio_headphones';
  const cat = (product.category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  if (cat.includes('صوتيات') || cat.includes('سماعات') || title.includes('سماعة') || title.includes('headphone') || title.includes('earbuds')) {
    return 'audio_headphones';
  }
  if (cat.includes('موبايل') || cat.includes('هواتف') || title.includes('galaxy') || title.includes('iphone') || title.includes('xiaomi') || title.includes('سامسونج')) {
    return 'smartphones_tablets';
  }
  if (cat.includes('شواحن') || cat.includes('ساعات') || cat.includes('إكسسوار') || title.includes('شاحن') || title.includes('ساعة ذكية') || title.includes('power bank')) {
    return 'electronics_accessories';
  }
  if (cat.includes('منزلية') || cat.includes('مطبخ') || title.includes('قلاية') || title.includes('خلاط') || title.includes('فرن') || title.includes('air fryer')) {
    return 'home_appliances';
  }
  if (cat.includes('أثاث') || cat.includes('ديكور') || title.includes('كرسي') || title.includes('طاولة') || title.includes('مفرش')) {
    return 'furniture_decor';
  }
  if (cat.includes('ملابس') || cat.includes('أزياء') || title.includes('قميص') || title.includes('حذاء') || title.includes('شنطة')) {
    return 'fashion_apparel';
  }
  if (cat.includes('تجميل') || cat.includes('عناية') || title.includes('عطر') || title.includes('كريم')) {
    return 'beauty_personal_care';
  }

  return 'audio_headphones';
}

// Calculate Full Platform Fee Breakdown & Net Profit for a single platform
export function calculateSinglePlatformFees(
  platformKey: PlatformKey,
  sellingPriceEGP: number,
  wholesaleCostEGP: number,
  categoryRule: CategoryCommissionRule,
  customOverrides?: {
    customReferralPercent?: number;
    customFulfillmentEGP?: number;
    customFixedFeeEGP?: number;
    customPaymentProcessingPercent?: number;
  }
): PlatformFeeCalculationResult {
  const meta = PLATFORMS_METADATA[platformKey];
  const rateConfig = categoryRule.rates[platformKey];

  const referralPercent = customOverrides?.customReferralPercent !== undefined
    ? customOverrides.customReferralPercent
    : rateConfig.referralPercent;

  const fixedClosingFee = customOverrides?.customFixedFeeEGP !== undefined
    ? customOverrides.customFixedFeeEGP
    : rateConfig.fixedClosingFeeEGP;

  const fulfillmentFee = customOverrides?.customFulfillmentEGP !== undefined
    ? customOverrides.customFulfillmentEGP
    : rateConfig.fulfillmentEstimatedEGP;

  const paymentGatewayPercent = customOverrides?.customPaymentProcessingPercent !== undefined
    ? customOverrides.customPaymentProcessingPercent
    : rateConfig.paymentProcessingPercent;

  // 1. Referral Fee Amount
  const referralFeeAmount = Math.round((sellingPriceEGP * (referralPercent / 100)) * 100) / 100;

  // 2. Payment Gateway Amount
  const paymentGatewayAmount = Math.round((sellingPriceEGP * (paymentGatewayPercent / 100)) * 100) / 100;

  // 3. Subtotal Platform Fees before VAT
  const subtotalFeesBeforeVAT = referralFeeAmount + fixedClosingFee + fulfillmentFee + paymentGatewayAmount;

  // 4. Egyptian VAT (14% on all platform services and fees)
  const vatOnFees = Math.round((subtotalFeesBeforeVAT * (meta.vatRatePercent / 100)) * 100) / 100;

  // 5. Total Platform Deductions
  const totalPlatformDeductions = Math.round((subtotalFeesBeforeVAT + vatOnFees) * 100) / 100;

  // 6. Net Payout deposited to Merchant
  const netPayoutToMerchant = Math.round((sellingPriceEGP - totalPlatformDeductions) * 100) / 100;

  // 7. Net Profit
  const netProfit = Math.round((netPayoutToMerchant - wholesaleCostEGP) * 100) / 100;

  // 8. Margins & ROI
  const profitMarginPercent = sellingPriceEGP > 0
    ? Math.round(((netProfit / sellingPriceEGP) * 100) * 10) / 10
    : 0;

  const roiPercent = wholesaleCostEGP > 0
    ? Math.round(((netProfit / wholesaleCostEGP) * 100) * 10) / 10
    : 0;

  // 9. Break-even Price: Price where Net Profit == 0
  // SellingPrice - [(SellingPrice * (Ref% + Gate%)) + FixedFees] * 1.14 - Cost = 0
  // SellingPrice * [1 - (Ref% + Gate%) * 1.14] = Cost + (FixedFees * 1.14)
  const feePercentTotal = (referralPercent + paymentGatewayPercent) / 100;
  const vatFactor = 1 + (meta.vatRatePercent / 100);
  const fixedTotalWithVAT = (fixedClosingFee + fulfillmentFee) * vatFactor;
  const denominator = 1 - (feePercentTotal * vatFactor);

  const breakEvenSellingPrice = denominator > 0
    ? Math.round((wholesaleCostEGP + fixedTotalWithVAT) / denominator)
    : Math.round(wholesaleCostEGP * 1.25);

  // Recommended price for 15% net profit margin
  // (SellingPrice - Deductions - Cost) / SellingPrice = 0.15
  // SellingPrice * (denominator - 0.15) = Cost + fixedTotalWithVAT
  const recDenominator = denominator - 0.15;
  const recommendedMinimumPrice = recDenominator > 0
    ? Math.round((wholesaleCostEGP + fixedTotalWithVAT) / recDenominator)
    : Math.round(breakEvenSellingPrice * 1.2);

  return {
    platformId: platformKey,
    platformName: meta.name,
    platformNameAr: meta.nameAr,
    logoEmoji: meta.logoEmoji,
    sellingPriceEGP,
    wholesaleCostEGP,
    referralFeePercent: referralPercent,
    referralFeeAmountEGP: referralFeeAmount,
    fixedClosingFeeEGP: fixedClosingFee,
    fulfillmentFeeEGP: fulfillmentFee,
    paymentGatewayPercent,
    paymentGatewayAmountEGP: paymentGatewayAmount,
    subtotalFeesBeforeVATEGP: subtotalFeesBeforeVAT,
    vatOnFeesEGP: vatOnFees,
    totalPlatformDeductionsEGP: totalPlatformDeductions,
    netPayoutToMerchantEGP: netPayoutToMerchant,
    netProfitEGP: netProfit,
    profitMarginPercent,
    roiPercent,
    breakEvenSellingPriceEGP: breakEvenSellingPrice,
    recommendedMinimumPriceEGP: recommendedMinimumPrice,
    isMostProfitable: false,
    profitabilityRank: 1
  };
}

// Calculate and compare all 5 platforms simultaneously
export function calculateMultiPlatformComparison(
  product?: ProductData | null,
  sellingPriceEGP?: number,
  wholesaleCostEGP?: number,
  categoryKey?: string,
  customOverridesByPlatform?: Partial<Record<PlatformKey, {
    customReferralPercent?: number;
    customFulfillmentEGP?: number;
    customFixedFeeEGP?: number;
    customPaymentProcessingPercent?: number;
  }>>
): MultiPlatformCommissionSummary {
  const activeCategoryKey = categoryKey || detectCategoryKeyFromProduct(product);
  const categoryRule = CATEGORY_COMMISSION_RULES.find(c => c.categoryKey === activeCategoryKey) || CATEGORY_COMMISSION_RULES[0];

  const retailPrice = sellingPriceEGP !== undefined ? sellingPriceEGP : (product?.suggestedRetailPrice || product?.currentLowestPrice || 1500);
  const costPrice = wholesaleCostEGP !== undefined ? wholesaleCostEGP : (product?.estimatedWholesaleCost || Math.round(retailPrice * 0.75));

  const platformKeys: PlatformKey[] = ['amazon_eg', 'noon_eg', 'jumia_eg', 'kenzz', 'homzmart'];

  const results = platformKeys.map(key => {
    return calculateSinglePlatformFees(
      key,
      retailPrice,
      costPrice,
      categoryRule,
      customOverridesByPlatform?.[key]
    );
  });

  // Sort by net profit descending to rank profitability
  const sorted = [...results].sort((a, b) => b.netProfitEGP - a.netProfitEGP);
  const highestProfit = sorted[0].netProfitEGP;

  results.forEach(res => {
    const rank = sorted.findIndex(s => s.platformId === res.platformId) + 1;
    res.profitabilityRank = rank;
    res.isMostProfitable = res.netProfitEGP === highestProfit;
  });

  const mostProfitable = results.find(r => r.isMostProfitable) || results[0];
  const averageProfit = Math.round(results.reduce((acc, curr) => acc + curr.netProfitEGP, 0) / results.length);
  const lowestProfit = sorted[sorted.length - 1].netProfitEGP;
  const profitSpread = Math.round((highestProfit - lowestProfit) * 100) / 100;

  return {
    productId: product.id,
    productTitle: product.title,
    categoryKey: categoryRule.categoryKey,
    categoryNameAr: categoryRule.categoryNameAr,
    sellingPriceEGP: retailPrice,
    wholesaleCostEGP: costPrice,
    platformResults: results,
    mostProfitablePlatform: mostProfitable,
    averageProfitEGP: averageProfit,
    profitSpreadEGP: profitSpread
  };
}
