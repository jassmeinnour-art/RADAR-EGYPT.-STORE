import React from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';

export const SalesTrendsWidget: React.FC = () => {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 font-['Cairo'] text-right" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-black text-white">اتجاهات المبيعات الحية</h4>
          <p className="text-xs text-slate-400 font-bold">تحليل حركة الطلبات والمبيعات في السوق المصري</p>
        </div>
      </div>
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
        <p className="text-xs text-slate-300 font-bold">المبيعات مستقرة وتسجل نمواً إيجابياً هذا الأسبوع.</p>
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
          <TrendingUp className="w-4 h-4" />
          <span>معدل النمو: +18.4%</span>
        </div>
      </div>
    </div>
  );
};

export default SalesTrendsWidget;
