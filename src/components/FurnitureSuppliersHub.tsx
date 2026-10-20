import React, { useState, useMemo } from 'react';
import {
  Building2,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Zap,
  Star,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Download,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Tag,
  Layers,
  ExternalLink,
  RefreshCw,
  X,
  Check,
  Package,
  Award,
  Factory,
  SlidersHorizontal,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import {
  SupplierProfile,
  FurnitureSupplierCategory,
  ProductData,
  ProductInventoryRecord
} from '../types';
import {
  INITIAL_SUPPLIER_PROFILES,
  getStoredSuppliers,
  saveStoredSuppliers,
  getWhatsAppDeepLink,
  getEffectiveSupplierQuote,
  EGYPTIAN_WAREHOUSES
} from '../data/inventoryData';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface FurnitureSuppliersHubProps {
  products?: ProductData[];
  inventory?: ProductInventoryRecord[];
  onUpdateInventory?: (updated: ProductInventoryRecord[]) => void;
  onShowToast?: (message: string) => void;
  currency?: string;
  onOpenInventory?: () => void;
}

const CATEGORY_TABS: {
  id: 'all' | FurnitureSupplierCategory;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: 'all', label: 'الكل (جميع المصانع والموردين)', icon: '🏢', desc: 'كافة مصانع وموردي الأثاث المعتمدين في مصر' },
  { id: 'bedroom_kids', label: 'غرف النوم والأطفال', icon: '🛏️', desc: 'مصانع الأثاث الخشبي المودرن والكلاسيك وسراير الأطفال (دمياط والمنصورة)' },
  { id: 'living_sofas', label: 'الصالونات والأنتريهات والركنات', icon: '🛋️', desc: 'موردي الإسفنج عالي الكثافة، الأقمشة الوتربروف، وشاسيهات الزان' },
  { id: 'office_institutional', label: 'الأثاث المكتبي والمؤسسي', icon: '💼', desc: 'مكاتب إدارية، كراسي شبك طبية هيدروليك، ودواليب حفظ ملفات' },
  { id: 'kitchen_dining', label: 'مطابخ وغرف طعام', icon: '🍳', desc: 'وحدات HPL وبولي لاك، ترابيزات سفرة زان، إكسسوارات هيدروليك' },
  { id: 'outdoor_decor', label: 'أثاث الحدائق والديكور الخشبي', icon: '🌿', desc: 'أثاث روتان وخيزران، أراجيح حدائق، كونسول وأرفف خشبية' }
];

export const FurnitureSuppliersHub: React.FC<FurnitureSuppliersHubProps> = ({
  products = [],
  inventory = [],
  onUpdateInventory,
  onShowToast,
  currency = 'ج.م',
  onOpenInventory
}) => {
  // Suppliers state
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>(() => getStoredSuppliers());

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<'all' | FurnitureSupplierCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSpeed, setSelectedSpeed] = useState<string>('all');
  const [selectedFactoryType, setSelectedFactoryType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'speed' | 'reliability' | 'name' | 'pricing'>('speed');

  // AI Price Comparison Product selector
  const [comparisonProductId, setComparisonProductId] = useState<string>(() => products[0]?.id || '');
  const [comparisonOrderQty, setComparisonOrderQty] = useState<number>(10);

  // WhatsApp Message Composer Modal
  const [activeWhatsAppSupplier, setActiveWhatsAppSupplier] = useState<SupplierProfile | null>(null);
  const [whatsAppMessageType, setWhatsAppMessageType] = useState<'quote_rfq' | 'urgent_order' | 'catalog_inquiry' | 'visit_request'>('quote_rfq');
  const [customWhatsAppNotes, setCustomWhatsAppNotes] = useState<string>('');

  // Add / Edit Supplier Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('+201');
  const [formCategory, setFormCategory] = useState<FurnitureSupplierCategory>('bedroom_kids');
  const [formCity, setFormCity] = useState<string>('دمياط');
  const [formWarehouse, setFormWarehouse] = useState<string>(EGYPTIAN_WAREHOUSES[0]);
  const [formLeadTimeDays, setFormLeadTimeDays] = useState<number>(2);
  const [formAverageDeliveryDays, setFormAverageDeliveryDays] = useState<number>(2.0);
  const [formDeliveryReliability, setFormDeliveryReliability] = useState<number>(98);
  const [formFactoryType, setFormFactoryType] = useState<'factory' | 'workshop' | 'raw_materials' | 'importer_distributor'>('factory');
  const [formSpeedScore, setFormSpeedScore] = useState<'lightning' | 'fast' | 'moderate' | 'custom_order'>('fast');
  const [formPricingTier, setFormPricingTier] = useState<'budget' | 'competitive' | 'premium' | 'luxury'>('competitive');
  const [formSpecialties, setFormSpecialties] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formIsPreferred, setFormIsPreferred] = useState<boolean>(false);

  // Active product for price comparison
  const activeComparisonProduct = useMemo(() => {
    return products.find(p => p.id === comparisonProductId) || products[0];
  }, [products, comparisonProductId]);

  // Unique cities list for filtering
  const citiesList = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach(s => {
      if (s.city) {
        // extract primary city name e.g. "دمياط" from "دمياط الجديدة"
        const main = s.city.split(' ')[0].replace(/[(]/g, '');
        if (main) set.add(main);
      }
    });
    return Array.from(set);
  }, [suppliers]);

  // Filtered & Sorted suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      // Category filter
      if (selectedCategory !== 'all' && s.category !== selectedCategory) {
        return false;
      }
      // City filter
      if (selectedCity !== 'all' && (!s.city || !s.city.includes(selectedCity))) {
        return false;
      }
      // Speed filter
      if (selectedSpeed !== 'all') {
        if (selectedSpeed === 'lightning' && s.leadTimeDays > 1) return false;
        if (selectedSpeed === 'fast' && (s.leadTimeDays < 2 || s.leadTimeDays > 3)) return false;
        if (selectedSpeed === 'moderate' && s.leadTimeDays < 4) return false;
      }
      // Factory Type filter
      if (selectedFactoryType !== 'all' && s.factoryType !== selectedFactoryType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const text = `${s.name} ${s.city || ''} ${s.categoryArabic || ''} ${s.notes || ''} ${s.phone} ${(s.specialties || []).join(' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'speed') {
        const speedA = a.averageDeliveryDays ?? a.leadTimeDays ?? 3;
        const speedB = b.averageDeliveryDays ?? b.leadTimeDays ?? 3;
        return speedA - speedB; // fastest first
      }
      if (sortBy === 'reliability') {
        return (b.deliveryReliability ?? 95) - (a.deliveryReliability ?? 95); // highest reliability first
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ar');
      }
      if (sortBy === 'pricing') {
        const tierRank = { budget: 1, competitive: 2, premium: 3, luxury: 4 };
        const rankA = tierRank[a.pricingTier || 'competitive'] || 2;
        const rankB = tierRank[b.pricingTier || 'competitive'] || 2;
        return rankA - rankB;
      }
      return 0;
    });
  }, [suppliers, selectedCategory, selectedCity, selectedSpeed, selectedFactoryType, searchQuery, sortBy]);

  // Price comparison across suppliers for the selected product
  const comparisonResults = useMemo(() => {
    if (!activeComparisonProduct) return [];
    const baseWholesale = activeComparisonProduct.estimatedWholesaleCost || Math.round((activeComparisonProduct.currentLowestPrice || 2000) * 0.7);

    // Filter suppliers matching the product category or top matching suppliers
    const matchingSuppliers = suppliers.filter(s => {
      if (selectedCategory !== 'all') return s.category === selectedCategory;
      return true;
    });

    const evaluated = matchingSuppliers.map(s => {
      const quote = getEffectiveSupplierQuote(activeComparisonProduct.id, s, baseWholesale);
      const deliveryDays = s.averageDeliveryDays ?? s.leadTimeDays ?? 2.5;
      const reliability = s.deliveryReliability ?? 95;
      const unitPrice = quote.wholesalePrice;
      const totalCost = unitPrice * comparisonOrderQty;
      const sellingPrice = activeComparisonProduct.currentLowestPrice || Math.round(unitPrice * 1.35);
      const profitPerUnit = Math.max(0, sellingPrice - unitPrice);
      const profitMarginPercent = sellingPrice > 0 ? Math.round((profitPerUnit / sellingPrice) * 100) : 0;

      // Composite Score: 40% price, 35% speed, 25% reliability
      const priceScore = Math.max(0, 100 - ((unitPrice - baseWholesale * 0.9) / baseWholesale) * 100);
      const speedScoreNum = Math.max(0, 100 - (deliveryDays - 1) * 20);
      const compositeScore = Math.round(priceScore * 0.4 + speedScoreNum * 0.35 + reliability * 0.25);

      return {
        supplier: s,
        quote,
        unitPrice,
        totalCost,
        profitMarginPercent,
        deliveryDays,
        reliability,
        compositeScore,
        note: quote.note
      };
    });

    return evaluated.sort((a, b) => b.compositeScore - a.compositeScore);
  }, [suppliers, activeComparisonProduct, comparisonOrderQty, selectedCategory]);

  const bestPriceSupplier = useMemo(() => {
    if (comparisonResults.length === 0) return null;
    return [...comparisonResults].sort((a, b) => a.unitPrice - b.unitPrice)[0];
  }, [comparisonResults]);

  const fastestSupplier = useMemo(() => {
    if (comparisonResults.length === 0) return null;
    return [...comparisonResults].sort((a, b) => a.deliveryDays - b.deliveryDays)[0];
  }, [comparisonResults]);

  const topRecommended = comparisonResults[0] || null;

  // Handle Opening Direct WhatsApp
  const handleOpenWhatsAppDialog = (supp: SupplierProfile) => {
    setActiveWhatsAppSupplier(supp);
    setWhatsAppMessageType('quote_rfq');
    setCustomWhatsAppNotes('');
  };

  const handleSendWhatsApp = () => {
    if (!activeWhatsAppSupplier) return;

    let message = '';
    const suppName = activeWhatsAppSupplier.name;
    const prodTitle = activeComparisonProduct?.title || 'أصناف أثاث منتقاة';

    switch (whatsAppMessageType) {
      case 'quote_rfq':
        message = `السلام عليكم ورحمة الله وبركاته،
تحية طيبة لإدارة مبيعات "${suppName}" المحترمين،
يسرنا التواصل معكم من متجرنا للأثاث بخصوص طلب عرض أسعار جملة رسمي (RFQ):
📦 الصنف المستهدف: ${prodTitle}
🔢 الكمية المقدرة: ${comparisonOrderQty} قطعة / طقم
🏭 مواصفات الخامات المطلوبة: ${activeWhatsAppSupplier.specialties?.slice(0, 3).join('، ') || 'خامات معتمدة طبقا للمواصفات'}
📍 مقر الاستلام / الشحن المطلوب: القاهرة الكبرى / محافظات
${customWhatsAppNotes ? `📝 ملاحظات إضافية: ${customWhatsAppNotes}\n` : ''}
نرجو إفادتنا بأفضل سعر جملة كاش وموعد التوريد المتاح لديكم. شكراً لحسن تعاونكم.`;
        break;

      case 'urgent_order':
        message = `السلام عليكم ورحمة الله،
🚨 أمر توريد عاجل - حساب تجاري للأثاث:
السادة في "${suppName}"،
نود تأكيد رغبتنا في توريد الكمية التالية فورا:
📦 المنتج: ${prodTitle}
🔢 الكمية: ${comparisonOrderQty} وحدة
🚚 نرجو تأكيد إمكانية التجهيز خلال ${activeWhatsAppSupplier.averageDeliveryDays || activeWhatsAppSupplier.leadTimeDays} أيام عمل وإرسال رقم الحساب البنكي / فودافون كاش لجدولة الدفعة.
${customWhatsAppNotes ? `ملاحظات: ${customWhatsAppNotes}` : ''}`;
        break;

      case 'catalog_inquiry':
        message = `مرحباً بحضراتكم في "${suppName}"،
نحن شركة ومتجر أثاث معتمد ونرغب بالاطلاع على أحدث كتالوجات موديلاتكم في فئة (${activeWhatsAppSupplier.categoryArabic || 'الأثاث'}) وقائمة أسعار الجملة المحدثة للموزعين والمعارض.
شكراً جزيلاً.`;
        break;

      case 'visit_request':
        message = `السلام عليكم ورحمة الله،
السادة مسؤولي "${suppName}" في (${activeWhatsAppSupplier.city || 'المنطقة الصناعية'})،
نرغب في تحديد موعد لمعاينة صالة العرض والمصنع وفحص جودة الخامات والتنسيق لشراكة توريد مستمرة.
برجاء إرسال لوكيشن المعرض والمواعيد المتاحة للزيارة.`;
        break;
    }

    const link = getWhatsAppDeepLink(activeWhatsAppSupplier.phone, message);
    safeOpenUrl(link);
    if (onShowToast) {
      onShowToast(`📲 تم فتح تطبيق واتساب للتواصل المباشر مع (${activeWhatsAppSupplier.name})`);
    }
    setActiveWhatsAppSupplier(null);
  };

  // Open Edit Supplier
  const handleStartEdit = (supp: SupplierProfile) => {
    setEditingSupplierId(supp.id);
    setFormName(supp.name);
    setFormPhone(supp.phone);
    setFormCategory(supp.category || 'bedroom_kids');
    setFormCity(supp.city || 'دمياط');
    setFormWarehouse(supp.warehouseLocation || EGYPTIAN_WAREHOUSES[0]);
    setFormLeadTimeDays(supp.leadTimeDays || 2);
    setFormAverageDeliveryDays(supp.averageDeliveryDays ?? supp.leadTimeDays ?? 2.0);
    setFormDeliveryReliability(supp.deliveryReliability ?? 98);
    setFormFactoryType(supp.factoryType || 'factory');
    setFormSpeedScore(supp.speedScore || 'fast');
    setFormPricingTier(supp.pricingTier || 'competitive');
    setFormSpecialties((supp.specialties || []).join('، '));
    setFormNotes(supp.notes || '');
    setFormIsPreferred(!!supp.isPreferred);
    setIsModalOpen(true);
  };

  // Open Add Supplier
  const handleStartAdd = () => {
    setEditingSupplierId(null);
    setFormName('');
    setFormPhone('+201');
    setFormCategory(selectedCategory === 'all' ? 'bedroom_kids' : selectedCategory);
    setFormCity('دمياط');
    setFormWarehouse(EGYPTIAN_WAREHOUSES[0]);
    setFormLeadTimeDays(2);
    setFormAverageDeliveryDays(2.0);
    setFormDeliveryReliability(98);
    setFormFactoryType('factory');
    setFormSpeedScore('fast');
    setFormPricingTier('competitive');
    setFormSpecialties('');
    setFormNotes('');
    setFormIsPreferred(false);
    setIsModalOpen(true);
  };

  // Save Supplier (Add / Edit)
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى إدخال اسم المصنع / المورد ورقم الواتساب');
      return;
    }

    const specialtiesArr = formSpecialties
      .split(/[،,]/)
      .map(s => s.trim())
      .filter(Boolean);

    const catObj = CATEGORY_TABS.find(c => c.id === formCategory);

    let updatedList: SupplierProfile[];

    if (editingSupplierId) {
      updatedList = suppliers.map(s => {
        if (s.id === editingSupplierId) {
          return {
            ...s,
            name: formName.trim(),
            phone: formPhone.trim(),
            category: formCategory,
            categoryArabic: catObj ? catObj.label.split('(')[0].trim() : 'أثاث',
            city: formCity.trim(),
            warehouseLocation: formWarehouse,
            leadTimeDays: Math.max(1, formLeadTimeDays),
            averageDeliveryDays: Math.max(0.5, formAverageDeliveryDays),
            deliveryReliability: Math.min(100, Math.max(60, formDeliveryReliability)),
            factoryType: formFactoryType,
            speedScore: formSpeedScore,
            pricingTier: formPricingTier,
            specialties: specialtiesArr.length > 0 ? specialtiesArr : s.specialties,
            notes: formNotes.trim(),
            isPreferred: formIsPreferred,
            isVerified: true
          };
        }
        return s;
      });
      if (onShowToast) onShowToast(`✅ تم تحديث بيانات المورد (${formName})`);
    } else {
      const newSupplier: SupplierProfile = {
        id: `furn-supp-${Date.now()}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        category: formCategory,
        categoryArabic: catObj ? catObj.label.split('(')[0].trim() : 'أثاث',
        city: formCity.trim(),
        warehouseLocation: formWarehouse,
        leadTimeDays: Math.max(1, formLeadTimeDays),
        averageDeliveryDays: Math.max(0.5, formAverageDeliveryDays),
        deliveryReliability: Math.min(100, Math.max(60, formDeliveryReliability)),
        factoryType: formFactoryType,
        speedScore: formSpeedScore,
        pricingTier: formPricingTier,
        specialties: specialtiesArr,
        notes: formNotes.trim(),
        isPreferred: formIsPreferred,
        isVerified: true
      };
      updatedList = [newSupplier, ...suppliers];
      if (onShowToast) onShowToast(`🎉 تمت إضافة المصنع (${formName}) لدليل الأثاث`);
    }

    setSuppliers(updatedList);
    saveStoredSuppliers(updatedList);
    setIsModalOpen(false);
  };

  // Delete Supplier
  const handleDeleteSupplier = (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف بيانات المصنع / المورد "${name}" من الدليل؟`)) return;
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    saveStoredSuppliers(updated);
    if (onShowToast) onShowToast(`🗑️ تم حذف المورد (${name}) من الدليل`);
  };

  // Link recommended supplier to active inventory item
  const handleLinkSupplierToInventory = (supp: SupplierProfile) => {
    if (!activeComparisonProduct || !onUpdateInventory) return;
    const updatedInventory = inventory.map(item => {
      if (item.productId === activeComparisonProduct.id) {
        return {
          ...item,
          supplierName: supp.name,
          supplierPhone: supp.phone,
          leadTimeDays: supp.leadTimeDays,
          warehouseLocation: supp.warehouseLocation || item.warehouseLocation
        };
      }
      return item;
    });
    onUpdateInventory(updatedInventory);
    if (onShowToast) {
      onShowToast(`🔗 تم ربط المصنع (${supp.name}) بالمنتج (${activeComparisonProduct.title}) في سجل المخزون`);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['اسم المصنع/المورد', 'الفئة', 'المدينة', 'هاتف الواتساب', 'معدل التوريد (أيام)', 'نسبة الالتزام %', 'نوع المنشأة', 'المستودع', 'أبرز الخامات والتخصص', 'ملاحظات'];
    const rows = filteredSuppliers.map(s => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${(s.categoryArabic || s.category || '').replace(/"/g, '""')}"`,
      `"${(s.city || '').replace(/"/g, '""')}"`,
      `"${s.phone}"`,
      s.averageDeliveryDays || s.leadTimeDays,
      `${s.deliveryReliability || 95}%`,
      `"${s.factoryType || 'factory'}"`,
      `"${(s.warehouseLocation || '').replace(/"/g, '""')}"`,
      `"${(s.specialties || []).join(' - ').replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `دليل_موردي_ومصانع_الأثاث_بمصر_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('📥 تم تصدير دليل موردي الأثاث بصيغة CSV بنجاح');
  };

  // Speed Badge Helper
  const renderSpeedBadge = (days: number, score?: string) => {
    if (days <= 1.5 || score === 'lightning') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
          <Zap className="w-3.5 h-3.5 text-sky-500 fill-sky-500 animate-pulse" />
          <span>توريد فوري (24-48 ساعة)</span>
        </span>
      );
    }
    if (days <= 3 || score === 'fast') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>توريد سريع ({days} أيام)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
        <Factory className="w-3.5 h-3.5 text-blue-500" />
        <span>تصنيع بالطلب ({days} أيام)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>دليل معتمد وحصري لقطاع الأثاث والموبيليا في مصر 🇪🇬</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-['Alexandria'] tracking-tight">
              نظام إدارة الموردين ومصانع الأثاث (Suppliers Hub)
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              دليل ذكي ومستقل لمصانع وموردي الأثاث بدمياط، المنصورة، العاشر من رمضان، 6 أكتوبر، والعبور.
              ربط مباشر بـ <strong className="text-emerald-400">WhatsApp API</strong>، ومؤشر تقييم سرعة التوريد ومقارنة الأسعار الفورية لمساعدتك في اختيار أفضل سعر ومصنع بدقة وسرعة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مصنع / مورد جديد</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير الدليل (CSV)</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">المصانع والموردين المسجلين</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-1.5">
              <span>{suppliers.length}</span>
              <span className="text-xs text-indigo-400 font-normal">منشأة معتمدة</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">متوسط سرعة التوريد</span>
            <div className="text-xl sm:text-2xl font-black text-sky-400 mt-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-sky-400" />
              <span>2.1 يوم</span>
              <span className="text-xs text-slate-400 font-normal">معدل قياسي</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">نسبة الالتزام بالمواعيد</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>97.6%</span>
              <span className="text-xs text-slate-400 font-normal">موثوقية دقيقة</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">اتصال مباشر بالواتساب</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 fill-emerald-500" />
              <span>100%</span>
              <span className="text-xs text-slate-400 font-normal">WhatsApp API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs Switcher */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-400 mb-2 px-2">تصفح المصانع والموردين حسب تخصص الأثاث:</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CATEGORY_TABS.map(tab => {
            const count = tab.id === 'all'
              ? suppliers.length
              : suppliers.filter(s => s.category === tab.id).length;
            const isSelected = selectedCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1">{tab.icon}</span>
                <span className="text-xs font-bold leading-tight line-clamp-1">{tab.label.split('(')[0]}</span>
                <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count} مورد
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Price Comparison & AI Factory Matcher */}
      {products.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border-2 border-indigo-200/80 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>مقارنة الأسعار الفورية ومطابقة المصانع بالذكاء الاصطناعي</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Alexandria']">
                اختر أي منتج لمقارنة أسعار الجملة وسرعة التوريد بين المصانع فوراً
              </h3>
            </div>

            {/* Product & Quantity Selector Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <Package className="w-4 h-4 text-slate-400" />
                <select
                  value={comparisonProductId}
                  onChange={(e) => setComparisonProductId(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">الكمية:</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={comparisonOrderQty}
                  onChange={(e) => setComparisonOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-none outline-none text-center"
                />
                <span className="text-xs text-slate-400">قطعة</span>
              </div>
            </div>
          </div>

          {/* AI Decision Cards: Best Price vs Fastest Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Best Wholesale Price */}
            {bestPriceSupplier && (
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-br-xl">
                  أرخص سعر توريد 💰
                </div>
                <div className="pt-2">
                  <span className="text-xs text-slate-400 font-medium">أفضل تكلفة جملة للقطعة:</span>
                  <div className="text-2xl font-black text-emerald-600 mt-0.5">
                    {bestPriceSupplier.unitPrice.toLocaleString()} {currency}
                    <span className="text-xs text-slate-400 font-normal mr-1">/ وحدة</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">
                    {bestPriceSupplier.supplier.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    إجمالي الدفعة ({comparisonOrderQty} قطع): <strong>{bestPriceSupplier.totalCost.toLocaleString()} {currency}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">هامش ربح تقديري:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    +{bestPriceSupplier.profitMarginPercent}%
                  </span>
                </div>
                <button
                  onClick={() => handleOpenWhatsAppDialog(bestPriceSupplier.supplier)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>طلب تسعير بهذا السعر عبر واتساب</span>
                </button>
              </div>
            )}

            {/* 2. Fastest Delivery */}
            {fastestSupplier && (
              <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-xs space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-sky-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-br-xl">
                  الأسرع تسليماً ⚡
                </div>
                <div className="pt-2">
                  <span className="text-xs text-slate-400 font-medium">معدل سرعة التوريد:</span>
                  <div className="text-2xl font-black text-sky-600 mt-0.5 flex items-center gap-1">
                    <Zap className="w-5 h-5 fill-sky-500" />
                    <span>{fastestSupplier.deliveryDays} يوم</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">
                    {fastestSupplier.supplier.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    سعر الوحدة: <strong>{fastestSupplier.unitPrice.toLocaleString()} {currency}</strong> • التزام: <strong>{fastestSupplier.reliability}%</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">الموقع والمستودع:</span>
                  <span className="font-bold text-slate-700 truncate max-w-[150px]">
                    {fastestSupplier.supplier.city}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenWhatsAppDialog(fastestSupplier.supplier)}
                  className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>توريد فوري عبر واتساب</span>
                </button>
              </div>
            )}

            {/* 3. Top AI Composite Match */}
            {topRecommended && (
              <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-xs space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-br-xl">
                  توصية الذكاء الاصطناعي 🏆
                </div>
                <div className="pt-2">
                  <span className="text-xs text-slate-400 font-medium">أفضل توازن سعر + سرعة:</span>
                  <div className="text-2xl font-black text-indigo-700 mt-0.5">
                    {topRecommended.compositeScore}
                    <span className="text-xs text-slate-400 font-normal mr-1">/ 100 نقطة</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">
                    {topRecommended.supplier.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    سعر: <strong>{topRecommended.unitPrice.toLocaleString()} {currency}</strong> • تسليم: <strong>{topRecommended.deliveryDays} يوم</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">نسبة الالتزام:</span>
                  <span className="font-bold text-emerald-600">
                    {topRecommended.reliability}% موثوق
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLinkSupplierToInventory(topRecommended.supplier)}
                    className="py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    ربط بالمخزون
                  </button>
                  <button
                    onClick={() => handleOpenWhatsAppDialog(topRecommended.supplier)}
                    className="py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>طلب توريد</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search, Filters, and Sorting Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، المدينة (دمياط، أكتوبر...)، الخامة (زان، إسفنج...)، أو الهاتف..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                مسح
              </button>
            )}
          </div>

          {/* Filters controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* City Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">جميع المدن والمحافظات</option>
                {citiesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Speed Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedSpeed}
                onChange={(e) => setSelectedSpeed(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">كافة سرعات التوريد</option>
                <option value="lightning">فوري (24-48 ساعة)</option>
                <option value="fast">سريع (2-3 أيام)</option>
                <option value="moderate">تصنيع بالطلب (4+ أيام)</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer"
              >
                <option value="speed">الأسرع توريداً</option>
                <option value="reliability">الأعلى موثوقية والتزاماً</option>
                <option value="pricing">الأرخص سعراً وتنافسية</option>
                <option value="name">أبجدياً بالاسم</option>
              </select>
            </div>
          </div>
        </div>

        {/* Count summary indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            عرض <strong className="text-slate-800">{filteredSuppliers.length}</strong> مصنع ومورد أثاث معتمد
            {selectedCategory !== 'all' && ` في فئة (${CATEGORY_TABS.find(c => c.id === selectedCategory)?.label.split('(')[0]})`}
          </span>

          {(selectedCity !== 'all' || selectedSpeed !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCity('all');
                setSelectedSpeed('all');
                setSearchQuery('');
              }}
              className="text-indigo-600 hover:underline font-bold"
            >
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Supplier & Factory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map(supp => {
          const days = supp.averageDeliveryDays ?? supp.leadTimeDays ?? 2.5;
          const reliability = supp.deliveryReliability ?? 96;

          return (
            <div
              key={supp.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative"
            >
              {/* Card Header: Factory Name, Badge & Location */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {supp.categoryArabic || 'أثاث'}
                      </span>
                      {supp.isPreferred && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-sky-400 text-sky-500" />
                          <span>شريك مفضل</span>
                        </span>
                      )}
                      {supp.isVerified && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>موثق</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {supp.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(supp)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                      title="تعديل المورد"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supp.id, supp.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                      title="حذف المورد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* City & Warehouse */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-700">{supp.city || 'مصر'}</span>
                  <span>•</span>
                  <span className="truncate">{supp.warehouseLocation}</span>
                </div>

                {/* Specialties tags */}
                {supp.specialties && supp.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {supp.specialties.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        {spec}
                      </span>
                    ))}
                    {supp.specialties.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5">
                        +{supp.specialties.length - 3} أخرى
                      </span>
                    )}
                  </div>
                )}

                {/* Notes if present */}
                {supp.notes && (
                  <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {supp.notes}
                  </p>
                )}
              </div>

              {/* Card Footer: Speed Gauge + WhatsApp Direct Button */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {/* Speed Indicator */}
                  <div>
                    {renderSpeedBadge(days, supp.speedScore)}
                  </div>

                  {/* Reliability Meter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-slate-400">الالتزام:</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      {reliability}%
                    </span>
                  </div>
                </div>

                {/* Primary Action Button: Direct WhatsApp API */}
                <button
                  onClick={() => handleOpenWhatsAppDialog(supp)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>اتصال مباشر عبر واتساب (WhatsApp API)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">لا توجد مصانع أو موردين تطابق معايير البحث</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            جرب تغيير الفئة المحددة أو إزالة الكلمات المفتاحية في مربع البحث، أو أضف مورداً جديداً يدوياً.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedCity('all');
              setSelectedSpeed('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all"
          >
            عرض كافة الموردين
          </button>
        </div>
      )}

      {/* WhatsApp Pre-Composed Dispatch Modal */}
      {activeWhatsAppSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 fill-emerald-600 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">اتصال مباشر عبر واتساب</h3>
                  <p className="text-xs text-slate-500">{activeWhatsAppSupplier.name} ({activeWhatsAppSupplier.phone})</p>
                </div>
              </div>
              <button
                onClick={() => setActiveWhatsAppSupplier(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">نوع الرسالة / الغرض من الاتصال:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWhatsAppMessageType('quote_rfq')}
                  className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all cursor-pointer ${
                    whatsAppMessageType === 'quote_rfq'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  📝 طلب عرض سعر رسمي (RFQ)
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsAppMessageType('urgent_order')}
                  className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all cursor-pointer ${
                    whatsAppMessageType === 'urgent_order'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  🚨 أمر توريد عاجل للأثاث
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsAppMessageType('catalog_inquiry')}
                  className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all cursor-pointer ${
                    whatsAppMessageType === 'catalog_inquiry'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  📖 طلب كتالوج وأسعار الجملة
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsAppMessageType('visit_request')}
                  className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all cursor-pointer ${
                    whatsAppMessageType === 'visit_request'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  📍 طلب زيارة المصنع والمعرض
                </button>
              </div>
            </div>

            {/* Custom Notes input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ملاحظات مخصصة تود تضمينها بالرسالة (اختياري):</label>
              <textarea
                rows={2}
                value={customWhatsAppNotes}
                onChange={(e) => setCustomWhatsAppNotes(e.target.value)}
                placeholder="مثال: يرجى تضمين تكلفة الشحن لمستودع أكتوبر مع مواصفات خشب الزان..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveWhatsAppSupplier(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>إرسال وفتح واتساب الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingSupplierId ? 'تعديل بيانات المصنع / المورد' : 'إضافة مصنع / مورد أثاث جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">اسم المصنع / المورد / المعرض *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: مصنع الفهد للأثاث المودرن بدمياط"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">رقم هاتف الواتساب (مسبوق بكود +20) *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+201012345678"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 text-left font-mono"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">فئة وتخصص الأثاث *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="bedroom_kids">غرف النوم والأطفال</option>
                    <option value="living_sofas">الصالونات والأنتريهات والركنات</option>
                    <option value="office_institutional">الأثاث المكتبي والمؤسسي</option>
                    <option value="kitchen_dining">مطابخ وغرف طعام</option>
                    <option value="outdoor_decor">أثاث الحدائق والديكور الخشبي</option>
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">المدينة / المنطقة الصناعية *</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="مثال: دمياط الجديدة / العاشر من رمضان / 6 أكتوبر"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Warehouse Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">موقع المستودع / التسليم</label>
                  <select
                    value={formWarehouse}
                    onChange={(e) => setFormWarehouse(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 bg-white truncate"
                  >
                    {EGYPTIAN_WAREHOUSES.map((wh, idx) => (
                      <option key={idx} value={wh}>{wh}</option>
                    ))}
                  </select>
                </div>

                {/* Lead Time Days */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">معدل التوريد (بالأيام) *</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.5"
                    required
                    value={formAverageDeliveryDays}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 2;
                      setFormAverageDeliveryDays(val);
                      setFormLeadTimeDays(Math.round(val));
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Reliability % */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">نسبة الالتزام بمواعيد الشحن (%) *</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    required
                    value={formDeliveryReliability}
                    onChange={(e) => setFormDeliveryReliability(parseInt(e.target.value) || 95)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Factory Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">نوع المنشأة</label>
                  <select
                    value={formFactoryType}
                    onChange={(e) => setFormFactoryType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="factory">مصنع أثاث معتمد</option>
                    <option value="workshop">ورشة تصنيع متخصصة</option>
                    <option value="raw_materials">مورد خامات ومستلزمات (إسفنج، أخشاب، قماش)</option>
                    <option value="importer_distributor">مستورد وموزع رئيسي</option>
                  </select>
                </div>

                {/* Pricing Tier */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">مستوى الأسعار</label>
                  <select
                    value={formPricingTier}
                    onChange={(e) => setFormPricingTier(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="budget">اقتصادي / أرخص سعر جملة</option>
                    <option value="competitive">منافس مباشر لمعظم المعارض</option>
                    <option value="premium">فاخر / جودة وتشطيب عالي</option>
                    <option value="luxury">ملكي / أويما وقشور مستوردة</option>
                  </select>
                </div>

                {/* Specialties */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">الخامات وأبرز التخصصات (افصل بينها بفاصلة)</label>
                  <input
                    type="text"
                    value={formSpecialties}
                    onChange={(e) => setFormSpecialties(e.target.value)}
                    placeholder="مثال: خشب زان أحمر، ميكانيزم هيدروليك، إسفنج كثافة 33، قماش وتر بروف"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">ملاحظات وشروط التوريد</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="مثال: شحن مجاني للطلبات فوق 20 ألف جنيه، دفع 30% مقدم والباقي عند الاستلام..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Is Preferred */}
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-pref"
                    checked={formIsPreferred}
                    onChange={(e) => setFormIsPreferred(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="chk-pref" className="text-xs font-bold text-slate-700 cursor-pointer">
                    تعيين كمورد ومصنع مفضل للمتجر ⭐
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {editingSupplierId ? 'حفظ التعديلات' : 'إضافة المصنع للدليل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
