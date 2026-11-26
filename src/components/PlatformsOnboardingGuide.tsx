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
  Square,
  Video,
  PlayCircle,
  Loader2,
  Download,
  RotateCcw
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

  type OnboardingVideoFocus = 'all' | 'docs' | 'integration';
  type OnboardingVideoDuration = '6s' | '8s' | '10s';

  const [videoFocusByPlatform, setVideoFocusByPlatform] = useState<Record<string, OnboardingVideoFocus>>({});
  const [videoDurationByPlatform, setVideoDurationByPlatform] = useState<Record<string, OnboardingVideoDuration>>({});
  const [generatedVideos, setGeneratedVideos] = useState<
    Record<string, { videoUrl: string; duration: string; focusMode: OnboardingVideoFocus; model?: string }>
  >({});
  const [generatingVideoFor, setGeneratingVideoFor] = useState<string | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});

  const handleGenerateOnboardingVideo = async (platform: PlatformGuideItem) => {
    const focusMode = videoFocusByPlatform[platform.id] || 'all';
    const duration = videoDurationByPlatform[platform.id] || '8s';

    setGeneratingVideoFor(platform.id);
    setVideoErrors((prev) => {
      const next = { ...prev };
      delete next[platform.id];
      return next;
    });

    try {
      const response = await fetch('/api/platforms/onboarding-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: platform.id,
          platformName: platform.name,
          arabicName: platform.arabicName,
          focusMode,
          duration,
          requirementsSummary: platform.requirements
            .filter((r) => r.isRequired)
            .map((r) => r.title)
            .join('، '),
          fulfillmentSummary: platform.fulfillmentOptions.map((f) => f.name).join('، '),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success || !data?.videoUrl) {
        throw new Error(data?.error || 'تعذر توليد الفيديو التوضيحي بالذكاء الاصطناعي حالياً');
      }

      setGeneratedVideos((prev) => ({
        ...prev,
        [platform.id]: {
          videoUrl: data.videoUrl,
          duration: data.duration || duration,
          focusMode,
          model: data.model,
        },
      }));
    } catch (err: any) {
      setVideoErrors((prev) => ({
        ...prev,
        [platform.id]: err?.message || 'حدث خطأ أثناء توليد الفيديو التوضيحي',
      }));
    } finally {
      setGeneratingVideoFor((current) => (current === platform.id ? null : current));
    }
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
              if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
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

                  {/* Amazon SP-API Authorization Code Step-by-Step Visual Guide */}
                  {platform.id === 'amazon-eg' && (
                    <div className="bg-gradient-to-br from-sky-50 via-indigo-50/40 to-white rounded-2xl border-2 border-sky-300 p-5 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-200 gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                            🔑
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 font-['Alexandria']">
                              دليل مصور خطوة بخطوة: استخراج كود التفويض (Authorization Code) من Amazon Seller Central
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              خطوات عملية دقيقة مع الرسوم التوضيحية لربط متجرك بأمان عبر SP-API وتجنب الأخطاء البشرية
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-sky-600 text-white rounded-full text-[11px] font-bold shadow-xs self-start sm:self-auto shrink-0">
                          دليل حصري لرادار التاجر 🇪🇬
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Step 1 */}
                        <div className="bg-white rounded-xl border border-sky-200 p-4 space-y-3 shadow-2xs relative overflow-hidden group hover:border-sky-400 transition-all">
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                            01
                          </div>
                          <div className="w-full h-24 rounded-lg bg-sky-950 text-sky-200 p-3 flex flex-col justify-between font-mono text-[10px] border border-sky-900 shadow-inner">
                            <div className="flex items-center justify-between text-sky-400">
                              <span>🌐 sellercentral.amazon.eg</span>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <div className="bg-sky-900/80 p-1.5 rounded text-center text-white font-bold">
                              تسجيل الدخول (Admin Login)
                            </div>
                            <div className="text-[9px] text-slate-400 text-center">أدخل بريد وكلمة مرور البائع</div>
                          </div>
                          <div className="space-y-1">
                            <strong className="text-xs font-bold text-slate-900 block">تسجيل الدخول لوحة البائع</strong>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              افتح متصفحك واذهب إلى <a href="https://sell.amazon.eg" target="_blank" rel="noreferrer" className="text-sky-600 underline font-medium">sell.amazon.eg</a> وسجل الدخول بحساب حساب المالك (Admin).
                            </p>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-xl border border-sky-200 p-4 space-y-3 shadow-2xs relative overflow-hidden group hover:border-sky-400 transition-all">
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                            02
                          </div>
                          <div className="w-full h-24 rounded-lg bg-slate-900 text-slate-200 p-3 flex flex-col justify-between font-mono text-[10px] border border-slate-800 shadow-inner">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>⚙️ Settings / إعدادات</span>
                              <span>▼</span>
                            </div>
                            <div className="bg-indigo-600 text-white p-1.5 rounded text-center font-bold">
                              Partner Network (شبكة الشركاء)
                            </div>
                            <div className="text-[9px] text-slate-400 text-center">أو Develop Apps / التطبيقات</div>
                          </div>
                          <div className="space-y-1">
                            <strong className="text-xs font-bold text-slate-900 block">الانتقال لشبكة الشركاء</strong>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              من القائمة العلوية أو الجانبية، افتح <strong className="text-slate-800">Settings</strong> ثم اضغط على <strong className="text-slate-800">Partner Network</strong> (أو Develop Apps).
                            </p>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-xl border border-sky-200 p-4 space-y-3 shadow-2xs relative overflow-hidden group hover:border-sky-400 transition-all">
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                            03
                          </div>
                          <div className="w-full h-24 rounded-lg bg-emerald-950 text-emerald-200 p-3 flex flex-col justify-between font-mono text-[10px] border border-emerald-900 shadow-inner">
                            <div className="flex items-center justify-between text-emerald-400">
                              <span>🔗 Authorize App</span>
                              <span className="text-[9px] bg-emerald-800 px-1 rounded">SP-API</span>
                            </div>
                            <div className="bg-emerald-600 text-white p-1.5 rounded text-center font-bold">
                              تفعيل وتركيز التفويض
                            </div>
                            <div className="text-[9px] text-slate-300 text-center">الموافقة على منح صلاحيات القراءة</div>
                          </div>
                          <div className="space-y-1">
                            <strong className="text-xs font-bold text-slate-900 block">منح صلاحيات SP-API</strong>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              اضغط على <strong className="text-slate-800">Authorize new developer</strong>، أدخل معرف التطبيق ووافق على الشروط ومنح الصلاحيات الآمنة.
                            </p>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white rounded-xl border border-sky-200 p-4 space-y-3 shadow-2xs relative overflow-hidden group hover:border-sky-400 transition-all">
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                            04
                          </div>
                          <div className="w-full h-24 rounded-lg bg-indigo-950 text-indigo-200 p-3 flex flex-col justify-between font-mono text-[10px] border border-indigo-900 shadow-inner overflow-hidden">
                            <div className="flex items-center justify-between text-indigo-300 truncate">
                              <span>🔗 URL Query Param</span>
                            </div>
                            <div className="bg-indigo-900/90 p-1.5 rounded text-[9px] text-amber-300 font-mono truncate select-all" dir="ltr">
                              spapi_oauth_code=Atza|...
                            </div>
                            <div className="text-[9px] text-emerald-300 text-center font-bold">انسخ الكود والصقه في كارت التاجر!</div>
                          </div>
                          <div className="space-y-1">
                            <strong className="text-xs font-bold text-slate-900 block">نسخ الكود ولصقه برادار</strong>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              ستظهر لك صفحة العودة وعليها كود التفويض في رابط المتصفح (<code className="bg-slate-100 px-1 rounded text-rose-600">spapi_oauth_code</code>). انسخه والصقه فوراً!
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">تنبيه هام جداً لتجنب الأخطاء:</strong>
                          كود التفويض (Authorization Code) صالح لفترة محدودة (10 دقائق فقط) ويستخدم لمرة واحدة فقط لاستبدال الـ Refresh Token النهائي. إذا واجهت خطأ انتهي الصلاحية، قم بإعادة الخطوة الرابعة للحصول على كود جديد فوراً.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Explanatory Video Guide Section */}
                  {(() => {
                    const currentFocus = videoFocusByPlatform[platform.id] || 'all';
                    const currentDuration = videoDurationByPlatform[platform.id] || '8s';
                    const isGeneratingVideo = generatingVideoFor === platform.id;
                    const generatedVideo = generatedVideos[platform.id];
                    const videoError = videoErrors[platform.id];
                    const requiredDocsPreview = platform.requirements
                      .filter((r) => r.isRequired)
                      .slice(0, 3)
                      .map((r) => r.title)
                      .join(' · ');

                    return (
                      <section
                        data-testid={`platform-video-section-${platform.id}`}
                        aria-label={`فيديو توضيحي لخطوات الربط مع ${platform.arabicName}`}
                        className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <Video className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
                              <span>فيديو توضيحي بالذكاء الاصطناعي لخطوات الربط ({platform.name})</span>
                            </h4>
                            <p className="text-xs text-slate-500">
                              أنشئ فيديو قصيراً يشرح عملياً خطوات التجهيز والتسجيل وتفعيل الربط التجاري مع المنصة.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <div
                              role="group"
                              aria-label="محور الفيديو التوضيحي"
                              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
                            >
                              {[
                                { id: 'all', label: 'الربط الشامل' },
                                { id: 'docs', label: 'الأوراق الرسمية' },
                                { id: 'integration', label: 'الشحن والمزامنة' },
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() =>
                                    setVideoFocusByPlatform((prev) => ({
                                      ...prev,
                                      [platform.id]: opt.id as OnboardingVideoFocus,
                                    }))
                                  }
                                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                    currentFocus === opt.id
                                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>

                            <div
                              role="group"
                              aria-label="مدة الفيديو"
                              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
                            >
                              {(['6s', '8s', '10s'] as OnboardingVideoDuration[]).map((dur) => (
                                <button
                                  key={dur}
                                  type="button"
                                  onClick={() =>
                                    setVideoDurationByPlatform((prev) => ({
                                      ...prev,
                                      [platform.id]: dur,
                                    }))
                                  }
                                  className={`px-2 py-1.5 rounded-md text-xs font-mono tabular-nums transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                    currentDuration === dur
                                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {dur}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                          {/* Video Stage / Player */}
                          <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                            {generatedVideo?.videoUrl ? (
                              <div className="space-y-3">
                                <video
                                  data-testid={`platform-video-player-${platform.id}`}
                                  src={generatedVideo.videoUrl}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-200"
                                />
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <span className="text-slate-500">
                                    المدة: <strong className="font-mono tabular-nums text-slate-800">{generatedVideo.duration}</strong> · دقة 720p
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={isGeneratingVideo}
                                      onClick={() => handleGenerateOnboardingVideo(platform)}
                                      className="min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                                      <span>إعادة توليد الفيديو</span>
                                    </button>
                                    <a
                                      href={generatedVideo.videoUrl}
                                      download={`${platform.id}-onboarding-guide.mp4`}
                                      className="min-h-[38px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                                    >
                                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                                      <span>تحميل الفيديو (MP4)</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full min-h-[230px] rounded-xl bg-slate-950 text-white p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                                  {isGeneratingVideo ? (
                                    <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                                  ) : (
                                    <PlayCircle className="w-6 h-6" aria-hidden="true" />
                                  )}
                                </div>
                                <div className="space-y-1.5 max-w-md">
                                  <h5 className="text-sm font-bold text-white">
                                    {isGeneratingVideo
                                      ? `جاري إنشاء الفيديو التوضيحي لمنصة ${platform.arabicName}...`
                                      : `شاهد خطوات الربط مع ${platform.arabicName} في فيديو قصير`}
                                  </h5>
                                  <p className="text-xs text-slate-300 leading-relaxed">
                                    {isGeneratingVideo
                                      ? 'يقوم نموذج الذكاء الاصطناعي بتوليد مشهد مرئي يشرح خطوات التسجيل والربط (قد يستغرق ذلك عدة ثوانٍ).'
                                      : `توليد عرض بصري مدته ${currentDuration} يوضح تجهيز المستندات وإنشاء حساب البائع وتفعيل الشحن.`}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  disabled={isGeneratingVideo}
                                  onClick={() => handleGenerateOnboardingVideo(platform)}
                                  className="min-h-[42px] px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                                >
                                  {isGeneratingVideo ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                      <span>جاري التوليد...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Video className="w-4 h-4" aria-hidden="true" />
                                      <span>توليد فيديو توضيحي بالذكاء الاصطناعي</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {videoError && (
                              <div
                                role="alert"
                                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between gap-2"
                              >
                                <span className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                                  <span>{videoError}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleGenerateOnboardingVideo(platform)}
                                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer whitespace-nowrap shrink-0"
                                >
                                  إعادة المحاولة
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 3-Step Onboarding Narrative Summary */}
                          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-slate-100 pt-4 lg:pt-0 lg:pr-5 space-y-4">
                            <div className="space-y-3">
                              <h5 className="text-xs font-bold text-slate-900">
                                ملخص الخطوات المشروحة في الفيديو
                              </h5>

                              <div className="space-y-3 divide-y divide-slate-100">
                                <div className="pt-1 space-y-1">
                                  <div className="text-xs font-bold text-slate-900">
                                    01. تجهيز الأوراق الرسمية
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {requiredDocsPreview || 'السجل التجاري، البطاقة الضريبية، ورقم الحساب البنكي IBAN.'}
                                  </p>
                                </div>

                                <div className="pt-3 space-y-1">
                                  <div className="text-xs font-bold text-slate-900">
                                    02. التسجيل وتفعيل بوابة البائعين
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    توثيق الحساب عبر بوابة {platform.name} وضبط دورة التحويل ({platform.payoutCycle}).
                                  </p>
                                </div>

                                <div className="pt-3 space-y-1">
                                  <div className="text-xs font-bold text-slate-900">
                                    03. ربط المنتجات والشحن الذكي
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    تفعيل {platform.fulfillmentOptions[0]?.name || 'قناة الشحن المعتمدة'} ومزامنة الأسعار والمخزون.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                              القناة الرسمية: <span className="font-mono text-slate-700" dir="ltr">{platform.registrationUrl}</span>
                            </div>
                          </div>
                        </div>
                      </section>
                    );
                  })()}

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

export default PlatformsOnboardingGuide;
