import { ProductData, ProductInventoryRecord } from '../types';

/**
 * Service to simulate Inventory Sync between platforms.
 * In a real scenario, this would call Amazon SP-API and Noon Partner API.
 */
export const syncInventoryAcrossPlatforms = async (
  productId: string,
  quantitySold: number,
  sourcePlatform: string,
  allInventory: ProductInventoryRecord[],
  onUpdateInventory: (updated: ProductInventoryRecord[]) => void
) => {
  console.log(`[InventorySync] Sale detected on ${sourcePlatform}. Product ID: ${productId}, Sold: ${quantitySold}`);

  // 1. Simulate API delay for cross-platform sync
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. Update local state
  const updatedInventory = allInventory.map(item => {
    if (item.productId === productId) {
      return {
        ...item,
        currentStock: Math.max(0, item.currentStock - quantitySold),
        lastUpdated: new Date().toISOString()
      };
    }
    return item;
  });

  // 3. Trigger callback to update UI/Store
  onUpdateInventory(updatedInventory);

  // 4. Log the action (In reality, this would be a backend request)
  console.log(`[InventorySync] Inventory updated successfully across Amazon & Noon for product ${productId}`);
  return { success: true };
};
