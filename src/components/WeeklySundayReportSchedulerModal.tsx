import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  FileText,
  CheckCircle2,
  Send,
  Printer,
  X,
  Sparkles,
  TrendingUp,
  Award,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  BarChart3,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, WatchlistItem, ConnectedMerchantPlatform } from '../types';
import { generatePeriodicReport } from '../data/periodicReportsData';

export interface WeeklySundayScheduleConfig {
  enabled: boolean;
  dispatchDay: 'Sunday';
  dispatchTime: string;
  recipientEmails: string[];
  includeFinancialSummary: boolean;
  includePriceAnalytics: boolean;
  includeBuyBoxMetrics: boolean;
  includeSyncHealth: boolean;
  lastGeneratedAt?: string;
}

export interface SundayReportDispatchLog {
  id: string;
  sundayDateLabel: string;
  generatedAt: string;
  pdfFileName: string;
  fileSizeKb: number;
  recipients: string[];
  status: 'sent' | 'generated';
  totalSalesEGP: number;
  buyBoxWinRate: number;
}

const STORAGE_KEY_SUNDAY_CONFIG = 'merchant_radar_weekly_sunday_pdf_schedule_v1';
const STORAGE_KEY_SUNDAY_LOGS = 'merchant_radar_weekly_sunday_pdf_logs_v1';

export function getNextSundayArabicLabel(dispatchTime: string = '09:00'): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  const dateStr = nextSunday.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `${dateStr} • الساعة ${dispatchTime} صباحاً`;
}

interface WeeklySundayReportSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: ProductData[];
  watchlist: WatchlistItem[];
  connectedPlatforms?: ConnectedMerchantPlatform[];
  defaultEmail?: string;
  merchantStoreName?: string;
  currency?: string;
  onShowToast?: (msg: string) => void;
}

export const WeeklySundayReportSchedulerModal: React.FC<WeeklySundayReportSchedulerModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  watchlist,
  connectedPlatforms = [],
  defaultEmail = 'jassmeinnour@gmail.com',
  merchantStoreName = 'متجر التاجر المعتمد - مصر',
  currency = 'ج.م',
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'pdf_preview' | 'history'>('schedule');
  const [emailInput, setEmailInput] = useState<string>('');
  const [isSendingNow, setIsSendingNow] = useState<boolean>(false);

  const [config, setConfig] = useState<WeeklySundayScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUNDAY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      dispatchDay: 'Sunday',
      dispatchTime: '09:00',
      recipientEmails: [defaultEmail],
      includeFinancialSummary: true,
      includePriceAnalytics: true,
      includeBuyBoxMetrics: true,
      includeSyncHealth: true,
      lastGeneratedAt: 'الأحد الماضي • 09:00 ص',
    };
  });

  const [dispatchLogs, setDispatchLogs] = useState<SundayReportDispatchLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUNDAY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'sun-rep-1',
        sundayDateLabel: 'الأحد، 4 أكتوبر 2026',
        generatedAt: '09:00 ص (تلقائي)',
        pdfFileName: 'Radar_Weekly_Performance_Price_Analytics_Oct04.pdf',
        fileSizeKb: 428,
        recipients: [defaultEmail],
        status: 'sent',
        totalSalesEGP: 184500,
        buyBoxWinRate: 78,
      },
      {
        id: 'sun-rep-2',
        sundayDateLabel: 'الأحد، 27 سبتمبر 2026',
        generatedAt: '09:00 ص (تلقائي)',
        pdfFileName: 'Radar_Weekly_Performance_Price_Analytics_Sep27.pdf',
        fileSizeKb: 412,
        recipients: [defaultEmail],
        status: 'sent',
        totalSalesEGP: 169200,
        buyBoxWinRate: 74,
      },
    ];
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const weeklyReport = useMemo(() => {
    return generatePeriodicReport('weekly', allProducts, watchlist);
  }, [allProducts, watchlist]);

  const nextSundayText = useMemo(() => {
    return getNextSundayArabicLabel(config.dispatchTime);
  }, [config.dispatchTime]);

  if (!isOpen) return null;

  const saveConfig = (next: WeeklySundayScheduleConfig) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY_SUNDAY_CONFIG, JSON.stringify(next));
    } catch {}
  };

  const handleAddRecipient = () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) {
      onShowToast?.('يرجى إدخال عنوان بريد إلكتروني صحيح ⚠️');
      return;
    }
    if (config.recipientEmails.includes(trimmed)) {
      onShowToast?.('هذا البريد الإلكتروني مضاف بالفعل في جدول يوم الأحد ⚠️');
      return;
    }
    const updated = {
      ...config,
      recipientEmails: [...config.recipientEmails, trimmed],
    };
    saveConfig(updated);
    setEmailInput('');
    onShowToast?.(`تمت إضافة ${trimmed} لاستلام تقرير الـ PDF كل يوم أحد 📧`);
  };

  const handleRemoveRecipient = (email: string) => {
    if (config.recipientEmails.length <= 1) {
      onShowToast?.('يجب الإبقاء على بريد إلكتروني واحد على الأقل لاستلام التقرير الأسبوعي ⚠️');
      return;
    }
    const updated = {
      ...config,
      recipientEmails: config.recipientEmails.filter((e) => e !== email),
    };
    saveConfig(updated);
    onShowToast?.(`تمت إزالة ${email} من القائمة`);
  };

  const handleSaveSchedulePreferences = () => {
    saveConfig(config);
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.65 },
    });
    onShowToast?.(
      config.enabled
        ? `✅ تم تفعيل جدولة تقرير الأداء وتحليلات الأسعار (PDF) كل يوم أحد الساعة ${config.dispatchTime} صباحاً`
        : 'تم إيقاف الجدولة التلقائية ليوم الأحد مؤقتاً'
    );
  };

  const handleGenerateAndDispatchNow = () => {
    setIsSendingNow(true);
    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const dateLabel = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const newLog: SundayReportDispatchLog = {
        id: `sun-rep-${Date.now()}`,
        sundayDateLabel: dateLabel,
        generatedAt: `${nowStr} (توليد وإرسال فوري)`,
        pdfFileName: `Radar_Weekly_Performance_PDF_${Date.now().toString().slice(-5)}.pdf`,
        fileSizeKb: 445,
        recipients: config.recipientEmails,
        status: 'sent',
        totalSalesEGP: weeklyReport.totalSalesVolumeEGP,
        buyBoxWinRate: weeklyReport.overallBuyBoxWinRatePercent,
      };
      const updatedLogs = [newLog, ...dispatchLogs];
      setDispatchLogs(updatedLogs);
      try {
        localStorage.setItem(STORAGE_KEY_SUNDAY_LOGS, JSON.stringify(updatedLogs));
      } catch {}

      saveConfig({
        ...config,
        lastGeneratedAt: `اليوم (${nowStr})`,
      });

      setIsSendingNow(false);
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
      });
      onShowToast?.(
        `📄 تم توليد ملف PDF للأداء وتحليلات الأسعار وإرساله بنجاح إلى (${config.recipientEmails.join(', ')}) ✅`
      );
    }, 850);
  };

  const handlePrintPdf = () => {
    onShowToast?.('🖨️ جاري فتح نافذة حفظ وطباعة ملف PDF الأسبوعي للأداء وتحليلات الأسعار...');
    window.print();
  };

  const activePlatformsCount = connectedPlatforms.filter((p) => p.isConnected && !p.hasSyncError).length;
  const errorPlatformsCount = connectedPlatforms.filter((p) => p.hasSyncError || p.status === 'error').length;

  return (
    <div
      id="weekly-sunday-report-scheduler-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="weekly-sunday-report-scheduler-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="weekly-sunday-modal-title"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-indigo-500/40 overflow-hidden text-right animate-scaleUp"
      >
        {/* Top Decorative Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-sky-500 shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="weekly-sunday-modal-title" className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                  جدولة تقارير الأداء الأسبوعية (PDF) عبر البريد الإلكتروني
                </h2>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    config.enabled
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {config.enabled ? 'مفعل تلقائياً كل يوم أحد 🟢' : 'متوقف مؤقتاً'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                توليد تلقائي لملف PDF شامل للأداء المالي وتحليلات الأسعار ومعدلات الـ Buy Box وإرساله لبريد التاجر كل يوم أحد.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-weekly-sunday-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition cursor-pointer self-end sm:self-center shrink-0"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            id="tab-sunday-schedule-config"
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-indigo-400 text-white bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>إعدادات جدولة يوم الأحد 📅</span>
          </button>

          <button
            type="button"
            id="tab-sunday-pdf-preview"
            onClick={() => setActiveTab('pdf_preview')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pdf_preview'
                ? 'border-emerald-400 text-white bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>معاينة ملف الـ PDF الأسبوعي 📄</span>
          </button>

          <button
            type="button"
            id="tab-sunday-dispatch-history"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-sky-400 text-white bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span>سجل التقارير المرسلة ({dispatchLogs.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {activeTab === 'schedule' && (
            <div className="space-y-5">
              {/* Next Dispatch Highlight Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-emerald-950/80 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>موعد التوليد والإرسال التلقائي القادم (الأحد):</span>
                  </div>
                  <p className="text-sm sm:text-base font-black text-white font-['Alexandria']">
                    {config.enabled ? nextSundayText : 'الجدولة التلقائية متوقفة حالياً'}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    سيقوم النظام بتجميع إحصائيات المبيعات وتحليلات الأسعار وتوليد ملف PDF رسمي وإرساله إلى {config.recipientEmails.length} مستلم.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    id="btn-toggle-sunday-auto-schedule"
                    onClick={() => saveConfig({ ...config, enabled: !config.enabled })}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 border transition-all cursor-pointer active:scale-95 ${
                      config.enabled
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-950/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{config.enabled ? 'الجدولة مفعلة (كل أحد)' : 'تفعيل الجدولة الآن'}</span>
                  </button>
                </div>
              </div>

              {/* Dispatch Timing & Recipients Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sunday Time Selection */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <label className="font-black text-white text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>توقيت التوليد والإرسال (كل يوم أحد):</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    حدد الساعة المفضلة صباح أو مساء يوم الأحد لإصدار التقرير الأسبوعي وإرساله لبريدك.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {['08:00', '09:00', '10:00', '12:00', '15:00', '20:00'].map((timeSlot) => (
                      <button
                        key={timeSlot}
                        type="button"
                        onClick={() => saveConfig({ ...config, dispatchTime: timeSlot })}
                        className={`py-2 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                          config.dispatchTime === timeSlot
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {timeSlot} {parseInt(timeSlot, 10) < 12 ? 'ص' : 'م'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PDF Report Sections Included */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <label className="font-black text-white text-xs flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>محتويات ملف الـ PDF المولد تلقائياً:</span>
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <span className="text-[11px] text-slate-200 font-bold">ملخص الأداء المالي والمبيعات وصافي الربح</span>
                    <input
                      type="checkbox"
                      checked={config.includeFinancialSummary}
                      onChange={(e) => saveConfig({ ...config, includeFinancialSummary: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <span className="text-[11px] text-slate-200 font-bold">تحليلات الأسعار ومقارنة المنافسين اللحظية</span>
                    <input
                      type="checkbox"
                      checked={config.includePriceAnalytics}
                      onChange={(e) => saveConfig({ ...config, includePriceAnalytics: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <span className="text-[11px] text-slate-200 font-bold">مؤشرات الفوز بصندوق الشراء (Buy Box Win Rate)</span>
                    <input
                      type="checkbox"
                      checked={config.includeBuyBoxMetrics}
                      onChange={(e) => saveConfig({ ...config, includeBuyBoxMetrics: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <span className="text-[11px] text-slate-200 font-bold">تقرير استقرار المزامنة وسجل أخطاء القنوات</span>
                    <input
                      type="checkbox"
                      checked={config.includeSyncHealth}
                      onChange={(e) => saveConfig({ ...config, includeSyncHealth: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Recipient Emails Configuration */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-black text-white text-xs flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-400" />
                    <span>عناوين البريد الإلكتروني المستلمة لتقرير يوم الأحد:</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    يتم إرسال نسخة PDF مرفقة + ملخص تفاعلي
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    id="input-sunday-recipient-email"
                    placeholder="أضف بريد التاجر أو مدير المبيعات (مثال: manager@store.eg)"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRecipient();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-400"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    id="btn-add-sunday-recipient"
                    onClick={handleAddRecipient}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مستلم</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {config.recipientEmails.map((email) => (
                    <span
                      key={email}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-2 shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span dir="ltr">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="إزالة هذا البريد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pdf_preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>نموذج وثيقة الـ PDF الأسبوعية التي يتم توليدها وإرسالها كل يوم أحد:</span>
                </div>
                <button
                  type="button"
                  id="btn-print-sunday-pdf"
                  onClick={handlePrintPdf}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة / تنزيل PDF الآن 🖨️</span>
                </button>
              </div>

              {/* Official A4 Document Preview Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-black text-xs">
                        ⚡
                      </span>
                      <h3 className="text-base font-black text-slate-900 font-['Alexandria']">
                        {merchantStoreName} — التقرير الأسبوعي للأداء وتحليلات الأسعار
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      وثيقة PDF رسمية مولدة تلقائياً • جدول الإرسال الدوري: كل يوم أحد الساعة {config.dispatchTime} صباحاً
                    </p>
                  </div>
                  <div className="text-left font-mono text-[11px] bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    <div className="font-black text-indigo-900">SUNDAY-AUTO-PDF</div>
                    <div className="text-slate-500">{weeklyReport.periodLabel}</div>
                  </div>
                </div>

                {config.includeFinancialSummary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-bold">إجمالي المبيعات الأسبوعية</span>
                      <span className="text-sm font-black font-mono text-slate-900">
                        {weeklyReport.totalSalesVolumeEGP.toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 block font-bold">صافي الأرباح المحققة</span>
                      <span className="text-sm font-black font-mono text-emerald-800">
                        {weeklyReport.totalNetProfitEGP.toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                      <span className="text-[10px] text-indigo-700 block font-bold">إجمالي الطلبات المنفذة</span>
                      <span className="text-sm font-black font-mono text-indigo-900">
                        {weeklyReport.totalOrdersCount} طلب
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                      <span className="text-[10px] text-sky-800 block font-bold">معدل الفوز بالـ Buy Box</span>
                      <span className="text-sm font-black font-mono text-sky-900">
                        {weeklyReport.overallBuyBoxWinRatePercent}%
                      </span>
                    </div>
                  </div>
                )}

                {config.includePriceAnalytics && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>تحليلات الأسعار وأداء المنصات الأسبوعي:</span>
                    </h4>
                    <table className="w-full text-right text-[11px] border border-slate-200 rounded-xl overflow-hidden border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-black">
                        <tr>
                          <th className="p-2.5 border-b border-slate-200">المنصة</th>
                          <th className="p-2.5 border-b border-slate-200">حجم المبيعات</th>
                          <th className="p-2.5 border-b border-slate-200 text-center">نسبة Buy Box</th>
                          <th className="p-2.5 border-b border-slate-200">صافي الربح</th>
                          <th className="p-2.5 border-b border-slate-200">أبرز منافس مرصود</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {weeklyReport.platformBreakdown.map((plat, idx) => (
                          <tr key={plat.platformId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                            <td className="p-2.5 font-black text-slate-900">{plat.platformName}</td>
                            <td className="p-2.5 font-mono">{plat.salesVolumeEGP.toLocaleString()} {currency}</td>
                            <td className="p-2.5 font-mono text-center font-bold text-indigo-700">{plat.buyBoxWinRatePercent}%</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">+{plat.netProfitEGP.toLocaleString()} {currency}</td>
                            <td className="p-2.5 text-slate-600">{plat.topCompetitorName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {config.includeSyncHealth && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-black text-slate-800 block">حالة استقرار القنوات ومزامنة الأسعار:</span>
                      <span className="text-slate-600">
                        قنوات متصلة وسليمة: <strong>{activePlatformsCount}</strong> • قنوات متعثرة: <strong>{errorPlatformsCount}</strong>
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      مفحوص ومعتمد ✓
                    </span>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[11px] space-y-1">
                  <span className="font-black text-indigo-950 block">التوصية الاستراتيجية للأسبوع القادم:</span>
                  <p className="text-slate-700 leading-relaxed">{weeklyReport.aiExecutiveSummary}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>سجل تقارير الـ PDF الأسبوعية التي تم توليدها وإرسالها:</span>
                <span className="text-[11px] font-mono text-emerald-400">Cron: Every Sunday {config.dispatchTime}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px]">
                      <th className="py-2.5 px-3 font-black">تاريخ يوم الأحد</th>
                      <th className="py-2.5 px-3 font-black">ملف الـ PDF المولد</th>
                      <th className="py-2.5 px-3 font-black">المستلمون</th>
                      <th className="py-2.5 px-3 text-center font-black">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {dispatchLogs.map((log, i) => (
                      <tr key={log.id} className={i % 2 === 0 ? 'bg-slate-900/90' : 'bg-slate-950/60'}>
                        <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                          <div>{log.sundayDateLabel}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{log.generatedAt}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-300">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{log.pdfFileName}</span>
                            <span className="text-[10px] text-slate-500">({log.fileSizeKb} KB)</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                          {log.recipients.join(', ')}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/80 text-[10px] font-black">
                            تم الإرسال بنجاح ✓
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleGenerateAndDispatchNow}
            disabled={isSendingNow}
            id="btn-generate-send-sunday-pdf-now"
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-950/50 cursor-pointer transition active:scale-95 disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isSendingNow ? 'animate-bounce' : ''}`} />
            <span>
              {isSendingNow
                ? 'جاري توليد ملف PDF وإرساله للبريد...'
                : 'توليد وإرسال تقرير PDF الأسبوعي الآن 🚀'}
            </span>
          </button>

          <div className="flex items-center gap-2 ms-auto">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer"
            >
              إغلاق
            </button>
            <button
              type="button"
              id="btn-save-sunday-schedule"
              onClick={handleSaveSchedulePreferences}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950/50 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>حفظ جدولة يوم الأحد 💾</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
