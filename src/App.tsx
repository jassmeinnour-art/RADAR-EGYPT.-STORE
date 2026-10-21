import React from "react"
import { AudioNotificationProvider } from "./contexts/AudioNotificationProvider"
import { WatchlistProvider } from "./contexts/WatchlistContext"

function AppContent() {
  // هنا حطي كل كود App الأصلي بتاعك
  return (
    <div style={{padding:'20px', direction:'rtl'}}>
      <h1>رادار التاجر الذكي</h1>
      <p>الموقع يعمل - تم إصلاح الشاشة البيضاء</p>
    </div>
  )
}

export default function App() {
  return (
    <AudioNotificationProvider>
      <WatchlistProvider>
        <AppContent />
      </WatchlistProvider>
    </AudioNotificationProvider>
  )
}
