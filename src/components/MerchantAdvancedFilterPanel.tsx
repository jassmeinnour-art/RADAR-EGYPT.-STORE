import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  RotateCcw, 
  Check, 
  Store, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Pin, 
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { RemoteMerchantClient } from '../types';

export type MerchantPlatformStatusFilter = 'all' | 'active' | 'inactive';
export type MerchantProductCountFilter = 'all' | 'has_products' | 'zero_products' | '1_to_10' | '11_to_50' | 'more_than_50' | 'custom';
export type MerchantLastSyncFilter = 'all' | 'last_24h' | 'last_7d' | 'last_30d' | 'never';

export interface MerchantMetadataStats {
  productsCount: number;
  isPlatformActive: boolean;
  lastSyncTimestamp: string | null;
  lastSyncFormatted: string;
  connectedPlatforms: string[];
}

interface MerchantAdvancedFilterPanelProps {
  allMerchants: RemoteMerchantClient[];
  filteredMerchants: RemoteMerchantClient[];
  activeMerchantId: string;
  pinnedMerchantIds: string[];
  merchantStatsMap: Record<string, MerchantMetadataStats>;
  platformStatusFilter: MerchantPlatformStatusFilter;
  productCountFilter: MerchantProductCountFilter;
  lastSyncFilter: MerchantLastSyncFilter;
  searchQuery: string;
  minProductsInput: string;
  maxProductsInput: string;
  onPlatformStatusChange: (status: MerchantPlatformStatusFilter) => void;
  onProductCountChange: (countFilter: MerchantProductCountFilter) => void;
  onLastSyncChange: (syncFilter: MerchantLastSyncFilter) => void;
  onSearchQueryChange: (query: string) => void;
  onMinProductsChange: (val: string) => void;
  onMaxProductsChange: (val: string) => void;
  onResetFilters: () => void;
  onSelectMerchant: (merchantId: string) => void;
  onTogglePinMerchant: (merchantId: string) => void;
  onSyncMerchantNow?: (merchant: RemoteMerchantClient) => void;
  isSyncingCurrentMerchant?: boolean;
}

export const MerchantAdvancedFilterPanel: React.FC<MerchantAdvancedFilterPanelProps> = ({
  allMerchants,
  filteredMerchants,
  activeMerchantId,
  pinnedMerchantIds,
  merchantStatsMap,
  platformStatusFilter,
  productCountFilter,
  lastSyncFilter,
  searchQuery,
  minProductsInput,
  maxProductsInput,
  onPlatformStatusChange,
  onProductCountChange,
  onLastSyncChange,
  onSearchQueryChange,
  onMinProductsChange,
  onMaxProductsChange,
  onResetFilters,
  onSelectMerchant,
  onTogglePinMerchant,
  onSyncMerchantNow,
  isSyncingCurrentMerchant
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Check if any filter is actively applied
  const hasActiveFilters = 
    platformStatusFilter !== 'all' || 
    productCountFilter !== 'all' || 
    lastSyncFilter !== 'all' || 
    searchQuery.trim().length > 0 ||
    minProductsInput !== '' ||
    maxProductsInput !== '';

  // Quick stats counts
  const totalCount = allMerchants.length;
  const filteredCount = filteredMerchants.length;
  const activePlatformsCount = allMerchants.filter(m => merchantStatsMap[m.id]?.isPlatformActive).length;
  const withProductsCount = allMerchants.filter(m => (merchantStatsMap[m.id]?.productsCount || 0) > 0).length;
  const syncedRecentCount = allMerchants.filter(m => {
    const ts = merchantStatsMap[m.id]?.lastSyncTimestamp;
    if (!ts) return false;
    const diffHours = (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  }).length;

  return (
    <div className="bg-slate-900/95 border-2 border-indigo-500/40 rounded-3xl shadow-2xl p-4 sm:p-5 text-white transition-all backdrop-blur-md">
      {/* Top Header & Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center shrink-0 shadow-inner">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black font-['Alexandria'] text-white">
                نظام فلترة التجار المتقدم (Merchant Filtering System)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                {filteredCount} من {totalCount} تاجر
              </span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  فلاتر نشطة ✨
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              تصفية سريعة للتجار حسب حالة ربط المنصة (نشط/معطل)، عدد المنتجات بالمخزون، وتوقيت آخر مزامنة لحظية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="إلغاء جميع الفلاتر واستعادة القائمة الكاملة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'طي الفلاتر' : 'توسيع الفلاتر'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Filter Controls */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="ابحث باسم المتجر، التاجر، المدينة، رقم الهاتف أو المنصة..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white placeholder-slate-400 text-xs rounded-2xl pr-10 pl-9 py-2.5 outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 3 Main Filter Dimensions in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            
            {/* Dimension 1: Platform Status (Active / Inactive) */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>1. حالة المنصة (Platform Status)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activePlatformsCount} نشط
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onPlatformStatusChange('all')}
                  className={`px-2 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border text-center ${
                    platformStatusFilter === 'all'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  الكل ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => onPlatformStatusChange('active')}
                  className={`px-2 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border text-center flex items-center justify-center gap-1 ${
                    platformStatusFilter === 'active'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                      : 'bg-slate-900 text-emerald-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="التجار ذوو المنصات النشطة والمتصلة حالياً"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                  <span>نشط 🟢</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPlatformStatusChange('inactive')}
                  className={`px-2 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border text-center ${
                    platformStatusFilter === 'inactive'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md font-black'
                      : 'bg-slate-900 text-rose-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="التجار ذوو المنصات غير المتصلة أو المعلقة"
                >
                  معطل ⚪
                </button>
              </div>
            </div>

            {/* Dimension 2: Number of Products */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. عدد المنتجات (Products Count)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {withProductsCount} متوفر
                </span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => onProductCountChange('all')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-black transition cursor-pointer border ${
                    productCountFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => onProductCountChange('has_products')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                    productCountFilter === 'has_products'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-900 text-amber-200 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  لديه منتجات (&gt;0)
                </button>
                <button
                  type="button"
                  onClick={() => onProductCountChange('zero_products')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                    productCountFilter === 'zero_products'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  بدون (0)
                </button>
                <button
                  type="button"
                  onClick={() => onProductCountChange('1_to_10')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                    productCountFilter === '1_to_10'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  1-10
                </button>
                <button
                  type="button"
                  onClick={() => onProductCountChange('11_to_50')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                    productCountFilter === '11_to_50'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  11-50
                </button>
                <button
                  type="button"
                  onClick={() => onProductCountChange('more_than_50')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                    productCountFilter === 'more_than_50'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  +50
                </button>
              </div>

              {/* Custom Min / Max Range Row */}
              <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-400 text-[10px]">نطاق:</span>
                <input
                  type="number"
                  min="0"
                  value={minProductsInput}
                  onChange={(e) => {
                    onMinProductsChange(e.target.value);
                    if (productCountFilter !== 'custom') onProductCountChange('custom');
                  }}
                  placeholder="من"
                  className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] outline-none text-center"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  min="0"
                  value={maxProductsInput}
                  onChange={(e) => {
                    onMaxProductsChange(e.target.value);
                    if (productCountFilter !== 'custom') onProductCountChange('custom');
                  }}
                  placeholder="إلى"
                  className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] outline-none text-center"
                />
                {(minProductsInput !== '' || maxProductsInput !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      onMinProductsChange('');
                      onMaxProductsChange('');
                      onProductCountChange('all');
                    }}
                    className="text-rose-400 hover:text-rose-300 text-[10px] px-1 font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>

            {/* Dimension 3: Last Sync Timestamp */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3. توقيت المزامنة (Last Sync)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {syncedRecentCount} حديث المزامنة
                </span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => onLastSyncChange('all')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-black transition cursor-pointer border ${
                    lastSyncFilter === 'all'
                      ? 'bg-indigo-500 text-slate-950 border-indigo-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  أي وقت
                </button>
                <button
                  type="button"
                  onClick={() => onLastSyncChange('last_24h')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border flex items-center gap-1 ${
                    lastSyncFilter === 'last_24h'
                      ? 'bg-indigo-500 text-slate-950 border-indigo-400 font-black'
                      : 'bg-slate-900 text-indigo-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span>آخر 24 ساعة ⚡</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLastSyncChange('last_7d')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                    lastSyncFilter === 'last_7d'
                      ? 'bg-indigo-500 text-slate-950 border-indigo-400 font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  آخر 7 أيام
                </button>
                <button
                  type="button"
                  onClick={() => onLastSyncChange('last_30d')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                    lastSyncFilter === 'last_30d'
                      ? 'bg-indigo-500 text-slate-950 border-indigo-400 font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  آخر 30 يوماً
                </button>
                <button
                  type="button"
                  onClick={() => onLastSyncChange('never')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                    lastSyncFilter === 'never'
                      ? 'bg-indigo-500 text-slate-950 border-indigo-400 font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="التجار الذين لم تتم مزامنتهم بعد"
                >
                  لم تتم ⏳
                </button>
              </div>
            </div>

          </div>

          {/* Filtered Merchants Interactive Strip / Cards */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-sky-400" />
                <span>قائمة التجار المطابقين للفلترة ({filteredCount}):</span>
              </span>
              <span className="text-[11px] text-slate-400">
                انقر على بطاقة أي تاجر لفتح كتالوجه وإدارته فوراً
              </span>
            </div>

            {filteredMerchants.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/90 border border-dashed border-slate-700 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-black text-white">لا توجد متاجر تطابق معايير الفلترة الحالية</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  يرجى تعديل معايير حالة المنصة، عدد المنتجات بالمخزون، أو توقيت المزامنة، أو مسح خانة البحث.
                </p>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  إعادة ضبط وإظهار جميع التجار ({totalCount})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredMerchants.map(merchant => {
                  const stats = merchantStatsMap[merchant.id] || {
                    productsCount: 0,
                    isPlatformActive: merchant.status === 'active',
                    lastSyncTimestamp: null,
                    lastSyncFormatted: 'لم تتم المزامنة بعد',
                    connectedPlatforms: []
                  };
                  const isSelected = activeMerchantId === merchant.id;
                  const isPinned = pinnedMerchantIds.includes(merchant.id);

                  return (
                    <div
                      key={merchant.id}
                      onClick={() => onSelectMerchant(merchant.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-900/80 border-indigo-400 shadow-lg ring-2 ring-indigo-400/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      {/* Top Row: Store Name & Pin */}
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm font-black text-white truncate" title={merchant.storeName}>
                              {merchant.storeName}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePinMerchant(merchant.id);
                              }}
                              className={`p-1 rounded-lg transition cursor-pointer ${
                                isPinned
                                  ? 'text-amber-400 hover:text-amber-300 bg-amber-500/20'
                                  : 'text-slate-500 hover:text-amber-400 opacity-60 group-hover:opacity-100'
                              }`}
                              title={isPinned ? 'إلغاء التثبيت من المفضلة' : 'تثبيت في المفضلة'}
                            >
                              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current rotate-45' : ''}`} />
                            </button>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="التاجر المحدد حالياً" />
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {merchant.city || 'مصر'} · {merchant.contactPerson || 'التاجر المعتمد'}
                        </div>
                      </div>

                      {/* Middle Row: Platform Status & Product Count Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap my-2.5">
                        {/* Platform Status Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border flex items-center gap-1 ${
                          stats.isPlatformActive
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stats.isPlatformActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          <span>{stats.isPlatformActive ? 'المنصة نشطة' : 'متوقف / غير نشط'}</span>
                        </span>

                        {/* Product Count Badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-mono">
                          <Package className="w-3 h-3 text-amber-400" />
                          <span>{stats.productsCount} منتج</span>
                        </span>
                      </div>

                      {/* Bottom Row: Last Sync Timestamp */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <div className="text-slate-400 flex items-center gap-1 truncate" title={stats.lastSyncTimestamp || 'لم تتم المزامنة'}>
                          <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">{stats.lastSyncFormatted}</span>
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] font-black text-indigo-300 shrink-0">
                            مُختار حالياً ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 group-hover:text-sky-300 transition shrink-0">
                            فتح الكتالوج ←
                          </span>
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
    </div>
  );
};
