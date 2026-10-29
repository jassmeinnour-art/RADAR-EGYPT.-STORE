import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Share2, 
  PlusSquare, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Monitor, 
  ArrowUpRight, 
  Check, 
  Info,
  Layers,
  AlertCircle,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePWAInstall } from '../hooks/usePWAInstall';

export interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings' | 'menu-item' | 'compact' | 'ribbon' | 'floating';
  onShowToast?: (message: string) => void;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  onShowToast,
  className = ''
}) => {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isAndroid,
    isMobile,
    browser,
    browserName,
    isInAppBrowser,
    isInIframe, 
    install, 
    openInNewWindow 
  } = usePWAInstall();

  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'chrome' | 'ios' | 'samsung'>(
    browser === 'safari' ? 'ios' : browser === 'samsung' ? 'samsung' : 'chrome'
  );

  const handleApkDownload = () => {
    const link = document.createElement('a');
    link.href = '/radar-al-tajer-signed.apk';
    link.download = 'radar-al-tajer-signed.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
    onShowToast?.('جاري تنزيل ملف أندرويد الحقيقي (radar-al-tajer-signed.apk)... 🚀');

  };

  const handleInstallClick = async () => {
    handleApkDownload();
  };


  // If already installed or running in standalone PWA mode, completely hide all install buttons
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* 1. Header Variant */}
      {variant === 'header' && (
        <button
          type="button"
          id="btn-pwa-install-header"
          onClick={handleInstallClick}
          className={`h-10 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white text-xs font-bold font-['Alexandria'] flex items-center justify-center gap-2 shadow-sm hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer border border-indigo-400/30 shrink-0 select-none whitespace-nowrap ${className}`}
          title="تثبيت تطبيق رادار التاجر الذكي على هاتفك أو حاسوبك ليعمل كبرنامج مستقل"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <Smartphone className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="hidden sm:inline">تثبيت التطبيق 📱</span>
          <span className="sm:hidden">تثبيت 📱</span>
        </button>
      )}

      {/* 2. Banner Variant (Main Screen / Top View) */}
      {variant === 'banner' && (
        <div 
          id="pwa-install-banner"
          className={`bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4 my-3 text-right ${className}`}
        >
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 flex items-center justify-center shrink-0 shadow-md border border-white/20">
              <img 
                src="/icon.svg" 
                alt="شعار رادار التاجر الذكي" 
                className="w-9 h-9 object-contain drop-shadow"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                  <span>تثبيت رادار التاجر الذكي على هاتفك أو حاسوبك (PWA)</span>
                  <span className="hidden sm:inline-block">📲</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold">
                  يعمل مثل فيسبوك وواتساب ⚡
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
                ثبت التطبيق كبرنامج مستقل على شاشتك الرئيسية للوصول فوري لرصد أسعار السوق المصري بدون شريط المتصفح، مع إشعارات فورية ودعم كامل للعمل دون اتصال بالإنترنت.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0 flex-wrap">
            <button
              type="button"
              id="btn-pwa-install-banner-action"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-indigo-700" />
              <span>{isInstalling ? 'جاري التثبيت...' : 'تثبيت التطبيق الآن 📱'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInstallGuide(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="عرض طريقة التثبيت عبر قائمة المتصفح (نقاط كروم الثلاث أو سفاري)"
            >
              <Info className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">طريقة التثبيت</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Settings Variant (Inside Settings Modal / Tab) */}
      {variant === 'settings' && (
        <div id="pwa-settings-install-card" className={`p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200/80 text-right space-y-3 ${className}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900">تثبيت التطبيق كبرنامج مستقل (PWA App)</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                    هاتف وكمبيوتر
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  يعمل التطبيق على هاتفك أو حاسوبك تماماً مثل تطبيقات فيسبوك وواتساب الأصلية، بشاشة كاملة وسرعة فائقة بدون شريط المتصفح، مع حفظ البيانات والتسعير دون اتصال.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              id="btn-pwa-settings-install"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalling ? 'جاري فتح نافذة التثبيت...' : 'تثبيت التطبيق مباشرة الآن 📱'}</span>
            </button>

            {isInIframe && (
              <button
                type="button"
                onClick={openInNewWindow}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="فتح في نافذة كاملة لتشغيل ميزة التثبيت التلقائي بنقرة واحدة من جوجل كروم"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">نافذة كاملة</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Menu Item Variant (Inside Profile / Header Dropdown) */}
      {variant === 'menu-item' && (
        <button
          type="button"
          id="btn-pwa-menu-item-install"
          onClick={handleInstallClick}
          className={`w-full text-right px-2.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-900 flex items-center justify-between cursor-pointer font-bold border border-indigo-100 transition-colors ${className}`}
        >
          <span className="flex items-center gap-2 text-xs">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>تثبيت التطبيق على جهازك</span>
          </span>
          <span className="text-[10px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>PWA 📲</span>
          </span>
        </button>
      )}

      {/* 5. Compact Variant (Ribbon / Bar) */}
      {variant === 'compact' && (
        <button
          type="button"
          id="btn-pwa-install-compact"
          onClick={handleInstallClick}
          className={`h-9 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white text-xs font-bold font-['Alexandria'] flex items-center justify-center gap-2 shadow-2xs hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer border border-indigo-400/30 shrink-0 select-none whitespace-nowrap ${className}`}
          title="تثبيت التطبيق على هاتفك أو حاسوبك ليعمل كبرنامج مستقل (PWA)"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <Smartphone className="w-3.5 h-3.5 text-white shrink-0" />
          <span>تثبيت التطبيق 📱</span>
        </button>
      )}

      {/* 6. Ribbon Variant */}
      {variant === 'ribbon' && (
        <div 
          id="pwa-install-ribbon"
          onClick={handleInstallClick}
          className={`cursor-pointer group p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all text-xs font-bold ${className}`}
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-white/20 text-white">
              <Smartphone className="w-4 h-4" />
            </span>
            <span>ثبّت التطبيق كبرنامج مستقل على هاتفك (يعمل كفيسبوك وواتساب)</span>
          </div>
          <span className="px-3 py-1 rounded-lg bg-white text-indigo-950 font-black text-[11px] flex items-center gap-1 group-hover:bg-indigo-50 transition-colors">
            <Download className="w-3 h-3" />
            <span>تثبيت الآن 📱</span>
          </span>
        </div>
      )}

      {/* 7. Quick & Clean Install Hint Popover (when beforeinstallprompt is not directly triggered) */}
      {showInstallGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn text-right"
          onClick={() => setShowInstallGuide(false)}
        >
          <div 
            className="w-full sm:max-w-md rounded-2xl bg-[#11131A] border border-sky-500/40 shadow-2xl shadow-sky-500/10 p-4 sm:p-5 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-sky-500/20 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-sky-300 flex items-center gap-1.5">
                    <span>تثبيت تطبيق RADAR المباشر</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 font-bold border border-sky-500/30">
                      Android / PWA
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">خطوة سريعة لتثبيت التطبيق على شاشتك الرئيسية</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {isInstallable ? (
                <button
                  type="button"
                  onClick={async () => {
                    await handleInstallClick();
                    setShowInstallGuide(false);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-[#08090D] font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>تثبيت التطبيق الآن بضغطة واحدة ⚡</span>
                </button>
              ) : isIOS ? (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-[#08090D] text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <span>اضغط على أيقونة المشاركة <strong className="text-sky-300">(Share ⎋)</strong> أسفل المتصفح.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-[#08090D] text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <span>اختر <strong className="text-sky-300">"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-[#08090D] text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <span>افتح قائمة المتصفح العلوية <strong className="text-sky-300">(⋮)</strong> في Chrome أو أندرويد.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-[#08090D] text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <span>اضغط على <strong className="text-sky-300">"تثبيت التطبيق" (Install App)</strong> ليظهر فوراً على هاتفك.</span>
                  </div>
                </div>
              )}

              {isInIframe && !isInstallable && (
                <button
                  type="button"
                  onClick={openInNewWindow}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح بالدومين المستقل لتفعيل التثبيت الفوري ↗</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
