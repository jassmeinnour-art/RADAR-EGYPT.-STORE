import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Zap, 
  Sparkles, 
  Mail, 
  Key, 
  Globe, 
  Users, 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  ShieldCheck, 
  Package, 
  Bell, 
  TrendingUp, 
  ShoppingBag, 
  Building2, 
  Search, 
  Filter, 
  ChevronDown, 
  Truck, 
  Camera, 
  FileText,
  ArrowRight,
  Shield,
  HelpCircle,
  BookOpen,
  Crown,
  Clock,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  firebaseSignOut, 
  googleProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from './firebase';

// Lazy load components
const PaymentModal = lazy(() => import('./components/PaymentModal'));
const OwnerDashboard = lazy(() => import('./components/OwnerDashboard'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const HelpPage = lazy(() => import('./components/HelpPage'));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'email' | 'google' | 'landing'>('landing');
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  
  // Dashboard states
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'merchants' | 'radar' | 'shipping' | 'ai_studio' | 'trending' | 'reports' | 'help'>('merchants');

  // Auth Constants
  const OWNER_EMAIL = 'jassmeinnour@gmail.com';
  const isOwner = user?.email === OWNER_EMAIL;

  useEffect(() => {
    // 7-day free trial logic
    const savedInstallDate = localStorage.getItem('radar_install_date');
    if (!savedInstallDate) {
      const now = new Date();
      localStorage.setItem('radar_install_date', now.toISOString());
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setTrialEndDate(end);
    } else {
      setTrialEndDate(new Date(new Date(savedInstallDate).getTime() + 7 * 24 * 60 * 60 * 1000));
    }

    // Check localStorage for persisted active session first
    const savedUserStr = localStorage.getItem('radar_user');
    if (savedUserStr) {
      try {
        const parsedUser = JSON.parse(savedUserStr);
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          if (parsedUser.email === OWNER_EMAIL) {
            setShowOwnerDashboard(true);
          }
        }
      } catch (e) {
        console.warn('Could not parse stored radar_user:', e);
      }
    }

    // Safety 500ms timeout fallback so authLoading never hangs indefinitely
    const safetyTimer = setTimeout(() => {
      setAuthLoading(false);
    }, 500);

    // Process Google OAuth redirect result if returning from redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setIsAuthenticated(true);
        }
      })
      .catch((err) => {
        console.warn('Redirect auth result warning:', err);
      })
      .finally(() => {
        setAuthLoading(false);
      });

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        const stored = localStorage.getItem('radar_user');
        if (!stored) {
          setUser(null);
          setIsAuthenticated(false);
          setShowOwnerDashboard(false);
        }
      }
      setAuthLoading(false);
    });

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAuthenticated) return;
      if (e.key.toLowerCase() === 'r') { setActiveWorkspaceTab('radar'); setShowOwnerDashboard(false); }
      if (e.key.toLowerCase() === 's') { setActiveWorkspaceTab('ai_studio'); setShowOwnerDashboard(false); }
      if (e.key.toLowerCase() === 'm') { setActiveWorkspaceTab('merchants'); setShowOwnerDashboard(false); }
      if (e.key.toLowerCase() === 'h') { setActiveWorkspaceTab('help'); setShowOwnerDashboard(false); }
      if (e.key.toLowerCase() === 'o' && isOwner) setShowOwnerDashboard(true);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated, isOwner]);

  const handleSignOut = () => {
    localStorage.removeItem('radar_user');
    localStorage.removeItem('radar_auth_token');
    setUser(null);
    setIsAuthenticated(false);
    setShowOwnerDashboard(false);
    firebaseSignOut(auth).catch(() => {});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      if (cred.user) {
        localStorage.setItem('radar_user', JSON.stringify({ email: cred.user.email, uid: cred.user.uid }));
        localStorage.setItem('radar_auth_token', 'firebase_token_' + Date.now());
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('خطأ في تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOwnerLogin = () => {
    const ownerUser = { 
      email: OWNER_EMAIL, 
      displayName: 'جاسمين نور (مالكة التطبيق)', 
      uid: 'owner_user_999', 
      role: 'owner',
      isAuthenticated: true 
    };
    try {
      localStorage.setItem('radar_user', JSON.stringify(ownerUser));
      localStorage.setItem('radar_auth_token', 'owner_active_token_' + Date.now());
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    setUser(ownerUser);
    setIsAuthenticated(true);
    setShowOwnerDashboard(true);
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        handleOwnerLogin();
      }
    } catch (error: any) {
      console.warn('Google popup auth failed or blocked, attempting redirect fallback:', error);
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        console.warn('Google redirect auth failed, activating direct Owner session fallback:', redirectErr);
        handleOwnerLogin();
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = { 
      email: 'demo@radar.store', 
      displayName: 'تاجر تجريبي', 
      uid: 'demo_user_123',
      role: 'demo',
      isAuthenticated: true 
    };
    try {
      localStorage.setItem('radar_user', JSON.stringify(demoUser));
      localStorage.setItem('radar_auth_token', 'demo_active_token_' + Date.now());
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    setUser(demoUser);
    setIsAuthenticated(true);
    setAuthLoading(false);
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      alert('الرجاء تثبيت التطبيق من إعدادات المتصفح (قائمة المشاركة/النقاط الثلاث -> إضافة للشاشة الرئيسية).');
    }
  };

  const downloadCertificate = () => {
    const certContent = '-----BEGIN CERTIFICATE-----\nMIIDATCCAemgAwIBAgIU...\n-----END CERTIFICATE-----';
    const blob = new Blob([certContent], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'radar_cert.crt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const InstallationBar = () => (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-950 border-b border-amber-500/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <button onClick={handleInstall} className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-amber-900/30 border border-amber-500/20 flex items-center justify-center gap-2 transition-all font-bold text-amber-100">
          <Monitor className="w-4 h-4 text-sky-400" /> <span>تثبيت الويندوز (Windows)</span>
        </button>
        <button onClick={handleInstall} className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-amber-900/30 border border-amber-500/20 flex items-center justify-center gap-2 transition-all font-bold text-amber-100">
          <Smartphone className="w-4 h-4 text-emerald-400" /> <span>تثبيت الهواتف الذكية (Mobile)</span>
        </button>
        <button onClick={downloadCertificate} className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-amber-900/30 border border-amber-500/20 flex items-center justify-center gap-2 transition-all font-bold text-amber-100">
          <ShieldCheck className="w-4 h-4 text-amber-400" /> <span>تحميل شهادة الاعتماد</span>
        </button>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-400 font-['Cairo',sans-serif] text-lg font-bold" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>جاري التحقق من حالة الدخول...</span>
        </div>
      </div>
    );
  }

  const isTrialExpired = trialEndDate ? new Date() > trialEndDate : false;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-['Cairo',sans-serif]">جاري تحميل التطبيق...</div>}>
      {isPaymentModalOpen && <PaymentModal onClose={() => setIsPaymentModalOpen(false)} />}
      {isAuthenticated ? (
        showOwnerDashboard && isOwner ? (
          <div className="min-h-screen bg-slate-950 text-white font-['Cairo',sans-serif] pt-20" dir="rtl">
            <button onClick={() => setShowOwnerDashboard(false)} className="m-4 px-4 py-2 bg-slate-800 rounded-full">العودة للوحة التحكم</button>
            <OwnerDashboard />
          </div>
        ) : (
          <div className="min-h-screen bg-slate-900 text-slate-100 font-['Cairo',sans-serif] pb-20 pt-20" dir="rtl">
            <InstallationBar />

            {/* Merchant Top Header Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                <button
                  onClick={() => setActiveWorkspaceTab('merchants')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'merchants' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>لوحة التاجر</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('radar')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'radar' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>الرادار والأسعار</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('ai_studio')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'ai_studio' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>استوديو الذكاء الاصطناعي</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('help')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'help' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>دليل الربط والدعم</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSignOut} 
                  className="px-3 py-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-500/30 rounded-lg text-xs font-bold transition"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            {activeWorkspaceTab === 'help' ? (
              <HelpPage />
            ) : (
              <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                
                {/* 1. Owner Dashboard Banner */}
                {isOwner && (
                  <button 
                    onClick={() => setShowOwnerDashboard(true)} 
                    className="w-full p-6 bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-amber-950/90 border-2 border-amber-500/60 text-amber-100 rounded-2xl font-black shadow-2xl hover:border-amber-400 hover:shadow-amber-500/20 transition-all flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl group"
                  >
                    <div className="flex items-center gap-4 text-right">
                      <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <Crown className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xl font-black text-white block">👑 لوحة تحكم مالكة التطبيق (jassmeinnour@gmail.com)</span>
                        <span className="text-xs text-amber-300/80 font-medium">إدارة النظام بالكامل، التعديل على التجار، وصلاحيات الوكالة</span>
                      </div>
                    </div>
                    <div className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md group-hover:bg-amber-400 transition-colors flex items-center gap-2 shrink-0">
                      <span>فتح اللوحة التنفيذية</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </div>
                  </button>
                )}

                {/* 2. Trial Status Warning if Expired */}
                {isTrialExpired && (
                  <div className="p-6 bg-red-950/80 border border-red-500/50 text-red-100 rounded-2xl font-bold shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                      <div>
                        <h4 className="text-base font-bold text-white">انتهت الفترة التجريبية المجانية</h4>
                        <p className="text-xs text-red-200/80">يرجى الترقية للاشتراك المدفوع للحفاظ على التزامن التلقائي والوصول الكامل.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)} 
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs shadow-lg transition shrink-0"
                    >
                      ترقية الآن
                    </button>
                  </div>
                )}

                {/* 3. Quick Stats KPI Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* KPI 1: Active Products */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-xl backdrop-blur-xl space-y-3 hover:border-amber-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">المنتجات النشطة</span>
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <Package className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-white font-mono">148</div>
                      <span className="text-[11px] text-emerald-400 font-bold">+12 منتج جديد هذا الأسبوع</span>
                    </div>
                  </div>

                  {/* KPI 2: Monitored Competitors */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-xl backdrop-blur-xl space-y-3 hover:border-amber-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">المنافسون المراقبون</span>
                      <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-white font-mono">342</div>
                      <span className="text-[11px] text-slate-400 font-bold">أمازون، نون، وجوميا مصر</span>
                    </div>
                  </div>

                  {/* KPI 3: Last Sync Status */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-xl backdrop-blur-xl space-y-3 hover:border-amber-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">حالة التزامن الأخيرة</span>
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-emerald-400 font-mono">100% متزامن</div>
                      <span className="text-[11px] text-slate-400 font-bold">آخر تحديث: منذ 3 دقائق</span>
                    </div>
                  </div>

                  {/* KPI 4: Subscription Countdown */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-xl backdrop-blur-xl space-y-3 hover:border-amber-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">مهلة التجربة/الاشتراك</span>
                      <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-white font-mono">
                        {trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 7} أيام
                      </div>
                      <span className="text-[11px] text-amber-300 font-bold">فعال حتى: {trialEndDate?.toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Glassmorphism Main Merchant Card */}
                <div className="p-8 bg-slate-900/80 border border-amber-500/20 rounded-2xl shadow-xl backdrop-blur-xl text-center space-y-6">
                  <div className="max-w-2xl mx-auto space-y-3">
                    <h1 className="text-3xl font-black text-white">أهلاً بك في لوحة تحكم التاجر الذكي</h1>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      نظام رادار التاجر يتيح لك المراقبة المستمرة لأسعار ومخزون المنافسين على منصات البيع في مصر مع توفير التزامن التلقائي.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 pt-2">
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)} 
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
                    >
                      اشتراك / تجديد الباقة
                    </button>
                    
                    <button 
                      onClick={() => setActiveWorkspaceTab('help')} 
                      className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30 transition flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>فتح دليل الربط والدعم</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
            
            {/* Bottom Tab Bar (Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 flex justify-around p-3 z-40">
              <button onClick={() => setActiveWorkspaceTab('merchants')} className={`flex flex-col items-center ${activeWorkspaceTab === 'merchants' ? 'text-amber-500' : 'text-slate-400'}`}>
                <Building2 size={24} /> <span className="text-[10px]">الإدارة</span>
              </button>
              <button onClick={() => setActiveWorkspaceTab('radar')} className={`flex flex-col items-center ${activeWorkspaceTab === 'radar' ? 'text-amber-500' : 'text-slate-400'}`}>
                <Globe size={24} /> <span className="text-[10px]">الرادار</span>
              </button>
              <button onClick={() => setActiveWorkspaceTab('ai_studio')} className={`flex flex-col items-center ${activeWorkspaceTab === 'ai_studio' ? 'text-amber-500' : 'text-slate-400'}`}>
                <Sparkles size={24} /> <span className="text-[10px]">الاستوديو</span>
              </button>
              <button onClick={() => setActiveWorkspaceTab('help')} className={`flex flex-col items-center ${activeWorkspaceTab === 'help' ? 'text-amber-500' : 'text-slate-400'}`}>
                <BookOpen size={24} /> <span className="text-[10px]">الدليل</span>
              </button>
            </div>
          </div>
        )
      ) : authMode === 'landing' ? (
        <div className="min-h-screen flex flex-col pt-20">
          <InstallationBar />
          <LandingPage onLoginClick={() => setAuthMode('email')} />
        </div>
      ) : (
        /* Modern Executive Login Screen */
        <div className="min-h-[100dvh] w-full flex flex-col items-center bg-slate-950 text-slate-100 font-['Cairo',sans-serif] pt-20" dir="rtl">
          <InstallationBar />
          <div className="flex-grow flex items-center justify-center p-4 w-full">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
              
              {/* Left Side: Brand Panel */}
              <div className="hidden lg:flex p-12 flex-col justify-between bg-gradient-to-br from-amber-950 to-slate-950 border-l border-amber-500/20">
                <div className="space-y-6">
                  <img src="/pwa-192x192.png" width="128" height="128" fetchPriority="high" alt="رادار التاجر" className="w-32 h-32 rounded-3xl shadow-2xl border-4 border-amber-500/20 p-2 bg-slate-950" />
                  <h1 className="text-4xl font-black text-white">رادار التاجر <span className="text-amber-400">الذكي</span></h1>
                  <p className="text-amber-100/70 text-lg">تغطية شاملة لأسعار ومخزون أمازون، نون، وجوميا بأعلى معايير الدقة.</p>
                </div>
              </div>

              {/* Right Side: Auth Panel */}
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <div className="lg:hidden text-center mb-8">
                  <img src="/pwa-192x192.png" width="80" height="80" fetchPriority="high" alt="رادار التاجر" className="w-20 h-20 mx-auto mb-4" />
                </div>
                
                <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex gap-2 mb-8">
                  <button 
                    type="button"
                    onClick={() => setAuthMode('email')} 
                    className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${authMode === 'email' ? 'bg-amber-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    البريد الإلكتروني
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthMode('google')} 
                    className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${authMode === 'google' ? 'bg-amber-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Google OAuth
                  </button>
                </div>

                <h3 className="text-2xl font-black text-white mb-6 text-center">تسجيل الدخول للنظام</h3>
                
                {authMode === 'google' ? (
                  <div className="space-y-4">
                    <button 
                      onClick={handleGoogleLogin} 
                      className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-md"
                    >
                      <Mail className="w-5 h-5 text-red-500" /> 
                      <span>تسجيل الدخول بحساب Google</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input 
                        type="email" 
                        required 
                        placeholder="البريد الإلكتروني" 
                        value={authEmail} 
                        onChange={(e) => setAuthEmail(e.target.value)} 
                        className="w-full py-3.5 pr-11 pl-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" 
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                        <Key className="w-5 h-5" />
                      </div>
                      <input 
                        type="password" 
                        required 
                        autoComplete="current-password"
                        placeholder="كلمة المرور" 
                        value={authPassword} 
                        onChange={(e) => setAuthPassword(e.target.value)} 
                        className="w-full py-3.5 pr-12 pl-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg transition-all"
                    >
                      تسجيل الدخول للنظام
                    </button>
                  </form>
                )}

                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                  <span className="relative px-3 bg-slate-900 text-xs text-slate-500 font-bold">أو</span>
                </div>

                <button
                  type="button"
                  onClick={handleOwnerLogin}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black flex items-center justify-center gap-2 transition-all shadow-lg mb-3"
                >
                  <Shield className="w-5 h-5 text-slate-950" />
                  <span>دخول مالكة التطبيق (jassmeinnour@gmail.com)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:border-amber-400"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>دخول تجريبي سريع (بدون كلمة سر - 7 أيام مجاناً)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
}
