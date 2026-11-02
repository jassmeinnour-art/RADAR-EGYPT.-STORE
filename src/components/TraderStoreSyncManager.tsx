import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Store, 
  Mail, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  ShieldCheck, 
  Package, 
  PlusCircle, 
  Search, 
  Trash2, 
  Crown, 
  TrendingUp, 
  Layers, 
  Filter, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export interface ConnectedTrader {
  id: string;
  name: string;
  email: string;
  platform: 'amazon_sp_api' | 'noon_seller' | 'jumia_seller' | 'shopify' | 'woocommerce';
  seller_id: string;
  category: string;
  marketplace: string;
  is_connected: boolean;
  sync_status: 'Connected' | 'Failed' | 'Syncing';
  last_sync_at: string;
  products_count: number;
  low_stock_count: number;
}

export interface TraderProduct {
  id: string;
  trader_id: string;
  sku: string;
  asin?: string;
  title: string;
  price: number;
  stock_qty: number;
  buybox_price: number;
  buybox_owner: string;
  is_buybox_winner: boolean;
  competitor_price: number;
  image: string;
  category: string;
  platform: string;
  updated_at: string;
}

interface TraderStoreSyncManagerProps {
  currency?: string;
  onShowToast?: (message: string) => void;
}

export const TraderStoreSyncManager: React.FC<TraderStoreSyncManagerProps> = ({
  currency = 'ج.م',
  onShowToast,
}) => {
  // Traders & Products State
  const [traders, setTraders] = useState<ConnectedTrader[]>([]);
  const [products, setProducts] = useState<TraderProduct[]>([]);
  const [selectedTraderId, setSelectedTraderId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // New Trader Connect Form State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isSubmittingConnect, setIsSubmittingConnect] = useState<boolean>(false);
  const [traderName, setTraderName] = useState<string>('');
  const [storeEmail, setStoreEmail] = useState<string>('');
  const [sellerId, setSellerId] = useState<string>('');
  const [platform, setPlatform] = useState<'amazon_sp_api' | 'noon_seller' | 'jumia_seller' | 'shopify' | 'woocommerce'>('amazon_sp_api');
  const [marketplace, setMarketplace] = useState<string>('EG');
  const [category, setCategory] = useState<string>('إلكترونيات وهواتف');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');

  // Fetch Traders & Products from Backend API
  const fetchTradersData = async () => {
    setIsLoading(true);
    try {
      const resTraders = await fetch('/api/traders');
      const dataTraders = await resTraders.json();
      if (dataTraders.success && dataTraders.traders) {
        setTraders(dataTraders.traders);
      }

      // Fetch products for all or selected
      const endpoint = selectedTraderId && selectedTraderId !== 'all' 
        ? `/api/traders/${selectedTraderId}/products`
        : `/api/traders`; // Fetch products for first trader if available

      if (dataTraders.traders && dataTraders.traders.length > 0) {
        const targetId = selectedTraderId === 'all' ? dataTraders.traders[0].id : selectedTraderId;
        const resProds = await fetch(`/api/traders/${targetId}/products`);
        const dataProds = await resProds.json();
        if (dataProds.success && dataProds.products) {
          setProducts(dataProds.products);
        }
      }
    } catch (err) {
      console.error('Failed to fetch traders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTradersData();
  }, [selectedTraderId]);

  // Handle Connecting New Trader Store
  const handleConnectStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeEmail.trim() || !sellerId.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى تعبئة البريد الإلكتروني ومعرّف التاجر (Seller ID)');
      return;
    }

    setIsSubmittingConnect(true);
    try {
      const res = await fetch('/api/connect-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: traderName,
          email: storeEmail,
          seller_id: sellerId,
          platform,
          marketplace,
          category,
          api_key: apiKey,
          api_secret: apiSecret,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onShowToast) {
          onShowToast(`🎉 ${data.message}`);
        }
        setIsConnectModalOpen(false);
        // Reset Form
        setTraderName('');
        setStoreEmail('');
        setSellerId('');
        setApiKey('');
        setApiSecret('');
        
        // Refresh List
        fetchTradersData();
      } else {
        if (onShowToast) onShowToast(`❌ ${data.error || 'فشل الاتصال بالمتجر'}`);
      }
    } catch (err) {
      console.error('Connect store error:', err);
      if (onShowToast) onShowToast('❌ حدث خطأ في الاتصال بالسيرفر أثناء ربط المتجر');
    } finally {
      setIsSubmittingConnect(false);
    }
  };

  // Handle Manual Sync
  const handleTriggerSync = async (traderId?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trader_id: traderId || 'all' }),
      });

      const data = await res.json();
      if (data.success) {
        if (onShowToast) onShowToast(`🔄 ${data.message}`);
        fetchTradersData();
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Disconnect Trader
  const handleDisconnectTrader = async (traderId: string, name: string) => {
    if (!window.confirm(`هل أنت تأكد من إلغاء ربط متجر "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/traders/${traderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onShowToast) onShowToast(`🗑️ ${data.message}`);
        fetchTradersData();
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // Metrics Calculations
  const totalStores = traders.length;
  const totalProductsCount = traders.reduce((acc, t) => acc + (t.products_count || 0), 0);
  const totalLowStockCount = traders.reduce((acc, t) => acc + (t.low_stock_count || 0), 0);
  const buyBoxWinnersCount = products.filter(p => p.is_buybox_winner).length;
  const buyBoxWinRate = products.length > 0 ? Math.round((buyBoxWinnersCount / products.length) * 100) : 0;

  // Filtered Products List
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.asin && p.asin.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlatform = platformFilter === 'all' || p.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-sky-500/30 shadow-2xl space-y-8 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/30">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>ربط متاجر التجار ومزامنة الكتالوج والمخزون</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  ربط بـ Email & Seller ID ⚡
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ربط شامل للـ (Amazon SP-API, Noon Partner, Jumia, Shopify, WooCommerce) بسلاسة وأمان مع تشفير AES-256
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => handleTriggerSync('all')}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة فورية الآن 🔄'}</span>
          </button>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>ربط متجر تاجر جديد +</span>
          </button>
        </div>
      </div>

      {/* Top Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Connected Stores Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>المتاجر المرتبطة الحالية</span>
            <Store className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalStores} <span className="text-xs text-slate-400 font-bold">متجر</span></div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>متصل ومُتزامن بـ SSL آمن</span>
          </div>
        </div>

        {/* Synced Products Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>إجمالي المنتجات المزامنة</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalProductsCount} <span className="text-xs text-slate-400 font-bold">منتج</span></div>
          <div className="text-[11px] text-amber-300 font-bold">
            تحديث تلقائي كل 30 دقيقة (CRON)
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>تنبيهات المخزون المنخفض (&lt; 5)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">{totalLowStockCount} <span className="text-xs text-rose-300 font-bold">منتج حرِج</span></div>
          <div className="text-[11px] text-rose-400/90 font-bold">
            يحتاج إعادة توريد عاجلة
          </div>
        </div>

        {/* Buy Box Rate Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>نسبة الاستحواذ على الـ Buy Box</span>
            <Crown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{buyBoxWinRate}%</div>
          <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>فائز بـ {buyBoxWinnersCount} منتج من أصل {products.length}</span>
          </div>
        </div>

      </div>

      {/* Connected Stores Directory List */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-sky-400" />
          <span>قائمة المتاجر المربوطة حالياً ({traders.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {traders.map((trader) => (
            <div 
              key={trader.id}
              onClick={() => setSelectedTraderId(trader.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 relative ${
                selectedTraderId === trader.id 
                  ? 'bg-slate-900 border-sky-500 shadow-xl ring-1 ring-sky-500/50' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                    <span>{trader.name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">{trader.email}</p>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                  trader.sync_status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  trader.sync_status === 'Syncing' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
                  'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{trader.sync_status === 'Connected' ? 'متصل ومُتزامن' : trader.sync_status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block">معرّف التاجر (Seller ID):</span>
                  <span className="font-mono text-slate-300 text-xs block truncate">{trader.seller_id}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block">المنصة والسوق:</span>
                  <span className="text-amber-300 text-xs font-bold block">
                    {trader.platform === 'amazon_sp_api' ? 'أمازون' : trader.platform === 'noon_seller' ? 'نون' : 'جوميا'} ({trader.marketplace})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">
                  عدد المنتجات: <strong className="text-white font-mono">{trader.products_count}</strong>
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerSync(trader.id);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg transition cursor-pointer"
                    title="إعادة مزامنة المتجر"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDisconnectTrader(trader.id, trader.name);
                    }}
                    className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition cursor-pointer"
                    title="إلغاء ربط المتجر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Trader Synced Catalog Products Table */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>جدول المنتجات والمخزون المزامنة آلياً</span>
            </h3>
            <p className="text-xs text-slate-400">
              متابعة فورية للأسعار، المخزون، وحالة الاستحواذ على الـ Buy Box
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="بحث برقم SKU أو ASIN أو عنوان المنتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-1.5 pr-8 pl-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-sky-500 transition w-48 sm:w-64"
              />
            </div>

            {/* Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-sky-500 transition"
            >
              <option value="all">جميع المنصات</option>
              <option value="amazon_sp_api">أمازون مصر</option>
              <option value="noon_seller">نون مصر</option>
              <option value="jumia_seller">جوميا مصر</option>
            </select>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3.5">المنتج والتفاصيل</th>
                <th className="p-3.5">المنصة ومعرّف SKU</th>
                <th className="p-3.5">سعر المتجر</th>
                <th className="p-3.5">سعر المنافس</th>
                <th className="p-3.5">الكمية بالمخزون</th>
                <th className="p-3.5">حالة الـ Buy Box 👑</th>
                <th className="p-3.5">آخر مزامنة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  
                  {/* Product & Image */}
                  <td className="p-3.5 max-w-sm">
                    <div className="flex items-center gap-3">
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="w-11 h-11 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-950" 
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-xs line-clamp-1" title={p.title}>{p.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ASIN: {p.asin || 'N/A'} • {p.category}</div>
                      </div>
                    </div>
                  </td>

                  {/* Platform & SKU */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 block w-max mb-1">
                      {p.platform === 'amazon_sp_api' ? 'أمازون مصر' : p.platform === 'noon_seller' ? 'نون مصر' : 'جوميا'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 block">{p.sku}</span>
                  </td>

                  {/* Selling Price */}
                  <td className="p-3.5 font-mono font-black text-amber-300 text-sm">
                    {p.price.toLocaleString()} {currency}
                  </td>

                  {/* Competitor Price */}
                  <td className="p-3.5 font-mono text-slate-300 text-xs">
                    {p.competitor_price ? `${p.competitor_price.toLocaleString()} ${currency}` : '-'}
                  </td>

                  {/* Stock Quantity & Low Stock Badge */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 font-mono font-bold">
                      <span className={`text-sm ${p.stock_qty < 5 ? 'text-rose-400 font-black' : 'text-emerald-400'}`}>
                        {p.stock_qty} قطعة
                      </span>
                      {p.stock_qty < 5 && (
                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] rounded font-bold animate-pulse">
                          مخزون منخفض ⚠️
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Buy Box Owner Status */}
                  <td className="p-3.5">
                    {p.is_buybox_winner ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] flex items-center gap-1.5 w-max">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>أنت الفائز بالـ Buy Box 👑</span>
                      </span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px] inline-block">
                          خاسر للـ Buy Box
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[120px]" title={p.buybox_owner}>
                          الفائز: {p.buybox_owner}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Last Sync */}
                  <td className="p-3.5 text-[10px] text-slate-400 font-mono">
                    {new Date(p.updated_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Connect Trader Store Form */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative font-['Cairo',sans-serif]" dir="rtl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">ربط متجر تاجر جديد ومزامنة الكتالوج</h3>
                  <p className="text-xs text-slate-400">أدخل البريد الإلكتروني للمتجر ومعرّف التاجر لبدء الجلب</p>
                </div>
              </div>
              <button 
                onClick={() => setIsConnectModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectStore} className="space-y-4 text-xs">
              
              {/* Trader / Store Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">اسم التاجر / المتجر (Trader Name)</label>
                <input
                  type="text"
                  placeholder="مثال: متجر القاهرة للتكنولوجيا"
                  value={traderName}
                  onChange={(e) => setTraderName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-sky-500 transition"
                  required
                />
              </div>

              {/* Email & Seller ID Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">البريد الإلكتروني للمتجر (Store Email)</label>
                  <input
                    type="email"
                    placeholder="trader@store.com"
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold font-mono outline-none focus:border-sky-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">معرّف التاجر (Seller ID / Store ID)</label>
                  <input
                    type="text"
                    placeholder="مثال: A2EUQ1WTGCTBG2"
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold font-mono outline-none focus:border-sky-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Platform & Marketplace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">منصة التجارة الإلكترونية</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-sky-500 transition"
                  >
                    <option value="amazon_sp_api">أمازون (Amazon SP-API)</option>
                    <option value="noon_seller">نون مصر والخليج (Noon Partner)</option>
                    <option value="jumia_seller">جوميا مصر (Jumia Seller Center)</option>
                    <option value="shopify">شوبيفاي (Shopify Admin API)</option>
                    <option value="woocommerce">ووكومرس (WooCommerce REST)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">السوق المحلي / الدولة</label>
                  <select
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-sky-500 transition"
                  >
                    <option value="EG">مصر (Egypt - amazon.eg)</option>
                    <option value="SA">السعودية (Saudi - amazon.sa)</option>
                    <option value="AE">الإمارات (UAE - amazon.ae)</option>
                    <option value="US">أمريكا (USA - amazon.com)</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">الفئة التجارية للمنتجات</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-sky-500 transition"
                >
                  <option value="إلكترونيات وهواتف">إلكترونيات وهواتف الذكية</option>
                  <option value="أزياء وملابس">أزياء وملابس ومستلزمات رياضية</option>
                  <option value="أجهزة منزلية">أجهزة منزلية ومطبخ</option>
                  <option value="مستلزمات طبية وصحة">مستلزمات طبية وتجميل</option>
                  <option value="سوبرماركت وأغذية">سوبرماركت ومنتجات سريعة الدوران</option>
                </select>
              </div>

              {/* Optional API Keys Section */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1 text-sky-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مفاتيح الربط المتقدمة (اختيارية - تشفير AES-256)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="password"
                    placeholder="API Key / Client ID"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none focus:border-sky-500 transition"
                  />
                  <input
                    type="password"
                    placeholder="API Secret / Refresh Token"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingConnect}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-slate-950 ${isSubmittingConnect ? 'animate-spin' : ''}`} />
                <span>{isSubmittingConnect ? 'جاري الاتصال والجلب...' : 'ربط المتجر وجلب المنتجات والمخزون 🔄'}</span>
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default TraderStoreSyncManager;
