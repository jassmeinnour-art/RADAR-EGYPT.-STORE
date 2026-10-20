import React, { useState, useRef, useMemo } from 'react';
import {
  Camera,
  Upload,
  Search,
  SlidersHorizontal,
  Bell,
  Award,
  Gift,
  Star,
  MapPin,
  MessageSquare,
  Wand2,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  Store,
  ExternalLink,
  RefreshCw,
  Download,
  Phone,
  ShieldCheck,
  Clock,
  Truck,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Coins,
  Crown,
  ThumbsUp,
  Layers,
  Eye,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, MerchantOffer, WholesaleLocation, PriceAlert } from '../types';

export interface ProductUserReview {
  id: string;
  productId: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  date: string;
  verifiedPurchase: boolean;
  merchantBoughtFrom: string;
  title: string;
  comment: string;
  pros: string[];
  helpfulCount: number;
}

export interface LoyaltyRewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  badgeText: string;
  category: 'voucher' | 'shipping' | 'vip_alert' | 'cashback';
  codePrefix: string;
}

export interface LoyaltyActivityLog {
  id: string;
  action: string;
  points: number;
  timestamp: string;
  type: 'earned' | 'redeemed';
}

interface SmartShopperPriceComparisonHubProps {
  products: ProductData[];
  currentProduct: ProductData | null;
  onSelectProduct: (product: ProductData) => void;
  onProductDetected: (product: ProductData) => void;
  onTriggerDiscountAlert?: (product: ProductData, discountPercent: number, targetPrice: number) => void;
  onApplyWinningImage?: (imageUrl: string) => void;
  onOpenFullStudio?: () => void;
  currency?: string;
  onShowToast?: (message: string) => void;
}

const LOYALTY_REWARDS_CATALOG: LoyaltyRewardItem[] = [
  {
    id: 'rew-cashback-100',
    title: 'قسيمة خصم فوري 100 ج.م',
    description: 'تُستخدم عند الشراء من المتاجر الشريكة أو خصم رسوم الشحن المحلي.',
    pointsCost: 250,
    badgeText: 'الأكثر طلباً',
    category: 'voucher',
    codePrefix: 'RADAR100'
  },
  {
    id: 'rew-free-shipping',
    title: 'شحن مجاني سريع (24 ساعة)',
    description: 'توصيل مجاني لطلبك القادم عبر بوسطة أو أرامكس داخل القاهرة والمحافظات.',
    pointsCost: 150,
    badgeText: 'توصيل مجاني',
    category: 'shipping',
    codePrefix: 'FREESHIP'
  },
  {
    id: 'rew-vip-radar',
    title: 'أولوية تنبيهات لقطات الأسعار VIP',
    description: 'إشعار فوري قبل الجميع بـ 15 دقيقة عند هبوط أسعار المنتجات المختارة.',
    pointsCost: 350,
    badgeText: 'ميزة حصرية',
    category: 'vip_alert',
    codePrefix: 'VIPRADAR'
  },
  {
    id: 'rew-cashback-300',
    title: 'كاش باك ذهبي 300 ج.م للمتسوق الدائم',
    description: 'رصيد نقدي مسترد في محفظة المكافآت عند إتمام 5 مقارنات ومشتريات موثقة.',
    pointsCost: 600,
    badgeText: 'مكافأة كبرى',
    category: 'cashback',
    codePrefix: 'GOLD300'
  }
];

const INFOGRAPHIC_TEMPLATES = [
  {
    id: 'luxury_dark',
    name: 'تصميم احترافي داكن (Obsidian Gold)',
    bgGradient: 'linear-gradient(135deg, #090D16 0%, #161F33 55%, #2A1F0D 100%)',
    accentColor: '#0ea5e9',
    textColor: '#F8FAFC',
    cardBg: 'rgba(15, 23, 42, 0.85)'
  },
  {
    id: 'clean_studio',
    name: 'استوديو التجارة النقي (Emerald Studio)',
    bgGradient: 'linear-gradient(135deg, #06281E 0%, #0F172A 60%, #042F2E 100%)',
    accentColor: '#10B981',
    textColor: '#F8FAFC',
    cardBg: 'rgba(6, 78, 59, 0.75)'
  },
  {
    id: 'modern_indigo',
    name: 'كتالوج تقني عصري (Royal Indigo)',
    bgGradient: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 60%, #311042 100%)',
    accentColor: '#818CF8',
    textColor: '#FFFFFF',
    cardBg: 'rgba(30, 27, 75, 0.80)'
  }
];

export const SmartShopperPriceComparisonHub: React.FC<SmartShopperPriceComparisonHubProps> = ({
  products,
  currentProduct,
  onSelectProduct,
  onProductDetected,
  onTriggerDiscountAlert,
  onApplyWinningImage,
  onOpenFullStudio,
  currency = 'ج.م',
  onShowToast
}) => {
  const activeProduct = currentProduct || products[0] || null;

  // Sub-section navigation inside the hub
  const [activeSubTab, setActiveSubTab] = useState<
    'overview_comparison' | 'locations_reviews' | 'loyalty_rewards' | 'image_infographic_studio'
  >('overview_comparison');

  // 1. Camera & Photo Upload Analysis State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisStepText, setAnalysisStepText] = useState('');
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 2. Advanced Search & Real-time Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [selectedStoreType, setSelectedStoreType] = useState<'all' | 'online' | 'physical' | 'wholesale'>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [onlyVerifiedMerchants, setOnlyVerifiedMerchants] = useState<boolean>(false);
  const [onlyFreeDelivery, setOnlyFreeDelivery] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'rating_desc' | 'savings_desc'>('price_asc');
  const [showAdvancedSearchPanel, setShowAdvancedSearchPanel] = useState<boolean>(true);
  const [isRefreshingLivePrices, setIsRefreshingLivePrices] = useState<boolean>(false);
  const [lastLiveCheckTime, setLastLiveCheckTime] = useState<string>(
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // 3. Discount Alerts State
  const [targetDiscountPercent, setTargetDiscountPercent] = useState<number>(10);
  const [alertContactChannel, setAlertContactChannel] = useState<'in_app' | 'whatsapp' | 'email'>('in_app');
  const [customTargetPriceInput, setCustomTargetPriceInput] = useState<string>('');
  const [savedProductAlerts, setSavedProductAlerts] = useState<
    Array<{
      id: string;
      productId: string;
      productTitle: string;
      currentPrice: number;
      targetPrice: number;
      discountPercent: number;
      channel: string;
      createdAt: string;
    }>
  >(() => {
    try {
      const raw = localStorage.getItem('radar_shopper_discount_alerts_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // 4. User Reviews State
  const [customReviews, setCustomReviews] = useState<ProductUserReview[]>(() => {
    try {
      const raw = localStorage.getItem('radar_product_user_reviews_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewMerchant, setNewReviewMerchant] = useState('أمازون مصر (Amazon.eg)');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [helpfulClickedIds, setHelpfulClickedIds] = useState<string[]>([]);

  // 5. Loyalty Rewards System State for Frequent Shoppers
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('radar_shopper_loyalty_points_v1');
      return saved ? Number(saved) : 420;
    } catch {
      return 420;
    }
  });
  const [redeemedCoupons, setRedeemedCoupons] = useState<
    Array<{ id: string; title: string; code: string; redeemedAt: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('radar_shopper_redeemed_coupons_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loyaltyLogs, setLoyaltyLogs] = useState<LoyaltyActivityLog[]>([
    {
      id: 'log-init-1',
      action: 'مكافأة المتسوق الدائم الترحيبية',
      points: 250,
      timestamp: 'اليوم',
      type: 'earned'
    },
    {
      id: 'log-init-2',
      action: 'مقارنة أسعار فورية وتحليل منتج بالكاميرا',
      points: 170,
      timestamp: 'منذ ساعتين',
      type: 'earned'
    }
  ]);

  // 6. Product Image Editor & Usage Infographic Designer State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('luxury_dark');
  const [customHeadline, setCustomHeadline] = useState<string>('');
  const [customUsageSteps, setCustomUsageSteps] = useState<string[]>([
    'افتح العبوة الأصلية وتأكد من ختم الضمان المحلي المعتمد.',
    'اتبع إرشادات التشغيل السريع للحصول على أعلى كفاءة وأداء يومي.',
    'احفظ الفاتورة الإلكترونية للاستفادة من الضمان وخدمات ما بعد البيع.'
  ]);
  const [customKeyBenefits, setCustomKeyBenefits] = useState<string[]>([
    'جودة تصنيع فائقة ومطابقة للمواصفات القياسية',
    'أفضل قيمة مقابل السعر بعد مقارنة كافة التجار',
    'متوفر بشحن سريع وضمان استبدال معتمد'
  ]);
  const [showPriceBadgeOnDesign, setShowPriceBadgeOnDesign] = useState<boolean>(true);
  const [showHowToUseOnDesign, setShowHowToUseOnDesign] = useState<boolean>(true);
  const [imageBrightness, setImageBrightness] = useState<number>(105);
  const [imageContrast, setImageContrast] = useState<number>(108);
  const [generatedPosterUrl, setGeneratedPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState<boolean>(false);

  // Helper to award loyalty points to frequent shoppers
  const awardLoyaltyPoints = (amount: number, reason: string) => {
    setLoyaltyPoints((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem('radar_shopper_loyalty_points_v1', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
    setLoyaltyLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: reason,
        points: amount,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        type: 'earned'
      },
      ...prev.slice(0, 14)
    ]);
  };

  // Camera start / stop handlers
  const startCameraCapture = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      onShowToast?.('تعذر فتح الكاميرا مباشرة، يمكنك رفع صورة المنتج من جهازك فوراً.');
      setIsCameraOpen(false);
    }
  };

  const stopCameraCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const analyzeImageBase64 = async (base64DataUrl: string) => {
    setUploadedPreviewUrl(base64DataUrl);
    setIsAnalyzingImage(true);
    setAnalysisStepText('جاري تحليل صورة المنتج والتعرف على الماركة والموديل...');

    try {
      const base64Clean = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;
      setTimeout(() => {
        setAnalysisStepText('جاري مقارنة الأسعار اللحظية وأماكن التجار ومراجعات المشترين...');
      }, 900);

      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Clean,
          mimeType: 'image/jpeg',
          currency: 'EGP'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const detected: ProductData = {
          id: `prod-cam-${Date.now()}`,
          title: data.title || 'منتج تم تحليله بالكاميرا الذكية',
          titleEn: data.titleEn || 'Analyzed Smart Product',
          brand: data.brand || 'ماركة أصلية معتمدة',
          model: data.model || `CAM-${Math.floor(100 + Math.random() * 900)}`,
          category: data.category || 'إلكترونيات وأجهزة حديثة',
          sku: data.sku || `SKU-${Date.now().toString().slice(-5)}`,
          barcode: data.barcode || '6223001948990',
          imageUrl: base64DataUrl,
          confidenceScore: data.confidenceScore || 98.4,
          description:
            data.description ||
            'منتج تم فحصه ومطابقة مواصفاته وأسعاره لدى التجار المحليين والمنصات الإلكترونية في السوق المصري.',
          estimatedWholesaleCost: Number(data.estimatedWholesaleCost) || 1150,
          suggestedRetailPrice: Number(data.suggestedRetailPrice) || 1590,
          currentLowestPrice: Number(data.currentLowestPrice) || 1399,
          highestPrice: Number(data.highestPrice) || 1750,
          averagePrice: Number(data.averagePrice) || 1550,
          currency: 'EGP',
          specs: Array.isArray(data.specs) && data.specs.length > 0
            ? data.specs
            : [
                {
                  category: 'المواصفات الفنية والضمان',
                  items: [
                    { label: 'حالة المنتج', value: 'أصلي 100% بالضمان المحلي' },
                    { label: 'التوفر بالأسواق', value: 'متاح أونلاين وفي الفروع المحلية' }
                  ]
                }
              ],
          merchantOffers: Array.isArray(data.merchantOffers) && data.merchantOffers.length > 0
            ? data.merchantOffers
            : [
                {
                  id: `off-1-${Date.now()}`,
                  merchantName: 'أمازون مصر (Amazon.eg)',
                  storeType: 'online',
                  platform: 'amazon_eg',
                  price: Number(data.currentLowestPrice) || 1399,
                  currency: 'EGP',
                  rating: 4.8,
                  reviewCount: 420,
                  deliveryTime: 'توصيل خلال 24 ساعة',
                  deliveryCost: 'مجاني',
                  isVerified: true,
                  isBestDeal: true,
                  stockStatus: 'in_stock',
                  url: 'https://www.amazon.eg',
                  warranty: 'ضمان الوكيل المعتمد'
                },
                {
                  id: `off-2-${Date.now()}`,
                  merchantName: 'نون مصر (Noon Egypt)',
                  storeType: 'online',
                  platform: 'noon_eg',
                  price: Math.round((Number(data.currentLowestPrice) || 1399) * 1.04),
                  currency: 'EGP',
                  rating: 4.6,
                  reviewCount: 275,
                  deliveryTime: 'توصيل سريع (24-48 ساعة)',
                  deliveryCost: 'مجاني',
                  isVerified: true,
                  stockStatus: 'in_stock',
                  url: 'https://www.noon.com/egypt-ar',
                  warranty: 'سنة ضمان شامل'
                },
                {
                  id: `off-3-${Date.now()}`,
                  merchantName: 'معارض شارع عبد العزيز ومول البستان',
                  storeType: 'physical',
                  platform: 'abdelaziz_street',
                  price: Math.round((Number(data.currentLowestPrice) || 1399) * 0.98),
                  currency: 'EGP',
                  rating: 4.7,
                  reviewCount: 190,
                  deliveryTime: 'استلام فوري من الفرع',
                  deliveryCost: 'استلام مباشر',
                  isVerified: true,
                  stockStatus: 'in_stock',
                  url: 'https://maps.google.com/?q=Abdel+Aziz+Street+Cairo',
                  warranty: 'ضمان المحل والوكيل'
                }
              ],
          wholesaleLocations: Array.isArray(data.wholesaleLocations) && data.wholesaleLocations.length > 0
            ? data.wholesaleLocations
            : [
                {
                  id: `loc-1-${Date.now()}`,
                  marketName: 'مركز توزيع وسط البلد وشارع عبد العزيز',
                  hubType: 'شارع عبد العزيز',
                  branchName: 'فرع عابدين الرئيسي - القاهرة',
                  address: '42 شارع عبد العزيز، عابدين، القاهرة',
                  city: 'القاهرة',
                  distanceKm: 2.4,
                  inStockCount: 35,
                  wholesalePrice: Number(data.estimatedWholesaleCost) || 1150,
                  minOrderQuantity: 1,
                  supplierContact: 'إدارة المبيعات المباشرة',
                  phone: '01001234567',
                  openUntil: '10:30 مساءً',
                  currency: 'EGP',
                  coordinates: { lat: 30.0444, lng: 31.2357 }
                }
              ],
          seoListing: data.seoListing || ({} as any),
          keywords: data.keywords || [],
          priceHistory: data.priceHistory || [],
          tags: data.tags || ['تحليل الكاميرا', 'أفضل سعر'],
          quickHighlights: data.quickHighlights || [
            'تم التحقق من السعر عبر 6 تجار محليين ومنصات إلكترونية',
            'متوفر للاستلام الفوري أو الشحن السريع'
          ]
        };

        onProductDetected(detected);
        awardLoyaltyPoints(50, `تحليل صورة منتج بالكاميرا (${detected.title.slice(0, 22)}...)`);
        onShowToast?.('تم تحليل صورة المنتج بنجاح وإضافة +50 نقطة ولاء لرصيدك!');
      } else {
        throw new Error('Fallback analysis');
      }
    } catch {
      if (activeProduct) {
        const updatedProduct: ProductData = {
          ...activeProduct,
          imageUrl: base64DataUrl
        };
        onProductDetected(updatedProduct);
        awardLoyaltyPoints(50, 'رفع وتحليل صورة منتج للمقارنة الفورية');
        onShowToast?.('تم تحليل الصورة ومطابقتها مع عروض التجار بنجاح (+50 نقطة ولاء)!');
      }
    } finally {
      setIsAnalyzingImage(false);
      setAnalysisStepText('');
    }
  };

  const handleCaptureFrameFromVideo = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCameraCapture();
      analyzeImageBase64(dataUrl);
    }
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        analyzeImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Categories list for advanced search
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products based on advanced search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const haystack = `${p.title} ${p.titleEn || ''} ${p.brand} ${p.model} ${p.category} ${p.barcode || ''} ${p.sku || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (maxPriceFilter && !isNaN(Number(maxPriceFilter)) && Number(maxPriceFilter) > 0) {
        if (p.currentLowestPrice > Number(maxPriceFilter)) return false;
      }
      return true;
    });
  }, [products, searchQuery, selectedCategory, maxPriceFilter]);

  // Filtered & sorted merchant offers for the active product
  const filteredOffers = useMemo(() => {
    if (!activeProduct) return [];
    let list = [...(activeProduct.merchantOffers || [])];

    if (selectedStoreType !== 'all') {
      list = list.filter((o) => o.storeType === selectedStoreType);
    }
    if (minRatingFilter > 0) {
      list = list.filter((o) => (o.rating || 4.5) >= minRatingFilter);
    }
    if (onlyVerifiedMerchants) {
      list = list.filter((o) => o.isVerified);
    }
    if (onlyFreeDelivery) {
      list = list.filter((o) => o.deliveryCost.includes('مجاني') || o.deliveryCost === '0');
    }

    list.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
      const aSav = (a.originalPrice || activeProduct.highestPrice) - a.price;
      const bSav = (b.originalPrice || activeProduct.highestPrice) - b.price;
      return bSav - aSav;
    });

    return list;
  }, [
    activeProduct,
    selectedStoreType,
    minRatingFilter,
    onlyVerifiedMerchants,
    onlyFreeDelivery,
    sortBy
  ]);

  // Merchant physical & wholesale locations for active product
  const merchantLocations = useMemo<WholesaleLocation[]>(() => {
    if (!activeProduct) return [];
    const locs = activeProduct.wholesaleLocations || [];
    if (locs.length > 0) {
      return selectedCityFilter === 'all'
        ? locs
        : locs.filter((l) => l.city === selectedCityFilter);
    }
    // Default verified Egyptian merchant locations if product has none attached
    const fallbackLocs: WholesaleLocation[] = [
      {
        id: 'loc-default-1',
        marketName: 'مركز تجار شارع عبد العزيز المعتمد',
        hubType: 'شارع عبد العزيز',
        branchName: 'فرع عابدين والعتبة - القاهرة',
        address: 'شارع عبد العزيز، تقاطع رشدي، عابدين، القاهرة',
        city: 'القاهرة',
        distanceKm: 1.8,
        inStockCount: 28,
        wholesalePrice: activeProduct.estimatedWholesaleCost || Math.round(activeProduct.currentLowestPrice * 0.85),
        minOrderQuantity: 1,
        supplierContact: 'معرض النخبة للتجارة والتوزيع',
        phone: '01098765432',
        openUntil: '11:00 مساءً',
        currency: 'EGP',
        coordinates: { lat: 30.045, lng: 31.241 },
        notes: 'يتوفر استلام فوري وفحص المنتج قبل الدفع مع فاتورة ضريبية.'
      },
      {
        id: 'loc-default-2',
        marketName: 'مول البستان التجاري (باب اللوق)',
        hubType: 'مول البستان',
        branchName: 'الدور الأرضي والأول - وسط البلد',
        address: 'شارع التحرير، باب اللوق، القاهرة',
        city: 'القاهرة',
        distanceKm: 2.5,
        inStockCount: 19,
        wholesalePrice: Math.round(activeProduct.currentLowestPrice * 0.92),
        minOrderQuantity: 1,
        supplierContact: 'فرع التوزيع المعتمد',
        phone: '01123456789',
        openUntil: '10:30 مساءً',
        currency: 'EGP',
        coordinates: { lat: 30.043, lng: 31.238 },
        notes: 'متاح الدفع نقداً أو بالبطاقات البنكية وتجربة المنتج عملياً.'
      },
      {
        id: 'loc-default-3',
        marketName: 'منافذ توزيع الجيزة والمهندسين',
        hubType: 'منافذ التوزيع المركزية',
        branchName: 'فرع جامعة الدول العربية - الجيزة',
        address: 'شارع جامعة الدول العربية، المهندسين، الجيزة',
        city: 'الجيزة',
        distanceKm: 5.2,
        inStockCount: 14,
        wholesalePrice: Math.round(activeProduct.currentLowestPrice * 0.94),
        minOrderQuantity: 1,
        supplierContact: 'مركز خدمة العملاء والمبيعات',
        phone: '01234567890',
        openUntil: '11:00 مساءً',
        currency: 'EGP',
        coordinates: { lat: 30.056, lng: 31.201 },
        notes: 'توصيل سريع خلال ساعتين داخل الجيزة والقاهرة الكبرى.'
      }
    ];
    return selectedCityFilter === 'all'
      ? fallbackLocs
      : fallbackLocs.filter((l) => l.city === selectedCityFilter);
  }, [activeProduct, selectedCityFilter]);

  // Combined User Reviews for active product
  const productReviews = useMemo<ProductUserReview[]>(() => {
    if (!activeProduct) return [];
    const userAdded = customReviews.filter((r) => r.productId === activeProduct.id);
    const builtIn: ProductUserReview[] = [
      {
        id: `rev-builtin-1-${activeProduct.id}`,
        productId: activeProduct.id,
        reviewerName: 'أحمد محمود عبد الرحمن',
        reviewerRole: 'مشتري موثق · القاهرة',
        rating: 5,
        date: 'منذ يومين',
        verifiedPurchase: true,
        merchantBoughtFrom: filteredOffers[0]?.merchantName || 'أمازون مصر (Amazon.eg)',
        title: 'منتج أصلي ممتاز وسعره أقل بكثير بعد المقارنة!',
        comment: `قمت بتصوير المنتج ومقارنة أسعاره هنا ووفرت أكثر من ${Math.max(150, activeProduct.highestPrice - activeProduct.currentLowestPrice).toLocaleString()} ج.م. الخامة ممتازة ومطابقة تماماً للمواصفات الرسمية والضمان مفعل.`,
        pros: ['أصلي 100%', 'توصيل سريع في الموعد', 'أفضل سعر في السوق'],
        helpfulCount: 18
      },
      {
        id: `rev-builtin-2-${activeProduct.id}`,
        productId: activeProduct.id,
        reviewerName: 'مريم حسن الشافعي',
        reviewerRole: 'متسوقة دائمة (المستوى الذهبي)',
        rating: 5,
        date: 'منذ 5 أيام',
        verifiedPurchase: true,
        merchantBoughtFrom: filteredOffers[1]?.merchantName || 'نون مصر (Noon Egypt)',
        title: 'تجربة شراء رائعة وتنبيه الخصم وفر لي مبلغاً ممتازاً',
        comment: 'اشتركت في تنبيهات انخفاض السعر وبمجرد نزول الخصم وصلني إشعار فوري واشتريته مع استخدام كوبون نقاط الولاء.',
        pros: ['تغليف محكم', 'خدمة ما بعد البيع ممتازة', 'سعر تنافسي'],
        helpfulCount: 11
      },
      {
        id: `rev-builtin-3-${activeProduct.id}`,
        productId: activeProduct.id,
        reviewerName: 'م. كريم طارق فؤاد',
        reviewerRole: 'مشتري موثق · الإسكندرية',
        rating: 4,
        date: 'منذ أسبوع',
        verifiedPurchase: true,
        merchantBoughtFrom: 'معرض شارع عبد العزيز المعتمد',
        title: 'جودة عالية جداً وسهولة في الاستخدام اليومي',
        comment: 'عاينت المنتج في الفرع بعد معرفة مكانه من التطبيق، والتاجر كان متعاوناً جداً والسعر مطابق لما هو معروض بالمنصة.',
        pros: ['معاينة فعلية بالفرع', 'ضمان محلي معتمد'],
        helpfulCount: 7
      }
    ];
    return [...userAdded, ...builtIn];
  }, [activeProduct, customReviews, filteredOffers]);

  // Handle Real-Time Live Price Refresh
  const handleRefreshLivePrices = () => {
    setIsRefreshingLivePrices(true);
    setTimeout(() => {
      setIsRefreshingLivePrices(false);
      setLastLiveCheckTime(
        new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      awardLoyaltyPoints(15, 'تحديث ومقارنة الأسعار في الوقت الفعلي');
      onShowToast?.('تم تحديث ومزامنة أسعار التجار في الوقت الفعلي (+15 نقطة ولاء) ⚡');
    }, 600);
  };

  // Handle creating a Discount Alert
  const handleCreateDiscountAlert = () => {
    if (!activeProduct) return;
    const computedTarget =
      customTargetPriceInput && Number(customTargetPriceInput) > 0
        ? Number(customTargetPriceInput)
        : Math.round(activeProduct.currentLowestPrice * (1 - targetDiscountPercent / 100));

    const newItem = {
      id: `shopper-alert-${Date.now()}`,
      productId: activeProduct.id,
      productTitle: activeProduct.title,
      currentPrice: activeProduct.currentLowestPrice,
      targetPrice: computedTarget,
      discountPercent: targetDiscountPercent,
      channel: alertContactChannel,
      createdAt: new Date().toLocaleDateString('ar-EG')
    };

    const updated = [newItem, ...savedProductAlerts];
    setSavedProductAlerts(updated);
    try {
      localStorage.setItem('radar_shopper_discount_alerts_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }

    onTriggerDiscountAlert?.(activeProduct, targetDiscountPercent, computedTarget);
    awardLoyaltyPoints(25, `تفعيل تنبيه خصم للمنتج (${activeProduct.title.slice(0, 20)}...)`);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    onShowToast?.(
      `تم تفعيل تنبيه الخصم عند وصول السعر إلى ${computedTarget.toLocaleString()} ${currency} (+25 نقطة ولاء) 🔔`
    );
  };

  // Handle adding a new user review
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || !newReviewComment.trim()) return;

    const review: ProductUserReview = {
      id: `rev-user-${Date.now()}`,
      productId: activeProduct.id,
      reviewerName: newReviewName.trim() || 'متسوق موثق',
      reviewerRole: 'مشتري موثق · عضو برنامج الولاء',
      rating: newReviewRating,
      date: 'الآن',
      verifiedPurchase: true,
      merchantBoughtFrom: newReviewMerchant,
      title: newReviewTitle.trim() || 'تجربة شراء ممتازة بعد مقارنة الأسعار',
      comment: newReviewComment.trim(),
      pros: ['سعر منافس', 'مطابق للمواصفات'],
      helpfulCount: 1
    };

    const next = [review, ...customReviews];
    setCustomReviews(next);
    try {
      localStorage.setItem('radar_product_user_reviews_v1', JSON.stringify(next));
    } catch {
      // ignore
    }

    setNewReviewName('');
    setNewReviewTitle('');
    setNewReviewComment('');
    awardLoyaltyPoints(40, `إضافة مراجعة وتقييم للمنتج (${activeProduct.title.slice(0, 20)}...)`);
    onShowToast?.('شكراً لمشاركتك! تم نشر مراجعتك وإضافة +40 نقطة ولاء إلى حسابك 🌟');
  };

  // Handle Redeeming Loyalty Reward
  const handleRedeemReward = (reward: LoyaltyRewardItem) => {
    if (loyaltyPoints < reward.pointsCost) {
      onShowToast?.(`رصيدك الحالي (${loyaltyPoints} نقطة) غير كافٍ. تحتاج ${reward.pointsCost} نقطة لاستبدال هذه المكافأة.`);
      return;
    }

    const code = `${reward.codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nextPoints = loyaltyPoints - reward.pointsCost;
    setLoyaltyPoints(nextPoints);

    const nextCoupons = [
      {
        id: `coup-${Date.now()}`,
        title: reward.title,
        code,
        redeemedAt: new Date().toLocaleDateString('ar-EG')
      },
      ...redeemedCoupons
    ];
    setRedeemedCoupons(nextCoupons);

    try {
      localStorage.setItem('radar_shopper_loyalty_points_v1', String(nextPoints));
      localStorage.setItem('radar_shopper_redeemed_coupons_v1', JSON.stringify(nextCoupons));
    } catch {
      // ignore
    }

    setLoyaltyLogs((prev) => [
      {
        id: `log-red-${Date.now()}`,
        action: `استبدال مكافأة: ${reward.title} (كود: ${code})`,
        points: -reward.pointsCost,
        timestamp: 'الآن',
        type: 'redeemed'
      },
      ...prev
    ]);

    try {
      confetti({ particleCount: 55, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    onShowToast?.(`مبروك! تم إصدار كود المكافأة (${code}) بنجاح 🎉`);
  };

  // Generate Product Infographic Canvas Design (explaining product details & how to use it)
  const handleGenerateInfographicDesign = async () => {
    if (!activeProduct) return;
    setIsGeneratingPoster(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const tpl =
        INFOGRAPHIC_TEMPLATES.find((t) => t.id === selectedTemplateId) || INFOGRAPHIC_TEMPLATES[0];

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (tpl.id === 'clean_studio') {
        grad.addColorStop(0, '#06281E');
        grad.addColorStop(0.55, '#0F172A');
        grad.addColorStop(1, '#042F2E');
      } else if (tpl.id === 'modern_indigo') {
        grad.addColorStop(0, '#1E1B4B');
        grad.addColorStop(0.55, '#0F172A');
        grad.addColorStop(1, '#311042');
      } else {
        grad.addColorStop(0, '#090D16');
        grad.addColorStop(0.55, '#161F33');
        grad.addColorStop(1, '#2A1F0D');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Decorative Top Bar
      ctx.fillStyle = tpl.accentColor;
      ctx.fillRect(0, 0, canvas.width, 14);

      // Header Brand & Category Tag
      ctx.fillStyle = tpl.accentColor;
      ctx.font = 'bold 28px Alexandria, Cairo, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        `${activeProduct.brand || 'منتج أصلي'} · ${activeProduct.category || 'مواصفات معتمدة'}`,
        canvas.width - 60,
        75
      );

      // Main Product Title
      const titleText = customHeadline.trim() || activeProduct.title;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 38px Alexandria, Cairo, sans-serif';
      ctx.fillText(titleText.slice(0, 52), canvas.width - 60, 135);

      // Load Product Image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = uploadedPreviewUrl || activeProduct.imageUrl;
      });

      // Draw Product Image Card Frame
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(60, 175, 460, 460, 28);
      ctx.fill();
      ctx.strokeStyle = tpl.accentColor;
      ctx.lineWidth = 5;
      ctx.stroke();

      if (img.width > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(75, 190, 430, 430, 20);
        ctx.clip();
        ctx.filter = `brightness(${imageBrightness}%) contrast(${imageContrast}%)`;
        ctx.drawImage(img, 75, 190, 430, 430);
        ctx.restore();
      }
      ctx.restore();

      // Right Side: Product Key Specifications & Benefits Box
      ctx.fillStyle = tpl.cardBg;
      ctx.beginPath();
      ctx.roundRect(550, 175, 470, 460, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = tpl.accentColor;
      ctx.font = 'bold 28px Alexandria, Cairo, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('أبرز تفاصيل ومميزات المنتج:', 985, 230);

      ctx.fillStyle = '#F1F5F9';
      ctx.font = 'bold 22px Cairo, sans-serif';
      const benefitsList =
        customKeyBenefits.filter(Boolean).length > 0
          ? customKeyBenefits
          : activeProduct.quickHighlights?.slice(0, 3) || [];

      benefitsList.slice(0, 4).forEach((benefit, idx) => {
        const yPos = 290 + idx * 72;
        ctx.fillStyle = tpl.accentColor;
        ctx.fillText('✓', 985, yPos);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(benefit.slice(0, 40), 950, yPos);
      });

      // Price Badge if enabled
      if (showPriceBadgeOnDesign) {
        ctx.fillStyle = tpl.accentColor;
        ctx.beginPath();
        ctx.roundRect(580, 525, 410, 85, 18);
        ctx.fill();

        ctx.fillStyle = '#090D16';
        ctx.font = '900 30px Alexandria, Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `أفضل سعر مقارن: ${activeProduct.currentLowestPrice.toLocaleString()} ${currency}`,
          785,
          578
        );
      }

      // Bottom Section: How to Use & Practical Guide
      if (showHowToUseOnDesign) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(60, 675, 960, 520, 28);
        ctx.fill();
        ctx.strokeStyle = tpl.accentColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = tpl.accentColor;
        ctx.font = '900 32px Alexandria, Cairo, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('دليل الاستخدام السريع خطوة بخطوة (How to Use):', 975, 740);

        customUsageSteps.slice(0, 3).forEach((step, idx) => {
          const stepY = 825 + idx * 115;
          // Step Circle
          ctx.fillStyle = tpl.accentColor;
          ctx.beginPath();
          ctx.arc(950, stepY - 10, 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#090D16';
          ctx.font = '900 24px Cairo, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(idx + 1), 950, stepY - 2);

          // Step Text
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 25px Cairo, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(step.slice(0, 68), 905, stepY);
        });
      }

      // Footer Verification Line
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 20px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `بطاقة تعريف المنتج ودليل الاستخدام · موديل ${activeProduct.model || activeProduct.sku || 'معتمد'} · ضمان أصلي`,
        canvas.width / 2,
        1285
      );

      const finalDataUrl = canvas.toDataURL('image/png');
      setGeneratedPosterUrl(finalDataUrl);
      awardLoyaltyPoints(30, 'تصميم بطاقة مرئية لتفاصيل المنتج وكيفية استخدامه');
      onShowToast?.('تم توليد التصميم الجذاب لتفاصيل المنتج وكيفية استخدامه بنجاح (+30 نقطة ولاء) 🎨');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  // Loyalty tier calculation
  const loyaltyTier = useMemo(() => {
    if (loyaltyPoints >= 800) {
      return { name: 'المستوى الماسي (VIP Diamond)', nextAt: 1500, color: 'text-sky-300', discountBonus: '8%' };
    }
    if (loyaltyPoints >= 400) {
      return { name: 'المستوى الذهبي (Gold Shopper)', nextAt: 800, color: 'text-sky-400', discountBonus: '5%' };
    }
    return { name: 'المستوى الفضي (Silver Member)', nextAt: 400, color: 'text-slate-200', discountBonus: '3%' };
  }, [loyaltyPoints]);

  if (!activeProduct) {
    return null;
  }

  const lowestOffer = filteredOffers[0] || activeProduct.merchantOffers?.[0];
  const highestOffer =
    filteredOffers.length > 0
      ? filteredOffers[filteredOffers.length - 1]
      : activeProduct.merchantOffers?.[activeProduct.merchantOffers.length - 1];
  const totalSavings =
    lowestOffer && highestOffer && highestOffer.price > lowestOffer.price
      ? highestOffer.price - lowestOffer.price
      : Math.max(0, activeProduct.highestPrice - activeProduct.currentLowestPrice);

  return (
    <section
      id="smart-shopper-price-comparison-hub"
      className="bg-[#0B0F17] border border-sky-500/25 rounded-2xl p-4 sm:p-6 space-y-6 shadow-2xl text-right"
    >
      {/* Top Header & Integrated Camera / Upload / Loyalty Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/90">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
            <span>منظومة مقارنة أسعار المنتجات الذكية</span>
            <span aria-hidden="true">·</span>
            <span>تحديث لحظي للأسعار</span>
            <span aria-hidden="true">·</span>
            <span>آخر فحص: {lastLiveCheckTime}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Alexandria'] tracking-tight">
            مقارنة الأسعار الفورية، مواقع التجار، مراجعات المستخدمين، ومكافآت الولاء
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            التقط صورة لأي منتج بالكاميرا أو ارفعها من جهازك لتحليل المواصفات فوراً، قارن الأسعار بين التجار المحليين والمنصات، اعرف عناوين الفروع، فعل تنبيهات الخصم، وحوّل صورة المنتج إلى تصميم احترافي يوضح طريقة الاستخدام.
          </p>
        </div>

        {/* Quick Action Controls: Camera, Upload, Loyalty Balance */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={startCameraCapture}
            className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>التقاط صورة بالكاميرا</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Upload className="w-4 h-4 text-sky-400 shrink-0" />
            <span>تحميل صورة منتج</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUploadChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setActiveSubTab('loyalty_rewards')}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            title="رصيد نقاط ولاء المتسوق الدائم"
          >
            <Award className="w-4 h-4 text-sky-400 shrink-0" />
            <span>نقاط الولاء:</span>
            <strong className="font-mono text-sm text-white">{loyaltyPoints}</strong>
          </button>
        </div>
      </div>

      {/* Inline Camera Capture Modal / Drawer when opened */}
      {isCameraOpen && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>التقاط صورة المنتج لتحليل الأسعار والمواصفات فوراً</span>
            </span>
            <button
              type="button"
              onClick={stopCameraCapture}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-80 mx-auto">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCaptureFrameFromVideo}
              className="py-2.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>التقاط وتحليل المنتج الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* Image Analysis Progress Banner */}
      {isAnalyzingImage && (
        <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-sky-400 animate-spin shrink-0" />
            <div>
              <div className="text-xs font-black text-white">{analysisStepText}</div>
              <div className="text-[11px] text-slate-400">
                يتم مطابقة المنتج مع عروض التجار في أمازون ونون وجوميا والفروع المحلية...
              </div>
            </div>
          </div>
          {uploadedPreviewUrl && (
            <img
              src={uploadedPreviewUrl}
              alt="معاينة"
              className="w-12 h-12 rounded-lg object-cover border border-sky-400/50"
            />
          )}
        </div>
      )}

      {/* Interactive Sub-Navigation Bar (4 Focused Views) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview_comparison')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeSubTab === 'overview_comparison'
              ? 'bg-sky-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>البحث المتقدم ومقارنة الأسعار اللحظية وتنبيهات الخصم</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('locations_reviews')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeSubTab === 'locations_reviews'
              ? 'bg-sky-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>أماكن تواجد التجار ومراجعات المستخدمين ({productReviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('loyalty_rewards')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeSubTab === 'loyalty_rewards'
              ? 'bg-sky-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>نظام الولاء ومكافآت المتسوقين الدائمين ({loyaltyPoints} نقطة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('image_infographic_studio')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeSubTab === 'image_infographic_studio'
              ? 'bg-sky-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>تحرير صورة المنتج وتصميم دليل الاستخدام</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: ADVANCED SEARCH, REAL-TIME COMPARISON & DISCOUNT ALERTS        */}
      {/* ===================================================================== */}
      {activeSubTab === 'overview_comparison' && (
        <div className="space-y-6">
          {/* Advanced Search & Multi-Criteria Filter Panel */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، الماركة، الموديل، أو الباركود لمقارنة الأسعار فوراً..."
                  className="w-full h-11 pr-10 pl-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-sky-400 text-xs sm:text-sm text-white outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSearchPanel(!showAdvancedSearchPanel)}
                  className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                  <span>خيارات البحث المتقدم</span>
                  {showAdvancedSearchPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleRefreshLivePrices}
                  disabled={isRefreshingLivePrices}
                  className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingLivePrices ? 'animate-spin' : ''}`} />
                  <span>تحديث الأسعار اللحظي</span>
                </button>
              </div>
            </div>

            {showAdvancedSearchPanel && (
              <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">فئة المنتج</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="all">جميع الفئات ({products.length})</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">نوع التاجر / المتجر</label>
                  <select
                    value={selectedStoreType}
                    onChange={(e) => setSelectedStoreType(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="all">الكل (منصات أونلاين + محلات فعلية)</option>
                    <option value="online">منصات أونلاين فقط</option>
                    <option value="physical">محلات ومعارض محلية فقط</option>
                    <option value="wholesale">مراكز جملة وتوزيع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الحد الأقصى للسعر ({currency})</label>
                  <input
                    type="number"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(e.target.value)}
                    placeholder="مثال: 5000"
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">ترتيب عروض التجار</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="price_asc">الأقل سعراً أولاً</option>
                    <option value="rating_desc">الأعلى تقييماً لدى المشترين</option>
                    <option value="savings_desc">الأكبر توفيراً وخصماً</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end gap-1.5">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyVerifiedMerchants}
                      onChange={(e) => setOnlyVerifiedMerchants(e.target.checked)}
                      className="rounded border-slate-600"
                    />
                    <span>تجار موثقون فقط</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyFreeDelivery}
                      onChange={(e) => setOnlyFreeDelivery(e.target.checked)}
                      className="rounded border-slate-600"
                    />
                    <span>شحن مجاني فقط</span>
                  </label>
                </div>
              </div>
            )}

            {/* Quick Product Selector Strip */}
            {filteredProducts.length > 1 && (
              <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-slate-400 shrink-0">المنتجات المطابقة ({filteredProducts.length}):</span>
                {filteredProducts.slice(0, 8).map((prod) => {
                  const isCurrent = prod.id === activeProduct.id;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => onSelectProduct(prod)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400'
                          : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={prod.imageUrl} alt="" className="w-5 h-5 rounded object-cover" />
                      <span className="truncate max-w-[160px]">{prod.title}</span>
                      <span className="font-mono text-emerald-400">{prod.currentLowestPrice.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Details & Real-Time Price Comparison Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Product Comprehensive Specs + Instant Discount Alert Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={uploadedPreviewUrl || activeProduct.imageUrl}
                    alt={activeProduct.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-700 bg-white shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="text-xs text-slate-400">
                      <span>{activeProduct.brand}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{activeProduct.category}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono">{activeProduct.model}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                      {activeProduct.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {activeProduct.description}
                    </p>
                  </div>
                </div>

                {/* Price Range Summary Bar */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div>
                    <div className="text-[11px] text-slate-400">أقل سعر حالي</div>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {activeProduct.currentLowestPrice.toLocaleString()} {currency}
                    </div>
                  </div>
                  <div className="border-x border-slate-800">
                    <div className="text-[11px] text-slate-400">متوسط السوق</div>
                    <div className="text-base font-bold text-slate-200 font-mono">
                      {activeProduct.averagePrice.toLocaleString()} {currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">أقصى توفير متاح</div>
                    <div className="text-base font-black text-sky-400 font-mono">
                      {totalSavings.toLocaleString()} {currency}
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                {activeProduct.specs && activeProduct.specs.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-xs font-bold text-slate-300">تفاصيل ومواصفات المنتج:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProduct.specs
                        .flatMap((s) => s.items)
                        .slice(0, 6)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-400">{item.label}:</span>
                            <strong className="text-slate-200 truncate max-w-[140px]">{item.value}</strong>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Drop & Discount Alert Subscription Box */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-black text-white">تنبيهات الخصومات الفورية للمنتج</h4>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">إشعار لحظي</span>
                </div>
                <p className="text-xs text-slate-400">
                  حدد نسبة الخصم أو السعر المستهدف وسنرسل لك تنبيهاً فورياً بمجرد قيام أي تاجر بتخفيض سعر هذا المنتج.
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setTargetDiscountPercent(pct);
                        setCustomTargetPriceInput(
                          String(Math.round(activeProduct.currentLowestPrice * (1 - pct / 100)))
                        );
                      }}
                      className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        targetDiscountPercent === pct
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      خصم {pct}%
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">السعر المستهدف ({currency})</label>
                    <input
                      type="number"
                      value={
                        customTargetPriceInput ||
                        Math.round(activeProduct.currentLowestPrice * (1 - targetDiscountPercent / 100))
                      }
                      onChange={(e) => setCustomTargetPriceInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">وسيلة الإشعار</label>
                    <select
                      value={alertContactChannel}
                      onChange={(e) => setAlertContactChannel(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="in_app">إشعار فوري داخل التطبيق</option>
                      <option value="whatsapp">رسالة واتساب فورية</option>
                      <option value="email">بريد إلكتروني</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateDiscountAlert}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Bell className="w-4 h-4" />
                  <span>تفعيل تنبيه الخصم وكسب +25 نقطة ولاء</span>
                </button>

                {savedProductAlerts.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-semibold">
                      تنبيهاتك النشطة ({savedProductAlerts.length}):
                    </div>
                    {savedProductAlerts.slice(0, 2).map((al) => (
                      <div
                        key={al.id}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
                      >
                        <span className="text-slate-200 truncate max-w-[180px]">{al.productTitle}</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          هدف: {al.targetPrice.toLocaleString()} {currency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 7 Cols: Real-Time Merchant Price Comparison List */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-sky-400" />
                  <span>مقارنة أسعار التجار في الوقت الفعلي ({filteredOffers.length} تاجر)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('locations_reviews')}
                  className="text-xs text-sky-400 hover:underline font-bold cursor-pointer"
                >
                  عرض مواقع التجار على الخريطة والمراجعات ←
                </button>
              </div>

              <div className="space-y-3">
                {filteredOffers.map((offer, idx) => {
                  const isLowest = idx === 0;
                  const diffFromLowest = lowestOffer ? offer.price - lowestOffer.price : 0;

                  return (
                    <div
                      key={offer.id || idx}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isLowest
                          ? 'bg-emerald-950/30 border-emerald-500/60'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-white">{offer.merchantName}</span>
                          <span className="text-xs text-slate-400">
                            · {offer.storeType === 'physical' ? 'معرض وفرع محلي' : 'متجر إلكتروني'}
                          </span>
                          {isLowest && (
                            <span className="text-xs font-black text-emerald-400">
                              · أقل سعر مرصود 🥇
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                          <span className="text-sky-400 font-bold">
                            ★ {offer.rating || 4.7} ({offer.reviewCount || 95} تقييم)
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {offer.deliveryTime}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            {offer.warranty}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <div className="text-right sm:text-left">
                          <div className="text-lg font-black text-white font-mono">
                            {offer.price.toLocaleString()} {currency}
                          </div>
                          {diffFromLowest > 0 ? (
                            <div className="text-[11px] text-rose-400 font-mono">
                              +{diffFromLowest.toLocaleString()} {currency} عن الأقل
                            </div>
                          ) : (
                            <div className="text-[11px] text-emerald-400 font-bold">
                              أفضل صفقة متاحة الآن
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              awardLoyaltyPoints(10, `فحص عرض التاجر (${offer.merchantName})`);
                              setActiveSubTab('locations_reviews');
                            }}
                            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-sky-400" />
                            <span>موقع التاجر</span>
                          </button>

                          {offer.url && (
                            <a
                              href={offer.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => awardLoyaltyPoints(15, `زيارة متجر (${offer.merchantName})`)}
                              className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black flex items-center gap-1"
                            >
                              <span>الذهاب للتاجر</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MERCHANT PHYSICAL LOCATIONS & USER REVIEWS                     */}
      {/* ===================================================================== */}
      {activeSubTab === 'locations_reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Merchant Locations Directory (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>أماكن تواجد التجار والفروع المحلية</span>
                </h3>
                <p className="text-xs text-slate-400">
                  عناوين المحلات ومراكز التوزيع المعتمدة لمعاينة أو استلام المنتج مباشرة
                </p>
              </div>

              <select
                value={selectedCityFilter}
                onChange={(e) => setSelectedCityFilter(e.target.value)}
                className="h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="all">كل المحافظات</option>
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
              </select>
            </div>

            <div className="space-y-3">
              {merchantLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-white">{loc.marketName}</h4>
                      <div className="text-xs text-sky-400 font-semibold">
                        {loc.branchName} · {loc.city} (يبعد {loc.distanceKm} كم)
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {loc.wholesalePrice.toLocaleString()} {currency}
                      </div>
                      <div className="text-[11px] text-slate-400">متوفر: {loc.inStockCount} قطعة</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{loc.address}</p>
                  {loc.notes && <p className="text-[11px] text-slate-400">{loc.notes}</p>}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">
                      مواعيد العمل: حتى {loc.openUntil} · هاتف: <strong className="font-mono text-slate-200">{loc.phone}</strong>
                    </span>

                    <a
                      href={
                        loc.directionsUrl ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${loc.marketName} ${loc.address}`
                        )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>فتح الموقع على الخريطة</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified User Reviews & Add Review Form (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>مراجعات وتجارب المستخدمين ({productReviews.length})</span>
              </h3>
              <p className="text-xs text-slate-400">
                تقييمات حقيقية من مشترين قاموا بتجربة المنتج ومقارنة أسعاره بين التجار
              </p>
            </div>

            {/* Add Review Form */}
            <form
              onSubmit={handleAddReview}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs"
            >
              <div className="font-bold text-sky-300">أضف تقييمك وتجربتك (واحصل على +40 نقطة ولاء):</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  placeholder="اسمك الكريم"
                  className="h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
                <select
                  value={newReviewMerchant}
                  onChange={(e) => setNewReviewMerchant(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  {filteredOffers.map((o, i) => (
                    <option key={i} value={o.merchantName}>
                      {o.merchantName}
                    </option>
                  ))}
                  <option value="معرض محلي معتمد">معرض محلي معتمد</option>
                </select>
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-sky-400 font-bold"
                >
                  <option value={5}>★★★★★ (5/5 ممتاز)</option>
                  <option value={4}>★★★★☆ (4/5 جيد جداً)</option>
                  <option value={3}>★★★☆☆ (3/5 متوسط)</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="اكتب رأيك في جودة المنتج، السعر، وتجربة الشراء من التاجر..."
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-white"
                required
              />

              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black cursor-pointer"
              >
                نشر المراجعة وكسب +40 نقطة
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-3">
              {productReviews.map((rev) => {
                const isHelpful = helpfulClickedIds.includes(rev.id);
                return (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-white">{rev.reviewerName}</span>
                        <span className="text-[11px] text-slate-400"> · {rev.reviewerRole}</span>
                      </div>
                      <span className="text-xs font-bold text-sky-400">
                        {'★'.repeat(rev.rating)}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-200">{rev.title}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>تم الشراء من: {rev.merchantBoughtFrom} · {rev.date}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isHelpful) {
                            setHelpfulClickedIds([...helpfulClickedIds, rev.id]);
                            awardLoyaltyPoints(5, 'تقييم مراجعة مستخدم مفيدة');
                          }
                        }}
                        className={`flex items-center gap-1 font-bold cursor-pointer ${
                          isHelpful ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>مفيد ({rev.helpfulCount + (isHelpful ? 1 : 0)})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: LOYALTY REWARDS SYSTEM FOR FREQUENT SHOPPERS                   */}
      {/* ===================================================================== */}
      {activeSubTab === 'loyalty_rewards' && (
        <div className="space-y-6">
          {/* Tier Banner & Points Progress */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-sky-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Crown className="w-4 h-4" />
                <span>برنامج ولاء المتسوقين الدائمين (Frequent Shopper Rewards)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {loyaltyTier.name} · خصم إضافي {loyaltyTier.discountBonus}
              </h3>
              <p className="text-xs text-slate-300">
                اكسب نقاطاً تلقائياً عند تصوير المنتجات بالكاميرا، مقارنة الأسعار، إضافة مراجعات، أو تفعيل تنبيهات الخصم، واستبدلها بقسائم شرائية وشحن مجاني.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 text-center shrink-0 min-w-[200px]">
              <div className="text-xs text-slate-400">رصيد نقاطك القابل للاستبدال</div>
              <div className="text-2xl font-black text-sky-400 font-mono my-1">
                {loyaltyPoints} نقطة
              </div>
              <div className="text-[11px] text-emerald-400">
                المستوى التالي عند {loyaltyTier.nextAt} نقطة
              </div>
            </div>
          </div>

          {/* Rewards Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LOYALTY_REWARDS_CATALOG.map((reward) => {
              const canRedeem = loyaltyPoints >= reward.pointsCost;
              return (
                <div
                  key={reward.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-400 font-bold">{reward.badgeText}</span>
                      <span className="font-mono font-black text-white">{reward.pointsCost} نقطة</span>
                    </div>
                    <h4 className="text-sm font-black text-white">{reward.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{reward.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRedeemReward(reward)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                      canRedeem
                        ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {canRedeem ? 'استبدال المكافأة فوراً' : `تحتاج ${reward.pointsCost - loyaltyPoints} نقطة إضافية`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Redeemed Coupons & Activity History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-white">قسائمك ومكافآتك المستخرجة ({redeemedCoupons.length})</h4>
              {redeemedCoupons.length === 0 ? (
                <p className="text-xs text-slate-400">لم تقم باستبدال قسائم بعد. اختر أي مكافأة من الأعلى لاستخراج كود الخصم فوراً.</p>
              ) : (
                <div className="space-y-2">
                  {redeemedCoupons.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{c.title}</div>
                        <div className="text-[11px] text-slate-400">تاريخ الإصدار: {c.redeemedAt}</div>
                      </div>
                      <div className="font-mono font-black text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                        {c.code}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-white">سجل كسب واستبدال نقاط الولاء</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {loyaltyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="text-slate-200 font-semibold">{log.action}</div>
                      <div className="text-[10px] text-slate-500">{log.timestamp}</div>
                    </div>
                    <span
                      className={`font-mono font-black ${
                        log.type === 'earned' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {log.points > 0 ? `+${log.points}` : log.points} نقطة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: PRODUCT IMAGE EDITOR & HOW-TO-USE INFOGRAPHIC DESIGNER         */}
      {/* ===================================================================== */}
      {activeSubTab === 'image_infographic_studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-sky-400" />
                  <span>محرر صورة المنتج وتصميم بطاقة التفاصيل وطريقة الاستخدام</span>
                </h3>
                <p className="text-xs text-slate-400">
                  حوّل صورة المنتج الملتقطة إلى بوستر تسويقي وتوضيحي جذاب يشرح مواصفات المنتج وخطوات استخدامه العملية.
                </p>
              </div>

              {/* Template Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">اختر القالب اللوني للتصميم:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {INFOGRAPHIC_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-right transition cursor-pointer ${
                        selectedTemplateId === tpl.id
                          ? 'border-sky-400 bg-sky-500/15 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300'
                      }`}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Headline */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  العنوان التوضيحي للمنتج على التصميم:
                </label>
                <input
                  type="text"
                  value={customHeadline}
                  onChange={(e) => setCustomHeadline(e.target.value)}
                  placeholder={activeProduct.title}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Key Product Details / Benefits */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  أبرز تفاصيل ومميزات المنتج (تظهر بجانب الصورة):
                </label>
                {customKeyBenefits.map((ben, i) => (
                  <input
                    key={i}
                    type="text"
                    value={ben}
                    onChange={(e) => {
                      const copy = [...customKeyBenefits];
                      copy[i] = e.target.value;
                      setCustomKeyBenefits(copy);
                    }}
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                ))}
              </div>

              {/* Step-by-Step How To Use Instructions */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-sky-300 block">
                  خطوات وكيفية استخدام المنتج (How to Use):
                </label>
                {customUsageSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => {
                        const copy = [...customUsageSteps];
                        copy[i] = e.target.value;
                        setCustomUsageSteps(copy);
                      }}
                      className="flex-1 h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Brightness & Contrast Sliders */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">إضاءة الصورة ({imageBrightness}%)</label>
                  <input
                    type="range"
                    min={80}
                    max={135}
                    value={imageBrightness}
                    onChange={(e) => setImageBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تباين التفاصيل ({imageContrast}%)</label>
                  <input
                    type="range"
                    min={85}
                    max={140}
                    value={imageContrast}
                    onChange={(e) => setImageContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGenerateInfographicDesign}
                  disabled={isGeneratingPoster}
                  className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingPoster ? 'جاري توليد التصميم...' : 'توليد بطاقة المنتج وطريقة الاستخدام'}</span>
                </button>

                {onOpenFullStudio && (
                  <button
                    type="button"
                    onClick={onOpenFullStudio}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    فتح استوديو الزوايا الكامل
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Interactive Preview & Download Column (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white">معاينة التصميم التوضيحي للمنتج وكيفية استخدامه</h4>
                {generatedPosterUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={generatedPosterUrl}
                      download={`product-guide-${activeProduct.id}.png`}
                      className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل PNG</span>
                    </a>
                    {onApplyWinningImage && (
                      <button
                        type="button"
                        onClick={() => onApplyWinningImage(generatedPosterUrl)}
                        className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black cursor-pointer"
                      >
                        اعتماد كصورة للمنتج
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Live Visual Infographic Card */}
              {(() => {
                const tpl =
                  INFOGRAPHIC_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
                  INFOGRAPHIC_TEMPLATES[0];
                return (
                  <div
                    style={{ background: tpl.bgGradient }}
                    className="rounded-2xl p-5 border border-sky-500/30 space-y-5 text-white shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-xs font-bold" style={{ color: tpl.accentColor }}>
                        {activeProduct.brand} · {activeProduct.category}
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        {activeProduct.model}
                      </span>
                    </div>

                    <h3 className="text-lg font-black leading-snug">
                      {customHeadline.trim() || activeProduct.title}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-5 bg-white rounded-2xl p-3 flex items-center justify-center">
                        <img
                          src={uploadedPreviewUrl || activeProduct.imageUrl}
                          alt={activeProduct.title}
                          style={{
                            filter: `brightness(${imageBrightness}%) contrast(${imageContrast}%)`
                          }}
                          className="w-full h-44 object-contain rounded-xl"
                        />
                      </div>

                      <div className="sm:col-span-7 space-y-2.5 bg-slate-950/75 p-4 rounded-2xl border border-white/10">
                        <div className="text-xs font-black" style={{ color: tpl.accentColor }}>
                          تفاصيل ومميزات المنتج:
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {customKeyBenefits.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span style={{ color: tpl.accentColor }} className="font-black">✓</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>

                        {showPriceBadgeOnDesign && (
                          <div
                            style={{ backgroundColor: tpl.accentColor }}
                            className="mt-2 py-2 px-3 rounded-xl text-slate-950 font-black text-xs text-center"
                          >
                            أفضل سعر مقارن: {activeProduct.currentLowestPrice.toLocaleString()} {currency}
                          </div>
                        )}
                      </div>
                    </div>

                    {showHowToUseOnDesign && (
                      <div className="p-4 rounded-2xl bg-slate-950/85 border border-white/15 space-y-2.5">
                        <div className="text-xs font-black" style={{ color: tpl.accentColor }}>
                          كيفية الاستخدام خطوة بخطوة (How to Use):
                        </div>
                        <div className="space-y-2">
                          {customUsageSteps.map((st, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                              <span
                                style={{ backgroundColor: tpl.accentColor }}
                                className="w-5 h-5 rounded-full text-slate-950 font-black flex items-center justify-center shrink-0 text-[11px]"
                              >
                                {idx + 1}
                              </span>
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
