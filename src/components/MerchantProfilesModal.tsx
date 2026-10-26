import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  CheckCircle2,
  Phone,
  MapPin,
  Store,
  User,
  ShieldCheck,
  Edit3,
  Trash2,
  Download,
  Upload,
  Send,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Building2,
  RefreshCw,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MerchantProfile,
  getMerchantProfiles,
  getActiveMerchantProfile,
  setActiveMerchantProfile,
  addMerchantProfile,
  updateMerchantProfile,
  deleteMerchantProfile,
  exportMerchantProfilesJson,
  importMerchantProfilesJson
} from '../services/merchantProfileService';
import { sendWhatsAppMessageToPhone } from '../services/whatsappService';

interface MerchantProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
  onProfileChanged?: (profile: MerchantProfile) => void;
}

const EGYPTIAN_CITIES_SUGGESTIONS = [
  'القاهرة - العتبة وشارع عبد العزيز',
  'القاهرة - التجمع ومدينة نصر',
  'الجيزة - المهندسين والدقي',
  'الجيزة - فيصل والهرم',
  'الإسكندرية - سموحة ومحطة الرمل',
  'دمياط - المنطقة الصناعية والمفروشات',
  'الدقهلية - المنصورة',
  'الغربية - طنطا والمحلة الكبرى',
  'الشرقية - الزقازيق والعاشر من رمضان',
  'القليوبية - بنها وشبرا الخيمة',
  'أسيوط - وسط البلد'
];

export const MerchantProfilesModal: React.FC<MerchantProfilesModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onProfileChanged
}) => {
  const [profiles, setProfiles] = useState<MerchantProfile[]>(() => getMerchantProfiles());
  const [activeProfile, setActiveProfileState] = useState<MerchantProfile>(() => getActiveMerchantProfile());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingProfileId, setTestingProfileId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [profileName, setProfileName] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [region, setRegion] = useState('القاهرة - العتبة وشارع عبد العزيز');
  const [role, setRole] = useState<'admin' | 'pricing_manager' | 'inventory_specialist'>('admin');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🏬');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      const all = getMerchantProfiles();
      const current = getActiveMerchantProfile();
      setProfiles(all);
      setActiveProfileState(current);
      setIsEditing(false);
      setEditingId(null);
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectActive = (profile: MerchantProfile) => {
    try {
      const activated = setActiveMerchantProfile(profile.id);
      setActiveProfileState(activated);
      setProfiles(getMerchantProfiles());
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      if (onShowToast) {
        onShowToast(`🎯 تم تفعيل ملف "${activated.profileName}"! تم توجيه الواتساب والتنبيهات لرقم: ${activated.whatsappNumber}`);
      }
      if (onProfileChanged) {
        onProfileChanged(activated);
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || '⚠️ فشل تفعيل الملف التعريفي');
    }
  };

  const handleOpenAddForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setProfileName('');
    setMerchantName('');
    setStoreName('');
    setWhatsappNumber('');
    setRegion('القاهرة - العتبة وشارع عبد العزيز');
    setRole('pricing_manager');
    setEmail('');
    setNotes('');
    setAvatarEmoji('🏬');
    setFormError(null);
  };

  const handleOpenEditForm = (profile: MerchantProfile) => {
    setIsEditing(true);
    setEditingId(profile.id);
    setProfileName(profile.profileName);
    setMerchantName(profile.merchantName);
    setStoreName(profile.storeName);
    setWhatsappNumber(profile.whatsappNumber);
    setRegion(profile.region);
    setRole(profile.role);
    setEmail(profile.email || '');
    setNotes(profile.notes || '');
    setAvatarEmoji(profile.avatarEmoji || '🏬');
    setFormError(null);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profileName.trim()) {
      setFormError('يرجى تحديد اسم الملف التعريفي (مثل: فرع المهندسين)');
      return;
    }
    if (!merchantName.trim()) {
      setFormError('يرجى إدخال اسم التاجر / المسؤول');
      return;
    }
    if (!whatsappNumber.trim()) {
      setFormError('يرجى إدخال رقم الواتساب المعتمد');
      return;
    }

    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setFormError('رقم الواتساب غير صالح، يرجى التأكد من الرقم (مثال: 01012345678)');
      return;
    }

    try {
      if (editingId) {
        const updated = updateMerchantProfile(editingId, {
          profileName: profileName.trim(),
          merchantName: merchantName.trim(),
          storeName: storeName.trim() || profileName.trim(),
          whatsappNumber: whatsappNumber.trim(),
          region: region.trim() || 'مصر',
          role,
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
          avatarEmoji: avatarEmoji || '🏬'
        });

        setProfiles(getMerchantProfiles());
        if (activeProfile.id === editingId) {
          setActiveProfileState(updated);
          if (onProfileChanged) onProfileChanged(updated);
        }
        if (onShowToast) onShowToast(`✅ تم تحديث ملف "${updated.profileName}" بنجاح!`);
      } else {
        const created = addMerchantProfile({
          profileName: profileName.trim(),
          merchantName: merchantName.trim(),
          storeName: storeName.trim() || profileName.trim(),
          whatsappNumber: whatsappNumber.trim(),
          region: region.trim() || 'مصر',
          role,
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
          avatarEmoji: avatarEmoji || '🏬',
          isDefault: profiles.length === 0
        });

        setProfiles(getMerchantProfiles());
        // Auto-activate if user wants
        handleSelectActive(created);
        if (onShowToast) onShowToast(`🎉 تم إنشاء ملف "${created.profileName}" وتفعيله مباشرة!`);
      }

      setIsEditing(false);
      setEditingId(null);
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ الملف');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (profiles.length <= 1) {
      if (onShowToast) onShowToast('⚠️ لا يمكن حذف الملف التعريفي الأخير');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف ملف التاجر "${name}"؟`)) {
      try {
        deleteMerchantProfile(id);
        const updatedList = getMerchantProfiles();
        const newActive = getActiveMerchantProfile();
        setProfiles(updatedList);
        setActiveProfileState(newActive);
        if (onShowToast) onShowToast(`🗑️ تم حذف ملف "${name}" بنجاح.`);
        if (onProfileChanged) onProfileChanged(newActive);
      } catch (err: any) {
        if (onShowToast) onShowToast(err.message || 'تعذر الحذف');
      }
    }
  };

  const handleTestWhatsApp = async (profile: MerchantProfile) => {
    setTestingProfileId(profile.id);
    try {
      const msg = [
        `🔔 *اختبار تواصل رادار التاجر الذكي - مصر 🇪🇬*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 *التاجر المعتمد:* ${profile.merchantName}`,
        `🏬 *المتجر / الفرع:* ${profile.storeName}`,
        `📍 *المنطقة:* ${profile.region}`,
        `📱 *رقم الواتساب النشط:* ${profile.whatsappNumber}`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `✅ تم ربط هذا الرقم بنجاح مع محرك التنبيهات اللحظية وهبوط الأسعار.`
      ].join('\n');

      const ok = await sendWhatsAppMessageToPhone(profile.whatsappNumber, msg);
      if (ok && onShowToast) {
        onShowToast(`🚀 تم فتح محادثة الواتساب بنجاح للرقم (${profile.whatsappNumber})!`);
      }
    } catch {
      if (onShowToast) onShowToast('تعذر إرسال رسالة الاختبار');
    } finally {
      setTestingProfileId(null);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = exportMerchantProfilesJson();
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `radar-egypt-merchant-profiles-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      if (onShowToast) onShowToast('📥 تم تصدير ملفات التجار بنجاح!');
    } catch {
      if (onShowToast) onShowToast('⚠️ فشل تصدير الملفات');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = importMerchantProfilesJson(content);
        if (ok) {
          const updated = getMerchantProfiles();
          const active = getActiveMerchantProfile();
          setProfiles(updated);
          setActiveProfileState(active);
          if (onShowToast) onShowToast('🎉 تم استيراد ملفات التجار بنجاح!');
          if (onProfileChanged) onProfileChanged(active);
        } else {
          if (onShowToast) onShowToast('❌ تنسيق الملف غير متوافق');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onShowToast) onShowToast(`📋 تم نسخ الرقم (${phone})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div 
        dir="rtl"
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl shadow-inner">
              👥
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-['Alexandria'] flex items-center gap-2">
                <span>إدارة ملفات تعريف التجار (Merchant Profiles)</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {profiles.length} ملفات مسجلة
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                تبديل بيانات التواصل (رقم الواتساب، اسم التاجر، المنطقة) تلقائياً لتوجيه التنبيهات وإشعارات هبوط الأسعار للمسؤول المناسب.
              </p>
            </div>
          </div>

          {/* Active Profile Banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-indigo-900/50 border border-indigo-400/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-1 bg-white/10 rounded-xl">{activeProfile.avatarEmoji || '🏬'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-200">الملف النشط حالياً للتنبيهات:</span>
                  <span className="text-xs font-black text-white bg-indigo-600 px-2 py-0.5 rounded-md">
                    {activeProfile.profileName}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span>👤 {activeProfile.merchantName}</span>
                  <span>•</span>
                  <span>📱 {activeProfile.whatsappNumber}</span>
                  <span>•</span>
                  <span>📍 {activeProfile.region}</span>
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>مفعّل ومستقبل للتنبيهات</span>
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ملف تاجر جديد</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
              title="تصدير ملفات التجار كنسخة احتياطية JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>تصدير JSON</span>
            </button>

            <label className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>استيراد JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            💡 يتم تطبيق التبديل لحظياً على كافة تنبيهات الواتساب والمحاكي والكتالوج
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[62vh] overflow-y-auto space-y-4">
          
          {/* Add / Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfileForm} className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-300 shadow-sm space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2.5">
                <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>{editingId ? 'تعديل بيانات ملف التاجر' : 'إضافة ملف تعريف تاجر جديد'}</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1 rounded-md hover:bg-white transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Profile Name */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    اسم الملف / الفرع <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="مثال: فرع القاهرة - شارع عبد العزيز"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Merchant Name */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    اسم التاجر / المسؤول <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder="مثال: م. حسام الشريف"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Store Name */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    اسم المتجر التجاري
                  </label>
                  <div className="relative">
                    <Store className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="مثال: الصفوة للإلكترونيات والأجهزة"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    رقم الواتساب للتنبيهات <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-2.5 w-4 h-4 text-emerald-600" />
                    <input
                      type="text"
                      dir="ltr"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="01097751352 أو +201012345678"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Region / Governorate */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    المنطقة / المحافظة <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-indigo-500" />
                    <input
                      type="text"
                      list="egypt-regions"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="اختر أو اكتب المحافظة والمنطقة"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <datalist id="egypt-regions">
                      {EGYPTIAN_CITIES_SUGGESTIONS.map((city, idx) => (
                        <option key={idx} value={city} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الدور الوظيفي
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="admin">مدير عام المتجر (Admin)</option>
                    <option value="pricing_manager">مسؤول التسعير والمنافسين (Pricing Manager)</option>
                    <option value="inventory_specialist">أخصائي المخزون والمشتريات (Inventory)</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="merchant@example.com"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Emoji Icon */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    أيقونة الملف التعريفي
                  </label>
                  <div className="flex items-center gap-2">
                    {['🏬', '🏢', '🌊', '🛋️', '🏪', '⚡', '👑'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center transition cursor-pointer ${
                          avatarEmoji === emoji ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  ملاحظات أو نطاق التغطية
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات توضيحية حول تخصص هذا الفرع أو الملف..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black transition cursor-pointer shadow-xs"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة وتفعيل الملف'}
                </button>
              </div>
            </form>
          )}

          {/* Profiles Cards List */}
          <div className="space-y-3">
            {profiles.map((p) => {
              const isActive = p.id === activeProfile.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border-2 transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 via-white to-sky-50/80 border-indigo-500 shadow-md ring-2 ring-indigo-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    
                    {/* Main Info */}
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                        isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 border border-slate-200'
                      }`}>
                        {p.avatarEmoji || '🏬'}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 font-['Alexandria']">
                            {p.profileName}
                          </h4>

                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>النشط حالياً</span>
                            </span>
                          )}

                          {p.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              افتراضي
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : p.role === 'pricing_manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.role === 'admin' ? 'مدير عام' : p.role === 'pricing_manager' ? 'مسؤول تسعير' : 'مخزون'}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs text-slate-600 pt-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{p.merchantName}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{p.storeName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{p.region}</span>
                          </div>
                        </div>

                        {/* Phone + Action */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs font-bold">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span dir="ltr">{p.whatsappNumber}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyPhone(p.whatsappNumber, p.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="نسخ رقم الهاتف"
                          >
                            {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {p.notes && (
                            <span className="text-[11px] text-slate-500 truncate max-w-xs">
                              📝 {p.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions on Card */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => handleSelectActive(p)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          title="تفعيل هذا الملف كملف نشط للتنبيهات والواتساب"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>تفعيل الآن ⚡</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>نشط ومعتمد</span>
                        </span>
                      )}

                      {/* Quick WhatsApp Test Button */}
                      <button
                        type="button"
                        onClick={() => handleTestWhatsApp(p)}
                        disabled={testingProfileId === p.id}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer"
                        title="إرسال رسالة اختبار لهذا الرقم عبر واتساب"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-600" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(p)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                        title="تعديل بيانات الملف"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      {profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.profileName)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                          title="حذف هذا الملف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>يتم حفظ وتشفير ملفات التجار محلياً وفي السحابة، مع توجيه فوري للتنبيهات.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
