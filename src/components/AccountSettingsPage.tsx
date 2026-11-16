import React, { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  DollarSign,
  Globe,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  AccountNotificationChannelPrefs,
  PreferredAlertChannelMode,
  ACCOUNT_NOTIFICATION_CHANNELS_EVENT,
  getAccountNotificationChannelPrefs,
  saveAccountNotificationChannelPrefs,
  syncAccountNotificationChannelsToFirestore,
  loadAccountNotificationChannelsFromFirestore,
  requestBrowserPermissionOnFirstAlertActivation,
} from '../services/notificationChannelPreferences';
import {
  getWebNotificationPermission,
  sendNativeWebNotification,
} from '../services/watchlistNotificationService';

interface AccountSettingsPageProps {
  onShowToast?: (message: string) => void;
}

const CHANNEL_MODE_OPTIONS: Array<{
  mode: PreferredAlertChannelMode;
  title: string;
  subtitle: string;
}> = [
  {
    mode: 'both',
    title: 'واتساب + المتصفح معاً',
    subtitle: 'استقبال فوري عبر واتساب وإشعارات المتصفح المنبثقة (موصى به)',
  },
  {
    mode: 'whatsapp_only',
    title: 'تنبيهات واتساب فقط',
    subtitle: 'إرسال تنبيهات الأسعار عبر واتساب مع إيقاف إشعارات المتصفح',
  },
  {
    mode: 'browser_only',
    title: 'تنبيهات المتصفح فقط',
    subtitle: 'إشعارات متصفح لحظية على سطح المكتب والجوال دون رسائل واتساب',
  },
  {
    mode: 'muted',
    title: 'إيقاف التنبيهات الفورية',
    subtitle: 'كتم القنوات الخارجية والاكتفاء بسجل التنبيهات داخل التطبيق',
  },
];

function getPermissionLabel(perm: NotificationPermission | 'unsupported'): {
  text: string;
  toneClass: string;
} {
  if (perm === 'granted') {
    return { text: 'مسموح ومفعّل', toneClass: 'text-emerald-400' };
  }
  if (perm === 'denied') {
    return { text: 'محظور من المتصفح', toneClass: 'text-rose-400' };
  }
  if (perm === 'unsupported') {
    return { text: 'غير مدعوم بهذا المتصفح', toneClass: 'text-slate-400' };
  }
  return { text: 'بانتظار طلب الإذن', toneClass: 'text-amber-400' };
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  onShowToast,
}) => {
  const { profile, user, updateStoreProfile } = useAuth();

  // Profile fields
  const [displayName, setDisplayName] = useState(profile?.displayName || 'مؤسس النظام');
  const [storeName, setStoreName] = useState(profile?.storeName || 'رادار التاجر المصري');
  const [contactPhone, setContactPhone] = useState(profile?.contactPhone || '');
  const [city, setCity] = useState(profile?.city || 'القاهرة');
  const [preferredCurrency, setPreferredCurrency] = useState(profile?.preferredCurrency || 'EGP');

  // Notification channels state (WhatsApp vs Browser)
  const [channelPrefs, setChannelPrefs] = useState<AccountNotificationChannelPrefs>(() =>
    getAccountNotificationChannelPrefs()
  );
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getWebNotificationPermission()
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingChannels, setIsSavingChannels] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || 'مؤسس النظام');
      setStoreName(profile.storeName || 'رادار التاجر المصري');
      setContactPhone(profile.contactPhone || '');
      setCity(profile.city || 'القاهرة');
      setPreferredCurrency(profile.preferredCurrency || 'EGP');
    }
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    loadAccountNotificationChannelsFromFirestore()
      .then((loaded) => {
        if (mounted) {
          setChannelPrefs(loaded);
        }
      })
      .catch(() => {
        // Offline / local fallback handled safely
      });

    const handleSync = () => {
      if (mounted) {
        setChannelPrefs(getAccountNotificationChannelPrefs());
        setBrowserPermission(getWebNotificationPermission());
      }
    };
    window.addEventListener(ACCOUNT_NOTIFICATION_CHANNELS_EVENT, handleSync);
    return () => {
      mounted = false;
      window.removeEventListener(ACCOUNT_NOTIFICATION_CHANNELS_EVENT, handleSync);
    };
  }, []);

  const persistChannels = async (
    updates: Partial<AccountNotificationChannelPrefs>,
    toastText?: string
  ) => {
    setIsSavingChannels(true);
    try {
      const saved = saveAccountNotificationChannelPrefs(updates);
      setChannelPrefs(saved);
      try {
        await syncAccountNotificationChannelsToFirestore(saved);
      } catch {
        // Non-blocking when offline or Supabase-only session
      }
      if (toastText) {
        setStatusMessage(toastText);
        onShowToast?.(toastText);
      }
      return saved;
    } finally {
      setIsSavingChannels(false);
    }
  };

  const handleSelectChannelMode = async (mode: PreferredAlertChannelMode) => {
    let updated = await persistChannels({ channelMode: mode });

    if (mode === 'both' || mode === 'browser_only') {
      const perm = getWebNotificationPermission();
      if (perm === 'default') {
        const permRes = await requestBrowserPermissionOnFirstAlertActivation({
          forceIfDefault: true,
        });
        setBrowserPermission(permRes.permission);
        updated = getAccountNotificationChannelPrefs();
        setChannelPrefs(updated);
        if (permRes.error) {
          onShowToast?.(permRes.error);
          setStatusMessage(permRes.error);
          return;
        }
      }
    }

    const modeMessages: Record<PreferredAlertChannelMode, string> = {
      both: 'تم ضبط استقبال التنبيهات عبر واتساب والمتصفح معاً.',
      whatsapp_only: 'تم ضبط استقبال التنبيهات عبر واتساب فقط.',
      browser_only: 'تم ضبط استقبال التنبيهات عبر المتصفح فقط.',
      muted: 'تم إيقاف التنبيهات الخارجية والاحتفاظ بالسجل داخل التطبيق.',
    };
    setStatusMessage(modeMessages[mode]);
    onShowToast?.(modeMessages[mode]);
  };

  const handleToggleWhatsApp = async () => {
    const nextVal = !channelPrefs.whatsappEnabled;
    await persistChannels(
      { whatsappEnabled: nextVal },
      nextVal ? 'تم تفعيل تنبيهات واتساب.' : 'تم إيقاف تنبيهات واتساب.'
    );
  };

  const handleToggleBrowser = async () => {
    const nextVal = !channelPrefs.browserNotificationsEnabled;
    if (nextVal && getWebNotificationPermission() === 'default') {
      const permRes = await requestBrowserPermissionOnFirstAlertActivation({
        forceIfDefault: true,
      });
      setBrowserPermission(permRes.permission);
      if (!permRes.granted && permRes.error) {
        setStatusMessage(permRes.error);
        onShowToast?.(permRes.error);
      }
    }
    await persistChannels(
      { browserNotificationsEnabled: nextVal },
      nextVal ? 'تم تفعيل تنبيهات المتصفح.' : 'تم إيقاف تنبيهات المتصفح.'
    );
  };

  const handleRequestPermissionNow = async () => {
    const res = await requestBrowserPermissionOnFirstAlertActivation({ forceIfDefault: true });
    setBrowserPermission(res.permission);
    setChannelPrefs(getAccountNotificationChannelPrefs());
    if (res.granted) {
      const msg = 'تم منح إذن إشعارات المتصفح بنجاح.';
      setStatusMessage(msg);
      onShowToast?.(msg);
    } else if (res.error) {
      setStatusMessage(res.error);
      onShowToast?.(res.error);
    }
  };

  const handleSendTestBrowserNotification = async () => {
    if (getWebNotificationPermission() !== 'granted') {
      const permRes = await requestBrowserPermissionOnFirstAlertActivation({ forceIfDefault: true });
      setBrowserPermission(permRes.permission);
      if (!permRes.granted) {
        const errText = permRes.error || 'يرجى منح إذن إشعارات المتصفح أولاً.';
        setStatusMessage(errText);
        onShowToast?.(errText);
        return;
      }
    }

    const sent = await sendNativeWebNotification({
      title: 'اختبار إشعارات رادار التاجر',
      body: 'إشعارات المتصفح الفورية جاهزة الآن لرصد تغيرات أسعار المنافسين.',
      tag: 'account-settings-test-notif',
      url: '#settings',
    });

    if (sent) {
      const okMsg = 'تم إرسال إشعار تجريبي إلى المتصفح.';
      setStatusMessage(okMsg);
      onShowToast?.(okMsg);
    } else {
      const failMsg = 'تأكد من تفعيل قناة تنبيهات المتصفح ومنح الإذن في المتصفح.';
      setStatusMessage(failMsg);
      onShowToast?.(failMsg);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateStoreProfile({
        displayName: displayName.trim(),
        storeName: storeName.trim(),
        contactPhone: contactPhone.trim(),
        city: city.trim(),
        preferredCurrency,
      });
      await persistChannels({
        whatsappPhone: channelPrefs.whatsappPhone,
        whatsappEnabled: channelPrefs.whatsappEnabled,
        browserNotificationsEnabled: channelPrefs.browserNotificationsEnabled,
      });
      const okMsg = 'تم حفظ بيانات الحساب وتفضيلات قنوات التنبيه بنجاح.';
      setStatusMessage(okMsg);
      onShowToast?.(okMsg);
    } catch {
      const errMsg = 'تعذر حفظ بعض التغييرات، يرجى المحاولة مرة أخرى.';
      setStatusMessage(errMsg);
      onShowToast?.(errMsg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const permBadge = getPermissionLabel(browserPermission);
  const accountEmail = profile?.email || user?.email || 'jassmeinnour@gmail.com';

  return (
    <section
      dir="rtl"
      aria-label="إعدادات الحساب وتفضيلات التنبيهات"
      className="max-w-5xl mx-auto space-y-6 font-['Cairo'] text-slate-100"
    >
      {/* Page Header */}
      <header className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Alexandria']">
            إعدادات الحساب والتنبيهات
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            إدارة بيانات الحساب التجاري وتفضيلات استقبال تنبيهات الأسعار عبر واتساب مقابل إشعارات المتصفح ·{' '}
            <span className="text-slate-300 font-mono" dir="ltr">
              {accountEmail}
            </span>
          </p>
        </div>

        <div className="text-xs text-slate-400 tabular-nums shrink-0">
          القناة النشطة:{' '}
          <strong className="text-sky-400">
            {channelPrefs.channelMode === 'both'
              ? 'واتساب + المتصفح'
              : channelPrefs.channelMode === 'whatsapp_only'
              ? 'واتساب فقط'
              : channelPrefs.channelMode === 'browser_only'
              ? 'المتصفح فقط'
              : 'مكتوم'}
          </strong>
        </div>
      </header>

      {statusMessage && (
        <div
          role="status"
          className="bg-slate-900 border border-emerald-500/40 rounded-xl px-4 py-3 text-xs font-bold text-emerald-300 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Notification Channels Section: WhatsApp vs Browser */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-400" />
              <span>قنوات استقبال التنبيهات: واتساب مقابل المتصفح</span>
            </h2>
            <p className="text-xs text-slate-400">
              اختر القناة المفضلة لوصول تنبيهات تغير أسعار المنافسين وقواعد محرك التسعير الآلي
            </p>
          </div>

          <div className="text-xs font-bold text-slate-300">
            إذن المتصفح:{' '}
            <span className={permBadge.toneClass}>{permBadge.text}</span>
          </div>
        </div>

        {/* 4 Preset Mode Buttons */}
        <div
          role="radiogroup"
          aria-label="وضع قناة استقبال التنبيهات"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {CHANNEL_MODE_OPTIONS.map((opt) => {
            const isSelected = channelPrefs.channelMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`channel-mode-${opt.mode}`}
                disabled={isSavingChannels}
                onClick={() => handleSelectChannelMode(opt.mode)}
                className={`min-h-[84px] p-4 rounded-xl border text-right transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black">{opt.title}</span>
                  {opt.mode === 'both' || opt.mode === 'whatsapp_only' ? (
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : opt.mode === 'browser_only' ? (
                    <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  ) : (
                    <BellOff className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  {opt.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Independent Channel Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* WhatsApp Switch & Number */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white">تنبيهات واتساب (WhatsApp)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  إرسال ملخص تغير السعر والسعر المقترح على رقمك المسجل
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={channelPrefs.whatsappEnabled}
                aria-label="تفعيل تنبيهات واتساب"
                onClick={handleToggleWhatsApp}
                className={`min-h-[32px] w-14 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  channelPrefs.whatsappEnabled
                    ? 'bg-emerald-500 justify-start'
                    : 'bg-slate-700 justify-end'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white block" />
              </button>
            </div>

            <div>
              <label
                htmlFor="account-whatsapp-phone"
                className="block text-xs font-bold text-slate-300 mb-1.5"
              >
                رقم واتساب لاستقبال التنبيهات
              </label>
              <input
                id="account-whatsapp-phone"
                type="text"
                dir="ltr"
                value={channelPrefs.whatsappPhone}
                onChange={(e) =>
                  setChannelPrefs((prev) => ({
                    ...prev,
                    whatsappPhone: e.target.value,
                  }))
                }
                placeholder="201012345678"
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white text-left focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Browser Notification Switch & Permission */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white">
                  تنبيهات المتصفح (Notification API)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  إشعارات سطح المكتب والجوال الفورية لحظة تغير سعر المنافس
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={channelPrefs.browserNotificationsEnabled}
                aria-label="تفعيل تنبيهات المتصفح"
                onClick={handleToggleBrowser}
                className={`min-h-[32px] w-14 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  channelPrefs.browserNotificationsEnabled
                    ? 'bg-sky-500 justify-start'
                    : 'bg-slate-700 justify-end'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white block" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {browserPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermissionNow}
                  className="min-h-[40px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>طلب إذن المتصفح الآن</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSendTestBrowserNotification}
                className="min-h-[40px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>اختبار إشعار المتصفح</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store & Account Details Form */}
      <form
        onSubmit={handleSaveAll}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-base sm:text-lg font-black text-white border-b border-slate-800 pb-3">
          بيانات الحساب والمتجر
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="account-display-name"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              الاسم الظاهر
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                id="account-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-10 pr-10 pl-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="account-store-name"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              اسم المتجر
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                id="account-store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-10 pr-10 pl-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="account-contact-phone"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              رقم هاتف المتجر
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                id="account-contact-phone"
                type="text"
                dir="ltr"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full h-10 pr-10 pl-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white text-left focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="account-city"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              المدينة
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                id="account-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 pr-10 pl-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="account-currency"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              العملة المفضلة
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <select
                id="account-currency"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full h-10 pr-10 pl-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingProfile || isSavingChannels}
            className="min-h-[42px] px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingProfile ? 'جاري الحفظ...' : 'حفظ إعدادات الحساب والتنبيهات'}</span>
          </button>
        </div>
      </form>
    </section>
  );
};

export default AccountSettingsPage;
