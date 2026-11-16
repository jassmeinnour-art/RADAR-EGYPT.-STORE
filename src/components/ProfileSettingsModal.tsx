import React, { useState } from 'react';
import { X, Save, User, Phone, MapPin, DollarSign, Image as ImageIcon, Bell, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FounderModeWrapper } from './FounderModeWrapper';
import {
  PreferredAlertChannelMode,
  getAccountNotificationChannelPrefs,
  saveAccountNotificationChannelPrefs,
  syncAccountNotificationChannelsToFirestore,
  requestBrowserPermissionOnFirstAlertActivation,
} from '../services/notificationChannelPreferences';
import { navigate } from '../utils/navigation';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const { profile, updateStoreProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [storeName, setStoreName] = useState(profile?.storeName || '');
  const [contactPhone, setContactPhone] = useState(profile?.contactPhone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [preferredCurrency, setPreferredCurrency] = useState(profile?.preferredCurrency || 'EGP');
  const [channelMode, setChannelMode] = useState<PreferredAlertChannelMode>(
    () => getAccountNotificationChannelPrefs().channelMode
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStoreProfile({
        displayName,
        storeName,
        contactPhone,
        city,
        preferredCurrency
      });
      const savedPrefs = saveAccountNotificationChannelPrefs({
        channelMode,
        whatsappPhone: contactPhone || undefined,
      });
      try {
        await syncAccountNotificationChannelsToFirestore(savedPrefs);
      } catch {}
      if (onShowToast) onShowToast('✅ تم تحديث إعدادات الملف الشخصي وقنوات التنبيه بنجاح!');
      onClose();
    } catch {
      if (onShowToast) onShowToast('⚠️ حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <FounderModeWrapper elementId="modal_profile_settings" className="w-full max-w-lg">
        <div className="bg-white rounded-3xl w-full shadow-2xl p-6 relative">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
        
        <h2 className="text-xl font-black text-slate-900 mb-6">إعدادات الحساب والمتجر</h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">اسم المؤسس الظاهر</label>
            <div className="relative">
              <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">اسم المتجر</label>
            <div className="relative">
              <ImageIcon className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">المدينة</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">العملة المفضلة</label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <select 
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
              </select>
            </div>
          </div>

          {/* WhatsApp vs Browser Quick Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              قناة استقبال التنبيهات (واتساب مقابل المتصفح)
            </label>
            <div className="relative">
              <Bell className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <select
                value={channelMode}
                onChange={async (e) => {
                  const nextMode = e.target.value as PreferredAlertChannelMode;
                  setChannelMode(nextMode);
                  if (nextMode === 'both' || nextMode === 'browser_only') {
                    await requestBrowserPermissionOnFirstAlertActivation({ forceIfDefault: true });
                  }
                }}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900"
              >
                <option value="both">تنبيهات واتساب + المتصفح معاً</option>
                <option value="whatsapp_only">تنبيهات واتساب فقط</option>
                <option value="browser_only">تنبيهات المتصفح فقط</option>
                <option value="muted">إيقاف التنبيهات الخارجية</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/settings');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-bold text-indigo-700 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فتح صفحة إعدادات الحساب الكاملة</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isSaving ? 'جاري الحفظ...' : <><Save className="w-4 h-4" /> حفظ التعديلات</>}
          </button>
        </form>
      </div>
      </FounderModeWrapper>
    </div>
  );
};
