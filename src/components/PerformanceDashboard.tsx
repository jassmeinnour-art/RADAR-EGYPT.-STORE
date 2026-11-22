import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Sparkles,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Award,
  Download,
  FileText,
  Package,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { MarketTrendsAnalysis } from './MarketTrendsAnalysis';
import {
  exportFinancialReportToPDF,
  exportProductsListToPDF,
  PdfProductRow,
} from '../utils/pdfExporter';
import {
  supabase,
  isDemoOrOrphanProduct,
} from '../lib/supabase';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { DeferredViewportMount } from './DeferredViewportMount';
import { RADAR_PULL_TO_REFRESH_EVENT } from './PullToRefresh';

interface PerformanceDashboardProps {
  currency?: string;
  catalogNetProfitTotal?: number;
  products?: PdfProductRow[];
  onShowToast?: (msg: string) => void;
}

interface DailyMetricsPoint {
  dateStr: string;
  dayLabel: string;
  revenueEGP: number;
  netProfitEGP: number;
  profitMarginPercent: number;
  salesGrowthPercent: number;
  ordersCount: number;
  buyBoxWinRatePercent: number | null;
}

function safeFormatSupabaseError(err: any): string {
  if (!err) return 'حدث خطأ غير معروف أثناء الاتصال بقاعدة البيانات';
  if (typeof err === 'string') return err;
  const msg = String(err.message || err.error_description || err.error || '').trim();
  const details = String(err.details || '').trim();
  return [msg, details && !msg.includes(details) ? details : ''].filter(Boolean).join(' — ') || 'Supabase Error';
}

function getInvoiceAmount(inv: any): number {
  if (!inv || typeof inv !== 'object') return 0;
  const direct = inv.total_amount ?? inv.total ?? inv.amount;
  if (direct !== undefined && direct !== null && !Number.isNaN(Number(direct))) {
    return Number(direct);
  }
  const price = Number(inv.price ?? 0) || 0;
  const qty = Number(inv.quantity ?? inv.sold_quantity ?? 1) || 1;
  return price * qty;
}

function getInvoiceProfit(inv: any): number {
  if (!inv || typeof inv !== 'object') return 0;
  const directProfit = inv.net_profit ?? inv.profit;
  if (directProfit !== undefined && directProfit !== null && !Number.isNaN(Number(directProfit))) {
    return Number(directProfit);
  }
  const amount = getInvoiceAmount(inv);
  const cost = Number(inv.cost ?? inv.cost_price ?? 0) || 0;
  if (cost > 0) {
    return amount - cost;
  }
  return amount;
}

function getProductSoldQty(p: any): number {
  const sold = Number(p?.sold_quantity);
  if (Number.isFinite(sold) && sold > 0) return sold;
  return 1;
}

function getProductCost(p: any): number {
  return Number(p?.cost_price ?? p?.costPrice ?? p?.cost ?? p?.wholesale_price ?? 0) || 0;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  currency = 'ج.م',
  products: propProducts,
  onShowToast,
}) => {
  const { user, profile } = useAuth();
  const { isPerformanceMode } = usePerformanceMode();
  const activeEmail = String(user?.email || profile?.email || '').trim().toLowerCase();

  const [activeChartView, setActiveChartView] = useState<'overview' | 'profit_margin' | 'orders_growth'>('overview');
  const [dateRange, setDateRange] = useState<'30d' | '14d' | '7d'>('30d');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState<'financial' | 'products' | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbInvoices, setDbInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isExportMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExportMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExportMenuOpen]);

  const loadReportsData = useCallback(async () => {
    if (Array.isArray(propProducts)) {
      setDbProducts(propProducts);
    }

    setIsLoading(true);
    setFetchErrorMessage(null);
    try {
      const [productsRes, invoicesRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('invoices').select('*'),
      ]);

      const errors: string[] = [];
      if (productsRes.error) {
        console.error('[PerformanceDashboard] Supabase products error:', productsRes.error);
        errors.push(safeFormatSupabaseError(productsRes.error));
      }
      if (invoicesRes.error) {
        console.error('[PerformanceDashboard] Supabase invoices error:', invoicesRes.error);
        errors.push(safeFormatSupabaseError(invoicesRes.error));
      }

      if (errors.length > 0 && !Array.isArray(propProducts)) {
        setFetchErrorMessage(errors.join(' | '));
      }

      const rawProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
      const cleanProducts = rawProducts.filter((p: any) => p && !isDemoOrOrphanProduct(p));

      if (!Array.isArray(propProducts)) {
        setDbProducts(cleanProducts);
      } else if (cleanProducts.length > 0) {
        setDbProducts(cleanProducts);
      }

      const rawInvoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
      setDbInvoices(rawInvoices);
    } catch (err: any) {
      console.error('[PerformanceDashboard] Failed to load reports from Supabase:', err);
      if (!Array.isArray(propProducts)) {
        setFetchErrorMessage(safeFormatSupabaseError(err));
        setDbProducts([]);
      }
      setDbInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, [propProducts, activeEmail]);

  useEffect(() => {
    // Only skip automatic query when neither authenticated nor passed explicit products in isolated tests
    if (!activeEmail && Array.isArray(propProducts)) {
      setDbProducts(propProducts);
      setDbInvoices([]);
      return;
    }
    if (activeEmail && activeEmail !== OWNER_EMAIL) {
      setDbProducts([]);
      setDbInvoices([]);
      return;
    }
    loadReportsData();
    const handleRefresh = () => {
      loadReportsData();
    };
    window.addEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
    return () => window.removeEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
  }, [loadReportsData, activeEmail, propProducts]);

  const effectiveProducts = useMemo(() => {
    if (Array.isArray(propProducts) && dbProducts.length === 0) {
      return propProducts;
    }
    return dbProducts;
  }, [propProducts, dbProducts]);

  const rangeDays = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;

  const filteredInvoices = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (rangeDays - 1));
    const cutoffMs = cutoff.getTime();

    return [...dbInvoices]
      .filter((inv) => {
        const rawDate = inv?.created_at || inv?.invoice_date || inv?.date;
        if (!rawDate) return true;
        const ms = Date.parse(String(rawDate));
        if (!Number.isFinite(ms)) return true;
        return ms >= cutoffMs;
      })
      .sort((a, b) => {
        const msA = Date.parse(String(a?.created_at || a?.invoice_date || a?.date || '')) || 0;
        const msB = Date.parse(String(b?.created_at || b?.invoice_date || b?.date || '')) || 0;
        return msA - msB;
      });
  }, [dbInvoices, rangeDays]);

  // Build real chart series from Supabase `invoices` sorted chronologically
  const chartData = useMemo<DailyMetricsPoint[]>(() => {
    if (filteredInvoices.length === 0) return [];

    const grouped = new Map<
      string,
      { revenue: number; profit: number; orders: number; timestampMs: number }
    >();

    for (const inv of filteredInvoices) {
      const rawDate = inv?.created_at || inv?.invoice_date || inv?.date;
      const parsedMs = rawDate ? Date.parse(String(rawDate)) : Date.now();
      const safeDate = Number.isFinite(parsedMs) ? new Date(parsedMs) : new Date();
      const dateStr = safeDate.toISOString().slice(0, 10);

      const amount = getInvoiceAmount(inv);
      const profit = getInvoiceProfit(inv);

      const prev = grouped.get(dateStr) || {
        revenue: 0,
        profit: 0,
        orders: 0,
        timestampMs: safeDate.getTime(),
      };
      grouped.set(dateStr, {
        revenue: prev.revenue + amount,
        profit: prev.profit + profit,
        orders: prev.orders + 1,
        timestampMs: Math.min(prev.timestampMs, safeDate.getTime()),
      });
    }

    const sortedEntries = Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));

    return sortedEntries.map(([dateStr, agg], idx) => {
      const d = new Date(`${dateStr}T12:00:00`);
      const dayLabel = Number.isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
      const prevRev = idx > 0 ? sortedEntries[idx - 1][1].revenue : agg.revenue;
      const growth =
        idx > 0 && prevRev > 0
          ? Math.round(((agg.revenue - prevRev) / prevRev) * 1000) / 10
          : 0;
      const margin = agg.revenue > 0 ? Math.round((agg.profit / agg.revenue) * 1000) / 10 : 0;

      return {
        dateStr,
        dayLabel,
        revenueEGP: Math.round(agg.revenue),
        netProfitEGP: Math.round(agg.profit),
        profitMarginPercent: margin,
        salesGrowthPercent: growth,
        ordersCount: agg.orders,
        buyBoxWinRatePercent: null,
      };
    });
  }, [filteredInvoices]);

  // Aggregate Real KPI Metrics strictly from Supabase `products` + `invoices`
  const metrics = useMemo(() => {
    const productsRevenue = effectiveProducts.reduce((sum, p) => {
      const price = Number(p?.price) || 0;
      const qty = getProductSoldQty(p);
      return sum + price * qty;
    }, 0);

    const invoicesRevenue = filteredInvoices.reduce(
      (sum, inv) => sum + getInvoiceAmount(inv),
      0
    );

    const productsProfit = effectiveProducts.reduce((sum, p) => {
      const price = Number(p?.price) || 0;
      const cost = getProductCost(p);
      const qty = getProductSoldQty(p);
      return sum + (price - cost) * qty;
    }, 0);

    const invoicesProfit = filteredInvoices.reduce(
      (sum, inv) => sum + getInvoiceProfit(inv),
      0
    );

    const totalRev = Math.round(productsRevenue + invoicesRevenue);
    const totalProfit = Math.round(productsProfit + invoicesProfit);
    const totalOrders = filteredInvoices.length;
    const avgMargin = totalRev > 0 ? Math.round((totalProfit / totalRev) * 1000) / 10 : 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;

    let avgGrowth = 0;
    if (chartData.length >= 2) {
      const mid = Math.floor(chartData.length / 2);
      const firstHalf = chartData.slice(0, mid).reduce((s, d) => s + d.revenueEGP, 0);
      const secondHalf = chartData.slice(mid).reduce((s, d) => s + d.revenueEGP, 0);
      avgGrowth = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 1000) / 10 : 0;
    }

    // Buy Box Win Rate: only show a real percentage if real buybox data exists; otherwise null -> "-"
    const productsWithBuyBox = effectiveProducts.filter(
      (p) =>
        (typeof p?.buybox_win_rate === 'number' && Number.isFinite(p.buybox_win_rate)) ||
        (Number(p?.buybox_price) > 0 && Number(p?.price) > 0)
    );

    let avgBuyBoxWin: number | null = null;
    if (productsWithBuyBox.length > 0) {
      const explicitRates = productsWithBuyBox
        .map((p) => (typeof p?.buybox_win_rate === 'number' ? p.buybox_win_rate : null))
        .filter((v): v is number => v !== null);

      if (explicitRates.length > 0) {
        avgBuyBoxWin = Math.round(
          explicitRates.reduce((s, v) => s + v, 0) / explicitRates.length
        );
      } else {
        const wonCount = productsWithBuyBox.filter(
          (p) => Number(p.price) <= Number(p.buybox_price)
        ).length;
        avgBuyBoxWin = Math.round((wonCount / productsWithBuyBox.length) * 100);
      }
    }

    return {
      totalRev,
      totalProfit,
      totalOrders,
      avgMargin,
      avgOrderValue,
      avgGrowth,
      avgBuyBoxWin,
    };
  }, [effectiveProducts, filteredInvoices, chartData]);

  const resolveProductsForPdf = (): PdfProductRow[] => {
    return effectiveProducts.map((p: any) => ({
      sku: p.sku || p.id || '-',
      title: p.title || 'منتج',
      category: p.category,
      price: Number(p.price ?? 0),
      costPrice: getProductCost(p),
      competitorPrice: Number(p.competitor_price ?? p.competitorPrice ?? p.buybox_price ?? 0),
      stock: typeof p.stock === 'number' ? p.stock : undefined,
    }));
  };

  const handleExportFinancialPdf = () => {
    setIsExportingPdf('financial');
    setIsExportMenuOpen(false);
    try {
      const periodLabel =
        dateRange === '7d' ? 'آخر 7 أيام' : dateRange === '14d' ? 'آخر 14 يوماً' : 'آخر 30 يوماً';
      exportFinancialReportToPDF({
        title: 'التقرير المالي وأداء المبيعات',
        periodLabel,
        currency,
        totalRevenue: metrics.totalRev,
        totalNetProfit: metrics.totalProfit,
        avgMarginPercent: metrics.avgMargin,
        totalOrders: metrics.totalOrders,
        avgOrderValue: metrics.avgOrderValue,
        salesGrowthPercent: metrics.avgGrowth,
        productsCount: effectiveProducts.length,
        avgBuyBoxWinPercent: metrics.avgBuyBoxWin,
        rows: chartData.map((d) => ({
          dateStr: d.dateStr,
          revenueEGP: d.revenueEGP,
          netProfitEGP: d.netProfitEGP,
          profitMarginPercent: d.profitMarginPercent,
          ordersCount: d.ordersCount,
          buyBoxWinRatePercent: d.buyBoxWinRatePercent ?? undefined,
        })),
      });
      onShowToast?.('تم تصدير التقرير المالي بصيغة PDF بنجاح');
    } catch (err: any) {
      console.error('PDF export error:', err);
      onShowToast?.(err?.message || 'تعذر تصدير التقرير المالي بصيغة PDF');
    } finally {
      setIsExportingPdf(null);
    }
  };

  const handleExportProductsPdf = () => {
    setIsExportingPdf('products');
    setIsExportMenuOpen(false);
    try {
      const items = resolveProductsForPdf();
      exportProductsListToPDF(items, {
        currency,
        title: 'تقرير قائمة المنتجات والتسعير',
      });
      onShowToast?.(`تم تصدير قائمة المنتجات (${items.length} منتج) بصيغة PDF بنجاح`);
    } catch (err: any) {
      console.error('Products PDF export error:', err);
      onShowToast?.(err?.message || 'تعذر تصدير قائمة المنتجات بصيغة PDF');
    } finally {
      setIsExportingPdf(null);
    }
  };

  const activeSeriesKey =
    activeChartView === 'overview'
      ? 'revenueEGP'
      : activeChartView === 'profit_margin'
      ? 'profitMarginPercent'
      : 'ordersCount';

  const activeSeriesColor =
    activeChartView === 'overview'
      ? '#f59e0b'
      : activeChartView === 'profit_margin'
      ? '#38bdf8'
      : '#10b981';

  const activeSeriesLabel =
    activeChartView === 'overview'
      ? `الإيرادات (${currency})`
      : activeChartView === 'profit_margin'
      ? 'هامش الربح %'
      : 'عدد الطلبات';

  return (
    <div
      className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-8 font-['Cairo',sans-serif]"
      dir="rtl"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                لوحة أداء المبيعات وهامش الربح
              </h2>
              <p className="text-xs text-slate-400">
                مؤشرات حقيقية محسوبة مباشرة من جداول المنتجات والفواتير في Supabase · آخر {rangeDays} يوماً
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Selector, Refresh, Export PDF & Market Trends Jump */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={loadReportsData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          <div className="relative inline-flex items-stretch" ref={exportMenuRef}>
            <button
              type="button"
              disabled={isExportingPdf !== null}
              onClick={handleExportFinancialPdf}
              className="min-h-[40px] px-4 py-2 rounded-r-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>{isExportingPdf === 'financial' ? 'جاري التصدير...' : 'تصدير التقرير'}</span>
            </button>
            <button
              type="button"
              disabled={isExportingPdf !== null}
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              aria-label="خيارات التصدير الإضافية"
              aria-haspopup="menu"
              aria-expanded={isExportMenuOpen}
              className="min-h-[40px] px-2.5 py-2 rounded-l-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white border-r border-emerald-500/40 flex items-center justify-center shadow-md transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {isExportMenuOpen && (
              <div
                role="menu"
                aria-label="خيارات تصدير PDF"
                className="absolute left-0 sm:right-0 top-full mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-30 space-y-1"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleExportFinancialPdf}
                  className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-100 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>تصدير التقرير المالي (PDF)</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleExportProductsPdf}
                  className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-100 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Package className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>تصدير قائمة المنتجات (PDF)</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              document.getElementById('market-trends-analysis-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>تحليل اتجاهات السوق</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: '30d', label: 'الـ 30 يوماً الماضية' },
              { id: '14d', label: 'آخر 14 يوماً' },
              { id: '7d', label: 'آخر 7 أيام' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDateRange(item.id as '30d' | '14d' | '7d')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  dateRange === item.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {fetchErrorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>خطأ في جلب بيانات التقارير من Supabase: {fetchErrorMessage}</span>
          </div>
          <button
            type="button"
            onClick={loadReportsData}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-white cursor-pointer shrink-0"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* KPI Highlight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div
          data-testid="reports-kpi-sales"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>إجمالي المبيعات</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {metrics.totalRev.toLocaleString()} <span className="text-xs text-slate-400 font-bold">{currency}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {metrics.totalOrders > 0
                ? `نمو الفترة: ${metrics.avgGrowth > 0 ? `+${metrics.avgGrowth}%` : `${metrics.avgGrowth}%`}`
                : `${effectiveProducts.length} منتج · ${filteredInvoices.length} فاتورة`}
            </span>
          </div>
        </div>

        {/* Net Profit */}
        <div
          data-testid="reports-kpi-profit"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>صافي الربح</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tabular-nums">
            {metrics.totalProfit.toLocaleString()} <span className="text-xs text-emerald-300 font-bold">{currency}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            متوسط الهامش الصافي: <strong className="font-mono text-white tabular-nums">{metrics.avgMargin}%</strong>
          </div>
        </div>

        {/* Total Orders */}
        <div
          data-testid="reports-kpi-orders"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>إجمالي الطلبات</span>
            <ShoppingCart className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {metrics.totalOrders.toLocaleString()} <span className="text-xs text-slate-400 font-bold">طلب</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            متوسط قيمة الطلب: <strong className="font-mono text-sky-300 tabular-nums">{metrics.avgOrderValue.toLocaleString()} {currency}</strong>
          </div>
        </div>

        {/* Buy Box Win Rate */}
        <div
          data-testid="reports-kpi-buybox"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>معدل الفوز بالـ Buy Box</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono tabular-nums">
            {metrics.avgBuyBoxWin !== null ? `${metrics.avgBuyBoxWin}%` : '-'}
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            {metrics.avgBuyBoxWin !== null
              ? 'محسوب من أسعار المنتجات ومنافسة السوق الفعلية'
              : 'لا توجد بيانات Buy Box مسجلة بعد'}
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Diagram Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
        {/* Chart View Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white">
              الرسم البياني التفاعلي لحركة المبيعات والأرباح
            </h3>
            <p className="text-xs text-slate-400">
              تطور الإيرادات وهامش الربح والطلبات من الفواتير الحقيقية المرتبة حسب التاريخ
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveChartView('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeChartView === 'overview'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              نظرة شاملة
            </button>
            <button
              type="button"
              onClick={() => setActiveChartView('profit_margin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeChartView === 'profit_margin'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              هامش الربح %
            </button>
            <button
              type="button"
              onClick={() => setActiveChartView('orders_growth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeChartView === 'orders_growth'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الطلبات
            </button>
          </div>
        </div>

        {/* Real Invoices Chart or Empty State */}
        {chartData.length === 0 ? (
          <div
            data-testid="reports-chart-empty"
            className="h-72 w-full rounded-2xl bg-slate-950/80 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-2"
          >
            <ShoppingCart className="w-10 h-10 text-slate-600" aria-hidden="true" />
            <p className="text-sm font-black text-white">لا توجد بيانات بعد</p>
            <p className="text-xs font-bold text-slate-400">
              لا توجد مبيعات بعد - أضف منتجات وابدأ البيع
            </p>
          </div>
        ) : (
          <div
            data-testid="reports-invoices-chart"
            className="h-80 sm:h-96 w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800"
            dir="ltr"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="reportsRealSeriesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeSeriesColor} stopOpacity={0.32} />
                    <stop offset="95%" stopColor={activeSeriesColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={56}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const pt = payload[0]?.payload as DailyMetricsPoint | undefined;
                    if (!pt) return null;
                    return (
                      <div
                        dir="rtl"
                        className="rounded-xl bg-slate-950 border border-slate-700 p-3 shadow-xl text-xs space-y-1.5"
                      >
                        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                          {pt.dateStr}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-amber-300">المبيعات:</span>
                          <span className="font-mono font-black text-white tabular-nums">
                            {pt.revenueEGP.toLocaleString()} {currency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-emerald-300">صافي الربح:</span>
                          <span className="font-mono font-black text-emerald-400 tabular-nums">
                            {pt.netProfitEGP.toLocaleString()} {currency} ({pt.profitMarginPercent}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sky-300">الطلبات:</span>
                          <span className="font-mono font-bold text-white tabular-nums">
                            {pt.ordersCount}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeSeriesKey}
                  name={activeSeriesLabel}
                  stroke={activeSeriesColor}
                  strokeWidth={2.5}
                  isAnimationActive={!isPerformanceMode}
                  fill="url(#reportsRealSeriesFill)"
                  activeDot={{ r: 5, fill: activeSeriesColor, stroke: '#0f172a', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="text-[11px] text-slate-400 text-center leading-relaxed border-t border-slate-800/80 pt-3">
          تعكس هذه المؤشرات البيانات الفعلية المسجلة في جداول المنتجات والفواتير عبر Supabase فقط.
        </p>
      </div>

      {/* Market Trends & Next-Period Price Forecast Analysis */}
      <DeferredViewportMount
        sectionId="reports-market-trends"
        minHeight={240}
        label="تحليل اتجاهات السوق والتوقعات"
      >
        <MarketTrendsAnalysis currency={currency} onShowToast={onShowToast} />
      </DeferredViewportMount>
    </div>
  );
};

export default PerformanceDashboard;
