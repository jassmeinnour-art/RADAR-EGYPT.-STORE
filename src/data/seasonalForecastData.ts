import {
  ProductData,
  SeasonalPeakEvent,
  ProductSeasonalDemandForecast,
  SeasonalForecastDataPoint
} from '../types';
import { VERIFIED_AMAZON_EG_PRODUCTS } from '../services/livePlatformProductSync';

// Egyptian Peak Shopping Events Calendar
export const EGYPTIAN_PEAK_SEASONS: SeasonalPeakEvent[] = [
  {
    id: 'white_friday',
    name: 'موسم الجمعة البيضاء وتخفيضات نوفمبر (White Friday 2026)',
    shortName: 'الجمعة البيضاء (White Friday)',
    dateRangeLabel: '20 نوفمبر - 30 نوفمبر',
    startDate: '2026-11-20',
    endDate: '2026-11-30',
    daysUntilPeak: 86,
    historicalDemandMultiplier: 3.8,
    description: 'أضخم موسم تسوق إلكتروني سنوي في مصر على أمازون، نون، وجوميا. تتضاعف فيه مبيعات الأثاث والتجهيزات المنزلية والمكتبية بنسبة تصل إلى +380%.',
    keyCategories: ['أثاث ومفروشات وديكور', 'تجهيزات مكتبية ومكاتب', 'أجهزة منزلية ومطبخ', 'طاولات وكراسي'],
    recommendedLeadTimeDays: 21,
    discountDepthAverage: 25,
    urgencyLevel: 'upcoming'
  },
  {
    id: 'back_to_school',
    name: 'موسم العودة للمدارس والجامعات (Back to School 2026)',
    shortName: 'العودة للمدارس والجامعات',
    dateRangeLabel: '1 سبتمبر - 30 سبتمبر',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    daysUntilPeak: 6,
    historicalDemandMultiplier: 2.9,
    description: 'موسم ذروة شراء مكاتب المذاكرة المنزلية، كراسي المكاتب الطبية، وحدات التخزين، والمكتبات المدمجة للطلاب والمعلمين.',
    keyCategories: ['أثاث مكتبي ومكاتب دراسة', 'كراسي طبية هيدروليك', 'طاولات ووحدات تخزين'],
    recommendedLeadTimeDays: 10,
    discountDepthAverage: 15,
    urgencyLevel: 'urgent'
  },
  {
    id: 'single_day_11_11',
    name: 'مهرجان التخفيضات الكبرى 11.11 (Singles Day)',
    shortName: 'تخفيضات 11.11 الكبرى',
    dateRangeLabel: '10 نوفمبر - 13 نوفمبر',
    startDate: '2026-11-10',
    endDate: '2026-11-13',
    daysUntilPeak: 76,
    historicalDemandMultiplier: 3.2,
    description: 'حملة العروض الفلاش السريعة على منصات نون وهومزمارت وأمازون مصر. تدفق طلبات استثنائي على الأثاث والديكور خلال 72 ساعة.',
    keyCategories: ['أثاث ومفروشات وديكور', 'طاولات قهوة وركنات', 'تجهيزات منزلية'],
    recommendedLeadTimeDays: 14,
    discountDepthAverage: 20,
    urgencyLevel: 'upcoming'
  },
  {
    id: 'ramadan_eid',
    name: 'موسم شهر رمضان المبارك وعيد الفطر',
    shortName: 'موسم رمضان وعيد الفطر',
    dateRangeLabel: '1 مارس - 5 أبريل',
    startDate: '2027-03-01',
    endDate: '2027-04-05',
    daysUntilPeak: 187,
    historicalDemandMultiplier: 3.5,
    description: 'ارتفاع قياسي في تجديد صالونات وركنات المنازل، طاولات الضيافة، تجهيزات المطبخ، وأطقم الاستقبال.',
    keyCategories: ['أثاث معيشة وركنات', 'طاولات ضيافة وقهوة', 'أجهزة منزلية ومطبخ'],
    recommendedLeadTimeDays: 25,
    discountDepthAverage: 18,
    urgencyLevel: 'planned'
  },
  {
    id: 'summer_clearance',
    name: 'موسم تصفيات الصيف والرحلات',
    shortName: 'تصفيات الصيف والرحلات',
    dateRangeLabel: '15 يوليو - 15 أغسطس',
    startDate: '2027-07-15',
    endDate: '2027-08-15',
    daysUntilPeak: 323,
    historicalDemandMultiplier: 2.3,
    description: 'طلب متزايد على أثاث الشاليهات والساحل، كراسي الاسترخاء والحدائق، والأطقم الخارجية المقاومة للشمس.',
    keyCategories: ['أثاث خارجي وحدائق', 'كراسي استرخاء', 'أثاث خفيف وشاليهات'],
    recommendedLeadTimeDays: 12,
    discountDepthAverage: 15,
    urgencyLevel: 'planned'
  }
];

// Calculate Realistic Stock & Demand Forecasting for a single product
export function calculateProductSeasonalDemandForecast(
  product: ProductData,
  event: SeasonalPeakEvent,
  safetyBufferPercent: number = 25,
  supplierLeadTimeDays: number = 10,
  simulatedCurrentStock?: number,
  simulatedDailyVelocity?: number
): ProductSeasonalDemandForecast {
  // Baseline daily sales velocity (units/day)
  let velocity = simulatedDailyVelocity !== undefined 
    ? simulatedDailyVelocity 
    : (product.category.includes('أثاث') ? 5.5 : 4.0);

  // Current stock available in merchant warehouse / FBA / FBN
  let currentStock = simulatedCurrentStock !== undefined
    ? simulatedCurrentStock
    : Math.floor(velocity * 8 + 12);

  // Multiplier from event
  const multiplier = event.historicalDemandMultiplier;
  const peakDailyVelocity = Math.round((velocity * multiplier) * 10) / 10;

  // Duration of peak campaign in days (average 10 days)
  const peakCampaignDurationDays = 10;
  const expectedTotalPeakDemandUnits = Math.round(peakDailyVelocity * peakCampaignDurationDays);

  // Days of inventory remaining at current velocity
  const daysOfInventoryAtCurrentRate = Math.round(currentStock / Math.max(0.1, velocity));
  // Days of inventory remaining at peak velocity
  const daysOfInventoryAtPeakRate = Math.round(currentStock / Math.max(0.1, peakDailyVelocity));

  // Calculate days until stockout
  const daysUntilStockout = Math.min(daysOfInventoryAtCurrentRate, Math.round(currentStock / ((velocity + peakDailyVelocity) / 2)));

  // Stockout Risk Severity
  let severity: 'critical' | 'high_risk' | 'moderate' | 'safe' = 'safe';
  if (daysUntilStockout <= supplierLeadTimeDays) {
    severity = 'critical'; // Will run out before new PO arrives
  } else if (daysUntilStockout <= supplierLeadTimeDays + 7 || daysOfInventoryAtPeakRate < peakCampaignDurationDays) {
    severity = 'high_risk'; // Will run out in middle of peak season
  } else if (daysOfInventoryAtPeakRate < peakCampaignDurationDays * 1.5) {
    severity = 'moderate';
  } else {
    severity = 'safe';
  }

  // Recommended Reorder Units
  const bufferMultiplier = 1 + (safetyBufferPercent / 100);
  const totalNeededForPeak = Math.round(expectedTotalPeakDemandUnits * bufferMultiplier);
  const recommendedReorderUnits = Math.max(0, totalNeededForPeak - currentStock);

  // Financial calculations
  const wholesaleCost = product.estimatedWholesaleCost || Math.round(product.currentLowestPrice * 0.78);
  const retailPrice = product.suggestedRetailPrice || product.currentLowestPrice;
  const totalReorderInvestment = recommendedReorderUnits * wholesaleCost;
  const projectedPeakRevenue = totalNeededForPeak * retailPrice;
  const projectedPeakNetProfit = totalNeededForPeak * (retailPrice - wholesaleCost);
  const estimatedLostRevenueIfStockout = Math.round(Math.max(0, totalNeededForPeak - currentStock) * retailPrice);

  // Calculate Reorder Deadline Date
  const today = new Date(2026, 7, 26); // August 26, 2026
  const deadlineDays = Math.max(1, daysUntilStockout - supplierLeadTimeDays);
  const deadlineDateObj = new Date(today);
  deadlineDateObj.setDate(today.getDate() + deadlineDays);
  const reorderDeadlineDate = `${deadlineDateObj.getDate()} / ${deadlineDateObj.getMonth() + 1} / ${deadlineDateObj.getFullYear()}`;

  const stockoutDateObj = new Date(today);
  stockoutDateObj.setDate(today.getDate() + daysUntilStockout);
  const expectedStockoutDate = `${stockoutDateObj.getDate()} / ${stockoutDateObj.getMonth() + 1} / ${stockoutDateObj.getFullYear()}`;

  // Preferred Wholesale Market
  let market = 'شارع عبد العزيز - العتبة، القاهرة';
  if (product.category.includes('صوتيات') || product.category.includes('شواحن')) {
    market = 'سوق باب اللوق ومول البستان، وسط البلد';
  } else if (product.category.includes('أجهزة منزلية')) {
    market = 'شارع الأزهر وحارة اليهود والموسكي، القاهرة';
  }

  // Action plan
  let actionPlan = `قم بإصدار أمر توريد لـ ${recommendedReorderUnits} قطعة قبل تاريخ ${reorderDeadlineDate} لتغطية الطلب المتوقع وحجز بضاعة المستوردين قبل ارتفاع أسعار الجملة.`;
  if (severity === 'critical') {
    actionPlan = `🚨 تنبيه حرج: المخزون الحالي (${currentStock} قطعة) سينفد خلال ${daysUntilStockout} أيام قبل وصول أي شحنة جديدة! اطلب فوراً من موردي ${market}.`;
  } else if (severity === 'safe') {
    actionPlan = `✅ المخزون الحالي كافٍ ومريح (${currentStock} قطعة) لتغطية ذروة ${event.shortName} مع هامش أمان ممتاز.`;
  }

  // Generate Daily Forecast Timeline Data for Chart (30 days timeline)
  const timeline: SeasonalForecastDataPoint[] = [];
  let simulatedStock = currentStock;
  const monthsArabic = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  for (let i = 0; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dateLabel = `${d.getDate()} ${monthsArabic[d.getMonth()]}`;

    // Demand curves: ramp up towards peak
    const rampFactor = i < 10 ? 1 : (i < 20 ? 1 + ((multiplier - 1) * ((i - 10) / 10)) : multiplier);
    const dailyDemand = Math.round(velocity * rampFactor);
    
    simulatedStock = Math.max(0, simulatedStock - dailyDemand);

    timeline.push({
      date: dateStr,
      dateLabel,
      dayIndex: i,
      baselineDemandUnits: Math.round(velocity),
      projectedPeakDemandUnits: dailyDemand,
      remainingStockUnits: simulatedStock,
      stockoutThreshold: 10,
      isStockoutOccurred: simulatedStock <= 0
    });
  }

  return {
    productId: product.id,
    productTitle: product.title,
    productImage: product.imageUrl,
    sku: product.sku || `SKU-${product.id.substring(0, 6).toUpperCase()}`,
    category: product.category,
    currentStockUnits: currentStock,
    dailySalesVelocity: velocity,
    peakEventId: event.id,
    peakEventName: event.name,
    historicalMultiplier: multiplier,
    projectedPeakDailyVelocity: peakDailyVelocity,
    expectedTotalPeakDemandUnits,
    daysOfInventoryAtCurrentRate,
    daysOfInventoryAtPeakRate,
    expectedStockoutDate,
    stockoutAlertSeverity: severity,
    daysUntilStockout,
    recommendedReorderUnits,
    safetyBufferPercent,
    wholesaleUnitCostEGP: wholesaleCost,
    totalReorderInvestmentEGP: totalReorderInvestment,
    projectedPeakRevenueEGP: projectedPeakRevenue,
    projectedPeakNetProfitEGP: projectedPeakNetProfit,
    estimatedLostRevenueIfStockoutEGP: estimatedLostRevenueIfStockout,
    reorderDeadlineDate,
    supplierLeadTimeDays,
    preferredWholesaleMarket: market,
    actionPlanSummary: actionPlan,
    forecastDailyTimeline: timeline
  };
}

// Generate full list of forecasts for all products
export function generateAllSeasonalForecasts(
  products: ProductData[] = [],
  selectedEventId: string = 'white_friday',
  safetyBufferPercent: number = 25,
  supplierLeadTimeDays: number = 10
): {
  event: SeasonalPeakEvent;
  forecasts: ProductSeasonalDemandForecast[];
  totalRecommendedInvestment: number;
  totalProjectedPeakRevenue: number;
  totalAtRiskRevenue: number;
  criticalCount: number;
  highRiskCount: number;
} {
  const event = EGYPTIAN_PEAK_SEASONS.find(e => e.id === selectedEventId) || EGYPTIAN_PEAK_SEASONS[0];

  if (!products || products.length === 0) {
    return {
      event,
      forecasts: [],
      totalRecommendedInvestment: 0,
      totalProjectedPeakRevenue: 0,
      totalAtRiskRevenue: 0,
      criticalCount: 0,
      highRiskCount: 0
    };
  }

  // Specific simulation stock variations for realism
  const stockSeedMap: Record<string, { stock: number; vel: number }> = {
    'prod-1': { stock: 18, vel: 6.5 }, // Anker Q30 - Critical in peak
    'prod-2': { stock: 8, vel: 3.5 },  // Samsung S24 - Critical
    'prod-3': { stock: 45, vel: 4.8 }, // Xiaomi 13T - Moderate
    'prod-4': { stock: 120, vel: 5.2 }, // Smart Watch - Safe
    'prod-5': { stock: 14, vel: 3.0 }, // Air Fryer - High Risk
  };

  const forecasts = products.map(p => {
    const seed = stockSeedMap[p.id];
    return calculateProductSeasonalDemandForecast(
      p,
      event,
      safetyBufferPercent,
      supplierLeadTimeDays,
      seed?.stock,
      seed?.vel
    );
  });

  const totalRecommendedInvestment = forecasts.reduce((acc, curr) => acc + curr.totalReorderInvestmentEGP, 0);
  const totalProjectedPeakRevenue = forecasts.reduce((acc, curr) => acc + curr.projectedPeakRevenueEGP, 0);
  const totalAtRiskRevenue = forecasts.reduce((acc, curr) => acc + curr.estimatedLostRevenueIfStockoutEGP, 0);
  const criticalCount = forecasts.filter(f => f.stockoutAlertSeverity === 'critical').length;
  const highRiskCount = forecasts.filter(f => f.stockoutAlertSeverity === 'high_risk').length;

  return {
    event,
    forecasts,
    totalRecommendedInvestment,
    totalProjectedPeakRevenue,
    totalAtRiskRevenue,
    criticalCount,
    highRiskCount
  };
}
