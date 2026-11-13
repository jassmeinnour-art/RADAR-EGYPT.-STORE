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
import {
  isSupabaseConfigured,
  supabaseClient,
  setSupabaseActiveEmail,
  setSupabaseSession,
  getActiveSupabaseSession,
  signInWithSupabasePassword,
  signUpWithSupabasePassword,
  signOutSupabase,
} from '../lib/supabase';
import { dataCache } from '../utils/dataCache';

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
  role?: string;
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
  isFounderMode: boolean;
  toggleFounderMode: () => void;
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
export const FOUNDER_EMAIL = 'jassmeinnour@gmail.com';
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

function hasPersistedSupabaseToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        const raw = localStorage.getItem(k);
        if (raw && raw.includes('access_token')) {
          return true;
        }
      }
    }
  } catch {
    // safe
  }
  return false;
}

function supabaseUserToAuthUser(sbUser: any): User {
  const email = (sbUser?.email || '').trim().toLowerCase();
  const isOwner = email === OWNER_EMAIL;
  const metaName = sbUser?.user_metadata?.display_name || sbUser?.user_metadata?.full_name;
  return {
    uid: sbUser?.id || `sb_${Date.now()}`,
    email: email || null,
    displayName: metaName || (isOwner ? 'ياسمين نور (مالكة المنظومة 👑)' : 'تاجر مصري معتمد'),
    photoURL: sbUser?.user_metadata?.avatar_url || '',
    isAnonymous: false,
    emailVerified: Boolean(sbUser?.email_confirmed_at || true),
    providerData: [],
    metadata: {},
  } as unknown as User;
}

function getInitialDemoUser(): User | null {
  if (isSupabaseConfigured) return null;
  try {
    const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch {
    // safe
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (isSupabaseConfigured) {
      return null;
    }
    const initial = getInitialDemoUser() || auth.currentUser;
    if (initial) {
      const initialEmail = initial.email || getSessionEmailOverride() || '';
      setSupabaseActiveEmail(initialEmail || null);
    } else {
      setSupabaseActiveEmail(null);
    }
    return initial;
  });
  const [profile, setProfile] = useState<UserMerchantProfile | null>(() => {
    if (isSupabaseConfigured) return null;
    const initial = getInitialDemoUser() || auth.currentUser;
    if (!initial) return null;
    const cached = getCachedUserProfile(initial.uid);
    if (cached) return cached;
    return {
      uid: initial.uid,
      displayName: initial.displayName || 'تاجر مصري معتمد',
      email: initial.email || getSessionEmailOverride() || '',
      storeName: (initial as any).storeName || 'متجر التاجر المصري',
      city: 'القاهرة',
      preferredCurrency: 'EGP',
      sessionCount: 1,
    };
  });
  const [sessionData, setSessionData] = useState<UserSessionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (isSupabaseConfigured) {
      // Only wait briefly if a persisted Supabase session token exists; otherwise open /login immediately
      return hasPersistedSupabaseToken();
    }
    return !(getInitialDemoUser() || auth.currentUser);
  });
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState<boolean>(false);
  const [rawFounderMode, setRawFounderMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isFounderMode') === 'true' || localStorage.getItem('radar_founder_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleFounderMode = useCallback(() => {
    setRawFounderMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('isFounderMode', String(next));
        localStorage.setItem('radar_founder_mode', String(next));
      } catch {}
      return next;
    });
  }, []);

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
    const resolvedEmail = currentUser.email || storedEmailOverride || '';
    const isOwnerAccount = !currentUser.isAnonymous && resolvedEmail.trim().toLowerCase() === OWNER_EMAIL;
    setSupabaseActiveEmail(resolvedEmail || null);

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
        const finalIsOwner = !currentUser.isAnonymous && finalEmail.trim().toLowerCase() === OWNER_EMAIL;
        setSupabaseActiveEmail(finalEmail || null);

        finalProfile = {
          ...existingProfileData,
          uid: currentUser.uid,
          displayName: finalIsOwner
            ? 'ياسمين نور (مالكة المنظومة 👑)'
            : existingProfileData.displayName || currentUser.displayName || 'تاجر مصري معتمد',
          email: finalEmail,
          photoURL: existingProfileData.photoURL || currentUser.photoURL || '',
          storeName: customStoreName || existingProfileData.storeName || 'متجر التاجر المصري',
          role: finalIsOwner ? 'super_admin' : (existingProfileData.role || 'merchant'),
          sessionCount: sessionCount,
          lastLoginAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
        };

        // Fire-and-forget background update
        setDoc(userDocRef, {
          email: finalEmail,
          displayName: finalProfile.displayName,
          role: finalProfile.role,
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
          role: isOwnerAccount ? 'super_admin' : 'merchant',
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
    let isMounted = true;

    // Hard 3-second maximum loading failsafe — never trap user in infinite loading
    const hardLoadingTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 3000);

    // Primary path when Supabase is configured: check Supabase Auth session FIRST
    if (isSupabaseConfigured && supabaseClient) {
      setIsDbConnected(true);
      let sbSubscription: { unsubscribe: () => void } | null = null;

      const applySupabaseSession = (session: any) => {
        if (!isMounted) return;
        if (session?.user && session?.access_token) {
          setSupabaseSession(session);
          const mappedUser = supabaseUserToAuthUser(session.user);
          const verifiedEmail = (session.user.email || '').trim().toLowerCase();
          setSessionEmailOverride(verifiedEmail || null);
          setUser(mappedUser);
          const isOwnerAcct = verifiedEmail === OWNER_EMAIL;
          const shortTimestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
          setProfile({
            uid: mappedUser.uid,
            displayName: isOwnerAcct
              ? 'ياسمين نور (مالكة المنظومة 👑)'
              : session.user.user_metadata?.display_name || 'تاجر مصري معتمد',
            email: verifiedEmail,
            storeName:
              session.user.user_metadata?.store_name ||
              (isOwnerAcct ? 'الإدارة العامة — رادار التاجر مصر' : 'متجر التاجر المصري'),
            city: 'القاهرة',
            preferredCurrency: 'EGP',
            role: isOwnerAcct ? 'super_admin' : 'merchant',
            sessionCount: 1,
          });
          setSessionData({
            sessionId: `sb_${mappedUser.uid.slice(0, 6)}`,
            lastLoginAt: shortTimestamp,
            lastSeenAt: shortTimestamp,
            sessionCount: 1,
            deviceInfo: typeof navigator !== 'undefined' ? (navigator.platform || 'متصفح الويب') : 'متصفح الويب',
            isOnline: true,
          });
        } else {
          setSupabaseSession(null);
          setSupabaseActiveEmail(null);
          setSessionEmailOverride(null);
          setUser(null);
          setProfile(null);
          setSessionData(null);
        }
        clearTimeout(hardLoadingTimeout);
        setIsLoading(false);
      };

      getActiveSupabaseSession(2500)
        .then((session) => {
          applySupabaseSession(session);
        })
        .catch(() => {
          applySupabaseSession(null);
        });

      try {
        const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
          applySupabaseSession(session);
        });
        sbSubscription = data?.subscription || null;
      } catch {
        clearTimeout(hardLoadingTimeout);
        setIsLoading(false);
      }

      return () => {
        isMounted = false;
        clearTimeout(hardLoadingTimeout);
        sbSubscription?.unsubscribe();
      };
    }

    // Fallback path when Supabase env vars are not configured (Firebase / Local Preview)
    const testTimeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000));
    Promise.race([testDbConnection(), testTimeout])
      .then(connected => {
        if (isMounted) setIsDbConnected(Boolean(connected));
      })
      .catch(() => {
        if (isMounted) setIsDbConnected(false);
      });

    let savedDemoUser: any = null;
    try {
      const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (raw) savedDemoUser = JSON.parse(raw);
    } catch {
      // safe
    }

    const splashTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 350);

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        clearTimeout(splashTimeout);
        clearTimeout(hardLoadingTimeout);
        if (currentUser) {
          setUser(currentUser);
          try { localStorage.removeItem(DEMO_USER_STORAGE_KEY); } catch {}
          syncUserSession(currentUser);
        } else if (savedDemoUser) {
          setUser(savedDemoUser as User);
          const demoEmail = savedDemoUser.email || 'demo.merchant@radar.eg';
          setSupabaseActiveEmail(demoEmail);
          setProfile({
            uid: savedDemoUser.uid,
            displayName: savedDemoUser.displayName || 'تاجر تجريبي',
            email: demoEmail,
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
          setSupabaseActiveEmail(null);
          setUser(null);
          setProfile(null);
          setSessionData(null);
        }
        if (isMounted) setIsLoading(false);
      }, (authError) => {
        clearTimeout(splashTimeout);
        clearTimeout(hardLoadingTimeout);
        console.warn('Auth state change error (CORS / domain / network):', authError);
        if (isMounted) setIsLoading(false);
      });
    } catch (err) {
      clearTimeout(splashTimeout);
      clearTimeout(hardLoadingTimeout);
      console.warn('Failed to initialize Firebase Auth listener:', err);
      if (isMounted) setIsLoading(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(splashTimeout);
      clearTimeout(hardLoadingTimeout);
      unsubscribe();
    };
  }, []);

  // Heartbeat session updater: updates lastSeenAt in Firestore users collection
  useEffect(() => {
    if (!user || user.isAnonymous || !auth.currentUser) return;

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

  // Owner login strictly requires verified password or Google OAuth (no passwordless backdoor)
  const signInAsOwner = async () => {
    const msg = 'دخول مالكة المنصة يتطلب التحقق عبر البريد الإلكتروني وكلمة المرور أو حساب Google الموثق.';
    setLoginError(msg);
    throw new Error(msg);
  };

  // 2. Email & Password Sign-In (Supabase Auth primary when configured)
  const signInWithEmail = async (email: string, pass: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await signInWithSupabasePassword(cleanEmail, pass);
        if (error || !data?.session || !data?.user) {
          const msg = 'الإيميل أو كلمة المرور غلط';
          setSessionEmailOverride(null);
          setSupabaseSession(null);
          setLoginError(msg);
          throw new Error(msg);
        }
        setSupabaseSession(data.session);
        const verifiedEmail = (data.user.email || cleanEmail).trim().toLowerCase();
        const isOwnerAcct = verifiedEmail === OWNER_EMAIL;
        const mappedUser = supabaseUserToAuthUser(data.user);
        setSessionEmailOverride(verifiedEmail);
        setSupabaseActiveEmail(verifiedEmail);
        setUser(mappedUser);
        const shortTimestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        setProfile({
          uid: mappedUser.uid,
          displayName: isOwnerAcct
            ? 'ياسمين نور (مالكة المنظومة 👑)'
            : data.user.user_metadata?.display_name || 'تاجر مصري معتمد',
          email: verifiedEmail,
          storeName:
            data.user.user_metadata?.store_name ||
            (isOwnerAcct ? 'الإدارة العامة — رادار التاجر مصر' : 'متجر التاجر المصري'),
          city: 'القاهرة',
          preferredCurrency: 'EGP',
          role: isOwnerAcct ? 'super_admin' : 'merchant',
          sessionCount: 1,
        });
        setSessionData({
          sessionId: `sb_${mappedUser.uid.slice(0, 6)}`,
          lastLoginAt: shortTimestamp,
          lastSeenAt: shortTimestamp,
          sessionCount: 1,
          deviceInfo: typeof navigator !== 'undefined' ? (navigator.platform || 'متصفح الويب') : 'متصفح الويب',
          isOnline: true,
        });
        return;
      } catch (err: any) {
        const msg = err?.message || 'الإيميل أو كلمة المرور غلط';
        setLoginError(msg);
        throw new Error(msg);
      }
    }

    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (res.user) {
        const verifiedEmail = (res.user.email || cleanEmail).trim().toLowerCase();
        setSessionEmailOverride(verifiedEmail);
        setSupabaseActiveEmail(verifiedEmail);
        setUser(res.user);
        syncUserSession(res.user, undefined, verifiedEmail);
      }
    } catch (error: unknown) {
      setSessionEmailOverride(null);
      handleAuthError(error, 'الإيميل أو كلمة المرور غلط');
      throw new Error('الإيميل أو كلمة المرور غلط');
    }
  };

  // 3. Email & Password Sign-Up
  const signUpWithEmail = async (email: string, pass: string, displayName?: string, storeName?: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await signUpWithSupabasePassword(cleanEmail, pass, {
        display_name: displayName?.trim() || '',
        store_name: storeName?.trim() || '',
      });
      if (error) {
        const rawMsg = String(error.message || '').toLowerCase();
        let friendly = 'تعذر إنشاء حساب التاجر بالبريد الإلكتروني.';
        if (rawMsg.includes('already registered') || rawMsg.includes('already exists')) {
          friendly = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى التبديل لتبويب تسجيل الدخول.';
        } else if (rawMsg.includes('password')) {
          friendly = 'كلمة المرور ضعيفة. يجب أن تتكون من 6 خانات على الأقل.';
        } else if (rawMsg.includes('email')) {
          friendly = 'صيغة البريد الإلكتروني غير صالحة.';
        }
        setLoginError(friendly);
        throw new Error(friendly);
      }
      if (data?.session && data?.user) {
        setSupabaseSession(data.session);
        const verifiedEmail = (data.user.email || cleanEmail).trim().toLowerCase();
        setSessionEmailOverride(verifiedEmail);
        setSupabaseActiveEmail(verifiedEmail);
        setUser(supabaseUserToAuthUser(data.user));
        return;
      }
      if (data?.user && !data?.session) {
        const confirmMsg = 'تم إنشاء الحساب بنجاح! يرجى تأكيد البريد الإلكتروني ثم تسجيل الدخول.';
        setLoginError(confirmMsg);
        throw new Error(confirmMsg);
      }
    }

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
        const verifiedEmail = (res.user.email || cleanEmail).trim().toLowerCase();
        setSessionEmailOverride(verifiedEmail);
        setSupabaseActiveEmail(verifiedEmail);
        setUser(res.user);
        syncUserSession(res.user, storeName, verifiedEmail);
      }
    } catch (error: unknown) {
      setSessionEmailOverride(null);
      handleAuthError(error, 'تعذر إنشاء حساب التاجر بالبريد الإلكتروني.');
      throw error;
    }
  };

  // 4. Password Reset
  const sendPasswordReset = async (email: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    try {
      if (isSupabaseConfigured && supabaseClient) {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim());
        if (error) throw error;
        return;
      }
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: unknown) {
      handleAuthError(error, 'تعذر إرسال رابط إعادة تعيين كلمة المرور.');
      throw error;
    }
  };

  // 5. Demo Merchant Instant Access (Blocked when live RLS Supabase Auth is enforced)
  const signInDemoMerchant = async (displayName?: string, storeName?: string) => {
    if (isSupabaseConfigured) {
      const msg = 'نظام الأمان (RLS) مفعل حالياً — يرجى تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.';
      setLoginError(msg);
      throw new Error(msg);
    }
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    setSessionEmailOverride('demo.merchant@radar.eg');
    setSupabaseActiveEmail('demo.merchant@radar.eg');
    try {
      localStorage.removeItem('isFounderMode');
      localStorage.removeItem('radar_founder_mode');
      localStorage.removeItem('founder_mode_active');
    } catch {}
    setRawFounderMode(false);

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
        localStorage.removeItem('isFounderMode');
        localStorage.removeItem('radar_founder_mode');
        localStorage.removeItem('founder_mode_active');
        setSessionEmailOverride(null);
      } catch {}

      setSupabaseActiveEmail(null);
      setRawFounderMode(false);
      dataCache.invalidate();

      await signOutSupabase();

      if (!isSupabaseConfigured && user && !user.isAnonymous) {
        try {
          const userDocRef = doc(usersCollection, user.uid);
          await updateDoc(userDocRef, {
            lastSeenAt: serverTimestamp(),
          });
        } catch {
          // Silent fallback on sign out
        }
      }
      await fbSignOut(auth).catch(() => {});
      setUser(null);
      setProfile(null);
      setSessionData(null);
      setLoginError(null);
      setAuthErrorCode(null);
      setIsUnauthorizedDomain(false);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.replaceState({}, '', '/login');
      }
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

  // Exclusive Owner & Founder Access Check: true ONLY when authenticated (non-anonymous) as jassmeinnour@gmail.com
  const isOwner = Boolean(
    user &&
    !user.isAnonymous &&
    ((user.email && user.email.trim().toLowerCase() === OWNER_EMAIL) ||
     (profile?.email && profile.email.trim().toLowerCase() === OWNER_EMAIL))
  );

  // Founder Mode is strictly accessible to the owner (jassmeinnour@gmail.com)
  const isFounderMode = Boolean(isOwner && rawFounderMode);

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
        isFounderMode,
        toggleFounderMode,
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
  isFounderMode: false,
  toggleFounderMode: () => {},
};

export const useAuth = (): AuthContextType => {
  try {
    const context = useContext(AuthContext);
    if (!context) {
      return FALLBACK_AUTH_CONTEXT;
    }
    return context;
  } catch {
    return FALLBACK_AUTH_CONTEXT;
  }
};
