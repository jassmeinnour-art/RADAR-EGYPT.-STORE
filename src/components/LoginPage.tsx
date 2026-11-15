import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  LogIn,
  UserPlus,
  User as UserIcon,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { clearStaleRadarCache } from './EmergencyLoginButton';

const PWAInstallPrompt = lazy(() => import('./PWAInstallPrompt'));

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { signInWithEmail, signUpWithEmail, clearLoginError, authInitError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear any old localStorage keys that could hang the app on /login
  useEffect(() => {
    clearStaleRadarCache();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    clearLoginError();

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(cleanEmail, password);
        onLoginSuccess?.();
      } else {
        await signUpWithEmail(
          cleanEmail,
          password,
          displayName.trim() || undefined,
          storeName.trim() || undefined
        );
        setSuccessMsg('تم إنشاء الحساب بنجاح!');
        onLoginSuccess?.();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'الإيميل أو كلمة المرور غلط');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col items-center justify-center p-4 font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Static RADAR Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 p-1.5 flex items-center justify-center shadow-lg">
            <img
              src="/pwa-512x512.png"
              alt="RADAR"
              width={56}
              height={56}
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-wide">RADAR</h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950">
                EGYPT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-1">
              رادار التاجر الذكي — تسجيل الدخول الآمن
            </p>
          </div>
        </div>

        {/* Mode Switcher: دخول / إنشاء حساب */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 rounded-lg transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            دخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 rounded-lg transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            إنشاء حساب
          </button>
        </div>

        {/* Missing Supabase Env Vars Non-Blocking Warning */}
        {!isSupabaseConfigured && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-start gap-2.5 text-right"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-amber-300">تأكد من إعدادات Supabase</div>
              <div className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                متغيرات البيئة <span dir="ltr">VITE_SUPABASE_URL</span> و{' '}
                <span dir="ltr">VITE_SUPABASE_ANON_KEY</span> غير مضبوطة حالياً.
              </div>
            </div>
          </div>
        )}

        {/* Red Error Alert */}
        {(errorMsg || authInitError) && (
          <div className="p-3.5 rounded-xl bg-rose-950/90 border-2 border-rose-500 text-rose-100 text-xs font-bold flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg || authInitError}</span>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold">
            {successMsg}
          </div>
        )}

        {/* Static Login / Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right" noValidate>
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم التاجر
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="مثال: محمود سعيد"
                    className="w-full min-h-[46px] bg-slate-900 border border-slate-800 rounded-xl py-2.5 pr-10 pl-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <UserIcon className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم المتجر
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="مثال: متجر القاهرة"
                    className="w-full min-h-[46px] bg-slate-900 border border-slate-800 rounded-xl py-2.5 pr-10 pl-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <Store className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-slate-300 mb-1.5">
              الإيميل
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                required
                dir="ltr"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl py-3 pr-10 pl-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-slate-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                dir="ltr"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl py-3 pr-10 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                tabIndex={-1}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>دخول</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>إنشاء حساب</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Founder Email Fill (still requires password) */}
        <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>محمي بـ Supabase RLS</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setEmail(OWNER_EMAIL);
              setMode('signin');
              setErrorMsg(null);
            }}
            className="text-amber-400 hover:underline font-bold cursor-pointer"
          >
            تعبئة إيميل المؤسس
          </button>
        </div>
      </div>
      <Suspense fallback={null}>
        <PWAInstallPrompt />
      </Suspense>
    </div>
  );
};

export default LoginPage;
