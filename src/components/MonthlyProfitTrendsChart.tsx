import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Percent,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export interface MonthlyProfitDataPoint {
  month: string;
  monthShort: string;
  revenue: number;
  costs: number;
  netProfit: number;
  marginPercent: number;
  ordersCount: number;
  targetProfit: number;
}

const STORAGE_KEY = 'radar_monthly_profit_trends_v2';

const DEFAULT_MONTHLY_DATA: MonthlyProfitDataPoint[] = [
  { month: 'نوفمبر 2025', monthShort: 'نوفمبر', revenue: 78500, costs: 56200, netProfit: 22300, marginPercent: 28.4, ordersCount: 84, targetProfit: 20000 },
  { month: 'ديسمبر 2025', monthShort: 'ديسمبر', revenue: 112000, costs: 77800, netProfit: 34200, marginPercent: 30.5, ordersCount: 126, targetProfit: 28000 },
  { month: 'يناير 2026', monthShort: 'يناير', revenue: 94000, costs: 68100, netProfit: 25900, marginPercent: 27.6, ordersCount: 98, targetProfit: 26000 },
  { month: 'فبراير 2026', monthShort: 'فبراير', revenue: 89500, costs: 62400, netProfit: 27100, marginPercent: 30.3, ordersCount: 92, targetProfit: 26000 },
  { month: 'مارس 2026', monthShort: 'مارس', revenue: 135000, costs: 92500, netProfit: 42500, marginPercent: 31.5, ordersCount: 148, targetProfit: 35000 },
  { month: 'أبريل 2026', monthShort: 'أبريل', revenue: 148000, costs: 99800, netProfit: 48200, marginPercent: 32.6, ordersCount: 162, targetProfit: 40000 },
  { month: 'مايو 2026', monthShort: 'مايو (تقديري)', monthShort2: 'مايو', revenue: 162000, costs: 108500, netProfit: 53500, marginPercent: 33.0, ordersCount: 178, targetProfit: 45000 } as any,
];

interface MonthlyProfitTrendsChartProps {
  currency?: string;
  catalogNetProfitTotal?: number;
}

export const MonthlyProfitTrendsChart: React.FC<MonthlyProfitTrendsChartProps> = ({
  currency = 'ج.م',
  catalogNetProfitTotal,
}) => {
  const [timeRange, setTimeRange] = useState<'6m' | 'all'>('all');
  const [chartViewMode, setChartViewMode] = useState<'combined' | 'profit_only' | 'revenue_vs_cost'>('combined');

  const [data, setData] = useState<MonthlyProfitDataPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_MONTHLY_DATA;
  });

  const displayedData = useMemo(() => {
    if (timeRange === '6m') {
      return data.slice(-6);
    }
    return data;
  }, [data, timeRange]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalRev = displayedData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalCost = displayedData.reduce((acc, curr) => acc + curr.costs, 0);
    const totalProfit = displayedData.reduce((acc, curr) => acc + curr.netProfit, 0);
    const avgProfit = Math.round(totalProfit / Math.max(1, displayedData.length));
    const avgMargin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0';
    const totalOrders = displayedData.reduce((acc, curr) => acc + curr.ordersCount, 0);

    const peakMonth = [...displayedData].sort((a, b) => b.netProfit - a.netProfit)[0];

    // MoM Growth (comparing last two points)
    let momGrowth = 0;
    if (displayedData.length >= 2) {
      const last = displayedData[displayedData.length - 1].netProfit;
      const prev = displayedData[displayedData.length - 2].netProfit;
      momGrowth = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
    }

    return {
      totalRev,
      totalCost,
      totalProfit,
      avgProfit,
      avgMargin,
      totalOrders,
      peakMonth,
      momGrowth,
    };
  }, [displayedData]);

  const handleResetData = () => {
    setData(DEFAULT_MONTHLY_DATA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MONTHLY_DATA));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Top Header & Mode Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span>تحليل الأرباح الشهرية التراكمية (Recharts)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              بيانات متزامنة مع السوق المصري
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white font-['Alexandria'] flex items-center gap-2">
            <span>اتجاهات الأرباح ونمو الإيرادات الشهرية</span>
            <span className="text-xs text-slate-400 font-mono font-normal">
              ({displayedData.length} أشهر مسجلة)
            </span>
          </h3>

          <p className="text-xs text-slate-400">
            رصد تطور صافي الأرباح المحققة بعد خصم عمولات منصات أمازون ونون، تكاليف الشحن، وبوالص التغليف
          </p>
        </div>

        {/* Action & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Time range switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                timeRange === '6m'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              آخر 6 أشهر
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                timeRange === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              كامل السجل (2025/2026)
            </button>
          </div>

          {/* View mode switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setChartViewMode('combined')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                chartViewMode === 'combined'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض مركب للإيرادات، التكاليف وصافي الربح"
            >
              مركب (شامل)
            </button>
            <button
              onClick={() => setChartViewMode('profit_only')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                chartViewMode === 'profit_only'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="التركيز على منحنى صافي الربح والهدف"
            >
              صافي الربح فقط
            </button>
            <button
              onClick={() => setChartViewMode('revenue_vs_cost')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                chartViewMode === 'revenue_vs_cost'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="مقارنة المبيعات مقابل إجمالي المصاريف"
            >
              المبيعات vs التكاليف
            </button>
          </div>

          <button
            onClick={handleResetData}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition cursor-pointer"
            title="إعادة ضبط البيانات النموذجية"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Net Profit */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold">إجمالي صافي الربح</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            +{metrics.totalProfit.toLocaleString()} <span className="text-xs font-normal text-slate-400">{currency}</span>
          </div>
          <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>نمو شهري (+{metrics.momGrowth}%)</span>
          </div>
        </div>

        {/* Average Monthly Profit */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold">متوسط الربح الشهري</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {metrics.avgProfit.toLocaleString()} <span className="text-xs font-normal text-slate-400">{currency}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            على مدار {displayedData.length} أشهر
          </div>
        </div>

        {/* Average Profit Margin */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold">متوسط هامش الربح</span>
            <Percent className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-300 font-mono">
            {metrics.avgMargin}%
          </div>
          <div className="text-[11px] text-sky-400/90 font-bold">
            بعد استقطاع العمولات والشحن
          </div>
        </div>

        {/* Peak Performance Month */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold">أعلى شهر أرباحاً</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-purple-300 truncate" title={metrics.peakMonth?.month}>
            {metrics.peakMonth?.monthShort}
          </div>
          <div className="text-[11px] text-purple-400 font-mono font-bold">
            +{metrics.peakMonth?.netProfit.toLocaleString()} {currency} ({metrics.peakMonth?.ordersCount} طلب)
          </div>
        </div>
      </div>

      {/* Pure Tailwind CSS Monthly Trends Chart (No Recharts) */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 relative" dir="ltr">
        <div className="flex items-end justify-between gap-2 h-64">
          {displayedData.map((pData, idx) => {
            const maxVal = Math.max(...displayedData.map(d => Math.max(d.revenue, d.netProfit, d.costs)));
            const currentVal = chartViewMode === 'profit_only' ? pData.netProfit : pData.revenue;
            const heightPct = Math.max(15, Math.round((currentVal / (maxVal || 1)) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer">
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-slate-900 border border-slate-700 text-white text-[10px] rounded-lg px-2 py-1 shadow-xl whitespace-nowrap font-mono">
                    <div>{pData.month}</div>
                    <div className="text-emerald-400 font-bold">ربح: {pData.netProfit.toLocaleString()} {currency}</div>
                    <div className="text-indigo-400">مبيعات: {pData.revenue.toLocaleString()} {currency}</div>
                  </div>
                  <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 -mt-1" />
                </div>
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    chartViewMode === 'profit_only' ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-indigo-500 group-hover:bg-indigo-400'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] text-slate-400 font-mono mt-2 truncate text-center w-full">
                  {pData.monthShort}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            يتم حساب أرباح كل شهر بناءً على أسعار البيع المعتمدة، خصومات عمولات أمازون ونون، وبوالص الشحن المسجلة في جدول التاجر.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
          <span className="text-emerald-400 font-bold">🟢 صافي الربح الفعلي</span>
          <span className="text-indigo-400 font-bold">🟣 المبيعات الإجمالية</span>
          <span className="text-amber-400 font-bold">🟡 الهدف التقديري</span>
        </div>
      </div>
    </div>
  );
};
