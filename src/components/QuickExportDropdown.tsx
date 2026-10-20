import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Mail,
  ChevronDown,
  Download,
  Send,
  Printer,
  Sparkles,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  BellRing,
  Loader2
} from 'lucide-react';
import { useAsyncOperations } from '../context/AsyncOperationsContext';

interface QuickExportDropdownProps {
  id?: string;
  isExportOverdue?: boolean;
  onOpenExportCenter: () => void;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onEmailManager: () => void;
  onGenerateAiBrief: () => void;
}

export const QuickExportDropdown: React.FC<QuickExportDropdownProps> = ({
  id = 'btn-active-ribbon-export',
  isExportOverdue = false,
  onOpenExportCenter,
  onExportPdf,
  onExportCsv,
  onEmailManager,
  onGenerateAiBrief
}) => {
  const { isCsvExporting } = useAsyncOperations();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Long-press handling (450ms)
  const handlePressStart = () => {
    isLongPressRef.current = false;
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsPressing(false);
      setIsOpen(true);
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
      } catch {
        // safe
      }
    }, 450);
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressRef.current = false;
      return;
    }
    onOpenExportCenter();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* The Target Button with CSS Selector #btn-active-ribbon-export */}
      <button
        id={id}
        onClick={handleClick}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        onContextMenu={handleContextMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={isCsvExporting}
        className={`h-9 px-3 sm:px-3.5 rounded-xl text-xs font-bold font-['Alexandria'] flex items-center justify-center gap-2 transition-all cursor-pointer select-none border shrink-0 whitespace-nowrap shadow-2xs relative active:scale-95 ${
          isCsvExporting ? 'opacity-80 cursor-wait bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/50' :
          isPressing ? 'scale-95 ring-2 ring-indigo-500/50 bg-indigo-50' : ''
        } ${
          isExportOverdue && !isCsvExporting
            ? 'bg-gradient-to-r from-sky-50 via-rose-50 to-sky-100 hover:from-sky-100 hover:to-rose-100 text-sky-950 border-sky-400 ring-2 ring-rose-500/50 shadow-sm animate-pulse'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
        }`}
        title={
          isCsvExporting 
            ? 'جاري تجهيز وتنزيل ملف التصدير...' 
            : isExportOverdue 
            ? "⚠️ تنبيه عاجل: تجاوز 24 ساعة بدون تصدير! اضغط للتصدير السريع أو اضغط مطولاً للخيارات" 
            : "تصدير Excel / CSV (اضغط مطولاً لخيارات سريعة: PDF، CSV، إرسال إيميل للمدير)"
        }
      >
        {isCsvExporting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
            <span className="text-emerald-900 font-bold">جاري تنزيل CSV...</span>
          </>
        ) : isExportOverdue ? (
          <>
            {/* Flashing Alert Beacon Top-Right */}
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 pointer-events-none" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[8px] font-black items-center justify-center shadow-xs">!</span>
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce shrink-0" />
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="font-black text-rose-950">تصدير Excel / CSV</span>
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>تصدير Excel / CSV</span>
          </>
        )}

        {isExportOverdue && !isCsvExporting && (
          <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-1 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <BellRing className="w-2.5 h-2.5 text-white animate-pulse" />
            <span>24h+</span>
          </span>
        )}

        {/* Small chevron indicator that can also be clicked to toggle dropdown */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          className="p-0.5 hover:bg-black/10 rounded transition-colors text-slate-500 hover:text-slate-900"
          title="عرض خيارات التصدير السريعة"
        >
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
        </span>
      </button>

      {/* Floating Dropdown Menu (تظهر عند الضغط المطول أو الضغط على السهم) */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute top-full mt-1.5 left-0 sm:left-auto sm:right-0 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn font-['Alexandria',sans-serif] text-right"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black">خيارات التصدير السريعة ⚡</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold bg-white/10 px-2 py-0.5 rounded-md">
              ضغطة مطولة
            </span>
          </div>

          {/* Menu Items List */}
          <div className="p-2 space-y-1">
            
            {/* Option 0: توليد تقرير الذكاء الاصطناعي المختصر */}
            <button
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onGenerateAiBrief();
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50/30 hover:from-purple-100 hover:to-indigo-100 active:scale-[0.99] flex items-start gap-3 transition-all text-right cursor-pointer group border border-purple-200/80 hover:border-purple-300 shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-black text-purple-950 group-hover:text-purple-900 flex items-center gap-1">
                    <span>توليد تقرير الذكاء الاصطناعي المختصر</span>
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 border border-purple-300 flex items-center gap-0.5">
                    <span>Gemini</span>
                    <span>✨</span>
                  </span>
                </div>
                <p className="text-[11px] text-purple-800/80 leading-snug">
                  استدعاء Gemini لتحليل بيانات وهوامش المنتج التنافسية قبل التصدير
                </p>
              </div>
            </button>

            {/* Option 1: تصدير PDF */}
            <button
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onExportPdf();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-rose-50 active:bg-rose-100 flex items-start gap-3 transition-colors text-right cursor-pointer group border border-transparent hover:border-rose-200"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-black text-slate-900 group-hover:text-rose-900">
                    تصدير PDF
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                    A4 معتمد
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  تقرير تسعير ومنافسين رسمي جاهز للطباعة أو الحفظ كـ PDF
                </p>
              </div>
            </button>

            {/* Option 2: تصدير CSV */}
            <button
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onExportCsv();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-emerald-50 active:bg-emerald-100 flex items-start gap-3 transition-colors text-right cursor-pointer group border border-transparent hover:border-emerald-200"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-black text-slate-900 group-hover:text-emerald-900">
                    تصدير CSV
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    فوري ⚡
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  تنزيل فوري لملف إكسل / CSV يشمل بيانات وتكلفة وهوامش المنتج
                </p>
              </div>
            </button>

            {/* Option 3: إرسال التقرير عبر الإيميل للمدير */}
            <button
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onEmailManager();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-indigo-50 active:bg-indigo-100 flex items-start gap-3 transition-colors text-right cursor-pointer group border border-transparent hover:border-indigo-200"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-black text-slate-900 group-hover:text-indigo-900">
                    إرسال التقرير عبر الإيميل
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    للمدير ✉️
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  مشاركة ملخص الموقف التنافسي والأرباح مباشرة إلى بريد الإدارة
                </p>
              </div>
            </button>

          </div>

          {/* Footer Link to Full Export Center */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenExportCenter();
              }}
              className="w-full py-1.5 px-3 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>فتح مركز التصدير الشامل</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
