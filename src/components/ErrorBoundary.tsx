import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  silent?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private autoRecoveryTimer: any = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Auto-recover from dynamic module import or chunk load errors
    if (typeof window !== 'undefined' && error) {
      const errMsg = error.message || String(error);
      if (
        errMsg.includes('Failed to fetch dynamically imported module') ||
        errMsg.includes('Loading chunk') ||
        errMsg.includes('dynamically imported module')
      ) {
        const lastReload = sessionStorage.getItem('chunk_error_reload');
        if (!lastReload || Date.now() - parseInt(lastReload, 10) > 8000) {
          sessionStorage.setItem('chunk_error_reload', Date.now().toString());
          window.location.reload();
        }
      }
    }
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Silently log and record error in background without interrupting user or halting the UI
    console.warn(`[ErrorBoundary] Handled exception silently in (${this.props.sectionName || 'app'}):`, error, errorInfo);

    try {
      if (typeof sessionStorage !== 'undefined') {
        const silentLog = {
          section: this.props.sectionName || 'general',
          message: error?.message || String(error),
          stack: error?.stack || '',
          timestamp: new Date().toISOString(),
        };
        sessionStorage.setItem('radar_silent_exception_log', JSON.stringify(silentLog));
      }
    } catch {
      // safe fallback
    }

    this.setState({ errorInfo });

    // Immediate background auto-recovery: auto-reset within 50ms to restore interface seamlessly
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer);
    }
    this.autoRecoveryTimer = setTimeout(() => {
      if (this.state.hasError) {
        this.handleReset();
      }
    }, 50);
  }

  public override componentWillUnmount(): void {
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer);
    }
  }

  private handleReset = (): void => {
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer);
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      // If a custom lightweight fallback is explicitly provided, render it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Never render the disruptive "نظام الحماية الذكي" screen!
      // Return a non-blocking invisible placeholder while automatic background recovery runs
      return null;
    }

    return this.props.children;
  }
}

