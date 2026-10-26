/**
 * WhatsApp Integration Service
 * خدمة ربط API واتساب لإرسال تنبيهات فورية عند انخفاض أسعار المنافسين عن السعر المستهدف
 */

import { ProductData, MerchantOffer, CustomerOrder } from '../types';

export interface WhatsAppRecipient {
  id: string;
  label: string; // e.g. "مدير المتجر", "مسؤول التسعير"
  phone: string; // e.g. "201012345678"
  isActive: boolean;
  role: 'admin' | 'pricing_manager' | 'inventory_specialist';
  createdAt: string;
}

export interface WhatsAppServiceConfig {
  isEnabled: boolean;
  provider: 'wa_link' | 'cloud_api' | 'ultramsg';
  cloudApiToken?: string;
  cloudApiPhoneId?: string;
  ultramsgInstanceId?: string;
  ultramsgToken?: string;
  recipients: WhatsAppRecipient[];
  autoAlertOnTargetPriceDrop: boolean;
  minDropAmountEGP: number;
  includeAutoRepriceLink: boolean;
}

export interface WhatsAppAlertDispatchResult {
  success: boolean;
  sentCount: number;
  recipientsSent: string[];
  message: string;
  timestamp: string;
  error?: string;
}

const STORAGE_KEY_CONFIG = 'merchant_radar_whatsapp_service_config_v2';
const STORAGE_KEY_DISPATCH_LOGS = 'merchant_radar_whatsapp_dispatch_logs_v1';

export const DEFAULT_WHATSAPP_SERVICE_CONFIG: WhatsAppServiceConfig = {
  isEnabled: true,
  provider: 'wa_link',
  recipients: [
    {
      id: 'rec-default-1',
      label: 'مدير المتجر والمبيعات',
      phone: '201012345678',
      isActive: true,
      role: 'admin',
      createdAt: '2026-10-18',
    },
    {
      id: 'rec-default-2',
      label: 'مسؤول تسعير أمازون ونون',
      phone: '201198765432',
      isActive: true,
      role: 'pricing_manager',
      createdAt: '2026-10-18',
    }
  ],
  autoAlertOnTargetPriceDrop: true,
  minDropAmountEGP: 10,
  includeAutoRepriceLink: true,
};

/**
 * Standardize and clean phone numbers for WhatsApp
 */
export function normalizeWhatsAppNumber(rawPhone: string): string {
  let cleaned = rawPhone.replace(/[^0-9]/g, '');
  // If Egyptian local format 010..., prefix with 20
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '20' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Retrieve WhatsApp Service Config from LocalStorage
 */
export function getWhatsAppServiceConfig(): WhatsAppServiceConfig {
  if (typeof window === 'undefined') return DEFAULT_WHATSAPP_SERVICE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_WHATSAPP_SERVICE_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_WHATSAPP_SERVICE_CONFIG,
      ...parsed,
      recipients: parsed.recipients || DEFAULT_WHATSAPP_SERVICE_CONFIG.recipients,
    };
  } catch {
    return DEFAULT_WHATSAPP_SERVICE_CONFIG;
  }
}

/**
 * Save WhatsApp Service Config to LocalStorage
 */
export function saveWhatsAppServiceConfig(config: WhatsAppServiceConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save WhatsApp config:', err);
  }
}

/**
 * Add a new recipient to WhatsApp notification list
 */
export function addWhatsAppRecipient(
  label: string,
  phone: string,
  role: 'admin' | 'pricing_manager' | 'inventory_specialist' = 'pricing_manager'
): WhatsAppRecipient {
  const current = getWhatsAppServiceConfig();
  const normalized = normalizeWhatsAppNumber(phone);
  const newRecipient: WhatsAppRecipient = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    label: label.trim() || 'مسؤول المتابعة',
    phone: normalized,
    isActive: true,
    role,
    createdAt: new Date().toISOString().split('T')[0],
  };

  const updatedRecipients = [...current.recipients, newRecipient];
  saveWhatsAppServiceConfig({
    ...current,
    recipients: updatedRecipients,
  });

  return newRecipient;
}

/**
 * Remove a recipient from the list
 */
export function removeWhatsAppRecipient(id: string): void {
  const current = getWhatsAppServiceConfig();
  const updatedRecipients = current.recipients.filter(r => r.id !== id);
  saveWhatsAppServiceConfig({
    ...current,
    recipients: updatedRecipients,
  });
}

/**
 * Toggle recipient active state
 */
export function toggleWhatsAppRecipient(id: string): void {
  const current = getWhatsAppServiceConfig();
  const updatedRecipients = current.recipients.map(r =>
    r.id === id ? { ...r, isActive: !r.isActive } : r
  );
  saveWhatsAppServiceConfig({
    ...current,
    recipients: updatedRecipients,
  });
}

/**
 * Format Arabic WhatsApp Message when a competitor price drops below target
 */
export function generateCompetitorPriceDropMessage(params: {
  productTitle: string;
  sku?: string;
  platformName: string;
  competitorName: string;
  competitorNewPrice: number;
  targetPrice: number;
  currentMerchantPrice: number;
  currency?: string;
  productId?: string;
  recommendedPrice?: number;
  merchantName?: string;
  storeName?: string;
  region?: string;
}): string {
  const {
    productTitle,
    sku,
    platformName,
    competitorName,
    competitorNewPrice,
    targetPrice,
    currentMerchantPrice,
    currency = 'ج.م',
    productId,
    recommendedPrice = Math.max(1, competitorNewPrice - 5),
    merchantName,
    storeName,
    region
  } = params;

  // Resolve active profile details if not passed explicitly
  let activeMerchant = merchantName;
  let activeStore = storeName;
  let activeRegion = region;

  if (typeof window !== 'undefined' && (!activeMerchant || !activeRegion)) {
    try {
      const activeId = localStorage.getItem('merchant_radar_active_profile_id_v1');
      const profilesRaw = localStorage.getItem('merchant_radar_merchant_profiles_v1');
      if (profilesRaw) {
        const profiles = JSON.parse(profilesRaw);
        const match = (Array.isArray(profiles) && activeId) ? profiles.find((p: any) => p.id === activeId) : null;
        if (match) {
          activeMerchant = activeMerchant || match.merchantName;
          activeStore = activeStore || match.storeName;
          activeRegion = activeRegion || match.region;
        }
      }
    } catch {}
  }

  const dropBelowTarget = Math.max(0, targetPrice - competitorNewPrice);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://merchant-radar.duckdns.org';
  const autoRepriceUrl = `${baseUrl}/?action=autoreprice&productId=${productId || ''}&newPrice=${recommendedPrice}`;

  return [
    `🚨 *تنبيه رادار التاجر: هبوط سعر منافس دون السعر المستهدف!* 🚨`,
    activeMerchant ? `👤 *التاجر المعتمد:* ${activeMerchant}${activeRegion ? ` (${activeRegion})` : ''}` : '',
    activeStore ? `🏬 *المتجر:* ${activeStore}` : '',
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *المنتج:* ${productTitle}`,
    sku ? `🏷️ *الكود (SKU):* ${sku}` : '',
    `🏬 *المنصة:* ${platformName}`,
    `👤 *المنافس:* ${competitorName}`,
    `📉 *سعر المنافس الجديد:* ${competitorNewPrice.toLocaleString('ar-EG')} ${currency}`,
    `🎯 *السعر المستهدف لمتجرك:* ${targetPrice.toLocaleString('ar-EG')} ${currency}`,
    `💥 *مقدار الانخفاض عن المستهدف:* ${dropBelowTarget.toLocaleString('ar-EG')} ${currency}`,
    `💵 *سعرك الحالي بالمتجر:* ${currentMerchantPrice.toLocaleString('ar-EG')} ${currency}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💡 *التوصية الذكية للتسعير (Auto-Repricing):*`,
    `تعديل سعرك إلى *${recommendedPrice.toLocaleString('ar-EG')} ${currency}* لاقتناص الصندوق الذهبي (BuyBox)`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⚡ *تطبيق التعديل التلقائي بنقرة زر:*`,
    `${autoRepriceUrl}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `رادار التاجر الذكي - نظام الإخطار الفوري عبر واتساب 🇪🇬`
  ].filter(Boolean).join('\n');
}

/**
 * Send WhatsApp notification to a single phone
 */
export async function sendWhatsAppMessageToPhone(
  phone: string,
  message: string,
  config: WhatsAppServiceConfig = getWhatsAppServiceConfig()
): Promise<boolean> {
  const normalizedPhone = normalizeWhatsAppNumber(phone);
  if (!normalizedPhone) return false;

  // Mode 1: Meta Cloud API
  if (config.provider === 'cloud_api' && config.cloudApiToken && config.cloudApiPhoneId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${config.cloudApiPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.cloudApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'text',
          text: { body: message },
        }),
      });
      return response.ok;
    } catch (err) {
      console.warn('[WhatsApp Cloud API] Failed to send, falling back to link dispatch:', err);
    }
  }

  // Mode 2: UltraMsg API
  if (config.provider === 'ultramsg' && config.ultramsgInstanceId && config.ultramsgToken) {
    try {
      const response = await fetch(`https://api.ultramsg.com/${config.ultramsgInstanceId}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: config.ultramsgToken,
          to: normalizedPhone,
          body: message,
        }),
      });
      return response.ok;
    } catch (err) {
      console.warn('[WhatsApp UltraMsg API] Failed to send:', err);
    }
  }

  // Fallback: Direct WhatsApp Link / Web URL
  if (typeof window !== 'undefined') {
    const encoded = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  return false;
}

/**
 * Dispatch price drop alert to all active registered WhatsApp numbers
 */
export async function dispatchPriceDropAlertToWhatsApp(params: {
  product: ProductData;
  competitorOffer: MerchantOffer;
  targetPrice: number;
  recommendedPrice?: number;
}): Promise<WhatsAppAlertDispatchResult> {
  const config = getWhatsAppServiceConfig();
  if (!config.isEnabled) {
    return {
      success: false,
      sentCount: 0,
      recipientsSent: [],
      message: 'خدمة واتساب معطلة حالياً في الإعدادات',
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };
  }

  const activeRecipients = config.recipients.filter(r => r.isActive && r.phone);
  if (activeRecipients.length === 0) {
    return {
      success: false,
      sentCount: 0,
      recipientsSent: [],
      message: 'لم يتم العثور على أرقام واتساب مفعلة لاستقبال التنبيهات',
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };
  }

  const messageText = generateCompetitorPriceDropMessage({
    productTitle: params.product.title,
    sku: params.product.sku,
    platformName: params.competitorOffer.platformName,
    competitorName: params.competitorOffer.merchantName,
    competitorNewPrice: params.competitorOffer.price,
    targetPrice: params.targetPrice,
    currentMerchantPrice: params.product.suggestedRetailPrice,
    currency: params.product.currency || 'ج.م',
    productId: params.product.id,
    recommendedPrice: params.recommendedPrice,
  });

  const sentPhones: string[] = [];
  for (const recipient of activeRecipients) {
    try {
      await sendWhatsAppMessageToPhone(recipient.phone, messageText, config);
      sentPhones.push(recipient.phone);
    } catch (err) {
      console.error(`Failed to send alert to ${recipient.phone}:`, err);
    }
  }

  const result: WhatsAppAlertDispatchResult = {
    success: sentPhones.length > 0,
    sentCount: sentPhones.length,
    recipientsSent: sentPhones,
    message: messageText,
    timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
  };

  // Record log in history
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISPATCH_LOGS);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [result, ...existing].slice(0, 30);
    localStorage.setItem(STORAGE_KEY_DISPATCH_LOGS, JSON.stringify(updated));
  } catch {}

  return result;
}

/**
 * Send a quick test alert to verify an individual number
 */
export async function sendTestWhatsAppAlert(
  phone: string,
  recipientName: string = 'التاجر'
): Promise<boolean> {
  const testMessage = [
    `✅ *اختبار اتصال ناجح | رادار التاجر الذكي*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `مرحباً بك يا ${recipientName}،`,
    `تم ربط وتفعيل رقمك (${phone}) بنجاح في نظام تنبيهات هبوط أسعار المنافسين.`,
    `ستصلك إشعارات فورية لحظة قيام أي متجر منافس بخفض سعره عن السعر المستهدف.`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `توقيت الاختبار: ${new Date().toLocaleTimeString('ar-EG')}`,
    `رادار التاجر - حماية الأرباح وتصدر المبيعات 🚀`
  ].join('\n');

  return sendWhatsAppMessageToPhone(phone, testMessage);
}

/**
 * Format Arabic WhatsApp Message when a new customer order is received
 */
export function generateNewOrderWhatsAppMessage(order: CustomerOrder): string {
  const {
    orderNumber,
    customerName,
    customerPhone,
    governorate,
    fullAddress,
    platformSourceName,
    platformSource,
    grandTotalEGP,
    paymentMethod,
    isPaid,
    items,
  } = order;

  const itemsListText = (items || []).map((item, idx) => 
    `   ${idx + 1}. ${item.productTitle} (${item.quantity} قطعتين/قطعة) - ${(item.totalPrice || item.unitPrice * item.quantity).toLocaleString('ar-EG')} ج.م`
  ).join('\n');

  return [
    `🎉 *طلب جديد تم استلامه وتأكيده!* 🎉`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *رقم الطلب:* ${orderNumber || order.id}`,
    `🏬 *المنصة:* ${platformSourceName || platformSource || 'رادار التاجر'}`,
    `👤 *اسم العميل:* ${customerName}`,
    `📞 *رقم الهاتف:* ${customerPhone}`,
    `📍 *المحافظة والعنوان:* ${governorate} - ${fullAddress}`,
    `💰 *إجمالي المبلغ:* ${grandTotalEGP.toLocaleString('ar-EG')} ج.م`,
    `💳 *طريقة الدفع:* ${paymentMethod} (${isPaid ? 'مدفوع إلكترونياً ✓' : 'الدفع عند الاستلام COD'})`,
    `📋 *المنتجات المطلوبة:*`,
    itemsListText || '   - منتج غير محدد',
    `━━━━━━━━━━━━━━━━━━━━`,
    `⚡ تم تسطيل الطلب وإضافته لجدول الشحن والبوالص في رادار التاجر الذكي 🇪🇬`
  ].filter(Boolean).join('\n');
}

/**
 * Dispatch new order WhatsApp alert to all active registered WhatsApp numbers
 */
export async function dispatchNewOrderWhatsAppAlert(order: CustomerOrder): Promise<WhatsAppAlertDispatchResult> {
  const config = getWhatsAppServiceConfig();
  if (!config.isEnabled) {
    return {
      success: false,
      sentCount: 0,
      recipientsSent: [],
      message: 'خدمة واتساب معطلة حالياً في الإعدادات',
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };
  }

  const activeRecipients = config.recipients.filter(r => r.isActive && r.phone);
  if (activeRecipients.length === 0) {
    return {
      success: false,
      sentCount: 0,
      recipientsSent: [],
      message: 'لم يتم العثور على أرقام واتساب مفعلة لاستقبال التنبيهات',
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };
  }

  const messageText = generateNewOrderWhatsAppMessage(order);

  const sentPhones: string[] = [];
  for (const recipient of activeRecipients) {
    try {
      await sendWhatsAppMessageToPhone(recipient.phone, messageText, config);
      sentPhones.push(recipient.phone);
    } catch (err) {
      console.error(`Failed to send new order alert to ${recipient.phone}:`, err);
    }
  }

  const result: WhatsAppAlertDispatchResult = {
    success: sentPhones.length > 0,
    sentCount: sentPhones.length,
    recipientsSent: sentPhones,
    message: messageText,
    timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
  };

  // Record log in history
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISPATCH_LOGS);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [result, ...existing].slice(0, 30);
    localStorage.setItem(STORAGE_KEY_DISPATCH_LOGS, JSON.stringify(updated));
  } catch {}

  return result;
}

/**
 * Schedule automated WhatsApp notification for a new order with optional delay (in minutes)
 */
export function scheduleNewOrderWhatsAppNotification(
  order: CustomerOrder,
  delayMinutes: number = 0
): NodeJS.Timeout {
  const delayMs = Math.max(0, delayMinutes * 60 * 1000);
  return setTimeout(() => {
    dispatchNewOrderWhatsAppAlert(order).catch(err => {
      console.error('Failed to dispatch scheduled WhatsApp order notification:', err);
    });
  }, delayMs);
}

