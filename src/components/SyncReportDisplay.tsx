import React from 'react';
import { RefreshCw } from 'lucide-react';

export const SyncReportDisplay: React.FC<{
  stats: {
    total: number;
    new: number;
    updated: number;
    dbTotal?: number;
    dbPricedCount?: number;
    dbFirstSamplePrice?: number | null;
  } | null;
}> = ({ stats }) => {
  if (!stats) return null;
  const effectiveTotal = typeof stats.dbTotal === 'number' ? stats.dbTotal : stats.total;
  if (effectiveTotal <= 0) return null;

  return (
    <div
      data-testid="sync-report-display"
      className="flex flex-wrap items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full max-w-3xl"
    >
      <div className="flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-amber-400" />
        <span className="text-sm font-bold text-white">آخر عملية سحب:</span>
      </div>
      <div className="flex flex-wrap gap-4">
        <span className="text-sm text-slate-300">
          الإجمالي في قاعدة البيانات: <strong className="text-white">{effectiveTotal}</strong>
        </span>
        <span className="text-sm text-slate-300">
          جديد: <strong className="text-emerald-400">{stats.new}</strong>
        </span>
        <span className="text-sm text-slate-300">
          محدث: <strong className="text-blue-400">{stats.updated}</strong>
        </span>
        {typeof stats.dbFirstSamplePrice === 'number' && (
          <span className="text-sm text-slate-300">
            السعر من قاعدة البيانات:{' '}
            <strong className="text-amber-300 font-mono">
              {stats.dbFirstSamplePrice.toLocaleString()} ج.م
            </strong>
            {typeof stats.dbPricedCount === 'number' && (
              <span className="text-xs text-emerald-400 font-mono mr-1">
                ({stats.dbPricedCount}/{effectiveTotal} مسعّر)
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

