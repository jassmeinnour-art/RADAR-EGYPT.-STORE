import React from 'react';
import { Sun, Moon, Monitor, Clock, Palette } from 'lucide-react';
import { useTheme, THEME_VARIANT_DEFINITIONS, ThemeVariantId } from '../context/ThemeContext';
import { useAudioNotifications } from '../context/AudioNotificationContext';

export interface ThemeToggleProps {
  variant?: 'pill' | 'icon' | 'compact' | 'full';
  mode?: 'switch' | 'cycle';
  showLabel?: boolean;
  className?: string;
  onToggleNotification?: (message: string) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'pill',
  mode = 'switch',
  showLabel = true,
  className = '',
  onToggleNotification,
}) => {
  const {
    colorMode,
    resolvedColorMode,
    themeVariant,
    toggleColorMode,
    toggleThemeVariant,
    cycleColorMode,
  } = useTheme();
  const { playCompetitorStatusSound } = useAudioNotifications();

  const isDark = resolvedColorMode === 'dark';
  const activeVariant: ThemeVariantId =
    themeVariant || (isDark ? 'dark-high-contrast' : 'clean-light');
  const activeMeta = THEME_VARIANT_DEFINITIONS[activeVariant];

  const handleToggle = () => {
    try {
      playCompetitorStatusSound();
    } catch {
      // safe fallback
    }

    if (mode === 'cycle' && typeof cycleColorMode === 'function') {
      const nextMode = cycleColorMode();
      let msg = '';
      if (nextMode === 'dark') {
        msg = 'تم تفعيل وضع Dark High Contrast للبيئات التجارية المظلمة';
      } else if (nextMode === 'light') {
        msg = 'تم تفعيل وضع Clean Light المريح للعين';
      } else if (nextMode === 'scheduled') {
        msg = 'تم تفعيل الوضع المجدول حسب التوقيت المحلي';
      } else {
        msg = 'تم تفعيل الوضع التلقائي حسب إعدادات النظام';
      }
      onToggleNotification?.(msg);
      return;
    }

    const nextVariant: ThemeVariantId =
      typeof toggleThemeVariant === 'function'
        ? toggleThemeVariant()
        : (() => {
            toggleColorMode();
            return isDark ? 'clean-light' : 'dark-high-contrast';
          })();

    const msg =
      nextVariant === 'dark-high-contrast'
        ? 'تم التبديل إلى وضع Dark High Contrast المخصص للبيئات التجارية المظلمة'
        : 'تم التبديل إلى وضع Clean Light المريح للعين';

    onToggleNotification?.(msg);
  };

  // 1. Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        type="button"
        id="btn-theme-toggle-icon"
        data-testid="theme-toggle-button"
        onClick={handleToggle}
        aria-label={`تبديل الثيم (${activeMeta.label})`}
        title={`تبديل الثيم — الحالي: ${activeMeta.label}`}
        className={`relative p-2 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer select-none border active:scale-95 ${
          isDark
            ? 'bg-[#0F172A] text-amber-300 border-slate-600 hover:border-amber-400 shadow-md'
            : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50 shadow-sm'
        } ${className}`}
      >
        {mode === 'cycle' && colorMode === 'system' ? (
          <Monitor className="w-4 h-4 text-sky-400" />
        ) : mode === 'cycle' && colorMode === 'scheduled' ? (
          <Clock className="w-4 h-4 text-amber-400" />
        ) : isDark ? (
          <Moon className="w-4 h-4 text-amber-300" />
        ) : (
          <Sun className="w-4 h-4 text-amber-600" />
        )}
      </button>
    );
  }

  // 2. Compact Switch Pill (Dark High Contrast <-> Clean Light)
  if (variant === 'compact') {
    return (
      <button
        type="button"
        id="btn-theme-toggle-compact"
        data-testid="theme-toggle-button"
        onClick={handleToggle}
        aria-label={`تبديل الثيم (${activeMeta.label})`}
        title={`تبديل الثيم — ${activeMeta.label}`}
        className={`inline-flex items-center gap-2 h-8 px-3 rounded-xl border transition-all duration-200 cursor-pointer select-none text-xs font-black ${
          isDark
            ? 'bg-[#0F172A] text-white border-slate-500 hover:border-amber-400'
            : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'
        } ${className}`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        )}
        <span>تبديل الثيم</span>
        <span
          dir="ltr"
          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
            isDark
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-100 text-slate-700 border border-slate-300'
          }`}
        >
          {activeMeta.label}
        </span>
      </button>
    );
  }

  // 3. Pill or Full Banner variant
  return (
    <button
      type="button"
      id={variant === 'full' ? 'btn-theme-toggle-full' : 'btn-theme-toggle-pill'}
      data-testid="theme-toggle-button"
      onClick={handleToggle}
      aria-label={`تبديل الثيم - الوضع الحالي ${activeMeta.label}`}
      className={`px-3.5 py-2 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer select-none active:scale-[0.98] ${
        isDark
          ? 'bg-[#0F172A] hover:bg-[#1E293B] text-white border-slate-500 shadow-md'
          : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
      } ${className}`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isDark
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}
        >
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </span>
        {showLabel && (
          <span className="text-xs font-black flex items-center gap-1.5">
            <span>تبديل الثيم</span>
          </span>
        )}
      </span>

      <span
        dir="ltr"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${
          isDark
            ? 'bg-slate-950 text-sky-300 border-slate-600'
            : 'bg-slate-100 text-slate-800 border-slate-300'
        }`}
      >
        <Palette className="w-3 h-3 shrink-0" />
        <span>{activeMeta.label}</span>
      </span>
    </button>
  );
};
