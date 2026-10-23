import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  CreditCard, 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Download, 
  Trash2, 
  UserPlus, 
  RefreshCw, 
  Lock, 
  Unlock, 
  TrendingUp, 
  BarChart3,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Edit3,
  Globe,
  Building2,
  Zap,
  Check,
  Package
} from 'lucide-react';

interface MerchantRecord {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'merchant_paid' | 'merchant_trial';
  plan: 'free_trial' | 'pro_monthly' | 'gold_yearly';
  connectedPlatforms: string[];
  monitoredProductsCount: number;
  paymentConfirmed: boolean;
  status: 'active' | 'blocked' | 'expired';
  trialEndDate: string;
  monthlyRevenue: number;
  durationMonths: number;
  joinedDate: string;
}

const DEFAULT_MERCHANTS: MerchantRecord[] = [
  {
    id: 'm_test_001',
    name: 'متجر النور للأثاث',
    email: 'merchant.test@radaregypt.store',
    role: 'merchant_trial',
    plan: 'free_trial',
    connectedPlatforms: ['أمازون مصر', 'نون مصر', 'جوميا مصر'],
    monitoredProductsCount: 12,
    paymentConfirmed: false,
    status: 'active',
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyRevenue: 0,
    durationMonths: 1,
    joinedDate: '2026-10-22'
  },
  {
    id: 'm_001',
    name: 'جاسمين نور (مالكة التطبيق)',
    email: 'jassmeinnour@gmail.com',
    role: 'owner',
    plan: 'gold_yearly',
    connectedPlatforms: ['أمازون مصر', 'نون مصر', 'جوميا مصر'],
    monitoredProductsCount: 350,
    paymentConfirmed: true,
    status: 'active',
    trialEndDate: '2030-12-31',
    monthlyRevenue: 0,
    durationMonths: 12,
    joinedDate: '2026-01-01'
  },
  {
    id: 'm_002',
    name: 'متجر القاهرة للإلكترونيات',
    email: 'cairo_store@gmail.com',
    role: 'merchant_paid',
    plan: 'pro_monthly',
    connectedPlatforms: ['أمازون مصر', 'نون مصر'],
    monitoredProductsCount: 148,
    paymentConfirmed: true,
    status: 'active',
    trialEndDate: '2026-11-22',
    monthlyRevenue: 999,
    durationMonths: 1,
    joinedDate: '2026-02-10'
  },
  {
    id: 'm_003',
    name: 'العربي للتوريدات المنزلية',
    email: 'el_araby_merchant@gmail.com',
    role: 'merchant_paid',
    plan: 'gold_yearly',
    connectedPlatforms: ['أمازون مصر', 'نون مصر', 'جوميا مصر'],
    monitoredProductsCount: 220,
    paymentConfirmed: true,
    status: 'active',
    trialEndDate: '2027-02-15',
    monthlyRevenue: 1999,
    durationMonths: 12,
    joinedDate: '2026-02-15'
  },
  {
    id: 'm_004',
    name: 'تاجر تجريبي (الإسكندرية)',
    email: 'alex_demo@radar.store',
    role: 'merchant_trial',
    plan: 'free_trial',
    connectedPlatforms: ['نون مصر'],
    monitoredProductsCount: 35,
    paymentConfirmed: false,
    status: 'active',
    trialEndDate: '2026-10-29',
    monthlyRevenue: 0,
    durationMonths: 1,
    joinedDate: '2026-10-22'
  }
];

export default function OwnerDashboard() {
  // Always default open 'merchants'
  const [activeTab, setActiveTab] = useState<'merchants' | 'subscriptions' | 'reports'>('merchants');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMerchant, setEditingMerchant] = useState<MerchantRecord | null>(null);

  // Inline Form State
  const [storeName, setStoreName] = useState('');
  const [merchantEmail, setMerchantEmail] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['أمازون مصر', 'نون مصر']);
  const [selectedPlan, setSelectedPlan] = useState<'free_trial' | 'pro_monthly' | 'gold_yearly'>('free_trial');
  const [trialDurationDays, setTrialDurationDays] = useState<number>(7);

  // Seed merchant directory database with localStorage support
  const [merchants, setMerchants] = useState<MerchantRecord[]>(() => {
    try {
      const saved = localStorage.getItem('radar_merchants_directory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasTest = parsed.some((m: any) => m.email === 'merchant.test@radaregypt.store');
          if (!hasTest) {
            return [DEFAULT_MERCHANTS[0], ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage load warning:', e);
    }
    return DEFAULT_MERCHANTS;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('radar_merchants_directory', JSON.stringify(merchants));
    } catch (e) {
      console.warn('Failed to persist merchants directory:', e);
    }
  }, [merchants]);

  const togglePlatformSelection = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleSaveMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantEmail || !storeName) return;

    if (editingMerchant) {
      setMerchants(prev => prev.map(m => {
        if (m.id === editingMerchant.id) {
          return {
            ...m,
            name: storeName,
            email: merchantEmail,
            plan: selectedPlan,
            connectedPlatforms: selectedPlatforms,
            role: selectedPlan === 'free_trial' ? 'merchant_trial' : 'merchant_paid',
            monthlyRevenue: selectedPlan === 'pro_monthly' ? 999 : selectedPlan === 'gold_yearly' ? 1999 : 0
          };
        }
        return m;
      }));
      setEditingMerchant(null);
    } else {
      const newRec: MerchantRecord = {
        id: 'm_' + Date.now().toString().slice(-4),
        name: storeName,
        email: merchantEmail,
        role: selectedPlan === 'free_trial' ? 'merchant_trial' : 'merchant_paid',
        plan: selectedPlan,
        connectedPlatforms: selectedPlatforms,
        monitoredProductsCount: 25,
        paymentConfirmed: selectedPlan !== 'free_trial',
        status: 'active',
        trialEndDate: new Date(Date.now() + trialDurationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyRevenue: selectedPlan === 'pro_monthly' ? 999 : selectedPlan === 'gold_yearly' ? 1999 : 0,
        durationMonths: 1,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setMerchants([newRec, ...merchants]);
    }

    setStoreName('');
    setMerchantEmail('');
  };

  const handleEditClick = (m: MerchantRecord) => {
    setEditingMerchant(m);
    setStoreName(m.name);
    setMerchantEmail(m.email);
    setSelectedPlatforms(m.connectedPlatforms || ['أمازون مصر']);
    setSelectedPlan(m.plan);
  };

  const toggleMerchantStatus = (id: string) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === id && m.role !== 'owner') {
        return {
          ...m,
          status: m.status === 'active' ? 'blocked' : 'active'
        };
      }
      return m;
    }));
  };

  const extendTrial30Days = (id: string) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === id) {
        const curr = new Date(m.trialEndDate);
        const newEnd = new Date(curr.getTime() + 30 * 24 * 60 * 60 * 1000);
        return {
          ...m,
          status: 'active',
          trialEndDate: newEnd.toISOString().split('T')[0]
        };
      }
      return m;
    }));
  };

  const deleteMerchant = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التاجر نهائياً؟')) {
      setMerchants(prev => prev.filter(m => m.id !== id));
    }
  };

  const exportCsvReport = () => {
    const csvHeader = 'ID,Name,Email,Role,Plan,Platforms,ProductsCount,Status,TrialEndDate,MonthlyRevenue\n';
    const csvRows = merchants.map(m => `${m.id},"${m.name}",${m.email},${m.role},${m.plan},"${(m.connectedPlatforms || []).join(';')}",${m.monitoredProductsCount},${m.status},${m.trialEndDate},${m.monthlyRevenue}`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `merchants_directory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.connectedPlatforms || []).some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalMRR = merchants.reduce((sum, m) => sum + (m.status === 'active' ? m.monthlyRevenue : 0), 0);
  const activePaidCount = merchants.filter(m => m.role === 'merchant_paid' && m.status === 'active').length;
  const activeTrialCount = merchants.filter(m => m.role === 'merchant_trial' && m.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-['Cairo',sans-serif] text-slate-100" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-amber-400 flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-500" />
            <span>دليل ملفات التجار والتحكم المباشر (Owner Control)</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            إدارة كاملة لحسابات التجار، إضافة وتعديل ملفات المسوقين والمنصات المرتبطة وتأكيد الاشتراكات.
          </p>
        </div>

        <button
          onClick={exportCsvReport}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 flex items-center gap-2 shadow-md transition shrink-0"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>تصدير دليل التجار CSV</span>
        </button>
      </div>

      {/* 3 Main Owner Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: إدارة المستخدمين */}
        <button
          onClick={() => setActiveTab('merchants')}
          className={`p-6 rounded-2xl text-right transition-all cursor-pointer ${
            activeTab === 'merchants' 
              ? 'bg-amber-500/10 border-2 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30' 
              : 'bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${activeTab === 'merchants' ? 'bg-amber-500 text-slate-950' : 'bg-sky-500/10 text-sky-400'}`}>
              <Users className="w-7 h-7" />
            </div>
            {activeTab === 'merchants' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">مفتوح افتراضياً</span>
            )}
          </div>
          <h2 className="text-xl font-bold mb-1 text-white">إدارة المستخدمين والتجار</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            التحكم الكامل في دليل حسابات التجار والمسوقين والمنصات المرتبطة.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono font-bold text-amber-400 flex justify-between">
            <span>إجمالي التجار المسجلين:</span>
            <span>{merchants.length} تاجر</span>
          </div>
        </button>

        {/* Card 2: متابعة الاشتراكات */}
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`p-6 rounded-2xl text-right transition-all cursor-pointer ${
            activeTab === 'subscriptions' 
              ? 'bg-amber-500/10 border-2 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30' 
              : 'bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${activeTab === 'subscriptions' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <CreditCard className="w-7 h-7" />
            </div>
            {activeTab === 'subscriptions' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">نشط الآن</span>
            )}
          </div>
          <h2 className="text-xl font-bold mb-1 text-white">متابعة الاشتراكات والمدفوعات</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            مراقبة مدفوعات التجديد، إحصائيات التجربة المجانية، وتأكيد تحصيل الرسوم.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono font-bold text-emerald-400 flex justify-between">
            <span>الاشتراكات النشطة:</span>
            <span>{activePaidCount} مدفوع / {activeTrialCount} تجريبي</span>
          </div>
        </button>

        {/* Card 3: التقارير المالية */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`p-6 rounded-2xl text-right transition-all cursor-pointer ${
            activeTab === 'reports' 
              ? 'bg-amber-500/10 border-2 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30' 
              : 'bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${activeTab === 'reports' ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/10 text-amber-400'}`}>
              <FileText className="w-7 h-7" />
            </div>
            {activeTab === 'reports' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">نشط الآن</span>
            )}
          </div>
          <h2 className="text-xl font-bold mb-1 text-white">التقارير المالية والوكالة</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            تحليل الإيرادات الشهيرة المتوقعة MRR ومتوسط عائد التاجر ARPU.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono font-bold text-amber-400 flex justify-between">
            <span>الإيراد الشهري (MRR):</span>
            <span>{totalMRR.toLocaleString()} ج.م</span>
          </div>
        </button>

      </div>

      {/* Main Merchants Section */}
      {activeTab === 'merchants' && (
        <div className="space-y-8">
          
          {/* EMBEDDED INLINE ADD / EDIT MERCHANT FORM PANEL */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingMerchant ? 'تعديل بيانات التاجر المحدد' : 'إضافة وتسجيل تاجر جديد في النظام'}
                  </h3>
                  <p className="text-xs text-slate-400">أدخل اسم المتجر والبريد الإلكتروني والمنصات المرتبطة لحفظ التاجر مباشرة في الدليل.</p>
                </div>
              </div>

              {editingMerchant && (
                <button
                  onClick={() => {
                    setEditingMerchant(null);
                    setStoreName('');
                    setMerchantEmail('');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            <form onSubmit={handleSaveMerchant} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Field 1: Store Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">اسم المتجر / التاجر:</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: متجر النيل للتجارة"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Field 2: Merchant Email */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">البريد الإلكتروني للمسوق:</label>
                <input
                  type="email"
                  required
                  value={merchantEmail}
                  onChange={(e) => setMerchantEmail(e.target.value)}
                  placeholder="merchant@store.eg"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Field 3: Plan & Trial Duration */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">باقة الاشتراك / التجربة:</label>
                <select
                  value={selectedPlan}
                  onChange={(e: any) => setSelectedPlan(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="free_trial">7 أيام تجريبية (مجاناً)</option>
                  <option value="pro_monthly">باقة باقة التاجر المحترف (999 ج.م)</option>
                  <option value="gold_yearly">الباقة الذهبية السنوية (1,999 ج.م)</option>
                </select>
              </div>

              {/* Field 4: Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMerchant ? 'حفظ التغييرات' : 'حفظ وتسجيل التاجر'}</span>
                </button>
              </div>

              {/* Platform Selector Row */}
              <div className="md:col-span-2 lg:col-span-4 pt-2">
                <label className="block text-slate-300 font-bold mb-2">تحديد المنصات المرتبطة:</label>
                <div className="flex flex-wrap gap-2">
                  {['أمازون مصر', 'نون مصر', 'جوميا مصر'].map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatformSelection(platform)}
                        className={`px-4 py-2 rounded-xl border font-bold text-xs transition flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{platform}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </form>
          </div>

          {/* MERCHANTS DIRECTORY TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-400" />
                  <span>جدول ملفات التجار</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">عرض وتفعيل وتعديل وتمديد أو إيقاف حسابات التجار والمسوقين.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم المتجر، البريد، أو المنصة..."
                  className="w-full py-2 pr-10 pl-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3.5 font-bold">اسم المتجر / التاجر</th>
                    <th className="p-3.5 font-bold">البريد الإلكتروني</th>
                    <th className="p-3.5 font-bold">المنصات المرتبطة</th>
                    <th className="p-3.5 font-bold">حالة الاشتراك</th>
                    <th className="p-3.5 font-bold">إحصائيات المنتجات المراقبة</th>
                    <th className="p-3.5 font-bold">تاريخ الانتهاء</th>
                    <th className="p-3.5 font-bold text-center">إجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMerchants.map((merchant) => (
                    <tr key={merchant.id} className="hover:bg-slate-800/40 transition">
                      
                      {/* 1. Store/Merchant Name */}
                      <td className="p-3.5 font-bold text-white flex items-center gap-2">
                        {merchant.role === 'owner' && <span className="text-amber-400">👑</span>}
                        <span>{merchant.name}</span>
                      </td>

                      {/* 2. Email */}
                      <td className="p-3.5 font-mono text-slate-300">{merchant.email}</td>
                      
                      {/* 3. Connected Platforms */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {(merchant.connectedPlatforms || []).map((plat, idx) => (
                            <span 
                              key={idx} 
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                plat.includes('أمازون') 
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                                  : plat.includes('نون') 
                                  ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' 
                                  : 'bg-red-500/10 text-red-300 border-red-500/30'
                              }`}
                            >
                              {plat}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 4. Subscription Status */}
                      <td className="p-3.5">
                        {merchant.status === 'active' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{merchant.role === 'merchant_paid' ? 'نشط (مدفوع)' : 'تجريبي 7 أيام'}</span>
                          </span>
                        ) : merchant.status === 'blocked' ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>محظور</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>منتهي</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Monitored Products Count */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>{merchant.monitoredProductsCount} منتج</span>
                        </span>
                      </td>

                      {/* 6. Expiry Date */}
                      <td className="p-3.5 font-mono text-slate-300">{merchant.trialEndDate}</td>
                      
                      {/* 7. Actions */}
                      <td className="p-3.5">
                        {merchant.role !== 'owner' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit */}
                            <button
                              onClick={() => handleEditClick(merchant)}
                              title="تعديل البيانات"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg border border-slate-700 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Extend trial */}
                            <button
                              onClick={() => extendTrial30Days(merchant.id)}
                              title="تمديد المهلة 30 يوم"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle active / block */}
                            <button
                              onClick={() => toggleMerchantStatus(merchant.id)}
                              title={merchant.status === 'active' ? 'حظر الحساب' : 'تفعيل الحساب'}
                              className={`p-1.5 rounded-lg border transition ${
                                merchant.status === 'active' 
                                  ? 'bg-red-950/60 hover:bg-red-900 text-red-300 border-red-500/30' 
                                  : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {merchant.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deleteMerchant(merchant.id)}
                              title="حذف الحساب"
                              className="p-1.5 bg-slate-800 hover:bg-red-900 text-red-400 rounded-lg border border-slate-700 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-center block text-slate-500 text-[10px]">حساب مالك النظام</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>جدول متابعة المدفوعات وتجديد الاشتراكات</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">تتبع التدفقات المالية وتجديد الاشتراكات لكل تجار المنصة.</p>
            </div>
            
            <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 font-bold">
              إجمالي MRR المتوقع: {totalMRR.toLocaleString()} ج.م/شهر
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-3.5 font-bold">التاجر</th>
                  <th className="p-3.5 font-bold">الباقة</th>
                  <th className="p-3.5 font-bold">المنصات المرتبطة</th>
                  <th className="p-3.5 font-bold">القيمة الشهري</th>
                  <th className="p-3.5 font-bold">حالة الدفع</th>
                  <th className="p-3.5 font-bold">تاريخ التجديد</th>
                  <th className="p-3.5 font-bold text-center">تجديد يدوي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {merchants.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-white">{m.name} ({m.email})</td>
                    <td className="p-3.5 text-slate-300 font-bold">
                      {m.plan === 'gold_yearly' ? 'الذهبية السنوية' : m.plan === 'pro_monthly' ? 'الاحترافية الشهرية' : 'تجريبية مجانية'}
                    </td>
                    <td className="p-3.5 text-slate-300">{(m.connectedPlatforms || []).join('، ')}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{m.monthlyRevenue} ج.م</td>
                    <td className="p-3.5">
                      {m.paymentConfirmed ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">مكتمل ومعتمد</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold text-[10px]">معلق/غير مسدد</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{m.trialEndDate}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => extendTrial30Days(m.id)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition"
                      >
                        تمديد 30 يوم
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>التقارير المالية والتحليلات التنفيذية</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">تقارير أرباح المنصة والمؤشرات القياسية للأداء.</p>
            </div>

            <button
              onClick={exportCsvReport}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>تحميل التقرير المالي (CSV)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
              <span className="text-slate-400 text-xs font-bold block">إجمالي الإيرادات المتوقعة هذا الشهر</span>
              <div className="text-3xl font-black text-amber-400 font-mono">{totalMRR.toLocaleString()} ج.م</div>
              <p className="text-[11px] text-emerald-400 font-bold">+18.5% مقارنة بالشهر السابق</p>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-slate-400 text-xs font-bold block">متوسط الإيراد للتاجر (ARPU)</span>
              <div className="text-3xl font-black text-white font-mono">
                {activePaidCount > 0 ? Math.round(totalMRR / activePaidCount) : 0} ج.m
              </div>
              <p className="text-[11px] text-slate-400">محسوبة بناءً على المشتركين النشطين</p>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-slate-400 text-xs font-bold block">نسبة الحفاظ على المشتركين (Retention Rate)</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">94.2%</div>
              <p className="text-[11px] text-emerald-400 font-bold">معدل التجديد التلقائي مرتفع جداً</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
