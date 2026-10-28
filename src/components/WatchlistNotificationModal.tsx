import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  X,
  ExternalLink,
  Volume2,
  RefreshCw,
  Clock,
  Trash2,
  Bookmark,
  CheckCircle2,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import {
  isWebNotificationSupported,
  getWebNotificationPermission,
  requestWebNotificationPermission,
  getStoredWatchlist,
  getWatchlistNotificationLogs,
  getWatchlistNotificationPreferences,
  saveWatchlistNotificationPreferences,
  simulateWatchlistPriceChange,
  clearWatchlistNotificationLogs,
  markWatchlistNotificationAsRead,
  removeFromWatchlist,
  WatchlistPriceNotificationLog,
  WatchlistNotificationPreferences
} from '../services/watchlistNotificationService';
import { WatchlistItem } from '../types';
import { ToolbarTooltip } from './ToolbarTooltip';

interface WatchlistNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRadar?: (productId: string) => void;
  onShowToast?: (message: string) => void;
}

type TabType = 'alerts' | 'watched' | 'settings';

export const WatchlistNotificationModal: React.FC<WatchlistNotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToRadar,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('alerts');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [logs, setLogs] = useState<WatchlistPriceNotificationLog[]>([]);
  const [prefs, setPrefs] = useState<WatchlistNotificationPreferences>(getWatchlistNotificationPreferences());

  const refreshData = () => {
    setIsSupported(isWebNotificationSupported());
    setPermission(getWebNotificationPermission());
    setWatchlist(getStoredWatchlist());
    setLogs(getWatchlistNotificationLogs());
    setPrefs(getWatchlistNotificationPreferences());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleLogAdded = () => {
      setLogs(getWatchlistNotificationLogs());
      setWatchlist(getStoredWatchlist());
    };
    const handleWatchlistUpdated = () => {
      setWatchlist(getStoredWatchlist());
    };

    window.addEventListener('merchant_watchlist_notification_logged', handleLogAdded);
    window.addEventListener('merchant_watchlist_updated', handleWatchlistUpdated);
    window.addEventListener('merchant_watchlist_price_changed', handleLogAdded);

    return () => {
      window.removeEventListener('merchant_watchlist_notification_logged', handleLogAdded);
      window.removeEventListener('merchant_watchlist_updated', handleWatchlistUpdated);
      window.removeEventListener('merchant_watchlist_price_changed', handleLogAdded);
    };
  }, []);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const res = await requestWebNotificationPermission();
      setPermission(res.permission);
      if (res.granted) {
        if (onShowToast) onShowToast('تم تفعيل إشعارات الويب للمتصفح بنجاح! 🔔');
      } else if (res.error) {
        if (onShowToast) onShowToast(res.error);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSimulatePriceDrop = async (productId?: string) => {
    setIsSimulating(true);
    try {
      const res = await simulateWatchlistPriceChange(productId);
      refreshData();
      if (onShowToast) {
        onShowToast(res.message);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRemoveWatchedItem = (productId: string) => {
    removeFromWatchlist(productId);
    refreshData();
    if (onShowToast) onShowToast('تمت إزالة المنتج من قائمة المتابعة.');
  };

  const handleClearLogs = () => {
    clearWatchlistNotificationLogs();
    setLogs([]);
    if (onShowToast) onShowToast('تم مسح سجل تنبيهات الأسعار.');
  };

  const unreadCount = logs.filter((l) => !l.isRead).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border-2 border-indigo-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-['Cairo','Alexandria']">
                  مركز إشعارات وتغيرات أسعار المنتجات المراقبة
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono">
                  Web Notifications API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تنبيهات فورية لسطح المكتب والمتصفح عند أي هبوط أو ارتفاع في أسعار المنافسين لمنتجات قائمة المتابعة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission Status Strip */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">حالة إشعارات المتصفح:</span>
            {!isSupported ? (
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black">
                ❌ المتصفح لا يدعم Notification API
              </span>
            ) : permission === 'granted' ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>مفعلة وتعمل لحظياً (Granted)</span>
              </span>
            ) : permission === 'denied' ? (
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black flex items-center gap-1.5">
                <BellOff className="w-3.5 h-3.5 text-rose-400" />
                <span>محظورة بالمتصفح (يرجى السماح من شريط العنوان)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>بحاجة لمنح الإذن (Default)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {permission !== 'granted' && isSupported && (
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isRequesting ? 'جاري الطلب...' : 'تفعيل إشعارات المتصفح 🔔'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSimulatePriceDrop()}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-700/30 cursor-pointer"
              title="محاكاة هبوط سعر منافس لمنتج مراقب واختبار إشعار المتصفح الفوري"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>{isSimulating ? 'جاري الرصد...' : '🧪 تجربة رصد هبوط سعر'}</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black transition relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>سجل تنبيهات الأسعار</span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-300 font-mono">
                {logs.length}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('watched')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black transition relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'watched'
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>المنتجات المراقبة ({watchlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black transition relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>إعدادات التنبيهات</span>
          </button>

          {activeTab === 'alerts' && logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="mr-auto mb-3 text-[11px] text-slate-500 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح السجل</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: Live Alerts Log */}
          {activeTab === 'alerts' && (
            <div>
              {logs.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Bell className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-white">لا توجد تنبيهات أسعار مرصودة حتى الآن</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    سيقوم النظام بإرسال إشعارات فورية عبر Web Notifications API عند أي تغير في أسعار المنافسين للمنتجات المضافة للمتابعة.
                  </p>
                  <button
                    onClick={() => handleSimulatePriceDrop()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md cursor-pointer"
                  >
                    تجربة إرسال إشعار فوري الآن 🧪
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => {
                    const isDrop = log.trend === 'down';
                    return (
                      <div
                        key={log.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDrop
                            ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400/60'
                            : 'bg-sky-950/20 border-sky-500/40 hover:border-sky-400/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                isDrop ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'
                              }`}
                            >
                              {isDrop ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                    isDrop ? 'bg-emerald-500/30 text-emerald-200' : 'bg-sky-500/30 text-sky-200'
                                  }`}
                                >
                                  {isDrop ? `📉 هبوط ${log.percentChange}%` : `📈 ارتفاع ${log.percentChange}%`}
                                </span>
                                <span className="text-xs text-slate-400 font-bold">
                                  لدى: <strong className="text-white">{log.competitorName}</strong> ({log.platformName})
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(log.timestamp).toLocaleTimeString('ar-EG', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-white line-clamp-1">{log.productTitle}</h4>

                              <div className="flex items-center gap-3 text-xs pt-0.5">
                                <span className="text-slate-400">
                                  السعر السابق: <span className="line-through text-slate-400">{log.oldPrice.toLocaleString()} {log.currency}</span>
                                </span>
                                <span className={`font-black ${isDrop ? 'text-emerald-400' : 'text-sky-400'}`}>
                                  السعر الجديد: {log.newPrice.toLocaleString()} {log.currency}
                                </span>
                                <span className="text-amber-300 font-bold">
                                  (الفارق: {log.priceDiff.toLocaleString()} {log.currency})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {onNavigateToRadar && (
                              <button
                                type="button"
                                onClick={() => {
                                  markWatchlistNotificationAsRead(log.id);
                                  onNavigateToRadar(log.productId);
                                  onClose();
                                }}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <span>فتح بالرادار</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Watched Products */}
          {activeTab === 'watched' && (
            <div className="space-y-3">
              {watchlist.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                  <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">قائمة المتابعة فارغة حالياً</h4>
                  <p className="text-xs text-slate-400">
                    انقر على زر "حفظ بالمتابعة" في رادار الأسعار أو كتالوج المنتجات لتفعيل تتبع الأسعار التلقائي.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {watchlist.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.imageUrl || '/pwa-192x192.png'}
                          alt={item.product?.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                            {item.product?.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                            <span>آخر سعر: <strong className="text-sky-300 font-mono">{item.lastCheckedPrice.toLocaleString()} ج.م</strong></span>
                            {item.targetAlertPrice && (
                              <span>السعر المستهدف للتنبيه: <strong className="text-amber-300 font-mono">{item.targetAlertPrice.toLocaleString()} ج.م</strong></span>
                            )}
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              مراقبة نشطة
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSimulatePriceDrop(item.productId)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-emerald-300 transition cursor-pointer"
                          title="محاكاة هبوط سعر هذا المنتج فوراً لاختبار التنبيه"
                        >
                          <TrendingDown className="w-4 h-4" />
                        </button>

                        {onNavigateToRadar && (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateToRadar(item.productId);
                              onClose();
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 transition cursor-pointer"
                            title="عرض في رادار الأسعار"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveWatchedItem(item.productId)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="إزالة من المراقبة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>تفضيلات Web Notifications API</span>
                </h4>

                <div className="space-y-3 pt-2 text-xs">
                  <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer">
                    <div>
                      <span className="text-white font-bold block">إشعارات المتصفح لسطح المكتب والهاتف</span>
                      <span className="text-slate-400 text-[11px]">إرسال إشعار فوري عند تغير سعر أي منتج في قائمة المتابعة</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.webNotificationsEnabled}
                      onChange={(e) => {
                        const updated = saveWatchlistNotificationPreferences({
                          webNotificationsEnabled: e.target.checked,
                        });
                        setPrefs(updated);
                        if (e.target.checked && permission !== 'granted') {
                          handleRequestPermission();
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer">
                    <div>
                      <span className="text-white font-bold block">التنبيه عند هبوط الأسعار فقط (Price Drop Only)</span>
                      <span className="text-slate-400 text-[11px]">تجاهل الزيادات وإرسال التنبيهات عند انخفاض أسعار المنافسين حصراً</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.notifyOnPriceDropOnly}
                      onChange={(e) => {
                        const updated = saveWatchlistNotificationPreferences({
                          notifyOnPriceDropOnly: e.target.checked,
                        });
                        setPrefs(updated);
                      }}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">الحد الأدنى لنسبة تغير السعر للتنبيه</span>
                      <span className="font-mono text-indigo-400 font-bold">{prefs.minPriceDropPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={prefs.minPriceDropPercentage}
                      onChange={(e) => {
                        const updated = saveWatchlistNotificationPreferences({
                          minPriceDropPercentage: Number(e.target.value),
                        });
                        setPrefs(updated);
                      }}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      لن يتم إرسال إشعار بالتغيرات الطفيفة جداً الأقل من {prefs.minPriceDropPercentage}% لتفادي الإزعاج
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>متوافق مع كروم، سفاري، وفايرفوكس بدون الحاجة إلى اتصال دائم بالخادم</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
