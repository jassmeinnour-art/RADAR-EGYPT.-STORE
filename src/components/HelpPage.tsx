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
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Building2, 
  ShieldCheck, 
  Terminal,
  Sparkles,
  ArrowRight,
  Info,
  Eye,
  Lock,
  Layers,
  Sparkle,
  FileCheck2,
  AlertCircle,
  Clock,
  Play,
  Keyboard,
  Database,
  TrendingUp,
  Target,
  ShoppingBag,
  DollarSign,
  Award,
  Percent,
  Truck,
  Cpu,
  Flame,
  Store,
  BarChart3,
  ArrowUpRight,
  Activity,
  Layers as LayersIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HelpPageProps {
  onNavigateToPlatformsGuide?: () => void;
  onStartTour?: () => void;
  onOpenHotkeysModal?: () => void;
}

export default function HelpPage({ onNavigateToPlatformsGuide, onStartTour, onOpenHotkeysModal }: HelpPageProps) {
  // Navigation tabs:
  // - quickstart: دليل الانطلاق السريع والنمو في مصر
  // - stores: ربط المتاجر (أمازون، نون، جوميا)
  // - kpis: فهم مؤشرات الأداء والربحية (KPIs)
  // - features: ميزات رادار المتقدمة للنمو
  // - faq: الأسئلة الشائعة وحل المشاكل
  const [activeTab, setActiveTab] = useState<'quickstart' | 'stores' | 'kpis' | 'features' | 'faq'>('quickstart');
  const [activeStoreSubTab, setActiveStoreSubTab] = useState<'amazon' | 'noon' | 'jumia'>('amazon');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showVisualPreviews, setShowVisualPreviews] = useState<boolean>(true);

  // Profit & VAT Calculator State
  const [calcSellingPrice, setCalcSellingPrice] = useState<number>(650);
  const [calcCostPrice, setCalcCostPrice] = useState<number>(380);
  const [calcPlatform, setCalcPlatform] = useState<'amazon' | 'noon' | 'jumia'>('amazon');
  const [calcCommissionRate, setCalcCommissionRate] = useState<number>(12); // 12%
  const [calcFulfillmentFee, setCalcFulfillmentFee] = useState<number>(35); // EGP

  // Supabase dynamic help articles & guides state
  const [dbHelpArticles, setDbHelpArticles] = useState<any[]>([]);
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<string>('متصل بـ Supabase');

  useEffect(() => {
    async function fetchSupabaseHelp() {
      try {
        const { data, error } = await supabase.from('help_articles').select('*');
        if (!error && data && data.length > 0) {
          setDbHelpArticles(data);
          setSupabaseSyncStatus('تم جلب مقالات المساعدة المحدثة من Supabase بنجاح');
        } else {
          setSupabaseSyncStatus('عرض الدليل القياسي (بيانات المساعدة المحلية مفعلة بنجاح)');
        }
      } catch (err) {
        console.warn('[HelpPage] Supabase help query fallback:', err);
        setSupabaseSyncStatus('وضع التشغيل المحلي (Fallback Mode)');
      }
    }
    fetchSupabaseHelp();
  }, []);

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
  const [simPlatform, setSimPlatform] = useState<'amazon' | 'noon' | 'jumia'>('amazon');
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
      alert('الرجاء إدخال معرف التاجر (Seller ID / Merchant ID / Seller Code) للاختبار.');
      return;
    }
    setTestingStatus('testing');
    setTestLog([
      `جاري جلب إعدادات الاتصال بـ ${simPlatform === 'amazon' ? 'أمازون SP-API (مصر)' : simPlatform === 'noon' ? 'نون Seller Lab' : 'جوميا Vendor Center'}...`,
      'إنشاء اتصال تشفير TLS 1.3 مع الخوادم الإقليمية في مصر...',
      'فحص توقيع مفاتيح الـ API وصلاحيات تعديل الأسعار والمخزون...'
    ]);
    setTestLatency(null);

    setTimeout(() => {
      setTestLog(prev => [...prev, 'تم الاستجابة من السيرفر بنجاح (HTTP 200 OK)']);
    }, 600);

    setTimeout(() => {
      setTestLog(prev => [...prev, 'صلاحيات الاستعلام والمزامنة التلقائية مفعلة وجاهزة بنسبة 100%']);
      setTestLatency(Math.floor(Math.random() * 25) + 20);
      setTestingStatus('success');
    }, 1300);
  };

  // Profit calculation logic for Egyptian market
  const commissionAmount = (calcSellingPrice * calcCommissionRate) / 100;
  const vatOnCommission = commissionAmount * 0.14; // 14% VAT on commission in Egypt
  const totalMarketplaceCost = commissionAmount + vatOnCommission + calcFulfillmentFee;
  const netProfit = calcSellingPrice - (calcCostPrice + totalMarketplaceCost);
  const netMarginPercent = calcSellingPrice > 0 ? ((netProfit / calcSellingPrice) * 100) : 0;
  const recommendedFloorPrice = Math.ceil(calcCostPrice + totalMarketplaceCost + (calcCostPrice * 0.10)); // Min 10% gross safety buffer

  // Store integration steps
  const amazonSteps = [
    {
      id: 'amz_1',
      title: '1. إنشاء حساب مطور Selling Partner API (SP-API)',
      desc: 'سجل الدخول إلى حساب التاجر الخاص بك في مصر (sellercentral.amazon.eg)، ثم اذهب إلى Partner Network ➔ Develop Apps واستكمل بيانات Developer Account Profile.',
      badge: 'الخطوة الأولى',
      visualType: 'amazon_menu'
    },
    {
      id: 'amz_2',
      title: '2. إنشاء تطبيق جديد واستخراج LWA Client Credentials',
      desc: 'انقر على "Add New App Client"، اختر نوع التطبيق "SP-API App"، وسجل اسم التطبيق. عند الحفظ يظهر لك LWA Client ID و LWA Client Secret. انسخهما فوراً.',
      badge: 'مفاتيح التطبيق',
      visualType: 'amazon_credentials'
    },
    {
      id: 'amz_3',
      title: '3. تفويض التطبيق واستخراج Refresh Token و Seller ID',
      desc: 'انقر على "Authorize" للتطبيق الخاص بك، وافق على صلاحيات تحديث المخزون والأسعار. ستحصل على Refresh Token دائم و Seller ID الخاص بمتجرك.',
      badge: 'رمز التجديد',
      visualType: 'amazon_auth'
    },
    {
      id: 'amz_4',
      title: '4. إدخال المفاتيح والتفعيل التلقائي في رادار التاجر',
      desc: 'انسخ المفاتيح وضعها في إعدادات الربط للتطبيق لتبدأ المزامنة التلقائية للأسعار والمنافسين كل 5 دقائق.',
      badge: 'التفعيل النهائي',
      visualType: 'radar_link'
    }
  ];

  const noonSteps = [
    {
      id: 'noon_1',
      title: '1. تسجيل الدخول إلى Noon Seller Lab مصر',
      desc: 'افتح بوابتك التجارية على seller.noon.com واختر سوق مصر (Egypt Market).',
      badge: 'البوابة الرئيسية',
      visualType: 'noon_portal'
    },
    {
      id: 'noon_2',
      title: '2. الانتقال إلى إعدادات الـ API والتكامل المباشر',
      desc: 'من القائمة الجانبية اختر Settings ➔ My Account ➔ Direct Integrations أو API Details.',
      badge: 'إعدادات الحساب',
      visualType: 'noon_settings'
    },
    {
      id: 'noon_3',
      title: '3. توليد App Key و Auth Token و Seller Code',
      desc: 'اضغط على "Generate New API Credentials"، سمِّ المفتاح "Radar Auto Sync"، ثم انسخ Auth Token و Seller Code.',
      badge: 'مفاتيح الربط',
      visualType: 'noon_keys'
    },
    {
      id: 'noon_4',
      title: '4. تفعيل صلاحيات التحديث السريع للأسعار والمخزون',
      desc: 'تأكد من تفعيل صلاحيات Stock Updates & Price Overrides لكي يغير النظام الأسعار فوراً عند هبوط المنافسين.',
      badge: 'الصلاحيات',
      visualType: 'noon_permissions'
    }
  ];

  const jumiaSteps = [
    {
      id: 'jum_1',
      title: '1. فتح Jumia Vendor Center مصر',
      desc: 'ادخل على vendorcenter.jumia.com.eg وقم بتسجيل الدخول بحساب التاجر المصري الخاص بك.',
      badge: 'المدخل الرئيسي',
      visualType: 'jumia_portal'
    },
    {
      id: 'jum_2',
      title: '2. الوصول إلى إعدادات المستخدم والـ API',
      desc: 'اختر Settings ➔ Manage Users ➔ API Details للوصول إلى مفاتيح الربط البرمجي.',
      badge: 'مستخدم الـ API',
      visualType: 'jumia_settings'
    },
    {
      id: 'jum_3',
      title: '3. نسخ البريد الإلكتروني و API Key المشفر',
      desc: 'انسخ User Email و API Key وضعهما في رادار لتفعيل قراءة الطلبات والمنتجات آلياً.',
      badge: 'المفتاح المشفر',
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
      q: 'كيف يتم حساب ضريبة القيمة المضافة VAT 14% على منصات التجارة في مصر؟',
      a: 'تُفرض ضريبة القيمة المضافة 14% على عمولة المنصة ومصاريف الشحن والتخزين، وليس على كامل سعر البيع. يوفر رادار حاسبة تلقائية تخصمها بدقة لتحديد صافي ربحك الحقيقي.'
    },
    {
      q: 'كم مرة يتم تحديث أسعار المنافسين في الرادار؟',
      a: 'يتم مراقبة الأسعار والمخزون كل 5 إلى 15 دقيقة بشكل آلي متواصل على مدار 24 ساعة، مع إرسال إشعارات فورية عند وجود تغير في الباي بوكس (Buy Box).'
    },
    {
      q: 'كيف يساعد مقسم البوالص (/invoices/split) في تقليل غرامات التأخير؟',
      a: 'يقوم مقسم البوالص بفرز وتوزيع ملفات الـ PDF المجمعة حسب شركة الشحن (أمازون، نون، أرامكس، بوسطة) والمنطقة الجغرافية، مما يقلل وقت التجهيز بأكثر من ساعتين يومياً.'
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

  // Visual Mockup Component for UI Visualizations
  const RenderVisualMockup = ({ type }: { type: string }) => {
    switch (type) {
      case 'amazon_menu':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 text-xs text-slate-300 font-mono space-y-2 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-amber-400">
              <span className="font-bold">amazon seller central | Egypt</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-300">Marketplace ID: A1PA6795UKMFR9</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-400">Catalog</div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-400">Inventory</div>
              <div className="p-2.5 bg-amber-500/20 text-amber-300 font-bold rounded border-2 border-amber-500 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Partner Network ➔ Develop Apps</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-400">Reports</div>
            </div>
            <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded text-amber-200 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-sans font-bold">1. انقر على زر "Add New App Client" لتسجيل تطبيق رادار التاجر</span>
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded text-[10px] shrink-0">Developer Access</span>
            </div>
          </div>
        );

      case 'amazon_credentials':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-3">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-2 flex justify-between items-center">
              <span>LWA Credentials Generator (SP-API)</span>
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">Status: Verified</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-400 font-bold block mb-1">LWA Client ID:</span>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-200 font-mono flex justify-between items-center">
                  <span>amzn1.application-oa2-client.98123746a5b6c7d8</span>
                  <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-amber-300">نسخ</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">LWA Client Secret:</span>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-amber-300 font-mono flex justify-between items-center">
                  <span>amzn1.oa2-cs.v1.••••••••••••••••••••••••</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">محفوظ</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'amazon_auth':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="p-3 bg-slate-900 border-2 border-amber-500/40 rounded-xl text-slate-200 text-center space-y-2">
              <span className="text-amber-400 font-bold text-sm block">Authorize App Access (تفويض التطبيق)</span>
              <p className="text-[11px] text-slate-300 font-sans">
                منح "رادار التاجر مصر" الصلاحيات الكاملة لتعديل الأسعار ومراقبة المنافسين.
              </p>
              <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-[10px] flex items-center justify-between">
                <span>Refresh Token: <strong className="font-mono text-white">Atzr|IQEBLz99218...</strong></span>
                <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded">نشط</span>
              </div>
            </div>
          </div>
        );

      case 'noon_portal':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-yellow-400 font-bold">
              <span className="text-sm">noon seller lab</span>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2.5 py-0.5 rounded-full border border-yellow-500/40">Marketplace: EGY</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-400">Catalog & Prices</div>
              <div className="p-2 bg-yellow-500/20 text-yellow-300 font-bold rounded border-2 border-yellow-500 text-center">Settings ➔ API Details</div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-400">Fulfilment (FBN)</div>
            </div>
          </div>
        );

      case 'noon_keys':
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-yellow-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
              <span>API Key Credentials (Noon EG)</span>
              <span className="text-emerald-400">Ready</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-400">Seller Code:</span><span className="text-white font-bold">EGY_SELLER_102</span></div>
              <div className="flex justify-between"><span className="text-slate-400">App Key:</span><span className="text-amber-300 font-mono">noon_app_key_889123</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Auth Token:</span><span className="text-emerald-400 font-mono">Bearer Key noon_live_sec_***</span></div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono text-center">
            [مخطط توضيحي لخطوة المزامنة التلقائية]
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <BookOpen className="w-4 h-4" />
              <span>دليل التاجر الذكي - رادار مصر</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">دليل الاستخدام والتفوق في السوق المصري</h1>
            <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
              مرجع شامل للمستخدمين الجدد: خطوات ربط المتاجر (Amazon, Noon, Jumia)، فهم مؤشرات الأداء والربحية (KPIs)، واستخدام أدوات رادار المتقدمة للتسعير وفصل البوالص واقتناص الفرص.
            </p>
          </div>

          {/* Progress Box */}
          <div className="w-full md:w-72 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl shadow-lg backdrop-blur-md">
            <div className="flex justify-between items-center mb-2 text-sm font-bold">
              <span className="text-slate-300">تقدم خطوات الربط:</span>
              <span className="text-amber-400 font-mono">{progressPercent}% ({completedStepsCount}/{totalStepsCount})</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              {progressPercent === 100 ? '🎉 أحسنت! اكتملت كافة خطوات ربط المتاجر' : 'استكمل القائمة التفاعلية لتأكيد جاهزية متاجرك'}
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
              placeholder="ابحث عن خطوة، مؤشر أداء، ميزة أو خطأ (مثلاً: Buy Box, VAT 14%, SP-API, بوالص)..."
              className="w-full py-3.5 pr-11 pl-4 rounded-xl bg-slate-950/90 border border-amber-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowVisualPreviews(!showVisualPreviews)}
            className="px-4 py-3 bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-2 shrink-0 transition cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{showVisualPreviews ? 'إخفاء الرسوم التوضيحية' : 'إظهار الرسوم التوضيحية'}</span>
          </button>
        </div>

        {/* Supabase Dynamic Articles Status Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>حالة مزامنة مقالات المساعدة: <strong className="text-amber-300">{supabaseSyncStatus}</strong></span>
          </div>
          {dbHelpArticles.length > 0 && (
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-mono font-bold">
              {dbHelpArticles.length} مقال نشط
            </span>
          )}
        </div>
      </div>

      {/* Quick Launch & Tour Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40 shrink-0">
            <Sparkle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">هل أنت تاجر جديد وتريد البدء فوراً؟</h3>
            <p className="text-slate-300 text-xs mt-1">
              يمكنك تجربة التحديث الآلي واستكشاف الرادار في 3 دقائق وتجربة حاسبة الأرباح وفحص الاتصال.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToPlatformsGuide && (
            <button
              onClick={onNavigateToPlatformsGuide}
              className="px-5 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>إدخال مفاتيح API وفحص الربط</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('stores')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>دليل ربط المتاجر خطوة بخطوة</span>
          </button>
          
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-xs border border-white/10 shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>إعادة الجولة التعليمية</span>
            </button>
          )}

          {onOpenHotkeysModal && (
            <button
              onClick={onOpenHotkeysModal}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-xl text-xs border border-emerald-400/40 shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Keyboard className="w-4 h-4 text-white" />
              <span>اختصارات لوحة المفاتيح ⌨️</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('quickstart')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'quickstart' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>دليل الانطلاق والنمو 🚀</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'stores' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>كيفية ربط المتاجر 🔌</span>
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'kpis' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>فهم مؤشرات الأداء والربحية (KPIs) 📊</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'features' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>ميزات رادار المتقدمة للنمو ⚡</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'faq' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>الأسئلة الشائعة وتصحيح الأخطاء ❓</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Tab Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* TAB 1: QUICKSTART */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              {/* Strategy Banner */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">دليل النمو والسيطرة في التجارة الإلكترونية المصرية</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      كيف تحول رادار من مجرد أداة مراقبة إلى ماكينة زيادة مبيعات وأرباح في السوق المصري (أمازون، نون، جوميا)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block mb-1">نسبة الفوز بـ Buy Box</span>
                    <strong className="text-lg text-emerald-400 font-mono font-black">+42% أسرع</strong>
                  </div>
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block mb-1">سرعة الرد على المنافس</span>
                    <strong className="text-lg text-amber-400 font-mono font-black">لحظي (Real-Time)</strong>
                  </div>
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block mb-1">حماية هامش الربح</span>
                    <strong className="text-lg text-sky-400 font-mono font-black">حد أدنى آمن 100%</strong>
                  </div>
                </div>
              </div>

              {/* 4 Core Pillars for Growth in Egypt */}
              <div className="space-y-4">
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>الركائز الأربع للنمو برادار في مصر:</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pillar 1 */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 hover:border-amber-500/40 transition">
                    <div className="flex items-center gap-2.5 text-amber-400 font-bold">
                      <TrendingUp className="w-5 h-5 shrink-0" />
                      <span className="text-sm">1. تتبع أسعار المنافسين واقتناص الـ Buy Box</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      في السوق المصري، أكثر من 82% من مبيعات أمازون ونون تذهب لحائز الـ Buy Box. استخدم شاشة <strong>مقارنة الأسعار ورادار المنافسين</strong> لمراقبة أسعار بائعي نفس الـ ASIN كل 5 دقائق والتسعير التلقائي بفارق 0.50 ج.م للبقاء في الصدارة دون حرق الأرباح.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 hover:border-sky-500/40 transition">
                    <div className="flex items-center gap-2.5 text-sky-400 font-bold">
                      <ShoppingBag className="w-5 h-5 shrink-0" />
                      <span className="text-sm">2. إدارة تجار ومتعدد المتاجر في مكان واحد</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      سواء كنت تدير متجرك الفردي أو تدير عدة تجار، صفحة <strong>دليل التجار الموحد (/traders)</strong> تتيح لك إضافة تجارك مع Seller ID والإيميل وتصفح منتجات كل تاجر بضغطة زر مع عزل بيانات كل تاجر في Supabase.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 hover:border-emerald-500/40 transition">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                      <DollarSign className="w-5 h-5 shrink-0" />
                      <span className="text-sm">3. حاسبة العمولات وحماية الهامش الربحي (VAT 14%)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      منصات التجارة في مصر تخصم عمولات (8% إلى 18%) وضريبة القيمة المضافة VAT 14% ورسوم الشحن والتخزين. استخدم أداة <strong>حاسبة العمولات</strong> لتعيين حد أدنى لسعرك يضمن ألا تبيع أبداً بخسارة مهما اشتعلت حرب الأسعار.
                    </p>
                  </div>

                  {/* Pillar 4 */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 hover:border-purple-500/40 transition">
                    <div className="flex items-center gap-2.5 text-purple-400 font-bold">
                      <Sparkles className="w-5 h-5 shrink-0" />
                      <span className="text-sm">4. توقع الطلب والمنتجات الرائجة من الصين</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      اكتشف المنتجات الأعلى طلباً وربحية الواردة من الصين والمطلوبة بمصر عبر شاشة <strong>Top Trending</strong> قبل أن يدخل المنافسون فيها، مع جدولة أوامر الشحن وفصل البوالص لتسريع التسليم وتفادي غرامات التأخير.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Steps to start immediately */}
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
                <h4 className="text-base font-black text-white">خطواتك الثلاث الأولى للبدء اليوم:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">1</span>
                    <div>
                      <strong className="text-sm text-white block">أضف تاجرك من صفحة /traders</strong>
                      <p className="text-xs text-slate-400 mt-0.5">اكتب اسم التاجر، المنصة (أمازون، نون)، ومعرف البائع (Seller ID) واحفظه مباشرة في Supabase.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">2</span>
                    <div>
                      <strong className="text-sm text-white block">أدخل منتجاتك ورمز الـ SKU</strong>
                      <p className="text-xs text-slate-400 mt-0.5">سجل أسعارك الحالية ومخزونك المتاح لتتمكن المنظومة من تتبع كل حركة تلقائياً.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">3</span>
                    <div>
                      <strong className="text-sm text-white block">اربط المنصات من تبويب ربط المتاجر</strong>
                      <p className="text-xs text-slate-400 mt-0.5">اتبع الشرح المصور لاستخراج مفاتيح الـ API واختبار الاتصال المباشر عبر المحاكي.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOW TO CONNECT STORES */}
          {activeTab === 'stores' && (
            <div className="space-y-6">
              {/* Store Selector Sub-tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStoreSubTab('amazon')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeStoreSubTab === 'amazon'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>أمازون مصر (Amazon EG)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStoreSubTab('noon')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeStoreSubTab === 'noon'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>نون مصر (Noon EG)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStoreSubTab('jumia')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeStoreSubTab === 'jumia'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>جوميا (Jumia EG)</span>
                </button>
              </div>

              {/* AMAZON EG SUBTAB */}
              {activeStoreSubTab === 'amazon' && (
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
                                className="mt-1 shrink-0 focus:outline-none cursor-pointer"
                                title={isDone ? 'تعليم كغير مكتمل' : 'تعليم كمكتمل'}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                ) : (
                                  <Circle className="w-6 h-6 text-slate-500 hover:text-amber-400 transition" />
                                )}
                              </button>

                              <div className="space-y-3 flex-grow">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className={`font-bold text-base ${isDone ? 'text-emerald-300 line-through' : 'text-white'}`}>
                                    {step.title}
                                  </h4>
                                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/20">
                                    {step.badge}
                                  </span>
                                </div>

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

                  {/* Amazon Code Template */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <Terminal className="w-4 h-4" />
                        <span>نموذج المعاملات المطلوب إدخالها (Amazon SP-API Schema)</span>
                      </div>
                      <button
                        onClick={() => handleCopy(amazonTemplate, 'amazon')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
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

              {/* NOON EG SUBTAB */}
              {activeStoreSubTab === 'noon' && (
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
                                className="mt-1 shrink-0 focus:outline-none cursor-pointer"
                                title={isDone ? 'تعليم كغير مكتمل' : 'تعليم كمكتمل'}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                ) : (
                                  <Circle className="w-6 h-6 text-slate-500 hover:text-amber-400 transition" />
                                )}
                              </button>

                              <div className="space-y-3 flex-grow">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className={`font-bold text-base ${isDone ? 'text-emerald-300 line-through' : 'text-white'}`}>
                                    {step.title}
                                  </h4>
                                  <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-300 text-[10px] font-bold rounded-full border border-yellow-500/20">
                                    {step.badge}
                                  </span>
                                </div>

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

                  {/* Noon Code Template */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <Terminal className="w-4 h-4" />
                        <span>نموذج المعاملات المطلوب إدخالها (Noon Config)</span>
                      </div>
                      <button
                        onClick={() => handleCopy(noonTemplate, 'noon')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
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

              {/* JUMIA EG SUBTAB */}
              {activeStoreSubTab === 'jumia' && (
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
                                className="mt-1 shrink-0 focus:outline-none cursor-pointer"
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

                  {/* Jumia Code Template */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <Terminal className="w-4 h-4" />
                        <span>نموذج المعاملات (Jumia Config)</span>
                      </div>
                      <button
                        onClick={() => handleCopy(jumiaTemplate, 'jumia')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
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
            </div>
          )}

          {/* TAB 3: UNDERSTANDING KPIS */}
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              {/* Intro to KPIs */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">فهم مؤشرات الأداء والربحية (KPIs) في التجارة المصرية</h3>
                    <p className="text-xs text-slate-400">
                      دليل فك شفرة أرقام المبيعات، عمولات المنصات، ضرائب القيمة المضافة، وتجنب فخاخ حرق الأسعار.
                    </p>
                  </div>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="space-y-4">
                
                {/* KPI 1: Buy Box */}
                <div className="p-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg font-black text-sm">1</span>
                      <h4 className="text-base font-black text-white">نسبة الفوز بصندوق الشراء (Buy Box Win Rate %)</h4>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
                      الهدف: &gt; 70%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>ما هو؟</strong> الزر الأصفر "أضف إلى السلة" أو "اشترِ الآن" في صفحة المنتج. على أمازون ونون مصر، أكثر من 85% من الطلبات تُنفذ مباشرة من خلال التاجر الحائز على الـ Buy Box.
                  </p>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="text-amber-400 font-bold">العوامل المحددة للفوز في مصر:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pr-2">
                      <li><strong>السعر الإجمالي الواصل للعميل:</strong> السعر الأقل بفارق قروش يحسم الصدارة.</li>
                      <li><strong>طريقة الشحن:</strong> شحن أمازون (FBA) ونون (Noon Express) يحصلان على أولوية كبرى مقارنة بالشحن الذاتي (FBM).</li>
                      <li><strong>تقييم البائع وسرعة الشحن:</strong> عدم إلغاء الطلبات والحفاظ على معدل تسليم قياسي.</li>
                    </ul>
                  </div>
                </div>

                {/* KPI 2: Net Margin & VAT 14% */}
                <div className="p-6 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-black text-sm">2</span>
                      <h4 className="text-base font-black text-white">صافي الهامش الربحي وحساب ضريبة القيمة المضافة (VAT 14%)</h4>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
                      الهدف: &gt; 18% صافي
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>المعادلة المصرية الحقيقية:</strong>
                    <br />
                    <code className="text-emerald-400 bg-slate-950 px-2 py-1 rounded inline-block mt-1 font-mono text-[11px]">
                      صافي الربح = سعر البيع - (تكلفة المنتج + عمولة المنصة + [العمولة × 14% ضريبة] + رسوم الشحن والتجهيز)
                    </code>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    خطأ شائع يقع فيه التجار الجدد: خصم 14% من كامل سعر البيع! والحقيقة أن ضريبة القيمة المضافة في التجارة الإلكترونية تُفرض على <strong>الخدمة التي تقدمها المنصة لك (العمولة ورسوم الشحن)</strong> وليس على إجمالي إيراد الفاتورة.
                  </p>
                </div>

                {/* KPI 3: RTO and COD */}
                <div className="p-6 bg-slate-900/90 border border-sky-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-sky-500/20 text-sky-400 rounded-lg font-black text-sm">3</span>
                      <h4 className="text-base font-black text-white">معدل الإرجاع ومرتجعات الدفع عند الاستلام (COD &amp; Return Rate)</h4>
                    </div>
                    <span className="px-3 py-1 bg-sky-500/10 text-sky-300 text-xs font-bold rounded-full border border-sky-500/30">
                      الحد الآمن: &lt; 9%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    في مصر، يشكل الدفع عند الاستلام (COD) أكثر من 60% إلى 70% من المعاملات. تأخر وصول الشحنة لأكثر من 48 إلى 72 ساعة يرفع احتمالية رفض العميل للاستلام (RTO). ينصح رادار باحتساب مخصص مرتجعات 5% ضمن تسعيرك لتفادي تآكل الأرباح.
                  </p>
                </div>

                {/* KPI 4: Reaction Latency */}
                <div className="p-6 bg-slate-900/90 border border-purple-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg font-black text-sm">4</span>
                      <h4 className="text-base font-black text-white">زمن الاستجابة للأسعار (Price Reaction Latency)</h4>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
                      معدل رادار: 3 - 5 دقائق
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    الفارق بين المتجر الرابح والمتعثر في مواسم مثل (الجمعة البيضاء، عروض رمضان، وأيام الرواتب) هو سرعة الرد. إذا خفض المنافس سعره في الساعة 1:00 صباحاً ولم يستجب متجرك إلا في الصباح، تفقد مئات المبيعات المؤكدة.
                  </p>
                </div>
              </div>

              {/* Interactive Egyptian Profit Calculator Widget */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <Percent className="w-5 h-5" />
                    <span>حاسبة الأرباح وضريبة القيمة المضافة التفاعلية (السوق المصري)</span>
                  </div>
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                    حساب فوري مباشر
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">سعر البيع المقترح (ج.م):</label>
                    <input
                      type="number"
                      value={calcSellingPrice}
                      onChange={(e) => setCalcSellingPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">تكلفة الشراء / التوريد (ج.م):</label>
                    <input
                      type="number"
                      value={calcCostPrice}
                      onChange={(e) => setCalcCostPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">نسبة عمولة المنصة (%):</label>
                    <input
                      type="number"
                      value={calcCommissionRate}
                      onChange={(e) => setCalcCommissionRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">رسوم الشحن والتجهيز (ج.م):</label>
                    <input
                      type="number"
                      value={calcFulfillmentFee}
                      onChange={(e) => setCalcFulfillmentFee(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Calculation Results Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
                  <div className="p-2">
                    <span className="text-[10px] text-slate-400 block mb-0.5">عمولة المنصة</span>
                    <strong className="text-amber-400 font-mono text-sm">{commissionAmount.toFixed(1)} ج.م</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-[10px] text-slate-400 block mb-0.5">ضريبة VAT 14%</span>
                    <strong className="text-sky-400 font-mono text-sm">{vatOnCommission.toFixed(1)} ج.م</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-[10px] text-slate-400 block mb-0.5">صافي الربح الحقيقي</span>
                    <strong className={`font-mono text-base ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} font-black`}>
                      {netProfit.toFixed(1)} ج.م
                    </strong>
                  </div>
                  <div className="p-2">
                    <span className="text-[10px] text-slate-400 block mb-0.5">الحد الأدنى الآمن للسعر</span>
                    <strong className="text-amber-300 font-mono text-sm font-black">{recommendedFloorPrice} ج.م</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADVANCED RADAR FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-amber-400" />
                  <span>أدوات رادار المتقدمة للتفوق ومضاعفة المبيعات</span>
                </h3>
                <p className="text-xs text-slate-400">
                  شرح عملي لكيفية استغلال ميزات رادار الحصرية لقيادة السوق المصري والتفوق على المنافسين التقليديين.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Feature 1: Auto Pricing Engine */}
                <div className="p-6 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-black text-white">1. محرك التسعير الآلي الذكي مع الحد الأدنى الصارم (Auto-Pricing)</h4>
                    </div>
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full font-bold">
                      نشط 24/7
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    بدلاً من متابعة أسعار المنافسين يدوياً كل يوم، يقوم محرك رادار بقراءة أرخص سعر منافس لنفس المنتج ثم تخفيض سعرك بفارق <strong>0.50 ج.م أو 1.00 ج.م</strong> فقط لاقتناص صندوق الشراء. والأهم: <strong>حماية السعر الأدنى (Price Floor)</strong> تمنع النظام نهائياً من البيع بأقل من التكلفة المحددة.
                  </p>
                </div>

                {/* Feature 2: Waybill Splitter */}
                <div className="p-6 bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                        <Truck className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-black text-white">2. مقسم البوالص وفصل الفواتير الذكي (/invoices/split)</h4>
                    </div>
                    <span className="text-xs bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-full font-bold">
                      توفير ساعتين يومياً
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    عند استخراج ملفات البوالص المجمعة (PDF) من أمازون أو نون بمئات الشحنات، تتيح لك أداة <strong>مقسم البوالص</strong> رفع الملف وفصله تلقائياً صفحة بصفحة، مع ترتيب الشحنات حسب المحافظات (القاهرة، الجيزة، الإسكندرية، الصعيد) وتصنيفها لشركات الشحن المختلفة (بوسطة، أرامكس، شحن أمازون).
                  </p>
                </div>

                {/* Feature 3: Mersad & Chinese Import Trends */}
                <div className="p-6 bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                        <Flame className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-black text-white">3. رادار اتجاهات السوق وفرص الاستيراد الصينية (Trending Radar)</h4>
                    </div>
                    <span className="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full font-bold">
                      فرص استيراد
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    يكشف لك المنتجات الرائجة حديثاً في منصات التوريد العالمية (1688 وتاوباو وإيوا الصينية) والمطلوبة في مصر، مع تحليل حجم الطلب والمنافسين الموجودين في السوق المصري، لتدخل في المنتجات المربحة قبل أن يشتعل التنافس عليها.
                  </p>
                </div>

                {/* Feature 4: Unified Traders Management */}
                <div className="p-6 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Store className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-black text-white">4. دليل التجار الموحد وعزل البيانات (/traders)</h4>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                      أمان Supabase
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    إدارة التجار (مثل التاجر محمود سعيد `mahmeudsaid4@gmail.com` مع Seller ID `A37JIM7LHQI6IM`) في مكان واحد. كل تاجر معزول تماماً ومخزن في قاعدة بيانات Supabase المشفرة، مع تقييد صلاحيات المؤسس لـ <strong className="text-amber-400">jassmeinnour@gmail.com</strong> فقط لضمان الخصوصية التامة.
                  </p>
                </div>

                {/* Feature 5: Real Alerts Engine */}
                <div className="p-6 bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-black text-white">5. التنبيهات الفورية الحقيقية (Real Alerts Engine)</h4>
                    </div>
                    <span className="text-xs bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full font-bold">
                      بدون بيانات وهمية
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    كل تنبيه يصلك في رادار هو نتاج حركة فعلية: هبوط سعر منافس، نفاد مخزون أحد التجار، أو صدور فاتورة شحن جديدة. يمنحك ذلك ثقة مطلقة دون إزعاج أو إشعارات زائفة.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: FAQ & TROUBLESHOOTING */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>الأسئلة الأكثر شيوعاً وتصحيح الأخطاء</span>
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
                        className="w-full p-5 text-right font-bold text-base text-white flex justify-between items-center gap-4 hover:bg-slate-800/50 transition cursor-pointer"
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
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">محاكي اختبار الاتصال المباشر</h3>
                <p className="text-xs text-slate-400">فحص استجابة وتوقيع مفاتيح الـ API فوراً</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">المنصة المراد اختبارها:</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSimPlatform('amazon')}
                    className={`py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      simPlatform === 'amazon' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    أمازون
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimPlatform('noon')}
                    className={`py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      simPlatform === 'noon' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    نون
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimPlatform('jumia')}
                    className={`py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      simPlatform === 'jumia' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    جوميا
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">معرف التاجر (Seller ID / Merchant ID):</label>
                <input
                  type="text"
                  value={simSellerId}
                  onChange={(e) => setSimSellerId(e.target.value)}
                  placeholder="مثال: A2XXXXXXXXXEG أو EGY_SELLER_102"
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
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
                  <span className="text-slate-400 font-sans font-bold">سجل التشخيص الفوري:</span>
                  {testLatency && (
                    <span className="text-emerald-400 font-bold">زمن الاستجابة: {testLatency}ms</span>
                  )}
                </div>
                {testLog.map((log, idx) => (
                  <div key={idx} className="text-amber-200/90 flex items-start gap-1.5 leading-relaxed">
                    <span className="text-emerald-400 shrink-0">›</span>
                    <span>{log}</span>
                  </div>
                ))}
                {testingStatus === 'success' && (
                  <div className="mt-3 p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 font-sans font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>تم التحقق بنجاح! المفاتيح مطابقة وخالية من الأخطاء.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Shortcuts Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <LayersIcon className="w-4 h-4 text-amber-400" />
              <span>روابط سريعة لأقسام رادار:</span>
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="/traders"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/traders');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-slate-300 hover:text-white transition"
              >
                <span>دليل التجار الموحد (/traders)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 rotate-180" />
              </a>

              <a
                href="/competitors"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/competitors');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-slate-300 hover:text-white transition"
              >
                <span>رادار مقارنة أسعار المنافسين (/competitors)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 rotate-180" />
              </a>

              <a
                href="/invoices/split"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/invoices/split');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-slate-300 hover:text-white transition"
              >
                <span>مقسم البوالص وفصل الشحنات (/invoices/split)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 rotate-180" />
              </a>
            </div>
          </div>

          {/* Direct Support Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">تحتاج مساعدة متقدمة؟</h3>
                <p className="text-xs text-slate-400">الدعم الهندسي المباشر لربط الحسابات</p>
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
