import React from 'react';
import { Keyboard, HelpCircle } from 'lucide-react';

interface FloatingHotkeyButtonProps {
  onClick: () => void;
}

export const FloatingHotkeyButton: React.FC<FloatingHotkeyButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 left-6 z-[90] w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl border-2 border-emerald-300/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-emerald-500/50 cursor-pointer"
      title="اختصارات لوحة المفاتيح السريعة (? Hotkeys)"
      aria-label="عرض اختصارات لوحة المفاتيح"
    >
      <Keyboard className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
      <span className="absolute -top-2 -right-1 bg-slate-900 border border-amber-400 text-amber-300 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md font-mono">
        ?
      </span>
    </button>
  );
};
