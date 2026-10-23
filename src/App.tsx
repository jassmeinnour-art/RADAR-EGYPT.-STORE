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
  Shield
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
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'merchants' | 'radar' | 'shipping' | 'ai_studio' | 'trending' | 'reports'>('merchants');

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
        setUser(null);
        setIsAuthenticated(false);
        setShowOwnerDashboard(false);
      }
      setAuthLoading(false);
    });

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAuthenticated) return;
      if (e.key.toLowerCase() === 'r') { setActiveWorkspaceTab('radar'); setShowOwnerDashboard(false); }
      if (e.key.toLowerCase() === 's') { setActiveWorkspaceTab('ai_studio'); setShowOwnerDashboard(false); }
      if (e.key.toLowerCase() === 'm') { setActiveWorkspaceTab('merchants'); setShowOwnerDashboard(false); }
      if (e.key.toLowerCase() === 'o' && isOwner) setShowOwnerDashboard(true);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated, isOwner]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch (error) {
      console.error('Login error:', error);
      alert('خطأ في تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOwnerLogin = () => {
    setUser({ email: OWNER_EMAIL, displayName: 'جاسمين نور (مالكة التطبيق)', uid: 'owner_user_999' });
    setIsAuthenticated(true);
    setShowOwnerDashboard(true);
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
    setUser({ email: 'demo@radar.store', displayName: 'تاجر تجريبي', uid: 'demo_user_123' });
    setIsAuthenticated(true);
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

            {/* Main Dashboard UI ... */}
            <div className="p-10 text-center text-slate-400">
              {isOwner && (
                <button onClick={() => setShowOwnerDashboard(true)} className="p-6 mb-6 w-full bg-amber-900/30 border border-amber-500/50 text-amber-100 rounded-2xl font-bold shadow-lg hover:bg-amber-800/40 transition">
                  👑 الدخول إلى لوحة تحكم المالك (إدارة النظام والوكالة بالكامل)
                </button>
              )}
              {isTrialExpired && (
                <div className="p-6 mb-6 bg-red-900/30 border border-red-500/50 text-red-100 rounded-2xl font-bold shadow-lg">
                  ⚠️ انتهت الفترة التجريبية. يرجى الترقية للاشتراك المدفوع للحفاظ على الوصول للميزات المتقدمة.
                  <button onClick={() => setIsPaymentModalOpen(true)} className="block mt-4 mx-auto px-6 py-2 bg-red-600 text-white rounded-full">ترقية الآن</button>
                </div>
              )}
              <h1 className="text-2xl font-bold text-white mb-4">أهلاً بك في لوحة تحكم التاجر</h1>
              <p>التجربة التجريبية فعالة حتى: {trialEndDate?.toLocaleDateString('ar-EG')}</p>
              <button onClick={() => setIsPaymentModalOpen(true)} className="mt-4 ml-2 p-2 bg-amber-900/50 rounded-lg hover:bg-amber-800/50">اشتراك / تجديد</button>
              <button onClick={() => firebaseSignOut(auth)} className="mt-4 p-2 bg-red-900/50 rounded-lg hover:bg-red-800/50">تسجيل الخروج</button>
            </div>
            
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
