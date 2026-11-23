import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  TrendingUp,
  Boxes,
  DollarSign,
  ArrowLeft,
  Filter,
  Trash2,
  Pencil,
  FileSpreadsheet,
  Hash,
  Receipt
} from 'lucide-react';
import {
  supabase,
  isDemoOrOrphanProduct,
  Trader,
  Product,
} from '../lib/supabase';
import { navigate } from '../utils/navigation';
import { GlobalEmptyState } from './GlobalEmptyState';
import { EmergencyErrorBanner } from './EmergencyLoginButton';
import { EditTraderModal } from './EditTraderModal';
import { FetchProductsModal } from './FetchProductsModal';
import { OptimizedImage } from './OptimizedImage';
import { IMPORT_BUTTON_LABEL, buildAmazonAsinImageUrl } from '../utils/sellerCentralExcelImporter';
import { dataCache } from '../utils/dataCache';


interface TraderDetailPageProps {
  traderId?: string;
  onBack?: () => void;
  onShowToast?: (msg: string) => void;
}

function safeFormatSupabaseError(err: any): string {
  if (!err) return 'حدث خطأ غير معروف أثناء الاتصال بقاعدة البيانات';
  if (typeof err === 'string') return err;
  const msg = String(err.message || err.error_description || err.error || '').trim();
  const details = String(err.details || '').trim();
  return [msg, details && !msg.includes(details) ? details : ''].filter(Boolean).join(' — ') || 'Supabase Error';
}

export const TraderDetailPage: React.FC<TraderDetailPageProps> = ({
  traderId: propTraderId,
  onBack,
  onShowToast
}) => {
  // Extract id from prop or window location
  const rawId =
    propTraderId ||
    (typeof window !== 'undefined' ? window.location.pathname.replace(/^\/traders\//, '').split('/')[0] : '');
  const id = (() => {
    try {
      return decodeURIComponent(rawId);
    } catch {
      return rawId;
    }
  })();

  const [trader, setTrader] = useState<Trader | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('all');

  // New product form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSku, setNewSku] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newStock, setNewStock] = useState<string>('15');
  const [newPlatform, setNewPlatform] = useState<string>('amazon');

  const loadTraderAndProducts = async () => {
    if (!id) return;
    setIsLoading(true);
    setFetchError(false);
    setFetchErrorMessage(null);
    try {
      // 1. Fetch trader: supabase.from('traders').select('*').eq('id', id).single()
      const { data: traderData, error: traderError } = await supabase
        .from('traders')
        .select('*')
        .eq('id', id)
        .single();

      if (traderError) {
        console.error('[TraderDetailPage] Error fetching trader by id:', traderError);
        setFetchError(true);
        setFetchErrorMessage(safeFormatSupabaseError(traderError));
      }
      setTrader(traderData as Trader | null);

      const [prodsRes, invoicesRes] = await Promise.all([
        supabase.from('products').select('*').eq('trader_id', id),
        supabase.from('invoices').select('*').eq('trader_id', id),
      ]);

      if (prodsRes.error) {
        console.error('[TraderDetailPage] Error fetching trader products:', prodsRes.error);
        const msg = safeFormatSupabaseError(prodsRes.error);
        setFetchError(true);
        setFetchErrorMessage((prev) => prev || msg);
      }
      if (invoicesRes.error) {
        console.error('[TraderDetailPage] Error fetching trader invoices:', invoicesRes.error);
      }

      const rawProds = Array.isArray(prodsRes.data) ? (prodsRes.data as Product[]) : [];
      const cleanProds = rawProds.filter((p) => !isDemoOrOrphanProduct(p));
      setProducts(cleanProds);
      setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
    } catch (err) {
      console.error('[TraderDetailPage] Failed to load trader detail:', err);
      setFetchError(true);
      setFetchErrorMessage(safeFormatSupabaseError(err));
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
      navigate('/traders');
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
        trader_id: id,
        status: 'active',
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

  const handleDeleteTrader = async () => {
    if (!trader) return;
    if (!window.confirm(`هل أنت متأكد من حذف التاجر "${trader.seller_name}" نهائياً مع كافة منتجاته ومخزونه وفواتيره؟`)) {
      return;
    }
    try {
      const trdId = trader.id;
      // 4-step cascading delete per requirement 3
      await supabase.from('inventory_sync').delete().eq('trader_id', trdId);
      await supabase.from('products').delete().eq('trader_id', trdId);
      await supabase.from('invoices').delete().eq('trader_id', trdId);
      await supabase.from('traders').delete().eq('id', trdId);

      if (onShowToast) {
        onShowToast(`🗑️ تم حذف التاجر "${trader.seller_name}" وكافة متعلقاته بنجاح`);
      }
      handleGoBack();
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`❌ فشل حذف التاجر: ${err.message || 'حدث خطأ'}`);
      }
    }
  };

  // Platform specific partitions and statistics
  const amazonProducts = useMemo(() => {
    return products.filter(p => (p.platform || '').toLowerCase().includes('amazon'));
  }, [products]);

  const noonProducts = useMemo(() => {
    return products.filter(p => (p.platform || '').toLowerCase().includes('noon'));
  }, [products]);

  const jumiaProducts = useMemo(() => {
    return products.filter(p => (p.platform || '').toLowerCase().includes('jumia'));
  }, [products]);

  // Statistics calculation
  const amazonStats = useMemo(() => {
    const count = amazonProducts.length;
    const stock = amazonProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const value = amazonProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 1)), 0);
    return { count, stock, value };
  }, [amazonProducts]);

  const noonStats = useMemo(() => {
    const count = noonProducts.length;
    const stock = noonProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const value = noonProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 1)), 0);
    return { count, stock, value };
  }, [noonProducts]);

  const totalStock = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock || 0), 0);
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 1)), 0) || (amazonStats.value + noonStats.value);
  }, [products, amazonStats, noonStats]);

  const totalSales = useMemo(() => {
    const productsSales = products.reduce((sum, p: any) => {
      const price = Number(p?.price) || 0;
      const soldQty = Number(p?.sold_quantity);
      const qty = Number.isFinite(soldQty) && soldQty > 0 ? soldQty : 1;
      return sum + price * qty;
    }, 0);
    const invoicesSales = invoices.reduce((sum, inv: any) => {
      const amt = Number(inv?.total_amount ?? inv?.total ?? inv?.amount ?? 0) || 0;
      return sum + amt;
    }, 0);
    return Math.round(productsSales + invoicesSales);
  }, [products, invoices]);

  // Filtered products according to tab selection: [الكل] [Amazon] [Noon] [Jumia]
  const displayedProducts = useMemo(() => {
    if (activePlatformFilter === 'all') return products;
    return products.filter(p => p.platform?.toLowerCase() === activePlatformFilter.toLowerCase());
  }, [products, activePlatformFilter]);

  if (!trader) {
    return (
      <div className="w-full py-12 text-center space-y-4 font-['Cairo']" dir="rtl">
        {fetchError && (
          <EmergencyErrorBanner
            message={
              fetchErrorMessage
                ? `خطأ Supabase: ${fetchErrorMessage}`
                : 'تعذر جلب بيانات التاجر من قاعدة البيانات.'
            }
          />
        )}
        <Building2 className="w-14 h-14 text-slate-600 mx-auto" />
        <h3 className="text-lg font-black text-white">
          {isLoading ? 'جاري تحميل بيانات التاجر...' : 'لا توجد بيانات لهذا التاجر'}
        </h3>
        <p className="text-xs text-slate-400">لم يتم العثور على أي تاجر مسجل بهذا المعرف ({id})</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={loadTraderAndProducts}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى دليل التجار</span>
          </button>
        </div>
      </div>
    );
  }

  const traderEmailDisplay = (trader.email || trader.gmail || '').trim();
  const traderStoreUrl = (trader.store_url || trader.storefront_link || '').trim();
  const traderDestUrl = (trader.destination_url || trader.seller_link || '').trim();

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-bold transition shadow cursor-pointer"
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
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteTrader}
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-500 hover:text-rose-400 transition cursor-pointer"
            title="حذف التاجر ومخزونه وفواتيره متتابعاً"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trader Identity Card & Profile Overview */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Store className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white">{trader.seller_name}</h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  {trader.platform?.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  <span>{trader.seller_id || trader.id}</span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap pt-1">
                <span className="flex items-center gap-1.5" dir="ltr">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{traderEmailDisplay || 'غير مضاف'}</span>
                </span>
                <span className="flex items-center gap-1.5" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{trader.phone || 'غير مضاف'}</span>
                </span>
                {traderStoreUrl ? (
                  <a
                    href={traderStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-400 hover:underline font-mono text-[11px]"
                    dir="ltr"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{traderStoreUrl}</span>
                  </a>
                ) : traderDestUrl ? (
                  <a
                    href={traderDestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-amber-300 hover:underline font-mono text-[11px]"
                    dir="ltr"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{traderDestUrl}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Globe className="w-3.5 h-3.5" />
                    <span>رابط المتجر: غير مضاف</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-400" />
              <span>تعديل بيانات التاجر</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFetchModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-black text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{IMPORT_BUTTON_LABEL}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/products?trader_id=${id}`)}
              className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>فتح إدارة المنتجات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Profile Summary Strip: Products Count + Total Sales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-sky-400" />
              <span>عدد المنتجات</span>
            </div>
            <div data-testid="trader-detail-products-count" className="text-lg font-black text-white font-mono mt-1 tabular-nums">
              {products.length.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>إجمالي المبيعات</span>
            </div>
            <div data-testid="trader-detail-total-sales" className="text-lg font-black text-emerald-400 font-mono mt-1 tabular-nums">
              {totalSales.toLocaleString()} ج.م
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>إجمالي المخزون</span>
            </div>
            <div className="text-lg font-black text-amber-300 font-mono mt-1 tabular-nums">
              {totalStock.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-indigo-400" />
              <span>عدد الفواتير</span>
            </div>
            <div className="text-lg font-black text-indigo-300 font-mono mt-1 tabular-nums">
              {invoices.length.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2- قسم "إحصائيات": كارت Amazon وكارت Noon وكارت الإجمالي (مع النقل عند الضغط) */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>إحصائيات المنصات والمخزون (اضغط على أي كارت للتصفية في المنتجات)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* كارت Amazon */}
          <div
            onClick={() => navigate(`/products?trader_id=${id}&platform=amazon`)}
            style={{ cursor: 'pointer' }}
            className="bg-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800/80 rounded-3xl p-5 transition-all group shadow-lg hover:shadow-amber-500/10 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center">
                    <img src="https://cdn.simpleicons.org/amazon/FF9900" alt="Amazon" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">منصة أمازون (Amazon)</h4>
                    <span className="text-[10px] text-amber-400/80 font-bold">متجر رسمي نشط</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  تصفية ↗
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">المنتجات</div>
                  <div className="text-base font-black text-amber-400 font-mono">{amazonStats.count}</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">المخزون</div>
                  <div className="text-base font-black text-emerald-400 font-mono">{amazonStats.stock}</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">القيمة</div>
                  <div className="text-xs font-black text-sky-400 font-mono mt-1">{(amazonStats.value / 1000).toFixed(0)}k ج.م</div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-amber-400 font-bold">
              <span>عرض {amazonStats.count} منتج لأمازون</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-3px] transition-transform" />
            </div>
          </div>

          {/* كارت Noon */}
          <div
            onClick={() => navigate(`/products?trader_id=${id}&platform=noon`)}
            style={{ cursor: 'pointer' }}
            className="bg-slate-900 border border-yellow-500/30 hover:border-yellow-400 hover:bg-slate-800/80 rounded-3xl p-5 transition-all group shadow-lg hover:shadow-yellow-500/10 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg" alt="Noon" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-yellow-400 transition-colors">منصة نون (Noon)</h4>
                    <span className="text-[10px] text-yellow-400/80 font-bold">متجر رسمي نشط</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-yellow-300 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                  تصفية ↗
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">المنتجات</div>
                  <div className="text-base font-black text-yellow-400 font-mono">{noonStats.count}</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">المخزون</div>
                  <div className="text-base font-black text-emerald-400 font-mono">{noonStats.stock}</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">القيمة</div>
                  <div className="text-xs font-black text-sky-400 font-mono mt-1">{(noonStats.value / 1000).toFixed(0)}k ج.م</div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-yellow-400 font-bold">
              <span>عرض {noonStats.count} منتج لنون</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-3px] transition-transform" />
            </div>
          </div>

          {/* كارت الإجمالي لجميع المنصات */}
          <div
            onClick={() => navigate(`/products?trader_id=${id}`)}
            style={{ cursor: 'pointer' }}
            className="bg-slate-900 border border-sky-500/30 hover:border-sky-400 hover:bg-slate-800/80 rounded-3xl p-5 transition-all group shadow-lg hover:shadow-sky-500/10 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center text-sky-400">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-sky-400 transition-colors">إجمالي الكتالوج (الكل)</h4>
                    <span className="text-[10px] text-sky-400/80 font-bold">جميع المنصات مجمعة</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  عرض الكل ↗
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">المنتجات</div>
                  <div className="text-base font-black text-sky-400 font-mono">{products.length || (amazonStats.count + noonStats.count)}</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">المخزون</div>
                  <div className="text-base font-black text-emerald-400 font-mono">{totalStock}</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">القيمة</div>
                  <div className="text-xs font-black text-amber-400 font-mono mt-1">{(totalValue / 1000).toFixed(0)}k ج.م</div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-sky-400 font-bold">
              <span>عرض جميع منتجات التاجر</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-3px] transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 2- Tab المنتجات مع فلتر المنصة: [الكل] [Amazon] [Noon] [Jumia] */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-black text-white">منتجات التاجر المعروضة ({displayedProducts.length})</h3>
          </div>

          {/* فلاتر المنصة بالأعلى */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-bold ml-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>فلتر المنصة:</span>
            </span>

            <button
              onClick={() => setActivePlatformFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePlatformFilter === 'all'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              الكل ({products.length})
            </button>

            <button
              onClick={() => setActivePlatformFilter('amazon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activePlatformFilter === 'amazon'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
              }`}
            >
              <span>أمازون (Amazon)</span>
              <span className="font-mono text-[11px]">({amazonProducts.length || amazonStats.count})</span>
            </button>

            <button
              onClick={() => setActivePlatformFilter('noon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activePlatformFilter === 'noon'
                  ? 'bg-yellow-400 text-slate-950 font-black shadow-md shadow-yellow-400/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-yellow-300'
              }`}
            >
              <span>نون (Noon)</span>
              <span className="font-mono text-[11px]">({noonProducts.length || noonStats.count})</span>
            </button>

            <button
              onClick={() => setActivePlatformFilter('jumia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activePlatformFilter === 'jumia'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-orange-300'
              }`}
            >
              <span>جوميا (Jumia)</span>
              <span className="font-mono text-[11px]">({jumiaProducts.length})</span>
            </button>
          </div>
        </div>

        {displayedProducts.length === 0 ? (
          <GlobalEmptyState
            icon={<Package className="w-10 h-10 text-amber-400" />}
            message="لا توجد منتجات مسجلة لهذا الفلتر"
            description={activePlatformFilter !== 'all' ? `لم يتم العثور على منتجات لمنصة ${activePlatformFilter}` : 'أضف أول منتج لمتجر هذا التاجر'}
            actionLabel="إضافة منتج جديد"
            onActionClick={() => setIsAddModalOpen(true)}
          >
            {activePlatformFilter !== 'all' && (
              <button
                onClick={() => setActivePlatformFilter('all')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                عرض جميع المنصات
              </button>
            )}
          </GlobalEmptyState>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProducts.map((product) => {
              const isAmazon = product.platform?.toLowerCase() === 'amazon';
              const isNoon = product.platform?.toLowerCase() === 'noon';
              const badgeColor = isAmazon
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : isNoon
                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                : 'text-sky-400 bg-sky-500/10 border-sky-500/20';

              const resolvedImg =
                product.image_url || product.image || buildAmazonAsinImageUrl(product.asin);

              return (
                <div
                  key={product.id}
                  className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-5 transition-all group flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        SKU: {product.sku}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {product.platform || trader.platform}
                      </span>
                    </div>

                    <OptimizedImage
                      src={resolvedImg}
                      alt={product.title}
                      asin={product.asin}
                      width={280}
                      height={150}
                      containerClassName="w-full h-[150px]"
                      maxThumbWidth={320}
                    />

                    <h4 className="text-sm font-black text-white line-clamp-2 leading-snug">
                      {product.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-500 font-bold mb-0.5">السعر</div>
                        <div className="text-sm font-black text-white font-mono">
                          {Number(product.price || 0).toLocaleString()} ج.م
                        </div>
                      </div>
                      <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-500 font-bold mb-0.5">المخزون</div>
                        <div className="text-sm font-black text-emerald-400 font-mono">
                          {Number(product.stock ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <button
                      onClick={() => navigate(`/products?trader_id=${id}&platform=${product.platform || 'all'}`)}
                      className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>عرض في إدارة المنتجات</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <span className="text-emerald-400 font-bold">نشط ✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-black text-white">إضافة منتج لـ {trader.seller_name}</h3>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المنصة المستهدفة</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="amazon">أمازون مصر (Amazon)</option>
                  <option value="noon">نون مصر (Noon)</option>
                  <option value="jumia">جوميا (Jumia)</option>
                  <option value="raneen">رنين (Raneen)</option>
                </select>
              </div>

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
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50 cursor-pointer"
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
      {isEditModalOpen && trader && (
        <EditTraderModal
          trader={trader}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(updated) => {
            setTrader((prev) => (prev ? { ...prev, ...updated } : updated));
            dataCache.invalidate('traders');
          }}
          onShowToast={onShowToast}
          onFetchProducts={() => {
            setIsEditModalOpen(false);
            setIsFetchModalOpen(true);
          }}
        />
      )}

      {isFetchModalOpen && trader && (
        <FetchProductsModal
          trader={trader}
          isOpen={isFetchModalOpen}
          onClose={() => setIsFetchModalOpen(false)}
          onShowToast={onShowToast}
          onSyncCompleted={() => {
            const nowIso = new Date().toISOString();
            setTrader((prev) =>
              prev ? { ...prev, last_sync_at: nowIso, last_sync_timestamp: nowIso } : prev
            );
            dataCache.invalidate('traders');
            loadTraderAndProducts();
          }}
        />
      )}
    </div>
  );
};

export default TraderDetailPage;
