import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

export const SeasonalDemandForecast: React.FC = () => {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 font-['Cairo'] text-right" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-black text-white">توقع الطلب الموسمي والذروة</h4>
          <p className="text-xs text-slate-400 font-bold">تحليل فترات الذروة واحتياجات المخزون المستقبلية</p>
        </div>
      </div>
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
        <p className="text-xs text-slate-300 font-bold">فترة الذروة القادمة متوقعة خلال عطلات نهاية الأسبوع ومواسم التخفيضات.</p>
        <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-mono">
          <TrendingUp className="w-4 h-4" />
          <span>معدل الطلب المتوقع: +35%</span>
        </div>
      </div>
    </div>
  );
};

export default SeasonalDemandForecast;
