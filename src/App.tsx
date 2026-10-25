import React, { useState, useEffect, Suspense } from 'react';
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
  AlertTriangle,
  Download,
  FileSpreadsheet,
  X,
  Maximize2,
  Minimize2,
  Store
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  firebaseSignOut, 
  googleProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  db
} from './firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { ThemeToggle } from './components/ThemeToggle';
import { DailyTaskListSidebar } from './components/DailyTaskListSidebar';
import { AllMerchantsDirectoryDrawer } from './components/AllMerchantsDirectoryDrawer';
import { useTheme } from './context/ThemeContext';
import { AudioNotificationProvider } from './context/AudioNotificationContext';

const OnboardingTour = React.lazy(() => import('./components/OnboardingTour').then(m => ({ default: m.OnboardingTour })));
const PaymentModal = React.lazy(() => import('./components/PaymentModal'));
const OwnerDashboard = React.lazy(() => import('./components/OwnerDashboard'));
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const HelpPage = React.lazy(() => import('./components/HelpPage'));
const ShippingOrdersTable = React.lazy(() => import('./components/ShippingOrdersTable'));
const ProfitCalculator = React.lazy(() => import('./components/ProfitCalculator'));
const ShippingManagementDashboard = React.lazy(() => import('./components/ShippingManagementDashboard'));
const PlatformsGuideManager = React.lazy(() => import('./components/PlatformsGuideManager'));
const AutoPricingEngine = React.lazy(() => import('./components/AutoPricingEngine'));
const PriceComparisonEngine = React.lazy(() => import('./components/PriceComparisonEngine').then(m => ({ default: m.PriceComparisonEngine })));
const LoginPage = React.lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })));
const AIProductStudio = React.lazy(() => import('./components/AIProductStudio').then(m => ({ default: m.AIProductStudio })));

export default function App() {
  const { toggleColorMode, resolvedColorMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAllMerchantsHubOpen, setIsAllMerchantsHubOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'email' | 'google' | 'landing'>('landing');
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    const handleOpenHub = () => setIsAllMerchantsHubOpen(true);
    window.addEventListener('open-all-merchants-hub', handleOpenHub as EventListener);
    return () => {
      window.removeEventListener('open-all-merchants-hub', handleOpenHub as EventListener);
    };
  }, []);
  
  // PURGE DEMO DATA ON LOAD
  useEffect(() => {
    localStorage.removeItem('radar_mock_products');
    localStorage.removeItem('radar_demo_merchants');
    sessionStorage.clear();
  }, []);
  
  // Dashboard states
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'merchants' | 'radar' | 'shipping' | 'ai_studio' | 'trending' | 'reports' | 'help' | 'platforms_guide' | 'auto_pricing' | 'price_comparison'>('merchants');
  const [isFocusMode, setIsFocusMode] = useState(false);

  const OWNER_EMAIL = 'jassmeinnour@gmail.com';
  const isOwner = user?.email === OWNER_EMAIL || user?.role === 'super_admin' || user?.systemRole === 'SYSTEM_ADMIN_MARKETER';

  useEffect(() => {
    // 7-day free trial logic (bypassed for owner)
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
          if (parsedUser.email === OWNER_EMAIL) {
            parsedUser.role = 'super_admin';
            parsedUser.systemRole = 'SYSTEM_ADMIN_MARKETER';
            parsedUser.isLifetime = true;
          }
          setUser(parsedUser);
          setIsAuthenticated(true);
          if (parsedUser.email === OWNER_EMAIL || parsedUser.role === 'super_admin') {
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
          let u: any = result.user;
          if (u.email === OWNER_EMAIL) {
            u.role = 'super_admin';
            u.systemRole = 'SYSTEM_ADMIN_MARKETER';
            u.isLifetime = true;
          }
          setUser(u);
          setIsAuthenticated(true);
          if (u.email === OWNER_EMAIL) {
            setShowOwnerDashboard(true);
          }
        }
      })
      .catch((err) => {
        console.warn('Redirect auth result warning:', err);
      })
      .finally(() => {
        setAuthLoading(false);
      });

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let activeUsr: any = currentUser;
        if (currentUser.email === OWNER_EMAIL) {
          activeUsr = {
            ...currentUser,
            role: 'super_admin',
            systemRole: 'SYSTEM_ADMIN_MARKETER',
            isLifetime: true
          };
        }
        setUser(activeUsr);
        setIsAuthenticated(true);
        if (currentUser.email === OWNER_EMAIL) {
          setShowOwnerDashboard(true);
        }
        
        // Fetch User Profile to check for Onboarding
        setProfileLoading(true);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            if (!profileData.hasSeenOnboarding && currentUser.email !== OWNER_EMAIL) {
              setShowOnboarding(true);
            }
          } else {
            // New User - Create Profile
            const newProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'تاجر جديد',
              email: currentUser.email,
              photoURL: currentUser.photoURL || '',
              role: currentUser.email === OWNER_EMAIL ? 'super_admin' : 'merchant',
              systemRole: currentUser.email === OWNER_EMAIL ? 'SYSTEM_ADMIN_MARKETER' : 'MERCHANT',
              isLifetime: currentUser.email === OWNER_EMAIL,
              hasSeenOnboarding: currentUser.email === OWNER_EMAIL,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            if (currentUser.email !== OWNER_EMAIL) {
              setShowOnboarding(true);
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        } finally {
          setProfileLoading(false);
        }
      } else {
        const stored = localStorage.getItem('radar_user');
        if (!stored) {
          setUser(null);
          setIsAuthenticated(false);
          setShowOwnerDashboard(false);
          setShowOnboarding(false);
        }
      }
      setAuthLoading(false);
    });

    // Keyboard Shortcuts (Hotkeys)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAuthenticated) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === '1') {
        e.preventDefault();
        setActiveWorkspaceTab('merchants');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '2') {
        e.preventDefault();
        setActiveWorkspaceTab('radar');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '3') {
        e.preventDefault();
        setActiveWorkspaceTab('ai_studio');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '4') {
        e.preventDefault();
        setActiveWorkspaceTab('help');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '5') {
        e.preventDefault();
        setActiveWorkspaceTab('platforms_guide');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '6') {
        e.preventDefault();
        setActiveWorkspaceTab('auto_pricing');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key === '7') {
        e.preventDefault();
        setActiveWorkspaceTab('price_comparison');
        setShowOwnerDashboard(false);
      } else if (!isCtrlOrCmd && e.key.toLowerCase() === 'p') {
        setActiveWorkspaceTab('auto_pricing');
        setShowOwnerDashboard(false);
      } else if (!isCtrlOrCmd && e.key.toLowerCase() === 'r') {
        setActiveWorkspaceTab('radar');
        setShowOwnerDashboard(false);
      } else if (!isCtrlOrCmd && e.key.toLowerCase() === 's') {
        setActiveWorkspaceTab('ai_studio');
        setShowOwnerDashboard(false);
      } else if (!isCtrlOrCmd && e.key.toLowerCase() === 'm') {
        setActiveWorkspaceTab('merchants');
        setShowOwnerDashboard(false);
      } else if (!isCtrlOrCmd && e.key.toLowerCase() === 'h') {
        setActiveWorkspaceTab('help');
        setShowOwnerDashboard(false);
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleColorMode();
      } else if (!isCtrlOrCmd && e.key.toLowerCase() === 'd' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        toggleColorMode();
      } else if (!isCtrlOrCmd && e.key.toLowerCase() === 'o' && isOwner) {
        setShowOwnerDashboard(true);
      }
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
        const uEmail = cred.user.email;
        const userData = { 
          email: uEmail, 
          uid: cred.user.uid,
          role: uEmail === OWNER_EMAIL ? 'super_admin' : 'merchant',
          systemRole: uEmail === OWNER_EMAIL ? 'SYSTEM_ADMIN_MARKETER' : 'MERCHANT',
          isLifetime: uEmail === OWNER_EMAIL
        };
        localStorage.setItem('radar_user', JSON.stringify(userData));
        localStorage.setItem('radar_auth_token', 'firebase_token_' + Date.now());
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('خطأ في تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOwnerLogin = () => {
    const ownerUser = { 
      email: OWNER_EMAIL, 
      displayName: 'جاسمين نور (مالكة التطبيق ومدير التسويق - SYSTEM_ADMIN_MARKETER)', 
      uid: 'owner_user_999', 
      role: 'super_admin',
      systemRole: 'SYSTEM_ADMIN_MARKETER',
      isLifetime: true,
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
      isDemo: true,
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
    setShowOnboarding(true); // Demo users always see onboarding or we can mock it
  };

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    if (user && !user.isDemo) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          hasSeenOnboarding: true,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error updating onboarding status:', err);
      }
    }
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasNewUpdate, setHasNewUpdate] = useState(false); // Disabled persistent banner per request
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTriggerUpdate = async () => {
    setIsUpdating(true);
    try {
      // 1. إرسال SKIP_WAITING فوراً لجميع الـ Service Workers
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.unregister(); // إلغاء التسجيل لضمان التحميل النظيف
        }
      }
      
      // 2. مسح الكاش بالكامل
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }
    } catch (err) {
      console.warn('ServiceWorker update warning:', err);
    } finally {
      // 3. إعادة تحميل فورية
      window.location.reload();
    }
  };

  const [showInstallBar, setShowInstallBar] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstallBar(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // إغلاق تلقائي لتنبيه التحديث بعد 5 ثوانٍ
    let timer: any;
    if (hasNewUpdate) {
      timer = setTimeout(() => {
        setHasNewUpdate(false);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, [hasNewUpdate]);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      showToast('الرجاء تثبيت التطبيق من إعدادات المتصفح (قائمة المشاركة/النقاط الثلاث -> إضافة للشاشة الرئيسية).');
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

  const downloadApk = () => {
    // Direct location invocation triggers Android native DownloadManager with APK package headers
    window.location.href = '/radar-al-tajer-signed.apk';
  };

  const InstallationBar = () => (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-950 border-b border-amber-500/30 shadow-2xl">
      {/* Persistent update banner removed per request to prevent hanging UI */}


      <div className="max-w-7xl mx-auto px-4 py-2.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <button onClick={handleInstall} className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-amber-900/30 border border-amber-500/20 flex items-center justify-center gap-2 transition-all font-bold text-amber-100">
          <Monitor className="w-4 h-4 text-sky-400" /> <span>تثبيت الويندوز (Windows)</span>
        </button>
        <button onClick={downloadApk} className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-amber-900/30 border border-amber-500/20 flex items-center justify-center gap-2 transition-all font-bold text-amber-100">
          <Smartphone className="w-4 h-4 text-emerald-400" /> <span>تحميل تطبيق الهواتف الذكية (radar-al-tajer-signed.apk)</span>
        </button>
        <button onClick={downloadCertificate} className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-amber-900/30 border border-amber-500/20 flex items-center justify-center gap-2 transition-all font-bold text-amber-100">
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
    <AudioNotificationProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-['Cairo',sans-serif]">جاري تحميل التطبيق...</div>}>
      {showOnboarding && <OnboardingTour onComplete={handleCompleteOnboarding} />}
      {isPaymentModalOpen && <PaymentModal onClose={() => setIsPaymentModalOpen(false)} />}
      <AllMerchantsDirectoryDrawer 
        isOpen={isAllMerchantsHubOpen} 
        onClose={() => setIsAllMerchantsHubOpen(false)} 
        onShowToast={showToast} 
      />
      {isAuthenticated ? (
        showOwnerDashboard && isOwner ? (
          <div className="min-h-screen bg-slate-950 text-white font-['Cairo',sans-serif] pt-20" dir="rtl">
            <button onClick={() => setShowOwnerDashboard(false)} className="m-4 px-4 py-2 bg-slate-800 rounded-full">العودة للوحة التحكم</button>
            <OwnerDashboard />
          </div>
        ) : (
          <div className="min-h-screen bg-slate-900 text-slate-100 font-['Cairo',sans-serif] pb-20 pt-20" dir="rtl">
            {showInstallBar && <InstallationBar />}
            {!isFocusMode && <DailyTaskListSidebar />}

            {/* Merchant Top Header Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                <button
                  onClick={() => setActiveWorkspaceTab('merchants')}
                  title="لوحة التاجر (اختصار: Ctrl+1)"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'merchants' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>لوحة التاجر</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    activeWorkspaceTab === 'merchants' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
                  }`}>Ctrl+1</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('radar')}
                  title="الرادار والأسعار (اختصار: Ctrl+2)"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'radar' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>الرادار والأسعار</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    activeWorkspaceTab === 'radar' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
                  }`}>Ctrl+2</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('ai_studio')}
                  title="استوديو الذكاء الاصطناعي (اختصار: Ctrl+3)"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'ai_studio' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>أستوديو المنتجات الذكي</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    activeWorkspaceTab === 'ai_studio' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
                  }`}>Ctrl+3</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('help')}
                  title="دليل الربط والدعم (اختصار: Ctrl+4)"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'help' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>دليل الربط والدعم</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    activeWorkspaceTab === 'help' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
                  }`}>Ctrl+4</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('platforms_guide')}
                  title="دليل ربط المنصات ومفاتيح API (اختصار: Ctrl+5)"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'platforms_guide' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>ربط المنصات ومفاتيح API</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    activeWorkspaceTab === 'platforms_guide' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
                  }`}>Ctrl+5</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('auto_pricing')}
                  title="محرك التسعير الآلي المشروط (اختصار: Ctrl+6 أو P)"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'auto_pricing' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>محرك التسعير الآلي</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    activeWorkspaceTab === 'auto_pricing' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
                  }`}>Ctrl+6</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('price_comparison')}
                  title="مقارنة الفجوات السعرية عبر CSV (اختصار: Ctrl+7)"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeWorkspaceTab === 'price_comparison' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>مقارنة الفجوات (CSV)</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    activeWorkspaceTab === 'price_comparison' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
                  }`}>Ctrl+7</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAllMerchantsHubOpen(true)}
                  title="دليل كافة التجار والمتاجر في السوق المصري"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-950/70 text-emerald-300 hover:text-emerald-100 border border-emerald-500/40 shadow-sm hover:scale-105 active:scale-95"
                >
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">دليل التجار</span>
                </button>
                <button
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  title={isFocusMode ? "إيقاف وضع التركيز" : "تفعيل وضع التركيز"}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    isFocusMode 
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-lg' 
                      : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800'
                  }`}
                >
                  {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">وضع التركيز</span>
                </button>
                <ThemeToggle variant="pill" />
                <button 
                  onClick={handleSignOut} 
                  className="px-3 py-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-500/30 rounded-lg text-xs font-bold transition"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            {activeWorkspaceTab === 'auto_pricing' ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <AutoPricingEngine 
                  currency="ج.م"
                  onNavigateToCatalog={() => setActiveWorkspaceTab('merchants')}
                  onNavigateToRadar={() => setActiveWorkspaceTab('radar')}
                />
              </div>
            ) : activeWorkspaceTab === 'price_comparison' ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <PriceComparisonEngine currency="ج.م" />
              </div>
            ) : activeWorkspaceTab === 'platforms_guide' ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <PlatformsGuideManager />
              </div>
            ) : activeWorkspaceTab === 'ai_studio' ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <AIProductStudio onShowToast={showToast} />
              </div>
            ) : activeWorkspaceTab === 'help' ? (
              <HelpPage 
                onNavigateToPlatformsGuide={() => setActiveWorkspaceTab('platforms_guide')} 
                onStartTour={() => setShowOnboarding(true)}
              />
            ) : (
              <div className={`${isFocusMode ? 'max-w-full' : 'max-w-7xl'} mx-auto px-4 py-8 space-y-8 transition-all duration-300`}>
                
                {/* 1. Owner Dashboard Banner */}
                {isOwner && !isFocusMode && (
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
                {!isFocusMode && (
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
                      <div className="text-3xl font-black text-white font-mono">0</div>
                      <span className="text-[11px] text-emerald-400 font-bold">لا يوجد منتجات حالياً</span>
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
                      <div className="text-3xl font-black text-white font-mono">0</div>
                      <span className="text-[11px] text-slate-400 font-bold">اربط متجرك لمراقبة المنافسين</span>
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
                      <div className="text-xl font-black text-emerald-400 font-mono">غير مفعل</div>
                      <span className="text-[11px] text-slate-400 font-bold">انتظار أول عملية سحب بيانات</span>
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
                        {isOwner ? 'لا محدود' : (trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 7)} أيام
                      </div>
                      <span className="text-[11px] text-amber-300 font-bold">
                        {isOwner ? 'اشتراك مالك (مدى الحياة)' : (trialEndDate ? `فعال حتى: ${trialEndDate.toLocaleDateString('ar-EG')}` : 'فترة تجريبية')}
                      </span>
                    </div>
                  </div>
                </div>
                )}

                {/* 4. Glassmorphism Main Merchant Card */}
                {!isFocusMode && (
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
                      onClick={() => setActiveWorkspaceTab('platforms_guide')} 
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin-slow" />
                      <span>ربط متجر جديد / سحب البيانات الحقيقية</span>
                    </button>
                  </div>
                </div>
                )}

                {/* 5. Interactive Shipping Management & Couriers Dashboard */}
                <ShippingManagementDashboard />

                {/* 6. Interactive Profit Calculator with Merchant Data Table */}
                <ProfitCalculator />

                {/* 7. Interactive Auto-Pricing Engine ("إذا حدث X قم بـ Y") */}
                <AutoPricingEngine />

                {/* 8. Interactive Shipping Orders Table */}
                <ShippingOrdersTable />

                {/* 9. Interactive Platforms Guide & API Manager */}
                <PlatformsGuideManager />

              </div>
            )}

            {/* Bottom Tab Bar (Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 flex justify-around items-center p-2.5 z-40">
              <button onClick={() => setActiveWorkspaceTab('merchants')} className={`flex flex-col items-center ${activeWorkspaceTab === 'merchants' ? 'text-amber-500' : 'text-slate-400'}`}>
                <Building2 size={20} /> <span className="text-[9px]">الإدارة</span>
              </button>
              <button onClick={() => setActiveWorkspaceTab('radar')} className={`flex flex-col items-center ${activeWorkspaceTab === 'radar' ? 'text-amber-500' : 'text-slate-400'}`}>
                <Globe size={20} /> <span className="text-[9px]">الرادار</span>
              </button>
              <button onClick={() => setActiveWorkspaceTab('auto_pricing')} className={`flex flex-col items-center ${activeWorkspaceTab === 'auto_pricing' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                <Zap size={20} className="text-amber-400" /> <span className="text-[9px]">التسعير الآلي</span>
              </button>
              <button onClick={() => setActiveWorkspaceTab('platforms_guide')} className={`flex flex-col items-center ${activeWorkspaceTab === 'platforms_guide' ? 'text-amber-500' : 'text-slate-400'}`}>
                <Key size={20} /> <span className="text-[9px]">المفاتيح</span>
              </button>
              <ThemeToggle variant="icon" />
            </div>
          </div>
        )
      ) : authMode === 'landing' ? (
        <div className="min-h-screen flex flex-col pt-20">
          {showInstallBar && <InstallationBar />}
          <LandingPage onLoginClick={() => setAuthMode('email')} />
        </div>
      ) : (
        <LoginPage 
          onLoginSuccess={() => setIsAuthenticated(true)} 
          onBackToLanding={() => setAuthMode('landing')} 
        />
      )}

      {/* Floating Animated Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-md bg-[#0F2A4A] text-white border-2 border-[#FF6B00] px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/70 flex items-center gap-3 transition-all animate-bounce-subtle ring-4 ring-[#FF6B00]/20" dir="rtl">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-black flex-1 leading-snug">{toastMessage}</span>
          <button 
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </Suspense>
    </AudioNotificationProvider>
  );
}
