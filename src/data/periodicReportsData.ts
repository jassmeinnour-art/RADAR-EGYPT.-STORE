import { ProductData, WatchlistItem, PeriodicPerformanceReport, PeriodicReportPeriodType } from '../types';

export function generatePeriodicReport(
  periodType: PeriodicReportPeriodType,
  allProducts: ProductData[],
  watchlist: WatchlistItem[]
): PeriodicPerformanceReport {
  const isWeekly = periodType === 'weekly';
  const periodLabel = isWeekly 
    ? 'الأسبوع الحالي (18 - 25 أغسطس 2026)' 
    : 'تقرير شهر أغسطس 2026 الشامل';

  const multiplier = isWeekly ? 1 : 4.2;

  // Total metrics
  const totalSalesVolumeEGP = Math.round((284500 + Math.random() * 20000) * (isWeekly ? 1 : 4.1));
  const totalSalesVolumeGrowth = 18.4;
  const totalOrdersCount = Math.round((142 + Math.random() * 15) * (isWeekly ? 1 : 4));
  const totalOrdersGrowth = 14.2;
  const averageOrderValueEGP = Math.round(totalSalesVolumeEGP / totalOrdersCount);
  const totalNetProfitEGP = Math.round(totalSalesVolumeEGP * 0.224);
  const overallProfitMarginPercent = 22.4;
  const overallBuyBoxWinRatePercent = 84.5;
  const buyBoxWinRateGrowthPercent = 6.8;

  // Platform breakdowns
  const platformBreakdown = [
    {
      platformId: 'amazon_eg',
      platformName: 'أمازون مصر (Amazon.eg)',
      platformCode: 'amazon' as const,
      platformColor: '#FF9900',
      salesVolumeEGP: Math.round(totalSalesVolumeEGP * 0.48),
      salesSharePercent: 48,
      ordersCount: Math.round(totalOrdersCount * 0.46),
      buyBoxWinRatePercent: 88.5,
      averageSellingPriceEGP: Math.round(averageOrderValueEGP * 1.05),
      totalFeesAndCommissionsEGP: Math.round(totalSalesVolumeEGP * 0.48 * 0.11),
      netProfitEGP: Math.round(totalSalesVolumeEGP * 0.48 * 0.23),
      topCompetitorName: 'بي تك (B.TECH) / دريم 2000',
      priceCompetitivenessScore: 94
    },
    {
      platformId: 'noon_eg',
      platformName: 'نون مصر (Noon.eg)',
      platformCode: 'noon' as const,
      platformColor: '#FEBE10',
      salesVolumeEGP: Math.round(totalSalesVolumeEGP * 0.34),
      salesSharePercent: 34,
      ordersCount: Math.round(totalOrdersCount * 0.36),
      buyBoxWinRatePercent: 82.0,
      averageSellingPriceEGP: Math.round(averageOrderValueEGP * 0.96),
      totalFeesAndCommissionsEGP: Math.round(totalSalesVolumeEGP * 0.34 * 0.12),
      netProfitEGP: Math.round(totalSalesVolumeEGP * 0.34 * 0.21),
      topCompetitorName: 'نون إكسبريس (FBN) / راية شوب',
      priceCompetitivenessScore: 89
    },
    {
      platformId: 'jumia_eg',
      platformName: 'جوميا مصر (Jumia Egypt)',
      platformCode: 'jumia' as const,
      platformColor: '#F68B1E',
      salesVolumeEGP: Math.round(totalSalesVolumeEGP * 0.09),
      salesSharePercent: 9,
      ordersCount: Math.round(totalOrdersCount * 0.10),
      buyBoxWinRatePercent: 78.4,
      averageSellingPriceEGP: Math.round(averageOrderValueEGP * 0.92),
      totalFeesAndCommissionsEGP: Math.round(totalSalesVolumeEGP * 0.09 * 0.13),
      netProfitEGP: Math.round(totalSalesVolumeEGP * 0.09 * 0.24),
      topCompetitorName: 'رنين (Raneen) / توبي للكمبيوتر',
      priceCompetitivenessScore: 85
    },
    {
      platformId: 'kenzz_eg',
      platformName: 'كنز مصر (Kenzz Social Commerce)',
      platformCode: 'direct' as const,
      platformColor: '#10B981',
      salesVolumeEGP: Math.round(totalSalesVolumeEGP * 0.05),
      salesSharePercent: 5,
      ordersCount: Math.round(totalOrdersCount * 0.05),
      buyBoxWinRatePercent: 92.0,
      averageSellingPriceEGP: Math.round(averageOrderValueEGP * 0.88),
      totalFeesAndCommissionsEGP: Math.round(totalSalesVolumeEGP * 0.05 * 0.05),
      netProfitEGP: Math.round(totalSalesVolumeEGP * 0.05 * 0.28),
      topCompetitorName: 'تجار المجموعات والتسويق الاجتماعي',
      priceCompetitivenessScore: 96
    },
    {
      platformId: 'homzmart_eg',
      platformName: 'هومزمارت (Homzmart Furniture & Home)',
      platformCode: 'direct' as const,
      platformColor: '#6366F1',
      salesVolumeEGP: Math.round(totalSalesVolumeEGP * 0.04),
      salesSharePercent: 4,
      ordersCount: Math.round(totalOrdersCount * 0.03),
      buyBoxWinRatePercent: 86.5,
      averageSellingPriceEGP: Math.round(averageOrderValueEGP * 1.35),
      totalFeesAndCommissionsEGP: Math.round(totalSalesVolumeEGP * 0.04 * 0.14),
      netProfitEGP: Math.round(totalSalesVolumeEGP * 0.04 * 0.26),
      topCompetitorName: 'معارض الأثاث والتجهيزات الكبرى',
      priceCompetitivenessScore: 91
    },
    {
      platformId: 'direct_store',
      platformName: 'المتجر الإلكتروني المباشر (Direct / سلة)',
      platformCode: 'direct' as const,
      platformColor: '#0EA5E9',
      salesVolumeEGP: Math.round(totalSalesVolumeEGP * 0.04),
      salesSharePercent: 4,
      ordersCount: Math.round(totalOrdersCount * 0.03),
      buyBoxWinRatePercent: 100,
      averageSellingPriceEGP: Math.round(averageOrderValueEGP * 1.15),
      totalFeesAndCommissionsEGP: Math.round(totalSalesVolumeEGP * 0.04 * 0.02),
      netProfitEGP: Math.round(totalSalesVolumeEGP * 0.04 * 0.34),
      topCompetitorName: 'لا يوجد عمولات منصة (أعلى هامش ربح)',
      priceCompetitivenessScore: 98
    }
  ];

  // Sales Trend Data for Recharts
  const salesTrendData = isWeekly
    ? [
        { dateLabel: 'السبت', amazonSales: 18500, noonSales: 13200, jumiaSales: 4800, directSales: 2100, totalSales: 38600, buyBoxWinRate: 82, orders: 19, netProfit: 8650 },
        { dateLabel: 'الأحد', amazonSales: 21000, noonSales: 14500, jumiaSales: 5200, directSales: 2400, totalSales: 43100, buyBoxWinRate: 85, orders: 22, netProfit: 9650 },
        { dateLabel: 'الإثنين', amazonSales: 19200, noonSales: 12800, jumiaSales: 4600, directSales: 1900, totalSales: 38500, buyBoxWinRate: 81, orders: 18, netProfit: 8520 },
        { dateLabel: 'الثلاثاء', amazonSales: 24500, noonSales: 16800, jumiaSales: 6100, directSales: 2900, totalSales: 50300, buyBoxWinRate: 88, orders: 26, netProfit: 11200 },
        { dateLabel: 'الأربعاء', amazonSales: 22800, noonSales: 15400, jumiaSales: 5900, directSales: 2600, totalSales: 46700, buyBoxWinRate: 86, orders: 23, netProfit: 10450 },
        { dateLabel: 'الخميس', amazonSales: 26400, noonSales: 18900, jumiaSales: 7400, directSales: 3500, totalSales: 56200, buyBoxWinRate: 91, orders: 29, netProfit: 12800 },
        { dateLabel: 'الجمعة', amazonSales: 28900, noonSales: 21200, jumiaSales: 8300, directSales: 4100, totalSales: 62500, buyBoxWinRate: 93, orders: 34, netProfit: 14200 },
      ]
    : [
        { dateLabel: 'الأسبوع 1 (1 - 7 أغسطس)', amazonSales: 125000, noonSales: 88000, jumiaSales: 34000, directSales: 14000, totalSales: 261000, buyBoxWinRate: 79, orders: 128, netProfit: 58500 },
        { dateLabel: 'الأسبوع 2 (8 - 14 أغسطس)', amazonSales: 139000, noonSales: 96000, jumiaSales: 37000, directSales: 16500, totalSales: 288500, buyBoxWinRate: 83, orders: 142, netProfit: 64800 },
        { dateLabel: 'الأسبوع 3 (15 - 21 أغسطس)', amazonSales: 158000, noonSales: 112000, jumiaSales: 43000, directSales: 19000, totalSales: 332000, buyBoxWinRate: 87, orders: 165, netProfit: 74500 },
        { dateLabel: 'الأسبوع 4 (22 - 31 أغسطس)', amazonSales: 172000, noonSales: 124000, jumiaSales: 48000, directSales: 22000, totalSales: 366000, buyBoxWinRate: 89, orders: 182, netProfit: 82000 },
      ];

  // Watchlist Competitor Price Shifts
  const rawWatchlist = watchlist.length > 0 ? watchlist : (allProducts.length > 0 ? [{
    product: allProducts[0],
    addedAt: '2026-08-15',
    targetAlertPrice: (allProducts[0]?.currentLowestPrice || 2000) * 0.95,
    userNote: 'متابعة الأسعار التنافسية'
  }] : []);

  const watchlistPriceShifts = rawWatchlist.map((wItem, idx) => {
    const p = wItem.product || {
      id: `p-${idx}`,
      title: 'منتج تجاري عام',
      brand: 'عام',
      category: 'التجارة العامة',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      currentLowestPrice: 2500,
      suggestedRetailPrice: 2400,
      estimatedWholesaleCost: 2000,
      merchantOffers: []
    };
    const currentPrice = p.suggestedRetailPrice || p.currentLowestPrice || 2500;
    const prevPrice = Math.round(currentPrice * (idx % 2 === 0 ? 1.04 : 0.97));
    const lowestComp = p.currentLowestPrice || 2500;
    const diff = lowestComp - prevPrice;
    const percentDiff = prevPrice > 0 ? Math.round((diff / prevPrice) * 1000) / 10 : 0;

    const isWinning = currentPrice <= lowestComp;

    return {
      productId: p.id,
      productTitle: p.title,
      brand: p.brand,
      category: p.category,
      imageUrl: p.imageUrl,
      currentMerchantPrice: currentPrice,
      previousMerchantPrice: prevPrice,
      lowestCompetitorPrice: lowestComp,
      lowestCompetitorName: idx === 0 ? 'بي تك مصر (B.TECH)' : idx === 1 ? 'دريم 2000' : 'راية شوب (Raya)',
      lowestCompetitorPlatform: idx === 0 ? 'أمازون مصر' : idx === 1 ? 'نون مصر' : 'جوميا',
      priceShiftAmountEGP: diff,
      priceShiftPercent: percentDiff,
      shiftDirection: diff < 0 ? ('dropped' as const) : diff > 0 ? ('increased' as const) : ('stable' as const),
      buyBoxStatus: isWinning ? ('winning' as const) : ('at_risk' as const),
      competitorPriceHistory: [
        { period: isWeekly ? 'اليوم -6' : 'الأسبوع 1', merchantPrice: prevPrice, amazonLowest: lowestComp + 250, noonLowest: lowestComp + 400, jumiaLowest: lowestComp + 600 },
        { period: isWeekly ? 'اليوم -4' : 'الأسبوع 2', merchantPrice: prevPrice - 50, amazonLowest: lowestComp + 150, noonLowest: lowestComp + 200, jumiaLowest: lowestComp + 450 },
        { period: isWeekly ? 'اليوم -2' : 'الأسبوع 3', merchantPrice: currentPrice + 80, amazonLowest: lowestComp + 50, noonLowest: lowestComp + 100, jumiaLowest: lowestComp + 300 },
        { period: isWeekly ? 'اليوم الحالي' : 'الأسبوع 4', merchantPrice: currentPrice, amazonLowest: lowestComp, noonLowest: lowestComp + 80, jumiaLowest: lowestComp + 180 },
      ],
      alertTriggered: Math.abs(percentDiff) >= 3,
      recommendedTacticalMove: isWinning 
        ? 'أنت متصدر الـ Buy Box حالياً بفارق ممتاز - حافظ على سرعة الشحن في نفس اليوم' 
        : `المنافس خفض سعره بنسبة ${Math.abs(percentDiff)}% - يوصى بتخفيض سعرك إلى ${Math.round(lowestComp * 0.99)} ج.م لاستعادة الصدارة فوراً`
    };
  });

  // Top products list
  const topProducts = allProducts.slice(0, 5).map((p, idx) => {
    const revenue = Math.round((58000 - idx * 8500) * (isWeekly ? 1 : 3.8));
    const profit = Math.round(revenue * 0.24);
    return {
      productId: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      salesCount: Math.round((28 - idx * 4) * (isWeekly ? 1 : 3.5)),
      revenueEGP: revenue,
      profitEGP: profit,
      buyBoxWinRatePercent: 92 - idx * 3,
      dominantPlatform: idx % 2 === 0 ? 'أمازون مصر' : 'نون مصر'
    };
  });

  // Strategic AI recommendations
  const strategicActionItems = [
    {
      id: 'strat-1',
      category: 'pricing' as const,
      title: 'استغلال تفوق أمازون لرفع هوامش ربح فئة الشاشات والإلكترونيات',
      description: 'حقق متجرك نسبة فوز 88.5% بالـ Buy Box على أمازون مصر مع زيادة في الطلبات بنسبة +18%. يمكنك زيادة أسعار بعض المنتجات الحصرية بنسبة 1.5% دون فقدان الصندوق الذهبي.',
      expectedImpact: '+14,200 ج.م أرباح صافية إضافية شهرياً',
      priority: 'high' as const
    },
    {
      id: 'strat-2',
      category: 'platform' as const,
      title: 'تحسين عروض نون إكسبريس (FBN) لمواجهة دريم 2000 وراية',
      description: 'لاحظ الرادار هبوطاً طفيفاً في حصة نون بنسبة 3% نتيجة تقديم المنافسين شحناً مجانياً وسرعة توصيل. يوصى بنقل 30 وحدة للمستودعات المركزية لنون في 6 أكتوبر.',
      expectedImpact: 'استعادة نسبة الـ Buy Box إلى 90% وزيادة الطلبات بـ 25 طلب',
      priority: 'high' as const
    },
    {
      id: 'strat-3',
      category: 'inventory' as const,
      title: 'إعادة تزويد مخزون المنتجات الأكثر رواجاً قبل عروض نهاية الشهر',
      description: 'المنتجات الثلاثة الأولى في تقريرك تقترب من نقطة إعادة الطلب مع توقع نفادها خلال 5 أيام بمعدل المبيعات الحالي.',
      expectedImpact: 'تجنب خسارة مبيعات محتملة تقدر بـ 45,000 ج.م',
      priority: 'medium' as const
    }
  ];

  const aiExecutiveSummary = isWeekly
    ? `أداء استثنائي لمتجرك خلال الأسبوع الجاري مع نمو قوي في إجمالي الإيرادات بنسبة +${totalSalesVolumeGrowth}% مسجلاً ${totalSalesVolumeEGP.toLocaleString()} ج.م ومحققا صافي أرباح ${totalNetProfitEGP.toLocaleString()} ج.م (هامش ربح ${overallProfitMarginPercent}%). كما سجلت نسبة الاستحواذ على الـ Buy Box معدلاً قياسياً بلغ ${overallBuyBoxWinRatePercent}% بفضل استراتيجيات التسعير الفوري، مع تصدر منصة أمازون مصر كأعلى منصة تحقيقاً للمبيعات بنسبة 48% تليها نون مصر بنسبة 34%.`
    : `ملخص الأداء الشهري الشامل لشهر أغسطس 2026: تجاوز المتجر مستهدفات المبيعات الشهرية بإجمالي حجم مبيعات بلغ ${totalSalesVolumeEGP.toLocaleString()} ج.م وصافي أرباح قياسي ${totalNetProfitEGP.toLocaleString()} ج.م. أظهرت قائمة المتابعة استقراراً في فئات الإلكترونيات مع هبوط تكتيكي لأسعار منافسي نون في الأجهزة المنزلية، وتمكن المتجر من الفوز بـ 84.5% من إجمالي معارك الباي بوكس.`;

  return {
    id: `rep-${periodType}-${Date.now()}`,
    title: isWeekly ? 'تقرير الأداء الأسبوعي الذكي والمبيعات' : 'التقرير الشهري الشامل للأداء وحركة السوق',
    periodType,
    periodLabel,
    generatedAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    totalSalesVolumeEGP,
    totalSalesVolumeGrowth,
    totalOrdersCount,
    totalOrdersGrowth,
    averageOrderValueEGP,
    totalNetProfitEGP,
    overallProfitMarginPercent,
    overallBuyBoxWinRatePercent,
    buyBoxWinRateGrowthPercent,
    platformBreakdown,
    salesTrendData,
    watchlistPriceShifts,
    topProducts,
    aiExecutiveSummary,
    strategicActionItems,
    scheduleConfig: {
      isAutoScheduleActive: true,
      frequency: isWeekly ? 'weekly' : 'monthly',
      targetDay: isWeekly ? 'كل يوم أحد الساعة 9:00 صباحاً' : 'اليوم الأول من كل شهر',
      recipientEmails: ['manager@merchantstore.eg', 'sales-team@merchantstore.eg'],
      recipientPhone: '+201098765432',
      lastDispatchedAt: 'اليوم، 09:15 ص',
      nextDispatchDate: isWeekly ? 'الأحد القادم، 30 أغسطس 2026' : '1 سبتمبر 2026'
    }
  };
}
