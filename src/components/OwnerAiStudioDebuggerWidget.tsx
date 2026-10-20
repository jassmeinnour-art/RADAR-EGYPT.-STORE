import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  X,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Terminal,
  Database,
  Activity,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Sparkles,
  Code2,
  ServerCrash,
  Layers,
  PlusCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Globe,
  KeyRound,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { firebaseConfig } from '../lib/firebase';
import { ApiSyncErrorItem, ConnectedMerchantPlatform, ProductData } from '../types';
import {
  OwnerDebugLogEntry,
  subscribeToOwnerDebugLogs,
  recordOwnerDebugLog,
  deleteOwnerDebugLog,
  clearAllOwnerDebugLogs,
  installOwnerDiagnosticsInterceptors,
  updateOwnerDiagnosticsRuntimeContext,
  generateAiStudioDebugPrompt,
  inferAffectedComponentFromStackOrTab,
} from '../services/ownerDebugLogsService';

interface OwnerAiStudioDebuggerWidgetProps {
  activeTab: string;
  activeTabLabel?: string;
  currentProduct: ProductData | null;
  connectedPlatforms: ConnectedMerchantPlatform[];
  unresolvedSyncErrors: ApiSyncErrorItem[];
  activeMerchantId: string;
  activeMerchantName?: string;
  onShowToast?: (msg: string) => void;
}

export const OwnerAiStudioDebuggerWidget: React.FC<OwnerAiStudioDebuggerWidgetProps> = ({
  activeTab,
  activeTabLabel,
  currentProduct,
  connectedPlatforms = [],
  unresolvedSyncErrors = [],
  activeMerchantId = 'merchant-step-queen',
  activeMerchantName = 'Step QUeen',
  onShowToast,
}) => {
  const { user, profile, isDbConnected, isOwner } = useAuth();

  // Strict Owner verification: must match jassmeinnour@gmail.com
  const verifiedOwnerEmail = useMemo(() => {
    const uEmail = user?.email?.trim().toLowerCase() || '';
    const pEmail = profile?.email?.trim().toLowerCase() || '';
    return isOwner && (uEmail === OWNER_EMAIL || pEmail === OWNER_EMAIL);
  }, [isOwner, user?.email, profile?.email]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<OwnerDebugLogEntry[]>([]);
  const [activeDiagnosticView, setActiveDiagnosticView] = useState<
    'all' | 'console' | 'api_failures' | 'app_state' | 'prompt_preview'
  >('all');
  const [selectedLogForReport, setSelectedLogForReport] = useState<OwnerDebugLogEntry | null>(null);
  const [customOwnerNote, setCustomOwnerNote] = useState<string>('');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedLinkKey, setCopiedLinkKey] = useState<string | null>(null);
  const [isRecordingSnapshot, setIsRecordingSnapshot] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Keep runtime diagnostics context synced with current application state
  useEffect(() => {
    if (!verifiedOwnerEmail) return;

    const activeCount = connectedPlatforms.filter((p) => p.isConnected).length;
    const errPlatCount = connectedPlatforms.filter(
      (p) => p.hasSyncError || p.status === 'error' || p.status === 'disconnected' || p.syncError
    ).length;

    updateOwnerDiagnosticsRuntimeContext({
      activeTab,
      activeTabLabel,
      currentProductTitle: currentProduct?.title,
      currentProductId: currentProduct?.id,
      activeMerchantId,
      activeMerchantName,
      connectedPlatformsCount: activeCount,
      totalPlatformsCount: connectedPlatforms.length,
      errorPlatformsCount: errPlatCount,
      unresolvedApiErrorsCount: unresolvedSyncErrors.length,
      isDbConnected,
      userEmail: OWNER_EMAIL,
      userUid: user?.uid || profile?.uid || 'owner_uid',
    });
  }, [
    verifiedOwnerEmail,
    activeTab,
    activeTabLabel,
    currentProduct?.id,
    currentProduct?.title,
    connectedPlatforms.length,
    unresolvedSyncErrors.length,
    activeMerchantId,
    activeMerchantName,
    isDbConnected,
    user?.uid,
    profile?.uid,
  ]);

  // Install global console/fetch/error interceptors & subscribe to Firestore `owner_debug_logs`
  useEffect(() => {
    if (!verifiedOwnerEmail) return;

    try {
      installOwnerDiagnosticsInterceptors();
    } catch {
      // Safely ignore interceptor initialization errors in strict iframe environments
    }

    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = subscribeToOwnerDebugLogs((logs) => {
        setDebugLogs(logs);
      });
    } catch {
      unsubscribe = null;
    }

    return () => {
      try {
        if (unsubscribe) unsubscribe();
      } catch {
        // ignore cleanup errors
      }
    };
  }, [verifiedOwnerEmail]);

  // Combine Firestore/local owner debug logs + live unresolved API sync errors
  const consoleErrorsList = useMemo(() => {
    return debugLogs.filter(
      (l) =>
        l.logType === 'console_error' ||
        l.logType === 'console_warn' ||
        l.logType === 'runtime_exception' ||
        l.logType === 'unhandled_rejection'
    );
  }, [debugLogs]);

  const apiFailuresList = useMemo(() => {
    const fromLogs = debugLogs.filter((l) => l.logType === 'api_failure');
    const mappedSyncErrors: OwnerDebugLogEntry[] = unresolvedSyncErrors.map((err, idx) => ({
      id: `sync_${err.id || idx}_${idx}`,
      ownerEmail: OWNER_EMAIL,
      logType: 'api_failure',
      severity: err.severity === 'critical' ? 'critical' : 'high',
      message: `[${err.platformName}] ${err.errorCode}: ${err.errorMessage}`,
      stackOrDetails: err.errorDetails || `Endpoint: ${err.endpoint}`,
      affectedComponent: 'src/services/apiErrorLoggingService.ts',
      activeTab,
      createdAt: err.createdAt,
    }));

    const map = new Map<string, OwnerDebugLogEntry>();
    fromLogs.forEach((item) => map.set(item.id, item));
    mappedSyncErrors.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [debugLogs, unresolvedSyncErrors, activeTab]);

  const totalAlertsBadgeCount = consoleErrorsList.length + apiFailuresList.length;

  // Current Application State Snapshot object
  const currentAppStateDump = useMemo(() => {
    const activePlatforms = connectedPlatforms.filter((p) => p.isConnected);
    const errorPlatforms = connectedPlatforms.filter(
      (p) => p.hasSyncError || p.status === 'error' || p.status === 'disconnected' || p.syncError
    );

    return {
      ownerAccount: {
        email: OWNER_EMAIL,
        uid: user?.uid || profile?.uid || 'owner_session',
        verifiedAccess: true,
        firestoreCollection: 'owner_debug_logs',
      },
      navigationAndComponent: {
        activeTab,
        activeTabLabel: activeTabLabel || activeTab,
        affectedCodeFile: inferAffectedComponentFromStackOrTab(undefined, activeTab),
      },
      activeProductState: currentProduct
        ? {
            id: currentProduct.id,
            title: currentProduct.title,
            sku: currentProduct.sku,
            currentLowestPrice: currentProduct.currentLowestPrice,
            suggestedRetailPrice: currentProduct.suggestedRetailPrice,
            estimatedWholesaleCost: currentProduct.estimatedWholesaleCost,
          }
        : null,
      platformsAndSyncState: {
        activeMerchantId,
        activeMerchantName: activeMerchantName || 'المتجر الرئيسي',
        totalPlatforms: connectedPlatforms.length,
        connectedPlatformsCount: activePlatforms.length,
        platformsWithErrorsCount: errorPlatforms.length,
        errorPlatformNames: errorPlatforms.map((p) => p.name),
        unresolvedApiSyncErrorsCount: unresolvedSyncErrors.length,
      },
      environmentAndDatabase: {
        firestoreConnected: isDbConnected,
        firebaseProjectId: firebaseConfig.projectId,
        firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
        currentUrl: typeof window !== 'undefined' ? window.location.href : '',
        viewport:
          typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A',
        onlineStatus: typeof navigator !== 'undefined' ? navigator.onLine : true,
        timestamp: new Date().toISOString(),
      },
    };
  }, [
    user?.uid,
    profile?.uid,
    activeTab,
    activeTabLabel,
    currentProduct,
    activeMerchantId,
    activeMerchantName,
    connectedPlatforms,
    unresolvedSyncErrors.length,
    isDbConnected,
  ]);

  // Generated AI Studio Ready-to-Copy Prompt
  const generatedAiStudioReportText = useMemo(() => {
    return generateAiStudioDebugPrompt({
      logs: [...debugLogs, ...apiFailuresList.filter((a) => a.id.startsWith('sync_'))],
      apiErrorsCount: unresolvedSyncErrors.length,
      selectedLog: selectedLogForReport,
      customOwnerNote: customOwnerNote.trim() || undefined,
    });
  }, [debugLogs, apiFailuresList, unresolvedSyncErrors.length, selectedLogForReport, customOwnerNote]);

  // STRICT DOM ACCESS CONTROL: Completely remove from DOM tree for any non-owner user or merchant
  if (!verifiedOwnerEmail) {
    return null;
  }

  // One-Click Integration URLs
  const GITHUB_REPO_URL = 'https://github.com/jassmeinnour-art/Merchant-Radar-Egypt-is-published';
  const VERCEL_DASHBOARD_URL = 'https://vercel.com/dashboard';
  const FIREBASE_FIRESTORE_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`;
  const FIREBASE_AUTH_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`;

  const handleCopyAiStudioReport = async () => {
    try {
      await navigator.clipboard.writeText(generatedAiStudioReportText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
      onShowToast?.(
        'تم نسخ تقرير الخطأ والكود المتأثر وحالة التطبيق! الصقه مباشرة في Google AI Studio لتوليد الحل فوراً 🛠️✨'
      );

      // Also persist this diagnostic snapshot to Firestore `owner_debug_logs` with structured JSON details (no recursive markdown nesting)
      await recordOwnerDebugLog({
        logType: 'state_snapshot',
        severity: 'info',
        message: customOwnerNote.trim()
          ? `نسخ تقرير تشخيص لـ AI Studio: ${customOwnerNote.trim()}`
          : `نسخ تقرير الخطأ لـ AI Studio من شاشة (${activeTabLabel || activeTab})`,
        stackOrDetails: JSON.stringify(
          {
            capturedConsoleErrors: consoleErrorsList.length,
            capturedApiFailures: apiFailuresList.length,
            activeComponent: inferAffectedComponentFromStackOrTab(undefined, activeTab),
            activeProductId: currentProduct?.id || 'N/A',
            activeProductTitle: currentProduct?.title || 'N/A',
            activeMerchantId,
            activeMerchantName,
          },
          null,
          2
        ),
        affectedComponent: inferAffectedComponentFromStackOrTab(undefined, activeTab),
        activeTab,
        appStateSnapshot: JSON.stringify(currentAppStateDump, null, 2),
      });
    } catch {
      onShowToast?.('تعذر النسخ التلقائي — يمكنك تحديد النص من تبويب معاينة التقرير ونسخه يدوياً');
    }
  };

  const handleCaptureLiveDiagnosticToFirestore = async () => {
    setIsRecordingSnapshot(true);
    try {
      await recordOwnerDebugLog({
        logType: 'manual_diagnostic',
        severity: totalAlertsBadgeCount > 0 ? 'high' : 'info',
        message:
          customOwnerNote.trim() ||
          `فحص تشخيصي فوري لحالة التطبيق والشاشة النشطة (${activeTabLabel || activeTab}) — محفوظ في owner_debug_logs`,
        stackOrDetails: JSON.stringify(
          {
            capturedConsoleErrors: consoleErrorsList.length,
            capturedApiFailures: apiFailuresList.length,
            activeComponent: inferAffectedComponentFromStackOrTab(undefined, activeTab),
          },
          null,
          2
        ),
        affectedComponent: inferAffectedComponentFromStackOrTab(undefined, activeTab),
        activeTab,
        appStateSnapshot: JSON.stringify(currentAppStateDump, null, 2),
      });
      onShowToast?.(
        'تم التقاط وحفظ سجل التشخيص اللحظي في كولكشن owner_debug_logs بـ Firebase Firestore بنجاح ☁️✅'
      );
    } finally {
      setIsRecordingSnapshot(false);
    }
  };

  const handleCopyQuickUrl = (key: string, url: string, label: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedLinkKey(key);
    setTimeout(() => setCopiedLinkKey(null), 2000);
    onShowToast?.(`تم نسخ رابط ${label} إلى الحافظة 🔗`);
  };

  return (
    <>
      {/* Owner Exclusive Floating Widget Button at Bottom-Left (Stacked cleanly above AI Merchant Chatbox & Mobile Dock) */}
      <div
        id="owner-ai-studio-debugger-widget"
        className="fixed bottom-36 left-3.5 sm:bottom-20 sm:left-6 z-40 shadow-xl border border-sky-500/35 backdrop-blur-md rounded-xl bg-[#08090D]/95 flex items-center font-['Cairo',sans-serif]"
        dir="rtl"
      >
        <button
          type="button"
          id="btn-owner-ai-studio-floating-widget"
          onClick={() => setIsOpen(true)}
          className="group relative h-10 px-3.5 rounded-xl bg-gradient-to-r from-slate-900/95 via-slate-900 to-sky-950/40 hover:from-slate-800 hover:to-sky-900/50 text-white font-black text-xs whitespace-nowrap flex items-center gap-2 justify-center transition-all duration-200 cursor-pointer active:scale-95"
          title="حصري لمالكة التطبيق (jassmeinnour@gmail.com): فتح نافذة التشخيص الفوري ومناقشة Google AI Studio وسجلات owner_debug_logs"
        >
          <span className="relative flex items-center justify-center w-6 h-6 rounded-md bg-sky-500/20 border border-sky-400/40 text-sky-300 shrink-0">
            <Wrench className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950 animate-pulse" />
          </span>

          <span className="font-['Alexandria'] font-black text-sky-300 text-xs whitespace-nowrap flex items-center gap-1.5 justify-center">
            <span>مناقشة Google AI Studio 🛠️</span>
          </span>

          {totalAlertsBadgeCount > 0 && (
            <span
              id="owner-debugger-badge-count"
              className="relative px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[10px] font-black border border-rose-300 shadow-sm animate-pulse whitespace-nowrap"
              title={`${totalAlertsBadgeCount} أخطاء أو استجابات فاشلة مرصودة جاهزة للنسخ`}
            >
              {totalAlertsBadgeCount}
            </span>
          )}
        </button>
      </div>

      {/* Owner Diagnostics & AI Studio Assistant Modal */}
      {isOpen && (
        <div
          id="modal-owner-ai-studio-debugger"
          className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Cairo',sans-serif] animate-fadeIn"
          dir="rtl"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-l from-slate-950 via-indigo-950/90 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-inner shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                      مناقشة Google AI Studio 🛠️ — مركز التشخيص والدعم الفني للأونر
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-black flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-sky-400" />
                      <span>وصول حصري للمالكة</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                    <span className="font-mono text-emerald-300 font-bold" dir="ltr">
                      {OWNER_EMAIL}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-indigo-300">
                      <Database className="w-3 h-3" />
                      <span>كولكشن Firestore:</span>
                      <code className="bg-slate-950 px-1.5 py-0.2 rounded text-sky-300 font-mono text-[10px]">
                        owner_debug_logs
                      </code>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-owner-capture-live-snapshot"
                  onClick={handleCaptureLiveDiagnosticToFirestore}
                  disabled={isRecordingSnapshot}
                  className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  title="التقاط حالة التطبيق الحالية وحفظها فوراً في كولكشن owner_debug_logs في Firestore"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRecordingSnapshot ? 'animate-spin' : ''}`} />
                  <span>حفظ لقطة تشخيص بـ Firestore</span>
                </button>

                <button
                  type="button"
                  id="btn-close-owner-debugger-modal"
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="إغلاق النافذة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* SECTION 1: One-Click Integration Links (روابط الربط السريع) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2 font-['Alexandria']">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>روابط الربط السريع للمشروع (One-Click Integration Links)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    وصول مباشر لمستودع الكود وسجلات البناء وقاعدة البيانات
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Link 1: GitHub Repository */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
                          <Code2 className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">مستودع المشروع على GitHub</div>
                          <div
                            className="text-[10px] font-mono text-indigo-300 truncate max-w-[190px]"
                            dir="ltr"
                            title="github.com/jassmeinnour-art/Merchant-Radar-Egypt-is-published"
                          >
                            github.com/jassmeinnour-art/Merchant-Radar-Egypt-is-published
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyQuickUrl('github', GITHUB_REPO_URL, 'مستودع GitHub')
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="نسخ رابط GitHub"
                      >
                        {copiedLinkKey === 'github' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <a
                      id="link-owner-github-repo"
                      href={GITHUB_REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>فتح مستودع GitHub مباشرة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Link 2: Vercel Dashboard & Deployment Logs */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
                          <Activity className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">
                            لوحة البناء والـ Deployment في Vercel
                          </div>
                          <div className="text-[10px] text-slate-400">
                            متابعة Build & Deployment Logs اللحظية
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyQuickUrl('vercel', VERCEL_DASHBOARD_URL, 'Vercel Dashboard')
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="نسخ رابط Vercel Dashboard"
                      >
                        {copiedLinkKey === 'vercel' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <a
                      id="link-owner-vercel-dashboard"
                      href={VERCEL_DASHBOARD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>فتح Vercel Deployment Logs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Link 3: Firebase Console (Firestore & Auth) */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
                          <Database className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">
                            وحدة تحكم Firebase Console
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            {firebaseConfig.projectId} (Firestore & Auth)
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyQuickUrl(
                            'firebase',
                            FIREBASE_FIRESTORE_CONSOLE_URL,
                            'Firebase Console'
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="نسخ رابط Firebase Console"
                      >
                        {copiedLinkKey === 'firebase' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <a
                        id="link-owner-firebase-firestore"
                        href={FIREBASE_FIRESTORE_CONSOLE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-black flex items-center justify-center gap-1 transition-colors"
                      >
                        <Database className="w-3 h-3" />
                        <span>قواعد البيانات</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        id="link-owner-firebase-auth"
                        href={FIREBASE_AUTH_CONSOLE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-[11px] font-black flex items-center justify-center gap-1 transition-colors"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Firebase Auth</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Primary Action Bar — Copy Error Report for AI Studio */}
              <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-sky-950/40 border border-indigo-500/40 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <h3 className="text-sm font-black text-white font-['Alexandria']">
                        توليد ونسخ تقرير التشخيص الفوري لـ Google AI Studio
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300">
                      يجمع تلقائياً أحدث أخطاء الـ Console، الاستجابات الفاشلة من الـ APIs، اسم المكون المتأثر (
                      <code className="text-sky-300 font-mono text-[11px]">
                        {inferAffectedComponentFromStackOrTab(undefined, activeTab)}
                      </code>
                      )، وحالة التطبيق لإرسالها مباشرة لـ Google AI Studio.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="btn-copy-error-report-for-ai-studio"
                    onClick={handleCopyAiStudioReport}
                    className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 shrink-0 ${
                      copiedReport
                        ? 'bg-emerald-600 text-white border border-emerald-400'
                        : 'bg-gradient-to-r from-sky-500 via-sky-400 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 border border-sky-200'
                    }`}
                  >
                    {copiedReport ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>تم نسخ تقرير الخطأ لـ AI Studio بنجاح! ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-950" />
                        <span>نسخ تقرير الخطأ لـ AI Studio</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Optional Owner Custom Note to include in AI Studio Prompt */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <input
                    type="text"
                    id="input-owner-ai-studio-custom-note"
                    value={customOwnerNote}
                    onChange={(e) => setCustomOwnerNote(e.target.value)}
                    placeholder="اختياري: اكتبي ملاحظة أو وصفاً للمشكلة ليتم تضمينه في التقرير المنسوخ لـ AI Studio..."
                    className="flex-1 bg-slate-950/90 border border-slate-700/80 focus:border-sky-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                  {selectedLogForReport && (
                    <button
                      type="button"
                      onClick={() => setSelectedLogForReport(null)}
                      className="px-3 py-2 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>إلغاء تخصيص الخطأ المحدد</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 3: Automatic Diagnostics Dump (منطقة تجميع الأخطاء التلقائي) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2 font-['Alexandria']">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span>منطقة تجميع الأخطاء التلقائي (Automatic Diagnostics Dump)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      مزامنة تلقائية فورية مع كولكشن{' '}
                      <code className="text-sky-300 font-mono">owner_debug_logs</code> في Firebase
                      Firestore
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveDiagnosticView('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeDiagnosticView === 'all'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      سجلات owner_debug_logs ({debugLogs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDiagnosticView('console')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeDiagnosticView === 'console'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      أخطاء Console ({consoleErrorsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDiagnosticView('api_failures')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeDiagnosticView === 'api_failures'
                          ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      استجابات API الفاشلة ({apiFailuresList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDiagnosticView('app_state')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeDiagnosticView === 'app_state'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      حالة التطبيق الحالية (State)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDiagnosticView('prompt_preview')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeDiagnosticView === 'prompt_preview'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      معاينة نص AI Studio 📋
                    </button>
                  </div>
                </div>

                {/* Diagnostic Content Area */}
                {activeDiagnosticView === 'app_state' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">الشاشة النشطة (Active Tab)</div>
                        <div className="text-xs font-black text-indigo-300 mt-0.5 truncate">
                          {activeTabLabel || activeTab}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">الكود / الملف المتأثر</div>
                        <div
                          className="text-xs font-mono font-bold text-sky-300 mt-0.5 truncate"
                          dir="ltr"
                        >
                          {inferAffectedComponentFromStackOrTab(undefined, activeTab)}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">حالة قاعدة بيانات Firestore</div>
                        <div className="text-xs font-black text-emerald-400 mt-0.5">
                          {isDbConnected ? 'متصلة ونشطة ✓' : 'وضع المزامنة المحلية'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">قنوات البيع المتصلة</div>
                        <div className="text-xs font-black text-white mt-0.5">
                          {connectedPlatforms.filter((p) => p.isConnected).length} /{' '}
                          {connectedPlatforms.length} منصة
                        </div>
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-72 text-left"
                      dir="ltr"
                    >
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(currentAppStateDump, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : activeDiagnosticView === 'prompt_preview' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>هذا هو النص الكامل الجاهز للنسخ والإرسال لـ Google AI Studio:</span>
                      <button
                        type="button"
                        onClick={handleCopyAiStudioReport}
                        className="text-sky-300 hover:text-sky-200 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ النص الآن</span>
                      </button>
                    </div>
                    <div
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-80 text-right leading-relaxed"
                      dir="rtl"
                    >
                      <pre className="whitespace-pre-wrap break-words font-['Cairo',monospace]">
                        {generatedAiStudioReportText}
                      </pre>
                    </div>
                  </div>
                ) : (
                  /* Logs List View (All / Console / API Failures) */
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {(() => {
                      const displayedLogs =
                        activeDiagnosticView === 'console'
                          ? consoleErrorsList
                          : activeDiagnosticView === 'api_failures'
                          ? apiFailuresList
                          : debugLogs;

                      if (displayedLogs.length === 0) {
                        return (
                          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-black text-white">
                                لا توجد أخطاء مسجلة في هذا القسم حالياً
                              </div>
                              <p className="text-xs text-slate-400 max-w-md mx-auto">
                                يتم التقاط أي أخطاء Console أو استجابات API فاشلة تلقائياً وحفظها في
                                كولكشن{' '}
                                <code className="text-sky-300 font-mono">owner_debug_logs</code>.
                                يمكنك أيضاً حفظ لقطة تشخيصية فورية لحالة التطبيق الحالية.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleCaptureLiveDiagnosticToFirestore}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>تسجيل لقطة تشخيصية الآن في owner_debug_logs</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                            <span>
                              إجمالي السجلات المعروضة: <strong>{displayedLogs.length}</strong> سجل
                              محفوظ في <code className="text-sky-300">owner_debug_logs</code>
                            </span>
                            {debugLogs.length > 0 && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await clearAllOwnerDebugLogs(debugLogs);
                                  onShowToast?.('تم مسح سجلات التشخيص من الكولكشن المحلي والسحابي');
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>مسح السجلات</span>
                              </button>
                            )}
                          </div>

                          {displayedLogs.map((logItem, logIndex) => {
                            const isSelected = selectedLogForReport?.id === logItem.id;
                            const isExpanded = expandedLogId === logItem.id;
                            return (
                              <div
                                key={`${logItem.id || 'dbg'}_${logIndex}`}
                                className={`p-3.5 rounded-2xl border transition-all ${
                                  isSelected
                                    ? 'bg-indigo-950/70 border-sky-400 ring-1 ring-sky-400/50'
                                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                          logItem.severity === 'critical' ||
                                          logItem.severity === 'high'
                                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                            : logItem.severity === 'medium'
                                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                        }`}
                                      >
                                        {logItem.logType}
                                      </span>
                                      {logItem.affectedComponent && (
                                        <span
                                          className="text-[10px] font-mono text-sky-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[260px]"
                                          dir="ltr"
                                        >
                                          {logItem.affectedComponent}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {new Date(logItem.createdAt).toLocaleTimeString('ar-EG')}
                                      </span>
                                    </div>

                                    <p
                                      className="text-xs font-bold text-slate-100 break-words leading-relaxed"
                                      dir="auto"
                                    >
                                      {logItem.message}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedLogForReport(isSelected ? null : logItem);
                                        onShowToast?.(
                                          isSelected
                                            ? 'تم إلغاء تحديد الخطأ'
                                            : 'تم تحديد هذا الخطأ لتضمينه في تقرير AI Studio 🛠️'
                                        );
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                                        isSelected
                                          ? 'bg-sky-400 text-slate-950'
                                          : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700'
                                      }`}
                                    >
                                      {isSelected ? 'محدد للتقرير ✓' : 'تحديد لـ AI Studio'}
                                    </button>

                                    {logItem.stackOrDetails && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedLogId(isExpanded ? null : logItem.id)
                                        }
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                        title="عرض التفاصيل التقنية / Stack Trace"
                                      >
                                        {isExpanded ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    )}

                                    {!logItem.id.startsWith('sync_') && (
                                      <button
                                        type="button"
                                        onClick={() => deleteOwnerDebugLog(logItem.id)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/80 text-slate-400 hover:text-rose-200 cursor-pointer"
                                        title="حذف السجل من owner_debug_logs"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {isExpanded && logItem.stackOrDetails && (
                                  <div
                                    className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10.5px] text-slate-300 overflow-x-auto max-h-44 text-left"
                                    dir="ltr"
                                  >
                                    <pre className="whitespace-pre-wrap break-words">
                                      {logItem.stackOrDetails}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  محمي بقواعد التحقق الحصري للمالكة (Owner Access Control) — مخفي تماماً من الـ DOM لأي
                  تاجر آخر
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAiStudioReport}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ تقرير الخطأ لـ AI Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
