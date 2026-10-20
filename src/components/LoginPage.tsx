import React, { useState, useEffect } from 'react';
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
  TrendingUp, 
  BarChart3, 
  Layers, 
  Cloud,
  HelpCircle,
  RefreshCw,
  User as UserIcon,
  Smartphone,
  Presentation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { RadarGlobalHeroVisual } from './RadarGlobalHeroVisual';
import { InvestorPitchDeckModal } from './InvestorPitchDeckModal';
import { RadarBrandLogo } from './RadarBrandLogo';
import { ErrorBoundary } from './ErrorBoundary';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    signInDemoMerchant, 
    signInAsOwner,
    sendPasswordReset,
    loginError, 
    authErrorCode,
    isUnauthorizedDomain,
    currentDomain,
    domainInfo,
    clearLoginError,
    isDbConnected
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);
  const [showDomainHelp, setShowDomainHelp] = useState<boolean>(false);
  const [resetSentSuccess, setResetSentSuccess] = useState<boolean>(false);
  const [localFormError, setLocalFormError] = useState<string | null>(null);
  const [isInvestorDeckOpen, setIsInvestorDeckOpen] = useState<boolean>(false);

  // Listen to Global Error Monitor unfreeze / reset event
  useEffect(() => {
    const handleResetLoading = () => {
      setIsSubmitting(false);
    };
    window.addEventListener('app_force_reset_loading', handleResetLoading);
    return () => window.removeEventListener('app_force_reset_loading', handleResetLoading);
  }, []);

  // Copy current domain to clipboard
  const handleCopyDomain = () => {
    if (!currentDomain) return;
    navigator.clipboard.writeText(currentDomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  // Submit Handler with keyboard dismiss, validation, and safe error capture
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalFormError(null);
    clearLoginError();

    // 1. Explicitly dismiss virtual keyboard to prevent keyboard overlay freeze
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur();
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setLocalFormError('يرجى إدخال بريد إلكتروني صحيح للتاجر');
      window.dispatchEvent(new CustomEvent('app_error_report', {
        detail: { error: 'يرجى إدخال بريد إلكتروني صحيح', source: 'form' }
      }));
      return;
    }

    if (authMode !== 'forgot' && (!password || password.length < 6)) {
      setLocalFormError('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل');
      window.dispatchEvent(new CustomEvent('app_error_report', {
        detail: { error: 'كلمة المرور قصيرة جداً (6 خانات على الأقل)', source: 'form' }
      }));
      return;
    }

    if (authMode === 'signup') {
      if (!displayName.trim()) {
        setLocalFormError('يرجى كتابة اسم التاجر أو المسؤول');
        return;
      }
      if (!storeName.trim()) {
        setLocalFormError('يرجى كتابة اسم المتجر أو العلامة التجارية');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        await signInWithEmail(cleanEmail, password);
        onLoginSuccess?.();
      } else if (authMode === 'signup') {
        await signUpWithEmail(cleanEmail, password, displayName.trim(), storeName.trim());
        onLoginSuccess?.();
      } else if (authMode === 'forgot') {
        await sendPasswordReset(cleanEmail);
        setResetSentSuccess(true);
      }
    } catch (err: any) {
      console.error('Auth submission error:', err);
      const msg = err?.message || 'تعذر استكمال العملية، يرجى التحقق من البيانات والمحاولة مجدداً.';
      setLocalFormError(msg);
      window.dispatchEvent(new CustomEvent('app_error_report', {
        detail: { error: err, source: 'firebase' }
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setLocalFormError(null);
    setIsSubmitting(true);
    clearLoginError();
    try {
      await signInWithGoogle();
      onLoginSuccess?.();
    } catch (err: any) {
      console.error('Google login error:', err);
      if (!loginError) {
        setLocalFormError(err?.message || 'حدث خطأ أثناء تسجيل الدخول عبر Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Merchant Instant Access
  const handleDemoLogin = async () => {
    setLocalFormError(null);
    setIsSubmitting(true);
    clearLoginError();
    try {
      await signInDemoMerchant('تاجر تجريبي معتمد', 'متجر العتبة للتجارة الحديثة');
      onLoginSuccess?.();
    } catch (err: any) {
      console.error('Demo login error:', err);
      setLocalFormError(err?.message || 'تعذر بدء الجلسة التجريبية، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Owner Instant Access (jassmeinnour@gmail.com)
  const handleOwnerLogin = async () => {
    setLocalFormError(null);
    setIsSubmitting(true);
    clearLoginError();
    try {
      await signInAsOwner();
      onLoginSuccess?.();
    } catch (err: any) {
      console.error('Owner login error:', err);
      setLocalFormError(err?.message || 'تعذر تسجيل دخول مالكة التطبيق، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col justify-between font-['Cairo',sans-serif] selection:bg-sky-500/25 selection:text-sky-300 relative overflow-hidden" dir="rtl">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top status bar */}
      <header className="border-b border-sky-500/20 bg-slate-900/80 backdrop-blur-md px-6 py-3.5 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#08090D] p-0.5 flex items-center justify-center text-white shadow-md shadow-sky-500/15 border border-sky-500/40 shrink-0">
              <RadarBrandLogo className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-[0.22em] bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent text-base font-['Outfit','Alexandria']">
                  RADAR
                </span>
                <span className="text-[11px] font-semibold text-sky-300/90 hidden sm:inline">
                  · Global Marketplaces Real-Time Tracking
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Amazon · Noon · Jumia — منظومة رصد الأسعار والمنافسين والتسعير السحابي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            {/* Investor Pitch Deck Button */}
            <button
              type="button"
              id="btn-login-open-investor-deck"
              onClick={() => setIsInvestorDeckOpen(true)}
              className="h-8 px-3 rounded-md bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 hover:from-sky-100 hover:to-sky-400 text-[#08090D] text-xs font-black whitespace-nowrap flex items-center gap-1.5 justify-center shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              title="عرض المستثمرين التفاعلي (RADAR Investor Pitch Deck)"
            >
              <Presentation className="w-3.5 h-3.5 text-[#08090D]" />
              <span>عرض المستثمرين (Pitch Deck)</span>
            </button>

            {/* PWA Direct Mobile Install Button */}
            <PWAInstallButton variant="header" />

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-sky-500/20 text-slate-300">
              <span>قاعدة بيانات Firebase {isDbConnected ? 'متصلة' : 'جاهزة'}</span>
            </div>

            <button
              onClick={() => setShowDomainHelp(!showDomainHelp)}
              className="h-8 flex items-center gap-1.5 px-3 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              title="التحقق من النطاقات المصرح بها في فايربيس"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">تهيئة النطاقات (Authorized Domains)</span>
              <span className="md:hidden">النطاقات</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex items-center justify-center z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column: RADAR Global Marketplaces Hero Visual & Value Proposition */}
          <div className="lg:col-span-7 space-y-5 text-right order-2 lg:order-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-sky-300 tracking-wide">
                RADAR · GLOBAL MARKETPLACES · REAL-TIME PRICE TRACKING
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight font-['Alexandria']">
                <span className="bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent">
                  RADAR — رصد فوري لأسعار المنصات العالمية
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                المنصة السحابية الموحدة لتتبع الأسعار اللحظية عبر <strong className="text-sky-300">Amazon · Noon · Jumia</strong> واقتناص صندوق الشراء (Buy Box) تلقائياً بدقة استخباراتية فائقة.
              </p>
            </div>

            {/* Interactive RADAR Global Marketplaces Geodesic Globe & Real-Time Price Tracking Badges */}
            <ErrorBoundary sectionName="رادار الأسواق العالمية">
              <RadarGlobalHeroVisual
                onOpenInvestorDeck={() => setIsInvestorDeckOpen(true)}
              />
            </ErrorBoundary>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/20 backdrop-blur-md">
                <h4 className="text-xs font-bold text-sky-300 mb-1">رصد فوري (Real-Time Radar)</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  تتبع لحظي لتحركات أسعار Amazon وNoon وJumia واقتناص الـ Buy Box.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/20 backdrop-blur-md">
                <h4 className="text-xs font-bold text-sky-300 mb-1">عائد استثمار مضاعف (4.8x ROAS)</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  حماية هوامش ربح التجار والوكالات عبر قواعد التسعير الذكي الآلي.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/20 backdrop-blur-md">
                <h4 className="text-xs font-bold text-sky-300 mb-1">سحابة Firebase المشفرة</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  مزامنة سحابية فورية للكتالوج والمخزون وبوالص الشحن متعددة القنوات.
                </p>
              </div>
            </div>

            {/* PWA Mobile App Install Card - Exclusively on Login Screen */}
            <div className="pt-1">
              <PWAInstallButton variant="banner" />
            </div>
          </div>

          {/* Right Column: High-Grade Login Form Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto order-1 lg:order-2 flex flex-col justify-center">
            <div className="bg-slate-900/80 border border-sky-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-md relative">
              
              {/* Card Header & Mode Switcher */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent tracking-tight font-['Alexandria']">
                      {authMode === 'signin' && 'تسجيل دخول RADAR'}
                      {authMode === 'signup' && 'إنشاء حساب تاجر جديد'}
                      {authMode === 'forgot' && 'استعادة كلمة المرور'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {authMode === 'signin' && 'أدخل بياناتك للوصول إلى لوحة تحكم RADAR العالمية'}
                      {authMode === 'signup' && 'ابدأ بمزامنة متجرك ومنتجاتك سحابياً مجاناً'}
                      {authMode === 'forgot' && 'سنرسل رابط إعادة التعيين لبريدك الإلكتروني'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                </div>

                {authMode !== 'forgot' && (
                  <div className="grid grid-cols-2 p-1 bg-[#08090D] rounded-xl border border-sky-500/20 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signin'); clearLoginError(); }}
                      className={`h-8 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                        authMode === 'signin'
                          ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-[#08090D] font-black shadow-md'
                          : 'text-slate-400 hover:text-sky-200'
                      }`}
                    >
                      تسجيل الدخول
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signup'); clearLoginError(); }}
                      className={`h-8 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                        authMode === 'signup'
                          ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-[#08090D] font-black shadow-md'
                          : 'text-slate-400 hover:text-sky-200'
                      }`}
                    >
                      حساب جديد
                    </button>
                  </div>
                )}
              </div>

              {/* Error Banner with Smart Guidance */}
              {loginError && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs leading-relaxed space-y-2 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{loginError}</div>
                  </div>

                  {/* Special Helper for Unauthorized Domain */}
                  {isUnauthorizedDomain && (
                    <div className="pt-2 border-t border-rose-800/50 space-y-2 text-[11px] text-slate-300">
                      <div className="bg-slate-950/90 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-indigo-300 truncate" dir="ltr">
                          {currentDomain}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyDomain}
                          className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-all text-[10px]"
                        >
                          {copiedDomain ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedDomain ? 'تم النسخ' : 'نسخ النطاق'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={domainInfo.consoleAuthSettingsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center gap-1"
                        >
                          <span>فتح إعدادات النطاقات في Firebase</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={handleDemoLogin}
                          className="text-emerald-400 hover:text-emerald-300 font-bold"
                        >
                          استخدم الدخول التجريبي ⚡
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Local Form Error Alert */}
              {localFormError && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="leading-relaxed">{localFormError}</span>
                </div>
              )}

              {/* Password Reset Success Alert */}
              {resetSentSuccess && authMode === 'forgot' && (
                <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تم إرسال رابط استعادة كلمة المرور إلى {email}. تفقد صندوق الوارد أو الرسائل غير المرغوب فيها.</span>
                </div>
              )}

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-right" noValidate>
                
                {/* Sign-Up Additional Fields */}
                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        اسم التاجر / المسؤول
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="مثال: محمود الديب"
                          required
                          className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                        <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        اسم المتجر أو العلامة التجارية
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="مثال: متجر التقنية المصرية - القاهرة"
                          className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                        <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      </div>
                    </div>
                  </>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="merchant@example.com"
                      required
                      dir="ltr"
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 outline-none transition-all text-left"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Password Field (only for signin and signup) */}
                {authMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        كلمة المرور
                      </label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => { setAuthMode('forgot'); clearLoginError(); }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        dir="ltr"
                        className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-all text-left"
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-200 absolute right-3.5 top-2.5 cursor-pointer p-0.5"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 hover:from-sky-300 hover:to-sky-500 text-[#08090D] text-xs font-black shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#08090D]" />
                      <span>جاري التحقق والمزامنة...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {authMode === 'signin' && 'تسجيل الدخول إلى RADAR ⚡'}
                        {authMode === 'signup' && 'إنشاء حساب RADAR السحابي'}
                        {authMode === 'forgot' && 'إرسال رابط إعادة التعيين'}
                      </span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>

                {authMode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); clearLoginError(); }}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1 cursor-pointer font-bold"
                  >
                    العودة لصفحة تسجيل الدخول
                  </button>
                )}
              </form>

              {/* Alternative Auth Methods Divider */}
              {authMode !== 'forgot' && (
                <>
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-slate-900 px-3 text-slate-400 font-semibold">أو المتابعة من خلال</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* Google Login Button */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isSubmitting}
                      className="w-full h-10 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-white text-xs font-bold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                      title="تسجيل الدخول بحساب Google الرسمي"
                    >
                      {/* Google G SVG */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>الدخول السريع بحساب Google</span>
                    </button>

                    {/* Instant Demo Access Button */}
                    <button
                      type="button"
                      id="btn-login-demo-merchant"
                      onClick={handleDemoLogin}
                      disabled={isSubmitting}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-950/90 hover:from-emerald-900/60 hover:to-slate-900 border border-emerald-700/40 text-emerald-300 hover:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                      title="تجربة لوحة التحكم فوراً كتاجر تجريبي"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>دخول تجريبي فوري (استكشاف المنصة الآن)</span>
                    </button>

                    {/* Owner Direct Session Login (jassmeinnour@gmail.com) */}
                    <button
                      type="button"
                      id="btn-login-owner-jassmein"
                      onClick={handleOwnerLogin}
                      disabled={isSubmitting}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-sky-950/60 via-indigo-950/60 to-slate-950/90 hover:from-sky-900/60 hover:to-indigo-900/60 border border-sky-500/40 text-sky-300 hover:text-sky-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                      title="تسجيل دخول مالكة التطبيق (jassmeinnour@gmail.com) لتفعيل أدوات الأونر ومناقشة Google AI Studio"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>دخول مالكة التطبيق (jassmeinnour@gmail.com) 🛠️</span>
                    </button>
                  </div>
                </>
              )}

              {/* Security guarantee note */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>جميع البيانات والاتصالات مشفرة ببروتوكول SSL و Firebase Security Rules</span>
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

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
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                لتفعيل تسجيل الدخول بواسطة <strong className="text-white">Google</strong> بنجاح بدون خطأ <code className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded font-mono">auth/unauthorized-domain</code>، يجب أن يكون نطاق التطبيق الحالي مضافاً في إعدادات فايربيس:
              </p>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-bold">النطاق الحالي لتطبيقك (Host):</span>
                <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-xl border border-indigo-900/60">
                  <span className="font-mono text-xs text-indigo-300 truncate" dir="ltr">
                    {currentDomain || 'ais-dev-...europe-west2.run.app'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDomain ? 'تم النسخ!' : 'نسخ النطاق'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-slate-300 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
                <h4 className="font-black text-white text-xs">خطوات الإضافة في ثوانٍ:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                  <li>اضغط على زر <strong className="text-indigo-400">نسخ النطاق</strong> أعلاه.</li>
                  <li>اضغط على رابط <strong className="text-indigo-400">إعدادات Firebase Console</strong> أدناه لفتح الصفحة مباشرة.</li>
                  <li>توجه إلى قسم <strong className="text-white">Authorized domains</strong> واضغط <strong className="text-white">Add domain</strong>.</li>
                  <li>الصق النطاق المنسوخ واضغط <strong className="text-white">Save (حفظ)</strong>.</li>
                </ol>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-[11px] text-indigo-200">
                💡 <strong>ملاحظة مهمة:</strong> تسجيل الدخول بالبريد الإلكتروني وكلمة المرور وكذلك الوضع التجريبي الفوري يعملان بشكل فوري ومستقل دون الحاجة لخطوة النطاقات!
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
              <a
                href={domainInfo.consoleAuthSettingsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>فتح صفحة إعدادات Firebase Console</span>
                <ExternalLink className="w-4 h-4" />
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
      <footer className="border-t border-sky-500/20 bg-slate-900/60 backdrop-blur-md px-6 py-4 z-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} RADAR — Global Marketplaces Real-Time Tracking • جميع الحقوق محفوظة
          </div>
          <div className="flex items-center gap-4 text-sky-200/70">
            <span>Amazon · Noon · Jumia</span>
            <span>·</span>
            <span>Real-Time Price Intelligence</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
