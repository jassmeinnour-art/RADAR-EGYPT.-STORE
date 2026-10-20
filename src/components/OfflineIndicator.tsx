import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
      setShowRestored(false);
    } else if (hasBeenOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (isOnline && !showRestored) {
    return null;
  }

  if (!isOnline) {
    return (
      <div 
        id="pwa-offline-banner"
        role="status"
        aria-live="polite"
        className="fixed bottom-4 start-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 text-sky-300 px-3.5 py-2 text-xs font-bold shadow-2xl border border-sky-500/40 backdrop-blur-md animate-fade-in"
      >
        <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
        <WifiOff className="w-4 h-4 text-sky-400 shrink-0" />
        <span>وضع عدم الاتصال — يتم استخدام البيانات السريعة المخزنة (PWA Cache)</span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div 
        id="pwa-online-restored-banner"
        role="status"
        aria-live="polite"
        className="fixed bottom-4 start-4 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-900/95 text-emerald-200 px-3.5 py-2 text-xs font-bold shadow-2xl border border-emerald-500/40 backdrop-blur-md animate-fade-in"
      >
        <Wifi className="w-4 h-4 text-emerald-300 shrink-0" />
        <span>تمت استعادة الاتصال بالإنترنت بنجاح واستئناف التزامن الحي ✅</span>
      </div>
    );
  }

  return null;
};
