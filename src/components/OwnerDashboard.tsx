import React from 'react';
import { Shield, Users, CreditCard, FileText } from 'lucide-react';

export default function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-10 font-['Cairo',sans-serif]" dir="rtl">
      <h1 className="text-3xl font-black mb-8 text-amber-500 flex items-center gap-3">
        <Shield /> لوحة تحكم المالك الحصرية
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <Users className="w-8 h-8 text-sky-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">إدارة المستخدمين</h2>
          <p className="text-slate-400">التحكم الكامل في حسابات التاجر والمشتركين.</p>
        </div>
        
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <CreditCard className="w-8 h-8 text-emerald-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">متابعة الاشتراكات</h2>
          <p className="text-slate-400">مراقبة حالات التجديد والمدفوعات.</p>
        </div>
        
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <FileText className="w-8 h-8 text-amber-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">التقارير المالية</h2>
          <p className="text-slate-400">تحميل تقارير الأرباح والوكالة.</p>
        </div>
      </div>
    </div>
  );
}
