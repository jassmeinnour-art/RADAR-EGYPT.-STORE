import React from 'react';
import { Sun, Moon, Monitor, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAudioNotifications } from '../context/AudioNotificationContext';

export interface ThemeToggleProps {
  variant?: 'pill' | 'icon' | 'compact' | 'full';
  showLabel?: boolean;
  className?: string;
  onToggleNotification?: (message: string) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'pill',
  showLabel = true,
  className = '',
  onToggleNotification
}) => {
  const { colorMode, resolvedColorMode, cycleColorMode } = useTheme();
  const { playCompetitorStatusSound } = useAudioNotifications();

  const isDark = resolvedColorMode === 'dark';

  const handleCycle = () => {
    const nextMode = cycleColorMode();
    try {
      playCompetitorStatusSound();
    } catch {
      // safe fallback
    }

    let msg = '';
    if (nextMode === 'dark') msg = '🌙 تم تفعيل الوضع الليلي (Dark Mode) بنجاح';
    else if (nextMode === 'light') msg = '☀️ تم تفعيل الوضع النهاري (Light Mode) بنجاح';
    else if (nextMode === 'scheduled') msg = '⏰ تم تفعيل الوضع المجدول (حسب التوقيت المحلي) بنجاح';
    else msg = '🖥️ تم تفعيل الوضع التلقائي (حسب إعدادات النظام)';

    onToggleNotification?.(msg);
  };

  // 1. Icon-only variant (Clean circular button)
  if (variant === 'icon') {
    return (
      <button
        type="button"
        id="btn-theme-toggle-icon"
        onClick={handleCycle}
        aria-label="تبديل مظهر النظام"
        title={colorMode === 'system' ? 'الوضع التلقائي مفعّل' : colorMode === 'scheduled' ? 'الوضع المجدول مفعّل' : (isDark ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل')}
        className={`relative p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer select-none border shadow-sm active:scale-95 ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30 hover:border-amber-400 shadow-amber-500/10'
            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400 shadow-slate-200/50'
        } ${className}`}
      >
        {colorMode === 'system' ? (
          <Monitor className="w-4 h-4 text-sky-400" />
        ) : colorMode === 'scheduled' ? (
          <Clock className="w-4 h-4 text-emerald-400" />
        ) : isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600" />
        )}
      </button>
    );
  }

  // 2. Compact Switch / Slider Pill
  if (variant === 'compact') {
    return (
      <button
        type="button"
        id="btn-theme-toggle-compact"
        onClick={handleCycle}
        aria-label="تبديل مظهر النظام"
        className={`relative inline-flex items-center h-8 w-32 px-1 rounded-full border transition-all duration-300 cursor-pointer select-none ${
          isDark
            ? 'bg-slate-900 border-amber-500/40 shadow-inner'
            : 'bg-slate-200 border-slate-300 shadow-inner'
        } ${className}`}
      >
        <div className="flex justify-between w-full px-2 text-[8px] font-bold z-0">
          <span className={colorMode === 'light' ? 'text-slate-950' : 'text-slate-400'}>Light</span>
          <span className={colorMode === 'system' ? 'text-slate-950' : 'text-slate-400'}>Auto</span>
          <span className={colorMode === 'scheduled' ? 'text-slate-950' : 'text-slate-400'}>Time</span>
          <span className={colorMode === 'dark' ? 'text-slate-950' : 'text-slate-400'}>Dark</span>
        </div>
        <span
          className={`absolute flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 shadow-md z-10 ${
            colorMode === 'light' ? 'left-1 bg-white text-amber-500' : 
            colorMode === 'system' ? 'left-[28%] bg-sky-500 text-white' : 
            colorMode === 'scheduled' ? 'left-[58%] bg-emerald-500 text-white' :
            'right-1 bg-amber-500 text-slate-950'
          }`}
        >
          {colorMode === 'system' ? <Monitor className="w-3 h-3" /> : colorMode === 'scheduled' ? <Clock className="w-3 h-3" /> : (isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />)}
        </span>
      </button>
    );
  }

  // 3. Full / Pill variant with text badge and shortcut hint
  return (
    <button
      type="button"
      id="btn-theme-toggle-pill"
      onClick={handleCycle}
      aria-label="تبديل مظهر النظام"
      title="انقر لتبديل المظهر (نهاري/ليلي/تلقائي/مجدول) - اختصار: Ctrl+D"
      className={`group px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer select-none active:scale-95 shadow-sm ${
        isDark
          ? 'bg-slate-950 hover:bg-slate-800 text-amber-200 border-amber-500/40 hover:border-amber-400'
          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
      } ${className}`}
    >
      <div className={`p-1 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
        colorMode === 'system' ? 'bg-sky-500/20 text-sky-400' : colorMode === 'scheduled' ? 'bg-emerald-500/20 text-emerald-400' : (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-50 text-indigo-600')
      }`}>
        {colorMode === 'system' ? (
          <Monitor className="w-3.5 h-3.5" />
        ) : colorMode === 'scheduled' ? (
          <Clock className="w-3.5 h-3.5" />
        ) : isDark ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </div>

      {showLabel && (
        <span className="font-bold text-[11px] whitespace-nowrap">
          {colorMode === 'system' ? 'المظهر: تلقائي 🖥️' : colorMode === 'scheduled' ? 'المظهر: مجدول ⏰' : (isDark ? 'الوضع الليلي 🌙' : 'الوضع النهاري ☀️')}
        </span>
      )}

      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold hidden sm:inline-block ${
        isDark ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
      }`}>
        Ctrl+D
      </span>
    </button>
  );
};

export default ThemeToggle;
