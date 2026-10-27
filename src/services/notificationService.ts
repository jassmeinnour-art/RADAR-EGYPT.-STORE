/**
 * Merchant Radar Egypt - Desktop Notification Service
 * Handles browser Notification API permissions and delivery, 
 * including background support via Service Worker.
 */

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    // Dual compatibility for Promise-based and Callback-based Notification.requestPermission()
    return await new Promise<NotificationPermission>((resolve) => {
      const res = Notification.requestPermission((perm) => resolve(perm));
      if (res && typeof res.then === 'function') {
        res.then(resolve).catch(() => resolve(Notification.permission || 'denied'));
      }
    });
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return Notification.permission || 'denied';
  }
};

export const sendDesktopNotification = async (title: string, options: NotificationOptions = {}) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    // If a service worker is active, use it to show the notification (better for background)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        registration.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/favicon.ico',
          dir: 'rtl',
          lang: 'ar',
          ...options,
        });
        return;
      }
    }

    // Fallback to standard window notification
    new Notification(title, options);
  } else {
    console.warn('Notification permission not granted.');
  }
};

/**
 * Triggers an automated pricing alert notification
 */
export const notifyPricingAlert = (productName: string, newPrice: number, currency: string = 'EGP') => {
  sendDesktopNotification('⚡ تنبيه تسعير آلي (رادار التاجر)', {
    body: `هبط سعر "${productName}" إلى ${newPrice} ${currency}. اضغط لتحديث استراتيجية البيع.`,
    tag: `price-alert-${productName}`,
    data: { url: '/radar' }
  });
};

/**
 * Triggers a WhatsApp automation notification
 */
export const notifyWhatsAppAlert = (supplierName: string, messagePreview: string) => {
  sendDesktopNotification('📲 تنبيه واتساب (رادار التاجر)', {
    body: `رسالة جاهزة للمورد "${supplierName}": ${messagePreview}`,
    tag: `whatsapp-alert-${supplierName}`,
    icon: '/pwa-192x192.png'
  });
};
