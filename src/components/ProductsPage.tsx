import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  Filter, 
  Store, 
  DollarSign, 
  Layers, 
  Tag, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  X,
  ArrowLeft,
  Boxes,
  Globe
} from 'lucide-react';
import { supabase, Product, Trader } from '../lib/supabase';
import { navigate } from '../utils/navigation';
import { GlobalEmptyState } from './GlobalEmptyState';
import { SyncReportDisplay } from './SyncReportDisplay';

interface ProductsPageProps {
  onShowToast?: (message: string) => void;
}

import { dataCache } from '../utils/dataCache';
import { DraggableHandle } from './DraggableHandle';
import { useRef } from 'react';

const ProductCard: React.FC<{ product: Product; onPlatformChange: (p: string) => void }> = ({ product, onPlatformChange }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasPlatform = Boolean(product.platform && product.platform.trim());
  const platLower = (product.platform || '').toLowerCase();
  const isAmazon = platLower === 'amazon';
  const isNoon = platLower === 'noon';

  const platformBadgeStyle = !hasPlatform
    ? 'text-slate-400 bg-slate-800/60 border-slate-700'
    : isAmazon
    ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
    : isNoon
    ? 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30'
    : 'text-sky-300 bg-sky-500/15 border-sky-500/30';

  const platformDisplayLabel = hasPlatform ? product.platform!.toUpperCase() : 'غير محدد';

  return (
    <div
      ref={cardRef}
      className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-5 transition-all group flex flex-col justify-between shadow-lg relative overflow-hidden h-full"
    >
      <DraggableHandle elementId={`product_card_${product.id}`} targetRef={cardRef} position="bottom-right" />
      
      <div className="space-y-3">
        {/* Top Bar: Real Platform Badge & Status (NO seller name repetition) */}
        <div className="flex items-center justify-between gap-2">
          <span 
            onClick={() => {
              if (hasPlatform) onPlatformChange(product.platform!);
            }}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl border ${platformBadgeStyle} ${hasPlatform ? 'cursor-pointer hover:opacity-80' : ''} transition`}
            title={hasPlatform ? `تصفية حسب منصة ${product.platform}` : 'منصة غير محدودة في Supabase'}
          >
            {platformDisplayLabel}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {product.created_at ? new Date(product.created_at).toLocaleDateString('ar-EG') : 'محدث'}
          </span>
        </div>

        {/* Title & SKU */}
        <div>
          <img 
            src={product.image || "/placeholder-product.png"} 
            onError={(e: any) => e.target.src = "/placeholder-product.png"} 
            className="w-full h-32 object-cover rounded-2xl mb-2 border border-slate-800"
            alt={product.title}
          />
          <h3 className="text-sm font-black text-white group-hover:text-sky-300 transition line-clamp-2 leading-snug">
            {product.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-slate-400">
            <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-bold text-amber-300/90">SKU: {product.sku}</span>
          </div>
        </div>

        {/* Metrics: Price + Stock Only */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
            <div className="text-[10px] text-slate-400 font-bold mb-0.5">السعر الحالي</div>
            <div className="text-sm font-black text-white font-mono">
              {product.price.toLocaleString()} ج.م
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
            <div className="text-[10px] text-slate-400 font-bold mb-0.5">المخزون المتوفر</div>
            <div className="text-sm font-black text-emerald-400 font-mono">
              {product.stock || 0} قطعة
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-mono text-slate-400">ID: {product.id.substring(0, 12)}</span>
        <span className="text-sky-400 font-bold">نشط في الكتالوج ✓</span>
      </div>
    </div>
  );
};

export const ProductsPage: React.FC<ProductsPageProps> = ({ onShowToast }) => {
  // Main list is strictly products
  const [products, setProducts] = useState<Product[]>([]);
  // Traders are ONLY used for dropdown filter options
  const [traderOptions, setTraderOptions] = useState<Trader[]>([]);

  // Query parameter states
  const [urlTraderId, setUrlTraderId] = useState<string | null>(null);
  const [urlPlatform, setUrlPlatform] = useState<string | null>(null);

  // Pagination states (Requirement 1: 20 per page + page numbers)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const PAGE_SIZE = 20;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [syncStats, setSyncStats] = useState<{ total: number; new: number; updated: number } | null>(null);

  // New product form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSku, setNewSku] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newStock, setNewStock] = useState<string>('15');
  const [newPlatform, setNewPlatform] = useState<string>('amazon');
  const [newTraderId, setNewTraderId] = useState<string>('');

  // 3- اقرأ الـ Query Params من الـ URL
  const readQueryParams = useCallback(() => {
    if (typeof window === 'undefined') return { trader_id: null, platform: null };
    const searchParams = new URLSearchParams(window.location.search);
    const trader_id = searchParams.get('trader_id');
    const platform = searchParams.get('platform');
    setUrlTraderId(trader_id);
    setUrlPlatform(platform);
    return { trader_id, platform };
  }, []);

  const fetchProductsAndTraders = useCallback(async (forcedTraderId?: string | null, forcedPlatform?: string | null, page = 1, forceFresh = false) => {
    setIsLoading(true);
    const trader_id = forcedTraderId !== undefined ? forcedTraderId : urlTraderId;
    const platform = forcedPlatform !== undefined ? forcedPlatform : urlPlatform;
    const cacheKey = `products_${trader_id || 'all'}_${platform || 'all'}_p${page}`;

    if (!forceFresh) {
      const cached = dataCache.get<{ products: Product[]; total: number }>(cacheKey);
      if (cached) {
        setProducts(cached.products);
        setTotalCount(cached.total);
        setCurrentPage(page);
        setIsLoading(false);
        return;
      }
    }

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;

      // Requirement 1 & 2: Selective column selection + 20 items per page limit
      let query: any = supabase
        .from('products')
        .select('id, title, sku, price, stock, platform, image, trader_id, created_at, traders(seller_name)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (trader_id && trader_id !== 'all') {
        query = query.eq('trader_id', trader_id);
      }
      if (platform && platform !== 'all') {
        query = query.eq('platform', platform);
      }

      query = query.range(from, to);

      const { data: prodsData, error: prodsError, count } = await query;

      if (prodsError) {
        console.error('Error fetching products:', prodsError);
      }
      const fetchedProds = Array.isArray(prodsData) ? (prodsData as Product[]) : [];
      const total = count ?? fetchedProds.length;

      // Clean up platform strings
      const cleanedProds = fetchedProds.map(p => ({
        ...p,
        platform: (p.platform || '').includes('amazon') ? 'amazon' : (p.platform || '').includes('noon') ? 'noon' : p.platform
      }));

      setProducts(cleanedProds);
      setTotalCount(total);
      setCurrentPage(page);

      dataCache.set(cacheKey, { products: cleanedProds, total });

      // 2. Fetch traders ONLY for the dropdown options (selective columns)
      const { data: tradersData } = await supabase
        .from('traders')
        .select('id, seller_name, platform')
        .order('created_at', { ascending: false });

      if (Array.isArray(tradersData)) {
        setTraderOptions(tradersData as Trader[]);
        if (tradersData.length > 0 && !newTraderId) {
          setNewTraderId(tradersData[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load products data:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [urlTraderId, urlPlatform, newTraderId]);

  // Initial mount & sync with URL
  useEffect(() => {
    const raw = localStorage.getItem('radar_last_sync_stats');
    if (raw) setSyncStats(JSON.parse(raw));

    const { trader_id, platform } = readQueryParams();
    fetchProductsAndTraders(trader_id, platform);

    // Listen for browser back/forward or programmatic navigation
    const handlePopState = () => {
      const current = readQueryParams();
      fetchProductsAndTraders(current.trader_id, current.platform);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [readQueryParams, fetchProductsAndTraders]);

  // Handle dropdown changes by updating the URL cleanly
  const handleTraderChange = (newTId: string) => {
    const nextTrader = newTId === 'all' ? null : newTId;
    setUrlTraderId(nextTrader);

    const params = new URLSearchParams();
    if (nextTrader) params.set('trader_id', nextTrader);
    if (urlPlatform && urlPlatform !== 'all') params.set('platform', urlPlatform);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    navigate(`/products${queryString}`);
    fetchProductsAndTraders(nextTrader, urlPlatform);
  };

  const handlePlatformChange = (newPlat: string) => {
    const nextPlat = newPlat === 'all' ? null : newPlat;
    setUrlPlatform(nextPlat);

    const params = new URLSearchParams();
    if (urlTraderId && urlTraderId !== 'all') params.set('trader_id', urlTraderId);
    if (nextPlat) params.set('platform', nextPlat);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    navigate(`/products${queryString}`);
    fetchProductsAndTraders(urlTraderId, nextPlat);
  };

  const handleClearAllFilters = () => {
    setUrlTraderId(null);
    setUrlPlatform(null);
    navigate('/products');
    fetchProductsAndTraders(null, null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSku.trim() || !newPrice) {
      if (onShowToast) onShowToast('⚠️ يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      const targetTrader = newTraderId || urlTraderId || traderOptions[0]?.id || 'merchant-mahmeud-said';
      const prodRecord = {
        title: newTitle.trim(),
        sku: newSku.trim().toUpperCase(),
        price: parseFloat(newPrice) || 0,
        stock: parseInt(newStock) || 0,
        platform: newPlatform,
        trader_id: targetTrader,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('products').insert([prodRecord]);
      if (error) throw error;

      if (onShowToast) onShowToast(`✅ تم إضافة المنتج "${newTitle}" بنجاح!`);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewSku('');
      setNewPrice('');
      setNewStock('15');
      fetchProductsAndTraders();
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل حفظ المنتج: ${err.message || 'حدث خطأ'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Text search on the filtered products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const titleMatch = p.title && p.title.toLowerCase().includes(q);
      const skuMatch = p.sku && p.sku.toLowerCase().includes(q);
      const platformMatch = p.platform && p.platform.toLowerCase().includes(q);
      const traderMatch = (p as any).traders?.seller_name && (p as any).traders.seller_name.toLowerCase().includes(q);
      return titleMatch || skuMatch || platformMatch || traderMatch;
    });
  }, [products, searchQuery]);

  // Available real platforms from products data (Requirement 3: Filter reads real product.platform)
  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.platform && p.platform.trim()) {
        set.add(p.platform.trim().toLowerCase());
      }
    });
    return Array.from(set);
  }, [products]);

  // Active Trader and Platform labels for the Top Banner
  const activeTraderObj = useMemo(() => {
    if (!urlTraderId || urlTraderId === 'all') return null;
    return traderOptions.find(t => t.id === urlTraderId) || null;
  }, [urlTraderId, traderOptions]);

  const activeTraderName = activeTraderObj ? activeTraderObj.seller_name : (urlTraderId ? 'محمود سعيد' : null);
  const activePlatformName = urlPlatform && urlPlatform !== 'all' 
    ? (urlPlatform === 'amazon' ? 'Amazon' : urlPlatform === 'noon' ? 'Noon' : urlPlatform.toUpperCase()) 
    : null;

  const isFiltered = Boolean(activeTraderName || activePlatformName);

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-500/30 shadow-inner">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">إدارة المنتجات 📦</h2>
            <p className="text-xs text-slate-400">
              القائمة الرئيسية لمنتجات التجار | إجمالي المنتجات المعروضة:{' '}
              <span className="font-mono font-bold text-amber-400">{totalCount}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95 cursor-pointer justify-center flex-1 md:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>➕ إضافة منتج جديد</span>
          </button>
          <button
            onClick={() => fetchProductsAndTraders()}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2- Top Header Banner above list: Display trader name once (e.g. Header: "منتجات تاجر: Mahmeud Said Store (80 منتج)") */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-sky-500/15 border border-amber-500/40 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
              <span>
                منتجات تاجر: <strong className="text-amber-400">{activeTraderName || 'جميع التجار'}</strong>
              </span>
              {activePlatformName && (
                <>
                  <span className="text-slate-500">-</span>
                  <span>
                    منصة: <strong className="text-sky-400">{activePlatformName}</strong>
                  </span>
                </>
              )}
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-500/30">
                ({filteredProducts.length} منتج)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              عرض تفاصيل الكتالوج الخاص بالتاجر المحدد من قاعدة البيانات
            </p>
          </div>
        </div>

        {isFiltered && (
          <button
            onClick={handleClearAllFilters}
            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
          >
            <X className="w-4 h-4" />
            <span>عرض الكل (مسح الفلتر)</span>
          </button>
        )}
      </div>

      {syncStats && <SyncReportDisplay stats={syncStats} />}

      {/* Filters Bar: Search + Trader Dropdown + Platform Filter Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن منتج بالاسم أو رمز SKU أو المنصة..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 shadow-inner"
          />
        </div>

        {/* Dropdown: Filter by Trader */}
        <div className="md:col-span-3">
          <label htmlFor="trader-filter-select" className="sr-only">فلتر حسب التاجر</label>
          <div className="relative">
            <Store className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="trader-filter-select"
              value={urlTraderId || 'all'}
              onChange={(e) => handleTraderChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 appearance-none shadow-inner cursor-pointer"
            >
              <option value="all">🏢 جميع التجار ({traderOptions.length})</option>
              {traderOptions.map((trader) => (
                <option key={trader.id} value={trader.id}>
                  {trader.seller_name} ({trader.platform || 'عام'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3- Dropdown: Filter by Platform - reads real product.platform. If all null -> displays "كل المنتجات" only */}
        <div className="md:col-span-3">
          <label htmlFor="platform-filter-select" className="sr-only">فلتر حسب المنصة</label>
          <div className="relative">
            <Globe className="w-4 h-4 text-sky-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="platform-filter-select"
              value={urlPlatform || 'all'}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-sky-500/50 appearance-none shadow-inner cursor-pointer"
            >
              <option value="all">🌐 كل المنتجات ({products.length})</option>
              {availablePlatforms.length > 0 && availablePlatforms.map((plat) => {
                const label = plat === 'amazon' ? 'أمازون (Amazon) 🛒' : plat === 'noon' ? 'نون (Noon) 🟡' : plat === 'jumia' ? 'جوميا (Jumia) 🟠' : plat.toUpperCase();
                return (
                  <option key={plat} value={plat}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Main Products List Area */}
      {isLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-bold">جاري تحميل قائمة المنتجات المحددة...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <GlobalEmptyState
          icon={<Package className="w-10 h-10 text-amber-400" />}
          message="كتالوج المنتجات فارغ"
          description="لم تقم بإضافة أي منتجات لهذا التاجر بعد. يمكنك إضافة المنتجات يدوياً أو سحبها تلقائياً من رابط المتجر."
          actionLabel={isFiltered ? "مسح الفلتر وعرض الكل" : "إضافة منتج جديد"}
          onActionClick={isFiltered ? handleClearAllFilters : () => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            // Requirement 1 & 2:
            // 1. Only show real platform badge if product.platform actually exists in Supabase. Otherwise show "غير محدد"
            // 2. Do NOT repeat trader name in every card. Show SKU + Price + Stock only!
            const hasPlatform = Boolean(product.platform && product.platform.trim());
            const platLower = (product.platform || '').toLowerCase();
            const isAmazon = platLower === 'amazon';
            const isNoon = platLower === 'noon';

            const platformBadgeStyle = !hasPlatform
              ? 'text-slate-400 bg-slate-800/60 border-slate-700'
              : isAmazon
              ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
              : isNoon
              ? 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30'
              : 'text-sky-300 bg-sky-500/15 border-sky-500/30';

            const platformDisplayLabel = hasPlatform ? product.platform!.toUpperCase() : 'غير محدد';

            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-5 transition-all group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  {/* Top Bar: Real Platform Badge & Status (NO seller name repetition) */}
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      onClick={() => {
                        if (hasPlatform) handlePlatformChange(product.platform!);
                      }}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl border ${platformBadgeStyle} ${hasPlatform ? 'cursor-pointer hover:opacity-80' : ''} transition`}
                      title={hasPlatform ? `تصفية حسب منصة ${product.platform}` : 'منصة غير محدودة في Supabase'}
                    >
                      {platformDisplayLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {product.created_at ? new Date(product.created_at).toLocaleDateString('ar-EG') : 'محدث'}
                    </span>
                  </div>

                  {/* Title & SKU */}
                  <div>
                    <img 
                      src={product.image || "/placeholder-product.png"} 
                      onError={(e: any) => e.target.src = "/placeholder-product.png"} 
                      className="w-full h-32 object-cover rounded-2xl mb-2 border border-slate-800"
                      alt={product.title}
                    />
                    <h3 className="text-sm font-black text-white group-hover:text-sky-300 transition line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-slate-400">
                      <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-bold text-amber-300/90">SKU: {product.sku}</span>
                    </div>
                  </div>

                  {/* Metrics: Price + Stock Only */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-400 font-bold mb-0.5">السعر الحالي</div>
                      <div className="text-sm font-black text-white font-mono">
                        {product.price.toLocaleString()} ج.م
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-400 font-bold mb-0.5">المخزون المتوفر</div>
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {product.stock || 0} قطعة
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Status */}
                <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono text-slate-400">ID: {product.id.substring(0, 12)}</span>
                  <span className="text-sky-400 font-bold">نشط في الكتالوج ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Page Numbers (Requirement 1: Pagination 20 items per page with numbers 1, 2, 3...) */}
      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2 pt-6 flex-wrap">
          <span className="text-xs text-slate-400 font-bold ml-2">الصفحات:</span>
          {Array.from({ length: Math.ceil(totalCount / PAGE_SIZE) }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => fetchProductsAndTraders(urlTraderId, urlPlatform, pageNum)}
              className={`w-9 h-9 rounded-xl font-mono text-xs font-black transition cursor-pointer border ${
                currentPage === pageNum
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-black text-white">إضافة منتج جديد</h3>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">التاجر المالك *</label>
                <select
                  value={newTraderId}
                  onChange={(e) => setNewTraderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  {traderOptions.map((trader) => (
                    <option key={trader.id} value={trader.id}>
                      {trader.seller_name} ({trader.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المنتج *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: سماعة رأس لاسلكية مريحة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز التخزين التعريفي (SKU) *</label>
                <input
                  type="text"
                  required
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="مثال: SKU-AUDIO-001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="950"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الكمية بالمخزن</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المنصة</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="amazon">أمازون (Amazon)</option>
                  <option value="noon">نون (Noon)</option>
                  <option value="jumia">جوميا (Jumia)</option>
                  <option value="raneen">رنين (Raneen)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
