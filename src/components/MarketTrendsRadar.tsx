import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  AlertTriangle, 
  Sparkles, 
  ShoppingBag, 
  Layers, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Zap, 
  Package, 
  Compass,
  DollarSign,
  Building2,
  Calendar
} from 'lucide-react';
import { ProductData, DemandTrendDirection } from '../types';
import { VERIFIED_AMAZON_EG_PRODUCTS } from '../services/livePlatformProductSync';
import { 
  calculateMarketTrendsSummary, 
  analyzeAllProductsMarketTrends, 
  analyzeProductMarketTrends 
} from '../data/marketTrendsData';

interface MarketTrendsRadarProps {
  products?: ProductData[];
  selectedProduct?: ProductData;
  currency?: string;
  onSelectProduct?: (productId: string) => void;
  onNavigateToSimulator?: (product: ProductData) => void;
  onNavigateToOrders?: () => void;
  onNavigateToPricing?: (product: ProductData) => void;
  onShowToast?: (msg: string) => void;
}

export const MarketTrendsRadar: React.FC<MarketTrendsRadarProps> = ({
  products = VERIFIED_AMAZON_EG_PRODUCTS,
  selectedProduct = VERIFIED_AMAZON_EG_PRODUCTS[0],
  currency = 'EGP',
  onSelectProduct,
  onNavigateToSimulator,
  onNavigateToOrders,
  onNavigateToPricing,
  onShowToast
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'surging' | 'growing' | 'steady' | 'declining' | 'urgent_buy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalysisProduct, setSelectedAnalysisProduct] = useState<ProductData>(selectedProduct);

  const summary = calculateMarketTrendsSummary(products);
  const allAnalyses = analyzeAllProductsMarketTrends(products);
  const currentAnalysis = analyzeProductMarketTrends(selectedAnalysisProduct);

  // Filtered analyses list
  const filteredAnalyses = allAnalyses.filter(item => {
    const matchesSearch = item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.productCategory.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'surging') return item.trendDirection === 'surging';
    if (activeFilter === 'growing') return item.trendDirection === 'growing';
    if (activeFilter === 'steady') return item.trendDirection === 'steady';
    if (activeFilter === 'declining') return item.trendDirection === 'declining' || item.trendDirection === 'stagnant';
    if (activeFilter === 'urgent_buy') return item.procurementAction === 'urgent_bulk_buy';
    return true;
  });

  const getTrendBadgeStyle = (trend: DemandTrendDirection) => {
    switch (trend) {
      case 'surging':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'growing':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'steady':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'declining':
      case 'stagnant':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getQuadrantBadge = (quadrant: string) => {
    switch (quadrant) {
      case 'star':
        return { label: 'نجم واعد (Star) 🌟', color: 'bg-sky-50 text-sky-800 border-sky-300' };
      case 'cash_cow':
        return { label: 'بقرة حلوب (Cash Cow) 💰', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'question_mark':
        return { label: 'فرصة اختبارية (Question Mark) ❓', color: 'bg-purple-50 text-purple-800 border-purple-300' };
      case 'dog':
        return { label: 'مستنزف للسيولة (Dog/Drain) ⚠️', color: 'bg-rose-50 text-rose-800 border-rose-300' };
      default:
        return { label: quadrant, color: 'bg-gray-50 text-gray-800 border-gray-300' };
    }
  };

  return (
    <div className="space-y-6" id="market-trends-radar-container">
      {/* Top Banner & Context */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-x-24 -translate-y-24" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
              رادار اتجاهات السوق المصري الحي • تحليلات الربع الثالث 2026
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>رادار اتجاهات السوق والطلب المستقبلي</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                LIVE MARKET RADAR
              </span>
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              تحليل البيانات التاريخية لسلوك الشراء عبر أمازون مصر، نون، جوميا، كنز، وهومزمارت، وتحديد المنتجات الصاعدة والهابطة، لتوجيه قرارات الشراء والتسعير وتأمين صفقات الجملة المربحة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToOrders && (
              <button
                id="btn-radar-to-orders"
                onClick={onNavigateToOrders}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                جدولة الطلبات وبوالص الشحن
              </button>
            )}
            {onNavigateToSimulator && (
              <button
                id="btn-radar-to-simulator"
                onClick={() => onNavigateToSimulator(selectedAnalysisProduct)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-200 hover:text-white border border-slate-700 text-xs md:text-sm font-semibold rounded-xl transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                محاكاة أرباح المنتج المحدد
              </button>
            )}
          </div>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-indigo-800/50">
          <div className="bg-slate-850/80 bg-slate-800/50 backdrop-blur rounded-xl p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">المنتجات المتابعة</span>
            <div className="text-2xl font-bold text-white font-mono">{summary.totalAnalyzedProducts}</div>
            <span className="text-[11px] text-slate-400">منتج بالسوق المصري</span>
          </div>

          <div className="bg-rose-950/40 rounded-xl p-3.5 border border-rose-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-300 block mb-1">طلب صاعد بقوة</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-200 font-mono">{summary.surgingProductsCount}</div>
            <span className="text-[11px] text-rose-300">أعلى وتيرة بحث ومبيعات</span>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 block mb-1">طلب متنامي</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-200 font-mono">{summary.growingProductsCount}</div>
            <span className="text-[11px] text-emerald-300">فرص توسع وتخزين</span>
          </div>

          <div className="bg-sky-950/40 rounded-xl p-3.5 border border-sky-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-300 block mb-1">شراء فوري عاجل</span>
              <Zap className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-200 font-mono">{summary.urgentBuyCount}</div>
            <span className="text-[11px] text-sky-300">قبل نفاذ الموردين</span>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">مؤشر الطلب العام</span>
            <div className="text-2xl font-bold text-indigo-300 font-mono">{summary.averageMarketDemandScore}/100</div>
            <span className="text-[11px] text-slate-400">نشاط السوق المصري</span>
          </div>

          <div className="bg-indigo-950/50 rounded-xl p-3.5 border border-indigo-700/50">
            <span className="text-xs text-indigo-300 block mb-1">الربح المتوقع بالصاعد</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {summary.potentialProfitFromSurgingEGP.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
            </div>
            <span className="text-[11px] text-indigo-300">أرباح صفقات الجملة</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Deep Analysis for Selected Product + Live Historical Demand Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Detailed Historical Chart & Forecast */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getTrendBadgeStyle(currentAnalysis.trendDirection)}`}>
                    {currentAnalysis.trendBadge}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getQuadrantBadge(currentAnalysis.quadrant).color}`}>
                    {getQuadrantBadge(currentAnalysis.quadrant).label}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  تحليل الاتجاه التاريخي: {currentAnalysis.productTitle}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  تتبع مؤشر الطلب الأسبوعي، متوسط سعر البيع للمنافسين، وحجم البحث على مدار آخر 8 أسابيع
                </p>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-2">
                {onNavigateToPricing && (
                  <button
                    id="btn-radar-set-guardrails"
                    onClick={() => onNavigateToPricing(selectedAnalysisProduct)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    خطة وحدود التسعير
                  </button>
                )}
                {onNavigateToSimulator && (
                  <button
                    id="btn-radar-simulate-product"
                    onClick={() => onNavigateToSimulator(selectedAnalysisProduct)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    محاكي الأرباح
                  </button>
                )}
              </div>
            </div>

            {/* Historical Charts (Demand vs Price) */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
                <span className="font-semibold flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  منحنى الطلب الأسبوعي ومعدل أسعار المنافسين
                </span>
                <span className="text-[11px] text-gray-400">
                  تحديث تلقائي وفق كشط أسعار المتاجر المصرية
                </span>
              </div>

              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260} debounce={50}>
                  <AreaChart data={currentAnalysis.historicalPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="searchGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      formatter={(value: any, name: string) => {
                        if (name === 'demandScore') return [`${value}/100`, 'مؤشر الطلب'];
                        if (name === 'averagePriceEGP') return [`${value.toLocaleString('ar-EG')} ج.م`, 'متوسط السعر'];
                        if (name === 'searchInterestScore') return [`${value}/100`, 'حجم البحث والاهتمام'];
                        if (name === 'salesUnitsEstimated') return [`${value} قطعة`, 'المبيعات المقدرة بالسوق'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `الفترة: ${label}`}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      formatter={(value) => {
                        if (value === 'demandScore') return 'مؤشر الطلب العام (0-100)';
                        if (value === 'searchInterestScore') return 'حجم البحث والاهتمام';
                        if (value === 'averagePriceEGP') return 'متوسط سعر البيع (ج.م)';
                        return value;
                      }}
                    />
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="demandScore" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#demandGradient)" 
                    />
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="searchInterestScore" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      fillOpacity={1} 
                      fill="url(#searchGradient)" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="averagePriceEGP" 
                      stroke="#0ea5e9" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#0ea5e9' }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategic KPI Grid for the Selected Product */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="text-[11px] text-gray-500 block mb-1">نمو الطلب الشهري</span>
                <div className="flex items-center gap-1">
                  {currentAnalysis.demandGrowthRatePercent >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  )}
                  <span className={`text-base font-bold font-mono ${currentAnalysis.demandGrowthRatePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {currentAnalysis.demandGrowthRatePercent > 0 ? '+' : ''}{currentAnalysis.demandGrowthRatePercent}%
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="text-[11px] text-gray-500 block mb-1">سرعة تغيير سعر المنافسين</span>
                <div className="text-base font-bold text-gray-800 font-mono">
                  {currentAnalysis.competitorPriceVelocityPercent > 0 ? '+' : ''}{currentAnalysis.competitorPriceVelocityPercent}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="text-[11px] text-gray-500 block mb-1">خطر نفاذ المخزون بالسوق</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-base font-bold text-rose-700 font-mono">
                    {currentAnalysis.stockoutRiskPercent}%
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="text-[11px] text-gray-500 block mb-1">المخزون المتبقي بالسوق</span>
                <div className="text-base font-bold text-sky-700 font-mono">
                  {currentAnalysis.daysOfInventoryLeftMarketWide} يوم تقريباً
                </div>
              </div>
            </div>

            {/* AI Procurement Decision Box */}
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-100">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                    توصية الشراء والقرار التنفيذي (AI Procurement Advice):
                    <span className="px-2 py-0.5 rounded bg-indigo-200/80 text-indigo-900 text-[11px] font-semibold">
                      {currentAnalysis.procurementActionLabel}
                    </span>
                  </h4>
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    {currentAnalysis.aiProcurementVerdict}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-indigo-700 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-indigo-600" />
                      الكمية المقترحة للشراء: <strong>{currentAnalysis.recommendedOrderQuantity} قطعة</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      نافذة الطلب: <strong>{currentAnalysis.recommendedOrderWindow}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wholesale Price Inflation Forecast */}
            <div className="mt-4 p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/70 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900">
                <span className="font-bold">توقعات أسعار الجملة (شارع عبد العزيز ومول البستان): </span>
                <span>
                  متوقع تغير بنسبة {currentAnalysis.wholesalePriceForecast.expectedChangePercent > 0 ? '+' : ''}
                  {currentAnalysis.wholesalePriceForecast.expectedChangePercent}% 
                  ({currentAnalysis.wholesalePriceForecast.forecastDirection === 'up' ? 'ارتفاع متوقع' : 'استقرار'}) - 
                  {currentAnalysis.wholesalePriceForecast.reason}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: All Tracked Products Radar List with Filters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                قائمة متابعة زخم المنتجات
              </h3>
              <span className="text-xs text-gray-400">
                {filteredAnalyses.length} منتج
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو الفئة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                  activeFilter === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                الكل ({allAnalyses.length})
              </button>
              <button
                onClick={() => setActiveFilter('surging')}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                  activeFilter === 'surging' 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                صاعد بقوة ({summary.surgingProductsCount})
              </button>
              <button
                onClick={() => setActiveFilter('urgent_buy')}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                  activeFilter === 'urgent_buy' 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                شراء عاجل ({summary.urgentBuyCount})
              </button>
              <button
                onClick={() => setActiveFilter('growing')}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                  activeFilter === 'growing' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                نمو متصاعد
              </button>
            </div>

            {/* Product Mini Cards List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredAnalyses.map((item) => {
                const isSelected = item.productId === selectedAnalysisProduct.id;
                const matchedProduct = products.find(p => p.id === item.productId) || products[0];

                return (
                  <div
                    key={item.productId}
                    onClick={() => {
                      setSelectedAnalysisProduct(matchedProduct);
                      onSelectProduct?.(matchedProduct.id);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400 shadow-sm'
                        : 'bg-gray-50/50 hover:bg-gray-100/80 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getTrendBadgeStyle(item.trendDirection)}`}>
                          {item.trendBadge}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-1">
                          {item.productTitle}
                        </h4>
                      </div>
                      <div className="text-left shrink-0">
                        <div className="text-xs font-bold text-indigo-700 font-mono">
                          {item.demandScore}/100
                        </div>
                        <span className="text-[10px] text-gray-400">مؤشر الطلب</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60 text-[11px]">
                      <span className="text-gray-500">
                        سعر الجملة: <strong className="text-gray-800 font-mono">{item.estimatedWholesaleCost.toLocaleString('ar-EG')} ج.م</strong>
                      </span>
                      <span className={`font-semibold font-mono ${item.demandGrowthRatePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.demandGrowthRatePercent > 0 ? '+' : ''}{item.demandGrowthRatePercent}% نمو
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
