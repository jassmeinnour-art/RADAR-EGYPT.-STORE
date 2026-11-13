import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Package,
  Search,
  RefreshCw,
  Store,
  Tag,
  Plus,
  X,
  Globe
} from 'lucide-react';
import { supabase, Product, Trader, isDemoOrOrphanProduct } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/navigation';
import { GlobalEmptyState } from './GlobalEmptyState';
import { SyncReportDisplay } from './SyncReportDisplay';
import { FetchProductsModal } from './FetchProductsModal';
import { dataCache } from '../utils/dataCache';
import { DraggableHandle } from './DraggableHandle';
import { OptimizedImage } from './OptimizedImage';

interface ProductsPageProps {
  onShowToast?: (message: string) => void;
}

const ProductCard: React.FC<{ product: Product; onPlatformChange: (p: string) => void }> = React.memo(({ product, onPlatformChange }) => {
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
      className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden h-full"
    >
      <DraggableHandle elementId={`product_card_${product.id}`} targetRef={cardRef} position="bottom-right" />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            onClick={() => {
              if (hasPlatform) onPlatformChange(product.platform!);
            }}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl border ${platformBadgeStyle} ${hasPlatform ? 'cursor-pointer' : ''}`}
            title={hasPlatform ? `تصفية حسب منصة ${product.platform}` : 'منصة غير محددة'}
          >
            {platformDisplayLabel}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {product.created_at ? new Date(product.created_at).toLocaleDateString('ar-EG') : 'محدث'}
          </span>
        </div>

        <div>
          <OptimizedImage
            src={product.image}
            alt={product.title}
            width={320}
            height={200}
            containerClassName="w-full h-[200px] mb-2"
            maxThumbWidth={360}
          />
          <h3 className="text-sm font-black text-white whitespace-nowrap overflow-hidden text-ellipsis leading-snug" title={product.title}>
            {product.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-slate-400">
            <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-bold text-amber-300/90">SKU: {product.sku}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
            <div className="text-[10px] text-slate-400 font-bold mb-0.5">السعر الحالي</div>
            <div className="text-sm font-black text-white font-mono">
              {Number(product.price || 0).toLocaleString()} ج.م
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

      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-mono text-slate-400">ID: {String(product.id || '').substring(0, 12)}</span>
        <span className="text-sky-400 font-bold">نشط في الكتالوج ✓</span>
      </div>
    </div>
  );
});
ProductCard.displayName = 'ProductCard';

export const ProductsPage: React.FC<ProductsPageProps> = ({ onShowToast }) => {
  const { user, profile } = useAuth();
  const userEmail = (user?.email || profile?.email || '').trim().toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [traderOptions, setTraderOptions] = useState<Trader[]>([]);

  const [urlTraderId, setUrlTraderId] = useState<string | null>(null);
  const [urlPlatform, setUrlPlatform] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const PAGE_SIZE = 20;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState<boolean>(false);
  const [isSyncingInBackground, setIsSyncingInBackground] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [syncStats, setSyncStats] = useState<{ total: number; new: number; updated: number } | null>(null);

  // New product form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSku, setNewSku] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newStock, setNewStock] = useState<string>('15');
  const [newPlatform, setNewPlatform] = useState<string>('amazon');
  const [newTraderId, setNewTraderId] = useState<string>('');

  const tradersCacheKey = `traders_dropdown_options_${userEmail || 'anon'}_v2`;

  const ensureTraderOptions = useCallback(async () => {
    if (!userEmail) return;
    const cachedTraders = dataCache.getStale<Trader[]>(tradersCacheKey);
    if (cachedTraders && cachedTraders.data.length > 0) {
      setTraderOptions(cachedTraders.data);
      if (!newTraderId) setNewTraderId(cachedTraders.data[0].id);
      if (cachedTraders.isFresh) return;
    }

    try {
      const { data: tradersData } = await supabase
        .from('traders')
        .select('id, seller_name, email, gmail, seller_id, platform, destination_url, seller_link, store_url, storefront_link')
        .order('created_at', { ascending: false });

      if (Array.isArray(tradersData)) {
        setTraderOptions(tradersData as Trader[]);
        dataCache.set(tradersCacheKey, tradersData);
        if (tradersData.length > 0 && !newTraderId) {
          setNewTraderId(tradersData[0].id);
        }
      }
    } catch {}
  }, [newTraderId, tradersCacheKey, userEmail]);

  const readQueryParams = useCallback(() => {
    if (typeof window === 'undefined') return { trader_id: null, platform: null };
    const searchParams = new URLSearchParams(window.location.search);
    const trader_id = searchParams.get('trader_id');
    const platform = searchParams.get('platform');
    setUrlTraderId(trader_id);
    setUrlPlatform(platform);
    return { trader_id, platform };
  }, []);

  const fetchProductsAndTraders = useCallback(async (
    forcedTraderId?: string | null,
    forcedPlatform?: string | null,
    page = 1,
    forceFresh = false,
    append = false
  ) => {
    if (!userEmail) {
      setProducts([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    const trader_id = forcedTraderId !== undefined ? forcedTraderId : urlTraderId;
    const platform = forcedPlatform !== undefined ? forcedPlatform : urlPlatform;
    const cacheKey = `products_${userEmail}_${trader_id || 'all'}_${platform || 'all'}_p${page}`;

    const cached = !forceFresh ? dataCache.getStale<{ products: Product[]; total: number }>(cacheKey) : null;
    if (cached && !append) {
      setProducts(cached.data.products.filter((p) => !isDemoOrOrphanProduct(p)));
      setTotalCount(cached.data.total);
      setCurrentPage(page);
      setIsLoading(false);
    } else if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    const cachedTraders = dataCache.getStale<Trader[]>(tradersCacheKey);
    if (cachedTraders && cachedTraders.data.length > 0) {
      setTraderOptions(cachedTraders.data);
    }

    if (cached?.isFresh && !forceFresh && !append) {
      return;
    }

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;

      let query: any = supabase
        .from('products')
        .select('id, title, sku, price, stock, platform, image, trader_id, created_at', { count: 'exact' })
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

      const cleanedProds = fetchedProds
        .filter((p) => !isDemoOrOrphanProduct(p))
        .map((p) => ({
          ...p,
          platform: (p.platform || '').includes('amazon')
            ? 'amazon'
            : (p.platform || '').includes('noon')
            ? 'noon'
            : p.platform,
        }));

      const total = typeof count === 'number' ? count : cleanedProds.length;

      if (append) {
        setProducts((prev) => {
          const combined = [...prev, ...cleanedProds];
          return Array.from(new Map(combined.map((item) => [item.id, item])).values());
        });
      } else {
        setProducts(cleanedProds);
      }

      setTotalCount((prevTotal) => (typeof count === 'number' ? count : Math.max(prevTotal, total)));
      setCurrentPage(page);

      dataCache.set(cacheKey, { products: cleanedProds, total });
    } catch (err) {
      console.error('Failed to load products data:', err);
      if (!cached && !append) setProducts([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [urlTraderId, urlPlatform, userEmail, tradersCacheKey]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('radar_last_sync_stats');
      if (raw) setSyncStats(JSON.parse(raw));
    } catch {}

    const { trader_id, platform } = readQueryParams();
    fetchProductsAndTraders(trader_id, platform);

    const handlePopState = () => {
      const current = readQueryParams();
      fetchProductsAndTraders(current.trader_id, current.platform);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

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
    const targetTrader = newTraderId || (urlTraderId && urlTraderId !== 'all' ? urlTraderId : traderOptions[0]?.id || '');
    if (!newTitle.trim() || !newSku.trim() || !newPrice || !targetTrader) {
      onShowToast?.('⚠️ يرجى تعبئة كافة الحقول واختيار التاجر المالك');
      return;
    }
    setIsSubmitting(true);
    try {
      const prodRecord = {
        title: newTitle.trim(),
        sku: newSku.trim().toUpperCase(),
        price: parseFloat(newPrice) || 0,
        stock: parseInt(newStock, 10) || 0,
        platform: newPlatform,
        trader_id: targetTrader,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('products').insert([prodRecord]);
      if (error) throw error;

      onShowToast?.(`✅ تم إضافة المنتج "${newTitle}" بنجاح!`);
      dataCache.invalidate('products_');
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewSku('');
      setNewPrice('');
      setNewStock('15');
      fetchProductsAndTraders(urlTraderId, urlPlatform, 1, true);
    } catch (err: any) {
      onShowToast?.(`❌ فشل حفظ المنتج: ${err.message || 'حدث خطأ'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.platform && p.platform.trim()) {
        set.add(p.platform.trim().toLowerCase());
      }
    });
    return Array.from(set);
  }, [products]);

  const activeTraderObj = useMemo(() => {
    if (!urlTraderId || urlTraderId === 'all') return traderOptions[0] || null;
    return traderOptions.find((t) => t.id === urlTraderId) || null;
  }, [urlTraderId, traderOptions]);

  const activeTraderName = urlTraderId && urlTraderId !== 'all'
    ? (activeTraderObj?.seller_name || 'التاجر المحدد')
    : null;
  const activePlatformName = urlPlatform && urlPlatform !== 'all'
    ? (urlPlatform === 'amazon' ? 'Amazon' : urlPlatform === 'noon' ? 'Noon' : urlPlatform.toUpperCase())
    : null;

  const isFiltered = Boolean(activeTraderName || activePlatformName);

  const handleOpenFetchAllModal = async () => {
    setIsSyncingInBackground(true);
    await ensureTraderOptions();
    setIsSyncingInBackground(false);
    setIsFetchModalOpen(true);
  };

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
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

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleOpenFetchAllModal}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-colors duration-200 cursor-pointer justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingInBackground ? 'animate-spin' : ''}`} />
            <span>سحب كل منتجات المتجر</span>
          </button>
          {isSyncingInBackground && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-2xl animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>يتم المزامنة...</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              ensureTraderOptions();
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-colors duration-200 cursor-pointer justify-center flex-1 md:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>➕ إضافة منتج جديد</span>
          </button>
          <button
            type="button"
            onClick={() => fetchProductsAndTraders(urlTraderId, urlPlatform, 1, true)}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors duration-200 cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

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
            type="button"
            onClick={handleClearAllFilters}
            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
          >
            <X className="w-4 h-4" />
            <span>عرض الكل (مسح الفلتر)</span>
          </button>
        )}
      </div>

      {syncStats && <SyncReportDisplay stats={syncStats} />}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
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

        <div className="md:col-span-3">
          <label htmlFor="trader-filter-select" className="sr-only">فلتر حسب التاجر</label>
          <div className="relative">
            <Store className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="trader-filter-select"
              value={urlTraderId || 'all'}
              onFocus={() => ensureTraderOptions()}
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

      {isLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-bold">جاري تحميل قائمة المنتجات المحددة...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <GlobalEmptyState
          icon={<Package className="w-10 h-10 text-amber-400" />}
          message={urlTraderId && urlTraderId !== 'all' ? 'لا توجد منتجات لهذا التاجر' : 'كتالوج المنتجات فارغ'}
          description="لم يتم إضافة أي منتجات لهذا التاجر بعد. يمكنك إضافة المنتجات يدوياً أو سحبها من رابط المتجر."
          actionLabel={isFiltered ? 'مسح الفلتر وعرض الكل' : 'إضافة منتج جديد'}
          onActionClick={isFiltered ? handleClearAllFilters : () => { ensureTraderOptions(); setIsAddModalOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPlatformChange={handlePlatformChange}
            />
          ))}
        </div>
      )}

      {products.length > 0 && products.length < totalCount && (
        <div className="flex flex-col items-center justify-center gap-3 pt-6">
          <p className="text-xs text-slate-400 font-bold">
            تم عرض <span className="text-amber-400 font-mono">{products.length}</span> من أصل <span className="text-white font-mono">{totalCount}</span> منتج
          </p>
          <button
            type="button"
            onClick={() => fetchProductsAndTraders(urlTraderId, urlPlatform, currentPage + 1, true, true)}
            disabled={isLoadingMore}
            className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors duration-200 shadow-lg inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{isLoadingMore ? 'جاري التحميل...' : 'عرض المزيد (20 منتج إضافي)'}</span>
          </button>
        </div>
      )}

      {isFetchModalOpen && activeTraderObj && (
        <FetchProductsModal
          trader={activeTraderObj}
          isOpen={isFetchModalOpen}
          onClose={() => setIsFetchModalOpen(false)}
          onShowToast={onShowToast}
          onSyncCompleted={(stats) => {
            setSyncStats(stats);
            fetchProductsAndTraders(urlTraderId, urlPlatform, 1, true);
          }}
        />
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
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
                  placeholder="مثال: اسم المنتج الحقيقي"
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
                  placeholder="مثال: 8D-X6ON-F44R"
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
