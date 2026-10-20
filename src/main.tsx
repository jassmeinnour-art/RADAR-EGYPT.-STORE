// Suppress Vite HMR / WebSocket errors from rendering error overlay
if (typeof window !== 'undefined') {
  const suppressWsError = (errMessage: any) => {
    const str = String(errMessage || '');
    return (
      str.includes('WebSocket closed without opened') ||
      str.includes('WebSocket') ||
      str.includes('@vite/client') ||
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
    if (suppressWsError(event.message || event.error?.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AudioNotificationProvider } from './context/AudioNotificationContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AsyncOperationsProvider } from './context/AsyncOperationsContext'
import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary sectionName="الرئيسية">
      <AuthProvider>
        <ThemeProvider>
          <AsyncOperationsProvider>
            <AudioNotificationProvider>
              <App />
            </AudioNotificationProvider>
          </AsyncOperationsProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)