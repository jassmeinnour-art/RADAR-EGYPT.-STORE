import React from 'react';
import { Palette } from 'lucide-react';
import { useVisualCustomizer } from '../context/VisualCustomizerContext';

export const FloatingVisualCustomizerButton: React.FC = () => {
  const { toggleCustomizer, isCustomizerOpen } = useVisualCustomizer();

  if (isCustomizerOpen) return null;

  return (
    <button
      onClick={toggleCustomizer}
      className="fixed bottom-36 left-6 z-[90] w-12 h-12 bg-gradient-to-br from-amber-500 to-[#FF8C00] hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-full shadow-2xl border-2 border-amber-300/60 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-amber-500/40 cursor-pointer"
      title="مظهر وتنسيق التطبيق (Visual Theme Customizer Pro)"
      aria-label="تخصيص ألوان وخطوط التطبيق"
    >
      <Palette className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
      <span className="absolute -top-1.5 -right-1 bg-slate-950 border border-amber-400 text-amber-300 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full flex items-center justify-center shadow-md font-mono">
        PRO
      </span>
    </button>
  );
};

export default FloatingVisualCustomizerButton;
