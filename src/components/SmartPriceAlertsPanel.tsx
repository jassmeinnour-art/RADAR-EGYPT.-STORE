import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BellRing,
  CheckCheck,
  RefreshCw,
  ArrowLeft,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import {
  SmartPriceAlert,
  PriceAlertSettings,
  getSmartPriceAlerts,
  getPriceAlertSettings,
  savePriceAlertSettings,
  markSmartPriceAlertRead,
  markAllSmartPriceAlertsRead,
  dismissSmartPriceAlert,
  scanCachedProductsForPriceAlerts,
  SMART_PRICE_ALERTS_UPDATED_EVENT,
} from '../utils/smartPriceAlerts';
import { navigate } from '../utils/navigation';

interface SmartPriceAlertsPanelProps {
  compact?: boolean;
  onShowToast?: (msg: string) => void;
}

export const SmartPriceAlertsPanel: React.FC<SmartPriceAlertsPanelProps> = ({
  compact = false,
  onShowToast,
}) => {
  const [alerts, setAlerts] = useState<SmartPriceAlert[]>(() => getSmartPriceAlerts());
  const [settings, setSettings] = useState<PriceAlertSettings>(() => getPriceAlertSettings());
  const [minPriceInput, setMinPriceInput] = useState<string>(() =>
    String(getPriceAlertSettings().minPriceLimit || '')
  );
  const [percentInput, setPercentInput] = useState<string>(() =>
    String(getPriceAlertSettings().changePercentThreshold || 10)
  );
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const syncFromStore = () => {
    setAlerts(getSmartPriceAlerts());
    const currentSettings = getPriceAlertSettings();
    setSettings(currentSettings);
  };

  useEffect(() => {
    syncFromStore();
    window.addEventListener(SMART_PRICE_ALERTS_UPDATED_EVENT, syncFromStore);
    return () => {
      window.removeEventListener(SMART_PRICE_ALERTS_UPDATED_EVENT, syncFromStore);
    };
  }, []);

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const visibleAlerts = compact ? alerts.slice(0, 4) : alerts.slice(0, 20);

  const handleSaveAndScan = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPercent = Math.max(1, Math.min(100, parseFloat(percentInput) || 10));
    const parsedMinPrice = Math.max(0, parseFloat(minPriceInput) || 0);
    const updated = savePriceAlertSettings({
      changePercentThreshold: parsedPercent,
      minPriceLimit: parsedMinPrice,
      enabled: true,
    });
    setSettings(updated);
    setPercentInput(String(updated.changePercentThreshold));
    setMinPriceInput(updated.minPriceLimit > 0 ? String(updated.minPriceLimit) : '');

    const newlyFound = scanCachedProductsForPriceAlerts(updated);
    syncFromStore();
    if (newlyFound.length > 0) {
      onShowToast?.(`🔔 تم رصد ${newlyFound.length} تنبيه تغير سعر جديد بناءً على السعر التاريخي والحد المحدد.`);
    } else {
      onShowToast?.('✅ تم تحديث إعدادات التنبيه وفحص المنتجات المسحوبة.');
    }
    setShowSettings(false);
  };

  const handleScanNow = () => {
    const newlyFound = scanCachedProductsForPriceAlerts(settings);
    syncFromStore();
    if (newlyFound.length > 0) {
      onShowToast?.(`🔔 تم رصد ${newlyFound.length} تنبيه تغير سعر جديد!`);
    } else {
      onShowToast?.('ℹ️ لا توجد تغيرات سعرية جديدة تتجاوز الحدود المضبوطة حالياً.');
    }
  };

  const getReasonLabel = (alert: SmartPriceAlert): string => {
    switch (alert.triggerReason) {
      case 'below_and_percent':
        return `انخفض عن الحد (${alert.thresholdLimit?.toLocaleString('ar-EG')} ج.م) وتغير ${alert.absChangePercent}%`;
      case 'below_threshold':
        return `انخفض عن الحد المحدد (${alert.thresholdLimit?.toLocaleString('ar-EG')} ج.م)`;
      case 'percent_surge':
        return `ارتفاع ملحوظ عن السعر التاريخي (+${alert.absChangePercent}%)`;
      default:
        return `هبوط ملحوظ عن السعر التاريخي (-${alert.absChangePercent}%)`;
    }
  };

  return (
    <section
      aria-label="نظام تنبيهات الأسعار الذكي"
      className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl text-right font-['Cairo']"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              unreadCount > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base text-white">
                نظام تنبيهات الأسعار الذكي (المؤسس)
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs font-black text-amber-400 tabular-nums">
                  · {unreadCount} تنبيه غير مقروء
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              مقارنة الأسعار المسحوبة بالسعر التاريخي — تنبيه فوري عند تغير {settings.changePercentThreshold}% فأكثر
              {settings.minPriceLimit > 0
                ? ` أو الانخفاض عن ${settings.minPriceLimit.toLocaleString('ar-EG')} ج.م`
                : ' أو الانخفاض عن الحد المحدد'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!compact && (
            <>
              <button
                type="button"
                onClick={() => setShowSettings((prev) => !prev)}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>ضبط الحدود</span>
              </button>
              <button
                type="button"
                onClick={handleScanNow}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>فحص الأسعار</span>
              </button>
            </>
          )}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => {
                markAllSmartPriceAlertsRead();
                syncFromStore();
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>تحديد كمقروء</span>
            </button>
          )}
          {compact && (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>إدارة التنبيهات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Settings Bar */}
      {showSettings && !compact && (
        <form
          onSubmit={handleSaveAndScan}
          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              نسبة تغير السعر للتنبيه (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              dir="ltr"
              value={percentInput}
              onChange={(e) => setPercentInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              الحد الأدنى للسعر (ج.م — 0 للإلغاء)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              dir="ltr"
              placeholder="مثال: 500"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-colors"
          >
            حفظ وفحص الأسعار
          </button>
        </form>
      )}

      {/* Alerts List or Empty State */}
      {visibleAlerts.length === 0 ? (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center space-y-1.5">
          <p className="text-xs font-bold text-slate-300">
            لا توجد تنبيهات تغير أسعار حالياً
          </p>
          <p className="text-[11px] text-slate-400">
            عند سحب منتجات أي تاجر، سيتم مقارنة السعر الجديد بالسعر التاريخي وإظهار تنبيه تلقائياً إذا تغير السعر بنسبة{' '}
            <span className="text-amber-400 font-bold tabular-nums">{settings.changePercentThreshold}%</span>{' '}
            فأكثر أو انخفض عن الحد المحدد.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleAlerts.map((alert) => {
            const isDrop = alert.changePercent < 0 || alert.triggerReason === 'below_threshold';
            return (
              <div
                key={alert.id}
                data-testid={`price-alert-item-${alert.sku}`}
                className={`p-4 rounded-2xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  alert.severity === 'critical'
                    ? 'bg-rose-950/35 border-rose-500/45'
                    : 'bg-amber-950/25 border-amber-500/40'
                } ${alert.isRead ? 'opacity-70' : ''}`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isDrop
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {alert.triggerReason === 'below_threshold' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isDrop ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-xs sm:text-sm text-white font-black truncate max-w-xs sm:max-w-md">
                        {alert.productTitle}
                      </strong>
                      <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                        {alert.sku}
                      </span>
                      {!alert.isRead && (
                        <span className="text-[10px] font-black text-amber-400">
                          · جديد
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-200">
                      {getReasonLabel(alert)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 tabular-nums">
                      <span>
                        السعر التاريخي:{' '}
                        <strong className="text-slate-200">
                          {alert.historicalPrice.toLocaleString('ar-EG')} ج.م
                        </strong>
                      </span>
                      <span aria-hidden="true">←</span>
                      <span>
                        السعر الحالي:{' '}
                        <strong className={isDrop ? 'text-rose-300' : 'text-amber-300'}>
                          {alert.currentPrice.toLocaleString('ar-EG')} ج.م
                        </strong>
                      </span>
                      {alert.absChangePercent > 0 && (
                        <span
                          dir="ltr"
                          className={`font-mono font-black ${
                            isDrop ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          ({alert.changePercent > 0 ? `+${alert.changePercent}` : alert.changePercent}%)
                        </span>
                      )}
                      <span className="text-slate-400">
                        · {new Date(alert.detectedAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => navigate(`/products?trader_id=${encodeURIComponent(alert.traderId)}`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                  >
                    عرض المنتج
                  </button>
                  {!alert.isRead && (
                    <button
                      type="button"
                      onClick={() => {
                        markSmartPriceAlertRead(alert.id);
                        syncFromStore();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                    >
                      تمت المراجعة
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      dismissSmartPriceAlert(alert.id);
                      syncFromStore();
                    }}
                    aria-label="إغلاق التنبيه"
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SmartPriceAlertsPanel;
