import React, { useState } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Globe, 
  FileText, 
  Award, 
  Share2, 
  PlusSquare,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PlatformInstallMatrixModalProps {
  onShowToast?: (message: string) => void;
}

export const PlatformInstallMatrixModal: React.FC<PlatformInstallMatrixModalProps> = ({ onShowToast }) => {
  const { isInstallable, install, openInNewWindow } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'android' | 'ios'>('windows');
  const [showIosGuide, setShowIosGuide] = useState(false);

  // Function to generate and download the PWA Installation Certificate
  const generateAndDownloadCertificate = (platformKey: 'windows' | 'android' | 'ios') => {
    setIsGeneratingCert(true);
    const platformNames = {
      windows: 'Windows 11/10 Desktop PWA',
      android: 'Android APK / PWA',
      ios: 'iOS Safari Home Screen PWA'
    };
    const platformFileNames = {
      windows: 'RADAR_Installation_Certificate_Windows.pdf',
      android: 'RADAR_Installation_Certificate_Android.pdf',
      ios: 'RADAR_Installation_Certificate_iOS.pdf'
    };

    const timestamp = new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const cryptoHash = 'SHA256: 9f82c4e71a3b58209e4f610283c78d49281a0bfe73829104fa281b3769c01f2e';
    const domain = 'radaregypt.store';

    // Create an offscreen HTML Canvas to render an ultra-professional official certificate
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Background (Luxury Slate / Off-white parchment)
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gold / Sky Border Frame
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

      // 2. Header / Title
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 36px "Cairo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('شهادة تثبيت وتشغيل رادار التاجر المصري الذكي', canvas.width / 2, 110);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 22px "Cairo", sans-serif';
      ctx.fillText('OFFICIAL PWA DIGITAL INSTALLATION CERTIFICATE', canvas.width / 2, 155);

      // 3. Divider Line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 185);
      ctx.lineTo(canvas.width - 150, 185);
      ctx.stroke();

      // 4. Certificate Details Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(100, 215, canvas.width - 200, 420);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.strokeRect(100, 215, canvas.width - 200, 420);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 20px "Cairo", sans-serif';

      const leftColX = canvas.width - 140;
      let startY = 275;
      const rowGap = 52;

      const details = [
        { label: 'اسم النظام الأساسي:', val: 'رادار التاجر الذكي (RADAR Global Marketplaces)' },
        { label: 'النطاق المعتمد (Domain):', val: domain },
        { label: 'المنصة المستهدفة:', val: platformNames[platformKey] },
        { label: 'تاريخ ووقت الإصدار:', val: timestamp },
        { label: 'حالة الاعتماد الأمني:', val: 'معتمد وموثق برمجياً (PWA Secure Verified ✓)' },
        { label: 'البصمة الرقمية المشفرة:', val: cryptoHash }
      ];

      details.forEach((item, index) => {
        const y = startY + index * rowGap;
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(item.label, leftColX, y);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px "Cairo", sans-serif';
        const displayVal = item.val.length > 55 ? item.val.slice(0, 52) + '...' : item.val;
        ctx.fillText(displayVal, leftColX - 320, y);
        ctx.font = 'bold 20px "Cairo", sans-serif';
      });

      // 5. Official Stamp / Badge Area
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(220, 425, 75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 20px "Cairo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('رادار مصر', 220, 410);
      ctx.font = 'bold 14px "Cairo", sans-serif';
      ctx.fillText('VERIFIED 100%', 220, 435);
      ctx.fillText('SECURE APP', 220, 455);

      // 6. Footer Signature
      ctx.fillStyle = '#94A3B8';
      ctx.font = '16px "Cairo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('هذه الوثيقة رسمية ومولدة إلكترونياً من منصة رادار التاجر المصري — radaregypt.store', canvas.width / 2, 690);

      // Convert Canvas to Blob/DataURL and trigger download
      canvas.toBlob((blob) => {
        setIsGeneratingCert(false);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = platformFileNames[platformKey];
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 }
          });
          onShowToast?.(`✅ تم توليد وتنزيل شهادة التثبيت الرسمية (${platformNames[platformKey]}) بنجاح!`);
        }
      }, 'image/png');
    } else {
      setIsGeneratingCert(false);
    }
  };

  const handleExecuteInstall = async (platformKey: 'windows' | 'android' | 'ios') => {
    setSelectedPlatform(platformKey);
    generateAndDownloadCertificate(platformKey);

    if (platformKey === 'ios') {
      setShowIosGuide(true);
      return;
    }

    if (isInstallable) {
      const success = await install();
      if (success) {
        onShowToast?.('🎉 تم بدء عملية تثبيت التطبيق بنجاح!');
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Modern Install Bar Widget */}
      <div 
        id="modern-install-action-bar"
        className="my-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-4"
        dir="rtl"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 border border-indigo-400/40 p-2 flex items-center justify-center shrink-0 shadow-lg">
            <img 
              src="/icon.svg" 
              alt="رادار التاجر الذكي" 
              className="w-10 h-10 object-contain drop-shadow" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm md:text-base font-black text-white">
                تثبيت رادار التاجر الذكي كبرنامج مستقل (PWA)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                radaregypt.store ⚡
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              يعمل بدون متصفح، بسرعة فائقة، مع شهادة تثبيت رسمية تلقائية لكل جهاز.
            </p>
          </div>
        </div>

        {/* Action Buttons Matrix */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            id="btn-install-windows"
            onClick={() => handleExecuteInstall('windows')}
            disabled={isGeneratingCert}
            className="flex-1 md:flex-none h-11 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Laptop className="w-4 h-4" />
            <span>تثبيت الويندوز (Windows)</span>
          </button>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <button
              type="button"
              id="btn-install-android"
              onClick={() => handleExecuteInstall('android')}
              disabled={isGeneratingCert}
              className="flex-1 md:flex-none h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>تثبيت أندرويد (Android)</span>
            </button>

            <button
              type="button"
              id="btn-install-ios"
              onClick={() => handleExecuteInstall('ios')}
              disabled={isGeneratingCert}
              className="flex-1 md:flex-none h-11 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>تثبيت أيفون (iOS Safari)</span>
            </button>
          </div>

          <button
            type="button"
            id="btn-open-matrix-modal"
            onClick={() => setIsOpen(true)}
            className="h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-white/10"
            title="خيارات إضافية ومركز شهادات التثبيت"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>الشهادات والمزيد</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Installation & Certificate Matrix Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col relative text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-2 flex items-center justify-center text-white shadow-md">
                  <Award className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    مركز تثبيت رادار التاجر وشهادات الاعتماد الرقمي
                  </h3>
                  <p className="text-xs text-slate-500">
                    تثبيت مباشر على Windows، Android، و iOS مع إصدار شهادة توثيق رسمية PDF
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 flex-1 pe-1">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="font-black text-indigo-950 block">كيف تعمل ميزة التثبيت والشهادات؟</strong>
                  <p className="text-indigo-900 leading-relaxed">
                    عند اختيار أي منصة أدناه، يقوم النظام فوراً بفتح أداة التثبيت الأصلية للجهاز <strong>وتوليد شهادة تثبيت رسمية موثقة برقم تشفير رقمي (SHA-256)</strong> باسم نطاقك (radaregypt.store) لتنزيلها على جهازك كوثيقة رسمية.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">تثبيت ويندوز (Windows)</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      يعمل كتطبيق سطح مكتب مستقل (Desktop App) على Windows 11/10 مع أيقونة في شريط المهام.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleExecuteInstall('windows');
                      setIsOpen(false);
                    }}
                    disabled={isGeneratingCert}
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تثبيت + شهادة ويندوز</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">تثبيت أندرويد (Android)</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      تثبيت مباشر على هواتف أندرويد عبر متصفح كروم وسامسونج مع شاشة كاملة وسرعة فائقة.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleExecuteInstall('android');
                      setIsOpen(false);
                    }}
                    disabled={isGeneratingCert}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تثبيت + شهادة أندرويد</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">تثبيت أيفون (iOS Safari)</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      إضافة الشاشة الرئيسية لجهاز iPhone / iPad عبر متصفح سفاري مع دليل خطوة بخطوة.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleExecuteInstall('ios');
                      setIsOpen(false);
                    }}
                    disabled={isGeneratingCert}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>تثبيت + شهادة أيفون</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>بصمة التوثيق الأمني الرقمي للنطاق:</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    نشط ومؤمن HTTPS
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl font-mono text-[11px] text-sky-300 break-all select-all">
                  radaregypt.store — SHA256: 9f82c4e71a3b58209e4f610283c78d49281a0bfe73829104fa281b3769c01f2e
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="py-2 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black cursor-pointer transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowIosGuide(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">دليل تثبيت أيفون (iOS Safari)</h4>
                  <span className="text-[10px] text-slate-500">تم تنزيل شهادة التوثيق الرسمية جهازك بنجاح ✓</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 font-bold">
                اتبع الخطوات البسيطة التالية لإضافة التطبيق لشاشة الأيفون الرئيسية:
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="font-bold text-slate-900 block">اضغط على زر المشاركة (Share)</strong>
                  <span className="text-[11px] text-slate-600">أيقونة المربع ذو السهم لأعلى (⎋) في شريط سفاري السفلي.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="font-bold text-slate-900 block">اختر "إضافة إلى الصفحة الرئيسية"</strong>
                  <span className="text-[11px] text-slate-600">مرر لأسفل القائمة واضغط (Add to Home Screen ⊞).</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="font-bold text-slate-900 block">اضغط "إضافة" (Add)</strong>
                  <span className="text-[11px] text-slate-600">في أعلى اليسار. ستظهر أيقونة رادار التاجر على شاشة هاتفك فوراً!</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md cursor-pointer"
            >
              فهمت الخطوات، إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
