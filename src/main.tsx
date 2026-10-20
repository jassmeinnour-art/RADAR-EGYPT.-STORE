import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

// Suppress Vite HMR / WebSocket errors from rendering error overlay
if (typeof window !== 'undefined') {
  const suppressWsError = (errMessage: any) => {
    const str = String(errMessage || '');
    return (
      str.includes('WebSocket closed without opened') ||
      str.includes('WebSocket') ||
      str.includes('ws/vite/client') ||
      str.includes('ws://') ||
      str.includes('wss://')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (
      suppressWsError(event.reason?.message || event.reason) ||
      (event.reason && event.reason.message && String(event.reason.message).includes('WebSocket'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('error', (event) => {
    if (suppressWsError(event.message || event.error)) {
      event.preventDefault();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
)
