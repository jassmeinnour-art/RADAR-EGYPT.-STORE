import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Zap, 
  Keyboard, 
  Target, 
  ShieldCheck,
  Building2,
  Globe,
  Key,
  TrendingUp,
  MousePointer2
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  target?: string;
}

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: TourStep[] = [
    {
      title: "أهلاً بك في رادار التاجر المصري 🇪🇬",
      description: "منصتك المتكاملة للسيطرة على السوق ومراقبة المنافسين على أمازون، نون، وجوميا بأحدث تقنيات الذكاء الاصطناعي.",
      icon: <Sparkles className="w-12 h-12 text-amber-400" />,
    },
    {
      title: "لوحة التاجر (Merchants)",
      description: "إدارة مخزونك، منتجاتك، وتتبع أرباحك وتكاليف الشحن مع بوسطة والشركات الأخرى في مكان واحد.",
      icon: <Building2 className="w-12 h-12 text-sky-400" />,
      shortcut: "Ctrl + 1",
    },
    {
      title: "الرادار والأسعار (Radar)",
      description: "مراقبة حية لأسعار المنافسين. احصل على تنبيهات فورية عند تغيير السعر أو نفاذ مخزون المنافس.",
      icon: <Globe className="w-12 h-12 text-emerald-400" />,
      shortcut: "Ctrl + 2",
    },
    {
      title: "استوديو الذكاء الاصطناعي (AI Studio)",
      description: "حول صور منتجاتك العادية إلى صور احترافية عالمية بضغطة واحدة باستخدام محركات توليد الصور الذكية.",
      icon: <Zap className="w-12 h-12 text-purple-400" />,
      shortcut: "Ctrl + 3",
    },
    {
      title: "ربط المنصات ومفاتيح API",
      description: "اربط متجرك على نون وأمازون لمزامنة الأسعار والمخزون تلقائياً دون تدخل يدوي.",
      icon: <Key className="w-12 h-12 text-amber-500" />,
      shortcut: "Ctrl + 5",
    },
    {
      title: "محرك التسعير الآلي (Auto-Pricing)",
      description: "حدد قواعدك الذكية: 'إذا خفض المنافس سعره، خفض سعري بمقدار 5 جنيهات بشرط ألا يقل عن الحد الأدنى'.",
      icon: <TrendingUp className="w-12 h-12 text-orange-400" />,
      shortcut: "Ctrl + 6",
    },
    {
      title: "اختصارات السرعة (Hotkeys)",
      description: "التنقل السريع هو مفتاح النجاح. استخدم Ctrl + D للتبديل بين الوضع الليلي والنهاري فوراً.",
      icon: <Keyboard className="w-12 h-12 text-slate-400" />,
      shortcut: "Ctrl + D",
    },
    {
      title: "جاهز للانطلاق؟",
      description: "ابدأ الآن في تطوير تجارتك. يمكنك دائماً العودة لهذه الجولة من خلال قسم المساعدة.",
      icon: <Target className="w-12 h-12 text-emerald-500" />,
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden font-['Cairo',sans-serif]"
      >
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="p-8 sm:p-12 flex flex-col items-center text-center">
          <button 
            onClick={handleClose}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-5 bg-slate-950 rounded-3xl border border-white/5 shadow-inner">
                  {steps[currentStep].icon}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black text-white">{steps[currentStep].title}</h2>
                <p className="text-slate-300 text-base leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>

              {steps[currentStep].shortcut && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <Keyboard className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-200">الاختصار: </span>
                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    {steps[currentStep].shortcut}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="w-full pt-10 mt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-1.5 order-2 sm:order-1">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-amber-500' : 'w-1.5 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
              )}
              
              <button 
                onClick={handleNext}
                className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>{currentStep === steps.length - 1 ? "بدء التجربة الآن" : "التالي"}</span>
                {currentStep < steps.length - 1 && <ChevronLeft className="w-4 h-4" />}
                {currentStep === steps.length - 1 && <MousePointer2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
