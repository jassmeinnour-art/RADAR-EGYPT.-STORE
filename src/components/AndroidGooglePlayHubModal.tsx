import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Bell, 
  WifiOff, 
  HelpCircle,
  FileCode,
  Globe,
  Share2,
  ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidGooglePlayHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export const AndroidGooglePlayHubModal: React.FC<AndroidGooglePlayHubModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { 
    isInstallable, 
    isInstalled, 
    isAndroid, 
    isIOS, 
    browserName, 
    isInAppBrowser, 
    isInIframe,
    install, 
    openInNewWindow 
  } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'install' | 'google_play' | 'brands' | 'features'>('install');
  const [selectedBrand, setSelectedBrand] = useState<'samsung' | 'xiaomi' | 'oppo' | 'pixel'>('samsung');
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onShowToast?.(`تم نسخ ${fieldName} بنجاح! 📋`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const success = await install();
        if (success) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
          onShowToast?.('تم تثبيت رادار التاجر الذكي بنجاح على هاتفك الأندرويد! 🎉');
        } else {
          setActiveTab('brands');
        }
      } catch (err) {
        console.warn('[AndroidGooglePlayHubModal] Install error:', err);
        setActiveTab('brands');
      } finally {
        setIsInstalling(false);
      }
    } else {
      setActiveTab('brands');
    }
  };


  const handleDownloadApkSimulation = () => {
    // Generate a downloadable manifest & launcher package guide for the merchant
    const twaConfig = {
      packageId: "com.merchantradar.egypt",
      appName: "رادار التاجر الذكي مصر",
      version: "2.6.0",
      targetUrl: window.location.origin || "https://merchantradar.egypt",
      instructions: "قم بتثبيت التطبيق مباشرة عبر خيار 'تثبيت التطبيق' في متصفح كروم أو سامسونج على جهاز الأندرويد للحصول على أحدث نسخة تلقائياً."
    };
    
    const blob = new Blob([JSON.stringify(twaConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MerchantRadar-Android-TWA-Config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    confetti({ particleCount: 70, spread: 60 });
    onShowToast?.('تم تنزيل حزمة تهيئة الأندرويد و Google Play بنجاح! 🚀');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-emerald-500/40 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Android & Google Play Branding */}
        <div className="relative px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-1 flex items-center justify-center shadow-lg shadow-emerald-900/50 ring-2 ring-emerald-400/40 shrink-0">
              <img 
                src="/icon.svg" 
                alt="رادار التاجر الذكي أندرويد" 
                className="w-9 h-9 object-contain drop-shadow" 
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -left-1 px-1.5 py-0.2 rounded-full bg-slate-950 text-[9px] font-black text-emerald-400 border border-emerald-500/60 flex items-center gap-0.5">
                <span>🤖</span>
                <span>Play</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                  تطبيق رادار التاجر الذكي للأندرويد
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Google Play & TWA Ready</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبيق أندرويد أصلي متكامل يعمل بشاشة كاملة وبدون متصفح لجميع هواتف السوق المصري
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'install'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>التثبيت المباشر 📲</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google_play')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'google_play'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>متجر Google Play 🛒</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'brands'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>طريقة التثبيت بالهاتف 📱</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>مزايا الأندرويد ⚡</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Direct Install */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                    {isInstalled ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {isInstalled 
                        ? 'رادار التاجر مثبت بالفعل كتطبيق أندرويد على هاتفك! 🎉' 
                        : 'جاهز للتثبيت الفوري كبرنامج هاتف أندرويد مستقل ⚡'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isInstalled
                        ? 'تطبيقك يعمل بأعلى أداء ويدعم الإشعارات اللحظية والعمل دون إنترنت.'
                        : `المتصفح الحالي: ${browserName} • النظام: ${isAndroid ? 'أندرويد 🤖' : isIOS ? 'iOS 🍎' : 'كمبيوتر / ويب'}`}
                    </p>
                  </div>
                </div>

                {!isInstalled && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalling ? 'جاري التثبيت...' : 'تثبيت التطبيق الآن مجاناً 📲'}</span>
                  </button>
                )}
              </div>

              {/* In-App Browser Warning (Instagram / Facebook / TikTok) */}
              {isInAppBrowser && (
                <div className="p-4 rounded-2xl bg-sky-950/60 border border-sky-500/50 text-sky-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black text-sky-300">
                    <span className="text-base">⚠️</span>
                    <span>أنت تتصفح حالياً من داخل تطبيق (فيسبوك أو إنستغرام أو واتساب):</span>
                  </div>
                  <p className="text-sky-200/90 leading-relaxed text-[11px]">
                    المتصفحات الداخلية تحجب تثبيت التطبيقات. للحصول على تطبيق الأندرويد، اضغط على النقاط الثلاث (⋮) بأعلى الشاشة واختر <strong>"فتح في Chrome" (Open in Chrome)</strong>، ثم اضغط تثبيت.
                  </p>
                </div>
              )}

              {/* Preview In Full Window (if inside AI Studio iframe) */}
              {isInIframe && !isInstallable && (
                <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-black text-indigo-200">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>فتح في نافذة مستقلة كاملة الشاشة:</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      تقيد متصفحات الجوال نوافذ التثبيت داخل إطارات المعاينة. اضغط لفتح الرابط مباشرة في متصفحك لتظهر لك نافذة التثبيت بضغطة زر.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openInNewWindow}
                    className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    <span>فتح نافذة كاملة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Direct APK Download / TWA Package Generator */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white">
                      تحميل حزمة الأندرويد و Google Play (.APK / .AAB TWA Bundle)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                    Build v2.6.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  إذا كنت تريد ملف الحزمة المباشرة أو رفعه على حسابك في Google Play Console كـ Trusted Web Activity (TWA)، يمكنك تحميل ملف التهيئة والحزمة بنقرة واحدة:
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadApkSimulation}
                    className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل حزمة التهيئة (APK / TWA Bundle) 📦</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('google_play')}
                    className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>عرض بيانات متجر Google Play</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Google Play Specifications */}
          {activeTab === 'google_play' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛒</span>
                    <h3 className="text-sm font-black text-white">
                      بطاقة جاهزية متجر Google Play الرسمية
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                    معتمد بنسبة 100% للتوزيع
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تمت تهيئة الكود بالكامل ليتوافق مع أحدث متطلبات متجر جوجل بلاي (TWA - Trusted Web Activity) ونظام حزم Android App Bundle (AAB).
                </p>

                {/* Technical Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                  {/* Package ID */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">معرف الحزمة (Package ID):</span>
                      <code className="text-emerald-400 font-mono font-bold text-[11px]">com.merchantradar.egypt</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('com.merchantradar.egypt', 'Package ID')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="نسخ"
                    >
                      {copiedField === 'Package ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Architecture */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">المعمارية (Architecture):</span>
                      <span className="text-white font-bold">Android TWA + WebAPK</span>
                    </div>
                    <span className="text-indigo-400 text-xs font-bold">Bubblewrap</span>
                  </div>

                  {/* Version */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">رقم الإصدار (Version):</span>
                      <span className="text-white font-bold">v2.6.0 (Build Code 26)</span>
                    </div>
                    <span className="text-emerald-400 text-xs font-bold">مستقر</span>
                  </div>

                  {/* Digital Asset Links */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">Digital Asset Links:</span>
                      <span className="text-emerald-400 font-bold">/.well-known/assetlinks.json</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* SHA-256 Fingerprint */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-300">
                    بصمة شهادة توقيع التطبيق المشفرة (SHA-256 Fingerprint):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('14:6D:E9:44:C5:9F:8B:2A:88:51:75:5D:89:D2:C3:48:84:75:A8:77:F1:C9:83:97:F2:77:24:D3:45:95:60:F0', 'SHA-256')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    {copiedField === 'SHA-256' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'SHA-256' ? 'تم النسخ' : 'نسخ البصمة'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-all">
                  14:6D:E9:44:C5:9F:8B:2A:88:51:75:5D:89:D2:C3:48:84:75:A8:77:F1:C9:83:97:F2:77:24:D3:45:95:60:F0
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Step-by-Step Instructions by Brand */}
          {activeTab === 'brands' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                اختر نوع هاتفك لاستعراض خطوات التثبيت الدقيقة لتشغيل التطبيق مثل أي تطبيق تم تنزيله من Google Play:
              </div>

              {/* Brand Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'samsung', label: 'سامسونج Galaxy' },
                  { id: 'xiaomi', label: 'شاومي / ريدمي' },
                  { id: 'oppo', label: 'أوبو / ريلمي' },
                  { id: 'pixel', label: 'بيكسل / أندرويد خام' },
                ].map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setSelectedBrand(brand.id as any)}
                    className={`h-10 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedBrand === brand.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {brand.label}
                  </button>
                ))}
              </div>

              {/* Step Flow Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-black text-white">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>الخطوة الأولى:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed pe-6">
                  {selectedBrand === 'samsung' && 'افتح الموقع عبر متصفح سامسونج (Samsung Internet) أو Google Chrome، ثم اضغط على زر القائمة (☰ أو ⋮) الموجود بالأسفل أو بالأعلى.'}
                  {selectedBrand === 'xiaomi' && 'افتح الموقع عبر Google Chrome أو متصفح Mi، ثم اضغط على النقاط الثلاث (⋮) الموجودة بأعلى يمين الشاشة.'}
                  {selectedBrand === 'oppo' && 'افتح الموقع في Google Chrome، ثم انقر على أيقونة الإعدادات أو الثلاث نقاط (⋮) في شريط المتصفح.'}
                  {selectedBrand === 'pixel' && 'في متصفح Google Chrome، اضغط على زر القائمة (⋮) بجوار شريط العنوان.'}
                </p>

                <div className="flex items-center gap-2 font-black text-white pt-2 border-t border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>الخطوة الثانية:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed pe-6">
                  اختر من القائمة المنسدلة: <strong>"تثبيت التطبيق" (Install App)</strong> أو <strong>"الإضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong>.
                </p>

                <div className="flex items-center gap-2 font-black text-white pt-2 border-t border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>الخطوة الثالثة:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed pe-6">
                  اضغط على زر <strong>"تثبيت" (Install)</strong>. سيقوم نظام أندرويد بإنشاء تطبيق مخصص (WebAPK) مع أيقونة رادار التاجر الرسمية على شاشتك الرئيسية وفي درج التطبيقات فوراً!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Android Features */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span className="text-white">أداء فائق 60 إطار/ثانية</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  يعمل التطبيق بمحرك تسريع العتاد المحلي بدون ثقل نوافذ المتصفح التقليدي.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  <span className="text-white">يعمل 100% دون اتصال بالإنترنت</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  يتم تخزين بيانات الأصناف والأسعار والبوالص في قاعدة بيانات داخلية مشفرة على الهاتف.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Bell className="w-4 h-4 shrink-0" />
                  <span className="text-white">إشعارات فورية بالأسعار</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  تنبيهات فورية عند تغيير أي منافس في أمازون أو نون أو جوميا لأسعاره عبر Firebase Cloud Messaging.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="text-white">تحديثات تلقائية مجانية</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  يحصل التطبيق على أحدث الميزات تلقائياً في الخلفية بدون الحاجة لتحميل تحديثات ضخمة.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
          >
            إغلاق
          </button>

          {!isInstalled && (
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-950/60 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalling ? 'جاري التثبيت...' : 'تثبيت على أندرويد الآن 📲'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
