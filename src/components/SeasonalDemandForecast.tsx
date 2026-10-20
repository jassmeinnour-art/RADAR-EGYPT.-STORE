import React, { useState, useMemo } from 'react';
import {
  Calendar,
  AlertTriangle,
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  ShoppingCart,
  Sliders,
  Sparkles,
  Download,
  Building2,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowUpRight,
  Printer,
  Bell,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import {
  ComposedChart,
  LineChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import {
  ProductData,
  SeasonalPeakEvent,
  ProductSeasonalDemandForecast,
  SeasonalForecastDataPoint
} from '../types';
import { VERIFIED_AMAZON_EG_PRODUCTS } from '../services/livePlatformProductSync';
import {
  EGYPTIAN_PEAK_SEASONS,
  generateAllSeasonalForecasts,
  calculateProductSeasonalDemandForecast
} from '../data/seasonalForecastData';

interface SeasonalDemandForecastProps {
  allProducts?: ProductData[];
  currency?: string;
  onNavigateToWholesale?: (marketQuery?: string) => void;
  onNavigateToSalesDashboard?: () => void;
  onShowToast?: (message: string) => void;
}

export const SeasonalDemandForecast: React.FC<SeasonalDemandForecastProps> = ({
  allProducts = VERIFIED_AMAZON_EG_PRODUCTS,
  currency = 'EGP',
  onNavigateToWholesale,
  onNavigateToSalesDashboard,
  onShowToast
}) => {
  // State for interactive simulation controls
  const [selectedEventId, setSelectedEventId] = useState<string>('white_friday');
  const [safetyBufferPercent, setSafetyBufferPercent] = useState<number>(25);
  const [supplierLeadTimeDays, setSupplierLeadTimeDays] = useState<number>(10);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'high_risk' | 'moderate' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected product for individual deep-dive chart
  const [selectedProductForChart, setSelectedProductForChart] = useState<ProductSeasonalDemandForecast | null>(null);

  // Purchase Order (PO) Modal State
  const [activePOProduct, setActivePOProduct] = useState<ProductSeasonalDemandForecast | null>(null);
  const [customPOUnits, setCustomPOUnits] = useState<number>(0);
  const [poGeneratedSuccess, setPoGeneratedSuccess] = useState<boolean>(false);

  // Generate dynamic forecasts using real simulation math
  const {
    event: currentEvent,
    forecasts,
    totalRecommendedInvestment,
    totalProjectedPeakRevenue,
    totalAtRiskRevenue,
    criticalCount,
    highRiskCount
  } = useMemo(() => {
    return generateAllSeasonalForecasts(
      allProducts,
      selectedEventId,
      safetyBufferPercent,
      supplierLeadTimeDays
    );
  }, [allProducts, selectedEventId, safetyBufferPercent, supplierLeadTimeDays]);

  // Set default active product for chart if none selected
  const activeChartProduct = useMemo(() => {
    if (!forecasts || forecasts.length === 0) return null;
    if (selectedProductForChart) {
      // Re-find from active forecasts to keep parameters reactive
      return forecasts.find(f => f.productId === selectedProductForChart.productId) || forecasts[0] || null;
    }
    return forecasts[0] || null;
  }, [selectedProductForChart, forecasts]);

  // Unique categories for filter
  const categories = useMemo(() => {
    const set = new Set(allProducts.map(p => p.category));
    return ['all', ...Array.from(set)];
  }, [allProducts]);

  // Filtered forecasts list
  const filteredForecasts = useMemo(() => {
    return forecasts.filter(f => {
      // Search
      const matchesSearch = 
        f.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Category
      if (filterCategory !== 'all' && f.category !== filterCategory) return false;

      // Risk
      if (filterRisk !== 'all' && f.stockoutAlertSeverity !== filterRisk) return false;

      return true;
    });
  }, [forecasts, searchQuery, filterCategory, filterRisk]);

  // Handlers
  const handleOpenPOModal = (forecast: ProductSeasonalDemandForecast) => {
    setActivePOProduct(forecast);
    setCustomPOUnits(forecast.recommendedReorderUnits);
    setPoGeneratedSuccess(false);
  };

  const handleConfirmGeneratePO = () => {
    setPoGeneratedSuccess(true);
    if (onShowToast && activePOProduct) {
      onShowToast(`تم إنشاء وتوثيق أمر التوريد بالجملة لـ ${customPOUnits} قطعة من ${activePOProduct.productTitle} بنجاح!`);
    }
  };

  const handleExportForecastCSV = () => {
    const headers = [
      'اسم المنتج',
      'SKU',
      'التصنيف',
      'المخزون الحالي (قطع)',
      'سرعة المبيعات اليومية الحالية',
      'مضاعف الموسم',
      'سرعة المبيعات بالذروة',
      'الطلب المتوقع بالموسم',
      'أيام كفاية المخزون',
      'درجة خطورة النفاد',
      'الكمية الموصى بتوريدها',
      'استثمار التوريد (ج.م)',
      'الإيرادات المتوقعة (ج.م)',
      'الإيرادات المعرضة للضياع (ج.م)',
      'الموعد النهائي لطلب التوريد',
      'سوق الجملة المفضل'
    ];

    const rows = filteredForecasts.map(f => [
      `"${f.productTitle.replace(/"/g, '""')}"`,
      `"${f.sku}"`,
      `"${f.category}"`,
      f.currentStockUnits,
      f.dailySalesVelocity,
      `${f.historicalMultiplier}x`,
      f.projectedPeakDailyVelocity,
      f.expectedTotalPeakDemandUnits,
      f.daysOfInventoryAtPeakRate,
      f.stockoutAlertSeverity,
      f.recommendedReorderUnits,
      f.totalReorderInvestmentEGP,
      f.projectedPeakRevenueEGP,
      f.estimatedLostRevenueIfStockoutEGP,
      `"${f.reorderDeadlineDate}"`,
      `"${f.preferredWholesaleMarket}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `seasonal-demand-forecast-${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('تم تصدير كشف توقعات الطلب الموسمي وأوامر التوريد بصيغة CSV بنجاح');
    }
  };

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: SeasonalForecastDataPoint = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs backdrop-blur-md min-w-[230px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <span className="font-bold text-slate-200">اليوم {dataPoint.dayIndex}: {dataPoint.dateLabel}</span>
            {dataPoint.isStockoutOccurred ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                🚨 نفاد المخزون
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✅ المخزون متوفر
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">الطلب اليومي المتوقع بالذروة:</span>
              <span className="font-bold text-sky-400">{dataPoint.projectedPeakDemandUnits} قطعة/يوم</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">الطلب المعتاد الطبيعي:</span>
              <span className="font-semibold text-slate-300">{dataPoint.baselineDemandUnits} قطعة/يوم</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 mt-1.5">
              <span className="text-indigo-300 font-bold">المخزون المتبقي:</span>
              <span className={`font-black text-sm ${dataPoint.remainingStockUnits <= 5 ? 'text-rose-400' : 'text-indigo-400'}`}>
                {dataPoint.remainingStockUnits} قطعة
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12" id="seasonal-demand-forecast-container">
      {/* Top Header & Egyptian Shopping Seasons Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/60 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                الذكاء التنبؤي لمواسم التجارة الإلكترونية في مصر
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                سرعة سحب المبيعات (Sales Velocity Engine)
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              أداة توقع حجم الطلب الموسمي وتنبيهات نفاد المخزون
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              تعتمد هذه الأداة على البيانات التاريخية لسلوك الشراء والسرعة الفعلية لحركة المبيعات (Sales Velocity) لتنبيه التاجر قبل فترات الذروة بمهلة كافية لطلب كميات التوريد بالجملة وضمان عدم ضياع مبيعات الـ Buy Box.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              id="btn-export-forecast-csv"
              onClick={handleExportForecastCSV}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              تصدير خطة التوريد CSV
            </button>

            {onNavigateToWholesale && (
              <button
                id="btn-nav-wholesale-markets"
                onClick={() => onNavigateToWholesale()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                أسواق الجملة ومنافذ مصر
              </button>
            )}
          </div>
        </div>

        {/* Season Selector Cards */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>اختر موسم الذروة المراد محاكاته وجدولة التوريد له:</span>
            <span className="text-indigo-600 font-bold normal-case">
              الموسم النشط: {currentEvent.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {EGYPTIAN_PEAK_SEASONS.map(event => {
              const isSelected = selectedEventId === event.id;
              return (
                <button
                  key={event.id}
                  id={`btn-select-season-${event.id}`}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-3.5 rounded-xl text-right transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-900 text-white border-indigo-800 shadow-md ring-2 ring-indigo-500/50'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-sky-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {event.historicalDemandMultiplier}x طلب متوقع
                      </span>
                      <span className={`text-[10px] font-bold ${
                        isSelected ? 'text-indigo-200' : 'text-slate-500'
                      }`}>
                        {event.urgencyLevel === 'urgent' ? '🚨 عاجل جداً' : `باقي ${event.daysUntilPeak} يوم`}
                      </span>
                    </div>
                    <h3 className={`font-bold text-xs leading-snug line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {event.shortName}
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {event.dateRangeLabel}
                    </p>
                  </div>

                  <div className={`mt-2.5 pt-2 border-t text-[10px] flex items-center justify-between ${
                    isSelected ? 'border-indigo-800/80 text-indigo-300' : 'border-slate-200 text-slate-400'
                  }`}>
                    <span>مهلة التوريد: {event.recommendedLeadTimeDays} يوم</span>
                    <span>خصم: ~{event.discountDepthAverage}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Simulation Parameters Sliders */}
        <div className="mt-5 bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Safety Buffer Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                هامش الأمان الإضافي للمخزون (Safety Buffer):
              </span>
              <span className="font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                +{safetyBufferPercent}%
              </span>
            </div>
            <input
              id="slider-safety-buffer"
              type="range"
              min="5"
              max="50"
              step="5"
              value={safetyBufferPercent}
              onChange={(e) => setSafetyBufferPercent(Number(e.target.value))}
              className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>+5% (حد أدنى اقتصادي)</span>
              <span>+25% (موصى به للمواسم الكبرى)</span>
              <span>+50% (حماية قصوى)</span>
            </div>
          </div>

          {/* Supplier Lead Time Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                مهلة التوريد والاستلام من المستورد / سوق الجملة (Lead Time):
              </span>
              <span className="font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                {supplierLeadTimeDays} أيام عمل
              </span>
            </div>
            <input
              id="slider-lead-time"
              type="range"
              min="3"
              max="25"
              step="1"
              value={supplierLeadTimeDays}
              onChange={(e) => setSupplierLeadTimeDays(Number(e.target.value))}
              className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>3 أيام (سوق محلي فوري)</span>
              <span>10 أيام (توريد وإيداع FBA/FBN)</span>
              <span>25 يوماً (استيراد وشحن بحري)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Impact KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Critical Stockout Alerts Count */}
        <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-rose-700 font-bold mb-1">
              <span>تنبيهات نفاد حرج وشيك</span>
              <AlertOctagon className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-950">
              {criticalCount} <span className="text-xs font-normal text-rose-600">منتجات</span>
            </div>
          </div>
          <div className="text-[11px] text-rose-700 font-semibold mt-2">
            ستنفد قبل وصول الشحنة الجديدة!
          </div>
        </div>

        {/* High Risk Count */}
        <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-sky-700 font-bold mb-1">
              <span>منتجات بخطر نقص المخزون</span>
              <AlertTriangle className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-950">
              {highRiskCount} <span className="text-xs font-normal text-sky-600">منتجات</span>
            </div>
          </div>
          <div className="text-[11px] text-sky-700 font-semibold mt-2">
            كفاية أقل من فترة الذروة الكاملة
          </div>
        </div>

        {/* Total Projected Peak Revenue */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>الإيرادات الموسمية المتوقعة</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {totalProjectedPeakRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            بناءً على مضاعف {currentEvent.historicalDemandMultiplier}x
          </div>
        </div>

        {/* At Risk Lost Revenue */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>إيرادات معرضة للضياع</span>
              <DollarSign className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-black text-rose-600">
              {totalAtRiskRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            في حال عدم التوريد قبل الموعد
          </div>
        </div>

        {/* Total Wholesale Capital Required */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>رأس مال التوريد بالجملة</span>
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {totalRecommendedInvestment.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
          </div>
          <div className="text-[11px] text-indigo-600 font-bold mt-2">
            لحجز الكميات بأسعار الجملة الحالية
          </div>
        </div>
      </div>

      {/* Critical Stockout Urgent Alert Banner */}
      {criticalCount > 0 && (
        <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-950 text-white rounded-2xl p-5 border border-rose-800 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0 text-rose-400">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                    إشعار عاجل للمسوق والتاجر
                  </span>
                  <span className="text-xs text-rose-300 font-bold">
                    {criticalCount} منتجات ستتوقف مبيعاتها تماماً بسبب نفاد المخزون
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  المخزون الحالي لمنتجات الذروة سينفد خلال أقل من مهلة التوريد ({supplierLeadTimeDays} أيام)!
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  بناءً على متوسط سرعة السحب اليومية ومضاعف {currentEvent.shortName} ({currentEvent.historicalDemandMultiplier}x)، يوصى بإصدار أوامر التوريد للمستوردين في (شارع عبد العزيز / باب اللوق) فوراً لعدم فقدان صدارة الـ Buy Box على نون وأمازون.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
              <button
                id="btn-urgent-po-action"
                onClick={() => {
                  const criticalProd = forecasts.find(f => f.stockoutAlertSeverity === 'critical') || forecasts[0];
                  if (criticalProd) handleOpenPOModal(criticalProd);
                }}
                className="w-full md:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <Zap className="w-4 h-4 text-sky-300" />
                إصدار أمر توريد عاجل الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Stock Depletion & Demand Projection Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        {!activeChartProduct ? (
          <div className="py-12 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">لا توجد منتجات مسجلة لعرض المحاكاة</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              أضف أو استورد منتجات لعرض محاكاة استنزاف المخزون ومعدلات الطلب اليومية في المواسم المصرية.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    محاكاة مسار استنزاف المخزون ومعدل الطلب اليومي (30 يوماً):
                  </h2>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>المنتج المعروض: <strong className="text-slate-900">{activeChartProduct.productTitle}</strong></span>
                  <span>•</span>
                  <span>المخزون الحالي: <strong className="text-indigo-600">{activeChartProduct.currentStockUnits} قطعة</strong></span>
                  <span>•</span>
                  <span>سرعة السحب بالذروة: <strong className="text-sky-600">{activeChartProduct.projectedPeakDailyVelocity} قطعة/يوم</strong></span>
                </div>
              </div>

              {/* Product selector dropdown for chart */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-slate-500 font-bold whitespace-nowrap">تغيير المنتج:</span>
                <select
                  id="select-chart-product"
                  value={activeChartProduct.productId}
                  onChange={(e) => {
                    const target = forecasts.find(f => f.productId === e.target.value);
                    if (target) setSelectedProductForChart(target);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {forecasts.map(f => (
                    <option key={f.productId} value={f.productId}>
                      {f.productTitle.substring(0, 35)}... ({f.stockoutAlertSeverity === 'critical' ? '🚨 حرج' : f.stockoutAlertSeverity === 'high_risk' ? '⚠️ خطر' : '✅ آمن'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-[340px] w-full min-w-0 pt-4" dir="ltr">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300} debounce={50}>
                <ComposedChart data={activeChartProduct.forecastDailyTimeline} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  {/* Left YAxis: Remaining Stock */}
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    tick={{ fontSize: 11, fill: '#4f46e5' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  {/* Right YAxis: Daily Units Demand */}
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 11, fill: '#0284c7' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(value) => {
                      if (value === 'remainingStockUnits') return <span className="text-xs font-bold text-indigo-700">المخزون المتبقي (قطع)</span>;
                      if (value === 'projectedPeakDemandUnits') return <span className="text-xs font-bold text-sky-600">الطلب اليومي بالذروة ({currentEvent.shortName})</span>;
                      if (value === 'baselineDemandUnits') return <span className="text-xs font-bold text-slate-500">الطلب اليومي المعتاد</span>;
                      return value;
                    }} 
                  />
                  {/* Area for remaining stock trajectory */}
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="remainingStockUnits" 
                    name="remainingStockUnits" 
                    fill="#e0e7ff" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                  />
                  {/* Bar for Daily Peak Demand */}
                  <Bar 
                    yAxisId="right" 
                    dataKey="projectedPeakDemandUnits" 
                    name="projectedPeakDemandUnits" 
                    fill="#0ea5e9" 
                    radius={[4, 4, 0, 0]} 
                    barSize={12} 
                  />
                  {/* Line for Baseline Demand */}
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="baselineDemandUnits" 
                    name="baselineDemandUnits" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline Key Milestone Markers */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">تاريخ نفاد المخزون المتوقع:</span>
                <strong className="text-rose-600 font-bold text-sm">{activeChartProduct.expectedStockoutDate}</strong>
                <span className="text-[10px] text-slate-400 block">(بعد {activeChartProduct.daysUntilStockout} يوماً)</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">آخر موعد لإصدار أمر التوريد:</span>
                <strong className="text-indigo-700 font-bold text-sm">{activeChartProduct.reorderDeadlineDate}</strong>
                <span className="text-[10px] text-slate-400 block">(مع مهلة {supplierLeadTimeDays} أيام للمورد)</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">سوق التوريد الموصى به:</span>
                <strong className="text-slate-900 font-bold text-xs">{activeChartProduct.preferredWholesaleMarket}</strong>
                <span className="text-[10px] text-emerald-600 font-bold block">متاح كميات للتجار</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Forecast Products & Reorder Planning Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-slate-200/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                جدول تخطيط كميات التوريد وتوقعات سرعة المبيعات
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                حساب آلي لكميات التوريد المطلوبة لتغطية ذروة {currentEvent.shortName} وتفادي نفاد المخزون
              </p>
            </div>

            {/* Risk Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="filter-risk-all"
                onClick={() => setFilterRisk('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterRisk === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({forecasts.length})
              </button>
              <button
                id="filter-risk-critical"
                onClick={() => setFilterRisk('critical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  filterRisk === 'critical' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                حرج ({criticalCount})
              </button>
              <button
                id="filter-risk-high"
                onClick={() => setFilterRisk('high_risk')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  filterRisk === 'high_risk' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                خطر عالي ({highRiskCount})
              </button>
              <button
                id="filter-risk-safe"
                onClick={() => setFilterRisk('safe')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  filterRisk === 'safe' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                مخزون آمن ({forecasts.filter(f => f.stockoutAlertSeverity === 'safe').length})
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-forecast-products"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المنتج، الكود SKU، أو التصنيف..."
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              <select
                id="select-forecast-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="all">جميع التصنيفات</option>
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">المنتج والتصنيف</th>
                <th className="py-3 px-3">المخزون الحالي</th>
                <th className="py-3 px-3">سرعة المبيعات (عادي / ذروة)</th>
                <th className="py-3 px-3">أيام الكفاية وتاريخ النفاد</th>
                <th className="py-3 px-3">حالة الخطر والموعد النهائي</th>
                <th className="py-3 px-3">الكمية الموصى بتوريدها</th>
                <th className="py-3 px-4 text-center">إجراء أمر التوريد بالجملة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredForecasts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    لا توجد منتجات مطابقة لخيارات البحث والتصفية المحددة.
                  </td>
                </tr>
              ) : (
                filteredForecasts.map((forecast) => {
                  const isChartSelected = activeChartProduct.productId === forecast.productId;
                  return (
                    <tr
                      key={forecast.productId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChartSelected ? 'bg-indigo-50/40 border-r-4 border-indigo-600' : ''
                      }`}
                    >
                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={forecast.productImage}
                            alt={forecast.productTitle}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-xs flex-shrink-0 bg-white"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 truncate block max-w-[220px]">
                              {forecast.productTitle}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono text-slate-400">{forecast.sku}</span>
                              <span>•</span>
                              <span className="text-slate-500">{forecast.category}</span>
                              <button
                                onClick={() => setSelectedProductForChart(forecast)}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline mr-1"
                              >
                                {isChartSelected ? 'معروض بالرسم 📊' : 'عرض المحاكاة 📊'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-slate-900 text-sm">
                          {forecast.currentStockUnits} <span className="text-[10px] font-normal text-slate-500">قطعة</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          قيمة المخزون: {(forecast.currentStockUnits * forecast.wholesaleUnitCostEGP).toLocaleString()} {currency}
                        </div>
                      </td>

                      {/* Velocity */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">
                          {forecast.dailySalesVelocity} <span className="text-[10px] text-slate-500">قطع/يوم</span>
                        </div>
                        <div className="text-[11px] text-sky-700 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-sky-500" />
                          {forecast.projectedPeakDailyVelocity} قطعة/يوم ({forecast.historicalMultiplier}x)
                        </div>
                      </td>

                      {/* Days Left */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">
                          {forecast.daysOfInventoryAtPeakRate} أيام <span className="text-[10px] text-slate-500">بالذروة</span>
                        </div>
                        <div className="text-[10px] text-rose-600 font-semibold">
                          ينفد بتاريخ: {forecast.expectedStockoutDate}
                        </div>
                      </td>

                      {/* Risk Badge & Deadline */}
                      <td className="py-3.5 px-3">
                        <div className="mb-1">
                          {forecast.stockoutAlertSeverity === 'critical' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                              <AlertOctagon className="w-3 h-3" />
                              نفاد حرج قبل التوريد
                            </span>
                          ) : forecast.stockoutAlertSeverity === 'high_risk' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              خطر نقص بالذروة
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              مخزون كافٍ ومريح
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          آخر موعد للطلب: <strong className="text-indigo-700">{forecast.reorderDeadlineDate}</strong>
                        </div>
                      </td>

                      {/* Reorder Units & Investment */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-indigo-700 text-sm">
                          +{forecast.recommendedReorderUnits} <span className="text-[10px] font-normal text-slate-500">قطعة إضافية</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          التكلفة: {forecast.totalReorderInvestmentEGP.toLocaleString()} {currency}
                        </div>
                      </td>

                      {/* PO Action Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          id={`btn-create-po-${forecast.productId}`}
                          onClick={() => handleOpenPOModal(forecast)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 mx-auto"
                        >
                          <Package className="w-3.5 h-3.5" />
                          أمر شراء بالجملة (PO)
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wholesale Purchase Order (PO) Generator Modal */}
      {activePOProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    أمر شراء وتوريد بضاعة بالجملة (Wholesale PO)
                  </h3>
                  <p className="text-xs text-slate-500">
                    تجهيز طلبية مسبقة لموسم: {currentEvent.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePOProduct(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <img
                src={activePOProduct.productImage}
                alt={activePOProduct.productTitle}
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-white"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                  {activePOProduct.productTitle}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <span>SKU: <strong className="font-mono text-slate-700">{activePOProduct.sku}</strong></span>
                  <span>•</span>
                  <span>المخزون الحالي: <strong className="text-slate-800">{activePOProduct.currentStockUnits}</strong></span>
                </div>
              </div>
            </div>

            {/* PO Calculation & Editable Units Input */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كمية التوريد المطلوبة (قطع):
                </label>
                <input
                  type="number"
                  min="1"
                  value={customPOUnits}
                  onChange={(e) => setCustomPOUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  الكمية المحسوبة تلقائياً: {activePOProduct.recommendedReorderUnits} قطعة
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="block text-xs font-bold text-slate-700 mb-1">
                  سعر التكلفة للقطعة بالجملة:
                </span>
                <div className="text-base font-black text-slate-900">
                  {activePOProduct.wholesaleUnitCostEGP.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                  سعر محجوز لدى تجار الجملة
                </span>
              </div>
            </div>

            {/* Total Investment & Preferred Market */}
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-bold">إجمالي مبلغ أمر الشراء (PO Total):</span>
                <span className="text-lg font-black text-indigo-900">
                  {(customPOUnits * activePOProduct.wholesaleUnitCostEGP).toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-indigo-200/60 pt-2">
                <span className="text-slate-600">الموعد النهائي لتأكيد الطلب:</span>
                <span className="font-bold text-rose-700">{activePOProduct.reorderDeadlineDate}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">منفذ الجملة المفضل بالقاهرة:</span>
                <span className="font-bold text-slate-900">{activePOProduct.preferredWholesaleMarket}</span>
              </div>
            </div>

            {poGeneratedSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  تم اعتماد أمر التوريد وجدولة التنبيه بنجاح!
                </div>
                <p className="text-xs text-emerald-700">
                  رقم أمر الشراء: <strong className="font-mono">PO-EGY-2026-{activePOProduct.sku.substring(0, 5)}</strong>
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    طباعة إيصال أمر التوريد
                  </button>
                  <button
                    onClick={() => setActivePOProduct(null)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActivePOProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGeneratePO}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  تأكيد وتوثيق أمر الشراء
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
