import React from 'react';
import { RefreshCw } from 'lucide-react';

export const SyncReportDisplay: React.FC<{ stats: { total: number; new: number; updated: number } }> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full max-w-2xl">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-amber-400" />
        <span className="text-sm font-bold text-white">آخر عملية سحب:</span>
      </div>
      <div className="flex gap-4">
        <span className="text-sm text-slate-300">الإجمالي: <strong className="text-white">{stats.total}</strong></span>
        <span className="text-sm text-slate-300">جديد: <strong className="text-emerald-400">{stats.new}</strong></span>
        <span className="text-sm text-slate-300">محدث: <strong className="text-blue-400">{stats.updated}</strong></span>
      </div>
    </div>
  );
};
