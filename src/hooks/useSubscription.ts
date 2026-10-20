import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserMerchantProfile } from '../context/AuthContext';
import { getVodafoneCashAdminWallet, saveVodafoneCashAdminWallet } from '../utils/platformLaunchHelper';

export type SubscriptionPlanId = 'trial_3_days' | 'plan_1_month' | 'plan_6_months' | 'plan_12_months' | 'admin_lifetime';

export type SubscriptionStatus = 'trialing' | 'active' | 'expired' | 'pending_verification' | 'admin_whitelist';

export type PaymentMethodType = 
  | 'vodafone_cash' 
  | 'orange_cash'
  | 'etisalat_cash'
  | 'we_cash'
  | 'instapay' 
  | 'fawry' 
  | 'credit_card' 
  | 'google_play' 
  | 'promo_code' 
  | 'admin_bypass';

export interface SubscriptionPlanDetails {
  id: SubscriptionPlanId;
  nameArabic: string;
  durationMonths: number;
  priceEGP: number;
  priceUSD: number;
  badge?: string;
  isPopular?: boolean;
  savingsArabic?: string;
  descriptionArabic: string;
  features: string[];
}

export interface PaymentHistoryLogEntry {
  id: string;
  planId: SubscriptionPlanId;
  planName: string;
  merchantId?: string;
  merchantName?: string;
  amountEGP: number;
  paymentMethod: PaymentMethodType;
  referenceNumber: string;
  transactionId?: string;
  receiptImageUrl?: string;
  receiptFileName?: string;
  walletNumberUsed?: string;
  status?: 'paid' | 'pending_verification';
  activatedAt: string;
  expiresAt: string;
}

export interface SubscriptionRecord {
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  trialStartDate: string; // ISO date
  trialEndDate: string;   // ISO date (trialStartDate + 3 days)
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  paymentMethod?: PaymentMethodType;
  transactionReference?: string;
  transactionId?: string;
  receiptImageUrl?: string;
  receiptFileName?: string;
  walletNumberUsed?: string;
  amountPaidEGP?: number;
  isLifetimeAdmin?: boolean;
  notes?: string;
  paymentHistory?: PaymentHistoryLogEntry[];
}

export interface SubscriptionHookState {
  subscription: SubscriptionRecord;
  status: SubscriptionStatus;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isPendingVerification: boolean;
  isSubscribed: boolean;
  isWhitelistedAdmin: boolean;
  vodafoneCashWalletNumber: string;
  updateVodafoneCashWalletNumber: (newNumber: string) => void;
  trialRemainingTime: {
    days: number;
    hours: number;
    minutes: number;
    totalSeconds: number;
    formatted: string;
  };
  adminWhitelist: string[];
  plans: SubscriptionPlanDetails[];
  paymentHistory: PaymentHistoryLogEntry[];
  activatePlan: (
    planId: SubscriptionPlanId, 
    method: PaymentMethodType, 
    reference?: string,
    amount?: number,
    merchantId?: string,
    merchantName?: string
  ) => Promise<{ success: boolean; message: string; referenceNumber?: string }>;
  submitVodafoneCashPayment: (params: {
    planId: SubscriptionPlanId;
    amountEGP: number;
    transactionId: string;
    receiptImageUrl?: string;
    receiptFileName?: string;
    merchantId?: string;
    merchantName?: string;
  }) => Promise<{ success: boolean; message: string; referenceNumber: string }>;
  approvePendingPayment: (
    historyEntryId?: string,
    merchantId?: string,
    merchantName?: string
  ) => Promise<{ success: boolean; message: string }>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  addAdminToWhitelist: (email: string) => Promise<boolean>;
  removeAdminFromWhitelist: (email: string) => Promise<boolean>;
  resetTrial: () => void;
  expireTrialNow: () => void;
}

// Built-in Default Admin Whitelist - always includes the owner email
export const DEFAULT_ADMIN_WHITELIST: string[] = [
  'jassmeinnour@gmail.com',
  'admin@merchantradar.eg',
  'developer@merchantradar.eg'
];

const STORAGE_KEY_SUBSCRIPTION = 'merchant_radar_subscription_state_v1';
const STORAGE_KEY_WHITELIST = 'merchant_radar_admin_whitelist_v1';

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'plan_1_month',
    nameArabic: 'الباقة الشهرية (شهر واحد)',
    durationMonths: 1,
    priceEGP: 350,
    priceUSD: 25,
    descriptionArabic: 'باقة مرنة للتجار الراغبين في الاشتراك الشهري مع تفعيل كامل لسحب الطلبات ومعدِّل الأسعار التلقائي.',
    features: [
      'سحب غير محدود لطلبات أمازون مصر ونون وتوليد البوالص',
      'استيراد كتالوج المنتجات المستقل ومراقبة أسعار المنافسين',
      'تفعيل معدِّل الأسعار التلقائي (Automated Repricer) وحماية الحد الأدنى',
      'حاسبة التسعير وهوامش الربح والعمولات والضريبة',
      'تتبع حتى 200 منتج ومنافس نشط في وقت واحد',
      'دعم فني عبر واتساب وتحديثات مستمرة'
    ]
  },
  {
    id: 'plan_6_months',
    nameArabic: 'خطة 6 أشهر (نصف سنوية)',
    durationMonths: 6,
    priceEGP: 1500,
    priceUSD: 100,
    savingsArabic: 'وفر 600 ج.م مقارنة بالاشتراك الشهري!',
    descriptionArabic: 'مثالية للمتاجر الناشئة والمتوسطة الراغبة في مراقبة أسعار المنافسين في السوق المصري باستمرار.',
    features: [
      'رصد مباشر لأسعار المنافسين (أمازون، نون، جوميا)',
      'معدِّل الأسعار التلقائي (Automated Repricer) وسجل التدقيق الكامل',
      'تنبيهات فورية عند انخفاض أو رفع أسعار المنافسين',
      'تتبع حتى 500 منتج ومنافس نشط في وقت واحد',
      'تقارير أسبوعية تلقائية للمسوقين وفريق المبيعات',
      'دليل أسواق الجملة والمصانع (دمياط، العتبة، شارع عبد العزيز)',
      'تطبيق متكامل PWA يعمل بدون إنترنت'
    ]
  },
  {
    id: 'plan_12_months',
    nameArabic: 'خطة 12 شهراً (السنة كاملة)',
    durationMonths: 12,
    priceEGP: 2500,
    priceUSD: 200,
    badge: 'الأكثر توفيراً / Best Value ⭐',
    isPopular: true,
    savingsArabic: 'وفر 1,700 ج.م مقارنة بالتجديد الشهري!',
    descriptionArabic: 'الخيار الأفضل للشركات والمتاجر الاحترافية لتحقيق أقصى ربحية واستقرار تسعيري مستمر.',
    features: [
      'جميع مزايا الباقة الشهرية ونصف السنوية بالكامل',
      'تتبع غير محدود للمنتجات والمنافسين بدون أي سقف',
      'ربط متعدد التجار والمنصات (Multi-Tenant SP-API & Noon)',
      'استوديو تصوير وتعديل صور المنتجات بالذكاء الاصطناعي',
      'تصدير غير محدود لتقارير إكسل و PDF وفواتير الشحن',
      'أولوية الدعم الفني المباشر 24/7 عبر واتساب',
      'تحديثات وميزات المنظومة الجديدة أولاً بأول مجاناً'
    ]
  }
];

export function useSubscription(userProfile: UserMerchantProfile | null): SubscriptionHookState {
  // 1. Admin Whitelist State
  const [adminWhitelist, setAdminWhitelist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WHITELIST);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Merge with default list to ensure jassmeinnour@gmail.com is always present
          const merged = Array.from(new Set([...DEFAULT_ADMIN_WHITELIST, ...parsed]));
          return merged;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_ADMIN_WHITELIST;
  });

  // Save whitelist changes to localStorage
  const saveWhitelist = useCallback((newList: string[]) => {
    setAdminWhitelist(newList);
    try {
      localStorage.setItem(STORAGE_KEY_WHITELIST, JSON.stringify(newList));
    } catch {
      // ignore
    }
  }, []);

  // 2. Check if current user is an Admin Whitelist member
  const isWhitelistedAdmin = useMemo(() => {
    if (!userProfile?.email) return false;
    const cleanEmail = userProfile.email.trim().toLowerCase();
    return adminWhitelist.some(admin => admin.toLowerCase() === cleanEmail);
  }, [userProfile?.email, adminWhitelist]);

  // 2.5 Vodafone Cash Admin Wallet Number State (with real-time sync)
  const [vodafoneCashWalletNumber, setVodafoneCashWalletNumber] = useState<string>(() => getVodafoneCashAdminWallet());

  useEffect(() => {
    const handleWalletSync = (e: any) => {
      if (e?.detail && typeof e.detail === 'string') {
        setVodafoneCashWalletNumber(e.detail);
      }
    };
    window.addEventListener('merchant_radar_vodafone_wallet_updated', handleWalletSync);
    return () => window.removeEventListener('merchant_radar_vodafone_wallet_updated', handleWalletSync);
  }, []);

  const updateVodafoneCashWalletNumber = useCallback((newNumber: string) => {
    const cleaned = saveVodafoneCashAdminWallet(newNumber);
    setVodafoneCashWalletNumber(cleaned);
  }, []);

  // 3. Subscription Record State
  const [subscription, setSubscription] = useState<SubscriptionRecord>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Default new user: 3-day free trial
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // exactly 3 days

    return {
      planId: 'trial_3_days',
      status: 'trialing',
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
    };
  });

  // Save subscription record changes
  const saveSubscription = useCallback((record: SubscriptionRecord) => {
    setSubscription(record);
    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(record));
    } catch {
      // ignore
    }
  }, []);

  // Sync Whitelisted status automatically if user is admin
  useEffect(() => {
    if (isWhitelistedAdmin && subscription.status !== 'admin_whitelist') {
      saveSubscription({
        ...subscription,
        planId: 'admin_lifetime',
        status: 'admin_whitelist',
        isLifetimeAdmin: true,
        notes: 'مستثنى ومفعل مدى الحياة ضمن قائمة الإدارة المعتمدة (Admin Whitelist)'
      });
    }
  }, [isWhitelistedAdmin, subscription, saveSubscription]);

  // 4. Trial Timer & Expiration Calculation
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 10000); // check every 10 seconds

    return () => clearInterval(timer);
  }, []);

  const { isTrialActive, isTrialExpired, trialRemainingTime, status } = useMemo(() => {
    if (isWhitelistedAdmin) {
      return {
        isTrialActive: false,
        isTrialExpired: false,
        status: 'admin_whitelist' as SubscriptionStatus,
        trialRemainingTime: {
          days: 999,
          hours: 23,
          minutes: 59,
          totalSeconds: 999999,
          formatted: 'وصول إدارة دائم وغير محدود 👑'
        }
      };
    }

    // Check if user has active paid subscription
    if (subscription.status === 'active' && subscription.subscriptionEndDate) {
      const subEnd = new Date(subscription.subscriptionEndDate).getTime();
      if (subEnd > nowTimestamp) {
        return {
          isTrialActive: false,
          isTrialExpired: false,
          status: 'active' as SubscriptionStatus,
          trialRemainingTime: {
            days: 0,
            hours: 0,
            minutes: 0,
            totalSeconds: 0,
            formatted: 'اشتراك نشط ومعتمد ✅'
          }
        };
      }
    }

    // Check if user has a pending Vodafone Cash verification
    if (subscription.status === 'pending_verification') {
      return {
        isTrialActive: false,
        isTrialExpired: true,
        status: 'pending_verification' as SubscriptionStatus,
        trialRemainingTime: {
          days: 0,
          hours: 0,
          minutes: 0,
          totalSeconds: 0,
          formatted: 'طلب الاشتراك قيد التأكيد والمراجعة (Pending Verification) ⏳'
        }
      };
    }

    // Check 3-day trial
    const trialEndMs = new Date(subscription.trialEndDate).getTime();
    const diffMs = trialEndMs - nowTimestamp;

    if (diffMs > 0) {
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      let formatted = '';
      if (days > 0) {
        formatted = `باقي ${days} يوم و ${hours} ساعة على انتهاء تجربتك المجانية`;
      } else if (hours > 0) {
        formatted = `باقي ${hours} ساعة و ${minutes} دقيقة على انتهاء تجربتك المجانية`;
      } else {
        formatted = `باقي ${minutes} دقيقة على انتهاء تجربتك المجانية`;
      }

      return {
        isTrialActive: true,
        isTrialExpired: false,
        status: 'trialing' as SubscriptionStatus,
        trialRemainingTime: {
          days,
          hours,
          minutes,
          totalSeconds,
          formatted
        }
      };
    } else {
      return {
        isTrialActive: false,
        isTrialExpired: true,
        status: 'expired' as SubscriptionStatus,
        trialRemainingTime: {
          days: 0,
          hours: 0,
          minutes: 0,
          totalSeconds: 0,
          formatted: 'انتهت الفترة التجريبية (3 أيام)'
        }
      };
    }
  }, [isWhitelistedAdmin, subscription, nowTimestamp]);

  const isSubscribed = status === 'active' || status === 'admin_whitelist';
  const isPendingVerification = status === 'pending_verification';

  // 5. Activate Paid Plan
  const activatePlan = useCallback(async (
    planId: SubscriptionPlanId, 
    method: PaymentMethodType, 
    reference?: string,
    amount?: number,
    merchantId?: string,
    merchantName?: string
  ): Promise<{ success: boolean; message: string; referenceNumber?: string }> => {
    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!selectedPlan && planId !== 'admin_lifetime') {
      return { success: false, message: 'الخطة المختارة غير صالحة' };
    }

    const now = new Date();
    const durationMonths = selectedPlan?.durationMonths || 6;
    const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

    const refNumber = reference || `MR-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalAmount = amount ?? selectedPlan?.priceEGP ?? 1500;

    const historyEntry: PaymentHistoryLogEntry = {
      id: `pay-${Date.now()}`,
      planId,
      planName: selectedPlan?.nameArabic || 'وصول إداري دائم',
      merchantId,
      merchantName: merchantName || 'الحساب الرئيسي للتاجر',
      amountEGP: finalAmount,
      paymentMethod: method,
      referenceNumber: refNumber,
      status: 'paid',
      activatedAt: now.toISOString(),
      expiresAt: endDate.toISOString(),
    };

    const newRecord: SubscriptionRecord = {
      ...subscription,
      planId,
      status: 'active',
      subscriptionStartDate: now.toISOString(),
      subscriptionEndDate: endDate.toISOString(),
      paymentMethod: method,
      transactionReference: refNumber,
      amountPaidEGP: finalAmount,
      notes: `تم تفعيل الاشتراك بنجاح عبر ${method} بتاريخ ${now.toLocaleDateString('ar-EG')}`,
      paymentHistory: [historyEntry, ...(subscription.paymentHistory || [])]
    };

    saveSubscription(newRecord);
    return { 
      success: true, 
      referenceNumber: refNumber,
      message: `تم تفعيل ${selectedPlan?.nameArabic || 'الاشتراك'} بنجاح وتحديث الحالة إلى "نشط (Subscribed)"! رقم المرجع: ${refNumber}` 
    };
  }, [subscription, saveSubscription]);

  // 5.5 Submit Vodafone Cash Payment (sets status to 'pending_verification')
  const submitVodafoneCashPayment = useCallback(async (params: {
    planId: SubscriptionPlanId;
    amountEGP: number;
    transactionId: string;
    receiptImageUrl?: string;
    receiptFileName?: string;
    merchantId?: string;
    merchantName?: string;
  }): Promise<{ success: boolean; message: string; referenceNumber: string }> => {
    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === params.planId) || SUBSCRIPTION_PLANS[2];
    const now = new Date();
    const durationMonths = selectedPlan.durationMonths || 12;
    const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
    const txId = params.transactionId.trim() || `VF-${Date.now().toString().slice(-8)}`;
    const refNumber = `VF-PEND-${txId}`;

    const historyEntry: PaymentHistoryLogEntry = {
      id: `vf-pend-${Date.now()}`,
      planId: selectedPlan.id,
      planName: selectedPlan.nameArabic,
      merchantId: params.merchantId,
      merchantName: params.merchantName || 'الحساب الرئيسي للتاجر',
      amountEGP: params.amountEGP || selectedPlan.priceEGP,
      paymentMethod: 'vodafone_cash',
      referenceNumber: refNumber,
      transactionId: txId,
      receiptImageUrl: params.receiptImageUrl,
      receiptFileName: params.receiptFileName,
      walletNumberUsed: vodafoneCashWalletNumber,
      status: 'pending_verification',
      activatedAt: now.toISOString(),
      expiresAt: endDate.toISOString(),
    };

    const newRecord: SubscriptionRecord = {
      ...subscription,
      planId: selectedPlan.id,
      status: 'pending_verification',
      paymentMethod: 'vodafone_cash',
      transactionReference: refNumber,
      transactionId: txId,
      receiptImageUrl: params.receiptImageUrl,
      receiptFileName: params.receiptFileName,
      walletNumberUsed: vodafoneCashWalletNumber,
      amountPaidEGP: params.amountEGP || selectedPlan.priceEGP,
      notes: `طلب تحويل فودافون كاش قيد التأكيد (رقم العملية: ${txId})`,
      paymentHistory: [historyEntry, ...(subscription.paymentHistory || [])]
    };

    saveSubscription(newRecord);
    return {
      success: true,
      referenceNumber: refNumber,
      message: `تم إرسال بيانات تحويل فودافون كاش (رقم العملية: ${txId}) وإيصال التحويل بنجاح! الطلب الآن في حالة "قيد التأكيد (Pending Verification)" ⏳`
    };
  }, [subscription, saveSubscription, vodafoneCashWalletNumber]);

  // 5.6 Admin 1-Click Approval of Pending Vodafone Cash Payment
  const approvePendingPayment = useCallback(async (
    historyEntryId?: string,
    merchantId?: string,
    merchantName?: string
  ): Promise<{ success: boolean; message: string }> => {
    const now = new Date();
    const pendingItem = (subscription.paymentHistory || []).find(
      h => (historyEntryId ? h.id === historyEntryId : h.status === 'pending_verification')
    );
    const planId = pendingItem?.planId || subscription.planId || 'plan_12_months';
    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[2];
    const durationMonths = selectedPlan.durationMonths || 12;
    const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
    const txId = pendingItem?.transactionId || subscription.transactionId || `VF-${Date.now().toString().slice(-6)}`;
    const approvedRef = `VF-APPROVED-${txId}`;

    const updatedHistory = (subscription.paymentHistory || []).map(h => {
      if ((historyEntryId && h.id === historyEntryId) || (!historyEntryId && h.status === 'pending_verification')) {
        return {
          ...h,
          status: 'paid' as const,
          referenceNumber: approvedRef,
          activatedAt: now.toISOString(),
          expiresAt: endDate.toISOString(),
        };
      }
      return h;
    });

    const newRecord: SubscriptionRecord = {
      ...subscription,
      planId: selectedPlan.id,
      status: 'active',
      subscriptionStartDate: now.toISOString(),
      subscriptionEndDate: endDate.toISOString(),
      paymentMethod: 'vodafone_cash',
      transactionReference: approvedRef,
      notes: `تم تأكيد تحويل فودافون كاش (${txId}) من قِبل الإدارة وتفعيل الاشتراك بنجاح ✅`,
      paymentHistory: updatedHistory
    };

    saveSubscription(newRecord);
    return {
      success: true,
      message: `تم تأكيد تحويل فودافون كاش (${txId}) وتفعيل حساب التاجر "${merchantName || pendingItem?.merchantName || 'التاجر'}" لتمديد الاشتراك (${selectedPlan.nameArabic}) بنجاح! ✅🎉`
    };
  }, [subscription, saveSubscription]);

  // 6. Redeem Promo / Voucher Code
  const redeemPromoCode = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'يرجى كتابة كود التفعيل أو الكوبون' };
    }

    const validCodes: Record<string, { planId: SubscriptionPlanId; months: number; name: string }> = {
      'RADAR2026': { planId: 'plan_12_months', months: 12, name: 'كود VIP السنوي الكامل (12 شهراً)' },
      'EGYPTPRO': { planId: 'plan_6_months', months: 6, name: 'كود التاجر المصري المميز (6 أشهر)' },
      'MONTHPRO': { planId: 'plan_1_month', months: 1, name: 'كود الباقة الشهرية (شهر كامل)' },
      'ADMINVIP': { planId: 'admin_lifetime', months: 120, name: 'كود الإدارة والاستثناء الدائم' },
      'TAJERFREE': { planId: 'plan_6_months', months: 6, name: 'كود منحة الغرفة التجارية (6 أشهر)' }
    };

    const matched = validCodes[cleanCode];
    if (matched) {
      if (matched.planId === 'admin_lifetime') {
        saveSubscription({
          ...subscription,
          planId: 'admin_lifetime',
          status: 'admin_whitelist',
          isLifetimeAdmin: true,
          notes: `تم التفعيل عبر كود الإدارة الدائم: ${cleanCode}`
        });
        return { success: true, message: `تهانينا! تم تفعيل الوصول الإداري الدائم غير المحدود بنجاح 👑` };
      }

      await activatePlan(matched.planId, 'promo_code', `CODE-${cleanCode}`, 0);
      return { success: true, message: `تهانينا! تم تفعيل ${matched.name} بنجاح ✅` };
    }

    return { success: false, message: 'كود التفعيل غير صحيح أو انتهت صلاحيته. يرجى التأكد من الرمز وإعادة المحاولة.' };
  }, [subscription, saveSubscription, activatePlan]);

  // 7. Add Email to Admin Whitelist
  const addAdminToWhitelist = useCallback(async (email: string): Promise<boolean> => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      return false;
    }
    if (adminWhitelist.some(e => e.toLowerCase() === clean)) {
      return true; // already whitelisted
    }
    const updated = [...adminWhitelist, clean];
    saveWhitelist(updated);
    return true;
  }, [adminWhitelist, saveWhitelist]);

  // 8. Remove Email from Admin Whitelist
  const removeAdminFromWhitelist = useCallback(async (email: string): Promise<boolean> => {
    const clean = email.trim().toLowerCase();
    // Protect primary owner
    if (clean === 'jassmeinnour@gmail.com') {
      return false;
    }
    const updated = adminWhitelist.filter(e => e.toLowerCase() !== clean);
    saveWhitelist(updated);
    return true;
  }, [adminWhitelist, saveWhitelist]);

  // 9. Reset trial for testing (3 full days / 72 hours)
  const resetTrial = useCallback(() => {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    saveSubscription({
      ...subscription,
      planId: 'trial_3_days',
      status: 'trialing',
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      subscriptionEndDate: undefined
    });
  }, [subscription, saveSubscription]);

  // 10. Simulate immediate trial expiration for testing paywall & lock
  const expireTrialNow = useCallback(() => {
    const now = new Date();
    const pastStart = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(now.getTime() - 60 * 1000);
    saveSubscription({
      ...subscription,
      planId: 'trial_3_days',
      status: 'expired',
      trialStartDate: pastStart.toISOString(),
      trialEndDate: pastEnd.toISOString(),
      subscriptionEndDate: undefined,
      isLifetimeAdmin: false
    });
  }, [subscription, saveSubscription]);

  return {
    subscription,
    status,
    isTrialActive,
    isTrialExpired,
    isPendingVerification,
    isSubscribed,
    isWhitelistedAdmin,
    vodafoneCashWalletNumber,
    updateVodafoneCashWalletNumber,
    trialRemainingTime,
    adminWhitelist,
    plans: SUBSCRIPTION_PLANS,
    paymentHistory: subscription.paymentHistory || [],
    activatePlan,
    submitVodafoneCashPayment,
    approvePendingPayment,
    redeemPromoCode,
    addAdminToWhitelist,
    removeAdminFromWhitelist,
    resetTrial,
    expireTrialNow
  };
}
