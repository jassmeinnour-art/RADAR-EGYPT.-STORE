import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowRight,
  HelpCircle,
  Tag,
  FileText,
  Calendar,
  Activity,
  GitCompareArrows,
  Check,
  Store,
  ExternalLink,
  Bell,
  Hash,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { INITIAL_AUTO_PRICING_PRODUCTS, AUTO_PRICING_PRODUCTS_STORAGE_KEY } from '../data/autoPricingEngineData';
import { AutoPricingProductItem } from '../types/autoPricing';
import { RADAR_PULL_TO_REFRESH_EVENT } from './PullToRefresh';
import { PRICE_HISTORY_MAP_KEY, ProductPriceHistoryRecord } from '../utils/smartPriceAlerts';
import { Product, Trader, supabase } from '../lib/supabase';
import { CompetingStoresManagerModal } from './CompetingStoresManagerModal';
import { D3PriceTrendChart } from './D3PriceTrendChart';
import {
  CheaperCompetitorAlert,
  CompetingStoreItem,
  RADAR_COMPETING_STORES_UPDATED_EVENT,
  checkAllCompetingStoresDaily,
  getAllCheaperCompetitorAlerts,
  getTraderCompetingStores,
  recalculateStoreStats,
  resolveTraderMerchantSellerId,
  saveTraderCompetingStores,
} from '../utils/competingStoresManager';

export interface MonthlyPriceTrendPoint {
  dateKey: string;
  dateLabel: string;
  fullDate: string;
  merchantPrice: number;
  competitorPrice: number;
  costPrice: number;
  priceGap: number;
}

export interface PriceTrendChartPoint {
  dateKey: string;
  dateLabel: string;
  fullDate: string;
  merchantPrice: number | null;
  competitorPrice: number | null;
  projectedMerchantPrice: number | null;
  projectedCompetitorPrice: number | null;
  costPrice: number;
  priceGap: number;
  isProjected: boolean;
}

export interface PriceTrendProjectionResult {
  series: PriceTrendChartPoint[];
  slopePerDay: number;
  competitorSlopePerDay: number;
  projectedEndMerchantPrice: number;
  projectedEndCompetitorPrice: number;
  projectedChangePercent: number;
  trendDirection: 'up' | 'down' | 'stable';
  rSquared: number;
}

function fitLinearRegression(values: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = values.length;
  if (n < 2) {
    return { slope: 0, intercept: values[0] ?? 0, rSquared: 0 };
  }

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

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * i;
    ssTot += (values[i] - meanY) ** 2;
    ssRes += (values[i] - predicted) ** 2;
  }
  const rSquared = ssTot === 0 ? 1 : Math.max(0, Math.min(1, Number((1 - ssRes / ssTot).toFixed(2))));

  return { slope, intercept, rSquared };
}

export function buildPriceTrendProjection(
  historicalSeries: MonthlyPriceTrendPoint[],
  projectionDays = 7,
  costPrice = 0
): PriceTrendProjectionResult {
  if (!Array.isArray(historicalSeries) || historicalSeries.length === 0) {
    return {
      series: [],
      slopePerDay: 0,
      competitorSlopePerDay: 0,
      projectedEndMerchantPrice: 0,
      projectedEndCompetitorPrice: 0,
      projectedChangePercent: 0,
      trendDirection: 'stable',
      rSquared: 0,
    };
  }

  const horizon = Math.max(3, Math.min(14, Math.round(projectionDays)));
  const merchantReg = fitLinearRegression(historicalSeries.map((p) => p.merchantPrice));
  const competitorReg = fitLinearRegression(historicalSeries.map((p) => p.competitorPrice));

  const lastIdx = historicalSeries.length - 1;
  const lastPoint = historicalSeries[lastIdx];
  const minSafePrice = Math.max(1, Math.round(costPrice > 0 ? costPrice * 0.85 : 1));

  // Anchor regression projection at the last actual price while preserving learned daily slope
  const anchorMerchant = lastPoint.merchantPrice;
  const anchorCompetitor = lastPoint.competitorPrice;

  const combined: PriceTrendChartPoint[] = historicalSeries.map((pt, idx) => ({
    dateKey: pt.dateKey,
    dateLabel: pt.dateLabel,
    fullDate: pt.fullDate,
    merchantPrice: pt.merchantPrice,
    competitorPrice: pt.competitorPrice,
    projectedMerchantPrice: idx === lastIdx ? pt.merchantPrice : null,
    projectedCompetitorPrice: idx === lastIdx ? pt.competitorPrice : null,
    costPrice: pt.costPrice,
    priceGap: pt.priceGap,
    isProjected: false,
  }));

  const baseDate = new Date(`${lastPoint.dateKey}T12:00:00`);
  const validBaseDate = Number.isNaN(baseDate.getTime()) ? new Date() : baseDate;

  let projectedEndMerchant = anchorMerchant;
  let projectedEndCompetitor = anchorCompetitor;

  for (let step = 1; step <= horizon; step++) {
    const d = new Date(validBaseDate);
    d.setDate(d.getDate() + step);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const dateLabel = `${dd}/${mm}`;
    const fullDate = d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const projM = Math.max(minSafePrice, Math.round(anchorMerchant + merchantReg.slope * step));
    const projC = Math.max(
      Math.max(1, Math.round(minSafePrice * 0.95)),
      Math.round(anchorCompetitor + competitorReg.slope * step)
    );

    projectedEndMerchant = projM;
    projectedEndCompetitor = projC;

    combined.push({
      dateKey,
      dateLabel,
      fullDate,
      merchantPrice: null,
      competitorPrice: null,
      projectedMerchantPrice: projM,
      projectedCompetitorPrice: projC,
      costPrice: lastPoint.costPrice,
      priceGap: projM - projC,
      isProjected: true,
    });
  }

  const slopePerDay = Number(merchantReg.slope.toFixed(2));
  const competitorSlopePerDay = Number(competitorReg.slope.toFixed(2));
  const projectedChangePercent =
    anchorMerchant > 0
      ? Number((((projectedEndMerchant - anchorMerchant) / anchorMerchant) * 100).toFixed(1))
      : 0;
  const trendDirection: 'up' | 'down' | 'stable' =
    projectedChangePercent >= 0.5 ? 'up' : projectedChangePercent <= -0.5 ? 'down' : 'stable';

  return {
    series: combined,
    slopePerDay,
    competitorSlopePerDay,
    projectedEndMerchantPrice: projectedEndMerchant,
    projectedEndCompetitorPrice: projectedEndCompetitor,
    projectedChangePercent,
    trendDirection,
    rSquared: merchantReg.rSquared,
  };
}

function hashSkuSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function readSavedPriceHistoryMap(): Record<string, ProductPriceHistoryRecord> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PRICE_HISTORY_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function buildMonthlyPriceTrendSeries(
  item: {
    id: string;
    sku: string;
    merchantPrice: number;
    competitorPrice: number;
    costPrice: number;
  },
  days = 30,
  savedMap: Record<string, ProductPriceHistoryRecord> = readSavedPriceHistoryMap(),
  referenceDate: Date = new Date()
): MonthlyPriceTrendPoint[] {
  const totalDays = Math.max(7, Math.min(30, days));
  const seed = hashSkuSeed(item.sku || item.id || 'PRODUCT');

  const matchingRecord = Object.values(savedMap).find(
    (rec) =>
      rec &&
      ((rec.sku && rec.sku.toLowerCase() === item.sku.toLowerCase()) ||
        (rec.productId && rec.productId === item.id))
  );

  const realByDate = new Map<string, number>();
  if (matchingRecord && Array.isArray(matchingRecord.history)) {
    for (const entry of matchingRecord.history) {
      if (entry && typeof entry.price === 'number' && entry.recordedAt) {
        const key = String(entry.recordedAt).slice(0, 10);
        if (key) realByDate.set(key, entry.price);
      }
    }
  }

  const baseMerchant = Math.max(1, Math.round(item.merchantPrice));
  const baseCompetitor = Math.max(1, Math.round(item.competitorPrice));
  const floorSafe = Math.max(1, Math.round(item.costPrice * 0.92));

  const points: MonthlyPriceTrendPoint[] = [];
  for (let offset = totalDays - 1; offset >= 0; offset--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const dateLabel = `${dd}/${mm}`;
    const fullDate = d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (offset === 0) {
      points.push({
        dateKey,
        dateLabel,
        fullDate,
        merchantPrice: baseMerchant,
        competitorPrice: baseCompetitor,
        costPrice: Math.round(item.costPrice),
        priceGap: baseMerchant - baseCompetitor,
      });
      continue;
    }

    const waveA = Math.sin((offset + (seed % 11)) * 0.42);
    const waveB = Math.cos((offset + (seed % 7)) * 0.27);
    const driftFactor = (offset / totalDays) * (((seed % 9) - 4) * 0.008);
    const merchantDelta = waveA * 0.045 + waveB * 0.02 + driftFactor;
    const compWave = Math.sin((offset + (seed % 13)) * 0.51 + 1.1) * 0.05 + driftFactor * 0.9;

    const realOverride = realByDate.get(dateKey);
    const simulatedMerchant = Math.max(floorSafe, Math.round(baseMerchant * (1 + merchantDelta)));
    const merchantPrice = realOverride !== undefined ? Math.round(realOverride) : simulatedMerchant;
    const competitorPrice = Math.max(
      Math.round(floorSafe * 0.95),
      Math.round(baseCompetitor * (1 + compWave))
    );

    points.push({
      dateKey,
      dateLabel,
      fullDate,
      merchantPrice,
      competitorPrice,
      costPrice: Math.round(item.costPrice),
      priceGap: merchantPrice - competitorPrice,
    });
  }

  return points;
}

export const DIRECT_COMPARISON_COLORS = [
  '#f59e0b',
  '#38bdf8',
  '#10b981',
  '#a855f7',
  '#fb7185',
  '#2dd4bf',
] as const;

export type DirectComparisonMetric = 'merchant' | 'competitor';

export interface DirectComparisonSeriesMeta {
  id: string;
  sku: string;
  title: string;
  color: string;
  currentPrice: number;
  competitorPrice: number;
  costPrice: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  changePercent: number;
}

export interface DirectComparisonChartPoint {
  dateKey: string;
  dateLabel: string;
  fullDate: string;
  [skuKey: string]: string | number;
}

export interface DirectComparisonResult {
  chartData: DirectComparisonChartPoint[];
  seriesMeta: DirectComparisonSeriesMeta[];
}

export function buildDirectComparisonChartData(
  items: Array<{
    id: string;
    sku: string;
    title: string;
    merchantPrice: number;
    competitorPrice: number;
    costPrice: number;
  }>,
  days = 30,
  metric: DirectComparisonMetric = 'merchant',
  savedMap: Record<string, ProductPriceHistoryRecord> = readSavedPriceHistoryMap(),
  referenceDate: Date = new Date()
): DirectComparisonResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { chartData: [], seriesMeta: [] };
  }

  const perProductSeries = items.map((item) =>
    buildMonthlyPriceTrendSeries(item, days, savedMap, referenceDate)
  );

  const baseSeries = perProductSeries[0] ?? [];
  const chartData: DirectComparisonChartPoint[] = baseSeries.map((pt, idx) => {
    const point: DirectComparisonChartPoint = {
      dateKey: pt.dateKey,
      dateLabel: pt.dateLabel,
      fullDate: pt.fullDate,
    };

    items.forEach((item, productIdx) => {
      const seriesPoint = perProductSeries[productIdx]?.[idx];
      if (seriesPoint) {
        point[item.sku] =
          metric === 'competitor' ? seriesPoint.competitorPrice : seriesPoint.merchantPrice;
      }
    });

    return point;
  });

  const seriesMeta: DirectComparisonSeriesMeta[] = items.map((item, productIdx) => {
    const series = perProductSeries[productIdx] ?? [];
    const values = series.map((p) =>
      metric === 'competitor' ? p.competitorPrice : p.merchantPrice
    );
    const minPrice = values.length > 0 ? Math.min(...values) : 0;
    const maxPrice = values.length > 0 ? Math.max(...values) : 0;
    const avgPrice =
      values.length > 0
        ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
        : 0;
    const firstVal = values[0] ?? 0;
    const lastVal = values[values.length - 1] ?? 0;
    const changePercent =
      firstVal > 0 ? Number((((lastVal - firstVal) / firstVal) * 100).toFixed(1)) : 0;

    return {
      id: item.id,
      sku: item.sku,
      title: item.title,
      color: DIRECT_COMPARISON_COLORS[productIdx % DIRECT_COMPARISON_COLORS.length],
      currentPrice: Math.round(item.merchantPrice),
      competitorPrice: Math.round(item.competitorPrice),
      costPrice: Math.round(item.costPrice),
      minPrice,
      maxPrice,
      avgPrice,
      changePercent,
    };
  });

  return { chartData, seriesMeta };
}

interface ComparisonItem {
  id: string;
  sku: string;
  title: string;
  merchantPrice: number;
  costPrice: number;
  competitorPrice: number;
  competitorName: string;
  competitorPlatform: string;
  priceGapAmount: number;
  priceGapPercent: number;
  status: 'higher' | 'lower' | 'optimal';
  recommendedPrice: number;
  recommendationReason: string;
}

interface PriceComparisonEngineProps {
  currency?: string;
  onApplyPrice?: (sku: string, newPrice: number) => void;
  onShowToast?: (msg: string) => void;
}

export default function PriceComparisonEngine({
  currency = 'ج.م',
  onApplyPrice,
  onShowToast
}: PriceComparisonEngineProps) {
  const [products, setProducts] = useState<AutoPricingProductItem[]>([]);
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'higher' | 'lower' | 'optimal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [chartMode, setChartMode] = useState<'single' | 'direct'>('single');
  const [directCompareSkus, setDirectCompareSkus] = useState<string[]>([]);
  const [directMetric, setDirectMetric] = useState<DirectComparisonMetric>('merchant');
  const [trendRangeDays, setTrendRangeDays] = useState<7 | 14 | 30>(30);
  const [projectionDays, setProjectionDays] = useState<7 | 14>(7);
  const [showMerchantSeries, setShowMerchantSeries] = useState(true);
  const [showCompetitorSeries, setShowCompetitorSeries] = useState(true);
  const [showCostReference, setShowCostReference] = useState(true);
  const [showProjection, setShowProjection] = useState(true);

  // Competing Stores & Daily Monitoring state
  const [tradersList, setTradersList] = useState<Trader[]>([]);
  const [productsByTrader, setProductsByTrader] = useState<Map<string, Product[]>>(new Map());
  const [competingStoresTick, setCompetingStoresTick] = useState(0);
  const [isDailyMonitoringRunning, setIsDailyMonitoringRunning] = useState(false);
  const [cheaperAlerts, setCheaperAlerts] = useState<CheaperCompetitorAlert[]>([]);
  const [selectedTraderForStores, setSelectedTraderForStores] = useState<Trader | null>(null);

  const loadTradersAndCompetingStores = async (runAutoDaily = true) => {
    try {
      const [{ data: tradersData }, { data: prodsData }] = await Promise.all([
        supabase.from('traders').select('*'),
        supabase.from('products').select('*'),
      ]);
      const loadedTraders = Array.isArray(tradersData) ? (tradersData as Trader[]) : [];
      const loadedProds = Array.isArray(prodsData) ? (prodsData as Product[]) : [];

      const byTrader = new Map<string, Product[]>();
      loadedProds.forEach((p) => {
        if (!p?.trader_id) return;
        const arr = byTrader.get(p.trader_id) || [];
        arr.push(p);
        byTrader.set(p.trader_id, arr);
      });

      setTradersList(loadedTraders);
      setProductsByTrader(byTrader);
      setCheaperAlerts(getAllCheaperCompetitorAlerts(loadedTraders));

      if (runAutoDaily && loadedTraders.length > 0) {
        const result = await checkAllCompetingStoresDaily(loadedTraders, byTrader, false);
        setCheaperAlerts(result.alerts);
        if (result.checkedStoresCount > 0) {
          setCompetingStoresTick((n) => n + 1);
        }
      }
    } catch {
      // keep existing state cleanly
    }
  };

  const handleRunDailyCheckNow = async () => {
    if (tradersList.length === 0) {
      onShowToast?.('⚠️ لا يوجد تجار مسجلون لفحص متاجر منافسيهم حالياً.');
      return;
    }
    setIsDailyMonitoringRunning(true);
    try {
      const result = await checkAllCompetingStoresDaily(tradersList, productsByTrader, true);
      setCheaperAlerts(result.alerts);
      setCompetingStoresTick((n) => n + 1);
      onShowToast?.(
        result.alerts.length > 0
          ? `🔔 تم الفحص اليومي لـ ${result.checkedStoresCount} متجر منافس — تم رصد ${result.alerts.length} منتج بسعر أرخص منك!`
          : `✅ تم الفحص اليومي لـ ${result.checkedStoresCount} متجر منافس — أسعارك آمنة.`
      );
    } finally {
      setIsDailyMonitoringRunning(false);
    }
  };

  const handleQuickConfirmMatch = (
    traderId: string,
    storeId: string,
    productId: string,
    accept: boolean
  ) => {
    const stores = getTraderCompetingStores(traderId);
    const updated = stores.map((st) => {
      if (st.id !== storeId) return st;
      return recalculateStoreStats({
        ...st,
        products: st.products.map((p) =>
          p.id === productId ? { ...p, confirmed: accept, rejected: !accept } : p
        ),
      });
    });
    saveTraderCompetingStores(traderId, updated);
    setCheaperAlerts(getAllCheaperCompetitorAlerts(tradersList));
    setCompetingStoresTick((n) => n + 1);
    onShowToast?.(accept ? '✅ تم تأكيد المنافس المحتمل' : 'تم تجاهل المنتج');
  };

  useEffect(() => {
    const loadComparisonData = () => {
      try {
        const saved = localStorage.getItem(AUTO_PRICING_PRODUCTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            generateComparison(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not load stored auto pricing products:', e);
      }
      setProducts(INITIAL_AUTO_PRICING_PRODUCTS);
      generateComparison(INITIAL_AUTO_PRICING_PRODUCTS);
    };

    const handleStoresUpdated = () => {
      setCompetingStoresTick((n) => n + 1);
      setTradersList((prev) => {
        setCheaperAlerts(getAllCheaperCompetitorAlerts(prev));
        return prev;
      });
    };

    loadComparisonData();
    void loadTradersAndCompetingStores(true);
    window.addEventListener(RADAR_PULL_TO_REFRESH_EVENT, loadComparisonData);
    window.addEventListener(RADAR_COMPETING_STORES_UPDATED_EVENT, handleStoresUpdated);
    return () => {
      window.removeEventListener(RADAR_PULL_TO_REFRESH_EVENT, loadComparisonData);
      window.removeEventListener(RADAR_COMPETING_STORES_UPDATED_EVENT, handleStoresUpdated);
    };
  }, []);

  const generateComparison = (items: AutoPricingProductItem[]) => {
    const comparisons: ComparisonItem[] = items.map((item) => {
      const merchantPrice = item.currentPrice;
      const competitorPrice = item.lowestCompetitorPrice || merchantPrice;
      const priceGapAmount = merchantPrice - competitorPrice;
      const priceGapPercent = competitorPrice > 0 ? Number(((priceGapAmount / competitorPrice) * 100).toFixed(1)) : 0;

      let status: 'higher' | 'lower' | 'optimal' = 'optimal';
      let recommendedPrice = merchantPrice;
      let recommendationReason = 'السعر الحالي مطابق ومنافس في السوق';

      if (priceGapAmount > 15) {
        status = 'higher';
        recommendedPrice = competitorPrice - 5;
        recommendationReason = `سعرك أعلى من المنافس بـ ${priceGapAmount} ج.م (خطر فقدان المبيعات). يفضل تخفيض السعر إلى ${recommendedPrice} ج.م.`;
      } else if (priceGapAmount < -20 && item.competitorInStock) {
        status = 'lower';
        recommendedPrice = competitorPrice - 2;
        recommendationReason = `سعرك أقل من المنافس. فرصة لرفع السعر قليلاً لزيادة هامش الربح وصافي الأرباح.`;
      } else {
        status = 'optimal';
        recommendedPrice = merchantPrice;
        recommendationReason = 'سعر مثالي يحقق صدارة اليد العليا (Buy Box) وهامش ربح آمن.';
      }

      return {
        id: item.productId,
        sku: item.sku,
        title: item.title,
        merchantPrice,
        costPrice: item.costPrice,
        competitorPrice,
        competitorName: item.lowestCompetitorName || 'منافس رئيسي في السوق',
        competitorPlatform: item.lowestCompetitorPlatform || 'أمازون/نون',
        priceGapAmount,
        priceGapPercent,
        status,
        recommendedPrice,
        recommendationReason
      };
    });

    setComparisonItems(comparisons);
    setSelectedSku((prev) => {
      if (prev && comparisons.some((c) => c.sku === prev)) return prev;
      return comparisons[0]?.sku || '';
    });
    setDirectCompareSkus((prev) => {
      const validPrev = prev.filter((sku) => comparisons.some((c) => c.sku === sku));
      if (validPrev.length >= 2) return validPrev;
      return comparisons.slice(0, Math.min(2, comparisons.length)).map((c) => c.sku);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessingCsv(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          alert('ملف CSV فارغ أو لا يحتوي على صفوف بيانات صحيحة.');
          setIsProcessingCsv(false);
          return;
        }

        const newParsedItems: AutoPricingProductItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
          if (row.length >= 3) {
            const sku = row[0] || `SKU-UPLOAD-${i}`;
            const title = row[1] || `منتج مسجل مسبقاً رقم ${i}`;
            const merchantPrice = parseFloat(row[2]) || 2500;
            const costPrice = row[3] ? parseFloat(row[3]) : merchantPrice * 0.75;
            
            const baseComp = INITIAL_AUTO_PRICING_PRODUCTS[(i - 1) % INITIAL_AUTO_PRICING_PRODUCTS.length];
            
            newParsedItems.push({
              productId: `upload_prd_${i}_${Date.now()}`,
              sku,
              title,
              category: 'منتجات عامة مستوردة',
              imageUrl: baseComp.imageUrl,
              costPrice,
              currentPrice: merchantPrice,
              lowestCompetitorPrice: baseComp.lowestCompetitorPrice + (Math.floor(Math.random() * 60) - 30),
              lowestCompetitorName: baseComp.lowestCompetitorName,
              lowestCompetitorPlatform: baseComp.lowestCompetitorPlatform,
              competitorInStock: true,
              assignedRuleId: 'rule-buybox-sniper',
              autoPricingEnabled: true,
              customFloorPrice: costPrice * 1.1,
              customCeilingPrice: merchantPrice * 1.3,
              lastRepricedAt: new Date().toISOString(),
              lastRepriceStatus: 'optimal',
              todayRepriceCount: 0
            });
          }
        }

        if (newParsedItems.length > 0) {
          setProducts(newParsedItems);
          generateComparison(newParsedItems);
          if (onShowToast) onShowToast(`تم استيراد ومقارنة ${newParsedItems.length} منتج بنجاح من ملف CSV!`);
        }
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        alert('حدث خطأ أثناء قراءة ملف CSV. تأكد من صحة التنسيق.');
      } finally {
        setIsProcessingCsv(false);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const downloadCsvTemplate = () => {
    const csvContent = "sku,title,merchant_price,cost_price\nFURN-CHR-001,كرسي مكتب هيدروليك أسود,3450,2650\nANK-Q30-BLK,سماعة أنكر ساوند كور,2890,2200\nDSK-HYD-120,مكتب عمل هيدروليك 120سم,2650,1450\nPHL-AIR-41L,قلاية فيليبس هوائية 4.1 لتر,4690,3800";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'price_comparison_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('تم تحميل نموذج ملف CSV بنجاح.');
  };

  const applyRecommended = (sku: string, recPrice: number) => {
    setProducts(products.map(p => p.sku === sku ? { ...p, currentPrice: recPrice, lastRepricedAt: new Date().toISOString() } : p));
    setComparisonItems(comparisonItems.map(c => c.sku === sku ? { ...c, merchantPrice: recPrice, priceGapAmount: recPrice - c.competitorPrice, status: 'optimal' } : c));
    if (onApplyPrice) onApplyPrice(sku, recPrice);
    if (onShowToast) onShowToast(`تم تطبيق السعر المقترح بنجاح للمنتج SKU: ${sku}`);
  };

  const filteredItems = comparisonItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.competitorName.toLowerCase().includes(q);
    }
    return true;
  });

  const higherCount = comparisonItems.filter(i => i.status === 'higher').length;
  const lowerCount = comparisonItems.filter(i => i.status === 'lower').length;
  const optimalCount = comparisonItems.filter(i => i.status === 'optimal').length;

  const selectedComparisonItem =
    comparisonItems.find((i) => i.sku === selectedSku) || comparisonItems[0] || null;

  const monthlyTrendSeries = selectedComparisonItem
    ? buildMonthlyPriceTrendSeries(selectedComparisonItem, trendRangeDays)
    : [];

  const historical30DaySeries = selectedComparisonItem
    ? trendRangeDays === 30
      ? monthlyTrendSeries
      : buildMonthlyPriceTrendSeries(selectedComparisonItem, 30)
    : [];

  const projectionResult = selectedComparisonItem
    ? buildPriceTrendProjection(monthlyTrendSeries, projectionDays, selectedComparisonItem.costPrice)
    : null;

  const chartData: PriceTrendChartPoint[] = showProjection && projectionResult
    ? projectionResult.series
    : monthlyTrendSeries.map((pt) => ({
        dateKey: pt.dateKey,
        dateLabel: pt.dateLabel,
        fullDate: pt.fullDate,
        merchantPrice: pt.merchantPrice,
        competitorPrice: pt.competitorPrice,
        projectedMerchantPrice: null,
        projectedCompetitorPrice: null,
        costPrice: pt.costPrice,
        priceGap: pt.priceGap,
        isProjected: false,
      }));

  const todayBoundaryLabel =
    monthlyTrendSeries.length > 0 ? monthlyTrendSeries[monthlyTrendSeries.length - 1].dateLabel : null;

  const trendStats = (() => {
    if (monthlyTrendSeries.length === 0) {
      return { maxMerchant: 0, minMerchant: 0, avgCompetitor: 0, changePercent: 0 };
    }
    const merchantPrices = monthlyTrendSeries.map((p) => p.merchantPrice);
    const compPrices = monthlyTrendSeries.map((p) => p.competitorPrice);
    const maxMerchant = Math.max(...merchantPrices);
    const minMerchant = Math.min(...merchantPrices);
    const avgCompetitor = Math.round(
      compPrices.reduce((sum, val) => sum + val, 0) / compPrices.length
    );
    const firstPrice = monthlyTrendSeries[0].merchantPrice;
    const lastPrice = monthlyTrendSeries[monthlyTrendSeries.length - 1].merchantPrice;
    const changePercent =
      firstPrice > 0 ? Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1)) : 0;
    return { maxMerchant, minMerchant, avgCompetitor, changePercent };
  })();

  const toggleDirectCompareSku = (sku: string) => {
    setDirectCompareSkus((prev) => {
      if (prev.includes(sku)) {
        return prev.filter((itemSku) => itemSku !== sku);
      }
      return [...prev, sku];
    });
  };

  const directComparisonItems = comparisonItems.filter((item) =>
    directCompareSkus.includes(item.sku)
  );

  const directComparisonResult =
    directComparisonItems.length >= 2
      ? buildDirectComparisonChartData(directComparisonItems, trendRangeDays, directMetric)
      : { chartData: [], seriesMeta: [] };

  return (
    <section 
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl space-y-6" 
      dir="rtl"
      role="region"
      aria-label="محرك مقارنة الأسعار والفجوات السعرية"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400" aria-hidden="true">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white" id="price-comparison-title">محرك مقارنة الأسعار والفجوات (CSV Price Comparison)</h2>
            <p className="text-xs text-slate-400">استيراد منتجاتك عبر CSV ومقارنتها فوراً بأسعار المنافسين المستخرجة من محرك التسعير الآلي</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap" role="toolbar" aria-label="أدوات تصدير واستيراد بيانات المقارنة">
          <button
            onClick={downloadCsvTemplate}
            aria-label="تحميل نموذج ملف CSV فارغ"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition flex items-center gap-2 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <Download className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>تحميل نموذج CSV</span>
          </button>

          <label 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 focus-within:ring-2 focus-within:ring-slate-950"
            aria-label="رفع ملف منتجات بصيغة CSV للمقارنة"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>{uploadedFileName ? 'تغيير ملف CSV' : 'رفع ملف منتجات CSV'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" aria-hidden="true" />
          </label>
        </div>
      </div>

      {/* Cheaper Competitor Daily Monitoring Alerts */}
      {cheaperAlerts.length > 0 && (
        <div
          className="p-5 rounded-2xl bg-rose-950/35 border border-rose-500/50 space-y-3 shadow-lg"
          role="alert"
          aria-label="تنبيهات المنافسين الأرخص"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-300 font-black text-sm">
              <Bell className="w-5 h-5 text-rose-400 animate-pulse" />
              <span>تنبيهات المراقبة اليومية — منافسين أرخص من أسعارك ({cheaperAlerts.length})</span>
            </div>
            <button
              type="button"
              onClick={handleRunDailyCheckNow}
              disabled={isDailyMonitoringRunning}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDailyMonitoringRunning ? 'animate-spin' : ''}`} />
              <span>{isDailyMonitoringRunning ? 'جاري الفحص...' : 'فحص الأسعار اليومي الآن'}</span>
            </button>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {cheaperAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-black text-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{alert.message}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                    <span>التاجر: <strong className="text-amber-300">{alert.traderName}</strong></span>
                    <span>•</span>
                    <span>المتجر المنافس: <strong className="text-sky-300">{alert.storeName}</strong></span>
                    {alert.competitorSellerId && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300">
                        Seller ID: {alert.competitorSellerId}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={alert.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold inline-flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>عرض المنافس</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competing Stores Per Trader Cards */}
      <div
        className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4"
        role="region"
        aria-label="متاجر المنافسين لكل تاجر"
        data-refresh-tick={competingStoresTick}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">متاجر المنافسين لكل تاجر (حصد المتجر الكامل والمراقبة اليومية)</h3>
              <p className="text-xs text-slate-400">
                أضف روابط متاجر المنافسين (amazon.eg/s?me=... أو نون/جوميا) لكل تاجر لمقارنة الـ ASIN والتشابه ≥ 70% ومراقبة الأسعار يومياً
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunDailyCheckNow}
            disabled={isDailyMonitoringRunning}
            className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-black inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isDailyMonitoringRunning ? 'animate-spin' : ''}`} />
            <span>{isDailyMonitoringRunning ? 'جاري فحص المتاجر...' : 'فحص أسعار المتاجر اليومي 🔄'}</span>
          </button>
        </div>

        {tradersList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
            لا يوجد تجار مسجلون بعد — أضف تاجراً أولاً لتتمكن من ربط وحصد متاجر منافسيه.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tradersList.map((trader) => {
              const traderStores: CompetingStoreItem[] = getTraderCompetingStores(trader.id);
              const traderSellerId = resolveTraderMerchantSellerId(trader);
              const pendingMatches = traderStores.flatMap((s) =>
                (s.products || [])
                  .filter((p) => p.matchType === 'potential_title' && !p.confirmed && !p.rejected)
                  .map((p) => ({ store: s, product: p }))
              );

              return (
                <div
                  key={trader.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white truncate">{trader.seller_name}</div>
                      <div className="text-[11px] font-mono text-amber-300 inline-flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span>Seller ID: {traderSellerId || 'غير محدد'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTraderForStores(trader)}
                      className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة / حصد متجر منافس</span>
                    </button>
                  </div>

                  {traderStores.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
                      لا توجد متاجر منافسين مضافة لهذا التاجر بعد — اضغط "إضافة / حصد متجر منافس" للصق الرابط.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {traderStores.map((st) => (
                        <div
                          key={st.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-white truncate">{st.storeName}</span>
                            {st.storeSellerId && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 shrink-0">
                                Seller ID: {st.storeSellerId}
                              </span>
                            )}
                          </div>
                          <a
                            href={st.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-sky-400 hover:underline truncate block"
                            dir="ltr"
                          >
                            {st.storeUrl}
                          </a>
                          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                              <div className="text-[10px] text-slate-400">المنتجات المحصودة</div>
                              <div className="font-mono font-black text-white">{st.harvestedCount}</div>
                            </div>
                            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                              <div className="text-[10px] text-slate-400">المنتجات الشبيهة</div>
                              <div className="font-mono font-black text-sky-300">{st.matchedCount}</div>
                            </div>
                            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                              <div className="text-[10px] text-slate-400">متوسط فرق السعر</div>
                              <div
                                className={`font-black ${
                                  st.pricePosition === 'cheaper'
                                    ? 'text-rose-400'
                                    : st.pricePosition === 'expensive'
                                    ? 'text-emerald-400'
                                    : 'text-slate-300'
                                }`}
                              >
                                {st.pricePosition === 'cheaper'
                                  ? `أرخص بـ ${Math.abs(st.avgPriceDiffAmount)} ج.م`
                                  : st.pricePosition === 'expensive'
                                  ? `أغلى بـ ${Math.abs(st.avgPriceDiffAmount)} ج.م`
                                  : st.pricePosition === 'equal'
                                  ? 'متساوي'
                                  : '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {pendingMatches.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                          <div className="text-[11px] font-black text-amber-300">
                            منافس محتمل (تشابه ≥ 70%) بانتظار تأكيدك ({pendingMatches.length}):
                          </div>
                          {pendingMatches.slice(0, 3).map(({ store: st, product: mp }) => (
                            <div
                              key={mp.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-[11px]"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate">{mp.title}</div>
                                <div className="text-[10px] text-slate-400">
                                  تشابه {mp.similarityPercent}% مع "{mp.matchedProductTitle}" • سعره:{' '}
                                  <strong className="text-amber-300 font-mono">{mp.price.toLocaleString()} ج.م</strong>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleQuickConfirmMatch(trader.id, st.id, mp.id, true)}
                                  className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                                >
                                  تأكيد ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickConfirmMatch(trader.id, st.id, mp.id, false)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                >
                                  تجاهل
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="مؤشرات إحصاءات الفجوات السعرية">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shadow-lg flex items-center justify-between" tabIndex={0} role="group" aria-label="إجمالي المنتجات المقارنة:">
          <div>
            <p className="text-xs text-slate-400 font-bold">إجمالي المنتجات المقارنة</p>
            <h3 className="text-2xl font-black text-white mt-1" aria-live="polite">{comparisonItems.length}</h3>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-400" aria-hidden="true">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 shadow-lg flex items-center justify-between" tabIndex={0} role="group" aria-label="المنتجات الأعلى من المنافس (خطر):">
          <div>
            <p className="text-xs text-red-300 font-bold">أعلى من المنافس (خطر)</p>
            <h3 className="text-2xl font-black text-red-400 mt-1" aria-live="polite">{higherCount}</h3>
          </div>
          <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30 text-red-400" aria-hidden="true">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 shadow-lg flex items-center justify-between" tabIndex={0} role="group" aria-label="المنتجات الأقل من المنافس (فرصة):">
          <div>
            <p className="text-xs text-sky-300 font-bold">أقل من المنافس (فرصة)</p>
            <h3 className="text-2xl font-black text-sky-400 mt-1" aria-live="polite">{lowerCount}</h3>
          </div>
          <div className="p-3 bg-sky-500/20 rounded-xl border border-sky-500/30 text-sky-400" aria-hidden="true">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 shadow-lg flex items-center justify-between" tabIndex={0} role="group" aria-label="المنتجات المطابقة والمنافسة (مثالي):">
          <div>
            <p className="text-xs text-emerald-300 font-bold">مطابق ومنافس (مثالي)</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1" aria-live="polite">{optimalCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400" aria-hidden="true">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive Monthly Price Trend Chart (Recharts) */}
      <div
        className="p-5 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-4"
        role="region"
        aria-label="مخطط اتجاهات تغير السعر خلال الشهر الماضي"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-black text-base">
              <Activity className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
              <h3>
                {chartMode === 'direct'
                  ? 'المقارنة المباشرة لتذبذب أسعار المنتجات'
                  : 'اتجاهات تغير سعر المنتج خلال الشهر الماضي'}
              </h3>
            </div>
            {chartMode === 'direct' ? (
              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                <span>اختر منتجين أو أكثر لدمج حركتهما السعرية في رسم بياني واحد</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-400">
                  المحددة: {directComparisonItems.length} من {comparisonItems.length}
                </span>
              </p>
            ) : selectedComparisonItem ? (
              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                <span className="text-slate-200 font-bold">{selectedComparisonItem.title}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-400">SKU: {selectedComparisonItem.sku}</span>
                <span aria-hidden="true">·</span>
                <span>المنافس: {selectedComparisonItem.competitorName}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400">اختر منتجاً لعرض سجل حركته السعرية</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800"
              role="group"
              aria-label="وضع عرض الرسم البياني"
            >
              <button
                type="button"
                aria-pressed={chartMode === 'single'}
                onClick={() => setChartMode('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  chartMode === 'single'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                منتج واحد
              </button>
              <button
                type="button"
                aria-pressed={chartMode === 'direct'}
                onClick={() => setChartMode('direct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  chartMode === 'direct'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitCompareArrows className="w-3.5 h-3.5" aria-hidden="true" />
                <span>المقارنة المباشرة</span>
              </button>
            </div>

            {chartMode === 'single' && comparisonItems.length > 0 && (
              <select
                aria-label="اختر المنتج لعرض اتجاه السعر"
                value={selectedComparisonItem?.sku || ''}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-amber-500 max-w-xs"
              >
                {comparisonItems.map((item) => (
                  <option key={item.sku} value={item.sku}>
                    {item.title} ({item.sku})
                  </option>
                ))}
              </select>
            )}

            <div
              className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800"
              role="group"
              aria-label="تحديد المدة الزمنية للمخطط"
            >
              {([
                { days: 30 as const, label: '30 يوم (الشهر الماضي)' },
                { days: 14 as const, label: '14 يوم' },
                { days: 7 as const, label: '7 أيام' },
              ]).map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setTrendRangeDays(option.days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                    trendRangeDays === option.days
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {chartMode === 'direct' ? (
          <div className="space-y-4" data-testid="direct-comparison-panel">
            {/* Multi-product Picker + Metric Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div
                className="flex flex-wrap items-center gap-2"
                role="group"
                aria-label="اختيار المنتجات للمقارنة المباشرة"
                data-testid="direct-comparison-selector"
              >
                {comparisonItems.map((item) => {
                  const selectedIdx = directComparisonItems.findIndex((i) => i.sku === item.sku);
                  const isSelected = selectedIdx !== -1;
                  const seriesColor = isSelected
                    ? DIRECT_COMPARISON_COLORS[selectedIdx % DIRECT_COMPARISON_COLORS.length]
                    : '#475569';

                  return (
                    <button
                      key={item.sku}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleDirectCompareSku(item.sku)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                        isSelected
                          ? 'bg-slate-900 border-amber-500/60 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: seriesColor }}
                        aria-hidden="true"
                      />
                      <span className="max-w-[180px] truncate">{item.title}</span>
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {item.merchantPrice.toLocaleString()} {currency}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              <div
                className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 shrink-0 self-start lg:self-auto"
                role="group"
                aria-label="نوع السعر في المقارنة المباشرة"
              >
                <button
                  type="button"
                  aria-pressed={directMetric === 'merchant'}
                  onClick={() => setDirectMetric('merchant')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    directMetric === 'merchant'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  مقارنة سعرك
                </button>
                <button
                  type="button"
                  aria-pressed={directMetric === 'competitor'}
                  onClick={() => setDirectMetric('competitor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    directMetric === 'competitor'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  مقارنة المنافس
                </button>
              </div>
            </div>

            {directComparisonItems.length < 2 ? (
              <div
                data-testid="direct-comparison-empty"
                className="py-12 px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-3"
              >
                <p className="text-xs text-slate-300 font-bold">
                  يرجى اختيار منتجين على الأقل لعرض المقارنة المباشرة في الرسم البياني.
                </p>
                {comparisonItems.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => setDirectCompareSkus(comparisonItems.slice(0, 2).map((c) => c.sku))}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer"
                  >
                    اختيار أول منتجين تلقائياً
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  data-testid="direct-comparison-summary"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                >
                  {directComparisonResult.seriesMeta.map((meta) => (
                    <div
                      key={meta.sku}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: meta.color }}
                            aria-hidden="true"
                          />
                          <span className="text-xs font-bold text-white truncate">{meta.title}</span>
                        </div>
                        <span
                          className={`font-mono text-[11px] font-bold tabular-nums shrink-0 ${
                            meta.changePercent > 0
                              ? 'text-red-400'
                              : meta.changePercent < 0
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {meta.changePercent > 0 ? `+${meta.changePercent}%` : `${meta.changePercent}%`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                        <span>المتوسط: {meta.avgPrice.toLocaleString()} {currency}</span>
                        <span>{meta.minPrice.toLocaleString()}–{meta.maxPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full h-[300px]" dir="ltr" data-testid="direct-comparison-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={directComparisonResult.chartData}
                      margin={{ top: 12, right: 16, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="dateLabel"
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        minTickGap={18}
                      />
                      <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        domain={['auto', 'auto']}
                        width={56}
                        tickFormatter={(val: number) => `${val}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const pt = payload[0]?.payload as DirectComparisonChartPoint | undefined;
                          if (!pt) return null;
                          return (
                            <div
                              dir="rtl"
                              className="rounded-xl bg-slate-950 border border-slate-700 p-3 shadow-xl text-xs space-y-1.5 min-w-[210px]"
                            >
                              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{pt.fullDate}</span>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {directMetric === 'competitor' ? 'أرخص منافس' : 'سعرك'}
                                </span>
                              </div>
                              {directComparisonResult.seriesMeta.map((meta) => {
                                const val = pt[meta.sku];
                                if (typeof val !== 'number') return null;
                                return (
                                  <div key={meta.sku} className="flex items-center justify-between gap-4">
                                    <span className="flex items-center gap-1.5 text-slate-200 truncate max-w-[140px]">
                                      <span
                                        className="w-2 h-2 rounded-sm shrink-0"
                                        style={{ backgroundColor: meta.color }}
                                        aria-hidden="true"
                                      />
                                      <span className="truncate">{meta.title}</span>
                                    </span>
                                    <span className="font-mono tabular-nums font-black text-white">
                                      {val.toLocaleString()} {currency}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                      {directComparisonResult.seriesMeta.map((meta) => (
                        <Line
                          key={meta.sku}
                          type="monotone"
                          dataKey={meta.sku}
                          name={meta.title}
                          stroke={meta.color}
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: meta.color, stroke: '#0f172a', strokeWidth: 2 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        ) : (
        /* Summary Metrics & Interactive Series Controls */
        selectedComparisonItem ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-grow">
                <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">أعلى سعر خلال الفترة</span>
                  <strong className="text-sm font-mono tabular-nums text-white font-black">
                    {trendStats.maxMerchant.toLocaleString()} {currency}
                  </strong>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">أدنى سعر خلال الفترة</span>
                  <strong className="text-sm font-mono tabular-nums text-amber-400 font-black">
                    {trendStats.minMerchant.toLocaleString()} {currency}
                  </strong>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">متوسط أرخص منافس</span>
                  <strong className="text-sm font-mono tabular-nums text-emerald-400 font-black">
                    {trendStats.avgCompetitor.toLocaleString()} {currency}
                  </strong>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">التغير خلال الفترة</span>
                  <strong
                    className={`text-sm font-mono tabular-nums font-black ${
                      trendStats.changePercent > 0
                        ? 'text-red-400'
                        : trendStats.changePercent < 0
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {trendStats.changePercent > 0 ? `+${trendStats.changePercent}%` : `${trendStats.changePercent}%`}
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  aria-pressed={showMerchantSeries}
                  onClick={() => setShowMerchantSeries((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    showMerchantSeries
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  سعرك
                </button>
                <button
                  type="button"
                  aria-pressed={showCompetitorSeries}
                  onClick={() => setShowCompetitorSeries((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    showCompetitorSeries
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  أرخص منافس
                </button>
                <button
                  type="button"
                  aria-pressed={showCostReference}
                  onClick={() => setShowCostReference((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    showCostReference
                      ? 'bg-sky-500/15 border-sky-500/50 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  حد التكلفة ({selectedComparisonItem.costPrice.toLocaleString()})
                </button>
                <button
                  type="button"
                  aria-pressed={showProjection}
                  onClick={() => setShowProjection((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    showProjection
                      ? 'bg-violet-500/20 border-violet-400/60 text-violet-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
                  <span>التوقع المستقبلي (Trend)</span>
                </button>
              </div>
            </div>

            {showProjection && projectionResult && (
              <div
                data-testid="trend-projection-summary"
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-violet-950/25 border border-violet-500/30"
              >
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-5 border-t-2 border-dashed border-violet-400" aria-hidden="true" />
                    <span className="text-violet-200 font-bold">
                      توقع السعر بعد {projectionDays} أيام (انحدار خطي):
                    </span>
                    <strong className="font-mono tabular-nums text-white font-black">
                      {projectionResult.projectedEndMerchantPrice.toLocaleString()} {currency}
                    </strong>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                        projectionResult.trendDirection === 'up'
                          ? 'bg-red-500/15 text-red-300'
                          : projectionResult.trendDirection === 'down'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {projectionResult.projectedChangePercent > 0
                        ? `+${projectionResult.projectedChangePercent}%`
                        : `${projectionResult.projectedChangePercent}%`}
                    </span>
                  </div>

                  <div className="text-slate-400">
                    معدل التغير اليومي:{' '}
                    <span className="font-mono text-slate-200 font-bold">
                      {projectionResult.slopePerDay > 0 ? `+${projectionResult.slopePerDay}` : projectionResult.slopePerDay} {currency}/يوم
                    </span>
                  </div>

                  <div className="text-slate-400">
                    توقع أرخص منافس:{' '}
                    <span className="font-mono text-emerald-300 font-bold">
                      {projectionResult.projectedEndCompetitorPrice.toLocaleString()} {currency}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 shrink-0" role="group" aria-label="أفق التوقع المستقبلي">
                  {([7, 14] as const).map((horizon) => (
                    <button
                      key={horizon}
                      type="button"
                      onClick={() => setProjectionDays(horizon)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        projectionDays === horizon
                          ? 'bg-violet-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      +{horizon} يوم
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full h-[300px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="merchantPriceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="dateLabel"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    minTickGap={18}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={['auto', 'auto']}
                    width={56}
                    tickFormatter={(val: number) => `${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const pt = payload[0]?.payload as PriceTrendChartPoint | undefined;
                      if (!pt) return null;
                      const displayMerchant = pt.isProjected ? pt.projectedMerchantPrice : pt.merchantPrice;
                      const displayCompetitor = pt.isProjected ? pt.projectedCompetitorPrice : pt.competitorPrice;
                      return (
                        <div
                          dir="rtl"
                          className="rounded-xl bg-slate-950 border border-slate-700 p-3 shadow-xl text-xs space-y-1.5"
                        >
                          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>{pt.fullDate}</span>
                            </span>
                            {pt.isProjected && (
                              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                                توقع إحصائي
                              </span>
                            )}
                          </div>
                          {showMerchantSeries && displayMerchant !== null && (
                            <div className="flex items-center justify-between gap-4">
                              <span className={pt.isProjected ? 'text-violet-300' : 'text-amber-300'}>
                                {pt.isProjected ? 'سعرك المتوقع:' : 'سعرك:'}
                              </span>
                              <span className="font-mono tabular-nums font-black text-white">
                                {displayMerchant.toLocaleString()} {currency}
                              </span>
                            </div>
                          )}
                          {showCompetitorSeries && displayCompetitor !== null && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-emerald-300">
                                {pt.isProjected ? 'أرخص منافس متوقع:' : 'أرخص منافس:'}
                              </span>
                              <span className="font-mono tabular-nums font-black text-emerald-400">
                                {displayCompetitor.toLocaleString()} {currency}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80">
                            <span className="text-slate-400">الفجوة السعرية:</span>
                            <span
                              className={`font-mono tabular-nums font-bold ${
                                pt.priceGap > 0 ? 'text-red-400' : pt.priceGap < 0 ? 'text-sky-400' : 'text-slate-300'
                              }`}
                            >
                              {pt.priceGap > 0 ? `+${pt.priceGap}` : pt.priceGap} {currency}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  {showProjection && todayBoundaryLabel && (
                    <ReferenceLine
                      x={todayBoundaryLabel}
                      stroke="#a78bfa"
                      strokeDasharray="3 3"
                      label={{
                        value: 'اليوم · بدء التوقع',
                        position: 'insideTopLeft',
                        fill: '#c4b5fd',
                        fontSize: 10,
                      }}
                    />
                  )}
                  {showCostReference && (
                    <ReferenceLine
                      y={selectedComparisonItem.costPrice}
                      stroke="#38bdf8"
                      strokeDasharray="4 4"
                      label={{
                        value: `التكلفة ${selectedComparisonItem.costPrice}`,
                        position: 'insideTopRight',
                        fill: '#38bdf8',
                        fontSize: 11,
                      }}
                    />
                  )}
                  {showMerchantSeries && (
                    <Area
                      type="monotone"
                      dataKey="merchantPrice"
                      name="سعرك"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fill="url(#merchantPriceFill)"
                      connectNulls={false}
                      activeDot={{ r: 5, fill: '#fbbf24', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  )}
                  {showCompetitorSeries && (
                    <Line
                      type="monotone"
                      dataKey="competitorPrice"
                      name="أرخص منافس"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                      activeDot={{ r: 4, fill: '#34d399', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  )}
                  {showProjection && showMerchantSeries && (
                    <Line
                      type="monotone"
                      dataKey="projectedMerchantPrice"
                      name="توقع سعرك (Trend)"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      dot={{ r: 2.5, fill: '#c084fc', strokeWidth: 0 }}
                      connectNulls={false}
                      activeDot={{ r: 5, fill: '#c084fc', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  )}
                  {showProjection && showCompetitorSeries && (
                    <Line
                      type="monotone"
                      dataKey="projectedCompetitorPrice"
                      name="توقع أرخص منافس"
                      stroke="#34d399"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      connectNulls={false}
                      activeDot={{ r: 4, fill: '#6ee7b7', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            لا توجد بيانات منتجات متاحة لعرض المخطط البياني حالياً.
          </div>
        )
        )}
      </div>

      {/* Dedicated D3.js 30-Day Historical Price Trend & Pattern Analysis Chart */}
      {selectedComparisonItem && historical30DaySeries.length > 0 && (
        <D3PriceTrendChart
          data={historical30DaySeries}
          productTitle={selectedComparisonItem.title}
          sku={selectedComparisonItem.sku}
          costPrice={selectedComparisonItem.costPrice}
          currency={currency}
          competitorName={selectedComparisonItem.competitorName}
        />
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800" role="region" aria-label="أدوات البحث والفلترة">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0" role="tablist" aria-label="فلتر حالة التنافسية">
          <button
            role="tab"
            aria-selected={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 focus:ring-2 focus:ring-amber-500 outline-none ${
              filterStatus === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            الكل ({comparisonItems.length})
          </button>
          <button
            role="tab"
            aria-selected={filterStatus === 'higher'}
            onClick={() => setFilterStatus('higher')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 focus:ring-2 focus:ring-red-500 outline-none ${
              filterStatus === 'higher' ? 'bg-red-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            أعلى من المنافس ({higherCount})
          </button>
          <button
            role="tab"
            aria-selected={filterStatus === 'lower'}
            onClick={() => setFilterStatus('lower')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 focus:ring-2 focus:ring-sky-500 outline-none ${
              filterStatus === 'lower' ? 'bg-sky-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            أقل من المنافس ({lowerCount})
          </button>
          <button
            role="tab"
            aria-selected={filterStatus === 'optimal'}
            onClick={() => setFilterStatus('optimal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 focus:ring-2 focus:ring-emerald-500 outline-none ${
              filterStatus === 'optimal' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            مثالي ({optimalCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72" role="search">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" aria-hidden="true" />
          <input
            type="text"
            aria-label="بحث برمز SKU أو اسم المنتج أو المنافس"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برمز SKU أو اسم المنتج أو المنافس..."
            className="w-full pl-4 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40" tabIndex={0} role="region" aria-label="جدول مقارنة الأسعار والفجوات للمنتجات">
        <table className="w-full text-right text-xs" role="table" aria-labelledby="price-comparison-title">
          <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 font-mono" role="rowgroup">
            <tr role="row">
              <th className="p-3.5" scope="col">المنتج ورمز SKU</th>
              <th className="p-3.5" scope="col">سعرك الحالي</th>
              <th className="p-3.5" scope="col">أرخص سعر للمنافس</th>
              <th className="p-3.5" scope="col">الفجوة السعرية</th>
              <th className="p-3.5" scope="col">حالة التنافسية</th>
              <th className="p-3.5" scope="col">الإجراء والتوصية</th>
              <th className="p-3.5 text-center" scope="col">إجراءات سريعة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60" role="rowgroup">
            {filteredItems.length === 0 ? (
              <tr role="row">
                <td colSpan={7} className="text-center py-12 text-slate-500" role="cell">
                  لا توجد منتجات مطابقة لنتائج البحث أو الفلتر الحالي.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const statusBadge = 
                  item.status === 'higher' ? (
                    <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-bold text-[11px] flex items-center gap-1 w-fit" role="status">
                      <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> أعلى من السوق
                    </span>
                  ) : item.status === 'lower' ? (
                    <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-lg font-bold text-[11px] flex items-center gap-1 w-fit" role="status">
                      <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" /> أقل من السوق
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold text-[11px] flex items-center gap-1 w-fit" role="status">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> تنافسي مثالي
                    </span>
                  );

                const isSelectedRow =
                  chartMode === 'direct'
                    ? directCompareSkus.includes(item.sku)
                    : selectedComparisonItem?.sku === item.sku;

                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      if (chartMode === 'direct') {
                        toggleDirectCompareSku(item.sku);
                      } else {
                        setSelectedSku(item.sku);
                      }
                    }}
                    aria-selected={isSelectedRow}
                    className={`cursor-pointer transition ${
                      isSelectedRow ? 'bg-amber-500/10' : 'hover:bg-slate-900/60'
                    }`}
                    role="row"
                  >
                    <td className="p-3.5" role="cell">
                      <p className="font-bold text-white line-clamp-1">{item.title}</p>
                      <span className="text-[10px] text-amber-400 font-mono">SKU: {item.sku}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white" role="cell">
                      {item.merchantPrice.toLocaleString()} {currency}
                    </td>
                    <td className="p-3.5 font-mono" role="cell">
                      <div className="font-bold text-emerald-400">{item.competitorPrice.toLocaleString()} {currency}</div>
                      <div className="text-[10px] text-slate-400">{item.competitorName}</div>
                    </td>
                    <td className="p-3.5 font-mono" role="cell">
                      <span className={`font-bold ${item.priceGapAmount > 0 ? 'text-red-400' : item.priceGapAmount < 0 ? 'text-sky-400' : 'text-slate-300'}`}>
                        {item.priceGapAmount > 0 ? `+${item.priceGapAmount}` : item.priceGapAmount} {currency} ({item.priceGapPercent}%)
                      </span>
                    </td>
                    <td className="p-3.5" role="cell">
                      {statusBadge}
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-xs leading-relaxed text-[11px]" role="cell">
                      {item.recommendationReason}
                    </td>
                    <td className="p-3.5 text-center" role="cell">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSku(item.sku);
                          applyRecommended(item.sku, item.recommendedPrice);
                        }}
                        aria-label={`تطبيق السعر المقترح ${item.recommendedPrice} ${currency} للمنتج ${item.sku}`}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px] shadow transition flex items-center gap-1 mx-auto active:scale-95 focus:ring-2 focus:ring-slate-950 outline-none"
                      >
                        <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>تطبيق السعر ({item.recommendedPrice})</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedTraderForStores && (
        <CompetingStoresManagerModal
          trader={selectedTraderForStores}
          isOpen={Boolean(selectedTraderForStores)}
          onClose={() => setSelectedTraderForStores(null)}
          onShowToast={onShowToast}
          onStoresUpdated={() => {
            setCheaperAlerts(getAllCheaperCompetitorAlerts(tradersList));
            setCompetingStoresTick((n) => n + 1);
          }}
        />
      )}
    </section>
  );
}
