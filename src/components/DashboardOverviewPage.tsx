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
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { supabase } from '../lib/supabase';
import { dataCache } from '../utils/dataCache';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/navigation';
import { NotificationRadarCard } from './NotificationRadarCard';
import { DraggableHandle } from './DraggableHandle';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

    async function loadDashboardData() {
      const cached = dataCache.getStale<{
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
    return () => { isMounted = false; };
  }, [activeEmail]);

  // Filtered sales chart data based on selected timeframe
  const displaySalesData = useMemo(() => {
    if (salesTimeframe === '6M') {
      return DEFAULT_MONTHLY_SALES_DATA.slice(6);
    }
    return DEFAULT_MONTHLY_SALES_DATA;
  }, [salesTimeframe]);

  // Custom Recharts Tooltip for Sales Chart
  const CustomSalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md font-['Cairo'] text-right dir-rtl">
          <div className="font-bold text-amber-400 text-xs mb-1">{label}</div>
          <div className="space-y-1 text-xs">
            <div className="text-slate-200 font-mono">
              إجمالي المبيعات: <span className="text-emerald-400 font-bold">{data.sales.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="text-slate-300 font-mono">
              عدد الطلبات: <span className="text-sky-400 font-bold">{data.orders} طلب</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              متوسط السلة: {data.avgOrder} ج.م
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Tooltip for Platform Distribution Chart
  const CustomPlatformTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md font-['Cairo'] text-right dir-rtl">
          <div className="font-bold text-white text-xs mb-1" style={{ color: data.color || '#f59e0b' }}>
            {data.name}
          </div>
          <div className="text-xs text-slate-200 font-mono">
            النسبة من الإجمالي: <span className="font-bold text-amber-300">{data.value}%</span>
          </div>
          <div className="text-xs text-slate-300 font-mono">
            عدد المنتجات: <span className="font-bold text-sky-300">{data.count} منتج</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-8 pb-20 font-['Cairo'] text-right" dir="rtl">
      
      {/* Header Banner */}
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

      {/* Stats Grid */}
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

      {/* ========================================================= */}
      {/* RECHARTS INTERACTIVE ANALYTICS SECTION                    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart 1: Monthly Sales Volume Area/Bar Chart (2 cols) */}
        <div ref={salesChartPanelRef} className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between relative">
          <DraggableHandle elementId="dashboard_sales_chart_panel" targetRef={salesChartPanelRef} position="bottom-left" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <BarChart3 className="w-5 h-5" />
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    salesChartMetric === 'sales'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  القيمة (ج.م)
                </button>
                <button
                  onClick={() => setSalesChartMetric('orders')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    salesTimeframe === '6M' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
                  }`}
                >
                  6M
                </button>
                <button
                  onClick={() => setSalesTimeframe('1Y')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    salesTimeframe === '1Y' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
                  }`}
                >
                  1Y
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Render Container */}
          <div className="w-full h-72 dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displaySalesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => salesChartMetric === 'sales' ? `${val / 1000}k` : val}
                />
                <Tooltip content={<CustomSalesTooltip />} />
                {salesChartMetric === 'sales' ? (
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#salesGradient)" 
                    name="المبيعات (ج.م)"
                  />
                ) : (
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#38bdf8" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#ordersGradient)" 
                    name="عدد الطلبات"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Summary Footnote */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>معدل نمو المبيعات الشهرية: <strong className="text-emerald-400 font-mono">+18.5%</strong> مقارنة بالربع السابق</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Recharts Engine v3.1</span>
          </div>
        </div>

        {/* Chart 2: Product Distribution by Platform Pie/Bar Chart (1 col) */}
        <div ref={platformChartPanelRef} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between relative">
          <DraggableHandle elementId="dashboard_platform_chart_panel" targetRef={platformChartPanelRef} position="bottom-right" />
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">توزيع المنتجات حسب المنصة</h3>
                <p className="text-slate-400 text-xs">نسب المنتجات المسجلة على المنصات</p>
              </div>
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setPlatformChartType('pie')}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  platformChartType === 'pie' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400'
                }`}
                title="عرض دائرى"
              >
                <PieIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPlatformChartType('bar')}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  platformChartType === 'bar' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400'
                }`}
                title="عرض شريطي"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recharts Render Container */}
          <div className="w-full h-64 dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              {platformChartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={DEFAULT_PLATFORM_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {DEFAULT_PLATFORM_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPlatformTooltip />} />
                </PieChart>
              ) : (
                <BarChart data={DEFAULT_PLATFORM_DISTRIBUTION_DATA} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 9 }} width={90} />
                  <Tooltip content={<CustomPlatformTooltip />} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {DEFAULT_PLATFORM_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution Legend List */}
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

      </div>

      {/* Traders & Recent Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Traders Summary Card */}
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

        {/* Recent Alerts Card */}
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

      </div>

      {/* Invoice Notifications Radar Card */}
      <div className="w-full">
        <NotificationRadarCard onShowToast={onShowToast} />
      </div>

    </div>
  );
}

