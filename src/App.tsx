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
    <header style={{ background: '#0f172a', color: '#fff', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setPath('/')} role="button" tabIndex={0}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>رادار التاجر الذكي</div>
      </div>

      <nav aria-label="الرئيسية" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PAGES.map(p => (
          <button
            key={p.path}
            onClick={() => setPath(p.path)}
            style={{
              background: currentPath === p.path ? '#2563eb' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: currentPath === p.path ? 700 : 400
            }}
          >
            {p.label}
          </button>
        ))}
      </nav>

      <button
        onClick={toggleSound}
        style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
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
        <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, sans-serif' }}>
          <Header currentPath={currentPath} setPath={setPath} />

          <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {currentPath === '/' && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>رادار التاجر الذكي</h1>
                <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '24px' }}>
                  منصة ذكية لتحليل السوق المصري
                </p>
                <button
                  onClick={() => setPath('/dashboard')}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🚀 لوحة التحكم
                </button>
              </div>
            )}

            {currentPath === '/dashboard' && (
              <div>
                <h2>📊 لوحة التحكم الرئيسية</h2>
                <p style={{ color: '#64748b' }}>أهلاً بك في رادار التاجر! متابعة تحليلات السوق والمبيعات.</p>
              </div>
            )}

            {currentPath === '/search' && (
              <div>
                <h2>🔍 بحث السوق والمنتجات</h2>
                <p style={{ color: '#64748b' }}>مراقبة المنافسين وتحليل المنتجات والأقسام.</p>
              </div>
            )}

            {currentPath === '/pricing' && (
              <div>
                <h2>💰 خطط الأسعار والاشتراكات</h2>
                <p style={{ color: '#64748b' }}>اختر الخطة المناسبة لحجم تجارتك.</p>
              </div>
            )}

            {currentPath === '/features' && (
              <div>
                <h2>⭐ مميزات المنصة</h2>
                <p style={{ color: '#64748b' }}>تعرف على الأدوات الذكية المتاحة لك.</p>
              </div>
            )}
          </main>
        </div>
      </AudioNotificationProvider>
    </WatchlistProvider>
  );
}
