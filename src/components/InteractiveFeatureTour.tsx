import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react';

interface FeatureTourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tourSteps: FeatureTourStep[] = [
  {
    title: 'مرحباً بك في رادار التجار!',
    description: 'هذا النظام هو أداتك الشاملة لمتابعة المنافسين، إدارة الأسعار، وتحليل الطلب لحظة بلحظة.',
    icon: <Sparkles className="w-10 h-10 text-sky-400" />,
  },
  {
    title: 'رادار المنافسين',
    description: 'راقب تحركات أسعار المنافسين في أمازون ونون وجوميا واستجب فوراً لتغييرات السوق.',
    icon: <Target className="w-10 h-10 text-emerald-400" />,
  },
  {
    title: 'التسعير الديناميكي الذكي',
    description: 'استخدم الذكاء الاصطناعي لاقتناص الـ Buy Box وتحقيق أفضل هوامش ربح ممكنة تلقائياً.',
    icon: <Zap className="w-10 h-10 text-amber-400" />,
  },
  {
    title: 'الأمان والامتثال',
    description: 'نظامنا يحمي بياناتك ويضمن توافق متجرك مع جميع المعايير واللوائح القانونية.',
    icon: <ShieldCheck className="w-10 h-10 text-indigo-400" />,
  },
];

interface InteractiveFeatureTourProps {
  onClose: () => void;
}

export const InteractiveFeatureTour: React.FC<InteractiveFeatureTourProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg text-slate-100" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-sky-400">
            خطوة {currentStep + 1} من {tourSteps.length}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          {tourSteps[currentStep].icon}
          <h2 className="text-2xl font-black">{tourSteps[currentStep].title}</h2>
          <p className="text-slate-300 leading-relaxed">{tourSteps[currentStep].description}</p>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="flex gap-1">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-sky-500' : 'bg-slate-700'}`}
              />
            ))}
          </div>
          <button
            onClick={nextStep}
            className="p-2 rounded-full bg-sky-600 hover:bg-sky-500 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
