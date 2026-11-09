import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStatePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  children?: React.ReactNode;
}

export const EmptyStatePlaceholder: React.FC<EmptyStatePlaceholderProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onActionClick,
  children
}) => {
  return (
    <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 flex items-center justify-center mx-auto">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xl font-black text-amber-400">{title}</h4>
        {description && <p className="text-slate-400 text-xs">{description}</p>}
      </div>
      {(actionLabel && onActionClick) || children ? (
        <div className="flex items-center justify-center gap-3 pt-2">
            {actionLabel && onActionClick && (
                <button
                onClick={onActionClick}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs inline-flex items-center gap-2 transition cursor-pointer"
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
