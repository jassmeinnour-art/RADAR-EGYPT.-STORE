import React from 'react';
import { Keyboard, X, Command, Sparkles, Zap, ShieldAlert } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    description: string;
    badge?: string;
  }[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  isOwner = false
}) => {
  if (!isOpen) return null;

  const shortcutGroups: ShortcutGroup[] = [
    {
      category: '🚀 التنقل السريع بين مساحات العمل',
      items: [
        { keys: ['Ctrl', '1'], description: 'لوحة التاجر وإدارة الكتالوج والمتاجر' },
        { keys: ['Ctrl', '2'], description: 'رادار الباي بوكس والأسعار المباشرة' },
        { keys: ['Ctrl', '3'], description: 'أستوديو الذكاء الاصطناعي والتصميم' },
        { keys: ['Ctrl', '4'], description: 'بوالص الشحن وفصل الطلبات' },
        { keys: ['Ctrl', '5'], description: 'ترشيحات المنتجات التريند وحساب الأرباح' },
        { keys: ['Ctrl', '6'], description: 'التقارير المالية والأسبوعية' },
        { keys: ['Ctrl', '7'], description: 'محرك التسعير الآلي المشروط' },
        { keys: ['Ctrl', '8'], description: 'دليل ربط المنصات ومفاتيح Live API' },
        { keys: ['Ctrl', '9'], description: 'الدعم الفني والتعليمات' }
      ]
    },
    {
      category: '🎨 النظام والمظهر والتحكم',
      items: [
        { keys: ['Ctrl', 'D'], description: 'تبديل المظهر (الوضع الليلي / النهاري)' },
        { keys: ['?'], description: 'فتح دليلك السريع لاختصارات لوحة المفاتيح' },
        { keys: ['Esc'], description: 'إغلاق أي نافذة منبثقة أو دراور حالي' },
        ...(isOwner
          ? [
              {
                keys: ['O'],
                description: 'فتح لوحة تحكم المالكة العليا (Super Admin)',
                badge: 'خاص بالمالك 👑'
              }
            ]
          : [])
      ]
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-2 border-emerald-500/50 text-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-md">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                اختصارات لوحة المفاتيح السريعة (Hotkeys)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تصفح وتحكم في رادار التاجر بسرعة فائقة دون الحاجة للماوس ⚡
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="bg-slate-950/50 rounded-2xl border border-slate-800 p-4 space-y-3">
              <h3 className="text-sm font-bold text-emerald-300 border-b border-slate-800/80 pb-2">
                {group.category}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3 shadow-sm hover:border-emerald-500/30 transition"
                  >
                    <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5 min-w-0">
                      <span className="truncate">{item.description}</span>
                      {item.badge && (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-1 shrink-0 font-mono text-xs">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 bg-slate-800 border border-slate-600/60 rounded-md text-amber-300 font-extrabold shadow-inner"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            يمكنك ضغط مفتاح <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono font-bold">?</kbd> في أي وقت لإظهار هذه القائمة.
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md"
          >
            فهمت، إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
