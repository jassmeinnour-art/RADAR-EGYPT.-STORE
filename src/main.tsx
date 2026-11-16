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
    ReactDOM.createRoot(root).render(
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
    (window as any).__RADAR_APP_MOUNTED__ = false;
    (window as any).__RADAR_SHOW_BOOT_ERROR__?.(err?.message || 'Root mount failed');
  }
}
