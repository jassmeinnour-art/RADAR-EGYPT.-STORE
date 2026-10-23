import React, { useState } from 'react';
import { X, Save, User, Phone, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      if (onShowToast) onShowToast('✅ تم تحديث إعدادات الملف الشخصي بنجاح!');
      onClose();
    } catch (err) {
      if (onShowToast) onShowToast('⚠️ حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
        
        <h2 className="text-xl font-black text-slate-900 mb-6">إعدادات الملف الشخصي للمتجر</h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">اسم التاجر</label>
            <div className="relative">
              <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">إشعارات سطح المكتب (Desktop Alerts)</label>
            <button
              type="button"
              onClick={async () => {
                const { requestNotificationPermission } = await import('../services/notificationService');
                const permission = await requestNotificationPermission();
                if (permission === 'granted' && onShowToast) {
                  onShowToast('🔔 تم تفعيل تنبيهات سطح المكتب بنجاح!');
                } else if (permission === 'denied' && onShowToast) {
                  onShowToast('❌ تم رفض إذن التنبيهات. يرجى تفعيله من إعدادات المتصفح.');
                }
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-bold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>تفعيل تنبيهات الواتساب والتسعير (Background)</span>
              </div>
              <span className="text-indigo-600">طلب الإذن 🔔</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 mt-4"
          >
            {isSaving ? 'جاري الحفظ...' : <><Save className="w-4 h-4" /> حفظ التعديلات</>}
          </button>
        </form>
      </div>
    </div>
  );
};
