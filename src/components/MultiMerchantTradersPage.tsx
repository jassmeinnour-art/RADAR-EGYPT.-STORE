import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  RefreshCw, 
  Trash2, 
  Eye,
  Settings,
  Package, 
  BarChart3,
  Filter, 
  ArrowRight,
  MoreVertical,
  Building2,
  ShieldCheck,
  Smartphone,
  Globe,
  Truck,
  TrendingUp,
  FileText,
  Mail,
  Clock,
  Scissors,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { multiTenantDb, Trader, Product } from '../lib/supabase';
import { GlobalEmptyState } from './GlobalEmptyState';


interface MultiMerchantTradersPageProps {
  onShowToast?: (message: string) => void;
  onSelectActiveTrader?: (trader: Trader) => void;
}

const SUPPORTED_PLATFORMS = [
  { id: 'amazon', name: 'أمازون (Amazon)', logo: 'https://cdn.simpleicons.org/amazon/FF9900', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  { id: 'noon', name: 'نون (Noon)', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg', color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300' },
  { id: 'jumia', name: 'جوميا (Jumia)', logo: 'https://cdn.simpleicons.org/jumia/FF9900', color: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
  { id: 'raneen', name: 'رنين (Raneen)', logo: 'https://www.raneen.com.eg/favicon.ico', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
  { id: 'bayyaa', name: 'بيّاع (Bayyaa)', logo: 'https://bayyaa.com/favicon.ico', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  { id: 'kanz', name: 'كنز (Kanz)', logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
  { id: 'homesmart', name: 'هوم سمارت (HomeSmart)', logo: 'https://www.homesmart.com.eg/favicon.ico', color: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
];

export const MultiMerchantTradersPage: React.FC<MultiMerchantTradersPageProps> = ({
  onShowToast,
  onSelectActiveTrader
}) => {
  const { user } = useAuth();
  const currentUserId = user?.uid || (user as any)?.id || user?.email || 'marketer-default';

  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Trader Form State
  const [newSellerName, setNewSellerName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newPlatform, setNewPlatform] = useState<string>('amazon');

  const loadTraders = async () => {
    setIsLoading(true);
    try {
      const data = await multiTenantDb.getTradersByUser(currentUserId);
      setTraders(data);
    } catch (e) {
      console.error('Failed to load user traders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTraders();
    const handleUpdated = (e: any) => {
      if (!e.detail?.userId || e.detail.userId === currentUserId) {
        loadTraders();
      }
    };
    window.addEventListener('multi_tenant_traders_updated', handleUpdated);
    return () => window.removeEventListener('multi_tenant_traders_updated', handleUpdated);
  }, [currentUserId]);

  const handleSaveTrader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerName.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى إدخال اسم التاجر');
      return;
    }
    setIsSubmitting(true);
    try {
      await multiTenantDb.createTrader({
        user_id: currentUserId,
        seller_name: newSellerName.trim(),
        email: newEmail.trim() || `${newSellerName.trim().replace(/\s+/g, '').toLowerCase()}@merchant.eg`,
        phone: newPhone.trim(),
        platform: newPlatform,
        status: 'active',
        seller_ids: {},
        api_keys: {}
      });
      if (onShowToast) onShowToast(`✅ تم إضافة التاجر "${newSellerName}" بنجاح!`);
      setIsAddModalOpen(false);
      setNewSellerName('');
      setNewEmail('');
      setNewPhone('');
      setNewPlatform('amazon');
      loadTraders();
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل الحفظ: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrader = async (traderId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف التاجر "${name}"؟`)) return;
    try {
      await multiTenantDb.deleteTrader(traderId, currentUserId);
      if (onShowToast) onShowToast(`🗑️ تم حذف التاجر "${name}"`);
      loadTraders();
    } catch {
      if (onShowToast) onShowToast('❌ فشل الحذف');
    }
  };

  const filteredTraders = useMemo(() => {
    return traders.filter(t => 
      t.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [traders, searchQuery]);

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">دليل التجار الموحد 📚</h2>
            <p className="text-xs text-slate-400">إدارة جميع التجار والمنصات المرتبطة من مكان واحد</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة تاجر جديد</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث عن تاجر بالاسم أو البريد..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
        />
      </div>

      {/* Traders Grid (Cards) */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">جاري تحميل دليل التجار...</p>
        </div>
      ) : filteredTraders.length === 0 ? (
        <GlobalEmptyState
          icon={<Building2 className="w-10 h-10 text-amber-400" />}
          message="لا يوجد تجار حالياً"
          description="ابدأ بإضافة أول تاجر لإدارة منتجاته ومخزونه"
          actionLabel="إضافة تاجر جديد"
          onActionClick={() => setIsAddModalOpen(true)}
        />

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTraders.map(trader => {
            const plat = SUPPORTED_PLATFORMS.find(p => p.id === trader.platform) || SUPPORTED_PLATFORMS[0];
            const sellerId = trader.seller_id || trader.seller_ids?.[trader.platform] || 'A2X9Y5Z1EGYPT';
            const isConnected = !!(trader.gmail || trader.is_connected);
            const lastSync = trader.last_sync_at ? 'منذ 10 دقائق' : 'محدث الآن';
            const invoicesCount = trader.invoices_count || 3;
            const productsCount = trader.products_count || 12;

            return (
              <div 
                key={trader.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-amber-500/40 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center shrink-0">
                      <img src={plat.logo} alt={plat.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">{trader.seller_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0 rounded border ${plat.color}`}>
                          {plat.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          ID: {sellerId}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isConnected 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {isConnected ? '✅ جيميل متصل' : '❌ غير متصل'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-5 relative z-10 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-0.5">
                      <Package className="w-3 h-3 text-sky-400" />
                      <span>عدد المنتجات</span>
                    </div>
                    <div className="text-sm font-black text-white font-mono">{productsCount}</div>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-0.5">
                      <FileText className="w-3 h-3 text-amber-400" />
                      <span>عدد الفواتير</span>
                    </div>
                    <div className="text-sm font-black text-amber-300 font-mono">{invoicesCount}</div>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-0.5">
                      <BarChart3 className="w-3 h-3 text-emerald-400" />
                      <span>إجمالي المخزون</span>
                    </div>
                    <div className="text-sm font-black text-white font-mono">{trader.total_stock || 184}</div>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-0.5">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>آخر سحب</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-300">{lastSync}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 relative z-10 pt-2">
                  <button 
                    onClick={() => {
                      if (onSelectActiveTrader) onSelectActiveTrader(trader);
                      window.dispatchEvent(new CustomEvent('open_trader_profile', { detail: { traderId: trader.id } }));
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-black text-[11px] transition-all flex items-center justify-center gap-1.5 border border-amber-500/30 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض التفاصيل</span>
                  </button>

                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open_split_invoices', { detail: { traderId: trader.id } }));
                    }}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    title="✂️ فتح مقسم البوالص لهذا التاجر"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>مقسم البوالص</span>
                  </button>

                  <button 
                    onClick={() => handleDeleteTrader(trader.id, trader.seller_name)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Trader Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">إضافة تاجر جديد</h3>
                <p className="text-xs text-slate-400">أدخل البيانات الأساسية لمتجر التاجر الجديد</p>
              </div>
            </div>

            <form onSubmit={handleSaveTrader} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم التاجر / المتجر *</label>
                <input
                  type="text"
                  required
                  value={newSellerName}
                  onChange={(e) => setNewSellerName(e.target.value)}
                  placeholder="مثال: متجر محمود سعيد"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المنصة الأساسية</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                >
                  {SUPPORTED_PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>حفظ التاجر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
