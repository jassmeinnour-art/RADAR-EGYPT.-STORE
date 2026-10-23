import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  Truck,
  Plus,
  Minus,
  MessageCircle,
  FileText,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  MapPin,
  Building,
  Building2,
  Phone,
  Clock,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Info,
  Zap,
  Scale,
  FolderPlus,
  ArrowLeftRight,
  BarChart3,
  TrendingUp,
  Folder,
  Check,
  User,
  Bell
} from 'lucide-react';
import {
  ProductData,
  ProductInventoryRecord,
  InventoryAlertNotification,
  InventoryStockStatus,
  ReorderPurchaseOrder,
  SupplierProfile,
  WarehouseSubFolder,
  WarehouseTransferSlip,
  VelocityAnalysisResult
} from '../types';
import {
  calculateStockStatus,
  createWhatsAppSupplierReorderMessage,
  exportInventoryToCSV,
  EGYPTIAN_WAREHOUSES,
  saveStoredInventory,
  getStoredReorders,
  saveStoredReorders,
  getStoredSuppliers,
  saveStoredSuppliers,
  checkInventoryReorderAlerts,
  getDismissedAlertIds,
  saveDismissedAlertIds
} from '../data/inventoryData';
import {
  getStoredWarehouseFolders,
  saveStoredWarehouseFolders,
  getStoredWarehouseTransfers,
  saveStoredWarehouseTransfers,
  calculateSalesVelocityAndEOQ,
  ensureWarehouseAllocations
} from '../utils/inventoryVelocityHelper';
import { WhatsAppSupplierAutomationModal } from './WhatsAppSupplierAutomationModal';
import { SupplierDirectoryModal } from './SupplierDirectoryModal';
import { WarehouseFoldersManagerModal } from './WarehouseFoldersManagerModal';
import { WarehouseStockTransferModal } from './WarehouseStockTransferModal';
import { OptimalReorderAdvisorModal } from './OptimalReorderAdvisorModal';
import { ProactiveInventoryAlertsDrawer } from './ProactiveInventoryAlertsDrawer';
import { safeOpenUrl } from '../utils/safeWindowOpen';
import { syncInventoryAcrossPlatforms } from '../services/inventorySyncService';

interface InventoryTrackerProps {
  products: ProductData[];
  inventory: ProductInventoryRecord[];
  onUpdateInventory: (updated: ProductInventoryRecord[]) => void;
  currency?: string;
  onShowToast?: (message: string) => void;
  onSelectProduct?: (product: ProductData) => void;
  onNavigateToWholesale?: (product?: ProductData, query?: string) => void;
  initialFilterStatus?: 'all' | 'reorder_needed' | 'critical' | 'low' | 'healthy';
  onOpenGenerateWaybillModal?: (product: ProductData) => void;
}

export const InventoryTracker: React.FC<InventoryTrackerProps> = ({
  products,
  inventory,
  onUpdateInventory,
  currency = 'EGP',
  onShowToast,
  onSelectProduct,
  onNavigateToWholesale,
  initialFilterStatus = 'all',
  onOpenGenerateWaybillModal
}) => {
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reorder_needed' | 'critical' | 'low' | 'healthy' | 'proactive_urgent' | 'high_holding_cost'>(initialFilterStatus);
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'stock_asc' | 'urgency' | 'value_desc' | 'burn_rate_desc' | 'velocity_desc' | 'savings_desc'>('urgency');

  // Warehouse Sub-Folders (Branches) state
  const [warehouseFolders, setWarehouseFolders] = useState<WarehouseSubFolder[]>(getStoredWarehouseFolders);
  const [selectedWarehouseFolderId, setSelectedWarehouseFolderId] = useState<string>('all');
  const [isFoldersManagerOpen, setIsFoldersManagerOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferProductId, setTransferProductId] = useState<string | undefined>(undefined);

  // Proactive Sales Velocity & Optimal Reorder (EOQ) Advisor Modal state
  const [isVelocityAdvisorOpen, setIsVelocityAdvisorOpen] = useState<boolean>(false);

  // Proactive Alerts Center Drawer state
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(getDismissedAlertIds);

  // Purchase Order (PO) Modal state
  const [isPoModalOpen, setIsPoModalOpen] = useState<boolean>(false);
  const [selectedProductForPo, setSelectedProductForPo] = useState<{
    record: ProductInventoryRecord;
    product: ProductData;
  } | null>(null);
  const [poQuantity, setPoQuantity] = useState<number>(20);
  const [poWarehouse, setPoWarehouse] = useState<string>('');
  const [poNotes, setPoNotes] = useState<string>('');

  // Edit threshold modal state
  const [editingThresholdRecord, setEditingThresholdRecord] = useState<ProductInventoryRecord | null>(null);
  const [tempMinReorderLevel, setTempMinReorderLevel] = useState<number>(5);
  const [tempReorderQty, setTempReorderQty] = useState<number>(25);

  // Quick Restock modal state
  const [quickRestockRecord, setQuickRestockRecord] = useState<ProductInventoryRecord | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // WhatsApp Supplier Automation modal state
  const [isWhatsAppAutomationModalOpen, setIsWhatsAppAutomationModalOpen] = useState<boolean>(false);
  const [selectedProductForWhatsApp, setSelectedProductForWhatsApp] = useState<string | undefined>(undefined);

  // Supplier Directory & Comparison modal state
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>(getStoredSuppliers);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState<boolean>(false);
  const [selectedProductForSupplierModal, setSelectedProductForSupplierModal] = useState<string | undefined>(undefined);
  const [supplierModalTab, setSupplierModalTab] = useState<'directory' | 'comparison' | 'alternative_decision'>('directory');

  // Map products by ID for fast lookup
  const productMap = useMemo(() => {
    return new Map(products.map(p => [p.id, p]));
  }, [products]);

  // Aggregate Proactive Velocity & Holding Cost Savings
  const velocitySummary = useMemo(() => {
    let urgentStockoutRiskCount = 0;
    let totalAnnualHoldingSavings = 0;

    inventory.forEach(item => {
      const prod = productMap.get(item.productId);
      const analysis = calculateSalesVelocityAndEOQ(item, prod);
      if (analysis.isProactiveUrgent) urgentStockoutRiskCount++;
      totalAnnualHoldingSavings += analysis.holdingCostSavingsAnnualEGP;
    });

    return {
      urgentStockoutRiskCount,
      totalAnnualHoldingSavings
    };
  }, [inventory, productMap]);

  // Proactive Alerts generated by sales velocity analysis and optimal reorder calculation
  const activeAlerts = useMemo(() => {
    const generated = checkInventoryReorderAlerts(inventory, products);
    return generated.filter(a => !dismissedAlertIds.includes(a.id));
  }, [inventory, products, dismissedAlertIds]);

  // Handlers for warehouse folders and stock transfers
  const handleSaveWarehouseFolders = (folders: WarehouseSubFolder[]) => {
    setWarehouseFolders(folders);
    saveStoredWarehouseFolders(folders);
  };

  const handleExecuteTransfer = (slip: WarehouseTransferSlip, updatedInventory: ProductInventoryRecord[]) => {
    const existingTransfers = getStoredWarehouseTransfers();
    saveStoredWarehouseTransfers([slip, ...existingTransfers]);
    onUpdateInventory(updatedInventory);
    saveStoredInventory(updatedInventory);
  };

  const handleApplyOptimalReorderQty = (productId: string, optimalQty: number) => {
    const updated = inventory.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          reorderQuantity: optimalQty,
          optimalReorderQuantity: optimalQty
        };
      }
      return item;
    });
    onUpdateInventory(updated);
    saveStoredInventory(updated);
  };

  const handleBatchApplyAllOptimalQty = () => {
    const updated = inventory.map(item => {
      const prod = productMap.get(item.productId);
      const analysis = calculateSalesVelocityAndEOQ(item, prod);
      return {
        ...item,
        reorderQuantity: analysis.optimalReorderQty,
        optimalReorderQuantity: analysis.optimalReorderQty,
        holdingCostSavedEGP: analysis.holdingCostSavingsAnnualEGP
      };
    });
    onUpdateInventory(updated);
    saveStoredInventory(updated);
  };

  // Aggregate Key Performance Indicators
  const kpis = useMemo(() => {
    let totalUnits = 0;
    let totalValuation = 0;
    let reorderNeededCount = 0;
    let criticalStockoutCount = 0;
    let lowStockCount = 0;
    let healthyCount = 0;
    let totalDailyBurn = 0;

    inventory.forEach(item => {
      totalUnits += item.currentStock;
      totalValuation += item.totalInventoryValuationEGP;
      totalDailyBurn += item.dailyBurnRate;

      if (item.currentStock <= item.minReorderLevel) {
        reorderNeededCount++;
      }
      if (item.currentStock <= 1) {
        criticalStockoutCount++;
      } else if (item.currentStock <= item.minReorderLevel) {
        // counted in reorderNeeded
      } else if (item.currentStock <= item.minReorderLevel * 1.5) {
        lowStockCount++;
      } else {
        healthyCount++;
      }
    });

    const avgDaysCover = totalDailyBurn > 0 ? (totalUnits / totalDailyBurn).toFixed(1) : '90+';

    return {
      totalUnits,
      totalValuation,
      reorderNeededCount,
      criticalStockoutCount,
      lowStockCount,
      healthyCount,
      avgDaysCover
    };
  }, [inventory]);

  // Filtered and sorted inventory records
  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => {
        const prod = productMap.get(item.productId);
        const title = prod?.title || '';
        const titleEn = prod?.titleEn || '';
        const brand = prod?.brand || '';

        // Search text matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            item.sku.toLowerCase().includes(q) ||
            (item.barcode && item.barcode.includes(q)) ||
            title.toLowerCase().includes(q) ||
            titleEn.toLowerCase().includes(q) ||
            brand.toLowerCase().includes(q) ||
            item.supplierName.toLowerCase().includes(q) ||
            item.warehouseLocation.toLowerCase().includes(q);

          if (!matches) return false;
        }

        // Warehouse folder sub-branch filter
        if (selectedWarehouseFolderId !== 'all') {
          const allocs = ensureWarehouseAllocations(item, warehouseFolders);
          const inBranch = allocs[selectedWarehouseFolderId] ?? 0;
          if (inBranch <= 0) return false;
        }

        // General warehouse text filter
        if (warehouseFilter !== 'all' && item.warehouseLocation !== warehouseFilter) {
          return false;
        }

        // Status filter
        if (statusFilter === 'reorder_needed') {
          return item.currentStock <= item.minReorderLevel;
        }
        if (statusFilter === 'critical') {
          return item.currentStock <= 1;
        }
        if (statusFilter === 'low') {
          return item.currentStock > item.minReorderLevel && item.currentStock <= item.minReorderLevel * 1.5;
        }
        if (statusFilter === 'healthy') {
          return item.currentStock > item.minReorderLevel * 1.5;
        }
        if (statusFilter === 'proactive_urgent') {
          const analysis = calculateSalesVelocityAndEOQ(item, prod);
          return analysis.isProactiveUrgent;
        }
        if (statusFilter === 'high_holding_cost') {
          const analysis = calculateSalesVelocityAndEOQ(item, prod);
          return analysis.holdingCostSavingsAnnualEGP > 350;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgency') {
          // Most urgent (lowest days of supply or stock/min ratio) first
          const ratioA = a.currentStock / Math.max(a.minReorderLevel, 1);
          const ratioB = b.currentStock / Math.max(b.minReorderLevel, 1);
          return ratioA - ratioB;
        }
        if (sortBy === 'stock_asc') {
          return a.currentStock - b.currentStock;
        }
        if (sortBy === 'value_desc') {
          return b.totalInventoryValuationEGP - a.totalInventoryValuationEGP;
        }
        if (sortBy === 'burn_rate_desc') {
          return b.dailyBurnRate - a.dailyBurnRate;
        }
        if (sortBy === 'velocity_desc') {
          const velA = a.salesVelocityDaily || a.dailyBurnRate || 0;
          const velB = b.salesVelocityDaily || b.dailyBurnRate || 0;
          return velB - velA;
        }
        if (sortBy === 'savings_desc') {
          const aProd = productMap.get(a.productId);
          const bProd = productMap.get(b.productId);
          const savA = calculateSalesVelocityAndEOQ(a, aProd).holdingCostSavingsAnnualEGP;
          const savB = calculateSalesVelocityAndEOQ(b, bProd).holdingCostSavingsAnnualEGP;
          return savB - savA;
        }
        return 0;
      });
  }, [inventory, productMap, searchQuery, selectedWarehouseFolderId, warehouseFolders, warehouseFilter, statusFilter, sortBy]);

  // Handler for modifying stock quantity (+ or - or direct value)
  const handleModifyStock = (productId: string, delta: number) => {
    const updated = inventory.map(item => {
      if (item.productId === productId) {
        const newStock = Math.max(0, item.currentStock + delta);
        const newStatus = calculateStockStatus(newStock, item.minReorderLevel, item.maxStockLevel);
        const newDays = item.dailyBurnRate > 0 ? Number((newStock / item.dailyBurnRate).toFixed(1)) : 99;
        const newRecord: ProductInventoryRecord = {
          ...item,
          currentStock: newStock,
          stockStatus: newStatus,
          daysOfSupplyLeft: newDays,
          totalInventoryValuationEGP: newStock * item.costPerUnitEGP
        };

        // If stock hit or fell below the reorder point, dispatch alert toast
        if (newStock <= item.minReorderLevel) {
          const prod = productMap.get(productId);
          const title = prod?.title ? prod.title.slice(0, 30) + '...' : item.sku;
          if (onShowToast) {
            onShowToast(`⚠️ تنبيه حد الطلب: الصنف "${title}" وصل إلى ${newStock} قطع (الحد الأدنى: ${item.minReorderLevel})! ننصحك بالتوجه فوراً لقسم أسواق الجملة (Wholesale Locations) لإعادة التوريد.`);
          }
        } else if (newStock <= Math.ceil(item.minReorderLevel * 1.25) && delta < 0) {
          const prod = productMap.get(productId);
          const title = prod?.title ? prod.title.slice(0, 30) + '...' : item.sku;
          if (onShowToast) {
            onShowToast(`⚡ تنبيه استباقي: الصنف "${title}" يقترب من حد الطلب (${newStock} ق متبقية). فكر في إعادة التوريد من أسواق الجملة.`);
          }
        } else if (delta > 0 && onShowToast) {
          onShowToast(`✅ تم تحديث المخزون بنجاح: الرصيد الحالي ${newStock} قطعة.`);
        }

        return newRecord;
      }
      return item;
    });

    onUpdateInventory(updated);
    saveStoredInventory(updated);
    if (delta < 0) {
      syncInventoryAcrossPlatforms(productId, Math.abs(delta), 'manual_update', updated, onUpdateInventory);
    }
  };

  // Handler for direct manual stock input
  const handleDirectStockChange = (productId: string, val: number) => {
    const oldItem = inventory.find(i => i.productId === productId);
    const oldStock = oldItem ? oldItem.currentStock : 0;
    const delta = oldStock - val; // Positive if stock decreased (sold)

    const validVal = isNaN(val) ? 0 : Math.max(0, Math.floor(val));
    const updated = inventory.map(item => {
      if (item.productId === productId) {
        const newStatus = calculateStockStatus(validVal, item.minReorderLevel, item.maxStockLevel);
        const newDays = item.dailyBurnRate > 0 ? Number((validVal / item.dailyBurnRate).toFixed(1)) : 99;
        const newRecord: ProductInventoryRecord = {
          ...item,
          currentStock: validVal,
          stockStatus: newStatus,
          daysOfSupplyLeft: newDays,
          totalInventoryValuationEGP: validVal * item.costPerUnitEGP
        };

        if (validVal <= item.minReorderLevel && onShowToast) {
          const prod = productMap.get(productId);
          const title = prod?.title ? prod.title.slice(0, 30) + '...' : item.sku;
          onShowToast(`⚠️ تنبيه حد الطلب: الصنف "${title}" وصل إلى ${validVal} قطع (الحد الأدنى: ${item.minReorderLevel})! يوصى بالتوجه لقسم Wholesale Locations للتوريد.`);
        } else if (validVal <= Math.ceil(item.minReorderLevel * 1.25) && onShowToast) {
          const prod = productMap.get(productId);
          const title = prod?.title ? prod.title.slice(0, 30) + '...' : item.sku;
          onShowToast(`⚡ تنبيه اقتراب من حد الطلب: الصنف "${title}" متبقي منه ${validVal} ق فقط.`);
        }

        return newRecord;
      }
      return item;
    });

    onUpdateInventory(updated);
    saveStoredInventory(updated);
    if (delta > 0) {
      syncInventoryAcrossPlatforms(productId, delta, 'manual_direct_update', updated, onUpdateInventory);
    }
  };

  // Save modified min reorder level and suggested reorder qty
  const handleSaveThreshold = () => {
    if (!editingThresholdRecord) return;
    const updated = inventory.map(item => {
      if (item.productId === editingThresholdRecord.productId) {
        const newMin = Math.max(1, tempMinReorderLevel);
        const newReorderQty = Math.max(1, tempReorderQty);
        const newStatus = calculateStockStatus(item.currentStock, newMin, item.maxStockLevel);
        return {
          ...item,
          minReorderLevel: newMin,
          reorderQuantity: newReorderQty,
          stockStatus: newStatus
        };
      }
      return item;
    });

    onUpdateInventory(updated);
    saveStoredInventory(updated);
    setEditingThresholdRecord(null);

    if (onShowToast) {
      onShowToast(`✅ تم تحديث حد الطلب الأدنى إلى (${tempMinReorderLevel} قطع) وكمية التوريد إلى (${tempReorderQty} قطعة).`);
    }
  };

  // Save quick restock action
  const handleApplyQuickRestock = () => {
    if (!quickRestockRecord) return;
    handleModifyStock(quickRestockRecord.productId, restockAmount);
    setQuickRestockRecord(null);
  };

  // Dispatch live alerts for all products at/below reorder point or facing proactive stockout
  const handleDispatchAllAlerts = () => {
    setIsAlertsDrawerOpen(true);
    if (activeAlerts.length === 0) {
      if (onShowToast) onShowToast('✅ مستويات المخزون لجميع الأصناف آمنة ومستقرة، ولا توجد تنبيهات نشطة حالياً.');
      return;
    }

    const urgentCount = activeAlerts.filter(a => a.severity === 'critical').length;
    if (onShowToast) {
      onShowToast(`🚨 مركز التنبيهات الاستباقية: رصد (${activeAlerts.length}) تنبيهات نشطة (${urgentCount} تنبيهات حرجة واستباقية لسرعة البيع).`);
    }
  };

  // Open PO modal
  const handleOpenPoModal = (item: ProductInventoryRecord) => {
    const prod = productMap.get(item.productId);
    if (!prod) return;
    setSelectedProductForPo({ record: item, product: prod });
    setPoQuantity(item.reorderQuantity || 25);
    setPoWarehouse(item.warehouseLocation);
    setPoNotes('');
    setIsPoModalOpen(true);
  };

  // Submit and confirm PO
  const handleConfirmPurchaseOrder = (sendWhatsApp: boolean = false) => {
    if (!selectedProductForPo) return;
    const { record, product } = selectedProductForPo;
    const qty = Math.max(1, poQuantity);
    const totalCost = qty * record.costPerUnitEGP;

    const newOrder: ReorderPurchaseOrder = {
      id: `po-${Date.now()}`,
      productId: record.productId,
      productTitle: product.title,
      sku: record.sku,
      quantity: qty,
      supplierName: record.supplierName,
      supplierPhone: record.supplierPhone,
      warehouseLocation: poWarehouse || record.warehouseLocation,
      unitCostEGP: record.costPerUnitEGP,
      totalCostEGP: totalCost,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + record.leadTimeDays * 86400000).toISOString().split('T')[0],
      status: 'pending',
      notes: poNotes
    };

    const existingOrders = getStoredReorders();
    saveStoredReorders([newOrder, ...existingOrders]);

    // Update incoming stock on the record
    const updated = inventory.map(item => {
      if (item.productId === record.productId) {
        return {
          ...item,
          incomingStock: (item.incomingStock || 0) + qty
        };
      }
      return item;
    });
    onUpdateInventory(updated);
    saveStoredInventory(updated);

    setIsPoModalOpen(false);

    if (sendWhatsApp) {
      const msg = createWhatsAppSupplierReorderMessage(record, product, qty);
      const cleanPhone = record.supplierPhone.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${msg}`;
      safeOpenUrl(waUrl);
      if (onShowToast) {
        onShowToast(`📦 تم إصدار أمر التوريد (${qty} قطعة) وفتح محادثة واتساب مع المورد: ${record.supplierName}`);
      }
    } else {
      if (onShowToast) {
        onShowToast(`📦 تم إصدار أمر التوريد بنجاح (${qty} قطعة بقيمة ${totalCost.toLocaleString()} ج.م) وتم قيدها كبضاعة واردة.`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="inventory-tracker-container">
      {/* Top Banner & KPI Strip */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/70 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-sky-600" />
                وحدة تتبع مستويات المخزون وحدود الطلب (Inventory Tracker)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                مربوط بالمستودعات المصرية 🇪🇬
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              إدارة المخزون والتنبيه الآلي لنقاط إعادة الطلب
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              متابعة كميات المخزون الفعلي، معدلات الاستهلاك اليومي، وتنبيهات فورية عند وصول المنتجات لحد الطلب الأدنى لمنع فقدان الـ Buy Box وأوامر الشحن.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
            {/* Proactive Velocity & Optimal Reorder (EOQ) Advisor Button */}
            <button
              id="btn-open-velocity-advisor"
              type="button"
              onClick={() => setIsVelocityAdvisorOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 active:scale-98 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm border border-sky-400/40"
              title="نظام استباقي لتحليل سرعة البيع واقتراح كمية إعادة الطلب المثالية لتقليل تكاليف التخزين"
            >
              <Zap className="w-4 h-4 text-sky-200 animate-pulse" />
              <span>محلل سرعة البيع والـ EOQ</span>
              {velocitySummary.urgentStockoutRiskCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-bounce">
                  🚨 {velocitySummary.urgentStockoutRiskCount}
                </span>
              )}
              {velocitySummary.totalAnnualHoldingSavings > 0 && (
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-white/20 text-sky-100 text-[10px] font-bold">
                  وفّر {velocitySummary.totalAnnualHoldingSavings.toLocaleString()} ج.م
                </span>
              )}
            </button>

            {/* Warehouse Sub-Folders Manager Button */}
            <button
              id="btn-open-warehouse-folders"
              type="button"
              onClick={() => setIsFoldersManagerOpen(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 active:scale-98 text-amber-950 text-xs font-bold rounded-xl border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="إنشاء وإدارة مجلدات المخازن والفروع الفرعية (دمياط، أكتوبر، إلخ) وتتبع أرصدتها"
            >
              <FolderPlus className="w-4 h-4 text-amber-700" />
              <span>مجلدات المخازن ({warehouseFolders.length})</span>
            </button>

            {/* Warehouse Stock Transfer Slip Button */}
            <button
              id="btn-open-stock-transfer"
              type="button"
              onClick={() => {
                setTransferProductId(undefined);
                setIsTransferModalOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="مناقلة وتحويل كميات البضاعة بين المخازن الفرعية مع إصدار إذن تحويل مخزني"
            >
              <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
              <span>مناقلة بين المخازن</span>
            </button>

            {/* Multi-Supplier Comparison Table Button */}
            <button
              id="btn-open-supplier-comparison"
              type="button"
              onClick={() => {
                setSupplierModalTab('comparison');
                setSelectedProductForSupplierModal(undefined);
                setIsSupplierModalOpen(true);
              }}
              className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 active:scale-98 text-sky-950 text-xs font-bold rounded-xl border border-sky-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="جدول مقارنة معدل التوريد والأسعار لعدة موردين بالتوازي لنفس المنتج"
            >
              <Scale className="w-4 h-4 text-sky-600" />
              <span>مقارنة الموردين والأسعار ⚖️</span>
            </button>

            {/* Supplier Directory & Lead Time Management */}
            <button
              id="btn-open-supplier-directory"
              type="button"
              onClick={() => {
                setSupplierModalTab('directory');
                setIsSupplierModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 active:scale-98 text-indigo-900 text-xs font-bold rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="إدارة بيانات الموردين (اسم المورد، رقم الواتساب، وقت التوريد المعتاد بالأيام)"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>بيانات الموردين ({suppliers.length})</span>
            </button>

            {/* WhatsApp Supplier Automation Button */}
            <button
              id="btn-open-whatsapp-automation"
              type="button"
              onClick={() => {
                setSelectedProductForWhatsApp(undefined);
                setIsWhatsAppAutomationModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold rounded-xl border border-emerald-600 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="أتمتة إشعارات الواتساب التلقائية للموردين عند وصول حد الطلب الأدنى"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-100 text-white" />
              <span>أتمتة واتساب الموردين</span>
              {kpis.reorderNeededCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-black">
                  {kpis.reorderNeededCount}
                </span>
              )}
            </button>

            {/* Proactive Inventory Alerts Center Drawer Button */}
            <button
              id="btn-trigger-stock-alerts"
              type="button"
              onClick={handleDispatchAllAlerts}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                activeAlerts.some(a => a.severity === 'critical')
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-rose-200 animate-pulse'
                  : activeAlerts.length > 0
                  ? 'bg-sky-600 hover:bg-sky-700 text-white border-sky-600 shadow-sky-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="مركز التنبيهات الاستباقية لمعدلات سرعة البيع (Velocity) وحدود الطلب والـ EOQ"
            >
              <Bell className="w-4 h-4" />
              <span>تنبيهات المخزون ({activeAlerts.length})</span>
              {activeAlerts.some(a => a.alertType === 'proactive_velocity') && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-700 text-[10px] font-black">
                  🚨 سرعة بيع
                </span>
              )}
            </button>

            {/* Export Inventory CSV */}
            <button
              id="btn-export-inventory-csv"
              type="button"
              onClick={() => exportInventoryToCSV(inventory, products)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تصدير كشف المخزون وحدود الطلب إلى ملف CSV متوافق مع Excel"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>تصدير كشف المخزون CSV</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6">
          {/* Total Units */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>إجمالي قطع المخزون</span>
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.totalUnits.toLocaleString()} <span className="text-xs font-medium text-slate-500">قطعة</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              عبر {inventory.length} صنف نشط
            </div>
          </div>

          {/* Reorder Point Alerts (Highest Priority KPI) */}
          <div 
            onClick={() => setStatusFilter('reorder_needed')}
            className={`rounded-xl p-4 border transition-all cursor-pointer ${
              kpis.reorderNeededCount > 0 
                ? 'bg-sky-50/90 border-sky-200/90 text-sky-900 hover:shadow-xs' 
                : 'bg-slate-50/80 border-slate-200/70 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <AlertTriangle className={`w-4 h-4 ${kpis.reorderNeededCount > 0 ? 'text-sky-600 animate-bounce' : 'text-slate-400'}`} />
                عند حد الطلب الأدنى ⚠️
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/70 font-black">فلترة</span>
            </div>
            <div className="text-2xl font-black text-sky-700 tracking-tight">
              {kpis.reorderNeededCount} <span className="text-xs font-medium text-sky-600">أصناف</span>
            </div>
            <div className="text-[11px] text-sky-800 font-semibold mt-1">
              تحتاج أمر توريد عاجل الآن
            </div>
          </div>

          {/* Critical Stockouts */}
          <div 
            onClick={() => setStatusFilter('critical')}
            className={`rounded-xl p-4 border transition-all cursor-pointer ${
              kpis.criticalStockoutCount > 0 
                ? 'bg-rose-50/90 border-rose-200/90 text-rose-900 hover:shadow-xs' 
                : 'bg-slate-50/80 border-slate-200/70 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                نفاد حرج (0-1 قطعة) 🚨
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/70 font-black">فلترة</span>
            </div>
            <div className="text-2xl font-black text-rose-700 tracking-tight">
              {kpis.criticalStockoutCount} <span className="text-xs font-medium text-rose-600">أصناف</span>
            </div>
            <div className="text-[11px] text-rose-700 font-semibold mt-1">
              معرضة لفقدان الترتيب والإيقاف
            </div>
          </div>

          {/* Total Valuation */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>رأس المال بالمخزون</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {kpis.totalValuation.toLocaleString()} <span className="text-xs font-medium text-slate-500">{currency}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              تقييم المخزون بسعر الجملة
            </div>
          </div>

          {/* Avg Days of Cover */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>متوسط أيام التغطية</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.avgDaysCover} <span className="text-xs font-medium text-slate-500">يوم</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              حسب وتيرة السحب والمبيعات
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Alerts Notice Bar (When active reorder items exist) */}
      {kpis.reorderNeededCount > 0 && (
        <div className="bg-linear-to-r from-sky-500 via-sky-600 to-orange-600 rounded-2xl p-4 sm:p-5 text-white shadow-md space-y-3 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  تنبيه تشغيلي عاجل: ({kpis.reorderNeededCount}) أصناف وصلت أو تجاوزت حد الطلب الأدنى!
                </h3>
                <p className="text-xs text-sky-100 mt-0.5">
                  تأخير أمر التوريد قد يتسبب في نفاد المخزون وفقدان ميزة الشحن السريع وحصة صندوق الشراء (Buy Box).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* Trigger WhatsApp Supplier Automation */}
              <button
                id="btn-inventory-notice-whatsapp"
                type="button"
                onClick={() => {
                  setSelectedProductForWhatsApp(undefined);
                  setIsWhatsAppAutomationModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl border border-emerald-400/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-100 text-white" />
                <span>إرسال أوامر التوريد عبر واتساب 📲</span>
              </button>

              <button
                onClick={() => setStatusFilter('reorder_needed')}
                className="px-3.5 py-1.5 bg-white text-sky-900 text-xs font-bold rounded-xl hover:bg-sky-50 transition-colors shadow-2xs cursor-pointer"
              >
                عرض الأصناف المحتاجة ({kpis.reorderNeededCount})
              </button>
              {onNavigateToWholesale && (
                <button
                  id="btn-inventory-notice-wholesale"
                  type="button"
                  onClick={() => {
                    const firstAlert = inventory.find(i => i.currentStock <= i.minReorderLevel);
                    const prod = firstAlert ? productMap.get(firstAlert.productId) : undefined;
                    onNavigateToWholesale(prod, prod?.title);
                  }}
                  className="px-3.5 py-1.5 bg-sky-900/90 hover:bg-black text-white text-xs font-bold rounded-xl border border-sky-300/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-300" />
                  <span>أسواق الجملة 🏢</span>
                </button>
              )}
              <button
                onClick={handleDispatchAllAlerts}
                className="px-3.5 py-1.5 bg-sky-700/80 hover:bg-sky-800 text-white text-xs font-bold rounded-xl border border-sky-400/40 transition-colors cursor-pointer"
              >
                إشعار النظام 🔔
              </button>
            </div>
          </div>

          {/* Smart AI restock suggestion box */}
          <div className="p-3 bg-black/15 backdrop-blur-xs rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-sky-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-300 shrink-0" />
              <span>
                <strong className="text-white font-bold">💡 اقتراح الذكاء الاصطناعي لإعادة التوريد:</strong> توجه فوراً لقسم <strong className="text-white underline">أسواق ومنافذ الجملة (Wholesale Locations)</strong> لمراجعة مستوردي وموزعي شارع عبد العزيز وسنتر البستان وسوق العتبة لتأمين البضاعة بأفضل سعر جملة الجملة وتفادي تجميد المبيعات.
              </span>
            </div>
            {onNavigateToWholesale && (
              <button
                type="button"
                onClick={() => {
                  const firstAlert = inventory.find(i => i.currentStock <= i.minReorderLevel);
                  const prod = firstAlert ? productMap.get(firstAlert.productId) : undefined;
                  onNavigateToWholesale(prod, prod?.title);
                }}
                className="px-3 py-1 bg-white hover:bg-sky-50 text-sky-900 font-black rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs text-[11px]"
              >
                <span>دليل الجملة المصري</span>
                <ArrowRight className="w-3 h-3 text-sky-700" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Proactive Velocity & Holding Cost Savings Alert Banner */}
      {(velocitySummary.urgentStockoutRiskCount > 0 || velocitySummary.totalAnnualHoldingSavings > 0) && (
        <div
          id="banner-proactive-velocity-eoq"
          className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-sky-500/30 space-y-4 animate-fadeIn"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0 text-sky-400 shadow-inner">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-white">
                    نظام التنبيهات الاستباقي لمعدل سرعة البيع (Velocity) وحساب كمية الطلب المثالية (EOQ)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/30 text-sky-200 border border-sky-400/40">
                    تقليل تكاليف التخزين 📉
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  يقوم الذكاء الاقتصادي بحساب متوسط وتيرة السحب اليومية، ومقارنة أيام النفاد المتوقعة بفترة توريد المورد لتفادي النفاد المفاجئ، مع اقتراح <strong>كمية إعادة الطلب المثالية (Economic Order Quantity)</strong> لتوفير تكلفة التخزين ورأس المال المجمد.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                id="btn-banner-open-alerts-drawer"
                type="button"
                onClick={() => setIsAlertsDrawerOpen(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-white" />
                <span>مركز التنبيهات ({activeAlerts.length})</span>
              </button>

              <button
                id="btn-banner-open-eoq-modal"
                type="button"
                onClick={() => setIsVelocityAdvisorOpen(true)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>محلل السرعة والـ EOQ ⚡</span>
              </button>

              <button
                id="btn-banner-apply-all-optimal"
                type="button"
                onClick={() => {
                  handleBatchApplyAllOptimalQty();
                  if (onShowToast) {
                    onShowToast(`🎯 تم تطبيق كميات إعادة الطلب المثالية (EOQ) لجميع الأصناف! وفرت حتى ${velocitySummary.totalAnnualHoldingSavings.toLocaleString()} ج.م من تكاليف التخزين.`);
                  }
                }}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                title="تطبيق كمية الطلب المثالية على جميع المنتجات لتوفير تكاليف التخزين"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تطبيق الكميات المثالية للكل</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar inside Proactive Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>أصناف بطلب متسارع (خطر نفاد استباقي):</span>
              </span>
              <span className={`font-black px-2 py-0.5 rounded-md ${velocitySummary.urgentStockoutRiskCount > 0 ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {velocitySummary.urgentStockoutRiskCount} أصناف
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>وفر تكاليف التخزين السنوية المتاح:</span>
              </span>
              <span className="font-black text-emerald-300">
                {velocitySummary.totalAnnualHoldingSavings.toLocaleString()} {currency}/سنة
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>توازن دورات الطلب المحسوبة:</span>
              </span>
              <span className="font-bold text-sky-200">
                دورة كل 12-25 يوم (تقليل الهدر)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Sub-Folders (مجلدات المخازن والفروع الفرعية) Interactive Navigation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4" id="warehouse-subfolders-navigator">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>تصنيف المخزون والمجلدات الفرعية للمخازن</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {warehouseFolders.length} مخازن فرعية
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                تتبع مستويات المخزون وحركات المناقلة لكل مخزن فرعي على حدة (مخزن دمياط، مخزن أكتوبر، إلخ)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-manage-warehouse-folders"
              type="button"
              onClick={() => setIsFoldersManagerOpen(true)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-700" />
              <span>إدارة وإنشاء المخازن 🏢</span>
            </button>

            <button
              id="btn-warehouse-transfer-shortcut"
              type="button"
              onClick={() => {
                setTransferProductId(undefined);
                setIsTransferModalOpen(true);
              }}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>مناقلة مخزون 🔄</span>
            </button>
          </div>
        </div>

        {/* Warehouse Tabs Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          {/* All Warehouses Tab */}
          <button
            id="tab-warehouse-all"
            type="button"
            onClick={() => setSelectedWarehouseFolderId('all')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              selectedWarehouseFolderId === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>جميع المخازن (الرصيد الإجمالي)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
              {kpis.totalUnits} ق
            </span>
          </button>

          {/* Individual Sub-Warehouse Tabs */}
          {warehouseFolders.map(folder => {
            // Calculate total units in this warehouse
            let folderUnits = 0;
            inventory.forEach(item => {
              const allocs = ensureWarehouseAllocations(item, warehouseFolders);
              folderUnits += allocs[folder.id] ?? 0;
            });
            const isSelected = selectedWarehouseFolderId === folder.id;

            return (
              <button
                key={folder.id}
                id={`tab-warehouse-${folder.id}`}
                type="button"
                onClick={() => setSelectedWarehouseFolderId(folder.id)}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50/70 text-amber-950 hover:bg-amber-100/80 border-amber-200/80'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-600" />
                <span>{folder.name}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isSelected ? 'bg-amber-700 text-white' : 'bg-white text-amber-900 border border-amber-200'}`}>
                  {folder.shortCode}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white text-amber-900' : 'bg-amber-200/80 text-amber-900'}`}>
                  {folderUnits} ق
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Warehouse Details Card (when a specific warehouse folder is selected) */}
        {selectedWarehouseFolderId !== 'all' && (() => {
          const activeFolder = warehouseFolders.find(f => f.id === selectedWarehouseFolderId);
          if (!activeFolder) return null;

          let activeUnits = 0;
          let activeItemsCount = 0;
          inventory.forEach(item => {
            const allocs = ensureWarehouseAllocations(item, warehouseFolders);
            const inBranch = allocs[activeFolder.id] ?? 0;
            if (inBranch > 0) {
              activeUnits += inBranch;
              activeItemsCount++;
            }
          });

          const fillRate = Math.min(100, Math.round((activeUnits / Math.max(1, activeFolder.capacityUnits)) * 100));

          return (
            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/70 text-xs text-amber-950 space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{activeFolder.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-mono text-[10px] font-bold">
                      {activeFolder.shortCode}
                    </span>
                    {activeFolder.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        المخزن الرئيسي
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-[11px] flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>{activeFolder.city} - {activeFolder.locationDetails}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>أمين المخزن: {activeFolder.managerName} ({activeFolder.managerPhone})</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setTransferProductId(undefined);
                      setIsTransferModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
                    <span>مناقلة بضاعة من/إلى هذا المخزن</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFoldersManagerOpen(true)}
                    className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                  >
                    تعديل المخزن
                  </button>
                </div>
              </div>

              {/* Sub-Zones and Capacity Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>نسبة إشغال المستودع:</span>
                    <span className="font-mono text-amber-900">
                      {activeUnits.toLocaleString()} / {activeFolder.capacityUnits.toLocaleString()} قطعة ({fillRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${fillRate}%` }}
                      className={`h-full rounded-full transition-all ${
                        fillRate > 85 ? 'bg-rose-500' : fillRate > 60 ? 'bg-amber-600' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-700">الأقسام والأرفف:</span>
                  {activeFolder.subZones.map((zone, zIdx) => (
                    <span key={zIdx} className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[10px] text-slate-700 font-medium">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            id="tab-filter-all"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            كل المخزون ({inventory.length})
          </button>

          {/* Proactive Urgent Velocity Warning Tab */}
          <button
            id="tab-filter-proactive-urgent"
            onClick={() => setStatusFilter('proactive_urgent')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'proactive_urgent'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-sky-500" />
            <span>خطر نفاد استباقي (سرعة بيع عالية) ({velocitySummary.urgentStockoutRiskCount}) ⚡</span>
          </button>

          {/* High Storage Holding Cost Tab */}
          <button
            id="tab-filter-high-holding-cost"
            onClick={() => setStatusFilter('high_holding_cost')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'high_holding_cost'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-300'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
            <span>فرصة توفير تكاليف التخزين (EOQ) 💡</span>
          </button>

          <button
            id="tab-filter-reorder"
            onClick={() => setStatusFilter('reorder_needed')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'reorder_needed'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/80'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>وصلت لحد الطلب الأدنى ({kpis.reorderNeededCount})</span>
          </button>

          <button
            id="tab-filter-critical"
            onClick={() => setStatusFilter('critical')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>نفاد حرج وشيك ({kpis.criticalStockoutCount})</span>
          </button>

          <button
            id="tab-filter-low"
            onClick={() => setStatusFilter('low')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'low'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
            }`}
          >
            مخزون منخفض ({kpis.lowStockCount})
          </button>

          <button
            id="tab-filter-healthy"
            onClick={() => setStatusFilter('healthy')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'healthy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            مخزون مستقر وصحي ({kpis.healthyCount})
          </button>
        </div>

        {/* Search, Warehouse, and Sort Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المنتج، كود SKU، الباركود، المستودع، أو اسم المورد..."
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Warehouse Selector */}
          <div className="md:col-span-3">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">كل المستودعات العامة</option>
              {EGYPTIAN_WAREHOUSES.map((wh, idx) => (
                <option key={idx} value={wh}>{wh}</option>
              ))}
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="urgency">الأكثر إلحاحاً للتوريد أولاً ⚠️</option>
              <option value="velocity_desc">الأعلى سرعة بيع يومياً (Velocity 🚀)</option>
              <option value="savings_desc">الأعلى توفيراً لتكاليف التخزين (EOQ 💡)</option>
              <option value="stock_asc">الأقل مخزوناً أولاً</option>
              <option value="value_desc">الأعلى قيمة مالية بالمخزون</option>
              <option value="burn_rate_desc">الأعلى سحباً يومياً (معدل الاستهلاك)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Products Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <span>قائمة متابعة الأصناف</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 text-[11px]">
              {filteredInventory.length} من أصل {inventory.length} صنف
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            اضغط على زر <span className="font-bold text-indigo-600">(+)</span> أو <span className="font-bold text-indigo-600">(-)</span> لتعديل الرصيد الفعلي لحظياً
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">لا توجد أصناف تطابق معايير الفلترة</h3>
            <p className="text-xs text-slate-500 mt-1">جرّب مسح البحث أو تغيير فلتر المستودع أو حالة المخزون.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setWarehouseFilter('all');
              }}
              className="mt-3 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-bold border-b border-slate-200/70">
                  <th className="py-3 px-4">المنتج والكود (SKU)</th>
                  <th className="py-3 px-4">المخازن والفروع الفرعية</th>
                  <th className="py-3 px-4 text-center">المخزون الحالي</th>
                  <th className="py-3 px-4">سرعة البيع والتنبؤ (Velocity) ⚡</th>
                  <th className="py-3 px-4 text-center">حد الطلب & كمية الـ EOQ المثالية 💡</th>
                  <th className="py-3 px-4">قيمة المخزون</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInventory.map(item => {
                  const prod = productMap.get(item.productId);
                  const isAtReorder = item.currentStock <= item.minReorderLevel;
                  const isCritical = item.currentStock <= 1;
                  const progressPercent = Math.min(100, Math.round((item.currentStock / Math.max(item.maxStockLevel, 1)) * 100));
                  const thresholdPercent = Math.min(100, Math.round((item.minReorderLevel / Math.max(item.maxStockLevel, 1)) * 100));
                  const velocityAnalysis = calculateSalesVelocityAndEOQ(item, prod);
                  const allocs = ensureWarehouseAllocations(item, warehouseFolders);

                  return (
                    <tr
                      key={item.productId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        velocityAnalysis.isProactiveUrgent
                          ? 'bg-amber-50/40'
                          : isCritical
                          ? 'bg-rose-50/30'
                          : isAtReorder
                          ? 'bg-sky-50/30'
                          : ''
                      }`}
                    >
                      {/* Product Thumbnail & Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={prod?.title || item.sku}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                          <div className="max-w-xs">
                            <div 
                              onClick={() => prod && onSelectProduct && onSelectProduct(prod)}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
                              title={prod?.title}
                            >
                              {prod?.title || item.sku}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {item.sku}
                              </span>
                              {prod?.brand && <span>{prod.brand}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Warehouse Sub-Folders Allocations & Location */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="space-y-1.5 max-w-[220px]">
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span className="truncate" title={item.warehouseLocation}>
                              {item.warehouseLocation.split('-')[0]}
                            </span>
                          </div>

                          {/* Chips for Sub-Warehouse Branch Balances */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {warehouseFolders.map(wh => {
                              const qtyInWh = allocs[wh.id] ?? 0;
                              if (qtyInWh <= 0) return null;
                              return (
                                <span
                                  key={wh.id}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                    wh.id === 'wh-damietta'
                                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                                      : wh.id === 'wh-october'
                                      ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                      : 'bg-slate-50 text-slate-800 border-slate-200'
                                  }`}
                                  title={`${wh.name}: ${qtyInWh} قطعة`}
                                >
                                  <Folder className="w-2.5 h-2.5 opacity-70" />
                                  <span>{wh.shortCode}:</span>
                                  <span className="font-mono font-black">{qtyInWh} ق</span>
                                </span>
                              );
                            })}

                            {/* Quick Transfer Button for this Item */}
                            <button
                              type="button"
                              onClick={() => {
                                setTransferProductId(item.productId);
                                setIsTransferModalOpen(true);
                              }}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-indigo-100 text-indigo-700 border border-slate-200 transition-colors flex items-center gap-0.5 cursor-pointer"
                              title="تحويل ومناقلة هذا الصنف بين المخازن الفرعية"
                            >
                              <ArrowLeftRight className="w-2.5 h-2.5" />
                              <span>مناقلة</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Current Stock with Quick +/- Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`btn-stock-dec-${item.productId}`}
                            type="button"
                            onClick={() => handleModifyStock(item.productId, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-black transition-colors cursor-pointer"
                            title="إنقاص المخزون بمقدار 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={item.currentStock}
                            onChange={(e) => handleDirectStockChange(item.productId, parseInt(e.target.value))}
                            className={`w-14 text-center py-1 px-1 rounded-lg border font-black text-sm transition-colors ${
                              isCritical
                                ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500'
                                : isAtReorder
                                ? 'bg-sky-50 border-sky-300 text-sky-800 focus:ring-sky-500'
                                : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500'
                            }`}
                          />

                          <button
                            id={`btn-stock-inc-${item.productId}`}
                            type="button"
                            onClick={() => handleModifyStock(item.productId, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-black transition-colors cursor-pointer"
                            title="زيادة المخزون بمقدار 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick +10 restock shortcut */}
                          <button
                            type="button"
                            onClick={() => handleModifyStock(item.productId, 10)}
                            className="text-[10px] font-bold px-1.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 transition-colors ml-1 cursor-pointer"
                            title="استلام شحنة سريعة +10 قطع"
                          >
                            +10
                          </button>
                        </div>

                        {item.incomingStock && item.incomingStock > 0 ? (
                          <div className="text-[10px] text-center text-sky-700 font-semibold mt-1 flex items-center justify-center gap-1">
                            <Truck className="w-3 h-3 text-sky-600" />
                            <span>قيد الشحن: {item.incomingStock} ق</span>
                          </div>
                        ) : null}
                      </td>

                      {/* Proactive Sales Velocity & Stockout Risk Analysis */}
                      <td className="py-3.5 px-4">
                        <div className="w-40 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-sky-500" />
                              <span>{velocityAnalysis.dailyVelocity} ق/يوم</span>
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                velocityAnalysis.velocityTrend === 'accelerating'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : velocityAnalysis.velocityTrend === 'slowing'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {velocityAnalysis.velocityTrendLabel}
                            </span>
                          </div>

                          {/* Days until stockout with proactive warning */}
                          <div className="text-[11px]">
                            {velocityAnalysis.isProactiveUrgent ? (
                              <div className="flex items-center gap-1 text-rose-700 font-black animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>ينفد بـ {velocityAnalysis.daysUntilStockout} يوم (قبل التوريد {item.leadTimeDays} أيام!)</span>
                              </div>
                            ) : (
                              <div className="text-slate-500 text-[10px] flex items-center justify-between">
                                <span>يكفي حتى {velocityAnalysis.stockoutRiskDate}</span>
                                <span className="font-bold text-slate-700">{velocityAnalysis.daysUntilStockout} يوم</span>
                              </div>
                            )}
                          </div>

                          <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              style={{ width: `${Math.min(100, (velocityAnalysis.dailyVelocity / 4) * 100)}%` }}
                              className={`h-full rounded-full ${
                                velocityAnalysis.velocityTrend === 'accelerating' ? 'bg-rose-500' : 'bg-sky-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Min Reorder Level & Optimal Reorder Quantity (EOQ) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {/* Min Reorder Threshold button */}
                          <button
                            onClick={() => {
                              setEditingThresholdRecord(item);
                              setTempMinReorderLevel(item.minReorderLevel);
                              setTempReorderQty(item.reorderQuantity);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="حد الطلب الأدنى الحالي"
                          >
                            <span>حد الطلب: {item.minReorderLevel} ق</span>
                            <Sliders className="w-3 h-3 text-slate-400" />
                          </button>

                          {/* Suggested Optimal Reorder Quantity (EOQ) */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                              الـ EOQ المثالي: <strong>{velocityAnalysis.optimalReorderQty} ق</strong>
                            </span>
                            {item.reorderQuantity !== velocityAnalysis.optimalReorderQty && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleApplyOptimalReorderQty(item.productId, velocityAnalysis.optimalReorderQty);
                                  if (onShowToast) {
                                    onShowToast(`🎯 تم ضبط كمية إعادة الطلب المثالية لـ "${prod?.title?.slice(0, 30) || item.sku}" إلى ${velocityAnalysis.optimalReorderQty} قطعة!`);
                                  }
                                }}
                                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                                title="تطبيق هذه الكمية فوراً لتقليل تكاليف التخزين"
                              >
                                تطبيق
                              </button>
                            )}
                          </div>

                          {/* Holding Cost Savings indicator */}
                          {velocityAnalysis.holdingCostSavingsAnnualEGP > 0 && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                              <span>وفّر {velocityAnalysis.holdingCostSavingsAnnualEGP.toLocaleString()} ج.م/سنة</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Inventory Valuation */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <div className="font-bold text-slate-900">
                          {item.totalInventoryValuationEGP.toLocaleString()} {currency}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.costPerUnitEGP.toLocaleString()} ج.م / ق
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            نفاد حرج 🚨
                          </span>
                        ) : isAtReorder ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                            <AlertTriangle className="w-3 h-3 text-sky-600" />
                            حد الطلب ⚠️
                          </span>
                        ) : item.stockStatus === 'low_stock' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            منخفض ⚡
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            مستقر ✅
                          </span>
                        )}
                      </td>

                      {/* Actions (Reorder PO / WhatsApp / Wholesale / Transfer) */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                          {/* Warehouse Transfer Slip Shortcut */}
                          <button
                            id={`btn-transfer-${item.productId}`}
                            type="button"
                            onClick={() => {
                              setTransferProductId(item.productId);
                              setIsTransferModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 transition-all cursor-pointer"
                            title="مناقلة وتحويل كمية من هذا الصنف بين المخازن الفرعية 🔄"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
                          </button>

                          {/* Generate Waybill & Order Fulfillment Button */}
                          {onOpenGenerateWaybillModal && prod && (
                            <button
                              id={`btn-generate-waybill-${item.productId}`}
                              type="button"
                              onClick={() => onOpenGenerateWaybillModal(prod)}
                              className="px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm border border-emerald-500/50 active:scale-95 shrink-0"
                              title="توليد بوليصة شحن فورية لهذا المنتج وجدولتها وربطها بالمخزون 🚚"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>توليد بوليصة</span>
                            </button>
                          )}

                          {/* Quick Wholesale Suggestion Button when at or near reorder point */}
                          {onNavigateToWholesale && (isAtReorder || isCritical) && (
                            <button
                              id={`btn-row-wholesale-${item.productId}`}
                              type="button"
                              onClick={() => {
                                if (prod && onSelectProduct) onSelectProduct(prod);
                                onNavigateToWholesale(prod, prod?.title);
                              }}
                              className="px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300 shadow-2xs shrink-0"
                              title="اقتراح تلقائي: التوجه لأسواق ومنافذ الجملة المصرية (شارع عبد العزيز / البستان / العتبة) لتوريد هذا الصنف فوراً"
                            >
                              <Building2 className="w-3.5 h-3.5 text-sky-800" />
                              <span className="hidden sm:inline">أسواق الجملة</span>
                              <span className="sm:hidden">جملة</span>
                            </button>
                          )}

                          {/* Reorder PO Button */}
                          <button
                            id={`btn-reorder-po-${item.productId}`}
                            onClick={() => handleOpenPoModal(item)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              isAtReorder
                                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80'
                            }`}
                            title="إصدار أمر توريد بضاعة للمخزن"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>أمر توريد</span>
                          </button>

                          {/* Multi-Supplier Comparison Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductForSupplierModal(item.productId);
                              setSupplierModalTab('comparison');
                              setIsSupplierModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl border border-sky-300 bg-sky-50/80 hover:bg-sky-100 text-sky-800 transition-all cursor-pointer"
                            title="جدول مقارنة معدل التوريد والأسعار لعدة موردين لهذا الصنف ⚖️"
                          >
                            <Scale className="w-3.5 h-3.5 text-sky-700" />
                          </button>

                          {/* Alternative Supplier Decision Helper Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductForSupplierModal(item.productId);
                              setSupplierModalTab('alternative_decision');
                              setIsSupplierModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 transition-all cursor-pointer"
                            title="مقارنة واختيار مورد بديل أسرع بناءً على معدل التوريد ⚡"
                          >
                            <Zap className="w-3.5 h-3.5 text-indigo-600" />
                          </button>

                          {/* Quick WhatsApp Supplier Automation Trigger */}
                          <button
                            id={`btn-whatsapp-supplier-${item.productId}`}
                            onClick={() => {
                              setSelectedProductForWhatsApp(item.productId);
                              setIsWhatsAppAutomationModalOpen(true);
                            }}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                              isAtReorder
                                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-95'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title="أتمتة وإرسال أمر التوريد عبر واتساب للمورد"
                          >
                            <MessageCircle className={`w-4 h-4 ${isAtReorder ? 'fill-emerald-100 text-white' : 'text-emerald-600'}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* Modal 1: Reorder Purchase Order (أمر توريد جديد) */}
      {/* ========================================================= */}
      {isPoModalOpen && selectedProductForPo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">إصدار أمر توريد بضاعة (Reorder PO)</h3>
                  <p className="text-xs text-slate-500">تأكيد طلب التوريد للمستودع وإشعار المورد</p>
                </div>
              </div>
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* Product Info Strip */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3">
                <img
                  src={selectedProductForPo.product.imageUrl}
                  alt={selectedProductForPo.product.title}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                    {selectedProductForPo.product.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>الكود: <strong className="font-mono text-slate-700">{selectedProductForPo.record.sku}</strong></span>
                    <span>•</span>
                    <span>الرصيد الحالي: <strong className="text-sky-700">{selectedProductForPo.record.currentStock} قطعة</strong></span>
                  </div>
                </div>
              </div>

              {/* Quantity Input with Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الكمية المطلوبة للتوريد (قطع)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {[10, 25, 50, 100].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setPoQuantity(qty)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          poQuantity === qty
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warehouse Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  وجهة التسليم (المستودع)
                </label>
                <select
                  value={poWarehouse}
                  onChange={(e) => setPoWarehouse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {EGYPTIAN_WAREHOUSES.map((wh, idx) => (
                    <option key={idx} value={wh}>{wh}</option>
                  ))}
                </select>
              </div>

              {/* Cost Calculation Summary */}
              <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-800 font-bold block">إجمالي تكلفة أمر التوريد:</span>
                  <span className="text-emerald-600 text-[11px]">
                    سعر الجملة: {selectedProductForPo.record.costPerUnitEGP.toLocaleString()} {currency} × {poQuantity} قطعة
                  </span>
                </div>
                <div className="text-lg font-black text-emerald-800">
                  {(poQuantity * selectedProductForPo.record.costPerUnitEGP).toLocaleString()} {currency}
                </div>
              </div>

              {/* Supplier Selection & Details Box */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>المورد المعتمد لأمر التوريد:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSupplierModalOpen(true)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    إدارة بيانات الموردين ⚙️
                  </button>
                </div>

                <select
                  value={selectedProductForPo.record.supplierName}
                  onChange={(e) => {
                    const supp = suppliers.find(s => s.name === e.target.value);
                    if (supp) {
                      setSelectedProductForPo(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          record: {
                            ...prev.record,
                            supplierName: supp.name,
                            supplierPhone: supp.phone,
                            leadTimeDays: supp.leadTimeDays,
                            warehouseLocation: supp.warehouseLocation || prev.record.warehouseLocation
                          }
                        };
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-xs"
                >
                  {suppliers.map(s => {
                    const avg = s.averageDeliveryDays ?? s.leadTimeDays ?? 2;
                    return (
                      <option key={s.id} value={s.name}>
                        {s.name} • ⏱️ معدل التوريد: {avg} يوم • 📱 {s.phone}
                      </option>
                    );
                  })}
                </select>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">معدل التوريد الفعلي:</span>
                    <span className="font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      ⏱️ {selectedProductForPo.record.leadTimeDays} أيام للتوصيل
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">واتساب المورد:</span>
                    <span className="font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md" dir="ltr">
                      {selectedProductForPo.record.supplierPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPoModalOpen(false);
                      setSelectedProductForSupplierModal(selectedProductForPo.record.productId);
                      setIsSupplierModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-sky-500" />
                    <span>مقارنة واختيار مورد بديل أسرع لهذا الصنف ⚡</span>
                  </button>
                </div>
              </div>

              {/* Wholesale Locations suggestion in PO modal */}
              {onNavigateToWholesale && (
                <div className="bg-sky-50/90 rounded-xl p-3 border border-sky-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-sky-900">
                    <Building2 className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>
                      هل تبحث عن بدائل توريد أو مقارنة أسعار موزعي الجملة في مصر (شارع عبد العزيز / البستان / العتبة)؟
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPoModalOpen(false);
                      onNavigateToWholesale(selectedProductForPo.product, selectedProductForPo.product.title);
                    }}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>استعراض أسواق الجملة</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPoModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={() => handleConfirmPurchaseOrder(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                تأكيد وقيد أمر التوريد 📦
              </button>

              <button
                type="button"
                onClick={() => handleConfirmPurchaseOrder(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال عبر واتساب للمورد</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal 2: Edit Min Reorder Threshold (تعديل حد الطلب) */}
      {/* ========================================================= */}
      {editingThresholdRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">ضبط حد الطلب الأدنى ونقطة التنبيه</h3>
              </div>
              <button
                onClick={() => setEditingThresholdRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <p className="text-slate-600">
                عند وصول رصيد المخزون الفعلي إلى هذه القيمة أو أقل، سيقوم النظام تلقائياً بإطلاق إشعار تنبيهي فوري لك لإصدار أمر توريد.
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  حد الطلب الأدنى (قطع):
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={tempMinReorderLevel}
                  onChange={(e) => setTempMinReorderLevel(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  الرصيد الحالي: {editingThresholdRecord.currentStock} قطعة
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  كمية التوريد المقترحة تلقائياً (قطع):
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={tempReorderQty}
                  onChange={(e) => setTempReorderQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingThresholdRecord(null)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveThreshold}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Supplier Automation Modal */}
      {isWhatsAppAutomationModalOpen && (
        <WhatsAppSupplierAutomationModal
          isOpen={isWhatsAppAutomationModalOpen}
          onClose={() => setIsWhatsAppAutomationModalOpen(false)}
          inventory={inventory}
          products={products}
          onUpdateInventory={onUpdateInventory}
          onShowToast={onShowToast}
          preselectedProductId={selectedProductForWhatsApp}
          onOpenSupplierDirectory={(productId) => {
            setSelectedProductForSupplierModal(productId);
            setIsSupplierModalOpen(true);
          }}
        />
      )}

      {/* Supplier Directory & Management Modal */}
      {isSupplierModalOpen && (
        <SupplierDirectoryModal
          isOpen={isSupplierModalOpen}
          onClose={() => {
            setIsSupplierModalOpen(false);
            setSelectedProductForSupplierModal(undefined);
          }}
          suppliers={suppliers}
          onUpdateSuppliers={setSuppliers}
          inventory={inventory}
          onUpdateInventory={onUpdateInventory}
          products={products}
          onShowToast={onShowToast}
          initialSelectedProductId={selectedProductForSupplierModal}
          initialTab={supplierModalTab}
          onOpenWhatsAppAutomation={(productId) => {
            setSelectedProductForWhatsApp(productId);
            setIsWhatsAppAutomationModalOpen(true);
          }}
        />
      )}

      {/* Proactive Velocity & Optimal Reorder (EOQ) Advisor Modal */}
      {isVelocityAdvisorOpen && (
        <OptimalReorderAdvisorModal
          isOpen={isVelocityAdvisorOpen}
          onClose={() => setIsVelocityAdvisorOpen(false)}
          products={products}
          inventory={inventory}
          onApplyOptimalReorderQty={handleApplyOptimalReorderQty}
          onBatchApplyAllOptimalQty={handleBatchApplyAllOptimalQty}
          currency={currency}
          onShowToast={onShowToast}
        />
      )}

      {/* Warehouse Sub-Folders (Branches) Manager Modal */}
      {isFoldersManagerOpen && (
        <WarehouseFoldersManagerModal
          isOpen={isFoldersManagerOpen}
          onClose={() => setIsFoldersManagerOpen(false)}
          warehouseFolders={warehouseFolders}
          onSaveWarehouseFolders={handleSaveWarehouseFolders}
          inventory={inventory}
          onShowToast={onShowToast}
        />
      )}

      {/* Warehouse Stock Transfer Slip Modal */}
      {isTransferModalOpen && (
        <WarehouseStockTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setTransferProductId(undefined);
          }}
          products={products}
          inventory={inventory}
          warehouseFolders={warehouseFolders}
          preSelectedProductId={transferProductId}
          onExecuteTransfer={handleExecuteTransfer}
          onShowToast={onShowToast}
        />
      )}

      {/* Proactive Inventory Alerts Center Drawer */}
      {isAlertsDrawerOpen && (
        <ProactiveInventoryAlertsDrawer
          isOpen={isAlertsDrawerOpen}
          onClose={() => setIsAlertsDrawerOpen(false)}
          alerts={activeAlerts}
          inventory={inventory}
          products={products}
          onApplyOptimalQty={handleApplyOptimalReorderQty}
          onBatchApplyAllOptimalQty={handleBatchApplyAllOptimalQty}
          onOpenPoModal={handleOpenPoModal}
          onOpenTransferModal={(prodId) => {
            setTransferProductId(prodId);
            setIsTransferModalOpen(true);
          }}
          onDismissAlert={(id) => {
            const updated = [...dismissedAlertIds, id];
            setDismissedAlertIds(updated);
            saveDismissedAlertIds(updated);
          }}
          onClearAllAlerts={() => {
            const allIds = activeAlerts.map(a => a.id);
            const updated = [...dismissedAlertIds, ...allIds];
            setDismissedAlertIds(updated);
            saveDismissedAlertIds(updated);
          }}
          currency={currency}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
