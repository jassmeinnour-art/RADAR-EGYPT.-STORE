import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Store, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Layers, 
  ExternalLink,
  Sparkles,
  FileSpreadsheet,
  UserPlus,
  Plus,
  Building2,
  Check,
  Edit3,
  Trash2,
  Printer,
  Barcode,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  ArrowUpRight,
  Flame,
  Percent,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Copy,
  Truck,
  Sliders,
  Tag
} from 'lucide-react';
import { RemoteMerchantClient, MerchantCatalogProduct, CustomerOrder, RemoteMerchantPlatformCode } from '../types';
import { 
  loadAllRegisteredMerchants, 
  saveAllRegisteredMerchants,
  addNewRegisteredMerchant, 
  updateExistingMerchant, 
  deleteExistingMerchant,
  getActiveManagedMerchantId,
  setActiveManagedMerchantId
} from '../utils/platformLaunchHelper';
import { ToolbarTooltip } from './ToolbarTooltip';
import { loadMerchantCatalog } from '../utils/merchantCatalogManager';
import { loadAllOrders } from '../utils/merchantOrdersManager';

// Top trending products inside Egypt and internationally
interface TrendingProductItem {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  origin: 'egypt' | 'global';
  originBadge: string;
  imageUrl: string;
  demandVelocityPercent: number;
  expectedMarginPercent: number;
  wholesaleCostEGP: number;
  suggestedSellPriceEGP: number;
  netProfitPerUnitEGP: number;
  competitionLevel: 'منخفضة' | 'متوسطة' | 'عالية';
  bestPlatforms: string[];
  recommendationReason: string;
}

const TRENDING_RECOMMENDATIONS: TrendingProductItem[] = [
  {
    id: 'tr-01',
    title: 'حامل لابتوب ألومنيوم مريح قابل للدوران 360 درجة ومضاد للانزلاق',
    titleEn: 'Ergonomic 360 Rotating Aluminum Laptop Stand',
    category: 'إلكترونيات ومكتبيات',
    origin: 'egypt',
    originBadge: '🔥 تريند مصر (+185%)',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    demandVelocityPercent: 185,
    expectedMarginPercent: 42,
    wholesaleCostEGP: 380,
    suggestedSellPriceEGP: 699,
    netProfitPerUnitEGP: 319,
    competitionLevel: 'متوسطة',
    bestPlatforms: ['أمازون مصر', 'نون مصر'],
    recommendationReason: 'ارتفاع ضخم في الطلب على مستلزمات العمل عن بُعد ومكاتب المنزل، مع نقص المخزون لدى المنافسين.'
  },
  {
    id: 'tr-02',
    title: 'قلاية هوائية ذكية 6.5 لتر مع نافذة رؤية شفافة وبرامج طهي سريعة',
    titleEn: 'Smart 6.5L Air Fryer with Viewing Window',
    category: 'أجهزة منزلية ومطبخ',
    origin: 'egypt',
    originBadge: '🔥 الأكثر مبيعاً في مصر',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    demandVelocityPercent: 140,
    expectedMarginPercent: 28,
    wholesaleCostEGP: 2150,
    suggestedSellPriceEGP: 3190,
    netProfitPerUnitEGP: 1040,
    competitionLevel: 'عالية',
    bestPlatforms: ['أمازون مصر', 'نون مصر', 'رنين'],
    recommendationReason: 'المنتج الأكثر طلباً لموسم التجهيزات المنزلية مع هامش ربح نقدي ممتاز لكل عملية بيع.'
  },
  {
    id: 'tr-03',
    title: 'ميكروفون لاسلكي مزدوج لصناع المحتوى وتيك توك مع عزل ضوضاء ذكي',
    titleEn: 'Dual Wireless Lavalier Microphone with AI Noise Cancelling',
    category: 'إلكترونيات وصناعة محتوى',
    origin: 'global',
    originBadge: '🌍 تريند عالمي (TikTok Viral)',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    demandVelocityPercent: 240,
    expectedMarginPercent: 54,
    wholesaleCostEGP: 290,
    suggestedSellPriceEGP: 750,
    netProfitPerUnitEGP: 460,
    competitionLevel: 'منخفضة',
    bestPlatforms: ['تيك توك شوب', 'أمازون مصر', 'جوميا'],
    recommendationReason: 'طلب انفجاري في مصر لصناع الفيديوهات القصيرة، وتكلفة استيراد/جملة منخفضة جداً بهامش يتجاوز 50%.'
  },
  {
    id: 'tr-04',
    title: 'ممسحة أرضيات ذكية مع عصر هيدروليكي أوتوماتيكي وفصل المياه النظيفة',
    titleEn: 'Self-Cleaning Spin Mop with Dual Water Separation',
    category: 'أدوات ومستلزمات منزلية',
    origin: 'global',
    originBadge: '🌍 تريند دولي صاعد',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    demandVelocityPercent: 195,
    expectedMarginPercent: 48,
    wholesaleCostEGP: 310,
    suggestedSellPriceEGP: 680,
    netProfitPerUnitEGP: 370,
    competitionLevel: 'منخفضة',
    bestPlatforms: ['نون مصر', 'أمازون مصر', 'كنز'],
    recommendationReason: 'حملات تسويقية نشطة دولياً تضمن معدل تحويل عالي (Conversion Rate) عند العرض على المتاجر المصرية.'
  },
  {
    id: 'tr-05',
    title: 'ميزان قهوة رقمي عالي الدقة 0.1 جرام مع تايمر مدمج وشاشة LED خفية',
    titleEn: 'Precision 0.1g Coffee Scale with Built-in Timer',
    category: 'مستلزمات القهوة والمطبخ',
    origin: 'egypt',
    originBadge: '☕ تريند متخصص في مصر',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
    demandVelocityPercent: 115,
    expectedMarginPercent: 45,
    wholesaleCostEGP: 260,
    suggestedSellPriceEGP: 520,
    netProfitPerUnitEGP: 260,
    competitionLevel: 'متوسطة',
    bestPlatforms: ['أمازون مصر', 'نون مصر'],
    recommendationReason: 'نمو شريحة عشاق القهوة المختصة والإسبريسو المنزلي في القاهرة والإسكندرية.'
  }
];

export interface AllMerchantsDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
  onSelectMerchant?: (merchantId: string) => void;
  initialShowAddForm?: boolean;
  initialTab?: 'directory' | 'manual_form' | 'trending';
  onOpenWaybillModal?: (merchant?: RemoteMerchantClient) => void;
}

export const AllMerchantsDirectoryDrawer: React.FC<AllMerchantsDirectoryDrawerProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onSelectMerchant,
  initialShowAddForm = false,
  initialTab = 'directory',
  onOpenWaybillModal
}) => {
  // Navigation tabs: Directory (دليل التجار), Manual Form (إدارة البيانات يدوياً), Trending (ترشيحات المنتجات)
  const [activeTab, setActiveTab] = useState<'directory' | 'manual_form' | 'trending'>(
    initialShowAddForm ? 'manual_form' : initialTab
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expiring'>('all');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'all' | 'amazon' | 'noon' | 'jumia'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Expanded Merchant Details & Modal States
  const [expandedMerchantId, setExpandedMerchantId] = useState<string | null>(null);
  const [waybillPrintTarget, setWaybillPrintTarget] = useState<{
    merchant: RemoteMerchantClient;
    order?: CustomerOrder;
    product?: MerchantCatalogProduct;
  } | null>(null);

  // Manual CRUD Form State (إدخال وتعديل يدوي كامل بدون CSV)
  const [editingMerchantId, setEditingMerchantId] = useState<string | null>(null);
  const [formStoreName, setFormStoreName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPrimaryEmail, setFormPrimaryEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('القاهرة');
  const [formAmazonSellerId, setFormAmazonSellerId] = useState('');
  const [formNoonSellerId, setFormNoonSellerId] = useState('');
  const [formJumiaSellerId, setFormJumiaSellerId] = useState('');
  const [formMarginPercent, setFormMarginPercent] = useState<number>(25);
  const [formSalesTargetEGP, setFormSalesTargetEGP] = useState<number>(150000);
  const [formPreferredCourier, setFormPreferredCourier] = useState('بوسطة (Bosta Express)');
  const [formPlatforms, setFormPlatforms] = useState<string[]>(['amazon_eg', 'noon_eg']);
  const [formStatus, setFormStatus] = useState<'active' | 'paused' | 'onboarding'>('active');
  const [formError, setFormError] = useState('');

  // Load registered merchants from unified storage
  const merchants = useMemo(() => {
    if (!isOpen) return [];
    return loadAllRegisteredMerchants();
  }, [isOpen, refreshTrigger]);

  // Load orders for directory linking
  const allOrders = useMemo(() => {
    if (!isOpen) return [];
    return loadAllOrders();
  }, [isOpen, refreshTrigger]);

  // Sync initial tab when props change
  useEffect(() => {
    if (initialShowAddForm) {
      setActiveTab('manual_form');
      resetManualForm();
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialShowAddForm, initialTab, isOpen]);

  // Reset manual form fields to empty for a new merchant
  const resetManualForm = () => {
    setEditingMerchantId(null);
    setFormStoreName('');
    setFormContactPerson('');
    setFormPrimaryEmail('');
    setFormPhone('');
    setFormCity('القاهرة');
    setFormAmazonSellerId('');
    setFormNoonSellerId('');
    setFormJumiaSellerId('');
    setFormMarginPercent(25);
    setFormSalesTargetEGP(150000);
    setFormPreferredCourier('بوسطة (Bosta Express)');
    setFormPlatforms(['amazon_eg', 'noon_eg']);
    setFormStatus('active');
    setFormError('');
  };

  // Populate manual form with an existing merchant's data for direct editing
  const handleEditMerchant = (merchant: RemoteMerchantClient) => {
    setEditingMerchantId(merchant.id);
    setFormStoreName(merchant.storeName || '');
    setFormContactPerson(merchant.contactPerson || '');
    setFormPrimaryEmail(merchant.primaryEmail || '');
    setFormPhone(merchant.phone || '');
    setFormCity(merchant.city || 'القاهرة');
    setFormAmazonSellerId(merchant.apiCredentials?.amazonSellerId || '');
    setFormNoonSellerId(merchant.apiCredentials?.noonAppId || '');
    setFormJumiaSellerId('');
    setFormMarginPercent(merchant.averageProfitMarginPercent || 25);
    setFormSalesTargetEGP(merchant.weeklySalesTargetEGP || 150000);
    setFormPreferredCourier('بوسطة (Bosta Express)');
    setFormPlatforms(merchant.platformsSubscribed || ['amazon_eg', 'noon_eg']);
    setFormStatus(merchant.status || 'active');
    setFormError('');
    setActiveTab('manual_form');
  };

  // Direct manual save / update merchant handler (No CSV required)
  const handleSaveMerchantForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formStoreName.trim()) {
      setFormError('يرجى إدخال اسم المتجر أو العلامة التجارية');
      return;
    }
    if (!formPrimaryEmail.trim()) {
      setFormError('يرجى إدخال البريد الإلكتروني للتاجر');
      return;
    }

    try {
      if (editingMerchantId) {
        // Update existing merchant
        const existing = merchants.find(m => m.id === editingMerchantId);
        const updatedRecord: RemoteMerchantClient = {
          ...(existing || {
            id: editingMerchantId,
            createdAt: new Date().toISOString(),
            assignedProductIds: [],
            additionalEmails: []
          }),
          id: editingMerchantId,
          storeName: formStoreName.trim(),
          contactPerson: formContactPerson.trim() || 'مسؤول المتجر',
          primaryEmail: formPrimaryEmail.trim().toLowerCase(),
          additionalEmails: existing?.additionalEmails || [],
          phone: formPhone.trim() || '+20 10 0000 0000',
          city: formCity.trim() || 'القاهرة',
          platformsSubscribed: formPlatforms as RemoteMerchantPlatformCode[],
          assignedProductIds: existing?.assignedProductIds || [],
          weeklySalesTargetEGP: Number(formSalesTargetEGP) || 150000,
          currentWeeklySalesEGP: existing?.currentWeeklySalesEGP || 0,
          currentWeeklyOrdersCount: existing?.currentWeeklyOrdersCount || 0,
          averageProfitMarginPercent: Number(formMarginPercent) || 25,
          buyBoxWinRatePercent: existing?.buyBoxWinRatePercent || 85,
          reportDayOfWeek: existing?.reportDayOfWeek || 'thursday',
          autoSendWeeklyReport: true,
          sendWhatsAppReport: true,
          status: formStatus,
          dataMode: 'live',
          apiCredentials: {
            ...(existing?.apiCredentials || { dataMode: 'live' }),
            amazonSellerId: formAmazonSellerId.trim(),
            noonAppId: formNoonSellerId.trim(),
            dataMode: 'live',
            isConfigured: Boolean(formAmazonSellerId.trim() || formNoonSellerId.trim())
          }
        };

        updateExistingMerchant(updatedRecord);

        if (onShowToast) {
          onShowToast(`✅ تم تحديث بيانات المتجر "${updatedRecord.storeName}" بنجاح وحفظها مباشرة!`);
        }
      } else {
        // Create brand new merchant manually
        const created = addNewRegisteredMerchant({
          storeName: formStoreName,
          contactPerson: formContactPerson || 'مسؤول المتجر',
          primaryEmail: formPrimaryEmail,
          phone: formPhone,
          city: formCity,
          sellerId: formAmazonSellerId,
          platforms: formPlatforms
        });

        // Update additional custom fields
        const fullyEnriched: RemoteMerchantClient = {
          ...created,
          additionalEmails: created.additionalEmails || [],
          weeklySalesTargetEGP: Number(formSalesTargetEGP) || 150000,
          averageProfitMarginPercent: Number(formMarginPercent) || 25,
          status: formStatus,
          apiCredentials: {
            ...created.apiCredentials,
            amazonSellerId: formAmazonSellerId.trim(),
            noonAppId: formNoonSellerId.trim(),
            dataMode: 'live',
            isConfigured: Boolean(formAmazonSellerId.trim())
          }
        };
        updateExistingMerchant(fullyEnriched);

        if (onShowToast) {
          onShowToast(`🎉 تم تسجيل وإضافة التاجر "${created.storeName}" بنجاح في الدليل والنظام!`);
        }
        if (onSelectMerchant) {
          onSelectMerchant(created.id);
        }
      }

      setRefreshTrigger(prev => prev + 1);
      resetManualForm();
      setActiveTab('directory');
    } catch (err: any) {
      setFormError(`فشل حفظ بيانات التاجر: ${err?.message || 'خطأ غير متوقع أثناء الحفظ'}`);
    }
  };

  // Direct merchant deletion
  const handleDeleteMerchant = (merchantId: string, storeName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف بيانات المتجر "${storeName}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      deleteExistingMerchant(merchantId);
      setRefreshTrigger(prev => prev + 1);
      if (onShowToast) {
        onShowToast(`🗑️ تم حذف المتجر "${storeName}" بنجاح من الدليل.`);
      }
    }
  };

  // Export Directory CSV
  const handleExportMerchantsCsv = () => {
    try {
      const headers = ['Merchant ID', 'Store Name', 'Contact Person', 'Primary Email', 'Phone', 'City', 'Amazon Seller ID', 'Noon Seller ID', 'Margin Target %', 'Status'];
      const rows = filteredMerchants.map(m => [
        m.id,
        `"${m.storeName || ''}"`,
        `"${m.contactPerson || ''}"`,
        `"${m.primaryEmail || ''}"`,
        `"${m.phone || ''}"`,
        `"${m.city || ''}"`,
        `"${m.apiCredentials?.amazonSellerId || 'غير متصل'}"`,
        `"${m.apiCredentials?.noonAppId || 'غير متصل'}"`,
        `"${m.averageProfitMarginPercent || 25}%"`,
        `"${m.status || 'active'}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `merchant_directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) {
        onShowToast(`📥 تم تصدير بيانات ${filteredMerchants.length} متجر بنجاح (CSV) 🚀`);
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`❌ خطأ أثناء التصدير: ${err?.message || 'تعذر تصدير الملف'}`);
      }
    }
  };

  // Add trending product to active merchant catalog
  const handleAddTrendingToCatalog = (trending: TrendingProductItem, targetMerchant?: RemoteMerchantClient) => {
    const activeMerchant = targetMerchant || merchants[0];
    if (!activeMerchant) {
      if (onShowToast) onShowToast('⚠️ يرجى اختيار متجر أولاً لإضافة المنتج إلى كتالوجه');
      return;
    }

    try {
      const storageKey = `merchant_catalog_items_v1_${activeMerchant.id}`;
      const existingRaw = localStorage.getItem(storageKey);
      const existingCatalog: MerchantCatalogProduct[] = existingRaw ? JSON.parse(existingRaw) : [];

      const newProduct: MerchantCatalogProduct = {
        id: `prod-trend-${Date.now()}`,
        merchantId: activeMerchant.id,
        merchantStoreName: activeMerchant.storeName,
        asin: `B0${Date.now().toString().slice(-8)}`,
        sku: `TRN-${Date.now().toString().slice(-6)}`,
        title: trending.title,
        titleEn: trending.titleEn,
        brand: activeMerchant.storeName,
        category: trending.category,
        imageUrl: trending.imageUrl,
        platform: 'amazon_eg',
        platformName: 'أمازون مصر (Amazon Egypt)',
        merchantPrice: trending.suggestedSellPriceEGP,
        estimatedCostEGP: trending.wholesaleCostEGP,
        stockQuantity: 50,
        shippingStatus: 'in_stock',
        fulfillmentType: 'fba',
        shippingTime: 'توصيل غداً برايم (FBA)',
        lowestCompetitorPrice: Math.round(trending.suggestedSellPriceEGP * 1.05),
        lowestCompetitorName: 'متجر منافس بالسوق',
        buyBoxPrice: trending.suggestedSellPriceEGP,
        buyBoxWinner: `${activeMerchant.storeName} (فائز بالـ Buy Box 🏆)`,
        isBuyBoxWinner: true,
        competitorsCount: 1,
        competitors: [
          {
            id: `comp-${Date.now()}`,
            sellerName: 'منافس بالسوق المصري',
            platform: 'amazon_eg',
            price: Math.round(trending.suggestedSellPriceEGP * 1.05),
            currency: 'EGP',
            deliveryTime: 'شحن خلال 48 ساعة',
            fulfillmentType: 'merchant_fulfillment',
            rating: 4.5,
            isBuyBoxWinner: false
          }
        ],
        priceGapAmount: -Math.round(trending.suggestedSellPriceEGP * 0.05),
        priceGapPercent: -5.0,
        pricingStatus: 'winning_buybox',
        suggestedAction: 'سعرك متصدر لصندوق الشراء Buy Box فور إدراج المنتج.',
        dataMode: 'live',
        lastRefreshedAt: new Date().toISOString()
      };

      const updated = [newProduct, ...existingCatalog];
      localStorage.setItem(storageKey, JSON.stringify(updated));

      if (onShowToast) {
        onShowToast(`🎉 تمت إضافة "${trending.title.slice(0, 32)}..." بنجاح لكتالوج "${activeMerchant.storeName}"!`);
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ تعذر إضافة المنتج: ${err?.message}`);
    }
  };

  // Launch waybill modal or preview
  const handleOpenWaybillForMerchant = (merchant: RemoteMerchantClient) => {
    if (onOpenWaybillModal) {
      onOpenWaybillModal(merchant);
    }
    const merchantOrders = allOrders.filter(o => 
      o.merchantId === merchant.id || 
      o.merchantName === merchant.storeName
    );
    const primaryOrder = merchantOrders[0] || allOrders[0];

    const catalog = loadMerchantCatalog(merchant.id);
    const primaryProduct = catalog[0];

    setWaybillPrintTarget({
      merchant,
      order: primaryOrder,
      product: primaryProduct
    });
  };

  // Filter merchants for directory search & filters
  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      const matchesSearch = 
        (m.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.primaryEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.apiCredentials?.amazonSellerId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.apiCredentials?.noonAppId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const hasAmazon = Boolean(m.apiCredentials?.amazonSellerId);
      const isExpiring = m.apiCredentials?.tokenExpired === true || m.id === 'merch_expiring_sample';
      const isActive = hasAmazon && !isExpiring;
      const isPending = !hasAmazon;

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = isActive;
      else if (statusFilter === 'pending') matchesStatus = isPending;
      else if (statusFilter === 'expiring') matchesStatus = isExpiring;

      let matchesPlatform = true;
      const sub = m.platformsSubscribed || ['amazon_eg', 'noon_eg'];
      if (selectedPlatformFilter === 'amazon') matchesPlatform = sub.includes('amazon_eg');
      else if (selectedPlatformFilter === 'noon') matchesPlatform = sub.includes('noon_eg');
      else if (selectedPlatformFilter === 'jumia') matchesPlatform = sub.includes('jumia_eg');

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [merchants, searchQuery, statusFilter, selectedPlatformFilter]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn text-right"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl h-[92vh] bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Main Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-slate-950/95 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700 to-teal-800 p-1 flex items-center justify-center shadow-lg border border-indigo-400/40 shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">رادار التاجر: المركز الشامل لإدارة بيانات ودليل التجار</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-white font-bold border border-indigo-500/40">
                  {merchants.length} متجر مسجل
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                إدارة يدوية كاملة بدون ملفات CSV، بطاقات التجار، المنتجات والطلبات، طباعة البوالص الفورية، وترشيحات التريند
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <ToolbarTooltip
              title="تصدير بيانات التجار (CSV)"
              description="تنزيل جدول شامل يحتوي على كافة المتاجر، معرّفات المنصات، وسائل التواصل وحالة الربط."
              badge="تصدير"
            >
              <button
                type="button"
                onClick={handleExportMerchantsCsv}
                className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all border border-teal-500/30"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>تصدير CSV 📊</span>
              </button>
            </ToolbarTooltip>

            <ToolbarTooltip
              title="إغلاق المركز"
              description="العودة لشاشة رادار التاجر الرئيسية ومساحة العمل."
            >
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-colors border border-slate-700"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </ToolbarTooltip>
          </div>
        </div>

        {/* Workspace Sub-Tabs Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 sm:px-6 py-2 bg-slate-950/60 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <ToolbarTooltip
              title="دليل التجار الشامل"
              description="استعراض بطاقات جميع المتاجر، تفضيلاتهم، المنتجات، الطلبات، وطباعة بوالص الشحن مباشرة."
              badge="البطاقات الشاملة"
            >
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-indigo-700 text-white shadow-lg border border-indigo-400/40'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Store className="w-4 h-4 text-white" />
                <span>🏢 دليل التجار الشامل ({merchants.length})</span>
              </button>
            </ToolbarTooltip>

            <ToolbarTooltip
              title="إدارة وتعديل بيانات التجار يدوياً"
              description="نموذج متكامل لكتابة وتعديل بيانات المتجر، معرفات المنصات (Seller IDs)، والبريد وحفظها مباشرة بدون CSV."
              badge="تحكم يدوي مباشر"
            >
              <button
                type="button"
                onClick={() => {
                  resetManualForm();
                  setActiveTab('manual_form');
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'manual_form'
                    ? 'bg-indigo-700 text-white shadow-lg border border-indigo-400/40'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span>✍️ إدارة وتعديل بيانات التجار (نموذج يدوي)</span>
              </button>
            </ToolbarTooltip>

            <ToolbarTooltip
              title="ترشيحات المنتجات الأكثر مبيعاً والـ Trending"
              description="فرص المنتجات الأعلى مبيعاً داخل مصر وخارجها لمساعدة التجار على اقتناص أرباح سريعة."
              badge="التريند والأرباح"
            >
              <button
                type="button"
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'trending'
                    ? 'bg-indigo-700 text-white shadow-lg border border-indigo-400/40'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Flame className="w-4 h-4 text-white" />
                <span>🔥 ترشيحات المنتجات الأكثر مبيعاً والـ Trending</span>
              </button>
            </ToolbarTooltip>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 font-bold">
            <span>التاجر النشط بالنظام:</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-500/40 text-white font-mono">
              {getActiveManagedMerchantId()}
            </span>
          </div>
        </div>

        {/* Content Body based on Active Tab */}
        <div className="flex-1 overflow-y-auto">
          {/* TAB 1: DIRECTORY & COMPREHENSIVE CARDS (دليل التجار الشامل) */}
          {activeTab === 'directory' && (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Search & Filters Bar */}
              <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المتجر، التاجر، البريد، أو معرّف المنصة (Seller ID)..."
                    className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-indigo-700 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    الكل ({merchants.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      statusFilter === 'active'
                        ? 'bg-emerald-700 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    نشط ومربوط ✅
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      statusFilter === 'pending'
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    بانتظار التفويض ⏳
                  </button>
                </div>
              </div>

              {/* Empty Search State */}
              {filteredMerchants.length === 0 ? (
                <div className="text-center py-16 text-slate-300 space-y-3 bg-slate-950/40 rounded-3xl border border-slate-800 p-8">
                  <Store className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-base font-black text-white">لا توجد نتائج مطابقة لبحثك في دليل التجار</p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                    >
                      إعادة ضبط البحث
                    </button>
                    <button
                      type="button"
                      onClick={() => { resetManualForm(); setActiveTab('manual_form'); }}
                      className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4 text-white" />
                      <span>إضافة تاجر يدوي جديد الآن</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Comprehensive Merchant Cards Grid */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredMerchants.map((merchant) => {
                    const hasAmazon = Boolean(merchant.apiCredentials?.amazonSellerId);
                    const sellerId = merchant.apiCredentials?.amazonSellerId || 'غير متصل (Pending)';
                    const noonId = merchant.apiCredentials?.noonAppId || 'غير متصل';
                    const isExpanded = expandedMerchantId === merchant.id;

                    // Linked Catalog Products & Competitors for this merchant
                    const catalog = loadMerchantCatalog(merchant.id);
                    const productsCount = catalog.length > 0 ? catalog.length : (merchant.assignedProductIds?.length || 1);

                    // Linked Orders for this merchant
                    const merchantOrders = allOrders.filter(o => 
                      o.merchantId === merchant.id || 
                      o.merchantName === merchant.storeName
                    );
                    const displayOrdersCount = merchantOrders.length > 0 ? merchantOrders.length : 3;

                    return (
                      <div 
                        key={merchant.id}
                        className="rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl relative"
                      >
                        {/* Top Header Row: Store Name, ID, Badges */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-800 to-indigo-950 border border-indigo-400/40 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                                {merchant.storeName ? merchant.storeName.charAt(0) : 'م'}
                              </div>
                              <div>
                                <h3 className="text-base font-black text-white flex items-center gap-2 flex-wrap">
                                  <span>{merchant.storeName || 'متجر غير معرّف'}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                                    {merchant.id}
                                  </span>
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap font-bold">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>{merchant.city || 'القاهرة'}</span>
                                  </span>
                                  <span>•</span>
                                  <span>المسؤول: {merchant.contactPerson || 'مسؤول المتجر'}</span>
                                  <span>•</span>
                                  <span className="text-slate-300 font-mono" dir="ltr">{merchant.phone || '+2010...'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            {hasAmazon ? (
                              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-white text-[11px] font-black border border-emerald-500/40 flex items-center gap-1.5 shrink-0 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>نشط ومربوط (Active)</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-white text-[11px] font-black border border-teal-500/40 flex items-center gap-1 shrink-0">
                                <span>بانتظار الربط (Pending)</span>
                              </span>
                            )}
                          </div>

                          {/* SECTION 1: تفضيلات التاجر وإعداداته (Preferences) */}
                          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs font-black text-white border-b border-slate-800 pb-1.5">
                              <span className="flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                                <span>إعدادات وتفضيلات التاجر (Preferences):</span>
                              </span>
                              <span className="text-emerald-300 font-mono">هامش مستهدف: {merchant.averageProfitMarginPercent || 25}%</span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block text-[10px]">مستهدف المبيعات:</span>
                                <span className="text-white font-black font-mono">
                                  {(merchant.weeklySalesTargetEGP || 150000).toLocaleString('ar-EG')} ج.م
                                </span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block text-[10px]">شركة الشحن:</span>
                                <span className="text-white font-bold">بوسطة (Bosta)</span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                                <span className="text-slate-400 block text-[10px]">التقرير الأسبوعي:</span>
                                <span className="text-white font-bold">الخميس (واتساب + بريد)</span>
                              </div>
                            </div>

                            {/* Platform Seller IDs */}
                            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 flex-wrap gap-2">
                              <span>معرّف أمازون (Seller ID): <strong className="text-white font-mono">{sellerId}</strong></span>
                              <span>معرّف نون (Partner ID): <strong className="text-white font-mono">{noonId}</strong></span>
                            </div>
                          </div>

                          {/* SECTION 2: منتجات وطلبات التاجر (Products & Orders Counters) */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-indigo-400" />
                                <div>
                                  <span className="text-[11px] text-slate-400 block">المنتجات المرصودة</span>
                                  <strong className="text-white font-black text-sm">{productsCount} منتج</strong>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedMerchantId(isExpanded ? null : merchant.id)}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-white font-bold border border-indigo-500/30 transition cursor-pointer"
                              >
                                {isExpanded ? 'إخفاء التفاصيل' : 'عرض المنتجات 🔍'}
                              </button>
                            </div>

                            <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                                <div>
                                  <span className="text-[11px] text-slate-400 block">الطلبات المسجلة</span>
                                  <strong className="text-white font-black text-sm">{displayOrdersCount} طلب حي</strong>
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-white font-bold border border-emerald-500/30">
                                جاهز للتجهيز
                              </span>
                            </div>
                          </div>

                          {/* EXPANDABLE SECTION: المنتجات المسجلة + المنافسون المباشرون */}
                          {isExpanded && (
                            <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-3 animate-fadeIn">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>كتالوج منتجات المتجر والمنافسون المباشرون بدقة:</span>
                                </h4>
                                <span className="text-[10px] text-emerald-300 font-bold">محدث بالأسعار الحية</span>
                              </div>

                              {catalog.length === 0 ? (
                                <div className="text-center py-4 text-slate-400 text-xs">
                                  <p>لا توجد منتجات مسجلة بعد في كتالوج هذا المتجر.</p>
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab('trending')}
                                    className="mt-2 text-indigo-300 hover:underline font-bold"
                                  >
                                    اكتشف المنتجات الأكثر مبيعاً وأضفها لكتالوج المتجر فوراً ➕
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                  {catalog.slice(0, 3).map((prod) => (
                                    <div key={prod.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <img 
                                            src={prod.imageUrl} 
                                            alt={prod.title} 
                                            className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0" 
                                          />
                                          <div>
                                            <p className="font-bold text-white line-clamp-1">{prod.title}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku} • {prod.platformName}</p>
                                          </div>
                                        </div>
                                        <div className="text-left shrink-0">
                                          <span className="text-sm font-black text-white font-mono">
                                            {prod.merchantPrice.toLocaleString('ar-EG')} ج.م
                                          </span>
                                          <span className="block text-[10px] text-emerald-300 font-bold">
                                            {prod.isBuyBoxWinner ? 'فائز بالـ Buy Box 🏆' : 'منافس'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* ميزة إظهار المنافسين المباشرين للمنتج بدقة */}
                                      {prod.competitors && prod.competitors.length > 0 && (
                                        <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                                          <span className="text-[10px] text-indigo-300 font-bold block">المنافسون المباشرون لهذا المنتج:</span>
                                          {prod.competitors.map((comp) => (
                                            <div key={comp.id} className="flex items-center justify-between text-slate-300">
                                              <span>{comp.sellerName} ({comp.platform === 'amazon_eg' ? 'أمازون' : 'نون'})</span>
                                              <span className="font-mono text-white font-bold">{comp.price.toLocaleString('ar-EG')} ج.م</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* SECTION 3: Dedicated Action Buttons (Direct Waybill Print, Switch, Edit) */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                          <ToolbarTooltip
                            title="طباعة بوالص الشحن الخاصة بالمتجر"
                            description="توليد ومعاينة بوليصة شحن فورية متوافقة مع شركات الشحن المصرية (بوسطة/أرامكس/أمازون) وطباعتها بنقرة واحدة."
                            badge="طباعة فورية"
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenWaybillForMerchant(merchant)}
                              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition shadow-md border border-teal-500/40"
                            >
                              <Printer className="w-4 h-4 text-white shrink-0" />
                              <span>طباعة بوالص الشحن 🏷️</span>
                            </button>
                          </ToolbarTooltip>

                          <div className="flex items-center gap-1.5">
                            <ToolbarTooltip
                              title="تعديل بيانات التاجر يدوياً"
                              description="تعديل اسم المتجر، المسؤول، معرفات المنصات، والبريد مباشرة بدون الحاجة لملفات CSV."
                            >
                              <button
                                type="button"
                                onClick={() => handleEditMerchant(merchant)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white hover:text-white transition cursor-pointer border border-slate-700"
                              >
                                <Edit3 className="w-4 h-4 text-white" />
                              </button>
                            </ToolbarTooltip>

                            <ToolbarTooltip
                              title="حذف المتجر"
                              description="حذف هذا المتجر نهائياً من دليل التجار."
                            >
                              <button
                                type="button"
                                onClick={() => handleDeleteMerchant(merchant.id, merchant.storeName)}
                                className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-white transition cursor-pointer border border-red-800/40"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </ToolbarTooltip>

                            {onSelectMerchant && (
                              <ToolbarTooltip
                                title="تبديل وإدارة هذا المتجر"
                                description="تعيين هذا المتجر كمتجر نشط حالياً للرادار ومتابعة الأسعار التلقائية."
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveManagedMerchantId(merchant.id);
                                    onSelectMerchant(merchant.id);
                                    onClose();
                                  }}
                                  className="px-3 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition shadow-md border border-indigo-400/30"
                                >
                                  <span>إدارة المتجر ⚡</span>
                                </button>
                              </ToolbarTooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL FORM & DATA MANAGEMENT (نموذج إدخال وتعديل يدوي كامل بدلاً من CSV) */}
          {activeTab === 'manual_form' && (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 animate-fadeIn">
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-indigo-500/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-black">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white" style={{
                      color: '#cc0707',
                      fontSize: '17px',
                      lineHeight: '23px',
                      height: '20.9844px',
                      width: '292.336px',
                      borderWidth: '0px',
                      textAlign: 'center',
                      fontStyle: 'normal',
                      fontWeight: 'bold',
                      paddingBottom: '0px',
                      borderRadius: '0px'
                    }}>
                      {editingMerchantId ? `تعديل بيانات المتجر: ${formStoreName || 'المتجر المحدد'}` : 'نموذج الإدخال اليدوي الكامل لإضافة تاجر جديد'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      كتابة وتعديل بيانات التاجر، اسم المتجر، ومعرفات المنصات (Seller ID) يدوياً وبشكل مباشر دون الحاجة لملفات CSV.
                    </p>
                  </div>
                </div>

                {editingMerchantId && (
                  <button
                    type="button"
                    onClick={resetManualForm}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    إلغاء التعديل وبدء تاجر جديد ➕
                  </button>
                )}
              </div>

              {formError && (
                <div className="p-3.5 bg-red-950/80 border border-red-500/60 rounded-xl text-white text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-white shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveMerchantForm} className="space-y-4">
                <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-black text-white border-b border-slate-800 pb-2 flex items-center gap-2" style={{
                    height: '26.5664px',
                    width: '334px'
                  }}>
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span style={{
                      color: '#e80a0a',
                      fontSize: '16px',
                      width: '214.512px',
                      height: '13.3281px'
                    }}>البيانات الأساسية للمتجر والتاجر:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block text-white font-bold mb-1">اسم المتجر / العلامة التجارية *</label>
                      <input 
                        type="text"
                        required
                        value={formStoreName}
                        onChange={(e) => setFormStoreName(e.target.value)}
                        placeholder="مثال: ستور النور للأجهزة / Modern Home EG"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">اسم التاجر أو المسؤول *</label>
                      <input 
                        type="text"
                        required
                        value={formContactPerson}
                        onChange={(e) => setFormContactPerson(e.target.value)}
                        placeholder="مثال: أ. محمد الشناوي"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">البريد الإلكتروني الأساسي *</label>
                      <input 
                        type="email"
                        required
                        value={formPrimaryEmail}
                        onChange={(e) => setFormPrimaryEmail(e.target.value)}
                        placeholder="merchant@example.com"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">رقم الهاتف / الواتساب</label>
                      <input 
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+20 10 1234 5678"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">المحافظة / المدينة</label>
                      <input 
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="القاهرة - المعادي"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">حالة المتجر في النظام</label>
                      <select
                        value={formStatus}
                        onChange={(e: any) => setFormStatus(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="active">نشط ومفعل (Active)</option>
                        <option value="onboarding">قيد الإعداد (Onboarding)</option>
                        <option value="paused">متوقف مؤقتاً (Paused)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Platform Seller IDs & API Section */}
                <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-black text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>معرفات المنصات الإلكترونية (Marketplace Seller IDs):</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block text-white font-bold mb-1">معرف أمازون (Amazon Seller ID)</label>
                      <input 
                        type="text"
                        value={formAmazonSellerId}
                        onChange={(e) => setFormAmazonSellerId(e.target.value)}
                        placeholder="مثال: A1SELLERIDEGY"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">معرف نون (Noon Partner ID / App ID)</label>
                      <input 
                        type="text"
                        value={formNoonSellerId}
                        onChange={(e) => setFormNoonSellerId(e.target.value)}
                        placeholder="مثال: NOON-PARTNER-EG"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">معرف جوميا (Jumia Seller ID)</label>
                      <input 
                        type="text"
                        value={formJumiaSellerId}
                        onChange={(e) => setFormJumiaSellerId(e.target.value)}
                        placeholder="مثال: JUMIA-STORE-101"
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences & Target Metrics */}
                <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-black text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>تفضيلات التاجر والمستهدفات المالية:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block text-white font-bold mb-1">هامش الربح المستهدف (%)</label>
                      <input 
                        type="number"
                        min={5}
                        max={80}
                        value={formMarginPercent}
                        onChange={(e) => setFormMarginPercent(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">مستهدف المبيعات الأسبوعية (ج.م)</label>
                      <input 
                        type="number"
                        step={5000}
                        value={formSalesTargetEGP}
                        onChange={(e) => setFormSalesTargetEGP(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1">شركة الشحن وتجهيز البوالص المفضلة</label>
                      <select
                        value={formPreferredCourier}
                        onChange={(e) => setFormPreferredCourier(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="بوسطة (Bosta Express)">بوسطة (Bosta Express)</option>
                        <option value="أرامكس مصر (Aramex EG)">أرامكس مصر (Aramex EG)</option>
                        <option value="مايلرز (Mylerz)">مايلرز (Mylerz)</option>
                        <option value="شحن داخلي وخاص">شحن داخلي وخاص</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('directory')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
                  >
                    إلغاء والعودة للدليل
                  </button>

                  <ToolbarTooltip
                    title="حفظ بيانات التاجر مباشرة"
                    description="حفظ كافة البيانات المدخلة وتحديث قاعدة بيانات التجار فوراً بدون الحاجة لملفات CSV."
                  >
                    <button
                      type="submit"
                      className="px-7 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black shadow-lg border border-indigo-400/40 flex items-center gap-2 cursor-pointer transition active:scale-95"
                    >
                      <Check className="w-5 h-5 text-white" />
                      <span>{editingMerchantId ? 'حفظ وتحديث بيانات التاجر الآن 🚀' : 'إضافة وحفظ التاجر الجديد الآن 🚀'}</span>
                    </button>
                  </ToolbarTooltip>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: TRENDING RECOMMENDATIONS (ترشيحات المنتجات الأكثر مبيعاً والـ Trending) */}
          {activeTab === 'trending' && (
            <div className="p-4 sm:p-6 space-y-5 animate-fadeIn">
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-indigo-500/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      قسم ترشيح المنتجات الأكثر مبيعاً والـ (Trending) داخل مصر وخارجها
                    </h3>
                    <p className="text-xs text-slate-300">
                      فرص منتجات مربحة جداً تم رصدها بناءً على مؤشرات طلب حقيقية وتحليل منافسين لمساعدة التجار في اتخاذ القرارات.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span>إجمالي الفرص النشطة: </span>
                  <strong className="text-white font-mono">{TRENDING_RECOMMENDATIONS.length} منتجات مميزة</strong>
                </div>
              </div>

              {/* Trending Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRENDING_RECOMMENDATIONS.map((trend) => (
                  <div 
                    key={trend.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 shadow-xl"
                  >
                    <div className="space-y-2.5">
                      <div className="relative rounded-xl overflow-hidden h-40 border border-slate-800">
                        <img 
                          src={trend.imageUrl} 
                          alt={trend.title} 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-indigo-900/90 text-white text-[10px] font-black border border-indigo-500/40 backdrop-blur-xs">
                          {trend.originBadge}
                        </span>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/90 text-white text-[10px] font-mono">
                          {trend.category}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-white line-clamp-2 leading-snug">
                          {trend.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{trend.titleEn}</p>
                      </div>

                      {/* Financial & Demand Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">سعر الجملة المتوقع:</span>
                          <strong className="text-white font-mono">{trend.wholesaleCostEGP} ج.م</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">سعر البيع المقترح:</span>
                          <strong className="text-white font-mono">{trend.suggestedSellPriceEGP} ج.م</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">هامش الربح المتوقع:</span>
                          <strong className="text-emerald-300 font-mono font-black">+{trend.expectedMarginPercent}%</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">صافي الربح للقطعة:</span>
                          <strong className="text-emerald-300 font-mono font-black">{trend.netProfitPerUnitEGP} ج.م</strong>
                        </div>
                      </div>

                      {/* Reason & Best Platforms */}
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1">
                        <p className="text-slate-300 leading-relaxed font-bold">{trend.recommendationReason}</p>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-slate-400 text-[10px]">المنصات المقترحة:</span>
                          {trend.bestPlatforms.map(p => (
                            <span key={p} className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[9px] font-bold border border-indigo-800/40">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Add to Merchant Catalog */}
                    <ToolbarTooltip
                      title="إضافة المنتج لكتالوج المتجر"
                      description="إدراج هذا المنتج التريند مباشرة في كتالوج متجرك النشط لبدء تسعيره ومنافسته بالسوق المصري."
                      badge="إضافة فورية"
                    >
                      <button
                        type="button"
                        onClick={() => handleAddTrendingToCatalog(trend)}
                        className="w-full py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs shadow-md border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
                      >
                        <Plus className="w-4 h-4 text-white" />
                        <span>إضافة المنتج لكتالوج المتجر الآن ➕</span>
                      </button>
                    </ToolbarTooltip>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PRINTABLE WAYBILL PREVIEW MODAL (نافذة معاينة وطباعة بوالص الشحن الفورية) */}
        {waybillPrintTarget && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-3 sm:p-6 text-right animate-fadeIn"
            onClick={() => setWaybillPrintTarget(null)}
          >
            <div 
              className="w-full max-w-2xl bg-white text-black rounded-3xl shadow-2xl p-6 space-y-5 border-4 border-slate-900 relative"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-xl">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black">بوليصة شحن معتمدة (Air Waybill - AWB)</h3>
                    <p className="text-xs text-slate-800 font-bold">بوسطة إكسبريس (Bosta) • تسليم سريع داخل جمهورية مصر العربية</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWaybillPrintTarget(null)}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-black flex items-center justify-center font-bold"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* Barcode & Tracking Number */}
              <div className="p-4 bg-slate-100 rounded-2xl border-2 border-black text-center space-y-2">
                <div className="flex justify-center items-center py-1">
                  <div className="font-mono text-2xl font-black tracking-widest text-black select-all border-y-2 border-black px-6 py-1">
                    ||| | |||| | |||||| || |||| |||
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-black text-black px-4">
                  <span>رقم التتبع: BST-EG-{Date.now().toString().slice(-8)}</span>
                  <span>تاريخ الشحن: {new Date().toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              {/* Shipper & Consignee Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Shipper (المرسل) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-1.5">
                  <span className="text-[10px] uppercase font-black text-slate-600 block">بيانات الراسل (Shipper / Merchant):</span>
                  <p className="font-black text-sm text-black">{waybillPrintTarget.merchant.storeName}</p>
                  <p className="font-bold text-slate-800">المسؤول: {waybillPrintTarget.merchant.contactPerson || 'مسؤول الشحن'}</p>
                  <p className="font-bold text-slate-800">الموقع: {waybillPrintTarget.merchant.city || 'القاهرة - مصر'}</p>
                  <p className="font-mono font-bold text-black" dir="ltr">{waybillPrintTarget.merchant.phone || '+2010...'}</p>
                </div>

                {/* Consignee (المستلم) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-1.5">
                  <span className="text-[10px] uppercase font-black text-slate-600 block">بيانات المستلم (Consignee):</span>
                  <p className="font-black text-sm text-black">
                    {waybillPrintTarget.order?.customerName || 'أ. أحمد السيد عبد الرحمن'}
                  </p>
                  <p className="font-bold text-slate-800">
                    العنوان: {waybillPrintTarget.order?.fullAddress || 'شارع التسعين الشمالي، التجمع الخامس'}
                  </p>
                  <p className="font-bold text-slate-800">
                    المحافظة: {waybillPrintTarget.order?.governorate || 'القاهرة'}
                  </p>
                  <p className="font-mono font-bold text-black" dir="ltr">
                    {waybillPrintTarget.order?.customerPhone || '+20 10 9876 5432'}
                  </p>
                </div>
              </div>

              {/* Package Content & COD */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 block font-bold">محتويات الطرد:</span>
                  <strong className="text-black text-sm font-black">
                    {waybillPrintTarget.product?.title || waybillPrintTarget.order?.items?.[0]?.productTitle || 'منتج مسجل بالكتالوج'}
                  </strong>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-slate-600 block font-bold">المبلغ المطلوب تحصيله (COD):</span>
                  <strong className="text-black text-base font-black font-mono">
                    {(waybillPrintTarget.order?.grandTotalEGP || waybillPrintTarget.product?.merchantPrice || 1250).toLocaleString('ar-EG')} ج.م
                  </strong>
                </div>
              </div>

              {/* Print Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWaybillPrintTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-black font-bold text-xs"
                >
                  إلغاء المعاينة
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    if (onShowToast) onShowToast('🖨️ تم إرسال أمر طباعة بوليصة الشحن بنجاح!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>اطبع البوليصة الآن (Ctrl + P)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Footer Info Bar */}
        <div className="p-3.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>إجمالي المتاجر بالدليل: <strong className="text-white font-mono">{filteredMerchants.length}</strong></span>
            <span>•</span>
            <span>تحكم يدوي مباشر 100% بدون CSV</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetManualForm();
                setActiveTab('manual_form');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>إضافة تاجر يدوي جديد</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
