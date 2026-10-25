import React, { useState, useEffect } from 'react';
import { 
  X, 
  Link as LinkIcon, 
  DollarSign, 
  Store, 
  Tag, 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  Globe, 
  FileText,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { WatchlistItem, ProductData, MerchantOffer } from '../types';

interface AddWatchlistManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newItem: WatchlistItem) => void;
  currency?: string;
}

interface PlatformOption {
  code: string;
  name: string;
  domainPattern: RegExp;
  badgeBg: string;
  badgeText: string;
  logo: string;
  defaultImage: string;
}

const SUPPORTED_PLATFORMS: PlatformOption[] = [
  {
    code: 'amazon_eg',
    name: 'أمازون مصر',
    domainPattern: /amazon\.eg|amazon\.com/i,
    badgeBg: 'bg-amber-100 border-amber-300 text-amber-900',
    badgeText: 'أمازون مصر',
    logo: '🛒',
    defaultImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: 'noon_eg',
    name: 'نون مصر',
    domainPattern: /noon\.com/i,
    badgeBg: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    badgeText: 'نون مصر',
    logo: '🟡',
    defaultImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: 'jumia_eg',
    name: 'جوميا مصر',
    domainPattern: /jumia\.com\.eg|jumia\.com/i,
    badgeBg: 'bg-orange-100 border-orange-300 text-orange-900',
    badgeText: 'جوميا مصر',
    logo: '🟠',
    defaultImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: 'btech',
    name: 'بي تك (B.TECH)',
    domainPattern: /btech\.com/i,
    badgeBg: 'bg-blue-100 border-blue-300 text-blue-900',
    badgeText: 'B.TECH',
    logo: '🔵',
    defaultImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: '2b',
    name: '2B Egypt',
    domainPattern: /2b\.com\.eg/i,
    badgeBg: 'bg-purple-100 border-purple-300 text-purple-900',
    badgeText: '2B Computer',
    logo: '💻',
    defaultImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: 'elarabyelectric',
    name: 'مجموعة العربي',
    domainPattern: /elarabygroup\.com/i,
    badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    badgeText: 'العربي جروب',
    logo: '🏭',
    defaultImage: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: 'homzmart_eg',
    name: 'هومزمارت',
    domainPattern: /homzmart\.com/i,
    badgeBg: 'bg-teal-100 border-teal-300 text-teal-900',
    badgeText: 'Homzmart',
    logo: '🛋️',
    defaultImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: 'kenzz_eg',
    name: 'كنز Kenzz',
    domainPattern: /kenzz\.com/i,
    badgeBg: 'bg-pink-100 border-pink-300 text-pink-900',
    badgeText: 'Kenzz',
    logo: '🏷️',
    defaultImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: 'raneen',
    name: 'رنين Raneen',
    domainPattern: /raneen\.com/i,
    badgeBg: 'bg-rose-100 border-rose-300 text-rose-900',
    badgeText: 'رنين',
    logo: '🏬',
    defaultImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60'
  },
  {
    code: 'other',
    name: 'متجر آخر / إلكتروني مستقل',
    domainPattern: /.*/,
    badgeBg: 'bg-slate-100 border-slate-300 text-slate-800',
    badgeText: 'متجر مستقل',
    logo: '🌐',
    defaultImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
  }
];

export const AddWatchlistManualModal: React.FC<AddWatchlistManualModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  currency = 'ج.م',
}) => {
  const [productUrl, setProductUrl] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [selectedPlatformCode, setSelectedPlatformCode] = useState<string>('amazon_eg');
  const [merchantNotes, setMerchantNotes] = useState('');
  const [autoTrack, setAutoTrack] = useState(true);
  const [detectedDomainLabel, setDetectedDomainLabel] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-detect platform when product URL changes
  useEffect(() => {
    if (!productUrl.trim()) {
      setDetectedDomainLabel(null);
      return;
    }

    const matched = SUPPORTED_PLATFORMS.find(p => p.code !== 'other' && p.domainPattern.test(productUrl));
    if (matched) {
      setSelectedPlatformCode(matched.code);
      setDetectedDomainLabel(`تم التعرف تلقائياً على منصة: ${matched.name}`);
    } else {
      setDetectedDomainLabel(null);
    }
  }, [productUrl]);

  if (!isOpen) return null;

  const handleUrlBlur = () => {
    if (productUrl && !productTitle) {
      // Try extracting a friendly title fallback from the URL path if title is empty
      try {
        const urlObj = new URL(productUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        const slug = pathSegments.find(s => s.length > 5 && !s.startsWith('dp') && !s.match(/^[A-Z0-9]{10}$/i));
        if (slug) {
          const cleanName = decodeURIComponent(slug).replace(/[-_]/g, ' ');
          if (cleanName.length > 3) {
            setProductTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
          }
        }
      } catch {
        // invalid url, ignore
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic Validation
    if (!productUrl.trim()) {
      setValidationError('يرجى إدخال رابط المنتج المراد متابعته');
      return;
    }

    const numericTargetPrice = parseFloat(targetPrice);
    if (isNaN(numericTargetPrice) || numericTargetPrice <= 0) {
      setValidationError('يرجى إدخال سعر مستهدف صحيح أعلى من الصفر');
      return;
    }

    const platformConfig = SUPPORTED_PLATFORMS.find(p => p.code === selectedPlatformCode) || SUPPORTED_PLATFORMS[SUPPORTED_PLATFORMS.length - 1];
    const numericCurrentPrice = parseFloat(currentPrice) || numericTargetPrice;
    const finalTitle = productTitle.trim() || `منتج مراقب - ${platformConfig.name}`;

    const timestamp = Date.now();
    const productId = `manual_prod_${timestamp}`;

    const mockOffer: MerchantOffer = {
      id: `offer_manual_${timestamp}`,
      merchantName: platformConfig.name,
      platform: platformConfig.code,
      storeType: 'online',
      price: numericCurrentPrice,
      originalPrice: Math.round(numericCurrentPrice * 1.15),
      currency: currency,
      rating: 4.8,
      reviewCount: 34,
      deliveryTime: '1-3 أيام عمل',
      deliveryCost: 'مجاني',
      isVerified: true,
      stockStatus: 'in_stock',
      url: productUrl.trim(),
      sellerName: platformConfig.name,
      platformName: platformConfig.name
    };

    const newProductData: ProductData = {
      id: productId,
      title: finalTitle,
      brand: platformConfig.name,
      model: 'مراقبة يدوية',
      category: 'منتجات مراقبة يدوياً',
      imageUrl: platformConfig.defaultImage,
      confidenceScore: 100,
      description: `منتج مضاف يدوياً لمتابعة وتتبع تغيرات الأسعار والمخزون على منصة ${platformConfig.name}`,
      estimatedWholesaleCost: Math.round(numericTargetPrice * 0.8),
      suggestedRetailPrice: numericCurrentPrice,
      currentLowestPrice: numericCurrentPrice,
      highestPrice: Math.round(numericCurrentPrice * 1.15),
      averagePrice: numericCurrentPrice,
      targetPrice: numericTargetPrice,
      currency: currency,
      specs: [],
      merchantOffers: [mockOffer],
      tags: ['متابعة_يدوية', platformConfig.name],
      quickHighlights: [
        `السعر المستهدف للتنبيه: ${numericTargetPrice} ${currency}`,
        `المنصة: ${platformConfig.name}`,
        `رابط المنتج: ${productUrl}`
      ]
    };

    const newWatchlistItem: WatchlistItem = {
      productId: productId,
      product: newProductData,
      addedAt: new Date().toISOString(),
      lastCheckedPrice: numericCurrentPrice,
      lastPriceChangedAt: new Date().toISOString(),
      lastPriceChangeSource: platformConfig.name,
      priceTrend: numericCurrentPrice <= numericTargetPrice ? 'down' : 'stable',
      priceChangePercent: 0,
      competitorStockStatus: 'normal',
      targetAlertPrice: numericTargetPrice,
      merchantNotes: merchantNotes.trim() || undefined,
      autoTrack: autoTrack
    };

    onAdd(newWatchlistItem);
    onClose();

    // Reset Form
    setProductUrl('');
    setProductTitle('');
    setTargetPrice('');
    setCurrentPrice('');
    setSelectedPlatformCode('amazon_eg');
    setMerchantNotes('');
    setAutoTrack(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <Plus className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-['Alexandria']">
                  إضافة منتج جديد للمتابعة يدوياً
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
                  رصد مباشر
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                أدخل رابط المنتج والسعر المستهدف لتصلك تنبيهات فورية عند انخفاض سعر المنافس
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {validationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Field 1: Product Link (URL) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span>رابط المنتج على المنصة (Product URL) <span className="text-red-500">*</span></span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="مثال: https://www.amazon.eg/dp/B08X... أو https://www.noon.com/egypt-ar/..."
                className="w-full h-11 pr-3.5 pl-10 text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all text-slate-900"
                dir="ltr"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {detectedDomainLabel && (
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{detectedDomainLabel}</span>
              </p>
            )}
          </div>

          {/* Field 2: Platform Selector Pills */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>اسم المنصة (Platform Name) <span className="text-red-500">*</span></span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">اختيار يدوي أو تلقائي</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_PLATFORMS.map((platform) => {
                const isSelected = selectedPlatformCode === platform.code;
                return (
                  <button
                    key={platform.code}
                    type="button"
                    onClick={() => setSelectedPlatformCode(platform.code)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border text-right cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-base select-none">{platform.logo}</span>
                    <span className="truncate flex-1">{platform.name}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: Target Alert Price & Current Price (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Target Alert Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>السعر المستهدف للتنبيه ({currency}) <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="مثال: 1500"
                  className="w-full h-11 pr-3.5 pl-12 text-sm font-black bg-emerald-50/50 border border-emerald-300/80 rounded-2xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all text-slate-900 font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                  {currency}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">سيتم تنبيهك عند انخفاض سعر المنافس إلى هذا الحد</p>
            </div>

            {/* Current Competitor Price (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span>سعر المنافس الحالي (اختياري)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="مثال: 1850"
                  className="w-full h-11 pr-3.5 pl-12 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all text-slate-900 font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  {currency}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">السعر المعروض حالياً في المتجر</p>
            </div>

          </div>

          {/* Field 4: Optional Product Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-500" />
              <span>اسم المنتج / العنوان الرئيسي (اختياري)</span>
            </label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="مثال: سماعة أنكر لايف كيو 30 اللاسلكية عازلة للضوضاء"
              className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all text-slate-900"
            />
          </div>

          {/* Field 5: Optional Merchant Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>ملاحظات التاجر المخصصة (اختياري)</span>
            </label>
            <input
              type="text"
              value={merchantNotes}
              onChange={(e) => setMerchantNotes(e.target.value)}
              placeholder="مثال: التكلفة من مورد شارع عبد العزيز 1100 ج.م"
              className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all text-slate-900"
            />
          </div>

          {/* Field 6: Auto-Track & WhatsApp Alert Toggle */}
          <div className="bg-gradient-to-r from-indigo-50/80 to-sky-50/80 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  تفعيل التتبع وتنبيهات الواتساب الفورية
                </span>
                <span className="text-[11px] text-slate-600">
                  إرسال إشعار فوري عند تغير السعر أو انخفاض المخزون
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoTrack}
                onChange={(e) => setAutoTrack(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Submit & Cancel Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة المنتج لقائمة المتابعة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
