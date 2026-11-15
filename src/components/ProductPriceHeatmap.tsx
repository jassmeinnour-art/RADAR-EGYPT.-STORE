import React, { useMemo, useState } from 'react';
import { Flame, TrendingDown, Info, Filter, X, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { Product } from '../lib/supabase';
import { getProductPriceHistoryMap, buildProductHistoryKey, ProductPriceHistoryRecord } from '../utils/smartPriceAlerts';

export interface PriceZoneBucket {
  id: string;
  label: string;
  min: number;
  max: number; // Infinity for top bracket
}

export const PRICE_ZONE_BUCKETS: PriceZoneBucket[] = [
  { id: 'under_250', label: 'أقل من 250 ج.م', min: 0, max: 249.99 },
  { id: '250_500', label: '250 - 500 ج.م', min: 250, max: 500 },
  { id: '500_1000', label: '500 - 1,000 ج.م', min: 500.01, max: 1000 },
  { id: '1000_2500', label: '1,000 - 2,500 ج.م', min: 1000.01, max: 2500 },
  { id: 'over_2500', label: 'أكثر من 2,500 ج.م', min: 2500.01, max: Infinity },
];

export interface HeatmapPlatformCol {
  id: string;
  label: string;
}

export interface HeatmapCell {
  zoneId: string;
  zoneLabel: string;
  platformId: string;
  platformLabel: string;
  productCount: number;
  undercutCount: number;
  priceDropCount: number;
  avgPrice: number;
  avgGapPercent: number;
  totalStock: number;
  heatScore: number; // 0..100
  intensityLevel: 'empty' | 'low' | 'medium' | 'high' | 'hot';
  recommendation: string;
}

export interface PriceHeatmapMatrix {
  platforms: HeatmapPlatformCol[];
  zones: PriceZoneBucket[];
  cells: Record<string, HeatmapCell>; // key = `${zoneId}__${platformId}`
  zoneTotals: Record<string, { count: number; heatScore: number; undercutCount: number }>;
  hottestCell: HeatmapCell | null;
  totalAnalyzed: number;
}

function normalizePlatformId(raw?: string): string {
  const val = (raw || '').trim().toLowerCase();
  if (val.includes('amazon')) return 'amazon';
  if (val.includes('noon')) return 'noon';
  if (val.includes('jumia')) return 'jumia';
  if (!val) return 'other';
  return val;
}

function formatPlatformLabel(id: string): string {
  if (id === 'amazon') return 'أمازون';
  if (id === 'noon') return 'نون';
  if (id === 'jumia') return 'جوميا';
  if (id === 'raneen') return 'رنين';
  if (id === 'other') return 'أخرى';
  return id.toUpperCase();
}

export function getPriceZoneForAmount(price: number): PriceZoneBucket {
  const safePrice = Number.isFinite(price) && price >= 0 ? price : 0;
  if (safePrice < 250) return PRICE_ZONE_BUCKETS[0];
  if (safePrice <= 500) return PRICE_ZONE_BUCKETS[1];
  if (safePrice <= 1000) return PRICE_ZONE_BUCKETS[2];
  if (safePrice <= 2500) return PRICE_ZONE_BUCKETS[3];
  return PRICE_ZONE_BUCKETS[4];
}

export function buildPriceCompetitionHeatmap(
  products: Product[],
  historyMap: Record<string, ProductPriceHistoryRecord> = {}
): PriceHeatmapMatrix {
  const validProducts = products.filter((p) => Number(p.price) > 0);

  // Determine active platforms (always show Amazon, Noon, Jumia + any additional detected)
  const platformSet = new Set<string>(['amazon', 'noon', 'jumia']);
  for (const p of validProducts) {
    platformSet.add(normalizePlatformId(p.platform));
  }
  const platforms: HeatmapPlatformCol[] = Array.from(platformSet).map((id) => ({
    id,
    label: formatPlatformLabel(id),
  }));

  // Group products into (zone, platform) buckets
  const grouped = new Map<string, Product[]>();
  for (const p of validProducts) {
    const zone = getPriceZoneForAmount(Number(p.price));
    const plat = normalizePlatformId(p.platform);
    const key = `${zone.id}__${plat}`;
    const list = grouped.get(key) || [];
    list.push(p);
    grouped.set(key, list);
  }

  // Max cell count across grid to normalize concentration density
  let maxCellCount = 1;
  grouped.forEach((list) => {
    if (list.length > maxCellCount) maxCellCount = list.length;
  });

  const cells: Record<string, HeatmapCell> = {};
  const zoneTotals: Record<string, { count: number; heatScore: number; undercutCount: number }> = {};
  let hottestCell: HeatmapCell | null = null;

  for (const zone of PRICE_ZONE_BUCKETS) {
    let zoneCount = 0;
    let zoneUndercut = 0;
    let zoneMaxHeat = 0;

    for (const plat of platforms) {
      const key = `${zone.id}__${plat.id}`;
      const list = grouped.get(key) || [];

      if (list.length === 0) {
        cells[key] = {
          zoneId: zone.id,
          zoneLabel: zone.label,
          platformId: plat.id,
          platformLabel: plat.label,
          productCount: 0,
          undercutCount: 0,
          priceDropCount: 0,
          avgPrice: 0,
          avgGapPercent: 0,
          totalStock: 0,
          heatScore: 0,
          intensityLevel: 'empty',
          recommendation: `لا توجد منتجات في فئة (${zone.label}) على منصة ${plat.label} حالياً.`,
        };
        continue;
      }

      let priceSum = 0;
      let totalStock = 0;
      let undercutCount = 0;
      let priceDropCount = 0;
      let gapPctSum = 0;
      let gapSamples = 0;

      for (const item of list) {
        const current = Number(item.price) || 0;
        priceSum += current;
        totalStock += Number(item.stock) || 0;

        // Check competitor / buybox price signal
        const comp = Number(item.competitor_price) > 0 ? Number(item.competitor_price) : 0;
        const buybox = Number(item.buybox_price) > 0 ? Number(item.buybox_price) : 0;
        const lowestRival =
          comp > 0 && buybox > 0 ? Math.min(comp, buybox) : comp || buybox;

        if (lowestRival > 0 && lowestRival < current) {
          undercutCount += 1;
          gapPctSum += ((current - lowestRival) / current) * 100;
          gapSamples += 1;
        }

        // Check recorded historical price drops from local snapshot store
        try {
          const histKey = buildProductHistoryKey(item.trader_id, item.sku, item.id);
          const rec = historyMap[histKey];
          if (rec && rec.history.length >= 2) {
            const prev = rec.history[rec.history.length - 2]?.price || 0;
            const latest = rec.history[rec.history.length - 1]?.price || 0;
            if (prev > 0 && latest > 0 && latest < prev) {
              priceDropCount += 1;
            }
          }
        } catch {}
      }

      const avgPrice = Math.round(priceSum / list.length);
      const avgGapPercent = gapSamples > 0 ? Number((gapPctSum / gapSamples).toFixed(1)) : 0;

      // Compute weighted Competition Heat Score (0..100):
      // 55% product concentration in bracket + 30% rival undercut ratio + 15% recent price drop ratio
      const densityFactor = (list.length / maxCellCount) * 55;
      const undercutRatio = (undercutCount / list.length) * 30;
      const dropRatio = (priceDropCount / list.length) * 15;
      const heatScore = Math.min(100, Math.max(12, Math.round(densityFactor + undercutRatio + dropRatio)));

      const intensityLevel: HeatmapCell['intensityLevel'] =
        heatScore >= 80
          ? 'hot'
          : heatScore >= 60
          ? 'high'
          : heatScore >= 35
          ? 'medium'
          : 'low';

      let recommendation = '';
      if (intensityLevel === 'hot') {
        recommendation =
          undercutCount > 0
            ? `اشتعال تنافسي في ${plat.label} (${undercutCount} منتج أقل من المنافسين بمتوسط ${avgGapPercent}%) — راقب Buy Box وخفّض الهامش تكتيكياً للمنتجات سريعة الدوران.`
            : `أعلى كثافة عروض في ${plat.label} (${list.length} منتج) — حافظ على تسعير مرن ومراقبة يومية للحفاظ على الصدارة.`;
      } else if (intensityLevel === 'high') {
        recommendation = `منافسة نشطة في فئة (${zone.label}) على ${plat.label} — راجع أسعار أفضل ${Math.min(3, list.length)} منتجات لتثبيت معدل التحويل.`;
      } else if (intensityLevel === 'medium') {
        recommendation = `منافسة متوازنة على ${plat.label} — يمكنك اختبار زيادة طفيفة (2%-3%) في السعر مع الحفاظ على التنافسية.`;
      } else {
        recommendation = `منطقة هادئة نسبياً على ${plat.label} (${list.length} منتج) — فرصة ممتازة لتحقيق هامش ربح مرتفع دون حرب أسعار.`;
      }

      const cell: HeatmapCell = {
        zoneId: zone.id,
        zoneLabel: zone.label,
        platformId: plat.id,
        platformLabel: plat.label,
        productCount: list.length,
        undercutCount,
        priceDropCount,
        avgPrice,
        avgGapPercent,
        totalStock,
        heatScore,
        intensityLevel,
        recommendation,
      };

      cells[key] = cell;
      zoneCount += list.length;
      zoneUndercut += undercutCount;
      if (heatScore > zoneMaxHeat) zoneMaxHeat = heatScore;

      if (!hottestCell || cell.heatScore > hottestCell.heatScore || (cell.heatScore === hottestCell.heatScore && cell.productCount > hottestCell.productCount)) {
        hottestCell = cell;
      }
    }

    zoneTotals[zone.id] = {
      count: zoneCount,
      heatScore: zoneMaxHeat,
      undercutCount: zoneUndercut,
    };
  }

  return {
    platforms,
    zones: PRICE_ZONE_BUCKETS,
    cells,
    zoneTotals,
    hottestCell,
    totalAnalyzed: validProducts.length,
  };
}

function getCellColorClasses(level: HeatmapCell['intensityLevel'], isSelected: boolean): string {
  const ring = isSelected ? 'ring-2 ring-white shadow-lg scale-[1.02]' : '';
  switch (level) {
    case 'hot':
      return `bg-gradient-to-br from-rose-600/85 to-orange-600/85 border-rose-400/70 text-white hover:brightness-110 ${ring}`;
    case 'high':
      return `bg-orange-500/45 border-orange-400/60 text-orange-50 hover:bg-orange-500/55 ${ring}`;
    case 'medium':
      return `bg-amber-500/25 border-amber-500/45 text-amber-100 hover:bg-amber-500/35 ${ring}`;
    case 'low':
      return `bg-emerald-500/15 border-emerald-500/35 text-emerald-100 hover:bg-emerald-500/25 ${ring}`;
    default:
      return `bg-slate-950/60 border-slate-800/70 text-slate-600 hover:border-slate-700 ${ring}`;
  }
}

export interface ActiveHeatmapSelection {
  zoneId: string;
  platformId?: string;
}

interface ProductPriceHeatmapProps {
  products: Product[];
  activeFilter: ActiveHeatmapSelection | null;
  onSelectFilter: (filter: ActiveHeatmapSelection | null) => void;
}

export const ProductPriceHeatmap: React.FC<ProductPriceHeatmapProps> = ({
  products,
  activeFilter,
  onSelectFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [inspectedCellKey, setInspectedCellKey] = useState<string | null>(null);

  const matrix = useMemo(() => {
    let historyMap: Record<string, ProductPriceHistoryRecord> = {};
    try {
      historyMap = getProductPriceHistoryMap();
    } catch {}
    return buildPriceCompetitionHeatmap(products, historyMap);
  }, [products]);

  const inspectedCell: HeatmapCell | null = useMemo(() => {
    if (inspectedCellKey && matrix.cells[inspectedCellKey]) {
      return matrix.cells[inspectedCellKey];
    }
    return matrix.hottestCell;
  }, [inspectedCellKey, matrix]);

  if (matrix.totalAnalyzed === 0) {
    return null;
  }

  return (
    <section
      aria-label="خريطة حرارية للمناطق السعرية الأكثر منافسة"
      data-testid="products-price-heatmap"
      className="bg-slate-900/75 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 font-['Cairo']"
      dir="rtl"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/35 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                الخريطة الحرارية للمنافسة السعرية
              </h3>
              {matrix.hottestCell && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  ذروة المنافسة: {matrix.hottestCell.zoneLabel} ({matrix.hottestCell.platformLabel})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              توزيع المنتجات وضغط المنافسين عبر النطاقات السعرية والمنصات ({matrix.totalAnalyzed} منتج محلّل)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {activeFilter && (
            <button
              type="button"
              onClick={() => onSelectFilter(null)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء فلتر المنطقة</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>{isExpanded ? 'إخفاء الخريطة' : 'عرض الخريطة'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Heat Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-2xl px-4 py-2.5">
            <span className="font-bold text-slate-300">مؤشر شدة المنافسة:</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/35 border border-emerald-500/50" />
                <span>هادئة (فرصة ربح)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/60" />
                <span>متوسطة</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500/60 border border-orange-400/70" />
                <span>نشطة</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-rose-600 to-orange-600 border border-rose-400" />
                <span>مشتعلة (حرب أسعار)</span>
              </span>
            </div>
          </div>

          {/* 2D Matrix Grid (Responsive Horizontal Scroll on narrow mobile) */}
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[560px]">
              {/* Column Headers */}
              <div
                className="grid gap-2 mb-2 text-xs font-black text-slate-300"
                style={{
                  gridTemplateColumns: `165px repeat(${matrix.platforms.length}, minmax(100px, 1fr)) 105px`,
                }}
              >
                <div className="px-3 py-2 text-slate-400 font-bold">الفئة السعرية</div>
                {matrix.platforms.map((plat) => (
                  <div
                    key={plat.id}
                    className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center"
                  >
                    {plat.label}
                  </div>
                ))}
                <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center text-amber-400">
                  الإجمالي
                </div>
              </div>

              {/* Matrix Rows */}
              <div className="space-y-2">
                {matrix.zones.map((zone) => {
                  const zoneStat = matrix.zoneTotals[zone.id];
                  const isZoneFiltered =
                    activeFilter?.zoneId === zone.id && !activeFilter.platformId;

                  return (
                    <div
                      key={zone.id}
                      className="grid gap-2 items-stretch"
                      style={{
                        gridTemplateColumns: `165px repeat(${matrix.platforms.length}, minmax(100px, 1fr)) 105px`,
                      }}
                    >
                      {/* Row Header (Price Bracket) */}
                      <button
                        type="button"
                        onClick={() =>
                          onSelectFilter(
                            isZoneFiltered ? null : { zoneId: zone.id }
                          )
                        }
                        title="تصفية المنتجات حسب هذه الفئة السعرية"
                        className={`px-3 py-2.5 rounded-xl border text-right text-xs font-bold transition-colors cursor-pointer flex items-center justify-between gap-1 ${
                          isZoneFiltered
                            ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                            : 'bg-slate-950/80 border-slate-800/80 text-slate-200 hover:border-orange-500/50'
                        }`}
                      >
                        <span className="truncate">{zone.label}</span>
                        <Filter className="w-3 h-3 opacity-60 shrink-0" />
                      </button>

                      {/* Platform Cells */}
                      {matrix.platforms.map((plat) => {
                        const cellKey = `${zone.id}__${plat.id}`;
                        const cell = matrix.cells[cellKey];
                        const isInspected = inspectedCell?.zoneId === zone.id && inspectedCell?.platformId === plat.id;
                        const isFiltered =
                          activeFilter?.zoneId === zone.id &&
                          activeFilter?.platformId === plat.id;

                        return (
                          <button
                            key={cellKey}
                            type="button"
                            onClick={() => {
                              setInspectedCellKey(cellKey);
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[66px] ${getCellColorClasses(
                              cell.intensityLevel,
                              isInspected || isFiltered
                            )}`}
                            title={`${zone.label} · ${plat.label}: ${cell.productCount} منتج | حدة المنافسة ${cell.heatScore}%`}
                          >
                            {cell.productCount > 0 ? (
                              <>
                                <div className="flex items-center gap-1 text-xs font-black tabular-nums">
                                  <span>{cell.productCount} منتج</span>
                                  {cell.intensityLevel === 'hot' && (
                                    <Flame className="w-3.5 h-3.5 text-yellow-200 shrink-0" />
                                  )}
                                </div>
                                <div className="text-[10px] font-mono opacity-90 mt-0.5 tabular-nums">
                                  حدة {cell.heatScore}%
                                  {cell.undercutCount > 0 && (
                                    <span className="mr-1 text-rose-200 font-bold">
                                      • {cell.undercutCount} ضغط
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <span className="text-xs font-mono opacity-40">—</span>
                            )}
                          </button>
                        );
                      })}

                      {/* Zone Total Summary */}
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-black text-white tabular-nums">
                          {zoneStat.count} منتج
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 mt-0.5 tabular-nums">
                          {zoneStat.count > 0 ? `أقصى حدة ${zoneStat.heatScore}%` : 'فارغة'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active / Inspected Cell Decision Panel */}
          {inspectedCell && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-orange-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/35 flex items-center justify-center text-orange-400 shrink-0 mt-0.5">
                  {inspectedCell.undercutCount > 0 ? (
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Target className="w-5 h-5 text-orange-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs font-black text-white">
                    <span>
                      تحليل المنطقة: <span className="text-orange-400">{inspectedCell.zoneLabel}</span> — منصة{' '}
                      <span className="text-sky-400">{inspectedCell.platformLabel}</span>
                    </span>
                    {inspectedCell.productCount > 0 && (
                      <span className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                        متوسط السعر: {inspectedCell.avgPrice.toLocaleString('ar-EG')} ج.م · المخزون: {inspectedCell.totalStock.toLocaleString('ar-EG')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{inspectedCell.recommendation}</span>
                  </p>
                </div>
              </div>

              {inspectedCell.productCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const isSame =
                      activeFilter?.zoneId === inspectedCell.zoneId &&
                      activeFilter?.platformId === inspectedCell.platformId;
                    onSelectFilter(
                      isSame
                        ? null
                        : {
                            zoneId: inspectedCell.zoneId,
                            platformId: inspectedCell.platformId,
                          }
                    );
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer transition-colors ${
                    activeFilter?.zoneId === inspectedCell.zoneId &&
                    activeFilter?.platformId === inspectedCell.platformId
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      : 'bg-orange-500 hover:bg-orange-400 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    {activeFilter?.zoneId === inspectedCell.zoneId &&
                    activeFilter?.platformId === inspectedCell.platformId
                      ? 'إلغاء عرض هذه المنطقة'
                      : `عرض منتجات المنطقة (${inspectedCell.productCount})`}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductPriceHeatmap;
