import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Building2,
  Package,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  FileText,
  Users,
  Store,
  Mail,
  Key,
  Phone,
  MapPin,
  Globe,
  Clock,
  ShieldCheck,
  TrendingUp,
  Truck,
  Layers,
  Search,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Plus,
  X,
  Eye,
  EyeOff,
  Zap,
  Activity,
  Trash2,
  Settings
} from 'lucide-react';
import { multiTenantDb, Trader, Product } from '../lib/supabase';

interface TraderProfilePageProps {
  traderId: string;
  onBack: () => void;
  onShowToast?: (msg: string) => void;
}

export const TraderProfilePage: React.FC<TraderProfilePageProps> = ({
  traderId,
  onBack,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [trader, setTrader] = useState<Trader | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const [testResults, setTestResults] = useState<Record<string, 'success' | 'failed' | null>>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allTraders = await multiTenantDb.getTradersByUser('current-user'); // multiTenantDb handles partitioning
      const currentTrader = allTraders.find(t => t.id === traderId);
      if (currentTrader) {
        setTrader(currentTrader);
        const prods = await multiTenantDb.getProductsByTrader(traderId);
        setProducts(prods);
      }
    } catch (e) {
      console.error('Error loading trader profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [traderId]);

  const toggleApiKeyVisibility = (platform: string) => {
    setShowApiKeys(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleTestConnection = async (platform: string) => {
    setTestResults(prev => ({ ...prev, [platform]: null }));
    // Mocking API call for connection test
    await new Promise(resolve => setTimeout(resolve, 800));
    const success = Math.random() > 0.2;
    setTestResults(prev => ({ ...prev, [platform]: success ? 'success' : 'failed' }));
    if (onShowToast) {
      onShowToast(success ? `✅ تم الاتصال بنجاح بمنصة ${platform}` : `❌ فشل الاتصال بمنصة ${platform}`);
    }
  };

  const handleQuickSync = async (platform: string) => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
    if (onShowToast) onShowToast(`⚡ تمت المزامنة السريعة لـ ${platform} بنجاح!`);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
        <p className="text-slate-400 font-bold">جاري تحميل ملف التاجر...</p>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-white font-bold">لم يتم العثور على التاجر</h2>
        <button onClick={onBack} className="text-amber-400 underline">العودة للدليل</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Header Profile Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
              👤
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-white">{trader.seller_name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>نشط</span>
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-sky-400" /> {trader.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {trader.phone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للدليل</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 1, label: 'البيانات الأساسية 👤', icon: Users },
            { id: 2, label: `المنتجات (${products.length}) 📦`, icon: Package },
            { id: 3, label: 'المخزون لكل منصة 📊', icon: Layers },
            { id: 4, label: 'أسعار المنافسين 💰', icon: TrendingUp },
            { id: 5, label: 'الفواتير والطلبات 🧾', icon: Truck },
            { id: 6, label: 'الإعدادات والمفاتيح 🔑', icon: Key },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl min-h-[400px]">
        {/* Tab 1: Basic Info */}
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-base font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>المعلومات الشخصية والتجارية</span>
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'اسم التاجر الكامل', value: trader.seller_name },
                  { label: 'البريد الإلكتروني', value: trader.email },
                  { label: 'رقم الهاتف', value: trader.phone },
                  { label: 'العنوان الرسمي', value: trader.address || 'غير محدد' },
                  { label: 'تاريخ الإضافة', value: trader.created_at ? new Date(trader.created_at).toLocaleDateString('ar-EG') : '—' },
                  { label: 'آخر مزامنة', value: trader.last_sync_at ? new Date(trader.last_sync_at).toLocaleString('ar-EG') : 'لم تتم المزامنة بعد' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-bold text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-base font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>معرفات المنصات (Seller IDs)</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {['amazon', 'noon', 'jumia'].map(p => (
                  <div key={p} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={p === 'amazon' ? 'https://cdn.simpleicons.org/amazon/FF9900' : p === 'noon' ? 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' : 'https://cdn.simpleicons.org/jumia/FF9900'} 
                        className="w-6 h-6 object-contain" 
                        alt={p} 
                      />
                      <span className="text-xs font-bold text-slate-300 capitalize">{p} ID:</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {trader.seller_ids?.[p] || 'لم يربط بعد'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في منتجات هذا التاجر فقط..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-11 pl-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-md">
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج يدوي</span>
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>مزامنة من المنصة</span>
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-20 text-center bg-slate-950/40 rounded-3xl border border-dashed border-slate-800 space-y-4">
                <Package className="w-16 h-16 text-slate-700 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-white font-bold">لا يوجد منتجات لهذا التاجر بعد</h4>
                  <p className="text-slate-500 text-xs">اضغط إضافة منتج يدوي أو مزامنة لجلب المنتجات من المنصات</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 font-black">
                    <tr>
                      <th className="p-4">المنتج</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4 text-center">المنصة</th>
                      <th className="p-4 text-center">السعر</th>
                      <th className="p-4 text-center">المخزون</th>
                      <th className="p-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} className="w-10 h-10 rounded-lg object-cover bg-slate-950" alt="" />
                            <span className="font-bold text-slate-200">{p.title}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{p.sku}</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold uppercase">{p.platform}</span>
                        </td>
                        <td className="p-4 text-center font-black text-amber-400 font-mono">{p.price.toLocaleString()} ج.م</td>
                        <td className="p-4 text-center font-bold text-slate-300 font-mono">{p.stock} قطة</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"><Search className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Platform Inventory */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>توزيع المخزون عبر المنصات</span>
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="p-4">المنتج</th>
                    <th className="p-4 text-center">Amazon</th>
                    <th className="p-4 text-center">Noon</th>
                    <th className="p-4 text-center">Jumia</th>
                    <th className="p-4 text-center">Raneen</th>
                    <th className="p-4 text-center">Kanz</th>
                    <th className="p-4 text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-bold">لا توجد بيانات مخزون للمقارنة</td></tr>
                  ) : (
                    products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-slate-200">{p.title}</td>
                        <td className="p-4 text-center font-mono text-slate-400">{p.platform === 'amazon' ? p.stock : '—'}</td>
                        <td className="p-4 text-center font-mono text-slate-400">{p.platform === 'noon' ? p.stock : '—'}</td>
                        <td className="p-4 text-center font-mono text-slate-400">{p.platform === 'jumia' ? p.stock : '—'}</td>
                        <td className="p-4 text-center font-mono text-slate-400">{'—'}</td>
                        <td className="p-4 text-center font-mono text-slate-400">{'—'}</td>
                        <td className="p-4 text-center font-black text-white font-mono">{p.stock}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Competitor Prices */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span>مقارنة الأسعار و Buy Box</span>
              </h3>
              <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition">تحديث أسعار المنافسين</button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {products.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-bold bg-slate-950/40 rounded-3xl border border-slate-800">لا توجد منتجات لمقارنة الأسعار</div>
              ) : (
                products.map(p => {
                  const diff = (p.competitor_price || 0) - p.price;
                  const isSlower = diff < 0;
                  return (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4 min-w-[250px]">
                        <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                        <div>
                          <h4 className="text-sm font-black text-white">{p.title}</h4>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">{p.platform} Market</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">سعرنا</span>
                          <span className="text-sm font-black text-white font-mono">{p.price.toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">سعر المنافس</span>
                          <span className="text-sm font-black text-slate-300 font-mono">{p.competitor_price?.toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">فرق السعر</span>
                          <span className={`text-sm font-black font-mono ${isSlower ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {isSlower ? `⚠️ -${Math.abs(diff)}` : `+${diff}`} ج.م
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">Buy Box</span>
                          <span className="text-sm font-black text-amber-400 font-mono">{p.buybox_price?.toLocaleString()} ج.m</span>
                        </div>
                      </div>

                      {isSlower && (
                        <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] font-bold">
                          ⚠️ المنافس أرخص بـ {Math.abs(diff)} جنيه
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Invoices */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500" />
              <span>فواتير وطلبات التاجر</span>
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 font-black">
                  <tr>
                    <th className="p-4">رقم الفاتورة</th>
                    <th className="p-4">المنتجات</th>
                    <th className="p-4 text-center">المنصة</th>
                    <th className="p-4 text-center">القيمة</th>
                    <th className="p-4 text-center">حالة الشحن</th>
                    <th className="p-4 text-center">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-500 font-bold">لا توجد فواتير مسجلة لهذا التاجر حالياً</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Settings & API Keys */}
        {activeTab === 6 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* API Keys Management */}
              <div className="space-y-6">
                <h3 className="text-base font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-500" />
                  <span>مفاتيح API والربط السحابي</span>
                </h3>
                <div className="space-y-4">
                  {['amazon', 'noon', 'jumia'].map(p => (
                    <div key={p} className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p === 'amazon' ? 'https://cdn.simpleicons.org/amazon/FF9900' : p === 'noon' ? 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' : 'https://cdn.simpleicons.org/jumia/FF9900'} 
                            className="w-8 h-8 object-contain" 
                            alt={p} 
                          />
                          <span className="text-sm font-black text-white capitalize">{p} API</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleQuickSync(p)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[11px] font-black transition-all flex items-center gap-1.5 border border-amber-500/30"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>مزامنة سريعة</span>
                          </button>
                          <button 
                            onClick={() => handleTestConnection(p)}
                            className={`p-2 rounded-xl transition border ${
                              testResults[p] === 'success' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                : testResults[p] === 'failed'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                            title="اختبار الاتصال"
                          >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type={showApiKeys[p] ? 'text' : 'password'}
                          readOnly
                          value={trader.api_keys?.[p] || '****************************'}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 pr-12"
                        />
                        <button
                          onClick={() => toggleApiKeyVisibility(p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition"
                        >
                          {showApiKeys[p] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-6">
                <h3 className="text-base font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" />
                  <span>خيارات المزامنة والتحكم</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'المزامنة التلقائية للمخزون', desc: 'تحديث مستويات المخزون كل 15 دقيقة تلقائياً', active: true },
                    { label: 'تنبيهات الأسعار التنافسية', desc: 'إرسال إشعار عند فقدان الـ Buy Box لصالح منافس', active: true },
                    { label: 'تحديث الأسعار الآلي', desc: 'تعديل السعر ديناميكياً بناءً على قوانين التسعير', active: false },
                  ].map((opt, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-white">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">{opt.desc}</div>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${opt.active ? 'bg-amber-500' : 'bg-slate-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${opt.active ? 'right-6' : 'right-1'}`} />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <button className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-black text-xs transition border border-rose-500/30 flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      <span>حذف بيانات التاجر نهائياً</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
