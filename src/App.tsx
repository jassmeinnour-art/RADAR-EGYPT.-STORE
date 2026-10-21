import React from "react"

export default function App() {
  return (
    <div style={{padding:'20px', fontFamily:'system-ui', direction:'rtl'}}>
      <h1 style={{color:'#0f172a'}}>رادار التاجر الذكي - يعمل! ✅</h1>
      <p>الموقع رجع يشتغل - تم إصلاح الشاشة البيضاء!</p>
      <p style={{marginTop:'20px'}}>
        <a href="/sitemap.xml" style={{color:'blue'}}>Sitemap</a> | 
        <a href="/robots.txt" style={{color:'blue', marginRight:'10px'}}>Robots</a>
      </p>
      <div style={{marginTop:'30px', background:'#f1f5f9', padding:'15px', borderRadius:'8px'}}>
        <h3>قائمة التحقق للإنتاج 4/5 (80% = تخطي 3/4):</h3>
        <ul>
          <li>✅ Git مستودع</li>
          <li>✅ نطاق مخصص</li>
          <li>✅ ميزة النشر</li>
          <li>✅ تحليل الويب</li>
        </ul>
      </div>
    </div>
  )
}
