import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Store, 
  TrendingUp, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Rocket,
  Search,
  BellRing,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface OnboardingGuideModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onShowToast?: (message: string) => void;
}

export const OnboardingGuideModal: React.FC<OnboardingGuideModalProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onShowToast
}) => {
  const STORAGE_KEY_ONBOARDING_SEEN = 'merchant_radar_onboarding_seen_v1';
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    // Check if user has seen onboarding before
    if (typeof window !== 'undefined' && externalIsOpen === undefined) {
      const seen = localStorage.getItem(STORAGE_KEY_ONBOARDING_SEEN);
      if (!seen) {
        // Show automatically on first visit after a brief delay
        const timer = setTimeout(() => {
          setInternalIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [externalIsOpen]);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ONBOARDING_SEEN, 'true');
    }
    if (externalOnClose) {
      externalOnClose();
    }
    setInternalIsOpen(false);
  };

  const steps = [
    {
      title: 'مرحباً بك في رادار التاجر المصري الذكي ⚡',
      subtitle: 'المنصة المتكاملة الأولى لتجار أمازون، نون، وجوميا في مصر',
      description: 'نظام ذكي متطور يتيح لك تتبع أسعار المنافسين لحظياً، حماية هوامش الربح، إدارة المخزون، وربط الطلبات في لوحة تحكم واحدة فائقة السرعة.',
      icon: <Store className="w-8 h-8 text-sky-400" />,
      badge: 'الخطوة الأولى: نظرة عامة',
      color: 'from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-400'
    },
    {
      title: 'رصد أسعار المنافسين والصفقات اللحظية 📈',
      subtitle: 'ابق متقدماً بخطوة دائماً في السوق المصري',
      description: 'راقب تحركات أسعار المنافسين على Amazon.eg و Noon و Jumia بدقة ثانية بثانية، مع تنبيهات فورية عند حدوث أي هبوط أو ارتفاع في الأسعار.',
      icon: <TrendingUp className="w-8 h-8 text-emerald-400" />,
      badge: 'الخطوة الثانية: رادار المنافسين',
      color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-400'
    },
    {
      title: 'استيراد منتجات التريند والأعلى مبيعات (الصين 👈 مصر) 🛒',
      subtitle: 'اكتشف السلع الأكثر ربحية طلباً في السوق',
      description: 'تصفح كتالوج السلع الأكثر طلباً المستوردة من الصين مع حاسبة أرباح شاملة لمصاريف الشحن والجمارك وهامش صافي الربح بالجنيه المصري.',
      icon: <Search className="w-8 h-8 text-amber-400" />,
      badge: 'الخطوة الثالثة: سلع التريند والأرباح',
      color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-400'
    },
    {
      title: 'تثبيت التطبيق على جهازك وشهادة الاعتماد 📱',
      subtitle: 'يعمل كبرنامج مستقل (PWA) دون متصفح وبدون إنترنت',
      description: 'استიد زر "تثبيت الهواتف الذكية" أو "تثبيت الويندوز" في أي وقت من الشريط العلوي للحصول على تطبيق فائق السرعة مع شهادة اعتماد رقمية موثقة.',
      icon: <Smartphone className="w-8 h-8 text-purple-400" />,
      badge: 'الخطوة الرابعة: التثبيت المستقل',
      color: 'from-purple-500/25 to-indigo-600/25 border-purple-500/30 text-purple-400'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
      onShowToast?.('🎉 تهانينا! أنت جاهز تماماً لاستخدام رادار التاجر الذكي بكفاءة عالية.');
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isModalOpen) return null;

  const currentItem = steps[currentStep];

  return (
    <div 
      id="modal-onboarding-guide"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden relative text-right text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600" />

        {/* Header with Skip Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
            <span className="text-xs font-black text-sky-400 tracking-wider uppercase">
              دليل الاستخدام السريع ({currentStep + 1} / {steps.length})
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            تخطي التعليمات ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-5">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentItem.color} border flex items-center justify-center shadow-lg`}>
            {currentItem.icon}
          </div>

          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700">
              {currentItem.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {currentItem.title}
            </h2>
            <h3 className="text-xs sm:text-sm font-bold text-sky-300">
              {currentItem.subtitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              {currentItem.description}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-sky-400' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>{currentStep === steps.length - 1 ? 'ابدأ الآن 🚀' : 'التالي'}</span>
            {currentStep < steps.length - 1 && <ChevronLeft className="w-4 h-4 text-slate-950" />}
          </button>
        </div>
      </div>
    </div>
  );
};
