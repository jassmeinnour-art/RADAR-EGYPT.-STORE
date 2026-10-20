import React, { useEffect } from 'react';
import { RotateCcw, AlertTriangle, X, ShieldCheck, Zap } from 'lucide-react';

interface ResetViewConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sortActivePlatformsFirst: boolean;
  totalPlatformsCount: number;
}

export const ResetViewConfirmModal: React.FC<ResetViewConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sortActivePlatformsFirst,
  totalPlatformsCount,
}) => {
  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-confirm-reset-platform-view"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-reset-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200/90 flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-right">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3
                id="confirm-reset-dialog-title"
                className="text-sm font-black text-slate-900 leading-tight"
              >
                تأكيد استعادة الترتيب الافتراضي
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                إعادة ضبط عرض منصات البيع ({totalPlatformsCount} منصة)
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal-reset-platform-view"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="إغلاق نافذة التأكيد"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Warning Note */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            هل أنت متأكد من رغبتك في إعادة ضبط ترتيب قنوات ومنصات البيع؟ سيتم إلغاء أي ترتيب مخصص قمت بضبطه يدوياً عبر السحب والإفلات وإرجاع المنصات إلى تسلسل النظام القياسي.
          </p>

          <div className="grid grid-cols-1 gap-2 text-[11px]">
            {/* What is maintained */}
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2 text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold block text-emerald-900">ما يتم الحفاظ عليه بأمان:</span>
                <span className="text-emerald-800 text-[10.5px]">
                  خاصية <strong>(النشطة أولاً ⚡)</strong> ستبقى{' '}
                  <strong className="underline">
                    {sortActivePlatformsFirst ? 'مفعلة وتضع القنوات النشطة في المقدمة' : 'غير مفعلة'}
                  </strong>
                  ، وستبقى كافة بيانات وتوثيقات حساباتك متصلة دون أي فقدان.
                </span>
              </div>
            </div>

            {/* What is reset */}
            <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200/80 flex items-start gap-2 text-sky-950">
              <RotateCcw className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold block text-sky-900">ما سيتم تغييره:</span>
                <span className="text-sky-800 text-[10.5px]">
                  سيتم إلغاء الترتيب اليدوي وإرجاع المنصات والتصنيفات إلى تسلسل وترتيب النظام الافتراضي.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            id="btn-cancel-reset-platform-view"
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            إلغاء والتراجع
          </button>
          <button
            id="btn-confirm-reset-platform-view"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>نعم، استعادة الترتيب الافتراضي</span>
          </button>
        </div>
      </div>
    </div>
  );
};
