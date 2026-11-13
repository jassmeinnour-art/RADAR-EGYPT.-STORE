import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  ArrowLeft,
  Mail,
  Globe,
  X,
  Package,
  Trash2,
  Pencil
} from 'lucide-react';
import { supabase, Trader } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/navigation';
import { GlobalEmptyState } from './GlobalEmptyState';
import { FetchProductsModal } from './FetchProductsModal';
import { EditTraderModal } from './EditTraderModal';
import { dataCache } from '../utils/dataCache';
import { DraggableHandle } from './DraggableHandle';

interface TradersPageProps {
  onShowToast?: (message: string) => void;
  onSelectTrader?: (traderId: string) => void;
}

const PLATFORM_DETAILS: Record<string, { name: string; color: string; logo: string }> = {
  amazon: { name: 'أمازون (Amazon)', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300', logo: 'https://cdn.simpleicons.org/amazon/FF9900' },
  noon: { name: 'نون (Noon)', color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' },
  jumia: { name: 'جوميا (Jumia)', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300', logo: 'https://cdn.simpleicons.org/jumia/FF9900' },
  bayyaa: { name: 'بياع (Bayyaa)', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  raneen: { name: 'رنين (Raneen)', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300', logo: 'https://www.raneen.com.eg/favicon.ico' },
  kanz: { name: 'كنز (Kanz)', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300', logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  homesmart: { name: 'هوم سمارت (HomeSmart)', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300', logo: 'https://www.homesmart.com.eg/favicon.ico' }
};

const TraderCard: React.FC<{
  trader: Trader;
  isFounder: boolean;
  canEdit: boolean;
  isSyncing: boolean;
  onEdit: (t: Trader) => void;
  onDelete: (e: React.MouseEvent, t: Trader) => void;
  onFetch: (t: Trader) => void;
}> = React.memo(({ trader, isFounder, canEdit, isSyncing, onEdit, onDelete, onFetch }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const plat = PLATFORM_DETAILS[trader.platform] || {
    name: trader.platform || 'منصة عامة',
    color: 'border-slate-700 bg-slate-800 text-slate-300',
    logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'
  };
  const sellerId = trader.seller_id || trader.seller_ids?.[trader.platform] || 'غير محدد';
  const storeUrl = trader.store_url || trader.storefront_link || trader.destination_url || trader.seller_link || '';
  const displayEmail = trader.gmail || trader.email || '';

  return (
    <div
      ref={cardRef}
      className="card border relative overflow-hidden flex flex-col justify-between p-5"
    >
      <DraggableHandle elementId={`trader_card_${trader.id}`} targetRef={cardRef} position="bottom-right" />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 p-2 flex items-center justify-center shrink-0">
              <img
                src={plat.logo}
                alt={plat.name}
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
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

          {canEdit && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(trader); }}
                title="تعديل بيانات التاجر"
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/40 transition-colors duration-200 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {isFounder && (
                <button
                  type="button"
                  onClick={(e) => onDelete(e, trader)}
                  title="حذف التاجر"
                  className="p-2 rounded-xl bg-slate-950/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors duration-200 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          {displayEmail && (
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{displayEmail}</span>
            </div>
          )}
          {storeUrl && (
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="truncate text-sky-400 hover:underline"
              >
                {storeUrl}
              </a>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/60 space-y-2">
          {canEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFetch(trader); }}
              disabled={isSyncing}
              className="w-full px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 font-bold text-xs border border-amber-500/40 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>يتم المزامنة...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>سحب كل منتجات المتجر</span>
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products?trader_id=${trader.id}&platform=${trader.platform || 'amazon'}`);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-800 hover:border-sky-500/40 transition-colors duration-200 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              <span>منتجات التاجر</span>
            </div>
            <span className="text-[11px] text-amber-400 flex items-center gap-1 font-bold">
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products?trader_id=${trader.id}&platform=amazon`);
              }}
              className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-between transition-colors duration-200 cursor-pointer"
            >
              <span>أمازون</span>
              <ArrowLeft className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products?trader_id=${trader.id}&platform=noon`);
              }}
              className="py-1.5 px-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold flex items-center justify-between transition-colors duration-200 cursor-pointer"
            >
              <span>نون</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/products?trader_id=${trader.id}&platform=${trader.platform || 'amazon'}`);
          }}
          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
        >
          <span>فتح ملف التاجر</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-slate-500 font-mono">
          {trader.platform?.toUpperCase() || 'ACTIVE'}
        </span>
      </div>
    </div>
  );
});
TraderCard.displayName = 'TraderCard';

export const TradersPage: React.FC<TradersPageProps> = ({ onShowToast }) => {
  const { user, profile, isOwner } = useAuth();
  const userEmail = (user?.email || profile?.email || '').trim().toLowerCase();
  const isFounder = Boolean(user && !user.isAnonymous && isOwner && userEmail === 'jassmeinnour@gmail.com');

  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 20;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState<boolean>(false);
  const [syncingTraderId, setSyncingTraderId] = useState<string | null>(null);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [selectedTraderForFetch, setSelectedTraderForFetch] = useState<Trader | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state for Add Trader modal (with all required fields)
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formPlatform, setFormPlatform] = useState<string>('amazon');
  const [formSellerId, setFormSellerId] = useState<string>('');
  const [formDestinationUrl, setFormDestinationUrl] = useState<string>('');
  const [formStoreUrl, setFormStoreUrl] = useState<string>('');

  const fetchTraders = async (targetPage = 1, forceFresh = false) => {
    if (!userEmail) {
      setTraders([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `traders_${userEmail}_page_${targetPage}`;
    const dropdownCacheKey = `traders_dropdown_options_${userEmail}_v2`;
    const cached = !forceFresh ? dataCache.getStale<Trader[]>(cacheKey) : null;

    if (cached) {
      if (targetPage === 1) {
        setTraders(cached.data);
      } else {
        setTraders((prev) => {
          const combined = [...prev, ...cached.data];
          return Array.from(new Map(combined.map((t) => [t.id, t])).values());
        });
      }
      setHasMore(cached.data.length === PAGE_SIZE);
      setIsLoading(false);
      if (cached.isFresh) return;
    } else if (targetPage === 1) {
      setIsLoading(true);
    }

    try {
      const from = (targetPage - 1) * PAGE_SIZE;
      const to = targetPage * PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('traders')
        .select('id, seller_name, email, gmail, seller_id, platform, storefront_link, store_url, destination_url, seller_link, status, phone, user_id')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching traders:', error);
      }

      let list = Array.isArray(data) ? (data as Trader[]) : [];

      // Client-side defense-in-depth: non-founder sees strictly their own trader records
      if (!isFounder) {
        list = list.filter((t) => {
          const tEmail = String(t.email || t.gmail || '').trim().toLowerCase();
          return tEmail === userEmail;
        });
      }

      // Only show Mahmoud Saeed record as fallback to Founder or mahmeudsaid4@gmail.com when DB returns empty
      if (targetPage === 1 && list.length === 0 && (isFounder || userEmail === 'mahmeudsaid4@gmail.com')) {
        list = [
          {
            id: 'A37JIM7LHQI6IM',
            user_id: user?.uid || 'mahmeudsaid4',
            seller_name: 'محمود سعيد',
            email: 'mahmeudsaid4@gmail.com',
            gmail: 'mahmeudsaid4@gmail.com',
            phone: '',
            platform: 'amazon',
            status: 'active',
            seller_id: 'A37JIM7LHQI6IM',
            destination_url: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
            seller_link: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
            store_url: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
            storefront_link: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
          },
        ];
      }

      list = list.map((t) => ({
        ...t,
        platform: (t.platform || '').includes('amazon')
          ? 'amazon'
          : (t.platform || '').includes('noon')
          ? 'noon'
          : t.platform,
      }));

      setHasMore(list.length === PAGE_SIZE);

      if (targetPage === 1) {
        setTraders(list);
        dataCache.set(dropdownCacheKey, list.map((t) => ({ id: t.id, seller_name: t.seller_name, platform: t.platform })));
      } else {
        setTraders((prev) => {
          const combined = [...prev, ...list];
          return Array.from(new Map(combined.map((t) => [t.id, t])).values());
        });
      }

      dataCache.set(cacheKey, list);
      setPage(targetPage);
    } catch (err) {
      console.error('Error fetching traders:', err);
      if (!cached && targetPage === 1) setTraders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, isFounder]);

  const handleEditTrader = (trader: Trader) => {
    setSelectedTrader(trader);
    setIsEditModalOpen(true);
  };

  const handleFetchProducts = (trader: Trader) => {
    setSyncingTraderId(trader.id);
    setSelectedTraderForFetch(trader);
    setIsFetchModalOpen(true);
    setSyncingTraderId(null);
  };

  const handleUpdateTrader = (updated: Trader) => {
    setTraders((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    dataCache.invalidate('traders');
  };

  const handleSaveTrader = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (formEmail.trim() || (!isFounder ? userEmail : '')).toLowerCase();
    if (!formName.trim() || !formPlatform || !formSellerId.trim() || !cleanEmail) {
      onShowToast?.('⚠️ يرجى إدخال اسم التاجر وحساب الجيميل والمنصة ومعرف البائع');
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanDest = formDestinationUrl.trim();
      const cleanStore = formStoreUrl.trim();
      const newTraderPayload = {
        user_id: user?.uid || (user as any)?.id || '',
        seller_name: formName.trim(),
        email: cleanEmail,
        gmail: cleanEmail,
        phone: formPhone.trim(),
        platform: formPlatform,
        seller_id: formSellerId.trim(),
        destination_url: cleanDest,
        seller_link: cleanDest,
        store_url: cleanStore,
        storefront_link: cleanStore,
        status: 'active' as const,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('traders')
        .insert([newTraderPayload]);

      if (error) {
        onShowToast?.(`❌ فشل الحفظ: ${error.message}`);
        return;
      }

      dataCache.invalidate('traders');
      const insertedList = Array.isArray(data) ? data : data ? [data] : [];
      if (insertedList.length > 0) {
        const insertedTrader = insertedList[0] as Trader;
        setTraders((prev) => [insertedTrader, ...prev.filter((t) => t.id !== insertedTrader.id)]);
      }
      onShowToast?.('✅ تم حفظ التاجر بنجاح');
      setIsAddModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormPlatform('amazon');
      setFormSellerId('');
      setFormDestinationUrl('');
      setFormStoreUrl('');
      fetchTraders(1, true);
    } catch (err: any) {
      onShowToast?.(`❌ فشل الحفظ: ${err.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrader = async (e: React.MouseEvent, trader: Trader) => {
    e.stopPropagation();
    if (!isFounder) return;
    if (!window.confirm(`هل أنت متأكد من حذف التاجر "${trader.seller_name}" نهائياً مع كافة منتجاته ومخزونه وفواتيره؟`)) {
      return;
    }
    try {
      const id = trader.id;
      await supabase.from('inventory_sync').delete().eq('trader_id', id);
      await supabase.from('products').delete().eq('trader_id', id);
      await supabase.from('invoices').delete().eq('trader_id', id);
      await supabase.from('traders').delete().eq('id', id);

      dataCache.invalidate('traders');
      dataCache.invalidate('products_');
      onShowToast?.(`🗑️ تم حذف التاجر "${trader.seller_name}" وتفريغ كافة السجلات`);
      fetchTraders(1, true);
    } catch (err: any) {
      onShowToast?.(`❌ فشل حذف التاجر: ${err.message || 'حدث خطأ'}`);
    }
  };

  const filteredTraders = traders.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.seller_name && t.seller_name.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.gmail && t.gmail.toLowerCase().includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.platform && t.platform.toLowerCase().includes(q))
    );
  });

  const renderAddTraderModal = () =>
    isAddModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-['Cairo']" dir="rtl">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-black text-white">إضافة تاجر جديد</h3>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSaveTrader} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم التاجر / المتجر *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: محمود سعيد"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">حساب الجيميل (gmail) *</label>
              <input
                type="email"
                required
                dir="ltr"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">معرف البائع (Seller ID) *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={formSellerId}
                  onChange={(e) => setFormSellerId(e.target.value)}
                  placeholder="A37JIM7LHQI6IM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+20 100 123 4567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">المنصة الرئيسية *</label>
              <select
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="amazon">أمازون مصر (Amazon)</option>
                <option value="noon">نون مصر (Noon)</option>
                <option value="jumia">جوميا (Jumia)</option>
                <option value="bayyaa">بياع (Bayyaa)</option>
                <option value="raneen">رنين (Raneen)</option>
                <option value="kanz">كنز (Kanz)</option>
                <option value="homesmart">هوم سمارت (HomeSmart)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">لينك موقع الوجهة (destination_url)</label>
              <input
                type="url"
                dir="ltr"
                value={formDestinationUrl}
                onChange={(e) => setFormDestinationUrl(e.target.value)}
                placeholder="https://www.amazon.eg/s?me=..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">لينك موقع المتجر (store_url)</label>
              <input
                type="url"
                dir="ltr"
                value={formStoreUrl}
                onChange={(e) => setFormStoreUrl(e.target.value)}
                placeholder="https://www.amazon.eg/sp?seller=..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ التاجر'}
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
    );

  if (isLoading) {
    return (
      <div className="w-full space-y-8 font-['Cairo']" dir="rtl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] border border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-6 w-full">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-48 bg-slate-800/80 rounded-lg" />
              <div className="h-3.5 w-32 bg-slate-800/60 rounded-lg" />
            </div>
          </div>
          <div className="h-14 w-full md:w-56 bg-amber-500/10 rounded-2xl border border-amber-500/5" />
        </div>
        <div className="h-14 w-full max-w-xl bg-slate-900/40 border border-slate-800/50 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl bg-slate-900/40 border border-slate-800/50 p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-800/80 rounded-lg" />
                  <div className="h-3 w-20 bg-slate-800/60 rounded-md" />
                </div>
              </div>
              <div className="h-10 w-full bg-slate-800/50 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (traders.length === 0) {
    return (
      <div className="w-full font-['Cairo']" dir="rtl">
        <GlobalEmptyState
          icon={<Users className="w-10 h-10 text-amber-400" />}
          message="لم يتم العثور على تجار مسجلين"
          description={isFounder ? 'دليل التجار فارغ حالياً. ابدأ بإضافة تجار جدد لمتابعة أدائهم وربط منتجاتهم.' : 'لا توجد بيانات تاجر مرتبطة بهذا الحساب حالياً.'}
          actionLabel={isFounder ? '➕ إضافة تاجر جديد' : undefined}
          onActionClick={isFounder ? () => setIsAddModalOpen(true) : undefined}
        />
        {renderAddTraderModal()}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
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
            <p className="text-xs text-slate-400">إجمالي التجار المتاحين لحسابك: {traders.length} تاجر</p>
          </div>
        </div>

        {isFounder && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            <span>➕ إضافة تاجر جديد</span>
          </button>
        )}
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTraders.map((trader) => {
          const tEmail = String(trader.email || trader.gmail || '').trim().toLowerCase();
          const canEdit = isFounder || (Boolean(userEmail) && tEmail === userEmail);
          return (
            <TraderCard
              key={trader.id}
              trader={trader}
              isFounder={isFounder}
              canEdit={canEdit}
              isSyncing={syncingTraderId === trader.id}
              onEdit={handleEditTrader}
              onDelete={handleDeleteTrader}
              onFetch={handleFetchProducts}
            />
          );
        })}
      </div>

      {isFetchModalOpen && selectedTraderForFetch && (
        <FetchProductsModal
          trader={selectedTraderForFetch}
          isOpen={isFetchModalOpen}
          onClose={() => setIsFetchModalOpen(false)}
          onShowToast={onShowToast}
        />
      )}

      {isEditModalOpen && selectedTrader && (
        <EditTraderModal
          trader={selectedTrader}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTrader(null);
          }}
          onUpdate={handleUpdateTrader}
          onShowToast={onShowToast}
          onFetchProducts={handleFetchProducts}
        />
      )}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => fetchTraders(page + 1)}
            disabled={isLoading}
            className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs border border-amber-500/30 transition-colors duration-200 shadow-lg inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>عرض المزيد (20 تاجر التاليين) ➕</span>
          </button>
        </div>
      )}

      {renderAddTraderModal()}
    </div>
  );
};

export default TradersPage;
