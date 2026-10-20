import React from 'react';
import { 
  X, 
  Store, 
  Package, 
  Truck, 
  BarChart2, 
  ArrowRight, 
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';

interface QuickStartWelcomeScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const QuickStartWelcomeScreen: React.FC<QuickStartWelcomeScreenProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  if (!isOpen) return null;

  const quickStartSteps = [
    {
      id: 'link-platforms',
      title: 'ربط المنصات (Amazon/Noon)',
      description: 'قم بربط حساباتك التاجر لاستيراد المنتجات والطلبات فوراً.',
      icon: Store,
      color: 'bg-indigo-500',
      action: () => { onClose(); onNavigate('add_platform'); }
    },
    {
      id: 'manage-catalog',
      title: 'إدارة الكتالوج والأسعار',
      description: 'تحكم في أسعار منتجاتك وتتبع المنافسين لزيادة أرباحك.',
      icon: Package,
      color: 'bg-emerald-500',
      action: () => { onClose(); onNavigate('catalog_management'); }
    },
    {
      id: 'orders-shipping',
      title: 'جدولة الشحن والبوالص',
      description: 'استخرج بوالص الشحن واعرض الطلبات بضغطة زر واحدة.',
      icon: Truck,
      color: 'bg-sky-500',
      action: () => { onClose(); onNavigate('order_scheduling'); }
    },
    {
      id: 'analytics',
      title: 'تحليلات الأرباح',
      description: 'راقب أداء مبيعاتك وهامش الربح الفعلي.',
      icon: BarChart2,
      color: 'bg-amber-500',
      action: () => { onClose(); onNavigate('analytics'); }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFFFF] w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-amber-400" />
              أهلاً بك في منصة رادار التجار!
            </h2>
            <p className="text-slate-400 text-sm mt-1">ابدأ رحلة إدارة وتنمية متجرك الإلكتروني في أقل من 5 دقائق.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto bg-[#F8FAFC]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickStartSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={step.action}
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all text-right flex flex-col items-start gap-4 cursor-pointer group"
              >
                <div className={`p-3 rounded-xl ${step.color} text-white`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#000000]">{step.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 group-hover:gap-3 transition-all">
                  ابدأ الآن <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-full text-indigo-700">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900">تحتاج مساعدة إضافية؟</h4>
                <p className="text-sm text-slate-600">اطلع على دليل الاستخدام الشامل للمنصات وخطوات الربط التقنية.</p>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onNavigate('platforms_guide'); }}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
            >
              عرض دليل المنصات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
