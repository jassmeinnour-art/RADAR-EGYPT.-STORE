import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Crown, 
  Clock, 
  Gift, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle,
  Copy,
  ExternalLink,
  Users,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  History,
  Store,
  AlertTriangle,
  RefreshCw,
  Upload,
  Send,
  Key,
  Eye
} from 'lucide-react';
import { 
  SubscriptionHookState, 
  SubscriptionPlanDetails, 
  SubscriptionPlanId, 
  PaymentMethodType 
} from '../hooks/useSubscription';
import { UserMerchantProfile } from '../context/AuthContext';
import { RemoteMerchantClient } from '../types';
import { 
  loadAllRegisteredMerchants, 
  evaluateMerchantSubscriptionState, 
  updateMerchantSubscriptionStatus 
} from '../utils/platformLaunchHelper';
import confetti from 'canvas-confetti';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionState: SubscriptionHookState;
  userProfile: UserMerchantProfile | null;
  onShowToast: (msg: string) => void;
  canDismiss?: boolean; // false if trial is expired and user must subscribe
  activeMerchantId?: string;
  onMerchantSubscriptionChanged?: (updatedMerchant: RemoteMerchantClient) => void;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  subscriptionState,
  userProfile,
  onShowToast,
  canDismiss = true,
  activeMerchantId,
  onMerchantSubscriptionChanged,
}) => {
  const {
    subscription,
    status,
    isTrialActive,
    isTrialExpired,
    isPendingVerification,
    isWhitelistedAdmin,
    vodafoneCashWalletNumber,
    updateVodafoneCashWalletNumber,
    trialRemainingTime,
    adminWhitelist,
    plans,
    paymentHistory,
    activatePlan,
    submitVodafoneCashPayment,
    approvePendingPayment,
    redeemPromoCode,
    addAdminToWhitelist,
    removeAdminFromWhitelist,
    resetTrial,
    expireTrialNow
  } = subscriptionState;

  const [merchants, setMerchants] = useState<RemoteMerchantClient[]>(() => loadAllRegisteredMerchants());
  const [targetMerchantId, setTargetMerchantId] = useState<string>(() => activeMerchantId || merchants[0]?.id || 'merchant-step-queen');

  useEffect(() => {
    if (isOpen) {
      const fresh = loadAllRegisteredMerchants();
      setMerchants(fresh);
      if (activeMerchantId) {
        setTargetMerchantId(activeMerchantId);
      }
    }
  }, [isOpen, activeMerchantId]);

  const targetMerchant = merchants.find(m => m.id === targetMerchantId) || merchants[0];
  const merchantSubState = evaluateMerchantSubscriptionState(targetMerchant);

  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('plan_12_months');
  const [currency, setCurrency] = useState<'EGP' | 'USD'>('EGP');
  const [activeTab, setActiveTab] = useState<'plans' | 'payment' | 'history' | 'admin_whitelist' | 'promo'>('plans');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('vodafone_cash');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [newAdminEmailInput, setNewAdminEmailInput] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Vodafone Cash Checkout & Receipt Upload State
  const [vodafoneTransactionId, setVodafoneTransactionId] = useState<string>('');
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptFileSize, setReceiptFileSize] = useState<string | null>(null);
  const [adminWalletInput, setAdminWalletInput] = useState<string>(vodafoneCashWalletNumber);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAdminWalletInput(vodafoneCashWalletNumber);
  }, [vodafoneCashWalletNumber]);

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('⚠️ يرجى اختيار ملف صورة صالح لإيصال التحويل (PNG, JPG, WEBP)');
      return;
    }

    const sizeKB = Math.round(file.size / 1024);
    const formattedSize = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setReceiptPreviewUrl(dataUrl);
        setReceiptFileName(file.name);
        setReceiptFileSize(formattedSize);
        onShowToast(`✅ تم رفع ومعالجة صورة إيصال فودافون كاش (${file.name}) بنجاح — جاهزة للمعاينة`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearModalReceipt = () => {
    setReceiptPreviewUrl(null);
    setReceiptFileName(null);
    setReceiptFileSize(null);
    if (modalFileInputRef.current) {
      modalFileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[plans.length - 1];

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    onShowToast('تم نسخ البيانات للحافظة ✓');
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Submit Vodafone Cash Transfer for Pending Verification
  const handleSubmitVodafoneVerification = async () => {
    if (!vodafoneTransactionId.trim()) {
      onShowToast('⚠️ يرجى إدخال رقم عملية التحويل (Transaction ID) أولاً');
      return;
    }
    if (!receiptPreviewUrl) {
      onShowToast('⚠️ يرجى رفع صورة إيصال تحويل فودافون كاش للمعاينة قبل الإرسال');
      return;
    }

    setIsProcessing(true);
    try {
      const amountPaid = currency === 'EGP' ? selectedPlan.priceEGP : selectedPlan.priceUSD * 50;
      const res = await submitVodafoneCashPayment({
        planId: selectedPlanId,
        amountEGP: amountPaid,
        transactionId: vodafoneTransactionId.trim(),
        receiptImageUrl: receiptPreviewUrl,
        receiptFileName: receiptFileName || 'vodafone-receipt.jpg',
        merchantId: targetMerchant?.id,
        merchantName: targetMerchant?.storeName
      });

      if (targetMerchant?.id) {
        const updatedMerch = updateMerchantSubscriptionStatus(targetMerchant.id, 'submit_pending_payment', {
          planId: selectedPlanId as any,
          planName: selectedPlan.nameArabic,
          durationMonths: selectedPlan.durationMonths,
          amountEGP: amountPaid,
          paymentMethod: 'vodafone_cash',
          referenceNumber: res.referenceNumber,
          transactionId: vodafoneTransactionId.trim(),
          receiptImageUrl: receiptPreviewUrl,
          receiptFileName: receiptFileName || 'vodafone-receipt.jpg',
          walletNumberUsed: vodafoneCashWalletNumber
        });
        if (updatedMerch) {
          setMerchants(loadAllRegisteredMerchants());
          onMerchantSubscriptionChanged?.(updatedMerch);
        }
      }

      onShowToast(res.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Payment / Activation (Updates both Global Subscription & Target Merchant to "Active / Subscribed")
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      (document.activeElement as HTMLElement)?.blur();

      const amountPaid = currency === 'EGP' ? selectedPlan.priceEGP : selectedPlan.priceUSD * 50;
      const res = await activatePlan(
        selectedPlanId, 
        selectedPaymentMethod, 
        undefined, 
        amountPaid,
        targetMerchant?.id,
        targetMerchant?.storeName
      );

      if (targetMerchant?.id) {
        const updatedMerch = updateMerchantSubscriptionStatus(targetMerchant.id, 'activate_plan', {
          planId: selectedPlanId as any,
          planName: selectedPlan.nameArabic,
          durationMonths: selectedPlan.durationMonths,
          amountEGP: amountPaid,
          paymentMethod: selectedPaymentMethod,
          referenceNumber: res.referenceNumber
        });
        if (updatedMerch) {
          setMerchants(loadAllRegisteredMerchants());
          onMerchantSubscriptionChanged?.(updatedMerch);
        }
      }

      if (res.success) {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        onShowToast(res.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        onShowToast(res.message);
      }
    } catch (err) {
      console.error('Payment error:', err);
      onShowToast('حدث خطأ أثناء معالجة الاشتراك، يرجى إعادة المحاولة.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Redeem Promo
  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement)?.blur();
    if (!promoCodeInput.trim()) {
      onShowToast('يرجى كتابة رمز التفعيل أو الكوبون أولاً');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await redeemPromoCode(promoCodeInput);
      onShowToast(res.message);
      if (res.success) {
        if (targetMerchant?.id) {
          const updatedMerch = updateMerchantSubscriptionStatus(targetMerchant.id, 'activate_plan', {
            planId: 'plan_12_months',
            planName: `تفعيل بكود ترويجي (${promoCodeInput.toUpperCase()})`,
            durationMonths: 12,
            amountEGP: 0,
            paymentMethod: 'promo_code',
            referenceNumber: `PROMO-${promoCodeInput.toUpperCase()}`
          });
          if (updatedMerch) {
            setMerchants(loadAllRegisteredMerchants());
            onMerchantSubscriptionChanged?.(updatedMerch);
          }
        }
        confetti({ particleCount: 50, spread: 70 });
        setPromoCodeInput('');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch {
      onShowToast('تعذر التحقق من كود التفعيل.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add new admin to whitelist
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement)?.blur();
    const email = newAdminEmailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      onShowToast('يرجى إدخال بريد إلكتروني صالح');
      return;
    }

    const ok = await addAdminToWhitelist(email);
    if (ok) {
      onShowToast(`تمت إضافة "${email}" إلى قائمة الإدارة المستثناة بنجاح 👑`);
      setNewAdminEmailInput('');
    } else {
      onShowToast('الإيميل موجود بالفعل في قائمة الإدارة');
    }
  };

  // Remove admin
  const handleRemoveAdmin = async (email: string) => {
    if (email === 'jassmeinnour@gmail.com') {
      onShowToast('لا يمكن حذف الحساب الأساسي للمطورة / مسؤولة التطبيق');
      return;
    }
    const ok = await removeAdminFromWhitelist(email);
    if (ok) {
      onShowToast(`تمت إزالة ${email} من القائمة المستثناة`);
    }
  };

  return (
    <div
      id="modal-subscription-plans"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#08090D]/90 backdrop-blur-md overflow-y-auto animate-fadeIn"
      dir="rtl"
    >
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-sky-500/40 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar — RADAR Luxury Dark Gold Theme */}
        <div className="bg-gradient-to-r from-[#08090D] via-[#131622] to-[#08090D] border-b border-sky-500/30 text-white p-5 sm:p-6 relative shrink-0">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-1/4 w-64 h-32 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-48 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center text-[#08090D] shadow-lg shadow-sky-500/30 border border-sky-300 shrink-0">
                <Crown className="w-6 h-6 text-[#08090D]" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black font-['Alexandria'] bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent">
                    {isTrialExpired
                      ? 'انتهت فترة التجربة المجانية (3 أيام)'
                      : 'خطط الاشتراكات وباقات رادار التاجر الذكي (RADAR)'}
                  </h2>
                  
                  {isWhitelistedAdmin ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-black border border-sky-400/40 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-sky-300" />
                      <span>حساب إدارة مستثنى (VIP Lifetime)</span>
                    </span>
                  ) : isTrialActive ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black border border-emerald-400/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>⏳ باقي على انتهاء التجربة المجانية: {trialRemainingTime.days} يوم و {trialRemainingTime.hours} ساعات</span>
                    </span>
                  ) : isTrialExpired ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 text-[11px] font-black border border-rose-400/50 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>انتهت فترة التجربة المجانية (3 أيام) 🔒</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-black border border-sky-400/40">
                      اشتراك مفعل نشط ✅
                    </span>
                  )}
                </div>

                <p className="text-xs text-sky-100/80 mt-1">
                  اختر باقة الاشتراك المناسبة (شهري / سنوي) لتفعيل كافة الميزات المتقدمة ورادار الأسعار اللحظي في السوق المصري.
                </p>
              </div>
            </div>

            {canDismiss && (
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Target Merchant Selector & Live Status Strip */}
          <div className="mt-4 p-3 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Store className="w-4 h-4 text-sky-300 shrink-0" />
              <span className="text-xs font-bold text-indigo-100">التاجر المحدد للاشتراك أو التجربة:</span>
              <select
                value={targetMerchantId}
                onChange={(e) => setTargetMerchantId(e.target.value)}
                className="h-8 px-3 rounded-xl bg-slate-900 text-white border border-indigo-400/40 text-xs font-bold focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                {merchants.map(m => {
                  const st = evaluateMerchantSubscriptionState(m);
                  return (
                    <option key={m.id} value={m.id}>
                      {m.storeName} — ({st.status === 'active' ? 'مشترك نشط ✅' : st.status === 'trialing' ? `تجربة: باقي ${st.remainingDays} يوم` : 'منتهي 🔒'})
                    </option>
                  );
                })}
              </select>
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${
                merchantSubState.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : merchantSubState.status === 'trialing'
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400/40'
                  : 'bg-rose-500/25 text-rose-200 border-rose-400/50'
              }`}>
                {merchantSubState.badgeLabel}
              </span>
            </div>

            {/* Quick Status Simulation / Admin Activation Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (targetMerchant) {
                    const updated = updateMerchantSubscriptionStatus(targetMerchant.id, 'activate_plan', {
                      planId: 'plan_12_months',
                      planName: 'تفعيل فوري (Subscribed)',
                      durationMonths: 12,
                      amountEGP: 2500,
                      paymentMethod: 'instapay'
                    });
                    if (updated) {
                      setMerchants(loadAllRegisteredMerchants());
                      onMerchantSubscriptionChanged?.(updated);
                    }
                  }
                  activatePlan('plan_12_months', 'instapay', undefined, 2500, targetMerchant?.id, targetMerchant?.storeName);
                  onShowToast(`تم تحديث حالة التاجر "${targetMerchant?.storeName}" إلى نشط (Subscribed) ✅`);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black transition-all cursor-pointer"
                title="تفعيل فوري لحالة التاجر إلى نشط (Subscribed)"
              >
                تفعيل التاجر (Subscribed) ✅
              </button>

              <button
                type="button"
                onClick={() => {
                  resetTrial();
                  if (targetMerchant) {
                    const updated = updateMerchantSubscriptionStatus(targetMerchant.id, 'reset_trial');
                    if (updated) {
                      setMerchants(loadAllRegisteredMerchants());
                      onMerchantSubscriptionChanged?.(updated);
                    }
                  }
                  onShowToast(`تم تفعيل فترة تجربة مجانية لمدة 3 أيام كاملة (72 ساعة) للتاجر "${targetMerchant?.storeName}" ⏳`);
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                title="بدء أو إعادة ضبط فترة التجربة المجانية 3 أيام (72 ساعة)"
              >
                تجربة 3 أيام (72س) ⏳
              </button>

              <button
                type="button"
                onClick={() => {
                  expireTrialNow();
                  if (targetMerchant) {
                    const updated = updateMerchantSubscriptionStatus(targetMerchant.id, 'expire_trial');
                    if (updated) {
                      setMerchants(loadAllRegisteredMerchants());
                      onMerchantSubscriptionChanged?.(updated);
                    }
                  }
                  onShowToast(`تمت محاكاة انتهاء الـ 3 أيام التجريبية للتاجر "${targetMerchant?.storeName}" وتفعيل جدار الدفع 🔒`);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                title="محاكاة انتهاء التجربة المجانية لاختبار حظر الوصول وجدار الدفع"
              >
                محاكاة انتهاء الـ 3 أيام 🔒
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mt-4 pt-3 border-t border-white/10 overflow-x-auto text-xs font-bold scrollbar-none relative z-10">
            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'plans' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>باقات الاشتراك (شهري / 6 أشهر / سنوي)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payment')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'payment' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>طرق الدفع والتفعيل الفوري</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'history' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>سجل الدفع وحالة التجار ({(targetMerchant?.paymentHistory?.length || 0) + paymentHistory.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('promo')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'promo' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>كود التفعيل والكوبونات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin_whitelist')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'admin_whitelist' 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'bg-white/5 hover:bg-white/10 text-sky-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
              <span>قائمة الإدارة المستثناة (Admin Whitelist)</span>
            </button>
          </div>

        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: PLANS COMPARISON */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              
              {/* Currency Selector & Free Trial Notice */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-indigo-950">
                      فترة تجريبية مجانية 3 أيام (72 ساعة) لجميع التجار الجدد
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      يتمتع كل تاجر جديد بـ 72 ساعة تجربة كاملة لكافة الأدوات (سحب الطلبات، كتالوج المنتجات، أسعار المنافسين، والمعدِّل التلقائي). بعد انتهاء التجربة يرجى اختيار خطتك للمتابعة.
                    </p>
                  </div>
                </div>

                <div className="flex items-center bg-white p-1 rounded-xl border border-indigo-200 shadow-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrency('EGP')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currency === 'EGP' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    جنيه مصري (EGP 🇪🇬)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currency === 'USD' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    دولار أمريكي (USD 💵)
                  </button>
                </div>
              </div>

              {/* Plans Grid (Monthly / 6 Months / 12 Months) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const priceFormatted = currency === 'EGP' 
                    ? `${plan.priceEGP.toLocaleString()} ج.م` 
                    : `$${plan.priceUSD}`;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative rounded-3xl p-5 transition-all cursor-pointer border-2 flex flex-col justify-between ${
                        plan.isPopular
                          ? 'border-indigo-600 bg-gradient-to-b from-indigo-50/50 via-white to-white shadow-xl shadow-indigo-500/10'
                          : isSelected
                            ? 'border-indigo-500 bg-white shadow-lg'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Popular / Best Value Badge */}
                      {plan.badge && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[10px] font-black shadow-md flex items-center gap-1 whitespace-nowrap">
                          <Crown className="w-3.5 h-3.5 text-sky-200" />
                          <span>{plan.badge}</span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Alexandria']">
                              {plan.nameArabic}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {plan.descriptionArabic}
                            </p>
                          </div>

                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-slate-900 font-['Alexandria']">
                              {priceFormatted}
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold">
                              / {plan.durationMonths === 1 ? 'شهرياً' : plan.durationMonths === 6 ? 'لمدة 6 أشهر' : 'لمدة سنة كاملة'}
                            </span>
                          </div>

                          {plan.savingsArabic && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md w-fit">
                              {plan.savingsArabic}
                            </span>
                          )}
                        </div>

                        {/* Features List */}
                        <ul className="space-y-2 text-[11px] text-slate-700 mb-5">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Select Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          setActiveTab('payment');
                        }}
                        className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-[#08090D] shadow-md shadow-sky-500/25 border border-sky-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <span>اشترك الآن لتفعيل كافة الميزات</span>
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>

                    </div>
                  );
                })}
              </div>

              {/* Primary Golden Action Bar + Promo Code & Direct WhatsApp Activation */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#08090D] via-[#131622] to-[#08090D] border border-sky-500/40 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-sky-400" />
                    <span className="text-xs sm:text-sm font-black text-sky-300 font-['Alexandria']">
                      تفعيل فوري لكافة الميزات المقفولة والمتاجر المتعددة
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    اشترك الآن في الباقة المختارة ({selectedPlan.nameArabic}) أو استخدم كود خصم أو تواصل عبر واتساب للتفعيل المباشر.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('payment')}
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 hover:from-sky-300 hover:to-sky-500 text-[#08090D] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 border border-sky-300 cursor-pointer active:scale-95 transition-all"
                  >
                    <Crown className="w-4 h-4 fill-[#08090D]" />
                    <span>اشترك الآن لتفعيل كافة الميزات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('promo')}
                    className="h-10 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Gift className="w-3.5 h-3.5 text-sky-400" />
                    <span>تفعيل كود خصم 🎁</span>
                  </button>

                  <a
                    href={`https://wa.me/201000000000?text=${encodeURIComponent(`مرحباً فريق RADAR، أرغب في تنشيط حسابي والاشتراك في باقة (${selectedPlan.nameArabic}) لمتجري: ${targetMerchant?.storeName || ''}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <span>تواصل واتساب لتنشيط الحساب 💬</span>
                  </a>
                </div>
              </div>

              {/* B2B Guarantee & Invoice Support */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
                  <span className="font-bold text-slate-800 block">فواتير رسمية للشركات</span>
                  <span className="text-[10px] text-slate-500">إيصالات دفع معتمدة بالسجل والبطاقة الضريبية</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <Zap className="w-5 h-5 text-sky-500 mx-auto mb-1.5" />
                  <span className="font-bold text-slate-800 block">تفعيل فوري خلال دقيقة</span>
                  <span className="text-[10px] text-slate-500">فتح فوري لكافة الصلاحيات وقواعد البيانات السحابية</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <Building2 className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                  <span className="font-bold text-slate-800 block">دعم فني متخصص للمتاجر</span>
                  <span className="text-[10px] text-slate-500">مساعدة مباشرة في ربط حسابات أمازون ونون وجوميا</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PAYMENT METHODS */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-indigo-200 block font-bold">الخطة المختارة:</span>
                  <h4 className="text-base font-black font-['Alexandria']">{selectedPlan.nameArabic}</h4>
                  <p className="text-xs text-indigo-200/90 mt-0.5">
                    المدة: {selectedPlan.durationMonths} شهراً - القيمة: {currency === 'EGP' ? `${selectedPlan.priceEGP} ج.م` : `$${selectedPlan.priceUSD}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('plans')}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  تغيير الخطة
                </button>
              </div>

              {/* Payment Methods Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  اختر طريقة الدفع المناسبة لك في مصر:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  
                  {/* Method 1: Vodafone Cash */}
                  <div
                    onClick={() => setSelectedPaymentMethod('vodafone_cash')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'vodafone_cash'
                        ? 'border-red-500 bg-red-50/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                        VF
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          فودافون كاش
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          Vodafone Cash
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Method 2: Orange Cash */}
                  <div
                    onClick={() => setSelectedPaymentMethod('orange_cash')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'orange_cash'
                        ? 'border-orange-500 bg-orange-50/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                        Orange
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          أورنج كاش
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          Orange Cash
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Method 3: Etisalat Cash */}
                  <div
                    onClick={() => setSelectedPaymentMethod('etisalat_cash')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'etisalat_cash'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                        E&
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          اتصالات كاش
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          Etisalat E& Cash
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Method 4: We Cash */}
                  <div
                    onClick={() => setSelectedPaymentMethod('we_cash')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'we_cash'
                        ? 'border-purple-600 bg-purple-50/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                        WE
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          وي كاش
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          Telecom Egypt We
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Method 5: InstaPay */}
                  <div
                    onClick={() => setSelectedPaymentMethod('instapay')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'instapay'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-purple-600 text-white flex items-center justify-center font-black text-[11px] shrink-0">
                        IPN
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          إنستاباي الفوري
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          InstaPay Egypt
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Method 6: Fawry */}
                  <div
                    onClick={() => setSelectedPaymentMethod('fawry')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'fawry'
                        ? 'border-sky-500 bg-sky-50/40 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                        فوري
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          خدمة فوري
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          Fawry Pay
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Method 7: Credit Cards */}
                  <div
                    onClick={() => setSelectedPaymentMethod('credit_card')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'credit_card'
                        ? 'border-blue-600 bg-blue-50/40 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          البطاقات البنكية
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          Visa / Mastercard / Meeza
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Payment Instructions Details Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>بيانات تحويل الدفع والتفعيل:</span>
                  </h5>
                  {selectedPaymentMethod === 'vodafone_cash' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black border border-red-200">
                      تحويل محفظة فودافون كاش + رفع صورة الإيصال
                    </span>
                  )}
                </div>

                {/* Pending Verification Banner & 1-Click Admin Approval inside Modal */}
                {(merchantSubState.isPendingVerification || isPendingVerification || targetMerchant?.pendingPaymentRequest?.status === 'pending_verification') && (
                  <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-black">
                            قيد التأكيد (Pending Verification) ⏳
                          </span>
                          <span className="text-xs font-mono font-bold text-sky-900">
                            رقم العملية: {targetMerchant?.pendingPaymentRequest?.transactionId || subscription.transactionId}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          تم إرسال إيصال تحويل فودافون كاش للتاجر "{targetMerchant?.storeName}" وهو الآن بانتظار تأكيد الآدمن.
                        </p>
                      </div>

                      {(targetMerchant?.pendingPaymentRequest?.receiptImageUrl || subscription.receiptImageUrl) && (
                        <img
                          src={targetMerchant?.pendingPaymentRequest?.receiptImageUrl || subscription.receiptImageUrl || ''}
                          alt="إيصال التحويل"
                          className="w-14 h-14 object-cover rounded-xl border border-sky-400 shrink-0"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const res = await approvePendingPayment(undefined, targetMerchant?.id, targetMerchant?.storeName);
                        if (targetMerchant?.id) {
                          const updatedMerch = updateMerchantSubscriptionStatus(targetMerchant.id, 'approve_pending_payment');
                          if (updatedMerch) {
                            setMerchants(loadAllRegisteredMerchants());
                            onMerchantSubscriptionChanged?.(updatedMerch);
                          }
                        }
                        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
                        onShowToast(res.message);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأكيد التحويل (للآدمن) وتفعيل حساب التاجر تلقائياً لتمديد الاشتراك ✅</span>
                    </button>
                  </div>
                )}

                {['vodafone_cash', 'orange_cash', 'etisalat_cash', 'we_cash'].includes(selectedPaymentMethod) && (() => {
                  const walletConfigs: Record<string, { title: string; number: string; color: string; border: string; placeholder: string }> = {
                    vodafone_cash: { title: 'فودافون كاش', number: vodafoneCashWalletNumber, color: 'text-red-600', border: 'border-red-500', placeholder: 'أدخل رقم عملية التحويل من فودافون كاش (مثال: 00482910384)' },
                    orange_cash: { title: 'أورنج كاش', number: '01222222222', color: 'text-orange-600', border: 'border-orange-500', placeholder: 'أدخل رقم عملية التحويل من أورنج كاش (مثال: ORG-998231)' },
                    etisalat_cash: { title: 'اتصالات كاش (E& Cash)', number: '01111111111', color: 'text-emerald-600', border: 'border-emerald-500', placeholder: 'أدخل رقم عملية التحويل من اتصالات كاش (مثال: ETS-881234)' },
                    we_cash: { title: 'وي كاش (We Cash)', number: '01555555555', color: 'text-purple-600', border: 'border-purple-500', placeholder: 'أدخل رقم عملية التحويل من وي كاش (مثال: WE-554123)' }
                  };
                  const cfg = walletConfigs[selectedPaymentMethod] || walletConfigs['vodafone_cash'];

                  return (
                    <div className="text-xs text-slate-700 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-white border border-slate-300 space-y-1">
                          <span className="text-[11px] text-slate-500 font-bold block">رقم محفظة {cfg.title} المراد التحويل إليها:</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-base text-slate-900" dir="ltr">
                              {cfg.number}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(cfg.number, selectedPaymentMethod)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 font-sans cursor-pointer ${cfg.color} bg-slate-50 hover:bg-slate-100`}
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedField === selectedPaymentMethod ? 'تم النسخ ✓' : 'نسخ الرقم'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-slate-300 space-y-1">
                          <span className="text-[11px] text-slate-500 font-bold block">قيمة الاشتراك المطلوب سدادها:</span>
                          <div className="flex items-center justify-between">
                            <span className={`text-base font-black font-['Alexandria'] ${cfg.color}`}>
                              {selectedPlan.priceEGP.toLocaleString()} جنيه مصري
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {selectedPlan.durationMonths} شهراً
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Transaction ID Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 block">
                          رقم عملية التحويل (Transaction ID) عبر {cfg.title}:
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={vodafoneTransactionId}
                          onChange={(e) => setVodafoneTransactionId(e.target.value)}
                          placeholder={cfg.placeholder}
                          className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-xs focus:outline-none"
                        />
                      </div>

                      {/* File Upload for Receipt + Thumbnail Preview */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>رفع صورة إيصال تحويل {cfg.title} (File Upload):</span>
                          <span className="text-[10px] text-slate-500">تظهر معاينة مصغرة قبل الإرسال</span>
                        </label>

                        <input
                          ref={modalFileInputRef}
                          id="modal-wallet-receipt-file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptFileChange}
                          className="hidden"
                        />

                        {!receiptPreviewUrl ? (
                          <label
                            htmlFor="modal-wallet-receipt-file-upload"
                            className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                          >
                            <Upload className="w-6 h-6 text-indigo-600" />
                            <span className="text-xs font-black text-slate-800">
                              اضغط لرفع صورة إيصال تحويل {cfg.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              يدعم صور PNG, JPG, WEBP مع معاينة مصغرة فورية
                            </span>
                          </label>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-white border-2 border-emerald-500/60 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={receiptPreviewUrl}
                                alt="معاينة مصغرة لإيصال التحويل"
                                className="w-16 h-16 object-cover rounded-xl border border-emerald-400 shadow-sm shrink-0"
                              />
                              <div className="space-y-0.5 text-right">
                                <div className="text-xs font-black text-emerald-700">معاينة مصغرة لإيصال التحويل ✓</div>
                                <div className="text-[11px] font-mono text-slate-700 truncate max-w-[200px]">{receiptFileName}</div>
                                <div className="text-[10px] text-slate-500">الحجم: {receiptFileSize}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <label
                                htmlFor="modal-wallet-receipt-file-upload"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                              >
                                تغيير
                              </label>
                              <button
                                type="button"
                                onClick={handleClearModalReceipt}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {selectedPaymentMethod === 'instapay' && (
                  <div className="text-xs text-slate-700 space-y-2">
                    <p>عنوان الدفع اللحظي عبر تطبيق InstaPay (IPA):</p>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm">
                      <span>merchantradar@instapay</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('merchantradar@instapay', 'insta')}
                        className="text-indigo-600 text-xs flex items-center gap-1 font-sans cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedField === 'insta' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      يتم التفعيل الفوري بمجرد إتمام التحويل وتأكيد الطلب.
                    </p>
                  </div>
                )}

                {selectedPaymentMethod === 'fawry' && (
                  <div className="text-xs text-slate-700 space-y-2">
                    <p>رقم الخدمة في فوري: <strong className="font-mono">78891</strong> (خدمة المدفوعات التجارية والتطبيقات)</p>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm">
                      <span>كود التاجر: 9283-4412</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('92834412', 'fawry')}
                        className="text-indigo-600 text-xs flex items-center gap-1 font-sans cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedField === 'fawry' ? 'تم النسخ' : 'نسخ الكود'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'credit_card' && (
                  <div className="text-xs text-slate-700 space-y-2">
                    <p>الدفع عبر بوابة الدفع الآمنة المعتمدة من البنك المركزي المصري بالتعاون مع فيزا وماستركارد وميزة.</p>
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                      🔒 التشفير البنكي 256-bit مفعل. يمكنك اختبار وتأكيد الدفع فورياً.
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons: Submit Vodafone Cash (Pending Verification) OR Instant Confirm */}
              <div className="space-y-2.5">
                {['vodafone_cash', 'orange_cash', 'etisalat_cash', 'we_cash'].includes(selectedPaymentMethod) && (
                  <button
                    type="button"
                    id="btn-modal-submit-wallet-verification"
                    disabled={isProcessing}
                    onClick={handleSubmitVodafoneVerification}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال بيانات التحويل وإيصال المحفظة الإلكترونية للمراجعة (قيد التأكيد - Pending Verification) 📤</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-confirm-subscription-payment"
                  disabled={isProcessing}
                  onClick={handleConfirmPayment}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>جاري معالجة وتأكيد الاشتراك...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-sky-300" />
                      <span>تأكيد التحويل وتفعيل اشتراك التاجر فوراً إلى "نشط (Subscribed)" ({currency === 'EGP' ? `${selectedPlan.priceEGP} ج.م` : `$${selectedPlan.priceUSD}`}) ✅</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* TAB 2.5: PAYMENT HISTORY & MERCHANTS SUBSCRIPTION STATUS */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* All Registered Merchants Subscription Status Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-600" />
                    <span>حالة التجربة المجانية والاشتراكات للتجار المسجلين ({merchants.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">يمكنك تفعيل أو تجديد أي تاجر بضغطة واحدة</span>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="py-3 px-4">اسم التاجر / المتجر</th>
                          <th className="py-3 px-3">حالة الاشتراك</th>
                          <th className="py-3 px-3">الوقت المتبقي / الصلاحية</th>
                          <th className="py-3 px-3">تاريخ التسجيل</th>
                          <th className="py-3 px-4 text-left">إجراءات التحكم السريع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {merchants.map((m) => {
                          const st = evaluateMerchantSubscriptionState(m);
                          return (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900">
                                <div>{m.storeName}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{m.primaryEmail}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black inline-flex items-center gap-1 ${
                                  st.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : st.status === 'trialing'
                                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}>
                                  {st.status === 'active' ? 'نشط (Subscribed) ✅' : st.status === 'trialing' ? 'تجربة مجانية (3 أيام) ⏳' : 'منتهي (موقوف) 🔒'}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-700">
                                {st.status === 'active' ? (
                                  <span className="text-emerald-700">صالح لمدة {st.remainingDays} يوم</span>
                                ) : st.status === 'trialing' ? (
                                  <span className="text-sky-700">باقي {st.remainingDays} يوم و {st.remainingHours} ساعة</span>
                                ) : (
                                  <span className="text-rose-600">انتهت الـ 72 ساعة التجريبية</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                                {m.createdAt ? new Date(m.createdAt).toLocaleDateString('ar-EG') : 'اليوم'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = updateMerchantSubscriptionStatus(m.id, 'activate_plan', {
                                        planId: 'plan_12_months',
                                        planName: 'الباقة السنوية (تفعيل مباشر)',
                                        durationMonths: 12,
                                        amountEGP: 2500,
                                        paymentMethod: 'instapay'
                                      });
                                      if (updated) {
                                        setMerchants(loadAllRegisteredMerchants());
                                        onMerchantSubscriptionChanged?.(updated);
                                        onShowToast(`تم تفعيل اشتراك التاجر "${m.storeName}" وتحديث حالته إلى نشط (Subscribed) ✅`);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                                  >
                                    تفعيل (Subscribed) ✅
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = updateMerchantSubscriptionStatus(m.id, 'reset_trial');
                                      if (updated) {
                                        setMerchants(loadAllRegisteredMerchants());
                                        onMerchantSubscriptionChanged?.(updated);
                                        onShowToast(`تم بدء تجربة مجانية 3 أيام (72 ساعة) للتاجر "${m.storeName}" ⏳`);
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                  >
                                    تجديد 3 أيام
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = updateMerchantSubscriptionStatus(m.id, 'expire_trial');
                                      if (updated) {
                                        setMerchants(loadAllRegisteredMerchants());
                                        onMerchantSubscriptionChanged?.(updated);
                                        onShowToast(`تم إنهاء تجربة التاجر "${m.storeName}" وتفعيل قفل الاشتراك 🔒`);
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold cursor-pointer"
                                  >
                                    إنهاء التجربة 🔒
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Payment Transactions Log */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>سجل عمليات الدفع وتفعيل الاشتراكات</span>
                </h4>

                {(targetMerchant?.paymentHistory?.length || 0) === 0 && paymentHistory.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">لا توجد معاملات دفع مسجلة حتى الآن</p>
                    <p className="text-[11px] text-slate-500">
                      التاجر حالياً في فترة التجربة المجانية (3 أيام). عند اختيار باقة وتأكيد الدفع سيظهر الإيصال المرجعي هنا فوراً.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...(targetMerchant?.paymentHistory || []), ...paymentHistory].map((item: any, idx) => {
                      const isPendingItem = item.status === 'pending_verification';
                      return (
                        <div
                          key={item.id || idx}
                          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                            isPendingItem
                              ? 'bg-sky-50/80 border-sky-300'
                              : 'bg-emerald-50/50 border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.receiptImageUrl && (
                              <img
                                src={item.receiptImageUrl}
                                alt="إيصال فودافون كاش"
                                className="w-12 h-12 object-cover rounded-xl border border-slate-300 shrink-0"
                              />
                            )}
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-slate-900">{item.planName}</span>
                                <span className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold ${
                                  isPendingItem ? 'bg-sky-600' : 'bg-emerald-600'
                                }`}>
                                  {isPendingItem ? 'قيد التأكيد (Pending Verification) ⏳' : 'مدفوع ومفعل ✓'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                التاجر: <strong>{item.merchantName || targetMerchant?.storeName}</strong> • وسيلة الدفع: <span className="uppercase font-mono">{item.paymentMethod}</span>
                                {item.transactionId && (
                                  <span> • رقم العملية: <strong className="font-mono text-slate-900">{item.transactionId}</strong></span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-left sm:text-right font-mono space-y-0.5">
                              <div className="text-sm font-black text-emerald-700">{item.amountEGP.toLocaleString()} ج.م</div>
                              <div className="text-[10px] text-slate-500">مرجع: {item.referenceNumber}</div>
                            </div>

                            {isPendingItem && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const res = await approvePendingPayment(item.id, item.merchantId || targetMerchant?.id, item.merchantName || targetMerchant?.storeName);
                                  const mId = item.merchantId || targetMerchant?.id;
                                  if (mId) {
                                    const updatedMerch = updateMerchantSubscriptionStatus(mId, 'approve_pending_payment');
                                    if (updatedMerch) {
                                      setMerchants(loadAllRegisteredMerchants());
                                      onMerchantSubscriptionChanged?.(updatedMerch);
                                    }
                                  }
                                  confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
                                  onShowToast(res.message);
                                }}
                                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تأكيد التحويل وتفعيل الاشتراك ✅</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROMO CODE */}
          {activeTab === 'promo' && (
            <div className="space-y-5 max-w-lg mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 font-['Alexandria']">
                  تفعيل كود الخصم أو الترقية
                </h3>
                <p className="text-xs text-slate-500">
                  إذا حصلت على رمز ترويجي من الغرفة التجارية أو من مطورة المنظومة، أدخله هنا للتفعيل الفوري.
                </p>
              </div>

              <form onSubmit={handleRedeemPromo} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    رمز التفعيل أو كود المنحة (Promo Code)
                  </label>
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="مثال: RADAR2026 أو EGYPTPRO"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-center font-mono font-black text-slate-900 tracking-wider text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all uppercase"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">أكواد جاهزة للتجربة الفورية:</div>
                  <div className="flex items-center gap-2 flex-wrap pt-1 font-mono">
                    <span 
                      onClick={() => setPromoCodeInput('RADAR2026')} 
                      className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold cursor-pointer hover:bg-indigo-200"
                    >
                      RADAR2026 (سنة كاملة)
                    </span>
                    <span 
                      onClick={() => setPromoCodeInput('EGYPTPRO')} 
                      className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold cursor-pointer hover:bg-emerald-200"
                    >
                      EGYPTPRO (6 أشهر)
                    </span>
                    <span 
                      onClick={() => setPromoCodeInput('ADMINVIP')} 
                      className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold cursor-pointer hover:bg-sky-200"
                    >
                      ADMINVIP (إدارة مستثناة)
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تطبيق الكود وتفعيل الحساب فورياً</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ADMIN WHITELIST & PAYMENT ADMIN SETTINGS (تحكم إداري في الاشتراكات ورقم فودافون كاش) */}
          {activeTab === 'admin_whitelist' && (
            <div className="space-y-6">

              {/* Payment Admin Settings: Vodafone Cash Wallet Number */}
              <div className="p-4 sm:p-5 rounded-2xl bg-red-50/70 border-2 border-red-200 space-y-3 text-right">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-red-900 font-black text-sm font-['Alexandria']">
                    <Smartphone className="w-5 h-5 text-red-600" />
                    <span>إعدادات الدفع باللوحة (Payment Admin Settings) — رقم فودافون كاش</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                    يظهر تلقائياً لجميع التجار عند الدفع
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  حدد رقم محفظة فودافون كاش المخصص لاستلام مدفوعات الاشتراكات من التجار. أي تعديل هنا ينعكس فوراً في شاشة الدفع وجدار الاشتراك.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    id="modal-admin-vodafone-wallet-input"
                    type="tel"
                    dir="ltr"
                    value={adminWalletInput}
                    onChange={(e) => setAdminWalletInput(e.target.value)}
                    placeholder="01023456789"
                    className="flex-1 h-11 px-4 rounded-xl bg-white border-2 border-red-300 text-sm text-slate-900 font-mono font-black text-left focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!adminWalletInput.trim()) {
                        onShowToast('يرجى إدخال رقم محفظة فودافون كاش صالح');
                        return;
                      }
                      updateVodafoneCashWalletNumber(adminWalletInput.trim());
                      onShowToast(`✅ تم حفظ وتحديث رقم فودافون كاش لاستلام المدفوعات إلى: ${adminWalletInput.trim()}`);
                    }}
                    className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ رقم فودافون كاش ✓</span>
                  </button>
                </div>
              </div>
              
              {/* Whitelist Overview Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-2 text-right">
                <div className="flex items-center gap-2 text-sky-900 font-black text-sm font-['Alexandria']">
                  <Crown className="w-5 h-5 text-sky-600" />
                  <span>لوحة التحكم في قائمة الإدارة والاشتراكات المستثناة (Admin Whitelist)</span>
                </div>
                <p className="text-xs text-sky-800/90 leading-relaxed">
                  تتيح هذه القائمة لمطورة ومسؤولة المنظومة استثناء حسابات محددة من قيود الـ 3 أيام التجريبية ومن شاشات الدفع، بحيث يحصل أصحاب هذه العناوين على <strong>وصول مجاني ودائم مدى الحياة (Lifetime Admin Access)</strong> بكامل المزايا.
                </p>
              </div>

              {/* Add New Email Form */}
              <form onSubmit={handleAddAdmin} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  إضافة بريد إلكتروني جديد لقائمة الاستثناء الدائم:
                </label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={newAdminEmailInput}
                    onChange={(e) => setNewAdminEmailInput(e.target.value)}
                    placeholder="partner@company.com"
                    dir="ltr"
                    className="flex-1 h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono text-left"
                  />
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة للاستثناء الدائم 👑</span>
                  </button>
                </div>
              </form>

              {/* Current Whitelisted Emails List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>العناوين المستثناة حالياً ({adminWhitelist.length}):</span>
                  <span className="text-[11px] text-slate-500">مسموح لهم بالاستخدام الدائم مجاناً</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {adminWhitelist.map((email) => {
                    const isOwner = email.toLowerCase() === 'jassmeinnour@gmail.com';
                    const isCurrent = userProfile?.email?.toLowerCase() === email.toLowerCase();

                    return (
                      <div
                        key={email}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isOwner 
                            ? 'bg-sky-50/70 border-sky-300 font-bold' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Crown className={`w-4 h-4 shrink-0 ${isOwner ? 'text-sky-600' : 'text-slate-400'}`} />
                          <span className="font-mono text-slate-900 truncate" dir="ltr">{email}</span>
                          
                          {isOwner && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-800 text-[10px] font-black shrink-0">
                              مالك المنظومة (Owner) ⭐
                            </span>
                          )}

                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 text-[10px] font-black shrink-0">
                              أنت الآن
                            </span>
                          )}
                        </div>

                        {!isOwner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAdmin(email)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0"
                            title="إزالة من القائمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Developer Testing Utility */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>أدوات فحص واختبار الفترات التجريبية:</span>
                <button
                  type="button"
                  onClick={() => {
                    resetTrial();
                    onShowToast('تمت إعادة تعيين التجربة المجانية إلى 3 أيام جديدة لاختبار دورة الحياة ⏳');
                  }}
                  className="text-indigo-600 hover:underline cursor-pointer font-bold"
                >
                  إعادة تعيين الـ 3 أيام التجريبية
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ضمان استرجاع الأموال خلال 14 يوماً في حال عدم الرضا</span>
          </div>

          {canDismiss && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold transition-all cursor-pointer"
            >
              إغلاق
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
