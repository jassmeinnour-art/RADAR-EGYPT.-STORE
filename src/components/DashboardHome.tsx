import React from 'react';
import { 
  Zap, 
  Users, 
  Bell, 
  BarChart3, 
  ArrowLeft, 
  Shield, 
  Sliders, 
  Download, 
  Lock, 
  ExternalLink, 
  Info,
  CheckCircle2,
  ChevronLeft,
  Plus
} from 'lucide-react';
import { navigate } from '../utils/navigation';
import { useAuth } from '../context/AuthContext';
import { DraggableHandle } from './DraggableHandle';
import { useRef } from 'react';
import bayyaaLogo from '../assets/images/regenerated_image_1794400223452.png';

interface DashboardHomeProps {
  onShowToast?: (msg: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onShowToast }) => {
  const { user, profile, isOwner, isFounderMode, toggleFounderMode } = useAuth();
  
  const heroRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const adsRef = useRef<HTMLDivElement>(null);

  const whyCards = [
    { 
      icon: <Zap className="w-6 h-6 text-amber-500" />, 
      title: 'تتبع الأسعار', 
      desc: 'اعرف سعر منتجك وسعر منافسك لحظة بلحظة لضمان البقاء في الصدارة.' 
    },
    { 
      icon: <Users className="w-6 h-6 text-sky-500" />, 
      title: 'إدارة التجار', 
      desc: 'كل تجارك ومنتجاتهم في مكان واحد بلمحة بصر، مجمعين من كل المنصات.' 
    },
    { 
      icon: <Bell className="w-6 h-6 text-emerald-500" />, 
      title: 'تنبيهات فورية', 
      desc: 'لو منافس غيّر سعره أو نفد مخزونه - يجيلك تنبيه فوراً للتحرك السريع.' 
    },
    { 
      icon: <BarChart3 className="w-6 h-6 text-indigo-500" />, 
      title: 'تقارير ذكية', 
      desc: 'مبيعاتك وأرباحك وترتيبك في السوق المصري موضحة برسوم بيانية دقيقة.' 
    },
  ];

  const steps = [
    { number: '1', title: 'أضف تاجرك', desc: 'اكتب الاسم + Seller ID + الإيميل + المنصة (أمازون، نون، جوميا).' },
    { number: '2', title: 'أضف منتجاتك', desc: 'أضف منتجاتك يدوياً أو اسحبها تلقائياً بضغطة زر من متجرك المربوط.' },
    { number: '3', title: 'تابع الأسعار', desc: 'رادار يقارن سعرك بسعر المنافسين كل يوم ويحدث البيانات لحظياً.' },
    { number: '4', title: 'استقبل التنبيهات', desc: 'عدّل سعرك قبل ما تخسر مبيعاتك بناءً على تنبيهات التغيير الذكية.' },
  ];

  const features = [
    { 
      icon: <Sliders className="w-5 h-5 text-amber-400" />, 
      title: 'لوحة التحكم الكاملة', 
      desc: 'تحكم في عرض القائمة والأزرار والخط بما يناسب مظهرك المفضل وعرض ملخص العمليات.',
      isActionable: true,
      action: () => {
        navigate('/dashboard');
      }
    },
    { 
      icon: <Shield className="w-5 h-5 text-indigo-400" />, 
      title: 'وضع المؤسس', 
      desc: 'تحكم كامل في أحجام الإطارات بالسحب - خاص بمؤسس التطبيق فقط.',
      isActionable: true,
      action: () => {
        const userEmail = (profile?.email || user?.email || '').trim().toLowerCase();
        if (userEmail === 'jassmeinnour@gmail.com') {
          toggleFounderMode();
          const nextState = !isFounderMode;
          try {
            localStorage.setItem('isFounderMode', String(nextState));
            localStorage.setItem('radar_founder_mode', String(nextState));
            localStorage.setItem('founder_mode_active', String(nextState));
            window.dispatchEvent(new CustomEvent('founder_mode_changed', { detail: { active: nextState } }));
          } catch {}
          if (onShowToast) {
            onShowToast(nextState ? 'تم تفعيل وضع المؤسس! ظهرت مقابض التعديل بالسحب على الكروت.' : 'تم إيقاف وضع المؤسس وإخفاء المقابض.');
          }
        } else {
          alert('عذراً، وضع المؤسس متاح حصرياً لـ jassmeinnour@gmail.com فقط.');
        }
      }
    },
    { 
      icon: <Download className="w-5 h-5 text-emerald-400" />, 
      title: 'زر تحميل عائم', 
      desc: 'يظهر بذكاء عند البحث عن "تحميل" ويختفي فوراً بعد انتهاء التحميل.',
      isActionable: true,
      action: () => {
        window.location.href = '/radar-al-tajer-signed.apk';
      }
    },
    { 
      icon: <Zap className="w-5 h-5 text-sky-400" />, 
      title: 'تنبيهات حقيقية', 
      desc: 'بيانات مستمدة من الفواتير والمنصات الحقيقية فقط - لا بيانات وهمية.',
      isActionable: false
    },
    { 
      icon: <Lock className="w-5 h-5 text-slate-400" />, 
      title: 'أمان البيانات', 
      desc: 'بياناتك في Supabase مشفرة - كل تاجر يرى بياناته الخاصة فقط.',
      isActionable: false
    },
  ];

  return (
    <div className="w-full space-y-12 pb-20 font-['Cairo'] text-right" dir="rtl">
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden"
      >
        <DraggableHandle elementId="home_hero" targetRef={heroRef} position="bottom-left" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 space-y-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            رادار - <span className="text-amber-500">التاجر الذكي</span>
          </h1>
          
          <p className="text-lg text-slate-300 font-bold leading-relaxed">
            تابع منتجاتك وأسعارك ومنافسيك في مكان واحد - على أمازون ونون وجوميا
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/traders')}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>ابدأ الآن - اذهب للتجار</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => stepsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              شاهد كيف يعمل
            </button>
          </div>
        </div>
      </section>

      {/* Why Radar Section */}
      <section ref={whyRef} className="relative space-y-8">
        <DraggableHandle elementId="home_why" targetRef={whyRef} position="bottom-right" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-white">لماذا رادار؟ 🎯</h2>
          <p className="text-slate-400 text-sm font-bold">كل ما تحتاجه للسيطرة على السوق وزيادة أرباحك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyCards.map((card, idx) => (
            <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-amber-500/30 transition shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-lg font-black text-white mb-2">{card.title}</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to use Section */}
      <section ref={stepsRef} className="relative bg-slate-900/50 border border-slate-800 p-8 md:p-12 rounded-[3rem]">
        <DraggableHandle elementId="home_steps" targetRef={stepsRef} position="bottom-left" />
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-white">كيفية الاستخدام 🛠️</h2>
          <p className="text-slate-400 text-sm font-bold">4 خطوات بسيطة لتبدأ رحلتك مع رادار</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="text-6xl font-black text-white/5 absolute -top-4 -right-4 pointer-events-none group-hover:text-amber-500/10 transition-colors">
                {step.number}
              </div>
              <div className="relative z-10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-black text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <DraggableHandle elementId="home_features" targetRef={featuresRef} position="bottom-right" />
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-white">خواص التطبيق الاحترافية 💎</h2>
          <p className="text-slate-400 font-bold leading-relaxed">
            رادار ليس مجرد أداة لتتبع الأسعار، بل هو نظام متكامل مصمم للنمو والاستقرار. الكروت القابلة للضغط مميزة بسهم تفاعلي.
          </p>
          
          <div className="space-y-4">
            {features.map((f, i) => {
              const content = (
                <div className={`flex items-start justify-between gap-4 p-4 bg-slate-900/40 border rounded-2xl transition ${f.isActionable ? 'border-amber-500/40 hover:border-amber-500 hover:bg-slate-900 cursor-pointer group' : 'border-slate-800/50'}`}>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 mt-1 shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white mb-1">{f.title}</h4>
                      <p className="text-[11px] text-slate-400 font-bold">{f.desc}</p>
                    </div>
                  </div>

                  {f.isActionable ? (
                    <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs shrink-0 self-center group-hover:translate-x-[-4px] transition-transform">
                      <span className="hidden sm:inline">اضغط للذهاب</span>
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0 self-center">
                      معلومة معرفية
                    </span>
                  )}
                </div>
              );

              if (f.isActionable && f.action) {
                return (
                  <div key={i} onClick={f.action} role="button" tabIndex={0}>
                    {content}
                  </div>
                );
              }
              return <div key={i}>{content}</div>;
            })}
          </div>
        </div>

        <div className="relative p-6 bg-slate-950 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden aspect-video flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-indigo-500/5" />
          <Sliders className="w-24 h-24 text-amber-500/20 group-hover:scale-110 transition-transform" />
          <div className="absolute bottom-8 right-8 left-8 p-6 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-white">بيانات Supabase حية ⚡</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">تحديث فوري لكل الحركات المالية والمخزنية</p>
          </div>
        </div>
      </section>

      {/* Sponsored Ads Section */}
      <section ref={adsRef} className="relative pt-12 border-t border-slate-800/50 space-y-8">
        <DraggableHandle elementId="home_ads" targetRef={adsRef} position="top-right" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-white">إعلانات ممولة 📣</h2>
          <p className="text-slate-500 text-[10px] font-bold">هذه إعلانات ممولة - لا يوجد ربط بين رادار والمعلنين</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bayyaa Ad */}
          <div className="col-span-1 lg:col-span-1 p-6 bg-slate-900 border-2 border-orange-500/30 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full group">
            <div className="absolute -top-3 left-6 z-20 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-lg">
              إعلان ممول
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 p-0.5 shadow-xl flex items-center justify-center">
                <img 
                  src={bayyaaLogo} 
                  alt="Bayyaa" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">بياع (Bayyaa)</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">سوق التجار المستقل لبيع المنتجات مباشرة للمستهلك.</p>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Info className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] text-amber-500 font-black">إعلان - لا يوجد ربط بين رادار وبياع</span>
              </div>
            </div>

            <button 
              onClick={() => window.open('https://bayyaa.com', '_blank')}
              className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-sm rounded-xl transition flex items-center justify-center gap-2 group-hover:scale-95 active:scale-90 cursor-pointer"
            >
              <span>زيارة بياع</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Placeholder Ads */}
          <div className="p-8 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Plus className="w-6 h-6 text-slate-500" />
            </div>
            <h4 className="text-sm font-black text-slate-400">مساحة إعلانية متاحة</h4>
            <p className="text-[10px] text-slate-500 font-bold">تواصل معنا لحجز مساحتك الإعلانية هنا</p>
          </div>

          <div className="p-8 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Plus className="w-6 h-6 text-slate-500" />
            </div>
            <h4 className="text-sm font-black text-slate-400">مساحة إعلانية متاحة</h4>
            <p className="text-[10px] text-slate-500 font-bold">روّج لمتجرك أو خدمتك أمام آلاف التجار يومياً</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Button */}
      <section className="pt-6 flex justify-center">
        <button 
          onClick={() => navigate('/traders')}
          className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg rounded-2xl shadow-2xl shadow-amber-500/25 transition-all active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          <span>اذهب للتجار</span>
          <ArrowLeft className="w-6 h-6" />
        </button>
      </section>

    </div>
  );
};

export default DashboardHome;
