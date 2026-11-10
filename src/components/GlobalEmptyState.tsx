import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlobalEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  children?: React.ReactNode;
}

export const GlobalEmptyState: React.FC<GlobalEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onActionClick,
  children
}) => {
  return (
    <div className="empty-state-placeholder py-20 px-6 text-center bg-slate-900/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-800 shadow-xl space-y-4 max-w-2xl mx-auto my-6" dir="rtl">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-black text-white">{title}</h3>
        {description && <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">{description}</p>}
      </div>
      {(actionLabel && onActionClick) || children ? (
        <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
          {actionLabel && onActionClick && (
            <button
              onClick={onActionClick}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
          {children}
        </div>
      ) : null}
    </div>
  );
};
