import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Calendar, LineChart as LineChartIcon } from 'lucide-react';
import type { MonthlyPriceTrendPoint } from './PriceComparisonEngine';

export type PricingPatternType = 'uptrend' | 'downtrend' | 'cyclic' | 'stable';

export interface AnalyzedPricingPattern {
  minPoint: MonthlyPriceTrendPoint | null;
  maxPoint: MonthlyPriceTrendPoint | null;
  avgPrice: number;
  latestMovingAvg7: number;
  volatilityPercent: number;
  netChangePercent: number;
  patternType: PricingPatternType;
  patternLabel: string;
  cheapestWeekday: string;
  insight: string;
  movingAvgSeries: Array<{ dateKey: string; ma7: number }>;
}

const ARABIC_WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export function analyze30DayPricingPatterns(
  points: MonthlyPriceTrendPoint[],
  currency = 'ج.م'
): AnalyzedPricingPattern {
  if (!Array.isArray(points) || points.length === 0) {
    return {
      minPoint: null,
      maxPoint: null,
      avgPrice: 0,
      latestMovingAvg7: 0,
      volatilityPercent: 0,
      netChangePercent: 0,
      patternType: 'stable',
      patternLabel: 'بيانات غير كافية',
      cheapestWeekday: '-',
      insight: 'اختر منتجاً لعرض تحليل الأنماط السعرية خلال آخر 30 يوماً.',
      movingAvgSeries: [],
    };
  }

  let minPoint = points[0];
  let maxPoint = points[0];
  const prices = points.map((p) => p.merchantPrice);

  for (const pt of points) {
    if (pt.merchantPrice < minPoint.merchantPrice) minPoint = pt;
    if (pt.merchantPrice > maxPoint.merchantPrice) maxPoint = pt;
  }

  const avgPrice = Math.round(d3.mean(prices) ?? prices[0]);
  const stdDev = d3.deviation(prices) ?? 0;
  const volatilityPercent = avgPrice > 0 ? Number(((stdDev / avgPrice) * 100).toFixed(1)) : 0;

  const firstPrice = points[0].merchantPrice;
  const lastPrice = points[points.length - 1].merchantPrice;
  const netChangePercent =
    firstPrice > 0 ? Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1)) : 0;

  const movingAvgSeries = points.map((pt, idx) => {
    const start = Math.max(0, idx - 6);
    const slice = prices.slice(start, idx + 1);
    const ma7 = Math.round(d3.mean(slice) ?? pt.merchantPrice);
    return { dateKey: pt.dateKey, ma7 };
  });

  const latestMovingAvg7 =
    movingAvgSeries.length > 0 ? movingAvgSeries[movingAvgSeries.length - 1].ma7 : lastPrice;

  // Identify cheapest weekday across the 30-day window
  const weekdayTotals = new Map<number, { sum: number; count: number }>();
  for (const pt of points) {
    const parsed = new Date(`${pt.dateKey}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      const dayIdx = parsed.getDay();
      const prev = weekdayTotals.get(dayIdx) || { sum: 0, count: 0 };
      weekdayTotals.set(dayIdx, { sum: prev.sum + pt.merchantPrice, count: prev.count + 1 });
    }
  }
  let cheapestDayIdx = -1;
  let cheapestDayAvg = Infinity;
  weekdayTotals.forEach((stats, dayIdx) => {
    const dayAvg = stats.sum / stats.count;
    if (dayAvg < cheapestDayAvg) {
      cheapestDayAvg = dayAvg;
      cheapestDayIdx = dayIdx;
    }
  });
  const cheapestWeekday = cheapestDayIdx >= 0 ? ARABIC_WEEKDAYS[cheapestDayIdx] : '-';

  let patternType: PricingPatternType = 'stable';
  let patternLabel = 'استقرار سعري';

  if (volatilityPercent >= 3.2 && Math.abs(netChangePercent) < 3.5) {
    patternType = 'cyclic';
    patternLabel = 'تذبذب دوري';
  } else if (netChangePercent >= 2.5) {
    patternType = 'uptrend';
    patternLabel = 'اتجاه صاعد';
  } else if (netChangePercent <= -2.5) {
    patternType = 'downtrend';
    patternLabel = 'اتجاه هابط';
  }

  const spread = maxPoint.merchantPrice - minPoint.merchantPrice;
  const vsMaText =
    lastPrice > latestMovingAvg7
      ? `أعلى من متوسط 7 أيام (${latestMovingAvg7.toLocaleString()} ${currency})`
      : lastPrice < latestMovingAvg7
      ? `أدنى من متوسط 7 أيام (${latestMovingAvg7.toLocaleString()} ${currency})`
      : `مطابق لمتوسط 7 أيام (${latestMovingAvg7.toLocaleString()} ${currency})`;

  const insight = `مدى التذبذب ${spread.toLocaleString()} ${currency} (${minPoint.dateLabel} أدنى سعر، ${maxPoint.dateLabel} أعلى قمة) · السعر الحالي ${vsMaText}${
    cheapestWeekday !== '-' ? ` · أنسب يوم سعر تاريخياً: ${cheapestWeekday}` : ''
  }.`;

  return {
    minPoint,
    maxPoint,
    avgPrice,
    latestMovingAvg7,
    volatilityPercent,
    netChangePercent,
    patternType,
    patternLabel,
    cheapestWeekday,
    insight,
    movingAvgSeries,
  };
}

interface D3PriceTrendChartProps {
  data: MonthlyPriceTrendPoint[];
  productTitle: string;
  sku: string;
  costPrice: number;
  currency?: string;
  competitorName?: string;
}

interface HoveredPointState {
  point: MonthlyPriceTrendPoint;
  ma7: number;
  xPx: number;
  yPx: number;
}

export const D3PriceTrendChart: React.FC<D3PriceTrendChartProps> = ({
  data,
  productTitle,
  sku,
  costPrice,
  currency = 'ج.م',
  competitorName = 'أرخص منافس',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(760);
  const [showMovingAvg, setShowMovingAvg] = useState<boolean>(true);
  const [showCompetitor, setShowCompetitor] = useState<boolean>(true);
  const [showSpreadBand, setShowSpreadBand] = useState<boolean>(true);
  const [hovered, setHovered] = useState<HoveredPointState | null>(null);

  const series30 = useMemo(() => data.slice(-30), [data]);
  const analytics = useMemo(
    () => analyze30DayPricingPatterns(series30, currency),
    [series30, currency]
  );

  // Responsive container measurement
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const measured = el.clientWidth;
      if (measured && measured > 260) {
        setChartWidth(measured);
      }
    };

    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(el);
      return () => observer.disconnect();
    }
    return undefined;
  }, []);

  // D3 rendering pipeline
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (series30.length === 0) return;

    const width = Math.max(320, chartWidth);
    const height = 270;
    const margin = { top: 22, right: 20, bottom: 32, left: 56 };
    const innerWidth = Math.max(180, width - margin.left - margin.right);
    const innerHeight = Math.max(120, height - margin.top - margin.bottom);

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

    const defs = svg.append('defs');
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'd3-merchant-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.28);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.02);

    const root = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const parsedDates = series30.map((pt, idx) => {
      const d = new Date(`${pt.dateKey}T12:00:00`);
      return Number.isNaN(d.getTime()) ? new Date(Date.now() + idx * 86400000) : d;
    });

    const xExtent = d3.extent(parsedDates) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    const yValues: number[] = [];
    series30.forEach((pt, idx) => {
      yValues.push(pt.merchantPrice);
      if (showCompetitor) yValues.push(pt.competitorPrice);
      if (showMovingAvg && analytics.movingAvgSeries[idx]) {
        yValues.push(analytics.movingAvgSeries[idx].ma7);
      }
    });
    if (costPrice > 0) yValues.push(costPrice);

    const rawMin = d3.min(yValues) ?? 0;
    const rawMax = d3.max(yValues) ?? 100;
    const pad = Math.max(10, Math.round((rawMax - rawMin) * 0.14));
    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, rawMin - pad), rawMax + pad])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal grid lines
    const yTicks = yScale.ticks(5);
    root
      .append('g')
      .attr('class', 'd3-grid')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3 3');

    // Historical min/max envelope band to highlight 30-day support & resistance
    if (showSpreadBand && analytics.minPoint && analytics.maxPoint) {
      const bandTop = yScale(analytics.maxPoint.merchantPrice);
      const bandBottom = yScale(analytics.minPoint.merchantPrice);
      root
        .append('rect')
        .attr('class', 'd3-price-band')
        .attr('x', 0)
        .attr('y', bandTop)
        .attr('width', innerWidth)
        .attr('height', Math.max(0, bandBottom - bandTop))
        .attr('fill', '#334155')
        .attr('opacity', 0.16);
    }

    // Cost floor dashed reference line
    if (costPrice > 0 && costPrice >= yScale.domain()[0] && costPrice <= yScale.domain()[1]) {
      const yCost = yScale(costPrice);
      root
        .append('line')
        .attr('class', 'd3-cost-floor')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yCost)
        .attr('y2', yCost)
        .attr('stroke', '#64748b')
        .attr('stroke-width', 1.25)
        .attr('stroke-dasharray', '4 4');

      root
        .append('text')
        .attr('x', innerWidth - 4)
        .attr('y', Math.max(12, yCost - 5))
        .attr('text-anchor', 'end')
        .attr('fill', '#94a3b8')
        .attr('font-size', 10)
        .attr('font-family', 'monospace')
        .text(`حد التكلفة ${costPrice.toLocaleString()}`);
    }

    // Merchant area fill
    const merchantArea = d3
      .area<MonthlyPriceTrendPoint>()
      .x((_, i) => xScale(parsedDates[i]))
      .y0(innerHeight)
      .y1((d) => yScale(d.merchantPrice))
      .curve(d3.curveMonotoneX);

    root
      .append('path')
      .datum(series30)
      .attr('class', 'd3-merchant-area')
      .attr('fill', 'url(#d3-merchant-area-gradient)')
      .attr('d', merchantArea);

    // Competitor line
    if (showCompetitor) {
      const competitorLine = d3
        .line<MonthlyPriceTrendPoint>()
        .x((_, i) => xScale(parsedDates[i]))
        .y((d) => yScale(d.competitorPrice))
        .curve(d3.curveMonotoneX);

      root
        .append('path')
        .datum(series30)
        .attr('class', 'd3-competitor-line')
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('d', competitorLine);
    }

    // 7-day Moving Average line
    if (showMovingAvg && analytics.movingAvgSeries.length === series30.length) {
      const maLine = d3
        .line<{ dateKey: string; ma7: number }>()
        .x((_, i) => xScale(parsedDates[i]))
        .y((d) => yScale(d.ma7))
        .curve(d3.curveMonotoneX);

      root
        .append('path')
        .datum(analytics.movingAvgSeries)
        .attr('class', 'd3-ma7-line')
        .attr('fill', 'none')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4')
        .attr('d', maLine);
    }

    // Merchant primary 30-day price curve
    const merchantLine = d3
      .line<MonthlyPriceTrendPoint>()
      .x((_, i) => xScale(parsedDates[i]))
      .y((d) => yScale(d.merchantPrice))
      .curve(d3.curveMonotoneX);

    root
      .append('path')
      .datum(series30)
      .attr('class', 'd3-merchant-line')
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2.5)
      .attr('d', merchantLine);

    // Peak (30d max) & Trough (30d min) pattern markers
    if (analytics.maxPoint) {
      const maxIdx = series30.findIndex((p) => p.dateKey === analytics.maxPoint?.dateKey);
      if (maxIdx >= 0) {
        const cx = xScale(parsedDates[maxIdx]);
        const cy = yScale(analytics.maxPoint.merchantPrice);
        root
          .append('circle')
          .attr('class', 'd3-peak-marker')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 4.5)
          .attr('fill', '#fb7185')
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2);

        root
          .append('text')
          .attr('x', Math.min(innerWidth - 36, Math.max(36, cx)))
          .attr('y', Math.max(10, cy - 8))
          .attr('text-anchor', 'middle')
          .attr('fill', '#fda4af')
          .attr('font-size', 10)
          .attr('font-family', 'monospace')
          .text(`قمة ${analytics.maxPoint.merchantPrice.toLocaleString()}`);
      }
    }

    if (analytics.minPoint && analytics.minPoint.dateKey !== analytics.maxPoint?.dateKey) {
      const minIdx = series30.findIndex((p) => p.dateKey === analytics.minPoint?.dateKey);
      if (minIdx >= 0) {
        const cx = xScale(parsedDates[minIdx]);
        const cy = yScale(analytics.minPoint.merchantPrice);
        root
          .append('circle')
          .attr('class', 'd3-trough-marker')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 4.5)
          .attr('fill', '#34d399')
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2);

        root
          .append('text')
          .attr('x', Math.min(innerWidth - 36, Math.max(36, cx)))
          .attr('y', Math.min(innerHeight - 4, cy + 15))
          .attr('text-anchor', 'middle')
          .attr('fill', '#6ee7b7')
          .attr('font-size', 10)
          .attr('font-family', 'monospace')
          .text(`قاع ${analytics.minPoint.merchantPrice.toLocaleString()}`);
      }
    }

    // X and Y Axes
    const tickCount = Math.min(7, Math.max(4, Math.floor(innerWidth / 100)));
    const xAxis = d3
      .axisBottom<Date>(xScale)
      .ticks(tickCount)
      .tickFormat((d) => {
        const dt = d as Date;
        return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
      });

    const xAxisGroup = root
      .append('g')
      .attr('class', 'd3-x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    xAxisGroup.selectAll('path, line').attr('stroke', '#334155');
    xAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11).attr('font-family', 'monospace');

    const yAxis = d3
      .axisLeft<number>(yScale)
      .ticks(5)
      .tickFormat((d) => `${Number(d).toLocaleString()}`);

    const yAxisGroup = root.append('g').attr('class', 'd3-y-axis').call(yAxis);
    yAxisGroup.selectAll('path, line').attr('stroke', '#334155');
    yAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11).attr('font-family', 'monospace');

    // Interactive Crosshair Focus Group
    const focusGroup = root.append('g').attr('class', 'd3-focus-group').style('display', 'none');

    const focusLine = focusGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 3');

    const focusMerchantDot = focusGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#fbbf24')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2);

    const focusCompDot = focusGroup
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#34d399')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2);

    const bisectDate = d3.bisector<Date, Date>((d) => d).left;

    root
      .append('rect')
      .attr('class', 'd3-interaction-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove touchmove', (event: MouseEvent | TouchEvent) => {
        const [mx] = d3.pointer(event);
        const hoveredDate = xScale.invert(mx);
        const idx = bisectDate(parsedDates, hoveredDate, 1);
        const d0 = parsedDates[idx - 1];
        const d1 = parsedDates[idx];
        let targetIdx = idx - 1;
        if (d1 && d0) {
          targetIdx =
            hoveredDate.getTime() - d0.getTime() > d1.getTime() - hoveredDate.getTime()
              ? idx
              : idx - 1;
        }
        targetIdx = Math.max(0, Math.min(series30.length - 1, targetIdx));
        const pt = series30[targetIdx];
        const ma7 = analytics.movingAvgSeries[targetIdx]?.ma7 ?? pt.merchantPrice;
        const cx = xScale(parsedDates[targetIdx]);
        const cy = yScale(pt.merchantPrice);

        focusGroup.style('display', null);
        focusLine.attr('x1', cx).attr('x2', cx);
        focusMerchantDot.attr('cx', cx).attr('cy', cy);
        if (showCompetitor) {
          focusCompDot.style('display', null).attr('cx', cx).attr('cy', yScale(pt.competitorPrice));
        } else {
          focusCompDot.style('display', 'none');
        }

        setHovered({
          point: pt,
          ma7,
          xPx: margin.left + cx,
          yPx: margin.top + cy,
        });
      })
      .on('mouseleave touchend', () => {
        focusGroup.style('display', 'none');
        setHovered(null);
      });
  }, [series30, chartWidth, costPrice, showMovingAvg, showCompetitor, showSpreadBand, analytics]);

  return (
    <div
      className="p-5 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-4"
      role="region"
      aria-label="تحليل أنماط الأسعار التاريخية لآخر 30 يوماً (D3)"
      data-testid="d3-historical-trend-section"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-black text-base">
            <LineChartIcon className="w-5 h-5 text-sky-400 shrink-0" aria-hidden="true" />
            <h3>تحليل أنماط التسعير التاريخية — آخر 30 يوماً (D3)</h3>
          </div>
          <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
            <span className="text-slate-200 font-bold">{productTitle}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-amber-400 tabular-nums">SKU: {sku}</span>
            <span aria-hidden="true">·</span>
            <span
              data-testid="d3-pattern-classification"
              className={
                analytics.patternType === 'uptrend'
                  ? 'text-red-400 font-bold'
                  : analytics.patternType === 'downtrend'
                  ? 'text-emerald-400 font-bold'
                  : analytics.patternType === 'cyclic'
                  ? 'text-sky-400 font-bold'
                  : 'text-slate-300 font-bold'
              }
            >
              النمط المكتشف: {analytics.patternLabel}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            aria-pressed={showMovingAvg}
            onClick={() => setShowMovingAvg((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              showMovingAvg
                ? 'bg-sky-500/15 border-sky-500/50 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            متوسط متحرك 7 أيام
          </button>
          <button
            type="button"
            aria-pressed={showCompetitor}
            onClick={() => setShowCompetitor((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              showCompetitor
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            مسار المنافس
          </button>
          <button
            type="button"
            aria-pressed={showSpreadBand}
            onClick={() => setShowSpreadBand((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              showSpreadBand
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            نطاق القمة والقاع
          </button>
        </div>
      </div>

      {/* 30-Day Pattern Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">قاع 30 يوم (أدنى سعر)</span>
          <strong className="text-sm font-mono tabular-nums text-emerald-400 font-black">
            {analytics.minPoint ? analytics.minPoint.merchantPrice.toLocaleString() : 0} {currency}
          </strong>
          <span className="text-[11px] text-slate-500 font-mono block tabular-nums">
            {analytics.minPoint?.dateLabel || '-'}
          </span>
        </div>

        <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">قمة 30 يوم (أعلى سعر)</span>
          <strong className="text-sm font-mono tabular-nums text-rose-400 font-black">
            {analytics.maxPoint ? analytics.maxPoint.merchantPrice.toLocaleString() : 0} {currency}
          </strong>
          <span className="text-[11px] text-slate-500 font-mono block tabular-nums">
            {analytics.maxPoint?.dateLabel || '-'}
          </span>
        </div>

        <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">متوسط 30 يوم / 7 أيام</span>
          <strong className="text-sm font-mono tabular-nums text-white font-black">
            {analytics.avgPrice.toLocaleString()} / {analytics.latestMovingAvg7.toLocaleString()} {currency}
          </strong>
          <span className="text-[11px] text-slate-500 block">
            أنسب يوم: {analytics.cheapestWeekday}
          </span>
        </div>

        <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">مؤشر التذبذب السعري</span>
          <strong className="text-sm font-mono tabular-nums text-sky-400 font-black">
            ±{analytics.volatilityPercent}%
          </strong>
          <span className="text-[11px] text-slate-500 font-mono block tabular-nums">
            صافي 30 يوم: {analytics.netChangePercent > 0 ? `+${analytics.netChangePercent}%` : `${analytics.netChangePercent}%`}
          </span>
        </div>
      </div>

      {/* D3 SVG Canvas */}
      <div ref={containerRef} className="relative w-full" dir="ltr">
        <svg
          ref={svgRef}
          data-testid="d3-price-trend-svg"
          className="w-full h-[270px] overflow-visible select-none block"
          role="img"
          aria-label={`مخطط D3 التاريخي لأسعار ${productTitle} خلال آخر 30 يوماً`}
        />

        {hovered && (
          <div
            dir="rtl"
            data-testid="d3-hover-tooltip"
            className="pointer-events-none absolute top-2 z-20 rounded-xl bg-slate-950/95 border border-slate-700 p-3 shadow-xl text-xs space-y-1.5 min-w-[205px]"
            style={{
              left: hovered.xPx > chartWidth * 0.55 ? Math.max(8, hovered.xPx - 220) : Math.min(chartWidth - 215, hovered.xPx + 14),
            }}
          >
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>{hovered.point.fullDate}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-amber-300">سعرك:</span>
              <span className="font-mono tabular-nums font-black text-white">
                {hovered.point.merchantPrice.toLocaleString()} {currency}
              </span>
            </div>
            {showMovingAvg && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sky-300">متوسط 7 أيام:</span>
                <span className="font-mono tabular-nums font-bold text-sky-300">
                  {hovered.ma7.toLocaleString()} {currency}
                </span>
              </div>
            )}
            {showCompetitor && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-emerald-300">{competitorName}:</span>
                <span className="font-mono tabular-nums font-bold text-emerald-400">
                  {hovered.point.competitorPrice.toLocaleString()} {currency}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actionable Pattern Summary Line */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <p data-testid="d3-pattern-insight" className="leading-relaxed">
          {analytics.insight}
        </p>
        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <span className="inline-flex items-center gap-1.5 text-amber-300">
            <span className="w-3 h-0.5 bg-amber-400 inline-block" aria-hidden="true" />
            سعرك
          </span>
          <span className="inline-flex items-center gap-1.5 text-sky-300">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-sky-400 inline-block" aria-hidden="true" />
            متوسط 7 أيام
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block" aria-hidden="true" />
            المنافس
          </span>
        </div>
      </div>
    </div>
  );
};
