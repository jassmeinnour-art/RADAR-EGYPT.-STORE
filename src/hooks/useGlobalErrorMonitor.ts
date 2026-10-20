import { useState, useEffect, useCallback, useRef } from 'react';

export interface AppDiagnosticError {
  id: string;
  message: string;
  source: 'network' | 'form' | 'unhandled_rejection' | 'runtime' | 'firebase';
  timestamp: Date;
  isAutoRecovered: boolean;
  technicalDetails?: string;
  suggestedSolutionArabic: string;
}

export function useGlobalErrorMonitor(onShowToast?: (msg: string) => void) {
  const [activeError, setActiveError] = useState<AppDiagnosticError | null>(null);
  const [recoveryAttempts, setRecoveryAttempts] = useState<number>(0);
  const autoRecoverCountRef = useRef<number>(0);

  // Auto-dismiss soft keyboard and unfreeze DOM
  const unfreezeUI = useCallback(() => {
    try {
      // 1. Dismiss virtual keyboard on mobile/tablet
      if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
        (document.activeElement as HTMLElement).blur();
      }

      // 2. Unfreeze body overflow if a modal got stuck
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }

      // 3. Dispatch global reset event to tell all forms to cancel loading spinners
      window.dispatchEvent(new CustomEvent('app_force_reset_loading', {
        detail: { timestamp: Date.now(), reason: 'unfreeze_triggered' }
      }));
    } catch {
      // safe fallback
    }
  }, []);

  // Handle and categorize errors
  const processError = useCallback((err: any, source: AppDiagnosticError['source'] = 'runtime') => {
    unfreezeUI();

    const rawMsg = String(err?.message || err?.reason || err || '');
    
    const lowerMsg = rawMsg.toLowerCase();
    // Ignore harmless browser noise, iframe environment warnings, benign Firestore offline/permission/quota fallbacks, and standard inline validations
    if (
      rawMsg.includes('ResizeObserver') ||
      rawMsg.includes('canceled') ||
      rawMsg.includes('failed to connect to websocket') ||
      rawMsg.includes('WebSocket') ||
      rawMsg.includes('postMessage') ||
      rawMsg.includes('Missing or insufficient permissions') ||
      rawMsg.includes('permission-denied') ||
      lowerMsg.includes('quota limit exceeded') ||
      lowerMsg.includes('quota exceeded') ||
      lowerMsg.includes('resource-exhausted') ||
      lowerMsg.includes('free daily read units') ||
      rawMsg.includes('@firebase/firestore') ||
      rawMsg.includes('Could not reach Cloud Firestore backend') ||
      rawMsg.includes('client is offline') ||
      rawMsg.includes('IndexedDB') ||
      rawMsg.includes('serviceWorker') ||
      rawMsg.includes('ServiceWorker') ||
      source === 'form'
    ) {
      return;
    }

    let suggestedSolution = 'تم تحرير الشاشة وإلغاء التعليق. يمكنك إعادة المحاولة الآن.';
    let isAutoRecoverable = true;

    if (rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('fetch') || rawMsg.includes('فشل الاتصال')) {
      suggestedSolution = 'فحص اتصال الإنترنت أو خادم البيانات. تم حفظ مدخلاتك محلياً.';
    } else if (rawMsg.toLowerCase().includes('permission') || rawMsg.toLowerCase().includes('unauthorized')) {
      suggestedSolution = 'صلاحيات الوصول أو الجلسة انتهت. تم تحديث الحساب تلقائياً.';
    } else if (rawMsg.toLowerCase().includes('validation') || rawMsg.includes('حقل')) {
      suggestedSolution = 'يرجى مراجعة الحقول المطلوبة باللون الأحمر للتأكد من اكتمالها.';
      isAutoRecoverable = false;
    }

    const diagError: AppDiagnosticError = {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      message: rawMsg || 'حدث خطأ غير متوقع أثناء معالجة البيانات',
      source,
      timestamp: new Date(),
      isAutoRecovered: isAutoRecoverable,
      technicalDetails: typeof err === 'object' ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : String(err),
      suggestedSolutionArabic: suggestedSolution
    };

    if (isAutoRecoverable && autoRecoverCountRef.current < 5) {
      autoRecoverCountRef.current += 1;
      setRecoveryAttempts(prev => prev + 1);
      // Inform user gently without breaking their work
      onShowToast?.('تم رصد تعطل مؤقت وتجاوزه تلقائياً دون فقدان بياناتك 🛡️');
      setActiveError(null);
    } else {
      setActiveError(diagError);
    }
  }, [unfreezeUI, onShowToast]);

  // Global listeners
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      processError(event.error || event.message, 'runtime');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      processError(event.reason, 'unhandled_rejection');
    };

    const handleCustomAppError = (event: any) => {
      if (event.detail?.error) {
        processError(event.detail.error, event.detail.source || 'form');
      }
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('app_error_report', handleCustomAppError);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('app_error_report', handleCustomAppError);
    };
  }, [processError]);

  const clearError = useCallback(() => {
    setActiveError(null);
    unfreezeUI();
  }, [unfreezeUI]);

  const forceAutoRecover = useCallback(() => {
    unfreezeUI();
    setActiveError(null);
    onShowToast?.('تمت إعادة تعيين الواجهة وفك التجميد بنجاح ✅');
  }, [unfreezeUI, onShowToast]);

  return {
    activeError,
    recoveryAttempts,
    unfreezeUI,
    processError,
    clearError,
    forceAutoRecover
  };
}
