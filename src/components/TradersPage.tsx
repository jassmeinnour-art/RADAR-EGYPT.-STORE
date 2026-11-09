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
  CheckCircle2
} from 'lucide-react';
import { supabase, Trader } from '../lib/supabase';

interface TradersPageProps {
  onShowToast?: (message: string) => void;
  onSelectTrader?: (traderId: string) => void;
}

const PLATFORM_DETAILS: Record<string, { name: string; color: string; logo: string }> = {
  amazon: { name: 'أمازون (Amazon)', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300', logo: 'https://cdn.simpleicons.org/amazon/FF9900' },
  noon: { name: 'نون (Noon)', color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' },
  jumia: { name: 'جوميا (Jumia)', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300', logo: 'https://cdn.simpleicons.org/jumia/FF9900' },
  raneen: { name: 'رنين (Raneen)', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300', logo: 'https://www.raneen.com.eg/favicon.ico' },
  bayyaa: { name: 'بيّاع (Bayyaa)', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', logo: 'https://bayyaa.com/favicon.ico' },
  kanz: { name: 'كنز (Kanz)', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300', logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  homesmart: { name: 'هوم سمارت (HomeSmart)', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300', logo: 'https://www.homesmart.com.eg/favicon.ico' }
};

export const TradersPage: React.FC<TradersPageProps> = ({ onShowToast, onSelectTrader }) => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formPlatform, setFormPlatform] = useState<string>('amazon');
  const [formSellerId, setFormSellerId] = useState<string>('');

  const fetchTraders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('traders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching traders:', error);
      }
      setTraders(Array.isArray(data) ? (data as Trader[]) : []);
    } catch (err) {
      console.error('Error fetching traders:', err);
      setTraders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders();
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

  const handleAddTrader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى إدخال اسم التاجر');
      return;
    }
    setIsSubmitting(true);
    try {
      const newTrader = {
        seller_name: formName.trim(),
        email: formEmail.trim() || `${formName.trim().replace(/\s+/g, '').toLowerCase()}@merchant.eg`,
        phone: formPhone.trim(),
        platform: formPlatform,
        seller_id: formSellerId.trim() || `SELLER-${Date.now().toString(36).toUpperCase()}`,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('traders').insert([newTrader]);
      if (error) {
        throw error;
      }
      if (onShowToast) onShowToast(`✅ تم إضافة التاجر "${formName}" بنجاح!`);
      setIsAddModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormPlatform('amazon');
      setFormSellerId('');
      fetchTraders();
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل حفظ التاجر: ${err.message || 'حدث خطأ'}`);
    } finally {
      setIsSubmitting(false);
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
      <div className="w-full py-28 text-center space-y-4 font-['Cairo']" dir="rtl">
        <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-slate-400 text-sm font-bold">جاري تحميل دليل التجار...</p>
      </div>
    );
  }

  // If traders is empty: show only "➕ إضافة تاجر جديد" button per exact user requirement
  if (traders.length === 0) {
    return (
      <div className="w-full py-28 text-center space-y-6 font-['Cairo']" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Users className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-lg font-black text-white">دليل التجار فارغ</h3>
          <p className="text-xs text-slate-400">لا يوجد أي تجار مسجلين حالياً في المنظومة</p>
        </div>
        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm inline-flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>➕ إضافة تاجر جديد</span>
          </button>
        </div>

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
                    <option value="bayyaa">بيّاع (Bayyaa)</option>
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
  }

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
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
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
        />
      </div>

      {/* Traders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTraders.map((trader) => {
          const plat = PLATFORM_DETAILS[trader.platform] || {
            name: trader.platform || 'منصة عامة',
            color: 'border-slate-700 bg-slate-800 text-slate-300',
            logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'
          };
          const sellerId = trader.seller_id || trader.seller_ids?.[trader.platform] || 'غير محدد';

          return (
            <div
              key={trader.id}
              onClick={() => handleOpenTrader(trader.id)}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 transition-all cursor-pointer group hover:shadow-xl hover:shadow-amber-500/5 relative overflow-hidden flex flex-col justify-between"
            >
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
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
                  <span>عرض منتجات وبيانات التاجر</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-slate-500">
                  {trader.created_at ? new Date(trader.created_at).toLocaleDateString('ar-EG') : 'مسجل'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

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
                  <option value="bayyaa">بيّاع (Bayyaa)</option>
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
