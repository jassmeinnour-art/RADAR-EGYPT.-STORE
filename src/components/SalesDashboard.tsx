import React from 'react';
import { LineChart as LineIcon, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

export const SalesDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 font-['Cairo'] text-right" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <LineIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">لوحة أداء المبيعات والتسعير 📈</h2>
          <p className="text-xs text-slate-400">متابعة إيرادات المبيعات وأوامر الشحن اللحظية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الإيرادات</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">185,000 ج.م</div>
          <div className="text-[11px] text-emerald-400 font-bold">+15% عن الشهر السابق</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>عدد الطلبات</span>
            <ShoppingCart className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">510 طلب</div>
          <div className="text-[11px] text-sky-400 font-bold">معدل إتمام 98%</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>معدل النمو</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">+24.2%</div>
          <div className="text-[11px] text-amber-400 font-bold">أداء متميز في السوق</div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
