import {
  ProductInventoryRecord,
  ProductData,
  WarehouseSubFolder,
  WarehouseTransferSlip,
  VelocityAnalysisResult
} from '../types';

export const WAREHOUSE_FOLDERS_STORAGE_KEY = 'merchant_radar_warehouse_folders_v1';
export const WAREHOUSE_TRANSFERS_STORAGE_KEY = 'merchant_radar_warehouse_transfers_v1';

/**
 * Pre-configured Egyptian furniture & multi-channel merchant warehouses and branches.
 */
export const DEFAULT_WAREHOUSE_SUBFOLDERS: WarehouseSubFolder[] = [
  {
    id: 'wh-damietta',
    name: 'مخزن دمياط الرئيسي للأخشاب',
    shortCode: 'DMT-01',
    city: 'دمياط الجديدة',
    locationDetails: 'مدينة دمياط للأثاث (شطا - القطاع أ)، هنجر رقم 14',
    managerName: 'م/ إبراهيم الشناوي',
    managerPhone: '+201019823456',
    capacityUnits: 2500,
    colorTheme: 'amber',
    subZones: ['قطاع غرف النوم المودرن', 'قطاع السراير والدواليب', 'منطقة التغليف والتصدير'],
    isPrimary: true,
    createdAt: '2026-01-15',
    notes: 'المخزن الرئيسي لاستلام وتجميع الأخشاب الطبيعية وغرف النوم المصنعة بدمياط'
  },
  {
    id: 'wh-october',
    name: 'مخزن 6 أكتوبر المركزي',
    shortCode: 'OCT-02',
    city: '6 أكتوبر',
    locationDetails: 'المنطقة الصناعية الثالثة - مجمع المخازن اللوجستية',
    managerName: 'أ/ طارق عبد المنعم',
    managerPhone: '+201124567891',
    capacityUnits: 1800,
    colorTheme: 'indigo',
    subZones: ['قطاع الأثاث المكتبي والكراسي', 'قطاع الصالونات والركنات', 'صالة تجهيز طلبات أمازون ونون'],
    isPrimary: false,
    createdAt: '2026-02-01',
    notes: 'مخزن التوزيع المركزي لطلبيات القاهرة الكبرى والشحن السريع لبوابات FBA/Noon'
  },
  {
    id: 'wh-10th-ramadan',
    name: 'مخزن العاشر من رمضان',
    shortCode: 'RAM-03',
    city: 'العاشر من رمضان',
    locationDetails: 'المنطقة الصناعية B2 - بالقرب من مجمع الصناعات المعدنية',
    managerName: 'م/ حسام الديب',
    managerPhone: '+201235678901',
    capacityUnits: 1500,
    colorTheme: 'emerald',
    subZones: ['قطاع المعادن والستيل', 'قطاع المكاتب المودرن', 'منطقة التجميع والتجهيز'],
    isPrimary: false,
    createdAt: '2026-02-20',
    notes: 'مخزن متخصص لتخزين الأثاث المكتبي والمعدني والهياكل الهيدروليكية'
  },
  {
    id: 'wh-cairo-central',
    name: 'مستودع وسط البلد والقاهرة',
    shortCode: 'CAI-04',
    city: 'القاهرة',
    locationDetails: 'مستودعات السبتية وشارع عبد العزيز - وسط البلد',
    managerName: 'أ/ كمال الأزهري',
    managerPhone: '+201098765432',
    capacityUnits: 900,
    colorTheme: 'sky',
    subZones: ['قطاع المعروضات السريعة', 'ممر تسليمات المعارض', 'رفوف قطع الغيار والمفصلات'],
    isPrimary: false,
    createdAt: '2026-03-05',
    notes: 'نقطة تسليم فورية سريعة لخدمة معارض التجزئة والتجار وطلبات اليوم الواحد'
  },
  {
    id: 'wh-alexandria',
    name: 'مستودع سموحة والإسكندرية',
    shortCode: 'ALX-05',
    city: 'الإسكندرية',
    locationDetails: 'المنطقة اللوجستية بجرين بلازا - سموحة',
    managerName: 'أ/ ماجد ناصف',
    managerPhone: '+201198745632',
    capacityUnits: 1200,
    colorTheme: 'purple',
    subZones: ['قطاع الأثاث الساحلي والروتان', 'قطاع المطابخ', 'منطقة الشحن والتسليم الساحلي'],
    isPrimary: false,
    createdAt: '2026-03-12',
    notes: 'مركز التوزيع لطلبيات الإسكندرية والساحل الشمالي والبحيرة'
  }
];

/**
 * Loads warehouse folders from localStorage or provides initial Egyptian defaults.
 */
export function getStoredWarehouseFolders(): WarehouseSubFolder[] {
  try {
    const raw = localStorage.getItem(WAREHOUSE_FOLDERS_STORAGE_KEY);
    if (raw) {
      const parsed: WarehouseSubFolder[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  saveStoredWarehouseFolders(DEFAULT_WAREHOUSE_SUBFOLDERS);
  return DEFAULT_WAREHOUSE_SUBFOLDERS;
}

/**
 * Saves warehouse folders to localStorage.
 */
export function saveStoredWarehouseFolders(folders: WarehouseSubFolder[]): void {
  try {
    localStorage.setItem(WAREHOUSE_FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch {}
}

/**
 * Loads recorded warehouse transfers from localStorage.
 */
export function getStoredWarehouseTransfers(): WarehouseTransferSlip[] {
  try {
    const raw = localStorage.getItem(WAREHOUSE_TRANSFERS_STORAGE_KEY);
    if (raw) {
      const parsed: WarehouseTransferSlip[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

/**
 * Saves warehouse transfers to localStorage.
 */
export function saveStoredWarehouseTransfers(transfers: WarehouseTransferSlip[]): void {
  try {
    localStorage.setItem(WAREHOUSE_TRANSFERS_STORAGE_KEY, JSON.stringify(transfers));
  } catch {}
}

/**
 * Ensures an inventory record has properly initialized warehouse allocations.
 * If not present, distributes currentStock primarily to its assigned warehouse.
 */
export function ensureWarehouseAllocations(
  record: ProductInventoryRecord,
  folders: WarehouseSubFolder[] = DEFAULT_WAREHOUSE_SUBFOLDERS
): Record<string, number> {
  if (record.warehouseAllocations && Object.keys(record.warehouseAllocations).length > 0) {
    return record.warehouseAllocations;
  }

  // Find matching warehouse folder from location string
  const matched = folders.find(f =>
    record.warehouseLocation.includes(f.name) ||
    record.warehouseLocation.includes(f.city) ||
    (f.city === 'دمياط الجديدة' && record.warehouseLocation.includes('دمياط')) ||
    (f.city === '6 أكتوبر' && record.warehouseLocation.includes('أكتوبر'))
  ) || folders[0];

  const allocations: Record<string, number> = {};
  folders.forEach(f => {
    allocations[f.id] = 0;
  });

  const total = Math.max(0, record.currentStock);
  if (total <= 3) {
    allocations[matched.id] = total;
  } else {
    // Distribute realistically: primary holds 65%, secondary holds remaining
    const primaryQty = Math.ceil(total * 0.65);
    const secondaryQty = total - primaryQty;
    const secondaryFolder = folders.find(f => f.id !== matched.id) || folders[1] || matched;

    allocations[matched.id] = primaryQty;
    allocations[secondaryFolder.id] = (allocations[secondaryFolder.id] || 0) + secondaryQty;
  }

  return allocations;
}

/**
 * Proactive Sales Velocity & Economic Order Quantity (EOQ) Analyzer
 * Analyzes burn rate, sales velocity trends, storage holding costs, and calculates
 * the optimal batch reorder quantity to minimize total inventory holding & ordering costs.
 */
export function calculateSalesVelocityAndEOQ(
  record: ProductInventoryRecord,
  product?: ProductData
): VelocityAnalysisResult {
  // 1. Determine Sales Velocity
  const rawVelocity = record.salesVelocityDaily && record.salesVelocityDaily > 0
    ? record.salesVelocityDaily
    : Math.max(0.4, record.dailyBurnRate || 1.2);

  const dailyVelocity = Number(rawVelocity.toFixed(1));
  const weeklyVelocity = Number((dailyVelocity * 7).toFixed(1));
  const monthlyVelocity = Number((dailyVelocity * 30).toFixed(0));

  // Determine trend: based on stock movement / burn rate ratio
  let velocityTrend: 'accelerating' | 'stable' | 'slowing' = 'stable';
  let velocityTrendLabel = 'طلب مستقر ⚖️';
  if (dailyVelocity >= 2.5) {
    velocityTrend = 'accelerating';
    velocityTrendLabel = 'طلب متسارع ومرتفع 🚀';
  } else if (dailyVelocity <= 0.8) {
    velocityTrend = 'slowing';
    velocityTrendLabel = 'طلب هادئ / بطيء 📉';
  }

  // 2. Days until stockout & reorder point
  const daysUntilStockout = dailyVelocity > 0
    ? Math.max(0, Number((record.currentStock / dailyVelocity).toFixed(1)))
    : 99;

  const stockSurplusAboveMin = Math.max(0, record.currentStock - record.minReorderLevel);
  const daysUntilReorderPoint = dailyVelocity > 0
    ? Math.max(0, Number((stockSurplusAboveMin / dailyVelocity).toFixed(1)))
    : 99;

  // 3. Proactive Urgent Stockout Warning:
  // If days until stockout is less than or equal to supplier's lead time (plus 1 buffer day),
  // standard reorder point is ALREADY too late to prevent a stockout!
  const isProactiveUrgent = daysUntilStockout <= (record.leadTimeDays + 1);

  // 4. Economic Order Quantity (EOQ) Calculation:
  // Annual Demand D = dailyVelocity * 365
  const annualDemand = Math.max(10, dailyVelocity * 365);
  // Fixed Procurement / Ordering Cost per purchase order S (transport, admin, loading in EGP)
  const orderSetupCostS = 320;
  // Annual Holding Cost per unit H (cost of warehouse square footage, insurance, depreciation, capital cost ~ 16%)
  const unitCost = Math.max(100, record.costPerUnitEGP || 1000);
  const holdingCostPerUnitAnnualH = Math.max(25, unitCost * 0.16);

  // EOQ Formula: sqrt((2 * D * S) / H)
  const rawEoq = Math.sqrt((2 * annualDemand * orderSetupCostS) / holdingCostPerUnitAnnualH);
  // Round to realistic commercial batch (e.g. multiple of 2 or 5, bounded reasonably)
  let optimalReorderQty = Math.max(4, Math.round(rawEoq));
  // Bound to not exceed maxStockLevel
  if (record.maxStockLevel && optimalReorderQty > record.maxStockLevel * 0.85) {
    optimalReorderQty = Math.max(4, Math.round(record.maxStockLevel * 0.7));
  }

  // 5. Holding Cost vs Ordering Cost comparison
  const currentReorderQty = Math.max(1, record.reorderQuantity || 25);

  // Current annual holding cost = (currentReorderQty / 2) * H
  const holdingCostCurrentAnnualEGP = Math.round((currentReorderQty / 2) * holdingCostPerUnitAnnualH);
  // Optimal annual holding cost = (optimalReorderQty / 2) * H
  const holdingCostOptimalAnnualEGP = Math.round((optimalReorderQty / 2) * holdingCostPerUnitAnnualH);

  // Total current cost = (D / currentReorderQty) * S + (currentReorderQty / 2) * H
  const totalCostCurrent = ((annualDemand / currentReorderQty) * orderSetupCostS) + holdingCostCurrentAnnualEGP;
  // Total optimal cost = (D / optimalReorderQty) * S + (optimalReorderQty / 2) * H
  const totalCostOptimal = ((annualDemand / optimalReorderQty) * orderSetupCostS) + holdingCostOptimalAnnualEGP;

  // Annual savings in holding & procurement costs
  const holdingCostSavingsAnnualEGP = Math.max(0, Math.round(totalCostCurrent - totalCostOptimal));

  // Optimal cycle days between orders
  const cycleDaysOptimal = dailyVelocity > 0
    ? Math.max(4, Math.round(optimalReorderQty / dailyVelocity))
    : 30;

  // Stockout risk date
  const stockoutRiskDateObj = new Date(Date.now() + daysUntilStockout * 86400000);
  const stockoutRiskDate = stockoutRiskDateObj.toLocaleDateString('ar-EG', {
    month: 'numeric',
    day: 'numeric'
  });

  // Recommendation message
  let reorderRecommendation = '';
  if (isProactiveUrgent) {
    reorderRecommendation = `🚨 خطر نفاد استباقي: المخزون يغطي ${daysUntilStockout} يوم فقط بينما يحتاج المورد ${record.leadTimeDays} أيام للتوصيل! اطلب كمية ${optimalReorderQty} قطعة فوراً.`;
  } else if (currentReorderQty > optimalReorderQty * 1.5) {
    reorderRecommendation = `💡 خفّض كمية الطلب الحالية (${currentReorderQty} ق) إلى الكمية المثالية (${optimalReorderQty} ق) لتوفير ${holdingCostSavingsAnnualEGP.toLocaleString()} ج.م سنوياً في تكاليف التخزين ورأس المال المجمد.`;
  } else if (currentReorderQty < optimalReorderQty * 0.7) {
    reorderRecommendation = `📦 زد كمية الطلب إلى (${optimalReorderQty} ق) لتقليل تكرار الشحنات ورسوم النقل وتأمين مخزون يكفي ${cycleDaysOptimal} يوماً.`;
  } else {
    reorderRecommendation = `✅ كمية الطلب الحالية متوازنة مع سرعة البيع وتكلفة التخزين (${optimalReorderQty} ق كل ~${cycleDaysOptimal} يوماً).`;
  }

  return {
    dailyVelocity,
    weeklyVelocity,
    monthlyVelocity,
    velocityTrend,
    velocityTrendLabel,
    daysUntilStockout,
    daysUntilReorderPoint,
    isProactiveUrgent,
    optimalReorderQty,
    currentReorderQty,
    holdingCostCurrentAnnualEGP,
    holdingCostOptimalAnnualEGP,
    holdingCostSavingsAnnualEGP,
    cycleDaysOptimal,
    reorderRecommendation,
    stockoutRiskDate
  };
}
