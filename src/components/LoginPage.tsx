import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Shield,
  HelpCircle,
  RefreshCw,
  User as UserIcon,
  Crown,
  Smartphone,
  Presentation,
  Monitor,
  Tablet,
  RotateCcw,
  Key
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { InvestorPitchDeckModal } from './InvestorPitchDeckModal';
import { BayyaaLogo } from './BayyaaLogo';
import { ErrorBoundary } from './ErrorBoundary';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    signInDemoMerchant, 
    signInAsOwner,
    sendPasswordReset,
    loginError, 
    isUnauthorizedDomain,
    currentDomain,
    domainInfo,
    clearLoginError,
    isDbConnected
  } = useAuth();

  // Mode and form states
  const [activeMobileTab, setActiveMobileTab] = useState<'merchant' | 'owner'>('merchant');
  const [viewportMode, setViewportMode] = useState<'auto' | 'desktop' | 'tablet' | 'mobile'>('auto');
  const [merchantAuthMode, setMerchantAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Merchant form inputs
  const [merchantEmail, setMerchantEmail] = useState<string>('merchant@store.eg');
  const [merchantPassword, setMerchantPassword] = useState<string>('123456');
  const [displayName, setDisplayName] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showMerchantPassword, setShowMerchantPassword] = useState<boolean>(false);

  // Owner form inputs
  const [ownerPassword, setOwnerPassword] = useState<string>('••••••••••••');
  const [showOwnerPassword, setShowOwnerPassword] = useState<boolean>(false);

  // UI status states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);
  const [showDomainHelp, setShowDomainHelp] = useState<boolean>(false);
  const [resetSentSuccess, setResetSentSuccess] = useState<boolean>(false);
  const [localFormError, setLocalFormError] = useState<string | null>(null);
  const [isInvestorDeckOpen, setIsInvestorDeckOpen] = useState<boolean>(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load saved credentials if available
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('radar_remembered_merchant_email');
      if (savedEmail) {
        setMerchantEmail(savedEmail);
      }
    } catch (e) {
      console.warn('Failed to load remembered email:', e);
    }
  }, []);

  // Listen to Global Error Monitor unfreeze / reset event
  useEffect(() => {
    const handleResetLoading = () => {
      setIsSubmitting(false);
      setActiveAction(null);
    };
    window.addEventListener('app_force_reset_loading', handleResetLoading);
    return () => window.removeEventListener('app_force_reset_loading', handleResetLoading);
  }, []);

  // Copy current domain to clipboard
  const handleCopyDomain = () => {
    if (!currentDomain) return;
    navigator.clipboard.writeText(currentDomain);
    setCopiedDomain(true);
    showToast('تم نسخ النطاق إلى الحافظة بنجاح');
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  // Merchant Login / Signup / Reset Submit Handler
  const handleMerchantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalFormError(null);
    clearLoginError();

    // Dismiss virtual keyboard to prevent keyboard overlay freeze
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur();
    }

    const cleanEmail = merchantEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setLocalFormError('يرجى إدخال بريد إلكتروني صحيح للتاجر');
      return;
    }

    if (merchantAuthMode !== 'forgot' && (!merchantPassword || merchantPassword.length < 6)) {
      setLocalFormError('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل');
      return;
    }

    if (merchantAuthMode === 'signup') {
      if (!displayName.trim()) {
        setLocalFormError('يرجى كتابة اسم التاجر أو المسؤول');
        return;
      }
      if (!storeName.trim()) {
        setLocalFormError('يرجى كتابة اسم المتجر أو العلامة التجارية');
        return;
      }
    }

    if (rememberMe) {
      try {
        localStorage.setItem('radar_remembered_merchant_email', cleanEmail);
      } catch (err) {
        console.warn('Could not save email to storage:', err);
      }
    } else {
      localStorage.removeItem('radar_remembered_merchant_email');
    }

    setIsSubmitting(true);
    setActiveAction('merchant');

    try {
      if (merchantAuthMode === 'signin') {
        showToast('جاري تسجيل دخول التاجر والتحقق من الصلاحيات...');
        await signInWithEmail(cleanEmail, merchantPassword);
        showToast('تم تسجيل الدخول بنجاح! جاري تحويلك لمساحة العمل...');
        onLoginSuccess?.();
      } else if (merchantAuthMode === 'signup') {
        showToast('جاري إنشاء حساب التاجر السحابي...');
        await signUpWithEmail(cleanEmail, merchantPassword, displayName.trim(), storeName.trim());
        showToast('تم إنشاء الحساب بنجاح! مرحباً بك في رادار التاجر الذكي.');
        onLoginSuccess?.();
      } else if (merchantAuthMode === 'forgot') {
        await sendPasswordReset(cleanEmail);
        setResetSentSuccess(true);
        showToast('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
      }
    } catch (err: any) {
      console.error('Merchant auth error:', err);
      const msg = err?.message || 'تعذر استكمال العملية، يرجى التحقق من البيانات والمحاولة مجدداً.';
      setLocalFormError(msg);
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  // Owner Direct Access Handler (jassmeinnour@gmail.com)
  const handleOwnerSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalFormError(null);
    clearLoginError();
    setIsSubmitting(true);
    setActiveAction('owner');

    try {
      showToast('جاري توثيق جلسة مالكة المنصة (جاسمين نور)...');
      await signInAsOwner();
      showToast('مرحباً بكِ جاسمين! تم تفعيل لوحة تحكم المالك الحصرية.');
      onLoginSuccess?.();
    } catch (err: any) {
      console.error('Owner login error:', err);
      setLocalFormError(err?.message || 'تعذر تسجيل دخول مالكة التطبيق، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  // Google OAuth Login Handler
  const handleGoogleLogin = async () => {
    setLocalFormError(null);
    setIsSubmitting(true);
    setActiveAction('google');
    clearLoginError();
    try {
      showToast('جاري فتح نافذة تسجيل الدخول عبر Google...');
      await signInWithGoogle();
      showToast('تم تسجيل الدخول بواسطة Google بنجاح!');
      onLoginSuccess?.();
    } catch (err: any) {
      console.error('Google login error:', err);
      if (!loginError) {
        setLocalFormError(err?.message || 'حدث خطأ أثناء تسجيل الدخول عبر Google.');
      }
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  // Instant Demo Access Handler
  const handleDemoLogin = async () => {
    setLocalFormError(null);
    setIsSubmitting(true);
    setActiveAction('demo');
    clearLoginError();
    try {
      showToast('جاري بدء الجلسة التجريبية الفورية للتاجر...');
      await signInDemoMerchant('تاجر تجريبي معتمد', 'متجر العتبة للتجارة الحديثة');
      showToast('تم الدخول التجريبي بنجاح! استكشف ميزات الرادار الآن.');
      onLoginSuccess?.();
    } catch (err: any) {
      console.error('Demo login error:', err);
      setLocalFormError(err?.message || 'تعذر بدء الجلسة التجريبية، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  // Container width styling based on viewport simulation mode
  const getViewportContainerStyle = () => {
    switch (viewportMode) {
      case 'desktop':
        return 'w-full max-w-[1280px] shadow-2xl';
      case 'tablet':
        return 'w-full max-w-[768px] shadow-2xl';
      case 'mobile':
        return 'w-full max-w-[390px] shadow-2xl';
      case 'auto':
      default:
        return 'w-full max-w-5xl';
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col justify-between font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden" dir="rtl">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Viewport Switcher & Status Toolbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Standalone Official Bayyaa Logo Graphic */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-2xl bg-[#FF6B00] p-1 flex items-center justify-center shadow-xl border-2 border-white ring-2 ring-[#FF6B00]/40 shrink-0 overflow-hidden" title="منصة بياع الرسمية (Bayyaa Platform)">
              <div className="w-full h-full rounded-xl overflow-hidden bg-[#FF6B00] flex items-center justify-center">
                <img
                  src="/bayyaa-logo.jpg"
                  alt="منصة بياع الرسمية (Bayyaa Platform)"
                  className="w-full h-full object-contain select-none"
                  loading="eager"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedWhatsapp) {
                      target.dataset.triedWhatsapp = 'true';
                      target.src = '/WhatsApp%20Image%202026-10-20%20at%209.39.15%20PM.jpeg';
                    } else {
                      target.src = '/bayyaa-logo.png';
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white font-['Alexandria'] tracking-wide">
                  منصة بياع (Bayyaa)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF6B00] text-white shadow-sm border border-white/30">
                  شريك التسوق الرسمي
                </span>
              </div>
              <p className="text-[12px] text-amber-300 font-bold hidden sm:block">
                بوابة التاجر المعتمدة للربط والبيع عبر منصة بياع وأسواق أمازون ونون
              </p>
            </div>
          </div>

          {/* Viewport Resolution Controls (Desktop / Tablet / Mobile / Auto) */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setViewportMode('auto')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewportMode === 'auto'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="تلقائي 100% متجاوب مع عرض شاشة جهازك"
            >
              <span>تلقائي</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewportMode === 'desktop'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="معاينة شاشات الكمبيوتر والديسكتوب"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">كمبيوتر</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewportMode === 'tablet'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="معاينة شاشات الأجهزة اللوحية والتابلت (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تابلت</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewportMode('mobile');
                setActiveMobileTab('merchant');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewportMode === 'mobile'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="معاينة شاشات الجوال والهواتف الذكية (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">جوال</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 text-xs">
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition flex items-center gap-1.5"
                title="العودة للصفحة التعريفية"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">الرئيسية</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsInvestorDeckOpen(true)}
              className="h-8 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
              title="عرض المستثمرين التفاعلي"
            >
              <Presentation className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Pitch Deck</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDomainHelp(!showDomainHelp)}
              className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition flex items-center gap-1"
              title="التحقق من حالة قاعدة البيانات والنطاقات"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">{isDbConnected ? 'Firebase متصل' : 'تهيئة النطاقات'}</span>
            </button>

            <PWAInstallButton variant="header" />
          </div>
        </div>
      </header>

      {/* Main Interactive Login Canvas */}
      <main className="flex-1 w-full p-4 sm:p-6 md:p-8 flex items-center justify-center relative z-10 overflow-y-auto">
        <div 
          id="viewport-container" 
          className={`transition-all duration-300 mx-auto flex flex-col justify-center items-center ${getViewportContainerStyle()} ${
            viewportMode !== 'auto' ? 'bg-slate-900/60 rounded-3xl border border-slate-800/80 p-4 sm:p-8' : ''
          }`}
        >

          {/* Viewport Simulation Bar Indicator (Visible only during simulated viewport modes) */}
          {viewportMode !== 'auto' && (
            <div className="w-full mb-6 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="mr-2 text-slate-300 font-bold">
                  {viewportMode === 'desktop' && 'Desktop Simulation (1280px)'}
                  {viewportMode === 'tablet' && 'Tablet Simulation (768px)'}
                  {viewportMode === 'mobile' && 'Mobile Smartphone Simulation (390px)'}
                </span>
              </div>
              <div className="text-[11px] text-amber-400 font-bold">
                متناسق 100% RTL
              </div>
            </div>
          )}

          {/* Header Title Section */}
          <div className="text-center max-w-lg mb-6 sm:mb-8 relative z-10 px-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>نظام المصادقة والتسجيل الآمن</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-['Alexandria'] leading-tight">
              بوابة دخول منصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200">رادار التاجر الذكي</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              اختر نوع الحساب للمتابعة لمساحة العمل المخصصة لمتابعة المبيعات والأسعار
            </p>
          </div>

          {/* Bayyaa Platform Promotional Banner & Standalone Logo */}
          <div className="w-full max-w-4xl mb-6 bg-[#0F2A4A] border-3 border-[#FF6B00] rounded-3xl p-6 sm:p-8 shadow-[0_12px_45px_rgba(15,42,74,0.65)] relative overflow-hidden text-right ring-4 ring-[#FF6B00]/25" dir="rtl">
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#FF6B00]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
                {/* Official Uploaded Bayyaa Logo Graphic - Directly injected & Hardcoded */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#FF6B00] p-1.5 shadow-2xl shadow-[#FF6B00]/40 shrink-0 flex items-center justify-center overflow-hidden border-3 border-white ring-4 ring-[#FF6B00]/30 hover:scale-105 transition-all">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-[#FF6B00] flex items-center justify-center">
                      <img
                        src="/36909.jpg"
                        alt="شعار منصة بياع الرسمي - Official Bayyaa Logo"
                        className="w-full h-full object-contain select-none transition-transform duration-300"
                        loading="eager"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-black text-white text-xl sm:text-3xl leading-tight tracking-tight font-['Alexandria'] drop-shadow-md">
                      منصة بياع
                    </span>
                    <span className="text-sm sm:text-base text-amber-300 font-black tracking-[0.25em] uppercase drop-shadow-sm font-mono">
                      Bayyaa Marketplace
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap mb-2">
                    <span className="px-3 py-1 rounded-full bg-[#FF6B00] text-white font-black text-xs tracking-wider uppercase shadow-md border border-white/30">
                      منصة بياع (Bayyaa) الرسمية
                    </span>
                    <span className="text-xs sm:text-sm text-amber-300 font-extrabold tracking-wide">
                      سوق إلكتروني متكامل للتاجر المصري
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-[#FFFFFF] tracking-tight font-['Alexandria'] leading-tight">
                    🚀 انضم الآن إلى منصة بياع (Bayyaa) - ابدأ بإدراج منتجاتك وتوسيع مبيعاتك عبر منصتنا الجديدة!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1.5">
                    عمولة تنافسية، تحويل فوري للأرباح، ربط شامل للمخزون، ولوحة تحكم ذكية مدعومة بالذكاء الاصطناعي.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMerchantAuthMode('signup');
                    showToast('تم اختيار التسجيل في منصة بياع - أكمل بيانات المتجر أدناه 🛒');
                  }}
                  className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-[#FFFFFF] font-black text-sm shadow-xl shadow-[#FF6B00]/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border-2 border-white ring-2 ring-[#FF6B00]/30"
                >
                  <span>اشترك الآن وأضف منتجاتك في منصة بياع 🛍️</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Global Error Banner */}
          {(loginError || localFormError) && (
            <div className="w-full max-w-4xl mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-sm">تنبيه في عملية المصادقة:</div>
                <div className="leading-relaxed">{localFormError || loginError}</div>
                {isUnauthorizedDomain && (
                  <div className="pt-2 mt-2 border-t border-rose-800/50 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-indigo-300">{currentDomain}</span>
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                      <span>نسخ النطاق</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Password Reset Confirmation Banner */}
          {resetSentSuccess && (
            <div className="w-full max-w-4xl mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>تم إرسال رابط استعادة كلمة المرور إلى {merchantEmail}. تفقد صندوق الوارد أو الرسائل غير المرغوب فيها.</span>
            </div>
          )}

          {/* Mobile Screen Mode Switcher Tabs (Visible on mobile viewports or simulated mobile) */}
          <div className={`w-full max-w-md mb-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 ${
            viewportMode === 'mobile' ? 'flex' : 'flex md:hidden'
          } relative z-10`}>
            <button
              type="button"
              onClick={() => setActiveMobileTab('merchant')}
              className={`flex-1 py-3 min-h-[48px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeMobileTab === 'merchant'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>التاجر / المسوق</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab('owner')}
              className={`flex-1 py-3 min-h-[48px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeMobileTab === 'owner'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>مالك المنصة</span>
            </button>
          </div>

          {/* Dual Login Cards Container Grid */}
          <div className={`w-full max-w-4xl ${
            viewportMode === 'mobile'
              ? 'flex flex-col gap-6'
              : 'grid grid-cols-1 md:grid-cols-2 gap-6'
          } items-stretch relative z-10`}>
            
            {/* ============================================================ */}
            {/* CARD 1: MERCHANT / MARKETER LOGIN (التاجر والمسوقين)           */}
            {/* ============================================================ */}
            <div 
              id="card-merchant" 
              className={`bg-slate-950/90 rounded-2xl border border-slate-800 p-6 sm:p-7 flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 group shadow-2xl relative ${
                viewportMode === 'mobile' && activeMobileTab !== 'merchant' ? 'hidden' : 'flex'
              } ${
                activeMobileTab !== 'merchant' ? 'max-md:hidden' : ''
              }`}
            >
              <div>
                {/* Card Badge & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl group-hover:scale-110 transition-transform shrink-0">
                    <Store className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    حساب تجاري / مسوق
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-black text-white mb-1.5 font-['Alexandria']">
                    {merchantAuthMode === 'signin' && 'دخول التاجر والمسوقين'}
                    {merchantAuthMode === 'signup' && 'إنشاء حساب تاجر جديد'}
                    {merchantAuthMode === 'forgot' && 'استعادة كلمة المرور للتاجر'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {merchantAuthMode === 'signin' && 'متابعة حركة المنتجات، تحليل أسعار المنافسين على أمازون ونون وجوميا، وتتبع البوالص.'}
                    {merchantAuthMode === 'signup' && 'سجل حسابك التجاري الآن لتتمتع بفترة تجربة مجانية لكافة أدوات الذكاء الاصطناعي.'}
                    {merchantAuthMode === 'forgot' && 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور فوراً.'}
                  </p>
                </div>

                {/* Sub-mode Switcher for Merchant: Signin / Signup */}
                {merchantAuthMode !== 'forgot' && (
                  <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold mb-4">
                    <button
                      type="button"
                      onClick={() => { setMerchantAuthMode('signin'); setLocalFormError(null); }}
                      className={`h-9 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                        merchantAuthMode === 'signin'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      تسجيل الدخول
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMerchantAuthMode('signup'); setLocalFormError(null); }}
                      className={`h-9 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                        merchantAuthMode === 'signup'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      حساب جديد
                    </button>
                  </div>
                )}

                {/* Merchant Form */}
                <form onSubmit={handleMerchantSubmit} className="space-y-4 text-right" noValidate>
                  
                  {/* Signup Specific Fields */}
                  {merchantAuthMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          اسم التاجر / المسؤول <span className="text-amber-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="مثال: أحمد محمود"
                            className="w-full min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl py-3 pr-10 pl-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                          />
                          <UserIcon className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          اسم المتجر أو العلامة التجارية <span className="text-amber-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="مثال: متجر التقنية المصرية - القاهرة"
                            className="w-full min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl py-3 pr-10 pl-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                          />
                          <Store className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Merchant Email Field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      البريد الإلكتروني للتاجر <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={merchantEmail}
                        onChange={(e) => setMerchantEmail(e.target.value)}
                        placeholder="merchant@store.eg"
                        dir="ltr"
                        className="w-full min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl py-3 pr-10 pl-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-left"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Merchant Password Field (only for signin and signup) */}
                  {merchantAuthMode !== 'forgot' && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-medium text-slate-300">
                          كلمة المرور <span className="text-amber-400">*</span>
                        </label>
                        {merchantAuthMode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => { setMerchantAuthMode('forgot'); setLocalFormError(null); }}
                            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                          >
                            نسيت كلمة المرور؟
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showMerchantPassword ? 'text' : 'password'}
                          required
                          value={merchantPassword}
                          onChange={(e) => setMerchantPassword(e.target.value)}
                          placeholder="••••••••"
                          dir="ltr"
                          className="w-full min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl py-3 pr-10 pl-10 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-left"
                        />
                        <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowMerchantPassword(!showMerchantPassword)}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                          tabIndex={-1}
                          title={showMerchantPassword ? 'إخفاء' : 'إظهار'}
                        >
                          {showMerchantPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Remember Me Checkbox */}
                  {merchantAuthMode === 'signin' && (
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                        />
                        <span className="text-xs text-slate-400">تذكر بيانات تسجيل الدخول</span>
                      </label>
                    </div>
                  )}

                  {/* Golden Action Submit Button (Min 48px touch target) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black min-h-[48px] py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting && activeAction === 'merchant' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>جاري التحقق والاتصال...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {merchantAuthMode === 'signin' && 'تسجيل الدخول كتاجر'}
                          {merchantAuthMode === 'signup' && 'إنشاء حساب تاجر جديد'}
                          {merchantAuthMode === 'forgot' && 'إرسال رابط الاستعادة'}
                        </span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Forgot Password Mode Back Button */}
                  {merchantAuthMode === 'forgot' && (
                    <button
                      type="button"
                      onClick={() => setMerchantAuthMode('signin')}
                      className="w-full text-center text-xs text-slate-400 hover:text-white py-2 cursor-pointer font-bold"
                    >
                      العودة لصفحة تسجيل الدخول
                    </button>
                  )}
                </form>

                {/* Alternative Quick Auth Options */}
                {merchantAuthMode === 'signin' && (
                  <div className="mt-5 pt-4 border-t border-slate-900 space-y-2.5">
                    <div className="relative my-2 text-center">
                      <span className="relative px-3 bg-slate-950 text-[11px] text-slate-500 font-bold">
                        أو الدخول السريع عبر
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Google Login */}
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
                        title="الدخول بواسطة حساب Google"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>حساب Google</span>
                      </button>

                      {/* Demo Merchant Login */}
                      <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={isSubmitting}
                        className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
                        title="تجربة فورية كتاجر تجريبي"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>دخول تجريبي ⚡</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Quick Info */}
              <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                <span>ليس لديك حساب؟</span>
                <button
                  type="button"
                  onClick={() => { setMerchantAuthMode('signup'); setLocalFormError(null); }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  تجربة مجانية لمدة 7 أيام
                </button>
              </div>
            </div>

            {/* ============================================================ */}
            {/* CARD 2: OWNER / ADMIN LOGIN (دخول مالكة النظام والوكالة)       */}
            {/* ============================================================ */}
            <div 
              id="card-owner" 
              className={`bg-slate-950/90 rounded-2xl border border-slate-800 p-6 sm:p-7 flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 group shadow-2xl relative ${
                viewportMode === 'mobile' && activeMobileTab !== 'owner' ? 'hidden' : 'flex'
              } ${
                activeMobileTab !== 'owner' ? 'max-md:hidden' : ''
              }`}
            >
              <div>
                {/* Card Badge & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl group-hover:scale-110 transition-transform shrink-0">
                    <Crown className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>لوحة المالك الحصرية</span>
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-black text-white mb-1.5 font-['Alexandria'] flex items-center gap-2">
                    <span>دخول مالكة النظام والوكالة</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                      Super Admin
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    التحكم الكامل في حسابات التجار، المشتريات، متابعة الاشتراكات، والتقارير المالية الشاملة.
                  </p>
                </div>

                {/* Owner Form */}
                <form onSubmit={handleOwnerSubmit} className="space-y-4 text-right">
                  
                  {/* Dedicated Owner Email Display (Read-Only / Authenticated) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      حساب المالك الرئيسي
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={OWNER_EMAIL}
                        readOnly
                        dir="ltr"
                        className="w-full min-h-[48px] bg-slate-900/90 border border-amber-500/30 rounded-xl py-3 pr-10 pl-24 text-xs sm:text-sm text-amber-300 font-mono font-bold focus:outline-none cursor-default text-left select-all"
                      />
                      <Crown className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-bold">
                        صلاحية دائمة
                      </span>
                    </div>
                  </div>

                  {/* Owner Security Key / Password Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-slate-300">
                        رمز الأمان أو كلمة المرور
                      </label>
                      <span className="text-[10px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                        مصادقة فورية موثقة
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showOwnerPassword ? 'text' : 'password'}
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="••••••••••••"
                        dir="ltr"
                        className="w-full min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl py-3 pr-10 pl-10 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-left"
                      />
                      <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Lifetime Active Status Badge */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 flex items-center gap-2 font-bold">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span>حساب مالكة النظام نشط ومدى الحياة</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      SYSTEM_ADMIN
                    </span>
                  </div>

                  {/* Golden Action Submit Button (Min 48px touch target) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black min-h-[48px] py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting && activeAction === 'owner' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>جاري توثيق جلسة المالك...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-slate-950" />
                        <span>دخول لوحة التحكم المباشرة (المالكة)</span>
                        <ArrowLeft className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>
                </form>

                {/* Owner Security Guarantee Notice */}
                <div className="mt-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-200/80 leading-relaxed">
                  🛡️ <strong>صلاحيات الإشراف الشامل:</strong> تتيح هذه اللوحة لمالكة النظام مراجعة جميع متاجر المنصة، تشغيل المحاكاة السعرية، وإصدار بوالص الشحن عبر المنافذ السريعة.
                </div>
              </div>

              {/* Card Footer Quick Info */}
              <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                <span>إدارة النظام والوكالة بالكامل</span>
                <span className="text-amber-400 font-mono font-bold">الإصدار v2.4.5</span>
              </div>
            </div>

          </div>

          {/* Bottom Security Note */}
          <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>جميع البيانات والاتصالات مشفرة ببروتوكول SSL و Firebase Security Rules على أعلى مستوى</span>
          </div>

        </div>
      </main>

      {/* Interactive Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-fadeIn bg-slate-900 border border-amber-500/50 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm shrink-0">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-white">إشعار واجهة النظام</h4>
            <p className="text-[11px] text-slate-300 leading-normal">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Authorized Domain Setup Guidance Modal */}
      {showDomainHelp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-right">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setShowDomainHelp(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-['Alexandria']">
                  دليل النطاقات المصرح بها (Authorized Domains)
                </h3>
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                لتفعيل تسجيل الدخول بواسطة <strong className="text-white">Google</strong> بنجاح بدون خطأ <code className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded font-mono">auth/unauthorized-domain</code>، يجب أن يكون نطاق التطبيق الحالي مضافاً في إعدادات فايربيس:
              </p>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-bold">النطاق الحالي لتطبيقك (Host):</span>
                <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-xl border border-amber-900/60">
                  <span className="font-mono text-xs text-amber-300 truncate" dir="ltr">
                    {currentDomain || 'ais-dev-...europe-west2.run.app'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5 text-slate-950" />}
                    <span>{copiedDomain ? 'تم النسخ!' : 'نسخ النطاق'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-slate-300 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
                <h4 className="font-black text-white text-xs">خطوات الإضافة في ثوانٍ:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                  <li>اضغط على زر <strong className="text-amber-400">نسخ النطاق</strong> أعلاه.</li>
                  <li>اضغط على رابط <strong className="text-amber-400">إعدادات Firebase Console</strong> أدناه لفتح الصفحة مباشرة.</li>
                  <li>توجه إلى قسم <strong className="text-white">Authorized domains</strong> واضغط <strong className="text-white">Add domain</strong>.</li>
                  <li>الصق النطاق المنسوخ واضغط <strong className="text-white">Save (حفظ)</strong>.</li>
                </ol>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-[11px] text-amber-200">
                💡 <strong>ملاحظة مهمة:</strong> تسجيل الدخول بالبريد الإلكتروني وكلمة المرور وكذلك الوضع التجريبي الفوري يعملان بشكل فوري ومستقل دون الحاجة لخطوة النطاقات!
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
              <a
                href={domainInfo.consoleAuthSettingsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>فتح صفحة إعدادات Firebase Console</span>
                <ExternalLink className="w-4 h-4 text-slate-950" />
              </a>
              <button
                type="button"
                onClick={() => setShowDomainHelp(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Investor Pitch Deck Modal */}
      <ErrorBoundary sectionName="عرض المستثمرين">
        <InvestorPitchDeckModal
          isOpen={isInvestorDeckOpen}
          onClose={() => setIsInvestorDeckOpen(false)}
          onStartLiveDemo={handleDemoLogin}
        />
      </ErrorBoundary>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-4 z-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} رادار التاجر الذكي (RADAR) • جميع الحقوق محفوظة
          </div>
          <div className="flex items-center gap-4 text-amber-400/80 font-medium">
            <span>أمازون · نون · جوميا</span>
            <span>•</span>
            <span>بوابة المصادقة المزدوجة المتناسقة</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LoginPage;
