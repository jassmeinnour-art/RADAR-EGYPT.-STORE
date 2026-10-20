import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Percent, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Search, 
  HelpCircle, 
  CreditCard, 
  Layers, 
  ShoppingBag, 
  Store,
  ChevronDown,
  ChevronUp,
  Info,
  BadgeCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { PlatformGuideItem } from '../types';
import { EGYPTIAN_PLATFORMS_GUIDE } from '../data/platformsGuideData';

export const PlatformsOnboardingGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPlatformId, setExpandedPlatformId] = useState<string | null>('amazon-eg');

  // Interactive Merchant Documents Checklist State
  const [merchantDocs, setMerchantDocs] = useState<{ [key: string]: boolean }>({
    'cr': true,
    'tax_card': true,
    'bank_iban': true,
    'national_id': true,
    'vat': false,
    'brand_auth': false,
    'whatsapp_biz': true,
    'einvoice': false
  });

  const toggleDoc = (docKey: string) => {
    setMerchantDocs(prev => ({ ...prev, [docKey]: !prev[docKey] }));
  };

  // Filter platforms
  const filteredPlatforms = EGYPTIAN_PLATFORMS_GUIDE.filter(plat => {
    const matchesCategory = selectedCategory === 'all' || plat.category === selectedCategory;
    const matchesSearch = plat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plat.arabicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plat.requirements.some(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Calculate qualified platforms based on checked docs
  const qualifiedCount = EGYPTIAN_PLATFORMS_GUIDE.filter(plat => {
    // If merchant has CR, Tax Card, Bank IBAN, and ID, they can join almost all marketplaces
    const hasCoreDocs = merchantDocs['cr'] && merchantDocs['tax_card'] && merchantDocs['bank_iban'] && merchantDocs['national_id'];
    if (plat.id === 'facebook-marketplace-eg') return merchantDocs['whatsapp_biz'] || merchantDocs['national_id'];
    if (plat.id === 'tiktok-shop-eg') return merchantDocs['whatsapp_biz'] && merchantDocs['national_id'];
    if (plat.id === 'jumia-eg') return merchantDocs['national_id'] && merchantDocs['bank_iban'];
    if (plat.id === 'btech-eg') return hasCoreDocs && (merchantDocs['brand_auth'] || merchantDocs['einvoice']);
    if (plat.id === 'elaraby-group-eg') return hasCoreDocs && merchantDocs['einvoice'];
    return hasCoreDocs;
  }).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Introduction */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>دليل التوسع وفتح أسواق وقنوات بيع جديدة في مصر 🇪🇬</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Alexandria']">
            دليل المنصات الإلكترونية المعتمدة والأوراق الرسمية للاشتراك
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            استكشف كبرى منصات التجارة الإلكترونية المتاحة للتجار في جمهورية مصر العربية، مع تفاصيل الأوراق القانونية المطلوبة، شروط القبول، نسب العمولات، ومواعيد تحويل الأرباح لحسابك البنكي.
          </p>
        </div>
      </div>

      {/* Interactive Merchant Document Readiness Gauge (فاحص جاهزية أوراق التاجر) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>مقياس جاهزية أوراق التاجر (Document Readiness Checklist)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              حدد الأوراق المتاحة لديك حالياً لمعرفة المنصات التي يمكنك فتح متجر بها فوراً اليوم
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold text-xs shrink-0">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span>جاهز للتسجيل في {qualifiedCount} من أصل {EGYPTIAN_PLATFORMS_GUIDE.length} منصات</span>
          </div>
        </div>

        {/* Checkbox grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          
          <button
            onClick={() => toggleDoc('cr')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              merchantDocs['cr']
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {merchantDocs['cr'] ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
            <div>
              <strong className="text-xs block">سجل تجاري حديث</strong>
              <span className="text-[10px] text-slate-500">ساري من الغرفة التجارية</span>
            </div>
          </button>

          <button
            onClick={() => toggleDoc('tax_card')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              merchantDocs['tax_card']
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {merchantDocs['tax_card'] ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
            <div>
              <strong className="text-xs block">بطاقة ضريبية</strong>
              <span className="text-[10px] text-slate-500">رقم التسجيل الضريبي الموحد</span>
            </div>
          </button>

          <button
            onClick={() => toggleDoc('bank_iban')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              merchantDocs['bank_iban']
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {merchantDocs['bank_iban'] ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
            <div>
              <strong className="text-xs block">كشف حساب أو IBAN بنكي</strong>
              <span className="text-[10px] text-slate-500">باسم التاجر أو المنشأة</span>
            </div>
          </button>

          <button
            onClick={() => toggleDoc('national_id')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              merchantDocs['national_id']
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {merchantDocs['national_id'] ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
            <div>
              <strong className="text-xs block">بطاقة الرقم القومي</strong>
              <span className="text-[10px] text-slate-500">سارية من الوجهين</span>
            </div>
          </button>

          <button
            onClick={() => toggleDoc('vat')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              merchantDocs['vat']
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {merchantDocs['vat'] ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
            <div>
              <strong className="text-xs block">شهادة ضريبة القيمة المضافة</strong>
              <span className="text-[10px] text-slate-500">للمبيعات فوق 500 ألف ج.م</span>
            </div>
          </button>

          <button
            onClick={() => toggleDoc('brand_auth')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              merchantDocs['brand_auth']
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {merchantDocs['brand_auth'] ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
            <div>
              <strong className="text-xs block">فواتير شراء ضريبية من الوكيل</strong>
              <span className="text-[10px] text-slate-500">لبيع الماركات العالمية المحمية</span>
            </div>
          </button>

          <button
            onClick={() => toggleDoc('whatsapp_biz')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              merchantDocs['whatsapp_biz']
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {merchantDocs['whatsapp_biz'] ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
            <div>
              <strong className="text-xs block">واتساب تجاري + عقد شحن</strong>
              <span className="text-[10px] text-slate-500">لتيك توك وسوشيال ميديا</span>
            </div>
          </button>

          <button
            onClick={() => toggleDoc('einvoice')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              merchantDocs['einvoice']
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {merchantDocs['einvoice'] ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
            <div>
              <strong className="text-xs block">الفاتورة الإلكترونية (B2B)</strong>
              <span className="text-[10px] text-slate-500">لمنصات كارتونا وبي تك</span>
            </div>
          </button>

        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المنصة أو المستند أو الفئة..."
            className="w-full h-9 pr-9 pl-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: `جميع المنصات (${EGYPTIAN_PLATFORMS_GUIDE.length})` },
            { id: 'marketplaces', label: 'أسواق الماركت بليس 📦' },
            { id: 'electronics_appliances', label: 'الأجهزة والإلكترونيات (B.Tech والعربي) ⚡' },
            { id: 'social_commerce', label: 'سوشيال وماركت بليس (Facebook / TikTok) 📲' },
            { id: 'private_store', label: 'المتاجر الخاصة (سلة/زد) 🌐' },
            { id: 'b2b_wholesale', label: 'منصات الجملة B2B 🏢' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Jump Platform Badges */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-slate-500 font-bold shrink-0 text-[11px]">انتقال سريع:</span>
        {[
          { id: 'facebook-marketplace-eg', label: '📘 فيسبوك ماركت بليس (0% عمولة)', color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' },
          { id: 'elaraby-group-eg', label: '🏭 العربي جروب (توشيبا/تورنيدو/شارب)', color: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100' },
          { id: 'btech-eg', label: '🔵 بي تك مصر (ميني كاش)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100' },
          { id: 'amazon-eg', label: '📦 أمازون مصر (FBA)', color: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100' },
          { id: 'noon-eg', label: '🟡 نون مصر (Partner)', color: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100' },
          { id: 'jumia-eg', label: '🟠 جوميا مصر', color: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setSelectedCategory('all');
              setExpandedPlatformId(item.id);
              const el = document.getElementById(`platform-guide-${item.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${item.color}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Platforms List Accordion */}
      <div className="space-y-4">
        {filteredPlatforms.map((platform) => {
          const isExpanded = expandedPlatformId === platform.id;

          return (
            <div
              key={platform.id}
              id={`platform-guide-${platform.id}`}
              className={`platform-card group bg-white rounded-2xl border transition-all duration-300 ease-out shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                isExpanded ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200/90 hover:border-indigo-300/80'
              }`}
            >
              {/* Platform Card Header (Always Visible) */}
              <div
                onClick={() => setExpandedPlatformId(isExpanded ? null : platform.id)}
                className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors duration-200"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-xs shrink-0 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:border-indigo-200 group-hover:bg-indigo-50/40">
                    {platform.logo}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 font-['Alexandria']">
                        {platform.arabicName}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${platform.badgeColor}`}>
                        {platform.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {platform.tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <UsersIcon />
                        <span>{platform.activeCustomerBaseEgypt}</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">
                        تحويل الأرباح: {platform.payoutCycle}
                      </span>
                      <span>•</span>
                      <span className="text-indigo-600 font-bold">
                        أقل رأس مال: {platform.minStartBudget}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                  <a
                    href={platform.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>رابط التسجيل المباشر</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details Section */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-6 bg-slate-50/40 animate-fadeIn">
                  
                  {/* Platform Overview Text */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
                    {platform.description}
                  </p>

                  {/* 1. Required Legal & Official Documents (الأوراق والمستندات الرسمية) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-900">
                        الأوراق والمستندات الرسمية المطلوبة للاشتراك (Documents Checklist)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {platform.requirements.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${req.isRequired ? 'bg-rose-500' : 'bg-sky-500'}`} />
                              <strong className="text-xs font-bold text-slate-900">{req.title}</strong>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                              req.isRequired ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {req.isRequired ? 'إلزامي' : 'اختياري في البداية'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-normal">
                            {req.description}
                          </p>

                          <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                            <span>الجهة: <strong className="text-slate-700">{req.issuerAuthority}</strong></span>
                            <span>الوقت المتوقع: <strong className="text-slate-700">{req.estimatedDaysToIssue}</strong></span>
                          </div>

                          {req.proTip && (
                            <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-2 text-[10px] text-sky-900 flex items-start gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                              <span><strong>نصيحة التاجر:</strong> {req.proTip}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Commission Rates Table & Categories */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900">
                        نسب العمولات والرسوم حسب الفئات (Commission Breakdown)
                      </h4>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <tr>
                            <th className="py-2.5 px-4">فئة المنتجات</th>
                            <th className="py-2.5 px-4 text-emerald-700">نسبة العمولة الرسمية</th>
                            <th className="py-2.5 px-4">ملاحظات وشروط الفئة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {platform.commissionRates.map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2 px-4 font-bold text-slate-800">{c.category}</td>
                              <td className="py-2 px-4 font-black text-emerald-600">{c.rate}</td>
                              <td className="py-2 px-4 text-slate-500 text-[11px]">{c.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3. Fulfillment Options & Shipping Models */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-900">
                        طرق الشحن، التخزين واللوجستيات المتاحة
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {platform.fulfillmentOptions.map((opt, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-1.5 shadow-2xs">
                          <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>{opt.name}</span>
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {opt.description}
                          </p>
                          <div className="text-[10px] text-indigo-700 bg-indigo-50/70 px-2 py-1 rounded-md font-medium">
                            <strong>الأفضل لـ:</strong> {opt.recommendedFor}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Pros & Cons in the Egyptian Market */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                      <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>أبرز المميزات للتاجر في مصر</span>
                      </h5>
                      <ul className="space-y-1 text-[11px] text-emerald-950">
                        {platform.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3.5 space-y-2">
                      <h5 className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-sky-600" />
                        <span>تحديات ونقاط يجب الانتباه لها</span>
                      </h5>
                      <ul className="space-y-1 text-[11px] text-sky-950">
                        {platform.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-sky-600 font-bold">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Direct CTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-indigo-200">
                    <div className="text-xs text-slate-600 text-center sm:text-right">
                      <span>دعم البائعين الرسمي في مصر: </span>
                      <strong className="text-indigo-700">{platform.officialSupportContact}</strong>
                    </div>

                    <a
                      href={platform.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <span>فتح حساب بائع على {platform.name} الآن</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

const UsersIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
