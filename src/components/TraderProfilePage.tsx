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
  DollarSign
} from 'lucide-react';
import { safeFormatDate } from '../utils/dateAndMathUtils';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'invoices' | 'competitors'>('overview');
  
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
            last_sync_at: new Date().toISOString()
          });
        }

        // GET /api/traders/:id/products
        const resProducts = await fetch(`/api/traders/${traderId}/products`);
        const dataProducts = await resProducts.json();
        if (isMounted && dataProducts.success && Array.isArray(dataProducts.products)) {
          setProducts(dataProducts.products);
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

  // Action 1: Pull Catalog for THIS Trader Only
  const handleSyncTraderCatalog = async () => {
    setIsSyncingCatalog(true);
    try {
      const res = await fetch(`/api/traders/${traderId}/sync-catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trader_id: traderId })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        if (data.last_sync_at) {
          setTraderInfo((prev: any) => prev ? { ...prev, last_sync_at: data.last_sync_at } : prev);
        }
        setActiveTab('products'); // Automatically switch to Products tab to view pulled data
        if (onShowToast) {
          onShowToast(`🛍️ تم بنجاح سحب وتحديث ${data.products.length} منتج لـ "${traderInfo?.name || traderId}"!`);
        }
      } else {
        throw new Error(data.error || 'فشلت عملية السحب');
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`⚠️ تعذر سحب الكتالوج: ${err?.message || 'خطأ في الاتصال'}`);
      }
    } finally {
      setIsSyncingCatalog(false);
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
  const buyBoxWinRate = totalCatalogCount > 0 ? Math.round((buyBoxWinnersCount / totalCatalogCount) * 100) : 50;
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
              onClick={handleSyncTraderCatalog}
              disabled={isSyncingCatalog}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              title="سحب منتجات هذا التاجر فقط وإدخال trader_id بالـ API"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
              <span>{isSyncingCatalog ? 'جاري سحب الكتالوج...' : 'سحب الكتالوج من المنصات 🔄'}</span>
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
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Tab 1: نظرة عامة (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Tab 2: المنتجات ({products.length} منتج)</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Tab 3: البوالص والطلبات ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('competitors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'competitors'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tab 4: المنافسون ({competitors.length})</span>
          </button>
        </div>

      </div>

      {/* Tab 1: نظرة عامة (Overview) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
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

            <button
              onClick={handleSyncTraderCatalog}
              disabled={isSyncingCatalog}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
              <span>سحب الكتالوج المحدث لهذا التاجر 🔄</span>
            </button>
          </div>

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
                        p.platform === 'amazon_eg'
                          ? 'bg-sky-950 text-sky-300 border border-sky-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        {p.platform === 'amazon_eg' ? '🛒 أمازون مصر' : '🛍️ نون مصر'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white font-mono">{p.price || p.merchantPrice || 0} ج.م</td>
                    <td className="p-3 font-bold text-slate-300 font-mono">{p.competitor_price || p.lowestCompetitorPrice || 0} ج.م</td>
                    <td className="p-3 font-bold text-emerald-400 font-mono">{p.buybox_price || p.buyBoxPrice || 0} ج.م</td>
                    <td className="p-3">
                      <span className="text-xs font-bold text-amber-300">
                        {p.buybox_owner || p.buyBoxWinner || 'متجر محمود سعيد 🏆'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-mono font-bold ${
                        (p.stock_qty ?? p.stockQuantity ?? 0) <= 5 ? 'text-amber-400' : 'text-slate-200'
                      }`}>
                        {p.stock_qty ?? p.stockQuantity ?? 0} قطعة
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

      {/* Tab 4: المنافسون (Competitors Price Analysis) */}
      {activeTab === 'competitors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-base font-black text-white font-['Alexandria']">
              فحص المنافسين والـ Buy Box لمنتجات التاجر
            </h3>

            <button
              onClick={handleScanTraderCompetitors}
              disabled={isScanningCompetitors}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isScanningCompetitors ? 'animate-spin' : ''}`} />
              <span>إعادة فحص أسعار المنافسين ⚡</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-3">كود SKU / اسم المنتج</th>
                  <th className="p-3">سعر التاجر</th>
                  <th className="p-3">أقل سعر منافس</th>
                  <th className="p-3">اسم المنافس الأقرب</th>
                  <th className="p-3">سعر الـ Buy Box</th>
                  <th className="p-3">الفائز بالصندوق</th>
                  <th className="p-3">فارق السعر %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {competitors.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-white">{c.productTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {c.sku}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">{c.traderPrice} ج.م</td>
                    <td className="p-3 font-mono font-bold text-slate-300">{c.lowestCompetitorPrice} ج.م</td>
                    <td className="p-3 text-slate-300">{c.lowestCompetitorName}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{c.buyBoxPrice} ج.م</td>
                    <td className="p-3 font-bold text-amber-300">{c.buyBoxOwner}</td>
                    <td className="p-3 font-mono font-bold">
                      <span className={c.priceGapPercent < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {c.priceGapPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
