import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';
export type TooltipTheme = 'emerald' | 'indigo' | 'sky' | 'rose' | 'slate' | 'amber' | 'orange';

export interface ToolbarTooltipProps {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  badge?: string | React.ReactNode;
  shortcut?: string;
  icon?: React.ComponentType<{ className?: string }>;
  theme?: TooltipTheme;
  side?: TooltipSide;
  align?: TooltipAlign;
  delayMs?: number;
  interactive?: boolean;
  maxWidthClass?: string;
  disabled?: boolean;
  children: React.ReactElement<any>;
  id?: string;
  className?: string;
}

export const ToolbarTooltip: React.FC<ToolbarTooltipProps> = ({
  title,
  description,
  badge,
  shortcut,
  icon: Icon,
  theme = 'emerald',
  side = 'bottom',
  align = 'center',
  delayMs = 180,
  interactive = false,
  maxWidthClass = 'w-72 sm:w-80',
  disabled = false,
  children,
  id,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleOpen = () => {
    if (disabled) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);
  };

  const handleClose = () => {
    clearTimer();
    setIsOpen(false);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  // Theme styles for accent badges & borders
  const themeClasses = {
    emerald: {
      badge: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/20',
      iconBox: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      dot: 'bg-emerald-400',
      highlightBorder: 'border-emerald-500/40',
      arrowBorder: 'border-emerald-500/30'
    },
    indigo: {
      badge: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40 ring-1 ring-indigo-500/20',
      iconBox: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40',
      dot: 'bg-indigo-400',
      highlightBorder: 'border-indigo-500/40',
      arrowBorder: 'border-indigo-500/30'
    },
    sky: {
      badge: 'bg-sky-950/90 text-sky-300 border-sky-500/40 ring-1 ring-sky-500/20',
      iconBox: 'bg-sky-500/20 text-sky-400 border border-sky-500/40',
      dot: 'bg-sky-400',
      highlightBorder: 'border-sky-500/40',
      arrowBorder: 'border-sky-500/30'
    },
    rose: {
      badge: 'bg-rose-950/90 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/20',
      iconBox: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
      dot: 'bg-rose-400',
      highlightBorder: 'border-rose-500/40',
      arrowBorder: 'border-rose-500/30'
    },
    amber: {
      badge: 'bg-orange-950/90 text-orange-300 border-orange-500/50 ring-1 ring-orange-500/30',
      iconBox: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
      dot: 'bg-orange-400',
      highlightBorder: 'border-orange-500/50',
      arrowBorder: 'border-orange-500/40'
    },
    orange: {
      badge: 'bg-orange-950/90 text-orange-300 border-orange-500/50 ring-1 ring-orange-500/30',
      iconBox: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
      dot: 'bg-orange-400',
      highlightBorder: 'border-orange-500/50',
      arrowBorder: 'border-orange-500/40'
    },
    slate: {
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      iconBox: 'bg-slate-800 text-slate-300 border border-slate-700',
      dot: 'bg-slate-400',
      highlightBorder: 'border-slate-700',
      arrowBorder: 'border-slate-700'
    }
  }[theme];

  // Side and Align positioning classes
  const getPositionClasses = () => {
    let pos = '';
    if (side === 'top') {
      pos += 'bottom-full mb-2.5 ';
      if (align === 'start') pos += 'end-0 ';
      else if (align === 'end') pos += 'start-0 ';
      else pos += 'start-1/2 -translate-x-1/2 ';
    } else if (side === 'bottom') {
      pos += 'top-full mt-2.5 ';
      if (align === 'start') pos += 'end-0 ';
      else if (align === 'end') pos += 'start-0 ';
      else pos += 'start-1/2 -translate-x-1/2 ';
    } else if (side === 'left') {
      pos += 'end-full me-2.5 top-1/2 -translate-y-1/2 ';
    } else if (side === 'right') {
      pos += 'start-full ms-2.5 top-1/2 -translate-y-1/2 ';
    }
    return pos;
  };

  // Arrow position classes
  const getArrowClasses = () => {
    if (side === 'top') {
      return `top-full -mt-1.5 start-1/2 -translate-x-1/2 border-t border-r rotate-[-45deg] bg-slate-900 ${themeClasses.arrowBorder}`;
    } else if (side === 'bottom') {
      return `bottom-full -mb-1.5 start-1/2 -translate-x-1/2 border-t border-r rotate-[45deg] bg-slate-900 ${themeClasses.arrowBorder}`;
    }
    return 'hidden';
  };

  const tooltipId = id || `toolbar-tooltip-${typeof title === 'string' ? title.replace(/\s+/g, '-').slice(0, 20) : 'item'}`;

  // Clone trigger element with accessible events
  const clonedChild = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onMouseEnter: (e: React.MouseEvent) => {
          (children.props as any)?.onMouseEnter?.(e);
          handleOpen();
        },
        onMouseLeave: (e: React.MouseEvent) => {
          (children.props as any)?.onMouseLeave?.(e);
          handleClose();
        },
        onFocus: (e: React.FocusEvent) => {
          (children.props as any)?.onFocus?.(e);
          handleOpen();
        },
        onBlur: (e: React.FocusEvent) => {
          (children.props as any)?.onBlur?.(e);
          handleClose();
        },
        'aria-describedby': isOpen ? tooltipId : undefined
      })
    : children;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocusCapture={handleOpen}
      onBlurCapture={handleClose}
    >
      {clonedChild}

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            aria-live="polite"
            dir="rtl"
            initial={{ opacity: 0, y: side === 'top' ? -4 : 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === 'top' ? -3 : 3, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute z-50 ${getPositionClasses()} ${maxWidthClass} ${
              interactive ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{ filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.45))' }}
          >
            {/* Tooltip Content Container */}
            <div className={`relative bg-slate-900/98 backdrop-blur-md text-slate-100 rounded-2xl p-3 sm:p-3.5 shadow-2xl border ${themeClasses.highlightBorder} text-right select-none space-y-2`}>
              
              {/* Optional Arrow Indicator */}
              <div className={`absolute w-3 h-3 ${getArrowClasses()}`} />

              {/* Header with Title, Icon & Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {Icon && (
                    <div className={`p-1.5 rounded-lg ${themeClasses.iconBox} shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-black text-white block truncate font-['Alexandria',sans-serif]">
                      {title}
                    </span>
                  </div>
                </div>

                {badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${themeClasses.badge}`}>
                    {badge}
                  </span>
                )}
              </div>

              {/* Description Body - Short, concise, non-confusing explanation */}
              <p className="text-[11.5px] text-slate-300 leading-relaxed font-['Cairo',sans-serif]">
                {description}
              </p>

              {/* Footer with Shortcut or Quick Tip */}
              {shortcut && (
                <div className="pt-1.5 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${themeClasses.dot}`} />
                    <span>
                      {shortcut.includes('+') || /alt|ctrl|cmd|shift/i.test(shortcut)
                        ? 'اختصار لوحة المفاتيح:'
                        : 'تلميح سريع:'}
                    </span>
                  </span>
                  <kbd className="font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 shadow-xs tracking-wider" dir="ltr">
                    {shortcut}
                  </kbd>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
