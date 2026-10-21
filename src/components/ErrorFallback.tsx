import React, { useState } from 'react';
import { RefreshCw, Home, ShieldAlert, ChevronDown, ChevronUp, Copy, Check, Terminal } from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo?: React.ErrorInfo | null;
  onReset?: () => void;
  sectionName?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
  sectionName
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleHardReload = () => {
    try {
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  const errorMessage = error?.message || 'حدث خطأ غير متوقع في معالجة البيانات داخل المنظومة.';
  const errorStack = error?.stack || '';
  const componentStack = errorInfo?.componentStack || '';

  const fullReport = `=== تقرير الخطأ التقني - رادار التاجر الذكي ===\nقسم: ${sectionName || 'النظام العام'}\nالرسالة: ${errorMessage}\n\nStack:\n${errorStack}\n\nComponent Stack:\n${componentStack}`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(fullReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className="min-h-[420px] w-full flex items-center justify-center p-4 sm:p-6 font-['Cairo',sans-serif] bg-slate-950/40"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-right relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-white">
                عذراً، حدث خطأ غير متوقع {sectionName ? `في قسم (${sectionName})` : ''}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                وضع الحماية الآمن 🛡️
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              نعتذر عن هذا الخلل المؤقت. لقد قمنا بتفعيل نظام الحماية الذكي لمنع توقف المنظومة، وجميع بياناتك وأسعارك مسجلة وفي أمان تام.
            </p>
          </div>
        </div>

        {/* Friendly User Message Box */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 text-xs sm:text-sm text-slate-200 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span>يمكنك الضغط على زر استئناف العمل أو إعادة تحميل الصفحة للمتابعة الفورية.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>استئناف العمل فوراً</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleHardReload}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>إعادة تحميل الصفحة (Reload)</span>
          </button>
        </div>

        {/* Hidden / Expandable Technical Details for Admins Only */}
        <div className="border-t border-slate-800 pt-4 mt-2">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-xs font-bold text-slate-400 hover:text-sky-400 flex items-center gap-2 cursor-pointer transition-colors w-full justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>التفاصيل التقنية (خاص بالمسؤولين والمديرين)</span>
            </span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">سجل الخطأ والستاك تريس:</span>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ التقرير'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto max-h-48 text-left" dir="ltr">
                <div className="font-bold text-amber-400 mb-1">{errorMessage}</div>
                {errorStack && <div className="text-slate-400 whitespace-pre-wrap">{errorStack}</div>}
                {componentStack && <div className="text-slate-500 whitespace-pre-wrap mt-2">{componentStack}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
