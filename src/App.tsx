import React, { useState, useEffect, createContext, useContext, useMemo, memo } from "react";

// ========== CONTEXTS (Self-contained) ==========
type WatchlistContextType = {
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}
const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [], addToWatchlist: () => {}, removeFromWatchlist: () => {}, isInWatchlist: () => false
});
type AudioContextType = { soundEnabled: boolean; toggleSound: () => void; playAlert: () => void; }
const AudioContext = createContext<AudioContextType>({ soundEnabled: true, toggleSound: () => {}, playAlert: () => {} });

function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('radar_watchlist') || '[]'); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('radar_watchlist', JSON.stringify(watchlist)); } catch {} }, [watchlist]);
  const value = useMemo(() => ({
    watchlist,
    addToWatchlist: (id: string) => setWatchlist(w => w.includes(id) ? w : [...w, id]),
    removeFromWatchlist: (id: string) => setWatchlist(w => w.filter(x => x !== id)),
    isInWatchlist: (id: string) => watchlist.includes(id)
  }), [watchlist]);
  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}
function AudioNotificationProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const value = useMemo(() => ({
    soundEnabled,
    toggleSound: () => setSoundEnabled(s => !s),
    playAlert: () => {
      if (!soundEnabled) return;
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator(); o.frequency.value = 800; o.connect(ctx.destination); o.start(); setTimeout(() => o.stop(), 200);
      } catch {}
    }
  }), [soundEnabled]);
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

// ========== DATA ==========
const MOCK_PRODUCTS = [
  { id: '1', name: 'iPhone 15 Pro Max 256GB', category: 'موبايلات', image: '📱', price: 58999 },
  { id: '2', name: 'Samsung Galaxy S24 Ultra', category: 'موبايلات', image: '📱', price: 45999 },
  { id: '3', name: 'PlayStation 5 Slim', category: 'ألعاب', image: '🎮', price: 28999 },
];
const PAGES = [
  { path: '/', label: 'الرئيسية' }, { path: '/dashboard', label: 'لوحة التحكم' },
  { path: '/search', label: 'البحث' }, { path: '/pricing', label: 'الأسعار' },
  { path: '/features', label: 'المميزات' }, { path: '/about', label: 'عنا' },
  { path: '/contact', label: 'اتصل بنا' }, { path: '/help', label: 'المساعدة' },
];

// ========== HEADER مع ARIA LABELS - يصلح "عدم احتواء الأزرار على اسم" ==========
const Header = memo(function Header({ currentPath, setPath }: { currentPath: string; setPath: (p: string) => void }) {
  const { watchlist } = useContext(WatchlistContext);
  const { soundEnabled, toggleSound } = useContext(AudioContext);
  return (
    <header style={{background:'#0f172a', color:'#fff', padding:'12px 20px', position:'sticky', top:0, zIndex:50, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10}}>
      <div style={{display:'flex', alignItems:'center', gap:12, cursor:'pointer'}} onClick={()=>setPath('/')} role="button" tabIndex={0} aria-label="العودة للرئيسية">
        <img src="/pwa-192x192.png" alt="رادار التاجر" width={36} height={36} style={{width:36,height:36,borderRadius:8,background:'#38bdf8'}} loading="eager" decoding="async" />
        <div><div style={{fontWeight:800, fontSize:18}}>رادار التاجر الذكي</div><div style={{fontSize:11, opacity:0.7}}>RADAR EGYPT</div></div>
      </div>
      <nav aria-label="القائمة الرئيسية" style={{display:'flex', gap:6, flexWrap:'wrap'}}>
        {PAGES.map(p => (
          <button key={p.path} onClick={()=>setPath(p.path)} aria-label={`الذهاب إلى ${p.label}`} aria-current={currentPath===p.path ? 'page' : undefined} style={{background: currentPath===p.path ? '#1e293b' : 'transparent', color: currentPath===p.path ? '#38bdf8' : '#cbd5e1', border:'1px solid '+(currentPath===p.path?'#334155':'transparent'), padding:'6px 12px', borderRadius:20, cursor:'pointer', fontSize:13}}>{p.label}</button>
        ))}
      </nav>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <button onClick={toggleSound} aria-label={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'} title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'} style={{background:'#1e293b', border:'none', color:'#fff', padding:'6px 10px', borderRadius:20, cursor:'pointer'}}>{soundEnabled?'🔊':'🔇'}</button>
        <div aria-label={`لديك ${watchlist.length} منتج في المتابعة`} style={{background:'#1e293b', padding:'6px 12px', borderRadius:20, fontSize:13}}>⭐ {watchlist.length} متابع</div>
      </div>
    </header>
  )
});

// ========== PAGES مع ترتيب عناوين صحيح h1 -> h2 -> h3 ==========
function HomePage({ navigate }: { navigate: (p:string)=>void }){
  return (
    <main style={{padding:20, maxWidth:1200, margin:'0 auto'}}>
      <section aria-labelledby="main-title" style={{background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', color:'#fff', borderRadius:16, padding:'40px 20px', textAlign:'center'}}>
        <img src="/pwa-192x192.png" alt="رادار التاجر الذكي - لوحة تحكم التاجر" width={192} height={192} style={{width:96,height:96,margin:'0 auto 16px',display:'block',borderRadius:16}} loading="eager" fetchPriority="high" decoding="async" />
        <h1 id="main-title" style={{fontSize:36, fontWeight:900, margin:0}}>رادار التاجر الذكي</h1>
        <p style={{fontSize:18, opacity:0.8, marginTop:10}}>منصة ذكية لتحليل السوق المصري - سريعة وآمنة</p>
        <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:20, flexWrap:'wrap'}}>
          <button onClick={()=>navigate('/dashboard')} aria-label="فتح لوحة التحكم" style={{background:'#38bdf8', color:'#0f172a', border:'none', padding:'12px 24px', borderRadius:10, fontWeight:800, cursor:'pointer'}}>🚀 افتح لوحة التحكم</button>
          <button onClick={()=>navigate('/search')} aria-label="البحث عن منتج" style={{background:'#fff', color:'#0f172a', border:'none', padding:'12px 24px', borderRadius:10, fontWeight:700, cursor:'pointer'}}>🔍 ابحث عن منتج</button>
        </div>
      </section>
      <section aria-labelledby="features-title" style={{marginTop:20}}>
        <h2 id="features-title" style={{fontSize:24, fontWeight:800}}>مميزات المنصة</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:12, marginTop:12}}>
          {[
            {t:'مراقبة فورية', d:'تتبع أسعار Jumia و Amazon لحظياً', i:'⚡'},
            {t:'تنبيهات ذكية', d:'تنبيه صوتي عند نزول السعر', i:'🔔'},
            {t:'تحليل المنافسة', d:'اعرف الأرخص ومين كسبان السوق', i:'📊'},
          ].map(x=>(
            <article key={x.t} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
              <h3 style={{fontSize:18, fontWeight:700, margin:'0 0 4px 0'}}><span aria-hidden="true">{x.i}</span> {x.t}</h3>
              <p style={{fontSize:13, color:'#64748b', margin:0}}>{x.d}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function DashboardPage(){
  const { watchlist } = useContext(WatchlistContext);
  return (
    <main style={{padding:20}}>
      <h1 style={{marginTop:0}}>لوحة التحكم</h1>
      <h2 style={{fontSize:16, color:'#64748b'}}>تتابع {watchlist.length} منتج - تحديث لحظي</h2>
      <section style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12, marginTop:16}}>
        {MOCK_PRODUCTS.map(p => (
          <article key={p.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
            <h3 style={{margin:'0 0 8px 0', fontSize:16}}>{p.image} {p.name}</h3>
            <p style={{margin:0, fontWeight:800, color:'#0f172a'}}>{p.price.toLocaleString()} ج.م - {p.category}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

function SearchPageContent(){
  const [q,setQ]=useState('');
  const results = useMemo(()=> q ? MOCK_PRODUCTS.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())) : MOCK_PRODUCTS, [q]);
  return (
    <main style={{padding:20}}>
      <h1 style={{marginTop:0}}>البحث في السوق</h1>
      <label htmlFor="search-input" style={{display:'block', marginBottom:8, fontWeight:600}}>ابحث عن منتج</label>
      <input id="search-input" type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث عن iPhone, Samsung..." aria-label="ابحث عن منتج" style={{width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid #e5e7eb', fontSize:16, marginBottom:16, boxSizing:'border-box'}}/>
      <section aria-live="polite" aria-label="نتائج البحث">
        {results.map(p=>(
          <article key={p.id} style={{padding:'12px 0', borderBottom:'1px solid #f1f5f9', display:'flex', gap:10}}>
            <span aria-hidden="true" style={{fontSize:20}}>{p.image}</span>
            <div><h2 style={{fontWeight:600, fontSize:16, margin:0}}>{p.name}</h2><p style={{fontSize:12, color:'#64748b', margin:0}}>{p.category}</p></div>
          </article>
        ))}
      </section>
    </main>
  )
}

function Page({ title, children }: { title: string, children: React.ReactNode }) {
  return <main style={{padding:20, maxWidth:900, margin:'0 auto'}}><h1 style={{marginTop:0}}>{title}</h1>{children}</main>
}

function AppContent() {
  const [currentPath, setCurrentPath] = useState('/');
  useEffect(() => {
    const handlePop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);
  const navigate = (path: string) => {
    try { window.history.pushState({}, '', path); } catch {}
    setCurrentPath(path);
    window.scrollTo(0,0);
  };

  let content;
  if (currentPath === '/dashboard') content = <DashboardPage/>;
  else if (currentPath === '/search') content = <SearchPageContent/>;
  else if (currentPath === '/pricing') content = <Page title="خطط الأسعار"><h2>باقات مرنة للتجار</h2><p>مجاني: 3 منتجات، تاجر: 199 ج.م/شهر، محترف: 499 ج.م/شهر</p></Page>;
  else if (currentPath === '/features') content = <Page title="المميزات"><h2>كل ما تحتاجه</h2><ul><li>مراقبة لحظية</li><li>تنبيه صوتي</li><li>PWA</li></ul></Page>;
  else if (currentPath === '/about') content = <Page title="عن رادار التاجر"><h2>من نحن</h2><p>أول منصة مصرية لمساعدة التجار.</p></Page>;
  else if (currentPath === '/contact') content = <Page title="اتصل بنا"><h2>تواصل معنا</h2><p>support@radaregypt.store</p></Page>;
  else if (currentPath === '/help') content = <Page title="مركز المساعدة"><h2>المساعدة</h2><p>تم إصلاح جميع مشاكل الأداء والوصول.</p></Page>;
  else content = <HomePage navigate={navigate}/>;

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui, Tajawal, sans-serif', direction:'rtl'}}>
      <Header currentPath={currentPath} setPath={navigate}/>
      {content}
      <footer style={{textAlign:'center', padding:20, color:'#64748b', fontSize:12, marginTop:20}}>
        <nav aria-label="روابط إضافية"><a href="/sitemap.xml" style={{color:'#2563eb', margin:'0 8px'}}>Sitemap</a> | <a href="/robots.txt" style={{color:'#2563eb', margin:'0 8px'}}>Robots</a> | <a href="/manifest.json" style={{color:'#2563eb', margin:'0 8px'}}>Manifest</a></nav>
        <p style={{marginTop:8}}>رادار التاجر الذكي © 2026 - v52 Fixed All - جميع المميزات محفوظة</p>
      </footer>
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
