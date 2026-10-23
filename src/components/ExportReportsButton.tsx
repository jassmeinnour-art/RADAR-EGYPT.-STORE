import React, { useState, useRef, useEffect } from 'react';
import { FileSpreadsheet, Download, ChevronDown, Check, Loader2, Sparkles, FileText } from 'lucide-react';

interface ExportReportsButtonProps {
  onExport: (format: 'xlsx' | 'csv') => void;
  isLoading?: boolean;
  className?: string;
  buttonLabel?: string;
  tooltip?: string;
  variant?: 'amber' | 'emerald' | 'slate';
  count?: number;
}

export const ExportReportsButton: React.FC<ExportReportsButtonProps> = ({
  onExport,
  isLoading = false,
  className = '',
  buttonLabel = 'تصدير التقارير',
  tooltip = 'تحميل وتصدير قائمة الأسعار الحالية للمنافسين بصيغة Excel أو CSV',
  variant = 'amber',
  count,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExportedFormat, setLastExportedFormat] = useState<'xlsx' | 'csv' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelectFormat = (format: 'xlsx' | 'csv') => {
    setIsOpen(false);
    setLastExportedFormat(format);
    onExport(format);
    setTimeout(() => setLastExportedFormat(null), 3000);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-emerald-950/40';
      case 'slate':
        return 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 shadow-slate-950/40';
      case 'amber':
      default:
        return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-400/60 shadow-amber-950/40';
    }
  };

  return (
    <div className={`relative inline-block text-right ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        title={tooltip}
        className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 border shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 select-none ${getVariantStyles()}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
        )}
        <span className="font-['Alexandria']">{buttonLabel}</span>
        {count !== undefined && count > 0 && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-black/20">
            {count}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-2xl bg-slate-950 border border-amber-500/30 text-white shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>خيارات تصدير الأسعار</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">xlsx library</span>
          </div>

          <div className="p-1 space-y-1">
            {/* Excel Option */}
            <button
              type="button"
              onClick={() => handleSelectFormat('xlsx')}
              className="w-full text-right p-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-emerald-500/30 transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                    تحميل كملف Excel (.xlsx)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    جدول منسق بالكامل مع أعمدة أسعار المنافسين
                  </div>
                </div>
              </div>
              {lastExportedFormat === 'xlsx' && (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </button>

            {/* CSV Option */}
            <button
              type="button"
              onClick={() => handleSelectFormat('csv')}
              className="w-full text-right p-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-sky-500/30 transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-sky-300">
                    تحميل كملف CSV (.csv)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ملف نصي مفصول بفواصل متوافق مع البرامج وقواعد البيانات
                  </div>
                </div>
              </div>
              {lastExportedFormat === 'csv' && (
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
              )}
            </button>
          </div>

          <div className="px-2.5 py-1.5 border-t border-slate-900 text-[10px] text-slate-500 text-center">
            تصدير لحظي يدعم اللغة العربية وترميز UTF-8
          </div>
        </div>
      )}
    </div>
  );
};
