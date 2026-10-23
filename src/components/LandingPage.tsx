import React from 'react';
import { ArrowRight, Zap, TrendingUp, ShieldCheck, Smartphone, Download } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  const downloadApk = () => {
    const link = document.createElement('a');
    link.href = '/radar-al-tajer-signed.apk';
    link.download = 'radar-al-tajer-signed.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const features = [
    { icon: <Zap className="w-8 h-8 text-amber-500" />, title: 'تحديثات فورية', description: 'راقب الأسعار والمخزون لحظة بلحظة.' },
    { icon: <TrendingUp className="w-8 h-8 text-emerald-500" />, title: 'تحليل دقيق', description: 'تقارير أداء متقدمة لزيادة مبيعاتك.' },
    { icon: <ShieldCheck className="w-8 h-8 text-sky-500" />, title: 'أمان موثوق', description: 'حماية بيانات متجرك بأعلى المعايير.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Cairo',sans-serif] p-6" dir="rtl">
      <nav className="max-w-7xl mx-auto flex justify-between items-center py-6">
        <div className="text-2xl font-black text-amber-500">رادار التاجر</div>
        <div className="flex items-center gap-3">
          <ThemeToggle variant="pill" />
          <button 
            onClick={downloadApk}
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-full font-bold border border-emerald-500/40 text-xs flex items-center gap-2 transition"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>تحميل تطبيق الأندرويد APK المعتمد</span>
          </button>
          <button onClick={onLoginClick} className="px-6 py-2 bg-slate-800 rounded-full font-bold hover:bg-slate-700 transition text-sm">تسجيل الدخول</button>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto mt-20 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">سيطر على مبيعاتك في <span className="text-amber-500">أمازون، نون، وجوميا</span></h1>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">أداة الرادار الذكي توفر لك رؤية شاملة، تحديثات فورية، وأدوات إدارة متقدمة لتنمية تجارتك الإلكترونية.</p>
        
        <div className="flex flex-wrap justify-center items-center gap-4 mb-20">
          <button onClick={onLoginClick} className="px-10 py-4 bg-amber-600 text-slate-950 rounded-full font-extrabold text-lg hover:bg-amber-500 transition flex items-center gap-2">
            ابدأ تجربتك المجانية الآن <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={downloadApk} className="px-8 py-4 bg-slate-900 border border-emerald-500/40 text-emerald-300 rounded-full font-extrabold text-lg hover:bg-slate-800 transition flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <span>تحميل تطبيق الهاتف (radar-al-tajer-signed.apk)</span>
          </button>
        </div>

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
