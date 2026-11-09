import React, { useState, useEffect, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { supabase, Product, Trader } from '../lib/supabase';

interface ProductsPageProps {
  onShowToast?: (message: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onShowToast }) => {
  // Main list is strictly products
  const [products, setProducts] = useState<Product[]>([]);
  // Traders are ONLY used for the dropdown filter options
  const [traderOptions, setTraderOptions] = useState<Trader[]>([]);
  const [selectedTraderId, setSelectedTraderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New product form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSku, setNewSku] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newStock, setNewStock] = useState<string>('10');
  const [newPlatform, setNewPlatform] = useState<string>('amazon');
  const [newTraderId, setNewTraderId] = useState<string>('');

  const fetchProductsAndFilter = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch main products list with traders(seller_name)
      const { data: prodsData, error: prodsError } = await supabase
        .from('products')
        .select('*, traders(seller_name)')
        .order('created_at', { ascending: false });

      if (prodsError) {
        console.error('Error fetching products:', prodsError);
      }
      setProducts(Array.isArray(prodsData) ? (prodsData as Product[]) : []);

      // 2. Fetch traders ONLY for the dropdown options
      const { data: tradersData } = await supabase
        .from('traders')
        .select('*')
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
  };

  useEffect(() => {
    fetchProductsAndFilter();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSku.trim() || !newPrice) {
      if (onShowToast) onShowToast('⚠️ يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      const prodRecord = {
        title: newTitle.trim(),
        sku: newSku.trim().toUpperCase(),
        price: parseFloat(newPrice) || 0,
        stock: parseInt(newStock) || 0,
        platform: newPlatform,
        trader_id: newTraderId || (traderOptions[0]?.id || 'merchant-mahmeud-said'),
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('products').insert([prodRecord]);
      if (error) throw error;

      if (onShowToast) onShowToast(`✅ تم إضافة المنتج "${newTitle}" بنجاح!`);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewSku('');
      setNewPrice('');
      setNewStock('10');
      fetchProductsAndFilter();
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل حفظ المنتج: ${err.message || 'حدث خطأ'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filter by Trader dropdown
      if (selectedTraderId !== 'all' && p.trader_id !== selectedTraderId) {
        return false;
      }
      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = p.title && p.title.toLowerCase().includes(q);
        const skuMatch = p.sku && p.sku.toLowerCase().includes(q);
        const platformMatch = p.platform && p.platform.toLowerCase().includes(q);
        const traderMatch = (p as any).traders?.seller_name && (p as any).traders.seller_name.toLowerCase().includes(q);
        if (!titleMatch && !skuMatch && !platformMatch && !traderMatch) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedTraderId, searchQuery]);

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
              <span className="font-mono font-bold text-amber-400">{filteredProducts.length}</span>
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
            onClick={fetchProductsAndFilter}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
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
        <div className="w-full md:w-72">
          <label htmlFor="trader-filter-select" className="sr-only">فلتر حسب التاجر</label>
          <div className="relative">
            <Store className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="trader-filter-select"
              value={selectedTraderId}
              onChange={(e) => setSelectedTraderId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 appearance-none shadow-inner cursor-pointer"
            >
              <option value="all">🏢 جميع التجار ({traderOptions.length})</option>
              {traderOptions.map((trader) => (
                <option key={trader.id} value={trader.id}>
                  {trader.seller_name} ({trader.platform})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Products List Area */}
      {isLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-bold">جاري تحميل قائمة المنتجات...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        // Requirement: If products is empty: show "0 منتج"
        <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-black text-amber-400">0 منتج</h4>
            <p className="text-slate-400 text-xs">لا توجد منتجات مسجلة مطابقة للبحث أو للتاجر المحدد</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs inline-flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const traderInfo = (product as any).traders;
            const sellerName = traderInfo?.seller_name || 'تاجر غير محدد';

            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-5 transition-all group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  {/* Top Bar: Trader and Platform */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1.5 truncate max-w-[200px]">
                      <Store className="w-3 h-3 shrink-0" />
                      <span className="truncate">{sellerName}</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {product.platform || 'عام'}
                    </span>
                  </div>

                  {/* Title & SKU */}
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-sky-300 transition line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-500">
                      <Tag className="w-3 h-3 text-slate-600" />
                      <span>{product.sku}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-500 font-bold mb-0.5">السعر الحالي</div>
                      <div className="text-sm font-black text-white font-mono">
                        {product.price.toLocaleString()} ج.م
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-500 font-bold mb-0.5">المخزون المتوفر</div>
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {product.stock || 0} قطعة
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString('ar-EG')
                      : 'محدث'}
                  </span>
                  <span className="text-sky-400 font-bold">نشط في الكتالوج ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
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
                    placeholder="25"
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
                  <option value="bayyaa">بيّاع (Bayyaa)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
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
