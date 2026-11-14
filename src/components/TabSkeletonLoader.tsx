import React from 'react';
import { EmergencyLoginButton } from './EmergencyLoginButton';

interface TabSkeletonLoaderProps {
  title?: string;
  subtitle?: string;
  onGoToLogin?: () => void;
}

export const TabSkeletonLoader: React.FC<TabSkeletonLoaderProps> = ({
  onGoToLogin,
}) => {
  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-6xl mx-auto" dir="rtl">
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-800 rounded" />
          <div className="h-3 w-56 bg-slate-800/60 rounded" />
        </div>
        {onGoToLogin ? (
          <button
            type="button"
            onClick={onGoToLogin}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
          >
            تخطي والذهاب لتسجيل الدخول
          </button>
        ) : (
          <EmergencyLoginButton />
        )}
      </div>
    </div>
  );
};
