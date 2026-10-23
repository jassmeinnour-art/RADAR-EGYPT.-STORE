import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Plus,
  RefreshCw,
  MessageCircle,
  Truck,
  Clock,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Warehouse,
  ArrowUpRight,
  Download,
  Bell,
  X,
  Check,
  Search
} from 'lucide-react';
import {
  ProductData,
  ProductInventoryRecord
} from '../types';
import {
  calculateStockStatus,
  renderAutomatedWhatsAppMessage,
  getWhatsAppDeepLink,
  exportInventoryToCSV
} from '../data/inventoryData';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface SmartInventoryAlertsProps {
  products: ProductData[];
  inventory: ProductInventoryRecord[];
  onUpdateInventory: (updated: ProductInventoryRecord[]) => void;
  currency?: string;
  onSelectProduct?: (product: ProductData) => void;
  onOpenFullInventoryTab?: () => void;
  onNavigateToSuppliers?: (product?: ProductData) => void;
  onShowToast?: (message: string) => void;
  defaultCollapsed?: boolean;
}

type AlertSeverityFilter = 'all_alerts' | 'critical' | 'reorder_reached' | 'approaching' | 'all_products';

export const SmartInventoryAlerts: React.FC<SmartInventoryAlertsProps> = ({
  products,
  inventory,
  onUpdateInventory,
  currency = 'ج.م',
  onSelectProduct,
  onOpenFullInventoryTab,
  onNavigateToSuppliers,
  onShowToast,
  defaultCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(!defaultCollapsed);
  const [filterMode, setFilterMode] = useState<AlertSeverityFilter>('all_alerts');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inline Reorder Point (Threshold) Editing State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [draftMinReorderLevel, setDraftMinReorderLevel] = useState<number>(5);
  const [draftReorderQuantity, setDraftReorderQuantity] = useState<number>(20);
  const [draftCurrentStock, setDraftCurrentStock] = useState<number>(10);

  const productMap = useMemo(() => {
    return new Map(products.map(p => [p.id, p]));
  }, [products]);

  // Enrich each inventory record with its product info & reorder alert metrics
  const enrichedRecords = useMemo(() => {
    return inventory.map(record => {
      const product = productMap.get(record.productId);
      const ratioToReorder =
        record.minReorderLevel > 0 ? record.currentStock / record.minReorderLevel : 2;

      const isCriticalStockout = record.currentStock <= 1;
      const isAtOrBelowReorderPoint =
        !isCriticalStockout && record.currentStock <= record.minReorderLevel;
      const isApproachingReorderPoint =
        record.currentStock > record.minReorderLevel &&
        record.currentStock <= Math.ceil(record.minReorderLevel * 1.45);

      const severityLevel: 'critical' | 'reorder' | 'approaching' | 'healthy' = isCriticalStockout
        ? 'critical'
        : isAtOrBelowReorderPoint
        ? 'reorder'
        : isApproachingReorderPoint
        ? 'approaching'
        : 'healthy';

      const stockFillPercent = Math.min(
        100,
        Math.max(
          4,
          Math.round(
            (record.currentStock / Math.max(record.maxStockLevel || record.minReorderLevel * 3, 10)) *
              100
          )
        )
      );

      const reorderMarkerPercent = Math.min(
        92,
        Math.max(
          10,
          Math.round(
            (record.minReorderLevel /
              Math.max(record.maxStockLevel || record.minReorderLevel * 3, 10)) *
              100
          )
        )
      );

      const deficitUnits = Math.max(0, record.minReorderLevel - record.currentStock);
      const estimatedReorderCostEGP = record.reorderQuantity * (record.costPerUnitEGP || 0);

      return {
        record,
        product,
        title: product?.title || `منتج (${record.sku})`,
        imageUrl: product?.imageUrl,
        category: product?.category || 'عام',
        ratioToReorder,
        severityLevel,
        stockFillPercent,
        reorderMarkerPercent,
        deficitUnits,
        estimatedReorderCostEGP
      };
    });
  }, [inventory, productMap]);

  // Summary counts
  const alertStats = useMemo(() => {
    const criticalCount = enrichedRecords.filter(r => r.severityLevel === 'critical').length;
    const reorderReachedCount = enrichedRecords.filter(r => r.severityLevel === 'reorder').length;
    const approachingCount = enrichedRecords.filter(r => r.severityLevel === 'approaching').length;
    const healthyCount = enrichedRecords.filter(r => r.severityLevel === 'healthy').length;
    const totalActionableAlerts = criticalCount + reorderReachedCount + approachingCount;

    const totalReorderBudgetEGP = enrichedRecords
      .filter(r => r.severityLevel === 'critical' || r.severityLevel === 'reorder')
      .reduce((sum, r) => sum + r.estimatedReorderCostEGP, 0);

    return {
      criticalCount,
      reorderReachedCount,
      approachingCount,
      healthyCount,
      totalActionableAlerts,
      totalReorderBudgetEGP
    };
  }, [enrichedRecords]);

  // Filtered list based on selected filterMode & searchQuery
  const displayedAlerts = useMemo(() => {
    return enrichedRecords
      .filter(item => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            item.title.toLowerCase().includes(q) ||
            item.record.sku.toLowerCase().includes(q) ||
            item.record.warehouseLocation.toLowerCase().includes(q) ||
            item.record.supplierName.toLowerCase().includes(q);
          if (!match) return false;
        }

        if (filterMode === 'critical') return item.severityLevel === 'critical';
        if (filterMode === 'reorder_reached')
          return item.severityLevel === 'critical' || item.severityLevel === 'reorder';
        if (filterMode === 'approaching') return item.severityLevel === 'approaching';
        if (filterMode === 'all_alerts') return item.severityLevel !== 'healthy';
        return true; // 'all_products'
      })
      .sort((a, b) => a.ratioToReorder - b.ratioToReorder);
  }, [enrichedRecords, filterMode, searchQuery]);

  // Start editing a product's reorder point & stock inline
  const handleStartEditThreshold = (record: ProductInventoryRecord) => {
    setEditingProductId(record.productId);
    setDraftMinReorderLevel(record.minReorderLevel);
    setDraftReorderQuantity(record.reorderQuantity);
    setDraftCurrentStock(record.currentStock);
  };

  // Save updated Reorder Point & stock level
  const handleSaveThreshold = (productId: string) => {
    const cleanMin = Math.max(1, Number(draftMinReorderLevel) || 5);
    const cleanQty = Math.max(1, Number(draftReorderQuantity) || 20);
    const cleanStock = Math.max(0, Number(draftCurrentStock) || 0);

    const updated = inventory.map(rec => {
      if (rec.productId !== productId) return rec;
      const newStatus = calculateStockStatus(cleanStock, cleanMin, rec.maxStockLevel);
      const newDaysLeft =
        rec.dailyBurnRate > 0 ? Number((cleanStock / rec.dailyBurnRate).toFixed(1)) : 99;
      return {
        ...rec,
        currentStock: cleanStock,
        minReorderLevel: cleanMin,
        reorderQuantity: cleanQty,
        stockStatus: newStatus,
        daysOfSupplyLeft: newDaysLeft,
        totalInventoryValuationEGP: cleanStock * rec.costPerUnitEGP
      };
    });

    onUpdateInventory(updated);
    setEditingProductId(null);
    if (onShowToast) {
      onShowToast(
        `✅ تم تحديث نقطة إعادة الطلب (Reorder Point: ${cleanMin} قطعة) والرصيد (${cleanStock} قطعة) بنجاح!`
      );
    }
  };

  // 1-Click Quick Restock (+Reorder Quantity)
  const handleQuickRestock = (record: ProductInventoryRecord, productTitle: string) => {
    const addedQty = record.reorderQuantity || 20;
    const updated = inventory.map(rec => {
      if (rec.productId !== record.productId) return rec;
      const newStock = rec.currentStock + addedQty;
      const newStatus = calculateStockStatus(newStock, rec.minReorderLevel, rec.maxStockLevel);
      const newDaysLeft =
        rec.dailyBurnRate > 0 ? Number((newStock / rec.dailyBurnRate).toFixed(1)) : 99;
      return {
        ...rec,
        currentStock: newStock,
        stockStatus: newStatus,
        daysOfSupplyLeft: newDaysLeft,
        lastRestockedAt: new Date().toISOString().split('T')[0],
        totalInventoryValuationEGP: newStock * rec.costPerUnitEGP
      };
    });

    onUpdateInventory(updated);
    if (onShowToast) {
      onShowToast(
        `📦 تم تزويد مخزون "${productTitle.slice(0, 28)}..." بـ +${addedQty} قطعة وتحديث حالة الجرد فوراً!`
      );
    }
  };

  // Send WhatsApp Reorder PO to supplier
  const handleWhatsAppSupplierOrder = async (record: ProductInventoryRecord, product?: ProductData) => {
    if (!product) return;
    const msg = renderAutomatedWhatsAppMessage(record, product, record.reorderQuantity);
    const url = getWhatsAppDeepLink(record.supplierPhone, msg);
    
    // Trigger Desktop Notification for background awareness
    try {
      const { notifyWhatsAppAlert } = await import('../services/notificationService');
      notifyWhatsAppAlert(record.supplierName, msg.slice(0, 80) + '...');
    } catch (err) {
      console.warn('Notification service failed:', err);
    }

    safeOpenUrl(url);
    if (onShowToast) {
      onShowToast(`📲 تم فتح أمر التوريد العاجل للمورد "${record.supplierName}" عبر واتساب`);
    }
  };

  return (
    <section
      id="smart-inventory-reorder-alerts-widget"
      className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-sky-500/40 shadow-2xl overflow-hidden transition-all"
      dir="rtl"
    >
      {/* Top Alert Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-800/90 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
              alertStats.criticalCount > 0
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-rose-950/50 animate-pulse'
                : alertStats.totalActionableAlerts > 0
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sky-950/50'
                : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
            }`}
          >
            {alertStats.criticalCount > 0 ? (
              <ShieldAlert className="w-6 h-6" />
            ) : alertStats.totalActionableAlerts > 0 ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                تنبيهات جرد المخزون الذكية ومراقبة نقاط إعادة الطلب (Reorder Points)
              </h3>
              <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[11px] font-black">
                {alertStats.totalActionableAlerts} تنبيه جرد نشط 🔔
              </span>
              {alertStats.criticalCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/25 border border-rose-500/50 text-rose-300 text-[11px] font-black animate-pulse">
                  {alertStats.criticalCount} نفاد وشيك حرج 🚨
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              مراقبة لحظية لأرصدة المستودعات مقارنة بنقطة إعادة الطلب (Reorder Point) لكل منتج لمنع نفاد المخزون وفقدان صندوق الشراء (Buy Box).
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-export-reorder-alerts-csv"
            onClick={() => {
              exportInventoryToCSV(inventory, products, currency);
              if (onShowToast) {
                onShowToast('تم تصدير تقرير جرد المخزون ونقاط إعادة الطلب بصيغة CSV بنجاح 📊');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>تصدير الجرد CSV</span>
          </button>

          {onOpenFullInventoryTab && (
            <button
              type="button"
              id="btn-open-full-inventory-from-widget"
              onClick={onOpenFullInventoryTab}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <Package className="w-3.5 h-3.5" />
              <span>إدارة المستودعات الكاملة</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'طي التنبيهات' : 'عرض التنبيهات'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* 4 Visual Severity KPI Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setFilterMode('critical')}
              className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                filterMode === 'critical'
                  ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/30'
                  : 'bg-slate-900/90 border-rose-500/30 hover:border-rose-500/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-rose-300 mb-1">
                <span>خطر نفاد تام (≤ 1 ق)</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {alertStats.criticalCount} <span className="text-xs font-normal text-rose-300">منتج</span>
              </div>
              <div className="text-[10px] text-rose-300/90 mt-1">يتطلب أمر توريد فوري اليوم</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('reorder_reached')}
              className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                filterMode === 'reorder_reached'
                  ? 'bg-sky-950/70 border-sky-500 ring-2 ring-sky-500/30'
                  : 'bg-slate-900/90 border-sky-500/30 hover:border-sky-500/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-sky-300 mb-1">
                <span>تجاوز نقطة إعادة الطلب</span>
                <AlertTriangle className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {alertStats.criticalCount + alertStats.reorderReachedCount}{' '}
                <span className="text-xs font-normal text-sky-300">منتج</span>
              </div>
              <div className="text-[10px] text-sky-300/90 mt-1">
                الرصيد ≤ حد الطلب (Reorder Point)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('approaching')}
              className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                filterMode === 'approaching'
                  ? 'bg-sky-950/70 border-sky-500 ring-2 ring-sky-500/30'
                  : 'bg-slate-900/90 border-sky-500/30 hover:border-sky-500/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-sky-300 mb-1">
                <span>يقترب من النفاد قريباً</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {alertStats.approachingCount}{' '}
                <span className="text-xs font-normal text-sky-300">منتج</span>
              </div>
              <div className="text-[10px] text-sky-300/90 mt-1">ضمن هامش الأمان التحذيري (45%)</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('all_products')}
              className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                filterMode === 'all_products'
                  ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1">
                <span>تكلفة التوريد المقترحة</span>
                <Package className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black font-mono text-white">
                {alertStats.totalReorderBudgetEGP.toLocaleString()}{' '}
                <span className="text-xs font-normal text-emerald-300">{currency}</span>
              </div>
              <div className="text-[10px] text-emerald-300/90 mt-1">
                الأصناف الآمنة حالياً: {alertStats.healthyCount} منتج ✓
              </div>
            </button>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                {
                  id: 'all_alerts' as const,
                  label: `كافة التنبيهات (${alertStats.totalActionableAlerts})`
                },
                {
                  id: 'critical' as const,
                  label: `نفاد حرج (${alertStats.criticalCount})`
                },
                {
                  id: 'reorder_reached' as const,
                  label: `وصل لنقطة الطلب (${alertStats.criticalCount + alertStats.reorderReachedCount})`
                },
                {
                  id: 'approaching' as const,
                  label: `يقترب من النفاد (${alertStats.approachingCount})`
                },
                {
                  id: 'all_products' as const,
                  label: `كل المنتجات (${enrichedRecords.length})`
                }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterMode === tab.id
                      ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المنتج أو SKU أو المستودع..."
                className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Visual Alert Cards Grid */}
          {displayedAlerts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
              <div className="text-sm font-black text-white">
                لا توجد منتجات ضمن هذا الفلتر تحتاج لإعادة طلب حالياً
              </div>
              <p className="text-xs text-slate-400">
                جميع الأصناف المعروضة فوق نقطة إعادة الطلب المحددة لها. يمكنك عرض كل المنتجات لتعديل نقاط الطلب.
              </p>
              {filterMode !== 'all_products' && (
                <button
                  type="button"
                  onClick={() => setFilterMode('all_products')}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold cursor-pointer"
                >
                  عرض وضبط نقاط إعادة الطلب لجميع المنتجات ({enrichedRecords.length})
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedAlerts.map(item => {
                const { record, product, title, imageUrl, severityLevel } = item;
                const isEditing = editingProductId === record.productId;

                const borderStyle =
                  severityLevel === 'critical'
                    ? 'border-rose-500/70 bg-gradient-to-b from-rose-950/35 to-slate-900'
                    : severityLevel === 'reorder'
                    ? 'border-sky-500/60 bg-gradient-to-b from-sky-950/30 to-slate-900'
                    : severityLevel === 'approaching'
                    ? 'border-sky-500/50 bg-slate-900/95'
                    : 'border-slate-800 bg-slate-900/80';

                const badgeConfig =
                  severityLevel === 'critical'
                    ? {
                        label: '🚨 خطر نفاد فوري',
                        cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }
                    : severityLevel === 'reorder'
                    ? {
                        label: '⚠️ وصل لنقطة إعادة الطلب',
                        cls: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      }
                    : severityLevel === 'approaching'
                    ? {
                        label: '⏳ يقترب من النفاد',
                        cls: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      }
                    : {
                        label: '✅ رصيد آمن',
                        cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      };

                const barColor =
                  severityLevel === 'critical'
                    ? 'bg-rose-500'
                    : severityLevel === 'reorder'
                    ? 'bg-sky-500'
                    : severityLevel === 'approaching'
                    ? 'bg-sky-400'
                    : 'bg-emerald-500';

                return (
                  <div
                    key={record.productId}
                    className={`rounded-2xl border p-4 flex flex-col justify-between gap-3.5 shadow-lg transition-all ${borderStyle}`}
                  >
                    {/* Card Top: Product Image, Title, Status Badge */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={title}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4
                              onClick={() => product && onSelectProduct && onSelectProduct(product)}
                              className="text-xs font-black text-white line-clamp-1 hover:text-sky-300 cursor-pointer"
                              title={title}
                            >
                              {title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>{record.sku}</span>
                              <span>•</span>
                              <span className="truncate">{record.warehouseLocation.split('-')[0]}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black border shrink-0 ${badgeConfig.cls}`}
                        >
                          {badgeConfig.label}
                        </span>
                      </div>

                      {/* Stock vs Reorder Point Visual Meter */}
                      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400 text-[11px]">الرصيد الفعلي: </span>
                            <strong
                              className={`font-mono text-sm font-black ${
                                severityLevel === 'critical'
                                  ? 'text-rose-400'
                                  : severityLevel === 'reorder'
                                  ? 'text-sky-300'
                                  : 'text-white'
                              }`}
                            >
                              {record.currentStock} قطعة
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px]">نقطة إعادة الطلب: </span>
                            <strong className="font-mono text-xs font-black text-sky-400">
                              {record.minReorderLevel} قطع
                            </strong>
                          </div>
                        </div>

                        {/* Progress Bar with Reorder Point Marker */}
                        <div className="relative h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${item.stockFillPercent}%` }}
                          />
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-sky-300 shadow-[0_0_6px_#7dd3fc]"
                            style={{ right: `${item.reorderMarkerPercent}%` }}
                            title={`نقطة إعادة الطلب: ${record.minReorderLevel} قطع`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>
                            يكفي لمدة:{' '}
                            <strong className="text-slate-200 font-mono">
                              {record.daysOfSupplyLeft} يوم
                            </strong>{' '}
                            (السحب: {record.dailyBurnRate}/يوم)
                          </span>
                          <span>
                            التوريد المقترح:{' '}
                            <strong className="text-emerald-400 font-mono">
                              +{record.reorderQuantity} ق
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Inline Reorder Point Editor (when toggled) */}
                      {isEditing && (
                        <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/50 space-y-2.5 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] font-black text-indigo-200">
                            <span>ضبط نقطة إعادة الطلب والرصيد الفعلي</span>
                            <button
                              type="button"
                              onClick={() => setEditingProductId(null)}
                              className="text-slate-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div>
                              <label className="block text-[10px] text-slate-300 mb-1">
                                الرصيد الحالي
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={draftCurrentStock}
                                onChange={(e) => setDraftCurrentStock(Number(e.target.value))}
                                className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-sky-300 mb-1">
                                نقطة الطلب (Min)
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={draftMinReorderLevel}
                                onChange={(e) => setDraftMinReorderLevel(Number(e.target.value))}
                                className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-sky-500/50 text-sky-300 font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-emerald-300 mb-1">
                                كمية التوريد
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={draftReorderQuantity}
                                onChange={(e) => setDraftReorderQuantity(Number(e.target.value))}
                                className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-emerald-500/50 text-emerald-300 font-mono text-xs"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveThreshold(record.productId)}
                            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>حفظ نقطة إعادة الطلب</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickRestock(record, title)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title={`إضافة دفعة توريد سريعة (+${record.reorderQuantity} قطعة)`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>تزويد (+{record.reorderQuantity})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleWhatsAppSupplierOrder(record, product)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title={`إرسال أمر توريد عبر واتساب للمورد: ${record.supplierName}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>طلب من المورد</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isEditing
                            ? setEditingProductId(null)
                            : handleStartEditThreshold(record)
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
                        title="تعديل حد إعادة الطلب (Reorder Point)"
                      >
                        <Sliders className="w-3 h-3 text-sky-400" />
                        <span>حد الطلب</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
