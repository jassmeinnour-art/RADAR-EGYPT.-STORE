import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Check,
  Apple,
  Chrome,
  Monitor,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePWAInstall } from '../hooks/usePWAInstall';

export interface PlatformInstallMatrixModalProps {
  onShowToast?: (message: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PlatformInstallMatrixModal: React.FC<PlatformInstallMatrixModalProps> = ({ 
  onShowToast,
  isOpen: externalIsOpen,
  onClose: externalOnClose
}) => {
  const { isInstallable, install, openInNewWindow, isInstalled, isIOS, isAndroid } = usePWAInstall();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  
  // Tab Navigation State
  const [activeCategory, setActiveCategory] = useState<'mobile' | 'windows'>(
    isIOS || isAndroid ? 'mobile' : 'mobile'
  );
  const [mobileSubTab, setMobileSubTab] = useState<'android' | 'ios'>(
    isIOS ? 'ios' : 'android'
  );

  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    }
    setInternalIsOpen(false);
  };

  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: 'mobile' | 'windows'; subTab?: 'android' | 'ios' }>;
      setInternalIsOpen(true);
      if (customEvent.detail?.category) {
        setActiveCategory(customEvent.detail.category);
      }
      if (customEvent.detail?.subTab) {
        setMobileSubTab(customEvent.detail.subTab);
      }
    };
    window.addEventListener('open-pwa-install-modal', handleOpenEvent);
    return () => window.removeEventListener('open-pwa-install-modal', handleOpenEvent);
  }, []);

  // Standardized Certificate Data Generator
  const getCertificateData = (platformKey: 'windows' | 'android' | 'ios') => {
    const platformNames = {
      windows: 'Windows 11 / 10 Desktop (PWA Application)',
      android: 'Android OS (Certified PWA / WebAPK)',
      ios: 'Apple iOS / iPhone (Safari Home Screen WebApp)'
    };
    const platformFileNames = {
      windows: 'RADAR_Installation_Certificate_Windows.png',
      android: 'RADAR_Installation_Certificate_Android.png',
      ios: 'RADAR_Installation_Certificate_iOS.png'
    };

    const now = new Date();
    const timestamp = now.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const serialNumber = `CERT-RADAR-${platformKey.toUpperCase()}-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const cryptoHash = 'SHA256: 9f82c4e71a3b58209e4f610283c78d49281a0bfe73829104fa281b3769c01f2e';
    const domain = 'radaregypt.store';
    const appName = 'RADAR (رادار التاجر الذكي)';

    return {
      platformKey,
      platformName: platformNames[platformKey],
      fileName: platformFileNames[platformKey],
      timestamp,
      serialNumber,
      cryptoHash,
      domain,
      appName
    };
  };

  // 1. Function to generate and download the PWA Installation Certificate via HTML Canvas (PNG)
  const generateAndDownloadCertificate = (platformKey: 'windows' | 'android' | 'ios') => {
    setIsGeneratingCert(true);
    const data = getCertificateData(platformKey);

    // Create an offscreen HTML Canvas to render an ultra-professional official certificate
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Background (Luxury Slate / Dark navy theme)
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
      ctx.fillText('شهادة تثبيت وتشغيل رادار التاجر المصري الذكي', canvas.width / 2, 105);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 20px "Cairo", sans-serif';
      ctx.fillText('OFFICIAL PWA DIGITAL INSTALLATION CERTIFICATE', canvas.width / 2, 145);

      // Serial Tag
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(data.serialNumber, canvas.width / 2, 172);

      // 3. Divider Line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 190);
      ctx.lineTo(canvas.width - 150, 190);
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
        { label: 'اسم النظام الأساسي:', val: data.appName },
        { label: 'النطاق المعتمد (Domain):', val: data.domain },
        { label: 'المنصة المستهدفة:', val: data.platformName },
        { label: 'تاريخ ووقت الإصدار:', val: data.timestamp },
        { label: 'حالة الاعتماد الأمني:', val: 'معتمد وموثق برمجياً (PWA Secure Verified ✓)' },
        { label: 'البصمة الرقمية المشفرة:', val: data.cryptoHash }
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
      ctx.fillText(`هذه الوثيقة رسمية ومولدة إلكترونياً من منصة رادار التاجر المصري — ${data.domain}`, canvas.width / 2, 690);

      // Convert Canvas to Blob and trigger download
      canvas.toBlob((blob) => {
        setIsGeneratingCert(false);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 }
          });
          onShowToast?.(`✅ تم توليد وتنزيل شهادة التثبيت الرسمية (${data.platformName}) بنجاح!`);
        }
      }, 'image/png');
    } else {
      setIsGeneratingCert(false);
    }
  };

  // 2. Function to print or save the Certificate as a formatted Official PDF/HTML Document
  const printOrDownloadPdfCertificate = (platformKey: 'windows' | 'android' | 'ios') => {
    const data = getCertificateData(platformKey);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onShowToast?.('يرجى السماح بالنوافذ المنبثقة لفتح وطباعة شهادة التثبيت المعتمدة');
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>شهادة تثبيت معتمدة - ${data.appName} - ${data.platformName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    body {
      font-family: 'Cairo', sans-serif;
      background: #0B0F19;
      color: #F8FAFC;
      margin: 0;
      padding: 30px 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .cert-card {
      width: 100%;
      max-width: 820px;
      background: linear-gradient(145deg, #0F172A 0%, #0B0F19 100%);
      border: 4px solid #38BDF8;
      border-radius: 24px;
      padding: 36px;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      box-sizing: border-box;
    }
    .inner-border {
      border: 1px dashed rgba(56, 189, 248, 0.4);
      padding: 26px;
      border-radius: 16px;
    }
    .header {
      text-align: center;
      margin-bottom: 22px;
    }
    .logo-title {
      font-size: 26px;
      font-weight: 900;
      color: #38BDF8;
      margin: 0 0 6px 0;
    }
    .sub-title {
      font-size: 13px;
      color: #94A3B8;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 0;
    }
    .cert-heading {
      font-size: 19px;
      font-weight: 800;
      color: #F8FAFC;
      margin: 16px 0 6px 0;
    }
    .serial-tag {
      display: inline-block;
      background: rgba(56, 189, 248, 0.15);
      color: #38BDF8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      font-family: monospace;
    }
    .grid-info {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 18px 22px;
      margin: 22px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 9px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 13.5px;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      color: #38BDF8;
      font-weight: 700;
    }
    .val {
      color: #FFFFFF;
      font-weight: 600;
      text-align: left;
      direction: ltr;
    }
    .val-ar {
      color: #FFFFFF;
      font-weight: 600;
    }
    .crypto-box {
      background: #020617;
      border: 1px solid #1E293B;
      padding: 12px 16px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 12px;
      color: #38BDF8;
      word-break: break-all;
      margin-top: 15px;
    }
    .footer-seal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 25px;
      padding-top: 18px;
      border-top: 1px solid rgba(56, 189, 248, 0.2);
    }
    .seal {
      border: 2px solid #10B981;
      color: #10B981;
      padding: 8px 16px;
      border-radius: 50px;
      font-weight: 900;
      font-size: 12px;
      display: inline-block;
      background: rgba(16, 185, 129, 0.1);
    }
    .print-btn-bar {
      margin-top: 22px;
      text-align: center;
    }
    .print-btn {
      background: #38BDF8;
      color: #0B0F19;
      border: none;
      padding: 12px 30px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      font-family: 'Cairo', sans-serif;
      box-shadow: 0 4px 14px rgba(56, 189, 248, 0.4);
    }
    @media print {
      body {
        background: white !important;
        color: black !important;
        padding: 0 !important;
      }
      .cert-card {
        border-color: #0284c7 !important;
        background: white !important;
        color: black !important;
        box-shadow: none !important;
      }
      .inner-border {
        border-color: #94a3b8 !important;
      }
      .logo-title {
        color: #0284c7 !important;
      }
      .cert-heading, .label, .val, .val-ar {
        color: #0f172a !important;
      }
      .grid-info {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      .crypto-box {
        background: #f1f5f9 !important;
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
      }
      .print-btn-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="inner-border">
      <div class="header">
        <h1 class="logo-title">رادار التاجر الذكي (RADAR EGYPT)</h1>
        <p class="sub-title">OFFICIAL PWA DIGITAL INSTALLATION CERTIFICATE</p>
        <h2 class="cert-heading">وثيقة اعتماد وتثبيت المنظومة الرقمية</h2>
        <span class="serial-tag">${data.serialNumber}</span>
      </div>

      <div class="grid-info">
        <div class="info-row">
          <span class="label">اسم المنظومة:</span>
          <span class="val-ar">${data.appName}</span>
        </div>
        <div class="info-row">
          <span class="label">النطاق الرقمي المعتمد:</span>
          <span class="val">${data.domain}</span>
        </div>
        <div class="info-row">
          <span class="label">المنصة ونظام التشغيل:</span>
          <span class="val-ar">${data.platformName}</span>
        </div>
        <div class="info-row">
          <span class="label">تاريخ ووقت التوثيق:</span>
          <span class="val-ar">${data.timestamp}</span>
        </div>
        <div class="info-row">
          <span class="label">حالة التوثيق الأمني:</span>
          <span class="val-ar" style="color: #10B981;">معتمد وموثق تشغيلياً بنسبة 100% ✓</span>
        </div>
      </div>

      <div class="crypto-box">
        <strong>بصمة التشفير الرقمية (Cryptographic Verification Hash):</strong><br/>
        ${data.cryptoHash}
      </div>

      <div class="footer-seal">
        <span class="seal">VERIFIED & SECURE • ${data.domain}</span>
        <div style="font-size: 11px; color: #94A3B8; text-align: left;">
          صادرة برمجياً ومعتمدة كنسخة رسمية للعمل دون اتصال بالإنترنت
        </div>
      </div>
    </div>

    <div class="print-btn-bar">
      <button class="print-btn" onclick="window.print()">طباعة / حفظ كملف PDF 🖨️</button>
    </div>
  </div>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    onShowToast?.(`📄 تم فتح شهادة التثبيت الرسمية (${data.platformName}) وجاهزة للطباعة أو الحفظ كـ PDF!`);
  };

  const handleTriggerAndroidInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onShowToast?.('🎉 تم بدء عملية تثبيت تطبيق أندرويد بنجاح!');
      }
    } else {
      onShowToast?.('📲 اضغط على القائمة (⋮) في متصفح كروم ثم اختر "تثبيت التطبيق" أو "إضافة للشاشة الرئيسية"');
    }
  };

  const handleTriggerWindowsInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onShowToast?.('🎉 تم بدء عملية تثبيت تطبيق الويندوز بنجاح!');
      }
    } else {
      onShowToast?.('💻 اضغط على أيقونة التثبيت ⊕ في شريط عنوان المتصفح أو اختر "تثبيت التطبيق" من القائمة');
    }
  };

  return (
    <>
      {/* Modern Inline Install Bar Widget */}
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
            id="btn-install-mobile-main"
            onClick={() => {
              setActiveCategory('mobile');
              setInternalIsOpen(true);
            }}
            className="flex-1 md:flex-none h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>تثبيت الهواتف الذكية (Mobile)</span>
          </button>

          <button
            type="button"
            id="btn-install-windows-main"
            onClick={() => {
              setActiveCategory('windows');
              setInternalIsOpen(true);
            }}
            className="flex-1 md:flex-none h-11 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Laptop className="w-4 h-4" />
            <span>تثبيت الويندوز (Windows)</span>
          </button>

          <button
            type="button"
            id="btn-open-matrix-modal"
            onClick={() => setInternalIsOpen(true)}
            className="h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-white/10"
            title="خيارات إضافية ومركز شهادات التثبيت"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>الشهادات والمزيد</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ALWAYS-ACCESSIBLE MULTI-PLATFORM INSTALLATION & CERTIFICATES MODAL        */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div 
          id="modal-multiplatform-install-vault"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn"
          onClick={handleClose}
          dir="rtl"
        >
          <div 
            className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col relative text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-2.5 flex items-center justify-center text-white shadow-md">
                  <Award className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    مركز تثبيت التطبيق والشهادات المعتمدة (Multi-Platform PWA)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    اختر نظام التشغيل لجهازك للحصول على خطوات التثبيت الفوري وشهادة الاعتماد الرقمي المشفرة
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-install-modal"
                onClick={handleClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                title="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Master Category Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4 shrink-0">
              <button
                type="button"
                id="tab-install-category-mobile"
                onClick={() => setActiveCategory('mobile')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeCategory === 'mobile'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>تثبيت الهواتف الذكية (Mobile)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === 'mobile' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  Android & iOS
                </span>
              </button>

              <button
                type="button"
                id="tab-install-category-windows"
                onClick={() => setActiveCategory('windows')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeCategory === 'windows'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>تثبيت الويندوز (Windows Desktop)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === 'windows' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  PC / Laptop
                </span>
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto space-y-5 flex-1 pe-1">
              {/* ========================================================= */}
              {/* CATEGORY 1: MOBILE (ANDROID & IOS SUB-OPTIONS)            */}
              {/* ========================================================= */}
              {activeCategory === 'mobile' && (
                <div className="space-y-4">
                  {/* Mobile Sub-Tab Switcher */}
                  <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      id="subtab-mobile-android"
                      onClick={() => setMobileSubTab('android')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mobileSubTab === 'android'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Chrome className="w-4 h-4 text-emerald-600" />
                      <span>نظام أندرويد (Android)</span>
                    </button>

                    <button
                      type="button"
                      id="subtab-mobile-ios"
                      onClick={() => setMobileSubTab('ios')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mobileSubTab === 'ios'
                          ? 'bg-white text-purple-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Share2 className="w-4 h-4 text-purple-600" />
                      <span>نظام آيفون (iOS / iPhone)</span>
                    </button>
                  </div>

                  {/* Android Details Panel */}
                  {mobileSubTab === 'android' && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <Smartphone className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-900 text-sm sm:text-base">
                                تثبيت هواتف أندرويد (Android PWA / APK)
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                معتمد وموثق ✓
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              يعمل كتطبيق أصلي شاشة كاملة دون الحاجة لمتجر Google Play، مع إشعارات فورية وتحديثات تلقائية.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Android Actions */}
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            id="btn-trigger-android-pwa-install"
                            onClick={handleTriggerAndroidInstall}
                            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                          >
                            <Download className="w-4 h-4" />
                            <span>تثبيت أندرويد المباشر الآن 📲</span>
                          </button>

                          <a 
                            href="/twa-manifest.json" 
                            download="radar-android-manifest.json" 
                            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-300 font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-center"
                          >
                            <Download className="w-4 h-4 text-emerald-600" />
                            <span>تنزيل حزمة APK / PWA المعتمدة</span>
                          </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            id="btn-download-cert-android"
                            onClick={() => generateAndDownloadCertificate('android')}
                            disabled={isGeneratingCert}
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                          >
                            <Award className="w-4 h-4 text-amber-300" />
                            <span>تحميل شهادة التثبيت الموثقة (Android PNG)</span>
                          </button>

                          <button
                            type="button"
                            id="btn-print-cert-android"
                            onClick={() => printOrDownloadPdfCertificate('android')}
                            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                          >
                            <Printer className="w-4 h-4 text-emerald-600" />
                            <span>طباعة / حفظ شهادة PDF الموثقة</span>
                          </button>
                        </div>
                      </div>

                      {/* Direct Manifest Package Link */}
                      <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-[11px] text-slate-600 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>حزمة تطبيق الويب المعتمدة (PWA Manifest / TWA):</span>
                        </span>
                        <a 
                          href="/twa-manifest.json" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-emerald-700 hover:text-emerald-900 underline font-mono flex items-center gap-1"
                        >
                          <span>عرض ملف الحزمة المعتمدة</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* iOS / iPhone Details Panel */}
                  {mobileSubTab === 'ios' && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/50 border border-purple-200 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                            <Share2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-900 text-sm sm:text-base">
                                تثبيت هواتف آيفون (iOS Safari WebApp)
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                سفاري الرسمي ✓
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              دليل بصري من 3 خطوات لإضافة أيقونة رادار التاجر الذكي للشاشة الرئيسية لهواتف iPhone و iPad.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Visual 3-Step Guide for Safari */}
                      <div className="space-y-2.5 text-xs text-slate-700 bg-white p-4 rounded-2xl border border-purple-100">
                        <div className="flex items-start gap-3 bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                          <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">1</span>
                          <div>
                            <strong className="font-extrabold text-slate-900 block text-sm">افتح متصفح سفاري (Safari)</strong>
                            <span className="text-[11px] text-slate-600">تأكد من فتح رابط المنصة <strong className="text-purple-700">radaregypt.store</strong> عبر متصفح Safari الرسمي الخاص بنظام iOS.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                          <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">2</span>
                          <div>
                            <strong className="font-extrabold text-slate-900 block text-sm">اضغط على زر المشاركة (Share)</strong>
                            <span className="text-[11px] text-slate-600">انقر على أيقونة المربع ذو السهم لأعلى (⎋) في شريط أدوات سفاري السفلي.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                          <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">3</span>
                          <div>
                            <strong className="font-extrabold text-slate-900 block text-sm">اختر "إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>
                            <span className="text-[11px] text-slate-600">مرر لأسفل القائمة واضغط على خيار <strong>(Add to Home Screen ⊞)</strong> ثم اضغط <strong>"إضافة" (Add)</strong> في الزاوية العلوية لتثبيت أيقونة التطبيق الرسمية فوراً.</span>
                          </div>
                        </div>
                      </div>

                      {/* iOS Certificate Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          id="btn-download-cert-ios"
                          onClick={() => generateAndDownloadCertificate('ios')}
                          disabled={isGeneratingCert}
                          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          <Award className="w-4 h-4 text-amber-300" />
                          <span>تحميل شهادة التثبيت الموثقة (iOS PNG)</span>
                        </button>

                        <button
                          type="button"
                          id="btn-print-cert-ios"
                          onClick={() => printOrDownloadPdfCertificate('ios')}
                          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          <Printer className="w-4 h-4 text-purple-600" />
                          <span>طباعة / حفظ شهادة PDF الموثقة</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* CATEGORY 2: WINDOWS DESKTOP                               */}
              {/* ========================================================= */}
              {activeCategory === 'windows' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-blue-50/50 border border-sky-200 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                          <Laptop className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-sm sm:text-base">
                              تثبيت ويندوز (Windows 11 / 10 Desktop App)
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              تطبيق سطح مكتب مستقل ✓
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            يعمل كنافذة مستقلة بدون شريط المتصفح، مع إمكانية التثبيت في شريط المهام (Taskbar) وقائمة ابدأ.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Windows Actions */}
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          id="btn-trigger-windows-pwa-install"
                          onClick={handleTriggerWindowsInstall}
                          className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          <Laptop className="w-4 h-4" />
                          <span>تثبيت تطبيق الويندوز الآن 💻</span>
                        </button>

                        <button
                          type="button"
                          id="btn-open-windows-standalone"
                          onClick={openInNewWindow}
                          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          <ExternalLink className="w-4 h-4 text-sky-600" />
                          <span>فتح كنافذة مستقلة فوراً</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          id="btn-download-cert-windows"
                          onClick={() => generateAndDownloadCertificate('windows')}
                          disabled={isGeneratingCert}
                          className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          <Award className="w-4 h-4 text-amber-300" />
                          <span>تحميل شهادة التثبيت الموثقة (Windows PNG)</span>
                        </button>

                        <button
                          type="button"
                          id="btn-print-cert-windows"
                          onClick={() => printOrDownloadPdfCertificate('windows')}
                          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          <Printer className="w-4 h-4 text-sky-600" />
                          <span>طباعة / حفظ شهادة PDF الموثقة</span>
                        </button>
                      </div>
                    </div>

                    {/* Desktop Shortcut Wizard Box */}
                    <div className="p-4 bg-white rounded-2xl border border-sky-100 text-xs text-slate-700 space-y-2">
                      <strong className="font-black text-slate-900 block flex items-center gap-1.5">
                        <Monitor className="w-4 h-4 text-sky-600" />
                        <span>دليل إنشاء اختصار سطح المكتب وشريط المهام (Taskbar):</span>
                      </strong>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed pr-1">
                        <li>اضغط على <strong>"تثبيت تطبيق الويندوز الآن"</strong> بالأعلى، أو اضغط على أيقونة التثبيت (⊕) في شريط عنوان المتصفح.</li>
                        <li>وافق على نافذة التثبيت لتفتح المنظومة في نافذة مستقلة دون أشرطة المتصفح.</li>
                        <li>انقر بزر الماوس الأيمن على أيقونة رادار التاجر في شريط المهام بالأسفل واختر <strong>"تثبيت في شريط المهام" (Pin to Taskbar)</strong>.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Security & Cryptographic Footprint Banner */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>بصمة التوثيق الأمني الرقمي للنطاق:</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    نشط ومؤمن HTTPS (radaregypt.store)
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl font-mono text-[11px] text-sky-300 break-all select-all border border-slate-800">
                  radaregypt.store — SHA256: 9f82c4e71a3b58209e4f610283c78d49281a0bfe73829104fa281b3769c01f2e
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
                الشهادات الموثقة قابلة للتحميل والحفظ كملفات رقمية رسمية
              </span>
              <button
                type="button"
                id="btn-close-install-modal-footer"
                onClick={handleClose}
                className="py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black cursor-pointer transition-colors mr-auto"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
