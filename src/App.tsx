import React, { useState, useEffect, createContext, useContext, useMemo, memo } from "react";

type WatchlistContextType = { watchlist: string[]; addToWatchlist: (id: string) => void; removeFromWatchlist: (id: string) => void; isInWatchlist: (id: string) => boolean; }
const WatchlistContext = createContext<WatchlistContextType>({ watchlist: [], addToWatchlist: () => {}, removeFromWatchlist: () => {}, isInWatchlist: () => false });
type AudioContextType = { soundEnabled: boolean; toggleSound: () => void; playAlert: () => void; }
const AudioContext = createContext<AudioContextType>({ soundEnabled: true, toggleSound: () => {}, playAlert: () => {} });

function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('radar_watchlist') || '[]'); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('radar_watchlist', JSON.stringify(watchlist)); } catch {} }, [watchlist]);
  const value = useMemo(() => ({ watchlist, addToWatchlist: (id: string) => setWatchlist(w => w.includes(id) ? w : [...w, id]), removeFromWatchlist: (id: string) => setWatchlist(w => w.filter(x => x !== id)), isInWatchlist: (id: string) => watchlist.includes(id) }), [watchlist]);
  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}
function AudioNotificationProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const value = useMemo(() => ({ soundEnabled, toggleSound: () => setSoundEnabled(s => !s), playAlert: () => { if (!soundEnabled) return; try { const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); const o = ctx.createOscillator(); o.frequency.value = 800; o.connect(ctx.destination); o.start(); setTimeout(() => o.stop(), 200); } catch {} } }), [soundEnabled]);
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

const MOCK_PRODUCTS = [{ id: '1', name: 'iPhone 15 Pro Max 256GB', category: 'موبايلات', image: '📱', price: 58999 }, { id: '2', name: '【entity-Samsung¦canonical_name=Samsung】 Galaxy S24 Ultra', category: 'موبايلات', image: '📱', price: 45999 }];
const PAGES = [{ path: '/', label: 'الرئيسية' }, { path: '/dashboard', label: 'لوحة التحكم' }, { path: '/search', label: 'البحث' }, { path: '/pricing', label: 'الأسعار' }, { path: '/features', label: 'المميزات' }, { path: '/about', label: 'عنا' }, { path: '/contact', label: 'اتصل بنا' }, { path: '/help', label: 'المساعدة' }];

const Header = memo(function Header({ currentPath, setPath }: { currentPath: string; setPath: (p: string) => void }) {
  const { watchlist } = useContext(WatchlistContext); const { soundEnabled, toggleSound } = useContext(AudioContext);
  return (
    <header style={{background:'#0f172a', color:'#fff', padding:'12px 20px', position:'sticky', top:0, zIndex:50, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10}}>
      <div style={{display:'flex', alignItems:'center', gap:12, cursor:'pointer'}} onClick={()=>setPath('/')} role="button" tabIndex={0} aria-label="العودة للرئيسية">
        <img src="/pwa-192x192.png" alt="رادار التاجر" width={36} height={36} style={{width:36,height:36,borderRadius:8,background:'#38bdf8'}} loading="eager" decoding="async" />
        <div><div style={{fontWeight:800, fontSize:18}}>رادار التاجر الذكي</div><div style={{fontSize:11, opacity:0.7}}>RADAR EGYPT</div></div>
      </div>
      <nav aria-label="القائمة الرئيسية" style={{display:'flex', gap:6, flexWrap:'wrap'}}>
        {PAGES.map(p => (<button key={p.path} onClick={()=>setPath(p.path)} aria-label={`الذهاب إلى ${p.label}`} aria-current={currentPath===p.path ? 'page' : undefined} style={{background: currentPath===p.path ? '#1e293b' : 'transparent', color: currentPath===p.path ? '#38bdf8' : '#cbd5e1', border:'1px solid '+(currentPath===p.path?'#334155':'transparent'), padding:'6px 12px', borderRadius:20, cursor:'pointer', fontSize:13}}>{p.label}</button>))}
      </nav>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <button onClick={toggleSound} aria-label={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'} style={{background:'#1e293b', border:'none', color:'#fff', padding:'6px 10px', borderRadius:20, cursor:'pointer'}}>{soundEnabled?'🔊':'🔇'}</button>
        <div aria-label={`${watchlist.length} متابع`} style={{background:'#1e293b', padding:'6px 12px', borderRadius:20, fontSize:13}}>⭐ {watchlist.length}</div>
      </div>
    </header>
  )
});

function AppContent() {
  const [currentPath, setCurrentPath] = useState('/');
  useEffect(() => { const h = () => setCurrentPath(window.location.pathname); window.addEventListener('popstate', h); return () => window.removeEventListener('popstate', h); }, []);
  const navigate = (path: string) => { try { window.history.pushState({}, '', path); } catch {} setCurrentPath(path); window.scrollTo(0,0); };
  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,Tajawal,sans-serif', direction:'rtl'}}>
      <Header currentPath={currentPath} setPath={navigate}/>
      <main style={{padding:20, maxWidth:1200, margin:'0 auto'}}>
        <section style={{background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', color:'#fff', borderRadius:16, padding:'40px 20px', textAlign:'center'}}>
          <img src="/pwa-192x192.png" alt="رادار التاجر" width={192} height={192} style={{width:96,height:96,margin:'0 auto 16px',display:'block',borderRadius:16}} loading="eager" fetchPriority="high" />
          <h1 style={{fontSize:36, fontWeight:900, margin:0}}>رادار التاجر الذكي</h1>
          <h2 style={{fontSize:18, opacity:0.8, fontWeight:400, marginTop:10}}>منصة ذكية لتحليل السوق المصري - تم إصلاح البناء ✅</h2>
          <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:20}}><button onClick={()=>navigate('/dashboard')} aria-label="فتح لوحة التحكم" style={{background:'#38bdf8', color:'#0f172a', border:'none', padding:'12px 24px', borderRadius:10, fontWeight:800, cursor:'pointer'}}>🚀 لوحة التحكم</button></div>
        </section>
      </main>
      <footer style={{textAlign:'center', padding:20, color:'#64748b', fontSize:12}}>رادار التاجر © 2026 - v53</footer>
    </div>
  )
}
export default function App() { return (<AudioNotificationProvider><WatchlistProvider><AppContent /></WatchlistProvider></AudioNotificationProvider>) }
