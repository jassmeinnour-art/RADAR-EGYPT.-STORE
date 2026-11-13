import React from 'react';
import { Sparkles } from 'lucide-react';

interface TabSkeletonLoaderProps {
  title?: string;
  subtitle?: string;
}

export const TabSkeletonLoader: React.FC<TabSkeletonLoaderProps> = () => {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Skeleton */}
      <div 
        className="p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-48 sm:w-64 bg-slate-800 rounded-lg" />
            <div className="h-3.5 w-64 sm:w-96 bg-slate-800/60 rounded-md" />
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
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
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
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
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
