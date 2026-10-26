import React from 'react';
import { useAsyncOperations } from '../context/AsyncOperationsContext';
import { Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const StatsMonitor: React.FC = () => {
  const { activeOperations, recentCompleted } = useAsyncOperations();

  // Filter for operations related to KPI, stats, or platform synchronization
  const kpiOps = activeOperations.filter(op => 
    op.title.toLowerCase().includes('kpi') || 
    op.title.includes('إحصائيات') ||
    op.category === 'platform_sync'
  );
  
  const isKpiLoading = kpiOps.length > 0;
  
  // Track the last relevant completed operation for KPI status
  const lastKpiOp = recentCompleted && (
    recentCompleted.title.toLowerCase().includes('kpi') || 
    recentCompleted.title.includes('إحصائيات') ||
    recentCompleted.category === 'platform_sync'
  ) ? recentCompleted : null;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur-sm shadow-xl transition-all duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isKpiLoading ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'} border border-current/10 shadow-inner`}>
            {isKpiLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-black text-white font-['Cairo'] tracking-tight">مراقب مزامنة البيانات (KPI Sync Monitor)</h4>
            <p className="text-[10px] text-slate-400 font-['Cairo'] mt-0.5">
              {isKpiLoading 
                ? `جاري تحديث ${kpiOps[0]?.title}...` 
                : 'كافة المؤشرات محدثة ومستقرة ومزامنة مع السحابة'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastKpiOp && !isKpiLoading && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black border transition-all duration-300 ${
              lastKpiOp.success 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {lastKpiOp.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{lastKpiOp.success ? 'تزامن ناجح' : 'فشل في التزامن'}</span>
            </div>
          )}
          
          <div className="text-[9px] font-bold text-slate-500 bg-slate-800/40 px-2 py-1 rounded-md border border-slate-700/50">
            Status: {isKpiLoading ? 'SYNCING' : 'READY'}
          </div>
        </div>
      </div>

      {/* Persistent Error Alert for Sync Failure */}
      {lastKpiOp && !lastKpiOp.success && !isKpiLoading && (
        <div className="mt-4 p-3.5 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-3 animate-pulse ring-1 ring-red-500/20 shadow-lg">
          <div className="p-1.5 bg-red-500/20 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-[11px] text-red-100 font-['Cairo'] leading-relaxed">
            <span className="font-black block text-xs mb-1 text-red-300">⚠️ تنبيه تقني: تعطل التزامن التلقائي للبيانات</span>
            فشل النظام في الاتصال بمنصات التجارة الإلكترونية (Amazon/Noon) لجلب أحدث مؤشرات الأداء. 
            قد تكون البيانات المعروضة حالياً قديمة أو غير دقيقة. يرجى التحقق من مفاتيح الـ API في "دليل الربط" أو إعادة المحاولة لاحقاً.
          </div>
        </div>
      )}
    </div>
  );
};
