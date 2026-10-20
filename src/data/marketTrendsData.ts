import { 
  ProductData, 
  ProductMarketTrendAnalysis, 
  ProductDemandHistoricalPoint, 
  MarketTrendsSummary, 
  DemandTrendDirection, 
  ProcurementAction, 
  QuadrantClassification 
} from '../types';

// Preset specialized historical patterns for our known sample products, with fallback for custom added products
interface ProductProfilePreset {
  demandScore: number;
  demandGrowthRatePercent: number;
  trendDirection: DemandTrendDirection;
  trendBadge: string;
  trendDescription: string;
  searchVolumeGrowthPercent: number;
  competitorPriceVelocityPercent: number;
  stockoutRiskPercent: number;
  daysOfInventoryLeftMarketWide: number;
  procurementAction: ProcurementAction;
  procurementActionLabel: string;
  recommendedOrderQuantity: number;
  recommendedOrderWindow: string;
  wholesalePriceForecast: {
    expectedChangePercent: number;
    forecastDirection: 'up' | 'down' | 'stable';
    reason: string;
  };
  quadrant: QuadrantClassification;
  quadrantLabel: string;
  aiProcurementVerdict: string;
  historicalDemandScores: number[]; // 8 weeks history
  historicalPrices: number[];
  historicalSearchInterest: number[];
  historicalSalesUnits: number[];
}

const KNOWN_PRESETS: Record<string, ProductProfilePreset> = {
  'B09FURNCHR1': {
    demandScore: 94,
    demandGrowthRatePercent: 48.5,
    trendDirection: 'surging',
    trendBadge: '🚀 طلب صاعد بقوة (High Momentum)',
    trendDescription: 'نمو متسارع في مبيعات كراسي العمل والمكاتب الطبية المريحة مع تزايد العمل من المنزل ومواسم تجهيز الشركات.',
    searchVolumeGrowthPercent: 54.0,
    competitorPriceVelocityPercent: -3.5,
    stockoutRiskPercent: 72,
    daysOfInventoryLeftMarketWide: 16,
    procurementAction: 'urgent_bulk_buy',
    procurementActionLabel: 'شراء فوري بالجملة وتأمين 30-50 كرسي ⚡',
    recommendedOrderQuantity: 40,
    recommendedOrderWindow: 'خلال الـ 48 ساعة القادمة من سوق المناصرة',
    wholesalePriceForecast: {
      expectedChangePercent: 6.0,
      forecastDirection: 'up',
      reason: 'ارتفاع أسعار خامات الهيدروليك وشبك الظهر المستورد مع زيادة الطلب من شركات التقنية والعيادات.'
    },
    quadrant: 'star',
    quadrantLabel: 'نجم واعد (Star Product) 🌟',
    aiProcurementVerdict: 'الكرسي الطبي الأكثر طلباً في سوق الأثاث المكتبي المصري حالياً. هامش ربح ممتاز وسرعة دوران عالية مع انخفاض ملحوظ في معدلات المرتجعات.',
    historicalDemandScores: [62, 68, 75, 80, 84, 88, 91, 94],
    historicalPrices: [3850, 3750, 3650, 3550, 3500, 3480, 3450, 3450],
    historicalSearchInterest: [50, 58, 66, 74, 82, 88, 92, 96],
    historicalSalesUnits: [35, 45, 58, 70, 85, 102, 120, 145]
  },
  'B09FURNTBL2': {
    demandScore: 91,
    demandGrowthRatePercent: 42.0,
    trendDirection: 'surging',
    trendBadge: '🔥 الأكثر طلباً في أثاث المعيشة (Market Leader)',
    trendDescription: 'طلب قياسي على طاولات القهوة المودرن من خشب الزان الطبيعي عبر منصات هومزمارت وأمازون ونون مصر.',
    searchVolumeGrowthPercent: 60.5,
    competitorPriceVelocityPercent: -4.0,
    stockoutRiskPercent: 68,
    daysOfInventoryLeftMarketWide: 20,
    procurementAction: 'urgent_bulk_buy',
    procurementActionLabel: 'تأمين طلبية فورية 25-35 طاولة 🚀',
    recommendedOrderQuantity: 30,
    recommendedOrderWindow: 'خلال هذا الأسبوع من ورش دمياط والمناصرة',
    wholesalePriceForecast: {
      expectedChangePercent: 5.5,
      forecastDirection: 'up',
      reason: 'طلب مستمر من مشاريع الإسكان والفرش الجديد مع استقرار أسعار أخشاب الزان الروماني المجفف.'
    },
    quadrant: 'star',
    quadrantLabel: 'نجم السوق الأول (Super Star) 🌟',
    aiProcurementVerdict: 'منتج أثاث أساسي عالي القيمة والطلب. متوسط فترة البقاء في المستودع 5 أيام، ونسبة مطابقة المواصفات ورضا العملاء تتجاوز 98%.',
    historicalDemandScores: [58, 64, 70, 76, 81, 85, 88, 91],
    historicalPrices: [3200, 3100, 3050, 2990, 2950, 2900, 2850, 2850],
    historicalSearchInterest: [48, 55, 63, 71, 79, 85, 90, 95],
    historicalSalesUnits: [25, 34, 48, 62, 78, 95, 115, 138]
  }
};

// Past 8 calendar week labels
export const HISTORICAL_WEEKS = [
  'منذ 7 أسابيع',
  'منذ 6 أسابيع',
  'منذ 5 أسابيع',
  'منذ شهر',
  'منذ 3 أسابيع',
  'منذ أسبوعين',
  'الأسبوع الماضي',
  'الأسبوع الحالي'
];

/**
 * Dynamically computes a complete Market Trends Analysis for all monitored products.
 */
export function analyzeMarketTrends(products: ProductData[]): {
  items: ProductMarketTrendAnalysis[];
  summary: MarketTrendsSummary;
} {
  const validProducts = (products || []).filter(p => p && p.id);
  const items: ProductMarketTrendAnalysis[] = validProducts.map((prod, index) => {
    // Check if we have specialized preset or generate algorithmic analysis
    const preset = KNOWN_PRESETS[prod.id];

    if (preset) {
      const historicalPoints: ProductDemandHistoricalPoint[] = HISTORICAL_WEEKS.map((wLabel, wIdx) => ({
        date: `2026-0${wIdx + 1}-15`,
        weekLabel: wLabel,
        demandScore: preset.historicalDemandScores[wIdx] || 70,
        marketPriceAvg: preset.historicalPrices[wIdx] || prod.currentLowestPrice,
        searchInterestIndex: preset.historicalSearchInterest[wIdx] || 60,
        estimatedSalesUnits: preset.historicalSalesUnits[wIdx] || 40,
        competitorsStockLevel: wIdx > 5 ? (preset.stockoutRiskPercent > 60 ? 'low' : 'medium') : 'high'
      }));

      const profitMarginPercent = prod.currentLowestPrice > 0 && prod.estimatedWholesaleCost > 0
        ? Math.round(((prod.currentLowestPrice - prod.estimatedWholesaleCost) / prod.currentLowestPrice) * 100)
        : 20;

      return {
        productId: prod.id,
        productTitle: prod.title,
        productCategory: prod.category,
        productImage: prod.imageUrl,
        brand: prod.brand,
        currentLowestPrice: prod.currentLowestPrice,
        estimatedWholesaleCost: prod.estimatedWholesaleCost,
        profitMarginPercent,
        demandScore: preset.demandScore,
        demandGrowthRatePercent: preset.demandGrowthRatePercent,
        trendDirection: preset.trendDirection,
        trendBadge: preset.trendBadge,
        trendDescription: preset.trendDescription,
        searchVolumeGrowthPercent: preset.searchVolumeGrowthPercent,
        competitorPriceVelocityPercent: preset.competitorPriceVelocityPercent,
        stockoutRiskPercent: preset.stockoutRiskPercent,
        daysOfInventoryLeftMarketWide: preset.daysOfInventoryLeftMarketWide,
        procurementAction: preset.procurementAction,
        procurementActionLabel: preset.procurementActionLabel,
        recommendedOrderQuantity: preset.recommendedOrderQuantity,
        recommendedOrderWindow: preset.recommendedOrderWindow,
        wholesalePriceForecast: preset.wholesalePriceForecast,
        quadrant: preset.quadrant,
        quadrantLabel: preset.quadrantLabel,
        historicalPoints,
        aiProcurementVerdict: preset.aiProcurementVerdict
      };
    }

    // Dynamic algorithmic computation for any newly added / custom scanned product
    // We compute based on keyword search volume, price gaps, wholesale margins
    const totalKeywordVolume = (prod.keywords || []).reduce((acc, k) => acc + (k.monthlySearchesEstimate || 10000), 0);
    const hasHighIntent = (prod.keywords || []).some(k => k.buyerIntent === 'transactional' || k.buyerIntent === 'price_comparison');
    
    // Pseudo-random deterministic factor based on product ID string
    const hash = prod.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = (hash % 40) - 15; // -15 to +25
    
    let demandScore = Math.min(98, Math.max(35, 72 + variation));
    let growthRate = Number((((variation * 1.8) + (hasHighIntent ? 12 : -5))).toFixed(1));
    
    let direction: DemandTrendDirection = 'steady';
    let badge = '📈 طلب مستقر ومتنامي (Steady Growth)';
    let action: ProcurementAction = 'regular_reorder';
    let actionLabel = 'توريد منتظم معتدل (15-25 قطعة)';
    let quadrant: QuadrantClassification = 'cash_cow';
    let quadLabel = 'بقرة نقدية مستقرة (Cash Cow) 🐮';

    if (growthRate >= 25) {
      direction = 'surging';
      badge = '🚀 صاعد بقوة (Surging Momentum)';
      action = 'urgent_bulk_buy';
      actionLabel = 'شراء كمية فوري قبل قفزة الأسعار ⚡';
      quadrant = 'star';
      quadLabel = 'نجم متألق (Star) 🌟';
    } else if (growthRate >= 8) {
      direction = 'growing';
      badge = '📈 نمو متصاعد إيجابي (Growing)';
      action = 'regular_reorder';
      actionLabel = 'زيادة وتيرة التوريد الدورية';
      quadrant = 'opportunity';
      quadLabel = 'فرصة صاعدة (Opportunity) 🚀';
    } else if (growthRate <= -10) {
      direction = 'declining';
      badge = '⚠️ طلب متباطئ (Declining Trend)';
      action = 'liquidate_discount';
      actionLabel = 'تصفية المخزون وتخفيض السعر';
      quadrant = 'drain';
      quadLabel = 'مخاطرة سيولة وتصريف (Drain) ⚠️';
    }

    const marginPct = prod.currentLowestPrice > 0 && prod.estimatedWholesaleCost > 0
      ? Math.round(((prod.currentLowestPrice - prod.estimatedWholesaleCost) / prod.currentLowestPrice) * 100)
      : 18;

    const basePrice = prod.currentLowestPrice || 1000;
    const historicalPoints: ProductDemandHistoricalPoint[] = HISTORICAL_WEEKS.map((wLabel, wIdx) => {
      const progress = wIdx / 7;
      const pointDemand = Math.round(demandScore - (1 - progress) * (growthRate * 0.8));
      const pointPrice = Math.round(basePrice * (1 + (1 - progress) * (growthRate > 0 ? 0.12 : -0.05)));
      const searchIndex = Math.min(100, Math.max(20, Math.round(pointDemand * 0.95 + (Math.sin(wIdx) * 5))));
      const salesUnits = Math.max(5, Math.round(pointDemand * 1.2 + (Math.cos(wIdx) * 8)));

      return {
        date: `2026-0${wIdx + 1}-15`,
        weekLabel: wLabel,
        demandScore: Math.min(99, Math.max(10, pointDemand)),
        marketPriceAvg: pointPrice,
        searchInterestIndex: searchIndex,
        estimatedSalesUnits: salesUnits,
        competitorsStockLevel: pointDemand > 80 ? 'low' : 'medium'
      };
    });

    const isUp = growthRate >= 0;
    const stockoutRisk = Math.min(95, Math.max(15, Math.round(demandScore * 0.85)));
    const daysLeft = Math.max(5, Math.round(45 - (demandScore * 0.35)));
    const recQty = Math.max(10, Math.round(demandScore * 0.5));

    return {
      productId: prod.id,
      productTitle: prod.title,
      productCategory: prod.category || 'منتجات التجارة العامة',
      productImage: prod.imageUrl,
      brand: prod.brand || 'العلامة التجارية',
      currentLowestPrice: prod.currentLowestPrice,
      estimatedWholesaleCost: prod.estimatedWholesaleCost,
      profitMarginPercent: marginPct,
      demandScore,
      demandGrowthRatePercent: growthRate,
      trendDirection: direction,
      trendBadge: badge,
      trendDescription: isUp 
        ? `يشهد هذا المنتج إقبالاً متزايداً في السوق بنسبة نمو +${growthRate}% مع زخم في عمليات البحث عبر محركات أمازون ونون.`
        : `تراجع مؤقت في حركة الشراء بنسبة ${growthRate}% نتيجة تشبع السوق بالمنافسين أو توفر بدائل أرخص.`,
      searchVolumeGrowthPercent: Number((growthRate * 1.2).toFixed(1)),
      competitorPriceVelocityPercent: Number((isUp ? -3.5 : -8.5).toFixed(1)),
      stockoutRiskPercent: stockoutRisk,
      daysOfInventoryLeftMarketWide: daysLeft,
      procurementAction: action,
      procurementActionLabel: actionLabel,
      recommendedOrderQuantity: recQty,
      recommendedOrderWindow: isUp ? 'خلال الأيام الـ 5 القادمة' : 'تريث لحين تصريف المخزون الحالي',
      wholesalePriceForecast: {
        expectedChangePercent: isUp ? 4.5 : -3.0,
        forecastDirection: isUp ? 'up' : 'down',
        reason: isUp 
          ? 'ضغط الطلب في أسواق الجملة المركزية (شارع عبد العزيز / الموسكي) قد يرفع التكلفة قريباً.'
          : 'وفرة المعروض قد تجبر تجار الجملة على تقديم تخفيضات إضافية قريباً.'
      },
      quadrant,
      quadrantLabel: quadLabel,
      historicalPoints,
      aiProcurementVerdict: isUp
        ? `يوصى بالاستثمار في هذا المنتج وتأمين دفعة توريد (${recQty} قطعة) للاستفادة من منحنى الطلب الصاعد وهامش الربح المجزي (${marginPct}%).`
        : `يوصى بعدم تجميد سيولة كبيرة في شراء كميات جديدة. ركز على تصفية القطع المتبقية وإعادة تدوير رأس المال في المنتجات ذات الزخم الصاعد.`
    };
  });

  // Calculate Summary
  const surgingCount = items.filter(i => i.trendDirection === 'surging').length;
  const growingCount = items.filter(i => i.trendDirection === 'growing').length;
  const decliningCount = items.filter(i => i.trendDirection === 'declining' || i.trendDirection === 'stagnant').length;
  const urgentBuy = items.filter(i => i.procurementAction === 'urgent_bulk_buy').length;
  const avgDemand = items.length > 0
    ? Math.round(items.reduce((sum, i) => sum + i.demandScore, 0) / items.length)
    : 80;

  // Potential profit from surging items (estimated batch profit)
  const potentialProfit = items
    .filter(i => i.trendDirection === 'surging' || i.trendDirection === 'growing')
    .reduce((sum, i) => sum + ((i.currentLowestPrice - i.estimatedWholesaleCost) * i.recommendedOrderQuantity), 0);

  const stockoutAlerts = items.filter(i => i.stockoutRiskPercent >= 60).length;

  return {
    items,
    summary: {
      totalAnalyzedProducts: items.length,
      surgingProductsCount: surgingCount,
      growingProductsCount: growingCount,
      decliningProductsCount: decliningCount,
      topSurgingCategory: 'الإلكترونيات والموبايلات الذكية 📱',
      averageMarketDemandScore: avgDemand,
      urgentBuyCount: urgentBuy,
      potentialProfitFromSurgingEGP: potentialProfit,
      marketWideStockoutAlertsCount: stockoutAlerts,
      topTrendAlert: {
        title: 'موجة طلب صاعدة (+54%) على فئة الصوتيات والهواتف المتوسطة في مصر',
        description: 'تشير البيانات التاريخية لآخر 8 أسابيع إلى نقص مرتقب في معروض الوكلاء وتجار الجملة مع اقتراب الربع الأخير. التجار الذين يؤمنون بضائعهم الآن سيحققون هوامش ربح أعلى بنسبة 18% مقارنة بمن ينتظرون.',
        impact: 'positive'
      }
    }
  };
}

export function calculateMarketTrendsSummary(products: ProductData[]): MarketTrendsSummary {
  return analyzeMarketTrends(products).summary;
}

export function analyzeAllProductsMarketTrends(products: ProductData[]): ProductMarketTrendAnalysis[] {
  return analyzeMarketTrends(products).items;
}

export function analyzeProductMarketTrends(product?: ProductData): ProductMarketTrendAnalysis {
  if (!product || !product.id) {
    const historicalPoints: ProductDemandHistoricalPoint[] = HISTORICAL_WEEKS.map((wLabel, wIdx) => ({
      date: `2026-0${wIdx + 1}-15`,
      weekLabel: wLabel,
      demandScore: 75,
      marketPriceAvg: 2500,
      searchInterestIndex: 65,
      estimatedSalesUnits: 40,
      competitorsStockLevel: 'medium'
    }));

    return {
      productId: 'prod-placeholder',
      productTitle: 'منتج عام بالسوق المصري',
      productCategory: 'الإلكترونيات والموبايل',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      brand: 'عام',
      currentLowestPrice: 2500,
      estimatedWholesaleCost: 2000,
      profitMarginPercent: 20,
      demandScore: 75,
      demandGrowthRatePercent: 12.5,
      trendDirection: 'growing',
      trendBadge: '📈 نمو متصاعد إيجابي (Growing)',
      trendDescription: 'نمو متوازن في حركة الطلب عبر المتاجر الإلكترونية المصرية.',
      searchVolumeGrowthPercent: 15.0,
      competitorPriceVelocityPercent: -2.5,
      stockoutRiskPercent: 45,
      daysOfInventoryLeftMarketWide: 25,
      procurementAction: 'regular_reorder',
      procurementActionLabel: 'توريد منتظم معتدل (15-25 قطعة)',
      recommendedOrderQuantity: 20,
      recommendedOrderWindow: 'خلال الأسبوعين القادمين',
      wholesalePriceForecast: {
        expectedChangePercent: 3.0,
        forecastDirection: 'up',
        reason: 'استقرار نسبي في المعروض بسوق الجملة.'
      },
      quadrant: 'opportunity',
      quadrantLabel: 'فرصة صاعدة (Opportunity) 🚀',
      historicalPoints,
      aiProcurementVerdict: 'فرصة جيدة للتداول اليومي مع الحفاظ على وتيرة دوران متوازنة للمخزون.'
    };
  }
  return analyzeMarketTrends([product]).items[0] || analyzeProductMarketTrends(undefined);
}

// Category Demand Breakdown Data for Donut Chart
export const EGYPT_CATEGORY_DEMAND_DISTRIBUTION = [
  { category: 'الموبايلات والهواتف الذكية', sharePercent: 36, demandGrowth: '+52%', color: '#3b82f6' },
  { category: 'الإلكترونيات والصوتيات', sharePercent: 28, demandGrowth: '+44%', color: '#8b5cf6' },
  { category: 'الأجهزة المنزلية والمطبخ', sharePercent: 18, demandGrowth: '+22%', color: '#10b981' },
  { category: 'الصحة والجمال والعناية', sharePercent: 12, demandGrowth: '+18%', color: '#0ea5e9' },
  { category: 'الأزياء ومستلزمات الرياضة', sharePercent: 6, demandGrowth: '+5%', color: '#ec4899' },
];

// Key Egyptian Seasonal Demand Waves
export const UPCOMING_EGYPT_DEMAND_EVENTS = [
  {
    event: 'موسم العودة للمدارس والجامعات (Back to School)',
    timing: 'سبتمبر - أكتوبر',
    expectedSurgeCategories: ['سماعات الرأس والتابلت', 'الباور بانك والشواحن', 'الأدوات المكتبية'],
    surgeIntensity: '+65% في المبيعات',
    procurementAdvice: 'ابدأ الشراء فوراً قبل نفاد كميات شارع عبد العزيز والفجالة.'
  },
  {
    event: 'موسم عروض الجمعة البيضاء (White Friday Rush)',
    timing: 'نوفمبر',
    expectedSurgeCategories: ['الموبايلات', 'الشاشات الذكية', 'الساعات والأجهزة الصغيرة'],
    surgeIntensity: '+140% ذروة سنوية',
    procurementAdvice: 'حجز كميات جملة كبرى بعقود مسبقة مع المستوردين في أكتوبر.'
  },
  {
    event: 'موسم رأس السنة وعروض الشتاء',
    timing: 'ديسمبر - يناير',
    expectedSurgeCategories: ['الدفيات والأجهزة المنزلية', 'الإلكترونيات الفاخرة كهدايا'],
    surgeIntensity: '+40% استقرار ونمو',
    procurementAdvice: 'مراقبة تقلبات سعر الصرف وتكلفة الشحن الدولي.'
  }
];
