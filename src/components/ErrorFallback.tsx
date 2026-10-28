import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo?: React.ErrorInfo | null;
  onReset?: () => void;
  sectionName?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  onReset,
  sectionName
}) => {
  useEffect(() => {
    // Automatically trigger immediate resume without blocking the screen
    const timer = setTimeout(() => {
      if (onReset) {
        onReset();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [onReset]);

  return (
    <div
      className="p-3 my-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3 font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
        <span className="font-bold text-white">
          جاري التحديث الذاتي التلقائي لقسم ({sectionName || 'المنظومة'}) في الخلفية...
        </span>
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
        >
          متابعة فورية
        </button>
      )}
    </div>
  );
};

