import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SmartWelcomeGuideProps {
  onTriggerPullOrders?: () => void;
  onTriggerScanProduct?: () => void;
}

export default function SmartWelcomeGuide({
  onTriggerPullOrders,
  onTriggerScanProduct,
}: SmartWelcomeGuideProps) {
  const [showPopup, setShowPopup] = useState(false);

  // إظهار الإشعار تلقائياً بمجرد دخول التطبيق (بعد 800ms)
  useEffect(() => {
    const dismissed = sessionStorage.getItem('radar_smart_welcome_guide_dismissed');
    if (dismissed === 'true') return;

    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    sessionStorage.setItem('radar_smart_welcome_guide_dismissed', 'true');
  };

  if (!showPopup) return null;

  return (
    <>
      {/* خلفية معتمة خفيفة تزيد التركيز */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity"
      />

      {/* تصميم نظيف ومهدئ للعين - خالٍ تماماً من اللون الأصفر */}
      <div
        id="smart-welcome-guide-popup"
        dir="rtl"
        className="fixed top-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:right-auto md:left-32 z-50 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100 w-[92vw] max-w-md"
      >
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2.5 left-2.5 text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
          aria-label="إغلاق التوجيه"
        >
          <X className="w-4 h-4" />
        </button>

        {/* شريط تنبيه هادئ */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-700/80 rounded-lg p-3.5 pl-7 mb-4">
          <div className="p-2 bg-slate-800 text-sky-400 rounded-lg shrink-0 border border-slate-700">
            <span className="text-base font-bold">✨</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">توجيه مريح للعين</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              تمت إزالة اللون الأصفر تماماً واستبداله بألوان زرقاء هادئة ومريحة للنظر. اضغط على زر{' '}
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onTriggerPullOrders?.();
                }}
                className="text-sky-400 font-bold underline cursor-pointer"
              >
                سحب الطلبات
              </button>{' '}
              للمتابعة.
            </p>
          </div>
        </div>

        {/* أزرار رئيسية بتهدئة بصرية تامة */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            id="btn-welcome-guide-pull-orders"
            onClick={() => {
              handleClose();
              onTriggerPullOrders?.();
            }}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold py-3 px-5 rounded-xl text-sm transition shadow-sm cursor-pointer active:scale-95"
          >
            سحب الطلبات
          </button>
          <button
            type="button"
            id="btn-welcome-guide-scan-product"
            onClick={() => {
              handleClose();
              onTriggerScanProduct?.();
            }}
            className="bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/50 font-semibold py-3 px-5 rounded-xl text-sm transition shadow-sm cursor-pointer active:scale-95"
          >
            مسح منتج جديد
          </button>
        </div>

        {/* سهم صغير يشير إلى موضع الزر */}
        <div className="absolute -top-2 left-14 w-4 h-4 bg-slate-950 border-t border-l border-slate-800 transform rotate-45" />
      </div>
    </>
  );
}
