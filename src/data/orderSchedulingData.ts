import { CustomerOrder, CourierCompany } from '../types';

export const EGYPTIAN_COURIERS: CourierCompany[] = [
  {
    id: 'bosta_eg',
    name: 'بوسطة للشحن السريع (Bosta Egypt)',
    nameEn: 'Bosta Fast Delivery',
    logo: '🚀',
    trackingPrefix: 'BST-EG-',
    averageDeliveryDays: '24 - 48 ساعة',
    baseDeliveryFeeEGP: 45,
    codFeePercent: 1.5,
    contactNumber: '19058'
  },
  {
    id: 'aramex_eg',
    name: 'أرامكس مصر (Aramex Egypt)',
    nameEn: 'Aramex Express',
    logo: '📦',
    trackingPrefix: 'ARX-CAI-',
    averageDeliveryDays: '24 - 48 ساعة',
    baseDeliveryFeeEGP: 60,
    codFeePercent: 2.0,
    contactNumber: '16996'
  },
  {
    id: 'noon_express_ship',
    name: 'شحن أسطول نون إكسبريس للشركاء',
    nameEn: 'Noon Logistics Partner',
    logo: '🟡',
    trackingPrefix: 'NON-EXP-',
    averageDeliveryDays: 'نفس اليوم / 24 ساعة',
    baseDeliveryFeeEGP: 40,
    codFeePercent: 1.0,
    contactNumber: '16358'
  },
  {
    id: 'egypt_post_express',
    name: 'البريد المصري السريع (Egypt Post Express)',
    nameEn: 'Egypt Post EMS',
    logo: '📮',
    trackingPrefix: 'EMS-EGP-',
    averageDeliveryDays: '48 - 72 ساعة',
    baseDeliveryFeeEGP: 35,
    codFeePercent: 1.0,
    contactNumber: '16789'
  },
  {
    id: 'oto_delivery',
    name: 'أوتو للتوصيل الذكي (OTO Egypt)',
    nameEn: 'OTO Smart Delivery',
    logo: '⚡',
    trackingPrefix: 'OTO-EGY-',
    averageDeliveryDays: '24 ساعة داخل القاهرة الكبرى',
    baseDeliveryFeeEGP: 48,
    codFeePercent: 1.5,
    contactNumber: '19877'
  }
];

// Clean production state: No mock customer orders
export const INITIAL_CUSTOMER_ORDERS: CustomerOrder[] = [];
