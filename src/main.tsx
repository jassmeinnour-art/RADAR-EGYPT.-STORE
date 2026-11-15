import * as Sentry from "@sentry/react"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { AsyncOperationsProvider } from "./context/AsyncOperationsContext"
import { AudioNotificationProvider } from "./context/AudioNotificationContext"
import { LanguageProvider } from "./context/LanguageContext"
import { VisualCustomizerProvider } from "./context/VisualCustomizerContext"
import { ErrorBoundary } from "./components/ErrorBoundary"
import "./index.css"
import { setupPWA } from "./pwaRegister"

// Initialize Sentry for production error capturing & real-time performance tracing
const sentryDsn = import.meta.env.VITE_SENTRY_DSN || "";
if (typeof window !== 'undefined' && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE || (import.meta.env.PROD ? 'production' : 'development'),
    enabled: import.meta.env.PROD || Boolean(sentryDsn),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring (Traces)
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      const errMsg = String(
        (hint?.originalException as Error | undefined)?.message ||
        event?.exception?.values?.[0]?.value ||
        ''
      );
      if (
        errMsg.includes('ResizeObserver') ||
        errMsg.includes('WebSocket') ||
        errMsg.includes('moduleRunnerTransport') ||
        errMsg.includes('dynamically imported module')
      ) {
        return null;
      }
      return event;
    },
  });
}

// Hide WebSocket HMR errors in overlay and console, and handle unhandled rejections silently
if (typeof window !== 'undefined') {
  const origError = console.error;
  console.error = (...args: any[]) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    if (
      msg.includes('WebSocket') ||
      msg.includes('ws://') ||
      msg.includes('wss://') ||
      msg.includes('moduleRunnerTransport') ||
      msg.includes('createWebSocketModuleRunnerTransport') ||
      msg.includes('vite/client')
    ) return;
    origError(...args);
  };

  // Prevent background promise rejections or unhandled exceptions from triggering crash screens
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Background Handled Promise Rejection]:', event.reason);
    if (sentryDsn && import.meta.env.PROD && event.reason) {
      Sentry.captureException(event.reason);
    }
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    // Only intercept if harmless or transient
    const msg = event?.message || '';
    if (
      msg.includes('ResizeObserver') ||
      msg.includes('dynamically imported module') ||
      msg.includes('Script error')
    ) {
      event.preventDefault();
      return;
    }
    if (sentryDsn && import.meta.env.PROD && event.error) {
      Sentry.captureException(event.error);
    }
  });
}

// Register Service Worker (sw.js)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[SW] Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.warn('[SW] Service Worker registration failed:', error);
      });
  });

  // Handle PWA update events in production
  if (import.meta.env.PROD) {
    setupPWA(() => {
      console.log('تحديث جديد متوفر في تطبيق رادار التاجر الذكي.');
    });
  }
}

const isVercelHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('.vercel.app') || window.location.hostname.includes('vercel'));

const root = document.getElementById('root')
if (root) {
  try {
    (window as any).__RADAR_APP_MOUNTED__ = true;
    ReactDOM.createRoot(root, {
      onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
        console.warn('[React Uncaught Error]:', error, errorInfo?.componentStack);
      }),
      onCaughtError: Sentry.reactErrorHandler(),
      onRecoverableError: Sentry.reactErrorHandler(),
    }).render(
      <React.StrictMode>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AsyncOperationsProvider>
                <AudioNotificationProvider>
                  <VisualCustomizerProvider>
                    <ErrorBoundary
                      sectionName="root-app"
                      sectionTitle="تطبيق رادار مصر"
                      sectionDescription="حدث استثناء غير متوقع أثناء تشغيل الواجهة. يمكنك النقر على زر إعادة المحاولة لاستعادة الجلسة بأمان."
                    >
                      <App />
                    </ErrorBoundary>
                    {isVercelHost && (
                      <ErrorBoundary silent fallback={null} sectionName="analytics">
                        <Analytics />
                        <SpeedInsights />
                      </ErrorBoundary>
                    )}
                  </VisualCustomizerProvider>
                </AudioNotificationProvider>
              </AsyncOperationsProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </React.StrictMode>
    )
  } catch (err: any) {
    if (sentryDsn) {
      Sentry.captureException(err);
    }
    (window as any).__RADAR_APP_MOUNTED__ = false;
    (window as any).__RADAR_SHOW_BOOT_ERROR__?.(err?.message || 'Root mount failed');
  }
}
