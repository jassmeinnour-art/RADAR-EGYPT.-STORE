import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AudioNotificationProvider } from "./context/AudioNotificationContext"

// Hide WebSocket HMR errors in overlay
if (typeof window !== 'undefined') {
  const origError = console.error
  console.error = (...args: any[]) => {
    const msg = String(args[0] || '')
    if (msg.includes('WebSocket') || msg.includes('ws://') || msg.includes('wss://')) return
    origError(...args)
  }
}

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AudioNotificationProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </AudioNotificationProvider>
    </React.StrictMode>
  )
}
