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

export function checkInventoryReorderAlerts(inventory: ProductInventoryRecord[], products: ProductData[]): InventoryAlertNotification[] {
  return [];
}

export function calculateStockStatus(currentStock: number, minReorderLevel: number, maxStockLevel: number = 100): InventoryStockStatus {
  return 'healthy';
}

export function getEffectiveSupplierQuote(productId: string, supplier: SupplierProfile, baseWholesaleCost: number) {
  return { wholesalePrice: baseWholesaleCost, minOrderQuantity: 1, isCustomQuote: false };
}

export function getStoredSupplierQuotes(): Record<string, SupplierProductQuote> {
  return {};
}

export function saveStoredSupplierQuote(quote: SupplierProductQuote): void {}
