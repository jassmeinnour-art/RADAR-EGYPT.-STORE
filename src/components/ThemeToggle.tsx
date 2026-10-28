import React from 'react';
import { Sun, Moon, Monitor, Clock, Sparkles } from 'lucide-react';
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
    if (nextMode === 'dark') msg = '🌙 تم تفعيل الوضع الليلي (Dark Mode - كحلي عميق وفضاء داكن) بنجاح';
    else if (nextMode === 'light') msg = '☀️ تم تفعيل الوضع النهاري (Light Mode - أوف-وايت نقي وتباين فائق) بنجاح';
    else if (nextMode === 'scheduled') msg = '⏰ تم تفعيل الوضع المجدول (حسب التوقيت المحلي ومؤشرات الوقت) بنجاح';
    else msg = '🖥️ تم تفعيل الوضع التلقائي (حسب إعدادات النظام) بنجاح';

    onToggleNotification?.(msg);
  };

  // 1. Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        type="button"
        id="btn-theme-toggle-icon"
        onClick={handleCycle}
        aria-label="تبديل مظهر النظام والأوضاع"
        title={
          colorMode === 'system' ? 'الوضع التلقائي (System Auto) مفعّل' : 
          colorMode === 'scheduled' ? 'الوضع المجدول (Time Scheduled) مفعّل' : 
          (isDark ? 'الوضع الليلي (Dark Mode - فضاء كحلي) مفعّل' : 'الوضع النهاري (Light Mode - أوف-وايت نقي) مفعّل')
        }
        className={`relative p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer select-none border shadow-md active:scale-95 ${
          colorMode === 'scheduled'
            ? 'bg-gradient-to-br from-purple-950 to-indigo-900 text-amber-300 border-amber-400/50 shadow-purple-900/30'
            : colorMode === 'system'
            ? 'bg-gradient-to-br from-sky-950 to-blue-900 text-sky-300 border-sky-400/50 shadow-sky-900/30'
            : isDark
            ? 'bg-slate-900 text-amber-300 border-amber-500/40 shadow-slate-950'
            : 'bg-white text-slate-950 border-slate-300 shadow-slate-200 hover:bg-slate-50'
        } ${className}`}
      >
        {colorMode === 'system' ? (
          <Monitor className="w-4 h-4 text-cyan-300 animate-pulse" />
        ) : colorMode === 'scheduled' ? (
          <Clock className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '12s' }} />
        ) : isDark ? (
          <Moon className="w-4 h-4 text-amber-300" />
        ) : (
          <Sun className="w-4 h-4 text-slate-950 font-black" />
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
        className={`relative inline-flex items-center h-8 w-36 px-1 rounded-full border transition-all duration-300 cursor-pointer select-none shadow-md ${
          colorMode === 'scheduled'
            ? 'bg-purple-950 border-purple-500/60'
            : colorMode === 'system'
            ? 'bg-sky-950 border-sky-500/60'
            : isDark
            ? 'bg-slate-900 border-slate-700'
            : 'bg-slate-100 border-slate-300'
        } ${className}`}
      >
        <div className="flex justify-between w-full px-2 text-[9px] font-black z-0">
          <span className={colorMode === 'light' ? 'text-slate-950 font-black' : 'text-slate-400'}>النهاري</span>
          <span className={colorMode === 'system' ? 'text-cyan-300 font-black' : 'text-slate-400'}>تلقائي</span>
          <span className={colorMode === 'scheduled' ? 'text-amber-300 font-black' : 'text-slate-400'}>مجدول</span>
          <span className={colorMode === 'dark' ? 'text-white font-black' : 'text-slate-400'}>الليلي</span>
        </div>
        <span
          className={`absolute flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 shadow-lg z-10 ${
            colorMode === 'light' ? 'left-1 bg-white text-slate-950 border border-slate-300' : 
            colorMode === 'system' ? 'left-[26%] bg-cyan-600 text-white border border-cyan-400' : 
            colorMode === 'scheduled' ? 'left-[54%] bg-purple-600 text-amber-200 border border-purple-400' :
            'right-1 bg-slate-950 text-amber-400 border border-slate-700'
          }`}
        >
          {colorMode === 'system' ? <Monitor className="w-3 h-3 text-white" /> : colorMode === 'scheduled' ? <Clock className="w-3 h-3 text-amber-200" /> : (isDark ? <Moon className="w-3 h-3 text-amber-300" /> : <Sun className="w-3 h-3 text-slate-950" />)}
        </span>
      </button>
    );
  }

  // 3. Full Pill or Banner variant
  return (
    <button
      type="button"
      onClick={handleCycle}
      className={`px-3.5 py-2 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer shadow-md ${
        colorMode === 'scheduled'
          ? 'bg-gradient-to-r from-purple-950 to-indigo-900 text-amber-200 border-purple-500/50'
          : colorMode === 'system'
          ? 'bg-gradient-to-r from-sky-950 to-blue-900 text-cyan-200 border-sky-500/50'
          : isDark
          ? 'bg-slate-900 text-white border-slate-700'
          : 'bg-white text-slate-950 border-slate-300'
      } ${className}`}
    >
      {colorMode === 'system' ? (
        <Monitor className="w-4 h-4 text-cyan-300" />
      ) : colorMode === 'scheduled' ? (
        <Clock className="w-4 h-4 text-amber-300" />
      ) : isDark ? (
        <Moon className="w-4 h-4 text-amber-300" />
      ) : (
        <Sun className="w-4 h-4 text-slate-950" />
      )}
      {showLabel && (
        <span className="text-xs font-black">
          {colorMode === 'system' ? 'الوضع التلقائي (System)' : colorMode === 'scheduled' ? 'الوضع المجدول (Time)' : (isDark ? 'الوضع الليلي (Dark)' : 'الوضع النهاري (Light)')}
        </span>
      )}
    </button>
  );
};
