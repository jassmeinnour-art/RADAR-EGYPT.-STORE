import React, { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus, Calendar, ShieldCheck } from 'lucide-react';
import {
  buildProductHistoryKey,
  getProductPriceHistoryMap,
} from '../utils/smartPriceAlerts';

export interface PriceChartSourcePoint {
  date: string;
  price: number;
  merchant?: string;
}

export interface ProductPriceHistory30DaysChartProps {
  traderId?: string;
  productId?: string;
  sku?: string;
  asin?: string;
  title: string;
  currentPrice: number;
  competitorPrice?: number | null;
  buyBoxPrice?: number | null;
  competitorsCount?: number | null;
  platform?: string;
  currency?: string;
  priceHistory?: PriceChartSourcePoint[];
  wholesaleCost?: number;
}

export interface ThirtyDayPricePoint {
  isoDate: string;
  dateLabel: string;
  price: number;
  average30d: number;
  isRecordedSnapshot: boolean;
  sourceLabel?: string;
}

export const ProductPriceHistory30DaysChart: React.FC<ProductPriceHistory30DaysChartProps> = ({
  traderId,
  productId,
  sku,
  asin,
  title,
  currentPrice,
  competitorPrice,
  buyBoxPrice,
  competitorsCount,
  platform,
  currency = 'ج.م',
  priceHistory = [],
  wholesaleCost = 0,
}) => {
  const validCompetitorPrice =
    typeof competitorPrice === 'number' && Number.isFinite(competitorPrice) && competitorPrice > 0
      ? competitorPrice
      : null;
  const validBuyBoxPrice =
    typeof buyBoxPrice === 'number' && Number.isFinite(buyBoxPrice) && buyBoxPrice > 0
      ? buyBoxPrice
      : null;
  const effectiveLowestCompetitor = validCompetitorPrice ?? validBuyBoxPrice;

  const chartStats = useMemo(() => {
    const nowMs = Date.now();
    const safeCurrent = Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : 0;

    const rawSnapshots: Array<{ dayKey: string; ts: number; price: number; source?: string }> = [];

    if (traderId && (sku || productId)) {
      try {
        const map = getProductPriceHistoryMap();
        const key = buildProductHistoryKey(traderId, sku, productId);
        const record = map[key];
        if (record && Array.isArray(record.history)) {
          for (const h of record.history) {
            const ms = Date.parse(h.recordedAt);
            if (Number.isFinite(ms) && h.price > 0) {
              rawSnapshots.push({
                dayKey: new Date(ms).toISOString().slice(0, 10),
                ts: ms,
                price: h.price,
                source: 'سجل السحب التلقائي',
              });
            }
          }
        }
      } catch {}
    }

    if (Array.isArray(priceHistory)) {
      for (const h of priceHistory) {
        const cleanedDate = String(h.date || '').split(' ')[0].trim();
        const ms = Date.parse(cleanedDate);
        if (Number.isFinite(ms) && h.price > 0) {
          rawSnapshots.push({
            dayKey: new Date(ms).toISOString().slice(0, 10),
            ts: ms,
            price: h.price,
            source: h.merchant || 'مرصود بالرادار',
          });
        }
      }
    }

    const thirtyDaysAgo = nowMs - 30 * 24 * 60 * 60 * 1000;
    const filtered = rawSnapshots.filter((s) => s.ts >= thirtyDaysAgo);
    filtered.sort((a, b) => a.ts - b.ts);

    const latestPrice = filtered.length > 0 ? filtered[filtered.length - 1].price : safeCurrent;
    const basePrice = filtered.length > 0 ? filtered[0].price : safeCurrent;
    const netChangePercent = basePrice > 0 ? Math.round(((latestPrice - basePrice) / basePrice) * 100) : 0;

    const points: ThirtyDayPricePoint[] = [];
    const dayMap = new Map<string, { price: number; source?: string }>();
    filtered.forEach((s) => dayMap.set(s.dayKey, { price: s.price, source: s.source }));

    let lastKnownPrice = basePrice || safeCurrent || 0;
    for (let i = 29; i >= 0; i--) {
      const dayMs = nowMs - i * 24 * 60 * 60 * 1000;
      const isoDate = new Date(dayMs).toISOString().slice(0, 10);
      const [, m, d] = isoDate.split('-');
      const dateLabel = `${d}/${m}`;

      const found = dayMap.get(isoDate);
      const price = found ? found.price : lastKnownPrice;
      if (found) lastKnownPrice = found.price;

      points.push({
        isoDate,
        dateLabel,
        price,
        average30d: price,
        isRecordedSnapshot: Boolean(found),
        sourceLabel: found?.source,
      });
    }

    const prices = points.map((p) => p.price);
    if (effectiveLowestCompetitor) prices.push(effectiveLowestCompetitor);
    if (validBuyBoxPrice) prices.push(validBuyBoxPrice);
    const minPrice = prices.length > 0 ? Math.min(...prices) : safeCurrent;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : safeCurrent;
    const myPrices = points.map((p) => p.price);
    const avgPrice = myPrices.length > 0 ? Math.round(myPrices.reduce((a, b) => a + b, 0) / myPrices.length) : safeCurrent;

    return {
      points,
      minPrice,
      maxPrice,
      avgPrice,
      netChangePercent,
      recordedCount: filtered.length,
    };
  }, [traderId, productId, sku, currentPrice, priceHistory, effectiveLowestCompetitor, validBuyBoxPrice]);

  const priceRangeSpan = Math.max(1, chartStats.maxPrice - chartStats.minPrice);
  const safeCurrentPrice = Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : 0;
  const priceDiff =
    safeCurrentPrice > 0 && effectiveLowestCompetitor
      ? Math.round((safeCurrentPrice - effectiveLowestCompetitor) * 100) / 100
      : null;

  const competitorBarHeight = effectiveLowestCompetitor
    ? Math.min(
        100,
        Math.max(
          15,
          Math.round(
            ((effectiveLowestCompetitor - chartStats.minPrice + priceRangeSpan * 0.1) /
              (priceRangeSpan * 1.2)) *
              100
          )
        )
      )
    : null;

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 font-['Cairo'] text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">
              تحليل السعر ومقارنة المنافسين (آخر 30 يوماً)
            </h4>
            <p className="text-[11px] text-slate-400">
              مقارنة سعرك مع سعر المنافسين و Buy Box للمنتج "{title}"
              {asin ? ` (ASIN: ${asin})` : ''}
            </p>
          </div>
        </div>

        {/* Change Badge */}
        <div className="flex items-center gap-2">
          {chartStats.netChangePercent > 0 ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>+{chartStats.netChangePercent}% ارتفاع</span>
            </span>
          ) : chartStats.netChangePercent < 0 ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>{chartStats.netChangePercent}% انخفاض</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
              <Minus className="w-4 h-4" />
              <span>مستقر</span>
            </span>
          )}
        </div>
      </div>

      {/* Competitor Comparison Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">سعرك الحالي</span>
          <span className="text-sm font-mono font-black text-white">
            {safeCurrentPrice.toLocaleString()} {currency}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">سعر المنافس الأقل</span>
          <span className="text-sm font-mono font-black text-sky-400">
            {effectiveLowestCompetitor ? `${effectiveLowestCompetitor.toLocaleString()} ${currency}` : '-'}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">سعر Buy Box</span>
          <span className="text-sm font-mono font-black text-amber-400">
            {validBuyBoxPrice ? `${validBuyBoxPrice.toLocaleString()} ${currency}` : '-'}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">الفرق مع المنافس</span>
          {priceDiff !== null ? (
            priceDiff > 0 ? (
              <span className="text-xs font-black text-rose-400">
                أغلى بـ {priceDiff.toLocaleString()} {currency}
              </span>
            ) : priceDiff < 0 ? (
              <span className="text-xs font-black text-emerald-400">
                أرخص بـ {Math.abs(priceDiff).toLocaleString()} {currency}
              </span>
            ) : (
              <span className="text-xs font-black text-sky-400">مطابق لأقل منافس</span>
            )
          ) : (
            <span className="text-sm font-mono font-black text-slate-500">-</span>
          )}
        </div>
      </div>

      {/* Historical Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">أدنى سعر (30 يوم)</span>
          <span className="text-sm font-mono font-black text-emerald-400">{chartStats.minPrice.toLocaleString()} {currency}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">أعلى سعر (30 يوم)</span>
          <span className="text-sm font-mono font-black text-amber-400">{chartStats.maxPrice.toLocaleString()} {currency}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">متوسط سعرك</span>
          <span className="text-sm font-mono font-black text-sky-400">{chartStats.avgPrice.toLocaleString()} {currency}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">عدد المنافسين / نقاط الرصد</span>
          <span className="text-sm font-mono font-black text-indigo-400">
            {typeof competitorsCount === 'number' && competitorsCount > 0
              ? `${competitorsCount} منافس`
              : `${chartStats.recordedCount} نقطة`}
          </span>
        </div>
      </div>

      {/* Dual Comparison Bar Chart (Your Price vs Competitor Price) */}
      <div className="pt-3 pb-1">
        <div className="relative flex items-end justify-between gap-1 h-40 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 overflow-x-auto" dir="ltr">
          {competitorBarHeight !== null && (
            <div
              className="absolute left-3 right-3 border-t-2 border-dashed border-emerald-400/70 pointer-events-none z-10"
              style={{ bottom: `calc(${competitorBarHeight}% * 0.72 + 24px)` }}
              title={`سعر المنافس الأقل: ${effectiveLowestCompetitor} ${currency}`}
            >
              <span className="inline-block -translate-y-4 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                منافس: {effectiveLowestCompetitor} {currency}
              </span>
            </div>
          )}

          {chartStats.points.map((pt, idx) => {
            const heightPercent = Math.max(
              15,
              Math.round(((pt.price - chartStats.minPrice + priceRangeSpan * 0.1) / (priceRangeSpan * 1.2)) * 100)
            );
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                title={`${pt.isoDate}: ${pt.price} ${currency}`}
              >
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-slate-900 border border-slate-700 text-white text-[10px] rounded-lg px-2 py-1 shadow-xl whitespace-nowrap font-mono">
                    <div>{pt.isoDate}</div>
                    <div className="text-amber-400 font-bold">سعرك: {pt.price} {currency}</div>
                    {effectiveLowestCompetitor && (
                      <div className="text-emerald-400 font-bold">
                        أقل منافس: {effectiveLowestCompetitor} {currency}
                      </div>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 -mt-1" />
                </div>

                {/* Vertical Bars (Your price + competitor reference bar if present) */}
                <div className="w-full h-full flex items-end justify-center gap-0.5">
                  <div
                    className={`flex-1 rounded-t-sm transition-all duration-200 ${
                      pt.isRecordedSnapshot
                        ? 'bg-amber-500 group-hover:bg-amber-400 shadow-sm shadow-amber-500/30'
                        : 'bg-sky-600/75 group-hover:bg-sky-500'
                    }`}
                    style={{ height: `${Math.min(100, heightPercent)}%` }}
                  />
                  {competitorBarHeight !== null && (
                    <div
                      className="w-1 bg-emerald-500/65 rounded-t-sm"
                      style={{ height: `${competitorBarHeight}%` }}
                    />
                  )}
                </div>

                {/* Date Label */}
                <span className="text-[9px] text-slate-500 font-mono mt-1 transform -rotate-45 sm:rotate-0 truncate">
                  {idx % 5 === 0 ? pt.dateLabel : ''}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 mt-2 font-mono">
          <span>قبل 30 يوم</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sky-400 font-bold">
              <span className="w-2 h-2 rounded-xs bg-sky-500 inline-block" />
              سعرك
            </span>
            {effectiveLowestCompetitor && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
                سعر المنافس الأقل
              </span>
            )}
          </div>
          <span>اليوم</span>
        </div>
      </div>
    </div>
  );
};

export default ProductPriceHistory30DaysChart;
