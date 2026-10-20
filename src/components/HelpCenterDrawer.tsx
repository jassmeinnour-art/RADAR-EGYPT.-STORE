import React, { useState } from 'react';
import { Book, ChevronRight, X, FileText, AlertCircle } from 'lucide-react';
import { InteractiveFeatureTour } from './InteractiveFeatureTour';

export const HelpCenterDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 bg-slate-950 text-white z-[101] shadow-2xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Book className="w-5 h-5 text-sky-400" />
            مركز المساعدة
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setIsTourOpen(true)}
            className="w-full text-right p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <h3 className="font-bold">جولة تعليمية في المنصة</h3>
            <p className="text-xs text-slate-400">تعرف على ميزات الرادار الرئيسية</p>
          </button>

          <div className="border-t border-slate-800 pt-4 mt-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              المستندات الرسمية
            </h3>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300">
              <p>قم بتحميل ونماذج الأوراق الرسمية (سجل تجاري، بطاقة ضريبية، إلخ) هنا.</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>تنبيه: اقتراب انتهاء صلاحية الوثيقة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isTourOpen && <InteractiveFeatureTour onClose={() => setIsTourOpen(false)} />}
    </>
  );
};
