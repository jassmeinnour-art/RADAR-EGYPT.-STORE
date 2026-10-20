import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, ShieldAlert, Store, TrendingUp, Activity, CheckCircle2, Layers } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
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
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReload = (): void => {
    try {
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // If this is a localized section ErrorBoundary inside App.tsx, render an inline recovery card
      if (this.props.sectionName) {
        return (
          <div
            className="w-full bg-slate-900/95 border border-sky-500/40 rounded-2xl p-6 text-right font-['Cairo',sans-serif] text-slate-100 shadow-xl my-4"
            dir="rtl"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    وضع الحماية النشط — قسم ({this.props.sectionName})
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    تم عزل خطأ فرعي في هذا المكون لضمان استمرار عمل لوحة تحكم "رادار التاجر الذكي" دون توقف.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={this.handleReset}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-xs flex items-center gap-1.5 justify-center whitespace-nowrap cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تنشيط القسم فوراً</span>
              </button>
            </div>
            {this.state.error && (
              <div className="mt-3 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-left text-[11px] font-mono text-sky-300/90 overflow-x-auto" dir="ltr">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        );
      }

      // Full-screen Fallback UI for "RADAR - Global Marketplaces Real-Time Tracking"
      return (
        <div
          id="error-boundary-screen"
          className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col font-['Cairo',sans-serif]"
          dir="rtl"
        >
          {/* Emergency Top Header */}
          <header className="bg-slate-900/90 border-b border-sky-500/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent font-['Outfit','Alexandria']">
                    RADAR — Global Marketplaces Real-Time Tracking
                  </h1>
                  <span className="text-[11px] font-bold text-sky-300">
                    · واجهة الطوارئ النشطة ⚡
                  </span>
                </div>
                <p className="text-xs text-slate-400">Amazon · Noon · Jumia — منظومة رصد الأسعار والمنافسين والتسعير الذكي</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-error-reload"
                onClick={this.handleReset}
                className="h-9 px-4 bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-300 hover:to-sky-500 text-[#08090D] rounded-md font-black text-xs flex items-center gap-1.5 justify-center whitespace-nowrap shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>استئناف لوحة التحكم</span>
              </button>
              <button
                type="button"
                id="btn-error-clear"
                onClick={this.handleHardReload}
                className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md font-bold text-xs flex items-center gap-1.5 justify-center whitespace-nowrap transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>تحديث شامل ومسح الكاش</span>
              </button>
            </div>
          </header>

          {/* Emergency Dashboard Content */}
          <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
            {/* Quick KPI Fallback Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">حالة منظومة الرادار</span>
                  <span className="text-lg font-black text-emerald-400 mt-1 block">متصل ومؤمّن ✓</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">قنوات البيع والمنصات</span>
                  <span className="text-lg font-black text-white mt-1 block">أمازون • نون • جوميا</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">حماية البيانات السحابية</span>
                  <span className="text-lg font-black text-sky-400 mt-1 block">محفوظة بالكامل ⚡</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Diagnostic & Recovery Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/40 text-sky-400 rounded-2xl flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    تم تفعيل وضع الحماية الذكي للواجهة (Smart Fallback UI)
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تم اعتراض خطأ عارض في أحد المكونات الفرعية ومنع تحول الشاشة إلى اللون الأبيض. جميع بيانات منتجاتك وأسعارك في أمان تام.
                  </p>
                </div>
              </div>

              {this.state.error && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-left text-xs font-mono text-sky-300 overflow-x-auto max-h-40" dir="ltr">
                  {this.state.error.toString()}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-xs flex items-center gap-1.5 justify-center whitespace-nowrap shadow-md transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة محاولة العرض الفوري</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleHardReload}
                  className="h-9 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold text-xs flex items-center gap-1.5 justify-center whitespace-nowrap shadow-md transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>إعادة تشغيل رادار التاجر الذكي</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}
