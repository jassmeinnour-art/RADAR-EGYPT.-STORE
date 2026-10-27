import React, { useState } from 'react';
import { WifiOff, Database, RefreshCw, AlertTriangle, CheckCircle2, CloudOff } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

interface OfflineNoticeBannerProps {
  onShowToast?: (msg: string) => void;
}

export const OfflineNoticeBanner: React.FC<OfflineNoticeBannerProps> = ({ onShowToast }) => {
  const { isOffline, cachedTasksCount, cachedMerchantsCount, lastSyncedAt, checkConnection } = useOfflineStatus();
  const [isTesting, setIsTesting] = useState(false);

  if (!isOffline) return null;

  const handleManualCheck = async () => {
    setIsTesting(true);
    const online = await checkConnection();
    setIsTesting(false);

    if (online) {
      if (onShowToast) onShowToast('تم استعادة الاتصال بالإنترنت بنجاح! ⚡');
    } else {
      if (onShowToast) onShowToast('ما زلت في وضع الأوفلاين - يتم الاعتماد على بيانات IndexedDB المحلية 📦');
    }
  };

  return (
    <div 
      className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b-2 border-amber-500 text-white px-4 py-2.5 shadow-xl sticky top-0 z-[100] transition-all animate-in slide-in-from-top duration-300"
      dir="rtl"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Left Status Alert */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0 animate-pulse">
            <WifiOff className="w-5 h-5 text-red-300" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                وضع عدم الاتصال بالإنترنت (Offline Mode)
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[11px] font-bold">
                IndexedDB نشط 📦
              </span>
            </div>

            <p className="text-slate-200 text-xs font-medium mt-0.5">
              جاري عرض البيانات والمهام الأساسية المخزنة محلياً ({cachedTasksCount} مهمة + {cachedMerchantsCount} متجر).
              {lastSyncedAt && ` • آخر تحديث: ${lastSyncedAt}`}
            </p>
          </div>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualCheck}
            disabled={isTesting}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 border border-amber-400/40 active:scale-95 cursor-pointer"
            title="فحص الاتصال بالإنترنت مجدداً"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'جاري الفحص...' : 'فحص الاتصال 🔄'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
