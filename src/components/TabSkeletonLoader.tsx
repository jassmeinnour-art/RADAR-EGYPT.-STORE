import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, LogIn } from 'lucide-react';

interface TabSkeletonLoaderProps {
  title?: string;
  subtitle?: string;
  onGoToLogin?: () => void;
}

export const TabSkeletonLoader: React.FC<TabSkeletonLoaderProps> = ({
  title = 'جارٍ تحميل بياناتك...',
  subtitle = 'يرجى الانتظار لحظات للتحقق من الجلسة وتجهيز مساحة العمل',
  onGoToLogin,
}) => {
  const [showRecoveryActions, setShowRecoveryActions] = useState(false);

  // Enforce a strict 3-second maximum wait before showing recovery buttons
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowRecoveryActions(true);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleReloadApp = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleGoToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin();
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('merchant_radar_demo_user');
        localStorage.removeItem('merchant_radar_session_email_override');
      } catch {}
      window.location.assign('/login');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Recovery Actions Banner (shown strictly after 3 seconds max) */}
      {showRecoveryActions && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/40 bg-slate-900/95 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-amber-300">
              استغرق التحميل وقتاً أطول من المتوقع
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              يمكنك إعادة تحميل التطبيق أو الانتقال مباشرة لصفحة تسجيل الدخول.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleReloadApp}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة تحميل التطبيق</span>
            </button>
            <button
              type="button"
              onClick={handleGoToLogin}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>الذهاب لتسجيل الدخول</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Skeleton */}
      <div 
        className="p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--card-bg, #0f172a)', borderColor: 'var(--card-border, #1e293b)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-black text-white">{title}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-24 bg-slate-800 rounded-xl" />
          <div className="h-9 w-28 bg-amber-500/20 border border-amber-500/30 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <div 
            key={idx}
            className="p-4 rounded-2xl border shadow-md space-y-3 relative overflow-hidden"
            style={{ backgroundColor: 'var(--card-bg, #0f172a)', borderColor: 'var(--card-border, #1e293b)' }}
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 bg-slate-800 rounded" />
              <div className="w-4 h-4 rounded-full bg-slate-800" />
            </div>
            <div className="h-7 w-24 bg-slate-800/80 rounded-lg" />
            <div className="h-3 w-16 bg-slate-800/50 rounded" />
          </div>
        ))}
      </div>

      {/* Table / Main Content Skeleton */}
      <div 
        className="p-6 rounded-3xl border shadow-xl space-y-4"
        style={{ backgroundColor: 'var(--card-bg, #0f172a)', borderColor: 'var(--card-border, #1e293b)' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          <div className="h-10 w-full sm:w-72 bg-slate-800/80 rounded-xl" />
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="h-10 w-24 bg-slate-800/80 rounded-xl" />
            <div className="h-10 w-24 bg-slate-800/80 rounded-xl" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((row) => (
            <div 
              key={row}
              className="p-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-4 w-3/4 bg-slate-800 rounded" />
                  <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="hidden sm:block h-4 w-20 bg-slate-800 rounded" />
              <div className="hidden md:block h-4 w-24 bg-slate-800/80 rounded" />
              <div className="h-8 w-20 bg-amber-500/20 rounded-xl border border-amber-500/30 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
