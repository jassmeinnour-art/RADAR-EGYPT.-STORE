import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';

// === CONTEXTS & TYPES ===
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

// === PROVIDERS ===
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

// === CONSTANTS & NAVIGATION ===
const PAGES = [
  { path: '/', label: 'الرئيسية' },
  { path: '/dashboard', label: 'لوحة التحكم' },
  { path: '/search', label: 'البحث' },
  { path: '/pricing', label: 'الأسعار' },
  { path: '/features', label: 'المميزات' }
];

// === HEADER COMPONENT ===
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
        <img src="/pwa-192x192.png" alt="رادار التاجر" width={36} height={36} style={{ width: 36, height: 36, borderRadius: 8, background: '#38bdf8' }} loading="eager" decoding="async" />
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>رادار التاجر الذكي</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>RADAR EGYPT</div>
        </div>
      </div>

      <nav aria-label="الرئيسية" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PAGES.map(p => (
          <button
            key={p.path}
            onClick={() => setPath(p.path)}
            aria-label={`انتقل إلى ${p.label}`}
            aria-current={currentPath === p.path ? 'page' : undefined}
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

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={toggleSound}
          aria-label={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
          style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
        >
          {soundEnabled ? '🔔 الصوت مفعل' : '🔕 مكتوم'}
        </button>
      </div>
    </header>
  );
});

// === MAIN APP COMPONENT ===
export default function App() {
  const [currentPath, setPath] = useState('/');

  return (
    <WatchlistProvider>
      <AudioNotificationProvider>
        <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, sans-serif' }}>
          <Header currentPath={currentPath} setPath={setPath} />

          <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* الصفحة الرئيسية */}
            {currentPath === '/' && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <img src="/pwa-192x192.
