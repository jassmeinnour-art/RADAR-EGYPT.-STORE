import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  RefreshCw, 
  Check, 
  Copy, 
  Sparkles, 
  X, 
  Volume2, 
  Package, 
  CheckCircle2, 
  Radio, 
  Laptop, 
  Smartphone,
  MessageCircle,
  SlidersHorizontal,
  Award,
  FileText,
  Trash2,
  Send
} from 'lucide-react';
import { 
  getBrowserNotificationPermission, 
  getPushSettings, 
  savePushSettings, 
  getStoredFcmToken, 
  requestPushNotificationPermission, 
  sendTestPushNotification, 
  getPushNotificationHistory, 
  clearPushNotificationHistory,
  FcmPushSettings,
  AlertChannelPreferences,
  DEFAULT_ALERT_CHANNEL_PREFERENCES,
  PushNotificationRecord 
} from '../services/fcmNotificationService';
import confetti from 'canvas-confetti';

interface PushNotificationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onPlayAlertSound?: () => void;
  language?: 'ar' | 'en';
}

type ModalTab = 'preferences' | 'fcm_setup';

export const PushNotificationManagerModal: React.FC<PushNotificationManagerModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onPlayAlertSound,
  language = 'ar'
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('preferences');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<FcmPushSettings>(getPushSettings());
  const [fcmToken, setFcmToken] = useState<string | null>(getStoredFcmToken());
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<PushNotificationRecord[]>([]);
  const [testingType, setTestingType] = useState<string | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState<string>(() => getPushSettings().whatsappPhoneNumber || '+201012345678');

  const isAr = language === 'ar';

  useEffect(() => {
    if (isOpen) {
      const currentSettings = getPushSettings();
      setPermission(getBrowserNotificationPermission());
      setSettings(currentSettings);
      setWhatsappPhone(currentSettings.whatsappPhoneNumber || '+201012345678');
      setFcmToken(getStoredFcmToken());
      setHistory(getPushNotificationHistory());
    }
  }, [isOpen]);

  useEffect(() => {
    const handlePushReceived = (e: any) => {
      const record = e.detail;
      if (record) {
        setHistory(prev => [record, ...prev].slice(0, 50));
      }
    };
    window.addEventListener('merchant-radar-push-received', handlePushReceived);
    return () => {
      window.removeEventListener('merchant-radar-push-received', handlePushReceived);
    };
  }, []);

  if (!isOpen) return null;

  const channelPrefs: AlertChannelPreferences = {
    ...DEFAULT_ALERT_CHANNEL_PREFERENCES,
    ...(settings.channelPreferences || {})
  };

  const handleToggleSetting = (key: keyof FcmPushSettings) => {
    const nextVal = !settings[key];
    const updated = savePushSettings({ [key]: nextVal });
    setSettings(updated);
    onShowToast(isAr ? 'تم تحديث تفضيلات التنبيهات بنجاح ✅' : 'Push notification settings updated ✅');
  };

  const handleToggleChannelPreference = (
    categoryKey: keyof AlertChannelPreferences,
    channel: 'appPush' | 'whatsapp'
  ) => {
    const currentCat = channelPrefs[categoryKey] || { appPush: true, whatsapp: true };
    const updatedCat = {
      ...currentCat,
      [channel]: !currentCat[channel]
    };
    const nextChannelPreferences: AlertChannelPreferences = {
      ...channelPrefs,
      [categoryKey]: updatedCat
    };

    // Keep legacy top-level flags synced with appPush toggles
    const extraUpdates: Partial<FcmPushSettings> = {
      channelPreferences: nextChannelPreferences
    };
    if (categoryKey === 'competitorPriceChange') {
      extraUpdates.notifyOnCompetitorPriceChange = updatedCat.appPush;
    } else if (categoryKey === 'platformSyncError') {
      extraUpdates.notifyOnPlatformSyncError = updatedCat.appPush;
    } else if (categoryKey === 'inventoryReorder') {
      extraUpdates.notifyOnInventoryReorder = updatedCat.appPush;
    }

    const updated = savePushSettings(extraUpdates);
    setSettings(updated);
    onShowToast(
      isAr
        ? `تم تحديث تفضيلات استلام الإشعار عبر ${channel === 'whatsapp' ? 'واتساب 💬' : 'إشعارات التطبيق 🔔'}`
        : `Updated ${channel === 'whatsapp' ? 'WhatsApp' : 'App Push'} preference`
    );
  };

  const handleEnableAllChannel = (channel: 'appPush' | 'whatsapp', enable: boolean) => {
    const nextChannelPreferences: AlertChannelPreferences = {
      competitorPriceChange: { ...channelPrefs.competitorPriceChange, [channel]: enable },
      buyBoxLostOrWon: { ...channelPrefs.buyBoxLostOrWon, [channel]: enable },
      priceFloorGuardrail: { ...channelPrefs.priceFloorGuardrail, [channel]: enable },
      inventoryReorder: { ...channelPrefs.inventoryReorder, [channel]: enable },
      platformSyncError: { ...channelPrefs.platformSyncError, [channel]: enable },
      dailyWeeklySummary: { ...channelPrefs.dailyWeeklySummary, [channel]: enable },
    };
    const updated = savePushSettings({
      channelPreferences: nextChannelPreferences,
      ...(channel === 'whatsapp' ? { whatsappAlertsEnabled: enable } : {}),
    });
    setSettings(updated);
    onShowToast(
      isAr
        ? enable
          ? `تم تفعيل كافة التنبيهات عبر ${channel === 'whatsapp' ? 'واتساب 💬' : 'إشعارات التطبيق 🔔'}`
          : `تم إيقاف كافة التنبيهات عبر ${channel === 'whatsapp' ? 'واتساب' : 'إشعارات التطبيق'}`
        : 'Channel preferences updated'
    );
  };

  const handleSaveWhatsappPhone = () => {
    const updated = savePushSettings({
      whatsappPhoneNumber: whatsappPhone.trim(),
      whatsappAlertsEnabled: true
    });
    setSettings(updated);
    onShowToast(
      isAr
        ? `تم حفظ رقم واتساب (${whatsappPhone.trim()}) لاستقبال تنبيهات الرادار الفورية ✅`
        : 'WhatsApp number saved successfully ✅'
    );
  };

  const handleSendTestWhatsapp = () => {
    const cleanPhone = whatsappPhone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      onShowToast(isAr ? 'يرجى إدخال رقم واتساب صحيح أولاً 📱' : 'Please enter a valid WhatsApp number');
      return;
    }
    if (onPlayAlertSound && settings.notifySoundEnabled) {
      onPlayAlertSound();
    }
    const record: PushNotificationRecord = {
      id: `wa_test_${Date.now()}`,
      title: isAr ? 'اختبار تنبيه واتساب الفوري 💬' : 'WhatsApp Alert Test 💬',
      body: isAr
        ? `تم إرسال رسالة اختبار تفضيلات الإشعارات إلى الرقم (${cleanPhone}) بنجاح.`
        : `Test WhatsApp alert dispatched to ${cleanPhone}.`,
      type: 'test_alert',
      timestamp: new Date().toISOString(),
      platform: 'WhatsApp API'
    };
    setHistory(prev => [record, ...prev].slice(0, 50));
    onShowToast(
      isAr
        ? `💬 تم إرسال تنبيه تجريبي عبر واتساب إلى (${cleanPhone}) وفق تفضيلاتك المختارة!`
        : `Test WhatsApp notification dispatched to ${cleanPhone}!`
    );
  };

  const handleEnablePush = async () => {
    setIsRequesting(true);
    try {
      const res = await requestPushNotificationPermission();
      setPermission(res.permission);
      if (res.success && res.token) {
        setFcmToken(res.token);
        setSettings(getPushSettings());
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.3 } });
        onShowToast(
          isAr
            ? 'تم تفعيل تنبيهات المتصفح الفورية (FCM) بنجاح 🔔 ستصلك الإشعارات حتى عند إغلاق التطبيق!'
            : 'FCM Push Notifications enabled successfully 🔔'
        );
      } else if (res.error) {
        onShowToast(res.error);
      }
    } catch (err: any) {
      onShowToast(err?.message || (isAr ? 'تعذر تفعيل الإشعارات' : 'Failed to enable notifications'));
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCopyToken = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setIsCopied(true);
    onShowToast(isAr ? 'تم نسخ رمز الجهاز (FCM Token) إلى الحافظة 📋' : 'FCM Token copied to clipboard 📋');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSendTest = async (type: 'competitor_price' | 'sync_error' | 'inventory_reorder') => {
    setTestingType(type);
    if (onPlayAlertSound && settings.notifySoundEnabled) {
      onPlayAlertSound();
    }
    const success = await sendTestPushNotification(type);
    if (success) {
      onShowToast(
        isAr 
          ? 'تم إرسال الإشعار التجريبي الفوري بنجاح 🚀 تحقق من نافذة المتصفح/الشاشة' 
          : 'Test push notification sent successfully 🚀'
      );
      setHistory(getPushNotificationHistory());
    } else {
      onShowToast(
        isAr 
          ? 'يرجى تفعيل صلاحية الإشعارات أولاً لتتمكن من استقبال التنبيهات التجريبية' 
          : 'Please grant notification permission first'
      );
    }
    setTimeout(() => setTestingType(null), 800);
  };

  const handleClearHistory = () => {
    clearPushNotificationHistory();
    setHistory([]);
    onShowToast(isAr ? 'تم إفراغ سجل الإشعارات 🗑️' : 'Notification history cleared 🗑️');
  };

  const preferenceRows: Array<{
    key: keyof AlertChannelPreferences;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    badgeAr: string;
    icon: React.ReactNode;
    iconBg: string;
  }> = [
    {
      key: 'competitorPriceChange',
      titleAr: 'هبوط وتغير أسعار المنافسين',
      titleEn: 'Competitor Price Drops & Shifts',
      descAr: 'إشعار فوري عند قيام منافس على أمازون أو نون أو جوميا بخفض سعره تحت سعرك',
      descEn: 'Instant alert when a competitor undercuts your price on Amazon, Noon, or Jumia',
      badgeAr: 'أولوية قصوى',
      icon: <TrendingDown className="w-4 h-4" />,
      iconBg: 'bg-sky-600 text-white'
    },
    {
      key: 'buyBoxLostOrWon',
      titleAr: 'تغير حالة الصندوق الذهبي (Buy Box)',
      titleEn: 'Buy Box Win / Loss Status',
      descAr: 'تنبيه لحظي عند فقدان الـ Buy Box لصالح منافس أو استعادته بنجاح',
      descEn: 'Real-time alert when Buy Box ownership changes hands',
      badgeAr: 'مهم للمبيعات',
      icon: <Award className="w-4 h-4" />,
      iconBg: 'bg-indigo-600 text-white'
    },
    {
      key: 'priceFloorGuardrail',
      titleAr: 'اقتراب أو كسر الحد الأدنى للحماية (Floor Price)',
      titleEn: 'Price Floor Guardrail Proximity',
      descAr: 'تحذير صمام الأمان عند اقتراب السعر التنافسي من تكلفة الجملة أو الحد الأدنى للربح',
      descEn: 'Guardrail warning when price approaches or breaches minimum safe floor',
      badgeAr: 'حماية رأس المال',
      icon: <ShieldCheck className="w-4 h-4" />,
      iconBg: 'bg-emerald-600 text-white'
    },
    {
      key: 'inventoryReorder',
      titleAr: 'انخفاض المخزون والوصول لحد إعادة الطلب',
      titleEn: 'Low Stock & Reorder Threshold',
      descAr: 'تنبيه عند وصول كمية أي صنف للحد الحرج أو نفاد مخزون منافس رئيسي',
      descEn: 'Alert when product stock hits reorder point or competitor goes out of stock',
      badgeAr: 'إدارة المخزون',
      icon: <Package className="w-4 h-4" />,
      iconBg: 'bg-slate-700 text-sky-300'
    },
    {
      key: 'platformSyncError',
      titleAr: 'أعطال وانقطاع مزامنة قنوات البيع (API)',
      titleEn: 'Platform API Sync Errors & Outages',
      descAr: 'إشعار تقني عند انتهاء صلاحية رمز الربط (Token) أو تعثر الاتصال بأحد المتاجر',
      descEn: 'Technical alert on token expiration or marketplace API connection failure',
      badgeAr: 'تشغيلي',
      icon: <AlertTriangle className="w-4 h-4" />,
      iconBg: 'bg-rose-600 text-white'
    },
    {
      key: 'dailyWeeklySummary',
      titleAr: 'التقارير الدورية وملخص الأسعار والأرباح',
      titleEn: 'Daily & Weekly Price/Profit Digest',
      descAr: 'ملخص تنفيذي يومي وأسبوعي بأهم فرص الربح والمنتجات الأكثر مبيعاً',
      descEn: 'Executive daily and weekly summary of top profit opportunities',
      badgeAr: 'تقرير دوري',
      icon: <FileText className="w-4 h-4" />,
      iconBg: 'bg-teal-600 text-white'
    }
  ];

  const activeWhatsappCount = Object.values(channelPrefs).filter(v => v.whatsapp).length;
  const activeAppPushCount = Object.values(channelPrefs).filter(v => v.appPush).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-inner">
                <BellRing className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black font-['Alexandria'] text-white">
                    {isAr ? 'مركز إدارة وتفضيلات الإشعارات الذكي' : 'Smart Notification Preferences & Push Hub'}
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono">
                    WhatsApp + App Push
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {isAr
                    ? 'تحكم كامل في أنواع التنبيهات التي ترغب باستقبالها عبر واتساب أو إشعارات التطبيق الفورية'
                    : 'Customize which alerts you receive via WhatsApp or native App Push notifications'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              id="tab-btn-notification-preferences"
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{isAr ? 'تفضيلات الإشعارات (واتساب والتطبيق)' : 'Notification Preferences'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'preferences' ? 'bg-slate-950 text-sky-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {activeWhatsappCount + activeAppPushCount}
              </span>
            </button>

            <button
              type="button"
              id="tab-btn-fcm-device-setup"
              onClick={() => setActiveTab('fcm_setup')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'fcm_setup'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isAr ? 'إعدادات المتصفح وسجل الرصد (FCM)' : 'Browser Setup & History'}</span>
              {history.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'fcm_setup' ? 'bg-slate-950 text-sky-300' : 'bg-slate-800 text-slate-300'
                }`}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'preferences' ? (
            <div className="space-y-5" id="notification-preferences-tab-panel">
              {/* WhatsApp Recipient Number & Quick Channel Summary */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white">
                        {isAr ? 'ربط رقم واتساب لاستقبال التنبيهات الفورية' : 'WhatsApp Alert Recipient Number'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isAr
                          ? 'يُستخدم لإرسال إشعارات تغير الأسعار والـ Buy Box والمخزون مباشرة إلى هاتفك'
                          : 'Used to dispatch real-time price, Buy Box, and stock alerts to your phone'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                      {isAr ? `واتساب: ${activeWhatsappCount}/6 مفعل` : `WhatsApp: ${activeWhatsappCount}/6`}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[11px] font-bold">
                      {isAr ? `التطبيق: ${activeAppPushCount}/6 مفعل` : `App: ${activeAppPushCount}/6`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      dir="ltr"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="+201012345678"
                      className="w-full h-10 pr-10 pl-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveWhatsappPhone}
                    className="h-10 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isAr ? 'حفظ الرقم' : 'Save Number'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestWhatsapp}
                    className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'رسالة واتساب تجريبية' : 'Test WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Channel Matrix Header & Bulk Actions */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>
                        {isAr
                          ? 'مصفوفة تفضيلات الإشعارات حسب نوع التنبيه وقناة الاستلام'
                          : 'Alert Types & Delivery Channel Matrix'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isAr
                        ? 'حدد لكل نوع من أنواع التنبيهات ما إذا كنت ترغب في استقباله عبر واتساب، أو إشعارات التطبيق، أو كليهما معاً'
                        : 'Select whether to receive each alert type via WhatsApp, App Push, or both'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleEnableAllChannel('whatsapp', activeWhatsappCount < 6)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition cursor-pointer"
                    >
                      {isAr
                        ? activeWhatsappCount < 6
                          ? 'تفعيل كل واتساب 💬'
                          : 'إيقاف كل واتساب'
                        : 'Toggle All WhatsApp'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnableAllChannel('appPush', activeAppPushCount < 6)}
                      className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-bold transition cursor-pointer"
                    >
                      {isAr
                        ? activeAppPushCount < 6
                          ? 'تفعيل كل إشعارات التطبيق 🔔'
                          : 'إيقاف كل إشعارات التطبيق'
                        : 'Toggle All App Push'}
                    </button>
                  </div>
                </div>

                {/* Alert Preference Cards List */}
                <div className="space-y-2.5">
                  {preferenceRows.map((row) => {
                    const rowPref = channelPrefs[row.key] || { appPush: true, whatsapp: false };
                    return (
                      <div
                        key={row.key}
                        className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl ${row.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                            {row.icon}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-xs sm:text-sm text-slate-900">
                                {isAr ? row.titleAr : row.titleEn}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 text-[10px] font-bold">
                                {row.badgeAr}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {isAr ? row.descAr : row.descEn}
                            </p>
                          </div>
                        </div>

                        {/* Channel Toggles: WhatsApp & App Push */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* WhatsApp Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleChannelPreference(row.key, 'whatsapp')}
                            id={`pref-whatsapp-${row.key}`}
                            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              rowPref.whatsapp
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'
                            }`}
                            title={isAr ? 'تفعيل أو إيقاف الإرسال عبر واتساب لهذا التنبيه' : 'Toggle WhatsApp alert'}
                          >
                            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                              rowPref.whatsapp ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {rowPref.whatsapp ? '✓' : '×'}
                            </span>
                          </button>

                          {/* App Push Notification Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleChannelPreference(row.key, 'appPush')}
                            id={`pref-apppush-${row.key}`}
                            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              rowPref.appPush
                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'
                            }`}
                            title={isAr ? 'تفعيل أو إيقاف إشعارات التطبيق الفورية لهذا التنبيه' : 'Toggle App Push alert'}
                          >
                            <Bell className="w-3.5 h-3.5 shrink-0" />
                            <span>{isAr ? 'إشعار التطبيق' : 'App Push'}</span>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                              rowPref.appPush ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {rowPref.appPush ? '✓' : '×'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audio Chime & Auto-Reprice Accompanying Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div
                  onClick={() => handleToggleSetting('notifySoundEnabled')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    settings.notifySoundEnabled
                      ? 'bg-sky-50/80 border-sky-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">
                        {isAr ? 'مزامنة النغمة الصوتية مع الإشعار' : 'Audio Chime Sync'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr ? 'تشغيل تنبيه صوتي مميز عند وصول إشعار حرج' : 'Play chime on critical alerts'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifySoundEnabled}
                    readOnly
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                </div>

                <div
                  onClick={() => handleToggleSetting('autoRepriceAlerts')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    settings.autoRepriceAlerts
                      ? 'bg-emerald-50/80 border-emerald-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">
                        {isAr ? 'إشعارات التعديل التلقائي للأسعار (Auto-Reprice)' : 'Auto-Reprice Action Alerts'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr ? 'إبلاغك فور تعديل السعر تلقائياً ضمن حدود الحماية' : 'Notify when autopilot adjusts prices'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoRepriceAlerts}
                    readOnly
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5" id="fcm-device-setup-tab-panel">
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                permission === 'granted'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : permission === 'denied'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-sky-50 border-sky-200 text-slate-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    permission === 'granted'
                      ? 'bg-emerald-500 text-white'
                      : permission === 'denied'
                      ? 'bg-rose-500 text-white'
                      : 'bg-sky-600 text-white'
                  }`}>
                    {permission === 'granted' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : permission === 'denied' ? (
                      <BellOff className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm">
                        {permission === 'granted'
                          ? (isAr ? 'الإشعارات مفعلة ومصرح بها 🟢' : 'Push Notifications Active 🟢')
                          : permission === 'denied'
                          ? (isAr ? 'الإشعارات محظورة في إعدادات المتصفح 🔴' : 'Notifications Blocked 🔴')
                          : (isAr ? 'بانتظار منح إذن المتصفح 🔔' : 'Permission Required 🔔')}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mt-0.5">
                      {permission === 'granted'
                        ? (isAr ? 'المتصفح متصل بـ Firebase Service Worker وجاهز لاستقبال التنبيهات في الخلفية.' : 'Browser connected to Firebase Service Worker and ready.')
                        : permission === 'denied'
                        ? (isAr ? 'يرجى النقر على أيقونة القفل بجانب رابط الموقع في المتصفح وتفعيل "الإشعارات".' : 'Please enable notifications from your browser site settings.')
                        : (isAr ? 'انقر على الزر لمنح إذن الإشعارات واستقبال التنبيهات اللحظية.' : 'Click to grant notification permission.')}
                    </p>
                  </div>
                </div>

                {permission !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    disabled={isRequesting}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    {isRequesting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <BellRing className="w-4 h-4" />
                    )}
                    <span>{isAr ? 'تفعيل تنبيهات المتصفح ⚡' : 'Enable Push Notifications ⚡'}</span>
                  </button>
                )}
              </div>

              {/* FCM Device Token & Cloud Sync Box */}
              {fcmToken && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200">
                        {isAr ? 'معرّف جهاز التاجر في FCM (Registration Token)' : 'FCM Device Token'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرمز' : 'Copy')}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 break-all select-all border border-slate-800/80">
                    {fcmToken}
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {isAr 
                        ? 'يتم مزامنة هذا الرمز سحابياً مع ملف التاجر في Firestore لإرسال إشعارات مخصصة عبر السحابة.' 
                        : 'This token is synchronized to your Firestore profile for targeted cloud messaging.'}
                    </span>
                  </p>
                </div>
              )}

              {/* Test Push Notifications Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      {isAr ? 'اختبار الإرسال الفوري لمتصفحك' : 'Live Push Simulation Test'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {isAr 
                        ? 'أرسل إشعاراً حقيقياً فورياً لاختبار صوت واهتزاز الإشعارات على جهازك أو هاتفك' 
                        : 'Send a simulated native notification to test audio and vibration'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSendTest('competitor_price')}
                    disabled={Boolean(testingType)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-sky-600" />
                    <span>{isAr ? 'تجربة إشعار هبوط سعر منافس 📉' : 'Test Competitor Drop Alert 📉'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendTest('sync_error')}
                    disabled={Boolean(testingType)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isAr ? 'تجربة إشعار عطل مزامنة API 🚨' : 'Test API Outage Alert 🚨'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendTest('inventory_reorder')}
                    disabled={Boolean(testingType)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <Package className="w-3.5 h-3.5 text-slate-700" />
                    <span>{isAr ? 'تجربة إشعار مخزون حرج 📦' : 'Test Low Stock Alert 📦'}</span>
                  </button>
                </div>
              </div>

              {/* Background Work / Service Worker Info Box */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 flex items-start gap-3 text-xs text-slate-900">
                <Laptop className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black block">
                    {isAr ? 'كيف تعمل الإشعارات والتطبيق مغلق؟' : 'How Background Push Works'}
                  </span>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    {isAr
                      ? 'بمجرد منح الإذن، يقوم التطبيق بتسجيل Service Worker مخصص (/firebase-messaging-sw.js) يتصل بسيرفرات Firebase Cloud Messaging. عندما يقوم راصد الأسعار برصد هبوط سعر في السوق أو تعثر توكن البائع، يتم إيقاظ المتصفح وعرض التنبيه فوراً حتى لو كان الموقع مغلقاً.'
                      : 'Once permission is granted, Firebase Service Worker listens in the background. When prices shift or an API disconnects, native push notifications are immediately dispatched to your operating system.'}
                  </p>
                </div>
              </div>

              {/* Recent Push Notifications Audit Log */}
              {history.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      {isAr ? `سجل الإشعارات المستلمة مؤخراً (${history.length})` : `Recent Notification History (${history.length})`}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isAr ? 'مسح السجل' : 'Clear log'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 truncate">{item.title}</span>
                            {item.platform && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold shrink-0">
                                {item.platform}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{item.body}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>FCM Ready • WhatsApp & Web Push 2.0</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isAr ? 'تم وحفظ الإعدادات' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
