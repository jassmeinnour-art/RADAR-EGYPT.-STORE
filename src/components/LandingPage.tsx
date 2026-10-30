import React from 'react';
import { ArrowRight, Zap, TrendingUp, ShieldCheck, Smartphone, Download } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { BayyaaAndMersadOverviewSection } from './BayyaaAndMersadOverviewSection';

export default function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  const downloadApk = () => {
    // Direct location invocation triggers Android native DownloadManager with APK package headers
    window.location.href = '/radar-al-tajer-signed.apk';
  };

  const features = [
    { icon: <Zap className="w-8 h-8 text-amber-500" />, title: 'تحديثات فورية', description: 'راقب الأسعار والمخزون لحظة بلحظة.' },
    { icon: <TrendingUp className="w-8 h-8 text-emerald-500" />, title: 'تحليل دقيق', description: 'تقارير أداء متقدمة لزيادة مبيعاتك.' },
    { icon: <ShieldCheck className="w-8 h-8 text-sky-500" />, title: 'أمان موثوق', description: 'حماية بيانات متجرك بأعلى المعايير.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Cairo',sans-serif] p-4 sm:p-6 w-full max-w-full overflow-x-hidden" dir="rtl">
      <nav className="max-w-7xl mx-auto flex justify-between items-center py-6 flex-wrap gap-4">
        <div className="text-2xl font-black text-amber-500">رادار التاجر</div>
        <div className="flex items-center gap-3 flex-wrap">
          <ThemeToggle variant="pill" />
          <LanguageToggle />
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
      
      <main className="max-w-7xl mx-auto mt-6 sm:mt-10 text-center space-y-12">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-8 leading-tight">
          سيطر على مبيعاتك في <span className="text-amber-500">أمازون، نون، وجوميا</span>
        </h1>
        
        {/* Prominent Combined Section: Bayyaa Platform & Mersad Philosophy Side-by-Side */}
        <BayyaaAndMersadOverviewSection
          onOpenMerchantsDirectory={onLoginClick}
          onOpenSubscription={onLoginClick}
          onOpenRadar={onLoginClick}
        />

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-12">
          {features.map((feat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-2">
              <div className="p-3 bg-slate-950 rounded-xl w-fit border border-slate-800 mb-3">{feat.icon}</div>
              <h3 className="text-lg font-black text-white">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
