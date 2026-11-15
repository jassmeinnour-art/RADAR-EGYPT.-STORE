import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  Mail,
  Hash,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { navigate } from '../utils/navigation';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { DraggableHandle } from './DraggableHandle';
import {
  supabase,
  supabaseClient,
  isSupabaseConfigured,
  setSupabaseSession,
  Trader,
} from '../lib/supabase';
import { RADAR_PULL_TO_REFRESH_EVENT } from './PullToRefresh';
import { SmartPriceAlertsPanel } from './SmartPriceAlertsPanel';
import { MaintenanceModeToggleCard } from './MaintenanceModeControl';
import { SponsoredAdsSection } from './SponsoredAdsSection';
import { ErrorBoundary } from './ErrorBoundary';

interface DashboardHomeProps {
  onShowToast?: (msg: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onShowToast }) => {
  const { user, profile, isOwner, isFounderMode, toggleFounderMode, signOut } = useAuth();
  const [traders, setTraders] = useState<Trader[]>([]);
  const [tradersLoaded, setTradersLoaded] = useState<boolean>(false);
  const [tradersFetchFailed, setTradersFetchFailed] = useState<boolean>(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const tradersRef = useRef<HTMLDivElement>(null);

  // Fetch traders strictly in the background AFTER initial static homepage has painted
  useEffect(() => {
    let active = true;

    const redirectToLogin = async () => {
      try {
        await signOut();
      } catch {
        // safe
      }
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.replaceState({}, '', '/login');
        navigate('/login');
      }
    };

    const loadTradersInBackground = async () => {
      try {
        // 1. Verify active session + access_token before querying traders
        if (isSupabaseConfigured && supabaseClient) {
          const { data: sessionData, error: sessionErr } = await supabaseClient.auth.getSession();
          const session = sessionData?.session;

          if (sessionErr) {
            console.error('[DashboardHome] Session check error:', sessionErr);
          }

          if (!session?.access_token) {
            if (active) await redirectToLogin();
            return;
          }

          const sessionEmail = String(session.user?.email || '').trim().toLowerCase();
          if (sessionEmail !== OWNER_EMAIL) {
            if (active) await redirectToLogin();
            return;
          }

          setSupabaseSession(session);
        } else {
          // Local / Firebase mode check
          const activeEmail = String(profile?.email || user?.email || '').trim().toLowerCase();
          if (!user || user.isAnonymous || activeEmail !== OWNER_EMAIL) {
            if (active) await redirectToLogin();
            return;
          }
        }

        // 2. Background fetch of traders using authenticated session access_token
        const { data, error } = await supabase.from('traders').select('*');
        if (!active) return;

        if (error) {
          console.error('[DashboardHome] Background traders fetch failed:', error);
          setTradersFetchFailed(true);
          setTradersLoaded(true);
          return;
        }

        setTraders(Array.isArray(data) ? (data as Trader[]) : []);
        setTradersFetchFailed(false);
        setTradersLoaded(true);
      } catch (err) {
        console.error('[DashboardHome] Background traders fetch exception:', err);
        if (active) {
          setTradersFetchFailed(true);
          setTradersLoaded(true);
        }
      }
    };

    let rafId = 0;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      rafId = window.requestAnimationFrame(() => {
        timerId = globalThis.setTimeout(loadTradersInBackground, 60);
      });
    } else {
      timerId = globalThis.setTimeout(loadTradersInBackground, 60);
    }

    const handleRefresh = () => {
      loadTradersInBackground();
    };
    window.addEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);

    return () => {
      active = false;
      if (rafId && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafId);
      }
      if (timerId !== undefined) {
        globalThis.clearTimeout(timerId);
      }
      window.removeEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
    };
  }, [user, profile?.email, signOut]);

  const whyCards = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'تتبع الأسعار',
      desc: 'اعرف سعر منتجك وسعر منافسك لحظة بلحظة لضمان البقاء في الصدارة.',
    },
    {
      icon: <Users className="w-6 h-6 text-sky-500" />,
      title: 'إدارة التجار',
      desc: 'كل تجارك ومنتجاتهم في مكان واحد بلمحة بصر، مجمعين من كل المنصات.',
    },
    {
      icon: <Bell className="w-6 h-6 text-emerald-500" />,
      title: 'تنبيهات فورية',
      desc: 'لو منافس غيّر سعره أو نفد مخزونه - يجيلك تنبيه فوراً للتحرك السريع.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
      title: 'تقارير ذكية',
      desc: 'مبيعاتك وأرباحك وترتيبك في السوق المصري موضحة برسوم بيانية دقيقة.',
    },
  ];

  const steps = [
    { number: '1', title: 'أضف تاجرك', desc: 'اكتب الاسم + Seller ID + الإيميل + المنصة (أمازون، نون، جوميا).' },
    { number: '2', title: 'أضف منتجاتك', desc: 'أضف منتجاتك يدوياً أو اسحبها تلقائياً بضغطة زر من متجرك المربوط.' },
    { number: '3', title: 'تابع الأسعار', desc: 'رادار يقارن سعرك بسعر المنافسين كل يوم ويحدث البيانات لحظياً.' },
    { number: '4', title: 'استقبل التنبيهات', desc: 'عدّل سعرك قبل ما تخسر مبيعاتك بناءً على تنبيهات التغيير الذكية.' },
  ];

  const isFounderUser = Boolean(
    user &&
      !user.isAnonymous &&
      isOwner &&
      (profile?.email || user?.email || '').trim().toLowerCase() === OWNER_EMAIL
  );

  const features = [
    {
      icon: <Sliders className="w-5 h-5 text-amber-400" />,
      title: 'لوحة التحكم الكاملة',
      desc: 'تحكم في عرض القائمة والأزرار والخط بما يناسب مظهرك المفضل وعرض ملخص العمليات.',
      isActionable: true,
      action: () => {
        navigate('/dashboard');
      },
    },
    ...(isFounderUser
      ? [
          {
            icon: <Shield className="w-5 h-5 text-indigo-400" />,
            title: 'وضع المؤسس',
            desc: 'تحكم كامل في أحجام الإطارات بالسحب - خاص بمؤسس التطبيق فقط.',
            isActionable: true,
            action: () => {
              toggleFounderMode();
              const nextState = !isFounderMode;
              try {
                localStorage.setItem('isFounderMode', String(nextState));
                localStorage.setItem('radar_founder_mode', String(nextState));
                localStorage.setItem('founder_mode_active', String(nextState));
                window.dispatchEvent(new CustomEvent('founder_mode_changed', { detail: { active: nextState } }));
              } catch {}
              if (onShowToast) {
                onShowToast(
                  nextState
                    ? 'تم تفعيل وضع المؤسس! ظهرت مقابض التعديل بالسحب على الكروت.'
                    : 'تم إيقاف وضع المؤسس وإخفاء المقابض.'
                );
              }
            },
          },
        ]
      : []),
    {
      icon: <Download className="w-5 h-5 text-emerald-400" />,
      title: 'زر تحميل عائم',
      desc: 'يظهر بذكاء عند البحث عن "تحميل" ويختفي فوراً بعد انتهاء التحميل.',
      isActionable: true,
      action: () => {
        window.location.href = '/radar-al-tajer-signed.apk';
      },
    },
    {
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      title: 'تنبيهات حقيقية',
      desc: 'بيانات مستمدة من الفواتير والمنصات الحقيقية فقط - لا بيانات وهمية.',
      isActionable: false,
    },
    {
      icon: <Lock className="w-5 h-5 text-slate-400" />,
      title: 'أمان البيانات',
      desc: 'بيانات التجار في Supabase مشفرة وتُدار حصرياً عبر حساب المؤسس (jassmeinnour@gmail.com).',
      isActionable: false,
    },
  ];

  return (
    <div className="w-full space-y-12 pb-20 font-['Cairo'] text-right" dir="rtl">
      {/* 1. Hero Section (Static — renders immediately) */}
      <ErrorBoundary sectionName="home-hero" sectionTitle="مقدمة رادار الترحيبية" sectionDescription="تعذر تحميل ترويسة الصفحة مؤقتاً، باقي أقسام المنصة تعمل بشكل طبيعي.">
        <section
          ref={heroRef}
          className="relative min-h-[380px] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden"
        >
          <DraggableHandle elementId="home_hero" targetRef={heroRef} position="bottom-left" />

          <div className="relative z-10 space-y-6 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              رادار - <span className="text-amber-500">التاجر الذكي</span>
            </h1>

            <p className="text-lg text-slate-300 font-bold leading-relaxed">
              تابع منتجاتك وأسعارك ومنافسيك في مكان واحد - على أمازون ونون وجوميا
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/traders')}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>ابدأ الآن - اذهب للتجار</span>
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => stepsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 transition-colors duration-200 cursor-pointer"
              >
                شاهد كيف يعمل
              </button>
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* 2. Founder Controls (Each widget isolated in its own ErrorBoundary) */}
      {isFounderUser && (
        <div className="space-y-6">
          <ErrorBoundary sectionName="home-maintenance-mode" sectionTitle="مفتاح وضع الصيانة" compact>
            <MaintenanceModeToggleCard onShowToast={onShowToast} compact />
          </ErrorBoundary>
          <ErrorBoundary sectionName="home-smart-alerts" sectionTitle="تنبيهات الأسعار الذكية">
            <SmartPriceAlertsPanel compact onShowToast={onShowToast} />
          </ErrorBoundary>
        </div>
      )}

      {/* 3. Why Radar Section (Static — renders immediately) */}
      <ErrorBoundary sectionName="home-why-radar" sectionTitle="قسم لماذا رادار">
        <section ref={whyRef} className="relative space-y-8">
          <DraggableHandle elementId="home_why" targetRef={whyRef} position="bottom-right" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white">لماذا رادار؟ 🎯</h2>
            <p className="text-slate-400 text-sm font-bold">كل ما تحتاجه للسيطرة على السوق وزيادة أرباحك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyCards.map((card, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-amber-500/30 transition-colors duration-200 shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-black text-white mb-2">{card.title}</h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ErrorBoundary>

      {/* 4. How to use Section (Static — renders immediately) */}
      <ErrorBoundary sectionName="home-how-to-use" sectionTitle="قسم كيفية الاستخدام">
        <section ref={stepsRef} className="relative bg-slate-900/50 border border-slate-800 p-8 md:p-12 rounded-[3rem]">
          <DraggableHandle elementId="home_steps" targetRef={stepsRef} position="bottom-left" />
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white">كيفية الاستخدام 🛠️</h2>
            <p className="text-slate-400 text-sm font-bold">4 خطوات بسيطة لتبدأ رحلتك مع رادار</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-black text-white/5 absolute -top-4 -right-4 pointer-events-none">
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
      </ErrorBoundary>

      {/* 5. Features Section (Static — renders immediately) */}
      <ErrorBoundary sectionName="home-features" sectionTitle="خواص التطبيق الاحترافية">
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
                  <div
                    className={`flex items-start justify-between gap-4 p-4 bg-slate-900/40 border rounded-2xl transition-colors duration-200 ${
                      f.isActionable
                        ? 'border-amber-500/40 hover:border-amber-500 hover:bg-slate-900 cursor-pointer'
                        : 'border-slate-800/50'
                    }`}
                  >
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
                      <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs shrink-0 self-center">
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

          <div className="relative p-6 bg-slate-950 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-indigo-500/5" />
            <Sliders className="w-24 h-24 text-amber-500/20" />
            <div className="absolute bottom-8 right-8 left-8 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-white">حساب المؤسس الحصري ⚡</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold">
                {traders.length > 0
                  ? `متصل الآن: ${traders.length} تاجر مدار عبر حساب المؤسس`
                  : 'إدارة كل التجار والمنصات عبر حساب المؤسس فقط (jassmeinnour@gmail.com)'}
              </p>
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* 6. Traders Summary Section (Isolated ErrorBoundary — non-blocking background fetch) */}
      <ErrorBoundary sectionName="home-traders" sectionTitle="ملخص قائمة التجار" sectionDescription="تعذر جلب قائمة التجار في هذه اللحظة. يمكنك إعادة المحاولة أو الانتقال لصفحة إدارة التجار مباشرة.">
        <section
          ref={tradersRef}
          aria-label="قسم التجار"
          className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] space-y-5 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">قسم التجار 👥</h2>
                <p className="text-xs text-slate-400 font-bold">
                  التجار لا يدخلون — المؤسس فقط ({OWNER_EMAIL}) يدير حساباتهم
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/traders')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-center"
            >
              <span>إدارة كل التجار</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {traders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {traders.slice(0, 6).map((t) => {
                const emailVal = t.email || t.gmail || '—';
                const destUrl = t.destination_url || t.seller_link || '';
                const storeUrl = t.store_url || t.storefront_link || '';
                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-white truncate">{t.seller_name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                        {t.platform || 'amazon'}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate font-mono" dir="ltr">{emailVal}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Hash className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate font-mono" dir="ltr">{t.seller_id || t.id}</span>
                      </div>
                      {t.phone && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate font-mono" dir="ltr">{t.phone}</span>
                        </div>
                      )}
                      {(destUrl || storeUrl) && (
                        <div className="flex items-center gap-1.5 truncate text-slate-400">
                          <ExternalLink className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span className="truncate font-mono" dir="ltr">{storeUrl || destUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <p className="text-sm font-bold text-slate-300">
                {tradersFetchFailed || tradersLoaded
                  ? 'لا توجد بيانات - سجل دخول أولاً'
                  : 'لا توجد بيانات - سجل دخول أولاً'}
              </p>
            </div>
          )}
        </section>
      </ErrorBoundary>

      {/* 7. Sponsored Ads Section (Static — renders immediately, isolated ErrorBoundary) */}
      <ErrorBoundary sectionName="home-sponsored-ads" sectionTitle="إعلانات الشركاء الممولة">
        <SponsoredAdsSection />
      </ErrorBoundary>

      {/* 8. Bottom CTA Button */}
      <ErrorBoundary sectionName="home-cta" sectionTitle="زر التوجيه لإدارة التجار" compact>
        <section className="pt-6 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/traders')}
            className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg rounded-2xl shadow-2xl shadow-amber-500/25 transition-colors duration-200 flex items-center gap-3 cursor-pointer"
          >
            <span>اذهب للتجار</span>
            <ArrowLeft className="w-6 h-6" />
          </button>
        </section>
      </ErrorBoundary>
    </div>
  );
};

export default DashboardHome;
