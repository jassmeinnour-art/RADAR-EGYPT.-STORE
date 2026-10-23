import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { AsyncOperationsProvider } from "./context/AsyncOperationsContext"
import { AudioNotificationProvider } from "./context/AudioNotificationContext"
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

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary sectionName="رادار التاجر الذكي">
        <AuthProvider>
          <ThemeProvider>
            <AsyncOperationsProvider>
              <AudioNotificationProvider>
                <App />
                <Analytics />
                <SpeedInsights />
              </AudioNotificationProvider>
            </AsyncOperationsProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}
