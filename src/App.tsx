import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';

type WatchlistContextType = {
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
};

const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [],
  addToWatchlist: () => {},
  removeFromWatchlist: () => {},
  isInWatchlist: () => false
});

type AudioContextType = {
  soundEnabled: boolean;
  toggleSound: () => void;
  playAlert: () => void;
};

const AudioContext = createContext<AudioContextType>({
  soundEnabled: true,
  toggleSound: () => {},
  playAlert: () => {}
});

function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('radar_watchlist') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('radar_watchlist', JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  const value = useMemo(() => ({
    watchlist,
    addToWatchlist: (id: string) => setWatchlist(w => (w.includes(id) ? w : [...w, id])),
    removeFromWatchlist: (id: string) => setWatchlist(w => w.filter(item => item !== id)),
    isInWatchlist: (id: string) => watchlist.includes(id)
  }), [watchlist]);

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
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
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch {}
    }
  }), [soundEnabled]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

const PAGES = [
  { path: '/', label: 'الرئيسية' },
  { path: '/dashboard', label: 'لوحة التحكم' },
  { path: '/search', label: 'البحث' },
  { path: '/pricing', label: 'الأسعار' },
  { path: '/features', label: 'المميزات' }
];

const Header = React.memo(function Header({
  currentPath,
  setPath
}: {
  currentPath: string;
  setPath: (p: string) => void;
}) {
  const { soundEnabled, toggleSound } = useContext(AudioContext);

  return (
    <header style={{ 
      background: '#0f172a', 
      color: '#fff', 
      padding: '16px 24px', 
      position: 'sticky', 
      top: 0, 
      zIndex: 50, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setPath('/')}>
        <div style={{ background: '#3b82f6', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>رادار</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '18px' }}>رادار التاجر الذكي</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>RADAR EGYPT</div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {PAGES.map(p => (
          <button
            key={p.path}
            onClick={() => setPath(p.path)}
            style={{
              background: currentPath === p.path ? '#2563eb' : '#1e293b',
              color: '#fff',
              border: currentPath === p.path ? '2px solid #60a5fa' : '1px solid #334155',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: currentPath === p.path ? 700 : 500,
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {p.label}
          </button>
        ))}
      </nav>

      <button
        onClick={toggleSound}
        style={{ 
          background: '#334155', 
          border: '1px solid #475569', 
          color: '#fff', 
          padding: '8px 14px', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontSize: '13px',
          fontWeight: 'bold'
        }}
      >
        {soundEnabled ? '🔔 الصوت مفعل' : '🔕 مكتوم'}
      </button>
    </header>
  );
});

export default function App() {
  const [currentPath, setPath] = useState('/');

  return (
    <WatchlistProvider>
      <AudioNotificationProvider>
        <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <Header currentPath={currentPath} setPath={setPath} />

          <main style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            {currentPath === '/' && (
              <div style={{ textAlign: 'center', background: '#fff', padding: '50px 30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h1 style={{ fontSize: '36px', marginBottom: '16px', color: '#0f172a' }}>رادار التاجر الذكي</h1>
                <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '30px' }}>
                  منصة ذكية متكاملة لتحليل السوق المصري ومتابعة المنافسين على أمازون ونون
                </p>
                <button
                  onClick={() => setPath('/dashboard')}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                >
                  🚀 الدخول إلى لوحة التحكم
                </button>
              </div>
            )}

            {currentPath === '/dashboard' && (
              <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#0f172a' }}>📊 لوحة التحكم الرئيسية</h2>
                <p style={{ color: '#64748b', fontSize: '16px' }}>أهلاً بك يا جاسمين! هنا يتم متابعة تحليلات السوق، والمبيعات، وحالة المنتجات مباشرة.</p>
              </div>
            )}

            {currentPath === '/search' && (
              <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#0f172a' }}>🔍 بحث السوق والمنتجات</h2>
                <p style={{ color: '#64748b', fontSize: '16px' }}>أداة البحث المتقدم لمراقبة المنافسين وتحليل أسعار الفئات المختلفة.</p>
              </div>
            )}

            {currentPath === '/pricing' && (
              <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#0f172a' }}>💰 خطط الأسعار والاشتراكات</h2>
                <p style={{ color: '#64748b', fontSize: '16px' }}>استعرض الباقات المتاحة لتطوير أعمالك وتجارتك الإلكترونية.</p>
              </div>
            )}

            {currentPath === '/features' && (
              <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#0f172a' }}>⭐ مميزات المنصة</h2>
                <p style={{ color: '#64748b', fontSize: '16px' }}>تعرف على الخصائص والأدوات الذكية المصممة خصيصاً لتجار السوق المصري.</p>
              </div>
            )}
          </main>
        </div>
      </AudioNotificationProvider>
    </WatchlistProvider>
  );
}
