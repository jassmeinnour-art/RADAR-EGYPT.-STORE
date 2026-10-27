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
  ChevronDown, 
  Layers, 
  ArrowDown, 
  AlertCircle,
  HelpCircle,
  Zap,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePWAInstall, MobileBrowserType } from '../hooks/usePWAInstall';

interface MobilePWAInstallPromptProps {
  onShowToast?: (message: string) => void;
}

export const MobilePWAInstallPrompt: React.FC<MobilePWAInstallPromptProps> = ({ onShowToast }) => {
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
    isMobilePromptDismissed,
    install, 
    openInNewWindow,
    downloadApkDirectly,
    dismissMobilePrompt,
    resetMobilePrompt
  } = usePWAInstall();

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [selectedTab, setSelectedTab] = useState<MobileBrowserType>(browser === 'safari' ? 'safari' : 'chrome');

  // Don't display if already installed
  if (isInstalled) return null;

  const handleApkDownload = () => {
    downloadApkDirectly();
    confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.6 }
    });
    onShowToast?.('جاري تنزيل ملف تطبيق أندرويد الحقيقي (radar-al-tajer-signed.apk)... 🚀');
  };

  const handleInstallClick = async () => {
    // If native prompt is available try it first, otherwise trigger direct APK download
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const success = await install();
        if (success) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
          onShowToast?.('تم تثبيت رادار التاجر الذكي بنجاح على هاتفك! 🎉');
          return;
        }
      } catch (err) {
        console.warn('[MobilePWAInstallPrompt] Install error:', err);
      } finally {
        setIsInstalling(false);
      }
    }
    // Fallback directly to downloading real APK file
    handleApkDownload();
  };


  return (
    <>
      {/* 1. Floating Mobile Dock (Visible on Mobile Screens) */}
      {!isMobilePromptDismissed ? (
        <aside 
          id="mobile-pwa-bottom-dock"
          aria-label="تثبيت رادار التاجر الذكي كبرنامج هاتف مستقل"
          className="fixed bottom-3 inset-x-2.5 z-40 sm:hidden animate-bounce-subtle"
        >
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3 shadow-2xl border border-indigo-500/40 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2.5">
              {/* Icon & Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-xl bg-indigo-600/90 border border-indigo-400/40 p-1 flex items-center justify-center shrink-0 shadow-sm">
                  <img 
                    src="/icon.svg" 
                    alt="رادار التاجر الذكي" 
                    className="w-8 h-8 object-contain drop-shadow" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                </div>
                <div className="text-right min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black text-white truncate">
                      تثبيت رادار التاجر على هاتفك
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 shrink-0">
                      مثل التطبيقات الأصلية ⚡
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-200/90 truncate mt-0.5">
                    شاشة كاملة بدون شريط متصفح وسرعة فائقة
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id="btn-mobile-dock-install"
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[11px] font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isInstalling ? 'جاري...' : 'تثبيت 📲'}</span>
                </button>

                <button
                  type="button"
                  id="btn-mobile-dock-dismiss"
                  onClick={dismissMobilePrompt}
                  aria-label="إغلاق إشعار التثبيت"
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      ) : (
        /* Minimized Floating Button when dismissed */
        <button
          type="button"
          id="btn-mobile-pwa-minimized-launcher"
          onClick={() => {
            resetMobilePrompt();
            setShowGuideModal(true);
          }}
          className="fixed bottom-4 left-3 z-40 sm:hidden h-10 px-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-xl border border-indigo-300/40 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform animate-fadeIn"
          title="تثبيت التطبيق على الشاشة الرئيسية للهاتف"
        >
          <Smartphone className="w-4 h-4 text-white" />
          <span>تثبيت للشاشة 📲</span>
        </button>
      )}

      {/* 2. Interactive Mobile Installation Modal & Step-by-Step Guide */}
      {showGuideModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/75 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn text-right"
          onClick={() => setShowGuideModal(false)}
        >
          <div 
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Drag Handle for Mobile */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-1 flex items-center justify-center shrink-0 shadow-md">
                  <img 
                    src="/icon.svg" 
                    alt="رادار التاجر الذكي" 
                    className="w-9 h-9 object-contain drop-shadow"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                    <span>إضافة رادار التاجر لشاشة هاتفك</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      PWA App
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    يعمل كبرنامج هاتف مستقل تماماً مثل فيسبوك وواتساب
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pe-1">
              {/* Detected Browser Badge */}
              <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">المتصفح المكتشف حالياً:</span>
                    <span className="text-xs font-black text-indigo-950">{browserName}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 font-bold shrink-0">
                  {isIOS ? 'نظام iOS' : isAndroid ? 'نظام أندرويد' : 'كمبيوتر / تابلت'}
                </span>
              </div>

              {/* Direct APK Download Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-emerald-900 font-black text-xs">
                  <Download className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span>تحميل مباشر لملف أندرويد الحقيقي (APK)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  قم بتحميل ملف التركيب المباشر (radar-al-tajer-signed.apk) وتثبيته على هاتفك فوراً بدون شروط المتصفح.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleApkDownload();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف أندرويد (radar-al-tajer-signed.apk) 📲</span>
                </button>
              </div>

              {/* Direct One-Click Install Button if browser supports it */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-900 font-black text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>أو تثبيت تطبيق الويب بنقرة واحدة (PWA)</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleInstallClick();
                      setShowGuideModal(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت PWA للشاشة الرئيسية ⚡</span>
                  </button>
                </div>
              )}


              {/* Warning for In-App Browsers (Facebook, Instagram, WhatsApp) */}
              {isInAppBrowser && (
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-300 text-sky-900 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-black text-sky-950">
                    <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>تنبيه: أنت تتصفح من داخل تطبيق (مثل فيسبوك أو إنستغرام)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-sky-800">
                    المتصفحات المدمجة داخل التطبيقات تقيّد إضافة التطبيقات إلى الشاشة الرئيسية.
                  </p>
                  <div className="bg-white/80 p-2 rounded-xl border border-sky-200 text-[11px] space-y-1 font-bold">
                    <div>1. اضغط على أيقونة (⋮ أو ⋯) في زاوية الشاشة العلوية.</div>
                    <div>2. اختر <strong>"فتح في Chrome"</strong> أو <strong>"فتح في Safari"</strong>.</div>
                    <div>3. سيفتح التطبيق في متصفحك الأساسي ليتاح لك تثبيته بضغطة زر.</div>
                  </div>
                </div>
              )}

              {/* Notice for iFrames / Preview */}
              {isInIframe && !isInstallable && (
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>للتثبيت السريع من نافذة مستقلة:</span>
                    </span>
                    <button
                      type="button"
                      onClick={openInNewWindow}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>فتح نافذة كاملة</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-blue-800 leading-relaxed">
                    تقيد المتصفحات الحديثة نوافذ التثبيت التلقائي داخل الإطارات. بالضغط على الزر أعلاه، يفتح التطبيق في نافذة مستقلة ليظهر لك خيار التثبيت المباشر بنقرة واحدة في كروم.
                  </p>
                </div>
              )}

              {/* Platform Selector Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedTab('chrome')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTab === 'chrome'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>جوجل كروم (أندرويد)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTab('safari')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTab === 'safari'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>سفاري (آيفون iOS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTab('samsung')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTab === 'samsung'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>سامسونج وغيرها</span>
                </button>
              </div>

              {/* Step-by-Step Instructions based on selected tab */}
              {selectedTab === 'chrome' && (
                <div className="space-y-2.5 text-xs text-slate-800">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-black">✓</span>
                      <span>خطوات تثبيت كروم على أندرويد:</span>
                    </div>

                    {/* Step 1 */}
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                        ⋮
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 block">الخطوة 1: اضغط على النقاط الثلاث</strong>
                        <span className="text-[11px] text-slate-600">في أعلى أو أسفل يمين شاشة المتصفح بجانب شريط العنوان.</span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        <Download className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 block">الخطوة 2: اختر "تثبيت التطبيق" أو "الإضافة للشاشة الرئيسية"</strong>
                        <span className="text-[11px] text-slate-600">ستجد الخيار باسم <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"الإضافة إلى الشاشة الرئيسية"</strong>.</span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 block">الخطوة 3: تأكيد التثبيت</strong>
                        <span className="text-[11px] text-slate-600">اضغط "تثبيت". سيتم تنزيل الأيقونة فوراً على شاشة هاتفك الرئيسية كبرنامج مستقل بحجم خفيف جداً.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'safari' && (
                <div className="space-y-2.5 text-xs text-slate-800">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-black">✓</span>
                      <span>خطوات تثبيت متصفح Safari على الآيفون والآيباد:</span>
                    </div>

                    {/* Step 1 */}
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        <Share2 className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 block">الخطوة 1: اضغط على زر المشاركة</strong>
                        <span className="text-[11px] text-slate-600">أيقونة المربع ذو السهم لأعلى (⎋) الموجود في شريط سفاري السفلي.</span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        <PlusSquare className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 block">الخطوة 2: مرر واضغط "إضافة إلى الصفحة الرئيسية"</strong>
                        <span className="text-[11px] text-slate-600">انزل لأسفل قائمة المشاركة واختر <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen ⊞)</strong>.</span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 block">الخطوة 3: اضغط كلمة "إضافة" (Add)</strong>
                        <span className="text-[11px] text-slate-600">في أعلى الزاوية اليسرى. ستظهر أيقونة رادار التاجر على شاشة هاتفك فوراً!</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'samsung' && (
                <div className="space-y-2.5 text-xs text-slate-800">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] flex items-center justify-center font-black">✓</span>
                      <span>خطوات متصفح Samsung Internet والمتصفحات الأخرى:</span>
                    </div>

                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        ☰
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 block">متصفح سامسونج (Samsung Internet):</strong>
                        <span className="text-[11px] text-slate-600">اضغط على زر القائمة (☰) بالأسفل ⟵ اضغط <strong>"إضافة صفحة إلى"</strong> ⟵ اختر <strong>"الشاشة الرئيسية"</strong>.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                        ⊕
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 block">متصفحات الكمبيوتر (Edge / Chrome Desktop):</strong>
                        <span className="text-[11px] text-slate-600">اضغط على أيقونة التثبيت (شاشة مع سهم ⊕) الموجودة في أقصى يسار شريط العنوان بالأعلى.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Home Screen Live Simulator Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>معاينة التطبيق على شاشة هاتفك بعد التثبيت:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">تجربة تطبيقات الهواتف</span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                      WhatsApp
                    </div>
                    <span className="text-[10px] text-slate-400">واتساب</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                      Facebook
                    </div>
                    <span className="text-[10px] text-slate-400">فيسبوك</span>
                  </div>

                  {/* App Icon Highlight */}
                  <div className="flex flex-col items-center gap-1 relative scale-105 transition-transform">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-1 flex items-center justify-center shadow-lg ring-2 ring-emerald-400 border border-white/20">
                      <img 
                        src="/icon.svg" 
                        alt="رادار التاجر الذكي" 
                        className="w-8 h-8 object-contain drop-shadow"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-black flex items-center gap-0.5">
                      رادار التاجر ⭐
                    </span>
                    <span className="absolute -top-2 -right-1 text-[8px] bg-emerald-500 text-white px-1 rounded-full font-bold">
                      جديد
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                      Instagram
                    </div>
                    <span className="text-[10px] text-slate-400">إنستغرام</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-1">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>يفتح بلمسة واحدة من شاشتك</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>يعمل بالكامل دون اتصال بالإنترنت</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>حجم خفيف جداً (&lt; 2 ميجابايت)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>بدون شريط متصفح (Full Screen)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black cursor-pointer transition-colors"
              >
                فهمت الطريقة، إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
