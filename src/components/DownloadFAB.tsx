import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  X, 
  Monitor, 
  Smartphone,
  Info
} from 'lucide-react';

export const DownloadFAB: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPermanentlyHidden, setIsPermanentlyHidden] = useState(false);

  // Check storage on mount
  useEffect(() => {
    const hasDownloaded = localStorage.getItem('hasDownloadedApp') === 'true';
    const hideUntil = localStorage.getItem('hideDownloadFABUntil');
    const now = Date.now();
    
    if (hasDownloaded || (hideUntil && now < parseInt(hideUntil))) {
      setIsPermanentlyHidden(true);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (isPermanentlyHidden) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop + windowHeight >= documentHeight - 50) {
      setIsVisible(true);
    }
  }, [isPermanentlyHidden]);

  const handleSearch = useCallback((e: any) => {
    if (isPermanentlyHidden) return;
    
    const query = (e.detail?.query || '').toLowerCase();
    const keywords = ['تحميل', 'تطبيق', 'download', 'app'];
    
    if (keywords.some(k => query.includes(k))) {
      setIsVisible(true);
    }
  }, [isPermanentlyHidden]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('merchant_global_search', handleSearch as EventListener);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('merchant_global_search', handleSearch as EventListener);
    };
  }, [handleScroll, handleSearch]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsPermanentlyHidden(true);
    const hideUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('hideDownloadFABUntil', hideUntil.toString());
  };

  const startDownload = (type: 'windows' | 'apk') => {
    if (type === 'apk') {
      window.location.href = '/radar-al-tajer-signed.apk';
    }
    
    localStorage.setItem('hasDownloadedApp', 'true');
    setIsPermanentlyHidden(true);
    setIsVisible(false);
    setShowMenu(false);
  };

  if (isPermanentlyHidden || !isVisible) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[9999] flex flex-col items-start gap-3 pointer-events-none">
      {/* Menu */}
      {showMenu && (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl w-64 pointer-events-auto">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <h4 className="text-xs font-black text-white">اختر نسخة التحميل</h4>
            <button onClick={() => setShowMenu(false)} className="text-slate-500 hover:text-white transition-colors duration-200">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => startDownload('apk')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5" />
                <div className="text-right">
                  <div className="text-xs font-black">نسخة الأندرويد</div>
                  <div className="text-[10px] opacity-70">APK مباشر</div>
                </div>
              </div>
              <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>

            <button
              onClick={() => startDownload('windows')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-sky-600/10 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/30 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5" />
                <div className="text-right">
                  <div className="text-xs font-black">نسخة الويندوز</div>
                  <div className="text-[10px] opacity-70">قريباً</div>
                </div>
              </div>
              <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800 text-[9px] text-slate-500 text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            <span>بعد التحميل لن يظهر هذا الزر مرة أخرى</span>
          </div>
        </div>
      )}

      {/* Main FAB */}
      <div className="pointer-events-auto relative group">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-4 rounded-full font-black shadow-2xl shadow-amber-500/40 transition-colors duration-200 border-4 border-slate-950"
        >
          <div className="relative">
            <Download className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950" />
          </div>
          <span className="text-sm">تحميل التطبيق الآن</span>
        </button>

        {/* Close Button Overlay */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -left-2 w-6 h-6 bg-slate-800 text-slate-400 hover:text-white rounded-full flex items-center justify-center border border-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          title="إخفاء لمدة 7 أيام"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default DownloadFAB;
