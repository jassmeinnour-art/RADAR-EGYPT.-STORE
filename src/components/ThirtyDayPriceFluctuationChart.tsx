import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Package,
  Store,
  Tag,
  Clock,
  Filter,
  Download,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle
} from 'lucide-react';
import { ProductData } from '../types';

interface ThirtyDayPriceFluctuationChartProps {
  availableProducts: ProductData[];
  currentProduct?: ProductData | null;
  currency?: string;
  onSelectProduct?: (product: ProductData) => void;
  onShowToast?: (msg: string) => void;
}

const PRODUCT_COLORS = [
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#0ea5e9', // sky-500
  '#a855f7', // purple-500
  '#f43f5e', // rose-500
  '#3b82f6', // blue-500
  '#eab308', // yellow-500
  '#14b8a6'  // teal-500
];

export const ThirtyDayPriceFluctuationChart: React.FC<ThirtyDayPriceFluctuationChartProps> = ({
  availableProducts = [],
  currentProduct,
  currency = 'ج.م',
  onSelectProduct,
  onShowToast
}) => {
  // Safe products list fallback
  const safeProducts = useMemo(() => {
    if (availableProducts && availableProducts.length > 0) return availableProducts;
    if (currentProduct) return [currentProduct];
    return [];
  }, [availableProducts, currentProduct]);

  // Initial selected products: default to current product or first product
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    if (currentProduct?.id) return [currentProduct.id];
    if (safeProducts.length > 0) return [safeProducts[0].id];
    return [];
  });

  // Active product for single-product deep dive
  const [activeSingleProductId, setActiveSingleProductId] = useState<string>(() => {
    if (currentProduct?.id) return currentProduct.id;
    if (safeProducts.length > 0) return safeProducts[0].id;
    return '';
  });

  // Chart configuration state
  const [viewMode, setViewMode] = useState<'multi_product' | 'platform_breakdown'>('multi_product');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [timeSliceDays, setTimeSliceDays] = useState<number>(30); // 7, 14, or 30
  const [showLogTable, setShowLogTable] = useState<boolean>(false);

  // Platform line toggles for platform_breakdown mode
  const [showAmazon, setShowAmazon] = useState(true);
  const [showNoon, setShowNoon] = useState(true);
  const [showJumia, setShowJumia] = useState(true);
  const [showBtech, setShowBtech] = useState(true);
  const [showWinningPrice, setShowWinningPrice] = useState(true);

  // Synchronize when currentProduct prop changes
  React.useEffect(() => {
    if (currentProduct?.id) {
      if (!selectedProductIds.includes(currentProduct.id)) {
        setSelectedProductIds(prev => [...prev, currentProduct.id]);
      }
      setActiveSingleProductId(currentProduct.id);
    }
  }, [currentProduct?.id]);

  // Active single product object
  const activeProduct = useMemo(() => {
    return safeProducts.find(p => p.id === activeSingleProductId) || safeProducts[0] || null;
  }, [safeProducts, activeSingleProductId]);

  // Toggle a product selection for multi-product comparison
  const handleToggleProduct = (product: ProductData) => {
    setSelectedProductIds(prev => {
      if (prev.includes(product.id)) {
        if (prev.length === 1) {
          if (onShowToast) onShowToast('⚠️ يجب الإبقاء على منتج واحد على الأقل في المخطط');
          return prev;
        }
        return prev.filter(id => id !== product.id);
      } else {
        if (prev.length >= 6) {
          if (onShowToast) onShowToast('⚠️ الحد الأقصى للمقارنة المتزامنة هو 6 منتجات لضمان وضوح الرسم البياني');
          return prev;
        }
        return [...prev, product.id];
      }
    });

    setActiveSingleProductId(product.id);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleSelectAllProducts = () => {
    const ids = safeProducts.slice(0, 6).map(p => p.id);
    setSelectedProductIds(ids);
    if (onShowToast) onShowToast(`تم تحديد ${ids.length} منتجات للمقارنة الشاملة 📈`);
  };

  const handleSelectOnlyCurrent = () => {
    if (activeProduct) {
      setSelectedProductIds([activeProduct.id]);
      if (onShowToast) onShowToast(`تم التركيز على "${activeProduct.title.slice(0, 30)}..." فقط`);
    }
  };

  // Generate 30 days of realistic daily historical data
  const { timelineData, productStats } = useMemo(() => {
    const daysCount = 30;
    const now = new Date();
    const data: any[] = [];

    // Pre-calculate baseline multipliers per product for deterministic realistic price curves
    const productCurves: Record<string, number[]> = {};
    const stats: Record<string, { min: number; max: number; avg: number; volatility: number; dropsCount: number }> = {};

    safeProducts.forEach(prod => {
      const base = prod.currentLowestPrice || 2500;
      const wholesale = prod.estimatedWholesaleCost || Math.round(base * 0.78);
      
      // Deterministic pseudorandom seed based on product title length and id
      const seed = (prod.id.charCodeAt(0) || 5) * 7 + (prod.title.length * 3);
      
      const dailyPrices: number[] = [];
      let lastPrice = Math.round(base * 1.08); // started ~8% higher 30 days ago

      for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
        // days ago: 29 down to 0
        const daysAgo = 29 - dayIndex;
        
        // Cyclical variations: weekend flash sales (every 7 days), mid-month promotions
        const isWeekend = daysAgo % 7 === 1 || daysAgo % 7 === 2;
        const isFlashSale = (dayIndex + seed) % 9 === 0;
        const isCompetitorWar = daysAgo <= 8;

        let delta = 0;
        if (isWeekend) {
          delta = -Math.round(base * 0.035);
        } else if (isFlashSale) {
          delta = -Math.round(base * 0.05);
        } else if (isCompetitorWar) {
          // downward pressure in the last week
          delta = -Math.round(base * 0.02);
        } else {
          // natural random walk fluctuating around base
          const wave = Math.sin((dayIndex + seed) * 0.4);
          delta = Math.round(wave * (base * 0.025));
        }

        let price = Math.round(lastPrice + delta * 0.35);
        // Bound price safely above wholesale floor
        price = Math.max(wholesale + 50, price);
        // Smooth toward current lowest price on day 29 (today)
        if (dayIndex === daysCount - 1) {
          price = base;
        } else if (dayIndex >= daysCount - 4) {
          price = Math.round(price * 0.3 + base * 0.7);
        }

        dailyPrices.push(price);
        lastPrice = price;
      }

      productCurves[prod.id] = dailyPrices;

      // Calculate stats
      const min = Math.min(...dailyPrices);
      const max = Math.max(...dailyPrices);
      const avg = Math.round(dailyPrices.reduce((a, b) => a + b, 0) / dailyPrices.length);
      const volatility = Number((((max - min) / avg) * 100).toFixed(1));
      
      let drops = 0;
      for (let i = 1; i < dailyPrices.length; i++) {
        if (dailyPrices[i] !== dailyPrices[i - 1]) drops++;
      }

      stats[prod.id] = { min, max, avg, volatility, dropsCount: drops };
    });

    // Assemble daily timeline
    for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
      const daysAgo = 29 - dayIndex;
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);

      const dayNumber = dayIndex + 1;
      const dateStr = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
      
      const row: any = {
        dayIndex,
        dayNumber,
        daysAgo,
        date: dateStr,
        dateLabel,
        displayLabel: daysAgo === 0 ? 'اليوم' : daysAgo === 1 ? 'أمس' : dateLabel
      };

      // Populate multi-product prices
      safeProducts.forEach(prod => {
        row[prod.id] = productCurves[prod.id]?.[dayIndex] || prod.currentLowestPrice || 2500;
      });

      // Populate platform breakdown for active single product
      if (activeProduct) {
        const activeBasePrice = productCurves[activeProduct.id]?.[dayIndex] || activeProduct.currentLowestPrice || 2500;
        const wholesale = activeProduct.estimatedWholesaleCost || Math.round(activeBasePrice * 0.78);
        
        row.wholesale = wholesale;
        row.amazon = activeBasePrice;
        row.noon = Math.round(activeBasePrice * (1 + (Math.sin(dayIndex * 0.7) * 0.03 + 0.02)));
        row.jumia = Math.round(activeBasePrice * (1 + (Math.cos(dayIndex * 0.5) * 0.04 + 0.03)));
        row.btech = Math.round(activeBasePrice * (1.06 + Math.sin(dayIndex * 0.3) * 0.02));
        row.marketLowest = Math.min(row.amazon, row.noon, row.jumia, row.btech);
        row.winningPrice = Math.max(wholesale + 40, Math.round(row.marketLowest * 0.96));

        // Event tag
        if (dayIndex === 29) {
          row.eventNote = 'اليوم: استقرار السعر التنافسي الحالي';
        } else if (dayIndex === 22) {
          row.eventNote = 'حرب أسعار: انخفاض الـ Buy Box على أمازون مصر';
        } else if (dayIndex === 14) {
          row.eventNote = 'تخفيضات فلاش سيل منتصف الشهر';
        } else if (dayIndex === 7) {
          row.eventNote = 'عروض الويك إند الترويجية في نون وجوميا';
        }
      }

      data.push(row);
    }

    return { timelineData: data, productStats: stats };
  }, [safeProducts, activeProduct]);

  // Filtered timeline based on timeSliceDays (7, 14, 30)
  const displayedTimeline = useMemo(() => {
    return timelineData.slice(-timeSliceDays);
  }, [timelineData, timeSliceDays]);

  // Selected products list objects
  const selectedProducts = useMemo(() => {
    return safeProducts.filter(p => selectedProductIds.includes(p.id));
  }, [safeProducts, selectedProductIds]);

  // Active product current metrics
  const activeMetrics = useMemo(() => {
    if (!activeProduct) return null;
    return productStats[activeProduct.id] || {
      min: activeProduct.currentLowestPrice || 0,
      max: activeProduct.highestPrice || 0,
      avg: activeProduct.averagePrice || 0,
      volatility: 5.2,
      dropsCount: 9
    };
  }, [activeProduct, productStats]);

  // Export 30-day price history as CSV
  const handleExportCSV = () => {
    if (timelineData.length === 0) return;
    try {
      const headers = ['Day', 'Date', 'Days Ago', ...selectedProducts.map(p => `"${p.title.replace(/"/g, '""')}" (${p.sku || p.id})`)];
      const rows = timelineData.map(row => {
        const line = [row.dayNumber, row.date, row.daysAgo];
        selectedProducts.forEach(p => {
          line.push(row[p.id] || '');
        });
        return line.join(',');
      });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `radar_30day_price_fluctuations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) onShowToast('📥 تم تصدير بيانات تقلبات الأسعار خلال 30 يوماً كملف CSV بنجاح!');
    } catch (e: any) {
      if (onShowToast) onShowToast(`❌ فشل التصدير: ${e?.message || e}`);
    }
  };

  // Custom Dark Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pointData = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-right max-w-xs text-xs font-['Cairo'] space-y-2 z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-3">
            <span className="font-mono text-[10px] text-amber-400 font-bold">
              {pointData?.daysAgo === 0 ? 'اليوم' : `قبل ${pointData?.daysAgo} يوم`}
            </span>
            <span className="font-black text-white">{pointData?.dateLabel || label}</span>
          </div>

          {pointData?.eventNote && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1 text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{pointData.eventNote}</span>
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                <span className="font-mono font-black text-white text-xs">
                  {Number(entry.value).toLocaleString()} {currency}
                </span>
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                  <span className="truncate max-w-[140px] font-bold" title={entry.name}>
                    {entry.name}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: entry.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (safeProducts.length === 0) {
    return (
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 font-['Cairo']">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-2" />
        <h4 className="text-white font-bold text-sm">لا توجد منتجات مسجلة للمخطط التاريخي</h4>
        <p className="text-xs text-slate-500 mt-1">قم بربط متجرك أو إضافة منتجات بالكتالوج لتفعيل تتبع الأسعار على مدار 30 يوماً</p>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-4 sm:p-6 lg:p-7 space-y-6 text-slate-100 font-['Cairo'] relative overflow-hidden"
      id="thirty-day-price-fluctuations-chart"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30 text-amber-400 shadow-inner">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-['Alexandria'] flex items-center gap-2">
                <span>مخطط تقلبات الأسعار التاريخية خلال الـ 30 يوماً الماضية</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  30-Day Radar
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع حركة وتغيرات أسعار المنافسين في السوق المصري (أمازون، نون، جوميا، بي تك) يوماً بيوم للمنتجات المحددة
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Export Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('multi_product')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'multi_product'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مقارنة المنتجات</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('platform_breakdown')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'platform_breakdown'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>منصات المنافسين</span>
            </button>
          </div>

          {/* Time Slice Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            {[
              { days: 7, label: '7 أيام' },
              { days: 14, label: '14 يوم' },
              { days: 30, label: '30 يوماً' }
            ].map(tab => (
              <button
                key={tab.days}
                type="button"
                onClick={() => setTimeSliceDays(tab.days)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  timeSliceDays === tab.days
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setChartType(prev => prev === 'line' ? 'area' : 'line')}
              className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-white font-bold transition flex items-center gap-1.5"
              title="تبديل بين العرض الخطي والمساحي"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>{chartType === 'line' ? 'خطي (Line)' : 'مساحي (Area)'}</span>
            </button>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="تصدير سجل تقلبات الأسعار لـ 30 يوماً كملف Excel/CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* Product Selection Bar (اختيار المنتجات للمقارنة) */}
      <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">المنتجات المحددة في المخطط ({selectedProducts.length} من {safeProducts.length}):</span>
            <span className="text-[11px] text-slate-500">اختر منتجاً أو أكثر لمقارنة منحنيات تذبذب الأسعار جنباً إلى جنب</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllProducts}
              className="px-2.5 py-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition cursor-pointer"
            >
              تحديد الكل (حتى 6)
            </button>
            <button
              type="button"
              onClick={handleSelectOnlyCurrent}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              المنتج الحالي فقط
            </button>
          </div>
        </div>

        {/* Product Chips Selector */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {safeProducts.map((p, idx) => {
            const isSelected = selectedProductIds.includes(p.id);
            const isCurrent = activeProduct?.id === p.id;
            const color = PRODUCT_COLORS[idx % PRODUCT_COLORS.length];

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleToggleProduct(p)}
                className={`group px-3 py-2 rounded-2xl border text-right transition-all shrink-0 flex items-center gap-2.5 cursor-pointer max-w-xs ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-70 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                {/* Color Dot indicator */}
                <div
                  className={`w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform ${
                    isSelected ? 'scale-110' : 'opacity-40'
                  }`}
                  style={{ backgroundColor: isSelected ? color : '#64748b' }}
                />

                <img
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=100'}
                  alt={p.title}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-800 shrink-0"
                />

                <div className="overflow-hidden text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs truncate max-w-[150px]">{p.title}</span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                    <span className="text-emerald-400 font-bold font-mono">
                      {(p.currentLowestPrice || 2500).toLocaleString()} {currency}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{p.brand}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 30-Day High-Level KPI Summary Cards */}
      {activeMetrics && activeProduct && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10 text-xs">
          {/* 30-Day Low */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/70 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">أدنى سعر في 30 يوم</span>
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              {activeMetrics.min.toLocaleString()} {currency}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              أفضل فرصة شراء رُصدت بالرادار
            </div>
          </div>

          {/* 30-Day High */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/70 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">أعلى سعر في 30 يوم</span>
              <TrendingUp className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-rose-400 font-mono">
              {activeMetrics.max.toLocaleString()} {currency}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ذروة السعر للمنتج النشط
            </div>
          </div>

          {/* 30-Day Mean */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/70 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">متوسط سعر السوق</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-sky-300 font-mono">
              {activeMetrics.avg.toLocaleString()} {currency}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              متوسط آخر 30 يوماً
            </div>
          </div>

          {/* Volatility Rate */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/70 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">معدل التذبذب والتقلب</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
              ±{activeMetrics.volatility}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              مستوى تغير الأسعار بالسوق
            </div>
          </div>

          {/* Price Changes Count */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/70 shadow-inner col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">تكرار تعديل السعر</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-purple-300 font-mono">
              {activeMetrics.dropsCount} مرات
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              حركات أسعار مسجلة في 30 يوم
            </div>
          </div>
        </div>
      )}

      {/* Platform Toggles when in 'platform_breakdown' mode */}
      {viewMode === 'platform_breakdown' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">منصات المقارنة للمنتج ({activeProduct?.title}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAmazon(prev => !prev)}
              className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs cursor-pointer ${
                showAmazon ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>أمازون مصر</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNoon(prev => !prev)}
              className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs cursor-pointer ${
                showNoon ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>نون مصر</span>
            </button>

            <button
              type="button"
              onClick={() => setShowJumia(prev => !prev)}
              className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs cursor-pointer ${
                showJumia ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>جوميا</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBtech(prev => !prev)}
              className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs cursor-pointer ${
                showBtech ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>بي تك</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWinningPrice(prev => !prev)}
              className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs cursor-pointer ${
                showWinningPrice ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>السعر الفائز (هدفنا)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Recharts Container */}
      <div className="w-full bg-slate-950/90 p-3 sm:p-5 rounded-3xl border border-slate-800/80 shadow-2xl relative z-10">
        <SafeResponsiveContainer minHeight={340}>
          {chartType === 'line' ? (
            <LineChart
              data={displayedTimeline}
              margin={{ top: 15, right: 15, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              
              <XAxis
                dataKey="displayLabel"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Cairo' }}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Cairo' }}
                tickFormatter={(v: number) => `${v.toLocaleString()} ${currency}`}
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                orientation="right"
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontFamily: 'Cairo' }}
              />

              {/* Multi-product comparison lines */}
              {viewMode === 'multi_product' && selectedProducts.map((p, idx) => (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={p.id}
                  name={p.title.length > 25 ? `${p.title.slice(0, 25)}...` : p.title}
                  stroke={PRODUCT_COLORS[idx % PRODUCT_COLORS.length]}
                  strokeWidth={2.8}
                  dot={{ r: 3, fill: PRODUCT_COLORS[idx % PRODUCT_COLORS.length], strokeWidth: 1.5, stroke: '#0f172a' }}
                  activeDot={{ r: 6, fill: PRODUCT_COLORS[idx % PRODUCT_COLORS.length], stroke: '#ffffff', strokeWidth: 2 }}
                />
              ))}

              {/* Platform breakdown lines */}
              {viewMode === 'platform_breakdown' && (
                <>
                  {showAmazon && (
                    <Line
                      type="monotone"
                      dataKey="amazon"
                      name="أمازون مصر"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#f59e0b' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showNoon && (
                    <Line
                      type="monotone"
                      dataKey="noon"
                      name="نون مصر"
                      stroke="#eab308"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#eab308' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showJumia && (
                    <Line
                      type="monotone"
                      dataKey="jumia"
                      name="جوميا"
                      stroke="#ea580c"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#ea580c' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showBtech && (
                    <Line
                      type="monotone"
                      dataKey="btech"
                      name="بي تك"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: '#3b82f6' }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {showWinningPrice && (
                    <Line
                      type="monotone"
                      dataKey="winningPrice"
                      name="السعر الفائز (Buy Box)"
                      stroke="#10b981"
                      strokeWidth={3}
                      strokeDasharray="4 4"
                      dot={{ r: 3.5, fill: '#10b981' }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                  {activeProduct?.estimatedWholesaleCost && (
                    <ReferenceLine
                      y={activeProduct.estimatedWholesaleCost}
                      stroke="#dc2626"
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      label={{
                        value: `تكلفة الجملة (${activeProduct.estimatedWholesaleCost.toLocaleString()} ${currency})`,
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'insideBottomRight'
                      }}
                    />
                  )}
                </>
              )}
            </LineChart>
          ) : (
            <AreaChart
              data={displayedTimeline}
              margin={{ top: 15, right: 15, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="areaGradientAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="areaGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="areaGradientSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              <XAxis
                dataKey="displayLabel"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Cairo' }}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Cairo' }}
                tickFormatter={(v: number) => `${v.toLocaleString()} ${currency}`}
                domain={['auto', 'auto']}
                orientation="right"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontFamily: 'Cairo' }}
              />

              {viewMode === 'multi_product' ? (
                selectedProducts.slice(0, 3).map((p, idx) => {
                  const gradientId = idx === 0 ? 'areaGradientAmber' : idx === 1 ? 'areaGradientEmerald' : 'areaGradientSky';
                  return (
                    <Area
                      key={p.id}
                      type="monotone"
                      dataKey={p.id}
                      name={p.title.length > 25 ? `${p.title.slice(0, 25)}...` : p.title}
                      stroke={PRODUCT_COLORS[idx % PRODUCT_COLORS.length]}
                      fill={`url(#${gradientId})`}
                      strokeWidth={2.5}
                    />
                  );
                })
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="marketLowest"
                    name="أرخص سعر بالسوق"
                    stroke="#f59e0b"
                    fill="url(#areaGradientAmber)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="winningPrice"
                    name="السعر الفائز (هدفنا)"
                    stroke="#10b981"
                    fill="url(#areaGradientEmerald)"
                    strokeWidth={2.5}
                  />
                </>
              )}
            </AreaChart>
          )}
        </SafeResponsiveContainer>
      </div>

      {/* Expandable 30-Day Chronological Log Table */}
      <div className="border border-slate-800/80 rounded-2xl bg-slate-950/70 overflow-hidden relative z-10 text-xs">
        <button
          type="button"
          onClick={() => setShowLogTable(prev => !prev)}
          className="w-full px-4 py-3 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition flex items-center justify-between font-bold cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>استعراض سجل تقلبات الأسعار اليومي (Day-by-Day Price Log)</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-mono">
              {displayedTimeline.length} يوم
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{showLogTable ? 'إخفاء السجل' : 'عرض السجل المفصل'}</span>
            {showLogTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showLogTable && (
          <div className="overflow-x-auto max-h-72 divide-y divide-slate-800/50">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold sticky top-0 z-20">
                <tr>
                  <th className="p-3">اليوم والتاريخ</th>
                  <th className="p-3">أرخص سعر بالسوق</th>
                  <th className="p-3">أمازون مصر</th>
                  <th className="p-3">نون مصر</th>
                  <th className="p-3">جوميا</th>
                  <th className="p-3">السعر الفائز الموصى به</th>
                  <th className="p-3">ملاحظة الحدث السوقي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {displayedTimeline.slice().reverse().map(row => (
                  <tr key={row.dayNumber} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      <div>{row.dateLabel}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {row.daysAgo === 0 ? 'اليوم' : `منذ ${row.daysAgo} يوم`}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-400">
                      {row.marketLowest?.toLocaleString()} {currency}
                    </td>
                    <td className="p-3 font-mono text-amber-300">
                      {row.amazon?.toLocaleString()} {currency}
                    </td>
                    <td className="p-3 font-mono text-yellow-300">
                      {row.noon?.toLocaleString()} {currency}
                    </td>
                    <td className="p-3 font-mono text-orange-300">
                      {row.jumia?.toLocaleString()} {currency}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-300">
                      {row.winningPrice?.toLocaleString()} {currency}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {row.eventNote ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {row.eventNote}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
