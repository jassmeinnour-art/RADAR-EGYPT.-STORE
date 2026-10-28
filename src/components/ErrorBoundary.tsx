import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

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
    console.warn('ErrorBoundary caught an unhandled error (auto-recovering in background):', error, errorInfo);
    this.setState({ errorInfo });

    // Auto-recover after 4 seconds to prevent user getting stuck on fallback screen
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer);
    }
    this.autoRecoveryTimer = setTimeout(() => {
      if (this.state.hasError) {
        console.info('ErrorBoundary auto-recovering in background...');
        this.handleReset();
      }
    }, 4000);
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          sectionName={this.props.sectionName}
        />
      );
    }

    return this.props.children;
  }
}
