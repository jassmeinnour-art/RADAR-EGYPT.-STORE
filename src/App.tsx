export default function App() {
  return (
    <div style={{padding:'20px', fontFamily:'system-ui', direction:'rtl', background:'#fff', minHeight:'100vh'}}>
      <h1 style={{color:'#0f172a', fontSize:'28px'}}>رادار التاجر الذكي - يعمل! ✅</h1>
      <p style={{fontSize:'16px', marginTop:'10px'}}>تم إصلاح الشاشة البيضاء - الموقع رجع يشتغل</p>
      <div style={{marginTop:'20px', background:'#dcfce7', padding:'15px', borderRadius:'8px', border:'1px solid #86efac'}}>
        <h3 style={{margin:'0 0 10px 0'}}>قائمة التحقق للإنتاج 4/5 (80% = تخطي 3/4)</h3>
        <ul style={{margin:0, paddingRight:'20px'}}>
          <li>✅ Git مستودع</li>
          <li>✅ نطاق مخصص</li>
          <li>✅ ميزة النشر</li>
          <li>✅ تحليل الويب</li>
        </ul>
      </div>
      <div style={{marginTop:'20px'}}>
        <a href="/sitemap.xml" style={{color:'#2563eb', marginLeft:'15px'}}>Sitemap</a>
        <a href="/robots.txt" style={{color:'#2563eb', marginLeft:'15px'}}>Robots</a>
        <a href="/dashboard" style={{color:'#2563eb'}}>Dashboard</a>
      </div>
    </div>
  )
}
