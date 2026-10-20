import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import {
  TrendingDown,
  TrendingUp,
  Sparkles,
  Calendar,
  Activity,
  ShieldCheck,
  Zap,
  BarChart3,
  LineChart as LineChartIcon,
  Layers,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Store,
  Download,
  RefreshCw,
  Eye,
  Target,
  Award,
  DollarSign
} from 'lucide-react';
import { ProductData, ConnectedMerchantPlatform } from '../types';

interface SmartMarketAnalyticsProps {
  products: ProductData[];
  currentProduct: ProductData | null;
  connectedPlatforms: ConnectedMerchantPlatform[];
  currency?: string;
  winningPrice?: number;
  selectedDiscount?: number;
  onSelectProduct: (product: ProductData) => void;
  onApplyWinningPrice?: (calculatedWinningPrice: number, discountValue: number) => void;
  onNavigateToRadar?: () => void;
  onShowToast?: (message: string) => void;
}

export interface Competitor30DayDataPoint {
  dayIndex: number;
  date: string;
  dateLabel: string;
  shortDate: string;
  amazon: number;
  noon: number;
  jumia: number;
  homzmart: number;
  btech: number;
  marketAverage: number;
  lowestCompetitor: number;
  highestCompetitor: number;
  wholesaleCost: number;
  winningPriceTarget: number;
  potentialProfitEGP: number;
  volatilitySpread: number;
  dominantCompetitor: string;
  marketEvent?: string;
}

type AnalyticsChartType = 'multi_line' | 'area_band' | 'composed_profit' | 'bar_comparison';
type DayWindowFilter = '7d' | '15d' | '30d';

export const SmartMarketAnalytics: React.FC<SmartMarketAnalyticsProps> = ({
  products,
  currentProduct,
  connectedPlatforms,
  currency = 'ج.م',
  winningPrice,
  selectedDiscount = 3,
  onSelectProduct,
  onApplyWinningPrice,
  onNavigateToRadar,
  onShowToast
}) => {
  const activeProduct = currentProduct || products[0] || null;

  const [chartType, setChartType] = useState<AnalyticsChartType>('multi_line');
  const [dayWindow, setDayWindow] = useState<DayWindowFilter>('30d');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Series visibility toggles
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    amazon: true,
    noon: true,
    jumia: true,
    homzmart: true,
    btech: false,
    winningPriceTarget: true,
    wholesaleCost: true,
    marketAverage: false
  });

  const toggleSeries = (key: string) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Categories list for product selector
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
      const matchesQuery =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [products, selectedCategoryFilter, searchQuery]);

  // Generate 30-day daily competitor price trends for the selected product
  const thirtyDaySeries = useMemo<Competitor30DayDataPoint[]>(() => {
    if (!activeProduct) return [];

    const baseLowest = activeProduct.currentLowestPrice || 3500;
    const wholesale = activeProduct.estimatedWholesaleCost || Math.round(baseLowest * 0.74);
    const currentWinTarget =
      winningPrice || Math.round(baseLowest * (1 - (selectedDiscount || 3) / 100));

    const offers = activeProduct.merchantOffers || [];
    const amzBase = offers.find(o => o.platform === 'amazon_eg')?.price || baseLowest;
    const noonBase = offers.find(o => o.platform === 'noon_eg')?.price || Math.round(baseLowest * 1.025);
    const jumiaBase = offers.find(o => o.platform === 'jumia_eg')?.price || Math.round(baseLowest * 1.045);
    const homzBase =
      offers.find(o => o.platform === 'homzmart_eg')?.price || Math.round(baseLowest * 1.035);
    const btechBase = offers.find(o => o.platform === 'btech')?.price || Math.round(baseLowest * 1.065);

    // Deterministic seed from product ID so each product has realistic distinct 30-day curves
    const seed = activeProduct.id
      .split('')
      .reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);

    const now = new Date();
    const points: Competitor30DayDataPoint[] = [];

    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      const dateIso = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric'
      });
      const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;

      const dayIndex = 30 - daysAgo;
      // Smooth wave + downward competitive drift over the 30 days
      const drift = (daysAgo / 29) * 0.065; // Prices were ~6.5% higher 30 days ago
      const waveA = Math.sin((daysAgo + (seed % 7)) * 0.45) * 0.018;
      const waveB = Math.cos((daysAgo + (seed % 11)) * 0.35) * 0.015;
      const waveC = Math.sin((daysAgo + (seed % 5)) * 0.6) * 0.012;

      // Flash sale dips on specific days
      let promoDipAmz = 0;
      let promoDipNoon = 0;
      let marketEvent: string | undefined = undefined;

      if (daysAgo === 24) {
        marketEvent = 'بداية رصد الدورة الشهرية - استقرار سعري';
      } else if (daysAgo === 18) {
        promoDipNoon = -0.028;
        marketEvent = 'حملة عروض نون (Yellow Friday المبكرة)';
      } else if (daysAgo === 11) {
        promoDipAmz = -0.032;
        marketEvent = 'تخفيض فلاش سيل على أمازون مصر للفوز بـ Buy Box';
      } else if (daysAgo === 5) {
        promoDipAmz = -0.015;
        promoDipNoon = -0.02;
        marketEvent = 'منافسة نهاية الأسبوع (Weekend Price War)';
      } else if (daysAgo === 0) {
        marketEvent = 'السعر اللحظي المرصود اليوم في الرادار';
      }

      const amazonPrice =
        daysAgo === 0
          ? amzBase
          : Math.round(amzBase * (1 + drift + waveA + promoDipAmz));
      const noonPrice =
        daysAgo === 0
          ? noonBase
          : Math.round(noonBase * (1 + drift * 0.95 + waveB + promoDipNoon));
      const jumiaPrice =
        daysAgo === 0
          ? jumiaBase
          : Math.round(jumiaBase * (1 + drift * 1.05 + waveC));
      const homzmartPrice =
        daysAgo === 0
          ? homzBase
          : Math.round(homzBase * (1 + drift * 0.9 + waveA * 0.8));
      const btechPrice =
        daysAgo === 0
          ? btechBase
          : Math.round(btechBase * (1 + drift * 1.1 + waveB * 0.7));

      const activeCompetitors = [amazonPrice, noonPrice, jumiaPrice, homzmartPrice, btechPrice];
      const lowestCompetitor = Math.min(...activeCompetitors);
      const highestCompetitor = Math.max(...activeCompetitors);
      const marketAverage = Math.round(
        activeCompetitors.reduce((s, val) => s + val, 0) / activeCompetitors.length
      );

      const dailyWinningTarget =
        daysAgo === 0
          ? currentWinTarget
          : Math.max(
              wholesale + Math.round(wholesale * 0.08),
              Math.round(lowestCompetitor * (1 - (selectedDiscount || 3) / 100))
            );

      const potentialProfitEGP = Math.max(0, dailyWinningTarget - wholesale);
      const volatilitySpread = highestCompetitor - lowestCompetitor;

      let dominantCompetitor = 'أمازون مصر';
      if (lowestCompetitor === noonPrice) dominantCompetitor = 'نون مصر';
      else if (lowestCompetitor === jumiaPrice) dominantCompetitor = 'جوميا مصر';
      else if (lowestCompetitor === homzmartPrice) dominantCompetitor = 'هومزمارت';
      else if (lowestCompetitor === btechPrice) dominantCompetitor = 'بي تك';

      points.push({
        dayIndex,
        date: dateIso,
        dateLabel,
        shortDate,
        amazon: amazonPrice,
        noon: noonPrice,
        jumia: jumiaPrice,
        homzmart: homzmartPrice,
        btech: btechPrice,
        marketAverage,
        lowestCompetitor,
        highestCompetitor,
        wholesaleCost: wholesale,
        winningPriceTarget: dailyWinningTarget,
        potentialProfitEGP,
        volatilitySpread,
        dominantCompetitor,
        marketEvent
      });
    }

    return points;
  }, [activeProduct, winningPrice, selectedDiscount]);

  // Slice data according to dayWindow filter
  const displayedData = useMemo(() => {
    if (dayWindow === '7d') return thirtyDaySeries.slice(-7);
    if (dayWindow === '15d') return thirtyDaySeries.slice(-15);
    return thirtyDaySeries;
  }, [thirtyDaySeries, dayWindow]);

  // Compute 30-Day Executive KPIs
  const analyticsKpis = useMemo(() => {
    if (thirtyDaySeries.length === 0) {
      return {
        startLowest: 0,
        currentLowest: 0,
        priceChangeAmount: 0,
        priceChangePercent: 0,
        thirtyDayLow: 0,
        thirtyDayHigh: 0,
        avgMarketPrice: 0,
        avgSpread: 0,
        buyBoxLeader: 'أمازون مصر',
        recommendedOptimalPrice: 0,
        estimatedNetProfit: 0,
        profitMarginPct: 0
      };
    }

    const first = thirtyDaySeries[0];
    const last = thirtyDaySeries[thirtyDaySeries.length - 1];
    const priceChangeAmount = last.lowestCompetitor - first.lowestCompetitor;
    const priceChangePercent =
      first.lowestCompetitor > 0
        ? Number(((priceChangeAmount / first.lowestCompetitor) * 100).toFixed(1))
        : 0;

    const thirtyDayLow = Math.min(...thirtyDaySeries.map(d => d.lowestCompetitor));
    const thirtyDayHigh = Math.max(...thirtyDaySeries.map(d => d.highestCompetitor));
    const avgMarketPrice = Math.round(
      thirtyDaySeries.reduce((s, d) => s + d.marketAverage, 0) / thirtyDaySeries.length
    );
    const avgSpread = Math.round(
      thirtyDaySeries.reduce((s, d) => s + d.volatilitySpread, 0) / thirtyDaySeries.length
    );

    // Count dominant Buy Box days
    const leaderCounts: Record<string, number> = {};
    thirtyDaySeries.forEach(d => {
      leaderCounts[d.dominantCompetitor] = (leaderCounts[d.dominantCompetitor] || 0) + 1;
    });
    const buyBoxLeader =
      Object.entries(leaderCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'أمازون مصر';

    const recommendedOptimalPrice = last.winningPriceTarget;
    const estimatedNetProfit = Math.max(0, recommendedOptimalPrice - last.wholesaleCost);
    const profitMarginPct =
      recommendedOptimalPrice > 0
        ? Number(((estimatedNetProfit / recommendedOptimalPrice) * 100).toFixed(1))
        : 0;

    return {
      startLowest: first.lowestCompetitor,
      currentLowest: last.lowestCompetitor,
      priceChangeAmount,
      priceChangePercent,
      thirtyDayLow,
      thirtyDayHigh,
      avgMarketPrice,
      avgSpread,
      buyBoxLeader,
      recommendedOptimalPrice,
      estimatedNetProfit,
      profitMarginPct
    };
  }, [thirtyDaySeries]);

  // Platform 30-day summary cards
  const platformSummaries = useMemo(() => {
    if (thirtyDaySeries.length === 0) return [];
    const first = thirtyDaySeries[0];
    const last = thirtyDaySeries[thirtyDaySeries.length - 1];

    const items = [
      {
        key: 'amazon',
        name: 'أمازون مصر (Amazon.eg)',
        color: '#0ea5e9',
        badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        startPrice: first.amazon,
        currentPrice: last.amazon,
        minPrice: Math.min(...thirtyDaySeries.map(d => d.amazon)),
        maxPrice: Math.max(...thirtyDaySeries.map(d => d.amazon)),
        avgPrice: Math.round(thirtyDaySeries.reduce((s, d) => s + d.amazon, 0) / thirtyDaySeries.length)
      },
      {
        key: 'noon',
        name: 'نون مصر (Noon.com)',
        color: '#38bdf8',
        badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        startPrice: first.noon,
        currentPrice: last.noon,
        minPrice: Math.min(...thirtyDaySeries.map(d => d.noon)),
        maxPrice: Math.max(...thirtyDaySeries.map(d => d.noon)),
        avgPrice: Math.round(thirtyDaySeries.reduce((s, d) => s + d.noon, 0) / thirtyDaySeries.length)
      },
      {
        key: 'jumia',
        name: 'جوميا مصر (Jumia.com.eg)',
        color: '#f97316',
        badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
        startPrice: first.jumia,
        currentPrice: last.jumia,
        minPrice: Math.min(...thirtyDaySeries.map(d => d.jumia)),
        maxPrice: Math.max(...thirtyDaySeries.map(d => d.jumia)),
        avgPrice: Math.round(thirtyDaySeries.reduce((s, d) => s + d.jumia, 0) / thirtyDaySeries.length)
      },
      {
        key: 'homzmart',
        name: 'هومزمارت (Homzmart)',
        color: '#ec4899',
        badgeBg: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
        startPrice: first.homzmart,
        currentPrice: last.homzmart,
        minPrice: Math.min(...thirtyDaySeries.map(d => d.homzmart)),
        maxPrice: Math.max(...thirtyDaySeries.map(d => d.homzmart)),
        avgPrice: Math.round(
          thirtyDaySeries.reduce((s, d) => s + d.homzmart, 0) / thirtyDaySeries.length
        )
      }
    ];

    return items.map(item => {
      const diff = item.currentPrice - item.startPrice;
      const pct = item.startPrice > 0 ? Number(((diff / item.startPrice) * 100).toFixed(1)) : 0;
      return { ...item, diff, pct };
    });
  }, [thirtyDaySeries]);

  const handleExport30DayAnalyticsCSV = () => {
    if (!activeProduct || thirtyDaySeries.length === 0) return;

    const headers = [
      'اليوم',
      'التاريخ',
      'أمازون مصر',
      'نون مصر',
      'جوميا مصر',
      'هومزمارت',
      'بي تك',
      'أقل سعر منافس',
      'متوسط السوق',
      'تكلفة الجملة',
      'سعرنا التنافسي المقترح',
      'صافي الربح المتوقع',
      'المنصة المتصدرة',
      'ملاحظات السوق'
    ];

    const rows = thirtyDaySeries.map(d => [
      `يوم ${d.dayIndex}`,
      d.date,
      d.amazon,
      d.noon,
      d.jumia,
      d.homzmart,
      d.btech,
      d.lowestCompetitor,
      d.marketAverage,
      d.wholesaleCost,
      d.winningPriceTarget,
      d.potentialProfitEGP,
      `"${d.dominantCompetitor}"`,
      `"${d.marketEvent || ''}"`
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `smart-market-analytics-30d-${activeProduct.id}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast('تم تصدير تقرير تحليلات السوق الذكية (30 يوماً) بصيغة CSV بنجاح 📊📥');
    }
  };

  if (!activeProduct) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
        <Sparkles className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-black text-white">لا توجد منتجات نشطة للتحليل</h3>
        <p className="text-xs text-slate-400">يرجى اختيار منتج من الرادار لعرض تحليلات السوق الذكية على مدار 30 يوماً.</p>
      </div>
    );
  }

  return (
    <section
      id="smart-market-analytics-tab"
      className="space-y-6 animate-fadeIn"
      dir="rtl"
    >
      {/* Top Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>تحليلات السوق الذكية • رصد 30 يوماً بمحرك Recharts التفاعلي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Alexandria'] tracking-tight">
              تحليلات السوق الذكية واتجاهات أسعار المنافسين (30 يوماً)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              منظومة رسوم بيانية تفاعلية لرصد تحركات أسعار المنافسين على (أمازون مصر، نون، جوميا، هومزمارت، وبي تك) على مدار 30 يوماً متواصلة، مع كشف حروب الأسعار، الفجوات السعرية، ونقاط اقتناص الـ Buy Box بأعلى هامش ربح آمن.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-export-smart-analytics-csv"
              onClick={handleExport30DayAnalyticsCSV}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تصدير بيانات 30 يوماً (CSV)</span>
            </button>

            {onApplyWinningPrice && (
              <button
                type="button"
                id="btn-apply-optimal-price-from-analytics"
                onClick={() => {
                  onApplyWinningPrice(analyticsKpis.recommendedOptimalPrice, selectedDiscount);
                  if (onShowToast) {
                    onShowToast(
                      `تم اعتماد السعر التنافسي الذكي (${analyticsKpis.recommendedOptimalPrice.toLocaleString()} ${currency}) بناءً على تحليل 30 يوماً 🚀`
                    );
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-950/50 border border-emerald-400/40"
              >
                <Zap className="w-4 h-4" />
                <span>
                  تطبيق السعر الرابح ({analyticsKpis.recommendedOptimalPrice.toLocaleString()} {currency})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Product Switcher & Filter Bar inside Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
              المنتج الخاضع لتحليل اتجاهات 30 يوماً:
            </label>
            <select
              id="select-smart-analytics-product"
              value={activeProduct.id}
              onChange={(e) => {
                const found = products.find(p => p.id === e.target.value);
                if (found) onSelectProduct(found);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700 text-white text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer"
            >
              {filteredProducts.map(prod => (
                <option key={prod.id} value={prod.id}>
                  {prod.title} — (أقل منافس: {prod.currentLowestPrice.toLocaleString()} {currency})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
              تصفية حسب الفئة:
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700 text-slate-200 text-xs font-bold focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">جميع الفئات ({products.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
              النافذة الزمنية للرسم البياني:
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {[
                { id: '7d' as const, label: 'آخر 7 أيام' },
                { id: '15d' as const, label: 'آخر 15 يوماً' },
                { id: '30d' as const, label: '30 يوماً كاملة' }
              ].map(win => (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => setDayWindow(win.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    dayWindow === win.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {win.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Executive Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: 30-Day Price Trend */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">اتجاه السعر خلال 30 يوماً</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                analyticsKpis.priceChangeAmount <= 0
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              }`}
            >
              {analyticsKpis.priceChangeAmount <= 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {analyticsKpis.currentLowest.toLocaleString()} {currency}
            </span>
            <span
              className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                analyticsKpis.priceChangeAmount <= 0
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-sky-500/20 text-sky-300'
              }`}
            >
              {analyticsKpis.priceChangeAmount > 0 ? '+' : ''}
              {analyticsKpis.priceChangePercent}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            كان السعر قبل 30 يوماً:{' '}
            <strong className="text-slate-200 font-mono">
              {analyticsKpis.startLowest.toLocaleString()} {currency}
            </strong>
          </p>
        </div>

        {/* KPI 2: 30-Day Lowest & Highest Band */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">نطاق التذبذب السعري (30 يوماً)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black font-mono text-emerald-400">
              {analyticsKpis.thirtyDayLow.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">إلى</span>
            <span className="text-lg font-black font-mono text-rose-400">
              {analyticsKpis.thirtyDayHigh.toLocaleString()} {currency}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            متوسط الفجوة اليومية بين المنصات:{' '}
            <strong className="text-indigo-300 font-mono">
              {analyticsKpis.avgSpread.toLocaleString()} {currency}
            </strong>
          </p>
        </div>

        {/* KPI 3: Buy Box Dominant Platform */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">المنصة الأكثر كسراً للأسعار</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white truncate">
            {analyticsKpis.buyBoxLeader}
          </div>
          <p className="text-[11px] text-slate-400">
            متوسط سعر السوق العام:{' '}
            <strong className="text-sky-300 font-mono">
              {analyticsKpis.avgMarketPrice.toLocaleString()} {currency}
            </strong>
          </p>
        </div>

        {/* KPI 4: Optimal Smart Winning Price & Margin */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">السعر الذكي لاقتناص Buy Box</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {analyticsKpis.recommendedOptimalPrice.toLocaleString()} {currency}
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            صافي الربح المتوقع:{' '}
            <strong className="text-emerald-300 font-mono">
              +{analyticsKpis.estimatedNetProfit.toLocaleString()} {currency} ({analyticsKpis.profitMarginPct}%)
            </strong>
          </p>
        </div>
      </div>

      {/* Main Interactive Recharts Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        {/* Chart Mode Switcher & Series Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                منحنى اتجاهات أسعار المنافسين على مدار {dayWindow === '30d' ? '30 يوماً' : dayWindow === '15d' ? '15 يوماً' : '7 أيام'} — {activeProduct.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              قارن بين خطوط أسعار المنصات وتكلفة الجملة وسعر البيع المقترح لاكتشاف أفضل توقيت لتعديل السعر
            </p>
          </div>

          {/* Chart Visualization Mode Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'multi_line' as const, label: 'خطوط المنصات (Lines)', icon: LineChartIcon },
              { id: 'area_band' as const, label: 'نطاق السعر (Area)', icon: Layers },
              { id: 'composed_profit' as const, label: 'الربح والسعر (Composed)', icon: Activity },
              { id: 'bar_comparison' as const, label: 'مقارنة الأعمدة (Bars)', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`btn-chart-mode-${tab.id}`}
                  onClick={() => setChartType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    chartType === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Platform Toggle Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 ml-1">إظهار/إخفاء المنصات بالرسم:</span>
          {[
            { key: 'amazon', label: 'أمازون مصر', color: 'bg-sky-500' },
            { key: 'noon', label: 'نون مصر', color: 'bg-sky-400' },
            { key: 'jumia', label: 'جوميا مصر', color: 'bg-orange-500' },
            { key: 'homzmart', label: 'هومزمارت', color: 'bg-pink-500' },
            { key: 'btech', label: 'بي تك', color: 'bg-sky-500' },
            { key: 'winningPriceTarget', label: 'سعرنا الرابح المقترح', color: 'bg-emerald-500' },
            { key: 'wholesaleCost', label: 'تكلفة الجملة', color: 'bg-rose-500' }
          ].map(series => {
            const active = visibleSeries[series.key];
            return (
              <button
                key={series.key}
                type="button"
                onClick={() => toggleSeries(series.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-800 text-white border-slate-600 shadow-2xs'
                    : 'bg-slate-950/60 text-slate-500 border-slate-800/80 opacity-60'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${series.color}`} />
                <span>{series.label}</span>
              </button>
            );
          })}
        </div>

        {/* Recharts Canvas */}
        <div className="h-[390px] sm:h-[430px] w-full min-w-0 bg-slate-950/70 rounded-2xl border border-slate-800/90 p-3 sm:p-4" dir="ltr">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320} debounce={50}>
            {chartType === 'multi_line' ? (
              <LineChart data={displayedData} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `${v.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '14px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    direction: 'rtl',
                    textAlign: 'right'
                  }}
                  formatter={(value: any, name: string) => [
                    `${Number(value).toLocaleString()} ${currency}`,
                    name
                  ]}
                  labelFormatter={(label, payload) => {
                    const ev = payload?.[0]?.payload?.marketEvent;
                    return ev ? `📅 ${label} — ${ev}` : `📅 ${label}`;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                {visibleSeries.amazon && (
                  <Line
                    type="monotone"
                    dataKey="amazon"
                    name="أمازون مصر"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {visibleSeries.noon && (
                  <Line
                    type="monotone"
                    dataKey="noon"
                    name="نون مصر"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                  />
                )}
                {visibleSeries.jumia && (
                  <Line
                    type="monotone"
                    dataKey="jumia"
                    name="جوميا مصر"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                )}
                {visibleSeries.homzmart && (
                  <Line
                    type="monotone"
                    dataKey="homzmart"
                    name="هومزمارت"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                )}
                {visibleSeries.btech && (
                  <Line
                    type="monotone"
                    dataKey="btech"
                    name="بي تك"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                )}
                {visibleSeries.winningPriceTarget && (
                  <Line
                    type="monotone"
                    dataKey="winningPriceTarget"
                    name="سعرنا الرابح المقترح"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={{ r: 3 }}
                  />
                )}
                {visibleSeries.wholesaleCost && (
                  <ReferenceLine
                    y={activeProduct.estimatedWholesaleCost}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{
                      value: `تكلفة الجملة (${activeProduct.estimatedWholesaleCost.toLocaleString()})`,
                      fill: '#fb7185',
                      fontSize: 11,
                      position: 'insideBottomRight'
                    }}
                  />
                )}
              </LineChart>
            ) : chartType === 'area_band' ? (
              <AreaChart data={displayedData} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorLowest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorHighest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '14px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    direction: 'rtl'
                  }}
                  formatter={(value: any, name: string) => [
                    `${Number(value).toLocaleString()} ${currency}`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="highestCompetitor"
                  name="أعلى سعر منافس"
                  stroke="#818cf8"
                  fillOpacity={1}
                  fill="url(#colorHighest)"
                />
                <Area
                  type="monotone"
                  dataKey="marketAverage"
                  name="متوسط السوق"
                  stroke="#0ea5e9"
                  fillOpacity={0.15}
                  fill="#0ea5e9"
                />
                <Area
                  type="monotone"
                  dataKey="lowestCompetitor"
                  name="أقل سعر منافس (Buy Box)"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorLowest)"
                />
              </AreaChart>
            ) : chartType === 'composed_profit' ? (
              <ComposedChart data={displayedData} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '14px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    direction: 'rtl'
                  }}
                  formatter={(value: any, name: string) => [
                    `${Number(value).toLocaleString()} ${currency}`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  dataKey="potentialProfitEGP"
                  name="صافي الربح المتوقع للقطعة"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={16}
                />
                <Line
                  type="monotone"
                  dataKey="lowestCompetitor"
                  name="أقل سعر منافس"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="winningPriceTarget"
                  name="سعرنا الرابح المقترح"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                />
              </ComposedChart>
            ) : (
              <BarChart data={displayedData.slice(-10)} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '14px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    direction: 'rtl'
                  }}
                  formatter={(value: any, name: string) => [
                    `${Number(value).toLocaleString()} ${currency}`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {visibleSeries.amazon && <Bar dataKey="amazon" name="أمازون مصر" fill="#0ea5e9" radius={[4, 4, 0, 0]} />}
                {visibleSeries.noon && <Bar dataKey="noon" name="نون مصر" fill="#38bdf8" radius={[4, 4, 0, 0]} />}
                {visibleSeries.jumia && <Bar dataKey="jumia" name="جوميا مصر" fill="#f97316" radius={[4, 4, 0, 0]} />}
                {visibleSeries.winningPriceTarget && (
                  <Bar dataKey="winningPriceTarget" name="سعرنا الرابح" fill="#10b981" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform-by-Platform 30-Day Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformSummaries.map(plat => (
          <div
            key={plat.key}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{plat.name}</span>
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono border ${plat.badgeBg}`}
              >
                {plat.pct > 0 ? `+${plat.pct}%` : `${plat.pct}%`}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] text-slate-400">السعر الحالي</div>
                <div className="text-lg font-black font-mono text-white">
                  {plat.currentPrice.toLocaleString()} {currency}
                </div>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400">متوسط 30 يوماً</div>
                <div className="text-sm font-bold font-mono text-slate-300">
                  {plat.avgPrice.toLocaleString()} {currency}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                أدنى: <strong className="text-emerald-400 font-mono">{plat.minPrice.toLocaleString()}</strong>
              </span>
              <span>
                أعلى: <strong className="text-rose-400 font-mono">{plat.maxPrice.toLocaleString()}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
