import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Globe2,
  TrendingUp,
  BarChart3,
  Layers,
  Award,
  CheckCircle2,
  ArrowUpRight,
  Calculator,
  Presentation,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { RadarGlobalHeroVisual } from './RadarGlobalHeroVisual';
import { RadarBrandLogo } from './RadarBrandLogo';

export interface InvestorPitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLiveDemo?: () => void;
}

export const InvestorPitchDeckModal: React.FC<InvestorPitchDeckModalProps> = ({
  isOpen,
  onClose,
  onStartLiveDemo,
}) => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [monthlyGmvUsd, setMonthlyGmvUsd] = useState<number>(250000);
  const [connectedStoresCount, setConnectedStoresCount] = useState<number>(12);

  if (!isOpen) return null;

  // Dynamic ROAS & Margin Uplift Calculations for Slide 3
  const projectedMarginLiftUsd = Math.round(monthlyGmvUsd * 0.148);
  const annualNetValueUsd = projectedMarginLiftUsd * 12;
  const estimatedRoas = (4.2 + Math.min(2.6, connectedStoresCount * 0.08)).toFixed(1);

  const slides = [
    {
      id: 'vision',
      number: '01',
      title: 'رؤية RADAR العالمية للرصد والتسعير اللحظي',
      subtitle: 'Global Marketplaces Real-Time Price Tracking Infrastructure',
    },
    {
      id: 'coverage',
      number: '02',
      title: 'النموذج العملي لتغطية الأسواق (Amazon · Noon · Jumia)',
      subtitle: 'Multi-Region Telemetry & Automated Buy Box Execution',
    },
    {
      id: 'roas',
      number: '03',
      title: 'إحصائيات القيمة السوقية وعائد الاستثمار (ROAS & Analytics)',
      subtitle: 'Merchant & E-Commerce Agency Margin Expansion Engine',
    },
    {
      id: 'business_model',
      number: '04',
      title: 'نموذج الإيرادات السحابي والفرصة الاستثمارية',
      subtitle: 'SaaS Unit Economics, Market Size (TAM) & Scalability',
    },
  ];

  const handleNext = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div
      id="investor-pitch-deck-modal"
      className="fixed inset-0 z-50 bg-[#08090D]/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
      dir="rtl"
    >
      <div className="relative w-full max-w-6xl bg-[#0B0D14] border border-sky-500/30 rounded-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95),0_0_50px_-12px_rgba(14, 165, 233,0.22)] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Deck Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-sky-500/20 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <RadarBrandLogo className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wider bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Outfit','Alexandria']">
                  RADAR — INVESTOR PITCH DECK
                </span>
                <span className="text-xs text-sky-300/80">
                  · الشريحة {activeSlide + 1} من {slides.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {slides[activeSlide].title} — <span dir="ltr">{slides[activeSlide].subtitle}</span>
              </p>
            </div>
          </div>

          {/* Slide Selector Buttons & Close */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-[#08090D] p-1 rounded-lg border border-sky-500/20">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSlide === idx
                      ? 'bg-gradient-to-r from-sky-400 to-sky-600 text-[#08090D] font-black shadow-sm'
                      : 'text-slate-400 hover:text-sky-200'
                  }`}
                >
                  <span className="font-mono">{s.number}.</span>
                  <span>{s.id === 'vision' ? 'الرؤية العالمية' : s.id === 'coverage' ? 'تغطية الأسواق' : s.id === 'roas' ? 'عائد الاستثمار ROAS' : 'النموذج الاستثماري'}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
              <span>إغلاق العرض</span>
            </button>
          </div>
        </div>

        {/* Slide Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* SLIDE 1: GLOBAL VISION & HERO GLOBE */}
          {activeSlide === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs font-semibold text-sky-400 tracking-wide">
                  01. الرؤية المعمارية والربط العالمي الفوري
                </div>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Alexandria']">
                  RADAR: البنية التحتية الموحدة لتتبع أسعار الماركت بليس عالمياً ولحظياً
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  يعالج <strong className="text-sky-300">RADAR</strong> فجوة تسعيرية تتجاوز 4.2 مليار دولار في أسواق التجارة الإلكترونية عبر ربط كبرى المنصات العالمية والإقليمية (<strong className="text-white">Amazon, Noon, Jumia</strong>) بشبكة رصد لحظية تعيد تسعير المنتجات تلقائياً لاقتناص صندوق الشراء (Buy Box) وحماية هوامش الربح.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-lg bg-slate-900/80 border border-sky-500/20 backdrop-blur-md">
                    <div className="text-xs text-slate-400">سرعة استجابة الرادار</div>
                    <div className="text-xl font-black text-sky-400 font-mono tabular-nums mt-1">&lt; 450ms</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">تزامن لحظي عبر SP-API وWebhooks</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900/80 border border-sky-500/20 backdrop-blur-md">
                    <div className="text-xs text-slate-400">دقة مطابقة الـ SKU</div>
                    <div className="text-xl font-black text-sky-400 font-mono tabular-nums mt-1">99.8%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">عبر Amazon US/EG وNoon AE وJumia</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveSlide(1)}
                    className="h-9 px-4 rounded-md bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-[#08090D] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/20"
                  >
                    <span>استعراض نموذج تغطية الأسواق</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <RadarGlobalHeroVisual compact />
              </div>
            </div>
          )}

          {/* SLIDE 2: MARKETPLACE COVERAGE MODEL (AMAZON, NOON, JUMIA) */}
          {activeSlide === 1 && (
            <div className="space-y-6">
              <div className="max-w-3xl">
                <div className="text-xs font-semibold text-sky-400">
                  02. النموذج العملي لتغطية الأسواق الإقليمية والعالمية
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mt-1 bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Alexandria']">
                  تغطية ثلاثية متكاملة: Amazon · Noon · Jumia
                </h2>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                  يربط محرك RADAR نقاط التسعير العالمية والمحلية في لوحة قيادة واحدة، مما يمنح التجار والوكالات رؤية فورية لفروق الأسعار والعمولات وتكاليف الجملة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Amazon Card */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-sky-500/25 backdrop-blur-md flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-white font-['Outfit']">amazon</span>
                      <span className="text-xs font-mono text-sky-300">US · EG · SA · AE</span>
                    </div>
                    <div className="text-2xl font-black text-sky-400 font-mono tabular-nums">$119.99</div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      تكامل كامل مع واجهات <strong className="text-white">Amazon SP-API</strong> لرصد عروض FBA وFBM واقتناص الـ Buy Box تلقائياً في أقل من ثانية.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-sky-500/15 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">نسبة الفوز بـ Buy Box:</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">معدل التحديث السعري:</span>
                      <span className="font-mono font-bold text-sky-300 tabular-nums">Real-Time Stream</span>
                    </div>
                  </div>
                </div>

                {/* Noon Card */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-sky-500/25 backdrop-blur-md flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-sky-400 font-['Outfit']">noon نون</span>
                      <span className="text-xs font-mono text-sky-300">AE · SA · EG</span>
                    </div>
                    <div className="text-2xl font-black text-sky-400 font-mono tabular-nums">$87.50</div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      تتبع فوري لعروض <strong className="text-white">Noon Express</strong> وحساب صافي الهامش بعد خصم رسوم الشحن والعمولات البنكية والضريبية.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-sky-500/15 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">تغطية الكتالوج النشط:</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">940,000+ SKUs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">حماية الحد الأدنى للربح:</span>
                      <span className="font-mono font-bold text-sky-300 tabular-nums">Automated Guardrails</span>
                    </div>
                  </div>
                </div>

                {/* Jumia Card */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-sky-500/25 backdrop-blur-md flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-sky-300 font-['Outfit']">JUMIA ★</span>
                      <span className="text-xs font-mono text-sky-300">NG · EG · KE · MA</span>
                    </div>
                    <div className="text-2xl font-black text-sky-400 font-mono tabular-nums">$64.20</div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      مراقبة الأسعار التنافسية وحملات <strong className="text-white">Flash Sales</strong> عبر الأسواق الأفريقية والمصرية ومزامنة المخزون المركزي.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-sky-500/15 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">نمو المبيعات الإقليمي:</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">+41.5% YoY</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">تصدير ومزامنة الكتالوج:</span>
                      <span className="font-mono font-bold text-sky-300 tabular-nums">1-Click Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: ROAS & MARKET RADAR ANALYTICS + INTERACTIVE SIMULATOR */}
          {activeSlide === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-4">
                <div className="text-xs font-semibold text-sky-400">
                  03. إحصائيات القيمة السوقية وعائد الاستثمار (ROAS & Market Radar Analytics)
                </div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Alexandria']">
                  عائد استثمار مضاعف للتجار ووكالات إدارة المتاجر
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  تُثبت بيانات التشغيل الفعلية لمنصة RADAR ارتفاع متوسط العائد على الإنفاق التسويقي والتسعيري (<strong className="text-sky-300">ROAS</strong>) إلى <strong className="text-white font-mono">4.8x</strong> بفضل التسعير اللحظي وتجنب حروب الأسعار العشوائية.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-500/20">
                    <div className="text-xs text-slate-400">متوسط عائد الوكالات (ROAS)</div>
                    <div className="text-2xl font-black text-sky-400 font-mono tabular-nums mt-1">{estimatedRoas}x</div>
                    <div className="text-[11px] text-emerald-400 mt-1">+34.8% نمو في صافي الهامش</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-500/20">
                    <div className="text-xs text-slate-400">الاستحواذ على Buy Box</div>
                    <div className="text-2xl font-black text-sky-400 font-mono tabular-nums mt-1">89.4%</div>
                    <div className="text-[11px] text-sky-200/80 mt-1">مقابل 52% قبل تفعيل الرادار</div>
                  </div>
                </div>
              </div>

              {/* Interactive Investor / Agency ROI Simulator */}
              <div className="lg:col-span-6 p-5 rounded-xl bg-slate-900/80 border border-sky-500/30 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-sky-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-black text-white">محاكي عائد الاستثمار التفاعلي (ROAS & Profit Simulator)</h3>
                  </div>
                  <span className="text-xs font-mono text-sky-300">Live Model</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-bold">حجم المبيعات الشهري المدار (Monthly GMV):</span>
                      <span className="font-mono font-black text-sky-300 tabular-nums">
                        ${monthlyGmvUsd.toLocaleString('en-US')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={25000}
                      max={2000000}
                      step={25000}
                      value={monthlyGmvUsd}
                      onChange={(e) => setMonthlyGmvUsd(Number(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-bold">عدد المتاجر / القنوات المتصلة:</span>
                      <span className="font-mono font-black text-sky-300 tabular-nums">
                        {connectedStoresCount} متجر
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      step={1}
                      value={connectedStoresCount}
                      onChange={(e) => setConnectedStoresCount(Number(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-sky-500/20">
                  <div>
                    <div className="text-[11px] text-slate-400">الزيادة الشهرية في صافي الربح</div>
                    <div className="text-lg font-black text-emerald-400 font-mono tabular-nums mt-0.5">
                      +${projectedMarginLiftUsd.toLocaleString('en-US')} / mo
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">العائد السنوي المضاف (Annual Lift)</div>
                    <div className="text-lg font-black text-sky-300 font-mono tabular-nums mt-0.5">
                      +${annualNetValueUsd.toLocaleString('en-US')} / yr
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: SAAS UNIT ECONOMICS & INVESTMENT ROADMAP */}
          {activeSlide === 3 && (
            <div className="space-y-6">
              <div className="max-w-3xl">
                <div className="text-xs font-semibold text-sky-400">
                  04. اقتصاديات الوحدة ونموذج الأعمال السحابي (B2B SaaS & Enterprise)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mt-1 bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Alexandria']">
                  نموذج إيرادات متكرر عالي الهامش وقابل للتوسع الإقليمي والدولي
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-slate-900/80 border border-sky-500/20 space-y-2">
                  <div className="text-xs text-sky-300 font-semibold">حجم السوق المستهدف (TAM)</div>
                  <div className="text-3xl font-black text-white font-mono tabular-nums">$4.2B</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    أكثر من 850,000 تاجر ووكالة تجارة إلكترونية نشطة عبر الشرق الأوسط وأفريقيا والأسواق العالمية المرتبطة بـ Amazon وNoon وJumia.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/80 border border-sky-500/20 space-y-2">
                  <div className="text-xs text-sky-300 font-semibold">كفاءة الاستحواذ (LTV : CAC)</div>
                  <div className="text-3xl font-black text-sky-400 font-mono tabular-nums">6.4x</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    هامش ربح إجمالي للبرمجيات السحابية (Gross Margin) يبلغ 84% مع فترة استرداد تكلفة العميل أقل من شهرين.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/80 border border-sky-500/20 space-y-2">
                  <div className="text-xs text-sky-300 font-semibold">معدل الاحتفاظ بصافي الإيرادات (NRR)</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono tabular-nums">128%</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    نمو تلقائي في اشتراكات التجار مع زيادة عدد الـ SKUs وربط قنوات بيع إضافية عبر محرك RADAR الموحد.
                  </p>
                </div>
              </div>

              {onStartLiveDemo && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500/15 via-slate-900 to-sky-500/10 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-white">جاهز لتجربة منصة RADAR الحية؟</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      انتقل مباشرة إلى لوحة الرصد والتسعير الفوري لاستكشاف الربط الحي مع Amazon وNoon وJumia.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartLiveDemo();
                    }}
                    className="h-9 px-5 rounded-md bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-[#08090D] text-xs font-black whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/25"
                  >
                    <span>بدء التجربة الحية للمنصة</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Deck Footer Controls */}
        <div className="px-5 py-3.5 border-t border-sky-500/20 bg-slate-900/90 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="h-8 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الشريحة السابقة</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="h-8 px-3.5 rounded-md bg-sky-500 hover:bg-sky-400 text-[#08090D] font-black flex items-center gap-1 cursor-pointer"
            >
              <span>الشريحة التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-sky-200/80 font-mono tracking-wider hidden sm:block" dir="ltr">
            RADAR · GLOBAL MARKETPLACES REAL-TIME TRACKING
          </div>
        </div>
      </div>
    </div>
  );
};

export const InvestorPitchDeck = InvestorPitchDeckModal;
export default InvestorPitchDeckModal;

