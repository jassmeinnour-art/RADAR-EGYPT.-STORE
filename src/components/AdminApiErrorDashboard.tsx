import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Activity,
  Server,
  Radio,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Terminal,
  Zap,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Bell,
  Send,
  Eye,
  X,
  FileCode,
  Layers,
  ArrowUpRight,
  Database,
  CheckSquare,
  Square,
  MinusSquare,
  CheckCheck,
  Loader2,
  AlertOctagon,
  Tags,
  Building2,
  Globe
} from 'lucide-react';
import { 
  ApiSyncErrorItem, 
  ApiPlatformId, 
  ApiErrorSeverity, 
  ApiErrorStatus 
} from '../types';
import {
  subscribeToApiSyncErrors,
  updateApiSyncErrorStatus,
  deleteApiSyncError,
  retryApiSyncError,
  simulateApiSyncFailure,
  pingPlatformEndpoint,
  PLATFORM_NAMES_MAP,
  loadLocalCachedErrors,
  bulkRetryApiSyncErrors,
  bulkUpdateApiSyncErrorsStatus,
  bulkDeleteApiSyncErrors,
  BulkRetryProgress,
  BulkRetryResult
} from '../services/apiErrorLoggingService';
import { useAudioNotifications } from '../context/AudioNotificationContext';

interface AdminApiErrorDashboardProps {
  onShowToast: (message: string) => void;
  adminEmail?: string;
}

export const AdminApiErrorDashboard: React.FC<AdminApiErrorDashboardProps> = ({
  onShowToast,
  adminEmail = 'jassmeinnour@gmail.com'
}) => {
  const { playPriceAlertSound } = useAudioNotifications();

  // State
  const [errors, setErrors] = useState<ApiSyncErrorItem[]>(() => loadLocalCachedErrors());
  const [selectedError, setSelectedError] = useState<ApiSyncErrorItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [errorTypeFilter, setErrorTypeFilter] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  // Multi-selection & Bulk Retry State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkRetrying, setIsBulkRetrying] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<BulkRetryProgress | null>(null);
  const [bulkResultsSummary, setBulkResultsSummary] = useState<BulkRetryResult | null>(null);
  const [isBulkOperating, setIsBulkOperating] = useState<boolean>(false);

  // Gateway Latency Matrix
  const [gatewayPings, setGatewayPings] = useState<Record<string, { status: string; latencyMs: number; message: string }>>({
    amazon_eg: { status: 'online', latencyMs: 142, message: 'Amazon SP-API Egypt Gateway نشط' },
    noon_eg: { status: 'online', latencyMs: 185, message: 'Noon Partner API متصل' },
    jumia_eg: { status: 'online', latencyMs: 210, message: 'Jumia Seller Center API متصل' },
    asin_sync: { status: 'online', latencyMs: 95, message: 'ASIN Scraper Worker جاهز' },
  });

  // Real-time Firestore Subscription
  useEffect(() => {
    const unsubscribe = subscribeToApiSyncErrors((updatedList) => {
      setErrors(updatedList);
    });

    // Listen to custom window event for instant chime & toast when new error is reported
    const handleSyncErrorEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ApiSyncErrorItem>;
      const item = customEvent.detail;
      if (item) {
        try {
          playPriceAlertSound();
        } catch {
          // ignore
        }
        onShowToast(`🚨 تم رصد خطأ مزامنة جديد: ${item.errorCode} في ${item.platformName}`);
      }
    };

    window.addEventListener('merchant_api_sync_error_recorded', handleSyncErrorEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('merchant_api_sync_error_recorded', handleSyncErrorEvent);
    };
  }, [playPriceAlertSound, onShowToast]);

  // Statistics
  const stats = useMemo(() => {
    const total = errors.length;
    const unresolved = errors.filter(e => e.status === 'unresolved').length;
    const critical = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length;
    const resolved = errors.filter(e => e.status === 'resolved').length;
    return { total, unresolved, critical, resolved };
  }, [errors]);

  // Error Type Categorization Helper
  const categorizeErrorType = useCallback((item: ApiSyncErrorItem): string => {
    const code = (item.errorCode || '').toLowerCase();
    const msg = (item.errorMessage || '').toLowerCase();
    const details = (typeof item.errorDetails === 'string' ? item.errorDetails : JSON.stringify(item.errorDetails || '')).toLowerCase();

    if (
      code.includes('504') || 
      code.includes('500') || 
      code.includes('502') || 
      code.includes('503') || 
      msg.includes('timeout') || 
      msg.includes('gateway') || 
      details.includes('timeout')
    ) {
      return 'timeout';
    }
    if (
      code.includes('401') || 
      msg.includes('unauthorized') || 
      msg.includes('token') || 
      msg.includes('auth') || 
      details.includes('token')
    ) {
      return 'auth';
    }
    if (
      code.includes('429') || 
      msg.includes('rate limit') || 
      msg.includes('throttle') || 
      details.includes('too many requests')
    ) {
      return 'rate_limit';
    }
    if (
      code.includes('403') || 
      msg.includes('forbidden') || 
      msg.includes('bot') || 
      msg.includes('cloudflare') || 
      details.includes('bot')
    ) {
      return 'bot_block';
    }
    if (
      code.includes('400') || 
      code.includes('422') || 
      msg.includes('bad request') || 
      msg.includes('validation') || 
      msg.includes('schema')
    ) {
      return 'bad_request';
    }
    if (
      code.includes('network') || 
      msg.includes('network') || 
      msg.includes('failed to fetch') || 
      msg.includes('offline') || 
      code.includes('econn')
    ) {
      return 'network';
    }
    return 'other';
  }, []);

  // Filtered List
  const filteredErrors = useMemo(() => {
    return errors.filter(item => {
      if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (errorTypeFilter !== 'all') {
        const cat = categorizeErrorType(item);
        if (cat !== errorTypeFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = (item.errorCode || '').toLowerCase().includes(q);
        const matchMsg = (item.errorMessage || '').toLowerCase().includes(q);
        const matchPlatform = (item.platformName || '').toLowerCase().includes(q);
        const matchEmail = (item.userEmail || '').toLowerCase().includes(q);
        const matchEndpoint = (item.endpoint || '').toLowerCase().includes(q);
        if (!matchCode && !matchMsg && !matchPlatform && !matchEmail && !matchEndpoint) {
          return false;
        }
      }

      return true;
    });
  }, [errors, platformFilter, severityFilter, statusFilter, errorTypeFilter, searchQuery, categorizeErrorType]);

  // Dynamic counts for Filter badges & dropdowns
  const errorTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: errors.length,
      timeout: 0,
      rate_limit: 0,
      auth: 0,
      bot_block: 0,
      bad_request: 0,
      network: 0,
      other: 0,
    };
    errors.forEach(item => {
      const cat = categorizeErrorType(item);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [errors, categorizeErrorType]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: errors.length,
    };
    errors.forEach(item => {
      counts[item.platform] = (counts[item.platform] || 0) + 1;
    });
    return counts;
  }, [errors]);

  // Unresolved errors list & counts
  const unresolvedErrors = useMemo(() => {
    return errors.filter(item => item.status === 'unresolved');
  }, [errors]);

  // Selection handlers
  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (filteredErrors.length === 0) {
      onShowToast('لا توجد أخطاء في القائمة الحالية لتحديدها');
      return;
    }
    const filteredIds = filteredErrors.map(e => e.id);
    const areAllSelected = filteredIds.every(id => selectedIds.has(id));

    if (areAllSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredIds.forEach(id => next.delete(id));
        return next;
      });
      onShowToast('تم إلغاء تحديد كافة الأخطاء المعروضة');
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredIds.forEach(id => next.add(id));
        return next;
      });
      onShowToast(`تم تحديد الكل بنجاح (${filteredIds.length} خطأ) 🎯`);
    }
  };

  const handleSelectAllFiltered = handleSelectAll;

  const handleSelectAllUnresolved = () => {
    const unresolvedIds = unresolvedErrors.map(e => e.id);
    setSelectedIds(new Set(unresolvedIds));
    onShowToast(`تم تحديد كافة الأخطاء المعلقة (${unresolvedIds.length} خطأ) 🎯`);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk Retry Handler
  const handleExecuteBulkRetry = async (targetItems?: ApiSyncErrorItem[]) => {
    const itemsToRetry = targetItems || errors.filter(e => selectedIds.has(e.id));
    if (itemsToRetry.length === 0) {
      onShowToast('الرجاء تحديد خطأ واحد على الأقل لإعادة التجربة الجماعية');
      return;
    }

    setIsBulkRetrying(true);
    setBulkProgress({ current: 0, total: itemsToRetry.length });

    try {
      const result = await bulkRetryApiSyncErrors(itemsToRetry, (progress) => {
        setBulkProgress(progress);
      });

      setBulkResultsSummary(result);
      playPriceAlertSound();

      // Automatically unselect recovered error IDs
      const recoveredIds = new Set(result.results.filter(r => r.success).map(r => r.id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        recoveredIds.forEach(id => next.delete(id));
        return next;
      });

      if (result.successful > 0) {
        onShowToast(`🎉 تمت إعادة التجربة الجماعية: تعافت بنجاح ${result.successful} من ${result.total} واجهة!`);
      } else {
        onShowToast(`⚠️ فشلت استعادة الاتصال التلقائي (${result.failed} أخطاء تحتاج لمراجعة مفاتيح الربط).`);
      }
    } catch (err) {
      onShowToast('حدث خطأ أثناء تنفيذ عملية إعادة التجربة الجماعية');
    } finally {
      setIsBulkRetrying(false);
      setBulkProgress(null);
    }
  };

  // Bulk Status Update (Resolve)
  const handleBulkMarkResolved = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsBulkOperating(true);
    try {
      const count = await bulkUpdateApiSyncErrorsStatus(
        ids, 
        'resolved', 
        `تم تأكيد الحل الجماعي بواسطة المدير (${adminEmail})`, 
        adminEmail
      );
      onShowToast(`تم تأكيد حل ${count} أخطاء مزامنة دفعة واحدة بنجاح 🟢`);
      setSelectedIds(new Set());
    } catch {
      onShowToast('فشلت العملية الجماعية');
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (!window.confirm(`هل أنت متأكد من حذف ${ids.length} سجل أخطاء من قاعدة بيانات Firestore نهائياً؟`)) {
      return;
    }

    setIsBulkOperating(true);
    try {
      const count = await bulkDeleteApiSyncErrors(ids);
      onShowToast(`تم حذف ${count} سجل أخطاء من Firestore بنجاح 🗑️`);
      setSelectedIds(new Set());
    } catch {
      onShowToast('فشل حذف السجلات');
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Handle Retry
  const handleRetry = async (item: ApiSyncErrorItem) => {
    setRetryingId(item.id);
    try {
      const res = await retryApiSyncError(item);
      if (res.success) {
        onShowToast(res.message);
      } else {
        onShowToast(`⚠️ ${res.message}`);
      }
    } catch {
      onShowToast('حدث خطأ أثناء محاولة الاتصال بالمنصة');
    } finally {
      setRetryingId(null);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (
    errorId: string, 
    newStatus: ApiErrorStatus, 
    notes?: string
  ) => {
    await updateApiSyncErrorStatus(errorId, newStatus, notes, adminEmail);
    onShowToast(`تم تحديث حالة العطل إلى: ${getStatusLabel(newStatus)}`);
    if (selectedError && selectedError.id === errorId) {
      setSelectedError(prev => prev ? {
        ...prev,
        status: newStatus,
        resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : prev.resolvedAt,
        resolvedBy: newStatus === 'resolved' ? adminEmail : prev.resolvedBy,
        resolutionNotes: notes || prev.resolutionNotes
      } : null);
    }
  };

  // Handle Delete
  const handleDelete = async (errorId: string) => {
    await deleteApiSyncError(errorId);
    onShowToast('تم حذف سجل الخطأ من Firestore');
    if (selectedError?.id === errorId) {
      setSelectedError(null);
    }
  };

  // Copy details
  const handleCopyReport = (item: ApiSyncErrorItem) => {
    const report = `[تقرير خطأ مزامنة API - رادار التجار]
معرف الخطأ: ${item.id}
المنصة: ${item.platformName} (${item.platform})
نقطة الاتصال: ${item.endpoint}
رمز الخطأ: ${item.errorCode}
رسالة الخطأ: ${item.errorMessage}
مستوى الخطورة: ${item.severity}
الحالة: ${item.status}
حساب التاجر: ${item.userEmail || 'غير محدد'}
تاريخ الحدوث: ${item.createdAt}
التفاصيل التقنية:
${item.errorDetails || 'لا توجد تفاصيل إضافية'}`;

    navigator.clipboard.writeText(report);
    setCopiedId(item.id);
    onShowToast('تم نسخ تقرير الخطأ الفني إلى الحافظة 📋');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Simulate Error
  const handleSimulate = async (scenario: 'amazon_timeout' | 'noon_rate_limit' | 'jumia_auth_expired' | 'seller_central_scrape_blocked') => {
    setIsSimulating(true);
    try {
      const created = await simulateApiSyncFailure(scenario, {
        userEmail: adminEmail
      });
      onShowToast(`تمت محاكاة وحفظ خطأ (${created.errorCode}) في Firestore بنجاح ⚡`);
    } catch {
      onShowToast('فشلت محاكاة الخطأ');
    } finally {
      setIsSimulating(false);
    }
  };

  // Ping all gateways
  const handlePingAllGateways = async () => {
    setIsPinging(true);
    try {
      const [amz, noon, jumia, asin] = await Promise.all([
        pingPlatformEndpoint('amazon_eg'),
        pingPlatformEndpoint('noon_eg'),
        pingPlatformEndpoint('jumia_eg'),
        pingPlatformEndpoint('asin_sync')
      ]);
      setGatewayPings({
        amazon_eg: amz,
        noon_eg: noon,
        jumia_eg: jumia,
        asin_sync: asin
      });
      onShowToast('تم تحديث فحص سرعة استجابة بوابات الربط للمنصات المصرية 🟢');
    } catch {
      onShowToast('حدث خطأ أثناء فحص البوابات');
    } finally {
      setIsPinging(false);
    }
  };

  // Helper labels
  const getSeverityBadge = (severity: ApiErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
            حرج جداً (Critical) 🔥
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            مرتفع (High) ⚠️
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            متوسط (Medium) ⚡
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            منخفض (Low) ℹ️
          </span>
        );
    }
  };

  const getStatusBadge = (status: ApiErrorStatus) => {
    switch (status) {
      case 'unresolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            غير محلول 🔴
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            قيد الفحص والتحري 🟡
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            تم الحل بنجاح 🟢
          </span>
        );
      case 'ignored':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            تم التجاهل ⚪
          </span>
        );
    }
  };

  const getStatusLabel = (status: ApiErrorStatus) => {
    switch (status) {
      case 'unresolved': return 'غير محلول';
      case 'investigating': return 'قيد الفحص والتحري';
      case 'resolved': return 'تم الحل';
      case 'ignored': return 'تم التجاهل';
    }
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif] text-slate-900 pb-12" dir="rtl">
      
      {/* Top Hero Banner */}
      <div className="bg-linear-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-black flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                سجل تتبع أخطاء الربط الفوري (Error Logging System)
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                متصل بسحابة Firestore المباشرة
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-bold">
                لوحة تحكم المدير: {adminEmail}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>رقابة أعطال مزامنة واجهات المنصات (API Sync Monitor)</span>
            </h1>

            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              يقوم هذا النظام بالرصد الآلي لأي عطل أو رفض اتصال في واجهات <strong>أمازون مصر، نون، جوميا، والسيلر سنترال</strong> وحفظه لحظياً في قاعدة بيانات Firestore، مع إشعار لوحة المدير فوراً للتشخيص السريع وإعادة المحاولة.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
            {/* Direct Bulk Retry for all Unresolved */}
            {unresolvedErrors.length > 0 && (
              <button
                type="button"
                id="btn-hero-bulk-retry-unresolved"
                onClick={() => handleExecuteBulkRetry(unresolvedErrors)}
                disabled={isBulkRetrying || isBulkOperating}
                className={`h-10 px-4 rounded-xl text-xs font-black flex items-center gap-2 shadow-xl transition-all ${
                  isBulkRetrying 
                    ? 'bg-sky-600/80 text-white cursor-wait opacity-90 ring-2 ring-sky-400' 
                    : 'bg-linear-to-r from-sky-500 via-sky-400 to-sky-500 hover:from-sky-400 hover:to-sky-300 text-slate-950 shadow-sky-950/30 cursor-pointer active:scale-95'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
                title="إعادة تجربة جماعية لجميع الأخطاء المعلقة دفعة واحدة"
              >
                {isBulkRetrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span>جارٍ معالجة ({bulkProgress?.current || 0} من {bulkProgress?.total || unresolvedErrors.length})...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>إعادة تجربة جماعية للمُعلق ({unresolvedErrors.length}) ⚡</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              id="btn-ping-gateways"
              onClick={handlePingAllGateways}
              disabled={isPinging}
              className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="فحص زمن استجابة بوابات الربط"
            >
              <Activity className={`w-4 h-4 text-emerald-400 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'جارٍ الفحص...' : 'فحص سرعة البوابات'}</span>
            </button>

            <div className="relative group">
              <button
                type="button"
                id="btn-simulate-error-menu"
                disabled={isSimulating}
                className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-red-900/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>محاكاة خطأ اتصال (Test Log)</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 hidden group-hover:block transition-all">
                <div className="text-[11px] font-black text-slate-400 px-3 py-1.5 border-b border-slate-800 mb-1">
                  اختر سيناريو المحاكاة الفورية:
                </div>
                <button
                  type="button"
                  onClick={() => handleSimulate('amazon_timeout')}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span>أمازون مصر: انتهاء مهلة 504</span>
                  <span className="text-[10px] text-sky-400">Timeout</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulate('noon_rate_limit')}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span>نون مصر: تجاوز معدل الطلبات 429</span>
                  <span className="text-[10px] text-blue-400">Rate Limit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulate('jumia_auth_expired')}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span>جوميا: انتهاء صلاحية المفتاح 401</span>
                  <span className="text-[10px] text-red-400">Auth 401</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulate('seller_central_scrape_blocked')}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span>سيلر سنترال: تحدي الروبوت 403</span>
                  <span className="text-[10px] text-sky-300">WAF Block</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gateway Latency Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Object.entries(gatewayPings).map(([key, data]) => {
          const names: Record<string, string> = {
            amazon_eg: 'أمازون مصر SP-API',
            noon_eg: 'نون بارتنر مصر API',
            jumia_eg: 'جوميا سيلر سنتر API',
            asin_sync: 'محرك جلب ASIN المصري'
          };
          return (
            <div 
              key={key} 
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800">{names[key] || key}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                  {data.message}
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  {data.latencyMs} ms
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Stats Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">إجمالي سجلات الأخطاء المسجلة</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">محفوظة في Firestore</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-600">أعطال نشطة غير محلولة</div>
            <div className="text-2xl font-black text-rose-700 mt-1 flex items-center gap-2">
              <span>{stats.unresolved}</span>
              {stats.unresolved > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </div>
            <div className="text-[11px] text-rose-500 mt-0.5">تتطلب تدخل فوري</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-sky-700">أعطال حرجة ومرتفعة</div>
            <div className="text-2xl font-black text-sky-800 mt-1">{stats.critical}</div>
            <div className="text-[11px] text-sky-600 mt-0.5">تؤثر على مزامنة الأسعار</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-700">تم معالجتها وحلها</div>
            <div className="text-2xl font-black text-emerald-800 mt-1">{stats.resolved}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">استعادت المزامنة الطبيعية</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="input-search-errors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برمز الخطأ (مثلاً 504، 429)، أو اسم المنصة، أو البريد الإلكتروني للتاجر..."
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* Platform Filter Dropdown */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0 bg-indigo-50/70 p-1 rounded-2xl border border-indigo-200/80 shadow-2xs">
              <label htmlFor="dropdown-platform-filter" className="text-xs font-black text-indigo-950 flex items-center gap-1.5 px-1.5 cursor-pointer">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>المنصة (Platform):</span>
              </label>
              <select
                id="dropdown-platform-filter"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white border border-indigo-200 text-xs font-black text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs hover:border-indigo-400 transition-all"
                title="تصفية وعرض الأخطاء الخاصة بمنصة محددة لتسهيل التتبع (مثل أمازون أو نون)"
              >
                <option value="all">🌐 كافة المنصات ({platformCounts.all})</option>
                <option value="amazon_eg">🛒 أمازون مصر (Amazon.eg) ({platformCounts.amazon_eg || 0})</option>
                <option value="noon_eg">🟡 نون مصر (Noon.com) ({platformCounts.noon_eg || 0})</option>
                <option value="jumia_eg">🟠 جوميا مصر (Jumia Egypt) ({platformCounts.jumia_eg || 0})</option>
                <option value="seller_central">🏢 بوابة البائع المركزية (Seller Central) ({platformCounts.seller_central || 0})</option>
                <option value="asin_sync">📦 جالب واستيراد ASIN (ASIN Sync) ({platformCounts.asin_sync || 0})</option>
                <option value="price_scraper">🏷️ راصد ومقارن الأسعار (Price Scraper) ({platformCounts.price_scraper || 0})</option>
                <option value="custom_api">🔌 واجهات مخصصة (Custom API) ({platformCounts.custom_api || 0})</option>
              </select>
            </div>

            {/* Error Type Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-sky-500" />
                نوع الخطأ:
              </span>
              <select
                id="dropdown-error-type-filter"
                value={errorTypeFilter}
                onChange={(e) => setErrorTypeFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer hover:bg-slate-100/80 transition-colors"
                title="تصفية حسب نوع الخطأ البرمجي / استجابة الـ HTTP"
              >
                <option value="all">كافة أنواع الأخطاء ({errorTypeCounts.all})</option>
                <option value="timeout">انقطاع وخوادم 504/5xx ({errorTypeCounts.timeout})</option>
                <option value="rate_limit">تجاوز معدل الطلبات 429 ({errorTypeCounts.rate_limit})</option>
                <option value="auth">المصادقة والتوكن 401 ({errorTypeCounts.auth})</option>
                <option value="bot_block">كشف الروبوتات والحظر 403 ({errorTypeCounts.bot_block})</option>
                <option value="bad_request">بنية البيانات والمدخلات 400/422 ({errorTypeCounts.bad_request})</option>
                <option value="network">انقطاع الاتصال والشبكة ({errorTypeCounts.network})</option>
                <option value="other">أخطاء أخرى ({errorTypeCounts.other})</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer hover:bg-slate-100/80 transition-colors"
                title="تصفية حسب مستوى الخطورة"
              >
                <option value="all">كافة مستويات الخطورة</option>
                <option value="critical">حرج (Critical)</option>
                <option value="high">مرتفع (High)</option>
                <option value="medium">متوسط (Medium)</option>
                <option value="low">منخفض (Low)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer hover:bg-slate-100/80 transition-colors"
                title="تصفية حسب حالة المعالجة"
              >
                <option value="all">كافة الحالات</option>
                <option value="unresolved">غير محلول 🔴</option>
                <option value="investigating">قيد الفحص 🟡</option>
                <option value="resolved">تم الحل 🟢</option>
                <option value="ignored">تم التجاهل ⚪</option>
              </select>
            </div>

            {(platformFilter !== 'all' || errorTypeFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setPlatformFilter('all');
                  setErrorTypeFilter('all');
                  setSeverityFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="h-10 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer shrink-0"
              >
                إعادة ضبط الفلاتر ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Platform Filter Pills */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          <span className="text-[11px] font-black text-slate-500 shrink-0 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            المنصات السريعة:
          </span>
          <button
            type="button"
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              platformFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>كافة المنصات ({platformCounts.all})</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('amazon_eg')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              platformFilter === 'amazon_eg'
                ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-400'
                : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200/70'
            }`}
          >
            <span>🛒 أمازون مصر ({platformCounts.amazon_eg || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('noon_eg')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              platformFilter === 'noon_eg'
                ? 'bg-sky-500 text-slate-950 shadow-xs ring-2 ring-sky-400'
                : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200/70'
            }`}
          >
            <span>🟡 نون مصر ({platformCounts.noon_eg || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('jumia_eg')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              platformFilter === 'jumia_eg'
                ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-400'
                : 'bg-orange-50 text-orange-900 hover:bg-orange-100 border border-orange-200/70'
            }`}
          >
            <span>🟠 جوميا مصر ({platformCounts.jumia_eg || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('seller_central')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              platformFilter === 'seller_central'
                ? 'bg-slate-800 text-white shadow-xs ring-2 ring-slate-400'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>🏢 بوابة البائع ({platformCounts.seller_central || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('asin_sync')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              platformFilter === 'asin_sync'
                ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-400'
                : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200/70'
            }`}
          >
            <span>📦 جالب ASIN ({platformCounts.asin_sync || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('price_scraper')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              platformFilter === 'price_scraper'
                ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/70'
            }`}
          >
            <span>🏷️ راصد الأسعار ({platformCounts.price_scraper || 0})</span>
          </button>
        </div>

        {/* Quick Error Type Pills */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          <span className="text-[11px] font-black text-slate-400 shrink-0 flex items-center gap-1">
            <Tags className="w-3 h-3 text-slate-400" />
            أنواع شائعة:
          </span>
          <button
            type="button"
            onClick={() => setErrorTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              errorTypeFilter === 'all' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({errorTypeCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setErrorTypeFilter('timeout')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              errorTypeFilter === 'timeout' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            ⚡ انقطاع ومهلة 504 ({errorTypeCounts.timeout})
          </button>
          <button
            type="button"
            onClick={() => setErrorTypeFilter('rate_limit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              errorTypeFilter === 'rate_limit' 
                ? 'bg-sky-600 text-white shadow-xs' 
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/60'
            }`}
          >
            ⏳ تجاوز المعدل 429 ({errorTypeCounts.rate_limit})
          </button>
          <button
            type="button"
            onClick={() => setErrorTypeFilter('auth')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              errorTypeFilter === 'auth' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            🔑 المصادقة والتوكن 401 ({errorTypeCounts.auth})
          </button>
          <button
            type="button"
            onClick={() => setErrorTypeFilter('bot_block')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              errorTypeFilter === 'bot_block' 
                ? 'bg-red-700 text-white shadow-xs' 
                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200/60'
            }`}
          >
            🛡️ حظر الروبوتات 403 ({errorTypeCounts.bot_block})
          </button>
          <button
            type="button"
            onClick={() => setErrorTypeFilter('network')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              errorTypeFilter === 'network' 
                ? 'bg-sky-600 text-white shadow-xs' 
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/60'
            }`}
          >
            🌐 أخطاء الاتصال ({errorTypeCounts.network})
          </button>
        </div>
      </div>

      {/* Active Platform Tracking Banner */}
      {platformFilter !== 'all' && (
        <div className="p-3.5 bg-linear-to-r from-indigo-50 via-blue-50 to-sky-50 border border-indigo-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-indigo-950 flex items-center gap-2">
                <span>تتبع مخصص لمنصة: {PLATFORM_NAMES_MAP[platformFilter as ApiPlatformId] || platformFilter}</span>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {filteredErrors.length} أخطاء مرصودة
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                يتم الآن حصر نتائج المراقبة وعمليات الإعادة الجماعية والفحص الدوري لهذه المنصة تحديداً لتسهيل استكشاف وحل الأعطال.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-clear-platform-tracking"
            onClick={() => setPlatformFilter('all')}
            className="h-8 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="إلغاء وضع التتبع المخصص والعودة لكافة المنصات"
          >
            عرض كافة المنصات ✕
          </button>
        </div>
      )}

      {/* Bulk Operations Toolbar */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
        selectedIds.size > 0 
          ? 'bg-indigo-950 text-white border-indigo-700 shadow-xl shadow-indigo-950/20 animate-fadeIn' 
          : 'bg-slate-50 border-slate-200/80 text-slate-700'
      }`}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
              selectedIds.size > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              المحدد: {selectedIds.size} من {filteredErrors.length}
            </span>

            {selectedIds.size > 0 && (
              <span className="text-xs text-indigo-200 font-medium hidden sm:inline">
                (جاهز لتنفيذ إعادة التجربة أو الحل الجماعي)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Dedicated Primary "Select All" Option */}
            <button
              type="button"
              id="btn-select-all-primary"
              onClick={handleSelectAll}
              className={`h-8 px-3.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                filteredErrors.length > 0 && filteredErrors.every(e => selectedIds.has(e.id))
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : selectedIds.size > 0
                    ? 'bg-indigo-900 hover:bg-indigo-800 text-white border border-indigo-700'
                    : 'bg-white hover:bg-slate-100 text-indigo-900 border border-indigo-200'
              }`}
              title="تحديد كافة الأخطاء المعروضة حالياً وفق الفلاتر النشطة"
            >
              {filteredErrors.length > 0 && filteredErrors.every(e => selectedIds.has(e.id)) ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-white" />
                  <span>إلغاء تحديد الكل ({filteredErrors.length})</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-indigo-500" />
                  <span>تحديد الكل ({filteredErrors.length})</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-select-all-unresolved"
              onClick={handleSelectAllUnresolved}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedIds.size > 0 
                  ? 'bg-indigo-900 hover:bg-indigo-800 text-white border border-indigo-700' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
              }`}
              title="تحديد كل الأخطاء المعلقة ذات الحالة 'غير محلول'"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
              <span>تحديد كل المعلق ({unresolvedErrors.length})</span>
            </button>

            {selectedIds.size > 0 && (
              <button
                type="button"
                id="btn-clear-selection"
                onClick={handleClearSelection}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-900 transition-all cursor-pointer"
              >
                إلغاء التحديد
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* PRIMARY: Bulk Retry */}
          <button
            type="button"
            id="btn-execute-bulk-retry"
            onClick={() => handleExecuteBulkRetry()}
            disabled={selectedIds.size === 0 || isBulkRetrying || isBulkOperating}
            className={`h-9 px-4 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
              isBulkRetrying 
                ? 'bg-sky-500/80 text-slate-950 cursor-wait opacity-90 ring-2 ring-sky-400' 
                : selectedIds.size > 0
                  ? 'bg-linear-to-r from-sky-500 via-sky-400 to-sky-500 hover:from-sky-400 hover:to-sky-300 text-slate-950 shadow-lg shadow-sky-950/30 cursor-pointer active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="إعادة تشغيل مزامنة API للأخطاء المحددة دفعة واحدة"
          >
            {isBulkRetrying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950 shrink-0" />
                <span>جارٍ المعالجة ({bulkProgress?.current || 0} من {bulkProgress?.total || selectedIds.size})...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تجربة جماعية ({selectedIds.size}) 🔄⚡</span>
              </>
            )}
          </button>

          {/* Bulk Mark Resolved */}
          <button
            type="button"
            id="btn-bulk-mark-resolved"
            onClick={handleBulkMarkResolved}
            disabled={selectedIds.size === 0 || isBulkOperating}
            className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              selectedIds.size > 0 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' 
                : 'bg-slate-200 text-slate-500'
            }`}
            title="تأكيد حل السجلات المحددة في Firestore"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تأكيد الحل</span>
          </button>

          {/* Bulk Delete */}
          <button
            type="button"
            id="btn-bulk-delete-selected"
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0 || isBulkOperating}
            className={`h-9 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              selectedIds.size > 0 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md' 
                : 'bg-slate-200 text-slate-500'
            }`}
            title="حذف السجلات المحددة من قاعدة البيانات نهائياً"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>
        </div>
      </div>

      {/* Errors Table / List View */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="text-xs font-black text-slate-900">سجل استثناءات المزامنة اللحظي</span>
            <span className="text-xs text-slate-500 font-medium">({filteredErrors.length} سجل معروض)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              مزامنة فورية OnSnapshot
            </span>
          </div>
        </div>

        {filteredErrors.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800">
              {platformFilter !== 'all' 
                ? `لا توجد أخطاء مزامنة لمنصة "${PLATFORM_NAMES_MAP[platformFilter as ApiPlatformId] || platformFilter}"` 
                : 'لا توجد أخطاء مزامنة مطابقة للمحددات حالياً'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {platformFilter !== 'all'
                ? 'واجهة الربط والـ API لهذه المنصة تعمل بكفاءة تامة دون أي أعطال أو حظر مسجل في النظام 🟢'
                : 'واجهات برمجة التطبيقات للمنصات المصرية متصلة وتعمل بكفاءة، أو يمكنك الضغط على زر "محاكاة خطأ اتصال" بالأعلى لاختبار تدفق التسجيل والإشعار الفوري.'}
            </p>
            {platformFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className="mt-2 h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                <span>العودة لكافة المنصات</span>
                <Globe className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      id="checkbox-table-head-select-all"
                      checked={filteredErrors.length > 0 && filteredErrors.every(e => selectedIds.has(e.id))}
                      onChange={handleSelectAllFiltered}
                      className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 align-middle"
                      title="تحديد أو إلغاء تحديد كافة المعروض"
                    />
                  </th>
                  <th className="py-3.5 px-4">المنصة ونقطة الاتصال</th>
                  <th className="py-3.5 px-4">رمز ورسالة الخطأ</th>
                  <th className="py-3.5 px-4">الخطورة</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">حساب التاجر والوقت</th>
                  <th className="py-3.5 px-4 text-center">إجراءات المراقبة والحل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredErrors.map((item, errIdx) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr 
                      key={`${item.id || 'err'}_${errIdx}`} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected 
                          ? 'bg-indigo-50/90 ring-1 ring-inset ring-indigo-300' 
                          : item.status === 'unresolved' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3.5 px-3 align-top text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          id={`checkbox-error-${item.id}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(item.id)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 mt-1"
                          title="تحديد هذا الخطأ للمزامنة الجماعية"
                        />
                      </td>

                      {/* Platform & Endpoint */}
                      <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>{item.platformName}</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 text-ltr truncate max-w-[200px]" title={item.endpoint}>
                          {item.endpoint}
                        </div>
                      </div>
                    </td>

                    {/* Error Code & Message */}
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="space-y-1">
                        <span className="inline-block font-mono text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-800 text-white">
                          {item.errorCode}
                        </span>
                        <div className="text-xs text-slate-700 font-medium leading-snug line-clamp-2">
                          {item.errorMessage}
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4 align-top">
                      {getSeverityBadge(item.severity)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        {getStatusBadge(item.status)}
                        {item.resolvedBy && (
                          <div className="text-[10px] text-slate-400">
                            بواسطة: {item.resolvedBy}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Merchant & Timestamp */}
                    <td className="py-3.5 px-4 align-top text-slate-500">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-800 truncate max-w-[140px]" title={item.userEmail}>
                          {item.userEmail || 'تاجر مجهول'}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Retry Button with Bulk Loading State Handling */}
                        <button
                          type="button"
                          id={`btn-retry-error-${item.id}`}
                          onClick={() => handleRetry(item)}
                          disabled={isBulkRetrying || retryingId === item.id}
                          className={`h-8 px-2.5 rounded-lg font-bold border transition-all flex items-center gap-1 ${
                            isBulkRetrying
                              ? bulkProgress?.currentItem?.id === item.id
                                ? 'bg-sky-100 text-sky-800 border-sky-300 cursor-wait ring-2 ring-sky-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 cursor-pointer disabled:opacity-50'
                          }`}
                          title={
                            isBulkRetrying 
                              ? 'عملية إعادة التجربة الجماعية جارية حالياً...' 
                              : 'إعادة محاولة المزامنة الفورية مع المنصة'
                          }
                        >
                          {isBulkRetrying ? (
                            bulkProgress?.currentItem?.id === item.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700 shrink-0" />
                                <span className="text-[11px]">جارٍ الاتصال...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                <span className="text-[11px]">معلق...</span>
                              </>
                            )
                          ) : (
                            <>
                              <RefreshCw className={`w-3.5 h-3.5 ${retryingId === item.id ? 'animate-spin' : ''}`} />
                              <span>{retryingId === item.id ? 'جارٍ الفحص...' : 'إعادة المحاولة'}</span>
                            </>
                          )}
                        </button>

                        {/* View Diagnostic Details */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedError(item);
                            setAdminNoteInput(item.resolutionNotes || '');
                          }}
                          className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                          title="عرض التقرير التشخيصي الفني"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>تفاصيل</span>
                        </button>

                        {/* Quick Mark Resolved */}
                        {item.status !== 'resolved' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, 'resolved', 'تم الحل يدوياً من لوحة تحكم المدير')}
                            className="h-8 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                            title="تأكيد معالجة العطل"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>حل</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, 'unresolved')}
                            className="h-8 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-200 transition-all flex items-center gap-1 cursor-pointer"
                            title="إعادة فتح العطل"
                          >
                            <span>إعادة فتح</span>
                          </button>
                        )}

                        {/* Copy Diagnostic Report */}
                        <button
                          type="button"
                          onClick={() => handleCopyReport(item)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border border-slate-200"
                          title="نسخ تقرير العطل الفني"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer border border-rose-200"
                          title="حذف من السجل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diagnostic Modal for Selected Error */}
      {selectedError && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-black">تشخيص تفصيلي لخطأ مزامنة API</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedError.id} • {selectedError.platformName}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedError(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-slate-400 text-[10px]">المنصة</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedError.platformName}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">مستوى الخطورة</div>
                  <div className="mt-0.5">{getSeverityBadge(selectedError.severity)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">الحالة الحالية</div>
                  <div className="mt-0.5">{getStatusBadge(selectedError.status)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">تاريخ التسجيل</div>
                  <div className="font-medium text-slate-700 mt-0.5">
                    {new Date(selectedError.createdAt).toLocaleString('ar-EG')}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-bold mb-1">نقطة النهاية المستهدفة (Endpoint):</div>
                <div className="font-mono text-xs bg-slate-900 text-emerald-400 p-2.5 rounded-xl text-ltr break-all">
                  {selectedError.endpoint}
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-bold mb-1">رسالة الخطأ الرسمية:</div>
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl font-bold leading-relaxed">
                  {selectedError.errorMessage}
                </div>
              </div>

              {selectedError.errorDetails && (
                <div>
                  <div className="text-slate-500 font-bold mb-1">حمولة الاستجابة الفنية (Technical Payload):</div>
                  <pre className="font-mono text-[11px] bg-slate-950 text-slate-200 p-3.5 rounded-xl overflow-x-auto text-ltr border border-slate-800 max-h-48 leading-relaxed">
                    {selectedError.errorDetails}
                  </pre>
                </div>
              )}

              {/* Admin Notes Section */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="text-slate-700 font-bold block">
                  ملاحظات المدير وإجراءات الحل (Admin Resolution Notes):
                </label>
                <textarea
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="اكتب ملاحظاتك بشأن سبب العطل (مثال: تم التواصل مع دعم البائع وتحديث التوكن، أو تم حل مشكلة المهلة)..."
                  className="w-full h-20 p-3 rounded-xl border border-slate-300 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyReport(selectedError)}
                  className="h-9 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ التقرير</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRetry(selectedError)}
                  disabled={retryingId === selectedError.id}
                  className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${retryingId === selectedError.id ? 'animate-spin' : ''}`} />
                  <span>إعادة المحاولة الآن</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedError.id, 'investigating', adminNoteInput)}
                  className="h-9 px-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold cursor-pointer"
                >
                  قيد الفحص 🟡
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedError.id, 'resolved', adminNoteInput || 'تم الحل بواسطة المدير')}
                  className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-md"
                >
                  تأكيد الحل وحفظ الملاحظات 🟢
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Retrying Progress Overlay Modal */}
      {isBulkRetrying && bulkProgress && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-5 animate-fadeIn text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw className="w-7 h-7 animate-spin text-sky-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                جارٍ تنفيذ إعادة التجربة الجماعية لـ API...
              </h3>
              <p className="text-xs text-slate-500">
                إعادة الاتصال بالمنصات المحددة وتحديث السجلات في Firestore
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>المعالجة: {bulkProgress.current} من {bulkProgress.total}</span>
                <span>{Math.round((bulkProgress.current / Math.max(1, bulkProgress.total)) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                <div 
                  className="h-full bg-linear-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${(bulkProgress.current / Math.max(1, bulkProgress.total)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Item detail */}
            {bulkProgress.currentItem && (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1 text-right">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                  <span>المنصة الحالية: {bulkProgress.currentItem.platformName}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 truncate text-ltr">
                  {bulkProgress.currentItem.endpoint}
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400">
              يرجى الانتظار، تتم إعادة المزامنة بمعدل آمن لتجنب حظر الطلبات (Rate Limits)...
            </div>
          </div>
        </div>
      )}

      {/* Bulk Retry Results Summary Modal */}
      {bulkResultsSummary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                  <CheckCheck className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-black">نتيجة إعادة التجربة الجماعية لـ API</h3>
                  <div className="text-[11px] text-slate-400">
                    تمت معالجة {bulkResultsSummary.total} أخطاء مزامنة سحابياً
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBulkResultsSummary(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">إجمالي المفحوص</div>
                  <div className="text-xl font-black text-slate-800 mt-0.5">{bulkResultsSummary.total}</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="text-[11px] text-emerald-700 font-bold">تم التعافي بنجاح 🟢</div>
                  <div className="text-xl font-black text-emerald-800 mt-0.5">{bulkResultsSummary.successful}</div>
                </div>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                  <div className="text-[11px] text-rose-700 font-bold">ما زال معطلاً 🔴</div>
                  <div className="text-xl font-black text-rose-800 mt-0.5">{bulkResultsSummary.failed}</div>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-700">تفاصيل نتائج كل واجهة:</div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {bulkResultsSummary.results.map((res, idx) => (
                    <div 
                      key={res.id || idx}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                        res.success 
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {res.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>{res.item.platformName}</span>
                            <span className="font-mono text-[10px] text-slate-500">({res.item.errorCode})</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {res.message}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        res.success 
                          ? 'bg-emerald-200/80 text-emerald-800' 
                          : 'bg-rose-200/80 text-rose-800'
                      }`}>
                        {res.success ? 'تم التعافي' : 'فشل الربط'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {bulkResultsSummary.failed > 0 && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>تنبيه الإدارة:</strong> الأخطاء التي لم تتعافَ تلقائياً ترجع غالباً لمفاتيح API منتهية الصلاحية (401 Unauthorized) أو حظر كشف الروبوتات (403 Bot Detection) وتتطلب تحديث بيانات الاعتماد يدوياً.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                تم تحديث كافة السجلات في قاعدة بيانات Firestore مباشرة
              </span>
              <button
                type="button"
                id="btn-dismiss-bulk-results-summary"
                onClick={() => setBulkResultsSummary(null)}
                className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
