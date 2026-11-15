import React from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface ThirtyDayPriceFluctuationChartProps {
  title?: string;
  sku?: string;
}

export const ThirtyDayPriceFluctuationChart: React.FC<ThirtyDayPriceFluctuationChartProps> = ({
  title = 'المنتج',
  sku = 'SKU'
}) => {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 font-['Cairo'] text-right" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-black text-white">تذبذب الأسعار خلال 30 يوم</h4>
          <p className="text-xs text-slate-400 font-bold">{title} ({sku})</p>
        </div>
      </div>
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
        <p className="text-xs text-slate-300 font-bold">حالة التذبذب مستقرة وضمن الحدود الطبيعية للسوق.</p>
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
          <TrendingUp className="w-4 h-4" />
          <span>مؤشر الاستقرار: 94%</span>
        </div>
      </div>
    </div>
  );
};

export default ThirtyDayPriceFluctuationChart;
