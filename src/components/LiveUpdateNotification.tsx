import React from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ArrowUpCircle, 
  CheckCircle2, 
  X, 
  Zap, 
  Download, 
  Layers, 
  Info, 
  Check, 
  Radio, 
  Loader2 
} from 'lucide-react';
import { AppUpdateState } from '../hooks/useAppUpdate';

export interface LiveUpdateNotificationProps {
  updateState: AppUpdateState;
  variant?: 'banner' | 'header-button' | 'settings-card' | 'inline-badge';
  className?: string;
  onShowToast?: (msg: string) => void;
}

export const LiveUpdateNotification: React.FC<LiveUpdateNotificationProps> = ({
  updateState,
  variant = 'banner',
  className = '',
  onShowToast,
}) => {
  const {
    hasUpdate,
    showUpdateModal,
    isChecking,
    isUpdating,
    currentVersion,
    serverVersion,
    lastChecked,
    isBannerDismissed,
    dismissBanner,
    checkForUpdates,
    applyUpdate,
  } = updateState;

  // 1. Header Button / Pill Variant (Unified with the Update Modal state and One-Click Clean Update handler)
  if (variant === 'header-button') {
    if (!hasUpdate) return null;

    return (
      <button
        type="button"
        id="btn-header-update-badge"
        onClick={applyUpdate}
        disabled={isUpdating}
        className={`h-10 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black font-['Alexandria'] flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer border border-emerald-400/40 shrink-0 select-none ${className}`}
        title="تحديث الآن وتفريغ الكاش بضغطة واحدة"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        {isUpdating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>جاري التحديث...</span>
          </>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            <span className="hidden sm:inline">تحديث الآن وتفريغ الكاش ⚡</span>
            <span className="sm:hidden">تحديث الآن ⚡</span>
          </>
        )}
      </button>
    );
  }

  // 2. Settings Card Variant (Inside Settings or System Diagnostics Modal)
  if (variant === 'settings-card') {
    return (
      <div 
        id="card-live-update-settings"
        className={`p-4 rounded-2xl border transition-all text-right ${
          hasUpdate 
            ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-300 shadow-sm' 
            : 'bg-slate-50 border-slate-200'
        } ${className}`}
        dir="rtl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              hasUpdate ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
            }`}>
              {hasUpdate ? <Sparkles className="w-5 h-5 animate-pulse" /> : <RefreshCw className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-black text-slate-900">
                  نظام التحديثات الذكية الفورية (Live & PWA Update)
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  hasUpdate 
                    ? 'bg-emerald-600 text-white animate-pulse' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {hasUpdate ? 'تحديث متاح ⚡' : 'مُحدّث بالكامل ✓'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                الإصدار الحالي: <strong className="text-slate-800 font-mono">v{currentVersion}</strong>
                {serverVersion && serverVersion !== currentVersion && (
                  <span className="text-emerald-700 font-bold mr-2"> ⟵ الإصدار الجديد: v{serverVersion}</span>
                )}
                {lastChecked && (
                  <span className="text-slate-400 block text-[10px] mt-0.5">
                    آخر فحص تلقائي: {lastChecked.toLocaleTimeString('ar-EG')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-200/60 flex-wrap">
          {hasUpdate ? (
            <button
              type="button"
              id="btn-settings-apply-update"
              onClick={applyUpdate}
              disabled={isUpdating}
              className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تفريغ الكاش وتحميل التحديث...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-sky-300" />
                  <span>تحديث الآن وتفريغ الكاش ⚡</span>
                </>
              )}
            </button>
          ) : null}

          <button
            type="button"
            id="btn-settings-manual-check-update"
            onClick={() => checkForUpdates(true)}
            disabled={isChecking || isUpdating}
            className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="فحص فوري لوجود تحديثات أو تعديلات تمت على المشروع في ستوديو جوجل"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-indigo-600' : 'text-slate-600'}`} />
            <span>{isChecking ? 'جاري الفحص...' : 'فحص التحديثات الآن'}</span>
          </button>

          <button
            type="button"
            id="btn-settings-force-purge-cache"
            onClick={applyUpdate}
            disabled={isUpdating}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="تفريغ ذاكرة التخزين المؤقتة (Cache) بالكامل وإعادة تحميل الصفحة بأحدث ملفات"
          >
            <span>تفريغ الكاش وإعادة التحميل</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Floating / Sticky Banner Variant (Primary notification when update is ready)
  if (!hasUpdate || !showUpdateModal || isBannerDismissed) {
    return null;
  }

  return (
    <div
      id="live-app-update-notification-banner"
      className={`fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fadeIn ${className}`}
      dir="rtl"
    >
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-emerald-400/50 relative overflow-hidden backdrop-blur-md">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md border border-white/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>يوجد تحديث جديد للمنظومة</span>
                  <span className="text-sky-300">⚡</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                  إصدار جديد متاح
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 mt-1 leading-relaxed">
                تم توفير ميزات وتعديلات جديدة للمشروع من خلال ستوديو جوجل. اضغط للتحديث لتفريغ الكاش القديم والتحويل للنسخة الأحدث فوراً.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-dismiss-app-update"
            onClick={dismissBanner}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="إخفاء التنبيه مؤقتاً (يمكنك التحديث لاحقاً من الزر العائم)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t border-white/10 relative z-10">
          <button
            type="button"
            id="btn-apply-app-update"
            onClick={applyUpdate}
            disabled={isUpdating}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 select-none"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري تفريغ الكاش وتطبيق التحديث...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-slate-950" />
                <span>تحديث الآن وتفريغ الكاش ⚡</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={dismissBanner}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-xs transition-colors cursor-pointer select-none"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};
