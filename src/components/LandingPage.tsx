import { Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { RadarPhilosophySection } from './RadarPhilosophySection';
import { BayyaaAdBanner } from './BayyaaAdBanner';
import { AnimatedLogosBackground } from './AnimatedLogosBackground';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

export default function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  const features = [
    { icon: <Zap className="w-8 h-8 text-amber-500" />, title: 'تحديثات فورية', description: 'راقب الأسعار والمخزون لحظة بلحظة.' },
    { icon: <TrendingUp className="w-8 h-8 text-emerald-500" />, title: 'تحليل دقيق', description: 'تقارير أداء متقدمة لزيادة مبيعاتك.' },
    { icon: <ShieldCheck className="w-8 h-8 text-sky-500" />, title: 'أمان موثوق', description: 'حماية بيانات متجرك بأعلى المعايير.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Cairo',sans-serif] p-4 sm:p-6 w-full max-w-full overflow-x-hidden relative" dir="rtl">
      
      {/* Rotating Watermark Background (Landing Page Only) */}
      <div className="radar-watermark-bg" style={{ position: 'fixed', bottom: '20px', left: '20px', width: '120px', height: '120px', opacity: 0.07, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <img 
          src="/radar-watermark.png" 
          alt="RADAR" 
          style={{ width: '120px', height: '120px', objectFit: 'contain' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }} 
        />
      </div>

      {/* Fullscreen Animated Logos Background (Landing Page Only) */}
      <AnimatedLogosBackground />

      <nav className="max-w-7xl mx-auto flex justify-between items-center py-6 flex-wrap gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center shadow-lg border-2 border-amber-500 overflow-hidden">
            <img src="/pwa-512x512.png" alt="RADAR" className="w-full h-full object-cover" />
          </div>
          <div className="text-2xl font-black text-white">رادار التاجر</div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ThemeToggle variant="pill" />
          <LanguageToggle />
          <button onClick={onLoginClick} className="px-8 py-2.5 bg-amber-500 text-slate-950 rounded-full font-black hover:bg-amber-400 transition text-sm shadow-lg shadow-amber-500/20 active:scale-95">تسجيل الدخول</button>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto mt-6 sm:mt-10 text-center space-y-16 pb-20">
        <div className="space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black leading-tight">
            سيطر على مبيعاتك في <span className="text-amber-500">منصات التجارة</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-bold">
            الأداة الأولى في مصر لتتبع أسعار المنافسين وإدارة المخزون والعمليات اليومية بشكل مستقل واحترافي.
          </p>
        </div>
        
        {/* Core Radar Section */}
        <RadarPhilosophySection 
          onOpenRadar={onLoginClick}
        />

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {features.map((feat, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-right space-y-2 hover:border-amber-500/30 transition-colors shadow-xl">
              <div className="p-3 bg-slate-950 rounded-xl w-fit border border-slate-800 mb-3">{feat.icon}</div>
              <h3 className="text-lg font-black text-white">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-bold">{feat.description}</p>
            </div>
          ))}
        </div>

        {/* Sponsored Ad Section - Separate and Labeled */}
        <div className="pt-10 border-t border-slate-800/50">
          <BayyaaAdBanner />
        </div>
      </main>
    </div>
  );
}

