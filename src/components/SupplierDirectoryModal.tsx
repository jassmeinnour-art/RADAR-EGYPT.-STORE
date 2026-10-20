import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Phone,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Search,
  MessageCircle,
  Package,
  AlertTriangle,
  Send,
  Star,
  RefreshCw,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Layers,
  HelpCircle,
  Scale,
  ArrowUpDown
} from 'lucide-react';
import {
  SupplierProfile,
  ProductInventoryRecord,
  ProductData
} from '../types';
import {
  EGYPTIAN_WAREHOUSES,
  saveStoredSuppliers,
  saveStoredInventory,
  getWhatsAppDeepLink
} from '../data/inventoryData';
import { safeOpenUrl } from '../utils/safeWindowOpen';
import { MultiSupplierComparisonTable } from './MultiSupplierComparisonTable';

interface SupplierDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: SupplierProfile[];
  onUpdateSuppliers: (suppliers: SupplierProfile[]) => void;
  inventory: ProductInventoryRecord[];
  onUpdateInventory: (updated: ProductInventoryRecord[]) => void;
  products: ProductData[];
  onShowToast?: (message: string) => void;
  onOpenWhatsAppAutomation?: (productId?: string) => void;
  initialSelectedProductId?: string;
  initialTab?: 'directory' | 'comparison' | 'alternative_decision';
}

export const SupplierDirectoryModal: React.FC<SupplierDirectoryModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  onUpdateSuppliers,
  inventory,
  onUpdateInventory,
  products,
  onShowToast,
  onOpenWhatsAppAutomation,
  initialSelectedProductId,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'comparison' | 'alternative_decision'>(() => {
    if (initialTab) return initialTab;
    if (initialSelectedProductId) return 'comparison';
    return 'directory';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  // Selected item for alternative supplier decision
  const [selectedProductIdForAlt, setSelectedProductIdForAlt] = useState<string>(
    initialSelectedProductId || inventory.find(i => i.currentStock <= i.minReorderLevel)?.productId || inventory[0]?.productId || ''
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialSelectedProductId) {
      setSelectedProductIdForAlt(initialSelectedProductId);
    }
  }, [initialSelectedProductId]);

  // Form states
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(2);
  const [averageDeliveryDays, setAverageDeliveryDays] = useState<number>(2.0);
  const [deliveryReliability, setDeliveryReliability] = useState<number>(95);
  const [warehouseLocation, setWarehouseLocation] = useState<string>(EGYPTIAN_WAREHOUSES[0]);
  const [notes, setNotes] = useState<string>('');
  const [isPreferred, setIsPreferred] = useState<boolean>(false);
  const [syncWithInventory, setSyncWithInventory] = useState<boolean>(true);

  // Product lookup map
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  // Current item being inspected for alternative supplier
  const currentSelectedInventoryItem = useMemo(() => {
    return inventory.find(i => i.productId === selectedProductIdForAlt) || inventory[0];
  }, [inventory, selectedProductIdForAlt]);

  const currentProductData = useMemo(() => {
    if (!currentSelectedInventoryItem) return null;
    return productMap.get(currentSelectedInventoryItem.productId);
  }, [productMap, currentSelectedInventoryItem]);

  // Current assigned supplier for selected item
  const currentAssignedSupplier = useMemo(() => {
    if (!currentSelectedInventoryItem) return null;
    return suppliers.find(
      s => s.name === currentSelectedInventoryItem.supplierName || s.phone === currentSelectedInventoryItem.supplierPhone
    );
  }, [suppliers, currentSelectedInventoryItem]);

  // Calculate linked inventory items and low stock counts for each supplier
  const supplierStats = useMemo(() => {
    const stats: Record<string, { totalItems: number; lowStockItems: ProductInventoryRecord[] }> = {};
    suppliers.forEach(s => {
      stats[s.name] = { totalItems: 0, lowStockItems: [] };
    });

    inventory.forEach(inv => {
      if (!stats[inv.supplierName]) {
        stats[inv.supplierName] = { totalItems: 0, lowStockItems: [] };
      }
      stats[inv.supplierName].totalItems += 1;
      if (inv.currentStock <= inv.minReorderLevel) {
        stats[inv.supplierName].lowStockItems.push(inv);
      }
    });

    return stats;
  }, [suppliers, inventory]);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return suppliers;
    return suppliers.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        s.phone.includes(query) ||
        s.warehouseLocation.toLowerCase().includes(query) ||
        (s.notes && s.notes.toLowerCase().includes(query))
    );
  }, [suppliers, searchQuery]);

  // Alternative suppliers sorted by average delivery rate (fastest first)
  const sortedAlternativeSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => {
      const rateA = a.averageDeliveryDays ?? a.leadTimeDays ?? 3;
      const rateB = b.averageDeliveryDays ?? b.leadTimeDays ?? 3;
      return rateA - rateB;
    });
  }, [suppliers]);

  if (!isOpen) return null;

  // Reset form
  const handleResetForm = () => {
    setName('');
    setPhone('+201');
    setLeadTimeDays(2);
    setAverageDeliveryDays(2.0);
    setDeliveryReliability(95);
    setWarehouseLocation(EGYPTIAN_WAREHOUSES[0]);
    setNotes('');
    setIsPreferred(false);
    setEditingSupplierId(null);
    setIsFormOpen(false);
  };

  // Open edit form
  const handleStartEdit = (supp: SupplierProfile) => {
    setEditingSupplierId(supp.id);
    setName(supp.name);
    setPhone(supp.phone);
    setLeadTimeDays(supp.leadTimeDays || 2);
    setAverageDeliveryDays(supp.averageDeliveryDays ?? supp.leadTimeDays ?? 2.0);
    setDeliveryReliability(supp.deliveryReliability ?? 95);
    setWarehouseLocation(supp.warehouseLocation || EGYPTIAN_WAREHOUSES[0]);
    setNotes(supp.notes || '');
    setIsPreferred(!!supp.isPreferred);
    setSyncWithInventory(true);
    setIsFormOpen(true);
    setActiveTab('directory');
  };

  // Open new supplier form
  const handleStartAdd = () => {
    handleResetForm();
    setPhone('+201');
    setIsFormOpen(true);
    setActiveTab('directory');
  };

  // Submit Add / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      if (onShowToast) onShowToast('يرجى إدخال اسم المورد ورقم هاتف الواتساب');
      return;
    }

    let updatedSuppliersList: SupplierProfile[];

    if (editingSupplierId) {
      const oldSupplier = suppliers.find(s => s.id === editingSupplierId);
      const oldName = oldSupplier?.name;

      updatedSuppliersList = suppliers.map(s => {
        if (s.id === editingSupplierId) {
          return {
            ...s,
            name: trimmedName,
            phone: trimmedPhone,
            leadTimeDays: Math.max(1, leadTimeDays),
            averageDeliveryDays: Math.max(0.5, averageDeliveryDays),
            deliveryReliability: Math.min(100, Math.max(50, deliveryReliability)),
            warehouseLocation,
            notes: notes.trim(),
            isPreferred
          };
        }
        return s;
      });

      // Synchronize with inventory items if requested
      if (syncWithInventory && oldName) {
        const updatedInventory = inventory.map(item => {
          if (item.supplierName === oldName || item.supplierPhone === oldSupplier?.phone) {
            return {
              ...item,
              supplierName: trimmedName,
              supplierPhone: trimmedPhone,
              leadTimeDays: Math.max(1, leadTimeDays),
              warehouseLocation: warehouseLocation || item.warehouseLocation
            };
          }
          return item;
        });
        onUpdateInventory(updatedInventory);
        saveStoredInventory(updatedInventory);
      }

      if (onShowToast) {
        onShowToast(`✅ تم تحديث بيانات المورد (${trimmedName}) ومعدل التوريد بنجاح`);
      }
    } else {
      const newSupplier: SupplierProfile = {
        id: `supp-${Date.now()}`,
        name: trimmedName,
        phone: trimmedPhone,
        leadTimeDays: Math.max(1, leadTimeDays),
        averageDeliveryDays: Math.max(0.5, averageDeliveryDays),
        deliveryReliability: Math.min(100, Math.max(50, deliveryReliability)),
        warehouseLocation,
        notes: notes.trim(),
        isPreferred
      };

      updatedSuppliersList = [newSupplier, ...suppliers];
      if (onShowToast) {
        onShowToast(`🎉 تمت إضافة المورد الجديد (${trimmedName}) لدليل الموردين`);
      }
    }

    onUpdateSuppliers(updatedSuppliersList);
    saveStoredSuppliers(updatedSuppliersList);
    handleResetForm();
  };

  // Delete supplier
  const handleDeleteSupplier = (id: string, supplierName: string) => {
    const isConfirmed = window.confirm(`هل أنت متأكد من حذف بيانات المورد "${supplierName}"؟`);
    if (!isConfirmed) return;

    const updated = suppliers.filter(s => s.id !== id);
    onUpdateSuppliers(updated);
    saveStoredSuppliers(updated);

    if (onShowToast) {
      onShowToast(`تم حذف المورد "${supplierName}" من القائمة`);
    }
  };

  // Switch to alternative supplier for a specific item
  const handleSwitchToAlternativeSupplier = (altSupplier: SupplierProfile) => {
    if (!currentSelectedInventoryItem) return;

    const updatedInventory = inventory.map(item => {
      if (item.productId === currentSelectedInventoryItem.productId) {
        return {
          ...item,
          supplierName: altSupplier.name,
          supplierPhone: altSupplier.phone,
          leadTimeDays: altSupplier.leadTimeDays,
          warehouseLocation: altSupplier.warehouseLocation || item.warehouseLocation
        };
      }
      return item;
    });

    onUpdateInventory(updatedInventory);
    saveStoredInventory(updatedInventory);

    if (onShowToast) {
      onShowToast(
        `⚡ تم اعتماد (${altSupplier.name}) كمورد معتمد للصنف بمعدل توريد متوسط (${altSupplier.averageDeliveryDays ?? altSupplier.leadTimeDays} يوم)`
      );
    }
  };

  // Quick Direct WhatsApp Chat with Supplier
  const handleQuickWhatsAppChat = (supp: SupplierProfile, forItem?: ProductInventoryRecord) => {
    const avgDays = supp.averageDeliveryDays ?? supp.leadTimeDays ?? 2;
    const prod = forItem ? productMap.get(forItem.productId) : null;

    let greeting: string;
    if (forItem && prod) {
      greeting = `السلام عليكم ورحمة الله وبركاته،
تحية طيبة م/ ${supp.name.split(' ')[0]} المحترم،
نستفسر عن إمكانية توريد عاجل لصنف:
📦 ${prod.title} (كود: ${forItem.sku})
الكمية المطلوبة مبدئياً: ${forItem.reorderQuantity || 25} قطعة
بناءً على معدل التوريد المعتاد طرفكم (${avgDays} أيام عمل).
نرجو تأكيد السعر والجاهزية للشحن لمستودعنا. شكراً جزيلاً!`;
    } else {
      greeting = `السلام عليكم ورحمة الله وبركاته،
تحية طيبة م/ ${supp.name.split(' ')[0] || 'المورد المحترم'}،
نود الاستفسار عن كشف التوريدات والمخزون ومعدل التوصيل الخاص بحسابنا التجاري طرفكم (${avgDays} أيام).
شاكرين حسن تعاونكم الدائم.`;
    }

    const url = getWhatsAppDeepLink(supp.phone, greeting);
    safeOpenUrl(url);
  };

  // Helper to render delivery speed badge
  const renderDeliveryRateBadge = (days: number, compact: boolean = false) => {
    if (days <= 1.5) {
      return (
        <span
          className={`inline-flex items-center gap-1 font-black rounded-lg border ${
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } bg-emerald-50 text-emerald-800 border-emerald-300`}
          title={`معدل التوريد: يستغرق المورد في المتوسط ${days} يوم للتسليم في المخزن`}
        >
          <Zap className="w-3 h-3 text-emerald-600 fill-emerald-500" />
          <span>معدل التوريد: {days} {days === 1 ? 'يوم' : 'أيام'} (فائق السرعة ⚡)</span>
        </span>
      );
    }
    if (days <= 2.5) {
      return (
        <span
          className={`inline-flex items-center gap-1 font-black rounded-lg border ${
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } bg-blue-50 text-blue-800 border-blue-200`}
          title={`معدل التوريد: يستغرق المورد في المتوسط ${days} يوم للتسليم في المخزن`}
        >
          <Clock className="w-3 h-3 text-blue-600" />
          <span>معدل التوريد: {days} {days === 2 ? 'يومان' : 'أيام'} (سريع 🚀)</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 font-black rounded-lg border ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-slate-100 text-slate-800 border-slate-300`}
        title={`معدل التوريد: يستغرق المورد في المتوسط ${days} أيام للتسليم في المخزن`}
      >
        <Clock className="w-3 h-3 text-slate-500" />
        <span>معدل التوريد: {days} أيام (اعتيادي)</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-fadeIn" id="supplier-directory-modal">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200/90 overflow-hidden animate-scaleUp">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">إدارة الموردين ومعدل التوريد الذكي</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/20">
                  {suppliers.length} موردين معتمدين
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                مقارنة متوسط عدد أيام التوصيل بجانب رقم الواتساب لمساعدة التاجر على اتخاذ قرار توريد بديل فوري
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>دليل الموردين ومعدلات التوريد ({suppliers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-sky-300" />
              <span>جدول مقارنة معدل التوريد والأسعار ⚖️</span>
            </button>

            <button
              onClick={() => setActiveTab('alternative_decision')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'alternative_decision'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-sky-300" />
              <span>أداة اختيار مورد بديل ذكي للأصناف</span>
              {inventory.filter(i => i.currentStock <= i.minReorderLevel).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {inventory.filter(i => i.currentStock <= i.minReorderLevel).length} عاجل
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartAdd}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مورد</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: SUPPLIERS DIRECTORY */}
          {activeTab === 'directory' && (
            <>
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، رقم الواتساب، معدل التوريد، أو المستودع..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Add / Edit Form Card */}
              {isFormOpen && (
                <form
                  onSubmit={handleSubmitForm}
                  className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 rounded-2xl p-5 border border-indigo-200 shadow-sm space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      <span>{editingSupplierId ? 'تعديل بيانات المورد ومعدل التوريد' : 'إضافة مورد جديد لمنظومة التوريد'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Supplier Name */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 flex items-center gap-1">
                        <span>اسم المورد أو الشركة:</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: شركة النور للتوزيع والتوريدات"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>

                    {/* WhatsApp Phone */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 flex items-center gap-1">
                        <span>رقم هاتف الواتساب المعتمد:</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0 ml-1.5" />
                        <input
                          type="text"
                          required
                          placeholder="+201012345678 أو 01012345678"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full bg-transparent border-0 font-mono font-bold text-slate-900 focus:outline-hidden text-left"
                          dir="ltr"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">يستخدم تلقائياً عند توليد ومراسلة المورد عبر تطبيق واتساب</span>
                    </div>

                    {/* معدل التوريد (متوسط عدد الأيام التي يستغرقها المورد للتوصيل) */}
                    <div className="space-y-1 bg-sky-50/60 p-3 rounded-xl border border-sky-200/80">
                      <label className="font-black text-sky-950 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-sky-700" />
                        <span>معدل التوريد (متوسط أيام التوصيل الفعلي):</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          step="0.1"
                          min={0.5}
                          max={30}
                          required
                          value={averageDeliveryDays}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 1;
                            setAverageDeliveryDays(val);
                            setLeadTimeDays(Math.round(val));
                          }}
                          className="w-24 px-3 py-1.5 bg-white border border-sky-300 rounded-xl font-black text-sky-950 focus:outline-hidden text-center text-sm"
                        />
                        <span className="text-slate-700 font-bold">أيام متوسط التوصيل الفعلي</span>
                      </div>
                      <span className="text-[10px] text-sky-800 block">
                        💡 يُعرض هذا المؤشر بجانب رقم الواتساب لتمكينك من مقارنة سرعة الموردين واتخاذ قرار اختيار المورد البديل.
                      </span>
                    </div>

                    {/* Delivery Reliability */}
                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>نسبة الالتزام بالتسليم في الموعد (%):</span>
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min={50}
                          max={100}
                          value={deliveryReliability}
                          onChange={e => setDeliveryReliability(parseInt(e.target.value) || 90)}
                          className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden text-center text-sm"
                        />
                        <span className="text-slate-700 font-bold">% دقة التسليم بميعاد التوريد</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">تقييم موثوقية المورد عند الأزمات ومواسم الضغط</span>
                    </div>

                    {/* Warehouse Location */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">المستودع الرئيسي / وجهة التسليم:</label>
                      <select
                        value={warehouseLocation}
                        onChange={e => setWarehouseLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                      >
                        {EGYPTIAN_WAREHOUSES.map(w => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">مجال التوريد أو الأصناف المتخصصة:</label>
                      <input
                        type="text"
                        placeholder="مثال: موزع رئيسي لشاشات التلفزيون والأجهزة الذكية مع ضمان رسمي"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={isPreferred}
                          onChange={e => setIsPreferred(e.target.checked)}
                          className="rounded-sm text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                        />
                        <span>تمييز كمورد معتمد / مفضل في الحساب ⭐</span>
                      </label>

                      {editingSupplierId && (
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <input
                            type="checkbox"
                            checked={syncWithInventory}
                            onChange={e => setSyncWithInventory(e.target.checked)}
                            className="rounded-sm text-emerald-600 w-4 h-4 focus:ring-emerald-500"
                          />
                          <span>مزامنة وتحديث رقم الهاتف ومعدل التوريد للأصناف المرتبطة بالمخزن آلياً 🔄</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-indigo-100">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingSupplierId ? 'حفظ وتحديث بيانات المورد' : 'إضافة المورد الآن'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Suppliers Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuppliers.map(supp => {
                  const stats = supplierStats[supp.name] || { totalItems: 0, lowStockItems: [] };
                  const hasLowStock = stats.lowStockItems.length > 0;
                  const avgDelivery = supp.averageDeliveryDays ?? supp.leadTimeDays ?? 2.0;

                  return (
                    <div
                      key={supp.id}
                      className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between ${
                        hasLowStock
                          ? 'bg-sky-50/40 border-sky-300/90 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Top Row: Name & Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900 leading-snug">
                              {supp.name}
                            </h4>
                            {supp.categoryArabic && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                                {supp.categoryArabic}
                              </span>
                            )}
                            {supp.city && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                {supp.city}
                              </span>
                            )}
                            {supp.isPreferred && (
                              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black flex items-center gap-1 border border-sky-200">
                                <Star className="w-3 h-3 fill-sky-500 text-sky-500" />
                                معتمد
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const msg = `السلام عليكم ورحمة الله، تحية طيبة لإدارة ${supp.name}، نود الاستفسار عن عروض أسعار وتوريد الأثاث.`;
                                safeOpenUrl(getWhatsAppDeepLink(supp.phone, msg));
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="اتصال مباشر عبر واتساب"
                            >
                              <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(supp)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="تعديل بيانات المورد"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supp.id, supp.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف المورد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Combined WhatsApp & Delivery Rate Row (الميزة المطلوبة: معدل التوريد بجانب الواتساب مباشرة) */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2">
                          {/* Row 1: WhatsApp phone */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>واتساب المورد:</span>
                              <span className="font-mono font-black text-slate-900 mr-1" dir="ltr">
                                {supp.phone}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                              متاح للربط التلقائي
                            </span>
                          </div>

                          {/* Row 2: Delivery Rate (معدل التوريد معروض بجانب رقم الواتساب) */}
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              {renderDeliveryRateBadge(avgDelivery, true)}
                            </div>
                            {supp.deliveryReliability && (
                              <span
                                className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md"
                                title="نسبة الالتزام بمواعيد التوريد"
                              >
                                🎯 دقة التوريد: {supp.deliveryReliability}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Location & Notes */}
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>المستودع / النطاق:</span>
                            </span>
                            <span className="truncate max-w-[200px] font-medium text-slate-700" title={supp.warehouseLocation}>
                              {supp.warehouseLocation.split('-')[0]}
                            </span>
                          </div>

                          {supp.notes && (
                            <p className="text-[11px] text-slate-500 bg-slate-50/70 p-1.5 rounded-lg border border-slate-150 italic">
                              💡 {supp.notes}
                            </p>
                          )}
                        </div>

                        {/* Low Stock Alert Strip */}
                        {hasLowStock && (
                          <div className="p-2.5 bg-sky-100/70 text-sky-950 rounded-xl border border-sky-300 text-xs flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-black">
                              <AlertTriangle className="w-4 h-4 text-sky-700 shrink-0" />
                              <span>({stats.lowStockItems.length}) أصناف وصلت لحد الطلب!</span>
                            </div>
                            {onOpenWhatsAppAutomation && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenWhatsAppAutomation(stats.lowStockItems[0]?.productId);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>طلب عبر واتساب</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-3 text-xs flex-wrap">
                        <span className="text-[11px] text-slate-500 font-medium">
                          📦 <b>{stats.totalItems}</b> أصناف مرتبطة بالمخزن
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveTab('comparison');
                              if (stats.lowStockItems[0]) {
                                setSelectedProductIdForAlt(stats.lowStockItems[0].productId);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-xl border border-sky-200 transition-colors flex items-center gap-1 cursor-pointer text-xs"
                            title="جدول مقارنة معدل التوريد والأسعار لعدة موردين بالتوازي"
                          >
                            <Scale className="w-3 h-3 text-sky-600" />
                            <span>مقارنة الأسعار والتوريد ⚖️</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('alternative_decision');
                              if (stats.lowStockItems[0]) {
                                setSelectedProductIdForAlt(stats.lowStockItems[0].productId);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer text-xs"
                            title="مقارنة واختيار موردين بدائل للأصناف المرتبطة بهذا المورد"
                          >
                            <Zap className="w-3 h-3 text-indigo-600" />
                            <span>مقارنة بدائل</span>
                          </button>

                          <button
                            onClick={() => handleQuickWhatsAppChat(supp)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="فتح محادثة مباشرة مع المورد على واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                            <span>واتساب 📲</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSuppliers.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-black text-slate-800">لم يتم العثور على أي موردين مطابقين للبحث</h4>
                  <p className="text-xs text-slate-500">جرب تغيير كلمات البحث أو قم بإضافة مورد جديد الآن.</p>
                </div>
              )}
            </>
          )}

          {/* TAB: MULTI-SUPPLIER COMPARISON TABLE (جدول مقارنة معدل التوريد والأسعار لعدة موردين) */}
          {activeTab === 'comparison' && (
            <div className="animate-fadeIn">
              <MultiSupplierComparisonTable
                suppliers={suppliers}
                inventory={inventory}
                products={products}
                onUpdateInventory={onUpdateInventory}
                onShowToast={onShowToast}
                initialProductId={selectedProductIdForAlt}
                onOpenWhatsAppAutomation={onOpenWhatsAppAutomation}
              />
            </div>
          )}

          {/* TAB 2: SMART ALTERNATIVE SUPPLIER DECISION HELPER (أداة اتخاذ قرار ذكي لاختيار مورد بديل) */}
          {activeTab === 'alternative_decision' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Context Selector Card */}
              <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 p-4.5 rounded-2xl border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <Zap className="w-4 h-4 text-sky-600" />
                    <span>اختر الصنف المطلوب مقارنة واختيار مورد بديل له:</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 font-bold">
                    مرتب حسب معدل التوريد (الأسرع تسليماً أولاً)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <select
                      value={selectedProductIdForAlt}
                      onChange={e => setSelectedProductIdForAlt(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {inventory.map(item => {
                        const prod = productMap.get(item.productId);
                        const isLow = item.currentStock <= item.minReorderLevel;
                        return (
                          <option key={item.productId} value={item.productId}>
                            {isLow ? '🚨 [نقص مخزون] ' : '📦 '}
                            {prod?.title || item.sku} (الرصيد: {item.currentStock} | المورد الحالي: {item.supplierName})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Current assigned info */}
                  {currentSelectedInventoryItem && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center text-xs">
                      <span className="text-slate-500 text-[11px]">المورد الحالي للصنف:</span>
                      <span className="font-black text-slate-800 truncate">{currentSelectedInventoryItem.supplierName}</span>
                      <div className="flex items-center gap-2 mt-1 text-[11px]">
                        <span className="font-mono text-emerald-700" dir="ltr">{currentSelectedInventoryItem.supplierPhone}</span>
                        <span>•</span>
                        <span className="font-bold text-indigo-700">{currentSelectedInventoryItem.leadTimeDays} أيام توريد</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p>
                  <b>كيف تعمل أداة اختيار المورد البديل؟</b> يعرض الجدول أدناه جميع الموردين المسجلين مصنفين وفقاً <b>لمعدل التوريد (متوسط عدد الأيام الفعلي للتوصيل)</b> بجانب <b>رقم الواتساب</b>، لتمكينك من اتخاذ قرار توريد سريع في حال تأخر المورد الأساسي أو وجود طلبات عاجلة.
                </p>
              </div>

              {/* Alternative Suppliers Comparison Table / Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>قائمة الموردين البدائل المتاحين للصنف (مرتبة حسب سرعة التوريد):</span>
                </h4>

                <div className="space-y-3">
                  {sortedAlternativeSuppliers.map((supp, index) => {
                    const isCurrentlyAssigned =
                      currentSelectedInventoryItem?.supplierName === supp.name ||
                      currentSelectedInventoryItem?.supplierPhone === supp.phone;

                    const currentAvg = currentAssignedSupplier
                      ? (currentAssignedSupplier.averageDeliveryDays ?? currentAssignedSupplier.leadTimeDays ?? 2.5)
                      : (currentSelectedInventoryItem?.leadTimeDays ?? 2.5);

                    const altAvg = supp.averageDeliveryDays ?? supp.leadTimeDays ?? 2.0;
                    const speedDifference = (currentAvg - altAvg).toFixed(1);
                    const isFaster = parseFloat(speedDifference) > 0;

                    return (
                      <div
                        key={supp.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 ${
                          isCurrentlyAssigned
                            ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20'
                            : isFaster
                            ? 'bg-emerald-50/30 border-emerald-300/80 hover:border-emerald-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Supplier info */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-black flex items-center justify-center">
                              #{index + 1}
                            </span>
                            <h5 className="text-sm font-black text-slate-900">{supp.name}</h5>
                            {isCurrentlyAssigned && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                                المورد الأساسي الحالي
                              </span>
                            )}
                            {supp.isPreferred && (
                              <span className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black flex items-center gap-0.5 border border-sky-200">
                                <Star className="w-2.5 h-2.5 fill-sky-500 text-sky-500" />
                                معتمد
                              </span>
                            )}
                          </div>

                          {/* Display WhatsApp Phone & Delivery Rate side-by-side */}
                          <div className="flex items-center gap-3 text-xs flex-wrap">
                            {/* WhatsApp number */}
                            <div className="flex items-center gap-1 text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 font-bold">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-slate-500 text-[11px]">واتساب:</span>
                              <span className="font-mono font-black" dir="ltr">{supp.phone}</span>
                            </div>

                            {/* Delivery rate badge */}
                            <div className="flex items-center gap-1.5">
                              {renderDeliveryRateBadge(altAvg, false)}
                            </div>

                            {/* Comparison speed delta badge */}
                            {!isCurrentlyAssigned && isFaster && (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shadow-2xs animate-pulse">
                                ⚡ يوفر {speedDifference} يوم توصيل أسرع!
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>📍 {supp.warehouseLocation.split('-')[0]}</span>
                            {supp.deliveryReliability && (
                              <span>🎯 نسبة الالتزام: <b className="text-slate-700">{supp.deliveryReliability}%</b></span>
                            )}
                            {supp.notes && <span className="italic">💡 {supp.notes}</span>}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                          {/* Direct WhatsApp Message for this specific item */}
                          <button
                            type="button"
                            onClick={() => handleQuickWhatsAppChat(supp, currentSelectedInventoryItem)}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="إرسال رسالة واتساب مباشرة لهذا المورد للاستفسار عن هذا الصنف"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                            <span>طلب تسعير واتساب</span>
                          </button>

                          {/* Switch to this supplier */}
                          {!isCurrentlyAssigned ? (
                            <button
                              type="button"
                              onClick={() => handleSwitchToAlternativeSupplier(supp)}
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="اعتماد هذا المورد البديل وتحديث بيانات الصنف بالمخزن فوراً"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>اعتماد كمورد بديل</span>
                            </button>
                          ) : (
                            <span className="px-3 py-2 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl border border-slate-200">
                              تم الاعتماد
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>يتم تحديث معدل التوريد ورقم الواتساب تلقائياً في أوامر التوريد وإشعارات الحد الأدنى</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
