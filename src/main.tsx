import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

// Show errors on white screen
window.addEventListener('error', (e) => {
  const root = document.getElementById('root')
  if (root && root.innerHTML === '') {
    root.innerHTML = '<div style="padding:20px;color:red;font-family:monospace"><h2>خطأ:</h2><pre>' + e.message + '</pre></div>'
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const root = document.getElementById('root')
  if (root && root.innerHTML === '') {
    root.innerHTML = '<div style="padding:20px;color:red;font-family:monospace"><h2>خطأ Promise:</h2><pre>' + String(e.reason) + '</pre></div>'
  }
});

const rootEl = document.getElementById("root")
if (rootEl) {
  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
        <Analytics />
        <SpeedInsights />
      </React.StrictMode>
    )
  } catch (err: any) {
    rootEl.innerHTML = '<div style="padding:20px;color:red"><h2>Render Error:</h2><pre>' + String(err) + '</pre></div>'
  }
}
