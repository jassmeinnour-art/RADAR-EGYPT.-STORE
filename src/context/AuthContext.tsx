import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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
  authInitError: string | null;
  authErrorCode: string | null;
  isUnauthorizedDomain: boolean;
  currentDomain: string;
  domainInfo: ReturnType<typeof getFirebaseDomainInfo>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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

function clearStaleRadarStorageKeys(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith('radar-card-size') ||
        k.startsWith('radar-user') ||
        k === 'merchant_radar_demo_user' ||
        k === 'radar_cached_data'
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // safe
  }
}

function readPersistedSupabaseSession(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed?.access_token && parsed?.user) {
          return parsed;
        }
        if (parsed?.currentSession?.access_token && parsed?.currentSession?.user) {
          return parsed.currentSession;
        }
      }
    }
  } catch {
    // safe
  }
  return null;
}

function isLoginPathname(): boolean {
  return typeof window !== 'undefined' && window.location.pathname === '/login';
}

function isFounderEmail(email?: string | null): boolean {
  return String(email || '').trim().toLowerCase() === OWNER_EMAIL;
}

function supabaseUserToAuthUser(sbUser: any): User {
  const email = (sbUser?.email || '').trim().toLowerCase();
  const metaName = sbUser?.user_metadata?.display_name || sbUser?.user_metadata?.full_name;
  return {
    uid: sbUser?.id || `sb_${Date.now()}`,
    email: email || null,
    displayName: metaName || 'ياسمين نور — المؤسس',
    photoURL: sbUser?.user_metadata?.avatar_url || '',
    isAnonymous: false,
    emailVerified: Boolean(sbUser?.email_confirmed_at || true),
    providerData: [],
    metadata: {},
  } as unknown as User;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  clearStaleRadarStorageKeys();

  const [user, setUser] = useState<User | null>(() => {
    try {
      if (isLoginPathname()) {
        setSupabaseActiveEmail(null);
        return null;
      }
      if (isSupabaseConfigured) {
        const persisted = readPersistedSupabaseSession();
        const persistedEmail = String(persisted?.user?.email || '').trim().toLowerCase();
        if (persisted?.access_token && persisted?.user && isFounderEmail(persistedEmail)) {
          setSupabaseSession(persisted);
          const mapped = supabaseUserToAuthUser(persisted.user);
          setSessionEmailOverride(mapped.email || null);
          return mapped;
        }
        setSupabaseSession(null);
        setSupabaseActiveEmail(null);
        return null;
      }
      const initial = auth?.currentUser || null;
      const initialEmail = String(initial?.email || getSessionEmailOverride() || '').trim().toLowerCase();
      if (initial && !initial.isAnonymous && isFounderEmail(initialEmail)) {
        setSupabaseActiveEmail(initialEmail);
        return initial;
      }
      setSupabaseActiveEmail(null);
      return null;
    } catch {
      setSupabaseActiveEmail(null);
      return null;
    }
  });
  const [profile, setProfile] = useState<UserMerchantProfile | null>(() => {
    try {
      if (isLoginPathname()) return null;
      if (isSupabaseConfigured) {
        const persisted = readPersistedSupabaseSession();
        const verifiedEmail = String(persisted?.user?.email || '').trim().toLowerCase();
        if (!persisted?.user || !isFounderEmail(verifiedEmail)) return null;
        return {
          uid: persisted.user.id,
          displayName: 'ياسمين نور — المؤسس',
          email: verifiedEmail,
          storeName: persisted.user.user_metadata?.store_name || 'الإدارة العامة — رادار التاجر مصر',
          city: 'القاهرة',
          preferredCurrency: 'EGP',
          role: 'super_admin',
          sessionCount: 1,
        };
      }
      const initial = auth?.currentUser || null;
      const initialEmail = String(initial?.email || getSessionEmailOverride() || '').trim().toLowerCase();
      if (!initial || initial.isAnonymous || !isFounderEmail(initialEmail)) return null;
      const cached = getCachedUserProfile(initial.uid);
      if (cached) return { ...cached, role: 'super_admin', email: OWNER_EMAIL };
      return {
        uid: initial.uid,
        displayName: 'ياسمين نور — المؤسس',
        email: OWNER_EMAIL,
        storeName: 'الإدارة العامة — رادار التاجر مصر',
        city: 'القاهرة',
        preferredCurrency: 'EGP',
        role: 'super_admin',
        sessionCount: 1,
      };
    } catch {
      return null;
    }
  });
  const [sessionData, setSessionData] = useState<UserSessionData | null>(null);
  // NEVER block rendering with a full-page loading screen
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authInitError, setAuthInitError] = useState<string | null>(null);
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
      !usersCollection ||
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

    // On /login: NEVER call Supabase or Firebase on load — wait strictly for user clicking "دخول"
    if (isLoginPathname()) {
      clearStaleRadarStorageKeys();
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    // Primary path when Supabase is configured: validate persisted session in background (non-blocking)
    if (isSupabaseConfigured && supabaseClient) {
      setIsDbConnected(true);
      let sbSubscription: { unsubscribe: () => void } | null = null;

      const applySupabaseSession = (session: any) => {
        if (!isMounted) return;
        const verifiedEmail = String(session?.user?.email || '').trim().toLowerCase();
        if (session?.user && session?.access_token && isFounderEmail(verifiedEmail)) {
          setSupabaseSession(session);
          const mappedUser = supabaseUserToAuthUser(session.user);
          setSessionEmailOverride(verifiedEmail);
          setUser(mappedUser);
          const shortTimestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
          setProfile({
            uid: mappedUser.uid,
            displayName: 'ياسمين نور — المؤسس',
            email: verifiedEmail,
            storeName: session.user.user_metadata?.store_name || 'الإدارة العامة — رادار التاجر مصر',
            city: 'القاهرة',
            preferredCurrency: 'EGP',
            role: 'super_admin',
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
          if (session?.user && !isFounderEmail(verifiedEmail)) {
            signOutSupabase().catch(() => {});
            setLoginError('الدخول مقتصر على حساب المؤسس فقط (jassmeinnour@gmail.com).');
          }
          setSupabaseSession(null);
          setSupabaseActiveEmail(null);
          setSessionEmailOverride(null);
          setUser(null);
          setProfile(null);
          setSessionData(null);
        }
        setIsLoading(false);
      };

      // Only query Supabase getSession if a persisted token already exists locally
      if (readPersistedSupabaseSession()) {
        getActiveSupabaseSession(2500)
          .then((session) => {
            applySupabaseSession(session);
          })
          .catch((err) => {
            console.warn('[AuthContext] Session check warning:', err?.message || err);
            applySupabaseSession(null);
          });
      }

      try {
        const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
          applySupabaseSession(session);
        });
        sbSubscription = data?.subscription || null;
      } catch (err: any) {
        console.warn('[AuthContext] Supabase auth listener warning:', err?.message || err);
        setIsLoading(false);
      }

      return () => {
        isMounted = false;
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

    const splashTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 350);

    let unsubscribe = () => {};
    try {
      if (!auth) {
        clearTimeout(splashTimeout);
        if (isMounted) {
          setIsLoading(false);
        }
        return () => {
          isMounted = false;
        };
      }
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        clearTimeout(splashTimeout);
        const fbEmail = String(currentUser?.email || '').trim().toLowerCase();
        if (currentUser && !currentUser.isAnonymous && isFounderEmail(fbEmail)) {
          setUser(currentUser);
          syncUserSession(currentUser);
        } else {
          if (currentUser && !isFounderEmail(fbEmail)) {
            fbSignOut(auth).catch(() => {});
          }
          setSupabaseActiveEmail(null);
          setSessionEmailOverride(null);
          setUser(null);
          setProfile(null);
          setSessionData(null);
        }
        if (isMounted) setIsLoading(false);
      }, (authError) => {
        clearTimeout(splashTimeout);
        console.warn('Auth state change error (CORS / domain / network):', authError);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      });
    } catch (err: any) {
      clearTimeout(splashTimeout);
      console.warn('Failed to initialize Firebase Auth listener:', err);
      if (isMounted) {
        setUser(null);
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(splashTimeout);
      unsubscribe();
    };
  }, []);

  // Heartbeat session updater: updates lastSeenAt in Firestore users collection
  useEffect(() => {
    if (!user || user.isAnonymous || !auth?.currentUser || !usersCollection) return;

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

  // Founder-only Email & Password Sign-In (jassmeinnour@gmail.com ONLY)
  const signInWithEmail = async (email: string, pass: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    setIsUnauthorizedDomain(false);
    const cleanEmail = email.trim().toLowerCase();

    if (!isFounderEmail(cleanEmail)) {
      const msg = 'الدخول مقتصر على حساب المؤسس فقط (jassmeinnour@gmail.com) — التجار سجلات بيانات يديرها المؤسس.';
      setSessionEmailOverride(null);
      setSupabaseSession(null);
      setSupabaseActiveEmail(null);
      setLoginError(msg);
      throw new Error(msg);
    }

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
        const verifiedEmail = (data.user.email || cleanEmail).trim().toLowerCase();
        if (!isFounderEmail(verifiedEmail)) {
          await signOutSupabase();
          const msg = 'الدخول مقتصر على حساب المؤسس فقط (jassmeinnour@gmail.com).';
          setLoginError(msg);
          throw new Error(msg);
        }
        setSupabaseSession(data.session);
        const mappedUser = supabaseUserToAuthUser(data.user);
        setSessionEmailOverride(verifiedEmail);
        setSupabaseActiveEmail(verifiedEmail);
        setUser(mappedUser);
        const shortTimestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        setProfile({
          uid: mappedUser.uid,
          displayName: 'ياسمين نور — المؤسس',
          email: verifiedEmail,
          storeName: data.user.user_metadata?.store_name || 'الإدارة العامة — رادار التاجر مصر',
          city: 'القاهرة',
          preferredCurrency: 'EGP',
          role: 'super_admin',
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
        if (!isFounderEmail(verifiedEmail)) {
          await fbSignOut(auth).catch(() => {});
          const msg = 'الدخول مقتصر على حساب المؤسس فقط (jassmeinnour@gmail.com).';
          setLoginError(msg);
          throw new Error(msg);
        }
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

  // Password Reset (Founder only)
  const sendPasswordReset = async (email: string) => {
    setLoginError(null);
    setAuthErrorCode(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!isFounderEmail(cleanEmail)) {
      const msg = 'استعادة كلمة المرور متاحة لحساب المؤسس فقط (jassmeinnour@gmail.com).';
      setLoginError(msg);
      throw new Error(msg);
    }
    try {
      if (isSupabaseConfigured && supabaseClient) {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(cleanEmail);
        if (error) throw error;
        return;
      }
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (error: unknown) {
      handleAuthError(error, 'تعذر إرسال رابط إعادة تعيين كلمة المرور.');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      try {
        localStorage.removeItem('merchant_radar_demo_user');
        localStorage.removeItem('isFounderMode');
        localStorage.removeItem('radar_founder_mode');
        localStorage.removeItem('founder_mode_active');
        setSessionEmailOverride(null);
      } catch {}

      setSupabaseActiveEmail(null);
      setRawFounderMode(false);
      dataCache.invalidate();

      await signOutSupabase();

      if (!isSupabaseConfigured && user && !user.isAnonymous && usersCollection) {
        try {
          const userDocRef = doc(usersCollection, user.uid);
          await updateDoc(userDocRef, {
            lastSeenAt: serverTimestamp(),
          });
        } catch {
          // Silent fallback on sign out
        }
      }
      if (auth) {
        await fbSignOut(auth).catch(() => {});
      }
      setUser(null);
      setProfile(null);
      setSessionData(null);
      setLoginError(null);
      setAuthInitError(null);
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
    if (isFirestoreQuotaExhausted() || !usersCollection) return;
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
    if (!auth?.currentUser || !usersCollection) return;
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
    setAuthInitError(null);
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
        authInitError,
        authErrorCode,
        isUnauthorizedDomain,
        currentDomain,
        domainInfo,
        signInWithEmail,
        sendPasswordReset,
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
  authInitError: null,
  authErrorCode: null,
  isUnauthorizedDomain: false,
  currentDomain: typeof window !== 'undefined' ? window.location.hostname : '',
  domainInfo: getFirebaseDomainInfo(),
  signInWithEmail: async () => {},
  sendPasswordReset: async () => {},
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
