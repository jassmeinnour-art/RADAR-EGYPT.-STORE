import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { safeFormatDate } from '../utils/dateAndMathUtils';
import { multiTenantDb } from '../lib/supabase';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory_platforms' | 'competitors' | 'invoices' | 'settings'>('overview');
  
  // Platform Connection Test States
  const [testingPlatformId, setTestingPlatformId] = useState<string | null>(null);
  const [platformTestResults, setPlatformTestResults] = useState<Record<string, { status: 'success' | 'failed'; message: string; latency?: number }>>({});

  const handleTestPlatformConnection = async (platformKey: string, apiKeyVal: string, sellerIdVal: string) => {
    setTestingPlatformId(platformKey);
    try {
      const res = await fetch('/api/platforms/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: platformKey,
          apiKey: apiKeyVal,
          sellerId: sellerIdVal
        })
      });
      const data = await res.json();
      setPlatformTestResults(prev => ({
        ...prev,
        [platformKey]: {
          status: data.success ? 'success' : 'failed',
          message: data.message || (data.success ? 'تم الاتصال بنجاح' : 'فشل الاتصال'),
          latency: data.latencyMs
        }
      }));
      if (onShowToast) {
        if (data.success) {
          onShowToast(`🟢 نجح اختبار الاتصال بمنصة (${platformKey}) بنجاح! (${data.latencyMs}ms)`);
        } else {
          onShowToast(`🔴 فشل الاتصال بمنصة (${platformKey}): ${data.message}`);
        }
      }
    } catch (err: any) {
      setPlatformTestResults(prev => ({
        ...prev,
        [platformKey]: {
          status: 'failed',
          message: err?.message || 'خطأ في الشبكة'
        }
      }));
      if (onShowToast) onShowToast(`⚠️ خطأ في اختبار اتصال (${platformKey})`);
    } finally {
      setTestingPlatformId(null);
    }
  };
  
  // Data States
  const [traderInfo, setTraderInfo] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);

  // Loading States
  const [isLoadingTrader, setIsLoadingTrader] = useState(true);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [isSyncingInvoices, setIsSyncingInvoices] = useState(false);
  const [isScanningCompetitors, setIsScanningCompetitors] = useState(false);

  // Search Filter
  const [productSearch, setProductSearch] = useState('');

  // Manual Add Product Modal States
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newPlatform, setNewPlatform] = useState<'amazon_eg' | 'noon_eg' | 'jumia_eg'>('amazon_eg');
  const [newImage, setNewImage] = useState('');

  // 1. Fetch Trader Details & Initial Products
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTrader(true);

    const fetchAllData = async () => {
      try {
        // GET /api/traders/:id
        const resTrader = await fetch(`/api/traders/${traderId}`);
        const dataTrader = await resTrader.json();
        if (isMounted && dataTrader.success && dataTrader.trader) {
          setTraderInfo(dataTrader.trader);
        } else if (isMounted) {
          // Default fallback if trader not in API store
          setTraderInfo({
            id: traderId,
            name: traderId.includes('mahmeud') ? 'متجر محمود سعيد (Mahmeud Said Store)' : 'متجر تاجر معتمد',
            email: 'mahmeud.said@merchantradar.eg',
            platform: 'amazon_eg',
            seller_id: 'AMAOHMEDSAID1',
            category: 'أثاث ومفروشات',
            phone: '+20 10 1234 5678',
            city: 'القاهرة - مصر',
            is_connected: true,
            sync_status: 'Connected',
            products_count: 0,
            last_sync_at: new Date().toISOString()
          });
        }

        // Fetch products strictly for this trader using multiTenantDb and server
        const prods = await multiTenantDb.getProductsByTrader(traderId);
        if (isMounted) {
          setProducts(prods);
        }

        // GET /api/traders/:id/invoices
        const resInvoices = await fetch(`/api/traders/${traderId}/invoices`);
        const dataInvoices = await resInvoices.json();
        if (isMounted && dataInvoices.success && Array.isArray(dataInvoices.invoices)) {
          setInvoices(dataInvoices.invoices);
        }

        // GET /api/traders/:id/competitors
        const resComp = await fetch(`/api/traders/${traderId}/competitors`);
        const dataComp = await resComp.json();
        if (isMounted && dataComp.success && Array.isArray(dataComp.competitors)) {
          setCompetitors(dataComp.competitors);
        }
      } catch (err) {
        console.warn('Error fetching trader data:', err);
      } finally {
        if (isMounted) setIsLoadingTrader(false);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [traderId]);

  // Action 1: Pull Catalog for THIS Trader Only from Real APIs
  const handleSyncTraderCatalog = async () => {
    setIsSyncingCatalog(true);
    try {
      const syncResult = await multiTenantDb.syncTrader(traderId);
      if (syncResult.success) {
        setProducts(syncResult.products);
        setTraderInfo((prev: any) => prev ? { ...prev, last_sync_at: new Date().toISOString(), products_count: syncResult.products.length } : prev);
        setActiveTab('products'); // Automatically switch to Products tab
        if (onShowToast) {
          if (syncResult.products.length > 0) {
            onShowToast(`🛍️ تم بنجاح سحب وتحديث ${syncResult.products.length} منتج لـ "${traderInfo?.name || traderId}"!`);
          } else {
            onShowToast(`ℹ️ تم الاتصال بالمنصة بنجاح - لا توجد منتجات مسجلة لهذا التاجر بعد على المنصة.`);
          }
        }
      } else {
        throw new Error('فشلت عملية المزامنة');
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`⚠️ تعذر سحب الكتالوج: ${err?.message || 'خطأ في الاتصال'}`);
      }
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  // Action: Add Product Manually for THIS Trader Only
  const handleManualAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى إدخال اسم المنتج');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const numPrice = Number(newPrice) || 0;
      const numStock = Number(newStock) || 0;
      const created = await multiTenantDb.createProduct({
        trader_id: traderId,
        title: newTitle.trim(),
        sku: newSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        price: numPrice,
        stock: numStock,
        platform: newPlatform,
        image: newImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
        buybox_price: numPrice,
        competitor_price: numPrice > 0 ? numPrice + Math.round(numPrice * 0.05) : 0,
        is_buybox_winner: true,
        buybox_owner: traderInfo?.name || 'متجرك 🏆'
      } as any);

      setProducts(prev => [created, ...prev]);
      setTraderInfo((prev: any) => prev ? { ...prev, products_count: (prev.products_count || 0) + 1 } : prev);
      setIsAddProductModalOpen(false);
      setNewTitle('');
      setNewSku('');
      setNewPrice('');
      setNewStock('10');
      setNewImage('');
      setActiveTab('products');

      if (onShowToast) {
        onShowToast(`✅ تم إضافة المنتج "${created.title}" وحفظه للتاجر بنجاح!`);
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل حفظ المنتج: ${err?.message || 'خطأ غير متوقع'}`);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Action 2: Pull Invoices / Orders for THIS Trader Only
  const handleSyncTraderInvoices = async () => {
    setIsSyncingInvoices(true);
    try {
      const res = await fetch(`/api/traders/${traderId}/sync-invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trader_id: traderId })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
        setActiveTab('invoices'); // Switch to Invoices tab
        if (onShowToast) {
          onShowToast(`📦 تم بنجاح سحب ${data.invoices.length} بوليصة شحن خاصة بالتاجر!`);
        }
      } else {
        throw new Error(data.error || 'فشلت عملية سحب البوالص');
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`⚠️ تعذر سحب البوالص: ${err?.message || 'خطأ في الاتصال'}`);
      }
    } finally {
      setIsSyncingInvoices(false);
    }
  };

  // Action 3: Scan Competitor Pricing for THIS Trader Only
  const handleScanTraderCompetitors = async () => {
    setIsScanningCompetitors(true);
    try {
      const res = await fetch(`/api/traders/${traderId}/competitors`);
      const data = await res.json();
      if (data.success && Array.isArray(data.competitors)) {
        setCompetitors(data.competitors);
        setActiveTab('competitors'); // Switch to Competitors tab
        if (onShowToast) {
          onShowToast(`⚡ تم فحص أسعار المنافسين والـ Buy Box لـ "${traderInfo?.name || traderId}" بنجاح!`);
        }
      } else {
        throw new Error(data.error || 'فشل فحص أسعار المنافسين');
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`⚠️ تعذر فحص المنافسين: ${err?.message || 'خطأ في الاتصال'}`);
      }
    } finally {
      setIsScanningCompetitors(false);
    }
  };

  // Filtered Products for THIS Trader
  const filteredProducts = products.filter(p => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.asin || '').toLowerCase().includes(q)
    );
  });

  // Calculate Overview KPIs
  const totalCatalogCount = products.length;
  const buyBoxWinnersCount = products.filter(p => p.buybox_owner?.includes('محمود سعيد') || p.buybox_owner?.includes('🏆') || p.isBuyBoxWinner).length;
  const buyBoxWinRate = totalCatalogCount > 0 ? Math.round((buyBoxWinnersCount / totalCatalogCount) * 100) : 0;
  const lowStockCount = products.filter(p => (p.stock_qty ?? 0) <= 5).length;
  const needsRepricingCount = products.filter(p => (p.price ?? 0) > (p.buybox_price ?? 0)).length;

  if (isLoadingTrader) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-amber-300 font-bold bg-slate-900/60 rounded-3xl border border-slate-800 p-12">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <span>جاري تحميل ملف التاجر وسحب البيانات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Top Header & Breadcrumb */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-amber-400" />
            <span>العودة لدليل التجار الشامل</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>الرئيسية</span>
            <span>/</span>
            <span>التجار</span>
            <span>/</span>
            <span className="text-amber-300 font-bold">{traderInfo?.name || traderId}</span>
          </div>
        </div>

        {/* Trader Main Info & Action Pull Buttons */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pt-2">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>متصل سحابياً (Connected) 🟢</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                Seller ID: {traderInfo?.seller_id || traderInfo?.amazonSellerId || 'AMAOHMEDSAID1'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-['Alexandria'] text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-400" />
              <span>{traderInfo?.name || 'متجر التاجر المعتمد'}</span>
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                {traderInfo?.email || traderInfo?.primaryEmail || 'mahmeud.said@merchantradar.eg'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {traderInfo?.phone || '+20 10 1234 5678'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {traderInfo?.city || 'القاهرة - مصر'}
              </span>
            </div>
          </div>

          {/* Action Pull Buttons Inside Trader Profile */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
            
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              title="إضافة منتج حقيقي لـ trader_id الحالي فقط ويحفظ في Supabase"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج يدوي</span>
            </button>

            <button
              type="button"
              onClick={handleSyncTraderCatalog}
              disabled={isSyncingCatalog}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              title="سحب منتجات هذا التاجر الحقيقية من Amazon/Noon API فقط"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
              <span>{isSyncingCatalog ? 'جاري المزامنة...' : 'مزامنة من المنصة 🔄'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncTraderInvoices}
              disabled={isSyncingInvoices}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              title="سحب بوالص الشحن والطلبات الخاصة بهذا التاجر فقط"
            >
              <Truck className={`w-4 h-4 ${isSyncingInvoices ? 'animate-spin' : ''}`} />
              <span>{isSyncingInvoices ? 'جاري سحب البوالص...' : 'سحب البوالص / الطلبات 📦'}</span>
            </button>

            <button
              type="button"
              onClick={handleScanTraderCompetitors}
              disabled={isScanningCompetitors}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 border border-slate-700"
              title="فحص أسعار المنافسين والـ Buy Box لمنتجات هذا التاجر"
            >
              <Sparkles className={`w-4 h-4 ${isScanningCompetitors ? 'animate-spin' : ''}`} />
              <span>{isScanningCompetitors ? 'جاري الفحص...' : 'فحص أسعار المنافسين ⚡'}</span>
            </button>

          </div>

        </div>

        {/* Tab Navigation */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. البيانات الأساسية 👤</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>2. المنتجات ({products.length}) 📦</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory_platforms')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory_platforms'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. المخزون لكل منصة 📊</span>
          </button>

          <button
            onClick={() => setActiveTab('competitors')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'competitors'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4. أسعار المنافسين 💰</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>5. الفواتير والطلبات 🧾</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>6. الإعدادات ومفاتيح API 🔑</span>
          </button>
        </div>

      </div>

      {/* Tab 1: نظرة عامة (Overview) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Zero Products Banner when merchant has no products */}
          {totalCatalogCount === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-amber-200 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                  📦
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">0 منتج - هذا التاجر لم تتم مزامنة منتجاته بعد</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    لا يوجد منتجات لهذا التاجر بعد
                    اضغط 'مزامنة من المنصة' أو 'إضافة منتج يدوي'
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول منتج</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncTraderCatalog}
                  disabled={isSyncingCatalog}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
                  <span>مزامنة من أمازون/نون</span>
                </button>
              </div>
            </div>
          )}
          
          {/* 4 KPI Overview Cards matching design requirements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">إجمالي الكتالوج</span>
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{totalCatalogCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">منتجات مسجلة ومزتمنة</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">الاستحواذ على Buy Box</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{buyBoxWinRate}%</div>
              <div className="text-[11px] text-emerald-300 mt-1">{buyBoxWinnersCount} منتج مستحوذ على الصندوق</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">مخزون منخفض</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">{lowStockCount}</div>
              <div className="text-[11px] text-amber-300 mt-1">أقل من 5 قطع بالمستودع</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">بحاجة لتعديل سعر</span>
                <TrendingUp className="w-5 h-5 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">{needsRepricingCount}</div>
              <div className="text-[11px] text-rose-300 mt-1">سعر أعلى من الـ Buy Box</div>
            </div>

          </div>

          {/* Trader Detailed Profile Specifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white font-['Alexandria'] border-b border-slate-800 pb-3 flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              <span>تفاصيل واشتراكات المتجر</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400">اسم المتجر المسؤول:</span>
                <div className="text-sm font-black text-white">{traderInfo?.name || 'متجر محمود سعيد'}</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400">البريد الإلكتروني التجاري:</span>
                <div className="text-sm font-mono font-bold text-sky-300">{traderInfo?.email || 'mahmeud.said@merchantradar.eg'}</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400">Seller ID / Store ID:</span>
                <div className="text-sm font-mono font-bold text-amber-300">{traderInfo?.seller_id || 'AMAOHMEDSAID1'}</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400">المنصات المرتبطة:</span>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">🛒 أمازون مصر</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">🛍️ نون مصر</span>
                  <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-700 font-bold">📦 جوميا</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400">المدينة / المحافظة:</span>
                <div className="text-sm font-bold text-slate-200">{traderInfo?.city || 'القاهرة - مصر'}</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400">تاريخ آخر مزامنة تلقائية:</span>
                <div className="text-sm font-mono text-emerald-400">{safeFormatDate(traderInfo?.last_sync_at)}</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: المنتجات (Products Table for THIS Trader Only) */}
      {activeTab === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="ابحث بمنتجات هذا التاجر (SKU, ASIN, اسم المنتج)..."
                className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج يدوي</span>
              </button>

              <button
                type="button"
                onClick={handleSyncTraderCatalog}
                disabled={isSyncingCatalog}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
                <span>مزامنة من المنصة 🔄</span>
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="py-16 px-6 text-center bg-slate-950/60 rounded-3xl border border-slate-800/80 space-y-4 my-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                📦
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">لا يوجد منتجات</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  لا يوجد منتجات لهذا التاجر بعد
                  <br />
                  اضغط 'مزامنة من المنصة' أو 'إضافة منتج يدوي'
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول منتج</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncTraderCatalog}
                  disabled={isSyncingCatalog}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
                  <span>مزامنة من أمازون/نون</span>
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              لا توجد منتجات تطابق البحث الحالي
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="p-3">المنتج</th>
                    <th className="p-3">المنصة</th>
                    <th className="p-3">سعر التاجر</th>
                    <th className="p-3">أقل منافس</th>
                    <th className="p-3">سعر الـ Buy Box</th>
                    <th className="p-3">الفائز بالصندوق</th>
                    <th className="p-3">المخزون</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProducts.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-800/50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=80'}
                            alt={p.title}
                            className="w-10 h-10 object-cover rounded-xl border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white max-w-md line-clamp-1">{p.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} | ASIN: {p.asin || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.platform === 'amazon_eg' || p.platform === 'amazon'
                            ? 'bg-sky-950 text-sky-300 border border-sky-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}>
                          {p.platform === 'amazon_eg' || p.platform === 'amazon' ? '🛒 أمازون مصر' : '🛍️ نون مصر'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white font-mono">{p.price || p.merchantPrice || 0} ج.م</td>
                      <td className="p-3 font-bold text-slate-300 font-mono">{p.competitor_price || p.lowestCompetitorPrice || 0} ج.م</td>
                      <td className="p-3 font-bold text-emerald-400 font-mono">{p.buybox_price || p.buyBoxPrice || 0} ج.م</td>
                      <td className="p-3">
                        <span className="text-xs font-bold text-amber-300">
                          {p.buybox_owner || p.buyBoxWinner || 'متجرك 🏆'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-mono font-bold ${
                          (p.stock_qty ?? p.stockQuantity ?? p.stock ?? 0) <= 5 ? 'text-amber-400' : 'text-slate-200'
                        }`}>
                          {p.stock_qty ?? p.stockQuantity ?? p.stock ?? 0} قطعة
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                          تسعير نشط 🟢
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Tab 3: البوالص والطلبات (Waybills & Orders) */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-base font-black text-white font-['Alexandria']">
              بوالص شحن وطلبات التاجر المعتمد ({invoices.length})
            </h3>

            <button
              onClick={handleSyncTraderInvoices}
              disabled={isSyncingInvoices}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInvoices ? 'animate-spin' : ''}`} />
              <span>سحب وتحديث بوالص الشحن 📦</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-3">رقم البوليصة / الشحنة</th>
                  <th className="p-3">شركة الشحن</th>
                  <th className="p-3">اسم العميل والمدينة</th>
                  <th className="p-3">قيمة الطلب</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {invoices.map((inv, idx) => (
                  <tr key={inv.id || idx} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-amber-300">{inv.waybillNumber}</td>
                    <td className="p-3 font-bold text-slate-200">{inv.courierName}</td>
                    <td className="p-3 text-slate-300">{inv.customerName} ({inv.customerCity})</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{inv.totalAmountEGP} ج.م</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-700">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{inv.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 3: المخزون لكل منصة (Inventory across Amazon/Noon/Jumia/Raneen/Kanz/HomeSmart/Bayyaa) */}
      {activeTab === 'inventory_platforms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white font-['Alexandria'] flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>مقارنة وتوزيع المخزون والأسعار لكل منصة</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">متابعة فورية للمخزون الموزع عبر منصات أمازون، نون، جوميا، رنين، كنز، هوم سمارت، وبيّاع</p>
            </div>
            <button
              onClick={handleSyncTraderCatalog}
              disabled={isSyncingCatalog}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
              <span>تحديث المخزون عبر المنصات 🔄</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['أمازون مصر (Amazon)', 'نون مصر (Noon)', 'جوميا مصر (Jumia)', 'رنين (Raneen)', 'كنز (Kanz)', 'هوم سمارت (HomeSmart)', 'بيّاع (Bayyaa)'].map((platName, pIdx) => {
              const platProducts = products.filter(p => {
                const code = String(p.platform || '').toLowerCase();
                if (pIdx === 0) return code.includes('amazon');
                if (pIdx === 1) return code.includes('noon');
                if (pIdx === 2) return code.includes('jumia');
                if (pIdx === 3) return code.includes('raneen');
                if (pIdx === 4) return code.includes('kanz');
                if (pIdx === 5) return code.includes('homesmart');
                return code.includes('bayyaa');
              });
              const totalStock = platProducts.reduce((sum, p) => sum + (Number(p.stock_qty ?? p.stockQuantity ?? p.stock) || 0), 0);

              return (
                <div key={pIdx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{platName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {platProducts.length} منتج
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-400 text-[11px]">إجمالي المخزون المتاح:</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">{totalStock} قطعة</div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                    {platProducts.length > 0 ? 'متصل ومزامن 🟢' : 'بانتظار المزامنة ⚪'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-3">المنتج (SKU / Title)</th>
                  <th className="p-3">المنصة</th>
                  <th className="p-3">السعر الحالي</th>
                  <th className="p-3">المخزون المتوفر</th>
                  <th className="p-3">حالة المزامنة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      0 منتج - لا توجد منتجات مسجلة لهذا التاجر بعد
                    </td>
                  </tr>
                ) : (
                  products.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-bold text-white">
                        {p.title}
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</div>
                      </td>
                      <td className="p-3 font-bold text-amber-300">{p.platform || 'أمازون/نون'}</td>
                      <td className="p-3 font-mono font-bold text-white">{p.price || 0} ج.م</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{p.stock_qty ?? p.stock ?? 0} قطعة</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                          متصل سحابياً 🟢
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: الإعدادات ومفاتيح API (Settings & API Keys with Quick Test Connection) */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white font-['Alexandria'] flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>إعدادات الاتصال ومفاتيح الـ API للمنصات</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">إدارة معرّفات المتاجر ومفاتيح الربط واختبار الاتصال الفوري لكل منصة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[
              { id: 'amazon', name: 'أمازون مصر (Amazon SP-API)', sellerId: traderInfo?.seller_id || 'AMAOHMEDSAID1', keyPlaceholder: 'Atza|AMZN-SP-API-KEY-...' },
              { id: 'noon', name: 'نون مصر (Noon Partner API)', sellerId: traderInfo?.noon_seller_id || 'NOON-EG-9941', keyPlaceholder: 'noon_live_sec_...' },
              { id: 'jumia', name: 'جوميا مصر (Jumia Seller API)', sellerId: traderInfo?.jumia_seller_id || 'JUMIA-EG-882', keyPlaceholder: 'jumia_prod_key_...' },
              { id: 'raneen', name: 'رنين (Raneen Connector)', sellerId: 'RANEEN-EG-101', keyPlaceholder: 'rn_api_...' },
              { id: 'kanz', name: 'كنز (Kanz API)', sellerId: 'KANZ-EG-202', keyPlaceholder: 'kanz_sec_...' },
              { id: 'homesmart', name: 'هوم سمارت (HomeSmart API)', sellerId: 'HS-EG-303', keyPlaceholder: 'hs_key_...' },
              { id: 'bayyaa', name: 'بيّاع (Bayyaa Partner)', sellerId: 'BY-EG-404', keyPlaceholder: 'by_token_...' }
            ].map(plat => {
              const testRes = platformTestResults[plat.id];
              const isTesting = testingPlatformId === plat.id;

              return (
                <div key={plat.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>{plat.name}</span>
                    </span>
                    {testRes ? (
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                        testRes.status === 'success' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {testRes.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{testRes.status === 'success' ? `متصل بنجاح (${testRes.latency}ms)` : 'فشل الاتصال'}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                        بانتظار الاختبار ⚪
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">معرّف البائع (Seller ID / Store ID)</label>
                      <input
                        type="text"
                        readOnly
                        value={plat.sellerId}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">مفتاح الربط (API Key / Secret)</label>
                      <input
                        type="password"
                        readOnly
                        value="••••••••••••••••••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {testRes && (
                    <div className={`p-2.5 rounded-xl text-[11px] ${
                      testRes.status === 'success' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-900' : 'bg-rose-950/50 text-rose-300 border border-rose-900'
                    }`}>
                      {testRes.message}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                    <span className="text-[11px] text-slate-500 font-mono">آخر تحقق: منذ قليل</span>
                    <button
                      type="button"
                      onClick={() => handleTestPlatformConnection(plat.id, plat.keyPlaceholder, plat.sellerId)}
                      disabled={isTesting}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                      title="استدعاء نقطة اتصال (Endpoint) لاختبار اتصال الـ API فورياً"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'جاري الفحص...' : 'مزامنة سريعة / اختبار الاتصال ⚡'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Manual Product for Current Trader */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
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
                <h3 className="text-lg font-black text-white">إضافة منتج يدوي للتاجر</h3>
                <p className="text-xs text-slate-400">سيتم حفظ المنتج في جدول products وربطه حصراً بـ trader_id الحالي</p>
              </div>
            </div>

            <form onSubmit={handleManualAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم المنتج <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: طاولة مكتب خشبية مودرن 120 سم"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    السعر (ج.م) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="3200"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    الكمية بالمخزون
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    كود التخزين (SKU)
                  </label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="SKU-MS-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    المنصة التابعة
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="amazon_eg">أمازون مصر (Amazon)</option>
                    <option value="noon_eg">نون مصر (Noon)</option>
                    <option value="jumia_eg">جوميا مصر (Jumia)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رابط صورة المنتج (URL)
                </label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800 mt-5">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-2"
                >
                  {isSubmittingProduct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>حفظ وإضافة المنتج للتاجر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
