import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  TrendingDown,
  Users,
  PackageCheck,
  BellRing,
  Sun,
  Moon,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { isSupabaseConfigured, supabaseClient } from '../lib/supabase';
import { clearStaleRadarCache } from './EmergencyLoginButton';

const PWAInstallPrompt = lazy(() => import('./PWAInstallPrompt'));

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onBackToLanding?: () => void;
}

interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const APP_FEATURES: FeatureHighlight[] = [
  {
    id: 'price-tracking',
    title: 'تتبع الأسعار',
    description: 'اعرف سعر منتجك وسعر منافسك لحظة بلحظة - قبل ما تخسر مبيعات',
    icon: TrendingDown,
  },
  {
    id: 'traders-management',
    title: 'إدارة كل التجار',
    description: 'كل تجارك - إيميل - Seller ID - رابط الوجهة - رابط المتجر - تليفون - في مكان واحد',
    icon: Users,
  },
  {
    id: 'full-inventory-sync',
    title: 'سحب كامل للمخزون',
    description: 'اسحب كل منتجات أي تاجر من أمازون ونون وجوميا - مش 4 منتجات فقط',
    icon: PackageCheck,
  },
  {
    id: 'instant-alerts',
    title: 'تنبيهات فورية',
    description: 'تنبيهات ذكية لحظية عند انخفاض الأسعار أو تغيرها بنسبة 10% لتعديل تسعيرك فوراً',
    icon: BellRing,
  },
];

interface TickerQuote {
  id: string;
  label: string;
  platform: string;
  delta: string;
  isDown: boolean;
}

const LIVE_TICKER_QUOTES: TickerQuote[] = [
  {
    id: 'q1',
    label: 'منتج: 8D-X6ON-F44R - سعرك: 450ج - منافس: 430ج',
    platform: 'أمازون مصر',
    delta: '-4.4%',
    isDown: true,
  },
  {
    id: 'q2',
    label: 'منتج: PN-W2ZQ-HKNE - سعرك: 320ج - منافس: 310ج',
    platform: 'نون',
    delta: '-3.1%',
    isDown: true,
  },
  {
    id: 'q3',
    label: 'منتج: AMZ-PRO-991 - سعرك: 1,250ج - منافس: 1,320ج',
    platform: 'جوميا',
    delta: '+5.6%',
    isDown: false,
  },
  {
    id: 'q4',
    label: 'منتج: KNZ-4402-EG - سعرك: 890ج - منافس: 800ج',
    platform: 'أمازون مصر',
    delta: '-10.1%',
    isDown: true,
  },
  {
    id: 'q5',
    label: 'منتج: NON-7781-X - سعرك: 640ج - منافس: 615ج',
    platform: 'نون',
    delta: '-3.9%',
    isDown: true,
  },
  {
    id: 'q6',
    label: 'منتج: JUM-1029-VIP - سعرك: 1,450ج - منافس: 1,520ج',
    platform: 'جوميا',
    delta: '+4.8%',
    isDown: false,
  },
];

const BACKGROUND_PARTICLES = [
  { id: 'p1', left: '8%', top: '76%', size: 4, delay: '0s', duration: '8s' },
  { id: 'p2', left: '16%', top: '52%', size: 3, delay: '1.4s', duration: '10s' },
  { id: 'p3', left: '24%', top: '84%', size: 5, delay: '2.2s', duration: '9s' },
  { id: 'p4', left: '34%', top: '65%', size: 3, delay: '0.7s', duration: '11s' },
  { id: 'p5', left: '43%', top: '88%', size: 4, delay: '3.1s', duration: '8.5s' },
  { id: 'p6', left: '54%', top: '70%', size: 3, delay: '1.9s', duration: '9.5s' },
  { id: 'p7', left: '63%', top: '82%', size: 5, delay: '4.2s', duration: '10.5s' },
  { id: 'p8', left: '72%', top: '58%', size: 3, delay: '0.4s', duration: '8.8s' },
  { id: 'p9', left: '81%', top: '79%', size: 4, delay: '2.8s', duration: '9.2s' },
  { id: 'p10', left: '90%', top: '64%', size: 3, delay: '3.7s', duration: '10.2s' },
  { id: 'p11', left: '48%', top: '42%', size: 4, delay: '5.1s', duration: '11.4s' },
  { id: 'p12', left: '29%', top: '34%', size: 3, delay: '2.6s', duration: '9.6s' },
];

const RADAR_BLIPS = [
  { id: 'b1', top: '18%', left: '58%', delay: '0.2s' },
  { id: 'b2', top: '34%', left: '19%', delay: '1.1s' },
  { id: 'b3', top: '71%', left: '77%', delay: '1.9s' },
  { id: 'b4', top: '76%', left: '28%', delay: '2.6s' },
  { id: 'b5', top: '46%', left: '84%', delay: '0.7s' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const {
    signInWithEmail,
    clearLoginError,
    authInitError,
    isPasswordRecovery,
    clearPasswordRecovery,
    signOut,
  } = useAuth();

  const [email, setEmail] = useState<string>(OWNER_EMAIL);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isDayMode, setIsDayMode] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recovery / Reset Password state
  const detectRecoveryFromUrl = (): boolean => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const path = window.location.pathname || '';
    return (
      hash.includes('type=recovery') ||
      hash.includes('access_token') ||
      search.includes('type=recovery') ||
      path === '/reset-password'
    );
  };

  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(() => {
    return detectRecoveryFromUrl() || Boolean(isPasswordRecovery);
  });
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string | null>(null);
  const [isForgotSent, setIsForgotSent] = useState<boolean>(false);

  // Animated counters (count smoothly from 0 on mount)
  const [productsCount, setProductsCount] = useState<number>(0);
  const [tradersCount, setTradersCount] = useState<number>(0);
  const [hoursCount, setHoursCount] = useState<number>(0);
  const [daysCount, setDaysCount] = useState<number>(0);

  useEffect(() => {
    clearStaleRadarCache();
  }, []);

  // Immediate check on mount + hash/search/popstate + Supabase PASSWORD_RECOVERY event listener
  useEffect(() => {
    if (detectRecoveryFromUrl() || isPasswordRecovery) {
      setIsRecoveryMode(true);
    }

    const handleUrlChange = () => {
      if (detectRecoveryFromUrl()) {
        setIsRecoveryMode(true);
      }
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    let subscription: { unsubscribe: () => void } | null = null;
    if (supabaseClient?.auth?.onAuthStateChange) {
      const { data } = supabaseClient.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
        }
      });
      subscription = data?.subscription || null;
    }

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
      subscription?.unsubscribe();
    };
  }, [isPasswordRecovery]);

  useEffect(() => {
    let rafId = 0;
    const durationMs = 1400;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setProductsCount(Math.round(500 * eased));
      setTradersCount(Math.round(24 * eased));
      setHoursCount(Math.round(24 * eased));
      setDaysCount(Math.round(7 * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    clearLoginError();

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني للمؤسس');
      return;
    }

    if (cleanEmail !== OWNER_EMAIL) {
      setErrorMsg(
        `الدخول مقتصر على حساب المؤسس فقط (${OWNER_EMAIL}). التجار سجلات بيانات يديرها المؤسس ولا يوجد لهم تسجيل دخول.`
      );
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل');
      return;
    }

    setIsSubmitting(true);

    try {
      await signInWithEmail(cleanEmail, password);
      onLoginSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'الإيميل أو كلمة المرور غير صحيحة';
      setErrorMsg(message || 'الإيميل أو كلمة المرور غير صحيحة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRecoverySuccessMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!supabaseClient) throw new Error('Supabase غير متصل');

      // If access_token & refresh_token exist in URL hash and session isn't hydrated yet, hydrate it
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          const { data: sessData } = await supabaseClient.auth.getSession();
          if (!sessData?.session) {
            await supabaseClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }

      const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/login');
      }
      setRecoverySuccessMsg('تم تغيير كلمة المرور بنجاح - سجلي دخول الآن');

      setTimeout(async () => {
        try {
          await signOut();
        } catch {
          // safe
        }
        clearPasswordRecovery();
        setIsRecoveryMode(false);
        setNewPassword('');
        setConfirmPassword('');
        setRecoverySuccessMsg(null);
        setEmail(OWNER_EMAIL);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'فشل في تحديث كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setIsForgotSent(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || cleanEmail !== OWNER_EMAIL) {
      setErrorMsg('يرجى كتابة بريد المؤسس الصحيح (jassmeinnour@gmail.com) أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!supabaseClient) throw new Error('Supabase غير متصل');
      const { error } = await supabaseClient.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: 'https://radaregypt.store/login',
      });
      if (error) throw error;

      setIsForgotSent(true);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر إرسال رابط استعادة كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      data-theme-mode={isDayMode ? 'day' : 'night'}
      className={`min-h-screen w-full relative overflow-x-hidden flex flex-col justify-between font-['Cairo','Tajawal',sans-serif] transition-colors duration-500 ${
        isDayMode
          ? 'bg-[#F8F6F2] text-slate-900'
          : 'bg-[#05060B] text-slate-100'
      }`}
    >
      {/* 1. Living 8-second Animated Gradient Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 radar-animated-gradient"
        style={{
          backgroundImage: isDayMode
            ? 'linear-gradient(135deg, #FBF8F3 0%, #FFF1E0 35%, #F4EFE6 68%, #FDE8CE 100%)'
            : 'linear-gradient(135deg, #040509 0%, #160B04 32%, #080A12 65%, #1E0F05 100%)',
        }}
      />

      {/* Subtle Control Room Grid Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-35"
        style={{
          backgroundImage: isDayMode
            ? 'linear-gradient(to right, rgba(234,88,12,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(234,88,12,0.06) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(249,115,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(249,115,22,0.05) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* 2. 3 Floating Blurred Glowing Orange/Gold Orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          data-testid="floating-orb-1"
          className={`radar-orb-float absolute -top-16 -right-12 w-[420px] h-[420px] rounded-full blur-3xl ${
            isDayMode ? 'bg-orange-400/35' : 'bg-orange-500/30'
          }`}
          style={{ animationDelay: '0s' }}
        />
        <div
          data-testid="floating-orb-2"
          className={`radar-orb-float absolute top-[34%] -left-20 w-[380px] h-[380px] rounded-full blur-3xl ${
            isDayMode ? 'bg-amber-400/30' : 'bg-amber-500/25'
          }`}
          style={{ animationDelay: '-3.5s' }}
        />
        <div
          data-testid="floating-orb-3"
          className={`radar-orb-float absolute bottom-8 right-[36%] w-[360px] h-[360px] rounded-full blur-3xl ${
            isDayMode ? 'bg-orange-300/35' : 'bg-orange-600/25'
          }`}
          style={{ animationDelay: '-6.5s' }}
        />
      </div>

      {/* 3. Real Rotating Radar Sweep (4s 360deg) & 5 Glowing Blips in Open Viewport */}
      <div
        aria-hidden="true"
        data-testid="radar-background-effect"
        className="pointer-events-none fixed inset-0 z-[1] flex items-center justify-center overflow-hidden"
      >
        <div className="relative w-[560px] h-[560px] sm:w-[760px] sm:h-[760px] lg:w-[880px] lg:h-[880px] rounded-full">
          {/* Slowly Rotating Outer Dashed Radar Ring */}
          <div
            className={`radar-ring-slow-spin absolute inset-0 rounded-full border-2 border-dashed ${
              isDayMode ? 'border-orange-500/30' : 'border-orange-500/35'
            }`}
          />
          {/* Concentric Radar Rings */}
          <div
            className={`absolute inset-[14%] rounded-full border ${
              isDayMode ? 'border-orange-500/25' : 'border-orange-500/30'
            }`}
          />
          <div
            className={`absolute inset-[30%] rounded-full border border-dashed ${
              isDayMode ? 'border-amber-600/30' : 'border-amber-400/35'
            }`}
          />
          <div
            className={`absolute inset-[46%] rounded-full border ${
              isDayMode ? 'border-orange-500/35' : 'border-orange-500/40'
            }`}
          />
          {/* Radar Center Pulse Dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-orange-400 shadow-[0_0_24px_6px_rgba(249,115,22,0.85)]" />

          {/* Radar Crosshair Lines */}
          <div
            className={`absolute inset-x-0 top-1/2 h-px ${
              isDayMode ? 'bg-orange-500/20' : 'bg-orange-500/25'
            }`}
          />
          <div
            className={`absolute inset-y-0 left-1/2 w-px ${
              isDayMode ? 'bg-orange-500/20' : 'bg-orange-500/25'
            }`}
          />

          {/* 360° Rotating Radar Sweep Cone (4 seconds full revolution) + Bright Leading Laser Beam */}
          <div
            className="radar-sweep-spin absolute inset-0 rounded-full"
            style={{
              background: isDayMode
                ? 'conic-gradient(from 0deg, rgba(249,115,22,0.34) 0deg, rgba(245,158,11,0.12) 48deg, transparent 96deg, transparent 360deg)'
                : 'conic-gradient(from 0deg, rgba(249,115,22,0.44) 0deg, rgba(245,158,11,0.16) 52deg, transparent 105deg, transparent 360deg)',
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-1/2 bg-gradient-to-t from-orange-500 via-amber-300 to-white/90 shadow-[0_0_18px_3px_rgba(249,115,22,0.95)]" />
          </div>

          {/* 5 Glowing Tracked Product Blips */}
          {RADAR_BLIPS.map((blip) => (
            <div
              key={blip.id}
              data-testid={`radar-blip-${blip.id}`}
              className="radar-blip absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: blip.top, left: blip.left, animationDelay: blip.delay }}
            >
              <span className="absolute -inset-2 rounded-full bg-orange-400/35 animate-ping" />
              <span className="relative block w-3 h-3 rounded-full bg-amber-300 border border-white/80 shadow-[0_0_20px_6px_rgba(249,115,22,0.95)]" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Floating Live-Data Particles */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {BACKGROUND_PARTICLES.map((p) => (
          <span
            key={p.id}
            className={`radar-particle absolute rounded-full ${
              isDayMode ? 'bg-orange-500/55' : 'bg-amber-300/75'
            }`}
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Top Control Room Bar with Theme Toggle */}
      <header className="relative z-20 w-full max-w-[1440px] mx-auto px-5 sm:px-8 pt-3 pb-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
          <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className={isDayMode ? 'text-slate-700' : 'text-slate-200'}>
            غرفة تحكم المؤسس — <span dir="ltr" className="text-orange-500 font-black">RADAR EGYPT</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsDayMode((prev) => !prev)}
          aria-label="تبديل الوضع الليلي والنهاري"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer backdrop-blur-md ${
            isDayMode
              ? 'bg-white/85 border-orange-500/35 text-slate-800 hover:border-orange-500 shadow-sm'
              : 'bg-slate-900/65 border-white/15 text-slate-200 hover:border-orange-500/60 hover:text-orange-300 shadow-lg'
          }`}
        >
          {isDayMode ? (
            <>
              <Moon className="w-3.5 h-3.5 text-orange-600" />
              <span>الوضع الليلي</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>الوضع النهاري</span>
            </>
          )}
        </button>
      </header>

      {/* Main Split Control-Room Stage: 40% Right (Login Card) / 60% Left (Why Radar) */}
      <main className="relative z-10 w-full max-w-[1440px] mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 px-4 sm:px-8 pt-3 pb-24 lg:py-4 lg:pb-24">
        {/* RIGHT SECTION (40%): Luxury Glassmorphism Founder Login Card */}
        <section
          aria-label="دخول المؤسس"
          className="w-full lg:w-[40%] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className={`w-full max-w-md rounded-3xl p-5 sm:p-7 border backdrop-blur-xl relative overflow-hidden transition-colors duration-300 ${
              isDayMode
                ? 'bg-white/70 border-orange-500/40 shadow-[0_24px_70px_-15px_rgba(234,88,12,0.22)]'
                : 'bg-[#0B0E17]/55 border-orange-500/45 shadow-[0_24px_80px_-12px_rgba(249,115,22,0.32)]'
            }`}
          >
            {/* Top Glowing Rim Accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-90"
            />

            <div className="space-y-4 sm:space-y-5">
              {/* Glowing Pulsing RADAR EGYPT Brand Header */}
              <div className="text-center space-y-2.5">
                <motion.div
                  initial={{ scale: 0.9, rotate: -2 }}
                  animate={{ scale: [0.95, 1.04, 1], rotate: [0, 1.5, -1.5, 0] }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  className="relative inline-flex items-center justify-center mx-auto mb-1"
                >
                  <div
                    aria-hidden="true"
                    className="absolute -inset-2 rounded-3xl bg-orange-500/30 blur-xl animate-pulse"
                  />
                  <div
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border border-orange-500/50 shadow-lg shadow-orange-500/25 ${
                      isDayMode ? 'bg-slate-950' : 'bg-[#07080D]'
                    }`}
                  >
                    <img
                      src="/pwa-192x192.png"
                      alt="شعار رادار التاجر الذكي"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </motion.div>

                <h1
                  dir="ltr"
                  className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(249,115,22,0.5)] leading-none select-none"
                >
                  RADAR EGYPT
                </h1>

                <p className={`text-lg sm:text-xl font-extrabold ${isDayMode ? 'text-slate-900' : 'text-white'}`}>
                  رادار - التاجر الذكي
                </p>

                <p
                  className={`text-xs sm:text-sm font-semibold font-['Tajawal','Cairo',sans-serif] ${
                    isDayMode ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  للمؤسس فقط - إدارة كل التجار من حساب واحد
                </p>
              </div>

              {/* Non-blocking Supabase Env Var Warning */}
              {!isSupabaseConfigured && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-start gap-2.5 text-right"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">تأكد من إعدادات Supabase</div>
                    <div className="text-[11px] opacity-85 mt-0.5 leading-relaxed">
                      متغيرات البيئة <span dir="ltr">VITE_SUPABASE_URL</span> و{' '}
                      <span dir="ltr">VITE_SUPABASE_ANON_KEY</span> غير مضبوطة حالياً.
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {(errorMsg || authInitError) && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/70 text-rose-100 text-xs font-bold flex items-start gap-2.5 text-right"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg || authInitError}</span>
                </div>
              )}

              {/* Recovery Success Banner */}
              {recoverySuccessMsg && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-100 text-xs font-bold flex items-center gap-2.5 text-right"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{recoverySuccessMsg}</span>
                </div>
              )}

              {/* Forgot Password Sent Banner */}
              {isForgotSent && !isRecoveryMode && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-100 text-xs font-bold flex items-center gap-2.5 text-right"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تم إرسال لينك إعادة التعيين لإيميلك</span>
                </div>
              )}

              {/* Conditional Form: Recovery Mode vs Login Mode */}
              {isRecoveryMode ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4 text-right" noValidate>
                  <div className="space-y-1 mb-2">
                    <h2 className={`text-lg font-black ${isDayMode ? 'text-slate-900' : 'text-white'}`}>
                      إعادة تعيين كلمة المرور
                    </h2>
                    <p className={`text-xs font-semibold ${isDayMode ? 'text-slate-600' : 'text-orange-300'}`}>
                      اكتبي كلمة مرور جديدة لحساب {OWNER_EMAIL}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className={`block text-xs font-bold mb-1.5 ${isDayMode ? 'text-slate-700' : 'text-slate-300'}`}
                    >
                      كلمة المرور الجديدة
                    </label>
                    <div className="relative group">
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        dir="ltr"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full min-h-[48px] rounded-xl py-3 pr-11 pl-11 text-sm text-left transition-all duration-200 focus:outline-none hover:border-orange-500/60 focus:border-orange-500 ${
                          isDayMode
                            ? 'bg-white/95 border border-slate-300 text-slate-900 placeholder-slate-400'
                            : 'bg-slate-950/85 border border-white/15 text-white placeholder-slate-500'
                        }`}
                      />
                      <Lock className="w-4 h-4 text-orange-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg cursor-pointer ${
                          isDayMode ? 'text-slate-500 hover:text-orange-600' : 'text-slate-400 hover:text-orange-400'
                        }`}
                        aria-label={showNewPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className={`block text-xs font-bold mb-1.5 ${isDayMode ? 'text-slate-700' : 'text-slate-300'}`}
                    >
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative group">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        dir="ltr"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full min-h-[48px] rounded-xl py-3 pr-11 pl-11 text-sm text-left transition-all duration-200 focus:outline-none hover:border-orange-500/60 focus:border-orange-500 ${
                          isDayMode
                            ? 'bg-white/95 border border-slate-300 text-slate-900 placeholder-slate-400'
                            : 'bg-slate-950/85 border border-white/15 text-white placeholder-slate-500'
                        }`}
                      />
                      <Lock className="w-4 h-4 text-orange-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg cursor-pointer ${
                          isDayMode ? 'text-slate-500 hover:text-orange-600' : 'text-slate-400 hover:text-orange-400'
                        }`}
                        aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-rose-400 font-bold mt-1.5">
                        كلمتا المرور غير متطابقتين
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full min-h-[54px] py-3.5 px-6 rounded-xl bg-gradient-to-l from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:via-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base shadow-[0_12px_32px_-6px_rgba(249,115,22,0.55)] hover:shadow-[0_16px_42px_-4px_rgba(249,115,22,0.75)] hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>جاري حفظ كلمة المرور...</span>
                      </>
                    ) : (
                      <span>حفظ كلمة المرور الجديدة</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-right" noValidate>
                  <div>
                    <label
                      htmlFor="login-email"
                      className={`block text-xs font-bold mb-1.5 ${
                        isDayMode ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      البريد الإلكتروني للمؤسس
                    </label>
                    <div className="relative group">
                      <input
                        id="login-email"
                        type="email"
                        required
                        dir="ltr"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={OWNER_EMAIL}
                        className={`w-full min-h-[48px] rounded-xl py-3 pr-11 pl-3.5 text-sm text-left transition-all duration-200 focus:outline-none hover:border-orange-500/60 focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.28)] ${
                          isDayMode
                            ? 'bg-white/95 border border-slate-300 text-slate-900 placeholder-slate-400'
                            : 'bg-slate-950/85 border border-white/15 text-white placeholder-slate-500'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-orange-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-focus-within:scale-110" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="login-password"
                        className={`block text-xs font-bold ${
                          isDayMode ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      >
                        كلمة المرور
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer transition-colors"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                    <div className="relative group">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        dir="ltr"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full min-h-[48px] rounded-xl py-3 pr-11 pl-11 text-sm text-left transition-all duration-200 focus:outline-none hover:border-orange-500/60 focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.28)] ${
                          isDayMode
                            ? 'bg-white/95 border border-slate-300 text-slate-900 placeholder-slate-400'
                            : 'bg-slate-950/85 border border-white/15 text-white placeholder-slate-500'
                        }`}
                      />
                      <Lock className="w-4 h-4 text-orange-400/90 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-focus-within:scale-110" />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer transition-colors ${
                          isDayMode
                            ? 'text-slate-500 hover:text-orange-600'
                            : 'text-slate-400 hover:text-orange-400'
                        }`}
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full min-h-[54px] py-3.5 px-6 rounded-xl bg-gradient-to-l from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:via-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base shadow-[0_12px_32px_-6px_rgba(249,115,22,0.55)] hover:shadow-[0_16px_42px_-4px_rgba(249,115,22,0.75)] hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>جاري التحقق...</span>
                      </>
                    ) : (
                      <>
                        <span>دخول</span>
                        <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Founder Exclusivity Note */}
              <div className="pt-1 text-center space-y-2.5">
                <p
                  className={`text-xs font-bold leading-relaxed font-['Tajawal','Cairo',sans-serif] ${
                    isDayMode ? 'text-slate-700' : 'text-slate-200'
                  }`}
                >
                  إدارة كل التجار من حساب المؤسس الواحد
                </p>

                <p
                  className={`text-[11px] leading-relaxed font-['Tajawal','Cairo',sans-serif] ${
                    isDayMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  التجار لا يدخلون — يديرهم المؤسس بالإيميل، Seller ID، رابط الوجهة، رابط المتجر، والهاتف
                </p>

                <div
                  className={`pt-3 border-t flex items-center justify-center gap-2 text-[11px] ${
                    isDayMode
                      ? 'border-slate-200 text-slate-600'
                      : 'border-white/[0.08] text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>محمي بـ Supabase RLS</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-mono ${isDayMode ? 'text-slate-800' : 'text-slate-300'}`}
                    dir="ltr"
                  >
                    {OWNER_EMAIL}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* LEFT SECTION (60%): Live Why Radar? Control Showcase */}
        <section
          aria-label="لماذا رادار"
          className="w-full lg:w-[60%] flex flex-col justify-center"
        >
          <div className="w-full max-w-2xl mx-auto space-y-5">
            <motion.header
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2.5 text-right"
            >
              <p className="text-xs sm:text-sm font-bold text-orange-500 tracking-wide">
                غرفة قيادة التجارة الإلكترونية في السوق المصري
              </p>

              <h2
                className={`text-3xl sm:text-5xl lg:text-[3.25rem] font-black leading-tight text-balance ${
                  isDayMode ? 'text-slate-900' : 'text-white'
                }`}
              >
                لماذا{' '}
                <span className="text-orange-500 drop-shadow-[0_0_28px_rgba(249,115,22,0.65)]">
                  رادار
                </span>
                ؟
              </h2>

              <p
                className={`text-xs sm:text-sm leading-relaxed font-['Tajawal','Cairo',sans-serif] max-w-xl ${
                  isDayMode ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                راقب السوق لحظة بلحظة، اكشف تحركات المنافسين فوراً، وأدر مخزون جميع التجار والمنصات من شاشة تحكم واحدة.
              </p>
            </motion.header>

            {/* 3 Animated Counters */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-3 gap-3 sm:gap-4"
            >
              <div
                className={`p-3 sm:p-3.5 rounded-2xl border backdrop-blur-xl text-center ${
                  isDayMode
                    ? 'bg-white/70 border-orange-500/25 shadow-sm'
                    : 'bg-slate-900/45 border-white/15 shadow-lg'
                }`}
              >
                <div
                  dir="ltr"
                  className="text-xl sm:text-2xl lg:text-3xl font-black text-orange-500 tabular-nums drop-shadow-[0_0_16px_rgba(249,115,22,0.4)]"
                >
                  +{productsCount}
                </div>
                <div
                  className={`text-[11px] sm:text-xs font-bold mt-0.5 ${
                    isDayMode ? 'text-slate-700' : 'text-slate-200'
                  }`}
                >
                  منتج يتم تتبعه
                </div>
              </div>

              <div
                className={`p-3 sm:p-3.5 rounded-2xl border backdrop-blur-xl text-center ${
                  isDayMode
                    ? 'bg-white/70 border-orange-500/25 shadow-sm'
                    : 'bg-slate-900/45 border-white/15 shadow-lg'
                }`}
              >
                <div
                  dir="ltr"
                  className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 tabular-nums drop-shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                >
                  +{tradersCount}
                </div>
                <div
                  className={`text-[11px] sm:text-xs font-bold mt-0.5 ${
                    isDayMode ? 'text-slate-700' : 'text-slate-200'
                  }`}
                >
                  تاجر
                </div>
              </div>

              <div
                className={`p-3 sm:p-3.5 rounded-2xl border backdrop-blur-xl text-center ${
                  isDayMode
                    ? 'bg-white/70 border-orange-500/25 shadow-sm'
                    : 'bg-slate-900/45 border-white/15 shadow-lg'
                }`}
              >
                <div
                  dir="ltr"
                  className="text-xl sm:text-2xl lg:text-3xl font-black text-orange-400 tabular-nums drop-shadow-[0_0_16px_rgba(251,146,60,0.35)]"
                >
                  {hoursCount}/{daysCount}
                </div>
                <div
                  className={`text-[11px] sm:text-xs font-bold mt-0.5 ${
                    isDayMode ? 'text-slate-700' : 'text-slate-200'
                  }`}
                >
                  مراقبة
                </div>
              </div>
            </motion.div>

            {/* 4 Interactive Glowing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {APP_FEATURES.map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <motion.article
                    key={feature.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.18 + idx * 0.08 }}
                    className={`group p-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 hover:-translate-y-1.5 flex flex-col gap-2.5 text-right cursor-default ${
                      isDayMode
                        ? 'bg-white/70 border-slate-200/90 hover:border-orange-500/70 hover:shadow-[0_14px_34px_-10px_rgba(249,115,22,0.3)]'
                        : 'bg-slate-900/45 border-white/[0.12] hover:border-orange-500/65 hover:bg-slate-900/65 hover:shadow-[0_16px_38px_-10px_rgba(249,115,22,0.32)]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 ${
                        isDayMode
                          ? 'bg-orange-500/12 border-orange-500/30 text-orange-600 group-hover:bg-orange-500/20'
                          : 'bg-orange-500/15 border-orange-500/35 text-orange-400 group-hover:bg-orange-500/25 group-hover:shadow-[0_0_18px_rgba(249,115,22,0.45)]'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3
                        className={`text-sm sm:text-base font-extrabold transition-colors ${
                          isDayMode
                            ? 'text-slate-900 group-hover:text-orange-600'
                            : 'text-white group-hover:text-orange-300'
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed font-['Tajawal','Cairo',sans-serif] ${
                          isDayMode ? 'text-slate-600' : 'text-slate-300'
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Pinned Bottom Signature + Continuous Live Price Ticker (Always Visible Above the Fold) */}
      <footer className="fixed bottom-0 inset-x-0 z-30 w-full">
        <div
          className={`border-t backdrop-blur-md ${
            isDayMode
              ? 'bg-white/75 border-orange-500/20'
              : 'bg-[#070910]/80 border-white/10'
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
            <p className={`font-bold ${isDayMode ? 'text-slate-800' : 'text-slate-200'}`}>
              صُنع في مصر 🇪🇬 - <span dir="ltr" className="text-orange-500 font-black">RADAR EGYPT</span> - 2026
            </p>
            <div className={`hidden sm:flex items-center gap-2 text-[11px] ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>أمازون مصر</span>
              <span aria-hidden="true">·</span>
              <span>نون</span>
              <span aria-hidden="true">·</span>
              <span>جوميا</span>
            </div>
          </div>
        </div>

        {/* Continuous Scrolling Price Ticker (Right -> Left, Never Pauses) */}
        <div
          aria-label="شريط أسعار المنتجات المباشر"
          data-testid="live-price-ticker"
          className={`w-full overflow-hidden border-t py-2 backdrop-blur-xl ${
            isDayMode
              ? 'bg-amber-50/95 border-orange-500/35 text-slate-900'
              : 'bg-[#05070D]/95 border-orange-500/35 text-slate-100'
          }`}
        >
          <div dir="ltr" className="radar-ticker-track items-center">
            {[...LIVE_TICKER_QUOTES, ...LIVE_TICKER_QUOTES].map((quote, idx) => (
              <div
                key={`${quote.id}-${idx}`}
                dir="rtl"
                className="inline-flex items-center gap-2.5 px-5 shrink-0 text-xs font-bold whitespace-nowrap"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] shrink-0" />
                <span>{quote.label}</span>
                <span className="text-orange-500 font-bold text-[11px]">({quote.platform})</span>
                <span
                  dir="ltr"
                  className={`font-mono text-[11px] font-black ${
                    quote.isDown ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {quote.delta}
                </span>
                <span className="text-orange-500/40 font-black px-1" aria-hidden="true">
                  |
                </span>
              </div>
            ))}
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <PWAInstallPrompt />
      </Suspense>
    </div>
  );
};

export default LoginPage;
