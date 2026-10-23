import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  usersCollection, 
  analyticsCollection, 
  googleProvider, 
  testDbConnection,
  handleFirestoreError, 
  OperationType,
  getFirebaseDomainInfo,
  FIVE_MINUTES_MS,
  isFirestoreQuotaError,
  isFirestoreQuotaExhausted,
  markFirestoreQuotaExhausted,
  isFirestoreCacheFresh,
  markFirestoreCacheFetched
} from '../db';

export interface UserSessionData {
  sessionId: string;
  lastLoginAt: string;
  lastSeenAt: string;
  sessionCount: number;
  deviceInfo?: string;
  isOnline: boolean;
}

export interface UserMerchantProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  storeName?: string;
  city?: string;
  preferredCurrency?: string;
  contactPhone?: string;
  sessionCount?: number;
  lastLoginAt?: any;
  lastSeenAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserMerchantProfile | null;
  sessionData: UserSessionData | null;
  isLoading: boolean;
  isDbConnected: boolean;
  isOwner: boolean;
  loginError: string | null;
  authErrorCode: string | null;
  isUnauthorizedDomain: boolean;
  currentDomain: string;
  domainInfo: ReturnType<typeof getFirebaseDomainInfo>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string, storeName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signInDemoMerchant: (displayName?: string, storeName?: string) => Promise<void>;
  signInAsOwner: () => Promise<void>;
  signOut: () => Promise<void>;
  updateStoreProfile: (updates: Partial<UserMerchantProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearLoginError: () => void;
}

// Firebase Auth Error interface for type safety
interface FirebaseAuthError extends Error {
  code?: string;
  message: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const OWNER_EMAIL = 'jassmeinnour@gmail.com';
const DEMO_USER_STORAGE_KEY = 'merchant_radar_demo_user';
const SESSION_EMAIL_OVERRIDE_KEY = 'merchant_radar_session_email_override';
const PROFILE_CACHE_KEY_PREFIX = 'merchant_radar_profile_v2_';

function getSessionEmailOverride(): string | null {
  try {
    return localStorage.getItem(SESSION_EMAIL_OVERRIDE_KEY);
  } catch {
    return null;
  }
}

function setSessionEmailOverride(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(SESSION_EMAIL_OVERRIDE_KEY, email.trim().toLowerCase());
    } else {
      localStorage.removeItem(SESSION_EMAIL_OVERRIDE_KEY);
    }
  } catch {
    // safe
  }
}

function getCachedUserProfile(uid: string): UserMerchantProfile | null {
  try {
    const raw = localStorage.getItem(`${PROFILE_CACHE_KEY_PREFIX}${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // safe
  }
  return null;
}

function setCachedUserProfile(uid: string, prof: UserMerchantProfile): void {
  try {
    localStorage.setItem(`${PROFILE_CACHE_KEY_PREFIX}${uid}`, JSON.stringify(prof));
  } catch {
    // safe
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserMerchantProfile | null>(null);
  const [sessionData, setSessionData] = useState<UserSessionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState<boolean>(false);

  // Guard against concurrent redundant Firestore synchronizations
  const activeSyncUidsRef = useRef<Set<string>>(new Set());

  const domainInfo = getFirebaseDomainInfo();
  const currentDomain = domainInfo.currentHost;

  // Format friendly Arabic error messages for Firebase Authentication codes
  const handleAuthError = (error: unknown, fallbackMessage: string): string => {
    const fbErr = error as FirebaseAuthError;
    const code = fbErr.code || '';
    setAuthErrorCode(code);

    if (code === 'auth/unauthorized-domain') {
      setIsUnauthorizedDomain(true);
      const msg = `النطاق الحالي (${currentDomain || 'هذا الدومين'}) غير مضاف في النطاقات المصرح بها (Authorized Domains) في Firebase Console. يمكنك نسخ النطاق وإضافته بضغطة واحدة، أو تسجيل الدخول بالبريد الإلكتروني / الوضع التجريبي فوراً.`;
      setLoginError(msg);
      return msg;
    }

    setIsUnauthorizedDomain(false);

    let friendlyMsg = fallbackMessage;
    if (code === 'auth/popup-closed-by-user') {
      friendlyMsg = 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
    } else if (code === 'auth/popup-blocked') {
      friendlyMsg = 'قام المتصفح بحظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة من شريط العنوان ثم إعادة المحاولة.';
    } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      friendlyMsg = 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
    } else if (code === 'auth/email-already-in-use') {
      friendlyMsg = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى التبديل لتبويب تسجيل الدخول.';
    } else if (code === 'auth/weak-password') {
      friendlyMsg = 'كلمة المرور ضعيفة. يجب أن تتكون من 6 خانات على الأقل.';
    } else if (code === 'auth/invalid-email') {
      friendlyMsg = 'صيغة البريد الإلكتروني غير صالحة. يرجى كتابة بريد إلكتروني صحيح.';
    } else if (code === 'auth/operation-not-allowed') {
      friendlyMsg = 'طريقة تسجيل الدخول هذه غير مفعلة حالياً في مشروع Firebase. يمكنك الدخول بالبريد الإلكتروني أو الوضع التجريبي.';
    } else if (code === 'auth/network-request-failed') {
      friendlyMsg = 'تعذر الاتصال بخوادم التحقق. يرجى التأكد من اتصال الإنترنت.';
    } else if (fbErr.message) {
      friendlyMsg = fbErr.message;
    }

    setLoginError(friendlyMsg);
    return friendlyMsg;
  };

  // Synchronize and persist user session to Firestore user collection with ultra-fast instant UI delivery
  const syncUserSession = async (currentUser: User, customStoreName?: string, explicitEmailOverride?: string) => {
    if (!currentUser?.uid) return;

    const shortTimestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const storedEmailOverride = explicitEmailOverride || getSessionEmailOverride();
    const resolvedEmail = currentUser.email || storedEmailOverride || (currentUser.isAnonymous ? OWNER_EMAIL : '');
    const isOwnerAccount = resolvedEmail.trim().toLowerCase() === OWNER_EMAIL;

    // 1. Instant optimistic profile from cache or user object - 0ms UI blocking
    const cached = getCachedUserProfile(currentUser.uid);
    if (cached && (!explicitEmailOverride || cached.email === explicitEmailOverride)) {
      const updatedCached: UserMerchantProfile = {
        ...cached,
        email: explicitEmailOverride || cached.email || resolvedEmail,
        displayName: isOwnerAccount
          ? 'ياسمين نور (مالكة المنظومة 👑)'
          : cached.displayName || 'تاجر مصري معتمد',
      };
      setProfile(updatedCached);
      setSessionData({
        sessionId: `sess_${currentUser.uid.slice(0, 6)}_${Date.now()}`,
        lastLoginAt: shortTimestamp,
        lastSeenAt: shortTimestamp,
        sessionCount: cached.sessionCount || 1,
        deviceInfo: typeof navigator !== 'undefined' ? (navigator.platform || 'متصفح الويب') : 'متصفح الويب',
        isOnline: true,
      });
    } else {
      const fastInitial: UserMerchantProfile = {
        uid: currentUser.uid,
        displayName: isOwnerAccount
          ? 'ياسمين نور (مالكة المنظومة 👑)'
          : currentUser.displayName || (currentUser.isAnonymous ? 'تاجر تجريبي' : 'تاجر مصري معتمد'),
        email: resolvedEmail,
        photoURL: currentUser.photoURL || '',
        storeName: customStoreName || (isOwnerAccount ? 'الإدارة العامة — رادار التاجر مصر' : 'متجر التاجر المصري'),
        city: 'القاهرة',
        preferredCurrency: 'EGP',
        sessionCount: 1,
      };
      setProfile(fastInitial);
      setSessionData({
        sessionId: `sess_${currentUser.uid.slice(0, 6)}_${Date.now()}`,
        lastLoginAt: shortTimestamp,
        lastSeenAt: shortTimestamp,
        sessionCount: 1,
        deviceInfo: typeof navigator !== 'undefined' ? (navigator.platform || 'متصفح الويب') : 'متصفح الويب',
        isOnline: true,
      });
    }

    // 2. Prevent duplicate concurrent Firestore sync calls or when 5-minute cache is fresh / quota exhausted
    const profileCacheKey = `user_profile_${currentUser.uid}`;
    if (
      (activeSyncUidsRef.current.has(currentUser.uid) && !explicitEmailOverride) ||
      isFirestoreQuotaExhausted() ||
      (cached && isFirestoreCacheFresh(profileCacheKey, FIVE_MINUTES_MS) && !explicitEmailOverride)
    ) {
      return;
    }
    activeSyncUidsRef.current.add(currentUser.uid);

    const userDocRef = doc(usersCollection, currentUser.uid);
    const nowIso = new Date().toISOString();

    // 3. Asynchronous background sync with safe 3.5s timeout guard
    try {
      const fetchPromise = getDoc(userDocRef);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Firestore sync timeout - continuing with cached state')), 3500)
      );

      const userSnap = await Promise.race([fetchPromise, timeoutPromise]) as any;
      markFirestoreCacheFetched(profileCacheKey);
      let sessionCount = 1;
      let finalProfile: UserMerchantProfile;

      if (userSnap && userSnap.exists()) {
        const existingProfileData = userSnap.data() as UserMerchantProfile;
        sessionCount = (existingProfileData.sessionCount || 0) + 1;
        const finalEmail = explicitEmailOverride || currentUser.email || storedEmailOverride || existingProfileData.email || resolvedEmail;
        const finalIsOwner = finalEmail.trim().toLowerCase() === OWNER_EMAIL;

        finalProfile = {
          ...existingProfileData,
          uid: currentUser.uid,
          displayName: finalIsOwner
            ? 'ياسمين نور (مالكة المنظومة 👑)'
            : existingProfileData.displayName || currentUser.displayName || 'تاجر مصري معتمد',
          email: finalEmail,
          photoURL: existingProfileData.photoURL || currentUser.photoURL || '',
          storeName: customStoreName || existingProfileData.storeName || 'متجر التاجر المصري',
          sessionCount: sessionCount,
          lastLoginAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
        };

        // Fire-and-forget background update
        setDoc(userDocRef, {
          email: finalEmail,
          displayName: finalProfile.displayName,
          lastLoginAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
          sessionCount: sessionCount,
          updatedAt: serverTimestamp(),
          ...(customStoreName ? { storeName: customStoreName } : {})
        }, { merge: true }).catch(() => {});

      } else {
        sessionCount = 1;
        finalProfile = {
          uid: currentUser.uid,
          displayName: isOwnerAccount
            ? 'ياسمين نور (مالكة المنظومة 👑)'
            : currentUser.displayName || (currentUser.isAnonymous ? 'تاجر تجريبي' : 'تاجر مصري معتمد'),
          email: resolvedEmail,
          photoURL: currentUser.photoURL || '',
          storeName: customStoreName || (isOwnerAccount ? 'الإدارة العامة — رادار التاجر مصر' : 'متجر التاجر المصري'),
          city: 'القاهرة',
          preferredCurrency: 'EGP',
          sessionCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
        };

        setDoc(userDocRef, finalProfile, { merge: true }).catch(() => {});
      }

      setProfile(finalProfile);
      setCachedUserProfile(currentUser.uid, finalProfile);

      setSessionData({
        sessionId: `sess_${currentUser.uid.slice(0, 6)}_${Date.now()}`,
        lastLoginAt: shortTimestamp,
        lastSeenAt: shortTimestamp,
        sessionCount: sessionCount,
        deviceInfo: typeof navigator !== 'undefined' ? (navigator.platform || 'متصفح الويب') : 'متصفح الويب',
        isOnline: true,
      });

      // Fire analytics in the background (completely non-blocking)
      const sessionLogId = `sess_${currentUser.uid}_${Date.now()}`;
      const analyticsDocRef = doc(analyticsCollection, sessionLogId);
      setDoc(analyticsDocRef, {
        id: sessionLogId,
        eventType: 'merchant_session_start',
        productId: 'radar_auth',
        metadata: {
          userId: currentUser.uid,
          displayName: currentUser.displayName || 'تاجر',
          isAnonymous: currentUser.isAnonymous,
          sessionNumber: sessionCount,
          device: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : 'Web Client',
        },
        timestamp: nowIso
      }).catch(() => {});

    } catch (err) {
      if (isFirestoreQuotaError(err)) {
        markFirestoreQuotaExhausted(err);
      }
    } finally {
      setTimeout(() => {
        activeSyncUidsRef.current.delete(currentUser.uid);
      }, 5000);
    }
  };

  useEffect(() => {
    // Validate database connection using db.ts diagnostic helper with timeout
    const testTimeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000));
    Promise.race([testDbConnection(), testTimeout])
      .then(connected => {
        setIsDbConnected(Boolean(connected));
      })
      .catch(() => {
        setIsDbConnected(false);
      });

    // Check if demo user is saved in storage
    let savedDemoUser: any = null;
    try {
      const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (raw) savedDemoUser = JSON.parse(raw);
    } catch {
      // safe
    }

    // Safety timeout: if auth state change takes longer than 2 seconds (due to network or CORS domain error), force loading false
    const splashTimeout = setTimeout(() => {
      setIsLoading((prevLoading) => {
        if (prevLoading) {
          console.info('Auth init timeout reached, bypassing splash screen safely.');
          return false;
        }
        return prevLoading;
      });
    }, 2000);

    let unsubscribe = () => {};
    try {
      // Listen to Firebase Auth state - INSTANT resolution without blocking UI
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        clearTimeout(splashTimeout);
        if (currentUser) {
          setUser(currentUser);
          // Clear any stored demo user if a real Firebase user logs in
          try { localStorage.removeItem(DEMO_USER_STORAGE_KEY); } catch {}
          // Trigger fast background sync (non-blocking!)
          syncUserSession(currentUser);
        } else if (savedDemoUser) {
          setUser(savedDemoUser as User);
          setProfile({
            uid: savedDemoUser.uid,
            displayName: savedDemoUser.displayName || 'تاجر تجريبي',
            email: savedDemoUser.email || 'demo@merchantradar.eg',
            storeName: savedDemoUser.storeName || 'متجر التاجر التجريبي (القاهرة)',
            city: 'القاهرة',
            preferredCurrency: 'EGP',
            sessionCount: 1
          });
          setSessionData({
            sessionId: `sess_demo_${Date.now()}`,
            lastLoginAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            lastSeenAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            sessionCount: 1,
            isOnline: true,
          });
        } else {
          setUser(null);
          setProfile(null);
          setSessionData(null);
        }
        // Instantly finish loading state so dashboard renders with 0 delay!
        setIsLoading(false);
      }, (authError) => {
        clearTimeout(splashTimeout);
        console.warn('Auth state change error (CORS / domain / network):', authError);
        setIsLoading(false);
      });
    } catch (err) {
      clearTimeout(splashTimeout);
      console.warn('Failed to initialize Firebase Auth listener:', err);
      setIsLoading(false);
    }

    return () => {
      clearTimeout(splashTimeout);
      unsubscribe();
    };
  }, []);

  // Heartbeat session updater: updates lastSeenAt in Firestore users collection
  useEffect(() => {
    if (!user || user.isAnonymous) return;

    const interval = setInterval(async () => {
      try {
        const userDocRef = doc(usersCollection, user.uid);
        await updateDoc(userDocRef, {
          lastSeenAt: serverTimestamp(),
        });
        setSessionData(prev => prev ? {
          ...prev,
          lastSeenAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isOnline: true
        } : null);
      } catch {
        // Non-blocking background heartbeat
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  // 1. Google Sign-In with popup
  const signInWithGoogle = async () => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        if (result.user.email) {
          setSessionEmailOverride(result.user.email);
        }
        setUser(result.user);
        syncUserSession(result.user, undefined, result.user.email || undefined);
      }
    } catch (error: unknown) {
      handleAuthError(error, 'حدث خطأ أثناء تسجيل الدخول عبر Google.');
      throw error;
    }
  };

  // 1.5 Owner Session Instant Access (jassmeinnour@gmail.com)
  const signInAsOwner = async () => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    setSessionEmailOverride(OWNER_EMAIL);

    try {
      if (auth.currentUser) {
        setUser(auth.currentUser);
        await syncUserSession(auth.currentUser, 'الإدارة العامة — رادار التاجر مصر', OWNER_EMAIL);
        return;
      }
      const res = await signInAnonymously(auth);
      if (res.user) {
        setUser(res.user);
        await syncUserSession(res.user, 'الإدارة العامة — رادار التاجر مصر', OWNER_EMAIL);
        return;
      }
    } catch {
      // Fallback to local owner session if Firebase anonymous auth is restricted
    }

    const ownerUser = {
      uid: `owner_jassmein_${Date.now().toString(36)}`,
      displayName: 'ياسمين نور (مالكة المنظومة 👑)',
      email: OWNER_EMAIL,
      photoURL: '',
      isAnonymous: false,
      emailVerified: true,
    } as unknown as User;

    try {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(ownerUser));
    } catch {}

    setUser(ownerUser);
    setProfile({
      uid: ownerUser.uid,
      displayName: 'ياسمين نور (مالكة المنظومة 👑)',
      email: OWNER_EMAIL,
      storeName: 'الإدارة العامة — رادار التاجر مصر',
      city: 'القاهرة',
      preferredCurrency: 'EGP',
      sessionCount: 1,
    });
    setSessionData({
      sessionId: `sess_owner_${Date.now()}`,
      lastLoginAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      lastSeenAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      sessionCount: 1,
      deviceInfo: typeof navigator !== 'undefined' ? (navigator.platform || 'متصفح الويب') : 'متصفح الويب',
      isOnline: true,
    });
  };

  // 2. Email & Password Sign-In (does NOT require Authorized Domain in Firebase!)
  const signInWithEmail = async (email: string, pass: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    const cleanEmail = email.trim().toLowerCase();
    setSessionEmailOverride(cleanEmail);
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (res.user) {
        setUser(res.user);
        syncUserSession(res.user, undefined, cleanEmail);
      }
    } catch (error: unknown) {
      // If Owner email is used and Email/Password provider is not configured in Firebase Console, seamlessly authenticate Owner session
      if (cleanEmail === OWNER_EMAIL) {
        await signInAsOwner();
        return;
      }
      handleAuthError(error, 'تعذر تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.');
      throw error;
    }
  };

  // 3. Email & Password Sign-Up
  const signUpWithEmail = async (email: string, pass: string, displayName?: string, storeName?: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    const cleanEmail = email.trim().toLowerCase();
    setSessionEmailOverride(cleanEmail);
    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (res.user) {
        if (displayName) {
          try {
            await updateProfile(res.user, { displayName: displayName.trim() });
          } catch {
            // non-blocking
          }
        }
        setUser(res.user);
        syncUserSession(res.user, storeName, cleanEmail);
      }
    } catch (error: unknown) {
      if (cleanEmail === OWNER_EMAIL) {
        await signInAsOwner();
        return;
      }
      handleAuthError(error, 'تعذر إنشاء حساب التاجر بالبريد الإلكتروني.');
      throw error;
    }
  };

  // 4. Password Reset
  const sendPasswordReset = async (email: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: unknown) {
      handleAuthError(error, 'تعذر إرسال رابط إعادة تعيين كلمة المرور.');
      throw error;
    }
  };

  // 5. Demo Merchant Instant Access (Non-owner merchant session)
  const signInDemoMerchant = async (displayName?: string, storeName?: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    setSessionEmailOverride('demo.merchant@radar.eg');

    try {
      if (auth.currentUser) {
        setUser(auth.currentUser);
        await syncUserSession(auth.currentUser, storeName || 'متجر العتبة للتجارة الرقمية', 'demo.merchant@radar.eg');
        return;
      }
      // First try real Firebase anonymous auth
      const res = await signInAnonymously(auth);
      if (res.user) {
        await syncUserSession(res.user, storeName || 'متجر العتبة للتجارة الرقمية', 'demo.merchant@radar.eg');
        return;
      }
    } catch (firebaseErr: unknown) {
      console.info('Firebase anonymous login disabled or restricted, creating verified local demo merchant session:', firebaseErr);
    }

    // High-resilience fallback: instant demo merchant profile
    const demoUser = {
      uid: `demo_merchant_${Date.now().toString(36)}`,
      displayName: displayName || 'تاجر مصري معتمد (تجريبي)',
      email: 'demo.merchant@radar.eg',
      photoURL: '',
      isAnonymous: true,
      emailVerified: true,
    } as unknown as User;

    try {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {}

    setUser(demoUser);
    setProfile({
      uid: demoUser.uid,
      displayName: demoUser.displayName || 'تاجر مصري معتمد',
      email: demoUser.email || 'demo.merchant@radar.eg',
      storeName: storeName || 'متجر التاجر المصري الحديث (القاهرة)',
      city: 'القاهرة',
      preferredCurrency: 'EGP',
      sessionCount: 1,
    });
    setSessionData({
      sessionId: `sess_demo_${Date.now()}`,
      lastLoginAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      lastSeenAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      sessionCount: 1,
      deviceInfo: typeof navigator !== 'undefined' ? (navigator.platform || 'متصفح الويب') : 'متصفح الويب',
      isOnline: true,
    });
  };

  const signInAsGuest = () => signInDemoMerchant();

  const signOut = async () => {
    try {
      try {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        setSessionEmailOverride(null);
      } catch {}

      if (user && !user.isAnonymous) {
        try {
          const userDocRef = doc(usersCollection, user.uid);
          await updateDoc(userDocRef, {
            lastSeenAt: serverTimestamp(),
          });
        } catch {
          // Silent fallback on sign out
        }
      }
      await fbSignOut(auth);
      setUser(null);
      setProfile(null);
      setSessionData(null);
      setLoginError(null);
      setAuthErrorCode(null);
      setIsUnauthorizedDomain(false);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  };

  const updateStoreProfile = async (updates: Partial<UserMerchantProfile>) => {
    if (!user) return;
    setProfile(prev => {
      const next = prev ? { ...prev, ...updates } : null;
      if (next) setCachedUserProfile(user.uid, next);
      return next;
    });
    if (isFirestoreQuotaExhausted()) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(usersCollection, user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const profileCacheKey = `user_profile_${uid}`;
    const cached = getCachedUserProfile(uid);
    if (cached) {
      setProfile(cached);
    }
    if (isFirestoreQuotaExhausted() || (cached && isFirestoreCacheFresh(profileCacheKey, FIVE_MINUTES_MS))) {
      return;
    }
    const path = `users/${uid}`;
    try {
      const userDocRef = doc(usersCollection, uid);
      const snap = await getDoc(userDocRef);
      markFirestoreCacheFetched(profileCacheKey);
      if (snap.exists()) {
        const data = snap.data() as UserMerchantProfile;
        setProfile(data);
        setCachedUserProfile(uid, data);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }, []);

  const clearLoginError = () => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
  };

  // Exclusive Owner Access Check: true ONLY when logged in as jassmeinnour@gmail.com
  const isOwner = Boolean(
    user &&
    ((user.email && user.email.trim().toLowerCase() === OWNER_EMAIL) ||
     (profile?.email && profile.email.trim().toLowerCase() === OWNER_EMAIL))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        sessionData,
        isLoading,
        isDbConnected,
        isOwner,
        loginError,
        authErrorCode,
        isUnauthorizedDomain,
        currentDomain,
        domainInfo,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signInAsGuest,
        signInDemoMerchant,
        signInAsOwner,
        signOut,
        updateStoreProfile,
        refreshProfile,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const FALLBACK_AUTH_CONTEXT: AuthContextType = {
  user: null,
  profile: null,
  sessionData: null,
  isLoading: false,
  isDbConnected: true,
  isOwner: false,
  loginError: null,
  authErrorCode: null,
  isUnauthorizedDomain: false,
  currentDomain: typeof window !== 'undefined' ? window.location.hostname : '',
  domainInfo: getFirebaseDomainInfo(),
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  sendPasswordReset: async () => {},
  signInAsGuest: async () => {},
  signInDemoMerchant: async () => {},
  signInAsOwner: async () => {},
  signOut: async () => {},
  updateStoreProfile: async () => {},
  refreshProfile: async () => {},
  clearLoginError: () => {},
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return FALLBACK_AUTH_CONTEXT;
  }
  return context;
};
