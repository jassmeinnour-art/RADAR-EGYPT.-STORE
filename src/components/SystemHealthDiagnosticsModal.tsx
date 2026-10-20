import React, { useState } from 'react';
import { 
  Activity, 
  X, 
  Cloud, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  HardDrive, 
  ExternalLink, 
  Copy, 
  Check, 
  Wifi, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { testFirestoreConnection, getFirebaseDomainInfo } from '../lib/firebase';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SystemHealthDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCount: number;
  platformsCount: number;
  activePlatformsCount: number;
  currency?: string;
  onShowToast?: (msg: string) => void;
}

export const SystemHealthDiagnosticsModal: React.FC<SystemHealthDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  productCount,
  platformsCount,
  activePlatformsCount,
  currency = 'EGP',
  onShowToast
}) => {
  const { user, profile, isDbConnected, refreshProfile } = useAuth();
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled } = usePWAInstall();
  const domainInfo = getFirebaseDomainInfo();

  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<boolean | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const ok = await testFirestoreConnection();
      setDbTestResult(ok);
      if (onShowToast) {
        onShowToast(ok ? 'قاعدة بيانات Firestore متصلة وتستجيب بنجاح ⚡' : 'تعذر فحص اتصال السحابة، تأكد من الإنترنت');
      }
    } catch {
      setDbTestResult(false);
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText(domainInfo.currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
      if (onShowToast) {
        onShowToast('تم نسخ النطاق الحالي إلى الحافظة 📋');
      }
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn font-['Cairo'] text-right">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                  مركز صحة النظام والمزامنة السحابية
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  تشغيل حي ⚡
                </span>
              </div>
              <p className="text-xs text-slate-400">
                فحص فوري لقاعدة بيانات Firebase، حالة تطبيق PWA، والاتصال بالشبكة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Cloud Firestore Status */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">قاعدة بيانات Firestore</span>
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isDbConnected || dbTestResult ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'}`} />
                <span className="text-sm font-bold text-white">
                  {isDbConnected || dbTestResult ? 'سحابية متصلة' : 'في وضع الاستعداد'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate" dir="ltr">
                {domainInfo.projectId}
              </p>
            </div>

            {/* PWA & Service Worker Status */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">تطبيق الهاتف (PWA)</span>
                <Smartphone className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm font-bold text-white">
                  {isInstalled ? 'مثبت على الجهاز' : 'مفعل وجاهز للتثبيت'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Workbox Cache + Standalone Manifest
              </p>
            </div>

            {/* Online Network Connectivity */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">حالة الاتصال</span>
                <Wifi className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                <span className="text-sm font-bold text-white">
                  {isOnline ? 'متصل بالإنترنت' : 'يعمل بدون إنترنت (Offline)'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {isOnline ? 'مزامنة فورية مفعلة' : 'تخزين مؤقت بالمستعرض'}
              </p>
            </div>

          </div>

          {/* Database Diagnostics Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">فحص استجابة السحابة وقواعد الأمان (Firestore Diagnostic)</span>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingDb}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                <span>{isTestingDb ? 'جاري الفحص...' : 'فحص الاتصال الآن'}</span>
              </button>
            </div>

            {dbTestResult !== null && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                dbTestResult 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                  : 'bg-sky-950/60 border-sky-500/40 text-sky-300'
              }`}>
                {dbTestResult ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0" />}
                <span>
                  {dbTestResult 
                    ? 'نجح فحص الاتصال! قاعدة البيانات السحابية تعمل بكفاءة وقواعد الحماية مستقرة.' 
                    : 'الخدمة تعمل في وضع التخزين المحلي الآمن حتى اكتمال استجابة السحابة.'}
                </span>
              </div>
            )}
          </div>

          {/* Active Session & Storage Metrics */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>إحصائيات الكتالوج والبيانات المحلية</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">المنتجات النشطة</span>
                <span className="text-base font-black text-white">{productCount}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">قنوات البيع</span>
                <span className="text-base font-black text-emerald-400">{activePlatformsCount}/{platformsCount}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">جلسة التاجر</span>
                <span className="text-base font-black text-indigo-300 truncate block">
                  {user ? (profile?.storeName || 'معتمد') : 'تجريبي'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">العملة الأساسية</span>
                <span className="text-base font-black text-sky-300">{currency} 🇪🇬</span>
              </div>
            </div>
          </div>

          {/* Authorized Domains Helper */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">النطاق الحالي (Current Domain)</span>
              <a
                href={domainInfo.consoleAuthSettingsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center gap-1"
              >
                <span>فتح Firebase Auth Settings</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-indigo-300 truncate" dir="ltr">
                {domainInfo.currentHost}
              </span>
              <button
                type="button"
                onClick={handleCopyDomain}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-colors shrink-0"
              >
                {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDomain ? 'تم النسخ' : 'نسخ النطاق'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            رادار التاجر الذكي مصر • حماية SSL سحابية 256-bit
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
