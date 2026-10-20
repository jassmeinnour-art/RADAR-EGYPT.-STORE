import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, X, ChevronDown, ChevronUp, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { AppDiagnosticError } from '../hooks/useGlobalErrorMonitor';

interface GlobalErrorHandlerProps {
  activeError: AppDiagnosticError | null;
  onDismiss: () => void;
  onSelfHeal: () => void;
}

export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({
  activeError,
  onDismiss,
  onSelfHeal,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  if (!activeError) return null;

  return (
    <div
      id="global-error-recovery-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-[9999] animate-fadeIn"
      dir="rtl"
    >
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-sky-500/50 relative overflow-hidden backdrop-blur-md">
        
        {/* Glow backdrop */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">
                  مراقب الأخطاء التلقائي: تم رصد تعطل مؤقت
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-400/30">
                  حماية الواجهة
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeError.suggestedSolutionArabic}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Technical diagnosis expandable */}
        {activeError.technicalDetails && (
          <div className="mt-3 relative z-10">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>تفاصيل الخطأ البرمجي الدقيق</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <div 
                className="mt-2 p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto max-h-32 text-left text-ltr" 
                dir="ltr"
              >
                {activeError.message}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t border-slate-800 relative z-10">
          <button
            type="button"
            id="btn-self-heal-now"
            onClick={onSelfHeal}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إصلاح تلقائي واستعادة الشاشة الآن</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            تجاهل والمتابعة
          </button>
        </div>

      </div>
    </div>
  );
};
