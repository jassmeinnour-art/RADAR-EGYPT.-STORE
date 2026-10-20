import React, { useState, useMemo } from 'react';
import { 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  ExternalLink, 
  SlidersHorizontal, 
  Tag, 
  Store, 
  AlertTriangle, 
  Filter, 
  ShieldCheck, 
  Zap, 
  X,
  Clock,
  Layers,
  Check,
  Percent,
  Bookmark,
  LayoutGrid,
  Grid3X3,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  PackageCheck,
  Building2,
  Boxes,
  Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, MerchantOffer, PlatformCategoryConfig, ConnectedMerchantPlatform } from '../types';
import { getCategoryIconComponent } from './CategoryModal';

interface RealTimeProductPriceComparisonProps {
  products: ProductData[];
  currentProduct: ProductData | null;
  onSelectProduct: (product: ProductData) => void;
  currency?: string;
  platformCategories?: PlatformCategoryConfig[];
  connectedPlatforms?: ConnectedMerchantPlatform[];
  onShowToast?: (message: string) => void;
  onTriggerDiscountAlert?: (product: ProductData, discountPercent: number, targetPrice: number) => void;
  onOpenGenerateWaybillModal?: (product: ProductData) => void;
}

// Fallback category map for platform codes if connectedPlatforms isn't provided
const DEFAULT_PLATFORM_CODE_TO_CATEGORY: Record<string, string> = {
  amazon_eg: 'marketplace',
  noon_eg: 'marketplace',
  jumia_eg: 'marketplace',
  rabbit_eg: 'quick_commerce',
  talabat_mart: 'quick_commerce',
  facebook_marketplace: 'social',
  instagram_shops: 'social',
  tiktok_shop: 'social',
  raneen_eg: 'retail_chains',
  raneen: 'retail_chains',
  btech_eg: 'retail_chains',
  btech: 'retail_chains',
  twob_eg: 'retail_chains',
  '2b': 'retail_chains',
  elaraby_group: 'retail_chains',
  elarabyelectric: 'retail_chains',
  abdelaziz_street: 'electronics_malls',
  bostan_mall: 'electronics_malls',
  bab_ellouq: 'electronics_malls',
  elataba_wholesale: 'electronics_malls',
  ataba_market: 'electronics_malls',
  gomla_online: 'b2b_wholesale',
  knz_app: 'b2b_wholesale',
  makro_metro: 'b2b_wholesale',
  shopify_salla: 'website'
};

export const RealTimeProductPriceComparison: React.FC<RealTimeProductPriceComparisonProps> = ({
  products,
  currentProduct,
  onSelectProduct,
  currency = 'EGP',
  platformCategories = [],
  connectedPlatforms = [],
  onShowToast,
  onTriggerDiscountAlert,
  onOpenGenerateWaybillModal
}) => {
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatformCategory, setSelectedPlatformCategory] = useState<string>('all');
  const [selectedSpecificPlatform, setSelectedSpecificPlatform] = useState<string>('all');
  const [selectedSyncStatus, setSelectedSyncStatus] = useState<'all' | 'synced' | 'needs_sync' | 'sync_error'>('all');
  const [priceRangePreset, setPriceRangePreset] = useState<'all' | 'under_3000' | '3000_to_10000' | '10000_to_25000' | 'above_25000'>('all');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'lowest_price' | 'highest_savings' | 'most_offers' | 'title_asc' | 'highest_price'>('lowest_price');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyWithSavings, setOnlyWithSavings] = useState<boolean>(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);

  // View Mode: 'grid' (Rich Card Grid View) vs 'compact' (Dense Mini-grid)
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Modal State for Discount Alerts
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [alertTargetProduct, setAlertTargetProduct] = useState<ProductData | null>(null);
  const [discountThreshold, setDiscountThreshold] = useState<number>(5);
  const [alertSuccessProduct, setAlertSuccessProduct] = useState<string | null>(null);

  // Mapping from platform code to category key
  const platformToCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    // Pre-populate with defaults
    Object.entries(DEFAULT_PLATFORM_CODE_TO_CATEGORY).forEach(([code, cat]) => {
      map.set(code, cat);
    });
    // Overlay connected platforms
    connectedPlatforms.forEach(p => {
      if (p.category) {
        map.set(p.code, p.category);
        map.set(p.id, p.category);
      }
    });
    return map;
  }, [connectedPlatforms]);

  // Helper to evaluate a product's sync status across connected platforms and offers
  const getProductSyncStatus = (product: ProductData): 'synced' | 'needs_sync' | 'sync_error' => {
    const offers = product.merchantOffers || [];
    // Check if any offer belongs to a platform that currently has a sync error
    const hasPlatformError = offers.some(offer => {
      const plat = connectedPlatforms.find(cp => cp.code === offer.platform || cp.id === offer.platform);
      return Boolean(plat && (plat.hasSyncError || plat.status === 'error' || plat.syncError));
    });
    if (hasPlatformError || offers.some(o => o.stockStatus === 'out_of_stock')) {
      return 'sync_error';
    }
    // Check if product needs sync (e.g. only 1 offer or large unadjusted price gap > 15%)
    const minP = offers.length > 0 ? Math.min(...offers.map(o => o.price)) : product.currentLowestPrice;
    const maxP = offers.length > 0 ? Math.max(...offers.map(o => o.price)) : product.highestPrice || product.currentLowestPrice;
    const gapPct = maxP > 0 ? Math.round(((maxP - minP) / maxP) * 100) : 0;
    if (offers.length === 0 || gapPct >= 18) {
      return 'needs_sync';
    }
    return 'synced';
  };

  // Helper to check if a product matches a specific platform filter
  const doesProductMatchSpecificPlatform = (product: ProductData, platCode: string): boolean => {
    if (platCode === 'all') return true;
    const offers = product.merchantOffers || [];
    return offers.some(o => {
      const code = (o.platform || '').toLowerCase();
      const name = (o.platformName || '').toLowerCase();
      const merchant = (o.merchantName || '').toLowerCase();
      if (platCode === 'amazon_eg') return code.includes('amazon') || name.includes('أمازون') || name.includes('amazon');
      if (platCode === 'noon_eg') return code.includes('noon') || name.includes('نون') || name.includes('noon');
      if (platCode === 'jumia_eg') return code.includes('jumia') || name.includes('جوميا') || name.includes('jumia');
      if (platCode === 'btech_eg') return code.includes('btech') || name.includes('بي تك') || merchant.includes('بي تك');
      if (platCode === 'homzmart_eg') return code.includes('homzmart') || name.includes('هومزمارت') || merchant.includes('هومزمارت');
      if (platCode === 'wholesale') return o.storeType === 'wholesale' || code.includes('ataba') || code.includes('abdelaziz') || code.includes('gomla');
      return code === platCode;
    });
  };

  // Helper to check if a product matches a platformCategory key
  const doesProductMatchPlatformCategory = (product: ProductData, catKey: string): boolean => {
    if (catKey === 'all') return true;

    // Check offers' platforms
    if (product.merchantOffers && product.merchantOffers.length > 0) {
      const hasMatchingOffer = product.merchantOffers.some(offer => {
        const platCode = offer.platform || '';
        const mappedCat = platformToCategoryMap.get(platCode) || DEFAULT_PLATFORM_CODE_TO_CATEGORY[platCode];
        if (mappedCat === catKey) return true;
        if (catKey === 'retail_chains' && (mappedCat === 'retail_chain' || platCode.includes('btech') || platCode.includes('raneen') || platCode.includes('elaraby'))) return true;
        if (catKey === 'marketplace' && (platCode.includes('amazon') || platCode.includes('noon') || platCode.includes('jumia'))) return true;
        if (catKey === 'electronics_malls' && (platCode.includes('abdelaziz') || platCode.includes('bostan') || platCode.includes('ataba'))) return true;
        if (catKey === 'b2b_wholesale' && (platCode.includes('gomla') || platCode.includes('knz') || offer.storeType === 'wholesale')) return true;
        if (catKey === 'social' && (platCode.includes('facebook') || platCode.includes('tiktok') || platCode.includes('instagram'))) return true;
        return false;
      });
      if (hasMatchingOffer) return true;
    }

    // Check tags or category string matching
    const catObj = platformCategories.find(c => c.key === catKey);
    if (catObj) {
      const lowerTitle = catObj.title.toLowerCase();
      const lowerEng = (catObj.englishTitle || '').toLowerCase();
      if (product.category && (lowerTitle.includes(product.category.toLowerCase()) || product.category.toLowerCase().includes(lowerTitle))) return true;
      if (product.tags && product.tags.some(t => lowerTitle.includes(t.toLowerCase()) || lowerEng.includes(t.toLowerCase()))) return true;
    }

    return false;
  };

  // Distinct product categories (e.g. هواتف ذكية، إلكترونيات، أجهزة منزلية)
  const productCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [products]);

  // Compute counts per platform category for visual badges
  const platformCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    platformCategories.forEach(cat => {
      counts[cat.key] = products.filter(p => doesProductMatchPlatformCategory(p, cat.key)).length;
    });
    return counts;
  }, [products, platformCategories, platformToCategoryMap]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // 1. Platform Category filter
      if (selectedPlatformCategory !== 'all' && !doesProductMatchPlatformCategory(p, selectedPlatformCategory)) {
        return false;
      }

      // 1b. Specific Platform filter (شريط تصفية المنصة)
      if (selectedSpecificPlatform !== 'all' && !doesProductMatchSpecificPlatform(p, selectedSpecificPlatform)) {
        return false;
      }

      // 1c. Sync Status filter (شريط تصفية حالة التزامن)
      if (selectedSyncStatus !== 'all') {
        const prodSyncStatus = getProductSyncStatus(p);
        if (prodSyncStatus !== selectedSyncStatus) return false;
      }

      // 2. Product Sub-Category filter
      if (selectedProductCategory !== 'all' && p.category !== selectedProductCategory) {
        return false;
      }

      // 3. Price range preset filter (شريط تصفية السعر السريع)
      if (priceRangePreset === 'under_3000' && p.currentLowestPrice >= 3000) return false;
      if (priceRangePreset === '3000_to_10000' && (p.currentLowestPrice < 3000 || p.currentLowestPrice > 10000)) return false;
      if (priceRangePreset === '10000_to_25000' && (p.currentLowestPrice < 10000 || p.currentLowestPrice > 25000)) return false;
      if (priceRangePreset === 'above_25000' && p.currentLowestPrice <= 25000) return false;

      // 3b. Custom Min/Max Price range filter
      const parsedMin = minPrice ? parseFloat(minPrice) : null;
      const parsedMax = maxPrice ? parseFloat(maxPrice) : null;
      if (parsedMin !== null && !isNaN(parsedMin) && p.currentLowestPrice < parsedMin) {
        return false;
      }
      if (parsedMax !== null && !isNaN(parsedMax) && p.currentLowestPrice > parsedMax) {
        return false;
      }

      // 4. In-Stock filter
      if (onlyInStock) {
        const hasStock = p.merchantOffers?.some(o => o.stockStatus === 'in_stock');
        if (!hasStock) return false;
      }

      // 5. Only with Savings / Multiple Offers
      if (onlyWithSavings) {
        const offers = p.merchantOffers || [];
        if (offers.length < 2) return false;
        const prices = offers.map(o => o.price);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        if (maxP - minP <= 0) return false;
      }

      // 6. Search Query (Title, Brand, Model, SKU, Barcode, Merchant Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = p.title.toLowerCase().includes(q);
        const titleEnMatch = p.titleEn?.toLowerCase().includes(q);
        const brandMatch = p.brand?.toLowerCase().includes(q);
        const modelMatch = p.model?.toLowerCase().includes(q);
        const skuMatch = p.sku?.toLowerCase().includes(q);
        const barcodeMatch = p.barcode?.toLowerCase().includes(q);
        const tagMatch = p.tags?.some(t => t.toLowerCase().includes(q));
        const merchantMatch = p.merchantOffers?.some(o => 
          o.merchantName?.toLowerCase().includes(q) || 
          o.platformName?.toLowerCase().includes(q)
        );

        if (!titleMatch && !titleEnMatch && !brandMatch && !modelMatch && !skuMatch && !barcodeMatch && !tagMatch && !merchantMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'lowest_price') {
        return a.currentLowestPrice - b.currentLowestPrice;
      }
      if (sortBy === 'highest_price') {
        return b.currentLowestPrice - a.currentLowestPrice;
      }
      if (sortBy === 'most_offers') {
        return (b.merchantOffers?.length || 0) - (a.merchantOffers?.length || 0);
      }
      if (sortBy === 'highest_savings') {
        const savingsA = (a.highestPrice || a.currentLowestPrice) - a.currentLowestPrice;
        const savingsB = (b.highestPrice || b.currentLowestPrice) - b.currentLowestPrice;
        return savingsB - savingsA;
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title, 'ar');
      }
      return 0;
    });
  }, [
    products, 
    selectedPlatformCategory, 
    selectedSpecificPlatform,
    selectedSyncStatus,
    priceRangePreset,
    selectedProductCategory, 
    searchQuery, 
    minPrice, 
    maxPrice, 
    onlyInStock, 
    onlyWithSavings, 
    sortBy, 
    platformToCategoryMap, 
    platformCategories,
    connectedPlatforms
  ]);

  // Active product determination
  const activeProduct = currentProduct || (filteredProducts.length > 0 ? filteredProducts[0] : null);

  // Sorted offers for active product
  const sortedOffers = useMemo(() => {
    if (!activeProduct || !activeProduct.merchantOffers) return [];
    return [...activeProduct.merchantOffers].sort((a, b) => a.price - b.price);
  }, [activeProduct]);

  const lowestOffer = sortedOffers.length > 0 ? sortedOffers[0] : null;
  const highestOffer = sortedOffers.length > 0 ? sortedOffers[sortedOffers.length - 1] : null;
  const maxSavings = lowestOffer && highestOffer ? highestOffer.price - lowestOffer.price : 0;
  const maxSavingsPercent = highestOffer && maxSavings > 0 ? Math.round((maxSavings / highestOffer.price) * 100) : 0;

  // Active filter count for badge indicator
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedPlatformCategory !== 'all') count++;
    if (selectedSpecificPlatform !== 'all') count++;
    if (selectedSyncStatus !== 'all') count++;
    if (priceRangePreset !== 'all') count++;
    if (selectedProductCategory !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (minPrice || maxPrice) count++;
    if (onlyInStock) count++;
    if (onlyWithSavings) count++;
    if (sortBy !== 'lowest_price') count++;
    return count;
  }, [selectedPlatformCategory, selectedSpecificPlatform, selectedSyncStatus, priceRangePreset, selectedProductCategory, searchQuery, minPrice, maxPrice, onlyInStock, onlyWithSavings, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPlatformCategory('all');
    setSelectedSpecificPlatform('all');
    setSelectedSyncStatus('all');
    setPriceRangePreset('all');
    setSelectedProductCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setOnlyInStock(false);
    setOnlyWithSavings(false);
    setSortBy('lowest_price');
  };

  // Setup discount alert
  const handleSetupDiscountAlert = (prod: ProductData) => {
    const targetPrice = Math.round(prod.currentLowestPrice * (1 - discountThreshold / 100));
    
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setAlertSuccessProduct(prod.id);
    setTimeout(() => setAlertSuccessProduct(null), 4000);
    setIsAlertModalOpen(false);

    if (onTriggerDiscountAlert) {
      onTriggerDiscountAlert(prod, discountThreshold, targetPrice);
    }

    if (onShowToast) {
      onShowToast(`تم تفعيل تنبيه الخصم الفوري لـ (${prod.title.substring(0, 20)}...) عند هبوط السعر بنسبة ${discountThreshold}% أو الوصول لـ ${targetPrice.toLocaleString()} ${currency} 🔔⚡`);
    }
  };

  const openDiscountModalForProduct = (prod: ProductData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlertTargetProduct(prod);
    setIsAlertModalOpen(true);
  };

  return (
    <div className="bg-slate-900/90 text-slate-100 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
      
      {/* Header with Title and Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              مقارنة الأسعار اللحظية • السوق المصري
            </span>
            <span className="text-xs text-slate-400">
              تحديث مباشر ⚡
            </span>
            {platformCategories.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 font-medium">
                {platformCategories.length} فئات تصنيف نشطة
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Alexandria']">
            رادار مقارنة أسعار المنتج بين مختلف التجار والمنصات
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-['Cairo']">
            استعرض أسعار نفس المنتج في الوقت الفعلي لدى كبرى المتاجر والمنصات، مع البحث المتقدم بالتصنيفات ومراقبة فروق الأسعار والعروض الترويجية.
          </p>
        </div>

        {/* Global Action and View Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* View Mode Toggle: Grid vs Compact */}
          <div className="inline-flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="عرض شبكي متكامل جذاب للمنتجات (Grid View)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>عرض شبكي</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="عرض شبكي مصغر وسريع (Compact View)"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>عرض مصغر</span>
            </button>
          </div>

          {activeProduct && (
            <button
              type="button"
              id="btn-trigger-realtime-discount-alert"
              onClick={() => openDiscountModalForProduct(activeProduct)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/30 border border-emerald-500/50 active:scale-95"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-200 animate-bounce" />
              <span>تنبيه خصم فوري</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Search & Filtering Section */}
      <div className="space-y-3.5">
        
        {/* Main Search Input & Advanced Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-emerald-400" />
            </div>
            <input
              type="text"
              id="input-realtime-price-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الموديل، الماركة، الباركود، الكود (SKU) أو اسم المتجر/التاجر..."
              className="w-full h-11 ps-10 pe-10 bg-slate-950 border border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 rounded-xl text-xs text-white placeholder:text-slate-500 transition-all font-['Cairo'] shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Advanced Filter Button */}
          <button
            type="button"
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            className={`h-11 px-4 rounded-xl text-xs font-bold font-['Alexandria'] flex items-center justify-center gap-2 border transition-all cursor-pointer shrink-0 select-none ${
              isAdvancedFiltersOpen || activeFiltersCount > 0
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/60 shadow-md shadow-emerald-950/40'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تصفية متقدمة</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {isAdvancedFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Platform Categories Filter Bar (Horizontal Interactive Scroll) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>تصنيفات منصات وقنوات البيع (من شريط المنصات):</span>
            </span>
            {selectedPlatformCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedPlatformCategory('all')}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>إظهار الكل</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar text-xs">
            {/* "All" Category Button */}
            <button
              type="button"
              onClick={() => setSelectedPlatformCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap text-xs flex items-center gap-1.5 ${
                selectedPlatformCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-500'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>كافة المنصات</span>
              <span className="ms-1 font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-black/30">
                ({products.length})
              </span>
            </button>

            {/* Dynamic Buttons for each category in platformCategories */}
            {platformCategories.map((cat) => {
              const IconComponent = getCategoryIconComponent(cat.iconName);
              const count = platformCategoryCounts[cat.key] || 0;
              const isSelected = selectedPlatformCategory === cat.key;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedPlatformCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap text-xs flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                  title={cat.englishTitle ? `${cat.title} (${cat.englishTitle})` : cat.title}
                >
                  <IconComponent className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{cat.title}</span>
                  <span className={`ms-1 font-mono text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-indigo-900/80 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        {isAdvancedFiltersOpen && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              
              {/* Product Sub-Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>فئة المنتج الفرعية:</span>
                </label>
                <select
                  value={selectedProductCategory}
                  onChange={(e) => setSelectedProductCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-hidden font-['Cairo'] cursor-pointer"
                >
                  <option value="all">كافة الفئات الفرعية ({products.length})</option>
                  {productCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat} ({products.filter(p => p.category === cat).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ترتيب المنتجات حسب:</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-hidden font-['Cairo'] cursor-pointer"
                >
                  <option value="lowest_price">الأقل سعراً أولاً (أفضل صفقة)</option>
                  <option value="highest_savings">الأعلى وفراً وتفاوتاً بين التجار</option>
                  <option value="most_offers">الأكثر عروضاً وتنافساً</option>
                  <option value="highest_price">الأعلى سعراً</option>
                  <option value="title_asc">اسم المنتج (أبجدياً أ - ي)</option>
                </select>
              </div>

              {/* Min & Max Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-sky-400" />
                  <span>نطاق السعر ({currency}):</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="الحد الأدنى"
                    className="w-1/2 h-9 px-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="الحد الأقصى"
                    className="w-1/2 h-9 px-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Quick Toggle Checkboxes */}
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>متوفر بالمخزن فقط 📦</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyWithSavings}
                    onChange={(e) => setOnlyWithSavings(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>عروض متعددة بفروق أسعار 🏷️</span>
                </label>
              </div>

            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                نتائج البحث المصفاة: <strong className="text-emerald-400 font-bold">{filteredProducts.length}</strong> من إجمالي {products.length} منتج
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            </div>
          </div>
        )}

        {/* Dedicated Quick Product Filter Bar: Platform, Sync Status, and Price (شريط تصفية المنتجات السريع) */}
        <div
          id="product-display-quick-filter-bar"
          className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/60">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-100 font-['Alexandria']">
                  شريط تصفية المنتجات السريع (المنصة • حالة التزامن • السعر)
                </h3>
                <p className="text-[10px] text-slate-400">
                  فلترة فورية للمنتجات المعروضة للوصول السريع للبيانات ومقارنة الأسعار
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                المعروض: <strong className="text-sky-400 font-black">{filteredProducts.length}</strong> / {products.length} منتج
              </span>
              {(selectedSpecificPlatform !== 'all' || selectedSyncStatus !== 'all' || priceRangePreset !== 'all' || minPrice || maxPrice) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-700 font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Filter by Platform (الفلترة بناءً على المنصة) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
              <label
                htmlFor="filter-products-by-platform"
                className="text-[11px] font-bold text-slate-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-sky-400" />
                  <span>1. المنصة (Platform):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedSpecificPlatform === 'all' ? 'الكل' : selectedSpecificPlatform}
                </span>
              </label>
              <select
                id="filter-products-by-platform"
                value={selectedSpecificPlatform}
                onChange={(e) => setSelectedSpecificPlatform(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs font-bold text-slate-100 focus:border-sky-500 focus:outline-hidden cursor-pointer"
              >
                <option value="all">🌐 جميع المنصات ({products.length})</option>
                <option value="amazon_eg">🛒 أمازون مصر (Amazon.eg)</option>
                <option value="noon_eg">🔵 نون مصر (Noon Partner)</option>
                <option value="jumia_eg">📦 جوميا مصر (Jumia)</option>
                <option value="btech_eg">📱 بي تك (B.TECH)</option>
                <option value="homzmart_eg">🛋️ هومزمارت (Homzmart)</option>
                <option value="wholesale">🏢 أسواق الجملة والموردين</option>
              </select>
            </div>

            {/* 2. Filter by Sync Status (الفلترة بناءً على حالة التزامن) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
              <label
                htmlFor="filter-products-by-sync-status"
                className="text-[11px] font-bold text-slate-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. حالة التزامن (Sync Status):</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {selectedSyncStatus === 'all'
                    ? 'كافة الحالات'
                    : selectedSyncStatus === 'synced'
                    ? 'متزامن 🟢'
                    : selectedSyncStatus === 'needs_sync'
                    ? 'بحاجة لتحديث 🔄'
                    : 'تنبيه تزامن ⚠️'}
                </span>
              </label>
              <select
                id="filter-products-by-sync-status"
                value={selectedSyncStatus}
                onChange={(e) => setSelectedSyncStatus(e.target.value as any)}
                className="w-full h-9 px-2.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs font-bold text-slate-100 focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="all">⚡ جميع حالات التزامن ({products.length})</option>
                <option value="synced">
                  🟢 متزامن لحظياً مع المنصات ({products.filter(p => getProductSyncStatus(p) === 'synced').length})
                </option>
                <option value="needs_sync">
                  🔄 بحاجة لمزامنة / تفاوت سعري ({products.filter(p => getProductSyncStatus(p) === 'needs_sync').length})
                </option>
                <option value="sync_error">
                  ⚠️ خطأ تزامن أو نفاد مخزون ({products.filter(p => getProductSyncStatus(p) === 'sync_error').length})
                </option>
              </select>
            </div>

            {/* 3. Filter by Price (الفلترة بناءً على السعر) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
              <label
                htmlFor="filter-products-by-price-preset"
                className="text-[11px] font-bold text-slate-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3. نطاق السعر ({currency}):</span>
                </span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  {minPrice || maxPrice ? `${minPrice || 0} - ${maxPrice || '∞'}` : 'شرائح سريعة'}
                </span>
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  id="filter-products-by-price-preset"
                  value={priceRangePreset}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setPriceRangePreset(val);
                    if (val !== 'all') {
                      setMinPrice('');
                      setMaxPrice('');
                    }
                  }}
                  className="w-1/2 h-9 px-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs font-bold text-slate-100 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">💰 كل الأسعار</option>
                  <option value="under_3000">أقل من 3,000 {currency}</option>
                  <option value="3000_to_10000">3,000 - 10,000 {currency}</option>
                  <option value="10000_to_25000">10,000 - 25,000 {currency}</option>
                  <option value="above_25000">أعلى من 25,000 {currency}</option>
                </select>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    if (e.target.value) setPriceRangePreset('all');
                  }}
                  placeholder="من"
                  aria-label="الحد الأدنى للسعر"
                  className="w-1/4 h-9 px-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 font-mono focus:border-sky-500 focus:outline-hidden"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    if (e.target.value) setPriceRangePreset('all');
                  }}
                  placeholder="إلى"
                  aria-label="الحد الأقصى للسعر"
                  className="w-1/4 h-9 px-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 font-mono focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
            <span className="text-slate-500 font-bold">الفلاتر النشطة:</span>
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <span>بحث: "{searchQuery}"</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedSpecificPlatform !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-700/50 flex items-center gap-1.5">
                <span>المنصة: {selectedSpecificPlatform}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setSelectedSpecificPlatform('all')} />
              </span>
            )}
            {selectedSyncStatus !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1.5">
                <span>حالة التزامن: {selectedSyncStatus === 'synced' ? 'متزامن لحظياً' : selectedSyncStatus === 'needs_sync' ? 'بحاجة لمزامنة' : 'تنبيه تزامن'}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setSelectedSyncStatus('all')} />
              </span>
            )}
            {priceRangePreset !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 flex items-center gap-1.5">
                <span>شريحة السعر: {priceRangePreset}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setPriceRangePreset('all')} />
              </span>
            )}
            {selectedPlatformCategory !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 flex items-center gap-1.5">
                <span>تصنيف المنصة: {platformCategories.find(c => c.key === selectedPlatformCategory)?.title || selectedPlatformCategory}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setSelectedPlatformCategory('all')} />
              </span>
            )}
            {selectedProductCategory !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <span>فئة: {selectedProductCategory}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setSelectedProductCategory('all')} />
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <span>سعر: {minPrice || 0} إلى {maxPrice || '∞'}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => { setMinPrice(''); setMaxPrice(''); }} />
              </span>
            )}
            {onlyInStock && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1.5">
                <span>متوفر بالمخزن</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setOnlyInStock(false)} />
              </span>
            )}
            {onlyWithSavings && (
              <span className="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-700/50 flex items-center gap-1.5">
                <span>فروق أسعار</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setOnlyWithSavings(false)} />
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 underline ms-2 cursor-pointer"
            >
              مسح الكل
            </button>
          </div>
        )}
      </div>

      {/* Product Display Section */}
      <div className="space-y-3">
        
        {/* Section Heading & Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>المنتجات المتاحة للمقارنة ({filteredProducts.length}):</span>
          </span>
          {activeProduct && (
            <span className="text-[11px] text-emerald-400 font-medium">
              المنتج المحدد حالياً: <strong className="text-white">{activeProduct.title.substring(0, 32)}...</strong>
            </span>
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center bg-slate-950 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white font-['Alexandria']">
              لا توجد منتجات تطابق معايير التصفية والبحث
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              جرب تغيير كلمات البحث، إزالة تصنيف المنصة المحدد، أو إعادة ضبط نطاق الأسعار.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer shadow-xs"
            >
              عرض كافة المنتجات المسجلة ({products.length})
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          
          /* ========================================================================= */
          /* ATTRACTIVE RICH GRID VIEW (عرض شبكي تفصيلي جذاب ومتكامل) */
          /* ========================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const isSelected = activeProduct?.id === p.id;
              const offers = p.merchantOffers || [];
              const offersCount = offers.length;
              const prices = offers.map(o => o.price);
              const minP = prices.length > 0 ? Math.min(...prices) : p.currentLowestPrice;
              const maxP = prices.length > 0 ? Math.max(...prices) : p.highestPrice || p.currentLowestPrice;
              const savings = maxP - minP;
              const savingsPct = maxP > 0 && savings > 0 ? Math.round((savings / maxP) * 100) : 0;

              // Check matching platform category for badge
              const matchedCategoryConfig = platformCategories.find(c => doesProductMatchPlatformCategory(p, c.key));
              const MatchedCategoryIcon = matchedCategoryConfig ? getCategoryIconComponent(matchedCategoryConfig.iconName) : Layers;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className={`bg-slate-900/90 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden relative group hover:border-slate-700 hover:shadow-xl ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-950/50'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Top Image & Floating Badges */}
                  <div className="relative w-full h-44 bg-slate-950 overflow-hidden border-b border-slate-800/80">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay on bottom of image for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Right / Start Badges */}
                    <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5 flex-wrap z-10">
                      {matchedCategoryConfig ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-950/90 text-indigo-300 border border-indigo-700/60 backdrop-blur-md flex items-center gap-1 shadow-xs">
                          <MatchedCategoryIcon className="w-3 h-3 text-indigo-400" />
                          <span>{matchedCategoryConfig.title.split(' ')[0]}</span>
                        </span>
                      ) : p.category ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700/80 backdrop-blur-md shadow-xs">
                          {p.category}
                        </span>
                      ) : null}

                      {p.brand && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/80 text-slate-300 border border-slate-800 backdrop-blur-md">
                          {p.brand}
                        </span>
                      )}
                    </div>

                    {/* Top End: Selection Badge / Alert Shortcut */}
                    <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5 z-10">
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black shadow-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>محدد بالرادار</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => openDiscountModalForProduct(p, e)}
                          className="w-7 h-7 rounded-xl bg-slate-900/90 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition cursor-pointer backdrop-blur-md"
                          title="تفعيل تنبيه الخصم لهذا المنتج"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bottom Image Overlay: Competitor Count & Savings Badge */}
                    <div className="absolute bottom-2 start-2 end-2 flex items-center justify-between text-[11px] z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-slate-200 font-bold flex items-center gap-1">
                        <Store className="w-3 h-3 text-emerald-400" />
                        <span>{offersCount} عروض تجار</span>
                      </span>

                      {savings > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 font-black flex items-center gap-1 shadow-sm">
                          <TrendingDown className="w-3 h-3" />
                          <span>وفر {savingsPct}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      {/* Distinctive Product Live Status Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>نشط للبيع 🟢</span>
                        </span>

                        {savingsPct >= 15 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-rose-400" />
                            <span>حرب أسعار ⚡</span>
                          </span>
                        )}

                        {offers.some(o => o.isBestDeal || o.price === minP) ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                            <span>🏆 فائز بالباي بوكس</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            <span>منافسة سعرية</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5" />
                          <span>بوليصة شحن جاهزة 📦</span>
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white font-['Alexandria'] line-clamp-2 leading-relaxed group-hover:text-emerald-300 transition-colors">
                        {p.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 flex-wrap">
                        {p.model && <span>موديل: <strong className="text-slate-300">{p.model}</strong></span>}
                        {p.barcode && <span className="font-mono opacity-80">باركود: {p.barcode}</span>}
                      </div>
                    </div>

                    {/* Pricing Summary Box */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-slate-400">أقل سعر منافس:</span>
                        <div className="text-sm font-black text-emerald-400 font-mono">
                          {minP.toLocaleString()} <span className="text-[10px] font-bold font-['Cairo']">{currency}</span>
                        </div>
                      </div>

                      {savings > 0 ? (
                        <div className="flex items-baseline justify-between text-[10px] pt-1 border-t border-slate-900 text-slate-400">
                          <span>أعلى سعر: <strong className="text-slate-300 font-mono">{maxP.toLocaleString()}</strong></span>
                          <span className="text-emerald-400 font-bold font-mono">وفر {savings.toLocaleString()} {currency}</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-between text-[10px] pt-1 border-t border-slate-900 text-slate-400">
                          <span>سعر التكلفة المقدرة:</span>
                          <span className="text-slate-300 font-mono font-bold">{p.estimatedWholesaleCost.toLocaleString()} {currency}</span>
                        </div>
                      )}
                    </div>

                    {/* Competitor Platforms Chips */}
                    {offers.length > 0 && (
                      <div className="flex items-center gap-1 overflow-hidden flex-wrap pt-0.5">
                        {offers.slice(0, 3).map((off, oIdx) => (
                          <span
                            key={oIdx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[90px]"
                            title={`${off.merchantName} (${off.price.toLocaleString()} ${currency})`}
                          >
                            {off.merchantName.split(' ')[0]}
                          </span>
                        ))}
                        {offers.length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            +{offers.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(p)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-['Alexandria'] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-emerald-500/40'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isSelected ? 'محدد' : 'مقارنة'}</span>
                      </button>

                      {/* Generate Waybill Button */}
                      {onOpenGenerateWaybillModal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenGenerateWaybillModal(p);
                          }}
                          className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-slate-700 hover:border-emerald-500/50 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                          title="توليد بوليصة شحن وجدولة التوصيل لهذا المنتج 🚚"
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden xl:inline">بوليصة</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => openDiscountModalForProduct(p, e)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700 transition cursor-pointer"
                        title="تفعيل تنبيه الخصومات"
                      >
                        <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (

          /* ========================================================================= */
          /* COMPACT DENSE GRID VIEW (عرض شبكي مصغر) */
          /* ========================================================================= */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {filteredProducts.map((p) => {
              const isSelected = activeProduct?.id === p.id;
              const offersCount = p.merchantOffers?.length || 0;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 relative group ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <span className="absolute -top-1.5 -start-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-md z-10">
                      ✓
                    </span>
                  )}

                  <div className="space-y-1.5">
                    <div className="w-full h-20 rounded-xl overflow-hidden bg-slate-900 relative">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 end-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-bold text-slate-200">
                        {offersCount} تجار
                      </span>
                    </div>

                    <h4 className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight">
                      {p.title}
                    </h4>
                  </div>

                  <div className="pt-1 border-t border-slate-800/80 flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400">أقل سعر:</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      {p.currentLowestPrice.toLocaleString()} {currency}
                    </span>
                  </div>

                  {/* Compact Waybill Button */}
                  {onOpenGenerateWaybillModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenGenerateWaybillModal(p);
                      }}
                      className="w-full mt-1 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                      title="توليد بوليصة شحن لهذا الصنف"
                    >
                      <Truck className="w-3 h-3" />
                      <span>توليد بوليصة</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Product Real-Time Multi-Merchant Price Comparison Table & Grid */}
      {activeProduct && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          
          {/* Active Product Details & Best Deal Highlights */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={activeProduct.imageUrl}
                alt={activeProduct.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white font-['Alexandria']">
                    {activeProduct.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeProduct.brand} • {activeProduct.model}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                  <span>الباركود: <strong className="text-slate-300 font-mono">{activeProduct.barcode || '62288990011'}</strong></span>
                  <span>التصنيف: <strong className="text-slate-300">{activeProduct.category}</strong></span>
                  <span>التكلفة المقدرة: <strong className="text-slate-300 font-mono">{activeProduct.estimatedWholesaleCost.toLocaleString()} {currency}</strong></span>
                </div>
              </div>
            </div>

            {/* Savings Badge */}
            {lowestOffer && highestOffer && maxSavings > 0 && (
              <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl p-3 text-right shrink-0">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  أقصى وفر بين التجار:
                </span>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {maxSavings.toLocaleString()} {currency}
                  <span className="text-xs text-emerald-200 ms-1 font-bold">({maxSavingsPercent}%)</span>
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  بين {lowestOffer.merchantName} و {highestOffer.merchantName}
                </div>
              </div>
            )}

            {/* Quick Waybill Generator Button for Active Product */}
            {onOpenGenerateWaybillModal && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenGenerateWaybillModal(activeProduct)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition cursor-pointer active:scale-95"
                  title="توليد بوليصة شحن وتوصيل فورية للصنف النشط"
                >
                  <Truck className="w-4 h-4 text-emerald-100" />
                  <span>توليد بوليصة شحن 🚚</span>
                </button>
              </div>
            )}
          </div>

          {/* Alert Confirmation Badge if activated */}
          {alertSuccessProduct === activeProduct.id && (
            <div className="p-3 bg-emerald-900/60 border border-emerald-500 text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم حفظ وتفعيل تنبيه الخصومات بنجاح! سيتم إشعارك فور حدوث أي انخفاض بالأسعار 🔔</span>
              </div>
            </div>
          )}

          {/* Comparison Cards for Different Merchants */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>عروض وأسعار التجار المسجلين في السوق المصري ({sortedOffers.length}):</span>
              </span>
              <span className="text-[11px] text-slate-400">
                مُرتبة من الأقل سعراً إلى الأعلى
              </span>
            </div>

            {sortedOffers.length === 0 ? (
              <div className="p-6 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                لا توجد عروض منافسين مسجلة لهذا المنتج حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedOffers.map((offer, idx) => {
                  const isLowest = idx === 0;
                  const priceDiff = lowestOffer ? offer.price - lowestOffer.price : 0;
                  const diffPercent = lowestOffer && lowestOffer.price > 0 ? Math.round((priceDiff / lowestOffer.price) * 100) : 0;

                  return (
                    <div
                      key={offer.id || `${offer.merchantName}-${idx}`}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
                        isLowest
                          ? 'bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-900 border-emerald-500/70 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Lowest Price Banner */}
                      {isLowest && (
                        <div className="flex items-center justify-between bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg -mt-1 shadow-sm">
                          <span>أقل سعر بالسوق 🥇</span>
                          <span>أفضل صفقة شراء</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        {/* Merchant Name & Platform */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                              {offer.merchantName.slice(0, 1)}
                            </div>
                            <div className="text-right">
                              <h5 className="text-xs font-bold text-white font-['Alexandria']">
                                {offer.merchantName}
                              </h5>
                              <span className="text-[10px] text-slate-400">
                                {offer.platformName || offer.platform}
                              </span>
                            </div>
                          </div>

                          <div className="text-end">
                            <div className="text-base font-black text-white font-mono">
                              {offer.price.toLocaleString()} {currency}
                            </div>
                            {isLowest ? (
                              <span className="text-[10px] text-emerald-400 font-bold">
                                السعر القياسي الأقل
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-400 font-bold font-mono">
                                +{priceDiff.toLocaleString()} ({diffPercent}%)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Extra Details (Delivery, Rating, Stock) */}
                        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{offer.deliveryTime || 'شحن خلال 24-48 ساعة'}</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-slate-300 font-bold">{offer.warranty || 'ضمان معتمد'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sky-400">★ {offer.rating || 4.5}</span>
                            <span className="text-[10px] text-slate-500">({offer.reviewCount || 12})</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <span className={`w-1.5 h-1.5 rounded-full ${offer.stockStatus === 'in_stock' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                            <span className="text-[10px] text-slate-300">
                              {offer.stockStatus === 'in_stock' ? 'متوفر بالمخزن' : 'كمية محدودة'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button: Set alert or visit store */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openDiscountModalForProduct(activeProduct)}
                          className="flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white rounded-lg border border-emerald-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Bell className="w-3 h-3 text-emerald-400" />
                          <span>تنبيه بالخصم</span>
                        </button>

                        {offer.url && (
                          <a
                            href={offer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs transition cursor-pointer"
                            title="فتح صفحة العرض بالمتجر"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Setup Discount Alert */}
      {isAlertModalOpen && (alertTargetProduct || activeProduct) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          {(() => {
            const target = alertTargetProduct || activeProduct!;
            return (
              <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsAlertModalOpen(false);
                    setAlertTargetProduct(null);
                  }}
                  className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-['Alexandria']">
                      تفعيل تنبيه الخصومات الفوري
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      إرسال إشعار فوري عند هبوط سعر {target.title.substring(0, 25)}...
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    اختر نسبة الخصم المستهدفة لتلقي التنبيه:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountThreshold(pct)}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          discountThreshold === pct
                            ? 'bg-emerald-600 text-white border border-emerald-400 shadow-md shadow-emerald-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        خصم {pct}%
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>أقل سعر منافس حالي:</span>
                      <span className="text-white font-mono font-bold">{target.currentLowestPrice.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>السعر المستهدف للتنبيه:</span>
                      <span className="font-mono text-sm">
                        {Math.round(target.currentLowestPrice * (1 - discountThreshold / 100)).toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAlertModalOpen(false);
                      setAlertTargetProduct(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetupDiscountAlert(target)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 border border-emerald-500/50 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>تأكيد وتفعيل التنبيه</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};
