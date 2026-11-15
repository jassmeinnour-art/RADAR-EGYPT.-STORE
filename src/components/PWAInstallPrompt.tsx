import React, { useEffect, useState } from 'react';
import {
  Download,
  ExternalLink,
  Monitor,
  PlusSquare,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePWAInstall } from '../hooks/usePWAInstall';

const DISMISS_STORAGE_KEY = 'radar_pwa_prompt_dismissed_at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

interface PWAInstallPromptProps {
  onShowToast?: (message: string) => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onShowToast }) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    browser,
    browserName,
    isInAppBrowser,
    isInIframe,
    install,
    openInNewWindow,
    downloadApkDirectly,
  } = usePWAInstall();

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (!raw) return false;
      const dismissedAt = Number(raw);
      return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
    } catch {
      return false;
    }
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [iconLoadFailed, setIconLoadFailed] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (isIOS || browser === 'safari') return 'ios';
    if (isAndroid) return 'android';
    return 'desktop';
  });

  useEffect(() => {
    if (isInstalled || isDismissed) {
      setIsVisible(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [isInstalled, isDismissed]);

  useEffect(() => {
    if (isIOS || browser === 'safari') {
      setGuidePlatform('ios');
    } else if (isAndroid) {
      setGuidePlatform('android');
    } else {
      setGuidePlatform('desktop');
    }
  }, [isIOS, isAndroid, browser]);

  if (isInstalled || isDismissed || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowGuideModal(false);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // safe fallback
    }
  };

  const handleInstallAction = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const accepted = await install();
        if (accepted) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 },
          });
          onShowToast?.('تم تثبيت تطبيق رادار التاجر الذكي على جهازك بنجاح.');
          setIsDismissed(true);
          return;
        }
      } catch (err) {
        console.warn('[PWAInstallPrompt] Install trigger error:', err);
      } finally {
        setIsInstalling(false);
      }
    }

    setShowGuideModal(true);
  };

  return (
    <>
      {/* Compact Bottom Install Prompt Card */}
      <aside
        id="pwa-install-prompt"
        dir="rtl"
        aria-label="دعوة تثبيت تطبيق رادار التاجر الذكي"
        className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-6 sm:bottom-5 z-40 sm:w-[410px]"
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/35 rounded-2xl p-3 shadow-2xl text-slate-100">
          <div className="flex items-center justify-between gap-2.5">
            {/* App Icon + Concise Pitch */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden">
                {!iconLoadFailed ? (
                  <img
                    src="/pwa-192x192.png"
                    alt="رادار التاجر الذكي"
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setIconLoadFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Smartphone className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div className="min-w-0 text-right">
                <h3 className="text-xs sm:text-sm font-black text-white truncate">
                  ثبّت تطبيق رادار التاجر الذكي
                </h3>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  تصفح أسرع من شاشتك الرئيسية · يعمل بدون إنترنت
                </p>
              </div>
            </div>

            {/* Touch-Friendly Controls (>= 44px height) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-pwa-prompt-install"
                onClick={handleInstallAction}
                disabled={isInstalling}
                className="min-h-[44px] px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{isInstalling ? 'جارٍ التثبيت...' : 'تثبيت التطبيق'}</span>
              </button>

              <button
                type="button"
                id="btn-pwa-prompt-dismiss"
                onClick={handleDismiss}
                aria-label="إغلاق إشعار تثبيت التطبيق"
                title="لاحقاً"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Guided Installation Modal (iOS Safari, Android Chrome, Desktop) */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-0 sm:p-4 text-right"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Mobile Drag Handle */}
            <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src="/pwa-192x192.png"
                    alt="رادار التاجر الذكي"
                    width={44}
                    height={44}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    إضافة رادار التاجر إلى شاشتك
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {browserName} · وضع التطبيق الدائم
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="إغلاق نافذة التثبيت"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isInAppBrowser && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <p className="font-black text-amber-300">أنت تتصفح من داخل تطبيق مدمج</p>
                <p className="leading-relaxed">
                  افتح الرابط عبر القائمة الجانبية (⋮) في متصفح Chrome أو Safari لتفعيل خيار التثبيت الدائم.
                </p>
              </div>
            )}

            {/* Platform Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setGuidePlatform('android')}
                className={`min-h-[40px] px-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  guidePlatform === 'android'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                أندرويد
              </button>
              <button
                type="button"
                onClick={() => setGuidePlatform('ios')}
                className={`min-h-[40px] px-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  guidePlatform === 'ios'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                آيفون (iOS)
              </button>
              <button
                type="button"
                onClick={() => setGuidePlatform('desktop')}
                className={`min-h-[40px] px-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  guidePlatform === 'desktop'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                كمبيوتر
              </button>
            </div>

            {/* Platform Instructions */}
            {guidePlatform === 'ios' && (
              <div className="space-y-2.5 text-xs text-slate-200 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <Share2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    1. اضغط على أيقونة <strong className="text-white">المشاركة (Share)</strong> في شريط متصفح Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <PlusSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    2. مرر للأسفل واختر <strong className="text-white">إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong> ثم اضغط <strong className="text-white">إضافة</strong>.
                  </span>
                </div>
              </div>
            )}

            {guidePlatform === 'android' && (
              <div className="space-y-2.5 text-xs text-slate-200 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    1. اضغط على قائمة المتصفح <strong className="text-white">(⋮)</strong> أعلى الشاشة في Chrome.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Download className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    2. اختر <strong className="text-white">تثبيت التطبيق (Install app)</strong> أو <strong className="text-white">الإضافة إلى الشاشة الرئيسية</strong>.
                  </span>
                </div>
              </div>
            )}

            {guidePlatform === 'desktop' && (
              <div className="space-y-2.5 text-xs text-slate-200 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <Monitor className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    1. اضغط على أيقونة التثبيت الموجودة على يسار شريط العنوان في Chrome أو Edge.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Download className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    2. أكّد خيار <strong className="text-white">تثبيت (Install)</strong> لتشغيل المنصة كبرنامج مستقل على سطح المكتب.
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {isInstallable && (
                <button
                  type="button"
                  onClick={handleInstallAction}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تثبيت التطبيق الآن</span>
                </button>
              )}

              {isAndroid && (
                <button
                  type="button"
                  onClick={() => {
                    downloadApkDirectly();
                    onShowToast?.('جارٍ تنزيل ملف التطبيق لأندرويد (APK).');
                    setShowGuideModal(false);
                  }}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>تنزيل ملف التثبيت المباشر (APK)</span>
                </button>
              )}

              {isInIframe && !isInstallable && (
                <button
                  type="button"
                  onClick={openInNewWindow}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>فتح في نافذة مستقلة لتفعيل التثبيت الفوري</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full min-h-[44px] px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
