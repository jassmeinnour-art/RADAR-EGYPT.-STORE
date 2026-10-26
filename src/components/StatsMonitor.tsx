import React, { useState, useEffect, useRef } from 'react';
import { useAsyncOperations, triggerGlobalAsyncStart, triggerGlobalAsyncEnd } from '../context/AsyncOperationsContext';
import { useAuth } from '../context/AuthContext';
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Mail, Send, ShieldAlert, RotateCcw } from 'lucide-react';

export interface EmailAlertLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: string;
  failureCount: number;
}

export const StatsMonitor: React.FC = () => {
  const { activeOperations, recentCompleted } = useAsyncOperations();
  const { profile, user } = useAuth();

  const userEmail = profile?.email || user?.email || 'jassmeinnour@gmail.com';

  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('radar_kpi_sync_failures');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lastEmailAlert, setLastEmailAlert] = useState<EmailAlertLog | null>(() => {
    try {
      const saved = localStorage.getItem('radar_kpi_last_email_alert');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [showEmailDetailsModal, setShowEmailDetailsModal] = useState<boolean>(false);

  const processedOpIdRef = useRef<string | null>(null);

  // Filter for operations related to KPI, stats, or platform synchronization
  const kpiOps = activeOperations.filter(op => 
    op.title.toLowerCase().includes('kpi') || 
    op.title.includes('إحصائيات') ||
    op.category === 'platform_sync'
  );
  
  const isKpiLoading = kpiOps.length > 0;
  
  // Track the last relevant completed operation for KPI status
  const lastKpiOp = recentCompleted && (
    recentCompleted.title.toLowerCase().includes('kpi') || 
    recentCompleted.title.includes('إحصائيات') ||
    recentCompleted.category === 'platform_sync'
  ) ? recentCompleted : null;

  // Function to simulate sending an email notification
  const sendSimulatedEmailAlert = (failuresCount: number) => {
    setIsSendingEmail(true);
    const sentTime = new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: 'numeric',
      month: 'short'
    });

    const alertLog: EmailAlertLog = {
      id: `email_alert_${Date.now()}`,
      recipient: userEmail,
      subject: `🚨 تنبيه عاجل: فشل التزامن التلقائي لمؤشرات الأداء (${failuresCount} مرات متتالية)`,
      body: `عزيزي التاجر،\n\nنود إعلامك بأن نظام رادار التاجر رصد تعطل عملية التزامن التلقائي مع المنصات لـ ${failuresCount} مرات متتالية.\n\nبيانات التنفيذ:\n• وقت الرصد: ${sentTime}\n• البريد المسجل: ${userEmail}\n• الحالة: يتطلب فحص مفاتيح الـ API وإعادة المحاولة.\n\nفريق دعم رادار التاجر مصر.`,
      sentAt: sentTime,
      failureCount: failuresCount
    };

    setTimeout(() => {
      setIsSendingEmail(false);
      setLastEmailAlert(alertLog);
      try {
        localStorage.setItem('radar_kpi_last_email_alert', JSON.stringify(alertLog));
      } catch (e) {
        console.warn('Storage save error:', e);
      }
    }, 1200);
  };

  // Process completed async operations & track consecutive failures
  useEffect(() => {
    if (!lastKpiOp || processedOpIdRef.current === lastKpiOp.id) return;

    processedOpIdRef.current = lastKpiOp.id;

    if (!lastKpiOp.success) {
      setConsecutiveFailures(prev => {
        const nextCount = prev + 1;
        try {
          localStorage.setItem('radar_kpi_sync_failures', nextCount.toString());
        } catch {}

        if (nextCount >= 3) {
          sendSimulatedEmailAlert(nextCount);
        }
        return nextCount;
      });
    } else {
      setConsecutiveFailures(0);
      try {
        localStorage.removeItem('radar_kpi_sync_failures');
      } catch {}
    }
  }, [lastKpiOp]);

  // Manual simulation functions
  const handleSimulateSyncFailure = () => {
    const opId = triggerGlobalAsyncStart('platform_sync', 'مزامنة مؤشرات KPI والأسعار');
    setTimeout(() => {
      triggerGlobalAsyncEnd(opId, false, 'مزامنة مؤشرات KPI والأسعار', 'platform_sync');
    }, 500);
  };

  const handleSimulateTripleFailure = () => {
    const nextCount = 3;
    setConsecutiveFailures(nextCount);
    try {
      localStorage.setItem('radar_kpi_sync_failures', '3');
    } catch {}
    sendSimulatedEmailAlert(nextCount);
  };

  const handleSimulateSyncSuccess = () => {
    const opId = triggerGlobalAsyncStart('platform_sync', 'مزامنة مؤشرات KPI والأسعار');
    setTimeout(() => {
      triggerGlobalAsyncEnd(opId, true, 'مزامنة مؤشرات KPI والأسعار', 'platform_sync');
      setConsecutiveFailures(0);
      setLastEmailAlert(null);
      try {
        localStorage.removeItem('radar_kpi_sync_failures');
        localStorage.removeItem('radar_kpi_last_email_alert');
      } catch {}
    }, 500);
  };

  const handleResetCounter = () => {
    setConsecutiveFailures(0);
    setLastEmailAlert(null);
    try {
      localStorage.removeItem('radar_kpi_sync_failures');
      localStorage.removeItem('radar_kpi_last_email_alert');
    } catch {}
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur-md shadow-xl transition-all duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-all duration-300 ${
            isKpiLoading 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
              : consecutiveFailures >= 3
                ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                : (consecutiveFailures > 0 || (lastKpiOp && !lastKpiOp.success))
                  ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          } border shadow-inner`}>
            {isKpiLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : consecutiveFailures >= 3 ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : (consecutiveFailures > 0 || (lastKpiOp && !lastKpiOp.success)) ? (
              <AlertCircle className="w-5 h-5 animate-pulse" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white font-['Cairo'] tracking-tight">مراقب مزامنة البيانات (KPI Sync Monitor)</h4>
              {consecutiveFailures > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono animate-pulse ${
                  consecutiveFailures >= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/40 ring-1 ring-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  فشل {consecutiveFailures} متتالي
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-['Cairo'] mt-0.5">
              {isKpiLoading 
                ? `جاري تحديث ${kpiOps[0]?.title}...` 
                : consecutiveFailures >= 3
                  ? 'تم رصد إخفاقات متتالية وتفعيل نظام التنبيه المبكر'
                  : (consecutiveFailures > 0 || (lastKpiOp && !lastKpiOp.success))
                    ? 'تعطل الاتصال في عملية المزامنة الأخيرة'
                    : 'كافة المؤشرات محدثة ومستقرة ومزامنة مع السحابة'}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {lastKpiOp && !isKpiLoading && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border transition-all duration-300 ${
              lastKpiOp.success 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse shadow-sm shadow-red-500/20'
            }`}>
              {lastKpiOp.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5 animate-pulse" />}
              <span>{lastKpiOp.success ? 'تزامن ناجح' : 'فشل في التزامن'}</span>
            </div>
          )}
          
          <div className="text-[9px] font-bold text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
            Status: {isKpiLoading ? 'SYNCING' : consecutiveFailures >= 3 ? 'ALERT_SENT' : (consecutiveFailures > 0 || (lastKpiOp && !lastKpiOp.success)) ? 'SYNC_FAILED' : 'READY'}
          </div>
        </div>
      </div>

      {/* Persistent Error Alert for Sync Failure */}
      {lastKpiOp && !lastKpiOp.success && !isKpiLoading && consecutiveFailures < 3 && (
        <div className="mt-4 p-3.5 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-3 ring-1 ring-red-500/20 shadow-lg animate-pulse">
          <div className="p-1.5 bg-red-500/20 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <div className="text-[11px] text-red-100 font-['Cairo'] leading-relaxed flex-1">
            <span className="font-black block text-xs mb-0.5 text-red-300">⚠️ تنبيه تقني: تعطل التزامن التلقائي للبيانات ({consecutiveFailures}/3)</span>
            فشل النظام في الاتصال بمنصات التجارة الإلكترونية. إذا تكرر الفشل لـ 3 مرات متتالية سيتم إرسال تنبيه بالبريد الإلكتروني تلقائياً.
          </div>
        </div>
      )}

      {/* 3+ Consecutive Failures Email Notification Banner */}
      {consecutiveFailures >= 3 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border-2 border-red-500/50 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/40 text-red-400 shrink-0">
                <Mail className="w-5 h-5 animate-bounce-subtle" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-red-200 font-['Cairo']">
                    🚨 إرسال تنبيه بالبريد الإلكتروني (محاكاة) - {consecutiveFailures} إخفاقات متتالية
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-bold border border-red-500/30">
                    تم الإرسال لـ {userEmail}
                  </span>
                </div>
                <p className="text-[11px] text-red-200/80 font-['Cairo'] mt-1 leading-relaxed">
                  تم إرسال بريد إلكتروني تنبيهي تلقائي إلى <strong className="text-white underline">{userEmail}</strong> بسبب فشل التزامن التلقائي لأكثر من 3 مرات متتالية لضمان المتابعة الفورية.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {lastEmailAlert && (
                <button
                  type="button"
                  onClick={() => setShowEmailDetailsModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>عرض الرسالة المرسلة</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSimulateSyncSuccess}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>معالجة التزامن (نجاح)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Simulation & Test Panel */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-['Cairo']">
        <div className="flex items-center gap-2 text-slate-400">
          <Send className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-slate-300">أدوات تجربة التنبيه البريدي:</span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSimulateSyncFailure}
            disabled={isKpiLoading || isSendingEmail}
            className="px-2.5 py-1 bg-slate-800 hover:bg-red-900/40 text-red-300 border border-red-500/20 rounded-lg font-bold transition text-[10px] flex items-center gap-1 disabled:opacity-50"
            title="إضافة إخفاق واحد لعداد الفشل"
          >
            <AlertCircle className="w-3 h-3" />
            <span>محاكاة فشل (+1)</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateTripleFailure}
            disabled={isSendingEmail}
            className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-500/40 rounded-lg font-black transition text-[10px] flex items-center gap-1 shadow-sm disabled:opacity-50"
            title="محاكاة 3 إخفاقات فوراً لتجربة إرسال التنبيه البريدي"
          >
            <Mail className="w-3 h-3 text-red-400" />
            <span>تجربة التنبيه (3 إخفاقات)</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateSyncSuccess}
            disabled={isKpiLoading}
            className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/20 rounded-lg font-bold transition text-[10px] flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>محاكاة نجاح التزامن</span>
          </button>

          {(consecutiveFailures > 0 || lastEmailAlert) && (
            <button
              type="button"
              onClick={handleResetCounter}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg font-bold transition text-[10px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>تصفير</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulated Email Content Modal */}
      {showEmailDetailsModal && lastEmailAlert && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-['Cairo'] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Mail className="w-5 h-5" />
                <h3 className="font-black text-sm text-white">تفاصيل البريد الإلكتروني المرسل (محاكاة)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailDetailsModal(false)}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">المستلم:</span>
                <span className="text-amber-300 font-mono font-black">{lastEmailAlert.recipient}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">وقت الإرسال:</span>
                <span className="text-slate-200 font-mono">{lastEmailAlert.sentAt}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold block">العنوان:</span>
                <div className="text-red-300 font-black">{lastEmailAlert.subject}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold block">محتوى الرسالة:</span>
                <pre className="text-slate-200 text-[11px] whitespace-pre-wrap font-sans leading-relaxed">
                  {lastEmailAlert.body}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmailDetailsModal(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

