import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  RefreshCw, 
  Store, 
  ArrowLeft,
  Mail, 
  Phone, 
  Globe, 
  ExternalLink,
  Building2,
  X,
  CheckCircle2,
  Package,
  Trash2
} from 'lucide-react';
import { supabase, Trader } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/navigation';
import { GlobalEmptyState } from './GlobalEmptyState';

interface TradersPageProps {
  onShowToast?: (message: string) => void;
  onSelectTrader?: (traderId: string) => void;
}

const PLATFORM_DETAILS: Record<string, { name: string; color: string; logo: string }> = {
  amazon: { name: 'أمازون (Amazon)', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300', logo: 'https://cdn.simpleicons.org/amazon/FF9900' },
  noon: { name: 'نون (Noon)', color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' },
  jumia: { name: 'جوميا (Jumia)', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300', logo: 'https://cdn.simpleicons.org/jumia/FF9900' },
  raneen: { name: 'رنين (Raneen)', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300', logo: 'https://www.raneen.com.eg/favicon.ico' },
  kanz: { name: 'كنز (Kanz)', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300', logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  homesmart: { name: 'هوم سمارت (HomeSmart)', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300', logo: 'https://www.homesmart.com.eg/favicon.ico' }
};

import { dataCache } from '../utils/dataCache';
import { DraggableHandle } from './DraggableHandle';
import { useRef } from 'react';

const TraderCard: React.FC<{ trader: Trader; onDelete: (e: React.MouseEvent, t: Trader) => void }> = ({ trader, onDelete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const plat = PLATFORM_DETAILS[trader.platform] || {
    name: trader.platform || 'منصة عامة',
    color: 'border-slate-700 bg-slate-800 text-slate-300',
    logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'
  };
  const sellerId = trader.seller_id || trader.seller_ids?.[trader.platform] || 'غير محدد';
  const productCount = trader.products_count ?? 0;
  const amazonCount = trader.amazon_count ?? 0;
  const noonCount = trader.noon_count ?? 0;

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/traders/${trader.id}`)}
      className="card border hover:border-amber-500/50 transition-all group hover:shadow-xl hover:shadow-amber-500/5 relative overflow-hidden flex flex-col justify-between p-5"
    >
      <DraggableHandle elementId={`trader_card_${trader.id}`} targetRef={cardRef} position="bottom-right" />
      
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center shrink-0">
              <img src={plat.logo} alt={plat.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                {trader.seller_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${plat.color}`}>
                  {plat.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  ID: {sellerId}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => onDelete(e, trader)}
            title="حذف التاجر ومخزونه وفواتيره متتابعاً"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          {trader.email && (
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{trader.email}</span>
            </div>
          )}
          {trader.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{trader.phone}</span>
            </div>
          )}
        </div>

        {/* Independent Product Count Section with stopPropagation */}
        <div className="pt-2 border-t border-slate-800/60 space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products?trader_id=${trader.id}`);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-800 hover:border-sky-500/40 transition flex items-center justify-between cursor-pointer group/btn"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400 group-hover/btn:scale-110 transition-transform" />
              <span>إجمالي المنتجات: <strong className="text-white font-mono text-sm">{productCount}</strong> منتج</span>
            </div>
            <span className="text-[11px] text-amber-400 flex items-center gap-1 font-bold">
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Independent platform buttons (Amazon 45 & Noon 80) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products?trader_id=${trader.id}&platform=amazon`);
              }}
              className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-between transition cursor-pointer hover:border-amber-400"
            >
              <span>أمازون</span>
              <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-[11px] text-white font-bold">
                {amazonCount} منتج
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products?trader_id=${trader.id}&platform=noon`);
              }}
              className="py-1.5 px-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold flex items-center justify-between transition cursor-pointer hover:border-yellow-400"
            >
              <span>نون</span>
              <span className="font-mono bg-yellow-500/20 px-2 py-0.5 rounded text-[11px] text-white font-bold">
                {noonCount} منتج
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
          <span>فتح ملف التاجر الكامل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        <span className="text-[10px] text-slate-500">
          {trader.created_at ? new Date(trader.created_at).toLocaleDateString('ar-EG') : 'مسجل'}
        </span>
      </div>
    </div>
  );
};

export const TradersPage: React.FC<TradersPageProps> = ({ onShowToast, onSelectTrader }) => {
  const { user } = useAuth();
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 20;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formPlatform, setFormPlatform] = useState<string>('amazon');
  const [formSellerId, setFormSellerId] = useState<string>('');

  const fetchTraders = async (targetPage = 1, forceFresh = false) => {
    setIsLoading(true);
    const cacheKey = `traders_page_${targetPage}`;

    if (!forceFresh) {
      const cached = dataCache.get<Trader[]>(cacheKey);
      if (cached) {
        setTraders(cached);
        setIsLoading(false);
        return;
      }
    }

    try {
      const from = (targetPage - 1) * PAGE_SIZE;
      const to = targetPage * PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('traders')
        .select('id, seller_name, email, phone, platform, status, seller_id, seller_link, storefront_link, created_at, products_count')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching traders:', error);
      }

      let list = Array.isArray(data) ? (data as Trader[]) : [];
      
      // Clean up platform strings if they come in the weird format
      list = list.map(t => ({
        ...t,
        platform: (t.platform || '').includes('amazon') ? 'amazon' : (t.platform || '').includes('noon') ? 'noon' : t.platform
      }));

      // Fetch real counts if missing
      const tradersWithCounts = await Promise.all(list.map(async (t) => {
        try {
          const { count: total } = await (supabase
            .from('products')
            .select('*', { count: 'exact' }) as any)
            .eq('trader_id', t.id);
          
          const { count: amz } = await (supabase
            .from('products')
            .select('*', { count: 'exact' }) as any)
            .eq('trader_id', t.id)
            .eq('platform', 'amazon');

          const { count: noon } = await (supabase
            .from('products')
            .select('*', { count: 'exact' }) as any)
            .eq('trader_id', t.id)
            .eq('platform', 'noon');

          return { 
            ...t, 
            products_count: total || 0,
            amazon_count: amz || 0,
            noon_count: noon || 0
          };
        } catch {
          return { ...t, products_count: 0, amazon_count: 0, noon_count: 0 };
        }
      }));

      setHasMore(tradersWithCounts.length === PAGE_SIZE);

      if (targetPage === 1) {
        setTraders(tradersWithCounts);
      } else {
        setTraders((prev) => {
          const combined = [...prev, ...tradersWithCounts];
          const unique = Array.from(new Map(combined.map((t) => [t.id, t])).values());
          return unique;
        });
      }

      dataCache.set(cacheKey, tradersWithCounts);
      setPage(targetPage);
    } catch (err) {
      console.error('Error fetching traders:', err);
      setTraders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders(1);
  }, []);

  const handleOpenTrader = (traderId: string) => {
    if (onSelectTrader) {
      onSelectTrader(traderId);
    } else {
      window.dispatchEvent(new CustomEvent('open_trader_profile', { detail: { traderId } }));
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/traders/${traderId}`);
    }
  };

  const handleSaveTrader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPlatform || !formSellerId.trim()) {
      if (onShowToast) {
        onShowToast('⚠️ املأ اسم التاجر والمنصة ومعرف البائع');
      }
      return;
    }
    setIsSubmitting(true);
    try {
      const newTraderPayload = {
        user_id: user?.uid || (user as any)?.id || 'demo-user',
        seller_name: formName.trim(),
        email: formEmail.trim() || 'mahmeudsaid4@gmail.com',
        phone: formPhone.trim(),
        platform: formPlatform,
        seller_id: formSellerId.trim(),
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('traders')
        .insert([newTraderPayload]);

      if (error) {
        console.error('Supabase trader insert error:', error);
        if (onShowToast) {
          onShowToast(`❌ فشل الحفظ: ${error.message}`);
        }
        return;
      }

      dataCache.invalidate('traders');
      const insertedList = Array.isArray(data) ? data : (data ? [data] : []);
      if (insertedList.length > 0) {
        const insertedTrader = insertedList[0] as Trader;
        setTraders((prev) => [insertedTrader, ...prev.filter(t => t.id !== insertedTrader.id)]);
      }
      if (onShowToast) {
        onShowToast('✅ تم حفظ التاجر بنجاح');
      }
      setIsAddModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormPlatform('amazon');
      setFormSellerId('');
      fetchTraders(1, true);
    } catch (err: any) {
      console.error('Exception during trader save:', err);
      if (onShowToast) {
        onShowToast(`❌ فشل الحفظ: ${err.message || 'حدث خطأ غير متوقع'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTrader = handleSaveTrader;

  const handleDeleteTrader = async (e: React.MouseEvent, trader: Trader) => {
    e.stopPropagation();
    if (!window.confirm(`هل أنت متأكد من حذف التاجر "${trader.seller_name}" نهائياً مع كافة منتجاته ومخزونه وفواتيره؟`)) {
      return;
    }
    try {
      const id = trader.id;
      // Exact 4-step cascading delete per requirement 3
      await supabase.from('inventory_sync').delete().eq('trader_id', id);
      await supabase.from('products').delete().eq('trader_id', id);
      await supabase.from('invoices').delete().eq('trader_id', id);
      await supabase.from('traders').delete().eq('id', id);

      if (onShowToast) {
        onShowToast(`🗑️ تم حذف التاجر "${trader.seller_name}" وتفريغ كافة سجلات المخزون المتزامنة`);
      }
      fetchTraders();
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`❌ فشل حذف التاجر: ${err.message || 'حدث خطأ'}`);
      }
    }
  };

  const filteredTraders = traders.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.seller_name && t.seller_name.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.platform && t.platform.toLowerCase().includes(q))
    );
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-8 font-['Cairo']" dir="rtl">
        {/* Detailed Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] border border-slate-800 bg-slate-900/40 backdrop-blur-xl animate-pulse">
          <div className="flex items-center gap-6 w-full">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 shadow-lg" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-48 bg-slate-800/80 rounded-lg" />
              <div className="h-3.5 w-32 bg-slate-800/60 rounded-lg" />
            </div>
          </div>
          <div className="h-14 w-full md:w-56 bg-amber-500/10 rounded-2xl border border-amber-500/5" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-14 w-full max-w-xl bg-slate-900/40 border border-slate-800/50 rounded-2xl animate-pulse" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 p-6 space-y-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 shadow-md" />
                  <div className="space-y-2.5">
                    <div className="h-4.5 w-32 bg-slate-800/80 rounded-lg" />
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-slate-800/60 rounded-md" />
                      <div className="h-4 w-20 bg-slate-800/40 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/60" />
              </div>
              
              <div className="space-y-3 py-4 border-y border-slate-800/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-800/40" />
                  <div className="h-3 w-40 bg-slate-800/40 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-800/40" />
                  <div className="h-3 w-32 bg-slate-800/40 rounded-md" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-12 w-full bg-slate-800/50 rounded-2xl border border-slate-800/20" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 bg-slate-800/40 rounded-xl" />
                  <div className="h-10 bg-slate-800/40 rounded-xl" />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-24 bg-slate-800/60 rounded-lg" />
                <div className="h-3 w-16 bg-slate-800/40 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If traders is empty: show only "➕ إضافة تاجر جديد" button per exact user requirement
  if (traders.length === 0) {
    return (
      <div className="w-full font-['Cairo']" dir="rtl">
        <GlobalEmptyState
          icon={<Users className="w-10 h-10 text-amber-400" />}
          message="لم يتم العثور على تجار مسجلين"
          description="دليل التجار فارغ حالياً. ابدأ بإضافة تجار جدد لمتابعة أدائهم وربط منتجاتهم من منصات أمازون ونون."
          actionLabel="➕ إضافة تاجر جديد"
          onActionClick={() => setIsAddModalOpen(true)}
        />
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div 
              className="rounded-3xl max-w-md w-full p-6 text-right shadow-2xl border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--card-text)'
              }}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-black text-white">إضافة تاجر جديد</h3>
              </div>
              <form onSubmit={handleAddTrader} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم التاجر / المتجر *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: متجر محمود سعيد"
                    className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 border"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--input-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المنصة الرئيسية</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 border"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--input-text)'
                    }}
                  >
                  <option value="amazon">أمازون مصر (Amazon)</option>
                  <option value="noon">نون مصر (Noon)</option>
                  <option value="jumia">جوميا (Jumia)</option>
                  <option value="raneen">رنين (Raneen)</option>
                  <option value="kanz">كنز (Kanz)</option>
                  <option value="homesmart">هوم سمارت (HomeSmart)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="merchant@domain.com"
                    className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 border"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--input-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 border"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--input-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">معرف البائع (Seller ID)</label>
                  <input
                    type="text"
                    value={formSellerId}
                    onChange={(e) => setFormSellerId(e.target.value)}
                    placeholder="مثال: A2X9Y5Z1EGYPT"
                    className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 border"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--input-text)'
                    }}
                  />
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ التاجر'}
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
  }

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Page Header */}
      <div 
        className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-3xl border shadow-xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--card-text)'
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">دليل التجار الموحد 📚</h2>
            <p className="text-xs text-slate-400">إجمالي التجار المسجلين: {traders.length} تاجر</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>➕ إضافة تاجر جديد</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في التجار بالاسم أو المنصة أو البريد..."
          className="w-full border rounded-2xl pr-11 pl-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--input-text)'
          }}
        />
      </div>

      {/* Traders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTraders.map((trader) => (
          <TraderCard key={trader.id} trader={trader} onDelete={handleDeleteTrader} />
        ))}
      </div>

      {/* Load More Button for Pagination */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchTraders(page + 1)}
            disabled={isLoading}
            className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs border border-amber-500/30 transition shadow-lg inline-flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>عرض التجار الإضافيين (20 تاجر التاليين) ➕</span>
          </button>
        </div>
      )}

      {/* Add Trader Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-black text-white">إضافة تاجر جديد</h3>
            </div>
            <form onSubmit={handleAddTrader} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم التاجر / المتجر *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: متجر محمود سعيد"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المنصة الرئيسية</label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="amazon">أمازون مصر (Amazon)</option>
                  <option value="noon">نون مصر (Noon)</option>
                  <option value="jumia">جوميا (Jumia)</option>
                  <option value="raneen">رنين (Raneen)</option>
                  <option value="kanz">كنز (Kanz)</option>
                  <option value="homesmart">هوم سمارت (HomeSmart)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="merchant@domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+20 100 123 4567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">معرف البائع (Seller ID)</label>
                <input
                  type="text"
                  value={formSellerId}
                  onChange={(e) => setFormSellerId(e.target.value)}
                  placeholder="مثال: A2X9Y5Z1EGYPT"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التاجر'}
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

export default TradersPage;
