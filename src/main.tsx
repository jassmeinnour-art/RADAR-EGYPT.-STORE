import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

const root = document.getElementById("root")
if (root) {
  ReactDOM.createRoot(root).render(
    <>
      <App />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
