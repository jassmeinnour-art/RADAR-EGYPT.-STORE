import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  ExternalLink, 
  SlidersHorizontal, 
  Tag, 
  Store, 
  AlertTriangle, 
  Filter, 
  ShieldCheck, 
  Zap, 
  X,
  Clock,
  Layers,
  Check,
  Percent,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Truck,
  FileSpreadsheet,
  Trash2,
  DollarSign,
  Gift,
  Award,
  Radio,
  Flame,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, MerchantOffer } from '../types';
import { loadStoredLiveProducts, AUTHENTIC_AMAZON_EG_ASIN_SPECS_ARRAY } from '../services/livePlatformProductSync';
import { useAudioNotifications } from '../context/AudioNotificationContext';
import { PriceComparisonEngine } from './PriceComparisonEngine';

export interface DiscountPriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  basePrice: number;
  targetPrice: number;
  discountThresholdPercent: number;
  createdAt: string;
  isTriggered: boolean;
  triggeredAt?: string;
  lastLowestPrice?: number;
}

interface RealTimePriceComparisonCenterProps {
  currency?: string;
  onShowToast?: (message: string) => void;
  onSelectActiveTrader?: (trader: any) => void;
}

const STORAGE_ALERTS_KEY = 'radar_realtime_discount_alerts_v1';

export const RealTimePriceComparisonCenter: React.FC<RealTimePriceComparisonCenterProps> = ({
  currency = 'ج.م',
  onShowToast,
  onSelectActiveTrader
}) => {
  const { playPriceAlertSound, playCompetitorStatusSound } = useAudioNotifications();

  // Mode: 'comparison' (Live Multi-Merchant Matrix) vs 'csv_engine' (CSV Gap Tool)
  const [activeViewMode, setActiveViewMode] = useState<'comparison' | 'csv_engine'>('comparison');

  // Products catalog
  const [products, setProducts] = useState<ProductData[]>(() => {
    try {
      const stored = loadStoredLiveProducts();
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch {}
    return AUTHENTIC_AMAZON_EG_ASIN_SPECS_ARRAY;
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    return products[0]?.id || 'B09STSTEEL1';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'lowest' | 'savings' | 'offers_count' | 'rating'>('savings');

  // Discount Alerts System State
  const [alerts, setAlerts] = useState<DiscountPriceAlert[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_ALERTS_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return [];
  });

  // Modal State for Subscribing to Discount Alerts
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [alertProduct, setAlertProduct] = useState<ProductData | null>(null);
  const [selectedDiscountPercent, setSelectedDiscountPercent] = useState<number>(10);
  const [customTargetPrice, setCustomTargetPrice] = useState<string>('');
  const [isSubmittingAlert, setIsSubmittingAlert] = useState<boolean>(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);

  // Active Deals Feed simulation
  const [isSimulatingDrop, setIsSimulatingDrop] = useState<boolean>(false);
  const [lastTriggeredDeal, setLastTriggeredDeal] = useState<{ product: ProductData; newPrice: number; discountPercent: number; merchantName: string } | null>(null);

  // Listen for live updates
  useEffect(() => {
    const handleLiveUpdate = (e: any) => {
      if (e.detail?.products && Array.isArray(e.detail.products)) {
        setProducts(e.detail.products);
      }
    };
    window.addEventListener('merchant_radar_live_products_updated', handleLiveUpdate);
    return () => window.removeEventListener('merchant_radar_live_products_updated', handleLiveUpdate);
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(alerts));
      }
    } catch (e) {
      console.warn('Could not save discount alerts:', e);
    }
  }, [alerts]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;

      const offers = p.merchantOffers || [];
      const matchPlatform = selectedPlatform === 'all' || offers.some(o => o.platform === selectedPlatform || o.platform?.includes(selectedPlatform));

      const hasSavings = (p.highestPrice || p.currentLowestPrice * 1.1) > p.currentLowestPrice;
      const matchDiscount = !onlyDiscounted || hasSavings;

      return matchSearch && matchCategory && matchPlatform && matchDiscount;
    }).sort((a, b) => {
      if (sortBy === 'lowest') return a.currentLowestPrice - b.currentLowestPrice;
      if (sortBy === 'savings') {
        const savingsA = (a.highestPrice || a.currentLowestPrice) - a.currentLowestPrice;
        const savingsB = (b.highestPrice || b.currentLowestPrice) - b.currentLowestPrice;
        return savingsB - savingsA;
      }
      if (sortBy === 'offers_count') {
        return (b.merchantOffers?.length || 0) - (a.merchantOffers?.length || 0);
      }
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedPlatform, onlyDiscounted, sortBy]);

  // Currently selected product
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || filteredProducts[0] || products[0];
  }, [products, selectedProductId, filteredProducts]);

  // Offers sorted by lowest price first for active product
  const activeOffers = useMemo(() => {
    if (!activeProduct) return [];
    const rawOffers: MerchantOffer[] = activeProduct.merchantOffers && activeProduct.merchantOffers.length > 0
      ? activeProduct.merchantOffers
      : [
          {
            id: `off-${activeProduct.id}-amz`,
            merchantName: 'متجر أمازون مصر (Amazon Prime)',
            storeType: 'online',
            platform: 'amazon_eg',
            platformName: 'أمازون مصر',
            price: activeProduct.currentLowestPrice,
            currency: 'EGP',
            rating: 4.8,
            reviewCount: 320,
            deliveryTime: 'توصيل غداً مجاناً',
            deliveryCost: 'مجاني',
            isVerified: true,
            isBestDeal: true,
            stockStatus: 'in_stock',
            inStock: true,
            fulfillmentType: 'fba'
          },
          {
            id: `off-${activeProduct.id}-noon`,
            merchantName: 'متجر نون إكسبريس (Noon Express)',
            storeType: 'online',
            platform: 'noon_eg',
            platformName: 'نون مصر',
            price: Math.round(activeProduct.currentLowestPrice * 1.05),
            currency: 'EGP',
            rating: 4.6,
            reviewCount: 184,
            deliveryTime: 'شحن 24 ساعة',
            deliveryCost: '15 ج.م',
            isVerified: true,
            isBestDeal: false,
            stockStatus: 'in_stock',
            inStock: true,
            fulfillmentType: 'fba_noon_express'
          },
          {
            id: `off-${activeProduct.id}-jumia`,
            merchantName: 'جوميا مصر مول (Jumia Mall Official)',
            storeType: 'online',
            platform: 'jumia_eg',
            platformName: 'جوميا',
            price: Math.round(activeProduct.currentLowestPrice * 1.09),
            currency: 'EGP',
            rating: 4.4,
            reviewCount: 92,
            deliveryTime: '2-3 أيام عمل',
            deliveryCost: '25 ج.م',
            isVerified: true,
            isBestDeal: false,
            stockStatus: 'in_stock',
            inStock: true
          },
          {
            id: `off-${activeProduct.id}-wholesale`,
            merchantName: 'تجار شارع عبد العزيز والعتبة بالجملة',
            storeType: 'wholesale',
            platform: 'abdelaziz_street',
            platformName: 'سوق الجملة المحلي',
            price: Math.round(activeProduct.currentLowestPrice * 0.94),
            currency: 'EGP',
            rating: 4.9,
            reviewCount: 520,
            deliveryTime: 'استلام فوري / شحن محلي',
            deliveryCost: '30 ج.م',
            isVerified: true,
            isBestDeal: true,
            stockStatus: 'in_stock',
            inStock: true
          }
        ];

    return [...rawOffers].sort((a, b) => a.price - b.price);
  }, [activeProduct]);

  // Price difference calculations
  const comparisonStats = useMemo(() => {
    if (!activeOffers || activeOffers.length === 0) {
      return { lowest: 0, highest: 0, savings: 0, savingsPercent: 0, winner: null };
    }
    const lowest = activeOffers[0].price;
    const highest = Math.max(...activeOffers.map(o => o.price));
    const savings = highest - lowest;
    const savingsPercent = highest > 0 ? Math.round((savings / highest) * 100) : 0;
    const winner = activeOffers[0];
    return { lowest, highest, savings, savingsPercent, winner };
  }, [activeOffers]);

  // Open modal for subscribing to discount alerts
  const handleOpenAlertModal = (product: ProductData) => {
    setAlertProduct(product);
    setSelectedDiscountPercent(10);
    const calculatedTarget = Math.round(product.currentLowestPrice * 0.9);
    setCustomTargetPrice(String(calculatedTarget));
    setIsAlertModalOpen(true);
  };

  // Save new discount alert
  const handleSaveDiscountAlert = () => {
    if (!alertProduct) return;
    setIsSubmittingAlert(true);

    const targetPriceNum = parseFloat(customTargetPrice) || Math.round(alertProduct.currentLowestPrice * (1 - selectedDiscountPercent / 100));

    const newAlert: DiscountPriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: alertProduct.id,
      productTitle: alertProduct.title,
      productImage: alertProduct.imageUrl,
      basePrice: alertProduct.currentLowestPrice,
      targetPrice: targetPriceNum,
      discountThresholdPercent: selectedDiscountPercent,
      createdAt: new Date().toISOString(),
      isTriggered: false,
      lastLowestPrice: alertProduct.currentLowestPrice
    };

    setAlerts(prev => [newAlert, ...prev.filter(a => a.productId !== alertProduct.id)]);
    setIsSubmittingAlert(false);
    setIsAlertModalOpen(false);

    // Request notification permission if supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    playCompetitorStatusSound?.();
    if (onShowToast) {
      onShowToast(`🔔 تم تفعيل تنبيه الخصم! ستصلك إشعارات فور هبوط السعر تحت ${targetPriceNum} ${currency} (-${selectedDiscountPercent}%).`);
    }
  };

  // Delete an alert
  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    if (onShowToast) onShowToast('تم حذف تنبيه الخصم بنجاح.');
  };

  // Simulate a live competitor price drop & discount alert
  const handleSimulateRealtimePriceDrop = () => {
    if (!activeProduct) return;
    setIsSimulatingDrop(true);

    const dropPercent = 15;
    const newPrice = Math.round(activeProduct.currentLowestPrice * 0.85);
    const dropMerchantName = 'متجر الأهرام للتوزيع (عرض خاص فوري)';

    setTimeout(() => {
      // 1. Update product offers with the new lower price
      const updatedProducts = products.map(p => {
        if (p.id === activeProduct.id) {
          const existingOffers = p.merchantOffers || [];
          const updatedOffers: MerchantOffer[] = [
            {
              id: `deal-${Date.now()}`,
              merchantName: `${dropMerchantName} ⚡`,
              storeType: 'online',
              platform: 'noon_eg',
              platformName: 'نون مصر (عرض سوبر)',
              price: newPrice,
              originalPrice: p.currentLowestPrice,
              currency: 'EGP',
              rating: 4.9,
              reviewCount: 410,
              deliveryTime: 'توصيل فوري نفس اليوم',
              deliveryCost: 'مجاني',
              isVerified: true,
              isBestDeal: true,
              stockStatus: 'in_stock',
              inStock: true,
              discountBadge: `خصم فوري ${dropPercent}%`
            },
            ...existingOffers.map(o => ({ ...o, isBestDeal: false }))
          ];

          return {
            ...p,
            currentLowestPrice: newPrice,
            highestPrice: Math.max(p.highestPrice || p.currentLowestPrice, p.currentLowestPrice),
            merchantOffers: updatedOffers
          };
        }
        return p;
      });

      setProducts(updatedProducts);

      // 2. Trigger active alerts matching this product
      setAlerts(prev => prev.map(a => {
        if (a.productId === activeProduct.id) {
          return {
            ...a,
            isTriggered: true,
            triggeredAt: new Date().toISOString(),
            lastLowestPrice: newPrice
          };
        }
        return a;
      }));

      // 3. Audio & Visual Celebration
      playPriceAlertSound?.();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setLastTriggeredDeal({
        product: activeProduct,
        newPrice,
        discountPercent: dropPercent,
        merchantName: dropMerchantName
      });

      // 4. Browser Notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🔥 هبوط سعر حقيقي جديد! رادار التاجر', {
            body: `انخفض سعر "${activeProduct.title.substring(0, 45)}..." إلى ${newPrice} ${currency} (-${dropPercent}%) لدى ${dropMerchantName}.`,
            icon: activeProduct.imageUrl || '/pwa-192x192.png'
          });
        } catch {}
      }

      if (onShowToast) {
        onShowToast(`🎉 رصد هبوط سعر جديد! انخفض السعر إلى ${newPrice} ${currency} (-${dropPercent}%) لدى ${dropMerchantName}!`);
      }

      setIsSimulatingDrop(false);
    }, 600);
  };

  const getPlatformBadge = (platformCode: string) => {
    switch (platformCode) {
      case 'amazon_eg':
        return { name: 'أمازون مصر', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'noon_eg':
        return { name: 'نون مصر', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' };
      case 'jumia_eg':
        return { name: 'جوميا', color: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
      case 'btech':
      case 'btech_eg':
        return { name: 'بي تك', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      case 'raneen':
      case 'raneen_eg':
        return { name: 'رنين', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
      case 'homzmart_eg':
        return { name: 'هومزمارت', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'abdelaziz_street':
      case 'ataba_market':
        return { name: 'سوق الجملة المحلي', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      default:
        return { name: 'متجر محلي معتمد', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* 1. Header Banner & Mode Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
              <ArrowUpDown className="w-4 h-4 text-amber-400" />
              <span>مقارنة الأسعار اللحظية وتنبيهات الخصومات المباشرة 🇪🇬</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              رادار مقارنة أسعار المتاجر والعروض الحصرية
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              قارن أسعار المنتجات ذاتها بين أمازون، نون، جوميا، بي تك، رنين ومحلات الجملة في الوقت الفعلي، وتلقَّ تنبيهات فورية عند انخفاض الأسعار وظهور العروض الخاصة.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Switcher */}
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveViewMode('comparison')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeViewMode === 'comparison'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>المقارنة المباشرة</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('csv_engine')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeViewMode === 'csv_engine'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>مقارنة الفجوات (CSV)</span>
              </button>
            </div>

            {/* Active Alerts Button */}
            <button
              type="button"
              onClick={() => setIsAlertsDrawerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm relative"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>تنبيهاتي النشطة</span>
              {alerts.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-bold">المنتجات تحت الرصد اللحظي</span>
            <span className="text-lg font-black text-white font-mono">{products.length} منتج</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-bold">المتاجر والمنصات المقارنة</span>
            <span className="text-lg font-black text-amber-400 font-mono">8 منصات رسمية</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-bold">أقصى توفير متاح الآن</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              وفر حتى {comparisonStats.savings} {currency} ({comparisonStats.savingsPercent}%)
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-bold">تنبيهات الخصومات المبرمجة</span>
            <span className="text-lg font-black text-sky-400 font-mono">{alerts.length} تنبيهات</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODE 1: REAL-TIME PRICE COMPARISON
         ======================================================== */}
      {activeViewMode === 'comparison' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Flash Deals & Price Drop Simulator Alert Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-inner">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">نظام التنبيه التلقائي للخصومات والعروض:</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    LIVE DISCOUNTS
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  اختبر محاكاة هبوط السعر الفوري لأي منتج لتجربة إشعارات الويب الصوتية والمرئية فورياً.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={handleSimulateRealtimePriceDrop}
                disabled={isSimulatingDrop || !activeProduct}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isSimulatingDrop ? 'animate-spin' : ''}`} />
                <span>محاكاة هبوط سعر فوري وتفعيل التنبيه</span>
              </button>

              {activeProduct && (
                <button
                  type="button"
                  onClick={() => handleOpenAlertModal(activeProduct)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                >
                  <Bell className="w-4 h-4" />
                  <span>تنبيه لهذا المنتج</span>
                </button>
              )}
            </div>
          </div>

          {/* Triggered Deal Feedback Alert */}
          {lastTriggeredDeal && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 flex items-center justify-between gap-3 animate-fadeIn shadow-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <strong className="block text-white font-black text-sm">
                    🎉 تم رصد خصم فوري بنسبة {lastTriggeredDeal.discountPercent}% على {lastTriggeredDeal.product.title}!
                  </strong>
                  <span>
                    السعر الجديد: <span className="font-mono font-bold text-white text-sm">{lastTriggeredDeal.newPrice} {currency}</span> لدى {lastTriggeredDeal.merchantName}.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLastTriggeredDeal(null)}
                className="text-emerald-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative w-full md:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، الموديل، كود SKU، أو الماركة لمقارنة الأسعار بين المتاجر..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-amber-500"
                >
                  <option value="all">كل المتاجر والمنصات</option>
                  <option value="amazon_eg">أمازون مصر (Amazon.eg)</option>
                  <option value="noon_eg">نون مصر (Noon)</option>
                  <option value="jumia_eg">جوميا (Jumia)</option>
                  <option value="btech">بي تك (B.TECH)</option>
                  <option value="raneen">رنين (Raneen)</option>
                  <option value="abdelaziz_street">سوق الجملة (عبد العزيز/العتبة)</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-amber-500"
                >
                  <option value="savings">الأعلى توفيراً وخصماً 💰</option>
                  <option value="lowest">أقل سعر أولاً 🏷️</option>
                  <option value="offers_count">الأكثر عروضاً ومتاجر 🏪</option>
                </select>

                <button
                  type="button"
                  onClick={() => setOnlyDiscounted(!onlyDiscounted)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    onlyDiscounted
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>عروض خاصة فقط</span>
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                جميع التصنيفات ({products.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Column Comparison Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Products Selector Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-bold">قائمة المنتجات المرصودة ({filteredProducts.length})</span>
                <span>اختر منتجاً للمقارنة</span>
              </div>

              <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-0.5">
                {filteredProducts.map(prod => {
                  const isSelected = prod.id === activeProduct?.id;
                  const lowest = prod.currentLowestPrice;
                  const highest = prod.highestPrice || Math.round(lowest * 1.15);
                  const diff = highest - lowest;
                  const diffPct = highest > 0 ? Math.round((diff / highest) * 100) : 0;
                  const offersCount = prod.merchantOffers?.length || 4;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-slate-850 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80'}
                          alt={prod.title}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed">
                            {prod.title}
                          </h4>
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block">أفضل سعر</span>
                              <span className="font-mono text-xs font-black text-emerald-400">
                                {lowest} {currency}
                              </span>
                            </div>
                            {diff > 0 && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                                توفير {diff} {currency} ({diffPct}%)
                              </span>
                            )}
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{offersCount} متاجر مقارنة</span>
                            <span className="font-mono">{prod.sku}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comparison Details & Matrix (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              {activeProduct ? (
                <div className="space-y-5">
                  {/* Active Product Hero Card */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={activeProduct.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80'}
                          alt={activeProduct.title}
                          className="w-20 h-20 rounded-2xl object-cover bg-slate-950 border border-slate-800 shrink-0 shadow-md"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                              {activeProduct.category || 'عام'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              SKU: {activeProduct.sku}
                            </span>
                            {activeProduct.brand && (
                              <span className="text-[11px] text-slate-300 font-bold">
                                الماركة: {activeProduct.brand}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-white leading-relaxed">
                            {activeProduct.title}
                          </h3>
                        </div>
                      </div>

                      {/* Set Alert Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenAlertModal(activeProduct)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer shrink-0 active:scale-95"
                      >
                        <Bell className="w-4 h-4 text-slate-950" />
                        <span>تفعيل تنبيه عند هبوط السعر</span>
                      </button>
                    </div>

                    {/* Savings Highlight Bar */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-950 to-slate-950 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                          🏆
                        </div>
                        <div>
                          <span className="text-slate-300 block">
                            المتجر الأفضل سعراً (الفائز بالـ Buy Box):
                          </span>
                          <strong className="text-white font-bold text-sm">
                            {comparisonStats.winner?.merchantName} ({comparisonStats.winner?.price} {currency})
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">فارق التوفير الأقصى:</span>
                          <span className="font-mono font-black text-emerald-400 text-sm">
                            وفر حتى {comparisonStats.savings} {currency} ({comparisonStats.savingsPercent}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Merchant Offers Side-by-Side Comparison Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <Store className="w-4 h-4 text-amber-400" />
                          <span>عروض ومقارنة أسعار المتاجر ({activeOffers.length} تجار)</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          مرتبة من الأقل سعراً والأفضل للمشتري إلى الأعلى سعراً في السوق المصري
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                        مزامنة حية ⚡
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeOffers.map((offer, idx) => {
                        const platBadge = getPlatformBadge(offer.platform);
                        const isWinner = idx === 0;
                        const priceDiff = offer.price - comparisonStats.lowest;
                        const diffPct = comparisonStats.lowest > 0 ? Math.round((priceDiff / comparisonStats.lowest) * 100) : 0;

                        return (
                          <div
                            key={offer.id || idx}
                            className={`p-4 rounded-2xl border transition-all ${
                              isWinner
                                ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {/* Merchant info */}
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                                  isWinner ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {isWinner ? '🥇' : `#${idx + 1}`}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="text-xs sm:text-sm font-black text-white">
                                      {offer.merchantName}
                                    </h5>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${platBadge.color}`}>
                                      {platBadge.name}
                                    </span>
                                    {isWinner && (
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                                        الفائز بالـ Buy Box 🏆
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      {offer.isVerified ? 'بائع معتمد' : 'متجر نشط'}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                                      {offer.deliveryTime || 'شحن خلال 24-48 ساعة'}
                                    </span>
                                    <span>•</span>
                                    <span>الشحن: {offer.deliveryCost || 'مجاني'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Price & Action */}
                              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                                <div className="text-right">
                                  <div className="flex items-baseline gap-1">
                                    <span className={`text-base sm:text-lg font-black font-mono ${
                                      isWinner ? 'text-emerald-400' : 'text-white'
                                    }`}>
                                      {offer.price}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold">{currency}</span>
                                  </div>

                                  {isWinner ? (
                                    <span className="text-[10px] text-emerald-400 font-bold block">
                                      أقل سعر متاح في مصر ✨
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-rose-400 font-bold block">
                                      أعلى بـ {priceDiff} {currency} (+{diffPct}%)
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (offer.url) {
                                      window.open(offer.url, '_blank');
                                    } else {
                                      if (onShowToast) onShowToast(`جاري فتح صفحة ${offer.merchantName} على ${platBadge.name}...`);
                                    }
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>زيارة المتجر</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Store className="w-12 h-12 text-slate-600" />
                  <p className="text-xs">يرجى اختيار منتج من القائمة الجانبية لعرض مقارنة أسعاره بين المتاجر.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: CSV GAP ANALYSIS ENGINE
         ======================================================== */}
      {activeViewMode === 'csv_engine' && (
        <div className="space-y-4 animate-fadeIn">
          <PriceComparisonEngine currency={currency} onShowToast={onShowToast} />
        </div>
      )}

      {/* ========================================================
          MODAL: SUBSCRIBE TO DISCOUNT & SPECIAL OFFERS ALERT
         ======================================================== */}
      {isAlertModalOpen && alertProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-right relative">
            <button
              onClick={() => setIsAlertModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  تفعيل تنبيه الخصم والعروض الخاصة
                </h3>
                <p className="text-xs text-slate-400">
                  تلقَّ إشعاراً صوتياً وتطبيقيّاً فور هبوط سعر المنتج تحت الحد المستهدف
                </p>
              </div>
            </div>

            {/* Product summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img
                src={alertProduct.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80'}
                alt={alertProduct.title}
                className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{alertProduct.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-slate-400">السعر الأقل حالياً:</span>
                  <span className="font-mono font-black text-emerald-400">
                    {alertProduct.currentLowestPrice} {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Threshold Percent Preset Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                اختر نسبة الخصم المستهدفة لتلقي الإشعار:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 25].map(pct => {
                  const target = Math.round(alertProduct.currentLowestPrice * (1 - pct / 100));
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setSelectedDiscountPercent(pct);
                        setCustomTargetPrice(String(target));
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        selectedDiscountPercent === pct
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs block font-bold">خصم {pct}%</span>
                      <span className="text-[10px] block opacity-80 font-mono mt-0.5">{target} ج.م</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Target Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                أو حدد السعر المستهدف يدوياً ({currency}):
              </label>
              <input
                type="number"
                value={customTargetPrice}
                onChange={(e) => setCustomTargetPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                placeholder="مثال: 2200"
              />
            </div>

            {/* Channels Notice */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-xs text-slate-400">
              <span className="font-bold text-slate-300 block">قنوات الإشعار المفعلة:</span>
              <div className="flex items-center gap-3 text-[11px] pt-1">
                <span className="text-emerald-400 flex items-center gap-1">✓ إشعارات المتصفح (Web Push)</span>
                <span className="text-emerald-400 flex items-center gap-1">✓ تنبيه صوتي وتطبيقي</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveDiscountAlert}
                disabled={isSubmittingAlert}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg transition cursor-pointer"
              >
                حفظ وتفعيل التنبيه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DRAWER: SUBSCRIBED ALERTS LIST
         ======================================================== */}
      {isAlertsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border-r border-slate-800 w-full max-w-md h-full flex flex-col p-5 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">تنبيهات الخصومات المشترك بها</h3>
              </div>
              <button
                onClick={() => setIsAlertsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {alerts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <Bell className="w-12 h-12 text-slate-600" />
                  <p className="text-xs">لم تقم بتفعيل أي تنبيهات خصم حتى الآن. انقر "تنبيه لهذا المنتج" لتبدأ.</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={alert.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                          alt={alert.productTitle}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{alert.productTitle}</h4>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            السعر المرجعي: {alert.basePrice} ج.م
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition"
                        title="حذف التنبيه"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-400">الهدف:</span>
                        <span className="font-mono font-bold text-amber-400 mr-1">{alert.targetPrice} ج.م</span>
                        <span className="text-slate-500 text-[10px] mr-1">(-{alert.discountThresholdPercent}%)</span>
                      </div>

                      {alert.isTriggered ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          تم الرصد بنجاح 🎉
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/30">
                          نشط وفي الانتظار ⏳
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAlertsDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RealTimePriceComparisonCenter;
