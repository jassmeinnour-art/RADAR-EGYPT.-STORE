import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  Package, 
  Truck, 
  Bell, 
  TrendingUp, 
  ArrowLeft, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  RefreshCw,
  Store,
  Layers,
  Calendar,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dataCache } from '../utils/dataCache';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/navigation';
import { NotificationRadarCard } from './NotificationRadarCard';
import { DraggableHandle } from './DraggableHandle';
import { EmergencyErrorBanner } from './EmergencyLoginButton';
import { RADAR_PULL_TO_REFRESH_EVENT } from './PullToRefresh';
import { SmartPriceAlertsPanel } from './SmartPriceAlertsPanel';
import { MaintenanceModeToggleCard } from './MaintenanceModeControl';
import { ErrorBoundary } from './ErrorBoundary';

interface DashboardOverviewPageProps {
  onShowToast?: (msg: string) => void;
}

// Colors for Platform Distribution Chart
const PLATFORM_COLORS = [
  '#f59e0b', // Amazon (Amber)
  '#38bdf8', // Noon (Sky)
  '#10b981', // Jumia (Emerald)
  '#a855f7', // WooCommerce (Purple)
  '#ec4899', // Shopify (Pink)
  '#6366f1'  // Salla/Zid (Indigo)
];

// Sample/Fallback Monthly Sales Data
const DEFAULT_MONTHLY_SALES_DATA = [
  { month: 'يناير', sales: 42000, orders: 120, avgOrder: 350 },
  { month: 'فبراير', sales: 58000, orders: 165, avgOrder: 351 },
  { month: 'مارس', sales: 74000, orders: 210, avgOrder: 352 },
  { month: 'أبريل', sales: 69000, orders: 195, avgOrder: 353 },
  { month: 'مايو', sales: 88000, orders: 245, avgOrder: 359 },
  { month: 'يونيو', sales: 95000, orders: 270, avgOrder: 351 },
  { month: 'يوليو', sales: 112000, orders: 310, avgOrder: 361 },
  { month: 'أغسطس', sales: 128000, orders: 350, avgOrder: 365 },
  { month: 'سبتمبر', sales: 119000, orders: 330, avgOrder: 360 },
  { month: 'أكتوبر', sales: 135000, orders: 380, avgOrder: 355 },
  { month: 'نوفمبر', sales: 160000, orders: 440, avgOrder: 363 },
  { month: 'ديسمبر', sales: 185000, orders: 510, avgOrder: 362 },
];

// Sample Platform Distribution Data
const DEFAULT_PLATFORM_DISTRIBUTION_DATA = [
  { name: 'أمازون مصر (Amazon.eg)', value: 45, count: 18, color: '#f59e0b' },
  { name: 'نون مصر (Noon Egypt)', value: 25, count: 10, color: '#38bdf8' },
  { name: 'جوميا مصر (Jumia)', value: 15, count: 6, color: '#10b981' },
  { name: 'ووكومرس (WooCommerce)', value: 10, count: 4, color: '#a855f7' },
  { name: 'مباشر ومتجر خاص', value: 5, count: 2, color: '#6366f1' },
];

export default function DashboardOverviewPage({ onShowToast }: DashboardOverviewPageProps) {
  const { user, profile } = useAuth();
  const activeEmail = (profile?.email || user?.email || '').trim().toLowerCase();

  const [tradersCount, setTradersCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [tradersList, setTradersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);

  // Interactive Chart View States
  const [salesChartMetric, setSalesChartMetric] = useState<'sales' | 'orders'>('sales');
  const [salesTimeframe, setSalesTimeframe] = useState<'6M' | '1Y'>('1Y');
  const [platformChartType, setPlatformChartType] = useState<'pie' | 'bar'>('pie');

  // Component refs for Founder Mode resizing handles
  const headerBannerRef = useRef<HTMLDivElement>(null);
  const statTradersRef = useRef<HTMLDivElement>(null);
  const statProductsRef = useRef<HTMLDivElement>(null);
  const statSalesRef = useRef<HTMLDivElement>(null);
  const statRevenueRef = useRef<HTMLDivElement>(null);
  const salesChartPanelRef = useRef<HTMLDivElement>(null);
  const platformChartPanelRef = useRef<HTMLDivElement>(null);
  const tradersListCardRef = useRef<HTMLDivElement>(null);
  const alertsCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeEmail) {
      setTradersList([]);
      setTradersCount(0);
      setProductsCount(0);
      setSalesCount(0);
      setTotalRevenue(0);
      setRecentAlerts([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const OVERVIEW_CACHE_KEY = `dashboard_overview_snapshot_${activeEmail}_v2`;

    async function loadDashboardData(forceFresh = false) {
      const cached = forceFresh ? null : dataCache.getStale<{
        tradersList: any[];
        tradersCount: number;
        productsCount: number;
        salesCount: number;
        totalRevenue: number;
        recentAlerts: any[];
      }>(OVERVIEW_CACHE_KEY);

      if (cached && isMounted) {
        setTradersList(cached.data.tradersList);
        setTradersCount(cached.data.tradersCount);
        setProductsCount(cached.data.productsCount);
        setSalesCount(cached.data.salesCount);
        setTotalRevenue(cached.data.totalRevenue);
        setRecentAlerts(cached.data.recentAlerts);
        setIsLoading(false);
        if (cached.isFresh) return;
      }

      try {
        if (!cached) setIsLoading(true);
        const [tradersRes, productsRes, invoicesRes, notifRes] = await Promise.all([
          supabase.from('traders').select('id, seller_name, seller_id, platform').limit(20),
          supabase.from('products').select('id', { count: 'exact', head: false }).limit(1),
          supabase.from('invoices').select('id, total_amount').limit(100),
          supabase.from('notifications').select('id, message, created_at').order('created_at', { ascending: false }).limit(5),
        ]);

        if (!isMounted) return;

        if (tradersRes.error && productsRes.error) {
          setFetchError(true);
        } else {
          setFetchError(false);
        }

        const traders = Array.isArray(tradersRes.data) ? tradersRes.data : [];
        const tCount = traders.length;
        const pCount = typeof productsRes.count === 'number'
          ? productsRes.count
          : (Array.isArray(productsRes.data) ? productsRes.data.length : 0);
        const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
        const sCount = invoices.length;
        const revSum = invoices.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
        const alerts = Array.isArray(notifRes.data) ? notifRes.data : [];

        setTradersList(traders);
        setTradersCount(tCount);
        setProductsCount(pCount);
        setSalesCount(sCount);
        setTotalRevenue(revSum);
        setRecentAlerts(alerts);

        dataCache.set(OVERVIEW_CACHE_KEY, {
          tradersList: traders,
          tradersCount: tCount,
          productsCount: pCount,
          salesCount: sCount,
          totalRevenue: revSum,
          recentAlerts: alerts,
        });
      } catch (err) {
        console.warn('Dashboard data fetch fallback:', err);
        if (isMounted) setFetchError(true);
        if (!cached && isMounted) {
          setTradersCount(0);
          setProductsCount(0);
          setSalesCount(0);
          setTotalRevenue(0);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboardData();
    const handleRefresh = () => {
      loadDashboardData(true);
    };
    window.addEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
    };
  }, [activeEmail]);

  // Filtered sales chart data based on selected timeframe
  const displaySalesData = useMemo(() => {
    if (salesTimeframe === '6M') {
      return DEFAULT_MONTHLY_SALES_DATA.slice(6);
    }
    return DEFAULT_MONTHLY_SALES_DATA;
  }, [salesTimeframe]);

  return (
    <div className="w-full space-y-8 pb-20 font-['Cairo'] text-right" dir="rtl">
      
      {/* Header Banner */}
      {fetchError && (
        <EmergencyErrorBanner message="تعذر جلب بيانات لوحة التحكم — لا توجد بيانات متاحة حالياً." />
      )}
      <div ref={headerBannerRef} className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <DraggableHandle elementId="dashboard_header_banner" targetRef={headerBannerRef} position="bottom-left" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
            <Store className="w-4 h-4" />
            <span>لوحة التحكم الشاملة للتاجر الذكي</span>
          </div>
          <h1 className="text-3xl font-black text-white">ملخص العمليات والتجار والمبيعات</h1>
          <p className="text-slate-300 text-xs max-w-xl">
            متابعة شاملة لكل التجار، المنتجات، تحليلات Recharts للمبيعات الشهري وتوزيع منصات التجارة الإلكترونية.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate('/traders')}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <span>إدارة التجار</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/competitors')}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>رادار المنافسين</span>
          </button>
        </div>
      </div>

      {/* Founder Maintenance Mode Toggle */}
      <ErrorBoundary sectionName="dashboard-maintenance" sectionTitle="مفتاح وضع الصيانة" compact>
        <MaintenanceModeToggleCard onShowToast={onShowToast} />
      </ErrorBoundary>

      {/* Stats Grid */}
      <ErrorBoundary sectionName="dashboard-stats" sectionTitle="بطاقات الإحصائيات العامة">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div ref={statTradersRef} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-lg relative">
            <DraggableHandle elementId="stat_card_traders" targetRef={statTradersRef} position="bottom-right" />
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">نشط</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">إجمالي التجار المسجلين</span>
              <strong className="text-3xl font-black text-white font-mono mt-1 block">{tradersCount}</strong>
            </div>
          </div>

          <div ref={statProductsRef} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-lg relative">
            <DraggableHandle elementId="stat_card_products" targetRef={statProductsRef} position="bottom-right" />
            <div className="flex items-center justify-between">
              <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">محدث</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">إجمالي المنتجات</span>
              <strong className="text-3xl font-black text-white font-mono mt-1 block">{productsCount}</strong>
            </div>
          </div>

          <div ref={statSalesRef} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-lg relative">
            <DraggableHandle elementId="stat_card_sales" targetRef={statSalesRef} position="bottom-right" />
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">مبيعات</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">إجمالي المبيعات والفواتير</span>
              <strong className="text-3xl font-black text-white font-mono mt-1 block">{salesCount}</strong>
            </div>
          </div>

          <div ref={statRevenueRef} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-lg relative">
            <DraggableHandle elementId="stat_card_revenue" targetRef={statRevenueRef} position="bottom-right" />
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">مباشر</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">إيرادات المبيعات الكلية</span>
              <strong className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {totalRevenue.toLocaleString('ar-EG')} ج.م
              </strong>
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* ========================================================= */}
      {/* ANALYTICS SECTION (CHARTS)                                */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <ErrorBoundary sectionName="dashboard-sales-chart" sectionTitle="مخطط حجم المبيعات والطلبات الشهري">
          <div ref={salesChartPanelRef} className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between relative">
            <DraggableHandle elementId="dashboard_sales_chart_panel" targetRef={salesChartPanelRef} position="bottom-left" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">حجم المبيعات والطلبات الشهري</h3>
                  <p className="text-slate-400 text-xs">رسم بياني تفاعلي يوضح اتجاه المبيعات عبر الأشهر</p>
                </div>
              </div>

              {/* Interactive Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSalesChartMetric('sales')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      salesChartMetric === 'sales'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    القيمة (ج.م)
                  </button>
                  <button
                    onClick={() => setSalesChartMetric('orders')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      salesChartMetric === 'orders'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    الطلبات
                  </button>
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSalesTimeframe('6M')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      salesTimeframe === '6M' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    6M
                  </button>
                  <button
                    onClick={() => setSalesTimeframe('1Y')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      salesTimeframe === '1Y' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    1Y
                  </button>
                </div>
              </div>
            </div>

            {/* Pure Tailwind CSS Monthly Sales / Orders Chart */}
            <div className="w-full h-72 flex flex-col justify-end p-4 bg-slate-950/80 rounded-2xl border border-slate-800" dir="ltr">
              <div className="flex items-end justify-between gap-2 h-48">
                {displaySalesData.map((item, idx) => {
                  const maxVal = Math.max(...displaySalesData.map(d => salesChartMetric === 'sales' ? d.sales : d.orders));
                  const currentVal = salesChartMetric === 'sales' ? item.sales : item.orders;
                  const heightPct = Math.max(15, Math.round((currentVal / maxVal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="bg-slate-900 border border-slate-700 text-white text-[10px] rounded-lg px-2 py-1 shadow-xl whitespace-nowrap font-mono">
                          <div>{item.month}</div>
                          <div className="text-amber-400 font-bold">
                            {salesChartMetric === 'sales' ? `${item.sales.toLocaleString()} ج.م` : `${item.orders} طلب`}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 -mt-1" />
                      </div>
                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          salesChartMetric === 'sales' ? 'bg-amber-500 group-hover:bg-amber-400' : 'bg-sky-500 group-hover:bg-sky-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart Summary Footnote */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>معدل نمو المبيعات الشهرية: <strong className="text-emerald-400 font-mono">+18.5%</strong> مقارنة بالربع السابق</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Pure CSS Engine (بدون Recharts)</span>
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary sectionName="dashboard-platform-chart" sectionTitle="توزيع المنتجات حسب المنصة">
          <div ref={platformChartPanelRef} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between relative">
            <DraggableHandle elementId="dashboard_platform_chart_panel" targetRef={platformChartPanelRef} position="bottom-right" />
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">توزيع المنتجات حسب المنصة</h3>
                  <p className="text-slate-400 text-xs">نسب المنتجات المسجلة على المنصات</p>
                </div>
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <span className="px-3 py-1 text-xs font-bold text-sky-400">تحليل المنصات</span>
              </div>
            </div>

            {/* Pure Tailwind Platform Distribution Bars */}
            <div className="w-full space-y-3 py-2">
              {DEFAULT_PLATFORM_DISTRIBUTION_DATA.map((item, idx) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-bold">{item.name}</span>
                    <span className="text-slate-400 font-mono">{item.value}% ({item.count} منتج)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {DEFAULT_PLATFORM_DISTRIBUTION_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-1.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="truncate">
                    <span className="text-slate-300 block truncate text-[11px] font-bold">{item.name.split(' ')[0]}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{item.value}% ({item.count} منتج)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ErrorBoundary>

      </div>

      {/* Smart Price Drop & 10% Change Alerts */}
      <ErrorBoundary sectionName="dashboard-smart-alerts" sectionTitle="تنبيهات الأسعار وتغيرات الـ 10%">
        <SmartPriceAlertsPanel onShowToast={onShowToast} />
      </ErrorBoundary>

      {/* Traders & Recent Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Traders Summary Card */}
        <ErrorBoundary sectionName="dashboard-traders-list" sectionTitle="قائمة التجار النشطين">
          <div ref={tradersListCardRef} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl relative">
            <DraggableHandle elementId="dashboard_traders_list_card" targetRef={tradersListCardRef} position="bottom-left" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-white">قائمة التجار النشطين</h3>
              </div>
              <button
                onClick={() => navigate('/traders')}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>عرض كل التجار</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {tradersList.map((t, idx) => (
                <div key={t.id || idx} className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-bold">
                      {t.seller_name?.[0] || 'ت'}
                    </div>
                    <div>
                      <strong className="text-sm text-white block">{t.seller_name}</strong>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {t.seller_id || t.id || '-'} | {t.platform || 'amazon'}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold">
                    نشط
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ErrorBoundary>

        {/* Recent Alerts Card */}
        <ErrorBoundary sectionName="dashboard-recent-alerts" sectionTitle="آخر التنبيهات والأحداث الحية">
          <div ref={alertsCardRef} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl relative">
            <DraggableHandle elementId="dashboard_recent_alerts_card" targetRef={alertsCardRef} position="bottom-right" />
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-white">آخر التنبيهات والأحداث الحية</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">تحديث فورى</span>
            </div>

            <div className="space-y-3">
              {recentAlerts.map((alert, idx) => (
                <div key={alert.id || idx} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-200 font-bold leading-relaxed">{alert.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.created_at ? new Date(alert.created_at).toLocaleTimeString('ar-EG') : 'الآن'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ErrorBoundary>

      </div>

      {/* Invoice Notifications Radar Card */}
      <ErrorBoundary sectionName="dashboard-notification-radar" sectionTitle="رادار إشعارات بوالص الشحن">
        <div className="w-full">
          <NotificationRadarCard onShowToast={onShowToast} />
        </div>
      </ErrorBoundary>

    </div>
  );
}

