import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Store, 
  Package, 
  RefreshCw, 
  Mail, 
  Phone, 
  ExternalLink, 
  Plus, 
  Tag, 
  Globe, 
  Building2,
  CheckCircle2,
  X
} from 'lucide-react';
import { supabase, Trader, Product } from '../lib/supabase';

interface TraderDetailPageProps {
  traderId?: string;
  onBack?: () => void;
  onShowToast?: (msg: string) => void;
}

export const TraderDetailPage: React.FC<TraderDetailPageProps> = ({
  traderId: propTraderId,
  onBack,
  onShowToast
}) => {
  // Extract id from prop or window location
  const id = propTraderId || (typeof window !== 'undefined' ? window.location.pathname.replace('/traders/', '') : '');

  const [trader, setTrader] = useState<Trader | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New product form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSku, setNewSku] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newStock, setNewStock] = useState<string>('15');

  const loadTraderAndProducts = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Fetch trader via exact query requirement:
      // supabase.from('traders').select('*').eq('id', id).single()
      const { data: traderData, error: traderError } = await supabase
        .from('traders')
        .select('*')
        .eq('id', id)
        .single();

      if (traderError) {
        console.error('Error fetching trader by id:', traderError);
      }
      setTrader(traderData as Trader | null);

      // 2. Fetch trader's products via exact query requirement:
      // supabase.from('products').select('*').eq('trader_id', id)
      const { data: prodsData, error: prodsError } = await supabase
        .from('products')
        .select('*')
        .eq('trader_id', id);

      if (prodsError) {
        console.error('Error fetching trader products:', prodsError);
      }
      setProducts(Array.isArray(prodsData) ? (prodsData as Product[]) : []);
    } catch (err) {
      console.error('Failed to load trader detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTraderAndProducts();
  }, [id]);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/traders');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

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
        platform: trader?.platform || 'amazon',
        trader_id: id,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('products').insert([prodRecord]);
      if (error) throw error;

      if (onShowToast) onShowToast(`✅ تم إضافة المنتج "${newTitle}" لمتجر التاجر!`);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewSku('');
      setNewPrice('');
      setNewStock('15');
      loadTraderAndProducts();
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل حفظ المنتج: ${err.message || 'حدث خطأ'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-28 text-center space-y-4 font-['Cairo']" dir="rtl">
        <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-slate-400 text-sm font-bold">جاري تحميل بيانات التاجر والمنتجات...</p>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="w-full py-20 text-center space-y-4 font-['Cairo']" dir="rtl">
        <Building2 className="w-14 h-14 text-slate-600 mx-auto" />
        <h3 className="text-lg font-black text-white">التاجر غير موجود</h3>
        <p className="text-xs text-slate-400">لم يتم العثور على أي تاجر مسجل بهذا المعرف ({id})</p>
        <button
          onClick={handleGoBack}
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs inline-flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى دليل التجار</span>
        </button>
      </div>
    );
  }

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-bold transition shadow"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>العودة إلى دليل التجار</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج لهذا التاجر</span>
          </button>
          <button
            onClick={loadTraderAndProducts}
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trader Info Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Store className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white">{trader.seller_name}</h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  {trader.platform?.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  ID: {trader.seller_id || trader.id}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                {trader.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{trader.email}</span>
                  </span>
                )}
                {trader.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{trader.phone}</span>
                  </span>
                )}
                {trader.storefront_link && (
                  <a
                    href={trader.storefront_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sky-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>رابط واجهة المتجر</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800 text-center min-w-[110px]">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">عدد المنتجات</div>
              <div className="text-lg font-black text-sky-400 font-mono">{products.length}</div>
            </div>
            <div className="flex-1 md:flex-initial bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800 text-center min-w-[110px]">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">إجمالي المخزون</div>
              <div className="text-lg font-black text-emerald-400 font-mono">{totalStock}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trader's Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-black text-white">منتجات التاجر ({products.length})</h3>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-white font-bold text-sm">لا توجد منتجات مسجلة لهذا التاجر بعد</h4>
            <p className="text-xs text-slate-500">أضف أول منتج لمتجر {trader.seller_name}</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-5 transition-all group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      SKU: {product.sku}
                    </span>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {product.platform || trader.platform}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white line-clamp-2 leading-snug">
                    {product.title}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-500 font-bold mb-0.5">السعر</div>
                      <div className="text-sm font-black text-white font-mono">
                        {product.price.toLocaleString()} ج.م
                      </div>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-500 font-bold mb-0.5">المخزون</div>
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {product.stock || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString('ar-EG')
                      : 'مسجل'}
                  </span>
                  <span className="text-emerald-400 font-bold">متوفر للبيع ✓</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-black text-white">إضافة منتج لـ {trader.seller_name}</h3>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المنتج *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: حامل هاتف مغناطيسي للسيارة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز التخزين التعريفي (SKU) *</label>
                <input
                  type="text"
                  required
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="مثال: SKU-MAG-HOLDER"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
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
                    placeholder="350"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الكمية بالمخزن</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50"
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

export default TraderDetailPage;
