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
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Palette,
  Moon,
  Sun,
  Check,
  Gauge,
  Contrast,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_MARKETPLACE_ID,
  DEFAULT_TRADER_ID,
  FOUNDER_AMAZON_WARNING_TEXT,
  RADAR_COMPETITOR_PRICES_UPDATED_EVENT,
  RADAR_GLOBAL_SP_API_BANNER,
  getAmazonSpApiSettings,
  invokeAmazonSpApiSyncEdgeFunction,
  isAmazonSpApiConfigured,
  sanitizeProductPullError,
  saveAmazonSpApiSettings,
  syncCompetitorPricesAfterImport,
  wipeEntireAppDatabaseAndStorage,
} from '../utils/sellerCentralExcelImporter';
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
  const { resolvedColorMode, setThemeVariant, isHighContrast, setHighContrast } = useTheme();
  const { isPerformanceMode, isSlowNetworkDetected, setPerformanceMode } = usePerformanceMode();

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

  // Amazon SP-API (Supabase Edge Function) settings
  const [spApiCreds, setSpApiCreds] = useState(() => getAmazonSpApiSettings());
  const [showSpApiSecrets, setShowSpApiSecrets] = useState(false);
  const [isSyncingSpApi, setIsSyncingSpApi] = useState(false);
  const [isFetchingCompetitors, setIsFetchingCompetitors] = useState(false);
  const [spApiFeedback, setSpApiFeedback] = useState<string | null>(null);

  // Full app wipe state
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');
  const [isWiping, setIsWiping] = useState(false);

  const handleWipeExecution = async () => {
    if (wipeConfirmInput.trim() !== 'حذف') return;
    setIsWiping(true);
    try {
      const res = await wipeEntireAppDatabaseAndStorage();
      onShowToast?.(res.message);
      setShowWipeModal(false);
      setWipeConfirmInput('');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      const msg = sanitizeProductPullError(err);
      onShowToast?.(msg);
    } finally {
      setIsWiping(false);
    }
  };

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

  const handleSaveSpApiCreds = () => {
    const saved = saveAmazonSpApiSettings(spApiCreds);
    setSpApiCreds(saved);
    const msg = 'تم حفظ إعدادات ربط Amazon SP-API للمزامنة عبر Supabase Edge Function.';
    setSpApiFeedback(msg);
    setStatusMessage(msg);
    onShowToast?.(msg);
  };

  const handleSyncViaSpApiEdge = async () => {
    const saved = saveAmazonSpApiSettings(spApiCreds);
    setSpApiCreds(saved);
    setIsSyncingSpApi(true);
    setSpApiFeedback(null);
    try {
      const outcome = await invokeAmazonSpApiSyncEdgeFunction(
        saved.sellerId || DEFAULT_TRADER_ID
      );
      const msg = outcome.success
        ? outcome.message
        : sanitizeProductPullError(outcome.message);
      setSpApiFeedback(msg);
      setStatusMessage(msg);
      onShowToast?.(msg);
    } catch (err) {
      const cleanMsg = sanitizeProductPullError(err);
      setSpApiFeedback(cleanMsg);
      onShowToast?.(cleanMsg);
    } finally {
      setIsSyncingSpApi(false);
    }
  };

  const handleConnectAndFetchCompetitorPrices = async () => {
    if (
      !spApiCreds.clientId.trim() ||
      !spApiCreds.clientSecret.trim()
    ) {
      const msg = 'يرجى إدخال Client ID و Client Secret أولاً لربط SP-API.';
      setSpApiFeedback(msg);
      onShowToast?.(msg);
      return;
    }

    const saved = saveAmazonSpApiSettings(spApiCreds);
    setSpApiCreds(saved);
    setIsFetchingCompetitors(true);
    setSpApiFeedback(null);

    try {
      const { data: prodRows, error } = await supabase
        .from('products')
        .select('id, sku, asin, price, image_url, trader_id');
      if (error) throw error;

      const candidates = (Array.isArray(prodRows) ? prodRows : [])
        .filter((r: any) => String(r?.asin || '').trim().length > 0)
        .map((r: any) => ({
          productId: r.id,
          sku: String(r.sku || ''),
          asin: String(r.asin || '').trim().toUpperCase(),
          price: Number(r.price || 0),
          image_url: r.image_url || undefined,
          trader_id: r.trader_id || undefined,
        }));

      if (candidates.length === 0) {
        const msg =
          'تم ربط SP-API وحفظ المفاتيح بنجاح. لا توجد منتجات برمز ASIN حالياً في قاعدة البيانات لجلب أسعار المنافسين لها.';
        setSpApiFeedback(msg);
        setStatusMessage(msg);
        onShowToast?.(msg);
        return;
      }

      const syncOutcome = await syncCompetitorPricesAfterImport(
        candidates,
        saved.sellerId || candidates[0]?.trader_id || DEFAULT_TRADER_ID
      );

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(RADAR_COMPETITOR_PRICES_UPDATED_EVENT));
      }

      setSpApiFeedback(syncOutcome.message);
      setStatusMessage(syncOutcome.message);
      onShowToast?.(syncOutcome.message);
    } catch (err) {
      const cleanMsg = sanitizeProductPullError(err);
      setSpApiFeedback(cleanMsg);
      onShowToast?.(cleanMsg);
    } finally {
      setIsFetchingCompetitors(false);
    }
  };

  const permBadge = getPermissionLabel(browserPermission);
  const accountEmail = profile?.email || user?.email || 'jassmeinnour@gmail.com';

  return (
    <section
      dir="rtl"
      aria-label="إعدادات الحساب وتفضيلات التنبيهات"
      className="max-w-5xl mx-auto space-y-6 font-['Cairo'] text-[var(--text-primary)]"
    >
      {/* Page Header */}
      <header className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Alexandria']">
            إعدادات الحساب والتنبيهات
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            إدارة بيانات الحساب التجاري ومظهر التطبيق وتفضيلات استقبال تنبيهات الأسعار ·{' '}
            <span className="text-[var(--text-primary)] font-mono" dir="ltr">
              {accountEmail}
            </span>
          </p>
        </div>

        <div className="text-xs text-[var(--text-secondary)] tabular-nums shrink-0">
          القناة النشطة:{' '}
          <strong className="text-[var(--accent-color)]">
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
          className="bg-[var(--card-bg)] border border-[var(--success-border)] rounded-xl px-4 py-3 text-xs font-bold text-[var(--success-text)] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--success-color)]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Theme Appearance Card: Dark High Contrast & Clean Light */}
      <div
        aria-label="إعدادات ثيم التطبيق والمظهر"
        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--divider-color)] pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <Palette className="w-5 h-5 text-[var(--primary-color)]" />
              <span>مظهر التطبيق والثيمات (Dark High Contrast / Clean Light)</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              بدّل بضغطة واحدة بين وضع Dark High Contrast المخصص للبيئات التجارية المظلمة ووضع Clean Light المريح للعين
            </p>
          </div>

          <ThemeToggle
            variant="full"
            showLabel
            onToggleNotification={(msg) => {
              setStatusMessage(msg);
              onShowToast?.(msg);
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            data-testid="select-theme-dark-high-contrast"
            onClick={() => {
              setThemeVariant('dark-high-contrast');
              const msg = 'تم تفعيل وضع Dark High Contrast للبيئات التجارية المظلمة';
              setStatusMessage(msg);
              onShowToast?.(msg);
            }}
            className={`p-4 rounded-xl border text-right transition-all cursor-pointer flex items-start justify-between gap-3 ${
              resolvedColorMode === 'dark'
                ? 'bg-[#020617] border-amber-400 text-white ring-2 ring-amber-400/30'
                : 'bg-[var(--surface-subtle)] border-[var(--card-border)] text-[var(--text-primary)] hover:border-slate-500'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-sm font-black" dir="ltr">
                  Dark High Contrast
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${resolvedColorMode === 'dark' ? 'text-slate-300' : 'text-[var(--text-secondary)]'}`}>
                تباين فائق وحدود واضحة مخصصة للبيئات التجارية المظلمة وإدارة الصفقات الطويلة.
              </p>
            </div>
            {resolvedColorMode === 'dark' && (
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="select-theme-clean-light"
            onClick={() => {
              setThemeVariant('clean-light');
              const msg = 'تم تفعيل وضع Clean Light المريح للعين';
              setStatusMessage(msg);
              onShowToast?.(msg);
            }}
            className={`p-4 rounded-xl border text-right transition-all cursor-pointer flex items-start justify-between gap-3 ${
              resolvedColorMode === 'light'
                ? 'bg-white border-sky-500 text-slate-950 ring-2 ring-sky-400/30 shadow-sm'
                : 'bg-[var(--surface-subtle)] border-[var(--card-border)] text-[var(--text-primary)] hover:border-sky-400'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-sm font-black" dir="ltr">
                  Clean Light
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${resolvedColorMode === 'light' ? 'text-slate-600' : 'text-[var(--text-secondary)]'}`}>
                خلفية أوف-وايت نظيفة خالية من التوهج ونصوص واضحة ومريحة للعين خلال العمل النهاري.
              </p>
            </div>
            {resolvedColorMode === 'light' && (
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </button>
        </div>

        {/* Independent High Contrast Toggle */}
        <div className="pt-4 border-t border-[var(--divider-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Contrast className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-[var(--text-primary)]">
                  وضع التباين العالي (High Contrast)
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  مستقل عن الوضع الليلي العادي
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                يرفع تباين النصوص والحدود وحقول الإدخال لتحسين القراءة، ويمكن تفعيله أو إيقافه بشكل منفصل في الوضع الفاتح أو الليلي.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(isHighContrast)}
            data-testid="account-high-contrast-switch"
            onClick={() => {
              const nextVal = !isHighContrast;
              setHighContrast?.(nextVal);
              const msg = nextVal
                ? 'تم تفعيل وضع التباين العالي (High Contrast) لتحسين القراءة.'
                : 'تم إيقاف وضع التباين العالي والعودة للتباين القياسي.';
              setStatusMessage(msg);
              onShowToast?.(msg);
            }}
            className={`px-4 py-2 rounded-xl border text-xs font-black flex items-center gap-2.5 cursor-pointer shrink-0 whitespace-nowrap transition-colors ${
              isHighContrast
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400'
                : 'bg-[var(--surface-subtle)] hover:bg-[var(--card-bg-hover)] text-[var(--text-primary)] border-[var(--card-border)]'
            }`}
          >
            <span>{isHighContrast ? 'مفعل الآن' : 'تفعيل التباين العالي'}</span>
            <span
              className={`w-9 h-5 rounded-full p-0.5 flex items-center ${
                isHighContrast ? 'bg-emerald-300 justify-start' : 'bg-slate-600 justify-end'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white block" />
            </span>
          </button>
        </div>
      </div>

      {/* Performance Mode Card (Low-bandwidth / Reduced-motion optimization) */}
      <div
        aria-label="وضع الأداء والإنترنت الضعيف"
        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <Gauge className="w-5 h-5 text-emerald-400" />
              <span>وضع الأداء (Performance Mode)</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              يعطّل الرسوم المتحركة والانتقالات غير الضرورية ويؤجّل تحميل المكونات غير المرئية خارج الشاشة بشكل أكثر صرامة لتسريع الاستجابة وتوفير البيانات في ظروف الإنترنت الضعيفة.
            </p>
            {isSlowNetworkDetected && (
              <p className="text-[11px] font-bold text-amber-400">
                تم رصد اتصال بطيء أو وضع توفير البيانات (Save-Data) في متصفحك.
              </p>
            )}
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isPerformanceMode}
            data-testid="settings-performance-mode-switch"
            onClick={() => {
              const nextVal = !isPerformanceMode;
              setPerformanceMode(nextVal);
              const msg = nextVal
                ? 'تم تفعيل وضع الأداء — تم تعطيل الرسوم المتحركة وتأجيل تحميل المكونات غير المرئية.'
                : 'تم إيقاف وضع الأداء واستعادة الحركة والتحميل القياسي.';
              setStatusMessage(msg);
              onShowToast?.(msg);
            }}
            className={`px-4 py-2 rounded-xl border text-xs font-black flex items-center gap-2.5 cursor-pointer shrink-0 whitespace-nowrap transition-colors ${
              isPerformanceMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                : 'bg-[var(--surface-subtle)] hover:bg-[var(--card-bg-hover)] text-[var(--text-primary)] border-[var(--card-border)]'
            }`}
          >
            <span>{isPerformanceMode ? 'مفعل الآن' : 'تفعيل وضع الأداء'}</span>
            <span
              className={`w-9 h-5 rounded-full p-0.5 flex items-center ${
                isPerformanceMode ? 'bg-emerald-300 justify-start' : 'bg-slate-600 justify-end'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white block" />
            </span>
          </button>
        </div>
      </div>

      {/* Notification Channels Section: WhatsApp vs Browser */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-5 shadow-sm">
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

      {/* Amazon SP-API Settings Section (Server-side Supabase Edge Function) */}
      <div
        aria-label="إعدادات ربط أمازون SP-API"
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>ربط أمازون SP-API الرسمي (Production Credentials)</span>
            </h2>
            <p className="text-xs text-slate-400">
              تُستخدم مفاتيح التطبيق (Client ID و Client Secret و Application ID) مع Refresh Token الخاص بكل تاجر للسحب المباشر من خادم Amazon SP-API.
            </p>
          </div>
          <span
            className={`text-xs font-black ${
              isAmazonSpApiConfigured(spApiCreds) ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isAmazonSpApiConfigured(spApiCreds) ? 'بيانات الربط مكتملة' : 'بانتظار إدخال المفاتيح'}
          </span>
        </div>

        {/* Amazon Linked Account Security Warning */}
        <div
          role="note"
          data-testid="founder-amazon-warning"
          className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-100"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-black text-rose-300">{FOUNDER_AMAZON_WARNING_TEXT}</p>
            <p className="text-rose-200/85 leading-relaxed">
              لا تدخل على Seller Central بحساب التاجر أبداً لتجنب ربط أو إغلاق الحسابين من أمازون. الطريقة الوحيدة المعتمدة: التاجر يدخل بنفسه على حسابه ويوافق على رادار عبر SP-API OAuth، والمؤسس يستلم Refresh Token فقط.
            </p>
          </div>
        </div>

        {/* Global Radar SP-API Keys Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
          {RADAR_GLOBAL_SP_API_BANNER}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sp-api-client-id"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              Client ID
            </label>
            <input
              id="sp-api-client-id"
              type="text"
              dir="ltr"
              value={spApiCreds.clientId}
              onChange={(e) =>
                setSpApiCreds((prev) => ({ ...prev, clientId: e.target.value }))
              }
              placeholder="amzn1.application-oa2-client..."
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label
              htmlFor="sp-api-client-secret"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              Client Secret
            </label>
            <div className="relative">
              <input
                id="sp-api-client-secret"
                type={showSpApiSecrets ? 'text' : 'password'}
                dir="ltr"
                value={spApiCreds.clientSecret}
                onChange={(e) =>
                  setSpApiCreds((prev) => ({ ...prev, clientSecret: e.target.value }))
                }
                placeholder="amzn1.oa2-cs.v1..."
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowSpApiSecrets((s) => !s)}
                aria-label="إظهار أو إخفاء المفاتيح"
                className="absolute left-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
              >
                {showSpApiSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="sp-api-application-id"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              Application ID
            </label>
            <input
              id="sp-api-application-id"
              type="text"
              dir="ltr"
              value={spApiCreds.applicationId || ''}
              onChange={(e) =>
                setSpApiCreds((prev) => ({ ...prev, applicationId: e.target.value }))
              }
              placeholder="amzn1.sp.solution..."
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label
              htmlFor="sp-api-marketplace-id"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              Marketplace ID
            </label>
            <input
              id="sp-api-marketplace-id"
              type="text"
              dir="ltr"
              value={spApiCreds.marketplaceId || DEFAULT_MARKETPLACE_ID}
              onChange={(e) =>
                setSpApiCreds((prev) => ({ ...prev, marketplaceId: e.target.value }))
              }
              placeholder={DEFAULT_MARKETPLACE_ID}
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="sp-api-iam-arn"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              IAM ARN
            </label>
            <input
              id="sp-api-iam-arn"
              type="text"
              dir="ltr"
              value={spApiCreds.iamArn || ''}
              onChange={(e) =>
                setSpApiCreds((prev) => ({ ...prev, iamArn: e.target.value }))
              }
              placeholder="arn:aws:iam::..."
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {spApiFeedback && (
          <div
            role="status"
            className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-xs font-bold text-amber-200"
          >
            {spApiFeedback}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleSaveSpApiCreds}
            className="min-h-[40px] px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ إعدادات SP-API</span>
          </button>

          <button
            type="button"
            onClick={handleSyncViaSpApiEdge}
            disabled={isSyncingSpApi || isFetchingCompetitors}
            className="min-h-[40px] px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-black flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingSpApi ? 'animate-spin' : ''}`} />
            <span>سحب عبر SP-API (Edge Function)</span>
          </button>

          <button
            type="button"
            data-testid="connect-and-fetch-competitors-btn"
            onClick={handleConnectAndFetchCompetitorPrices}
            disabled={isFetchingCompetitors || isSyncingSpApi}
            className="min-h-[40px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingCompetitors ? 'animate-spin' : ''}`} />
            <span>{isFetchingCompetitors ? 'جاري جلب أسعار المنافسين...' : 'ربط وجلب أسعار المنافسين'}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Wipe App */}
      <div className="bg-rose-950/30 border-2 border-rose-500/50 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 border-b border-rose-500/30 pb-4">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-black text-rose-200">
              تفريغ التطبيق بالكامل - للبدء من جديد
            </h2>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              سيتم حذف كل المنتجات والفواتير وأسعار المنافسين - ولن يمكن التراجع - سيبقى حساب المؤسس ومفاتيح رادار (Client ID / Client Secret) فقط
            </p>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            data-testid="wipe-app-btn"
            onClick={() => {
              setWipeConfirmInput('');
              setShowWipeModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition-colors shadow-md"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>تفريغ التطبيق بالكامل</span>
          </button>
        </div>
      </div>

      {/* Wipe Confirmation Modal */}
      {showWipeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد تفريغ التطبيق بالكامل"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl font-['Cairo']" dir="rtl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-rose-500/30 pb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-white">تأكيد تفريغ التطبيق بالكامل</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تحذير خطير: سيتم حذف جميع التجار والمنتجات والفواتير وأسعار المنافسين نهائياً ولن يمكن استرجاعها. للتأكيد، اكتب كلمة: <strong className="text-rose-400 font-bold">حذف</strong> في الحقل أدناه:
            </p>
            <div>
              <input
                type="text"
                data-testid="wipe-confirm-input"
                value={wipeConfirmInput}
                onChange={(e) => setWipeConfirmInput(e.target.value)}
                placeholder="اكتب كلمة: حذف"
                className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-center focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                disabled={isWiping}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                data-testid="confirm-wipe-btn"
                onClick={handleWipeExecution}
                disabled={wipeConfirmInput.trim() !== 'حذف' || isWiping}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
              >
                {isWiping ? 'جاري التفريغ...' : 'تأكيد الحذف النهائي'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountSettingsPage;
