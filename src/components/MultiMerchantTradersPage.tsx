import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Store, 
  Plus, 
  Search, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Tag, 
  TrendingUp, 
  ShieldCheck, 
  ShoppingBag, 
  Filter, 
  ArrowRight,
  Sliders,
  DollarSign,
  Layers,
  Sparkles,
  X,
  QrCode,
  Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { multiTenantDb, Trader, Product } from '../lib/supabase';

interface MultiMerchantTradersPageProps {
  onShowToast?: (message: string) => void;
  onSelectActiveTrader?: (trader: Trader) => void;
}

const SUPPORTED_PLATFORMS = [
  { id: 'amazon', name: 'أمازون مصر (Amazon)', logo: 'https://cdn.simpleicons.org/amazon/FF9900', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  { id: 'noon', name: 'نون مصر (Noon)', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg', color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300' },
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
  
  // Current logged in marketer ID
  const currentUserId = user?.uid || (user as any)?.id || user?.email || 'marketer-default';
  const currentUserEmail = user?.email || 'marketer@radar.eg';

  // State
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newSellerName, setNewSellerName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newSellerId, setNewSellerId] = useState<string>('');
  const [newPlatform, setNewPlatform] = useState<string>('amazon');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');

  // Selected Trader for Products Inspection
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [traderProducts, setTraderProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isSyncingTraderId, setIsSyncingTraderId] = useState<string | null>(null);
  const [activeQrTrader, setActiveQrTrader] = useState<Trader | null>(null);

  // Add Product Modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [newProductTitle, setNewProductTitle] = useState<string>('');
  const [newProductSku, setNewProductSku] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState<string>('');
  const [newProductStock, setNewProductStock] = useState<string>('10');
  const [newProductImage, setNewProductImage] = useState<string>('');

  // Load Traders for current marketer strictly (where user_id = current user)
  const loadTraders = async () => {
    setIsLoading(true);
    try {
      const data = await multiTenantDb.getTradersByUser(currentUserId);
      setTraders(data);
      if (data.length > 0 && !selectedTrader) {
        setSelectedTrader(data[0]);
      }
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

  // Load products when selected trader changes
  useEffect(() => {
    if (selectedTrader?.id) {
      loadProducts(selectedTrader.id);
    } else {
      setTraderProducts([]);
    }
  }, [selectedTrader?.id]);

  const loadProducts = async (traderId: string) => {
    setIsLoadingProducts(true);
    try {
      const prods = await multiTenantDb.getProductsByTrader(traderId);
      setTraderProducts(prods);
    } catch (e) {
      console.warn('Failed to load products for trader:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Handle Add Trader
  const handleSaveTrader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerName.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى إدخال اسم التاجر / المتجر');
      return;
    }
    if (!newSellerId.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى إدخال معرّف البائع (Seller ID)');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await multiTenantDb.createTrader({
        user_id: currentUserId,
        seller_name: newSellerName.trim(),
        seller_id: newSellerId.trim(),
        email: newEmail.trim() || `${newSellerId.trim().toLowerCase()}@merchant.eg`,
        platform: newPlatform,
        status: newStatus
      });

      // Also notify backend server
      fetch('/api/traders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          seller_name: created.seller_name,
          seller_id: created.seller_id,
          email: created.email,
          platform: created.platform,
          status: created.status
        })
      }).catch(() => {});

      if (onShowToast) {
        onShowToast(`✅ تم إضافة التاجر "${created.seller_name}" بنجاح في حسابك!`);
      }

      // Reset modal
      setNewSellerName('');
      setNewEmail('');
      setNewSellerId('');
      setNewPlatform('amazon');
      setNewStatus('active');
      setIsAddModalOpen(false);

      await loadTraders();
      setSelectedTrader(created);
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل حفظ التاجر: ${err.message || 'خطأ غير متوقع'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Trader
  const handleDeleteTrader = async (traderId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف التاجر "${name}" وجميع منتجاته المرتبطة؟`)) {
      return;
    }

    try {
      await multiTenantDb.deleteTrader(traderId, currentUserId);
      if (selectedTrader?.id === traderId) {
        setSelectedTrader(null);
      }
      if (onShowToast) onShowToast(`🗑️ تم حذف التاجر "${name}" بنجاح.`);
      await loadTraders();
    } catch (e) {
      if (onShowToast) onShowToast('❌ حدث خطأ أثناء الحذف');
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (trader: Trader) => {
    const nextStatus = trader.status === 'active' ? 'inactive' : 'active';
    await multiTenantDb.updateTraderStatus(trader.id, currentUserId, nextStatus);
    setTraders(prev => prev.map(t => t.id === trader.id ? { ...t, status: nextStatus } : t));
    if (onShowToast) {
      onShowToast(`تم تغيير حالة التاجر "${trader.seller_name}" إلى: ${nextStatus === 'active' ? 'نشط 🟢' : 'غير نشط ⚪'}`);
    }
  };

  // Handle Sync Trader
  const handleSyncTrader = async (trader: Trader) => {
    setIsSyncingTraderId(trader.id);
    try {
      const res = await multiTenantDb.syncTrader(trader.id);
      if (selectedTrader?.id === trader.id) {
        setTraderProducts(res.products);
      }
      if (onShowToast) {
        onShowToast(`⚡ تمت مزامنة كتالوج التاجر "${trader.seller_name}" بنجاح (${res.count} منتج)!`);
      }
    } catch (e) {
      if (onShowToast) onShowToast('⚠️ تعذرت المزامنة الآن');
    } finally {
      setIsSyncingTraderId(null);
    }
  };

  // Handle Add Product for selected trader
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrader) return;
    if (!newProductTitle.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى كتابة عنوان المنتج');
      return;
    }

    const priceNum = parseFloat(newProductPrice) || 500;
    const stockNum = parseInt(newProductStock, 10) || 10;

    try {
      await multiTenantDb.createProduct({
        trader_id: selectedTrader.id,
        title: newProductTitle.trim(),
        sku: newProductSku.trim() || `SKU-${Date.now().toString(36).toUpperCase()}`,
        price: priceNum,
        stock: stockNum,
        image: newProductImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
        buybox_price: priceNum,
        competitor_price: Math.round(priceNum * 1.05)
      });

      if (onShowToast) onShowToast('✅ تم إضافة المنتج بنجاح لكتالوج التاجر!');
      setIsAddProductModalOpen(false);
      setNewProductTitle('');
      setNewProductSku('');
      setNewProductPrice('');
      setNewProductStock('10');
      setNewProductImage('');
      await loadProducts(selectedTrader.id);
    } catch {
      if (onShowToast) onShowToast('❌ حدث خطأ أثناء إضافة المنتج');
    }
  };

  // Filtered Traders
  const filteredTraders = useMemo(() => {
    return traders.filter(t => {
      const matchesSearch = 
        t.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.seller_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlatform = platformFilter === 'all' || t.platform === platformFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [traders, searchQuery, platformFilter, statusFilter]);

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* 1. Header Banner: Marketer Identity & Multi-Tenant Isolation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Users className="w-6 h-6" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white">
                منظومة إدارة التجار المتعددين (Multi-Merchant Hub)
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                بيئة معزولة بالكامل 🔒
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              حسابك كمسوق مستقل يتيح لك إضافة وإدارة مئات التجار المختلفين على منصات (أمازون، نون، جوميا، رنين، بيّاع، كنز، هوم سمارت). بيانات تجارك لا تظهر لأي مسوق آخر.
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span>المسوق الحالي: <strong className="text-amber-300 font-mono">{currentUserEmail}</strong></span>
              <span>•</span>
              <span>إجمالي التجار المسجلين: <strong className="text-white font-bold">{traders.length} تاجر</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة تاجر جديد</span>
            </button>
            <button
              onClick={loadTraders}
              title="تحديث قائمة التجار"
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم التاجر، معرّف البائع (Seller ID)، أو البريد..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50"
          />
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              platformFilter === 'all' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            جميع المنصات ({traders.length})
          </button>
          {SUPPORTED_PLATFORMS.map(p => {
            const count = traders.filter(t => t.platform === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setPlatformFilter(p.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  platformFilter === p.id
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <img src={p.logo} alt={p.name} className="w-3.5 h-3.5 object-contain" />
                <span>{p.name.split(' ')[0]}</span>
                {count > 0 && <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-full">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-amber-500/50 cursor-pointer"
        >
          <option value="all">كل الحالات</option>
          <option value="active">النشط فقط 🟢</option>
          <option value="inactive">غير النشط ⚪</option>
        </select>
      </div>

      {/* 3. Main Multi-Merchant Grid & Selected Merchant Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Traders List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold">قائمة تجارك المستقلين ({filteredTraders.length})</span>
            <span>انقر على تاجر لمعاينة كتالوجه ومزامنته</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <span>جاري جلب بيانات تجار حسابك المعزول...</span>
            </div>
          ) : filteredTraders.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center gap-4">
              <Store className="w-14 h-14 text-slate-600" />
              <div className="max-w-sm">
                <h4 className="text-base font-bold text-white mb-1">لا توجد سجلات تجار مطابقة</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {searchQuery || platformFilter !== 'all' 
                    ? 'لا توجد نتائج تطابق خيارات التصفية الحالية. جرّب إزالة الفلاتر.'
                    : 'لم تقم بإضافة أي تجار حتى الآن. يمكنك إضافة مئات المتاجر ومتابعة أسعارهم ومخزونهم بشكل منفصل.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أول تاجر الآن</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTraders.map(trader => {
                const platInfo = SUPPORTED_PLATFORMS.find(p => p.id === trader.platform) || SUPPORTED_PLATFORMS[0];
                const isSelected = selectedTrader?.id === trader.id;
                const isSyncing = isSyncingTraderId === trader.id;

                return (
                  <div
                    key={trader.id}
                    onClick={() => setSelectedTrader(trader)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                          <img src={platInfo.logo} alt={platInfo.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xs font-bold text-white truncate max-w-[140px]">{trader.seller_name}</h3>
                            <span className={`px-1.5 py-0 rounded text-[9px] font-bold border ${platInfo.color}`}>
                              {platInfo.name.split(' ')[0]}
                            </span>
                            <span className={`px-1.5 py-0 rounded text-[9px] font-bold border ${
                              trader.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {trader.status === 'active' ? 'نشط 🟢' : 'غير نشط ⚪'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="font-mono truncate max-w-[100px]">ID: {trader.seller_id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveQrTrader(trader)}
                          title="توليد QR Code ومشاركة عبر واتساب"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition cursor-pointer flex items-center gap-1"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSyncTrader(trader)}
                          disabled={isSyncing}
                          title="مزامنة بيانات هذا التاجر (/api/traders/:id/sync)"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition cursor-pointer"
                        >
                          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(trader)}
                          title="تغيير الحالة (نشط/غير نشط)"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrader(trader.id, trader.seller_name)}
                          title="حذف التاجر"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Status info */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>تاريخ الإضافة: {trader.created_at ? new Date(trader.created_at).toLocaleDateString('ar-EG') : 'حديثاً'}</span>
                      {onSelectActiveTrader && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectActiveTrader(trader);
                            if (onShowToast) onShowToast(`🎯 تم تعيين "${trader.seller_name}" كالمتجر النشط على الرادار!`);
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
                        >
                          <span>تفعيل على الرادار</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Trader Catalog & Products (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            {selectedTrader ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span>كتالوج منتجات: {selectedTrader.seller_name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      المعرّف: <span className="font-mono text-amber-300">{selectedTrader.seller_id}</span> ({selectedTrader.platform})
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة منتج</span>
                  </button>
                </div>

                {isLoadingProducts ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                    <span className="text-xs">جاري تحميل منتجات التاجر...</span>
                  </div>
                ) : traderProducts.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 text-slate-400 space-y-2">
                    <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-white">لا توجد منتجات مسجلة لهذا التاجر بعد</p>
                    <p className="text-[11px] text-slate-500">اضغط "إضافة منتج" أو اضغط "مزامنة سريعة" لسحب منتجات التاجر تلقائياً.</p>
                    <button
                      onClick={() => handleSyncTrader(selectedTrader)}
                      disabled={isSyncingTraderId === selectedTrader.id}
                      className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTraderId === selectedTrader.id ? 'animate-spin' : ''}`} />
                      <span>مزامنة الكتالوج الآن</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {traderProducts.map(p => (
                      <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center gap-3">
                        <img 
                          src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'} 
                          alt={p.title} 
                          className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{p.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <span className="text-slate-400 font-mono">SKU: {p.sku}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">المخزون: <strong className="text-white">{p.stock}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <span className="text-amber-400 font-bold">{p.price.toLocaleString()} ج.م</span>
                            {p.buybox_price && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/20">
                                BuyBox: {p.buybox_price} ج.م
                              </span>
                            )}
                            {p.competitor_price && (
                              <span className="text-[10px] text-slate-500">
                                المنافس: {p.competitor_price} ج.م
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                حدد تاجراً من القائمة لمعاينة منتجاته وإدارتها
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Modal: Add New Trader (Requirement 4) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Store className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-black text-white">إضافة تاجر جديد إلى حسابك</h3>
                <p className="text-xs text-slate-400">سيتم حفظ التاجر في Supabase وربطه حصراً بـ user_id الخاص بك</p>
              </div>
            </div>

            <form onSubmit={handleSaveTrader} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم التاجر / المتجر <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSellerName}
                  onChange={(e) => setNewSellerName(e.target.value)}
                  placeholder="مثال: متجر النور للأجهزة المنزلية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  معرّف البائع (Seller ID) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSellerId}
                  onChange={(e) => setNewSellerId(e.target.value)}
                  placeholder="مثال: A3T7XYZ123 أو NOON-SELLER-99"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البريد الإلكتروني للتاجر
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="trader@store.eg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    المنصة التابعة
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    {SUPPORTED_PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    حالة الحساب
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="active">نشط 🟢</option>
                    <option value="inactive">غير نشط ⚪</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800 mt-5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>حفظ وإضافة التاجر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Add Product to Trader */}
      {isAddProductModalOpen && selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddProductModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Package className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-black text-white">إضافة منتج لكتالوج التاجر</h3>
                <p className="text-xs text-slate-400 font-bold">{selectedTrader.seller_name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المنتج *</label>
                <input
                  type="text"
                  required
                  value={newProductTitle}
                  onChange={(e) => setNewProductTitle(e.target.value)}
                  placeholder="مثال: غلاية مياه كهربائية ستانلس ستيل 1.8 لتر"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رمز الـ SKU</label>
                  <input
                    type="text"
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value)}
                    placeholder="SKU-KT-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="450"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الكمية بالمخزون</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رابط الصورة (اختياري)</label>
                  <input
                    type="url"
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code & WhatsApp Share Modal */}
      {activeQrTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setActiveQrTrader(null)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <QrCode className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-black text-white">رمز الاستجابة السريعة للتاجر</h3>
            </div>
            <p className="text-xs text-slate-400">
              امسح الـ QR Code لمشاركة تفاصيل المتجر ورابط الكتالوج عبر واتساب
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto">
              <QRCodeSVG
                value={`${window.location.origin}/traders/${activeQrTrader.id}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono break-all">
              {window.location.origin}/traders/{activeQrTrader.id}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  const storeUrl = `${window.location.origin}/traders/${activeQrTrader.id}`;
                  const text = encodeURIComponent(
                    `🛒 تفاصيل متجرنا على رادار التاجر الذكي:\n\n` +
                    `📌 اسم المتجر: ${activeQrTrader.seller_name}\n` +
                    `🌐 المنصة: ${activeQrTrader.platform}\n` +
                    `🆔 معرّف البائع: ${activeQrTrader.seller_id}\n` +
                    `📧 البريد: ${activeQrTrader.email}\n\n` +
                    `🔗 رابط المتجر والكتالوج:\n${storeUrl}`
                  );
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                  if (onShowToast) onShowToast('📱 جاري فتح واتساب لمشاركة بيانات المتجر والـ QR...');
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <span>مشاركة عبر واتساب 💬</span>
              </button>
              <button
                onClick={() => {
                  const storeUrl = `${window.location.origin}/traders/${activeQrTrader.id}`;
                  navigator.clipboard.writeText(storeUrl);
                  if (onShowToast) onShowToast('📋 تم نسخ رابط المتجر إلى الحافظة بنجاح!');
                }}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                نسخ الرابط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiMerchantTradersPage;
