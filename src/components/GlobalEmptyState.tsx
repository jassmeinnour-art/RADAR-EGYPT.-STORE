import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlobalEmptyStateProps {
  icon: React.ReactNode;
  message: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  children?: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string;
}

/**
 * GlobalEmptyState - A unified component for empty list/data scenarios.
 * Accepts icons as JSX elements and dynamic messages to ensure professional and consistent UX.
 */
export const GlobalEmptyState: React.FC<GlobalEmptyStateProps> = ({
  icon,
  message,
  description,
  actionLabel,
  onActionClick,
  children,
  iconBgColor = 'bg-amber-500/10 border-amber-500/30'
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="empty-state-placeholder py-16 px-6 sm:py-24 sm:px-8 text-center bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-800 shadow-2xl space-y-6 max-w-2xl mx-auto my-8 relative overflow-hidden" 
      dir="rtl"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-20 h-20 rounded-3xl ${iconBgColor} border-2 flex items-center justify-center mx-auto shadow-inner transform transition-transform hover:scale-105 duration-300 relative z-10`}>
        {icon}
      </div>

      <div className="space-y-2 relative z-10">
        <h3 className="text-xl sm:text-2xl font-black text-white font-['Alexandria','Cairo'] tracking-tight">
          {message}
        </h3>
        {description && (
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>

      {((actionLabel && onActionClick) || children) && (
        <div className="flex items-center justify-center gap-4 pt-4 flex-wrap relative z-10">
          {actionLabel && onActionClick && (
            <button
              onClick={onActionClick}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/15 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>{actionLabel}</span>
            </button>
          )}
          {children}
        </div>
      )}
    </motion.div>
  );
};
