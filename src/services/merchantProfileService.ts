/**
 * Merchant Profiles Management Service
 * خدمة إدارة ملفات تعريف التجار المتعددة وتبديل بيانات التواصل (الواتساب، اسم التاجر، المنطقة) تلقائياً في التنبيهات
 */

import { 
  getWhatsAppServiceConfig, 
  saveWhatsAppServiceConfig, 
  normalizeWhatsAppNumber,
  WhatsAppRecipient 
} from './whatsappService';

export interface MerchantProfile {
  id: string;
  profileName: string;      // اسم ملف التعريف (مثل: فرع القاهرة - العتبة)
  merchantName: string;     // اسم التاجر الشخصي (مثل: م. حسام الشريف)
  storeName: string;        // اسم المتجر الرسمي (مثل: الصفوة للإلكترونيات)
  whatsappNumber: string;   // رقم الواتساب المعتمد للتنبيهات (مثل: 01097751352)
  region: string;           // المنطقة / المحافظة (مثل: القاهرة - العتبة وشارع عبد العزيز)
  role: 'admin' | 'pricing_manager' | 'inventory_specialist';
  email?: string;
  isDefault?: boolean;
  notes?: string;
  avatarEmoji?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY_PROFILES = 'merchant_radar_merchant_profiles_v1';
const STORAGE_KEY_ACTIVE_PROFILE_ID = 'merchant_radar_active_profile_id_v1';

export const DEFAULT_MERCHANT_PROFILES: MerchantProfile[] = [
  {
    id: 'profile-cairo-elsharif',
    profileName: 'فرع القاهرة - شارع عبد العزيز',
    merchantName: 'م. حسام الشريف',
    storeName: 'الصفوة للإلكترونيات والأجهزة',
    whatsappNumber: '01097751352',
    region: 'القاهرة - العتبة وشارع عبد العزيز',
    role: 'admin',
    email: 'elsharif.cairo@merchant-radar.eg',
    avatarEmoji: '🏬',
    isDefault: true,
    notes: 'الملف الرئيسي لإدارة تسعير وتنبيهات منتجات سوق شارع عبد العزيز والعتبة',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-10-26T12:00:00.000Z'
  },
  {
    id: 'profile-giza-nour',
    profileName: 'فرع الجيزة - المهندسين والدقي',
    merchantName: 'أحمد نور الدين',
    storeName: 'رادار هوم آند تك',
    whatsappNumber: '01198765432',
    region: 'الجيزة - المهندسين والدقي',
    role: 'pricing_manager',
    email: 'ahmed.nour@merchant-radar.eg',
    avatarEmoji: '🏢',
    isDefault: false,
    notes: 'متابعة أسعار وتنبيهات أجهزة المنزل والإلكترونيات الاستهلاكية لفرع الجيزة',
    createdAt: '2026-09-15T12:00:00.000Z',
    updatedAt: '2026-10-26T12:00:00.000Z'
  },
  {
    id: 'profile-alex-jabali',
    profileName: 'فرع الإسكندرية - سموحة ومحطة الرمل',
    merchantName: 'كريم الجبالي',
    storeName: 'الجبالي ستورز للأجهزة الذكية',
    whatsappNumber: '01223456789',
    region: 'الإسكندرية - سموحة ومحطة الرمل',
    role: 'pricing_manager',
    email: 'karim.jabali@merchant-radar.eg',
    avatarEmoji: '🌊',
    isDefault: false,
    notes: 'تنبيهات الأسعار لقطاع الساحل والإسكندرية مع عروض التوصيل المحلي',
    createdAt: '2026-10-01T08:30:00.000Z',
    updatedAt: '2026-10-26T12:00:00.000Z'
  },
  {
    id: 'profile-damietta-dasouqi',
    profileName: 'فرع دمياط - المنطقة الصناعية والمفروشات',
    merchantName: 'الحاج إبراهيم الدسوقي',
    storeName: 'الدسوقي فرنتشر & إلكترونيكس',
    whatsappNumber: '01012345678',
    region: 'دمياط - المنطقة الصناعية والمفروشات',
    role: 'inventory_specialist',
    email: 'dasouqi.furniture@merchant-radar.eg',
    avatarEmoji: '🛋️',
    isDefault: false,
    notes: 'إدارة مخزون وأسعار مفروشات وأثاث هومزمارت والمكاتب الطبية',
    createdAt: '2026-10-10T14:15:00.000Z',
    updatedAt: '2026-10-26T12:00:00.000Z'
  }
];

/**
 * جلب جميع ملفات تعريف التجار المخزنة
 */
export function getMerchantProfiles(): MerchantProfile[] {
  if (typeof window === 'undefined') return DEFAULT_MERCHANT_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(DEFAULT_MERCHANT_PROFILES));
      return DEFAULT_MERCHANT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('[MerchantProfileService] Failed to load profiles, fallback to default:', err);
  }
  return DEFAULT_MERCHANT_PROFILES;
}

/**
 * حفظ قائمة ملفات التعريف
 */
export function saveMerchantProfiles(profiles: MerchantProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch (err) {
    console.error('[MerchantProfileService] Failed to save profiles:', err);
  }
}

/**
 * جلب معرف الملف التعريفي النشط حالياً
 */
export function getActiveMerchantProfileId(): string {
  if (typeof window === 'undefined') return DEFAULT_MERCHANT_PROFILES[0].id;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
    if (saved) return saved;
  } catch {}
  return DEFAULT_MERCHANT_PROFILES[0].id;
}

/**
 * جلب بيانات الملف التعريفي النشط بالكامل
 */
export function getActiveMerchantProfile(): MerchantProfile {
  const profiles = getMerchantProfiles();
  const activeId = getActiveMerchantProfileId();
  const found = profiles.find(p => p.id === activeId);
  if (found) return found;

  const defaultProfile = profiles.find(p => p.isDefault) || profiles[0] || DEFAULT_MERCHANT_PROFILES[0];
  return defaultProfile;
}

/**
 * مزامنة ملف التاجر النشط مع خدمة إشعارات الواتساب
 * بحيث يتم تبديل رقم الهاتف واسم التاجر والمستلم تلقائياً دون تدخل يدوي
 */
export function syncProfileWithWhatsAppService(profile: MerchantProfile): void {
  try {
    const waConfig = getWhatsAppServiceConfig();
    const normalized = normalizeWhatsAppNumber(profile.whatsappNumber);
    
    // Check if there is already a primary active profile recipient
    const profileRecipientId = `rec-profile-${profile.id}`;
    let updatedRecipients = [...waConfig.recipients];
    
    // Check if matching recipient exists by id or normalized phone
    const existingIndex = updatedRecipients.findIndex(
      r => r.id === profileRecipientId || r.phone === normalized
    );

    const profileRecipient: WhatsAppRecipient = {
      id: profileRecipientId,
      label: `${profile.merchantName} (${profile.profileName})`,
      phone: normalized,
      isActive: true,
      role: profile.role,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (existingIndex >= 0) {
      updatedRecipients[existingIndex] = profileRecipient;
    } else {
      // Put at the very beginning as the active recipient
      updatedRecipients.unshift(profileRecipient);
    }

    saveWhatsAppServiceConfig({
      ...waConfig,
      recipients: updatedRecipients
    });
  } catch (err) {
    console.warn('[MerchantProfileService] Failed to sync with WhatsApp config:', err);
  }
}

/**
 * تبديل الملف التعريفي النشط وتحديث جميع قنوات التنبيه والواتساب
 */
export function setActiveMerchantProfile(profileId: string): MerchantProfile {
  const profiles = getMerchantProfiles();
  const target = profiles.find(p => p.id === profileId);
  if (!target) {
    throw new Error(`Profile with id ${profileId} not found`);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, profileId);
  }

  // مزامنة فورية مع إعدادات الواتساب
  syncProfileWithWhatsAppService(target);

  // إطلاق حدث عام في نافذة المتصفح لتحديث كافة المكونات اللحظية
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('merchant_profile_changed', {
        detail: {
          profile: target,
          profileId: target.id,
          merchantName: target.merchantName,
          storeName: target.storeName,
          whatsappNumber: target.whatsappNumber,
          region: target.region
        }
      })
    );
  }

  return target;
}

/**
 * إضافة ملف تعريفي جديد للتاجر
 */
export function addMerchantProfile(
  data: Omit<MerchantProfile, 'id' | 'createdAt' | 'updatedAt'>
): MerchantProfile {
  const profiles = getMerchantProfiles();
  const newProfile: MerchantProfile = {
    ...data,
    id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    avatarEmoji: data.avatarEmoji || '🏪',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedList = [newProfile, ...profiles];
  saveMerchantProfiles(updatedList);

  // إذا تم تحديده كافتراضي، قم بتفعيله مباشرة
  if (data.isDefault) {
    setActiveMerchantProfile(newProfile.id);
  }

  return newProfile;
}

/**
 * تعديل بيانات ملف تعريفي موجود
 */
export function updateMerchantProfile(
  id: string,
  updates: Partial<Omit<MerchantProfile, 'id' | 'createdAt'>>
): MerchantProfile {
  const profiles = getMerchantProfiles();
  const index = profiles.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error(`Profile with id ${id} not found`);
  }

  const updatedProfile: MerchantProfile = {
    ...profiles[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  profiles[index] = updatedProfile;
  saveMerchantProfiles(profiles);

  // إذا كان هذا الملف هو الملف النشط، قم بإعادة مزامنته فورياً مع التنبيهات والواتساب
  const currentActiveId = getActiveMerchantProfileId();
  if (currentActiveId === id) {
    syncProfileWithWhatsAppService(updatedProfile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('merchant_profile_changed', {
          detail: {
            profile: updatedProfile,
            profileId: updatedProfile.id,
            merchantName: updatedProfile.merchantName,
            storeName: updatedProfile.storeName,
            whatsappNumber: updatedProfile.whatsappNumber,
            region: updatedProfile.region
          }
        })
      );
    }
  }

  return updatedProfile;
}

/**
 * حذف ملف تعريفي
 */
export function deleteMerchantProfile(id: string): void {
  const profiles = getMerchantProfiles();
  if (profiles.length <= 1) {
    throw new Error('لا يمكن حذف الملف التعريفي الأخير، يجب الاحتفاظ بملف واحد على الأقل.');
  }

  const updatedList = profiles.filter(p => p.id !== id);
  saveMerchantProfiles(updatedList);

  // إذا تم حذف الملف النشط، تحويل التفعيل إلى أول ملف متاح
  const currentActiveId = getActiveMerchantProfileId();
  if (currentActiveId === id) {
    const nextActive = updatedList[0];
    setActiveMerchantProfile(nextActive.id);
  }
}

/**
 * تصدير كافة ملفات التعريف بتنسيق JSON
 */
export function exportMerchantProfilesJson(): string {
  const profiles = getMerchantProfiles();
  const activeId = getActiveMerchantProfileId();
  const payload = {
    app: 'RADAR_EGYPT',
    type: 'merchant_profiles_export',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    activeProfileId: activeId,
    profiles
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * استيراد ملفات التعريف من ملف JSON
 */
export function importMerchantProfilesJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    const candidateList = Array.isArray(parsed) ? parsed : parsed.profiles;
    if (!Array.isArray(candidateList) || candidateList.length === 0) {
      return false;
    }

    // التحقق من صحة الحقول الأساسية
    const validated: MerchantProfile[] = candidateList.map((item, idx) => ({
      id: item.id || `profile-imp-${Date.now()}-${idx}`,
      profileName: item.profileName || `ملف تعريفي ${idx + 1}`,
      merchantName: item.merchantName || 'تاجر رادار مصر',
      storeName: item.storeName || 'متجر معتمد',
      whatsappNumber: item.whatsappNumber || '01012345678',
      region: item.region || 'القاهرة - مصر',
      role: item.role || 'pricing_manager',
      email: item.email || '',
      notes: item.notes || '',
      avatarEmoji: item.avatarEmoji || '🏪',
      isDefault: Boolean(item.isDefault),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    saveMerchantProfiles(validated);
    if (parsed.activeProfileId && validated.some(p => p.id === parsed.activeProfileId)) {
      setActiveMerchantProfile(parsed.activeProfileId);
    } else {
      setActiveMerchantProfile(validated[0].id);
    }
    return true;
  } catch (err) {
    console.error('[MerchantProfileService] Import failed:', err);
    return false;
  }
}
