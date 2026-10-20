import React from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  Database, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Loader2,
  Zap,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAsyncOperations, AsyncOpCategory } from '../context/AsyncOperationsContext';

export const AsyncOperationsStatusIndicator: React.FC = () => {
  const { 
    activeOperations, 
    recentCompleted, 
    clearCompleted,
    isPlatformSyncing,
    isCsvExporting,
    isDatabaseBusy
  } = useAsyncOperations();

  const activeCount = activeOperations.length;
  const currentOp = activeOperations[activeOperations.length - 1]; // most recent active

  const getCategoryConfig = (cat: AsyncOpCategory) => {
    switch (cat) {
      case 'platform_sync':
        return {
          icon: <RefreshCw className="w-4 h-4 text-sky-600 animate-spin" />,
          badgeBg: 'bg-sky-50 border-sky-200 text-sky-900',
          indicatorColor: 'bg-sky-500',
          label: 'مزامنة المنصات'
        };
      case 'csv_export':
        return {
          icon: <Download className="w-4 h-4 text-emerald-600 animate-bounce" />,
          badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          indicatorColor: 'bg-emerald-500',
          label: 'تصدير CSV'
        };
      case 'database':
        return {
          icon: <Cloud className="w-4 h-4 text-sky-600 animate-pulse" />,
          badgeBg: 'bg-sky-50 border-sky-200 text-sky-900',
          indicatorColor: 'bg-sky-500',
          label: 'قاعدة البيانات السحابية'
        };
      default:
        return {
          icon: <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />,
          badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
          indicatorColor: 'bg-indigo-500',
          label: 'معالجة جارية'
        };
    }
  };

  return (
    <>
      {/* Top Global Progress Bar line when any operation is running */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 h-1 z-[9999] pointer-events-none bg-slate-200/50 overflow-hidden"
          >
            <div className="h-full w-full bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Interactive Status Pill (Desktop: Top-Center, Mobile: Bottom-Center) */}
      <div 
        id="async-operations-floating-container"
        className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[9998] pointer-events-auto flex flex-col items-center gap-2 max-w-[92vw] sm:max-w-md w-auto"
        dir="rtl"
      >
        <AnimatePresence mode="wait">
          {/* 1. Active Pending Operation */}
          {activeCount > 0 && currentOp && (
            <motion.div
              key="active-pill"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="group shadow-xl rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 py-2 px-4 flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-800 ring-1 ring-black/5"
            >
              {/* Category Icon with Spin */}
              <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-slate-100/90 border border-slate-200">
                {getCategoryConfig(currentOp.category).icon}
              </div>

              {/* Title and Detail */}
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 leading-tight">
                    {currentOp.title}
                  </span>
                  {activeCount > 1 && (
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      +{activeCount - 1} أخرى
                    </span>
                  )}
                </div>
                {currentOp.detail && (
                  <span className="text-[11px] text-slate-500 leading-none mt-0.5">
                    {currentOp.detail}
                  </span>
                )}
              </div>

              {/* Active Pulsing Dot */}
              <span className="relative flex h-2.5 w-2.5 ms-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getCategoryConfig(currentOp.category).indicatorColor}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${getCategoryConfig(currentOp.category).indicatorColor}`}></span>
              </span>
            </motion.div>
          )}

          {/* 2. Recently Completed Success Feedback */}
          {activeCount === 0 && recentCompleted && (
            <motion.div
              key={`completed-${recentCompleted.id}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`group shadow-lg rounded-full py-1.5 px-4 flex items-center gap-2.5 text-xs sm:text-sm font-medium backdrop-blur-md border ${
                recentCompleted.success 
                  ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900' 
                  : 'bg-rose-50/95 border-rose-300 text-rose-900'
              }`}
            >
              {recentCompleted.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              
              <span className="font-bold">
                {recentCompleted.success ? 'اكتمل بنجاح: ' : 'فشلت العملية: '}
                <span className="font-normal">{recentCompleted.title}</span>
              </span>

              <button
                type="button"
                onClick={clearCompleted}
                className="ms-1 p-0.5 hover:bg-black/5 rounded-full text-slate-500 transition-colors"
                title="إغلاق"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
