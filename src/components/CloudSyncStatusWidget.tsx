import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { recordSyncSuccess } from '../utils/syncSuccessTracker';

interface CloudSyncStatusWidgetProps {
  onShowToast?: (msg: string) => void;
}

export const CloudSyncStatusWidget: React.FC<CloudSyncStatusWidgetProps> = ({ onShowToast }) => {
  const { isOffline, lastSyncedAt, checkConnection } = useOfflineStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    const online = await checkConnection();
    setIsSyncing(false);

    if (online) {
      const rec = recordSyncSuccess('user_manual_sync');
      if (onShowToast) onShowToast(`✅ تم مزامنة البيانات سحابياً بنجاح! (${rec.formattedDateTime})`);
    } else {
      if (onShowToast) onShowToast('📦 المنظومة تعمل في وضع الأوفلاين (Offline-First) - البيانات المحلية محدثة وآمنة.');
    }
  };

  return (
    <div 
      onClick={handleSyncClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer select-none max-w-full overflow-hidden ${
        isOffline 
          ? 'bg-amber-950/70 border-amber-500/50 text-amber-200 hover:bg-amber-900/70 shadow-sm'
          : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/70 shadow-sm'
      }`}
      title={`حالة الاتصال: ${isOffline ? 'غير متصل (Offline-First)' : 'نشط متصل بالسيرفر'}\nموعد آخر مزامنة ناجحة: ${lastSyncedAt || 'محدث الآن'}\n(انقر لإجراء مزامنة فورية)`}
      dir="rtl"
    >
      {/* Live Pulsing Dot Indicator */}
      <div className="relative flex items-center justify-center shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        {/* Connection Mode */}
        {isOffline ? (
          <span className="flex items-center gap-1 text-amber-300 font-black shrink-0">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">أوفلاين (محلي)</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-300 font-black shrink-0">
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">متصل بالسيرفر</span>
          </span>
        )}

        <span className="text-slate-500 hidden sm:inline">|</span>

        {/* Date and Time of Last Successful Sync */}
        <span className="flex items-center gap-1 text-[11px] font-mono text-white font-bold truncate">
          <Clock className="w-3 h-3 text-slate-300 shrink-0 hidden md:inline" />
          <span className="text-slate-300 hidden lg:inline">آخر مزامنة:</span>
          <span className="text-white bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60">
            {lastSyncedAt ? lastSyncedAt : 'محدث الآن'}
          </span>
        </span>

        {/* Sync Action Icon */}
        <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin text-amber-300' : 'text-slate-400 hover:text-white'}`} />
      </div>
    </div>
  );
};
