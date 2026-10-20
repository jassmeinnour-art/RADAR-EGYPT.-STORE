import React, { useState, useMemo, useEffect } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  Clock,
  TrendingDown,
  TrendingUp,
  Tag,
  Search,
  Filter,
  Sparkles,
  Layers,
  Download,
  Eye,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  DollarSign,
  Building2,
  AlertCircle,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
  FileSpreadsheet,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  HelpCircle,
  X,
  FileText,
  CheckCircle2,
  Percent,
  Store
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import { ProductData } from '../types';

interface ArchivedProductsVaultProps {
  archivedProducts: ProductData[];
  onRestoreProduct: (productId: string, newSuggestedPrice?: number) => void;
  onBulkRestoreProducts: (productIds: string[]) => void;
  onPermanentDeleteProduct?: (productId: string) => void;
  onBulkDeleteProducts?: (productIds: string[]) => void;
  onInspectProductRadar?: (product: ProductData) => void;
  currency?: string;
  onOpenArchiveModalForActive?: () => void;
}

export const ARCHIVE_REASONS: {
  id: string;
  label: string;
  description: string;
  badgeClass: string;
  iconColor: string;
}[] = [
  {
    id: 'all',
    label: 'جميع أسباب الأرشفة',
    description: 'عرض كافة المنتجات المؤرشفة',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    iconColor: 'text-slate-500'
  },
  {
    id: 'discontinued_model',
    label: 'انتهاء الموديل / طرح جيل أحدث',
    description: 'تم توقف خط الإنتاج واستبداله بموديل أحدث',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'out_of_stock_supplier',
    label: 'توقف المورد / الاستيراد',
    description: 'نفاد المخزون لدى تجار الجملة أو صعوبة الاستيراد',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    iconColor: 'text-sky-600'
  },
  {
    id: 'unprofitable_margin',
    label: 'تآكل الهامش والعمولات',
    description: 'ارتفاع عمولات المنصة أو انخفاض سعر السوق دون الجملة',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    iconColor: 'text-rose-600'
  },
  {
    id: 'seasonal_ended',
    label: 'انتهاء الموسم أو المناسبة',
    description: 'منتج مرتبط بفترة محددة مثل الأعياد أو المواسم',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    iconColor: 'text-purple-600'
  },
  {
    id: 'low_demand',
    label: 'تراجع الطلب بالسوق',
    description: 'انخفاض معدل البيع اليومي وتجميد السيولة',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    iconColor: 'text-sky-600'
  },
  {
    id: 'custom_reason',
    label: 'أسباب أخرى مخصصة',
    description: 'ملاحظات خاصة بإدارة المتجر',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    iconColor: 'text-slate-600'
  }
];

export const ArchivedProductsVault: React.FC<ArchivedProductsVaultProps> = ({
  archivedProducts,
  onRestoreProduct,
  onBulkRestoreProducts,
  onPermanentDeleteProduct,
  onBulkDeleteProducts,
  onInspectProductRadar,
  currency = 'EGP',
  onOpenArchiveModalForActive
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Vault Tabs & Trash Bin State (30 days retention)
  const [vaultTab, setVaultTab] = useState<'archive' | 'trash'>('archive');
  const [trashProducts, setTrashProducts] = useState<ProductData[]>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_trash_bin_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('merchant_radar_trash_bin_v1', JSON.stringify(trashProducts));
    } catch {}
  }, [trashProducts]);

  const handleMoveToTrash = (productId: string) => {
    const productToTrash = archivedProducts.find(p => p.id === productId);
    if (!productToTrash) return;

    const trashedItem: ProductData = {
      ...productToTrash,
      deletedAt: new Date().toISOString(),
      archivedNotes: productToTrash.archivedNotes || 'نُقل إلى سلة المهملات'
    };

    setTrashProducts(prev => [trashedItem, ...prev.filter(p => p.id !== productId)]);
    if (onPermanentDeleteProduct) {
      onPermanentDeleteProduct(productId);
    }
  };

  const handleRestoreFromTrash = (productId: string) => {
    const item = trashProducts.find(p => p.id === productId);
    if (!item) return;

    setTrashProducts(prev => prev.filter(p => p.id !== productId));
    onRestoreProduct(productId, item.suggestedRetailPrice || item.currentLowestPrice);
  };

  const handlePermanentPurge = (productId: string) => {
    setTrashProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleEmptyTrash = () => {
    setTrashProducts([]);
  };

  const getTrashRetentionDaysLeft = (deletedAtStr?: string) => {
    if (!deletedAtStr) return 30;
    const deletedDate = new Date(deletedAtStr);
    const now = new Date();
    const diffTime = now.getTime() - deletedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = 30 - diffDays;
    return Math.max(0, daysLeft);
  };
  const [inspectedProduct, setInspectedProduct] = useState<ProductData | null>(null);
  
  // Restore Confirmation / Price Setting Modal State
  const [restoringProduct, setRestoringProduct] = useState<ProductData | null>(null);
  const [restoreNewPrice, setRestoreNewPrice] = useState<number>(0);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(archivedProducts.map(p => p.category).filter(Boolean));
    return Array.from(set);
  }, [archivedProducts]);

  // Filtered List
  const filteredProducts = useMemo(() => {
    return archivedProducts.filter(product => {
      // Search
      const matchSearch =
        searchQuery === '' ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.titleEn && product.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.archivedNotes && product.archivedNotes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Reason Filter
      const matchReason =
        selectedReason === 'all' || product.archivedReason === selectedReason;

      // Category Filter
      const matchCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchSearch && matchReason && matchCategory;
    });
  }, [archivedProducts, searchQuery, selectedReason, selectedCategory]);

  // Overall Statistics
  const totalArchivedCount = archivedProducts.length;
  const totalPreservedPricePoints = useMemo(() => {
    return archivedProducts.reduce((sum, p) => sum + (p.priceHistory?.length || 0), 0);
  }, [archivedProducts]);

  const totalHistoricalCostValue = useMemo(() => {
    return archivedProducts.reduce((sum, p) => sum + (p.estimatedWholesaleCost || 0), 0);
  }, [archivedProducts]);

  const totalHistoricalRetailValue = useMemo(() => {
    return archivedProducts.reduce((sum, p) => sum + (p.suggestedRetailPrice || p.currentLowestPrice || 0), 0);
  }, [archivedProducts]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const isAllFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every(p => selectedProductIds.includes(p.id));

  // Single Restore Start
  const handleStartRestore = (product: ProductData) => {
    setRestoringProduct(product);
    setRestoreNewPrice(product.suggestedRetailPrice || product.currentLowestPrice || 0);
  };

  const handleConfirmRestore = () => {
    if (!restoringProduct) return;
    onRestoreProduct(restoringProduct.id, restoreNewPrice);
    setRestoringProduct(null);
  };

  // Bulk Restore
  const handleExecuteBulkRestore = () => {
    if (selectedProductIds.length === 0) return;
    onBulkRestoreProducts(selectedProductIds);
    setSelectedProductIds([]);
  };

  // Bulk Delete (Move to Trash Bin)
  const handleExecuteBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (window.confirm(`هل أنت متأكد من نقل ${selectedProductIds.length} منتج إلى سلة المهملات؟ (تحفظ لمدة 30 يوماً)`)) {
      selectedProductIds.forEach(id => handleMoveToTrash(id));
      setSelectedProductIds([]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'كود الصنف (ID)',
      'اسم المنتج',
      'العلامة التجارية',
      'الموديل',
      'التصنيف',
      'تاريخ الأرشفة',
      'سبب الأرشفة',
      'ملاحظات التاجر',
      'سعر الجملة التاريخي (ج.م)',
      'سعر البيع التاريخي (ج.م)',
      'أقل سعر منافس عند الأرشفة (ج.م)',
      'عدد نقاط سجل الأسعار'
    ];

    const rows = filteredProducts.map(p => {
      const reasonObj = ARCHIVE_REASONS.find(r => r.id === p.archivedReason);
      return [
        `"${p.id}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.brand}"`,
        `"${p.model}"`,
        `"${p.category}"`,
        `"${p.archivedAt || 'غير محدد'}"`,
        `"${reasonObj ? reasonObj.label : p.archivedReason || 'أرشيف عام'}"`,
        `"${(p.archivedNotes || '').replace(/"/g, '""')}"`,
        p.estimatedWholesaleCost,
        p.suggestedRetailPrice,
        p.currentLowestPrice,
        p.priceHistory?.length || 0
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `archived_products_vault_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for reason badge
  const getReasonBadge = (reasonId?: string) => {
    const match = ARCHIVE_REASONS.find(r => r.id === reasonId);
    if (!match || match.id === 'all') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <Archive className="w-3 h-3 text-slate-500" />
          <span>مؤرشف عام</span>
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${match.badgeClass}`}>
        <Archive className={`w-3 h-3 ${match.iconColor}`} />
        <span>{match.label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 text-right font-['Cairo']">
      
      {/* Vault Tabs Navigation Bar: Archive vs Trash Bin */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 px-4 pt-3 overflow-x-auto">
        <button
          onClick={() => setVaultTab('archive')}
          className={`pb-3 px-4 font-black text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            vaultTab === 'archive'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>أرشيف المنتجات غير النشطة</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
            {totalArchivedCount}
          </span>
        </button>
        
        <button
          onClick={() => setVaultTab('trash')}
          className={`pb-3 px-4 font-black text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            vaultTab === 'trash'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>سلة المهملات (Trash Bin)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            {trashProducts.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ARCHIVE */}
      {vaultTab === 'archive' && (
        <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 shadow-xs">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  أرشيف المنتجات غير النشطة والمنتهية
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  {totalArchivedCount} منتج محفوظ
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>كامل بيانات الأسعار محفوظة</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                مجلد آمن لعزل المنتجات المتوقفة عن البيع لتنظيف لوحة التحكم وتقليل الفوضى، مع الاحتفاظ الكامل بسجل تحركات الأسعار والمنافسين وبيانات الجملة للرجوع إليها في أي وقت أو استعادتها بنقرة واحدة.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              id="btn-archive-export-csv"
              onClick={handleExportCSV}
              disabled={filteredProducts.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 disabled:opacity-50"
              title="تصدير كشف الأرشيف بصيغة Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير كشف الأرشيف (CSV)</span>
            </button>
            {onOpenArchiveModalForActive && (
              <button
                id="btn-archive-new-item"
                onClick={onOpenArchiveModalForActive}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>أرشفة منتج نشط الآن</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Analytical KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>إجمالي المنتجات المؤرشفة</span>
              <Archive className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {totalArchivedCount} <span className="text-xs font-normal text-slate-500">صنف</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">معزولة عن القوائم النشطة</p>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>سجل نقاط الأسعار المحفوظة</span>
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-950 mt-1">
              {totalPreservedPricePoints} <span className="text-xs font-normal text-slate-500">نقطة رصد</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">100% حفظ لتاريخ التسعير</p>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>تكلفة الجملة التاريخية للمخزون</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {totalHistoricalCostValue.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">وفق أسعار التوريد المسجلة</p>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>القيمة التقديرية للبيع التاريخي</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-950 mt-1">
              {totalHistoricalRetailValue.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">جاهز للاسترجاع وإعادة التسعير</p>
          </div>

        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Top Filter Row: Search, Category, View switcher */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأرشيف باسم المنتج، العلامة، كود SKU، أو الملاحظة..."
              className="w-full pl-3 pr-10 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs text-slate-900 transition-colors focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="all">جميع التصنيفات ({archivedProducts.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({archivedProducts.filter(p => p.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher: Cards vs Table */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0 self-start md:self-auto">
            <button
              id="btn-archive-view-cards"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض البطاقات التفصيلية"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
            <button
              id="btn-archive-view-table"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض الجدول المدمج السريع"
            >
              <List className="w-3.5 h-3.5" />
              <span>جدول مدمج</span>
            </button>
          </div>

        </div>

        {/* Reason Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold text-[11px] shrink-0 pl-1">سبب الأرشفة:</span>
          {ARCHIVE_REASONS.map(r => {
            const count = r.id === 'all'
              ? archivedProducts.length
              : archivedProducts.filter(p => p.archivedReason === r.id).length;
            const isSelected = selectedReason === r.id;

            return (
              <button
                key={r.id}
                onClick={() => setSelectedReason(r.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span>{r.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-sky-700/50 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Action Toolbar (When items selected) */}
        {selectedProductIds.length > 0 && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
              <CheckSquare className="w-4 h-4 text-sky-600" />
              <span>تم تحديد {selectedProductIds.length} من أصل {filteredProducts.length} منتج</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleExecuteBulkRestore}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة المحددة للنشط ({selectedProductIds.length})</span>
              </button>

              {onBulkDeleteProducts && (
                <button
                  onClick={handleExecuteBulkDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف نهائي</span>
                </button>
              )}

              <button
                onClick={() => setSelectedProductIds([])}
                className="px-2.5 py-1.5 rounded-lg bg-white text-slate-600 hover:text-slate-900 text-xs border border-slate-200 cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Main Content Area: Zero State or Grid / Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mx-auto">
            <Archive className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {archivedProducts.length === 0
              ? 'مجلد الأرشيف فارغ حالياً'
              : 'لم يتم العثور على منتجات مطابقة للبحث أو الفلتر'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {archivedProducts.length === 0
              ? 'يمكنك أرشفة أي منتج توقف بيعه أو نفد مخزونه من لوحة أداء المبيعات أو رادار المنافسين لعزلها وتنظيم لوحة المنتجات النشطة.'
              : 'جرّب تغيير كلمات البحث أو مسح فلتر سبب الأرشفة والتصنيف.'}
          </p>
          {archivedProducts.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedReason('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        
        /* ---------------- Cards Presentation ---------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);
            const pricePointsCount = product.priceHistory?.length || 0;
            const latestPrice = product.suggestedRetailPrice || product.currentLowestPrice;
            const wholesale = product.estimatedWholesaleCost;
            const profit = Math.max(0, latestPrice - wholesale);
            const profitPercent = wholesale > 0 ? Math.round((profit / wholesale) * 100) : 0;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border transition-all p-4.5 space-y-4 shadow-xs hover:border-sky-300 relative ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/20 ring-2 ring-sky-500/20'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Top Section: Checkbox, Image, Title & Reason Badge */}
                <div className="flex items-start gap-3">
                  
                  {/* Select Checkbox */}
                  <button
                    onClick={() => handleToggleSelect(product.id)}
                    className={`mt-1 w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  {/* Product Image */}
                  <div className="relative shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 border border-slate-200 grayscale-30"
                    />
                    <div className="absolute top-1 right-1 bg-slate-900/80 text-white text-[9px] px-1 py-0.2 rounded font-bold">
                      مؤرشف
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {getReasonBadge(product.archivedReason)}
                      {product.archivedAt && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>أرشف في {product.archivedAt}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="font-semibold text-slate-700">{product.brand}</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-medium">{product.category}</span>
                      {product.sku && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 font-mono text-[10px]">SKU: {product.sku}</span>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Merchant Notes / Archive Reason Description */}
                {product.archivedNotes && (
                  <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-2.5 text-xs text-sky-900 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold block text-[11px]">ملاحظة الأرشفة:</span>
                      <p className="text-[11px] text-sky-800 leading-relaxed mt-0.5">{product.archivedNotes}</p>
                    </div>
                  </div>
                )}

                {/* Pricing & Historical Data Metric Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-center">
                  
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">سعر البيع المسجل</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {latestPrice.toLocaleString()} <span className="text-[10px] text-slate-500">{currency}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">سعر الجملة</span>
                    <span className="font-bold text-slate-700 text-xs sm:text-sm">
                      {wholesale.toLocaleString()} <span className="text-[10px] text-slate-500">{currency}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">تاريخ الأسعار المحفوظ</span>
                    <span className="font-bold text-indigo-700 text-xs sm:text-sm flex items-center justify-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{pricePointsCount} نقاط رصد</span>
                    </span>
                  </div>

                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  
                  {/* View Full History Button */}
                  <button
                    onClick={() => setInspectedProduct(product)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="استعراض المخطط التاريخي لحركة السعر وعروض المنافسين"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>سجل الأسعار التاريخي</span>
                  </button>

                  {/* Restore & Live Radar Actions */}
                  <div className="flex items-center gap-1.5">
                    {onInspectProductRadar && (
                      <button
                        onClick={() => onInspectProductRadar(product)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors cursor-pointer"
                        title="فحص الرادار المباشر للمنتج"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleStartRestore(product)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      title="إعادة المنتج إلى قائمة المنتجات النشطة بلوحة التحكم"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استعادة للنشط</span>
                    </button>

                    {onPermanentDeleteProduct && (
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من نقل "${product.title}" إلى سلة المهملات؟ (سيتم الاحتفاظ به لمدة 30 يوماً قبل المسح النهائي)`)) {
                            handleMoveToTrash(product.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        title="نقل إلى سلة المهملات"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* ---------------- Compact Table Presentation ---------------- */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      onClick={handleSelectAllFiltered}
                      className="cursor-pointer"
                      title={isAllFilteredSelected ? 'إلغاء التحديد' : 'تحديد الكل'}
                    >
                      {isAllFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-600 inline" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 inline" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">المنتج المؤرشف والتصنيف</th>
                  <th className="py-3 px-3">سبب وتاريخ الأرشفة</th>
                  <th className="py-3 px-3">سعر البيع المسجل</th>
                  <th className="py-3 px-3">سعر الجملة</th>
                  <th className="py-3 px-3">نقاط تاريخ السعر</th>
                  <th className="py-3 px-3">ملاحظات الأرشفة</th>
                  <th className="py-3 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const pricePointsCount = product.priceHistory?.length || 0;
                  const latestPrice = product.suggestedRetailPrice || product.currentLowestPrice;
                  const wholesale = product.estimatedWholesaleCost;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-sky-50/40 border-r-4 border-sky-600' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(product.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer mx-auto ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-300'
                          }`}
                        >
                          {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Product details */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-[240px]">
                            <span className="font-bold text-slate-900 truncate block text-xs">
                              {product.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-700">{product.brand}</span>
                              <span>•</span>
                              <span className="text-indigo-600 font-medium">{product.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Archive Reason & Date */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {getReasonBadge(product.archivedReason)}
                          {product.archivedAt && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {product.archivedAt}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Registered Retail Price */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs">
                          {latestPrice.toLocaleString()} <span className="text-[10px] text-slate-500">{currency}</span>
                        </div>
                      </td>

                      {/* Wholesale Cost */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-600 font-medium">
                          {wholesale.toLocaleString()} <span className="text-[10px] text-slate-400">{currency}</span>
                        </div>
                      </td>

                      {/* Price points */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setInspectedProduct(product)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>{pricePointsCount} نقاط رصد</span>
                        </button>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-600 truncate max-w-[160px] block" title={product.archivedNotes || 'لا توجد ملاحظات'}>
                          {product.archivedNotes || <span className="text-slate-300 italic">-</span>}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartRestore(product)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                            title="استعادة إلى المنتجات النشطة"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setInspectedProduct(product)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                            title="فحص سجل الأسعار التاريخي"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {onPermanentDeleteProduct && (
                            <button
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من نقل "${product.title}" إلى سلة المهملات؟ (سيتم الاحتفاظ به لمدة 30 يوماً قبل المسح النهائي)`)) {
                                  handleMoveToTrash(product.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                              title="نقل إلى سلة المهملات"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

        </div>
      )}

      {/* TAB 2: TRASH BIN (سلة المهملات - تستقي المنتجات المحذوفة لمدة 30 يوماً) */}
      {vaultTab === 'trash' && (
        <div className="space-y-4">
          {/* Trash Bin Header Banner */}
          <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-rose-950 flex items-center gap-2">
                  <span>سلة مهملات الأرشيف (Trash Bin)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-200 text-rose-900">
                    {trashProducts.length} منتج محذوف
                  </span>
                </h2>
                <p className="text-xs text-rose-800/80 mt-0.5 leading-relaxed">
                  المنتجات المحذوفة من الأرشيف يتم الاحتفاظ بها هنا بشكل آمن لمدة تصل إلى 30 يوماً قبل المسح النهائي التلقائي من قاعدة البيانات، مع إمكانية استعادتها أو حذفها نهائياً في أي وقت.
                </p>
              </div>
            </div>

            {trashProducts.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من إفراغ سلة المهملات بالكامل وحذف كافة المنتجات المحذوفة نهائياً؟')) {
                    handleEmptyTrash();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>إفراغ سلة المهملات بالكامل</span>
              </button>
            )}
          </div>

          {/* Trash Items List / Cards */}
          {trashProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">سلة المهملات فارغة تماماً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                لا توجد منتجات محذوفة في سلة المهملات خلال الـ 30 يوماً الماضية. أي منتج تقوم بحذفه من مجلد الأرشيف سيظهر هنا مؤقتاً.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trashProducts.map(product => {
                const daysLeft = getTrashRetentionDaysLeft(product.deletedAt);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-rose-200/80 shadow-xs hover:shadow-md transition-all p-4 space-y-3 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
                    
                    <div className="flex items-start gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-14 h-14 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0 p-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            متبقي {daysLeft} يوماً للمسح
                          </span>
                          {product.category && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-xs sm:text-sm text-slate-900 mt-1 truncate">
                          {product.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          SKU: {product.sku || product.id} • حُذف في: {product.deletedAt ? product.deletedAt.split('T')[0] : 'اليوم'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center justify-between border border-slate-200">
                      <span>أقل سعر مسجل: <strong className="text-slate-900">{product.currentLowestPrice.toLocaleString()} {currency}</strong></span>
                      <span>الجملة: <strong className="text-slate-900">{product.estimatedWholesaleCost.toLocaleString()} {currency}</strong></span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handlePermanentPurge(product.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="حذف نهائي فوري من القاعدة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف نهائي الآن</span>
                      </button>

                      <button
                        onClick={() => handleRestoreFromTrash(product.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        title="استعادة المنتج مرة أخرى إلى الأرشيف"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استعادة المنتج</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Historical Price Explorer Modal (Inspection Drawer)                       */}
      {/* ========================================================================= */}
      {inspectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-['Cairo']">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base">
                      سجل الأسعار التاريخي الكامل للمنتج المؤرشف
                    </h3>
                    {getReasonBadge(inspectedProduct.archivedReason)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-lg">
                    {inspectedProduct.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectedProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Product Quick Info Card */}
              <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <img
                  src={inspectedProduct.imageUrl}
                  alt={inspectedProduct.title}
                  className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{inspectedProduct.title}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">سعر الجملة</span>
                      <strong className="text-slate-900">{inspectedProduct.estimatedWholesaleCost.toLocaleString()} {currency}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">سعر البيع التاريخي</span>
                      <strong className="text-emerald-600">{inspectedProduct.suggestedRetailPrice.toLocaleString()} {currency}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">أقل سعر منافس حينها</span>
                      <strong className="text-indigo-600">{inspectedProduct.currentLowestPrice.toLocaleString()} {currency}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">تاريخ الأرشفة</span>
                      <strong className="text-sky-700">{inspectedProduct.archivedAt || 'سابق'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Trajectory Chart (Recharts) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>مسار تحركات الأسعار عبر الزمن (سجل كامل بدون حذف)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {inspectedProduct.priceHistory?.length || 0} نقاط رصد مسجلة
                  </span>
                </div>

                <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-4 border border-slate-200 h-64 min-w-0">
                  {inspectedProduct.priceHistory && inspectedProduct.priceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} debounce={50}>
                      <LineChart
                        data={inspectedProduct.priceHistory.map(p => ({
                          date: p.date,
                          price: p.price,
                          merchant: p.merchant,
                          wholesale: inspectedProduct.estimatedWholesaleCost
                        }))}
                        margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                        <YAxis
                          domain={['dataMin - 100', 'dataMax + 100']}
                          tick={{ fontSize: 10, fill: '#64748B' }}
                          tickFormatter={(val) => `${val}`}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs font-['Cairo'] text-right border border-slate-700">
                                  <div className="font-bold text-sky-400 mb-1">{label}</div>
                                  <div className="text-slate-200">
                                    السعر: <strong className="text-emerald-400 font-bold">{data.price} {currency}</strong>
                                  </div>
                                  <div className="text-slate-400 text-[11px] mt-0.5">
                                    الجهة: {data.merchant}
                                  </div>
                                  <div className="text-slate-400 text-[11px] mt-0.5">
                                    تكلفة الجملة: {data.wholesale} {currency}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                        <Line
                          type="monotone"
                          dataKey="price"
                          name="سعر السوق المسجل"
                          stroke="#4F46E5"
                          strokeWidth={2.5}
                          dot={{ fill: '#4F46E5', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="stepAfter"
                          dataKey="wholesale"
                          name="تكلفة الجملة (الأساس)"
                          stroke="#10B981"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                      لا توجد نقاط مسجلة بسجل الأسعار لهذا المنتج
                    </div>
                  )}
                </div>
              </div>

              {/* Historical Competitor Offers Preserved */}
              {inspectedProduct.merchantOffers && inspectedProduct.merchantOffers.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <Store className="w-4 h-4 text-slate-600" />
                    <span>عروض المتاجر والمنافسين المحفوظة عند الأرشفة</span>
                  </h4>
                  <div className="space-y-2">
                    {inspectedProduct.merchantOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {offer.merchantLogo && (offer.merchantLogo.startsWith('http://') || offer.merchantLogo.startsWith('https://') || offer.merchantLogo.startsWith('/')) ? (
                            <img
                              src={offer.merchantLogo}
                              alt={offer.merchantName}
                              className="w-7 h-7 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0 shadow-2xs"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shrink-0">
                              {offer.merchantLogo && offer.merchantLogo.length <= 4 ? offer.merchantLogo : '🏪'}
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block">{offer.merchantName}</span>
                            <span className="text-[10px] text-slate-500">{offer.sellerName || offer.platform}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-slate-900 block">
                            {offer.price.toLocaleString()} {offer.currency || currency}
                          </span>
                          <span className={`text-[10px] font-bold ${
                            offer.stockStatus === 'in_stock' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {offer.stockStatus === 'in_stock' ? 'كان متوفراً' : 'نفد المخزون'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setInspectedProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>

              <button
                onClick={() => {
                  const p = inspectedProduct;
                  setInspectedProduct(null);
                  handleStartRestore(p);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استعادة هذا المنتج إلى النشط الآن</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Single Restore Confirmation Modal                                         */}
      {/* ========================================================================= */}
      {restoringProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn font-['Cairo']">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            
            <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">استعادة المنتج للنشط</h3>
                  <p className="text-xs text-emerald-100">إرجاع المنتج إلى لوحة التحكم ورادار التسعير</p>
                </div>
              </div>
              <button
                onClick={() => setRestoringProduct(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <img
                  src={restoringProduct.imageUrl}
                  alt={restoringProduct.title}
                  className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{restoringProduct.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    سعر الجملة: {restoringProduct.estimatedWholesaleCost.toLocaleString()} {currency}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  تحديد سعر البيع المقترح الجديد (ج.م):
                </label>
                <input
                  type="number"
                  value={restoreNewPrice}
                  onChange={(e) => setRestoreNewPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  سيكون هامش ربحك: <strong className="text-emerald-600 font-bold">{(restoreNewPrice - restoringProduct.estimatedWholesaleCost).toLocaleString()} {currency}</strong>
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-[11px] leading-relaxed">
                ✓ سيتم إرجاع المنتج إلى قائمة المنتجات النشطة ولوحة المبيعات فوراً مع الحفاظ على كامل السجل التاريخي القديم وإضافة تاريخ التنشيط اليوم.
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setRestoringProduct(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد الاستعادة للنشط</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
