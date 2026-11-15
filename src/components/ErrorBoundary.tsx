import React, { ErrorInfo, ReactNode } from 'react';
import { EmergencyLoginButton } from './EmergencyLoginButton';
import LoginPage from './LoginPage';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackToLogin?: boolean;
  sectionName?: string;
  silent?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if (typeof window !== 'undefined' && error) {
      const errMsg = error.message || String(error);
      if (
        errMsg.includes('Failed to fetch dynamically imported module') ||
        errMsg.includes('Loading chunk') ||
        errMsg.includes('dynamically imported module')
      ) {
        try {
          const lastReload = sessionStorage.getItem('chunk_error_reload');
          if (!lastReload || Date.now() - parseInt(lastReload, 10) > 10000) {
            sessionStorage.setItem('chunk_error_reload', Date.now().toString());
            window.location.reload();
          }
        } catch {
          // safe
        }
      }
    }
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn(`[ErrorBoundary] Caught error in (${this.props.sectionName || 'app'}):`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.silent) {
        return this.props.fallback ?? null;
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.fallbackToLogin) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          try {
            window.history.replaceState({}, '', '/login');
          } catch {
            // safe
          }
        }
        return (
          <div className="min-h-screen bg-[#08090D] text-slate-100" dir="rtl">
            <div className="bg-amber-500/15 border-b border-amber-500/40 px-4 py-2.5 text-center flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-amber-200">
              <span>حدث خطأ غير متوقع — تم توجيهك لصفحة تسجيل الدخول بأمان.</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black cursor-pointer"
              >
                حدث خطأ في التحميل - دوس هنا لإعادة التحميل
              </button>
            </div>
            <LoginPage
              onLoginSuccess={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                if (typeof window !== 'undefined') window.location.assign('/');
              }}
            />
          </div>
        );
      }

      return (
        <div className="min-h-[240px] flex items-center justify-center p-6 bg-slate-950 text-slate-100 font-['Cairo']" dir="rtl">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-rose-500/40 text-center space-y-4 shadow-xl">
            <h3 className="text-base font-black text-rose-400">تعذر عرض هذا القسم</h3>
            <p className="text-xs text-slate-300">لا توجد بيانات متاحة حالياً أو حدث خطأ أثناء العرض.</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
              >
                حدث خطأ في التحميل - دوس هنا لإعادة التحميل
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                إعادة المحاولة
              </button>
              <EmergencyLoginButton />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
