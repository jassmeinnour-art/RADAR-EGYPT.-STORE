import React from 'react';

interface TabSkeletonLoaderProps {
  title?: string;
  subtitle?: string;
}

export const TabSkeletonLoader: React.FC<TabSkeletonLoaderProps> = () => {
  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-6xl mx-auto" dir="rtl">
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
        <div className="space-y-2 w-full">
          <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-64 bg-slate-800/60 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};
