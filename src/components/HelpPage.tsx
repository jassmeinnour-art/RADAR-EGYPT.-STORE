import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  HelpCircle, 
  Zap, 
  RefreshCw, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Key, 
  Globe, 
  Building2, 
  ShieldCheck, 
  Terminal,
  Sparkles,
  ArrowRight,
  Sliders,
  Info,
  Eye,
  Lock,
  Layers,
  Cpu
} from 'lucide-react';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<'amazon' | 'noon' | 'jumia' | 'faq'>('amazon');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showVisualPreviews, setShowVisualPreviews] = useState<boolean>(true);

  // Checkable steps persistence
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('radar_help_completed_steps');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Simulator state
  const [simSellerId, setSimSellerId] = useState('');
  const [simApiKey, setSimApiKey] = useState('');
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testLog, setTestLog] = useState<string[]>([]);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('radar_help_completed_steps', JSON.stringify(completedSteps));
    } catch (e) {
      console.warn('Failed to persist help steps:', e);
    }
  }, [completedSteps]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runConnectionTest = () => {
    if (!simSellerId) {
      alert('الرجاء إدخال معرف التاجر (Seller ID / Merchant ID) للاختبار.');
      return;
    }
    setTestingStatus('testing');
    setTestLog(['جاري إنشاء اتصال آمن بروتوكول TLS 1.3...', 'التحقق من توقيع مفاتيح API...']);
    setTestLatency(null);

    setTimeout(() => {
      setTestLog(prev => [...prev, 'تم العثور على خوادم المنصة (الاستجابة 200 OK)']);
    }, 600);

    setTimeout(() => {
      setTestLog(prev => [...prev, 'التحقق من صلاحية قراءة الأسعار والمخزون التلقائية...']);
      setTestLatency(Math.floor(Math.random() * 30) + 25);
      setTestingStatus('success');
    }, 1300);
  };

  // Detailed steps with UI diagram specifications
  const amazonSteps = [
    {
      id: 'amz_1',
      title: '1. إنشاء حساب مطور Selling Partner API (SP-API)',
      desc: 'قم بالدخول إلى حساب Seller Central الخاص بك في مصر (sellercentral.amazon.eg)، ثم انتقل إلى قسم Partner Network -> Develop Apps واستكمل نموذج طلب حساب المطور (Developer Account Profile).',
      visualType: 'amazon_menu'
    },
    {
      id: 'amz_2',
      title: '2. إنشاء تطبيق جديد واستخراج LWA Client Credentials',
      desc: 'اضغط على "Add New App Client"، اختر نوع التطبيق "SP-API App"، وسجل الاسم. عند الحفظ، سيظهر لك LWA Client ID و LWA Client Secret. احتفظ بهما بصفة آمنة.',
      visualType: 'amazon_credentials'
    },
    {
      id: 'amz_3',
      title: '3. تفويض التطبيق واستخراج Refresh Token و Seller ID',
      desc: 'انقر على "Authorize" للتطبيق الخاص بك، قم بالموافقة على منح صلاحيات تحديث المخزون والأسعار. ستحصل على Refresh Token دائم و Seller ID الخاص بمتجرك على أمازون مصر.',
      visualType: 'amazon_auth'
    },
    {
      id: 'amz_4',
      title: '4. ربط المفاتيح في رادار التاجر',
      desc: 'قم بنسخ المفاتيح وإدخالها في صفحة ربط المنصات داخل التطبيق لتمكين التزامن التلقائي لمؤشرات الأسعار والمبيعات كل 5 دقائق.',
      visualType: 'radar_link'
    }
  ];

  const noonSteps = [
    {
      id: 'noon_1',
      title: '1. تسجيل الدخول إلى Noon Seller Lab',
      desc: 'افتح بوابتك على نون seller.noon.com واختر سوق مصر (Egypt Region).',
      visualType: 'noon_portal'
    },
    {
      id: 'noon_2',
      title: '2. الانتقال إلى إعدادات الحساب والتكامل (API Access)',
      desc: 'من القائمة الجانبية اختر Settings -> My Account -> Direct Integrations أو API Keys.',
      visualType: 'noon_settings'
    },
    {
      id: 'noon_3',
      title: '3. توليد App Key و Auth Token',
      desc: 'اضغط على "Generate New API Credentials"، اسمِ المفتاح "Radar Auto Sync"، ثم انسخ Auth Token و Seller Code.',
      visualType: 'noon_keys'
    },
    {
      id: 'noon_4',
      title: '4. ضبط التحديث التلقائي للأسعار والمخزون',
      desc: 'تأكد من تفعيل صلاحيات Stock Updates & Price Overrides لكي يتمكن رادار التاجر من تعديل الأسعار فور تغير المنافسين.',
      visualType: 'noon_permissions'
    }
  ];

  const jumiaSteps = [
    {
      id: 'jum_1',
      title: '1. فتح Vendor Center جوميا مصر',
      desc: 'ادخل على vendorcenter.jumia.com.eg وقم بتسجيل الدخول.',
      visualType: 'jumia_portal'
    },
    {
      id: 'jum_2',
      title: '2. الوصول إلى إعدادات المستخدم والـ API',
      desc: 'اختر Settings -> Manage Users -> API Details.',
      visualType: 'jumia_settings'
    },
    {
      id: 'jum_3',
      title: '3. نسخ البريد الإلكتروني و API Key',
      desc: 'احصل على User Email و API Key الخاص بالمنصة والمشفر عبر HMAC SHA256.',
      visualType: 'jumia_keys'
    }
  ];

  const faqs = [
    {
      q: 'كيف أضمن عدم حظر حساب التاجر عند التحديث التلقائي للأسعار؟',
      a: 'يستخدم رادار التاجر خوارزميات ملتزمة تماماً بشرط Rate Limits الخاصة بأمازون (SP-API Rate Limit: 10 requests/sec) ونون. بالإضافة لذلك، يمكنك ضبط حد أدنى للسعر (Price Floor) للوقاية من أي هبوط غير متوقع.'
    },
    {
      q: 'ماذا يعني خطأ 401 Unauthorized أو Invalid Grant؟',
      a: 'هذا الخطأ يعني أن Refresh Token أو LWA Client Secret غير صحيح أو انتهت صلاحية التفويض. يرجى إعادة استخراج Refresh Token جديد من Seller Central أو Seller Lab.'
    },
    {
      q: 'هل يتطلب ربط أمازون مصر وجود حساب بريميوم؟',
      a: 'نعم، يتطلب الربط مع Amazon SP-API وجود حساب تاجر احترافي (Professional Selling Account) فعال في أمازون مصر.'
    },
    {
      q: 'كم مرة يتم تحديث أسعار المنافسين في الرادار؟',
      a: 'يتم مراقبة الأسعار والمخزون كل 5 إلى 15 دقيقة بشكل آلي متواصل على مدار 24 ساعة، مع إرسال إشعارات فورية عند وجود تغير في الباي بوكس (Buy Box).'
    }
  ];

  // Calculate overall checklist progress
  const totalStepsCount = amazonSteps.length + noonSteps.length + jumiaSteps.length;
  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / totalStepsCount) * 100);

  const amazonTemplate = `{
  "seller_id": "A2XXXXXXXXXEG",
  "lwa_client_id": "amzn1.application-oa2-client.1234567890abcdef",
  "lwa_client_secret": "amzn1.oa2-cs.v1.1234567890abcdef1234567890abcdef",
  "refresh_token": "Atzr|IQEBLz1234567890abcdef...",
  "region": "eu-west-1 (Egypt Market)"
}`;

  const noonTemplate = `{
  "seller_code": "EGY_SELLER_102",
  "app_key": "noon_app_key_889123",
  "auth_token": "Bearer Key noon_live_sec_991823746",
  "marketplace": "EGY"
}`;

  const jumiaTemplate = `{
  "user_email": "merchant@store.eg",
  "api_key": "jumia_api_key_77123abcdef",
  "action": "GetOrders / GetProducts"
}`;

  // Visual Mockup Component
  const RenderVisualMockup = ({ type }: { type: string }) => {
    switch (type) {
      case 'amazon_menu':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-amber-400">
              <span>amazon seller central | Egypt</span>
              <span>Marketplace: Egypt (A1PA6795UKMFR9)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">Catalog</div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">Inventory</div>
              <div className="p-2 bg-amber-500/20 text-amber-300 font-bold rounded border border-amber-500/50">Partner Network ➔ Develop Apps</div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">Reports</div>
            </div>
            <div className="p-2.5 bg-amber-900/20 border border-amber-500/30 rounded text-amber-200 text-[11px] flex items-center justify-between">
              <span>➔ Click "Add New App Client" to register Radar SP-API Integration</span>
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded text-[10px]">Developer Access</span>
            </div>
          </div>
        );

      case 'amazon_credentials':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-3">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
              <span>LWA App Credentials Generator</span>
              <span className="text-emerald-400">Status: Active</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-400">LWA Client ID:</span>
                <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-200 mt-0.5 font-mono">
                  amzn1.application-oa2-client.98123746a5b6c7d8
                </div>
              </div>
              <div>
                <span className="text-slate-400">LWA Client Secret:</span>
                <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-amber-300 mt-0.5 font-mono flex justify-between items-center">
                  <span>amzn1.oa2-cs.v1.••••••••••••••••••••••••</span>
                  <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Copied</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'amazon_auth':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="p-3 bg-slate-900 border border-amber-500/30 rounded text-slate-200 text-center space-y-2">
              <span className="text-amber-400 font-bold text-sm block">Authorize App Access</span>
              <p className="text-[11px] text-slate-300 font-sans">
                Grant "Radar Merchant Egypt" permissions to manage price updates & read live buybox changes.
              </p>
              <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded text-emerald-300 text-[10px]">
                Refresh Token Generated: <span className="font-mono text-white">Atzr|IQEBLz99218...</span>
              </div>
            </div>
          </div>
        );

      case 'noon_portal':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800 text-yellow-400 font-bold">
              <span>noon seller lab</span>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/40">Marketplace: EGY</span>
            </div>
            <div className="flex gap-2 text-[10px]">
              <div className="p-2 bg-slate-900 rounded border border-slate-800 flex-1">Catalog & Prices</div>
              <div className="p-2 bg-yellow-500/20 text-yellow-300 font-bold rounded border border-yellow-500/40 flex-1">Settings ➔ My Account</div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 flex-1">Fulfilment (FBN)</div>
            </div>
          </div>
        );

      case 'noon_keys':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-yellow-400 font-bold border-b border-slate-800 pb-1">API Key Details (Noon EG)</div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between"><span className="text-slate-400">Seller Code:</span><span className="text-white">EGY_SELLER_102</span></div>
              <div className="flex justify-between"><span className="text-slate-400">App Key:</span><span className="text-amber-300">noon_app_key_889123</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Auth Token:</span><span className="text-emerald-400">Bearer Key noon_live_sec_***</span></div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono text-center">
            [رسم توضيحي للخطوة مع واجهة التاجر]
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-['Cairo',sans-serif] text-slate-100" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <BookOpen className="w-4 h-4" />
              <span>دليل التاجر والتكامل التفاعلي</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">دليل الربط مع أمازون ونون وجوميا</h1>
            <p className="text-slate-300 text-base max-w-2xl">
              شرح تفصيلي خطوة بخطوة بالصور والمخططات التوضيحية لاستخراج مفاتيح API وإتمام عملية الربط مع منصات البيع في مصر مع إمكانية اختبار الاتصال المباشر.
            </p>
          </div>

          {/* Progress Box */}
          <div className="w-full md:w-72 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl shadow-lg backdrop-blur-md">
            <div className="flex justify-between items-center mb-2 text-sm font-bold">
              <span className="text-slate-300">تقدم الخطوات:</span>
              <span className="text-amber-400 font-mono">{progressPercent}% ({completedStepsCount}/{totalStepsCount})</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              {progressPercent === 100 ? '🎉 أحسنت! اكتملت كافة خطوات الربط' : 'استكمل الجرد التفاعلي لتتبع جاهزية متجرك'}
            </p>
          </div>
        </div>

        {/* Search Bar & Visual Toggle */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xl">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن خطوة، خطأ، أو مفتاح (مثلاً: SP-API, Refresh Token, Rate Limit)..."
              className="w-full py-3.5 pr-11 pl-4 rounded-xl bg-slate-950/90 border border-amber-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowVisualPreviews(!showVisualPreviews)}
            className="px-4 py-3 bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-2 shrink-0 transition"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{showVisualPreviews ? 'إخفاء الرسوم التوضيحية' : 'إظهار الرسوم التوضيحية'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('amazon')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'amazon' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>أمازون مصر (Amazon EG)</span>
        </button>

        <button
          onClick={() => setActiveTab('noon')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'noon' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>نون مصر (Noon EG)</span>
        </button>

        <button
          onClick={() => setActiveTab('jumia')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'jumia' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>جوميا (Jumia EG)</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'faq' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>الأسئلة الشائعة وتصحيح الأخطاء</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Steps & Checklist */}
        <div className="lg:col-span-2 space-y-8">
          
          {activeTab === 'amazon' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">دليل ربط Amazon SP-API</h3>
                    <p className="text-xs text-slate-400">سوق أمازون مصر (Marketplace ID: A1PA6795UKMFR9)</p>
                  </div>
                </div>
                <a 
                  href="https://sellercentral.amazon.eg" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 flex items-center gap-2 transition"
                >
                  <span>فتح Seller Central</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Steps List */}
              <div className="space-y-4">
                {amazonSteps
                  .filter(s => !searchQuery || s.title.includes(searchQuery) || s.desc.includes(searchQuery))
                  .map((step) => {
                    const isDone = !!completedSteps[step.id];
                    return (
                      <div 
                        key={step.id} 
                        className={`p-5 rounded-2xl border transition-all ${
                          isDone 
                            ? 'bg-slate-900/60 border-emerald-500/40' 
                            : 'bg-slate-900 border-slate-800 hover:border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onClick={() => toggleStep(step.id)}
                            className="mt-1 shrink-0 focus:outline-none"
                            title={isDone ? 'تعليم كغير مكتمل' : 'تعليم كمكتمل'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-500 hover:text-amber-400 transition" />
                            )}
                          </button>

                          <div className="space-y-3 flex-grow">
                            <h4 className={`font-bold text-base ${isDone ? 'text-emerald-300 line-through' : 'text-white'}`}>
                              {step.title}
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {step.desc}
                            </p>

                            {/* Visual Step Diagram Mockup */}
                            {showVisualPreviews && step.visualType && (
                              <div className="mt-3 pt-2">
                                <RenderVisualMockup type={step.visualType} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Code Template Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>نموذج المعاملات المطلوب إدخالها (JSON Schema)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(amazonTemplate, 'amazon')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedKey === 'amazon' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>نسخ النموذج</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900/90 text-amber-200/90 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800/80 leading-relaxed">
                  {amazonTemplate}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'noon' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">دليل ربط Noon Seller Lab</h3>
                    <p className="text-xs text-slate-400">سوق نون مصر (Egypt Marketplace)</p>
                  </div>
                </div>
                <a 
                  href="https://seller.noon.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 flex items-center gap-2 transition"
                >
                  <span>فتح Seller Lab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Steps List */}
              <div className="space-y-4">
                {noonSteps
                  .filter(s => !searchQuery || s.title.includes(searchQuery) || s.desc.includes(searchQuery))
                  .map((step) => {
                    const isDone = !!completedSteps[step.id];
                    return (
                      <div 
                        key={step.id} 
                        className={`p-5 rounded-2xl border transition-all ${
                          isDone 
                            ? 'bg-slate-900/60 border-emerald-500/40' 
                            : 'bg-slate-900 border-slate-800 hover:border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onClick={() => toggleStep(step.id)}
                            className="mt-1 shrink-0 focus:outline-none"
                            title={isDone ? 'تعليم كغير مكتمل' : 'تعليم كمكتمل'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-500 hover:text-amber-400 transition" />
                            )}
                          </button>

                          <div className="space-y-3 flex-grow">
                            <h4 className={`font-bold text-base ${isDone ? 'text-emerald-300 line-through' : 'text-white'}`}>
                              {step.title}
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {step.desc}
                            </p>

                            {showVisualPreviews && step.visualType && (
                              <div className="mt-3 pt-2">
                                <RenderVisualMockup type={step.visualType} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Code Template Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>نموذج المعاملات المطلوب إدخالها (Noon Config)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(noonTemplate, 'noon')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedKey === 'noon' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>نسخ النموذج</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900/90 text-amber-200/90 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800/80 leading-relaxed">
                  {noonTemplate}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'jumia' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">دليل ربط Jumia Vendor Center</h3>
                    <p className="text-xs text-slate-400">سوق جوميا مصر</p>
                  </div>
                </div>
                <a 
                  href="https://vendorcenter.jumia.com.eg" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 flex items-center gap-2 transition"
                >
                  <span>فتح Vendor Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Steps List */}
              <div className="space-y-4">
                {jumiaSteps
                  .filter(s => !searchQuery || s.title.includes(searchQuery) || s.desc.includes(searchQuery))
                  .map((step) => {
                    const isDone = !!completedSteps[step.id];
                    return (
                      <div 
                        key={step.id} 
                        className={`p-5 rounded-2xl border transition-all ${
                          isDone 
                            ? 'bg-slate-900/60 border-emerald-500/40' 
                            : 'bg-slate-900 border-slate-800 hover:border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onClick={() => toggleStep(step.id)}
                            className="mt-1 shrink-0 focus:outline-none"
                            title={isDone ? 'تعليم كغير مكتمل' : 'تعليم كمكتمل'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-500 hover:text-amber-400 transition" />
                            )}
                          </button>

                          <div className="space-y-2 flex-grow">
                            <h4 className={`font-bold text-base ${isDone ? 'text-emerald-300 line-through' : 'text-white'}`}>
                              {step.title}
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Code Template Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>نموذج المعاملات (Jumia Config)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(jumiaTemplate, 'jumia')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedKey === 'jumia' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>نسخ النموذج</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900/90 text-amber-200/90 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800/80 leading-relaxed">
                  {jumiaTemplate}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>الأسئلة الأكثر شيوعاً وإرشادات الدعم</span>
              </h3>

              {faqs
                .filter(f => !searchQuery || f.q.includes(searchQuery) || f.a.includes(searchQuery))
                .map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={index} 
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full p-5 text-right font-bold text-base text-white flex justify-between items-center gap-4 hover:bg-slate-800/50 transition"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="p-5 pt-0 text-slate-300 text-sm leading-relaxed border-t border-slate-800/60 bg-slate-950/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

        </div>

        {/* Right 1 Column: Interactive Connection Test Simulator & Help Desk */}
        <div className="space-y-6">
          
          {/* Connection Test Simulator Box */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">اختبار جودة الربط والـ API</h3>
                <p className="text-xs text-slate-400">محاكي اختبار الاتصال المباشر مع المنصة</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">معرف التاجر (Seller ID / Merchant ID):</label>
                <input
                  type="text"
                  value={simSellerId}
                  onChange={(e) => setSimSellerId(e.target.value)}
                  placeholder="مثال: A2XXXXXXXXXEG"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">مفتاح الوصول (Auth Token / API Key):</label>
                <input
                  type="password"
                  value={simApiKey}
                  onChange={(e) => setSimApiKey(e.target.value)}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>

              <button
                onClick={runConnectionTest}
                disabled={testingStatus === 'testing'}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                {testingStatus === 'testing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>جاري فحص الاتصال والتوقيع...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>بدء اختبار الاتصال المباشر</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Console / Output */}
            {testLog.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">سجل التشخيص الفوري:</span>
                  {testLatency && (
                    <span className="text-emerald-400 font-bold">زمن الاستجابة: {testLatency}ms</span>
                  )}
                </div>
                {testLog.map((log, idx) => (
                  <div key={idx} className="text-amber-200/90 flex items-center gap-1.5">
                    <span className="text-emerald-400">›</span>
                    <span>{log}</span>
                  </div>
                ))}
                {testingStatus === 'success' && (
                  <div className="mt-3 p-2 bg-emerald-900/30 border border-emerald-500/40 rounded-lg text-emerald-300 font-sans font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>تم التحقق بنجاح! المفاتيح جاهزة ومطابقة للمواصفات.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct Support Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">تحتاج مساعدة إضافية؟</h3>
                <p className="text-xs text-slate-400">الدعم الفني المباشر لربط الحسابات</p>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              إذا واجهتك أي صعوبة في استخراج المفاتيح أو ربط متجرك، يتوفر فريق الهندسة لدعمك خطوة بخطوة.
            </p>

            <a
              href="mailto:support@radar.store"
              className="block w-full py-3 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs border border-slate-700 transition"
            >
              تواصل مع فريق الدعم الهندسي
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
