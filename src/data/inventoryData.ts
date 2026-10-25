import { 
  ProductData, 
  ProductInventoryRecord, 
  InventoryAlertNotification, 
  InventoryStockStatus, 
  ReorderPurchaseOrder,
  WhatsAppSupplierAutomationConfig,
  SupplierProfile,
  SupplierProductQuote
} from '../types';

export const INVENTORY_STORAGE_KEY = 'merchant_radar_inventory_records_v1';
export const REORDER_ORDERS_STORAGE_KEY = 'merchant_radar_reorder_orders_v1';
export const SUPPLIERS_STORAGE_KEY = 'merchant_radar_suppliers_data_v2';
export const SUPPLIER_QUOTES_STORAGE_KEY = 'merchant_radar_supplier_quotes_v1';

export const INITIAL_SUPPLIER_PROFILES: SupplierProfile[] = [];
export const EGYPTIAN_SUPPLIERS: any[] = [];

export function getStoredSuppliers(): SupplierProfile[] {
  try {
    const raw = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredSuppliers(suppliers: SupplierProfile[]): void {
  localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
}

export function getStoredInventory(products: ProductData[]): ProductInventoryRecord[] {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredInventory(records: ProductInventoryRecord[]): void {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(records));
}

export function getStoredReorders(): ReorderPurchaseOrder[] {
  try {
    const raw = localStorage.getItem(REORDER_ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredReorders(orders: ReorderPurchaseOrder[]): void {
  localStorage.setItem(REORDER_ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export function checkInventoryReorderAlerts(inventory: ProductInventoryRecord[], products: ProductData[], config?: any): InventoryAlertNotification[] {
  return [];
}

export function calculateStockStatus(currentStock: number, minReorderLevel: number, maxStockLevel: number = 100): InventoryStockStatus {
  return 'healthy';
}

export function getEffectiveSupplierQuote(productId: string, supplier: SupplierProfile, baseWholesaleCost: number) {
  return { wholesalePrice: baseWholesaleCost, minOrderQuantity: 1, isCustomQuote: false, note: '' };
}

export function getStoredSupplierQuotes(): Record<string, SupplierProductQuote> {
  return {};
}

export function saveStoredSupplierQuote(quote: SupplierProductQuote): void {}

export const EGYPTIAN_WAREHOUSES = [
  'مستودع القاهرة الرئيسي - منطقة العبور',
  'مركز توزيع الجيزة - 6 أكتوبر',
  'مستودع الإسكندرية - برج العرب'
];

export const DEFAULT_WHATSAPP_TEMPLATE = `مرحباً {{supplierName}}،
أود طلب كمية جديدة للمنتج: {{productName}} (SKU: {{sku}}).
الكمية المطلوبة: {{reorderQuantity}} قطعة.
يرجى تأكيد السعر وموعد التوريد.`;

export function getStoredWhatsAppConfig() {
  try {
    const raw = localStorage.getItem('merchant_radar_whatsapp_config');
    return raw ? JSON.parse(raw) : { phone: '', template: DEFAULT_WHATSAPP_TEMPLATE, isEnabled: false };
  } catch {
    return { phone: '', template: DEFAULT_WHATSAPP_TEMPLATE, isEnabled: false };
  }
}

export function saveStoredWhatsAppConfig(config: any): void {
  localStorage.setItem('merchant_radar_whatsapp_config', JSON.stringify(config));
}

export function getStoredWhatsAppLogs(): any[] {
  try {
    const raw = localStorage.getItem('merchant_radar_whatsapp_logs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredWhatsAppLogs(logs: any[]): void {
  localStorage.setItem('merchant_radar_whatsapp_logs', JSON.stringify(logs));
}

export function renderAutomatedWhatsAppMessage(
  itemOrTemplate: any,
  product?: any,
  quantity?: number,
  template?: string
): string {
  let tmpl = typeof itemOrTemplate === 'string' ? itemOrTemplate : (template || DEFAULT_WHATSAPP_TEMPLATE);
  const data = typeof itemOrTemplate === 'object' ? { ...itemOrTemplate, ...product, reorderQuantity: quantity } : (product || {});

  let msg = tmpl || DEFAULT_WHATSAPP_TEMPLATE;
  msg = msg.replace(/{{supplierName}}/g, data?.supplierName || data?.name || 'المورد');
  msg = msg.replace(/{{productName}}/g, data?.productName || data?.title || 'المنتج');
  msg = msg.replace(/{{sku}}/g, data?.sku || data?.productId || data?.id || 'SKU-001');
  msg = msg.replace(/{{reorderQuantity}}/g, String(quantity || data?.reorderQuantity || data?.minReorderQuantity || 10));
  return msg;
}

export function getWhatsAppDeepLink(phone: string, text: string): string {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text || '');
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function createWhatsAppSupplierReorderMessage(record: any, supplierOrProduct?: any, quantity?: number): string {
  return renderAutomatedWhatsAppMessage(DEFAULT_WHATSAPP_TEMPLATE, {
    supplierName: supplierOrProduct?.name || supplierOrProduct?.supplierName || 'المورد',
    productName: record?.productName || record?.title || supplierOrProduct?.title || 'منتج',
    sku: record?.sku || record?.productId || 'SKU-001',
    reorderQuantity: quantity || record?.recommendedReorderQty || record?.reorderQuantity || 20
  });
}

export function exportInventoryToCSV(records: any[], products: any[], currency: string = 'ج.م'): void {
  const headers = ['رقم المنتج', 'اسم المنتج', 'المخزون الحالي', 'الحد الأدنى للطلب', 'الحالة'];
  const rows = records.map(r => [
    r.productId || '',
    r.productName || '',
    r.currentStock || 0,
    r.minReorderLevel || 0,
    r.stockStatus || 'healthy'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `inventory_report_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getDismissedAlertIds(): string[] {
  try {
    const raw = localStorage.getItem('merchant_radar_dismissed_inventory_alerts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDismissedAlertIds(ids: string[]): void {
  localStorage.setItem('merchant_radar_dismissed_inventory_alerts', JSON.stringify(ids));
}

