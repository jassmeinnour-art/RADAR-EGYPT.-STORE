import { MerchantCatalogProduct } from '../types';

export interface StockoutPrediction {
  productId: string;
  productTitle: string;
  currentStock: number;
  dailySalesVelocity: number; // units sold per day
  daysToStockout: number; // days until stock hits 0
  estimatedStockoutDate: string;
  leadTimeDays: number; // average lead time to restock in FBA/FBN warehouses in Egypt (default 5 days)
  safetyStockUnits: number;
  reorderPointUnits: number; // Reorder Point (ROP) = (Daily Sales Velocity × Lead Time) + Safety Stock
  recommendedReorderQty: number; // Suggested replenishment quantity
  riskLevel: 'critical' | 'warning' | 'healthy';
  riskBadge: {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: string;
  };
  aiAdvisorSummary?: string;
  egyptFulfillmentInsights?: {
    fbaLeadTime: string;
    fbnLeadTime: string;
    wholesaleHubRecommendation: string;
    peakSeasonMultiplier: number;
  };
}

/**
 * Pure calculation helper to derive stockout velocity, ROP, days remaining, and risk tier.
 */
export function calculateProductStockoutMetrics(
  product: Partial<MerchantCatalogProduct>,
  customDailySales?: number,
  customLeadTime: number = 5
): StockoutPrediction {
  const stock = Math.max(0, product.stockQuantity ?? 12);
  
  // Calculate daily sales velocity. If not provided, simulate based on price/platform or low stock threshold
  let dailyVelocity = customDailySales;
  if (dailyVelocity === undefined || dailyVelocity <= 0) {
    // Derive realistic velocity: higher for buybox winners or lower-priced items
    const basePrice = product.merchantPrice || product.buyBoxPrice || 1000;
    if (basePrice < 800) {
      dailyVelocity = 2.8;
    } else if (basePrice < 2500) {
      dailyVelocity = 1.6;
    } else {
      dailyVelocity = 0.8;
    }

    if (product.isBuyBoxWinner) {
      dailyVelocity = Number((dailyVelocity * 1.4).toFixed(1));
    }
  }

  dailyVelocity = Math.max(0.1, dailyVelocity);
  
  const daysRemaining = Math.floor(stock / dailyVelocity);

  // Safety stock = 3 days of sales velocity
  const safetyStockUnits = Math.ceil(dailyVelocity * 3);
  
  // Reorder Point (ROP) = (Daily Velocity × Lead Time) + Safety Stock
  const reorderPointUnits = Math.ceil((dailyVelocity * customLeadTime) + safetyStockUnits);

  // Recommended Reorder Quantity (Target 30-day inventory coverage)
  const target30DayUnits = Math.ceil(dailyVelocity * 30);
  const recommendedReorderQty = Math.max(10, target30DayUnits + safetyStockUnits - stock);

  // Calculate estimated stockout date
  const now = new Date();
  const stockoutDateObj = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const estimatedStockoutDate = stockoutDateObj.toLocaleDateString('ar-EG', dateOptions);

  // Risk Classification
  let riskLevel: 'critical' | 'warning' | 'healthy' = 'healthy';
  let badgeLabel = '';
  let badgeBg = '';
  let badgeText = '';
  let badgeBorder = '';
  let badgeIcon = '🟢';

  if (daysRemaining <= customLeadTime) {
    riskLevel = 'critical';
    badgeLabel = daysRemaining === 0 ? '🔴 نفاد مخزون كلي اليوم!' : `🔴 نفاد وشيك خلال ${daysRemaining} أيام`;
    badgeBg = 'bg-rose-100';
    badgeText = 'text-rose-900';
    badgeBorder = 'border-rose-300';
    badgeIcon = '🔴';
  } else if (daysRemaining <= customLeadTime + 7) {
    riskLevel = 'warning';
    badgeLabel = `🟡 نفاد محتمل خلال ${daysRemaining} يوماً`;
    badgeBg = 'bg-amber-100';
    badgeText = 'text-amber-900';
    badgeBorder = 'border-amber-300';
    badgeIcon = '🟡';
  } else {
    riskLevel = 'healthy';
    badgeLabel = `🟢 مخزون آمن (${daysRemaining} يوماً)`;
    badgeBg = 'bg-emerald-100';
    badgeText = 'text-emerald-900';
    badgeBorder = 'border-emerald-300';
    badgeIcon = '🟢';
  }

  return {
    productId: product.id || 'prod-unknown',
    productTitle: product.title || 'منتج غير محدد',
    currentStock: stock,
    dailySalesVelocity: Number(dailyVelocity.toFixed(1)),
    daysToStockout: daysRemaining,
    estimatedStockoutDate,
    leadTimeDays: customLeadTime,
    safetyStockUnits,
    reorderPointUnits,
    recommendedReorderQty,
    riskLevel,
    riskBadge: {
      label: badgeLabel,
      bg: badgeBg,
      text: badgeText,
      border: badgeBorder,
      icon: badgeIcon
    },
    egyptFulfillmentInsights: {
      fbaLeadTime: '2 - 4 أيام عمل (مستودع أمازون بالعاشر من رمضان / 6 أكتوبر)',
      fbnLeadTime: '3 - 5 أيام عمل (مستودع نون بطريق مصر الإسماعيلية)',
      wholesaleHubRecommendation: 'استلام كاش فوري من شارع عبد العزيز أو مول البستان القاهرة',
      peakSeasonMultiplier: product.category?.includes('رمضان') ? 1.8 : 1.2
    }
  };
}

/**
 * Fetches AI Stock Depletion Forecast from the backend endpoint `/api/gemini/inventory-forecast`.
 */
export async function fetchAIStockoutForecast(
  product: Partial<MerchantCatalogProduct>,
  customDailySales?: number,
  customLeadTime: number = 5
): Promise<StockoutPrediction & { aiAdvisorSummary: string }> {
  const localPrediction = calculateProductStockoutMetrics(product, customDailySales, customLeadTime);

  try {
    const response = await fetch('/api/gemini/inventory-forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: {
          id: product.id,
          title: product.title,
          sku: product.sku,
          asin: product.asin,
          brand: product.brand,
          category: product.category,
          stockQuantity: product.stockQuantity,
          merchantPrice: product.merchantPrice,
          buyBoxPrice: product.buyBoxPrice,
          platform: product.platform,
          estimatedCostEGP: product.estimatedCostEGP
        },
        metrics: localPrediction
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return {
          ...localPrediction,
          aiAdvisorSummary: result.data.aiAdvisorSummary || result.data.analysis,
          recommendedReorderQty: result.data.recommendedReorderQty || localPrediction.recommendedReorderQty,
          egyptFulfillmentInsights: result.data.egyptFulfillmentInsights || localPrediction.egyptFulfillmentInsights
        };
      }
    }
  } catch (err) {
    console.warn('[Inventory Forecast] Backend Gemini call failed or offline, using dynamic fallback:', err);
  }

  // Dynamic Arabic fallback advice if offline
  const fallbackAdvice = localPrediction.riskLevel === 'critical'
    ? `⚠️ تحذير عاجل لتاجر مصر: المخزون الحالي (${localPrediction.currentStock} قطعة) سينفد كلياً بحلول ${localPrediction.estimatedStockoutDate} بناءً على معدل بيع يومي ${localPrediction.dailySalesVelocity} قطعة/يوم. يُنصح بإرسال طلب توريد عاجل بـ ${localPrediction.recommendedReorderQty} قطعة إلى المورد بشارع عبد العزيز أو مول البستان لتفادي فقدان صدارة الـ Buy Box في أمازون ونون مصر.`
    : localPrediction.riskLevel === 'warning'
    ? `📊 تنبيه إعادة الطلب: المخزون يكفي لمدة ${localPrediction.daysToStockout} يوماً. نوصي بتجهيز أمر الشراء قبل الوصول لنقطة إعادة الطلب (${localPrediction.reorderPointUnits} قطعة) لتغطية فترة الشحن والاستلام بمخازن FBA/FBN.`
    : `✅ حالة المخزون آمنة ومستقرة. المخزون الحالي يتجاوز حد الخطر ويغطي مبيعات أكثر من 14 يوماً بمعدل بيع ${localPrediction.dailySalesVelocity} قطعة/يوم.`;

  return {
    ...localPrediction,
    aiAdvisorSummary: fallbackAdvice
  };
}
