import React, { ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import {
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Store,
  Package,
  Truck,
  Layers,
  Activity,
  ShieldAlert
} from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  fallbackToLogin?: boolean;
  sectionName?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  className?: string;
  silent?: boolean;
  compact?: boolean;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
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
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn(`[ErrorBoundary] Caught error in (${this.props.sectionName || this.props.sectionTitle || 'section'}):`, error, errorInfo);
    try {
      Sentry.captureException(error, {
        tags: {
          section: this.props.sectionName || 'unknown',
          boundary: 'ErrorBoundary',
        },
        extra: {
          sectionTitle: this.props.sectionTitle,
          componentStack: errorInfo.componentStack,
        },
      });
    } catch {
      // Sentry reporting is best-effort and must never break fallback rendering
    }
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
    try {
      this.props.onRetry?.();
    } catch {
      // safe
    }
  };

  private getSectionIcon(sectionKey: string): React.ReactNode {
    const key = sectionKey.toLowerCase();
    if (key.includes('chart') || key.includes('analytics') || key.includes('sales') || key.includes('metric')) {
      return <BarChart3 className="w-5 h-5 text-amber-400" />;
    }
    if (key.includes('trader') || key.includes('merchant')) {
      return <Store className="w-5 h-5 text-amber-400" />;
    }
    if (key.includes('product') || key.includes('item') || key.includes('catalog')) {
      return <Package className="w-5 h-5 text-sky-400" />;
    }
    if (key.includes('invoice') || key.includes('shipping') || key.includes('waybill') || key.includes('order')) {
      return <Truck className="w-5 h-5 text-purple-400" />;
    }
    if (key.includes('heatmap') || key.includes('radar') || key.includes('competitor')) {
      return <Activity className="w-5 h-5 text-rose-400" />;
    }
    return <AlertTriangle className="w-5 h-5 text-amber-400" />;
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.silent) {
        if (typeof this.props.fallback === 'function' && this.state.error) {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return (this.props.fallback as ReactNode) ?? null;
      }

      if (typeof this.props.fallback === 'function' && this.state.error) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      if (this.props.fallback) {
        return this.props.fallback as ReactNode;
      }

      const secName = this.props.sectionName || '';
      const secTitle = this.props.sectionTitle || (secName ? `قسم ${secName}` : 'هذا القسم');
      const secDesc = this.props.sectionDescription || 'تعذر استرجاع أو معالجة بيانات هذا القسم مؤقتاً. بياناتك الأساسية محفوظة ولم تتأثر بقية أجزاء النظام.';

      // Compact inline banner (for narrow cards, table rows, or modal strips)
      if (this.props.compact) {
        return (
          <div
            className={`rounded-2xl border border-amber-500/20 bg-slate-900/90 p-3 text-right flex items-center justify-between gap-3 font-['Cairo'] shadow-lg backdrop-blur-md ${this.props.className || ''}`}
            dir="rtl"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                {this.getSectionIcon(secName)}
              </span>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">
                  تعذر عرض {secTitle}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  يمكنك إعادة المحاولة لاحقاً
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        );
      }

      // Full Luxury Glassmorphic Fallback Card for Sections
      return (
        <div
          className={`rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900/95 via-slate-950/90 to-slate-900/95 p-6 text-right font-['Cairo'] shadow-2xl backdrop-blur-xl relative overflow-hidden ${this.props.className || ''}`}
          dir="rtl"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                {this.getSectionIcon(secName)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-black text-white">
                    تعذر تحميل {secTitle}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                    قسم آمن معزول
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold max-w-xl leading-relaxed">
                  {secDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة الآن</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
