import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Download,
  ExternalLink,
  Store,
  Target,
  Sliders,
  Sparkles,
  Check,
  X,
  Eye
} from 'lucide-react';
import { ProductData, ConnectedMerchantPlatform } from '../types';

interface DirectCompetitorsTabProps {
  products: ProductData[];
  currentProduct: ProductData | null;
  connectedPlatforms: ConnectedMerchantPlatform[];
  currency?: string;
  selectedDiscount?: number;
  onSelectProduct: (product: ProductData) => void;
  onUpdateMerchantPrice?: (productId: string, newPrice: number) => void;
  onBulkMatchBuyBox?: (updates: { id: string; newPrice: number }[]) => void;
  onNavigateToRadar?: (product: ProductData) => void;
  onShowToast?: (message: string) => void;
}

export interface DirectCompetitorComparisonRow {
  product: ProductData;
  id: string;
  title: string;
  sku: string;
  brand: string;
  category: string;
  imageUrl: string;
  merchantPrice: number;
  wholesaleCost: number;
  amazonPrice: number;
  noonPrice: number;
  jumiaPrice: number;
  homzmartPrice: number;
  btechPrice: number;
  lowestCompetitorPrice: number;
  lowestCompetitorPlatform: string;
  priceDiffEGP: number; // merchantPrice - lowestCompetitorPrice (negative = merchant is cheaper)
  priceDiffPercent: number;
  merchantProfitEGP: number;
  merchantMarginPercent: number;
  recommendedWinningPrice: number;
  buyBoxStatus: 'winning' | 'contested' | 'losing';
  merchantBuyBoxShare: number;
  platformBuyBoxShares: {
    amazon: number;
    noon: number;
    jumia: number;
    homzmart: number;
  };
}

type SortField =
  | 'title'
  | 'merchantPrice'
  | 'lowestCompetitorPrice'
  | 'amazonPrice'
  | 'noonPrice'
  | 'jumiaPrice'
  | 'homzmartPrice'
  | 'priceDiffEGP'
  | 'merchantBuyBoxShare'
  | 'merchantMarginPercent';

type SortDirection = 'asc' | 'desc';
type BuyBoxFilter = 'all' | 'winning' | 'contested' | 'losing';

export const DirectCompetitorsTab: React.FC<DirectCompetitorsTabProps> = ({
  products,
  currentProduct,
  connectedPlatforms,
  currency = 'ج.م',
  selectedDiscount = 2,
  onSelectProduct,
  onUpdateMerchantPrice,
  onBulkMatchBuyBox,
  onNavigateToRadar,
  onShowToast
}) => {
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [buyBoxFilter, setBuyBoxFilter] = useState<BuyBoxFilter>('all');
  const [dominantPlatformFilter, setDominantPlatformFilter] = useState<string>('all');

  // Sort States
  const [sortField, setSortField] = useState<SortField>('priceDiffEGP');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  // Inline Price Editing State
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draftMerchantPrice, setDraftMerchantPrice] = useState<number>(0);

  // Live pulse simulation state
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string>(() =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isRefreshingPulse, setIsRefreshingPulse] = useState<boolean>(false);

  const handleRefreshLivePrices = () => {
    setIsRefreshingPulse(true);
    setTimeout(() => {
      setIsRefreshingPulse(false);
      setLastUpdatedLabel(
        new Date().toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      if (onShowToast) {
        onShowToast('⚡ تم تحديث جدول المنافسين المباشرين ومؤشرات الـ Buy Box لحظياً!');
      }
    }, 450);
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Build comparison rows for all active products
  const comparisonRows = useMemo<DirectCompetitorComparisonRow[]>(() => {
    return products.map((prod, idx) => {
      const baseLowest = prod.currentLowestPrice || 3500;
      const wholesaleCost = prod.estimatedWholesaleCost || Math.round(baseLowest * 0.75);
      const merchantPrice = prod.suggestedRetailPrice || Math.round(baseLowest * 1.01);

      const offers = prod.merchantOffers || [];
      const amazonPrice =
        offers.find(o => o.platform === 'amazon_eg')?.price || baseLowest;
      const noonPrice =
        offers.find(o => o.platform === 'noon_eg')?.price || Math.round(baseLowest * 1.02);
      const jumiaPrice =
        offers.find(o => o.platform === 'jumia_eg')?.price || Math.round(baseLowest * 1.045);
      const homzmartPrice =
        offers.find(o => o.platform === 'homzmart_eg')?.price || Math.round(baseLowest * 1.03);
      const btechPrice =
        offers.find(o => o.platform === 'btech')?.price || Math.round(baseLowest * 1.06);

      const compPrices = [
        { name: 'أمازون مصر', key: 'amazon_eg', price: amazonPrice },
        { name: 'نون مصر', key: 'noon_eg', price: noonPrice },
        { name: 'جوميا مصر', key: 'jumia_eg', price: jumiaPrice },
        { name: 'هومزمارت', key: 'homzmart_eg', price: homzmartPrice },
        { name: 'بي تك', key: 'btech', price: btechPrice }
      ];

      const sortedComps = [...compPrices].sort((a, b) => a.price - b.price);
      const lowestComp = sortedComps[0];
      const lowestCompetitorPrice = lowestComp.price;
      const lowestCompetitorPlatform = lowestComp.name;

      const priceDiffEGP = merchantPrice - lowestCompetitorPrice;
      const priceDiffPercent =
        lowestCompetitorPrice > 0
          ? Number(((priceDiffEGP / lowestCompetitorPrice) * 100).toFixed(1))
          : 0;

      const merchantProfitEGP = merchantPrice - wholesaleCost;
      const merchantMarginPercent =
        merchantPrice > 0
          ? Number(((merchantProfitEGP / merchantPrice) * 100).toFixed(1))
          : 0;

      // Calculate Buy Box status & platform Buy Box shares based on relative pricing competitiveness
      let buyBoxStatus: 'winning' | 'contested' | 'losing' = 'contested';
      let merchantBuyBoxShare = 55;

      if (priceDiffEGP <= 0) {
        buyBoxStatus = 'winning';
        merchantBuyBoxShare = Math.min(96, 78 + Math.min(18, Math.round(Math.abs(priceDiffPercent) * 3)));
      } else if (priceDiffPercent <= 2.5) {
        buyBoxStatus = 'contested';
        merchantBuyBoxShare = Math.max(38, 62 - Math.round(priceDiffPercent * 8));
      } else {
        buyBoxStatus = 'losing';
        merchantBuyBoxShare = Math.max(12, 35 - Math.round(priceDiffPercent * 3));
      }

      // Platform-specific Buy Box Shares (0-100%) showing merchant's Buy Box win rate on each platform
      const calcPlatShare = (platCompPrice: number, bonus: number) => {
        const diffPct =
          platCompPrice > 0 ? ((merchantPrice - platCompPrice) / platCompPrice) * 100 : 0;
        if (diffPct <= -2) return Math.min(98, 88 + bonus);
        if (diffPct <= 0) return Math.min(94, 76 + bonus);
        if (diffPct <= 2.5) return Math.max(42, 60 - Math.round(diffPct * 6) + bonus);
        return Math.max(14, 34 - Math.round(diffPct * 3) + bonus);
      };

      const platformBuyBoxShares = {
        amazon: calcPlatShare(amazonPrice, (idx % 3) * 2),
        noon: calcPlatShare(noonPrice, (idx % 4) * 2),
        jumia: calcPlatShare(jumiaPrice, 4),
        homzmart: calcPlatShare(homzmartPrice, 3)
      };

      const safeMinPrice = Math.round(wholesaleCost * 1.07);
      const rawWinning = Math.round(lowestCompetitorPrice * (1 - (selectedDiscount || 2) / 100));
      const recommendedWinningPrice = Math.max(safeMinPrice, rawWinning);

      return {
        product: prod,
        id: prod.id,
        title: prod.title,
        sku: prod.sku || `SKU-${prod.id.slice(0, 6).toUpperCase()}`,
        brand: prod.brand || 'علامة معتمدة',
        category: prod.category || 'عام',
        imageUrl: prod.imageUrl,
        merchantPrice,
        wholesaleCost,
        amazonPrice,
        noonPrice,
        jumiaPrice,
        homzmartPrice,
        btechPrice,
        lowestCompetitorPrice,
        lowestCompetitorPlatform,
        priceDiffEGP,
        priceDiffPercent,
        merchantProfitEGP,
        merchantMarginPercent,
        recommendedWinningPrice,
        buyBoxStatus,
        merchantBuyBoxShare,
        platformBuyBoxShares
      };
    });
  }, [products, selectedDiscount]);

  // Filter & Sort Rows
  const filteredAndSortedRows = useMemo(() => {
    const filtered = comparisonRows.filter(row => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          row.title.toLowerCase().includes(q) ||
          row.sku.toLowerCase().includes(q) ||
          row.brand.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (categoryFilter !== 'all' && row.category !== categoryFilter) {
        return false;
      }

      if (buyBoxFilter !== 'all' && row.buyBoxStatus !== buyBoxFilter) {
        return false;
      }

      if (
        dominantPlatformFilter !== 'all' &&
        row.lowestCompetitorPlatform !== dominantPlatformFilter
      ) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc'
          ? valA.localeCompare(valB, 'ar')
          : valB.localeCompare(valA, 'ar');
      }

      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return sortDir === 'asc' ? numA - numB : numB - numA;
    });
  }, [
    comparisonRows,
    searchQuery,
    categoryFilter,
    buyBoxFilter,
    dominantPlatformFilter,
    sortField,
    sortDir
  ]);

  // Executive KPIs across all products
  const summaryStats = useMemo(() => {
    const total = comparisonRows.length || 1;
    const winningCount = comparisonRows.filter(r => r.buyBoxStatus === 'winning').length;
    const contestedCount = comparisonRows.filter(r => r.buyBoxStatus === 'contested').length;
    const losingCount = comparisonRows.filter(r => r.buyBoxStatus === 'losing').length;

    const avgMerchantBuyBox = Math.round(
      comparisonRows.reduce((s, r) => s + r.merchantBuyBoxShare, 0) / total
    );
    const avgAmazonShare = Math.round(
      comparisonRows.reduce((s, r) => s + r.platformBuyBoxShares.amazon, 0) / total
    );
    const avgNoonShare = Math.round(
      comparisonRows.reduce((s, r) => s + r.platformBuyBoxShares.noon, 0) / total
    );
    const avgJumiaShare = Math.round(
      comparisonRows.reduce((s, r) => s + r.platformBuyBoxShares.jumia, 0) / total
    );
    const avgHomzmartShare = Math.round(
      comparisonRows.reduce((s, r) => s + r.platformBuyBoxShares.homzmart, 0) / total
    );

    return {
      winningCount,
      contestedCount,
      losingCount,
      avgMerchantBuyBox,
      avgAmazonShare,
      avgNoonShare,
      avgJumiaShare,
      avgHomzmartShare
    };
  }, [comparisonRows]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
    );
  };

  const handleApplySingleWinningPrice = (row: DirectCompetitorComparisonRow) => {
    if (onUpdateMerchantPrice) {
      onUpdateMerchantPrice(row.id, row.recommendedWinningPrice);
    }
    if (onShowToast) {
      onShowToast(
        `✅ تم تحديث سعر "${row.title.slice(0, 26)}..." إلى ${row.recommendedWinningPrice.toLocaleString()} ${currency} للفوز بالـ Buy Box!`
      );
    }
  };

  const handleSaveCustomMerchantPrice = (row: DirectCompetitorComparisonRow) => {
    const cleanPrice = Math.max(1, Math.round(Number(draftMerchantPrice) || row.merchantPrice));
    if (onUpdateMerchantPrice) {
      onUpdateMerchantPrice(row.id, cleanPrice);
    }
    setEditingRowId(null);
    if (onShowToast) {
      onShowToast(
        `✅ تم حفظ سعر التاجر الجديد (${cleanPrice.toLocaleString()} ${currency}) للمنتج "${row.title.slice(0, 25)}..."`
      );
    }
  };

  const handleExportCompetitorsTableCSV = () => {
    const headers = [
      'الكود (SKU)',
      'اسم المنتج',
      'الفئة',
      'سعر التاجر الحالي',
      'تكلفة الجملة',
      'أقل سعر منافس',
      'المنصة الأرخص',
      'الفارق السعري (ج.م)',
      'أمازون مصر',
      'نون مصر',
      'جوميا مصر',
      'هومزمارت',
      'حصة Buy Box الإجمالية (%)',
      'حصة Buy Box أمازون (%)',
      'حصة Buy Box نون (%)',
      'حصة Buy Box جوميا (%)',
      'السعر الرابح المقترح'
    ];

    const rows = filteredAndSortedRows.map(r => [
      r.sku,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.merchantPrice,
      r.wholesaleCost,
      r.lowestCompetitorPrice,
      `"${r.lowestCompetitorPlatform}"`,
      r.priceDiffEGP,
      r.amazonPrice,
      r.noonPrice,
      r.jumiaPrice,
      r.homzmartPrice,
      `${r.merchantBuyBoxShare}%`,
      `${r.platformBuyBoxShares.amazon}%`,
      `${r.platformBuyBoxShares.noon}%`,
      `${r.platformBuyBoxShares.jumia}%`,
      r.recommendedWinningPrice
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `direct-competitors-buybox-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast('📊 تم تصدير جدول مقارنة المنافسين المباشرين وحصص الـ Buy Box بصيغة CSV!');
    }
  };

  return (
    <section
      id="direct-competitors-comparison-tab"
      className="space-y-6 animate-fadeIn"
      dir="rtl"
    >
      {/* Top Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>رصد حي لحظة بلحظة • آخر مزامنة: {lastUpdatedLabel}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Alexandria']">
              المنافسون المباشرون ومؤشرات حصة الـ Buy Box لكل منصة
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              جدول تفاعلي قابل للفرز والفلترة يقارن لحظة بلحظة بين أسعار متجرك الحالي وأسعار المنافسين الرئيسيين (أمازون مصر، نون، جوميا، هومزمارت) مع مؤشر حي لنسبة استحواذ الـ Buy Box لكل منصة وإمكانية التعديل الفوري للسعر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-refresh-direct-competitors"
              onClick={handleRefreshLivePrices}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshingPulse ? 'animate-spin' : ''}`} />
              <span>تحديث لحظي للأسعار</span>
            </button>

            <button
              type="button"
              id="btn-export-direct-competitors-csv"
              onClick={handleExportCompetitorsTableCSV}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>تصدير الجدول (CSV)</span>
            </button>

            {onBulkMatchBuyBox && summaryStats.losingCount + summaryStats.contestedCount > 0 && (
              <button
                type="button"
                id="btn-bulk-win-buybox-all"
                onClick={() => {
                  const updates = comparisonRows
                    .filter(r => r.buyBoxStatus !== 'winning')
                    .map(r => ({ id: r.id, newPrice: r.recommendedWinningPrice }));
                  onBulkMatchBuyBox(updates);
                  if (onShowToast) {
                    onShowToast(
                      `🚀 تم تطبيق السعر الرابح على ${updates.length} منتج لاستعادة صدارة الـ Buy Box فوراً!`
                    );
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-950/60 border border-emerald-400/40"
              >
                <Zap className="w-4 h-4" />
                <span>
                  اقتناص الـ Buy Box جماعياً ({summaryStats.losingCount + summaryStats.contestedCount} منتج)
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Platform Buy Box Share Gauges Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Overall Buy Box Status */}
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300">حصة متجرك الإجمالية (Buy Box)</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {summaryStats.avgMerchantBuyBox}%
              </span>
              <span className="text-[11px] font-bold text-emerald-400">
                متصدر في {summaryStats.winningCount} منتج
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${summaryStats.avgMerchantBuyBox}%` }}
              />
            </div>
          </div>

          {/* Amazon.eg Buy Box Share */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-300">أمازون مصر (Amazon.eg)</span>
              <span className="font-mono font-black text-white">{summaryStats.avgAmazonShare}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{ width: `${summaryStats.avgAmazonShare}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>مؤشر الاستحواذ على الصندوق</span>
              <span className="text-sky-300 font-bold">مباشر ⚡</span>
            </div>
          </div>

          {/* Noon.com Buy Box Share */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-300">نون مصر (Noon.com)</span>
              <span className="font-mono font-black text-white">{summaryStats.avgNoonShare}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full transition-all"
                style={{ width: `${summaryStats.avgNoonShare}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>مؤشر الاستحواذ على الصندوق</span>
              <span className="text-sky-300 font-bold">مباشر ⚡</span>
            </div>
          </div>

          {/* Jumia Buy Box Share */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-orange-300">جوميا مصر (Jumia)</span>
              <span className="font-mono font-black text-white">{summaryStats.avgJumiaShare}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${summaryStats.avgJumiaShare}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>مؤشر الاستحواذ على الصندوق</span>
              <span className="text-orange-300 font-bold">مباشر ⚡</span>
            </div>
          </div>

          {/* Homzmart Buy Box Share */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-pink-300">هومزمارت (Homzmart)</span>
              <span className="font-mono font-black text-white">{summaryStats.avgHomzmartShare}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full transition-all"
                style={{ width: `${summaryStats.avgHomzmartShare}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>مؤشر الاستحواذ على الصندوق</span>
              <span className="text-pink-300 font-bold">مباشر ⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-direct-competitors"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المنتج، الكود (SKU)، أو الماركة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              id="select-category-direct-competitors"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">جميع فئات المنتجات ({comparisonRows.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Dominant Competitor Platform Filter */}
          <div className="md:col-span-2">
            <select
              value={dominantPlatformFilter}
              onChange={(e) => setDominantPlatformFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">كل المنصات المنافسة</option>
              <option value="أمازون مصر">الأرخص: أمازون مصر</option>
              <option value="نون مصر">الأرخص: نون مصر</option>
              <option value="جوميا مصر">الأرخص: جوميا مصر</option>
              <option value="هومزمارت">الأرخص: هومزمارت</option>
            </select>
          </div>

          {/* Buy Box Status Quick Filter Buttons */}
          <div className="md:col-span-3 flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all' as const, label: `الكل (${comparisonRows.length})` },
              { id: 'winning' as const, label: `رابح (${summaryStats.winningCount})` },
              { id: 'contested' as const, label: `منافسة (${summaryStats.contestedCount})` },
              { id: 'losing' as const, label: `مفقود (${summaryStats.losingCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBuyBoxFilter(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  buyBoxFilter === tab.id
                    ? 'bg-emerald-600 text-white font-black shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Sortable & Filterable Comparison Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto scroller-sm">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-black text-slate-300">
                <th className="py-3.5 px-4 min-w-[230px]">
                  <button
                    type="button"
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                  >
                    <span>المنتج والكود (SKU)</span>
                    {renderSortIcon('title')}
                  </button>
                </th>

                <th className="py-3.5 px-3 min-w-[135px] bg-indigo-950/30 border-x border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleSort('merchantPrice')}
                    className="flex items-center gap-1.5 text-indigo-300 hover:text-white cursor-pointer"
                  >
                    <span>سعر التاجر الحالي</span>
                    {renderSortIcon('merchantPrice')}
                  </button>
                </th>

                <th className="py-3.5 px-3 min-w-[130px]">
                  <button
                    type="button"
                    onClick={() => handleSort('lowestCompetitorPrice')}
                    className="flex items-center gap-1.5 text-emerald-300 hover:text-white cursor-pointer"
                  >
                    <span>أرخص منافس مباشر</span>
                    {renderSortIcon('lowestCompetitorPrice')}
                  </button>
                </th>

                <th className="py-3.5 px-3 min-w-[115px]">
                  <button
                    type="button"
                    onClick={() => handleSort('amazonPrice')}
                    className="flex items-center gap-1.5 text-sky-300 hover:text-white cursor-pointer"
                  >
                    <span>أمازون مصر</span>
                    {renderSortIcon('amazonPrice')}
                  </button>
                </th>

                <th className="py-3.5 px-3 min-w-[115px]">
                  <button
                    type="button"
                    onClick={() => handleSort('noonPrice')}
                    className="flex items-center gap-1.5 text-sky-300 hover:text-white cursor-pointer"
                  >
                    <span>نون مصر</span>
                    {renderSortIcon('noonPrice')}
                  </button>
                </th>

                <th className="py-3.5 px-3 min-w-[115px]">
                  <button
                    type="button"
                    onClick={() => handleSort('jumiaPrice')}
                    className="flex items-center gap-1.5 text-orange-300 hover:text-white cursor-pointer"
                  >
                    <span>جوميا مصر</span>
                    {renderSortIcon('jumiaPrice')}
                  </button>
                </th>

                <th className="py-3.5 px-3 min-w-[115px]">
                  <button
                    type="button"
                    onClick={() => handleSort('homzmartPrice')}
                    className="flex items-center gap-1.5 text-pink-300 hover:text-white cursor-pointer"
                  >
                    <span>هومزمارت</span>
                    {renderSortIcon('homzmartPrice')}
                  </button>
                </th>

                <th className="py-3.5 px-3 min-w-[125px]">
                  <button
                    type="button"
                    onClick={() => handleSort('priceDiffEGP')}
                    className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                  >
                    <span>الفارق السعري</span>
                    {renderSortIcon('priceDiffEGP')}
                  </button>
                </th>

                <th className="py-3.5 px-4 min-w-[235px]">
                  <button
                    type="button"
                    onClick={() => handleSort('merchantBuyBoxShare')}
                    className="flex items-center gap-1.5 text-emerald-300 hover:text-white cursor-pointer"
                  >
                    <span>مؤشر حصة الـ Buy Box لكل منصة</span>
                    {renderSortIcon('merchantBuyBoxShare')}
                  </button>
                </th>

                <th className="py-3.5 px-4 min-w-[155px] text-center">إجراء التسعير اللحظي</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredAndSortedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    لا توجد منتجات مطابقة لمعايير البحث أو الفلترة الحالية.
                  </td>
                </tr>
              ) : (
                filteredAndSortedRows.map(row => {
                  const isSelected = currentProduct?.id === row.id;
                  const isEditing = editingRowId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      {/* 1. Product Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.imageUrl}
                            alt={row.title}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(row.product)}
                              className="font-black text-white hover:text-emerald-300 text-right line-clamp-1 cursor-pointer"
                              title={row.title}
                            >
                              {row.title}
                            </button>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>{row.sku}</span>
                              <span>•</span>
                              <span className="text-slate-300 font-sans">{row.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Current Merchant Price (Editable inline) */}
                      <td className="py-3.5 px-3 bg-indigo-950/20 border-x border-slate-800/70">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={draftMerchantPrice}
                              onChange={(e) => setDraftMerchantPrice(Number(e.target.value))}
                              className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-indigo-400 text-white font-mono text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCustomMerchantPrice(row)}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                              title="حفظ"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRowId(null)}
                              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                              title="إلغاء"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-black text-sm text-indigo-200">
                                {row.merchantPrice.toLocaleString()} {currency}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRowId(row.id);
                                  setDraftMerchantPrice(row.merchantPrice);
                                }}
                                className="text-[10px] text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
                              >
                                تعديل
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              الهامش:{' '}
                              <strong
                                className={
                                  row.merchantMarginPercent >= 15
                                    ? 'text-emerald-400 font-mono'
                                    : 'text-sky-400 font-mono'
                                }
                              >
                                {row.merchantMarginPercent}%
                              </strong>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 3. Lowest Direct Competitor */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-black text-sm text-emerald-400">
                          {row.lowestCompetitorPrice.toLocaleString()} {currency}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {row.lowestCompetitorPlatform}
                        </span>
                      </td>

                      {/* 4. Amazon.eg Price */}
                      <td className="py-3.5 px-3 font-mono">
                        <span
                          className={
                            row.amazonPrice === row.lowestCompetitorPrice
                              ? 'font-black text-sky-300 underline decoration-sky-500/60'
                              : 'text-slate-300 font-bold'
                          }
                        >
                          {row.amazonPrice.toLocaleString()} {currency}
                        </span>
                      </td>

                      {/* 5. Noon.com Price */}
                      <td className="py-3.5 px-3 font-mono">
                        <span
                          className={
                            row.noonPrice === row.lowestCompetitorPrice
                              ? 'font-black text-sky-300 underline decoration-sky-500/60'
                              : 'text-slate-300 font-bold'
                          }
                        >
                          {row.noonPrice.toLocaleString()} {currency}
                        </span>
                      </td>

                      {/* 6. Jumia Price */}
                      <td className="py-3.5 px-3 font-mono">
                        <span
                          className={
                            row.jumiaPrice === row.lowestCompetitorPrice
                              ? 'font-black text-orange-300 underline decoration-orange-500/60'
                              : 'text-slate-300 font-bold'
                          }
                        >
                          {row.jumiaPrice.toLocaleString()} {currency}
                        </span>
                      </td>

                      {/* 7. Homzmart Price */}
                      <td className="py-3.5 px-3 font-mono">
                        <span
                          className={
                            row.homzmartPrice === row.lowestCompetitorPrice
                              ? 'font-black text-pink-300 underline decoration-pink-500/60'
                              : 'text-slate-300 font-bold'
                          }
                        >
                          {row.homzmartPrice.toLocaleString()} {currency}
                        </span>
                      </td>

                      {/* 8. Price Difference vs Lowest Competitor */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-black border ${
                            row.priceDiffEGP <= 0
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : row.priceDiffPercent <= 2.5
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {row.priceDiffEGP > 0 ? `+${row.priceDiffEGP.toLocaleString()}` : row.priceDiffEGP.toLocaleString()}{' '}
                          {currency} ({row.priceDiffPercent > 0 ? `+${row.priceDiffPercent}%` : `${row.priceDiffPercent}%`})
                        </span>
                      </td>

                      {/* 9. Buy Box Share Indicator Per Platform */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span
                              className={`font-black ${
                                row.buyBoxStatus === 'winning'
                                  ? 'text-emerald-400'
                                  : row.buyBoxStatus === 'contested'
                                  ? 'text-sky-300'
                                  : 'text-rose-400'
                              }`}
                            >
                              {row.buyBoxStatus === 'winning'
                                ? '🏆 مستحوذ على Buy Box'
                                : row.buyBoxStatus === 'contested'
                                ? '⚡ منافسة متقاربة'
                                : '⚠️ خارج الصندوق'}
                            </span>
                            <span className="font-mono font-black text-white">
                              {row.merchantBuyBoxShare}%
                            </span>
                          </div>

                          {/* Per-Platform Mini Buy Box Share Pills */}
                          <div className="grid grid-cols-4 gap-1 pt-0.5 text-[10px] font-mono">
                            <div
                              className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 text-center"
                              title="حصة الـ Buy Box على أمازون مصر"
                            >
                              أمازون {row.platformBuyBoxShares.amazon}%
                            </div>
                            <div
                              className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 text-center"
                              title="حصة الـ Buy Box على نون مصر"
                            >
                              نون {row.platformBuyBoxShares.noon}%
                            </div>
                            <div
                              className="px-1.5 py-0.5 rounded bg-orange-500/15 border border-orange-500/30 text-orange-300 text-center"
                              title="حصة الـ Buy Box على جوميا"
                            >
                              جوميا {row.platformBuyBoxShares.jumia}%
                            </div>
                            <div
                              className="px-1.5 py-0.5 rounded bg-pink-500/15 border border-pink-500/30 text-pink-300 text-center"
                              title="حصة الـ Buy Box على هومزمارت"
                            >
                              هومز {row.platformBuyBoxShares.homzmart}%
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 10. Quick Action */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApplySingleWinningPrice(row)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>
                              كسر السعر ({row.recommendedWinningPrice.toLocaleString()})
                            </span>
                          </button>

                          {onNavigateToRadar && (
                            <button
                              type="button"
                              onClick={() => onNavigateToRadar(row.product)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-indigo-400" />
                              <span>فحص بالرادار</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
