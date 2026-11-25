import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  Package,
  ArrowLeft,
  Target,
  Calendar,
} from 'lucide-react';
import { supabase, Product, isDemoOrOrphanProduct } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getPriceHistory, PriceHistoryEntry } from '../utils/priceHistoryManager';
import { auth } from '../firebase';
import { navigate } from '../utils/navigation';
import { EmergencyErrorBanner } from './EmergencyLoginButton';
import { RADAR_PULL_TO_REFRESH_EVENT } from './PullToRefresh';

interface MarketTrendsAnalysisProps {
  currency?: string;
  onShowToast?: (msg: string) => void;
}

type ForecastHorizon = 7 | 14 | 30;
type TrendDirection = 'up' | 'down' | 'stable';

interface HistoricalPoint {
  label: string;
  dateStr: string;
  isForecast: boolean;
  timestampMs: number;
  actualPrice: number | null;
  forecastPrice: number | null;
  competitorPrice: number | null;
}

interface ProductTrendForecast {
  product: Product;
  currentPrice: number;
  historicalAvg: number;
  historicalMin: number;
  historicalMax: number;
  pointsCount: number;
  forecastPrice: number;
  deltaEGP: number;
  deltaPercent: number;
  direction: TrendDirection;
  confidencePercent: number;
  volatilityPercent: number;
  recommendation: string;
  series: HistoricalPoint[];
}

function linearRegression(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function formatShortDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export const MarketTrendsAnalysis: React.FC<MarketTrendsAnalysisProps> = ({
  currency = 'ج.م',
  onShowToast,
}) => {
  const { user, profile } = useAuth();
  const activeEmail = (user?.email || profile?.email || '').trim().toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [historyByProduct, setHistoryByProduct] = useState<Record<string, PriceHistoryEntry[]>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [horizonDays, setHorizonDays] = useState<ForecastHorizon>(14);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const loadMarketData = useCallback(async () => {
    if (!activeEmail) {
      setProducts([]);
      setHistoryByProduct({});
      return;
    }

    setIsRefreshing(true);
    setFetchError(false);

    try {
      const { data: prodsData, error: prodsError } = await supabase
        .from('products')
        .select('id, trader_id, title, sku, price, stock, platform, buybox_price, competitor_price, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (prodsError) {
        console.error('MarketTrendsAnalysis products error:', prodsError);
        setFetchError(true);
        setProducts([]);
        return;
      }

      const cleanProducts = (Array.isArray(prodsData) ? (prodsData as Product[]) : []).filter(
        (p) => !isDemoOrOrphanProduct(p) && Number(p.price) > 0
      );

      setProducts(cleanProducts);
      if (cleanProducts.length > 0 && !selectedProductId) {
        setSelectedProductId(cleanProducts[0].id);
      }

      // Fetch recorded historical price points from Firestore when Firebase user session exists
      const fbUid = auth.currentUser?.uid;
      if (fbUid && cleanProducts.length > 0) {
        const subset = cleanProducts.slice(0, 20);
        const results = await Promise.allSettled(
          subset.map(async (p) => ({
            id: p.id,
            entries: await getPriceHistory(fbUid, p.id),
          }))
        );

        const nextHistoryMap: Record<string, PriceHistoryEntry[]> = {};
        results.forEach((res) => {
          if (res.status === 'fulfilled' && Array.isArray(res.value.entries) && res.value.entries.length > 0) {
            nextHistoryMap[res.value.id] = res.value.entries;
          }
        });
        setHistoryByProduct(nextHistoryMap);
      }
    } catch (err) {
      console.error('Failed to load market trends:', err);
      setFetchError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeEmail, selectedProductId]);

  useEffect(() => {
    loadMarketData();
    const handleRefresh = () => {
      loadMarketData();
    };
    window.addEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
    return () => window.removeEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
  }, [loadMarketData]);

  // Available platforms from actual products
  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.platform && p.platform.trim()) {
        set.add(p.platform.trim().toLowerCase());
      }
    });
    return Array.from(set);
  }, [products]);

  // Build statistical forecast per product from recorded history + competitor/buybox signals
  const forecasts = useMemo<ProductTrendForecast[]>(() => {
    const nowMs = Date.now();
    const dayMs = 86_400_000;

    return products
      .filter((p) => platformFilter === 'all' || (p.platform || '').toLowerCase() === platformFilter)
      .map((product) => {
        const currentPrice = Number(product.price) || 0;
        const competitorPrice = Number(product.competitor_price) > 0 ? Number(product.competitor_price) : null;
        const buyBoxPrice = Number(product.buybox_price) > 0 ? Number(product.buybox_price) : null;
        const rawEntries = historyByProduct[product.id] || [];

        const recordedSeries: Array<{ ms: number; price: number }> = rawEntries
          .map((entry) => {
            const ms =
              entry.timestamp && typeof entry.timestamp.toDate === 'function'
                ? entry.timestamp.toDate().getTime()
                : entry.timestamp
                ? new Date(entry.timestamp).getTime()
                : nowMs;
            return { ms: Number.isFinite(ms) ? ms : nowMs, price: Number(entry.price) || 0 };
          })
          .filter((pt) => pt.price > 0)
          .sort((a, b) => a.ms - b.ms);

        // Anchor initial recorded timestamp from product.created_at when history log has <= 1 entry
        if (recordedSeries.length === 0) {
          const createdMs = product.created_at ? new Date(product.created_at).getTime() : nowMs - 7 * dayMs;
          const safeCreatedMs = Number.isFinite(createdMs) && createdMs < nowMs ? createdMs : nowMs - 7 * dayMs;
          if (buyBoxPrice && Math.abs(buyBoxPrice - currentPrice) > 0.5) {
            recordedSeries.push({ ms: safeCreatedMs, price: buyBoxPrice });
          }
          recordedSeries.push({ ms: nowMs, price: currentPrice });
        } else {
          const lastRecorded = recordedSeries[recordedSeries.length - 1];
          if (Math.abs(lastRecorded.price - currentPrice) > 0.01) {
            recordedSeries.push({ ms: nowMs, price: currentPrice });
          }
        }

        const priceValues = recordedSeries.map((pt) => pt.price);
        const historicalAvg = Math.round(priceValues.reduce((s, v) => s + v, 0) / priceValues.length);
        const historicalMin = Math.min(...priceValues);
        const historicalMax = Math.max(...priceValues);
        const volatilityPercent =
          historicalAvg > 0
            ? Math.round(((historicalMax - historicalMin) / historicalAvg) * 1000) / 10
            : 0;

        // Regression slope per recorded step
        const slopePerStep = linearRegression(priceValues);
        const horizonSteps = horizonDays === 7 ? 1 : horizonDays === 14 ? 2 : 4;

        // Factor in market pressure from competitor_price or buybox_price if recorded
        let marketPressureDelta = 0;
        const benchmarkPrice = competitorPrice ?? buyBoxPrice;
        if (benchmarkPrice && benchmarkPrice > 0) {
          const gap = benchmarkPrice - currentPrice;
          // Partial mean-reversion toward market benchmark
          marketPressureDelta = gap * 0.25 * (horizonSteps / 2);
        }

        const rawProjection = currentPrice + slopePerStep * horizonSteps + marketPressureDelta;
        const minBound = currentPrice * 0.78;
        const maxBound = currentPrice * 1.25;
        const forecastPrice = Math.max(1, Math.round(Math.min(maxBound, Math.max(minBound, rawProjection))));

        const deltaEGP = Math.round(forecastPrice - currentPrice);
        const deltaPercent = currentPrice > 0 ? Math.round((deltaEGP / currentPrice) * 1000) / 10 : 0;

        let direction: TrendDirection = 'stable';
        if (deltaPercent >= 1.2) direction = 'up';
        else if (deltaPercent <= -1.2) direction = 'down';

        // Confidence rises with number of real historical points and presence of competitor benchmark
        const baseConfidence = 52 + Math.min(34, rawEntries.length * 6) + (benchmarkPrice ? 10 : 0);
        const confidencePercent = Math.min(96, Math.max(48, baseConfidence - Math.round(volatilityPercent * 0.4)));

        let recommendation = 'السعر متوازن مع السوق — حافظ على السعر الحالي وراقب المخزون.';
        if (direction === 'up') {
          recommendation = `فرصة لرفع السعر تدريجياً بمقدار +${Math.abs(deltaEGP).toLocaleString()} ${currency} لتعظيم هامش الربح.`;
        } else if (direction === 'down') {
          recommendation = `ضغط سعري متوقع — يُنصح بتحسين التكلفة أو تعديل السعر بنحو -${Math.abs(deltaEGP).toLocaleString()} ${currency} للحفاظ على المبيعات.`;
        } else if (Number(product.stock) <= 5) {
          recommendation = 'المخزون منخفض والسعر مستقر — تجنّب الخصومات الحادة قبل إعادة التوريد.';
        }

        // Build unified Historical + Forecast Chart Series
        const chartSeries: HistoricalPoint[] = recordedSeries.map((pt, idx) => ({
          label: idx === recordedSeries.length - 1 ? 'الآن' : formatShortDate(pt.ms),
          dateStr: new Date(pt.ms).toISOString().slice(0, 10),
          isForecast: false,
          timestampMs: pt.ms,
          actualPrice: Math.round(pt.price),
          forecastPrice: idx === recordedSeries.length - 1 ? Math.round(pt.price) : null,
          competitorPrice: competitorPrice ? Math.round(competitorPrice) : null,
        }));

        // Append intermediate + target next-period forecast points
        const midHorizonDays = Math.max(1, Math.round(horizonDays / 2));
        const midPrice = Math.round(currentPrice + deltaEGP * 0.55);
        const midTimestampMs = nowMs + midHorizonDays * dayMs;
        chartSeries.push({
          label: `+${midHorizonDays} يوم`,
          dateStr: new Date(midTimestampMs).toISOString().slice(0, 10),
          isForecast: true,
          timestampMs: midTimestampMs,
          actualPrice: null,
          forecastPrice: midPrice,
          competitorPrice: competitorPrice ? Math.round(competitorPrice) : null,
        });
        const endTimestampMs = nowMs + horizonDays * dayMs;
        chartSeries.push({
          label: `+${horizonDays} يوم (متوقع)`,
          dateStr: new Date(endTimestampMs).toISOString().slice(0, 10),
          isForecast: true,
          timestampMs: endTimestampMs,
          actualPrice: null,
          forecastPrice,
          competitorPrice: competitorPrice ? Math.round(competitorPrice) : null,
        });

        return {
          product,
          currentPrice,
          historicalAvg,
          historicalMin,
          historicalMax,
          pointsCount: recordedSeries.length,
          forecastPrice,
          deltaEGP,
          deltaPercent,
          direction,
          confidencePercent,
          volatilityPercent,
          recommendation,
          series: chartSeries,
        };
      });
  }, [products, historyByProduct, platformFilter, horizonDays, currency]);

  const activeForecast = useMemo(() => {
    if (forecasts.length === 0) return null;
    return forecasts.find((f) => f.product.id === selectedProductId) || forecasts[0];
  }, [forecasts, selectedProductId]);

  const summary = useMemo(() => {
    const total = forecasts.length;
    const upCount = forecasts.filter((f) => f.direction === 'up').length;
    const downCount = forecasts.filter((f) => f.direction === 'down').length;
    const stableCount = forecasts.filter((f) => f.direction === 'stable').length;
    const avgExpectedDelta =
      total > 0
        ? Math.round((forecasts.reduce((s, f) => s + f.deltaPercent, 0) / total) * 10) / 10
        : 0;
    const totalRecordedPoints = forecasts.reduce((s, f) => s + f.pointsCount, 0);

    return { total, upCount, downCount, stableCount, avgExpectedDelta, totalRecordedPoints };
  }, [forecasts]);

  return (
    <section
      id="market-trends-analysis-section"
      className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl font-['Cairo',sans-serif]"
      dir="rtl"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              تحليل اتجاهات السوق وتوقعات الأسعار للمرحلة القادمة
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
              {summary.total} منتج مُحلّل
            </span>
          </div>
          <p className="text-xs text-slate-400">
            توقعات أسعار الفترة القادمة محسوبة من بيانات المنتجات الحالية وسجل الأسعار التاريخي المسجل ({summary.totalRecordedPoints} نقطة رصد).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Horizon Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400 mx-1.5" />
            {([7, 14, 30] as ForecastHorizon[]).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setHorizonDays(days)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  horizonDays === days
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} يوم
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          {availablePlatforms.length > 0 && (
            <select
              aria-label="تصفية اتجاهات السوق حسب المنصة"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">جميع المنصات ({products.length})</option>
              {availablePlatforms.map((plat) => (
                <option key={plat} value={plat}>
                  {plat.toUpperCase()}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={loadMarketData}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>تحديث التحليل</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <EmergencyErrorBanner message="تعذر جلب بيانات المنتجات الحالية لتحليل اتجاهات السوق — لا توجد بيانات." />
      )}

      {/* Empty State when no products recorded yet */}
      {forecasts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/70 border border-dashed border-slate-800 text-center space-y-4">
          <Package className="w-10 h-10 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-black text-white">
              لا توجد منتجات مسجلة لتحليل اتجاهات السوق
            </h4>
            <p className="text-xs text-slate-400">
              أضف منتجات التاجر أو اسحبها من المتجر ليقوم النظام بتحليل تاريخ الأسعار وتوقع اتجاه المرحلة القادمة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <span>الانتقال إلى المنتجات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>اتجاه سعري صاعد</span>
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {summary.upCount} <span className="text-xs text-slate-400 font-bold">منتج</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>اتجاه سعري هابط</span>
              </span>
              <div className="text-2xl font-black text-rose-400 font-mono">
                {summary.downCount} <span className="text-xs text-slate-400 font-bold">منتج</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Minus className="w-3.5 h-3.5 text-sky-400" />
                <span>استقرار سعري</span>
              </span>
              <div className="text-2xl font-black text-sky-300 font-mono">
                {summary.stableCount} <span className="text-xs text-slate-400 font-bold">منتج</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>متوسط التغير المتوقع ({horizonDays} يوم)</span>
              </span>
              <div
                className={`text-2xl font-black font-mono ${
                  summary.avgExpectedDelta > 0
                    ? 'text-emerald-400'
                    : summary.avgExpectedDelta < 0
                    ? 'text-rose-400'
                    : 'text-amber-300'
                }`}
              >
                {summary.avgExpectedDelta > 0 ? `+${summary.avgExpectedDelta}` : summary.avgExpectedDelta}%
              </div>
            </div>
          </div>

          {/* Interactive Selected Product Forecast Chart + Recommendation */}
          {activeForecast && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>مسار السعر التاريخي والتوقع المستقبلي ({horizonDays} يوم)</span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-0.5 truncate max-w-lg" title={activeForecast.product.title}>
                      {activeForecast.product.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 self-start">
                    SKU: {activeForecast.product.sku}
                  </span>
                </div>

                <div className="h-64 w-full flex flex-col justify-end p-4 bg-slate-950/80 rounded-2xl border border-slate-800" dir="ltr">
                  <div className="flex items-end justify-between gap-1 h-44">
                    {activeForecast.series.map((pt, idx) => {
                      const maxP = Math.max(...activeForecast.series.map(s => Math.max(s.actualPrice || 0, s.forecastPrice || 0, s.competitorPrice || 0)));
                      const val = pt.actualPrice || pt.forecastPrice || 0;
                      const heightPct = Math.max(15, Math.round((val / (maxP || 1)) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer">
                          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                            <div className="bg-slate-900 border border-slate-700 text-white text-[10px] rounded-lg px-2 py-1 shadow-xl whitespace-nowrap font-mono">
                              <div>{pt.dateStr}</div>
                              <div className="text-amber-400 font-bold">{val} {currency}</div>
                            </div>
                            <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 -mt-1" />
                          </div>
                          <div
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                              pt.isForecast ? 'bg-amber-500 group-hover:bg-amber-400' : 'bg-sky-500 group-hover:bg-sky-400'
                            }`}
                            style={{ height: `${Math.min(100, heightPct)}%` }}
                          />
                          <span className="text-[9px] text-slate-500 font-mono mt-1 truncate">
                            {idx % 4 === 0 ? pt.dateStr.slice(5) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span className="text-sky-400">■ السعر الفعلي</span>
                    <span className="text-amber-400">■ السعر المتوقع</span>
                  </div>
                </div>
              </div>

              {/* Selected Product Metrics & Strategic Guidance */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">السعر الحالي</span>
                    <span className="font-mono font-black text-white text-sm">
                      {activeForecast.currentPrice.toLocaleString()} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">السعر المتوقع (+{horizonDays} يوم)</span>
                    <span className="font-mono font-black text-amber-400 text-base">
                      {activeForecast.forecastPrice.toLocaleString()} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">متوسط السجل التاريخي</span>
                    <span className="font-mono font-bold text-sky-300">
                      {activeForecast.historicalAvg.toLocaleString()} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">نطاق التذبذب التاريخي</span>
                    <span className="font-mono font-bold text-slate-300">
                      {activeForecast.historicalMin.toLocaleString()} - {activeForecast.historicalMax.toLocaleString()} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">دقة وثقة التوقع</span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-black">
                      {activeForecast.confidencePercent}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-100 leading-relaxed space-y-1">
                  <div className="font-black text-amber-300">التوصية التسعيرية:</div>
                  <p className="font-bold">{activeForecast.recommendation}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onShowToast?.(`تم اختيار المنتج "${activeForecast.product.title}" — السعر المتوقع: ${activeForecast.forecastPrice} ${currency}`);
                    navigate(`/products?trader_id=${encodeURIComponent(activeForecast.product.trader_id || '')}`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>عرض المنتج في الكتالوج</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Product Forecast Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-black">
                <tr>
                  <th className="p-3.5">المنتج (SKU)</th>
                  <th className="p-3.5">المنصة</th>
                  <th className="p-3.5">السعر الحالي</th>
                  <th className="p-3.5">المتوسط التاريخي</th>
                  <th className="p-3.5">التوقع القادم ({horizonDays} يوم)</th>
                  <th className="p-3.5">الاتجاه</th>
                  <th className="p-3.5">الثقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {forecasts.slice(0, 12).map((item) => {
                  const isSelected = activeForecast?.product.id === item.product.id;
                  return (
                    <tr
                      key={item.product.id}
                      onClick={() => setSelectedProductId(item.product.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-900/80'
                      }`}
                    >
                      <td className="p-3.5 max-w-[240px]">
                        <div className="font-black text-white truncate" title={item.product.title}>
                          {item.product.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {item.product.sku} • {item.pointsCount} نقطة
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                          {item.product.platform || 'عام'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        {item.currentPrice.toLocaleString()} {currency}
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {item.historicalAvg.toLocaleString()} {currency}
                      </td>
                      <td className="p-3.5 font-mono font-black text-amber-400">
                        {item.forecastPrice.toLocaleString()} {currency}
                      </td>
                      <td className="p-3.5">
                        {item.direction === 'up' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{item.deltaPercent}%</span>
                          </span>
                        ) : item.direction === 'down' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono font-bold">
                            <TrendingDown className="w-3 h-3" />
                            <span>{item.deltaPercent}%</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono font-bold">
                            <Minus className="w-3 h-3" />
                            <span>مستقر</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-300">
                        {item.confidencePercent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

export default MarketTrendsAnalysis;
