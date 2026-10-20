import React, { useState, useMemo } from 'react';
import {
  Building2,
  Clock,
  MapPin,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Check,
  Edit3,
  Star,
  DollarSign,
  Package,
  Layers,
  Send,
  Share2,
  Download,
  Info,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';
import {
  SupplierProfile,
  ProductInventoryRecord,
  ProductData,
  SupplierProductQuote
} from '../types';
import {
  getEffectiveSupplierQuote,
  saveStoredSupplierQuote,
  saveStoredInventory
} from '../data/inventoryData';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface MultiSupplierComparisonTableProps {
  suppliers: SupplierProfile[];
  inventory: ProductInventoryRecord[];
  products: ProductData[];
  onUpdateInventory: (updated: ProductInventoryRecord[]) => void;
  currency?: string;
  onShowToast?: (message: string) => void;
  initialProductId?: string;
  onOpenWhatsAppAutomation?: (productId?: string) => void;
}

type SortField = 'delivery_rate' | 'price' | 'profit_margin' | 'reliability' | 'composite_score';
type SortOrder = 'asc' | 'desc';

export const MultiSupplierComparisonTable: React.FC<MultiSupplierComparisonTableProps> = ({
  suppliers,
  inventory,
  products,
  onUpdateInventory,
  currency = 'ج.م',
  onShowToast,
  initialProductId,
  onOpenWhatsAppAutomation
}) => {
  // Product Map for rapid lookup
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  // Selected Product State
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    if (initialProductId && productMap.has(initialProductId)) return initialProductId;
    if (inventory.length > 0) return inventory[0].productId;
    if (products.length > 0) return products[0].id;
    return '';
  });

  // Active product details
  const activeProduct = useMemo(() => {
    return productMap.get(selectedProductId) || products[0];
  }, [productMap, selectedProductId, products]);

  // Inventory record of the active product
  const activeInventoryRecord = useMemo(() => {
    return inventory.find(i => i.productId === selectedProductId);
  }, [inventory, selectedProductId]);

  // Target Selling Price (Buy Box or current lowest retail price or suggested price)
  const sellingPrice = useMemo(() => {
    if (!activeProduct) return 1500;
    return (
      activeProduct.currentLowestPrice ||
      activeProduct.suggestedRetailPrice ||
      (activeProduct.estimatedWholesaleCost ? Math.round(activeProduct.estimatedWholesaleCost * 1.35) : 1000)
    );
  }, [activeProduct]);

  // Base wholesale reference cost
  const baseWholesaleCost = useMemo(() => {
    if (activeInventoryRecord?.costPerUnitEGP) return activeInventoryRecord.costPerUnitEGP;
    if (activeProduct?.estimatedWholesaleCost) return activeProduct.estimatedWholesaleCost;
    return Math.round(sellingPrice * 0.7);
  }, [activeInventoryRecord, activeProduct, sellingPrice]);

  // Simulated Order Quantity (defaults to reorder quantity or 25 units)
  const [orderQuantity, setOrderQuantity] = useState<number>(() => {
    return activeInventoryRecord?.reorderQuantity || 25;
  });

  // Checkbox Selection for Multi-Supplier Comparison (defaults to all suppliers selected)
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(() => {
    return suppliers.map(s => s.id);
  });

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('composite_score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter criteria
  const [maxDeliveryDaysFilter, setMaxDeliveryDaysFilter] = useState<number>(0); // 0 means all
  const [minReliabilityFilter, setMinReliabilityFilter] = useState<number>(0);

  // Editing Supplier Quote Modal / Inline State
  const [editingSupplier, setEditingSupplier] = useState<{
    supplierId: string;
    supplierName: string;
    currentPrice: number;
    minOrder: number;
    note: string;
  } | null>(null);

  // Quote Refresh Trigger to recompute derived quotes on edit
  const [quoteVersion, setQuoteVersion] = useState<number>(0);

  // Derived Comparison Rows for all selected suppliers on the current product
  const comparisonRows = useMemo(() => {
    if (!activeProduct) return [];

    return suppliers.map(supp => {
      const quote = getEffectiveSupplierQuote(activeProduct.id, supp, baseWholesaleCost);
      const wholesalePrice = quote.wholesalePrice;
      const deliveryDays = supp.averageDeliveryDays ?? supp.leadTimeDays ?? 2.5;
      const reliability = supp.deliveryReliability ?? 90;

      const totalBatchCost = wholesalePrice * orderQuantity;
      const profitPerUnit = Math.max(0, sellingPrice - wholesalePrice);
      const profitMarginPercent = sellingPrice > 0 ? Math.round((profitPerUnit / sellingPrice) * 100) : 0;
      const totalBatchProfit = profitPerUnit * orderQuantity;

      const isCurrentAssigned =
        activeInventoryRecord?.supplierName === supp.name ||
        activeInventoryRecord?.supplierPhone === supp.phone;

      return {
        supplier: supp,
        quote,
        wholesalePrice,
        deliveryDays,
        reliability,
        totalBatchCost,
        profitPerUnit,
        profitMarginPercent,
        totalBatchProfit,
        isCurrentAssigned,
        isIncluded: selectedSupplierIds.includes(supp.id)
      };
    });
  }, [
    activeProduct,
    suppliers,
    baseWholesaleCost,
    orderQuantity,
    sellingPrice,
    activeInventoryRecord,
    selectedSupplierIds,
    quoteVersion
  ]);

  // Find min/max values for benchmarking
  const benchmarks = useMemo(() => {
    const included = comparisonRows.filter(r => r.isIncluded);
    if (included.length === 0) {
      return {
        lowestPrice: baseWholesaleCost,
        fastestDays: 1.0,
        highestMargin: 30,
        highestReliability: 95
      };
    }

    return {
      lowestPrice: Math.min(...included.map(r => r.wholesalePrice)),
      fastestDays: Math.min(...included.map(r => r.deliveryDays)),
      highestMargin: Math.max(...included.map(r => r.profitMarginPercent)),
      highestReliability: Math.max(...included.map(r => r.reliability))
    };
  }, [comparisonRows, baseWholesaleCost]);

  // Enriched rows with comparative deltas and smart composite value score
  const enrichedRows = useMemo(() => {
    return comparisonRows.map(row => {
      // Delta from lowest price
      const priceDiffFromLowest = row.wholesalePrice - benchmarks.lowestPrice;
      const pricePercentDiff = benchmarks.lowestPrice > 0
        ? Math.round((priceDiffFromLowest / benchmarks.lowestPrice) * 100)
        : 0;

      // Delta from fastest delivery
      const daysDiffFromFastest = parseFloat((row.deliveryDays - benchmarks.fastestDays).toFixed(1));

      // Composite Value Score (0 - 100)
      // Weight: 45% price competitiveness, 35% delivery speed, 20% reliability
      const priceScore = Math.max(0, 100 - pricePercentDiff * 4);
      const speedScore = Math.max(0, 100 - daysDiffFromFastest * 20);
      const reliabilityScore = row.reliability;
      const compositeScore = Math.round(
        priceScore * 0.45 + speedScore * 0.35 + reliabilityScore * 0.20
      );

      return {
        ...row,
        priceDiffFromLowest,
        pricePercentDiff,
        daysDiffFromFastest,
        compositeScore,
        isLowestPrice: row.wholesalePrice === benchmarks.lowestPrice,
        isFastestDelivery: row.deliveryDays === benchmarks.fastestDays,
        isHighestMargin: row.profitMarginPercent === benchmarks.highestMargin
      };
    });
  }, [comparisonRows, benchmarks]);

  // Filter and Sort
  const displayedRows = useMemo(() => {
    return enrichedRows
      .filter(row => {
        if (!row.isIncluded) return false;
        if (maxDeliveryDaysFilter > 0 && row.deliveryDays > maxDeliveryDaysFilter) return false;
        if (minReliabilityFilter > 0 && row.reliability < minReliabilityFilter) return false;
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        switch (sortField) {
          case 'delivery_rate':
            diff = a.deliveryDays - b.deliveryDays;
            break;
          case 'price':
            diff = a.wholesalePrice - b.wholesalePrice;
            break;
          case 'profit_margin':
            diff = a.profitMarginPercent - b.profitMarginPercent;
            break;
          case 'reliability':
            diff = a.reliability - b.reliability;
            break;
          case 'composite_score':
          default:
            diff = a.compositeScore - b.compositeScore;
            break;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [enrichedRows, maxDeliveryDaysFilter, minReliabilityFilter, sortField, sortOrder]);

  // Key Decision Champions
  const bestValueChampion = useMemo(() => {
    const included = enrichedRows.filter(r => r.isIncluded);
    if (included.length === 0) return null;
    return [...included].sort((a, b) => b.compositeScore - a.compositeScore)[0];
  }, [enrichedRows]);

  const fastestChampion = useMemo(() => {
    const included = enrichedRows.filter(r => r.isIncluded);
    if (included.length === 0) return null;
    return [...included].sort((a, b) => a.deliveryDays - b.deliveryDays)[0];
  }, [enrichedRows]);

  const lowestPriceChampion = useMemo(() => {
    const included = enrichedRows.filter(r => r.isIncluded);
    if (included.length === 0) return null;
    return [...included].sort((a, b) => a.wholesalePrice - b.wholesalePrice)[0];
  }, [enrichedRows]);

  // Handle setting supplier as primary in inventory
  const handleAssignAsPrimarySupplier = (supp: SupplierProfile, quotePrice: number) => {
    if (!activeInventoryRecord) {
      if (onShowToast) onShowToast('لم يتم العثور على سجل مخزون لهذا الصنف للربط.');
      return;
    }

    const updated = inventory.map(item => {
      if (item.productId === activeProduct.id) {
        return {
          ...item,
          supplierName: supp.name,
          supplierPhone: supp.phone,
          leadTimeDays: supp.leadTimeDays,
          costPerUnitEGP: quotePrice,
          totalInventoryValuationEGP: item.currentStock * quotePrice
        };
      }
      return item;
    });

    onUpdateInventory(updated);
    saveStoredInventory(updated);

    if (onShowToast) {
      onShowToast(`تم اعتماد المورد "${supp.name}" بنجاح وتحديث سعر التكلفة بالمخزون! ✅`);
    }
  };

  // Handle direct WhatsApp purchase order dispatch
  const handleDirectWhatsAppOrder = (supp: SupplierProfile, wholesalePrice: number, deliveryDays: number) => {
    const totalAmount = wholesalePrice * orderQuantity;
    const dateStr = new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const msg = [
      `السلام عليكم ورحمة الله وبركاته،`,
      `تحية طيبة م/ ${supp.name} المحترم،`,
      ``,
      `📋 *أمر توريد تجاري رسمي معتمد:*`,
      `📦 الصنف: *${activeProduct.title}*`,
      `🏷️ الكود (SKU): *${activeInventoryRecord?.sku || activeProduct.model || 'SKU-EG'}*`,
      `🔢 الكمية المطلوبة للتوريد: *${orderQuantity} قطعة*`,
      `💰 سعر توريد الوحدة المتفق عليه: *${wholesalePrice.toLocaleString()} ${currency}*`,
      `💵 إجمالي القيمة: *${totalAmount.toLocaleString()} ${currency}*`,
      `⏱️ معدل التسليم المتفق عليه: *خلال ${deliveryDays} يوم/أيام عمل*`,
      `📍 وجهة التسليم: *${supp.warehouseLocation}*`,
      `📅 تاريخ الطلب: *${dateStr}*`,
      ``,
      `نرجو التكرم بتأكيد حجز الكمية وموعد إرسال البضاعة للمستودع. شاكرين ومقدرين حسن تعاونكم الدائم. 🤝`
    ].join('\n');

    const cleanPhone = supp.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    safeOpenUrl(url);

    if (onShowToast) {
      onShowToast(`تم تجهيز وتوجيه أمر التوريد عبر واتساب للمورد: ${supp.name} 📲`);
    }
  };

  // Toggle supplier in selection
  const handleToggleSupplier = (supplierId: string) => {
    setSelectedSupplierIds(prev => {
      if (prev.includes(supplierId)) {
        if (prev.length <= 1) {
          if (onShowToast) onShowToast('يجب إبقاء مورد واحد على الأقل للمقارنة.');
          return prev;
        }
        return prev.filter(id => id !== supplierId);
      } else {
        return [...prev, supplierId];
      }
    });
  };

  // Select all suppliers
  const handleSelectAllSuppliers = () => {
    setSelectedSupplierIds(suppliers.map(s => s.id));
  };

  // Save edited quote
  const handleSaveEditedQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier || !activeProduct) return;

    const quoteToSave: SupplierProductQuote = {
      productId: activeProduct.id,
      supplierId: editingSupplier.supplierId,
      wholesalePrice: editingSupplier.currentPrice,
      minOrderQuantity: editingSupplier.minOrder,
      note: editingSupplier.note.trim()
    };

    saveStoredSupplierQuote(quoteToSave);
    setQuoteVersion(v => v + 1);
    setEditingSupplier(null);

    if (onShowToast) {
      onShowToast(`تم حفظ عرض السعر المخصص للمورد "${editingSupplier.supplierName}" بنجاح! 💾`);
    }
  };

  // Export comparison table to CSV
  const handleExportComparisonCSV = () => {
    if (!activeProduct || displayedRows.length === 0) return;

    const headers = [
      'اسم المورد',
      'رقم الواتساب',
      'مستودع التوريد',
      'معدل التوريد (أيام)',
      'فترة التوريد المعتادة',
      'نسبة الموثوقية (%)',
      'سعر توريد الوحدة (ج.م)',
      'كمية الطلب المحسوبة',
      'إجمالي تكلفة الشحنة (ج.م)',
      'سعر البيع المستهدف (ج.م)',
      'هامش ربح القطعة (ج.م)',
      'نسبة هامش الربح (%)',
      'إجمالي ربح الشحنة (ج.م)',
      'التقييم الشامل الموزون (من 100)'
    ].join(',');

    const rows = displayedRows.map(r => {
      return [
        `"${r.supplier.name.replace(/"/g, '""')}"`,
        `"${r.supplier.phone}"`,
        `"${r.supplier.warehouseLocation.replace(/"/g, '""')}"`,
        r.deliveryDays,
        r.supplier.leadTimeDays,
        `${r.reliability}%`,
        r.wholesalePrice,
        orderQuantity,
        r.totalBatchCost,
        sellingPrice,
        r.profitPerUnit,
        `${r.profitMarginPercent}%`,
        r.totalBatchProfit,
        r.compositeScore
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `مقارنة_معدل_التوريد_والأسعار_${activeProduct.title.slice(0, 20)}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast('تم تصدير جدول مقارنة الموردين والأسعار كملف CSV بنجاح! 📊');
    }
  };

  // Delivery rate badge renderer
  const renderDeliveryRateBadge = (days: number) => {
    if (days <= 1.5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 animate-pulse" />
          <span>{days} يوم (فائق السرعة)</span>
        </span>
      );
    }
    if (days <= 2.5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 text-xs font-black">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{days} أيام (سريع)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span>{days} أيام (قياسي)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6" id="multi-supplier-comparison-view" dir="rtl">
      
      {/* 1. Header & Context Control Strip */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wide flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>مقارنة متعددة الأبعاد</span>
              </span>
              <span className="text-xs font-bold text-slate-500">
                مقارنة حية لـ ({selectedSupplierIds.length}) موردين لنفس المنتج
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Alexandria']">
              جدول مقارنة معدل التوريد والأسعار للموردين ⚖️
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              قارن سرعة التوصيل بالأيام (معدل التوريد) وأسعار الجملة، هوامش الربح المتوقعة، وإجمالي تكلفة الشحنة لعدة موردين بالتوازي لاتخاذ أفضل قرار اقتصادي واستراتيجي.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportComparisonCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              title="تصدير جدول المقارنة كملف إكسيل CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>تصدير CSV</span>
            </button>

            {onOpenWhatsAppAutomation && (
              <button
                onClick={() => onOpenWhatsAppAutomation(activeProduct?.id)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="فتح نظام أتمتة الواتساب للموردين"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-100" />
                <span>أتمتة الواتساب</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Selector & Reorder Quantity Simulator Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          
          {/* Product Dropdown Selector */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              <span>اختر المنتج للمقارنة:</span>
            </label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
            >
              {products.map(p => {
                const inv = inventory.find(i => i.productId === p.id);
                const isLow = inv ? inv.currentStock <= inv.minReorderLevel : false;
                return (
                  <option key={p.id} value={p.id}>
                    {isLow ? '🚨 [نقص مخزون] ' : '📦 '}
                    {p.title} - (بيع: {p.currentLowestPrice.toLocaleString()} {currency})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity Simulator Input */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>كمية أمر التوريد المحسوبة:</span>
              </span>
              <span className="text-[11px] text-indigo-600 font-bold">
                تحديث فوري للتكلفة والأرباح
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="1000"
                value={orderQuantity}
                onChange={e => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-xs font-black font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
              <span className="text-xs font-bold text-slate-500">قطعة</span>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 mr-2">
                {[10, 25, 50, 100].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setOrderQuantity(qty)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      orderQuantity === qty
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Product Economics Benchmark Summary */}
          <div className="md:col-span-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">سعر البيع المعتمد:</span>
              <span className="font-mono font-black text-slate-900 text-sm">
                {sellingPrice.toLocaleString()} {currency}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-slate-500 block">مرجع تكلفة الجملة:</span>
              <span className="font-mono font-bold text-indigo-700">
                {baseWholesaleCost.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Supplier Selection Pills */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>الموردين في المقارنة:</span>
            </span>

            {suppliers.map(supp => {
              const isSelected = selectedSupplierIds.includes(supp.id);
              const isCurrent =
                activeInventoryRecord?.supplierName === supp.name ||
                activeInventoryRecord?.supplierPhone === supp.phone;

              return (
                <button
                  key={supp.id}
                  onClick={() => handleToggleSupplier(supp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 line-through opacity-70'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                  <span>{supp.name.split(' ')[0]} {supp.name.split(' ')[1] || ''}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="المورد الحالي" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllSuppliers}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              تحديد جميع الموردين ({suppliers.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Strategic Insights & Decision Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Fastest Delivery Rate */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden space-y-1">
          <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">⚡ أسرع معدل توريد</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
              أسرع تسليم
            </span>
          </div>
          {fastestChampion ? (
            <>
              <h4 className="text-sm font-black text-slate-900 truncate">
                {fastestChampion.supplier.name}
              </h4>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-xl font-black font-mono text-emerald-600">
                  {fastestChampion.deliveryDays}
                </span>
                <span className="text-xs font-bold text-slate-600">أيام توصيل</span>
                <span className="text-[11px] font-mono text-slate-400 mr-auto">
                  ({fastestChampion.reliability}% موثوقية)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-0.5">
                بسعر {fastestChampion.wholesalePrice.toLocaleString()} {currency} للقطعة
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400">لا يوجد موردين محددين</p>
          )}
        </div>

        {/* Card 2: Lowest Supply Price */}
        <div className="bg-white border border-blue-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden space-y-1">
          <div className="absolute top-0 right-0 left-0 h-1 bg-blue-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">💰 أفضل وأقل سعر توريد</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
              أعلى توفير
            </span>
          </div>
          {lowestPriceChampion ? (
            <>
              <h4 className="text-sm font-black text-slate-900 truncate">
                {lowestPriceChampion.supplier.name}
              </h4>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-xl font-black font-mono text-blue-600">
                  {lowestPriceChampion.wholesalePrice.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-600">{currency} / قطعة</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-0.5">
                إجمالي الشحنة ({orderQuantity} قطعة): <b>{lowestPriceChampion.totalBatchCost.toLocaleString()} {currency}</b>
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400">لا يوجد موردين محددين</p>
          )}
        </div>

        {/* Card 3: Highest Profit Margin */}
        <div className="bg-white border border-purple-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden space-y-1">
          <div className="absolute top-0 right-0 left-0 h-1 bg-purple-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800">📈 أعلى هامش ربحي</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
              أقصى مكسب
            </span>
          </div>
          {lowestPriceChampion ? (
            <>
              <h4 className="text-sm font-black text-slate-900 truncate">
                {lowestPriceChampion.supplier.name}
              </h4>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-xl font-black font-mono text-purple-600">
                  +{lowestPriceChampion.profitMarginPercent}%
                </span>
                <span className="text-xs font-bold text-slate-600">هامش ربح</span>
                <span className="text-[11px] font-mono text-emerald-600 mr-auto font-bold">
                  +{lowestPriceChampion.profitPerUnit.toLocaleString()} {currency}/قطعة
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-0.5">
                صافي ربح الدفعة المتوقع: <b>+{lowestPriceChampion.totalBatchProfit.toLocaleString()} {currency}</b>
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400">لا يوجد موردين محددين</p>
          )}
        </div>

        {/* Card 4: Best Overall Composite Value Champion */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-200 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
              <span>الخيار المتوازن الأفضل</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-400 text-slate-950 text-[10px] font-black">
              توصية الذكاء 🏆
            </span>
          </div>
          {bestValueChampion ? (
            <>
              <h4 className="text-sm font-black text-white truncate">
                {bestValueChampion.supplier.name}
              </h4>
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs space-y-0.5">
                  <p className="text-indigo-200">
                    معدل: <b>{bestValueChampion.deliveryDays} أيام</b> • سعر: <b>{bestValueChampion.wholesalePrice} {currency}</b>
                  </p>
                  <p className="text-[11px] text-emerald-300 font-bold">
                    ربح: {bestValueChampion.profitMarginPercent}% • التزام: {bestValueChampion.reliability}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex flex-col items-center justify-center font-mono font-black text-sky-300 text-sm">
                  <span>{bestValueChampion.compositeScore}</span>
                  <span className="text-[8px] text-slate-300">/100</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">اختر موردين للعرض</p>
          )}
        </div>
      </div>

      {/* 3. Interactive Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-0">
        
        {/* Table Top Controls & Sort Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700">ترتيب النتائج حسب:</span>
            
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  if (sortField === 'delivery_rate') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                  else { setSortField('delivery_rate'); setSortOrder('asc'); }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortField === 'delivery_rate'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>معدل التوريد {sortField === 'delivery_rate' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
              </button>

              <button
                onClick={() => {
                  if (sortField === 'price') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                  else { setSortField('price'); setSortOrder('asc'); }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortField === 'price'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-3 h-3" />
                <span>السعر {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
              </button>

              <button
                onClick={() => {
                  if (sortField === 'profit_margin') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                  else { setSortField('profit_margin'); setSortOrder('desc'); }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortField === 'profit_margin'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>هامش الربح {sortField === 'profit_margin' && (sortOrder === 'desc' ? '↓' : '↑')}</span>
              </button>

              <button
                onClick={() => {
                  if (sortField === 'composite_score') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                  else { setSortField('composite_score'); setSortOrder('desc'); }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortField === 'composite_score'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Star className="w-3 h-3" />
                <span>التقييم الشامل {sortField === 'composite_score' && (sortOrder === 'desc' ? '↓' : '↑')}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>عرض <b>{displayedRows.length}</b> موردين في جدول المقارنة</span>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[950px]" id="table-multi-supplier-comparison">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black text-slate-700">
                <th className="py-3.5 px-4">بيانات المورد والمستودع</th>
                <th className="py-3.5 px-4">معدل التوريد وسرعة التسليم ⚡</th>
                <th className="py-3.5 px-4">سعر توريد القطعة 💰</th>
                <th className="py-3.5 px-4">إجمالي تكلفة الشحنة ({orderQuantity} قطعة)</th>
                <th className="py-3.5 px-4">هامش الربح المتوقع 📈</th>
                <th className="py-3.5 px-4 text-center">التقييم المتوازن 🏆</th>
                <th className="py-3.5 px-4 text-center">الإجراء المعتمد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {displayedRows.map((row) => {
                const isChampion = bestValueChampion?.supplier.id === row.supplier.id;

                return (
                  <tr
                    key={row.supplier.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      row.isCurrentAssigned
                        ? 'bg-indigo-50/40'
                        : isChampion
                        ? 'bg-sky-50/20'
                        : ''
                    }`}
                  >
                    {/* Column 1: Supplier & Warehouse */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-slate-900 font-['Alexandria'] text-sm">
                            {row.supplier.name}
                          </span>

                          {row.isCurrentAssigned && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                              المعتمد حالياً
                            </span>
                          )}

                          {row.supplier.isPreferred && !row.isCurrentAssigned && (
                            <span className="px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200">
                              معتمد ⭐
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{row.supplier.warehouseLocation.split('-')[0]}</span>
                          </span>

                          <span>•</span>

                          <span className="flex items-center gap-1 font-mono text-slate-600" dir="ltr">
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>{row.supplier.phone}</span>
                          </span>
                        </div>

                        {row.quote.note && (
                          <span className="inline-block text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            💡 {row.quote.note}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 2: Delivery Rate (معدل التوريد بالأيام والسرعة) */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {renderDeliveryRateBadge(row.deliveryDays)}
                          {row.isFastestDelivery && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                              الأسرع 🏆
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>🎯 نسبة الالتزام: <b className="text-slate-800">{row.reliability}%</b></span>
                          {row.daysDiffFromFastest > 0 && (
                            <span className="text-slate-400 font-mono">
                              (+{row.daysDiffFromFastest} يوم عن الأسرع)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Supply Price per Unit */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-black font-mono ${
                            row.isLowestPrice ? 'text-emerald-700 text-lg' : 'text-slate-900'
                          }`}>
                            {row.wholesalePrice.toLocaleString()} {currency}
                          </span>

                          <button
                            type="button"
                            onClick={() => setEditingSupplier({
                              supplierId: row.supplier.id,
                              supplierName: row.supplier.name,
                              currentPrice: row.wholesalePrice,
                              minOrder: row.quote.minOrderQuantity || 10,
                              note: row.quote.note || ''
                            })}
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="تعديل عرض السعر لهذا المورد"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {row.isLowestPrice ? (
                          <span className="text-[10px] font-bold text-emerald-700 block">
                            ✓ أرخص سعر توريد بالسوق
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-600 block font-mono">
                            +{row.priceDiffFromLowest.toLocaleString()} {currency} (+{row.pricePercentDiff}%)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Total Batch Cost */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black font-mono text-slate-900 block">
                          {row.totalBatchCost.toLocaleString()} {currency}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ({row.wholesalePrice} × {orderQuantity} قطعة)
                        </span>
                      </div>
                    </td>

                    {/* Column 5: Expected Profit Margin */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black font-mono text-emerald-700">
                            +{row.profitPerUnit.toLocaleString()} {currency}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                            {row.profitMarginPercent}%
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-500 block">
                          إجمالي ربح الدفعة: <b className="text-slate-800 font-mono">+{row.totalBatchProfit.toLocaleString()} {currency}</b>
                        </span>
                      </div>
                    </td>

                    {/* Column 6: Composite Value Score */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 font-mono font-black text-xs">
                          <span className={
                            row.compositeScore >= 85 ? 'text-emerald-700' :
                            row.compositeScore >= 70 ? 'text-indigo-700' : 'text-slate-700'
                          }>
                            {row.compositeScore}
                          </span>
                          <span className="text-slate-400 text-[10px]">/100</span>
                        </div>

                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.compositeScore >= 85 ? 'bg-emerald-500' :
                              row.compositeScore >= 70 ? 'bg-indigo-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${row.compositeScore}%` }}
                          />
                        </div>

                        {isChampion && (
                          <span className="text-[9px] font-black text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded-md">
                            الأعلى توازناً 🏆
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 7: Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        
                        {/* Make Primary Supplier */}
                        {!row.isCurrentAssigned ? (
                          <button
                            type="button"
                            onClick={() => handleAssignAsPrimarySupplier(row.supplier, row.wholesalePrice)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-[11px] transition-all cursor-pointer border border-slate-200 active:scale-95"
                            title="تعيين هذا المورد كمورد أساسي للمنتج وتحديث تكلفة المخزون"
                          >
                            اعتماد رئيسي
                          </button>
                        ) : (
                          <span className="px-2 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>معتمد للمنتج</span>
                          </span>
                        )}

                        {/* Direct WhatsApp Order */}
                        <button
                          type="button"
                          onClick={() => handleDirectWhatsAppOrder(row.supplier, row.wholesalePrice, row.deliveryDays)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                          title="إرسال أمر توريد رسمي فوري للمورد عبر واتساب"
                        >
                          <Send className="w-3 h-3" />
                          <span>طلب توريد</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayedRows.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">لم يتم تحديد أي موردين للمقارنة</h4>
            <p className="text-xs text-slate-500">يرجى تحديد مورد أو أكثر من قائمة الفلترة أعلاه لعرض المقارنة التفاعلية.</p>
          </div>
        )}
      </div>

      {/* 4. Edit Supplier Quote Modal */}
      {editingSupplier && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingSupplier(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">تعديل عرض سعر المورد</h3>
                  <p className="text-[11px] text-slate-500">{editingSupplier.supplierName}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSupplier(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuote} className="space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <span className="text-[11px] text-slate-500 block">المنتج المستهدف:</span>
                <span className="font-bold text-slate-900 line-clamp-1">{activeProduct?.title}</span>
              </div>

              <div className="space-y-1">
                <label className="font-black text-slate-800 flex items-center justify-between">
                  <span>سعر توريد الوحدة بالجملة:</span>
                  <span className="text-indigo-600 font-mono">{currency}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingSupplier.currentPrice}
                  onChange={e => setEditingSupplier({
                    ...editingSupplier,
                    currentPrice: Math.max(1, parseInt(e.target.value) || 0)
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-black text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black text-slate-800">الحد الأدنى لكمية الطلب (MOQ):</label>
                <input
                  type="number"
                  min="1"
                  value={editingSupplier.minOrder}
                  onChange={e => setEditingSupplier({
                    ...editingSupplier,
                    minOrder: Math.max(1, parseInt(e.target.value) || 1)
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black text-slate-800">ملاحظات عرض السعر (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: خصم كميات، الدفع كاش، شامل التوصيل..."
                  value={editingSupplier.note}
                  onChange={e => setEditingSupplier({
                    ...editingSupplier,
                    note: e.target.value
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  حفظ عرض السعر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
