export interface UserTrialResult {
  isTrialActive: boolean;
  daysRemaining: number | 'غير محدود';
  isUnlimited: boolean;
}

/**
 * تحديد مدة التجربة بناءً على دور المستخدم وتاريخ التسجيل
 */
export const getUserTrialStatus = (user: { role?: string; createdAt?: Date | string | number | any }): UserTrialResult => {
  // إذا كان المستخدم Super Admin تكون الصلاحية مفتوحة دائماً
  if (user?.role === 'super_admin') {
    return {
      isTrialActive: true,
      daysRemaining: 'غير محدود',
      isUnlimited: true
    };
  }

  // للمستخدمين العاديين: حساب 3 أيام من تاريخ التسجيل
  const TRIAL_DAYS = 3;
  const now = new Date();
  
  let registrationDate = new Date();
  if (user?.createdAt) {
    if (typeof user.createdAt.toDate === 'function') {
      // Handle Firestore Timestamp
      registrationDate = user.createdAt.toDate();
    } else {
      registrationDate = new Date(user.createdAt);
    }
  }

  // Fallback to current date if invalid date parsed
  if (isNaN(registrationDate.getTime())) {
    registrationDate = new Date();
  }

  const expiryDate = new Date(registrationDate.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    isTrialActive: daysRemaining > 0,
    daysRemaining: daysRemaining,
    isUnlimited: false
  };
};
