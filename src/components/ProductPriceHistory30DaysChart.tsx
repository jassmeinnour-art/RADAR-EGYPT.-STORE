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
  title: string;
  currentPrice: number;
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
  title,
  currentPrice,
  platform,
  currency = 'ج.م',
  priceHistory = [],
  wholesaleCost = 0,
}) => {
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

    let lastKnownPrice = basePrice || safeCurrent || 100;
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
    const minPrice = prices.length > 0 ? Math.min(...prices) : safeCurrent;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : safeCurrent;
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : safeCurrent;

    return {
      points,
      minPrice,
      maxPrice,
      avgPrice,
      netChangePercent,
      recordedCount: filtered.length,
    };
  }, [traderId, productId, sku, currentPrice, priceHistory]);

  const priceRangeSpan = Math.max(1, chartStats.maxPrice - chartStats.minPrice);

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
              تطور الأسعار التاريخي (آخر 30 يوماً - بدون Recharts) 📈
            </h4>
            <p className="text-[11px] text-slate-400">
              تحليل حركة سعر "{title}" ومقارنة التغيرات الزمنية بدقة
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

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">أدنى سعر (30 يوم)</span>
          <span className="text-sm font-mono font-black text-emerald-400">{chartStats.minPrice} {currency}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">أعلى سعر (30 يوم)</span>
          <span className="text-sm font-mono font-black text-amber-400">{chartStats.maxPrice} {currency}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">متوسط السعر</span>
          <span className="text-sm font-mono font-black text-sky-400">{chartStats.avgPrice} {currency}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">نقاط الرصد المسجلة</span>
          <span className="text-sm font-mono font-black text-indigo-400">{chartStats.recordedCount} نقطة</span>
        </div>
      </div>

      {/* Pure HTML + Tailwind CSS Vertical Bars for 30-Day Price Trend */}
      <div className="pt-3 pb-1">
        <div className="flex items-end justify-between gap-1 h-36 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 overflow-x-auto" dir="ltr">
          {chartStats.points.map((pt, idx) => {
            const heightPercent = Math.max(15, Math.round(((pt.price - chartStats.minPrice + priceRangeSpan * 0.1) / (priceRangeSpan * 1.2)) * 100));
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
                    <div className="text-amber-400 font-bold">{pt.price} {currency}</div>
                  </div>
                  <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 -mt-1" />
                </div>

                {/* Vertical Bar */}
                <div
                  className={`w-full rounded-t-sm transition-all duration-200 ${
                    pt.isRecordedSnapshot
                      ? 'bg-amber-500 group-hover:bg-amber-400 shadow-sm shadow-amber-500/30'
                      : 'bg-sky-600/70 group-hover:bg-sky-500'
                  }`}
                  style={{ height: `${Math.min(100, heightPercent)}%` }}
                />

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
          <span className="text-amber-400 font-bold">حركة السعر التاريخية (30 عمود نقي بدون مكتبات)</span>
          <span>اليوم</span>
        </div>
      </div>
    </div>
  );
};

export default ProductPriceHistory30DaysChart;
