import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Flame,
  Bell,
  BellRing,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  ArrowUpDown,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  RefreshCw,
  Download,
  Tag,
  Percent,
  Package,
  Truck,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { ProductData, ProductInventoryRecord } from '../types';
import { safeOpenUrl } from '../utils/safeWindowOpen';

export interface DailySupplierOfferItem {
  id: string;
  productId?: string;
  productTitle: string;
  skuCode: string;
  category: string;
  supplierName: string;
  supplierVerified: boolean;
  supplierHub: 'القاهرة الكبرى والعتبة' | 'مدينة دمياط للأثاث' | 'المنطقة الصناعية 6 أكتوبر' | 'العاشر من رمضان' | 'الإسكندرية والمنطقة الحرة' | 'المنصورة والدلتا';
  supplierPhone: string;
  previousWholesalePrice: number;
  dailyWholesalePrice: number;
  suggestedMarketPrice: number;
  platformExclusiveDiscountPct: number;
  minOrderQty: number;
  availableStockUnits: number;
  deliveryLeadTime: string;
  offerType: 'platform_exclusive' | 'flash_deal' | 'bulk_tier' | 'daily_update';
  offerBadgeText: string;
  expiresInHours: number;
  updatedAtLabel: string;
  promoCode?: string;
}

interface SupplierOffersTabProps {
  products: ProductData[];
  inventory?: ProductInventoryRecord[];
  onUpdateInventory?: (updated: ProductInventoryRecord[]) => void;
  currency?: string;
  onSelectProductForRadar?: (product: ProductData) => void;
  onShowToast?: (message: string) => void;
}

const STORAGE_SUPPLIER_ALERTS_KEY = 'merchant_radar_supplier_offer_alerts_v1';

const INITIAL_SUPPLIER_DAILY_OFFERS: DailySupplierOfferItem[] = [
  {
    id: 'sup-offer-1',
    productTitle: 'ماكينة قهوة إسبريسو ديلونجي ديديكا EC685 — ستانلس ستيل أصلي',
    skuCode: 'DLG-EC685-EG',
    category: 'الأجهزة المنزلية والمطبخ',
    supplierName: 'المجموعة المصرية لتجارة الأجهزة (العتبة / رمسيس)',
    supplierVerified: true,
    supplierHub: 'القاهرة الكبرى والعتبة',
    supplierPhone: '201009823411',
    previousWholesalePrice: 8450,
    dailyWholesalePrice: 7520,
    suggestedMarketPrice: 9350,
    platformExclusiveDiscountPct: 11,
    minOrderQty: 3,
    availableStockUnits: 45,
    deliveryLeadTime: 'توصيل خلال 24 ساعة (القاهرة والجيزة)',
    offerType: 'platform_exclusive',
    offerBadgeText: 'خصم حصري لتجار المنصة 11% 🔥',
    expiresInHours: 14,
    updatedAtLabel: 'منذ 18 دقيقة',
    promoCode: 'RADAR-DLG11'
  },
  {
    id: 'sup-offer-2',
    productTitle: 'كرسي مكتب هيرمان أيرون شبكي طبي متحرك — ظهر عالي ودعم قطني',
    skuCode: 'FUR-CHAIR-PRO9',
    category: 'الأثاث المكتبي والمنزلي',
    supplierName: 'مصنع النور للأثاث المكتبي المتطور (العاشر من رمضان)',
    supplierVerified: true,
    supplierHub: 'العاشر من رمضان',
    supplierPhone: '201064512980',
    previousWholesalePrice: 3650,
    dailyWholesalePrice: 2990,
    suggestedMarketPrice: 4450,
    platformExclusiveDiscountPct: 18,
    minOrderQty: 5,
    availableStockUnits: 120,
    deliveryLeadTime: 'شحن مباشر من المصنع خلال 48 ساعة',
    offerType: 'platform_exclusive',
    offerBadgeText: 'عرض مصنع حصري للمنصة 18% 🏆',
    expiresInHours: 9,
    updatedAtLabel: 'منذ 35 دقيقة',
    promoCode: 'RADAR-FUR18'
  },
  {
    id: 'sup-offer-3',
    productTitle: 'قلاية بدون زيت فيليبس Essential سعة 6.2 لتر ديجيتال XL — HD9280',
    skuCode: 'PHL-HD9280-XL',
    category: 'الأجهزة المنزلية والمطبخ',
    supplierName: 'شركة النيل للاستيراد والتوكيلات التجارية (6 أكتوبر)',
    supplierVerified: true,
    supplierHub: 'المنطقة الصناعية 6 أكتوبر',
    supplierPhone: '201123498765',
    previousWholesalePrice: 5900,
    dailyWholesalePrice: 5190,
    suggestedMarketPrice: 6750,
    platformExclusiveDiscountPct: 12,
    minOrderQty: 4,
    availableStockUnits: 68,
    deliveryLeadTime: 'تسليم فوري من مخازن أكتوبر',
    offerType: 'flash_deal',
    offerBadgeText: 'صفقة اليوم السريعة ⚡',
    expiresInHours: 6,
    updatedAtLabel: 'منذ ساعة واحدة',
    promoCode: 'NIL-FLASH12'
  },
  {
    id: 'sup-offer-4',
    productTitle: 'وحدة تلفزيون مودرن خشب زان طبيعي وكونتر — عرض 180 سم تشطيب دمياطي فاخر',
    skuCode: 'DMT-TVUNIT-180',
    category: 'الأثاث المكتبي والمنزلي',
    supplierName: 'مؤسسة الشناوي للأثاث الدمياطي والتصدير (دمياط - شطا)',
    supplierVerified: true,
    supplierHub: 'مدينة دمياط للأثاث',
    supplierPhone: '201098761234',
    previousWholesalePrice: 4800,
    dailyWholesalePrice: 4080,
    suggestedMarketPrice: 5950,
    platformExclusiveDiscountPct: 15,
    minOrderQty: 2,
    availableStockUnits: 32,
    deliveryLeadTime: 'شحن مبرد ومغلف خلال 48 ساعة',
    offerType: 'platform_exclusive',
    offerBadgeText: 'خصم حصري لتجار رادار مصر 15% 👑',
    expiresInHours: 22,
    updatedAtLabel: 'تحديث اليوم 09:30 ص',
    promoCode: 'DMT-RADAR15'
  },
  {
    id: 'sup-offer-5',
    productTitle: 'ساعة ذكية سامسونج جالكسي Watch 6 Classic مقاس 47 مم بلوتوث',
    skuCode: 'SAM-W6C-47MM',
    category: 'الإلكترونيات والساعات الذكية',
    supplierName: 'تكنو تريد لتوزيع الإلكترونيات (وسط البلد - عبد العزيز)',
    supplierVerified: true,
    supplierHub: 'القاهرة الكبرى والعتبة',
    supplierPhone: '201223344556',
    previousWholesalePrice: 12400,
    dailyWholesalePrice: 11160,
    suggestedMarketPrice: 13890,
    platformExclusiveDiscountPct: 10,
    minOrderQty: 2,
    availableStockUnits: 25,
    deliveryLeadTime: 'توصيل في نفس اليوم داخل القاهرة',
    offerType: 'flash_deal',
    offerBadgeText: 'كوتة محدودة بخصم 10% 🔥',
    expiresInHours: 8,
    updatedAtLabel: 'منذ 45 دقيقة',
    promoCode: 'TECHNO-W6'
  },
  {
    id: 'sup-offer-6',
    productTitle: 'طقم أواني طهي جرانيت تركي 12 قطعة بغطاء بايركس حراري ثقيل',
    skuCode: 'KIT-GRAN-12P',
    category: 'الأجهزة المنزلية والمطبخ',
    supplierName: 'الفتح للاستيراد والأدوات المنزلية (الإسكندرية - المنشية)',
    supplierVerified: true,
    supplierHub: 'الإسكندرية والمنطقة الحرة',
    supplierPhone: '201011223344',
    previousWholesalePrice: 3950,
    dailyWholesalePrice: 3320,
    suggestedMarketPrice: 4650,
    platformExclusiveDiscountPct: 16,
    minOrderQty: 6,
    availableStockUnits: 95,
    deliveryLeadTime: 'شحن للمحافظات خلال 24-48 ساعة',
    offerType: 'bulk_tier',
    offerBadgeText: 'خصم كميات الجملة 16% 📦',
    expiresInHours: 36,
    updatedAtLabel: 'تحديث اليوم 10:15 ص',
    promoCode: 'FATH-BULK16'
  },
  {
    id: 'sup-offer-7',
    productTitle: 'مكتب مدير مودرن حرف L خشب MDF إسباني مقاوم للخدش والمياه 160 سم',
    skuCode: 'FUR-DESK-L160',
    category: 'الأثاث المكتبي والمنزلي',
    supplierName: 'مصانع الدلتا للأثاث المكتبي والفندقي (المنصورة)',
    supplierVerified: true,
    supplierHub: 'المنصورة والدلتا',
    supplierPhone: '201556677889',
    previousWholesalePrice: 6200,
    dailyWholesalePrice: 5270,
    suggestedMarketPrice: 7490,
    platformExclusiveDiscountPct: 15,
    minOrderQty: 2,
    availableStockUnits: 40,
    deliveryLeadTime: 'توريد وتركيب خلال 48 ساعة',
    offerType: 'daily_update',
    offerBadgeText: 'تحديث لستة الجملة اليومية ✅',
    expiresInHours: 48,
    updatedAtLabel: 'تحديث اليوم 08:45 ص'
  }
];

export const SupplierOffersTab: React.FC<SupplierOffersTabProps> = ({
  products,
  inventory = [],
  onUpdateInventory,
  currency = 'ج.م',
  onSelectProductForRadar,
  onShowToast
}) => {
  // Combine dynamic merchant products with verified daily supplier offers
  const allSupplierOffers = useMemo<DailySupplierOfferItem[]>(() => {
    const dynamicFromProducts: DailySupplierOfferItem[] = (products || []).slice(0, 4).map((prod, idx) => {
      const baseWholesale = prod.estimatedWholesaleCost || Math.round(prod.currentLowestPrice * 0.78);
      const discountPct = idx % 2 === 0 ? 14 : 10;
      const discountedWholesale = Math.round(baseWholesale * (1 - discountPct / 100));
      const hubs: DailySupplierOfferItem['supplierHub'][] = [
        'مدينة دمياط للأثاث',
        'القاهرة الكبرى والعتبة',
        'المنطقة الصناعية 6 أكتوبر',
        'العاشر من رمضان'
      ];
      const firstLoc = prod.wholesaleLocations?.[0];

      return {
        id: `prod-sup-offer-${prod.id}`,
        productId: prod.id,
        productTitle: prod.title,
        skuCode: prod.sku || `SKU-${prod.id.slice(0, 6).toUpperCase()}`,
        category: prod.category || 'الأثاث المكتبي والمنزلي',
        supplierName: firstLoc?.marketName || `مورد معتمد — ${prod.brand || 'شبكة تجار مصر'}`,
        supplierVerified: true,
        supplierHub: hubs[idx % hubs.length],
        supplierPhone: firstLoc?.phone?.replace(/[^0-9]/g, '') || '201004567890',
        previousWholesalePrice: baseWholesale,
        dailyWholesalePrice: discountedWholesale,
        suggestedMarketPrice: prod.currentLowestPrice || Math.round(discountedWholesale * 1.28),
        platformExclusiveDiscountPct: discountPct,
        minOrderQty: firstLoc?.minOrderQuantity || 3,
        availableStockUnits: 50 + idx * 15,
        deliveryLeadTime: 'توريد سريع خلال 24 - 48 ساعة',
        offerType: idx === 0 ? 'platform_exclusive' : 'flash_deal',
        offerBadgeText:
          idx === 0
            ? `خصم حصري لتجار المنصة ${discountPct}% 👑`
            : `عرض جملة يومي (-${discountPct}%) ⚡`,
        expiresInHours: 12 + idx * 4,
        updatedAtLabel: 'محدث لحظياً من شبكة الموردين',
        promoCode: `RADAR-VIP${discountPct}`
      };
    });

    return [...dynamicFromProducts, ...INITIAL_SUPPLIER_DAILY_OFFERS];
  }, [products]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [selectedOfferType, setSelectedOfferType] = useState<'all' | 'platform_exclusive' | 'flash_deal' | 'bulk_tier'>('all');
  const [sortBy, setSortBy] = useState<'discount_desc' | 'profit_desc' | 'price_asc'>('discount_desc');
  const [minDiscountAlertThreshold, setMinDiscountAlertThreshold] = useState<number>(12);
  const [isExclusiveAlertEnabled, setIsExclusiveAlertEnabled] = useState<boolean>(true);
  const [subscribedOfferIds, setSubscribedOfferIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUPPLIER_ALERTS_KEY);
      return saved ? JSON.parse(saved) : ['sup-offer-1', 'sup-offer-2', 'sup-offer-4'];
    } catch {
      return ['sup-offer-1', 'sup-offer-2', 'sup-offer-4'];
    }
  });
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(() =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUPPLIER_ALERTS_KEY, JSON.stringify(subscribedOfferIds));
    } catch {
      // safe fallback
    }
  }, [subscribedOfferIds]);

  const toggleOfferAlertSubscription = (offer: DailySupplierOfferItem) => {
    setSubscribedOfferIds((prev) => {
      const exists = prev.includes(offer.id);
      const next = exists ? prev.filter((id) => id !== offer.id) : [...prev, offer.id];
      onShowToast?.(
        exists
          ? `🔕 تم إيقاف تنبيهات عروض المورد لمنتج "${offer.productTitle.slice(0, 30)}..."`
          : `🔔 تم تفعيل التنبيه الفوري عند نزول عروض خاصة أو خصم إضافي من "${offer.supplierName}"!`
      );
      return next;
    });
  };

  const handleRefreshSupplierFeed = () => {
    setIsRefreshingFeed(true);
    setTimeout(() => {
      setIsRefreshingFeed(false);
      const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      setLastRefreshedTime(nowStr);
      onShowToast?.(
        `✅ تم تحديث لستة أسعار الجملة اليومية من شبكة الموردين المعتمدين في مصر (${allSupplierOffers.length} عرض نشط)`
      );
    }, 650);
  };

  const handleSimulateExclusiveOfferNotification = () => {
    const topExclusive =
      allSupplierOffers.find((o) => o.offerType === 'platform_exclusive') || allSupplierOffers[0];
    if (!topExclusive) return;
    const unitProfit = topExclusive.suggestedMarketPrice - topExclusive.dailyWholesalePrice;
    onShowToast?.(
      `🚨 تنبيه عرض مورد حصري: "${topExclusive.supplierName}" خفّض سعر الجملة لـ "${topExclusive.productTitle.slice(0, 28)}..." إلى ${topExclusive.dailyWholesalePrice.toLocaleString()} ${currency} (خصم حصري ${topExclusive.platformExclusiveDiscountPct}% • صافي ربح متوقع: +${unitProfit.toLocaleString()} ${currency}/قطعة) 🔥`
    );
  };

  const handleCopyPromoCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCodeId(id);
    onShowToast?.(`📋 تم نسخ كود خصم المورد الحصري (${code}) لتطبيقه عند الطلب`);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleOrderViaWhatsApp = (offer: DailySupplierOfferItem) => {
    const msg = encodeURIComponent(
      `السلام عليكم (${offer.supplierName})،\nتاجر معتمد من منصة رادار التاجر الذكي مصر 🇪🇬\nأرغب في حجز عرض الجملة اليومي:\n- المنتج: ${offer.productTitle}\n- كود الصنف: ${offer.skuCode}\n- سعر الجملة بالعرض: ${offer.dailyWholesalePrice.toLocaleString()} ${currency} (خصم المنصة ${offer.platformExclusiveDiscountPct}%)\n${offer.promoCode ? `- كود العرض الحصري: ${offer.promoCode}\n` : ''}- الكمية المطلوبة: ${offer.minOrderQty} قطع أو أكثر.\nيرجى تأكيد التوفر وموعد الشحن.`
    );
    safeOpenUrl(`https://wa.me/${offer.supplierPhone}?text=${msg}`);
  };

  const handleQuickRestockWithOffer = (offer: DailySupplierOfferItem) => {
    if (offer.productId && onUpdateInventory && inventory.length > 0) {
      const exists = inventory.some((i) => i.productId === offer.productId);
      if (exists) {
        const updated = inventory.map((rec) =>
          rec.productId === offer.productId
            ? {
                ...rec,
                currentStock: rec.currentStock + offer.minOrderQty,
                lastRestockedAt: 'الآن (عبر عروض الموردين)'
              }
            : rec
        );
        onUpdateInventory(updated);
      }
    }
    onShowToast?.(
      `📦 تم اعتماد أمر توريد (${offer.minOrderQty} وحدات) من "${offer.supplierName}" بسعر الجملة الحصري ${offer.dailyWholesalePrice.toLocaleString()} ${currency}`
    );
  };

  const handleExportSupplierOffersCsv = () => {
    const headers = [
      'كود الصنف',
      'اسم المنتج',
      'المورد المعتمد',
      'المنطقة / المركز',
      'سعر الجملة السابق',
      'سعر الجملة اليومي',
      'نسبة الخصم الحصري',
      'أقل سعر بيع بالسوق',
      'هامش الربح للقطعة',
      'الحد الأدنى للطلب',
      'كود الخصم'
    ];
    const rows = filteredOffers.map((o) => {
      const profit = o.suggestedMarketPrice - o.dailyWholesalePrice;
      return [
        o.skuCode,
        `"${o.productTitle.replace(/"/g, '""')}"`,
        `"${o.supplierName.replace(/"/g, '""')}"`,
        o.supplierHub,
        o.previousWholesalePrice,
        o.dailyWholesalePrice,
        `${o.platformExclusiveDiscountPct}%`,
        o.suggestedMarketPrice,
        profit,
        o.minOrderQty,
        o.promoCode || '-'
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `daily-supplier-offers-egypt-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast?.('📥 تم تصدير قائمة عروض الموردين وأسعار الجملة اليومية بصيغة CSV بنجاح');
  };

  const filteredOffers = useMemo(() => {
    return allSupplierOffers
      .filter((item) => {
        if (selectedHub !== 'all' && item.supplierHub !== selectedHub) return false;
        if (selectedOfferType !== 'all' && item.offerType !== selectedOfferType) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.productTitle.toLowerCase().includes(q) ||
            item.supplierName.toLowerCase().includes(q) ||
            item.skuCode.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'discount_desc') {
          return b.platformExclusiveDiscountPct - a.platformExclusiveDiscountPct;
        }
        if (sortBy === 'profit_desc') {
          const profitA = a.suggestedMarketPrice - a.dailyWholesalePrice;
          const profitB = b.suggestedMarketPrice - b.dailyWholesalePrice;
          return profitB - profitA;
        }
        return a.dailyWholesalePrice - b.dailyWholesalePrice;
      });
  }, [allSupplierOffers, selectedHub, selectedOfferType, searchQuery, sortBy]);

  // Summary metrics
  const stats = useMemo(() => {
    const exclusiveCount = allSupplierOffers.filter((o) => o.offerType === 'platform_exclusive').length;
    const matchingAlertThreshold = allSupplierOffers.filter(
      (o) => o.platformExclusiveDiscountPct >= minDiscountAlertThreshold
    ).length;
    const avgDiscount =
      allSupplierOffers.length > 0
        ? Math.round(
            allSupplierOffers.reduce((acc, o) => acc + o.platformExclusiveDiscountPct, 0) /
              allSupplierOffers.length
          )
        : 0;
    const maxProfitPerUnit = allSupplierOffers.reduce((max, o) => {
      const p = o.suggestedMarketPrice - o.dailyWholesalePrice;
      return p > max ? p : max;
    }, 0);

    return { exclusiveCount, matchingAlertThreshold, avgDiscount, maxProfitPerUnit };
  }, [allSupplierOffers, minDiscountAlertThreshold]);

  const hubsList: DailySupplierOfferItem['supplierHub'][] = [
    'القاهرة الكبرى والعتبة',
    'مدينة دمياط للأثاث',
    'المنطقة الصناعية 6 أكتوبر',
    'العاشر من رمضان',
    'الإسكندرية والمنطقة الحرة',
    'المنصورة والدلتا'
  ];

  return (
    <div id="supplier-offers-tab-container" className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Top Hero Header & Live Alert Radar Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/90 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>شبكة الموردين المعتمدين في مصر 🇪🇬</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold">
                تحديث يومي مباشر • آخر مزامنة: {lastRefreshedTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-['Alexandria'] tracking-tight text-white">
              عروض الموردين وأسعار الجملة اليومية الحصرية
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              قائمة محدثة لحظة بلحظة بأسعار الجملة اليومية من المصانع والوكلاء المعتمدين في (القاهرة، العتبة، دمياط، 6 أكتوبر، العاشر من رمضان، والإسكندرية) مع نظام تنبيه ذكي فور توفر خصومات حصرية لتجار المنصة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-refresh-supplier-offers"
              onClick={handleRefreshSupplierFeed}
              disabled={isRefreshingFeed}
              className="h-9 px-3.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 shrink-0 ${isRefreshingFeed ? 'animate-spin' : ''}`} />
              <span>{isRefreshingFeed ? 'جاري تحديث اللستة...' : 'تحديث أسعار اليوم'}</span>
            </button>

            <button
              type="button"
              id="btn-test-supplier-offer-alert"
              onClick={handleSimulateExclusiveOfferNotification}
              className="h-9 px-3.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black font-['Alexandria'] whitespace-nowrap flex items-center gap-1.5 justify-center shadow-lg shadow-sky-500/20 transition-all cursor-pointer active:scale-95"
            >
              <BellRing className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
              <span>اختبار تنبيه عرض حصري 🔔</span>
            </button>

            <button
              type="button"
              id="btn-export-supplier-offers-csv"
              onClick={handleExportSupplierOffersCsv}
              className="h-9 px-3.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black font-['Alexandria'] whitespace-nowrap flex items-center gap-1.5 justify-center shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>تصدير لستة الجملة (CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-bold">إجمالي عروض الجملة اليومية</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                {allSupplierOffers.length} <span className="text-xs font-normal text-emerald-400">عرض نشط</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-sky-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-sky-300 font-bold">خصومات حصرية لتجار المنصة</div>
              <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-1">
                {stats.exclusiveCount} <span className="text-xs font-normal text-sky-200">عرض VIP 👑</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-300 font-bold">متوسط التوفير عن الجملة العادية</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                {stats.avgDiscount}% <span className="text-xs font-normal text-emerald-200">خصم مباشر</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Percent className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-purple-300 font-bold">أعلى هامش ربح متوقع للقطعة</div>
              <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono mt-1">
                +{stats.maxProfitPerUnit.toLocaleString()} <span className="text-xs font-normal">{currency}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Smart Supplier Offer Alert Configuration Bar (تنبيهات العروض الخاصة والخصومات الحصرية) */}
      <div
        id="supplier-exclusive-alerts-panel"
        className="bg-slate-900/95 border border-sky-500/40 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300 shrink-0">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white font-['Alexandria']">
                رادار التنبيه الذكي للعروض الخاصة والخصومات الحصرية للمنصة
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                {isExclusiveAlertEnabled ? `مفعّل (${subscribedOfferIds.length} مورد مراقب) 🔔` : 'متوقف مؤقتاً 🔕'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              يُرسل إشعاراً فورياً عند قيام أي مورد معتمد بطرح خصم حصري لتجار المنصة يتجاوز{' '}
              <strong className="text-sky-300 font-mono">{minDiscountAlertThreshold}%</strong> ({stats.matchingAlertThreshold}{' '}
              عروض تطابق شرط التنبيه الآن).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300 font-bold">حد التنبيه للخصم:</span>
            {[10, 12, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  setMinDiscountAlertThreshold(pct);
                  onShowToast?.(`🎯 تم ضبط تنبيه عروض الموردين عند خصم ${pct}% فأكثر`);
                }}
                className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs cursor-pointer transition-all ${
                  minDiscountAlertThreshold === pct
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {pct}%+
              </button>
            ))}
          </div>

          <button
            type="button"
            id="btn-toggle-exclusive-supplier-alerts"
            onClick={() => {
              const next = !isExclusiveAlertEnabled;
              setIsExclusiveAlertEnabled(next);
              onShowToast?.(
                next
                  ? '🔔 تم تفعيل التنبيه التلقائي للعروض الخاصة والخصومات الحصرية من الموردين'
                  : '🔕 تم إيقاف التنبيه التلقائي لعروض الموردين مؤقتاً'
              );
            }}
            className={`h-10 px-4 rounded-xl text-xs font-black font-['Alexandria'] flex items-center gap-2 transition-all cursor-pointer border ${
              isExclusiveAlertEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{isExclusiveAlertEnabled ? 'التنبيهات الحصرية مفعّلة ✓' : 'تفعيل التنبيهات الحصرية'}</span>
          </button>
        </div>
      </div>

      {/* Search, Hub Filter & Offer Type Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-supplier-offers"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المنتج، كود SKU، اسم المصنع أو المورد، أو الفئة..."
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs font-bold outline-none transition-colors"
            />
          </div>

          {/* Offer Type Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'كل العروض اليومية' },
              { id: 'platform_exclusive', label: 'خصومات حصرية للمنصة 👑' },
              { id: 'flash_deal', label: 'صفقات سريعة ⚡' },
              { id: 'bulk_tier', label: 'خصومات الكميات 📦' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedOfferType(tab.id as any)}
                className={`h-9 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedOfferType === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              id="select-sort-supplier-offers"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none cursor-pointer"
            >
              <option value="discount_desc">الأعلى خصماً حصرياً (%)</option>
              <option value="profit_desc">الأعلى هامش ربح للقطعة ({currency})</option>
              <option value="price_asc">الأقل سعر جملة يومي</option>
            </select>
          </div>
        </div>

        {/* Regional Wholesale Hubs Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scroller-sm pt-1">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>مركز التوريد:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedHub('all')}
            className={`h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center cursor-pointer transition-all ${
              selectedHub === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>جميع المراكز ({allSupplierOffers.length})</span>
          </button>
          {hubsList.map((hub) => (
            <button
              key={hub}
              type="button"
              onClick={() => setSelectedHub(hub)}
              className={`h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center cursor-pointer transition-all ${
                selectedHub === hub
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{hub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Wholesale Offers Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOffers.map((offer) => {
          const isSubscribed = subscribedOfferIds.includes(offer.id);
          const unitProfit = offer.suggestedMarketPrice - offer.dailyWholesalePrice;
          const profitMarginPct = Math.round((unitProfit / offer.suggestedMarketPrice) * 100);
          const isHighExclusive = offer.platformExclusiveDiscountPct >= minDiscountAlertThreshold;

          return (
            <div
              key={offer.id}
              id={`supplier-offer-card-${offer.id}`}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between gap-4 bg-slate-900/95 shadow-xl ${
                offer.offerType === 'platform_exclusive'
                  ? 'border-sky-500/50 hover:border-sky-400'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Badges & Alert Bell */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 ${
                        offer.offerType === 'platform_exclusive'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                          : offer.offerType === 'flash_deal'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/50'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{offer.offerBadgeText}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                      {offer.skuCode}
                    </span>

                    {isHighExclusive && isExclusiveAlertEnabled && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        يطابق شرط التنبيه الذكي ✓
                      </span>
                    )}
                  </div>

                  {/* Individual Offer Alert Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleOfferAlertSubscription(offer)}
                    className={`h-8 px-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSubscribed
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title="تفعيل أو إيقاف تنبيه العروض الخاصة لهذا المورد"
                  >
                    {isSubscribed ? (
                      <>
                        <BellRing className="w-3.5 h-3.5 text-sky-400" />
                        <span>مُنبّه نشط</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>تنبيهي بالعروض</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Product Title & Supplier Info */}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-['Alexandria'] leading-snug">
                    {offer.productTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-300">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{offer.supplierName}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{offer.supplierHub}</span>
                    </span>
                  </div>
                </div>

                {/* Pricing & Profit Breakdown Box */}
                <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">سعر الجملة اليومي</div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                        {offer.dailyWholesalePrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">{currency}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-through font-mono">
                      السابق: {offer.previousWholesalePrice.toLocaleString()} {currency}
                    </div>
                  </div>

                  <div className="border-r border-slate-800 pr-2.5">
                    <div className="text-[10px] text-slate-400 font-bold">أقل سعر بيع بالسوق</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-sm sm:text-base font-black text-white font-mono">
                        {offer.suggestedMarketPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">{currency}</span>
                    </div>
                    <div className="text-[10px] text-sky-300 font-bold">
                      خصم المورد: -{offer.platformExclusiveDiscountPct}%
                    </div>
                  </div>

                  <div className="border-r border-slate-800 pr-2.5">
                    <div className="text-[10px] text-emerald-300 font-bold">صافي ربح التاجر / قطعة</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                        +{unitProfit.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-300">{currency}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      هامش ربح: {profitMarginPct}% 📈
                    </div>
                  </div>
                </div>

                {/* Logistics & Promo Code Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 pt-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-indigo-400" />
                      <span>أقل كمية (MOQ):</span>
                      <strong className="text-white font-mono">{offer.minOrderQty} قطع</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{offer.deliveryLeadTime}</span>
                    </span>
                    <span className="flex items-center gap-1 text-sky-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ينتهي خلال {offer.expiresInHours} ساعة</span>
                    </span>
                  </div>

                  {offer.promoCode && (
                    <button
                      type="button"
                      onClick={() => handleCopyPromoCode(offer.id, offer.promoCode!)}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                      title="نسخ كود الخصم الحصري لتجار المنصة"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{offer.promoCode}</span>
                      {copiedCodeId === offer.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOrderViaWhatsApp(offer)}
                    className="h-9 px-3.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black font-['Alexandria'] whitespace-nowrap flex items-center gap-1.5 justify-center shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>حجز العرض عبر واتساب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRestockWithOffer(offer)}
                    className="h-9 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>توريد للمخزون ({offer.minOrderQty}+)</span>
                  </button>
                </div>

                {offer.productId && onSelectProductForRadar && (
                  <button
                    type="button"
                    onClick={() => {
                      const found = products.find((p) => p.id === offer.productId);
                      if (found) onSelectProductForRadar(found);
                    }}
                    className="h-8 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center border border-slate-700 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>فحص بالرادار</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
