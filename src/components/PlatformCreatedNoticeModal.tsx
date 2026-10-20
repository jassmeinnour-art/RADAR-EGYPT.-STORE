import React, { useEffect } from 'react';
import {
  Sparkles,
  Link2,
  KeyRound,
  Mail,
  ArrowLeft,
  X,
  CheckCircle2,
  ShieldCheck,
  Store
} from 'lucide-react';
import { ConnectedMerchantPlatform } from '../types';

interface PlatformCreatedNoticeModalProps {
  isOpen: boolean;
  platform: ConnectedMerchantPlatform | null;
  categoryTitle?: string;
  onClose: () => void;
  onOpenSettings: (platform: ConnectedMerchantPlatform) => void;
}

export const PlatformCreatedNoticeModal: React.FC<PlatformCreatedNoticeModalProps> = ({
  isOpen,
  platform,
  categoryTitle,
  onClose,
  onOpenSettings,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !platform) return null;

  return (
    <div
      id="platform-created-notice-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="platform-created-notice-card"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right animate-scaleUp"
      >
        {/* Top Accent Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500" />

        {/* Header */}
        <div className="p-5 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>تمت الإضافة بنجاح</span>
                </span>
                {categoryTitle && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {categoryTitle}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 mt-1">
                منصة «{platform.name}»
              </h3>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-platform-notice"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Notice */}
        <div className="px-5 py-3 space-y-3.5 text-xs">
          {/* Main Notice Callout */}
          <div className="p-3.5 rounded-xl bg-sky-50/90 border border-sky-200/90 text-sky-950 flex items-start gap-2.5 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 shrink-0 mt-0.5">
              <Link2 className="w-4 h-4" />
            </div>
            <div className="leading-relaxed">
              <p className="font-black text-sky-900 text-xs mb-1">
                تذكير هام لتفعيل المزامنة المباشرة:
              </p>
              <p className="text-sky-800 text-[11.5px] leading-normal">
                لتفعيل مزامنة الأسعار وتحديث العروض فورياً، يُرجى إدخال <strong>بيانات الربط الخاصة بالـ API</strong> أو <strong>البريد الإلكتروني للتاجر</strong> المرتبط بحسابك على هذه المنصة.
              </p>
            </div>
          </div>

          {/* Quick Checklist / Highlights */}
          <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-700 text-[11px] font-medium">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>رمز الـ API / Auth Token: لمزامنة الأسعار آلياً مع متجرك</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 text-[11px] font-medium">
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>إيميل التاجر: لربط التقارير وتحديث حالة المتجر</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>جميع بيانات الربط مشفرة ومحفوظة بأمان محلياً وسحابياً</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            id="btn-notice-skip"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            سأقوم بذلك لاحقاً
          </button>

          <button
            type="button"
            id="btn-notice-open-credentials"
            onClick={() => {
              onClose();
              onOpenSettings(platform);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <span>إدخال بيانات الربط الآن</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
