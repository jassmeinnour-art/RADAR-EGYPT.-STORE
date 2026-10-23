import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
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
  const { colorMode, resolvedColorMode, toggleColorMode, setColorMode } = useTheme();
  const { playCompetitorStatusSound } = useAudioNotifications();

  const isDark = resolvedColorMode === 'dark';

  const handleToggle = () => {
    // If currently dark, switch to light; if light, switch to dark
    const nextMode = isDark ? 'light' : 'dark';
    setColorMode(nextMode);
    try {
      playCompetitorStatusSound();
    } catch {
      // safe fallback
    }

    const msg = nextMode === 'dark' 
      ? '🌙 تم تفعيل الوضع الليلي (Dark Mode) بنجاح وحفظه' 
      : '☀️ تم تفعيل الوضع النهاري (Light Mode) بنجاح وحفظه';

    onToggleNotification?.(msg);
  };

  // 1. Icon-only variant (Clean circular button)
  if (variant === 'icon') {
    return (
      <button
        type="button"
        id="btn-theme-toggle-icon"
        onClick={handleToggle}
        aria-label={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
        title={isDark ? 'الوضع الليلي مفعّل (انقر للتبديل إلى النهاري) - اختصار: Ctrl+D' : 'الوضع النهاري مفعّل (انقر للتبديل إلى الليلي) - اختصار: Ctrl+D'}
        className={`relative p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer select-none border shadow-sm active:scale-95 ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30 hover:border-amber-400 shadow-amber-500/10'
            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400 shadow-slate-200/50'
        } ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
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
        onClick={handleToggle}
        aria-label={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
        title={isDark ? 'الوضع الحالي: ليلي 🌙 (انقر للتحويل للنهاري)' : 'الوضع الحالي: نهاري ☀️ (انقر للتحويل لليلي)'}
        className={`relative inline-flex items-center h-8 w-16 px-1 rounded-full border transition-all duration-300 cursor-pointer select-none ${
          isDark
            ? 'bg-slate-900 border-amber-500/40 shadow-inner'
            : 'bg-slate-200 border-slate-300 shadow-inner'
        } ${className}`}
      >
        <span
          className={`flex items-center justify-center w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${
            isDark
              ? 'translate-x-8 bg-amber-500 text-slate-950'
              : 'translate-x-0 bg-white text-indigo-700'
          }`}
        >
          {isDark ? <Moon className="w-3.5 h-3.5 fill-slate-950" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
        </span>
      </button>
    );
  }

  // 3. Full / Pill variant with text badge and shortcut hint
  return (
    <button
      type="button"
      id="btn-theme-toggle-pill"
      onClick={handleToggle}
      aria-label={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
      title={isDark ? 'الوضع الليلي مفعّل (انقر للتحويل للنهاري) - اختصار: Ctrl+D' : 'الوضع النهاري مفعّل (انقر للتحويل لليلي) - اختصار: Ctrl+D'}
      className={`group px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer select-none active:scale-95 shadow-sm ${
        isDark
          ? 'bg-slate-950 hover:bg-slate-800 text-amber-200 border-amber-500/40 hover:border-amber-400'
          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
      } ${className}`}
    >
      <div className={`p-1 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
        isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-50 text-indigo-600'
      }`}>
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-indigo-600" />
        )}
      </div>

      {showLabel && (
        <span className="font-bold text-[11px] whitespace-nowrap">
          {isDark ? 'الوضع الليلي 🌙' : 'الوضع النهاري ☀️'}
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
