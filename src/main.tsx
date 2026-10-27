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

// Hide WebSocket HMR errors in overlay and console
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
}

import { setupPWA } from "./pwaRegister"

// Initialize PWA Service Worker Registration
if (typeof window !== 'undefined') {
  if (import.meta.env.PROD) {
    setupPWA(() => {
      console.log('تحديث جديد متوفر في تطبيق رادار التاجر الذكي.');
    });
  } else {
    // Unregister service workers in preview / local dev mode to prevent stale HMR caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      }).catch(() => {});
    }
  }
}

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary sectionName="رادار التاجر الذكي">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AsyncOperationsProvider>
                <AudioNotificationProvider>
                  <VisualCustomizerProvider>
                    <App />
                    <Analytics />
                    <SpeedInsights />
                  </VisualCustomizerProvider>
                </AudioNotificationProvider>
              </AsyncOperationsProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}
