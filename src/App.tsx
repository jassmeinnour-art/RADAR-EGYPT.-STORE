import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { 
  BarChart3, ShoppingBag, Store, Sparkles, TrendingUp, Printer, 
  CreditCard, ShieldCheck, Zap, RefreshCw, Layers, CheckCircle2, 
  Lock, AlertTriangle, Users, Download, ArrowUpRight, Search, 
  Settings, DollarSign, Package, Radio, Plus, Eye, Copy, Sliders,
  Bell, Play, Pause, Smartphone, Monitor, ChevronDown, Check, X,
  FileText, Truck, ShieldAlert, Cpu, Image as ImageIcon, Flame
} from 'lucide-react';

// ==========================================
// INITIAL MOCK DATA & CONFIGURATIONS
// ==========================================
const ADMIN_EMAIL = 'jassmeinnour@gmail.com';
const VODAFONE_CASH_NUMBER = '01097751352';

const PLATFORMS = [
  { id: 'amazon', name: 'أمازون مصر (Amazon.eg)', color: '#FF9900', badge: 'FBA & MFN', logo: '📦' },
  { id: 'noon', name: 'نون (Noon Egypt)', color: '#FEEE00', badge: 'Express & Direct', logo: '🟡' },
  { id: 'jumia', name: 'جوميا (Jumia)', color: '#F68B1E', badge: 'Jumia Express', logo: '🟠' },
  { id: 'kenz', name: 'كنز (Kenz Store)', color: '#00C853', badge: 'B2B & Retail', logo: '💚' },
  { id: 'raneen', name: 'رنين (Raneen.com)', color: '#E53935', badge: 'Local Chain', logo: '🔴' },
  { id: 'homzmart', name: 'هوزمارت (Homzmart)', color: '#8E24AA', badge: 'Furniture & Home', logo: '🟣' },
  { id: 'shopify', name: 'متجر خاص (Shopify/Woo)', color: '#9C27B0', badge: 'Direct API', logo: '🛍️' }
];

const MOCK_MERCHANTS = [
  { id: 'm1', name: 'شركة البركة للأجهزة والإلكترونيات', category: 'إلكترونيات وأجهزة', manager: 'ياسمين نور', linkedPlatforms: ['amazon', 'noon', 'jumia'], totalSkus: 420, monthlyRevenue: '450,000 ج.م' },
  { id: 'm2', name: 'براند هوم ستور للمنزل والأثاث', category: 'أثاث وديكور', manager: 'ياسمين نور', linkedPlatforms: ['homzmart', 'raneen', 'amazon'], totalSkus: 180, monthlyRevenue: '620,000 ج.م' },
  { id: 'm3', name: 'فاشن ايبكس للملابس الجاهزة', category: 'ملابس وموضة', manager: 'أحمد محمود', linkedPlatforms: ['noon', 'jumia', 'kenz'], totalSkus: 850, monthlyRevenue: '310,000 ج.م' }
];

const MOCK_INVENTORY = [
  { id: 'sku-101', name: 'حامل هاتف ذكي للسيارة مزود بشاحن لاسلكي 15W', merchantId: 'm1', platforms: ['amazon', 'noon'], realStock: 145, reservedStock: 15, availableStock: 130, status: 'In Stock', price: 450, cost: 210, lowestCompetitor: 435, buyboxWon: true },
  { id: 'sku-102', name: 'منظم أدوات المطبخ والاكسسوارات الاكريليك', merchantId: 'm2', platforms: ['homzmart', 'amazon', 'raneen'], realStock: 8, reservedStock: 2, availableStock: 6, status: 'Low Stock', price: 320, cost: 110, lowestCompetitor: 299, buyboxWon: false },
  { id: 'sku-103', name: 'مجموعة حقائب سفر ضد الماء 3 قطع', merchantId: 'm3', platforms: ['noon', 'jumia'], realStock: 0, reservedStock: 0, availableStock: 0, status: 'Out of Stock', price: 1250, cost: 680, lowestCompetitor: 1200, buyboxWon: false },
  { id: 'sku-104', name: 'قلاية هوائية بدون زيت سعة 6 لتر 1800 واط', merchantId: 'm1', platforms: ['amazon', 'noon', 'jumia', 'raneen'], realStock: 84, reservedStock: 6, availableStock: 78, status: 'In Stock', price: 2890, cost: 1950, lowestCompetitor: 2850, buyboxWon: true }
];

const MOCK_TRENDS = [
  { id: 't1', title: 'خلاط بروتين محمول بشحن USB-C', location: 'مصر والخليج', potentialMargin: '180%', trendScore: 98, avgSellingPrice: '550 ج.م', supplierCost: '190 ج.م', niche: 'أدوات رياضية ومطبخ' },
  { id: 't2', title: 'منظم الأحذية السحري العمودي القابل للطي', location: 'مصر (تريند تيك توك)', potentialMargin: '210%', trendScore: 94, avgSellingPrice: '280 ج.م', supplierCost: '85 ج.م', niche: 'تنظيم المنزل' },
  { id: 't3', title: 'ماكينة حلاقة رجالية احترافية بشاشة LED', location: 'العالم ومصر', potentialMargin: '150%', trendScore: 91, avgSellingPrice: '420 ج.م', supplierCost: '160 ج.م', niche: 'عناية شخصية' },
  { id: 't4', title: 'مصباح إضاءة للكتب واختبار العيون ذكي rechargeable', location: 'تريند عالمي', potentialMargin: '240%', trendScore: 89, avgSellingPrice: '310 ج.م', supplierCost: '90 ج.م', niche: 'إلكترونيات ودراسة' }
];

const MOCK_WAYBILLS = [
  { orderId: 'ORD-88219-AMZ', platform: 'Amazon Egypt', customer: 'محمد فتحي عبد السلام', city: 'القاهرة - المعادي', itemsCount: 3, items: ['حامل هاتف للسيارة (x2)', 'قلاية هوائية 6L (x1)'], needsSplit: true, status: 'Ready to Print' },
  { orderId: 'ORD-99412-NON', platform: 'Noon Egypt', customer: 'سارة أحمد عثمان', city: 'الإسكندرية - سموحة', itemsCount: 1, items: ['منظم أدوات المطبخ (x1)'], needsSplit: false, status: 'Printed' },
  { orderId: 'ORD-44012-AMZ', platform: 'Amazon Egypt', customer: 'مهندس محمود الديب', city: 'الجيزة - 6 أكتوبر', itemsCount: 4, items: ['حقيبة سفر 3 قطع (x1)', 'حامل هاتف (x3)'], needsSplit: true, status: 'Ready to Print' }
];

// ==========================================
// CONTEXTS & APP STATE MANAGEMENT
// ==========================================
const AppContext = createContext();

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState('inventory');
  const [currentUserEmail, setCurrentUserEmail] = useState('jassmeinnour@gmail.com');
  const [selectedMerchant, setSelectedMerchant] = useState(MOCK_MERCHANTS[0]);
  
  // Trial & Subscription System State
  const [trialDaysLeft, setTrialDaysLeft] = useState(3);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [paymentProofRef, setPaymentProofRef] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  // App Installed / Hybrid Banner
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Admin Toggle (if currentUser is owner)
  const isAdmin = currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Dynamic Data States
  const [merchants, setMerchants] = useState(MOCK_MERCHANTS);
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [waybills, setWaybills] = useState(MOCK_WAYBILLS);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto Lock Check
  const isLocked = !isSubscribed && trialDaysLeft <= 0 && !isAdmin;

  const value = {
    activeTab, setActiveTab,
    currentUserEmail, setCurrentUserEmail,
    selectedMerchant, setSelectedMerchant,
    merchants, setMerchants,
    inventory, setInventory,
    waybills, setWaybills,
    trialDaysLeft, isSubscribed, setIsSubscribed,
    showSubscriptionModal, setShowSubscriptionModal,
    isAdmin, isLocked, searchQuery, setSearchQuery,
    VODAFONE_CASH_NUMBER
  };

  return (
    <AppContext.Provider value={value}>
      <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white flex flex-col">
        
        {/* Top Executive Header */}
        <TopHeader />

        {/* PWA / Desktop App Install Prompt */}
        {showInstallBanner && (
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border-b border-indigo-800/40 px-4 py-2 text-xs md:text-sm flex items-center justify-between text-indigo-200">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>تطبيق <strong>رادار التاجر الذكي</strong> جاهز للثبيت على الويندوز والأندرويد للعمل المباشر بسلاسة.</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => alert('تم بدء تثبيت التطبيق على جهازك بنجاح!')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> تثبيت التطبيق الآن
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Application Frame */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main Sidebar */}
          <Sidebar />

          {/* Main Display Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900/50">
            {isLocked ? (
              <LockedNotice />
            ) : (
              <>
                {activeTab === 'inventory' && <InventoryView />}
                {activeTab === 'ai-studio' && <AIStudioView />}
                {activeTab === 'repricer' && <RepricerRadarView />}
                {activeTab === 'waybills' && <WaybillSplitterView />}
                {activeTab === 'trends' && <TrendsRadarView />}
                {activeTab === 'reports' && <ReportsView />}
                {activeTab === 'subscription' && <SubscriptionPlansView />}
                {activeTab === 'admin' && isAdmin && <AdminSuperDashboard />}
              </>
            )}
          </main>
        </div>

        {/* Subscription Payment Modal */}
        {showSubscriptionModal && <SubscriptionPaymentModal />}
      </div>
    </AppContext.Provider>
  );
}

// ==========================================
// COMPONENT 1: TOP HEADER
// ==========================================
function TopHeader() {
  const { 
    currentUserEmail, setCurrentUserEmail, 
    selectedMerchant, setSelectedMerchant, 
    merchants, trialDaysLeft, isSubscribed,
    setShowSubscriptionModal, isAdmin, setActiveTab
  } = useContext(AppContext);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xl">
      
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-white font-bold flex items-center justify-center">
          <Radio className="w-6 h-6 animate-pulse text-cyan-200" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              رادار التاجر الذكي
            </h1>
            <span className="text-[10px] font-extrabold bg-indigo-950 text-indigo-400 border border-indigo-800/80 px-2 py-0.5 rounded-full">
              PRO E-COMMERCE
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">منصة تسويق وإدارة التجار المتعددين ومراقبة المنافسين في مصر والخليج</p>
        </div>
      </div>

      {/* Merchant Selector & Status Indicators */}
      <div className="flex items-center flex-wrap gap-3">
        
        {/* Active Merchant Switcher */}
        <div className="relative flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5 gap-2">
          <Store className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400 hidden lg:inline">التاجر الحالي:</span>
          <select 
            value={selectedMerchant.id}
            onChange={(e) => {
              const m = merchants.find(item => item.id === e.target.value);
              if (m) setSelectedMerchant(m);
            }}
            className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {merchants.map(m => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                {m.name} ({m.category})
              </option>
            ))}
          </select>
        </div>

        {/* Account Mode Switcher (For Demo & Admin Testing) */}
        <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          <button 
            onClick={() => setCurrentUserEmail('jassmeinnour@gmail.com')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${isAdmin ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            مالك التطبيق (Admin)
          </button>
          <button 
            onClick={() => setCurrentUserEmail('merchant@example.com')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${!isAdmin ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            حساب تاجر مشترك
          </button>
        </div>

        {/* Trial Status / Subscription Badge */}
        {!isAdmin && (
          <div>
            {isSubscribed ? (
              <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-3 py-1.5 rounded-lg text-xs font-bold">
                <ShieldCheck className="w-4 h-4" /> اشتراك نشط (احترافي)
              </div>
            ) : (
              <button 
                onClick={() => setShowSubscriptionModal(true)}
                className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition"
              >
                <AlertTriangle className="w-4 h-4 animate-bounce" /> باقي {trialDaysLeft} أيام تجربة (ترقية)
              </button>
            )}
          </div>
        )}

        {/* Admin Quick Entry Button */}
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('admin')}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md shadow-purple-600/20"
          >
            <CrownIcon className="w-4 h-4" /> لوحة الإدارة العليا
          </button>
        )}
      </div>
    </header>
  );
}

// ==========================================
// COMPONENT 2: NAVIGATION SIDEBAR
// ==========================================
function Sidebar() {
  const { activeTab, setActiveTab, isAdmin } = useContext(AppContext);

  const menuItems = [
    { id: 'inventory', label: 'المخزون وحسابات المنصات', icon: Package, badge: 'مباشر' },
    { id: 'ai-studio', label: 'استوديو الذكاء الاصطناعي', icon: Sparkles, badge: 'AI Pro' },
    { id: 'repricer', label: 'رادار الباي بوكس والأسعار', icon: Radio, badge: 'تلقائي' },
    { id: 'waybills', label: 'فصل وطباعة البوالص', icon: Printer, badge: 'أمازون/نون' },
    { id: 'trends', label: 'منتجات التريند المربحة', icon: Flame, badge: 'فرص' },
    { id: 'reports', label: 'التقارير الحسابية والعمولات', icon: BarChart3, badge: 'حسابات' },
    { id: 'subscription', label: 'باقات الاشتراك والترقية', icon: CreditCard, badge: 'فودافون كاش' },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'لوحة التحكم للمالك (Super Admin)', icon: ShieldCheck, badge: 'خاص' });
  }

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-l border-slate-800 flex-shrink-0">
      <div className="p-3 md:p-4 space-y-1">
        <div className="text-[11px] font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">
          قائمة الأدوات والتسويق
        </div>
        
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium transition ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                  isActive ? 'bg-indigo-900/60 text-indigo-100' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Support & Quick Contact Card */}
      <div className="m-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2 hidden md:block">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Zap className="w-4 h-4 text-amber-400" /> الدعم الفني المباشر
        </div>
        <p>لتفعيل الاشتراكات اليدوية وتنسيق الاستفسارات الفورية للتجار:</p>
        <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-indigo-300 text-[11px] text-center">
          01097751352
        </div>
      </div>
    </aside>
  );
}

// ==========================================
// VIEW 1: INVENTORY & PLATFORMS SYNC
// ==========================================
function InventoryView() {
  const { selectedMerchant, inventory, setInventory } = useContext(AppContext);
  const [filter, setFilter] = useState('all');

  const merchantItems = inventory.filter(i => i.merchantId === selectedMerchant.id);

  const handleStockAdjust = (skuId, amount) => {
    setInventory(inventory.map(item => {
      if (item.id === skuId) {
        const newStock = Math.max(0, item.realStock + amount);
        const avail = Math.max(0, newStock - item.reservedStock);
        let status = 'In Stock';
        if (avail === 0) status = 'Out of Stock';
        else if (avail < 10) status = 'Low Stock';
        return { ...item, realStock: newStock, availableStock: avail, status };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي المنتجات المسجلة" value={merchantItems.length} unit="SKU" icon={Package} color="blue" />
        <StatCard title="المخزون الفعلي بالمخازن" value={merchantItems.reduce((acc, i) => acc + i.realStock, 0)} unit=" قطعة" icon={Store} color="emerald" />
        <StatCard title="المخزون المتاح للبيع فوراً" value={merchantItems.reduce((acc, i) => acc + i.availableStock, 0)} unit=" قطعة" icon={CheckCircle2} color="cyan" />
        <StatCard title="منتجات وشيكة النفاذ" value={merchantItems.filter(i => i.availableStock < 10).length} unit="منتج" icon={AlertTriangle} color="amber" />
      </div>

      {/* Connected Platforms Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> المنصات المربوطة بحساب ({selectedMerchant.name})
          </h3>
          <button onClick={() => alert('إضافة ربط حساب منصة جديد عبر API أو OAuth')} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> ربط منصة جديدة
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map(p => {
            const isLinked = selectedMerchant.linkedPlatforms.includes(p.id);
            return (
              <div 
                key={p.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
                  isLinked 
                    ? 'bg-slate-800/90 border-slate-700 text-slate-100' 
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                }`}
              >
                <span>{p.logo}</span>
                <span>{p.name}</span>
                {isLinked ? (
                  <span className="bg-emerald-950 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-800">مربوط</span>
                ) : (
                  <span className="bg-slate-800 text-slate-500 text-[10px] px-1.5 py-0.5 rounded">غير مربوط</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Real-Time Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-100">سجل المخزون الموحد وتتبع حركته</h3>
            <p className="text-xs text-slate-400">سحب لحظي للمخزون الفعلي (Real Stock) وتفادي المبيعات الوهمية عبر جميع المنصات</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input 
                type="text" 
                placeholder="بحث برقم SKU أو اسم المنتج..." 
                className="bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>
            <button onClick={() => alert('تمت مزامنة الكميات والمخزون مع أمازون ونون وجوميا بنجاح!')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> مزامنة الآن
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="p-3">رمز المنتج (SKU / Name)</th>
                <th className="p-3 text-center">المنصات النشطة</th>
                <th className="p-3 text-center">المخزون الفعلي</th>
                <th className="p-3 text-center">محجوز بطلبات</th>
                <th className="p-3 text-center">المتاح للبيع</th>
                <th className="p-3 text-center">السعر (ج.م)</th>
                <th className="p-3 text-center">حالة المخزون</th>
                <th className="p-3 text-center">تعديل سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {merchantItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-indigo-400 font-mono">{item.id}</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {item.platforms.map(p => (
                        <span key={p} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                          {p.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-200">{item.realStock}</td>
                  <td className="p-3 text-center text-amber-400 font-medium">{item.reservedStock}</td>
                  <td className="p-3 text-center font-extrabold text-emerald-400 text-sm">{item.availableStock}</td>
                  <td className="p-3 text-center font-mono font-bold">{item.price} ج.م</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'In Stock' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      item.status === 'Low Stock' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {item.status === 'In Stock' ? 'متوفر' : item.status === 'Low Stock' ? 'وشيك النفاذ' : 'منتهي'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleStockAdjust(item.id, 5)}
                        className="bg-slate-800 hover:bg-slate-700 text-emerald-400 w-6 h-6 rounded flex items-center justify-center font-bold text-sm border border-slate-700"
                        title="إضافة 5 قطع"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => handleStockAdjust(item.id, -5)}
                        className="bg-slate-800 hover:bg-slate-700 text-rose-400 w-6 h-6 rounded flex items-center justify-center font-bold text-sm border border-slate-700"
                        title="خصم 5 قطع"
                      >
                        -
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 2: AI STUDIO & PRODUCT LISTING CREATOR
// ==========================================
function AIStudioView() {
  const [productTitle, setProductTitle] = useState('');
  const [category, setCategory] = useState('إلكترونيات');
  const [targetPlatform, setTargetPlatform] = useState('amazon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState(null);
  const [selectedBg, setSelectedBg] = useState('white');

  const handleGenerateAI = () => {
    if (!productTitle) {
      alert('من فضلك ادخل اسم أو وصف فكرة المنتج أولاً');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedOutput({
        optimizedTitle: `${productTitle} - عالي الجودة متوافق مع جميع المنصات مع ضمان عام كامل`,
        bulletPoints: [
          'تصميم احترافي مطابق لمعايير السوق المصري ومواصفات التصدير.',
          'خامات متينة مقاومة للصدمات وتتحمل الاستخدام اليومي الشاق.',
          'شامل جميع الاكسسوارات ودليل الاستخدام باللغتين العربية والإنجليزي.',
          'ضمان استبدال فوري وتوافق تام مع المنصات.'
        ],
        searchKeywords: 'تسوق, تخفيضات مصر, أفضل سعر, عروض أمازون مصر, نون إكسبريس, جوميا',
        suggestedPrice: '480 ج.م',
        seoScore: '96/100'
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-5 rounded-2xl border border-indigo-800/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> استوديو الذكاء الاصطناعي لإنشاء وتجهيز المنتجات
          </h2>
          <p className="text-xs text-indigo-200 mt-1">تفريغ خلفيات الصور تلقائياً + ضبط المقاسات الدقيقة لأمازون ونون وهوزمارت + كتابة محتوى تسويقي احترافي SEO</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-indigo-950 text-indigo-300 border border-indigo-700 text-xs px-3 py-1 rounded-full font-bold">
            ⚡ أوتوماتيك 100%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Processor Studio */}
        <div className="lg:col-span-5 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" /> معالج وصانع صور المنتجات (AI Photo Studio)
          </h3>

          {/* Canvas Simulation */}
          <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden group">
            
            {/* Background Style Switcher Preview */}
            <div className={`w-40 h-40 rounded-xl flex items-center justify-center transition-all shadow-2xl relative ${
              selectedBg === 'white' ? 'bg-white text-slate-900' :
              selectedBg === 'lifestyle' ? 'bg-gradient-to-br from-amber-100 to-orange-200 text-amber-900' :
              selectedBg === 'studio' ? 'bg-gradient-to-b from-slate-700 to-slate-900 text-white' :
              'bg-gradient-to-tr from-indigo-900 via-purple-900 to-slate-900 text-white'
            }`}>
              <div className="text-center p-2">
                <Package className="w-12 h-12 mx-auto mb-1 opacity-90" />
                <span className="text-[10px] font-bold block">معاينة صور المنتج</span>
                <span className="text-[8px] opacity-75">1000x1000px HQ</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <label className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-bold cursor-pointer transition inline-flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" /> رفع صورة المنتج الأصلي
                <input type="file" className="hidden" onChange={() => alert('تم رفع الصورة وجاري معالجتها بالذكاء الاصطناعي...')} />
              </label>
              <p className="text-[11px] text-slate-500 mt-2">يقوم التطبيق بحذف الخلفية تلقائياً وضبط الدقة لتناسب أمازون ونون</p>
            </div>
          </div>

          {/* Marketplace Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">اختر نوع الخلفية ومقاسات المنصة المستهدفة:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => setSelectedBg('white')} 
                className={`p-2 rounded-lg border text-right transition ${selectedBg === 'white' ? 'bg-indigo-950 border-indigo-500 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                ⚪ خلفية بيضاء نقية (أمازون/نون)
              </button>
              <button 
                onClick={() => setSelectedBg('lifestyle')} 
                className={`p-2 rounded-lg border text-right transition ${selectedBg === 'lifestyle' ? 'bg-indigo-950 border-indigo-500 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                🏠 بيئة منزلية (هوزمارت/ديكور)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Copywriter & Direct Upload */}
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> كاتب الوصف والعناوين الذكي (AI Copywriter)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">اسم المنتج البسيط أو الفكرة:</label>
              <input 
                type="text" 
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="مثال: ساعة ذكية مقاومة للماء ورصد النبض"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">المنصة المراد النشر عليها مباشرة:</label>
              <select 
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="amazon">أمازون مصر (Amazon Egypt)</option>
                <option value="noon">نون مصر (Noon Egypt)</option>
                <option value="jumia">جوميا (Jumia)</option>
                <option value="homzmart">هوزمارت (Homzmart)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'جاري التوليد والتحسين بالذكاء الاصطناعي...' : 'توليد كارت المنتج الاحترافي الآن'}
          </button>

          {/* AI Result Card */}
          {generatedOutput && (
            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> جودة المحتوى: {generatedOutput.seoScore}
                </span>
                <span className="text-[11px] text-slate-400">سعر البيع المقترح: <strong className="text-amber-400">{generatedOutput.suggestedPrice}</strong></span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">العنوان المحسّن للمنصة:</span>
                <p className="text-xs font-bold text-slate-100 bg-slate-900 p-2 rounded border border-slate-800 mt-1">{generatedOutput.optimizedTitle}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">النقاط المفتاحية (Bullet Points):</span>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside bg-slate-900 p-2.5 rounded border border-slate-800">
                  {generatedOutput.bulletPoints.map((bp, idx) => (
                    <li key={idx}>{bp}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => alert(`تم رفع المنتج (${productTitle}) مباشرة إلى حسابك على ${targetPlatform.toUpperCase()} بنجاح!`)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1"
                >
                  <ArrowUpRight className="w-4 h-4" /> رفع مباشر للمتجر
                </button>
                <button 
                  onClick={() => alert('تم نسخ التفاصيل للحافظة!')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> نسخ الكود
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 3: REPRICER & BUYBOX RADAR
// ==========================================
function RepricerRadarView() {
  const { selectedMerchant, inventory } = useContext(AppContext);
  const merchantItems = inventory.filter(i => i.merchantId === selectedMerchant.id);

  return (
    <div className="space-y-6">
      
      {/* Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-bold">نسبة الفوز بالـ Buybox</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">75%</div>
          <div className="text-[10px] text-slate-500 mt-1">مستحوذ على الصندوق في 3 منتجات من أصل 4</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-bold">إعادة التسعير التلقائية</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">نشطة (Auto)</div>
          <div className="text-[10px] text-slate-500 mt-1">تعديل السعر كل 15 دقيقة لمنافسة السوق</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-bold">أقصى هامش ربح محمي</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">22%</div>
          <div className="text-[10px] text-slate-500 mt-1">عدم خفض السعر تحت تكلفة الشراء</div>
        </div>
      </div>

      {/* Main Repricer Radar Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400 animate-pulse" /> رادار الباي بوكس (Buybox Radar & Repricer)
            </h3>
            <p className="text-xs text-slate-400">مراقبة لحظية لأسعار المنافسين على أمازون ونون وضمان الفوز بأقل سعر مع حماية أرباحك</p>
          </div>
          <button onClick={() => alert('تم تشغيل محاكي الباي بوكس بنجاح وتحديث الأسعار!')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
            ⚡ تشغيل التخفيض الذكي الآلي
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3">المنتج (SKU)</th>
                <th className="p-3 text-center">سعرك الحالي</th>
                <th className="p-3 text-center">التكلفة عليك</th>
                <th className="p-3 text-center">أقل سعر منافس بالسوق</th>
                <th className="p-3 text-center">حالة الباي بوكس (Buybox)</th>
                <th className="p-3 text-center">السعر المقترح للفوز</th>
                <th className="p-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {merchantItems.map(item => {
                const isWinning = item.price <= item.lowestCompetitor;
                const winPrice = item.lowestCompetitor - 1;
                const profitMargin = Math.round(((winPrice - item.cost) / winPrice) * 100);

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-slate-200">{item.name}</td>
                    <td className="p-3 text-center font-bold text-slate-100">{item.price} ج.م</td>
                    <td className="p-3 text-center text-slate-400 font-mono">{item.cost} ج.م</td>
                    <td className="p-3 text-center font-bold text-amber-400 font-mono">{item.lowestCompetitor} ج.م</td>
                    <td className="p-3 text-center">
                      {isWinning ? (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          🏆 مستحوذ على Buybox
                        </span>
                      ) : (
                        <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          ⚠️ منافس أقل منك
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold text-cyan-400 font-mono">
                      {winPrice} ج.م <span className="text-[10px] text-slate-500 block">(ربح {profitMargin}%)</span>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => alert(`تم تعديل سعر المنتج إلى ${winPrice} ج.م وتحديثه على المنصات!`)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition"
                      >
                        تطبيق السعر
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 4: AUTOMATED SHIPPING & WAYBILL SPLITTER
// ==========================================
function WaybillSplitterView() {
  const { waybills, setWaybills } = useContext(AppContext);

  const handleSplitOrder = (orderId) => {
    setWaybills(waybills.map(w => {
      if (w.orderId === orderId) {
        return { ...w, needsSplit: false, status: 'Split & Ready' };
      }
      return w;
    }));
    alert(`تم فصل بوالص الشحن للطلب (${orderId}) بنجاح! يمكن طباعة البوالص منفصلة الآن.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" /> مفصل ومجمّع بوالص الشحن (أمازون ونون)
          </h2>
          <p className="text-xs text-slate-400 mt-1">فصل وتجزئة الطلبات المتعددة لعميل واحد إلى بوالص منفصلة لضمان الشحن وتجنب مشاكل التغليف</p>
        </div>
        <button 
          onClick={() => alert('جاري طباعة جميع البوالص الجاهزة حرارياً دفعة واحدة...')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Printer className="w-4 h-4" /> طباعة الكل حرارياً (Thermal Batch)
        </button>
      </div>

      {/* Waybills List */}
      <div className="grid grid-cols-1 gap-4">
        {waybills.map(bill => (
          <div key={bill.orderId} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-indigo-400 font-mono">{bill.orderId}</span>
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold">{bill.platform}</span>
                {bill.needsSplit && (
                  <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> يحتاج فصل بوالص ({bill.itemsCount} منتجات)
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300">العميل: <strong>{bill.customer}</strong> ({bill.city})</div>
              <div className="text-[11px] text-slate-500">الاصناف: {bill.items.join(' + ')}</div>
            </div>

            <div className="flex items-center gap-2">
              {bill.needsSplit ? (
                <button 
                  onClick={() => handleSplitOrder(bill.orderId)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <ScissorsIcon className="w-3.5 h-3.5" /> فصل البوالص الآن
                </button>
              ) : (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> بوالص جاهزة
                </span>
              )}

              <button 
                onClick={() => alert(`جاري فتح معاينة البوليصة للطلب ${bill.orderId}`)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition"
              >
                معاينة وطباعة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// VIEW 5: WINNING TRENDS RADAR
// ==========================================
function TrendsRadarView() {
  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 p-5 rounded-2xl border border-amber-800/40 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" /> رادار المنتجات التريند والأكثر مبيعاً
          </h2>
          <p className="text-xs text-amber-200/80 mt-1">تحليل اتجاهات السوق في مصر وتيك توك وأمازون الخليج لاكتشاف منتجات مربحة قبل المنافسين</p>
        </div>
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold">
          🔥 تحديث يومي
        </span>
      </div>

      {/* Grid of Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_TRENDS.map(t => (
          <div key={t.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-indigo-800 transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-800">{t.niche}</span>
                <h3 className="font-bold text-base text-slate-100 mt-1">{t.title}</h3>
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 block">
                  ربح متوقع {t.potentialMargin}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">تكلفة المورد</span>
                <strong className="text-slate-200">{t.supplierCost}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">متوسط البيع</span>
                <strong className="text-amber-400">{t.avgSellingPrice}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">معدل التريند</span>
                <strong className="text-cyan-400">{t.trendScore}/100</strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>المنطقة: <strong>{t.location}</strong></span>
              <button 
                onClick={() => alert(`تمت إضافة ${t.title} إلى قائمة خطتك للتوريد والبيع!`)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة لخطتي
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// VIEW 6: FINANCIAL REPORTS & COMMISSIONS
// ==========================================
function ReportsView() {
  const { selectedMerchant } = useContext(AppContext);

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Download */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">التقارير المالية وحسابات العمولات والصافي</h2>
          <p className="text-xs text-slate-400">تقرير تفصيلي لحسابات التاجر ({selectedMerchant.name}) وتخصيم عمولات المنصات والمرتجعات</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option>تقرير الشهر الحالي (أكتوبر 2026)</option>
            <option>تقرير الربع الأخير (Q4)</option>
            <option>التقرير السنوي الشامل</option>
          </select>
          <button onClick={() => alert('تم تصدير التقرير المالي بصيغة Excel / PDF بنجاح!')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> تصدير التقرير
          </button>
        </div>
      </div>

      {/* Financial Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي المبيعات (Gross)" value="680,000" unit="ج.م" icon={DollarSign} color="blue" />
        <StatCard title="عمولات المنصات (Fees)" value="102,000" unit="ج.م" icon={BarChart3} color="amber" />
        <StatCard title="مصاريف الشحن والمرتجعات" value="24,500" unit="ج.م" icon={Truck} color="rose" />
        <StatCard title="صافي الأرباح المحولة" value="553,500" unit="ج.م" icon={CheckCircle2} color="emerald" />
      </div>

      {/* Commission Breakdown Table */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-slate-200">توزيع العمولات حسب المنصة</h3>
        <div className="space-y-3">
          <CommissionRow platform="أمازون مصر (Amazon.eg)" revenue="340,000 ج.م" fee="15%" feeAmount="51,000 ج.م" net="289,000 ج.م" />
          <CommissionRow platform="نون مصر (Noon Egypt)" revenue="220,000 ج.م" fee="14%" feeAmount="30,800 ج.م" net="189,200 ج.م" />
          <CommissionRow platform="هوزمارت (Homzmart)" revenue="120,000 ج.م" fee="16%" feeAmount="19,200 ج.م" net="100,800 ج.م" />
        </div>
      </div>
    </div>
  );
}

// Helper Row
function CommissionRow({ platform, revenue, fee, feeAmount, net }) {
  return (
    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
      <div className="font-bold text-slate-200">{platform}</div>
      <div className="text-slate-400">المبيعات: <strong className="text-slate-200">{revenue}</strong></div>
      <div className="text-amber-400">العمولة ({fee}): <strong>{feeAmount}</strong></div>
      <div className="text-emerald-400 font-bold">الصافي: {net}</div>
    </div>
  );
}

// ==========================================
// VIEW 7: SUBSCRIPTION PLANS & UPGRADE
// ==========================================
function SubscriptionPlansView() {
  const { setShowSubscriptionModal, isSubscribed, trialDaysLeft } = useContext(AppContext);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white">خطط واشتراكات تطبيق رادار التاجر الذكي</h2>
        <p className="text-xs text-slate-400">اختر الباقة المناسبة لحجم تجارتك. تفعيل فوري عبر تحويل فودافون كاش</p>
      </div>

      {/* Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Starter Plan */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">باقة التاجر الفردي</span>
            <h3 className="text-xl font-bold text-slate-100">البداية (Starter)</h3>
            <div className="text-2xl font-black text-indigo-400">350 <span className="text-xs text-slate-400 font-normal">ج.م / شهرياً</span></div>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> تاجر واحد (1 Merchant)</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> سحب مخزون منصتين</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> تقارير حسابية أسبوعية</li>
            </ul>
          </div>
          <button 
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
          >
            اشترك الآن
          </button>
        </div>

        {/* Pro Plan (Best Value) */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border-2 border-indigo-500 space-y-4 relative flex flex-col justify-between shadow-xl shadow-indigo-600/10">
          <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow">
            الأكثر طلباً للتسويق
          </span>
          <div className="space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase">باقة مدير التسويق</span>
            <h3 className="text-xl font-bold text-white">الاحترافية (Pro Manager)</h3>
            <div className="text-3xl font-black text-amber-400">750 <span className="text-xs text-slate-400 font-normal">ج.م / شهرياً</span></div>
            <ul className="text-xs text-slate-200 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> حتى 10 تجار مختلفين</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> استوديو الذكاء الاصطناعي كاملاً</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> رادار الباي بوكس والـ Repricer</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> فصل وبوالص الشحن لأمازون ونون</li>
            </ul>
          </div>
          <button 
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
          >
            اشترك في الباقة الاحترافية
          </button>
        </div>

        {/* Agency Plan */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold text-purple-400 uppercase">باقة الوكالات والشركات</span>
            <h3 className="text-xl font-bold text-slate-100">الشركات (Agency)</h3>
            <div className="text-2xl font-black text-purple-400">1,400 <span className="text-xs text-slate-400 font-normal">ج.م / شهرياً</span></div>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> عدد غير محدود من التجار</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> ربط API مخصص لكل المنصات</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> مدير حساب فني خاص</li>
            </ul>
          </div>
          <button 
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
          >
            اشترك للشركات
          </button>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// VIEW 8: SUPER ADMIN DASHBOARD (OWNER)
// ==========================================
function AdminSuperDashboard() {
  const { merchants, currentUserEmail } = useContext(AppContext);

  return (
    <div className="space-y-6">
      
      {/* Admin Header Notice */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 p-5 rounded-2xl border border-purple-800/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">OWNER CONTROL</span>
            <h2 className="text-lg font-bold text-white">لوحة الإدارة والمتابعة العليا الخاصة بـ ({currentUserEmail})</h2>
          </div>
          <p className="text-xs text-purple-200/80 mt-1">متابعة أداء التطبيق على Google Play والويب، الاشتراكات الفعالة، وإجمالي الإيرادات</p>
        </div>
        <div className="text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          حالة التطبيق على جوجل بلاي: <strong className="text-emerald-400">منشور ومتزامن 🟢</strong>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي التجار المستثمرين" value={merchants.length} unit="تاجر" icon={Users} color="blue" />
        <StatCard title="إجمالي التحميلات (Google Play)" value="12,450" unit="تحميل" icon={Download} color="purple" />
        <StatCard title="الاشتراكات النشطة" value="48" unit="مشترك" icon={CheckCircle2} color="emerald" />
        <StatCard title="إيرادات الاشتراكات الشهرية" value="36,000" unit="ج.م" icon={DollarSign} color="amber" />
      </div>

      {/* Merchants & Subscriptions Overview */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-100">سجل التجار المشتركين وتأكيد تحويلات فودافون كاش</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">اسم التاجر / الشركة</th>
                <th className="p-3 text-center">مدير التسويق</th>
                <th className="p-3 text-center">المنصات المربوطة</th>
                <th className="p-3 text-center">حالة الاشتراك</th>
                <th className="p-3 text-center">إجراء الإدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {merchants.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-200">{m.name}</td>
                  <td className="p-3 text-center text-slate-300">{m.manager}</td>
                  <td className="p-3 text-center">
                    <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      {m.linkedPlatforms.length} منصات
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      نشط (فودافون كاش)
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => alert(`تم إرسال إشعار تذكير أو تجديد للتاجر ${m.name}`)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px]">
                      إدارة الحساب
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODAL: VODAFONE CASH SUBSCRIPTION MODAL
// ==========================================
function SubscriptionPaymentModal() {
  const { setShowSubscriptionModal, VODAFONE_CASH_NUMBER, setIsSubscribed } = useContext(AppContext);
  const [refNum, setRefNum] = useState('');

  const handleConfirmPayment = () => {
    if (!refNum) {
      alert('من فضلك ادخل الرقم القومي أو رقم عملية تحويل فودافون كاش');
      return;
    }
    setIsSubscribed(true);
    setShowSubscriptionModal(false);
    alert('تم استلام طلب الاشتراك بنجاح! تم فتح وتفعيل كافة مزايا التطبيق الاحترافية لحسابك.');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-scale-up">
        
        <button onClick={() => setShowSubscriptionModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="bg-rose-950 text-rose-400 border border-rose-800 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold text-lg">
            📱
          </div>
          <h3 className="font-extrabold text-lg text-white">تفعيل الاشتراك عبر فودافون كاش</h3>
          <p className="text-xs text-slate-400">حول قيمة الاشتراك للحساب واضغط تأكيد لفتح المزايا فوراً</p>
        </div>

        {/* Account Details Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
          <span className="text-[11px] text-slate-400 font-bold block">رقم فودافون كاش المعتمد للدفع:</span>
          <div className="text-xl font-black text-rose-400 font-mono tracking-wider">{VODAFONE_CASH_NUMBER}</div>
          <p className="text-[10px] text-slate-500">اسم الحساب: رادار التاجر الذكي - RADAR EGYPT</p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">رقم عملية التحويل أو رقم المرسل:</label>
            <input 
              type="text" 
              value={refNum}
              onChange={(e) => setRefNum(e.target.value)}
              placeholder="مثال: 01012345678 أو رقم الإشعار"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <button 
            onClick={handleConfirmPayment}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-rose-600/20"
          >
            تأكيد التحويل وتفعيل الاشتراك فوراً
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// LOCKED NOTICE (WHEN TRIAL EXPIRES)
// ==========================================
function LockedNotice() {
  const { setShowSubscriptionModal } = useContext(AppContext);
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
      <div className="bg-amber-950/80 text-amber-400 border border-amber-800 p-4 rounded-full">
        <Lock className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-white">انتهت فترة التجربة المجانية (3 أيام)</h2>
      <p className="text-xs text-slate-400 max-w-md">
        لقد انتهت فترة السماح المجانية لتطبيقتكم. للاستمرار في استخدام استوديو الذكاء الاصطناعي، ورادار الباي بوكس وفصل البوالص، يرجى الترقية الآن.
      </p>
      <button 
        onClick={() => setShowSubscriptionModal(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
      >
        تجديد الاشتراك الآن عبر فودافون كاش
      </button>
    </div>
  );
}

// ==========================================
// REUSABLE HELPER COMPONENTS & ICONS
// ==========================================
function StatCard({ title, value, unit, icon: Icon, color }) {
  const colorStyles = {
    blue: 'text-blue-400 bg-blue-950/50 border-blue-900/50',
    emerald: 'text-emerald-400 bg-emerald-950/50 border-emerald-900/50',
    amber: 'text-amber-400 bg-amber-950/50 border-amber-900/50',
    cyan: 'text-cyan-400 bg-cyan-950/50 border-cyan-900/50',
    rose: 'text-rose-400 bg-rose-950/50 border-rose-900/50',
    purple: 'text-purple-400 bg-purple-950/50 border-purple-900/50'
  };

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-bold">{title}</span>
        <div className={`p-2 rounded-lg border ${colorStyles[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-100 tracking-tight">
        {value} <span className="text-xs text-slate-400 font-normal">{unit}</span>
      </div>
    </div>
  );
}

function Upload(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function ScissorsIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 0A3 3 0 104.879 4.879a3 3 0 004.242 4.242zm0 5.758a3 3 0 10-4.242 4.242 3 3 0 004.242-4.242z" />
    </svg>
  );
}

function CrownIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
