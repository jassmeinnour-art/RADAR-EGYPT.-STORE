import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function clearStaleRadarCache(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith('radar-card-size') ||
        k.startsWith('radar-user') ||
        k === 'merchant_radar_demo_user' ||
        k === 'radar_cached_data'
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // safe
  }
}

interface EmergencyErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export const EmergencyErrorBanner: React.FC<EmergencyErrorBannerProps> = ({
  message = 'لا توجد بيانات — تعذر جلب البيانات حالياً',
  onRetry,
}) => {
  return (
    <div
      className="p-5 rounded-2xl border border-rose-500/40 bg-rose-950/40 text-right flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-4"
      dir="rtl"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <p className="text-sm font-black text-white">لا توجد بيانات</p>
          <p className="text-xs text-rose-200/90 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      )}
    </div>
  );
};
