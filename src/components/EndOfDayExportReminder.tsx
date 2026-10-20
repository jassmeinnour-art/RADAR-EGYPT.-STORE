import React, { useState, useEffect } from 'react';
import {
  Clock,
  Download,
  AlertTriangle,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingDown,
  Layers,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, WatchlistItem } from '../types';
import {
  isExportOverdue24h,
  getHoursSinceLastExport,
  getLastExportTimestamp,
  isExportReminderSnoozed,
  snoozeExportReminder,
  exportEndOfDayMasterReportToCSV
} from '../utils/csvProductManager';

interface EndOfDayExportReminderProps {
  allProducts: ProductData[];
  watchlist?: WatchlistItem[];
  currency?: string;
  onOpenExportModal: () => void;
  onShowToast?: (msg: string) => void;
}

export const EndOfDayExportReminder: React.FC<EndOfDayExportReminderProps> = ({
  allProducts,
  watchlist = [],
  currency = 'EGP',
  onOpenExportModal,
  onShowToast
}) => {
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [hoursElapsed, setHoursElapsed] = useState<number | null>(null);
  const [lastTs, setLastTs] = useState<number | null>(null);
  const [isSnoozed, setIsSnoozed] = useState<boolean>(false);
  const [isDismissedSession, setIsDismissedSession] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showTooltipInfo, setShowTooltipInfo] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);

  // Check overdue condition on mount and whenever custom events fire
  const evaluateExportStatus = () => {
    const overdue = isExportOverdue24h();
    const hours = getHoursSinceLastExport();
    const timestamp = getLastExportTimestamp();
    const snoozed = isExportReminderSnoozed();

    setIsOverdue(overdue);
    setHoursElapsed(hours);
    setLastTs(timestamp);
    setIsSnoozed(snoozed);
  };

  useEffect(() => {
    evaluateExportStatus();

    // Listen for export events across the entire app
    const handleExportCompleted = () => {
      evaluateExportStatus();
    };

    const handleExportSnoozed = () => {
      evaluateExportStatus();
    };

    window.addEventListener('merchant_export_completed', handleExportCompleted);
    window.addEventListener('merchant_export_snoozed', handleExportSnoozed);

    return () => {
      window.removeEventListener('merchant_export_completed', handleExportCompleted);
      window.removeEventListener('merchant_export_snoozed', handleExportSnoozed);
    };
  }, []);

  // Format last export human readable date
  const getFormattedLastExportTime = (): string => {
    if (!lastTs) {
      return 'لم يتم التصدير مسبقاً (هذه أول جلسة)';
    }
    const date = new Date(lastTs);
    const dateStr = date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    if (hoursElapsed !== null) {
      return `منذ ${hoursElapsed} ساعة (${dateStr} - ${timeStr})`;
    }
    return `${dateStr} - ${timeStr}`;
  };

  // 1-Click Master End-of-Day Export
  const handleQuickEndOfDayExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        exportEndOfDayMasterReportToCSV(allProducts, watchlist, currency);
        
        // Visual Confetti Celebration
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.85, x: 0.8 }
          });
        } catch {
          // safe
        }

        onShowToast?.('تم تصدير تقرير نهاية اليوم الشامل بنجاح وتحديث تاريخ الأرشفة! 📁✅');
        evaluateExportStatus();
      } catch (err) {
        console.error('Failed to export end of day report:', err);
        onShowToast?.('حدث خطأ أثناء تصدير التقرير، يرجى المحاولة من مركز التصدير.');
      } finally {
        setIsExporting(false);
      }
    }, 450);
  };

  // Handle Snooze (2 hours)
  const handleSnooze = () => {
    snoozeExportReminder(2);
    setIsSnoozed(true);
    setIsMinimized(true);
    onShowToast?.('تم تأجيل تذكير تقرير نهاية اليوم لمدة ساعتين ⏰');
  };

  return (
    <>
      {/* Floating Trigger Button (Always visible at bottom-right of viewport, matching AI Advisor) */}
      <div className="fixed bottom-3.5 right-3.5 sm:bottom-5 sm:right-6 z-40 max-w-[calc(50vw-1rem)] sm:max-w-none">
        <button
          id="btn-daily-export-report"
          type="button"
          onClick={handleQuickEndOfDayExport}
          disabled={isExporting}
          className="group relative flex items-center gap-2 sm:gap-2.5 h-12 px-2.5 sm:px-4 bg-slate-900/95 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-emerald-950/25 transition-all duration-200 active:scale-95 cursor-pointer border border-emerald-500/40 hover:border-emerald-400/60 backdrop-blur-md select-none w-full sm:w-auto"
          title="تصدير تقرير اليوم الشامل بضغطة واحدة"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              {isExporting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              )}
            </div>
            {isOverdue ? (
              <>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-400 border border-slate-900 rounded-full animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-500 border border-slate-900 rounded-full" />
              </>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full" />
            )}
          </div>

          <div className="text-right min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-white whitespace-nowrap truncate">
                التقرير اليومي
              </span>
              <span className={`hidden xs:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                isOverdue
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}>
                {isOverdue ? 'تصدير ⚡' : 'محدث ✅'}
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400 font-medium truncate mt-0.5">
              {allProducts.length} منتج • أرشفة الأسعار
            </p>
          </div>

          {/* Options toggle trigger icon */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 -me-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="عرض خيارات التقرير"
          >
            <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${!isMinimized ? 'rotate-180 text-emerald-400' : ''}`} />
          </span>
        </button>
      </div>

      {/* Expanded Options Popover (Floats cleanly directly above the button) */}
      {!isMinimized && (
        <aside
          aria-label="خيارات تقرير نهاية اليوم"
          className="fixed bottom-18 sm:bottom-20 right-3.5 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-84 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-emerald-500/50 shadow-2xl overflow-hidden font-['Alexandria',sans-serif] animate-fadeIn"
        >
          {/* Top Banner Stripe */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-3.5 py-2 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <div className="text-xs font-black tracking-wide">
                <span>تقرير نهاية اليوم الشامل 📊</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="w-6 h-6 rounded-full hover:bg-black/20 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
              title="إغلاق القائمة"
              aria-label="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Popover Body */}
          <div className="p-3.5 sm:p-4 space-y-3 text-slate-800">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-xs font-black text-slate-900 leading-tight">
                  {isOverdue ? 'مرّت أكثر من 24 ساعة دون أرشفة الأسعار!' : 'بيانات التقرير جاهزة ومحدثة'}
                </h3>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black shrink-0 border ${
                  isOverdue
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isOverdue ? 'مطلوب للأرشفة' : 'جاهز'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                يُوصى بأرشفة أسعار الإغلاق اليومية لحفظ تقلبات أسعار المنافسين وهوامش الأرباح.
              </p>
            </div>

            {/* Live Snapshot & Elapsed Time Box */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-900 font-bold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>آخر تصدير:</span>
                </span>
                <span className="font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-[10px]">
                  {getFormattedLastExportTime()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60 text-[10px]">
                <span>البيانات الجاهزة:</span>
                <span className="font-black text-indigo-900">
                  {allProducts.length} منتج • {watchlist.length} مراقبة منافس
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5 pt-0.5">
              {/* Primary 1-Click Export Button */}
              <button
                type="button"
                onClick={handleQuickEndOfDayExport}
                disabled={isExporting}
                className="w-full h-10 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50"
                title="تنزيل تقرير نهاية اليوم الشامل بصيغة CSV / Excel بضغطة واحدة"
              >
                {isExporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري إعداد التقرير...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                    <span>تصدير فوري (CSV / Excel) ⚡</span>
                  </>
                )}
              </button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMinimized(true);
                    onOpenExportModal();
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>مركز التصدير الكامل 📂</span>
                </button>

                <button
                  type="button"
                  onClick={handleSnooze}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>تذكيري بعد ساعتين ⏰</span>
                </button>
              </div>
            </div>

            {/* Pro Tip Footnote */}
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 pt-0.5">
              <Sparkles className="w-3 h-3 text-sky-500 shrink-0" />
              <span>التصدير اليومي يحافظ على سلامة حسابات الضرائب وهوامش الربح.</span>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
