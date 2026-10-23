import React, { useState } from 'react';
import { 
  Store, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Package, 
  ShoppingBag, 
  Globe, 
  Building2, 
  Smartphone, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  Bell,
  Settings,
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'radar' | 'inventory' | 'sales'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = [
    { title: 'إجمالي المنتجات المراقبة', value: '142 منتج', change: '+12.5%', isUp: true, icon: Package, color: 'from-blue-600 to-indigo-700' },
    { title: 'منتجات متصدرة Buy Box', value: '98 منتج', change: '+8.2%', isUp: true, icon: ShieldCheck, color: 'from-emerald-600 to-teal-700' },
    { title: 'تنبيهات هبوط الأسعار', value: '14 تنبيه', change: '-3.1%', isUp: false, icon: Bell, color: 'from-amber-600 to-orange-700' },
    { title: 'إجمالي المبيعات اليومية', value: '78,450 ج.م', change: '+24.6%', isUp: true, icon: TrendingUp, color: 'from-purple-600 to-pink-700' },
  ];

  const platforms = [
    { name: 'أمازون مصر (Amazon.eg)', status: 'متصل ومزامنة فورية', products: 86, buyBox: '78%', ping: '120ms', icon: ShoppingBag, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    { name: 'نون مصر (Noon Partner)', status: 'متصل ومزامنة فورية', products: 64, buyBox: '65%', ping: '145ms', icon: Globe, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
    { name: 'جوميا مصر (Jumia Mall)', status: 'متصل ومزامنة فورية', products: 42, buyBox: '82%', ping: '180ms', icon: Building2, color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  ];

  const sampleProducts = [
    { id: '1', title: 'سماعة بلوتوث لاسلكية مقاومة للماء TWS', category: 'إلكترونيات', myPrice: 850, competitorPrice: 890, status: 'رَابِح (Buy Box)', platform: 'أمازون مصر', stock: 45 },
    { id: '2', title: 'شاحن جداري سريع 65 وات قوية Type-C', category: 'إلكترونيات وموبايلات', myPrice: 420, competitorPrice: 399, status: 'تحت المراقبة', platform: 'نون مصر', stock: 12 },
    { id: '3', title: 'ساعة ذكية رياضية بشاشة AMOLED', category: 'إلكترونيات', myPrice: 1250, competitorPrice: 1250, status: 'تعادل سعري', platform: 'جوميا مصر', stock: 28 },
    { id: '4', title: 'حقيبة ظهر لاب توب مضادة للسرقة', category: 'مستلزمات شخصية', myPrice: 550, competitorPrice: 590, status: 'رَابِح (Buy Box)', platform: 'أمازون مصر', stock: 60 },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              رادار التاجر الذكي مصر <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">بث مباشر ⚡</span>
            </h1>
            <p className="text-xs text-slate-400">لوحة تحكم تحليل الأسعار والمنافسة في السوق المصري (أمازون، نون، جوميا)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className={`px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer ${isRefreshing ? 'opacity-75' : ''}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>تحديث البيانات</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-sky-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>متجر ياسمين نور (معتمد)</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button 
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${selectedTab === 'overview' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>نظرة عامة والملخص</span>
          </button>
          <button 
            onClick={() => setSelectedTab('radar')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${selectedTab === 'radar' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>رادار المنافسين والأسعار</span>
          </button>
          <button 
            onClick={() => setSelectedTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${selectedTab === 'inventory' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Package className="w-4 h-4" />
            <span>إدارة المخزون</span>
          </button>
          <button 
            onClick={() => setSelectedTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${selectedTab === 'sales' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>تحليلات المبيعات</span>
          </button>
        </div>

        {/* Overview Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${stat.isUp ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                        {stat.isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {stat.change}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400">{stat.title}</h4>
                      <div className="text-xl sm:text-2xl font-black text-white mt-1">{stat.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Platforms Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-400" />
                    <span>حالة ربط المنصات وقنوات البيع</span>
                  </h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">3 منصات نشطة</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {platforms.map((plat, idx) => {
                    const PlatIcon = plat.icon;
                    return (
                      <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${plat.color}`}>
                            <PlatIcon className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{plat.status}</span>
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{plat.name}</div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                            <span>المنتجات: {plat.products}</span>
                            <span className="text-sky-400 font-bold">Buy Box: {plat.buyBox}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions / AI Summary */}
              <div className="bg-gradient-to-br from-indigo-950/60 to-slate-950/80 border border-indigo-500/30 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <h3 className="font-black text-white text-base">توصيات الذكاء الاصطناعي</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تم رصد انخفاض سعر المنتج &quot;شاحن جداري سريع&quot; لدى المنافسين في نون بمقدار 21 ج.م. يُنصح بتعديل السعر التلقائي لحماية حصة Buy Box.
                  </p>
                </div>
                <button className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>تطبيق التعديل التلقائي الذكي</span>
                </button>
              </div>
            </div>

            {/* Sample Competitor Pricing Table */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white">رصد أسعار المنافسين الفوري (Live Competitor Pricing)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">مقارنة لحظية بين أسعار متجرك وأسعار أقوى المنافسين في السوق المصري</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="بحث عن منتج أو SKU..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-extrabold text-slate-400">
                      <th className="py-3 px-4">المنتج والـ SKU</th>
                      <th className="py-3 px-4">التصنيف</th>
                      <th className="py-3 px-4">سعر متجرك</th>
                      <th className="py-3 px-4">سعر المنافس الأقل</th>
                      <th className="py-3 px-4">القناة</th>
                      <th className="py-3 px-4">حالة Buy Box</th>
                      <th className="py-3 px-4">المخزون</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {sampleProducts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">{prod.title}</td>
                        <td className="py-3.5 px-4 text-slate-400">{prod.category}</td>
                        <td className="py-3.5 px-4 font-extrabold text-sky-400">{prod.myPrice} ج.م</td>
                        <td className="py-3.5 px-4 font-extrabold text-amber-400">{prod.competitorPrice} ج.م</td>
                        <td className="py-3.5 px-4 text-slate-300">{prod.platform}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 ${prod.status.includes('رَابِح') ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : prod.status.includes('تحت') ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'}`}>
                            {prod.status.includes('رَابِح') ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            {prod.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-200">{prod.stock} وحدة</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Other Tabs Content Fallback */}
        {selectedTab !== 'overview' && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-sky-500/15 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">قسم ({selectedTab === 'radar' ? 'رادار المنافسين والأسعار' : selectedTab === 'inventory' ? 'إدارة المخزون' : 'تحليلات المبيعات'}) نشط وجاهز</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              يمكنك التبديل بين أقسام المنظومة المختلفة لمتابعة تفاصيل البوالص، والموردين، وتقارير الأداء اليومية والأسبوعية.
            </p>
            <button 
              onClick={() => setSelectedTab('overview')}
              className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              العودة إلى لوحة التحكم الرئيسية
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
