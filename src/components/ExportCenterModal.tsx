import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  History,
  DollarSign,
  FileText,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Info,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CalendarCheck,
  CheckSquare,
  Square,
  Search,
  SlidersHorizontal,
  Filter,
  Check,
  ListChecks,
  Store,
  Tag
} from 'lucide-react';
import { ProductData, WatchlistItem } from '../types';
import {
  exportProductsToCSV,
  exportPriceHistoryLogToCSV,
  exportFinancialValuationReportToCSV,
  exportSingleProductFullAuditCSV,
  downloadProductImportTemplate,
  exportEndOfDayMasterReportToCSV,
  exportBulkSelectedProductsToCSV,
  isExportOverdue24h,
  getHoursSinceLastExport,
  getLastExportTimestamp
} from '../utils/csvProductManager';

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: ProductData[];
  watchlist?: WatchlistItem[];
  currentProduct?: ProductData;
  currency?: string;
  onSuccessToast?: (msg: string) => void;
  onOpenAiExcelEnricher?: () => void;
  defaultMode?: 'bulk_export' | 'standard';
}

export const ExportCenterModal: React.FC<ExportCenterModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  watchlist = [],
  currentProduct,
  currency = 'EGP',
  onSuccessToast,
  onOpenAiExcelEnricher,
  defaultMode = 'bulk_export',
}) => {
  // Mode switcher: 'bulk_export' (التصدير المجمع) vs 'standard' (التقارير العامة)
  const [exportMode, setExportMode] = useState<'bulk_export' | 'standard'>(defaultMode);

  // General options
  const [includeArchived, setIncludeArchived] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [hoursElapsed, setHoursElapsed] = useState<number | null>(null);

  // Bulk Export State
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(() => {
    const activeIds = allProducts.filter(p => !p.isArchived).map(p => p.id);
    return new Set(activeIds.length > 0 ? activeIds : allProducts.map(p => p.id));
  });
  const [bulkSearchQuery, setBulkSearchQuery] = useState<string>('');
  const [bulkCategory, setBulkCategory] = useState<string>('all');
  const [bulkCompetitiveFilter, setBulkCompetitiveFilter] = useState<'all' | 'winning' | 'outpriced' | 'high_margin'>('all');
  const [bulkIncludeCompetitors, setBulkIncludeCompetitors] = useState<boolean>(true);
  const [bulkIncludePriceHistory, setBulkIncludePriceHistory] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setIsOverdue(isExportOverdue24h());
      setHoursElapsed(getHoursSinceLastExport());
      // Auto-select active products if none selected
      if (selectedProductIds.size === 0 && allProducts.length > 0) {
        const activeIds = allProducts.filter(p => !p.isArchived).map(p => p.id);
        setSelectedProductIds(new Set(activeIds.length > 0 ? activeIds : allProducts.map(p => p.id)));
      }
    }
  }, [isOpen, allProducts]);

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
  }, [allProducts]);

  // Filter products for Standard View
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (!includeArchived && p.isArchived) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      return true;
    });
  }, [allProducts, includeArchived, selectedCategory]);

  // Filter products for Bulk Export View
  const bulkFilteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (!includeArchived && p.isArchived) return false;
      if (bulkCategory !== 'all' && p.category !== bulkCategory) return false;

      const retail = p.suggestedRetailPrice || p.currentLowestPrice;
      const wholesale = p.estimatedWholesaleCost || Math.round(retail * 0.75);
      const profit = retail - wholesale;
      const marginPct = retail > 0 ? Math.round((profit / retail) * 100) : 0;

      if (bulkCompetitiveFilter === 'winning' && retail > p.currentLowestPrice) return false;
      if (bulkCompetitiveFilter === 'outpriced' && retail <= p.currentLowestPrice) return false;
      if (bulkCompetitiveFilter === 'high_margin' && marginPct < 25) return false;

      if (bulkSearchQuery.trim()) {
        const q = bulkSearchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTitleEn = (p.titleEn || '').toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        const matchesBrand = (p.brand || '').toLowerCase().includes(q);
        const matchesModel = (p.model || '').toLowerCase().includes(q);
        const matchesBarcode = (p.barcode || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesTitleEn && !matchesSku && !matchesBrand && !matchesModel && !matchesBarcode) {
          return false;
        }
      }

      return true;
    });
  }, [allProducts, includeArchived, bulkCategory, bulkCompetitiveFilter, bulkSearchQuery]);

  // Bulk Selected Products List & Metrics
  const selectedProductsList = useMemo(() => {
    return allProducts.filter(p => selectedProductIds.has(p.id));
  }, [allProducts, selectedProductIds]);

  const totalSelectedCount = selectedProductsList.length;
  const totalSelectedWholesale = useMemo(() => {
    return selectedProductsList.reduce(
      (acc, p) => acc + (p.estimatedWholesaleCost || Math.round((p.suggestedRetailPrice || p.currentLowestPrice) * 0.75)),
      0
    );
  }, [selectedProductsList]);

  const totalSelectedRetail = useMemo(() => {
    return selectedProductsList.reduce(
      (acc, p) => acc + (p.suggestedRetailPrice || p.currentLowestPrice || 0),
      0
    );
  }, [selectedProductsList]);

  const totalSelectedProfit = totalSelectedRetail - totalSelectedWholesale;
  const selectedMarginPct = totalSelectedRetail > 0 ? Math.round((totalSelectedProfit / totalSelectedRetail) * 100) : 0;
  const selectedWinningCount = selectedProductsList.filter(
    p => (p.suggestedRetailPrice || p.currentLowestPrice) <= p.currentLowestPrice
  ).length;

  // Standard metrics
  const totalItems = filteredProducts.length;
  const totalHistoryRecords = filteredProducts.reduce((acc, p) => acc + (p.priceHistory?.length || 1), 0);
  const totalWholesaleValue = filteredProducts.reduce((acc, p) => acc + (p.estimatedWholesaleCost || 0), 0);
  const totalRetailValue = filteredProducts.reduce((acc, p) => acc + (p.suggestedRetailPrice || p.currentLowestPrice || 0), 0);
  const projectedNetProfit = totalRetailValue - totalWholesaleValue;

  // Selection actions
  const toggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      bulkFilteredProducts.forEach(p => next.add(p.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      bulkFilteredProducts.forEach(p => next.delete(p.id));
      return next;
    });
  };

  const selectActiveOnly = () => {
    const active = allProducts.filter(p => !p.isArchived).map(p => p.id);
    setSelectedProductIds(new Set(active));
  };

  const selectWinningOnly = () => {
    const winning = allProducts
      .filter(p => (p.suggestedRetailPrice || p.currentLowestPrice) <= p.currentLowestPrice)
      .map(p => p.id);
    setSelectedProductIds(new Set(winning));
  };

  // Bulk export execution
  const handleBulkExportUnified = () => {
    if (selectedProductsList.length === 0) return;

    setIsExporting('bulk_selected');
    setTimeout(() => {
      try {
        exportBulkSelectedProductsToCSV(selectedProductsList, currency, {
          includeCompetitors: bulkIncludeCompetitors,
          includePriceHistory: bulkIncludePriceHistory,
        });
        setIsOverdue(false);
        setHoursElapsed(0);
        onSuccessToast?.(`تم تصدير التقرير الموحد لـ ${selectedProductsList.length} منتج محدد بنجاح إلى ملف CSV / Excel 📦✅`);
      } catch (err) {
        console.error('Bulk export error:', err);
      } finally {
        setIsExporting(null);
      }
    }, 400);
  };

  const handleExport = (type: 'catalog' | 'history' | 'financial' | 'single' | 'template' | 'endOfDay') => {
    setIsExporting(type);

    setTimeout(() => {
      try {
        if (type === 'endOfDay') {
          exportEndOfDayMasterReportToCSV(filteredProducts, watchlist, currency);
          setIsOverdue(false);
          setHoursElapsed(0);
          onSuccessToast?.('تم تصدير تقرير نهاية اليوم الشامل بنجاح وتحديث تاريخ التصدير! 📁✅');
        } else if (type === 'catalog') {
          exportProductsToCSV(filteredProducts);
          setIsOverdue(false);
          setHoursElapsed(0);
          onSuccessToast?.(`تم تصدير كتالوج ${filteredProducts.length} منتج إلى ملف CSV / Excel بنجاح 📁`);
        } else if (type === 'history') {
          exportPriceHistoryLogToCSV(filteredProducts);
          setIsOverdue(false);
          setHoursElapsed(0);
          onSuccessToast?.(`تم تصدير سجل ${totalHistoryRecords} حركة سعرية إلى ملف CSV / Excel بنجاح 📈`);
        } else if (type === 'financial') {
          exportFinancialValuationReportToCSV(filteredProducts, currency);
          setIsOverdue(false);
          setHoursElapsed(0);
          onSuccessToast?.(`تم تصدير التقرير المالي الشامل للأرشفة المحاسبية بنجاح 💰`);
        } else if (type === 'single' && currentProduct) {
          exportSingleProductFullAuditCSV(currentProduct);
          setIsOverdue(false);
          setHoursElapsed(0);
          onSuccessToast?.(`تم تصدير ملف التدقيق الكامل لمنتج (${currentProduct.title.substring(0, 20)}...) بنجاح 🔍`);
        } else if (type === 'template') {
          downloadProductImportTemplate();
          onSuccessToast?.(`تم تنزيل قالب الاستيراد القياسي بصيغة CSV 📑`);
        }
      } catch (err) {
        console.error('Export error:', err);
      } finally {
        setIsExporting(null);
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black tracking-tight truncate">
                  مركز تصدير البيانات والتقارير الموحدة (Excel / CSV)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  UTF-8 BOM معتمد
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                تصدير فوري متوافق تماماً مع Microsoft Excel، Google Sheets، وأنظمة الفاتورة والمحاسبة المصرية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Navigation Tabs */}
        <div className="p-3 sm:px-6 pt-4 pb-2 bg-slate-50/80 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl max-w-xl">
            <button
              type="button"
              id="tab-mode-bulk-export"
              onClick={() => setExportMode('bulk_export')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                exportMode === 'bulk_export'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>التصدير المجمع (Bulk Export)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                exportMode === 'bulk_export' ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {totalSelectedCount} محددة
              </span>
            </button>

            <button
              type="button"
              id="tab-mode-standard-reports"
              onClick={() => setExportMode('standard')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                exportMode === 'standard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>التقارير الشاملة والأرشفة</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* ======================================================== */}
          {/* TAB 1: BULK EXPORT MODE (وضع التصدير المجمع)            */}
          {/* ======================================================== */}
          {exportMode === 'bulk_export' && (
            <div className="space-y-4" id="bulk-export-mode-view">
              
              {/* Executive Bulk Summary & 1-Click Action Card */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-800/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 flex items-center justify-center font-bold">
                        <Package className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        وضع التصدير المجمع للمنتجات المحددة (Unified Bulk Export)
                      </h4>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        تقرير CSV موحد بضغطة زر واحدة ⚡
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      قم باختيار المنتجات المطلوبة من قائمة الأنشطة لتوليد تقرير موحد يدمج الأكواد (SKU/Barcode)، الأسعار وهوامش الربح، عروض المنافسين في السوق المصري، وتاريخ الرصد في ملف Excel واحد نظيف.
                    </p>
                  </div>

                  {/* 1-Click Unified Export Action */}
                  <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-1.5">
                    <button
                      id="btn-execute-unified-bulk-export"
                      type="button"
                      onClick={handleBulkExportUnified}
                      disabled={isExporting !== null || totalSelectedCount === 0}
                      className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isExporting === 'bulk_selected'
                          ? 'جاري تجهيز التقرير الموحد...'
                          : `تصدير التقرير الموحد (${totalSelectedCount} منتج محدد) ⚡`}
                      </span>
                    </button>
                    {totalSelectedCount === 0 ? (
                      <span className="text-[11px] text-sky-300 flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        حدد منتجاً واحداً على الأقل للتصدير
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-mono">
                        ملف CSV جاهز بترميز UTF-8
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics of Selected Subset */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-indigo-800/60 text-right">
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <span className="text-[11px] text-indigo-200 block">المنتجات المختارة</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-white font-mono">{totalSelectedCount}</span>
                      <span className="text-[10px] text-indigo-300">من {allProducts.length}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <span className="text-[11px] text-indigo-200 block">تكلفة الجملة الإجمالية</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-sky-300 font-mono">{totalSelectedWholesale.toLocaleString()}</span>
                      <span className="text-[10px] text-indigo-300">{currency}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <span className="text-[11px] text-indigo-200 block">القيمة البيعية المقترحة</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-cyan-300 font-mono">{totalSelectedRetail.toLocaleString()}</span>
                      <span className="text-[10px] text-indigo-300">{currency}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <span className="text-[11px] text-indigo-200 block">صافي الربح المتوقع</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-emerald-300 font-mono">+{totalSelectedProfit.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">({selectedMarginPct}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters & Selection Controls Bar */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                {/* Search & Categories */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={bulkSearchQuery}
                      onChange={(e) => setBulkSearchQuery(e.target.value)}
                      placeholder="بحث باسم المنتج، SKU، الموديل، أو الباركود..."
                      className="w-full h-8.5 pr-8 pl-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-slate-800"
                    />
                    {bulkSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setBulkSearchQuery('')}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="h-8.5 bg-white border border-slate-200 rounded-xl px-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all">كل التصنيفات ({allProducts.length})</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat} ({allProducts.filter(p => p.category === cat).length})
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeArchived}
                        onChange={(e) => setIncludeArchived(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer accent-indigo-600"
                      />
                      <span>المؤرشفة ({allProducts.filter(p => p.isArchived).length})</span>
                    </label>
                  </div>
                </div>

                {/* Quick Selection Presets & Competitive Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 ml-1">تحديد سريع:</span>
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                    >
                      تحديد المعروض ({bulkFilteredProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={selectActiveOnly}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      النشطة فقط ⚡
                    </button>
                    <button
                      type="button"
                      onClick={selectWinningOnly}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors cursor-pointer"
                    >
                      المتصدرة بالسعر 🏆
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllFiltered}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>

                  {/* Filter by Competitiveness */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: 'all', label: 'الكل' },
                      { id: 'winning', label: 'المتصدرة 🏆' },
                      { id: 'outpriced', label: 'أعلى من السوق ⚠️' },
                      { id: 'high_margin', label: 'ربح > 25% 💰' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setBulkCompetitiveFilter(f.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                          bulkCompetitiveFilter === f.id
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CSV Options: Competitors & History */}
                <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-slate-200/70 text-[11px] text-slate-700">
                  <span className="font-bold text-slate-500">أقسام التقرير الموحد:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={bulkIncludeCompetitors}
                      onChange={(e) => setBulkIncludeCompetitors(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer accent-indigo-600"
                    />
                    <span>تضمين مقارنات أسعار المنافسين (أمازون، نون، جوميا)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={bulkIncludePriceHistory}
                      onChange={(e) => setBulkIncludePriceHistory(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer accent-indigo-600"
                    />
                    <span>تضمين سجل الحركات وتغيرات الأسعار السابقة</span>
                  </label>
                </div>
              </div>

              {/* Products Selection List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {/* List Header */}
                <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allFilteredSelected = bulkFilteredProducts.every(p => selectedProductIds.has(p.id));
                        if (allFilteredSelected) {
                          deselectAllFiltered();
                        } else {
                          selectAllFiltered();
                        }
                      }}
                      className="flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 cursor-pointer"
                    >
                      {bulkFilteredProducts.length > 0 && bulkFilteredProducts.every(p => selectedProductIds.has(p.id)) ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>المنتج ({bulkFilteredProducts.length})</span>
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-8 text-[11px] text-slate-500">
                    <span>تكلفة الجملة</span>
                    <span>سعر البيع</span>
                    <span>أقل سعر بالسوق</span>
                    <span>الموقف التنافسي</span>
                  </div>
                </div>

                {/* List Items */}
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {bulkFilteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      لا توجد منتجات مطابقة لخيارات البحث أو الفلتر المحددة.
                    </div>
                  ) : (
                    bulkFilteredProducts.map((product) => {
                      const isSelected = selectedProductIds.has(product.id);
                      const retail = product.suggestedRetailPrice || product.currentLowestPrice;
                      const wholesale = product.estimatedWholesaleCost || Math.round(retail * 0.75);
                      const profit = retail - wholesale;
                      const marginPct = retail > 0 ? Math.round((profit / retail) * 100) : 0;
                      const isWinning = retail <= product.currentLowestPrice;
                      const isOutpriced = retail > product.currentLowestPrice;

                      return (
                        <div
                          key={product.id}
                          id={`bulk-item-${product.id}`}
                          onClick={() => toggleSelectProduct(product.id)}
                          className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-indigo-50/50 hover:bg-indigo-50'
                              : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectProduct(product.id)}
                              aria-label={`تحديد ${product.title}`}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600 shrink-0"
                            />

                            <img
                              src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                              alt={product.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="text-xs font-bold text-slate-900 truncate max-w-sm">
                                  {product.title}
                                </h5>
                                {product.isArchived && (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-md font-bold">
                                    مؤرشف
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                                <span className="font-mono bg-slate-100 px-1 rounded">{product.sku || product.id}</span>
                                <span>{product.brand}</span>
                                <span>•</span>
                                <span>{product.category}</span>
                              </div>
                            </div>
                          </div>

                          {/* Financial & Status Stats */}
                          <div className="flex items-center gap-3 sm:gap-6 shrink-0 text-left">
                            <div className="hidden sm:block text-right">
                              <span className="text-[10px] text-slate-400 block">الجملة</span>
                              <span className="text-xs font-bold text-slate-700 font-mono">{wholesale.toLocaleString()}</span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">البيع</span>
                              <span className="text-xs font-black text-indigo-600 font-mono">{retail.toLocaleString()}</span>
                            </div>

                            <div className="hidden sm:block text-right">
                              <span className="text-[10px] text-slate-400 block">أقل منافس</span>
                              <span className="text-xs font-bold text-slate-800 font-mono">{product.currentLowestPrice.toLocaleString()}</span>
                            </div>

                            <div className="shrink-0 min-w-[90px] text-center">
                              {isWinning ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <span>🏆 متصدر</span>
                                </span>
                              ) : isOutpriced ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                                  <span>⚠️ أعلى</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                  <span>⚖️ متطابق</span>
                                </span>
                              )}
                              <span className="block text-[9px] text-emerald-600 font-bold font-mono mt-0.5">
                                +{marginPct}% هامش
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="flex items-center justify-between gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-xs text-indigo-950 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>تم تجهيز {totalSelectedCount} من أصل {allProducts.length} منتج في شيت التصدير الموحد</span>
                </div>
                <button
                  type="button"
                  onClick={handleBulkExportUnified}
                  disabled={isExporting !== null || totalSelectedCount === 0}
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير الشيت الموحد الآن ⚡</span>
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: STANDARD MASTER REPORTS (التقارير الشاملة والأرشيفية) */}
          {/* ======================================================== */}
          {exportMode === 'standard' && (
            <div className="space-y-5" id="standard-reports-mode-view">
              
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">المنتجات بالكتالوج</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{totalItems}</span>
                  <span className="text-[10px] text-slate-400 block">منتج جاهز للتصدير</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">حركات تغير الأسعار</span>
                  <span className="text-lg font-black text-indigo-600 font-mono">{totalHistoryRecords}</span>
                  <span className="text-[10px] text-indigo-400 block">سجل تاريخي بالسوق</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">رأس المال بسعر الجملة</span>
                  <span className="text-lg font-black text-slate-800 font-mono">{totalWholesaleValue.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block">{currency}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">صافي الربح المتوقع</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">+{projectedNetProfit.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 block">{currency}</span>
                </div>
              </div>

              {/* Filter & Customization Options */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={includeArchived}
                      onChange={(e) => setIncludeArchived(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
                    />
                    <span>تضمين المنتجات المؤرشفة ({allProducts.filter(p => p.isArchived).length})</span>
                  </label>

                  <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-medium">التصنيف:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">جميع التصنيفات ({allProducts.length})</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat} ({allProducts.filter(p => p.category === cat).length})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ترميز آمن يدعم اللغة العربية بدون رموز مشوهة</span>
                </div>
              </div>

              {/* End-of-Day 24-Hour Compliance Status Banner & Master Report Card */}
              <div className={`p-5 rounded-2xl border-2 transition-all ${
                isOverdue 
                  ? 'bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-orange-500/10 border-sky-400 shadow-md shadow-sky-500/10' 
                  : 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-emerald-300'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs">
                        <CalendarCheck className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        تقرير نهاية اليوم الشامل (Master End-of-Day Report)
                      </h4>
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>مطلوب للأرشفة (لم يُصدّر منذ {hoursElapsed !== null ? `${hoursElapsed} ساعة` : 'أكثر من 24 ساعة'})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>مكتمل اليوم (آخر تصدير: {hoursElapsed === 0 ? 'الآن' : `منذ ${hoursElapsed} ساعة`})</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      الملف اليومي الأهم للتاجر: يدمج تلقائياً أسعار إغلاق اليوم لكافة المنتجات ({filteredProducts.length} منتج)، تكاليف الجملة، تحركات المنافسين المرصودة ({watchlist.length} منتج مراقب)، وصافي الأرباح المتوقعة، مهيأ للأرشفة والمحاسبة.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => handleExport('endOfDay')}
                      disabled={isExporting !== null || filteredProducts.length === 0}
                      className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50"
                      title="تصدير تقرير نهاية اليوم الشامل فوراً"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isExporting === 'endOfDay' ? 'جاري تجهيز التقرير اليومي...' : 'تصدير تقرير نهاية اليوم الآن (CSV / Excel) ⚡'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Export Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Card 1: Full Catalog Export */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                        ملف شامل
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">
                      1. كتالوج المنتجات والأسعار (Full Catalog)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      تصدير قائمة المنتجات مع أكواد SKU، الباركود، تكلفة الجملة، أسعار البيع، وأقل وأعلى سعر منافس في السوق المصري.
                    </p>
                  </div>

                  <button
                    onClick={() => handleExport('catalog')}
                    disabled={isExporting !== null || filteredProducts.length === 0}
                    className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting === 'catalog' ? 'جاري إنشاء الملف...' : `تصدير الكتالوج (${filteredProducts.length} منتج)`}</span>
                  </button>
                </div>

                {/* Card 2: Price History Log */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/20 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                        <History className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">
                        رصد زمني
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">
                      2. سجل تاريخ تغيرات الأسعار (Price History Log)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      سجل تفصيلي مرتب زمنياً لجميع تحركات وتعديلات الأسعار لكل منتج مع اسم المنصة الراصدة وهوامش الربح السابقة.
                    </p>
                  </div>

                  <button
                    onClick={() => handleExport('history')}
                    disabled={isExporting !== null || filteredProducts.length === 0}
                    className="w-full h-9 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting === 'history' ? 'جاري استخراج السجل...' : `تصدير سجل التغيرات (${totalHistoryRecords} حركة)`}</span>
                  </button>
                </div>

                {/* Card 3: Financial & Valuation Report */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                        محاسبي ومالي
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">
                      3. التقرير المالي وهامش الربح للأرشفة المحاسبية
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      تقرير مالي جاهز للإدارة والمحاسب يتضمن حسابات رأس المال، هامش الربح الاسمي والمئوي، الزيادة على التكلفة (Markup)، وملخص الإجمالي.
                    </p>
                  </div>

                  <button
                    onClick={() => handleExport('financial')}
                    disabled={isExporting !== null || filteredProducts.length === 0}
                    className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting === 'financial' ? 'جاري تجهيز التقرير...' : 'تصدير التقرير المالي والمحاسبي'}</span>
                  </button>
                </div>

                {/* Card 4: Single Product Full Audit */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/20 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
                        المنتج النشط
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">
                      4. تقرير التدقيق للمنتج النشط حالياً
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      تصدير ملف شامل لمنتج <strong className="text-slate-800">{currentProduct ? currentProduct.title.substring(0, 25) + '...' : 'المحدد'}</strong> يتضمن عروض كل المتاجر وأسواق الجملة وتاريخه.
                    </p>
                  </div>

                  <button
                    onClick={() => handleExport('single')}
                    disabled={isExporting !== null || !currentProduct}
                    className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting === 'single' ? 'جاري التصدير...' : 'تصدير تدقيق المنتج النشط'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Quick UTF-8 Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">
                كيفية فتح التقارير المصدرة في برنامج Microsoft Excel و Google Sheets:
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                الملفات مصممة بترميز UTF-8 مع خاصية Byte Order Mark (BOM)، مما يتيح فتحها بالنقر المزدوج المباشر مع ظهور كافة النصوص والحروف العربية والأرقام بشكل سليم ومرتب 100% دون أي رموز مشوهة.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleExport('template')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>تنزيل قالب استيراد المنتجات القياسي (CSV Template)</span>
            </button>

            {onOpenAiExcelEnricher && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiExcelEnricher();
                }}
                className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>رفع شيت إكسيل (AI)</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="h-9 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};

