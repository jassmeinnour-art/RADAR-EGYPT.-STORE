import React from 'react';
import { ArrowRight, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  const features = [
    { icon: <Zap className="w-8 h-8 text-amber-500" />, title: 'تحديثات فورية', description: 'راقب الأسعار والمخزون لحظة بلحظة.' },
    { icon: <TrendingUp className="w-8 h-8 text-emerald-500" />, title: 'تحليل دقيق', description: 'تقارير أداء متقدمة لزيادة مبيعاتك.' },
    { icon: <ShieldCheck className="w-8 h-8 text-sky-500" />, title: 'أمان موثوق', description: 'حماية بيانات متجرك بأعلى المعايير.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Cairo',sans-serif] p-6" dir="rtl">
      <nav className="max-w-7xl mx-auto flex justify-between items-center py-6">
        <div className="text-2xl font-black text-amber-500">رادار التاجر</div>
        <button onClick={onLoginClick} className="px-6 py-2 bg-slate-800 rounded-full font-bold hover:bg-slate-700 transition">تسجيل الدخول</button>
      </nav>
      
      <main className="max-w-7xl mx-auto mt-20 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">سيطر على مبيعاتك في <span className="text-amber-500">أمازون، نون، وجوميا</span></h1>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">أداة الرادار الذكي توفر لك رؤية شاملة، تحديثات فورية، وأدوات إدارة متقدمة لتنمية تجارتك الإلكترونية.</p>
        <button onClick={onLoginClick} className="px-10 py-4 bg-amber-600 text-slate-950 rounded-full font-extrabold text-lg hover:bg-amber-500 transition flex items-center gap-2 mx-auto mb-20">
          ابدأ تجربتك المجانية الآن <ArrowRight className="w-5 h-5" />
        </button>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 bg-slate-900 rounded-3xl border border-slate-800">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
