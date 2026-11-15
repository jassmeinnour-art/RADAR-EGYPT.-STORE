import React, { useState } from 'react';
import { Wrench, ShieldAlert, CheckCircle2, PauseCircle, Power } from 'lucide-react';
import { useMaintenanceMode } from '../utils/maintenanceMode';

interface MaintenanceModeToggleCardProps {
  onShowToast?: (msg: string) => void;
  compact?: boolean;
}

export const MaintenanceModeToggleCard: React.FC<MaintenanceModeToggleCardProps> = ({
  onShowToast,
  compact = false,
}) => {
  const { isMaintenanceMode, maintenanceState, setMaintenanceMode } = useMaintenanceMode();
  const [reasonDraft, setReasonDraft] = useState<string>(maintenanceState.reason);

  const handleToggle = () => {
    const next = setMaintenanceMode(!isMaintenanceMode, reasonDraft);
    if (next.enabled) {
      onShowToast?.('🛠️ تم تفعيل وضع الصيانة — تم إيقاف سحب البيانات والتحديثات التلقائية.');
    } else {
      onShowToast?.('✅ تم إيقاف وضع الصيانة — عاد النظام لاستقبال عمليات السحب والتحديثات.');
    }
  };

  return (
    <section
      aria-label="التحكم في وضع الصيانة"
      data-testid="maintenance-mode-card"
      dir="rtl"
      className={`rounded-3xl border transition-all duration-200 font-['Cairo'] text-right ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
      } ${
        isMaintenanceMode
          ? 'bg-gradient-to-l from-rose-950/75 via-amber-950/35 to-slate-900/95 border-rose-500/60 shadow-xl shadow-rose-500/10'
          : 'bg-slate-900/85 border-slate-800 hover:border-orange-500/40 shadow-lg'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
              isMaintenanceMode
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : 'bg-amber-500/15 border-amber-500/35 text-amber-400'
            }`}
          >
            {isMaintenanceMode ? <PauseCircle className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white">وضع الصيانة (Maintenance Mode)</h3>
              <span
                data-testid="maintenance-status-badge"
                className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${
                  isMaintenanceMode
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isMaintenanceMode ? 'مفعل — السحب والتحديث متوقف' : 'الوضع الطبيعي نشط'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              عند التفعيل يتم إيقاف جميع عمليات <strong className="text-amber-300">سحب بيانات المتاجر</strong> و
              <strong className="text-amber-300">التحديثات التلقائية بالخلفية</strong> مؤقتاً لحماية البيانات أثناء صيانة النظام.
            </p>

            {isMaintenanceMode && maintenanceState.updatedAt && (
              <p className="text-[11px] text-rose-300/90 font-mono">
                بدأ منذ: {new Date(maintenanceState.updatedAt).toLocaleString('ar-EG')}
              </p>
            )}
          </div>
        </div>

        {/* Toggle Switch + Quick Action */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <div className="flex items-center gap-2.5 bg-slate-950/90 border border-slate-800 rounded-2xl px-3.5 py-2">
            <span className="text-xs font-bold text-slate-300">
              {isMaintenanceMode ? 'إيقاف الصيانة' : 'تفعيل الصيانة'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isMaintenanceMode}
              aria-label="تبديل وضع الصيانة"
              data-testid="maintenance-mode-toggle"
              onClick={handleToggle}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                isMaintenanceMode ? 'bg-rose-500' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isMaintenanceMode ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <label htmlFor="maintenance-reason-input" className="text-[11px] font-bold text-slate-400 shrink-0">
            سبب الصيانة:
          </label>
          <input
            id="maintenance-reason-input"
            type="text"
            value={reasonDraft}
            onChange={(e) => {
              setReasonDraft(e.target.value);
              if (isMaintenanceMode) {
                setMaintenanceMode(true, e.target.value);
              }
            }}
            placeholder="مثال: تحديث قاعدة البيانات وإعدادات السحب..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
            {isMaintenanceMode ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isMaintenanceMode ? 'الحماية مفعلة' : 'جاهز للعمل'}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export const MaintenanceModeBanner: React.FC<{
  canManage?: boolean;
  onShowToast?: (msg: string) => void;
}> = ({ canManage = false, onShowToast }) => {
  const { isMaintenanceMode, maintenanceState, setMaintenanceMode } = useMaintenanceMode();

  if (!isMaintenanceMode) return null;

  return (
    <div
      role="status"
      data-testid="global-maintenance-banner"
      dir="rtl"
      className="mb-5 rounded-2xl bg-gradient-to-l from-rose-950/90 via-amber-950/60 to-slate-900 border border-rose-500/50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg font-['Cairo']"
    >
      <div className="flex items-center gap-3 text-right">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
          <Wrench className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-black text-rose-200 flex items-center gap-2 flex-wrap">
            <span>🛠️ وضع الصيانة مفعل حالياً</span>
            <span className="text-[11px] font-bold text-amber-300">
              (عمليات سحب البيانات والتحديثات التلقائية متوقفة مؤقتاً)
            </span>
          </div>
          {maintenanceState.reason && (
            <p className="text-[11px] text-slate-300 mt-0.5">
              السبب: {maintenanceState.reason}
            </p>
          )}
        </div>
      </div>

      {canManage && (
        <button
          type="button"
          onClick={() => {
            setMaintenanceMode(false);
            onShowToast?.('✅ تم إيقاف وضع الصيانة وعودة التشغيل التلقائي.');
          }}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors self-end sm:self-center"
        >
          <Power className="w-3.5 h-3.5" />
          <span>إيقاف وضع الصيانة</span>
        </button>
      )}
    </div>
  );
};

export default MaintenanceModeToggleCard;
